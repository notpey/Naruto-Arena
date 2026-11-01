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
    validateTargetSelection,
    applyDamageToUnit,
    applyHealToUnit,
    computeEffectiveEnergyCost,
    tickStatusesForTurnEnd,
    tickCooldownsForTurnEnd,
    isSkillIndexBlockedForActor,
    isUnitInvulnerableForSkill,
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
        /applystatus|startstatuses|onexpireeffects|onowneruseskilleffects|counterapplystatus|allyfollowupdamagemark|healingblockonstun|teamskillcostdefense|awakening/i.test(pathParts.join('.'));
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
                    !/duration|cooldown|remaining|maxuses|minimumhp|threshold|atleast|stackmax/i.test(childPath)
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

    // The editor edits exactly what the server returns; static presets must never override live data.
    const html = fs.readFileSync(path.join(__dirname, '..', 'charactereditor.html'), 'utf8');
    assert.ok(html.includes('charactereditor.js'), 'character editor must load its editor script');
    ['narutoStarterCharacter.js', 'sakuraStarterCharacter.js', 'sasukeStarterCharacter.js', 'starterCharacterPresets.js', 'starterCharacterPresetsBatch2.js'].forEach((file) => {
        assert.ok(!html.includes(file), `character editor must not load ${file}`);
    });
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
    assert.equal(naruto.passive.name, 'Kyuubi Awakening');
    assert.deepEqual(naruto.passive.onFirstHpAtMost, { threshold: 40, heal: 20, randomChakra: 1 });
    assert.deepEqual(naruto.skills.map(skill => skill.energy), [
        ['Taijutsu'], ['Random'], ['Taijutsu', 'Random'], ['Random'],
    ]);
    assert.deepEqual(naruto.skills.map(skill => skill.cooldown), [0, 3, 2, 4]);
});

test('Naruto passive is a permanent visible match effect, outside the skill tray', () => {
    const match = makeMatch();
    const statuses = match.board.p1[0].state.statuses;
    const passive = statuses.find(status => status.id === 'uzumaki_naruto_kyuubi_awakening');
    assert.ok(passive, 'passive exists from match start');
    assert.equal(passive.remainingTurns, 99);
    assert.equal(passive.metadata.sourceSkillName, 'Kyuubi Awakening');
    assert.equal(passive.metadata.statusIcon, getNaruto().passive.icon);
    assert.ok(passive.metadata.tooltipText.startsWith(getNaruto().passive.description));
    assert.equal(passive.metadata.tooltipText, getNaruto().passive.description);
    assert.equal(getNaruto().skills.length, 4, 'passive does not occupy a skill slot');
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.ok(match.board.p1[0].state.statuses.some(status => status.id === passive.id && status.remainingTurns === 99));
    const ownerPayload = buildMatchPayloadForUser(match, 'p1');
    const enemyPayload = buildMatchPayloadForUser(match, 'p2');
    for (const payload of [ownerPayload, enemyPayload]) {
        const visible = payload.board.p1[0].state.statuses.find(status => status.id === passive.id);
        assert.equal(visible.metadata.sourceSkillName, 'Kyuubi Awakening');
        assert.equal(visible.metadata.statusIcon, getNaruto().passive.icon);
        assert.equal(visible.metadata.tooltipText, passive.metadata.tooltipText);
    }
});

test('Naruto passive survives status cleansing and explicit status removal', () => {
    const match = makeMatch();
    const passiveId = 'uzumaki_naruto_kyuubi_awakening';
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
    assert.equal(match.board.p2[0].hp, 50, 'Assault deals 20 + 10 clone bonus');

    match.board.p2[0].hp = 100;
    queueSkill(match, 'p1', 2, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 60, 'Feint deals 25 + 15 clone bonus');
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

test('Naruto Assault damage remains the same with helpful and harmful effects', () => {
    const match = makeMatch();
    const narutoState = match.board.p1[0].state;
    narutoState.statuses.push({ id: 'test_harmful', remainingTurns: 1, metadata: { harmful: true } });
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 80);
    narutoState.statuses.push({ id: 'test_helpful', remainingTurns: 1, metadata: { helpful: true } });
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 60);
    narutoState.statuses = [
        ...narutoState.statuses.filter(status => status.metadata?.passive),
        {
            id: 'ally_protection', remainingTurns: 1, sourceUsername: 'p1',
            metadata: { damageReductionFlat: 5 },
        },
    ];
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 40);
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

test('Sasuke Sharingan hides its counter and ends after countering a Physical skill', () => {
    const match = makeMatch([2], [2]);
    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    const state = match.board.p1[0].state;
    const sharingan = state.statuses.find(status => status.id === 'uchiha_sasuke_sharingan');
    assert.equal(sharingan.remainingTurns, 3);
    assert.equal(sharingan.metadata.damageReductionFlat, 10);
    assert.equal(buildMatchPayloadForUser(match, 'p2').board.p1[0].state.statuses.some(status => status.id === sharingan.id), false);
    assert.equal(buildMatchPayloadForUser(match, 'p1').board.p1[0].state.statuses.some(status => status.id === sharingan.id), true);

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

test('battleLogic resolves Kiba draft mark, damage, and discount', () => {
    const kibaIndex = getCharIndex('inuzuka-kiba');
    const match = makeMatch([kibaIndex], [getCharIndex('haruno-sakura')]);
    const kibaState = match.board.p1[0].state;
    assert.equal(kibaState.statuses.some(status => status.metadata.revealInvisibleSkills), true);
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].state.statuses.some(status =>
        status.id === 'inuzuka_kiba_dynamic_air_marking' && status.remainingTurns === 4), true);
    assert.deepEqual(computeTargetOptions({
        match, characters, actingUsername: 'p1', actorSlot: 0,
        rosterIndex: kibaIndex, skillIndex: 0,
    }).targets, []);
    queueSkill(match, 'p1', 1, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 70);
    assert.equal(computeEffectiveEnergyCost({ skill: characters[kibaIndex].skills[1], actorState: kibaState }).requiredRandom, 0);
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
    assert.deepEqual(computeTargetOptions({ match, actingUsername: 'p1', actorSlot: 0,
        skillIndex: 0, characters }).targets.map(target => target.slot), [1],
    'Female Bug cannot target its current victim');
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

test('battleLogic resolves Shikamaru draft kit behavior used by the editor data', () => {
    const match = makeMatch([getCharIndex('nara-shikamaru')], [1, 2]);
    // Clear the passive's random secret mark so only Meditate decides the targets.
    match.board.p2.forEach((unit) => {
        unit.state.statuses = unit.state.statuses.filter((status) =>
            status.id !== 'nara_shikamaru_ninja_tactics_mark');
    });

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

test('battleLogic resolves Chouji draft kit behavior used by the editor data', () => {
    const choujiIndex = getCharIndex('akimichi-chouji');
    const match = makeMatch([choujiIndex], [1]);
    const usePill = () => {
        match.board.p1[0].state.cooldowns = {};
        queueSkill(match, 'p1', 2);
        resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    };

    usePill();
    assert.equal(match.board.p1[0].hp, 85, 'Akimichi Pills should cost Chouji 15 affliction health');

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 70, 'Partial Double Size should deal 30 after one pill');

    usePill();
    usePill();
    assert.equal(match.board.p1[0].hp, 55, 'Akimichi Pills should be usable three times');
    assert.ok(match.board.p1[0].state.statuses.some((status) =>
        status.id === 'akimichi_chouji_butterfly_mode_active'));

    usePill();
    assert.equal(match.board.p1[0].hp, 55, 'Akimichi Pills should stop after three uses');
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
                status.metadata.cannotUseSkills
        ),
        true
    );
    assert.equal(match.board.p2[0].hp, 100, 'Art of the Valentine prepares the next Feint');
});

test('Rock Lee draft opens Gates on physical skills and changes costs and skills at thresholds', () => {
    const leeIndex = getCharIndex('rock-lee');
    const lee = getCharacter('rock-lee');
    const match = makeMatch([leeIndex], [1, 2, 3]);
    const actor = match.board.p1[0];
    const gate = () => actor.state.statuses.find((status) => status.id === 'rock_lee_gate_openings');
    const effective = (index) => resolveEffectiveSkill({
        characters, rosterIndex: leeIndex, skillIndex: index, actorState: actor.state,
    });
    assert.equal(lee.passive.name, 'Gate Opening');
    assert.equal(actor.state.statuses.find((status) =>
        status.id === 'rock_lee_gate_opening_trigger')?.metadata.hideTooltip, true,
    'internal Gate trigger does not appear as a raw status tooltip');
    assert.equal(actor.state.statuses.find((status) => status.metadata?.passive)?.metadata.tooltipText,
        lee.passive.description, 'the visible passive explains Gate Opening');
    const visibleStatuses = buildMatchPayloadForUser(match, 'p1').board.p1[0].state.statuses;
    assert.equal(visibleStatuses.some((status) => status.id === 'rock_lee_gate_opening_trigger'),
        false, 'the battle payload omits the internal trigger');
    assert.ok(visibleStatuses.some((status) =>
        status.metadata?.sourceSkillName === 'Gate Opening' &&
        status.metadata?.tooltipText === lee.passive.description));
    assert.deepEqual(lee.skills.slice(0, 4).map((skill) => skill.name), [
        'High Speed Taijutsu', 'Front Lotus', 'Remove Training Weights', 'Lee Dodge',
    ]);
    assert.equal(gate(), undefined);

    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(gate(), undefined, 'the strategic weights skill does not open a Gate');
    assert.equal(match.chakraPools.p1.taijutsu, 1);
    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.chakraPools.p1.taijutsu, 1,
        'training weights cannot be removed twice');

    for (let count = 1; count <= 5; count += 1) {
        if (count > 1) {
            actor.state.cooldowns = {};
        }
        queueSkill(match, 'p1', 1, [{ username: 'p2', slot: count % 3 }]);
        resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
        assert.equal(gate()?.metadata.gateCount, count);
        assert.match(gate()?.metadata.tooltipText || '', /Lee has opened \d+ Gates/);
        if (count === 3) {
            assert.deepEqual(computeEffectiveEnergyCost({
                skill: effective(0), actorState: actor.state,
            }), { reservedSpecific: { bloodline: 0, ninjutsu: 0, taijutsu: 1, genjutsu: 0 },
                requiredRandom: 0 });
        }
    }
    assert.equal(effective(0).cooldown, 0);
    assert.equal(effective(1).cooldown, 0);
    assert.equal(effective(2).id, 'rock-lee-final-lotus');
    assert.equal(actor.hp, 50, 'opening the fifth Gate costs 50 nonlethal affliction damage');
    assert.ok(actor.state.statuses.some((status) =>
        status.id === 'rock_lee_fifth_gate_invulnerable'));
    const chakraBeforeLotus = match.chakraPools.p1.taijutsu;
    queueSkill(match, 'p1', 2, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].alive, false);
    assert.equal(match.chakraPools.p1.taijutsu, chakraBeforeLotus + 2,
        'the turn grant and successful Final Lotus each add one taijutsu');
    assert.ok(actor.state.statuses.some((status) =>
        status.id === 'rock_lee_final_lotus_immortal'));
});

test('Rock Lee High Speed Taijutsu uses the first Gate and offers its random chakra follow-up', () => {
    const leeIndex = getCharIndex('rock-lee');
    const match = makeMatch([leeIndex], [1]);
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 70, 'the first Gate adds 5 to the 25 physical damage');
    assert.equal(resolveEffectiveSkill({
        characters, rosterIndex: leeIndex, skillIndex: 0,
        actorState: match.board.p1[0].state,
    }).id, 'rock-lee-high-speed-follow-up');
    assert.ok(match.board.p1[0].state.statuses.some((status) =>
        status.id === 'rock_lee_high_speed_physical_invulnerable'));
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 35,
        'the next-turn follow-up deals 25 plus the second Gate bonus');
    assert.equal(match.board.p1[0].state.statuses.find((status) =>
        status.id === 'rock_lee_gate_openings').metadata.gateCount, 2);
});

test('Remove Training Weights reduces Lee physical damage without reducing fifth Gate self damage', () => {
    const leeIndex = getCharIndex('rock-lee');
    const match = makeMatch([leeIndex], [1, 2, 3]);
    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 80, '25 base plus 5 Gate damage minus 10 from weights');
    match.board.p2[0].state.statuses.push({
        id: 'test_invulnerable', remainingTurns: 1,
        sourceUsername: 'p2', sourceSlot: 0, metadata: { invulnerable: true },
    });
    queueSkill(match, 'p1', 1, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 35,
        'Front Lotus ignores invulnerability after weights are removed');
});

test('Remove Training Weights bypasses counters and both forms of reflection', () => {
    const leeIndex = getCharIndex('rock-lee');
    const makeDefendedMatch = () => {
        const match = makeMatch([leeIndex], [1]);
        match.board.p2[0].state.statuses.push({
            id: 'test_reflecting_counter', remainingTurns: 3,
            sourceUsername: 'p2', sourceSlot: 0,
            metadata: {
                triggerOnEnemyHarmfulSkill: true, counterCancelsSkill: true,
                counterDamage: 20, reflectNextIncomingSkill: true,
                reflectBackToCaster: true, reflectDamagePercent: 100,
            },
        });
        return match;
    };
    const withoutWeights = makeDefendedMatch();
    queueSkill(withoutWeights, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match: withoutWeights, actingUsername: 'p1', characters });
    assert.equal(withoutWeights.board.p2[0].hp, 100);

    const withWeights = makeDefendedMatch();
    queueSkill(withWeights, 'p1', 2);
    resolvePendingTurnSkills({ match: withWeights, actingUsername: 'p1', characters });
    const weightedSkill = resolveEffectiveSkill({
        characters, rosterIndex: leeIndex, skillIndex: 0,
        actorState: withWeights.board.p1[0].state,
    });
    assert.equal(weightedSkill.cannotBeCountered, true);
    assert.equal(weightedSkill.cannotBeReflected, true);
    queueSkill(withWeights, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match: withWeights, actingUsername: 'p1', characters });
    assert.equal(withWeights.board.p2[0].hp, 80);
    assert.equal(withWeights.board.p1[0].hp, 100);
});

test('Tenten Dragons stacks Trap marks, and Trap consumes them after damage and class debuffs', () => {
    const match = makeMatch([getCharIndex('tenten')], [1, 2]);
    const tenten = getCharacter('tenten');
    const primary = match.board.p2[0];
    const other = match.board.p2[1];
    const status = (unit, id) => unit.state.statuses.find((entry) => entry.id === id && entry.remainingTurns > 0);

    assert.deepEqual(tenten.skills[1].classes, ['Physical', 'Instant']);
    assert.equal(tenten.skills[1].cooldown, 0);
    assert.equal(tenten.skills[2].cooldown, 1);
    assert.equal(tenten.skills[3].name, 'Spiked Boulder Wall');
    for (let castCount = 0; castCount < 2; castCount += 1) {
        queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
        resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    }
    assert.equal(primary.hp, 60);
    assert.equal(other.hp, 80);
    assert.equal(status(primary, 'tenten_twin_rising_dragons_mark').metadata.bonusDamageFromSourceSkillsFlat, 10);
    assert.equal(status(other, 'tenten_twin_rising_dragons_mark').metadata.bonusDamageFromSourceSkillsFlat, 10);
    queueSkill(match, 'p1', 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(primary.hp, 45, 'Trap deals 5 plus 10 from two marks');
    assert.equal(other.hp, 65);
    assert.equal(status(primary, 'tenten_twin_rising_dragons_mark'), undefined);
    assert.equal(status(other, 'tenten_twin_rising_dragons_mark'), undefined);
    assert.deepEqual(status(primary, 'tenten_twin_rising_dragons_trap_debuff').metadata.damageDebuffBySkillClass,
        { physical: 15, chakra: 15 });
    queueSkill(match, 'p1', 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(primary.hp, 40, 'a second Trap has no consumed mark bonus');
    assert.deepEqual(status(primary, 'tenten_twin_rising_dragons_trap_debuff').metadata.damageDebuffBySkillClass,
        { physical: 5, chakra: 5 });
});

test('Tenten Full Release protects against non-Strategic skills and enhances one harmful skill', () => {
    const match = makeMatch([getCharIndex('tenten')], [1, 2]);
    const actor = match.board.p1[0];
    const primary = match.board.p2[0];
    const status = (unit, id) => unit.state.statuses.find((entry) => entry.id === id && entry.remainingTurns > 0);

    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(isUnitInvulnerableForSkill(actor, ['Physical']), true);
    assert.equal(isUnitInvulnerableForSkill(actor, ['Chakra']), true);
    assert.equal(isUnitInvulnerableForSkill(actor, ['Strategic']), false);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.ok(status(actor, 'tenten_full_release_active'), 'the enhancement waits for a harmful skill');
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(primary.hp, 80, 'Full Release does not repeat damage');
    assert.equal(status(primary, 'tenten_twin_rising_dragons_mark').metadata.bonusDamageFromSourceSkillsFlat, 10);
    assert.equal(status(actor, 'tenten_full_release_active'), undefined);
    queueSkill(match, 'p1', 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(primary.hp, 65);
    assert.equal(status(primary, 'tenten_twin_rising_dragons_trap_debuff').remainingTurns, 1);
});

test('Tenten Full Release extends the next Trap debuff once without stacking', () => {
    const match = makeMatch([getCharIndex('tenten')], [1, 2]);
    const actor = match.board.p1[0];
    const enemy = match.board.p2[0];
    const status = (unit, id) => unit.state.statuses.find((entry) => entry.id === id && entry.remainingTurns > 0);
    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    actor.state.cooldowns = {};
    queueSkill(match, 'p1', 2);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(actor.state.statuses.filter((entry) => entry.id === 'tenten_full_release_active').length, 1);
    queueSkill(match, 'p1', 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(status(enemy, 'tenten_twin_rising_dragons_trap_debuff').remainingTurns, 2);
    assert.equal(status(actor, 'tenten_full_release_active'), undefined);
    assert.equal(enemy.hp, 95);
});

test('Sharp Tools retaliates against damaging skills but not non-damaging marks', () => {
    const match = makeMatch([getCharIndex('tenten')], [getCharIndex('inuzuka-kiba')]);
    queueSkill(match, 'p2', 0, [{ username: 'p1', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p2', characters });
    assert.equal(match.board.p2[0].hp, 100);
    queueSkill(match, 'p2', 1, [{ username: 'p1', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p2', characters });
    assert.equal(match.board.p2[0].hp, 95, 'Kiba takes 5 physical damage once for attacking Tenten');
});

test('Tenten Trap reductions lower a target’s next non-affliction attack', () => {
    const match = makeMatch([getCharIndex('tenten')], [getCharIndex('inuzuka-kiba')]);
    queueSkill(match, 'p1', 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 95);
    queueSkill(match, 'p2', 1, [{ username: 'p1', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p2', characters });
    assert.equal(match.board.p1[0].hp, 75, '30 physical damage is reduced by the 5-point Trap debuff');
    assert.equal(match.board.p2[0].hp, 90, 'Sharp Tools retaliates against the attack');
});

test('Tenten Trap also reduces Chakra damage by its base value plus Dragon marks', () => {
    const match = makeMatch([getCharIndex('tenten')], [getCharIndex('uchiha-sasuke')]);
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    queueSkill(match, 'p1', 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    const debuff = match.board.p2[0].state.statuses.find((entry) =>
        entry.id === 'tenten_twin_rising_dragons_trap_debuff');
    assert.deepEqual(debuff.metadata.damageDebuffBySkillClass, { physical: 10, chakra: 10 });
    queueSkill(match, 'p2', 1, [{ username: 'p1', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p2', characters });
    assert.equal(match.board.p1[0].hp, 90, 'Sasuke Fireball deals 20 minus 10 Chakra damage');
});

test('battleLogic resolves Neji draft damage, chakra costs, and passive', () => {
    const neji = getCharacter('neji-hyuuga');
    const match = makeMatch([getCharIndex('neji-hyuuga')], [1, 2]);
    const actor = match.board.p1[0];
    const enemy = match.board.p2[0];
    const palmCost = () => computeEffectiveEnergyCost({ skill: neji.skills[2], actorState: actor.state });
    const hasStatus = (unit, id) => unit.state.statuses.some((status) => status.id === id && status.remainingTurns > 0);
    match.chakraPools.p2.taijutsu = 2;

    assert.equal(neji.passive.name, "Neji's Byakugan");
    assert.equal(actor.state.statuses.some((status) => status.metadata.passive && status.metadata.sourceSkillName === neji.passive.name), true);
    assert.equal(neji.skills.every((skill) => skill.cannotBeCountered), true);
    assert.deepEqual(palmCost().reservedSpecific, { taijutsu: 1, ninjutsu: 0, bloodline: 1, genjutsu: 0 });
    assert.equal(palmCost().requiredRandom, 0);

    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(hasStatus(enemy, 'neji_hyuuga_neji_gentle_fist'), true);
    assert.equal(hasStatus(actor, 'neji_hyuuga_gentle_fist_palm_cost'), true);
    assert.equal(palmCost().reservedSpecific.taijutsu, 1);
    assert.equal(palmCost().reservedSpecific.bloodline, 0);
    assert.equal(palmCost().requiredRandom, 1);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(enemy.hp, 80, 'Gentle Fist deals the first 20 damage on the source turn');
    tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.equal(enemy.hp, 80, 'Gentle Fist does not tick on the enemy turn');

    enemy.state.statuses.push({
        id: 'neji_test_counter', remainingTurns: 2, sourceUsername: 'p2', sourceSlot: 0,
        metadata: { triggerOnEnemyHarmfulSkill: true, counterCancelsSkill: true },
    });
    queueSkill(match, 'p1', 2, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(enemy.hp, 45, 'Neji\'s passive lets Sixty-Four Palm deal 35 damage through a counter');
    assert.equal(match.chakraPools.p2.taijutsu, 1, 'Sixty-Four Palm removes only 1 chakra');
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(enemy.hp, 25, 'Gentle Fist deals the second 20 damage');
    assert.equal(hasStatus(actor, 'neji_hyuuga_gentle_fist_palm_cost'), false);
    assert.equal(palmCost().reservedSpecific.bloodline, 1, 'Palm returns to its base cost');

    queueSkill(match, 'p1', 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(enemy.hp, 10, 'Heavenly Spin deals 15 damage to the first enemy');
    assert.equal(match.board.p2[1].hp, 85, 'Heavenly Spin deals 15 damage to the second enemy');
    assert.equal(hasStatus(actor, 'neji_hyuuga_heavenly_spin'), true);
    assert.equal(actor.state.statuses.find((status) => status.id === 'neji_hyuuga_heavenly_spin').metadata.invulnerable, true);
    assert.equal(palmCost().reservedSpecific.bloodline, 1);
    assert.equal(palmCost().reservedSpecific.taijutsu, 0);
    assert.equal(palmCost().requiredRandom, 1);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(hasStatus(actor, 'neji_hyuuga_heavenly_spin'), true);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(hasStatus(actor, 'neji_hyuuga_heavenly_spin'), false);
    assert.equal(palmCost().requiredRandom, 0);
});

test('battleLogic resolves Gaara Sand Binding Coffin from the editor data', () => {
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
        'gaara-of-the-desert-sand-binding-coffin'
    );
    assert.equal(
        match.board.p2[0].state.statuses.some(
            (status) => status.id === 'gaara_sand_binding_coffin_stun' && status.metadata.cannotUseSkills
        ),
        true
    );
    assert.equal(match.board.p1[0].state.statuses.find(
        (status) => status.id === 'gaara_of_the_desert_sand_flow'
    ).metadata.sandFlowStacks, 2);
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

test('Shigure Sprinkling Needles description matches its turn damage value', () => {
    const shigure = getCharacter('shigure');
    const sprinklingNeedles = shigure.skills.find((skill) => skill.id === 'shigure-sprinkling-needles');
    const damageStatus = sprinklingNeedles.effects.find(
        (effect) => effect.statusId === 'shigure_sprinkling_needles'
    );

    assert.equal(damageStatus.metadata.turnEndDamage, 10);
    assert.match(sprinklingNeedles.skilldescription, /10 physical damage/);
    assert.match(damageStatus.metadata.tooltipText, /10 physical damage/);
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
    assert.equal(match.board.p2.reduce((sum, unit) => sum + unit.hp, 0), 175,
        'Cutting Whirlwind deals 15 and 5 piercing damage, plus two 5-damage Phantom Gale hits');
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

test('Shino Infestation cannot target an already infested enemy', () => {
    const match = makeMatch([getCharIndex('aburame-shino')],
        [getCharIndex('haruno-sakura'), getCharIndex('uchiha-sasuke')]);
    queueSkill(match, 'p1', 2, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    const options = computeTargetOptions({
        match, actingUsername: 'p1', actorSlot: 0, skillIndex: 2, characters,
    });
    assert.deepEqual(options.targets.map((target) => target.slot), [1]);
    assert.equal(validateTargetSelection(options, [{ username: 'p2', slot: 0 }]), false);
    assert.equal(validateTargetSelection(options, [{ username: 'p2', slot: 1 }]), true);
    assert.match(characters[getCharIndex('aburame-shino')].skills[2].skilldescription,
        /not already affected by Infestation/);
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
    const team = [getCharIndex('aburame-shino'), getCharIndex('uzumaki-naruto')];
    const palms = 2;
    const match = makeMatch(team, [getCharIndex('neji-hyuuga')]);
    match.chakraPools.p1.taijutsu = 2;
    queueSkill(match, 'p2', palms, [{ username: 'p1', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p2', characters });
    assert.equal(match.chakraPools.p1.taijutsu, 2, 'targeting Shino cannot remove chakra');
    match.board.p2[0].state.cooldowns = {};
    queueSkill(match, 'p2', palms, [{ username: 'p1', slot: 1 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p2', characters });
    assert.equal(match.chakraPools.p1.taijutsu, 1, 'the passive does not protect other allies');

    const stealMatch = makeMatch(team, [getCharIndex('aburame-shino-s')]);
    stealMatch.chakraPools.p1.taijutsu = 2;
    stealMatch.board.p1[0].state.statuses.push({ id: 'aburame_shino_s_insect_swarm_dot', remainingTurns: 1,
        sourceUsername: 'p2', sourceSlot: 0, metadata: { harmful: true } });
    queueSkill(stealMatch, 'p2', 4, [{ username: 'p1', slot: 0 }]);
    resolvePendingTurnSkills({ match: stealMatch, actingUsername: 'p2', characters });
    assert.equal(stealMatch.chakraPools.p1.taijutsu, 2, 'targeting Shino cannot steal chakra');
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

test('Hinata 64 Palms damages enemies, heals allies, and grants damage reduction', () => {
    const match = makeMatch([getCharIndex('hyuuga-hinata'), getCharIndex('rock-lee')],
        [getCharIndex('haruno-sakura'), getCharIndex('uchiha-sasuke')]);
    applyDamageToUnit(match.board.p1[1], 60, { match, sourceUsername: 'p2',
        targetUsername: 'p1', targetSlot: 1 });
    match.board.p1[0].hp = 70;
    queueSkill(match, 'p1', 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.deepEqual(match.board.p2.map(unit => unit.hp), [95, 95]);
    assert.deepEqual(match.board.p1.map(unit => unit.hp), [75, 45]);
    assert.equal(match.board.p1[0].state.statuses.find(status =>
        status.id === 'hyuuga_hinata_64_palms_reduction')?.metadata.damageReductionFlat, 5);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    queueSkill(match, 'p1', 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.deepEqual(match.board.p2.map(unit => unit.hp), [85, 85]);
    assert.deepEqual(match.board.p1.map(unit => unit.hp), [85, 55]);
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
        assert.equal(naruto.hp, 65 + turn * 5, 'enemy turn must not trigger ointment');
        tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
        assert.equal(naruto.hp, 70 + turn * 5, 'Hinata team turn heals once');
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

test('Meditate can mark an unmarked enemy immediately and Water Assault costs only Ninjutsu', () => {
    const match = makeMatch([getCharIndex('nara-shikamaru')], [1, 2]);
    const unmarkedSlot = match.board.p2.findIndex((unit) => !unit.state.statuses.some((status) =>
        status.id === 'nara_shikamaru_ninja_tactics_mark'));
    queueSkill(match, 'p1', 0, [{ username: 'p2', slot: unmarkedSlot }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[unmarkedSlot].state.statuses.some((status) =>
        status.id === 'nara_shikamaru_meditate'), true);
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
