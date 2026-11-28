// Character Builder catalog: passives, quests (awakenings) and starting statuses.
//
// How the engine uses a passive: at the start of every match it becomes a permanent, uncleansable
// status on the character, showing the passive's name, icon and description. Only the fields listed
// below are read from a passive. Anything else a passive should do -- damage reduction, bonuses,
// counters -- goes in the character's Starting statuses, which accept every status setting.

const CHARACTER_FIELDS = {
    startStatuses: { kind: 'statusList', label: 'Starting statuses', description: 'Statuses the character has from the start of the match. Use these for the lasting mechanics of a passive. Give them "Lasts all match" and 99 turns to keep them for the whole match.' },
    tags: { kind: 'tags', label: 'Tags', description: 'Labels other passives and missions can check, such as konoha-genin.' },
    requiredMissionId: { kind: 'mission', label: 'Mission to unlock' },
};

const PASSIVE_FIELDS = {
    name: { kind: 'text', label: 'Name', required: true },
    icon: { kind: 'image', label: 'Icon', required: true },
    description: { kind: 'longtext', label: 'Description', required: true, description: 'Shown as the passive\'s tooltip, unless a quest or a counter tooltip is set.' },
    stackTooltipTextTemplate: { kind: 'longtext', label: 'Tooltip with live numbers', description: 'Replaces the description in battle; {name} shows the current value of a counter on the passive.' },

    awakening: { kind: 'quest', label: 'Quest (awakening)', description: 'A goal the character completes during the match for a permanent reward.' },

    // Defense
    unpierceableDamageReductionFlat: { kind: 'int', label: 'Unpierceable damage reduction', group: 'Defense' },
    firstEnemyDamagingSkillReductionFlat: { kind: 'int', label: 'First enemy hit deals less', group: 'Defense', description: 'The first damaging enemy skill on this character deals this much less.' },
    sacrificeFirstLethalAllyAttack: { kind: 'bool', label: 'Takes the first lethal hit for an ally', group: 'Defense', description: 'The first time an ally would be killed, this character takes the hit instead.' },
    immuneToChakraRemovalAndStealing: { kind: 'bool', label: 'Immune to chakra removal and stealing', group: 'Defense' },
    damageTakenInTurn: { kind: 'object', label: 'React to heavy damage', group: 'Defense', description: 'When this character takes enough damage in one turn, they gain destructible defense and a bonus to their next attack.', fields: {
        threshold: { kind: 'int', label: 'Damage in one turn', required: true },
        defensePoints: { kind: 'int', label: 'Destructible defense gained', required: true },
        defenseDuration: { kind: 'int', label: 'Defense lasts (turns)', required: true },
        defenseStatusId: { kind: 'statusId', label: 'Defense status name', required: true, defines: true },
        nextAttackDamage: { kind: 'int', label: 'Next attack bonus', required: true },
        attackStatusId: { kind: 'statusId', label: 'Attack bonus status name', required: true, defines: true },
    } },
    onEnemySkillCounteredDefense: { kind: 'object', label: 'Defense when a counter goes off', group: 'Defense', description: "Each time one of this character's counters goes off, a defense status is refilled.", fields: {
        statusId: { kind: 'statusId', label: 'Defense status', required: true },
        points: { kind: 'int', label: 'Points', required: true },
    } },

    // Offense
    lifestealPercent: { kind: 'int', label: 'Lifesteal %', group: 'Offense', description: 'Heals this percent of the damage this character deals.' },
    damageBonusPerDeadAlly: { kind: 'object', label: 'Damage per fallen ally', group: 'Offense', fields: {
        amount: { kind: 'int', label: 'Damage per dead ally', required: true },
        skillClassesAny: { kind: 'classes', label: 'Only skills of these classes' },
    } },
    nextSkillDamageBonusOnStun: { kind: 'object', label: 'Bonus after being stunned', group: 'Offense', description: 'After this character is stunned, the named skill deals more damage once.', fields: {
        skillId: { kind: 'skillId', label: 'Skill', required: true },
        amount: { kind: 'int', label: 'Extra damage', required: true },
    } },
    onSkillUseRandomEnemyDamage: { kind: 'object', label: 'Hit a random enemy on every skill', group: 'Offense', fields: {
        amount: { kind: 'int', label: 'Damage', required: true },
        extraTriggersStatusId: { kind: 'statusId', label: 'Extra hits from status', description: 'While the character has this status, its "extraTriggers" counter adds that many extra hits. The hits count as Physical.' },
    } },
    startDamageAllEnemies: { kind: 'object', label: 'Damage all enemies before turn 1', group: 'Offense', fields: {
        amount: { kind: 'int', label: 'Damage', required: true },
        classes: { kind: 'classes', label: 'Counts as' },
    } },
    onEnemySkillTargetedDamageToSourceAmount: { kind: 'int', label: 'Damage enemies who target this character', group: 'Offense' },
    onEnemySkillTargetedDamageToSourceSkillClasses: { kind: 'classes', label: 'That damage counts as', group: 'Offense' },
    onEnemySkillTargetedDamagingOnly: { kind: 'bool', label: '…only for damaging skills', group: 'Offense' },

    // Team
    alliedCharacterTagMaxHealthBonus: { kind: 'object', label: 'Extra health for tagged allies', group: 'Team', fields: {
        tag: { kind: 'tag', label: 'Tag', required: true },
        amount: { kind: 'int', label: 'Extra maximum health', required: true },
    } },
    teamNonAfflictionDamageBonusWhileDestructibleDefense: { kind: 'int', label: 'Team deals more damage while shielded', group: 'Team', description: 'Allies with destructible defense deal this much more non-affliction damage.' },
    teamRandomChakraAtMatchStart: { kind: 'int', label: 'Team starts with extra random chakra', group: 'Team' },
    teamRandomChakraEveryOwnTurns: { kind: 'int', label: 'Team gains 1 random chakra every N turns', group: 'Team' },
    teamSkillCostDefense: { kind: 'object', label: 'Defense for costly skills', group: 'Team', description: 'Allies who use a skill costing at least this much chakra gain destructible defense.', fields: {
        minimumCost: { kind: 'int', label: 'Minimum chakra cost', default: 2 },
        points: { kind: 'int', label: 'Destructible defense', required: true },
        duration: { kind: 'int', label: 'Lasts (turns)', required: true },
        statusId: { kind: 'statusId', label: 'Defense status name', required: true, defines: true },
    } },
    healBonusWhenTargetHpAtMost: { kind: 'object', label: 'Heals more on low-health allies', group: 'Team', fields: {
        threshold: { kind: 'int', label: 'Health at most', required: true },
        amount: { kind: 'int', label: 'Extra healing', required: true },
    } },
    onOwnerDeathGainTeamChakra: { kind: 'object', label: 'Team gains chakra when this character dies', group: 'Team', fields: {
        amount: { kind: 'int', label: 'Chakra', required: true },
        chakraType: { kind: 'chakraEffectType', label: 'Type', default: 'random' },
    } },

    // Start of match
    startApplyStatusToRandomEnemy: { kind: 'status', label: 'Mark a random enemy at the start', group: 'Start of match' },
    startApplyStatusToOppositeEnemy: { kind: 'status', label: 'Mark the opposite enemy at the start', group: 'Start of match', description: 'The enemy in the same position as this character.' },
    revealInvisibleSkills: { kind: 'bool', label: 'See invisible skills', group: 'Start of match' },

    // Triggers
    onFirstHpAtMost: { kind: 'object', label: 'Once, at low health', group: 'Triggers', description: 'The first time health falls to the threshold, a status is applied to this character.', fields: {
        threshold: { kind: 'int', label: 'Health at most', required: true },
        applyStatusToSelf: { kind: 'status', label: 'Status', required: true },
    } },
    onOwnerKillApplyStatusToSelf: { kind: 'status', label: 'On a kill: status on this character', group: 'Triggers' },
    onOwnerKillGrantSkillUse: { kind: 'object', label: 'On a kill: extra use of a skill', group: 'Triggers', fields: {
        skillId: { kind: 'skillId', label: 'Skill', required: true },
        amount: { kind: 'int', label: 'Extra uses', default: 1 },
    } },
    onOwnerKillSourceSkillIdsAny: { kind: 'skillIds', label: 'Only kills with these skills', group: 'Triggers' },
    onOwnerKillTargetRelation: { kind: 'enum', label: 'Only kills of', group: 'Triggers', options: [{ id: '', label: 'Anyone' }, { id: 'enemy', label: 'Enemies' }] },
    onEnemyIncreasedCostSkillApplyStatusToSelf: { kind: 'status', label: 'When an enemy pays extra chakra', group: 'Triggers', description: 'When an enemy uses a skill whose cost was increased, this character gains a status.' },
    recordEnemyStunners: { kind: 'object', label: "Mark enemies who stun this character's team", group: 'Triggers', fields: {
        statusId: { kind: 'statusId', label: 'Mark status name', required: true, defines: true },
        tooltipText: { kind: 'longtext', label: 'Mark tooltip' },
        statusIcon: { kind: 'image', label: 'Mark icon' },
    } },

    // Counters on the passive
    onDamageStackMetadataKey: { kind: 'counterKey', label: 'Counter that grows when hit', group: 'Counters' },
    onDamageStackAmount: { kind: 'int', label: '…by this much per hit', group: 'Counters' },
    onUndamagedTurnStackMetadataKey: { kind: 'counterKey', label: 'Counter that grows on turns without damage', group: 'Counters' },
    onUndamagedTurnStackAmount: { kind: 'int', label: '…by this much', group: 'Counters' },
    stackCapsByKey: { kind: 'counterMap', label: 'Counter maximums', group: 'Counters' },
};

// A passive may also set a counter's starting value under the counter's own name (e.g.
// sandFlowStacks: 0). The builder treats any field named after one of the passive's counters that way.

// Quest (awakening): ways to complete it, and the reward.
const QUEST_FIELDS = {
    statusId: { kind: 'statusId', label: 'Reward status name', required: true, defines: true, description: 'The status the character gains when the quest is complete. Skills and effects can check for it.' },
    afterOwnerSkillUses: { kind: 'int', label: 'Complete after using skills', group: 'Goal', description: 'Every skill this character uses counts.' },
    allyCharacterIdsProgress: { kind: 'characterIds', label: '…these allies on the team count as one skill each', group: 'Goal' },
    afterOwnerTurns: { kind: 'int', label: 'Or complete after this many turns', group: 'Goal' },
    allyHpBelow: { kind: 'int', label: 'Or complete when an ally falls below health', group: 'Goal' },
    allyCharacterIdsAny: { kind: 'characterIds', label: 'Or complete at once if any of these allies are on the team', group: 'Goal' },
    progressTooltipTextTemplate: { kind: 'longtext', label: 'Tooltip while in progress', group: 'Tooltips', description: '{awakeningSkillUses} shows the progress. Example: "Progress: {awakeningSkillUses}/4."' },
    completedTooltipText: { kind: 'longtext', label: 'Tooltip once complete', group: 'Tooltips', description: 'Replaces the passive\'s tooltip when the quest is done. If set, the reward status adds no tooltip of its own.' },
    metadata: { kind: 'statusSettings', label: 'What the reward status does', group: 'Reward', description: 'Settings of the reward status: anything a status can do (heal each turn, swap skills, ignore stuns...).' },
    clearCooldownSkillIds: { kind: 'skillIds', label: 'Also reset the cooldown of', group: 'Reward' },
};

module.exports = { CHARACTER_FIELDS, PASSIVE_FIELDS, QUEST_FIELDS };
