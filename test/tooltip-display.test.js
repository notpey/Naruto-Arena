const assert = require('node:assert/strict');
const test = require('node:test');
const display = require('../status-display');
const battle = require('../battleLogic');
const { ACTIVE_ROSTER_IDS } = require('../data/activeRoster');
const allCharacters = require('../data/characters');
const { buildMatchPayloadForUser } = require('../server.js');

// The server indexes teams into the active roster in ACTIVE_ROSTER_IDS order.
const roster = ACTIVE_ROSTER_IDS.map((id) => allCharacters.find((character) => character.characterId === id))
    .filter(Boolean);
const indexOf = (id) => roster.findIndex((character) => character.characterId === id);
const pool = () => ({ taijutsu: 20, ninjutsu: 20, bloodline: 20, genjutsu: 20 });
const matchFor = (allies, enemies) => {
    const players = [
        { username: 'p1', team: allies.map(indexOf) },
        { username: 'p2', team: enemies.map(indexOf) },
    ];
    const match = {
        players, board: battle.buildInitialBoard(players, roster),
        chakraPools: { p1: pool(), p2: pool() },
        economy: { turnCounts: { p1: 0, p2: 0 } }, pendingTurns: {}, currentTurn: 'p1',
    };
    Object.entries(match.board).forEach(([username, units]) => units.forEach((unit) => { unit.username = username; }));
    return match;
};
const turn = (match, username, action = null) => {
    match.currentTurn = username;
    match.pendingTurns[username] = action ? {
        queueOrder: [action.slot || 0],
        queuedByActorSlot: { [action.slot || 0]: {
            skillIndex: action.skill, targetSelection: action.target ? [action.target] : [],
        } },
    } : { queueOrder: [], queuedByActorSlot: {} };
    battle.resolvePendingTurnSkills({ match, actingUsername: username, characters: roster });
    battle.tickStatusesForTurnEnd({ match, endingUsername: username });
    battle.tickCooldownsForTurnEnd({ match, endingUsername: username });
    match.currentTurn = username === 'p1' ? 'p2' : 'p1';
};
const statusIn = (payload, side, slot, id) =>
    payload.board[side][slot].state.statuses.find((status) => status.id === id);

test('status metadata becomes short chips, and the same stat is totalled with its parts', () => {
    const chips = display.buildStatusChips({
        damageReductionFlat: 10, cannotUseSkillClasses: ['physical', 'chakra'], ninjutsuCostIncrease: 1,
        turnEndDamage: 5, afflictionDamage: true,
    });
    assert.deepEqual(chips.map((chip) => display.totalChips([chip])[0].text), [
        '10 damage reduction', 'Physical and Chakra skills stunned', '+1 Ninjutsu cost', '5 affliction damage each turn',
    ]);
    const totals = display.totalChips([
        ...display.buildStatusChips({ damageReductionFlat: 10 }),
        ...display.buildStatusChips({ damageReductionFlat: 5 }),
    ]);
    assert.equal(totals.length, 1);
    assert.equal(totals[0].text, '15 damage reduction');
    assert.equal(totals[0].breakdown, '10 + 5');
});

test('chips only claim to describe a status when every gameplay key is covered', () => {
    assert.equal(display.chipsDescribeMetadata({ harmful: true, cannotUseSkillClasses: ['physical'],
        tooltipText: 'x' }), true);
    assert.equal(display.chipsDescribeMetadata({ helpful: true, damageReductionFlat: 10,
        triggerOnEnemyHarmfulSkillClassesAny: ['physical'] }), false, 'a counter needs its prose');
    assert.equal(display.chipsDescribeMetadata({ helpful: true, tooltipText: 'x' }), false, 'no chips, no claim');
});

test('durations read from the viewer\'s side', () => {
    assert.equal(display.describeDuration({ permanent: true }), '');
    assert.equal(display.describeDuration({ whose: 'viewer', turnEnds: 1 }), 'Ends after your next turn');
    assert.equal(display.describeDuration({ whose: 'opponent', turnEnds: 1 }), "Ends after the enemy's next turn");
    assert.equal(display.describeDuration({ whose: 'opponent', turnEnds: 1, endsThisTurn: true }), 'Ends after this turn');
    assert.equal(display.describeDuration({ whose: 'viewer', turnEnds: 3 }), 'Lasts 3 of your turns');
    assert.equal(display.describeDuration({ whose: 'any', turnEnds: 2 }), 'Ends in 2 turns');
});

test('tooltip lines drop the words the title and icon already say', () => {
    assert.equal(display.tidyTooltipLine("This character's Physical skills are stunned by Ninja Wire Trap.",
        'Ninja Wire Trap'), 'Physical skills are stunned');
    assert.equal(display.tidyTooltipLine('This character is invulnerable.'), 'Invulnerable');
    assert.equal(display.tidyTooltipLine('This character has 25 destructible defense.'), '25 destructible defense');
    assert.equal(display.tidyTooltipLine('This character takes 5 affliction damage.'), 'Takes 5 affliction damage');
    assert.equal(display.tidyTooltipLine('Sasuke is invulnerable.'), 'Sasuke is invulnerable', 'names stay');
});

test('glossary definitions match the engine\'s rules', () => {
    assert.match(display.glossaryFor('affliction'), /ignores damage reduction and destructible defense/);
    assert.match(display.glossaryFor('Piercing'), /ignores damage reduction/);
    assert.equal(display.glossaryFor('cooldown'), '');
});

test('payloads carry viewer-relative durations, the hidden marker, and whether chips say everything', () => {
    const match = matchFor(['uchiha-sasuke'], ['haruno-sakura']);
    turn(match, 'p1', { skill: 1, target: { username: 'p2', slot: 0 } }); // Ninja Wire Trap

    const mine = buildMatchPayloadForUser(match, 'p1');
    const mark = statusIn(mine, 'p2', 0, 'uchiha_sasuke_ninja_wire_trap');
    assert.equal(mark.display.hiddenFromOpponent, true, 'Sasuke\'s player is told the enemy cannot see it');
    assert.deepEqual(mark.display.duration,
        { permanent: false, whose: 'opponent', turnEnds: 1, endsThisTurn: true });
    assert.equal(mark.display.described, false, 'the trap needs its prose');
    const ready = statusIn(mine, 'p1', 0, 'uchiha_sasuke_dragon_flame_ready');
    assert.equal(display.describeDuration(ready.display.duration), 'Ends after your next turn');
    const passive = statusIn(mine, 'p1', 0, 'uchiha_sasuke_two_tomoe_sharingan');
    assert.deepEqual(passive.display.duration, { permanent: true });

    const theirs = buildMatchPayloadForUser(match, 'p2');
    assert.equal(statusIn(theirs, 'p2', 0, 'uchiha_sasuke_ninja_wire_trap'), undefined, 'still invisible to them');

    turn(match, 'p2'); // the marked enemy skips, so the visible stun lands
    const stun = statusIn(buildMatchPayloadForUser(match, 'p2'), 'p2', 0, 'uchiha_sasuke_ninja_wire_trap_stun');
    assert.equal(stun.display.described, true, 'a plain class stun is fully said by its chip');
    assert.equal(stun.display.hiddenFromOpponent, undefined);
    assert.equal(display.describeDuration(stun.display.duration), 'Ends after your next turn');
});

test('skill states tell the panel what is locked, cooling down or replaced', () => {
    const match = matchFor(['uchiha-sasuke'], ['haruno-sakura']);
    let states = buildMatchPayloadForUser(match, 'p1').board.p1[0].state.skillStates;
    assert.equal(states[2].name, 'Chidori');
    assert.equal(states[2].lockedReason, 'Requires Two-Tomoe Sharingan');
    assert.equal(states[0].lockedReason, null);

    turn(match, 'p1', { skill: 0, target: { username: 'p2', slot: 0 } }); // Shadow Shuriken (cooldown 1)
    turn(match, 'p2');
    states = buildMatchPayloadForUser(match, 'p1').board.p1[0].state.skillStates;
    assert.equal(states[0].cooldownRemaining, 1, 'a 1-turn cooldown sits out Sasuke\'s next turn');

    turn(match, 'p1', { skill: 1, target: { username: 'p2', slot: 0 } }); // Ninja Wire Trap
    states = buildMatchPayloadForUser(match, 'p1').board.p1[0].state.skillStates;
    assert.equal(states[1].name, 'Dragon Flame Jutsu');
    assert.equal(states[1].replaced, true);

    const enemyView = buildMatchPayloadForUser(match, 'p2').board.p1[0].state;
    assert.equal(enemyView.skillStates, undefined, 'only your own skills get live state');
});

test('damage over time says "each turn" only when it will tick more than once', () => {
    const metadata = { harmful: true, afflictionDamage: true, turnEndDamage: 10 };
    const text = (turnEnds) => display.totalChips(display.buildStatusChips(metadata, { turnEnds }))[0].text;
    assert.equal(text(1), '10 affliction damage');
    assert.equal(text(3), '10 affliction damage each turn');
});
