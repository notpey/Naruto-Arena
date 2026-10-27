(function (root, factory) {
    const presets = factory();
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = presets;
    } else {
        root.STARTER_CHARACTER_PRESETS = Object.assign(root.STARTER_CHARACTER_PRESETS || {}, presets);
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    return {
        "inuzuka-kiba": {
                "id": "inuzuka-kiba",
                "characterId": "inuzuka-kiba",
                "name": "Inuzuka Kiba",
                "facePicture": "https://i.imgur.com/qa9B7Iy.png",
                "characterdeescription": "A Genin from Team 8, Kiba is a member of the Inuzuka clan, and is both short-tempered and impulsive. Using his dog, Akamaru, Kiba is capable of powerful taijutsu or fusing with Akamaru to become a deadly double headed dog.",
                "skills": [
                        {
                                "id": "inuzuka-kiba-garouga",
                                "name": "Garouga",
                                "skillimage": "https://i.imgur.com/q3NdG8q.png",
                                "skilldescription": "Inuzuka Kiba deals 20 piercing damage to one enemy. During 'Double Headed Wolf,' it deals 30 piercing damage and costs 1 Taijutsu and 1 random chakra.",
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
                                                        "ignoreDamageReduction": true
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "inuzuka-kiba-double-headed-wolf",
                                "name": "Double Headed Wolf",
                                "skillimage": "https://i.imgur.com/cKssLAR.png",
                                "skilldescription": "Inuzuka Kiba deals 10 damage to all enemies for 3 turns. During this time, 'Garouga' deals 10 additional damage and costs 1 Taijutsu and 1 random chakra. Inuzuka Kiba gains 15 points of damage reduction.",
                                "energy": [
                                        "Taijutsu",
                                        "Bloodline"
                                ],
                                "target": "all-enemy",
                                "damage": 0,
                                "cooldown": 3,
                                "classes": [
                                        "Physical",
                                        "Action"
                                ],
                                "effects": [
                                        {
                                                "type": "apply_status",
                                                "statusId": "inuzuka_kiba_double_headed_wolf_damage",
                                                "duration": 3,
                                                "scope": "all-enemy",
                                                "metadata": {
                                                        "harmful": true,
                                                        "turnEndDamage": 10,
                                                        "turnEndTrigger": "source_turn",
                                                        "turnDurationAnchor": "source_turn",
                                                        "ongoingClass": "action",
                                                        "triggerOnApply": true,
                                                        "tooltipText": "This character takes 10 damage from Double Headed Wolf."
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "inuzuka_kiba_double_headed_wolf_active",
                                                "duration": 3,
                                                "scope": "self",
                                                "metadata": {
                                                        "damageReductionFlat": 15,
                                                        "skillCostOverridesBySkillId": {
                                                                "inuzuka-kiba-garouga": {
                                                                        "energy": [
                                                                                "Taijutsu",
                                                                                "Random"
                                                                        ]
                                                                }
                                                        },
                                                        "tooltipText": "Kiba has 15 damage reduction, Garouga deals 10 additional damage, and Garouga costs 1 Taijutsu and 1 random chakra.",
                                                        "skillDamageBonuses": {
                                                                "inuzuka-kiba-garouga": 10
                                                        },
                                                        "ongoingClass": "action"
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "inuzuka-kiba-dynamic-marking",
                                "name": "Dynamic Marking",
                                "skillimage": "https://i.imgur.com/kiVGr2x.png",
                                "skilldescription": "Inuzuka Kiba targets one enemy, making them unable to reduce damage or become invulnerable for 2 turns. During this time, 'Garouga' and 'Double Headed Wolf' will deal 5 additional damage to them. This skill cannot be used on an enemy already affected by it.",
                                "energy": [],
                                "target": "single-enemy",
                                "targetCondition": {
                                        "missingStatusId": "inuzuka_kiba_dynamic_marking"
                                },
                                "damage": 0,
                                "cooldown": 2,
                                "classes": [
                                        "Strategic",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "apply_status",
                                                "statusId": "inuzuka_kiba_dynamic_marking",
                                                "duration": 2,
                                                "scope": "target",
                                                "metadata": {
                                                        "harmful": true,
                                                        "cannotReduceDamage": true,
                                                        "cannotBecomeInvulnerable": true,
                                                        "bonusDamageFromSourceSkillsFlat": 5,
                                                        "bonusDamageFromSourceCharacterId": "inuzuka-kiba",
                                                        "bonusDamageAppliesToSkillIds": [
                                                                "inuzuka-kiba-garouga",
                                                                "inuzuka-kiba-double-headed-wolf"
                                                        ],
                                                        "tooltipText": "This character cannot reduce damage or become invulnerable and takes 5 additional damage from Garouga and Double Headed Wolf."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "inuzuka-kiba-smoke-bomb",
                                "name": "Smoke Bomb",
                                "skillimage": "https://i.imgur.com/CwFqO2U.png",
                                "skilldescription": "This skill makes Inuzuka Kiba invulnerable for 1 turn.",
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
                                                "statusId": "invulnerable",
                                                "duration": 1,
                                                "scope": "self",
                                                "metadata": {
                                                        "invulnerable": true,
                                                        "tooltipText": "This character is invulnerable."
                                                }
                                        }
                                ]
                        }
                ]
        },
        "aburame-shino": {
            "id": "aburame-shino",
            "characterId": "aburame-shino",
            "name": "Aburame Shino",
            "facePicture": "https://i.imgur.com/DK29xuX.png",
            "characterdeescription": "A quiet and observant genin of the Aburame clan, Shino fights alongside the parasitic kikaichū insects that inhabit his body and feed on chakra. His calculated approach to combat allows him to overwhelm opponents before they realize the danger they are in.",
            "passive": {
                "name": "Kikaichu Insects",
                "icon": "https://i.imgur.com/DTkIRmc.png",
                "description": "Shino is immune to chakra removal and stealing.",
                "immuneToChakraRemovalAndStealing": true
            },
            "skills": [
                {
                    "id": "aburame-shino-female-bug",
                    "name": "Female Bug",
                    "skillimage": "https://i.imgur.com/NZvHesR.png",
                    "skilldescription": "Shino permanently marks one enemy with a female insect. Whenever that enemy uses a skill that costs chakra, they take 5 affliction damage for each chakra spent. Only one enemy can be marked at a time. This effect ends when Shino dies.",
                    "energy": [],
                    "target": "single-enemy",
                    "damage": 0,
                    "cooldown": 0,
                    "classes": [
                        "Affliction",
                        "Instant"
                    ],
                    "effects": [
                        {
                            "type": "remove_status",
                            "statusId": "aburame_shino_female_bug",
                            "scope": "all-enemy",
                            "condition": {
                                "scope": "target",
                                "statusId": "aburame_shino_female_bug",
                                "statusFromActor": true
                            }
                        },
                        {
                            "type": "remove_status",
                            "statusId": "aburame_shino_infestation_debuff",
                            "scope": "all-enemy",
                            "condition": {
                                "scope": "target",
                                "statusId": "aburame_shino_infestation_debuff",
                                "statusFromActor": true
                            }
                        },
                        {
                            "type": "apply_status",
                            "statusId": "aburame_shino_female_bug",
                            "duration": 99,
                            "scope": "target",
                            "metadata": {
                                "harmful": true,
                                "removeOnSourceDeath": true,
                                "onOwnerUseChakraSpentAfflictionDamagePerChakra": 5,
                                "tooltipText": "Each chakra spent on a skill deals 5 affliction damage. This mark ends when Shino dies."
                            }
                        },
                        {
                            "type": "apply_status",
                            "statusId": "aburame_shino_infestation_debuff",
                            "duration": 99,
                            "scope": "target",
                            "condition": {
                                "scope": "target",
                                "statusId": "aburame_shino_infestation",
                                "statusFromActor": true
                            },
                            "metadata": {
                                "harmful": true,
                                "removeOnSourceDeath": true,
                                "nonAfflictionDamageDebuffFlat": 5,
                                "tooltipText": "Infestation and Female Bug reduce this character’s non-affliction damage by 5."
                            }
                        }
                    ]
                },
                {
                    "id": "aburame-shino-chakra-leach",
                    "name": "Chakra Leech",
                    "skillimage": "https://i.imgur.com/uZIMY17.png",
                    "skilldescription": "This skill has a starting cooldown of 1. Shino steals 1 chakra from an enemy. If the target is affected by Female Bug, Shino also reduces their non-affliction damage by 15 for 1 turn. If the target is affected by Infestation, they also take 10 affliction damage.",
                    "energy": [
                        "Bloodline"
                    ],
                    "target": "single-enemy",
                    "damage": 0,
                    "cooldown": 1,
                    "startingCooldown": 1,
                    "classes": [
                        "Affliction",
                        "Instant"
                    ],
                    "effects": [
                        {
                            "type": "drain_chakra_random_from_target_to_self",
                            "amount": 1,
                            "scope": "target"
                        },
                        {
                            "type": "apply_status",
                            "statusId": "aburame_shino_chakra_leech_debuff",
                            "duration": 1,
                            "scope": "target",
                            "condition": {
                                "scope": "target",
                                "statusId": "aburame_shino_female_bug",
                                "statusFromActor": true
                            },
                            "metadata": {
                                "harmful": true,
                                "nonAfflictionDamageDebuffFlat": 15,
                                "turnDurationAnchor": "source_turn",
                                "tooltipText": "This character deals 15 less non-affliction damage for 1 turn."
                            }
                        },
                        {
                            "type": "damage",
                            "amount": 10,
                            "scope": "target",
                            "condition": {
                                "scope": "target",
                                "statusId": "aburame_shino_infestation",
                                "statusFromActor": true,
                                "requireMatch": true
                            },
                            "metadata": {
                                "afflictionDamage": true,
                                "ignoreDamageReduction": true,
                                "ignoreDestructibleDefense": true
                            }
                        }
                    ]
                },
                {
                    "id": "aburame-shino-infestation",
                    "name": "Infestation",
                    "skillimage": "https://i.imgur.com/vPf2DKk.png",
                    "skilldescription": "Shino infests an enemy with insects, dealing 5 affliction damage each turn permanently. If the target is affected by Female Bug, they also deal 5 less non-affliction damage. This effect does not stack and ends when Shino dies.",
                    "energy": [
                        "Random"
                    ],
                    "target": "single-enemy",
                    "damage": 0,
                    "cooldown": 1,
                    "classes": [
                        "Affliction",
                        "Instant"
                    ],
                    "effects": [
                        {
                            "type": "apply_status",
                            "statusId": "aburame_shino_infestation",
                            "duration": 99,
                            "scope": "target",
                            "metadata": {
                                "harmful": true,
                                "afflictionDamage": true,
                                "turnEndDamage": 5,
                                "turnEndTrigger": "source_turn",
                                "removeOnSourceDeath": true,
                                "tooltipText": "This character takes 5 affliction damage each turn until Shino dies."
                            }
                        },
                        {
                            "type": "apply_status",
                            "statusId": "aburame_shino_infestation_debuff",
                            "duration": 99,
                            "scope": "target",
                            "condition": {
                                "scope": "target",
                                "statusId": "aburame_shino_female_bug",
                                "statusFromActor": true
                            },
                            "metadata": {
                                "harmful": true,
                                "removeOnSourceDeath": true,
                                "nonAfflictionDamageDebuffFlat": 5,
                                "tooltipText": "Infestation and Female Bug reduce this character’s non-affliction damage by 5."
                            }
                        }
                    ]
                },
                {
                    "id": "aburame-shino-insect-clone",
                    "name": "Insect Clone",
                    "skillimage": "https://i.imgur.com/O4Ar57o.png",
                    "skilldescription": "Shino becomes invulnerable for 1 turn.",
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
                            "statusId": "invulnerable",
                            "duration": 1,
                            "scope": "self",
                            "metadata": {
                                "helpful": true,
                                "invulnerable": true,
                                "tooltipText": "Shino is invulnerable."
                            }
                        }
                    ]
                }
            ]
        },
        "hyuuga-hinata": {
            "id": "hyuuga-hinata",
            "characterId": "hyuuga-hinata",
            "name": "Hyuuga Hinata",
            "facePicture": "https://i.imgur.com/p06GvRH.png",
            "characterdeescription": "A timid genin of the Hyuuga clan, Hinata possesses the powerful Byakugan but struggles with a lack of confidence in her own abilities. Inspired by Naruto's determination, she seeks to overcome her insecurities and prove herself worthy of her clan's legacy.",
            "passive": {
                "name": "Shy Byakugan",
                "icon": "https://i.imgur.com/G3R99oG.png",
                "description": "After 4 turns, Hinata awakens her Byakugan, permanently enhancing her skills. This effect activates early if an ally falls below 50 health.",
                "awakening": {
                    "statusId": "hyuuga_hinata_shy_byakugan_awakened",
                    "afterOwnerTurns": 4,
                    "allyHpBelow": 50,
                    "clearCooldownSkillIds": [
                        "hyuuga-hinata-hinata-gentle-fist"
                    ],
                    "metadata": {
                        "helpful": true,
                        "permanent": true,
                        "cannotBeCleansed": true,
                        "skillCooldownOverridesBySkillId": {
                            "hyuuga-hinata-hinata-gentle-fist": 0
                        },
                        "tooltipText": "Shy Byakugan has awakened. Hinata Gentle Fist has no cooldown and Eight Trigrams 64 Palms is available."
                    }
                }
            },
            "skills": [
                {
                    "id": "hyuuga-hinata-hinata-gentle-fist",
                    "name": "Hinata Gentle Fist",
                    "skillimage": "https://i.imgur.com/ViRXQMp.png",
                    "skilldescription": "Hinata deals 15 physical damage to an enemy and reduces their non-affliction damage by 10 for 1 turn. While Shy Byakugan is active, this skill has no cooldown.",
                    "energy": [
                        "Random"
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
                            "amount": 15,
                            "scope": "target"
                        },
                        {
                            "type": "apply_status",
                            "statusId": "hyuuga_hinata_gentle_fist_debuff",
                            "duration": 1,
                            "scope": "target",
                            "metadata": {
                                "harmful": true,
                                "nonAfflictionDamageDebuffFlat": 10,
                                "turnDurationAnchor": "source_turn",
                                "tooltipText": "This character deals 10 less non-affliction damage for 1 turn."
                            }
                        }
                    ]
                },
                {
                    "id": "hyuuga-hinata-eight-trigrams-64-palms",
                    "name": "Eight Trigrams 64 Palms",
                    "skillimage": "https://i.imgur.com/ADoVhoI.png",
                    "skilldescription": "Requires Shy Byakugan. Hinata deals 10 physical damage to all enemies, heals all allies for 10 health, and reduces the non-affliction damage of all enemies by 5 for 1 turn. This skill's damage and healing are increased by 5 for 1 turn after use.",
                    "energy": [
                        "Ninjutsu"
                    ],
                    "target": "all-enemy",
                    "damage": 0,
                    "cooldown": 0,
                    "actorCondition": {
                        "statusId": "hyuuga_hinata_shy_byakugan_awakened"
                    },
                    "classes": [
                        "Physical",
                        "Instant"
                    ],
                    "effects": [
                        {
                            "type": "damage",
                            "amount": 10,
                            "scope": "all-enemy"
                        },
                        {
                            "type": "heal",
                            "amount": 10,
                            "scope": "all-allies"
                        },
                        {
                            "type": "apply_status",
                            "statusId": "hyuuga_hinata_64_palms_debuff",
                            "duration": 1,
                            "scope": "all-enemy",
                            "metadata": {
                                "harmful": true,
                                "nonAfflictionDamageDebuffFlat": 5,
                                "turnDurationAnchor": "source_turn",
                                "tooltipText": "This character deals 5 less non-affliction damage for 1 turn."
                            }
                        },
                        {
                            "type": "apply_status",
                            "statusId": "hyuuga_hinata_64_palms_boost",
                            "duration": 1,
                            "scope": "self",
                            "metadata": {
                                "helpful": true,
                                "skillDamageBonuses": {
                                    "hyuuga-hinata-eight-trigrams-64-palms": 5
                                },
                                "skillHealingBonuses": {
                                    "hyuuga-hinata-eight-trigrams-64-palms": 5
                                },
                                "tooltipText": "Eight Trigrams 64 Palms deals 5 more damage and heals 5 more health for 1 turn."
                            }
                        }
                    ]
                },
                {
                    "id": "hyuuga-hinata-secret-ointment",
                    "name": "Secret Oinment",
                    "skillimage": "https://i.imgur.com/8y7PIEz.png",
                    "skilldescription": "Hinata applies a healing ointment to herself or an ally, restoring 5 health each turn for 4 turns. During this time, all other healing received by the target is increased by 5. This effect cannot be reapplied while active.",
                    "energy": [
                        "Random"
                    ],
                    "target": "self-or-single-ally",
                    "damage": 0,
                    "cooldown": 1,
                    "targetCondition": {
                        "missingStatusId": "hyuuga_hinata_secret_ointment"
                    },
                    "classes": [
                        "Strategic",
                        "Instant"
                    ],
                    "effects": [
                        {
                            "type": "apply_status",
                            "statusId": "hyuuga_hinata_secret_ointment",
                            "duration": 4,
                            "scope": "target",
                            "metadata": {
                                "helpful": true,
                                "turnEndHealFlat": 5,
                                "turnEndTrigger": "source_turn",
                                "healReceivedBonusFlat": 5,
                                "tooltipText": "This character heals 5 health each turn for 4 turns and receives 5 additional health from other healing."
                            }
                        }
                    ]
                },
                {
                    "id": "hyuuga-hinata-hinata-block",
                    "name": "Hinata Block",
                    "skillimage": "https://i.imgur.com/ksxbj3P.png",
                    "skilldescription": "Hinata becomes invulnerable for 1 turn.",
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
                            "statusId": "invulnerable",
                            "duration": 1,
                            "scope": "self",
                            "metadata": {
                                "helpful": true,
                                "invulnerable": true,
                                "tooltipText": "Hinata is invulnerable."
                            }
                        }
                    ]
                }
            ]
        },
        "nara-shikamaru": {
                "id": "nara-shikamaru",
                "characterId": "nara-shikamaru",
                "name": "Nara Shikamaru",
                "facePicture": "https://i.imgur.com/KbecCsk.png",
                "characterdeescription": "A Genin from Team 10, a member of the Nara clan, Shikamaru is considered to be the smartest Genin of all the Konoha 11. Using his bloodline, Shikamaru can manipulate the shadows in the battlefield to disable and attack his enemies.",
                "skills": [
                        {
                                "id": "nara-shikamaru-meditate",
                                "name": "Meditate",
                                "cannotBeCountered": true,
                                "cannotBeReflected": true,
                                "skillimage": "https://i.imgur.com/s3o4f1D.png",
                                "skilldescription": "Nara Shikamaru targets one enemy permanently. During this time 'Shadow-Neck Bind' and 'Shadow Imitation' can be used on them. This skill ignores invulnerability and cannot be countered or reflected.",
                                "energy": [],
                                "target": "single-enemy",
                                "targetCondition": {
                                        "missingStatusId": "nara_shikamaru_meditate"
                                },
                                "damage": 0,
                                "cooldown": 0,
                                "classes": [
                                        "Strategic",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "apply_status",
                                                "statusId": "nara_shikamaru_meditate",
                                                "duration": 99,
                                                "scope": "target",
                                                "metadata": {
                                                        "harmful": true,
                                                        "tooltipText": "Shadow-Neck Bind and Shadow Imitation can be used on this character."
                                                }
                                        }
                                ],
                                "ignoreInvulnerability": true
                        },
                        {
                                "id": "nara-shikamaru-shadow-neck-bind",
                                "name": "Shadow-Neck Bind",
                                "skillimage": "https://i.imgur.com/qrtbpQH.png",
                                "skilldescription": "Nara Shikamaru can only use this skill on enemies affected by 'Meditate'. Affected enemies are unable to reduce damage or become invulnerable and take 15 damage for 2 turns.",
                                "energy": [
                                        "Genjutsu"
                                ],
                                "target": "all-enemy",
                                "damage": 0,
                                "cooldown": 1,
                                "classes": [
                                        "Ninjutsu",
                                        "Control"
                                ],
                                "effects": [
                                        {
                                                "type": "apply_status",
                                                "statusId": "nara_shikamaru_shadow_neck_bind",
                                                "duration": 2,
                                                "scope": "all-enemy",
                                                "metadata": {
                                                        "harmful": true,
                                                        "cannotReduceDamage": true,
                                                        "cannotBecomeInvulnerable": true,
                                                        "turnEndDamage": 15,
                                                        "turnEndTrigger": "source_turn",
                                                        "turnDurationAnchor": "source_turn",
                                                        "ongoingClass": "control",
                                                        "triggerOnApply": true,
                                                        "tooltipText": "This character cannot reduce damage or become invulnerable and takes 15 damage."
                                                }
                                        }
                                ],
                                "targetCondition": {
                                        "statusId": "nara_shikamaru_meditate"
                                }
                        },
                        {
                                "id": "nara-shikamaru-shadow-imitation",
                                "name": "Shadow Imitation",
                                "skillimage": "https://i.imgur.com/Hip2U8C.png",
                                "skilldescription": "Nara Shikamaru can only use this skill on enemies affected by 'Meditate'. Affected enemies' physical, chakra, and strategic skills are stunned for 2 turns.",
                                "energy": [
                                        "Genjutsu",
                                        "Random"
                                ],
                                "target": "all-enemy",
                                "damage": 0,
                                "cooldown": 3,
                                "classes": [
                                        "Strategic",
                                        "Control"
                                ],
                                "effects": [
                                        {
                                                "type": "apply_status",
                                                "statusId": "nara_shikamaru_shadow_imitation",
                                                "duration": 2,
                                                "scope": "all-enemy",
                                                "metadata": {
                                                        "harmful": true,
                                                        "cannotUseSkillClasses": [
                                                                "physical",
                                                                "energy",
                                                                "strategic",
                                                                "ninjutsu"
                                                        ],
                                                        "tooltipText": "This character's physical, chakra, and strategic skills are stunned.",
                                                        "ongoingClass": "control"
                                                }
                                        },
                                        {
                                                "type": "cleanse_statuses",
                                                "statusId": "nara_shikamaru_meditate",
                                                "scope": "all-enemy"
                                        }
                                ],
                                "targetCondition": {
                                        "statusId": "nara_shikamaru_meditate"
                                }
                        },
                        {
                                "id": "nara-shikamaru-shikamaru-hide",
                                "name": "Shikamaru Hide",
                                "skillimage": "https://i.imgur.com/NF4jrLc.png",
                                "skilldescription": "This skill makes Nara Shikamaru invulnerable for 1 turn.",
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
                                                "statusId": "invulnerable",
                                                "duration": 1,
                                                "scope": "self",
                                                "metadata": {
                                                        "invulnerable": true,
                                                        "tooltipText": "This character is invulnerable."
                                                }
                                        }
                                ]
                        }
                ]
        },
        "akimichi-chouji": {
                "id": "akimichi-chouji",
                "characterId": "akimichi-chouji",
                "name": "Akimichi Chouji",
                "facePicture": "https://i.imgur.com/QicD98O.png",
                "characterdeescription": "A Genin from Team 10, Chouji is a member of the Akimichi clan, a large eater, and a close friend to his allies. While innately strong, Chouji is able to sacrifice his own life using special pills from his clan to become insanely powerful.",
                "skills": [
                        {
                                "id": "akimichi-chouji-partial-double-size",
                                "name": "Partial Double Size",
                                "skillimage": "https://i.imgur.com/7iQlK0v.png",
                                "skilldescription": "Akimichi Chouji deals 20 damage to one enemy.",
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
                                                "scope": "target"
                                        }
                                ]
                        },
                        {
                                "id": "akimichi-chouji-meat-tank",
                                "name": "Meat Tank",
                                "skillimage": "https://i.imgur.com/Iwup0It.png",
                                "skilldescription": "Akimichi Chouji deals 10 damage to one enemy for 2 turns, becomes invulnerable for 2 turns, and ignores all healing effects while active.",
                                "energy": [
                                        "Bloodline"
                                ],
                                "target": "single-enemy",
                                "damage": 0,
                                "cooldown": 2,
                                "classes": [
                                        "Physical",
                                        "Action"
                                ],
                                "effects": [
                                        {
                                                "type": "apply_status",
                                                "statusId": "akimichi_chouji_meat_tank_damage",
                                                "duration": 2,
                                                "scope": "target",
                                                "metadata": {
                                                        "harmful": true,
                                                        "turnEndDamage": 10,
                                                        "turnEndTrigger": "source_turn",
                                                        "turnDurationAnchor": "source_turn",
                                                        "ongoingClass": "action",
                                                        "triggerOnApply": true,
                                                        "tooltipText": "This character takes 10 damage from Meat Tank."
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "akimichi_chouji_meat_tank_invulnerable",
                                                "duration": 2,
                                                "scope": "self",
                                                "metadata": {
                                                        "invulnerable": true,
                                                        "tooltipText": "Chouji is invulnerable and ignores healing effects.",
                                                        "healReceivedMultiplier": 0,
                                                        "ongoingClass": "action"
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "akimichi-chouji-akimichi-pills",
                                "name": "Akimichi Pills",
                                "maxUses": 3,
                                "skillimage": "https://i.imgur.com/xva0CTn.png",
                                "skilldescription": "For the rest of the game, 'Partial Double Size' will deal 20 additional damage and 'Meat Tank' will deal 10 additional damage. Akimichi Chouji takes 20 damage. This skill can only be used three times.",
                                "energy": [
                                        "Random"
                                ],
                                "target": "self",
                                "damage": 0,
                                "cooldown": 0,
                                "classes": [
                                        "Strategic",
                                        "Instant",
                                        "Affliction"
                                ],
                                "effects": [
                                        {
                                                "type": "apply_status",
                                                "statusId": "akimichi_chouji_akimichi_pills",
                                                "duration": 99,
                                                "scope": "self",
                                                "metadata": {
                                                        "mergeSkillDamageBonuses": true,
                                                        "skillDamageBonuses": {
                                                                "akimichi-chouji-partial-double-size": 20,
                                                                "akimichi-chouji-meat-tank": 10
                                                        },
                                                        "tooltipText": "Partial Double Size deals 20 additional damage.\nMeat Tank deals 10 additional damage."
                                                }
                                        },
                                        {
                                                "type": "HealthLoss",
                                                "amount": 20,
                                                "scope": "self"
                                        }
                                ]
                        },
                        {
                                "id": "akimichi-chouji-effortless-block",
                                "name": "Effortless Block",
                                "skillimage": "https://i.imgur.com/9ZNpEEN.png",
                                "skilldescription": "This skill makes Akimichi Chouji invulnerable for 1 turn.",
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
                                                "statusId": "invulnerable",
                                                "duration": 1,
                                                "scope": "self",
                                                "metadata": {
                                                        "invulnerable": true,
                                                        "tooltipText": "This character is invulnerable."
                                                }
                                        }
                                ]
                        }
                ]
        }
};
});
