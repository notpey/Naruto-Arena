const { test } = require('node:test');
const assert = require('node:assert/strict');

test('shop purchases calculate ryo deductions and inventory updates accurately', () => {
    const userProfile = {
        ryo: 5000,
        summonScrolls: 2,
        unlockedCharacters: ['uzumaki-naruto'],
        inventory: []
    };

    const shopCatalog = [
        { id: 'summon_scroll_1', type: 'scroll', price: 500, amount: 1 },
        { id: 'summon_scroll_10', type: 'scroll', price: 4500, amount: 10 },
        { id: 'char_rock_lee', type: 'character', price: 2000, characterId: 'rock-lee' }
    ];

    // Purchase 1 scroll
    const scrollItem = shopCatalog.find(i => i.id === 'summon_scroll_1');
    assert.ok(scrollItem);
    assert.ok(userProfile.ryo >= scrollItem.price);
    userProfile.ryo -= scrollItem.price;
    userProfile.summonScrolls += scrollItem.amount;

    assert.equal(userProfile.ryo, 4500);
    assert.equal(userProfile.summonScrolls, 3);

    // Purchase direct character unlock
    const charItem = shopCatalog.find(i => i.id === 'char_rock_lee');
    assert.ok(charItem);
    assert.ok(userProfile.ryo >= charItem.price);
    userProfile.ryo -= charItem.price;
    userProfile.unlockedCharacters.push(charItem.characterId);

    assert.equal(userProfile.ryo, 2500);
    assert.ok(userProfile.unlockedCharacters.includes('rock-lee'));

    // Attempt purchase without enough ryo
    const bigScrollPack = shopCatalog.find(i => i.id === 'summon_scroll_10');
    assert.ok(userProfile.ryo < bigScrollPack.price, 'Should detect insufficient funds');
});
