const assert = require('node:assert/strict');
const test = require('node:test');
const characters = require('../data/characters');
const battle = require('../battleLogic');

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
const effective = (match, username, slot, skillIndex) => battle.resolveEffectiveSkill({
    characters, rosterIndex: match.board[username][slot].rosterIndex, skillIndex,
    actorState: match.board[username][slot].state,
});
const cost = (match, username, slot, skillIndex) => battle.computeEffectiveEnergyCost({
    skill: effective(match, username, slot, skillIndex),
    actorState: match.board[username][slot].state,
});
const endTurn = (match, username) => {
    battle.tickStatusesForTurnEnd({ match, endingUsername: username });
    match.economy.turnCounts[username] += 1;
};

test('sound genin drafts match their skill names, costs, and cooldowns', () => {
    const kits = {
        'tsuchi-kin': [['Illusion Bell Needles', ['Genjutsu'], 2],
            ['Needle and Bell Trap', ['Random'], 0], ['Unnerving Bells', ['Genjutsu'], 1],
            ['Sharp Analysis', ['Random'], 4]],
        'dosu-kinuta': [['Vibrating Sound Drill', ['Taijutsu'], 0],
            ['Sound Manipulation', ['Genjutsu'], 2], ['Melody Arm Tuning', ['Random'], 2],
            ['Dosu Dodge', ['Random'], 4]],
        'zaku-abumi': [['Air Cutter', ['Bloodline'], 0], ['Sound Wall', ['Bloodline'], 2],
            ['Extreme Air Cutter', ['Bloodline', 'Random', 'Random'], 0],
            ['Sound Deflection', ['Random'], 4]],
    };
    for (const [id, skills] of Object.entries(kits)) {
        const character = characters[indexOf(id)];
        assert.equal(character.passive.name, 'Sound Trio');
        assert.deepEqual(character.skills.slice(0, 4).map((skill) =>
            [skill.name, skill.energy, skill.cooldown]), skills);
    }
});

test('Unnerving Bells taxes genjutsu, ticks affliction, fuels Sound Trio, and lasts at least 2 turns', () => {
    const match = matchFor(['tsuchi-kin', 'zaku-abumi'], ['haruno-sakura']);
    const sakura = match.board.p2[0];
    const sakuraBase = cost(match, 'p2', 0, 0);
    cast(match, 'p1', 0, 2, 'p2');
    assert.ok(status(sakura, 'tsuchi_kin_unnerving_bells'));
    assert.equal(cost(match, 'p2', 0, 0).reservedSpecific.genjutsu,
        sakuraBase.reservedSpecific.genjutsu + 1);
    assert.equal(battle.computeTargetOptions({
        characters, match, actingUsername: 'p1', actorSlot: 0, skillIndex: 2,
    }).targets.length, 0, 'Unnerving Bells cannot be reapplied to an affected enemy');
    endTurn(match, 'p1');
    assert.equal(sakura.hp, 90, "Unnerving Bells deals 10 affliction damage on Kin's turn");

    cast(match, 'p2', 0, 0, 'p1', 0);
    assert.ok(status(sakura, 'tsuchi_kin_unnerving_bells'),
        'using a skill on the first turn does not end Unnerving Bells');
    for (const unit of match.board.p1) {
        assert.ok(status(unit, 'sound_trio_physical_bonus'), 'each Sound Trio member is empowered');
    }
    endTurn(match, 'p2');
    const zakuTarget = sakura.hp;
    cast(match, 'p1', 1, 0, 'p2');
    assert.equal(sakura.hp, zakuTarget - 25, 'Air Cutter gains the Sound Trio bonus');
    endTurn(match, 'p1');
    assert.equal(status(match.board.p1[1], 'sound_trio_physical_bonus'), undefined,
        'the Sound Trio bonus lasts one turn');

    sakura.state.cooldowns = {};
    cast(match, 'p2', 0, 0, 'p1', 0);
    assert.ok(status(sakura, 'tsuchi_kin_unnerving_bells'),
        'using a skill on the second turn does not end Unnerving Bells');
    endTurn(match, 'p2');
    endTurn(match, 'p1');
    sakura.state.cooldowns = {};
    cast(match, 'p2', 0, 0, 'p1', 0);
    assert.equal(status(sakura, 'tsuchi_kin_unnerving_bells'), undefined,
        'after 2 turns, Unnerving Bells ends when the target uses a skill');
});

test('Needle and Bell Trap pierces and punishes Unnerving Bells targets', () => {
    const match = matchFor(['tsuchi-kin'], ['haruno-sakura', 'tenten']);
    cast(match, 'p1', 0, 1, 'p2', 1);
    assert.equal(match.board.p2[1].hp, 85, 'Needle and Bell Trap deals 15 piercing damage');
    assert.equal(status(match.board.p2[1], 'tsuchi_kin_needle_and_bell_trap_stun'), undefined);
    cast(match, 'p1', 0, 2, 'p2', 0);
    cast(match, 'p1', 0, 1, 'p2', 0);
    assert.equal(match.board.p2[0].hp, 80, 'Unnerving Bells targets take 5 extra damage');
    assert.deepEqual(status(match.board.p2[0], 'tsuchi_kin_needle_and_bell_trap_stun')
        .metadata.cannotUseSkillClasses, ['strategic']);
});

test('Illusion Bell Needles persists until it counters the next enemy skill on Kin', () => {
    const match = matchFor(['tsuchi-kin'], ['haruno-sakura']);
    cast(match, 'p1', 0, 0);
    endTurn(match, 'p1');
    endTurn(match, 'p2');
    endTurn(match, 'p1');
    assert.ok(status(match.board.p1[0], 'tsuchi_kin_illusion_bell_needles'));
    cast(match, 'p2', 0, 0, 'p1');
    assert.equal(match.board.p1[0].hp, 100);
    assert.equal(status(match.board.p1[0], 'tsuchi_kin_illusion_bell_needles'), undefined);
});

test('Vibrating Sound Drill marks permanently and taxes all skills; Sound Manipulation hits marked enemies through invulnerability', () => {
    const match = matchFor(['dosu-kinuta'], ['haruno-sakura', 'tenten']);
    const sakuraHideBase = cost(match, 'p2', 0, 3).requiredRandom;
    cast(match, 'p1', 0, 0, 'p2', 0);
    assert.equal(match.board.p2[0].hp, 80);
    assert.equal(status(match.board.p2[0], 'dosu_kinuta_vibrating_sound_drill').remainingTurns, 99,
        'the Drill mark is permanent');
    assert.equal(cost(match, 'p2', 0, 3).requiredRandom, sakuraHideBase + 1,
        'Drill makes every skill cost 1 additional random chakra');
    endTurn(match, 'p1');
    assert.equal(cost(match, 'p2', 0, 3).requiredRandom, sakuraHideBase + 1,
        'the tax applies on the enemy turn');
    endTurn(match, 'p2');
    endTurn(match, 'p1');
    assert.equal(cost(match, 'p2', 0, 3).requiredRandom, sakuraHideBase, 'the Drill tax lasts 1 turn');

    match.board.p2[0].state.statuses.push({ id: 'test_invulnerable', remainingTurns: 1,
        metadata: { invulnerable: true } });
    const tentenBase = cost(match, 'p2', 1, 0);
    cast(match, 'p1', 0, 1);
    assert.equal(match.board.p2[0].hp, 70, 'invulnerability is ignored');
    assert.equal(match.board.p2[1].hp, 100, 'unmarked enemies are unaffected');
    assert.equal(cost(match, 'p2', 0, 3).requiredRandom, sakuraHideBase + 1,
        'Sound Manipulation makes every skill cost 1 additional random chakra');
    assert.deepEqual(cost(match, 'p2', 1, 0), tentenBase);
    endTurn(match, 'p1');
    assert.equal(match.board.p2[0].hp, 70, 'the unenhanced skill does not deal damage over time');
    endTurn(match, 'p2');
    endTurn(match, 'p1');
    assert.equal(cost(match, 'p2', 0, 3).requiredRandom, sakuraHideBase,
        'the unenhanced tax lasts 1 turn');
});

test('Melody Arm Tuning enhances one Drill or Manipulation and cannot be recast while active', () => {
    const match = matchFor(['dosu-kinuta'], ['haruno-sakura', 'tenten']);
    cast(match, 'p1', 0, 2);
    assert.ok(status(match.board.p1[0], 'dosu_kinuta_melody_arm_tuning'));
    match.board.p1[0].state.cooldowns = {};
    const chakraBefore = { ...match.chakraPools.p1 };
    cast(match, 'p1', 0, 2);
    assert.deepEqual(match.chakraPools.p1, chakraBefore, 'Tuning cannot be used while active');
    cast(match, 'p1', 0, 0, 'p2', 0);
    assert.equal(status(match.board.p2[0], 'dosu_kinuta_vibrating_sound_drill').remainingTurns, 99);
    assert.equal(status(match.board.p1[0], 'dosu_kinuta_melody_arm_tuning'), undefined);
    assert.equal(effective(match, 'p1', 0, 0).id, 'dosu-kinuta-vibrating-sound-drill');
    cast(match, 'p1', 0, 0, 'p2', 0);
    assert.equal(status(match.board.p2[0], 'dosu_kinuta_vibrating_sound_drill').remainingTurns, 99,
        'a later normal Drill does not shorten the permanent mark');

    match.board.p1[0].state.cooldowns = {};
    cast(match, 'p1', 0, 2);
    cast(match, 'p1', 0, 1);
    assert.equal(match.board.p2[0].hp, 50);
    const sakuraHide = effective(match, 'p2', 0, 3);
    assert.equal(cost(match, 'p2', 0, 3).requiredRandom,
        battle.computeEffectiveEnergyCost({ skill: sakuraHide, actorState: { statuses: [] } })
            .requiredRandom + 1, 'the enhanced tax affects every skill once, without stacking with Drill');
    endTurn(match, 'p1');
    endTurn(match, 'p2');
    endTurn(match, 'p1');
    assert.equal(match.board.p2[0].hp, 40, 'enhanced Sound Manipulation hits again the following turn');
    assert.ok(status(match.board.p2[0], 'dosu_kinuta_sound_cost_increase'),
        'the enhanced tax lasts 1 additional turn');
    endTurn(match, 'p2');
    endTurn(match, 'p1');
    assert.equal(match.board.p2[0].hp, 40, 'the damage lasts two turns in total');
    assert.equal(status(match.board.p2[0], 'dosu_kinuta_sound_cost_increase'), undefined);
});

test('Extreme Air Cutter requires Air Cutter on the previous turn', () => {
    const match = matchFor(['zaku-abumi'], ['haruno-sakura', 'tenten']);
    cast(match, 'p1', 0, 2);
    assert.deepEqual(match.board.p2.map((unit) => unit.hp), [100, 100]);
    cast(match, 'p1', 0, 0, 'p2', 0);
    assert.equal(match.board.p2[0].hp, 80);
    endTurn(match, 'p1');
    endTurn(match, 'p2');
    cast(match, 'p1', 0, 2);
    assert.deepEqual(match.board.p2.map((unit) => unit.hp), [35, 55]);
    endTurn(match, 'p1');
    endTurn(match, 'p2');
    assert.equal(status(match.board.p1[0], 'zaku_abumi_air_cutter_follow_up'), undefined);
});

test('Sound Wall counters the first physical skill on Zaku team and grants bloodline chakra', () => {
    const match = matchFor(['zaku-abumi', 'tsuchi-kin'], ['haruno-sakura', 'tenten']);
    cast(match, 'p1', 0, 1);
    assert.ok(match.board.p1.every((unit) => status(unit, 'zaku_abumi_sound_wall')));
    const bloodline = match.chakraPools.p1.bloodline;
    endTurn(match, 'p1');
    cast(match, 'p2', 0, 0, 'p1', 1);
    assert.equal(match.board.p1[1].hp, 100, 'the physical skill is countered');
    assert.equal(match.chakraPools.p1.bloodline, bloodline + 1);
    assert.ok(match.board.p1.every((unit) => !status(unit, 'zaku_abumi_sound_wall')),
        'only the first physical skill is countered');
});

test('Sound Wall ends if Zaku dies', () => {
    const match = matchFor(['zaku-abumi', 'tsuchi-kin'], ['haruno-sakura']);
    cast(match, 'p1', 0, 1);
    match.board.p1[0].hp = 0;
    match.board.p1[0].alive = false;
    battle.purgeTetheredStatusesOnSourceDeath({ match, sourceUsername: 'p1', sourceSlot: 0 });
    assert.equal(status(match.board.p1[1], 'zaku_abumi_sound_wall'), undefined);
});

test('sound genin are included in the playable roster', () => {
    const { ACTIVE_ROSTER_IDS, isActiveCharacter } = require('../data/activeRoster');
    for (const id of ['dosu-kinuta', 'tsuchi-kin', 'zaku-abumi']) {
        assert.ok(ACTIVE_ROSTER_IDS.includes(id), `${id} is active`);
        assert.ok(isActiveCharacter(characters[indexOf(id)]), `${id} is present in the character seed`);
        assert.equal(characters[indexOf(id)].requiredMissionId,
            'chuunin-exam-the-forest-of-death');
    }
});
