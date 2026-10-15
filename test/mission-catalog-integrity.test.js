const assert = require('node:assert/strict');
const test = require('node:test');

const characters = require('../data/characters');
const { getDefaultMissionCatalog, normalizeMissionCatalog, awardMissionCompletion } = require('../server');

const characterIds = new Set(characters.map((character) => character.characterId));
const trackedTypes = new Set([
    'win_matches', 'win_streak', 'win_matches_any', 'win_streak_any',
    'win_matches_same_team', 'reach_rank', 'use_skill',
]);

function goalCanUseRoster(goal, available) {
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
    assert.equal(missions.length, 41);

    for (const mission of missions) {
        assert.ok(characterIds.has(mission.reward_character), `${mission.missionId}: unknown reward`);
        assert.ok(!rewardIds.has(mission.reward_character), `${mission.missionId}: duplicate reward`);
        rewardIds.add(mission.reward_character);
        assert.ok(mission.goals.length > 0, `${mission.missionId}: no goals`);
        assert.ok(mission.mode_restriction.allowed_modes.some((mode) => mode === 'quick' || mode === 'ladder'), `${mission.missionId}: no playable mode`);

        for (const goal of mission.goals) {
            assert.ok(trackedTypes.has(goal.type), `${mission.missionId}: untracked goal ${goal.type}`);
            assert.ok((goal.type === 'reach_rank' ? goal.rank : goal.wins) > 0, `${mission.missionId}: invalid target`);
            const references = [goal.character_id, ...(goal.character_ids || [])].filter(Boolean);
            for (const id of references) {
                assert.ok(characterIds.has(id), `${mission.missionId}: unknown goal character ${id}`);
                assert.notEqual(id, mission.reward_character, `${mission.missionId}: requires its own reward`);
            }
            if (goal.type.endsWith('_any') || goal.type === 'win_matches_same_team') {
                assert.ok(goal.character_ids.length >= 2, `${mission.missionId}: group goal needs two characters`);
            }
        }
    }
});

test('all default mission rewards are reachable through earlier playable characters', () => {
    const missions = getDefaultMissionCatalog();
    const rewardIds = new Set(missions.map((mission) => mission.reward_character));
    const available = new Set(characters.map((character) => character.characterId).filter((id) => !rewardIds.has(id)));
    const remaining = new Map(missions.map((mission) => [mission.missionId, mission]));

    let changed;
    do {
        changed = false;
        for (const [id, mission] of remaining) {
            if (mission.goals.every((goal) => goalCanUseRoster(goal, available))) {
                available.add(mission.reward_character);
                remaining.delete(id);
                changed = true;
            }
        }
    } while (changed);

    assert.deepEqual([...remaining.keys()], [], 'mission rewards must not have circular unlock dependencies');
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

test('mission completion grants its character, two scrolls, and 250 Ryo only once', () => {
    const profile = { summonScrolls: 5, ryo: 100 };
    const unlocked = new Set();
    assert.equal(awardMissionCompletion(profile, 'yakushi-kabuto', unlocked, false), 'yakushi-kabuto');
    assert.deepEqual(profile, { summonScrolls: 7, ryo: 350 });
    assert.deepEqual([...unlocked], ['yakushi-kabuto']);

    assert.equal(awardMissionCompletion(profile, 'yakushi-kabuto', unlocked, true), '');
    assert.deepEqual(profile, { summonScrolls: 7, ryo: 350 });
    assert.deepEqual([...unlocked], ['yakushi-kabuto']);
});
