const { test } = require('node:test');
const assert = require('node:assert/strict');

const createClanWarsRouter = require('../routes/clanWars.js');

const clone = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));

const valuesAt = (doc, path) => {
    let values = [doc];
    for (const key of path.split('.')) {
        values = values.flatMap((value) => {
            if (Array.isArray(value)) return value.map((entry) => entry?.[key]);
            return [value?.[key]];
        });
    }
    return values.flatMap((value) => (Array.isArray(value) ? value : [value]));
};

const matches = (doc, filter) =>
    Object.entries(filter).every(([key, condition]) => {
        if (key === '$or') return condition.some((branch) => matches(doc, branch));
        const values = valuesAt(doc, key);
        if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
            if ('$in' in condition) return values.some((value) => condition.$in.includes(value));
            if ('$regex' in condition) {
                const pattern = new RegExp(condition.$regex, condition.$options);
                return values.some((value) => typeof value === 'string' && pattern.test(value));
            }
        }
        if (condition === null) return values.every((value) => value === null || value === undefined);
        return values.some((value) => value === condition);
    });

const setPath = (doc, path, value) => {
    const keys = path.split('.');
    const last = keys.pop();
    const parent = keys.reduce((node, key) => (node[key] = node[key] || {}), doc);
    parent[last] = value;
};

// Just enough of a MongoDB collection for the clan war router.
const fakeCollection = (docs = []) => ({
    docs,
    findOne: async (filter) => clone(docs.find((doc) => matches(doc, filter)) || null),
    find: (filter) => {
        let results = docs.filter((doc) => matches(doc, filter));
        const cursor = {
            sort: () => cursor,
            limit: (count) => {
                results = results.slice(0, count);
                return cursor;
            },
            toArray: async () => clone(results),
        };
        return cursor;
    },
    insertOne: async (doc) => {
        docs.push(clone(doc));
        return { insertedId: docs.length };
    },
    replaceOne: async (filter, replacement) => {
        const index = docs.findIndex((doc) => matches(doc, filter));
        if (index < 0) return { matchedCount: 0 };
        docs[index] = clone(replacement);
        return { matchedCount: 1 };
    },
    updateOne: async (filter, update) => {
        const doc = docs.find((entry) => matches(entry, filter));
        if (!doc) return { matchedCount: 0, modifiedCount: 0 };
        for (const [path, value] of Object.entries(update.$set || {})) setPath(doc, path, clone(value));
        for (const [path, value] of Object.entries(update.$inc || {})) {
            setPath(doc, path, (Number(valuesAt(doc, path)[0]) || 0) + value);
        }
        return { matchedCount: 1, modifiedCount: 1 };
    },
    createIndex: async () => {},
});

const roster = ['naruto', 'gaara', 'shikamaru', 'temari', 'kankuro', 'rock-lee'].map((id) => ({
    characterId: id,
    name: id,
    skills: [],
}));

const member = (username, clanName, rankKey = 'member') => ({
    username,
    profile: { ryo: 0, clan: { name: clanName, abbreviation: clanName.slice(0, 3), rankKey } },
});

function harness() {
    const users = fakeCollection([
        member('Naruto', 'Leaf', 'clanLeader'),
        member('Sasuke', 'Leaf'),
        member('Gaara', 'Sand', 'clanLeader'),
        member('Temari', 'Sand'),
    ]);
    const warsCollection = fakeCollection();
    const clanExperience = [];
    let ids = 0;
    let now = new Date('2026-11-02T12:00:00Z');
    const router = createClanWarsRouter({
        clanWarsCollection: warsCollection,
        usersCollection: users,
        getRoster: () => roster,
        getRosterCharacterId: (index) => roster[index]?.characterId || '',
        addClanExperience: async (clanName, amount) => clanExperience.push([clanName, amount]),
        now: () => now,
        createId: (prefix) => `${prefix}${(ids += 1)}`,
    });

    const call = async (method, path, username, body = {}) => {
        for (const layer of router.stack) {
            if (!layer.route?.methods[method]) continue;
            const match = layer.match(path) ? layer : null;
            if (!match) continue;
            const result = { status: 200 };
            const res = {
                status(code) {
                    result.status = code;
                    return res;
                },
                json(data) {
                    result.body = data;
                    return res;
                },
            };
            const handler = layer.route.stack[layer.route.stack.length - 1].handle;
            await handler({ authUser: { username }, body, params: layer.params }, res);
            return result;
        }
        throw new Error(`no route for ${method} ${path}`);
    };

    return { router, call, users, warsCollection, clanExperience, setNow: (value) => (now = value) };
}

const declareAndAccept = async (call, terms = {}) => {
    const declared = await call('post', '/api/clan-wars', 'Naruto', { opponentClan: 'sand', terms });
    assert.equal(declared.status, 201, JSON.stringify(declared.body));
    const warId = declared.body.war.warId;
    const accepted = await call('post', `/api/clan-wars/${warId}/respond`, 'Gaara', { action: 'accept' });
    assert.equal(accepted.status, 200, JSON.stringify(accepted.body));
    return warId;
};

test('only Clan Leaders can declare or answer a war', async () => {
    const { call } = harness();
    const denied = await call('post', '/api/clan-wars', 'Sasuke', { opponentClan: 'Sand' });
    assert.equal(denied.status, 403);

    const declared = await call('post', '/api/clan-wars', 'Naruto', { opponentClan: 'Sand' });
    assert.equal(declared.status, 201);
    const warId = declared.body.war.warId;

    const notLeader = await call('post', `/api/clan-wars/${warId}/respond`, 'Temari', { action: 'accept' });
    assert.equal(notLeader.status, 403);

    const duplicate = await call('post', '/api/clan-wars', 'Gaara', { opponentClan: 'Leaf' });
    assert.equal(duplicate.status, 409);
    assert.match(duplicate.body.error, /already has an open war/);
});

test('declaring war on an unknown clan fails clearly', async () => {
    const { call } = harness();
    const result = await call('post', '/api/clan-wars', 'Naruto', { opponentClan: 'Mist' });
    assert.equal(result.status, 404);
});

test('accepting a war locks a snapshot of character types', async () => {
    const { call } = harness();
    const warId = await declareAndAccept(call);
    const detail = await call('get', `/api/clan-wars/${warId}`, 'Temari');
    assert.equal(detail.body.war.status, 'active');
    assert.deepEqual(Object.keys(detail.body.war.archetypeSnapshot.characters), roster.map((c) => c.characterId));
    assert.equal(detail.body.war.viewer.side, 'defender');
    assert.equal(detail.body.war.viewer.isClanLeader, false);
});

test('a war plays out through challenges and battles, then pays rewards once', async () => {
    const { router, call, users, warsCollection, clanExperience } = harness();
    const warId = await declareAndAccept(call, { winTarget: 1, ruleset: { bannedCharacterIds: ['gaara'] } });

    await call('post', `/api/clan-wars/${warId}/roster/join`, 'Sasuke');
    await call('post', `/api/clan-wars/${warId}/roster/join`, 'Temari');
    const challenged = await call('post', `/api/clan-wars/${warId}/challenges`, 'Sasuke', { opponent: 'temari' });
    assert.equal(challenged.status, 200, JSON.stringify(challenged.body));
    const setId = challenged.body.war.sets[0].setId;

    const early = router.prepareWarBattle({ username: 'Sasuke', setId, team: [0, 2, 3] });
    await assert.rejects(early, /not in progress/);
    await call('post', `/api/clan-wars/${warId}/sets/${setId}/respond`, 'Temari', { accept: true });

    const check = await call('post', `/api/clan-wars/${warId}/sets/${setId}/check-team`, 'Temari', { team: [1, 3, 4] });
    assert.equal(check.body.valid, false);
    assert.equal(check.body.violations[0].message, 'gaara is banned in this war.');
    await assert.rejects(router.prepareWarBattle({ username: 'Temari', setId, team: [1, 3, 4] }), (error) => {
        assert.equal(error.status, 403);
        assert.equal(error.violations[0].code, 'banned-character');
        return true;
    });

    const prepared = await router.prepareWarBattle({ username: 'Sasuke', setId, team: [0, 2, 5] });
    assert.deepEqual(prepared, { warId, setId, opponent: 'Temari', characterIds: ['naruto', 'shikamaru', 'rock-lee'] });

    const match = (matchId) => ({
        matchId,
        mode: 'war',
        warId,
        warSetId: setId,
        warTeams: { Sasuke: ['naruto', 'shikamaru', 'rock-lee'], Temari: ['temari', 'kankuro', 'naruto'] },
        players: [{ username: 'Sasuke' }, { username: 'Temari' }],
    });
    await router.recordWarBattleResult(match('m1'), 'Sasuke', new Date('2026-11-02T13:00:00Z'));
    await router.recordWarBattleResult(match('m1'), 'Sasuke', new Date('2026-11-02T13:00:00Z'));
    await router.recordWarBattleResult(match('m2'), 'Sasuke', new Date('2026-11-02T14:00:00Z'));

    const war = warsCollection.docs[0];
    assert.equal(war.sets[0].battles.length, 2);
    assert.deepEqual(war.sets[0].battles[0].teams.defender, ['temari', 'kankuro', 'naruto']);
    assert.equal(war.status, 'completed');
    assert.equal(war.result.winnerSide, 'challenger');
    assert.ok(war.rewards.paidAt);

    const sasuke = users.docs.find((user) => user.username === 'Sasuke');
    const temari = users.docs.find((user) => user.username === 'Temari');
    assert.equal(sasuke.profile.ryo, war.rewards.players.Sasuke);
    assert.equal(temari.profile.ryo, war.rewards.players.Temari);
    assert.deepEqual(clanExperience, [['Leaf', war.rewards.clans.challenger]]);

    // A later read of the completed war must not pay again.
    await call('get', `/api/clan-wars/${warId}`, 'Naruto');
    await router.recordWarBattleResult(match('m3'), 'Sasuke', new Date());
    assert.equal(clanExperience.length, 1);
    assert.equal(sasuke.profile.ryo, war.rewards.players.Sasuke);
});

test('the clan war record counts finished wars from each clan\'s side', async () => {
    const { router, call } = harness();
    const warId = await declareAndAccept(call);
    await call('post', `/api/clan-wars/${warId}/surrender`, 'Gaara');

    const leaf = await router.getClanWarRecord('LEAF');
    assert.equal(leaf.wins, 1);
    assert.equal(leaf.losses, 0);
    assert.deepEqual(
        { opponent: leaf.recent[0].opponent, outcome: leaf.recent[0].outcome, reason: leaf.recent[0].reason },
        { opponent: 'Sand', outcome: 'won', reason: 'surrender' }
    );

    const sand = await router.getClanWarRecord('Sand');
    assert.deepEqual([sand.wins, sand.losses, sand.draws], [0, 1, 0]);
    assert.equal(sand.recent[0].outcome, 'lost');

    const mist = await router.getClanWarRecord('Mist');
    assert.deepEqual(mist, { wins: 0, losses: 0, draws: 0, recent: [] });
});

test('matches that are not war battles are ignored', async () => {
    const { router } = harness();
    assert.equal(await router.recordWarBattleResult({ mode: 'private', matchId: 'm' }, 'Naruto'), null);
});

test('a war past its deadline is resolved when it is next read', async () => {
    const { call, setNow, clanExperience } = harness();
    const warId = await declareAndAccept(call, { durationHours: 24 });
    setNow(new Date('2026-11-04T12:00:00Z'));
    const list = await call('get', '/api/clan-wars', 'Sasuke');
    assert.equal(list.body.wars[0].status, 'completed');
    assert.equal(list.body.wars[0].result.winnerSide, null);
    assert.equal(list.body.wars[0].archetypeSnapshot, undefined);
    assert.deepEqual(clanExperience, []);
    const detail = await call('get', `/api/clan-wars/${warId}`, 'Sasuke');
    assert.equal(detail.body.war.result.reason, 'deadline');
});

test('players outside the warring clans cannot act on the war', async () => {
    const { call, users } = harness();
    users.docs.push(member('Kisame', 'Mist', 'clanLeader'));
    const warId = await declareAndAccept(call);
    const result = await call('post', `/api/clan-wars/${warId}/roster/join`, 'Kisame');
    assert.equal(result.status, 403);
});
