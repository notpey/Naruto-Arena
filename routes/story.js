const express = require('express');
const Joi = require('joi');

module.exports = function(context) {
    const router = express.Router();
    const {
        getStoredStoryCatalog,
        normalizeUserProfile,
        normalizeStoryState,
        SESSION_COOKIE_NAME,
        getSessionUserFromToken,
        requireSession,
        storyStartSchema,
        userToMatch,
        matchesCollection,
        usersCollection,
        findStoryNode,
        getPreviousStoryNode,
        resolveRosterIndicesForCharacterIds,
        teamSchema,
        assertTeamCanBeUsed,
        buildStoryBattleBotMatch,
        scheduleBattleBotTurn,
        buildMatchPayloadForUser,
        getTurnDurationMsForUser,
        makeEmptyPendingTurn,
    } = context;

    router.get('/api/story', async (req, res) => {
        try {
            const chapters = await getStoredStoryCatalog();
            let storyState = { progressByNodeId: {} };
            let unlockedCharacterIds = [];
            try {
                const token = req.cookies?.[SESSION_COOKIE_NAME];
                const authUser = token ? await getSessionUserFromToken(token) : null;
                if (authUser) {
                    const normalizedProfile = normalizeUserProfile(authUser);
                    storyState = normalizeStoryState(normalizedProfile.story);
                    unlockedCharacterIds = normalizedProfile.missions.unlockedCharacterIds || [];
                }
            } catch (sessionError) {
                console.warn('Story session lookup failed:', sessionError);
            }
            return res.json({
                ok: true,
                chapters,
                storyProgressByNodeId: storyState.progressByNodeId,
                unlockedCharacterIds,
            });
        } catch (error) {
            console.error('Story catalog load error:', error);
            return res.status(500).json({ error: 'Unable to load story catalog.' });
        }
    });

    router.post('/api/story/start', requireSession, async (req, res) => {
        try {
            const username = req.authUser.username;
            const { error: validationError, value } = storyStartSchema.validate(req.body || {});
            if (validationError) {
                return res.status(400).json({ error: 'A story battle is required.' });
            }
            const { nodeId, difficulty } = value;
            const isHardMode = difficulty === 'hard';

            if (userToMatch.has(username)) {
                return res.status(409).json({ error: 'You are already in a match.' });
            }
            const existingMatch = await matchesCollection.findOne({
                'players.username': username,
                status: { $ne: 'ended' },
            });
            if (existingMatch) {
                return res.status(409).json({ error: 'You are already in a match.' });
            }

            const user = await usersCollection.findOne({ username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            const profile = normalizeUserProfile(user);

            const storyCatalog = await getStoredStoryCatalog();
            const found = findStoryNode(storyCatalog, nodeId);
            if (!found) {
                return res.status(404).json({ error: 'Story battle not found.' });
            }
            const userLevel = Number(profile?.ladder?.level) || 1;
            if (found.node.level_requirement > 0 && userLevel < found.node.level_requirement) {
                return res.status(403).json({ error: 'You are not a high enough level for this battle yet.' });
            }
            if (found.node.requiresPreviousNode !== false) {
                const previous = getPreviousStoryNode(storyCatalog, found.node.nodeId);
                if (previous?.node?.nodeId) {
                    const storyState = normalizeStoryState(profile.story);
                    const previousProgress = storyState.progressByNodeId[previous.node.nodeId];
                    if (!previousProgress?.completedAt) {
                        return res.status(403).json({
                            error: `Clear "${previous.node.title}" before starting this battle.`,
                        });
                    }
                }
            }
            const storyState = normalizeStoryState(profile.story);
            if (isHardMode && !storyState.progressByNodeId[found.node.nodeId]?.completedAt) {
                return res.status(403).json({ error: 'Clear this story battle before starting Hard Mode.' });
            }

            const normalTeam = resolveRosterIndicesForCharacterIds(found.node.playerTeam);
            if (normalTeam.length !== found.node.playerTeam.length) {
                console.error(`Story node ${nodeId} has an invalid playerTeam entry.`);
                return res.status(500).json({ error: 'This story battle is misconfigured.' });
            }
            const hardTeam = Array.isArray(value.team) ? value.team : Array.isArray(user.savedTeamIndices) ? user.savedTeamIndices : [];
            const team = isHardMode ? hardTeam : normalTeam;
            if (isHardMode) {
                const { error: hardTeamError } = teamSchema.validate(team);
                if (hardTeamError) {
                    return res.status(400).json({ error: 'Save a full selected team before starting Hard Mode.' });
                }
                try {
                    await assertTeamCanBeUsed(profile, team, user.role);
                } catch (error) {
                    return res.status(403).json({ error: error.message || 'Your saved team contains a locked character.' });
                }
            }

            const matchDocument = await buildStoryBattleBotMatch({
                username,
                team,
                chapter: found.chapter,
                node: found.node,
                difficulty,
            });
            const opponentDisplayName = isHardMode ? `${found.node.enemyDisplayName} (Hard)` : found.node.enemyDisplayName;
            userToMatch.set(username, { matchId: matchDocument.matchId, opponent: opponentDisplayName });
            scheduleBattleBotTurn(matchDocument);
            const safePayload = buildMatchPayloadForUser(matchDocument, username);
            return res.json({
                ok: true,
                matchFound: true,
                matchId: matchDocument.matchId,
                mode: 'story',
                opponent: opponentDisplayName,
                matchStartsAt: matchDocument.matchStartsAt,
                matchReady: new Date(matchDocument.matchStartsAt).getTime() <= Date.now(),
                currentTurn: matchDocument.currentTurn || null,
                turnOrder: matchDocument.turnOrder || null,
                turnExpiresAt: matchDocument.turnExpiresAt || null,
                turnDurationMs: getTurnDurationMsForUser(matchDocument, matchDocument?.currentTurn),
                chakraPools: safePayload?.chakraPools || null,
                lastChakraGain: safePayload?.lastChakraGain || null,
                pendingTurn: safePayload?.pendingTurn || makeEmptyPendingTurn(),
            });
        } catch (error) {
            console.error('Story match start error:', error);
            return res.status(500).json({ error: 'Internal server error.' });
        }
    });

    return router;
};
