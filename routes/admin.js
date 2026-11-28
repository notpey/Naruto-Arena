const express = require('express');
const { ObjectId } = require('mongodb');
const { randomUUID, createHash } = require('node:crypto');
const cosmeticsRules = require('../services/cosmeticsRules.js');
const { validateCharacterPayload } = require('../services/characterValidation.js');
const { getBuilderCatalog } = require('../data/builder');
const { checkCharacter } = require('../character-builder-checks.js');
const { conceptToCharacter } = require('../services/conceptToCharacter.js');
const { runTestBench } = require('../services/testBench.js');

module.exports = function(context) {
    const router = express.Router();
    
    // We bind all required context variables to local scope
    const {
        requireSession,
        appStateCollection,
        characterRankAccess,
        usersCollection,
        bugsCollection,
        newsPostsCollection,
        serializeNewsPost,
        normalizeNewsBlocks,
        normalizeNewsParagraphs,
        normalizeNewsChanges,
        charactersData,
        getCharactersData,
        saveCharacters,
        updateCharacters,
        characterHistory,
        characterArtStore,
        CharacterArtError,
        getRosterVersion,
        serializeCharactersDataFile,
        ladderRulesCollection,
        charactersCollection,
        recalculatePlayerLadderStandings,
        latestReleasesUpdateSchema,
        LATEST_CHARACTER_RELEASES_STATE_KEY = 'latest_character_releases',
        maintenanceModeUpdateSchema,
        MAINTENANCE_MODE_STATE_KEY = 'maintenance_mode',
        getMaintenanceModeState: getSharedMaintenanceModeState,
        invalidateMaintenanceModeCache,
        newsPostSchema,
        userUpdateSchema,
        matchesCollection,
        teamSchema,
        userToMatch,
        normalizeUserProfile,
        serializeAdminUserDocument,
        assertTeamCanBeUsed,
        removeQueuedEntry,
        buildTrainingDummyMatch,
        buildMatchPayloadForUser,
        getTurnDurationMsForUser,
        makeEmptyPendingTurn,
        TRAINING_DUMMY_DISPLAY_NAME,
        insertMatchActive,
        getStoredMissionCatalog,
        saveMissionCatalog,
        cosmeticsService,
    } = context;

    // A short fingerprint of a character's saved data, used to spot conflicting saves.
    const characterRevision = (character) =>
        createHash('sha1').update(JSON.stringify(character ?? null)).digest('hex').slice(0, 16);
    const httpError = (status, message) => Object.assign(new Error(message), { status });
    // Roster changes go through the server's one-at-a-time queue when it provides one.
    const applyCharacterUpdate = (buildNext, options) => (typeof updateCharacters === 'function'
        ? updateCharacters(buildNext, options)
        : Promise.resolve(buildNext(getCharactersList())).then((next) => saveCharacters(next, options)));

    const getCharactersList = () =>
        typeof getCharactersData === 'function'
            ? getCharactersData()
            : Array.isArray(charactersData)
            ? charactersData
            : [];

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

    async function fallbackGetStoredMissionCatalog() {
        if (!appStateCollection) return [];
        try {
            const doc = await appStateCollection.findOne({ key: 'missions' });
            return (doc && Array.isArray(doc.missions)) ? doc.missions : [];
        } catch (e) {
            return [];
        }
    }

    const fetchMissions = typeof getStoredMissionCatalog === 'function' ? getStoredMissionCatalog : fallbackGetStoredMissionCatalog;

    async function fallbackSaveMissionCatalog(missions, updatedBy) {
        if (appStateCollection) {
            await appStateCollection.updateOne(
                { key: 'missions' },
                {
                    $set: {
                        key: 'missions',
                        missions,
                        updatedAt: new Date(),
                        updatedBy: updatedBy || '',
                    },
                },
                { upsert: true }
            );
        }
        return missions;
    }

    const persistMissions = typeof saveMissionCatalog === 'function' ? saveMissionCatalog : fallbackSaveMissionCatalog;

    async function getMaintenanceModeState() {
        if (!appStateCollection) return false;
        try {
            if (typeof getSharedMaintenanceModeState === 'function') {
                return await getSharedMaintenanceModeState();
            }
            const doc = await appStateCollection.findOne({ key: MAINTENANCE_MODE_STATE_KEY });
            return Boolean(doc && doc.enabled);
        } catch (e) {
            return false;
        }
    }

    async function getLatestCharacterReleases() {
        if (!appStateCollection) return [];
        try {
            const doc = await appStateCollection.findOne({ key: LATEST_CHARACTER_RELEASES_STATE_KEY });
            return (doc && Array.isArray(doc.releases)) ? doc.releases : [];
        } catch (e) {
            return [];
        }
    }

    function normalizeLatestCharacterReleases(releases) {
        if (!Array.isArray(releases)) return [];
        return releases.filter(r => r && typeof r.characterId === 'string');
    }

    function isAdminUser(req) {
        const role = String(req.authUser?.role || '').trim().toLowerCase();
        const username = String(req.authUser?.username || '').trim().toLowerCase();
        return role === 'admin' || username === 'admin';
    }

    const adminCheck = (req, res, next) => {
        if (!isAdminUser(req)) {
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
            const { error: validationError, value } = teamSchema.required().validate(req.body?.team);
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
                ...safePayload,
                mode: 'training',
                matchFound: true,
            });
        } catch (error) {
            console.error('Training dummy start error:', error);
            return res.status(500).json({ error: 'Internal server error.' });
        }
    });


    const draftKey = (id) => `character_draft:${id}`;
    const draftText = (value, max) => typeof value === 'string' ? value.trim().slice(0, max) : '';
    const draftNumber = (value, max) => Math.min(max, Math.max(0, Math.floor(Number(value) || 0)));
    function normalizeCharacterDraft(input) {
        if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
        const name = draftText(input.name, 80);
        if (!name) return null;
        const skills = Array.isArray(input.skills) ? input.skills.slice(0, 12) : [];
        return {
            name,
            portrait: draftText(input.portrait, 500),
            description: draftText(input.description, 4000),
            health: draftNumber(input.health, 9999) || 100,
            unlock: draftText(input.unlock, 300),
            notes: draftText(input.notes, 8000),
            stage: ['idea', 'review', 'revised'].includes(input.stage) ? input.stage : 'idea',
            passive: input.passive && typeof input.passive === 'object' && !Array.isArray(input.passive) ? {
                name: draftText(input.passive.name, 80),
                icon: draftText(input.passive.icon, 500),
                description: draftText(input.passive.description, 4000),
                notes: draftText(input.passive.notes, 2000),
            } : null,
            skills: skills.map((skill) => ({
                name: draftText(skill?.name, 80),
                icon: draftText(skill?.icon, 500),
                description: draftText(skill?.description, 4000),
                cooldown: draftNumber(skill?.cooldown, 99),
                target: draftText(skill?.target, 100),
                classes: draftText(skill?.classes, 300),
                notes: draftText(skill?.notes, 2000),
                alternate: skill?.alternate === true,
                cost: Object.fromEntries(['bloodline', 'ninjutsu', 'taijutsu', 'genjutsu', 'random'].map(
                    (type) => [type, draftNumber(skill?.cost?.[type], 9)]
                )),
            })),
        };
    }
    const publicDraft = (doc) => ({
        id: doc.id, version: doc.version, createdAt: doc.createdAt,
        updatedAt: doc.updatedAt, createdBy: doc.createdBy,
        updatedBy: doc.updatedBy, ...doc.draft,
    });
    const commentKey = (draftId, commentId) => `character_draft_comment:${draftId}:${commentId}`;
    const publicComment = (doc) => ({
        id: doc.id, draftId: doc.draftId, author: doc.author,
        type: doc.type, title: doc.title || '', text: doc.text, replyTo: doc.replyTo,
        createdAt: doc.createdAt, resolvedAt: doc.resolvedAt || null,
        resolvedBy: doc.resolvedBy || null,
    });
    router.use('/character-drafts', (req, res, next) => {
        if (!['admin', 'global_moderator'].includes(String(req.authUser?.role || '').trim().toLowerCase())) {
            return res.status(403).json({ error: 'Character Creator access required.' });
        }
        next();
    });
    router.get('/character-drafts', async (req, res) => {
        if (!appStateCollection) return res.status(503).json({ error: 'Draft storage is unavailable.' });
        try {
            const docs = await appStateCollection.find({ key: /^character_draft:/ }).sort({ updatedAt: -1 }).toArray();
            return res.json({ ok: true, drafts: docs.map(publicDraft) });
        } catch (error) {
            console.error('Character draft list error:', error);
            return res.status(500).json({ error: 'Unable to load character drafts.' });
        }
    });
    router.post('/character-drafts', async (req, res) => {
        if (!appStateCollection) return res.status(503).json({ error: 'Draft storage is unavailable.' });
        const draft = normalizeCharacterDraft(req.body);
        if (!draft) return res.status(400).json({ error: 'A character name is required.' });
        const now = new Date();
        const doc = {
            key: draftKey(randomUUID()), id: '', version: 1,
            createdAt: now, updatedAt: now,
            createdBy: req.authUser.username, updatedBy: req.authUser.username, draft,
        };
        doc.id = doc.key.slice('character_draft:'.length);
        try {
            await appStateCollection.insertOne(doc);
            return res.status(201).json({ ok: true, draft: publicDraft(doc) });
        } catch (error) {
            console.error('Character draft create error:', error);
            return res.status(500).json({ error: 'Unable to save character draft.' });
        }
    });
    router.put('/character-drafts/:id', async (req, res) => {
        if (!appStateCollection) return res.status(503).json({ error: 'Draft storage is unavailable.' });
        const id = String(req.params.id || '');
        if (!/^[0-9a-f-]{36}$/.test(id)) return res.status(404).json({ error: 'Draft not found.' });
        const draft = normalizeCharacterDraft(req.body);
        if (!draft) return res.status(400).json({ error: 'A character name is required.' });
        const version = Number(req.body?.version);
        if (!Number.isSafeInteger(version) || version < 1) return res.status(400).json({ error: 'A draft version is required.' });
        try {
            const result = await appStateCollection.updateOne(
                { key: draftKey(id), version },
                { $set: { draft, updatedAt: new Date(), updatedBy: req.authUser.username }, $inc: { version: 1 } }
            );
            if (!result.matchedCount) {
                const existing = await appStateCollection.findOne({ key: draftKey(id) });
                return res.status(existing ? 409 : 404).json({ error: existing ? 'This draft changed since you opened it. Reload before saving.' : 'Draft not found.' });
            }
            const saved = await appStateCollection.findOne({ key: draftKey(id) });
            return res.json({ ok: true, draft: publicDraft(saved) });
        } catch (error) {
            console.error('Character draft update error:', error);
            return res.status(500).json({ error: 'Unable to update character draft.' });
        }
    });
    router.get('/character-drafts/:id/comments', async (req, res) => {
        if (!appStateCollection) return res.status(503).json({ error: 'Draft storage is unavailable.' });
        const id = String(req.params.id || '');
        if (!/^[0-9a-f-]{36}$/.test(id)) return res.status(404).json({ error: 'Draft not found.' });
        try {
            if (!await appStateCollection.findOne({ key: draftKey(id) })) return res.status(404).json({ error: 'Draft not found.' });
            const docs = await appStateCollection.find({ kind: 'character_draft_comment', draftId: id }).sort({ createdAt: 1 }).toArray();
            return res.json({ ok: true, comments: docs.map(publicComment) });
        } catch (error) {
            console.error('Character draft comments load error:', error);
            return res.status(500).json({ error: 'Unable to load draft discussion.' });
        }
    });
    router.post('/character-drafts/:id/comments', async (req, res) => {
        if (!appStateCollection) return res.status(503).json({ error: 'Draft storage is unavailable.' });
        const id = String(req.params.id || '');
        if (!/^[0-9a-f-]{36}$/.test(id)) return res.status(404).json({ error: 'Draft not found.' });
        const text = draftText(req.body?.text, 3000);
        const title = draftText(req.body?.title, 120);
        const type = req.body?.type === 'suggestion' ? 'suggestion' : 'comment';
        const replyTo = req.body?.replyTo ? String(req.body.replyTo) : null;
        if (!text || (typeof req.body?.text === 'string' && req.body.text.trim().length > 3000)) {
            return res.status(400).json({ error: 'Write a message of 1 to 3000 characters.' });
        }
        if (!replyTo && typeof req.body?.title === 'string' && req.body.title.trim().length > 120) {
            return res.status(400).json({ error: 'Topic subject must be 120 characters or fewer.' });
        }
        if (replyTo && !/^[0-9a-f-]{36}$/.test(replyTo)) return res.status(400).json({ error: 'Invalid reply target.' });
        try {
            if (!await appStateCollection.findOne({ key: draftKey(id) })) return res.status(404).json({ error: 'Draft not found.' });
            if (replyTo && !await appStateCollection.findOne({ key: commentKey(id, replyTo) })) {
                return res.status(400).json({ error: 'The message you are replying to was not found.' });
            }
            const commentId = randomUUID();
            const doc = {
                key: commentKey(id, commentId), kind: 'character_draft_comment',
                id: commentId, draftId: id, author: req.authUser.username,
                type, title: replyTo ? '' : title || text.split('\n')[0].slice(0, 120),
                text, replyTo, createdAt: new Date(), resolvedAt: null, resolvedBy: null,
            };
            await appStateCollection.insertOne(doc);
            return res.status(201).json({ ok: true, comment: publicComment(doc) });
        } catch (error) {
            console.error('Character draft comment create error:', error);
            return res.status(500).json({ error: 'Unable to post draft message.' });
        }
    });
    router.patch('/character-drafts/:id/comments/:commentId', async (req, res) => {
        if (!appStateCollection) return res.status(503).json({ error: 'Draft storage is unavailable.' });
        const id = String(req.params.id || '');
        const commentId = String(req.params.commentId || '');
        if (!/^[0-9a-f-]{36}$/.test(id) || !/^[0-9a-f-]{36}$/.test(commentId)) {
            return res.status(404).json({ error: 'Suggestion not found.' });
        }
        if (typeof req.body?.resolved !== 'boolean') return res.status(400).json({ error: 'Resolved must be true or false.' });
        try {
            const key = commentKey(id, commentId);
            const comment = await appStateCollection.findOne({ key });
            if (!comment || comment.type !== 'suggestion') return res.status(404).json({ error: 'Suggestion not found.' });
            await appStateCollection.updateOne({ key }, { $set: {
                resolvedAt: req.body.resolved ? new Date() : null,
                resolvedBy: req.body.resolved ? req.authUser.username : null,
            } });
            return res.json({ ok: true, comment: publicComment(await appStateCollection.findOne({ key })) });
        } catch (error) {
            console.error('Character draft suggestion update error:', error);
            return res.status(500).json({ error: 'Unable to update suggestion.' });
        }
    });
    router.delete('/character-drafts/:id', async (req, res) => {
        if (!appStateCollection) return res.status(503).json({ error: 'Draft storage is unavailable.' });
        const id = String(req.params.id || '');
        if (!/^[0-9a-f-]{36}$/.test(id)) return res.status(404).json({ error: 'Draft not found.' });
        try {
            const result = await appStateCollection.deleteOne({ key: draftKey(id) });
            if (result.deletedCount) await appStateCollection.deleteMany({ kind: 'character_draft_comment', draftId: id });
            return res.status(result.deletedCount ? 200 : 404).json(result.deletedCount ? { ok: true } : { error: 'Draft not found.' });
        } catch (error) {
            console.error('Character draft delete error:', error);
            return res.status(500).json({ error: 'Unable to delete character draft.' });
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
        if (typeof invalidateMaintenanceModeCache === 'function') {
            invalidateMaintenanceModeCache();
        }
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
            const characters = getCharactersList().map((character = {}, index) => ({
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
        if (!isAdminUser(req)) {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        try {
            const missions = await fetchMissions();
            return res.json({
                ok: true,
                missions,
            });
        } catch (error) {
            console.error('Admin mission catalog load error:', error);
            return res.status(500).json({ error: 'Unable to load missions.' });
        }
    });
    router.get('/control-panel', requireSession, async (req, res) => {
        if (!isAdminUser(req)) {
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
                    characters: getCharactersList().length,
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
                        href: 'charactercreator.html',
                        title: 'Character Creator',
                        description: 'Draft character and skill ideas for balance review without changing the live roster.',
                        status: 'Concept drafts',
                    },
                    {
                        href: 'editmission.html',
                        title: 'Mission Editor',
                        description: 'Manage unlock missions, rank requirements, goals, and rewards.',
                        status: 'Live editor',
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
        if (!isAdminUser(req)) {
            return res.status(403).json({ error: 'Admin access required.' });
        }
    
        const missions = Array.isArray(req.body?.missions) ? req.body.missions : null;
        if (!missions) {
            return res.status(400).json({ error: 'Missions are required.' });
        }
    
        try {
            const savedMissions = await persistMissions(missions, req.authUser.username);
            return res.json({
                ok: true,
                missions: savedMissions,
            });
        } catch (error) {
            console.error('Admin mission catalog save error:', error);
            return res.status(400).json({ error: error.message || 'Unable to save missions.' });
        }
    });
    router.get('/characters', requireSession, (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
        const characters = getCharactersList();
        return res.json({
            ok: true,
            characters,
            // The editor sends a character's revision back on save, so a save can't silently
            // overwrite a change another admin made in the meantime.
            revisions: Object.fromEntries(characters.map((entry) => [entry.characterId, characterRevision(entry)])),
            rosterVersion: typeof getRosterVersion === 'function' ? getRosterVersion() : null,
        });
    });
    router.get('/character-access', adminCheck, async (req, res) => {
        try {
            return res.json({
                ok: true,
                characters: getCharactersList().map((entry) => ({
                    characterId: entry.characterId || entry.id,
                    name: entry.name,
                    facePicture: entry.facePicture || '',
                })),
                policies: await characterRankAccess.getPolicies(),
            });
        } catch (error) {
            console.error('Character rank access load error:', error);
            return res.status(500).json({ error: 'Unable to load character rank access.' });
        }
    });
    router.put('/character-access', adminCheck, async (req, res) => {
        try {
            const policies = await characterRankAccess.savePolicies(
                req.body?.policies, req.authUser.username
            );
            return res.json({ ok: true, policies });
        } catch (error) {
            if (error.message?.startsWith('Invalid') || error.message?.startsWith('Unknown') ||
                error.message?.startsWith('Character access policies')) {
                return res.status(400).json({ error: error.message });
            }
            console.error('Character rank access save error:', error);
            return res.status(500).json({ error: 'Unable to save character rank access.' });
        }
    });
    // The Advanced view (block builder, Rules, test bench) is limited to the usernames in
    // ACP_ADVANCED_EDITORS (comma-separated); everyone else edits with plain sentences.
    const isAdvancedEditor = (req) => String(process.env.ACP_ADVANCED_EDITORS || '').split(',')
        .map((name) => name.trim().toLowerCase()).filter(Boolean)
        .includes(String(req.authUser?.username || '').toLowerCase());
    // Everything the battle engine can do, described for the Character Editor, with where each
    // piece is used on the live roster.
    router.get('/builder-catalog', requireSession, (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
        // The full block builder is limited to the usernames in ACP_ADVANCED_EDITORS (comma-separated);
        // everyone else edits with plain sentences.
        return res.json({ ok: true, catalog: { ...getBuilderCatalog(getCharactersList()), advancedAllowed: isAdvancedEditor(req) } });
    });
    // Character Editor test bench: runs the edited character (unsaved changes included) in a short
    // scripted match on a throwaway board. Nothing is saved; no live match is touched.
    router.post('/test-bench', requireSession, (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
        if (!isAdvancedEditor(req)) return res.status(403).json({ error: 'The test bench is part of the Advanced view.' });
        const { character, allies, enemies, steps } = req.body || {};
        const problems = validateCharacterPayload(character);
        if (problems.length) return res.status(400).json({ error: problems[0] });
        const result = runTestBench({ roster: getCharactersList(), character, allies, enemies, steps });
        return res.status(result.ok ? 200 : 400).json(result.ok ? result : { error: result.error, frames: result.frames || [] });
    });
    // Plain-language checks for a saved character: what the engine would ignore or misread.
    const checksFor = (character) => {
        try {
            const roster = getCharactersList();
            return checkCharacter(character, { catalog: getBuilderCatalog(roster), roster });
        } catch (error) {
            console.error('Character check error:', error);
            return [];
        }
    };
    // ------------------------------------------------------------ Character Editor drafts
    // A draft is a character that isn't live yet: made in the editor, or promoted from a Character
    // Creator concept. Admins work on it across sessions, then publish it to the roster.
    const editorDraftKey = (id) => `editor_draft:${id}`;
    const isAdminRequest = (req) => String(req.authUser?.role || '').trim().toLowerCase() === 'admin';
    const publicEditorDraft = (doc, { withCharacter = true } = {}) => ({
        id: doc.id,
        name: doc.character?.name || 'Untitled',
        characterId: doc.character?.characterId || '',
        facePicture: doc.character?.facePicture || '',
        source: doc.source || null,
        createdAt: doc.createdAt, updatedAt: doc.updatedAt,
        createdBy: doc.createdBy, updatedBy: doc.updatedBy,
        ...(withCharacter ? { character: doc.character, notes: doc.notes || null, problems: doc.problems || [] } : {}),
    });
    const draftCharacterErrors = (character) => {
        if (!character || typeof character !== 'object' || Array.isArray(character)) return ['A character is required.'];
        if (typeof character.name !== 'string' || !character.name.trim()) return ['Give the character a name.'];
        if (JSON.stringify(character).length > 400000) return ['This draft is too large to save.'];
        return [];
    };
    router.use('/editor-drafts', (req, res, next) => {
        if (!isAdminRequest(req)) return res.status(403).json({ error: 'Admin access required.' });
        if (!appStateCollection) return res.status(503).json({ error: 'Draft storage is unavailable.' });
        next();
    });
    router.get('/editor-drafts', async (req, res) => {
        try {
            const docs = await appStateCollection.find({ key: /^editor_draft:/ }).sort({ updatedAt: -1 }).toArray();
            return res.json({ ok: true, drafts: docs.map((doc) => publicEditorDraft(doc, { withCharacter: false })) });
        } catch (error) {
            console.error('Editor draft list error:', error);
            return res.status(500).json({ error: 'Unable to load drafts.' });
        }
    });
    router.get('/editor-drafts/:id', async (req, res) => {
        try {
            const doc = await appStateCollection.findOne({ key: editorDraftKey(String(req.params.id || '')) });
            if (!doc) return res.status(404).json({ error: 'Draft not found.' });
            return res.json({ ok: true, draft: publicEditorDraft(doc), checks: checksFor(doc.character) });
        } catch (error) {
            console.error('Editor draft load error:', error);
            return res.status(500).json({ error: 'Unable to load the draft.' });
        }
    });
    // Body: { character } for a new draft, or { conceptId } to promote a Character Creator concept.
    router.post('/editor-drafts', async (req, res) => {
        const now = new Date();
        const id = randomUUID();
        let character = req.body?.character;
        let notes = null;
        let problems = [];
        let source = null;
        try {
            if (typeof req.body?.conceptId === 'string' && req.body.conceptId) {
                const concept = await appStateCollection.findOne({ key: draftKey(req.body.conceptId) });
                if (!concept) return res.status(404).json({ error: 'Concept not found.' });
                const draftIds = (await appStateCollection.find({ key: /^editor_draft:/ }).toArray())
                    .map((doc) => doc.character?.characterId).filter(Boolean);
                const converted = conceptToCharacter(concept.draft, {
                    takenIds: [...getCharactersList().map((entry) => entry.characterId), ...draftIds],
                });
                ({ character, notes, problems } = converted);
                source = { type: 'concept', id: concept.id, name: concept.draft?.name || '' };
            }
            const errors = draftCharacterErrors(character);
            if (errors.length) return res.status(400).json({ error: errors.join(' ') });
            const doc = {
                key: editorDraftKey(id), id, character, notes, problems, source,
                createdAt: now, updatedAt: now, createdBy: req.authUser.username, updatedBy: req.authUser.username,
            };
            await appStateCollection.insertOne(doc);
            return res.status(201).json({ ok: true, draft: publicEditorDraft(doc), checks: checksFor(character) });
        } catch (error) {
            console.error('Editor draft create error:', error);
            return res.status(500).json({ error: 'Unable to create the draft.' });
        }
    });
    router.put('/editor-drafts/:id', async (req, res) => {
        const character = req.body?.character;
        const errors = draftCharacterErrors(character);
        if (errors.length) return res.status(400).json({ error: errors.join(' ') });
        try {
            const result = await appStateCollection.findOneAndUpdate(
                { key: editorDraftKey(String(req.params.id || '')) },
                { $set: { character, updatedAt: new Date(), updatedBy: req.authUser.username } },
                { returnDocument: 'after' }
            );
            const doc = result && result.value !== undefined ? result.value : result;
            if (!doc) return res.status(404).json({ error: 'Draft not found.' });
            return res.json({ ok: true, draft: publicEditorDraft(doc), checks: checksFor(character) });
        } catch (error) {
            console.error('Editor draft save error:', error);
            return res.status(500).json({ error: 'Unable to save the draft.' });
        }
    });
    router.delete('/editor-drafts/:id', async (req, res) => {
        try {
            const result = await appStateCollection.deleteOne({ key: editorDraftKey(String(req.params.id || '')) });
            if (!result.deletedCount) return res.status(404).json({ error: 'Draft not found.' });
            return res.json({ ok: true });
        } catch (error) {
            console.error('Editor draft delete error:', error);
            return res.status(500).json({ error: 'Unable to delete the draft.' });
        }
    });

    router.get('/characters/export', requireSession, (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
        // ?format=json is what npm run pull-characters downloads.
        if (req.query?.format === 'json') {
            return res.json({
                ok: true,
                exportedAt: new Date().toISOString(),
                rosterVersion: typeof getRosterVersion === 'function' ? getRosterVersion() : null,
                characters: getCharactersList(),
            });
        }
        const serialized = serializeCharactersDataFile(getCharactersList());
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="characters.js"');
        return res.send(serialized);
    });
    router.post('/character-art', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
        try {
            const art = await characterArtStore.upload(req.body?.dataUrl, req.authUser.username);
            return res.status(201).json({ ok: true, ...art });
        } catch (error) {
            if (CharacterArtError && error instanceof CharacterArtError) {
                return res.status(400).json({ error: error.message });
            }
            console.error('Character art upload error:', error);
            return res.status(500).json({ error: 'Unable to upload that image.' });
        }
    });
    router.get('/characters/:characterId/history', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
        const characterId = typeof req.params?.characterId === 'string' ? req.params.characterId.trim() : '';
        try {
            return res.json({ ok: true, entries: await characterHistory.list(characterId) });
        } catch (error) {
            console.error('Character history load error:', error);
            return res.status(500).json({ error: 'Unable to load this character’s history.' });
        }
    });
    router.get('/characters/:characterId', requireSession, (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }

        const characterId = typeof req.params?.characterId === 'string' ? req.params.characterId.trim() : '';
        const character = getCharactersList().find(
            (entry) => typeof entry?.characterId === 'string' && entry.characterId === characterId
        );
        if (!character) {
            return res.status(404).json({ error: 'Character not found.' });
        }

        return res.json({
            ok: true,
            character,
            revision: characterRevision(character),
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
        if (nextCharacter.characterId.trim() !== characterId) {
            return res.status(400).json({ error: 'A live character’s id can’t change.' });
        }
        const characterErrors = validateCharacterPayload(nextCharacter);
        if (characterErrors.length) {
            return res.status(400).json({ error: characterErrors.join(' '), errors: characterErrors });
        }
        const expectedRevision = String(req.headers?.['x-character-revision'] || '').trim();

        try {
            await applyCharacterUpdate((currentCharacters) => {
                const characterIndex = currentCharacters.findIndex(
                    (entry) => typeof entry?.characterId === 'string' && entry.characterId === characterId
                );
                if (characterIndex === -1) throw httpError(404, 'Character not found.');
                const current = currentCharacters[characterIndex];
                if (expectedRevision && expectedRevision !== characterRevision(current)) {
                    throw httpError(409, `Someone else saved ${current.name || characterId} after you opened it. ` +
                        'Copy anything you need, then refresh to see their version.');
                }
                const updatedCharacters = currentCharacters.slice();
                updatedCharacters[characterIndex] = nextCharacter;
                return updatedCharacters;
            }, { savedBy: req.authUser.username, action: 'edit' });
            return res.json({
                ok: true,
                character: nextCharacter,
                revision: characterRevision(nextCharacter),
                checks: checksFor(nextCharacter),
            });
        } catch (error) {
            if (error.status) return res.status(error.status).json({ error: error.message });
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
        const newCharacterErrors = validateCharacterPayload(newCharacter);
        if (newCharacterErrors.length) {
            return res.status(400).json({ error: newCharacterErrors.join(' '), errors: newCharacterErrors });
        }
        const characterId = newCharacter.characterId.trim();
        try {
            // New characters join the end of the roster, so no existing roster index moves.
            await applyCharacterUpdate((currentCharacters) => {
                if (currentCharacters.some((entry) => typeof entry?.characterId === 'string' && entry.characterId === characterId)) {
                    throw httpError(409, 'Character id is already in use.');
                }
                return [...currentCharacters, newCharacter];
            }, { savedBy: req.authUser.username, action: 'create' });
        } catch (error) {
            if (error.status) return res.status(error.status).json({ error: error.message });
            console.error('Admin character create error:', error);
            return res.status(500).json({ error: 'Unable to create character.' });
        }
        // A new character is staff-only until it's released to players in Character Access,
        // so admins can finish and test it first.
        let hiddenFromPlayers = false;
        try {
            const policies = await characterRankAccess.getPolicies();
            await characterRankAccess.savePolicies(
                { ...policies, [characterId]: { player: { visibility: 'hidden', unlock: 'inherit' } } },
                req.authUser.username
            );
            hiddenFromPlayers = true;
        } catch (error) {
            console.error('Could not hide the new character from players:', error);
        }
        return res.status(201).json({
            ok: true, character: newCharacter, revision: characterRevision(newCharacter), hiddenFromPlayers,
            checks: checksFor(newCharacter),
        });
    });
    // "Deleting" retires a character: it stays in the roster, because matches, saved teams and
    // stats refer to roster positions, but it's hidden everywhere and can't be picked. Saving it
    // with retired turned off brings it back.
    router.delete('/characters/:characterId', requireSession, async (req, res) => {
        if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
            return res.status(403).json({ error: 'Admin access required.' });
        }
        const characterId = typeof req.params?.characterId === 'string' ? req.params.characterId.trim() : '';
        if (!characterId) {
            return res.status(400).json({ error: 'A character id is required.' });
        }
        let retired = null;
        try {
            await applyCharacterUpdate((currentCharacters) => {
                const characterIndex = currentCharacters.findIndex(
                    (entry) => typeof entry?.characterId === 'string' && entry.characterId === characterId
                );
                if (characterIndex === -1) throw httpError(404, 'Character not found.');
                retired = { ...currentCharacters[characterIndex], retired: true };
                const updatedCharacters = currentCharacters.slice();
                updatedCharacters[characterIndex] = retired;
                return updatedCharacters;
            }, { savedBy: req.authUser.username, action: 'retire' });
            return res.json({ ok: true, retired: true, character: retired, revision: characterRevision(retired) });
        } catch (error) {
            if (error.status) return res.status(error.status).json({ error: error.message });
            console.error('Admin character retire error:', error);
            return res.status(500).json({ error: 'Unable to retire character.' });
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
        const requestedRole = typeof document.role === 'string' && document.role.trim()
            ? document.role.trim().toLowerCase()
            : null;
    
        try {
            const existingUser = await usersCollection.findOne({ username: originalUsername });
            if (!existingUser) {
                return res.status(404).json({ error: 'Player not found.' });
            }
            const nextRole = requestedRole || existingUser.role || 'player';
            if (!['admin', 'global_moderator', 'moderator', 'player'].includes(nextRole)) {
                return res.status(400).json({ error: 'Choose a valid site rank.' });
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
                role: nextRole,
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

    router.get('/promo-codes', requireSession, async (req, res) => {
        if (!isAdminUser(req)) {
            return res.status(403).json({ error: 'Admin access required.' });
        }
        try {
            let codes = [];
            if (promoCodesCollection) {
                codes = await promoCodesCollection.find({}).sort({ createdAt: -1 }).toArray();
            } else {
                codes = [
                    { _id: 'welcome2026', code: 'WELCOME2026', rewards: { ryo: 500 }, active: true, timesRedeemed: 12, maxRedemptions: 1000 },
                    { _id: 'shinobi777', code: 'SHINOBI777', rewards: { ryo: 777 }, active: true, timesRedeemed: 45, maxRedemptions: 500 }
                ];
            }
            return res.json({ ok: true, promoCodes: codes.map((entry) => ({
                ...entry,
                rewards: { ryo: Math.max(0, Number(entry.rewards?.ryo ?? entry.ryo) || 0) }
            })) });
        } catch (e) {
            console.error('Admin load promo codes error:', e);
            return res.status(500).json({ error: 'Unable to load promo codes.' });
        }
    });

    router.post('/promo-codes', requireSession, async (req, res) => {
        if (!isAdminUser(req)) {
            return res.status(403).json({ error: 'Admin access required.' });
        }
        try {
            const { code, ryo = 0, maxRedemptions = 100, active = true, expiresAt } = req.body || {};
            const normalizedCode = String(code || '').trim().toUpperCase();
            if (!normalizedCode) {
                return res.status(400).json({ error: 'A valid promo code string is required.' });
            }

            const promoDoc = {
                code: normalizedCode,
                rewards: { ryo: Math.max(0, Number(ryo) || 0) },
                maxRedemptions: Math.max(1, Number(maxRedemptions) || 100),
                timesRedeemed: 0,
                active: active !== false,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                createdAt: new Date()
            };

            if (promoCodesCollection) {
                await promoCodesCollection.updateOne(
                    { code: normalizedCode },
                    { $set: promoDoc },
                    { upsert: true }
                );
            }

            return res.json({ ok: true, promoCode: promoDoc });
        } catch (e) {
            console.error('Admin create promo code error:', e);
            return res.status(500).json({ error: 'Unable to create promo code.' });
        }
    });

    router.delete('/promo-codes/:codeId', requireSession, async (req, res) => {
        if (!isAdminUser(req)) {
            return res.status(403).json({ error: 'Admin access required.' });
        }
        try {
            const { codeId } = req.params;
            if (promoCodesCollection) {
                try {
                    await promoCodesCollection.deleteOne({ _id: new ObjectId(codeId) });
                } catch (err) {
                    await promoCodesCollection.deleteOne({ code: codeId.toUpperCase() });
                }
            }
            return res.json({ ok: true, message: 'Promo code deleted.' });
        } catch (e) {
            console.error('Admin delete promo code error:', e);
            return res.status(500).json({ error: 'Unable to delete promo code.' });
        }
    });

    // Shop cosmetics. Images are Imgur links (the host has no persistent disk), checked before saving.
    const loadCosmeticsCatalog = async () => {
        const cs = cosmeticsService || context.cosmeticsService;
        if (!cs) return { avatars: [], titles: [], borders: [] };
        return typeof cs.loadCatalog === 'function' ? cs.loadCatalog() : cs.getCatalogSync();
    };

    const findCosmetic = (catalog, itemId) => {
        for (const category of cosmeticsRules.CATEGORIES) {
            const item = (catalog[category] || []).find((entry) => entry && entry.id === itemId);
            if (item) return item;
        }
        return null;
    };

    // How many players own each item, so admins can see what retiring or deleting affects.
    const countCosmeticOwners = async () => {
        if (!usersCollection || typeof usersCollection.aggregate !== 'function') return {};
        const rows = await usersCollection.aggregate([
            { $project: { ids: { $concatArrays: cosmeticsRules.CATEGORIES.map((category) => ({ $ifNull: [`$profile.inventory.${category}`, []] })) } } },
            { $unwind: '$ids' },
            { $group: { _id: '$ids', count: { $sum: 1 } } },
        ]).toArray();
        return Object.fromEntries(rows.map((row) => [row._id, row.count]));
    };

    const inspectCosmeticImage = async (category, imageUrl) => {
        if (typeof context.inspectRemoteImage !== 'function') return { info: null, errors: [], warnings: [] };
        let info;
        try {
            info = await context.inspectRemoteImage(imageUrl);
        } catch (error) {
            return { info: null, errors: [`Couldn't load that image from Imgur (${error.message || 'unreachable'}).`], warnings: [] };
        }
        return { info, ...cosmeticsRules.checkCosmeticImage(category, info) };
    };

    // Names (and image links) must be unique per category: equipped titles are stored by name.
    const findDuplicate = (catalog, item, ignoreId) => (catalog[item.category] || []).find((entry) => entry && entry.id !== ignoreId && (
        String(entry.name || '').toLowerCase() === String(item.name || '').toLowerCase()
        || (item.imageUrl && entry.imageUrl === item.imageUrl)
    ));

    const validateForSave = async (catalog, input, existing, pending = []) => {
        const { item, errors } = cosmeticsRules.validateCosmeticInput(input, existing);
        if (errors.length) return { errors };
        const duplicate = findDuplicate(catalog, item, existing?.id) || pending.find((entry) => entry.category === item.category && (
            entry.name.toLowerCase() === item.name.toLowerCase() || (item.imageUrl && entry.imageUrl === item.imageUrl)
        ));
        if (duplicate) {
            return { errors: [duplicate.name.toLowerCase() === item.name.toLowerCase()
                ? `Another ${item.category.slice(0, -1)} is already named “${duplicate.name}”.`
                : `“${duplicate.name}” already uses that image.`] };
        }
        let warnings = [];
        if (item.imageUrl && item.imageUrl !== existing?.imageUrl) {
            const check = await inspectCosmeticImage(item.category, item.imageUrl);
            if (check.errors.length) return { errors: check.errors };
            warnings = check.warnings;
        }
        return { item, warnings, errors: [] };
    };

    router.get('/cosmetics', requireSession, adminCheck, async (req, res) => {
        try {
            const [catalog, owners] = await Promise.all([loadCosmeticsCatalog(), countCosmeticOwners().catch(() => ({}))]);
            return res.json({ ok: true, catalog, owners });
        } catch (e) {
            console.error('Admin get cosmetics error:', e);
            return res.status(500).json({ error: 'Unable to load cosmetics catalog.' });
        }
    });

    router.post('/cosmetics/inspect-image', requireSession, adminCheck, async (req, res) => {
        const category = String(req.body?.category || '').trim().toLowerCase();
        if (!['avatars', 'borders'].includes(category)) {
            return res.status(400).json({ error: 'Only avatars and borders use images.' });
        }
        const normalized = cosmeticsRules.normalizeImgurUrl(req.body?.url);
        if (normalized.error) return res.status(400).json({ error: normalized.error });
        const check = await inspectCosmeticImage(category, normalized.url);
        return res.json({ ok: check.errors.length === 0, imageUrl: normalized.url, ...(check.info || {}), errors: check.errors, warnings: check.warnings });
    });

    router.post('/cosmetics', requireSession, adminCheck, async (req, res) => {
        try {
            const inputs = Array.isArray(req.body?.items) ? req.body.items : [];
            if (!inputs.length || inputs.length > 50) {
                return res.status(400).json({ error: 'Send between 1 and 50 items.' });
            }
            const catalog = await loadCosmeticsCatalog();
            const prepared = [];
            const failures = [];
            for (let index = 0; index < inputs.length; index += 1) {
                const result = await validateForSave(catalog, inputs[index], null, prepared);
                if (result.errors.length) failures.push({ index, error: result.errors.join(' ') });
                else prepared.push({ ...result.item, warnings: result.warnings });
            }
            // All or nothing, so a batch never half-publishes.
            if (failures.length) {
                return res.status(400).json({ error: failures.length === 1 && inputs.length === 1 ? failures[0].error : `${failures.length} of ${inputs.length} items need fixing.`, failures });
            }
            const now = new Date();
            const items = prepared.map(({ warnings, ...item }) => ({
                ...item,
                id: cosmeticsRules.createCosmeticId(item.category, item.name),
                createdAt: now,
                updatedAt: now,
            }));
            const cs = cosmeticsService || context.cosmeticsService;
            await cs.addCosmeticItems(items);
            const live = items.filter((item) => item.status === 'live').length;
            return res.json({
                ok: true,
                items,
                warnings: prepared.flatMap((item) => item.warnings.map((warning) => `${item.name}: ${warning}`)),
                message: `Saved ${items.length} item${items.length === 1 ? '' : 's'}${live ? ` (${live} live in the shop)` : ' as drafts'}.`,
            });
        } catch (e) {
            console.error('Admin create cosmetics error:', e);
            return res.status(500).json({ error: 'Unable to save cosmetics.' });
        }
    });

    router.patch('/cosmetics/:itemId', requireSession, adminCheck, async (req, res) => {
        try {
            const catalog = await loadCosmeticsCatalog();
            const existing = findCosmetic(catalog, req.params.itemId);
            if (!existing) return res.status(404).json({ error: 'That item no longer exists.' });
            const result = await validateForSave(catalog, req.body || {}, existing);
            if (result.errors.length) return res.status(400).json({ error: result.errors.join(' ') });
            if (result.item.status === 'draft' && cosmeticsRules.getItemStatus(existing) !== 'draft') {
                const owners = (await countCosmeticOwners().catch(() => ({})))[existing.id] || 0;
                if (owners > 0) {
                    return res.status(409).json({ error: `${owners} player${owners === 1 ? ' owns' : 's own'} ${existing.name}, so it can't go back to drafts. Retire it instead.` });
                }
            }

            const item = { ...result.item, updatedAt: new Date() };
            const cs = cosmeticsService || context.cosmeticsService;
            await cs.updateCosmeticItem(existing.id, item);

            // Equipped cosmetics are stored by value, so carry owners over to the new name or image.
            const equippedField = { avatars: 'avatarUrl', borders: 'equippedBorder', titles: 'equippedTitle' }[item.category];
            const before = item.category === 'titles' ? existing.name : existing.imageUrl;
            const after = item.category === 'titles' ? item.name : item.imageUrl;
            let movedPlayers = 0;
            if (usersCollection && before && after && before !== after) {
                const moved = await usersCollection.updateMany(
                    { [`profile.inventory.${item.category}`]: existing.id, [`profile.${equippedField}`]: before },
                    { $set: { [`profile.${equippedField}`]: after } }
                );
                movedPlayers = moved?.modifiedCount || 0;
            }
            return res.json({
                ok: true,
                item: { ...item, id: existing.id },
                warnings: result.warnings,
                message: `Saved ${item.name}.${movedPlayers ? ` Updated ${movedPlayers} player${movedPlayers === 1 ? '' : 's'} who had it equipped.` : ''}`,
            });
        } catch (e) {
            console.error('Admin update cosmetic error:', e);
            return res.status(500).json({ error: 'Unable to save that item.' });
        }
    });

    router.delete('/cosmetics/:itemId', requireSession, adminCheck, async (req, res) => {
        try {
            const catalog = await loadCosmeticsCatalog();
            const existing = findCosmetic(catalog, req.params.itemId);
            if (!existing) return res.status(404).json({ error: 'That item no longer exists.' });
            const owners = (await countCosmeticOwners().catch(() => ({})))[existing.id] || 0;
            if (owners > 0) {
                return res.status(409).json({ error: `${owners} player${owners === 1 ? ' owns' : 's own'} ${existing.name}. Retire it instead so they keep it.` });
            }
            const cs = cosmeticsService || context.cosmeticsService;
            await cs.deleteCosmeticItem(existing.id);
            return res.json({ ok: true, message: `Deleted ${existing.name}.` });
        } catch (e) {
            console.error('Admin delete cosmetic error:', e);
            return res.status(500).json({ error: 'Unable to delete that item.' });
        }
    });

    return router;
};
