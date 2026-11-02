const { test } = require('node:test');
const assert = require('node:assert/strict');
const characters = require('../data/characters');
const { buildInitialBoard, resolvePendingTurnSkills, resolveEffectiveSkill, tickStatusesForTurnEnd,
    computeEffectiveEnergyCost, computeTargetOptions } = require('../battleLogic');

const index = (id) => characters.findIndex((character) => character.characterId === id);
const pool = () => ({ taijutsu: 20, ninjutsu: 20, bloodline: 20, genjutsu: 20 });
const matchFor = (allies, enemies) => {
    const players = [{ username: 'a', team: allies.map(index) }, { username: 'b', team: enemies.map(index) }];
    const match = { players, board: buildInitialBoard(players, characters),
        chakraPools: { a: pool(), b: pool() }, economy: { turnCounts: { a: 0, b: 0 } }, pendingTurns: {} };
    Object.entries(match.board).forEach(([username, units]) => units.forEach((unit) => { unit.username = username; }));
    return match;
};
const cast = (match, username, slot, skillIndex, target) => {
    match.pendingTurns[username] = { queueOrder: [slot], queuedByActorSlot: {
        [slot]: { skillIndex, targetSelection: target ? [{ username: target[0], slot: target[1] }] : [] },
    } };
    resolvePendingTurnSkills({ match, actingUsername: username, characters });
};
const status = (match, user, slot, id) => match.board[user][slot].state.statuses.find((entry) => entry.id === id);
const effective = (match, user, slot, skillIndex) => resolveEffectiveSkill({
    characters, rosterIndex: match.board[user][slot].rosterIndex, skillIndex,
    actorState: match.board[user][slot].state,
});

test('new kits expose four skills and a permanent passive, with alternate skills off the tray', () => {
    const match = matchFor(['haku', 'momochi-zabuza', 'mizuki'], ['uzumaki-naruto']);
    for (const [slot, id, passive] of [
        [0, 'haku', 'Sacrifice'], [1, 'momochi-zabuza', 'Silent Killing'],
        [2, 'mizuki', 'Windmill'],
    ]) {
        const character = characters[index(id)];
        assert.equal(character.skills.slice(0, 4).filter((skill) => skill.hiddenFromSelectionViewer).length, 0);
        assert.equal(character.skills.slice(4).every((skill) => skill.hiddenFromSelectionViewer), true);
        assert.ok(match.board.a[slot].state.statuses.some((entry) =>
            entry.metadata.passive && entry.metadata.sourceSkillName === passive));
        cast(match, 'a', slot, 4, ['b', 0]);
    }
    assert.equal(match.board.b[0].hp, 100, 'hidden alternates cannot be selected directly');
});

test('Water Prison stuns physical and chakra skills and shields the prisoner from everyone', () => {
    const match = matchFor(['momochi-zabuza', 'uzumaki-naruto'], ['haku', 'umino-iruka']);
    const prisonCost = computeEffectiveEnergyCost({
        skill: effective(match, 'a', 0, 1), actorState: match.board.a[0].state,
    });
    assert.equal(prisonCost.reservedSpecific.ninjutsu, 1);
    assert.equal(prisonCost.requiredRandom, 1);
    cast(match, 'a', 0, 1, ['b', 0]);
    const prison = status(match, 'b', 0, 'zabuza_water_prison');
    assert.deepEqual(prison.metadata.cannotUseSkillClasses, ['physical', 'chakra']);
    assert.equal(effective(match, 'a', 0, 0).id, 'momochi-zabuza-kubikiribocho', 'no water clone sword');

    const targetsOf = (user, slot, skillIndex) => computeTargetOptions({ match, actingUsername: user,
        actorSlot: slot, skillIndex, characters }).targets.map((target) => `${target.username}:${target.slot}`);
    assert.ok(!targetsOf('a', 1, 0).includes('b:0'), 'other enemies cannot reach the prisoner');
    assert.ok(!targetsOf('b', 1, 1).includes('b:0'), 'allies cannot reach the prisoner either');
    assert.ok(targetsOf('a', 0, 0).includes('b:0'), 'Silent Killing lets Zabuza reach the prisoner');

    tickStatusesForTurnEnd({ match, endingUsername: 'a' });
    assert.ok(status(match, 'b', 0, 'zabuza_water_prison'), 'the prison is not broken by its own invulnerability');
    cast(match, 'b', 0, 0, ['a', 1]);
    assert.equal(match.board.a[1].hp, 100, "the prisoner's physical skills are stunned");
    tickStatusesForTurnEnd({ match, endingUsername: 'b' });
    tickStatusesForTurnEnd({ match, endingUsername: 'a' });
    assert.ok(status(match, 'b', 0, 'zabuza_water_prison'), 'still imprisoned for the second turn');
    tickStatusesForTurnEnd({ match, endingUsername: 'b' });
    tickStatusesForTurnEnd({ match, endingUsername: 'a' });
    assert.equal(status(match, 'b', 0, 'zabuza_water_prison'), undefined, 'the prison lasts 2 turns');
});

test('Silent Killing ignores invulnerability and adds 5 damage against invulnerable targets', () => {
    const match = matchFor(['momochi-zabuza'], ['uzumaki-naruto', 'haku']);
    const swordCost = computeEffectiveEnergyCost({
        skill: effective(match, 'a', 0, 0), actorState: match.board.a[0].state,
    });
    assert.equal(swordCost.reservedSpecific.taijutsu, 1);
    assert.equal(swordCost.requiredRandom, 1);
    cast(match, 'a', 0, 0, ['b', 0]);
    assert.equal(match.board.b[0].hp, 70, '30 physical damage');
    match.board.b[1].state.statuses.push({ id: 'test_invulnerable', remainingTurns: 2,
        metadata: { invulnerable: true } });
    match.board.a[0].state.cooldowns = {};
    cast(match, 'a', 0, 0, ['b', 1]);
    assert.equal(match.board.b[1].hp, 65, '30 plus 5 through invulnerability');

    cast(match, 'a', 0, 3);
    assert.ok(status(match, 'a', 0, 'zabuza_water_clone').metadata.invulnerable,
        'Water Clone Technique is standard invulnerability');
});

test('Hidden Mist charges enemy Physical and Chakra skills, then empowers Kubikiribōchō', () => {
    const match = matchFor(['momochi-zabuza'], ['uzumaki-naruto']);
    const mistCost = computeEffectiveEnergyCost({
        skill: effective(match, 'a', 0, 2), actorState: match.board.a[0].state,
    });
    assert.equal(mistCost.reservedSpecific.genjutsu, 1);
    cast(match, 'a', 0, 2);
    assert.ok(status(match, 'b', 0, 'zabuza_hidden_mist_cost'));
    assert.ok(status(match, 'a', 0, 'zabuza_hidden_mist_defense'));
    for (let turn = 0; turn < 3; turn++) {
        tickStatusesForTurnEnd({ match, endingUsername: 'a' });
        tickStatusesForTurnEnd({ match, endingUsername: 'b' });
    }
    assert.equal(status(match, 'b', 0, 'zabuza_hidden_mist_cost'), undefined);
    assert.ok(status(match, 'a', 0, 'zabuza_hidden_mist_attack'));
    cast(match, 'a', 0, 0, ['b', 0]);
    assert.equal(match.board.b[0].hp, 60, 'Mist empowered sword deals 40');
});
