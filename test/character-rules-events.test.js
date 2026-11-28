// Character Rules, step 2b proof: the remaining events. Each live mechanic below is rewritten as a
// rule and must play exactly like the live version (same seed, compared after every step). The
// rules copies live only in this file: the roster and the database are untouched.
const assert = require('node:assert/strict');
const test = require('node:test');
const live = require('../data/characters');
const { sameBattle: compareBattles, play, unitIn, statusOn } = require('./helpers/rulesHarness');

const clone = (value) => structuredClone(value);
const byId = (roster, id) => roster.find((character) => character.characterId === id);
const effectOf = (character, statusId) => character.skills.flatMap((skill) => skill.effects || [])
    .find((effect) => effect.statusId === statusId);
const fromPassive = (metadata) => ({ ...(metadata || {}), fromPassive: true, cannotBeCleansed: true });
const drop = (object, keys) => keys.forEach((key) => { delete object[key]; });

// ---------------------------------------------------------------- the rules copies
const copies = {};

// Rin's Medical Kit: when its holder uses a Physical or Chakra skill, heal them 10.
copies['nohara-rin'] = (() => {
    const rin = clone(byId(live, 'nohara-rin'));
    const kit = effectOf(rin, 'nohara_rin_medical_kit').metadata;
    const rule = { when: { event: 'ownerUsesSkill', classesAny: kit.onOwnerUseSkillClassesAny },
        do: kit.onOwnerUseSkillEffects.map((effect) => ({ ...effect, on: 'owner' })) };
    drop(kit, ['onOwnerUseSkillTrigger', 'persistOnOwnerUseSkillTrigger', 'onOwnerUseSkillClassesAny', 'onOwnerUseSkillEffects']);
    kit.rules = [rule];
    return rin;
})();

// Konohamaru's ambush trap: when an enemy uses a skill on him, deal them 10 damage.
copies['sarutobi-konohamaru'] = (() => {
    const konohamaru = clone(byId(live, 'sarutobi-konohamaru'));
    const trap = effectOf(konohamaru, 'konohamaru_ambush_trap').metadata;
    const amount = trap.onEnemySkillTargetedDamageToSourceAmount;
    drop(trap, ['onEnemySkillTargetedDamageToSourceAmount']);
    trap.rules = [{ when: { event: 'enemySkillOnOwner' }, do: [{ type: 'damage', amount, on: 'attacker' }] }];
    return konohamaru;
})();

// Baki's Flak Jacket: when an enemy uses a harmful Physical or Chakra skill on him, mark them.
copies.baki = (() => {
    const baki = clone(byId(live, 'baki'));
    const jacket = effectOf(baki, 'baki_flak_jacket').metadata;
    const mark = jacket.onEnemySkillTargetedApplyStatusToSource;
    const rule = { when: { event: 'enemySkillOnOwner', harmfulOnly: true, classesAny: jacket.onEnemySkillTargetedSkillClassesAny },
        do: [{ type: 'apply_status', on: 'attacker', statusId: mark.statusId, duration: mark.duration,
            metadata: clone(mark.metadata || {}), fresh: Boolean(mark.fresh) }] };
    drop(jacket, ['onEnemySkillTargetedHarmfulOnly', 'onEnemySkillTargetedSkillClassesAny', 'onEnemySkillTargetedApplyStatusToSource']);
    jacket.rules = [rule];
    return baki;
})();

// Mizuki's Windmill: when Execution Shuriken kills an enemy, one more use and invulnerability.
copies.mizuki = (() => {
    const mizuki = clone(byId(live, 'mizuki'));
    const passive = mizuki.passive;
    const extraUse = passive.onOwnerKillGrantSkillUse;
    const shield = passive.onOwnerKillApplyStatusToSelf;
    passive.rules = [{
        when: { event: 'ownerKills', skillIds: passive.onOwnerKillSourceSkillIdsAny, relation: passive.onOwnerKillTargetRelation },
        do: [
            { type: 'grant_skill_use', on: 'owner', skillId: extraUse.skillId, amount: extraUse.amount },
            { type: 'apply_status', on: 'owner', statusId: shield.statusId, duration: shield.duration,
                metadata: fromPassive(shield.metadata), fresh: Boolean(shield.fresh) },
        ],
    }];
    drop(passive, ['onOwnerKillSourceSkillIdsAny', 'onOwnerKillTargetRelation', 'onOwnerKillGrantSkillUse', 'onOwnerKillApplyStatusToSelf']);
    return mizuki;
})();

// Anko's Cursed Seal: when Anko dies, her team gains 1 random chakra.
copies['mitarashi-anko'] = (() => {
    const anko = clone(byId(live, 'mitarashi-anko'));
    const gain = anko.passive.onOwnerDeathGainTeamChakra;
    delete anko.passive.onOwnerDeathGainTeamChakra;
    anko.passive.rules = [{ when: { event: 'unitDies' },
        do: [{ type: 'gain_chakra', on: 'owner', chakraType: gain.chakraType, amount: gain.amount }] }];
    return anko;
})();

// Gaara's Sand Flow: +1 sand when he takes damage, +2 after a turn untouched, at most 8.
copies['gaara-of-the-desert'] = (() => {
    const gaara = clone(byId(live, 'gaara-of-the-desert'));
    const passive = gaara.passive;
    const key = passive.onDamageStackMetadataKey;
    const max = passive.stackCapsByKey[key];
    passive.counters = { [key]: 0 };
    passive.rules = [
        { when: { event: 'damaged' }, do: [{ type: 'add_counter', counter: key, amount: passive.onDamageStackAmount, max }] },
        { when: { event: 'undamagedTurn' }, do: [{ type: 'add_counter', counter: key, amount: passive.onUndamagedTurnStackAmount, max }] },
    ];
    drop(passive, ['onDamageStackMetadataKey', 'onDamageStackAmount', 'onUndamagedTurnStackMetadataKey',
        'onUndamagedTurnStackAmount', 'stackCapsByKey', key]);
    return gaara;
})();

// Ino's Art of the Valentine: when she stuns an enemy, her next Mind Transfer Feint deals 5 more.
copies['yamanaka-ino'] = (() => {
    const ino = clone(byId(live, 'yamanaka-ino'));
    const bonus = ino.passive.nextSkillDamageBonusOnStun;
    delete ino.passive.nextSkillDamageBonusOnStun;
    ino.passive.rules = [{ when: { event: 'ownerStuns' }, do: [{
        type: 'apply_status', on: 'owner', statusId: `${bonus.skillId}_stun_bonus`, duration: 99,
        metadata: { helpful: true, skillDamageBonuses: { [bonus.skillId]: Number(bonus.amount) },
            removeSelfOnSkillUseSkillIds: [bonus.skillId],
            tooltipText: `${bonus.skillId} deals ${bonus.amount} additional damage on its next use.` },
    }] }];
    return ino;
})();

// Dosu's Sound Trio: when an enemy pays an increased cost, his Physical skills deal 5 more for a turn.
copies['dosu-kinuta'] = (() => {
    const dosu = clone(byId(live, 'dosu-kinuta'));
    const boost = dosu.passive.onEnemyIncreasedCostSkillApplyStatusToSelf;
    delete dosu.passive.onEnemyIncreasedCostSkillApplyStatusToSelf;
    dosu.passive.rules = [{ when: { event: 'enemyPaysMore' }, do: [{
        type: 'apply_status', on: 'owner', statusId: boost.statusId, duration: boost.duration, metadata: fromPassive(boost.metadata),
    }] }];
    return dosu;
})();

const rulesRoster = live.map((character) => copies[character.characterId] || character);
const sameBattle = (allies, enemies, script) => compareBattles(live, rulesRoster, allies, enemies, script);
const FOES = ['gato', 'tenten', 'baki'];

// ---------------------------------------------------------------- equivalence with live mechanics
test('ownerUsesSkill: Rin\'s Medical Kit heals on Physical and Chakra skills, not Strategic ones', () => {
    const snapshots = sameBattle(['nohara-rin', 'tenten', 'gato'], FOES, (m) => {
        m.setHp('p1', 1, 60);
        m.cast('p1', 0, 'nohara-rin-medical-kit', ['p1', 1]);
        m.endTurn('p1');
        m.endTurn('p2');
        m.cast('p1', 1, 'tenten-twin-rising-dragons', ['p2', 0]);
        m.cast('p1', 1, 'tenten-spiked-boulder-wall');
        m.endTurn('p1');
    });
    assert.ok(unitIn(snapshots, 'p1:1').hp > 60, 'the kit healed');
});

test('enemySkillOnOwner: Konohamaru\'s ambush trap hits back', () => {
    const snapshots = sameBattle(['sarutobi-konohamaru', 'tenten', 'gato'], FOES, (m) => {
        m.cast('p1', 0, 'sarutobi-konohamaru-shuriken-and-trap-ambush', ['p2', 1]);
        m.endTurn('p1');
        m.cast('p2', 1, 'tenten-twin-rising-dragons', ['p1', 0]);
        m.endTurn('p2');
    });
    assert.ok(unitIn(snapshots, 'p2:1').hp < 80, 'the attacker took the trap damage');
});

test('enemySkillOnOwner: Baki\'s Flak Jacket marks harmful Physical attackers only while it holds', () => {
    sameBattle(['baki', 'tenten', 'gato'], FOES, (m) => {
        m.cast('p1', 0, 'baki-flak-jacket');
        m.endTurn('p1');
        m.cast('p2', 1, 'tenten-twin-rising-dragons', ['p1', 0]); // harmful Physical: marked
        m.cast('p2', 1, 'tenten-spiked-boulder-wall'); // not on Baki: nothing
        m.endTurn('p2');
        for (let i = 0; i < 4; i += 1) m.cast('p2', 1, 'tenten-twin-rising-dragons', ['p1', 0]); // breaks the defense
        m.endTurn('p2');
    });
});

test('ownerKills: Mizuki\'s Windmill grants another Execution Shuriken and invulnerability', () => {
    const snapshots = sameBattle(['mizuki', 'tenten', 'gato'], FOES, (m) => {
        m.setHp('p2', 0, 5);
        m.cast('p1', 0, 'mizuki-execution-shuriken', ['p2', 0]);
        m.endTurn('p1');
        m.endTurn('p2');
    });
    assert.ok(Object.keys(unitIn(snapshots, 'p1:0', 1).bonusSkillUses).length, 'an extra use was granted');
});

test('unitDies: Anko\'s team gains chakra when she falls', () => {
    const snapshots = sameBattle(['mitarashi-anko', 'tenten', 'gato'], FOES, (m) => {
        m.setHp('p1', 0, 5);
        m.cast('p2', 0, 'gato-hired-help', ['p1', 0]);
        m.endTurn('p2');
    });
    const total = (at) => Object.values(snapshots.at(at).chakra.p1).reduce((sum, value) => sum + value, 0);
    assert.equal(unitIn(snapshots, 'p1:0').alive, false);
    assert.equal(total(1) - total(0), 1, 'one chakra for Anko');
});

test('damaged and undamagedTurn: Gaara\'s sand grows from hits and from quiet turns, up to 8', () => {
    const snapshots = sameBattle(['gaara-of-the-desert', 'tenten', 'gato'], FOES, (m) => {
        m.cast('p2', 1, 'tenten-twin-rising-dragons', ['p1', 0]);
        m.endTurn('p2');
        m.endTurn('p1');
        for (let round = 0; round < 5; round += 1) { m.endTurn('p2'); m.endTurn('p1'); }
    });
    assert.ok(snapshots.some((step) => unitIn(snapshots, 'p1:0', snapshots.indexOf(step)).statuses
        .some((line) => line.includes('sandFlowStacks=8'))), 'the sand reaches its cap');
});

test('ownerStuns: Ino\'s stun sets up her next Mind Transfer Feint', () => {
    const snapshots = sameBattle(['yamanaka-ino', 'tenten', 'gato'], FOES, (m) => {
        m.cast('p1', 0, 'yamanaka-ino-mind-body-switch', ['p2', 1]);
        m.endTurn('p1');
        m.endTurn('p2');
        m.cast('p1', 0, 'yamanaka-ino-mind-transfer-feint', ['p2', 2]);
        m.endTurn('p1');
    });
    assert.ok(statusOn(snapshots, 'p1:0', 'yamanaka-ino-mind-transfer-feint_stun_bonus', 2), 'the bonus was set up');
});

test('enemyPaysMore: Dosu\'s Sound Trio answers an enemy paying more', () => {
    const snapshots = sameBattle(['dosu-kinuta', 'tenten', 'gato'], FOES, (m) => {
        m.give('p2', 1, 'test_cost_up', { harmful: true, randomCostIncrease: 1 });
        m.cast('p2', 1, 'tenten-twin-rising-dragons-trap');
        m.endTurn('p2');
    });
    assert.ok(statusOn(snapshots, 'p1:0', 'sound_trio_physical_bonus', 2), 'the bonus landed');
});

// ---------------------------------------------------------------- events with no live user yet
const withRules = (characterId, statusId, rules) => {
    const character = clone(byId(live, characterId));
    const effect = effectOf(character, statusId);
    effect.metadata = { ...effect.metadata, rules };
    return live.map((entry) => (entry.characterId === characterId ? character : entry));
};

test('statusApplied: a rule fires once when a skill places its status', () => {
    const roster = withRules('baki', 'baki_flak_jacket',
        [{ when: { event: 'statusApplied' }, do: [{ type: 'add_counter', counter: 'charges', amount: 1 }] }]);
    const snapshots = play(roster, ['baki', 'gato', 'tenten'], FOES, (m) => {
        m.cast('p1', 0, 'baki-flak-jacket');
        m.endTurn('p1');
    });
    assert.ok(statusOn(snapshots, 'p1:0', 'baki_flak_jacket', 1).includes('charges=1'));
    assert.ok(statusOn(snapshots, 'p1:0', 'baki_flak_jacket').includes('charges=1'), 'once, not every turn');
});

test('unitDies: "an ally dies" and "an enemy dies" reach the right holders', () => {
    const roster = withRules('baki', 'baki_flak_jacket', [
        { when: { event: 'unitDies', who: 'ally' }, do: [{ type: 'add_counter', counter: 'charges', amount: 1 }] },
        { when: { event: 'unitDies', who: 'enemy' }, do: [{ type: 'add_counter', counter: 'charges', amount: 10 }] },
    ]);
    const snapshots = play(roster, ['baki', 'gato', 'tenten'], FOES, (m) => {
        m.cast('p1', 0, 'baki-flak-jacket');
        m.setHp('p1', 1, 5);
        m.cast('p2', 0, 'gato-hired-help', ['p1', 1]); // an ally falls: +1
        m.setHp('p2', 2, 5);
        m.cast('p1', 2, 'tenten-twin-rising-dragons', ['p2', 2]); // an enemy falls: +10
    });
    assert.ok(statusOn(snapshots, 'p1:0', 'baki_flak_jacket').includes('charges=11'));
});
