const { test } = require('node:test');
const assert = require('node:assert/strict');

const { normalizeWarRuleset, validateWarTeam } = require('../services/warRules');

const snapshot = {
    version: 1,
    characters: {
        'stunner-a': { name: 'Stunner A', tags: ['stun'], reasons: { stun: ['Bind'] } },
        'stunner-b': { name: 'Stunner B', tags: ['stun', 'aoe'], reasons: { stun: ['Freeze'], aoe: ['Freeze'] } },
        'stunner-c': { name: 'Stunner C', tags: ['stun'], reasons: { stun: ['Trap'] } },
        'healer': { name: 'Healer', tags: ['heal'], reasons: { heal: ['Mend'] } },
        'striker': { name: 'Striker', tags: [], reasons: {} },
    },
};

const codes = (result) => result.violations.map((violation) => violation.code);

test('a team that breaks no rule is valid', () => {
    const result = validateWarTeam({
        ruleset: { archetypeLimits: [{ tag: 'stun', max: 2 }] },
        team: ['stunner-a', 'stunner-b', 'healer'],
        archetypeSnapshot: snapshot,
    });
    assert.deepEqual(result, { valid: true, violations: [] });
});

test('banned characters are rejected', () => {
    const result = validateWarTeam({
        ruleset: { bannedCharacterIds: ['Healer'] },
        team: ['stunner-a', 'striker', 'healer'],
        archetypeSnapshot: snapshot,
    });
    assert.deepEqual(codes(result), ['banned-character']);
    assert.equal(result.violations[0].message, 'Healer is banned in this war.');
});

test('banned combinations only apply when every member is on the team', () => {
    const ruleset = { bannedCombinations: [['stunner-a', 'healer']] };
    const blocked = validateWarTeam({ ruleset, team: ['healer', 'striker', 'stunner-a'], archetypeSnapshot: snapshot });
    assert.deepEqual(codes(blocked), ['banned-combination']);
    assert.equal(blocked.violations[0].message, 'Healer + Stunner A is a banned combination in this war.');

    const allowed = validateWarTeam({ ruleset, team: ['healer', 'striker', 'stunner-b'], archetypeSnapshot: snapshot });
    assert.equal(allowed.valid, true);
});

test('a full stun team is rejected and the message names the stunning skills', () => {
    const result = validateWarTeam({
        ruleset: { archetypeLimits: [{ tag: 'stun', max: 2 }] },
        team: ['stunner-a', 'stunner-b', 'stunner-c'],
        archetypeSnapshot: snapshot,
    });
    assert.deepEqual(codes(result), ['archetype-limit']);
    assert.equal(
        result.violations[0].message,
        'Teams may include at most 2 Stun characters in this war: Stunner A (Bind), Stunner B (Freeze), Stunner C (Trap).'
    );
});

test('a limit of zero bans the type outright', () => {
    const result = validateWarTeam({
        ruleset: { archetypeLimits: [{ tag: 'aoe', max: 0 }] },
        team: ['stunner-b', 'striker', 'healer'],
        archetypeSnapshot: snapshot,
    });
    assert.equal(result.violations[0].message, 'Area of Effect characters are not allowed in this war: Stunner B (Freeze).');
});

test('characters missing from the locked snapshot cannot dodge type limits', () => {
    const result = validateWarTeam({
        ruleset: { archetypeLimits: [{ tag: 'stun', max: 2 }] },
        team: ['stunner-a', 'striker', 'brand-new'],
        archetypeSnapshot: snapshot,
    });
    assert.deepEqual(codes(result), ['unclassified-character']);
});

test('no-repeat rules reject characters already used in the set or war', () => {
    const result = validateWarTeam({
        ruleset: { noRepeatScope: 'set' },
        team: ['stunner-a', 'striker', 'healer'],
        archetypeSnapshot: snapshot,
        usedCharacterIds: ['striker'],
    });
    assert.deepEqual(codes(result), ['repeated-character']);
    assert.equal(result.violations[0].message, 'You already used Striker in this set.');

    const ignored = validateWarTeam({
        ruleset: { noRepeatScope: 'none' },
        team: ['stunner-a', 'striker', 'healer'],
        archetypeSnapshot: snapshot,
        usedCharacterIds: ['striker'],
    });
    assert.equal(ignored.valid, true);
});

test('teams must have three different characters', () => {
    const result = validateWarTeam({ ruleset: {}, team: ['striker', 'striker', 'healer'], archetypeSnapshot: snapshot });
    assert.deepEqual(codes(result), ['invalid-team']);
});

test('every violation is reported together', () => {
    const result = validateWarTeam({
        ruleset: {
            bannedCharacterIds: ['healer'],
            bannedCombinations: [['stunner-a', 'striker']],
            noRepeatScope: 'war',
        },
        team: ['stunner-a', 'striker', 'healer'],
        archetypeSnapshot: snapshot,
        usedCharacterIds: ['stunner-a'],
    });
    assert.deepEqual(codes(result), ['banned-character', 'banned-combination', 'repeated-character']);
});

test('ruleset normalization cleans input and keeps the stricter duplicate limit', () => {
    const ruleset = normalizeWarRuleset({
        bannedCharacterIds: [' Healer ', 'healer', '', 7],
        bannedCombinations: [['striker', 'healer'], ['HEALER', 'striker'], ['solo']],
        archetypeLimits: [{ tag: 'stun', max: 2 }, { tag: 'stun', max: 1 }, { tag: 'mystery', max: 1 }],
        noRepeatScope: 'forever',
    });
    assert.deepEqual(ruleset, {
        bannedCharacterIds: ['healer'],
        bannedCombinations: [['healer', 'striker']],
        archetypeLimits: [{ tag: 'stun', max: 1 }],
        noRepeatScope: 'none',
    });
});

test('strict normalization explains invalid rules', () => {
    assert.throws(() => normalizeWarRuleset({ bannedCombinations: [['solo']] }, { strict: true }), /2 or 3 different/);
    assert.throws(() => normalizeWarRuleset({ archetypeLimits: [{ tag: 'mystery', max: 1 }] }, { strict: true }), /Unknown character type/);
    assert.throws(() => normalizeWarRuleset({ archetypeLimits: [{ tag: 'stun', max: 3 }] }, { strict: true }), /between 0 and 2/);
    assert.throws(() => normalizeWarRuleset({ noRepeatScope: 'forever' }, { strict: true }), /none, set, or war/);
});
