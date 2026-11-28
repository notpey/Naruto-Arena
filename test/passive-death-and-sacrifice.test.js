// Nov 28 reports: passive marks end with their owner (Hayate), Haku's Sacrifice shows when it has
// fired, and stun chips reach the player's screen (non-Strategic stuns).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const characters = require('../data/characters');
const battle = require('../battleLogic');
const statusDisplay = require('../status-display');

const indexOf = (id) => characters.findIndex((character) => character.id === id);
const pool = () => ({ taijutsu: 10, ninjutsu: 10, bloodline: 10, genjutsu: 10 });
const active = (unit, id) => unit.state.statuses.find((entry) => entry.id === id && entry.remainingTurns > 0);
const matchFor = (allies, enemies) => {
    const players = [{ username: 'p1', team: allies.map(indexOf) }, { username: 'p2', team: enemies.map(indexOf) }];
    const match = { players, board: battle.buildInitialBoard(players, characters),
        chakraPools: { p1: pool(), p2: pool() }, economy: { turnCounts: { p1: 0, p2: 0 } }, pendingTurns: {} };
    Object.entries(match.board).forEach(([username, units]) => units.forEach((unit) => { unit.username = username; }));
    return match;
};
const cast = (match, username, slot, skillId, target) => {
    const skillIndex = characters[match.board[username][slot].rosterIndex].skills.findIndex((skill) => skill.id === skillId);
    match.pendingTurns[username] = { queueOrder: [slot], queuedByActorSlot: { [slot]: {
        skillIndex, targetSelection: target ? [{ username: target[0], slot: target[1] }] : [] } } };
    battle.resolvePendingTurnSkills({ match, actingUsername: username, characters });
};
const endTurn = (match, username) => {
    battle.tickStatusesForTurnEnd({ match, endingUsername: username });
    battle.tickCooldownsForTurnEnd({ match, endingUsername: username });
    match.economy.turnCounts[username] += 1;
};

test("Hayate's Fair Fight mark leaves the enemy when Hayate dies", () => {
    const match = matchFor(['gekko-hayate', 'tenten', 'baki'], ['gato', 'tenten', 'baki']);
    assert.ok(active(match.board.p2[0], 'gekko_hayate_fair_fight_mark'), 'marked at the start');
    match.board.p1[0].hp = 10;
    cast(match, 'p2', 0, 'gato-hired-help', ['p1', 0]);
    assert.equal(match.board.p1[0].alive, false);
    assert.equal(active(match.board.p2[0], 'gekko_hayate_fair_fight_mark'), undefined);
});

test('a passive mark stays while its owner lives, and one marked to outlast them stays after', () => {
    const match = matchFor(['gekko-hayate', 'tenten', 'baki'], ['gato', 'tenten', 'baki']);
    cast(match, 'p2', 0, 'gato-hired-help', ['p1', 0]);
    assert.equal(match.board.p1[0].alive, true);
    const mark = active(match.board.p2[0], 'gekko_hayate_fair_fight_mark');
    assert.ok(mark, 'still marked while Hayate lives');
    mark.metadata.keepAfterSourceDeath = true;
    match.board.p1[0].hp = 10;
    endTurn(match, 'p2');
    endTurn(match, 'p1');
    endTurn(match, 'p2');
    cast(match, 'p2', 0, 'gato-hired-help', ['p1', 0]);
    assert.equal(match.board.p1[0].alive, false);
    assert.ok(active(match.board.p2[0], 'gekko_hayate_fair_fight_mark'), 'kept by keepAfterSourceDeath');
});

test("Haku's Sacrifice shows that it fired: spent passive and a marker on the saved ally", () => {
    const match = matchFor(['tenten', 'haku', 'baki'], ['gato', 'tenten', 'baki']);
    const [tenten, haku] = match.board.p1;
    tenten.hp = 10;
    cast(match, 'p2', 0, 'gato-hired-help', ['p1', 0]);
    assert.equal(tenten.hp, 10, 'Tenten untouched');
    assert.equal(haku.hp, 80, 'Haku took the hit');
    const passive = haku.state.statuses.find((status) => status.metadata?.sacrificeFirstLethalAllyAttack);
    assert.equal(passive.metadata.spent, true);
    assert.match(passive.metadata.tooltipText, /is spent.*won't trigger again/);
    assert.deepEqual(statusDisplay.buildStatusChips(passive.metadata).map((chip) => chip.text), ['Spent']);
    const saved = active(tenten, 'sacrifice_saved');
    assert.ok(saved, 'saved ally is marked');
    assert.equal(saved.metadata.sourceSkillName, 'Sacrifice');
    endTurn(match, 'p2');
    assert.ok(active(tenten, 'sacrifice_saved'), "visible through Haku's team's turn");
    endTurn(match, 'p1');
    assert.equal(active(tenten, 'sacrifice_saved'), undefined, 'gone after it');
    // Spent: the next lethal hit lands.
    endTurn(match, 'p2');
    cast(match, 'p2', 0, 'gato-hired-help', ['p1', 0]);
    assert.equal(tenten.alive, false);
});

test('stun and protection chips are sent to players, and read clearly', () => {
    const source = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
    const list = source.match(/CLIENT_SAFE_STATUS_METADATA_KEYS = new Set\(\[([\s\S]*?)\n\]\);/)[1];
    const safe = new Set([...list.matchAll(/^\s*'([^']+)',\s*$/gm)].map((match) => match[1]));
    ['cannotUseNonStrategicSkills', 'cannotUseHelpfulSkills', 'unpierceableDamageReductionFlat',
        'nonAfflictionDamageDebuffFlat', 'spent'].forEach((key) => assert.ok(safe.has(key), key));
    const chips = (metadata) => statusDisplay.buildStatusChips(metadata).map((chip) => chip.text);
    assert.deepEqual(chips({ cannotUseNonStrategicSkills: true }), ['Non-Strategic skills stunned']);
    assert.deepEqual(chips({ cannotUseHelpfulSkills: true }), ['Helpful skills stunned']);
    assert.deepEqual(chips({ cannotUseSkillClasses: ['strategic'] }), ['Strategic skills stunned']);
});
