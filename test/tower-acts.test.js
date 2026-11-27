// The Tower's second act, events, duels and the expanded Forbidden Scroll library.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const characters = require('../data/characters');
const battleLogic = require('../battleLogic');
const { ACTIVE_ROSTER_IDS } = require('../data/activeRoster');
const towerRun = require('../services/tower/towerRun');
const towerBoss = require('../services/tower/towerBoss');
const towerScrolls = require('../services/tower/towerScrolls');
const towerActs = require('../services/tower/towerActs');
const { EVENTS } = require('../services/tower/towerEvents');
const { applyTowerSetupToBoard, serializeTowerEncounter } = require('../server.js');

const rosterIds = ACTIVE_ROSTER_IDS.slice();
const index = (id) => characters.findIndex((character) => character.characterId === id);
const nameOf = (id) => characters[index(id)]?.name || id;
const pool = () => ({ taijutsu: 20, ninjutsu: 20, bloodline: 20, genjutsu: 20 });
const chakraTotal = (match, username) => Object.values(match.chakraPools[username]).reduce((sum, value) => sum + value, 0);

const newRun = (seed = 4242) => towerRun.createRun({ username: 'p', rosterIds, seed, runId: 'run-acts' });
// Drafts, then sets the starting scroll aside so tests begin on the map with a plain team.
const draftedRun = (seed) => {
    const run = towerRun.chooseDraft(newRun(seed), [0, 0, 0]);
    run.status = 'map';
    run.pending = null;
    return run;
};

// ---------------------------------------------------------------- battles in the real engine
const towerMatch = ({ allies, enemies, scrolls = [[], [], []], hp = [100, 100, 100], encounter = {}, team = [] }) => {
    const players = [
        { username: 'p', team: allies.map(index) },
        { username: 'bot', team: enemies.map((id) => index(id || enemies.find(Boolean))) },
    ];
    const board = battleLogic.buildInitialBoard(players, characters);
    applyTowerSetupToBoard({
        board, username: 'p', botUsername: 'bot',
        setup: {
            team: allies.map((id, slot) => ({
                characterId: id, hp: hp[slot],
                maxHp: 100 + scrolls[slot].reduce((sum, key) => sum + towerScrolls.getScrollMaxHpBonus(key), 0),
                scrolls: scrolls[slot],
                ...(team[slot] || {}),
            })),
            encounter: { kind: 'battle', hpMultiplier: 1, affixes: [], enemyIds: enemies, ...encounter },
        },
    });
    const match = { players, board, chakraPools: { p: pool(), bot: pool() },
        economy: { turnCounts: { p: 0, bot: 0 } }, pendingTurns: {} };
    Object.entries(match.board).forEach(([username, units]) => units.forEach((unit) => { unit.username = username; }));
    return match;
};
const cast = (match, username, slot, skillIndex, target) => {
    match.pendingTurns[username] = { queueOrder: [slot], queuedByActorSlot: {
        [slot]: { skillIndex, targetSelection: target ? [{ username: target[0], slot: target[1] }] : [] },
    } };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: username, characters });
};
const endTurn = (match, username) => battleLogic.tickStatusesForTurnEnd({ match, endingUsername: username });
// Haku's passive takes a lethal hit for an ally, so these teams leave him out.
const ALLIES = ['momochi-zabuza', 'baki', 'gato'];
const ENEMIES = ['gato', 'baki', 'zori-and-waraji'];

test('every new scroll is described, iconned, and offered unless cursed', () => {
    for (const scroll of towerScrolls.SCROLL_DEFINITIONS) {
        const key = scroll.variants ? `${scroll.id}:${scroll.variants[0]}` : scroll.id;
        const info = towerScrolls.describeScroll(key);
        assert.ok(info.name && info.description && info.kanji, key);
        assert.ok(require('node:fs').existsSync(require('node:path').join(__dirname, '..', info.icon)), `${info.icon} exists`);
        if (scroll.catalog === 'augment' || scroll.catalog === 'character') {
            // Tower 2.0 augments are offered in Standard runs only, never in Legacy runs.
            assert.equal(towerScrolls.OFFERED_SCROLL_KEYS.includes(key), false, key);
            assert.equal(towerScrolls.STANDARD_OFFERED_SCROLL_KEYS.includes(key), true, key);
        } else if (scroll.catalog === 'fusion') {
            assert.equal(towerScrolls.OFFERED_SCROLL_KEYS.includes(key) || towerScrolls.STANDARD_OFFERED_SCROLL_KEYS.includes(key), false, 'fusions are only made');
        } else {
            assert.equal(towerScrolls.OFFERED_SCROLL_KEYS.includes(key), scroll.tier !== 'cursed', key);
        }
        (scroll.pairsWith || []).forEach((id) => assert.ok(towerScrolls.parseScrollKey(id), `${key} pairs with a real scroll`));
    }
    const counts = towerScrolls.SCROLL_DEFINITIONS.reduce((tally, scroll) => ({ ...tally, [scroll.tier]: (tally[scroll.tier] || 0) + 1 }), {});
    assert.ok(counts.genin >= 10 && counts.jonin >= 10 && counts.kage >= 9, JSON.stringify(counts));
});

test('defensive scrolls: Ninja Wire, Sand Armor and Sharingan Foresight reduce real damage', () => {
    const hit = (scrolls) => {
        const match = towerMatch({ allies: ALLIES, enemies: ENEMIES, scrolls: [scrolls, [], []] });
        cast(match, 'bot', 0, 0, ['p', 0]); // Gatō's Hired Help: 20 physical damage
        return 100 - match.board.p[0].hp;
    };
    assert.equal(hit([]), 20);
    assert.equal(hit(['ninja-wire']), 10);
    assert.equal(hit(['sand-armor']), 15);
    assert.equal(hit(['sharingan-foresight']), 16);
});

test('offensive scrolls: Leg Weights, Will of the Fallen and Forbidden Pact add real damage', () => {
    const hit = (scrolls, { deadAlly = false } = {}) => {
        const match = towerMatch({ allies: ['gato', 'baki', 'momochi-zabuza'], enemies: ENEMIES, scrolls: [scrolls, [], []] });
        if (deadAlly) { match.board.p[1].hp = 0; match.board.p[1].alive = false; }
        cast(match, 'p', 0, 0, ['bot', 0]);
        return 100 - match.board.bot[0].hp;
    };
    assert.equal(hit([]), 20);
    assert.equal(hit(['leg-weights']), 30, 'Hired Help is a Physical skill');
    assert.equal(hit(['will-of-the-fallen']), 20, 'no bonus while every ally lives');
    assert.equal(hit(['will-of-the-fallen'], { deadAlly: true }), 35);
    assert.equal(hit(['forbidden-pact']), 35);
    const match = towerMatch({ allies: ['gato', 'baki', 'momochi-zabuza'], enemies: ENEMIES, scrolls: [['forbidden-pact'], [], []] });
    const skill = battleLogic.resolveEffectiveSkill({ characters, rosterIndex: match.board.p[0].rosterIndex, skillIndex: 0, actorState: match.board.p[0].state });
    assert.equal(battleLogic.computeEffectiveEnergyCost({ skill, actorState: match.board.p[0].state }).requiredRandom, 2);
});

test('turn-end scrolls fire at the end of the owner\'s turn', () => {
    const bomb = towerMatch({ allies: ALLIES, enemies: ENEMIES, scrolls: [['shadow-clone-swarm'], [], []] });
    endTurn(bomb, 'p');
    assert.equal(bomb.board.bot.reduce((sum, unit) => sum + (100 - unit.hp), 0), 10, 'one random enemy took 10');

    const poison = towerMatch({ allies: ALLIES, enemies: ENEMIES, scrolls: [['kankuro-poison'], [], []] });
    endTurn(poison, 'p');
    const poisoned = poison.board.bot.findIndex((unit) => unit.state.statuses.some((status) => status.id === 'tower_scroll_kankuro_poison_dot'));
    assert.ok(poisoned >= 0);
    endTurn(poison, 'bot');
    assert.equal(poison.board.bot[poisoned].hp, 95, 'the poison ticks as affliction damage');

    const illusion = towerMatch({ allies: ALLIES, enemies: ENEMIES, scrolls: [['demonic-illusion'], [], []] });
    endTurn(illusion, 'p');
    assert.equal(illusion.board.bot.filter((unit) => battleLogic.isActorUnableToUseSkills(unit.state)).length, 1);
    assert.equal(illusion.board.p[0].hp, 90, 'the caster pays 10 health');

    const fox = towerMatch({ allies: ALLIES, enemies: ENEMIES, scrolls: [['nine-tails-chakra'], [], []] });
    const before = chakraTotal(fox, 'p');
    endTurn(fox, 'p');
    assert.equal(chakraTotal(fox, 'p'), before + 1);

    const rations = towerMatch({ allies: ALLIES, enemies: ENEMIES, scrolls: [['akimichi-rations'], [], []], hp: [80, 100, 100] });
    endTurn(rations, 'p');
    assert.equal(rations.board.p[0].hp, 88);
});

test('Eight Inner Gates ramps damage each turn up to +25 and costs health; it restarts every battle', () => {
    const match = towerMatch({ allies: ['gato', 'baki', 'momochi-zabuza'], enemies: ENEMIES, scrolls: [['eight-inner-gates'], [], []] });
    for (let turn = 0; turn < 7; turn += 1) endTurn(match, 'p');
    const gates = match.board.p[0].state.statuses.find((status) => status.metadata?.towerScroll === 'eight-inner-gates');
    assert.equal(gates.metadata.damageBonusFlat, 25);
    assert.equal(match.board.p[0].hp, 65);
    cast(match, 'p', 0, 0, ['bot', 0]);
    assert.equal(100 - match.board.bot[0].hp, 45);
    assert.deepEqual(towerRun.extractCarriedStatuses(match.board.p[0], 'p', 0), [], 'scroll growth is never carried');
    const fresh = towerScrolls.buildScrollStatus('eight-inner-gates');
    assert.equal(fresh.metadata.damageBonusFlat, 0);
});

test('Undying Will revives once; Hunter-nin Training heals and grants chakra on a kill', () => {
    const match = towerMatch({ allies: ALLIES, enemies: ['momochi-zabuza', 'baki', 'gato'], scrolls: [[], ['undying-will'], []] });
    match.board.p[1].hp = 5;
    cast(match, 'bot', 0, 0, ['p', 1]);
    assert.equal(match.board.p[1].alive, true);
    assert.equal(match.board.p[1].hp, 30);
    match.board.p[1].hp = 5;
    cast(match, 'bot', 0, 0, ['p', 1]);
    assert.equal(match.board.p[1].alive, false, 'only once per battle');

    const hunter = towerMatch({ allies: ALLIES, enemies: ENEMIES, scrolls: [['hunter-nin-training'], [], []], hp: [50, 100, 100] });
    hunter.board.bot[0].hp = 5;
    const before = chakraTotal(hunter, 'p');
    cast(hunter, 'p', 0, 0, ['bot', 0]);
    assert.equal(hunter.board.bot[0].alive, false);
    assert.equal(hunter.board.p[0].hp, 70);
    assert.equal(chakraTotal(hunter, 'p'), before + 1);
});

test('Flying Thunder God doubles cooldown recovery; Konoha Herb Salve multiplies healing', () => {
    const match = towerMatch({ allies: ['gato', 'baki', 'momochi-zabuza'], enemies: ENEMIES, scrolls: [['flying-thunder-god'], [], []] });
    cast(match, 'p', 0, 1, ['bot', 0]);
    const skillId = characters[index('gato')].skills[1].id;
    const before = battleLogic.getSkillCooldownRemaining(match.board.p[0].state, skillId);
    battleLogic.tickCooldownsForTurnEnd({ match, endingUsername: 'p' });
    assert.equal(battleLogic.getSkillCooldownRemaining(match.board.p[0].state, skillId), Math.max(0, before - 2));

    const salve = towerMatch({ allies: ALLIES, enemies: ENEMIES, scrolls: [['konoha-herb-salve', 'medical-ninjutsu'], [], []], hp: [50, 100, 100] });
    endTurn(salve, 'p');
    assert.equal(salve.board.p[0].hp, 58, 'Medical Ninjutsu heals 5, x1.5 = 7.5, rounded to 8');
});

test('reward offers lean toward a scroll that pairs with one you own', () => {
    let paired = 0;
    let plain = 0;
    for (let seed = 1; seed <= 120; seed += 1) {
        const withPair = draftedRun(seed);
        withPair.teamScrolls.push('medical-ninjutsu');
        towerRun.chooseNode(withPair, 'f1-0', rosterIds, { nameOf });
        towerRun.recordBattleResult(withPair, { won: true, units: [{ hp: 90 }, { hp: 90 }, { hp: 90 }] });
        if (withPair.pending.offers.includes('soldier-pills')) paired += 1;
        const without = draftedRun(seed);
        towerRun.chooseNode(without, 'f1-0', rosterIds, { nameOf });
        towerRun.recordBattleResult(without, { won: true, units: [{ hp: 90 }, { hp: 90 }, { hp: 90 }] });
        if (without.pending.offers.includes('soldier-pills')) plain += 1;
    }
    assert.ok(paired > plain, `Soldier Pills offered ${paired} times with Medical Ninjutsu, ${plain} without`);
});

// ---------------------------------------------------------------- Act I additions
test('Act I squads: themed squads appear, smaller squads start with empty slots and more health', () => {
    const run = draftedRun(99);
    const squads = new Set();
    for (let lane = 0; lane < 3; lane += 1) {
        for (let floor = 2; floor <= 8; floor += 1) {
            const encounter = towerRun.buildEncounter({ ...run, seed: `${floor}-${lane}` }, { id: `f${floor}-${lane}`, floor, lane, type: 'battle' }, rosterIds, nameOf);
            if (encounter.squadId) squads.add(encounter.squadId);
        }
    }
    assert.ok(squads.size >= 2, [...squads].join());

    const duo = towerActs.ACT_I_SQUADS.find((squad) => squad.id === 'gato-enforcers');
    const match = towerMatch({ allies: ALLIES, enemies: duo.enemyIds, encounter: { hpMultiplier: 1.4 } });
    assert.equal(match.board.bot[2].alive, false, 'the empty slot starts gone');
    assert.equal(match.board.bot[0].hpCap, 140);
    const options = battleLogic.computeTargetOptions({ match, actingUsername: 'p', actorSlot: 0, skillIndex: 0, characters });
    assert.ok(options.targets.every((target) => target.slot !== 2), 'and cannot be targeted');
});

test('new affixes are engine statuses on the enemy team', () => {
    const match = towerMatch({ allies: ALLIES, enemies: ENEMIES, encounter: { affixes: ['regenerating', 'swift'] } });
    match.board.bot[0].hp = 50;
    endTurn(match, 'bot');
    assert.equal(match.board.bot[0].hp, 55);
    const skill = battleLogic.resolveEffectiveSkill({ characters, rosterIndex: match.board.bot[0].rosterIndex, skillIndex: 0, actorState: match.board.bot[0].state });
    assert.equal(battleLogic.computeEffectiveEnergyCost({ skill, actorState: match.board.bot[0].state }).requiredRandom, 0);
});

// ---------------------------------------------------------------- events
const enterEvent = (run, eventId) => {
    run.status = 'event';
    run.currentNodeId = run.currentNodeId || 'f2-0';
    run.pending = { nodeId: run.currentNodeId, eventId };
    return run;
};

test('every event option is described and every pool has events', () => {
    ['act1', 'forest', 'training', 'exam'].forEach((pool) =>
        assert.ok(Object.values(EVENTS).some((event) => event.pool === pool), pool));
    Object.entries(EVENTS).forEach(([id, event]) => {
        assert.ok(event.title && event.text && event.options.length >= 2, id);
        event.options.forEach((option) => assert.ok(option.label && option.description, `${id}:${option.id}`));
    });
});

test('Tazuna\'s bridge pays ryō for health; a paid option needs the ryō', () => {
    const run = enterEvent(draftedRun(), 'tazuna-bridge');
    run.ryo = 10;
    assert.throws(() => towerRun.resolveEvent(run, 'feast', null, rosterIds), /Needs 25 ryō/);
    towerRun.resolveEvent(run, 'build', null, rosterIds);
    assert.equal(run.ryo, 40);
    assert.deepEqual(run.team.map((member) => member.hp), [90, 90, 90]);
    assert.equal(run.status, 'map');
    assert.equal(run.floor, 2);
});

test('the Swordsman\'s Grave forces a cursed scroll; Kakashi can upgrade scrolls and seal curses', () => {
    const run = enterEvent(draftedRun(), 'swordsman-grave');
    towerRun.resolveEvent(run, 'take', 1, rosterIds);
    assert.deepEqual(run.team[1].scrolls, ['executioners-shard']);

    run.team[0].scrolls = ['sharpened-kunai'];
    enterEvent(run, 'kakashi-training');
    assert.throws(() => towerRun.resolveEvent(run, 'upgrade', 2, rosterIds), /nothing to upgrade/);
    towerRun.resolveEvent(run, 'upgrade', 0, rosterIds);
    assert.deepEqual(run.team[0].scrolls, ['chakra-blades']);

    enterEvent(run, 'kakashi-training');
    towerRun.resolveEvent(run, 'seal', 1, rosterIds);
    assert.deepEqual(run.team[1].scrolls, []);
});

test('the hunter-nin ambush can start a battle that pays an elite reward', () => {
    const run = enterEvent(draftedRun(), 'hunter-nin-ambush');
    towerRun.resolveEvent(run, 'fight', null, rosterIds);
    assert.equal(run.status, 'battle');
    assert.equal(run.battle.encounter.rewardTable, 'elite');
    towerRun.recordBattleResult(run, { won: true, units: [{ hp: 80 }, { hp: 80 }, { hp: 80 }] });
    assert.ok(run.pending.offers.every((key) => towerScrolls.parseScrollKey(key).scroll.tier !== 'genin'));
});

test('the written exam\'s tenth question offers a Jōnin or Kage scroll', () => {
    const run = enterEvent(draftedRun(), 'written-exam');
    towerRun.resolveEvent(run, 'tenth', null, rosterIds);
    assert.equal(run.status, 'reward');
    assert.equal(run.pending.offers.length, 3);
    assert.ok(run.pending.offers.every((key) => ['jonin', 'kage'].includes(towerScrolls.parseScrollKey(key).scroll.tier)));
    const view = towerRun.serializeRun(enterEvent(draftedRun(), 'written-exam'), () => null);
    assert.equal(view.event.title, 'The First Exam');
    assert.equal(view.event.options.length, 3);
});

// ---------------------------------------------------------------- acts
// Takes a fresh run straight to Zabuza's defeat.
const runPastZabuza = (seed = 7) => {
    const run = draftedRun(seed);
    run.status = 'battle';
    run.currentNodeId = 'f10-0';
    run.floor = 9;
    run.battle = { nodeId: 'f10-0', matchId: 'm', encounter: { ...towerBoss.buildBossEncounter({ floor: 10 }), act: 1, final: true } };
    towerRun.recordBattleResult(run, { won: true, units: [{ hp: 60 }, { hp: 0, alive: false }, { hp: 40 }] });
    return run;
};

test('beating Zabuza offers Act II; retiring pays Act I\'s reward', () => {
    const run = runPastZabuza();
    assert.equal(run.status, 'interlude');
    assert.equal(run.team[1].fallen, true);
    const view = towerRun.serializeRun(run, () => null);
    assert.equal(view.interlude.title, 'The Chūnin Exams');
    towerRun.continueRun(run, 'retire');
    assert.equal(run.status, 'victory');
    assert.deepEqual(towerRun.computeAccountReward(run), { floorsCleared: 10, ryo: 300 });
});

test('continuing builds the Chūnin Exam floors and restores the team', () => {
    const run = runPastZabuza();
    towerRun.continueRun(run, 'continue');
    assert.equal(run.status, 'map');
    assert.equal(run.act, 2);
    assert.equal(run.map.floors.length, 20);
    const types = (floor) => run.map.floors[floor - 1].map((node) => node.type);
    assert.deepEqual(types(11), ['exam']);
    [12, 13, 14].forEach((floor) => assert.ok(types(floor).includes('battle'), `floor ${floor} has a battle`));
    assert.ok(types(14).includes('elite'));
    assert.deepEqual(run.map.floors[14].map((node) => node.bossId), ['grass-ninja']);
    assert.deepEqual(types(16), ['duel', 'duel', 'duel']);
    assert.ok(types(17).every((type) => type === 'training'));
    assert.deepEqual(types(19), ['duel', 'duel', 'duel']);
    assert.deepEqual(run.map.floors[19].map((node) => node.bossId), ['final-bout']);
    assert.equal(new Set(run.map.floors[16].map((node) => node.eventId)).size, 3, 'three different trainers');
    assert.deepEqual(towerRun.getAvailableNodeIds(run), ['f11-0']);
    assert.deepEqual(run.map.floors[10][0].next, ['f12-0', 'f12-1', 'f12-2'], 'the exam opens onto the whole forest');
    assert.equal(run.team[1].fallen, false, 'last lives are restored');
    assert.ok(run.team.every((member) => member.hp === towerRun.memberMaxHp(member)));
    assert.equal(run.examScrolls.heaven + run.examScrolls.earth, 1, 'every team starts with one scroll');
});

const enterAct2Node = (run, floor, type) => {
    const node = run.map.floors[floor - 1].find((entry) => entry.type === type);
    run.status = 'map';
    run.currentNodeId = floor === 11 ? 'f10-0' : run.map.floors[floor - 2].find((entry) => entry.next.includes(node.id)).id;
    towerRun.chooseNode(run, node.id, rosterIds, { nameOf });
    return node;
};

test('forest squads carry a Heaven or Earth scroll; Orochimaru brands a ninja; the tower checks the pair', () => {
    const run = runPastZabuza();
    towerRun.continueRun(run, 'continue');
    enterAct2Node(run, 12, 'battle');
    const { carries } = run.battle.encounter;
    assert.ok(['heaven', 'earth'].includes(carries));
    assert.ok(towerActs.FOREST_SQUADS.some((squad) => squad.id === run.battle.encounter.squadId));
    const before = run.examScrolls[carries];
    towerRun.recordBattleResult(run, { won: true, units: [{ hp: 80 }, { hp: 80 }, { hp: 80 }] });
    assert.equal(run.examScrolls[carries], before + 1);

    run.examScrolls = { heaven: 1, earth: 1 };
    run.team.forEach((member) => { member.hp = 20; });
    enterAct2Node(run, 15, 'boss');
    assert.equal(run.battle.encounter.bossId, 'grass-ninja');
    assert.equal(run.battle.encounter.final, false);
    towerRun.recordBattleResult(run, { won: true, units: [{ hp: 20 }, { hp: 20 }, { hp: 20 }], bossState: { cursedSlot: 2 } });
    assert.equal(run.status, 'reward', 'a mid-act boss pays a reward instead of ending the act');
    assert.ok(run.team[2].scrolls.includes('cursed-seal-of-heaven'));
    assert.deepEqual(run.team.map((member) => member.hp), [85, 85, 85], '+25 regen, then the tower\'s 40% rest');

    const missing = runPastZabuza(8);
    towerRun.continueRun(missing, 'continue');
    missing.examScrolls = { heaven: 1, earth: 0 };
    missing.team.forEach((member) => { member.hp = 50; });
    enterAct2Node(missing, 15, 'boss');
    towerRun.recordBattleResult(missing, { won: true, units: [{ hp: 50 }, { hp: 50 }, { hp: 50 }], bossState: {} });
    assert.deepEqual(missing.team.map((member) => member.hp), [50, 50, 50], '+25 regen, then 25 lost searching');
});

test('duels need a champion; the others sit out, and a lost bout does not end the run', () => {
    const run = runPastZabuza();
    towerRun.continueRun(run, 'continue');
    enterAct2Node(run, 16, 'duel');
    const { encounter } = run.battle;
    assert.equal(encounter.duel, true);
    assert.equal(encounter.enemyIds.filter(Boolean).length, 1);
    assert.match(encounter.name, /^Preliminaries: /);
    assert.ok(!run.team.some((member) => member.characterId === encounter.enemyIds[0]), 'never your own ninja');
    assert.throws(() => towerRun.buildBattleSetup(run), /champion/);
    towerRun.chooseChampion(run, 1);
    const setup = towerRun.buildBattleSetup(run);
    assert.deepEqual(setup.team.map((member) => member.benched), [true, false, true]);

    const match = towerMatch({ allies: ['gato', 'baki', 'momochi-zabuza'], enemies: encounter.enemyIds,
        team: setup.team.map((member) => ({ benched: member.benched })), encounter: { duel: true, hpMultiplier: 1.4 } });
    assert.deepEqual(match.board.p.map((unit) => unit.alive !== false), [false, true, false]);
    assert.deepEqual(match.board.bot.map((unit) => unit.alive !== false), [true, false, false]);
    assert.ok(match.board.p[1].state.statuses.some((status) => status.id === towerRun.DUEL_RULE_STATUS.statusId));
    assert.ok(match.board.bot[0].state.statuses.some((status) => status.id === towerRun.DUEL_RULE_STATUS.statusId));

    run.team.forEach((member) => { member.hp = 60; });
    towerRun.recordBattleResult(run, { won: false, units: [{}, { hp: 0, alive: false }, {}] });
    assert.equal(run.status, 'map');
    assert.equal(run.team[1].fallen, true);
    assert.equal(run.team[1].hp, 1);
    assert.deepEqual([run.team[0].hp, run.team[2].hp], [85, 85], 'the spectators rest');
    assert.equal(run.floor, 16);
});

test('the duel opponents on one floor are all different, and the finals draw from the finalists', () => {
    const run = runPastZabuza(21);
    towerRun.continueRun(run, 'continue');
    [16, 19].forEach((floor) => {
        const opponents = run.map.floors[floor - 1].map((node) => towerRun.buildEncounter(run, node, rosterIds, nameOf).enemyIds[0]);
        assert.equal(new Set(opponents).size, 3, `floor ${floor}`);
        assert.ok(!opponents.includes('gaara-of-the-desert'), 'Gaara is saved for the final bout');
    });
});

test('winning the final bout ends Act II with the Konoha Crush; the run pays both acts', () => {
    const run = runPastZabuza();
    towerRun.continueRun(run, 'continue');
    run.status = 'map';
    run.currentNodeId = 'f19-0';
    run.floor = 19;
    towerRun.chooseNode(run, 'f20-0', rosterIds, { nameOf });
    assert.equal(run.battle.encounter.bossId, 'final-bout');
    assert.equal(run.battle.encounter.duel, true);
    towerRun.chooseChampion(run, 0);
    towerRun.recordBattleResult(run, { won: true, units: [{ hp: 20 }, {}, {}] });
    assert.equal(run.status, 'victory');
    assert.match(run.log.at(-1).text, /Konoha Crush/);
    assert.deepEqual(towerRun.computeAccountReward(run), { floorsCleared: 20, ryo: 20 * 15 + 150 + 250 });
});

test('losing the final bout ends the run', () => {
    const run = runPastZabuza();
    towerRun.continueRun(run, 'continue');
    run.currentNodeId = 'f19-0';
    towerRun.chooseNode(run, 'f20-0', rosterIds, { nameOf });
    towerRun.chooseChampion(run, 0);
    towerRun.recordBattleResult(run, { won: false, units: [] });
    assert.equal(run.status, 'defeated');
});

test('scouting previews exactly the encounter a node will start', () => {
    const run = draftedRun(31);
    const view = towerRun.serializeRun(run, (id) => ({ characterId: id, name: nameOf(id) }), { rosterIds });
    assert.deepEqual(Object.keys(view.previews).sort(), ['f1-0', 'f1-1', 'f1-2']);
    const preview = view.previews['f1-1'].encounter;
    towerRun.chooseNode(run, 'f1-1', rosterIds, { nameOf });
    assert.equal(preview.name, run.battle.encounter.name);
    assert.deepEqual(preview.enemies.map((enemy) => enemy.characterId), run.battle.encounter.enemyIds.filter(Boolean));
});

// ---------------------------------------------------------------- Act II bosses
const runBossTurn = (match, state) => towerBoss.runScriptedBossTurn({
    state, match, botUsername: 'bot', playerUsername: 'p', characters, battleLogic,
    fundSkill: () => {},
    queue: ({ actorSlot, skillIndex, targetSelection }) => {
        match.pendingTurns.bot = { queueOrder: [actorSlot], queuedByActorSlot: { [actorSlot]: { skillIndex, targetSelection } } };
        battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'bot', characters });
    },
});
const intentFor = (match, state) => towerBoss.computeNextIntent({
    state, match, botUsername: 'bot', playerUsername: 'p', characters, battleLogic,
});
const bossFight = (bossId) => {
    const encounter = towerBoss.buildBossEncounter({ floor: 15, bossId });
    return towerMatch({ allies: ALLIES, enemies: encounter.enemyIds, encounter });
};

test('Orochimaru fights alone with scripted health and bites the healthiest ninja at half health', () => {
    const match = bossFight('grass-ninja');
    assert.equal(match.board.bot[0].hpCap, 300);
    assert.deepEqual(match.board.bot.map((unit) => unit.alive !== false), [true, false, false]);
    const state = towerBoss.createBossState('grass-ninja');
    state.intent = intentFor(match, state);
    assert.equal(state.intent.skillId, towerBoss.OROCHIMARU_SKILLS.seal);

    match.board.bot[0].hp = 140;
    match.board.p[0].hp = 30;
    match.board.p[2].hp = 60;
    state.intent = intentFor(match, state);
    assert.equal(state.intent.skillId, towerBoss.OROCHIMARU_SKILLS.bite);
    assert.equal(state.intent.targetSlot, 1, 'the healthiest ninja');
    runBossTurn(match, state);
    assert.equal(state.cursedSlot, 1);
    assert.equal(state.phase, 2);
    assert.notEqual(intentFor(match, state)?.phaseChange, true, 'the bite triggers once');
});

test('Gaara telegraphs Sand Binding Coffin, and Shukaku stirs at half health', () => {
    const match = bossFight('final-bout');
    assert.equal(match.board.bot[0].hpCap, 170);
    const state = towerBoss.createBossState('final-bout');
    state.intent = intentFor(match, state);
    assert.equal(state.intent.skillId, towerBoss.GAARA_SKILLS.coffin);
    match.board.bot[0].hp = 80;
    state.intent = intentFor(match, state);
    assert.equal(state.intent.skillId, towerBoss.GAARA_SKILLS.sphere);
    runBossTurn(match, state);
    assert.ok(match.board.bot[0].state.statuses.some((status) => status.id === towerBoss.SHUKAKU_STATUS.statusId));
    const payload = serializeTowerEncounter({ runId: 'r', kind: 'boss', floor: 20, totalFloors: 20, name: 'Gaara', duel: true, final: true, affixes: [], boss: state });
    assert.equal(payload.boss.phaseLabel, 'Shukaku stirs');
    assert.equal(payload.totalFloors, 20);
    assert.equal(payload.outcome.winTitle, 'The finals are interrupted');
    assert.equal(payload.boss.duel, true);
});

test('the battle payload explains duels and old Act I boss matches', () => {
    const duel = serializeTowerEncounter({ kind: 'duel', floor: 16, name: 'Preliminaries: Rock Lee', duel: true, affixes: [] });
    assert.equal(duel.outcome.loseTitle, 'Bout lost');
    const legacy = serializeTowerEncounter({ kind: 'boss', floor: 10, name: 'Demon', affixes: [], boss: towerBoss.createBossState() });
    assert.equal(legacy.outcome.winTitle, 'Act I cleared');
    assert.equal(legacy.totalFloors, 10);
});
