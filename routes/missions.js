const express = require('express');

module.exports = function(context) {
    const router = express.Router();
    const {
        getStoredMissionCatalog,
        createDefaultMissionState,
        normalizeUserProfile,
        normalizeMissionState,
        SESSION_COOKIE_NAME,
        getSessionUserFromToken,
    } = context;

    router.get('/api/missions', async (req, res) => {
        try {
            const missions = await getStoredMissionCatalog();
            let missionState = createDefaultMissionState();
            try {
                const token = req.cookies?.[SESSION_COOKIE_NAME];
                const authUser = token ? await getSessionUserFromToken(token) : null;
                if (authUser) {
                    const normalizedProfile = normalizeUserProfile(authUser);
                    missionState = normalizeMissionState(normalizedProfile.missions);
                }
            } catch (sessionError) {
                console.warn('Mission session lookup failed:', sessionError);
            }
            return res.json({
                ok: true,
                missions,
                missionProgressByMissionId: missionState.progressByMissionId,
                unlockedCharacterIds: missionState.unlockedCharacterIds,
            });
        } catch (error) {
            console.error('Mission catalog load error:', error);
            return res.status(500).json({ error: 'Unable to load missions.' });
        }
    });

    return router;
};
