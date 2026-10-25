const test = require('node:test');
const assert = require('node:assert/strict');
const battle = require('../battleLogic');
const roster = require('../data/characters');
const { ACTIVE_ROSTER_IDS } = require('../data/activeRoster');
const ebisu = require('../data/characters/ebisu');

const fighter = {
    id: 'ebisu-test-fighter', characterId: 'ebisu-test-fighter', name: 'Test Fighter',
    skills: [
        { id: 'test-expensive-hit', name: 'Expensive Hit', energy: ['Taijutsu', 'Random'],
            target: 'single-enemy', cooldown: 0, classes: ['Physical', 'Instant'],
            effects: [{ type: 'damage', amount: 15, scope: 'target' }] },
        { id: 'test-cheap-hit', name: 'Cheap Hit', energy: ['Taijutsu'],
            target: 'single-enemy', cooldown: 0, classes: ['Physical', 'Instant'],
            effects: [{ type: 'damage', amount: 15, scope: 'target' }] },
        { id: 'test-helpful', name: 'Helpful', energy: [],
            target: 'self', cooldown: 0, classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: 'test_helpful', duration: 1,
                scope: 'self', metadata: { helpful: true } }] },
    ],
};
const characters = [ebisu, fighter];
const has = (unit, id) => unit.state.statuses.some((entry) =>
    entry.id === id && entry.remainingTurns > 0);
const status = (unit, id) => unit.state.statuses.find((entry) =>
    entry.id === id && entry.remainingTurns > 0);

function makeMatch() {
    const players = [
        { username: 'p1', team: [0, 1, 1] },
        { username: 'p2', team: [1, 1, 1] },
    ];
    return {
        players, board: battle.buildInitialBoard(players, characters),
        currentTurn: 'p1', turnOrder: ['p1', 'p2'], pendingTurns: {},
        chakraPools: {
            p1: { taijutsu: 20, ninjutsu: 20, bloodline: 20, genjutsu: 20 },
            p2: { taijutsu: 20, ninjutsu: 20, bloodline: 20, genjutsu: 20 },
        },
        economy: { turnCounts: { p1: 0, p2: 0 } }, combatEvents: [],
    };
}

function cast(match, username, actorSlot, skillIndex, targetUsername, targetSlot) {
    match.currentTurn = username;
    match.pendingTurns[username] = {
        queueOrder: [actorSlot], queuedByActorSlot: {
            [actorSlot]: { skillIndex, targetSelection: targetUsername
                ? [{ username: targetUsername, slot: targetSlot }] : [] },
        },
    };
    battle.resolvePendingTurnSkills({ match, actingUsername: username, characters });
}

test('Ebisu is in the active roster with four draft skills', () => {
    assert.ok(roster.some((character) => character.id === ebisu.id));
    assert.ok(ACTIVE_ROSTER_IDS.includes(ebisu.id));
    assert.deepEqual(ebisu.skills.map((skill) => skill.name), [
        'Water Walking', 'Textbook Taijutsu', 'Strict Discipline', 'To The Skies',
    ]);
});

test('Mentor Fundamentals grants opening chakra and repeats every third own turn while Ebisu lives', () => {
    const match = makeMatch();
    const count = (username, key, turn = 0) =>
        battle.getLivingTeamPassiveChakraCount(match, characters, username, key, turn);
    assert.equal(count('p1', 'teamRandomChakraAtMatchStart'), 1);
    assert.equal(count('p2', 'teamRandomChakraAtMatchStart'), 0);
    for (const turn of [1, 2, 4, 5]) {
        assert.equal(count('p1', 'teamRandomChakraEveryOwnTurns', turn), 0);
    }
    for (const turn of [3, 6]) {
        assert.equal(count('p1', 'teamRandomChakraEveryOwnTurns', turn), 1);
    }
    match.board.p1[0].alive = false;
    assert.equal(count('p1', 'teamRandomChakraEveryOwnTurns', 6), 0);
});

test('Water Walking defense lasts two turns and its next-skill discount is consumed once', () => {
    const match = makeMatch();
    cast(match, 'p1', 0, 0, 'p1', 1);
    const ally = match.board.p1[1];
    assert.equal(status(ally, 'ebisu_water_walking_defense').metadata.destructibleDefensePoints, 10);
    assert.equal(battle.computeEffectiveEnergyCost({ skill: fighter.skills[0], actorState: ally.state }).requiredRandom, 0);
    cast(match, 'p1', 1, 0, 'p2', 0);
    assert.equal(has(ally, 'ebisu_water_walking_discount'), false);
    assert.equal(has(ally, 'ebisu_mentor_fundamentals_defense'), false,
        'the discounted skill costs only one chakra');
    assert.ok(has(ally, 'ebisu_water_walking_defense'));
    assert.equal(battle.computeEffectiveEnergyCost({ skill: fighter.skills[0], actorState: ally.state }).requiredRandom, 1);
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.ok(has(ally, 'ebisu_water_walking_defense'));
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.ok(has(ally, 'ebisu_water_walking_defense'));
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(has(ally, 'ebisu_water_walking_defense'), false);
});

test('Mentor Fundamentals grants one nonstacking defense after a two-chakra skill', () => {
    const match = makeMatch();
    const ally = match.board.p1[1];
    cast(match, 'p1', 1, 0, 'p2', 0);
    assert.equal(status(ally, 'ebisu_mentor_fundamentals_defense').metadata.destructibleDefensePoints, 10);
    cast(match, 'p1', 1, 0, 'p2', 0);
    assert.equal(ally.state.statuses.filter((entry) => entry.id === 'ebisu_mentor_fundamentals_defense').length, 1);
    assert.equal(status(ally, 'ebisu_mentor_fundamentals_defense').metadata.destructibleDefensePoints, 10);
    cast(match, 'p1', 2, 1, 'p2', 0);
    assert.equal(has(match.board.p1[2], 'ebisu_mentor_fundamentals_defense'), false);
});

test('Textbook Taijutsu counters only the next harmful Physical skill', () => {
    const match = makeMatch();
    cast(match, 'p1', 0, 1, 'p2', 0);
    assert.equal(match.board.p2[0].hp, 80);
    assert.ok(has(match.board.p2[0], 'ebisu_textbook_counter'));
    cast(match, 'p2', 0, 2, 'p2', 0);
    assert.ok(has(match.board.p2[0], 'ebisu_textbook_counter'));
    cast(match, 'p2', 0, 1, 'p1', 0);
    assert.equal(match.board.p1[0].hp, 100, 'the Physical skill is cancelled');
    assert.equal(match.board.p2[0].hp, 70, 'the attacker takes 10 physical damage');
    assert.equal(has(match.board.p2[0], 'ebisu_textbook_counter'), false);
});

test('Strict Discipline deals affliction damage and increases only harmful costs without stacking', () => {
    const match = makeMatch();
    match.board.p2[0].state.statuses.push({
        id: 'armor', remainingTurns: 2,
        metadata: { destructibleDefensePoints: 10, damageReductionFlat: 10 },
    });
    cast(match, 'p1', 0, 2, 'p2', 0);
    assert.equal(match.board.p2[0].hp, 85);
    assert.equal(status(match.board.p2[0], 'armor').metadata.destructibleDefensePoints, 10);
    const state = match.board.p2[0].state;
    assert.equal(battle.computeEffectiveEnergyCost({ skill: fighter.skills[1], actorState: state }).requiredRandom, 1);
    assert.equal(battle.computeEffectiveEnergyCost({ skill: fighter.skills[2], actorState: state }).requiredRandom, 0);
    cast(match, 'p1', 0, 2, 'p2', 0);
    assert.equal(state.statuses.filter((entry) => entry.id === 'ebisu_strict_discipline').length, 1);
    assert.equal(battle.computeEffectiveEnergyCost({ skill: fighter.skills[1], actorState: state }).requiredRandom, 1);
});

test('To The Skies makes Ebisu invulnerable for one turn', () => {
    const match = makeMatch();
    cast(match, 'p1', 0, 3, 'p1', 0);
    cast(match, 'p2', 0, 1, 'p1', 0);
    assert.equal(match.board.p1[0].hp, 100);
});
