// Shared by the Character Rules tests: plays the same scripted match against two rosters (the
// live one and one with rules copies swapped in) from the same random seed, and compares what a
// player could observe after every step.
const assert = require('node:assert/strict');
const battle = require('../../battleLogic');

const seeded = (seed) => () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
};
const pool = () => ({ taijutsu: 9, ninjutsu: 9, bloodline: 9, genjutsu: 9 });

// Counters compared by value. A counter at 0 and one not yet set read the same.
const COUNTERS = ['charges', 'devourBonus', 'sandFlowStacks'];

// What a player could observe: health, life, cooldowns, extra skill uses, chakra, and each active
// status with its counters. A dead unit's leftover statuses change nothing in play and are skipped.
const snapshot = (match, step) => ({
    step,
    chakra: Object.fromEntries(Object.entries(match.chakraPools || {}).map(([username, chakra]) => [username, { ...chakra }])),
    units: Object.entries(match.board).flatMap(([username, units]) => units.map((unit, slot) => ({
        unit: `${username}:${slot}`,
        hp: unit.hp,
        alive: unit.alive !== false,
        cooldowns: Object.fromEntries(Object.entries(unit.state?.cooldowns || {}).filter(([, turns]) => turns > 0).sort()),
        bonusSkillUses: Object.fromEntries(Object.entries(unit.state?.bonusSkillUses || {}).filter(([, uses]) => uses > 0).sort()),
        statuses: (unit.alive === false ? [] : unit.state?.statuses || []).filter((status) => (Number(status.remainingTurns) || 0) > 0)
            .map((status) => [status.id, status.remainingTurns,
                ...COUNTERS.filter((key) => Number(status.metadata?.[key]) > 0).map((key) => `${key}=${status.metadata[key]}`)].join(' '))
            .sort(),
    }))),
});

// Runs a script against one roster and returns a snapshot after every step.
const play = (roster, allies, enemies, script) => {
    const realRandom = Math.random;
    Math.random = seeded(7);
    try {
        const indexOf = (id) => roster.findIndex((character) => character.characterId === id);
        const players = [{ username: 'p1', team: allies.map(indexOf) }, { username: 'p2', team: enemies.map(indexOf) }];
        const match = { matchId: 'm', mode: 'quick', players, board: battle.buildInitialBoard(players, roster),
            chakraPools: { p1: pool(), p2: pool() }, economy: { turnCounts: { p1: 0, p2: 0 } }, pendingTurns: {} };
        Object.entries(match.board).forEach(([username, units]) => units.forEach((unit) => { unit.username = username; }));
        const snapshots = [snapshot(match, 'start')];
        script({
            match,
            cast(username, slot, skillId, target) {
                const index = roster[match.board[username][slot].rosterIndex].skills.findIndex((skill) => skill.id === skillId);
                assert.ok(index >= 0, skillId);
                match.pendingTurns[username] = { queueOrder: [slot], queuedByActorSlot: { [slot]: {
                    skillIndex: index, targetSelection: target ? [{ username: target[0], slot: target[1] }] : [] } } };
                battle.resolvePendingTurnSkills({ match, actingUsername: username, characters: roster });
                snapshots.push(snapshot(match, `${username}:${slot} uses ${skillId}`));
            },
            endTurn(username) {
                battle.tickStatusesForTurnEnd({ match, endingUsername: username });
                battle.tickCooldownsForTurnEnd({ match, endingUsername: username });
                match.economy.turnCounts[username] += 1;
                snapshots.push(snapshot(match, `${username} ends turn`));
            },
            give(username, slot, statusId, metadata, duration = 2) {
                battle.applyStatus({ targetState: match.board[username][slot].state, statusId, duration,
                    sourceUsername: username === 'p1' ? 'p2' : 'p1', sourceSlot: 0, metadata });
                snapshots.push(snapshot(match, `${username}:${slot} gets ${statusId}`));
            },
            setHp(username, slot, hp) { match.board[username][slot].hp = hp; },
        });
        return snapshots;
    } finally {
        Math.random = realRandom;
    }
};

// Plays a script with both rosters and requires identical snapshots at every step.
const sameBattle = (live, rulesRoster, allies, enemies, script) => {
    const expected = play(live, allies, enemies, script);
    const actual = play(rulesRoster, allies, enemies, script);
    assert.equal(actual.length, expected.length);
    expected.forEach((want, i) => assert.deepEqual(actual[i], want, `differs after: ${want.step}`));
    return expected;
};

const unitIn = (snapshots, unit, at = -1) => snapshots.at(at).units.find((entry) => entry.unit === unit);
const statusOn = (snapshots, unit, prefix, at = -1) =>
    unitIn(snapshots, unit, at).statuses.find((line) => line.startsWith(prefix)) || null;

module.exports = { play, sameBattle, snapshot, unitIn, statusOn };
