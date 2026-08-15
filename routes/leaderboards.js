const express = require('express');

module.exports = function(context) {
    const router = express.Router();
    const { buildSidebarLeaderboards } = context;

    router.get('/api/leaderboards/sidebar', async (req, res) => {
        try {
            const leaderboards = await buildSidebarLeaderboards();
            return res.json({
                ok: true,
                leaderboards,
            });
        } catch (error) {
            console.error('Sidebar leaderboard error:', error);
            return res.status(500).json({ error: 'Unable to load leaderboards.' });
        }
    });

    return router;
};
