const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { isPublicStaticPath } = require('../server.js');

const root = path.join(__dirname, '..');

test('server code, data, tests and config are not downloadable', () => {
    [
        '/server.js',
        '/battleLogic.js',
        '/package.json',
        '/package-lock.json',
        '/render.yaml',
        '/README.md',
        '/AGENTS.md',
        '/starterCharacterPresets.js',
        '/routes/admin.js',
        '/services/characterService.js',
        '/sockets/index.js',
        '/data/characters/index.js',
        '/test/static-file-access.test.js',
        '/scripts/seed_news.js',
        '/docs/TOOLTIP_STYLE.md',
        '/.env',
        '/.git/config',
        '/assets/characters/manifest.json',
        '/assets/mission-ranks/SOURCES.md',
        '/assets/..%2Fserver.js',
        '/%2e%2e/server.js',
        '/%E0%A4%A',
    ].forEach((requestPath) => assert.equal(isPublicStaticPath(requestPath), false, requestPath));
});

test('client pages, styles, scripts and media stay downloadable', () => {
    [
        '/',
        '/index.html',
        '/clan%20panel.html',
        '/style.css',
        '/script.js',
        '/selectionHub.js',
        '/favicon.png',
        '/franklin.ttf',
        '/hats/hokage.png',
        '/sounds/start.mp3',
        '/avatars/avatar_1.png',
        '/borders/border.png',
        '/assets/characters/uzumaki-naruto/face.png',
    ].forEach((requestPath) => assert.equal(isPublicStaticPath(requestPath), true, requestPath));
});

test('every script a page loads is on the public list', () => {
    const pages = fs.readdirSync(root).filter((name) => name.endsWith('.html'));
    const scripts = new Set();
    pages.forEach((page) => {
        const html = fs.readFileSync(path.join(root, page), 'utf8');
        for (const match of html.matchAll(/<script[^>]+src="([^"]+)"/g)) {
            const src = match[1].split(/[?#]/)[0];
            if (/^(https?:)?\/\//.test(src)) continue;
            scripts.add('/' + src.replace(/^\.?\//, ''));
        }
    });
    assert.ok(scripts.size > 10);
    scripts.forEach((src) => assert.equal(isPublicStaticPath(src), true, `${src} is loaded by a page but blocked`));
});
