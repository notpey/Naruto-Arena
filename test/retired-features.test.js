const test = require('node:test');
const assert = require('node:assert/strict');
const retiredFeatures = require('../retiredFeatures');

test('retired story, summoning, shop, inventory, and Chunin Exam endpoints cannot be called directly', () => {
    for (const path of ['/story', '/story/start', '/gacha/banners', '/gacha/pull', '/gacha/craft-shards', '/gauntlet', '/gauntlet/run/start', '/shop', '/shop/purchase', '/profile/inventory']) {
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

test('battle, roster purchases, quests, and admin routes stay available', () => {
    for (const path of ['/characters', '/characters/buy-direct', '/match/join', '/quests', '/admin/promo-codes']) {
        let continued = false;
        retiredFeatures({ path }, {}, () => { continued = true; });
        assert.equal(continued, true, `Route blocked: ${path}`);
    }
});
