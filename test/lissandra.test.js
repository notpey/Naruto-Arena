const test = require('node:test');
const assert = require('node:assert/strict');
const characters = require('../data/characters');
const { ACTIVE_ROSTER_IDS, isActiveCharacter } = require('../data/activeRoster');
const {
    buildInitialBoard, computeTargetOptions, resolvePendingTurnSkills,
    tickStatusesForTurnEnd, applyDamageToUnit, isUnitInvulnerableForSkill,
    computeEffectiveEnergyCost,
} = require('../battleLogic');

const indexOf = id => characters.findIndex(character => character.id === id);
const lissandra = characters[indexOf('lissandra-the-ice-witch')];
const makeMatch = () => {
    const players = [
        { username: 'p1', team: [indexOf('lissandra-the-ice-witch'), indexOf('haruno-sakura')] },
        { username: 'p2', team: [indexOf('inuzuka-kiba'), indexOf('haruno-sakura'), indexOf('neji-hyuuga')] },
    ];
    return {
        players, board: buildInitialBoard(players, characters), pendingTurns: {},
        chakraPools: {
            p1: { taijutsu: 0, ninjutsu: 20, bloodline: 0, genjutsu: 0 },
            p2: { taijutsu: 20, ninjutsu: 20, bloodline: 0, genjutsu: 0 },
        },
        economy: { turnCounts: { p1: 0, p2: 0 } },
    };
};
const cast = (match, skillIndex, targetUsername = 'p2', targetSlot = 0) => {
    match.pendingTurns.p1 = {
        queueOrder: [0],
        queuedByActorSlot: { 0: { skillIndex,
            targetSelection: [{ username: targetUsername, slot: targetSlot }] } },
    };
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
};
const hasStatus = (unit, id) => unit.state.statuses.some(status => status.id === id);

test('Lissandra skill costs, cooldowns, and classes match the supplied kit', () => {
    const match = makeMatch();
    const state = match.board.p1[0].state;
    assert.deepEqual(lissandra.skills.map(skill => skill.cooldown), [0, 2, 4, 4]);
    assert.deepEqual(lissandra.skills.map(skill => skill.classes), [
        ['Chakra', 'Instant'], ['Chakra', 'Instant'],
        ['Chakra', 'Instant'], ['Strategic', 'Instant'],
    ]);
    assert.deepEqual(lissandra.skills.map(skill => {
        const cost = computeEffectiveEnergyCost({ skill, actorState: state });
        return [cost.reservedSpecific.ninjutsu, cost.requiredRandom];
    }), [[1, 0], [0, 1], [1, 1], [0, 1]]);
});

test('Lissandra is visible in the live roster and server character script', async () => {
    assert.ok(isActiveCharacter(lissandra));
    assert.ok(ACTIVE_ROSTER_IDS.indexOf('lissandra-the-ice-witch') <
        ACTIVE_ROSTER_IDS.indexOf('ahri-the-nine-tailed-fox'));
    const { app } = require('../server');
    const server = await new Promise(resolve => {
        const instance = app.listen(0, () => resolve(instance));
    });
    try {
        const response = await fetch(`http://127.0.0.1:${server.address().port}/characters.js`);
        assert.equal(response.status, 200);
        assert.match(await response.text(), /"characterId":"lissandra-the-ice-witch"/);
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});

test('Ring of Frost marks one enemy, stuns Physical skills, and Ice Shard splashes only marked targets', () => {
    const match = makeMatch();
    cast(match, 1, 'p2', 0);
    assert.deepEqual(match.board.p2.map(unit => unit.hp), [90, 90, 90]);
    assert.ok(hasStatus(match.board.p2[0], 'lissandra_ring_of_frost'));
    assert.ok(hasStatus(match.board.p2[0], 'lissandra_ring_physical_stun'));
    assert.ok(!hasStatus(match.board.p2[1], 'lissandra_ring_of_frost'));
    cast(match, 0, 'p2', 0);
    assert.deepEqual(match.board.p2.map(unit => unit.hp), [70, 80, 80]);
    cast(match, 0, 'p2', 1);
    assert.deepEqual(match.board.p2.map(unit => unit.hp), [70, 60, 80]);
});

test('Frozen Tomb offers self or enemies, never allies, and resolves each branch', () => {
    const match = makeMatch();
    const options = computeTargetOptions({ match, actingUsername: 'p1', actorSlot: 0,
        skillIndex: 2, characters });
    assert.deepEqual(options.targets.map(target => `${target.username}:${target.slot}`),
        ['p1:0', 'p2:0', 'p2:1', 'p2:2']);
    match.board.p1[0].hp = 60;
    cast(match, 2, 'p1', 0);
    assert.equal(match.board.p1[0].hp, 75);
    assert.ok(isUnitInvulnerableForSkill(match.board.p1[0], ['Physical']));
    assert.deepEqual(match.board.p2.map(unit => unit.hp), [90, 90, 90]);

    const enemyMatch = makeMatch();
    cast(enemyMatch, 2, 'p2', 0);
    assert.equal(enemyMatch.board.p2[0].hp, 65);
    assert.deepEqual(enemyMatch.board.p2.slice(1).map(unit => unit.hp), [90, 90]);
    assert.ok(hasStatus(enemyMatch.board.p2[0], 'lissandra_frozen_tomb_stun'));
    assert.ok(!hasStatus(enemyMatch.board.p1[0], 'lissandra_frozen_tomb_barrier'));
});

test('Glacial Path protects Lissandra and empowers Ring of Frost on the following turn', () => {
    const match = makeMatch();
    cast(match, 3, 'p1', 0);
    assert.ok(isUnitInvulnerableForSkill(match.board.p1[0], ['Physical']));
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    cast(match, 1, 'p2', 0);
    assert.ok(hasStatus(match.board.p2[0], 'lissandra_ring_physical_stun'));
    assert.ok(hasStatus(match.board.p2[0], 'lissandra_ring_chakra_stun'));
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.ok(!hasStatus(match.board.p1[0], 'lissandra_glacial_path'));
    match.board.p1[0].state.cooldowns = {};
    cast(match, 1, 'p2', 1);
    assert.ok(!hasStatus(match.board.p2[1], 'lissandra_ring_chakra_stun'));
});

test('each enemy death creates a Frozen Thrall that shatters at the next turn boundary', () => {
    const match = makeMatch();
    applyDamageToUnit(match.board.p2[0], 100, {
        match, sourceUsername: 'p1', sourceSlot: 0,
        targetUsername: 'p2', targetSlot: 0,
        skillClasses: ['Chakra'], sourceSkillId: 'lissandra-ice-shard',
    });
    assert.equal(match.board.p2[0].alive, false);
    assert.equal(match.pendingFrozenThralls.length, 1);
    assert.ok(match.board.p2[0].state.statuses.some(status => status.id.startsWith('frozen_thrall_')));
    assert.deepEqual(match.board.p2.slice(1).map(unit => unit.hp), [100, 100]);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.deepEqual(match.board.p2.slice(1).map(unit => unit.hp), [90, 90]);
    assert.equal(match.pendingFrozenThralls.length, 0);
    assert.ok(!match.board.p2[0].state.statuses.some(status => status.id.startsWith('frozen_thrall_')));
});
