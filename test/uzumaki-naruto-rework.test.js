const assert = require('node:assert/strict');
const test = require('node:test');
const characters = require('../data/characters');
const battle = require('../battleLogic');

const NARUTO = 'uzumaki-naruto';
const KYUUBI = 'uzumaki_naruto_kyuubi_awakening_awakened';
const CLONES = 'uzumaki_naruto_shadow_clones';
const RASENGAN_STUN = 'uzumaki_naruto_rasengan_stun';
const COMBO = 0;
const SHADOW_CLONES = 1;
const RASENGAN = 2;
const SEXY = 3;
const SAKURA_KICK = 0; // 20 physical damage
const SAKURA_HEALING = 2;

const indexOf = (id) => characters.findIndex((character) => character.id === id);
const pool = () => ({ taijutsu: 20, ninjutsu: 20, bloodline: 20, genjutsu: 20 });
const status = (unit, id) => unit.state.statuses.find((entry) => entry.id === id && entry.remainingTurns > 0);
const passiveOf = (unit) => unit.state.statuses.find((entry) => entry?.metadata?.passive === true);
const clonesOf = (unit) => Number(status(unit, CLONES)?.metadata?.shadowClones) || 0;
const chakraTotal = (match, username) => Object.values(match.chakraPools[username])
    .reduce((sum, value) => sum + (Number(value) || 0), 0);
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
const targetsFor = (match, skillIndex, slot = 0) => battle.computeTargetOptions({
    match, actingUsername: 'p1', actorSlot: slot, skillIndex, characters,
}).targets.map((target) => `${target.username}:${target.slot}`);
const enemy = (slot = 0) => ({ username: 'p2', slot });
const ally = (slot = 0) => ({ username: 'p1', slot });

test('Naruto kit: names, costs, cooldowns, and a quest passive', () => {
    const naruto = characters[indexOf(NARUTO)];
    assert.equal(naruto.passive.name, 'Kyuubi Awakening');
    assert.deepEqual(naruto.skills.map((skill) => [skill.name, skill.energy, skill.cooldown]), [
        ['Uzumaki Naruto Combo', ['Taijutsu'], 0],
        ['Shadow Clones', ['Random'], 2],
        ['Rasengan', ['Ninjutsu', 'Taijutsu'], 1],
        ['Sexy Technique', ['Random'], 4],
    ]);
    const match = matchFor([NARUTO], ['haku']);
    assert.match(passiveOf(match.board.p1[0]).metadata.tooltipText, /Skills used: 0\/4/);
});

test('Uzumaki Naruto Combo counts clones before gaining one', () => {
    const match = matchFor([NARUTO], ['haku']);
    const naruto = match.board.p1[0];
    const haku = match.board.p2[0];
    turn(match, 'p1', { skill: COMBO, target: enemy() });
    assert.equal(haku.hp, 80, '20 with no clones');
    assert.equal(clonesOf(naruto), 1);
    turn(match, 'p2');
    turn(match, 'p1', { skill: COMBO, target: enemy() });
    assert.equal(haku.hp, 55, '25 with one clone');
    assert.equal(clonesOf(naruto), 2);
});

test('Shadow Clones: 3 clones, 5 reduction each, one used up per damaging skill after it lands', () => {
    const match = matchFor([NARUTO], ['haruno-sakura']);
    const naruto = match.board.p1[0];
    turn(match, 'p1', { skill: SHADOW_CLONES, target: ally() });
    assert.equal(clonesOf(naruto), 3);
    assert.equal(status(naruto, CLONES).metadata.damageReductionFlat, 15);
    assert.match(status(naruto, CLONES).metadata.tooltipText, /3 Shadow Clones, giving 15 damage reduction/);

    turn(match, 'p2', { skill: SAKURA_KICK, target: ally() });
    assert.equal(naruto.hp, 95, 'the hit is reduced by all 3 clones (20 - 15)');
    assert.equal(clonesOf(naruto), 2);
    assert.equal(status(naruto, CLONES).metadata.damageReductionFlat, 10);
    turn(match, 'p1');
    turn(match, 'p2', { skill: SAKURA_KICK, target: ally() });
    assert.equal(naruto.hp, 85, '20 - 10');
    turn(match, 'p1');
    turn(match, 'p2', { skill: SAKURA_KICK, target: ally() });
    assert.equal(naruto.hp, 70, '20 - 5');
    assert.equal(status(naruto, CLONES), undefined, 'the last clone is gone');
});

test('recasting Shadow Clones adds to existing clones without a cap', () => {
    const match = matchFor([NARUTO], ['haku']);
    const naruto = match.board.p1[0];
    turn(match, 'p1', { skill: SHADOW_CLONES, target: ally() });
    // Cooldown 2: two of Naruto's turns pass before he can use it again.
    turn(match, 'p2'); turn(match, 'p1'); turn(match, 'p2'); turn(match, 'p1'); turn(match, 'p2');
    turn(match, 'p1', { skill: SHADOW_CLONES, target: ally() });
    assert.equal(clonesOf(naruto), 6);
    assert.equal(status(naruto, CLONES).metadata.damageReductionFlat, 30);
});

test('Rasengan needs 2 clones, keeps them, deals 40, stuns, and cuts the target off from allies', () => {
    const match = matchFor([NARUTO], ['haku', 'haruno-sakura']);
    const naruto = match.board.p1[0];
    const haku = match.board.p2[0];
    turn(match, 'p1', { skill: COMBO, target: enemy() });
    turn(match, 'p2');
    turn(match, 'p1', { skill: RASENGAN, target: enemy() });
    assert.equal(haku.hp, 80, 'one clone is not enough for Rasengan');
    turn(match, 'p2');
    turn(match, 'p1', { skill: COMBO, target: enemy() });
    assert.equal(clonesOf(naruto), 2);
    turn(match, 'p2');
    const hpBefore = haku.hp;
    turn(match, 'p1', { skill: RASENGAN, target: enemy() });
    assert.equal(haku.hp, hpBefore - 40);
    assert.equal(clonesOf(naruto), 2, 'Rasengan does not use up clones');
    const stun = status(haku, RASENGAN_STUN);
    assert.equal(stun?.metadata?.cannotUseSkills, true);
    assert.equal(stun?.metadata?.invulnerableToHelpfulSkills, true);
    turn(match, 'p2', { skill: SAKURA_HEALING, slot: 1, target: enemy() });
    assert.equal(haku.hp, hpBefore - 40, 'Haku\'s ally cannot heal him');
});

test('Sexy Technique targets only Naruto without clones, and any ally with them', () => {
    const match = matchFor([NARUTO, 'haku'], ['haruno-sakura']);
    assert.deepEqual(targetsFor(match, SEXY), ['p1:0']);
    turn(match, 'p1', { skill: SHADOW_CLONES, target: ally() });
    turn(match, 'p2');
    assert.deepEqual(targetsFor(match, SEXY).sort(), ['p1:0', 'p1:1']);
    turn(match, 'p1', { skill: SEXY, target: ally(1) });
    assert.ok(status(match.board.p1[1], 'invulnerable'), 'the ally becomes invulnerable');
    assert.equal(status(match.board.p1[0], 'invulnerable'), undefined);
});

test('the quest awakens the Kyuubi after 4 skills', () => {
    const match = matchFor([NARUTO], ['haku']);
    const naruto = match.board.p1[0];
    [COMBO, COMBO, COMBO].forEach((skill, index) => {
        turn(match, 'p1', { skill, target: enemy() });
        assert.equal(status(naruto, KYUUBI), undefined, `not awakened after skill ${index + 1}`);
        assert.match(passiveOf(naruto).metadata.tooltipText, new RegExp(`Skills used: ${index + 1}/4`));
        turn(match, 'p2');
    });
    turn(match, 'p1', { skill: COMBO, target: enemy() });
    assert.ok(status(naruto, KYUUBI), 'awakened after the 4th skill');
    assert.match(passiveOf(naruto).metadata.tooltipText, /The Kyuubi has awakened/);
});

test('Sakura on the team awakens the Kyuubi from turn 1; Sasuke does not', () => {
    assert.ok(status(matchFor([NARUTO, 'haruno-sakura'], ['haku']).board.p1[0], KYUUBI));
    assert.equal(status(matchFor([NARUTO, 'uchiha-sasuke'], ['haku']).board.p1[0], KYUUBI), undefined);
});

test('Kyuubi Awakening heals 5 each turn and enhances Shadow Clones and Rasengan', () => {
    const match = matchFor([NARUTO, 'haruno-sakura'], ['haku']);
    const naruto = match.board.p1[0];
    naruto.hp = 50;
    turn(match, 'p1', { skill: SHADOW_CLONES, target: ally() });
    assert.equal(naruto.hp, 55, 'heals 5 at the end of Naruto\'s turn');
    assert.equal(clonesOf(naruto), 4, 'an extra clone during Kyuubi Awakening');
    turn(match, 'p2');
    assert.equal(naruto.hp, 55, 'no heal on the enemy turn');
    const chakraBefore = chakraTotal(match, 'p1');
    turn(match, 'p1', { skill: RASENGAN, target: enemy() });
    // Costs are paid when queued on the server, not during resolution, so only the gain shows here.
    assert.equal(chakraTotal(match, 'p1'), chakraBefore + 1, 'Rasengan gives 1 random chakra');
});
