const express = require('express');
const { ObjectId } = require('mongodb');

module.exports = function(context) {
    const router = express.Router();
    
    // We bind all required context variables to local scope
    const {
        requireSession,
        appStateCollection,
        usersCollection,
        bugsCollection,
        newsCollection,
        charactersData,
        saveCharacters,
        serializeCharactersDataFile,
        ladderRulesCollection,
        charactersCollection,
        recalculatePlayerLadderStandings,
        latestReleasesUpdateSchema,
        maintenanceModeUpdateSchema,
        newsPostSchema,
        userUpdateSchema,
        battleGauntletService,
        matchesCollection,
        teamSchema,
        userToMatch,
        normalizeUserProfile,
        assertTeamCanBeUsed,
        removeQueuedEntry,
        buildTrainingDummyMatch,
        buildMatchPayloadForUser,
        getTurnDurationMsForUser,
        makeEmptyPendingTurn,
        TRAINING_DUMMY_DISPLAY_NAME,
        insertMatchActive
    } = context;
    
    const LADDER_WIN_RYO = 50;
    const LADDER_LOSS_RYO = 15;
    const QUICK_WIN_RYO = 25;
    const QUICK_LOSS_RYO = 8;

    const DEFAULT_LADDER_RANK_TIERS = [
        { minLevel: 1, maxLevel: 5, rank: 'Academy Student', rankHatUrl: 'hats/academy.png' },
        { minLevel: 6, maxLevel: 10, rank: 'Genin', rankHatUrl: 'hats/genin.png' },
        { minLevel: 11, maxLevel: 15, rank: 'Chuunin', rankHatUrl: 'hats/chunin.png' },
        { minLevel: 16, maxLevel: 20, rank: 'Jounin', rankHatUrl: 'hats/jounin.png' },
        { minLevel: 21, maxLevel: 25, rank: 'ANBU', rankHatUrl: 'hats/anbu.png' },
        { minLevel: 26, maxLevel: 30, rank: 'Missing-nin', rankHatUrl: 'hats/missingnin.png' },
        { minLevel: 31, maxLevel: 35, rank: 'Akatsuki', rankHatUrl: 'hats/akatsuki.png' },
        { minLevel: 36, maxLevel: 40, rank: 'Sannin', rankHatUrl: 'hats/sannin.png' },
        { minLevel: 41, maxLevel: 45, rank: 'Jinchurikki', rankHatUrl: 'hats/jinch.png' },
        { minLevel: 46, maxLevel: 50, rank: "Susano'o", rankHatUrl: 'hats/jinch.png' },
        { minLevel: 51, maxLevel: 55, rank: 'Shadow Hokage', rankHatUrl: 'hats/hokage.png' },
        { minLevel: 56, maxLevel: 60, rank: 'Kage', rankHatUrl: 'hats/kage.png' },
        { minLevel: 61, maxLevel: 65, rank: 'Edo Tensei', rankHatUrl: 'hats/akatsuki.png' },
        { minLevel: 66, maxLevel: 70, rank: 'Otsutsuki', rankHatUrl: 'hats/sannin.png' },
        { minLevel: 71, maxLevel: 75, rank: 'Sage of Six Paths', rankHatUrl: 'hats/hokage.png' },
        { minLevel: 76, maxLevel: 80, rank: '#1 Shinobi', rankHatUrl: 'hats/hokage.png' }
    ];

    const DEFAULT_LADDER_RULES = {
        maxLevel: 80,
        maxExperiencePoints: 120000,
        hokageRequirement: { minLevel: 76 },
        levels: Array.from({ length: 80 }, (_, i) => ({
            level: i + 1,
            cumulativeExperience: Math.round(Math.pow((i + 1) / 80, 1.38) * 120000)
        })),
        rankTiers: DEFAULT_LADDER_RANK_TIERS
    };

    function buildLadderRulesForAdmin(customTiers) {
        if (Array.isArray(customTiers) && customTiers.length > 0) {
            return { ...DEFAULT_LADDER_RULES, rankTiers: customTiers };
        }
        return DEFAULT_LADDER_RULES;
    }

    async function saveLadderRankTiers(rankTiers, updatedBy) {
        if (ladderRulesCollection) {
            await ladderRulesCollection.updateOne(
                { key: 'ladder_rules' },
                { $set: { key: 'ladder_rules', rankTiers, updatedBy, updatedAt: new Date() } },
                { upsert: true }
            );
        }
    }

    async function resetLadderRankTiers() {
        if (ladderRulesCollection) {
            await ladderRulesCollection.deleteOne({ key: 'ladder_rules' });
        }
    }

    async function getStoredMissionCatalog() {
        if (!appStateCollection) return [];
        try {
            const doc = await appStateCollection.findOne({ key: 'missions' });
            return (doc && Array.isArray(doc.missions)) ? doc.missions : [];
        } catch (e) {
            return [];
        }
    }

    async function getStoredStoryCatalog() {
        if (!appStateCollection) return [];
        try {
            const doc = await appStateCollection.findOne({ key: 'story' });
            return (doc && Array.isArray(doc.chapters)) ? doc.chapters : [];
        } catch (e) {
            return [];
        }
    }

    async function getMaintenanceModeState() {
        if (!appStateCollection) return false;
        try {
            const doc = await appStateCollection.findOne({ key: 'maintenance' });
            return Boolean(doc && doc.enabled);
        } catch (e) {
            return false;
        }
    }

    async function getLatestCharacterReleases() {
        if (!appStateCollection) return [];
        try {
            const doc = await appStateCollection.findOne({ key: 'latest_releases' });
            return (doc && Array.isArray(doc.releases)) ? doc.releases : [];
        } catch (e) {
            return [];
        }
    }

    function normalizeLatestCharacterReleases(releases) {
        if (!Array.isArray(releases)) return [];
        return releases.filter(r => r && typeof r.characterId === 'string');
    }

    const adminCheck = (req, res, next) => {
        const role = String(req.authUser?.role || '').trim().toLowerCase();
        const username = String(req.authUser?.username || '').trim().toLowerCase();
        if (role !== 'admin' && username !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
        next();
    };
    
    router.use(requireSession);

    router.post('/training-dummy/start', requireSession, async (req, res) => {
        try {
            const username = req.authUser.username;
            if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
                return res.status(403).json({ error: 'Admin access required.' });
            }
            const { error: validationError, value } = teamSchema.validate(req.body?.team);
            if (validationError) {
                return res.status(400).json({ error: 'A valid three-character team is required.' });
            }

            if (userToMatch && userToMatch.has(username)) {
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
            if (String(user.role || '').trim().toLowerCase() !== 'admin') {
                return res.status(403).json({ error: 'Admin access required.' });
            }
            const profile = normalizeUserProfile(user);
            try {
                await assertTeamCanBeUsed(profile, value, user.role);
            } catch (error) {
                return res.status(403).json({ error: error.message || 'Character is locked.' });
            }

            if (typeof removeQueuedEntry === 'function') removeQueuedEntry(username);
            const matchDocument = await buildTrainingDummyMatch({
                username,
                team: value,
            });
            const safePayload = buildMatchPayloadForUser(matchDocument, username);
            return res.json({
                ok: true,
                matchFound: true,
                matchId: matchDocument.matchId,
                mode: 'training',
                opponent: TRAINING_DUMMY_DISPLAY_NAME,
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
            console.error('Training dummy start error:', error);
            return res.status(500).json({ error: 'Internal server error.' });
        }
    });


    router.use(adminCheck);
    router.get('/latest-releases', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
        const releases = await getLatestCharacterReleases();
        return res.json({
            ok: true,
            releases,
        });
    });
    router.put('/latest-releases', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
        const { error: validationError, value } = latestReleasesUpdateSchema.validate(req.body || {});
        if (validationError) {
            return res.status(400).json({ error: 'Invalid latest releases payload.' });
        }
        const normalizedReleases = normalizeLatestCharacterReleases(value.releases);
        await appStateCollection.updateOne(
            { key: LATEST_CHARACTER_RELEASES_STATE_KEY },
            {
                $set: {
                    key: LATEST_CHARACTER_RELEASES_STATE_KEY,
                    releases: normalizedReleases.map((entry) => ({
                        characterId: entry.characterId,
                    })),
                    updatedAt: new Date(),
                },
            },
            { upsert: true }
        );
        return res.json({
            ok: true,
            releases: normalizedReleases,
        });
    });
    router.get('/maintenance', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
        return res.json({
            ok: true,
            enabled: await getMaintenanceModeState(),
        });
    });
    router.put('/maintenance', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
        const { error: validationError, value } = maintenanceModeUpdateSchema.validate(req.body || {});
        if (validationError) {
            return res.status(400).json({ error: 'Invalid maintenance payload.' });
        }
        await appStateCollection.updateOne(
            { key: MAINTENANCE_MODE_STATE_KEY },
            {
                $set: {
                    key: MAINTENANCE_MODE_STATE_KEY,
                    enabled: Boolean(value.enabled),
                    updatedAt: new Date(),
                },
            },
            { upsert: true }
        );
        return res.json({
            ok: true,
            enabled: Boolean(value.enabled),
        });
    });

    router.get('/winrates', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        try {
            const winratesState = await appStateCollection.findOne({ key: 'winrates' });
            const resetAt =
                winratesState && winratesState.resetAt
                    ? new Date(winratesState.resetAt)
                    : null;
            const characters = charactersData.map((character = {}, index) => ({
                characterIndex: index,
                characterId: typeof character.characterId === 'string' ? character.characterId : '',
                name: typeof character.name === 'string' ? character.name : `Character ${index + 1}`,
                facePicture: typeof character.facePicture === 'string' ? character.facePicture : '',
                totalGamesWon: 0,
                totalMatchesPlayed: 0,
            }));
    
            const ladderMatches = await matchesCollection.find(
                {
                    mode: 'ladder',
                    status: 'ended',
                    players: { $exists: true, $ne: [] },
                    ...(resetAt && !Number.isNaN(resetAt.getTime())
                        ? {
                            endedAt: { $gte: resetAt },
                        }
                        : {}),
                },
                {
                    projection: {
                        winner: 1,
                        players: 1,
                    },
                }
            ).toArray();
    
            ladderMatches.forEach((match = {}) => {
                const winnerUsername = typeof match.winner === 'string' ? match.winner.trim() : '';
                const players = Array.isArray(match.players) ? match.players : [];
    
                players.forEach((player = {}) => {
                    const team = Array.isArray(player.team) ? player.team : [];
                    const didWin =
                        winnerUsername &&
                        typeof player.username === 'string' &&
                        player.username.trim() === winnerUsername;
    
                    team.forEach((characterIndex) => {
                        const index = Number(characterIndex);
                        if (!Number.isInteger(index) || !characters[index]) {
                            return;
                        }
                        characters[index].totalMatchesPlayed += 1;
                        if (didWin) {
                            characters[index].totalGamesWon += 1;
                        }
                    });
                });
            });
    
            return res.json({
                ok: true,
                characters,
            });
        } catch (error) {
            console.error('Admin winrates load error:', error);
            return res.status(500).json({ error: 'Unable to load winrates.' });
        }
    });
    router.post('/winrates/reset', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        try {
            const resetAt = new Date();
            await appStateCollection.updateOne(
                { key: 'winrates' },
                {
                    $set: {
                        key: 'winrates',
                        resetAt,
                        updatedBy: req.authUser.username,
                    },
                },
                { upsert: true }
            );
    
            return res.json({
                ok: true,
                resetAt,
            });
        } catch (error) {
            console.error('Admin winrates reset error:', error);
            return res.status(500).json({ error: 'Unable to reset winrates.' });
        }
    });
    router.get('/missions', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        try {
            const missions = await getStoredMissionCatalog();
            return res.json({
                ok: true,
                missions,
            });
        } catch (error) {
            console.error('Admin mission catalog load error:', error);
            return res.status(500).json({ error: 'Unable to load missions.' });
        }
    });
    router.get('/story', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        try {
            const chapters = await getStoredStoryCatalog();
            return res.json({
                ok: true,
                chapters,
            });
        } catch (error) {
            console.error('Admin story catalog load error:', error);
            return res.status(500).json({ error: 'Unable to load story mode.' });
        }
    });
    router.get('/control-panel', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        try {
            const [missionCatalog, totalUsers, adminUsers] = await Promise.all([
                getStoredMissionCatalog(),
                usersCollection.countDocuments({}),
                usersCollection.countDocuments({ role: 'admin' }),
            ]);
            const maintenanceState = await getMaintenanceModeState().catch(() => false);
            return res.json({
                ok: true,
                counts: {
                    characters: Array.isArray(charactersData) ? charactersData.length : 0,
                    missions: Array.isArray(missionCatalog) ? missionCatalog.length : 0,
                    players: totalUsers,
                    admins: adminUsers,
                },
                economy: {
                    ladderWinRyo: LADDER_WIN_RYO,
                    ladderLossRyo: LADDER_LOSS_RYO,
                    quickWinRyo: QUICK_WIN_RYO,
                    quickLossRyo: QUICK_LOSS_RYO,
                },
                maintenance: {
                    enabled: Boolean(maintenanceState),
                },
                ladderRules: buildLadderRulesForAdmin(),
                tools: [
                    {
                        href: 'charactereditor.html',
                        title: 'Character Editor',
                        description: 'Create, update, delete, and export playable character records.',
                        status: 'Live editor',
                    },
                    {
                        href: 'editmission.html',
                        title: 'Mission Editor',
                        description: 'Manage unlock missions, rank requirements, goals, and rewards.',
                        status: 'Live editor',
                    },
                    {
                        href: '#acp-story-panel',
                        title: 'Story Thumbnails',
                        description: 'Update story mode battle thumbnails and image alt text.',
                        status: 'Inline editor',
                    },
                    {
                        href: 'playeraccounts.html',
                        title: 'Player Accounts',
                        description: 'Edit account documents, player EXP, roles, missions, and ladder stats.',
                        status: 'Live editor',
                    },
                    {
                        href: 'winrates.html',
                        title: 'Winrates',
                        description: 'Audit character performance and reset the winrate sample.',
                        status: 'Live report',
                    },
                    {
                        href: 'newspost.html',
                        title: 'News Post',
                        description: 'Publish and manage front-page updates.',
                        status: 'Live editor',
                    },
                ],
            });
        } catch (error) {
            console.error('Admin control panel load error:', error);
            return res.status(500).json({ error: 'Unable to load admin control panel.' });
        }
    });
    router.get('/ladder-rules', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        return res.json({
            ok: true,
            ladderRules: buildLadderRulesForAdmin(),
        });
    });
    router.put('/ladder-rules', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        try {
            await saveLadderRankTiers(req.body?.rankTiers, req.authUser.username);
            return res.json({
                ok: true,
                ladderRules: buildLadderRulesForAdmin(),
            });
        } catch (error) {
            console.error('Admin ladder rule save error:', error);
            return res.status(400).json({ error: error.message || 'Unable to save ladder rules.' });
        }
    });
    router.delete('/ladder-rules', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        try {
            await resetLadderRankTiers();
            return res.json({
                ok: true,
                ladderRules: buildLadderRulesForAdmin(),
            });
        } catch (error) {
            console.error('Admin ladder rule reset error:', error);
            return res.status(500).json({ error: 'Unable to reset ladder rules.' });
        }
    });
    router.put('/missions', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        const missions = Array.isArray(req.body?.missions) ? req.body.missions : null;
        if (!missions) {
            return res.status(400).json({ error: 'Missions are required.' });
        }
    
        try {
            const savedMissions = await saveMissionCatalog(missions, req.authUser.username);
            return res.json({
                ok: true,
                missions: savedMissions,
            });
        } catch (error) {
            console.error('Admin mission catalog save error:', error);
            return res.status(400).json({ error: error.message || 'Unable to save missions.' });
        }
    });
    router.put('/story', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        const chapters = Array.isArray(req.body?.chapters) ? req.body.chapters : null;
        if (!chapters) {
            return res.status(400).json({ error: 'Story chapters are required.' });
        }
    
        try {
            const savedChapters = await saveStoryCatalog(chapters, req.authUser.username);
            return res.json({
                ok: true,
                chapters: savedChapters,
            });
        } catch (error) {
            console.error('Admin story catalog save error:', error);
            return res.status(400).json({ error: error.message || 'Unable to save story mode.' });
        }
    });
    router.get('/characters', requireSession, (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        return res.json({
            ok: true,
            characters: Array.isArray(charactersData) ? charactersData : [],
        });
    });
    router.get('/characters/export', requireSession, (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        const serialized = serializeCharactersDataFile(Array.isArray(charactersData) ? charactersData : []);
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="characters.js"');
        return res.send(serialized);
    });
    router.get('/characters/:characterId', requireSession, (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        const characterId = typeof req.params?.characterId === 'string' ? req.params.characterId.trim() : '';
        const character = (Array.isArray(charactersData) ? charactersData : []).find(
            (entry) => typeof entry?.characterId === 'string' && entry.characterId === characterId
        );
        if (!character) {
            return res.status(404).json({ error: 'Character not found.' });
        }
    
        return res.json({
            ok: true,
            character,
        });
    });
    router.put('/characters/:characterId', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        const characterId = typeof req.params?.characterId === 'string' ? req.params.characterId.trim() : '';
        const nextCharacter = req.body && typeof req.body === 'object' ? req.body : null;
        if (!characterId || !nextCharacter || typeof nextCharacter.characterId !== 'string' || !nextCharacter.characterId.trim()) {
            return res.status(400).json({ error: 'A valid character payload is required.' });
        }
    
        const currentCharacters = Array.isArray(charactersData) ? charactersData : [];
        const characterIndex = currentCharacters.findIndex(
            (entry) => typeof entry?.characterId === 'string' && entry.characterId === characterId
        );
        if (characterIndex === -1) {
            return res.status(404).json({ error: 'Character not found.' });
        }
    
        const duplicateCharacterIndex = currentCharacters.findIndex(
            (entry, index) =>
                index !== characterIndex &&
                typeof entry?.characterId === 'string' &&
                entry.characterId === nextCharacter.characterId.trim()
        );
        if (duplicateCharacterIndex !== -1) {
            return res.status(409).json({ error: 'Character id is already in use.' });
        }
    
        try {
            const updatedCharacters = currentCharacters.slice();
            updatedCharacters[characterIndex] = nextCharacter;
            await saveCharacters(updatedCharacters);
            return res.json({
                ok: true,
                character: updatedCharacters[characterIndex],
            });
        } catch (error) {
            console.error('Admin character update error:', error);
            return res.status(500).json({ error: 'Unable to update character.' });
        }
    });
    router.post('/characters', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
        const newCharacter = req.body && typeof req.body === 'object' ? req.body : null;
        if (!newCharacter || typeof newCharacter.characterId !== 'string' || !newCharacter.characterId.trim()) {
            return res.status(400).json({ error: 'A valid character payload with a characterId is required.' });
        }
        const currentCharacters = Array.isArray(charactersData) ? charactersData : [];
        const duplicate = currentCharacters.find(
            (entry) => typeof entry?.characterId === 'string' && entry.characterId === newCharacter.characterId.trim()
        );
        if (duplicate) {
            return res.status(409).json({ error: 'Character id is already in use.' });
        }
        try {
            const updatedCharacters = [...currentCharacters, newCharacter];
            await saveCharacters(updatedCharacters);
            return res.status(201).json({ ok: true, character: newCharacter });
        } catch (error) {
            console.error('Admin character create error:', error);
            return res.status(500).json({ error: 'Unable to create character.' });
        }
    });
    router.delete('/characters/:characterId', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
        const characterId = typeof req.params?.characterId === 'string' ? req.params.characterId.trim() : '';
        if (!characterId) {
            return res.status(400).json({ error: 'A character id is required.' });
        }
        const currentCharacters = Array.isArray(charactersData) ? charactersData : [];
        const characterIndex = currentCharacters.findIndex(
            (entry) => typeof entry?.characterId === 'string' && entry.characterId === characterId
        );
        if (characterIndex === -1) {
            return res.status(404).json({ error: 'Character not found.' });
        }
        try {
            const updatedCharacters = currentCharacters.filter((_, i) => i !== characterIndex);
            await saveCharacters(updatedCharacters);
            return res.json({ ok: true });
        } catch (error) {
            console.error('Admin character delete error:', error);
            return res.status(500).json({ error: 'Unable to delete character.' });
        }
    });
    router.get('/news', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        try {
            const posts = await newsPostsCollection
                .find({}, { sort: { createdAt: -1 } })
                .toArray();
            return res.json({
                ok: true,
                posts: posts.map(serializeNewsPost),
            });
        } catch (error) {
            console.error('Admin news load error:', error);
            return res.status(500).json({ error: 'Unable to load news posts.' });
        }
    });
    router.post('/news', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
        const blocks = normalizeNewsBlocks(req.body?.blocks);
        const paragraphs = normalizeNewsParagraphs(req.body?.paragraphs);
        const changes = normalizeNewsChanges(req.body?.changes);
        if (!title) {
            return res.status(400).json({ error: 'Title is required.' });
        }
    
        try {
            const now = new Date();
            const post = {
                title,
                blocks,
                paragraphs,
                changes,
                author: req.authUser.username,
                createdAt: now,
                updatedAt: now,
            };
            const result = await newsPostsCollection.insertOne(post);
            return res.status(201).json({
                ok: true,
                post: serializeNewsPost({ ...post, _id: result.insertedId }),
            });
        } catch (error) {
            console.error('Admin news create error:', error);
            return res.status(500).json({ error: 'Unable to create news post.' });
        }
    });
    router.put('/news/:id', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        const id = typeof req.params?.id === 'string' ? req.params.id.trim() : '';
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid news post id.' });
        }
    
        const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
        const blocks = normalizeNewsBlocks(req.body?.blocks);
        const paragraphs = normalizeNewsParagraphs(req.body?.paragraphs);
        const changes = normalizeNewsChanges(req.body?.changes);
        if (!title) {
            return res.status(400).json({ error: 'Title is required.' });
        }
    
        try {
            const existing = await newsPostsCollection.findOne({ _id: new ObjectId(id) });
            if (!existing) {
                return res.status(404).json({ error: 'News post not found.' });
            }
            const nextPost = {
                title,
                blocks,
                paragraphs,
                changes,
                author: existing.author || req.authUser.username,
                createdAt: existing.createdAt || new Date(),
                updatedAt: new Date(),
            };
            await newsPostsCollection.updateOne(
                { _id: existing._id },
                {
                    $set: nextPost,
                }
            );
            return res.json({
                ok: true,
                post: serializeNewsPost({ ...existing, ...nextPost }),
            });
        } catch (error) {
            console.error('Admin news update error:', error);
            return res.status(500).json({ error: 'Unable to update news post.' });
        }
    });
    router.delete('/news/:id', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        const id = typeof req.params?.id === 'string' ? req.params.id.trim() : '';
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid news post id.' });
        }
    
        try {
            const result = await newsPostsCollection.deleteOne({ _id: new ObjectId(id) });
            if (!result.deletedCount) {
                return res.status(404).json({ error: 'News post not found.' });
            }
            return res.json({ ok: true });
        } catch (error) {
            console.error('Admin news delete error:', error);
            return res.status(500).json({ error: 'Unable to delete news post.' });
        }
    });
    router.get('/users', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        try {
            const users = await usersCollection
                .find(
                    {},
                    {
                        projection: {
                            _id: 0,
                            username: 1,
                            role: 1,
                            profile: 1,
                        },
                        sort: { username: 1 },
                    }
                )
                .toArray();
    
            return res.json({
                ok: true,
                users: users.map((user = {}) => {
                    const profile = normalizeUserProfile(user);
                    const wins = Number(profile?.ladder?.wins) || 0;
                    const losses = Number(profile?.ladder?.losses) || 0;
                    const total = wins + losses;
                    return {
                        username: typeof user.username === 'string' ? user.username : '',
                        role: typeof user.role === 'string' ? user.role : 'player',
                        ladderRatio: total > 0 ? ((wins / total) * 100).toFixed(2) + '%' : '0.00%',
                    };
                }),
            });
        } catch (error) {
            console.error('Admin users list error:', error);
            return res.status(500).json({ error: 'Unable to load player accounts.' });
        }
    });
    router.get('/users/:username', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        const username = typeof req.params?.username === 'string' ? req.params.username.trim() : '';
        if (!username) {
            return res.status(400).json({ error: 'Username is required.' });
        }
    
        try {
            const user = await usersCollection.findOne({ username });
            if (!user) {
                return res.status(404).json({ error: 'Player not found.' });
            }
    
            const profile = normalizeUserProfile(user);
            const wins = Number(profile?.ladder?.wins) || 0;
            const losses = Number(profile?.ladder?.losses) || 0;
            const total = wins + losses;
    
            return res.json({
                ok: true,
                username: user.username,
                role: user.role || 'player',
                ladderRatio: total > 0 ? ((wins / total) * 100).toFixed(2) + '%' : '0.00%',
                document: serializeAdminUserDocument(user),
            });
        } catch (error) {
            console.error('Admin user detail error:', error);
            return res.status(500).json({ error: 'Unable to load player account.' });
        }
    });
    router.put('/users/:username', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        const originalUsername = typeof req.params?.username === 'string' ? req.params.username.trim() : '';
        const document = req.body && typeof req.body === 'object' ? req.body : null;
        if (!originalUsername || !document) {
            return res.status(400).json({ error: 'A username and document payload are required.' });
        }
    
        const nextUsername = typeof document.username === 'string' ? document.username.trim() : '';
        if (!nextUsername) {
            return res.status(400).json({ error: 'Username is required.' });
        }
    
        try {
            const existingUser = await usersCollection.findOne({ username: originalUsername });
            if (!existingUser) {
                return res.status(404).json({ error: 'Player not found.' });
            }
    
            if (nextUsername !== originalUsername) {
                const conflictingUser = await usersCollection.findOne({ username: nextUsername });
                if (conflictingUser) {
                    return res.status(409).json({ error: 'Username is already taken.' });
                }
            }
    
            const nextEmail = typeof document.email === 'string' ? document.email.trim().toLowerCase() : '';
            if (nextEmail) {
                const conflictingEmailUser = await usersCollection.findOne({
                    email: nextEmail,
                    username: { $ne: originalUsername },
                });
                if (conflictingEmailUser) {
                    return res.status(409).json({ error: 'Email is already in use.' });
                }
            }
    
            const nextUser = {
                username: nextUsername,
                usernameLower: nextUsername.toLowerCase(),
                email: nextEmail,
                passwordHash:
                    typeof document.passwordHash === 'string' && document.passwordHash.trim()
                        ? document.passwordHash.trim()
                        : existingUser.passwordHash,
                role:
                    typeof document.role === 'string' && document.role.trim()
                        ? document.role.trim().toLowerCase()
                        : existingUser.role || 'player',
                createdAt: document.createdAt || existingUser.createdAt,
                savedTeamIndices: Array.isArray(document.savedTeamIndices) ? document.savedTeamIndices : [],
                profile: normalizeUserProfile({
                    ...existingUser,
                    profile: document.profile || existingUser.profile,
                    createdAt: document.createdAt || existingUser.createdAt,
                }),
            };
    
            await usersCollection.updateOne(
                { _id: existingUser._id },
                {
                    $set: nextUser,
                }
            );
    
            const updatedUser = await usersCollection.findOne({ _id: existingUser._id });
            return res.json({
                ok: true,
                user: serializeAdminUserDocument(updatedUser || { ...existingUser, ...nextUser }),
            });
const existing = await newsPostsCollection.findOne({ _id: new ObjectId(id) });
            if (!existing) {
                return res.status(404).json({ error: 'News post not found.' });
            }
            const nextPost = {
                title,
                blocks,
                paragraphs,
                changes,
                author: existing.author || req.authUser.username,
                createdAt: existing.createdAt || new Date(),
                updatedAt: new Date(),
            };
            await newsPostsCollection.updateOne(
                { _id: existing._id },
                {
                    $set: nextPost,
                }
            );
            return res.json({
                ok: true,
                post: serializeNewsPost({ ...existing, ...nextPost }),
            });
        } catch (error) {
            console.error('Admin news update error:', error);
            return res.status(500).json({ error: 'Unable to update news post.' });
        }
    });
    router.delete('/news/:id', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        const id = typeof req.params?.id === 'string' ? req.params.id.trim() : '';
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid news post id.' });
        }
    
        try {
            const result = await newsPostsCollection.deleteOne({ _id: new ObjectId(id) });
            if (!result.deletedCount) {
                return res.status(404).json({ error: 'News post not found.' });
            }
            return res.json({ ok: true });
        } catch (error) {
            console.error('Admin news delete error:', error);
            return res.status(500).json({ error: 'Unable to delete news post.' });
        }
    });
    router.get('/users', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        try {
            const users = await usersCollection
                .find(
                    {},
                    {
                        projection: {
                            _id: 0,
                            username: 1,
                            role: 1,
                            profile: 1,
                        },
                        sort: { username: 1 },
                    }
                )
                .toArray();
    
            return res.json({
                ok: true,
                users: users.map((user = {}) => {
                    const profile = normalizeUserProfile(user);
                    const wins = Number(profile?.ladder?.wins) || 0;
                    const losses = Number(profile?.ladder?.losses) || 0;
                    const total = wins + losses;
                    return {
                        username: typeof user.username === 'string' ? user.username : '',
                        role: typeof user.role === 'string' ? user.role : 'player',
                        ladderRatio: total > 0 ? ((wins / total) * 100).toFixed(2) + '%' : '0.00%',
                    };
                }),
            });
        } catch (error) {
            console.error('Admin users list error:', error);
            return res.status(500).json({ error: 'Unable to load player accounts.' });
        }
    });
    router.get('/users/:username', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        const username = typeof req.params?.username === 'string' ? req.params.username.trim() : '';
        if (!username) {
            return res.status(400).json({ error: 'Username is required.' });
        }
    
        try {
            const user = await usersCollection.findOne({ username });
            if (!user) {
                return res.status(404).json({ error: 'Player not found.' });
            }
    
            const profile = normalizeUserProfile(user);
            const wins = Number(profile?.ladder?.wins) || 0;
            const losses = Number(profile?.ladder?.losses) || 0;
            const total = wins + losses;
    
            return res.json({
                ok: true,
                username: user.username,
                role: user.role || 'player',
                ladderRatio: total > 0 ? ((wins / total) * 100).toFixed(2) + '%' : '0.00%',
                document: serializeAdminUserDocument(user),
            });
        } catch (error) {
            console.error('Admin user detail error:', error);
            return res.status(500).json({ error: 'Unable to load player account.' });
        }
    });
    router.put('/users/:username', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        const originalUsername = typeof req.params?.username === 'string' ? req.params.username.trim() : '';
        const document = req.body && typeof req.body === 'object' ? req.body : null;
        if (!originalUsername || !document) {
            return res.status(400).json({ error: 'A username and document payload are required.' });
        }
    
        const nextUsername = typeof document.username === 'string' ? document.username.trim() : '';
        if (!nextUsername) {
            return res.status(400).json({ error: 'Username is required.' });
        }
    
        try {
            const existingUser = await usersCollection.findOne({ username: originalUsername });
            if (!existingUser) {
                return res.status(404).json({ error: 'Player not found.' });
            }
    
            if (nextUsername !== originalUsername) {
                const conflictingUser = await usersCollection.findOne({ username: nextUsername });
                if (conflictingUser) {
                    return res.status(409).json({ error: 'Username is already taken.' });
                }
            }
    
            const nextEmail = typeof document.email === 'string' ? document.email.trim().toLowerCase() : '';
            if (nextEmail) {
                const conflictingEmailUser = await usersCollection.findOne({
                    email: nextEmail,
                    username: { $ne: originalUsername },
                });
                if (conflictingEmailUser) {
                    return res.status(409).json({ error: 'Email is already in use.' });
                }
            }
    
            const nextUser = {
                username: nextUsername,
                usernameLower: nextUsername.toLowerCase(),
                email: nextEmail,
                passwordHash:
                    typeof document.passwordHash === 'string' && document.passwordHash.trim()
                        ? document.passwordHash.trim()
                        : existingUser.passwordHash,
                role:
                    typeof document.role === 'string' && document.role.trim()
                        ? document.role.trim().toLowerCase()
                        : existingUser.role || 'player',
                createdAt: document.createdAt || existingUser.createdAt,
                savedTeamIndices: Array.isArray(document.savedTeamIndices) ? document.savedTeamIndices : [],
                profile: normalizeUserProfile({
                    ...existingUser,
                    profile: document.profile || existingUser.profile,
                    createdAt: document.createdAt || existingUser.createdAt,
                }),
            };
    
            await usersCollection.updateOne(
                { _id: existingUser._id },
                {
                    $set: nextUser,
                }
            );
    
            const updatedUser = await usersCollection.findOne({ _id: existingUser._id });
            return res.json({
                ok: true,
                user: serializeAdminUserDocument(updatedUser || { ...existingUser, ...nextUser }),
            });
        } catch (error) {
            if (error?.code === 11000) {
                return res.status(409).json({ error: 'Username or email is already in use.' });
            }
            console.error('Admin user update error:', error);
            return res.status(500).json({ error: 'Unable to update player account.' });
        }
    });

    // --- BUG REPORTS ADMIN ENDPOINTS ---
    router.get('/bugs', adminCheck, async (req, res) => {
        try {
            if (!bugsCollection) {
                return res.status(503).json({ error: 'Bugs database collection is unavailable.' });
            }
            const { status, category, limit = 100 } = req.query;
            const filter = {};
            if (status) filter.status = String(status).trim();
            if (category) filter.category = String(category).trim();

            const reports = await bugsCollection
                .find(filter)
                .sort({ createdAt: -1 })
                .limit(Math.min(Number(limit) || 100, 500))
                .toArray();

            return res.json({
                ok: true,
                reports: reports.map(r => ({
                    id: String(r._id),
                    category: r.category || 'other',
                    title: r.title || '',
                    description: r.description || '',
                    pageUrl: r.pageUrl || '',
                    clientMetadata: r.clientMetadata || {},
                    status: r.status || 'open',
                    adminNotes: r.adminNotes || '',
                    submittedBy: r.submittedBy || { username: 'Guest' },
                    createdAt: r.createdAt,
                    updatedAt: r.updatedAt,
                })),
            });
        } catch (error) {
            console.error('Error fetching bug reports:', error);
            return res.status(500).json({ error: 'Failed to fetch bug reports.' });
        }
    });

    router.patch('/bugs/:id', adminCheck, async (req, res) => {
        try {
            if (!bugsCollection) {
                return res.status(503).json({ error: 'Bugs database collection is unavailable.' });
            }
            const reportId = req.params.id;
            let objectId;
            try {
                objectId = new ObjectId(reportId);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid bug report ID format.' });
            }

            const { status, adminNotes } = req.body || {};
            const updates = { updatedAt: new Date() };

            if (status !== undefined) {
                const validStatuses = ['open', 'investigating', 'resolved', 'dismissed'];
                if (!validStatuses.includes(status)) {
                    return res.status(400).json({ error: 'Invalid status value.' });
                }
                updates.status = status;
            }

            if (adminNotes !== undefined) {
                updates.adminNotes = String(adminNotes);
            }

            const result = await bugsCollection.findOneAndUpdate(
                { _id: objectId },
                { $set: updates },
                { returnDocument: 'after' }
            );

            const doc = (result && (result.value || (result._id && result))) || await bugsCollection.findOne({ _id: objectId });
            if (!doc) {
                return res.status(404).json({ error: 'Bug report not found.' });
            }

            return res.json({
                ok: true,
                report: {
                    id: String(doc._id),
                    category: doc.category,
                    title: doc.title,
                    description: doc.description,
                    pageUrl: doc.pageUrl,
                    clientMetadata: doc.clientMetadata || {},
                    status: doc.status,
                    adminNotes: doc.adminNotes,
                    submittedBy: doc.submittedBy,
                    createdAt: doc.createdAt,
                    updatedAt: doc.updatedAt,
                },
            });
        } catch (error) {
            console.error('Error updating bug report:', error);
            return res.status(500).json({ error: 'Failed to update bug report.' });
        }
    });

    router.delete('/bugs/:id', adminCheck, async (req, res) => {
        try {
            if (!bugsCollection) {
                return res.status(503).json({ error: 'Bugs database collection is unavailable.' });
            }
            const reportId = req.params.id;
            let objectId;
            try {
                objectId = new ObjectId(reportId);
            } catch (e) {
                return res.status(400).json({ error: 'Invalid bug report ID format.' });
            }

            const result = await bugsCollection.deleteOne({ _id: objectId });
            if (result.deletedCount === 0) {
                return res.status(404).json({ error: 'Bug report not found.' });
            }

            return res.json({ ok: true, message: 'Bug report deleted.' });
        } catch (error) {
            console.error('Error deleting bug report:', error);
            return res.status(500).json({ error: 'Failed to delete bug report.' });
        }
    });

    return router;
};
