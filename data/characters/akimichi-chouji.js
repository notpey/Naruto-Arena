module.exports = {
    "id": "akimichi-chouji",
    "characterId": "akimichi-chouji",
    "name": "Akimichi Chouji",
    "facePicture": "https://i.imgur.com/5xdU5aU.png",
    "characterdeescription": "A kindhearted genin of Team 10, Chouji belongs to the Akimichi clan, whose secret techniques allow him to transform his body into a powerful weapon. Fiercely loyal to his friends, he is willing to risk his own life to unleash the devastating strength hidden within him.",
    "requiredMissionId": null,
    "passive": {
        "name": "Butterfly Mode",
        "icon": "https://i.imgur.com/wP5h73A.png",
        "description": "After consuming all 3 Akimichi Pills, Chouji enters Butterfly Mode, permanently replacing his skills. During this time, he ignores enemy non-damage effects and gains 10 damage reduction that cannot be pierced."
    },
    "skills": [
        {
            "id": "akimichi-chouji-partial-double-size",
            "name": "Partial Double Size",
            "skillimage": "https://i.imgur.com/l3hKVGM.png",
            "skilldescription": "Chouji enlarges his arm to strike an enemy, dealing 20 physical damage, increased by 10 for each Akimichi Pill consumed.",
            "energy": [
                "Taijutsu"
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
                    "amount": 20,
                    "scope": "target",
                    "metadata": {
                        "bonusPerStatusMetadata": {
                            "scope": "self",
                            "statusId": "akimichi_chouji_akimichi_pills",
                            "metadataKey": "pillCount",
                            "multiplier": 10
                        }
                    }
                }
            ]
        },
        {
            "id": "akimichi-chouji-meat-tank",
            "name": "Meat Tank",
            "skillimage": "https://i.imgur.com/ste25Hm.png",
            "skilldescription": "Chouji transforms into a massive rolling ball, dealing 20 physical damage to a random enemy and becoming invulnerable to physical and chakra skills for 1 turn. This skill deals 10 additional damage for each Akimichi Pill consumed.",
            "energy": [
                "Bloodline"
            ],
            "target": "self-and-all-enemies",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 20,
                    "scope": "random-enemy",
                    "metadata": {
                        "bonusPerStatusMetadata": {
                            "scope": "self",
                            "statusId": "akimichi_chouji_akimichi_pills",
                            "metadataKey": "pillCount",
                            "multiplier": 10
                        }
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "akimichi_chouji_meat_tank",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "invulnerableToSkillClasses": [
                            "physical",
                            "chakra"
                        ],
                        "tooltipText": "Chouji is invulnerable to physical and chakra skills."
                    }
                }
            ]
        },
        {
            "id": "akimichi-chouji-akimichi-pills",
            "name": "Akimichi Pills",
            "skillimage": "https://i.imgur.com/rAb2LpB.png",
            "skilldescription": "Chouji consumes one of his 3 Akimichi Pills, taking 15 affliction damage and permanently enhancing his other skills. Upon consuming his third pill, Chouji enters Butterfly Mode.",
            "energy": [],
            "target": "self",
            "damage": 0,
            "cooldown": 1,
            "maxUses": 3,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "akimichi_chouji_akimichi_pills",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "permanent": true,
                        "cannotBeCleansed": true,
                        "stackMetadataKey": "pillCount",
                        "stackDelta": 1,
                        "stackMax": 3,
                        "stackDerivedNumericKeys": {
                            "pillDamageBonus": 10
                        },
                        "tooltipTextTemplate": "Chouji has consumed {pillCount} Akimichi Pills. Partial Double Size and Meat Tank deal {pillDamageBonus} additional damage.",
                        "applyStatusAtStack": {
                            "metadataKey": "pillCount",
                            "value": 3,
                            "statusId": "akimichi_chouji_butterfly_mode_active",
                            "duration": 99,
                            "metadata": {
                                "helpful": true,
                                "permanent": true,
                                "cannotBeCleansed": true,
                                "ignoreHarmfulNonDamageEffects": true,
                                "unpierceableDamageReductionFlat": 10,
                                "facePictureOverride": "https://i.imgur.com/8560MPe.png",
                                "skillReplacements": {
                                    "akimichi-chouji-partial-double-size": "akimichi-chouji-butterfly-finale",
                                    "akimichi-chouji-meat-tank": "akimichi-chouji-butterfly-reflexes"
                                },
                                "onOwnerKillSourceSkillIdsAny": [
                                    "akimichi-chouji-butterfly-finale"
                                ],
                                "onOwnerKillTargetRelation": "enemy",
                                "onOwnerKillHealSelfAmount": 10,
                                "tooltipText": "Butterfly Mode (3 Akimichi Pills consumed): Chouji ignores enemy non-damage effects and has 10 damage reduction that cannot be pierced. Butterfly Finale heals him 10 health when it kills."
                            }
                        }
                    }
                },
                {
                    "type": "damage",
                    "amount": 15,
                    "scope": "self",
                    "metadata": {
                        "afflictionDamage": true,
                        "skillClasses": [
                            "Affliction"
                        ]
                    }
                }
            ]
        },
        {
            "id": "akimichi-chouji-snack-time",
            "name": "Snack Time!",
            "skillimage": "https://i.imgur.com/VilAysj.png",
            "skilldescription": "Chouji takes a moment to enjoy his favorite snacks, becoming invulnerable for 1 turn.",
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
                    "statusId": "akimichi_chouji_snack_time",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "invulnerable": true,
                        "tooltipText": "Chouji is invulnerable."
                    }
                }
            ]
        },
        {
            "id": "akimichi-chouji-butterfly-finale",
            "name": "Butterfly Finale",
            "hiddenFromSelectionViewer": true,
            "useBaseSkillCooldown": true,
            "skillimage": "https://i.imgur.com/moJAxL6.png",
            "skilldescription": "Chouji concentrates his strength into a devastating strike, dealing 50 physical damage to an enemy. If this skill kills the target, Chouji heals 10 health.",
            "energy": [
                "Taijutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Physical",
                "Instant",
                "Unique"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 50,
                    "scope": "target"
                }
            ]
        },
        {
            "id": "akimichi-chouji-butterfly-reflexes",
            "name": "Butterfly Reflexes",
            "hiddenFromSelectionViewer": true,
            "useBaseSkillCooldown": true,
            "skillimage": "https://i.imgur.com/xnrPRos.png",
            "skilldescription": "Chouji moves with incredible speed, dealing 40 physical damage to an enemy and becoming invulnerable for 1 turn. For 1 turn, Butterfly Finale deals 10 additional damage to that enemy.",
            "energy": [
                "Bloodline"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Physical",
                "Instant",
                "Unique"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 40,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "akimichi_chouji_butterfly_reflexes_mark",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "bonusDamageFromSourceSkillsFlat": 10,
                        "bonusDamageFromSourceCharacterId": "akimichi-chouji",
                        "bonusDamageAppliesToSkillIds": [
                            "akimichi-chouji-butterfly-finale"
                        ],
                        "tooltipText": "Butterfly Finale deals 10 additional damage to this character."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "akimichi_chouji_butterfly_reflexes",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "invulnerable": true,
                        "tooltipText": "Chouji is invulnerable."
                    }
                }
            ]
        }
    ]
};
