const assert = require('node:assert/strict');
const test = require('node:test');
const characters = require('../data/characters');
const battle = require('../battleLogic');
const { ACTIVE_ROSTER_IDS, isActiveCharacter } = require('../data/activeRoster');

const indexOf = (id) => characters.findIndex((character) => character.id === id);
const pool = () => ({ taijutsu: 10, ninjutsu: 10, bloodline: 10, genjutsu: 10 });
const totalChakra = (match, username) => Object.values(match.chakraPools[username])
    .reduce((sum, value) => sum + value, 0);
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
    characters, rosterIndex: indexOf('mitarashi-anko'), skillIndex, actorState: match.board.p1[0].state,
}).id;

test('Anko draft kit matches names, costs, cooldowns, and roster', () => {
    const anko = characters[indexOf('mitarashi-anko')];
    assert.equal(anko.passive.name, "Anko's Cursed Seal");
    assert.deepEqual(anko.skills.map((skill) => [skill.name, skill.energy, skill.cooldown]), [
        ['Dual Pin', ['Random'], 2], ['Dragon Fire', ['Ninjutsu'], 1],
        ['Hidden Shadow Snake Hand', ['Ninjutsu', 'Random'], 1], ['Quick Reflexes', ['Random'], 4],
        ['Twin Snakes Mutual Death', ['Ninjutsu', 'Ninjutsu'], 0],
    ]);
    assert.ok(ACTIVE_ROSTER_IDS.includes('mitarashi-anko'));
    assert.ok(isActiveCharacter(anko));
    assert.equal(anko.requiredMissionId, 'the-survivor-of-the-seal');
});

test('Dual Pin pierces, strips defenses, amplifies affliction, and unlocks Twin Snakes for 1 turn', () => {
    const match = matchFor(['mitarashi-anko'], ['haruno-sakura', 'tenten']);
    battle.applyStatus({ targetState: match.board.p2[0].state, statusId: 'test_reduction', duration: 3,
        sourceUsername: 'p2', sourceSlot: 0, metadata: { helpful: true, damageReductionFlat: 10 } });
    cast(match, 'p1', 0, 0, 'p2', 0);
    assert.equal(match.board.p2[0].hp, 95, '5 piercing damage');
    assert.ok(status(match.board.p2[0], 'mitarashi_anko_dual_pin_debuff'));
    assert.equal(effectiveId(match, 0), 'mitarashi-anko-twin-snakes-mutual-death');

    cast(match, 'p1', 0, 1);
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.deepEqual(match.board.p2.map((unit) => unit.hp), [85, 95],
        'Dragon Fire ticks 5, plus 5 on the pinned enemy');
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(effectiveId(match, 0), 'mitarashi-anko-dual-pin', 'Twin Snakes is only available for 1 turn');
    assert.equal(status(match.board.p2[0], 'mitarashi_anko_dual_pin_debuff'), undefined);
});

test('Hidden Shadow Snake Hand deals physical damage now and affliction on the following 3 turns', () => {
    const match = matchFor(['mitarashi-anko'], ['haruno-sakura']);
    battle.applyStatus({ targetState: match.board.p2[0].state, statusId: 'test_reduction', duration: 9,
        sourceUsername: 'p2', sourceSlot: 0, metadata: { helpful: true, damageReductionFlat: 5 } });
    cast(match, 'p1', 0, 2, 'p2');
    assert.equal(match.board.p2[0].hp, 85, '20 physical damage is reduced by damage reduction');
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(match.board.p2[0].hp, 85, 'no affliction on the cast turn');
    for (const expected of [80, 75, 70]) {
        battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
        battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
        assert.equal(match.board.p2[0].hp, expected);
    }
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(match.board.p2[0].hp, 70);
});

test('Twin Snakes Mutual Death executes the pinned enemy and then Anko, whose death grants chakra', () => {
    const match = matchFor(['mitarashi-anko', 'haruno-sakura'], ['tenten', 'mizuki']);
    cast(match, 'p1', 0, 0, 'p2', 1);
    assert.deepEqual(battle.computeTargetOptions({
        characters, match, actingUsername: 'p1', actorSlot: 0, skillIndex: 0,
    }).targets.map((target) => target.slot), [1], 'only the pinned enemy can be targeted');
    const chakraBefore = totalChakra(match, 'p1');
    cast(match, 'p1', 0, 0, 'p2', 1);
    assert.equal(match.board.p2[1].alive, false);
    assert.equal(match.board.p2[0].alive, true);
    assert.equal(match.board.p1[0].alive, false, 'Anko is executed afterward');
    assert.equal(totalChakra(match, 'p1'), chakraBefore + 1, 'her death grants her team 1 chakra');
});

test("Anko's Cursed Seal grants chakra only once", () => {
    const match = matchFor(['mitarashi-anko'], ['haruno-sakura']);
    const chakraBefore = totalChakra(match, 'p1');
    battle.applyDamageToUnit(match.board.p1[0], 200, { match, sourceUsername: 'p2', sourceSlot: 0,
        targetUsername: 'p1', targetSlot: 0 });
    assert.equal(match.board.p1[0].alive, false);
    assert.equal(totalChakra(match, 'p1'), chakraBefore + 1);
});
