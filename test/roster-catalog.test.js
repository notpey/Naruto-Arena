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
        ['rock-lee', 'Rock Lee'],
        ['tenten', 'Tenten'],
        ['neji-hyuuga', 'Hyuuga Neji'],
        ['gaara-of-the-desert', 'Gaara of the Desert'],
        ['kankuro', 'Kankuro'],
        ['temari', 'Temari'],
        ['akadou-yoroi', 'Akadou Yoroi'],
        ['oboro', 'Oboro'],
        ['shigure', 'Shigure'],
        ['dosu-kinuta', 'Kinuta Dosu'],
        ['tsuchi-kin', 'Tsuchi Kin'],
        ['zaku-abumi', 'Abumi Zaku'],
        ['akimichi-chouji', 'Akimichi Chouji'],
        ['nara-shikamaru', 'Nara Shikamaru'],
        ['tsurugi-misumi', 'Tsurugi Misumi'],
        ['shiore-orochimaru', 'Shiore Orochimaru'],
        ['baki', 'Baki'],
        ['gekko-hayate', 'Gekko Hayate'],
        ['mitarashi-anko', 'Mitarashi Anko'],
        ['sarutobi-konohamaru', 'Sarutobi Konohamaru'],
        ['ebisu', 'Ebisu'],
        ['young-kakashi', 'Young Kakashi'],
        ['uchiha-obito', 'Uchiha Obito'],
        ['nohara-rin', 'Nohara Rin'],
        ['namikaze-minato', 'Namikaze Minato'],
    ]);
    const roster = ACTIVE_ROSTER_IDS.toReversed().map((characterId) => ({
        characterId,
        name: names.get(characterId),
        unlocked: characterId !== 'haku',
    }));

    assert.deepEqual(catalog.listAvailableArcs(roster).map((arc) => arc.label), [
        'Prologue', 'Land of Waves', 'Chūnin Exams', 'Kakashi Gaiden',
    ]);
    assert.deepEqual(catalog.filterRosterIndices(roster).map((index) => roster[index].characterId), [
        'uzumaki-naruto', 'uchiha-sasuke', 'haruno-sakura', 'hatake-kakashi',
        'umino-iruka', 'mizuki', 'yamanaka-ino', 'aburame-shino', 'hyuuga-hinata',
        'sarutobi-konohamaru', 'ebisu',
        'demon-brothers', 'momochi-zabuza', 'haku',
        'gato', 'zori-and-waraji', 'sarutobi-hiruzen',
        'inuzuka-kiba', 'rock-lee', 'tenten', 'neji-hyuuga', 'gaara-of-the-desert',
        'kankuro', 'temari', 'akadou-yoroi', 'oboro', 'shigure',
        'dosu-kinuta', 'tsuchi-kin', 'zaku-abumi', 'akimichi-chouji', 'nara-shikamaru', 'tsurugi-misumi', 'shiore-orochimaru', 'baki', 'gekko-hayate', 'mitarashi-anko',
        'young-kakashi', 'uchiha-obito', 'nohara-rin', 'namikaze-minato',
    ]);
    assert.deepEqual(catalog.filterRosterIndices(roster, { arc: 'kakashi-gaiden' })
        .map((index) => roster[index].characterId), ['young-kakashi', 'uchiha-obito', 'nohara-rin', 'namikaze-minato']);
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
    assert.equal(catalog.getArc(roster.find((character) => character.characterId === 'tenten')).label, 'Chūnin Exams');
    assert.equal(catalog.getArc(roster.find((character) => character.characterId === 'neji-hyuuga')).label, 'Chūnin Exams');
    assert.equal(catalog.getArc(roster.find((character) => character.characterId === 'gaara-of-the-desert')).label, 'Chūnin Exams');
});

test('roster order preserves team groups as new mission rewards are added', () => {
    const { getDefaultMissionCatalog } = require('../server.js');
    const roster = ACTIVE_ROSTER_IDS.toReversed().map((characterId) => ({ characterId, name: characterId }));
    const order = catalog.filterRosterIndices(roster, { sort: 'roster' })
        .map((index) => roster[index].characterId);
    assert.deepEqual(order, [
        'uzumaki-naruto', 'uchiha-sasuke', 'haruno-sakura',
        'inuzuka-kiba', 'aburame-shino', 'hyuuga-hinata',
        'nara-shikamaru', 'akimichi-chouji', 'yamanaka-ino',
        'rock-lee', 'neji-hyuuga', 'tenten',
        'gaara-of-the-desert', 'kankuro', 'temari', 'baki',
        'young-kakashi', 'uchiha-obito', 'nohara-rin', 'namikaze-minato',
        'dosu-kinuta', 'zaku-abumi', 'tsuchi-kin',
        'akadou-yoroi', 'tsurugi-misumi',
        'oboro', 'shigure',
        'shiore-orochimaru', 'mitarashi-anko', 'gekko-hayate',
        'umino-iruka', 'mizuki',
        'sarutobi-konohamaru', 'ebisu',
        'hatake-kakashi',
        'demon-brothers', 'haku', 'momochi-zabuza', 'gato', 'zori-and-waraji',
        'sarutobi-hiruzen',
    ]);
    assert.equal(new Set(order).size, ACTIVE_ROSTER_IDS.length, 'every active character has a roster position');

    const missionRewards = new Set(getDefaultMissionCatalog().flatMap((mission) =>
        mission.reward_characters || [mission.reward_character]));
    assert.ok([...missionRewards].every((id) => order.includes(id)),
        'each mission reward retains a roster position');
});
