module.exports = {
    "id": "sasori-of-the-red-sand",
    "characterId": "sasori-of-the-red-sand",
    "name": "Sasori of the Red Sand",
    "facePicture": "https://i.imgur.com/EJRSPPq.png",
    "characterdeescription": "Sasori is a senior Akatsuki member and a legendary puppet master. He is even rumored to have defeated an entire nation with puppets alone. ORIGINAL DESIGN: Pavera",
    "requiredMissionId": "master-of-puppets",
    "skills": [
        {
            "id": "sasori-of-the-red-sand-thousand-hands",
            "name": "Thousand Hands",
            "skillimage": "https://i.imgur.com/0YTQQqA.png",
            "skilldescription": "Sasori of the Red Sand deals 10 damage to one enemy for 2 turns and gains 5 points of permanent destructible defense each turn. If 'Poison Gas' is used on the target in the following turn, it will last 1 additional turn on them*. The target of this skill will take 5 additional damage from 'Poison Gas' for 1 turn*.",
            "energy": [
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Physical",
                "Action",
                "Instant*"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "sasori_red_sand_thousand_hands_dot",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "action": true,
                        "ongoingClass": "action",
                        "damagePerTurn": 10,
                        "bonusDamageFromSourceSkillsFlat": 5,
                        "bonusDamageAppliesToSkillIds": [
                            "sasori-of-the-red-sand-poison-gas"
                        ],
                        "tooltipText": "Taking 10 physical damage per turn and takes +5 damage from Poison Gas."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "sasori_red_sand_thousand_hands_dd",
                    "duration": 2,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "ongoingClass": "action",
                        "destructibleDefensePointsPerTurn": 5,
                        "destructibleDefensePermanent": true,
                        "tooltipText": "Gaining 5 permanent destructible defense per turn."
                    }
                }
            ]
        },
        {
            "id": "sasori-of-the-red-sand-poison-gas",
            "name": "Poison Gas",
            "skillimage": "https://i.imgur.com/ct8Y9cl.png",
            "skilldescription": "Sasori of the Red Sand deals 10 affliction damage to one enemy for 4 turns and gains 10 points of permanent destructible defense. During this time, if that enemy uses a new skill, they will be dealt 5 affliction damage. This skill lasts 1 additional turn if the enemy is affected by 'Thousand Hands'. This skill stacks.",
            "energy": [
                "Random",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 4,
            "classes": [
                "Affliction",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "sasori_red_sand_poison_gas_dot",
                    "duration": 4,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "missingStatusId": "sasori_red_sand_thousand_hands_dot"
                    },
                    "metadata": {
                        "harmful": true,
                        "stackable": true,
                        "damagePerTurn": 10,
                        "afflictionDamage": true,
                        "ignoreDamageReduction": true,
                        "ignoreDestructibleDefense": true,
                        "damageOnSkillUseAffliction": 5,
                        "tooltipText": "Taking 10 affliction damage per turn and 5 affliction damage on skill use."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "sasori_red_sand_poison_gas_dot",
                    "duration": 5,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "hasStatusId": "sasori_red_sand_thousand_hands_dot"
                    },
                    "metadata": {
                        "harmful": true,
                        "stackable": true,
                        "damagePerTurn": 10,
                        "afflictionDamage": true,
                        "ignoreDamageReduction": true,
                        "ignoreDestructibleDefense": true,
                        "damageOnSkillUseAffliction": 5,
                        "tooltipText": "Taking 10 affliction damage per turn and 5 affliction damage on skill use."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "sasori_red_sand_poison_gas_dd",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePoints": 10,
                        "destructibleDefensePermanent": true,
                        "tooltipText": "Gained 10 permanent destructible defense."
                    }
                }
            ]
        },
        {
            "id": "sasori-of-the-red-sand-iron-sand",
            "name": "Iron Sand",
            "skillimage": "https://i.imgur.com/Dnv7UG4.png",
            "skilldescription": "Sasori of the Red Sand will gain 5 points of permanent destructible defense each turn for 3 turns. During this time, every enemy who uses a new skill on Sasori of the Red Sand will be dealt 5 piercing damage. For 3 turns, this skill will be replaced by 'Iron Sand World Method' and 'Thousand Hands' will be replaced by 'Iron Sand Gathering Assault'.",
            "energy": [
                "Bloodline"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 4,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "sasori_red_sand_iron_sand_stance",
                    "duration": 3,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePointsPerTurn": 5,
                        "destructibleDefensePermanent": true,
                        "damageToTargetingEnemiesPiercing": 5,
                        "skillReplacements": {
                            "sasori-of-the-red-sand-iron-sand": "sasori-of-the-red-sand-iron-sand-world-method",
                            "sasori-of-the-red-sand-thousand-hands": "sasori-of-the-red-sand-iron-sand-gathering-assault"
                        },
                        "tooltipText": "Iron Sand active: gaining permanent defense, retaliates with 5 piercing damage, skills replaced."
                    }
                }
            ]
        },
        {
            "id": "sasori-of-the-red-sand-puppet-protection",
            "name": "Puppet Protection",
            "skillimage": "https://i.imgur.com/067sl2R.png",
            "skilldescription": "This skill makes Sasori of the Red Sand invulnerable for 1 turn.",
            "energy": [
                "Random"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 4,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "sasori_red_sand_puppet_protection_invul",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "invulnerable": true,
                        "tooltipText": "This character is invulnerable."
                    }
                }
            ]
        },
        {
            "id": "sasori-of-the-red-sand-iron-sand-gathering-assault",
            "name": "Iron Sand Gathering Assault",
            "skillimage": "https://i.imgur.com/Ul782SR.png",
            "skilldescription": "Sasori of the Red Sand deals 30 piercing damage to one enemy and makes that enemy unable to reduce damage or become invulnerable for 1 turn. Sasori of the Red Sand also gains 15 points of destructible defense for 1 turn.",
            "energy": [
                "Ninjutsu",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 30,
                    "scope": "target",
                    "metadata": {
                        "ignoreDamageReduction": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "sasori_red_sand_gathering_assault_debuff",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotReduceDamage": true,
                        "cannotBecomeInvulnerable": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "Cannot reduce damage or become invulnerable for 1 turn."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "sasori_red_sand_gathering_assault_dd",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePoints": 15,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "Has 15 destructible defense for 1 turn."
                    }
                }
            ]
        },
        {
            "id": "sasori-of-the-red-sand-iron-sand-world-method",
            "name": "Iron Sand World Method",
            "skillimage": "https://i.imgur.com/V8SqtNC.png",
            "skilldescription": "Sasori of the Red Sand deals 25 piercing damage to all enemies. Any enemy whose health drops to 10 or below will be instantly killed. This skill cannot be countered or reflected.",
            "energy": [
                "Bloodline",
                "Ninjutsu",
                "Random"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 4,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 25,
                    "scope": "all-enemy",
                    "metadata": {
                        "ignoreDamageReduction": true,
                        "cannotBeCountered": true,
                        "cannotBeReflected": true
                    }
                },
                {
                    "type": "execute_threshold",
                    "thresholdHp": 10,
                    "scope": "all-enemy"
                }
            ]
        }
    ]
};
