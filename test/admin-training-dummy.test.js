const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const Joi = require('joi');

const serverSource = fs.readFileSync('server.js', 'utf8');
const selectionSource = fs.readFileSync('selection.html', 'utf8');
const scriptSource = fs.readFileSync('script.js', 'utf8');
const adminSource = fs.readFileSync('routes/admin.js', 'utf8');
const selectionRewardsSource = fs.readFileSync('selectionRewards.js', 'utf8');

test('Admin training dummy integration', (t) => {
    // 1. Verify server endpoint exists
    assert.match(adminSource, /router\.(post|get)\('\/training-dummy\/start'/);
    assert.match(adminSource, /Admin access required\./);
    assert.match(adminSource, /mode: 'training'/);
    assert.match(serverSource, /passive: true/);
    assert.match(serverSource, /TRAINING_DUMMY_DISPLAY_NAME/);
});

test('training matches do not grant normal match rewards', () => {
    assert.match(serverSource, /if \(match\.mode === 'training'\) \{\s*return null;\s*\}/);
});

test('selection screen exposes training dummy modal control', () => {
    assert.match(selectionSource, /id="modal-training-dummy-btn"/);
    assert.match(adminSource, /\/training-dummy\/start/);
    assert.match(scriptSource, /settingsTrainingDummyButton\.addEventListener\('click'/);
    assert.doesNotMatch(selectionRewardsSource, /\/api\/admin\/training-dummy\/start/);
});

test('training endpoint rejects a missing team and forwards a selected team', async () => {
    const calls = [];
    const router = require('../routes/admin.js')({
        requireSession: (_req, _res, next) => next(),
        teamSchema: Joi.array().items(Joi.number().integer().min(0)).length(3),
        userToMatch: new Map(),
        matchesCollection: { findOne: async () => null },
        usersCollection: { findOne: async () => ({ role: 'admin' }) },
        normalizeUserProfile: () => ({}),
        assertTeamCanBeUsed: async () => {},
        buildTrainingDummyMatch: async (input) => {
            calls.push(input);
            return { matchId: 'training-test', mode: 'training' };
        },
        buildMatchPayloadForUser: () => ({ ok: true, matchId: 'training-test' }),
    });
    const handler = router.stack.find((layer) => layer.route?.path === '/training-dummy/start')
        .route.stack.at(-1).handle;
    const invoke = async (body) => {
        const response = { statusCode: 200, status(code) { this.statusCode = code; return this; },
            json(payload) { this.payload = payload; return this; } };
        await handler({ authUser: { username: 'admin', role: 'admin' }, body }, response);
        return response;
    };
    const missing = await invoke({});
    assert.equal(missing.statusCode, 400);
    assert.equal(calls.length, 0);
    const valid = await invoke({ team: [0, 1, 2] });
    assert.equal(valid.statusCode, 200);
    assert.deepEqual(calls, [{ username: 'admin', team: [0, 1, 2] }]);
});

test('Admin mission catalog methods are properly injected into admin router', () => {
    assert.match(serverSource, /saveMissionCatalog,/);
    assert.match(serverSource, /getStoredMissionCatalog,/);
    assert.match(adminSource, /saveMissionCatalog/);
});

test('Admin shop cosmetics routes require an admin session', () => {
    assert.match(adminSource, /router\.get\('\/cosmetics',\s*requireSession,\s*adminCheck/);
    assert.match(adminSource, /router\.post\('\/cosmetics',\s*requireSession,\s*adminCheck/);
    assert.match(adminSource, /router\.post\('\/cosmetics\/inspect-image',\s*requireSession,\s*adminCheck/);
    assert.match(adminSource, /router\.patch\('\/cosmetics\/:itemId',\s*requireSession,\s*adminCheck/);
    assert.match(adminSource, /router\.delete\('\/cosmetics\/:itemId',\s*requireSession,\s*adminCheck/);
});


