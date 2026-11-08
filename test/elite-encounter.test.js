const test = require('node:test');
const assert = require('node:assert/strict');
const battleLogic = require('../battleLogic');
const characters = require('../data/characters');
const { planBattleBotTurn } = require('../services/battleBot');
const server = require('../server.js');

const {
    resolveLadderRewardsForResult,
    rollEliteEncounter,
    createEliteBossPlayer,
    applyEliteBossVitality,
    ELITE_ENCOUNTER_CHANCE,
    applyMissionProgressForUsers,
    resolveRosterIndicesForCharacterIds,
    __setTestUsersCollection,
} = server;

test('roughly one ladder bot match in ten is an elite encounter, never in quick', () => {
    assert.equal(ELITE_ENCOUNTER_CHANCE, 0.1);
    assert.equal(rollEliteEncounter('ladder', () => 0.05), true);
    assert.equal(rollEliteEncounter('ladder', () => 0.1), false);
    assert.equal(rollEliteEncounter('ladder', () => 0.6), false);
    assert.equal(rollEliteEncounter('quick', () => 0), false);
    assert.equal(rollEliteEncounter('private', () => 0), false);
});

test('an elite win doubles EXP and ryo; an elite loss changes nothing', () => {
    const levels = { playerLevel: 20, opponentLevel: 20 };
    const normalWin = resolveLadderRewardsForResult({ didWin: true, hasWinner: true, ...levels });
    const normalLoss = resolveLadderRewardsForResult({ didWin: false, hasWinner: true, ...levels });
    const eliteWin = resolveLadderRewardsForResult({ elite: true, didWin: true, hasWinner: true, ...levels });
    const eliteLoss = resolveLadderRewardsForResult({ elite: true, didWin: false, hasWinner: true, ...levels });

    assert.ok(normalWin.expChange > 0 && normalWin.ryoDelta > 0 && normalWin.recordsResult);
    assert.ok(normalLoss.expChange < 0 && normalLoss.recordsResult, 'an ordinary loss still costs EXP');
    assert.deepEqual(eliteWin, {
        expChange: normalWin.expChange * 2,
        ryoDelta: normalWin.ryoDelta * 2,
        recordsResult: true,
    });
    assert.deepEqual(eliteLoss, { expChange: 0, ryoDelta: 0, recordsResult: false });
    assert.deepEqual(
        resolveLadderRewardsForResult({ elite: true, didWin: false, hasWinner: false, ...levels }),
        { expChange: 0, ryoDelta: 0, recordsResult: false }
    );
});

test('the elite boss fights at the player level with tougher units', () => {
    const boss = createEliteBossPlayer({ matchId: 'match-elite', playerProfile: { ladder: { level: 33 } } });
    assert.match(boss.username, /^__game_bot__:/);
    assert.equal(boss.isBot, true);
    assert.equal(boss.isEliteBoss, true);
    assert.equal(boss.ladderLevel, 33);
    assert.equal(boss.profile.equippedTitle, 'Elite');
    assert.ok(boss.displayName && boss.displayName !== 'Rogue Ninja');
    assert.equal(boss.displayNameLower, undefined, 'a boss is not presented as a searchable player');
    assert.equal(boss.team.length, 3);

    const players = [{ username: 'human', team: boss.team }, boss];
    const board = battleLogic.buildInitialBoard(players, characters);
    // Some passives raise a team's max HP, so compare against each unit's own base.
    const bossBase = board[boss.username].map((unit) => unit.hpCap);
    const humanBase = board.human.map((unit) => unit.hpCap);
    applyEliteBossVitality(board, boss.username);
    board[boss.username].forEach((unit, slot) => {
        assert.equal(unit.hpCap, Math.round(bossBase[slot] * 1.5));
        assert.equal(unit.hp, unit.hpCap);
    });
    assert.ok(bossBase.includes(100) ? board[boss.username].some((unit) => unit.hpCap === 150) : true);
    board.human.forEach((unit, slot) => assert.equal(unit.hpCap, humanBase[slot], 'the player keeps normal HP'));
});

test('the elite AI plays without the ordinary bot noise', () => {
    const index = (id) => characters.findIndex((character) => character.characterId === id);
    const players = [
        { username: 'a', team: ['uzumaki-naruto', 'haruno-sakura', 'tenten'].map(index) },
        { username: 'b', team: ['inuzuka-kiba', 'kankuro', 'temari'].map(index) },
    ];
    const pool = () => ({ taijutsu: 20, ninjutsu: 20, bloodline: 20, genjutsu: 20 });
    const buildMatch = () => {
        const match = { players, board: battleLogic.buildInitialBoard(players, characters),
            chakraPools: { a: pool(), b: pool() }, economy: { turnCounts: { a: 0, b: 0 } }, pendingTurns: {} };
        Object.entries(match.board).forEach(([username, units]) => units.forEach((unit) => {
            unit.username = username; unit.state.cooldowns = {};
        }));
        return match;
    };
    const plan = (random) => {
        const queued = [];
        planBattleBotTurn({
            match: buildMatch(), username: 'a', characters, battleLogic, random, elite: true,
            canAfford: () => true, queue: (play) => queued.push(play),
        });
        return queued.map((play) => `${play.actorSlot}:${play.skillIndex}`).sort();
    };
    const low = plan(() => 0);
    assert.ok(low.length > 0);
    // Noise is capped at 1.5 points, so extreme rolls rarely change an elite's plan.
    assert.deepEqual(plan(() => 0.999), low);
});

test('elite mission progress: a win counts double and a loss counts for nothing', async () => {
    const [rinIndex, kakashiIndex, obitoIndex] = resolveRosterIndicesForCharacterIds([
        'nohara-rin', 'young-kakashi', 'uchiha-obito',
    ]);
    assert.ok([rinIndex, kakashiIndex, obitoIndex].every((value) => value >= 0));

    const makeUser = () => ({
        _id: 'u1',
        username: 'hero',
        createdAt: new Date('2026-01-01'),
        profile: { ladder: { level: 30, experiencePoints: 40000 } },
    });
    const runMatch = async ({ elite, didWin }) => {
        const user = makeUser();
        const updates = [];
        __setTestUsersCollection({
            find: () => ({ toArray: async () => [user] }),
            updateOne: async (_filter, update) => { updates.push(update); },
        });
        const match = {
            mode: 'ladder',
            players: [
                { username: 'hero', team: [rinIndex, kakashiIndex, obitoIndex] },
                { username: '__game_bot__:x', isBot: true, team: [0, 1, 2] },
            ],
            ...(elite ? { eliteEncounter: { bossName: 'Grey Heron', rewardMultiplier: 2 } } : {}),
        };
        await applyMissionProgressForUsers(match, didWin ? 'hero' : '__game_bot__:x', new Date());
        const saved = updates.at(-1)?.$set?.profile;
        const progress = saved?.missions?.progressByMissionId?.['the-yellow-flash'];
        return { updates, rinGoal: progress?.goalProgressByIndex?.[0]?.count ?? 0 };
    };

    try {
        assert.equal((await runMatch({ elite: false, didWin: true })).rinGoal, 1);
        assert.equal((await runMatch({ elite: true, didWin: true })).rinGoal, 2);
        const eliteLoss = await runMatch({ elite: true, didWin: false });
        assert.equal(eliteLoss.updates.length, 0, 'an elite loss writes no mission progress');
    } finally {
        __setTestUsersCollection(undefined);
    }
});

test('elite ladder results: a loss leaves the record, streak, EXP and ryo untouched', async () => {
    const { applyMatchCompletionRewards } = server;
    const run = async ({ elite, didWin }) => {
        const user = {
            _id: 'u1',
            username: 'hero',
            createdAt: new Date('2026-01-01'),
            profile: { ryo: 500, ladder: { level: 20, experiencePoints: 20000, wins: 12, losses: 9, streak: 4, highestStreak: 6 } },
        };
        const before = JSON.parse(JSON.stringify(user.profile));
        __setTestUsersCollection({
            find: () => ({ toArray: async () => [user] }),
            updateOne: async (_filter, update) => {
                if (update?.$set?.profile) user.profile = update.$set.profile;
            },
        });
        const match = {
            matchId: 'm1',
            mode: 'ladder',
            players: [
                { username: 'hero', team: [0, 1, 2] },
                { username: '__game_bot__:boss', isBot: true, ladderLevel: 20, team: [3, 4, 5] },
            ],
            ...(elite ? { eliteEncounter: { bossName: 'Iron Lotus', rewardMultiplier: 2 } } : {}),
        };
        const results = await applyMatchCompletionRewards(match, didWin ? 'hero' : '__game_bot__:boss', new Date());
        return { before, after: user.profile, result: results?.hero };
    };

    try {
        const normalWin = await run({ elite: false, didWin: true });
        const eliteWin = await run({ elite: true, didWin: true });
        assert.equal(eliteWin.result.elite, true);
        assert.equal(eliteWin.result.expDelta, normalWin.result.expDelta * 2);
        assert.equal(eliteWin.result.ryoDelta, normalWin.result.ryoDelta * 2);
        assert.equal(eliteWin.after.ladder.wins, 13);
        assert.equal(eliteWin.after.ladder.streak, 5);

        const eliteLoss = await run({ elite: true, didWin: false });
        assert.equal(eliteLoss.result.expDelta, 0);
        assert.equal(eliteLoss.result.ryoDelta, 0);
        assert.equal(eliteLoss.result.clanExpDelta, 0);
        assert.equal(eliteLoss.after.ladder.wins, 12);
        assert.equal(eliteLoss.after.ladder.losses, 9);
        assert.equal(eliteLoss.after.ladder.streak, 4);
        assert.equal(eliteLoss.after.ladder.experiencePoints, 20000);
        assert.equal(eliteLoss.after.ryo, 500);

        const normalLoss = await run({ elite: false, didWin: false });
        assert.equal(normalLoss.after.ladder.losses, 10);
        assert.equal(normalLoss.after.ladder.streak, 0);
    } finally {
        __setTestUsersCollection(undefined);
    }
});
