const { test } = require('node:test');
const assert = require('node:assert/strict');
const characters = require('../data/characters');
const battleLogic = require('../battleLogic');
const towerRun = require('../services/tower/towerRun');
const towerBoss = require('../services/tower/towerBoss');
const towerScrolls = require('../services/tower/towerScrolls');
const { applyTowerSetupToBoard, serializeTowerEncounter } = require('../server.js');

const rosterIds = characters
    .filter((character) => Array.isArray(character.skills) && character.skills.length)
    .map((character) => character.characterId);
const index = (id) => characters.findIndex((character) => character.characterId === id);
const pool = () => ({ taijutsu: 20, ninjutsu: 20, bloodline: 20, genjutsu: 20 });

const newRun = (seed = 12345) => towerRun.createRun({ username: 'p', rosterIds, seed, runId: 'run-1' });
const draftedRun = (seed) => towerRun.chooseDraft(newRun(seed), [0, 0, 0]);

// Plays the run to the given status by always taking the first open node of that type.
const walkTo = (run, wanted) => {
    for (let guard = 0; guard < 30; guard += 1) {
        const open = towerRun.getAvailableNodeIds(run).map((id) => towerRun.findNode(run, id));
        const node = open.find((entry) => entry.type === wanted) || null;
        if (node) return towerRun.chooseNode(run, node.id, rosterIds);
        const step = open.find((entry) => entry.type === 'battle') || open[0];
        towerRun.chooseNode(run, step.id, rosterIds);
        if (run.status === 'battle') {
            towerRun.recordBattleResult(run, { won: true, units: run.team.map((m) => ({ hp: m.hp, alive: true })) });
            towerRun.skipReward(run);
        } else if (run.status === 'ramen') towerRun.applyRamen(run, 'feast');
        else towerRun.leaveNode(run);
    }
    throw new Error(`No ${wanted} node reached`);
};

test('the map is seeded, ten floors tall, with an elite floor, a rest floor and one boss', () => {
    const map = towerRun.generateMap('42');
    assert.deepEqual(towerRun.generateMap('42'), map, 'the same seed builds the same map');
    assert.notDeepEqual(towerRun.generateMap('43'), map);
    assert.equal(map.floors.length, 10);
    assert.ok(map.floors[0].every((node) => node.type === 'battle'));
    assert.ok(map.floors[4].every((node) => node.type === 'elite'));
    assert.ok(map.floors[8].every((node) => node.type === 'ramen' || node.type === 'merchant'));
    assert.deepEqual(map.floors[9].map((node) => node.type), ['boss']);
    for (let floor = 1; floor < 9; floor += 1) {
        assert.ok(map.floors[floor].some((node) => node.type === 'battle' || node.type === 'elite' || floor === 8));
        const reachable = new Set(map.floors[floor - 1].flatMap((node) => node.next));
        map.floors[floor].forEach((node) => assert.ok(reachable.has(node.id), `${node.id} is reachable`));
    }
    assert.ok(map.floors[8].every((node) => node.next[0] === 'f10-0'));
});

test('the draft offers three candidates per slot, one reroll per slot, and builds a full-health team', () => {
    const run = newRun();
    const ids = run.draft.offers.flat();
    assert.equal(new Set(ids).size, 9);
    const [slot0, slot1, slot2] = run.draft.offers.map((candidates) => candidates.slice());
    towerRun.rerollDraft(run, rosterIds, 1);
    assert.deepEqual(run.draft.offers[0], slot0, 'other slots are untouched');
    assert.deepEqual(run.draft.offers[2], slot2);
    assert.equal(run.draft.offers[1].length, 3);
    assert.ok(run.draft.offers[1].every((id) => !ids.includes(id)), 'a reroll never repeats an offered ninja');
    assert.equal(new Set(run.draft.offers.flat()).size, 9);
    assert.throws(() => towerRun.rerollDraft(run, rosterIds, 1), /No rerolls left/);
    towerRun.rerollDraft(run, rosterIds, 0);
    assert.notDeepEqual(run.draft.offers[0], slot0);
    assert.throws(() => towerRun.chooseDraft(run, [0, 1]), /every slot/);
    assert.throws(() => towerRun.chooseDraft(run, [0, 5, 1]), /every slot/);
    const chosen = [run.draft.offers[0][2], run.draft.offers[1][0], run.draft.offers[2][1]];
    assert.ok(!slot1.includes(chosen[1]));
    towerRun.chooseDraft(run, [2, 0, 1]);
    assert.equal(run.status, 'map');
    assert.deepEqual(run.team.map((member) => member.characterId), chosen);
    assert.ok(run.team.every((member) => member.hp === 100));
    assert.equal(run.ryo, towerRun.STARTING_RYO);
    assert.equal(towerRun.getAvailableNodeIds(run).length, 3);
});

test('only open paths can be chosen, and survivors carry health forward plus regen', () => {
    const run = draftedRun();
    assert.throws(() => towerRun.chooseNode(run, 'f3-0', rosterIds), /not open/);
    towerRun.chooseNode(run, 'f1-1', rosterIds);
    assert.equal(run.status, 'battle');
    const setup = towerRun.buildBattleSetup(run);
    assert.equal(setup.encounter.kind, 'battle');
    assert.equal(setup.encounter.enemyIds.length, 3);
    towerRun.recordBattleResult(run, { won: true, units: [{ hp: 63, alive: true }, { hp: 0, alive: false }, { hp: 90 }] });
    assert.deepEqual(run.team.map((member) => member.hp), [88, 1, 100],
        'survivors regain 25 (capped at max); the fallen ninja is carried out at 1');
    assert.equal(run.team[1].fallen, true);
    assert.equal(run.team[1].dead, false);
    assert.equal(run.floor, 1);
    assert.equal(run.status, 'reward');
    assert.equal(run.ryo, towerRun.STARTING_RYO + towerRun.RYO_REWARDS.battle);
    assert.equal(run.pending.offers.length, 3);
    assert.equal(new Set(run.pending.offers.map((key) => key.split(':')[0])).size, 3);
    const offer = run.pending.offers[0];
    const scope = towerScrolls.parseScrollKey(offer).scroll.scope;
    towerRun.chooseReward(run, 0, 1);
    const holder = scope === 'team' ? run.teamScrolls : run.team[1].scrolls;
    assert.ok(holder.includes(offer));
    assert.equal(run.status, 'map');
    assert.ok(towerRun.getAvailableNodeIds(run).every((id) => id.startsWith('f2-')));
});

test('reward offers are fixed by the seed', () => {
    const play = () => {
        const run = draftedRun(777);
        towerRun.chooseNode(run, 'f1-0', rosterIds);
        towerRun.recordBattleResult(run, { won: true, units: [{ hp: 90 }, { hp: 90 }, { hp: 90 }] });
        return run.pending.offers;
    };
    assert.deepEqual(play(), play());
});

test('losing a battle ends the run and pays ryo per floor cleared', () => {
    const run = draftedRun();
    walkTo(run, 'elite');
    const floorBefore = run.floor;
    towerRun.recordBattleResult(run, { won: false, units: [] });
    assert.equal(run.status, 'defeated');
    assert.deepEqual(towerRun.computeAccountReward(run), { floorsCleared: floorBefore, ryo: floorBefore * 15 });
    assert.throws(() => towerRun.abandonRun(run), /already over/);
});

test('elites are tougher and roll Jonin or Kage scrolls', () => {
    const run = draftedRun();
    walkTo(run, 'elite');
    const { encounter } = towerRun.buildBattleSetup(run);
    assert.equal(encounter.kind, 'elite');
    assert.equal(encounter.hpMultiplier, 1.6);
    assert.deepEqual(encounter.affixes.sort(), ['fortified', 'frenzied']);
    towerRun.recordBattleResult(run, { won: true, units: [{ hp: 50 }, { hp: 50 }, { hp: 50 }] });
    assert.ok(run.pending.offers.every((key) => towerScrolls.parseScrollKey(key).scroll.tier !== 'genin'));
});

test('the ramen stand, merchant and recruit nodes', () => {
    const run = draftedRun();
    run.team.forEach((member) => { member.hp = 30; });
    run.status = 'ramen';
    run.currentNodeId = 'f2-0';
    towerRun.applyRamen(run, 'feast');
    assert.deepEqual(run.team.map((member) => member.hp), [70, 70, 70]);
    run.status = 'ramen';
    towerRun.applyRamen(run, 'rest', 2);
    assert.equal(run.team[2].hp, 100);

    run.status = 'merchant';
    run.ryo = 50;
    run.pending = { stock: [
        { kind: 'scroll', key: 'curse-mark', price: 130, sold: false },
        { kind: 'medkit', price: 35, sold: false },
    ] };
    assert.throws(() => towerRun.merchantBuy(run, 0, 0), /Not enough ryō/);
    run.team[0].hp = 40;
    towerRun.merchantBuy(run, 1);
    assert.equal(run.team[0].hp, 70);
    assert.equal(run.ryo, 15);
    assert.throws(() => towerRun.merchantBuy(run, 1), /not for sale/);
    towerRun.leaveNode(run);
    assert.equal(run.status, 'map');

    run.team[1].scrolls = ['flak-jacket'];
    run.team[1].hp = 10;
    run.status = 'recruit';
    run.pending = { offers: ['haku', 'gato', 'baki'] };
    towerRun.recruit(run, 0, 1);
    assert.equal(run.team[1].characterId, 'haku');
    assert.deepEqual(run.team[1].scrolls, ['flak-jacket'], 'the recruit inherits the scrolls');
    assert.equal(run.team[1].hp, 100, 'and arrives rested');
});

test('Vitality Seal raises maximum health and heals', () => {
    const run = draftedRun();
    run.team[0].hp = 50;
    run.status = 'reward';
    run.currentNodeId = 'f1-0';
    run.pending = { offers: ['vitality-seal'] };
    towerRun.chooseReward(run, 0, 0);
    assert.equal(towerRun.memberMaxHp(run.team[0]), 120);
    assert.equal(run.team[0].hp, 70);
});

test('every scroll builds a permanent, uncleansable status the engine reads', () => {
    for (const key of towerScrolls.ALL_SCROLL_KEYS) {
        const info = towerScrolls.describeScroll(key);
        assert.ok(info.name && info.description && info.icon, key);
        const status = towerScrolls.buildScrollStatus(key);
        assert.equal(status.duration, 99);
        assert.equal(status.metadata.cannotBeCleansed, true);
        assert.notEqual(status.metadata.passive, true, 'scrolls never replace a character passive');
    }
    const totalsWith = (key) => {
        const state = { statuses: [] };
        const status = towerScrolls.buildScrollStatus(key);
        battleLogic.applyStatus({ targetState: state, statusId: status.statusId, duration: 99, metadata: status.metadata });
        return battleLogic.getStatusMetadataTotals ? battleLogic.getStatusMetadataTotals(state) : null;
    };
    if (battleLogic.getStatusMetadataTotals) {
        assert.equal(totalsWith('flak-jacket').damageReductionFlat, 5);
        assert.equal(totalsWith('steel-skin').damageReductionFlat, 10);
        assert.equal(totalsWith('iron-will').stunImmune, true);
        assert.equal(totalsWith('soldier-pills').healReceivedBonusFlat, 5);
    }
});

// ---------------------------------------------------------------- inside real battles
const towerMatch = ({ allies, enemies, scrolls = [[], [], []], hp = [100, 100, 100], encounter = {} }) => {
    const players = [{ username: 'p', team: allies.map(index) }, { username: 'bot', team: enemies.map(index) }];
    const board = battleLogic.buildInitialBoard(players, characters);
    applyTowerSetupToBoard({
        board, username: 'p', botUsername: 'bot',
        setup: {
            team: allies.map((id, slot) => ({
                characterId: id, hp: hp[slot],
                maxHp: 100 + scrolls[slot].reduce((sum, key) => sum + towerScrolls.getScrollMaxHpBonus(key), 0),
                scrolls: scrolls[slot],
            })),
            encounter: { kind: 'battle', hpMultiplier: 1, affixes: [], ...encounter },
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
const WAVES = ['haku', 'momochi-zabuza', 'demon-brothers'];

test('carried health and scrolls are applied to the board', () => {
    const match = towerMatch({
        allies: ['momochi-zabuza', 'haku', 'gato'], enemies: WAVES,
        hp: [40, 100, 70], scrolls: [['vitality-seal'], [], []],
    });
    assert.equal(match.board.p[0].hpCap, 120);
    assert.equal(match.board.p[0].hp, 40);
    assert.equal(match.board.p[2].hp, 70);
    assert.ok(match.board.p[0].state.statuses.some((status) => status.metadata.towerScroll === 'vitality-seal'));
});

test('Sharpened Kunai and Flak Jacket change real damage', () => {
    const base = towerMatch({ allies: ['momochi-zabuza', 'haku', 'gato'], enemies: ['gato', 'haku', 'baki'] });
    cast(base, 'p', 0, 0, ['bot', 0]);
    const plain = 100 - base.board.bot[0].hp;
    assert.equal(plain, 30);

    const sharp = towerMatch({ allies: ['momochi-zabuza', 'haku', 'gato'], enemies: ['gato', 'haku', 'baki'],
        scrolls: [['sharpened-kunai'], [], []] });
    cast(sharp, 'p', 0, 0, ['bot', 0]);
    assert.equal(100 - sharp.board.bot[0].hp, plain + 5);

    const armored = towerMatch({ allies: ['gato', 'haku', 'baki'], enemies: ['momochi-zabuza', 'haku', 'gato'],
        scrolls: [['flak-jacket'], [], []] });
    cast(armored, 'bot', 0, 0, ['p', 0]);
    assert.equal(100 - armored.board.p[0].hp, plain - 5);
});

test('Chakra Weave lowers the matching cost and Iron Will blocks full stuns only', () => {
    const match = towerMatch({ allies: ['momochi-zabuza', 'haku', 'gato'], enemies: ['gaara-of-the-desert', 'gaara-of-the-desert', 'haku'],
        scrolls: [['chakra-weave:taijutsu'], ['iron-will'], []] });
    const sword = battleLogic.resolveEffectiveSkill({ characters, rosterIndex: match.board.p[0].rosterIndex,
        skillIndex: 0, actorState: match.board.p[0].state });
    const cost = battleLogic.computeEffectiveEnergyCost({ skill: sword, actorState: match.board.p[0].state });
    assert.equal(cost.reservedSpecific.taijutsu, 0, 'Kubikiribōchō no longer needs Taijutsu');

    cast(match, 'bot', 0, 0, ['p', 1]); // Sand Binding Coffin: a full stun
    assert.ok(!match.board.p[1].state.statuses.some((status) => status.id === 'gaara_sand_binding_coffin_stun'));
    cast(match, 'bot', 1, 0, ['p', 2]);
    assert.ok(match.board.p[2].state.statuses.some((status) => status.id === 'gaara_sand_binding_coffin_stun'),
        'ninjas without the scroll are stunned as usual');
    cast(match, 'bot', 2, 1, ['p', 1]); // Haku's Acupuncture is a class stun, which Iron Will does not stop
    assert.ok(match.board.p[1].state.statuses.some((status) => status.id === 'haku_acupuncture_stun'));
});

test('enemy scaling and affixes apply to the enemy team only', () => {
    const match = towerMatch({ allies: ['gato', 'baki', 'haku'], enemies: ['gato', 'baki', 'haku'],
        encounter: { hpMultiplier: 1.5, affixes: ['frenzied'] } });
    assert.ok(match.board.bot.every((unit) => unit.hpCap === 150 && unit.hp === 150));
    assert.ok(match.board.p.every((unit) => unit.hpCap === 100));
    assert.ok(match.board.bot.every((unit) => unit.state.statuses.some((status) => status.id === 'tower_affix_frenzied')));
});

// ---------------------------------------------------------------- boss script
const bossMatch = () => {
    const match = towerMatch({ allies: ['gato', 'baki', 'mitarashi-anko'], enemies: WAVES.slice(0, 0).concat(
        towerBoss.BOSS_DEFINITION.enemyIds), encounter: { kind: 'boss' } });
    return match;
};
const runBossTurn = (match, state) => towerBoss.runScriptedBossTurn({
    state, match, botUsername: 'bot', playerUsername: 'p', characters, battleLogic,
    fundSkill: () => {},
    queue: ({ actorSlot, skillIndex, targetSelection }) => {
        match.pendingTurns.bot = { queueOrder: [actorSlot], queuedByActorSlot: {
            [actorSlot]: { skillIndex, targetSelection } } };
        battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'bot', characters });
    },
});
const intentFor = (match, state) => towerBoss.computeNextIntent({
    state, match, botUsername: 'bot', playerUsername: 'p', characters, battleLogic,
});

test('the boss has scripted health and telegraphs Hidden Mist first, then Water Prison on the healthiest ninja', () => {
    const match = bossMatch();
    assert.deepEqual(match.board.bot.map((unit) => unit.hpCap), [220, 160, 130]);
    const state = towerBoss.createBossState();
    state.intent = intentFor(match, state);
    assert.equal(state.intent.skillId, towerBoss.SKILLS.mist);
    assert.match(state.intent.text, /Zabuza will use Hidden Mist Technique/);

    const result = runBossTurn(match, state);
    assert.deepEqual(result.usedSlots, [0]);
    assert.ok(match.board.bot[0].state.statuses.some((status) => status.id === 'zabuza_hidden_mist_defense'));

    match.board.p[0].hp = 40;
    match.board.p[2].hp = 60;
    state.intent = intentFor(match, state);
    assert.equal(state.intent.skillId, towerBoss.SKILLS.prison);
    assert.equal(state.intent.targetSlot, 1, 'the healthiest ninja is imprisoned');
    runBossTurn(match, state);
    assert.ok(match.board.p[1].state.statuses.some((status) => status.id === 'zabuza_water_prison'));
});

test('stunning the caster interrupts the telegraphed technique', () => {
    const match = bossMatch();
    const state = towerBoss.createBossState();
    state.intent = intentFor(match, state);
    battleLogic.applyStatus({ targetState: match.board.bot[0].state, statusId: 'test_stun', duration: 1,
        metadata: { harmful: true, cannotUseSkills: true } });
    const result = runBossTurn(match, state);
    assert.deepEqual(result.usedSlots, []);
    assert.match(state.lastEvent.text, /Interrupted! Zabuza was stunned/);
    assert.ok(!match.board.bot[0].state.statuses.some((status) => status.id === 'zabuza_hidden_mist_defense'));
});

test('Haku at half health raises the mirrors; Haku falling enrages Zabuza', () => {
    const match = bossMatch();
    const state = towerBoss.createBossState();
    match.board.bot[1].hp = 80;
    state.intent = intentFor(match, state);
    assert.equal(state.intent.skillId, towerBoss.SKILLS.mirrors);
    runBossTurn(match, state);
    assert.equal(state.mirrorsTriggered, true);
    assert.equal(state.phase, 2);
    assert.ok(match.board.bot[1].state.statuses.some((status) => status.id === 'haku_mirror_guard'));
    assert.notEqual(intentFor(match, state).skillId, towerBoss.SKILLS.mirrors, 'the mirrors trigger once');

    match.board.bot[1].hp = 0;
    match.board.bot[1].alive = false;
    runBossTurn(match, state);
    assert.equal(state.enraged, true);
    assert.ok(match.board.bot[0].state.statuses.some((status) => status.id === towerBoss.ENRAGE_STATUS.statusId));
});

test('the battle payload describes the tower encounter and boss telegraph', () => {
    const state = towerBoss.createBossState();
    state.intent = { actorName: 'Zabuza', skillName: 'Water Prison Technique', targetName: 'Gato', text: 'x',
        skillImage: '', skillDescription: '' };
    const payload = serializeTowerEncounter({ runId: 'r', kind: 'boss', floor: 10, name: 'Demon', affixes: ['fortified'], boss: state });
    assert.equal(payload.totalFloors, 10);
    assert.equal(payload.affixes[0].name, 'Fortified');
    assert.equal(payload.boss.intent.skillName, 'Water Prison Technique');
    assert.ok(payload.boss.mechanics.length >= 3);
    assert.equal(serializeTowerEncounter(null), null);
});

test('a second death is permanent; dead ninjas cannot be healed or take scrolls, but can be replaced', () => {
    const run = draftedRun();
    towerRun.chooseNode(run, 'f1-0', rosterIds);
    towerRun.recordBattleResult(run, { won: true, units: [{ hp: 40 }, { hp: 0, alive: false }, { hp: 0, alive: false }] });
    assert.deepEqual(run.team.map((member) => member.hp), [65, 1, 1]);
    towerRun.skipReward(run);
    // Fight again: slot 1 dies a second time, slot 2 survives on its last life.
    run.status = 'battle';
    run.battle = { nodeId: 'f2-0', matchId: null, encounter: { kind: 'battle', floor: 2, name: 'x', enemyIds: [] } };
    towerRun.recordBattleResult(run, { won: true, units: [{ hp: 50 }, { hp: 0, alive: false }, { hp: 30 }] });
    assert.equal(run.team[1].dead, true);
    assert.equal(run.team[1].hp, 0);
    assert.equal(run.team[2].dead, false);
    assert.equal(run.team[2].hp, 55);
    towerRun.skipReward(run);
    const setup = (() => {
        run.status = 'battle';
        run.battle = { nodeId: 'f3-0', matchId: null, encounter: { kind: 'battle', floor: 3, name: 'x', enemyIds: [] } };
        return towerRun.buildBattleSetup(run);
    })();
    assert.equal(setup.team[1].dead, true);
    assert.equal(setup.team[1].hp, 0);
    // Winning again does not raise the dead.
    towerRun.recordBattleResult(run, { won: true, units: [{ hp: 50 }, { hp: 100 }, { hp: 50 }] });
    assert.equal(run.team[1].dead, true);
    assert.equal(run.team[1].hp, 0);
    const view = towerRun.serializeRun(run, () => null);
    assert.equal(view.team[1].dead, true);
    assert.equal(view.team[1].wounded, false);

    run.status = 'ramen';
    run.currentNodeId = 'f4-0';
    assert.throws(() => towerRun.applyRamen(run, 'rest', 1), /fallen for good/);
    towerRun.applyRamen(run, 'feast');
    assert.equal(run.team[1].hp, 0, 'a feast does not feed the dead');

    run.status = 'recruit';
    run.pending = { nodeId: 'f5-0', offers: [rosterIds.find((id) => !run.team.some((m) => m.characterId === id))] };
    towerRun.recruit(run, 0, 1);
    assert.equal(run.team[1].dead, false);
    assert.equal(run.team[1].fallen, false);
    assert.equal(run.team[1].hp, 100, 'a recruit fills the dead slot at full health');
});

test('leftover chakra carries into the next battle setup without a cap', () => {
    const run = draftedRun();
    towerRun.chooseNode(run, 'f1-0', rosterIds);
    towerRun.recordBattleResult(run, {
        won: true, units: [{ hp: 90 }, { hp: 90 }, { hp: 90 }],
        chakra: { taijutsu: 7, ninjutsu: 5, bloodline: 0, genjutsu: 4 },
    });
    towerRun.skipReward(run);
    const next = towerRun.getAvailableNodeIds(run).map((id) => towerRun.findNode(run, id)).find((node) => node.type === 'battle');
    towerRun.chooseNode(run, next.id, rosterIds);
    assert.deepEqual(towerRun.buildBattleSetup(run).chakra, { taijutsu: 7, ninjutsu: 5, bloodline: 0, genjutsu: 4 });
});

test('only self-applied stacks are carried out of a battle', () => {
    const unit = { state: { statuses: [
        { id: 'own_stacks', sourceUsername: 'p', sourceSlot: 0, remainingTurns: 99,
            metadata: { helpful: true, stackMetadataKey: 'charges', charges: 3 } },
        { id: 'own_stackable', sourceUsername: 'p', sourceSlot: 0, remainingTurns: 2, stacks: 2,
            metadata: { helpful: true, stackable: true } },
        { id: 'ally_stacks', sourceUsername: 'p', sourceSlot: 1, remainingTurns: 99,
            metadata: { helpful: true, stackMetadataKey: 'charges', charges: 1 } },
        { id: 'timed_buff', sourceUsername: 'p', sourceSlot: 0, remainingTurns: 1, metadata: { helpful: true, damageBonusFlat: 10 } },
        { id: 'enemy_debuff', sourceUsername: 'bot', sourceSlot: 0, remainingTurns: 99,
            metadata: { harmful: true, stackMetadataKey: 'marks', marks: 4 } },
        { id: 'my_passive', remainingTurns: 99,
            metadata: { passive: true, stackMetadataKey: 'rage', rage: 6, tooltipText: 'Rage 6', damageReductionFlat: 5 } },
        { id: 'flat_passive', remainingTurns: 99, metadata: { passive: true, damageReductionFlat: 5 } },
    ] } };
    const carried = towerRun.extractCarriedStatuses(unit, 'p', 0);
    assert.deepEqual(carried.map((entry) => entry.id), ['own_stacks', 'own_stackable', 'my_passive']);
    assert.deepEqual(carried[2].metadata, { tooltipText: 'Rage 6', rage: 6 }, 'only the passive counter is carried');
});

test('a real stack survives the battle and is restored on the next board', () => {
    const allies = ['gekko-hayate', 'haku', 'momochi-zabuza'];
    const first = towerMatch({ allies, enemies: WAVES });
    cast(first, 'p', 0, 0, ['bot', 0]);
    cast(first, 'p', 0, 0, ['bot', 1]);
    const charges = (unit) => unit.state.statuses.find((status) => status.id === 'gekko_hayate_crescent_moon')?.metadata?.charges;
    assert.equal(charges(first.board.p[0]), 2);

    const run = draftedRun();
    run.team[0].characterId = 'gekko-hayate';
    towerRun.chooseNode(run, 'f1-0', rosterIds);
    towerRun.recordBattleResult(run, { won: true, units: first.board.p });
    assert.equal(run.team[0].carriedStatuses.length, 1);

    const players = [{ username: 'p', team: allies.map(index) }, { username: 'bot', team: WAVES.map(index) }];
    const board = battleLogic.buildInitialBoard(players, characters);
    applyTowerSetupToBoard({
        board, username: 'p', botUsername: 'bot',
        setup: {
            team: allies.map((id, slot) => ({
                characterId: id, hp: 80, maxHp: 100, scrolls: [], dead: slot === 2,
                carriedStatuses: slot === 0 ? run.team[0].carriedStatuses : [],
            })),
            encounter: { kind: 'battle', hpMultiplier: 1, affixes: [] },
        },
    });
    assert.equal(charges(board.p[0]), 2, 'Hayate opens the next battle with his charges');
    assert.equal(board.p[2].alive, false, 'a permanently dead ninja starts the battle dead');
    assert.equal(board.p[2].hp, 0);
});
