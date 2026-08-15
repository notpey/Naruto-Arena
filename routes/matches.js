const express = require('express');
const Joi = require('joi');
const battleLogic = require('../battleLogic');

module.exports = function(context) {
    const router = express.Router();
    const {
        usersCollection,
        matchesCollection,
        requireSession,
        normalizeUserProfile,
        teamSchema,
        assertTeamCanBeUsed,
        matchJoinSchema,
        userToMatch,
        getMatchActive,
        updateMatchActive,
        persistMatchState,
        ensureMatchTurnData,
        ensureMatchEconomy,
        ensurePendingTurnState,
        ensureBoardState,
        autoAdvanceTurnIfExpired,
        scheduleBattleBotTurn,
        buildMatchPayloadForUser,
        getTurnDurationMsForUser,
        makeEmptyPendingTurn,
        findQueuedEntry,
        removeQueuedEntry,
        maybeCreateBattleBotMatch,
        scheduleBattleBotQueueCheck,
        clearScheduledBattleBotQueueCheck,
        GAME_BOT_DISPLAY_NAME,
        getPlayerDisplayName,
        dequeuePrivateOpponent,
        dequeueOpponent,
        buildMatch,
        enqueuePlayer,
        resetPendingChakraExchanges,
        applyMatchCompletionRewards,
        quickMatches,
        broadcastMatchState,
        getPendingTurn,
        hasPendingTurnStartChoice,
        finalizeTurn,
        queueSkillForActorSlot,
        resolveTurnStartChoiceForUser,
        cancelQueuedSkillForActorSlot,
        reorderQueuedSkills,
        chakraTypes,
        adjustRandomAssignment,
        exchangeChakra,
        characterService,
    } = context;

    const getCharactersList = () =>
        characterService ? characterService.getCharacters() : [];

    // Save preferred team
    router.post('/api/team/save', requireSession, async (req, res) => {
        const { error: validationError, value } = teamSchema.validate(req.body?.team);
        if (validationError) {
            return res.status(400).json({ error: 'Invalid team selection.' });
        }
        const user = await usersCollection.findOne({ username: req.authUser.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const profile = normalizeUserProfile(user);
        try {
            await assertTeamCanBeUsed(profile, value, user.role);
        } catch (error) {
            return res.status(403).json({ error: error.message || 'Character is locked.' });
        }
        await usersCollection.updateOne(
            { _id: user._id },
            {
                $set: {
                    savedTeamIndices: value,
                    profile,
                },
            }
        );
        return res.json({ ok: true });
    });

    router.post('/api/match/join', requireSession, async (req, res) => {
        try {
            const username = req.authUser.username;
            const { error: validationError, value } = matchJoinSchema.validate(req.body || {});
            if (validationError) {
                return res.status(400).json({ error: 'Team selection required to join match.' });
            }
            const team = value.team;
            const mode = value.mode;
            const targetUsername = typeof value.targetUsername === 'string' ? value.targetUsername.trim() : '';
            if (mode === 'private') {
                if (!targetUsername) {
                    return res.status(400).json({ error: 'Opponent username is required for a private game.' });
                }
                if (targetUsername.toLowerCase() === username.toLowerCase()) {
                    return res.status(400).json({ error: 'You cannot start a private game with yourself.' });
                }
            }

            // Already matched
            if (userToMatch.has(username)) {
                const { matchId, opponent } = userToMatch.get(username);
                const existing = await getMatchActive(matchId);
                if (!existing || existing.status === 'ended') {
                    userToMatch.delete(username);
                } else {
                    const hydratedTurn = await ensureMatchTurnData(existing);
                    const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
                    const hydratedPending = await ensurePendingTurnState(hydratedEcon);
                    const hydrated = await autoAdvanceTurnIfExpired(hydratedPending);
                    if (!hydrated || hydrated.status === 'ended') {
                        userToMatch.delete(username);
                    } else {
                        scheduleBattleBotTurn(hydrated);
                        const safePayload = buildMatchPayloadForUser(hydrated, username);
                        return res.json({
                            ok: true,
                            matchFound: true,
                            matchId,
                            mode: existing.mode || 'quick',
                            opponent,
                            matchStartsAt: existing.matchStartsAt || existing.createdAt || null,
                            matchReady:
                                !existing.matchStartsAt ||
                                new Date(existing.matchStartsAt).getTime() <= Date.now(),
                            currentTurn: hydrated?.currentTurn || null,
                            turnOrder: hydrated?.turnOrder || null,
                            turnExpiresAt: hydrated?.turnExpiresAt || null,
                            turnDurationMs: getTurnDurationMsForUser(hydrated, hydrated?.currentTurn),
                            chakraPools: safePayload?.chakraPools || null,
                            lastChakraGain: safePayload?.lastChakraGain || null,
                            pendingTurn: safePayload?.pendingTurn || makeEmptyPendingTurn(),
                        });
                    }
                }
            }

            // If already stored in DB from earlier pairing, surface it
            const existingMatch = await matchesCollection.findOne({
                'players.username': username,
                status: { $ne: 'ended' },
            });
            if (existingMatch) {
                const hydratedTurn = await ensureMatchTurnData(existingMatch);
                const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
                const hydratedPending = await ensurePendingTurnState(hydratedEcon);
                const hydrated = await autoAdvanceTurnIfExpired(hydratedPending);
                if (!hydrated || hydrated.status === 'ended') {
                    return res.json({ ok: true, matchFound: false });
                }
                const opponentEntry = hydrated.players.find((p) => p.username !== username);
                const opponent = opponentEntry ? getPlayerDisplayName(opponentEntry) : null;
                userToMatch.set(username, { matchId: hydrated.matchId, opponent });
                scheduleBattleBotTurn(hydrated);
                const safePayload = buildMatchPayloadForUser(hydrated, username);
                return res.json({
                    ok: true,
                    matchFound: true,
                    matchId: hydrated.matchId,
                    mode: hydrated.mode || 'quick',
                    opponent,
                    matchStartsAt: hydrated.matchStartsAt || hydrated.createdAt || null,
                    matchReady:
                        !hydrated.matchStartsAt ||
                        new Date(hydrated.matchStartsAt).getTime() <= Date.now(),
                    currentTurn: hydrated?.currentTurn || null,
                    turnOrder: hydrated?.turnOrder || null,
                    turnExpiresAt: hydrated?.turnExpiresAt || null,
                    turnDurationMs: getTurnDurationMsForUser(hydrated, hydrated?.currentTurn),
                    chakraPools: safePayload?.chakraPools || null,
                    lastChakraGain: safePayload?.lastChakraGain || null,
                    pendingTurn: safePayload?.pendingTurn || makeEmptyPendingTurn(),
                });
            }

            const user = await usersCollection.findOne({ username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            const profile = normalizeUserProfile(user);
            try {
                await assertTeamCanBeUsed(profile, team, user.role);
            } catch (error) {
                return res.status(403).json({ error: error.message || 'Team contains locked character.' });
            }

            if (mode === 'ladder') {
                const userLevel = Number(profile?.ladder?.level) || 1;
                if (userLevel < 6) {
                    return res.status(403).json({
                        error: 'Ladder matches require Level 6 (Genin) or higher. Play Quick Games to level up!',
                    });
                }
            }

            const opponent = mode === 'private' ? dequeuePrivateOpponent(username, targetUsername) : dequeueOpponent(username, mode);
            if (!opponent) {
                enqueuePlayer({
                    username,
                    team,
                    mode,
                    targetUsername,
                    joinedAt: Date.now(),
                    userProfile: profile,
                    role: user.role,
                });
                scheduleBattleBotQueueCheck({ username, mode, userProfile: profile });
                return res.json({ ok: true, matchFound: false });
            }

            const aliveLookup = {
                [username]: team.length,
                [opponent.username]: opponent.team.length,
            };
            const built = buildMatch([username, opponent.username], aliveLookup);
            const playerDocs = [
                {
                    username,
                    team,
                    aliveCount: aliveLookup[username],
                },
                {
                    username: opponent.username,
                    team: opponent.team,
                    aliveCount: aliveLookup[opponent.username],
                },
            ];
            const board = battleLogic.buildInitialBoard(playerDocs);
            const matchDocument = {
                matchId: built.matchId,
                mode,
                status: 'active',
                createdAt: new Date(),
                matchStartsAt: built.matchStartsAt,
                chakraPools: built.chakraPools,
                economy: built.economy,
                pendingTurns: built.pendingTurns,
                currentTurn: built.currentTurn,
                turnStartedAt: built.turnStartedAt,
                turnOrder: built.turnOrder,
                turnExpiresAt: built.turnExpiresAt,
                board,
                players: playerDocs,
            };
            await matchesCollection.insertOne(matchDocument);
            const safePayload = buildMatchPayloadForUser(matchDocument, username);
            scheduleBattleBotTurn(matchDocument);
            return res.json({
                ok: true,
                matchFound: true,
                matchId: matchDocument.matchId,
                mode: matchDocument.mode || 'quick',
                opponent: opponent.username,
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
            console.error('Match join error:', error);
            return res.status(500).json({ error: 'Internal server error.' });
        }
    });

    router.get('/api/match/status', requireSession, async (req, res) => {
        try {
            const username = req.authUser.username;
            const user = await usersCollection.findOne(
                { username },
                { projection: { _id: 1, username: 1, createdAt: 1, profile: 1 } }
            );
            const normalizedProfile = user ? normalizeUserProfile(user) : null;
            const mapping = userToMatch.get(username);
            if (mapping) {
                const match = await getMatchActive(mapping.matchId);
                if (!match || match.status === 'ended') {
                    userToMatch.delete(username);
                    return res.json({ ok: true, matchFound: false });
                }
                const hydratedTurn = await ensureMatchTurnData(match);
                const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
                const hydratedPending = await ensurePendingTurnState(hydratedEcon);
                const hydratedBoard = await ensureBoardState(hydratedPending);
                const hydrated = await autoAdvanceTurnIfExpired(hydratedBoard);
                if (!hydrated || hydrated.status === 'ended') {
                    userToMatch.delete(username);
                    return res.json({ ok: true, matchFound: false });
                }
                scheduleBattleBotTurn(hydrated);
                const safePayload = buildMatchPayloadForUser(hydrated, username);
                return res.json({
                    ok: true,
                    matchFound: true,
                    matchId: mapping.matchId,
                    mode: hydrated.mode || 'quick',
                    opponent: mapping.opponent,
                    matchStartsAt: hydrated.matchStartsAt || hydrated.createdAt || null,
                    matchReady:
                        !hydrated.matchStartsAt ||
                        new Date(hydrated.matchStartsAt).getTime() <= Date.now(),
                    currentTurn: hydrated?.currentTurn || null,
                    turnOrder: hydrated?.turnOrder || null,
                    turnExpiresAt: hydrated?.turnExpiresAt || null,
                    turnDurationMs: getTurnDurationMsForUser(hydrated, hydrated?.currentTurn),
                    board: safePayload?.board || null,
                    chakraPools: safePayload?.chakraPools || null,
                    lastChakraGain: safePayload?.lastChakraGain || null,
                    pendingTurn: safePayload?.pendingTurn || makeEmptyPendingTurn(),
                });
            }

            const queuedEntry = findQueuedEntry(username);
            const botMatch = await maybeCreateBattleBotMatch({
                username,
                mode: queuedEntry?.mode || 'quick',
                userProfile: normalizedProfile,
            });
            if (botMatch) {
                scheduleBattleBotTurn(botMatch);
                const safePayload = buildMatchPayloadForUser(botMatch, username);
                return res.json({
                    ok: true,
                    matchFound: true,
                    matchId: botMatch.matchId,
                    mode: botMatch.mode || 'quick',
                    opponent: GAME_BOT_DISPLAY_NAME,
                    matchStartsAt: botMatch.matchStartsAt || botMatch.createdAt || null,
                    matchReady:
                        !botMatch.matchStartsAt ||
                        new Date(botMatch.matchStartsAt).getTime() <= Date.now(),
                    currentTurn: botMatch.currentTurn || null,
                    turnOrder: botMatch.turnOrder || null,
                    turnExpiresAt: botMatch.turnExpiresAt || null,
                    turnDurationMs: getTurnDurationMsForUser(botMatch, botMatch?.currentTurn),
                    chakraPools: safePayload?.chakraPools || null,
                    lastChakraGain: safePayload?.lastChakraGain || null,
                    pendingTurn: safePayload?.pendingTurn || makeEmptyPendingTurn(),
                });
            }
            if (queuedEntry?.entry) {
                scheduleBattleBotQueueCheck({
                    username,
                    mode: queuedEntry.mode || 'quick',
                    userProfile: normalizedProfile,
                });
            }

            // Fallback: lookup persisted match
            const match = await matchesCollection.findOne({
                'players.username': username,
                status: { $ne: 'ended' },
            });
            if (!match) {
                return res.json({ ok: true, matchFound: false });
            }
            const hydratedTurn = await ensureMatchTurnData(match);
            const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
            const hydratedPending = await ensurePendingTurnState(hydratedEcon);
            const hydratedBoard = await ensureBoardState(hydratedPending);
            const hydrated = await autoAdvanceTurnIfExpired(hydratedBoard);
            if (!hydrated || hydrated.status === 'ended') {
                return res.json({ ok: true, matchFound: false });
            }
            const opponentEntry = hydrated.players.find((p) => p.username !== username);
            const opponent = opponentEntry ? getPlayerDisplayName(opponentEntry) : null;
            userToMatch.set(username, { matchId: hydrated.matchId, opponent });
            scheduleBattleBotTurn(hydrated);
            const safePayload = buildMatchPayloadForUser(hydrated, username);
            return res.json({
                ok: true,
                matchFound: true,
                matchId: hydrated.matchId,
                mode: hydrated.mode || 'quick',
                opponent,
                matchStartsAt: hydrated.matchStartsAt || hydrated.createdAt || null,
                matchReady:
                    !hydrated.matchStartsAt ||
                    new Date(hydrated.matchStartsAt).getTime() <= Date.now(),
                currentTurn: hydrated?.currentTurn || null,
                turnOrder: hydrated?.turnOrder || null,
                turnExpiresAt: hydrated?.turnExpiresAt || null,
                turnDurationMs: getTurnDurationMsForUser(hydrated, hydrated?.currentTurn),
                board: safePayload?.board || null,
                chakraPools: safePayload?.chakraPools || null,
                lastChakraGain: safePayload?.lastChakraGain || null,
                pendingTurn: safePayload?.pendingTurn || makeEmptyPendingTurn(),
            });
        } catch (error) {
            console.error('Match status error:', error);
            return res.status(500).json({ error: 'Internal server error.' });
        }
    });

    router.post('/api/match/cancel', requireSession, (req, res) => {
        const username = req.authUser.username;
        clearScheduledBattleBotQueueCheck(username);
        removeQueuedEntry(username);
        userToMatch.delete(username);
        return res.json({ ok: true });
    });

    router.get('/api/match/:matchId', requireSession, async (req, res) => {
        const { matchId } = req.params;
        const match = await getMatchActive(matchId);
        if (!match) {
            return res.status(404).json({ error: 'Match not found.' });
        }
        const hydratedTurn = await ensureMatchTurnData(match);
        const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
        const hydratedPending = await ensurePendingTurnState(hydratedEcon);
        const hydratedBoard = await ensureBoardState(hydratedPending);
        const hydrated = await autoAdvanceTurnIfExpired(hydratedBoard);
        if (!hydrated) {
            return res.status(404).json({ error: 'Match not found.' });
        }
        const playerEntry = hydrated.players.find((p) => p.username === req.authUser.username);
        if (!playerEntry) {
            return res.status(403).json({ error: 'Not part of this match.' });
        }
        if (String(req.query?.resetPendingExchange || '') === '1') {
            const reset = resetPendingChakraExchanges({
                match: hydrated,
                username: req.authUser.username,
            });
            if (reset) {
                await persistMatchState(hydrated, {
                    chakraPools: hydrated.chakraPools,
                    pendingTurns: hydrated.pendingTurns,
                });
                await broadcastMatchState(hydrated);
            }
        }
        scheduleBattleBotTurn(hydrated);
        return res.json(buildMatchPayloadForUser(hydrated, req.authUser.username));
    });

    router.post('/api/match/:matchId/surrender', requireSession, async (req, res) => {
        const { matchId } = req.params;
        const match = await getMatchActive(matchId);
        if (!match) {
            return res.status(404).json({ error: 'Match not found.' });
        }
        const username = req.authUser.username;
        const playerEntry = match.players.find((p) => p.username === username);
        if (!playerEntry) {
            return res.status(403).json({ error: 'Not part of this match.' });
        }
        if (match.status === 'ended') {
            return res.json({
                ok: true,
                mode: match.mode || 'quick',
                status: 'ended',
                winner: match.winner || null,
                surrenderedBy: match.surrenderedBy || null,
                endReason: match.endReason || null,
                endedAt: match.endedAt || null,
                ladderResult: match.ladderResults?.[username] || null,
                missionResult: match.missionResults?.[username] || null,
                storyResult: match.storyResults?.[username] || null,
                gauntletResult: match.gauntletResults?.[username] || null,
            });
        }
        const opponentEntry = match.players.find((p) => p.username !== username);
        const endedAt = new Date();
        const ladderResults = await applyMatchCompletionRewards(
            match,
            opponentEntry ? opponentEntry.username : null,
            endedAt
        );
        await updateMatchActive(matchId,
            {
                $set: {
                    mode: match.mode || 'quick',
                    status: 'ended',
                    winner: opponentEntry ? opponentEntry.username : null,
                    surrenderedBy: username,
                    endReason: 'surrender',
                    endedAt,
                    currentTurn: null,
                    turnExpiresAt: null,
                    ladderResults: ladderResults || null,
                    missionResults: match.missionResults || null,
                    storyResults: match.storyResults || null,
                    gauntletResults: match.gauntletResults || null,
                },
            }
        );
        quickMatches.delete(matchId);
        (match.players || []).forEach((player) => userToMatch.delete(player.username));
        await broadcastMatchState(matchId);
        return res.json({
            ok: true,
            mode: match.mode || 'quick',
            status: 'ended',
            surrenderedBy: username,
            winner: opponentEntry ? opponentEntry.username : null,
            endReason: 'surrender',
            endedAt,
            ladderResult: ladderResults?.[username] || null,
            missionResult: match.missionResults?.[username] || null,
            storyResult: match.storyResults?.[username] || null,
            gauntletResult: match.gauntletResults?.[username] || null,
        });
    });

    router.post('/api/match/:matchId/turn/end', requireSession, async (req, res) => {
        try {
            const { matchId } = req.params;
            const match = await getMatchActive(matchId);
            if (!match) {
                return res.status(404).json({ error: 'Match not found.' });
            }
            const hydratedTurn = await ensureMatchTurnData(match);
            const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
            const hydratedPending = await ensurePendingTurnState(hydratedEcon);
            const hydratedBoard = await ensureBoardState(hydratedPending);
            const hydrated = await autoAdvanceTurnIfExpired(hydratedBoard);
            if (!hydrated) {
                return res.status(404).json({ error: 'Match not found.' });
            }
            if (hydrated.status === 'ended') {
                await broadcastMatchState(hydrated);
                return res.status(409).json({ error: 'Match already ended.' });
            }

            const username = req.authUser.username;
            if (hydrated.currentTurn !== username) {
                await broadcastMatchState(hydrated);
                return res.status(403).json({ error: 'Not your turn.' });
            }
            const pendingTurn = getPendingTurn(hydrated, username);
            if (hasPendingTurnStartChoice(pendingTurn)) {
                return res.status(400).json({ error: 'Resolve the Doctor\'s Bag choice first.' });
            }
            if ((pendingTurn.unresolvedRandom || 0) > 0) {
                return res.status(400).json({ error: 'Resolve random chakra before ending turn.' });
            }

            const updated = await finalizeTurn(hydrated, username);
            await broadcastMatchState(updated || hydrated);
            scheduleBattleBotTurn(updated || hydrated);

            return res.json(buildMatchPayloadForUser(updated, username));
        } catch (error) {
            console.error('Failed to end turn:', error);
            return res.status(500).json({
                error: 'Failed to end turn.',
                details: String(error?.stack || error?.message || error),
            });
        }
    });

    router.post('/api/match/:matchId/skill/queue', requireSession, async (req, res) => {
        const { matchId } = req.params;
        const actorSlot = Number.parseInt(req.body?.actorSlot, 10);
        const skillIndex = Number.parseInt(req.body?.skillIndex, 10);
        const targetSelection = req.body?.targetSelection;
        const classChoice = req.body?.classChoice;
        if (!Number.isInteger(actorSlot) || actorSlot < 0 || !Number.isInteger(skillIndex) || skillIndex < 0) {
            return res.status(400).json({ error: 'actorSlot and skillIndex are required.' });
        }
        const match = await getMatchActive(matchId);
        if (!match) {
            return res.status(404).json({ error: 'Match not found.' });
        }
        const hydratedTurn = await ensureMatchTurnData(match);
        const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
        const hydratedPending = await ensurePendingTurnState(hydratedEcon);
        const hydratedBoard = await ensureBoardState(hydratedPending);
        const hydrated = await autoAdvanceTurnIfExpired(hydratedBoard);
        if (!hydrated) {
            return res.status(404).json({ error: 'Match not found.' });
        }
        if (hydrated.status === 'ended') {
            return res.status(409).json({ error: 'Match already ended.' });
        }
        const username = req.authUser.username;
        const playerEntry = hydrated.players.find((p) => p.username === username);
        if (!playerEntry) {
            return res.status(403).json({ error: 'Not part of this match.' });
        }
        if (hydrated.currentTurn !== username) {
            return res.status(403).json({ error: 'Not your turn.' });
        }
        if (hasPendingTurnStartChoice(getPendingTurn(hydrated, username))) {
            return res.status(400).json({ error: 'Resolve the Doctor\'s Bag choice first.' });
        }
        const charactersData = getCharactersList();
        const options = battleLogic.computeTargetOptions({
            match: hydrated,
            actingUsername: username,
            actorSlot,
            skillIndex,
            characters: charactersData,
        });
        if (!options.targetType || options.mode === 'unknown') {
            return res.status(400).json({ error: 'Skill target could not be resolved.' });
        }
        if (!battleLogic.validateTargetSelection(options, targetSelection)) {
            return res.status(400).json({ error: 'Invalid target selection.' });
        }
        try {
            queueSkillForActorSlot({
                match: hydrated,
                username,
                actorSlot,
                skillIndex,
                targetSelection,
                classChoice,
            });
            await persistMatchState(hydrated, {
                chakraPools: hydrated.chakraPools,
                pendingTurns: hydrated.pendingTurns,
            });
            await broadcastMatchState(hydrated);
            const safePayload = buildMatchPayloadForUser(hydrated, username);
            return res.json({
                ok: true,
                chakraPools: safePayload?.chakraPools || null,
                pendingTurn: safePayload?.pendingTurn || makeEmptyPendingTurn(),
                currentTurn: hydrated.currentTurn,
                turnExpiresAt: hydrated.turnExpiresAt,
                turnDurationMs: getTurnDurationMsForUser(hydrated, hydrated?.currentTurn),
            });
        } catch (error) {
            return res.status(400).json({ error: error.message || 'Failed to queue skill.' });
        }
    });

    router.post('/api/match/:matchId/turn/start-choice', requireSession, async (req, res) => {
        try {
            const { matchId } = req.params;
            const choiceKey =
                typeof req.body?.choiceKey === 'string' ? req.body.choiceKey.trim().toLowerCase() : '';
            if (!choiceKey) {
                return res.status(400).json({ error: 'choiceKey is required.' });
            }
            const match = await getMatchActive(matchId);
            if (!match) {
                return res.status(404).json({ error: 'Match not found.' });
            }
            const hydratedTurn = await ensureMatchTurnData(match);
            const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
            const hydratedPending = await ensurePendingTurnState(hydratedEcon);
            const hydratedBoard = await ensureBoardState(hydratedPending);
            const hydrated = await autoAdvanceTurnIfExpired(hydratedBoard);
            if (!hydrated) {
                return res.status(404).json({ error: 'Match not found.' });
            }
            if (hydrated.status === 'ended') {
                return res.status(409).json({ error: 'Match already ended.' });
            }
            const username = req.authUser.username;
            if (hydrated.currentTurn !== username) {
                return res.status(403).json({ error: 'Not your turn.' });
            }
            const pendingTurn = getPendingTurn(hydrated, username);
            const prompt = pendingTurn.turnStartChoice;
            if (!hasPendingTurnStartChoice(pendingTurn) || !prompt) {
                return res.status(400).json({ error: 'No Doctor\'s Bag choice is pending.' });
            }
            const option = Array.isArray(prompt.options)
                ? prompt.options.find((entry) => entry?.key === choiceKey)
                : null;
            if (!option) {
                return res.status(400).json({ error: 'Invalid choice.' });
            }
            resolveTurnStartChoiceForUser({ match: hydrated, username, choiceKey });
            await persistMatchState(hydrated, {
                board: hydrated.board,
                players: hydrated.players,
                pendingTurns: hydrated.pendingTurns,
            });
            await broadcastMatchState(hydrated);
            scheduleBattleBotTurn(hydrated);
            return res.json(buildMatchPayloadForUser(hydrated, username));
        } catch (error) {
            console.error('Failed to resolve turn start choice:', error);
            return res.status(500).json({
                error: 'Failed to resolve turn start choice.',
            });
        }
    });

    router.post('/api/match/:matchId/skill/cancel', requireSession, async (req, res) => {
        const { matchId } = req.params;
        const actorSlot = Number.parseInt(req.body?.actorSlot, 10);
        if (!Number.isInteger(actorSlot) || actorSlot < 0) {
            return res.status(400).json({ error: 'actorSlot is required.' });
        }
        const match = await getMatchActive(matchId);
        if (!match) {
            return res.status(404).json({ error: 'Match not found.' });
        }
        const hydratedTurn = await ensureMatchTurnData(match);
        const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
        const hydratedPending = await ensurePendingTurnState(hydratedEcon);
        const hydrated = await autoAdvanceTurnIfExpired(hydratedPending);
        if (!hydrated) {
            return res.status(404).json({ error: 'Match not found.' });
        }
        if (hydrated.status === 'ended') {
            return res.status(409).json({ error: 'Match already ended.' });
        }
        const username = req.authUser.username;
        const playerEntry = hydrated.players.find((p) => p.username === username);
        if (!playerEntry) {
            return res.status(403).json({ error: 'Not part of this match.' });
        }
        if (hydrated.currentTurn !== username) {
            return res.status(403).json({ error: 'Not your turn.' });
        }
        if (hasPendingTurnStartChoice(getPendingTurn(hydrated, username))) {
            return res.status(400).json({ error: 'Resolve the Doctor\'s Bag choice first.' });
        }
        const changed = cancelQueuedSkillForActorSlot({ match: hydrated, username, actorSlot });
        if (changed) {
            await persistMatchState(hydrated, {
                chakraPools: hydrated.chakraPools,
                pendingTurns: hydrated.pendingTurns,
            });
            await broadcastMatchState(hydrated);
        }
        const safePayload = buildMatchPayloadForUser(hydrated, username);
        return res.json({
            ok: true,
            chakraPools: safePayload?.chakraPools || null,
            pendingTurn: safePayload?.pendingTurn || makeEmptyPendingTurn(),
            currentTurn: hydrated.currentTurn,
            turnExpiresAt: hydrated.turnExpiresAt,
            turnDurationMs: getTurnDurationMsForUser(hydrated, hydrated?.currentTurn),
        });
    });

    router.post('/api/match/:matchId/skill/reorder', requireSession, async (req, res) => {
        const { matchId } = req.params;
        const actorSlots = Array.isArray(req.body?.actorSlots) ? req.body.actorSlots : [];
        const match = await getMatchActive(matchId);
        if (!match) {
            return res.status(404).json({ error: 'Match not found.' });
        }
        const hydratedTurn = await ensureMatchTurnData(match);
        const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
        const hydratedPending = await ensurePendingTurnState(hydratedEcon);
        const hydrated = await autoAdvanceTurnIfExpired(hydratedPending);
        if (!hydrated) {
            return res.status(404).json({ error: 'Match not found.' });
        }
        if (hydrated.status === 'ended') {
            return res.status(409).json({ error: 'Match already ended.' });
        }
        const username = req.authUser.username;
        const playerEntry = hydrated.players.find((p) => p.username === username);
        if (!playerEntry) {
            return res.status(403).json({ error: 'Not part of this match.' });
        }
        if (hydrated.currentTurn !== username) {
            return res.status(403).json({ error: 'Not your turn.' });
        }
        if (hasPendingTurnStartChoice(getPendingTurn(hydrated, username))) {
            return res.status(400).json({ error: 'Resolve the Doctor\'s Bag choice first.' });
        }
        reorderQueuedSkills({ match: hydrated, username, actorSlots });
        await persistMatchState(hydrated, {
            pendingTurns: hydrated.pendingTurns,
        });
        await broadcastMatchState(hydrated);
        return res.json({
            ok: true,
            pendingTurn: getPendingTurn(hydrated, username),
            currentTurn: hydrated.currentTurn,
            turnExpiresAt: hydrated.turnExpiresAt,
            turnDurationMs: getTurnDurationMsForUser(hydrated, hydrated?.currentTurn),
        });
    });

    router.post('/api/match/:matchId/turn/random/adjust', requireSession, async (req, res) => {
        const { matchId } = req.params;
        const chakraType = typeof req.body?.chakraType === 'string' ? req.body.chakraType.trim().toLowerCase() : '';
        const deltaRaw = Number.parseInt(req.body?.delta, 10);
        const delta = deltaRaw > 0 ? 1 : deltaRaw < 0 ? -1 : 0;
        if (!chakraTypes.includes(chakraType) || !delta) {
            return res.status(400).json({ error: 'chakraType and delta are required.' });
        }
        const match = await getMatchActive(matchId);
        if (!match) {
            return res.status(404).json({ error: 'Match not found.' });
        }
        const hydratedTurn = await ensureMatchTurnData(match);
        const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
        const hydratedPending = await ensurePendingTurnState(hydratedEcon);
        const hydrated = await autoAdvanceTurnIfExpired(hydratedPending);
        if (!hydrated) {
            return res.status(404).json({ error: 'Match not found.' });
        }
        if (hydrated.status === 'ended') {
            return res.status(409).json({ error: 'Match already ended.' });
        }
        const username = req.authUser.username;
        const playerEntry = hydrated.players.find((p) => p.username === username);
        if (!playerEntry) {
            return res.status(403).json({ error: 'Not part of this match.' });
        }
        if (hydrated.currentTurn !== username) {
            return res.status(403).json({ error: 'Not your turn.' });
        }
        if (hasPendingTurnStartChoice(getPendingTurn(hydrated, username))) {
            return res.status(400).json({ error: 'Resolve the Doctor\'s Bag choice first.' });
        }
        try {
            adjustRandomAssignment({ match: hydrated, username, chakraType, delta });
            await persistMatchState(hydrated, {
                chakraPools: hydrated.chakraPools,
                pendingTurns: hydrated.pendingTurns,
            });
            await broadcastMatchState(hydrated);
            const safePayload = buildMatchPayloadForUser(hydrated, username);
            return res.json({
                ok: true,
                chakraPools: safePayload?.chakraPools || null,
                pendingTurn: safePayload?.pendingTurn || makeEmptyPendingTurn(),
                currentTurn: hydrated.currentTurn,
                turnExpiresAt: hydrated.turnExpiresAt,
                turnDurationMs: getTurnDurationMsForUser(hydrated, hydrated?.currentTurn),
            });
        } catch (error) {
            return res.status(400).json({ error: error.message || 'Unable to adjust random chakra.' });
        }
    });

    router.post('/api/match/:matchId/chakra/exchange', requireSession, async (req, res) => {
        const { matchId } = req.params;
        const chakraType = typeof req.body?.chakraType === 'string' ? req.body.chakraType.trim().toLowerCase() : '';
        const spendAssignments =
            req.body?.spendAssignments && typeof req.body.spendAssignments === 'object'
                ? req.body.spendAssignments
                : null;
        if (!chakraTypes.includes(chakraType)) {
            return res.status(400).json({ error: 'chakraType is required.' });
        }
        const match = await getMatchActive(matchId);
        if (!match) {
            return res.status(404).json({ error: 'Match not found.' });
        }
        const hydratedTurn = await ensureMatchTurnData(match);
        const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
        const hydratedPending = await ensurePendingTurnState(hydratedEcon);
        const hydrated = await autoAdvanceTurnIfExpired(hydratedPending);
        if (!hydrated) {
            return res.status(404).json({ error: 'Match not found.' });
        }
        if (hydrated.status === 'ended') {
            return res.status(409).json({ error: 'Match already ended.' });
        }
        const username = req.authUser.username;
        const playerEntry = hydrated.players.find((p) => p.username === username);
        if (!playerEntry) {
            return res.status(403).json({ error: 'Not part of this match.' });
        }
        if (hydrated.currentTurn !== username) {
            return res.status(403).json({ error: 'Not your turn.' });
        }
        if (hasPendingTurnStartChoice(getPendingTurn(hydrated, username))) {
            return res.status(400).json({ error: 'Resolve the Doctor\'s Bag choice first.' });
        }
        try {
            exchangeChakra({
                match: hydrated,
                username,
                chakraType,
                cost: 5,
                spendAssignments,
            });
            await persistMatchState(hydrated, {
                chakraPools: hydrated.chakraPools,
                pendingTurns: hydrated.pendingTurns,
            });
            await broadcastMatchState(hydrated);
            const safePayload = buildMatchPayloadForUser(hydrated, username);
            return res.json({
                ok: true,
                chakraPools: safePayload?.chakraPools || null,
                pendingTurn: safePayload?.pendingTurn || makeEmptyPendingTurn(),
                currentTurn: hydrated.currentTurn,
                turnExpiresAt: hydrated.turnExpiresAt,
                turnDurationMs: getTurnDurationMsForUser(hydrated, hydrated?.currentTurn),
            });
        } catch (error) {
            return res.status(400).json({ error: error.message || 'Unable to exchange chakra.' });
        }
    });

    router.post('/api/match/:matchId/skill/targets', requireSession, async (req, res) => {
        const { matchId } = req.params;
        const actorSlot = Number.parseInt(req.body?.actorSlot, 10);
        const skillIndex = Number.parseInt(req.body?.skillIndex, 10);
        if (!Number.isInteger(actorSlot) || actorSlot < 0 || !Number.isInteger(skillIndex) || skillIndex < 0) {
            return res.status(400).json({ error: 'actorSlot and skillIndex are required.' });
        }
        const match = await getMatchActive(matchId);
        if (!match) {
            return res.status(404).json({ error: 'Match not found.' });
        }
        const hydratedTurn = await ensureMatchTurnData(match);
        const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
        const hydratedPending = await ensurePendingTurnState(hydratedEcon);
        const hydratedBoard = await ensureBoardState(hydratedPending);
        const hydrated = await autoAdvanceTurnIfExpired(hydratedBoard);
        if (!hydrated) {
            return res.status(404).json({ error: 'Match not found.' });
        }
        if (hydrated.status === 'ended') {
            return res.status(409).json({ error: 'Match already ended.' });
        }

        const username = req.authUser.username;
        const playerEntry = hydrated.players.find((p) => p.username === username);
        if (!playerEntry) {
            return res.status(403).json({ error: 'Not part of this match.' });
        }
        if (hydrated.currentTurn !== username) {
            return res.status(403).json({ error: 'Not your turn.' });
        }

        const charactersData = getCharactersList();
        const options = battleLogic.computeTargetOptions({
            match: hydrated,
            actingUsername: username,
            actorSlot,
            skillIndex,
            characters: charactersData,
        });

        if (!options.targetType || options.mode === 'unknown') {
            return res.status(400).json({ error: 'Skill target could not be resolved.' });
        }

        return res.json({
            ok: true,
            targetType: options.targetType,
            mode: options.mode,
            targets: options.targets,
            currentTurn: hydrated.currentTurn,
            turnExpiresAt: hydrated.turnExpiresAt,
            pendingTurn: getPendingTurn(hydrated, username),
        });
    });

    return router;
};
