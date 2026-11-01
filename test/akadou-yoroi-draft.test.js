const assert = require('node:assert/strict');
const test = require('node:test');
const characters = require('../data/characters');
const { buildInitialBoard, resolvePendingTurnSkills, tickStatusesForTurnEnd,
    isUnitInvulnerableForSkill } = require('../battleLogic');

const indexOf = id => characters.findIndex(character => character.id === id);
const makeMatch = () => {
    const players = [
        { username: 'p1', team: [indexOf('akadou-yoroi')] },
        { username: 'p2', team: [indexOf('haruno-sakura')] },
    ];
    return {
        players, board: buildInitialBoard(players, characters), pendingTurns: {},
        chakraPools: {
            p1: { taijutsu: 0, ninjutsu: 0, bloodline: 0, genjutsu: 0 },
            p2: { taijutsu: 0, ninjutsu: 0, bloodline: 0, genjutsu: 0 },
        },
        economy: { turnCounts: { p1: 0, p2: 0 } },
    };
};
const cast = (match, skillIndex, target = false) => {
    match.pendingTurns.p1 = {
        queueOrder: [0],
        queuedByActorSlot: { 0: { skillIndex,
            targetSelection: target ? [{ username: 'p2', slot: 0 }] : [] } },
    };
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
};
const hasStatus = (unit, id) => unit.state.statuses.some(status =>
    status.id === id && status.remainingTurns > 0);

test('Yoroi lifesteals the health damage Energy Drain deals', () => {
    const match = makeMatch();
    const yoroi = match.board.p1[0];
    yoroi.hp = 50;
    cast(match, 1, true);
    assert.equal(match.board.p2[0].hp, 80);
    assert.equal(yoroi.hp, 70);
    assert.equal(characters[indexOf('akadou-yoroi')].requiredMissionId, 'the-sounds-amongst-the-leaves');
});

test('Close Quarters does not heal when defense absorbs all skill damage', () => {
    const match = makeMatch();
    const yoroi = match.board.p1[0];
    yoroi.hp = 50;
    match.board.p2[0].state.statuses.push({
        id: 'test_defense', remainingTurns: 1,
        metadata: { destructibleDefensePoints: 20 },
    });
    cast(match, 1, true);
    assert.equal(match.board.p2[0].hp, 100);
    assert.equal(yoroi.hp, 50);
});

test('Chakra and Life Absorption enhances repeated Energy Drain casts', () => {
    const match = makeMatch();
    match.chakraPools.p2.taijutsu = 2;
    cast(match, 0);
    assert.ok(hasStatus(match.board.p1[0], 'akadou_yoroi_chakra_and_life_absorption'));
    cast(match, 1, true);
    assert.equal(match.chakraPools.p2.taijutsu, 1);
    assert.equal(match.chakraPools.p1.taijutsu, 1);
    assert.ok(hasStatus(match.board.p1[0], 'akadou_yoroi_chakra_and_life_absorption'));
    cast(match, 1, true);
    assert.equal(match.chakraPools.p2.taijutsu, 0);
    assert.equal(match.chakraPools.p1.taijutsu, 2);
});

test('Draining Assault deals physical damage and steals chakra on enhanced ticks', () => {
    const match = makeMatch();
    const yoroi = match.board.p1[0];
    yoroi.hp = 40;
    match.chakraPools.p2.ninjutsu = 3;
    cast(match, 0);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    cast(match, 2, true);
    const dot = match.board.p2[0].state.statuses.find(status =>
        status.id === 'akadou_yoroi_draining_assault_dot');
    assert.equal(dot.remainingTurns, 3);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(match.board.p2[0].hp, 85);
    assert.equal(yoroi.hp, 55);
    assert.equal(match.chakraPools.p2.ninjutsu, 2);
    assert.equal(match.chakraPools.p1.ninjutsu, 1);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(match.board.p2[0].hp, 70);
    assert.equal(yoroi.hp, 70);
    assert.equal(match.chakraPools.p2.ninjutsu, 1);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(match.board.p2[0].hp, 55);
    assert.equal(yoroi.hp, 85);
    assert.equal(match.chakraPools.p2.ninjutsu, 1,
        'Chakra drain ends when Chakra and Life Absorption expires');
    assert.ok(!hasStatus(match.board.p2[0], 'akadou_yoroi_draining_assault_dot'));
});

test('Draining Assault without enhancement damages and lifesteals without chakra drain', () => {
    const match = makeMatch();
    match.board.p1[0].hp = 60;
    match.chakraPools.p2.taijutsu = 2;
    cast(match, 2, true);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(match.board.p2[0].hp, 85);
    assert.equal(match.board.p1[0].hp, 75);
    assert.equal(match.chakraPools.p2.taijutsu, 2);
    assert.equal(match.chakraPools.p1.taijutsu, 0);
});

test('Chakra Block grants one turn of invulnerability', () => {
    const match = makeMatch();
    cast(match, 3);
    assert.ok(isUnitInvulnerableForSkill(match.board.p1[0], ['Physical']));
});
