const assert = require('node:assert/strict');
const test = require('node:test');
const characters = require('../data/characters');
const battle = require('../battleLogic');

const SHIKAMARU_MARK = 'nara_shikamaru_ninja_tactics_mark';
const HAYATE_MARK = 'gekko_hayate_fair_fight_mark';
const indexOf = (id) => characters.findIndex((character) => character.id === id);
const pool = () => ({ taijutsu: 10, ninjutsu: 10, bloodline: 10, genjutsu: 10 });
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
const FLAK_JACKET = 2;

test('Flak Jacket does not strip a passive mark Baki already carries', () => {
    const match = matchFor(['baki'], ['nara-shikamaru']);
    const before = status(match.board.p1[0], SHIKAMARU_MARK);
    assert.ok(before, 'the only enemy is marked at battle start');

    cast(match, 'p1', 0, FLAK_JACKET);
    assert.ok(status(match.board.p1[0], 'baki_flak_jacket'));
    const after = status(match.board.p1[0], SHIKAMARU_MARK);
    assert.ok(after, 'the mark survives Flak Jacket');
    assert.deepEqual(after.metadata, before.metadata, 'and keeps everything it does');
});

test('Gekko Hayate\'s passive mark also survives Flak Jacket', () => {
    const match = matchFor(['baki'], ['gekko-hayate']);
    assert.ok(status(match.board.p1[0], HAYATE_MARK), 'the opposite enemy is marked at battle start');
    cast(match, 'p1', 0, FLAK_JACKET);
    assert.ok(status(match.board.p1[0], HAYATE_MARK));
});

test('a passive status that lands during Flak Jacket is not ignored', () => {
    const match = matchFor(['baki'], ['nara-shikamaru']);
    match.board.p1[0].state.statuses = match.board.p1[0].state.statuses
        .filter((entry) => entry.id !== SHIKAMARU_MARK);
    cast(match, 'p1', 0, FLAK_JACKET);

    const passiveMark = characters[indexOf('nara-shikamaru')].passive.startApplyStatusToRandomEnemy;
    battle.applyStatus({ targetState: match.board.p1[0].state, statusId: passiveMark.statusId,
        duration: passiveMark.duration, sourceUsername: 'p2', sourceSlot: 0,
        metadata: { ...passiveMark.metadata, fromPassive: true } });
    const mark = status(match.board.p1[0], SHIKAMARU_MARK);
    assert.ok(mark, 'the passive status is applied');
    assert.equal(mark.metadata.tooltipText, passiveMark.metadata.tooltipText, 'with its full effect');
});

test('Flak Jacket still ignores ordinary enemy non-damage effects', () => {
    const match = matchFor(['baki'], ['haruno-sakura', 'tsuchi-kin']);
    cast(match, 'p1', 0, FLAK_JACKET);
    cast(match, 'p2', 1, 2, 'p1');
    const bells = status(match.board.p1[0], 'tsuchi_kin_unnerving_bells');
    assert.equal(bells.metadata.genjutsuCostIncrease, undefined);
});

test('statuses created by a passive cannot be cleansed', () => {
    const match = matchFor(['haruno-sakura'], ['nara-shikamaru']);
    assert.ok(status(match.board.p1[0], SHIKAMARU_MARK));
    battle.cleanseHarmfulStatuses(match.board.p1[0], 99);
    assert.ok(status(match.board.p1[0], SHIKAMARU_MARK), 'a cleanse leaves the passive mark in place');
});
