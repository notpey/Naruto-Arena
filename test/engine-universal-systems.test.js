const test = require('node:test');
const assert = require('node:assert/strict');
const battleLogic = require('../battleLogic.js');

const buildTestMatch = () => ({
    matchId: 'engine_test_match_1',
    status: 'active',
    players: [{ username: 'p1' }, { username: 'p2' }],
    currentTurn: 'p1',
    turnOrder: ['p1', 'p2'],
    board: {
        p1: [
            {
                slot: 0,
                rosterIndex: 0,
                hp: 100,
                alive: true,
                state: { statuses: [], cooldowns: {}, skillUses: {} },
            },
            {
                slot: 1,
                rosterIndex: 1,
                hp: 100,
                alive: true,
                state: { statuses: [], cooldowns: {}, skillUses: {} },
            },
            {
                slot: 2,
                rosterIndex: 2,
                hp: 100,
                alive: true,
                state: { statuses: [], cooldowns: {}, skillUses: {} },
            },
        ],
        p2: [
            {
                slot: 0,
                rosterIndex: 0,
                hp: 100,
                alive: true,
                state: { statuses: [], cooldowns: {}, skillUses: {} },
            },
            {
                slot: 1,
                rosterIndex: 1,
                hp: 100,
                alive: true,
                state: { statuses: [], cooldowns: {}, skillUses: {} },
            },
            {
                slot: 2,
                rosterIndex: 2,
                hp: 100,
                alive: true,
                state: { statuses: [], cooldowns: {}, skillUses: {} },
            },
        ],
    },
    chakraPools: {
        p1: { taijutsu: 5, ninjutsu: 5, bloodline: 5, genjutsu: 5 },
        p2: { taijutsu: 5, ninjutsu: 5, bloodline: 5, genjutsu: 5 },
    },
    economy: {
        turnCounts: { p1: 1, p2: 1 },
    },
    combatEvents: [],
});

test('Universal Engine: Affliction damage naturally penetrates standard invulnerability', () => {
    const match = buildTestMatch();
    const defender = match.board.p2[0];

    // Defender has standard 1-turn invulnerability
    defender.state.statuses.push({
        id: 'standard_invuln',
        remainingTurns: 1,
        metadata: {
            invulnerable: true,
            helpful: true,
        },
    });

    // Standard skill check: Unit is invulnerable to Physical and Ninjutsu
    assert.equal(battleLogic.isUnitInvulnerableForSkill(defender, ['Physical']), true);
    assert.equal(battleLogic.isUnitInvulnerableForSkill(defender, ['Ninjutsu']), true);

    // Affliction skill check: Unit is NOT invulnerable to Affliction
    assert.equal(battleLogic.isUnitInvulnerableForSkill(defender, ['Affliction']), false);
    assert.equal(battleLogic.isUnitInvulnerableForSkill(defender, ['Affliction', 'Instant']), false);
});

test('Universal Engine: cannotBecomeInvulnerable disables all forms of invulnerability', () => {
    const match = buildTestMatch();
    const defender = match.board.p2[0];

    defender.state.statuses.push(
        {
            id: 'cannot_invuln_debuff',
            remainingTurns: 99,
            metadata: {
                harmful: true,
                cannotBecomeInvulnerable: true,
            },
        },
        {
            id: 'all_invuln_buff',
            remainingTurns: 1,
            metadata: {
                helpful: true,
                invulnerableToAllSkills: true,
            },
        }
    );

    assert.equal(battleLogic.isUnitInvulnerableForSkill(defender, ['Physical']), false);
    assert.equal(battleLogic.isUnitInvulnerableForSkill(defender, ['Ninjutsu']), false);
    assert.equal(battleLogic.isUnitInvulnerableForSkill(defender, ['Affliction']), false);
});

test('Universal Engine: Affliction damage bypasses Destructible Defense and Damage Reduction by default', () => {
    const match = buildTestMatch();
    const defender = match.board.p2[0];

    defender.state.statuses.push(
        {
            id: 'shield_barrier',
            remainingTurns: 2,
            metadata: {
                destructibleDefensePoints: 30,
            },
        },
        {
            id: 'damage_reduction_buff',
            remainingTurns: 2,
            metadata: {
                damageReductionFlat: 15,
                damageReductionPercent: 50,
                unpierceableDamageReductionPercent: 20,
            },
        }
    );

    // Normal physical damage: absorbed by shield and reduced
    battleLogic.applyDamageToUnit(defender, 20, {
        match,
        sourceUsername: 'p1',
        targetUsername: 'p2',
        skillClasses: ['Physical'],
    });

    // 20 damage absorbed by 30 pt shield -> Shield remaining = 10, HP still 100
    assert.equal(defender.hp, 100);
    assert.equal(defender.state.statuses[0].metadata.destructibleDefensePoints, 10);

    // Affliction damage: 40 affliction damage penetrates remaining 10 shield and all DR layers directly to HP
    battleLogic.applyDamageToUnit(defender, 40, {
        match,
        sourceUsername: 'p1',
        targetUsername: 'p2',
        afflictionDamage: true,
        skillClasses: ['Affliction'],
    });

    // HP lost 40 -> 60, shield remains untouched at 10
    assert.equal(defender.hp, 60);
    assert.equal(defender.state.statuses[0].metadata.destructibleDefensePoints, 10);
});

test('Universal Engine: cannotReduceDamage disables all % and flat damage reductions', () => {
    const match = buildTestMatch();
    const defender = match.board.p2[0];

    defender.state.statuses.push(
        {
            id: 'cannot_reduce_debuff',
            remainingTurns: 99,
            metadata: {
                harmful: true,
                cannotReduceDamage: true,
            },
        },
        {
            id: 'armor_buff',
            remainingTurns: 2,
            metadata: {
                damageReductionFlat: 20,
                damageReductionPercent: 50,
                unpierceableDamageReductionPercent: 25,
            },
        }
    );

    battleLogic.applyDamageToUnit(defender, 40, {
        match,
        sourceUsername: 'p1',
        targetUsername: 'p2',
        skillClasses: ['Physical'],
    });

    // With cannotReduceDamage active, full 40 damage is dealt without mitigation
    assert.equal(defender.hp, 60);
});

test('Universal Engine: Source caster death immediately purges tethered and ongoing statuses on enemies and allies', () => {
    const match = buildTestMatch();
    const hiruzen = match.board.p1[0];
    const enemyTarget = match.board.p2[0];
    const allyTarget = match.board.p1[1];

    // Hiruzen casts Dead Demon Consuming Seal on enemyTarget and self
    enemyTarget.state.statuses.push({
        id: 'sarutobi_hiruzen_dead_demon_seal_enemy',
        remainingTurns: 99,
        sourceUsername: 'p1',
        sourceSlot: 0,
        metadata: {
            harmful: true,
            ongoingClass: 'action',
            afflictionDamage: true,
            cannotUseSkills: true,
            cannotReduceDamage: true,
            cannotBecomeInvulnerable: true,
            cannotBeCleansed: true,
            endsOnSourceDeath: true,
            turnEndDamage: 40,
            turnEndTrigger: 'source_turn',
        },
    });

    hiruzen.state.statuses.push({
        id: 'sarutobi_hiruzen_dead_demon_seal_self',
        remainingTurns: 99,
        sourceUsername: 'p1',
        sourceSlot: 0,
        metadata: {
            harmful: true,
            ongoingClass: 'action',
            cannotUseSkills: true,
            cannotBeCleansed: true,
        },
    });

    // Hiruzen also has an ongoing ally buff (Enma defense)
    allyTarget.state.statuses.push({
        id: 'enma_ally_buff',
        remainingTurns: 99,
        sourceUsername: 'p1',
        sourceSlot: 0,
        metadata: {
            helpful: true,
            ongoingClass: 'action',
            removeOnSourceDeath: true,
            damageReductionFlat: 5,
        },
    });

    assert.equal(enemyTarget.state.statuses.length, 1);
    assert.equal(allyTarget.state.statuses.length, 1);

    // Hiruzen dies from 100 damage
    battleLogic.applyDamageToUnit(hiruzen, 100, {
        match,
        sourceUsername: 'p2',
        targetUsername: 'p1',
        targetSlot: 0,
    });

    assert.equal(hiruzen.alive, false);
    assert.equal(hiruzen.hp, 0);

    // All tethered ongoing statuses from Hiruzen must be cleanly purged
    assert.equal(enemyTarget.state.statuses.length, 0, 'Enemy Dead Demon Seal should be removed upon Hiruzen death');
    assert.equal(allyTarget.state.statuses.length, 0, 'Ally Enma buff should be removed upon Hiruzen death');
});

test('Universal Engine: Dead Demon Consuming Seal ticks turn-end damage and ignores source self-stun', () => {
    const match = buildTestMatch();
    const hiruzen = match.board.p1[0];
    const enemyTarget = match.board.p2[0];

    // Hiruzen is alive and self-stunned from channeling Dead Demon Consuming Seal
    hiruzen.state.statuses.push({
        id: 'sarutobi_hiruzen_dead_demon_seal_self',
        remainingTurns: 99,
        sourceUsername: 'p1',
        sourceSlot: 0,
        metadata: {
            harmful: true,
            ongoingClass: 'action',
            ignoreOngoingSourceStun: true,
            cannotUseSkills: true,
            cannotBeCleansed: true,
            turnEndDamage: 20,
            turnEndTrigger: 'source_turn',
        },
    });

    enemyTarget.state.statuses.push({
        id: 'sarutobi_hiruzen_dead_demon_seal_enemy',
        remainingTurns: 99,
        sourceUsername: 'p1',
        sourceSlot: 0,
        metadata: {
            harmful: true,
            ongoingClass: 'action',
            ignoreOngoingSourceStun: true,
            afflictionDamage: true,
            cannotUseSkills: true,
            cannotReduceDamage: true,
            cannotBecomeInvulnerable: true,
            cannotBeCleansed: true,
            turnEndDamage: 40,
            turnEndTrigger: 'source_turn',
        },
    });

    // Ending p1 (Hiruzen's) turn
    battleLogic.tickStatusesForTurnEnd({
        match,
        endingUsername: 'p1',
    });

    // Enemy takes 40 affliction damage (100 - 40 = 60)
    assert.equal(enemyTarget.hp, 60);
    // Hiruzen takes 20 affliction damage (100 - 20 = 80)
    assert.equal(hiruzen.hp, 80);

    // Both statuses remain active for next round
    assert.equal(enemyTarget.state.statuses.length, 1);
    assert.equal(hiruzen.state.statuses.length, 1);
});

test('Universal Engine: cannotBeCleansed statuses are preserved when cleansing harmful statuses', () => {
    const match = buildTestMatch();
    const unit = match.board.p1[0];

    unit.state.statuses.push(
        {
            id: 'regular_poison',
            remainingTurns: 2,
            metadata: {
                harmful: true,
                turnEndDamage: 10,
            },
        },
        {
            id: 'dead_demon_seal',
            remainingTurns: 99,
            metadata: {
                harmful: true,
                cannotBeCleansed: true,
                turnEndDamage: 40,
            },
        }
    );

    assert.equal(unit.state.statuses.length, 2);

    const cleansedCount = battleLogic.cleanseHarmfulStatuses(unit, 99);

    assert.equal(cleansedCount, 1);
    assert.equal(unit.state.statuses.length, 1);
    assert.equal(unit.state.statuses[0].id, 'dead_demon_seal');
});
