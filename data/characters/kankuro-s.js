module.exports = {
    id: 'kankuro-s',
    characterId: 'kankuro-s',
    name: 'Kankuro (S)',
    facePicture: 'deadcharacter.png',
    characterdeescription: 'In the last couple years Kankuro has become a Jounin and has created a new puppet. He is now able to harness three puppets at once and is a more versatile combatant. ORIGINAL DESIGN: Yaseen16',
    requiredMissionId: 'the-aspiring-puppet-master',
    skills: [
        {
            id: 'kankuro-s-kuroari-trap',
            name: 'Kuroari Trap',
            skillimage: 'deadcharacter.png',
            skilldescription: "Kankuro (S) targets one enemy, countering any harmful skill they use for 1 turn. If countered, that enemy will take 100% more damage from 'Karasu Knives' the following turn. This skill is invisible until triggered.",
            energy: ['Random'],
            target: 'single-enemy',
            damage: 0,
            cooldown: 2,
            classes: ['Strategic', 'Instant'],
            effects: [
                {
                    type: 'apply_status',
                    statusId: 'kankuro_s_kuroari_trap_mark',
                    duration: 1,
                    scope: 'target',
                    metadata: {
                        invisible: true,
                        triggerOnEnemyHarmfulSkill: true,
                        counterStatusId: 'kankuro_s_kuroari_trap_triggered',
                        counterStatusDuration: 1,
                        counterStatusMetadata: {
                            harmful: true,
                            bonusDamageFromSourceSkillsPercent: 100,
                            bonusDamageAppliesToSkillIds: ['kankuro-s-karasu-knives'],
                            tooltipText: 'Takes 100% more damage from Karasu Knives.'
                        },
                        tooltipText: 'Subject to Kuroari Trap: next harmful skill will be countered, increasing Karasu Knives damage by 100%.'
                    }
                }
            ]
        },
        {
            id: 'kankuro-s-karasu-knives',
            name: 'Karasu Knives',
            skillimage: 'deadcharacter.png',
            skilldescription: 'Kankuro (S) targets an enemy, dealing 20 damage to them. The following turn, that enemy will take 10 affliction damage.*',
            energy: ['Random', 'Random'],
            target: 'single-enemy',
            damage: 0,
            cooldown: 1,
            classes: ['Physical', 'Instant', 'Affliction*'],
            effects: [
                {
                    type: 'damage',
                    amount: 20,
                    scope: 'target'
                },
                {
                    type: 'apply_status',
                    statusId: 'kankuro_s_karasu_knives_poison',
                    duration: 1,
                    scope: 'target',
                    metadata: {
                        harmful: true,
                        turnDurationAnchor: 'source_turn',
                        onExpireEffects: [
                            {
                                type: 'damage',
                                amount: 10,
                                scope: 'target',
                                metadata: {
                                    afflictionDamage: true,
                                    ignoreDamageReduction: true,
                                    ignoreDestructibleDefense: true
                                }
                            }
                        ],
                        tooltipText: 'Will take 10 affliction damage next turn.'
                    }
                }
            ]
        },
        {
            id: 'kankuro-s-sanshouo-shield',
            name: 'Sanshouo Shield',
            skillimage: 'deadcharacter.png',
            skilldescription: "For 3 turns, Kankuro (S) and his allies will have 10 points of damage reduction and will ignore harmful non-conditional affliction damage. This skill becomes 'Defensive Puppet Control' for 3 turns after used.",
            energy: ['Random', 'Random'],
            target: 'self',
            damage: 0,
            cooldown: 3,
            classes: ['Strategic', 'Instant'],
            effects: [
                {
                    type: 'apply_status',
                    statusId: 'kankuro_s_sanshouo_shield_buff',
                    duration: 3,
                    scope: 'all-ally',
                    metadata: {
                        helpful: true,
                        damageReductionFlat: 10,
                        immuneToNonConditionalAfflictionDamage: true,
                        tooltipText: 'Has 10 damage reduction and ignores non-conditional affliction damage.'
                    }
                },
                {
                    type: 'apply_status',
                    statusId: 'kankuro_s_sanshouo_shield_stance',
                    duration: 3,
                    scope: 'self',
                    metadata: {
                        helpful: true,
                        skillReplacements: {
                            'kankuro-s-sanshouo-shield': 'kankuro-s-defensive-puppet-control'
                        },
                        tooltipText: 'Sanshouo Shield is active: replaced by Defensive Puppet Control.'
                    }
                }
            ]
        },
        {
            id: 'kankuro-s-puppet-distraction',
            name: 'Puppet Distraction',
            skillimage: 'deadcharacter.png',
            skilldescription: 'This skill makes Kankuro (S) invulnerable for 1 turn.',
            energy: ['Random'],
            target: 'self',
            damage: 0,
            cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [
                {
                    type: 'apply_status',
                    statusId: 'kankuro_s_puppet_distraction_invul',
                    duration: 1,
                    scope: 'self',
                    metadata: {
                        invulnerable: true,
                        tooltipText: 'This character is invulnerable.'
                    }
                }
            ]
        },
        {
            id: 'kankuro-s-defensive-puppet-control',
            name: 'Defensive Puppet Control',
            skillimage: 'deadcharacter.png',
            skilldescription: 'Kankuro (S) targets one ally or himself, granting them 20 points of damage reduction for 1 turn.',
            energy: [],
            target: 'single-ally',
            damage: 0,
            cooldown: 0,
            classes: ['Strategic', 'Instant'],
            effects: [
                {
                    type: 'apply_status',
                    statusId: 'kankuro_s_defensive_puppet_control_dr',
                    duration: 1,
                    scope: 'target',
                    metadata: {
                        helpful: true,
                        damageReductionFlat: 20,
                        turnDurationAnchor: 'source_turn',
                        tooltipText: 'This character has 20 damage reduction for 1 turn.'
                    }
                }
            ]
        }
    ]
};
