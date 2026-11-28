const test = require('node:test');
const assert = require('node:assert/strict');

const { conceptToCharacter, matchTarget, matchClasses } = require('../services/conceptToCharacter');
const createAdminRouter = require('../routes/admin.js');
const { validateCharacterPayload } = require('../services/characterValidation');

const concept = {
    name: 'Hōzuki Mangetsu',
    portrait: 'https://example.com/mangetsu.png',
    description: 'A prodigy of the Hidden Mist.',
    unlock: 'Beat the Seven Swordsmen mission',
    notes: 'Should feel slippery.',
    passive: { name: 'Hydrification', icon: 'https://example.com/h.png', description: 'Reduces physical damage.', notes: 'Maybe 10?' },
    skills: [
        { name: 'Water Fang', icon: 'a.png', description: 'Deals 25 damage.', cooldown: 1, target: 'One enemy', classes: 'Physical, Melee, Instant', cost: { taijutsu: 1, random: 1 }, notes: '' },
        { name: 'Mist Body', icon: 'b.png', description: 'Becomes invulnerable.', cooldown: 4, target: 'Self', classes: 'Strategic, Instant', cost: { random: 1 } },
        { name: 'Torrent', description: 'Hits everyone.', cooldown: 2, target: 'all enemies', classes: 'Chakra*', cost: { ninjutsu: 2 }, notes: 'AoE finisher' },
        { name: 'Hidden Form', description: 'Alternate.', target: 'whatever', classes: '', cost: {}, alternate: true },
    ],
};

test('a Creator concept becomes a character skeleton the engine can read', () => {
    const { character, notes, problems } = conceptToCharacter(concept, { takenIds: ['hozuki-mangetsu'] });
    assert.equal(character.characterId, 'hozuki-mangetsu-2', 'ids avoid ones already in use');
    assert.equal(character.id, character.characterId);
    assert.deepEqual(character.skills.map((skill) => skill.id), [
        'hozuki-mangetsu-2-water-fang', 'hozuki-mangetsu-2-mist-body', 'hozuki-mangetsu-2-torrent', 'hozuki-mangetsu-2-hidden-form',
    ]);
    assert.deepEqual(character.skills[0].energy, ['Taijutsu', 'Random']);
    assert.deepEqual(character.skills.map((skill) => skill.target), ['single-enemy', 'self', 'all-enemy', 'single-enemy']);
    assert.deepEqual(character.skills[0].classes, ['Physical', 'Instant']);
    assert.deepEqual(character.skills[2].classes, ['Chakra*']);
    assert.equal(character.skills[3].hiddenFromSelectionViewer, true);
    assert.deepEqual(character.skills[0].effects, [], 'mechanics are left for the builder');
    assert.equal(character.passive.name, 'Hydrification');
    assert.equal(character.passive.notes, undefined, 'notes stay out of the character');
    assert.equal(notes.passive, 'Maybe 10?');
    assert.deepEqual(notes.skills, [{ name: 'Torrent', notes: 'AoE finisher' }]);
    assert.ok(problems.some((line) => /Melee/.test(line)), 'unknown classes are reported');
    assert.ok(problems.some((line) => /Hidden Form.*whatever/.test(line)), 'unmatched targets are reported');
    assert.deepEqual(validateCharacterPayload(character), [], 'the skeleton passes the editor validation');
});

test('free-text targets and classes match the engine vocabulary', () => {
    assert.equal(matchTarget('Self or one ally'), 'self-or-single-ally');
    assert.equal(matchTarget('All allies'), 'all-allies');
    assert.equal(matchTarget('an ally'), 'single-ally');
    assert.equal(matchTarget('single-enemy'), 'single-enemy');
    assert.equal(matchTarget(''), null);
    assert.deepEqual(matchClasses('energy / Affliction* ; mystery'), { matched: ['Chakra', 'Affliction*'], unknown: ['mystery'] });
});

// A tiny in-memory app_state collection with what the draft routes use.
function memoryCollection(seed = []) {
    const docs = seed.map((doc) => ({ ...doc }));
    const matches = (doc, query) => Object.entries(query).every(([key, value]) =>
        value instanceof RegExp ? value.test(doc[key]) : doc[key] === value);
    return {
        docs,
        find: (query) => ({
            sort: () => ({ toArray: async () => docs.filter((doc) => matches(doc, query)) }),
            toArray: async () => docs.filter((doc) => matches(doc, query)),
        }),
        findOne: async (query) => docs.find((doc) => matches(doc, query)) || null,
        insertOne: async (doc) => { docs.push(doc); },
        findOneAndUpdate: async (query, update) => {
            const doc = docs.find((entry) => matches(entry, query));
            if (doc) Object.assign(doc, update.$set);
            return doc || null;
        },
        deleteOne: async (query) => {
            const index = docs.findIndex((doc) => matches(doc, query));
            if (index !== -1) docs.splice(index, 1);
            return { deletedCount: index === -1 ? 0 : 1 };
        },
    };
}
const handler = (router, path, method) => router.stack
    .find((entry) => entry.route && entry.route.path === path && entry.route.methods[method]).route.stack.at(-1).handle;
const call = async (fn, req) => {
    const result = {};
    const res = { status(code) { result.status = code; return res; }, json(data) { result.body = data; return res; } };
    await fn({ authUser: { username: 'boss', role: 'admin' }, headers: {}, params: {}, body: {}, ...req }, res);
    return result;
};

test('a concept can be promoted to a draft, saved, listed and discarded', async () => {
    const appState = memoryCollection([{ key: 'character_draft:c1', id: 'c1', draft: concept }]);
    const router = createAdminRouter({
        requireSession: (req, res, next) => next(),
        appStateCollection: appState,
        getCharactersData: () => [{ characterId: 'uzumaki-naruto', name: 'Uzumaki Naruto', skills: [] }],
    });
    // The middleware that guards /editor-drafts (and not every admin route).
    const gate = router.stack.find((entry) => !entry.route && entry.match('/editor-drafts') && !entry.match('/unrelated-route')).handle;
    let blocked = null;
    gate({ authUser: { role: 'moderator' } }, { status: () => ({ json: (body) => { blocked = body; } }) }, () => { blocked = 'passed'; });
    assert.equal(blocked.error, 'Admin access required.', 'only admins can use editor drafts');

    const created = await call(handler(router, '/editor-drafts', 'post'), { body: { conceptId: 'c1' } });
    assert.equal(created.status, 201);
    const draft = created.body.draft;
    assert.equal(draft.character.characterId, 'hozuki-mangetsu');
    assert.equal(draft.source.type, 'concept');
    assert.equal(draft.notes.general, 'Should feel slippery.');
    assert.ok(Array.isArray(created.body.checks));

    const edited = { ...draft.character, name: 'Mangetsu' };
    const saved = await call(handler(router, '/editor-drafts/:id', 'put'), { params: { id: draft.id }, body: { character: edited } });
    assert.equal(saved.body.draft.name, 'Mangetsu');
    const nameless = await call(handler(router, '/editor-drafts/:id', 'put'), { params: { id: draft.id }, body: { character: { skills: [] } } });
    assert.equal(nameless.status, 400);

    const listed = await call(handler(router, '/editor-drafts', 'get'), {});
    assert.deepEqual(listed.body.drafts.map((entry) => entry.name), ['Mangetsu']);
    assert.equal(listed.body.drafts[0].character, undefined, 'the list stays light');

    const missing = await call(handler(router, '/editor-drafts', 'post'), { body: { conceptId: 'nope' } });
    assert.equal(missing.status, 404);

    const removed = await call(handler(router, '/editor-drafts/:id', 'delete'), { params: { id: draft.id } });
    assert.equal(removed.body.ok, true);
    assert.equal(appState.docs.filter((doc) => doc.key.startsWith('editor_draft:')).length, 0);
});
