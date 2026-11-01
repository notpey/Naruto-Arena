const characters = require('./characters');

const byId = new Map(characters.map((character) => [character.characterId, character]));
const winWith = (characterId, wins) => ({ type: 'win_matches', character_id: characterId, wins });
const winWithAny = (characterIds, wins, label) => ({
    type: 'win_matches_any', character_ids: characterIds, character_name: label, wins,
});
const winWithTag = (characterTag, wins, label, type = 'win_matches_tag') => ({
    type, character_tag: characterTag, character_name: label, wins,
});

const launchMissions = [
    ['a-new-generation', 'A New Generation', 1, 'sarutobi-konohamaru',
        [winWith('uzumaki-naruto', 3)]],
    ['duty-of-a-sensei', 'Duty of a Sensei', 1, 'umino-iruka',
        [winWithTag('konoha-genin', 5, 'a Konoha genin'), winWith('uzumaki-naruto', 3)]],
    ['a-dishonored-shinobi', 'A Dishonored Shinobi', 1, 'mizuki',
        [winWithTag('konoha-genin', 5, 'Konoha genin', 'win_matches_against_tag')]],
    ['private-lesson', 'Private Lesson', 1, 'ebisu',
        [winWith('sarutobi-konohamaru', 3)]],
    ['mist-ascendant', 'Mist Ascendant', 6, 'demon-brothers',
        [winWithAny(['umino-iruka', 'mizuki', 'sarutobi-konohamaru', 'ebisu'], 4,
            'an Academy mission character')]],
    ['hidden-hunter', 'Hidden Hunter', 6, 'haku',
        [winWith('demon-brothers', 4),
            winWithAny(['uzumaki-naruto', 'uchiha-sasuke'], 4, 'Naruto or Sasuke')]],
    ['devotion', 'Devotion', 11, 'momochi-zabuza',
        [winWith('haku', 4)]],
    ['gatos-enforcers', "Gatō's Enforcers", 6, 'zori-and-waraji',
        [winWithAny(['uzumaki-naruto', 'uchiha-sasuke', 'haruno-sakura'], 5, 'a Team 7 member')]],
    ['the-shipping-magnate', 'The Shipping Magnate', 6, 'gato',
        [winWith('zori-and-waraji', 4)]],
    ['team-7-fights-as-a-team', 'Team 7 Fights as a Team', 16, 'hatake-kakashi',
        [winWithTag('team-7', 5, 'Team 7', 'win_matches_all_team_tag')]],
    ['the-god-of-the-shinobi', 'The God of the Shinobi', 11, 'sarutobi-hiruzen',
        [winWithTag('konoha-ninja', 30, 'Konoha ninja', 'win_matches_tag_members')]],
].map(([missionId, title, level, characterId, goals], index) => {
    const character = byId.get(characterId);
    return {
        missionId, title, level_requirement: level,
        ...(missionId === 'devotion' || missionId === 'the-god-of-the-shinobi'
            ? { mission_rank: 'b' }
            : missionId === 'team-7-fights-as-a-team' ? { mission_rank: 'a' } : {}),
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
        revision: ['duty-of-a-sensei', 'a-dishonored-shinobi', 'hidden-hunter',
            'the-shipping-magnate', 'team-7-fights-as-a-team',
            'the-god-of-the-shinobi'].includes(missionId) ? 3 : 2,
    };
});

module.exports = launchMissions;
