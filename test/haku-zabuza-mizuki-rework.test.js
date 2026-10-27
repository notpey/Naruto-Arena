const { test } = require('node:test');
const assert = require('node:assert/strict');
const characters = require('../data/characters');
const { buildInitialBoard, resolvePendingTurnSkills, resolveEffectiveSkill, tickStatusesForTurnEnd,
    computeEffectiveEnergyCost } = require('../battleLogic');

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
        [0, 'haku', 'Demon of the Ice'], [1, 'momochi-zabuza', 'Silent Killing'],
        [2, 'mizuki', 'Meld in the Shadows'],
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

test('Haku mirrors damage and followups track only the mirrored enemy; stun blocks healing', () => {
    const match = matchFor(['haku'], ['uzumaki-naruto', 'haruno-sakura', 'uchiha-sasuke']);
    cast(match, 'a', 0, 0, ['b', 0]);
    assert.ok(status(match, 'b', 0, 'haku_mirror_target'));
    assert.ok(status(match, 'a', 0, 'haku_mirror_guard'));
    assert.equal(effective(match, 'a', 0, 1).id, 'haku-flying-needles-of-death-mirrors');
    tickStatusesForTurnEnd({ match, endingUsername: 'a' });
    assert.equal(match.board.b[0].hp, 90);
    cast(match, 'a', 0, 1, ['b', 1]);
    assert.equal(match.board.b[0].hp, 80);
    assert.equal(match.board.b[1].hp, 80);
    cast(match, 'a', 0, 2, ['b', 2]);
    assert.ok(status(match, 'b', 2, 'haku_acupuncture_stun'));
    assert.ok(status(match, 'b', 0, 'haku_mirror_acupuncture_stun'));
    assert.ok(status(match, 'b', 2, 'haku_demon_of_the_ice'));
    assert.ok(status(match, 'b', 0, 'haku_demon_of_the_ice'));
    match.board.a[0].state.statuses.push({ id: 'test_stun', remainingTurns: 1,
        metadata: { harmful: true, cannotUseSkills: true } });
    tickStatusesForTurnEnd({ match, endingUsername: 'a' });
    assert.equal(status(match, 'b', 0, 'haku_mirror_target'), undefined);
    assert.equal(status(match, 'a', 0, 'haku_mirror_guard'), undefined);
});

test('Haku mirror damage pierces damage reduction each turn', () => {
    const match = matchFor(['haku'], ['uzumaki-naruto']);
    match.board.b[0].state.statuses.push({ id: 'test_damage_reduction', remainingTurns: 2,
        metadata: { helpful: true, damageReductionFlat: 20 } });
    cast(match, 'a', 0, 0, ['b', 0]);
    tickStatusesForTurnEnd({ match, endingUsername: 'a' });
    assert.equal(match.board.b[0].hp, 90);
});

test('Zabuza prison changes sword targets, mist buffs its damage, and clone counters once', () => {
    const match = matchFor(['momochi-zabuza', 'uzumaki-naruto'], ['haku', 'mizuki', 'umino-iruka']);
    const prisonCost = computeEffectiveEnergyCost({
        skill: effective(match, 'a', 0, 1), actorState: match.board.a[0].state,
    });
    assert.equal(prisonCost.reservedSpecific.ninjutsu, 1);
    assert.equal(prisonCost.requiredRandom, 0);
    cast(match, 'a', 0, 1, ['b', 0]);
    assert.ok(status(match, 'b', 0, 'zabuza_water_prison'));
    assert.equal(effective(match, 'a', 0, 0).id, 'momochi-zabuza-kubikiribocho-clone');
    cast(match, 'a', 0, 0, ['b', 1]);
    assert.equal(match.board.b[0].hp, 100);
    assert.equal(match.board.b[1].hp, 85);
    assert.equal(match.board.b[2].hp, 85);
    cast(match, 'a', 0, 3, ['a', 1]);
    cast(match, 'b', 1, 0, ['a', 1]);
    assert.equal(match.board.a[1].hp, 100);
    assert.ok(status(match, 'b', 1, 'zabuza_silent_killing'));
    assert.equal(status(match, 'a', 1, 'zabuza_water_clone'), undefined);
    match.board.a[0].state.statuses.push({ id: 'test_stun', remainingTurns: 1,
        metadata: { harmful: true, cannotUseSkills: true } });
    tickStatusesForTurnEnd({ match, endingUsername: 'a' });
    assert.equal(status(match, 'b', 0, 'zabuza_water_prison'), undefined);
    assert.equal(status(match, 'a', 0, 'zabuza_water_prison_link'), undefined);
});

test('Hidden Mist charges enemy Physical and Chakra skills, then empowers Kubikiribōchō', () => {
    const match = matchFor(['momochi-zabuza'], ['uzumaki-naruto']);
    cast(match, 'a', 0, 2);
    assert.ok(status(match, 'b', 0, 'zabuza_hidden_mist_cost'));
    assert.ok(status(match, 'a', 0, 'zabuza_hidden_mist_defense'));
    for (let turn = 0; turn < 3; turn++) {
        tickStatusesForTurnEnd({ match, endingUsername: 'a' });
        tickStatusesForTurnEnd({ match, endingUsername: 'b' });
    }
    assert.equal(status(match, 'b', 0, 'zabuza_hidden_mist_cost'), undefined);
    assert.ok(status(match, 'a', 0, 'zabuza_hidden_mist_attack'));
    match.board.b[0].state.statuses.push({ id: 'test_invulnerable', remainingTurns: 1,
        metadata: { invulnerable: true } });
    cast(match, 'a', 0, 0, ['b', 0]);
    assert.equal(match.board.b[0].hp, 65, 'Mist empowered sword deals 35 through invulnerability');
});

test('Mizuki counters a helpful skill, gains damage after non-damaging use, and consumes Windmill', () => {
    const match = matchFor(['mizuki'], ['umino-iruka', 'uzumaki-naruto', 'haruno-sakura']);
    assert.equal(effective(match, 'a', 0, 3).cooldown, 4);
    cast(match, 'a', 0, 0, ['b', 0]);
    assert.equal(match.board.b[0].hp, 80);
    cast(match, 'b', 0, 3, ['b', 0]);
    assert.equal(status(match, 'b', 0, 'mizuki_kunai_ambush_trap'), undefined);
    assert.equal(status(match, 'b', 0, 'invulnerable'), undefined);
    assert.ok(status(match, 'b', 0, 'mizuki_meld_in_the_shadows_mark'));
    cast(match, 'a', 0, 1, ['b', 0]);
    assert.equal(match.board.b[0].hp, 45, 'Execution Shuriken deals 30 plus 5 passive damage');
    cast(match, 'a', 0, 2);
    assert.equal(effective(match, 'a', 0, 1).id, 'mizuki-execution-shuriken-windmill');
    match.board.a[0].state.cooldowns = {};
    cast(match, 'a', 0, 1, ['b', 1]);
    assert.equal(match.board.b[0].hp, 15, 'marked enemy takes 25 plus 5');
    assert.equal(match.board.b[1].hp, 75);
    assert.equal(match.board.b[2].hp, 75);
    assert.equal(status(match, 'a', 0, 'mizuki_windmill'), undefined);
});

test('Mizuki passive also marks enemies who use a harmful skill without damage', () => {
    const match = matchFor(['mizuki'], ['umino-iruka']);
    cast(match, 'b', 0, 2, ['a', 0]);
    assert.ok(status(match, 'b', 0, 'mizuki_meld_in_the_shadows_mark'));
    cast(match, 'a', 0, 1, ['b', 0]);
    assert.equal(match.board.b[0].hp, 65);
});

test('countered Windmill Shuriken spends Windmill and records why it dealt no damage', () => {
    const match = matchFor(['mizuki'], ['momochi-zabuza']);
    cast(match, 'a', 0, 2);
    cast(match, 'b', 0, 3, ['b', 0]);
    cast(match, 'a', 0, 1, ['b', 0]);
    assert.equal(match.board.b[0].hp, 100);
    assert.equal(status(match, 'a', 0, 'mizuki_windmill'), undefined);
    assert.equal(match.combatEvents?.at(-1)?.outcome, 'countered');
    assert.equal(match.combatEvents?.at(-1)?.skillName, 'Execution Shuriken');
});
