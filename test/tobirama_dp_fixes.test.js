const test = require('node:test');
const assert = require('node:assert/strict');
const { resolvePendingTurnSkills, tickStatusesForTurnEnd } = require('../battleLogic');
const characters = require('../data/characters');

test('Flat damage reduction budget accumulates and caps across multiple attacks in the same turn', () => {
    // Player 1 has 3 attackers (Uchiha Sasuke lion combo, 25 base damage each)
    // Player 2 has 1 target with 15 flat damage reduction
    const match = {
        players: [{ username: 'p1' }, { username: 'p2' }],
        economy: { turnCounts: { p1: 1, p2: 0 } },
        board: {
            p1: [
                { id: 'u1', hp: 100, alive: true, rosterIndex: 2 },
                { id: 'u2', hp: 100, alive: true, rosterIndex: 2 },
                { id: 'u3', hp: 100, alive: true, rosterIndex: 2 },
            ],
            p2: [
                {
                    id: 'target',
                    hp: 100,
                    alive: true,
                    rosterIndex: 0,
                    state: {
                        statuses: [
                            {
                                id: 'dr_status',
                                remainingTurns: 2,
                                metadata: {
                                    damageReductionFlat: 15,
                                },
                            },
                        ],
                    },
                },
            ],
        },
        pendingTurns: {
            p1: {
                queueOrder: [0, 1, 2],
                queuedByActorSlot: {
                    '0': { skillIndex: 0, targetSelection: [{ username: 'p2', slot: 0 }] },
                    '1': { skillIndex: 0, targetSelection: [{ username: 'p2', slot: 0 }] },
                    '2': { skillIndex: 0, targetSelection: [{ username: 'p2', slot: 0 }] },
                },
            },
        },
    };

    resolvePendingTurnSkills({
        match,
        actingUsername: 'p1',
        characters,
    });

    const targetHp = match.board.p2[0].hp;
    // Base damage = 25 * 3 = 75. With 15 DR budget for the turn, total HP lost should be 60 (100 - 60 = 40).
    // Without the fix, 15 DR would apply to all 3 hits (10 * 3 = 30 damage, HP = 70).
    assert.strictEqual(targetHp, 40, `Target HP should be 40 (60 damage taken), got ${targetHp}`);
});

test('Edo Tensei Tobirama Water Colliding Wave expires and deals no damage after Tobirama dies', () => {
    // Find Tobirama index in characters array
    const tobiramaIndex = characters.findIndex((c) => c.id === 'edo-tensei-tobirama');
    assert.ok(tobiramaIndex >= 0, 'Edo Tensei Tobirama character must exist');

    const match = {
        players: [{ username: 'tobirama_player' }, { username: 'enemy_player' }],
        economy: { turnCounts: { tobirama_player: 1, enemy_player: 1 } },
        board: {
            tobirama_player: [
                {
                    id: 'tobirama_unit',
                    hp: 0, // Tobirama is dead!
                    alive: false,
                    rosterIndex: tobiramaIndex,
                },
            ],
            enemy_player: [
                {
                    id: 'enemy_unit',
                    hp: 100,
                    alive: true,
                    rosterIndex: 0,
                    state: {
                        statuses: [
                            {
                                id: 'edo_tensei_tobirama_water_colliding_wave_dot',
                                remainingTurns: 3,
                                sourceUsername: 'tobirama_player',
                                sourceSlot: 0,
                                sourceSkillId: 'edo-tensei-tobirama-water-colliding-wave',
                                metadata: {
                                    harmful: true,
                                    turnEndDamage: 15,
                                    turnEndTrigger: 'source_turn',
                                    ongoingClass: 'action',
                                    cannotUseSkillClasses: ['affliction'],
                                },
                            },
                        ],
                    },
                },
            ],
        },
    };

    // Execute turn end status ticking for tobirama_player when Tobirama is dead
    tickStatusesForTurnEnd({
        match,
        endingUsername: 'tobirama_player',
    });

    const enemyUnit = match.board.enemy_player[0];
    assert.strictEqual(enemyUnit.hp, 100, `Enemy HP should remain 100 since Tobirama is dead, got ${enemyUnit.hp}`);
    const remainingStatuses = (enemyUnit.state.statuses || []).filter(
        (s) => s.id === 'edo_tensei_tobirama_water_colliding_wave_dot'
    );
    assert.strictEqual(remainingStatuses.length, 0, 'Water Colliding Wave status should be cleaned up on dead source');
});

test('All Action and Control skills across character roster specify ongoingClass metadata for multi-turn statuses', () => {
    const missingOngoingClass = [];

    characters.forEach((char) => {
        if (!char || !Array.isArray(char.skills)) return;
        char.skills.forEach((skill) => {
            const classes = (Array.isArray(skill.classes) ? skill.classes : []).map((c) => String(c).trim().toLowerCase());
            const isAction = classes.includes('action');
            const isControl = classes.includes('control');
            if (!isAction && !isControl) return;

            const expectedClass = isAction ? 'action' : 'control';
            (Array.isArray(skill.effects) ? skill.effects : []).forEach((effect) => {
                if (effect.type === 'apply_status' && effect.metadata) {
                    const duration = Number(effect.duration) || 0;
                    const isInfinite = Boolean(effect.metadata.infiniteDuration);
                    if ((duration >= 1 || isInfinite) && effect.metadata.ongoingClass !== expectedClass) {
                        missingOngoingClass.push(
                            `${char.id}:${skill.id}:${effect.statusId} (Expected ongoingClass: "${expectedClass}", got "${effect.metadata.ongoingClass}")`
                        );
                    }
                }
            });
        });
    });

    assert.deepEqual(
        missingOngoingClass,
        [],
        `Found ${missingOngoingClass.length} Action/Control skill statuses missing valid ongoingClass metadata: \n${missingOngoingClass.join('\n')}`
    );
});
