const test = require('node:test');
const assert = require('node:assert/strict');
const characters = require('../data/characters');
const battle = require('../battleLogic');
const { CharacterService } = require('../services/characterService');

const indexOf = (id) => characters.findIndex((character) => character.characterId === id);
const pool = () => ({ taijutsu: 10, ninjutsu: 10, bloodline: 10, genjutsu: 10 });
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
const endTurn = (match, username) => battle.tickStatusesForTurnEnd({ match, endingUsername: username });
const status = (unit, id) => unit.state.statuses.find((entry) => entry.id === id && entry.remainingTurns > 0);
const effective = (match, username, slot, skillIndex) => battle.resolveEffectiveSkill({
    characters, rosterIndex: match.board[username][slot].rosterIndex, skillIndex,
    actorState: match.board[username][slot].state,
});

test('Kakashi: Nin-Dogs Summoning and Headhunter Jutsu have a cooldown of 1', () => {
    const kakashi = characters[indexOf('hatake-kakashi')];
    assert.deepEqual(kakashi.skills.slice(0, 4).map((skill) => skill.cooldown), [2, 1, 1, 4]);
});

test('Kakashi: Sharingan Insight becomes Raikiri for 1 turn when it counters nothing', () => {
    const match = matchFor(['hatake-kakashi'], ['uzumaki-naruto']);
    cast(match, 'p1', 0, 0);
    endTurn(match, 'p1');
    assert.equal(effective(match, 'p1', 0, 0).id, 'hatake-kakashi-sharingan-counter',
        'Raikiri is not offered while the enemy can still trigger the counter');
    endTurn(match, 'p2');
    const raikiri = effective(match, 'p1', 0, 0);
    assert.equal(raikiri.id, 'hatake-kakashi-raikiri');
    const raikiriCost = battle.computeEffectiveEnergyCost({ skill: raikiri, actorState: match.board.p1[0].state });
    assert.equal(raikiriCost.reservedSpecific.bloodline, 1);
    assert.equal(raikiriCost.requiredRandom, 1);
    cast(match, 'p1', 0, 0, 'p2', 0);
    assert.equal(match.board.p2[0].hp, 55, 'Raikiri deals 45 piercing damage');
    endTurn(match, 'p1');
    assert.equal(effective(match, 'p1', 0, 0).id, 'hatake-kakashi-sharingan-counter',
        'the replacement lasts 1 turn');
});

test('Kakashi: a successful counter keeps the copied skill instead of Raikiri', () => {
    const match = matchFor(['hatake-kakashi'], ['uzumaki-naruto']);
    cast(match, 'p1', 0, 0);
    endTurn(match, 'p1');
    cast(match, 'p2', 0, 0, 'p1', 0);
    assert.equal(match.board.p1[0].hp, 100, 'the counter cancels the attack');
    endTurn(match, 'p2');
    assert.equal(effective(match, 'p1', 0, 0).id, 'uzumaki-naruto-shadow-clone-assault');
    assert.equal(status(match.board.p1[0], 'kakashi_insight_raikiri_ready'), undefined);
});

test('Rock Lee: High Speed Taijutsu makes Lee invulnerable to physical skills only', () => {
    const match = matchFor(['rock-lee'], ['uzumaki-naruto']);
    cast(match, 'p1', 0, 0, 'p2', 0);
    const lee = match.board.p1[0];
    assert.equal(battle.isUnitInvulnerableForSkill(lee, ['Physical', 'Instant']), true);
    assert.equal(battle.isUnitInvulnerableForSkill(lee, ['Chakra', 'Instant']), false);
    endTurn(match, 'p1');
    cast(match, 'p2', 0, 0, 'p1', 0);
    assert.equal(lee.hp, 100, "Naruto's physical attack cannot target Lee");
});

test('Rock Lee: the fifth Gate no longer removes cooldowns and Final Lotus grants no chakra', () => {
    const lee = characters[indexOf('rock-lee')];
    const fifthGate = lee.startStatuses[0].metadata.onOwnerUseSkillApplyStatusToOwner.metadata.applyStatusAtStack.metadata;
    assert.equal(fifthGate.skillCooldownOverridesBySkillId, undefined);
    assert.equal(fifthGate.onOwnerKillGainChakra, undefined);
    assert.ok(fifthGate.onOwnerKillApplyStatusToSelf, 'Final Lotus still grants immortality');
    const weights = lee.skills.find((skill) => skill.id === 'rock-lee-remove-training-weights');
    assert.ok(weights.effects.some((effect) => effect.type === 'gain_chakra' && effect.chakraType === 'random'));
});

test('Gaara: Sand Flow is capped at 8 stacks', () => {
    const match = matchFor(['gaara-of-the-desert'], ['uzumaki-naruto']);
    const flow = () => status(match.board.p1[0], 'gaara_of_the_desert_sand_flow').metadata.sandFlowStacks;
    for (let turn = 0; turn < 6; turn += 1) {
        endTurn(match, 'p1');
        endTurn(match, 'p2');
    }
    assert.equal(flow(), 8, 'undamaged turns stop adding stacks at 8');
    cast(match, 'p1', 0, 0, 'p2', 0);
    assert.equal(flow(), 8, 'Sand Binding Coffin cannot exceed 8 stacks');
    battle.applyDamageToUnit(match.board.p1[0], 20, { match, targetUsername: 'p1', targetSlot: 0 });
    assert.equal(flow(), 8, 'taking damage cannot exceed 8 stacks');
});

test('Gaara: Sand Sphere scales from Sand Flow and then consumes it', () => {
    const match = matchFor(['gaara-of-the-desert'], ['uzumaki-naruto']);
    endTurn(match, 'p1');
    cast(match, 'p1', 0, 2);
    assert.equal(status(match.board.p1[0], 'gaara_sand_sphere').metadata.destructibleDefensePoints, 35);
    assert.equal(status(match.board.p1[0], 'gaara_of_the_desert_sand_flow').metadata.sandFlowStacks, 0);
    assert.equal(status(match.board.p1[0], 'gaara_of_the_desert_sand_flow').metadata.unpierceableDamageReductionFlat, 5,
        'consuming stacks keeps the passive intact');
});

test('Kin: Illusion Bell Needles cannot be used while its counter is active', () => {
    const match = matchFor(['tsuchi-kin'], ['haruno-sakura']);
    cast(match, 'p1', 0, 0);
    assert.ok(status(match.board.p1[0], 'tsuchi_kin_illusion_bell_needles'));
    match.board.p1[0].state.cooldowns = {};
    const chakraBefore = { ...match.chakraPools.p1 };
    cast(match, 'p1', 0, 0);
    assert.deepEqual(match.chakraPools.p1, chakraBefore, 'the recast is refused');
});

test('Dosu: enhanced Vibrating Sound Drill taxes skills for 2 turns', () => {
    const match = matchFor(['dosu-kinuta'], ['haruno-sakura']);
    const base = battle.computeEffectiveEnergyCost({
        skill: effective(match, 'p2', 0, 3), actorState: match.board.p2[0].state }).requiredRandom;
    const taxed = () => battle.computeEffectiveEnergyCost({
        skill: effective(match, 'p2', 0, 3), actorState: match.board.p2[0].state }).requiredRandom;
    cast(match, 'p1', 0, 2);
    cast(match, 'p1', 0, 0, 'p2', 0);
    assert.equal(taxed(), base + 1);
    endTurn(match, 'p1');
    endTurn(match, 'p2');
    endTurn(match, 'p1');
    assert.equal(taxed(), base + 1, 'the enhanced tax lasts 1 additional turn');
    endTurn(match, 'p2');
    endTurn(match, 'p1');
    assert.equal(taxed(), base);
});

test('Zaku: Sound Wall ignores non-physical skills', () => {
    const match = matchFor(['zaku-abumi', 'uzumaki-naruto'], ['uchiha-sasuke']);
    cast(match, 'p1', 0, 1);
    endTurn(match, 'p1');
    cast(match, 'p2', 0, 1, 'p1', 1);
    assert.equal(match.board.p1[1].hp, 80, 'the Chakra skill is not countered');
    assert.ok(match.board.p1.every((unit) => status(unit, 'zaku_abumi_sound_wall')),
        'Sound Wall stays up for a physical skill');
});

test('Ino: Mind Transfer Feint deals no extra damage to stunned enemies', () => {
    const match = matchFor(['yamanaka-ino'], ['haruno-sakura']);
    match.board.p2[0].state.statuses.push({ id: 'test_stun', remainingTurns: 1,
        metadata: { harmful: true, cannotUseSkills: true } });
    cast(match, 'p1', 0, 0, 'p2', 0);
    assert.equal(match.board.p2[0].hp, 80);
});

test('Tenten: Twin Rising Dragons marks are permanent and end when Tenten dies', () => {
    const match = matchFor(['tenten'], ['haruno-sakura', 'uzumaki-naruto']);
    cast(match, 'p1', 0, 0, 'p2', 0);
    for (let turn = 0; turn < 4; turn += 1) {
        endTurn(match, 'p1');
        endTurn(match, 'p2');
    }
    assert.ok(match.board.p2.every((unit) => status(unit, 'tenten_twin_rising_dragons_mark')),
        'the marks persist');
    match.board.p1[0].hp = 0;
    match.board.p1[0].alive = false;
    battle.purgeTetheredStatusesOnSourceDeath({ match, sourceUsername: 'p1', sourceSlot: 0 });
    assert.ok(match.board.p2.every((unit) => !status(unit, 'tenten_twin_rising_dragons_mark')));
});

test('Shino: Infestation deals 10 on the first turn, then 5 each turn', () => {
    const match = matchFor(['aburame-shino'], ['haruno-sakura']);
    cast(match, 'p1', 0, 2, 'p2', 0);
    endTurn(match, 'p1');
    assert.equal(match.board.p2[0].hp, 90);
    endTurn(match, 'p2');
    endTurn(match, 'p1');
    assert.equal(match.board.p2[0].hp, 85);
});

test('Hiruzen Search Party has no cooldown, Shikamaru Shadow Imitation has 3, Orochimaru costs are updated', () => {
    const skill = (id, name) => characters[indexOf(id)].skills.find((entry) => entry.name === name);
    assert.equal(skill('sarutobi-hiruzen', 'Search Party').cooldown, 0);
    assert.equal(skill('nara-shikamaru', 'Shadow Imitation').cooldown, 3);
    assert.deepEqual(skill('shiore-orochimaru', 'Devour').energy, ['Bloodline']);
    assert.equal(skill('shiore-orochimaru', 'Cursed Seal Bite').effects[0].amount, 15);
});

test('the balance update 0.4 migration replaces stored kits once', async () => {
    const stale = { characterId: 'tsuchi-kin', id: 'tsuchi-kin', name: 'Tsuchi Kin', skills: [] };
    const writes = [];
    const collection = {
        findOne: async ({ key }) => key === 'characters'
            ? { key, characters: [stale] }
            : { key, completed: { 'zabuza-hinata-mizuki-fix-2026-11-03': new Date() } },
        updateOne: async (filter, update) => { writes.push(update); },
    };
    const loaded = await new CharacterService({ appStateCollection: collection }).getStoredCharacters();
    const kin = loaded.find((character) => character.characterId === 'tsuchi-kin');
    assert.equal(kin.skills[1].effects[0].amount, 15);
    assert.ok(writes.some((update) => update.$set?.['completed.balance-update-0-4-2026-11-07']));
});
