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
