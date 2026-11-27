const test = require('node:test');
const assert = require('node:assert/strict');
const sharp = require('sharp');

const { createRosterVersions, diffRosters, SNAPSHOT_KEY_PREFIX } = require('../services/rosterVersions');
const { createCharacterHistory } = require('../services/characterHistory');
const { prepareCharacterArt, createCharacterArtStore, CharacterArtError } = require('../services/characterArt');
const createAdminRouter = require('../routes/admin.js');
const canonicalCharacters = require('../data/characters');
const server = require('../server.js');

const clone = (value) => JSON.parse(JSON.stringify(value));
const seed = (characterId) => clone(canonicalCharacters.find((entry) => entry.characterId === characterId));

// A tiny in-memory stand-in for the app_state collection.
const memoryAppState = (docs = {}) => {
    const store = new Map(Object.entries(docs));
    return {
        store,
        findOne: async ({ key }) => store.get(key) || null,
        updateOne: async ({ key }, update) => {
            store.set(key, { ...(store.get(key) || {}), ...(update.$set || {}), ...(update.$setOnInsert || {}) });
        },
        deleteMany: async ({ key }) => {
            const pattern = new RegExp(key.$regex);
            [...store.keys()].forEach((entry) => {
                if (pattern.test(entry) && !key.$nin.includes(entry)) store.delete(entry);
            });
        },
    };
};

test('a match keeps the roster version it started on after a save', async () => {
    const appState = memoryAppState();
    const runningMatches = [];
    const versions = createRosterVersions({
        getAppState: () => appState,
        getMatches: () => ({ distinct: async () => runningMatches.map((match) => match.rosterVersion) }),
    });
    const before = [{ characterId: 'a', skills: [{ cooldown: 1 }] }];
    await versions.initialize({ stored: null, characters: before });
    const oldMatch = versions.stamp({ matchId: 'm1' });
    runningMatches.push(oldMatch);

    const after = [{ characterId: 'a', skills: [{ cooldown: 3 }] }];
    const nextVersion = await versions.prepareNextVersion(before);
    versions.activate(nextVersion, before);
    const newMatch = versions.stamp({ matchId: 'm2' });

    assert.equal(versions.forMatch(oldMatch, after), before, 'the running match keeps the old numbers');
    assert.equal(versions.forMatch(newMatch, after), after, 'new matches get the change');
    assert.equal(versions.forMatch({ matchId: 'legacy' }, after), after, 'matches from before versions use the current roster');
    assert.ok(appState.store.has(SNAPSHOT_KEY_PREFIX + oldMatch.rosterVersion), 'the old version is stored for restarts');

    // Once the old match ends, its version is dropped.
    runningMatches.length = 0;
    await versions.prune();
    assert.equal(versions._snapshots.size, 0);
    assert.ok(![...appState.store.keys()].some((key) => key.startsWith(SNAPSHOT_KEY_PREFIX)));
});

test('a restart keeps the version when nothing changed and restores versions running matches need', async () => {
    const old = [{ characterId: 'a', name: 'Old' }];
    const appState = memoryAppState({ [`${SNAPSHOT_KEY_PREFIX}v-old`]: { characters: old } });
    const matches = { distinct: async () => ['v-old'] };
    const current = [{ characterId: 'a', name: 'New' }];

    const same = createRosterVersions({ getAppState: () => appState, getMatches: () => matches });
    await same.initialize({ stored: { rosterVersion: 'v-now', characters: current }, characters: clone(current) });
    assert.equal(same.version, 'v-now');
    assert.equal(same.forMatch({ rosterVersion: 'v-old' }, current), same._snapshots.get('v-old'));
    assert.deepEqual(same.forMatch({ rosterVersion: 'v-old' }, current), old);

    // A code update on deploy changed the roster: new version, and matches on the old one keep it.
    const changed = createRosterVersions({ getAppState: () => appState, getMatches: () => ({ distinct: async () => ['v-now'] }) });
    const updated = [{ characterId: 'a', name: 'Newer' }];
    await changed.initialize({ stored: { rosterVersion: 'v-now', characters: current }, characters: updated });
    assert.notEqual(changed.version, 'v-now');
    assert.deepEqual(changed.forMatch({ rosterVersion: 'v-now' }, updated), current);
});

test('roster diffs and history record who changed which character', async () => {
    const changes = diffRosters(
        [{ characterId: 'a', name: 'A' }, { characterId: 'b', name: 'B' }],
        [{ characterId: 'a', name: 'A' }, { characterId: 'b', name: 'B2', retired: true }, { characterId: 'c', name: 'C' }]
    );
    assert.deepEqual(changes.map((change) => change.characterId), ['b', 'c']);
    const inserted = [];
    const history = createCharacterHistory({ getCollection: () => ({ insertMany: async (entries) => { inserted.push(...entries); } }) });
    await history.record(changes, { savedBy: 'boss', action: 'edit', rosterVersion: 'v1' });
    assert.deepEqual(inserted.map((entry) => [entry.characterId, entry.action, entry.savedBy]), [['b', 'retire', 'boss'], ['c', 'create', 'boss']]);
    assert.equal(inserted[0].before.name, 'B');
    assert.equal(inserted[0].after.name, 'B2');
});

test('uploaded art is cropped to a 150px square and small art keeps its size', async () => {
    const wide = await sharp({ create: { width: 300, height: 200, channels: 4, background: '#e8801a' } }).png().toBuffer();
    const large = await prepareCharacterArt(wide);
    assert.equal(large.width, 150);
    const meta = await sharp(large.buffer).metadata();
    assert.deepEqual([meta.width, meta.height, meta.format], [150, 150, 'png']);
    assert.match(large.url, /^\/assets\/character-art\/[a-f0-9]{24}\.png$/);

    const icon = await sharp({ create: { width: 75, height: 75, channels: 3, background: '#2d5a94' } }).jpeg().toBuffer();
    const small = await prepareCharacterArt(icon);
    assert.equal(small.width, 75);
    assert.equal(small.buffer, icon, 'already-square small art passes through untouched');

    await assert.rejects(prepareCharacterArt(Buffer.from('not an image')), CharacterArtError);
});

test('uploaded art is stored once by content and read back by its file name', async () => {
    const docs = new Map();
    const store = createCharacterArtStore({ getCollection: () => ({
        updateOne: async ({ file }, update) => { if (!docs.has(file)) docs.set(file, update.$setOnInsert); },
        findOne: async ({ file }) => docs.get(file) || null,
    }) });
    const png = await sharp({ create: { width: 150, height: 150, channels: 3, background: '#9ad8b0' } }).png().toBuffer();
    const dataUrl = `data:image/png;base64,${png.toString('base64')}`;
    const first = await store.upload(dataUrl, 'boss');
    const again = await store.upload(dataUrl, 'someone-else');
    assert.equal(first.url, again.url);
    assert.equal(docs.size, 1);
    const found = await store.find(first.url.split('/').pop());
    assert.equal(found.mime, 'image/png');
    assert.deepEqual(found.data, png);
    assert.equal(await store.find('../server.js'), null);
});

// Every earlier one-time migration is treated as done, so only the roster rules are exercised.
const migrationsDone = (rosterInDb) => ({
    key: 'character_migrations',
    completed: new Proxy({}, { get: (_, id) => (id === server.ROSTER_IN_DB_MIGRATION_ID ? rosterInDb : true) }),
});

test('characters made in the ACP survive a restart and keep their roster position', async () => {
    const custom = { ...seed('haruno-sakura'), id: 'acp-made', characterId: 'acp-made', name: 'ACP Made' };
    const appState = memoryAppState({
        characters: { key: 'characters', characters: [seed('uzumaki-naruto'), custom] },
        character_migrations: migrationsDone(true),
    });
    server.__setTestAppStateCollection(appState);
    const loaded = await server.getStoredCharacters();
    assert.deepEqual(loaded.slice(0, 2).map((entry) => entry.characterId), ['uzumaki-naruto', 'acp-made'],
        'stored order is kept; new code characters join after it');
    assert.ok(loaded.some((entry) => entry.characterId === 'uchiha-sasuke'));
    server.__setTestAppStateCollection(null);
});

test('the first boot with database rosters drops old leftovers once and records the switch', async () => {
    const leftover = { ...seed('haruno-sakura'), id: 'old-leftover', characterId: 'old-leftover' };
    const appState = memoryAppState({
        characters: { key: 'characters', characters: [seed('uzumaki-naruto'), leftover] },
        character_migrations: migrationsDone(false),
    });
    server.__setTestAppStateCollection(appState);
    const loaded = await server.getStoredCharacters();
    assert.ok(!loaded.some((entry) => entry.characterId === 'old-leftover'));
    assert.ok(appState.store.get('character_migrations')[`completed.${server.ROSTER_IN_DB_MIGRATION_ID}`]);
    server.__setTestAppStateCollection(null);
});

test('retired characters are hidden and locked for everyone, staff included', () => {
    const roster = server.__getCharacters();
    server.__setTestCharacters([...roster, { characterId: 'gone-ninja', name: 'Gone', retired: true, skills: [] }]);
    try {
        const access = server.getCharacterAvailability({
            policies: {}, user: { role: 'admin' }, profile: null, characterId: 'gone-ninja', lockedCharacterIds: new Set(),
        });
        assert.equal(access.hidden, true);
        assert.equal(access.unlocked, false);
        assert.equal(access.retired, true);
    } finally {
        server.__setTestCharacters(roster);
    }
});

// Admin route helpers: call one handler with a fake request and response.
const routeHandler = (router, path, method) => {
    const layer = router.stack.find((entry) => entry.route && entry.route.path === path && entry.route.methods[method]);
    return layer.route.stack[layer.route.stack.length - 1].handle;
};
const call = async (handler, req) => {
    const result = {};
    const res = { status(code) { result.status = code; return res; }, json(data) { result.body = data; return res; } };
    await handler({ authUser: { username: 'boss', role: 'admin' }, headers: {}, params: {}, ...req }, res);
    return result;
};

test('admin saves refuse to overwrite a newer save, create staff-only characters, and retire instead of delete', async () => {
    let roster = [seed('haruno-sakura')];
    let policies = {};
    const saves = [];
    const router = createAdminRouter({
        requireSession: (req, res, next) => next(),
        getCharactersData: () => roster,
        updateCharacters: async (buildNext, options) => {
            const next = await buildNext(roster);
            saves.push(options);
            roster = next;
            return next;
        },
        characterRankAccess: {
            getPolicies: async () => policies,
            savePolicies: async (next) => { policies = next; return next; },
        },
    });

    const list = await call(routeHandler(router, '/characters', 'get'), {});
    const revision = list.body.revisions['haruno-sakura'];
    assert.ok(revision);

    const edit = clone(roster[0]);
    edit.skills[0].cooldown = 4;
    const stale = await call(routeHandler(router, '/characters/:characterId', 'put'), {
        params: { characterId: 'haruno-sakura' }, headers: { 'x-character-revision': 'not-the-current-one' }, body: edit,
    });
    assert.equal(stale.status, 409);
    assert.equal(saves.length, 0);

    const fresh = await call(routeHandler(router, '/characters/:characterId', 'put'), {
        params: { characterId: 'haruno-sakura' }, headers: { 'x-character-revision': revision }, body: edit,
    });
    assert.equal(fresh.status, undefined);
    assert.equal(roster[0].skills[0].cooldown, 4);
    assert.equal(saves[0].savedBy, 'boss');

    const made = { ...clone(roster[0]), id: 'acp-made', characterId: 'acp-made', name: 'ACP Made' };
    const created = await call(routeHandler(router, '/characters', 'post'), { body: made });
    assert.equal(created.status, 201);
    assert.equal(roster[roster.length - 1].characterId, 'acp-made', 'new characters join the end');
    assert.equal(created.body.hiddenFromPlayers, true);
    assert.equal(policies['acp-made'].player.visibility, 'hidden');

    const retired = await call(routeHandler(router, '/characters/:characterId', 'delete'), { params: { characterId: 'acp-made' } });
    assert.equal(retired.body.retired, true);
    assert.equal(roster.length, 2, 'retiring keeps the character in the roster');
    assert.equal(roster[1].retired, true);
});
