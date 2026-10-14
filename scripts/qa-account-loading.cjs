// Runs only against an isolated local MongoDB database and local game server.
const { chromium, webkit } = require('@playwright/test');
const { MongoClient } = require('mongodb');
const { spawn } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const database = 'naruto_arena_qa_accounts_' + Date.now();
const port = 4012;
const base = `http://127.0.0.1:${port}`;
const out = path.join(root, 'tmp-ui-qa-screenshots', 'accounts');
fs.mkdirSync(out, { recursive: true });
const mongo = new MongoClient('mongodb://127.0.0.1:27017');
const server = spawn(process.execPath, ['server.js'], { cwd: root, windowsHide: true, env: {
    ...process.env, PORT: String(port), MONGODB_URI: 'mongodb://127.0.0.1:27017', MONGODB_DB: database,
    JWT_SECRET: crypto.randomBytes(48).toString('hex'), ALLOW_INSECURE_HTTP: 'true', NODE_ENV: 'test',
    RESEND_API_KEY: '', RECOVERY_EMAIL_FROM: '', PUBLIC_APP_URL: '', CORS_ORIGIN: base,
} });
const log = fs.createWriteStream(path.join(out, 'server.log'));
server.stdout.pipe(log); server.stderr.pipe(log);
const scenarios = [
    { name: 'desktop-chromium', type: chromium, viewport: { width: 1440, height: 900 } },
    { name: 'mobile-chromium-storage-blocked', type: chromium, viewport: { width: 390, height: 844 }, mobile: true, blockStorage: true },
    { name: 'landscape-chromium', type: chromium, viewport: { width: 844, height: 390 }, mobile: true },
    { name: 'mobile-webkit', type: webkit, viewport: { width: 390, height: 844 }, mobile: true },
    { name: 'landscape-webkit', type: webkit, viewport: { width: 844, height: 390 }, mobile: true },
];
const results = [];
(async () => {
    await mongo.connect();
    let online = false;
    for (let i = 0; i < 100; i++) {
        try { if ((await fetch(base + '/api/health')).ok) { online = true; break; } } catch {}
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    assert.ok(online, 'QA server started');
    for (const [i, scenario] of scenarios.entries()) {
        const browser = await scenario.type.launch({ headless: true });
        try {
            const context = await browser.newContext({ viewport: scenario.viewport, isMobile: !!scenario.mobile, hasTouch: !!scenario.mobile });
            await context.route('**/*imgur.com/**', route => route.abort());
            if (scenario.blockStorage) await context.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage disabled', 'SecurityError'); } }); });
            const page = await context.newPage();
            const errors = []; page.on('pageerror', error => errors.push(error.message));
            const username = 'qa_account_' + i;
            const password = 'QA-password-12345';
            const registered = await context.request.post(base + '/api/register', { data: { username, password, confirmPassword: password, email: `${username}@example.com` } });
            assert.equal(registered.status(), 201, await registered.text());
            await context.clearCookies();
            await page.goto(base + '/selection-login.html');
            await page.locator('#username').fill(username);
            await page.locator('#password').fill(password);
            await page.locator('.ok-button').click();
            await page.waitForURL('**/selection.html');
            await page.waitForFunction(() => document.querySelectorAll('.slot-list img').length >= 21 && [...document.querySelectorAll('.slot-list img')].every(img => img.complete && img.naturalWidth > 0 && img.src.includes('/assets/characters/')));
            assert.equal(await page.locator('.account-session-dialog[open]').count(), 0);
            const inventory = await context.request.get(base + '/api/profile/inventory');
            assert.equal(inventory.status(), 200, await inventory.text());
            // Dismiss only the game's existing help overlays before exercising its inventory tab.
            await page.evaluate(() => { window.dismissAcademyGuide?.(); const overlay = document.getElementById('mobile-orientation-overlay'); if (overlay) { overlay.classList.add('dismissed'); overlay.style.display = 'none'; } });
            await page.screenshot({ path: path.join(out, scenario.name + '-selection.png') });
            await page.locator('.selection-hub-tabs [data-hub-view="inventory"]').click();
            await page.waitForFunction(() => { const el = document.querySelector('.selection-hub-inventory-grid'); return el && el.textContent.trim() && !/Loading inventory|Unauthorized|Failed to load/i.test(el.textContent); });
            if (scenario.mobile) {
                const env = await page.locator('.selection-hub-environment').boundingBox();
                assert.ok(env.width <= scenario.viewport.width + 1, 'inventory fits phone width');
                assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'inventory has no horizontal clipping');
            }
            await page.screenshot({ path: path.join(out, scenario.name + '-inventory.png') });
            await page.locator('.selection-hub-tabs [data-hub-view="play"]').click();
            for (let slot = 0; slot < 3; slot++) await page.locator('.slot-item').nth(slot).dblclick();
            await page.waitForFunction(() => document.querySelectorAll('.selected-slot-image').length === 3);
            await page.locator('.quick-button').click();
            await page.waitForURL('**/ingame.html?matchId=*');
            await page.waitForFunction(() => document.querySelectorAll('.character-face').length === 6 && [...document.querySelectorAll('.character-face')].every(img => img.complete && img.naturalWidth > 0 && img.src.includes('/assets/characters/')));
            if (scenario.mobile) {
                const board = await page.locator('.backgroundingame').boundingBox();
                assert.ok(board.height <= scenario.viewport.height + 1 && board.width <= scenario.viewport.width + 1, 'whole battle board fits phone');
            }
            await page.screenshot({ path: path.join(out, scenario.name + '-battle.png') });
            const matchId = new URL(page.url()).searchParams.get('matchId');
            assert.equal((await context.request.post(base + '/api/match/' + matchId + '/surrender')).status(), 200);
            await page.goto(base + '/recover.html');
            await page.locator('#recovery-email').fill(`${username}@example.com`);
            await page.locator('#recovery-submit').click();
            await page.waitForFunction(() => document.getElementById('recovery-status').textContent.includes('not available yet'));
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
            // Inject only a hashed QA token into this isolated database, then exercise the real reset UI.
            const token = crypto.randomBytes(32).toString('hex');
            await mongo.db(database).collection('users').updateOne({ username }, { $set: { passwordReset: { tokenHash: crypto.createHash('sha256').update(token).digest('hex'), expiresAt: new Date(Date.now() + 60000) } } });
            await page.goto(base + '/recover.html#token=' + token);
            await page.locator('#recovery-password').fill('Updated-QA-password-123');
            await page.locator('#recovery-confirm').fill('Updated-QA-password-123');
            await page.locator('#recovery-submit').click();
            await page.waitForFunction(() => document.getElementById('recovery-status').textContent.includes('Password updated'));
            assert.equal((await context.request.get(base + '/api/me')).status(), 401, 'old cookie is revoked');
            await page.screenshot({ path: path.join(out, scenario.name + '-recovery.png') });
            const login = await context.request.post(base + '/api/login', { data: { username, password: 'Updated-QA-password-123' } });
            assert.equal(login.status(), 200);
            assert.equal((await context.request.get(base + '/api/profile/inventory')).status(), 200);
            // A temporary API outage should offer retry without pretending the cookie expired.
            await page.route('**/api/me', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"Temporary outage"}' }));
            await page.goto(base + '/selection');
            await page.waitForURL('**/selection.html');
            await page.getByText('We could not reach the game.', { exact: false }).waitFor();
            assert.equal(await page.locator('.account-session-dialog a').isVisible(), false);
            await page.unroute('**/api/me');
            await page.locator('.account-session-dialog button').click();
            await page.waitForFunction(() => !document.querySelector('.account-session-dialog[open]') && document.querySelectorAll('.slot-list img').length + document.querySelectorAll('.selected-slot-image').length >= 21).catch(async error => { console.log(JSON.stringify({url:page.url(),errors,dialog:await page.locator('.account-session-dialog').allTextContents()})); await page.screenshot({path:path.join(out,'retry-failure.png')}); throw error; });
            await context.clearCookies();
            await page.goto(base + '/selection.html');
            await page.locator('.account-session-dialog[open] a').waitFor({ state: 'visible' });
            const rect = await page.locator('.account-session-dialog').boundingBox();
            assert.ok(rect.x >= 0 && rect.x + rect.width <= scenario.viewport.width + 1, 'session prompt fits screen');
            await page.screenshot({ path: path.join(out, scenario.name + '-expired.png') });
            assert.deepEqual(errors, [], 'no browser exceptions');
            results.push({ name: scenario.name, passed: true });
            console.log(scenario.name + ': passed');
        } finally { await browser.close(); }
    }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
    server.kill();
    if (database.startsWith('naruto_arena_qa_accounts_')) await mongo.db(database).dropDatabase();
    await mongo.close();
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2));
});
