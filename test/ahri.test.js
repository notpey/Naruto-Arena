const test = require('node:test');
const assert = require('node:assert/strict');
const characters = require('../data/characters');
const { ACTIVE_ROSTER_IDS, isActiveCharacter } = require('../data/activeRoster');
const {
    buildInitialBoard, resolvePendingTurnSkills, tickStatusesForTurnEnd,
    applyDamageToUnit, applyStatus, isUnitInvulnerableForSkill,
    computeEffectiveEnergyCost,
} = require('../battleLogic');

const indexOf = id => characters.findIndex(character => character.id === id);
const ahri = characters[indexOf('ahri-the-nine-tailed-fox')];
const makeMatch = () => {
    const players = [
        { username: 'p1', team: [indexOf('ahri-the-nine-tailed-fox')] },
        { username: 'p2', team: [indexOf('inuzuka-kiba'), indexOf('haruno-sakura'), indexOf('neji-hyuuga')] },
    ];
    return {
        players, board: buildInitialBoard(players, characters), pendingTurns: {},
        chakraPools: {
            p1: { taijutsu: 0, ninjutsu: 0, bloodline: 10, genjutsu: 0 },
            p2: { taijutsu: 10, ninjutsu: 10, bloodline: 0, genjutsu: 0 },
        },
        economy: { turnCounts: { p1: 0, p2: 0 } },
    };
};
const cast = (match, skillIndex, targetSlot = 0) => {
    match.pendingTurns.p1 = {
        queueOrder: [0],
        queuedByActorSlot: { 0: { skillIndex,
            targetSelection: [{ username: skillIndex === 3 ? 'p1' : 'p2',
                slot: skillIndex === 3 ? 0 : targetSlot }] } },
    };
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
};
const withRandom = (value, callback) => {
    const original = Math.random;
    Math.random = () => value;
    try { callback(); } finally { Math.random = original; }
};

test('Ahri is in the live roster with draft costs, classes, and cooldowns', async () => {
    assert.ok(isActiveCharacter(ahri));
    assert.equal(ACTIVE_ROSTER_IDS.at(-1), 'ahri-the-nine-tailed-fox');
    assert.deepEqual(ahri.skills.map(skill => skill.cooldown), [1, 0, 1, 2]);
    assert.deepEqual(ahri.skills.map(skill => skill.classes), [
        ['Chakra', 'Instant'], ['Chakra', 'Instant'],
        ['Strategic', 'Instant'], ['Chakra', 'Instant'],
    ]);
    const state = makeMatch().board.p1[0].state;
    assert.deepEqual(ahri.skills.map(skill => {
        const cost = computeEffectiveEnergyCost({ skill, actorState: state });
        return [cost.reservedSpecific.bloodline, cost.requiredRandom];
    }), [[1, 0], [0, 1], [1, 0], [0, 1]]);
    const { app } = require('../server');
    const server = await new Promise(resolve => {
        const instance = app.listen(0, () => resolve(instance));
    });
    try {
        const response = await fetch(`http://127.0.0.1:${server.address().port}/characters.js`);
        assert.equal(response.status, 200);
        assert.match(await response.text(), /"characterId":"ahri-the-nine-tailed-fox"/);
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});

test('Orb returns at the end of Ahri’s next turn, after the enemy turn', () => {
    const match = makeMatch();
    cast(match, 0);
    assert.equal(match.board.p2[0].hp, 85);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(match.board.p2[0].hp, 85);
    tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.equal(match.board.p2[0].hp, 85);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(match.board.p2[0].hp, 70);
});

test('Orb return is piercing and gains 10 damage if its target is charmed then', () => {
    const match = makeMatch();
    cast(match, 0);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    applyStatus({ targetState: match.board.p2[0].state, statusId: 'test_defense', duration: 2,
        metadata: { destructibleDefensePoints: 20, damageReductionFlat: 10 } });
    cast(match, 2);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(match.board.p2[0].hp, 60);
    assert.equal(match.board.p2[0].state.statuses.find(status =>
        status.id === 'test_defense').metadata.destructibleDefensePoints, 20);
});

test('Fox-Fire sends distinct random fires unless the target is charmed', () => {
    const match = makeMatch();
    withRandom(0, () => cast(match, 1));
    assert.deepEqual(match.board.p2.map(unit => unit.hp), [85, 95, 100]);
    const charmed = makeMatch();
    cast(charmed, 2);
    withRandom(0, () => cast(charmed, 1));
    assert.deepEqual(charmed.board.p2.map(unit => unit.hp), [80, 100, 100]);
    assert.ok(charmed.board.p2[0].state.statuses.some(status => status.id === 'ahri_charm_stun'));
});

test('Essence Theft heals Ahri once per enemy death', () => {
    const match = makeMatch();
    match.board.p1[0].hp = 60;
    applyDamageToUnit(match.board.p2[0], 100, {
        match, sourceUsername: 'p1', sourceSlot: 0,
        targetUsername: 'p2', targetSlot: 0,
        skillClasses: ['Chakra'], sourceSkillId: 'ahri-orb-of-deception',
    });
    assert.equal(match.board.p1[0].hp, 75);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(match.board.p1[0].hp, 75);
});

test('Spirit Rush damages a random enemy and protects Ahri', () => {
    const match = makeMatch();
    withRandom(0, () => cast(match, 3));
    assert.deepEqual(match.board.p2.map(unit => unit.hp), [90, 100, 100]);
    assert.ok(isUnitInvulnerableForSkill(match.board.p1[0], ['Physical']));
});
