const assert = require('node:assert/strict');
const test = require('node:test');

const characters = require('../data/characters');
const { getMissionCharacterTags } = require('../data/missionCharacterTags');
const { ACTIVE_ROSTER_IDS } = require('../data/activeRoster');
const { INITIAL_POLICIES } = require('../services/characterRankAccess');
const { getDefaultMissionCatalog, normalizeMissionCatalog, awardMissionCompletion,
    buildDefaultUserProfile, getCharacterAvailability, resolveMissionCatalogState,
    getProgressForMissionRevision, getMissionTagGoalIncrement } = require('../server');

const characterIds = new Set(characters.map((character) => character.characterId));
const trackedTypes = new Set([
    'win_matches', 'win_streak', 'win_matches_any', 'win_streak_any',
    'win_matches_same_team', 'reach_rank', 'use_skill',
    'win_matches_tag', 'win_matches_against_tag',
    'win_matches_all_team_tag', 'win_matches_tag_members',
]);

function goalCanUseRoster(goal, available) {
    if (goal.type === 'win_matches_all_team_tag') {
        return characters.filter((character) => available.has(character.characterId) &&
            getMissionCharacterTags(character).has(goal.character_tag)).length >= 3;
    }
    if (goal.type === 'win_matches_tag') {
        return characters.some((character) => available.has(character.characterId) &&
            getMissionCharacterTags(character).has(goal.character_tag));
    }
    if (goal.type === 'win_matches_any' || goal.type === 'win_streak_any') {
        return goal.character_ids.some((id) => available.has(id));
    }
    if (goal.type === 'win_matches_same_team') {
        return goal.character_ids.every((id) => available.has(id));
    }
    return !goal.character_id || available.has(goal.character_id);
}

test('every default mission has valid, trackable goals and a distinct character reward', () => {
    const missions = getDefaultMissionCatalog();
    const rewardIds = new Set();
    assert.equal(missions.length, 21);
    assert.deepEqual(missions.map((mission) => mission.level_requirement),
        [1, 1, 1, 1, 6, 6, 11, 6, 6, 16, 11,
            6, 6, 11, 11, 11, 11, 11, 11, 16, 26]);

    for (const mission of missions) {
        const rewards = mission.reward_characters || [mission.reward_character];
        for (const id of rewards) {
            assert.ok(characterIds.has(id), `${mission.missionId}: unknown reward ${id}`);
            assert.ok(!rewardIds.has(id), `${mission.missionId}: duplicate reward ${id}`);
            rewardIds.add(id);
        }
        assert.ok(mission.goals.length > 0, `${mission.missionId}: no goals`);
        assert.ok(mission.mode_restriction.allowed_modes.some((mode) => mode === 'quick' || mode === 'ladder'), `${mission.missionId}: no playable mode`);

        for (const goal of mission.goals) {
            assert.ok(trackedTypes.has(goal.type), `${mission.missionId}: untracked goal ${goal.type}`);
            assert.ok((goal.type === 'reach_rank' ? goal.rank : goal.wins) > 0, `${mission.missionId}: invalid target`);
            if (goal.type.includes('_tag')) {
                assert.ok(goal.character_tag, `${mission.missionId}: missing tag`);
                assert.ok(characters.some((character) => getMissionCharacterTags(character).has(goal.character_tag)),
                    `${mission.missionId}: unused tag`);
            }
            const references = [goal.character_id, ...(goal.character_ids || [])].filter(Boolean);
            for (const id of references) {
                assert.ok(characterIds.has(id), `${mission.missionId}: unknown goal character ${id}`);
                assert.ok(!rewards.includes(id), `${mission.missionId}: requires its own reward`);
            }
            if (goal.type.endsWith('_any') || goal.type === 'win_matches_same_team') {
                assert.ok(goal.character_ids.length >= 2, `${mission.missionId}: group goal needs two characters`);
            }
        }
    }
});

test('mission rewards are reachable except the Forest of Death team requiring hidden Ino', () => {
    const missions = getDefaultMissionCatalog();
    const rewardIds = new Set(missions.flatMap((mission) => mission.reward_characters || [mission.reward_character]));
    const available = new Set(['uzumaki-naruto', 'uchiha-sasuke', 'haruno-sakura',
        'aburame-shino', 'hyuuga-hinata', 'inuzuka-kiba', 'rock-lee', 'tenten', 'neji-hyuuga',
        'gaara-of-the-desert', 'kankuro', 'temari', 'akimichi-chouji', 'nara-shikamaru',
        'young-kakashi', 'uchiha-obito', 'nohara-rin']);
    assert.deepEqual(ACTIVE_ROSTER_IDS.filter((id) => !rewardIds.has(id) && id !== 'yamanaka-ino'),
        [...available]);
    const remaining = new Map(missions.map((mission) => [mission.missionId, mission]));

    let changed;
    do {
        changed = false;
        for (const [id, mission] of remaining) {
            if (mission.goals.every((goal) => goalCanUseRoster(goal, available))) {
                (mission.reward_characters || [mission.reward_character]).forEach((id) => available.add(id));
                remaining.delete(id);
                changed = true;
            }
        }
    } while (changed);

    assert.deepEqual([...remaining.keys()], ['chuunin-exam-the-forest-of-death'],
        'the Team 9 objective remains gated while Ino is hidden from Members');
});

test('new Members get the mission-free roster; staff see and use all active characters', () => {
    const missions = getDefaultMissionCatalog();
    const lockedCharacterIds = new Set(missions.flatMap((mission) => mission.reward_characters || [mission.reward_character]));
    const profile = buildDefaultUserProfile({});
    const member = ACTIVE_ROSTER_IDS.filter((characterId) => getCharacterAvailability({
        policies: INITIAL_POLICIES, user: { role: 'player' }, profile,
        characterId, lockedCharacterIds,
    }).unlocked);
    assert.deepEqual(member, ['uzumaki-naruto', 'uchiha-sasuke', 'haruno-sakura',
        'aburame-shino', 'hyuuga-hinata', 'inuzuka-kiba', 'rock-lee', 'tenten', 'neji-hyuuga',
        'gaara-of-the-desert', 'kankuro', 'temari', 'akimichi-chouji', 'nara-shikamaru',
        'young-kakashi', 'uchiha-obito', 'nohara-rin']);
    const guest = ACTIVE_ROSTER_IDS.filter((characterId) => getCharacterAvailability({
        policies: INITIAL_POLICIES, user: null, profile: null,
        characterId, lockedCharacterIds,
    }).unlocked);
    assert.deepEqual(guest, member);
    for (const role of ['moderator', 'global_moderator', 'admin']) {
        const accessible = ACTIVE_ROSTER_IDS.filter((characterId) => getCharacterAvailability({
            policies: INITIAL_POLICIES, user: { role }, profile,
            characterId, lockedCharacterIds,
        }).unlocked);
        assert.deepEqual(accessible, ACTIVE_ROSTER_IDS);
    }
    profile.missions.unlockedCharacterIds.push('yamanaka-ino', 'ebisu');
    assert.equal(getCharacterAvailability({ policies: INITIAL_POLICIES,
        user: { role: 'player' }, profile, characterId: 'yamanaka-ino',
        lockedCharacterIds }).hidden, true);
    assert.equal(getCharacterAvailability({ policies: INITIAL_POLICIES,
        user: { role: 'player' }, profile, characterId: 'ebisu',
        lockedCharacterIds }).unlocked, true);
    profile.missions.progressByMissionId['the-god-of-the-shinobi'] = {
        completedAt: '2026-10-25T00:00:00.000Z',
    };
    assert.equal(getCharacterAvailability({ policies: INITIAL_POLICIES,
        user: { role: 'player' }, profile, characterId: 'sarutobi-hiruzen',
        lockedCharacterIds }).unlocked, true);
});

test('launch migration replaces the old mission catalog once and preserves later ACP edits', () => {
    const old = resolveMissionCatalogState({ missions: [
        { missionId: 'old-mission', title: 'Old Mission', reward_character: 'rock-lee' },
    ] });
    assert.equal(old.migrate, true);
    assert.equal(old.missions.length, 21);
    const edited = resolveMissionCatalogState({ catalogVersion: 2, missions: [
        { missionId: 'edited', title: 'Edited', reward_character: 'ebisu',
            goals: [{ type: 'win_matches', character_id: 'uzumaki-naruto', wins: 2 }] },
    ] });
    assert.equal(edited.migrate, true);
    assert.equal(edited.missions[0].missionId, 'edited');
    const latest = resolveMissionCatalogState({ catalogVersion: 5, missions: edited.missions });
    assert.equal(latest.migrate, false);
    assert.equal(edited.missions.length, 11, 'version 2 adds only the ten new missions');

    // Version 5 adds The Yellow Flash alone; missions an admin removed are not brought back.
    const withoutDoubleLucky = getDefaultMissionCatalog()
        .filter((mission) => !['double-lucky', 'the-yellow-flash'].includes(mission.missionId));
    const v5 = resolveMissionCatalogState({ catalogVersion: 4, missions: withoutDoubleLucky });
    assert.equal(v5.migrate, true);
    assert.ok(v5.missions.some((mission) => mission.missionId === 'the-yellow-flash'));
    assert.equal(v5.missions.some((mission) => mission.missionId === 'double-lucky'), false);

    const previous = getDefaultMissionCatalog();
    const customized = previous.map((mission) => ({ ...mission }));
    customized[0].title = 'Custom Generation Title';
    customized[1].goals = [{ type: 'win_matches', character_id: 'uzumaki-naruto', wins: 1 }];
    const migrated = resolveMissionCatalogState({ catalogVersion: 2, missions: customized });
    assert.equal(migrated.missions[0].title, 'Custom Generation Title');
    assert.deepEqual(migrated.missions[1].goals.map((goal) => goal.wins), [5, 3]);
    assert.equal(migrated.missions[1].revision, 3);
});

test('revised launch missions keep their requested ranks and goal counts', () => {
    const missions = new Map(getDefaultMissionCatalog().map((mission) => [mission.missionId, mission]));
    assert.deepEqual(missions.get('duty-of-a-sensei').goals.map((goal) => goal.wins), [5, 3]);
    assert.equal(missions.get('a-dishonored-shinobi').goals[0].type, 'win_matches_against_tag');
    assert.deepEqual(missions.get('hidden-hunter').goals.map((goal) => goal.wins), [4, 4]);
    assert.equal(missions.get('devotion').mission_rank, 'b');
    assert.equal(missions.get('the-shipping-magnate').goals[0].wins, 4);
    assert.equal(missions.get('team-7-fights-as-a-team').mission_rank, 'a');
    assert.equal(missions.get('team-7-fights-as-a-team').goals[0].type, 'win_matches_all_team_tag');
    assert.equal(missions.get('the-god-of-the-shinobi').mission_rank, 'b');
    assert.equal(missions.get('the-god-of-the-shinobi').goals[0].wins, 30);
});

test('new missions preserve all rewards, ranks, and full team requirements', () => {
    const missions = new Map(getDefaultMissionCatalog().map((mission) => [mission.missionId, mission]));
    const forest = missions.get('chuunin-exam-the-forest-of-death');
    assert.deepEqual(forest.reward_characters, ['dosu-kinuta', 'zaku-abumi', 'tsuchi-kin']);
    assert.deepEqual(forest.goals.map((goal) => [goal.type, goal.wins, goal.character_tag]), [
        ['win_matches_all_team_tag', 3, 'exam-team-7'],
        ['win_matches_all_team_tag', 3, 'exam-team-8'],
        ['win_matches_all_team_tag', 3, 'exam-team-9'],
        ['win_matches_all_team_tag', 3, 'exam-team-10'],
    ]);
    assert.equal(forest.mission_rank, 'dc');
    assert.equal(forest.level_requirement, 11);
    assert.deepEqual(missions.get('double-lucky').goals.map((goal) => goal.type),
        ['win_streak', 'win_streak', 'win_streak']);
    assert.equal(missions.get('hostile-takeover').level_requirement, 16);
    assert.equal(missions.get('hostile-takeover').mission_rank, 'b');
    for (const id of ['double-lucky', 'a-rare-opportunity', 'the-sounds-amongst-the-leaves',
        'twisting-sound', 'sand-siblings-at-war', 'the-moonlight-of-the-leaf',
        'the-survivor-of-the-seal', 'hostile-takeover']) {
        assert.equal(missions.get(id).image, '', `${id}: image left for editor`);
    }
    const profile = { ryo: 0 };
    const unlocked = new Set();
    forest.reward_characters.forEach((id, index) =>
        awardMissionCompletion(profile, id, unlocked, index > 0));
    assert.deepEqual([...unlocked], forest.reward_characters);
    assert.equal(profile.ryo, 250, 'the shared mission gives its Ryo bonus once');
});

test('tag goals count opponent genin, full Team 7 teams, and each Konoha teammate', () => {
    assert.equal(getMissionCharacterTags(characters.find((character) =>
        character.characterId === 'kyuubi-naruto')).has('team-7'), true);
    const roster = new Map(ACTIVE_ROSTER_IDS.map((id, index) => [id, index]));
    const team = (...ids) => ids.map((id) => roster.get(id));
    const match = { players: [
        { username: 'winner', team: team('uzumaki-naruto', 'uchiha-sasuke', 'haruno-sakura') },
        { username: 'loser', team: team('gaara-of-the-desert', 'kankuro', 'temari') },
    ] };
    const against = { type: 'win_matches_against_tag', character_tag: 'konoha-genin' };
    const allTeam = { type: 'win_matches_all_team_tag', character_tag: 'team-7' };
    const members = { type: 'win_matches_tag_members', character_tag: 'konoha-ninja' };
    assert.equal(getMissionTagGoalIncrement(match, 'winner', against), 0);
    assert.equal(getMissionTagGoalIncrement(match, 'loser', against), 1);
    assert.equal(getMissionTagGoalIncrement(match, 'winner', allTeam), 1);
    assert.equal(getMissionTagGoalIncrement(match, 'loser', allTeam), 0);
    assert.equal(getMissionTagGoalIncrement(match, 'winner', members), 3);
    match.players[0].team = team('uzumaki-naruto', 'uchiha-sasuke', 'kankuro');
    assert.equal(getMissionTagGoalIncrement(match, 'winner', allTeam), 0);
    assert.equal(getMissionTagGoalIncrement(match, 'winner', members), 2);
    match.players[0].team = team('umino-iruka', 'uzumaki-naruto', 'kankuro');
    assert.equal(getMissionTagGoalIncrement(match, 'winner', members), 2);
    match.players[0].team = team('inuzuka-kiba', 'aburame-shino', 'hyuuga-hinata');
    assert.equal(getMissionTagGoalIncrement(match, 'winner', {
        type: 'win_matches_all_team_tag', character_tag: 'exam-team-8',
    }), 1);
    match.players[1].team = team('gaara-of-the-desert', 'kankuro', 'temari');
    assert.equal(getMissionTagGoalIncrement(match, 'winner', {
        type: 'win_matches_against_tag', character_tag: 'sound-or-sand-ninja',
    }), 1);
});

test('redesigned objectives reset partial progress but keep completed mission unlocks', () => {
    const mission = getDefaultMissionCatalog()[0];
    const partial = getProgressForMissionRevision({
        goalProgressByIndex: { 0: { count: 2 } },
    }, mission);
    assert.equal(partial.goalProgressByIndex[0], undefined);
    const completed = getProgressForMissionRevision({
        completedAt: '2026-10-25T00:00:00.000Z',
        goalProgressByIndex: { 0: { count: 3 } },
    }, mission);
    assert.equal(completed.completedAt, '2026-10-25T00:00:00.000Z');
    assert.equal(completed.goalProgressByIndex[0].count, 3);
});

test('stored legacy Survival and Theft Plan goals are repaired without changing progress IDs', () => {
    const missions = normalizeMissionCatalog([
        {
            missionId: 'survival', title: 'Survival', reward_character: 'yakushi-kabuto',
            goals: [{ type: 'win_streak', character_id: 'yakushi-kabuto', wins: 4 }],
        },
        {
            missionId: 'the-theft-plan', title: 'The Theft Plan', reward_character: 'rokushou-aoi',
            goals: [{ type: 'win_matches_any', character_ids: ['rokushou-aoi'], wins: 25 }],
        },
        {
            missionId: 'the-theft-plan', title: 'The Theft Plan', reward_character: 'rokushou-aoi',
            goals: [],
        },
        null,
    ]);
    assert.deepEqual(missions.slice(0, 2).map((mission) => mission.missionId), ['survival', 'the-theft-plan']);
    assert.deepEqual(missions[0].goals[0].character_ids, ['uzumaki-naruto', 'haruno-sakura', 'uchiha-sasuke']);
    assert.deepEqual(missions[1].goals[0].character_ids, ['oboro', 'shigure']);
    assert.deepEqual(missions[2].goals[0].character_ids, ['oboro', 'shigure']);
});

test('mission completion grants its character and 250 Ryo only once', () => {
    const profile = { ryo: 100 };
    const unlocked = new Set();
    assert.equal(awardMissionCompletion(profile, 'yakushi-kabuto', unlocked, false), 'yakushi-kabuto');
    assert.deepEqual(profile, { ryo: 350 });
    assert.deepEqual([...unlocked], ['yakushi-kabuto']);

    assert.equal(awardMissionCompletion(profile, 'yakushi-kabuto', unlocked, true), '');
    assert.deepEqual(profile, { ryo: 350 });
    assert.deepEqual([...unlocked], ['yakushi-kabuto']);
});
