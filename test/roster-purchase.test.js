const test = require('node:test');
const assert = require('node:assert/strict');
const createCharacterPurchasesRouter = require('../routes/characterPurchases');

test('a locked roster character can be purchased for the advertised Ryo price', async () => {
    const user = {
        _id: 'player-1',
        username: 'PlayerOne',
        profile: { ryo: 650, missions: { unlockedCharacterIds: [], progressByMissionId: {} } },
    };
    const usersCollection = {
        async findOne() { return user; },
        async updateOne(filter, update) {
            if (user.profile.ryo < filter['profile.ryo'].$gte ||
                user.profile.missions.unlockedCharacterIds.includes(filter['profile.missions.unlockedCharacterIds'].$ne)) {
                return { modifiedCount: 0 };
            }
            user.profile.ryo += update.$inc['profile.ryo'];
            user.profile.missions.unlockedCharacterIds.push(update.$addToSet['profile.missions.unlockedCharacterIds']);
            return { modifiedCount: 1 };
        },
    };
    const router = createCharacterPurchasesRouter({
        usersCollection,
        requireSession: (_req, _res, next) => next(),
        normalizeUserProfile: (entry) => entry.profile,
        getMissionLockedCharacterIds: async () => new Set(['hatake-kakashi']),
        getStoredMissionCatalog: async () => [],
        characterService: { getCharacters: () => [{ characterId: 'hatake-kakashi', requiredMissionId: 'team-7-fights-as-a-team' }] },
        profileHasUnlockedCharacter: (profile, id) => profile.missions.unlockedCharacterIds.includes(id),
        getCharacterPriceForMissionId: () => 500,
        normalizeCharacterId: (id) => id,
        normalizeMissionState: (state) => state,
        normalizeMissionProgressEntry: (entry) => entry,
    });
    const handler = router.stack.find((layer) => layer.route?.path === '/api/characters/buy-direct')
        .route.stack.at(-1).handle;
    let result;
    const res = {
        status(code) { this.statusCode = code; return this; },
        json(body) { result = { status: this.statusCode || 200, body }; return this; },
    };

    await handler({ authUser: { username: user.username }, body: { characterId: 'hatake-kakashi' } }, res);
    assert.equal(result.status, 200);
    assert.equal(result.body.price, 500);
    assert.equal(result.body.ryo, 150);
    assert.deepEqual(result.body.unlockedCharacterIds, ['hatake-kakashi']);
    assert.equal(user.profile.ryo, 150);
    assert.deepEqual(user.profile.missions.progressByMissionId, {}, 'Buying must not complete the mission');

    await handler({ authUser: { username: user.username }, body: { characterId: 'hatake-kakashi' } }, res);
    assert.equal(result.status, 400);
    assert.match(result.body.error, /already unlocked/i);
    assert.equal(user.profile.ryo, 150, 'A repeat purchase must not spend Ryo');

    user.profile.missions.unlockedCharacterIds = [];
    await handler({ authUser: { username: user.username }, body: { characterId: 'hatake-kakashi' } }, res);
    assert.equal(result.status, 400);
    assert.match(result.body.error, /not enough Ryo/i);
    assert.deepEqual(user.profile.missions.unlockedCharacterIds, []);
});
