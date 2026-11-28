// Character Builder catalog: everything the battle engine can do, described for admins.
// The ACP Character Editor builds its forms and checks from this. See the files beside this one.
const vocabulary = require('./vocabulary');
const { EFFECT_TYPES, EFFECT_SETTINGS } = require('./effects');
const { SKILL_FIELDS, IGNORED_SKILL_FIELDS, CONDITION_CHECKS, CONDITION_OUTCOMES, CONDITION_PLACES, TARGET_ONLY_CHECKS } = require('./skillsAndConditions');
const { STATUS_GROUPS, STATUS_SETTINGS } = require('./statusSettings');
const { CHARACTER_FIELDS, PASSIVE_FIELDS, QUEST_FIELDS } = require('./passives');

const CATALOG_VERSION = 1;

// Statuses the engine itself creates, which conditions may check without any skill applying them.
const BUILT_IN_STATUS_IDS = ['invulnerable', 'stunned'];

const baseCatalog = Object.freeze({
    version: CATALOG_VERSION,
    vocabulary,
    effectTypes: EFFECT_TYPES,
    effectSettings: EFFECT_SETTINGS,
    skillFields: SKILL_FIELDS,
    ignoredSkillFields: IGNORED_SKILL_FIELDS,
    conditionChecks: { ...CONDITION_CHECKS, ...TARGET_ONLY_CHECKS },
    conditionOutcomes: CONDITION_OUTCOMES,
    conditionPlaces: CONDITION_PLACES,
    statusGroups: STATUS_GROUPS,
    statusSettings: STATUS_SETTINGS,
    characterFields: CHARACTER_FIELDS,
    passiveFields: PASSIVE_FIELDS,
    questFields: QUEST_FIELDS,
    builtInStatusIds: BUILT_IN_STATUS_IDS,
});

// Where each setting and effect type is used on the live roster, so the editor can say
// "used by Naruto, Sakura" and offer real examples. Computed from live data, never stored.
function collectUsage(roster = []) {
    const usage = { effectTypes: {}, statusSettings: {}, effectSettings: {}, skillFields: {}, passiveFields: {}, questFields: {} };
    const note = (bucket, key, characterId) => {
        if (!bucket[key]) bucket[key] = [];
        if (!bucket[key].includes(characterId)) bucket[key].push(characterId);
    };
    const visitStatusSettings = (metadata, characterId) => {
        if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return;
        Object.entries(metadata).forEach(([key, value]) => {
            if (STATUS_SETTINGS[key]) note(usage.statusSettings, key, characterId);
            else if (EFFECT_SETTINGS[key]) note(usage.effectSettings, key, characterId);
            visitAny(value, characterId);
        });
    };
    const visitAny = (value, characterId) => {
        if (Array.isArray(value)) return value.forEach((entry) => visitAny(entry, characterId));
        if (!value || typeof value !== 'object') return;
        if (typeof value.type === 'string') note(usage.effectTypes, value.type, characterId);
        if (value.metadata) visitStatusSettings(value.metadata, characterId);
        Object.entries(value).forEach(([key, entry]) => { if (key !== 'metadata') visitAny(entry, characterId); });
    };
    (Array.isArray(roster) ? roster : []).forEach((character) => {
        const characterId = character?.characterId;
        if (!characterId || character.retired) return;
        (character.skills || []).forEach((skill) => {
            Object.keys(skill || {}).forEach((key) => { if (SKILL_FIELDS[key]) note(usage.skillFields, key, characterId); });
            visitAny(skill?.effects, characterId);
        });
        if (character.passive) {
            Object.keys(character.passive).forEach((key) => { if (PASSIVE_FIELDS[key]) note(usage.passiveFields, key, characterId); });
            Object.keys(character.passive.awakening || {}).forEach((key) => note(usage.questFields, key, characterId));
            visitAny(character.passive, characterId);
        }
        visitAny(character.startStatuses, characterId);
    });
    return usage;
}

function getBuilderCatalog(roster) {
    return { ...baseCatalog, usage: collectUsage(roster) };
}

module.exports = { getBuilderCatalog, collectUsage, baseCatalog, BUILT_IN_STATUS_IDS, CATALOG_VERSION };
