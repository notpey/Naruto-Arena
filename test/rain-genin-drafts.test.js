const assert = require('node:assert/strict');
const test = require('node:test');
const characters = require('../data/characters');
const { ACTIVE_ROSTER_IDS, isActiveCharacter } = require('../data/activeRoster');
const battle = require('../battleLogic');

const indexOf = (id) => characters.findIndex((character) => character.id === id);
test('Rock Lee, Oboro, and Shigure are included in the playable roster', () => {
    for (const id of ['rock-lee', 'oboro', 'shigure']) {
        assert.ok(ACTIVE_ROSTER_IDS.includes(id), `${id} is active`);
        assert.ok(isActiveCharacter(characters[indexOf(id)]), `${id} is present in the character seed`);
        const missions = { oboro: 'double-lucky', shigure: 'a-rare-opportunity' };
        assert.equal(characters[indexOf(id)].requiredMissionId || null, missions[id] || null);
    }
});
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

test('Shigure draft keeps Needle Barrage gated to Sprinkling Needles', () => {
    const shigure = characters[indexOf('shigure')];
    assert.deepEqual(shigure.skills.map((skill) => skill.name),
        ['Umbrella Toss', 'Sprinkling Needles', 'Needle Barrage', 'Umbrella Block']);
    assert.deepEqual(shigure.skills.map((skill) => skill.energy),
        [['Random'], ['Random', 'Random'], ['Random'], ['Random']]);
    const match = matchFor(['shigure'], ['haruno-sakura']);
    cast(match, 'p1', 0, 0);
    cast(match, 'p1', 0, 1);
    assert.ok(status(match.board.p2[0], 'shigure_sprinkling_needles'));
    assert.ok(status(match.board.p1[0], 'shigure_needle_curtain'));
    cast(match, 'p1', 0, 2, 'p2');
    assert.equal(match.board.p2[0].hp, 75, 'Umbrella Toss adds 5 to Barrage');
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(match.board.p2[0].hp, 45, 'two source-turn ticks each deal 10 plus 5');
});

test('Needle Curtain retaliates once when an enemy harmful skill hits multiple allies', () => {
    const match = matchFor(['shigure', 'haruno-sakura'], ['tenten']);
    cast(match, 'p1', 0, 1);
    cast(match, 'p2', 0, 0, 'p1', 0);
    assert.equal(match.board.p2[0].hp, 95);
});

test('Oboro passive reduces only the first damaging enemy skill in a turn', () => {
    const match = matchFor(['oboro'], ['tenten', 'mizuki']);
    assert.equal(status(match.board.p1[0], 'oboro_false_opening').metadata
        .firstEnemyDamagingSkillReductionFlat, 10);
    cast(match, 'p2', 0, 0, 'p1');
    assert.equal(match.board.p1[0].hp, 90);
    cast(match, 'p2', 1, 0, 'p1');
    assert.equal(match.board.p1[0].hp, 70);
    match.economy.turnCounts.p2 += 1;
    match.board.p2[0].state.cooldowns = {};
    cast(match, 'p2', 0, 0, 'p1');
    assert.equal(match.board.p1[0].hp, 60, 'the reduction resets for a new enemy turn');
});

test('Oboro ambush is shared until Haze Clones makes it trigger for each enemy', () => {
    const match = matchFor(['oboro'], ['mizuki', 'tenten']);
    cast(match, 'p1', 0, 0);
    assert.ok(status(match.board.p2[0], 'oboro_underground_ambush'));
    cast(match, 'p2', 0, 3);
    assert.equal(match.board.p2[0].hp, 80);
    assert.ok(status(match.board.p2[0], 'oboro_underground_ambush_stun'));
    assert.equal(status(match.board.p2[1], 'oboro_underground_ambush'), undefined);
    match.board.p2[0].state.statuses = match.board.p2[0].state.statuses.filter((entry) =>
        !entry.metadata?.invulnerable);
    cast(match, 'p1', 0, 2);
    match.board.p1[0].state.cooldowns = {};
    cast(match, 'p1', 0, 0);
    assert.ok(status(match.board.p2[0], 'oboro_underground_ambush'),
        JSON.stringify(match.board.p1[0].state.cooldowns));
    match.board.p2[0].state.cooldowns = {};
    cast(match, 'p2', 0, 3);
    cast(match, 'p2', 1, 3);
    assert.equal(match.board.p2[0].hp, 60);
    assert.equal(match.board.p2[1].hp, 80);
});

test('Haze Clones spreads Exploding Kunais and its affliction follows on Oboro turn', () => {
    const match = matchFor(['oboro'], ['haruno-sakura', 'tenten']);
    cast(match, 'p1', 0, 2);
    assert.equal(battle.resolveEffectiveSkill({
        characters, rosterIndex: indexOf('oboro'), skillIndex: 1,
        actorState: match.board.p1[0].state,
    }).target, 'all-enemy');
    cast(match, 'p1', 0, 1);
    assert.deepEqual(match.board.p2.map((unit) => unit.hp), [90, 90]);
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.deepEqual(match.board.p2.map((unit) => unit.hp), [80, 80]);
});

test('Underground Ambush is visible to Oboro but hidden from the ambushed enemies', () => {
    const { buildMatchPayloadForUser } = require('../server.js');
    const match = matchFor(['oboro'], ['tenten']);
    cast(match, 'p1', 0, 0);
    const visibleTo = (username) => buildMatchPayloadForUser(match, username).board.p2[0].state.statuses
        .some((entry) => entry.id === 'oboro_underground_ambush');
    assert.equal(visibleTo('p1'), true);
    assert.equal(visibleTo('p2'), false);
});
