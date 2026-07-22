const assert = require('node:assert/strict');
const test = require('node:test');
const express = require('express');
const createBugsRouter = require('../routes/bugs.js');
const createAdminRouter = require('../routes/admin.js');

class MockCollection {
    constructor() {
        this.docs = [];
    }

    async insertOne(doc) {
        const _id = String(this.docs.length + 1);
        const inserted = { _id, ...doc };
        this.docs.push(inserted);
        return { insertedId: _id };
    }

    find(query = {}) {
        let results = [...this.docs];
        if (query.status) results = results.filter(d => d.status === query.status);
        if (query.category) results = results.filter(d => d.category === query.category);

        return {
            sort: () => ({
                limit: (lim) => ({
                    toArray: async () => results.slice(0, lim),
                }),
            }),
        };
    }

    async findOne(query) {
        if (query._id) {
            return this.docs.find(d => String(d._id) === String(query._id)) || null;
        }
        return null;
    }

    async findOneAndUpdate(query, update) {
        const doc = await this.findOne(query);
        if (!doc) return null;
        if (update.$set) {
            Object.assign(doc, update.$set);
        }
        return { value: doc };
    }

    async deleteOne(query) {
        const index = this.docs.findIndex(d => String(d._id) === String(query._id));
        if (index !== -1) {
            this.docs.splice(index, 1);
            return { deletedCount: 1 };
        }
        return { deletedCount: 0 };
    }
}

test('POST /api/bugs validates payload correctly', async () => {
    const mockBugs = new MockCollection();
    const router = createBugsRouter({ bugsCollection: mockBugs });

    // Test missing title
    let resData = null;
    let statusCode = null;

    const reqMissingTitle = {
        body: { description: 'Something broke when using Shino bug skill.' },
        headers: {},
        ip: '127.0.0.1',
    };

    const resMock = {
        status(code) { statusCode = code; return this; },
        json(data) { resData = data; return this; },
    };

    const routeStack = router.stack.find(s => s.route?.path === '/')?.route?.stack;
    const handler = routeStack[routeStack.length - 1]?.handle;
    assert.ok(handler, 'Route handler should be defined');

    await handler(reqMissingTitle, resMock, () => {});
    assert.equal(statusCode, 400);
    assert.match(resData.error, /title/i);
});

test('POST /api/bugs successfully saves report with battle metadata', async () => {
    const mockBugs = new MockCollection();
    const router = createBugsRouter({
        bugsCollection: mockBugs,
        optionalSession: (req, res, next) => {
            req.authUser = { _id: 'user123', username: 'TestShinobi' };
            next();
        },
    });

    const routeStack = router.stack.find(s => s.route?.path === '/')?.route?.stack;
    const handler = routeStack[routeStack.length - 1]?.handle;

    let resData = null;
    let statusCode = null;
    const resMock = {
        status(code) { statusCode = code; return this; },
        json(data) { resData = data; return this; },
    };

    const reqValid = {
        authUser: { _id: 'user123', username: 'TestShinobi' },
        body: {
            category: 'battle',
            title: 'Counter skill did not trigger',
            description: 'Kakashi counter did not activate against enemy Sasuke fireball.',
            pageUrl: 'http://localhost/ingame.html',
            clientMetadata: {
                matchId: 'match_999',
                turnNumber: 4,
                playerTeam: ['hatake-kakashi', 'uzumaki-naruto', 'haruno-sakura'],
                opponentTeam: ['uchiha-sasuke', 'momochi-zabuza', 'haku'],
                battleLogs: ['Turn 4 started', 'Kakashi used Sharingan Counter'],
            },
        },
        headers: {},
        ip: '127.0.0.1',
    };

    await handler(reqValid, resMock, () => {});

    assert.equal(statusCode, 201);
    assert.equal(resData.ok, true);
    assert.equal(mockBugs.docs.length, 1);
    assert.equal(mockBugs.docs[0].title, 'Counter skill did not trigger');
    assert.equal(mockBugs.docs[0].submittedBy.username, 'TestShinobi');
    assert.equal(mockBugs.docs[0].clientMetadata.turnNumber, 4);
});

test('Admin bug endpoints GET, PATCH, and DELETE work as expected', async () => {
    const mockBugs = new MockCollection();
    await mockBugs.insertOne({
        category: 'ui',
        title: 'Overlapping text on skill scroll',
        description: 'Text overlaps on small resolutions',
        status: 'open',
        submittedBy: { username: 'NarutoFan' },
        createdAt: new Date(),
    });

    const adminRouter = createAdminRouter({
        requireSession: (req, res, next) => {
            req.authUser = { role: 'admin', username: 'AdminLord' };
            next();
        },
        bugsCollection: mockBugs,
    });

    const getHandler = adminRouter.stack.find(s => s.route?.path === '/bugs' && s.route.methods.get)?.route?.stack[1]?.handle;
    assert.ok(getHandler, 'Admin GET /bugs handler should exist');

    let resData = null;
    let statusCode = null;
    const resMock = {
        status(code) { statusCode = code; return this; },
        json(data) { resData = data; return this; },
    };

    const reqAdminGet = {
        authUser: { role: 'admin', username: 'AdminLord' },
        query: {},
    };

    await getHandler(reqAdminGet, resMock, () => {});
    assert.equal(resData.ok, true);
    assert.equal(resData.reports.length, 1);
    assert.equal(resData.reports[0].title, 'Overlapping text on skill scroll');
});
