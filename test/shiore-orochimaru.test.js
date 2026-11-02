const assert = require('node:assert/strict');
const test = require('node:test');
const characters = require('../data/characters');
const battle = require('../battleLogic');
const { ACTIVE_ROSTER_IDS, isActiveCharacter } = require('../data/activeRoster');

const indexOf = (id) => characters.findIndex((character) => character.id === id);
const pool = () => ({ taijutsu: 10, ninjutsu: 10, bloodline: 10, genjutsu: 10 });
const empty = () => ({ taijutsu: 0, ninjutsu: 0, bloodline: 0, genjutsu: 0 });
const status = (unit, id) => unit.state.statuses.find((entry) =>
    entry.id === id && entry.remainingTurns > 0);
const matchFor = (allies, enemies) => {
    const players = [
        { username: 'p1', team: allies.map(indexOf) },
        { username: 'p2', team: enemies.map(indexOf) },
    ];
    const match = {
        players, board: battle.buildInitialBoard(players, characters),
        chakraPools: { p1: pool(), p2: pool() },
        economy: { turnCounts: { p1: 0, p2: 0 } }, pendingTurns: {},
    };
    Object.entries(match.board).forEach(([username, units]) =>
        units.forEach((unit) => { unit.username = username; }));
    return match;
};
const cast = (match, username, actorSlot, skillIndex, targetUsername = null, targetSlot = 0) => {
    match.pendingTurns[username] = {
        queueOrder: [actorSlot],
        queuedByActorSlot: { [actorSlot]: {
            skillIndex,
            targetSelection: targetUsername ? [{ username: targetUsername, slot: targetSlot }] : [],
        } },
    };
    battle.resolvePendingTurnSkills({ match, actingUsername: username, characters });
};
const fullRound = (match) => {
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
};

test('Shiore Orochimaru draft kit matches names, costs, cooldowns, and roster', () => {
    const orochimaru = characters[indexOf('shiore-orochimaru')];
    assert.equal(orochimaru.passive.name, 'Cursed Seal');
    assert.deepEqual(orochimaru.skills.map((skill) => [skill.name, skill.energy, skill.cooldown]), [
        ['Five Elements Seal', ['Ninjutsu'], 3], ['Devour', ['Bloodline', 'Random'], 0],
        ['Cursed Seal Bite', ['Random'], 1], ['Skin Shed', ['Random'], 4],
    ]);
    assert.ok(ACTIVE_ROSTER_IDS.includes('shiore-orochimaru'));
    assert.ok(isActiveCharacter(orochimaru));
    assert.equal(orochimaru.requiredMissionId, 'hostile-takeover');
});

test('Five Elements Seal raises all enemy skill costs by 1 random chakra', () => {
    const match = matchFor(['shiore-orochimaru'], ['haruno-sakura']);
    const cost = () => battle.computeEffectiveEnergyCost({
        skill: characters[indexOf('haruno-sakura')].skills[3], actorState: match.board.p2[0].state,
    }).requiredRandom;
    const before = cost();
    cast(match, 'p1', 0, 0, 'p2');
    assert.equal(cost(), before + 1);
});

test('Cursed Seal Bite steals 10 health and seals the target permanently', () => {
    const match = matchFor(['shiore-orochimaru'], ['haruno-sakura']);
    match.board.p1[0].hp = 80;
    cast(match, 'p1', 0, 2, 'p2');
    assert.equal(match.board.p2[0].hp, 90);
    assert.equal(match.board.p1[0].hp, 90, 'Lifesteal heals Orochimaru');
    const seal = status(match.board.p2[0], 'shiore_orochimaru_cursed_seal');
    assert.equal(seal.remainingTurns, 99);
    assert.equal(battle.cleanseHarmfulStatuses(match.board.p2[0], 99), 0, 'the seal cannot be cleansed');
});

test('Cursed Seal deals 5 affliction at the end of the marked enemy turn only when their team has no chakra', () => {
    const match = matchFor(['shiore-orochimaru'], ['haruno-sakura']);
    cast(match, 'p1', 0, 2, 'p2');
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.equal(match.board.p2[0].hp, 90, 'no damage while the enemy team has chakra');
    match.chakraPools.p2 = empty();
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(match.board.p2[0].hp, 90, "Orochimaru's own turn end does not trigger it");
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.equal(match.board.p2[0].hp, 85);
    cast(match, 'p1', 0, 2, 'p2');
    match.board.p1[0].hp = 0;
    match.board.p1[0].alive = false;
    battle.purgeTetheredStatusesOnSourceDeath({ match, sourceUsername: 'p1', sourceSlot: 0 });
    const hpBefore = match.board.p2[0].hp;
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.equal(match.board.p2[0].hp, hpBefore - 5, 'one non-stacking seal persists after Orochimaru dies');
});

test('Devour pays off 35 affliction and a physical stun after 3 turns, with 10 reduction meanwhile', () => {
    const match = matchFor(['shiore-orochimaru'], ['haruno-sakura']);
    cast(match, 'p1', 0, 1, 'p2');
    assert.equal(status(match.board.p1[0], 'shiore_orochimaru_devour_guard').metadata.damageReductionFlat, 10);
    match.board.p1[0].state.cooldowns = {};
    const chakraBefore = { ...match.chakraPools.p1 };
    cast(match, 'p1', 0, 1, 'p2');
    assert.deepEqual(match.chakraPools.p1, chakraBefore, 'Devour cannot be used while active');
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    fullRound(match);
    fullRound(match);
    assert.equal(match.board.p2[0].hp, 100, 'no payoff before the effect ends');
    fullRound(match);
    assert.equal(match.board.p2[0].hp, 65, '20 plus 5 for each of 3 turns');
    assert.deepEqual(status(match.board.p2[0], 'shiore_orochimaru_devour_stun').metadata
        .cannotUseSkillClasses, ['physical']);
    assert.equal(status(match.board.p1[0], 'shiore_orochimaru_devour_guard'), undefined);
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.equal(status(match.board.p2[0], 'shiore_orochimaru_devour_stun'), undefined,
        'the stun lasts through the target\'s next turn');
});

test('Devour broken early by invulnerability pays off scaled to its turns, but not if Orochimaru died', () => {
    const match = matchFor(['shiore-orochimaru'], ['haruno-sakura']);
    cast(match, 'p1', 0, 1, 'p2');
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    fullRound(match);
    cast(match, 'p2', 0, 3);
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(status(match.board.p2[0], 'shiore_orochimaru_devour'), undefined, 'invulnerability breaks Devour');
    assert.equal(match.board.p2[0].hp, 75, '20 plus 5 for the one turn it was active');
    assert.equal(status(match.board.p1[0], 'shiore_orochimaru_devour_guard'), undefined);

    const dead = matchFor(['shiore-orochimaru'], ['haruno-sakura']);
    cast(dead, 'p1', 0, 1, 'p2');
    battle.tickStatusesForTurnEnd({ match: dead, endingUsername: 'p1' });
    dead.board.p1[0].hp = 0;
    dead.board.p1[0].alive = false;
    fullRound(dead);
    assert.equal(status(dead.board.p2[0], 'shiore_orochimaru_devour'), undefined);
    assert.equal(dead.board.p2[0].hp, 100, 'no payoff after Orochimaru dies');
});

test('Skin Shed keeps Devour and its damage reduction active', () => {
    const match = matchFor(['shiore-orochimaru'], ['haruno-sakura']);
    cast(match, 'p1', 0, 1, 'p2');
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    cast(match, 'p1', 0, 3);
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.ok(status(match.board.p1[0], 'shiore_orochimaru_devour_guard'));
    assert.ok(status(match.board.p2[0], 'shiore_orochimaru_devour'));
});
