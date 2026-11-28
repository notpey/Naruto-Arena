const test = require('node:test');
const assert = require('node:assert/strict');

const S = require('../character-sentences');
const characters = require('../data/characters');
const { ACTIVE_ROSTER_IDS } = require('../data/activeRoster');

const roster = characters.filter((character) => ACTIVE_ROSTER_IDS.includes(character.characterId));
const sortKeys = (value) => (Array.isArray(value) ? value.map(sortKeys)
    : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortKeys(value[key])])) : value);
const same = (a, b) => JSON.stringify(sortKeys(a)) === JSON.stringify(sortKeys(b));

test('opening a live character as sentences never changes it', () => {
    let read = 0;
    roster.forEach((character) => character.skills.forEach((skill) => (skill.effects || []).forEach((effect) => {
        const found = S.readEffect(effect);
        if (!found) return;
        read += 1;
        const copy = JSON.parse(JSON.stringify(effect));
        S.BY_ID[found.sentence].write(copy, found.values, found.values, S.contextFor(character, skill));
        assert.ok(same(copy, effect), `${character.characterId} ${skill.name}: ${found.sentence} changed on a no-op edit`);
    })));
    assert.ok(read >= 100, `most everyday effects read as sentences (${read})`);
});

test('every sentence reads back as itself', () => {
    const character = { characterId: 'test', name: 'Test Ninja', skills: [
        { id: 'test-kick', name: 'Kick', effects: [] },
        { id: 'test-big-kick', name: 'Big Kick', hiddenFromSelectionViewer: true, effects: [] },
    ] };
    S.SENTENCES.forEach((sentence) => {
        const values = S.defaults(sentence.id);
        if (sentence.id === 'transform') Object.assign(values, { from: 'test-kick', to: 'test-big-kick' });
        if (sentence.id === 'damagePerStack') values.stack = 'test_kick_clone|clone';
        if (sentence.id === 'gainStack') values.name = 'Clone';
        const effect = sentence.create(values, S.contextFor(character, character.skills[0]));
        const back = S.readEffect(effect);
        assert.equal(back && back.sentence, sentence.id, sentence.id);
        assert.ok(same(back.values, values), `${sentence.id} values`);
    });
});

test('editing a blank keeps the status name and a hand-written tooltip', () => {
    const effect = { type: 'apply_status', statusId: 'custom_name', duration: 1, scope: 'self',
        metadata: { helpful: true, damageReductionFlat: 5, tooltipText: 'Hand written.' } };
    const found = S.readEffect(effect);
    assert.equal(found.sentence, 'reduction');
    S.BY_ID.reduction.write(effect, { ...found.values, amount: 15, turns: 2 }, found.values, S.contextFor({ name: 'X' }));
    assert.equal(effect.statusId, 'custom_name');
    assert.equal(effect.metadata.tooltipText, 'Hand written.');
    assert.equal(effect.metadata.damageReductionFlat, 15);
    assert.equal(effect.duration, 2);
    // An auto-written tooltip follows the numbers.
    const auto = S.BY_ID.reduction.create({ who: 'self', amount: 5, turns: 1 }, S.contextFor({ name: 'X', characterId: 'x' }, { name: 'Guard' }));
    S.BY_ID.reduction.write(auto, { who: 'self', amount: 20, turns: 1 }, { who: 'self', amount: 5, turns: 1 }, S.contextFor({ name: 'X' }));
    assert.equal(auto.metadata.tooltipText, 'This character has 20 damage reduction.');
});

test('effects with mechanics a sentence does not cover stay special', () => {
    assert.equal(S.readEffect({ type: 'damage', amount: 20, scope: 'target', condition: { statusId: 'x' } }), null);
    assert.equal(S.readEffect({ type: 'apply_status', statusId: 'x', duration: 1, scope: 'target',
        metadata: { harmful: true, cannotUseSkills: true, invulnerableToHelpfulSkills: true } }), null);
    assert.equal(S.readEffect({ type: 'apply_status', statusId: 'x', duration: 1, scope: 'target',
        metadata: { harmful: true, cannotUseSkillClasses: ['affliction'] } }), null, 'a class stun the sentence can\'t offer');
});

test('descriptions read as plain English', () => {
    const character = { characterId: 'm', name: 'Hozuki Mangetsu' };
    const skill = { name: 'Water Fang', effects: [] };
    const ctx = S.contextFor(character, skill);
    skill.effects.push(S.BY_ID.damage.create({ amount: 25, kind: 'normal', who: 'target' }, ctx));
    skill.effects.push(S.BY_ID.stun.create({ who: 'target', skills: 'physical', turns: 1 }, ctx));
    skill.effects.push(S.BY_ID.stun.create({ who: 'all-enemy', skills: 'all', turns: 2 }, ctx));
    assert.equal(S.describeSkill(skill, character),
        "Mangetsu deals 25 damage to the target. The target's Physical skills are stunned for 1 turn. All enemies are stunned for 2 turns.");
});

test('a simple quest round-trips, and the live quests stay special and untouched', () => {
    const character = { characterId: 'm', name: 'Hozuki Mangetsu', passive: { name: 'Hydrification' },
        skills: [{ id: 'm-a', name: 'Water Fang' }, { id: 'm-b', name: 'Hydro Fang', hiddenFromSelectionViewer: true }] };
    const values = { skills: 4, heal: 5, reduction: 0, boost: 10, partialStuns: true, swapFrom: 'm-a', swapTo: 'm-b' };
    S.writeQuest(character.passive, values, null, S.contextFor(character, { name: 'Hydrification' }));
    const quest = character.passive.awakening;
    assert.equal(quest.statusId, 'm_hydrification_awakened');
    assert.match(quest.progressTooltipTextTemplate, /Progress: \{awakeningSkillUses\}\/4/);
    assert.deepEqual(S.readQuest(quest), values);
    roster.filter((entry) => entry.passive && entry.passive.awakening).forEach((entry) => {
        assert.equal(S.readQuest(entry.passive.awakening), null, `${entry.characterId}'s quest uses more than the simple quest offers`);
    });
});

test('templates build the same shapes the live roster uses', () => {
    const character = { characterId: 'm', name: 'Hozuki Mangetsu', skills: [{ id: 'm-a', name: 'Water Fang' }] };
    const ctx = S.contextFor(character, character.skills[0]);
    const counter = S.BY_ID.counter.create({ turns: 1, who: 'self', cancel: 'cancel', damage: 15, stun: 1 }, ctx);
    assert.equal(counter.metadata.triggerOnEnemyHarmfulSkill, true);
    assert.equal(counter.metadata.counterCancelsSkill, true);
    assert.equal(counter.metadata.counterDamage, 15);
    assert.equal(counter.metadata.counterStatusMetadata.cannotUseSkills, true);
    const trap = S.BY_ID.trap.create({ turns: 1, who: 'target', when: 'damaging', cancel: 'land', damage: 20, stun: 0 }, ctx);
    assert.equal(trap.metadata.triggerOnlyOnOwnerSkillUse, true);
    assert.equal(trap.metadata.triggerOnlyOnDamagingSkill, true);
    assert.equal(trap.metadata.counterCancelsSkill, false);
    assert.equal(trap.metadata.counterStatusId, undefined, 'no stun when stun turns are 0');
    const mark = S.BY_ID.mark.create({ who: 'target', turns: 3, amount: 10, skill: '' }, ctx);
    assert.equal(mark.metadata.bonusDamageFromSourceCharacterId, 'm');
    assert.equal(mark.metadata.bonusDamageAppliesToSkillIds, undefined, 'all skills when none is picked');
});
