// Character Editor requests (Nov 28): unpierceable damage reduction, no Mental class (it is
// Strategic), and 99 turns meaning permanent.
const assert = require('node:assert/strict');
const test = require('node:test');
const S = require('../character-sentences.js');
const battle = require('../battleLogic');
const characters = require('../data/characters');
const vocabulary = require('../data/builder/vocabulary');

test('the damage reduction sentence can make reduction that piercing cannot ignore', () => {
    const ctx = S.contextFor({ name: 'X' });
    const effect = S.BY_ID.reduction.create({ who: 'self', amount: 15, pierce: 'unpierceable', turns: 2 }, ctx);
    assert.equal(effect.metadata.unpierceableDamageReductionFlat, 15);
    assert.equal(effect.metadata.damageReductionFlat, undefined);
    assert.deepEqual(S.readEffect(effect).values, { who: 'self', turns: 2, amount: 15, pierce: 'unpierceable' });
    const normal = S.BY_ID.reduction.create({ who: 'self', amount: 10, pierce: 'normal', turns: 1 }, ctx);
    assert.equal(normal.metadata.damageReductionFlat, 10);
    assert.equal(S.readEffect(normal).values.pierce, 'normal');
});

test('unpierceable damage reduction holds against piercing damage', () => {
    const indexOf = (id) => characters.findIndex((character) => character.characterId === id);
    const players = [{ username: 'a', team: ['rock-lee', 'tenten', 'baki'].map(indexOf) },
        { username: 'b', team: ['temari', 'kankuro', 'baki'].map(indexOf) }];
    const board = battle.buildInitialBoard(players, characters);
    const unit = board.b[0];
    battle.applyStatus({ targetState: unit.state, statusId: 'shield', duration: 2, sourceUsername: 'b', sourceSlot: 0,
        metadata: { helpful: true, unpierceableDamageReductionFlat: 10 } });
    battle.applyDamageToUnit(unit, 30, { piercing: true, ignoreDamageReduction: true });
    assert.equal(unit.hp, 80, '30 piercing damage less 10 unpierceable reduction');
});

test('there is no Mental class: the editor offers Strategic, and Mental counts as Strategic', () => {
    assert.equal(vocabulary.SKILL_CLASSES.some((entry) => /mental/i.test(entry.id)), false);
    const stunKinds = S.BY_ID.stun.fields.find((field) => field.key === 'skills').options.map((option) => option.id);
    assert.ok(stunKinds.includes('strategic') && stunKinds.includes('non-strategic'));
    assert.equal(stunKinds.includes('mental'), false);
    assert.equal(battle.hasSkillClass(['Mental'], 'strategic'), true);
    assert.equal(battle.hasSkillClass(['Strategic'], 'mental'), true);
});

test('a non-Strategic stun stops Chakra and Physical skills but not Strategic ones (Iruka)', () => {
    const iruka = characters.find((character) => character.characterId === 'umino-iruka');
    const stun = iruka.skills.find((skill) => skill.id === 'umino-iruka-sealed-bomb-square-release')
        .effects[0].metadata.counterStatusMetadata;
    assert.equal(stun.cannotUseNonStrategicSkills, true);
    assert.equal(stun.cannotUseSkillClasses, undefined);

    const indexOf = (id) => characters.findIndex((character) => character.characterId === id);
    const used = (skillId) => {
        const players = [{ username: 'a', team: ['rock-lee', 'tenten', 'baki'].map(indexOf) },
            { username: 'b', team: ['temari', 'kankuro', 'gato'].map(indexOf) }];
        const match = { players, board: battle.buildInitialBoard(players, characters),
            chakraPools: { a: { taijutsu: 9, ninjutsu: 9, bloodline: 9, genjutsu: 9 }, b: {} },
            economy: { turnCounts: { a: 0, b: 0 } }, pendingTurns: {} };
        Object.entries(match.board).forEach(([username, units]) => units.forEach((unit) => { unit.username = username; }));
        battle.applyStatus({ targetState: match.board.a[0].state, statusId: 'iruka_stun', duration: 2,
            sourceUsername: 'b', sourceSlot: 0, metadata: { harmful: true, cannotUseNonStrategicSkills: true } });
        const index = characters[indexOf('rock-lee')].skills.findIndex((skill) => skill.id === skillId);
        match.pendingTurns.a = { queueOrder: [0], queuedByActorSlot: { 0: { skillIndex: index, targetSelection: [{ username: 'b', slot: 0 }] } } };
        const before = match.board.b[0].hp;
        battle.resolvePendingTurnSkills({ match, actingUsername: 'a', characters });
        return { damaged: match.board.b[0].hp < before, weights: (match.board.a[0].state.statuses || []).length };
    };
    assert.equal(used('rock-lee-high-speed-taijutsu').damaged, false, 'a Physical skill is stunned');
    const statusesBefore = used('rock-lee-high-speed-taijutsu').weights;
    assert.ok(used('rock-lee-remove-training-weights').weights > statusesBefore, 'a Strategic skill still works');
});

test('a status lasting 99 turns never runs out', () => {
    const indexOf = (id) => characters.findIndex((character) => character.characterId === id);
    const players = [{ username: 'a', team: ['rock-lee', 'tenten', 'baki'].map(indexOf) },
        { username: 'b', team: ['temari', 'kankuro', 'gato'].map(indexOf) }];
    const match = { players, board: battle.buildInitialBoard(players, characters), pendingTurns: {},
        economy: { turnCounts: { a: 0, b: 0 } } };
    const state = match.board.a[0].state;
    battle.applyStatus({ targetState: state, statusId: 'forever', duration: 99, sourceUsername: 'a', sourceSlot: 0,
        metadata: { helpful: true, damageBonusFlat: 5 } });
    battle.applyStatus({ targetState: state, statusId: 'brief', duration: 3, sourceUsername: 'a', sourceSlot: 0,
        metadata: { helpful: true, damageBonusFlat: 5 } });
    for (let turn = 0; turn < 120; turn += 1) battle.tickStatusesForTurnEnd({ match, endingUsername: 'a' });
    const remaining = (id) => state.statuses.find((status) => status.id === id)?.remainingTurns || 0;
    assert.equal(remaining('forever'), 99, 'still active after 120 turn ends');
    assert.equal(remaining('brief'), 0);
});
