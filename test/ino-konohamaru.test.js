const test = require('node:test');
const assert = require('node:assert/strict');
const battle = require('../battleLogic');
const roster = require('../data/characters');
const { ACTIVE_ROSTER_IDS } = require('../data/activeRoster');

const ino = require('../data/characters/yamanaka-ino');
const konohamaru = require('../data/characters/sarutobi-konohamaru');
const attacker = {
    id: 'test-attacker', characterId: 'test-attacker', name: 'Test Attacker',
    skills: [
        { id: 'test-physical', name: 'Physical Hit', target: 'single-enemy',
            classes: ['Physical', 'Instant'], energy: [], cooldown: 0,
            effects: [{ type: 'damage', amount: 15, scope: 'target' }] },
        { id: 'test-chakra', name: 'Chakra Hit', target: 'single-enemy',
            classes: ['Chakra', 'Instant'], energy: [], cooldown: 0,
            effects: [{ type: 'damage', amount: 15, scope: 'target' }] },
        { id: 'test-heal', name: 'Heal', target: 'single-ally',
            classes: ['Chakra', 'Instant'], energy: [], cooldown: 0,
            effects: [{ type: 'heal', amount: 10, scope: 'target' }] },
        { id: 'test-self-guard', name: 'Self Guard', target: 'self',
            classes: ['Strategic', 'Instant'], energy: [], cooldown: 0,
            effects: [{ type: 'apply_status', statusId: 'test_guard', duration: 1,
                scope: 'self', metadata: { helpful: true, invulnerable: true } }] },
        { id: 'test-aoe', name: 'Area Hit', target: 'all-enemy',
            classes: ['Chakra', 'Instant'], energy: [], cooldown: 0,
            effects: [{ type: 'damage', amount: 10, scope: 'all-enemy' }] },
    ],
};
const characters = [ino, konohamaru, attacker];
const has = (unit, id) => unit.state.statuses.some((status) =>
    status.id === id && status.remainingTurns > 0);
const status = (unit, id) => unit.state.statuses.find((entry) =>
    entry.id === id && entry.remainingTurns > 0);

function makeMatch(p1 = [0, 1, 2], p2 = [2, 2, 2]) {
    const players = [{ username: 'p1', team: p1 }, { username: 'p2', team: p2 }];
    return {
        players, board: battle.buildInitialBoard(players, characters),
        currentTurn: 'p1', turnOrder: ['p1', 'p2'], pendingTurns: {},
        chakraPools: {
            p1: { taijutsu: 20, ninjutsu: 20, bloodline: 20, genjutsu: 20 },
            p2: { taijutsu: 20, ninjutsu: 20, bloodline: 20, genjutsu: 20 },
        },
        economy: { turnCounts: { p1: 1, p2: 1 } }, combatEvents: [],
    };
}

function cast(match, username, actorSlot, skillIndex, targetUsername, targetSlot) {
    match.currentTurn = username;
    match.pendingTurns[username] = {
        queueOrder: [actorSlot],
        queuedByActorSlot: {
            [actorSlot]: { skillIndex, targetSelection: targetUsername
                ? [{ username: targetUsername, slot: targetSlot }] : [] },
        },
    };
    battle.resolvePendingTurnSkills({ match, actingUsername: username, characters });
}

test('Ino and Konohamaru appear in the canonical active roster', () => {
    for (const id of [ino.id, konohamaru.id]) {
        assert.ok(roster.some((character) => character.id === id));
        assert.ok(ACTIVE_ROSTER_IDS.includes(id));
    }
    assert.equal(ino.skills.filter((skill) => !skill.hiddenFromSelectionViewer).length, 4);
    assert.equal(konohamaru.skills.filter((skill) => !skill.hiddenFromSelectionViewer).length, 4);
});

test('Ino hair trap does not stun or damage a stun-immune enemy', () => {
    const match = makeMatch();
    match.board.p2[0].state.statuses.push({
        id: 'stun_immunity', remainingTurns: 2,
        metadata: { helpful: true, cannotBeStunned: true },
    });
    cast(match, 'p1', 0, 2, 'p2', 0);
    cast(match, 'p2', 0, 0, 'p1', 0);
    assert.equal(has(match.board.p2[0], 'ino_hair_strand_stun'), false);
    assert.equal(match.board.p2[0].hp, 100);
    assert.equal(has(match.board.p2[0], 'ino_hair_strand_trap'), false);
});

test('Ino control ends if she is stunned', () => {
    const match = makeMatch();
    cast(match, 'p1', 0, 1, 'p2', 0);
    battle.applyStatus({
        targetState: match.board.p1[0].state, statusId: 'test_stun',
        duration: 1, sourceUsername: 'p2', sourceSlot: 0,
        metadata: { harmful: true, cannotUseSkillClasses: ['physical'] },
    });
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.equal(has(match.board.p2[0], 'ino_mind_body_switch_target'), false);
    assert.equal(has(match.board.p1[0], 'ino_mind_body_switch_active'), false);
});

test('Konohamaru passive tracks damage in one turn and improves only his next attack', () => {
    const match = makeMatch();
    const unit = match.board.p1[1];
    const hit = (amount) => battle.applyDamageToUnit(unit, amount, {
        match, sourceUsername: 'p2', sourceSlot: 0, sourceSkillId: 'test-physical',
        targetUsername: 'p1', targetSlot: 1, skillClasses: ['Physical'],
    });
    hit(15);
    assert.equal(has(unit, 'konohamaru_rivalry_defense'), false);
    hit(15);
    assert.equal(status(unit, 'konohamaru_rivalry_defense').metadata.destructibleDefensePoints, 10);
    assert.ok(has(unit, 'konohamaru_rivalry_attack'));
    cast(match, 'p1', 1, 2, 'p2', 0);
    assert.equal(match.board.p2[0].hp, 70, '20 base plus 10 passive');
    assert.equal(has(unit, 'konohamaru_rivalry_attack'), false);
    cast(match, 'p1', 1, 2, 'p2', 1);
    assert.equal(match.board.p2[1].hp, 80, 'the bonus is consumed');
});

test('Konohamaru passive resets its damage counter at turn end', () => {
    const match = makeMatch();
    const unit = match.board.p1[1];
    const hit = () => battle.applyDamageToUnit(unit, 15, {
        match, sourceUsername: 'p2', sourceSlot: 0,
        targetUsername: 'p1', targetSlot: 1, skillClasses: ['Physical'],
    });
    hit();
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    hit();
    assert.equal(has(unit, 'konohamaru_rivalry_defense'), false);
    hit();
    assert.ok(has(unit, 'konohamaru_rivalry_defense'));
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.ok(has(unit, 'konohamaru_rivalry_defense'));
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.ok(has(unit, 'konohamaru_rivalry_defense'));
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(has(unit, 'konohamaru_rivalry_defense'), false);
});

test('Konohamaru cloak protects an ally and credits his retaliation', () => {
    const match = makeMatch();
    cast(match, 'p1', 1, 0, 'p1', 2);
    const friendlyDamage = battle.applyDamageToUnit(match.board.p1[2], 10, {
        match, sourceUsername: 'p1', sourceSlot: 0,
        targetUsername: 'p1', targetSlot: 2,
    });
    assert.equal(friendlyDamage, 0, 'the cloak ignores all damage');
    cast(match, 'p2', 0, 0, 'p1', 2);
    assert.equal(match.board.p1[2].hp, 100);
    assert.equal(match.board.p2[0].hp, 85);
    const stun = status(match.board.p2[0], 'konohamaru_cloak_physical_stun');
    assert.equal(stun.sourceUsername, 'p1');
    assert.equal(stun.sourceSlot, 1);
});

test('Konohamaru Ambush hits one and pierces the others, then counters targeting', () => {
    const match = makeMatch();
    match.board.p2[1].state.statuses.push({
        id: 'armor', remainingTurns: 2, metadata: { destructibleDefensePoints: 10 },
    });
    cast(match, 'p1', 1, 2, 'p2', 0);
    assert.equal(match.board.p2[0].hp, 80);
    assert.equal(match.board.p2[1].hp, 90);
    assert.equal(status(match.board.p2[1], 'armor').metadata.destructibleDefensePoints, 10);
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.ok(has(match.board.p1[1], 'konohamaru_ambush_trap'),
        'the counter remains active for the next enemy turn');
    cast(match, 'p2', 0, 1, 'p1', 1);
    assert.equal(match.board.p2[0].hp, 70);
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(has(match.board.p1[1], 'konohamaru_ambush_trap'), false,
        'the counter expires after the next turn');
});

test('Ino Block and Replacement Technique prevent attacks for one turn', () => {
    const inoMatch = makeMatch();
    cast(inoMatch, 'p1', 0, 3, 'p1', 0);
    assert.ok(has(inoMatch.board.p1[0], 'ino_block'));
    cast(inoMatch, 'p2', 0, 0, 'p1', 0);
    assert.equal(inoMatch.board.p1[0].hp, 100);

    const konohamaruMatch = makeMatch();
    cast(konohamaruMatch, 'p1', 1, 3, 'p1', 1);
    assert.ok(has(konohamaruMatch.board.p1[1], 'konohamaru_replacement'));
    cast(konohamaruMatch, 'p2', 0, 0, 'p1', 1);
    assert.equal(konohamaruMatch.board.p1[1].hp, 100);
    assert.equal(konohamaruMatch.board.p1[1].state.cooldowns[
        'sarutobi-konohamaru-replacement-technique'], 5);
});
