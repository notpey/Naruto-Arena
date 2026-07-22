const express = require('express');
const Joi = require('joi');
const rateLimit = require('express-rate-limit');

const bugReportLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { error: 'Too many bug reports submitted. Please wait a few minutes before trying again.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const bugReportSchema = Joi.object({
    category: Joi.string().valid('battle', 'balance', 'ui', 'other').default('other'),
    title: Joi.string().trim().min(3).max(120).required().messages({
        'string.empty': 'Please enter a summary title for your bug report.',
        'string.min': 'Title must be at least 3 characters.',
        'string.max': 'Title must be under 120 characters.',
    }),
    description: Joi.string().trim().min(5).max(3000).required().messages({
        'string.empty': 'Please describe the bug or feedback in detail.',
        'string.min': 'Description must be at least 5 characters.',
        'string.max': 'Description must be under 3000 characters.',
    }),
    pageUrl: Joi.string().trim().max(500).allow('').optional(),
    clientMetadata: Joi.object({
        matchId: Joi.string().allow('').optional(),
        turnNumber: Joi.number().optional(),
        playerTeam: Joi.array().items(Joi.string()).optional(),
        opponentTeam: Joi.array().items(Joi.string()).optional(),
        battleLogs: Joi.array().items(Joi.string()).optional(),
        userAgent: Joi.string().allow('').optional(),
        viewport: Joi.object().optional(),
    }).optional().default({}),
});

async function dispatchDiscordWebhook(report) {
    const webhookUrl = process.env.DISCORD_BUG_WEBHOOK_URL;
    if (!webhookUrl) return;

    try {
        const categoryColors = {
            battle: 0xe11836,   // Crimson
            balance: 0xffae42,  // Amber
            ui: 0x2c9cdb,       // Chakra Blue
            other: 0xe8801a,    // Shinobi Ember
        };

        const embed = {
            title: `🐛 Bug Report: ${report.title}`,
            description: report.description,
            color: categoryColors[report.category] || 0xe8801a,
            fields: [
                { name: 'Category', value: report.category.toUpperCase(), inline: true },
                { name: 'Submitted By', value: report.submittedBy.username || 'Guest', inline: true },
                { name: 'Page URL', value: report.pageUrl || 'N/A', inline: false },
            ],
            timestamp: new Date().toISOString(),
            footer: { text: 'Naruto-Arena Early Access Telemetry' },
        };

        if (report.clientMetadata?.matchId) {
            embed.fields.push({ name: 'Match ID', value: String(report.clientMetadata.matchId), inline: true });
        }
        if (report.clientMetadata?.turnNumber !== undefined) {
            embed.fields.push({ name: 'Turn Number', value: String(report.clientMetadata.turnNumber), inline: true });
        }

        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] }),
        });
    } catch (err) {
        console.error('Failed to dispatch Discord bug webhook:', err.message);
    }
}

module.exports = function(context) {
    const router = express.Router();
    const { bugsCollection, optionalSession } = context;

    const sessionMiddleware = typeof optionalSession === 'function' 
        ? optionalSession 
        : (req, res, next) => next();

    router.post('/', bugReportLimiter, sessionMiddleware, async (req, res) => {
        try {
            if (!bugsCollection) {
                return res.status(503).json({ error: 'Bug reporting database collection is unavailable.' });
            }

            const { error: validationError, value } = bugReportSchema.validate(req.body || {});
            if (validationError) {
                return res.status(400).json({ error: validationError.details[0].message });
            }

            const bugDoc = {
                category: value.category,
                title: value.title,
                description: value.description,
                pageUrl: value.pageUrl || '',
                clientMetadata: value.clientMetadata || {},
                status: 'open',
                adminNotes: '',
                submittedBy: {
                    userId: req.authUser?._id ? String(req.authUser._id) : null,
                    username: req.authUser?.username || 'Guest',
                },
                ip: req.ip || req.headers['x-forwarded-for'] || '',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const result = await bugsCollection.insertOne(bugDoc);

            const createdReport = {
                id: result.insertedId ? String(result.insertedId) : null,
                ...bugDoc,
            };

            // Fire-and-forget Discord webhook if configured
            dispatchDiscordWebhook(createdReport).catch(() => {});

            return res.status(201).json({
                ok: true,
                message: 'Thank you! Your bug report has been submitted successfully.',
                reportId: createdReport.id,
            });
        } catch (err) {
            console.error('Error handling bug report submission:', err);
            return res.status(500).json({ error: 'Failed to submit bug report. Please try again later.' });
        }
    });

    return router;
};
