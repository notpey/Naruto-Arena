// Tower 2.0: the 200-floor Standard mode, the four-tier augment registry, Scroll Fusion and
// the character-augment registry. Legacy behavior is covered by tower*.test.js.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const characters = require('../data/characters');
const battleLogic = require('../battleLogic');
const towerRun = require('../services/tower/towerRun');
const towerStandard = require('../services/tower/towerStandard');
const towerScrolls = require('../services/tower/towerScrolls');
const { AUGMENTS, AUGMENTS_BY_CODE } = require('../services/tower/towerAugments');
const { RECIPES, expectedTier } = require('../services/tower/towerFusions');
const { CHARACTER_AUGMENTS, validateCharacterAugments, eligibleCharacterAugments } = require('../services/tower/towerCharacterAugments');
const { applyTowerSetupToBoard } = require('../server.js');

const rosterIds = characters
    .filter((character) => Array.isArray(character.skills) && character.skills.length)
    .map((character) => character.characterId);
const skillsOf = (id) => characters.find((character) => character.characterId === id)?.skills || [];
const nameOf = (id) => characters.find((character) => character.characterId === id)?.name || id;
const index = (id) => characters.findIndex((character) => character.characterId === id);
const pool = () => ({ taijutsu: 20, ninjutsu: 20, bloodline: 20, genjutsu: 20 });
const id = (code) => AUGMENTS_BY_CODE.get(code).id;
const { STANDARD } = towerStandard;

const standardRun = (seed = 4242) => {
    const run = towerRun.createRun({ username: 'p', rosterIds, seed, runId: 'run-s', mode: 'standard' });
    towerRun.chooseDraft(run, [0, 0, 0]);
    towerRun.skipReward(run);
    return run;
};

const winAll = (run) => towerRun.recordBattleResult(run, {
    won: true, units: run.team.map((member) => ({ hp: member.hp, alive: !member.dead })),
    chakra: { taijutsu: 4, ninjutsu: 2, genjutsu: 1, bloodline: 0 },
});

// Plays the run, always taking the first open node; returns the floors entered in order.
const climb = (run, { until = STANDARD.totalFloors, onBattle = null } = {}) => {
    const floors = [];
    for (let guard = 0; guard < 3000 && towerRun.ACTIVE_STATUSES.has(run.status); guard += 1) {
        if (run.status === 'map') {
            if (run.floor >= until) break;
            const open = towerRun.getAvailableNodeIds(run);
            assert.ok(open.length, `a path is open after floor ${run.floor}`);
            towerRun.chooseNode(run, open[0], rosterIds, { nameOf, skillsOf });
            floors.push(towerRun.findNode(run, run.currentNodeId).floor);
        } else if (run.status === 'battle') {
            if (onBattle) onBattle(run.battle.encounter);
            winAll(run);
        } else if (run.status === 'reward') towerRun.skipReward(run);
        else if (run.status === 'event') {
            const view = towerRun.serializeRun(run, (cid) => ({ characterId: cid, name: cid }), { rosterIds });
            const option = view.event.options.find((entry) => !entry.blocked && !entry.needsSlot) ||
                view.event.options.find((entry) => !entry.blocked);
            towerRun.resolveEvent(run, option.id, 0, rosterIds, { nameOf });
        } else if (run.status === 'ramen') towerRun.applyRamen(run, 'feast');
        else towerRun.leaveNode(run);
    }
    return floors;
};

// ---------------------------------------------------------------- the 200-floor map
test('Standard mode is a 200-floor climb, never a 20-floor one', () => {
    assert.equal(STANDARD.totalFloors, 200);
    assert.equal(towerRun.MODES.standard.totalFloors, 200);
    assert.equal(towerRun.MODES.legacy.totalFloors, 20);
    const run = towerRun.createRun({ username: 'p', rosterIds, seed: 1, runId: 'r', mode: 'standard' });
    assert.equal(run.mode, 'standard');
    assert.equal(run.totalFloors, 200);
    towerRun.chooseDraft(run, [0, 0, 0]);
    const view = towerRun.serializeRun(run, (cid) => ({ characterId: cid, name: cid }), { rosterIds, skillsOf });
    assert.equal(view.totalFloors, 200);
    assert.equal(view.maxFloors, 200);
    assert.equal(view.standard.checkpoints.length, 20);
    assert.equal(view.standard.checkpoints.at(-1).floor, 200);
    assert.equal(view.standard.checkpoints.at(-1).kind, 'final');
});

test('over 100 seeds every segment is reachable, checkpointed and deterministic', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
        for (let segment = 0; segment < STANDARD.segments; segment += 1) {
            const map = towerRun.generateStandardSegment(seed, segment);
            assert.deepEqual(towerRun.generateStandardSegment(seed, segment), map, 'deterministic');
            map.floors.forEach((floor, row) => {
                if (row > 0) floor.forEach((node) => assert.ok(map.floors[row - 1].some((prev) => prev.next.includes(node.id)), `${node.id} reachable`));
                if (row < 9) floor.forEach((node) => assert.ok(node.next.length >= 1, 'no dead ends'));
            });
            const { firstFloor, lastFloor } = towerStandard.segmentRange(segment);
            assert.equal(map.floors.length, 10);
            assert.equal(map.floors[0][0].floor, firstFloor);
            assert.equal(map.floors[9][0].floor, lastFloor);
            const checkpoint = map.floors[9];
            assert.equal(checkpoint.length, 1, `floor ${lastFloor} is a single checkpoint node`);
            assert.equal(checkpoint[0].type, lastFloor % 20 === 0 ? 'boss' : 'miniboss');
            map.floors[8].forEach((node) => assert.ok(['ramen', 'merchant', 'fusion', 'recruit'].includes(node.type),
                `floor ${lastFloor - 1} offers recovery or a shop on every lane`));
        }
    }
});

test('the real map links every node, and a reload rebuilds the same segment', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
        const run = standardRun(seed);
        const first = JSON.stringify(run.map);
        const again = standardRun(seed);
        assert.equal(JSON.stringify(again.map), first, 'seeded map is deterministic');
        run.map.floors.forEach((floor, row) => {
            if (row === 0) return;
            floor.forEach((node) => assert.ok(run.map.floors[row - 1].some((prev) => prev.next.includes(node.id)),
                `seed ${seed}: ${node.id} is reachable`));
        });
        run.map.floors.slice(0, -1).forEach((floor) => floor.forEach((node) => assert.ok(node.next.length >= 1, 'no dead ends')));
    }
});

test('a full seeded climb visits floors 1 to 200 in order and ends in victory on 200', () => {
    for (const seed of [3, 77, 2026]) {
        const run = standardRun(seed);
        const bosses = [];
        const floors = climb(run, { onBattle: (encounter) => { if (encounter.kind === 'boss') bosses.push(encounter); } });
        assert.equal(run.status, 'victory', `seed ${seed} reached victory`);
        assert.equal(run.floor, 200);
        assert.deepEqual(floors, Array.from({ length: 200 }, (_, i) => i + 1), 'one floor per node, no act multiplier');
        assert.equal(bosses.length, 10, 'ten major bosses');
        assert.deepEqual(bosses.map((boss) => boss.floor), [20, 40, 60, 80, 100, 120, 140, 160, 180, 200]);
        const identities = bosses.map((boss) => boss.bossDef?.enemyIds[0] || boss.bossId);
        identities.slice(1).forEach((identity, i) => assert.notEqual(identity, identities[i], 'no back-to-back featured boss'));
        assert.ok(new Set(identities).size >= 5, 'bosses vary across the climb');
        const apex = bosses.at(-1);
        assert.equal(apex.final, true);
        assert.ok(apex.bossDef?.rotation?.length, 'the final boss telegraphs its techniques');
        assert.ok(apex.bossDef.trigger && apex.bossDef.enrage, 'the final boss has three phases');
        assert.ok(JSON.stringify(run).length < 40000, 'the run document stays small');
        assert.equal(run.map.floors.length, 10, 'only one segment is stored');
        const reward = towerRun.computeAccountReward(run);
        assert.deepEqual(reward, { floorsCleared: 200, ryo: 200 * 5 + 10 * 40 + 10 * 80 + 600 });
    }
});

test('floors 21, 100 and 199 are playable, and checkpoints sit on every tenth floor', () => {
    const run = standardRun(55);
    const kinds = {};
    const entered = climb(run, { until: 199, onBattle: (encounter) => { kinds[encounter.floor] = encounter; } });
    [21, 100, 199].forEach((floor) => assert.ok(entered.includes(floor), `floor ${floor} was entered`));
    assert.equal(run.floor, 199);
    assert.equal(run.status, 'map');
    assert.ok(kinds[10].checkpoint === 'mini' && kinds[30].checkpoint === 'mini' && kinds[190].checkpoint === 'mini');
    assert.ok(kinds[20].kind === 'boss' && kinds[100].kind === 'boss' && kinds[180].kind === 'boss');
    const open = towerRun.getAvailableNodeIds(run).map((nodeId) => towerRun.findNode(run, nodeId));
    assert.deepEqual(open.map((node) => node.type), ['boss']);
    assert.equal(open[0].floor, 200);
    towerRun.chooseNode(run, open[0].id, rosterIds, { nameOf, skillsOf });
    assert.equal(run.battle.encounter.final, true);
    winAll(run);
    assert.equal(run.status, 'victory');
    assert.equal(towerRun.recordBattleResult(run, { won: true }).status, 'victory', 'a replayed result changes nothing');
});

test('enemy health follows a capped curve, and late floors add affixes rather than slogs', () => {
    assert.equal(towerStandard.hpMultiplierFor(1), 1);
    assert.ok(towerStandard.hpMultiplierFor(100) < 1.8);
    assert.ok(towerStandard.hpMultiplierFor(200) <= 2);
    assert.ok(towerStandard.affixCountFor(150) > towerStandard.affixCountFor(20));
    const rng = towerRun.createRng(1, 'x');
    for (let i = 0; i < 50; i += 1) {
        const affixes = towerStandard.rollAffixes(rng, (items, r) => items.slice().sort(() => r() - 0.5), 3);
        assert.ok(!(affixes.includes('stalwart') && (affixes.includes('hidden-mist') || affixes.includes('sand-shroud'))),
            'stun immunity never stacks with heavy mitigation');
    }
});

test('carried chakra is capped at 3 in Standard mode, and Legacy keeps no cap', () => {
    const run = standardRun(9);
    climb(run, { until: 0 });
    towerRun.chooseNode(run, towerRun.getAvailableNodeIds(run)[0], rosterIds, { nameOf, skillsOf });
    winAll(run);
    assert.equal(Object.values(run.chakra).reduce((sum, amount) => sum + amount, 0), 3);
});

test('a run without a mode is Legacy, and Legacy keeps its 10 + 10 story map', () => {
    const run = towerRun.createRun({ username: 'p', rosterIds, seed: 12345, runId: 'old' });
    delete run.mode;
    assert.equal(towerRun.modeOf(run), 'legacy');
    towerRun.chooseDraft(run, [0, 0, 0]);
    assert.equal(run.map.floors.length, 10);
    assert.equal(run.map.floors[9][0].bossId, 'demon-of-the-mist');
    const view = towerRun.serializeRun(run, (cid) => ({ characterId: cid, name: cid }), { rosterIds });
    assert.equal(view.mode, 'legacy');
    assert.equal(view.totalFloors, 10);
    assert.equal(view.act.title, 'Land of Waves');
    assert.ok(view.reward.offers.every((offer) => ['genin', 'jonin', 'kage'].includes(offer.tier)), 'legacy tiers stay');
});

// ---------------------------------------------------------------- rewards and capacity
test('Standard drafts use four tiers; milestone bosses always show a Prismatic', () => {
    const run = standardRun(31);
    const tiers = new Set();
    climb(run, { until: 40 });
    assert.equal(run.floor, 40);
    // Replay floor 40's reward from the seed: a fresh run walked the same way gets the same offers.
    const again = standardRun(31);
    let fortyOffers = null;
    for (let guard = 0; guard < 2000 && again.floor < 40; guard += 1) {
        if (again.status === 'map') towerRun.chooseNode(again, towerRun.getAvailableNodeIds(again)[0], rosterIds, { nameOf, skillsOf });
        else if (again.status === 'battle') {
            const floor = again.battle.encounter.floor;
            winAll(again);
            if (floor === 40) fortyOffers = again.pending.offers.slice();
            again.pending.offers.forEach((key) => tiers.add(towerScrolls.standardTierOf(key)));
            towerRun.skipReward(again);
        } else if (again.status === 'event') {
            const view = towerRun.serializeRun(again, (cid) => ({ characterId: cid, name: cid }), { rosterIds });
            towerRun.resolveEvent(again, (view.event.options.find((o) => !o.blocked && !o.needsSlot) || view.event.options.find((o) => !o.blocked)).id, 0, rosterIds, { nameOf });
        } else if (again.status === 'ramen') towerRun.applyRamen(again, 'feast');
        else if (again.status === 'reward') towerRun.skipReward(again);
        else towerRun.leaveNode(again);
    }
    assert.ok(fortyOffers, 'floor 40 offered a reward');
    assert.ok(fortyOffers.some((key) => towerScrolls.standardTierOf(key) === 'prismatic'), 'milestone Prismatic');
    assert.ok(fortyOffers.some((key) => towerScrolls.standardTierOf(key) === 'forbidden'), 'a boss always shows a Forbidden');
    tiers.forEach((tier) => assert.ok(towerScrolls.STANDARD_TIERS.includes(tier)));
    assert.ok(tiers.has('common') && tiers.has('rare'));
});

test('Prismatic pity is bounded: no more than 15 drafts in a row without one', () => {
    const run = standardRun(808);
    let streak = 0;
    let worst = 0;
    for (let guard = 0; guard < 3000 && towerRun.ACTIVE_STATUSES.has(run.status); guard += 1) {
        if (run.status === 'map') towerRun.chooseNode(run, towerRun.getAvailableNodeIds(run)[0], rosterIds, { nameOf, skillsOf });
        else if (run.status === 'battle') {
            winAll(run);
            if (run.status !== 'reward') break;
            const prismatic = run.pending.offers.some((key) => towerScrolls.standardTierOf(key) === 'prismatic');
            streak = prismatic ? 0 : streak + 1;
            worst = Math.max(worst, streak);
            towerRun.skipReward(run);
        } else if (run.status === 'event') {
            const view = towerRun.serializeRun(run, (cid) => ({ characterId: cid, name: cid }), { rosterIds });
            towerRun.resolveEvent(run, (view.event.options.find((o) => !o.blocked && !o.needsSlot) || view.event.options.find((o) => !o.blocked)).id, 0, rosterIds, { nameOf });
        } else if (run.status === 'ramen') towerRun.applyRamen(run, 'feast');
        else if (run.status === 'reward') towerRun.skipReward(run);
        else towerRun.leaveNode(run);
    }
    assert.ok(worst < STANDARD.prismaticPity, `longest streak ${worst}`);
});

test('full team slots ask for a replacement; the replaced scroll is salvaged, never silently lost', () => {
    const run = standardRun(5);
    const commons = AUGMENTS.filter((entry) => entry.impl).map((entry) => entry.id);
    run.teamScrolls = commons.slice(0, STANDARD.teamScrollCap);
    run.status = 'reward';
    run.pending = { nodeId: null, offers: [commons[STANDARD.teamScrollCap]], ryoGained: 0 };
    assert.throws(() => towerRun.chooseReward(run, 0, null), (error) => error.status === 409 && /full/.test(error.message));
    assert.equal(run.teamScrolls.length, STANDARD.teamScrollCap, 'nothing changed');
    const ryo = run.ryo;
    towerRun.chooseReward(run, 0, null, { replaceKey: commons[0] });
    assert.equal(run.teamScrolls.length, STANDARD.teamScrollCap);
    assert.ok(!run.teamScrolls.includes(commons[0]));
    assert.ok(run.teamScrolls.includes(commons[STANDARD.teamScrollCap]));
    assert.equal(run.ryo, ryo + STANDARD.salvageRyo);
});

// ---------------------------------------------------------------- fusion
// Fusion is automatic: taking the second augment of a recipe fuses the pair on the spot.
const offering = (run, keys) => {
    run.status = 'reward';
    run.pending = { nodeId: null, offers: keys, ryoGained: 0 };
    return run;
};

test('taking the second half of a recipe fuses the pair on the spot', () => {
    const run = offering(standardRun(6), [id('A010')]);
    run.teamScrolls = [id('A002'), id('A015')];
    const view = towerRun.serializeRun(run, (cid) => ({ characterId: cid, name: cid }), { rosterIds });
    assert.equal(view.reward.offers[0].fusion.name, 'Fortress Doctrine', 'the offer says it completes a fusion');
    assert.equal(view.reward.offers[0].fusion.partner, 'Iron Skin');
    towerRun.chooseReward(run, 0, null);
    assert.deepEqual(run.teamScrolls, [id('A015'), 'f02-fortress-doctrine']);
    assert.deepEqual(run.fusions.map((entry) => entry.recipeId), ['F02']);
    assert.equal(run.lastFusion.result, 'f02-fortress-doctrine');
    const after = towerRun.serializeRun(run, (cid) => ({ characterId: cid, name: cid }), { rosterIds });
    assert.equal(after.lastFusion.name, 'Fortress Doctrine');
    assert.deepEqual(after.lastFusion.consumed.map((entry) => entry.name), ['Iron Skin', 'Reinforced Armor']);
    assert.throws(() => towerRun.chooseReward(run, 0, null), /no reward/, 'a replayed claim cannot fuse twice');
});

test('a fusion needs no free slot, and only team augments ever fuse', () => {
    const others = AUGMENTS.filter((entry) => entry.impl && !['A002', 'A010'].includes(entry.code)).map((entry) => entry.id);
    const run = offering(standardRun(7), [id('A010')]);
    run.teamScrolls = [id('A002'), ...others.slice(0, STANDARD.teamScrollCap - 1)];
    towerRun.chooseReward(run, 0, null);
    assert.ok(run.teamScrolls.includes('f02-fortress-doctrine'), 'full slots still fuse');
    assert.equal(run.teamScrolls.length, STANDARD.teamScrollCap, 'the pair became one slot: nothing salvaged, nothing over the cap');

    const lone = offering(standardRun(8), [id('A010')]);
    lone.team[0].scrolls = [id('A002')]; // a ninja's own scrolls are never ingredients
    towerRun.chooseReward(lone, 0, null);
    assert.deepEqual(lone.teamScrolls, [id('A010')]);
    assert.equal(lone.fusions.length, 0);
});

test('Legacy runs never fuse, and new Standard segments have no Fusion Chamber', () => {
    for (let seed = 1; seed <= 100; seed += 1) {
        for (let segment = 0; segment < STANDARD.segments; segment += 1) {
            assert.ok(towerRun.generateStandardSegment(seed, segment).floors.flat().every((node) => node.type !== 'fusion'));
        }
    }
    const legacy = towerRun.createRun({ username: 'p', rosterIds, seed: 3, runId: 'l' });
    legacy.teamScrolls = [id('A002')];
    assert.equal(towerRun.recipeCompletedBy(legacy, id('A010')), null);
});

test('a run saved inside a retired Fusion Chamber can leave it, and an old chamber node rests', () => {
    const run = standardRun(9);
    run.status = 'fusion';
    run.currentNodeId = run.map.floors[0][0].id;
    run.pending = { nodeId: run.currentNodeId };
    towerRun.leaveNode(run);
    assert.equal(run.status, 'map');
    const old = standardRun(10);
    old.map.floors[0][0].type = 'fusion';
    towerRun.chooseNode(old, old.map.floors[0][0].id, rosterIds, { nameOf, skillsOf });
    assert.equal(old.status, 'ramen');
});

test('fusion results build real statuses, and a consumed ingredient no longer applies', () => {
    const board = (scrolls) => {
        const players = [{ username: 'p', team: ['momochi-zabuza', 'haku', 'gato'].map(index) }, { username: 'bot', team: ['gato', 'haku', 'baki'].map(index) }];
        const built = battleLogic.buildInitialBoard(players, characters);
        applyTowerSetupToBoard({ board: built, username: 'p', botUsername: 'bot', setup: {
            team: [0, 1, 2].map((slot) => ({ characterId: players[0].team[slot], hp: 100, maxHp: 100, scrolls })),
            encounter: { kind: 'battle', hpMultiplier: 1, affixes: [] },
        } });
        return built;
    };
    const dd = (built) => built.p[0].state.statuses.reduce((sum, status) => sum + (Number(status.metadata?.destructibleDefensePoints) || 0), 0);
    assert.equal(dd(board([id('A002'), id('A010')])), 10);
    assert.equal(dd(board(['f02-fortress-doctrine'])), 20);
});

// ---------------------------------------------------------------- registry health
test('the source catalog holds exactly A001-A100 with the sheet tiers', () => {
    assert.equal(AUGMENTS.length, 100);
    assert.deepEqual(AUGMENTS.map((entry) => entry.sourceNumber), Array.from({ length: 100 }, (_, i) => i + 1));
    assert.equal(new Set(AUGMENTS.map((entry) => entry.id)).size, 100, 'stable ids are unique');
    const counts = AUGMENTS.reduce((tally, entry) => ({ ...tally, [entry.tier]: (tally[entry.tier] || 0) + 1 }), {});
    assert.deepEqual(counts, { common: 20, rare: 30, forbidden: 30, prismatic: 20 });
    assert.ok(AUGMENTS.slice(0, 20).every((entry) => entry.tier === 'common'));
    assert.ok(AUGMENTS.slice(80).every((entry) => entry.tier === 'prismatic'));
    assert.equal(AUGMENTS_BY_CODE.get('A001').descriptionOriginal,
        'The first skill you use each battle that costs 2 or more chakra costs 1 less random chakra.');
    assert.equal(AUGMENTS_BY_CODE.get('A100').descriptionOriginal,
        'At the beginning of each battle, gain the effects of two random Common Scrolls you do not already possess.');
    AUGMENTS.forEach((entry) => {
        assert.ok(entry.descriptionOriginal.length > 20, entry.code);
        assert.ok(['implemented', 'pending', 'blocked'].includes(entry.implementationStatus));
        if (entry.impl) {
            assert.ok(entry.descriptionNormalized, `${entry.code} states the rule it implements`);
            assert.ok(towerScrolls.parseScrollKey(entry.id), `${entry.code} is a real scroll`);
            assert.ok(towerScrolls.STANDARD_OFFERED_SCROLL_KEYS.includes(entry.id), `${entry.code} is offered`);
            const info = towerScrolls.describeScroll(entry.id, { mode: 'standard' });
            assert.ok(fs.existsSync(path.join(__dirname, '..', info.icon)), `${info.icon} exists`);
        } else {
            assert.match(entry.needs, /^(Not operational yet: needs |Blocked: )/, `${entry.code} names its blocker`);
            assert.equal(towerScrolls.parseScrollKey(entry.id), null, `${entry.code} is never offered while pending`);
        }
    });
});

test('all 20 fusion recipes bind real source codes and promote tiers correctly', () => {
    assert.equal(RECIPES.length, 20);
    assert.deepEqual(RECIPES.map((recipe) => recipe.id), Array.from({ length: 20 }, (_, i) => `F${String(i + 1).padStart(2, '0')}`));
    RECIPES.forEach((recipe) => {
        const tiers = recipe.ingredients.map((code) => AUGMENTS_BY_CODE.get(code)?.tier);
        assert.ok(tiers.every(Boolean), `${recipe.id} ingredients exist`);
        assert.equal(expectedTier(tiers.slice().sort()), recipe.tier, `${recipe.id} tier`);
        if (recipe.impl) {
            recipe.ingredients.forEach((code) => assert.ok(AUGMENTS_BY_CODE.get(code).impl, `${recipe.id} ingredient ${code} is operational`));
        }
    });
    assert.equal(RECIPES.filter((recipe) => recipe.impl).length, 20, 'every recipe result is operational');
    assert.deepEqual(AUGMENTS.filter((entry) => entry.implementationStatus === 'blocked').map((entry) => entry.code), ['A086', 'A096']);
});

test('all 40 character augments name real characters and skills on the live roster', () => {
    assert.equal(CHARACTER_AUGMENTS.length, 40);
    assert.deepEqual(validateCharacterAugments(characters), []);
    const broken = validateCharacterAugments(characters.map((character) => (character.characterId === 'rock-lee'
        ? { ...character, skills: character.skills.filter((skill) => skill.id !== 'rock-lee-front-lotus') } : character)));
    assert.deepEqual(broken.map((problem) => problem.code), ['C15']);
    assert.ok(validateCharacterAugments(characters.filter((character) => character.characterId !== 'haku')).some((p) => p.code === 'C22'));
    assert.deepEqual(eligibleCharacterAugments([{ characterId: 'uzumaki-naruto' }], characters).map((entry) => entry.code), ['C01', 'C02', 'C03']);
    assert.deepEqual(eligibleCharacterAugments([{ characterId: 'uzumaki-naruto', dead: true }], characters), [], 'only for a living ninja');
    assert.deepEqual(CHARACTER_AUGMENTS.filter((entry) => !entry.impl).map((entry) => entry.code), [], 'all 40 are operational');
});

// ---------------------------------------------------------------- augment effects in real battles
const towerMatch = ({ allies, enemies, scrolls = [[], [], []], hp = [100, 100, 100], enemyHp = null }) => {
    const players = [{ username: 'p', team: allies.map(index) }, { username: 'bot', team: enemies.map(index) }];
    const board = battleLogic.buildInitialBoard(players, characters);
    applyTowerSetupToBoard({
        board, username: 'p', botUsername: 'bot',
        setup: {
            team: allies.map((cid, slot) => ({ characterId: cid, hp: hp[slot], maxHp: 100, scrolls: scrolls[slot] })),
            encounter: { kind: 'battle', hpMultiplier: 1, affixes: [] },
        },
    });
    if (enemyHp) board.bot.forEach((unit, slot) => { unit.hp = enemyHp[slot]; });
    const match = { players, board, chakraPools: { p: pool(), bot: pool() }, economy: { turnCounts: { p: 0, bot: 0 } }, pendingTurns: {} };
    Object.entries(match.board).forEach(([username, units]) => units.forEach((unit) => { unit.username = username; }));
    return match;
};
const cast = (match, username, slot, skillIndex, target) => {
    match.pendingTurns[username] = { queueOrder: [slot], queuedByActorSlot: {
        [slot]: { skillIndex, targetSelection: target ? [{ username: target[0], slot: target[1] }] : [] },
    } };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: username, characters });
};
const ALLIES = ['momochi-zabuza', 'haku', 'gato'];
const FOES = ['gato', 'haku', 'baki'];
// Zabuza's Kubikiribōchō: 30 Physical damage to one enemy.
const zabuzaHit = (scrolls, { enemyHp = null, setup = null, allyHp } = {}) => {
    const match = towerMatch({ allies: ALLIES, enemies: FOES, scrolls: [scrolls, scrolls, scrolls], enemyHp, hp: allyHp });
    if (setup) setup(match);
    const before = match.board.bot[0].hp;
    cast(match, 'p', 0, 0, ['bot', 0]);
    return before - match.board.bot[0].hp;
};
const takenFrom = (scrolls, { hp = 100 } = {}) => {
    const match = towerMatch({ allies: FOES, enemies: ALLIES, scrolls: [scrolls, scrolls, scrolls], hp: [hp, 100, 100] });
    const before = match.board.p[0].hp;
    cast(match, 'bot', 0, 0, ['p', 0]);
    return { taken: before - match.board.p[0].hp, hp: match.board.p[0].hp, match };
};

test('damage augments change real hits (A015, A016, A077, A073, A036, A020, A012, A038, A003, A068)', () => {
    assert.equal(zabuzaHit([]), 30);
    assert.equal(zabuzaHit([id('A015')]), 35, 'Sharpened Kunai: Physical +5');
    assert.equal(zabuzaHit([id('A016')]), 30, 'Focused Chakra does not touch a Physical skill');
    assert.equal(zabuzaHit([id('A077')]), 42, 'Forbidden Pact: +40% direct');
    assert.equal(zabuzaHit([id('A073')]), 45, 'Heavenly Restriction: Physical +50%');
    assert.equal(zabuzaHit([id('A052')]), 45, 'Eight Gates: +50% direct');
    assert.equal(zabuzaHit([id('A036')]), 30, 'Desperate Measures is idle above 29 health');
    assert.equal(zabuzaHit([id('A036')], { allyHp: [29, 100, 100] }), 36, 'Desperate Measures: +20% at 29 health');
    assert.equal(zabuzaHit([id('A020')], { enemyHp: [49, 100, 100] }), 35, 'Opportunist: +5 below 50');
    assert.equal(zabuzaHit([id('A020')]), 30);
    assert.equal(zabuzaHit([id('A012')], { setup: (match) => battleLogic.applyStatus({
        targetState: match.board.bot[0].state, statusId: 'stunned', duration: 2, metadata: { harmful: true, cannotUseSkills: true } }) }), 35,
    'Tactical Advantage: +5 against a stunned enemy');
    assert.equal(zabuzaHit([id('A038')], { setup: (match) => { match.board.p[1].alive = false; match.board.p[1].hp = 0; } }), 40,
        'Vengeful Spirit: +10 per dead ally');
    assert.equal(zabuzaHit([id('A068')]), 45, 'Sage Mode: +15');
    const precision = towerMatch({ allies: ALLIES, enemies: FOES, scrolls: [[id('A003')], [], []] });
    cast(precision, 'p', 0, 0, ['bot', 0]);
    assert.equal(100 - precision.board.bot[0].hp, 35, 'Precision Training: the first damaging skill +5');
    const after = precision.board.bot[0].hp;
    cast(precision, 'p', 0, 0, ['bot', 0]);
    assert.equal(after - precision.board.bot[0].hp, 30, 'only the first');
});

test('Heavenly Restriction raises Chakra and Mental skill costs by 1 random chakra', () => {
    const match = towerMatch({ allies: ALLIES, enemies: FOES, scrolls: [[id('A073')], [], []] });
    const prison = characters[index('momochi-zabuza')].skills.find((skill) => skill.id === 'momochi-zabuza-water-prison-technique');
    const plain = battleLogic.computeEffectiveEnergyCost({ skill: prison, actorState: towerMatch({ allies: ALLIES, enemies: FOES }).board.p[0].state });
    const raised = battleLogic.computeEffectiveEnergyCost({ skill: prison, actorState: match.board.p[0].state });
    assert.equal(raised.requiredRandom, plain.requiredRandom + 1);
});

test('defensive augments change real incoming damage (A002, A056, A014, A075, A008)', () => {
    assert.equal(takenFrom([]).taken, 30);
    assert.equal(takenFrom([id('A002')]).taken, 20, 'Iron Skin: 10 destructible defense');
    assert.equal(takenFrom([id('A056')]).taken, 0, 'Perfect Susanoo: 30 destructible defense and 10 damage reduction');
    assert.equal(takenFrom([id('A014')], { hp: 40 }).taken, 25, 'Battle Hardened: 5 reduction at 49 or less');
    assert.equal(takenFrom([id('A014')]).taken, 30);
    assert.equal(takenFrom([id('A075')], { hp: 10 }).hp, 1, 'The Immortal Body: never below 1');
    assert.equal(takenFrom([id('A008')], { hp: 60 }).hp, 40, 'Second Wind: dropping to 30 heals 10');
});

test('setup augments: extra chakra, Forbidden Exchange, The Tower\'s Blessing and Unstable Chakra', () => {
    const run = standardRun(21);
    towerRun.chooseNode(run, towerRun.getAvailableNodeIds(run)[0], rosterIds, { nameOf, skillsOf });
    run.teamScrolls = [id('A005'), id('A099')];
    const setup = towerRun.buildBattleSetup(run);
    assert.equal(Object.values(setup.bonusChakra).reduce((sum, amount) => sum + amount, 0), 5, '1 + 4 random chakra');
    assert.deepEqual(setup.team.map((member) => member.hp), [90, 90, 90], '30 health split evenly');
    assert.deepEqual(towerRun.buildBattleSetup(run).bonusChakra, setup.bonusChakra, 'the roll is seeded');

    run.teamScrolls = [id('A100')];
    const blessed = towerRun.buildBattleSetup(run);
    assert.equal(blessed.blessing.length, 2);
    blessed.blessing.forEach((key) => assert.equal(towerScrolls.standardTierOf(key), 'common'));
    assert.ok(blessed.team.every((member) => blessed.blessing.every((key) => member.scrolls.includes(key))));
    assert.deepEqual(towerRun.buildBattleSetup(run).blessing, blessed.blessing);

    const unstable = towerMatch({ allies: ALLIES, enemies: FOES, scrolls: [[id('A042')], [id('A042')], [id('A042')]] });
    const marked = unstable.board.p.filter((unit) => unit.state.statuses.some((status) => status.metadata?.turnEndRemoveRandomChakra));
    assert.equal(marked.length, 1, 'Unstable Chakra drains once, from the leader only');
});

test('Medical Training adds 5 to a real heal', () => {
    const heal = (scrolls) => {
        const match = towerMatch({ allies: ['haruno-sakura', 'haku', 'gato'], enemies: FOES, scrolls: [scrolls, [], []], hp: [100, 40, 100] });
        const sakura = characters[index('haruno-sakura')];
        const skillIndex = sakura.skills.findIndex((skill) => skill.id === 'haruno-sakura-rudimentary-healing');
        cast(match, 'p', 0, skillIndex, ['p', 1]);
        return match.board.p[1].hp - 40;
    };
    assert.equal(heal([id('A004')]), heal([]) + 5);
    assert.equal(heal([id('A068')]), heal([]) + 10);
});

test('PvP isolation: no character uses the Tower hook keys, and an ordinary board never carries them', () => {
    const source = fs.readdirSync(path.join(__dirname, '..', 'data', 'characters'))
        .map((file) => fs.readFileSync(path.join(__dirname, '..', 'data', 'characters', file), 'utf8')).join('\n');
    ['towerDirectDamagePercent', 'towerBonusDamageVsStunned', 'towerBonusDamageVsTargetHpBelow', 'towerScroll'].forEach((key) =>
        assert.ok(!source.includes(key), `${key} is Tower-only`));
    const players = [{ username: 'a', team: ALLIES.map(index) }, { username: 'b', team: FOES.map(index) }];
    const board = battleLogic.buildInitialBoard(players, characters);
    const match = { players, board, chakraPools: { a: pool(), b: pool() }, economy: { turnCounts: { a: 0, b: 0 } }, pendingTurns: {} };
    Object.entries(board).forEach(([username, units]) => units.forEach((unit) => { unit.username = username; }));
    assert.ok(board.a.every((unit) => unit.state.statuses.every((status) => !status.metadata?.towerScroll)));
    cast(match, 'a', 0, 0, ['b', 0]);
    assert.equal(100 - board.b[0].hp, 30, 'an ordinary hit is unchanged');
});

test('a Standard boss match carries its synthesized definition and telegraphs', () => {
    const run = standardRun(64);
    climb(run, { until: 19 });
    const node = towerRun.getAvailableNodeIds(run).map((nodeId) => towerRun.findNode(run, nodeId))[0];
    assert.equal(node.floor, 20);
    towerRun.chooseNode(run, node.id, rosterIds, { nameOf, skillsOf });
    const { encounter } = run.battle;
    assert.equal(encounter.kind, 'boss');
    const towerBoss = require('../services/tower/towerBoss');
    const state = towerBoss.createBossState(encounter.bossId, encounter.bossDef || null);
    assert.equal(towerBoss.defOf(state).name, (encounter.bossDef || towerBoss.getBossDefinition(encounter.bossId)).name);
    const view = towerRun.serializeRun(run, (cid) => ({ characterId: cid, name: nameOf(cid) }), { rosterIds, skillsOf });
    assert.ok(view.battle.encounter.boss.mechanics.length >= 3);
    assert.equal(view.battle.encounter.checkpoint, 'major');
});
