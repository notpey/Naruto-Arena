const test = require('node:test');
const assert = require('node:assert/strict');
const characters = require('../data/characters');
const { ACTIVE_ROSTER_IDS } = require('../data/activeRoster');
const { buildMatchPayloadForUser } = require('../server');
const battle = require('../battleLogic');

const indexOf = id => characters.findIndex(character => character.characterId === id);
const kibaIndex = indexOf('inuzuka-kiba');
const emptyPool = () => ({ taijutsu: 0, ninjutsu: 0, bloodline: 0, genjutsu: 0 });
const makeMatch = (team1 = [kibaIndex], team2 = [indexOf('haruno-sakura')]) => {
    const players = [{ username: 'p1', team: team1 }, { username: 'p2', team: team2 }];
    const match = {
        players, board: battle.buildInitialBoard(players, characters),
        chakraPools: { p1: emptyPool(), p2: emptyPool() },
        economy: { turnCounts: { p1: 0, p2: 0 } }, pendingTurns: {},
    };
    Object.entries(match.board).forEach(([username, units]) =>
        units.forEach(unit => { unit.username = username; }));
    return match;
};
const cast = (match, username, actorSlot, skillIndex, targetSelection = []) => {
    match.pendingTurns[username] = {
        queueOrder: [actorSlot],
        queuedByActorSlot: { [actorSlot]: { skillIndex, targetSelection } },
    };
    battle.resolvePendingTurnSkills({ match, actingUsername: username, characters });
};
const target = (username, slot) => [{ username, slot }];
const status = (unit, id) => unit.state.statuses.find(entry => entry.id === id && entry.remainingTurns > 0);
const marker = 'inuzuka_kiba_dynamic_air_marking';
const discount = 'inuzuka_kiba_garouga_discount';

test('Kiba draft is on the playable roster and Heightened Senses is permanent', () => {
    assert.ok(ACTIVE_ROSTER_IDS.includes('inuzuka-kiba'));
    const kiba = characters[kibaIndex];
    assert.equal(kiba.skills.length, 5);
    assert.deepEqual(kiba.skills.slice(0, 4).map(skill => skill.name),
        ['Dynamic Air Marking', 'Garouga', 'Double Headed Wolf', 'Smoke Bomb']);
    const unit = makeMatch().board.p1[0];
    assert.equal(status(unit, 'inuzuka_kiba_heightened_senses').metadata.revealInvisibleSkills, true);
    const match = makeMatch();
    match.board.p2[0].state.statuses.push({ id: 'hidden_enemy_trap', remainingTurns: 1,
        metadata: { invisible: true, hideTooltipFromEnemy: true, tooltipText: 'Hidden trap.' } });
    assert.ok(buildMatchPayloadForUser(match, 'p1').board.p2[0].state.statuses
        .some(entry => entry.id === 'hidden_enemy_trap'));
});

test('Dynamic Air Marking lasts four Kiba turns, blocks repeat targeting and enemy defenses', () => {
    const match = makeMatch([kibaIndex], [kibaIndex]);
    const enemy = match.board.p2[0];
    enemy.state.statuses.push({ id: 'defense', remainingTurns: 4,
        metadata: { damageReductionFlat: 20 } });
    cast(match, 'p1', 0, 0, target('p2', 0));
    assert.equal(status(enemy, marker).remainingTurns, 4);
    assert.deepEqual(battle.computeTargetOptions({ match, actingUsername: 'p1', actorSlot: 0,
        skillIndex: 0, characters }).targets, []);
    cast(match, 'p2', 0, 3);
    assert.equal(battle.isUnitInvulnerableForSkill(enemy, ['Physical']), false,
        'the mark nullifies Smoke Bomb protection');
    cast(match, 'p1', 0, 1, target('p2', 0));
    assert.equal(enemy.hp, 70, 'the mark prevents damage reduction');
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(status(enemy, marker).remainingTurns, 4, 'fresh mark survives the first Kiba turn end');
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.equal(status(enemy, marker).remainingTurns, 4, 'enemy turn does not shorten the mark');
    for (let remaining = 3; remaining > 0; remaining--) {
        battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
        assert.equal(status(enemy, marker).remainingTurns, remaining);
    }
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(status(enemy, marker), undefined);
});

test('a marked target cannot counter Garouga, while an unmarked target can', () => {
    const marked = makeMatch();
    cast(marked, 'p1', 0, 0, target('p2', 0));
    marked.board.p2[0].state.statuses.push({ id: 'counter', remainingTurns: 2,
        sourceUsername: 'p2', sourceSlot: 0,
        metadata: { triggerOnEnemyHarmfulSkill: true, counterCancelsSkill: true } });
    cast(marked, 'p1', 0, 1, target('p2', 0));
    assert.equal(marked.board.p2[0].hp, 70);
    assert.ok(status(marked.board.p2[0], 'counter'));

    const unmarked = makeMatch();
    unmarked.board.p2[0].state.statuses.push({ id: 'counter', remainingTurns: 2,
        sourceUsername: 'p2', sourceSlot: 0,
        metadata: { triggerOnEnemyHarmfulSkill: true, counterCancelsSkill: true } });
    cast(unmarked, 'p1', 0, 1, target('p2', 0));
    assert.equal(unmarked.board.p2[0].hp, 100);
});

test('Garouga discounts only a later Garouga after hitting a marked enemy', () => {
    const match = makeMatch();
    const kiba = match.board.p1[0];
    const cost = () => battle.computeEffectiveEnergyCost({ skill: characters[kibaIndex].skills[1], actorState: kiba.state });
    assert.equal(cost().requiredRandom, 1);
    cast(match, 'p1', 0, 1, target('p2', 0));
    assert.equal(status(kiba, discount), undefined);
    cast(match, 'p1', 0, 0, target('p2', 0));
    cast(match, 'p1', 0, 1, target('p2', 0));
    assert.equal(cost().requiredRandom, 0);
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(cost().requiredRandom, 0);
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(cost().requiredRandom, 1);
});

test('Double Headed Wolf protects the team for one turn and replaces Garouga only next turn', () => {
    const match = makeMatch([kibaIndex, indexOf('haruno-sakura')]);
    cast(match, 'p1', 0, 2);
    for (const ally of match.board.p1) {
        assert.deepEqual(status(ally, 'inuzuka_kiba_double_headed_wolf_protection')
            .metadata.invulnerableToSkillClasses, ['physical']);
    }
    assert.equal(battle.resolveEffectiveSkill({ characters, rosterIndex: kibaIndex, skillIndex: 1,
        actorState: match.board.p1[0].state }).id, 'inuzuka-kiba-double-garouga');
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.ok(status(match.board.p1[0], 'inuzuka_kiba_double_headed_wolf_form'));
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.ok(status(match.board.p1[1], 'inuzuka_kiba_double_headed_wolf_protection'));
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(status(match.board.p1[0], 'inuzuka_kiba_double_headed_wolf_form'), undefined);
    assert.equal(battle.resolveEffectiveSkill({ characters, rosterIndex: kibaIndex, skillIndex: 1,
        actorState: match.board.p1[0].state }).id, 'inuzuka-kiba-garouga');
});

test('Double Headed Wolf stops enemy physical damage but not chakra damage', () => {
    const match = makeMatch([kibaIndex, indexOf('haruno-sakura')], [indexOf('uchiha-sasuke')]);
    cast(match, 'p1', 0, 2);
    cast(match, 'p2', 0, 0, target('p1', 1));
    assert.equal(match.board.p1[1].hp, 100);
    cast(match, 'p2', 0, 1, target('p1', 1));
    assert.ok(match.board.p1[1].hp < 100, 'chakra damage still reaches the protected ally');
});

test('Smoke Bomb protects Kiba for one turn and starts its four turn cooldown', () => {
    const match = makeMatch([kibaIndex], [kibaIndex]);
    cast(match, 'p1', 0, 3);
    battle.tickCooldownsForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(battle.getSkillCooldownRemaining(match.board.p1[0].state,
        'inuzuka-kiba-smoke-bomb'), 4);
    cast(match, 'p2', 0, 1, target('p1', 0));
    assert.equal(match.board.p1[0].hp, 100);
});

test('Double Garouga hits a different enemy and the marked random target grants Garouga discount', () => {
    const match = makeMatch([kibaIndex], [indexOf('haruno-sakura'), indexOf('uchiha-sasuke')]);
    cast(match, 'p1', 0, 0, target('p2', 1));
    cast(match, 'p1', 0, 2);
    cast(match, 'p1', 0, 1, target('p2', 0));
    assert.equal(match.board.p2[0].hp, 70);
    assert.equal(match.board.p2[1].hp, 70);
    assert.ok(status(match.board.p1[0], discount));
    assert.equal(battle.computeEffectiveEnergyCost({ skill: characters[kibaIndex].skills[1],
        actorState: match.board.p1[0].state }).requiredRandom, 0);
});
