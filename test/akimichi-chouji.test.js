const assert = require('node:assert/strict');
const test = require('node:test');
const characters = require('../data/characters');
const battle = require('../battleLogic');

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
const effectiveId = (match, skillIndex) => battle.resolveEffectiveSkill({
    characters, rosterIndex: indexOf('akimichi-chouji'), skillIndex,
    actorState: match.board.p1[0].state,
}).id;
const takePills = (match, count) => {
    for (let pill = 0; pill < count; pill += 1) {
        match.board.p1[0].state.cooldowns = {};
        cast(match, 'p1', 0, 2);
    }
};

test('Chouji draft kit matches names, costs, and cooldowns', () => {
    const chouji = characters[indexOf('akimichi-chouji')];
    assert.equal(chouji.passive.name, 'Butterfly Mode');
    assert.deepEqual(chouji.skills.map((skill) => [skill.name, skill.energy, skill.cooldown]), [
        ['Partial Double Size', ['Taijutsu'], 0], ['Meat Tank', ['Bloodline'], 1],
        ['Akimichi Pills', [], 1], ['Snack Time!', ['Random'], 4],
        ['Butterfly Finale', ['Taijutsu'], 0], ['Butterfly Reflexes', ['Bloodline'], 1],
    ]);
});

test('Akimichi Pills cost 15 affliction health and add 10 damage per pill', () => {
    const match = matchFor(['akimichi-chouji'], ['haruno-sakura']);
    takePills(match, 2);
    assert.equal(match.board.p1[0].hp, 70);
    assert.equal(status(match.board.p1[0], 'akimichi_chouji_akimichi_pills').metadata.pillCount, 2);
    assert.equal(status(match.board.p1[0], 'akimichi_chouji_butterfly_mode_active'), undefined);
    cast(match, 'p1', 0, 0, 'p2');
    assert.equal(match.board.p2[0].hp, 60, 'Partial Double Size deals 20 plus 20');
});

test('Meat Tank hits a random enemy and grants physical and chakra invulnerability', () => {
    const match = matchFor(['akimichi-chouji'], ['haruno-sakura', 'tenten']);
    takePills(match, 1);
    cast(match, 'p1', 0, 1);
    assert.deepEqual(match.board.p2.map((unit) => unit.hp).sort(), [100, 70]);
    assert.deepEqual(status(match.board.p1[0], 'akimichi_chouji_meat_tank').metadata
        .invulnerableToSkillClasses, ['physical', 'chakra']);
    assert.ok(battle.isUnitInvulnerableForSkill(match.board.p1[0], ['Physical']));
    assert.ok(!battle.isUnitInvulnerableForSkill(match.board.p1[0], ['Strategic']));
});

test('the third pill enters Butterfly Mode with replaced skills, reduction, and face picture', () => {
    const match = matchFor(['akimichi-chouji'], ['haruno-sakura']);
    takePills(match, 3);
    const butterfly = status(match.board.p1[0], 'akimichi_chouji_butterfly_mode_active');
    assert.ok(butterfly);
    assert.equal(butterfly.metadata.facePictureOverride, 'https://i.imgur.com/8560MPe.png');
    assert.equal(effectiveId(match, 0), 'akimichi-chouji-butterfly-finale');
    assert.equal(effectiveId(match, 1), 'akimichi-chouji-butterfly-reflexes');
    match.board.p1[0].state.cooldowns = {};
    const hpBefore = match.board.p1[0].hp;
    cast(match, 'p1', 0, 2);
    assert.equal(match.board.p1[0].hp, hpBefore, 'Akimichi Pills cannot be used a fourth time');
    cast(match, 'p2', 0, 0, 'p1');
    assert.equal(match.board.p1[0].hp, hpBefore - 5, 'Kunai Interference 15 minus 10 unpierceable reduction');
});

test('Butterfly Mode ignores enemy non-damage effects but keeps their damage', () => {
    const match = matchFor(['akimichi-chouji'], ['haruno-sakura', 'tsuchi-kin']);
    cast(match, 'p2', 0, 0, 'p1');
    assert.ok(status(match.board.p1[0], 'haruno_sakura_kunai_interference_debuff')
        || match.board.p1[0].state.statuses.some((entry) => entry.sourceUsername === 'p2'),
    'an enemy debuff is on Chouji before Butterfly Mode');
    takePills(match, 3);
    assert.ok(!match.board.p1[0].state.statuses.some((entry) =>
        entry.sourceUsername === 'p2' && !(entry.metadata.turnEndDamage > 0)),
    'existing enemy non-damage effects are removed on entry');

    cast(match, 'p2', 1, 2, 'p1');
    const bells = status(match.board.p1[0], 'tsuchi_kin_unnerving_bells');
    assert.equal(bells.metadata.turnEndDamage, 10);
    assert.equal(bells.metadata.genjutsuCostIncrease, undefined, 'the cost increase is ignored');
    const hpBefore = match.board.p1[0].hp;
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.equal(match.board.p1[0].hp, hpBefore - 10, 'the affliction damage still applies');

    match.board.p2[1].state.cooldowns = {};
    cast(match, 'p2', 1, 1, 'p1');
    assert.equal(status(match.board.p1[0], 'tsuchi_kin_needle_and_bell_trap_stun'), undefined,
        'stuns are ignored');
    match.chakraPools.p1 = pool();
    battle.applyStatus({ targetState: match.board.p1[0].state, statusId: 'test_stun', duration: 1,
        sourceUsername: 'p2', sourceSlot: 0, metadata: { harmful: true, cannotUseSkills: true } });
    assert.equal(status(match.board.p1[0], 'test_stun'), undefined);
});

test('Butterfly Reflexes marks its target and Finale heals Chouji on a kill', () => {
    const match = matchFor(['akimichi-chouji'], ['haruno-sakura']);
    takePills(match, 3);
    match.board.p1[0].state.cooldowns = {};
    cast(match, 'p1', 0, 1, 'p2');
    assert.equal(match.board.p2[0].hp, 60);
    assert.ok(status(match.board.p1[0], 'akimichi_chouji_butterfly_reflexes'));
    assert.ok(status(match.board.p2[0], 'akimichi_chouji_butterfly_reflexes_mark'));
    const hpBefore = match.board.p1[0].hp;
    cast(match, 'p1', 0, 0, 'p2');
    assert.equal(match.board.p2[0].alive, false, 'Finale deals 50 plus 10 against the mark');
    assert.equal(match.board.p1[0].hp, hpBefore + 10);
});

test('Chouji is included in the playable roster', () => {
    const { ACTIVE_ROSTER_IDS, isActiveCharacter } = require('../data/activeRoster');
    const chouji = characters[indexOf('akimichi-chouji')];
    assert.ok(ACTIVE_ROSTER_IDS.includes('akimichi-chouji'));
    assert.ok(isActiveCharacter(chouji));
    assert.ok(!chouji.requiredMissionId);
});
