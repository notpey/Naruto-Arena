const assert = require('node:assert/strict');
const test = require('node:test');
const characters = require('../data/characters');
const battle = require('../battleLogic');

const indexOf = (id) => characters.findIndex((character) => character.id === id);
const kit = (id) => characters[indexOf(id)];
const skill = (id, name) => kit(id).skills.find((entry) => entry.name === name);
const pool = () => ({ taijutsu: 10, ninjutsu: 10, bloodline: 10, genjutsu: 10 });
const status = (unit, id) => unit.state.statuses.find((entry) => entry.id === id && entry.remainingTurns > 0);
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

test('costs, cooldowns, and classes match the balance update', () => {
    assert.deepEqual(skill('gaara-of-the-desert', 'Sand Sphere').energy, ['Ninjutsu', 'Ninjutsu']);
    assert.deepEqual(skill('shiore-orochimaru', 'Five Elements Seal').energy, ['Ninjutsu']);
    assert.equal(skill('mitarashi-anko', 'Dragon Fire').cooldown, 2);
    assert.deepEqual(skill('ebisu', 'Water Walking').energy, ['Random']);
    assert.deepEqual(skill('ebisu', 'Strict Discipline').energy, ['Ninjutsu']);
    assert.deepEqual(skill('sarutobi-konohamaru', 'Cloak of Invisibility Technique').classes,
        ['Strategic', 'Physical', 'Instant']);
    assert.deepEqual(skill('sarutobi-konohamaru', 'Sexy Jutsu: Konohamaru Style').classes, ['Strategic', 'Instant']);
    assert.deepEqual(skill('sarutobi-konohamaru', 'Replacement Technique').classes, ['Strategic', 'Instant']);
    assert.equal(skill('kankuro', 'Poison Bomb').startingCooldown, 1);
});

test('Poison Bomb starts on cooldown and blocks healing longer while Puppet Preparation holds', () => {
    const match = matchFor(['kankuro'], ['haruno-sakura']);
    assert.ok(match.board.p1[0].state.cooldowns['kankuro-poison-bomb'] > 0, 'starts on cooldown');
    match.board.p1[0].state.cooldowns = {};
    cast(match, 'p1', 0, 1);
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(match.board.p2[0].hp, 90, '10 affliction damage on the turn it is used');
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(match.board.p2[0].hp, 80, 'and 10 more the next turn while the defense remains');
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(match.board.p2[0].hp, 80, 'the poison lasts only 2 turns');
    assert.equal(status(match.board.p2[0], 'kankuro_poison_bomb_poison'), undefined);

    const fresh = matchFor(['kankuro'], ['haruno-sakura']);
    fresh.board.p1[0].state.cooldowns = {};
    cast(fresh, 'p1', 0, 1);
    assert.equal(status(fresh.board.p2[0], 'kankuro_poison_bomb_no_heal').remainingTurns, 2,
        '2 turns while the defense remains');

    const broken = matchFor(['kankuro'], ['haruno-sakura']);
    broken.board.p1[0].state.statuses = broken.board.p1[0].state.statuses
        .filter((entry) => entry.id !== 'kankuro_puppet_preparation_defense');
    broken.board.p1[0].state.cooldowns = {};
    cast(broken, 'p1', 0, 1);
    assert.equal(status(broken.board.p2[0], 'kankuro_poison_bomb_no_heal').remainingTurns, 1,
        '1 turn once the defense is gone');
    for (let round = 0; round < 3; round += 1) {
        battle.tickStatusesForTurnEnd({ match: broken, endingUsername: 'p1' });
        battle.tickStatusesForTurnEnd({ match: broken, endingUsername: 'p2' });
    }
    assert.equal(broken.board.p2[0].hp, 90, 'only one hit of poison without the defense');
});

test('Puppet Trap now counters physical skills too', () => {
    const match = matchFor(['kankuro'], ['tenten']);
    cast(match, 'p1', 0, 2, 'p2');
    cast(match, 'p2', 0, 0, 'p1');
    assert.equal(match.board.p1[0].hp, 100, 'the physical skill is countered');
    assert.ok(status(match.board.p2[0], 'kankuro_puppet_trap_stun'), 'and the attacker is stunned');
});

test('Black Secret Machine One Shot deals 15 more to a trapped or countered enemy', () => {
    const trapped = matchFor(['kankuro'], ['tenten']);
    cast(trapped, 'p1', 0, 2, 'p2');
    trapped.board.p1[0].state.cooldowns = {};
    cast(trapped, 'p1', 0, 0, 'p2');
    assert.equal(trapped.board.p2[0].hp, 55, '30 plus 15 while Puppet Trap waits');

    const countered = matchFor(['kankuro'], ['tenten']);
    cast(countered, 'p1', 0, 2, 'p2');
    cast(countered, 'p2', 0, 0, 'p1');
    assert.ok(status(countered.board.p2[0], 'kankuro_puppet_trap_stun'), 'the trap countered the skill');
    countered.board.p1[0].state.cooldowns = {};
    cast(countered, 'p1', 0, 0, 'p2');
    assert.equal(countered.board.p2[0].hp, 55, '30 plus 15 after the counter');
});

test('Rock Lee damaging skills deal 10 less base damage', () => {
    const match = matchFor(['rock-lee'], ['haruno-sakura']);
    cast(match, 'p1', 0, 1, 'p2');
    assert.equal(match.board.p2[0].hp, 60, 'Front Lotus: 35 plus the first Gate');
});

test('Anko Dragon Fire ticks 10 and Snake Hand afflicts for 2 turns', () => {
    const match = matchFor(['mitarashi-anko'], ['haruno-sakura']);
    cast(match, 'p1', 0, 1);
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(match.board.p2[0].hp, 90, 'Dragon Fire ticks 10');
    assert.equal(skill('mitarashi-anko', 'Hidden Shadow Snake Hand').effects
        .find((effect) => effect.type === 'apply_status').duration, 2);
});

test("Konohamaru's cloak stun lands on the attacker's next turn", () => {
    const match = matchFor(['sarutobi-konohamaru', 'haruno-sakura'], ['tenten']);
    cast(match, 'p1', 0, 0, 'p1', 0);
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    cast(match, 'p2', 0, 0, 'p1', 0);
    assert.equal(match.board.p1[0].hp, 100, 'the cloak ignores the damage');
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.ok(status(match.board.p2[0], 'konohamaru_cloak_physical_stun'), 'still stunned on their next turn');
    match.board.p2[0].state.cooldowns = {};
    const sakuraHp = match.board.p1[1].hp;
    cast(match, 'p2', 0, 0, 'p1', 1);
    assert.equal(match.board.p1[1].hp, sakuraHp, 'their physical skill cannot be used');
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.equal(status(match.board.p2[0], 'konohamaru_cloak_physical_stun'), undefined, 'then it ends');
});

test('Sexy Jutsu and its permanent stacks end when Konohamaru dies', () => {
    const match = matchFor(['sarutobi-konohamaru'], ['haruno-sakura']);
    cast(match, 'p1', 0, 1);
    assert.ok(status(match.board.p2[0], 'konohamaru_sexy_jutsu_debuff'));
    cast(match, 'p2', 0, 2);
    assert.ok(status(match.board.p2[0], 'konohamaru_sexy_jutsu_permanent_debuff'), 'a Strategic skill adds a stack');

    match.board.p1[0].hp = 0;
    match.board.p1[0].alive = false;
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(status(match.board.p2[0], 'konohamaru_sexy_jutsu_debuff'), undefined);
    assert.equal(status(match.board.p2[0], 'konohamaru_sexy_jutsu_permanent_debuff'), undefined);
});
