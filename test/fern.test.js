const test = require('node:test');
const assert = require('node:assert/strict');
const characters = require('../data/characters');
const { ACTIVE_ROSTER_IDS, isActiveCharacter } = require('../data/activeRoster');
const {
    buildInitialBoard, resolvePendingTurnSkills, computeEffectiveEnergyCost,
    tickStatusesForTurnEnd, isUnitInvulnerableForSkill,
} = require('../battleLogic');

const indexOf = id => characters.findIndex(character => character.id === id);
const fern = characters[indexOf('fern')];
const makeMatch = (enemyIds = ['inuzuka-kiba', 'haruno-sakura']) => {
    const players = [
        { username: 'p1', team: [indexOf('fern')] },
        { username: 'p2', team: enemyIds.map(indexOf) },
    ];
    return {
        players, board: buildInitialBoard(players, characters), pendingTurns: {},
        chakraPools: {
            p1: { taijutsu: 0, ninjutsu: 10, bloodline: 0, genjutsu: 10 },
            p2: { taijutsu: 10, ninjutsu: 10, bloodline: 0, genjutsu: 0 },
        },
        economy: { turnCounts: { p1: 0, p2: 0 } },
    };
};
const cast = (match, username, skillIndex, targetSlot = null) => {
    match.pendingTurns[username] = {
        queueOrder: [0],
        queuedByActorSlot: { 0: { skillIndex, targetSelection: targetSlot === null
            ? [] : [{ username: username === 'p1' ? 'p2' : 'p1', slot: targetSlot }] } },
    };
    resolvePendingTurnSkills({ match, actingUsername: username, characters });
};
const stacks = match => match.board.p1[0].state.statuses.find(status =>
    status.id === 'fern_magical_concealment').metadata.magicalConcealmentStacks;
const cost = (match, index = 0) => computeEffectiveEnergyCost({
    skill: fern.skills[index], actorState: match.board.p1[0].state,
});

test('Fern is included in the live server roster and remains after existing characters', () => {
    assert.ok(isActiveCharacter(fern));
    assert.ok(ACTIVE_ROSTER_IDS.indexOf('fern') < ACTIVE_ROSTER_IDS.indexOf('lissandra-the-ice-witch'));
    assert.ok(indexOf('fern') >= 0);
});

test('server character script includes Fern after startup', async () => {
    const { app } = require('../server');
    const server = await new Promise(resolve => {
        const instance = app.listen(0, () => resolve(instance));
    });
    try {
        const response = await fetch(`http://127.0.0.1:${server.address().port}/characters.js`);
        assert.equal(response.status, 200);
        assert.match(await response.text(), /"characterId":"fern"/);
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});

test('Magical Concealment grows each owner turn and sets Zoltraak cost tiers', () => {
    const match = makeMatch(['inuzuka-kiba']);
    const unit = match.board.p1[0];
    assert.equal(stacks(match), 0);
    assert.equal(cost(match).requiredRandom, 0);
    for (let turn = 1; turn <= 8; turn++) {
        tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
        assert.equal(stacks(match), turn);
        const actual = cost(match);
        assert.equal(actual.requiredRandom, turn >= 8 ? 1 : turn >= 3 && turn < 5 ? 1 : 0);
        assert.equal(actual.reservedSpecific.ninjutsu, turn >= 5 ? 1 : 0);
        assert.deepEqual(cost(match, 4), actual, 'barrage shares the current cost');
    }
    assert.match(unit.state.statuses.find(status => status.id === 'fern_magical_concealment').metadata.tooltipText, /8 Magical Concealment/);
});

test('Zoltraak damage scales without consuming stacks and barrage hits every enemy', () => {
    const match = makeMatch(['inuzuka-kiba', 'haruno-sakura']);
    for (let i = 0; i < 2; i++) tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    cast(match, 'p1', 0, 0);
    assert.equal(match.board.p2[0].hp, 90);
    assert.equal(stacks(match), 2);
    cast(match, 'p1', 2);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    cast(match, 'p1', 0);
    assert.equal(match.board.p2[0].hp, 70);
    assert.equal(match.board.p2[1].hp, 80);
});

test('Ordinary Defensive Magic renews a one-turn shield using current stacks and cannot be reused', () => {
    const match = makeMatch(['inuzuka-kiba']);
    cast(match, 'p1', 1);
    const unit = match.board.p1[0];
    const shield = () => unit.state.statuses.find(status => status.id === 'fern_ordinary_defensive_magic_shield');
    assert.equal(shield().metadata.destructibleDefensePoints, 5);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(shield().metadata.destructibleDefensePoints, 10);
    assert.equal(shield().remainingTurns, 1);
    cast(match, 'p1', 1);
    assert.equal(unit.state.statuses.filter(status => status.id === 'fern_ordinary_defensive_magic').length, 1);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(shield().metadata.destructibleDefensePoints, 15);
});

test('Orbital Cannon counters a Physical skill and grants a stack', () => {
    const match = makeMatch(['inuzuka-kiba']);
    cast(match, 'p1', 2);
    cast(match, 'p2', 1, 0);
    assert.equal(match.board.p1[0].hp, 100);
    assert.equal(stacks(match), 1);
    assert.ok(!match.board.p1[0].state.statuses.some(status => status.id === 'fern_orbital_cannon'));
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.ok(!match.board.p1[0].state.statuses.some(status => status.id === 'fern_orbital_cannon_barrage'));
});

test('Orbital Cannon expires into all-enemy Zoltraak when not triggered', () => {
    const match = makeMatch(['inuzuka-kiba']);
    cast(match, 'p1', 2);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.ok(match.board.p1[0].state.statuses.some(status => status.id === 'fern_orbital_cannon'));
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.ok(match.board.p1[0].state.statuses.some(status => status.id === 'fern_orbital_cannon_barrage'));
});

test('Perfect Barrier grants one-turn invulnerability', () => {
    const match = makeMatch(['inuzuka-kiba']);
    cast(match, 'p1', 3);
    assert.ok(isUnitInvulnerableForSkill(match.board.p1[0], ['Physical']));
});
