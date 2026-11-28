// Tower 2.0 character augments (C01-C40) in real battles. Each case runs the same scene
// with and without the augment, so the assertion is exactly the augment's effect.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const characters = require('../data/characters');
const battleLogic = require('../battleLogic');
const effects = require('../services/tower/towerAugmentEffects');
const { CHARACTER_AUGMENTS } = require('../services/tower/towerCharacterAugments');
const towerRun = require('../services/tower/towerRun');
const { applyTowerSetupToBoard } = require('../server.js');

const index = (id) => characters.findIndex((character) => character.characterId === id);
const keyOf = (code) => CHARACTER_AUGMENTS.find((entry) => entry.code === code).id;
const pool = () => ({ taijutsu: 20, ninjutsu: 20, bloodline: 20, genjutsu: 20 });
const FOES = ['gato', 'zaku-abumi', 'tsurugi-misumi'];

// The augment sits only on slot 0, the character it belongs to.
const battle = ({ code = null, allies, enemies = FOES, hp = [100, 100, 100], enemyHp = null }) => {
    const players = [{ username: 'p', team: allies.map(index) }, { username: 'bot', team: enemies.map(index) }];
    const board = battleLogic.buildInitialBoard(players, characters);
    const setup = {
        team: allies.map((characterId, slot) => ({ characterId, hp: hp[slot], maxHp: 100, scrolls: slot === 0 && code ? [keyOf(code)] : [] })),
        encounter: { kind: 'battle', hpMultiplier: 1, affixes: [] },
    };
    applyTowerSetupToBoard({ board, username: 'p', botUsername: 'bot', setup });
    if (enemyHp) board.bot.forEach((unit, slot) => { unit.hp = enemyHp[slot]; });
    const match = { matchId: 'm-c', mode: 'tower', players, board, currentTurn: 'p', towerEncounter: {},
        chakraPools: { p: pool(), bot: pool() }, economy: { turnCounts: { p: 0, bot: 0 } }, pendingTurns: {} };
    Object.entries(board).forEach(([username, units]) => units.forEach((unit) => { unit.username = username; }));
    effects.initBattle(match, { username: 'p', botUsername: 'bot', setup, characters });
    return match;
};
const skillIndexOf = (characterId, skillId) => characters[index(characterId)].skills.findIndex((skill) => skill.id === skillId);
const cast = (match, username, slot, skillId, target) => {
    const characterId = characters[match.board[username][slot].rosterIndex].characterId;
    const skillIndex = skillIndexOf(characterId, skillId);
    assert.ok(skillIndex >= 0, skillId);
    match.pendingTurns[username] = { queueOrder: [slot], queuedByActorSlot: { [slot]: {
        skillIndex, targetSelection: target ? [{ username: target[0], slot: target[1] }] : [] } } };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: username, characters });
};
const endTurn = (match, username) => {
    battleLogic.tickStatusesForTurnEnd({ match, endingUsername: username });
    battleLogic.tickCooldownsForTurnEnd({ match, endingUsername: username });
    effects.onTurnEnd(match, username);
    match.economy.turnCounts[username] += 1;
    match.currentTurn = username === 'p' ? 'bot' : 'p';
    effects.onTurnStart(match, match.currentTurn);
};
const status = (unit, statusId) => unit.state.statuses.find((entry) => entry.id === statusId) || null;
const give = (unit, statusId, metadata, duration = 9) => battleLogic.applyStatus({
    targetState: unit.state, statusId, duration, sourceUsername: unit.username, sourceSlot: 0, metadata: { helpful: true, ...metadata } });
const hp = (match, side) => match.board[side].map((unit) => unit.hp);
const totalLost = (match) => match.board.bot.reduce((sum, unit) => sum + (100 - unit.hp), 0);
const chakra = (match) => Object.values(match.chakraPools.p).reduce((sum, amount) => sum + amount, 0);
// Runs a scene with and without the augment.
const compare = (code, scene) => [scene(battle({ code: null, ...scene.options })), scene(battle({ code, ...scene.options }))];
const scene = (options, run) => Object.assign((match) => run(match), { options });

const NARUTO = ['uzumaki-naruto', 'baki', 'haruno-sakura'];
const clones = (match) => Number(status(match.board.p[0], 'uzumaki_naruto_shadow_clones')?.metadata?.shadowClones) || 0;

test('every operational character augment appears in the Standard pool for its own character only', () => {
    const run = towerRun.createRun({ username: 'p', rosterIds: characters.map((c) => c.characterId), seed: 1, runId: 'r', mode: 'standard' });
    towerRun.chooseDraft(run, [0, 0, 0]);
    run.team[0].characterId = 'uzumaki-naruto';
    run.status = 'reward';
    run.pending = { nodeId: null, offers: [keyOf('C01')], ryoGained: 0 };
    assert.throws(() => towerRun.chooseReward(run, 0, 1), /Only that character/);
    towerRun.chooseReward(run, 0, 0);
    assert.deepEqual(run.team[0].scrolls, [keyOf('C01')]);
    // A recruit replacing Naruto cannot inherit it: it is salvaged.
    run.status = 'recruit';
    run.pending = { nodeId: null, offers: ['gato'] };
    const ryo = run.ryo;
    towerRun.recruit(run, 0, 0);
    assert.deepEqual(run.team[0].scrolls, []);
    assert.equal(run.ryo, ryo + 10);
});

test('Naruto: C01 Clone Coordination, C02 Rasengan Mastery, C03 Clone Uprising', () => {
    const [plain, coordinated] = compare('C01', scene({ allies: NARUTO }, (match) => {
        cast(match, 'p', 0, 'uzumaki-naruto-shadow-clones');
        return clones(match);
    }));
    assert.equal(coordinated, plain + 1, 'C01: one more clone');

    const rasengan = characters[index('uzumaki-naruto')].skills.find((skill) => skill.id === 'uzumaki-naruto-rasengan');
    const oneClone = (code) => {
        const match = battle({ code, allies: NARUTO });
        cast(match, 'p', 0, 'uzumaki-naruto-shadow-clones');
        status(match.board.p[0], 'uzumaki_naruto_shadow_clones').metadata.shadowClones = 1;
        return battleLogic.doesActorSatisfySkillCondition(match.board.p[0], match.board.p[0].state, rasengan);
    };
    assert.equal(oneClone(null), false);
    assert.equal(oneClone('C02'), true, 'C02: Rasengan with 1 clone');
    const [base, mastered] = compare('C02', scene({ allies: NARUTO }, (match) => {
        cast(match, 'p', 0, 'uzumaki-naruto-shadow-clones');
        cast(match, 'p', 0, 'uzumaki-naruto-rasengan', ['bot', 0]);
        return 100 - match.board.bot[0].hp;
    }));
    assert.equal(mastered, base + 10, 'C02: +10 damage');

    const [comboPlain, comboUprising] = compare('C03', scene({ allies: NARUTO }, (match) => {
        cast(match, 'p', 0, 'uzumaki-naruto-shadow-clones');
        const before = clones(match);
        cast(match, 'p', 0, 'uzumaki-naruto-uzumaki-naruto-combo', ['bot', 0]);
        return { primary: 100 - match.board.bot[0].hp, others: 200 - match.board.bot[1].hp - match.board.bot[2].hp, clones: clones(match) - before };
    }));
    assert.ok(comboPlain.clones >= 0);
    assert.equal(comboUprising.others, Math.floor(comboPlain.primary / 2), 'C03: 50% to a different enemy');
    assert.equal(comboUprising.clones, comboPlain.clones - 1, 'C03: loses a clone');
});

test('Sasuke: C04 Wire Specialist, C05 Precocious Sharingan, C06 Chidori Storm', () => {
    const SASUKE = ['uchiha-sasuke', 'baki', 'gato'];
    const [plainFlame, wired] = compare('C04', scene({ allies: SASUKE }, (match) => {
        cast(match, 'p', 0, 'uchiha-sasuke-ninja-wire-trap', ['bot', 0]);
        endTurn(match, 'p');
        endTurn(match, 'bot'); // the target used no skill: the trap stuns
        const before = match.board.bot[0].hp;
        cast(match, 'p', 0, 'uchiha-sasuke-dragon-flame-jutsu', ['bot', 0]);
        return before - match.board.bot[0].hp;
    }));
    assert.equal(wired, plainFlame + 10, 'C04: Dragon Flame +10 after the trap stuns');

    let match = battle({ code: 'C05', allies: SASUKE });
    const passive = match.board.p[0].state.statuses.find((entry) => entry.metadata?.awakening?.statusId);
    assert.equal(passive.metadata.awakeningBonusProgress, 1, 'C05: one quest step done');
    const [plainChidori, precocious] = compare('C05', scene({ allies: SASUKE }, (m) => {
        give(m.board.p[0], 'uchiha_sasuke_two_tomoe_sharingan_awakened', {});
        cast(m, 'p', 0, 'uchiha-sasuke-chidori', ['bot', 0]);
        const first = 100 - m.board.bot[0].hp;
        cast(m, 'p', 0, 'uchiha-sasuke-chidori', ['bot', 1]);
        return [first, 100 - m.board.bot[1].hp];
    }));
    assert.deepEqual(precocious, [plainChidori[0] + 10, plainChidori[1]], 'C05: only the first Chidori after awakening');

    const [plainStorm, storm] = compare('C06', scene({ allies: SASUKE }, (m) => {
        give(m.board.p[0], 'uchiha_sasuke_two_tomoe_sharingan_awakened', {});
        cast(m, 'p', 0, 'uchiha-sasuke-chidori', ['bot', 0]);
        return hp(m, 'bot').map((value) => 100 - value);
    }));
    assert.deepEqual(storm, [plainStorm[0] - 10, 15, 15], 'C06: 35 to the target, 15 piercing to the others');
    match = battle({ code: 'C06', allies: SASUKE });
    const chidori = characters[index('uchiha-sasuke')].skills.find((skill) => skill.id === 'uchiha-sasuke-chidori');
    assert.equal(battleLogic.computeEffectiveEnergyCost({ skill: chidori, actorState: match.board.p[0].state }).requiredRandom, 2, 'C06: +1 random');
});

test('Sakura: C07 Triage Training and C09 Combat Medic', () => {
    const SAKURA = ['haruno-sakura', 'baki', 'gato'];
    const [plain, triage] = compare('C07', scene({ allies: SAKURA, hp: [100, 40, 100] }, (match) => {
        cast(match, 'p', 0, 'haruno-sakura-rudimentary-healing', ['p', 1]);
        return match.board.p[1].hp;
    }));
    assert.equal(triage, plain + 10, 'C07: +10 below 50 health');
    const [fullPlain, fullTriage] = compare('C07', scene({ allies: SAKURA, hp: [100, 60, 100] }, (match) => {
        cast(match, 'p', 0, 'haruno-sakura-rudimentary-healing', ['p', 1]);
        return match.board.p[1].hp;
    }));
    assert.equal(fullTriage, fullPlain, 'C07: not at 50 or more');

    const match = battle({ code: 'C09', allies: SAKURA, enemyHp: [80, 100, 100] });
    const options = battleLogic.computeTargetOptions({ match, actingUsername: 'p', actorSlot: 0,
        skillIndex: skillIndexOf('haruno-sakura', 'haruno-sakura-rudimentary-healing'), characters });
    assert.ok(options.targets.some((target) => target.username === 'bot'), 'C09: enemies can be targeted');
    cast(match, 'p', 0, 'haruno-sakura-rudimentary-healing', ['bot', 0]);
    assert.equal(match.board.bot[0].hp, 60, 'C09: 20 piercing damage, no healing');
});

test('Kakashi: C10 Nin-Dog Pursuit, C11 Copy Perfection, C12 Living Arsenal', () => {
    const KAKASHI = ['hatake-kakashi', 'baki', 'gato'];
    const [plain, pursuit] = compare('C10', scene({ allies: KAKASHI }, (match) => {
        cast(match, 'p', 0, 'hatake-kakashi-summoning-ninja-dogs', ['bot', 0]);
        const before = match.board.bot[0].hp;
        // Nin-Dogs Summoning turns into Raikiri for a turn (a skill replacement in its slot).
        cast(match, 'p', 0, 'hatake-kakashi-summoning-ninja-dogs', ['bot', 0]);
        return before - match.board.bot[0].hp;
    }));
    assert.equal(pursuit, plain + 10, 'C10: Raikiri +10 on the dog-marked enemy');

    const match = battle({ code: 'C11', allies: KAKASHI });
    cast(match, 'p', 0, 'hatake-kakashi-sharingan-counter');
    assert.equal(status(match.board.p[0], 'kakashi_sharingan_insight').metadata.counterCopySkillReplacementDuration, 2, 'C11');

    const [plainCopy, arsenal] = compare('C12', scene({ allies: KAKASHI, enemies: ['momochi-zabuza', 'zaku-abumi', 'gato'] }, (m) => {
        cast(m, 'p', 0, 'hatake-kakashi-sharingan-counter');
        m.currentTurn = 'bot';
        cast(m, 'bot', 0, 'momochi-zabuza-kubikiribocho', ['p', 0]);
        m.currentTurn = 'p';
        m.pendingTurns.p = { queueOrder: [0], queuedByActorSlot: { 0: { skillIndex: 0, targetSelection: [{ username: 'bot', slot: 1 }] } } };
        battleLogic.resolvePendingTurnSkills({ match: m, actingUsername: 'p', characters });
        return 100 - m.board.bot[1].hp;
    }));
    assert.ok(plainCopy > 0, 'Kakashi used the copied skill');
    assert.equal(arsenal, plainCopy + Math.floor(plainCopy / 2), 'C12: the first copied skill repeats 50%');
});

test('Shino: C13 Kikaichū Queen and C14 Living Hive', () => {
    const SHINO = ['aburame-shino', 'baki', 'gato'];
    let match = battle({ code: 'C13', allies: SHINO });
    cast(match, 'p', 0, 'aburame-shino-female-bug', ['bot', 0]);
    assert.equal(status(match.board.bot[0], 'aburame_shino_female_bug').metadata.onOwnerUseChakraSpentAfflictionDamagePerChakra, 7, 'C13');
    match = battle({ code: 'C14', allies: SHINO });
    cast(match, 'p', 0, 'aburame-shino-female-bug', ['bot', 0]);
    endTurn(match, 'p'); endTurn(match, 'bot');
    cast(match, 'p', 0, 'aburame-shino-female-bug', ['bot', 1]);
    assert.ok(status(match.board.bot[0], 'aburame_shino_female_bug') && status(match.board.bot[1], 'aburame_shino_female_bug'), 'C14: two marks');
    assert.equal(status(match.board.bot[1], 'aburame_shino_female_bug').metadata.onOwnerUseChakraSpentAfflictionDamagePerChakra, 3);
    assert.equal(status(match.board.bot[0], 'aburame_shino_female_bug').metadata.onOwnerUseChakraSpentAfflictionDamagePerChakra, 3);
});

test('Rock Lee: C15 Lotus Discipline and C16 Unbound Gates', () => {
    const LEE = ['rock-lee', 'baki', 'gato'];
    const [plain, lotus] = compare('C15', scene({ allies: LEE, enemyHp: [20, 100, 100] }, (match) => {
        const before = chakra(match);
        cast(match, 'p', 0, 'rock-lee-front-lotus', ['bot', 0]);
        return { dead: match.board.bot[0].alive === false, gained: chakra(match) - before, discount: Boolean(status(match.board.p[0], 'tower_aug_c15')) };
    }));
    assert.ok(plain.dead && lotus.dead, 'Front Lotus kills');
    assert.equal(lotus.gained, plain.gained + 1, 'C15: +1 chakra');
    assert.ok(lotus.discount, 'C15: next High Speed Taijutsu is discounted');

    const [plainWeights, unbound] = compare('C16', scene({ allies: LEE }, (match) => {
        cast(match, 'p', 0, 'rock-lee-remove-training-weights');
        const weights = status(match.board.p[0], 'rock_lee_training_weights_removed');
        const before = match.board.p[0].hp;
        cast(match, 'p', 0, 'rock-lee-high-speed-taijutsu', ['bot', 0]);
        return { penalty: Boolean(weights?.metadata?.damageDebuffBySkillClass), lost: before - match.board.p[0].hp, dealt: 100 - match.board.bot[0].hp };
    }));
    assert.equal(plainWeights.penalty, true);
    assert.equal(unbound.penalty, false, 'C16: no damage penalty');
    assert.equal(unbound.dealt, plainWeights.dealt + 10);
    assert.equal(unbound.lost, plainWeights.lost + 10, 'C16: loses 10 after a Physical hit');
});

test('Gaara: C17 Desert Harvest, C18 Sand Sovereign, C19 Shukaku Rampage', () => {
    const GAARA = ['gaara-of-the-desert', 'baki', 'gato'];
    const stacks = (match) => Number(status(match.board.p[0], 'gaara_of_the_desert_sand_flow')?.metadata?.sandFlowStacks) || 0;
    const setStacks = (match, value) => { status(match.board.p[0], 'gaara_of_the_desert_sand_flow').metadata.sandFlowStacks = value; };
    const [plain, harvest] = compare('C17', scene({ allies: GAARA }, (match) => {
        setStacks(match, 3);
        const before = chakra(match);
        cast(match, 'p', 0, 'gaara-of-the-desert-desert-funeral', ['bot', 0]);
        return chakra(match) - before;
    }));
    assert.equal(harvest, plain + 1, 'C17: +1 chakra');

    const [plainSphere, sovereign] = compare('C18', scene({ allies: GAARA }, (match) => {
        setStacks(match, 2);
        cast(match, 'p', 0, 'gaara-of-the-desert-sand-sphere');
        return { dd: Number(status(match.board.p[0], 'gaara_sand_sphere')?.metadata?.destructibleDefensePoints) || 0, stacks: stacks(match) };
    }));
    assert.equal(sovereign.dd, plainSphere.dd + 15, 'C18: +15 defense');
    assert.ok(sovereign.stacks >= Math.min(2, plainSphere.stacks + 1), 'C18: keeps a stack');

    const [plainFuneral, rampage] = compare('C19', scene({ allies: GAARA }, (match) => {
        setStacks(match, 6);
        cast(match, 'p', 0, 'gaara-of-the-desert-desert-funeral', ['bot', 0]);
        return { primary: 100 - match.board.bot[0].hp, others: 200 - match.board.bot[1].hp - match.board.bot[2].hp, left: stacks(match) };
    }));
    assert.equal(rampage.primary, plainFuneral.primary - 15, 'C19: only 3 stacks consumed (3 x 5 less damage)');
    assert.equal(rampage.others, plainFuneral.others + 30, 'C19: 15 piercing to each other enemy');
    assert.ok(rampage.left >= 3, 'C19: 3 stacks remain');
});

test('Kankurō: C20 Poisoned Marionette and C21 Puppet Theater', () => {
    const KANKURO = ['kankuro', 'baki', 'gato'];
    const match = battle({ code: 'C20', allies: KANKURO });
    endTurn(match, 'p'); endTurn(match, 'bot'); // Poison Bomb starts on a 1-turn cooldown
    cast(match, 'p', 0, 'kankuro-puppet-trap', ['bot', 0]);
    cast(match, 'p', 0, 'kankuro-poison-bomb', ['bot', 0]);
    assert.equal(status(match.board.bot[0], 'kankuro_poison_bomb_poison').metadata.turnEndDamage, 15, 'C20: trapped enemy poisoned for 15');
    assert.equal(status(match.board.bot[1], 'kankuro_poison_bomb_poison').metadata.turnEndDamage, 10);

    const [plain, theater] = compare('C21', scene({ allies: KANKURO }, (m) => {
        cast(m, 'p', 0, 'kankuro-puppet-trap', ['bot', 0]);
        m.currentTurn = 'bot';
        cast(m, 'bot', 0, 'gato-hired-help', ['p', 1]);
        return [m.board.bot[1].hp, m.board.bot[2].hp];
    }));
    assert.deepEqual(theater, plain.map((value) => value - 10), 'C21: a counter hurts every enemy for 10');
});

test('Haku C22, Hinata C24/C25, Kiba C26/C27', () => {
    const [plain, precise] = compare('C22', scene({ allies: ['haku', 'baki', 'gato'] }, (match) => {
        cast(match, 'p', 0, 'haku-acupuncture', ['bot', 0]);
        cast(match, 'p', 0, 'haku-flying-needles-of-death', ['bot', 0]);
        return 100 - match.board.bot[0].hp;
    }));
    assert.equal(precise, plain + 10, 'C22');

    const HINATA = ['hyuuga-hinata', 'baki', 'gato'];
    let match = battle({ code: 'C24', allies: HINATA });
    cast(match, 'p', 0, 'hyuuga-hinata-hinata-gentle-fist', ['bot', 0]);
    assert.equal(status(match.board.bot[0], 'hyuuga_hinata_gentle_fist_debuff').metadata.nonAfflictionDamageDebuffFlat, 15, 'C24');
    const [plainPalms, mastery] = compare('C25', scene({ allies: HINATA }, (m) => {
        give(m.board.p[0], 'hyuuga_hinata_shy_byakugan_awakened', {});
        cast(m, 'p', 0, 'hyuuga-hinata-eight-trigrams-64-palms');
        endTurn(m, 'p'); endTurn(m, 'bot');
        give(m.board.p[0], 'hyuuga_hinata_shy_byakugan_awakened', {});
        const before = m.board.bot[1].hp;
        cast(m, 'p', 0, 'hyuuga-hinata-eight-trigrams-64-palms');
        return before - m.board.bot[1].hp;
    }));
    assert.equal(mastery, plainPalms + 5, 'C25: +5 on the next use');

    const KIBA = ['inuzuka-kiba', 'baki', 'gato'];
    const [plainFang, pack] = compare('C26', scene({ allies: KIBA }, (m) => {
        cast(m, 'p', 0, 'inuzuka-kiba-dynamic-air-marking', ['bot', 0]);
        cast(m, 'p', 0, 'inuzuka-kiba-garouga', ['bot', 0]);
        return 100 - m.board.bot[0].hp;
    }));
    assert.equal(pack, plainFang + 10, 'C26');
    const [plainTwin, twin] = compare('C27', scene({ allies: KIBA }, (m) => {
        cast(m, 'p', 0, 'inuzuka-kiba-garouga', ['bot', 0]);
        return 100 - m.board.bot[0].hp;
    }));
    assert.equal(twin, plainTwin + Math.floor(plainTwin / 2), 'C27');
    match = battle({ code: 'C27', allies: KIBA });
    cast(match, 'p', 0, 'inuzuka-kiba-garouga', ['bot', 0]);
    cast(match, 'p', 0, 'inuzuka-kiba-garouga', ['bot', 1]);
    assert.equal(100 - match.board.bot[1].hp, plainTwin, 'C27: only the first Garouga');
});

test('Shikamaru C28/C29, Minato C30/C31, Obito C32/C33', () => {
    const SHIKA = ['nara-shikamaru', 'baki', 'gato'];
    // Shikamaru's passive pre-marks one enemy; Meditate needs an unmarked one.
    const unmarked = (m) => m.board.bot.findIndex((unit) => !status(unit, 'nara_shikamaru_ninja_tactics_mark'));
    let match = battle({ code: 'C28', allies: SHIKA });
    let free = unmarked(match);
    cast(match, 'p', 0, 'nara-shikamaru-meditate', ['bot', free]);
    assert.equal(status(match.board.bot[free], 'nara_shikamaru_meditate').remainingTurns, 6, 'C28');
    match = battle({ code: 'C29', allies: SHIKA });
    free = unmarked(match);
    cast(match, 'p', 0, 'nara-shikamaru-meditate', ['bot', free]);
    assert.ok(match.board.bot.every((unit) => status(unit, 'nara_shikamaru_meditate')?.remainingTurns === 2), 'C29: every enemy marked for 2');
    cast(match, 'p', 0, 'nara-shikamaru-shadow-imitation', ['bot', 0]);
    assert.deepEqual(hp(match, 'bot'), [90, 90, 90], 'C29: 10 piercing to each marked enemy');

    const MINATO = ['namikaze-minato', 'baki', 'gato'];
    const [plainKunai, refuge] = compare('C30', scene({ allies: MINATO }, (m) => {
        cast(m, 'p', 0, 'namikaze-minato-custom-kunai', ['p', 1]);
        m.currentTurn = 'bot';
        cast(m, 'bot', 0, 'gato-hired-help', ['p', 1]);
        return 100 - m.board.p[1].hp;
    }));
    assert.equal(refuge, plainKunai - 5, 'C30');
    match = battle({ code: 'C31', allies: MINATO });
    cast(match, 'p', 0, 'namikaze-minato-flying-thunder-god', ['p', 1]);
    assert.ok(status(match.board.p[1], 'tower_aug_c31_dd'), 'C31: ally gains 15 defense');

    const OBITO = ['uchiha-obito', 'baki', 'gato'];
    const [plainStab, promise] = compare('C32', scene({ allies: OBITO }, (m) => {
        battleLogic.applyStatus({ targetState: m.board.bot[0].state, statusId: 'test_no_heal', duration: 5, metadata: { harmful: true, healReceivedMultiplier: 0 } });
        cast(m, 'p', 0, 'uchiha-obito-piercing-stab', ['bot', 0]);
        return 100 - m.board.bot[0].hp;
    }));
    assert.equal(promise, plainStab + 5, 'C32');
    const [plainGift, last] = compare('C33', scene({ allies: OBITO }, (m) => {
        cast(m, 'p', 0, 'uchiha-obito-parting-gift', ['p', 1]);
        return { obito: 100 - m.board.p[0].hp, second: Boolean(status(m.board.p[2], 'uchiha_obito_parting_gift')) };
    }));
    assert.equal(plainGift.second, false);
    assert.equal(last.second, true, 'C33: both allies blessed');
    assert.equal(last.obito, plainGift.obito + 15, 'C33: 25 instead of 10');
});

test('Rin C34/C35, Zabuza C36, Oboro C37, Orochimaru C38, Tenten C39, Iruka C40', () => {
    const RIN = ['nohara-rin', 'baki', 'gato'];
    const [plainTouch, triage] = compare('C34', scene({ allies: RIN, hp: [100, 40, 100] }, (m) => {
        battleLogic.applyStatus({ targetState: m.board.p[1].state, statusId: 'test_poison', duration: 3, sourceUsername: 'bot', sourceSlot: 0,
            metadata: { harmful: true, afflictionDamage: true, turnEndDamage: 5 } });
        cast(m, 'p', 0, 'nohara-rin-healing-touch', ['p', 1]);
        return m.board.p[1].hp;
    }));
    assert.equal(triage, plainTouch + 10, 'C34');
    let match = battle({ code: 'C35', allies: RIN });
    cast(match, 'p', 0, 'nohara-rin-medical-kit', ['p', 1]);
    assert.ok(match.board.p.filter((unit) => status(unit, 'nohara_rin_medical_kit')).length === 3, 'C35: every ally');
    assert.equal(status(match.board.p[1], 'nohara_rin_medical_kit').metadata.turnEndHealFlat, 5);

    const [plainMist, mist] = compare('C36', scene({ allies: ['momochi-zabuza', 'baki', 'gato'] }, (m) => {
        cast(m, 'p', 0, 'momochi-zabuza-hidden-mist-technique');
        cast(m, 'p', 0, 'momochi-zabuza-kubikiribocho', ['bot', 0]);
        return { dealt: 100 - m.board.bot[0].hp, guard: Boolean(status(m.board.p[0], 'tower_aug_c36')) };
    }));
    assert.equal(mist.dealt, plainMist.dealt + 15, 'C36: +15');
    assert.ok(mist.guard, 'C36: 10 damage reduction');

    const [plainKunais, ambush] = compare('C37', scene({ allies: ['oboro', 'baki', 'gato'] }, (m) => {
        cast(m, 'p', 0, 'oboro-haze-clones');
        cast(m, 'p', 0, 'oboro-exploding-kunais', ['bot', 0]);
        return totalLost(m);
    }));
    assert.equal(ambush, plainKunais + 30, 'C37: the next Exploding Kunais deals 10 more to each of 3 enemies');

    const [plainSeal, hunter] = compare('C38', scene({ allies: ['shiore-orochimaru', 'baki', 'gato'], enemies: ['momochi-zabuza', 'zaku-abumi', 'gato'] }, (m) => {
        cast(m, 'p', 0, 'shiore-orochimaru-five-elements-seal', ['bot', 0]);
        m.currentTurn = 'bot';
        cast(m, 'bot', 0, 'momochi-zabuza-kubikiribocho', ['p', 1]);
        return 100 - m.board.bot[0].hp;
    }));
    assert.equal(hunter, plainSeal + 5, 'C38');

    const [plainTrap, master] = compare('C39', scene({ allies: ['tenten', 'baki', 'gato'] }, (m) => {
        cast(m, 'p', 0, 'tenten-twin-rising-dragons-trap');
        cast(m, 'p', 0, 'tenten-twin-rising-dragons-trap');
        return totalLost(m);
    }));
    assert.equal(master, plainTrap + 10, 'C39: once per battle');

    match = battle({ code: 'C40', allies: ['umino-iruka', 'baki', 'gato'] });
    cast(match, 'p', 0, 'umino-iruka-sacrifice', ['p', 1]);
    assert.ok(status(match.board.p[1], 'tower_aug_c40') && status(match.board.p[2], 'tower_aug_c40'), 'C40');
});

test('Sakura C08 Inner Sakura Unleashed and Haku C23 Fractured Mirrors', () => {
    const SAKURA = ['haruno-sakura', 'baki', 'gato'];
    const innerIndex = skillIndexOf('haruno-sakura', 'haruno-sakura-inner-mental-overwhelm');
    const targets = (code) => {
        const match = battle({ code, allies: SAKURA });
        return battleLogic.computeTargetOptions({ match, actingUsername: 'p', actorSlot: 0, skillIndex: innerIndex, characters })
            .targets.filter((target) => target.username === 'bot').length;
    };
    assert.equal(targets(null), 0, 'normally only enemies who used a stun skill');
    assert.equal(targets('C08'), 3, 'C08: any enemy');
    const match = battle({ code: 'C08', allies: SAKURA });
    // The inner version is hidden from the roster: it is reached the way a match reaches it,
    // by awakening Inner Sakura and casting Mental Overwhelm, which it replaces.
    give(match.board.p[0], 'haruno_sakura_inner_sakura_awakened', { permanent: true,
        skillReplacements: { 'haruno-sakura-mental-overwhelm': 'haruno-sakura-inner-mental-overwhelm' } });
    cast(match, 'p', 0, 'haruno-sakura-mental-overwhelm', ['bot', 0]);
    assert.equal(match.board.bot[0].hp, 80, 'the Inner version ran: it deals 20 affliction damage');
    const stun = status(match.board.bot[0], 'haruno_sakura_mental_overwhelm_stun');
    assert.ok(stun, 'the stun lands');
    assert.equal(stun.metadata.cannotUseSkills, undefined, 'C08: not a full stun on a non-stunner');
    assert.deepEqual(stun.metadata.cannotUseSkillClasses, ['chakra', 'strategic']);

    const HAKU = ['haku', 'baki', 'gato'];
    const [plain, fractured] = compare('C23', scene({ allies: HAKU }, (m) => {
        cast(m, 'p', 0, 'haku-demonic-mirroring-ice-crystals');
        cast(m, 'p', 0, 'haku-flying-needles-of-death', ['bot', 0]); // the mirrors replace it with the area version
        return hp(m, 'bot').map((value) => 100 - value);
    }));
    assert.deepEqual(plain, [30, 30, 30], 'the area version');
    assert.deepEqual(fractured, [40, 0, 0], 'C23: one enemy, two hits of 20');
});
