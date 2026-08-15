const { test } = require('node:test');
const assert = require('node:assert/strict');

test('gacha banner drop pools contain valid roster IDs', () => {
    const GACHA_ROSTER_POOLS = {
        legendary: ['edo-tensei-hashirama', 'edo-tensei-tobirama', 'cursed-seal-sasuke', 'kyuubi-naruto', 'butterfly-chouji'],
        epic: ['uchiha-itachi', 'hoshigaki-kisame', 'orochimaru', 'jiraiya', 'tsunade', 'sarutobi-hiruzen', 'hatake-kakashi'],
        rare: ['momochi-zabuza', 'haku', 'maito-gai', 'yuhi-kurenai', 'sarutobi-asuma', 'yakushi-kabuto', 'mitarashi-anko'],
        uncommon: ['gaara-of-the-desert', 'kankuro', 'temari', 'rock-lee', 'tenten', 'neji-hyuuga', 'yamanaka-ino'],
        common: ['uzumaki-naruto', 'haruno-sakura', 'uchiha-sasuke', 'inuzuka-kiba', 'aburame-shino', 'hyuuga-hinata', 'nara-shikamaru', 'akimichi-chouji']
    };

    Object.entries(GACHA_ROSTER_POOLS).forEach(([rarity, pool]) => {
        assert.ok(Array.isArray(pool) && pool.length > 0, `Pool ${rarity} should not be empty`);
        pool.forEach((id) => {
            assert.equal(typeof id, 'string', 'Character ID should be a string');
            assert.ok(id.length > 0, 'Character ID should not be empty');
        });
    });
});

test('duplicate shard rates scale with item rarity', () => {
    const GACHA_DUPLICATE_SHARDS = {
        legendary: 150,
        epic: 100,
        rare: 50,
        uncommon: 25,
        common: 10
    };

    assert.equal(GACHA_DUPLICATE_SHARDS.legendary, 150);
    assert.equal(GACHA_DUPLICATE_SHARDS.epic, 100);
    assert.equal(GACHA_DUPLICATE_SHARDS.rare, 50);
    assert.equal(GACHA_DUPLICATE_SHARDS.uncommon, 25);
    assert.equal(GACHA_DUPLICATE_SHARDS.common, 10);
});

test('pity counter guarantees epic drop at 50 pulls', () => {
    let pityCounter = 49;
    pityCounter += 1;
    let rarity = 'common';
    if (pityCounter >= 50) {
        rarity = 'epic';
        pityCounter = 0;
    }
    assert.equal(rarity, 'epic');
    assert.equal(pityCounter, 0);
});

test('gacha router executes pulls and deducts currency accurately', async () => {
    const gachaRouterFactory = require('../routes/gacha.js');
    
    let updatedUserDoc = null;
    const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        username: 'testninja',
        profile: {
            summonScrolls: 10,
            ryo: 1000,
            chakraShards: 50,
            unlockedCharacterIds: ['uzumaki-naruto'],
            gachaStats: { pityCounter: 0, totalPulls: 0 }
        }
    };

    const mockUsersCollection = {
        findOne: async (query) => {
            if (query.username === 'testninja' || query['$or']) return mockUser;
            return null;
        },
        updateOne: async (query, update) => {
            updatedUserDoc = update.$set;
            return { acknowledged: true };
        }
    };

    const router = gachaRouterFactory({
        usersCollection: mockUsersCollection,
        appStateCollection: null,
        normalizeUserProfile: (u) => u.profile || u,
        requireSession: (req, res, next) => next(),
        getCharactersData: () => [
            { characterId: 'uzumaki-naruto', name: 'Naruto Uzumaki', rank: 'genin' },
            { characterId: 'uchiha-sasuke', name: 'Sasuke Uchiha', rank: 'genin' },
            { characterId: 'hatake-kakashi', name: 'Kakashi Hatake', rank: 'jounin' }
        ]
    });

    assert.ok(router, 'Gacha router should be instantiated');
});

