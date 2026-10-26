const assert = require('node:assert/strict');
const test = require('node:test');
const createAdminRouter = require('../routes/admin.js');

class MockAppStateCollection {
    constructor() {
        this.store = new Map();
    }

    async findOne(query) {
        if (query.key) {
            return this.store.get(query.key) || null;
        }
        return null;
    }

    async updateOne(query, update, options = {}) {
        const key = query.key;
        let existing = this.store.get(key) || {};
        if (update.$set) {
            existing = { ...existing, ...update.$set };
        }
        this.store.set(key, existing);
        return { acknowledged: true, upsertedId: options.upsert ? key : null };
    }
}

class MockCosmeticsService {
    constructor() {
        this.items = [];
        this.savedFiles = [];
    }

    async loadCatalog() {
        return {
            avatars: this.items.filter(i => i.category === 'avatars'),
            titles: this.items.filter(i => i.category === 'titles'),
            borders: this.items.filter(i => i.category === 'borders')
        };
    }

    async addCosmeticItem(item) {
        this.items.push(item);
        return item;
    }

    async addCosmeticItems(items) {
        this.items.push(...items);
        return items;
    }

    saveAvatarFile(dataUrl, filename) {
        const fileRef = `avatars/custom_${Date.now()}_${filename || 'avatar.png'}`;
        this.savedFiles.push({ fileRef, dataUrl });
        return fileRef;
    }

    saveBorderFile(dataUrl, filename) {
        const fileRef = `borders/custom_${Date.now()}_${filename || 'border.png'}`;
        this.savedFiles.push({ fileRef, dataUrl });
        return fileRef;
    }
}

test('PUT /api/admin/missions saves missions via provided saveMissionCatalog and fallback', async () => {
    let savedMissionsArg = null;
    const mockSaveMissionCatalog = async (missions, username) => {
        savedMissionsArg = { missions, username };
        return missions;
    };

    const mockAppState = new MockAppStateCollection();

    const routerWithInjected = createAdminRouter({
        requireSession: (req, res, next) => next(),
        saveMissionCatalog: mockSaveMissionCatalog,
        appStateCollection: mockAppState
    });

    const putMissionRoute = routerWithInjected.stack.find(s => s.route?.path === '/missions' && s.route.methods.put)?.route;
    assert.ok(putMissionRoute, 'PUT /missions route must exist');

    const handler = putMissionRoute.stack[putMissionRoute.stack.length - 1].handle;

    let resData = null;
    let statusCode = 200;
    const resMock = {
        status(c) { statusCode = c; return this; },
        json(d) { resData = d; return this; }
    };

    const reqMock = {
        authUser: { username: 'AdminMaster', role: 'admin' },
        body: {
            missions: [
                { missionId: 'm1', title: 'Genin Exam', description: 'Pass the exam' }
            ]
        }
    };

    await handler(reqMock, resMock);
    assert.equal(statusCode, 200);
    assert.equal(resData.ok, true);
    assert.equal(resData.missions.length, 1);
    assert.equal(savedMissionsArg?.username, 'AdminMaster');

    // Test fallback when saveMissionCatalog is NOT provided in context
    const routerFallback = createAdminRouter({
        requireSession: (req, res, next) => next(),
        appStateCollection: mockAppState
    });

    const fallbackHandler = routerFallback.stack.find(s => s.route?.path === '/missions' && s.route.methods.put)?.route?.stack.slice(-1)[0]?.handle;
    assert.ok(fallbackHandler, 'Fallback PUT /missions route handler must exist');

    resData = null;
    statusCode = 200;
    const reqMock2 = {
        authUser: { username: 'admin', role: 'user' }, // username is admin
        body: {
            missions: [
                { missionId: 'm2', title: 'Chunin Exam', description: 'Fight in the arena' }
            ]
        }
    };

    await fallbackHandler(reqMock2, resMock);
    assert.equal(statusCode, 200);
    assert.equal(resData.ok, true);
    assert.equal(resData.missions[0].missionId, 'm2');

    const storedInDb = await mockAppState.findOne({ key: 'missions' });
    assert.ok(storedInDb);
    assert.equal(storedInDb.missions[0].missionId, 'm2');
});

test('POST /api/admin/cosmetics/upload-avatars-bulk and /upload-avatar work end-to-end', async () => {
    const mockCosmetics = new MockCosmeticsService();

    const router = createAdminRouter({
        requireSession: (req, res, next) => next(),
        cosmeticsService: mockCosmetics
    });

    const bulkRoute = router.stack.find(s => s.route?.path === '/cosmetics/upload-avatars-bulk' && s.route.methods.post)?.route;
    assert.ok(bulkRoute, 'POST /cosmetics/upload-avatars-bulk route must exist');
    const bulkHandler = bulkRoute.stack[bulkRoute.stack.length - 1].handle;

    let resData = null;
    let statusCode = 200;
    const resMock = {
        status(c) { statusCode = c; return this; },
        json(d) { resData = d; return this; }
    };

    const reqBulk = {
        authUser: { username: 'admin', role: 'admin' },
        body: {
            items: [
                {
                    dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
                    filename: 'kakashi_custom.png',
                    name: 'Kakashi Custom',
                    price: 300,
                    rarity: 'epic',
                    description: 'Legendary copy ninja avatar'
                },
                {
                    dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
                    filename: 'itachi_custom.png',
                    name: 'Itachi Custom',
                    price: 400,
                    rarity: 'legendary',
                    description: 'Crow illusion avatar'
                }
            ]
        }
    };

    await bulkHandler(reqBulk, resMock);
    assert.equal(statusCode, 200);
    assert.equal(resData.ok, true);
    assert.equal(resData.count, 2);
    assert.equal(mockCosmetics.items.length, 2);
    assert.equal(mockCosmetics.items[0].name, 'Kakashi Custom');
    assert.equal(mockCosmetics.items[1].name, 'Itachi Custom');
    assert.match(mockCosmetics.items[0].imageUrl, /^avatars\/custom_/);

    // Test Single Avatar Upload
    const singleRoute = router.stack.find(s => s.route?.path === '/cosmetics/upload-avatar' && s.route.methods.post)?.route;
    assert.ok(singleRoute, 'POST /cosmetics/upload-avatar route must exist');
    const singleHandler = singleRoute.stack[singleRoute.stack.length - 1].handle;

    resData = null;
    statusCode = 200;
    const reqSingle = {
        authUser: { username: 'admin' },
        body: {
            dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
            filename: 'minato_flash.png',
            name: 'Minato Flash',
            price: 500,
            rarity: 'legendary'
        }
    };

    await singleHandler(reqSingle, resMock);
    assert.equal(statusCode, 200);
    assert.equal(resData.ok, true);
    assert.equal(mockCosmetics.items.length, 3);
    assert.equal(mockCosmetics.items[2].name, 'Minato Flash');
});

test('Mission deletion persistence does not resurrect deleted missions on refresh', async () => {
    const mockAppState = new MockAppStateCollection();

    // 1. Initially 3 missions are saved
    const initialMissions = [
        { missionId: 'm1', title: 'Mission 1' },
        { missionId: 'm2', title: 'Mission 2' },
        { missionId: 'm3', title: 'Mission 3' }
    ];

    await mockAppState.updateOne(
        { key: 'missions' },
        { $set: { key: 'missions', missions: initialMissions, updatedAt: new Date() } },
        { upsert: true }
    );

    // 2. Admin deletes 'm2' and saves catalog with [m1, m3]
    const remainingMissions = [
        { missionId: 'm1', title: 'Mission 1' },
        { missionId: 'm3', title: 'Mission 3' }
    ];

    const router = createAdminRouter({
        requireSession: (req, res, next) => next(),
        appStateCollection: mockAppState
    });

    const putHandler = router.stack.find(s => s.route?.path === '/missions' && s.route.methods.put)?.route?.stack.slice(-1)[0]?.handle;
    let resData = null;
    const resMock = {
        status(c) { return this; },
        json(d) { resData = d; return this; }
    };

    await putHandler({ authUser: { username: 'admin' }, body: { missions: remainingMissions } }, resMock);
    assert.equal(resData.ok, true);
    assert.equal(resData.missions.length, 2);

    // 3. Admin refreshes page (GET /api/admin/missions)
    const getHandler = router.stack.find(s => s.route?.path === '/missions' && s.route.methods.get)?.route?.stack.slice(-1)[0]?.handle;
    await getHandler({ authUser: { username: 'admin' } }, resMock);
    assert.equal(resData.ok, true);
    assert.equal(resData.missions.length, 2);
    assert.equal(resData.missions.find(m => m.missionId === 'm2'), undefined, 'Deleted mission m2 must not be resurrected');
});
