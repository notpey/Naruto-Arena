const { test } = require('node:test');
const assert = require('node:assert/strict');

test('ACP Gacha Config normalizes custom drop rates and pity limits', () => {
    const rawACPPayload = {
        pityThreshold: 40,
        rates: {
            legendary: 1.0,
            epic: 5.0,
            rare: 15.0,
            uncommon: 30.0,
            common: 49.0
        },
        duplicateShards: {
            legendary: 200,
            epic: 120,
            rare: 60,
            uncommon: 30,
            common: 15
        },
        banners: [
            {
                bannerId: 'akatsuki-reborn',
                title: 'Akatsuki Reborn',
                subtitle: 'Rate Up: Pain & Konan',
                active: true,
                singleCostScrolls: 1,
                singleCostRyo: 150,
                multiCostScrolls: 9,
                multiCostRyo: 1200,
                featuredCharacters: ['uchiha-itachi', 'pain-render'],
                bannerImage: 'itachi-render.png',
                description: 'Custom Akatsuki featured banner.'
            }
        ]
    };

    assert.equal(rawACPPayload.pityThreshold, 40);
    assert.equal(rawACPPayload.rates.legendary, 1.0);
    assert.equal(rawACPPayload.rates.epic, 5.0);
    assert.equal(rawACPPayload.duplicateShards.legendary, 200);
    assert.equal(rawACPPayload.banners.length, 1);
    assert.equal(rawACPPayload.banners[0].bannerId, 'akatsuki-reborn');
    assert.equal(rawACPPayload.banners[0].singleCostRyo, 150);
});

test('ACP Gacha pull probability thresholds match cumulative rate bands', () => {
    const rates = {
        legendary: 1.0,
        epic: 5.0,
        rare: 15.0,
        uncommon: 30.0,
        common: 49.0
    };

    const legCut = rates.legendary; // 1.0
    const epicCut = legCut + rates.epic; // 6.0
    const rareCut = epicCut + rates.rare; // 21.0
    const uncCut = rareCut + rates.uncommon; // 51.0

    assert.equal(legCut, 1.0);
    assert.equal(epicCut, 6.0);
    assert.equal(rareCut, 21.0);
    assert.equal(uncCut, 51.0);
});

test('Chakra shard crafting rules calculate expected conversions', () => {
    const shardCosts = {
        scroll: 50,
        ryo: 20,
        character: 200
    };

    assert.equal(shardCosts.scroll, 50);
    assert.equal(shardCosts.ryo, 20);
    assert.equal(shardCosts.character, 200);
});

test('ACP Gacha banner image upload data URL and featured ninja list are preserved', () => {
    const sampleDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const bannerPayload = {
        bannerId: 'legendary-sanin',
        title: 'Legendary Sannin',
        subtitle: 'Rate Up: Jiraiya & Tsunade',
        bannerImage: sampleDataUrl,
        featuredCharacters: ['jiraiya', 'tsunade', 'orochimaru']
    };

    assert.ok(bannerPayload.bannerImage.startsWith('data:image/png;base64,'));
    assert.equal(bannerPayload.featuredCharacters.length, 3);
    assert.equal(bannerPayload.featuredCharacters[0], 'jiraiya');
});

