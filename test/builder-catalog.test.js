const test = require('node:test');
const assert = require('node:assert/strict');

const { getBuilderCatalog, baseCatalog } = require('../data/builder');
const { checkCharacter } = require('../character-builder-checks');
const characters = require('../data/characters');
const { ACTIVE_ROSTER_IDS } = require('../data/activeRoster');

const liveRoster = characters.filter((character) => ACTIVE_ROSTER_IDS.includes(character.characterId));
const catalog = getBuilderCatalog(liveRoster);
const clone = (value) => JSON.parse(JSON.stringify(value));

// Every key the live roster uses, by where it sits.
function collectLiveKeys() {
    const keys = { effectTypes: new Set(), statusSettings: new Set(), effectSettings: new Set(), conditions: new Set(),
        skillFields: new Set(), passiveFields: new Set(), questFields: new Set() };
    const visitCondition = (condition) => {
        if (!condition || typeof condition !== 'object') return;
        Object.entries(condition).forEach(([key, value]) => {
            keys.conditions.add(key);
            if (key === 'all') value.forEach(visitCondition);
        });
    };
    const visit = (value, inStatus) => {
        if (Array.isArray(value)) return value.forEach((entry) => visit(entry, inStatus));
        if (!value || typeof value !== 'object') return;
        const isEffect = typeof value.type === 'string';
        if (isEffect) {
            keys.effectTypes.add(value.type);
            visitCondition(value.condition);
        }
        if (value.metadata && typeof value.metadata === 'object') {
            const statusLike = !isEffect || value.type === 'apply_status';
            Object.keys(value.metadata).forEach((key) => (statusLike ? keys.statusSettings : keys.effectSettings).add(key));
        }
        Object.values(value).forEach((entry) => visit(entry, inStatus));
    };
    liveRoster.forEach((character) => {
        (character.skills || []).forEach((skill) => {
            Object.keys(skill).forEach((key) => keys.skillFields.add(key));
            visitCondition(skill.targetCondition);
            visitCondition(skill.actorCondition);
            visit(skill.effects);
        });
        if (character.passive) {
            Object.keys(character.passive).forEach((key) => keys.passiveFields.add(key));
            Object.keys(character.passive.awakening || {}).forEach((key) => keys.questFields.add(key));
            visit(character.passive);
        }
        visit(character.startStatuses);
    });
    return keys;
}

test('the catalog describes everything the live roster uses', () => {
    const keys = collectLiveKeys();
    const missing = (set, known, ignore = []) => [...set].filter((key) => !known[key] && !ignore.includes(key)).sort();
    assert.deepEqual(missing(keys.effectTypes, catalog.effectTypes), [], 'effect types');
    // Status-shaped settings include a few runtime and counter-value keys the checker allows.
    const counterValues = new Set();
    JSON.stringify(liveRoster, (key, value) => {
        if (value && typeof value === 'object' && typeof value.stackMetadataKey === 'string') counterValues.add(value.stackMetadataKey);
        if (value && typeof value === 'object' && value.stackDerivedNumericKeys) Object.keys(value.stackDerivedNumericKeys).forEach((k) => counterValues.add(k));
        return value;
    });
    const statusKnown = { ...catalog.statusSettings, ...Object.fromEntries(Object.entries(catalog.effectSettings).filter(([, s]) => s.anyEffect)) };
    assert.deepEqual(missing(keys.statusSettings, statusKnown, [...counterValues, 'passive', 'stacks', 'stackable', 'maxStacks']), [], 'status settings');
    assert.deepEqual(missing(keys.effectSettings, { ...catalog.effectSettings, tooltipText: 1, tooltipTextTemplate: 1 }), [], 'effect settings');
    assert.deepEqual(missing(keys.conditions, { ...catalog.conditionChecks, ...catalog.conditionOutcomes }), [], 'conditions');
    assert.deepEqual(missing(keys.skillFields, catalog.skillFields, ['id', ...catalog.ignoredSkillFields]), [], 'skill fields');
    assert.deepEqual(missing(keys.passiveFields, catalog.passiveFields, ['sandFlowStacks', 'deadAllyDamageBonus']), [], 'passive fields');
    assert.deepEqual(missing(keys.questFields, catalog.questFields), [], 'quest fields');
});

test('every catalog entry has a label and a known group or kind', () => {
    const groups = new Set(baseCatalog.statusGroups.map((group) => group.id));
    Object.entries(baseCatalog.statusSettings).forEach(([key, setting]) => {
        assert.ok(setting.label, `${key} label`);
        assert.ok(groups.has(setting.group), `${key} group`);
        assert.ok(setting.kind, `${key} kind`);
    });
    Object.entries(baseCatalog.effectTypes).forEach(([key, type]) => {
        assert.ok(type.label && type.description && type.group, `${key} label, description and group`);
    });
    // The six effect types the triggered-effects runner handles.
    assert.deepEqual(Object.keys(baseCatalog.effectTypes).filter((key) => baseCatalog.effectTypes[key].triggered).sort(),
        ['apply_status', 'cleanse_statuses', 'damage', 'gain_chakra', 'heal', 'health_steal_damage']);
});

test('the live roster has no problems the engine would ignore or misread', () => {
    const errors = [];
    liveRoster.forEach((character) => checkCharacter(character, { catalog, roster: liveRoster })
        .filter((issue) => issue.level === 'error')
        .forEach((issue) => errors.push(`${character.characterId} | ${issue.where}: ${issue.message}`)));
    assert.deepEqual(errors, []);
});

test('checks explain common mistakes in plain words', () => {
    const base = clone(liveRoster.find((character) => character.characterId === 'haruno-sakura'));
    const check = (mutate) => {
        const draft = clone(base);
        mutate(draft);
        return checkCharacter(draft, { catalog, roster: liveRoster }).map((issue) => `${issue.level}: ${issue.message}`);
    };
    const has = (list, pattern) => assert.ok(list.some((line) => pattern.test(line)), `expected ${pattern} in:\n${list.join('\n')}`);

    has(check((c) => { c.skills[0].effects[0].scope = 'all-ally'; }), /^error: "all-ally" isn't a recipient the engine knows/);
    has(check((c) => { c.skills[0].effects.push({ type: 'remove_random_chakra', amount: 1, condition: { statusId: 'x' }, ignoredKey: 1 }); }), /^warning: "ignoredKey" isn't read on this kind of effect/);
    has(check((c) => { c.skills[0].effects.push({ type: 'destroy_destructible_defense', condition: { statusId: 'x' } }); }), /^error: Destroy destructible defense effects ignore conditions/);
    has(check((c) => {
        c.skills[0].effects.push({ type: 'apply_status', statusId: 'test_trap', duration: 1, metadata: { harmful: true, tooltipText: 't',
            onExpireEffects: [{ type: 'remove_chakra', amount: 1 }] } });
    }), /^error: Remove chakra doesn't work inside a status's triggered effects/);
    has(check((c) => { c.passive.damageReductionFlat = 5; }), /^error: "Damage reduction" doesn't work on a passive\. Put it on a Starting status instead\./);
    has(check((c) => { c.skills[0].effects.push({ type: 'remove_status', statusId: 'no_such_status' }); }), /^warning: Nothing applies a status named "no_such_status"/);
    has(check((c) => {
        c.skills[0].effects.push({ type: 'apply_status', statusId: 'swap', duration: 1, metadata: { helpful: true, tooltipText: 't', skillReplacements: { 'haruno-sakura-sakura-kick': 'missing-skill' } } });
    }), /^error: There's no skill with the id "missing-skill"/);
    has(check((c) => { c.passive.awakening = { statusId: 'woke', metadata: { helpful: true } }; }), /^error: The quest has no goal/);
    has(check((c) => { c.skills[0].effects.push({ type: 'apply_status', statusId: 'shown', duration: 1, metadata: { harmful: true } }); }), /^warning: Players will see this status, but it has no tooltip/);
    assert.deepEqual(check(() => {}).filter((line) => line.startsWith('error')), [], 'an unchanged live character has no errors');
});
