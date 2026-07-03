const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const characters = require('../characters.js');
const narutoStarterCharacter = require('../narutoStarterCharacter.js');
const sakuraStarterCharacter = require('../sakuraStarterCharacter.js');
const sasukeStarterCharacter = require('../sasukeStarterCharacter.js');
const starterCharacterPresets = require('../starterCharacterPresets.js');
const starterCharacterPresetsBatch2 = require('../starterCharacterPresetsBatch2.js');
const {
    buildInitialBoard,
    resolvePendingTurnSkills,
    resolveEffectiveSkill,
    tickStatusesForTurnEnd,
    isSkillIndexBlockedForActor,
} = require('../battleLogic.js');

const emptyPool = () => ({
    taijutsu: 0,
    ninjutsu: 0,
    bloodline: 0,
    genjutsu: 0,
});

const makeMatch = (team1 = [0], team2 = [1]) => {
    const players = [
        { username: 'p1', team: team1 },
        { username: 'p2', team: team2 },
    ];
    const match = {
        players,
        board: buildInitialBoard(players, characters),
        chakraPools: {
            p1: emptyPool(),
            p2: emptyPool(),
        },
        economy: {
            turnCounts: {
                p1: 0,
                p2: 0,
            },
        },
        pendingTurns: {},
    };
    Object.entries(match.board).forEach(([username, units]) => {
        units.forEach((unit) => {
            unit.username = username;
        });
    });
    return match;
};

const queueSkill = (match, username, skillIndex, targetSelection = []) => {
    match.pendingTurns[username] = {
        queueOrder: [0],
        queuedByActorSlot: {
            0: {
                skillIndex,
                targetSelection,
            },
        },
    };
};

const getNaruto = () => characters.find((character) => character?.characterId === 'uzumaki-naruto');
const getSakura = () => characters.find((character) => character?.characterId === 'haruno-sakura');
const getSasuke = () => characters.find((character) => character?.characterId === 'uchiha-sasuke');
const getCharacter = (characterId) => characters.find((character) => character?.characterId === characterId);

test('character editor presets match starter kits in characters.js', () => {
    assert.deepEqual(getNaruto(), narutoStarterCharacter);
    assert.deepEqual(getSakura(), sakuraStarterCharacter);
    assert.deepEqual(getSasuke(), sasukeStarterCharacter);
    Object.entries(starterCharacterPresets).forEach(([characterId, preset]) => {
        assert.deepEqual(getCharacter(characterId), preset);
    });
    Object.entries(starterCharacterPresetsBatch2).forEach(([characterId, preset]) => {
        assert.deepEqual(getCharacter(characterId), preset);
    });

    const html = fs.readFileSync(path.join(__dirname, '..', 'charactereditor.html'), 'utf8');
    const presetIndex = html.indexOf('./narutoStarterCharacter.js');
    const sakuraPresetIndex = html.indexOf('./sakuraStarterCharacter.js');
    const sasukePresetIndex = html.indexOf('./sasukeStarterCharacter.js');
    const sharedPresetIndex = html.indexOf('./starterCharacterPresets.js');
    const batch2PresetIndex = html.indexOf('./starterCharacterPresetsBatch2.js');
    const appIndex = html.indexOf('./index.js');
    assert.ok(presetIndex >= 0, 'character editor must load Naruto starter preset');
    assert.ok(sakuraPresetIndex >= 0, 'character editor must load Sakura starter preset');
    assert.ok(sasukePresetIndex >= 0, 'character editor must load Sasuke starter preset');
    assert.ok(sharedPresetIndex >= 0, 'character editor must load shared starter presets');
    assert.ok(batch2PresetIndex >= 0, 'character editor must load second shared starter presets');
    assert.ok(appIndex >= 0, 'character editor must load index.js');
    assert.ok(presetIndex < appIndex, 'Naruto starter preset must load before index.js');
    assert.ok(sakuraPresetIndex < appIndex, 'Sakura starter preset must load before index.js');
    assert.ok(sasukePresetIndex < appIndex, 'Sasuke starter preset must load before index.js');
    assert.ok(sharedPresetIndex < appIndex, 'shared starter presets must load before index.js');
    assert.ok(batch2PresetIndex < appIndex, 'second shared starter presets must load before index.js');
});

test('Naruto skill IDs and replacements are internally consistent', () => {
    const naruto = getNaruto();
    const skillIds = new Set(naruto.skills.map((skill) => skill.id));
    assert.deepEqual(
        naruto.skills.map((skill) => skill.id),
        [
            'uzumaki-naruto-combo',
            'uzumaki-naruto-overwhelming-chakra-wave',
            'uzumaki-naruto-shadow-clones',
            'uzumaki-naruto-sexy-technique',
            'uzumaki-naruto-rasengan',
        ]
    );

    naruto.skills.forEach((skill) => {
        (Array.isArray(skill.effects) ? skill.effects : []).forEach((effect) => {
            const replacements = effect?.metadata?.skillReplacements || {};
            Object.entries(replacements).forEach(([fromSkillId, toSkillId]) => {
                assert.ok(skillIds.has(fromSkillId), `replacement source ${fromSkillId} must exist`);
                assert.ok(skillIds.has(toSkillId), `replacement target ${toSkillId} must exist`);
            });
        });
    });
});

test('battleLogic resolves Naruto starter kit behavior used by the editor data', () => {
    let match = makeMatch();

    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    const narutoState = match.board.p1[0].state;
    assert.equal(
        narutoState.statuses.some(
            (status) => status.id === 'uzumaki_naruto_shadow_clones_defense' && status.remainingTurns === 4
        ),
        true
    );
    assert.equal(
        narutoState.statuses.some(
            (status) => status.id === 'uzumaki_naruto_shadow_clones_active' && status.remainingTurns === 3
        ),
        true
    );
    assert.equal(
        resolveEffectiveSkill({
            characters,
            rosterIndex: 0,
            skillIndex: 2,
            actorState: narutoState,
        }).id,
        'uzumaki-naruto-rasengan'
    );

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 70, 'Combo should deal 30 during Shadow Clones');

    queueSkill(match, 'p1', 2, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 25, 'Rasengan replacement should deal 45');
    assert.equal(
        match.board.p2[0].state.statuses.some((status) => status.id === 'stunned' && status.metadata.cannotUseSkills),
        true
    );

    match = makeMatch();
    queueSkill(match, 'p1', 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    const stateAfterWave = match.board.p1[0].state;
    assert.equal(isSkillIndexBlockedForActor(stateAfterWave, 0), true);
    assert.equal(isSkillIndexBlockedForActor(stateAfterWave, 2), true);
    assert.equal(Object.values(match.chakraPools.p1).reduce((sum, amount) => sum + amount, 0), 0);

    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(Object.values(match.chakraPools.p1).reduce((sum, amount) => sum + amount, 0), 0);

    tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.equal(Object.values(match.chakraPools.p1).reduce((sum, amount) => sum + amount, 0), 1);
});

test('battleLogic resolves Sakura starter kit behavior used by the editor data', () => {
    const match = makeMatch([1], [2]);

    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    const sakuraState = match.board.p1[0].state;
    assert.equal(
        sakuraState.statuses.some(
            (status) =>
                status.id === 'haruno_sakura_inner_sakura_active' &&
                status.remainingTurns === 4 &&
                status.metadata.damageReductionFlat === 10 &&
                status.metadata.cannotBeStunned === true &&
                status.metadata.skillDamageBonuses?.['haruno-sakura-ko-punch'] === 10
        ),
        true
    );

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 70, 'KO Punch should deal 30 during Inner Sakura');
    assert.equal(
        match.board.p2[0].state.statuses.some(
            (status) =>
                status.id === 'haruno_sakura_ko_punch_stun' &&
                status.metadata.cannotUseSkillClasses.includes('physical') &&
                status.metadata.cannotUseSkillClasses.includes('strategic')
        ),
        true
    );

    match.board.p1[0].hp = 50;
    queueSkill(match, 'p1', 1, [{ username: 'p1', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p1[0].hp, 75, 'Cure should heal Sakura or an ally for 25');

    queueSkill(match, 'p1', 3);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(
        match.board.p1[0].state.statuses.some((status) => status.id === 'invulnerable' && status.metadata.invulnerable),
        true
    );
});

test('battleLogic resolves Sasuke starter kit behavior used by the editor data', () => {
    const match = makeMatch([2], [1]);

    queueSkill(match, 'p1', 2, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    const sasukeState = match.board.p1[0].state;
    const targetState = match.board.p2[0].state;
    assert.equal(
        sasukeState.statuses.some(
            (status) =>
                status.id === 'uchiha_sasuke_sharingan_focus' &&
                status.remainingTurns === 3 &&
                status.metadata.damageReductionFlat === 10
        ),
        true
    );
    assert.equal(
        targetState.statuses.some(
            (status) =>
                status.id === 'uchiha_sasuke_sharingan_target' &&
                status.remainingTurns === 3 &&
                status.metadata.cannotReduceDamage === true &&
                status.metadata.cannotBecomeInvulnerable === true
        ),
        true
    );

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 55, 'Lion Combo should deal 45 to a Sharingan target');

    queueSkill(match, 'p1', 1, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 0, 'Chidori should deal 60 piercing damage to a Sharingan target');

    queueSkill(match, 'p1', 3);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(
        match.board.p1[0].state.statuses.some((status) => status.id === 'invulnerable' && status.metadata.invulnerable),
        true
    );
});

test('battleLogic resolves Kiba starter kit behavior used by the editor data', () => {
    const match = makeMatch([3], [1]);

    queueSkill(match, 'p1', 1, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    const kibaState = match.board.p1[0].state;
    assert.equal(
        resolveEffectiveSkill({
            characters,
            rosterIndex: 3,
            skillIndex: 0,
            actorState: kibaState,
        }).id,
        'inuzuka-kiba-garouga-reduced'
    );
    assert.equal(
        kibaState.statuses.some(
            (status) =>
                status.id === 'inuzuka_kiba_double_headed_wolf_active' &&
                status.metadata.damageReductionFlat === 15
        ),
        true
    );
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(match.board.p2[0].hp, 85, 'Double Headed Wolf should deal 15 to all enemies');

    queueSkill(match, 'p1', 2, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(
        match.board.p2[0].state.statuses.some(
            (status) =>
                status.id === 'inuzuka_kiba_dynamic_marking' &&
                status.metadata.cannotReduceDamage &&
                status.metadata.cannotBecomeInvulnerable
        ),
        true
    );
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 50, 'Garouga should deal 35 to a Dynamic Marking target');
});

test('battleLogic resolves Shino starter kit behavior used by the editor data', () => {
    const match = makeMatch([4], [1]);
    match.chakraPools.p2.taijutsu = 1;

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 90, 'Chakra Leach should deal 10 affliction damage');
    assert.equal(match.chakraPools.p2.taijutsu, 0, 'Chakra Leach should steal a random chakra from the target');
    assert.equal(match.chakraPools.p1.taijutsu, 1, 'Chakra Leach should give the stolen chakra to Shino');

    match.board.p1[0].state.cooldowns = {};
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 75, 'Chakra Leach should gain 5 damage after each use');

    queueSkill(match, 'p1', 1, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(
        match.board.p2[0].state.statuses.some(
            (status) =>
                status.id === 'aburame_shino_female_bug' &&
                status.metadata.NonAfflictionDamageDebuff === 5
        ),
        true
    );

    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(
        match.board.p1[0].state.statuses.some(
            (status) =>
                status.id === 'aburame_shino_bug_wall' &&
                status.metadata.destructibleDefensePoints === 20
        ),
        true
    );
});

test('battleLogic resolves Hinata starter kit behavior used by the editor data', () => {
    const match = makeMatch([5], [1]);
    match.chakraPools.p2.taijutsu = 1;

    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    const hinataState = match.board.p1[0].state;
    assert.equal(
        resolveEffectiveSkill({
            characters,
            rosterIndex: 5,
            skillIndex: 0,
            actorState: hinataState,
        }).id,
        'hyuuga-hinata-hinata-gentle-fist'
    );

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(match.board.p2[0].hp, 85, 'Byakugan Gentle Fist should deal 15 on its first tick');
    assert.equal(match.chakraPools.p2.taijutsu, 0, 'Byakugan Gentle Fist should remove 1 random chakra');

    queueSkill(match, 'p1', 1, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 70, 'Byakugan Protective Palms should deal 15 piercing damage');
    assert.equal(
        match.board.p1[0].state.statuses.some(
            (status) => status.id === 'hyuuga_hinata_protective_palms_defense'
        ),
        true
    );
});

test('battleLogic resolves Shikamaru starter kit behavior used by the editor data', () => {
    const match = makeMatch([6], [1, 2]);

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    queueSkill(match, 'p1', 1, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    const meditatedTargetStatus = match.board.p2[0].state.statuses.find(
        (status) => status.id === 'nara_shikamaru_shadow_neck_bind'
    );
    const regularTargetStatus = match.board.p2[1].state.statuses.find(
        (status) => status.id === 'nara_shikamaru_shadow_neck_bind'
    );
    assert.equal(meditatedTargetStatus?.remainingTurns, 2);
    assert.equal(regularTargetStatus?.remainingTurns, 1);

    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(
        match.board.p2[0].state.statuses.find((status) => status.id === 'nara_shikamaru_shadow_imitation')
            ?.remainingTurns,
        2
    );
    assert.equal(
        match.board.p2[1].state.statuses.find((status) => status.id === 'nara_shikamaru_shadow_imitation')
            ?.remainingTurns,
        1
    );
});

test('battleLogic resolves Chouji starter kit behavior used by the editor data', () => {
    const match = makeMatch([7], [1]);

    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p1[0].hp, 80, 'Akimichi Pills should cost Chouji 20 health');

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 60, 'Partial Double Size should deal 40 after one pill');

    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p1[0].hp, 40, 'Akimichi Pills should be usable three times');
    assert.equal(
        match.board.p1[0].state.statuses.find((status) => status.id === 'akimichi_chouji_akimichi_pills')
            ?.metadata.skillDamageBonuses?.['akimichi-chouji-partial-double-size'],
        60
    );

    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p1[0].hp, 40, 'Akimichi Pills should stop after three uses');
});

test('battleLogic resolves Ino starter kit behavior used by the editor data', () => {
    let match = makeMatch([8], [2]);

    queueSkill(match, 'p1', 1, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(
        resolveEffectiveSkill({
            characters,
            rosterIndex: 8,
            skillIndex: 1,
            actorState: match.board.p1[0].state,
        }).id,
        'yamanaka-ino-art-of-the-valentine'
    );
    assert.equal(
        match.board.p2[0].state.statuses.some(
            (status) => status.id === 'yamanaka_ino_mind_body_switch_target' && status.metadata.cannotUseSkills
        ),
        true
    );

    match = makeMatch([8], [2]);
    queueSkill(match, 'p1', 2, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    queueSkill(match, 'p2', 1, [{ username: 'p1', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p2', characters });
    assert.equal(
        match.board.p2[0].state.cooldowns['uchiha-sasuke-chidori'],
        3,
        'Chakra Hair Strand Trap should increase the triggered harmful skill cooldown by 1'
    );

    match = makeMatch([8], [2]);
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 70, 'Mind Body Disturbance should deal 30 piercing damage');
    assert.equal(
        match.board.p2[0].state.statuses.some(
            (status) =>
                status.id === 'yamanaka_ino_mind_body_disturbance_control' &&
                status.metadata.cannotBecomeInvulnerable
        ),
        true
    );
});

test('battleLogic resolves Rock Lee starter kit behavior used by the editor data', () => {
    let match = makeMatch([9], [1]);

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p1[0].hp, 90, 'High Speed Taijutsu should cost Lee 10 health');
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(match.board.p2[0].hp, 90, 'High Speed Taijutsu should deal 10 on Lee turn end');

    queueSkill(match, 'p1', 1, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 50, 'Front Lotus should deal 40 to a High Speed Taijutsu target');

    match = makeMatch([9], [1]);
    match.board.p1[0].hp = 80;
    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p1[0].hp, 50, 'Fifth Gate Opening should cost Lee 30 health');
    assert.equal(
        resolveEffectiveSkill({
            characters,
            rosterIndex: 9,
            skillIndex: 2,
            actorState: match.board.p1[0].state,
        }).id,
        'rock-lee-final-lotus'
    );
});

test('battleLogic resolves Tenten starter kit behavior used by the editor data', () => {
    const match = makeMatch([11], [1, 2]);

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 80, 'Twin Rising Dragons should deal 20 to the primary target');
    assert.equal(match.board.p2[1].hp, 90, 'Twin Rising Dragons should deal 10 to other enemies');

    queueSkill(match, 'p1', 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 65, 'Twin Rising Dragons Trap should gain bonus damage on marked targets');
    assert.equal(match.board.p2[1].hp, 75, 'Twin Rising Dragons Trap should also hit other marked enemies');

    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(
        resolveEffectiveSkill({
            characters,
            rosterIndex: 11,
            skillIndex: 0,
            actorState: match.board.p1[0].state,
        }).id,
        'tenten-twin-rising-dragons'
    );
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(
        match.board.p2[0].state.statuses.some(
            (status) =>
                status.id === 'tenten_twin_rising_dragons_mark' &&
                status.metadata.bonusDamageFromSourceSkillsFlat === 20
        ),
        true,
        'Full Release should improve Twin Rising Dragons without replacing the skill id'
    );
    assert.equal(
        match.board.p1[0].state.statuses.some((status) => status.id === 'tenten_full_release_active'),
        false,
        'Full Release improvement should be consumed by the next harmful Tenten skill'
    );
});

test('battleLogic resolves Neji starter kit behavior used by the editor data', () => {
    const match = makeMatch([10], [1, 2]);
    match.chakraPools.p2.taijutsu = 1;

    queueSkill(match, 'p1', 2, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 60, 'Eight Trigrams Sixty-Four Palms should deal 40 damage');
    assert.equal(match.chakraPools.p2.taijutsu, 0, 'Eight Trigrams Sixty-Four Palms should remove random chakra');

    queueSkill(match, 'p1', 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 50, 'Revolving Heaven should damage all enemies');
    assert.equal(match.board.p2[1].hp, 90, 'Revolving Heaven should damage all enemies');
    assert.equal(
        match.board.p1[0].state.statuses.some((status) => status.id === 'invulnerable' && status.metadata.invulnerable),
        true
    );
});

test('battleLogic resolves Gaara starter kit behavior used by the editor data', () => {
    const match = makeMatch([12], [1]);

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(
        resolveEffectiveSkill({
            characters,
            rosterIndex: 12,
            skillIndex: 0,
            actorState: match.board.p1[0].state,
        }).id,
        'gaara-of-the-desert-sand-burial'
    );
    assert.equal(
        match.board.p2[0].state.statuses.some(
            (status) => status.id === 'gaara_sand_coffin_crush' && status.metadata.cannotBecomeInvulnerable
        ),
        true
    );

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].alive, false, 'Sand Burial should kill a Sand Coffin target');
});

test('battleLogic resolves Kankuro starter kit behavior used by the editor data', () => {
    const match = makeMatch([14], [1]);

    queueSkill(match, 'p1', 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 90, 'Poison Bomb should deal 10 affliction damage');

    match.board.p1[0].state.cooldowns = {};
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 55, 'Black Secret Machine One Shot should deal 35 to a Poison Bomb target');

    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(
        match.board.p1[0].state.statuses.some(
            (status) =>
                status.id === 'kankuro_puppet_preparation_defense' &&
                status.metadata.destructibleDefensePoints === 15
        ),
        true
    );
});

test('battleLogic resolves Temari starter kit behavior used by the editor data', () => {
    const match = makeMatch([13], [1, 2]);
    const temari = getCharacter('temari');
    temari.skills.forEach((skill) => {
        assert.equal(
            skill.classes.some((entry) => String(entry).toLowerCase() === 'ranged'),
            false,
            'Temari starter classes should ignore the unsupported ranged class'
        );
    });

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 80, 'Cutting Whirlwind should deal 20 piercing damage to target');
    assert.equal(match.board.p2[1].hp, 90, 'Cutting Whirlwind should deal 10 piercing damage to other enemies');
    assert.equal(
        resolveEffectiveSkill({
            characters,
            rosterIndex: 13,
            skillIndex: 1,
            actorState: match.board.p1[0].state,
        }).id,
        'temari-summoning-quick-beheading-dance-reduced'
    );
});
