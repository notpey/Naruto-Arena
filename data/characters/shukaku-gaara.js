module.exports = {
    "id": "shukaku-gaara",
    "characterId": "shukaku-gaara",
    "name": "Shukaku Gaara",
    "facePicture": "https://i.imgur.com/tNBIXfI.png",
    "characterdeescription": "Having lived inside him the whole time, Shukaku is one of the nine tailed beasts and is very eager to escape and cause chaos to the world. While Shukaku slowly takes over Gaara, his own power increases, allowing him to demolish his foes with powerful sand attacks.",
    "requiredMissionId": "the-beast-inside",
    "skills": [
        {
            "id": "shukaku-gaara-sand-claw",
            "name": "Sand Claw",
            "skillimage": "https://i.imgur.com/SBibatM.png",
            "skilldescription": "Shukaku Gaara deals 30 damage to one enemy and gains 10 points of permanent destructible defense.",
            "energy": [
                "Bloodline",
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
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "shukaku_gaara_sand_claw_defense",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePoints": 10,
                        "mergeNumericAddKeys": [
                            "destructibleDefensePoints"
                        ],
                        "tooltipText": "This character has 10 points of permanent destructible defense from Sand Claw."
                    }
                }
            ]
        },
        {
            "id": "shukaku-gaara-constricting-sand-prison",
            "name": "Constricting Sand Prison",
            "skillimage": "https://i.imgur.com/RlM6KsX.png",
            "skilldescription": "Shukaku Gaara deals 10 damage to one enemy each turn. The first harmful skill that this enemy uses will be countered, and this skill will end.",
            "energy": [
                "Bloodline"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "shukaku_gaara_constricting_sand_prison",
                    "duration": 99,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 10,
                        "turnEndTrigger": "source_turn",
                        "triggerOnEnemyHarmfulSkill": true,
                        "counterCancelsSkill": true,
                        "tooltipText": "This character takes 10 damage each turn. The first skill they use will be countered, ending this effect."
                    }
                }
            ]
        },
        {
            "id": "shukaku-gaara-sand-transformation",
            "name": "Sand Transformation",
            "skillimage": "https://i.imgur.com/yy4K7qp.png",
            "skilldescription": "Shukaku Gaara will gain 10 points of destructible defense each turn for 4 turns. When this skill ends, for 3 turns 'Sand Claw' will cost 1 less random energy and 'Constricting Sand Prison' and 'Sand Transformation' will be replaced.",
            "energy": [
                "Random",
                "Random"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 6,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "shukaku_gaara_sand_transformation",
                    "duration": 4,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePoints": 10,
                        "mergeNumericAddKeys": [
                            "destructibleDefensePoints"
                        ],
                        "growPerTurn": [
                            {
                                "key": "destructibleDefensePoints",
                                "amount": 10,
                                "max": 40
                            }
                        ],
                        "tooltipText": "This character has 10 points of destructible defense from Sand Transformation. This grows by 10 each turn, up to 40.",
                        "onExpireEffects": [
                            {
                                "type": "apply_status",
                                "statusId": "shukaku_gaara_sand_transformation_followup",
                                "duration": 3,
                                "metadata": {
                                    "helpful": true,
                                    "skillCostOverridesBySkillId": {
                                        "shukaku-gaara-sand-claw": {
                                            "energy": [
                                                "Random"
                                            ]
                                        }
                                    },
                                    "skillReplacements": {
                                        "shukaku-gaara-constricting-sand-prison": "shukaku-gaara-drilling-air-bullet",
                                        "shukaku-gaara-sand-transformation": "shukaku-gaara-true-awakening"
                                    },
                                    "tooltipText": "Sand Claw costs 1 less random chakra. Constricting Sand Prison is replaced by Drilling Air Bullet and Sand Transformation is replaced by True Awakening."
                                }
                            }
                        ]
                    }
                }
            ]
        },
        {
            "id": "shukaku-gaara-thick-sand-coat",
            "name": "Thick Sand Coat",
            "skillimage": "https://i.imgur.com/1zFEDxZ.png",
            "skilldescription": "This skill makes Shukaku Gaara invulnerable for 1 turn.",
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
                    "statusId": "shukaku_gaara_thick_sand_coat",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "invulnerable": true,
                        "tooltipText": "This character is invulnerable."
                    }
                }
            ]
        },
        {
            "id": "shukaku-gaara-drilling-air-bullet",
            "name": "Drilling Air Bullet",
            "hiddenFromSelectionViewer": true,
            "skillimage": "",
            "skilldescription": "Shukaku Gaara deals 60 damage to one enemy.",
            "energy": [
                "Bloodline",
                "Bloodline"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 60,
                    "scope": "target"
                }
            ]
        },
        {
            "id": "shukaku-gaara-true-awakening",
            "name": "True Awakening",
            "hiddenFromSelectionViewer": true,
            "skillimage": "",
            "skilldescription": "The following turn, 'Sand Claw' and 'Drilling Air Bullet' will deal double damage.",
            "energy": [
                "Random"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "shukaku_gaara_true_awakening_delay",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "tooltipText": "Sand Claw will deal 30 additional damage and Drilling Air Bullet will deal 60 additional damage next turn.",
                        "onExpireEffects": [
                            {
                                "type": "apply_status",
                                "statusId": "shukaku_gaara_true_awakening_double",
                                "duration": 1,
                                "metadata": {
                                    "helpful": true,
                                    "skillDamageBonuses": {
                                        "shukaku-gaara-sand-claw": 30,
                                        "shukaku-gaara-drilling-air-bullet": 60
                                    },
                                    "tooltipText": "Sand Claw deals 30 additional damage and Drilling Air Bullet deals 60 additional damage."
                                }
                            }
                        ]
                    }
                }
            ]
        }
    ]
};
