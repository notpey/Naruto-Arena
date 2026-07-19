const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const characters = require("../data/characters/index.js");
const narutoStarterCharacter = require('../narutoStarterCharacter.js');
const sakuraStarterCharacter = require('../sakuraStarterCharacter.js');
const sasukeStarterCharacter = require('../sasukeStarterCharacter.js');
const starterCharacterPresets = require('../starterCharacterPresets.js');
const starterCharacterPresetsBatch2 = require('../starterCharacterPresetsBatch2.js');
const {
    buildInitialBoard,
    resolvePendingTurnSkills,
    resolveEffectiveSkill,
    computeEffectiveEnergyCost,
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

const chakraTotal = (pool) =>
    Object.values(pool || {}).reduce((sum, amount) => sum + Math.max(0, Number(amount) || 0), 0);

const getNaruto = () => characters.find((character) => character?.characterId === 'uzumaki-naruto');
const getSakura = () => characters.find((character) => character?.characterId === 'haruno-sakura');
const getSasuke = () => characters.find((character) => character?.characterId === 'uchiha-sasuke');
const getCharacter = (characterId) => characters.find((character) => character?.characterId === characterId);

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const collectCharacterMetadataKeys = () => {
    const metadataKeys = new Set();
    const metadataAnyKeys = new Set();
    const walk = (value) => {
        if (Array.isArray(value)) {
            value.forEach(walk);
            return;
        }
        if (!value || typeof value !== 'object') return;

        if (Array.isArray(value.metadataAny)) {
            value.metadataAny.forEach((entry) => {
                if (typeof entry === 'string' && entry.trim()) metadataAnyKeys.add(entry.trim());
            });
        }

        Object.entries(value).forEach(([key, entry]) => {
            if (key === 'metadata' && entry && typeof entry === 'object' && !Array.isArray(entry)) {
                Object.keys(entry).forEach((metadataKey) => metadataKeys.add(metadataKey));
            }
            walk(entry);
        });
    };

    walk(characters);
    return { metadataKeys, metadataAnyKeys };
};

const collectCharacterEffectTypes = () => {
    const effectTypes = new Set();
    const walk = (value) => {
        if (Array.isArray(value)) {
            value.forEach(walk);
            return;
        }
        if (!value || typeof value !== 'object') return;
        if (typeof value.type === 'string' && value.type.trim()) {
            effectTypes.add(value.type.trim());
        }
        Object.values(value).forEach(walk);
    };

    walk(characters);
    return effectTypes;
};

const collectCharacterStatusReferences = () => {
    const producedStatusIds = new Set(['invulnerable', 'stunned']);
    const referencedStatusIds = [];
    const isStatusProducerPath = (pathParts) =>
        /applystatus|onexpireeffects|onowneruseskilleffects|counterapplystatus/i.test(pathParts.join('.'));
    const addReference = (statusId) => {
        if (typeof statusId === 'string' && statusId.trim()) {
            referencedStatusIds.push(statusId.trim());
        }
    };
    const walk = (value, pathParts = []) => {
        if (Array.isArray(value)) {
            value.forEach((entry, index) => walk(entry, pathParts.concat(index)));
            return;
        }
        if (!value || typeof value !== 'object') return;

        if (typeof value.statusId === 'string' && value.statusId.trim()) {
            if (value.type === 'apply_status' || isStatusProducerPath(pathParts)) {
                producedStatusIds.add(value.statusId.trim());
            }
            addReference(value.statusId);
        }

        Object.entries(value).forEach(([key, entry]) => {
            if (['missingStatusId', 'trackerStatusId'].includes(key)) {
                addReference(entry);
            }
            if (
                ['statusIdsAny', 'statusIdsAll', 'statusIdsMissing', 'statusIdsToConsume', 'statusIds'].includes(key) &&
                Array.isArray(entry)
            ) {
                entry.forEach(addReference);
            }
            walk(entry, pathParts.concat(key));
        });
    };

    walk(characters);
    return { producedStatusIds, referencedStatusIds };
};

const collectCharacterSkillReferences = () => {
    const skillIds = new Set();
    characters.forEach((character) => {
        (Array.isArray(character?.skills) ? character.skills : []).forEach((skill) => {
            if (typeof skill?.id === 'string' && skill.id.trim()) skillIds.add(skill.id.trim());
        });
    });

    const referencedSkillIds = [];
    const referencesSkillId = (key) =>
        /skillid|skillids|skillreplacements|bonusesbyskillid|skilldamagebonuses|skillcostoverridesbyskillid|skillcooldownincreasebyskillid|skilldurationbonuses|skilldamagecapbyskillid/i.test(
            key
        );
    const addReference = (skillId) => {
        if (typeof skillId === 'string' && skillId.trim()) referencedSkillIds.push(skillId.trim());
    };
    const walk = (value, parentKey = '') => {
        if (Array.isArray(value)) {
            if (referencesSkillId(parentKey)) value.forEach(addReference);
            value.forEach((entry) => walk(entry, parentKey));
            return;
        }
        if (!value || typeof value !== 'object') return;
        Object.entries(value).forEach(([key, entry]) => {
            if (referencesSkillId(key)) {
                if (typeof entry === 'string') {
                    addReference(entry);
                } else if (Array.isArray(entry)) {
                    entry.forEach(addReference);
                } else if (entry && typeof entry === 'object') {
                    Object.keys(entry).forEach(addReference);
                }
            }
            walk(entry, key);
        });
    };

    walk(characters);
    return { skillIds, referencedSkillIds };
};

const collectTooltipNumericOmissions = () => {
    const omissions = [];
    const walk = (value, onTooltipEffect, path = '') => {
        if (Array.isArray(value)) {
            value.forEach((entry, index) => walk(entry, onTooltipEffect, `${path}.${index}`));
            return;
        }
        if (!value || typeof value !== 'object') return;
        if (value.metadata && typeof value.metadata.tooltipText === 'string') {
            onTooltipEffect(value);
        }
        Object.entries(value).forEach(([key, entry]) => walk(entry, onTooltipEffect, path ? `${path}.${key}` : key));
    };
    const collectPositiveNumericValues = (value) => {
        const values = [];
        const visit = (entry, path = '') => {
            if (Array.isArray(entry)) {
                entry.forEach((item, index) => visit(item, `${path}.${index}`));
                return;
            }
            if (!entry || typeof entry !== 'object') return;
            Object.entries(entry).forEach(([key, child]) => {
                const childPath = path ? `${path}.${key}` : key;
                if (
                    typeof child === 'number' &&
                    Number.isFinite(child) &&
                    child > 0 &&
                    !/duration|cooldown|remaining|maxuses|minimumhp|threshold|atleast/i.test(childPath)
                ) {
                    values.push(child);
                } else {
                    visit(child, childPath);
                }
            });
        };
        visit(value);
        return values;
    };

    characters.forEach((character) => {
        (Array.isArray(character?.skills) ? character.skills : []).forEach((skill) => {
            walk(skill.effects || [], (effect) => {
                const tooltipText = effect.metadata.tooltipText;
                const displayedNumbers = new Set([...tooltipText.matchAll(/\b\d+\b/g)].map((match) => Number(match[0])));
                const missingNumbers = collectPositiveNumericValues(effect).filter(
                    (value) => !displayedNumbers.has(value)
                );
                if (missingNumbers.length > 0) {
                    omissions.push(`${character.characterId || character.name}:${skill.id}:${effect.statusId || effect.type}`);
                }
            });
        });
    });
    return omissions;
};

test('character metadata keys are consumed by runtime code', () => {
    const runtimeSource = ['battleLogic.js', 'script.js', 'server.js']
        .map((fileName) => fs.readFileSync(path.join(__dirname, '..', fileName), 'utf8'))
        .join('\n');
    const { metadataKeys, metadataAnyKeys } = collectCharacterMetadataKeys();
    const unreferencedKeys = [...metadataKeys]
        .filter((metadataKey) => !metadataAnyKeys.has(metadataKey))
        .filter((metadataKey) => !new RegExp(`\\b${escapeRegExp(metadataKey)}\\b`).test(runtimeSource))
        .sort();

    assert.deepEqual(unreferencedKeys, [], 'character metadata keys should be read by battle or tooltip runtime code');
});

test('character effect types are handled by battle runtime code', () => {
    const runtimeSource = fs.readFileSync(path.join(__dirname, '..', 'battleLogic.js'), 'utf8');
    const unhandledEffectTypes = [...collectCharacterEffectTypes()]
        .filter((effectType) => {
            const escapedEffectType = escapeRegExp(effectType);
            return !new RegExp(
                `effectType === ['"]${escapedEffectType}['"]|effect\\.type === ['"]${escapedEffectType}['"]|case ['"]${escapedEffectType}['"]`
            ).test(runtimeSource);
        })
        .sort();

    assert.deepEqual(unhandledEffectTypes, [], 'character effect types should be handled by battle runtime code');
});

test('character status references point to produced statuses', () => {
    const { producedStatusIds, referencedStatusIds } = collectCharacterStatusReferences();
    const danglingStatusIds = [...new Set(referencedStatusIds)]
        .filter((statusId) => !producedStatusIds.has(statusId))
        .sort();

    assert.deepEqual(danglingStatusIds, [], 'status references should point to statuses produced by character data');
});

test('character skill references point to defined skills', () => {
    const { skillIds, referencedSkillIds } = collectCharacterSkillReferences();
    const danglingSkillIds = [...new Set(referencedSkillIds)].filter((skillId) => !skillIds.has(skillId)).sort();

    assert.deepEqual(danglingSkillIds, [], 'skill references should point to defined character skills');
});

test('status tooltips display their positive numeric metadata values', () => {
    assert.deepEqual(
        collectTooltipNumericOmissions(),
        [],
        'tooltip text should display positive numeric values carried by its effect metadata'
    );
});

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

    queueSkill(match, 'p1', 2, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    const narutoState = match.board.p1[0].state;
    assert.equal(
        narutoState.statuses.some(
            (status) =>
                status.id === 'uzumaki_naruto_shadow_clones_active' &&
                status.remainingTurns === 99 &&
                status.metadata.damageReductionFlat === 10
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
    assert.equal(match.board.p2[0].hp, 75, 'Combo should deal 25 during Shadow Clones');

    queueSkill(match, 'p1', 2, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 40, 'Rasengan replacement should deal 35');
    assert.equal(
        match.board.p2[0].state.statuses.some(
            (status) =>
                status.id === 'uzumaki_naruto_rasengan_stun' &&
                status.metadata.cannotUseSkillClasses.includes('physical') &&
                !status.metadata.cannotUseSkillClasses.includes('strategic')
        ),
        true
    );

    match = makeMatch();
    queueSkill(match, 'p1', 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    const stateAfterWave = match.board.p1[0].state;
    assert.equal(isSkillIndexBlockedForActor(stateAfterWave, 0), false);
    assert.equal(isSkillIndexBlockedForActor(stateAfterWave, 4), false);
    assert.equal(
        stateAfterWave.statuses.some(
            (status) =>
                status.id === 'uzumaki_naruto_overwhelming_chakra_wave_focus' &&
                status.metadata.skillDamageBonuses?.['uzumaki-naruto-combo'] === 5 &&
                status.metadata.skillDamageBonuses?.['uzumaki-naruto-rasengan'] === 5
        ),
        true
    );
    assert.equal(Object.values(match.chakraPools.p1).reduce((sum, amount) => sum + amount, 0), 0);

    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(Object.values(match.chakraPools.p1).reduce((sum, amount) => sum + amount, 0), 0);

    tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.equal(Object.values(match.chakraPools.p1).reduce((sum, amount) => sum + amount, 0), 1);
});

test('battleLogic resolves Sakura starter kit behavior used by the editor data', () => {
    const match = makeMatch([1], [2]);

    queueSkill(match, 'p1', 2, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    const sakuraState = match.board.p1[0].state;
    assert.equal(
        sakuraState.statuses.some(
            (status) =>
                status.id === 'haruno_sakura_inner_sakura_active' &&
                status.remainingTurns === 99 &&
                status.metadata.damageReductionFlat === 5 &&
                status.metadata.skillReplacements?.['haruno-sakura-inner-sakura'] ===
                    'haruno-sakura-inner-sakura-strangle'
        ),
        true
    );
    assert.equal(
        resolveEffectiveSkill({
            characters,
            rosterIndex: 1,
            skillIndex: 2,
            actorState: sakuraState,
        }).id,
        'haruno-sakura-inner-sakura-strangle'
    );

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 80, 'KO Punch should deal 20 during Inner Sakura');
    assert.equal(
        match.board.p2[0].state.statuses.some(
            (status) =>
                status.id === 'haruno_sakura_ko_punch_stun' &&
                status.metadata.cannotUseSkillClasses.includes('physical') &&
                status.metadata.cannotUseSkillClasses.includes('strategic')
        ),
        true
    );

    queueSkill(match, 'p1', 2, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 60, 'Inner Sakura Strangle should deal 20 to an enemy');
    assert.equal(
        match.board.p2[0].state.statuses.some(
            (status) =>
                status.id === 'haruno_sakura_inner_sakura_strangle_enemy_weakness' &&
                status.metadata.damageDebuffFlat === 10
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
    assert.equal(
        sasukeState.statuses.some(
            (status) =>
                status.id === 'uchiha_sasuke_sharingan_focus' &&
                status.remainingTurns === 99 &&
                status.metadata.damageReductionFlat === 10 &&
                status.metadata.samePreviousTargetDamageBonusFlat === 5 &&
                status.metadata.samePreviousTargetMarkerStatusId ===
                    'uchiha_sasuke_sharingan_previous_target' &&
                status.metadata.skillReplacements?.['uchiha-sasuke-sharingan'] ===
                    'uchiha-sasuke-grand-fireball-technique'
        ),
        true
    );
    assert.equal(
        resolveEffectiveSkill({
            characters,
            rosterIndex: 2,
            skillIndex: 2,
            actorState: sasukeState,
        }).id,
        'uchiha-sasuke-grand-fireball-technique'
    );

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 70, 'Lion Combo should deal 30 to the previous Sharingan target');
    assert.equal(
        match.board.p2[0].state.statuses.some(
            (status) =>
                status.id === 'uchiha_sasuke_sharingan_previous_target' &&
                status.sourceUsername === 'p1' &&
                status.metadata.tooltipText.includes('5 additional damage')
        ),
        true,
        'Sasuke previous target marker should be visible on the target'
    );

    queueSkill(match, 'p1', 1, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 30, 'Chidori should deal 40 piercing damage to the previous target');
    assert.equal(
        match.board.p1[0].state.statuses.some(
            (status) =>
                status.id === 'uchiha_sasuke_chidori_cost_shift' &&
                status.metadata.skillCostOverridesBySkillId?.['uchiha-sasuke-lion-combo']
        ),
        true
    );

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
        'inuzuka-kiba-garouga'
    );
    assert.deepEqual(
        computeEffectiveEnergyCost({
            skill: characters[3].skills[0],
            actorState: kibaState,
        }),
        {
            reservedSpecific: {
                taijutsu: 1,
                ninjutsu: 0,
                bloodline: 0,
                genjutsu: 0,
            },
            requiredRandom: 1,
        }
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
    assert.equal(match.board.p2[0].hp, 90, 'Double Headed Wolf should deal 10 to all enemies');

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
    assert.equal(match.board.p2[0].hp, 55, 'Garouga should deal 35 during Double Headed Wolf to a Dynamic Marking target');
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
    assert.equal(match.board.p2[0].hp, 80, 'Byakugan Gentle Fist should deal 20 immediately');
    assert.equal(
        match.board.p2[0].state.statuses.some(
            (status) =>
                status.id === 'hyuuga_hinata_gentle_fist_cost' &&
                status.remainingTurns === 2 &&
                status.metadata.randomCostIncrease === 1
        ),
        true
    );

    queueSkill(match, 'p1', 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 80, 'Protective Palms should no longer deal damage');
    assert.equal(
        match.board.p1[0].state.statuses.some(
            (status) =>
                status.id === 'hyuuga_hinata_protective_palms_defense' &&
                status.remainingTurns === 2 &&
                status.metadata.turnEndApplyStatusToSelf?.statusId ===
                    'hyuuga_hinata_protective_palms_defense_refresh' &&
                status.metadata.onBreakApplyStatusToSource?.statusId ===
                    'hyuuga_hinata_protective_palms_cost'
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
    assert.equal(meditatedTargetStatus?.remainingTurns, 2);
    assert.equal(
        match.board.p2[1].state.statuses.some((status) => status.id === 'nara_shikamaru_shadow_neck_bind'),
        false
    );

    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(
        match.board.p2[0].state.statuses.find((status) => status.id === 'nara_shikamaru_shadow_imitation')
            ?.remainingTurns,
        2
    );
    assert.equal(
        match.board.p2[1].state.statuses.some((status) => status.id === 'nara_shikamaru_shadow_imitation'),
        false
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
            (status) =>
                status.id === 'yamanaka_ino_mind_body_switch_stage_1' &&
                status.metadata.cannotUseSkillClasses.includes('physical')
        ),
        true
    );

    match = makeMatch([8], [2]);
    queueSkill(match, 'p1', 2, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    queueSkill(match, 'p2', 1, [{ username: 'p1', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p2', characters });
    assert.equal(
        match.board.p2[0].hp,
        90,
        'Chakra Hair Strand Trap should damage the target when they use a skill'
    );
    assert.equal(
        match.board.p2[0].state.statuses.some(
            (status) =>
                status.id === 'yamanaka_ino_chakra_hair_strand_trap_strategic_stun' &&
                status.metadata.cannotUseSkillClasses.includes('strategic')
        ),
        true
    );

    match = makeMatch([8], [2]);
    queueSkill(match, 'p1', 0);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 75, 'Mind Body Disturbance should deal 25 piercing damage');
    assert.equal(
        match.board.p2[0].state.statuses.some(
            (status) =>
                status.id === 'yamanaka_ino_mind_body_disturbance_control' &&
                status.metadata.cannotUseSkillClasses.includes('energy')
        ),
        true
    );
});

test('battleLogic resolves Rock Lee starter kit behavior used by the editor data', () => {
    let match = makeMatch([9], [1]);

    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p1[0].hp, 95, 'High Speed Taijutsu should cost Lee 5 health');
    assert.equal(match.board.p2[0].hp, 75, 'High Speed Taijutsu should deal 25 piercing damage immediately');

    queueSkill(match, 'p1', 1, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 40, 'Front Lotus should deal 35 piercing damage');
    assert.equal(
        resolveEffectiveSkill({
            characters,
            rosterIndex: 9,
            skillIndex: 1,
            actorState: match.board.p1[0].state,
        }).id,
        'rock-lee-final-lotus'
    );

    match = makeMatch([9], [1]);
    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(
        resolveEffectiveSkill({
            characters,
            rosterIndex: 9,
            skillIndex: 2,
            actorState: match.board.p1[0].state,
        }).id,
        'rock-lee-fiery-spirit'
    );
});

test('battleLogic resolves Tenten starter kit behavior used by the editor data', () => {
    const match = makeMatch([11], [1, 2]);

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 85, 'Twin Rising Dragons should deal 15 to the primary target');
    assert.equal(match.board.p2[1].hp, 90, 'Twin Rising Dragons should deal 10 to other enemies');

    queueSkill(match, 'p1', 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 70, 'Twin Rising Dragons Trap should gain bonus damage on marked targets');
    assert.equal(match.board.p2[1].hp, 75, 'Twin Rising Dragons Trap should also hit other marked enemies');
    assert.equal(
        match.board.p2[0].state.statuses.some(
            (status) =>
                status.id === 'tenten_twin_rising_dragons_trap_skill_stun' &&
                status.metadata.cannotUseSkillClasses.includes('physical') &&
                status.metadata.cannotUseSkillClasses.includes('energy')
        ),
        true,
        'Twin Rising Dragons Trap should stun marked enemies physical and chakra skills'
    );

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
    match.chakraPools.p2.taijutsu = 2;

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(
        match.board.p2[0].state.statuses.some(
            (status) =>
                status.id === 'neji_hyuuga_neji_gentle_fist' &&
                status.metadata.NonAfflictionDamageDebuff === 10
        ),
        true,
        'Gentle Fist should apply its stronger damage debuff'
    );

    match.board.p1[0].state.cooldowns = {};
    queueSkill(match, 'p1', 2, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 65, 'Eight Trigrams Sixty-Four Palms should deal 35 damage');
    assert.equal(
        match.chakraPools.p2.taijutsu,
        0,
        'Eight Trigrams Sixty-Four Palms should remove extra chakra from a Gentle Fist target'
    );

    queueSkill(match, 'p1', 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 55, 'Revolving Heaven should damage all enemies');
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
    assert.equal(match.board.p2[0].alive, true, 'Sand Burial should no longer instantly kill a Sand Coffin target');
    assert.equal(match.board.p2[0].hp, 50, 'Sand Burial should deal 50 piercing damage');
});

test('battleLogic resolves Kankuro starter kit behavior used by the editor data', () => {
    const match = makeMatch([14], [1]);

    queueSkill(match, 'p1', 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 90, 'Poison Bomb should deal 10 affliction damage');
    assert.equal(
        match.board.p2[0].state.statuses.some(
            (status) =>
                status.id === 'kankuro_poison_bomb_mark' &&
                status.metadata.tooltipText ===
                    'This character takes 5 additional damage from Black Secret Machine One Shot.'
        ),
        true,
        'Poison Bomb mark tooltip should include the additional damage value'
    );

    match.board.p1[0].state.cooldowns = {};
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 55, 'Black Secret Machine One Shot should deal 35 to a Poison Bomb target');
    assert.equal(
        match.board.p2[0].state.statuses.some(
            (status) =>
                status.id === 'kankuro_black_secret_machine_one_shot_mark' &&
                status.metadata.tooltipText === 'This character takes 5 additional damage from Poison Bomb.'
        ),
        true,
        'Black Secret Machine One Shot mark tooltip should include the additional damage value'
    );

    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(
        match.board.p1[0].state.statuses.some(
            (status) =>
                status.id === 'kankuro_puppet_preparation_defense' &&
                status.metadata.destructibleDefensePoints === 10 &&
                status.metadata.tooltipText ===
                    'Kankuro has 10 points of permanent destructible defense from Puppet Preparation.'
        ),
        true
    );
});

test('Kankuro Poison Bomb resolves correctly after Puppet Preparation', () => {
    const match = makeMatch([14], [1, 2, 3]);

    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });

    assert.equal(
        match.board.p1[0].state.statuses.some(
            (status) =>
                status.id === 'kankuro_puppet_preparation_bonus' &&
                status.metadata.skillDamageBonuses?.['kankuro-poison-bomb'] === 10
        ),
        true,
        'Puppet Preparation should grant Poison Bomb its damage bonus'
    );

    queueSkill(match, 'p1', 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    assert.deepEqual(
        match.board.p2.map((unit) => unit.hp),
        [80, 80, 80],
        'Prepared Poison Bomb should damage all enemies for 20'
    );
    assert.equal(
        match.board.p2.every((unit) =>
            unit.state.statuses.some(
                (status) =>
                    status.id === 'kankuro_poison_bomb_mark' &&
                    status.remainingTurns === 2 &&
                    status.metadata.tooltipText ===
                        'This character takes 5 additional damage from Black Secret Machine One Shot.'
            )
        ),
        true,
        'Prepared Poison Bomb should apply its extended Black Secret Machine One Shot mark'
    );
});

test('Hayate Meld into Shadows lets Crescent Moon Slash hit invulnerable enemies', () => {
    const hayateIndex = characters.findIndex((character) => character?.characterId === 'gekko-hayate');
    assert.ok(hayateIndex >= 0, 'Gekko Hayate must exist in characters.js');
    const match = makeMatch([hayateIndex], [1]);
    const hayate = match.board.p1[0];
    const target = match.board.p2[0];

    hayate.state.statuses.push({
        id: 'gekko_hayate_meld_into_shadows',
        remainingTurns: 1,
        metadata: {
            skillDamageBonuses: {
                'gekko-hayate-crescent-moon-slash': 15,
            },
            ignoreInvulnerabilityForSkillIds: ['gekko-hayate-crescent-moon-slash'],
        },
    });
    target.state.statuses.push({
        id: 'test_invulnerable',
        remainingTurns: 1,
        metadata: {
            invulnerable: true,
        },
    });

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    assert.equal(target.hp, 65, 'Crescent Moon Slash should deal 20 plus 15 through invulnerability');
});

test('Akadou Yoroi Chakra Focus steals exactly one random chakra and is consumed', () => {
    const yoroiIndex = characters.findIndex((character) => character?.characterId === 'akadou-yoroi');
    assert.ok(yoroiIndex >= 0, 'Akadou Yoroi must exist in characters.js');
    const match = makeMatch([yoroiIndex], [1]);
    const yoroi = match.board.p1[0];
    yoroi.state.statuses.push({
        id: 'akadou_yoroi_chakra_focus',
        remainingTurns: 3,
        metadata: {
            helpful: true,
        },
    });
    match.chakraPools.p1 = emptyPool();
    match.chakraPools.p2 = {
        taijutsu: 1,
        ninjutsu: 0,
        bloodline: 0,
        genjutsu: 0,
    };

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    assert.equal(chakraTotal(match.chakraPools.p2), 0, 'target should lose exactly one chakra');
    assert.equal(chakraTotal(match.chakraPools.p1), 1, 'Yoroi should gain exactly one chakra');
    assert.equal(
        yoroi.state.statuses.some((status) => status.id === 'akadou_yoroi_chakra_focus' && status.remainingTurns > 0),
        false,
        'Chakra Focus should be consumed after the steal'
    );
});

test('Tayuya Summoning Doki description matches its damage reduction value', () => {
    const tayuya = getCharacter('tayuya');
    const doki = tayuya.skills.find((skill) => skill.id === 'tayuya-summoning-doki');
    const selfStatus = doki.effects.find((effect) => effect.statusId === 'tayuya_summoning_doki_self');

    assert.equal(selfStatus.metadata.damageReductionFlat, 15);
    assert.match(doki.skilldescription, /15 points of damage reduction/);
    assert.match(selfStatus.metadata.tooltipText, /15 damage reduction/);
});

test('Zabuza Hidden Mist description matches its damage reduction value', () => {
    const zabuza = getCharacter('momochi-zabuza');
    const hiddenMist = zabuza.skills.find((skill) => skill.id === 'momochi-zabuza-hidden-mist');
    const defenseStatus = hiddenMist.effects.find(
        (effect) => effect.statusId === 'momochi_zabuza_hidden_mist_defense'
    );

    assert.equal(defenseStatus.metadata.damageReductionFlat, 5);
    assert.match(hiddenMist.skilldescription, /5 points of damage reduction/);
    assert.match(defenseStatus.metadata.tooltipText, /5 damage reduction/);
});

test('Shiore Five Elements Seal steals chakra from Giant Snake Bind targets', () => {
    const shioreIndex = characters.findIndex((character) => character?.characterId === 'shiore-orochimaru');
    assert.ok(shioreIndex >= 0, 'Shiore Orochimaru must exist in characters.js');
    const match = makeMatch([shioreIndex], [1]);
    const target = match.board.p2[0];
    target.state.statuses.push({
        id: 'shiore_orochimaru_giant_snake_bind',
        remainingTurns: 1,
        metadata: {
            harmful: true,
        },
    });
    match.chakraPools.p1 = emptyPool();
    match.chakraPools.p2 = {
        taijutsu: 1,
        ninjutsu: 0,
        bloodline: 0,
        genjutsu: 0,
    };

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    assert.equal(chakraTotal(match.chakraPools.p2), 0, 'bound target should lose one chakra');
    assert.equal(chakraTotal(match.chakraPools.p1), 1, 'Shiore should gain the stolen chakra');
    assert.equal(
        target.state.statuses.some(
            (status) =>
                status.id === 'shiore_orochimaru_five_elements_seal_cost' &&
                status.remainingTurns === 2 &&
                status.metadata.randomCostIncrease === 1
        ),
        true,
        'bound target should receive the extended chakra cost increase'
    );
});

test('Shigure Sprinkling Needles description matches its turn damage value', () => {
    const shigure = getCharacter('shigure');
    const sprinklingNeedles = shigure.skills.find((skill) => skill.id === 'shigure-sprinkling-needles');
    const damageStatus = sprinklingNeedles.effects.find(
        (effect) => effect.statusId === 'shigure_sprinkling_needles_mark'
    );

    assert.equal(damageStatus.metadata.turnEndDamage, 10);
    assert.match(sprinklingNeedles.skilldescription, /10 piercing damage/);
    assert.match(damageStatus.metadata.tooltipText, /10 piercing damage/);
});

test('Akadou Yoroi Draining Assault description matches its health steal values', () => {
    const yoroi = getCharacter('akadou-yoroi');
    const drainingAssault = yoroi.skills.find((skill) => skill.id === 'akadou-yoroi-draining-assault');
    const damageStatus = drainingAssault.effects.find(
        (effect) => effect.statusId === 'akadou_yoroi_draining_assault_dot'
    );
    const healStatus = drainingAssault.effects.find(
        (effect) => effect.statusId === 'akadou_yoroi_draining_assault_heal'
    );

    assert.equal(damageStatus.metadata.turnEndDamage, 15);
    assert.equal(healStatus.metadata.turnEndHealFlat, 15);
    assert.match(drainingAssault.skilldescription, /steals 15 health/);
    assert.match(damageStatus.metadata.tooltipText, /15 health/);
    assert.match(healStatus.metadata.tooltipText, /15 health/);
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
        'temari-summoning-quick-beheading-dance'
    );
    assert.deepEqual(
        computeEffectiveEnergyCost({
            skill: characters[13].skills[1],
            actorState: match.board.p1[0].state,
        }),
        {
            reservedSpecific: {
                taijutsu: 0,
                ninjutsu: 1,
                bloodline: 0,
                genjutsu: 0,
            },
            requiredRandom: 1,
        }
    );
});
