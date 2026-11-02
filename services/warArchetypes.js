// War archetype tags are derived from structured skill data so clan war rules
// such as "no full stun team" can be enforced without a hand-maintained list.
// They are separate from combat tags and mission tags.

const ARCHETYPE_VERSION = 1;

const ARCHETYPE_DEFINITIONS = {
    stun: {
        label: 'Stun',
        description: 'Has a skill that stops enemies from using some or all of their skills.',
    },
    aoe: {
        label: 'Area of Effect',
        description: 'Has a skill that targets all enemies or several enemies at once.',
    },
    drain: {
        label: 'Chakra Drain',
        description: 'Has a skill that removes or steals enemy chakra.',
    },
    affliction: {
        label: 'Affliction',
        description: 'Has a skill that deals affliction damage.',
    },
    heal: {
        label: 'Healing',
        description: 'Has a skill that restores health.',
    },
    invulnerable: {
        label: 'Invulnerability',
        description: 'Has a skill that makes a character invulnerable to some or all skills.',
    },
    counter: {
        label: 'Counter / Reflect',
        description: 'Has a skill that counters or reflects enemy skills.',
    },
    defense: {
        label: 'Defense',
        description: 'Has a skill that grants damage reduction or destructible defense.',
    },
};

const ARCHETYPE_TAGS = Object.keys(ARCHETYPE_DEFINITIONS);

const ENEMY_SCOPES = new Set([
    'all-enemy',
    'all-other-enemy',
    'all-enemy-without-source-status',
    'other-enemy',
    'other-enemies',
    'random-enemy',
    'random-other-enemy',
    'two-random-enemies',
]);
const MULTI_ENEMY_SCOPES = new Set([
    'all-enemy',
    'all-other-enemy',
    'all-enemy-without-source-status',
    'other-enemies',
    'two-random-enemies',
]);
const ALLY_SCOPES = new Set(['self', 'all-allies', 'all-ally', 'random-ally']);
// Effects that can reach several enemies without attacking them, such as
// Sakon and Ukon's Rest removing their own poison from all enemies.
const NON_ATTACK_EFFECT_TYPES = new Set(['cleanse_statuses', 'remove_status']);
const AOE_SKILL_TARGETS = new Set(['all-enemy', 'all-characters']);
const ENEMY_SKILL_TARGETS = new Set(['single-enemy', 'all-enemy']);
const ALLY_SKILL_TARGETS = new Set(['self', 'single-ally', 'all-allies', 'self-or-single-ally']);

// Metadata keys whose contents are applied to the enemy who triggered them,
// even when the owning status sits on the caster or an ally.
const ENEMY_CONTEXT_KEYS = new Set([
    'counterStatusMetadata',
    'counterApplyStatusToSourceOwner',
    'counterEffectsToAttacker',
    'counterEffectsToSourceOwner',
    'onEnemySkillTargetedApplyStatusToSource',
    'startApplyStatusToRandomEnemy',
]);

const DRAIN_EFFECT_TYPES = new Set([
    'remove_chakra',
    'remove_random_chakra',
    'steal_chakra',
    'drain_chakra_random_from_target_to_self',
]);
const DRAIN_KEYS = ['turnEndRemoveRandomChakra', 'turnEndDrainRandomToSource', 'turnEndDrainNonBloodlineToSource'];
const HEAL_EFFECT_TYPES = new Set(['heal', 'heal_missing_health_percent', 'health_steal_damage']);
const HEAL_KEYS = [
    'turnEndHealFlat',
    'lifestealPercent',
    'isHealingEffect',
    'onOwnerKillHealSelfAmount',
    'onEnemyDeathHealSelfAmount',
];
const AFFLICTION_KEYS = ['afflictionDamage', 'affliction', 'afflictionDamagePerTurn', 'damageOnSkillUseAffliction'];
const INVULNERABLE_KEYS = [
    'invulnerable',
    'invulnerableToSkillClasses',
    'invulnerableToPhysicalSkills',
    'invulnerableToNonStrategicSkills',
    'invulnerableToEnergySkills',
    'invulnerableToAfflictionSkills',
];
const COUNTER_KEYS = [
    'counterCancelsSkill',
    'counterDamage',
    'counterOnEnemySkillTargetingSelf',
    'reflectNextIncomingSkill',
    'reflectOnEnemyHarmfulNonMental',
];
const DEFENSE_KEYS = [
    'damageReductionFlat',
    'unpierceableDamageReductionFlat',
    'damageReductionUnpierceableFlat',
    'destructibleDefensePoints',
];

const isSet = (value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'number') return value > 0;
    return Boolean(value);
};

const hasAnyKey = (node, keys) => keys.some((key) => isSet(node[key]));

const sideForSkillTarget = (target) => {
    if (ENEMY_SKILL_TARGETS.has(target)) return 'enemy';
    if (ALLY_SKILL_TARGETS.has(target)) return 'ally';
    return 'unknown';
};

const sideForScope = (scope, skillSide) => {
    if (scope === 'target') return skillSide;
    if (ENEMY_SCOPES.has(scope)) return 'enemy';
    if (ALLY_SCOPES.has(scope)) return 'ally';
    return 'unknown';
};

// Walks a skill or passive, calling `add(tag)` for each archetype found. `side`
// tracks whether the current node affects enemies, allies, or cannot be told.
const scanNode = (node, side, skillSide, add) => {
    if (Array.isArray(node)) {
        node.forEach((entry) => scanNode(entry, side, skillSide, add));
        return;
    }
    if (!node || typeof node !== 'object') return;

    let nodeSide = side;
    if (typeof node.scope === 'string') {
        nodeSide = sideForScope(node.scope, skillSide);
        const isAttack = !NON_ATTACK_EFFECT_TYPES.has(node.type) && node.metadata?.helpful !== true;
        if (MULTI_ENEMY_SCOPES.has(node.scope) && isAttack) add('aoe');
    }

    if (nodeSide !== 'ally') {
        if (node.cannotUseSkills === true || isSet(node.cannotUseSkillClasses) || isSet(node.stun)) add('stun');
        if (DRAIN_EFFECT_TYPES.has(node.type) || hasAnyKey(node, DRAIN_KEYS)) add('drain');
        if (hasAnyKey(node, AFFLICTION_KEYS)) add('affliction');
    }
    if (HEAL_EFFECT_TYPES.has(node.type) || hasAnyKey(node, HEAL_KEYS)) add('heal');
    if (hasAnyKey(node, INVULNERABLE_KEYS)) add('invulnerable');
    if (hasAnyKey(node, COUNTER_KEYS)) add('counter');
    if (hasAnyKey(node, DEFENSE_KEYS)) add('defense');

    for (const [key, value] of Object.entries(node)) {
        if (value && typeof value === 'object') {
            scanNode(value, ENEMY_CONTEXT_KEYS.has(key) ? 'enemy' : nodeSide, skillSide, add);
        }
    }
};

const applyOverride = (tags, reasons, override) => {
    if (!override) return;
    for (const tag of override.remove || []) {
        tags.delete(tag);
        delete reasons[tag];
    }
    for (const tag of override.add || []) {
        if (!ARCHETYPE_DEFINITIONS[tag]) continue;
        tags.add(tag);
        reasons[tag] = ['Admin override'];
    }
};

// Returns { characterId, name, tags, reasons } where reasons maps each tag to
// the skill names that earned it. Every skill is scanned, including alternate
// skills that only appear mid-battle, and so is the passive.
const detectCharacterArchetypes = (character, override = null) => {
    const tags = new Set();
    const reasons = {};
    const record = (sourceName) => (tag) => {
        tags.add(tag);
        reasons[tag] = reasons[tag] || [];
        if (!reasons[tag].includes(sourceName)) reasons[tag].push(sourceName);
    };

    for (const skill of Array.isArray(character?.skills) ? character.skills : []) {
        const add = record(skill.name || skill.id || 'Unknown skill');
        const skillSide = sideForSkillTarget(skill.target);
        if (AOE_SKILL_TARGETS.has(skill.target)) add('aoe');
        scanNode(skill.effects || [], skillSide, skillSide, add);
    }
    if (character?.passive && typeof character.passive === 'object') {
        const add = record(character.passive.name || 'Passive');
        scanNode(character.passive, 'unknown', 'unknown', add);
    }

    applyOverride(tags, reasons, override);
    return {
        characterId: character?.characterId || character?.id || '',
        name: character?.name || '',
        tags: ARCHETYPE_TAGS.filter((tag) => tags.has(tag)),
        reasons,
    };
};

// Builds the frozen copy a war stores when it is accepted, so later balance
// changes cannot alter the rules of a war already in progress.
const buildArchetypeSnapshot = (characters, overrides = {}) => {
    const snapshot = { version: ARCHETYPE_VERSION, definitions: ARCHETYPE_DEFINITIONS, characters: {} };
    for (const character of Array.isArray(characters) ? characters : []) {
        const result = detectCharacterArchetypes(character, overrides[character?.characterId || character?.id]);
        if (!result.characterId) continue;
        snapshot.characters[result.characterId] = {
            name: result.name,
            tags: result.tags,
            reasons: result.reasons,
        };
    }
    return snapshot;
};

module.exports = {
    ARCHETYPE_VERSION,
    ARCHETYPE_DEFINITIONS,
    ARCHETYPE_TAGS,
    detectCharacterArchetypes,
    buildArchetypeSnapshot,
};
