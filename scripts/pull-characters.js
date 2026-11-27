#!/usr/bin/env node
'use strict';

// npm run pull-characters
//
// Downloads the live roster (everything admins have changed in the ACP Character Editor) and
// writes it into data/characters/, so code work starts from the live numbers instead of
// overwriting them. Characters made in the editor are added to the code roster, and art
// uploaded in the editor is saved to assets/character-art/.
//
// Settings come from .env or the environment:
//   ARENA_URL        the live site, e.g. https://your-site.onrender.com (required)
//   ARENA_USERNAME   an admin account (asked for if missing)
//   ARENA_PASSWORD   its password (asked for, hidden, if missing)
//
// Options:
//   --dry-run   show what would change without writing anything
//   --force     run even if data/characters has uncommitted changes
//   --db        also copy the live roster into your local database (MONGODB_URI), so your
//               local server plays exactly what's live
//
// Only characters whose data differs from live are rewritten. A rewritten file holds plain
// data (any helper functions in it are replaced by the values they produced), so review the
// diff with git before committing.

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const CHARACTERS_DIR = path.join(ROOT, 'data', 'characters');
const INDEX_FILE = path.join(CHARACTERS_DIR, 'index.js');
const ACTIVE_ROSTER_FILE = path.join(ROOT, 'data', 'activeRoster.js');
const ART_DIR = path.join(ROOT, 'assets', 'character-art');
const ART_PREFIX = '/assets/character-art/';
const ART_FILE_PATTERN = /^[a-f0-9]{24}\.(png|jpg|gif|webp)$/;
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'naruto_session';
const ROSTER_IN_DB_MIGRATION_ID = 'roster-in-database-2026-11-27';

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const force = args.has('--force');
const copyToDb = args.has('--db');

const fail = (message) => {
    console.error(`\npull-characters: ${message}`);
    process.exit(1);
};

function ask(question, { hidden = false } = {}) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
        rl._writeToOutput = (text) => {
            if (text.includes(question)) rl.output.write(text);
        };
    }
    return new Promise((resolve) => rl.question(question, (answer) => {
        rl.close();
        if (hidden) process.stdout.write('\n');
        resolve(answer.trim());
    }));
}

function checkWorkingTree() {
    let status = '';
    try {
        status = execFileSync('git', ['status', '--porcelain', '--', 'data/characters', 'data/activeRoster.js', 'assets/character-art'],
            { cwd: ROOT, encoding: 'utf8' });
    } catch (error) {
        console.warn('Could not check git status; continuing.');
        return;
    }
    if (status.trim() && !force) {
        fail('data/characters has uncommitted changes:\n' + status +
            '\nCommit or stash them first, or run with --force to overwrite them.');
    }
}

async function login(baseUrl, username, password) {
    const response = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) fail(`Sign-in failed: ${data.error || response.status}`);
    const cookies = typeof response.headers.getSetCookie === 'function'
        ? response.headers.getSetCookie()
        : [response.headers.get('set-cookie') || ''];
    const session = cookies.map((entry) => entry.split(';')[0]).find((entry) => entry.startsWith(`${SESSION_COOKIE_NAME}=`));
    if (!session) fail('Signed in, but the site returned no session cookie.');
    return session;
}

async function download(baseUrl, cookie) {
    const response = await fetch(`${baseUrl}/api/admin/characters/export?format=json`, { headers: { Cookie: cookie } });
    const data = await response.json().catch(() => ({}));
    if (response.status === 403) fail('That account is not an admin.');
    if (!response.ok || !Array.isArray(data.characters)) fail(`Could not download the roster: ${data.error || response.status}`);
    return data;
}

// The character modules index.js loads, keyed by characterId, with the file each came from.
function readLocalModules() {
    const indexSource = fs.readFileSync(INDEX_FILE, 'utf8');
    const modules = new Map();
    for (const match of indexSource.matchAll(/require\('\.\/([^']+)'\)/g)) {
        const file = path.join(CHARACTERS_DIR, match[1].endsWith('.js') ? match[1] : `${match[1]}.js`);
        if (!fs.existsSync(file)) continue;
        delete require.cache[require.resolve(file)];
        const raw = require(file);
        if (raw && raw.characterId) modules.set(raw.characterId, { file, raw });
    }
    delete require.cache[require.resolve(INDEX_FILE)];
    const indexed = new Map(require(INDEX_FILE).map((entry) => [entry.characterId, entry]));
    return { modules, indexed, indexSource };
}

// index.js adds some tags at load time (e.g. konoha-genin); they don't belong in the file.
function stripIndexTags(live, raw, indexed) {
    if (!raw || !indexed || !Array.isArray(live.tags)) return live;
    const added = new Set((indexed.tags || []).filter((tag) => !(raw.tags || []).includes(tag)));
    if (!added.size) return live;
    const tags = live.tags.filter((tag) => !added.has(tag));
    const next = { ...live, tags };
    if (!tags.length && raw.tags === undefined) delete next.tags;
    return next;
}

function collectArt(value, found = new Set()) {
    if (typeof value === 'string') {
        if (value.startsWith(ART_PREFIX)) found.add(value.slice(ART_PREFIX.length));
    } else if (Array.isArray(value)) value.forEach((entry) => collectArt(entry, found));
    else if (value && typeof value === 'object') Object.values(value).forEach((entry) => collectArt(entry, found));
    return found;
}

async function copyRosterToDb(characters, rosterVersion) {
    const { MongoClient } = require('mongodb');
    const uri = process.env.MONGODB_URI;
    if (!uri) fail('--db needs MONGODB_URI in .env (your local database).');
    const client = new MongoClient(uri);
    await client.connect();
    try {
        const appState = client.db(process.env.MONGODB_DB || 'naruto-arena')
            .collection(process.env.MONGODB_APP_STATE_COLLECTION || 'app_state');
        await appState.updateOne(
            { key: 'characters' },
            { $set: { key: 'characters', characters, rosterVersion: rosterVersion || null, updatedAt: new Date() } },
            { upsert: true }
        );
        await appState.updateOne(
            { key: 'character_migrations' },
            { $set: { key: 'character_migrations', [`completed.${ROSTER_IN_DB_MIGRATION_ID}`]: new Date() } },
            { upsert: true }
        );
    } finally {
        await client.close();
    }
}

async function main() {
    const baseUrl = String(process.env.ARENA_URL || '').trim().replace(/\/+$/, '');
    if (!/^https?:\/\//.test(baseUrl)) fail('Set ARENA_URL in .env to the live site, e.g. ARENA_URL=https://your-site.onrender.com');
    checkWorkingTree();

    const username = process.env.ARENA_USERNAME || await ask('Admin username: ');
    const password = process.env.ARENA_PASSWORD || await ask('Password: ', { hidden: true });
    const cookie = await login(baseUrl, username, password);
    const { characters: live, rosterVersion, exportedAt } = await download(baseUrl, cookie);
    console.log(`Downloaded ${live.length} characters from ${baseUrl} (version ${rosterVersion || 'unknown'}, ${exportedAt}).`);

    const { modules, indexed, indexSource } = readLocalModules();
    const updated = [];
    const added = [];
    const writes = [];
    for (const liveCharacter of live) {
        const characterId = liveCharacter.characterId;
        if (!characterId) continue;
        const local = modules.get(characterId);
        const data = stripIndexTags(liveCharacter, local?.raw, indexed.get(characterId));
        if (local && JSON.stringify(local.raw) === JSON.stringify(data)) continue;
        const file = local ? local.file : path.join(CHARACTERS_DIR, `${characterId}.js`);
        writes.push({ file, content: `module.exports = ${JSON.stringify(data, null, 4)};\n` });
        (local ? updated : added).push(characterId);
    }

    // Characters made in the editor join the code roster, so a fresh database starts with them.
    let nextIndex = indexSource;
    let nextActive = fs.readFileSync(ACTIVE_ROSTER_FILE, 'utf8');
    if (added.length) {
        const lines = added.map((id) => `    require('./${id}'),`).join('\n');
        nextIndex = indexSource.replace(/(const rawCharacters = \[[\s\S]*?)(\n\];)/, `$1\n${lines}$2`);
        const { ACTIVE_ROSTER_IDS } = require(ACTIVE_ROSTER_FILE);
        const missing = added.filter((id) => !ACTIVE_ROSTER_IDS.includes(id));
        if (missing.length) {
            nextActive = nextActive.replace(/(const ACTIVE_ROSTER_IDS = \[[\s\S]*?)(\n\];)/,
                `$1\n${missing.map((id) => `    '${id}',`).join('\n')}$2`);
        }
    }

    const art = [...collectArt(live)].filter((file) => ART_FILE_PATTERN.test(file) && !fs.existsSync(path.join(ART_DIR, file)));

    console.log(`\n${updated.length} changed: ${updated.join(', ') || 'none'}`);
    console.log(`${added.length} new: ${added.join(', ') || 'none'}`);
    console.log(`${art.length} uploaded image${art.length === 1 ? '' : 's'} to download`);
    const retired = live.filter((entry) => entry.retired).map((entry) => entry.characterId);
    if (retired.length) console.log(`Retired on live (kept in the roster, hidden): ${retired.join(', ')}`);
    if (dryRun) {
        console.log('\nDry run: nothing was written.');
        return;
    }

    writes.forEach(({ file, content }) => fs.writeFileSync(file, content, 'utf8'));
    if (nextIndex !== indexSource) fs.writeFileSync(INDEX_FILE, nextIndex, 'utf8');
    fs.writeFileSync(ACTIVE_ROSTER_FILE, nextActive, 'utf8');
    if (art.length) fs.mkdirSync(ART_DIR, { recursive: true });
    for (const file of art) {
        const response = await fetch(`${baseUrl}${ART_PREFIX}${file}`);
        if (!response.ok) {
            console.warn(`Could not download ${file} (${response.status}).`);
            continue;
        }
        fs.writeFileSync(path.join(ART_DIR, file), Buffer.from(await response.arrayBuffer()));
    }
    if (copyToDb) {
        await copyRosterToDb(live, rosterVersion);
        console.log('Copied the live roster into your local database. Restart your local server to use it.');
    }
    console.log('\nDone. Review the changes with git diff before committing.');
}

main().catch((error) => fail(error.message || String(error)));
