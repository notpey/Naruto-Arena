const test = require('node:test');
const assert = require('node:assert/strict');

const rules = require('../services/cosmeticsRules.js');
const createAdminRouter = require('../routes/admin.js');
const createShopRouter = require('../routes/shop.js');

test('Imgur links are normalized to direct image URLs', () => {
    assert.deepEqual(rules.normalizeImgurUrl('https://i.imgur.com/AbC1234.PNG?1'), { url: 'https://i.imgur.com/AbC1234.png' });
    assert.deepEqual(rules.normalizeImgurUrl('imgur.com/AbC1234'.replace(/^/, 'https://')), { url: 'https://i.imgur.com/AbC1234.png' });
    assert.deepEqual(rules.normalizeImgurUrl('http://i.imgur.com/AbC1234.jpeg'), { url: 'https://i.imgur.com/AbC1234.jpg' });
    assert.match(rules.normalizeImgurUrl('https://imgur.com/a/AbC1234').error, /Album/);
    assert.match(rules.normalizeImgurUrl('https://example.com/a.png').error, /Imgur/);
});

test('cosmetic input validation enforces price, names, and border transparency formats', () => {
    const ok = rules.validateCosmeticInput({ category: 'avatars', name: ' Kakashi ', rarity: 'rare', price: 300, imageUrl: 'https://i.imgur.com/AbC1234.png' });
    assert.deepEqual(ok.errors, []);
    assert.equal(ok.item.name, 'Kakashi');
    assert.equal(ok.item.status, 'draft');

    const bad = rules.validateCosmeticInput({ category: 'titles', name: 'A'.repeat(29), rarity: 'mythic', price: 1.5 });
    assert.equal(bad.errors.length, 3);

    const jpgBorder = rules.validateCosmeticInput({ category: 'borders', name: 'Frame', rarity: 'rare', price: 10, imageUrl: 'https://i.imgur.com/AbC1234.jpg' });
    assert.match(jpgBorder.errors.join(' '), /PNG or WebP/);

    const legacy = { id: 'border_old', category: 'borders', name: 'Old', rarity: 'rare', price: 5, imageUrl: 'borders/anbu_frame.svg' };
    assert.deepEqual(rules.validateCosmeticInput({ imageUrl: 'borders/anbu_frame.svg', price: 50 }, legacy).errors, []);
});

test('image checks require square art and transparent borders', () => {
    assert.deepEqual(rules.checkCosmeticImage('avatars', { width: 150, height: 150, format: 'jpeg', hasAlpha: null }).errors, []);
    assert.match(rules.checkCosmeticImage('avatars', { width: 150, height: 100, format: 'png' }).errors[0], /square/);
    assert.match(rules.checkCosmeticImage('borders', { width: 200, height: 200, format: 'png', hasAlpha: false }).errors[0], /transparent/);
    assert.match(rules.checkCosmeticImage('borders', { width: 64, height: 64, format: 'png', hasAlpha: true }).errors[0], /at least/);
});

function createAdminHarness({ owners = {}, image = { width: 150, height: 150, format: 'png', hasAlpha: true } } = {}) {
    const catalog = { avatars: [], borders: [], titles: [] };
    const moves = [];
    const cosmeticsService = {
        loadCatalog: async () => catalog,
        addCosmeticItems: async (items) => items.forEach((item) => catalog[item.category].push(item)),
        updateCosmeticItem: async (id, item) => {
            const list = catalog[item.category];
            list[list.findIndex((entry) => entry.id === id)] = { ...item, id };
        },
        deleteCosmeticItem: async (id) => Object.keys(catalog).forEach((key) => { catalog[key] = catalog[key].filter((entry) => entry.id !== id); }),
    };
    const usersCollection = {
        aggregate: () => ({ toArray: async () => Object.entries(owners).map(([_id, count]) => ({ _id, count })) }),
        updateMany: async (filter, update) => { moves.push({ filter, update }); return { modifiedCount: 2 }; },
    };
    const router = createAdminRouter({
        requireSession: (req, res, next) => next(),
        cosmeticsService,
        usersCollection,
        inspectRemoteImage: async () => image,
    });
    const call = async (method, path, body = {}, params = {}) => {
        const layer = router.stack.find((entry) => entry.route && entry.route.path === path && entry.route.methods[method]);
        assert.ok(layer, `Missing ${method} ${path}`);
        const result = { status: 200, body: null };
        const res = { status(code) { result.status = code; return res; }, json(data) { result.body = data; return res; } };
        const req = { authUser: { username: 'boss', role: 'admin' }, body, params };
        // Run requireSession, adminCheck, then the handler, stopping if one doesn't call next().
        for (const entry of layer.route.stack) {
            let advanced = false;
            await entry.handle(req, res, () => { advanced = true; });
            if (!advanced) break;
        }
        return result;
    };
    return { catalog, moves, call };
}

test('admins publish batches all-or-nothing with unique names', async () => {
    const { catalog, call } = createAdminHarness();
    const created = await call('post', '/cosmetics', { items: [
        { category: 'avatars', name: 'Kakashi', rarity: 'rare', price: 300, status: 'live', imageUrl: 'https://imgur.com/AbC1234' },
        { category: 'avatars', name: 'Itachi', rarity: 'epic', price: 600, imageUrl: 'https://i.imgur.com/XyZ9876.png' },
    ] });
    assert.equal(created.status, 200, JSON.stringify(created.body));
    assert.equal(catalog.avatars.length, 2);
    assert.equal(catalog.avatars[0].imageUrl, 'https://i.imgur.com/AbC1234.png');
    assert.equal(catalog.avatars[1].status, 'draft');
    assert.match(catalog.avatars[0].id, /^avatar_kakashi_/);

    const rejected = await call('post', '/cosmetics', { items: [
        { category: 'avatars', name: 'Gai', rarity: 'rare', price: 100, imageUrl: 'https://i.imgur.com/Gai1234.png' },
        { category: 'avatars', name: 'kakashi', rarity: 'rare', price: 100, imageUrl: 'https://i.imgur.com/Kak9999.png' },
    ] });
    assert.equal(rejected.status, 400);
    assert.equal(rejected.body.failures[0].index, 1);
    assert.equal(catalog.avatars.length, 2, 'nothing from a failed batch is saved');
});

test('opaque borders are refused before they reach the shop', async () => {
    const { catalog, call } = createAdminHarness({ image: { width: 200, height: 200, format: 'png', hasAlpha: false } });
    const result = await call('post', '/cosmetics', { items: [{ category: 'borders', name: 'Solid', rarity: 'rare', price: 100, imageUrl: 'https://i.imgur.com/AbC1234.png' }] });
    assert.equal(result.status, 400);
    assert.match(result.body.error, /transparent/);
    assert.equal(catalog.borders.length, 0);
});

test('renaming a title carries players who have it equipped', async () => {
    const { catalog, moves, call } = createAdminHarness();
    await call('post', '/cosmetics', { items: [{ category: 'titles', name: 'Copy Ninja', rarity: 'epic', price: 650, status: 'live' }] });
    const id = catalog.titles[0].id;
    const renamed = await call('patch', '/cosmetics/:itemId', { name: 'The Copy Ninja' }, { itemId: id });
    assert.equal(renamed.status, 200, JSON.stringify(renamed.body));
    assert.equal(catalog.titles[0].name, 'The Copy Ninja');
    assert.deepEqual(moves[0].update, { $set: { 'profile.equippedTitle': 'The Copy Ninja' } });
    assert.equal(moves[0].filter['profile.equippedTitle'], 'Copy Ninja');
});

test('owned items cannot be deleted, only retired', async () => {
    const owners = {};
    const { catalog, call } = createAdminHarness({ owners });
    await call('post', '/cosmetics', { items: [{ category: 'titles', name: 'Rogue', rarity: 'rare', price: 100, status: 'live' }] });
    const id = catalog.titles[0].id;

    owners[id] = 3;
    const blocked = await call('delete', '/cosmetics/:itemId', {}, { itemId: id });
    assert.equal(blocked.status, 409);
    assert.match(blocked.body.error, /3 players own/);

    delete owners[id];
    const deleted = await call('delete', '/cosmetics/:itemId', {}, { itemId: id });
    assert.equal(deleted.status, 200);
    assert.equal(catalog.titles.length, 0);
});

test('the shop hides drafts and shows retired items only to owners', async () => {
    const catalog = {
        avatars: [],
        borders: [],
        titles: [
            { id: 't_live', name: 'Live', price: 10, status: 'live' },
            { id: 't_draft', name: 'Draft', price: 10, status: 'draft' },
            { id: 't_retired', name: 'Retired', price: 10, status: 'retired' },
            { id: 't_owned_retired', name: 'Kept', price: 10, status: 'retired' },
            { id: 't_legacy', name: 'Legacy', price: 10 },
        ],
    };
    const user = { _id: 'u', username: 'p', profile: { ryo: 100, inventory: { titles: ['t_owned_retired'] } } };
    const router = createShopRouter({
        usersCollection: { findOne: async () => user, updateOne: async () => ({ modifiedCount: 1 }) },
        normalizeUserProfile: (doc) => doc.profile,
        cosmeticsService: { loadCatalog: async () => catalog },
        requireSession: (req, res, next) => next(),
    });
    const run = async (method, path, body) => {
        const layer = router.stack.find((entry) => entry.route && entry.route.path === path && entry.route.methods[method]);
        const result = {};
        const res = { set() { return res; }, status(code) { result.status = code; return res; }, json(data) { result.body = data; return res; } };
        await layer.route.stack[layer.route.stack.length - 1].handle({ body, authUser: { username: 'p' } }, res);
        return result;
    };
    const listed = await run('get', '/api/shop');
    assert.deepEqual(listed.body.items.titles.map((item) => item.id), ['t_live', 't_owned_retired', 't_legacy']);
    assert.equal(listed.body.items.titles[1].retired, true);
    assert.equal((await run('post', '/api/shop/purchase-cosmetic', { category: 'titles', itemId: 't_draft' })).status, 404);
    assert.equal((await run('post', '/api/shop/purchase-cosmetic', { category: 'titles', itemId: 't_retired' })).status, 404);
});
