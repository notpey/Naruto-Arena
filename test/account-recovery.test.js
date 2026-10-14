const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const createRouter = require('../routes/recovery');
const { createRecoveryEmail } = require('../services/recoveryEmail');

async function fixture(t, configured = true, failDelivery = false) {
    let user = { username: 'Naruto', email: 'ninja@example.com', passwordHash: 'old' };
    const delivered = [], invalidated = [];
    function matches(query) {
        if (query.email && !query.email.test(user.email)) return false;
        if (query.$or && user.passwordReset?.requestedAt > query.$or[0]['passwordReset.requestedAt'].$lt) return false;
        if (query['passwordReset.tokenHash'] && user.passwordReset?.tokenHash !== query['passwordReset.tokenHash']) return false;
        if (query['passwordReset.expiresAt'] && !(user.passwordReset?.expiresAt > query['passwordReset.expiresAt'].$gt)) return false;
        return true;
    }
    function update(query, change) {
        if (!matches(query)) return null;
        Object.assign(user, change.$set);
        for (const key of Object.keys(change.$unset || {})) delete user[key];
        for (const [key, value] of Object.entries(change.$inc || {})) user[key] = (user[key] || 0) + value;
        return { ...user };
    }
    const app = express(); app.use(express.json());
    app.use(createRouter({
        usersCollection: { findOne: async q => matches(q) ? { ...user } : null, findOneAndUpdate: async (q, u) => update(q, u), updateOne: async (q, u) => update(q, u) },
        invalidateSessions: name => invalidated.push(name),
        mailer: { configured, origin: 'https://game.example', async send(to, subject, text) { if (failDelivery) throw Error('offline'); delivered.push({ to, subject, text }); } },
    }));
    const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve));
    t.after(() => new Promise(resolve => { server.close(resolve); server.closeAllConnections(); }));
    async function post(route, body) {
        const response = await fetch(`http://127.0.0.1:${server.address().port}/${route}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        return { status: response.status, data: await response.json() };
    }
    return { user, delivered, invalidated, post };
}

test('recovery sends a single-use expiring hashed link; unknown email has the same response; reset revokes sessions', async t => {
    const f = await fixture(t);
    const unknown = await f.post('forgot-password', { email: 'unknown@example.com' });
    const known = await f.post('forgot-password', { email: 'NINJA@example.com' });
    assert.deepEqual(known, unknown);
    assert.equal(f.delivered.length, 1);
    const token = f.delivered[0].text.match(/#token=([a-f0-9]{64})/)[1];
    assert.equal(f.user.passwordReset.tokenHash, crypto.createHash('sha256').update(token).digest('hex'));
    assert.ok(!JSON.stringify(f.user).includes(token));
    assert.ok(f.user.passwordReset.expiresAt - Date.now() <= 30 * 60000);
    await f.post('forgot-password', { email: f.user.email });
    assert.equal(f.delivered.length, 1, 'per-account cooldown prevents email flooding');
    const payload = { token, password: 'New-password-123', confirmPassword: 'New-password-123' };
    const results = await Promise.all([f.post('reset-password', payload), f.post('reset-password', payload)]);
    assert.deepEqual(results.map(r => r.status).sort(), [200, 400]);
    assert.ok(await bcrypt.compare(payload.password, f.user.passwordHash));
    assert.equal(f.user.passwordReset, undefined);
    assert.equal(f.user.sessionVersion, 1);
    assert.deepEqual(f.invalidated, ['Naruto']);
});

test('recovery rejects malformed, expired, mismatched and missing tokens without changing password', async t => {
    const f = await fixture(t);
    await f.post('forgot-password', { email: f.user.email });
    const token = f.delivered[0].text.match(/#token=([a-f0-9]{64})/)[1];
    const payload = { token, password: 'Long-password-123', confirmPassword: 'Long-password-123' };
    assert.equal((await f.post('reset-password', { ...payload, confirmPassword: 'different' })).status, 400);
    assert.equal((await f.post('reset-password', { ...payload, token: 'x' })).status, 400);
    assert.equal((await f.post('forgot-password', { email: { $ne: null } })).status, 400);
    f.user.passwordReset.expiresAt = new Date(0);
    assert.equal((await f.post('reset-password', payload)).status, 400);
    assert.equal(f.user.passwordHash, 'old');
    assert.deepEqual(f.invalidated, []);
});

test('unconfigured recovery is honest; failed delivery removes unusable token', async t => {
    const disabled = await fixture(t, false);
    assert.equal((await disabled.post('forgot-password', { email: disabled.user.email })).status, 503);
    assert.equal(disabled.user.passwordReset, undefined);
    const failure = await fixture(t, true, true);
    assert.equal((await failure.post('forgot-password', { email: failure.user.email })).status, 202);
    assert.equal(failure.user.passwordReset, undefined);
});

test('email adapter requires a configured HTTPS origin and surfaces provider rejection without exposing credentials', async () => {
    assert.equal(createRecoveryEmail({}).configured, false);
    assert.equal(createRecoveryEmail({ PUBLIC_APP_URL: 'http://untrusted', RESEND_API_KEY: 'test', RECOVERY_EMAIL_FROM: 'sender@example.com' }).configured, false);
    let sent;
    const mailer = createRecoveryEmail({ PUBLIC_APP_URL: 'https://game.example', RESEND_API_KEY: 'test', RECOVERY_EMAIL_FROM: 'sender@example.com' }, async (url, options) => { sent = { url, options }; return { ok: false, status: 503 }; });
    await assert.rejects(mailer.send('ninja@example.com', 'Reset', 'link'), /503/);
    assert.equal(sent.url, 'https://api.resend.com/emails');
    assert.equal(JSON.parse(sent.options.body).to[0], 'ninja@example.com');
});

test('recovery throttles repeated attempts by IP', async t => {
    const f = await fixture(t);
    for (let i = 0; i < 10; i++) assert.equal((await f.post('forgot-password', { email: 'unknown@example.com' })).status, 202);
    assert.equal((await f.post('forgot-password', { email: 'unknown@example.com' })).status, 429);
});
