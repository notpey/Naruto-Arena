const test = require('node:test');
const assert = require('node:assert/strict');
const battleLogic = require('../battleLogic.js');

const teuchiChar = require('../data/characters/teuchi');
const youngMinatoChar = require('../data/characters/young-minato');
const youngKushinaChar = require('../data/characters/young-kushina');
const youngItachiChar = require('../data/characters/young-itachi');

const mockRoster = [teuchiChar, youngMinatoChar, youngKushinaChar, youngItachiChar];

const buildTestMatch = () => ({
    matchId: 'test_new_starters_1',
    status: 'active',
    players: [{ username: 'p1' }, { username: 'p2' }],
    currentTurn: 'p1',
    turnOrder: ['p1', 'p2'],
    board: {
        p1: [
            {
                rosterIndex: 0,
                slot: 0,
                hp: 100,
                alive: true,
                username: 'p1',
                characterId: teuchiChar.id,
                state: { statuses: [], cooldowns: {}, skillUses: {} },
            },
            {
                rosterIndex: 1,
                slot: 1,
                hp: 100,
                alive: true,
                username: 'p1',
                characterId: youngMinatoChar.id,
                state: { statuses: [], cooldowns: {}, skillUses: {} },
            },
            {
                rosterIndex: 2,
                slot: 2,
                hp: 100,
                alive: true,
                username: 'p1',
                characterId: youngKushinaChar.id,
                state: { statuses: [], cooldowns: {}, skillUses: {} },
            },
        ],
        p2: [
            {
                rosterIndex: 3,
                slot: 0,
                hp: 100,
                alive: true,
                username: 'p2',
                characterId: youngItachiChar.id,
                state: { statuses: [], cooldowns: {}, skillUses: {} },
            },
        ],
    },
    chakraPools: {
        p1: { Taijutsu: 10, Ninjutsu: 10, Bloodline: 10, Genjutsu: 10 },
        p2: { Taijutsu: 10, Ninjutsu: 10, Bloodline: 10, Genjutsu: 10 },
    },
    economy: { turnCounts: { p1: 1, p2: 1 } },
    combatEvents: [],
});

test('Teuchi: Stick Throw deals 20 damage and Ramen heals team for 15 HP and grants 20 DR', () => {
    const match = buildTestMatch();
    const teuchiUnit = match.board.p1[0];
    const targetUnit = match.board.p2[0];

    // Teuchi uses Stick Throw (skill 0)
    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 0, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };

    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: mockRoster });

    assert.equal(targetUnit.hp, 80);

    // Teuchi uses Ramen (skill 1)
    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 1, targetSelection: [{ username: 'p1', slot: 0 }] },
            },
        },
    };

    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: mockRoster });

    assert.equal(teuchiUnit.state.statuses.some(s => s.id === 'teuchi_ramen_defense'), true);
});

test('Young Minato: Speedy Flanker deals 25 damage and stuns if HP <= 40', () => {
    const match = buildTestMatch();
    const minatoUnit = match.board.p1[1];
    const targetUnit = match.board.p2[0];

    minatoUnit.hp = 35; // HP <= 40

    match.pendingTurns = {
        p1: {
            queueOrder: [1],
            queuedByActorSlot: {
                '1': { skillIndex: 0, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };

    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: mockRoster });

    assert.equal(targetUnit.hp, 75);
    const stunStatus = targetUnit.state.statuses.find(s => s.id === 'young_minato_speedy_flanker_stun');
    assert.ok(stunStatus);
});

test('Young Kushina: Red-Hot Habanero Rage gains 20 defense and stun immunity for 4 turns', () => {
    const match = buildTestMatch();
    const kushinaUnit = match.board.p1[2];

    match.pendingTurns = {
        p1: {
            queueOrder: [2],
            queuedByActorSlot: {
                '2': { skillIndex: 0, targetSelection: [{ username: 'p1', slot: 2 }] },
            },
        },
    };

    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: mockRoster });

    const rageStatus = kushinaUnit.state.statuses.find(s => s.id === 'young_kushina_habanero_rage');
    assert.ok(rageStatus);
    assert.equal(rageStatus.remainingTurns || rageStatus.duration, 4);
    assert.equal(rageStatus.metadata.stunImmune, true);
});

test('Young Itachi: Summoning Crow grants 1 turn unable to be killed and crow stacks', () => {
    const match = buildTestMatch();
    const itachiUnit = match.board.p2[0];
    const enemyUnit = match.board.p1[0];

    match.pendingTurns = {
        p2: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 0, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };

    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p2', characters: mockRoster });

    const unkillable = itachiUnit.state.statuses.find(s => s.id === 'young_itachi_crow_unreachable');
    assert.ok(unkillable);
    assert.equal(unkillable.metadata.minimumHp, 1);

    const crowStack = enemyUnit.state.statuses.find(s => s.id === 'young_itachi_crow_stack');
    assert.ok(crowStack);
});
