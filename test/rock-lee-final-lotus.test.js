const test = require('node:test');
const assert = require('node:assert/strict');
const battle = require('../battleLogic');
const characters = require('../data/characters');

const indexOf = (id) => characters.findIndex((character) => character.characterId === id);

const setup = () => {
    const players = [
        { username: 'p1', team: [indexOf('rock-lee')] },
        { username: 'p2', team: [indexOf('haruno-sakura'), indexOf('uchiha-sasuke')] },
    ];
    const match = {
        players, board: battle.buildInitialBoard(players, characters),
        chakraPools: { p1: {}, p2: {} }, economy: { turnCounts: { p1: 0, p2: 0 } }, pendingTurns: {},
    };
    Object.entries(match.board).forEach(([username, units]) => units.forEach((unit) => { unit.username = username; }));
    const lee = match.board.p1[0];
    const cast = (skillIndex, slot) => {
        lee.state.cooldowns = {};
        match.pendingTurns.p1 = { queueOrder: [0], queuedByActorSlot: { 0: {
            skillIndex, targetSelection: [{ username: 'p2', slot }],
        } } };
        battle.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    };
    // Open all five Gates on Sasuke with Front Lotus, then heal him back so he survives.
    for (let gate = 0; gate < 5; gate += 1) cast(1, 1);
    Object.assign(match.board.p2[1], { hp: 100, alive: true });
    return { match, lee, cast };
};

const immortal = (lee) => lee.state.statuses.find((status) => status.id === 'rock_lee_final_lotus_immortal');
const endTurn = (match, username) => battle.tickStatusesForTurnEnd({ match, endingUsername: username });

test('Final Lotus immortality lasts through the enemy turn after the kill', () => {
    const { match, lee, cast } = setup();
    cast(2, 0);
    assert.equal(match.board.p2[0].alive, false, 'Final Lotus executes its target');
    endTurn(match, 'p1');
    assert.ok(immortal(lee), "the immortality survives the end of Lee's own turn");

    battle.applyDamageToUnit(lee, 500, { match, sourceUsername: 'p2', sourceSlot: 1, targetUsername: 'p1', targetSlot: 0 });
    assert.equal(lee.alive, true, 'Lee cannot be killed during the enemy turn');
    assert.equal(lee.hp, 1);

    endTurn(match, 'p2');
    assert.ok(immortal(lee));
    endTurn(match, 'p1');
    assert.equal(immortal(lee), undefined, "it ends with Lee's next turn, like any 1-turn effect");
});

test('Windmill invulnerability after an Execution Shuriken kill lasts through the enemy turn', () => {
    const players = [
        { username: 'p1', team: [indexOf('mizuki')] },
        { username: 'p2', team: [indexOf('haruno-sakura'), indexOf('uchiha-sasuke')] },
    ];
    const match = {
        players, board: battle.buildInitialBoard(players, characters),
        chakraPools: { p1: {}, p2: {} }, economy: { turnCounts: { p1: 0, p2: 0 } }, pendingTurns: {},
    };
    Object.entries(match.board).forEach(([username, units]) => units.forEach((unit) => { unit.username = username; }));
    const mizuki = match.board.p1[0];
    const skillIndex = characters[indexOf('mizuki')].skills.findIndex((skill) => skill.id === 'mizuki-execution-shuriken');
    match.board.p2[0].hp = 1;
    match.pendingTurns.p1 = { queueOrder: [0], queuedByActorSlot: { 0: {
        skillIndex, targetSelection: [{ username: 'p2', slot: 0 }],
    } } };
    battle.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].alive, false);
    const windmill = () => mizuki.state.statuses.find((status) => status.id === 'mizuki_windmill_invulnerable');

    endTurn(match, 'p1');
    assert.ok(windmill(), "the invulnerability survives the end of Mizuki's own turn");
    assert.equal(battle.isUnitInvulnerableForSkill(mizuki, ['Physical']), true);
    endTurn(match, 'p2');
    assert.ok(windmill());
    endTurn(match, 'p1');
    assert.equal(windmill(), undefined, "it ends with Mizuki's next turn");
});
