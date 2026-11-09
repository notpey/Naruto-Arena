// Tower API: the PvE roguelike run. Run state lives in its own collection; battles are
// ordinary server matches (mode 'tower') built by server.js and resolved by battleLogic.js.
const express = require('express');
const { randomUUID, randomInt } = require('node:crypto');
const { localizeArtwork } = require('../services/characterImages');
const towerRun = require('../services/tower/towerRun');

module.exports = function createTowerRouter(context) {
    const router = express.Router();
    const {
        requireSession,
        towerRunsCollection,
        usersCollection,
        getCharacters,
        getMatchActive,
        buildTowerMatch,
        userToMatch,
        removeQueuedEntry,
    } = context;

    const ACTIVE = [...towerRun.ACTIVE_STATUSES];

    // ------------------------------------------------------------ characters
    const rosterIds = () => (getCharacters() || [])
        .filter((character) => typeof character?.characterId === 'string' &&
            Array.isArray(character.skills) && character.skills.length > 0)
        .map((character) => character.characterId);

    const describeCharacter = (characterId) => {
        const character = (getCharacters() || []).find((entry) => entry?.characterId === characterId);
        if (!character) return null;
        const art = localizeArtwork({
            facePicture: character.facePicture || '',
            skills: (character.skills || [])
                .filter((skill) => skill && !skill.hiddenFromSelectionViewer && !skill.omitFromSelectionViewer)
                .slice(0, 4)
                .map((skill) => ({
                    name: skill.name || '',
                    skillimage: skill.skillimage || '',
                    skilldescription: skill.skilldescription || '',
                    energy: Array.isArray(skill.energy) ? skill.energy : [],
                    cooldown: Number(skill.cooldown) || 0,
                })),
        });
        return {
            characterId,
            name: character.name || characterId,
            facePicture: art.facePicture,
            passive: character.passive?.name
                ? { name: character.passive.name, description: character.passive.description || '' }
                : null,
            skills: art.skills,
        };
    };

    // ------------------------------------------------------------ storage
    const findActiveRun = (username) => towerRunsCollection.findOne(
        { username, status: { $in: ACTIVE } }, { sort: { createdAt: -1 } });

    const findLatestRun = (username) => towerRunsCollection.findOne(
        { username }, { sort: { createdAt: -1 } });

    const bestFloorFor = async (username) => {
        const best = await towerRunsCollection.find({ username }, { projection: { floor: 1, status: 1 } })
            .sort({ floor: -1 }).limit(1).toArray();
        return best[0] ? { floor: best[0].floor || 0, cleared: best[0].status === 'victory' } : null;
    };

    // Optimistic save: a run only changes from the version that was read.
    const saveRun = async (run) => {
        const expected = run.version;
        const { _id, ...fields } = run;
        const next = { ...fields, version: expected + 1, updatedAt: new Date() };
        const result = await towerRunsCollection.updateOne(
            { runId: run.runId, version: expected }, { $set: next });
        if (!result.matchedCount) throw new towerRun.TowerError('The run changed. Refresh and try again.', 409);
        run.version = expected + 1;
        return run;
    };

    // Grants the account ryo for a finished run exactly once.
    const settleRun = async (run) => {
        if (!towerRun.ENDED_STATUSES.has(run.status) || run.accountReward) return run;
        const reward = towerRun.computeAccountReward(run);
        run.accountReward = reward || { floorsCleared: run.floor || 0, ryo: 0 };
        await saveRun(run);
        if (reward && reward.ryo > 0) {
            await usersCollection.updateOne({ username: run.username }, { $inc: { 'profile.ryo': reward.ryo } });
        }
        return run;
    };

    const respond = async (res, username, run, extra = {}) => res.json({
        ok: true,
        run: towerRun.serializeRun(run, describeCharacter),
        bestFloor: await bestFloorFor(username),
        ...extra,
    });

    const sendError = (res, error) => {
        if (error instanceof towerRun.TowerError) return res.status(error.status).json({ error: error.message });
        console.error('Tower error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    };

    const loadActive = async (username) => {
        const run = await findActiveRun(username);
        if (!run) throw new towerRun.TowerError('You have no Tower run in progress.', 404);
        return run;
    };

    // Applies a finished battle to the run. Called by server.js when a Tower match ends,
    // and on reads, in case the server stopped before it could.
    const recordTowerBattleResult = async (match, winnerUsername) => {
        const runId = match?.towerEncounter?.runId;
        if (!runId) return null;
        const run = await towerRunsCollection.findOne({ runId });
        if (!run || run.status !== 'battle' || run.battle?.matchId !== match.matchId) return null;
        const player = (match.players || []).find((entry) => entry && !entry.isBot);
        const won = Boolean(winnerUsername) && winnerUsername === player?.username;
        towerRun.recordBattleResult(run, { won, units: match.board?.[player?.username] || [] });
        await saveRun(run);
        await settleRun(run);
        return run;
    };

    const reconcileBattle = async (run) => {
        if (run.status !== 'battle' || !run.battle?.matchId) return run;
        const match = await getMatchActive(run.battle.matchId);
        if (match && match.status === 'ended') {
            return (await recordTowerBattleResult(match, match.winner)) || run;
        }
        return run;
    };

    // Starts (or resumes) the battle the run is waiting on and returns its match id.
    const ensureBattleMatch = async (run) => {
        if (run.battle?.matchId) {
            const existing = await getMatchActive(run.battle.matchId);
            if (existing && existing.status !== 'ended') return existing.matchId;
        }
        const mapping = userToMatch.get(run.username);
        if (mapping) {
            const other = await getMatchActive(mapping.matchId);
            if (other && other.status !== 'ended') {
                throw new towerRun.TowerError('Finish your current match before entering a Tower battle.', 409);
            }
        }
        const setup = towerRun.buildBattleSetup(run);
        if (typeof removeQueuedEntry === 'function') removeQueuedEntry(run.username);
        const match = await buildTowerMatch({ username: run.username, runId: run.runId, setup });
        run.battle.matchId = match.matchId;
        await saveRun(run);
        return match.matchId;
    };

    const withRun = (handler) => async (req, res) => {
        const username = req.authUser.username;
        try {
            const run = await loadActive(username);
            const result = await handler(run, req.body || {}, username);
            const settled = await settleRun(run);
            return respond(res, username, settled, result || {});
        } catch (error) {
            return sendError(res, error);
        }
    };

    const slotOf = (body) => (body.slot === undefined || body.slot === null ? null : Number(body.slot));

    // ------------------------------------------------------------ routes
    router.get('/run', requireSession, async (req, res) => {
        const username = req.authUser.username;
        try {
            let run = await findActiveRun(username);
            if (run) run = await reconcileBattle(run);
            if (!run) {
                const latest = await findLatestRun(username);
                // Show a just-finished run's summary until a new run starts.
                run = latest && towerRun.ENDED_STATUSES.has(latest.status) && !latest.dismissed ? latest : null;
            }
            return respond(res, username, run);
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.post('/start', requireSession, async (req, res) => {
        const username = req.authUser.username;
        try {
            const active = await findActiveRun(username);
            if (active) return respond(res, username, active);
            await towerRunsCollection.updateMany({ username, dismissed: { $ne: true } }, { $set: { dismissed: true } });
            const run = towerRun.createRun({
                username, rosterIds: rosterIds(), seed: randomInt(1, 2 ** 31 - 1), runId: randomUUID(),
            });
            await towerRunsCollection.insertOne(run);
            return respond(res, username, run);
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.post('/dismiss', requireSession, async (req, res) => {
        const username = req.authUser.username;
        try {
            await towerRunsCollection.updateMany(
                { username, status: { $nin: ACTIVE } }, { $set: { dismissed: true } });
            return respond(res, username, null);
        } catch (error) {
            return sendError(res, error);
        }
    });

    router.post('/draft/reroll', requireSession, withRun(async (run) => {
        towerRun.rerollDraft(run, rosterIds());
        await saveRun(run);
    }));

    router.post('/draft', requireSession, withRun(async (run, body) => {
        towerRun.chooseDraft(run, Number(body.offerIndex));
        await saveRun(run);
    }));

    // Choosing a combat node only scouts it; the match (and its turn timer) starts on /battle.
    router.post('/node', requireSession, withRun(async (run, body) => {
        towerRun.chooseNode(run, String(body.nodeId || ''), rosterIds());
        await saveRun(run);
    }));

    router.post('/battle', requireSession, withRun(async (run) => {
        const reconciled = await reconcileBattle(run);
        if (reconciled.status !== 'battle') {
            Object.assign(run, reconciled);
            return null;
        }
        return { matchId: await ensureBattleMatch(run) };
    }));

    router.post('/ramen', requireSession, withRun(async (run, body) => {
        towerRun.applyRamen(run, String(body.option || ''), slotOf(body));
        await saveRun(run);
    }));

    router.post('/merchant/buy', requireSession, withRun(async (run, body) => {
        towerRun.merchantBuy(run, Number(body.itemIndex), slotOf(body));
        await saveRun(run);
    }));

    router.post('/leave', requireSession, withRun(async (run) => {
        towerRun.leaveNode(run);
        await saveRun(run);
    }));

    router.post('/recruit', requireSession, withRun(async (run, body) => {
        towerRun.recruit(run, Number(body.offerIndex), slotOf(body));
        await saveRun(run);
    }));

    router.post('/reward', requireSession, withRun(async (run, body) => {
        towerRun.chooseReward(run, Number(body.offerIndex), slotOf(body));
        await saveRun(run);
    }));

    router.post('/reward/skip', requireSession, withRun(async (run) => {
        towerRun.skipReward(run);
        await saveRun(run);
    }));

    router.post('/abandon', requireSession, withRun(async (run) => {
        if (run.status === 'battle' && run.battle?.matchId) {
            const match = await getMatchActive(run.battle.matchId);
            if (match && match.status !== 'ended') {
                throw new towerRun.TowerError('Finish or surrender the current battle first.', 409);
            }
        }
        towerRun.abandonRun(run);
        await saveRun(run);
    }));

    router.recordTowerBattleResult = recordTowerBattleResult;
    return router;
};
