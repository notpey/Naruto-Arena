const test = require('node:test');
const assert = require('node:assert/strict');
const battleLogic = require('../battleLogic.js');

const yahikoChar = require('../data/characters/young-yahiko');
const konanChar = require('../data/characters/young-konan');
const nagatoChar = require('../data/characters/young-nagato');
const narutoChar = require('../data/characters/uzumaki-naruto');

const mockRoster = [yahikoChar, konanChar, nagatoChar, narutoChar];

const buildTestMatch = () => ({
    matchId: 'test_rain_orphans_1',
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
                characterId: yahikoChar.id,
                state: { statuses: [], cooldowns: {}, skillUses: {} },
            },
            {
                rosterIndex: 1,
                slot: 1,
                hp: 100,
                alive: true,
                username: 'p1',
                characterId: konanChar.id,
                state: { statuses: [], cooldowns: {}, skillUses: {} },
            },
            {
                rosterIndex: 2,
                slot: 2,
                hp: 100,
                alive: true,
                username: 'p1',
                characterId: nagatoChar.id,
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
                characterId: narutoChar.id,
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

test('Young Yahiko: Lateral Kick deals 20 damage and sets trap status', () => {
    const match = buildTestMatch();
    const targetUnit = match.board.p2[0];

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 1, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };

    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: mockRoster });

    assert.equal(targetUnit.hp, 80);
    const trap = targetUnit.state.statuses.find(s => s.id === 'young_yahiko_lateral_kick_trap');
    assert.ok(trap);
});

test('Young Konan: Winding Paper Shuriken deals 20 piercing damage and ignores healing', () => {
    const match = buildTestMatch();
    const targetUnit = match.board.p2[0];

    match.pendingTurns = {
        p1: {
            queueOrder: [1],
            queuedByActorSlot: {
                '1': { skillIndex: 1, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };

    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: mockRoster });

    assert.equal(targetUnit.hp, 80);
    const ignoreHeal = targetUnit.state.statuses.find(s => s.id === 'young_konan_ignore_healing');
    assert.ok(ignoreHeal);
});

test('Young Nagato: Rinnegan Domination deals 20 piercing damage ignoring invulnerability', () => {
    const match = buildTestMatch();
    const targetUnit = match.board.p2[0];

    match.pendingTurns = {
        p1: {
            queueOrder: [2],
            queuedByActorSlot: {
                '2': { skillIndex: 1, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };

    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: mockRoster });

    assert.equal(targetUnit.hp, 80);
});
