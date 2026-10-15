const test = require('node:test');
const assert = require('node:assert/strict');
const retiredFeatures = require('../retiredFeatures');

test('retired Story and summoning endpoints cannot be called directly', () => {
    for (const path of ['/story', '/story/start', '/gacha/banners', '/gacha/pull', '/gacha/craft-shards']) {
        let response;
        const res = {
            status(code) { response = { code }; return this; },
            json(body) { response.body = body; return this; },
        };
        retiredFeatures({ path }, res, () => assert.fail(`Route continued: ${path}`));
        assert.equal(response.code, 404);
        assert.equal(response.body.error, 'This feature is unavailable.');
    }
});

test('other API routes, including Chunin Exams, stay available', () => {
    for (const path of ['/gauntlet', '/gauntlet/start', '/quests', '/admin/gacha-banners']) {
        let continued = false;
        retiredFeatures({ path }, {}, () => { continued = true; });
        assert.equal(continued, true, `Route blocked: ${path}`);
    }
});
