const assert = require('node:assert/strict');
const test = require('node:test');
const characters = require('../data/characters');
const battle = require('../battleLogic');
const { ACTIVE_ROSTER_IDS } = require('../data/activeRoster');
const { buildMatchPayloadForUser } = require('../server');

const indexOf = (id) => characters.findIndex((character) => character.id === id);
const character = (id) => characters[indexOf(id)];
const pool = () => ({ taijutsu: 10, ninjutsu: 10, bloodline: 10, genjutsu: 10 });
const totalChakra = (match, username) => Object.values(match.chakraPools[username])
    .reduce((sum, value) => sum + value, 0);
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
const skillIndexOf = (match, username, actorSlot, skillId) => {
    const index = characters[match.board[username][actorSlot].rosterIndex].skills
        .findIndex((skill) => skill.id === skillId);
    assert.ok(index >= 0, `unknown skill ${skillId}`);
    return index;
};
const cast = (match, username, actorSlot, skillId, targetUsername = null, targetSlot = 0) => {
    match.pendingTurns[username] = {
        queueOrder: [actorSlot],
        queuedByActorSlot: { [actorSlot]: {
            skillIndex: skillIndexOf(match, username, actorSlot, skillId),
            targetSelection: targetUsername ? [{ username: targetUsername, slot: targetSlot }] : [],
        } },
    };
    battle.resolvePendingTurnSkills({ match, actingUsername: username, characters });
};
const endTurn = (match, username) => battle.tickStatusesForTurnEnd({ match, endingUsername: username });
const targets = (match, username, actorSlot, skillId) => battle.computeTargetOptions({
    characters, match, actingUsername: username, actorSlot,
    skillIndex: skillIndexOf(match, username, actorSlot, skillId),
}).targets.map((target) => `${target.username}:${target.slot}`);
const addStatus = (unit, statusId, metadata, source = { username: 'p2', slot: 0 }, duration = 9) =>
    battle.applyStatus({ targetState: unit.state, statusId, duration, sourceSkillId: null,
        sourceUsername: source.username, sourceSlot: source.slot,
        metadata: { tooltipText: statusId, ...metadata } });
const kill = (unit) => { unit.hp = 0; unit.alive = false; };
const visibleTo = (match, viewer, unitUsername, slot, statusId) =>
    buildMatchPayloadForUser(match, viewer).board[unitUsername][slot].state.statuses
        .some((entry) => entry.id === statusId);
const hpOf = (match, username) => match.board[username].map((unit) => unit.hp);

const TACTICS_MARK = 'nara_shikamaru_ninja_tactics_mark';

test('Team Minato kits match the drafts and join the playable roster', () => {
    const kit = (id) => character(id).skills.map((skill) =>
        [skill.name, skill.energy, skill.cooldown, skill.target, skill.classes]);
    assert.deepEqual(kit('nohara-rin'), [
        ['Pit Trap', ['Genjutsu'], 0, 'single-enemy', ['Physical', 'Instant']],
        ['Healing Touch', ['Ninjutsu'], 0, 'single-ally', ['Strategic', 'Instant']],
        ['Medical Kit', ['Random', 'Random'], 3, 'single-ally', ['Strategic', 'Instant']],
        ['Rin Flee', ['Random'], 4, 'self', ['Strategic', 'Instant']],
    ]);
    assert.deepEqual(kit('young-kakashi'), [
        ['White Fang Slash', ['Taijutsu'], 0, 'single-enemy', ['Physical', 'Instant']],
        ['Amateur Raikiri', ['Ninjutsu'], 0, 'single-enemy', ['Chakra', 'Instant']],
        ['Implanted Sharingan', [], 3, 'self', ['Strategic', 'Instant']],
        ['Sword Parry', ['Random'], 4, 'self', ['Strategic', 'Instant']],
    ]);
    assert.deepEqual(kit('uchiha-obito'), [
        ['Piercing Stab', ['Random'], 0, 'single-enemy', ['Physical', 'Instant']],
        ['Obito Goukakyuu no Jutsu', ['Ninjutsu'], 1, 'all-enemy', ['Chakra', 'Instant']],
        ['Parting Gift', ['Bloodline'], 0, 'single-ally', ['Strategic', 'Affliction*', 'Instant']],
        ['Sparkling Parry', ['Random'], 4, 'self', ['Strategic', 'Instant']],
    ]);
    assert.deepEqual(['nohara-rin', 'young-kakashi', 'uchiha-obito'].map((id) => character(id).passive.name),
        ['Caretaker', 'Lone Wolf', 'Obito Sharingan']);
    for (const id of ['young-kakashi', 'uchiha-obito', 'nohara-rin']) {
        assert.ok(ACTIVE_ROSTER_IDS.includes(id));
        assert.equal(character(id).requiredMissionId, undefined, `${id} has no unlock mission`);
    }
});

test('Pit Trap is hidden from the trapped team and springs for 15 piercing damage at the end of their turn', () => {
    const match = matchFor(['nohara-rin'], ['uzumaki-naruto']);
    const [rin] = match.board.p1;
    const [naruto] = match.board.p2;
    addStatus(naruto, 'test_reduction', { helpful: true, damageReductionFlat: 10 }, { username: 'p2', slot: 0 });
    cast(match, 'p1', 0, 'nohara-rin-pit-trap', 'p2', 0);

    assert.ok(status(naruto, 'nohara_rin_pit_trap'));
    assert.equal(visibleTo(match, 'p2', 'p2', 0, 'nohara_rin_pit_trap'), false, 'the trap is invisible to its target');
    assert.equal(visibleTo(match, 'p1', 'p2', 0, 'nohara_rin_pit_trap'), true, "Rin's team sees the trap");
    assert.equal(visibleTo(match, 'p1', 'p2', 0, 'nohara_rin_pit_trap_trigger'), false, 'bookkeeping stays hidden');
    assert.equal(visibleTo(match, 'p2', 'p1', 0, 'nohara_rin_pit_trap_guard'), false,
        "Rin's damage reduction does not reveal the trap");
    assert.equal(visibleTo(match, 'p1', 'p1', 0, 'nohara_rin_pit_trap_guard'), true);

    endTurn(match, 'p1');
    assert.equal(naruto.hp, 100, "the trap does not spring at the end of Rin's turn");
    cast(match, 'p2', 0, 'uzumaki-naruto-demon-wind-shuriken-feint', 'p1', 0);
    assert.equal(rin.hp, 85, 'Rin has 10 damage reduction while the trap is set');
    endTurn(match, 'p2');
    assert.equal(naruto.hp, 80, '15 piercing from the trap plus 5 from using a physical skill');
    assert.equal(status(naruto, 'nohara_rin_pit_trap'), undefined, 'the trap ends once it springs');
    assert.equal(status(rin, 'nohara_rin_pit_trap_guard'), undefined, 'the damage reduction ends with the trap');

    for (const expected of [75, 70, 70]) {
        endTurn(match, 'p1');
        endTurn(match, 'p2');
        assert.equal(naruto.hp, expected, 'the wound deals 5 piercing damage on each of 3 turns');
    }
});

test('Pit Trap only wounds an enemy who uses a physical skill', () => {
    const match = matchFor(['nohara-rin'], ['nara-shikamaru']);
    const [shikamaru] = match.board.p2;
    cast(match, 'p1', 0, 'nohara-rin-pit-trap', 'p2', 0);
    endTurn(match, 'p1');
    cast(match, 'p2', 0, 'nara-shikamaru-meditate', 'p1', 0);
    assert.equal(status(shikamaru, 'nohara_rin_pit_trap_wound'), undefined);
    endTurn(match, 'p2');
    assert.equal(shikamaru.hp, 85);
    endTurn(match, 'p1');
    endTurn(match, 'p2');
    assert.equal(shikamaru.hp, 85);
});

test('Pit Trap keeps its piercing damage and concealment against Flak Jacket', () => {
    const match = matchFor(['nohara-rin'], ['baki']);
    const [baki] = match.board.p2;
    cast(match, 'p2', 0, 'baki-flak-jacket');
    cast(match, 'p1', 0, 'nohara-rin-pit-trap', 'p2', 0);
    const trap = status(baki, 'nohara_rin_pit_trap');
    assert.equal(trap.metadata.turnEndDamage, 15);
    assert.equal(trap.metadata.ignoreTargetDamageReduction, true);
    assert.equal(visibleTo(match, 'p2', 'p2', 0, 'nohara_rin_pit_trap'), false);
    assert.equal(status(baki, 'nohara_rin_pit_trap_trigger'), undefined,
        'Baki ignores the non-damage follow-up while his defense holds');
});

test('Healing Touch heals another ally, adds Caretaker at 50 health or less, and removes enemy afflictions', () => {
    const match = matchFor(['nohara-rin', 'haruno-sakura'], ['uzumaki-naruto']);
    const ally = match.board.p1[1];
    assert.deepEqual(targets(match, 'p1', 0, 'nohara-rin-healing-touch'), ['p1:1'], 'Rin cannot target herself');
    ally.hp = 70;
    addStatus(ally, 'enemy_poison', { harmful: true, afflictionDamage: true, turnEndDamage: 5 });
    addStatus(ally, 'enemy_weakness', { harmful: true, damageDebuffFlat: 5 });
    cast(match, 'p1', 0, 'nohara-rin-healing-touch', 'p1', 1);
    assert.equal(ally.hp, 90);
    assert.equal(status(ally, 'enemy_poison'), undefined, 'enemy affliction is removed');
    assert.ok(status(ally, 'enemy_weakness'), 'other harmful effects stay');

    ally.hp = 50;
    cast(match, 'p1', 0, 'nohara-rin-healing-touch', 'p1', 1);
    assert.equal(ally.hp, 75, 'Caretaker adds 5 at 50 health');
    ally.hp = 51;
    cast(match, 'p1', 0, 'nohara-rin-healing-touch', 'p1', 1);
    assert.equal(ally.hp, 71, 'no Caretaker bonus above 50 health');
});

test('Medical Kit heals for 3 turns and on physical or chakra skill use, with Caretaker', () => {
    const match = matchFor(['nohara-rin', 'young-kakashi'], ['uzumaki-naruto']);
    const kakashi = match.board.p1[1];
    assert.deepEqual(targets(match, 'p1', 0, 'nohara-rin-medical-kit'), ['p1:1']);
    kakashi.hp = 40;
    cast(match, 'p1', 0, 'nohara-rin-medical-kit', 'p1', 1);
    assert.equal(kakashi.hp, 40);
    endTurn(match, 'p1');
    assert.equal(kakashi.hp, 55, '10 plus 5 from Caretaker at the end of the turn it is used');
    endTurn(match, 'p2');

    cast(match, 'p1', 1, 'young-kakashi-implanted-sharingan');
    assert.equal(kakashi.hp, 55, 'strategic skills do not trigger the extra heal');
    cast(match, 'p1', 1, 'young-kakashi-white-fang-slash', 'p2', 0);
    assert.equal(kakashi.hp, 65, 'a physical skill heals 10');
    endTurn(match, 'p1');
    assert.equal(kakashi.hp, 75);
    endTurn(match, 'p2');

    kakashi.hp = 30;
    cast(match, 'p1', 1, 'young-kakashi-amateur-raikiri', 'p2', 0);
    assert.equal(kakashi.hp, 45, 'a chakra skill heals 10, plus 5 from Caretaker');
    endTurn(match, 'p1');
    assert.equal(kakashi.hp, 60, 'third and final turn of healing');
    assert.equal(status(kakashi, 'nohara_rin_medical_kit'), undefined);
    endTurn(match, 'p2');
    cast(match, 'p1', 1, 'young-kakashi-white-fang-slash', 'p2', 0);
    endTurn(match, 'p1');
    assert.equal(kakashi.hp, 60);
});

test('Rin Flee makes Rin invulnerable for 1 turn', () => {
    const match = matchFor(['nohara-rin'], ['uzumaki-naruto']);
    cast(match, 'p1', 0, 'nohara-rin-flee');
    assert.deepEqual(targets(match, 'p2', 0, 'uzumaki-naruto-demon-wind-shuriken-feint'), []);
});

test('White Fang Slash and Amateur Raikiri pierce and empower each other for 1 turn', () => {
    const match = matchFor(['young-kakashi'], ['haruno-sakura']);
    const [kakashi] = match.board.p1;
    const [sakura] = match.board.p2;
    addStatus(sakura, 'test_reduction', { helpful: true, damageReductionFlat: 10 });

    cast(match, 'p1', 0, 'young-kakashi-white-fang-slash', 'p2', 0);
    assert.equal(sakura.hp, 80, '20 piercing damage');
    assert.ok(status(sakura, 'young_kakashi_white_fang_slash_mark'));
    assert.equal(status(sakura, 'young_kakashi_amateur_raikiri_mark'), undefined);
    assert.ok(status(kakashi, 'young_kakashi_amateur_raikiri_empowered'));
    assert.equal(status(kakashi, 'young_kakashi_white_fang_slash_empowered'), undefined);
    endTurn(match, 'p1');
    endTurn(match, 'p2');

    cast(match, 'p1', 0, 'young-kakashi-amateur-raikiri', 'p2', 0);
    assert.equal(sakura.hp, 55, 'Amateur Raikiri deals 5 additional damage after White Fang Slash');
    assert.ok(status(sakura, 'young_kakashi_amateur_raikiri_mark'));
    endTurn(match, 'p1');
    assert.equal(status(sakura, 'young_kakashi_white_fang_slash_mark'), undefined, 'the mark lasts 1 turn');
    endTurn(match, 'p2');

    cast(match, 'p1', 0, 'young-kakashi-white-fang-slash', 'p2', 0);
    assert.equal(sakura.hp, 30, 'White Fang Slash deals 5 additional damage after Amateur Raikiri');
    endTurn(match, 'p1');
    endTurn(match, 'p2');
    cast(match, 'p1', 0, 'young-kakashi-white-fang-slash', 'p2', 0);
    assert.equal(sakura.hp, 10, 'White Fang Slash does not empower itself');
});

test("White Fang Slash makes an enemy's chakra removal and stealing take 1 less chakra", () => {
    const setup = (marked) => {
        const match = matchFor(['young-kakashi'], ['neji-hyuuga', 'aburame-shino']);
        if (marked) {
            cast(match, 'p1', 0, 'young-kakashi-white-fang-slash', 'p2', 0);
            cast(match, 'p1', 0, 'young-kakashi-white-fang-slash', 'p2', 1);
        }
        endTurn(match, 'p1');
        match.board.p2[1].state.cooldowns = {};
        cast(match, 'p2', 0, 'neji-hyuuga-eight-trigrams-sixty-four-palms', 'p1', 0);
        cast(match, 'p2', 1, 'aburame-shino-chakra-leach', 'p1', 0);
        return match;
    };
    const marked = setup(true);
    assert.equal(totalChakra(marked, 'p1'), 40, 'removing and stealing 1 chakra becomes 0');
    assert.equal(totalChakra(marked, 'p2'), 40);

    const unmarked = setup(false);
    assert.equal(totalChakra(unmarked, 'p1'), 38, 'Neji removes 1 and Shino steals 1');
    assert.equal(totalChakra(unmarked, 'p2'), 41);
});

test("Amateur Raikiri makes an enemy's stuns last 1 less turn", () => {
    const setup = (marked) => {
        const match = matchFor(['young-kakashi', 'haruno-sakura'], ['uzumaki-naruto', 'nara-shikamaru']);
        match.board.p1.forEach((unit) => addStatus(unit, TACTICS_MARK, { harmful: true },
            { username: 'p2', slot: 1 }, 99));
        if (marked) {
            cast(match, 'p1', 0, 'young-kakashi-amateur-raikiri', 'p2', 0);
            cast(match, 'p1', 0, 'young-kakashi-amateur-raikiri', 'p2', 1);
        }
        endTurn(match, 'p1');
        cast(match, 'p2', 0, 'uzumaki-naruto-demon-wind-shuriken-feint', 'p1', 0);
        cast(match, 'p2', 1, 'nara-shikamaru-shadow-imitation');
        return match;
    };
    const marked = setup(true);
    assert.equal(status(marked.board.p1[0], 'uzumaki_naruto_rasengan_stun'), undefined, 'a 1-turn stun does not land');
    assert.equal(marked.board.p1[0].hp, 75, 'the damage still lands');
    assert.deepEqual(marked.board.p1.map((unit) =>
        status(unit, 'nara_shikamaru_shadow_imitation')?.remainingTurns), [1, 1], 'a 2-turn stun lasts 1 turn');

    const unmarked = setup(false);
    assert.equal(status(unmarked.board.p1[0], 'uzumaki_naruto_rasengan_stun')?.remainingTurns, 1);
    assert.deepEqual(unmarked.board.p1.map((unit) =>
        status(unit, 'nara_shikamaru_shadow_imitation')?.remainingTurns), [2, 2]);
});

test('Implanted Sharingan shares non-damage effects, cannot be recast while active, and is extended by marked enemies', () => {
    const match = matchFor(['young-kakashi', 'haruno-sakura'], ['nara-shikamaru', 'neji-hyuuga']);
    const [kakashi] = match.board.p1;
    const [shikamaru, neji] = match.board.p2;
    match.board.p1.forEach((unit) => addStatus(unit, TACTICS_MARK, { harmful: true },
        { username: 'p2', slot: 0 }, 99));
    const sharingan = () => status(kakashi, 'young_kakashi_implanted_sharingan');

    cast(match, 'p1', 0, 'young-kakashi-implanted-sharingan');
    assert.equal(sharingan().remainingTurns, 2);
    kakashi.state.cooldowns = {};
    assert.deepEqual(targets(match, 'p1', 0, 'young-kakashi-implanted-sharingan'), [],
        'cannot be used while active, even off cooldown');
    endTurn(match, 'p1');
    endTurn(match, 'p2');

    cast(match, 'p1', 0, 'young-kakashi-white-fang-slash', 'p2', 0);
    cast(match, 'p1', 0, 'young-kakashi-amateur-raikiri', 'p2', 1);
    for (const enemy of [shikamaru, neji]) {
        assert.ok(status(enemy, 'young_kakashi_white_fang_slash_mark'));
        assert.ok(status(enemy, 'young_kakashi_amateur_raikiri_mark'));
    }
    assert.ok(status(kakashi, 'young_kakashi_white_fang_slash_empowered'));
    assert.ok(status(kakashi, 'young_kakashi_amateur_raikiri_empowered'));
    endTurn(match, 'p1');
    assert.equal(sharingan().remainingTurns, 1);

    cast(match, 'p2', 0, 'nara-shikamaru-shadow-imitation');
    assert.deepEqual(match.board.p1.map((unit) =>
        status(unit, 'nara_shikamaru_shadow_imitation')?.remainingTurns), [1, 1]);
    assert.equal(sharingan().remainingTurns, 2, 'one stun skill extends it once, however many it hits');
    cast(match, 'p2', 1, 'neji-hyuuga-eight-trigrams-sixty-four-palms', 'p1', 1);
    assert.equal(totalChakra(match, 'p1'), 40);
    assert.equal(sharingan().remainingTurns, 3, 'a second marked enemy extends it again');
});

test('Implanted Sharingan is not extended by unmarked enemies or while inactive', () => {
    const match = matchFor(['young-kakashi'], ['neji-hyuuga']);
    const [kakashi] = match.board.p1;
    cast(match, 'p1', 0, 'young-kakashi-implanted-sharingan');
    endTurn(match, 'p1');
    cast(match, 'p2', 0, 'neji-hyuuga-eight-trigrams-sixty-four-palms', 'p1', 0);
    assert.equal(totalChakra(match, 'p1'), 39);
    assert.equal(status(kakashi, 'young_kakashi_implanted_sharingan').remainingTurns, 2);
});

test('Lone Wolf adds 5 physical and chakra damage per dead ally', () => {
    const match = matchFor(['young-kakashi', 'haruno-sakura', 'uzumaki-naruto'], ['uchiha-sasuke']);
    const [sasuke] = match.board.p2;
    kill(match.board.p1[1]);
    cast(match, 'p1', 0, 'young-kakashi-white-fang-slash', 'p2', 0);
    assert.equal(sasuke.hp, 75);
    kill(match.board.p1[2]);
    cast(match, 'p1', 0, 'young-kakashi-white-fang-slash', 'p2', 0);
    assert.equal(sasuke.hp, 45);
});

test('Piercing Stab permanently marks for 5 extra Piercing Stab damage that does not stack and ends when Obito dies', () => {
    const match = matchFor(['uchiha-obito'], ['haruno-sakura']);
    const [obito] = match.board.p1;
    const [sakura] = match.board.p2;
    cast(match, 'p1', 0, 'uchiha-obito-piercing-stab', 'p2', 0);
    assert.equal(sakura.hp, 85);
    assert.equal(status(sakura, 'uchiha_obito_piercing_stab_mark').remainingTurns, 99);
    cast(match, 'p1', 0, 'uchiha-obito-piercing-stab', 'p2', 0);
    assert.equal(sakura.hp, 65);
    cast(match, 'p1', 0, 'uchiha-obito-piercing-stab', 'p2', 0);
    assert.equal(sakura.hp, 45, 'the mark does not stack');
    battle.applyDamageToUnit(obito, 200, { match, sourceUsername: 'p2', sourceSlot: 0,
        targetUsername: 'p1', targetSlot: 0 });
    assert.equal(obito.alive, false);
    assert.equal(status(sakura, 'uchiha_obito_piercing_stab_mark'), undefined);
});

test('Obito Goukakyuu no Jutsu splits 30 chakra damage evenly among the enemies it hits', () => {
    const match = matchFor(['uchiha-obito'], ['haruno-sakura', 'uchiha-sasuke', 'inuzuka-kiba']);
    const [obito] = match.board.p1;
    const ready = () => { obito.state.cooldowns = {}; };
    cast(match, 'p1', 0, 'uchiha-obito-goukakyuu-no-jutsu');
    assert.deepEqual(hpOf(match, 'p2'), [90, 90, 90]);
    ready();
    addStatus(match.board.p2[2], 'test_invulnerable', { helpful: true, invulnerable: true },
        { username: 'p2', slot: 2 });
    cast(match, 'p1', 0, 'uchiha-obito-goukakyuu-no-jutsu');
    assert.deepEqual(hpOf(match, 'p2'), [75, 75, 90], 'an invulnerable enemy is not part of the split');
    ready();
    kill(match.board.p2[1]);
    cast(match, 'p1', 0, 'uchiha-obito-goukakyuu-no-jutsu');
    assert.equal(match.board.p2[0].hp, 45, 'a lone target takes all 30');

    const boosted = matchFor(['uchiha-obito'], ['haruno-sakura', 'uchiha-sasuke', 'inuzuka-kiba']);
    addStatus(boosted.board.p1[0], 'test_bonus', { helpful: true, damageBonusFlat: 5 }, { username: 'p1', slot: 0 });
    cast(boosted, 'p1', 0, 'uchiha-obito-goukakyuu-no-jutsu');
    assert.deepEqual(hpOf(boosted, 'p2'), [85, 85, 85], 'damage bonuses apply to each share');

    const reflected = matchFor(['uchiha-obito'], ['haruno-sakura', 'uchiha-sasuke', 'inuzuka-kiba']);
    [0, 1].forEach((slot) => addStatus(reflected.board.p2[slot], 'test_reflect',
        { helpful: true, reflectNextIncomingSkill: true }, { username: 'p2', slot }));
    cast(reflected, 'p1', 0, 'uchiha-obito-goukakyuu-no-jutsu');
    assert.deepEqual([reflected.board.p1[0].hp, ...hpOf(reflected, 'p2')], [80, 100, 100, 90],
        'reflected shares are still split three ways');
});

test('Parting Gift costs Obito 10 affliction health and permanently empowers one ally, once', () => {
    const match = matchFor(['uchiha-obito', 'young-kakashi'], ['haruno-sakura']);
    const [obito, kakashi] = match.board.p1;
    const [sakura] = match.board.p2;
    assert.deepEqual(targets(match, 'p1', 0, 'uchiha-obito-parting-gift'), ['p1:1'], 'Obito cannot target himself');
    addStatus(obito, 'test_reduction', { helpful: true, damageReductionFlat: 10 }, { username: 'p1', slot: 0 });
    cast(match, 'p1', 0, 'uchiha-obito-parting-gift', 'p1', 1);
    assert.equal(obito.hp, 90, 'affliction damage ignores damage reduction');
    const gift = status(kakashi, 'uchiha_obito_parting_gift');
    assert.equal(gift.remainingTurns, 99);
    assert.equal(gift.metadata.cannotBeCleansed, true);

    cast(match, 'p1', 1, 'young-kakashi-white-fang-slash', 'p2', 0);
    assert.equal(sakura.hp, 75, 'the ally deals 5 additional non-affliction damage');
    assert.deepEqual(targets(match, 'p1', 0, 'uchiha-obito-parting-gift'), [], 'Parting Gift can only be used once');
    cast(match, 'p1', 0, 'uchiha-obito-parting-gift', 'p1', 1);
    assert.equal(obito.hp, 90);

    battle.cleanseHarmfulStatuses(kakashi, 99);
    battle.applyDamageToUnit(obito, 200, { match, sourceUsername: 'p2', sourceSlot: 0,
        targetUsername: 'p1', targetSlot: 0 });
    for (let turn = 0; turn < 5; turn += 1) {
        endTurn(match, 'p1');
        endTurn(match, 'p2');
    }
    assert.ok(status(kakashi, 'uchiha_obito_parting_gift'), 'the gift outlives Obito and lasts the whole game');
    cast(match, 'p1', 1, 'young-kakashi-white-fang-slash', 'p2', 0);
    assert.equal(sakura.hp, 45, '20 + 5 from Parting Gift + 5 from Lone Wolf for the dead Obito');
});

test('Obito Sharingan awakens at 50 health or less for 10 damage reduction and unstoppable damaging skills', () => {
    const match = matchFor(['uchiha-obito'], ['haruno-sakura', 'uchiha-sasuke']);
    const [obito] = match.board.p1;
    const [sakura, sasuke] = match.board.p2;
    const hitObito = (amount) => battle.applyDamageToUnit(obito, amount, { match, sourceUsername: 'p2',
        sourceSlot: 1, targetUsername: 'p1', targetSlot: 0 });
    const awakened = () => status(obito, 'uchiha_obito_sharingan_awakened');

    hitObito(45);
    assert.equal(awakened(), undefined, 'not above 50 health');
    hitObito(5);
    assert.ok(awakened(), 'awakens at exactly 50 health');
    obito.hp = 100;
    endTurn(match, 'p1');
    endTurn(match, 'p2');
    assert.ok(awakened(), 'the awakening is permanent');
    hitObito(20);
    assert.equal(obito.hp, 90, '10 damage reduction');

    addStatus(sakura, 'test_defense', { helpful: true, destructibleDefensePoints: 20 });
    addStatus(sakura, 'test_reduction', { helpful: true, damageReductionFlat: 10 });
    addStatus(sakura, 'test_invulnerable', { helpful: true, invulnerable: true });
    addStatus(sakura, 'test_counter', { helpful: true, triggerOnEnemyHarmfulSkill: true, counterCancelsSkill: true });
    addStatus(sakura, 'test_reflect', { helpful: true, reflectNextIncomingSkill: true });
    assert.deepEqual(targets(match, 'p1', 0, 'uchiha-obito-piercing-stab'), ['p2:0', 'p2:1']);
    cast(match, 'p1', 0, 'uchiha-obito-piercing-stab', 'p2', 0);
    assert.equal(sakura.hp, 85, 'ignores destructible defense, damage reduction, invulnerability, counters and reflects');
    assert.equal(status(sakura, 'test_defense').metadata.destructibleDefensePoints, 20);
    assert.equal(obito.hp, 90);
    cast(match, 'p1', 0, 'uchiha-obito-goukakyuu-no-jutsu');
    assert.deepEqual([sakura.hp, sasuke.hp], [70, 85], 'Goukakyuu also reaches the invulnerable enemy');
});

test('before awakening, Obito is stopped by counters and reflects as usual', () => {
    const countered = matchFor(['uchiha-obito'], ['haruno-sakura']);
    addStatus(countered.board.p2[0], 'test_counter',
        { helpful: true, triggerOnEnemyHarmfulSkill: true, counterCancelsSkill: true });
    cast(countered, 'p1', 0, 'uchiha-obito-piercing-stab', 'p2', 0);
    assert.equal(countered.board.p2[0].hp, 100);

    const reflected = matchFor(['uchiha-obito'], ['haruno-sakura']);
    addStatus(reflected.board.p2[0], 'test_reflect', { helpful: true, reflectNextIncomingSkill: true });
    cast(reflected, 'p1', 0, 'uchiha-obito-piercing-stab', 'p2', 0);
    assert.deepEqual([reflected.board.p1[0].hp, reflected.board.p2[0].hp], [85, 100]);
});
