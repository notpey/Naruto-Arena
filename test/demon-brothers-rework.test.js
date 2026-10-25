const { test } = require('node:test');
const assert = require('node:assert/strict');
const characters = require('../data/characters');
const seed = require('../characters.js');
const { buildInitialBoard, resolvePendingTurnSkills, resolveEffectiveSkill, tickStatusesForTurnEnd } = require('../battleLogic');

const index = (id) => characters.findIndex((character) => character.characterId === id);
const pool = () => ({ taijutsu: 20, ninjutsu: 20, bloodline: 20, genjutsu: 20 });
const matchFor = (enemyIds = ['uzumaki-naruto']) => {
    const players = [
        { username: 'a', team: [index('demon-brothers')] },
        { username: 'b', team: enemyIds.map(index) },
    ];
    const match = {
        players, board: buildInitialBoard(players, characters),
        chakraPools: { a: pool(), b: pool() }, economy: { turnCounts: { a: 0, b: 0 } }, pendingTurns: {},
    };
    Object.entries(match.board).forEach(([username, units]) => units.forEach((unit) => { unit.username = username; }));
    return match;
};
const cast = (match, skillIndex, target = null) => {
    match.pendingTurns.a = { queueOrder: [0], queuedByActorSlot: {
        0: { skillIndex, targetSelection: target === null ? [] : [{ username: 'b', slot: target }] },
    } };
    resolvePendingTurnSkills({ match, actingUsername: 'a', characters });
};
const status = (match, username, slot, id) =>
    match.board[username][slot].state.statuses.find((entry) => entry.id === id);
const effective = (match) => resolveEffectiveSkill({
    characters, rosterIndex: match.board.a[0].rosterIndex, skillIndex: 0,
    actorState: match.board.a[0].state,
});

test('Demon Brothers roster seed, passive, costs, and visible skills match the draft', () => {
    const character = characters[index('demon-brothers')];
    assert.deepEqual(seed.find((entry) => entry.characterId === 'demon-brothers'), character);
    assert.equal(character.passive.name, 'Lust for Murder');
    assert.deepEqual(character.skills.map((skill) => skill.energy), [
        ['Taijutsu'], ['Random'], ['Random'], ['Random'], ['Taijutsu', 'Random'],
    ]);
    assert.deepEqual(character.skills.map((skill) => skill.cooldown), [1, 1, 3, 4, 0]);
    assert.equal(character.skills.filter((skill) => !skill.hiddenFromSelectionViewer).length, 4);
    assert.ok(status(matchFor(), 'a', 0, 'demon_brothers_lust_for_murder'));
});

test('Chain Wrap stuns Physical skills, binds one target, and Chain Shred pierces then ends it', () => {
    const match = matchFor(['uzumaki-naruto', 'haruno-sakura']);
    cast(match, 0, 0);
    assert.equal(match.board.b[0].hp, 85);
    assert.deepEqual(status(match, 'b', 0, 'demon_brothers_chain_wrap_stun').metadata.cannotUseSkillClasses, ['physical']);
    assert.equal(effective(match).id, 'demon-brothers-chain-shred');
    cast(match, 0, 1);
    assert.equal(match.board.b[1].hp, 100, 'Chain Shred cannot hit another enemy');
    assert.ok(status(match, 'b', 0, 'demon_brothers_chain_wrap_target'));
    assert.ok(status(match, 'a', 0, 'demon_brothers_chain_wrap_ready'));
    match.board.b[0].state.statuses.push({ id: 'test_guard', remainingTurns: 2,
        metadata: { destructibleDefensePoints: 30, damageReductionFlat: 10 } });
    cast(match, 0, 0);
    assert.equal(match.board.b[0].hp, 40, 'Chain Shred pierces defense and reduction');
    assert.equal(status(match, 'b', 0, 'demon_brothers_chain_wrap_target'), undefined);
    tickStatusesForTurnEnd({ match, endingUsername: 'a' });
    assert.equal(status(match, 'a', 0, 'demon_brothers_chain_wrap_ready'), undefined);
    assert.equal(effective(match).id, 'demon-brothers-chain-wrap');
});

test('Chain Wrap ends when Demon Brothers are stunned', () => {
    const match = matchFor();
    cast(match, 0, 0);
    match.board.a[0].state.statuses.push({ id: 'test_stun', remainingTurns: 1,
        metadata: { harmful: true, cannotUseSkills: true } });
    tickStatusesForTurnEnd({ match, endingUsername: 'a' });
    assert.equal(status(match, 'b', 0, 'demon_brothers_chain_wrap_target'), undefined);
    assert.equal(status(match, 'a', 0, 'demon_brothers_chain_wrap_ready'), undefined);
});

test('Chain Wrap offers Chain Shred for the next two turns and gives it the low-health bonus', () => {
    const timed = matchFor();
    cast(timed, 0, 0);
    tickStatusesForTurnEnd({ match: timed, endingUsername: 'a' });
    assert.equal(effective(timed).id, 'demon-brothers-chain-shred');
    tickStatusesForTurnEnd({ match: timed, endingUsername: 'a' });
    assert.equal(effective(timed).id, 'demon-brothers-chain-shred');
    tickStatusesForTurnEnd({ match: timed, endingUsername: 'a' });
    assert.equal(effective(timed).id, 'demon-brothers-chain-wrap');
    assert.equal(status(timed, 'b', 0, 'demon_brothers_chain_wrap_target'), undefined);

    const finishing = matchFor();
    cast(finishing, 0, 0);
    finishing.board.b[0].hp = 50;
    cast(finishing, 0, 0);
    assert.equal(finishing.board.b[0].hp, 0);
});

test('Lust for Murder adds five to direct Physical damage at 50 health or less', () => {
    for (const [skill, expected] of [[0, 30], [1, 25]]) {
        const match = matchFor();
        match.board.b[0].hp = 50;
        cast(match, skill, 0);
        assert.equal(match.board.b[0].hp, expected);
    }
});

test('Bladed Gauntlet poison refreshes without stacking; Water Melding grants timed defense and chakra', () => {
    const match = matchFor();
    cast(match, 1, 0);
    const poisonId = 'demon_brothers_bladed_gauntlet_poison';
    assert.equal(match.board.b[0].hp, 80);
    assert.equal(status(match, 'b', 0, poisonId).remainingTurns, 2);
    tickStatusesForTurnEnd({ match, endingUsername: 'a' });
    assert.equal(match.board.b[0].hp, 75);
    // Simulate a cooldown reduction so poison is still active on reapplication.
    match.board.a[0].state.cooldowns['demon-brothers-bladed-gauntlet'] = 0;
    cast(match, 1, 0);
    assert.equal(match.board.b[0].state.statuses.filter((entry) => entry.id === poisonId).length, 1);
    assert.equal(status(match, 'b', 0, poisonId).remainingTurns, 2);

    const chakraBefore = match.chakraPools.a.taijutsu;
    cast(match, 2);
    assert.equal(match.chakraPools.a.taijutsu, chakraBefore + 1);
    assert.equal(status(match, 'a', 0, 'demon_brothers_water_melding_defense').remainingTurns, 2);
    assert.equal(status(match, 'a', 0, 'demon_brothers_water_melding_defense').metadata.destructibleDefensePoints, 15);
});
