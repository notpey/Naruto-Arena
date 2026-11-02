// Clan war rulesets and the team check the server runs before every war
// battle. Combat itself is untouched; this only decides whether a team may
// enter a war battle under the rules both clans agreed to.

const { ARCHETYPE_DEFINITIONS } = require('./warArchetypes');

const TEAM_SIZE = 3;
const NO_REPEAT_SCOPES = ['none', 'set', 'war'];
const MAX_BANNED_CHARACTERS = 100;
const MAX_BANNED_COMBINATIONS = 50;

const fail = (strict, message) => {
    if (strict) throw new Error(message);
    return null;
};

const normalizeCharacterId = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const uniqueIds = (values) => {
    const ids = [];
    for (const value of Array.isArray(values) ? values : []) {
        const id = normalizeCharacterId(value);
        if (id && !ids.includes(id)) ids.push(id);
    }
    return ids;
};

const normalizeCombination = (value, strict) => {
    const ids = uniqueIds(value);
    if (ids.length < 2 || ids.length > TEAM_SIZE) {
        return fail(strict, `A banned combination must list 2 or ${TEAM_SIZE} different characters.`);
    }
    return ids.sort();
};

const normalizeArchetypeLimit = (value, strict) => {
    const tag = typeof value?.tag === 'string' ? value.tag.trim() : '';
    if (!ARCHETYPE_DEFINITIONS[tag]) {
        return fail(strict, `Unknown character type "${tag}".`);
    }
    const max = Number(value?.max);
    if (!Number.isInteger(max) || max < 0 || max >= TEAM_SIZE) {
        return fail(strict, `The limit for ${ARCHETYPE_DEFINITIONS[tag].label} must be between 0 and ${TEAM_SIZE - 1}.`);
    }
    return { tag, max };
};

// Returns a clean ruleset. With `strict`, invalid input throws a message that
// can be shown to the Clan Leader instead of being silently dropped.
const normalizeWarRuleset = (input, { strict = false } = {}) => {
    const source = input && typeof input === 'object' ? input : {};

    const bannedCharacterIds = uniqueIds(source.bannedCharacterIds);
    if (bannedCharacterIds.length > MAX_BANNED_CHARACTERS) {
        fail(strict, `A war can ban at most ${MAX_BANNED_CHARACTERS} characters.`);
        bannedCharacterIds.length = MAX_BANNED_CHARACTERS;
    }

    const bannedCombinations = [];
    for (const entry of Array.isArray(source.bannedCombinations) ? source.bannedCombinations : []) {
        const combination = normalizeCombination(entry, strict);
        if (!combination) continue;
        const key = combination.join('|');
        if (!bannedCombinations.some((existing) => existing.join('|') === key)) {
            bannedCombinations.push(combination);
        }
    }
    if (bannedCombinations.length > MAX_BANNED_COMBINATIONS) {
        fail(strict, `A war can ban at most ${MAX_BANNED_COMBINATIONS} combinations.`);
        bannedCombinations.length = MAX_BANNED_COMBINATIONS;
    }

    // When a type is listed twice, the stricter limit wins.
    const limitsByTag = new Map();
    for (const entry of Array.isArray(source.archetypeLimits) ? source.archetypeLimits : []) {
        const limit = normalizeArchetypeLimit(entry, strict);
        if (!limit) continue;
        const existing = limitsByTag.get(limit.tag);
        if (!existing || limit.max < existing.max) limitsByTag.set(limit.tag, limit);
    }

    let noRepeatScope = typeof source.noRepeatScope === 'string' ? source.noRepeatScope.trim() : 'none';
    if (!NO_REPEAT_SCOPES.includes(noRepeatScope)) {
        fail(strict, 'Character repeat rule must be none, set, or war.');
        noRepeatScope = 'none';
    }

    return {
        bannedCharacterIds,
        bannedCombinations,
        archetypeLimits: Array.from(limitsByTag.values()),
        noRepeatScope,
    };
};

const describeCharacter = (snapshot, characterId) => snapshot?.characters?.[characterId]?.name || characterId;

// Checks one team against a war's locked ruleset and archetype snapshot.
// `usedCharacterIds` lists characters this player already used in the scope
// named by the ruleset's noRepeatScope (this set, or this war); the caller
// collects that history. Returns every violation so the team picker can show
// them all at once.
const validateWarTeam = ({ ruleset, team, archetypeSnapshot, usedCharacterIds = [] } = {}) => {
    const rules = normalizeWarRuleset(ruleset);
    const teamIds = uniqueIds(team);
    const violations = [];
    const name = (id) => describeCharacter(archetypeSnapshot, id);

    if (!Array.isArray(team) || team.length !== TEAM_SIZE || teamIds.length !== TEAM_SIZE) {
        violations.push({
            code: 'invalid-team',
            characterIds: teamIds,
            message: `A war team needs ${TEAM_SIZE} different characters.`,
        });
        return { valid: false, violations };
    }

    for (const id of teamIds) {
        if (rules.bannedCharacterIds.includes(id)) {
            violations.push({
                code: 'banned-character',
                characterIds: [id],
                message: `${name(id)} is banned in this war.`,
            });
        }
    }

    for (const combination of rules.bannedCombinations) {
        if (combination.every((id) => teamIds.includes(id))) {
            violations.push({
                code: 'banned-combination',
                characterIds: combination,
                message: `${combination.map(name).join(' + ')} is a banned combination in this war.`,
            });
        }
    }

    if (rules.archetypeLimits.length > 0) {
        // A character released after the war was accepted has no locked
        // classification, so it cannot be checked against type limits.
        const unclassified = teamIds.filter((id) => !archetypeSnapshot?.characters?.[id]);
        for (const id of unclassified) {
            violations.push({
                code: 'unclassified-character',
                characterIds: [id],
                message: `${name(id)} was not available when this war began and cannot be used in it.`,
            });
        }

        for (const { tag, max } of rules.archetypeLimits) {
            const matching = teamIds.filter((id) => archetypeSnapshot?.characters?.[id]?.tags?.includes(tag));
            if (matching.length <= max) continue;
            const label = ARCHETYPE_DEFINITIONS[tag].label;
            const details = matching
                .map((id) => {
                    const sources = archetypeSnapshot.characters[id].reasons?.[tag] || [];
                    return sources.length > 0 ? `${name(id)} (${sources.join(', ')})` : name(id);
                })
                .join(', ');
            violations.push({
                code: 'archetype-limit',
                tag,
                characterIds: matching,
                message:
                    max === 0
                        ? `${label} characters are not allowed in this war: ${details}.`
                        : `Teams may include at most ${max} ${label} character${max === 1 ? '' : 's'} in this war: ${details}.`,
            });
        }
    }

    if (rules.noRepeatScope !== 'none') {
        const used = uniqueIds(usedCharacterIds);
        const scopeLabel = rules.noRepeatScope === 'set' ? 'this set' : 'this war';
        for (const id of teamIds) {
            if (used.includes(id)) {
                violations.push({
                    code: 'repeated-character',
                    characterIds: [id],
                    message: `You already used ${name(id)} in ${scopeLabel}.`,
                });
            }
        }
    }

    return { valid: violations.length === 0, violations };
};

module.exports = {
    TEAM_SIZE,
    NO_REPEAT_SCOPES,
    normalizeWarRuleset,
    validateWarTeam,
};
