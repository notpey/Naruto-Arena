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
        ['gato', 'Gatō'],
        ['zori-and-waraji', 'Zōri & Waraji'],
        ['sarutobi-hiruzen', 'Hokage Hiruzen'],
        ['yamanaka-ino', 'Yamanaka Ino'],
        ['aburame-shino', 'Aburame Shino'],
        ['hyuuga-hinata', 'Hyuuga Hinata'],
        ['inuzuka-kiba', 'Inuzuka Kiba'],
        ['gaara-of-the-desert', 'Gaara of the Desert'],
        ['sarutobi-konohamaru', 'Sarutobi Konohamaru'],
        ['ebisu', 'Ebisu'],
    ]);
    const roster = ACTIVE_ROSTER_IDS.toReversed().map((characterId) => ({
        characterId,
        name: names.get(characterId),
        unlocked: characterId !== 'haku',
    }));

    assert.deepEqual(catalog.listAvailableArcs(roster).map((arc) => arc.label), [
        'Prologue', 'Land of Waves', 'Chūnin Exams',
    ]);
    assert.deepEqual(catalog.filterRosterIndices(roster).map((index) => roster[index].characterId), [
        'uzumaki-naruto', 'uchiha-sasuke', 'haruno-sakura', 'hatake-kakashi',
        'umino-iruka', 'mizuki', 'yamanaka-ino', 'aburame-shino', 'hyuuga-hinata',
        'sarutobi-konohamaru', 'ebisu',
        'demon-brothers', 'momochi-zabuza', 'haku',
        'gato', 'zori-and-waraji', 'sarutobi-hiruzen',
        'inuzuka-kiba', 'gaara-of-the-desert',
    ]);
    assert.deepEqual(catalog.filterRosterIndices(roster, { arc: 'land-of-waves' }).map((index) => roster[index].characterId), [
        'demon-brothers', 'momochi-zabuza', 'haku', 'gato', 'zori-and-waraji',
        'sarutobi-hiruzen',
    ]);
    assert.deepEqual(catalog.filterRosterIndices(roster, { availability: 'locked', search: 'HAKU' }), [
        roster.findIndex((character) => character.characterId === 'haku'),
    ]);
    assert.equal(catalog.filterRosterIndices(roster, { search: 'no match' }).length, 0);
    assert.equal(catalog.getArc(roster.find((character) => character.characterId === 'sarutobi-hiruzen')).label, 'Land of Waves');
    assert.equal(catalog.getArc(roster.find((character) => character.characterId === 'inuzuka-kiba')).label, 'Chūnin Exams');
    assert.equal(catalog.getArc(roster.find((character) => character.characterId === 'gaara-of-the-desert')).label, 'Chūnin Exams');
});
