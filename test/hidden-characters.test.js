const { test } = require('node:test');
const assert = require('node:assert/strict');
const characters = require('../data/characters');
const createTowerRouter = require('../routes/tower.js');
const server = require('../server.js');

// A character hidden from players in Character Access is a staff-only test: players must never
// meet it, whether a bot fields it, the Tower offers it, or the Tower sends it as an enemy.
const HIDDEN_ID = characters[0].characterId;
const policies = { [HIDDEN_ID]: { player: { visibility: 'hidden', unlock: 'inherit' } } };

const appState = {
    async findOne(query) {
        return query.key === 'character_rank_access' ? { key: query.key, version: 2, policies } : null;
    },
    async updateOne() { return { matchedCount: 1 }; },
};

test('only characters set to hidden for players count as hidden', async () => {
    server.__setTestCharacters(characters);
    server.__setTestAppStateCollection(appState);
    const hidden = await server.getPlayerHiddenCharacterIds();
    assert.deepEqual([...hidden], [HIDDEN_ID]);
});

test('bots never field a character hidden from players', () => {
    server.__setTestCharacters(characters);
    const hiddenIndex = characters.findIndex((character) => character.characterId === HIDDEN_ID);
    const hidden = new Set([HIDDEN_ID]);
    for (let round = 0; round < 300; round += 1) {
        assert.ok(!server.buildBattleBotTeam(hidden).includes(hiddenIndex), 'regular bot team');
    }
    for (let round = 0; round < 100; round += 1) {
        const boss = server.createEliteBossPlayer({ matchId: `m${round}`, playerProfile: {}, hiddenIds: hidden });
        assert.ok(!boss.team.some((member) => (member?.rosterIndex ?? member) === hiddenIndex), 'elite boss team');
    }
});

test('a team holding a hidden character is found, so public queues can refuse it', () => {
    server.__setTestCharacters(characters);
    const hiddenIndex = characters.findIndex((character) => character.characterId === HIDDEN_ID);
    const hidden = new Set([HIDDEN_ID]);
    assert.equal(server.findPlayerHiddenCharacterInTeam([hiddenIndex + 1, hiddenIndex + 2, hiddenIndex], hidden)?.characterId, HIDDEN_ID);
    assert.equal(server.findPlayerHiddenCharacterInTeam([hiddenIndex + 1, hiddenIndex + 2, hiddenIndex + 3], hidden), null);
});

test('the Tower never drafts a character hidden from players', async () => {
    // Hide all but a few characters so a leak would show up in every draft.
    const visible = characters.slice(0, 12).map((character) => character.characterId);
    const hiddenIds = new Set(characters.map((character) => character.characterId).filter((id) => !visible.includes(id)));
    const runs = [];
    const router = createTowerRouter({
        requireSession: (req, res, next) => next(),
        towerRunsCollection: {
            async findOne() { return null; },
            find() { return { sort() { return this; }, limit() { return this; }, async toArray() { return []; } }; },
            async insertOne(doc) { runs.push(doc); },
            async updateMany() { return {}; },
        },
        usersCollection: { async findOne() { return null; }, async updateOne() { return {}; } },
        getCharacters: () => characters,
        getPlayerHiddenCharacterIds: async () => hiddenIds,
        getMatchActive: async () => null,
        buildTowerMatch: async () => null,
        userToMatch: new Map(),
        removeQueuedEntry: () => {},
    });
    const layer = router.stack.find((entry) => entry.route?.path === '/start' && entry.route.methods.post);
    const handler = layer.route.stack[layer.route.stack.length - 1].handle;
    for (const mode of ['standard', 'legacy']) {
        let payload;
        const res = { status() { return res; }, json(data) { payload = data; return res; } };
        await handler({ authUser: { username: 'p' }, body: { mode } }, res);
        const offered = payload.run.draft.offers.flat().map((character) => character.characterId);
        assert.ok(offered.length > 0, `${mode} run offers a draft`);
        assert.ok(offered.every((id) => visible.includes(id)), `${mode} draft offers only visible characters`);
    }
});
