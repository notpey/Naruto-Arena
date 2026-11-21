const assert = require('node:assert/strict');
const test = require('node:test');
const characters = require('../data/characters');
const battle = require('../battleLogic');

const SAKURA = 'haruno-sakura';
const INNER = 'haruno_sakura_inner_sakura_awakened';
const MARK = 'haruno_sakura_stunned_sakuras_team';
const OVERWHELM_STUN = 'haruno_sakura_mental_overwhelm_stun';
const KICK = 0;
const OVERWHELM = 1;
const HEALING = 2;
const CLONE = 3;
const HAKU_ACUPUNCTURE = 1; // stuns Physical and Chakra skills
const GAARA_COFFIN = 0; // full stun

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
const overwhelmTargets = (match, slot = 0) => battle.computeTargetOptions({
    match, actingUsername: 'p1', actorSlot: slot, skillIndex: OVERWHELM, characters,
}).targets.map((target) => `${target.username}:${target.slot}`);
// With both other Team 7 members (2/4), two Rudimentary Healings complete Sakura's quest.
const awakenWithTeam7 = (match) => {
    [0, 1].forEach(() => {
        turn(match, 'p1', { skill: HEALING, target: { username: 'p1', slot: 0 } });
        turn(match, 'p2');
    });
    assert.ok(status(match.board.p1[0], INNER), 'Inner Sakura awakened after 2 skills');
};
const enemy = (slot = 0) => ({ username: 'p2', slot });
const ally = (slot = 0) => ({ username: 'p1', slot });

test('Sakura kit: names, costs, cooldowns, and a quest passive', () => {
    const sakura = characters[indexOf(SAKURA)];
    assert.equal(sakura.passive.name, 'Inner Sakura');
    assert.deepEqual(sakura.skills.map((skill) => [skill.name, skill.energy, skill.cooldown]), [
        ['Sakura Kick', ['Taijutsu'], 0],
        ['Mental Overwhelm', ['Genjutsu'], 0],
        ['Rudimentary Healing', ['Ninjutsu'], 0],
        ['Clone Technique', ['Random'], 4],
        ['Mental Overwhelm', ['Genjutsu'], 0],
    ]);
    const match = matchFor([SAKURA], ['haku']);
    assert.match(passiveOf(match.board.p1[0]).metadata.tooltipText, /Progress: 0\/4/);
    assert.deepEqual(overwhelmTargets(match), [], 'no enemy has stunned Sakura\'s team yet');
});

test('Sakura Kick deals 20 and stops the target from being healed for 1 turn', () => {
    const match = matchFor([SAKURA], [SAKURA]);
    const target = match.board.p2[0];
    turn(match, 'p1', { skill: KICK, target: enemy() });
    assert.equal(target.hp, 80);
    turn(match, 'p2', { skill: HEALING, target: enemy() });
    assert.equal(target.hp, 80, 'healing is ignored during the enemy turn after the kick');
    turn(match, 'p1');
    turn(match, 'p2', { skill: HEALING, target: enemy() });
    assert.equal(target.hp, 100, 'healing works again once the effect ends');
});

test('Rudimentary Healing gains a permanent +5 from each other skill, once per skill', () => {
    const match = matchFor([SAKURA, 'uzumaki-naruto'], ['haku']);
    const sakura = match.board.p1[0];
    const heal = () => {
        sakura.hp = 40;
        turn(match, 'p1', { skill: HEALING, target: ally() });
        const healed = sakura.hp - 40;
        turn(match, 'p2');
        return healed;
    };
    assert.equal(heal(), 20);
    turn(match, 'p1', { skill: KICK, target: enemy() }); turn(match, 'p2');
    assert.equal(heal(), 25, 'Sakura Kick adds 5');
    turn(match, 'p1', { skill: KICK, target: enemy() }); turn(match, 'p2');
    assert.equal(heal(), 25, 'a second Sakura Kick does not stack');
    turn(match, 'p1', { skill: CLONE, target: ally() }); turn(match, 'p2');
    assert.equal(heal(), 30, 'Clone Technique adds its own 5');
    // Haku stuns Naruto, so Mental Overwhelm becomes usable on Haku.
    turn(match, 'p2', { skill: HAKU_ACUPUNCTURE, target: ally(1) });
    turn(match, 'p1', { skill: OVERWHELM, target: enemy() }); turn(match, 'p2');
    assert.equal(heal(), 35, 'Mental Overwhelm adds its own 5, for +15 in total');
});

test('Mental Overwhelm targets an enemy who stunned Sakura\'s team and copies the stunned classes', () => {
    const match = matchFor([SAKURA, 'uzumaki-naruto'], ['haku', 'gaara-of-the-desert']);
    const haku = match.board.p2[0];
    turn(match, 'p1');
    turn(match, 'p2', { skill: HAKU_ACUPUNCTURE, target: ally(1) });
    assert.ok(status(match.board.p1[1], 'haku_acupuncture_stun'), 'Haku stunned Naruto');
    assert.ok(status(haku, MARK), 'Haku is marked for stunning Sakura\'s team');
    assert.deepEqual(overwhelmTargets(match), ['p2:0'], 'only Haku can be targeted');

    turn(match, 'p1', { skill: OVERWHELM, target: enemy() });
    const stun = status(haku, OVERWHELM_STUN);
    assert.ok(stun, 'Haku is stunned by Mental Overwhelm');
    assert.deepEqual(stun.metadata.cannotUseSkillClasses, ['physical', 'chakra']);
    assert.ok(!stun.metadata.cannotUseSkills, 'a copied partial stun is not a full stun');
    assert.equal(stun.metadata.tooltipText, 'Stunned by Mental Overwhelm: Physical skills and Chakra skills.');
    assert.equal(haku.hp, 100, 'no damage outside Inner Sakura');
    assert.equal(status(haku, MARK), undefined, 'the mark ends with Sakura\'s turn');

    // Haku's Acupuncture is a Physical skill, so it is stunned this turn.
    const narutoStatusesBefore = match.board.p1[1].state.statuses.length;
    turn(match, 'p2', { skill: HAKU_ACUPUNCTURE, target: ally(1) });
    assert.equal(status(match.board.p1[1], 'haku_acupuncture_stun'), undefined);
    assert.ok(match.board.p1[1].state.statuses.length <= narutoStatusesBefore);
});

test('Mental Overwhelm copies a full stun as a full stun, and the window closes after Sakura\'s turn', () => {
    const match = matchFor([SAKURA, 'uzumaki-naruto'], ['gaara-of-the-desert']);
    const gaara = match.board.p2[0];
    turn(match, 'p1');
    turn(match, 'p2', { skill: GAARA_COFFIN, target: ally(1) });
    assert.deepEqual(overwhelmTargets(match), ['p2:0']);
    turn(match, 'p1');
    assert.deepEqual(overwhelmTargets(match), [], 'unused, the chance ends with Sakura\'s turn');

    // Sand Binding Coffin has a 1-turn cooldown; wait a round before Gaara uses it again.
    turn(match, 'p2');
    turn(match, 'p1');
    assert.deepEqual(overwhelmTargets(match), [], 'a turn without a stun does not mark Gaara');
    turn(match, 'p2', { skill: GAARA_COFFIN, target: ally(1) });
    assert.deepEqual(overwhelmTargets(match), ['p2:0']);
    turn(match, 'p1', { skill: OVERWHELM, target: enemy() });
    assert.equal(status(gaara, OVERWHELM_STUN)?.metadata?.cannotUseSkills, true);
});

test('the quest awakens Inner Sakura after 4 skills', () => {
    const match = matchFor([SAKURA], ['haku']);
    const sakura = match.board.p1[0];
    [KICK, KICK, CLONE].forEach((skill, index) => {
        turn(match, 'p1', { skill, target: skill === CLONE ? ally() : enemy() });
        assert.equal(status(sakura, INNER), undefined, `not awakened after skill ${index + 1}`);
        assert.match(passiveOf(sakura).metadata.tooltipText, new RegExp(`Progress: ${index + 1}/4`));
        turn(match, 'p2');
    });
    turn(match, 'p1', { skill: KICK, target: enemy() });
    assert.ok(status(sakura, INNER), 'awakened after the 4th skill');
    assert.match(passiveOf(sakura).metadata.tooltipText, /Inner Sakura has awakened/);
});

test('each other Team 7 member adds 1 quest progress; none awakens Inner Sakura at once', () => {
    const progressOf = (allies) => passiveOf(matchFor(allies, ['haku']).board.p1[0]).metadata.awakeningSkillUses || 0;
    assert.equal(progressOf([SAKURA, 'haku']), 0);
    assert.equal(progressOf([SAKURA, 'uchiha-sasuke']), 1);
    assert.equal(progressOf([SAKURA, 'uzumaki-naruto']), 1);
    assert.equal(progressOf([SAKURA, 'uchiha-sasuke', 'uzumaki-naruto']), 2);
    const match = matchFor([SAKURA, 'uchiha-sasuke', 'uzumaki-naruto'], ['haku']);
    assert.equal(status(match.board.p1[0], INNER), undefined, 'not awakened before any skill');
    assert.match(passiveOf(match.board.p1[0]).metadata.tooltipText, /Progress: 2\/4/);
    awakenWithTeam7(match);
});

test('Inner Sakura ignores partial stuns but not full stuns', () => {
    const match = matchFor([SAKURA, 'uchiha-sasuke', 'uzumaki-naruto'], ['haku', 'gaara-of-the-desert']);
    awakenWithTeam7(match);
    const sakura = match.board.p1[0];
    turn(match, 'p1');
    turn(match, 'p2', { skill: HAKU_ACUPUNCTURE, target: ally() });
    assert.equal(status(sakura, 'haku_acupuncture_stun'), undefined, 'the partial stun is ignored');
    turn(match, 'p1');
    turn(match, 'p2', { skill: GAARA_COFFIN, slot: 1, target: ally() });
    assert.ok(status(sakura, 'gaara_sand_binding_coffin_stun'), 'a full stun still lands');
});

test('Inner Sakura\'s Mental Overwhelm fully stuns and deals 20 affliction damage', () => {
    const match = matchFor([SAKURA, 'uchiha-sasuke', 'uzumaki-naruto'], ['haku']);
    awakenWithTeam7(match);
    const haku = match.board.p2[0];
    const effective = battle.resolveEffectiveSkill({
        characters, rosterIndex: match.board.p1[0].rosterIndex, skillIndex: OVERWHELM,
        actorState: match.board.p1[0].state,
    });
    assert.equal(effective.id, 'haruno-sakura-inner-mental-overwhelm');
    assert.ok(effective.classes.includes('Affliction'));
    turn(match, 'p1');
    turn(match, 'p2', { skill: HAKU_ACUPUNCTURE, target: ally(1) });
    turn(match, 'p1', { skill: OVERWHELM, target: enemy() });
    assert.equal(haku.hp, 80);
    assert.equal(status(haku, OVERWHELM_STUN)?.metadata?.cannotUseSkills, true,
        'a full stun even though Haku only used a partial stun');
});
