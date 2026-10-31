const assert = require('node:assert/strict');
const test = require('node:test');
const characters = require('../data/characters');
const { buildInitialBoard, resolvePendingTurnSkills, applyHealToUnit } = require('../battleLogic');

const indexOf = id => characters.findIndex(character => character.id === id);
const makeMatch = (enemyTeam = ['inuzuka-kiba'], allyTeam = ['kankuro']) => {
    const players = [
        { username: 'p1', team: allyTeam.map(indexOf) },
        { username: 'p2', team: enemyTeam.map(indexOf) },
    ];
    return {
        players,
        board: buildInitialBoard(players, characters),
        pendingTurns: {},
        chakraPools: {
            p1: { taijutsu: 0, ninjutsu: 0, bloodline: 0, genjutsu: 0 },
            p2: { taijutsu: 0, ninjutsu: 0, bloodline: 0, genjutsu: 0 },
        },
        economy: { turnCounts: { p1: 0, p2: 0 } },
    };
};
const cast = (match, username, skillIndex, targetUsername = null, actorSlot = 0, targetSlot = 0) => {
    match.pendingTurns[username] = {
        queueOrder: [actorSlot],
        queuedByActorSlot: { [actorSlot]: { skillIndex,
            targetSelection: targetUsername ? [{ username: targetUsername, slot: targetSlot }] : [] } },
    };
    resolvePendingTurnSkills({ match, actingUsername: username, characters });
};

test('Kankuro starts with 15 defense and One Shot gains 15 damage against a trapped target', () => {
    const match = makeMatch();
    const kankuro = match.board.p1[0];
    const target = match.board.p2[0];
    assert.equal(kankuro.state.statuses.find(status =>
        status.id === 'kankuro_puppet_preparation_defense').metadata.destructibleDefensePoints, 15);

    cast(match, 'p1', 2, 'p2');
    assert.ok(target.state.statuses.some(status => status.id === 'kankuro_puppet_trap'));
    cast(match, 'p1', 0, 'p2');
    assert.equal(target.hp, 55);
});

test('Poison Bomb damages every enemy and blocks healing', () => {
    const match = makeMatch(['inuzuka-kiba', 'haruno-sakura']);
    cast(match, 'p1', 1);
    assert.deepEqual(match.board.p2.map(unit => unit.hp), [90, 90]);
    for (const unit of match.board.p2) {
        assert.ok(unit.state.statuses.some(status => status.id === 'kankuro_poison_bomb_no_heal'));
        assert.equal(applyHealToUnit(unit, 20), 0);
        assert.equal(unit.hp, 90);
    }
});

test('Puppet Trap counters Strategic skills, stuns Physical and Strategic, and renews defense', () => {
    const match = makeMatch();
    const kankuro = match.board.p1[0];
    const enemy = match.board.p2[0];
    cast(match, 'p1', 2, 'p2');
    kankuro.state.statuses.find(status =>
        status.id === 'kankuro_puppet_preparation_defense').metadata.destructibleDefensePoints = 4;
    cast(match, 'p2', 0, 'p1');
    assert.ok(!kankuro.state.statuses.some(status => status.id === 'inuzuka_kiba_dynamic_air_marking'));
    assert.equal(kankuro.state.statuses.find(status =>
        status.id === 'kankuro_puppet_preparation_defense').metadata.destructibleDefensePoints, 15);
    assert.deepEqual(enemy.state.statuses.find(status =>
        status.id === 'kankuro_puppet_trap_stun').metadata.cannotUseSkillClasses,
        ['physical', 'strategic']);
});

test('Puppet Trap also counters helpful Strategic skills used by its target', () => {
    const match = makeMatch(['haruno-sakura']);
    cast(match, 'p1', 2, 'p2');
    cast(match, 'p2', 2);
    const sakura = match.board.p2[0];
    assert.ok(!sakura.state.statuses.some(status => status.id === 'haruno_sakura_clone_technique'));
    assert.deepEqual(sakura.state.statuses.find(status =>
        status.id === 'kankuro_puppet_trap_stun').metadata.cannotUseSkillClasses,
        ['physical', 'strategic']);
    assert.equal(match.combatEvents.at(-1).outcome, 'countered');
});

test('Kankuro renews defense when an ally counters an enemy skill', () => {
    const match = makeMatch(['inuzuka-kiba'], ['kankuro', 'hatake-kakashi']);
    const kankuro = match.board.p1[0];
    kankuro.state.statuses = kankuro.state.statuses.filter(status =>
        status.id !== 'kankuro_puppet_preparation_defense');
    cast(match, 'p1', 0, null, 1);
    cast(match, 'p2', 0, 'p1', 0, 1);
    assert.equal(kankuro.state.statuses.find(status =>
        status.id === 'kankuro_puppet_preparation_defense').metadata.destructibleDefensePoints, 15);
    assert.equal(match.combatEvents.at(-1).counterSourceCharacterId, 'hatake-kakashi');
});
