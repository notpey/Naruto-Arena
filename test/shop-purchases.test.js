const test = require('node:test');
const assert = require('node:assert/strict');

const createShopRouter = require('../routes/shop.js');
const createProfileRouter = require('../routes/profile.js');

const catalog = {
    avatars: [{ id: 'avatar_a', name: 'Leaf Avatar', price: 100, rarity: 'common', imageUrl: 'avatars/a.png' }],
    borders: [{ id: 'border_b', name: 'ANBU Frame', price: 300, rarity: 'rare', imageUrl: 'borders/b.svg' }],
    titles: [{ id: 'title_c', name: 'The Yellow Flash', price: 1000, rarity: 'legendary' }],
};

function createHarness(profile) {
    const user = { _id: 'u1', username: 'Shino', profile: JSON.parse(JSON.stringify(profile)) };
    const getPath = (obj, path) => path.split('.').reduce((value, key) => (value == null ? undefined : value[key]), obj);
    const ensureParent = (obj, path) => {
        const keys = path.split('.');
        const last = keys.pop();
        const parent = keys.reduce((value, key) => (value[key] = value[key] || {}), obj);
        return [parent, last];
    };
    const usersCollection = {
        findOne: async () => user,
        updateOne: async (filter, update) => {
            for (const [path, condition] of Object.entries(filter)) {
                if (path === '_id') continue;
                const value = getPath(user, path);
                if (condition.$gte !== undefined && !(Number(value) >= condition.$gte)) return { modifiedCount: 0 };
                if (condition.$ne !== undefined && (Array.isArray(value) ? value.includes(condition.$ne) : value === condition.$ne)) return { modifiedCount: 0 };
            }
            for (const [path, amount] of Object.entries(update.$inc || {})) {
                const [parent, key] = ensureParent(user, path);
                parent[key] = (Number(parent[key]) || 0) + amount;
            }
            for (const [path, value] of Object.entries(update.$addToSet || {})) {
                const [parent, key] = ensureParent(user, path);
                parent[key] = Array.from(new Set([...(parent[key] || []), value]));
            }
            for (const [path, value] of Object.entries(update.$set || {})) {
                if (path === 'profile') user.profile = value;
                else if (path.startsWith('profile.')) { const [parent, key] = ensureParent(user, path); parent[key] = value; }
            }
            return { modifiedCount: 1 };
        },
    };
    const context = {
        usersCollection,
        normalizeUserProfile: (doc) => doc.profile,
        cosmeticsService: { loadCatalog: async () => catalog },
        requireSession: (req, res, next) => next(),
    };
    return { user, shop: createShopRouter(context), profile: createProfileRouter(context) };
}

async function call(router, method, path, body) {
    const layer = router.stack.find((entry) => entry.route && entry.route.path === path && entry.route.methods[method]);
    assert.ok(layer, `Missing route ${method.toUpperCase()} ${path}`);
    const result = { status: 200, body: null };
    const res = {
        set() { return res; },
        status(code) { result.status = code; return res; },
        json(data) { result.body = data; return res; },
    };
    const handlers = layer.route.stack;
    await handlers[handlers.length - 1].handle({ body, authUser: { username: 'Shino' } }, res);
    return result;
}

test('shop lists every cosmetic with owned and equipped flags', async () => {
    const { shop } = createHarness({ ryo: 500, avatarUrl: 'avatars/a.png', equippedTitle: '', equippedBorder: '', inventory: { avatars: ['avatar_a'], borders: [], titles: [] } });
    const { status, body } = await call(shop, 'get', '/api/shop');
    assert.equal(status, 200);
    assert.equal(body.ryo, 500);
    assert.deepEqual(body.items.avatars.map((item) => [item.id, item.owned, item.equipped]), [['avatar_a', true, true]]);
    assert.deepEqual(body.items.borders.map((item) => [item.id, item.owned, item.equipped]), [['border_b', false, false]]);
});

test('buying a cosmetic deducts Ryo once and adds it to the inventory', async () => {
    const { shop, user } = createHarness({ ryo: 500, inventory: { avatars: [], borders: [], titles: [] } });
    const bought = await call(shop, 'post', '/api/shop/purchase-cosmetic', { category: 'borders', itemId: 'border_b' });
    assert.equal(bought.status, 200);
    assert.equal(bought.body.ryo, 200);
    assert.equal(bought.body.items.borders[0].owned, true);
    assert.deepEqual(user.profile.inventory.borders, ['border_b']);

    const again = await call(shop, 'post', '/api/shop/purchase-cosmetic', { category: 'borders', itemId: 'border_b' });
    assert.equal(again.status, 400);
    assert.equal(user.profile.ryo, 200);
});

test('cosmetic purchases reject unknown items and short balances', async () => {
    const { shop, user } = createHarness({ ryo: 50, inventory: { avatars: [], borders: [], titles: [] } });
    assert.equal((await call(shop, 'post', '/api/shop/purchase-cosmetic', { category: 'titles', itemId: 'title_c' })).status, 400);
    assert.equal((await call(shop, 'post', '/api/shop/purchase-cosmetic', { category: 'titles', itemId: 'missing' })).status, 404);
    assert.equal((await call(shop, 'post', '/api/shop/purchase-cosmetic', { category: 'gacha', itemId: 'title_c' })).status, 400);
    assert.equal(user.profile.ryo, 50);
    assert.deepEqual(user.profile.inventory.titles, []);
});

test('equipping requires owned catalog items and supports removal', async () => {
    const { profile, user } = createHarness({ ryo: 0, avatarUrl: 'found-remaster.png', equippedTitle: '', equippedBorder: '', inventory: { avatars: [], borders: ['border_b'], titles: ['title_c'] } });
    assert.equal((await call(profile, 'post', '/api/profile/equip', { type: 'border', itemId: 'https://evil.example/frame.png' })).status, 404);
    assert.equal((await call(profile, 'post', '/api/profile/equip', { type: 'avatar', itemId: 'https://evil.example/a.png' })).status, 404);
    assert.equal((await call(profile, 'post', '/api/profile/equip', { type: 'avatar', itemId: 'avatar_a' })).status, 403);
    assert.equal(user.profile.avatarUrl, 'found-remaster.png');

    const border = await call(profile, 'post', '/api/profile/equip', { type: 'border', itemId: 'border_b' });
    assert.equal(border.status, 200);
    assert.equal(border.body.equippedBorder, 'borders/b.svg');
    const title = await call(profile, 'post', '/api/profile/equip', { type: 'title', itemId: 'title_c' });
    assert.equal(title.body.equippedTitle, 'The Yellow Flash');

    const removed = await call(profile, 'post', '/api/profile/equip', { type: 'border', itemId: '' });
    assert.equal(removed.body.equippedBorder, '');
    assert.equal(user.profile.equippedTitle, 'The Yellow Flash');
});
