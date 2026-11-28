// Character Builder catalog: status settings.
//
// A status (from "Apply a status", a passive, or a starting status) is a set of these settings.
// Each entry: label, kind (see effects.js), group, description, and optional fields for objects.
// Only settings the live roster uses (so proven in real matches) are listed; the catalog test
// fails if a live character uses a setting missing from here.
//
// Shared sub-shape: a "status" kind is { statusId, duration, fresh?, metadata } -- a whole status
// to apply later (on a counter, on expiry, on a kill...).

// S(group, kind, label, description?, extra?) -- the description may be left out.
const S = (group, kind, label, description, extra = {}) => {
    if (description && typeof description === 'object') return S(group, kind, label, null, description);
    return { group, kind, label, ...(description ? { description } : {}), ...extra };
};

const GROUPS = [
    { id: 'basics', label: 'Basics and display' },
    { id: 'lifetime', label: 'How long it lasts' },
    { id: 'stuns', label: 'Stuns and locks' },
    { id: 'protection', label: 'Protection' },
    { id: 'damage', label: 'Damage up and down' },
    { id: 'piercing', label: 'Getting past protection' },
    { id: 'healing', label: 'Healing' },
    { id: 'eachTurn', label: 'Each turn' },
    { id: 'costs', label: 'Chakra costs' },
    { id: 'skills', label: 'Changing skills' },
    { id: 'stacks', label: 'Counters (stacks)' },
    { id: 'counters', label: 'Counters and traps' },
    { id: 'reflect', label: 'Reflecting skills' },
    { id: 'targeted', label: 'When an enemy targets the owner' },
    { id: 'ownerUse', label: 'When the owner uses a skill' },
    { id: 'kills', label: 'Kills and deaths' },
    { id: 'expiry', label: 'When it ends' },
    { id: 'linking', label: 'Linking and recording', advanced: true },
];

const STATUS_SETTINGS = {
    // ------------------------------------------------------------- basics and display
    helpful: S('basics', 'bool', 'Helpful', 'A good status for its owner. Helpful skills and cleanses look at this.'),
    harmful: S('basics', 'bool', 'Harmful', 'A bad status for its owner. Harmful-only cleanses remove it; "ignore harmful effects" protections block it.'),
    tooltipText: S('basics', 'longtext', 'Tooltip', 'What players read when they hover over the status.'),
    tooltipTextTemplate: S('basics', 'longtext', 'Tooltip with live numbers', 'Like Tooltip, but {name} is replaced by the current value of that setting or counter. Example: "Naruto has {shadowClones} Shadow Clones."'),
    statusIcon: S('basics', 'image', 'Icon', 'Shown on the status. Defaults to the image of the skill that applied it.'),
    sourceSkillName: S('basics', 'text', 'Shown as from skill', 'The skill name shown on the status.'),
    invisible: S('basics', 'bool', 'Invisible', 'Hidden from the enemy team (revealed by "See invisible skills").'),
    hideTooltip: S('basics', 'bool', 'Hidden completely', 'Nobody sees this status. Use for behind-the-scenes trackers.'),
    hideTooltipFromEnemy: S('basics', 'bool', 'Hidden from enemies'),
    hideTooltipFromUnitOwner: S('basics', 'bool', "Hidden from its owner's team", 'Use for traps placed on enemies that they should not see.'),
    revealInvisibleSkills: S('basics', 'bool', 'See invisible skills', "The owner's team sees the enemy's invisible statuses."),
    revealInvisibleSkillsToSourceTeam: S('basics', 'bool', "Reveal to the user's team", "The user's team sees invisible statuses on the character carrying this.", { advanced: true }),
    facePictureOverride: S('basics', 'image', 'Change portrait', "Replaces the owner's portrait in battle while it lasts (e.g. a transformation)."),
    statusGroupId: S('basics', 'text', 'Group', 'A group name so a counter can remove a whole group at once (see "Remove group when triggered").', { advanced: true }),

    // ------------------------------------------------------------- lifetime
    turnDurationAnchor: S('lifetime', 'durationAnchor', 'Counts down on', 'Whose turns use up its duration.'),
    permanent: S('lifetime', 'bool', 'Lasts all match', 'Never runs out. Pair with 99 turns.'),
    ongoingClass: S('lifetime', 'ongoingClass', 'Ongoing class', 'Ties the status to its user: Action and Control statuses end when the user dies (Control also when the user is stunned or the target turns invulnerable).'),
    removeOnSourceDeath: S('lifetime', 'bool', 'Ends if the user dies'),
    cannotBeCleansed: S('lifetime', 'bool', 'Cannot be removed by cleanses'),
    cannotBeRemoved: S('lifetime', 'bool', 'Cannot be removed at all', 'Not even by effects that remove it by name.', { advanced: true }),
    controlIgnoresOwnerInvulnerability: S('lifetime', 'bool', 'Control ignores invulnerability', 'A Control status keeps going even if its target becomes invulnerable.'),
    endsOnAnySourceStun: S('lifetime', 'bool', 'Ends if the user is stunned at all', 'Ends even on partial stuns.', { advanced: true }),
    expireEffectsOnEarlyEnd: S('lifetime', 'bool', 'Run end effects if broken early', 'If a Control status is broken early, its "when it ends" effects still run.', { advanced: true }),
    fromPassive: S('lifetime', 'bool', 'Counts as a passive', 'Treated as part of a passive: cannot be cleansed or ignored.', { advanced: true }),
    activeOnlyWithDestructibleDefense: S('lifetime', 'bool', 'Works only while it has defense left', 'Its other effects only work while its own destructible defense is above 0.', { advanced: true }),

    // ------------------------------------------------------------- stuns
    cannotUseSkills: S('stuns', 'bool', 'Stun (all skills)', 'The owner cannot use any skill.'),
    cannotUseSkillClasses: S('stuns', 'classes', 'Stun skills of these classes', 'A partial stun: the owner cannot use skills with any of these classes.'),
    cannotUseSkillIndices: S('stuns', 'skillSlots', 'Stun these skill slots', 'A partial stun by position (1st, 2nd, 3rd, 4th skill).', { advanced: true }),
    ignoresPartialStuns: S('stuns', 'bool', 'Ignores partial stuns', 'Stuns that only lock some skills have no effect on the owner.'),
    outgoingStunDurationReduction: S('stuns', 'int', "Owner's stuns are shorter", 'Stuns the owner applies last this many fewer turns (and may not land).', { advanced: true }),
    copyStunLocksFromTargetStatusId: S('stuns', 'statusId', 'Copy the stun from', "Copies the locked skill classes from this status on the target, so the stun matches what was done to the user's team.", { advanced: true }),

    // ------------------------------------------------------------- protection
    invulnerable: S('protection', 'bool', 'Invulnerable', 'Cannot be targeted by enemy skills. Affliction damage still lands on resolution.'),
    invulnerableToSkillClasses: S('protection', 'classes', 'Invulnerable to these classes'),
    invulnerableToHelpfulSkills: S('protection', 'bool', 'Cannot receive helpful skills', 'Allies cannot target the owner with helpful skills.'),
    invulnerableToNonStrategicSkills: S('protection', 'bool', 'Invulnerable to all but Strategic skills'),
    cannotBecomeInvulnerable: S('protection', 'bool', 'Cannot become invulnerable', 'Overrides every invulnerability the owner has.'),
    destructibleDefensePoints: S('protection', 'int', 'Destructible defense', 'Absorbs this much damage before health is lost.'),
    damageReductionFlat: S('protection', 'int', 'Damage reduction', 'Takes this much less damage from each hit. Piercing and affliction damage ignore it.'),
    unpierceableDamageReductionFlat: S('protection', 'int', 'Unpierceable damage reduction', 'Like damage reduction, but piercing damage does not ignore it.'),
    cannotReduceDamage: S('protection', 'bool', 'Cannot reduce damage', "The owner's damage reduction stops working."),
    minimumHp: S('protection', 'int', 'Cannot die below', 'Health cannot go below this. 1 means the owner cannot be killed.'),
    ignoreAllDamage: S('protection', 'bool', 'Takes no damage'),
    ignoreHarmfulNonDamageEffects: S('protection', 'bool', "Ignores enemies' harmful effects", "Enemies' harmful statuses only keep their damage on the owner; stuns, cost increases and the rest are ignored. Also blocks chakra removal."),
    ignoreCounters: S('protection', 'bool', 'Ignores counters', "Enemy counters and traps on the owner don't trigger on the owner's skills."),
    firstHarmfulSkillAgainstSourceTeamNonAfflictionReductionFlat: S('protection', 'int', "Shield the user's team from the next attack", "The first harmful skill this character uses against the user's team deals this much less non-affliction damage.", { advanced: true }),
    redirectEnemyAreaSkillsToSelf: S('protection', 'bool', 'Draws area attacks', "Enemy skills that hit all of the owner's team hit only the owner instead.", { advanced: true }),
    outgoingChakraLossReduction: S('protection', 'int', "Owner's chakra removal is weaker", 'Chakra the owner removes or steals is reduced by this much.', { advanced: true }),

    // ------------------------------------------------------------- damage up and down
    damageBonusFlat: S('damage', 'int', 'Deals more damage', "The owner's damaging skills deal this much more damage."),
    nonAfflictionDamageBonusFlat: S('damage', 'int', 'Deals more non-affliction damage'),
    damageDebuffFlat: S('damage', 'int', 'Deals less damage', "The owner's damaging skills deal this much less damage."),
    nonAfflictionDamageDebuffFlat: S('damage', 'int', 'Deals less non-affliction damage'),
    NonAfflictionDamageDebuff: S('damage', 'int', 'Deals less non-affliction damage (alternative)', 'Same as above; both add together.', { advanced: true }),
    damageBonusBySkillClass: S('damage', 'classMap', 'Deals more damage with classes', 'Extra damage per class, e.g. Physical: 5.'),
    damageDebuffBySkillClass: S('damage', 'classMap', 'Deals less damage with classes'),
    damageTakenBonusBySkillClass: S('damage', 'classMap', 'Takes more damage from classes', 'The owner takes extra damage from skills of these classes.'),
    skillDamageBonuses: S('damage', 'skillMap', "Boost the user's skills", 'Extra damage for specific skills of the owner, e.g. Gentle Fist: 5.'),
    bonusDamageFromSourceSkillsFlat: S('damage', 'int', 'Takes more damage from the user', "The owner takes this much more damage from the character named below (or the status's user)."),
    bonusDamageFromSourceCharacterId: S('damage', 'characterId', '…from this character', 'Which character the extra damage above comes from.'),
    bonusDamageAppliesToSkillIds: S('damage', 'skillIds', '…only from these skills', 'Limits the extra damage above to these skills.'),
    bonusDamageFromSourceAlliesNonAfflictionFlat: S('damage', 'int', "Takes more damage from the user's allies", 'Extra non-affliction damage taken from the allies of the character who applied it.', { advanced: true }),
    bonusDamageAgainstInvulnerableTargets: S('damage', 'int', 'More damage against invulnerable targets', { advanced: true }),
    nextSingleTargetNonAfflictionDamageBonusFlat: S('damage', 'int', 'Next single-target hit deals more', "The owner's next single-target damaging skill deals this much more non-affliction damage, then it is used up."),
    executeThresholdBonusForSource: S('damage', 'int', 'Easier to execute for the user', "The user's execute effects kill the owner at this much more health.", { advanced: true }),
    damageDebuffBySkillClassFromTargetStatus: S('damage', 'object', 'Weaken by a counter on the target', "Lowers the target's damage for these classes by a counter value read from one of its statuses.", { advanced: true, fields: {
        statusId: { kind: 'statusId', label: 'Status on the target', required: true },
        metadataKey: { kind: 'counterKey', label: 'Counter', required: true },
        classes: { kind: 'classes', label: 'Classes', required: true },
    } }),

    // ------------------------------------------------------------- getting past protection
    ignoreEnemyInvulnerability: S('piercing', 'bool', "Owner's skills ignore invulnerability"),
    ignoreInvulnerabilityForSkillIds: S('piercing', 'skillIds', 'These skills ignore invulnerability'),
    ignoreInvulnerabilityFromSourceCharacterId: S('piercing', 'characterId', 'Can be hit through invulnerability by', 'This character can hit the owner even while the owner is invulnerable.'),
    ignoreDamageReductionForSkillIds: S('piercing', 'skillIds', 'These skills ignore damage reduction'),
    ignoreDestructibleDefenseForSkillIds: S('piercing', 'skillIds', 'These skills ignore destructible defense'),
    ignoreDamageReduction: S('piercing', 'bool', 'Its damage pierces', 'Damage this status deals ignores damage reduction.'),
    ignoreDestructibleDefense: S('piercing', 'bool', 'Its damage ignores destructible defense'),
    ignoreTargetDamageReduction: S('piercing', 'bool', 'Its turn damage pierces', 'The damage it deals each turn ignores damage reduction.'),
    uncounterableSkillIds: S('piercing', 'skillIds', "These skills can't be countered"),
    unreflectableSkillIds: S('piercing', 'skillIds', "These skills can't be reflected"),

    // ------------------------------------------------------------- healing
    healReceivedMultiplier: S('healing', 'number', 'Healing received multiplier', '0 means the owner cannot be healed; 1 is normal.'),
    healReceivedBonusFlat: S('healing', 'int', 'Receives more healing', 'Each heal on the owner restores this much more.'),
    skillHealingBonuses: S('healing', 'skillMap', "Boost the user's healing skills", 'Extra healing for specific skills of the owner.'),
    turnEndHealFlat: S('healing', 'int', 'Heals each turn', 'The owner heals this much at the end of each of their turns.'),

    // ------------------------------------------------------------- each turn
    turnEndDamage: S('eachTurn', 'int', 'Damage each turn', 'Deals this much damage to the owner each turn.'),
    turnEndTrigger: S('eachTurn', 'enum', 'Each-turn effects happen on', 'Default: the owner\'s turns.', { options: [{ id: '', label: "The owner's turns" }, { id: 'source_turn', label: "The user's turns" }] }),
    afflictionDamage: S('eachTurn', 'bool', 'Its damage is affliction', 'Damage this status deals each turn ignores damage reduction and destructible defense.'),
    turnEndSkillClasses: S('eachTurn', 'classes', 'Its damage counts as', 'Classes the each-turn damage counts as (for invulnerability and class bonuses).'),
    triggerOnApply: S('eachTurn', 'bool', 'Also works on the turn it is applied', 'Its each-turn effects also happen at the end of the turn it was applied.'),
    turnEndDamageRequiresNoTeamChakra: S('eachTurn', 'bool', "Only damages if the owner's team has no chakra", { advanced: true }),
    turnEndDrainRandomToSource: S('eachTurn', 'int', 'Drains chakra each turn', "Moves this much random chakra from the owner's team to the user's team each turn."),
    turnEndDrainRandomToSourceRequiresSourceStatusId: S('eachTurn', 'statusId', '…only while the user has', 'The drain above only happens while the user has this status.', { advanced: true }),
    growPerTurn: S('eachTurn', 'list', 'Grows each turn', 'Adds to a setting or counter on this status every turn, up to an optional maximum.', { item: {
        key: { kind: 'counterKey', label: 'Setting or counter', required: true },
        amount: { kind: 'int', label: 'Added each turn', required: true },
        max: { kind: 'int', label: 'Maximum', optional: true },
    } }),

    // ------------------------------------------------------------- chakra costs
    randomCostIncrease: S('costs', 'int', 'Skills cost more random chakra', "The owner's skills cost this much more random chakra."),
    randomCostReduction: S('costs', 'int', 'Skills cost less random chakra'),
    randomCostIncreaseForHarmfulSkills: S('costs', 'int', 'Harmful skills cost more'),
    randomCostIncreaseForSkillClasses: S('costs', 'classMap', 'Skills of classes cost more', 'Extra random chakra per class, e.g. Physical: 1.'),
    randomCostIncreaseForSkillIds: S('costs', 'skillMap', 'These skills cost more'),
    genjutsuCostIncrease: S('costs', 'int', 'Skills cost more Genjutsu chakra'),
    skillCostOverridesBySkillId: S('costs', 'skillCostMap', 'Change these skills\' cost', "Replaces the chakra cost of the owner's named skills while it lasts."),

    // ------------------------------------------------------------- changing skills
    skillReplacements: S('skills', 'skillSwapMap', 'Swap skills', "While it lasts, the owner's skill on the left is replaced by the skill on the right (usually an alternate skill)."),
    skillCooldownOverridesBySkillId: S('skills', 'skillMap', "Change these skills' cooldown", 'Sets the cooldown of named skills while it lasts (0 removes it).'),
    skillDurationBonuses: S('skills', 'skillMap', "Make these skills' effects last longer", 'Statuses applied by these skills last this many more turns.'),
    skillTargetOverrides: S('skills', 'skillTargetMap', "Change who these skills target", 'Example: let a self skill target an ally.'),

    // ------------------------------------------------------------- counters (stacks)
    stackMetadataKey: S('stacks', 'counterKey', 'Counter name', 'Makes this status keep a counter (e.g. shadowClones). Re-applying it changes the counter instead of replacing it.'),
    stackDelta: S('stacks', 'int', 'Change per application', 'How much the counter changes each time the status is applied (negative to lower it).'),
    stackMax: S('stacks', 'int', 'Counter maximum'),
    stackCapsByKey: S('stacks', 'counterMap', 'Maximum per counter', 'Caps for counters on this status, by name.', { advanced: true }),
    stackDerivedNumericKeys: S('stacks', 'settingMap', 'Settings from the counter', 'Sets other settings to counter × number. Example: damage reduction 5 per Shadow Clone.'),
    mergeNumericAddKeys: S('stacks', 'statusSettingKeys', 'Add up these settings', 'When re-applied, these numeric settings add to the old values instead of replacing them.'),
    applyStatusAtStack: S('stacks', 'object', 'When the counter reaches', 'Applies another status once the counter reaches a value.', { fields: {
        metadataKey: { kind: 'counterKey', label: 'Counter', required: true },
        value: { kind: 'int', label: 'Reaches', required: true },
        statusId: { kind: 'statusId', label: 'Status to apply', required: true, defines: true },
        duration: { kind: 'int', label: 'Turns', required: true },
        metadata: { kind: 'statusSettings', label: 'Its settings' },
    } }),
    consumeStackOnEnemyDamagingSkill: S('stacks', 'object', 'Lose a counter when hit', "Each damaging enemy skill on the owner lowers the counter; the status ends at 0.", { fields: {
        metadataKey: { kind: 'counterKey', label: 'Counter', required: true },
        amount: { kind: 'int', label: 'Lost per hit', default: 1 },
    } }),
    scaleFromSourceStatusMetadata: S('stacks', 'object', "Scale from the user's counter", "When applied, sets (or adds to) settings on this status from a counter on the user's status.", { advanced: true, fields: {
        statusId: { kind: 'statusId', label: "User's status", required: true },
        metadataKey: { kind: 'counterKey', label: 'Counter', required: true },
        multiplier: { kind: 'int', label: 'Multiplier', required: true },
        targetKeys: { kind: 'statusSettingKeys', label: 'Settings to set', required: true },
        addToTargetKeys: { kind: 'bool', label: 'Add instead of set' },
    } }),

    // ------------------------------------------------------------- counters and traps
    triggerOnEnemyHarmfulSkill: S('counters', 'bool', 'Counter: triggers on enemy harmful skills', 'Makes this a counter/trap. When an enemy uses a harmful skill on the owner, the counter goes off.'),
    triggerOnEnemyHarmfulSkillClassesAny: S('counters', 'classes', 'Counter: only on these classes', 'Makes this a counter that only goes off on enemy harmful skills of these classes.'),
    triggerOnOwnerHelpfulSkill: S('counters', 'bool', 'Trap: triggers on the owner\'s helpful skills', 'Also goes off when the trapped character uses a helpful skill.'),
    triggerOnlyOnOwnerSkillUse: S('counters', 'bool', 'Trap: triggers when the owner acts', "A trap placed on an enemy: goes off when that enemy uses a skill, not when they are targeted."),
    triggerOnlyOnDamagingSkill: S('counters', 'bool', 'Only on damaging skills'),
    visibleCounter: S('counters', 'bool', 'Visible to the enemy', 'Counters are hidden from the other team by default. Turn on for a counter the enemy should be able to see.'),
    counterCancelsSkill: S('counters', 'bool', 'Cancels the skill', 'On by default: the countered skill does nothing. Turn off for traps that punish but let the skill land.'),
    counterDamage: S('counters', 'int', 'Damage to whoever set it off'),
    counterDamageSkillClasses: S('counters', 'classes', 'That damage counts as'),
    counterDamageAttributedToStatusSource: S('counters', 'bool', 'Damage dealt by the user', 'The counter damage counts as dealt by the character who placed it (for bonuses and kills).'),
    counterDamageRespectsInvulnerability: S('counters', 'bool', 'Damage blocked by invulnerability'),
    counterStatusId: S('counters', 'statusId', 'Status put on whoever set it off', null, { defines: true }),
    counterStatusDuration: S('counters', 'int', '…for this many turns'),
    counterStatusMetadata: S('counters', 'statusSettings', '…with these settings'),
    counterStatusApplyIfTargetHpAtMost: S('counters', 'int', '…only if their health is at most'),
    counterApplyStatusToRecipient: S('counters', 'status', 'Status put on the owner when it goes off'),
    counterApplyStatusToSourceOwner: S('counters', 'status', 'Status put on the user when it goes off', 'Goes on the character who placed the counter.'),
    counterEffectsToAttacker: S('counters', 'effects', 'Effects on whoever set it off', null, { triggered: true }),
    counterEffectsToSourceOwner: S('counters', 'effects', 'Effects on the user when it goes off', null, { triggered: true }),
    removeStatusGroupIdOnTrigger: S('counters', 'text', 'Remove group when triggered', "When it goes off, removes every status with this group name from the owner's team.", { advanced: true }),
    counterCopySkillReplacementFor: S('counters', 'skillId', 'Copy the countered skill into', "Copy counter: the countered skill replaces this skill of the user for a while.", { advanced: true }),
    counterCopySkillReplacementDuration: S('counters', 'int', '…for this many turns', null, { advanced: true }),
    counterCopiedSkillEnergy: S('counters', 'chakraList', '…and the copy costs', null, { advanced: true }),
    counterCopyExcludeUniqueAndPreparation: S('counters', 'bool', "…unless it's Unique, alternate or needs preparation", null, { advanced: true }),
    counterCopyRequiresPassiveName: S('counters', 'text', '…only while the user has this passive', null, { advanced: true }),

    // ------------------------------------------------------------- reflecting
    reflectNextIncomingSkill: S('reflect', 'bool', 'Reflect the next skill', 'The next enemy skill used on the owner is sent back.'),
    reflectOnlyHarmfulSkills: S('reflect', 'bool', 'Only harmful skills'),
    reflectOnlySkillClasses: S('reflect', 'classes', 'Only these classes'),
    reflectToFixedTarget: S('reflect', 'bool', 'Reflect to a recorded target', 'Sends the skill to the character recorded on this status (see "Record the target"), not back at the caster.', { advanced: true }),
    persistReflectAcrossTriggers: S('reflect', 'bool', 'Keeps reflecting', 'Does not end after the first reflect.'),
    onReflectGainChakra: S('reflect', 'object', 'Gain chakra on reflect', null, { fields: {
        chakraType: { kind: 'chakraEffectType', label: 'Type', default: 'random' },
        amount: { kind: 'int', label: 'Chakra', required: true },
    } }),

    // ------------------------------------------------------------- when targeted
    onEnemySkillTargetedDamageToSourceAmount: S('targeted', 'int', 'Damage enemies who target the owner', 'Each enemy that targets the owner with a skill takes this much damage.'),
    onEnemySkillTargetedDamageToSourceSkillClasses: S('targeted', 'classes', 'That damage counts as'),
    onEnemySkillTargetedApplyStatusToSource: S('targeted', 'status', 'Status on enemies who target the owner'),
    onEnemySkillTargetedHarmfulOnly: S('targeted', 'bool', 'Only on harmful skills'),
    onEnemySkillTargetedSkillClassesAny: S('targeted', 'classes', 'Only on these classes'),
    onEnemySkillTargetedUseStatusSource: S('targeted', 'bool', 'Dealt by the user', 'The reaction counts as coming from the character who applied this status.'),
    onEnemySkillTargetedOncePerCastGroup: S('targeted', 'text', 'Once per skill for the group', 'Statuses sharing this name react only once to the same enemy skill.', { advanced: true }),

    // ------------------------------------------------------------- when the owner uses a skill
    onOwnerUseSkillTrigger: S('ownerUse', 'bool', 'Reacts when the owner uses a skill', 'Turns on the settings in this group. By default the status ends after reacting once.'),
    onOwnerUseSkillEffects: S('ownerUse', 'effects', 'Effects on the owner', 'Run on the owner when they use a skill.', { triggered: true }),
    onOwnerUseSkillApplyStatusToOwner: S('ownerUse', 'status', 'Status on the owner'),
    onOwnerUseSkillClassesAny: S('ownerUse', 'classes', 'Only for skills of these classes'),
    onOwnerUseSkillIdsAny: S('ownerUse', 'skillIds', 'Only for these skills'),
    onOwnerUseSkillHarmfulOnly: S('ownerUse', 'bool', 'Only for harmful skills'),
    persistOnOwnerUseSkillTrigger: S('ownerUse', 'bool', 'Keeps reacting', 'Does not end after reacting.'),
    preserveOnOwnerUseSkillTrigger: S('ownerUse', 'bool', 'Keep it after reacting (alternative)', null, { advanced: true }),
    ownerUseTriggerRequiresLivingSource: S('ownerUse', 'bool', 'Only while the user is alive', null, { advanced: true }),
    sharedFirstTriggerUnlessSourceStatusId: S('ownerUse', 'statusId', 'Shared first trigger, unless the user has', "Copies of this trap on one team share a single trigger, unless the user has this status.", { advanced: true }),
    removeStatusIdsOnOwnerUseSkill: S('ownerUse', 'statusIds', 'Remove these statuses when the owner acts'),
    onOwnerUseChakraSpentAfflictionDamagePerChakra: S('ownerUse', 'int', 'Affliction damage per chakra spent', 'When the owner uses a skill, they take this much affliction damage per chakra it cost.'),

    // ------------------------------------------------------------- kills and deaths
    onOwnerKillApplyStatusToSelf: S('kills', 'status', 'On a kill: status on the owner'),
    onOwnerKillHealSelfAmount: S('kills', 'int', 'On a kill: heal the owner'),
    onOwnerKillSourceSkillIdsAny: S('kills', 'skillIds', 'Only kills with these skills'),
    onOwnerKillTargetRelation: S('kills', 'enum', 'Only kills of', null, { options: [{ id: '', label: 'Anyone' }, { id: 'enemy', label: 'Enemies' }] }),
    onMarkedTargetDeathGainChakra: S('kills', 'object', "When the marked character dies, the user's team gains chakra", null, { fields: {
        amount: { kind: 'int', label: 'Chakra', required: true },
        chakraType: { kind: 'chakraEffectType', label: 'Type', default: 'random' },
    } }),
    uniqueEnemyMarkFromSource: S('kills', 'bool', 'Only one enemy at a time', 'Applying it to an enemy removes it from any other enemy the user marked.'),

    // ------------------------------------------------------------- when it ends
    onExpireEffects: S('expiry', 'effects', 'Effects when it ends', 'Run on the owner when the status runs out.', { triggered: true }),
    onExpireApplyStatusToSelf: S('expiry', 'status', 'Status on the owner when it ends'),
    onExpireEffectsIfNoNewSkillUsed: S('expiry', 'effects', 'Effects when it ends, if the owner did nothing', 'Only run if the owner used no new skill while it lasted.', { triggered: true }),
    endSourceStatusIdsOnExpire: S('expiry', 'statusIds', "End these statuses on the user", "When it ends, removes these statuses from the character who applied it.", { advanced: true }),

    // ------------------------------------------------------------- linking and recording
    linkedTargetStatusId: S('linking', 'statusId', 'Linked target status', 'Links this status to a status on one target, so effects can find that target later.', { advanced: true }),
    copyTargetKeyToKeys: S('linking', 'statusSettingKeys', 'Record the target in', 'Saves which character was targeted under these names.', { advanced: true }),
    copyTargetSlotToKeys: S('linking', 'statusSettingKeys', "Record the target's position in", null, { advanced: true }),
    copyTargetUsernameToKeys: S('linking', 'statusSettingKeys', "Record the target's team in", null, { advanced: true }),
    copyTargetTotalSkillUseCountToKeys: S('linking', 'statusSettingKeys', "Record the target's skill count in", 'Used with "Effects when it ends, if the owner did nothing".', { advanced: true }),
    onOutgoingControlEffectExtendSourceStatus: S('linking', 'object', "Extend the user's status when the owner controls", "When the owner applies a Control effect, a status on the user gains turns.", { advanced: true, fields: {
        statusId: { kind: 'statusId', label: "User's status", required: true },
        amount: { kind: 'int', label: 'Extra turns', default: 1 },
    } }),
};

module.exports = { STATUS_GROUPS: GROUPS, STATUS_SETTINGS };
