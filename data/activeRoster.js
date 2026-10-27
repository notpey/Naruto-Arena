// The current playable roster. Character modules remain available as historical
// source data; only these entries are loaded into new matches and the client.
const ACTIVE_ROSTER_IDS = [
    'uzumaki-naruto',
    'uchiha-sasuke',
    'haruno-sakura',
    'hatake-kakashi',
    'umino-iruka',
    'mizuki',
    'momochi-zabuza',
    'haku',
    'demon-brothers',
    'sarutobi-hiruzen',
    'gato',
    'zori-and-waraji',
    'yamanaka-ino',
    'sarutobi-konohamaru',
    'ebisu',
    'aburame-shino',
    'hyuuga-hinata',
];

const ACTIVE_ROSTER_SET = new Set(ACTIVE_ROSTER_IDS);
const isActiveCharacter = (character) => ACTIVE_ROSTER_SET.has(character?.characterId || character?.id);

module.exports = { ACTIVE_ROSTER_IDS, ACTIVE_ROSTER_SET, isActiveCharacter };
