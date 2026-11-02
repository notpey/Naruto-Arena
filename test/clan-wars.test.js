const { test } = require('node:test');
const assert = require('node:assert/strict');

const wars = require('../services/clanWars');

const T0 = new Date('2026-11-02T12:00:00Z');
const at = (hours) => new Date(T0.getTime() + hours * 60 * 60 * 1000);
const snapshot = { version: 1, characters: {} };
const leaf = { clanKey: 'leaf', name: 'Leaf' };
const sand = { clanKey: 'sand', name: 'Sand' };

const activeWar = (terms = {}) => {
    let war = wars.createWarProposal({ warId: 'w1', challenger: leaf, defender: sand, proposedBy: 'Naruto', terms, now: T0 });
    war = wars.respondToProposal(war, { side: 'defender', by: 'Gaara', action: 'accept', now: T0, archetypeSnapshot: snapshot });
    for (const name of ['Naruto', 'Sasuke', 'Sakura']) war = wars.joinRoster(war, { side: 'challenger', username: name });
    for (const name of ['Gaara', 'Temari', 'Kankuro']) war = wars.joinRoster(war, { side: 'defender', username: name });
    return war;
};

const startSet = (war, setId, challenger, defender) => {
    let next = wars.createChallenge(war, { side: 'challenger', username: challenger, opponent: defender, setId, now: T0 });
    next = wars.respondToChallenge(next, { setId, username: defender, accept: true, now: T0 });
    return next;
};

let matchCounter = 0;
const battle = (war, setId, winnerUsername, teams = {}) =>
    wars.recordBattle(war, { setId, matchId: `m${(matchCounter += 1)}`, winnerUsername, teams, now: at(1) }).war;

test('proposals go back and forth until one side accepts, which locks the terms', () => {
    let war = wars.createWarProposal({
        warId: 'w1', challenger: leaf, defender: sand, proposedBy: 'Naruto', terms: { winTarget: 3 }, now: T0,
    });
    assert.equal(war.awaitingSide, 'defender');
    assert.throws(
        () => wars.respondToProposal(war, { side: 'challenger', action: 'accept', now: T0, archetypeSnapshot: snapshot }),
        /other clan/
    );

    war = wars.respondToProposal(war, { side: 'defender', by: 'Gaara', action: 'counter', terms: { winTarget: 4, bestOf: 5 }, now: T0 });
    assert.equal(war.awaitingSide, 'challenger');
    assert.equal(war.terms.winTarget, 4);
    assert.equal(war.proposals.length, 2);

    war = wars.respondToProposal(war, { side: 'challenger', by: 'Naruto', action: 'accept', now: T0, archetypeSnapshot: snapshot });
    assert.equal(war.status, 'active');
    assert.equal(war.terms.bestOf, 5);
    assert.deepEqual(war.archetypeSnapshot, snapshot);
    assert.deepEqual(war.endsAt, at(72));
});

test('invalid terms are explained instead of silently changed', () => {
    assert.throws(
        () => wars.createWarProposal({ warId: 'w', challenger: leaf, defender: sand, terms: { bestOf: 4 }, now: T0 }),
        /best of 3 or best of 5/
    );
    assert.throws(
        () => wars.createWarProposal({ warId: 'w', challenger: leaf, defender: leaf, terms: {}, now: T0 }),
        /itself/
    );
});

test('unanswered proposals expire', () => {
    const war = wars.createWarProposal({ warId: 'w1', challenger: leaf, defender: sand, terms: {}, now: T0 });
    assert.equal(wars.applyTimeouts(war, at(71)).changed, false);
    assert.equal(wars.applyTimeouts(war, at(72)).war.status, 'expired');
});

test('challenges require both players on the roster and respect the open-set rule', () => {
    const war = activeWar();
    assert.throws(
        () => wars.createChallenge(war, { side: 'challenger', username: 'Kakashi', opponent: 'Gaara', setId: 's', now: T0 }),
        /Join the war roster/
    );
    assert.throws(
        () => wars.createChallenge(war, { side: 'challenger', username: 'Naruto', opponent: 'Baki', setId: 's', now: T0 }),
        /not on the enemy war roster/
    );
    const pending = wars.createChallenge(war, { side: 'challenger', username: 'Naruto', opponent: 'Gaara', setId: 's1', now: T0 });
    assert.throws(
        () => wars.createChallenge(pending, { side: 'defender', username: 'Temari', opponent: 'Naruto', setId: 's2', now: T0 }),
        /Naruto already has an open set/
    );
    assert.throws(() => wars.respondToChallenge(pending, { setId: 's1', username: 'Naruto', accept: true, now: T0 }), /challenged player/);
});

test('a best-of-3 set completes at two wins and draws do not score', () => {
    let war = startSet(activeWar(), 's1', 'Naruto', 'Gaara');
    war = battle(war, 's1', 'Naruto');
    war = battle(war, 's1', null);
    war = battle(war, 's1', 'Gaara');
    assert.equal(war.sets[0].status, 'active');
    assert.deepEqual(war.sets[0].score, { challenger: 1, defender: 1 });
    war = battle(war, 's1', 'Gaara');
    assert.equal(war.sets[0].status, 'completed');
    assert.equal(war.sets[0].winnerSide, 'defender');
    assert.deepEqual(war.score, { challenger: 0, defender: 1 });
});

test('recording the same match twice changes nothing', () => {
    const war = startSet(activeWar(), 's1', 'Naruto', 'Gaara');
    const first = wars.recordBattle(war, { setId: 's1', matchId: 'dup', winnerUsername: 'Naruto', now: T0 });
    const second = wars.recordBattle(first.war, { setId: 's1', matchId: 'dup', winnerUsername: 'Naruto', now: T0 });
    assert.equal(second.changed, false);
    assert.equal(second.war.sets[0].battles.length, 1);
});

test('repeat opponents can be limited to one set per pair', () => {
    let war = startSet(activeWar({ repeatOpponents: 'once' }), 's1', 'Naruto', 'Gaara');
    war = battle(battle(war, 's1', 'Naruto'), 's1', 'Naruto');
    assert.throws(
        () => wars.createChallenge(war, { side: 'challenger', username: 'Naruto', opponent: 'Gaara', setId: 's2', now: T0 }),
        /already played a set against Gaara/
    );

    let open = startSet(activeWar({ repeatOpponents: 'allowed' }), 's1', 'Naruto', 'Gaara');
    open = battle(battle(open, 's1', 'Naruto'), 's1', 'Naruto');
    assert.doesNotThrow(() =>
        wars.createChallenge(open, { side: 'challenger', username: 'Naruto', opponent: 'Gaara', setId: 's2', now: T0 })
    );
});

test('members cannot play more sets than the cap', () => {
    let war = activeWar({ maxSetsPerMember: 1, repeatOpponents: 'allowed' });
    war = startSet(war, 's1', 'Naruto', 'Gaara');
    war = battle(battle(war, 's1', 'Naruto'), 's1', 'Naruto');
    assert.throws(
        () => wars.createChallenge(war, { side: 'challenger', username: 'Naruto', opponent: 'Temari', setId: 's2', now: T0 }),
        /maximum 1 sets/
    );
});

test('reaching the win target completes the war, cancels open challenges, and calculates rewards', () => {
    let war = activeWar({ winTarget: 2, repeatOpponents: 'allowed' });
    war = startSet(war, 's1', 'Naruto', 'Gaara');
    war = battle(battle(war, 's1', 'Naruto'), 's1', 'Naruto');
    war = wars.createChallenge(war, { side: 'challenger', username: 'Sakura', opponent: 'Kankuro', setId: 's3', now: T0 });
    war = startSet(war, 's2', 'Sasuke', 'Temari');
    war = battle(war, 's2', 'Temari');
    war = battle(battle(war, 's2', 'Sasuke'), 's2', 'Sasuke');

    assert.equal(war.status, 'completed');
    assert.deepEqual(war.result.winnerSide, 'challenger');
    assert.equal(war.result.reason, 'target');
    assert.equal(war.sets.find((set) => set.setId === 's3').status, 'cancelled');

    const { setParticipationRyo, setWinRyo, warWinRyo, clanWarWinExp, clanSetWinExp } = wars.WAR_REWARDS;
    assert.equal(war.rewards.players.Naruto, setParticipationRyo + setWinRyo + warWinRyo);
    assert.equal(war.rewards.players.Gaara, setParticipationRyo);
    assert.equal(war.rewards.players.Sakura, undefined);
    assert.equal(war.rewards.clans.challenger, clanWarWinExp + 2 * clanSetWinExp);
    assert.equal(war.rewards.clans.defender, 0);
});

test('forfeiting a set gives it to the opponent and earns the forfeiter nothing', () => {
    let war = startSet(activeWar({ winTarget: 1 }), 's1', 'Naruto', 'Gaara');
    war = battle(war, 's1', 'Gaara');
    war = wars.forfeitSet(war, { setId: 's1', username: 'Gaara', now: at(2) });
    assert.equal(war.sets[0].winnerSide, 'challenger');
    assert.equal(war.status, 'completed');
    assert.equal(war.rewards.players.Gaara, undefined);
    assert.ok(war.rewards.players.Naruto > 0);
});

test('a forfeit before any battle is played earns no rewards for anyone', () => {
    let war = startSet(activeWar({ winTarget: 1 }), 's1', 'Naruto', 'Gaara');
    war = wars.forfeitSet(war, { setId: 's1', username: 'Gaara', now: at(2) });
    assert.deepEqual(war.rewards.players, {});
    assert.equal(war.rewards.clans.challenger, wars.WAR_REWARDS.clanWarWinExp);
});

test('at the deadline the clan with more sets won takes the war, and a tie is a draw', () => {
    let war = startSet(activeWar(), 's1', 'Naruto', 'Gaara');
    war = battle(battle(war, 's1', 'Gaara'), 's1', 'Gaara');
    war = startSet(war, 's2', 'Sasuke', 'Temari');
    war = battle(war, 's2', 'Sasuke');

    const decided = wars.applyTimeouts(war, at(72)).war;
    assert.equal(decided.status, 'completed');
    assert.equal(decided.result.winnerSide, 'defender');
    assert.equal(decided.result.reason, 'deadline');
    assert.equal(decided.sets.find((set) => set.setId === 's2').status, 'void');

    let tied = startSet(activeWar(), 's1', 'Naruto', 'Gaara');
    tied = battle(battle(tied, 's1', 'Gaara'), 's1', 'Gaara');
    tied = startSet(tied, 's2', 'Sasuke', 'Temari');
    tied = battle(battle(tied, 's2', 'Sasuke'), 's2', 'Sasuke');
    const draw = wars.applyTimeouts(tied, at(72)).war;
    assert.equal(draw.result.winnerSide, null);
    assert.equal(draw.rewards.clans.challenger, wars.WAR_REWARDS.clanSetWinExp);
});

test('no-repeat history follows the ruleset scope', () => {
    const teams = { Naruto: ['a', 'b', 'c'], Gaara: ['x', 'y', 'z'] };
    let war = startSet(activeWar({ ruleset: { noRepeatScope: 'set' }, repeatOpponents: 'allowed' }), 's1', 'Naruto', 'Gaara');
    war = battle(war, 's1', 'Naruto', teams);
    const context = wars.getBattleContext(war, { setId: 's1', username: 'Gaara' });
    assert.equal(context.opponent, 'Naruto');
    assert.deepEqual(context.usedCharacterIds, ['x', 'y', 'z']);

    let warScoped = startSet(activeWar({ ruleset: { noRepeatScope: 'war' }, repeatOpponents: 'allowed' }), 's1', 'Naruto', 'Gaara');
    warScoped = battle(battle(warScoped, 's1', 'Naruto', teams), 's1', 'Naruto', { Naruto: ['d', 'e', 'f'] });
    warScoped = startSet(warScoped, 's2', 'Naruto', 'Temari');
    assert.deepEqual(
        wars.getBattleContext(warScoped, { setId: 's2', username: 'Naruto' }).usedCharacterIds.sort(),
        ['a', 'b', 'c', 'd', 'e', 'f']
    );
});

test('surrendering a war hands the win to the other clan', () => {
    const war = wars.surrenderWar(activeWar(), { side: 'defender', now: at(1) });
    assert.equal(war.result.winnerSide, 'challenger');
    assert.equal(war.result.surrenderedBy, 'defender');
});

test('players with an open set cannot leave the roster', () => {
    const war = startSet(activeWar(), 's1', 'Naruto', 'Gaara');
    assert.throws(() => wars.removeFromRoster(war, { side: 'challenger', username: 'Naruto' }), /open set/);
    assert.doesNotThrow(() => wars.removeFromRoster(war, { side: 'challenger', username: 'Sakura' }));
});
