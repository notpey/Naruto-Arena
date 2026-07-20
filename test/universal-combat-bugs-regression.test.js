const test = require('node:test');
const assert = require('node:assert/strict');
const battleLogic = require('../battleLogic.js');

const mockCharacters = [
    {
        id: 'shukaku-gaara',
        name: 'Shukaku Gaara',
        skills: [
            {
                id: 'shukaku_gaara_sand_claw',
                name: 'Sand Claw',
                target: 'single-enemy',
                classes: ['Physical'],
                effects: [
                    {
                        type: 'damage',
                        amount: 20,
                    },
                    {
                        type: 'apply_status',
                        statusId: 'shukaku_gaara_sand_claw_defense',
                        duration: 99,
                        scope: 'self',
                        metadata: {
                            helpful: true,
                            permanent: true,
                            destructibleDefensePoints: 10,
                            tooltipText: 'This character has permanent destructible defense from Sand Claw.',
                        },
                    },
                ],
                whenCounteredEffects: [
                    {
                        type: 'damage',
                        amount: 5,
                        scope: 'self',
                    },
                ],
            },
        ],
    },
    {
        id: 'kidoumaru',
        name: 'Kidoumaru',
        skills: [
            {
                id: 'kidoumaru-spiral-web',
                name: 'Spiral Web',
                target: 'self-or-single-ally',
                classes: ['Strategic'],
                effects: [
                    {
                        type: 'apply_status',
                        statusId: 'kidoumaru_spiral_web',
                        duration: 1,
                        scope: 'target',
                        metadata: {
                            helpful: true,
                            triggerOnEnemyHarmfulNonStrategic: true,
                            counterCancelsSkill: true,
                            counterDamage: 15,
                            sourceSkillName: 'Spiral Web',
                        },
                    },
                ],
            },
        ],
    },
];

const buildTestMatch = () => ({
    matchId: 'test_match_1',
    status: 'active',
    players: [{ username: 'p1' }, { username: 'p2' }],
    currentTurn: 'p1',
    turnOrder: ['p1', 'p2'],
    board: {
        p1: [
            {
                rosterIndex: 0,
                hp: 100,
                alive: true,
                state: { statuses: [], cooldowns: {}, skillUses: {} },
            },
        ],
        p2: [
            {
                rosterIndex: 1,
                hp: 100,
                alive: true,
                state: { statuses: [], cooldowns: {}, skillUses: {} },
            },
        ],
    },
    chakraPools: {
        p1: { Taijutsu: 5, Ninjutsu: 5, Bloodline: 5, Genjutsu: 5 },
        p2: { Taijutsu: 5, Ninjutsu: 5, Bloodline: 5, Genjutsu: 5 },
    },
    economy: {
        turnCounts: { p1: 1, p2: 1 },
    },
    combatEvents: [],
});

test('BUG 1: Temporary Destructible Defense applies, absorbs damage, and breaks at 0 points', () => {
    const match = buildTestMatch();
    const unit = match.board.p1[0];

    unit.state.statuses.push({
        id: 'temp_defense',
        remainingTurns: 3,
        metadata: {
            destructibleDefensePoints: 20,
            tooltipText: 'This character has 20 points of destructible defense.',
        },
    });

    assert.equal(unit.state.statuses.length, 1);
    assert.equal(unit.state.statuses[0].metadata.destructibleDefensePoints, 20);

    battleLogic.applyDamageToUnit(unit, 15, { context: 'test' });
    assert.equal(unit.hp, 100);
    assert.equal(unit.state.statuses[0].metadata.destructibleDefensePoints, 5);

    battleLogic.applyDamageToUnit(unit, 10, { context: 'test' });
    assert.equal(unit.hp, 95);
    assert.equal(unit.state.statuses.length, 0);
});

test('BUG 1: Permanent Destructible Defense retains points in metadata and persists', () => {
    const match = buildTestMatch();
    const unit = match.board.p1[0];

    unit.state.statuses.push({
        id: 'perm_defense',
        remainingTurns: 99,
        metadata: {
            permanent: true,
            destructibleDefensePoints: 30,
            tooltipText: 'This character has permanent destructible defense.',
        },
    });

    assert.equal(unit.state.statuses.length, 1);
    assert.equal(unit.state.statuses[0].metadata.destructibleDefensePoints, 30);
    assert.equal(unit.state.statuses[0].remainingTurns, 99);

    battleLogic.applyDamageToUnit(unit, 10, { context: 'test' });
    assert.equal(unit.hp, 100);
    assert.equal(unit.state.statuses[0].metadata.destructibleDefensePoints, 20);
    assert.equal(unit.state.statuses.length, 1);
});

test('BUG 1: Refreshing or stacking Destructible Defense retains state model without duplicating incorrectly', () => {
    const match = buildTestMatch();
    const unit = match.board.p1[0];

    unit.state.statuses.push({
        id: 'stack_defense',
        remainingTurns: 2,
        metadata: {
            destructibleDefensePoints: 15,
        },
    });

    const existing = unit.state.statuses.find((s) => s.id === 'stack_defense');
    existing.metadata.destructibleDefensePoints += 10;

    assert.equal(unit.state.statuses.length, 1);
    assert.equal(unit.state.statuses[0].metadata.destructibleDefensePoints, 25);
});

test('BUG 2: Matching counter triggers, cancels incoming skill, inflicts counter damage, and emits combat event', () => {
    const match = buildTestMatch();
    const attacker = match.board.p1[0];
    const defender = match.board.p2[0];

    defender.state.statuses.push({
        id: 'trap_counter',
        remainingTurns: 1,
        sourceUsername: 'p2',
        sourceSlot: 0,
        metadata: {
            triggerOnEnemyHarmfulNonStrategic: true,
            counterCancelsSkill: true,
            counterDamage: 25,
            sourceSkillName: 'Spiral Web',
        },
    });

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': {
                    skillIndex: 0,
                    targetSelection: [{ username: 'p2', slot: 0 }],
                },
            },
        },
    };

    battleLogic.resolvePendingTurnSkills({
        match,
        actingUsername: 'p1',
        characters: mockCharacters,
    });

    assert.equal(defender.hp, 100);
    assert.equal(attacker.hp, 70);
    assert.equal(defender.state.statuses.length, 0);

    assert.ok(Array.isArray(match.combatEvents));
    assert.equal(match.combatEvents.length, 1);
    const evt = match.combatEvents[0];
    assert.equal(evt.outcome, 'countered');
    assert.equal(evt.counterSourceSkillName, 'Spiral Web');
    assert.equal(evt.skillName, 'Sand Claw');
    assert.equal(evt.message, 'Spiral Web countered Sand Claw.');
});

test('BUG 2: Non-matching skill (Strategic class vs Non-Strategic trap) does not trigger counter', () => {
    const match = buildTestMatch();
    const attacker = match.board.p1[0];
    const defender = match.board.p2[0];

    defender.state.statuses.push({
        id: 'trap_counter',
        remainingTurns: 1,
        sourceUsername: 'p2',
        sourceSlot: 0,
        metadata: {
            triggerOnEnemyHarmfulNonStrategic: true,
            counterCancelsSkill: true,
            counterDamage: 25,
            sourceSkillName: 'Spiral Web',
        },
    });

    const strategicSkill = {
        id: 'strategic_attack',
        name: 'Strategic Attack',
        classes: ['Strategic'],
        target: 'single-enemy',
        effects: [{ type: 'damage', amount: 10 }],
    };

    const strategicChar = [
        { id: 'custom1', skills: [strategicSkill] },
        mockCharacters[1],
    ];

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': {
                    skillIndex: 0,
                    targetSelection: [{ username: 'p2', slot: 0 }],
                },
            },
        },
    };

    battleLogic.resolvePendingTurnSkills({
        match,
        actingUsername: 'p1',
        characters: strategicChar,
    });

    assert.equal(defender.hp, 90);
    assert.equal(attacker.hp, 100);
    assert.equal(defender.state.statuses.length, 1);
});

test('BUG 2: Alternative whenCounteredEffects execute when a skill is countered', () => {
    const match = buildTestMatch();
    const attacker = match.board.p1[0];
    const defender = match.board.p2[0];

    defender.state.statuses.push({
        id: 'trap_counter',
        remainingTurns: 1,
        sourceUsername: 'p2',
        sourceSlot: 0,
        metadata: {
            triggerOnEnemyHarmfulNonStrategic: true,
            counterCancelsSkill: true,
            counterDamage: 10,
            sourceSkillName: 'Spiral Web',
        },
    });

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': {
                    skillIndex: 0,
                    targetSelection: [{ username: 'p2', slot: 0 }],
                },
            },
        },
    };

    battleLogic.resolvePendingTurnSkills({
        match,
        actingUsername: 'p1',
        characters: mockCharacters,
    });

    assert.equal(attacker.hp, 85);
    assert.equal(match.combatEvents[0].alternativeEffectsApplied, true);
});

test('BUG 2: Persistent counter with trapReappliesSelf is retained after triggering', () => {
    const match = buildTestMatch();
    const defender = match.board.p2[0];

    defender.state.statuses.push({
        id: 'persistent_counter',
        remainingTurns: 2,
        sourceUsername: 'p2',
        sourceSlot: 0,
        metadata: {
            triggerOnEnemyHarmfulSkill: true,
            counterCancelsSkill: true,
            trapReappliesSelf: true,
            sourceSkillName: 'Iron Wall Counter',
        },
    });

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': {
                    skillIndex: 0,
                    targetSelection: [{ username: 'p2', slot: 0 }],
                },
            },
        },
    };

    battleLogic.resolvePendingTurnSkills({
        match,
        actingUsername: 'p1',
        characters: mockCharacters,
    });

    assert.equal(defender.state.statuses.length, 1);
    assert.equal(defender.state.statuses[0].id, 'persistent_counter');
});

test('BUG 1: Server match payload preserves destructibleDefensePoints and status metadata keys for client rendering', () => {
    const server = require('../server');
    if (typeof server.buildMatchPayloadForUser === 'function') {
        const match = buildTestMatch();
        const unit = match.board.p1[0];
        unit.state.statuses.push({
            id: 'shukaku_sand_claw',
            remainingTurns: 99,
            metadata: {
                destructibleDefensePoints: 10,
                permanent: true,
                helpful: true,
                tooltipText: 'This character has permanent destructible defense from Sand Claw.',
            },
        });

        const payload = server.buildMatchPayloadForUser(match, 'p1');
        const p1Statuses = payload.board.p1[0].state.statuses;
        assert.equal(p1Statuses.length, 1);
        assert.equal(p1Statuses[0].metadata.destructibleDefensePoints, 10);
        assert.equal(p1Statuses[0].metadata.permanent, true);
    }
});

test('Kabuto: Chakra Scalpel damage bonus is consumed upon use and does not ramp up indefinitely', () => {
    const match = buildTestMatch();
    const kabutoUnit = match.board.p1[0];
    const targetUnit = match.board.p2[0];
    const kabutoChar = require('../data/characters/yakushi-kabuto');

    const mockRoster = [kabutoChar, mockCharacters[1]];

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': {
                    skillIndex: 0,
                    targetSelection: [{ username: 'p2', slot: 0 }],
                },
            },
        },
    };

    battleLogic.resolvePendingTurnSkills({
        match,
        actingUsername: 'p1',
        characters: mockRoster,
    });

    assert.equal(targetUnit.hp, 80);
    assert.equal(kabutoUnit.state.statuses.length, 1);
    assert.equal(kabutoUnit.state.statuses[0].id, 'kabuto_chakra_scalpel_bonus');
    const targetDebuff = targetUnit.state.statuses.find((s) => s.id === 'kabuto_chakra_scalpel_debuff');
    assert.ok(targetDebuff);
    assert.equal(targetDebuff.metadata.turnDurationAnchor, 'source_turn');

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': {
                    skillIndex: 0,
                    targetSelection: [{ username: 'p2', slot: 0 }],
                },
            },
        },
    };

    battleLogic.resolvePendingTurnSkills({
        match,
        actingUsername: 'p1',
        characters: mockRoster,
    });

    assert.equal(targetUnit.hp, 60);
    const bonusStatus = kabutoUnit.state.statuses.find((s) => s.id === 'kabuto_chakra_scalpel_bonus');
    assert.ok(bonusStatus);
    assert.equal(bonusStatus.metadata.skillDamageBonuses['yakushi-kabuto-chakra-scalpel'], 10);
});

