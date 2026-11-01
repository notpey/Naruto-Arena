// Mission classifications are separate from combat character tags.
const team7Ids = new Set([
    'uzumaki-naruto', 'uchiha-sasuke', 'haruno-sakura',
    'kyuubi-naruto', 'cursed-seal-lv1-sasuke', 'cursed-seal-sasuke',
]);
const otherKonohaNinjaIds = new Set([
    'sarutobi-konohamaru', 'umino-iruka', 'mizuki', 'ebisu',
    'hatake-kakashi', 'sarutobi-hiruzen', 'gekko-hayate', 'mitarashi-anko',
]);
const examTeams = {
    'exam-team-7': ['uzumaki-naruto', 'uchiha-sasuke', 'haruno-sakura'],
    'exam-team-8': ['inuzuka-kiba', 'aburame-shino', 'hyuuga-hinata'],
    'exam-team-9': ['nara-shikamaru', 'akimichi-chouji', 'yamanaka-ino'],
    'exam-team-10': ['rock-lee', 'neji-hyuuga', 'tenten'],
};
const soundOrSandNinjaIds = new Set([
    'dosu-kinuta', 'zaku-abumi', 'tsuchi-kin',
    'akadou-yoroi', 'tsurugi-misumi',
    'gaara-of-the-desert', 'kankuro', 'temari', 'baki',
]);

const getMissionCharacterTags = (character) => {
    const id = character?.characterId;
    const tags = new Set(character?.tags || []);
    if (tags.has('konoha-genin') || otherKonohaNinjaIds.has(id)) tags.add('konoha-ninja');
    if (team7Ids.has(id)) tags.add('team-7');
    for (const [teamTag, ids] of Object.entries(examTeams)) {
        if (ids.includes(id)) tags.add(teamTag);
    }
    if (soundOrSandNinjaIds.has(id)) tags.add('sound-or-sand-ninja');
    return tags;
};

module.exports = { getMissionCharacterTags };
