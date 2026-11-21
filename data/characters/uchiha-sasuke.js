const PASSIVE_ICON = 'https://i.imgur.com/IkTLWta.png';
const SHADOW_SHURIKEN = 'uchiha-sasuke-shadow-shuriken-technique';
const NINJA_WIRE_TRAP = 'uchiha-sasuke-ninja-wire-trap';
const CHIDORI = 'uchiha-sasuke-chidori';
const SASUKE_EVASION = 'uchiha-sasuke-sasuke-evasion';
const DRAGON_FLAME = 'uchiha-sasuke-dragon-flame-jutsu';
const SHARINGAN_AWAKENED = 'uchiha_sasuke_two_tomoe_sharingan_awakened';
const WIRE_TRAP_MARK = 'uchiha_sasuke_ninja_wire_trap';
const WIRE_TRAP_STUN = 'uchiha_sasuke_ninja_wire_trap_stun';

const AWAKENED_TOOLTIP = 'Two-Tomoe Sharingan has awakened. Chidori is available, and Shadow Shuriken Technique and Sasuke Evasion have 1 less cooldown.';

// The stun Ninja Wire Trap leaves behind. Dragon Flame Jutsu deals 15 more damage to its holder.
const wireTrapStun = {
    type: 'apply_status', statusId: WIRE_TRAP_STUN, duration: 1,
    metadata: {
        harmful: true, cannotUseSkillClasses: ['physical'],
        tooltipText: "This character's Physical skills are stunned by Ninja Wire Trap.",
    },
};

// Hidden from the marked enemy. If they skip using a new skill before it expires, they are stunned.
const wireTrapMarkMetadata = {
    harmful: true, ongoingClass: 'control', invisible: true, hideTooltipFromUnitOwner: true,
    copyTargetTotalSkillUseCountToKeys: ['skillUseCountSnapshot'],
    onExpireEffectsIfNoNewSkillUsed: [wireTrapStun],
    tooltipText: 'If this character does not use a new skill, their Physical skills will be stunned for 1 turn.',
};

const dragonFlameReadyMetadata = {
    helpful: true, invisible: true, hideTooltipFromEnemy: true,
    ongoingClass: 'control', controlIgnoresOwnerInvulnerability: true,
    skillReplacements: { [NINJA_WIRE_TRAP]: DRAGON_FLAME },
    tooltipText: 'Ninja Wire Trap is replaced by Dragon Flame Jutsu.',
};

// Each enemy hit takes 15 more if Ninja Wire Trap has stunned them (one hit, not a second instance).
const dragonFlameDamage = (amount, scope) => ({
    type: 'damage', amount, scope,
    condition: { scope: 'target', statusId: WIRE_TRAP_STUN, conditionalAmount: amount + 15 },
});

module.exports = {
    id: 'uchiha-sasuke', characterId: 'uchiha-sasuke', name: 'Uchiha Sasuke',
    facePicture: 'https://i.imgur.com/bwuEwsM.png',
    characterdeescription: "One of the last surviving members of the Uchiha clan, Sasuke is a gifted young shinobi driven by a single ambition: to avenge his family's massacre at the hands of his older brother, Itachi. A member of Team 7, Sasuke combines his natural talent with relentless training, mastering his clan's Fire Release techniques while gradually awakening the formidable power of the Sharingan.",
    passive: {
        name: 'Two-Tomoe Sharingan', icon: PASSIVE_ICON,
        description: 'Quest: Sasuke uses 4 skills. Each other member of Team 7 on his team counts as 1 skill.\n\nReward: Sasuke awakens his Sharingan, unlocking Chidori and enhancing Shadow Shuriken Technique and Sasuke Evasion.',
        awakening: {
            statusId: SHARINGAN_AWAKENED,
            afterOwnerSkillUses: 4,
            allyCharacterIdsProgress: ['uzumaki-naruto', 'haruno-sakura'],
            clearCooldownSkillIds: [SHADOW_SHURIKEN],
            progressTooltipTextTemplate: 'Quest: Sasuke uses 4 skills. Each other member of Team 7 on his team counts as 1 skill. Progress: {awakeningSkillUses}/4.\n\nReward: Sasuke awakens his Sharingan, unlocking Chidori and enhancing Shadow Shuriken Technique and Sasuke Evasion.',
            completedTooltipText: AWAKENED_TOOLTIP,
            metadata: {
                helpful: true, permanent: true, cannotBeCleansed: true,
                sourceSkillName: 'Two-Tomoe Sharingan',
                skillCooldownOverridesBySkillId: { [SHADOW_SHURIKEN]: 0, [SASUKE_EVASION]: 3 },
                tooltipText: AWAKENED_TOOLTIP,
            },
        },
    },
    skills: [
        {
            id: SHADOW_SHURIKEN, name: 'Shadow Shuriken Technique',
            skillimage: 'https://i.imgur.com/ynDNiUT.png',
            skilldescription: 'Sasuke deals 20 physical damage to an enemy. For 1 turn, the first enemy to use a skill on Sasuke will be affected by Ninja Wire Trap. While Two-Tomoe Sharingan is active, this skill\'s cooldown is reduced by 1.',
            energy: ['Taijutsu'], target: 'single-enemy', damage: 0, cooldown: 1,
            classes: ['Physical', 'Instant'],
            effects: [
                { type: 'damage', amount: 20, scope: 'target' },
                {
                    type: 'apply_status', statusId: 'uchiha_sasuke_shadow_shuriken_trap', duration: 1, scope: 'self',
                    metadata: {
                        helpful: true,
                        // Not a counter: the enemy's skill still resolves. The trap is consumed on the first one.
                        triggerOnEnemyHarmfulSkill: true, counterCancelsSkill: false,
                        counterStatusId: WIRE_TRAP_MARK, counterStatusDuration: 1,
                        counterStatusMetadata: wireTrapMarkMetadata,
                        // The marked enemy has already acted this turn, so the trap checks their next turn.
                        // This delay ends with that check, then Dragon Flame Jutsu replaces Ninja Wire Trap
                        // for Sasuke's following turn, when the stun (if any) is active.
                        counterApplyStatusToRecipient: {
                            statusId: 'uchiha_sasuke_dragon_flame_delay', duration: 2,
                            metadata: {
                                helpful: true, invisible: true, hideTooltipFromEnemy: true,
                                turnDurationAnchor: 'any_turn',
                                onExpireApplyStatusToSelf: {
                                    statusId: 'uchiha_sasuke_dragon_flame_ready', duration: 1,
                                    metadata: dragonFlameReadyMetadata,
                                },
                                tooltipText: 'Ninja Wire Trap will be replaced by Dragon Flame Jutsu after the trapped enemy\'s next turn.',
                            },
                        },
                        tooltipText: 'The first enemy to use a harmful skill on Sasuke will be affected by Ninja Wire Trap.',
                    },
                },
            ],
        },
        {
            id: NINJA_WIRE_TRAP, name: 'Ninja Wire Trap',
            skillimage: 'https://www.animehistory.org/uploads/screencaps/naruto-episode-030-the-sharingan-revived-dragon-flame-jutsu_/cap_07-13_8a50.jpg',
            skilldescription: 'Sasuke targets an enemy for 1 turn, invisible to them. If the target does not use a skill during this turn, their physical skills will be stunned for 1 turn. The following turn, this skill is replaced by Dragon Flame Jutsu.',
            energy: [], target: 'single-enemy', damage: 0, cooldown: 0,
            classes: ['Strategic', 'Control'],
            effects: [
                { type: 'apply_status', statusId: WIRE_TRAP_MARK, duration: 1, scope: 'target',
                    metadata: wireTrapMarkMetadata },
                { type: 'apply_status', statusId: 'uchiha_sasuke_dragon_flame_ready', duration: 1, scope: 'self',
                    metadata: dragonFlameReadyMetadata },
            ],
        },
        {
            id: CHIDORI, name: 'Chidori',
            skillimage: 'https://i.imgur.com/ApGd3KB.png',
            skilldescription: 'Requires Two-Tomoe Sharingan. Sasuke deals 45 piercing chakra damage to an enemy.',
            energy: ['Ninjutsu', 'Random'], target: 'single-enemy', damage: 0, cooldown: 1,
            actorCondition: { statusId: SHARINGAN_AWAKENED },
            classes: ['Chakra', 'Instant'],
            effects: [
                { type: 'damage', amount: 45, scope: 'target', metadata: { ignoreDamageReduction: true } },
            ],
        },
        {
            id: SASUKE_EVASION, name: 'Sasuke Evasion',
            skillimage: 'https://i.imgur.com/dC3c6Vs.png',
            skilldescription: 'Sasuke becomes invulnerable for 1 turn. While Two-Tomoe Sharingan is active, this skill\'s cooldown is reduced by 1.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [
                { type: 'apply_status', statusId: 'invulnerable', duration: 1, scope: 'self',
                    metadata: { helpful: true, invulnerable: true, tooltipText: 'This character is invulnerable.' } },
            ],
        },
        {
            id: DRAGON_FLAME, name: 'Dragon Flame Jutsu',
            skillimage: 'https://i.imgur.com/60VDgWY.png',
            skilldescription: 'Sasuke deals 20 chakra damage to an enemy and 10 chakra damage to all other enemies. Enemies affected by Ninja Wire Trap take an additional 15 chakra damage.',
            energy: ['Bloodline'], target: 'single-enemy', damage: 0, cooldown: 0,
            classes: ['Chakra', 'Instant'],
            effects: [
                dragonFlameDamage(20, 'target'),
                dragonFlameDamage(10, 'other-enemies'),
            ],
        },
    ],
};
