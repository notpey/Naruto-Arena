const test = require('node:test');
const assert = require('node:assert/strict');
const { initializeEconomyState } = require('../server');

const chakraTotal = (pool) => Object.values(pool).reduce((sum, count) => sum + count, 0);

test('the first player starts with one chakra and the opponent gets no opening grant', () => {
    const { chakraPools, economy } = initializeEconomyState(['first', 'second'], 'first');

    assert.equal(chakraTotal(chakraPools.first), 1);
    assert.equal(chakraTotal(chakraPools.second), 0);
    assert.equal(economy.lastChakraGain.first.length, 1);
    assert.deepEqual(economy.lastChakraGain.second, []);
    assert.equal(economy.startGranted.first, true);
    assert.equal(economy.startGranted.second, false);
});
