const test = require('node:test');
const assert = require('node:assert/strict');
const { buildInitialBoard, resolvePendingTurnSkills } = require('../battleLogic');
const tenten = require('../data/characters/tenten');

const attacker = {
    id: 'passive-test-attacker', characterId: 'passive-test-attacker', name: 'Attacker',
    skills: [
        { id: 'splash', name: 'Splash', target: 'single-enemy', energy: [], cooldown: 0,
            classes: ['Physical', 'Instant'], effects: [
                { type: 'damage', amount: 10, scope: 'target' },
                { type: 'damage', amount: 10, scope: 'all-other-enemy' },
            ] },
        { id: 'area', name: 'Area', target: 'all-enemy', energy: [], cooldown: 0,
            classes: ['Chakra', 'Instant'], effects: [
                { type: 'damage', amount: 10, scope: 'all-enemy' },
                { type: 'damage', amount: 10, scope: 'all-enemy' },
            ] },
        { id: 'mark', name: 'Mark', target: 'single-enemy', energy: [], cooldown: 0,
            classes: ['Strategic', 'Instant'], effects: [
                { type: 'apply_status', statusId: 'test_mark', duration: 1, scope: 'target',
                    metadata: { harmful: true } },
            ] },
        { id: 'direct', name: 'Direct', target: 'single-enemy', energy: [], cooldown: 0,
            classes: ['Physical', 'Instant'], effects: [
                { type: 'damage', amount: 10, scope: 'target' },
            ] },
    ],
};
const ally = { id: 'passive-test-ally', characterId: 'passive-test-ally', name: 'Ally', skills: [] };
const characters = [tenten, attacker, ally];
const makeMatch = () => {
    const players = [{ username: 'a', team: [0, 2] }, { username: 'b', team: [1] }];
    return { players, board: buildInitialBoard(players, characters), pendingTurns: {},
        chakraPools: { a: {}, b: {} }, economy: { turnCounts: { a: 0, b: 0 } } };
};
const cast = (match, skillIndex, targetSlot = null) => {
    match.pendingTurns.b = { queueOrder: [0], queuedByActorSlot: { 0: {
        skillIndex, targetSelection: targetSlot === null ? [] : [{ username: 'a', slot: targetSlot }],
    } } };
    resolvePendingTurnSkills({ match, actingUsername: 'b', characters });
};

test('Sharp Tools retaliates when Tenten is hit by splash damage', () => {
    const match = makeMatch();
    cast(match, 0, 1);
    assert.equal(match.board.a[0].hp, 90);
    assert.equal(match.board.a[1].hp, 90);
    assert.equal(match.board.b[0].hp, 95);
});

test('Sharp Tools retaliates once against a multi-hit area skill', () => {
    const match = makeMatch();
    cast(match, 1);
    assert.equal(match.board.a[0].hp, 80);
    assert.equal(match.board.b[0].hp, 95);
});

test('Sharp Tools ignores non-damaging skills and damage aimed only at allies', () => {
    const match = makeMatch();
    cast(match, 2, 0);
    assert.equal(match.board.b[0].hp, 100);
    cast(match, 3, 1);
    assert.equal(match.board.b[0].hp, 100);
});
