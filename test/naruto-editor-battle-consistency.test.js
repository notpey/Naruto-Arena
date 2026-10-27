const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const characters = require("../data/characters/index.js");
const { buildMatchPayloadForUser } = require('../server.js');
const narutoStarterCharacter = require('../narutoStarterCharacter.js');
const sakuraStarterCharacter = require('../sakuraStarterCharacter.js');
const sasukeStarterCharacter = require('../sasukeStarterCharacter.js');
const starterCharacterPresets = require('../starterCharacterPresets.js');
const starterCharacterPresetsBatch2 = require('../starterCharacterPresetsBatch2.js');
const {
    buildInitialBoard,
    resolvePendingTurnSkills,
    resolveEffectiveSkill,
    computeTargetOptions,
    applyDamageToUnit,
    applyHealToUnit,
    computeEffectiveEnergyCost,
    tickStatusesForTurnEnd,
    tickCooldownsForTurnEnd,
    isSkillIndexBlockedForActor,
} = require('../battleLogic.js');

const getCharIndex = (id) => characters.findIndex(c => (c && (c.id === id || c.characterId === id)));

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
        /applystatus|onexpireeffects|onowneruseskilleffects|counterapplystatus|allyfollowupdamagemark|healingblockonstun|teamskillcostdefense|awakening/i.test(pathParts.join('.'));
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
        /skillid|skillids|skillreplacements|bonusesbyskillid|skilldamagebonuses|skillhealingbonuses|skillcostoverridesbyskillid|skillcooldownoverridesbyskillid|skillcooldownincreasebyskillid|skilldurationbonuses|skilldamagecapbyskillid/i.test(
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

test('Naruto rework keeps four active skills and a separate passive', () => {
    const naruto = getNaruto();
    assert.deepEqual(
        naruto.skills.map((skill) => skill.id),
        [
            'uzumaki-naruto-shadow-clone-assault',
            'uzumaki-naruto-shadow-clone-technique',
            'uzumaki-naruto-demon-wind-shuriken-feint',
            'uzumaki-naruto-sexy-technique',
        ]
    );
    assert.equal(naruto.passive.name, 'Unpredictable Ninja');
    assert.equal(naruto.passive.physicalDamageBonusWhileHelpful, 5);
    assert.deepEqual(naruto.skills.map(skill => skill.energy), [
        ['Taijutsu'], ['Random'], ['Taijutsu', 'Random'], ['Random'],
    ]);
    assert.deepEqual(naruto.skills.map(skill => skill.cooldown), [0, 3, 2, 4]);
});

test('Naruto passive is a permanent visible match effect, outside the skill tray', () => {
    const match = makeMatch();
    const statuses = match.board.p1[0].state.statuses;
    const passive = statuses.find(status => status.id === 'uzumaki_naruto_unpredictable_ninja');
    assert.ok(passive, 'passive exists from match start');
    assert.equal(passive.remainingTurns, 99);
    assert.equal(passive.metadata.sourceSkillName, 'Unpredictable Ninja');
    assert.equal(passive.metadata.statusIcon, getNaruto().passive.icon);
    assert.ok(passive.metadata.tooltipText.startsWith(getNaruto().passive.description));
    assert.match(passive.metadata.tooltipText, /This passive cannot be removed/);
    assert.equal(getNaruto().skills.length, 4, 'passive does not occupy a skill slot');
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.ok(match.board.p1[0].state.statuses.some(status => status.id === passive.id && status.remainingTurns === 99));
    const ownerPayload = buildMatchPayloadForUser(match, 'p1');
    const enemyPayload = buildMatchPayloadForUser(match, 'p2');
    for (const payload of [ownerPayload, enemyPayload]) {
        const visible = payload.board.p1[0].state.statuses.find(status => status.id === passive.id);
        assert.equal(visible.metadata.sourceSkillName, 'Unpredictable Ninja');
        assert.equal(visible.metadata.statusIcon, getNaruto().passive.icon);
        assert.equal(visible.metadata.tooltipText, passive.metadata.tooltipText);
    }
});

test('Naruto passive survives status cleansing and explicit status removal', () => {
    const match = makeMatch();
    const passiveId = 'uzumaki_naruto_unpredictable_ninja';
    const testCharacters = [...characters];
    const castEffect = (effect) => {
        testCharacters[0] = {
            ...getNaruto(),
            skills: [{ id: 'test-status-removal', name: 'Test Status Removal', target: 'self',
                classes: ['Strategic', 'Instant'], energy: [], cooldown: 0, effects: [effect] }],
        };
        queueSkill(match, 'p1', 0);
        resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: testCharacters });
    };
    match.board.p1[0].state.statuses.push({ id: 'temporary_buff', remainingTurns: 2, metadata: { helpful: true } });
    castEffect({ type: 'cleanse_statuses', scope: 'self' });
    assert.equal(match.board.p1[0].state.statuses.some(status => status.id === 'temporary_buff'), false);
    assert.equal(match.board.p1[0].state.statuses.some(status => status.id === passiveId), true);
    castEffect({ type: 'remove_status', scope: 'self', statusId: passiveId });
    assert.equal(match.board.p1[0].state.statuses.some(status => status.id === passiveId), true);
});

test('Naruto rework applies Shadow Clone Technique and consumes it after empowered Feint', () => {
    let match = makeMatch();
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 80, 'Assault starts at 20 damage without a helpful effect');

    queueSkill(match, 'p1', 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    const narutoState = match.board.p1[0].state;
    assert.equal(
        narutoState.statuses.some(
            (status) =>
                status.id === 'uzumaki_naruto_shadow_clone_technique' &&
                status.remainingTurns === 3 &&
                status.metadata.damageReductionFlat === 15
        ),
        true
    );

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 45, 'Assault deals 20 + 10 clone bonus + 5 passive bonus');

    match.board.p2[0].hp = 100;
    queueSkill(match, 'p1', 2, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 55, 'Feint deals 25 + 15 clone bonus + 5 passive bonus');
    assert.equal(
        match.board.p2[0].state.statuses.some(
            (status) =>
                status.id === 'uzumaki_naruto_rasengan_stun' &&
                status.metadata.cannotUseSkillClasses.includes('physical')
        ),
        true
    );
    assert.equal(narutoState.statuses.some(status => status.id === 'uzumaki_naruto_shadow_clone_technique'), false);
});

test('Naruto passive works with other helpful effects and ignores harmful effects', () => {
    const match = makeMatch();
    const narutoState = match.board.p1[0].state;
    narutoState.statuses.push({ id: 'test_harmful', remainingTurns: 1, metadata: { harmful: true } });
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 80);
    narutoState.statuses.push({ id: 'test_helpful', remainingTurns: 1, metadata: { helpful: true } });
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 55);
    narutoState.statuses = [
        ...narutoState.statuses.filter(status => status.metadata?.passive),
        {
            id: 'ally_protection', remainingTurns: 1, sourceUsername: 'p1',
            metadata: { damageReductionFlat: 5 },
        },
    ];
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 30, 'an allied helpful effect also triggers the passive');
});

test('Sakura rework keeps four skills and a visible passive that strengthens Guard Duty', () => {
    const sakura = getSakura();
    assert.equal(sakura.skills[0].cooldown, 1);
    assert.equal(sakura.skills[1].cooldown, 1);
    assert.deepEqual(sakura.skills.map(skill => skill.name), [
        'Kunai Interference', 'Guard Duty', 'Clone Technique', 'Sakura Hide',
    ]);
    const match = makeMatch([1, 0], [2, 3]);
    const passive = match.board.p1[0].state.statuses.find(status => status.metadata?.passive);
    assert.equal(passive.metadata.sourceSkillName, 'Exceptional Chakra Control');
    assert.equal(passive.metadata.statusIcon, sakura.passive.icon);
    assert.equal(passive.remainingTurns, 99);
    assert.equal(buildMatchPayloadForUser(match, 'p2').board.p1[0].state.statuses[0].metadata.statusIcon, sakura.passive.icon);

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 85);
    assert.ok(match.board.p1[0].state.cooldowns['haruno-sakura-kunai-interference'] > 0);
    assert.equal(match.board.p2[1].hp, 100);
    assert.equal(match.board.p2[0].state.statuses.find(status => status.id === 'haruno_sakura_kunai_interference')?.metadata.nonAfflictionDamageDebuffFlat, 10);

    queueSkill(match, 'p1', 1, [{ username: 'p1', slot: 1 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    const guardDefense = match.board.p1[1].state.statuses.find(status => status.id === 'haruno_sakura_guard_duty_defense');
    assert.ok(match.board.p1[0].state.cooldowns['haruno-sakura-guard-duty'] > 0);
    const guardReduction = match.board.p1[1].state.statuses.find(status => status.id === 'haruno_sakura_guard_duty_reduction');
    assert.equal(guardDefense.metadata.destructibleDefensePoints, 30, '25 base defense plus 5 from passive');
    assert.equal(guardReduction.metadata.damageReductionFlat, 10);
    assert.match(guardDefense.metadata.tooltipText, /30 destructible defense/);
    assert.equal(guardDefense.sourceSkillId, guardReduction.sourceSkillId, 'both effects share one Guard Duty tooltip icon');
    applyDamageToUnit(match.board.p1[1], 30);
    assert.equal(match.board.p1[1].state.statuses.some(status => status.id === guardDefense.id), false);
    assert.equal(match.board.p1[1].state.statuses.some(status => status.id === guardReduction.id), true, 'damage reduction lasts after destructible defense breaks');
    applyDamageToUnit(match.board.p1[1], 20);
    assert.equal(match.board.p1[1].hp, 90, 'remaining damage reduction still mitigates the next attack');

    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    const sakuraState = match.board.p1[0].state;
    const clone = sakuraState.statuses.find(status => status.id === 'haruno_sakura_clone_technique');
    assert.equal(clone.metadata.damageReductionFlat, 10);
    assert.equal(resolveEffectiveSkill({ characters, rosterIndex: 1, skillIndex: 0, actorState: sakuraState }).target, 'all-enemy');
    assert.equal(resolveEffectiveSkill({ characters, rosterIndex: 1, skillIndex: 1, actorState: sakuraState }).target, 'all-allies');
    assert.equal(computeTargetOptions({ match, actingUsername: 'p1', actorSlot: 0, skillIndex: 0, characters }).mode, 'all');
    assert.equal(computeTargetOptions({ match, actingUsername: 'p1', actorSlot: 0, skillIndex: 1, characters }).mode, 'all');
    assert.equal(buildMatchPayloadForUser(match, 'p1').board.p1[0].state.statuses.find(status => status.id === clone.id).metadata.skillTargetOverrides['haruno-sakura-guard-duty'], 'all-allies');

    delete sakuraState.cooldowns['haruno-sakura-kunai-interference'];
    delete sakuraState.cooldowns['haruno-sakura-guard-duty'];
    queueSkill(match, 'p1', 0);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 75, 'Clone Kunai deals 10 instead of 15');
    assert.equal(match.board.p2[1].hp, 90, 'Clone Kunai hits the other enemy');
    assert.equal(match.board.p2[0].state.statuses.find(status => status.id === 'haruno_sakura_kunai_interference')?.metadata.nonAfflictionDamageDebuffFlat, 5);

    queueSkill(match, 'p1', 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    for (const unit of match.board.p1) {
        const defenseStatus = unit.state.statuses.find(entry => entry.id === 'haruno_sakura_guard_duty_defense');
        const reductionStatus = unit.state.statuses.find(entry => entry.id === 'haruno_sakura_guard_duty_reduction');
        assert.equal(defenseStatus.metadata.destructibleDefensePoints, 20, '15 base defense plus 5 passive');
        assert.equal(reductionStatus.metadata.damageReductionFlat, 5);
    }
    queueSkill(match, 'p1', 3);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(sakuraState.statuses.some(status => status.id === 'invulnerable' && status.metadata.invulnerable), true);
});

test('Sasuke Fireball burn drives his passive bonus and Shadow Shuriken follow-up', () => {
    const sasuke = getSasuke();
    assert.deepEqual(sasuke.skills.map(skill => skill.name), [
        'Shadow Shuriken Technique', 'Fire Style: Great Fireball Jutsu', 'Sharingan', 'Stealth',
    ]);
    const match = makeMatch([2], [1]);
    const passive = match.board.p1[0].state.statuses.find(status => status.metadata?.passive);
    assert.equal(passive.metadata.sourceSkillName, 'Uchiha Prodigy');
    assert.equal(passive.metadata.statusIcon, sasuke.passive.icon);

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 80, 'unmarked Shuriken deals 20');

    queueSkill(match, 'p1', 1, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 60, 'Fireball deals 20 chakra damage');
    const burn = match.board.p2[0].state.statuses.find(status => status.id === 'uchiha_sasuke_great_fireball_burn');
    assert.equal(burn.remainingTurns, 3);
    assert.equal(burn.sourceUsername, 'p1');
    assert.equal(burn.metadata.turnEndDamage, 5);
    assert.equal(burn.metadata.afflictionDamage, true);

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 35, 'marked Shuriken deals 20 plus 5 from passive');
    assert.equal(match.board.p2[0].state.statuses.some(status => status.id === 'uchiha_sasuke_shadow_shuriken_stun'), true);
    assert.equal(match.board.p2[0].state.statuses.some(status => status.id === burn.id), false, 'Shuriken ends remaining Fireball effect');

    const tickMatch = makeMatch([2], [1]);
    queueSkill(tickMatch, 'p1', 1, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match: tickMatch, actingUsername: 'p1', characters });
    for (const hp of [75, 70, 65]) {
        tickStatusesForTurnEnd({ match: tickMatch, endingUsername: 'p1' });
        assert.equal(tickMatch.board.p2[0].hp, hp, 'Fireball burn ticks for 5 affliction damage');
    }
    assert.equal(tickMatch.board.p2[0].state.statuses.some(status => status.id === burn.id), false);

    const foreignBurnMatch = makeMatch([2], [1]);
    foreignBurnMatch.board.p2[0].state.statuses.push({
        id: burn.id, remainingTurns: 2, sourceUsername: 'p2', sourceSlot: 0,
        metadata: { harmful: true, afflictionDamage: true },
    });
    queueSkill(foreignBurnMatch, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match: foreignBurnMatch, actingUsername: 'p1', characters });
    assert.equal(foreignBurnMatch.board.p2[0].hp, 80, 'another source’s Fireball does not activate Sasuke’s passive');
    assert.equal(foreignBurnMatch.board.p2[0].state.statuses.some(status => status.id === burn.id), true);
    assert.equal(foreignBurnMatch.board.p2[0].state.statuses.some(status => status.id === 'uchiha_sasuke_shadow_shuriken_stun'), false);
});

test('Sasuke Sharingan visibly counters the first harmful Physical skill and then ends', () => {
    const match = makeMatch([2], [2]);
    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    const state = match.board.p1[0].state;
    const sharingan = state.statuses.find(status => status.id === 'uchiha_sasuke_sharingan');
    assert.equal(sharingan.remainingTurns, 3);
    assert.equal(sharingan.metadata.damageReductionFlat, 10);
    assert.equal(buildMatchPayloadForUser(match, 'p2').board.p1[0].state.statuses.some(status => status.id === sharingan.id), true);

    queueSkill(match, 'p2', 1, [{ username: 'p1', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p2', characters });
    assert.equal(match.board.p1[0].hp, 90, 'Sharingan reduces Chakra damage but does not counter it');
    assert.equal(state.statuses.some(status => status.id === sharingan.id), true);

    queueSkill(match, 'p2', 0, [{ username: 'p1', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p2', characters });
    assert.equal(match.board.p1[0].hp, 90, 'Sharingan counters the Physical skill');
    assert.equal(state.statuses.some(status => status.id === sharingan.id), false, 'Sharingan ends after countering');

    queueSkill(match, 'p1', 3);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(state.statuses.some(status => status.id === 'invulnerable' && status.metadata.invulnerable), true);
});

test('Sasuke Sharingan does not counter his own Physical skill', () => {
    const match = makeMatch([2], [2]);
    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    assert.equal(match.board.p2[0].hp, 80, 'Shadow Shuriken reaches the enemy');
    assert.equal(match.board.p1[0].state.statuses.some(status =>
        status.id === 'uchiha_sasuke_sharingan'), true, 'Sharingan remains ready for an enemy skill');
    assert.equal(Boolean(match.combatEvents?.some(event => event.outcome === 'countered')), false);

    queueSkill(match, 'p2', 0, [{ username: 'p1', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p2', characters });
    assert.equal(match.board.p1[0].hp, 100, 'the next enemy Physical skill is countered');
    assert.equal(match.board.p1[0].state.statuses.some(status =>
        status.id === 'uchiha_sasuke_sharingan'), false, 'enemy counter consumes Sharingan');
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

test('Shino starts Chakra Leech on cooldown and can steal after his first turn', () => {
    const match = makeMatch([getCharIndex('aburame-shino')], [getCharIndex('haruno-sakura')]);
    match.chakraPools.p2.taijutsu = 1;
    match.chakraPools.p1.bloodline = 1;
    assert.equal(match.board.p1[0].state.cooldowns['aburame-shino-chakra-leach'], 1);
    queueSkill(match, 'p1', 1, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.chakraPools.p2.taijutsu, 1);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    tickCooldownsForTurnEnd({ match, endingUsername: 'p1' });
    queueSkill(match, 'p1', 1, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.chakraPools.p2.taijutsu, 0);
    assert.equal(match.chakraPools.p1.taijutsu, 1);
    assert.equal(match.board.p2[0].hp, 100, 'Chakra Leech needs Infestation to deal damage');
});

test('Shino Female Bug and Infestation work together without stacking marks', () => {
    const match = makeMatch([getCharIndex('aburame-shino')],
        [getCharIndex('haruno-sakura'), getCharIndex('uzumaki-naruto')]);
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    queueSkill(match, 'p1', 2, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.ok(match.board.p2[0].state.statuses.some(status =>
        status.id === 'aburame_shino_infestation_debuff'));
    queueSkill(match, 'p2', 1, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p2', characters });
    assert.equal(match.board.p2[0].hp, 90, 'two chakra spent trigger 10 affliction damage');
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 1 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].state.statuses.some(status => status.id === 'aburame_shino_female_bug'), false);
    assert.equal(match.board.p2[1].state.statuses.filter(status => status.id === 'aburame_shino_female_bug').length, 1);
    assert.equal(match.board.p2[0].state.statuses.some(status => status.id === 'aburame_shino_infestation_debuff'), false);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(match.board.p2[0].hp, 85, 'Infestation continues after Female Bug moves');
});

test('Hinata awakens after four turns and Gentle Fist loses its cooldown', () => {
    const hinataIndex = getCharIndex('hyuuga-hinata');
    const match = makeMatch([hinataIndex], [getCharIndex('haruno-sakura')]);
    const hinata = match.board.p1[0];
    assert.deepEqual(computeTargetOptions({ match, actingUsername: 'p1', actorSlot: 0,
        skillIndex: 1, characters }).targets, []);
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 85);
    assert.equal(match.board.p2[0].state.statuses.find(status =>
        status.id === 'hyuuga_hinata_gentle_fist_debuff')?.metadata.nonAfflictionDamageDebuffFlat, 10);
    assert.ok(hinata.state.cooldowns['hyuuga-hinata-hinata-gentle-fist'] > 0);
    for (let turn = 1; turn <= 4; turn += 1) {
        tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
        assert.equal(hinata.state.statuses.some(status =>
            status.id === 'hyuuga_hinata_shy_byakugan_awakened'), turn === 4);
    }
    assert.equal(hinata.state.cooldowns['hyuuga-hinata-hinata-gentle-fist'], undefined);
    assert.equal(resolveEffectiveSkill({ characters, rosterIndex: hinataIndex,
        skillIndex: 0, actorState: hinata.state }).cooldown, 0);
    assert.equal(computeTargetOptions({ match, actingUsername: 'p1', actorSlot: 0,
        skillIndex: 1, characters }).targets.length, 1);
});

test('Hinata awakens immediately when another ally falls below 50 health', () => {
    const match = makeMatch([getCharIndex('hyuuga-hinata'), getCharIndex('uzumaki-naruto')],
        [getCharIndex('haruno-sakura')]);
    applyDamageToUnit(match.board.p1[0], 51, { match, sourceUsername: 'p2',
        targetUsername: 'p1', targetSlot: 0 });
    assert.equal(match.board.p1[0].state.statuses.some(status =>
        status.id === 'hyuuga_hinata_shy_byakugan_awakened'), false,
    'Hinata herself is not another ally');
    applyDamageToUnit(match.board.p1[1], 51, { match, sourceUsername: 'p2',
        targetUsername: 'p1', targetSlot: 1 });
    assert.equal(match.board.p1[0].state.statuses.some(status =>
        status.id === 'hyuuga_hinata_shy_byakugan_awakened'), true);
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
    const match = makeMatch([8], [2]);
    queueSkill(match, 'p1', 1, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(
        resolveEffectiveSkill({
            characters,
            rosterIndex: 8,
            skillIndex: 1,
            actorState: match.board.p1[0].state,
        }).id,
        'yamanaka-ino-forced-betrayal'
    );
    assert.equal(
        match.board.p2[0].state.statuses.some(
            (status) =>
                status.id === 'ino_mind_body_switch_target' &&
                status.metadata.cannotUseHarmfulSkills
        ),
        true
    );
    assert.equal(match.board.p2[0].hp, 95, 'Art of the Valentine deals 5 piercing damage on stun');
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
    const match = makeMatch([getCharIndex('tenten')], [1, 2]);

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
            rosterIndex: getCharIndex('tenten'),
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
    const match = makeMatch([getCharIndex('neji-hyuuga')], [1, 2]);
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
    const match = makeMatch([getCharIndex('gaara-of-the-desert')], [1]);

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(
        resolveEffectiveSkill({
            characters,
            rosterIndex: getCharIndex('gaara-of-the-desert'),
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
    const match = makeMatch([getCharIndex('kankuro')], [1]);

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
    const match = makeMatch([getCharIndex('kankuro')], [1, 2, 3]);

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
    const hiddenMist = zabuza.skills.find((skill) => skill.id === 'momochi-zabuza-hidden-mist-technique');
    const defenseStatus = hiddenMist.effects.find(
        (effect) => effect.statusId === 'zabuza_hidden_mist_defense'
    );

    assert.equal(defenseStatus.metadata.damageReductionFlat, 5);
    assert.match(hiddenMist.skilldescription, /5 damage reduction/);
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
    const match = makeMatch([getCharIndex('temari')], [1, 2]);
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
            rosterIndex: getCharIndex('temari'),
            skillIndex: 1,
            actorState: match.board.p1[0].state,
        }).id,
        'temari-summoning-quick-beheading-dance'
    );
    assert.deepEqual(
        computeEffectiveEnergyCost({
            skill: characters[getCharIndex('temari')].skills[1],
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

test('Shino reapplying Infestation refreshes it instead of stacking', () => {
    const match = makeMatch([getCharIndex('aburame-shino')], [getCharIndex('haruno-sakura')]);
    for (let use = 0; use < 2; use += 1) {
        match.board.p1[0].state.cooldowns = {};
        queueSkill(match, 'p1', 2, [{ username: 'p2', slot: 0 }]);
        resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    }
    const infestation = match.board.p2[0].state.statuses.filter(status => status.id === 'aburame_shino_infestation');
    assert.equal(infestation.length, 1);
    assert.equal(infestation[0].remainingTurns, 99);
});

test('Shino Chakra Leech gains its conditional effects from Female Bug and Infestation', () => {
    const match = makeMatch([getCharIndex('aburame-shino')], [getCharIndex('haruno-sakura')]);
    match.chakraPools.p1.bloodline = 2;
    match.chakraPools.p2.taijutsu = 2;
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    queueSkill(match, 'p1', 2, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    tickCooldownsForTurnEnd({ match, endingUsername: 'p1' });
    queueSkill(match, 'p1', 1, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.chakraPools.p2.taijutsu, 1);
    assert.equal(match.chakraPools.p1.taijutsu, 1);
    assert.equal(match.board.p2[0].hp, 90);
    const debuff = match.board.p2[0].state.statuses.find(status =>
        status.id === 'aburame_shino_chakra_leech_debuff');
    assert.equal(debuff?.metadata.nonAfflictionDamageDebuffFlat, 15);
});

test('Shino passive blocks targeted chakra removal and stealing', () => {
    const match = makeMatch(
        [getCharIndex('aburame-shino'), getCharIndex('uzumaki-naruto')],
        [getCharIndex('shiore-orochimaru')]
    );
    match.chakraPools.p1.taijutsu = 2;
    queueSkill(match, 'p2', 0, [{ username: 'p1', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p2', characters });
    assert.equal(match.chakraPools.p1.taijutsu, 2, 'targeting Shino cannot remove chakra');
    match.board.p1[0].state.statuses.push({ id: 'shiore_orochimaru_giant_snake_bind', remainingTurns: 1,
        sourceUsername: 'p2', sourceSlot: 0, metadata: { harmful: true } });
    queueSkill(match, 'p2', 0, [{ username: 'p1', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p2', characters });
    assert.equal(match.chakraPools.p1.taijutsu, 2, 'targeting Shino cannot steal chakra');
    queueSkill(match, 'p2', 0, [{ username: 'p1', slot: 1 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p2', characters });
    assert.equal(match.chakraPools.p1.taijutsu, 1, 'the passive does not protect other allies');
});

test('Shino insect effects end when he dies', () => {
    const match = makeMatch([getCharIndex('aburame-shino')], [getCharIndex('haruno-sakura')]);
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    queueSkill(match, 'p1', 2, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    match.board.p1[0].alive = false;
    match.board.p1[0].hp = 0;
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(match.board.p2[0].state.statuses.some(status =>
        status.id.startsWith('aburame_shino_')), false);
});

test('Shino Insect Clone grants one turn of invulnerability and a four turn cooldown', () => {
    const match = makeMatch([getCharIndex('aburame-shino')], [getCharIndex('haruno-sakura')]);
    queueSkill(match, 'p1', 3);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    const shino = match.board.p1[0];
    assert.equal(shino.state.cooldowns['aburame-shino-insect-clone'], 5);
    const clone = shino.state.statuses.find(status => status.id === 'invulnerable');
    assert.equal(clone?.remainingTurns, 1);
    assert.equal(clone?.metadata.invulnerable, true);
    queueSkill(match, 'p2', 0, [{ username: 'p1', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p2', characters });
    assert.equal(shino.hp, 100);
    tickCooldownsForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(shino.state.cooldowns['aburame-shino-insect-clone'], 4);
});

test('Hinata 64 Palms damages and weakens all enemies, heals allies, then gains a one-turn boost', () => {
    const match = makeMatch([getCharIndex('hyuuga-hinata'), getCharIndex('uzumaki-naruto')],
        [getCharIndex('haruno-sakura'), getCharIndex('uchiha-sasuke')]);
    applyDamageToUnit(match.board.p1[1], 60, { match, sourceUsername: 'p2',
        targetUsername: 'p1', targetSlot: 1 });
    match.board.p1[0].hp = 70;
    queueSkill(match, 'p1', 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.deepEqual(match.board.p2.map(unit => unit.hp), [90, 90]);
    assert.deepEqual(match.board.p1.map(unit => unit.hp), [80, 50]);
    assert.equal(match.board.p2[0].state.statuses.find(status =>
        status.id === 'hyuuga_hinata_64_palms_debuff')?.metadata.nonAfflictionDamageDebuffFlat, 5);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    queueSkill(match, 'p1', 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.deepEqual(match.board.p2.map(unit => unit.hp), [75, 75]);
    assert.deepEqual(match.board.p1.map(unit => unit.hp), [95, 65]);
});

test('Hinata Secret Oinment heals four turns and boosts only other healing', () => {
    const match = makeMatch([getCharIndex('hyuuga-hinata'), getCharIndex('uzumaki-naruto')],
        [getCharIndex('haruno-sakura')]);
    const naruto = match.board.p1[1];
    naruto.hp = 50;
    queueSkill(match, 'p1', 2, [{ username: 'p1', slot: 1 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(computeTargetOptions({ match, actingUsername: 'p1', actorSlot: 0,
        skillIndex: 2, characters }).targets.some(target => target.slot === 1), false);
    assert.equal(applyHealToUnit(naruto, 10), 15);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(naruto.hp, 65, 'ointment does not heal on its casting turn');
    for (let turn = 0; turn < 4; turn += 1) {
        tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
        tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    }
    assert.equal(naruto.hp, 85, 'four ointment ticks heal 5 each');
    assert.equal(naruto.state.statuses.some(status =>
        status.id === 'hyuuga_hinata_secret_ointment'), false);
    assert.equal(applyHealToUnit(naruto, 10), 10);
});

test('Hinata Block prevents an enemy attack for one turn', () => {
    const match = makeMatch([getCharIndex('hyuuga-hinata')], [getCharIndex('haruno-sakura')]);
    queueSkill(match, 'p1', 3);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p1[0].state.statuses.find(status =>
        status.id === 'invulnerable')?.remainingTurns, 1);
    queueSkill(match, 'p2', 0, [{ username: 'p1', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p2', characters });
    assert.equal(match.board.p1[0].hp, 100);
    tickCooldownsForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(match.board.p1[0].state.cooldowns['hyuuga-hinata-hinata-block'], 4);
});

test('Meditate can mark another enemy immediately and Water Assault costs only Ninjutsu', () => {
    const match = makeMatch([getCharIndex('nara-shikamaru')], [1, 2]);
    for (const slot of [0, 1]) {
        queueSkill(match, 'p1', 0, [{ username: 'p2', slot }]);
        resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    }
    match.board.p2.forEach((unit) => {
        assert.equal(unit.state.statuses.some((status) => status.id === 'nara_shikamaru_meditate'), true);
    });
    assert.equal(match.board.p1[0].state.cooldowns['nara-shikamaru-meditate'] || 0, 0);
    assert.deepEqual(
        computeEffectiveEnergyCost({
            skill: getCharacter('edo-tensei-tobirama').skills[0],
            actorState: match.board.p1[0].state,
        }),
        { reservedSpecific: { taijutsu: 0, ninjutsu: 1, bloodline: 0, genjutsu: 0 }, requiredRandom: 0 }
    );
});

test('Young Kakashi removes chakra and stuns chakra skills for one turn', () => {
    const match = makeMatch([getCharIndex('young-kakashi')], [getCharIndex('edo-tensei-tobirama')]);
    match.chakraPools.p2.ninjutsu = 1;
    queueSkill(match, 'p1', 2, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.chakraPools.p2.ninjutsu, 0);
    assert.equal(
        match.board.p2[0].state.statuses.some((status) =>
            status.id === 'young_kakashi_implanted_sharingan_stun' &&
            status.metadata.cannotUseSkillClasses.includes('ninjutsu')
        ),
        true
    );
    match.chakraPools.p2.ninjutsu = 1;
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    queueSkill(match, 'p2', 0, [{ username: 'p1', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p2', characters });
    assert.equal(match.board.p1[0].hp, 100, 'Water Assault should be stunned even with chakra available');
    tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    queueSkill(match, 'p2', 0, [{ username: 'p1', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p2', characters });
    assert.equal(match.board.p1[0].hp, 85, 'Water Assault should be usable after the stun');
});

test('Yoroi keeps Chakra Focus when there is no chakra to steal', () => {
    const match = makeMatch([getCharIndex('akadou-yoroi')], [getCharIndex('haruno-sakura')]);
    match.board.p1[0].state.statuses.push({
        id: 'akadou_yoroi_chakra_focus', remainingTurns: 3, metadata: { helpful: true },
    });
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p1[0].state.statuses.some((status) => status.id === 'akadou_yoroi_chakra_focus'), true);
    match.chakraPools.p2.taijutsu = 1;
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.chakraPools.p2.taijutsu, 0);
    assert.equal(match.chakraPools.p1.taijutsu, 1);
    assert.equal(match.board.p1[0].state.statuses.some((status) => status.id === 'akadou_yoroi_chakra_focus'), false);
});
