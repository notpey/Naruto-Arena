const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const makeAdminRouter = require('../routes/admin');

test('admin account detail loads and admins can assign Global Moderator without granting account access', async () => {
    const user = { _id: 'user-1', username: 'Reviewer', email: 'reviewer@example.com', role: 'player', profile: {} };
    const usersCollection = {
        findOne: async (query) => query._id === user._id || query.username === user.username ? { ...user } : null,
        updateOne: async (_filter, update) => { Object.assign(user, update.$set); return { matchedCount: 1 }; },
    };
    const app = express();
    app.use(express.json());
    const router = makeAdminRouter({
        requireSession: (req, _res, next) => { req.authUser = { username: 'Admin', role: req.get('x-role') || 'admin' }; next(); },
        usersCollection,
        normalizeUserProfile: (value) => value.profile || {},
        serializeAdminUserDocument: (value) => ({ username: value.username, email: value.email, role: value.role, profile: value.profile }),
    });
    assert.equal(router.stack.filter(layer => layer.route?.path === '/users/:username' && layer.route.methods.get).length, 1);
    assert.equal(router.stack.filter(layer => layer.route?.path === '/users/:username' && layer.route.methods.put).length, 1);
    app.use('/api/admin', router);
    const server = await new Promise(resolve => { const instance = app.listen(0, () => resolve(instance)); });
    const url = `http://127.0.0.1:${server.address().port}/api/admin/users/Reviewer`;
    try {
        const detailResponse = await fetch(url);
        assert.equal(detailResponse.status, 200);
        assert.equal((await detailResponse.json()).document.username, 'Reviewer');

        const savedResponse = await fetch(url, {
            method: 'PUT', headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ username: 'Reviewer', email: 'reviewer@example.com', role: 'global_moderator', profile: {} }),
        });
        assert.equal(savedResponse.status, 200);
        assert.equal((await savedResponse.json()).user.role, 'global_moderator');
        assert.equal(user.role, 'global_moderator');
        assert.equal((await fetch(url, { headers: { 'x-role': 'global_moderator' } })).status, 403);
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});
