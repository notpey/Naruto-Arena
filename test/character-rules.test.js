// Character Rules, step 2 proof: three live characters rewritten as rules must play exactly like
// the live versions. Each scenario runs twice, once with the live roster and once with the rules
// copies swapped in, from the same random seed, and compares every unit after every step.
// The rules copies live only in this file: the roster and the database are untouched.
const assert = require('node:assert/strict');
const test = require('node:test');
const live = require('../data/characters');
const { MAX_RULE_CHAIN, createRuleRunner } = require('../characterRules');

const clone = (value) => structuredClone(value);
const byId = (roster, id) => roster.find((character) => character.characterId === id);
const skillOf = (character, skillId) => character.skills.find((skill) => skill.id === skillId);

// ---------------------------------------------------------------- the rules copies
const hayateRules = (() => {
    const hayate = clone(byId(live, 'gekko-hayate'));
    const fairFight = hayate.passive.startApplyStatusToOppositeEnemy;
    delete hayate.passive.startApplyStatusToOppositeEnemy;
    // Fair Fight: when the match starts, mark the enemy opposite Hayate.
    hayate.passive.rules = [{
        when: { event: 'matchStart' },
        do: [{ type: 'apply_status', on: 'oppositeEnemy', statusId: fairFight.statusId, duration: fairFight.duration,
            metadata: { ...fairFight.metadata, fromPassive: true, cannotBeCleansed: true } }],
    }];
    const charges = { type: 'add_counter', statusId: 'gekko_hayate_crescent_moon', counter: 'charges', amount: 1, max: 99,
        create: { duration: 99, metadata: { helpful: true, permanent: true } } };
    // Crescent Moon Slash: 20 damage, then one more charge.
    const slash = skillOf(hayate, 'gekko-hayate-crescent-moon-slash');
    slash.effects = [slash.effects.find((effect) => effect.type === 'damage'), charges];
    // Eavesdrop: the counter is a piece; one more charge when it counters is a rule.
    const eavesdrop = skillOf(hayate, 'gekko-hayate-eavesdrop').effects[0];
    delete eavesdrop.metadata.counterApplyStatusToSourceOwner;
    eavesdrop.metadata.rules = [{ when: { event: 'countered' }, do: [{ ...charges, on: 'owner' }] }];
    return hayate;
})();

const AWAKENED = 'hyuuga_hinata_shy_byakugan_awakened';
const hinataRules = (() => {
    const hinata = clone(byId(live, 'hyuuga-hinata'));
    const awakening = hinata.passive.awakening;
    delete hinata.passive.awakening;
    const awaken = [
        { type: 'apply_status', on: 'owner', statusId: awakening.statusId, duration: 99, metadata: clone(awakening.metadata) },
        { type: 'clear_cooldown', on: 'owner', skillIds: awakening.clearCooldownSkillIds },
    ];
    hinata.passive.counters = { turns: 0 };
    hinata.passive.rules = [
        { when: { event: 'turnEnds', whose: 'owner' }, do: [{ type: 'add_counter', counter: 'turns', amount: 1 }] },
        { when: { event: 'turnEnds', whose: 'owner' },
            if: [{ counter: 'turns', atLeast: awakening.afterOwnerTurns }, { lacks: AWAKENED }], do: awaken },
        { when: { event: 'healthBelow', who: 'ally', below: awakening.allyHpBelow }, if: [{ lacks: AWAKENED }], do: awaken },
    ];
    return hinata;
})();

const orochimaruRules = (() => {
    const orochimaru = clone(byId(live, 'shiore-orochimaru'));
    const devourSkill = skillOf(orochimaru, 'shiore-orochimaru-devour');
    const [mark, guard] = devourSkill.effects;
    const payoff = mark.metadata.onExpireEffects;
    const grow = mark.metadata.growPerTurn[0];
    const metadata = { ...mark.metadata };
    ['growPerTurn', 'expireEffectsOnEarlyEnd', 'endSourceStatusIdsOnExpire', 'onExpireEffects', 'turnEndTrigger']
        .forEach((key) => { delete metadata[key]; });
    metadata[grow.key] = 0;
    metadata.rules = [
        // Each of Orochimaru's turns adds to the payoff.
        { when: { event: 'turnEnds', whose: 'caster' }, do: [{ type: 'add_counter', counter: grow.key, amount: grow.amount }] },
        // When it runs out, or a stun or invulnerability breaks it: the payoff.
        { when: { event: 'statusEnds', reasons: ['expired', 'interrupted'] }, do: payoff.map((effect) => ({ ...effect, on: 'owner' })) },
        // However it ends, Orochimaru's damage reduction ends with it.
        { when: { event: 'statusEnds' }, do: [{ type: 'remove_status', on: 'caster', statusId: guard.statusId }] },
    ];
    devourSkill.effects = [{ ...mark, metadata }, guard];
    return orochimaru;
})();

const rulesRoster = live.map((character) => ({
    'gekko-hayate': hayateRules, 'hyuuga-hinata': hinataRules, 'shiore-orochimaru': orochimaruRules,
})[character.characterId] || character);

// ---------------------------------------------------------------- a scripted match
const harness = require('./helpers/rulesHarness');
const sameBattle = (allies, enemies, script) => harness.sameBattle(live, rulesRoster, allies, enemies, script);
const { statusOn } = harness;

// ---------------------------------------------------------------- Gekko Hayate
test('Hayate as rules: Fair Fight, charges from both skills, the counter and Dance match the live kit', () => {
    const snapshots = sameBattle(['gekko-hayate', 'haruno-sakura', 'tenten'], ['tenten', 'gato', 'baki'], (m) => {
        m.cast('p1', 0, 'gekko-hayate-crescent-moon-slash', ['p2', 0]);
        m.endTurn('p1');
        m.endTurn('p2');
        m.cast('p1', 0, 'gekko-hayate-eavesdrop');
        m.endTurn('p1');
        m.cast('p2', 0, 'tenten-twin-rising-dragons', ['p1', 0]); // a Physical skill: countered
        m.endTurn('p2');
        m.cast('p1', 0, 'gekko-hayate-crescent-moon-slash', ['p2', 1]);
        m.endTurn('p1');
        m.endTurn('p2');
        m.cast('p1', 0, 'gekko-hayate-dance-of-the-crescent-moon', ['p2', 1]);
        m.endTurn('p1');
    });
    assert.ok(statusOn(snapshots, 'p2:0', 'gekko_hayate_fair_fight_mark'), 'the enemy opposite is marked');
    assert.ok(statusOn(snapshots, 'p1:0', 'gekko_hayate_crescent_moon 99 charges=3'), 'two slashes and one counter');
});

test('Hayate as rules: Dance with no charges matches too', () => {
    sameBattle(['gekko-hayate', 'haruno-sakura', 'tenten'], ['tenten', 'gato', 'baki'], (m) => {
        m.cast('p1', 0, 'gekko-hayate-dance-of-the-crescent-moon', ['p2', 2]);
        m.endTurn('p1');
    });
});

// ---------------------------------------------------------------- Hyuuga Hinata
test('Hinata as rules: Shy Byakugan awakens after four of her turns and resets Gentle Fist', () => {
    const snapshots = sameBattle(['hyuuga-hinata', 'tenten', 'baki'], ['gato', 'tenten', 'baki'], (m) => {
        for (let turn = 1; turn <= 4; turn += 1) {
            if (turn === 4) m.cast('p1', 0, 'hyuuga-hinata-hinata-gentle-fist', ['p2', 0]); // on cooldown...
            m.endTurn('p1'); // ...until the awakening clears it
            m.endTurn('p2');
        }
    });
    assert.ok(statusOn(snapshots, 'p1:0', AWAKENED), 'awake after turn 4');
});

test('Hinata as rules: an ally under 50 health awakens her early', () => {
    const snapshots = sameBattle(['hyuuga-hinata', 'tenten', 'baki'], ['gato', 'tenten', 'baki'], (m) => {
        m.endTurn('p1');
        m.setHp('p1', 1, 60);
        m.cast('p2', 0, 'gato-hired-help', ['p1', 1]);
        m.endTurn('p2');
    });
    assert.ok(statusOn(snapshots, 'p1:0', AWAKENED), 'awake on turn 1');
});

// ---------------------------------------------------------------- Shiore Orochimaru's Devour
const DEVOUR_TEAMS = [['shiore-orochimaru', 'gekko-hayate', 'tenten'], ['baki', 'gato', 'tenten']];

test('Devour as rules: runs out after three turns and pays off the same', () => {
    const snapshots = sameBattle(...DEVOUR_TEAMS, (m) => {
        m.cast('p1', 0, 'shiore-orochimaru-devour', ['p2', 0]);
        for (let round = 0; round < 4; round += 1) { m.endTurn('p1'); m.endTurn('p2'); }
    });
    assert.ok(statusOn(snapshots, 'p2:0', 'shiore_orochimaru_devour_stun') || snapshots.some((s) =>
        s.units.find((u) => u.unit === 'p2:0').statuses.some((line) => line.startsWith('shiore_orochimaru_devour_stun'))),
    'the payoff stun landed');
});

test('Devour as rules: a stun on Orochimaru breaks it early, with the payoff', () => {
    sameBattle(...DEVOUR_TEAMS, (m) => {
        m.cast('p1', 0, 'shiore-orochimaru-devour', ['p2', 0]);
        m.endTurn('p1');
        m.endTurn('p2');
        m.endTurn('p1');
        m.give('p1', 0, 'test_stun', { harmful: true, cannotUseSkills: true });
        m.endTurn('p2');
        m.endTurn('p1');
    });
});

test('Devour as rules: the target turning invulnerable breaks it early, with the payoff', () => {
    sameBattle(...DEVOUR_TEAMS, (m) => {
        m.cast('p1', 0, 'shiore-orochimaru-devour', ['p2', 0]);
        m.endTurn('p1');
        m.give('p2', 0, 'test_invulnerable', { helpful: true, invulnerable: true });
        m.endTurn('p2');
        m.endTurn('p1');
    });
});

test('Devour as rules: Orochimaru dying ends it without the payoff', () => {
    sameBattle(...DEVOUR_TEAMS, (m) => {
        m.cast('p1', 0, 'shiore-orochimaru-devour', ['p2', 0]);
        m.endTurn('p1');
        m.setHp('p1', 0, 5);
        m.cast('p2', 1, 'gato-hired-help', ['p1', 0]);
        m.endTurn('p2');
        m.endTurn('p1');
    });
});

test('Devour as rules: the target dying ends Orochimaru\'s damage reduction', () => {
    const snapshots = sameBattle(...DEVOUR_TEAMS, (m) => {
        m.cast('p1', 0, 'shiore-orochimaru-devour', ['p2', 0]);
        m.endTurn('p1');
        m.endTurn('p2');
        m.setHp('p2', 0, 5);
        m.cast('p1', 1, 'gekko-hayate-crescent-moon-slash', ['p2', 0]);
        m.endTurn('p1');
    });
    assert.equal(statusOn(snapshots, 'p1:0', 'shiore_orochimaru_devour_guard'), null);
});

// ---------------------------------------------------------------- safety
test('a rule that triggers itself stops after the chain limit instead of stalling the match', () => {
    let calls = 0;
    const runner = createRuleRunner({
        applyTriggeredEffectsFromStatus: () => {
            calls += 1;
            runner.fireStatus({ match, event: 'countered', username: 'a', slot: 0, status });
        },
        applyStatus: () => {}, ensureUnitStateShape: (unit) => unit.state, refreshDerivedStatusTooltips: () => {},
    });
    const status = { id: 'loop', remainingTurns: 1, metadata: { rules: [{ when: { event: 'countered' }, do: [{ type: 'heal', amount: 1 }] }] } };
    const match = { board: { a: [{ hp: 50, state: { statuses: [status], cooldowns: {} } }] } };
    runner.fireStatus({ match, event: 'countered', username: 'a', slot: 0, status });
    assert.equal(calls, MAX_RULE_CHAIN);
    assert.equal(match.ruleChainDepth, 0, 'the chain unwinds');
});

test('no live character carries rules yet: everyone plays on their existing settings', () => {
    const withRules = live.filter((character) => JSON.stringify(character).includes('"rules"'));
    assert.deepEqual(withRules.map((character) => character.characterId), []);
});
