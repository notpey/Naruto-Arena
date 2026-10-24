const { test } = require('node:test');
const assert = require('node:assert/strict');
const characters = require('../data/characters');
const { buildMatchPayloadForUser } = require('../server');
const {
    buildInitialBoard,
    resolveEffectiveSkill,
    resolvePendingTurnSkills,
    computeEffectiveEnergyCost,
    tickStatusesForTurnEnd,
} = require('../battleLogic');

const index = (id) => characters.findIndex((character) => character.characterId === id);
const fullPool = () => ({ taijutsu: 10, ninjutsu: 10, bloodline: 10, genjutsu: 10 });
const makeMatch = (p1, p2) => {
    const players = [{ username: 'p1', team: p1 }, { username: 'p2', team: p2 }];
    const match = {
        players, board: buildInitialBoard(players, characters),
        chakraPools: { p1: fullPool(), p2: fullPool() },
        economy: { turnCounts: { p1: 0, p2: 0 } }, pendingTurns: {},
    };
    Object.entries(match.board).forEach(([username, units]) =>
        units.forEach((unit) => { unit.username = username; }));
    return match;
};
const cast = (match, username, slot, skillIndex, target, roster = characters) => {
    match.pendingTurns[username] = {
        queueOrder: [slot],
        queuedByActorSlot: {
            [slot]: { skillIndex, targetSelection: target ? [{ username: target[0], slot: target[1] }] : [] },
        },
    };
    resolvePendingTurnSkills({ match, actingUsername: username, characters: roster });
};
const status = (match, username, slot, id) =>
    match.board[username][slot].state.statuses.find((entry) => entry.id === id);

test('Kakashi and Iruka have four active skills and separate permanent passives', () => {
    const match = makeMatch([index('hatake-kakashi'), index('umino-iruka')], [index('uzumaki-naruto')]);
    const kakashi = characters[index('hatake-kakashi')];
    const iruka = characters[index('umino-iruka')];
    assert.deepEqual(kakashi.skills.slice(0, 4).map((skill) => skill.name),
        ['Sharingan Insight', 'Nin-Dogs Summoning', 'Earth Style: Headhunter Jutsu', 'Defender']);
    assert.equal(kakashi.skills[4].name, 'Raikiri');
    assert.equal(kakashi.skills[4].hiddenFromSelectionViewer, true);
    cast(match, 'p1', 0, 4, ['p2', 0]);
    assert.equal(match.board.p2[0].hp, 100, 'Raikiri cannot be cast directly from its alternate index');
    assert.deepEqual(iruka.skills.map((skill) => skill.name),
        ['Shuriken Throw', 'Academy Instruction', 'Sealed Bomb Square Release', 'Ally Shield']);
    assert.equal(status(match, 'p1', 0, 'hatake_kakashi_copy_ninja').metadata.passive, true);
    assert.equal(status(match, 'p1', 1, 'umino_iruka_genin_promotion').metadata.passive, true);
});

test('Kakashi prepares Raikiri from either skill with the right cost and 45 piercing damage', () => {
    for (const [slot, expectedCost, expectedStun] of [
        [1, { ninjutsu: 1, random: 1 }, 'kakashi_nin_dogs_stun'],
        [2, { taijutsu: 1, random: 1 }, 'kakashi_headhunter_stun'],
    ]) {
        const match = makeMatch([index('hatake-kakashi')], [index('uzumaki-naruto')]);
        cast(match, 'p1', 0, slot, ['p2', 0]);
        assert.equal(match.board.p2[0].hp, 85);
        assert.ok(status(match, 'p2', 0, expectedStun));
        const ready = resolveEffectiveSkill({
            characters, rosterIndex: index('hatake-kakashi'),
            skillIndex: slot, actorState: match.board.p1[0].state,
        });
        assert.equal(ready.id, 'hatake-kakashi-raikiri');
        const cost = computeEffectiveEnergyCost({ skill: ready, actorState: match.board.p1[0].state });
        assert.equal(cost.reservedSpecific.ninjutsu, expectedCost.ninjutsu || 0);
        assert.equal(cost.reservedSpecific.taijutsu, expectedCost.taijutsu || 0);
        assert.equal(cost.requiredRandom, 1);
        tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
        tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
        cast(match, 'p1', 0, slot, ['p2', 0]);
        assert.equal(match.board.p2[0].hp, 40);
        tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
        assert.equal(resolveEffectiveSkill({
            characters, rosterIndex: index('hatake-kakashi'),
            skillIndex: slot, actorState: match.board.p1[0].state,
        }).id, characters[index('hatake-kakashi')].skills[slot].id);
    }
});

test('Sharingan Insight reveals hidden traps and copies only eligible countered skills for one turn', () => {
    const match = makeMatch([index('hatake-kakashi')], [index('umino-iruka'), index('uzumaki-naruto')]);
    cast(match, 'p2', 0, 2, ['p1', 0]);
    assert.equal(buildMatchPayloadForUser(match, 'p1').board.p1[0].state.statuses
        .some((entry) => entry.id === 'iruka_sealed_bomb_trap'), false);
    cast(match, 'p1', 0, 0);
    assert.equal(buildMatchPayloadForUser(match, 'p1').board.p1[0].state.statuses
        .some((entry) => entry.id === 'iruka_sealed_bomb_trap'), true);
    cast(match, 'p2', 1, 0, ['p1', 0]);
    assert.equal(match.board.p1[0].hp, 100);
    assert.equal(status(match, 'p1', 0, 'kakashi_sharingan_insight'), undefined);
    assert.ok(status(match, 'p1', 0, 'kakashi_sharingan_reveal'));
    const copied = resolveEffectiveSkill({
        characters, rosterIndex: index('hatake-kakashi'),
        skillIndex: 0, actorState: match.board.p1[0].state,
    });
    assert.equal(copied.id, 'uzumaki-naruto-shadow-clone-assault');
    assert.equal(computeEffectiveEnergyCost({ skill: copied, actorState: match.board.p1[0].state }).requiredRandom, 1);
    tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(status(match, 'p1', 0, 'hatake-kakashi-sharingan-counter_copied_skill'), undefined);
});

test('Copy Ninja still counters Unique and preparation skills without copying them', () => {
    for (const blockedSkill of [
        { classes: ['Physical', 'Instant', 'Unique'] },
        { classes: ['Physical', 'Instant'], requiresPreparation: true },
    ]) {
        const match = makeMatch([index('hatake-kakashi')], [index('uzumaki-naruto')]);
        const roster = characters.slice();
        const naruto = characters[index('uzumaki-naruto')];
        roster[index('uzumaki-naruto')] = {
            ...naruto,
            skills: [{ ...naruto.skills[0], ...blockedSkill }, ...naruto.skills.slice(1)],
        };
        cast(match, 'p1', 0, 0);
        cast(match, 'p2', 0, 0, ['p1', 0], roster);
        assert.equal(match.board.p1[0].hp, 100);
        assert.equal(status(match, 'p1', 0, 'hatake-kakashi-sharingan-counter_copied_skill'), undefined);
    }
});

test('Iruka Genin Promotion marks once, rewards another ally, and never rewards Iruka himself', () => {
    const match = makeMatch([index('umino-iruka'), index('uzumaki-naruto')], [index('uchiha-sasuke')]);
    cast(match, 'p1', 0, 0, ['p2', 0]);
    assert.equal(match.board.p2[0].hp, 80);
    assert.equal(status(match, 'p2', 0, 'iruka_genin_promotion_mark').remainingTurns, 2);
    cast(match, 'p1', 0, 0, ['p2', 0]);
    assert.equal(match.board.p2[0].hp, 60);
    assert.equal(match.board.p2[0].state.statuses.filter((entry) => entry.id === 'iruka_genin_promotion_mark').length, 1);
    cast(match, 'p1', 1, 0, ['p2', 0]);
    assert.equal(match.board.p2[0].hp, 35, 'Naruto deals 20 plus 5 from Iruka');
    assert.equal(status(match, 'p2', 0, 'iruka_genin_promotion_mark'), undefined);
});

test('Iruka trap detonates on a harmful skill or Shuriken without cancelling the enemy skill', () => {
    const match = makeMatch([index('umino-iruka')], [index('uchiha-sasuke')]);
    cast(match, 'p1', 0, 2, ['p2', 0]);
    cast(match, 'p2', 0, 1, ['p1', 0]);
    assert.equal(match.board.p2[0].hp, 75);
    assert.equal(match.board.p1[0].hp, 80);
    assert.equal(status(match, 'p2', 0, 'iruka_sealed_bomb_trap'), undefined);
    const early = makeMatch([index('umino-iruka')], [index('uchiha-sasuke')]);
    cast(early, 'p1', 0, 2, ['p2', 0]);
    cast(early, 'p1', 0, 0, ['p2', 0]);
    assert.equal(early.board.p2[0].hp, 55);
    assert.equal(early.board.p1[0].hp, 100, 'attacking the trapped enemy does not spring the trap on Iruka');
    assert.equal(status(early, 'p2', 0, 'iruka_sealed_bomb_trap'), undefined);
});

test('Sealed Bomb Square respects invulnerability without cancelling the enemy skill', () => {
    const match = makeMatch([index('umino-iruka')], [index('uchiha-sasuke')]);
    cast(match, 'p1', 0, 2, ['p2', 0]);
    assert.equal(status(match, 'p2', 0, 'iruka_sealed_bomb_trap').remainingTurns, 2);
    match.board.p2[0].state.statuses.push({
        id: 'test_invulnerability', remainingTurns: 1,
        metadata: { helpful: true, invulnerable: true },
    });
    cast(match, 'p2', 0, 1, ['p1', 0]);
    assert.equal(match.board.p2[0].hp, 100, 'the trap detonates without damaging an invulnerable target');
    assert.equal(status(match, 'p2', 0, 'iruka_sealed_bomb_trap'), undefined);
    assert.equal(match.board.p1[0].hp, 80, 'the enemy skill still resolves');
});

test('Academy Instruction shields an ally and retaliates once while Ally Shield can protect self', () => {
    const match = makeMatch([index('umino-iruka'), index('uzumaki-naruto')], [index('uchiha-sasuke')]);
    cast(match, 'p1', 0, 1, ['p1', 1]);
    assert.equal(status(match, 'p1', 1, 'iruka_academy_instruction_defense').metadata.destructibleDefensePoints, 15);
    cast(match, 'p2', 0, 0, ['p1', 1]);
    assert.equal(match.board.p2[0].hp, 90);
    assert.equal(match.board.p1[1].hp, 95);
    assert.equal(status(match, 'p1', 1, 'iruka_academy_instruction_trap'), undefined);
    assert.ok(status(match, 'p2', 0, 'iruka_genin_promotion_mark'));
    cast(match, 'p1', 0, 3, ['p1', 0]);
    assert.equal(status(match, 'p1', 0, 'invulnerable').metadata.invulnerable, true);
});
