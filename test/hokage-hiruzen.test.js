const test = require('node:test');
const assert = require('node:assert/strict');
const characters = require('../data/characters');
const battle = require('../battleLogic');
const { buildMatchPayloadForUser } = require('../server');
const rosterCatalog = require('../roster-catalog');

const indexOf = (id) => characters.findIndex((character) => character?.characterId === id);
const hiruzenIndex = indexOf('sarutobi-hiruzen');
const sasukeIndex = indexOf('uchiha-sasuke');
const sakuraIndex = indexOf('haruno-sakura');
const shinoIndex = indexOf('aburame-shino');

function makeMatch(team1 = [hiruzenIndex, sasukeIndex], team2 = [sasukeIndex, sakuraIndex]) {
    const players = [{ username: 'p1', team: team1 }, { username: 'p2', team: team2 }];
    const match = {
        players, board: battle.buildInitialBoard(players, characters), pendingTurns: {},
        chakraPools: {
            p1: { taijutsu: 0, ninjutsu: 0, bloodline: 0, genjutsu: 0 },
            p2: { taijutsu: 0, ninjutsu: 0, bloodline: 0, genjutsu: 0 },
        },
        economy: { turnCounts: { p1: 0, p2: 0 } }, combatEvents: [],
    };
    for (const [username, units] of Object.entries(match.board)) {
        for (const unit of units) unit.username = username;
    }
    return match;
}

function cast(match, username, slot, skillIndex, targetSelection = []) {
    match.pendingTurns[username] = {
        queueOrder: [slot], queuedByActorSlot: { [slot]: { skillIndex, targetSelection } },
    };
    battle.resolvePendingTurnSkills({ match, actingUsername: username, characters });
}

function has(unit, id) {
    return unit.state.statuses.some((status) => status.id === id && status.remainingTurns > 0);
}

test('Hokage Hiruzen replaces the old character in the Land of Waves roster', () => {
    const hiruzen = characters[hiruzenIndex];
    assert.equal(hiruzen.name, 'Hokage Hiruzen');
    assert.equal(hiruzen.requiredMissionId, 'the-god-of-the-shinobi');
    assert.equal(rosterCatalog.getArc(hiruzen).label, 'Land of Waves');
    assert.deepEqual(hiruzen.skills.map((skill) => skill.name), [
        'Crystal Ball Technique', 'Mission Assignment', 'Search Party', "Hokage's Guard",
    ]);
    assert.deepEqual(hiruzen.skills.map((skill) => skill.energy),
        [['Random'], ['Random'], ['Random'], ['Random']]);
    assert.deepEqual(hiruzen.skills.map((skill) => skill.cooldown), [1, 1, 1, 4]);
});

test('Crystal Ball observes one enemy, suppresses their first harmful skill, and enables Search Party piercing', () => {
    const match = makeMatch();
    cast(match, 'p1', 0, 0, [{ username: 'p2', slot: 0 }]);
    assert.ok(has(match.board.p2[0], 'sarutobi_hiruzen_crystal_ball_observation'));
    assert.ok(has(match.board.p2[0], 'sarutobi_hiruzen_crystal_ball_suppression'));
    assert.equal(match.board.p2[0].state.statuses.find((status) =>
        status.id === 'sarutobi_hiruzen_crystal_ball_observation').remainingTurns, 2);

    cast(match, 'p2', 0, 0, [{ username: 'p1', slot: 0 }]);
    assert.equal(match.board.p1[0].hp, 90, 'the first harmful Physical skill deals 10 less damage');
    assert.equal(has(match.board.p2[0], 'sarutobi_hiruzen_crystal_ball_suppression'), false);
    assert.ok(has(match.board.p2[0], 'sarutobi_hiruzen_crystal_ball_observation'));

    cast(match, 'p1', 0, 2, [{ username: 'p2', slot: 0 }]);
    assert.equal(match.board.p2[0].hp, 65, 'Search Party deals 20 Physical and 15 piercing damage');
});

test('Crystal Ball reveals hidden effects only on the observed enemy', () => {
    const match = makeMatch();
    for (const unit of match.board.p2) {
        unit.state.statuses.push({ id: 'hidden_test', remainingTurns: 2,
            sourceUsername: 'p2', sourceSlot: unit.slot,
            metadata: { harmful: true, hideTooltipFromEnemy: true,
                tooltipText: 'Hidden test effect.' } });
    }
    const before = buildMatchPayloadForUser(match, 'p1');
    assert.equal(before.board.p2[0].state.statuses.some((status) => status.id === 'hidden_test'), false);

    cast(match, 'p1', 0, 0, [{ username: 'p2', slot: 0 }]);
    const after = buildMatchPayloadForUser(match, 'p1');
    assert.equal(after.board.p2[0].state.statuses.some((status) => status.id === 'hidden_test'), true);
    assert.equal(after.board.p2[1].state.statuses.some((status) => status.id === 'hidden_test'), false);
});

test('Crystal Ball waits through helpful skills, protects allies once, and leaves affliction damage unchanged', () => {
    const match = makeMatch();
    cast(match, 'p1', 0, 0, [{ username: 'p2', slot: 0 }]);
    cast(match, 'p2', 0, 3);
    assert.ok(has(match.board.p2[0], 'sarutobi_hiruzen_crystal_ball_suppression'));
    cast(match, 'p2', 0, 0, [{ username: 'p1', slot: 1 }]);
    assert.equal(match.board.p1[1].hp, 90, 'the first harmful skill against an ally loses 10 damage');
    assert.equal(has(match.board.p2[0], 'sarutobi_hiruzen_crystal_ball_suppression'), false);
    cast(match, 'p2', 0, 0, [{ username: 'p1', slot: 1 }]);
    assert.equal(match.board.p1[1].hp, 70, 'later skills deal their normal damage');

    const suppressed = makeMatch();
    const baseline = makeMatch();
    cast(suppressed, 'p1', 0, 0, [{ username: 'p2', slot: 0 }]);
    cast(suppressed, 'p2', 0, 1, [{ username: 'p1', slot: 0 }]);
    cast(baseline, 'p2', 0, 1, [{ username: 'p1', slot: 0 }]);
    assert.equal(suppressed.board.p1[0].hp - baseline.board.p1[0].hp, 10);
    battle.tickStatusesForTurnEnd({ match: suppressed, endingUsername: 'p2' });
    battle.tickStatusesForTurnEnd({ match: baseline, endingUsername: 'p2' });
    assert.equal(suppressed.board.p1[0].hp - baseline.board.p1[0].hp, 10,
        'the affliction damage from Fireball is unaffected');
});

test('Search Party piercing bypasses destructible defense and damage reduction', () => {
    const match = makeMatch();
    match.board.p2[0].state.statuses.push({
        id: 'defense_test', remainingTurns: 2, metadata: {
            helpful: true, destructibleDefensePoints: 30, damageReductionFlat: 10,
        },
    });
    cast(match, 'p1', 0, 0, [{ username: 'p2', slot: 0 }]);
    cast(match, 'p1', 0, 2, [{ username: 'p2', slot: 0 }]);
    assert.equal(match.board.p2[0].hp, 85);
    assert.equal(match.board.p2[0].state.statuses.find((status) =>
        status.id === 'defense_test').metadata.destructibleDefensePoints, 10);
});

test('Mission Assignment grants defense and one single-target damage bonus; Will of Fire needs defense', () => {
    const match = makeMatch();
    cast(match, 'p1', 0, 1, [{ username: 'p1', slot: 1 }]);
    const ally = match.board.p1[1];
    assert.equal(ally.state.statuses.find((status) =>
        status.id === 'sarutobi_hiruzen_mission_assignment_defense').metadata.destructibleDefensePoints, 15);
    assert.ok(has(ally, 'sarutobi_hiruzen_mission_assignment_bonus'));

    cast(match, 'p1', 1, 3);
    assert.ok(has(ally, 'sarutobi_hiruzen_mission_assignment_bonus'),
        'a non-damaging skill leaves the bonus ready');
    cast(match, 'p1', 1, 0, [{ username: 'p2', slot: 0 }]);
    assert.equal(match.board.p2[0].hp, 65,
        '20 base damage, 10 Mission Assignment damage, and 5 Will of Fire damage');
    assert.equal(has(ally, 'sarutobi_hiruzen_mission_assignment_bonus'), false);

    cast(match, 'p1', 1, 0, [{ username: 'p2', slot: 0 }]);
    assert.equal(match.board.p2[0].hp, 40, 'Will of Fire still adds 5 while defense remains');
    battle.applyDamageToUnit(ally, 15, { match, sourceUsername: 'p2', targetUsername: 'p1' });
    assert.equal(has(ally, 'sarutobi_hiruzen_mission_assignment_defense'), false);
    cast(match, 'p1', 1, 0, [{ username: 'p2', slot: 0 }]);
    assert.equal(match.board.p2[0].hp, 20, 'Will of Fire stops when defense is gone');
});

test('Mission Assignment does not spend its bonus on a team-wide alternate attack', () => {
    const match = makeMatch([hiruzenIndex, sakuraIndex]);
    cast(match, 'p1', 0, 1, [{ username: 'p1', slot: 1 }]);
    cast(match, 'p1', 1, 2);
    cast(match, 'p1', 1, 0, [{ username: 'p2', slot: 0 }]);

    assert.equal(match.board.p2[0].hp, 85);
    assert.equal(match.board.p2[1].hp, 85);
    assert.ok(has(match.board.p1[1], 'sarutobi_hiruzen_mission_assignment_bonus'));
});

test('Will of Fire and Mission Assignment add non-affliction damage to an affliction-only skill', () => {
    const match = makeMatch([hiruzenIndex, shinoIndex]);
    match.board.p2[0].state.statuses.push({
        id: 'reduction_test', remainingTurns: 2,
        metadata: { helpful: true, damageReductionFlat: 10 },
    });
    cast(match, 'p1', 0, 1, [{ username: 'p1', slot: 1 }]);
    cast(match, 'p1', 1, 0, [{ username: 'p2', slot: 0 }]);
    assert.equal(match.board.p2[0].hp, 85,
        '10 affliction bypasses reduction while the 15 non-affliction bonus is reduced to 5');
    assert.equal(has(match.board.p1[1], 'sarutobi_hiruzen_mission_assignment_bonus'), false);
});

test('Crystal Ball reduces non-affliction bonus damage on an affliction-only skill', () => {
    const match = makeMatch([hiruzenIndex, shinoIndex], [hiruzenIndex, sasukeIndex]);
    cast(match, 'p1', 0, 1, [{ username: 'p1', slot: 1 }]);
    cast(match, 'p2', 0, 0, [{ username: 'p1', slot: 1 }]);
    cast(match, 'p1', 1, 0, [{ username: 'p2', slot: 0 }]);
    assert.equal(match.board.p2[0].hp, 85,
        '10 affliction remains and the 15 non-affliction bonus loses 10');
    assert.equal(has(match.board.p1[1], 'sarutobi_hiruzen_crystal_ball_suppression'), false);
});

test('Crystal Ball subtracts ten total damage from a two-hit skill', () => {
    const match = makeMatch([hiruzenIndex, sasukeIndex], [hiruzenIndex, sasukeIndex]);
    cast(match, 'p2', 0, 0, [{ username: 'p1', slot: 0 }]);
    cast(match, 'p1', 0, 0, [{ username: 'p2', slot: 0 }]);
    cast(match, 'p2', 0, 2, [{ username: 'p1', slot: 0 }]);
    assert.equal(match.board.p1[0].hp, 75,
        'Search Party deals 20 physical and 15 piercing, reduced by 10 once');
});

test("Hokage's Guard grants one turn of invulnerability", () => {
    const match = makeMatch();
    cast(match, 'p1', 0, 3);
    assert.ok(has(match.board.p1[0], 'sarutobi_hiruzen_hokages_guard'));
    cast(match, 'p2', 0, 0, [{ username: 'p1', slot: 0 }]);
    assert.equal(match.board.p1[0].hp, 100);
});
