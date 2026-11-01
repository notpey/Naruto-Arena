(function (root, factory) {
    const presets = factory();
    ['yamanaka-ino', 'rock-lee', 'tenten', 'neji-hyuuga'].forEach((id) => {
        if (presets[id]) presets[id].tags = ['konoha-genin'];
    });
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = presets;
    } else {
        root.STARTER_CHARACTER_PRESETS = Object.assign(root.STARTER_CHARACTER_PRESETS || {}, presets);
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    return {
        "yamanaka-ino": {
            "id": "yamanaka-ino",
            "characterId": "yamanaka-ino",
            "name": "Yamanaka Ino",
            "facePicture": "https://i.imgur.com/h2p3QjN.png",
            "characterdeescription": "A confident young kunoichi from Konohagakure's Yamanaka clan, Ino specializes in secret techniques that allow her to transfer her consciousness into another person's body. During the Chūnin Exams, her rivalry with Sakura reveals a clever and resourceful fighter capable of deceiving opponents into falling for her carefully prepared traps.",
            "passive": {
                "name": "Art of the Valentine",
                "icon": "https://i.imgur.com/kZPSOwC.png",
                "description": "When Ino successfully stuns an enemy, Mind Transfer Feint deals 5 additional Chakra damage on its next use.",
                "nextSkillDamageBonusOnStun": {
                    "skillId": "yamanaka-ino-mind-transfer-feint",
                    "amount": 5
                }
            },
            "skills": [
                {
                    "id": "yamanaka-ino-mind-transfer-feint",
                    "name": "Mind Transfer Feint",
                    "skillimage": "https://i.imgur.com/1RddcCQ.png",
                    "skilldescription": "Ino deals 20 Chakra damage to one enemy. If that enemy is stunned, this skill deals 10 additional damage. After Ino stuns an enemy, its next use deals 5 additional Chakra damage.",
                    "energy": [
                        "Random"
                    ],
                    "target": "single-enemy",
                    "damage": 0,
                    "cooldown": 0,
                    "classes": [
                        "Chakra",
                        "Instant"
                    ],
                    "effects": [
                        {
                            "type": "damage",
                            "amount": 20,
                            "scope": "target",
                            "metadata": {
                                "skillClasses": [
                                    "Chakra"
                                ],
                                "bonusDamageIfTargetStunned": 10
                            }
                        }
                    ]
                },
                {
                    "id": "yamanaka-ino-mind-body-switch",
                    "name": "Mind Body Switch",
                    "skillimage": "https://i.imgur.com/cKdM0Dy.png",
                    "skilldescription": "Ino stuns one enemy for 2 turns. During this time, this skill is replaced by Forced Betrayal. If Ino is stunned, Mind Body Switch ends.",
                    "energy": [
                        "Genjutsu",
                        "Genjutsu"
                    ],
                    "target": "single-enemy",
                    "damage": 0,
                    "cooldown": 2,
                    "classes": [
                        "Chakra",
                        "Control"
                    ],
                    "effects": [
                        {
                            "type": "apply_status",
                            "statusId": "ino_mind_body_switch_target",
                            "duration": 2,
                            "scope": "target",
                            "metadata": {
                                "harmful": true,
                                "cannotUseSkills": true,
                                "ongoingClass": "control",
                                "endsOnAnySourceStun": true,
                                "turnDurationAnchor": "source_turn",
                                "tooltipText": "Mind Body Switch: all skills are stunned while Ino maintains control."
                            }
                        },
                        {
                            "type": "apply_status",
                            "statusId": "ino_mind_body_switch_active",
                            "duration": 2,
                            "scope": "self",
                            "condition": {
                                "scope": "target",
                                "statusId": "ino_mind_body_switch_target",
                                "statusFromActor": true
                            },
                            "metadata": {
                                "helpful": true,
                                "ongoingClass": "control",
                                "endsOnAnySourceStun": true,
                                "linkedTargetStatusId": "ino_mind_body_switch_target",
                                "copyTargetKeyToKeys": [
                                    "linkedTargetKey"
                                ],
                                "skillReplacements": {
                                    "yamanaka-ino-mind-body-switch": "yamanaka-ino-forced-betrayal"
                                },
                                "tooltipText": "Mind Body Switch is replaced by Forced Betrayal while the target is controlled."
                            }
                        }
                    ]
                },
                {
                    "id": "yamanaka-ino-chakra-hair-strand-trap",
                    "name": "Chakra Hair Strand Trap",
                    "skillimage": "https://i.imgur.com/7m4IPdu.png",
                    "skilldescription": "Ino places an invisible trap on one enemy for 2 turns. The first time that enemy uses a new harmful skill, their Physical and Chakra skills are stunned for 1 turn, and the trap ends.",
                    "energy": [
                        "Genjutsu"
                    ],
                    "target": "single-enemy",
                    "damage": 0,
                    "cooldown": 0,
                    "classes": [
                        "Strategic",
                        "Instant"
                    ],
                    "effects": [
                        {
                            "type": "apply_status",
                            "statusId": "ino_hair_strand_trap",
                            "duration": 2,
                            "scope": "target",
                            "metadata": {
                                "harmful": true,
                                "invisible": true,
                                "hideTooltipFromUnitOwner": true,
                                "onOwnerUseSkillTrigger": true,
                                "onOwnerUseSkillHarmfulOnly": true,
                                "onOwnerUseSkillEffects": [
                                    {
                                        "type": "apply_status",
                                        "statusId": "ino_hair_strand_stun",
                                        "duration": 1,
                                        "fresh": true,
                                        "scope": "self",
                                        "metadata": {
                                            "harmful": true,
                                            "cannotUseSkillClasses": [
                                                "physical",
                                                "chakra"
                                            ],
                                            "tooltipText": "Physical and Chakra skills are stunned."
                                        }
                                    }
                                ],
                                "turnDurationAnchor": "source_turn",
                                "tooltipText": "The next harmful skill triggers a Physical and Chakra stun."
                            }
                        }
                    ]
                },
                {
                    "id": "yamanaka-ino-ino-block",
                    "name": "Ino Block",
                    "skillimage": "https://i.imgur.com/bgwFeRq.png",
                    "skilldescription": "Yamanaka Ino becomes invulnerable for 1 turn.",
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
                            "statusId": "ino_block",
                            "duration": 1,
                            "scope": "self",
                            "metadata": {
                                "helpful": true,
                                "invulnerable": true,
                                "tooltipText": "Ino is invulnerable."
                            }
                        }
                    ]
                },
                {
                    "id": "yamanaka-ino-forced-betrayal",
                    "name": "Forced Betrayal",
                    "hiddenFromSelectionViewer": true,
                    "skillimage": "https://i.imgur.com/TX3m6tw.png",
                    "skilldescription": "Ino deals 30 physical damage to one enemy through Mind Body Switch.",
                    "energy": [
                        "Random"
                    ],
                    "target": "single-enemy",
                    "targetCondition": {
                        "statusId": "ino_mind_body_switch_target",
                        "statusFromActor": true
                    },
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
                                "damageSourceControlledStatusId": "ino_mind_body_switch_target"
                            }
                        }
                    ]
                }
            ],
            "tags": [
                "konoha-genin"
            ]
        },
        "rock-lee": {
            "id": "rock-lee",
            "characterId": "rock-lee",
            "name": "Rock Lee",
            "facePicture": "https://i.imgur.com/LUA3QK2.jpg",
            "characterdeescription": "A hardworking genin of Team Guy, Rock Lee lacks the ability to use ninjutsu or genjutsu and has devoted himself entirely to mastering taijutsu. Through relentless training and unwavering determination, he seeks to prove that hard work can overcome natural talent.",
            "passive": {
                "name": "Gate Opening",
                "icon": "https://i.imgur.com/P9VlwlX.jpg",
                "description": "Whenever Lee uses a physical skill, he opens 1 Gate, up to 5 times. Each Gate Opening increases his physical damage by 5. Upon opening his fifth Gate, Lee cleanses himself, gains 1 taijutsu chakra, takes 50 affliction damage that cannot kill him, and becomes invulnerable for 1 turn."
            },
            "startStatuses": [
                {
                    "statusId": "rock_lee_gate_opening_trigger",
                    "duration": 99,
                    "metadata": {
                        "permanent": true,
                        "cannotBeCleansed": true,
                        "hideTooltip": true,
                        "onOwnerUseSkillTrigger": true,
                        "preserveOnOwnerUseSkillTrigger": true,
                        "onOwnerUseSkillClassesAny": [
                            "Physical"
                        ],
                        "onOwnerUseSkillApplyStatusToOwner": {
                            "statusId": "rock_lee_gate_openings",
                            "duration": 99,
                            "metadata": {
                                "helpful": true,
                                "cannotBeCleansed": true,
                                "stackMetadataKey": "gateCount",
                                "stackDelta": 1,
                                "stackMax": 5,
                                "stackDerivedNumericKeys": {
                                    "gateDamageBonus": 5
                                },
                                "tooltipTextTemplate": "Lee has opened {gateCount} Gates and deals {gateDamageBonus} additional physical damage.",
                                "applyStatusAtStack": {
                                    "metadataKey": "gateCount",
                                    "value": 5,
                                    "statusId": "rock_lee_fifth_gate_skills",
                                    "duration": 99,
                                    "metadata": {
                                        "helpful": true,
                                        "cannotBeCleansed": true,
                                        "onOwnerKillSourceSkillIdsAny": [
                                            "rock-lee-final-lotus"
                                        ],
                                        "onOwnerKillTargetRelation": "enemy",
                                        "onOwnerKillGainChakra": {
                                            "chakraType": "taijutsu",
                                            "amount": 1
                                        },
                                        "onOwnerKillApplyStatusToSelf": {
                                            "statusId": "rock_lee_final_lotus_immortal",
                                            "duration": 1,
                                            "metadata": {
                                                "helpful": true,
                                                "minimumHp": 1,
                                                "tooltipText": "Lee cannot be killed for 1 turn."
                                            }
                                        },
                                        "skillCooldownOverridesBySkillId": {
                                            "rock-lee-high-speed-taijutsu": 0,
                                            "rock-lee-front-lotus": 0
                                        },
                                        "skillReplacements": {
                                            "rock-lee-remove-training-weights": "rock-lee-final-lotus"
                                        },
                                        "tooltipText": "High Speed Taijutsu and Front Lotus have no cooldown. Remove Training Weights is replaced by Final Lotus."
                                    }
                                }
                            }
                        }
                    }
                }
            ],
            "skills": [
                {
                    "id": "rock-lee-high-speed-taijutsu",
                    "name": "High Speed Taijutsu",
                    "skillimage": "https://i.imgur.com/roHIgPj.jpg",
                    "skilldescription": "Lee deals 25 physical damage to one enemy and becomes invulnerable to physical skills for 1 turn. On the following turn, this skill can be used again for 1 random chakra. At 3 or more Gate Openings, its first use costs 1 less random chakra. At 5 Gate Openings, this skill has no cooldown.",
                    "energy": [
                        "Taijutsu",
                        "Random"
                    ],
                    "energyBySourceStatusMetadata": {
                        "statusId": "rock_lee_gate_openings",
                        "metadataKey": "gateCount",
                        "tiers": [
                            {
                                "min": 3,
                                "energy": [
                                    "Taijutsu"
                                ]
                            }
                        ]
                    },
                    "target": "single-enemy",
                    "damage": 0,
                    "cooldown": 2,
                    "classes": [
                        "Physical",
                        "Instant"
                    ],
                    "effects": [
                        {
                            "type": "cleanse_statuses",
                            "scope": "self",
                            "harmfulOnly": true,
                            "condition": {
                                "all": [
                                    {
                                        "statusMetadataAtLeast": {
                                            "statusId": "rock_lee_gate_openings",
                                            "metadataKey": "gateCount",
                                            "value": 5
                                        }
                                    },
                                    {
                                        "missingStatusId": "rock_lee_fifth_gate_used"
                                    }
                                ]
                            }
                        },
                        {
                            "type": "gain_chakra",
                            "scope": "self",
                            "chakraType": "taijutsu",
                            "amount": 1,
                            "condition": {
                                "all": [
                                    {
                                        "statusMetadataAtLeast": {
                                            "statusId": "rock_lee_gate_openings",
                                            "metadataKey": "gateCount",
                                            "value": 5
                                        }
                                    },
                                    {
                                        "missingStatusId": "rock_lee_fifth_gate_used"
                                    }
                                ]
                            }
                        },
                        {
                            "type": "damage",
                            "scope": "self",
                            "amount": 50,
                            "condition": {
                                "all": [
                                    {
                                        "statusMetadataAtLeast": {
                                            "statusId": "rock_lee_gate_openings",
                                            "metadataKey": "gateCount",
                                            "value": 5
                                        }
                                    },
                                    {
                                        "missingStatusId": "rock_lee_fifth_gate_used"
                                    }
                                ]
                            },
                            "metadata": {
                                "afflictionDamage": true,
                                "minimumHp": 1,
                                "skillClasses": [
                                    "Affliction"
                                ]
                            }
                        },
                        {
                            "type": "apply_status",
                            "scope": "self",
                            "statusId": "rock_lee_fifth_gate_invulnerable",
                            "duration": 1,
                            "condition": {
                                "all": [
                                    {
                                        "statusMetadataAtLeast": {
                                            "statusId": "rock_lee_gate_openings",
                                            "metadataKey": "gateCount",
                                            "value": 5
                                        }
                                    },
                                    {
                                        "missingStatusId": "rock_lee_fifth_gate_used"
                                    }
                                ]
                            },
                            "metadata": {
                                "helpful": true,
                                "invulnerable": true,
                                "tooltipText": "Lee is invulnerable for 1 turn."
                            }
                        },
                        {
                            "type": "apply_status",
                            "scope": "self",
                            "statusId": "rock_lee_fifth_gate_used",
                            "duration": 99,
                            "condition": {
                                "all": [
                                    {
                                        "statusMetadataAtLeast": {
                                            "statusId": "rock_lee_gate_openings",
                                            "metadataKey": "gateCount",
                                            "value": 5
                                        }
                                    },
                                    {
                                        "missingStatusId": "rock_lee_fifth_gate_used"
                                    }
                                ]
                            },
                            "metadata": {
                                "helpful": true,
                                "tooltipText": "Lee has opened his fifth Gate."
                            }
                        },
                        {
                            "type": "damage",
                            "amount": 25,
                            "scope": "target",
                            "metadata": {
                                "bonusPerStatusMetadata": {
                                    "scope": "self",
                                    "statusId": "rock_lee_gate_openings",
                                    "metadataKey": "gateCount",
                                    "multiplier": 5
                                }
                            }
                        },
                        {
                            "type": "apply_status",
                            "scope": "self",
                            "statusId": "rock_lee_high_speed_physical_invulnerable",
                            "duration": 1,
                            "metadata": {
                                "helpful": true,
                                "invulnerableToPhysicalSkills": true,
                                "tooltipText": "Lee is invulnerable to physical skills."
                            }
                        },
                        {
                            "type": "apply_status",
                            "scope": "self",
                            "statusId": "rock_lee_high_speed_follow_up",
                            "duration": 1,
                            "metadata": {
                                "helpful": true,
                                "turnDurationAnchor": "source_turn",
                                "skillReplacements": {
                                    "rock-lee-high-speed-taijutsu": "rock-lee-high-speed-follow-up"
                                },
                                "tooltipText": "High Speed Taijutsu can be used again next turn for 1 random chakra."
                            }
                        }
                    ]
                },
                {
                    "id": "rock-lee-front-lotus",
                    "name": "Front Lotus",
                    "skillimage": "https://i.imgur.com/xTW0rSg.jpg",
                    "skilldescription": "Lee deals 45 physical damage to one enemy. At 3 or more Gate Openings, this skill costs 1 taijutsu chakra and 1 random chakra. At 5 Gate Openings, this skill has no cooldown.",
                    "energy": [
                        "Taijutsu",
                        "Taijutsu"
                    ],
                    "energyBySourceStatusMetadata": {
                        "statusId": "rock_lee_gate_openings",
                        "metadataKey": "gateCount",
                        "tiers": [
                            {
                                "min": 3,
                                "energy": [
                                    "Taijutsu",
                                    "Random"
                                ]
                            }
                        ]
                    },
                    "target": "single-enemy",
                    "damage": 0,
                    "cooldown": 2,
                    "classes": [
                        "Physical",
                        "Instant"
                    ],
                    "effects": [
                        {
                            "type": "cleanse_statuses",
                            "scope": "self",
                            "harmfulOnly": true,
                            "condition": {
                                "all": [
                                    {
                                        "statusMetadataAtLeast": {
                                            "statusId": "rock_lee_gate_openings",
                                            "metadataKey": "gateCount",
                                            "value": 5
                                        }
                                    },
                                    {
                                        "missingStatusId": "rock_lee_fifth_gate_used"
                                    }
                                ]
                            }
                        },
                        {
                            "type": "gain_chakra",
                            "scope": "self",
                            "chakraType": "taijutsu",
                            "amount": 1,
                            "condition": {
                                "all": [
                                    {
                                        "statusMetadataAtLeast": {
                                            "statusId": "rock_lee_gate_openings",
                                            "metadataKey": "gateCount",
                                            "value": 5
                                        }
                                    },
                                    {
                                        "missingStatusId": "rock_lee_fifth_gate_used"
                                    }
                                ]
                            }
                        },
                        {
                            "type": "damage",
                            "scope": "self",
                            "amount": 50,
                            "condition": {
                                "all": [
                                    {
                                        "statusMetadataAtLeast": {
                                            "statusId": "rock_lee_gate_openings",
                                            "metadataKey": "gateCount",
                                            "value": 5
                                        }
                                    },
                                    {
                                        "missingStatusId": "rock_lee_fifth_gate_used"
                                    }
                                ]
                            },
                            "metadata": {
                                "afflictionDamage": true,
                                "minimumHp": 1,
                                "skillClasses": [
                                    "Affliction"
                                ]
                            }
                        },
                        {
                            "type": "apply_status",
                            "scope": "self",
                            "statusId": "rock_lee_fifth_gate_invulnerable",
                            "duration": 1,
                            "condition": {
                                "all": [
                                    {
                                        "statusMetadataAtLeast": {
                                            "statusId": "rock_lee_gate_openings",
                                            "metadataKey": "gateCount",
                                            "value": 5
                                        }
                                    },
                                    {
                                        "missingStatusId": "rock_lee_fifth_gate_used"
                                    }
                                ]
                            },
                            "metadata": {
                                "helpful": true,
                                "invulnerable": true,
                                "tooltipText": "Lee is invulnerable for 1 turn."
                            }
                        },
                        {
                            "type": "apply_status",
                            "scope": "self",
                            "statusId": "rock_lee_fifth_gate_used",
                            "duration": 99,
                            "condition": {
                                "all": [
                                    {
                                        "statusMetadataAtLeast": {
                                            "statusId": "rock_lee_gate_openings",
                                            "metadataKey": "gateCount",
                                            "value": 5
                                        }
                                    },
                                    {
                                        "missingStatusId": "rock_lee_fifth_gate_used"
                                    }
                                ]
                            },
                            "metadata": {
                                "helpful": true,
                                "tooltipText": "Lee has opened his fifth Gate."
                            }
                        },
                        {
                            "type": "damage",
                            "amount": 45,
                            "scope": "target",
                            "metadata": {
                                "bonusPerStatusMetadata": {
                                    "scope": "self",
                                    "statusId": "rock_lee_gate_openings",
                                    "metadataKey": "gateCount",
                                    "multiplier": 5
                                }
                            }
                        }
                    ]
                },
                {
                    "id": "rock-lee-remove-training-weights",
                    "name": "Remove Training Weights",
                    "skillimage": "https://www.animehistory.org/uploads/screencaps/naruto-episode-048-gaara-vs-rock-lee-the-power-of-youth-explodes_/cap_13-42_678c.jpg",
                    "skilldescription": "Lee removes his training weights, causing his physical skills to deal 10 less damage but ignore counters, reflects, and invulnerability for the rest of the battle. Lee also gains 1 taijutsu chakra. This skill cannot be used while active. At 5 Gate Openings, this skill is replaced by Final Lotus.",
                    "energy": [],
                    "target": "self",
                    "damage": 0,
                    "cooldown": 0,
                    "actorCondition": {
                        "missingStatusId": "rock_lee_training_weights_removed"
                    },
                    "classes": [
                        "Strategic",
                        "Instant"
                    ],
                    "effects": [
                        {
                            "type": "apply_status",
                            "scope": "self",
                            "statusId": "rock_lee_training_weights_removed",
                            "duration": 99,
                            "metadata": {
                                "helpful": true,
                                "permanent": true,
                                "damageDebuffBySkillClass": {
                                    "physical": 10
                                },
                                "uncounterableSkillIds": [
                                    "rock-lee-high-speed-taijutsu",
                                    "rock-lee-high-speed-follow-up",
                                    "rock-lee-front-lotus",
                                    "rock-lee-final-lotus"
                                ],
                                "unreflectableSkillIds": [
                                    "rock-lee-high-speed-taijutsu",
                                    "rock-lee-high-speed-follow-up",
                                    "rock-lee-front-lotus",
                                    "rock-lee-final-lotus"
                                ],
                                "ignoreInvulnerabilityForSkillIds": [
                                    "rock-lee-high-speed-taijutsu",
                                    "rock-lee-high-speed-follow-up",
                                    "rock-lee-front-lotus",
                                    "rock-lee-final-lotus"
                                ],
                                "tooltipText": "Lee deals 10 less physical damage and ignores counters, reflects, and invulnerability with his physical skills."
                            }
                        },
                        {
                            "type": "gain_chakra",
                            "scope": "self",
                            "chakraType": "taijutsu",
                            "amount": 1
                        }
                    ]
                },
                {
                    "id": "rock-lee-lee-dodge",
                    "name": "Lee Dodge",
                    "skillimage": "https://www.animehistory.org/uploads/screencaps/naruto-episode-048-gaara-vs-rock-lee-the-power-of-youth-explodes_/cap_12-21_5fa6.jpg",
                    "skilldescription": "Lee becomes invulnerable for 1 turn.",
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
                            "scope": "self",
                            "statusId": "rock_lee_dodge",
                            "duration": 1,
                            "metadata": {
                                "helpful": true,
                                "invulnerable": true,
                                "tooltipText": "Lee is invulnerable."
                            }
                        }
                    ]
                },
                {
                    "id": "rock-lee-final-lotus",
                    "name": "Final Lotus",
                    "hiddenFromSelectionViewer": true,
                    "skillimage": "https://www.animehistory.org/uploads/screencaps/naruto-episode-050-the-fifth-gate-a-splendid-ninja-is-born/cap_04-41_363a.jpg",
                    "skilldescription": "Lee executes one enemy. If successful, he gains 1 taijutsu chakra and becomes immortal for 1 turn.",
                    "energy": [
                        "Taijutsu",
                        "Taijutsu",
                        "Taijutsu"
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
                            "type": "cleanse_statuses",
                            "scope": "self",
                            "harmfulOnly": true,
                            "condition": {
                                "all": [
                                    {
                                        "statusMetadataAtLeast": {
                                            "statusId": "rock_lee_gate_openings",
                                            "metadataKey": "gateCount",
                                            "value": 5
                                        }
                                    },
                                    {
                                        "missingStatusId": "rock_lee_fifth_gate_used"
                                    }
                                ]
                            }
                        },
                        {
                            "type": "gain_chakra",
                            "scope": "self",
                            "chakraType": "taijutsu",
                            "amount": 1,
                            "condition": {
                                "all": [
                                    {
                                        "statusMetadataAtLeast": {
                                            "statusId": "rock_lee_gate_openings",
                                            "metadataKey": "gateCount",
                                            "value": 5
                                        }
                                    },
                                    {
                                        "missingStatusId": "rock_lee_fifth_gate_used"
                                    }
                                ]
                            }
                        },
                        {
                            "type": "damage",
                            "scope": "self",
                            "amount": 50,
                            "condition": {
                                "all": [
                                    {
                                        "statusMetadataAtLeast": {
                                            "statusId": "rock_lee_gate_openings",
                                            "metadataKey": "gateCount",
                                            "value": 5
                                        }
                                    },
                                    {
                                        "missingStatusId": "rock_lee_fifth_gate_used"
                                    }
                                ]
                            },
                            "metadata": {
                                "afflictionDamage": true,
                                "minimumHp": 1,
                                "skillClasses": [
                                    "Affliction"
                                ]
                            }
                        },
                        {
                            "type": "apply_status",
                            "scope": "self",
                            "statusId": "rock_lee_fifth_gate_invulnerable",
                            "duration": 1,
                            "condition": {
                                "all": [
                                    {
                                        "statusMetadataAtLeast": {
                                            "statusId": "rock_lee_gate_openings",
                                            "metadataKey": "gateCount",
                                            "value": 5
                                        }
                                    },
                                    {
                                        "missingStatusId": "rock_lee_fifth_gate_used"
                                    }
                                ]
                            },
                            "metadata": {
                                "helpful": true,
                                "invulnerable": true,
                                "tooltipText": "Lee is invulnerable for 1 turn."
                            }
                        },
                        {
                            "type": "apply_status",
                            "scope": "self",
                            "statusId": "rock_lee_fifth_gate_used",
                            "duration": 99,
                            "condition": {
                                "all": [
                                    {
                                        "statusMetadataAtLeast": {
                                            "statusId": "rock_lee_gate_openings",
                                            "metadataKey": "gateCount",
                                            "value": 5
                                        }
                                    },
                                    {
                                        "missingStatusId": "rock_lee_fifth_gate_used"
                                    }
                                ]
                            },
                            "metadata": {
                                "helpful": true,
                                "tooltipText": "Lee has opened his fifth Gate."
                            }
                        },
                        {
                            "type": "damage",
                            "amount": 9999,
                            "scope": "target",
                            "metadata": {
                                "bonusPerStatusMetadata": {
                                    "scope": "self",
                                    "statusId": "rock_lee_gate_openings",
                                    "metadataKey": "gateCount",
                                    "multiplier": 5
                                }
                            }
                        }
                    ]
                },
                {
                    "id": "rock-lee-high-speed-follow-up",
                    "name": "High Speed Taijutsu",
                    "hiddenFromSelectionViewer": true,
                    "skillimage": "https://i.imgur.com/roHIgPj.jpg",
                    "skilldescription": "Lee deals 25 physical damage to one enemy and becomes invulnerable to physical skills for 1 turn.",
                    "energy": [
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
                            "type": "cleanse_statuses",
                            "scope": "self",
                            "harmfulOnly": true,
                            "condition": {
                                "all": [
                                    {
                                        "statusMetadataAtLeast": {
                                            "statusId": "rock_lee_gate_openings",
                                            "metadataKey": "gateCount",
                                            "value": 5
                                        }
                                    },
                                    {
                                        "missingStatusId": "rock_lee_fifth_gate_used"
                                    }
                                ]
                            }
                        },
                        {
                            "type": "gain_chakra",
                            "scope": "self",
                            "chakraType": "taijutsu",
                            "amount": 1,
                            "condition": {
                                "all": [
                                    {
                                        "statusMetadataAtLeast": {
                                            "statusId": "rock_lee_gate_openings",
                                            "metadataKey": "gateCount",
                                            "value": 5
                                        }
                                    },
                                    {
                                        "missingStatusId": "rock_lee_fifth_gate_used"
                                    }
                                ]
                            }
                        },
                        {
                            "type": "damage",
                            "scope": "self",
                            "amount": 50,
                            "condition": {
                                "all": [
                                    {
                                        "statusMetadataAtLeast": {
                                            "statusId": "rock_lee_gate_openings",
                                            "metadataKey": "gateCount",
                                            "value": 5
                                        }
                                    },
                                    {
                                        "missingStatusId": "rock_lee_fifth_gate_used"
                                    }
                                ]
                            },
                            "metadata": {
                                "afflictionDamage": true,
                                "minimumHp": 1,
                                "skillClasses": [
                                    "Affliction"
                                ]
                            }
                        },
                        {
                            "type": "apply_status",
                            "scope": "self",
                            "statusId": "rock_lee_fifth_gate_invulnerable",
                            "duration": 1,
                            "condition": {
                                "all": [
                                    {
                                        "statusMetadataAtLeast": {
                                            "statusId": "rock_lee_gate_openings",
                                            "metadataKey": "gateCount",
                                            "value": 5
                                        }
                                    },
                                    {
                                        "missingStatusId": "rock_lee_fifth_gate_used"
                                    }
                                ]
                            },
                            "metadata": {
                                "helpful": true,
                                "invulnerable": true,
                                "tooltipText": "Lee is invulnerable for 1 turn."
                            }
                        },
                        {
                            "type": "apply_status",
                            "scope": "self",
                            "statusId": "rock_lee_fifth_gate_used",
                            "duration": 99,
                            "condition": {
                                "all": [
                                    {
                                        "statusMetadataAtLeast": {
                                            "statusId": "rock_lee_gate_openings",
                                            "metadataKey": "gateCount",
                                            "value": 5
                                        }
                                    },
                                    {
                                        "missingStatusId": "rock_lee_fifth_gate_used"
                                    }
                                ]
                            },
                            "metadata": {
                                "helpful": true,
                                "tooltipText": "Lee has opened his fifth Gate."
                            }
                        },
                        {
                            "type": "damage",
                            "amount": 25,
                            "scope": "target",
                            "metadata": {
                                "bonusPerStatusMetadata": {
                                    "scope": "self",
                                    "statusId": "rock_lee_gate_openings",
                                    "metadataKey": "gateCount",
                                    "multiplier": 5
                                }
                            }
                        },
                        {
                            "type": "apply_status",
                            "scope": "self",
                            "statusId": "rock_lee_high_speed_physical_invulnerable",
                            "duration": 1,
                            "metadata": {
                                "helpful": true,
                                "invulnerableToPhysicalSkills": true,
                                "tooltipText": "Lee is invulnerable to physical skills."
                            }
                        }
                    ]
                }
            ],
            "tags": [
                "konoha-genin"
            ]
        },
        "tenten": {
            "id": "tenten",
            "characterId": "tenten",
            "name": "Tenten",
            "facePicture": "https://i.imgur.com/NHZg6gh.png",
            "characterdeescription": "A hardworking genin of Team Guy, Tenten specializes in weapons combat, using summoning scrolls to unleash a vast arsenal of deadly projectiles. Determined to become a legendary kunoichi, she relies on precision, preparation, and relentless training to overcome her opponents.",
            "passive": {
                "name": "Sharp Tools",
                "icon": "https://i.imgur.com/4KEJ94b.png",
                "description": "Enemies who use a damaging skill on Tenten take 5 physical damage.",
                "onEnemySkillTargetedDamageToSourceAmount": 5,
                "onEnemySkillTargetedDamageToSourceSkillClasses": [
                    "Physical"
                ],
                "onEnemySkillTargetedDamagingOnly": true
            },
            "skills": [
                {
                    "id": "tenten-twin-rising-dragons",
                    "name": "Twin Rising Dragons",
                    "skillimage": "https://i.imgur.com/g4ksO57.png",
                    "skilldescription": "Tenten deals 20 damage to one enemy and 10 damage to all others. All enemies will take 5 additional damage from 'Twin Rising Dragons Trap' and will have their Physical and Chakra damage lowered by 5 additional points from it.",
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
                        },
                        {
                            "type": "damage",
                            "amount": 10,
                            "scope": "all-other-enemy"
                        },
                        {
                            "type": "apply_status",
                            "statusId": "tenten_twin_rising_dragons_mark",
                            "duration": 2,
                            "scope": "all-enemy",
                            "metadata": {
                                "harmful": true,
                                "turnDurationAnchor": "source_turn",
                                "bonusDamageFromSourceSkillsFlat": 5,
                                "mergeNumericAddKeys": [
                                    "bonusDamageFromSourceSkillsFlat"
                                ],
                                "bonusDamageFromSourceCharacterId": "tenten",
                                "bonusDamageAppliesToSkillIds": [
                                    "tenten-twin-rising-dragons-trap"
                                ],
                                "tooltipTextTemplate": "Twin Rising Dragons Trap deals {bonusDamageFromSourceSkillsFlat} additional damage and lowers Physical and Chakra damage by {bonusDamageFromSourceSkillsFlat} additional points."
                            }
                        },
                        {
                            "type": "apply_status",
                            "statusId": "tenten_twin_rising_dragons_mark",
                            "duration": 2,
                            "scope": "all-enemy",
                            "condition": {
                                "scope": "self",
                                "statusId": "tenten_full_release_active"
                            },
                            "metadata": {
                                "harmful": true,
                                "turnDurationAnchor": "source_turn",
                                "bonusDamageFromSourceSkillsFlat": 5,
                                "mergeNumericAddKeys": [
                                    "bonusDamageFromSourceSkillsFlat"
                                ],
                                "bonusDamageFromSourceCharacterId": "tenten",
                                "bonusDamageAppliesToSkillIds": [
                                    "tenten-twin-rising-dragons-trap"
                                ],
                                "tooltipTextTemplate": "Twin Rising Dragons Trap deals {bonusDamageFromSourceSkillsFlat} additional damage and lowers Physical and Chakra damage by {bonusDamageFromSourceSkillsFlat} additional points."
                            }
                        },
                        {
                            "type": "remove_status",
                            "statusId": "tenten_full_release_active",
                            "scope": "self",
                            "condition": {
                                "scope": "self",
                                "statusId": "tenten_full_release_active"
                            }
                        }
                    ]
                },
                {
                    "id": "tenten-twin-rising-dragons-trap",
                    "name": "Twin Rising Dragons Trap",
                    "skillimage": "https://i.imgur.com/LZze4F3.png",
                    "skilldescription": "Tenten deals 5 damage to all enemies. For 1 turn, their Physical and Chakra damage is lowered by 5. All stacks of 'Twin Rising Dragons' are removed afterwards.",
                    "energy": [
                        "Random"
                    ],
                    "target": "all-enemy",
                    "damage": 0,
                    "cooldown": 0,
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
                            "type": "apply_status",
                            "statusId": "tenten_twin_rising_dragons_trap_debuff",
                            "duration": 1,
                            "scope": "all-enemy",
                            "metadata": {
                                "harmful": true,
                                "turnDurationAnchor": "source_turn",
                                "damageDebuffBySkillClass": {
                                    "physical": 5,
                                    "chakra": 5
                                },
                                "damageDebuffBySkillClassFromTargetStatus": {
                                    "statusId": "tenten_twin_rising_dragons_mark",
                                    "metadataKey": "bonusDamageFromSourceSkillsFlat",
                                    "classes": [
                                        "physical",
                                        "chakra"
                                    ]
                                },
                                "tooltipText": "This character deals 5 less Physical and Chakra damage for 1 turn."
                            }
                        },
                        {
                            "type": "remove_status",
                            "statusId": "tenten_twin_rising_dragons_mark",
                            "scope": "all-enemy",
                            "condition": {
                                "scope": "target",
                                "statusId": "tenten_twin_rising_dragons_mark",
                                "statusFromActor": true
                            }
                        },
                        {
                            "type": "remove_status",
                            "statusId": "tenten_full_release_active",
                            "scope": "self",
                            "condition": {
                                "scope": "self",
                                "statusId": "tenten_full_release_active"
                            }
                        }
                    ]
                },
                {
                    "id": "tenten-twin-rising-dragons-full-release",
                    "name": "Twin Rising Dragons Full Release",
                    "skillimage": "https://i.imgur.com/4KGkFYx.png",
                    "skilldescription": "Tenten becomes invulnerable to non-Strategic skills for 1 turn and improves her harmful skills until the next time she uses one; this does not stack. Twin Rising Dragons applies its non-damage effect twice, and Twin Rising Dragons Trap's damage reduction lasts 1 additional turn.",
                    "energy": [
                        "Random"
                    ],
                    "target": "self",
                    "damage": 0,
                    "cooldown": 1,
                    "classes": [
                        "Strategic",
                        "Instant"
                    ],
                    "effects": [
                        {
                            "type": "apply_status",
                            "statusId": "tenten_full_release_invulnerability",
                            "duration": 1,
                            "scope": "self",
                            "metadata": {
                                "helpful": true,
                                "invulnerableToNonStrategicSkills": true,
                                "tooltipText": "This character is invulnerable to non-Strategic skills."
                            }
                        },
                        {
                            "type": "apply_status",
                            "statusId": "tenten_full_release_active",
                            "duration": 99,
                            "scope": "self",
                            "metadata": {
                                "helpful": true,
                                "skillDurationBonuses": {
                                    "tenten-twin-rising-dragons-trap": 1
                                },
                                "tooltipText": "Tenten's next harmful skill is improved. Twin Rising Dragons applies its mark twice, or Twin Rising Dragons Trap lowers Physical and Chakra damage for 1 additional turn."
                            }
                        }
                    ]
                },
                {
                    "id": "tenten-spiked-boulder-wall",
                    "name": "Spiked Boulder Wall",
                    "skillimage": "https://i.imgur.com/WcN7LHU.png",
                    "skilldescription": "Tenten becomes invulnerable for 1 turn.",
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
                                "tooltipText": "This character is invulnerable."
                            }
                        }
                    ]
                }
            ],
            "tags": [
                "konoha-genin"
            ]
        },
        "neji-hyuuga": {
                "id": "neji-hyuuga",
                "characterId": "neji-hyuuga",
                "name": "Hyuuga Neji",
                "facePicture": "https://i.imgur.com/j5onpzd.png",
                "characterdeescription": "A gifted genin of the Hyuuga clan's branch family, Neji possesses exceptional mastery of the Byakugan and Gentle Fist fighting style. Cold and calculating, he believes that one's destiny is determined at birth and that no amount of effort can change it.",
                "passive": {
                        "name": "Neji's Byakugan",
                        "icon": "https://i.imgur.com/ymCAsBc.png",
                        "description": "Neji's skills cannot be countered."
                },
                "skills": [
                        {
                                "id": "neji-hyuuga-neji-gentle-fist",
                                "name": "Neji Gentle Fist",
                                "skillimage": "https://i.imgur.com/svJIAbh.png",
                                "skilldescription": "Neji deals 20 physical damage to one enemy for 2 turns. During this time, Eight Trigram Sixty-Four Palm will cost 1 Taijutsu, 1 Random chakra.",
                                "energy": [
                                        "Taijutsu",
                                        "Random"
                                ],
                                "target": "single-enemy",
                                "damage": 0,
                                "cooldown": 1,
                                "cannotBeCountered": true,
                                "classes": [
                                        "Physical",
                                        "Action"
                                ],
                                "effects": [
                                        {
                                                "type": "apply_status",
                                                "statusId": "neji_hyuuga_neji_gentle_fist",
                                                "duration": 2,
                                                "scope": "target",
                                                "metadata": {
                                                        "harmful": true,
                                                        "turnEndDamage": 20,
                                                        "turnEndTrigger": "source_turn",
                                                        "turnDurationAnchor": "source_turn",
                                                        "ongoingClass": "action",
                                                        "triggerOnApply": true,
                                                        "tooltipText": "This character takes 20 physical damage from Neji Gentle Fist each turn."
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "neji_hyuuga_gentle_fist_palm_cost",
                                                "duration": 2,
                                                "scope": "self",
                                                "metadata": {
                                                        "helpful": true,
                                                        "turnDurationAnchor": "source_turn",
                                                        "ongoingClass": "action",
                                                        "triggerOnApply": true,
                                                        "skillCostOverridesBySkillId": {
                                                                "neji-hyuuga-eight-trigrams-sixty-four-palms": {
                                                                        "energy": [
                                                                                "Taijutsu",
                                                                                "Random"
                                                                        ]
                                                                }
                                                        },
                                                        "tooltipText": "Eight Trigram Sixty-Four Palm costs 1 Taijutsu and 1 Random chakra."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "neji-hyuuga-eight-trigrams-revolving-heaven",
                                "name": "Eight Trigram Heavenly Spin",
                                "skillimage": "https://i.imgur.com/hB5n56N.png",
                                "skilldescription": "Neji deals 15 physical damage to all enemies and becomes invulnerable for 1 turn. During this time, Eight Trigram Sixty-Four Palm will cost 1 Bloodline, 1 Random chakra.",
                                "energy": [
                                        "Bloodline"
                                ],
                                "target": "all-enemy",
                                "damage": 0,
                                "cooldown": 2,
                                "cannotBeCountered": true,
                                "classes": [
                                        "Physical",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "damage",
                                                "amount": 15,
                                                "scope": "all-enemy"
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "neji_hyuuga_heavenly_spin",
                                                "duration": 1,
                                                "scope": "self",
                                                "metadata": {
                                                        "helpful": true,
                                                        "invulnerable": true,
                                                        "skillCostOverridesBySkillId": {
                                                                "neji-hyuuga-eight-trigrams-sixty-four-palms": {
                                                                        "energy": [
                                                                                "Bloodline",
                                                                                "Random"
                                                                        ]
                                                                }
                                                        },
                                                        "tooltipText": "Neji is invulnerable. Eight Trigram Sixty-Four Palm costs 1 Bloodline and 1 Random chakra."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "neji-hyuuga-eight-trigrams-sixty-four-palms",
                                "name": "Eight Trigram Sixty-Four Palm",
                                "skillimage": "https://i.imgur.com/KgBRINj.png",
                                "skilldescription": "Neji deals 35 physical damage to one enemy and removes 1 random chakra.",
                                "energy": [
                                        "Taijutsu",
                                        "Bloodline"
                                ],
                                "target": "single-enemy",
                                "damage": 0,
                                "cooldown": 1,
                                "cannotBeCountered": true,
                                "classes": [
                                        "Physical",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "damage",
                                                "amount": 35,
                                                "scope": "target"
                                        },
                                        {
                                                "type": "remove_random_chakra",
                                                "amount": 1,
                                                "scope": "target"
                                        }
                                ]
                        },
                        {
                                "id": "neji-hyuuga-byakugan-insight",
                                "name": "Byakugan Insight",
                                "skillimage": "https://i.imgur.com/Yw9xYPS.png",
                                "skilldescription": "Neji becomes invulnerable for 1 turn.",
                                "energy": [
                                        "Random"
                                ],
                                "target": "self",
                                "damage": 0,
                                "cooldown": 4,
                                "cannotBeCountered": true,
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
        "gaara-of-the-desert": {
            "id": "gaara-of-the-desert",
            "characterId": "gaara-of-the-desert",
            "name": "Gaara of the Desert",
            "facePicture": "https://i.imgur.com/IiEAyw6.png",
            "characterdeescription": "A ruthless genin from the Hidden Sand Village, Gaara commands a seemingly endless supply of sand that protects him from harm and crushes his enemies. Feared for his merciless nature and mysterious abilities, he seeks to prove his existence through the lives of those who challenge him.",
            "passive": {
                "name": "Sand Flow",
                "icon": "https://i.imgur.com/qOFhrZc.png",
                "description": "Gaara has 5 unpierceable damage reduction. He gains 1 Sand Flow stack when damaged and 2 after a turn without taking damage.",
                "unpierceableDamageReductionFlat": 5,
                "onDamageStackMetadataKey": "sandFlowStacks",
                "onDamageStackAmount": 1,
                "onUndamagedTurnStackMetadataKey": "sandFlowStacks",
                "onUndamagedTurnStackAmount": 2,
                "sandFlowStacks": 0,
                "stackTooltipTextTemplate": "Gaara has 5 unpierceable damage reduction and {sandFlowStacks} Sand Flow stacks."
            },
            "skills": [
                {
                    "id": "gaara-of-the-desert-sand-binding-coffin",
                    "name": "Sand Binding Coffin",
                    "skillimage": "https://i.imgur.com/3aST3cX.png",
                    "skilldescription": "Gaara stuns one enemy for 1 turn and gains 2 Sand Flow stacks.",
                    "energy": [
                        "Ninjutsu"
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
                            "type": "apply_status",
                            "statusId": "gaara_sand_binding_coffin_stun",
                            "duration": 1,
                            "scope": "target",
                            "metadata": {
                                "harmful": true,
                                "cannotUseSkills": true,
                                "tooltipText": "This character is stunned."
                            }
                        },
                        {
                            "type": "apply_status",
                            "statusId": "gaara_of_the_desert_sand_flow",
                            "duration": 99,
                            "scope": "self",
                            "metadata": {
                                "stackMetadataKey": "sandFlowStacks",
                                "stackDelta": 2,
                                "stackMax": 9999,
                                "tooltipTextTemplate": "Gaara has 5 unpierceable damage reduction and {sandFlowStacks} Sand Flow stacks."
                            }
                        }
                    ]
                },
                {
                    "id": "gaara-of-the-desert-desert-funeral",
                    "name": "Desert Funeral",
                    "skillimage": "https://i.imgur.com/9do9XxC.png",
                    "skilldescription": "Gaara deals 20 piercing physical damage to one enemy, plus 5 for each Sand Flow stack. All stacks are consumed. If the enemy falls to 10 health or less, they are executed.",
                    "energy": [
                        "Bloodline",
                        "Bloodline"
                    ],
                    "target": "single-enemy",
                    "damage": 20,
                    "cooldown": 1,
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
                                "ignoreDamageReduction": true,
                                "executeBelowHpThreshold": 10,
                                "bonusPerStatusMetadata": {
                                    "scope": "self",
                                    "statusId": "gaara_of_the_desert_sand_flow",
                                    "metadataKey": "sandFlowStacks",
                                    "multiplier": 5,
                                    "consumeStacks": true
                                }
                            }
                        }
                    ]
                },
                {
                    "id": "gaara-of-the-desert-sand-sphere",
                    "name": "Sand Sphere",
                    "skillimage": "https://i.imgur.com/eUfA1nN.png",
                    "skilldescription": "Gaara gains 25 destructible defense for 3 turns, plus 5 for each Sand Flow stack. Enemies who use a skill on Gaara take 15 physical damage. This effect ends when Gaara uses another skill.",
                    "energy": [
                        "Ninjutsu",
                        "Random"
                    ],
                    "target": "self",
                    "damage": 0,
                    "cooldown": 5,
                    "classes": [
                        "Strategic",
                        "Physical*",
                        "Instant"
                    ],
                    "effects": [
                        {
                            "type": "apply_status",
                            "statusId": "gaara_sand_sphere",
                            "duration": 3,
                            "scope": "self",
                            "metadata": {
                                "helpful": true,
                                "destructibleDefensePoints": 25,
                                "scaleFromSourceStatusMetadata": {
                                    "statusId": "gaara_of_the_desert_sand_flow",
                                    "metadataKey": "sandFlowStacks",
                                    "multiplier": 5,
                                    "targetKeys": [
                                        "destructibleDefensePoints"
                                    ],
                                    "addToTargetKeys": true
                                },
                                "onEnemySkillTargetedDamageToSourceAmount": 15,
                                "onEnemySkillTargetedDamageToSourceSkillClasses": [
                                    "Physical"
                                ],
                                "onOwnerUseSkillTrigger": true,
                                "onOwnerUseSkillIdsAny": [
                                    "gaara-of-the-desert-sand-binding-coffin",
                                    "gaara-of-the-desert-desert-funeral",
                                    "gaara-of-the-desert-sand-shield"
                                ],
                                "tooltipTextTemplate": "This character has {destructibleDefensePoints} destructible defense. Enemies who use a skill on them take 15 physical damage. This effect ends when this character uses another skill."
                            }
                        }
                    ]
                },
                {
                    "id": "gaara-of-the-desert-sand-shield",
                    "name": "Sand Shield",
                    "skillimage": "https://i.imgur.com/2oNtSkX.png",
                    "skilldescription": "Gaara becomes invulnerable for 1 turn.",
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
                            "statusId": "gaara_sand_shield",
                            "duration": 1,
                            "scope": "self",
                            "metadata": {
                                "helpful": true,
                                "invulnerable": true,
                                "tooltipText": "This character is invulnerable."
                            }
                        }
                    ]
                }
            ]
        },
        "kankuro": {
            "id": "kankuro",
            "characterId": "kankuro",
            "name": "Kankuro",
            "facePicture": "https://i.imgur.com/5uxGoSN.png",
            "characterdeescription": "A cunning genin of the Hidden Sand Village and older brother of Gaara, Kankuro specializes in controlling deadly puppets equipped with concealed weapons and traps. His deceptive fighting style allows him to outmaneuver opponents while keeping himself safely out of reach.",
            "passive": {
                "name": "Puppet Preparation",
                "icon": "https://i.imgur.com/Kya84CC.png",
                "description": "Kankuro begins the battle with 15 destructible defense. Whenever an enemy's skill is countered, this defense is renewed.",
                "onEnemySkillCounteredDefense": {
                    "statusId": "kankuro_puppet_preparation_defense",
                    "points": 15
                }
            },
            "startStatuses": [
                {
                    "statusId": "kankuro_puppet_preparation_defense",
                    "duration": 99,
                    "metadata": {
                        "helpful": true,
                        "permanent": true,
                        "destructibleDefensePoints": 15,
                        "tooltipTextTemplate": "Kankuro has {destructibleDefensePoints} destructible defense from Puppet Preparation."
                    }
                }
            ],
            "skills": [
                {
                    "id": "kankuro-black-secret-machine-one-shot",
                    "name": "Black Secret Machine One Shot",
                    "skillimage": "https://i.imgur.com/dHWzRYI.png",
                    "skilldescription": "Kankuro unleashes his puppet's hidden weaponry, dealing 30 physical damage to an enemy. If the target is affected by Puppet Trap, this skill deals 15 additional damage.",
                    "energy": [
                        "Random",
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
                        }
                    ]
                },
                {
                    "id": "kankuro-poison-bomb",
                    "name": "Poison Bomb",
                    "skillimage": "https://i.imgur.com/vJFqLIY.png",
                    "skilldescription": "Kankuro releases a cloud of poison, dealing 10 affliction damage to all enemies. Affected enemies ignore healing effects for 1 turn.",
                    "energy": [
                        "Random"
                    ],
                    "target": "all-enemy",
                    "damage": 0,
                    "cooldown": 2,
                    "classes": [
                        "Affliction",
                        "Instant"
                    ],
                    "effects": [
                        {
                            "type": "damage",
                            "amount": 10,
                            "scope": "all-enemy",
                            "metadata": {
                                "afflictionDamage": true,
                                "ignoreDamageReduction": true,
                                "ignoreDestructibleDefense": true
                            }
                        },
                        {
                            "type": "apply_status",
                            "statusId": "kankuro_poison_bomb_no_heal",
                            "duration": 1,
                            "scope": "all-enemy",
                            "metadata": {
                                "harmful": true,
                                "turnDurationAnchor": "source_turn",
                                "healReceivedMultiplier": 0,
                                "tooltipText": "This character ignores healing effects."
                            }
                        }
                    ]
                },
                {
                    "id": "kankuro-puppet-trap",
                    "name": "Puppet Trap",
                    "skillimage": "/assets/characters/kankuro-puppet-trap.jpg",
                    "skilldescription": "Kankuro sets an invisible trap on an enemy for 1 turn. If they use a strategic skill during this time, that skill is countered and their physical and strategic skills are stunned for 1 turn.",
                    "energy": [
                        "Random"
                    ],
                    "target": "single-enemy",
                    "damage": 0,
                    "cooldown": 2,
                    "classes": [
                        "Strategic",
                        "Instant"
                    ],
                    "effects": [
                        {
                            "type": "apply_status",
                            "statusId": "kankuro_puppet_trap",
                            "duration": 1,
                            "scope": "target",
                            "metadata": {
                                "harmful": true,
                                "invisible": true,
                                "turnDurationAnchor": "source_turn",
                                "bonusDamageFromSourceSkillsFlat": 15,
                                "bonusDamageFromSourceCharacterId": "kankuro",
                                "bonusDamageAppliesToSkillIds": [
                                    "kankuro-black-secret-machine-one-shot"
                                ],
                                "triggerOnlyOnOwnerSkillUse": true,
                                "triggerOnOwnerHelpfulSkill": true,
                                "triggerOnEnemyHarmfulSkillClassesAny": [
                                    "strategic"
                                ],
                                "counterCancelsSkill": true,
                                "counterStatusId": "kankuro_puppet_trap_stun",
                                "counterStatusDuration": 1,
                                "counterStatusMetadata": {
                                    "harmful": true,
                                    "cannotUseSkillClasses": [
                                        "physical",
                                        "strategic"
                                    ],
                                    "tooltipText": "Physical and Strategic skills are stunned for 1 turn."
                                },
                                "tooltipText": "The next Strategic skill this character uses is countered and stuns their Physical and Strategic skills. While trapped, Black Secret Machine One Shot deals 15 extra damage. A counter renews Kankuro's 15 defense."
                            }
                        }
                    ]
                },
                {
                    "id": "kankuro-puppet-replacement-technique",
                    "name": "Puppet Replacement Technique",
                    "skillimage": "https://i.imgur.com/mpGOYy6.png",
                    "skilldescription": "Kankuro uses a puppet to evade incoming attacks, becoming invulnerable for 1 turn.",
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
                            "statusId": "kankuro_puppet_replacement_invulnerable",
                            "duration": 1,
                            "scope": "self",
                            "metadata": {
                                "helpful": true,
                                "invulnerable": true,
                                "tooltipText": "Kankuro is invulnerable."
                            }
                        }
                    ]
                }
            ]
        },
        "temari": {
            "id": "temari",
            "characterId": "temari",
            "name": "Temari",
            "facePicture": "https://i.imgur.com/z5lW2jl.png",
            "characterdeescription": "A confident and sharp-tongued genin of the Hidden Sand Village, Temari wields an enormous iron fan to unleash powerful wind techniques against her opponents. As the eldest of the three Sand siblings, she combines her tactical instincts with overwhelming force to control the battlefield.",
            "passive": {
                "name": "Phantom Gale",
                "icon": "https://i.imgur.com/74m04BG.png",
                "description": "Temari's winds strike unpredictably. Whenever she uses a skill, a random enemy takes 5 physical damage.",
                "onSkillUseRandomEnemyDamage": {
                    "amount": 5,
                    "extraTriggersStatusId": "temari_phantom_gale_growth"
                }
            },
            "skills": [
                {
                    "id": "temari-cutting-whirlwind",
                    "name": "Cutting Whirlwind",
                    "skillimage": "https://i.imgur.com/TceZL1M.png",
                    "skilldescription": "Temari unleashes a razor-sharp gust of wind, dealing 15 piercing damage to an enemy and 5 piercing damage to all other enemies. Temari also becomes invulnerable to non-Strategic skills for 1 turn.",
                    "energy": [
                        "Ninjutsu"
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
                            "amount": 15,
                            "scope": "target",
                            "metadata": {
                                "ignoreDamageReduction": true
                            }
                        },
                        {
                            "type": "damage",
                            "amount": 5,
                            "scope": "all-other-enemy",
                            "metadata": {
                                "ignoreDamageReduction": true
                            }
                        },
                        {
                            "type": "apply_status",
                            "statusId": "temari_cutting_whirlwind_active",
                            "duration": 1,
                            "scope": "self",
                            "metadata": {
                                "helpful": true,
                                "invulnerableToNonStrategicSkills": true,
                                "skillCostOverridesBySkillId": {
                                    "temari-summoning-quick-beheading-dance": {
                                        "energy": [
                                            "Ninjutsu",
                                            "Random"
                                        ]
                                    }
                                },
                                "tooltipText": "Temari is invulnerable to non-Strategic skills. Summoning: Quick Beheading Dance costs 1 less Random chakra on her next turn."
                            }
                        }
                    ]
                },
                {
                    "id": "temari-summoning-quick-beheading-dance",
                    "name": "Summoning: Quick Beheading Dance",
                    "skillimage": "https://i.imgur.com/cvblibj.png",
                    "skilldescription": "Temari summons Kamatari, the wind weasel, dealing 30 damage to all enemies. If used the turn after Cutting Whirlwind, this skill costs 1 less random chakra. Each use permanently increases the number of times Phantom Gale triggers by 1.",
                    "energy": [
                        "Ninjutsu",
                        "Random",
                        "Random"
                    ],
                    "target": "all-enemy",
                    "damage": 0,
                    "cooldown": 2,
                    "classes": [
                        "Physical",
                        "Instant"
                    ],
                    "effects": [
                        {
                            "type": "damage",
                            "amount": 30,
                            "scope": "all-enemy"
                        },
                        {
                            "type": "apply_status",
                            "statusId": "temari_phantom_gale_growth",
                            "duration": 99,
                            "scope": "self",
                            "metadata": {
                                "helpful": true,
                                "permanent": true,
                                "stackMetadataKey": "extraTriggers",
                                "stackDelta": 1,
                                "stackMax": 9999,
                                "tooltipTextTemplate": "Phantom Gale triggers {extraTriggers} additional times whenever Temari uses a skill."
                            }
                        }
                    ]
                },
                {
                    "id": "temari-dust-wind",
                    "name": "Dust Wind",
                    "skillimage": "https://i.imgur.com/O7YnMRH.png",
                    "skilldescription": "Temari kicks up a cloud of dust, making herself and all allies invulnerable for 1 turn. If enemies can be targeted, their non-affliction damage is also reduced by 20 for 1 turn. If used the turn after Cutting Whirlwind, this reduction lasts 2 turns instead.",
                    "energy": [
                        "Ninjutsu",
                        "Ninjutsu"
                    ],
                    "target": "all-enemy",
                    "damage": 0,
                    "cooldown": 4,
                    "classes": [
                        "Strategic",
                        "Instant"
                    ],
                    "effects": [
                        {
                            "type": "apply_status",
                            "statusId": "temari_dust_wind_invulnerable",
                            "duration": 1,
                            "scope": "all-allies",
                            "metadata": {
                                "helpful": true,
                                "invulnerable": true,
                                "tooltipText": "This character is invulnerable for 1 turn."
                            }
                        },
                        {
                            "type": "apply_status",
                            "statusId": "temari_dust_wind_debuff",
                            "duration": 1,
                            "scope": "all-enemy",
                            "condition": {
                                "scope": "self",
                                "missingStatusId": "temari_cutting_whirlwind_active"
                            },
                            "metadata": {
                                "harmful": true,
                                "NonAfflictionDamageDebuff": 20,
                                "turnDurationAnchor": "source_turn",
                                "tooltipText": "This character deals 20 less non-affliction damage for 1 turn."
                            }
                        },
                        {
                            "type": "apply_status",
                            "statusId": "temari_dust_wind_debuff",
                            "duration": 2,
                            "scope": "all-enemy",
                            "condition": {
                                "scope": "self",
                                "statusId": "temari_cutting_whirlwind_active"
                            },
                            "metadata": {
                                "harmful": true,
                                "NonAfflictionDamageDebuff": 20,
                                "turnDurationAnchor": "source_turn",
                                "tooltipText": "This character deals 20 less non-affliction damage for 2 turns."
                            }
                        }
                    ]
                },
                {
                    "id": "temari-backflip",
                    "name": "Backflip",
                    "skillimage": "https://i.imgur.com/lnhXY2D.png",
                    "skilldescription": "Temari evades incoming attacks, becoming invulnerable for 1 turn.",
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
                            "statusId": "temari_backflip_invulnerable",
                            "duration": 1,
                            "scope": "self",
                            "metadata": {
                                "helpful": true,
                                "invulnerable": true,
                                "tooltipText": "Temari is invulnerable for 1 turn."
                            }
                        }
                    ]
                }
            ]
        }
};
});
