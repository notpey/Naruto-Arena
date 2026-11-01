const assert = require('node:assert/strict');
const test = require('node:test');
const characters = require('../data/characters');
const battle = require('../battleLogic');
const { ACTIVE_ROSTER_IDS, isActiveCharacter } = require('../data/activeRoster');

const indexOf = (id) => characters.findIndex((character) => character.id === id);
const pool = () => ({ taijutsu: 10, ninjutsu: 10, bloodline: 10, genjutsu: 10 });
const totalChakra = (match, username) => Object.values(match.chakraPools[username])
    .reduce((sum, value) => sum + value, 0);
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
const targetSlots = (match, skillIndex) => battle.computeTargetOptions({
    characters, match, actingUsername: 'p1', actorSlot: 0, skillIndex,
}).targets.map((target) => target.slot);

test('Misumi draft kit matches names, costs, cooldowns, and roster', () => {
    const misumi = characters[indexOf('tsurugi-misumi')];
    assert.equal(misumi.passive.name, 'Twisted Advantage');
    assert.deepEqual(misumi.skills.map((skill) => [skill.name, skill.energy, skill.cooldown]), [
        ['Flexible Twisting Joints', ['Random'], 0], ['Soft Physique Modification', ['Random'], 3],
        ['Tighten Joints', ['Random', 'Random'], 0], ['Misumi Block', ['Random'], 4],
    ]);
    assert.ok(ACTIVE_ROSTER_IDS.includes('tsurugi-misumi'));
    assert.ok(isActiveCharacter(misumi));
    assert.equal(misumi.requiredMissionId, 'twisting-sound');
});

test('Flexible Twisting Joints deals 15 and prepares only its target for Tighten Joints', () => {
    const match = matchFor(['tsurugi-misumi'], ['haruno-sakura', 'tenten']);
    assert.deepEqual(targetSlots(match, 2), []);
    cast(match, 'p1', 0, 0, 'p2', 1);
    assert.equal(match.board.p2[1].hp, 85);
    assert.deepEqual(targetSlots(match, 2), [1]);
});

test('Soft Physique reflects enemy physical skills onto the secret mark and grants chakra once each', () => {
    const { buildMatchPayloadForUser } = require('../server.js');
    const match = matchFor(['tsurugi-misumi'], ['haruno-sakura', 'tenten']);
    cast(match, 'p1', 0, 1, 'p2', 1);
    assert.deepEqual(targetSlots(match, 2), [1], 'the marked enemy can be Tightened');
    const markVisibleTo = (username) => buildMatchPayloadForUser(match, username).board.p2[1].state.statuses
        .some((entry) => entry.id === 'tsurugi_misumi_soft_physique_mark');
    const reflectVisibleTo = (username) => buildMatchPayloadForUser(match, username).board.p1[0].state.statuses
        .some((entry) => entry.id === 'tsurugi_misumi_soft_physique_reflect');
    assert.deepEqual([markVisibleTo('p1'), markVisibleTo('p2')], [true, false]);
    assert.deepEqual([reflectVisibleTo('p1'), reflectVisibleTo('p2')], [true, false]);

    const chakraBefore = totalChakra(match, 'p1');
    cast(match, 'p2', 0, 0, 'p1');
    assert.equal(match.board.p1[0].hp, 100, 'Misumi is not hit');
    assert.equal(match.board.p2[1].hp, 85, "Sakura's Kunai Interference hits the marked Tenten");
    assert.equal(totalChakra(match, 'p1'), chakraBefore + 1, 'one random chakra per reflected skill');

    cast(match, 'p2', 1, 0, 'p1');
    assert.equal(match.board.p1[0].hp, 100, 'reflection persists for every physical skill this turn');
    assert.equal(totalChakra(match, 'p1'), chakraBefore + 2);
});

test('Soft Physique does not reflect non-physical skills', () => {
    const match = matchFor(['tsurugi-misumi'], ['tsuchi-kin', 'tenten']);
    cast(match, 'p1', 0, 1, 'p2', 1);
    const chakraBefore = totalChakra(match, 'p1');
    cast(match, 'p2', 0, 2, 'p1');
    assert.ok(status(match.board.p1[0], 'tsuchi_kin_unnerving_bells'), 'the affliction skill lands on Misumi');
    assert.equal(totalChakra(match, 'p1'), chakraBefore);
});

test('Tighten Joints damages for 2 turns, stuns physical and strategic skills, and locks Misumi', () => {
    const match = matchFor(['tsurugi-misumi'], ['haruno-sakura']);
    cast(match, 'p1', 0, 0, 'p2');
    cast(match, 'p1', 0, 2, 'p2');
    assert.deepEqual(status(match.board.p2[0], 'tsurugi_misumi_tighten_joints_stun').metadata
        .cannotUseSkillClasses, ['physical', 'strategic']);
    const lock = status(match.board.p1[0], 'tsurugi_misumi_tighten_joints_lock');
    assert.deepEqual(lock.metadata.cannotUseSkillIndices, [0, 1, 3]);
    assert.ok(battle.isSkillIndexBlockedForActor(match.board.p1[0].state, 3));
    assert.ok(!battle.isSkillIndexBlockedForActor(match.board.p1[0].state, 2));
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(match.board.p2[0].hp, 70, '15 from Twisting Joints and the first 15 tick');
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.ok(status(match.board.p1[0], 'tsurugi_misumi_tighten_joints_lock'), 'locked on his next turn');
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(match.board.p2[0].hp, 55, 'second tick');
    assert.equal(status(match.board.p2[0], 'tsurugi_misumi_tighten_joints'), undefined);
    assert.equal(status(match.board.p1[0], 'tsurugi_misumi_tighten_joints_lock'), undefined);
});
