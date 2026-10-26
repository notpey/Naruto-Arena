const characters = require('./characters');

const byId = new Map(characters.map((character) => [character.characterId, character]));
const winWith = (characterId, wins) => ({ type: 'win_matches', character_id: characterId, wins });
const winWithAny = (characterIds, wins, label) => ({
    type: 'win_matches_any', character_ids: characterIds, character_name: label, wins,
});

const launchMissions = [
    ['a-new-generation', 'A New Generation', 1, 'sarutobi-konohamaru',
        [winWith('uzumaki-naruto', 3)]],
    ['duty-of-a-sensei', 'Duty of a Sensei', 1, 'umino-iruka',
        [winWithAny(['uzumaki-naruto', 'uchiha-sasuke', 'haruno-sakura'], 4, 'a Team 7 member')]],
    ['a-dishonored-shinobi', 'A Dishonored Shinobi', 1, 'mizuki',
        [winWith('uzumaki-naruto', 5)]],
    ['private-lesson', 'Private Lesson', 1, 'ebisu',
        [winWith('sarutobi-konohamaru', 3)]],
    ['mist-ascendant', 'Mist Ascendant', 6, 'demon-brothers',
        [winWithAny(['umino-iruka', 'mizuki', 'sarutobi-konohamaru', 'ebisu'], 4,
            'an Academy mission character')]],
    ['hidden-hunter', 'Hidden Hunter', 6, 'haku',
        [winWith('demon-brothers', 4)]],
    ['devotion', 'Devotion', 6, 'momochi-zabuza',
        [winWith('haku', 4)]],
    ['gatos-enforcers', "Gatō's Enforcers", 6, 'zori-and-waraji',
        [winWithAny(['uzumaki-naruto', 'uchiha-sasuke', 'haruno-sakura'], 5, 'a Team 7 member')]],
    ['the-shipping-magnate', 'The Shipping Magnate', 6, 'gato',
        [winWith('zori-and-waraji', 3)]],
    ['team-7-fights-as-a-team', 'Team 7 Fights as a Team', 6, 'hatake-kakashi',
        [{ type: 'win_matches_same_team',
            character_ids: ['uzumaki-naruto', 'uchiha-sasuke'], wins: 4 }]],
    ['the-god-of-the-shinobi', 'The God of the Shinobi', 11, 'sarutobi-hiruzen',
        [winWith('hatake-kakashi', 5)]],
].map(([missionId, title, level, characterId, goals], index) => {
    const character = byId.get(characterId);
    return {
        missionId, title, level_requirement: level,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: characterId,
        reward_character_name: character?.name || characterId,
        reward: `Unlock ${character?.name || characterId}.`,
        image: character?.facePicture || '',
        imageAlt: `${character?.name || characterId} portrait`,
        characterName: character?.name || characterId,
        portrait: character?.facePicture || '',
        portraitAlt: `${character?.name || characterId} portrait`,
        requirements: [], goals, sortOrder: index + 1,
        revision: 2,
    };
});

module.exports = launchMissions;
