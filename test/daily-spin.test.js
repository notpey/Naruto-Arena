const test = require('node:test');
const assert = require('node:assert/strict');

const createDailySpinRouter = require('../routes/dailySpin.js');
const { WHEEL } = createDailySpinRouter;

const catalog = {
    avatars: [{ id: 'avatar_a', name: 'Leaf Avatar', price: 100, imageUrl: 'avatars/a.png' }, { id: 'avatar_draft', name: 'Draft', status: 'draft', imageUrl: 'avatars/d.png' }],
    borders: [{ id: 'border_b', name: 'ANBU Frame', price: 300, imageUrl: 'borders/b.svg' }],
    titles: [{ id: 'title_c', name: 'The Yellow Flash', price: 1000 }],
};
const characters = [{ characterId: 'haku', name: 'Haku', facePicture: 'haku.png' }, { characterId: 'gato', name: 'Gato', facePicture: 'gato.png' }];

function getPath(obj, path) { return path.split('.').reduce((value, key) => (value == null ? undefined : value[key]), obj); }
function parentOf(obj, path) {
    const keys = path.split('.');
    const last = keys.pop();
    return [keys.reduce((value, key) => (value[key] = value[key] || {}), obj), last];
}

// `rolls` feeds randomInt: the first roll picks the slice, the next picks the item.
function harness({ profile, rolls = [], unlocked = [] }) {
    const user = { _id: 'u1', username: 'Neji', profile: JSON.parse(JSON.stringify(profile)) };
    const usersCollection = {
        findOne: async () => user,
        updateOne: async (filter, update) => {
            for (const [path, condition] of Object.entries(filter)) {
                if (path !== '_id' && condition.$ne !== undefined && getPath(user, path) === condition.$ne) return { modifiedCount: 0 };
            }
            for (const [path, value] of Object.entries(update.$set || {})) { const [p, k] = parentOf(user, path); p[k] = value; }
            for (const [path, value] of Object.entries(update.$inc || {})) { const [p, k] = parentOf(user, path); p[k] = (Number(p[k]) || 0) + value; }
            for (const [path, value] of Object.entries(update.$addToSet || {})) { const [p, k] = parentOf(user, path); p[k] = Array.from(new Set([...(p[k] || []), value])); }
            return { modifiedCount: 1 };
        },
    };
    const queue = rolls.slice();
    const router = createDailySpinRouter({
        usersCollection,
        normalizeUserProfile: (doc) => doc.profile,
        cosmeticsService: { loadCatalog: async () => catalog },
        characterService: { getCharacters: () => characters },
        getCharacterAvailability: ({ characterId, profile: p }) => ({
            hidden: false,
            unlocked: unlocked.includes(characterId) || (p.missions?.unlockedCharacterIds || []).includes(characterId),
        }),
        randomInt: (max) => { const next = queue.length ? queue.shift() : 0; assert.ok(next < max); return next; },
        now: () => new Date('2026-11-02T15:00:00Z'),
    });
    const call = async (method) => {
        const layer = router.stack.find((entry) => entry.route && entry.route.path === '/api/daily-spin' && entry.route.methods[method]);
        const result = { status: 200 };
        const res = { set() { return res; }, status(code) { result.status = code; return res; }, json(data) { result.body = data; return res; } };
        await layer.route.stack[layer.route.stack.length - 1].handle({ authUser: { username: 'Neji' } }, res);
        return result;
    };
    return { user, call };
}

// Roll value that lands on the slice with this id.
function rollFor(id) {
    let offset = 0;
    for (const slice of WHEEL) {
        if (slice.id === id) return offset;
        offset += slice.weight;
    }
    throw new Error(`no slice ${id}`);
}

test('a cosmetic slice grants a random unowned, live item', async () => {
    const { user, call } = harness({ profile: { ryo: 0, inventory: { avatars: [] } }, rolls: [rollFor('avatar'), 0] });
    const spun = await call('post');
    assert.equal(spun.status, 200);
    assert.equal(spun.body.reward.kind, 'avatars');
    assert.equal(spun.body.reward.item.id, 'avatar_a', 'drafts are never handed out');
    assert.deepEqual(user.profile.inventory.avatars, ['avatar_a']);
    assert.equal(user.profile.dailySpin.lastSpinDate, '2026-11-02');
    assert.equal(user.profile.dailySpin.totalSpins, 1);
});

test('owning everything in a slice pays its Ryo fallback instead', async () => {
    const { user, call } = harness({ profile: { ryo: 10, inventory: { titles: ['title_c'] } }, rolls: [rollFor('title')] });
    const spun = await call('post');
    assert.deepEqual(spun.body.reward, { kind: 'ryo', ryo: 150, fallback: true, prize: 'titles' });
    assert.equal(user.profile.ryo, 160);
    assert.equal(spun.body.ryo, 160);
});

test('players can only spin once per UTC day', async () => {
    const { user, call } = harness({ profile: { ryo: 0 }, rolls: [rollFor('ryo-100'), rollFor('ryo-100')] });
    assert.equal((await call('post')).status, 200);
    const again = await call('post');
    assert.equal(again.status, 409);
    assert.equal(user.profile.ryo, 100);
    const status = await call('get');
    assert.equal(status.body.available, false);
    assert.equal(status.body.lastResult.ryo, 100);
    assert.equal(status.body.nextSpinAt, '2026-11-03T00:00:00.000Z');
});

test('the character slice unlocks a character the player is missing', async () => {
    const { user, call } = harness({ profile: { ryo: 0, missions: { unlockedCharacterIds: [] } }, rolls: [rollFor('character'), 0], unlocked: ['haku'] });
    const spun = await call('post');
    assert.equal(spun.body.reward.kind, 'character');
    assert.equal(spun.body.reward.character.characterId, 'gato');
    assert.deepEqual(user.profile.missions.unlockedCharacterIds, ['gato']);
});

test('the wheel marks slices the player has exhausted', async () => {
    const { call } = harness({ profile: { inventory: { borders: ['border_b'] } }, unlocked: ['haku', 'gato'] });
    const { body } = await call('get');
    assert.equal(body.available, true);
    const byId = Object.fromEntries(body.wheel.map((slice) => [slice.id, slice]));
    assert.equal(byId.border.exhausted, true);
    assert.equal(byId.character.exhausted, true);
    assert.equal(byId.avatar.exhausted, false);
    assert.equal(body.wheel.reduce((sum, slice) => sum + slice.chance, 0), 100);
});
