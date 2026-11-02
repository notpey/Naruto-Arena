const express = require('express');
const crypto = require('node:crypto');

const wars = require('../services/clanWars.js');
const { buildArchetypeSnapshot } = require('../services/warArchetypes.js');
const { validateWarTeam } = require('../services/warRules.js');

const { WarError } = wars;
const MAX_SAVE_ATTEMPTS = 4;

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const clanKeyOf = (name) => String(name || '').trim().toLowerCase();

// Clan wars: proposals, rosters, Open Challenge sets, and scoring of war
// battles. The returned router also carries `prepareWarBattle` and
// `recordWarBattleResult`, which the match endpoints call.
module.exports = function createClanWarsRouter(context) {
    const router = express.Router();
    const {
        clanWarsCollection,
        usersCollection,
        normalizeUserProfile = (user) => user?.profile || {},
        normalizeClanRankKey = (value) => value,
        getRoster = () => [],
        getRosterCharacterId = () => '',
        addClanExperience = async () => 0,
        archetypeOverrides = {},
    } = context || {};
    const requireSession = typeof context?.requireSession === 'function' ? context.requireSession : (req, res, next) => next();
    const clock = typeof context?.now === 'function' ? context.now : () => new Date();
    const createId = typeof context?.createId === 'function' ? context.createId : (prefix) => `${prefix}_${crypto.randomUUID()}`;

    const sendError = (res, error, fallback) => {
        if (error instanceof WarError) {
            return res.status(error.status).json({ error: error.message });
        }
        console.error(fallback, error);
        return res.status(500).json({ error: fallback });
    };

    const loadViewer = async (username) => {
        const user = await usersCollection.findOne({ username });
        if (!user) throw new WarError(404, 'User not found.');
        const profile = normalizeUserProfile(user);
        const clan = profile.clan && profile.clan.name ? profile.clan : null;
        return {
            username: user.username,
            clan: clan
                ? {
                      clanKey: clanKeyOf(clan.name),
                      name: clan.name,
                      abbreviation: clan.abbreviation || '',
                      rankKey: normalizeClanRankKey(clan.rankKey || '', user, clan),
                  }
                : null,
        };
    };

    const requireClan = (viewer) => {
        if (!viewer.clan) throw new WarError(400, 'You are not in a clan.');
        return viewer.clan;
    };

    const requireWarSide = (war, viewer) => {
        const side = viewer.clan ? wars.sideOfClan(war, viewer.clan.clanKey) : null;
        if (!side) throw new WarError(403, 'Your clan is not part of this war.');
        return side;
    };

    const requireClanLeader = (viewer) => {
        if (viewer.clan?.rankKey !== 'clanLeader') {
            throw new WarError(403, 'Only the Clan Leader can do that.');
        }
    };

    const payRewards = async (war) => {
        const claimed = await clanWarsCollection.updateOne(
            { warId: war.warId, status: 'completed', 'rewards.paidAt': null },
            { $set: { 'rewards.paidAt': clock() } }
        );
        if (!claimed?.modifiedCount) return;
        const { players = {}, clans = {} } = war.rewards || {};
        await Promise.all(
            Object.entries(players)
                .filter(([, ryo]) => ryo > 0)
                .map(([username, ryo]) => usersCollection.updateOne({ username }, { $inc: { 'profile.ryo': ryo } }))
        );
        for (const side of wars.SIDES) {
            if (clans[side] > 0) await addClanExperience(war[side].name, clans[side]);
        }
    };

    // Loads a war, applies any expired deadline, runs `change`, and saves with
    // a revision check so simultaneous actions cannot overwrite each other.
    const mutateWar = async (warId, change = null) => {
        for (let attempt = 0; attempt < MAX_SAVE_ATTEMPTS; attempt += 1) {
            const stored = await clanWarsCollection.findOne({ warId });
            if (!stored) throw new WarError(404, 'War not found.');
            const { _id, ...current } = stored;
            const timed = wars.applyTimeouts(current, clock()).war;
            const next = change ? change(timed) : timed;
            if (next === current) return current;
            const saved = { ...next, revision: (current.revision || 0) + 1 };
            const result = await clanWarsCollection.replaceOne({ warId, revision: current.revision || 0 }, saved);
            if (result?.matchedCount) {
                if (saved.status === 'completed' && current.status !== 'completed') {
                    await payRewards(saved);
                }
                return saved;
            }
        }
        throw new WarError(409, 'The war changed while you were acting. Please try again.');
    };

    const serializeWar = (war, viewer, { includeSnapshot = false } = {}) => {
        const { archetypeSnapshot, ...rest } = war;
        const side = viewer?.clan ? wars.sideOfClan(war, viewer.clan.clanKey) : null;
        return {
            ...rest,
            ...(includeSnapshot ? { archetypeSnapshot } : {}),
            viewer: {
                username: viewer?.username || null,
                side,
                isClanLeader: Boolean(side && viewer.clan.rankKey === 'clanLeader'),
                onRoster: Boolean(side && war.rosters[side].some((name) => clanKeyOf(name) === clanKeyOf(viewer.username))),
            },
        };
    };

    const findClanByName = async (clanName) => {
        const name = String(clanName || '').trim();
        if (!name) return null;
        const member = await usersCollection.findOne(
            { 'profile.clan.name': { $regex: `^${escapeRegex(name)}$`, $options: 'i' } },
            { projection: { profile: 1 } }
        );
        const clan = member ? normalizeUserProfile(member).clan : null;
        return clan?.name ? { clanKey: clanKeyOf(clan.name), name: clan.name, abbreviation: clan.abbreviation || '' } : null;
    };

    const handle = (fallback, handler) => async (req, res) => {
        try {
            return await handler(req, res);
        } catch (error) {
            return sendError(res, error, fallback);
        }
    };

    // An action by any member of a clan in the war.
    const memberAction = (fallback, change) =>
        handle(fallback, async (req, res) => {
            const viewer = await loadViewer(req.authUser.username);
            let side = null;
            const war = await mutateWar(req.params.warId, (current) => {
                side = requireWarSide(current, viewer);
                return change(current, { viewer, side, body: req.body || {}, params: req.params, now: clock() });
            });
            return res.json({ ok: true, war: serializeWar(war, viewer) });
        });

    // An action only the Clan Leader of a clan in the war may take.
    const leaderAction = (fallback, change) =>
        memberAction(fallback, (current, args) => {
            requireClanLeader(args.viewer);
            return change(current, args);
        });

    router.get('/api/clan-wars/archetypes', requireSession, (req, res) => {
        const snapshot = buildArchetypeSnapshot(getRoster(), archetypeOverrides);
        return res.json({ ok: true, ...snapshot });
    });

    router.get(
        '/api/clan-wars',
        requireSession,
        handle('Unable to load clan wars.', async (req, res) => {
            const viewer = await loadViewer(req.authUser.username);
            const clan = requireClan(viewer);
            const stored = await clanWarsCollection
                .find(
                    { $or: [{ 'challenger.clanKey': clan.clanKey }, { 'defender.clanKey': clan.clanKey }] },
                    { projection: { _id: 0, archetypeSnapshot: 0 } }
                )
                .sort({ createdAt: -1 })
                .limit(50)
                .toArray();
            const refreshed = await Promise.all(
                stored.map((war) =>
                    ['proposed', 'active'].includes(war.status) ? mutateWar(war.warId) : war
                )
            );
            return res.json({ ok: true, wars: refreshed.map((war) => serializeWar(war, viewer)) });
        })
    );

    router.get(
        '/api/clan-wars/:warId',
        requireSession,
        handle('Unable to load the war.', async (req, res) => {
            const viewer = await loadViewer(req.authUser.username);
            const war = await mutateWar(req.params.warId);
            return res.json({ ok: true, war: serializeWar(war, viewer, { includeSnapshot: true }) });
        })
    );

    router.post(
        '/api/clan-wars',
        requireSession,
        handle('Unable to declare war.', async (req, res) => {
            const viewer = await loadViewer(req.authUser.username);
            const clan = requireClan(viewer);
            requireClanLeader(viewer);
            const opponent = await findClanByName(req.body?.opponentClan);
            if (!opponent) throw new WarError(404, 'That clan does not exist.');

            const open = await clanWarsCollection.find(
                {
                    status: { $in: ['proposed', 'active'] },
                    $or: [
                        { 'challenger.clanKey': clan.clanKey, 'defender.clanKey': opponent.clanKey },
                        { 'challenger.clanKey': opponent.clanKey, 'defender.clanKey': clan.clanKey },
                    ],
                },
                { projection: { warId: 1 } }
            ).toArray();
            for (const { warId } of open) {
                const refreshed = await mutateWar(warId);
                if (['proposed', 'active'].includes(refreshed.status)) {
                    throw new WarError(409, `Your clan already has an open war with ${opponent.name}.`);
                }
            }

            const war = wars.createWarProposal({
                warId: createId('war'),
                challenger: clan,
                defender: opponent,
                proposedBy: viewer.username,
                terms: req.body?.terms,
                now: clock(),
            });
            await clanWarsCollection.insertOne({ ...war });
            return res.status(201).json({ ok: true, war: serializeWar(war, viewer) });
        })
    );

    router.post(
        '/api/clan-wars/:warId/respond',
        requireSession,
        leaderAction('Unable to respond to the war.', (war, { viewer, side, body, now }) =>
            wars.respondToProposal(war, {
                side,
                by: viewer.username,
                action: body.action,
                terms: body.terms,
                now,
                archetypeSnapshot: body.action === 'accept' ? buildArchetypeSnapshot(getRoster(), archetypeOverrides) : null,
            })
        )
    );

    router.post(
        '/api/clan-wars/:warId/withdraw',
        requireSession,
        leaderAction('Unable to withdraw the proposal.', (war, { side, now }) => wars.withdrawProposal(war, { side, now }))
    );

    router.post(
        '/api/clan-wars/:warId/surrender',
        requireSession,
        leaderAction('Unable to surrender the war.', (war, { side, now }) => wars.surrenderWar(war, { side, now }))
    );

    router.post(
        '/api/clan-wars/:warId/roster/join',
        requireSession,
        memberAction('Unable to join the war roster.', (war, { viewer, side }) =>
            wars.joinRoster(war, { side, username: viewer.username })
        )
    );

    router.post(
        '/api/clan-wars/:warId/roster/leave',
        requireSession,
        memberAction('Unable to leave the war roster.', (war, { viewer, side }) =>
            wars.removeFromRoster(war, { side, username: viewer.username })
        )
    );

    router.post(
        '/api/clan-wars/:warId/roster/remove',
        requireSession,
        leaderAction('Unable to update the war roster.', (war, { side, body }) =>
            wars.removeFromRoster(war, { side, username: String(body.username || '') })
        )
    );

    router.post(
        '/api/clan-wars/:warId/challenges',
        requireSession,
        memberAction('Unable to issue the challenge.', (war, { viewer, side, body, now }) =>
            wars.createChallenge(war, {
                side,
                username: viewer.username,
                opponent: String(body.opponent || ''),
                setId: createId('set'),
                now,
            })
        )
    );

    router.post(
        '/api/clan-wars/:warId/sets/:setId/respond',
        requireSession,
        memberAction('Unable to respond to the challenge.', (war, { viewer, body, params, now }) =>
            wars.respondToChallenge(war, { setId: params.setId, username: viewer.username, accept: body.accept === true, now })
        )
    );

    router.post(
        '/api/clan-wars/:warId/sets/:setId/cancel',
        requireSession,
        memberAction('Unable to cancel the challenge.', (war, { viewer, params }) =>
            wars.cancelChallenge(war, { setId: params.setId, username: viewer.username })
        )
    );

    router.post(
        '/api/clan-wars/:warId/sets/:setId/forfeit',
        requireSession,
        memberAction('Unable to forfeit the set.', (war, { viewer, params, now }) =>
            wars.forfeitSet(war, { setId: params.setId, username: viewer.username, now })
        )
    );

    const findWarBySetId = async (setId) => {
        const stored = await clanWarsCollection.findOne({ 'sets.setId': setId }, { projection: { warId: 1 } });
        if (!stored) throw new WarError(404, 'War set not found.');
        return mutateWar(stored.warId);
    };

    // Checks a team for a war battle without starting one, so the team picker
    // can explain every rule the team breaks.
    const checkWarTeam = async ({ username, setId, team }) => {
        const war = await findWarBySetId(setId);
        const battle = wars.getBattleContext(war, { setId, username });
        const characterIds = (Array.isArray(team) ? team : []).map((slot) => getRosterCharacterId(slot));
        const result = validateWarTeam({
            ruleset: battle.ruleset,
            team: characterIds,
            archetypeSnapshot: battle.archetypeSnapshot,
            usedCharacterIds: battle.usedCharacterIds,
        });
        return { war, battle, characterIds, result };
    };

    router.post(
        '/api/clan-wars/:warId/sets/:setId/check-team',
        requireSession,
        handle('Unable to check the team.', async (req, res) => {
            const { war, result } = await checkWarTeam({
                username: req.authUser.username,
                setId: req.params.setId,
                team: req.body?.team,
            });
            if (war.warId !== req.params.warId) throw new WarError(404, 'War set not found.');
            return res.json({ ok: true, ...result });
        })
    );

    // Called by the match join before pairing a war battle. Throws a WarError
    // when the player may not start this battle or the team breaks a rule.
    router.prepareWarBattle = async ({ username, setId, team }) => {
        const { war, battle, characterIds, result } = await checkWarTeam({ username, setId, team });
        if (!result.valid) {
            const error = new WarError(403, result.violations.map((violation) => violation.message).join(' '));
            error.violations = result.violations;
            throw error;
        }
        return { warId: war.warId, setId, opponent: battle.opponent, characterIds };
    };

    // Called when any match ends. Ignores matches that are not war battles.
    router.recordWarBattleResult = async (match, winnerUsername, endedAt) => {
        if (match?.mode !== 'war' || !match.warId || !match.warSetId) return null;
        // Character IDs are stored on the match when it starts, so a roster
        // reorder during the battle cannot change which characters were used.
        const teams = { ...(match.warTeams || {}) };
        for (const player of match.players || []) {
            if (!teams[player.username]) {
                teams[player.username] = (player.team || []).map((slot) => getRosterCharacterId(slot));
            }
        }
        return mutateWar(match.warId, (war) =>
            wars.recordBattle(war, {
                setId: match.warSetId,
                matchId: match.matchId,
                winnerUsername,
                teams,
                endReason: match.endReason || null,
                now: endedAt || clock(),
            }).war
        );
    };

    // Finished-war record for the public clan profile.
    router.getClanWarRecord = async (clanName, { limit = 10 } = {}) => {
        const clanKey = clanKeyOf(clanName);
        const finished = await clanWarsCollection
            .find(
                { status: 'completed', $or: [{ 'challenger.clanKey': clanKey }, { 'defender.clanKey': clanKey }] },
                { projection: { _id: 0, warId: 1, challenger: 1, defender: 1, score: 1, result: 1 } }
            )
            .sort({ 'result.at': -1 })
            .toArray();
        const record = { wins: 0, losses: 0, draws: 0, recent: [] };
        for (const war of finished) {
            const side = wars.sideOfClan(war, clanKey);
            if (!side) continue;
            const opposing = wars.otherSide(side);
            const winnerSide = war.result?.winnerSide || null;
            const outcome = !winnerSide ? 'draw' : winnerSide === side ? 'won' : 'lost';
            if (outcome === 'won') record.wins += 1;
            else if (outcome === 'lost') record.losses += 1;
            else record.draws += 1;
            if (record.recent.length < limit) {
                record.recent.push({
                    warId: war.warId,
                    opponent: war[opposing].name,
                    outcome,
                    setsWon: war.score[side],
                    setsLost: war.score[opposing],
                    reason: war.result?.reason || null,
                    completedAt: war.result?.at || null,
                });
            }
        }
        return record;
    };

    router.ensureIndexes = async () => {
        await clanWarsCollection.createIndex({ warId: 1 }, { unique: true });
        await clanWarsCollection.createIndex({ 'sets.setId': 1 });
        await clanWarsCollection.createIndex({ 'challenger.clanKey': 1, createdAt: -1 });
        await clanWarsCollection.createIndex({ 'defender.clanKey': 1, createdAt: -1 });
    };

    return router;
};
