const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const { rateLimit } = require('express-rate-limit');
const { createRecoveryEmail } = require('../services/recoveryEmail');

const hashToken = token => crypto.createHash('sha256').update(token).digest('hex');
const emailSchema = Joi.object({ email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).max(254).required() });
const resetSchema = Joi.object({
    token: Joi.string().hex().length(64).required(),
    password: Joi.string().min(8).max(128).required(),
    confirmPassword: Joi.valid(Joi.ref('password')).required(),
});
const genericMessage = 'If an account uses that email, a password reset link will arrive shortly. Check your spam folder too.';

module.exports = function createRecoveryRouter({ usersCollection, invalidateSessions, mailer = createRecoveryEmail() }) {
    const router = express.Router();
    const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true,
        legacyHeaders: false, message: { error: 'Too many recovery attempts. Please try again in 15 minutes.' } });
    router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
    router.post('/forgot-password', limiter, async (req, res) => {
        const { error, value } = emailSchema.validate(req.body);
        if (error) return res.status(400).json({ error: 'Enter a valid email address.' });
        if (!mailer.configured) return res.status(503).json({ error: 'Email recovery is not available yet. Please contact the game administrator.' });
        // Respond before account lookup/delivery to avoid exposing account existence or mail timing.
        res.status(202).json({ ok: true, message: genericMessage });
        const token = crypto.randomBytes(32).toString('hex');
        const tokenHash = hashToken(token);
        try {
            const now = new Date();
            const emailPattern = new RegExp('^' + value.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i');
            const user = await usersCollection.findOneAndUpdate({
                email: emailPattern,
                $or: [{ 'passwordReset.requestedAt': { $lt: new Date(now.getTime() - 60000) } }, { 'passwordReset.requestedAt': { $exists: false } }],
            }, { $set: { passwordReset: { tokenHash, requestedAt: now, expiresAt: new Date(now.getTime() + 30 * 60000) } } }, { returnDocument: 'after' });
            if (!user) return;
            // Fragment keeps the secret out of HTTP access logs and Referer headers.
            const link = `${mailer.origin}/recover.html#token=${token}`;
            await mailer.send(user.email, 'Reset your Naruto-Arena password',
                `A password reset was requested for your Naruto-Arena account.\n\n${link}\n\nThis link expires in 30 minutes and can be used once. If you did not request this, ignore this email.`);
        } catch (err) {
            await usersCollection.updateOne({ 'passwordReset.tokenHash': tokenHash }, { $unset: { passwordReset: '' } }).catch(() => {});
            console.error('Password recovery delivery failed:', err.name); // Never log email, token, or provider response body.
        }
    });
    router.post('/reset-password', limiter, async (req, res) => {
        const { error, value } = resetSchema.validate(req.body);
        if (error) return res.status(400).json({ error: 'Use a valid reset link and matching passwords of 8–128 characters.' });
        try {
            const tokenHash = hashToken(value.token);
            const filter = { 'passwordReset.tokenHash': tokenHash, 'passwordReset.expiresAt': { $gt: new Date() } };
            if (!await usersCollection.findOne(filter)) return res.status(400).json({ error: 'This reset link is invalid or expired. Request a new link.' });
            const passwordHash = await bcrypt.hash(value.password, 10);
            // Atomic consume: concurrent submissions cannot reuse the same token.
            filter['passwordReset.expiresAt'] = { $gt: new Date() };
            const user = await usersCollection.findOneAndUpdate(filter, {
                $set: { passwordHash }, $unset: { passwordReset: '' }, $inc: { sessionVersion: 1 },
            }, { returnDocument: 'after' });
            if (!user) return res.status(400).json({ error: 'This reset link is invalid or expired. Request a new link.' });
            invalidateSessions(user.username);
            res.json({ ok: true, message: 'Password updated. Sign in with your new password.' });
            if (mailer.configured) await mailer.send(user.email, 'Your Naruto-Arena password was changed',
                'Your password was changed and existing sessions were signed out. If this was not you, contact the game administrator immediately.').catch(err => console.error('Recovery notification failed:', err.name));
        } catch (err) {
            console.error('Password reset failed:', err.name);
            if (!res.headersSent) res.status(500).json({ error: 'Unable to reset your password. Please try again.' });
        }
    });
    return router;
};
