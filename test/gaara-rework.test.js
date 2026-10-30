const test = require('node:test');
const assert = require('node:assert/strict');
const characters = require('../data/characters');
const { ACTIVE_ROSTER_IDS } = require('../data/activeRoster');
const battle = require('../battleLogic');

const indexOf = id => characters.findIndex(character => character.characterId === id);
const gaaraIndex = indexOf('gaara-of-the-desert');
const flowId = 'gaara_of_the_desert_sand_flow';
const pool = () => ({ taijutsu: 10, ninjutsu: 10, bloodline: 10, genjutsu: 10 });
const makeMatch = (team1 = [gaaraIndex], team2 = [indexOf('uchiha-sasuke')]) => {
    const players = [{ username: 'p1', team: team1 }, { username: 'p2', team: team2 }];
    const match = { players, board: battle.buildInitialBoard(players, characters),
        chakraPools: { p1: pool(), p2: pool() },
        economy: { turnCounts: { p1: 0, p2: 0 } }, pendingTurns: {} };
    Object.entries(match.board).forEach(([username, units]) =>
        units.forEach(unit => { unit.username = username; }));
    return match;
};
const cast = (match, username, skillIndex, selection = []) => {
    match.pendingTurns[username] = { queueOrder: [0],
        queuedByActorSlot: { 0: { skillIndex, targetSelection: selection } } };
    battle.resolvePendingTurnSkills({ match, actingUsername: username, characters });
};
const target = (username, slot = 0) => [{ username, slot }];
const status = (unit, id) => unit.state.statuses.find(entry => entry.id === id && entry.remainingTurns > 0);
const flow = match => status(match.board.p1[0], flowId).metadata.sandFlowStacks;

test('Gaara draft is playable and starts with permanent unpierceable reduction', () => {
    assert.ok(ACTIVE_ROSTER_IDS.includes('gaara-of-the-desert'));
    assert.deepEqual(characters[gaaraIndex].skills.map(skill => skill.name),
        ['Sand Binding Coffin', 'Desert Funeral', 'Sand Sphere', 'Sand Shield']);
    assert.deepEqual(characters[gaaraIndex].skills.map(skill => skill.energy),
        [['Ninjutsu'], ['Bloodline', 'Random'], ['Ninjutsu', 'Random'], ['Random']]);
    assert.deepEqual(characters[gaaraIndex].skills.map(skill => skill.cooldown), [1, 0, 5, 4]);
    const match = makeMatch();
    const gaara = match.board.p1[0];
    assert.equal(flow(match), 0);
    assert.equal(status(gaara, flowId).metadata.unpierceableDamageReductionFlat, 5);
    battle.applyDamageToUnit(gaara, 4, { match, targetUsername: 'p1', targetSlot: 0,
        sourceUsername: 'p2', sourceSlot: 0, ignoreDamageReduction: true });
    assert.equal(gaara.hp, 100);
    assert.equal(flow(match), 0, 'damage completely reduced does not award a damage stack');
    battle.applyDamageToUnit(gaara, 15, { match, targetUsername: 'p1', targetSlot: 0,
        sourceUsername: 'p2', sourceSlot: 0, ignoreDamageReduction: true });
    assert.equal(gaara.hp, 90);
    assert.equal(flow(match), 1);
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.equal(flow(match), 1, 'a damaged turn grants no idle stacks');
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(flow(match), 1, 'damage during the opponent turn still blocks the owner turn grant');
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.equal(flow(match), 1, 'the opponent turn never grants passive stacks');
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(flow(match), 3);
});

test('Sand Binding Coffin stuns for one turn and grants two stacks', () => {
    const match = makeMatch();
    cast(match, 'p1', 0, target('p2'));
    assert.equal(status(match.board.p2[0], 'gaara_sand_binding_coffin_stun').metadata.cannotUseSkills, true);
    assert.equal(flow(match), 2);
    cast(match, 'p2', 0, target('p1'));
    assert.equal(match.board.p1[0].hp, 100, 'the stunned enemy cannot use a skill');
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.equal(status(match.board.p2[0], 'gaara_sand_binding_coffin_stun'), undefined);
});

test('an undamaged round grants two passive stacks, not four', () => {
    const match = makeMatch();
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.equal(flow(match), 0);
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(flow(match), 2);
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.equal(flow(match), 2);
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(flow(match), 4);
});

test('Desert Funeral scales by stacks, consumes them, and executes at ten health', () => {
    const match = makeMatch();
    cast(match, 'p1', 0, target('p2'));
    match.board.p2[0].hp = 50;
    cast(match, 'p1', 1, target('p2'));
    assert.equal(match.board.p2[0].hp, 0);
    assert.equal(match.board.p2[0].alive, false);
    assert.equal(flow(match), 0);

    const noStacks = makeMatch();
    noStacks.board.p2[0].state.statuses.push({ id: 'normal_reduction', remainingTurns: 2,
        metadata: { damageReductionFlat: 20 } });
    cast(noStacks, 'p1', 1, target('p2'));
    assert.equal(noStacks.board.p2[0].hp, 70, 'piercing damage ignores ordinary reduction');
});

test('Sand Sphere scales defense, retaliates once per targeted skill, and ends on another skill', () => {
    const match = makeMatch();
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    cast(match, 'p1', 2);
    assert.equal(status(match.board.p1[0], 'gaara_sand_sphere').metadata.destructibleDefensePoints, 35);
    assert.equal(status(match.board.p1[0], 'gaara_sand_sphere').metadata.tooltipText,
        'This character has 35 destructible defense. Enemies who use a skill on them take 15 physical damage. This effect ends when this character uses another skill.');
    cast(match, 'p2', 0, target('p1'));
    assert.equal(match.board.p2[0].hp, 85, 'Sasuke takes 15 physical retaliation');
    assert.equal(status(match.board.p1[0], 'gaara_sand_sphere').metadata.destructibleDefensePoints, 15);
    assert.equal(status(match.board.p1[0], 'gaara_sand_sphere').metadata.tooltipText,
        'This character has 15 destructible defense. Enemies who use a skill on them take 15 physical damage. This effect ends when this character uses another skill.');
    cast(match, 'p1', 3);
    assert.equal(status(match.board.p1[0], 'gaara_sand_sphere'), undefined);
    assert.equal(battle.isUnitInvulnerableForSkill(match.board.p1[0], ['Physical']), true);
});

test('Sand Sphere expires after three Gaara turns', () => {
    const match = makeMatch();
    cast(match, 'p1', 2);
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(status(match.board.p1[0], 'gaara_sand_sphere').remainingTurns, 3);
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.equal(status(match.board.p1[0], 'gaara_sand_sphere').remainingTurns, 3);
    for (const remaining of [2, 1]) {
        battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
        assert.equal(status(match.board.p1[0], 'gaara_sand_sphere').remainingTurns, remaining);
    }
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(status(match.board.p1[0], 'gaara_sand_sphere'), undefined);
});

test('Sand Shield prevents an enemy attack for one turn', () => {
    const match = makeMatch();
    cast(match, 'p1', 3);
    assert.equal(battle.isUnitInvulnerableForSkill(match.board.p1[0], ['Physical']), true);
    cast(match, 'p2', 0, target('p1'));
    assert.equal(match.board.p1[0].hp, 100);
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(status(match.board.p1[0], 'gaara_sand_shield'), undefined);
});
