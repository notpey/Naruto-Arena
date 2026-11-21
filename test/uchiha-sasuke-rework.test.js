const assert = require('node:assert/strict');
const test = require('node:test');
const characters = require('../data/characters');
const battle = require('../battleLogic');

const SASUKE = 'uchiha-sasuke';
const AWAKENED = 'uchiha_sasuke_two_tomoe_sharingan_awakened';
const MARK = 'uchiha_sasuke_ninja_wire_trap';
const STUN = 'uchiha_sasuke_ninja_wire_trap_stun';
const SHURIKEN = 0;
const WIRE_TRAP = 1;
const CHIDORI = 2;
const EVASION = 3;

const indexOf = (id) => characters.findIndex((character) => character.id === id);
const pool = () => ({ taijutsu: 20, ninjutsu: 20, bloodline: 20, genjutsu: 20 });
const status = (unit, id) => unit.state.statuses.find((entry) => entry.id === id && entry.remainingTurns > 0);
const passiveOf = (unit) => unit.state.statuses.find((entry) => entry?.metadata?.passive === true);
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
// One full turn: queue (optionally) one skill, resolve, then the server's turn-end ticks.
const turn = (match, username, action = null) => {
    match.pendingTurns[username] = action ? {
        queueOrder: [action.slot || 0],
        queuedByActorSlot: { [action.slot || 0]: {
            skillIndex: action.skill,
            targetSelection: action.target ? [action.target] : [],
        } },
    } : { queueOrder: [], queuedByActorSlot: {} };
    battle.resolvePendingTurnSkills({ match, actingUsername: username, characters });
    battle.tickStatusesForTurnEnd({ match, endingUsername: username });
    battle.tickCooldownsForTurnEnd({ match, endingUsername: username });
};
const effectiveSkillName = (match, skillIndex) => {
    const unit = match.board.p1[0];
    return battle.resolveEffectiveSkill({
        characters, rosterIndex: unit.rosterIndex, skillIndex, actorState: unit.state,
    })?.name;
};
const onEnemy = (slot = 0) => ({ username: 'p2', slot });
const onSasuke = { username: 'p1', slot: 0 };

test('Sasuke kit: names, costs, cooldowns, and Chidori locked until the quest completes', () => {
    const sasuke = characters[indexOf(SASUKE)];
    assert.equal(sasuke.name, 'Uchiha Sasuke');
    assert.equal(sasuke.passive.name, 'Two-Tomoe Sharingan');
    assert.deepEqual(sasuke.skills.map((skill) => [skill.name, skill.energy, skill.cooldown]), [
        ['Shadow Shuriken Technique', ['Taijutsu'], 1],
        ['Ninja Wire Trap', [], 0],
        ['Chidori', ['Ninjutsu', 'Random'], 1],
        ['Sasuke Evasion', ['Random'], 4],
        ['Dragon Flame Jutsu', ['Bloodline'], 0],
    ]);
    const match = matchFor([SASUKE], ['haruno-sakura']);
    const enemy = match.board.p2[0];
    turn(match, 'p1', { skill: CHIDORI, target: onEnemy() });
    assert.equal(enemy.hp, 100, 'Chidori cannot be used before the awakening');
});

test('the quest tracks skills used and awakens after the 4th, enhancing cooldowns', () => {
    const match = matchFor([SASUKE], ['haruno-sakura']);
    const sasuke = match.board.p1[0];
    assert.match(passiveOf(sasuke).metadata.tooltipText, /Skills used: 0\/4/);
    const plan = [EVASION, WIRE_TRAP, SHURIKEN, WIRE_TRAP];
    plan.forEach((skill, index) => {
        assert.equal(status(sasuke, AWAKENED), undefined, `not awakened before skill ${index + 1}`);
        // Wire Trap turns into Dragon Flame the turn after it is used; slot 1 is then Dragon Flame.
        turn(match, 'p1', { skill, target: skill === EVASION ? onSasuke : onEnemy() });
        if (index < 3) assert.match(passiveOf(sasuke).metadata.tooltipText, new RegExp(`Skills used: ${index + 1}/4`));
        turn(match, 'p2');
    });
    assert.ok(status(sasuke, AWAKENED), 'awakened after the 4th skill');
    assert.doesNotMatch(passiveOf(sasuke).metadata.tooltipText, /Skills used/);
    const effective = (skillIndex) => battle.resolveEffectiveSkill({
        characters, rosterIndex: sasuke.rosterIndex, skillIndex, actorState: sasuke.state,
    });
    assert.equal(effective(SHURIKEN).cooldown, 0);
    assert.equal(effective(EVASION).cooldown, 3);
    assert.equal(sasuke.state.cooldowns['uchiha-sasuke-shadow-shuriken-technique'], undefined);

    const enemy = match.board.p2[0];
    const before = enemy.hp;
    turn(match, 'p1', { skill: CHIDORI, target: onEnemy() });
    assert.equal(before - enemy.hp, 45, 'Chidori deals 45 once unlocked');
});

test('Genin Naruto on the team awakens Sasuke from turn 1; other Narutos do not', () => {
    const withNaruto = matchFor([SASUKE, 'uzumaki-naruto'], ['haruno-sakura']);
    assert.ok(status(withNaruto.board.p1[0], AWAKENED));
    const withNarutoS = matchFor([SASUKE, 'uzumaki-naruto-s'], ['haruno-sakura']);
    assert.equal(status(withNarutoS.board.p1[0], AWAKENED), undefined);
    const alone = matchFor([SASUKE], ['uzumaki-naruto']);
    assert.equal(status(alone.board.p1[0], AWAKENED), undefined, 'an enemy Naruto does not count');
});

test('Ninja Wire Trap: hidden mark, stun if the target skips, Dragon Flame next turn with +15', () => {
    const match = matchFor([SASUKE], ['haruno-sakura', 'tenten', 'mizuki']);
    const [target, other] = match.board.p2;
    turn(match, 'p1', { skill: WIRE_TRAP, target: onEnemy(0) });
    const mark = status(target, MARK);
    assert.ok(mark);
    assert.equal(mark.metadata.hideTooltipFromUnitOwner, true, 'the mark is invisible to the marked enemy');
    turn(match, 'p2'); // the marked enemy uses no skill
    assert.equal(status(target, MARK), undefined);
    const stun = status(target, STUN);
    assert.ok(stun, 'skipping a skill stuns their Physical skills');
    assert.deepEqual(stun.metadata.cannotUseSkillClasses, ['physical']);
    assert.ok(!stun.metadata.hideTooltipFromUnitOwner, 'the stun is visible');

    assert.equal(effectiveSkillName(match, WIRE_TRAP), 'Dragon Flame Jutsu');
    const hpBefore = [target.hp, other.hp];
    turn(match, 'p1', { skill: WIRE_TRAP, target: onEnemy(0) });
    assert.equal(hpBefore[0] - target.hp, 35, '20 + 15 against the stunned target');
    assert.equal(hpBefore[1] - other.hp, 10, 'splash target without the stun takes 10');
    assert.equal(effectiveSkillName(match, WIRE_TRAP), 'Ninja Wire Trap', 'it switches back afterwards');
    assert.ok(status(target, STUN), 'the stun still covers their next turn');
    turn(match, 'p2');
    assert.equal(status(target, STUN), undefined);
});

test('Ninja Wire Trap does nothing if the target uses a skill; Dragon Flame still comes up', () => {
    const match = matchFor([SASUKE], ['haruno-sakura', 'tenten']);
    const target = match.board.p2[0];
    turn(match, 'p1', { skill: WIRE_TRAP, target: onEnemy(0) });
    turn(match, 'p2', { skill: 1, target: { username: 'p2', slot: 1 } }); // Guard Duty on an ally
    assert.equal(status(target, STUN), undefined);
    assert.equal(effectiveSkillName(match, WIRE_TRAP), 'Dragon Flame Jutsu');
    const before = target.hp;
    turn(match, 'p1', { skill: WIRE_TRAP, target: onEnemy(0) });
    assert.equal(before - target.hp, 20, 'no +15 without the stun');
});

test('Shadow Shuriken: first harmful attacker is trapped, their skill still lands, Dragon Flame comes up when the stun is active', () => {
    const match = matchFor([SASUKE], ['haruno-sakura', 'tenten']);
    const sasuke = match.board.p1[0];
    const [attacker, second] = match.board.p2;
    turn(match, 'p1', { skill: SHURIKEN, target: onEnemy(0) });
    const sasukeHp = sasuke.hp;
    match.pendingTurns.p2 = {
        queueOrder: [0, 1],
        queuedByActorSlot: {
            0: { skillIndex: 0, targetSelection: [onSasuke] },
            1: { skillIndex: 0, targetSelection: [onSasuke] },
        },
    };
    battle.resolvePendingTurnSkills({ match, actingUsername: 'p2', characters });
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    battle.tickCooldownsForTurnEnd({ match, endingUsername: 'p2' });
    assert.ok(sasuke.hp < sasukeHp, 'the attacker\'s skill is not countered');
    assert.ok(status(attacker, MARK), 'the first attacker is marked');
    assert.equal(status(second, MARK), undefined, 'only the first enemy is affected');

    turn(match, 'p1');
    assert.equal(effectiveSkillName(match, WIRE_TRAP), 'Ninja Wire Trap', 'no Dragon Flame before the trap resolves');
    turn(match, 'p2'); // the marked enemy now skips
    assert.ok(status(attacker, STUN));
    assert.equal(effectiveSkillName(match, WIRE_TRAP), 'Dragon Flame Jutsu');
    const before = attacker.hp;
    turn(match, 'p1', { skill: WIRE_TRAP, target: onEnemy(0) });
    assert.equal(before - attacker.hp, 35);
    assert.equal(effectiveSkillName(match, WIRE_TRAP), 'Ninja Wire Trap');
});

test('Shadow Shuriken trap: an attacker who keeps acting is not stunned', () => {
    const match = matchFor([SASUKE], ['tenten']);
    const attacker = match.board.p2[0];
    turn(match, 'p1', { skill: SHURIKEN, target: onEnemy(0) });
    turn(match, 'p2', { skill: 0, target: onSasuke });
    assert.ok(status(attacker, MARK));
    turn(match, 'p1');
    turn(match, 'p2', { skill: 0, target: onSasuke });
    assert.equal(status(attacker, STUN), undefined);
});

test('payloads hide the Wire Trap mark and Dragon Flame setup from the enemy, but show the stun', () => {
    const { buildMatchPayloadForUser } = require('../server.js');
    const visible = (match, viewer, side, id) =>
        buildMatchPayloadForUser(match, viewer).board[side][0].state.statuses.some((entry) => entry.id === id);
    const match = matchFor([SASUKE], ['haruno-sakura']);
    turn(match, 'p1', { skill: WIRE_TRAP, target: onEnemy(0) });
    assert.equal(visible(match, 'p2', 'p2', MARK), false, 'the marked enemy cannot see the mark');
    assert.equal(visible(match, 'p1', 'p2', MARK), true, 'Sasuke\'s player can see it');
    assert.equal(visible(match, 'p2', 'p1', 'uchiha_sasuke_dragon_flame_ready'), false);
    turn(match, 'p2');
    assert.equal(visible(match, 'p2', 'p2', STUN), true, 'the stun is visible once it triggers');

    const trapMatch = matchFor([SASUKE], ['tenten']);
    turn(trapMatch, 'p1', { skill: SHURIKEN, target: onEnemy(0) });
    assert.equal(visible(trapMatch, 'p2', 'p1', 'uchiha_sasuke_shadow_shuriken_trap'), false,
        'the Shadow Shuriken trap is hidden from enemies');
    assert.equal(visible(trapMatch, 'p1', 'p1', 'uchiha_sasuke_shadow_shuriken_trap'), true);
});

test('with Genin Naruto, the match-start payload already shows Sasuke awakened under one passive', () => {
    const { buildMatchPayloadForUser } = require('../server.js');
    const match = matchFor(['uzumaki-naruto', SASUKE], ['haruno-sakura']);
    const statuses = buildMatchPayloadForUser(match, 'p1').board.p1[1].state.statuses;
    const passive = statuses.find((entry) => entry.id === 'uchiha_sasuke_two_tomoe_sharingan');
    const awakened = statuses.find((entry) => entry.id === AWAKENED);
    assert.ok(awakened, 'awakened before any turn is played');
    // The client groups these two into one icon by passive name and hides the merged row.
    assert.equal(awakened.metadata.passiveAwakening, 'merged');
    assert.equal(awakened.sourceSkillId, null);
    assert.equal(passive.sourceSkillId, null);
    assert.equal(awakened.metadata.sourceSkillName, passive.metadata.sourceSkillName);
    assert.match(passive.metadata.tooltipText, /has awakened/);
    assert.ok(!passive.metadata.tooltipTextTemplate, 'no stale progress template');

    const solo = matchFor([SASUKE], ['haruno-sakura']);
    const soloPassive = buildMatchPayloadForUser(solo, 'p1').board.p1[0].state.statuses
        .find((entry) => entry.id === 'uchiha_sasuke_two_tomoe_sharingan');
    assert.match(soloPassive.metadata.tooltipText, /Skills used: 0\/4/, 'quest progress reaches the client');
});
