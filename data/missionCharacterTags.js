// Mission classifications are separate from combat character tags.
const team7Ids = new Set([
    'uzumaki-naruto', 'uchiha-sasuke', 'haruno-sakura',
    'kyuubi-naruto', 'cursed-seal-lv1-sasuke', 'cursed-seal-sasuke',
]);
const otherKonohaNinjaIds = new Set([
    'sarutobi-konohamaru', 'umino-iruka', 'mizuki', 'ebisu',
    'hatake-kakashi', 'sarutobi-hiruzen', 'gekko-hayate', 'mitarashi-anko',
]);

const getMissionCharacterTags = (character) => {
    const id = character?.characterId;
    const tags = new Set(character?.tags || []);
    if (tags.has('konoha-genin') || otherKonohaNinjaIds.has(id)) tags.add('konoha-ninja');
    if (team7Ids.has(id)) tags.add('team-7');
    return tags;
};

module.exports = { getMissionCharacterTags };
