// Character Builder catalog: skill rules and conditions.

// Fields on a skill. The editor already handles name, image, description, chakra, cooldown,
// classes, target and effects; these entries describe them and the optional rules.
const SKILL_FIELDS = {
    name: { kind: 'text', label: 'Name', required: true },
    skillimage: { kind: 'image', label: 'Image', required: true },
    skilldescription: { kind: 'longtext', label: 'Description', required: true, description: 'What players read. The engine never reads it, so keep it in line with the effects.' },
    energy: { kind: 'chakraList', label: 'Chakra cost', required: true },
    cooldown: { kind: 'int', label: 'Cooldown', required: true, min: 0, max: 99 },
    classes: { kind: 'classes', label: 'Classes', required: true },
    target: { kind: 'skillTarget', label: 'Used on', required: true },
    effects: { kind: 'effects', label: 'What it does', required: true },

    startingCooldown: { kind: 'int', label: 'Starting cooldown', min: 1, max: 20, description: 'The skill starts the match on cooldown for this many turns.' },
    maxUses: { kind: 'int', label: 'Uses per match', min: 0, max: 20, description: 'The skill can only be used this many times in a match. Some effects can grant extra uses.' },
    cannotBeCountered: { kind: 'bool', label: "Can't be countered" },
    cannotBeReflected: { kind: 'bool', label: "Can't be reflected" },
    ignoreInvulnerability: { kind: 'bool', label: 'Ignores invulnerability', description: 'Can target and hit invulnerable characters.' },
    ignoreDamageReflection: { kind: 'bool', label: 'Ignores damage reflection', advanced: true },
    targetCondition: { kind: 'targetCondition', label: 'Can only target characters who…', description: 'Characters that fail this cannot be chosen as targets.' },
    actorCondition: { kind: 'actorCondition', label: 'Can only be used while the user…', description: 'The skill is locked until this is met.' },
    hiddenFromSelectionViewer: { kind: 'bool', label: 'Alternate skill (hidden)', description: 'Not shown on character selection or the skills page. Use for skills another skill turns into (see "Swap skills" on statuses). Copy counters cannot copy it.' },
    baseSkillId: { kind: 'skillId', label: 'Alternate form of', advanced: true, description: 'Uses of this alternate skill and its base skill count together toward use limits.' },
    useBaseSkillCooldown: { kind: 'bool', label: "Shares its base skill's cooldown", advanced: true, description: 'When this skill is swapped in for another, it uses (and sets) the cooldown of the skill it replaced.' },
    requiresPreparation: { kind: 'bool', label: 'Needs preparation', advanced: true, description: 'Marks a skill that needs setup; copy counters cannot copy it and it is skipped by automatic re-casts.' },
    energyBySourceStatusMetadata: { kind: 'object', label: 'Cost changes with a counter', advanced: true, description: "The chakra cost changes as a counter on one of the user's statuses grows. The highest tier reached is used.", fields: {
        statusId: { kind: 'statusId', label: 'Status holding the counter', required: true },
        metadataKey: { kind: 'counterKey', label: 'Counter', required: true },
        tiers: { kind: 'list', label: 'Tiers', item: { min: { kind: 'int', label: 'From counter value' }, energy: { kind: 'chakraList', label: 'Cost' } } },
    } },
};

// Legacy fields kept on old characters; nothing reads them. The builder hides them.
const IGNORED_SKILL_FIELDS = ['damage', 'maxUsagesPerMatch'];

// Checks that make up a condition. All the checks in one condition must pass.
const CONDITION_CHECKS = {
    scope: { kind: 'enum', label: 'Check', options: [{ id: 'self', label: 'The user' }, { id: 'target', label: 'The target' }], default: 'self', description: 'Whose statuses and health the checks below look at.' },
    targetRelation: { kind: 'enum', label: 'The target is', options: [{ id: '', label: 'Anyone' }, { id: 'self', label: 'The user' }, { id: 'ally', label: 'An ally' }, { id: 'enemy', label: 'An enemy' }] },
    statusId: { kind: 'statusId', label: 'Has the status' },
    statusFromActor: { kind: 'bool', label: '…applied by this user', description: 'Only counts the status if this user applied it.' },
    statusIdsAny: { kind: 'statusIds', label: 'Has any of these statuses' },
    missingStatusId: { kind: 'statusId', label: 'Does not have the status' },
    statusMetadataAtLeast: { kind: 'counterCheck', label: 'A counter is at least', description: 'A counter on a status (e.g. Shadow Clones) is at least this value.' },
    statusMetadataEquals: { kind: 'counterCheck', label: 'A counter equals', advanced: true },
    sourceCurrentHpAtMost: { kind: 'int', label: 'Health is at most', min: 0, max: 100, description: 'Health of whoever is checked (the user or the target).' },
    sourceCurrentHpAtLeast: { kind: 'int', label: 'Health is at least', min: 0, max: 100 },
    sourceSkillUsesAtLeast: { kind: 'skillUseCheck', label: 'Has used a skill at least', description: 'The user has used this skill at least this many times this match. User checks only.' },
    sourceSkillUsesAtMost: { kind: 'skillUseCheck', label: 'Has used a skill at most', description: 'User checks only.' },
    all: { kind: 'conditionList', label: 'All of these', description: 'Every listed condition must pass. Use when checking the user and the target at once.' },
};

// Extra parts of an effect's condition that change what happens when it matches.
const CONDITION_OUTCOMES = {
    conditionalAmount: { kind: 'int', label: 'Use this amount instead', description: 'For damage: when the condition matches, deal this amount; when it does not, the normal amount is still dealt.' },
    requireMatch: { kind: 'bool', label: 'Skip unless matched', description: 'For damage with "Use this amount instead": the damage is skipped entirely when the condition does not match.' },
    consumeOnMatch: { kind: 'bool', label: 'Use up the status', description: 'When the condition matches, the checked status is removed.' },
    consumeOnSuccessfulTransfer: { kind: 'bool', label: 'Use up the status if chakra moved', advanced: true, description: 'For chakra drains: removes the checked status only when chakra was actually moved.' },
};

// The checks each place accepts.
const CONDITION_PLACES = {
    effect: Object.keys(CONDITION_CHECKS),
    targetCondition: ['statusId', 'statusFromActor', 'statusIdsAny', 'missingStatusId', 'missingStatusIdsAny'],
    actorCondition: ['statusId', 'statusIdsAny', 'missingStatusId', 'statusMetadataAtLeast', 'sourceCurrentHpAtMost',
        'sourceCurrentHpAtLeast', 'sourceSkillUsesAtLeast', 'sourceSkillUsesAtMost'],
};

const TARGET_ONLY_CHECKS = {
    missingStatusIdsAny: { kind: 'statusIds', label: 'Has none of these statuses' },
};

module.exports = { SKILL_FIELDS, IGNORED_SKILL_FIELDS, CONDITION_CHECKS, CONDITION_OUTCOMES, CONDITION_PLACES, TARGET_ONLY_CHECKS };
