const assert = require('node:assert/strict');
const test = require('node:test');
const characters = require('../data/characters');
const battle = require('../battleLogic');
const { ACTIVE_ROSTER_IDS, isActiveCharacter } = require('../data/activeRoster');

const FAIR_FIGHT = 'gekko_hayate_fair_fight_mark';
const CHARGES = 'gekko_hayate_crescent_moon';
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
const makeInvulnerable = (unit) => battle.applyStatus({ targetState: unit.state, statusId: 'test_invulnerable',
    duration: 2, sourceUsername: 'p2', sourceSlot: 0, metadata: { helpful: true, invulnerable: true } });
const charges = (match) => status(match.board.p1[1], CHARGES)?.metadata.charges || 0;

test('Hayate draft kit matches names, costs, cooldowns, and roster', () => {
    const hayate = characters[indexOf('gekko-hayate')];
    assert.equal(hayate.passive.name, 'Fair Fight');
    assert.deepEqual(hayate.skills.map((skill) => [skill.name, skill.energy, skill.cooldown]), [
        ['Crescent Moon Slash', ['Taijutsu'], 0], ['Dance of the Crescent Moon', ['Genjutsu', 'Random'], 1],
        ['Eavesdrop', ['Genjutsu'], 2], ['Backflip Dodge', ['Random'], 4],
    ]);
    assert.ok(ACTIVE_ROSTER_IDS.includes('gekko-hayate'));
    assert.ok(isActiveCharacter(hayate));
    assert.equal(hayate.requiredMissionId, 'the-moonlight-of-the-leaf');
});

test('Fair Fight marks the enemy in the same slot as Hayate', () => {
    const match = matchFor(['haruno-sakura', 'gekko-hayate', 'tenten'], ['tenten', 'mizuki', 'haku']);
    assert.deepEqual(match.board.p2.map((unit) => Boolean(status(unit, FAIR_FIGHT))), [false, true, false]);
    assert.equal(status(match.board.p2[1], FAIR_FIGHT).metadata.statusIcon,
        characters[indexOf('gekko-hayate')].passive.icon);
});

test('Fair Fight adds 5 damage and ignores invulnerability only against the opposite enemy', () => {
    const match = matchFor(['haruno-sakura', 'gekko-hayate'], ['tenten', 'mizuki']);
    cast(match, 'p1', 1, 0, 'p2', 1);
    assert.equal(match.board.p2[1].hp, 75, 'opposite enemy takes 20 + 5');
    cast(match, 'p1', 1, 0, 'p2', 0);
    assert.equal(match.board.p2[0].hp, 80, 'other enemies take the base 20');

    match.board.p2.forEach(makeInvulnerable);
    const targets = battle.computeTargetOptions({
        characters, match, actingUsername: 'p1', actorSlot: 1, skillIndex: 0,
    }).targets.map((target) => target.slot);
    assert.deepEqual(targets, [1], 'only the opposite enemy can be targeted through invulnerability');
    cast(match, 'p1', 1, 0, 'p2', 1);
    assert.equal(match.board.p2[1].hp, 50);
});

test('Crescent Moon Slash builds charges and Dance spends them for 10 damage each', () => {
    const match = matchFor(['haruno-sakura', 'gekko-hayate'], ['tenten', 'mizuki']);
    cast(match, 'p1', 1, 0, 'p2', 0);
    cast(match, 'p1', 1, 0, 'p2', 0);
    assert.equal(charges(match), 2);
    assert.equal(match.board.p2[0].hp, 60);
    cast(match, 'p1', 1, 1, 'p2', 0);
    assert.equal(match.board.p2[0].hp, 10, '30 + 2 charges x 10');
    assert.equal(charges(match), 0, 'Dance spends every charge');
    assert.ok(status(match.board.p1[1], 'gekko_hayate_dance_invulnerable'));
});

test('Eavesdrop counters the first physical or chakra skill and grants a charge', () => {
    const match = matchFor(['haruno-sakura', 'gekko-hayate'], ['mizuki', 'tenten']);
    cast(match, 'p1', 1, 2);
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    cast(match, 'p2', 1, 0, 'p1', 1);
    assert.equal(match.board.p1[1].hp, 100, 'the physical skill is countered');
    assert.equal(charges(match), 1);
    assert.equal(status(match.board.p1[1], 'gekko_hayate_eavesdrop'), undefined, 'only the first is countered');
});
