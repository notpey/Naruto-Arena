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

test('a nonmatching counter does not prevent a later matching counter from triggering', () => {
    const match = buildTestMatch();
    const defender = match.board.p2[0];
    defender.state.statuses.push(
        {
            id: 'mental_only_counter', remainingTurns: 2, sourceUsername: 'p2', sourceSlot: 0,
            metadata: {
                triggerOnEnemyHarmfulSkillClassesAny: ['mental'],
                counterCancelsSkill: true,
            },
        },
        {
            id: 'physical_counter', remainingTurns: 2, sourceUsername: 'p2', sourceSlot: 0,
            metadata: {
                triggerOnEnemyHarmfulSkillClassesAny: ['physical'],
                counterCancelsSkill: true,
            },
        }
    );
    match.pendingTurns = {
        p1: { queueOrder: [0], queuedByActorSlot: {
            0: { skillIndex: 0, targetSelection: [{ username: 'p2', slot: 0 }] },
        } },
    };

    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: mockCharacters });

    assert.equal(defender.hp, 100, 'the matching counter cancels the Physical attack');
    assert.equal(defender.state.statuses.some(status => status.id === 'mental_only_counter'), true);
    assert.equal(defender.state.statuses.some(status => status.id === 'physical_counter'), false);
    assert.equal(match.combatEvents?.at(-1)?.counterEffectId, 'physical_counter');
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

    const p1Statuses = unit.state.statuses;
    assert.equal(p1Statuses.length, 1);
    assert.equal(p1Statuses[0].metadata.destructibleDefensePoints, 10);
    assert.equal(p1Statuses[0].metadata.permanent, true);
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

test('Audit Fixes: One-time skill damage bonuses consume themselves upon skill use', () => {
    const kankuroChar = require('../data/characters/kankuro');
    const hayateChar = require('../data/characters/gekko-hayate');
    const jiroubouChar = require('../data/characters/jiroubou');

    const kankuroPrep = kankuroChar.skills.find((s) => s.id === 'kankuro-puppet-preparation');
    const kankuroBonusStatus = kankuroPrep.effects.find((e) => e.statusId === 'kankuro_puppet_preparation_bonus');
    assert.deepEqual(kankuroBonusStatus.metadata.removeSelfOnSkillUseSkillIds, [
        'kankuro-black-secret-machine-one-shot',
        'kankuro-poison-bomb',
    ]);

    const hayateMeld = hayateChar.skills.find((s) => s.id === 'gekko-hayate-meld-into-shadows');
    const hayateMeldStatus = hayateMeld.effects.find((e) => e.statusId === 'gekko_hayate_meld_into_shadows');
    assert.deepEqual(hayateMeldStatus.metadata.removeSelfOnSkillUseSkillIds, [
        'gekko-hayate-crescent-moon-slash',
    ]);

    const jiroubouArhat = jiroubouChar.skills.find((s) => s.id === 'jiroubou-arhat-fist');
    const jiroubouArhatStatus = jiroubouArhat.effects.find((e) => e.statusId === 'jiroubou_arhat_fist_bonus');
    assert.deepEqual(jiroubouArhatStatus.metadata.removeSelfOnSkillUseSkillIds, [
        'jiroubou-earth-mausoleum-dumpling',
    ]);
});

test('Audit Fixes: 1-Turn enemy debuffs specify turnDurationAnchor = source_turn', () => {
    const tentenChar = require('../data/characters/tenten');
    const asumaChar = require('../data/characters/sarutobi-asuma');
    const ankoChar = require('../data/characters/mitarashi-anko');
    const oboroChar = require('../data/characters/oboro');

    const tentenTrap = tentenChar.skills.find((s) => s.id === 'tenten-twin-rising-dragons-trap');
    const tentenDebuff = tentenTrap.effects.find((e) => e.statusId === 'tenten_twin_rising_dragons_trap_debuff');
    assert.equal(tentenDebuff.metadata.turnDurationAnchor, 'source_turn');

    const asumaKick = asumaChar.skills.find((s) => s.id === 'sarutobi-asuma-flying-kick');
    const asumaStun = asumaKick.effects.find((e) => e.statusId === 'asuma_flying_kick_stun');
    assert.equal(asumaStun.metadata.turnDurationAnchor, 'source_turn');

    const ankoPin = ankoChar.skills.find((s) => s.id === 'mitarashi-anko-dual-pin');
    const ankoDebuff = ankoPin.effects.find((e) => e.statusId === 'mitarashi_anko_dual_pin_debuff');
    assert.equal(ankoDebuff.metadata.turnDurationAnchor, 'source_turn');

    const oboroKunai = oboroChar.skills.find((s) => s.id === 'oboro-exploding-kunai');
    const oboroDebuff = oboroKunai.effects.find((e) => e.statusId === 'oboro_exploding_kunai_debuff');
    assert.equal(oboroDebuff.metadata.turnDurationAnchor, 'source_turn');
});

test('Hiruzen Sarutobi: Fire Dragon Flame Bullet timing and Dead Demon Consuming Seal immediate + turn-end damage', () => {
    const hiruzenChar = require('../data/characters/sarutobi-hiruzen');
    const fireDragonSkill = hiruzenChar.skills.find((s) => s.id === 'sarutobi-hiruzen-fire-dragon-flame-bullet');
    const fireDragonStatusEffect = fireDragonSkill.effects.find((e) => e.statusId === 'sarutobi_hiruzen_fire_dragon_dot');
    assert.equal(fireDragonStatusEffect.duration, 1);
    assert.equal(fireDragonStatusEffect.metadata.turnDurationAnchor, 'source_turn');

    const sealSkill = hiruzenChar.skills.find((s) => s.id === 'sarutobi-hiruzen-dead-demon-consuming-seal');
    const immediateDamageEnemy = sealSkill.effects.find((e) => e.type === 'damage' && e.scope === 'target');
    const immediateDamageSelf = sealSkill.effects.find((e) => e.type === 'damage' && e.scope === 'self');
    const sealEnemyEffect = sealSkill.effects.find((e) => e.statusId === 'sarutobi_hiruzen_dead_demon_seal_enemy');
    const sealSelfEffect = sealSkill.effects.find((e) => e.statusId === 'sarutobi_hiruzen_dead_demon_seal_self');
    
    assert.equal(immediateDamageEnemy.amount, 40);
    assert.equal(immediateDamageEnemy.metadata.afflictionDamage, true);
    assert.equal(immediateDamageSelf.amount, 20);
    assert.equal(immediateDamageSelf.metadata.afflictionDamage, true);

    assert.equal(sealEnemyEffect.metadata.turnEndDamage, 40);
    assert.equal(sealSelfEffect.metadata.turnEndDamage, 20);
});

test('Hiruzen Sarutobi: Dead Demon Consuming Seal deals damage on cast and every source turn while self-stunned', () => {
    const charactersCatalog = require('../characters.js');
    const hiruzenIndex = charactersCatalog.findIndex((c) => c.id === 'sarutobi-hiruzen');
    const enemyIndex = charactersCatalog.findIndex((c) => c.id === 'naruto-uzumaki');

    const match = {
        turn: 1,
        turnPlayer: 'player1',
        players: [{ username: 'player1' }, { username: 'player2' }],
        board: {
            player1: [
                { characterId: 'sarutobi-hiruzen', rosterIndex: hiruzenIndex, hp: 100, maxHp: 100, alive: true, state: { statuses: [] } }
            ],
            player2: [
                { characterId: 'naruto-uzumaki', rosterIndex: enemyIndex, hp: 100, maxHp: 100, alive: true, state: { statuses: [] } }
            ]
        },
        pendingTurns: {
            player1: {
                queueOrder: ['0'],
                queuedByActorSlot: {
                    '0': {
                        skillIndex: 1, // Dead Demon Consuming Seal
                        targetSelection: [{ username: 'player2', slot: 0 }]
                    }
                }
            }
        }
    };

    // Cast turn (Turn 1): Hiruzen casts Dead Demon Consuming Seal
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'player1', characters: charactersCatalog });
    assert.equal(match.board.player1[0].hp, 80, 'Hiruzen takes 20 affliction damage on cast');
    assert.equal(match.board.player2[0].hp, 60, 'Target takes 40 affliction damage on cast');

    // Turn 1 ends for player1
    battleLogic.tickStatusesForTurnEnd({ match, endingUsername: 'player1' });
    assert.equal(match.board.player1[0].hp, 80, 'No extra turn-end damage on the cast turn');
    assert.equal(match.board.player2[0].hp, 60, 'No extra turn-end damage on the cast turn');

    // Turn 2 ends for player2 (enemy turn)
    battleLogic.tickStatusesForTurnEnd({ match, endingUsername: 'player2' });
    assert.equal(match.board.player1[0].hp, 80, 'No damage on enemy turn end');
    assert.equal(match.board.player2[0].hp, 60, 'No damage on enemy turn end');

    // Turn 3 ends for player1 (Hiruzen turn)
    battleLogic.tickStatusesForTurnEnd({ match, endingUsername: 'player1' });
    assert.equal(match.board.player1[0].hp, 60, 'Hiruzen takes 20 turn-end affliction damage on his turn');
    assert.equal(match.board.player2[0].hp, 20, 'Target takes 40 turn-end affliction damage on Hiruzen turn');

    // Turn 4 ends for player2
    battleLogic.tickStatusesForTurnEnd({ match, endingUsername: 'player2' });
    assert.equal(match.board.player1[0].hp, 60);
    assert.equal(match.board.player2[0].hp, 20);

    // Turn 5 ends for player1 (Hiruzen turn)
    battleLogic.tickStatusesForTurnEnd({ match, endingUsername: 'player1' });
    assert.equal(match.board.player1[0].hp, 40, 'Hiruzen takes 20 turn-end affliction damage on his turn');
    assert.equal(match.board.player2[0].hp, 0, 'Target takes 40 turn-end affliction damage on Hiruzen turn and is eliminated');
});



