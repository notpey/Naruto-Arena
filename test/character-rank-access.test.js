const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const createAdminRouter = require('../routes/admin');
const createCharacterPurchasesRouter = require('../routes/characterPurchases');
const catalog = require('../roster-catalog');
const {
    createCharacterRankAccessService, evaluateAccess,
} = require('../services/characterRankAccess');

function makeService() {
    const documents = new Map();
    const collection = {
        async findOne({ key }) { return documents.get(key) || null; },
        async updateOne({ key }, { $set }) { documents.set(key, $set); },
    };
    const characters = [
        { id: 'yamanaka-ino', characterId: 'yamanaka-ino', name: 'Yamanaka Ino' },
        { id: 'ebisu', characterId: 'ebisu', name: 'Ebisu' },
    ];
    const service = createCharacterRankAccessService({
        getCollection: () => collection,
        getCharacters: () => characters,
    });
    return { service, characters, collection };
}

test('Ino is hidden from Members even when owned; all three staff roles can use her', async () => {
    const { service } = makeService();
    const policies = await service.getPolicies();
    for (const role of ['admin', 'global_moderator', 'moderator']) {
        assert.deepEqual(evaluateAccess({ policies, characterId: 'yamanaka-ino', role,
            inheritedUnlocked: false }), { visibility: 'visible', unlockMode: 'allow',
            hidden: false, unlocked: true });
    }
    assert.deepEqual(evaluateAccess({ policies, characterId: 'yamanaka-ino', role: 'player',
        inheritedUnlocked: true }), { visibility: 'hidden', unlockMode: 'inherit',
        hidden: true, unlocked: false });
    assert.deepEqual(evaluateAccess({ policies, characterId: 'ebisu', role: 'player',
        inheritedUnlocked: false }), { visibility: 'visible', unlockMode: 'inherit',
        hidden: false, unlocked: false });
});

test('Member visibility and unlock settings persist independently', async () => {
    const { service } = makeService();
    await assert.rejects(service.savePolicies({ unknown: { player: 'allow' } }, 'Admin'), /Unknown character/);
    await assert.rejects(service.savePolicies({ ebisu: { player: 'public' } }, 'Admin'), /Invalid player access/);
    const saved = await service.savePolicies({ ebisu: { player: {
        visibility: 'hidden', unlock: 'allow',
    } } }, 'Admin');
    assert.deepEqual(saved, { ebisu: { player: { visibility: 'hidden', unlock: 'allow' } } });
    assert.deepEqual(await service.getPolicies(), saved);
    assert.deepEqual(evaluateAccess({ policies: saved, characterId: 'ebisu', role: 'player',
        inheritedUnlocked: false }), { visibility: 'hidden', unlockMode: 'allow',
        hidden: true, unlocked: false });
    assert.deepEqual(evaluateAccess({ policies: saved, characterId: 'yamanaka-ino', role: 'player',
        inheritedUnlocked: true }), { visibility: 'visible', unlockMode: 'inherit',
        hidden: false, unlocked: true });
});

test('legacy access settings migrate and restore Ino visibility for Moderators', async () => {
    const { service, collection } = makeService();
    await collection.updateOne({ key: 'character_rank_access' }, { $set: {
        key: 'character_rank_access', policies: {
            'yamanaka-ino': { admin: 'allow', global_moderator: 'allow',
                moderator: 'deny', player: 'allow' },
            ebisu: { player: 'deny' },
        },
    } });
    const policies = await service.getPolicies();
    assert.deepEqual(policies['yamanaka-ino'].player,
        { visibility: 'hidden', unlock: 'inherit' });
    assert.deepEqual(policies.ebisu.player, { visibility: 'hidden', unlock: 'inherit' });
    assert.equal(evaluateAccess({ policies, characterId: 'yamanaka-ino', role: 'moderator',
        inheritedUnlocked: false }).unlocked, true);
});

test('ACP Member access requires Admin and saves separate visibility and unlock settings', async () => {
    const { service, characters } = makeService();
    const app = express();
    app.use(express.json());
    app.use('/api/admin', createAdminRouter({
        requireSession: (req, _res, next) => {
            req.authUser = {
                username: req.get('x-role') ? 'Reviewer' : 'Admin',
                role: req.get('x-role') || 'admin',
            };
            next();
        },
        characterRankAccess: service,
        getCharactersData: () => characters,
    }));
    const server = await new Promise(resolve => {
        const instance = app.listen(0, () => resolve(instance));
    });
    const url = `http://127.0.0.1:${server.address().port}/api/admin/character-access`;
    try {
        assert.equal((await fetch(url, { headers: { 'x-role': 'global_moderator' } })).status, 403);
        assert.equal((await fetch(url, { method: 'PUT', headers: {
            'content-type': 'application/json', 'x-role': 'moderator',
        }, body: JSON.stringify({ policies: {} }) })).status, 403);
        const initial = await (await fetch(url)).json();
        assert.equal(initial.policies['yamanaka-ino'].player.visibility, 'hidden');
        const response = await fetch(url, {
            method: 'PUT', headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ policies: { 'yamanaka-ino': {
                player: { visibility: 'hidden', unlock: 'inherit' },
            } } }),
        });
        assert.equal(response.status, 200);
        assert.equal((await response.json()).policies['yamanaka-ino'].player.visibility, 'hidden');
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});

test('hidden characters leave canonical roster indices intact but disappear from selection filters', () => {
    const roster = [
        { id: 'uzumaki-naruto', name: 'Uzumaki Naruto', unlocked: true },
        { id: 'yamanaka-ino', name: 'Yamanaka Ino', unlocked: false, hidden: true },
        { id: 'ebisu', name: 'Ebisu', unlocked: true },
    ];
    assert.deepEqual(catalog.filterRosterIndices(roster), [0, 2]);
    assert.deepEqual(catalog.filterRosterIndices(roster, { search: 'Ino' }), []);
    assert.deepEqual(catalog.filterRosterIndices(roster, { availability: 'locked' }), []);
    assert.equal(roster[2].id, 'ebisu');
});

test('direct purchase refuses a rank-hidden character even when the player owns it', async () => {
    const { service, characters } = makeService();
    characters[0].requiredMissionId = 'test-mission';
    const user = { _id: 'member-1', username: 'Member', role: 'player',
        profile: { ryo: 2000, missions: { unlockedCharacterIds: ['yamanaka-ino'] } } };
    let writes = 0;
    const app = express();
    app.use(express.json());
    app.use(createCharacterPurchasesRouter({
        requireSession: (req, _res, next) => { req.authUser = user; next(); },
        usersCollection: {
            findOne: async () => user,
            updateOne: async () => { writes += 1; },
        },
        normalizeUserProfile: (value) => value.profile,
        getMissionLockedCharacterIds: async () => new Set(['yamanaka-ino']),
        getStoredMissionCatalog: async () => [],
        characterService: { getCharacters: () => characters, getCharacterCatalog: () => characters },
        characterRankAccess: service,
        getCharacterAvailability: ({ policies, user: account, profile, characterId }) =>
            evaluateAccess({ policies, characterId, role: account.role,
                inheritedUnlocked: profile.missions.unlockedCharacterIds.includes(characterId) }),
        profileHasUnlockedCharacter: (profile, id) => profile.missions.unlockedCharacterIds.includes(id),
        getCharacterPriceForMissionId: () => 1000,
        normalizeCharacterId: (id) => id,
    }));
    const server = await new Promise(resolve => {
        const instance = app.listen(0, () => resolve(instance));
    });
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
        const response = await fetch(base + '/api/characters/buy-direct', {
            method: 'POST', headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ characterId: 'yamanaka-ino' }),
        });
        assert.equal(response.status, 403);
        assert.equal(writes, 0);
        assert.equal(user.profile.ryo, 2000);
    } finally {
        await new Promise(resolve => server.close(resolve));
    }
});
