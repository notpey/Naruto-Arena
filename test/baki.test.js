const assert = require('node:assert/strict');
const test = require('node:test');
const characters = require('../data/characters');
const battle = require('../battleLogic');
const { ACTIVE_ROSTER_IDS, isActiveCharacter } = require('../data/activeRoster');

const THRESHOLD = 'baki_no_witnesses_threshold';
const indexOf = (id) => characters.findIndex((character) => character.id === id);
const pool = () => ({ taijutsu: 10, ninjutsu: 10, bloodline: 10, genjutsu: 10 });
const status = (unit, id) => unit.state.statuses.find((entry) =>
    entry.id === id && entry.remainingTurns > 0);
const matchFor = (allies, enemies) => {
    const players = [
        { username: 'p1', team: allies.map(indexOf) },
        { username: 'p2', team: enemies.map(indexOf) },
    ];
    const match = {
        players, board: battle.buildInitialBoard(players, characters),
        chakraPools: { p1: pool(), p2: pool() },
        economy: { turnCounts: { p1: 0, p2: 0 } }, pendingTurns: {},
    };
    Object.entries(match.board).forEach(([username, units]) =>
        units.forEach((unit) => { unit.username = username; }));
    return match;
};
const cast = (match, username, actorSlot, skillIndex, targetUsername = null, targetSlot = 0) => {
    match.pendingTurns[username] = {
        queueOrder: [actorSlot],
        queuedByActorSlot: { [actorSlot]: {
            skillIndex,
            targetSelection: targetUsername ? [{ username: targetUsername, slot: targetSlot }] : [],
        } },
    };
    battle.resolvePendingTurnSkills({ match, actingUsername: username, characters });
};

test('Baki draft kit matches names, costs, cooldowns, and roster', () => {
    const baki = characters[indexOf('baki')];
    assert.equal(baki.passive.name, 'No Witnesses');
    assert.deepEqual(baki.skills.map((skill) => [skill.name, skill.energy, skill.cooldown]), [
        ['Sudden Strike', ['Genjutsu'], 0], ['Wind Blade', ['Ninjutsu', 'Genjutsu'], 0],
        ['Flak Jacket', ['Random', 'Random'], 4], ['Baki Teleportation', ['Random'], 4],
    ]);
    assert.ok(ACTIVE_ROSTER_IDS.includes('baki'));
    assert.ok(isActiveCharacter(baki));
    assert.ok(!baki.requiredMissionId);
});

test('Sudden Strike and Wind Blade pierce damage reduction', () => {
    const match = matchFor(['baki'], ['haruno-sakura']);
    battle.applyStatus({ targetState: match.board.p2[0].state, statusId: 'test_reduction', duration: 2,
        sourceUsername: 'p2', sourceSlot: 0, metadata: { helpful: true, damageReductionFlat: 15 } });
    cast(match, 'p1', 0, 0, 'p2');
    assert.equal(match.board.p2[0].hp, 80);
    cast(match, 'p1', 0, 1, 'p2');
    assert.equal(match.board.p2[0].hp, 40);
});

test('No Witnesses executes enemies left at 5 health or less, but not above it', () => {
    const match = matchFor(['baki'], ['haruno-sakura', 'tenten']);
    match.board.p2[0].hp = 25;
    cast(match, 'p1', 0, 0, 'p2', 0);
    assert.equal(match.board.p2[0].alive, false, '25 - 20 = 5 is executed');
    match.board.p2[1].hp = 26;
    cast(match, 'p1', 0, 0, 'p2', 1);
    assert.equal(match.board.p2[1].hp, 6, '6 health survives');
    assert.notEqual(match.board.p2[1].alive, false);
});

test('Flak Jacket raises the execute threshold against enemies who use physical or chakra skills on Baki', () => {
    const match = matchFor(['baki'], ['haruno-sakura', 'nara-shikamaru']);
    cast(match, 'p1', 0, 2);
    cast(match, 'p2', 0, 0, 'p1');
    assert.equal(status(match.board.p2[0], THRESHOLD).metadata.executeThresholdBonusForSource, 5);
    match.board.p2[0].state.cooldowns = {};
    cast(match, 'p2', 0, 0, 'p1');
    assert.equal(status(match.board.p2[0], THRESHOLD).metadata.executeThresholdBonusForSource, 10,
        'the increase stacks permanently');
    cast(match, 'p2', 1, 0, 'p1');
    assert.equal(status(match.board.p2[1], THRESHOLD), undefined, 'strategic skills do not raise it');

    match.board.p2[0].hp = 35;
    cast(match, 'p1', 0, 0, 'p2', 0);
    assert.equal(match.board.p2[0].alive, false, '35 - 20 = 15 is within the raised threshold of 15');
});

test('Flak Jacket ignores enemy non-damage effects only while its defense remains', () => {
    const match = matchFor(['baki'], ['haruno-sakura', 'tsuchi-kin']);
    cast(match, 'p1', 0, 2);
    assert.equal(status(match.board.p1[0], 'baki_flak_jacket').metadata.destructibleDefensePoints, 50);
    cast(match, 'p2', 1, 2, 'p1');
    const bells = status(match.board.p1[0], 'tsuchi_kin_unnerving_bells');
    assert.equal(bells.metadata.genjutsuCostIncrease, undefined, 'the cost increase is ignored');

    match.board.p1[0].state.statuses = match.board.p1[0].state.statuses
        .filter((entry) => entry.id !== 'tsuchi_kin_unnerving_bells');
    battle.applyDamageToUnit(match.board.p1[0], 50, { match, sourceUsername: 'p2', sourceSlot: 0,
        targetUsername: 'p1', targetSlot: 0 });
    assert.equal(match.board.p1[0].hp, 100, 'the defense absorbs the hit');
    match.board.p2[1].state.cooldowns = {};
    cast(match, 'p2', 1, 2, 'p1');
    assert.equal(status(match.board.p1[0], 'tsuchi_kin_unnerving_bells').metadata.genjutsuCostIncrease, 1,
        'once the defense is gone, non-damage effects apply again');
    match.board.p2[0].state.cooldowns = {};
    cast(match, 'p2', 0, 0, 'p1');
    assert.equal(status(match.board.p2[0], THRESHOLD), undefined,
        'the threshold no longer grows without the defense');
});

test('Baki Teleportation makes him invulnerable for 1 turn', () => {
    const match = matchFor(['baki'], ['haruno-sakura']);
    cast(match, 'p1', 0, 3);
    assert.ok(battle.isUnitInvulnerableForSkill(match.board.p1[0], ['Physical']));
});
