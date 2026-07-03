const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const serverSource = () => fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');

test('battle bot fallback is configured for a two second queue wait', () => {
    const source = serverSource();
    assert.match(source, /const BATTLE_BOT_QUEUE_TIMEOUT_MS = 2 \* 1000;/);
    assert.match(source, /const battleBotQueueTimers = new Map\(\);/);
});

test('queued quick and ladder matches schedule the server-side bot fallback', () => {
    const source = serverSource();
    assert.match(source, /enqueuePlayer\(\{[\s\S]*allowBattleBot:[\s\S]*\}\);\s*scheduleBattleBotQueueCheck\(\{/);
    assert.match(source, /if \(queuedEntry\?\.entry\) \{\s*scheduleBattleBotQueueCheck\(\{/);
});
