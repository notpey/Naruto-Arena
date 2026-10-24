const test = require('node:test');
const assert = require('node:assert/strict');
const { ACTIVE_ROSTER_IDS } = require('../data/activeRoster');
const catalog = require('../roster-catalog');

test('arc sorting changes display order without changing canonical roster indices', () => {
    const names = new Map([
        ['uzumaki-naruto', 'Uzumaki Naruto'],
        ['uchiha-sasuke', 'Uchiha Sasuke'],
        ['haruno-sakura', 'Haruno Sakura'],
        ['hatake-kakashi', 'Hatake Kakashi'],
        ['umino-iruka', 'Umino Iruka'],
        ['mizuki', 'Mizuki'],
        ['demon-brothers', 'Demon Brothers'],
        ['momochi-zabuza', 'Momochi Zabuza'],
        ['haku', 'Haku'],
        ['sarutobi-hiruzen', 'Sarutobi Hiruzen'],
    ]);
    const roster = ACTIVE_ROSTER_IDS.toReversed().map((characterId) => ({
        characterId,
        name: names.get(characterId),
        unlocked: characterId !== 'haku',
    }));

    assert.deepEqual(catalog.listAvailableArcs(roster).map((arc) => arc.label), [
        'Prologue', 'Land of Waves', 'Konoha Crush',
    ]);
    assert.deepEqual(catalog.filterRosterIndices(roster).map((index) => roster[index].characterId), [
        'uzumaki-naruto', 'uchiha-sasuke', 'haruno-sakura', 'hatake-kakashi',
        'umino-iruka', 'mizuki', 'demon-brothers', 'momochi-zabuza', 'haku', 'sarutobi-hiruzen',
    ]);
    assert.deepEqual(catalog.filterRosterIndices(roster, { arc: 'land-of-waves' }).map((index) => roster[index].characterId), [
        'demon-brothers', 'momochi-zabuza', 'haku',
    ]);
    assert.deepEqual(catalog.filterRosterIndices(roster, { availability: 'locked', search: 'HAKU' }), [2]);
    assert.equal(catalog.filterRosterIndices(roster, { search: 'no match' }).length, 0);
    assert.equal(catalog.getArc(roster[0]).label, 'Konoha Crush');
});
