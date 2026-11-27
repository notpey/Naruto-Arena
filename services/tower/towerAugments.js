// Tower 2.0 augment catalog: the 100 source augments (A001-A100) from the user's sheet,
// read 2026-11-22. `original` is the sheet text, byte for byte; never edit it. Everything
// the game does with an entry is in `impl` (operational) or `needs` (not operational yet,
// naming the missing engine hook). Entries without `impl` are never offered.
//
// impl fields (all optional):
//   metadata          status metadata on the permanent scroll status (battleLogic keys)
//   metadataForUnit   (unit) => extra metadata that needs the unit's skills (heal bonuses)
//   battleStart       [{ scope: 'each'|'leader', duration, metadata }] extra statuses applied
//                     when a Tower battle starts (destructible defense, first-hit bonuses)
//   setup             run-side battle setup: { randomChakra, teamHpLoss, blessingCommons }
//   normalized        the exact rule the code implements (shown to the player)
//
// Scope: every source row is worded for "your characters"/"your team", so every entry is
// team-scoped (one copy per team). See docs/tower-augment-decisions.md.

const ALL_SKILLS = (amount) => (unit) => ({
    skillHealingBonuses: Object.fromEntries((unit?.skillIds || []).map((id) => [id, amount])),
});

const ddStart = (points, name) => ({
    scope: 'each', duration: 99,
    metadata: {
        destructibleDefensePoints: points, activeOnlyWithDestructibleDefense: true,
        tooltipText: `${name}: ${points} destructible defense from the start of the battle.`,
    },
});

const HOOK = {
    firstSkillCost: 'a per-battle "first qualifying skill" cost modifier (cost threshold + once-per-battle flag)',
    damageThreshold: 'a hook that adds damage based on the skill\'s own base damage',
    nonDamageSkillTrigger: 'an on-use trigger filtered to skills with no damage effect',
    stunDuration: 'an incoming-stun duration modifier with a once-per-battle flag',
    spendTrigger: 'a team chakra-spent-per-turn trigger',
    firstPhysicalDot: 'a once-per-character trigger that applies a status on a skill\'s first physical hit',
    mentalFirstUse: 'a per-skill-class first-use cost modifier',
    afflictionInstance: 'an affliction-damage modifier tracked per target per turn',
    allyDeathTrigger: 'an on-ally-death trigger that applies statuses to surviving allies',
    teamAfflictionTrigger: 'a team-wide on-affliction-damage-dealt trigger with a per-turn cap',
    lifestealCap: 'a per-turn cap on lifesteal healing',
    skillEcho: 'a damage-only skill echo (repeat hit without secondary effects or on-hit triggers)',
    teamSkillCounter: 'a team-wide counter of damaging skills used, with every-Nth bonus hits',
    stunPrevention: 'a once-per-battle stun prevention trigger',
    cooldownByBase: 'a cooldown modifier filtered by base cooldown and excluding invulnerability skills',
    secondaryHit: 'an on-direct-damage trigger that hits a different random enemy, once per character per turn',
    consecutiveTurns: 'per-character consecutive-turn tracking with resets',
    teamFirstThreshold: 'a once-per-battle, team-wide low-health trigger',
    sameTypeSpend: 'a chakra-type-aware spend trigger',
    ddGainTrigger: 'an on-destructible-defense-gained trigger',
    healReceivedDebuffOnAffliction: 'an on-affliction-damage trigger that applies a heal-received debuff to the target',
    firstDamagedBy: 'per-attacker memory of the first enemy to damage each character',
    counterTrigger: 'an on-successful-counter trigger',
    costSpendDamage: 'an on-use trigger filtered by total chakra paid',
    healAllyTrigger: 'an on-heal-ally trigger',
    outgoingStunDuration: 'an outgoing-stun duration modifier with a once-per-battle flag',
    enemyDeathTrigger: 'an on-any-enemy-death trigger for the whole team',
    perTargetSkillMemory: 'per-target memory of which skills have hit it',
    ddBreakTrigger: 'an on-destructible-defense-destroyed trigger',
    stunCostTrigger: 'an on-stun-applied trigger that raises the target\'s next skill cost',
    teamFocusTrigger: 'per-turn tracking of which allies damaged which enemy',
    undamagedTurnHeal: 'an undamaged-this-turn end-of-turn heal',
    ignoreDrFirstSkill: 'a first-direct-skill-per-turn damage-reduction pierce',
    survivedHitTrigger: 'an on-survived-hit trigger keyed to remaining health',
    revive: 'a delayed revive (death, then return at a later turn start)',
    teamDeathPrevention: 'a once-per-battle prevention of the final ally\'s death',
    ignoreDefenses: 'an outgoing ignore-damage-reduction-and-destructible-defense key for all direct damage',
    turnNumberTrigger: 'a battle-turn-number trigger (stun all enemies on turn 4)',
    teamFirstDamageTrigger: 'a team-wide first-damage-each-turn trigger that applies a DoT',
    rearmingCounter: 'a counter that re-arms every 3 turns per character',
    deathDrPerAlly: 'damage reduction per dead ally (damage part exists, reduction part does not)',
    killerRetaliation: 'an on-killed-by-enemy retaliation trigger',
    turnCycleTrigger: 'a every-Nth-turn start-of-turn trigger',
    turnStartHeal: 'a start-of-turn heal that doubles below a health threshold',
    firstEnemySkillCounter: 'a team-wide first-enemy-harmful-skill counter with a stun',
    healSplash: 'a heal-splash-to-other-allies trigger',
    enemySpendTrigger: 'an enemy-skill-cost trigger with a per-turn cap',
    lastAlive: 'a "only one ally alive" condition',
    weakenedRevive: 'a delayed revive that also lowers maximum health',
    randomBoonAtStart: 'a seeded random choice of one boon at battle start',
    enemyDeathTeamGrowth: 'an on-any-enemy-death chakra gain plus a growing team damage bonus',
    durationExtension: 'an outgoing helpful-status duration extension with a cap',
    spendRefund: 'a team chakra-spent-per-turn refund',
    deathBlast: 'an on-owner-death damage-all-enemies trigger',
    chakraRoulette: 'a turn-start random chakra type discount with a minimum total cost of 1',
    cursedStacks: 'on-damaging-skill self stacks with turn-end self damage while stacked',
    chakraSkillCounter: 'a team-wide chakra-skill counter with a damage-only echo',
    bigHitTrigger: 'an on-single-skill-damage-at-least trigger',
    gamble: 'a seeded turn-start gamble between chakra and self damage',
    hpForCost: 'a player choice to pay health instead of chakra (needs a new client prompt)',
    banishOnDeath: 'a "remove from combat for 1 turn instead of dying" mechanic',
    counterReflect: 'an on-successful-counter reflect of the countered skill\'s damage',
    evolution: 'an every-3-turns random team boon',
    classTrio: 'per-turn tracking of skill classes used by the team',
    deathMark: 'per-enemy consecutive-turn tracking with a burst',
    harmfulExtension: 'an outgoing harmful-status duration extension, once per application',
    overhealToDd: 'an overheal-to-destructible-defense conversion',
    damageShare: 'redistribution of incoming direct damage across allies',
    enemyChakraBurn: 'an enemy chakra-spent affliction trigger with a per-turn cap',
    copySkill: 'a temporary copied skill added to a character\'s skill bar',
    teamChakraGrowth: 'a team-wide chakra-skill damage stack',
    executeBonus: 'a low-health piercing bonus hit limited to once per target per turn',
    lastBreath: 'a delayed death (stay at 1 health until the end of the next turn)',
};

// [number, name, tier, original sheet text, impl | null, needs (when impl is null)]
const SOURCE = [
    // ------------------------------------------------------------ Common
    [1, 'Chakra Efficiency', 'common', 'The first skill you use each battle that costs 2 or more chakra costs 1 less random chakra.', null, HOOK.firstSkillCost],
    [2, 'Iron Skin', 'common', 'Your characters begin each battle with 10 destructible defense.', {
        battleStart: [ddStart(10, 'Iron Skin')],
        normalized: 'Each living ninja starts every battle with 10 destructible defense.',
    }],
    [3, 'Precision Training', 'common', 'The first damaging skill each character uses deals 5 additional damage.', {
        battleStart: [{ scope: 'each', duration: 99, metadata: {
            nextAttackDamageBonusFlat: 5, tooltipText: 'Precision Training: the next damaging skill deals 5 additional damage.' } }],
        normalized: 'Each ninja\'s first damaging skill in a battle deals 5 additional damage.',
    }],
    [4, 'Medical Training', 'common', 'Your healing skills restore 5 additional health.', {
        metadataForUnit: ALL_SKILLS(5),
        normalized: 'Your ninjas\' skills that heal restore 5 additional health (per heal effect).',
    }],
    [5, 'Chakra Reserves', 'common', 'Begin each battle with 1 additional random chakra.', {
        setup: { randomChakra: 1 },
        normalized: 'Begin each battle with 1 additional random chakra.',
    }],
    [6, 'Steady Hands', 'common', "Your characters' skills that deal 10 or less damage deal 5 additional damage.", null, HOOK.damageThreshold],
    [7, 'Defensive Stance', 'common', 'Whenever a character uses a skill that deals no damage, they gain 5 damage reduction for 1 turn.', null, HOOK.nonDamageSkillTrigger],
    [8, 'Second Wind', 'common', 'The first time each character falls below 50 health, they heal 10 health.', {
        metadata: { passive: true, onFirstHpAtMost: { threshold: 49, heal: 10 } },
        normalized: 'Once per battle, the first time each ninja drops to 49 health or less from damage, they heal 10.',
    }],
    [9, 'Quick Recovery', 'common', 'The first time each character is stunned, reduce the duration of that stun by 1 turn, to a minimum of 0.', null, HOOK.stunDuration],
    [10, 'Reinforced Armor', 'common', 'Your destructible defense gains 5 additional points whenever it is applied.', {
        metadata: { passive: true, destructibleDefenseBonusGranted: 5 },
        normalized: 'Destructible defense your ninjas\' skills grant to your team gains 5 points.',
    }],
    [11, 'Chakra Discipline', 'common', 'Once per battle, spending 3 or more chakra in one turn refunds 1 random chakra.', null, HOOK.spendTrigger],
    [12, 'Tactical Advantage', 'common', 'Your characters deal 5 additional damage to enemies affected by a stun.', {
        metadata: { towerBonusDamageVsStunned: 5 },
        normalized: 'Your ninjas\' skill hits deal 5 additional damage to a stunned enemy.',
    }],
    [13, 'Poisoned Weapons', 'common', 'The first physical damaging skill each character uses deals 5 affliction damage for 2 turns.', null, HOOK.firstPhysicalDot],
    [14, 'Battle Hardened', 'common', 'Your characters gain 5 damage reduction while below 50 health.', {
        metadata: { damageReductionFlat: 5, activeWhileOwnerCurrentHpAtMost: 49 },
        normalized: 'Your ninjas have 5 damage reduction while at 49 health or less.',
    }],
    [15, 'Sharpened Kunai', 'common', 'Your physical skills deal 5 additional damage.', {
        metadata: { damageBonusBySkillClass: { Physical: 5 } },
        normalized: 'Your ninjas\' Physical skills deal 5 additional damage.',
    }],
    [16, 'Focused Chakra', 'common', 'Your chakra skills deal 5 additional damage.', {
        metadata: { damageBonusBySkillClass: { Chakra: 5 } },
        normalized: 'Your ninjas\' Chakra skills deal 5 additional damage.',
    }],
    [17, 'Mental Clarity', 'common', 'Your mental skills cost 1 less random chakra the first time they are used each battle, if they have a random chakra cost.', null, HOOK.mentalFirstUse],
    [18, 'Lingering Pain', 'common', 'Your affliction damage is increased by 5 per damage instance, once per target per turn.', null, HOOK.afflictionInstance],
    [19, 'Protective Instinct', 'common', 'Whenever an ally dies, surviving allies gain 10 destructible defense.', null, HOOK.allyDeathTrigger],
    [20, 'Opportunist', 'common', 'Your characters deal 5 additional damage to enemies below 50 health.', {
        metadata: { towerBonusDamageVsTargetHpBelow: { below: 50, amount: 5 } },
        normalized: 'Your ninjas\' skill hits deal 5 additional damage to an enemy below 50 health.',
    }],

    // ------------------------------------------------------------ Rare
    [21, 'Chakra Leech', 'rare', 'The first time each turn your team deals affliction damage, gain 1 random chakra.', null, HOOK.teamAfflictionTrigger],
    [22, 'Bloodthirsty', 'rare', 'Whenever a character deals direct damage, they heal for 20% of the damage dealt, rounded down. Maximum 15 healing per turn per character.', null, HOOK.lifestealCap],
    [23, 'Shadow Clone Training', 'rare', 'The first damaging skill used by each character each battle repeats, dealing 50% of its original damage to the same target. Secondary effects do not repeat.', null, HOOK.skillEcho],
    [24, 'Explosive Tags', 'rare', 'Every third damaging skill your team uses deals 10 additional damage to all enemies.', null, HOOK.teamSkillCounter],
    [25, 'Unbreakable Will', 'rare', 'The first time each character would be stunned, prevent the stun and gain 10 damage reduction for 1 turn.', null, HOOK.stunPrevention],
    [26, 'Forbidden Knowledge', 'rare', 'Your skills with cooldowns of 3 or more have their cooldowns reduced by 1 turn, excluding invulnerability skills.', null, HOOK.cooldownByBase],
    [27, 'Chain Lightning', 'rare', 'Whenever a chakra skill deals direct damage to an enemy, deal 10 damage to a different random enemy. Once per character per turn.', null, HOOK.secondaryHit],
    [28, 'Relentless Assault', 'rare', 'Whenever a character uses a damaging skill on consecutive turns, increase their direct damage by 5, stacking up to 20. Reset when they use a non-damaging skill.', null, HOOK.consecutiveTurns],
    [29, "Executioner's Mark", 'rare', 'Whenever a character damages an enemy below 30 health, deal 10 additional piercing damage. Once per target per turn.', null, HOOK.executeBonus],
    [30, 'Emergency Healing', 'rare', 'The first time each battle an ally falls below 25 health, heal them for 20 health.', null, HOOK.teamFirstThreshold],
    [31, 'Chakra Conversion', 'rare', 'Once per turn, when your team spends 2 chakra of the same type, gain 1 random chakra of a different type.', null, HOOK.sameTypeSpend],
    [32, 'Sand Armor', 'rare', 'Whenever a character gains destructible defense, they also gain 10 damage reduction for 1 turn.', null, HOOK.ddGainTrigger],
    [33, 'Venomous Touch', 'rare', "Whenever a character deals affliction damage, reduce the target's healing received by 25% for 1 turn.", null, HOOK.healReceivedDebuffOnAffliction],
    [34, 'Sharingan Insight', 'rare', "The first time an enemy successfully damages each character, that character's next damaging skill against that enemy deals 15 additional damage.", null, HOOK.firstDamagedBy],
    [35, 'Perfect Timing', 'rare', 'Whenever a character successfully counters an enemy skill, reduce the cooldown of one of their other skills by 1 turn.', null, HOOK.counterTrigger],
    [36, 'Desperate Measures', 'rare', 'Your characters deal 20% additional direct damage while below 30 health.', {
        metadata: { towerDirectDamagePercent: 20, activeWhileOwnerCurrentHpAtMost: 29 },
        normalized: 'While at 29 health or less, a ninja\'s direct (non-affliction) skill hits deal 20% more damage, rounded down.',
    }],
    [37, 'Chakra Overload', 'rare', 'Whenever a character uses a skill costing 3 or more chakra, deal 10 piercing damage to a random enemy.', null, HOOK.costSpendDamage],
    [38, 'Vengeful Spirit', 'rare', 'Whenever an ally dies, your surviving characters permanently deal 10 additional damage for the remainder of the battle.', {
        metadata: { damageBonusPerDeadAlly: { amount: 10 } },
        normalized: 'Your ninjas deal 10 additional damage for each dead ally in this battle.',
    }],
    [39, "Guardian's Oath", 'rare', 'Whenever a character heals an ally, both gain 10 destructible defense.', null, HOOK.healAllyTrigger],
    [40, 'Lingering Genjutsu', 'rare', 'The first stun each character applies each battle lasts 1 additional turn, to a maximum of 2 turns total.', null, HOOK.outgoingStunDuration],
    [41, "Predator's Instinct", 'rare', "Whenever an enemy dies, reduce all your living characters' active cooldowns by 1 turn.", null, HOOK.enemyDeathTrigger],
    [42, 'Unstable Chakra', 'rare', 'At the start of each battle, gain 3 random chakra. At the end of your first turn, lose up to 2 unspent chakra.', {
        setup: { randomChakra: 3 },
        battleStart: [{ scope: 'leader', duration: 1, metadata: {
            turnEndRemoveRandomChakra: 2, tooltipText: 'Unstable Chakra: at the end of this turn, lose up to 2 unspent chakra.' } }],
        normalized: 'Begin each battle with 3 additional random chakra; at the end of your first turn, lose up to 2 random unspent chakra.',
    }],
    [43, 'Thousand Cuts', 'rare', 'Each time a character damages the same enemy with a new skill, increase their damage against that enemy by 5, stacking up to 20.', null, HOOK.perTargetSkillMemory],
    [44, 'Resilient Defense', 'rare', "When a character's destructible defense is destroyed, they gain 15 damage reduction for 1 turn.", null, HOOK.ddBreakTrigger],
    [45, 'Chakra Suppression', 'rare', "The first time each turn your team stuns an enemy, increase that enemy's next skill cost by 1 random chakra for 1 turn.", null, HOOK.stunCostTrigger],
    [46, 'Perfect Synchronization', 'rare', 'When two or more allies damage the same enemy in one turn, the second and subsequent attacks deal 10 additional damage.', null, HOOK.teamFocusTrigger],
    [47, 'Rejuvenation', 'rare', 'At the end of each turn, heal each character for 5 health if they did not take damage that turn.', null, HOOK.undamagedTurnHeal],
    [48, 'Piercing Focus', 'rare', "Your characters' first direct damaging skill each turn ignores 10 points of damage reduction.", null, HOOK.ignoreDrFirstSkill],
    [49, 'Unfinished Business', 'rare', 'The first time an enemy survives a damaging skill with 10 or less health, deal 5 additional piercing damage to them.', null, HOOK.survivedHitTrigger],
    [50, 'Unrelenting Pressure', 'rare', 'Enemies damaged by your team on consecutive turns receive 10% additional direct damage from your team, stacking up to 30%. Resets after a turn without damage.', null, HOOK.consecutiveTurns],

    // ------------------------------------------------------------ Forbidden
    [51, 'Edo Tensei', 'forbidden', 'The first time each battle an ally dies, revive them at the start of your next turn with 30 health. Each character can be revived only once.', null, HOOK.revive],
    [52, 'Eight Gates', 'forbidden', 'Your characters deal 50% additional direct damage, but take 10 affliction damage that ignores invulnerability at the end of each turn.', {
        metadata: { towerDirectDamagePercent: 50, turnEndHealthLoss: 10 },
        normalized: 'Your ninjas\' direct (non-affliction) skill hits deal 50% more damage, rounded down. Each ninja loses 10 health at the end of your turn (health loss ignores invulnerability, damage reduction and destructible defense).',
    }],
    [53, 'Infinite Chakra', 'forbidden', 'The first skill each character uses each turn costs 1 less random chakra, or 1 less chakra of a required type if no random cost exists. Minimum cost: 1 chakra.', null, HOOK.firstSkillCost],
    [54, 'Izanagi', 'forbidden', "Once per battle, the first time your team would lose its final living character, prevent that character's death and restore them to 50 health.", null, HOOK.teamDeathPrevention],
    [55, 'Six Paths Power', 'forbidden', "Your characters' direct damage ignores damage reduction and destructible defense. It does not ignore invulnerability.", null, HOOK.ignoreDefenses],
    [56, 'Perfect Susanoo', 'forbidden', 'Your characters begin each battle with 30 destructible defense and 10 damage reduction.', {
        metadata: { damageReductionFlat: 10 },
        battleStart: [ddStart(30, 'Perfect Susanoo')],
        normalized: 'Each living ninja starts every battle with 30 destructible defense, and your ninjas have 10 damage reduction.',
    }],
    [57, 'Infinite Tsukuyomi', 'forbidden', 'At the beginning of turn 4, stun all enemies for 1 turn. This effect occurs once per battle and cannot be extended.', null, HOOK.turnNumberTrigger],
    [58, 'Rinne Rebirth', 'forbidden', 'Whenever an ally dies, all surviving allies heal for 25 health and gain 1 random chakra.', null, HOOK.allyDeathTrigger],
    [59, 'Amaterasu', 'forbidden', 'The first time each turn your team damages an enemy, apply 10 affliction damage for 2 turns. This effect does not stack.', null, HOOK.teamFirstDamageTrigger],
    [60, 'Flying Thunder God', 'forbidden', 'The first harmful skill targeting each character every 3 turns is countered. This does not counter skills that ignore counters.', null, HOOK.rearmingCounter],
    [61, 'The Will of Fire', 'forbidden', 'Whenever an ally dies, surviving allies permanently gain 15 additional direct damage and 10 damage reduction for the remainder of the battle.', null, HOOK.deathDrPerAlly],
    [62, 'Reaper Death Seal', 'forbidden', 'Once per battle, when an enemy kills one of your characters, that enemy takes 40 piercing damage that ignores invulnerability.', null, HOOK.killerRetaliation],
    [63, 'Ten-Tails Chakra', 'forbidden', 'At the start of every third turn, gain 2 random chakra and heal all allies for 10 health.', null, HOOK.turnCycleTrigger],
    [64, 'Forbidden Regeneration', 'forbidden', 'At the start of each turn, your characters heal for 10 health. Healing is doubled while below 30 health.', null, HOOK.turnStartHeal],
    [65, 'Kotoamatsukami', 'forbidden', 'The first time each battle an enemy uses a harmful skill, counter that skill and stun its user for 1 turn.', null, HOOK.firstEnemySkillCounter],
    [66, "Indra's Wrath", 'forbidden', 'Every fourth damaging skill your team uses deals an additional 30 piercing damage to its primary target.', null, HOOK.teamSkillCounter],
    [67, "Asura's Blessing", 'forbidden', 'Whenever a character heals an ally, all other living allies are healed for 50% of the amount restored, rounded down.', null, HOOK.healSplash],
    [68, 'Sage Mode', 'forbidden', "Your characters' damaging skills deal 15 additional damage, and their healing skills restore 10 additional health.", {
        metadata: { damageBonusFlat: 15 },
        metadataForUnit: ALL_SKILLS(10),
        normalized: 'Your ninjas\' skill damage effects deal 15 additional damage, and their skills that heal restore 10 additional health (per heal effect).',
    }],
    [69, 'Chakra Absorption', 'forbidden', 'The first time each turn an enemy uses a skill costing 2 or more chakra, gain 1 random chakra.', null, HOOK.enemySpendTrigger],
    [70, 'The Last Stand', 'forbidden', 'When only one ally remains alive, that character gains 50% additional direct damage, 20 damage reduction, and heals 10 health at the start of each turn.', null, HOOK.lastAlive],
    [71, 'Impure Resurrection', 'forbidden', 'The first ally to die each battle returns with 50 health after 1 turn, but permanently loses 10 maximum health.', null, HOOK.weakenedRevive],
    [72, 'Forbidden Experimentation', 'forbidden', 'At the beginning of each battle, randomly gain one of three effects: +25% direct damage, +15 damage reduction, or +10 healing per turn.', null, HOOK.randomBoonAtStart],
    [73, 'Heavenly Restriction', 'forbidden', 'Your physical skills deal 50% additional direct damage, but your chakra and mental skills cost 1 additional random chakra.', {
        metadata: {
            towerDirectDamagePercent: 50, towerDirectDamagePercentSkillClassesAny: ['Physical'],
            randomCostIncreaseForSkillClasses: { Chakra: 1, Mental: 1 },
        },
        normalized: 'Your ninjas\' Physical skills deal 50% more direct (non-affliction) damage, rounded down. Their Chakra and Mental skills cost 1 additional random chakra (+1 total for a skill that is both).',
    }],
    [74, 'Chakra Devourer', 'forbidden', "Whenever an enemy dies, gain 2 random chakra and permanently increase your team's direct damage by 5 for the remainder of the battle.", null, HOOK.enemyDeathTeamGrowth],
    [75, 'The Immortal Body', 'forbidden', 'Your characters cannot be reduced below 1 health during the first 2 turns of each battle.', {
        battleStart: [{ scope: 'each', duration: 2, metadata: {
            minimumHp: 1, tooltipText: 'The Immortal Body: cannot be reduced below 1 health.' } }],
        normalized: 'For the first 2 turns of each battle (the engine\'s 2-turn status timer), your ninjas cannot be reduced below 1 health.',
    }],
    [76, 'Shadow Clone Army', 'forbidden', 'The first direct damaging skill each character uses every 3 turns repeats at 50% damage against a random living enemy. Secondary effects do not repeat.', null, HOOK.skillEcho],
    [77, 'Forbidden Pact', 'forbidden', 'Your characters deal 40% additional direct damage, but healing received is reduced by 50%.', {
        metadata: { towerDirectDamagePercent: 40, healReceivedMultiplier: 0.5 },
        normalized: 'Your ninjas\' direct (non-affliction) skill hits deal 40% more damage, rounded down; healing they receive is halved.',
    }],
    [78, 'The Perfect Vessel', 'forbidden', 'Whenever a character gains a temporary damage or defense boost, increase its duration by 1 turn, to a maximum of 4 turns.', null, HOOK.durationExtension],
    [79, 'Chakra Singularity', 'forbidden', 'Whenever your team spends 5 chakra, refund 2 random chakra. This can trigger once per turn.', null, HOOK.spendRefund],
    [80, 'The Final Technique', 'forbidden', 'When a character dies, they deal 25 piercing damage to all enemies. This effect ignores invulnerability and can trigger only once per character per battle.', null, HOOK.deathBlast],

    // ------------------------------------------------------------ Prismatic
    [81, 'Chakra Roulette', 'prismatic', 'At the beginning of each turn, randomly select one chakra type. Skills costing that type cost 1 less chakra this turn, minimum 1 total.', null, HOOK.chakraRoulette],
    [82, 'Cursed Seal', 'prismatic', 'Each time a character uses a damaging skill, they gain 5 additional direct damage, stacking up to 30. They also take 5 affliction damage at the end of each turn while they have stacks.', null, HOOK.cursedStacks],
    [83, 'Double Casting', 'prismatic', 'Every third chakra skill your team uses repeats its direct damage at 50% effectiveness. Secondary effects do not repeat.', null, HOOK.chakraSkillCounter],
    [84, 'Living Weapon', 'prismatic', 'Whenever a character deals 25 or more direct damage with one skill, they gain 10 destructible defense.', null, HOOK.bigHitTrigger],
    [85, 'The Gambler', 'prismatic', 'At the beginning of each turn, randomly gain either 2 chakra or take 15 piercing damage to a random ally.', null, HOOK.gamble],
    [86, 'Blood Sacrifice', 'prismatic', 'Whenever a character uses a skill costing 2 or more chakra, they may instead spend 15 health to reduce its cost by 1 random chakra.', null, HOOK.hpForCost],
    [87, 'Reverse Summoning', 'prismatic', 'Once per battle, when a character would die, remove them from combat for 1 turn. They return with 25 health.', null, HOOK.banishOnDeath],
    [88, 'Mirror Technique', 'prismatic', 'Whenever a character successfully counters a damaging skill, reflect 50% of its original direct damage to the attacker.', null, HOOK.counterReflect],
    [89, 'Unstable Evolution', 'prismatic', 'Every 3 turns, your characters randomly gain +10 direct damage, +10 damage reduction, or 15 destructible defense for 2 turns.', null, HOOK.evolution],
    [90, 'Perfect Balance', 'prismatic', 'Whenever your team uses a physical, chakra, and mental skill in the same turn, refund 2 random chakra.', null, HOOK.classTrio],
    [91, 'Death Mark', 'prismatic', 'Whenever your team damages the same enemy on 3 consecutive turns, deal 30 piercing damage to that enemy. Reset the count afterward.', null, HOOK.deathMark],
    [92, "The Puppet Master's Art", 'prismatic', 'Whenever a character applies a harmful effect lasting 2 or more turns, extend that effect by 1 turn, maximum once per application.', null, HOOK.harmfulExtension],
    [93, 'Forbidden Transfusion', 'prismatic', 'Whenever a character receives healing at full health, convert up to 20 excess healing into destructible defense.', null, HOOK.overhealToDd],
    [94, 'Soul Link', 'prismatic', 'Whenever a character takes direct damage, distribute 30% of that damage evenly among their living allies instead.', null, HOOK.damageShare],
    [95, 'Chakra Burn', 'prismatic', 'Whenever an enemy spends chakra, deal 5 affliction damage to them for each chakra spent, up to 15 per turn.', null, HOOK.enemyChakraBurn],
    [96, 'The Copy Ninja', 'prismatic', 'The first time each battle an enemy damages one of your characters, grant that character a temporary copy of the direct damage portion of that skill, usable once for 1 random chakra.', null, HOOK.copySkill],
    [97, 'Elemental Mastery', 'prismatic', 'Each time your team uses a chakra skill, increase subsequent chakra skill damage by 5 for the remainder of the battle, stacking up to 30.', null, HOOK.teamChakraGrowth],
    [98, 'Last Breath', 'prismatic', 'The first time each battle a character would die, they remain alive at 1 health until the end of their next turn, then die unless healed above 1 health.', null, HOOK.lastBreath],
    [99, 'Forbidden Exchange', 'prismatic', 'At the beginning of each battle, your team loses 30 total health distributed evenly among living allies and gains 4 random chakra.', {
        setup: { randomChakra: 4, teamHpLoss: 30 },
        normalized: 'At the start of each battle, your living ninjas lose 30 health split evenly (rounded down, never below 1 health) and your team gains 4 random chakra.',
    }],
    [100, "The Tower's Blessing", 'prismatic', 'At the beginning of each battle, gain the effects of two random Common Scrolls you do not already possess.', {
        setup: { blessingCommons: 2 },
        normalized: 'At the start of each battle, your team also gains the effects of two operational Common augments it does not own, chosen by the run seed for that floor.',
    }],
];

const slug = (name) => name.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const pad = (number) => String(number).padStart(3, '0');

const TAG_RULES = [
    ['chakra', /chakra/i], ['heal', /heal/i], ['defense', /destructible defense|damage reduction/i],
    ['affliction', /affliction/i], ['stun', /stun/i], ['death', /dies|die|death|revive/i],
    ['counter', /counter/i], ['random', /random/i], ['physical', /physical/i], ['mental', /mental/i],
    ['piercing', /piercing/i], ['cooldown', /cooldown/i],
];

const KANJI = { common: '凡', rare: '稀', forbidden: '禁', prismatic: '虹' };

// Entries run by the battle-event engine (towerAugmentEffects.js) and entries that cannot
// be built without a client/protocol change.
const { EVENT_RULES, BLOCKED } = require('./towerAugmentRules');
const resolveImpl = (code, impl) => impl || (EVENT_RULES[code] ? { engine: 'events', normalized: EVENT_RULES[code] } : null);

const AUGMENTS = SOURCE.map(([sourceNumber, sourceName, tier, original, staticImpl, needs]) => {
    const code = `A${pad(sourceNumber)}`;
    const impl = resolveImpl(code, staticImpl);
    return {
        id: `a${pad(sourceNumber)}-${slug(sourceName)}`,
        code: `A${pad(sourceNumber)}`,
        sourceNumber,
        sourceName,
        name: sourceName,
        tier,
        scope: 'team',
        kanji: KANJI[tier],
        tags: TAG_RULES.filter(([, pattern]) => pattern.test(original)).map(([tag]) => tag),
        eligibleCharacterIds: null,
        descriptionOriginal: original,
        descriptionNormalized: impl ? impl.normalized : null,
        implementationStatus: impl ? 'implemented' : BLOCKED[code] ? 'blocked' : 'pending',
        needs: impl ? null : BLOCKED[code] || `Not operational yet: needs ${needs}.`,
        stackPolicy: { max: 1 },
        impl: impl || null,
    };
});

const AUGMENTS_BY_ID = new Map(AUGMENTS.map((entry) => [entry.id, entry]));
const AUGMENTS_BY_CODE = new Map(AUGMENTS.map((entry) => [entry.code, entry]));

module.exports = { AUGMENTS, AUGMENTS_BY_ID, AUGMENTS_BY_CODE, slug };
