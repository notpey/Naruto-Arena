module.exports = {
    id: 'umino-iruka',
    characterId: 'umino-iruka',
    name: 'Umino Iruka',
    facePicture: 'https://i.imgur.com/rgSncXo.png',
    characterdeescription: 'A chunin of the Hidden Leaf Village and an instructor at the Ninja Academy, Iruka dedicates himself to guiding the next generation of shinobi. Despite losing his parents to the Nine-Tailed Fox, he becomes one of the first people to recognize Naruto Uzumaki\'s potential, risking his own life to protect the young ninja.',
    requiredMissionId: 'duty-of-a-sensei',
    passive: {
        name: 'Genin Promotion',
        icon: 'https://i.imgur.com/fo7qWJv.png',
        description: 'When Iruka damages an enemy with one of his skills, the next damaging hit from another ally against that enemy deals 5 additional damage. This mark lasts 2 turns and does not stack.',
        allyFollowupDamageMark: {
            statusId: 'iruka_genin_promotion_mark', duration: 2, amount: 5,
            skillIds: [
                'umino-iruka-shuriken-throw',
                'umino-iruka-academy-instruction',
                'umino-iruka-sealed-bomb-square-release',
            ],
        },
    },
    skills: [
        {
            id: 'umino-iruka-shuriken-throw',
            name: 'Shuriken Throw',
            skillimage: 'https://i.imgur.com/LmS1XVp.png',
            skilldescription: 'Iruka throws shuriken at one enemy, dealing 20 physical damage. If they are affected by his Sealed Bomb Square Release, the trap detonates immediately.',
            energy: ['Taijutsu'], target: 'single-enemy', damage: 0, cooldown: 0,
            classes: ['Physical', 'Instant'],
            effects: [
                { type: 'damage', amount: 20, scope: 'target' },
                {
                    type: 'damage', amount: 25, scope: 'target',
                    metadata: { skillClasses: ['Chakra'] },
                    condition: { scope: 'target', statusId: 'iruka_sealed_bomb_trap', statusFromActor: true },
                },
                {
                    type: 'remove_status', statusId: 'iruka_sealed_bomb_trap', scope: 'target',
                    condition: { scope: 'target', statusId: 'iruka_sealed_bomb_trap', statusFromActor: true },
                },
            ],
        },
        {
            id: 'umino-iruka-academy-instruction',
            name: 'Academy Instruction',
            skillimage: 'https://i.imgur.com/NJMON6n.png',
            skilldescription: 'Iruka prepares himself or one ally to defend, granting 15 destructible defense for 2 turns. For 1 turn, the first enemy to use a new harmful skill on that ally takes 10 physical damage.',
            energy: ['Random'], target: 'self-or-single-ally', damage: 0, cooldown: 3,
            classes: ['Strategic', 'Instant', 'Physical*'],
            effects: [
                {
                    type: 'apply_status', statusId: 'iruka_academy_instruction_defense', duration: 2, scope: 'target',
                    metadata: {
                        helpful: true, destructibleDefensePoints: 15,
                        tooltipTextTemplate: 'This character has {destructibleDefensePoints} destructible defense from Academy Instruction.',
                    },
                },
                {
                    type: 'apply_status', statusId: 'iruka_academy_instruction_trap', duration: 1, scope: 'target',
                    metadata: {
                        helpful: true, triggerOnEnemyHarmfulSkill: true, counterCancelsSkill: false,
                        counterDamageAttributedToStatusSource: true,
                        counterDamageRespectsInvulnerability: true,
                        counterDamage: 10, counterDamageSkillClasses: ['Physical'],
                        tooltipText: 'The first enemy to use a new harmful skill on this character takes 10 physical damage.',
                    },
                },
            ],
        },
        {
            id: 'umino-iruka-sealed-bomb-square-release',
            name: 'Sealed Bomb Square Release',
            skillimage: 'https://i.imgur.com/TeDfWJB.png',
            skilldescription: 'Iruka places an invisible explosive trap on one enemy for 2 turns. The first time they use a new harmful skill, it detonates for 25 damage and ends. Shuriken Throw can detonate it early.',
            energy: ['Ninjutsu'], target: 'single-enemy', damage: 0, cooldown: 2,
            classes: ['Chakra', 'Instant'],
            effects: [{
                type: 'apply_status', statusId: 'iruka_sealed_bomb_trap', duration: 2, scope: 'target',
                metadata: {
                    harmful: true, hideTooltipFromUnitOwner: true, triggerOnEnemyHarmfulSkill: true,
                    triggerOnlyOnOwnerSkillUse: true, counterDamageAttributedToStatusSource: true,
                    counterDamageRespectsInvulnerability: true,
                    counterCancelsSkill: false, counterDamage: 25,
                    counterDamageSkillClasses: ['Chakra'], turnDurationAnchor: 'source_turn',
                    tooltipText: 'If this character uses a new harmful skill, Sealed Bomb Square Release deals 25 damage. Shuriken Throw can detonate the trap early.',
                },
            }],
        },
        {
            id: 'umino-iruka-ally-shield',
            name: 'Ally Shield',
            skillimage: 'https://i.imgur.com/sdo9YZ8.png',
            skilldescription: 'Iruka makes himself or one ally invulnerable for 1 turn.',
            energy: ['Random'], target: 'self-or-single-ally', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [{
                type: 'apply_status', statusId: 'invulnerable', duration: 1, scope: 'target',
                metadata: { helpful: true, invulnerable: true, tooltipText: 'This character is invulnerable.' },
            }],
        },
    ],
};
