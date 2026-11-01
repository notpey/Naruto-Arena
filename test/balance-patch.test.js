const test = require('node:test');
const assert = require('node:assert/strict');
const characters = require('../data/characters');
const battle = require('../battleLogic');

const index = (id) => characters.findIndex((character) => character.characterId === id);
const pool = () => ({ taijutsu: 10, ninjutsu: 10, bloodline: 10, genjutsu: 10 });
const matchFor = (team1, team2) => {
    const players = [
        { username: 'p1', team: team1.map(index) },
        { username: 'p2', team: team2.map(index) },
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
const cast = (match, username, actorSlot, skillIndex, targetSlot = null) => {
    const enemy = username === 'p1' ? 'p2' : 'p1';
    match.pendingTurns[username] = {
        queueOrder: [actorSlot],
        queuedByActorSlot: { [actorSlot]: {
            skillIndex,
            targetSelection: targetSlot === null ? [] : [{ username: enemy, slot: targetSlot }],
        } },
    };
    battle.resolvePendingTurnSkills({ match, actingUsername: username, characters });
};
const status = (unit, id) => unit.state.statuses.find((entry) =>
    entry.id === id && entry.remainingTurns > 0);
const total = (chakra) => Object.values(chakra).reduce((sum, amount) => sum + amount, 0);

test('Naruto awakens once when damage first leaves him at 40 or less', () => {
    const match = matchFor(['uzumaki-naruto'], ['haruno-sakura']);
    const naruto = match.board.p1[0];
    const before = total(match.chakraPools.p1);
    battle.applyDamageToUnit(naruto, 60, {
        match, sourceUsername: 'p2', sourceSlot: 0, targetUsername: 'p1', targetSlot: 0,
    });
    assert.equal(naruto.hp, 60);
    assert.equal(total(match.chakraPools.p1), before + 1);
    battle.applyDamageToUnit(naruto, 30, {
        match, sourceUsername: 'p2', sourceSlot: 0, targetUsername: 'p1', targetSlot: 0,
    });
    assert.equal(naruto.hp, 30);
    assert.equal(total(match.chakraPools.p1), before + 1);
});

test('Haku takes the first lethal hit against an ally, then the passive is spent', () => {
    const match = matchFor(['haku', 'haruno-sakura'], ['mizuki']);
    const haku = match.board.p1[0];
    const ally = match.board.p1[1];
    ally.hp = 25;
    const attack = {
        match, sourceUsername: 'p2', sourceSlot: 0, targetUsername: 'p1', targetSlot: 1,
        skillClasses: ['Physical'],
    };
    battle.applyDamageToUnit(ally, 30, attack);
    assert.equal(ally.hp, 25);
    assert.equal(haku.hp, 70);
    battle.applyDamageToUnit(ally, 30, attack);
    assert.equal(ally.alive, false);
    assert.equal(haku.hp, 70);
});

test('Mizuki gains one Execution Shuriken use and invulnerability for a kill', () => {
    const match = matchFor(['mizuki'], ['haruno-sakura', 'hatake-kakashi', 'rock-lee']);
    const mizuki = match.board.p1[0];
    match.board.p2[0].hp = 35;
    cast(match, 'p1', 0, 1, 0);
    assert.equal(match.board.p2[0].alive, false);
    assert.ok(status(mizuki, 'mizuki_windmill_invulnerable'));
    assert.equal(mizuki.state.bonusSkillUses['mizuki-execution-shuriken'], 1);
    mizuki.state.cooldowns['mizuki-execution-shuriken'] = 0;
    cast(match, 'p1', 0, 1, 1);
    mizuki.state.cooldowns['mizuki-execution-shuriken'] = 0;
    assert.equal(battle.computeTargetOptions({ match, actingUsername: 'p1', actorSlot: 0,
        skillIndex: 1, characters }).targets.length > 0, true);
    cast(match, 'p1', 0, 1, 2);
    mizuki.state.cooldowns['mizuki-execution-shuriken'] = 0;
    assert.equal(battle.computeTargetOptions({ match, actingUsername: 'p1', actorSlot: 0,
        skillIndex: 1, characters }).targets.length, 0);
});

test('Mizuki Meld counters a Physical skill and hits the attacker with Kunai Ambush', () => {
    const match = matchFor(['mizuki'], ['uzumaki-naruto']);
    cast(match, 'p1', 0, 2);
    cast(match, 'p2', 0, 0, 0);
    assert.equal(match.board.p1[0].hp, 100);
    assert.equal(match.board.p2[0].hp, 80);
    assert.ok(status(match.board.p2[0], 'mizuki_kunai_ambush_trap'));
});

test('Haku mirrors make Needles and Acupuncture affect all enemies', () => {
    const match = matchFor(['haku'], ['haruno-sakura', 'uzumaki-naruto']);
    cast(match, 'p1', 0, 2);
    const haku = match.board.p1[0];
    assert.ok(status(haku, 'haku_mirror_guard'));
    assert.equal(battle.isUnitInvulnerableForSkill(haku, ['Physical']), true);
    assert.equal(battle.resolveEffectiveSkill({ characters, rosterIndex: haku.rosterIndex,
        skillIndex: 0, actorState: haku.state }).target, 'all-enemy');
    cast(match, 'p1', 0, 0);
    assert.deepEqual(match.board.p2.map((unit) => unit.hp), [70, 70]);
    cast(match, 'p1', 0, 1);
    assert.ok(match.board.p2.every((unit) => status(unit, 'haku_acupuncture_stun')));
});

test('Ino stun prepares one boosted Chakra Feint, while Switch no longer breaks Hair Strand Trap', () => {
    const match = matchFor(['yamanaka-ino'], ['haruno-sakura']);
    const enemy = match.board.p2[0];
    cast(match, 'p1', 0, 2, 0);
    assert.ok(status(enemy, 'ino_hair_strand_trap'));
    cast(match, 'p1', 0, 1, 0);
    assert.ok(status(enemy, 'ino_hair_strand_trap'));
    assert.ok(status(enemy, 'ino_mind_body_switch_target'));
    assert.ok(status(match.board.p1[0], 'yamanaka-ino-mind-transfer-feint_stun_bonus'));
    cast(match, 'p1', 0, 0, 0);
    assert.equal(enemy.hp, 65);
    assert.equal(status(match.board.p1[0], 'yamanaka-ino-mind-transfer-feint_stun_bonus'), undefined);
});

test('Konohamaru Strategic trigger stacks permanent non-affliction damage loss', () => {
    const match = matchFor(['sarutobi-konohamaru'], ['haruno-sakura']);
    const enemy = match.board.p2[0];
    cast(match, 'p1', 0, 1);
    assert.ok(status(enemy, 'konohamaru_sexy_jutsu_debuff'));
    cast(match, 'p2', 0, 3);
    assert.equal(status(enemy, 'konohamaru_sexy_jutsu_permanent_debuff')?.metadata.nonAfflictionDamageDebuffFlat, 5);
    enemy.state.cooldowns[characters[enemy.rosterIndex].skills[3].id] = 0;
    cast(match, 'p2', 0, 3);
    assert.equal(status(enemy, 'konohamaru_sexy_jutsu_permanent_debuff')?.metadata.nonAfflictionDamageDebuffFlat, 10);
});
