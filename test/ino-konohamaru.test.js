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

test('Ino Feint adds 10 damage against any stun', () => {
    const match = makeMatch();
    cast(match, 'p1', 0, 0, 'p2', 0);
    assert.equal(match.board.p2[0].hp, 80);
    match.board.p2[1].state.statuses.push({
        id: 'foreign_stun', remainingTurns: 1,
        metadata: { harmful: true, cannotUseSkillClasses: ['physical'] },
    });
    cast(match, 'p1', 0, 0, 'p2', 1);
    assert.equal(match.board.p2[1].hp, 70);
});

test('Ino Switch stuns, triggers piercing passive, and Forced Betrayal uses the controlled enemy', () => {
    const match = makeMatch();
    match.board.p2[0].state.statuses.push({
        id: 'mitigation', remainingTurns: 2,
        metadata: { damageReductionFlat: 10, destructibleDefensePoints: 20 },
    });
    cast(match, 'p1', 0, 1, 'p2', 0);
    assert.equal(match.board.p2[0].hp, 95);
    assert.ok(has(match.board.p2[0], 'ino_mind_body_switch_target'));
    assert.equal(battle.resolveEffectiveSkill({
        characters, rosterIndex: 0, skillIndex: 1, actorState: match.board.p1[0].state,
    }).id, 'yamanaka-ino-forced-betrayal');
    const targets = battle.computeTargetOptions({
        match, actingUsername: 'p1', actorSlot: 0, skillIndex: 1, characters,
    }).targets;
    assert.equal(targets.some((target) => target.username === 'p2' && target.slot === 0), false);
    assert.equal(targets.some((target) => target.username === 'p2' && target.slot === 1), true);
    cast(match, 'p1', 0, 1, 'p2', 1);
    assert.equal(match.board.p2[1].hp, 70);
    assert.match(match.board.p2[1].state.lastDamageDebugText, /Test Attacker/);
    assert.equal(has(match.board.p2[0], 'ino_mind_body_switch_target'), false);
    assert.equal(has(match.board.p1[0], 'ino_mind_body_switch_active'), false);
});

test('Ino hair trap stuns the first harmful cast and Switch consumes it', () => {
    const match = makeMatch();
    cast(match, 'p1', 0, 2, 'p2', 0);
    assert.ok(has(match.board.p2[0], 'ino_hair_strand_trap'));
    cast(match, 'p2', 0, 0, 'p1', 0);
    assert.ok(has(match.board.p2[0], 'ino_hair_strand_stun'));
    assert.equal(match.board.p2[0].hp, 95, 'the trap stun triggers Ino passive');
    assert.equal(has(match.board.p2[0], 'ino_hair_strand_trap'), false);

    const second = makeMatch();
    cast(second, 'p1', 0, 2, 'p2', 0);
    cast(second, 'p1', 0, 1, 'p2', 0);
    assert.equal(has(second.board.p2[0], 'ino_hair_strand_trap'), false);
    assert.ok(has(second.board.p2[0], 'ino_mind_body_switch_trap_break'));
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

test('Konohamaru confusion redirects a helpful targeted skill to a random enemy', () => {
    const match = makeMatch();
    for (const unit of match.board.p1) unit.hp = 50;
    match.board.p2[1].hp = 50;
    cast(match, 'p1', 1, 1, 'p2', 0);
    cast(match, 'p2', 0, 2, 'p2', 1);
    assert.equal(match.board.p2[1].hp, 50);
    assert.equal(match.board.p1.reduce((sum, unit) => sum + unit.hp, 0), 160);
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
    cast(match, 'p2', 0, 1, 'p1', 1);
    assert.equal(match.board.p2[0].hp, 70);
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
