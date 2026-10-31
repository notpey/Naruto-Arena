const assert = require('node:assert/strict');
const test = require('node:test');
const characters = require('../data/characters');
const {
    buildInitialBoard, resolvePendingTurnSkills, computeEffectiveEnergyCost,
    tickStatusesForTurnEnd, isUnitInvulnerableForSkill,
} = require('../battleLogic');

const indexOf = id => characters.findIndex(character => character.id === id);
const makeMatch = (enemyTeam = ['inuzuka-kiba'], allyTeam = ['temari']) => {
    const players = [
        { username: 'p1', team: allyTeam.map(indexOf) },
        { username: 'p2', team: enemyTeam.map(indexOf) },
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
const cast = (match, skillIndex, targetSlot = null) => {
    match.pendingTurns.p1 = {
        queueOrder: [0],
        queuedByActorSlot: { 0: { skillIndex, targetSelection: targetSlot === null
            ? [] : [{ username: 'p2', slot: targetSlot }] } },
    };
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
};
const temariSkill = index => characters[indexOf('temari')].skills[index];

test('Cutting Whirlwind deals piercing splash damage and Phantom Gale hits once', () => {
    const match = makeMatch(['inuzuka-kiba', 'haruno-sakura']);
    const temari = match.board.p1[0];
    assert.ok(temari.state.statuses.some(status => status.metadata.passive &&
        status.metadata.sourceSkillName === 'Phantom Gale'));
    cast(match, 0, 0);
    assert.equal(match.board.p2.reduce((sum, unit) => sum + unit.hp, 0), 165);
    assert.ok(isUnitInvulnerableForSkill(temari, ['Physical']));
    assert.ok(!isUnitInvulnerableForSkill(temari, ['Mental']));
});

test('Summoning follows Whirlwind at lower cost and grows later Phantom Gale hits', () => {
    const match = makeMatch();
    cast(match, 0, 0);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(computeEffectiveEnergyCost({
        skill: temariSkill(1), actorState: match.board.p1[0].state,
    }).requiredRandom, 1);
    match.board.p2[0].hp = 100;
    cast(match, 1);
    assert.equal(match.board.p2[0].hp, 60, 'Summoning deals 35 plus one initial Phantom Gale hit');
    const growth = match.board.p1[0].state.statuses.find(status =>
        status.id === 'temari_phantom_gale_growth');
    assert.equal(growth.metadata.extraTriggers, 1);
    match.board.p2[0].hp = 100;
    cast(match, 3);
    assert.equal(match.board.p2[0].hp, 90, 'Later skills trigger Phantom Gale twice');
    assert.equal(growth.metadata.extraTriggers, 1);
    match.board.p1[0].state.cooldowns = {};
    match.board.p2[0].hp = 100;
    cast(match, 1);
    assert.equal(match.board.p2[0].hp, 55, 'A second Summoning triggers the current two hits');
    assert.equal(growth.metadata.extraTriggers, 2);
    match.board.p2[0].hp = 100;
    cast(match, 0, 0);
    assert.equal(match.board.p2[0].hp, 65, 'Later skills trigger Phantom Gale three times');
});

test('Dust Wind shields every ally and extends its enemy debuff after Whirlwind', () => {
    const match = makeMatch(['inuzuka-kiba', 'haruno-sakura'], ['temari', 'haruno-sakura']);
    cast(match, 0, 0);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    cast(match, 2);
    for (const unit of match.board.p1) {
        assert.ok(isUnitInvulnerableForSkill(unit, ['Physical']));
    }
    for (const unit of match.board.p2) {
        const debuff = unit.state.statuses.find(status => status.id === 'temari_dust_wind_debuff');
        assert.equal(debuff.remainingTurns, 2);
        assert.equal(debuff.metadata.NonAfflictionDamageDebuff, 20);
    }
    assert.deepEqual(temariSkill(2).energy, ['Ninjutsu', 'Ninjutsu']);
});

test('Dust Wind applies a one-turn reduction without Whirlwind', () => {
    const match = makeMatch();
    cast(match, 2);
    const debuff = match.board.p2[0].state.statuses.find(status =>
        status.id === 'temari_dust_wind_debuff');
    assert.equal(debuff.remainingTurns, 1);
    assert.ok(isUnitInvulnerableForSkill(match.board.p1[0], ['Mental']));
});

test('Dust Wind still shields allies when enemies cannot be targeted', () => {
    const match = makeMatch(['inuzuka-kiba'], ['temari', 'haruno-sakura']);
    match.board.p2[0].state.statuses.push({
        id: 'strategic_immunity', remainingTurns: 1,
        metadata: { invulnerableToSkillClasses: ['Strategic'] },
    });
    cast(match, 2);
    assert.ok(match.board.p1.every(unit => isUnitInvulnerableForSkill(unit, ['Mental'])));
    assert.ok(!match.board.p2[0].state.statuses.some(status =>
        status.id === 'temari_dust_wind_debuff'));
});
