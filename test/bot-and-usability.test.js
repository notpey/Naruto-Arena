const { test } = require('node:test');
const assert = require('node:assert/strict');
const characters = require('../data/characters');
const battleLogic = require('../battleLogic');
const { planBattleBotTurn, describeSkill } = require('../services/battleBot');

const index = (id) => characters.findIndex((character) => character.characterId === id);
const pool = () => ({ taijutsu: 20, ninjutsu: 20, bloodline: 20, genjutsu: 20 });
const matchFor = (allies, enemies) => {
    const players = [{ username: 'a', team: allies.map(index) }, { username: 'b', team: enemies.map(index) }];
    const match = { players, board: battleLogic.buildInitialBoard(players, characters),
        chakraPools: { a: pool(), b: pool() }, economy: { turnCounts: { a: 0, b: 0 } }, pendingTurns: {} };
    Object.entries(match.board).forEach(([username, units]) => units.forEach((unit) => {
        unit.username = username; unit.state.cooldowns = {};
    }));
    return match;
};
const cast = (match, username, slot, skillIndex, target) => {
    match.pendingTurns[username] = { queueOrder: [slot], queuedByActorSlot: {
        [slot]: { skillIndex, targetSelection: target ? [{ username: target[0], slot: target[1] }] : [] },
    } };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: username, characters });
};
const targetsOf = (match, username, slot, skillIndex) => battleLogic.computeTargetOptions({
    match, actingUsername: username, actorSlot: slot, skillIndex, characters }).targets;
const status = (unit, id) => unit.state.statuses.find((entry) => entry.id === id && entry.remainingTurns > 0);

test('a skill has no legal target when every enemy is invulnerable', () => {
    const match = matchFor(['uzumaki-naruto'], ['haruno-sakura', 'tenten']);
    assert.ok(targetsOf(match, 'a', 0, 0).length > 0);
    match.board.b.forEach((unit) => unit.state.statuses.push({ id: 'test_invulnerable', remainingTurns: 2,
        metadata: { invulnerable: true } }));
    assert.equal(targetsOf(match, 'a', 0, 0).length, 0, 'Naruto S1 has nothing to hit');
});

test('Akimichi Pills has no legal use once all 3 pills are eaten', () => {
    const match = matchFor(['akimichi-chouji'], ['tenten']);
    for (let pill = 0; pill < 3; pill += 1) {
        assert.ok(targetsOf(match, 'a', 0, 2).length > 0, `pill ${pill + 1} is usable`);
        match.board.a[0].state.cooldowns = {};
        cast(match, 'a', 0, 2);
    }
    assert.ok(status(match.board.a[0], 'akimichi_chouji_butterfly_mode_active'), 'Butterfly Mode is active');
    match.board.a[0].state.cooldowns = {};
    assert.equal(targetsOf(match, 'a', 0, 2).length, 0, 'no fourth pill');
});

test("Meld in the Shadows leaves Kunai Ambush's counter waiting on the attacker's next turn", () => {
    const match = matchFor(['mizuki'], ['tenten']);
    cast(match, 'a', 0, 2);
    battleLogic.tickStatusesForTurnEnd({ match, endingUsername: 'a' });
    cast(match, 'b', 0, 0, ['a', 0]);
    assert.equal(match.board.a[0].hp, 100, 'the physical skill is countered');
    assert.equal(match.board.b[0].hp, 80, 'the attacker takes Kunai Ambush damage');
    battleLogic.tickStatusesForTurnEnd({ match, endingUsername: 'b' });
    battleLogic.tickStatusesForTurnEnd({ match, endingUsername: 'a' });
    assert.ok(status(match.board.b[0], 'mizuki_kunai_ambush_trap'), 'still trapped on their next turn');
    cast(match, 'b', 0, 3);
    assert.equal(status(match.board.b[0], 'invulnerable'), undefined, 'their helpful skill is countered');
    assert.equal(status(match.board.b[0], 'mizuki_kunai_ambush_trap'), undefined, 'and the trap is spent');
});

const planFor = (match, username = 'a', random = () => 0) => {
    const queued = [];
    planBattleBotTurn({
        match, username, characters, battleLogic, random,
        canAfford: () => true,
        queue: (play) => queued.push(play),
    });
    return queued;
};

test('the bot only queues legal plays, at most one per character', () => {
    const match = matchFor(['uzumaki-naruto', 'haruno-sakura', 'tenten'], ['inuzuka-kiba', 'kankuro', 'temari']);
    const queued = planFor(match);
    assert.ok(queued.length > 0);
    assert.equal(new Set(queued.map((play) => play.actorSlot)).size, queued.length);
    queued.forEach(({ actorSlot, skillIndex, targetSelection }) => {
        const legal = targetsOf(match, 'a', actorSlot, skillIndex)
            .map((target) => `${target.username}:${target.slot}`);
        targetSelection.forEach((target) => assert.ok(legal.includes(`${target.username}:${target.slot}`)));
    });
});

test('the bot goes for the kill on a nearly dead enemy', () => {
    const match = matchFor(['uzumaki-naruto'], ['inuzuka-kiba', 'kankuro', 'temari']);
    match.board.b[1].hp = 15;
    const [play] = planFor(match);
    assert.ok(describeSkill(characters[index('uzumaki-naruto')].skills[play.skillIndex]).damage > 0);
    assert.deepEqual(play.targetSelection.map((target) => target.slot), [1]);
});

test('the bot defends a badly hurt character instead of trading hits', () => {
    const match = matchFor(['haruno-sakura'], ['inuzuka-kiba']);
    match.board.a[0].hp = 20;
    const [play] = planFor(match);
    const skill = characters[index('haruno-sakura')].skills[play.skillIndex];
    const summary = describeSkill(skill);
    assert.ok(summary.defense || summary.heal > 0, `expected a defensive play, got ${skill.name}`);
});
