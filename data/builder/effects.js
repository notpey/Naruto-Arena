// Character Builder catalog: effect types.
//
// A skill's "effects" list runs in order when the skill resolves. Each effect has a type, who it
// lands on (scope), an optional condition, and the fields below. Every type and field here is read
// by battleLogic.js; descriptions say what the engine actually does with it.
//
// triggered: true marks the six types that also work inside lists a status runs later (counter
// effects, effects when the owner uses a skill, effects when a status expires). Other types only
// work directly in a skill's own effects list.
//
// Field kinds (shared by the whole catalog): int, number, bool, text, statusId, statusIds, skillId,
// skillIds, classes, chakraEffectType, scope, condition, enum, map (keyed object), effects, status.

const SCOPE_FIELD = { kind: 'scope', label: 'Lands on', description: 'Who this effect affects.', default: 'target' };
const CONDITION_FIELD = { kind: 'condition', label: 'Only if', description: 'The effect is skipped unless this condition is met.', optional: true };

const EFFECT_TYPES = {
    // ---------------------------------------------------------------- damage
    damage: {
        label: 'Deal damage', group: 'Damage', triggered: true,
        description: 'Deals damage. Damage reduction, destructible defense, invulnerability and damage bonuses apply unless the damage settings say otherwise.',
        fields: {
            amount: { kind: 'int', label: 'Damage', required: true, min: 0, max: 999 },
            scope: SCOPE_FIELD,
            condition: { ...CONDITION_FIELD, description: 'Skip the damage unless this is met. With "Use this damage instead" set, the damage always lands and the condition only picks between the two amounts.' },
        },
        settings: ['afflictionDamage', 'ignoreDamageReduction', 'ignoreDestructibleDefense', 'skillClasses',
            'bonusPerStatusMetadata', 'executeBelowHpThreshold', 'splitAmountEvenlyAmongRecipients', 'minimumHp',
            'cannotBeEvaded', 'damageSourceControlledStatusId', 'bonusFromStatusMetadataKey', 'randomScopeGroupKey',
            'alsoTargetMarkedStatusId'],
    },
    health_steal_damage: {
        label: 'Steal health', group: 'Damage', triggered: true,
        description: 'Deals damage that ignores damage reduction, and heals the user by the damage actually dealt.',
        fields: { amount: { kind: 'int', label: 'Damage', required: true, min: 0, max: 999 }, scope: SCOPE_FIELD, condition: CONDITION_FIELD },
        settings: ['afflictionDamage', 'ignoreDamageReduction', 'ignoreDestructibleDefense', 'skillClasses'],
    },
    damage_per_dead_ally: {
        label: 'Damage per fallen ally', group: 'Damage',
        description: "Deals this much damage for each of the user's dead allies (nothing if none are dead).",
        fields: { amountPerDeadAlly: { kind: 'int', label: 'Damage per dead ally', required: true, min: 0 }, scope: SCOPE_FIELD },
        settings: ['afflictionDamage', 'ignoreDamageReduction', 'ignoreDestructibleDefense', 'skillClasses'],
    },
    damage_per_lost_health_threshold: {
        label: 'Damage per health lost', group: 'Damage',
        description: 'Deals damage for every chunk of health the user has lost. Example: 10 damage per 30 health lost.',
        fields: {
            threshold: { kind: 'int', label: 'Health lost per step', default: 30, min: 1 },
            amountPerThreshold: { kind: 'int', label: 'Damage per step', required: true, min: 0 },
            scope: SCOPE_FIELD,
        },
        settings: ['afflictionDamage', 'ignoreDamageReduction', 'ignoreDestructibleDefense', 'skillClasses'],
    },
    damage_stacking_consecutive: {
        label: 'Damage that grows each use', group: 'Damage',
        description: 'Deals this much damage for every earlier use of this skill in the match (nothing on the first use).',
        fields: { stackAmount: { kind: 'int', label: 'Damage per earlier use', default: 5, min: 0 }, scope: SCOPE_FIELD },
        settings: ['afflictionDamage', 'ignoreDamageReduction', 'ignoreDestructibleDefense', 'skillClasses'],
    },
    HealthLoss: {
        label: 'Health loss', group: 'Damage', advanced: true,
        description: 'Removes health directly. It is not damage, so damage reduction, defense, damage bonuses and damage reactions do not apply.',
        fields: { amount: { kind: 'int', label: 'Health lost', required: true, min: 0 }, scope: SCOPE_FIELD, condition: CONDITION_FIELD },
    },
    destroy_destructible_defense: {
        label: 'Destroy destructible defense', group: 'Damage',
        description: "Removes the target's destructible defense. With an amount, removes up to that many points; without one, removes all of it.",
        fields: { amount: { kind: 'int', label: 'Points to remove (blank = all)', optional: true, min: 0 }, scope: SCOPE_FIELD },
    },
    execute_threshold: {
        label: 'Execute at low health', group: 'Damage',
        description: 'Kills the target outright if their health is at or below the threshold.',
        fields: { thresholdHp: { kind: 'int', label: 'Health threshold', required: true, min: 0, max: 100 }, scope: SCOPE_FIELD },
    },
    execute_below_hp: {
        label: 'Execute at low health (can be evaded)', group: 'Damage', advanced: true,
        description: 'Same as "Execute at low health", but respects class-based immunity and evasion.',
        fields: { threshold: { kind: 'int', label: 'Health threshold', required: true, min: 0, max: 100 }, scope: SCOPE_FIELD },
        settings: ['cannotBeEvaded'],
    },
    instant_kill: {
        label: 'Kill instantly', group: 'Damage',
        description: 'Kills the target regardless of health or protection. Usually paired with a condition.',
        fields: { scope: SCOPE_FIELD },
    },

    // ---------------------------------------------------------------- healing and health
    heal: {
        label: 'Heal', group: 'Healing', triggered: true,
        description: 'Restores health, up to maximum health. Healing bonuses and "cannot be healed" effects apply.',
        fields: { amount: { kind: 'int', label: 'Health restored', required: true, min: 0, max: 999 }, scope: SCOPE_FIELD, condition: CONDITION_FIELD },
    },
    heal_missing_health_percent: {
        label: 'Heal a share of missing health', group: 'Healing',
        description: 'Heals a percentage of the health the target is missing (rounded).',
        fields: { percent: { kind: 'int', label: 'Percent of missing health', required: true, min: 0, max: 100 }, scope: SCOPE_FIELD },
    },
    set_health: {
        label: 'Set health', group: 'Healing',
        description: 'Sets the target\'s health to exactly this amount (capped at maximum health).',
        fields: {
            amount: { kind: 'int', label: 'New health', required: true, min: 0, max: 100 },
            isHealingEffect: { kind: 'bool', label: 'Counts as healing', description: 'If on, characters who cannot be healed are not affected.' },
            scope: SCOPE_FIELD,
        },
    },
    set_hp_from_snapshot: {
        label: 'Restore saved health', group: 'Healing', advanced: true,
        description: 'Sets health back to a value an earlier effect saved under this key.',
        fields: { snapshotKey: { kind: 'text', label: 'Saved health key', required: true }, scope: SCOPE_FIELD },
    },

    // ---------------------------------------------------------------- statuses
    apply_status: {
        label: 'Apply a status', group: 'Statuses', triggered: true,
        description: 'Puts a status on the recipients. Statuses carry every lasting effect: stuns, invulnerability, damage over time, counters, skill swaps, bonuses and more. Its settings are listed under Status settings.',
        fields: {
            statusId: { kind: 'statusId', label: 'Status name (id)', required: true, defines: true },
            duration: { kind: 'int', label: 'Turns', required: true, min: 1, max: 99, description: '99 = permanent: the status never runs out.' },
            scope: SCOPE_FIELD,
            condition: CONDITION_FIELD,
            applyToSource: { kind: 'bool', label: 'Put it on the user instead', description: 'The status goes on the user, while still reacting to the chosen target.', advanced: true },
            fresh: { kind: 'bool', label: 'Starts fresh', description: "If on, the status does not count down at the end of the turn it was applied in.", advanced: true },
            applyPolicy: { kind: 'enum', label: 'When to apply', options: [
                { id: '', label: 'Always (re-applying keeps the longer duration, updates its settings, and adds to its counter)' },
                { id: 'if_missing_at_cast_start', label: "Only if the user didn't have it when the skill was used (self only)" },
            ], advanced: true },
        },
        settings: 'status',
    },
    remove_status: {
        label: 'Remove a status', group: 'Statuses',
        description: 'Removes one named status from the recipients.',
        fields: {
            statusId: { kind: 'statusId', label: 'Status to remove', required: true },
            scope: SCOPE_FIELD,
            condition: { ...CONDITION_FIELD, fields: ['statusFromActor'] },
        },
        settings: ['deferUntilAfterDamage', 'harmfulOnly', 'afflictionOnly'],
    },
    cleanse_statuses: {
        label: 'Remove statuses', group: 'Statuses', triggered: true,
        description: 'Removes statuses that match the filters below. Statuses marked "Cannot be removed by cleanses" stay.',
        fields: {
            scope: SCOPE_FIELD,
            condition: CONDITION_FIELD,
            harmfulOnly: { kind: 'bool', label: 'Harmful statuses only' },
            sourceRelation: { kind: 'enum', label: 'Applied by', options: [{ id: '', label: 'Anyone' }, { id: 'enemy', label: 'Enemies only' }] },
            statusId: { kind: 'statusId', label: 'Only this status', optional: true },
            statusIdsAny: { kind: 'statusIds', label: 'Only these statuses', optional: true },
            metadataAny: { kind: 'statusSettingKeys', label: 'Only statuses with any of these settings', optional: true, description: 'Example: "Affliction damage" removes only damage-over-time affliction statuses.' },
            sourceSkillClassesAny: { kind: 'classes', label: 'Only statuses from skills with these classes', optional: true },
            count: { kind: 'int', label: 'Remove at most', optional: true, min: 1 },
        },
    },
    cleanse_harmful: {
        label: 'Remove harmful statuses', group: 'Statuses', advanced: true,
        description: 'Removes harmful statuses (all of them, or at most a number).',
        fields: { scope: SCOPE_FIELD, condition: CONDITION_FIELD, count: { kind: 'int', label: 'Remove at most', optional: true, min: 1 } },
    },
    extend_status: {
        label: 'Extend a status', group: 'Statuses',
        description: 'Adds turns to a status the recipient already has.',
        fields: {
            targetStatusId: { kind: 'statusId', label: 'Status to extend', required: true },
            amount: { kind: 'int', label: 'Extra turns', required: true, min: 1 },
            scope: SCOPE_FIELD,
            condition: CONDITION_FIELD,
        },
    },
    trigger_status_effects: {
        label: 'Set off a status early', group: 'Statuses', advanced: true,
        description: "Runs a status's stored effects now (as if it expired), then removes it unless told to keep it.",
        fields: {
            statusId: { kind: 'statusId', label: 'Status', optional: true },
            statusIdsAny: { kind: 'statusIds', label: 'Or any of these statuses', optional: true },
            consumeMatchedStatus: { kind: 'bool', label: 'Remove it afterwards', default: true },
            scope: SCOPE_FIELD,
        },
    },

    // ---------------------------------------------------------------- chakra
    gain_chakra: {
        label: 'Gain chakra', group: 'Chakra', triggered: true,
        description: "Adds chakra to the user's team pool. Its condition is checked on the user.",
        fields: {
            amount: { kind: 'int', label: 'Chakra', required: true, min: 1, max: 10 },
            chakraType: { kind: 'chakraEffectType', label: 'Type', default: 'random' },
            condition: CONDITION_FIELD,
        },
    },
    remove_chakra: {
        label: 'Remove chakra', group: 'Chakra',
        description: "Removes chakra from the target's team pool. Characters immune to chakra removal are not affected.",
        fields: {
            amount: { kind: 'int', label: 'Chakra', required: true, min: 1, max: 10 },
            chakraType: { kind: 'chakraEffectType', label: 'Type', default: 'random' },
            scope: SCOPE_FIELD,
            condition: CONDITION_FIELD,
        },
    },
    remove_random_chakra: {
        label: 'Remove random chakra', group: 'Chakra',
        description: "Removes random chakra from the target's team pool.",
        fields: { amount: { kind: 'int', label: 'Chakra', required: true, min: 1, max: 10 }, scope: SCOPE_FIELD, condition: CONDITION_FIELD },
    },
    steal_chakra: {
        label: 'Steal chakra', group: 'Chakra',
        description: "Takes random chakra from the target's team and gives it to the user's team.",
        fields: { amount: { kind: 'int', label: 'Chakra', required: true, min: 1, max: 10 }, scope: SCOPE_FIELD, condition: CONDITION_FIELD },
    },
    drain_chakra_random_from_target_to_self: {
        label: 'Drain random chakra', group: 'Chakra',
        description: "Moves random chakra from the target's team to the user's team.",
        fields: {
            amount: { kind: 'int', label: 'Chakra', required: true, min: 1, max: 10 },
            scope: SCOPE_FIELD,
            condition: { ...CONDITION_FIELD, fields: ['consumeOnSuccessfulTransfer'] },
        },
    },
    drain_chakra_specific_from_target_to_self: {
        label: 'Drain one chakra type', group: 'Chakra',
        description: "Moves chakra of one type from the target's team to the user's team.",
        fields: {
            amount: { kind: 'int', label: 'Chakra', required: true, min: 1, max: 10 },
            chakraType: { kind: 'chakraEffectType', label: 'Type', required: true },
            scope: SCOPE_FIELD,
            condition: CONDITION_FIELD,
        },
    },
    drain_chakra_non_bloodline_from_target_to_self: {
        label: 'Drain non-Bloodline chakra', group: 'Chakra', advanced: true,
        description: "Moves chakra other than Bloodline from the target's team to the user's team.",
        fields: { amount: { kind: 'int', label: 'Chakra', required: true, min: 1, max: 10 }, scope: SCOPE_FIELD, condition: CONDITION_FIELD },
    },
    spend_all_chakra: {
        label: "Spend all of the user's chakra", group: 'Chakra', advanced: true,
        description: "Empties the user's team chakra pool.",
        fields: {},
    },
    gain_chakra_by_last_skill: {
        label: 'Gain chakra based on the last skill', group: 'Chakra', advanced: true,
        description: 'Gives chakra of a type chosen by which skill the user last used, as recorded on a status.',
        fields: {
            statusId: { kind: 'statusId', label: 'Status that records the last skill', required: true },
            map: { kind: 'map', keys: 'skillId', values: 'chakraEffectType', label: 'Chakra type per skill', required: true },
            amount: { kind: 'int', label: 'Chakra', default: 1, min: 1 },
        },
    },

    // ---------------------------------------------------------------- cooldowns and board
    modify_cooldowns: {
        label: 'Change cooldowns', group: 'Cooldowns',
        description: 'Adds to, lowers or sets the current cooldowns of the recipients\' skills.',
        fields: {
            amount: { kind: 'int', label: 'Turns', required: true, min: -10, max: 10, description: 'Negative lowers cooldowns.' },
            operation: { kind: 'enum', label: 'How', options: [{ id: 'add', label: 'Add (or lower if negative)' }, { id: 'set', label: 'Set to exactly' }], default: 'add' },
            skillIds: { kind: 'skillIds', label: 'Only these skills', optional: true },
            includeAllCharacterSkills: { kind: 'bool', label: 'Include every skill (also ones not on cooldown)', advanced: true },
            scope: SCOPE_FIELD,
            condition: CONDITION_FIELD,
        },
        settings: ['cannotBeEvaded'],
    },
    swap_positions: {
        label: 'Swap positions', group: 'Board', advanced: true,
        description: "Swaps the user's position on the board with the recipient's.",
        fields: { scope: SCOPE_FIELD },
    },
};

// Settings that sit on a damage (or other) effect itself rather than on a status. anyEffect: true
// marks the ones the engine reads on every effect type while choosing who the effect lands on.
const EFFECT_SETTINGS = {
    afflictionDamage: { kind: 'bool', label: 'Affliction damage', description: 'The damage ignores damage reduction and destructible defense. With the skill\'s Affliction class, it also passes invulnerability.' },
    ignoreDamageReduction: { kind: 'bool', label: 'Ignore damage reduction (piercing)' },
    ignoreDestructibleDefense: { kind: 'bool', label: 'Ignore destructible defense' },
    skillClasses: { kind: 'classes', label: 'Damage classes', description: "Classes this damage counts as, instead of the skill's. Used when one skill deals two kinds of damage." },
    bonusPerStatusMetadata: { kind: 'object', label: 'Bonus per counter', description: 'Adds damage for each point of a counter kept on a status. Example: 5 extra damage per Shadow Clone.', fields: {
        statusId: { kind: 'statusId', label: 'Status holding the counter', required: true },
        metadataKey: { kind: 'counterKey', label: 'Counter', required: true },
        multiplier: { kind: 'int', label: 'Damage per point', required: true },
        scope: { kind: 'enum', label: 'Counter is on', options: [{ id: 'self', label: 'The user' }, { id: 'target', label: 'The target' }], default: 'self' },
    } },
    executeBelowHpThreshold: { kind: 'int', label: 'Kill if left at or below', description: 'If this hit leaves the target at or below this much health, they die.' },
    splitAmountEvenlyAmongRecipients: { kind: 'bool', label: 'Split damage between everyone hit', description: 'The base damage is divided evenly among the recipients; bonuses then apply to each hit.' },
    minimumHp: { kind: 'int', label: "Can't reduce health below", description: 'This damage never takes the recipient below this much health. Useful for self-damage.' },
    cannotBeEvaded: { kind: 'bool', label: 'Cannot be evaded', advanced: true, anyEffect: true },
    damageSourceControlledStatusId: { kind: 'statusId', label: 'Dealt by the controlled enemy', advanced: true, description: 'The damage is dealt by the enemy this user controls with the named status, instead of by the user. Skipped if no enemy is controlled.' },
    bonusFromStatusMetadataKey: { kind: 'counterKey', label: "Add the status's counter to the damage", advanced: true, description: 'Inside a status\'s effects: adds the value of this counter on that status to the damage.' },
    randomScopeGroupKey: { kind: 'text', label: 'Same random pick as', advanced: true, anyEffect: true, description: 'Effects with the same key in one skill hit the same randomly chosen enemy.' },
    alsoTargetMarkedStatusId: { kind: 'statusId', label: 'Also hit characters marked with', advanced: true, anyEffect: true, description: 'Characters carrying this status from the user are hit as well as the chosen target.' },
    deferUntilAfterDamage: { kind: 'bool', label: 'Remove after the damage', description: "Waits until this skill's damage has landed before removing the status." },
    harmfulOnly: { kind: 'bool', label: 'Only if harmful', description: 'Only removes the status if it is a harmful one.' },
    afflictionOnly: { kind: 'bool', label: 'Only if it deals affliction damage', advanced: true },
};

module.exports = { EFFECT_TYPES, EFFECT_SETTINGS };
