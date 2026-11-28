// Character Builder checks: reads a character the way the battle engine will and explains, in
// plain words, anything that would not work. Shared by the ACP Character Editor (live, as admins
// edit) and the server (when a character is saved). It never changes the character.
//
// checkCharacter(character, { catalog, roster }) -> [{ level: 'error' | 'warning', where, message }]
// "error" means the engine will ignore or misread something; "warning" means it works but is
// probably not what was meant.
(function (root, factory) {
    const api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.CharacterBuilderChecks = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
    'use strict';

    const CHARACTER_KEYS = ['id', 'characterId', 'name', 'facePicture', 'characterdeescription', 'skills', 'passive',
        'tags', 'startStatuses', 'requiredMissionId', 'retired', 'arc'];
    const SKILL_KEYS_ALWAYS = ['id'];
    const EFFECT_KEYS_ALWAYS = ['type', 'metadata'];
    const STATUS_SPEC_KEYS = ['statusId', 'duration', 'fresh', 'metadata', 'scope', 'type'];
    // Settings the engine sets on statuses itself; harmless if present in data.
    const RUNTIME_STATUS_KEYS = ['passive', 'stacks', 'stackable', 'maxStacks'];

    function checkCharacter(character, options) {
        const catalog = (options && options.catalog) || {};
        const roster = (options && options.roster) || [];
        const issues = [];
        const add = (level, where, message) => issues.push({ level, where, message });
        if (!character || typeof character !== 'object') return [{ level: 'error', where: 'Character', message: 'There is no character to check.' }];

        const effectTypes = catalog.effectTypes || {};
        const effectSettings = catalog.effectSettings || {};
        const statusSettings = catalog.statusSettings || {};
        const skillFields = catalog.skillFields || {};
        const conditionChecks = catalog.conditionChecks || {};
        const conditionOutcomes = catalog.conditionOutcomes || {};
        const passiveFields = catalog.passiveFields || {};
        const questFields = catalog.questFields || {};
        const vocab = catalog.vocabulary || {};
        const scopeIds = new Set((vocab.EFFECT_SCOPES || []).map((entry) => entry.id));
        const targetIds = new Set((vocab.SKILL_TARGETS || []).map((entry) => entry.id));
        const classIds = new Set((vocab.SKILL_CLASSES || []).map((entry) => entry.id.toLowerCase()).concat(['energy']));
        const ignoredSkillFields = new Set(catalog.ignoredSkillFields || []);
        const triggeredTypes = Object.keys(effectTypes).filter((type) => effectTypes[type].triggered);
        const labelOfType = (type) => (effectTypes[type] && effectTypes[type].label) || type;
        const labelOfSetting = (key) => (statusSettings[key] && statusSettings[key].label) ||
            (effectSettings[key] && effectSettings[key].label) || key;

        // ------------------------------------------------------------ references
        const ownSkillIds = new Set((character.skills || []).map((skill) => skill && skill.id).filter(Boolean));
        const rosterSkillIds = new Set();
        const rosterCharacterIds = new Set();
        roster.forEach((entry) => {
            if (!entry) return;
            rosterCharacterIds.add(entry.characterId);
            (entry.skills || []).forEach((skill) => skill && skill.id && rosterSkillIds.add(skill.id));
        });
        const producedHere = new Set(catalog.builtInStatusIds || ['invulnerable', 'stunned']);
        const statusRefs = [];
        const skillRefs = [];
        const produce = (statusId) => { if (typeof statusId === 'string' && statusId) producedHere.add(statusId); };
        const referStatus = (statusId, where) => { if (typeof statusId === 'string' && statusId) statusRefs.push({ statusId, where }); };
        const referSkill = (skillId, where) => { if (typeof skillId === 'string' && skillId) skillRefs.push({ skillId, where }); };
        if (character.passive && character.passive.name) {
            produce(`${character.characterId || ''}_${character.passive.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''));
        }

        // ------------------------------------------------------------ value kinds
        // Checks one value against the catalog kind it should have, recording references.
        function checkKind(kind, value, where, field) {
            if (value === undefined || value === null) return;
            switch (kind) {
                case 'statusId':
                    if (field && field.defines) produce(value); else referStatus(value, where);
                    break;
                case 'statusIds':
                    (Array.isArray(value) ? value : []).forEach((id) => referStatus(id, where));
                    break;
                case 'skillId':
                    referSkill(value, where);
                    break;
                case 'skillIds':
                    (Array.isArray(value) ? value : []).forEach((id) => referSkill(id, where));
                    break;
                case 'skillMap': case 'skillCostMap': case 'skillTargetMap':
                    if (value && typeof value === 'object') Object.keys(value).forEach((id) => referSkill(id, where));
                    break;
                case 'skillSwapMap':
                    if (value && typeof value === 'object') {
                        Object.entries(value).forEach(([from, to]) => {
                            referSkill(from, where);
                            referSkill(to, where);
                            const target = (character.skills || []).find((skill) => skill && skill.id === to);
                            if (target && !target.hiddenFromSelectionViewer) {
                                add('warning', where, `"${target.name || to}" is swapped in by a status but isn't marked as an alternate skill, so players will also see it as a normal skill.`);
                            }
                        });
                    }
                    break;
                case 'classes':
                    (Array.isArray(value) ? value : []).forEach((name) => {
                        const id = String(name || '').trim().toLowerCase();
                        if (id && !id.endsWith('*') && !classIds.has(id)) add('warning', where, `"${name}" isn't a class the engine knows, so class checks will never match it.`);
                    });
                    break;
                case 'classMap':
                    if (value && typeof value === 'object') checkKind('classes', Object.keys(value), where);
                    break;
                case 'characterId':
                    if (typeof value === 'string' && value && !rosterCharacterIds.has(value) && value !== character.characterId) {
                        add('warning', where, `There's no character with the id "${value}".`);
                    }
                    break;
                case 'characterIds':
                    (Array.isArray(value) ? value : []).forEach((id) => checkKind('characterId', id, where));
                    break;
                case 'effects':
                    (Array.isArray(value) ? value : []).forEach((effect, index) =>
                        checkEffect(effect, `${where} › effect ${index + 1}`, { triggered: true }));
                    break;
                case 'status':
                    checkStatusSpec(value, where);
                    break;
                case 'statusList':
                    (Array.isArray(value) ? value : []).forEach((spec, index) => checkStatusSpec(spec, `${where} ${index + 1}`));
                    break;
                case 'statusSettings':
                    checkStatusSettings(value, where);
                    break;
                case 'object':
                    if (field && field.fields && value && typeof value === 'object') checkFields(field.fields, value, where);
                    break;
                case 'list':
                    if (field && field.item && Array.isArray(value)) value.forEach((entry, index) => checkFields(field.item, entry, `${where} ${index + 1}`));
                    break;
                case 'condition':
                    checkCondition(value, where);
                    break;
                default:
                    break;
            }
        }
        function checkFields(fields, value, where) {
            if (!value || typeof value !== 'object') return;
            Object.entries(fields).forEach(([key, field]) => {
                if (field.required && (value[key] === undefined || value[key] === null || value[key] === '')) {
                    add('error', where, `${field.label || key} is required.`);
                }
                checkKind(field.kind, value[key], `${where} › ${field.label || key}`, field);
            });
        }

        // ------------------------------------------------------------ conditions
        function checkCondition(condition, where) {
            if (!condition || typeof condition !== 'object') return;
            Object.entries(condition).forEach(([key, value]) => {
                if (key === 'all') {
                    (Array.isArray(value) ? value : []).forEach((entry, index) => checkCondition(entry, `${where} › part ${index + 1}`));
                    return;
                }
                if (key === 'statusMetadataAtLeast' || key === 'statusMetadataEquals') {
                    referStatus(value && value.statusId, where);
                    return;
                }
                if (key === 'sourceSkillUsesAtLeast' || key === 'sourceSkillUsesAtMost') {
                    referSkill(value && value.skillId, where);
                    return;
                }
                const check = conditionChecks[key] || conditionOutcomes[key];
                if (!check) {
                    add('error', where, `"${key}" isn't a condition the engine checks, so it is ignored.`);
                    return;
                }
                checkKind(check.kind, value, where, check);
            });
        }

        // ------------------------------------------------------------ statuses
        function checkStatusSpec(spec, where) {
            if (!spec || typeof spec !== 'object') return;
            if (!spec.statusId) add('error', where, 'The status needs a name (id).');
            produce(spec.statusId);
            if (spec.duration !== undefined && !(Number(spec.duration) >= 1)) add('error', where, 'The status needs at least 1 turn.');
            Object.keys(spec).forEach((key) => {
                if (!STATUS_SPEC_KEYS.includes(key)) add('warning', where, `"${key}" isn't read on a status here.`);
            });
            checkStatusSettings(spec.metadata, `${where} (${spec.statusId || 'status'})`);
        }
        function checkStatusSettings(metadata, where, place) {
            if (!metadata || typeof metadata !== 'object') return;
            // A quest reward with a "completed" tooltip shows that on the passive instead of its own row.
            const visible = !metadata.hideTooltip && (metadata.helpful || metadata.harmful) && !(place && place.tooltipShownElsewhere);
            if (visible && !metadata.tooltipText && !metadata.tooltipTextTemplate) {
                add('warning', where, 'Players will see this status, but it has no tooltip.');
            }
            Object.entries(metadata).forEach(([key, value]) => {
                const setting = statusSettings[key];
                if (setting) {
                    checkKind(setting.kind, value, `${where} › ${setting.label}`, setting);
                    return;
                }
                if (RUNTIME_STATUS_KEYS.includes(key)) return;
                if (key === metadata.stackMetadataKey) return; // the counter's own value
                if (metadata.stackDerivedNumericKeys && Object.prototype.hasOwnProperty.call(metadata.stackDerivedNumericKeys, key)) return;
                if (effectSettings[key] && effectSettings[key].anyEffect && place && place.onEffect) return;
                if (effectSettings[key]) {
                    add('warning', where, `"${labelOfSetting(key)}" is a setting for damage effects; on a status it does nothing.`);
                    return;
                }
                add('warning', where, `"${key}" isn't a status setting the builder knows. The engine may not read it, so test it before going live.`);
            });
        }

        // ------------------------------------------------------------ effects
        function checkEffect(effect, where, context) {
            if (!effect || typeof effect !== 'object') {
                add('error', where, 'This effect is empty.');
                return;
            }
            const type = effect.type;
            const definition = effectTypes[type];
            if (!definition) {
                add('error', where, `"${type}" isn't an effect the engine knows, so it does nothing.`);
                return;
            }
            const label = `${where} (${definition.label})`;
            if (context.triggered && !definition.triggered) {
                add('error', label, `${definition.label} doesn't work inside a status's triggered effects. Only these do: ${triggeredTypes.map(labelOfType).join(', ')}.`);
            }
            if (effect.scope !== undefined && !scopeIds.has(effect.scope)) {
                add('error', label, `"${effect.scope}" isn't a recipient the engine knows; it would hit the chosen target instead.`);
            }
            const fields = definition.fields || {};
            Object.entries(fields).forEach(([key, field]) => {
                if (field.required && (effect[key] === undefined || effect[key] === null || effect[key] === '')) {
                    add('error', label, `${field.label} is required.`);
                }
                if (key !== 'scope' && key !== 'condition') checkKind(field.kind, effect[key], label, field);
            });
            if (effect.condition) checkCondition(effect.condition, `${label} › condition`);
            Object.keys(effect).forEach((key) => {
                if (EFFECT_KEYS_ALWAYS.includes(key) || fields[key]) return;
                if (key === 'scope') return; // harmless where the effect has a fixed recipient
                if (key === 'condition') {
                    add('error', label, `${definition.label} effects ignore conditions, so this always happens. Put the condition on a status or use a different effect.`);
                    return;
                }
                add('warning', label, `"${key}" isn't read on this kind of effect.`);
            });
            if (type === 'apply_status') {
                checkStatusSettings(effect.metadata, `${label} › ${effect.statusId || 'status'}`, { onEffect: true });
                return;
            }
            const allowed = Array.isArray(definition.settings) ? definition.settings : [];
            Object.entries(effect.metadata || {}).forEach(([key, value]) => {
                if (key === 'tooltipText' || key === 'tooltipTextTemplate') return;
                if (!allowed.includes(key) && !(effectSettings[key] && effectSettings[key].anyEffect)) {
                    add('warning', label, `"${labelOfSetting(key)}" does nothing on ${definition.label.toLowerCase()} effects.`);
                    return;
                }
                const setting = effectSettings[key];
                if (setting) checkKind(setting.kind, value, `${label} › ${setting.label}`, setting);
            });
        }

        // ------------------------------------------------------------ skills
        (character.skills || []).forEach((skill, index) => {
            const where = `Skill ${index + 1}${skill && skill.name ? ` (${skill.name})` : ''}`;
            if (!skill || typeof skill !== 'object') return;
            if (skill.target && !targetIds.has(skill.target)) add('error', where, `"${skill.target}" isn't a target the engine knows.`);
            Object.keys(skill).forEach((key) => {
                if (SKILL_KEYS_ALWAYS.includes(key) || ignoredSkillFields.has(key)) return;
                const field = skillFields[key];
                if (!field) {
                    add('warning', where, `"${key}" isn't a skill rule the engine reads.`);
                    return;
                }
                if (key === 'effects') return;
                if (key === 'targetCondition' || key === 'actorCondition') {
                    checkCondition(skill[key], `${where} › ${field.label}`);
                    return;
                }
                checkKind(field.kind, skill[key], `${where} › ${field.label}`, field);
            });
            (skill.effects || []).forEach((effect, effectIndex) => checkEffect(effect, `${where} › effect ${effectIndex + 1}`, { triggered: false }));
            checkDescription(skill, where);
        });

        // A description that never mentions a damage or heal amount the skill deals is likely stale.
        function checkDescription(skill, where) {
            const text = String(skill.skilldescription || '');
            if (!text) {
                add('warning', where, 'The skill has no description.');
                return;
            }
            (skill.effects || []).forEach((effect) => {
                if (!effect || !['damage', 'heal', 'health_steal_damage'].includes(effect.type)) return;
                if (effect.condition) return; // situational amounts are often described in words
                const amount = Number(effect.amount);
                if (amount > 0 && !new RegExp(`\\b${amount}\\b`).test(text)) {
                    add('warning', where, `The description never mentions ${amount}, but the skill ${effect.type === 'heal' ? 'heals' : 'deals'} ${amount}. Check it still matches.`);
                }
            });
        }

        // ------------------------------------------------------------ passive and starting statuses
        if (character.passive && typeof character.passive === 'object') {
            const passive = character.passive;
            const counterNames = [passive.stackMetadataKey, passive.onDamageStackMetadataKey, passive.onUndamagedTurnStackMetadataKey]
                .concat(Object.keys(passive.stackCapsByKey || {})).filter(Boolean);
            Object.entries(passive).forEach(([key, value]) => {
                const where = `Passive (${passive.name || 'unnamed'})`;
                if (key === 'awakening') return;
                const field = passiveFields[key];
                if (field) {
                    checkKind(field.kind, value, `${where} › ${field.label}`, field);
                    return;
                }
                if (counterNames.includes(key) || key === 'stackMetadataKey' || key === 'growPerTurn') return;
                if (key === 'deadAllyDamageBonus' && passive.damageBonusPerDeadAlly) return; // its starting value
                if (statusSettings[key]) {
                    add('error', where, `"${statusSettings[key].label}" doesn't work on a passive. Put it on a Starting status instead.`);
                    return;
                }
                add('warning', where, `"${key}" isn't something a passive reads.`);
            });
            const quest = passive.awakening;
            if (quest && typeof quest === 'object') {
                const where = 'Quest';
                if (!quest.afterOwnerSkillUses && !quest.afterOwnerTurns && !quest.allyHpBelow && !(quest.allyCharacterIdsAny || []).length) {
                    add('error', where, 'The quest has no goal, so it can never be completed.');
                }
                Object.entries(quest).forEach(([key, value]) => {
                    if (key === 'metadata') {
                        checkStatusSettings(value, `${where} › Reward`, { tooltipShownElsewhere: Boolean(quest.completedTooltipText) });
                        return;
                    }
                    const field = questFields[key];
                    if (!field) {
                        add('warning', where, `"${key}" isn't something a quest reads.`);
                        return;
                    }
                    checkKind(field.kind, value, `${where} › ${field.label}`, field);
                });
                if (quest.afterOwnerSkillUses && quest.progressTooltipTextTemplate && !/\{awakeningSkillUses\}/.test(quest.progressTooltipTextTemplate)) {
                    add('warning', where, 'The in-progress tooltip doesn\'t show progress. Add {awakeningSkillUses} where the count should appear.');
                }
            }
        }
        checkKind('statusList', character.startStatuses, 'Starting status');

        // ------------------------------------------------------------ resolve references
        const producedOnRoster = new Set();
        roster.forEach((entry) => {
            if (!entry || entry.characterId === character.characterId) return;
            JSON.stringify(entry, (key, value) => {
                if (key === 'statusId' && typeof value === 'string') producedOnRoster.add(value);
                return value;
            });
        });
        const seenStatus = new Set();
        statusRefs.forEach(({ statusId, where }) => {
            if (producedHere.has(statusId) || producedOnRoster.has(statusId) || seenStatus.has(`${statusId}|${where}`)) return;
            seenStatus.add(`${statusId}|${where}`);
            add('warning', where, `Nothing applies a status named "${statusId}", so this can never find it. Check the spelling.`);
        });
        const seenSkill = new Set();
        skillRefs.forEach(({ skillId, where }) => {
            if (ownSkillIds.has(skillId) || seenSkill.has(`${skillId}|${where}`)) return;
            seenSkill.add(`${skillId}|${where}`);
            if (rosterSkillIds.has(skillId)) {
                add('warning', where, `"${skillId}" is another character's skill. That's fine if intended; otherwise check the id.`);
            } else {
                add('error', where, `There's no skill with the id "${skillId}".`);
            }
        });
        return issues;
    }

    return { checkCharacter };
});
