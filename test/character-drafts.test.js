const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const makeAdminRouter = require('../routes/admin');

test('character drafts are shared with admins, versioned, and isolated from live characters', async () => {
    const docs = new Map();
    const collection = {
        find: (filter) => ({ sort: ({ createdAt, updatedAt }) => ({ toArray: async () => [...docs.values()]
            .filter(doc => Object.entries(filter).every(([key, value]) => value instanceof RegExp ? value.test(doc[key]) : doc[key] === value))
            .sort((a, b) => createdAt ? a.createdAt - b.createdAt : updatedAt ? b.updatedAt - a.updatedAt : 0) }) }),
        findOne: async ({ key }) => docs.get(key) || null,
        insertOne: async (doc) => { docs.set(doc.key, structuredClone(doc)); return { acknowledged: true }; },
        updateOne: async (filter, update) => {
            const doc = docs.get(filter.key);
            if (!doc || (filter.version != null && doc.version !== filter.version)) return { matchedCount: 0 };
            Object.assign(doc, update.$set);
            if (update.$inc) doc.version += update.$inc.version;
            return { matchedCount: 1 };
        },
        deleteOne: async ({ key }) => ({ deletedCount: docs.delete(key) ? 1 : 0 }),
        deleteMany: async (filter) => {
            let deletedCount = 0;
            for (const [key, doc] of docs) if (doc.kind === filter.kind && doc.draftId === filter.draftId) { docs.delete(key); deletedCount++; }
            return { deletedCount };
        },
    };
    let liveSaveCalls = 0;
    const app = express();
    app.use(express.json());
    app.use('/api/admin', makeAdminRouter({
        requireSession: (req, _res, next) => { req.authUser = { username: 'reviewer', role: req.get('x-role') || 'admin' }; next(); },
        appStateCollection: collection,
        saveCharacters: async () => { liveSaveCalls++; },
    }));
    const server = await new Promise(resolve => { const instance = app.listen(0, () => resolve(instance)); });
    const base = `http://127.0.0.1:${server.address().port}/api/admin/character-drafts`;
    const json = (method, body, role = 'admin') => ({ method, headers: { 'content-type': 'application/json', 'x-role': role }, body: JSON.stringify(body) });
    try {
        const denied = await fetch(base, { headers: { 'x-role': 'player' } });
        assert.equal(denied.status, 403);

        const createdResponse = await fetch(base, json('POST', {
            name: 'Concept One', health: 110,
            passive: { name: 'Quiet Focus', description: 'Gains focus each turn.' },
            skills: [{ name: 'Opening Move', cooldown: 2, cost: { ninjutsu: 1 }, description: 'Proposed effect' }],
        }));
        assert.equal(createdResponse.status, 201);
        const created = (await createdResponse.json()).draft;
        assert.equal(created.version, 1);
        assert.equal(created.skills[0].cost.ninjutsu, 1);
        assert.equal(created.passive.name, 'Quiet Focus');
        assert.equal((await (await fetch(base)).json()).drafts.length, 1);

        const updatedResponse = await fetch(`${base}/${created.id}`, json('PUT', { ...created, name: 'Concept Two' }));
        assert.equal(updatedResponse.status, 200);
        assert.equal((await updatedResponse.json()).draft.version, 2);
        const stale = await fetch(`${base}/${created.id}`, json('PUT', { ...created, name: 'Stale version' }));
        assert.equal(stale.status, 409);
        assert.equal((await (await fetch(base)).json()).drafts[0].name, 'Concept Two');
        assert.equal(liveSaveCalls, 0);

        const commentsUrl = `${base}/${created.id}/comments`;
        assert.equal((await fetch(commentsUrl, { headers: { 'x-role': 'player' } })).status, 403);
        assert.equal((await fetch(commentsUrl, json('POST', { text: 'No access' }, 'player'))).status, 403);
        assert.equal((await fetch(commentsUrl, json('POST', { text: 'Bad reply', replyTo: '22222222-2222-2222-2222-222222222222' }))).status, 400);
        assert.equal((await fetch(commentsUrl, json('POST', { title: 'x'.repeat(121), text: 'Too long' }))).status, 400);
        const suggestionResponse = await fetch(commentsUrl, json('POST', { type: 'suggestion', title: 'Cooldown balance', text: 'Reduce this cooldown.' }));
        assert.equal(suggestionResponse.status, 201);
        const suggestion = (await suggestionResponse.json()).comment;
        assert.equal(suggestion.title, 'Cooldown balance');
        const replyResponse = await fetch(commentsUrl, json('POST', { type: 'comment', text: 'Agreed.', replyTo: suggestion.id }));
        assert.equal(replyResponse.status, 201);
        const reply = (await replyResponse.json()).comment;
        assert.equal(reply.replyTo, suggestion.id);
        assert.equal((await (await fetch(commentsUrl)).json()).comments.length, 2);
        const resolvedResponse = await fetch(`${commentsUrl}/${suggestion.id}`, json('PATCH', { resolved: true }));
        assert.equal(resolvedResponse.status, 200);
        assert.equal((await resolvedResponse.json()).comment.resolvedBy, 'reviewer');
        const reopenedResponse = await fetch(`${commentsUrl}/${suggestion.id}`, json('PATCH', { resolved: false }));
        assert.equal((await reopenedResponse.json()).comment.resolvedAt, null);
        assert.equal((await (await fetch(base)).json()).drafts[0].version, 2);

        assert.equal((await fetch(`${base}/${created.id}`, { method: 'DELETE' })).status, 200);
        assert.equal((await (await fetch(base)).json()).drafts.length, 0);
        assert.equal([...docs.values()].filter(doc => doc.kind === 'character_draft_comment').length, 0);
    } finally { await new Promise(resolve => server.close(resolve)); }
});
