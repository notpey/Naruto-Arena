const express = require('express');
const Joi = require('joi');
const gauntlet = require('../gauntlet');

module.exports = function(context) {
    const router = express.Router();
    const {
        usersCollection,
        matchesCollection,
        requireSession,
        normalizeUserProfile,
        normalizeGauntletState,
        normalizeGauntletRunState,
        teamSchema,
        assertTeamCanBeUsed,
        getGauntletActOneEventForRun,
        resolveGauntletActOneChoice,
        addGauntletRewardToRun,
        applyGauntletNodeClearToRun,
        userToMatch,
        buildGauntletBattleBotMatch,
        scheduleBattleBotTurn,
        buildMatchPayloadForUser,
        getMatchActive,
        pickGauntletRandomEntry,
    } = context;

    const gauntletRunStartSchema = Joi.object({
        team: teamSchema.optional(),
        seed: Joi.string().trim().min(1).max(128).optional(),
        startingScrollType: Joi.string().valid('heaven', 'earth').default('heaven'),
    });

    const gauntletNodeEnterSchema = Joi.object({
        nodeId: Joi.string().trim().min(1).max(32).required(),
        choiceIndex: Joi.number().integer().min(0).max(8).optional(),
    });

    const gauntletActOneChoiceSchema = Joi.object({
        choiceIndex: Joi.number().integer().min(0).max(8).required(),
    });

    const gauntletOfferAcceptSchema = Joi.object({
        offerType: Joi.string().valid('curse', 'relic').required(),
        offerId: Joi.string().trim().min(1).max(128).required(),
    });

    const gauntletMerchantBuySchema = Joi.object({
        itemType: Joi.string().valid('heaven_scroll', 'earth_scroll', 'heal', 'random_relic').required(),
    });

    const gauntletForgeScrollSchema = Joi.object({
        scrollType: Joi.string().valid('heaven', 'earth').required(),
    });

    router.get('/api/gauntlet/catalog', (req, res) => {
        return res.json({
            ok: true,
            relicScrolls: gauntlet.RELIC_SCROLLS,
            curses: gauntlet.CURSES,
            actOneEvents: gauntlet.ACT_ONE_EVENTS,
            actTwoEvents: gauntlet.ACT_TWO_EVENTS,
            enemyTeams: gauntlet.ENEMY_TEAMS,
        });
    });

    router.get('/api/gauntlet/map-preview', (req, res) => {
        const rawSeed = typeof req.query?.seed === 'string' ? req.query.seed.trim() : '';
        const rawStartingScroll =
            typeof req.query?.startingScrollType === 'string' ? req.query.startingScrollType.trim().toLowerCase() : '';
        const startingScrollType =
            rawStartingScroll === gauntlet.EXAM_SCROLL_TYPES.EARTH
                ? gauntlet.EXAM_SCROLL_TYPES.EARTH
                : gauntlet.EXAM_SCROLL_TYPES.HEAVEN;
        const seed = rawSeed || `preview-${Date.now()}`;
        const map = gauntlet.generateAct2Map({ seed, startingScrollType });

        return res.json({
            ok: true,
            map,
            invariants: {
                everyPathHasRestAndScrollSources: gauntlet
                    .findAllPaths(map)
                    .every((pathEntries) => gauntlet.pathHasRestAndScrollSource(pathEntries)),
            },
        });
    });

    router.post('/api/gauntlet/run/start', requireSession, async (req, res) => {
        try {
            const username = req.authUser.username;
            const { error: validationError, value } = gauntletRunStartSchema.validate(req.body || {});
            if (validationError) {
                return res.status(400).json({ error: 'A valid Gauntlet team is required.' });
            }
            if (userToMatch.has(username)) {
                return res.status(409).json({ error: 'Finish your current match before starting a Gauntlet run.' });
            }
            const existingMatch = await matchesCollection.findOne({
                'players.username': username,
                status: { $ne: 'ended' },
            });
            if (existingMatch) {
                return res.status(409).json({ error: 'Finish your current match before starting a Gauntlet run.' });
            }

            const user = await usersCollection.findOne({ username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            const profile = normalizeUserProfile(user);
            const gauntletState = normalizeGauntletState(profile.gauntlet);
            if (gauntletState.activeRun?.status === 'active') {
                return res.status(409).json({ error: 'A Gauntlet run is already active.' });
            }

            const team = Array.isArray(value.team) ? value.team : Array.isArray(user.savedTeamIndices) ? user.savedTeamIndices : [];
            const { error: teamError } = teamSchema.validate(team);
            if (teamError) {
                return res.status(400).json({ error: 'Save or provide a full selected team before starting Gauntlet.' });
            }
            try {
                await assertTeamCanBeUsed(profile, team, user.role);
            } catch (error) {
                return res.status(403).json({ error: error.message || 'Your Gauntlet team contains a locked character.' });
            }

            const seed = value.seed || `gauntlet-${Date.now()}`;
            const map = gauntlet.generateAct2Map({ seed, startingScrollType: value.startingScrollType });
            const activeRun = {
                ...gauntlet.createInitialRunState({
                    seed,
                    team,
                    startingScrollType: value.startingScrollType,
                    map,
                }),
            };
            profile.gauntlet = normalizeGauntletState({
                ...gauntletState,
                activeRun,
            });
            const normalizedProfile = normalizeUserProfile({ ...user, profile });
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { profile: normalizedProfile } }
            );

            return res.status(201).json({
                ok: true,
                run: normalizedProfile.gauntlet.activeRun,
                actOneEvent: getGauntletActOneEventForRun(normalizedProfile.gauntlet.activeRun),
                reachableNodeIds: gauntlet.getReachableNodeIds(normalizedProfile.gauntlet.activeRun),
            });
        } catch (error) {
            console.error('Gauntlet run start error:', error);
            return res.status(500).json({ error: 'Unable to start Gauntlet run.' });
        }
    });

    router.get('/api/gauntlet/run', requireSession, async (req, res) => {
        try {
            const user = await usersCollection.findOne(
                { username: req.authUser.username },
                { projection: { _id: 1, username: 1, createdAt: 1, profile: 1 } }
            );
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            const profile = normalizeUserProfile(user);
            const activeRun = normalizeGauntletState(profile.gauntlet).activeRun;
            return res.json({
                ok: true,
                run: activeRun,
                actOneEvent: activeRun ? getGauntletActOneEventForRun(activeRun) : null,
                reachableNodeIds: activeRun ? gauntlet.getReachableNodeIds(activeRun) : [],
            });
        } catch (error) {
            console.error('Gauntlet run load error:', error);
            return res.status(500).json({ error: 'Unable to load Gauntlet run.' });
        }
    });

    router.post('/api/gauntlet/run/abandon', requireSession, async (req, res) => {
        try {
            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            const profile = normalizeUserProfile(user);
            const gauntletState = normalizeGauntletState(profile.gauntlet);
            const activeRun = gauntletState.activeRun;
            if (!activeRun) {
                return res.json({ ok: true, run: null });
            }
            if (activeRun.pendingBattle?.matchId) {
                const match = await getMatchActive(activeRun.pendingBattle.matchId);
                if (match && match.status !== 'ended') {
                    return res.status(409).json({ error: 'Surrender the active Gauntlet battle before abandoning the run.' });
                }
            }
            profile.gauntlet = normalizeGauntletState({
                ...gauntletState,
                activeRun: null,
                abandonedRuns: gauntletState.abandonedRuns + 1,
            });
            const normalizedProfile = normalizeUserProfile({ ...user, profile });
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { profile: normalizedProfile } }
            );
            return res.json({ ok: true, run: null });
        } catch (error) {
            console.error('Gauntlet run abandon error:', error);
            return res.status(500).json({ error: 'Unable to abandon Gauntlet run.' });
        }
    });

    router.post('/api/gauntlet/run/act1/choose', requireSession, async (req, res) => {
        try {
            const { error: validationError, value } = gauntletActOneChoiceSchema.validate(req.body || {});
            if (validationError) {
                return res.status(400).json({ error: 'A valid Written Test choice is required.' });
            }
            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            const profile = normalizeUserProfile(user);
            const gauntletState = normalizeGauntletState(profile.gauntlet);
            const activeRun = normalizeGauntletRunState(gauntletState.activeRun);
            if (!activeRun || activeRun.status !== 'active') {
                return res.status(400).json({ error: 'Start a Gauntlet run first.' });
            }
            if (activeRun.currentAct !== 1) {
                return res.status(409).json({ error: 'The Written Test is already complete.' });
            }
            let nextRun;
            try {
                nextRun = resolveGauntletActOneChoice(activeRun, value.choiceIndex);
            } catch (error) {
                return res.status(400).json({ error: error.message || 'A valid Written Test choice is required.' });
            }
            profile.gauntlet = normalizeGauntletState({
                ...gauntletState,
                activeRun: nextRun,
            });
            const normalizedProfile = normalizeUserProfile({ ...user, profile });
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { profile: normalizedProfile } }
            );
            const run = normalizedProfile.gauntlet.activeRun;
            return res.json({
                ok: true,
                run,
                actOneEvent: getGauntletActOneEventForRun(run),
                nodeResult: nextRun.lastNodeResult,
                reachableNodeIds: gauntlet.getReachableNodeIds(run),
            });
        } catch (error) {
            console.error('Gauntlet Act 1 choice error:', error);
            return res.status(500).json({ error: 'Unable to resolve Written Test choice.' });
        }
    });

    router.post('/api/gauntlet/run/offer/accept', requireSession, async (req, res) => {
        try {
            const { error: validationError, value } = gauntletOfferAcceptSchema.validate(req.body || {});
            if (validationError) {
                return res.status(400).json({ error: 'A valid Gauntlet offer is required.' });
            }
            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            const profile = normalizeUserProfile(user);
            const gauntletState = normalizeGauntletState(profile.gauntlet);
            const activeRun = normalizeGauntletRunState(gauntletState.activeRun);
            if (!activeRun || activeRun.status !== 'active') {
                return res.status(400).json({ error: 'Start a Gauntlet run first.' });
            }
            const offerIndex = (activeRun.pendingOffers || []).findIndex(
                (offer) => offer.type === value.offerType && offer.id === value.offerId
            );
            if (offerIndex < 0 || value.offerType !== 'curse' || !gauntlet.getCurseById(value.offerId)) {
                return res.status(404).json({ error: 'Gauntlet offer not found.' });
            }
            activeRun.pendingOffers.splice(offerIndex, 1);
            activeRun.relics = Array.from(new Set([...(activeRun.relics || []), value.offerId]));
            activeRun.lastNodeResult = {
                nodeId: activeRun.currentNodeId || null,
                nodeType: 'offer_accept',
                clearedAt: new Date(),
                reward: { relics: [value.offerId] },
            };
            profile.gauntlet = normalizeGauntletState({
                ...gauntletState,
                activeRun,
            });
            const normalizedProfile = normalizeUserProfile({ ...user, profile });
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { profile: normalizedProfile } }
            );
            return res.json({
                ok: true,
                run: normalizedProfile.gauntlet.activeRun,
                acceptedOffer: { type: value.offerType, id: value.offerId },
            });
        } catch (error) {
            console.error('Gauntlet offer accept error:', error);
            return res.status(500).json({ error: 'Unable to accept Gauntlet offer.' });
        }
    });

    router.post('/api/gauntlet/run/merchant/buy', requireSession, async (req, res) => {
        try {
            const { error: validationError, value } = gauntletMerchantBuySchema.validate(req.body || {});
            if (validationError) {
                return res.status(400).json({ error: 'A valid merchant item is required.' });
            }
            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            const profile = normalizeUserProfile(user);
            const gauntletState = normalizeGauntletState(profile.gauntlet);
            const activeRun = normalizeGauntletRunState(gauntletState.activeRun);
            if (!activeRun || activeRun.status !== 'active') {
                return res.status(400).json({ error: 'Start a Gauntlet run first.' });
            }
            const currentNode = gauntlet.getNodeById(activeRun.map, activeRun.currentNodeId);
            if (!currentNode || currentNode.type !== gauntlet.NODE_TYPES.MERCHANT) {
                return res.status(403).json({ error: 'You are not at a Merchant node.' });
            }
            const prices = {
                heaven_scroll: activeRun.relics.includes('scroll-hoarder') ? 70 : 100,
                earth_scroll: activeRun.relics.includes('scroll-hoarder') ? 70 : 100,
                heal: 55,
                random_relic: 120,
            };
            const price = prices[value.itemType];
            if ((Number(activeRun.ryo) || 0) < price) {
                return res.status(400).json({ error: 'Not enough Ryo.' });
            }
            activeRun.ryo -= price;
            const reward = {
                ryo: 0,
                scrollFragments: 0,
                heavenScrolls: value.itemType === 'heaven_scroll' ? 1 : 0,
                earthScrolls: value.itemType === 'earth_scroll' ? 1 : 0,
                relics: [],
            };
            if (value.itemType === 'heal') {
                activeRun.teamHp = activeRun.teamHp.map((hp) => Math.min(100, Math.max(1, Number(hp) || 1) + 30));
            }
            if (value.itemType === 'random_relic') {
                const rng = gauntlet.createSeededRng(`${activeRun.seed}:${activeRun.currentNodeId}:merchant:${activeRun.relics.length}`);
                const relic = pickGauntletRandomEntry(rng, gauntlet.RELIC_SCROLLS);
                if (relic?.id) reward.relics.push(relic.id);
            }
            addGauntletRewardToRun(activeRun, reward);
            activeRun.lastNodeResult = {
                nodeId: activeRun.currentNodeId,
                nodeType: 'merchant_purchase',
                clearedAt: new Date(),
                reward: { ...reward, ryo: -price, itemType: value.itemType },
            };
            profile.gauntlet = normalizeGauntletState({
                ...gauntletState,
                activeRun,
            });
            const normalizedProfile = normalizeUserProfile({ ...user, profile });
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { profile: normalizedProfile } }
            );
            return res.json({
                ok: true,
                run: normalizedProfile.gauntlet.activeRun,
                purchase: activeRun.lastNodeResult.reward,
            });
        } catch (error) {
            console.error('Gauntlet merchant purchase error:', error);
            return res.status(500).json({ error: 'Unable to complete merchant purchase.' });
        }
    });

    router.post('/api/gauntlet/run/fragments/forge', requireSession, async (req, res) => {
        try {
            const { error: validationError, value } = gauntletForgeScrollSchema.validate(req.body || {});
            if (validationError) {
                return res.status(400).json({ error: 'Choose a Heaven or Earth Scroll to forge.' });
            }
            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            const profile = normalizeUserProfile(user);
            const gauntletState = normalizeGauntletState(profile.gauntlet);
            const activeRun = normalizeGauntletRunState(gauntletState.activeRun);
            if (!activeRun || activeRun.status !== 'active') {
                return res.status(400).json({ error: 'Start a Gauntlet run first.' });
            }
            const fragmentCount = Math.max(0, Math.round(Number(activeRun.scrollFragments) || 0));
            if (fragmentCount < 3) {
                return res.status(400).json({ error: 'You need 3 Scroll Fragments to forge an exam scroll.' });
            }
            activeRun.scrollFragments = fragmentCount - 3;
            if (value.scrollType === gauntlet.EXAM_SCROLL_TYPES.EARTH) {
                activeRun.earthScrolls = Math.max(0, Number(activeRun.earthScrolls) || 0) + 1;
            } else {
                activeRun.heavenScrolls = Math.max(0, Number(activeRun.heavenScrolls) || 0) + 1;
            }
            activeRun.lastNodeResult = {
                nodeId: activeRun.currentNodeId || null,
                nodeType: 'fragment_forge',
                clearedAt: new Date(),
                reward: {
                    scrollFragments: -3,
                    heavenScrolls: value.scrollType === gauntlet.EXAM_SCROLL_TYPES.HEAVEN ? 1 : 0,
                    earthScrolls: value.scrollType === gauntlet.EXAM_SCROLL_TYPES.EARTH ? 1 : 0,
                },
            };
            profile.gauntlet = normalizeGauntletState({
                ...gauntletState,
                activeRun,
            });
            const normalizedProfile = normalizeUserProfile({ ...user, profile });
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { profile: normalizedProfile } }
            );
            const run = normalizedProfile.gauntlet.activeRun;
            return res.json({
                ok: true,
                run,
                nodeResult: activeRun.lastNodeResult,
                reachableNodeIds: gauntlet.getReachableNodeIds(run),
            });
        } catch (error) {
            console.error('Gauntlet fragment forge error:', error);
            return res.status(500).json({ error: 'Unable to forge an exam scroll.' });
        }
    });

    router.post('/api/gauntlet/run/node/enter', requireSession, async (req, res) => {
        try {
            const username = req.authUser.username;
            const { error: validationError, value } = gauntletNodeEnterSchema.validate(req.body || {});
            if (validationError) {
                return res.status(400).json({ error: 'A Gauntlet node is required.' });
            }
            const user = await usersCollection.findOne({ username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            const profile = normalizeUserProfile(user);
            const gauntletState = normalizeGauntletState(profile.gauntlet);
            const activeRun = normalizeGauntletRunState(gauntletState.activeRun);
            if (!activeRun || activeRun.status !== 'active') {
                return res.status(400).json({ error: 'Start a Gauntlet run first.' });
            }
            if (activeRun.pendingBattle?.matchId) {
                return res.status(409).json({ error: 'Finish the current Gauntlet battle before entering another node.' });
            }
            const node = gauntlet.getNodeById(activeRun.map, value.nodeId);
            if (!node) {
                return res.status(404).json({ error: 'Gauntlet node not found.' });
            }
            const reachableNodeIds = gauntlet.getReachableNodeIds(activeRun);
            if (!reachableNodeIds.includes(node.id)) {
                return res.status(403).json({ error: 'That Gauntlet node is not reachable.' });
            }
            if (!gauntlet.canEnterNode(activeRun, node)) {
                return res.status(403).json({ error: 'You need both Heaven and Earth Scrolls to enter an exit node.' });
            }
            if (node.type === gauntlet.NODE_TYPES.EVENT) {
                const event = gauntlet.getEventById(node.content?.eventId);
                const choiceIndex = Number.isInteger(value.choiceIndex) ? value.choiceIndex : 0;
                if (!event || !Array.isArray(event.choices) || !event.choices[choiceIndex]) {
                    return res.status(400).json({ error: 'A valid event choice is required.' });
                }
            }

            if (node.type === gauntlet.NODE_TYPES.BATTLE || node.type === gauntlet.NODE_TYPES.ELITE_BATTLE) {
                if (userToMatch.has(username)) {
                    return res.status(409).json({ error: 'Finish your current match before entering a Gauntlet battle.' });
                }
                const existingMatch = await matchesCollection.findOne({
                    'players.username': username,
                    status: { $ne: 'ended' },
                });
                if (existingMatch) {
                    return res.status(409).json({ error: 'Finish your current match before entering a Gauntlet battle.' });
                }
                const matchDocument = await buildGauntletBattleBotMatch({ username, runState: activeRun, node });
                activeRun.pendingBattle = { nodeId: node.id, matchId: matchDocument.matchId };
                activeRun.currentNodeId = node.id;
                profile.gauntlet = normalizeGauntletState({
                    ...gauntletState,
                    activeRun,
                });
                const normalizedProfile = normalizeUserProfile({ ...user, profile });
                await usersCollection.updateOne(
                    { _id: user._id },
                    { $set: { profile: normalizedProfile } }
                );
                userToMatch.set(username, {
                    matchId: matchDocument.matchId,
                    opponent: matchDocument.gauntletMatch?.enemyDisplayName || 'Forest Rival Team',
                });
                scheduleBattleBotTurn(matchDocument);
                return res.json({
                    ok: true,
                    battleStarted: true,
                    run: normalizedProfile.gauntlet.activeRun,
                    match: buildMatchPayloadForUser(matchDocument, username),
                });
            }

            const nextRun = applyGauntletNodeClearToRun(activeRun, node, {
                choiceIndex: Number.isInteger(value.choiceIndex) ? value.choiceIndex : 0,
            });
            profile.gauntlet = normalizeGauntletState({
                ...gauntletState,
                activeRun: nextRun.status === 'active' ? nextRun : null,
                completedRuns: gauntletState.completedRuns + (nextRun.status === 'won' ? 1 : 0),
                wins: gauntletState.wins + (nextRun.status === 'won' ? 1 : 0),
            });
            const normalizedProfile = normalizeUserProfile({ ...user, profile });
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { profile: normalizedProfile } }
            );
            const run = normalizedProfile.gauntlet.activeRun;
            return res.json({
                ok: true,
                battleStarted: false,
                run,
                nodeResult: nextRun.lastNodeResult,
                reachableNodeIds: run ? gauntlet.getReachableNodeIds(run) : [],
            });
        } catch (error) {
            console.error('Gauntlet node enter error:', error);
            return res.status(500).json({ error: 'Unable to enter Gauntlet node.' });
        }
    });

    return router;
};
