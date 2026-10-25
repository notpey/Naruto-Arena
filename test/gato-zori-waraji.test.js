const test = require('node:test');
const assert = require('node:assert/strict');
const battleLogic = require('../battleLogic');
const gato = require('../data/characters/gato');
const duo = require('../data/characters/zori-and-waraji');
const roster = require('../data/characters');
const { ACTIVE_ROSTER_IDS, isActiveCharacter } = require('../data/activeRoster');

const characters = [gato, duo];

function makeUnit(character, rosterIndex, username, slot) {
    return { rosterIndex, slot, hp: 100, alive: true, username,
        characterId: character.id, state: { statuses: [], cooldowns: {}, skillUses: {} } };
}

function makeMatch() {
    return {
        matchId: 'gato-zori-waraji-test', status: 'active',
        players: [{ username: 'p1' }, { username: 'p2' }],
        currentTurn: 'p1', turnOrder: ['p1', 'p2'],
        board: {
            p1: [makeUnit(gato, 0, 'p1', 0), makeUnit(duo, 1, 'p1', 1)],
            p2: [makeUnit(duo, 1, 'p2', 0), makeUnit(gato, 0, 'p2', 1)],
        },
        chakraPools: {
            p1: { Taijutsu: 20, Ninjutsu: 20, Bloodline: 20, Genjutsu: 20 },
            p2: { Taijutsu: 20, Ninjutsu: 20, Bloodline: 20, Genjutsu: 20 },
        },
        economy: { turnCounts: { p1: 1, p2: 1 } }, combatEvents: [],
    };
}

function cast(match, actorSlot, skillIndex, targetSlot = 0, characterList = characters) {
    match.pendingTurns = { p1: { queueOrder: [actorSlot], queuedByActorSlot: {
        [actorSlot]: { skillIndex, targetSelection: [{ username: 'p2', slot: targetSlot }] },
    } } };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: characterList });
}

function gainedChakra(match) {
    return ['taijutsu', 'ninjutsu', 'bloodline', 'genjutsu']
        .reduce((sum, type) => sum + (match.chakraPools.p1[type] || 0), 0);
}

test('new characters are available in the canonical roster', () => {
    assert.ok(roster.some(character => character.id === 'gato'));
    assert.ok(roster.some(character => character.id === 'zori-and-waraji'));
    for (const id of ['gato', 'zori-and-waraji']) {
        assert.ok(ACTIVE_ROSTER_IDS.includes(id), `${id} is selectable`);
        assert.ok(isActiveCharacter(roster.find(character => character.id === id)));
    }
});

test('Gato bounty marks one target and improves Hired Help', () => {
    const match = makeMatch();
    cast(match, 0, 1);
    assert.ok(match.board.p2[0].state.statuses.some(status => status.id === 'gato_bounty_contract'));
    cast(match, 0, 0);
    assert.equal(match.board.p2[0].hp, 75);
    assert.ok(match.board.p2[0].state.statuses.some(status => status.id === 'gato_hired_help_strategic_stun'));
});

test('Gato keeps one bounty and No Loose Ends consumes its mark', () => {
    const match = makeMatch();
    cast(match, 0, 1);
    // Each cast in this focused test represents a later legal turn.
    match.board.p1[0].state.cooldowns = {};
    cast(match, 0, 1, 1);
    assert.equal(match.board.p2[0].state.statuses.some(status => status.id === 'gato_bounty_contract'), false);
    assert.equal(match.board.p2[1].state.statuses.some(status => status.id === 'gato_bounty_contract'), true);
    cast(match, 0, 2);
    assert.equal(match.board.p2[0].hp, 85);
    assert.equal(match.board.p2[1].hp, 70);
    assert.equal(match.board.p2[1].state.statuses.some(status => status.id === 'gato_bounty_contract'), false);
});

test('Zori and Waraji grant the other sword attack 10 damage without stacking', () => {
    const match = makeMatch();
    cast(match, 1, 0);
    assert.equal(match.board.p2[0].hp, 80);
    cast(match, 1, 1);
    assert.equal(match.board.p2[0].hp, 45);
    cast(match, 1, 1);
    assert.equal(match.board.p2[0].hp, 10);
});

test('Bounty Contract adds five damage only to allies non-affliction attacks', () => {
    const match = makeMatch();
    cast(match, 0, 1);
    cast(match, 0, 0);
    assert.equal(match.board.p2[0].hp, 75, 'Gatō does not receive his allies bonus');
    cast(match, 1, 0);
    assert.equal(match.board.p2[0].hp, 50, 'an ally receives five extra damage');

    const afflictionSkill = {
        id: 'test-affliction', name: 'Test Affliction', energy: [],
        target: 'single-enemy', damage: 0, cooldown: 0,
        classes: ['Affliction', 'Instant'],
        effects: [{ type: 'damage', amount: 10, scope: 'target',
            metadata: { afflictionDamage: true, ignoreDamageReduction: true,
                ignoreDestructibleDefense: true } }],
    };
    const testCharacters = [gato, { ...duo, skills: [afflictionSkill] }];
    cast(match, 1, 0, 0, testCharacters);
    assert.equal(match.board.p2[0].hp, 40, 'affliction receives no bounty bonus');
});

test('marked enemy death awards two chakra once, including on No Loose Ends', () => {
    const match = makeMatch();
    cast(match, 0, 1);
    match.board.p2[0].hp = 30;
    cast(match, 0, 2);
    assert.equal(match.board.p2[0].alive, false);
    assert.equal(gainedChakra(match), 2);
    assert.equal(match.board.p2[0].state.statuses.some(status => status.id === 'gato_bounty_contract'), false);
});

test('an ally killing a marked enemy grants chakra only once for that contract', () => {
    const match = makeMatch();
    cast(match, 0, 1);
    match.board.p2[0].hp = 25;
    cast(match, 1, 0);
    assert.equal(match.board.p2[0].alive, false);
    assert.equal(gainedChakra(match), 2);
    match.board.p2[0].alive = true;
    match.board.p2[0].hp = 25;
    cast(match, 1, 0);
    assert.equal(gainedChakra(match), 2);
});

test('Forced Entry removes at most ten defense per enemy before damage', () => {
    const match = makeMatch();
    match.board.p2[0].state.statuses.push({ id: 'defense-a', remainingTurns: 3,
        metadata: { destructibleDefensePoints: 40 } });
    match.board.p2[1].state.statuses.push({ id: 'defense-b', remainingTurns: 3,
        metadata: { destructibleDefensePoints: 5 } });
    cast(match, 1, 2);
    assert.equal(match.board.p2[0].state.statuses[0].metadata.destructibleDefensePoints, 15);
    assert.equal(match.board.p2[0].hp, 100);
    assert.equal(match.board.p2[1].hp, 85);
});

test('Forced Entry fires a defense break effect when it removes the last points', () => {
    const match = makeMatch();
    match.board.p2[0].state.statuses.push({ id: 'breakable', remainingTurns: 3,
        metadata: { destructibleDefensePoints: 5, onBreakApplyStatusToSelf: {
            statusId: 'defense-broken', duration: 1, metadata: { harmful: true },
        }, onBreakApplyStatusToSource: {
            statusId: 'attacker-penalty', duration: 1, metadata: { harmful: true },
        } } });
    cast(match, 1, 2);
    assert.ok(match.board.p2[0].state.statuses.some(status => status.id === 'defense-broken'));
    assert.ok(match.board.p1[1].state.statuses.some(status => status.id === 'attacker-penalty'));
    assert.equal(match.board.p2[0].hp, 85);
});
