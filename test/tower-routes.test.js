const { test } = require('node:test');
const assert = require('node:assert/strict');
const characters = require('../data/characters');
const createTowerRouter = require('../routes/tower.js');

// A small in-memory stand-in for the Mongo collections the Tower router uses.
const matches = (doc, query) => Object.entries(query).every(([key, condition]) => {
    const value = key.split('.').reduce((current, part) => current?.[part], doc);
    if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
        if ('$in' in condition) return condition.$in.includes(value);
        if ('$nin' in condition) return !condition.$nin.includes(value);
        if ('$ne' in condition) return value !== condition.$ne;
    }
    return value === condition;
});
const createCollection = (docs = []) => ({
    docs,
    async findOne(query, options = {}) {
        const found = docs.filter((doc) => matches(doc, query));
        if (options.sort?.createdAt === -1) found.sort((a, b) => b.createdAt - a.createdAt);
        return found[0] ? structuredClone(found[0]) : null;
    },
    find(query) {
        let found = docs.filter((doc) => matches(doc, query));
        const cursor = {
            sort(spec) { const [[key, dir]] = Object.entries(spec); found = found.slice().sort((a, b) => (a[key] - b[key]) * dir); return cursor; },
            limit(count) { found = found.slice(0, count); return cursor; },
            async toArray() { return structuredClone(found); },
        };
        return cursor;
    },
    async insertOne(doc) { docs.push(structuredClone(doc)); return { insertedId: docs.length }; },
    async updateOne(query, update) {
        const doc = docs.find((entry) => matches(entry, query));
        if (!doc) return { matchedCount: 0 };
        Object.assign(doc, structuredClone(update.$set || {}));
        Object.entries(update.$inc || {}).forEach(([path, amount]) => {
            const parts = path.split('.');
            const last = parts.pop();
            const target = parts.reduce((current, part) => (current[part] ??= {}), doc);
            target[last] = (Number(target[last]) || 0) + amount;
        });
        return { matchedCount: 1 };
    },
    async updateMany(query, update) {
        docs.filter((doc) => matches(doc, query)).forEach((doc) => Object.assign(doc, update.$set));
        return { matchedCount: 1 };
    },
});

const setup = () => {
    const towerRunsCollection = createCollection();
    const usersCollection = createCollection([{ username: 'p', profile: { ryo: 100 } }]);
    const liveMatches = new Map();
    const router = createTowerRouter({
        requireSession: (req, res, next) => next(),
        towerRunsCollection,
        usersCollection,
        getCharacters: () => characters,
        getMatchActive: async (matchId) => liveMatches.get(matchId) || null,
        buildTowerMatch: async ({ username, setup: battle }) => {
            const match = { matchId: `m${liveMatches.size + 1}`, status: 'active', mode: 'tower',
                players: [{ username }, { username: 'bot', isBot: true }],
                board: { [username]: battle.team.map((member) => ({ hp: member.hp, alive: true })) },
                towerEncounter: { runId: towerRunsCollection.docs[0].runId } };
            liveMatches.set(match.matchId, match);
            return match;
        },
        userToMatch: new Map(),
        removeQueuedEntry: () => {},
    });
    // Calls a route handler directly with a fake request and response.
    const call = async (method, path, body = {}) => {
        const layer = router.stack.find((entry) => entry.route?.path === path && entry.route.methods[method]);
        const handler = layer.route.stack[layer.route.stack.length - 1].handle;
        let status = 200;
        let payload;
        const res = { status(code) { status = code; return res; }, json(data) { payload = data; return res; } };
        await handler({ authUser: { username: 'p' }, body }, res);
        return { status, body: payload };
    };
    return { router, call, towerRunsCollection, usersCollection, liveMatches };
};

test('a run starts, drafts, scouts a battle and starts its match only on /battle', async () => {
    const { call, liveMatches } = setup();
    let response = await call('post', '/start', { mode: 'legacy' });
    assert.equal(response.body.run.status, 'draft');
    assert.equal(response.body.run.draft.offers.length, 3);
    assert.ok(response.body.run.draft.offers[0][0].name, 'offers carry character names');
    assert.deepEqual(response.body.run.draft.rerolls, [1, 1, 1]);
    const before = response.body.run.draft.offers[2].map((character) => character.characterId);
    response = await call('post', '/draft/reroll', { slot: 2 });
    assert.notDeepEqual(response.body.run.draft.offers[2].map((character) => character.characterId), before);
    assert.deepEqual(response.body.run.draft.rerolls, [1, 1, 0]);
    response = await call('post', '/draft', { picks: [0, 0, 0] });
    assert.equal(response.body.run.status, 'reward');
    assert.equal(response.body.run.reward.starting, true);
    assert.equal(response.body.run.reward.offers.length, 3);
    const starting = response.body.run.reward.offers[0];
    response = await call('post', '/reward', { offerIndex: 0, slot: 0 });
    assert.equal(response.body.run.status, 'map');
    const owned = starting.scope === 'team' ? response.body.run.teamScrolls : response.body.run.team[0].scrolls;
    assert.ok(owned.some((scroll) => scroll.key === starting.key), 'the starting scroll is learned');
    const nodeId = response.body.run.availableNodeIds[0];
    response = await call('post', '/node', { nodeId });
    assert.equal(response.body.run.status, 'battle');
    assert.equal(liveMatches.size, 0, 'scouting does not start a match');
    response = await call('post', '/battle');
    assert.equal(response.body.matchId, 'm1');
    response = await call('post', '/battle');
    assert.equal(response.body.matchId, 'm1', 'returning to the battle resumes the same match');
    response = await call('post', '/abandon');
    assert.equal(response.status, 409, 'a live battle cannot be abandoned');
});

test('a won battle carries health and offers a reward; a later loss pays account ryo once', async () => {
    const { router, call, liveMatches, usersCollection } = setup();
    await call('post', '/start', { mode: 'legacy' });
    await call('post', '/draft', { picks: [1, 1, 1] });
    let { body } = await call('post', '/reward/skip');
    await call('post', '/node', { nodeId: body.run.availableNodeIds[0] });
    await call('post', '/battle');
    const match = liveMatches.get('m1');
    match.board.p = [{ hp: 55, alive: true }, { hp: 0, alive: false }, { hp: 80, alive: true }];
    match.chakraPools = { ...(match.chakraPools || {}), p: { taijutsu: 2, ninjutsu: 0, bloodline: 1, genjutsu: 3 } };
    match.status = 'ended';
    match.winner = 'p';
    await router.recordTowerBattleResult(match, 'p');
    ({ body } = await call('get', '/run'));
    assert.equal(body.run.status, 'reward');
    assert.deepEqual(body.run.team.map((member) => member.hp), [80, 1, 100]);
    assert.equal(body.run.team[1].wounded, true);
    assert.equal(body.run.team[1].fallen, true);
    assert.deepEqual(body.run.chakra, { taijutsu: 2, ninjutsu: 0, bloodline: 1, genjutsu: 3 }, 'leftover chakra is kept');
    assert.equal(await router.recordTowerBattleResult(match, 'p'), null, 'a result is recorded once');

    ({ body } = await call('post', '/reward/skip'));
    assert.equal(body.run.status, 'map');
    // Walk up the map (resting or leaving non-combat nodes) until a fight is reached.
    for (let step = 0; step < 8; step += 1) {
        ({ body } = await call('get', '/run'));
        if (body.run.status === 'battle') break;
        if (body.run.status === 'ramen') await call('post', '/ramen', { option: 'feast' });
        else if (body.run.status === 'event') {
            const option = body.run.event.options.find((entry) => !entry.blocked && !entry.needsSlot);
            await call('post', '/event', { optionId: option.id });
        } else if (body.run.status === 'reward') await call('post', '/reward/skip');
        else if (body.run.status === 'merchant' || body.run.status === 'recruit') await call('post', '/leave');
        else {
            const open = body.run.map.floors.flat().filter((node) => body.run.availableNodeIds.includes(node.id));
            const next = open.find((node) => node.type === 'battle' || node.type === 'elite') || open[0];
            await call('post', '/node', { nodeId: next.id });
        }
    }
    assert.equal(body.run.status, 'battle');
    await call('post', '/battle');
    const lost = liveMatches.get('m2');
    lost.status = 'ended';
    lost.winner = 'bot';
    // The server stopped before reporting: the next read reconciles from the ended match.
    ({ body } = await call('get', '/run'));
    assert.equal(body.run.status, 'defeated');
    const floors = body.run.floor;
    assert.deepEqual(body.run.accountReward, { floorsCleared: floors, ryo: floors * 15 });
    assert.equal((await usersCollection.findOne({ username: 'p' })).profile.ryo, 100 + floors * 15);
    await call('get', '/run');
    assert.equal((await usersCollection.findOne({ username: 'p' })).profile.ryo, 100 + floors * 15, 'paid exactly once');
});

test('stale writes are refused instead of overwriting the run', async () => {
    const { call, towerRunsCollection } = setup();
    await call('post', '/start', { mode: 'legacy' });
    towerRunsCollection.docs[0].version += 5; // another request saved in between
    const original = towerRunsCollection.findOne.bind(towerRunsCollection);
    towerRunsCollection.findOne = async (query, options) => {
        const doc = await original(query, options);
        if (doc) doc.version -= 5;
        return doc;
    };
    const response = await call('post', '/draft', { picks: [0, 0, 0] });
    assert.equal(response.status, 409);
    assert.match(response.body.error, /changed/);
});

test('Act II over the API: continue past Zabuza, resolve the exam, and name a duel champion', async () => {
    const { call, towerRunsCollection, liveMatches } = setup();
    await call('post', '/start', { mode: 'legacy' });
    await call('post', '/draft', { picks: [0, 0, 0] });
    const doc = towerRunsCollection.docs[0];
    Object.assign(doc, { status: 'interlude', pending: { nextAct: 2 }, floor: 10, currentNodeId: 'f10-0',
        stats: { ...doc.stats, actsCleared: 1 } });
    let response = await call('post', '/continue', { choice: 'sideways' });
    assert.equal(response.status, 400);
    response = await call('post', '/continue', { choice: 'continue' });
    assert.equal(response.body.run.act.title, 'The Chūnin Exams');
    assert.equal(response.body.run.totalFloors, 20);
    assert.deepEqual(response.body.run.availableNodeIds, ['f11-0']);

    response = await call('post', '/node', { nodeId: 'f11-0' });
    assert.equal(response.body.run.status, 'event');
    assert.equal(response.body.run.event.title, 'The First Exam');
    const ryo = response.body.run.ryo;
    response = await call('post', '/event', { optionId: 'cheat' });
    assert.equal(response.body.run.ryo, ryo + 40);
    assert.equal(response.body.run.status, 'map');
    const forest = response.body.run.map.floors[11].filter((node) => response.body.run.availableNodeIds.includes(node.id));
    const fights = forest.filter((node) => ['battle', 'elite'].includes(node.type));
    assert.ok(fights.length >= 1, 'every forest floor has a battle');
    assert.deepEqual(Object.keys(response.body.run.previews).sort(), fights.map((node) => node.id).sort(), 'and its battles are scouted');

    // Jump to the preliminaries.
    Object.assign(towerRunsCollection.docs[0], { currentNodeId: 'f15-0', floor: 15, status: 'map' });
    response = await call('post', '/node', { nodeId: 'f16-1' });
    assert.equal(response.body.run.battle.encounter.duel, true);
    response = await call('post', '/battle');
    assert.equal(response.status, 400, 'a duel needs a champion');
    assert.match(response.body.error, /champion/);
    response = await call('post', '/battle', { slot: 2 });
    assert.ok(response.body.matchId);
    assert.equal(response.body.run.battle.championSlot, 2);
    assert.equal(liveMatches.size, 1);
});

// ---------------------------------------------------------------- Standard mode (Tower 2.0)
test('a new run is Standard (200 floors) by default; Legacy is chosen explicitly', async () => {
    let { call } = setup();
    let response = await call('post', '/start');
    assert.equal(response.body.run.mode, 'standard');
    assert.equal(response.body.run.totalFloors, 200);
    response = await call('post', '/draft', { picks: [0, 0, 0] });
    assert.equal(response.body.run.standard.checkpoints.length, 20);
    assert.ok(response.body.run.reward.offers.every((offer) => ['common', 'rare', 'forbidden', 'prismatic'].includes(offer.tier)));
    ({ call } = setup());
    response = await call('post', '/start', { mode: 'legacy' });
    assert.equal(response.body.run.mode, 'legacy');
    assert.equal(response.body.run.totalFloors, 10);
});

test('two simultaneous claims of a fusion-completing augment fuse exactly once', async () => {
    const { call, towerRunsCollection } = setup();
    await call('post', '/start');
    await call('post', '/draft', { picks: [0, 0, 0] });
    const doc = towerRunsCollection.docs[0];
    Object.assign(doc, { status: 'reward', pending: { nodeId: null, offers: ['a010-reinforced-armor'], ryoGained: 0 },
        teamScrolls: ['a002-iron-skin'] });
    const [first, second] = await Promise.all([call('post', '/reward', { offerIndex: 0 }), call('post', '/reward', { offerIndex: 0 })]);
    assert.deepEqual([first.status, second.status].sort(), [200, 409]);
    assert.deepEqual(towerRunsCollection.docs[0].teamScrolls, ['f02-fortress-doctrine']);
    assert.equal(towerRunsCollection.docs[0].fusions.length, 1);
    const retry = await call('post', '/reward', { offerIndex: 0 });
    assert.equal(retry.status, 400, 'a replayed claim is refused');
    assert.deepEqual(towerRunsCollection.docs[0].teamScrolls, ['f02-fortress-doctrine']);
});

test('the catalog lists all 100 augments, 20 fusions and 40 character augments with statuses', async () => {
    const { router } = setup();
    const layer = router.stack.find((entry) => entry.route?.path === '/catalog');
    let payload;
    await layer.route.stack.at(-1).handle({ authUser: { username: 'p' } }, { status() { return this; }, json(data) { payload = data; return this; } });
    assert.equal(payload.augments.length, 100);
    assert.equal(payload.fusions.length, 20);
    assert.equal(payload.characterAugments.length, 40);
    assert.ok(payload.characterAugments.every((entry) => entry.invalid.length === 0));
    assert.ok(payload.augments.every((entry) => entry.status === 'implemented' ? entry.descriptionNormalized : entry.needs));
});

test('a lost Standard run pays its account ryō exactly once', async () => {
    const { router, call, liveMatches, usersCollection, towerRunsCollection } = setup();
    await call('post', '/start');
    await call('post', '/draft', { picks: [0, 0, 0] });
    let { body } = await call('post', '/reward/skip');
    await call('post', '/node', { nodeId: body.run.availableNodeIds[0] });
    await call('post', '/battle');
    towerRunsCollection.docs[0].floor = 57; // as if the climb had reached floor 57
    const match = liveMatches.get('m1');
    Object.assign(match, { status: 'ended', winner: 'bot' });
    await router.recordTowerBattleResult(match, 'bot');
    await router.recordTowerBattleResult(match, 'bot');
    ({ body } = await call('get', '/run'));
    assert.equal(body.run.status, 'defeated');
    // 57 floors x 5, three champions (10, 30, 50) x 40, two major bosses (20, 40) x 80.
    assert.deepEqual(body.run.accountReward, { floorsCleared: 57, ryo: 57 * 5 + 3 * 40 + 2 * 80 });
    assert.equal((await usersCollection.findOne({ username: 'p' })).profile.ryo, 100 + 565);
    await call('get', '/run');
    assert.equal((await usersCollection.findOne({ username: 'p' })).profile.ryo, 100 + 565, 'paid exactly once');
});
