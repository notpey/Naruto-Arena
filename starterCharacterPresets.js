(function (root, factory) {
    const presets = factory();
    Object.values(presets).forEach((character) => { character.tags = ['konoha-genin']; });
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
    "facePicture": "https://i.imgur.com/1uY4Ta3.png",
    "characterdeescription": "A headstrong and competitive genin of Team 8, Kiba relies on the Inuzuka clan's heightened senses and ferocious fighting techniques to overwhelm his opponents. Confident in his abilities and eager to prove his strength, he charges into battle with reckless enthusiasm.",
    "passive": {
        "name": "Heightened Senses",
        "icon": "https://i.imgur.com/0ctBe2q.png",
        "description": "Kiba can see invisible enemy skills.",
        "revealInvisibleSkills": true
    },
    "skills": [
        {
            "id": "inuzuka-kiba-dynamic-air-marking",
            "name": "Dynamic Air Marking",
            "skillimage": "https://i.imgur.com/ImizG0d.png",
            "skilldescription": "Kiba marks an enemy for 4 turns. During this time, they cannot reduce incoming damage or become invulnerable, and their counter effects are ignored. This skill cannot be used on an enemy already affected by it.",
            "energy": [],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "targetCondition": {
                "missingStatusId": "inuzuka_kiba_dynamic_air_marking"
            },
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "inuzuka_kiba_dynamic_air_marking",
                    "duration": 4,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotReduceDamage": true,
                        "cannotBecomeInvulnerable": true,
                        "ignoreCounters": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character cannot reduce incoming damage or become invulnerable, and their counter effects are ignored."
                    }
                }
            ]
        },
        {
            "id": "inuzuka-kiba-garouga",
            "name": "Garouga",
            "skillimage": "https://i.imgur.com/2zAwPJv.png",
            "skilldescription": "Kiba deals 30 physical damage to one enemy. If they are affected by Dynamic Air Marking, Garouga costs 1 less random chakra for 1 turn.",
            "energy": [
                "Taijutsu",
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
                    "statusId": "inuzuka_kiba_garouga_discount",
                    "duration": 1,
                    "scope": "self",
                    "condition": {
                        "scope": "target",
                        "statusId": "inuzuka_kiba_dynamic_air_marking"
                    },
                    "metadata": {
                        "helpful": true,
                        "skillCostOverridesBySkillId": {
                            "inuzuka-kiba-garouga": {
                                "energy": [
                                    "Taijutsu"
                                ]
                            }
                        },
                        "tooltipText": "Garouga costs 1 less random chakra for 1 turn."
                    }
                }
            ]
        },
        {
            "id": "inuzuka-kiba-double-headed-wolf",
            "name": "Double Headed Wolf",
            "skillimage": "https://i.imgur.com/rfOPouH.png",
            "skilldescription": "Kiba and all allies become invulnerable to enemy physical skills for 1 turn. The following turn, Garouga is replaced by Double Garouga.",
            "energy": [
                "Bloodline"
            ],
            "target": "all-allies",
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "inuzuka_kiba_double_headed_wolf_protection",
                    "duration": 1,
                    "scope": "all-allies",
                    "metadata": {
                        "helpful": true,
                        "invulnerableToSkillClasses": [
                            "physical"
                        ],
                        "tooltipText": "This character is invulnerable to enemy physical skills."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "inuzuka_kiba_double_headed_wolf_form",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillReplacements": {
                            "inuzuka-kiba-garouga": "inuzuka-kiba-double-garouga"
                        },
                        "tooltipText": "Garouga is replaced by Double Garouga next turn."
                    }
                }
            ]
        },
        {
            "id": "inuzuka-kiba-smoke-bomb",
            "name": "Smoke Bomb",
            "skillimage": "https://i.imgur.com/DHgVzdv.png",
            "skilldescription": "Kiba becomes invulnerable for 1 turn.",
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
                    "statusId": "inuzuka_kiba_smoke_bomb",
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
            "id": "inuzuka-kiba-double-garouga",
            "name": "Double Garouga",
            "hiddenFromSelectionViewer": true,
            "skillimage": "https://i.imgur.com/jLD3s0g.png",
            "skilldescription": "Kiba deals 30 physical damage to one enemy and 30 physical damage to a different random enemy. If either is affected by Dynamic Air Marking, Garouga costs 1 less random chakra for 1 turn.",
            "energy": [
                "Taijutsu",
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
                    "type": "damage",
                    "amount": 30,
                    "scope": "random-other-enemy",
                    "metadata": {
                        "randomScopeGroupKey": "kiba_double_garouga_secondary"
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "inuzuka_kiba_garouga_discount",
                    "duration": 1,
                    "scope": "self",
                    "condition": {
                        "scope": "target",
                        "statusId": "inuzuka_kiba_dynamic_air_marking"
                    },
                    "metadata": {
                        "helpful": true,
                        "skillCostOverridesBySkillId": {
                            "inuzuka-kiba-garouga": {
                                "energy": [
                                    "Taijutsu"
                                ]
                            }
                        },
                        "tooltipText": "Garouga costs 1 less random chakra for 1 turn."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "inuzuka_kiba_garouga_discount",
                    "duration": 1,
                    "scope": "random-other-enemy",
                    "applyToSource": true,
                    "condition": {
                        "scope": "target",
                        "statusId": "inuzuka_kiba_dynamic_air_marking"
                    },
                    "metadata": {
                        "helpful": true,
                        "randomScopeGroupKey": "kiba_double_garouga_secondary",
                        "skillCostOverridesBySkillId": {
                            "inuzuka-kiba-garouga": {
                                "energy": [
                                    "Taijutsu"
                                ]
                            }
                        },
                        "tooltipText": "Garouga costs 1 less random chakra for 1 turn."
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
                    "skilldescription": "Shino permanently marks one enemy not already affected by Female Bug. Whenever that enemy uses a skill that costs chakra, they take 5 affliction damage for each chakra spent. Only one enemy can be marked at a time. This effect ends when Shino dies.",
                    "energy": [],
                    "target": "single-enemy",
                    "targetCondition": { "missingStatusId": "aburame_shino_female_bug" },
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
                    "skilldescription": "Shino infests one enemy who is not already affected by Infestation. That enemy takes 5 affliction damage each turn until Shino dies. If they are affected by Female Bug, they also deal 5 less non-affliction damage.",
                    "energy": [
                        "Random"
                    ],
                    "target": "single-enemy",
                    "targetCondition": { "missingStatusId": "aburame_shino_infestation" },
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
                    "skilldescription": "Requires Shy Byakugan. Hinata deals 5 physical damage to all enemies, heals all allies for 5 health, and gives all allies 5 damage reduction for 1 turn. This skill's damage and healing are increased by 5 for 1 turn after use.",
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
                            "amount": 5,
                            "scope": "all-enemy"
                        },
                        {
                            "type": "heal",
                            "amount": 5,
                            "scope": "all-allies"
                        },
                        {
                            "type": "apply_status",
                            "statusId": "hyuuga_hinata_64_palms_reduction",
                            "duration": 1,
                            "scope": "all-allies",
                            "metadata": {
                                "helpful": true,
                                "damageReductionFlat": 5,
                                "tooltipText": "This character has 5 damage reduction for 1 turn."
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
            ],
            "tags": [
                "konoha-genin"
            ]
        },
        "nara-shikamaru": {
                "id": "nara-shikamaru",
                "characterId": "nara-shikamaru",
                "name": "Nara Shikamaru",
                "facePicture": "https://i.imgur.com/4Pwe4ro.png",
                "characterdeescription": "A brilliant yet notoriously lazy genin of Team 10, Shikamaru possesses an exceptional intellect and mastery of the Nara clan's shadow techniques. Despite his carefree attitude, his cunning strategies allow him to outwit opponents and turn even the most unfavorable battles to his advantage.",
                "requiredMissionId": null,
                "passive": {
                        "name": "Ninja Tactics, for Dummies",
                        "icon": "https://i.imgur.com/e7udnLJ.png",
                        "description": "At the start of the battle, Shikamaru secretly marks a random enemy. Shadow-Neck Bind and Shadow Imitation affect all enemies marked by this passive or Meditate.",
                        "startApplyStatusToRandomEnemy": {
                                "statusId": "nara_shikamaru_ninja_tactics_mark",
                                "duration": 99,
                                "metadata": {
                                        "harmful": true,
                                        "permanent": true,
                                        "hideTooltipFromUnitOwner": true,
                                        "statusIcon": "https://i.imgur.com/e7udnLJ.png",
                                        "sourceSkillName": "Ninja Tactics, for Dummies",
                                        "tooltipText": "Shikamaru has secretly marked this character. Shadow-Neck Bind and Shadow Imitation affect them."
                                }
                        }
                },
                "skills": [
                        {
                                "id": "nara-shikamaru-meditate",
                                "name": "Meditate",
                                "skillimage": "https://i.imgur.com/fglmxM1.png",
                                "skilldescription": "Shikamaru studies an enemy's movements, marking them with Meditate for 5 turns. This skill cannot be used on an enemy already affected by it, and the effect ends if Shikamaru dies.",
                                "energy": [],
                                "target": "single-enemy",
                                "damage": 0,
                                "cooldown": 0,
                                "targetCondition": {
                                        "missingStatusId": "nara_shikamaru_meditate"
                                },
                                "classes": [
                                        "Strategic",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "apply_status",
                                                "statusId": "nara_shikamaru_meditate",
                                                "duration": 5,
                                                "scope": "target",
                                                "metadata": {
                                                        "harmful": true,
                                                        "turnDurationAnchor": "source_turn",
                                                        "removeOnSourceDeath": true,
                                                        "tooltipText": "Shadow-Neck Bind and Shadow Imitation affect this character."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "nara-shikamaru-shadow-neck-bind",
                                "name": "Shadow-Neck Bind",
                                "skillimage": "https://i.imgur.com/ZQXKyPQ.png",
                                "skilldescription": "Shikamaru constricts his enemies with shadows, dealing 15 physical damage to all marked enemies each turn for 2 turns. During this time, affected enemies cannot reduce incoming damage or become invulnerable.",
                                "energy": [
                                        "Genjutsu"
                                ],
                                "target": "all-enemy",
                                "damage": 0,
                                "cooldown": 0,
                                "targetCondition": {
                                        "statusIdsAny": [
                                                "nara_shikamaru_ninja_tactics_mark",
                                                "nara_shikamaru_meditate"
                                        ]
                                },
                                "classes": [
                                        "Physical",
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
                                                        "ongoingClass": "control",
                                                        "cannotReduceDamage": true,
                                                        "cannotBecomeInvulnerable": true,
                                                        "turnEndDamage": 15,
                                                        "turnEndTrigger": "source_turn",
                                                        "turnEndSkillClasses": [
                                                                "Physical"
                                                        ],
                                                        "turnDurationAnchor": "source_turn",
                                                        "triggerOnApply": true,
                                                        "tooltipText": "This character takes 15 physical damage each turn and cannot reduce damage or become invulnerable."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "nara-shikamaru-shadow-imitation",
                                "name": "Shadow Imitation",
                                "skillimage": "https://i.imgur.com/jlKHCbs.png",
                                "skilldescription": "Shikamaru binds his enemies with their own shadows, stunning the physical and chakra skills of all marked enemies for 2 turns.",
                                "energy": [
                                        "Bloodline",
                                        "Genjutsu"
                                ],
                                "target": "all-enemy",
                                "damage": 0,
                                "cooldown": 2,
                                "targetCondition": {
                                        "statusIdsAny": [
                                                "nara_shikamaru_ninja_tactics_mark",
                                                "nara_shikamaru_meditate"
                                        ]
                                },
                                "classes": [
                                        "Chakra",
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
                                                        "ongoingClass": "control",
                                                        "turnDurationAnchor": "source_turn",
                                                        "cannotUseSkillClasses": [
                                                                "physical",
                                                                "chakra"
                                                        ],
                                                        "tooltipText": "This character's physical and chakra skills are stunned."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "nara-shikamaru-shikamaru-hide",
                                "name": "Shikamaru Hide",
                                "skillimage": "https://i.imgur.com/eAbeTyw.png",
                                "skilldescription": "Shikamaru conceals himself in the shadows, becoming invulnerable for 1 turn.",
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
                                                "statusId": "nara_shikamaru_shikamaru_hide",
                                                "duration": 1,
                                                "scope": "self",
                                                "metadata": {
                                                        "helpful": true,
                                                        "invulnerable": true,
                                                        "tooltipText": "Shikamaru is invulnerable."
                                                }
                                        }
                                ]
                        }
                ],
                "tags": [
                        "konoha-genin"
                ]
        },
        "akimichi-chouji": {
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
                                "target": "self",
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
                                        "Instant"
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
                                        "Instant"
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
                ],
                "tags": [
                        "konoha-genin"
                ]
        }
};
});
