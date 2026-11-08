const PIERCING_STAB = 'uchiha-obito-piercing-stab';
const GOUKAKYUU = 'uchiha-obito-goukakyuu-no-jutsu';
const PASSIVE_ICON = 'https://i.imgur.com/Mx3geZe.png';
// The skills Obito Sharingan improves: the ones that damage enemies.
const DAMAGING_SKILL_IDS = [PIERCING_STAB, GOUKAKYUU];

module.exports = {
    id: 'uchiha-obito',
    characterId: 'uchiha-obito',
    name: 'Uchiha Obito',
    facePicture: 'https://i.imgur.com/6lzbx9E.png',
    characterdeescription: 'A chuunin of the Uchiha clan and a member of Team Minato, Obito is an inexperienced ninja determined to prove himself. Despite his shortcomings, he fights with unwavering resolve, awakening his Sharingan when pushed to his limits and supporting his allies at great personal cost.',
    passive: {
        name: 'Obito Sharingan',
        icon: PASSIVE_ICON,
        description: 'If Obito falls to 50 health or less, he permanently gains 10 damage reduction, and his damaging skills ignore destructible defense, damage reduction, invulnerability, counters, and reflects.',
        onFirstHpAtMost: {
            threshold: 50,
            applyStatusToSelf: {
                statusId: 'uchiha_obito_sharingan_awakened', duration: 99,
                metadata: {
                    helpful: true, permanent: true, damageReductionFlat: 10,
                    ignoreDamageReductionForSkillIds: DAMAGING_SKILL_IDS,
                    ignoreDestructibleDefenseForSkillIds: DAMAGING_SKILL_IDS,
                    ignoreInvulnerabilityForSkillIds: DAMAGING_SKILL_IDS,
                    uncounterableSkillIds: DAMAGING_SKILL_IDS,
                    unreflectableSkillIds: DAMAGING_SKILL_IDS,
                    sourceSkillName: 'Obito Sharingan', statusIcon: PASSIVE_ICON,
                    tooltipText: 'This character has 10 damage reduction. Piercing Stab and Obito Goukakyuu no Jutsu ignore destructible defense, damage reduction, invulnerability, counters, and reflects.',
                },
            },
        },
    },
    skills: [
        {
            id: PIERCING_STAB, name: 'Piercing Stab',
            skillimage: 'https://i.imgur.com/3Mp49Qg.png',
            skilldescription: 'Obito deals 15 physical damage to an enemy. That enemy permanently takes 5 additional damage from Piercing Stab until Obito dies.',
            energy: ['Random'], target: 'single-enemy', damage: 0, cooldown: 0,
            classes: ['Physical', 'Instant'],
            effects: [
                { type: 'damage', amount: 15, scope: 'target' },
                { type: 'apply_status', statusId: 'uchiha_obito_piercing_stab_mark', duration: 99, scope: 'target', metadata: {
                    harmful: true, permanent: true, removeOnSourceDeath: true,
                    bonusDamageFromSourceSkillsFlat: 5,
                    bonusDamageFromSourceCharacterId: 'uchiha-obito',
                    bonusDamageAppliesToSkillIds: [PIERCING_STAB],
                    tooltipText: 'Piercing Stab deals 5 additional damage to this character until Obito dies.',
                } },
            ],
        },
        {
            id: GOUKAKYUU, name: 'Obito Goukakyuu no Jutsu',
            skillimage: 'https://i.imgur.com/Z9H5tUb.png',
            skilldescription: 'Obito deals 30 chakra damage, evenly distributed among all enemies.',
            energy: ['Ninjutsu'], target: 'all-enemy', damage: 0, cooldown: 1,
            classes: ['Chakra', 'Instant'],
            effects: [{ type: 'damage', amount: 30, scope: 'all-enemy', metadata: { splitAmountEvenlyAmongRecipients: true } }],
        },
        {
            id: 'uchiha-obito-parting-gift', name: 'Parting Gift',
            skillimage: 'https://i.imgur.com/T6295by.png',
            skilldescription: 'Obito takes 10 affliction* damage. For the rest of the game, an ally deals 5 additional non-affliction damage. This effect cannot be removed, and Parting Gift can only be used once.',
            energy: ['Bloodline'], target: 'single-ally', damage: 0, cooldown: 0, maxUses: 1,
            classes: ['Strategic', 'Affliction*', 'Instant'],
            effects: [
                { type: 'damage', amount: 10, scope: 'self', metadata: { afflictionDamage: true, skillClasses: ['Affliction'] } },
                { type: 'apply_status', statusId: 'uchiha_obito_parting_gift', duration: 99, scope: 'target', metadata: {
                    helpful: true, permanent: true, cannotBeCleansed: true, cannotBeRemoved: true,
                    nonAfflictionDamageBonusFlat: 5,
                    tooltipText: 'This character deals 5 additional non-affliction damage.',
                } },
            ],
        },
        {
            id: 'uchiha-obito-sparkling-parry', name: 'Sparkling Parry',
            skillimage: 'https://i.imgur.com/ZuHjPMI.png',
            skilldescription: 'Obito becomes invulnerable for 1 turn.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: 'uchiha_obito_sparkling_parry', duration: 1, scope: 'self', metadata: {
                helpful: true, invulnerable: true, tooltipText: 'This character is invulnerable.',
            } }],
        },
    ],
};
