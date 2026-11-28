// Character Editor, step 3: the rules vocabulary (readback sentences and checks), the Checks tab's
// understanding of rules, and the test bench service.
const assert = require('node:assert/strict');
const test = require('node:test');
const live = require('../data/characters');
const V = require('../character-rules-vocab');
const { checkCharacter } = require('../character-builder-checks');
const { getBuilderCatalog } = require('../data/builder');
const { runTestBench } = require('../services/testBench');

const clone = (value) => structuredClone(value);
const byId = (id) => live.find((character) => character.characterId === id);
const names = { statusName: (id) => ({ hyuuga_hinata_shy_byakugan_awakened: 'Shy Byakugan awakened' })[id] || id,
    skillName: (id) => ({ 'hyuuga-hinata-hinata-gentle-fist': 'Gentle Fist' })[id] || id };

// Hinata with her awakening written as rules (as in the step 2 proof).
const hinataRules = () => {
    const hinata = clone(byId('hyuuga-hinata'));
    const awakening = hinata.passive.awakening;
    delete hinata.passive.awakening;
    const awaken = [
        { type: 'apply_status', on: 'owner', statusId: awakening.statusId, duration: 99, metadata: clone(awakening.metadata) },
        { type: 'clear_cooldown', on: 'owner', skillIds: awakening.clearCooldownSkillIds },
    ];
    hinata.passive.counters = { turns: 0 };
    hinata.passive.rules = [
        { when: { event: 'turnEnds', whose: 'owner' }, do: [{ type: 'add_counter', counter: 'turns', amount: 1 }] },
        { when: { event: 'turnEnds', whose: 'owner' }, if: [{ counter: 'turns', atLeast: 4 }, { lacks: awakening.statusId }], do: awaken },
    ];
    return hinata;
};

test('rules read back as plain sentences', () => {
    const [count, awaken] = hinataRules().passive.rules;
    assert.equal(V.describeRule(count, names), "When the holder's team ends a turn: add 1 to turns.");
    assert.equal(V.describeRule(awaken, names),
        "When the holder's team ends a turn, if turns is at least 4 and the holder does not have Shy Byakugan awakened: apply Shy Byakugan awakened to the holder permanently and reset the cooldown of Gentle Fist.");
    assert.equal(V.describeRule({ when: { event: 'enemySkillOnOwner', harmfulOnly: true, classesAny: ['Physical'] },
        do: [{ type: 'damage', amount: 15, on: 'attacker', metadata: { ignoreDamageReduction: true } }] }, names),
    'When an enemy uses a harmful Physical skill on the holder: deal 15 piercing damage to the attacker.');
    assert.equal(V.describeRule({ when: { event: 'statusEnds', reasons: ['expired', 'interrupted'] },
        do: [{ type: 'damage', amount: 20, metadata: { afflictionDamage: true, bonusFromStatusMetadataKey: 'devourBonus' } }] }, names),
    'When this status runs out or is broken by a stun or invulnerability: deal 20 affliction damage, plus devour bonus to the holder.');
});

test('rule checks explain what would not work', () => {
    const problems = V.checkRules([
        { when: { event: 'turnEnds' }, do: [{ type: 'damage', amount: 10, on: 'attacker' }] },
        { do: [{ type: 'heal', amount: 5 }] },
        { when: { event: 'damaged' }, do: [{ type: 'add_counter' }, { type: 'teleport' }] },
        { when: { event: 'statusEnds' }, do: [] },
    ], { ...names, isPassive: true });
    const text = problems.map((problem) => problem.message).join('\n');
    assert.match(text, /there is no attacker when a turn ends/);
    assert.match(text, /Rule 2 has no "when"/);
    assert.match(text, /doesn't name a counter/);
    assert.match(text, /isn't an action the engine knows/);
    assert.match(text, /a passive is never placed, ended or used to counter/);
    assert.match(text, /does nothing yet/);
    assert.deepEqual(V.checkRules(hinataRules().passive.rules, names), []);
});

test('the Checks tab accepts rules and their counters, and still flags real problems', () => {
    const catalog = getBuilderCatalog(live);
    const hinata = hinataRules();
    const issues = checkCharacter(hinata, { catalog, roster: live });
    assert.deepEqual(issues.filter((issue) => /rule|counter|turns|isn't something a passive reads/i.test(`${issue.where} ${issue.message}`)), []);

    hinata.passive.rules.push({ when: { event: 'countered' }, do: [{ type: 'apply_status', on: 'owner' }] });
    const broken = checkCharacter(hinata, { catalog, roster: live }).filter((issue) => /Rules/.test(issue.where));
    assert.ok(broken.some((issue) => issue.level === 'error' && /doesn't name a status/.test(issue.message)));
    assert.ok(broken.some((issue) => /a passive is never placed/.test(issue.message)));
});

test('the test bench plays the edited character, rules included, with the real engine', () => {
    const hinata = hinataRules();
    const steps = [];
    for (let turn = 0; turn < 4; turn += 1) steps.push({ do: 'endTurn' }, { do: 'endTurn' });
    const result = runTestBench({ roster: live, character: hinata, allies: ['hyuuga-hinata', 'tenten', 'baki'],
        enemies: ['gato', 'tenten', 'baki'], steps });
    assert.equal(result.ok, true, result.error);
    const hinataAt = (frame) => frame.units.find((unit) => unit.side === 'p1' && unit.slot === 0);
    assert.ok(hinataAt(result.frames.at(-1)).statuses.some((status) => status.name === 'Shy Byakugan Awakened'), 'awake after 4 turns');
    assert.ok(!hinataAt(result.frames.at(-3)).statuses.some((status) => status.name === 'Shy Byakugan Awakened'), 'not before');
    assert.equal(hinataAt(result.frames.at(-1)).statuses.find((status) => status.name === 'Shy Byakugan').counters.turns, 4);
    assert.ok(result.teams.p1[0].skills.length >= 4, 'skills to click');
});

test('the test bench explains a step it cannot play, and keeps going', () => {
    const result = runTestBench({ roster: live, character: byId('gekko-hayate'), allies: ['gekko-hayate', 'tenten', 'baki'],
        enemies: ['gato', 'tenten', 'baki'], steps: [
            { do: 'cast', side: 'p1', slot: 0, skillId: 'gekko-hayate-crescent-moon-slash', target: { side: 'p1', slot: 1 } },
            { do: 'cast', side: 'p2', slot: 0, skillId: 'gato-hired-help', target: { side: 'p1', slot: 0 } },
            { do: 'cast', side: 'p1', slot: 0, skillId: 'gekko-hayate-dance-of-the-crescent-moon', target: { side: 'p2', slot: 0 } },
            { do: 'cast', side: 'p1', slot: 0, skillId: 'gekko-hayate-dance-of-the-crescent-moon', target: { side: 'p2', slot: 0 } },
            { do: 'setHealth', side: 'p2', slot: 1, hp: 30 },
        ] });
    assert.equal(result.ok, true, result.error);
    const notes = result.frames.map((frame) => frame.note);
    assert.match(notes[1], /can't target Tenten/);
    assert.match(notes[2], /your team's turn/);
    assert.equal(notes[3], '');
    assert.match(notes[4], /on cooldown/);
    assert.equal(result.frames.at(-1).units.find((unit) => unit.side === 'p2' && unit.slot === 1).hp, 30);
});

test('the test bench refuses what it cannot set up', () => {
    assert.equal(runTestBench({ roster: live, character: null }).ok, false);
    assert.match(runTestBench({ roster: live, character: byId('tenten'), allies: ['tenten'], enemies: ['gato', 'baki', 'tenten'] }).error, /three characters/);
    assert.match(runTestBench({ roster: live, character: byId('tenten'), allies: ['tenten', 'nobody', 'baki'], enemies: ['gato', 'baki', 'tenten'] }).error, /Unknown character/);
});
