const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const fs = require('fs');

const createCosmeticsService = require('../services/cosmeticsService.js');
const createShopRouter = require('../routes/shop.js');
const createProfileRouter = require('../routes/profile.js');

test('Cosmetics & Inventory System Tests', async (t) => {
    // 1. In-memory App State Collection Mock
    const appStateStore = new Map();
    const mockAppStateCollection = {
        findOne: async (query) => appStateStore.get(query.key) || null,
        updateOne: async (query, update, options) => {
            let doc = appStateStore.get(query.key) || { key: query.key };
            if (update.$set) {
                doc = { ...doc, ...update.$set };
            }
            appStateStore.set(query.key, doc);
            return { acknowledged: true };
        }
    };

    const cosmeticsService = createCosmeticsService({ appStateCollection: mockAppStateCollection });

    await t.test('cosmeticsService loads catalog and adds single/bulk items', async () => {
        const catalog = await cosmeticsService.loadCatalog();
        assert.ok(Array.isArray(catalog.avatars), 'Avatars should be an array');
        assert.ok(Array.isArray(catalog.titles), 'Titles should be an array');
        assert.ok(Array.isArray(catalog.borders), 'Borders should be an array');
        assert.ok(catalog.avatars.some(a => a.id === 'avatar_anbu_mask'), 'Default catalog should contain avatar_anbu_mask');

        const testItems = [
            {
                id: 'avatar_bulk_1',
                name: 'Bulk Avatar 1',
                category: 'avatars',
                price: 250,
                rarity: 'rare',
                imageUrl: 'avatars/bulk_1.png'
            },
            {
                id: 'avatar_bulk_2',
                name: 'Bulk Avatar 2',
                category: 'avatars',
                price: 300,
                rarity: 'epic',
                imageUrl: 'avatars/bulk_2.png'
            },
            {
                id: 'title_test_flash',
                name: 'The Golden Flash',
                category: 'titles',
                price: 500,
                rarity: 'legendary'
            }
        ];
        await cosmeticsService.addCosmeticItems(testItems);

        const updated = await cosmeticsService.loadCatalog();
        assert.ok(updated.avatars.some(a => a.id === 'avatar_bulk_1'), 'Bulk avatar 1 should be added');
        assert.ok(updated.avatars.some(a => a.id === 'avatar_bulk_2'), 'Bulk avatar 2 should be added');
        assert.ok(updated.titles.some(t => t.id === 'title_test_flash'), 'Title should be added');
    });

    await t.test('cosmeticsService can save base64 avatar and border asset files', async () => {
        const fakeDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        const avatarUrl = cosmeticsService.saveAvatarFile(fakeDataUrl, 'test_avatar.png');
        assert.ok(avatarUrl.startsWith('avatars/avatar_'), 'Saved avatar path should start with avatars/avatar_');

        const borderUrl = cosmeticsService.saveBorderFile(fakeDataUrl, 'test_border.png');
        assert.ok(borderUrl.startsWith('borders/border_'), 'Saved border path should start with borders/border_');
        
        // Clean up created files
        const fullAvatarPath = path.join(__dirname, '..', avatarUrl);
        if (fs.existsSync(fullAvatarPath)) fs.unlinkSync(fullAvatarPath);
        const fullBorderPath = path.join(__dirname, '..', borderUrl);
        if (fs.existsSync(fullBorderPath)) fs.unlinkSync(fullBorderPath);
    });

    await t.test('cosmeticsService can delete items', async () => {
        await cosmeticsService.deleteCosmeticItem('avatar_bulk_1');
        const catalog = await cosmeticsService.loadCatalog();
        const found = catalog.avatars.find(a => a.id === 'avatar_bulk_1');
        assert.equal(found, undefined, 'Deleted avatar should no longer be in catalog');
    });

    // 2. User & Shop purchasing test
    const userStore = new Map();
    let sampleUser = {
        _id: 'user_test_1',
        username: 'SasukeFan',
        profile: {
            ryo: 1500,
            unlockedCharacters: ['naruto', 'sasuke', 'sakura'],
            inventory: {
                avatars: ['avatar_starter'],
                titles: ['title_genin'],
                borders: ['border_default']
            },
            equippedTitle: 'title_genin',
            equippedBorder: 'border_default',
            avatarUrl: 'found-remaster.png'
        }
    };
    userStore.set('user_test_1', sampleUser);

    const mockUsersCollection = {
        findOne: async (query) => {
            if (query._id) return userStore.get(query._id) || null;
            if (query.username) return sampleUser.username === query.username ? sampleUser : null;
            return null;
        },
        updateOne: async (query, update) => {
            if (update.$set) {
                sampleUser = { ...sampleUser, profile: { ...sampleUser.profile } };
                Object.keys(update.$set).forEach(k => {
                    if (k.startsWith('profile.')) {
                        const subKey = k.replace('profile.', '');
                        sampleUser.profile[subKey] = update.$set[k];
                    }
                });
                userStore.set(query._id, sampleUser);
            }
            return { acknowledged: true };
        }
    };

    const mockRequireSession = (req, res, next) => {
        req.authUser = { _id: 'user_test_1', username: 'SasukeFan' };
        next();
    };

    const shopRouter = createShopRouter({
        usersCollection: mockUsersCollection,
        normalizeUserProfile: (p) => p,
        getMissionLockedCharacterIds: () => [],
        getStoredMissionCatalog: () => [],
        characterService: { getCharacters: () => [], getCharacterCatalog: () => [] },
        cosmeticsService,
        profileHasUnlockedCharacter: () => false,
        getShopPriceForMissionId: () => 0,
        normalizeCharacterId: (id) => id,
        normalizeMissionState: (s) => s,
        normalizeMissionProgressEntry: (e) => e,
        requireSession: mockRequireSession
    });

    await t.test('Shop Purchase Cosmetic: purchase avatar with Ryo', async () => {
        let responseData = null;
        let responseStatus = 200;
        const req = {
            method: 'POST',
            url: '/api/shop/purchase-cosmetic',
            body: { itemId: 'avatar_anbu_mask', category: 'avatars' },
            authUser: { _id: 'user_test_1', username: 'SasukeFan' }
        };
        const res = {
            status: (s) => { responseStatus = s; return res; },
            json: (data) => { responseData = data; return res; }
        };

        const route = shopRouter.stack.find(r => r.route && r.route.path === '/api/shop/purchase-cosmetic');
        assert.ok(route, 'Shop router should have /api/shop/purchase-cosmetic route');
        
        await route.route.stack[route.route.stack.length - 1].handle(req, res);
        
        assert.equal(responseStatus, 200);
        assert.ok(responseData.ok, 'Purchase should succeed');
        assert.equal(responseData.ryo, 1250, 'Ryo balance should be 1500 - 250 = 1250');
        assert.ok(sampleUser.profile.inventory.avatars.includes('avatar_anbu_mask'), 'Inventory should now contain avatar_anbu_mask');
    });

    await t.test('Shop Purchase Cosmetic: purchase title with Ryo', async () => {
        let responseData = null;
        let responseStatus = 200;
        const req = {
            method: 'POST',
            url: '/api/shop/purchase-cosmetic',
            body: { itemId: 'title_leaf_prodigy', category: 'titles' },
            authUser: { _id: 'user_test_1', username: 'SasukeFan' }
        };
        const res = {
            status: (s) => { responseStatus = s; return res; },
            json: (data) => { responseData = data; return res; }
        };

        const route = shopRouter.stack.find(r => r.route && r.route.path === '/api/shop/purchase-cosmetic');
        await route.route.stack[route.route.stack.length - 1].handle(req, res);
        
        assert.equal(responseStatus, 200);
        assert.ok(responseData.ok, 'Title purchase should succeed');
        assert.ok(sampleUser.profile.inventory.titles.includes('title_leaf_prodigy'));
    });

    await t.test('Shop Purchase Cosmetic: reject duplicate purchase', async () => {
        let responseData = null;
        let responseStatus = 200;
        const req = {
            method: 'POST',
            url: '/api/shop/purchase-cosmetic',
            body: { itemId: 'avatar_anbu_mask', category: 'avatars' },
            authUser: { _id: 'user_test_1', username: 'SasukeFan' }
        };
        const res = {
            status: (s) => { responseStatus = s; return res; },
            json: (data) => { responseData = data; return res; }
        };

        const route = shopRouter.stack.find(r => r.route && r.route.path === '/api/shop/purchase-cosmetic');
        await route.route.stack[route.route.stack.length - 1].handle(req, res);
        
        assert.equal(responseStatus, 400);
        assert.ok(responseData.error.includes('already own'), 'Should reject duplicate purchase');
    });

    // 3. Profile router equip tests
    const profileRouter = createProfileRouter({
        usersCollection: mockUsersCollection,
        requireSession: mockRequireSession,
        normalizeUserProfile: (p) => p,
        serializeUserForClient: (u) => u,
        serializePublicUserProfile: (u) => u,
        avatarUpdateSchema: null,
        validateAvatarUrl: () => ({ valid: true }),
        validateBackgroundUrl: () => ({ valid: true }),
        getExperienceRequiredForNextLevel: () => 200,
        recalculatePlayerLadderStandings: () => {},
        cosmeticsService
    });

    await t.test('Profile Equip: equip owned avatar and title', async () => {
        let responseData = null;
        let responseStatus = 200;
        const req = {
            method: 'POST',
            url: '/api/profile/equip',
            body: { type: 'avatar', itemId: 'avatar_anbu_mask' },
            authUser: { _id: 'user_test_1', username: 'SasukeFan' }
        };
        const res = {
            status: (s) => { responseStatus = s; return res; },
            json: (data) => { responseData = data; return res; }
        };

        const route = profileRouter.stack.find(r => r.route && r.route.path === '/api/profile/equip');
        assert.ok(route, 'Profile router should have /api/profile/equip route');
        await route.route.stack[route.route.stack.length - 1].handle(req, res);

        assert.equal(responseStatus, 200);
        assert.equal(responseData.avatarUrl, 'sharingan-remaster.png?v=2', 'Avatar URL should be updated');

        // Now equip title
        const reqTitle = {
            method: 'POST',
            url: '/api/profile/equip',
            body: { type: 'title', itemId: 'title_leaf_prodigy' },
            authUser: { _id: 'user_test_1', username: 'SasukeFan' }
        };
        await route.route.stack[route.route.stack.length - 1].handle(reqTitle, res);
        assert.equal(sampleUser.profile.equippedTitle, 'Leaf Village Prodigy');
    });

    await t.test('Profile Inventory: fetch owned items with hydrated catalog data', async () => {
        let responseData = null;
        let responseStatus = 200;
        const req = {
            method: 'GET',
            url: '/api/profile/inventory',
            authUser: { _id: 'user_test_1', username: 'SasukeFan' }
        };
        const res = {
            status: (s) => { responseStatus = s; return res; },
            json: (data) => { responseData = data; return res; }
        };

        const route = profileRouter.stack.find(r => r.route && r.route.path === '/api/profile/inventory');
        assert.ok(route, 'Profile router should have /api/profile/inventory route');
        await route.route.stack[route.route.stack.length - 1].handle(req, res);

        assert.equal(responseStatus, 200);
        assert.ok(Array.isArray(responseData.avatars), 'Returned avatars should be an array');
        assert.ok(responseData.avatars.some(a => a.id === 'avatar_anbu_mask'), 'Returned avatars should include avatar_anbu_mask');
        assert.ok(Array.isArray(responseData.titles), 'Returned titles should be an array');
        assert.ok(responseData.titles.some(t => t.id === 'title_leaf_prodigy'), 'Returned titles should include title_leaf_prodigy');
        assert.equal(responseData.equippedTitle, 'Leaf Village Prodigy');
    });
});
