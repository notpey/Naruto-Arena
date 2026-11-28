'use strict';

// Turns a Character Creator concept (free-form ideas: names, descriptions, costs, notes) into a
// Character Editor draft: a character skeleton the engine can read, with the mechanics left for
// the builder. Concept notes are kept beside the draft, not inside the character.
const { SKILL_CLASSES, SKILL_TARGETS } = require('../data/builder/vocabulary');

const CHAKRA_ORDER = [['taijutsu', 'Taijutsu'], ['bloodline', 'Bloodline'], ['ninjutsu', 'Ninjutsu'], ['genjutsu', 'Genjutsu'], ['random', 'Random']];

const slug = (value) => String(value || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Free-text targets as concepts tend to write them, most specific first.
const TARGET_PATTERNS = [
    [/self\s*(or|\/)\s*(one\s+|an?\s+|single\s+)?all(y|ies)/, 'self-or-single-ally'],
    [/self\s*(or|\/)\s*(one\s+|an?\s+|single\s+)?enem/, 'self-or-single-enemy'],
    [/all\s+(the\s+)?enem|every\s+enem|enemy\s+team|aoe/, 'all-enemy'],
    [/all\s+(the\s+)?all(y|ies)|whole\s+team|every\s+all|team(mates)?$/, 'all-allies'],
    [/(one|an?|single)\s+all(y|ies)|^all(y|ies)$/, 'single-ally'],
    [/any(one)?\s+(one\s+)?(character|target)/, 'single-target'],
    [/^self$|^user$|^himself$|^herself$|^themself$|^themselves$|^caster$/, 'self'],
    [/enem/, 'single-enemy'],
];

function matchTarget(text) {
    const value = String(text || '').trim().toLowerCase();
    if (!value) return null;
    if (SKILL_TARGETS.some((target) => target.id === value)) return value;
    const found = TARGET_PATTERNS.find(([pattern]) => pattern.test(value));
    return found ? found[1] : null;
}

function matchClasses(text) {
    const known = new Map(SKILL_CLASSES.map((entry) => [entry.id.toLowerCase(), entry.id]));
    const matched = [];
    const unknown = [];
    String(text || '').split(/[,/·;|]+/).map((entry) => entry.trim()).filter(Boolean).forEach((entry) => {
        const starred = entry.endsWith('*');
        const base = entry.replace(/\*+$/, '').trim().toLowerCase();
        const id = known.get(base === 'energy' ? 'chakra' : base);
        if (id) matched.push(starred ? `${id}*` : id);
        else unknown.push(entry);
    });
    return { matched: [...new Set(matched)], unknown };
}

function energyFromCost(cost) {
    const energy = [];
    CHAKRA_ORDER.forEach(([key, label]) => {
        const count = Math.max(0, Math.min(9, Math.floor(Number(cost?.[key]) || 0)));
        for (let i = 0; i < count; i += 1) energy.push(label);
    });
    return energy;
}

// concept: the stored Creator concept. takenIds: character ids already in use.
function conceptToCharacter(concept, { takenIds = [] } = {}) {
    const taken = new Set(takenIds);
    let characterId = slug(concept?.name) || 'new-character';
    if (taken.has(characterId)) {
        let n = 2;
        while (taken.has(`${characterId}-${n}`)) n += 1;
        characterId = `${characterId}-${n}`;
    }
    const problems = [];
    const usedSkillIds = new Set();
    const skills = (Array.isArray(concept?.skills) ? concept.skills : [])
        .filter((skill) => skill && (skill.name || skill.description))
        .map((skill, index) => {
            const label = skill.name || `Skill ${index + 1}`;
            let skillId = `${characterId}-${slug(skill.name) || `skill-${index + 1}`}`;
            while (usedSkillIds.has(skillId)) skillId = `${skillId}-${index + 1}`;
            usedSkillIds.add(skillId);
            const target = matchTarget(skill.target);
            if (!target) problems.push(`${label}: the target "${skill.target || 'not set'}" didn't match a target the engine knows, so it starts as One enemy.`);
            const classes = matchClasses(skill.classes);
            if (classes.unknown.length) problems.push(`${label}: the classes ${classes.unknown.map((entry) => `"${entry}"`).join(', ')} aren't classes the engine knows, so they were left out.`);
            return {
                id: skillId,
                name: skill.name || label,
                skillimage: skill.icon || '',
                skilldescription: skill.description || '',
                energy: energyFromCost(skill.cost),
                target: target || 'single-enemy',
                cooldown: Math.max(0, Math.min(99, Math.floor(Number(skill.cooldown) || 0))),
                classes: classes.matched,
                effects: [],
                ...(skill.alternate ? { hiddenFromSelectionViewer: true } : {}),
            };
        });
    const character = {
        id: characterId,
        characterId,
        name: concept?.name || 'New Character',
        facePicture: concept?.portrait || '',
        characterdeescription: concept?.description || '',
        skills,
        ...(concept?.passive && concept.passive.name ? { passive: {
            name: concept.passive.name,
            icon: concept.passive.icon || '',
            description: concept.passive.description || '',
        } } : {}),
    };
    const notes = {
        general: concept?.notes || '',
        unlock: concept?.unlock || '',
        passive: concept?.passive?.notes || '',
        skills: (Array.isArray(concept?.skills) ? concept.skills : [])
            .filter((skill) => skill && skill.notes)
            .map((skill) => ({ name: skill.name || '', notes: skill.notes })),
    };
    if (!skills.length) problems.push('The concept has no skills yet.');
    return { character, notes, problems };
}

module.exports = { conceptToCharacter, matchTarget, matchClasses, energyFromCost, slug };
