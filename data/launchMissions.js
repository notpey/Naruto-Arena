const characters = require('./characters');

const byId = new Map(characters.map((character) => [character.characterId, character]));
const winWith = (characterId, wins) => ({ type: 'win_matches', character_id: characterId, wins });
const winStreak = (characterId, wins) => ({ type: 'win_streak', character_id: characterId, wins });
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
    ['double-lucky', 'Double Lucky', 6, 'oboro',
        [winStreak('uzumaki-naruto', 2), winStreak('uchiha-sasuke', 2),
            winStreak('haruno-sakura', 2)], 'dc'],
    ['a-rare-opportunity', 'A Rare Opportunity', 6, 'shigure',
        [winWith('oboro', 4), winWith('gaara-of-the-desert', 4)], 'dc'],
    ['chuunin-exam-the-forest-of-death', 'Chuunin Exam: The Forest of Death!', 11,
        ['dosu-kinuta', 'zaku-abumi', 'tsuchi-kin'],
        [winWithTag('exam-team-7', 3, 'Team 7 (Naruto, Sasuke, Sakura)', 'win_matches_all_team_tag'),
            winWithTag('exam-team-8', 3, 'Team 8 (Kiba, Shino, Hinata)', 'win_matches_all_team_tag'),
            winWithTag('exam-team-9', 3, 'Team 9 (Shikamaru, Chouji, Ino)', 'win_matches_all_team_tag'),
            winWithTag('exam-team-10', 3, 'Team 10 (Lee, Neji, Tenten)', 'win_matches_all_team_tag')], 'dc'],
    ['the-sounds-amongst-the-leaves', 'The Sounds Amongst the Leaves', 11, 'akadou-yoroi',
        [winWith('uchiha-sasuke', 4), winStreak('uchiha-sasuke', 2)], 'dc'],
    ['twisting-sound', 'Twisting Sound', 11, 'tsurugi-misumi',
        [winWith('akadou-yoroi', 4)], 'dc'],
    ['sand-siblings-at-war', 'Sand Siblings at War', 11, 'baki',
        [winWithTag('konoha-ninja', 10, 'Konoha ninja', 'win_matches_against_tag')], 'b'],
    ['the-moonlight-of-the-leaf', 'The Moonlight of the Leaf', 11, 'gekko-hayate',
        [winWithTag('sound-or-sand-ninja', 10, 'a Sound or Sand ninja', 'win_matches_against_tag')], 'b'],
    ['the-survivor-of-the-seal', 'The Survivor of the Seal', 11, 'mitarashi-anko',
        [winWith('baki', 5), winWith('gekko-hayate', 5)], 'b'],
    ['hostile-takeover', 'Hostile Takeover', 16, 'shiore-orochimaru',
        [winWith('uchiha-sasuke', 5), winWith('mitarashi-anko', 5)], 'b'],
].map(([missionId, title, level, reward, goals, rank], index) => {
    const rewardIds = Array.isArray(reward) ? reward : [reward];
    const characterId = rewardIds[0];
    const character = byId.get(characterId);
    const newMission = index >= 11;
    const rewardNames = rewardIds.map((id) => byId.get(id)?.name || id);
    return {
        missionId, title, level_requirement: level,
        ...(rank ? { mission_rank: rank }
            : missionId === 'devotion' || missionId === 'the-god-of-the-shinobi'
            ? { mission_rank: 'b' }
            : missionId === 'team-7-fights-as-a-team' ? { mission_rank: 'a' } : {}),
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: characterId,
        ...(rewardIds.length > 1 ? { reward_characters: rewardIds } : {}),
        reward_character_name: character?.name || characterId,
        reward: `Unlock ${rewardNames.join(', ')}.`,
        image: newMission ? '' : character?.facePicture || '',
        imageAlt: `${character?.name || characterId} portrait`,
        characterName: rewardNames.join(', '),
        portrait: character?.facePicture || '',
        portraitAlt: `${character?.name || characterId} portrait`,
        requirements: [], goals, sortOrder: index + 1,
        revision: newMission ? 1 : ['duty-of-a-sensei', 'a-dishonored-shinobi', 'hidden-hunter',
            'the-shipping-magnate', 'team-7-fights-as-a-team',
            'the-god-of-the-shinobi'].includes(missionId) ? 3 : 2,
    };
});

module.exports = launchMissions;
