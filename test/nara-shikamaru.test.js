const assert = require('node:assert/strict');
const test = require('node:test');
const characters = require('../data/characters');
const battle = require('../battleLogic');
const { ACTIVE_ROSTER_IDS, isActiveCharacter } = require('../data/activeRoster');

const MARK = 'nara_shikamaru_ninja_tactics_mark';
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
const markedSlots = (match) => match.board.p2.flatMap((unit, slot) => status(unit, MARK) ? [slot] : []);
// Move the random passive mark so tests can rely on which enemy carries it.
const markOnly = (match, slot) => {
    match.board.p2.forEach((unit) => {
        unit.state.statuses = unit.state.statuses.filter((entry) => entry.id !== MARK);
    });
    battle.applyStatus({ targetState: match.board.p2[slot].state, statusId: MARK, duration: 99,
        sourceUsername: 'p1', sourceSlot: 0,
        metadata: characters[indexOf('nara-shikamaru')].passive.startApplyStatusToRandomEnemy.metadata });
};

test('Shikamaru draft kit matches names, costs, cooldowns, and roster', () => {
    const shikamaru = characters[indexOf('nara-shikamaru')];
    assert.equal(shikamaru.passive.name, 'Ninja Tactics, for Dummies');
    assert.deepEqual(shikamaru.skills.map((skill) => [skill.name, skill.energy, skill.cooldown]), [
        ['Meditate', [], 0], ['Shadow-Neck Bind', ['Genjutsu'], 0],
        ['Shadow Imitation', ['Bloodline', 'Genjutsu'], 2], ['Shikamaru Hide', ['Random'], 4],
    ]);
    assert.ok(ACTIVE_ROSTER_IDS.includes('nara-shikamaru'));
    assert.ok(isActiveCharacter(shikamaru));
    assert.ok(!shikamaru.requiredMissionId);
});

test('the passive secretly marks exactly one random enemy at battle start', () => {
    for (let run = 0; run < 20; run += 1) {
        const match = matchFor(['nara-shikamaru'], ['haruno-sakura', 'tenten', 'mizuki']);
        assert.equal(markedSlots(match).length, 1);
        const mark = status(match.board.p2[markedSlots(match)[0]], MARK);
        assert.equal(mark.sourceUsername, 'p1');
        assert.equal(mark.metadata.hideTooltipFromUnitOwner, true);
        assert.equal(mark.metadata.statusIcon, characters[indexOf('nara-shikamaru')].passive.icon,
            'the mark shows the passive icon rather than a skill icon');
        assert.equal(mark.metadata.sourceSkillName, 'Ninja Tactics, for Dummies');
    }
    const match = matchFor(['haruno-sakura'], ['tenten']);
    assert.equal(markedSlots(match).length, 0, 'teams without Shikamaru mark no one');
});

test('Shadow-Neck Bind only hits marked enemies and removes their defenses', () => {
    const match = matchFor(['nara-shikamaru'], ['haruno-sakura', 'tenten', 'mizuki']);
    markOnly(match, 0);
    cast(match, 'p1', 0, 0, 'p2', 2);
    assert.ok(status(match.board.p2[2], 'nara_shikamaru_meditate'));
    cast(match, 'p1', 0, 1);
    assert.ok(status(match.board.p2[0], 'nara_shikamaru_shadow_neck_bind'));
    assert.ok(status(match.board.p2[2], 'nara_shikamaru_shadow_neck_bind'));
    assert.equal(status(match.board.p2[1], 'nara_shikamaru_shadow_neck_bind'), undefined);
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.deepEqual(match.board.p2.map((unit) => unit.hp), [85, 100, 85]);
    match.board.p2[0].state.cooldowns = {};
    cast(match, 'p2', 0, 3);
    assert.ok(!battle.isUnitInvulnerableForSkill(match.board.p2[0], ['Physical']),
        'bound enemies cannot become invulnerable');
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.deepEqual(match.board.p2.map((unit) => unit.hp), [70, 100, 70], 'deals damage for 2 turns');
    assert.equal(status(match.board.p2[0], 'nara_shikamaru_shadow_neck_bind'), undefined);
});

test('Shadow Imitation stuns physical and chakra skills of marked enemies', () => {
    const match = matchFor(['nara-shikamaru'], ['haruno-sakura', 'tenten']);
    markOnly(match, 1);
    cast(match, 'p1', 0, 2);
    assert.deepEqual(status(match.board.p2[1], 'nara_shikamaru_shadow_imitation').metadata
        .cannotUseSkillClasses, ['physical', 'chakra']);
    assert.equal(status(match.board.p2[0], 'nara_shikamaru_shadow_imitation'), undefined);
    const tentenHp = match.board.p1[0].hp;
    cast(match, 'p2', 1, 0, 'p1');
    assert.equal(match.board.p1[0].hp, tentenHp, 'a stunned physical skill does nothing');
});

test('Meditate lasts 5 turns, cannot be stacked, and ends if Shikamaru dies', () => {
    const match = matchFor(['nara-shikamaru', 'haruno-sakura'], ['tenten']);
    cast(match, 'p1', 0, 0, 'p2');
    assert.equal(status(match.board.p2[0], 'nara_shikamaru_meditate').remainingTurns, 5);
    assert.equal(battle.computeTargetOptions({
        characters, match, actingUsername: 'p1', actorSlot: 0, skillIndex: 0,
    }).targets.length, 0);
    match.board.p1[0].hp = 0;
    match.board.p1[0].alive = false;
    battle.purgeTetheredStatusesOnSourceDeath({ match, sourceUsername: 'p1', sourceSlot: 0 });
    assert.equal(status(match.board.p2[0], 'nara_shikamaru_meditate'), undefined);
});

test('the passive mark is visible to Shikamaru but hidden from the marked enemy', () => {
    const { buildMatchPayloadForUser } = require('../server.js');
    const match = matchFor(['nara-shikamaru'], ['tenten']);
    const marked = (username) => buildMatchPayloadForUser(match, username).board.p2[0].state.statuses
        .some((entry) => entry.id === MARK);
    assert.equal(marked('p1'), true);
    assert.equal(marked('p2'), false);
});
