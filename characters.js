const characters = [
    {
        "id": "uzumaki-naruto",
        "characterId": "uzumaki-naruto",
        "name": "Uzumaki Naruto",
        "facePicture": "https://i.imgur.com/jp3OIOA.png",
        "characterdeescription": "A Genin from Team 7, Naruto is an orphan with the goal to one day become Hokage. Using his signature move, Shadow Clones, Naruto is able to perform powerful moves such as the Uzumaki Naruto Combo and the Rasengan.",
        "skills": [
            {
                "id": "uzumaki-naruto-combo",
                "name": "Uzumaki Naruto Combo",
                "skillimage": "https://i.imgur.com/wZVMrBY.png",
                "skilldescription": "Uzumaki Naruto deals 25 damage to one enemy.",
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
                        "amount": 25,
                        "scope": "target"
                    }
                ]
            },
            {
                "id": "uzumaki-naruto-overwhelming-chakra-wave",
                "name": "Overwhelming Chakra Wave",
                "skillimage": "https://i.imgur.com/N1LUxVU.png",
                "skilldescription": "Uzumaki Naruto will gain 1 random chakra after 1 turn. Permanently, 'Uzumaki Naruto Combo' and 'Rasengan' deal 5 additional damage.",
                "energy": [],
                "target": "self",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "uzumaki_naruto_overwhelming_chakra_wave_focus",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "skillDamageBonuses": {
                                "uzumaki-naruto-combo": 5,
                                "uzumaki-naruto-rasengan": 5
                            },
                            "tooltipText": "Uzumaki Naruto Combo and Rasengan deal 5 additional damage."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "uzumaki_naruto_overwhelming_chakra_wave_pending",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "turnDurationAnchor": "any_turn",
                            "tooltipText": "Naruto will gain 1 random chakra after 1 turn.",
                            "onExpireEffects": [
                                {
                                    "type": "gain_chakra",
                                    "chakraType": "random",
                                    "amount": 1
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "uzumaki-naruto-shadow-clones",
                "name": "Shadow Clones",
                "skillimage": "https://i.imgur.com/eQSV2d1.png",
                "skilldescription": "Uzumaki Naruto gains 10 points of damage reduction permanently and this skill is replaced by 'Rasengan'.",
                "energy": [],
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
                        "statusId": "uzumaki_naruto_shadow_clones_active",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "damageReductionFlat": 10,
                            "skillReplacements": {
                                "uzumaki-naruto-shadow-clones": "uzumaki-naruto-rasengan"
                            },
                            "tooltipText": "Naruto has 10 damage reduction\nShadow Clones is replaced by Rasengan."
                        }
                    }
                ]
            },
            {
                "id": "uzumaki-naruto-sexy-technique",
                "name": "Sexy Technique",
                "skillimage": "https://i.imgur.com/BgiSFsF.png",
                "skilldescription": "This skill makes Uzumaki Naruto invulnerable for 1 turn.",
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
            },
            {
                "id": "uzumaki-naruto-rasengan",
                "name": "Rasengan",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/lro3e07.png",
                "skilldescription": "Uzumaki Naruto deals 35 damage to one enemy and stuns their non-strategic skills for 1 turn.",
                "energy": [
                    "Ninjutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Ninjutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 35,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "uzumaki_naruto_rasengan_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkillClasses": [
                                "physical",
                                "energy",
                                "mental",
                                "ninjutsu"
                            ],
                            "tooltipText": "This character's non-strategic skills are stunned.",
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "haruno-sakura",
        "characterId": "haruno-sakura",
        "name": "Haruno Sakura",
        "facePicture": "https://i.imgur.com/q2K5CEj.png",
        "characterdeescription": "A Genin from Team 7, Sakura is very intelligent, but self-conscious about herself. Having just recently received training from Tsunade, Sakura is now able to deliver powerful punches and heal her own allies.",
        "skills": [
            {
                "id": "haruno-sakura-ko-punch",
                "name": "KO Punch",
                "skillimage": "https://i.imgur.com/CoiXCFk.png",
                "skilldescription": "Haruno Sakura deals 20 damage to one enemy and stuns their physical and strategic skills for 1 turn.",
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
                        "type": "apply_status",
                        "statusId": "haruno_sakura_ko_punch_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkillClasses": [
                                "physical",
                                "strategic"
                            ],
                            "tooltipText": "This character's physical and strategic skills are stunned.",
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            },
            {
                "id": "haruno-sakura-cure",
                "name": "Cure",
                "skillimage": "https://i.imgur.com/SHNkcVv.png",
                "skilldescription": "Haruno Sakura heals herself or an ally for 25 health.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "self-or-single-ally",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "heal",
                        "amount": 25,
                        "scope": "target"
                    }
                ]
            },
            {
                "id": "haruno-sakura-inner-sakura",
                "name": "Inner Sakura",
                "skillimage": "https://i.imgur.com/srHzKvO.png",
                "skilldescription": "Haruno Sakura gains 5 points of damage reduction permanently and ignores stun effects for 1 turn. This skill is replaced by 'Inner Sakura Strangle'.",
                "energy": [],
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
                        "statusId": "haruno_sakura_inner_sakura_active",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "damageReductionFlat": 5,
                            "skillReplacements": {
                                "haruno-sakura-inner-sakura": "haruno-sakura-inner-sakura-strangle"
                            },
                            "tooltipText": "Sakura has 5 damage reduction\nInner Sakura is replaced by Inner Sakura Strangle."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "haruno_sakura_inner_sakura_stun_immunity",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "cannotBeStunned": true,
                            "tooltipText": "Haruno Sakura ignores stun effects for 1 turn.",
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            },
            {
                "id": "haruno-sakura-sakura-hide",
                "name": "Sakura Hide",
                "skillimage": "https://i.imgur.com/IYpA8yI.png",
                "skilldescription": "This skill makes Haruno Sakura invulnerable for 1 turn.",
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
            },
            {
                "id": "haruno-sakura-inner-sakura-strangle",
                "name": "Inner Sakura Strangle",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/srHzKvO.png",
                "skilldescription": "Haruno Sakura ignores stun effects for 1 turn and targets one enemy or one ally. An ally receives 5 damage and deals an additional 5 damage permanently. An enemy receives 20 damage and deals 10 less damage with their next damaging skill.",
                "energy": [
                    "Genjutsu"
                ],
                "target": "single-character",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Mental",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "haruno_sakura_inner_sakura_stun_immunity",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "cannotBeStunned": true,
                            "tooltipText": "Haruno Sakura ignores stun effects for 1 turn.",
                            "turnDurationAnchor": "source_turn"
                        }
                    },
                    {
                        "type": "HealthLoss",
                        "amount": 5,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "targetRelation": "ally"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "haruno_sakura_inner_sakura_strangle_ally_power",
                        "duration": 99,
                        "scope": "target",
                        "metadata": {
                            "damageBonusFlat": 5,
                            "tooltipText": "This character deals 5 additional damage."
                        },
                        "condition": {
                            "scope": "target",
                            "targetRelation": "ally"
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 20,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "targetRelation": "enemy"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "haruno_sakura_inner_sakura_strangle_enemy_weakness",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "damageDebuffFlat": 10,
                            "tooltipText": "This character's next damaging skill deals 10 less damage.",
                            "turnDurationAnchor": "source_turn"
                        },
                        "condition": {
                            "scope": "target",
                            "targetRelation": "enemy"
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "uchiha-sasuke",
        "characterId": "uchiha-sasuke",
        "name": "Uchiha Sasuke",
        "facePicture": "https://i.imgur.com/bwuEwsM.png",
        "characterdeescription": "A Genin from Team 7, Sasuke is the lone survivor of the Uchiha clan and has sworn vengeance against his brother. Using his sharingan, Sasuke is able to anticipate incoming attacks and is capable of advanced offensive moves.",
        "skills": [
            {
                "id": "uchiha-sasuke-lion-combo",
                "name": "Lion Combo",
                "skillimage": "https://i.imgur.com/z0L2daw.png",
                "skilldescription": "Uchiha Sasuke deals 25 damage to one enemy.",
                "energy": [
                    "Bloodline"
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
                        "amount": 25,
                        "scope": "target"
                    }
                ]
            },
            {
                "id": "uchiha-sasuke-chidori",
                "name": "Chidori",
                "skillimage": "https://i.imgur.com/rJ3WZmI.png",
                "skilldescription": "Uchiha Sasuke deals 35 piercing damage to one enemy. For 1 turn, 'Lion Combo' and 'Grand Fireball Technique' will cost 1 random chakra.",
                "energy": [
                    "Ninjutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Ninjutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 35,
                        "scope": "target",
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "uchiha_sasuke_chidori_cost_shift",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "skillCostOverridesBySkillId": {
                                "uchiha-sasuke-lion-combo": {
                                    "energy": [
                                        "Random"
                                    ]
                                },
                                "uchiha-sasuke-grand-fireball-technique": {
                                    "energy": [
                                        "Random"
                                    ]
                                }
                            },
                            "tooltipText": "Lion Combo and Grand Fireball Technique cost 1 random chakra."
                        }
                    }
                ]
            },
            {
                "id": "uchiha-sasuke-sharingan",
                "name": "Sharingan",
                "skillimage": "https://i.imgur.com/IkTLWta.png",
                "skilldescription": "Uchiha Sasuke gains 10 damage reduction permanently. Whenever an enemy uses a skill on Sasuke, they will take 5 additional damage from Sasuke's skills permanently. This skill is replaced by 'Grand Fireball Technique'.",
                "energy": [],
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
                        "statusId": "uchiha_sasuke_sharingan_focus",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "damageReductionFlat": 10,
                            "samePreviousTargetDamageBonusFlat": 5,
                            "samePreviousTargetMarkerStatusId": "uchiha_sasuke_sharingan_previous_target",
                            "samePreviousTargetMarkerTooltipText": "Sasuke will deal 5 additional damage to this character if he targets them again.",
                            "skillReplacements": {
                                "uchiha-sasuke-sharingan": "uchiha-sasuke-grand-fireball-technique"
                            },
                            "tooltipText": "Sasuke has 10 damage reduction\nIf he targets the same enemy again, his skills deal 5 additional damage\nSharingan is replaced by Grand Fireball Jutsu."
                        }
                    }
                ]
            },
            {
                "id": "uchiha-sasuke-swift-block",
                "name": "Swift Block",
                "skillimage": "https://i.imgur.com/dit1Ltq.png",
                "skilldescription": "This skill makes Uchiha Sasuke invulnerable for 1 turn.",
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
            },
            {
                "id": "uchiha-sasuke-grand-fireball-technique",
                "name": "Grand Fireball Technique",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/IkTLWta.png",
                "skilldescription": "Uchiha Sasuke deals 5 affliction damage to all enemies this turn and 5 affliction damage to them the following turn.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Affliction",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "uchiha_sasuke_grand_fireball_burn",
                        "duration": 2,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 5,
                            "turnEndTrigger": "source_turn",
                            "turnDurationAnchor": "source_turn",
                            "triggerOnApply": true,
                            "afflictionDamage": true,
                            "ignoreDamageReduction": true,
                            "ignoreDestructibleDefense": true,
                            "tooltipText": "This character takes 5 affliction damage from Grand Fireball Technique."
                        }
                    }
                ]
            }
        ]
    },
    {
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
    {
        "id": "aburame-shino",
        "characterId": "aburame-shino",
        "name": "Aburame Shino",
        "facePicture": "https://i.imgur.com/RPIy4uO.png",
        "characterdeescription": "A Genin from Team 8, Shino is the successor of the Aburame clan, and a very reserved and tactical fighter. Using the bugs that live inside his body, Shino is able to leech the chakra off his enemies, or protect his entire team.",
        "skills": [
            {
                "id": "aburame-shino-chakra-leach",
                "name": "Chakra Leach",
                "skillimage": "https://i.imgur.com/F9DLM31.png",
                "skilldescription": "Aburame Shino deals 10 affliction damage to one enemy and steals 1 random chakra from them. This skill deals 5 additional damage with each use.",
                "energy": [
                    "Bloodline"
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
                        "type": "damage",
                        "amount": 10,
                        "scope": "target",
                        "metadata": {
                            "afflictionDamage": true,
                            "ignoreDamageReduction": true,
                            "ignoreDestructibleDefense": true
                        }
                    },
                    {
                        "type": "drain_chakra_random_from_target_to_self",
                        "amount": 1,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "aburame_shino_chakra_leach_growth",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "skillDamageBonuses": {
                                "aburame-shino-chakra-leach": 5
                            },
                            "tooltipText": "Chakra Leach deals 5 additional damage."
                        }
                    }
                ]
            },
            {
                "id": "aburame-shino-female-bug",
                "name": "Female Bug",
                "skillimage": "https://i.imgur.com/QMWOMRt.png",
                "skilldescription": "Aburame Shino targets one enemy. For 3 turns, their non-affliction damage will be reduced by 5. During this time, 'Chakra Leach' will deal 5 additional damage to them. This skill cannot be used on an enemy already affected by it.",
                "energy": [],
                "target": "single-enemy",
                "targetCondition": {
                    "missingStatusId": "aburame_shino_female_bug"
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
                        "statusId": "aburame_shino_female_bug",
                        "duration": 3,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "NonAfflictionDamageDebuff": 5,
                            "bonusDamageFromSourceSkillsFlat": 5,
                            "bonusDamageFromSourceCharacterId": "aburame-shino",
                            "bonusDamageAppliesToSkillIds": [
                                "aburame-shino-chakra-leach"
                            ],
                            "tooltipText": "This character deals 5 less non-affliction damage and takes 5 additional damage from Chakra Leach."
                        }
                    }
                ]
            },
            {
                "id": "aburame-shino-bug-wall",
                "name": "Bug Wall",
                "skillimage": "https://i.imgur.com/1Hqxi0m.png",
                "skilldescription": "Aburame Shino grants his team 20 points of permanent destructible defense. This skill stacks.",
                "energy": [
                    "Bloodline",
                    "Random"
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
                        "statusId": "aburame_shino_bug_wall",
                        "duration": 99,
                        "scope": "all-allies",
                        "metadata": {
                            "helpful": true,
                            "destructibleDefensePoints": 20,
                            "mergeNumericAddKeys": [
                                "destructibleDefensePoints"
                            ],
                            "tooltipTextTemplate": "This character has {destructibleDefensePoints} points of permanent destructible defense from Bug Wall."
                        }
                    }
                ]
            },
            {
                "id": "aburame-shino-shino-hide",
                "name": "Shino Hide",
                "skillimage": "https://i.imgur.com/BpembYr.png",
                "skilldescription": "This skill makes Aburame Shino invulnerable for 1 turn.",
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
    {
        "id": "hyuuga-hinata",
        "characterId": "hyuuga-hinata",
        "name": "Hyuuga Hinata",
        "facePicture": "https://i.imgur.com/NWuk5fw.png",
        "characterdeescription": "A Genin from Team 8, Hinata is the next in line in the Hyuuga clan, but she is shy and very withdrawn. Using the trademark Byakugan of the Hyuuga, Hinata is able to delicately target an enemy's Chakra Points while defending the team.",
        "skills": [
            {
                "id": "hyuuga-hinata-hinata-gentle-fist",
                "name": "Hinata Gentle Fist",
                "skillimage": "https://i.imgur.com/guOfm9P.png",
                "skilldescription": "Hyuuga Hinata deals 20 damage to one enemy. For 1 turn, they will have their chakra costs increased by 1 random. During 'Byakugan', the cost increase lasts 1 additional turn and the target takes 20 damage each turn for 2 turns.",
                "energy": [
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
                        "type": "damage",
                        "amount": 20,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "hyuuga_hinata_gentle_fist_cost",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "randomCostIncrease": 1,
                            "tooltipText": "This character's skills cost 1 additional random chakra.",
                            "turnDurationAnchor": "source_turn"
                        },
                        "condition": {
                            "scope": "self",
                            "missingStatusId": "hyuuga_hinata_byakugan"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "hyuuga_hinata_gentle_fist_cost",
                        "duration": 2,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "randomCostIncrease": 1,
                            "tooltipText": "This character's skills cost 1 additional random chakra."
                        },
                        "condition": {
                            "scope": "self",
                            "statusId": "hyuuga_hinata_byakugan"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "hyuuga_hinata_gentle_fist_damage",
                        "duration": 2,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 20,
                            "turnEndTrigger": "source_turn",
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character takes 20 damage each turn from Hinata Gentle Fist."
                        },
                        "condition": {
                            "scope": "self",
                            "statusId": "hyuuga_hinata_byakugan"
                        }
                    }
                ]
            },
            {
                "id": "hyuuga-hinata-protective-eight-trigrams-sixty-four-palms",
                "name": "Protective Eight Trigrams Sixty-Four Palms",
                "skillimage": "https://i.imgur.com/CFkIcA6.png",
                "skilldescription": "Hyuuga Hinata grants her team 10 points of destructible defense for 1 turn. Any enemy that breaks this destructible defense will have their chakra costs increased by 1 random for 1 turn. During 'Byakugan', this defense lasts 1 additional turn and refreshes 10 destructible defense on Hinata's next turn.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "all-allies",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "hyuuga_hinata_protective_palms_defense",
                        "duration": 1,
                        "scope": "all-allies",
                        "metadata": {
                            "destructibleDefensePoints": 10,
                            "onBreakApplyStatusToSource": {
                                "statusId": "hyuuga_hinata_protective_palms_cost",
                                "duration": 1,
                                "metadata": {
                                    "harmful": true,
                                    "randomCostIncrease": 1,
                                    "tooltipText": "This character's skills cost 1 additional random chakra."
                                }
                            },
                            "tooltipText": "This character has 10 destructible defense. If it is destroyed, Hinata's skills cost 1 additional random chakra."
                        },
                        "condition": {
                            "scope": "self",
                            "missingStatusId": "hyuuga_hinata_byakugan"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "hyuuga_hinata_protective_palms_defense",
                        "duration": 2,
                        "scope": "all-allies",
                        "metadata": {
                            "destructibleDefensePoints": 10,
                            "turnEndApplyStatusToSelf": {
                                "statusId": "hyuuga_hinata_protective_palms_defense_refresh",
                                "duration": 1,
                                "metadata": {
                                    "helpful": true,
                                    "destructibleDefensePoints": 10,
                                    "tooltipText": "This character has 10 refreshed destructible defense from Protective Eight Trigrams Sixty-Four Palms."
                                }
                            },
                            "turnEndTrigger": "source_turn",
                            "onBreakApplyStatusToSource": {
                                "statusId": "hyuuga_hinata_protective_palms_cost",
                                "duration": 1,
                                "metadata": {
                                    "harmful": true,
                                    "randomCostIncrease": 1,
                                    "tooltipText": "This character's skills cost 1 additional random chakra."
                                }
                            },
                            "tooltipText": "This character has 10 destructible defense. This defense refreshes once on Hinata's next turn. If it is destroyed, Hinata's skills cost 1 additional random chakra."
                        },
                        "condition": {
                            "scope": "self",
                            "statusId": "hyuuga_hinata_byakugan"
                        }
                    }
                ]
            },
            {
                "id": "hyuuga-hinata-byakugan",
                "name": "Byakugan",
                "skillimage": "https://i.imgur.com/TcjSSGB.png",
                "skilldescription": "Hyuuga Hinata costs no chakra and gains 10 points of damage reduction for 3 turns. During this time, 'Hinata Gentle Fist' and 'Protective Eight Trigrams Sixty-Four Palms' last 1 additional turn.",
                "energy": [],
                "target": "self",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "hyuuga_hinata_byakugan",
                        "duration": 3,
                        "scope": "self",
                        "metadata": {
                            "damageReductionFlat": 10,
                            "tooltipText": "Hinata has 10 damage reduction. Hinata Gentle Fist lasts 1 additional turn and Protective Eight Trigrams Sixty-Four Palms refreshes destructible defense once."
                        }
                    }
                ]
            },
            {
                "id": "hyuuga-hinata-hinata-block",
                "name": "Hinata Block",
                "skillimage": "https://i.imgur.com/jRh5417.png",
                "skilldescription": "This skill makes Hyuuga Hinata invulnerable for 1 turn.",
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
    {
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
                "cooldown": 1,
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
    {
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
    },
    {
        "id": "yamanaka-ino",
        "characterId": "yamanaka-ino",
        "name": "Yamanaka Ino",
        "facePicture": "https://i.imgur.com/qqaI3xv.png",
        "characterdeescription": "A Genin from Team 10, Ino is a member of the Yamanaka clan, and a very confident and vain girl. Ino is able to use a variety of abilities to take over and control her enemies, making it difficult to tell friend from foe.",
        "skills": [
            {
                "id": "yamanaka-ino-mind-body-disturbance",
                "name": "Mind Body Disturbance",
                "ignoreInvulnerability": false,
                "skillimage": "https://i.imgur.com/3g2XWzn.png",
                "skilldescription": "Yamanaka Ino targets one random enemy, stunning their physical, chakra, and strategic skills for 1 turn. Another random enemy takes 25 piercing damage.",
                "energy": [
                    "Genjutsu"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Mental",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "yamanaka_ino_mind_body_disturbance_control",
                        "duration": 1,
                        "scope": "random-enemy",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkillClasses": [
                                "physical",
                                "energy",
                                "strategic",
                                "ninjutsu"
                            ],
                            "tooltipText": "This character's physical, chakra, and strategic skills are stunned."
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 25,
                        "scope": "random-enemy",
                        "metadata": {
                            "ignoreDamageReduction": true,
                            "ignoreDestructibleDefense": true
                        }
                    }
                ]
            },
            {
                "id": "yamanaka-ino-mind-body-switch",
                "name": "Mind Body Switch",
                "skillimage": "https://i.imgur.com/dHM9uYL.png",
                "skilldescription": "Yamanaka Ino targets one enemy for 3 turns. On the first turn, their physical skills are stunned. On the second turn, their physical and chakra skills are stunned. On the third turn, they are fully stunned for 1 turn. During this time, this skill becomes 'Art of the Valentine'.",
                "energy": [
                    "Random",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 4,
                "classes": [
                    "Strategic",
                    "Control"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "yamanaka_ino_mind_body_switch_stage_1",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkillClasses": [
                                "physical"
                            ],
                            "tooltipText": "This character's physical skills are stunned. Next turn, their physical and chakra skills will be stunned. After that, they will be fully stunned.",
                            "onExpireEffects": [
                                {
                                    "type": "apply_status",
                                    "statusId": "yamanaka_ino_mind_body_switch_stage_2",
                                    "duration": 1,
                                    "scope": "self",
                                    "metadata": {
                                        "harmful": true,
                                        "cannotUseSkillClasses": [
                                            "physical",
                                            "energy"
                                        ],
                                        "tooltipText": "This character's physical and chakra skills are stunned.",
                                        "onExpireEffects": [
                                            {
                                                "type": "apply_status",
                                                "statusId": "yamanaka_ino_mind_body_switch_stage_3",
                                                "duration": 1,
                                                "scope": "self",
                                                "metadata": {
                                                    "harmful": true,
                                                    "cannotUseSkills": true,
                                                    "tooltipText": "This character is stunned and cannot use skills."
                                                }
                                            }
                                        ]
                                    }
                                }
                            ],
                            "ongoingClass": "control",
                            "turnDurationAnchor": "source_turn"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "yamanaka_ino_mind_body_switch_active",
                        "duration": 3,
                        "scope": "self",
                        "metadata": {
                            "skillReplacements": {
                                "yamanaka-ino-mind-body-switch": "yamanaka-ino-art-of-the-valentine"
                            },
                            "tooltipText": "Mind Body Switch is replaced by Art of the Valentine.",
                            "ongoingClass": "control"
                        }
                    }
                ]
            },
            {
                "id": "yamanaka-ino-chakra-hair-strand-trap",
                "name": "Chakra Hair Strand Trap",
                "skillimage": "https://i.imgur.com/CH2jrFU.png",
                "skilldescription": "Yamanaka Ino targets one enemy. For 1 turn, if they use a skill, they receive 10 damage, have their strategic skills stunned for 1 turn, and become unable to ignore stun effects for 1 turn. This skill is invisible.",
                "energy": [],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Strategic",
                    "Ninjutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "yamanaka_ino_chakra_hair_strand_trap",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "hideTooltipFromUnitOwner": true,
                            "onOwnerUseSkillTrigger": true,
                            "onOwnerUseSkillEffects": [
                                {
                                    "type": "damage",
                                    "amount": 10,
                                    "scope": "self"
                                },
                                {
                                    "type": "apply_status",
                                    "statusId": "yamanaka_ino_chakra_hair_strand_trap_strategic_stun",
                                    "duration": 1,
                                    "scope": "self",
                                    "metadata": {
                                        "harmful": true,
                                        "cannotUseSkillClasses": [
                                            "strategic"
                                        ],
                                        "cannotIgnoreStuns": true,
                                        "tooltipText": "This character's strategic skills are stunned and they cannot ignore stun effects."
                                    }
                                }
                            ],
                            "tooltipText": "If this character uses a skill, they take 10 damage and their strategic skills are stunned.",
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            },
            {
                "id": "yamanaka-ino-ino-block",
                "name": "Ino Block",
                "skillimage": "https://i.imgur.com/ZTn3Gt4.png",
                "skilldescription": "This skill makes Yamanaka Ino invulnerable for 1 turn.",
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
            },
            {
                "id": "yamanaka-ino-art-of-the-valentine",
                "name": "Art of the Valentine",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/p25BBXs.png",
                "skilldescription": "Yamanaka Ino deals 15 damage to one enemy. If the target is affected by a stun effect, this skill deals 10 additional damage.",
                "energy": [
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Mental",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 15,
                        "scope": "target"
                    },
                    {
                        "type": "damage",
                        "amount": 10,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "statusIdsAny": [
                                "stunned",
                                "yamanaka_ino_mind_body_disturbance_control",
                                "yamanaka_ino_mind_body_switch_stage_1",
                                "yamanaka_ino_mind_body_switch_stage_2",
                                "yamanaka_ino_mind_body_switch_stage_3",
                                "nara_shikamaru_shadow_imitation",
                                "haruno_sakura_ko_punch_stun",
                                "uzumaki_naruto_rasengan_stun"
                            ]
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "rock-lee",
        "characterId": "rock-lee",
        "name": "Rock Lee",
        "facePicture": "https://i.imgur.com/DuPEnHb.png",
        "characterdeescription": "A member of team Gai; Lee is a genin with no talent at all in ninjutsu or genjutsu, so he has focused his life all on taijutsu. With his powerful hand to hand techniques, Lee can crush any defense with his immense power.",
        "skills": [
            {
                "id": "rock-lee-high-speed-taijutsu",
                "name": "High Speed Taijutsu",
                "skillimage": "https://i.imgur.com/f59XWBW.png",
                "skilldescription": "Rock Lee deals 25 piercing damage to one enemy. This skill requires 'Fifth Gate Opening'.",
                "energy": [
                    "Taijutsu"
                ],
                "target": "single-enemy",
                "actorCondition": {
                    "statusId": "rock_lee_fifth_gate_opening"
                },
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Physical",
                    "Taijutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 25,
                        "scope": "target",
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    },
                    {
                        "type": "HealthLoss",
                        "amount": 5,
                        "scope": "self"
                    }
                ]
            },
            {
                "id": "rock-lee-front-lotus",
                "name": "Front Lotus",
                "skillimage": "https://i.imgur.com/4boHWJ0.png",
                "skilldescription": "Rock Lee deals 35 piercing damage to one enemy. For 1 turn, this skill is replaced by 'Final Lotus'. This skill requires 'Fifth Gate Opening'.",
                "energy": [
                    "Taijutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "actorCondition": {
                    "statusId": "rock_lee_fifth_gate_opening"
                },
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Physical",
                    "Taijutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 35,
                        "scope": "target",
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "rock_lee_front_lotus_final_lotus",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "skillReplacements": {
                                "rock-lee-front-lotus": "rock-lee-final-lotus"
                            },
                            "tooltipText": "Front Lotus is replaced by Final Lotus."
                        }
                    }
                ]
            },
            {
                "id": "rock-lee-fifth-gate-opening",
                "name": "Fifth Gate Opening",
                "skillimage": "https://i.imgur.com/OvlloQo.png",
                "skilldescription": "Rock Lee opens five of his chakra gates. Permanently, 'High Speed Taijutsu' and 'Front Lotus' may be used. During this time, Lee's harmful skills deal 5 additional damage each time he is damaged by an enemy skill. This skill is replaced by 'Fiery Spirit'.",
                "energy": [],
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
                        "statusId": "rock_lee_fifth_gate_opening",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "onOwnerDamagedByBaseDamageAtLeastApplyStatusToOwner": {
                                "threshold": 1,
                                "enemyOnly": true,
                                "duration": 99,
                                "statusId": "rock_lee_fifth_gate_damage_growth",
                                "metadata": {
                                    "skillDamageBonuses": {
                                        "rock-lee-high-speed-taijutsu": 5,
                                        "rock-lee-front-lotus": 5,
                                        "rock-lee-final-lotus": 5
                                    },
                                    "tooltipText": "Rock Lee's harmful skills deal 5 additional damage."
                                }
                            },
                            "skillReplacements": {
                                "rock-lee-fifth-gate-opening": "rock-lee-fiery-spirit"
                            },
                            "tooltipText": "Fifth Gate is open. Lee gains damage each time he is damaged by an enemy skill and Fifth Gate Opening is replaced by Fiery Spirit."
                        }
                    }
                ]
            },
            {
                "id": "rock-lee-lee-block",
                "name": "Lee Block",
                "skillimage": "https://i.imgur.com/qgiODIf.png",
                "skilldescription": "This skill makes Rock Lee invulnerable for 1 turn.",
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
            },
            {
                "id": "rock-lee-final-lotus",
                "name": "Final Lotus",
                "hiddenFromSelectionViewer": true,
                "useBaseSkillCooldown": true,
                "skillimage": "https://i.imgur.com/h658CGb.png",
                "skilldescription": "Rock Lee deals 50 piercing damage to one enemy. This skill cannot be countered.",
                "energy": [
                    "Taijutsu",
                    "Taijutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Physical",
                    "Taijutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 50,
                        "scope": "target",
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    }
                ],
                "cannotBeCountered": true
            },
            {
                "id": "rock-lee-fiery-spirit",
                "name": "Fiery Spirit",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/OvlloQo.png",
                "skilldescription": "Rock Lee gains 1 taijutsu chakra and heals 10 health plus an additional 10 health for each 25 health he has lost.",
                "energy": [
                    "Random"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "gain_chakra",
                        "chakraType": "taijutsu",
                        "amount": 1,
                        "scope": "self"
                    },
                    {
                        "type": "heal",
                        "amount": 10,
                        "scope": "self",
                        "metadata": {
                            "amountPerSourceMissingHpStep": 10,
                            "sourceMissingHpStep": 25
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "tenten",
        "characterId": "tenten",
        "name": "Tenten",
        "facePicture": "https://i.imgur.com/xkYENuj.png",
        "characterdeescription": "A member of team Gai, Tenten is a tomboyish weapon specialist who believes a kunoichi can be as strong as a male ninja. In battle, Tenten surrounds the battlefield in weapons, using them for damage and for disabling her opponents.",
        "skills": [
            {
                "id": "tenten-twin-rising-dragons",
                "name": "Twin Rising Dragons",
                "skillimage": "https://i.imgur.com/735M5GV.png",
                "skilldescription": "Tenten deals 15 damage to one enemy and 10 damage to all others. For 2 turns, all enemies will take 10 additional damage from 'Twin Rising Dragons Trap'.",
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
                        "amount": 15,
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
                        "condition": {
                            "scope": "self",
                            "missingStatusId": "tenten_full_release_active"
                        },
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "bonusDamageFromSourceSkillsFlat": 10,
                            "mergeNumericAddKeys": [
                                "bonusDamageFromSourceSkillsFlat"
                            ],
                            "bonusDamageFromSourceCharacterId": "tenten",
                            "bonusDamageAppliesToSkillIds": [
                                "tenten-twin-rising-dragons-trap"
                            ],
                            "tooltipTextTemplate": "This character takes {bonusDamageFromSourceSkillsFlat} additional damage from Twin Rising Dragons Trap."
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
                            "bonusDamageFromSourceSkillsFlat": 20,
                            "mergeNumericAddKeys": [
                                "bonusDamageFromSourceSkillsFlat"
                            ],
                            "bonusDamageFromSourceCharacterId": "tenten",
                            "bonusDamageAppliesToSkillIds": [
                                "tenten-twin-rising-dragons-trap"
                            ],
                            "tooltipTextTemplate": "This character takes {bonusDamageFromSourceSkillsFlat} additional damage from Twin Rising Dragons Trap."
                        }
                    },
                    {
                        "type": "cleanse_statuses",
                        "scope": "self",
                        "statusId": "tenten_full_release_active",
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
                "skillimage": "https://i.imgur.com/pOsj115.png",
                "skilldescription": "Tenten deals 5 damage to all enemies. Enemies affected by 'Twin Rising Dragons' will have their physical and chakra skills stunned for 1 turn and will deal 10 less physical and chakra damage. All stacks of 'Twin Rising Dragons' will be removed from all targets afterwards.",
                "energy": [
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
                        "amount": 5,
                        "scope": "all-enemy"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "tenten_twin_rising_dragons_trap_debuff",
                        "duration": 1,
                        "scope": "all-enemy",
                        "condition": {
                            "all": [
                                {
                                    "scope": "target",
                                    "statusId": "tenten_twin_rising_dragons_mark"
                                },
                                {
                                    "scope": "self",
                                    "missingStatusId": "tenten_full_release_active"
                                }
                            ]
                        },
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "damageDebuffBySkillClass": {
                                "physical": 10,
                                "energy": 10
                            },
                            "tooltipText": "This character deals 10 less physical and chakra damage."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "tenten_twin_rising_dragons_trap_debuff",
                        "duration": 2,
                        "scope": "all-enemy",
                        "condition": {
                            "all": [
                                {
                                    "scope": "target",
                                    "statusId": "tenten_twin_rising_dragons_mark"
                                },
                                {
                                    "scope": "self",
                                    "statusId": "tenten_full_release_active"
                                }
                            ]
                        },
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "damageDebuffBySkillClass": {
                                "physical": 10,
                                "energy": 10
                            },
                            "tooltipText": "This character deals 10 less physical and chakra damage."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "tenten_twin_rising_dragons_trap_skill_stun",
                        "duration": 1,
                        "scope": "all-enemy",
                        "condition": {
                            "scope": "target",
                            "statusId": "tenten_twin_rising_dragons_mark"
                        },
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkillClasses": [
                                "physical",
                                "energy",
                                "ninjutsu"
                            ],
                            "tooltipText": "This character's physical and chakra skills are stunned.",
                            "turnDurationAnchor": "source_turn"
                        }
                    },
                    {
                        "type": "cleanse_statuses",
                        "scope": "self",
                        "statusId": "tenten_full_release_active",
                        "condition": {
                            "scope": "self",
                            "statusId": "tenten_full_release_active"
                        }
                    },
                    {
                        "type": "cleanse_statuses",
                        "scope": "all-enemy",
                        "statusId": "tenten_twin_rising_dragons_mark"
                    }
                ]
            },
            {
                "id": "tenten-twin-rising-dragons-full-release",
                "name": "Twin Rising Dragons Full Release",
                "skillimage": "https://i.imgur.com/5cUbYBW.png",
                "skilldescription": "Tenten becomes invulnerable for 1 turn and improves her harmful skills until the next time she uses one; this does not stack. Twin Rising Dragons marks will cause Twin Rising Dragons Trap to deal 20 additional damage, and Twin Rising Dragons Trap's damage reduction will last 1 additional turn.",
                "energy": [
                    "Random"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 2,
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
                            "invulnerable": true,
                            "tooltipText": "Tenten is invulnerable."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "tenten_full_release_active",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "consumeOnNextSkillUse": true,
                            "tooltipText": "Tenten's next harmful skill is improved. Twin Rising Dragons marks will make Twin Rising Dragons Trap deal 20 additional damage. Twin Rising Dragons Trap's damage reduction will last 1 additional turn."
                        }
                    }
                ]
            },
            {
                "id": "tenten-spiked-boulder-wall",
                "name": "Spiked Boulder Wall",
                "skillimage": "https://i.imgur.com/45XopDc.png",
                "skilldescription": "This skill makes Tenten invulnerable for 1 turn.",
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
    {
        "id": "neji-hyuuga",
        "characterId": "neji-hyuuga",
        "name": "Hyuuga Neji",
        "facePicture": "https://i.imgur.com/ExAFrus.png",
        "characterdeescription": "A member of team Gai; Neji is the most talented member of the Hyuuga clan in both mind and body. Neji can use the most powerful techniques of his clan, shutting down an enemy's chakra or defending with an absolute defense.",
        "skills": [
            {
                "id": "neji-hyuuga-neji-gentle-fist",
                "name": "Neji Gentle Fist",
                "skillimage": "https://i.imgur.com/q8jlVNU.png",
                "skilldescription": "Hyuuga Neji deals 20 damage to one enemy for 2 turns. During this time, this enemy's non-affliction damage will be lowered by 10.",
                "energy": [
                    "Taijutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
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
                            "NonAfflictionDamageDebuff": 10,
                            "tooltipText": "This character takes 20 damage and deals 10 less non-affliction damage."
                        }
                    }
                ]
            },
            {
                "id": "neji-hyuuga-eight-trigrams-revolving-heaven",
                "name": "Eight Trigrams Revolving Heaven",
                "skillimage": "https://i.imgur.com/o0ufVHY.png",
                "skilldescription": "Hyuuga Neji deals 10 damage to all enemies and becomes invulnerable for 1 turn.",
                "energy": [
                    "Bloodline"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Ninjutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 10,
                        "scope": "all-enemy"
                    },
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
            },
            {
                "id": "neji-hyuuga-eight-trigrams-sixty-four-palms",
                "name": "Eight Trigrams Sixty-Four Palms",
                "skillimage": "https://i.imgur.com/HsyJQsX.png",
                "skilldescription": "Hyuuga Neji deals 35 damage to one enemy and removes 1 random chakra from them.",
                "energy": [
                    "Taijutsu",
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
                        "amount": 35,
                        "scope": "target"
                    },
                    {
                        "type": "remove_random_chakra",
                        "amount": 1,
                        "scope": "target"
                    },
                    {
                        "type": "remove_random_chakra",
                        "amount": 1,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "statusId": "neji_hyuuga_neji_gentle_fist"
                        }
                    }
                ]
            },
            {
                "id": "neji-hyuuga-byakugan-insight",
                "name": "Byakugan Insight",
                "skillimage": "https://i.imgur.com/2eXVucA.png",
                "skilldescription": "This skill makes Hyuuga Neji invulnerable for 1 turn.",
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
    {
        "id": "gaara-of-the-desert",
        "characterId": "gaara-of-the-desert",
        "name": "Gaara",
        "facePicture": "https://i.imgur.com/mmAjCZ7.png",
        "characterdeescription": "A Jinchuuriki from the Village of Sand, Gaara is an unstable ninja with the Shukaku, the one-tailed beast. With the Shukaku, and his own abilities, Gaara can manipulate the sand in his gourd to crush the enemy, or defend himself.",
        "skills": [
            {
                "id": "gaara-of-the-desert-sand-coffin",
                "name": "Sand Coffin",
                "skillimage": "https://i.imgur.com/cZ7Pk49.png",
                "skilldescription": "Gaara stuns one enemy's physical, chakra, and strategic skills for 2 turns. For 1 turn, this enemy cannot reduce damage or become invulnerable.",
                "energy": [
                    "Ninjutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Strategic",
                    "Control"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "gaara_sand_coffin_stun",
                        "duration": 2,
                        "scope": "target",
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
                        "type": "apply_status",
                        "statusId": "gaara_sand_coffin_crush",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotReduceDamage": true,
                            "cannotBecomeInvulnerable": true,
                            "tooltipText": "This character cannot reduce damage or become invulnerable.",
                            "ongoingClass": "control",
                            "turnDurationAnchor": "source_turn"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "gaara_sand_coffin_ready",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "skillReplacements": {
                                "gaara-of-the-desert-sand-coffin": "gaara-of-the-desert-sand-burial"
                            },
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "Sand Coffin is replaced by Sand Burial.",
                            "ongoingClass": "control"
                        }
                    }
                ]
            },
            {
                "id": "gaara-of-the-desert-sand-burial",
                "name": "Sand Burial",
                "cannotBeCountered": true,
                "cannotBeReflected": true,
                "skillimage": "https://i.imgur.com/ljX9izT.png",
                "skilldescription": "Gaara deals 30 piercing damage to one enemy and ignores helpful effects for 1 turn. If used 1 turn after 'Sand Coffin', this skill costs 1 ninjutsu and 1 bloodline chakra and deals 50 piercing damage instead.",
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
                        "amount": 30,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "missingStatusId": "gaara_sand_coffin_crush"
                        },
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 50,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "statusId": "gaara_sand_coffin_crush"
                        },
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "gaara_sand_burial_ignore_helpful",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character ignores helpful effects for 1 turn."
                        }
                    }
                ]
            },
            {
                "id": "gaara-of-the-desert-armor-of-sand",
                "name": "Armor of Sand",
                "skillimage": "https://i.imgur.com/qfrA8gB.png",
                "skilldescription": "Gaara gains 25 points of permanent destructible defense. This skill cannot be used again while it is still active.",
                "energy": [
                    "Random"
                ],
                "target": "self",
                "targetCondition": {
                    "missingStatusId": "gaara_armor_of_sand"
                },
                "damage": 0,
                "cooldown": 4,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "gaara_armor_of_sand",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "destructibleDefensePoints": 25,
                            "tooltipText": "Gaara has 25 points of permanent destructible defense from Armor of Sand."
                        }
                    }
                ]
            },
            {
                "id": "gaara-of-the-desert-shield-of-sand",
                "name": "Shield of Sand",
                "skillimage": "https://i.imgur.com/vL03kPm.png",
                "skilldescription": "This skill makes Gaara invulnerable for 1 turn.",
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
    {
        "id": "kankuro",
        "characterId": "kankuro",
        "name": "Kankuro",
        "facePicture": "https://i.imgur.com/GN0osit.png",
        "characterdeescription": "The brother of Gaara, and a master puppeteer, Kankuro is one of the three sand siblings. With his puppets, Kankuro is able to use the varied abilities hidden inside them to attack his enemies, or even protect himself.",
        "skills": [
            {
                "id": "kankuro-black-secret-machine-one-shot",
                "name": "Black Secret Machine One Shot",
                "skillimage": "https://i.imgur.com/wjpmZQI.png",
                "skilldescription": "Kankuro deals 30 piercing damage to one enemy. For 1 turn, this enemy will take 5 additional damage from 'Poison Bomb'.",
                "energy": [
                    "Random",
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
                        "amount": 30,
                        "scope": "target",
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kankuro_black_secret_machine_one_shot_mark",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "bonusDamageFromSourceSkillsFlat": 5,
                            "bonusDamageFromSourceCharacterId": "kankuro",
                            "bonusDamageAppliesToSkillIds": [
                                "kankuro-poison-bomb"
                            ],
                            "tooltipText": "This character takes 5 additional damage from Poison Bomb."
                        }
                    }
                ]
            },
            {
                "id": "kankuro-poison-bomb",
                "name": "Poison Bomb",
                "skillimage": "https://i.imgur.com/3MFMSHu.png",
                "skilldescription": "Kankuro deals 10 affliction damage to all enemies. For 1 turn, these enemies will take 5 additional damage from 'Black Secret Machine One Shot'. If Kankuro has 'Puppet Preparation', this effect will last 2 turns.",
                "energy": [
                    "Random"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 1,
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
                        "statusId": "kankuro_poison_bomb_mark",
                        "duration": 1,
                        "scope": "all-enemy",
                        "condition": {
                            "scope": "self",
                            "missingStatusId": "kankuro_puppet_preparation_bonus"
                        },
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "bonusDamageFromSourceSkillsFlat": 5,
                            "bonusDamageFromSourceCharacterId": "kankuro",
                            "bonusDamageAppliesToSkillIds": [
                                "kankuro-black-secret-machine-one-shot"
                            ],
                            "tooltipText": "This character takes 5 additional damage from Black Secret Machine One Shot."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kankuro_poison_bomb_mark",
                        "duration": 2,
                        "scope": "all-enemy",
                        "condition": {
                            "scope": "self",
                            "statusId": "kankuro_puppet_preparation_bonus"
                        },
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "bonusDamageFromSourceSkillsFlat": 5,
                            "bonusDamageFromSourceCharacterId": "kankuro",
                            "bonusDamageAppliesToSkillIds": [
                                "kankuro-black-secret-machine-one-shot"
                            ],
                            "tooltipText": "This character takes 5 additional damage from Black Secret Machine One Shot."
                        }
                    }
                ]
            },
            {
                "id": "kankuro-puppet-preparation",
                "name": "Puppet Preparation",
                "skillimage": "https://i.imgur.com/ghx3V0n.png",
                "skilldescription": "Kankuro gains 10 points of permanent destructible defense. His next 'Black Secret Machine One Shot' or 'Poison Bomb' will deal 10 additional damage. This damage bonus does not stack.",
                "energy": [],
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
                        "statusId": "kankuro_puppet_preparation_defense",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "destructibleDefensePoints": 10,
                            "mergeNumericAddKeys": [
                                "destructibleDefensePoints"
                            ],
                            "tooltipTextTemplate": "Kankuro has {destructibleDefensePoints} points of permanent destructible defense from Puppet Preparation."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kankuro_puppet_preparation_bonus",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "skillDamageBonuses": {
                                "kankuro-black-secret-machine-one-shot": 10,
                                "kankuro-poison-bomb": 10
                            },
                            "removeSelfOnSkillUseSkillIds": [
                                "kankuro-black-secret-machine-one-shot",
                                "kankuro-poison-bomb"
                            ],
                            "onOwnerUseSkillIdsAny": [
                                "kankuro-black-secret-machine-one-shot",
                                "kankuro-poison-bomb"
                            ],
                            "replaceSkillDamageBonuses": true,
                            "tooltipText": "Kankuro's next Black Secret Machine One Shot or Poison Bomb deals 10 additional damage."
                        }
                    }
                ]
            },
            {
                "id": "kankuro-puppet-replacement-technique",
                "name": "Puppet Replacement Technique",
                "skillimage": "https://i.imgur.com/P2K3Uue.png",
                "skilldescription": "This skill makes Kankuro invulnerable for 1 turn.",
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
    {
        "id": "temari",
        "characterId": "temari",
        "name": "Temari",
        "facePicture": "https://i.imgur.com/a3la0h5.png",
        "characterdeescription": "The elder sister of Gaara and Kankuro, Temari is a somewhat cruel and blunt ninja that fights using the wind at her side. With her fan, Temari can create powerful gusts of wind that she can manipulate at her desire.",
        "skills": [
            {
                "id": "temari-cutting-whirlwind",
                "name": "Cutting Whirlwind",
                "skillimage": "https://i.imgur.com/VU7HluY.png",
                "skilldescription": "Temari creates a razor sharp wind, dealing 20 piercing damage to one enemy and 10 piercing damage to all other enemies. For 1 turn, Temari becomes invulnerable to non-mental skills.",
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
                        "amount": 20,
                        "scope": "target",
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 10,
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
                            "invulnerableToSkillClasses": [
                                "physical",
                                "energy",
                                "strategic",
                                "affliction"
                            ],
                            "skillCostOverridesBySkillId": {
                                "temari-summoning-quick-beheading-dance": {
                                    "energy": [
                                        "Ninjutsu",
                                        "Random"
                                    ]
                                }
                            },
                            "tooltipText": "Temari is invulnerable to non-mental skills. Summoning Quick Beheading Dance costs 1 less random chakra."
                        }
                    }
                ]
            },
            {
                "id": "temari-summoning-quick-beheading-dance",
                "name": "Summoning Quick Beheading Dance",
                "skillimage": "https://i.imgur.com/9VRqsM7.png",
                "skilldescription": "Temari summons the wind weasel Kamatari in the battlefield, dealing 35 damage to all enemies. If used one turn after 'Cutting Whirlwind', this skill will cost 1 less random chakra.",
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
                        "type": "apply_status",
                        "statusId": "temari_summoning_quick_beheading_dance",
                        "duration": 1,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 35,
                            "turnEndTrigger": "source_turn",
                            "turnDurationAnchor": "source_turn",
                            "ongoingClass": "action",
                            "triggerOnApply": true,
                            "tooltipText": "This character will take 35 damage from Summoning Quick Beheading Dance."
                        }
                    }
                ]
            },
            {
                "id": "temari-dust-wind",
                "name": "Dust Wind",
                "skillimage": "https://i.imgur.com/oBQQWNM.png",
                "skilldescription": "Temari kicks up dust, making herself invulnerable for 1 turn. If targetable, all enemies will deal 20 less non-affliction damage for 1 turn. If used one turn after 'Cutting Whirlwind', this skill will decrease damage for 2 turns instead.",
                "energy": [
                    "Ninjutsu",
                    "Random"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 4,
                "classes": [
                    "Strategic",
                    "Physical",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "temari_dust_wind_invulnerable",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "invulnerable": true,
                            "tooltipText": "This character is invulnerable."
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
                            "tooltipText": "This character deals 20 less non-affliction damage.",
                            "turnDurationAnchor": "source_turn"
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
                            "tooltipText": "This character deals 20 less non-affliction damage."
                        }
                    }
                ]
            },
            {
                "id": "temari-fan-defence-technique",
                "name": "Fan Defence Technique",
                "skillimage": "https://i.imgur.com/nnNAsmM.png",
                "skilldescription": "This skill makes Temari invulnerable for 1 turn.",
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
    {
        "id": "dosu-kinuta",
        "characterId": "dosu-kinuta",
        "name": "Dosu Kinuta",
        "facePicture": "https://i.imgur.com/NY3b12m.png",
        "characterdeescription": "One of the three sound genin, and possibly the strongest; Dosu is an intelligent and patient ninja that likes to act with logic. Using a powerful sound based arm, Dosu can disable his enemies by disrupting their hearing and throwing them off.",
        "skills": [
            {
                "id": "dosu-kinuta-resonating-echo-drill",
                "name": "Resonating Echo Drill",
                "skillimage": "https://i.imgur.com/arSzsOV.png",
                "skilldescription": "Kinuta Dosu deals 20 damage to one enemy. This enemy will be unable to reduce damage or become invulnerable for 1 turn. The following turn, 'Sound Manipulation' will deal 10 additional damage to them.",
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
                        "type": "apply_status",
                        "statusId": "dosu_kinuta_resonating_echo_drill_debuff",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotReduceDamage": true,
                            "cannotBecomeInvulnerable": true,
                            "tooltipText": "This character cannot reduce damage or become invulnerable."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "dosu_kinuta_resonating_echo_drill_mark",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "Dosu's Sound Manipulation will deal 10 additional damage to this character."
                        }
                    }
                ]
            },
            {
                "id": "dosu-kinuta-sound-manipulation",
                "name": "Sound Manipulation",
                "skillimage": "https://i.imgur.com/eSCnMmL.png",
                "skilldescription": "Kinuta Dosu deals 10 damage to one enemy. For 1 turn, this enemy will take 5 additional damage from non-affliction skills and will deal 5 less damage with non-affliction skills. During 'Melody Arm Tuning', this skill's non-damage effects will last permanently instead and may stack.",
                "energy": [
                    "Genjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Mental",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 10,
                        "scope": "target"
                    },
                    {
                        "type": "damage",
                        "amount": 10,
                        "scope": "target",
                        "condition": {
                            "statusId": "dosu_kinuta_resonating_echo_drill_mark",
                            "scope": "target",
                            "consumeOnMatch": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "dosu_kinuta_sound_manipulation_debuff",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "nonAfflictionDamageTakenBonusFlat": 5,
                            "nonAfflictionDamageDebuffFlat": 5,
                            "tooltipText": "This character takes 5 additional damage from non-affliction skills and deals 5 less damage with non-affliction skills.",
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            },
            {
                "id": "dosu-kinuta-melody-arm-tuning",
                "name": "Melody Arm Tuning",
                "skillimage": "https://i.imgur.com/yqkQKWQ.png",
                "skilldescription": "For the following 3 turns, 'Resonating Echo Drill' will deal 20 additional damage and 'Sound Manipulation' will deal 10 additional damage.",
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
                        "statusId": "dosu_kinuta_melody_arm_tuning_active",
                        "duration": 3,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillReplacements": {
                                "dosu-kinuta-resonating-echo-drill": "dosu-kinuta-resonating-echo-drill-improved",
                                "dosu-kinuta-sound-manipulation": "dosu-kinuta-sound-manipulation-improved"
                            },
                            "tooltipText": "Resonating Echo Drill deals 20 additional damage and Sound Manipulation deals 10 additional damage."
                        }
                    }
                ]
            },
            {
                "id": "dosu-kinuta-agile-leap",
                "name": "Agile Leap",
                "skillimage": "https://i.imgur.com/Irubt1X.png",
                "skilldescription": "This skill makes Kinuta Dosu invulnerable for 1 turn.",
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
            },
            {
                "id": "dosu-kinuta-resonating-echo-drill-improved",
                "name": "Resonating Echo Drill",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/arSzsOV.png",
                "skilldescription": "Kinuta Dosu deals 40 damage to one enemy. This enemy will be unable to reduce damage or become invulnerable for 2 turns. The following turn, 'Sound Manipulation' will deal 10 additional damage to them.",
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
                        "amount": 40,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "dosu_kinuta_resonating_echo_drill_debuff",
                        "duration": 2,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotReduceDamage": true,
                            "cannotBecomeInvulnerable": true,
                            "tooltipText": "This character cannot reduce damage or become invulnerable."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "dosu_kinuta_resonating_echo_drill_mark",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "Dosu's Sound Manipulation will deal 10 additional damage to this character."
                        }
                    }
                ]
            },
            {
                "id": "dosu-kinuta-sound-manipulation-improved",
                "name": "Sound Manipulation",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/eSCnMmL.png",
                "skilldescription": "Kinuta Dosu deals 20 damage to one enemy. This character permanently takes 5 additional damage from non-affliction skills and deals 5 less damage with non-affliction skills (stacks).",
                "energy": [
                    "Genjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Mental",
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
                        "scope": "target",
                        "condition": {
                            "statusId": "dosu_kinuta_resonating_echo_drill_mark",
                            "scope": "target",
                            "consumeOnMatch": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "dosu_kinuta_sound_manipulation_debuff_permanent",
                        "duration": 99,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "nonAfflictionDamageTakenBonusFlat": 5,
                            "nonAfflictionDamageDebuffFlat": 5,
                            "mergeNumericAddKeys": [
                                "nonAfflictionDamageTakenBonusFlat",
                                "nonAfflictionDamageDebuffFlat"
                            ],
                            "tooltipText": "This character permanently takes 5 additional damage from non-affliction skills and deals 5 less damage with non-affliction skills (stacks)."
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "tsuchi-kin",
        "characterId": "tsuchi-kin",
        "name": "Tsuchi Kin",
        "facePicture": "https://i.imgur.com/hOoNOfj.png",
        "characterdeescription": "Tsuchi Kin is a kunoichi of the Hidden Sound who weaponizes resonance and deception through the ringing of her bells. She excels at destabilizing opponents, unraveling their rhythm before striking with precision.",
        "skills": [
            {
                "id": "tsuchi-kin-illusion-bell-needles",
                "name": "Illusion Bell Needles",
                "skillimage": "https://i.imgur.com/wFHxiW6.png",
                "skilldescription": "Tsuchi Kin deals 20 damage to one enemy.",
                "energy": [
                    "Genjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Mental",
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
                "id": "tsuchi-kin-needle-and-bell-trap",
                "name": "Needle and Bell Trap",
                "skillimage": "https://i.imgur.com/spMHiJJ.png",
                "skilldescription": "Tsuchi Kin deals 15 damage to one enemy and stuns their physical and strategic skills for 1 turn.",
                "energy": [
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Strategic",
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
                        "statusId": "tsuchi_kin_needle_and_bell_trap_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkillClasses": [
                                "physical",
                                "strategic"
                            ],
                            "tooltipText": "This character's physical and strategic skills are stunned.",
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            },
            {
                "id": "tsuchi-kin-unnerving-bells",
                "name": "Unnerving Bells",
                "skillimage": "https://i.imgur.com/BU6EHyR.png",
                "skilldescription": "Tsuchi Kin deals 10 damage to one enemy and removes 1 random chakra from them.",
                "energy": [
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 10,
                        "scope": "target"
                    },
                    {
                        "type": "remove_random_chakra",
                        "amount": 1,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "tsuchi_kin_illusion_bell_trigger_unnerving_bells",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "tooltipText": "Unnerving Bells trigger active.",
                            "turnDurationAnchor": "source_turn",
                            "ongoingClass": "control"
                        }
                    }
                ]
            },
            {
                "id": "tsuchi-kin-kin-substitution",
                "name": "Kin Substitution",
                "skillimage": "https://i.imgur.com/XVx6f4x.png",
                "skilldescription": "This skill makes Tsuchi Kin invulnerable for 1 turn.",
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
    {
        "id": "zaku-abumi",
        "characterId": "zaku-abumi",
        "name": "Zaku Abumi",
        "facePicture": "https://i.imgur.com/GMkH15X.png",
        "characterdeescription": "One of the three sound genin; Zaku is a willful individual who has a very strong desire to win and succeed. Using the implanted tubes in his arm, Zaku can create powerful waves of chakra, or alter the wind ever so gently to protect an ally.",
        "skills": [
            {
                "id": "zaku-abumi-decapitating-airwaves",
                "name": "Decapitating Airwaves",
                "skillimage": "https://i.imgur.com/wYuJK6u.png",
                "skilldescription": "Abumi Zaku deals 25 damage to one enemy. During the following turn, 'Extreme Decapitating Airwaves' may be used.",
                "energy": [
                    "Bloodline"
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
                        "amount": 25,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "zaku_abumi_decapitating_airwaves_unlock",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "turnDurationAnchor": "source_turn",
                            "skillReplacements": {
                                "zaku-abumi-extreme-decapitating-airwaves": "zaku-abumi-extreme-decapitating-airwaves-active"
                            },
                            "tooltipText": "Extreme Decapitating Airwaves may be used."
                        }
                    }
                ]
            },
            {
                "id": "zaku-abumi-wall-of-air",
                "name": "Wall of Air",
                "skillimage": "https://i.imgur.com/1bKTzwA.png",
                "skilldescription": "Abumi Zaku targets one ally. The following turn, the first harmful non-strategic skill used on this ally will be countered. This skill is invisible.",
                "energy": [
                    "Random"
                ],
                "target": "self-or-single-ally",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "zaku_abumi_wall_of_air",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "helpful": true,
                            "hideTooltipFromEnemy": true,
                            "triggerOnEnemyHarmfulNonStrategic": true,
                            "counterCancelsSkill": true,
                            "tooltipText": "The first non-strategic skill used on this character will be countered."
                        }
                    }
                ]
            },
            {
                "id": "zaku-abumi-extreme-decapitating-airwaves",
                "name": "Extreme Decapitating Airwaves",
                "skillimage": "https://i.imgur.com/BGu8oPg.png",
                "skilldescription": "Abumi Zaku deals 45 damage to all enemies. This skill can only be used during the turn after 'Decapitating Airwaves' is used.",
                "energy": [
                    "Bloodline",
                    "Random",
                    "Random"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 0,
                "actorCondition": {
                    "statusId": "zaku_abumi_decapitating_airwaves_unlock"
                },
                "classes": [
                    "Strategic",
                    "Physical",
                    "Instant"
                ],
                "effects": []
            },
            {
                "id": "zaku-abumi-airwave-deflection",
                "name": "Airwave Deflection",
                "skillimage": "https://i.imgur.com/yszdsLO.png",
                "skilldescription": "This skill makes Abumi Zaku invulnerable for 1 turn.",
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
            },
            {
                "id": "zaku-abumi-extreme-decapitating-airwaves-active",
                "name": "Extreme Decapitating Airwaves",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/BGu8oPg.png",
                "skilldescription": "Abumi Zaku deals 45 damage to all enemies.",
                "energy": [
                    "Bloodline",
                    "Random",
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
                        "amount": 45,
                        "scope": "all-enemy"
                    }
                ]
            }
        ]
    },
    {
        "id": "young-kakashi",
        "characterId": "young-kakashi",
        "name": "Young Kakashi",
        "facePicture": "https://i.imgur.com/U3Ivdp4.png",
        "characterdeescription": "A jounin at the age of 13 and the son of the legendary White Fang, Kakashi is a member of Team Minato. Using his early ninjutsu, and borrowed sharingan, Kakashi can fight any adult on an equal level.",
        "skills": [
            {
                "id": "young-kakashi-white-fang-slash",
                "name": "White Fang Slash",
                "skillimage": "https://i.imgur.com/UOC5Fsb.png",
                "skilldescription": "Young Kakashi deals 20 piercing damage to one enemy. For 1 turn, this enemy will deal 5 less non-affliction damage. The following turn, Young Kakashi will deal 5 additional damage with his skills.",
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
                            "ignoreDestructibleDefense": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "young_kakashi_white_fang_slash_debuff",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "nonAfflictionDamageDebuffFlat": 5,
                            "tooltipText": "This character deals 5 less non-affliction damage.",
                            "turnDurationAnchor": "source_turn"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "young_kakashi_white_fang_slash_bonus",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "damageBonusFlat": 5,
                            "tooltipText": "Young Kakashi deals 5 additional damage with his skills."
                        }
                    }
                ]
            },
            {
                "id": "young-kakashi-amateur-raikiri",
                "name": "Amateur Raikiri",
                "skillimage": "https://i.imgur.com/uy8jRiS.png",
                "skilldescription": "Young Kakashi deals 20 piercing damage to one enemy. For 1 turn, this enemy will deal 5 less non-affliction damage. The following turn, Young Kakashi will deal 5 additional damage with his skills.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Ninjutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 20,
                        "scope": "target",
                        "metadata": {
                            "ignoreDestructibleDefense": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "young_kakashi_amateur_raikiri_debuff",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "nonAfflictionDamageDebuffFlat": 5,
                            "tooltipText": "This character deals 5 less non-affliction damage.",
                            "turnDurationAnchor": "source_turn"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "young_kakashi_amateur_raikiri_bonus",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "damageBonusFlat": 5,
                            "tooltipText": "Young Kakashi deals 5 additional damage with his skills."
                        }
                    }
                ]
            },
            {
                "id": "young-kakashi-implanted-sharingan",
                "name": "Implanted Sharingan",
                "skillimage": "https://i.imgur.com/VrPbW1z.png",
                "skilldescription": "For 2 turns, if one enemy uses a new skill on Young Kakashi, his skills will deal 10 additional damage for 1 turn. This skill is invisible and ends when triggered.",
                "energy": [],
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
                        "statusId": "young_kakashi_implanted_sharingan_trap",
                        "duration": 2,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "hideTooltipFromEnemy": true,
                            "triggerOnEnemyHarmfulSkill": true,
                            "counterApplyStatusToRecipient": {
                                "statusId": "young_kakashi_implanted_sharingan_bonus",
                                "duration": 1,
                                "metadata": {
                                    "helpful": true,
                                    "damageBonusFlat": 10,
                                    "tooltipText": "Young Kakashi deals 10 additional damage with his skills."
                                }
                            },
                            "tooltipText": "If an enemy uses a new skill on this character, his skills deal 10 additional damage for 1 turn."
                        }
                    }
                ]
            },
            {
                "id": "young-kakashi-sword-parry",
                "name": "Sword Parry",
                "skillimage": "https://i.imgur.com/V9vfQQQ.png",
                "skilldescription": "This skill makes Young Kakashi invulnerable for 1 turn.",
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
                        "statusId": "young_kakashi_sword_parry",
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
    {
        "id": "uchiha-obito",
        "characterId": "uchiha-obito",
        "name": "Uchiha Obito",
        "facePicture": "https://i.imgur.com/JbvGcwk.png",
        "characterdeescription": "A minor member of the Uchiha clan and a chuunin, Obito is a member of Team Minato. While Obito does not possess any singular powerful ability, he can use all of what he knows with his developing sharingan to put up a fight.",
        "skills": [
            {
                "id": "uchiha-obito-piercing-stab",
                "name": "Piercing Stab",
                "skillimage": "https://i.imgur.com/YjvbfdY.png",
                "skilldescription": "Uchiha Obito deals 15 piercing damage to one enemy. During 'Obito Sharingan', this skill will deal 10 additional damage and ignore invulnerability.",
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
                        "type": "damage",
                        "amount": 15,
                        "scope": "target",
                        "condition": {
                            "scope": "self",
                            "statusId": "uchiha_obito_sharingan",
                            "conditionalAmount": 25
                        },
                        "metadata": {
                            "ignoreDestructibleDefense": true
                        }
                    }
                ]
            },
            {
                "id": "uchiha-obito-great-fireball",
                "name": "Obito Great Fireball",
                "skillimage": "https://i.imgur.com/YQwIDCR.png",
                "skilldescription": "Uchiha Obito deals 15 affliction damage to one enemy for 2 turns. During 'Obito Sharingan', this skill will deal 30 affliction damage instantly.",
                "energy": [
                    "Ninjutsu"
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
                        "statusId": "uchiha_obito_great_fireball_dot",
                        "duration": 2,
                        "scope": "target",
                        "condition": {
                            "scope": "self",
                            "missingStatusId": "uchiha_obito_sharingan"
                        },
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 15,
                            "afflictionDamage": true,
                            "turnEndTrigger": "source_turn",
                            "turnDurationAnchor": "source_turn",
                            "ongoingClass": "action",
                            "triggerOnApply": true,
                            "tooltipText": "This character takes 15 affliction damage each turn from Obito Great Fireball."
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 30,
                        "scope": "target",
                        "condition": {
                            "scope": "self",
                            "statusId": "uchiha_obito_sharingan"
                        },
                        "metadata": {
                            "afflictionDamage": true,
                            "ignoreDamageReduction": true
                        }
                    }
                ]
            },
            {
                "id": "uchiha-obito-sharingan",
                "name": "Obito Sharingan",
                "skillimage": "https://i.imgur.com/HB5GL7k.png",
                "skilldescription": "For 4 turns, Uchiha Obito will gain 15 points of damage reduction. This skill becomes 'Sharingan-Enhanced Parry' for 4 turns after used.",
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
                        "statusId": "uchiha_obito_sharingan",
                        "duration": 4,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "damageReductionFlat": 15,
                            "ignoreInvulnerabilityForSkillIds": [
                                "uchiha-obito-piercing-stab"
                            ],
                            "tooltipText": "Uchiha Obito has 15 points of damage reduction from Obito Sharingan and Piercing Stab ignores invulnerability."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "uchiha_obito_sharingan_replacement",
                        "duration": 4,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillReplacements": {
                                "uchiha-obito-sharingan": "uchiha-obito-sharingan-enhanced-parry"
                            },
                            "tooltipText": "Obito Sharingan is replaced by Sharingan-Enhanced Parry."
                        }
                    }
                ]
            },
            {
                "id": "uchiha-obito-flee",
                "name": "Obito Flee",
                "skillimage": "https://i.imgur.com/WJAbDGt.png",
                "skilldescription": "This skill makes Uchiha Obito invulnerable for 1 turn.",
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
                        "statusId": "uchiha_obito_flee",
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
                "id": "uchiha-obito-sharingan-enhanced-parry",
                "name": "Sharingan-Enhanced Parry",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/HB5GL7k.png",
                "skilldescription": "Uchiha Obito makes his allies invulnerable for 1 turn.",
                "energy": [
                    "Random",
                    "Random"
                ],
                "target": "all-allies",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "uchiha_obito_sharingan_enhanced_parry",
                        "duration": 1,
                        "scope": "all-allies",
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
    {
        "id": "nohara-rin",
        "characterId": "nohara-rin",
        "name": "Nohara Rin",
        "facePicture": "https://i.imgur.com/nVN2Va7.png",
        "characterdeescription": "A chuunin medical nin assigned to Team Minato, Rin is a quiet and passive girl who focuses on keeping her team mates alive. Using her healing abilities, and her intelligence, Rin is able to heal her allies while trapping her enemies.",
        "skills": [
            {
                "id": "nohara-rin-pit-trap",
                "name": "Pit Trap",
                "skillimage": "https://i.imgur.com/h7PnmYi.png",
                "skilldescription": "For 1 turn, Nohara Rin will gain 15 points of damage reduction and one target enemy will take 15 piercing damage that ignores invulnerability at the end of their turn. If that enemy uses a new skill, they will also take another 15 damage from this skill. This skill is invisible and ignores invulnerability. This skill's damage isn't increased nor decreased by effects used on Nohara Rin.",
                "energy": [
                    "Genjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "ignoreInvulnerability": true,
                "classes": [
                    "Physical",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "nohara_rin_pit_trap_defense",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "hideTooltipFromEnemy": true,
                            "damageReductionFlat": 15,
                            "tooltipText": "Nohara Rin has 15 points of damage reduction from Pit Trap."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "nohara_rin_pit_trap",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "hideTooltipFromEnemy": true,
                            "turnEndDamage": 15,
                            "ignoreSourceNonAfflictionDamageBonus": true,
                            "ignoreTargetDestructibleDefense": true,
                            "triggerOnEnemyHarmfulSkill": true,
                            "counterDamage": 15,
                            "counterDamageIgnoresDestructibleDefense": true,
                            "tooltipText": "This character takes 15 piercing damage that ignores invulnerability at the end of their turn. If they use a new skill, they take another 15 damage.",
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            },
            {
                "id": "nohara-rin-mystical-palm-healing",
                "name": "Rin Mystical Palm Healing",
                "skillimage": "https://i.imgur.com/vMIpkz6.png",
                "skilldescription": "Nohara Rin heals herself or an ally for 25 health and removes all enemy affliction skills on this character.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "single-ally",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "heal",
                        "amount": 25,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "nohara_rin_mystical_palm_healing_cleanse",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "helpful": true,
                            "hideTooltip": true,
                            "removeEnemyAfflictionStatusesOnApply": true
                        }
                    }
                ]
            },
            {
                "id": "nohara-rin-medical-kit",
                "name": "Medical Kit",
                "skillimage": "https://i.imgur.com/uLva4cB.png",
                "skilldescription": "Nohara Rin targets herself or an ally. For 3 turns, that character will be healed for 10 health each turn. During this time, they will deal 5 additional damage with physical and energy skills.",
                "energy": [
                    "Random",
                    "Random"
                ],
                "target": "single-ally",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "nohara_rin_medical_kit",
                        "duration": 3,
                        "scope": "target",
                        "metadata": {
                            "helpful": true,
                            "turnEndHealFlat": 10,
                            "damageBonusBySkillClass": {
                                "physical": 5,
                                "energy": 5
                            },
                            "tooltipText": "This character heals 10 health each turn and deals 5 additional damage with physical and energy skills from Medical Kit."
                        }
                    }
                ]
            },
            {
                "id": "nohara-rin-flee",
                "name": "Flee",
                "skillimage": "https://i.imgur.com/10ydruj.png",
                "skilldescription": "This skill makes Nohara Rin invulnerable for 1 turn.",
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
                        "statusId": "nohara_rin_flee",
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
    {
        "id": "hyuuga-hanabi",
        "characterId": "hyuuga-hanabi",
        "name": "Hyuuga Hanabi",
        "facePicture": "https://i.imgur.com/UgOE7eF.png",
        "characterdeescription": "The younger sister of Hinata, Hanabi is a Hyuuga clan member who trains endlessly to prove herself. Hanabi's skills surpass her elder sister's, and while lacking in strength, Hanabi makes up for it with her tenacity and speed.",
        "skills": [
            {
                "id": "hyuuga-hanabi-gentle-fist",
                "name": "Hanabi Gentle Fist",
                "skillimage": "https://i.imgur.com/nPYcr3w.png",
                "skilldescription": "Hyuuga Hanabi deals 15 damage to one enemy for 2 turns. The following 2 turns, this enemy loses 1 random chakra each turn.",
                "energy": [
                    "Taijutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Physical",
                    "Action"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "hyuuga_hanabi_gentle_fist_dot",
                        "duration": 2,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 15,
                            "turnEndTrigger": "source_turn",
                            "turnDurationAnchor": "source_turn",
                            "ongoingClass": "action",
                            "triggerOnApply": true,
                            "tooltipText": "This character takes 15 damage from Gentle Fist. Afterward, this character loses 1 random chakra each turn for 2 turns.",
                            "onExpireEffects": [
                                {
                                    "type": "apply_status",
                                    "statusId": "hyuuga_hanabi_gentle_fist_drain",
                                    "duration": 2,
                                    "metadata": {
                                        "harmful": true,
                                        "turnEndRemoveRandomChakra": 1,
                                        "tooltipText": "This character loses 1 random chakra each turn from Gentle Fist."
                                    }
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "hyuuga-hanabi-eight-trigrams-revolving-heaven",
                "name": "Hanabi Eight Trigrams Revolving Heaven",
                "skillimage": "https://i.imgur.com/peE9cHB.png",
                "skilldescription": "Hyuuga Hanabi deals 15 damage to one enemy for 2 turns. The following 2 turns, this enemy deals 5 less damage.",
                "energy": [
                    "Taijutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Ninjutsu",
                    "Action"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "hyuuga_hanabi_revolving_heaven_dot",
                        "duration": 2,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 15,
                            "turnEndTrigger": "source_turn",
                            "turnDurationAnchor": "source_turn",
                            "ongoingClass": "action",
                            "triggerOnApply": true,
                            "tooltipText": "This character takes 15 damage from Eight Trigrams Revolving Heaven. Afterward, this character deals 5 less damage for 2 turns.",
                            "onExpireEffects": [
                                {
                                    "type": "apply_status",
                                    "statusId": "hyuuga_hanabi_revolving_heaven_debuff",
                                    "duration": 2,
                                    "metadata": {
                                        "harmful": true,
                                        "damageDebuffFlat": 5,
                                        "tooltipText": "This character deals 5 less damage from Eight Trigrams Revolving Heaven."
                                    }
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "hyuuga-hanabi-unyielding-tenacity",
                "name": "Unyielding Tenacity",
                "skillimage": "https://i.imgur.com/8EqBz4y.png",
                "skilldescription": "For 2 turns, Hyuuga Hanabi will be unable to be killed and will ignore all enemy stun effects. During this time, 'Hanabi Gentle Fist' and 'Hanabi Eight Trigrams Revolving Heaven' will cost 1 random energy instead and Hyuuga Hanabi will deal 5 additional damage.",
                "energy": [
                    "Random",
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
                        "statusId": "hyuuga_hanabi_unyielding_tenacity",
                        "duration": 2,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "minimumHp": 1,
                            "cannotBeStunned": true,
                            "stunImmune": true,
                            "damageBonusFlat": 5,
                            "skillCostOverridesBySkillId": {
                                "hyuuga-hanabi-gentle-fist": {
                                    "energy": [
                                        "Random"
                                    ]
                                },
                                "hyuuga-hanabi-eight-trigrams-revolving-heaven": {
                                    "energy": [
                                        "Random"
                                    ]
                                }
                            },
                            "tooltipText": "Hyuuga Hanabi cannot be killed, ignores enemy stun effects, deals 5 additional damage, and Hanabi Gentle Fist and Hanabi Eight Trigrams Revolving Heaven cost 1 random chakra instead."
                        }
                    }
                ]
            },
            {
                "id": "hyuuga-hanabi-byakugan",
                "name": "Hanabi Byakugan",
                "skillimage": "https://i.imgur.com/BEe5lIp.png",
                "skilldescription": "This skill makes Hyuuga Hanabi invulnerable for 1 turn.",
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
                        "statusId": "hyuuga_hanabi_byakugan_invuln",
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
    {
        "id": "teuchi",
        "characterId": "teuchi",
        "name": "Teuchi",
        "facePicture": "deadcharacter-remaster.png?v=2",
        "characterdeescription": "Teuchi is a citizen of the Hidden Leaf Village and the owner of Ramen Ichiraku. As a teenager, Teuchi devoted his life to making ramen, what undoubtedly makes him the most important character from the Naruto franchise. ORIGINAL DESIGN: Alexandre",
        "requiredMissionId": null,
        "skills": [
            {
                "id": "teuchi-stick-throw",
                "name": "Stick Throw",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "Teuchi deals 20 damage to one enemy.",
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
                        "type": "damage",
                        "amount": 20,
                        "scope": "target"
                    }
                ]
            },
            {
                "id": "teuchi-ramen",
                "name": "Ramen",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "Teuchi heals his allies for 15 health and gains 20 points of destructible defense for 1 turn.",
                "energy": [
                    "Random",
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
                        "type": "heal",
                        "amount": 15,
                        "scope": "all-allies"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "teuchi_ramen_defense",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "destructibleDefensePoints": 20,
                            "tooltipText": "Teuchi has 20 points of destructible defense."
                        }
                    }
                ]
            },
            {
                "id": "teuchi-ramen-ichiraku-open",
                "name": "Ramen Ichiraku: Open",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "Teuchi targets all his allies. For the rest of the game, everytime an ally uses a new skill, 'Ramen' will heal 5 additional health permanently. This skill stacks and ends if Teuchi dies.",
                "energy": [],
                "target": "all-allies",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "teuchi_ramen_open",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "permanent": true,
                            "ongoingClass": "action",
                            "tooltipText": "Everytime an ally uses a new skill, Ramen will heal 5 additional health permanently."
                        }
                    }
                ]
            },
            {
                "id": "teuchi-ramen-ichiraku-closed",
                "name": "Ramen Ichiraku: Closed",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "This skill makes Teuchi invulnerable for 1 turn, heals him for 35 health and ends 'Ramen Ichiraku: Open' on his team.",
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
                    },
                    {
                        "type": "heal",
                        "amount": 35,
                        "scope": "self"
                    },
                    {
                        "type": "cleanse_statuses",
                        "scope": "self",
                        "statusId": "teuchi_ramen_open"
                    }
                ]
            }
        ]
    },
    {
        "id": "young-minato",
        "characterId": "young-minato",
        "name": "Young Minato",
        "facePicture": "deadcharacter-remaster.png?v=2",
        "characterdeescription": "Minato is a prodigy kid from the Hidden Leaf Village who is capable of fighting other shinobi in higher ranks by having faster and stronger taijutsu skills. He entered the Hidden Leaf's Academy with the dream of earning the villagers' respect and recognition by becoming Hokage. ORIGINAL DESIGN: Liann",
        "requiredMissionId": null,
        "skills": [
            {
                "id": "young-minato-speedy-flanker",
                "name": "Speedy Flanker",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "Young Minato deals 25 damage to one enemy. If Young Minato's health is at 40 or below, this skill will also stun the enemy for 1 turn. This skill cannot be countered.",
                "energy": [
                    "Taijutsu"
                ],
                "target": "single-enemy",
                "cannotBeCountered": true,
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Physical",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 25,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "young_minato_speedy_flanker_stun",
                        "duration": 1,
                        "scope": "target",
                        "condition": {
                            "scope": "self",
                            "sourceCurrentHpAtMost": 40
                        },
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkills": true,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character is stunned for 1 turn by Speedy Flanker if Young Minato is at 40 HP or below."
                        }
                    }
                ]
            },
            {
                "id": "young-minato-night-saviour",
                "name": "Night Saviour",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "Young Minato removes all harmful skills from one ally and makes them invulnerable for 1 turn. If 'Highground Watcher' was used the previous turn, this invulnerability will last 2 turns instead.",
                "energy": [
                    "Random"
                ],
                "target": "single-ally",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "cleanse_statuses",
                        "scope": "target",
                        "metadata": {
                            "cleanseHarmfulOnly": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "invulnerable",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "invulnerable": true,
                            "tooltipText": "This character is invulnerable."
                        }
                    }
                ]
            },
            {
                "id": "young-minato-night-crawler",
                "name": "Night Crawler",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "One random enemy will have 'Speedy Flanker' applied on them. One random ally will have 'Night Saviour' applied on them. These skills' conditional effects won't trigger this way. This skill cannot be countered or reflected.",
                "energy": [
                    "Taijutsu"
                ],
                "target": "self",
                "cannotBeCountered": true,
                "cannotBeReflected": true,
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 25,
                        "scope": "random-enemy"
                    },
                    {
                        "type": "cleanse_statuses",
                        "scope": "random-ally",
                        "metadata": {
                            "cleanseHarmfulOnly": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "invulnerable",
                        "duration": 1,
                        "scope": "random-ally",
                        "metadata": {
                            "invulnerable": true,
                            "tooltipText": "This character is invulnerable."
                        }
                    }
                ]
            },
            {
                "id": "young-minato-highground-watcher",
                "name": "Highground Watcher",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "This skill makes Young Minato invulnerable for 1 turn.",
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
                    },
                    {
                        "type": "apply_status",
                        "statusId": "young_minato_highground_watcher_primed",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "young-kushina",
        "characterId": "young-kushina",
        "name": "Young Kushina",
        "facePicture": "deadcharacter-remaster.png?v=2",
        "characterdeescription": "Kushina is a kunoichi from the Hidden Leaf Village originated from the Hidden Eddy Village's Uzumaki Clan. Due to her special origins, Kushina has a red colored hair that constantly puts her into trouble. ORIGINAL DESIGN: TheDarkLegend",
        "requiredMissionId": null,
        "skills": [
            {
                "id": "young-kushina-red-hot-habanero-rage",
                "name": "Red-Hot Habanero Rage",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "Young Kushina gains 1 random energy. For 4 turns, Young Kushina gains 20 points of destructible defense and ignores enemy stun effects.",
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
                        "type": "gain_chakra",
                        "amount": 1,
                        "scope": "self"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "young_kushina_habanero_rage",
                        "duration": 4,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "destructibleDefensePoints": 20,
                            "stunImmune": true,
                            "cannotBeStunned": true,
                            "tooltipText": "Young Kushina has 20 points of destructible defense and ignores enemy stun effects for 4 turns."
                        }
                    }
                ]
            },
            {
                "id": "young-kushina-fierce-punch",
                "name": "Fierce Punch",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "Young Kushina destroys all of one enemy's destructible defense and then deals 20 damage to them. The following turn, 'Dropping Kick' will deal 20 additional damage and will first destroy its target's destructible defense.",
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
                            "clearDestructibleDefenseFirst": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "young_kushina_fierce_punch_buff",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            },
            {
                "id": "young-kushina-dropping-kick",
                "name": "Dropping Kick",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "Young Kushina deals 10 damage to one enemy and stuns their non-strategic skills for 1 turn. The following turn, 'Fierce Punch' will deal 10 additional damage and will stun its target's non-strategic skills for 1 turn.",
                "energy": [
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
                        "type": "damage",
                        "amount": 10,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "young_kushina_dropping_kick_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseNonStrategicSkills": true,
                            "cannotUseSkillClasses": [
                                "physical",
                                "ninjutsu",
                                "mental",
                                "affliction"
                            ],
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character's non-strategic skills are stunned for 1 turn."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "young_kushina_dropping_kick_buff",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            },
            {
                "id": "young-kushina-skilled-landing",
                "name": "Skilled Landing",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "This skill makes Young Kushina invulnerable for 1 turn.",
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
    {
        "id": "young-itachi",
        "characterId": "young-itachi",
        "name": "Young Itachi",
        "facePicture": "deadcharacter-remaster.png?v=2",
        "characterdeescription": "The first child born to Uchiha Mikoto and Fugaku, Itachi's childhood was marked with violence. The death and destruction he experienced at such a young age traumatised Itachi and made him a pacifist, leading to him training non-stop to achieve his dream of becoming a ninja among ninja in order to erase fighting from the world. ORIGINAL DESIGN: Liann",
        "requiredMissionId": null,
        "skills": [
            {
                "id": "young-itachi-summoning-crow",
                "name": "Summoning: Crow",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "Young Itachi becomes unable to be killed for 1 turn and grants 1 crow stack to all enemies. For the rest of the game, everytime they use a new harmful skill, they will gain 1 crow stack. This skill can be used while active to make Young Itachi unable to be killed for 1 turn. This skill cannot be removed.",
                "energy": [],
                "target": "self",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "young_itachi_crow_unreachable",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "minimumHp": 1,
                            "tooltipText": "Young Itachi cannot be killed."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "young_itachi_crow_stack",
                        "duration": 99,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "permanent": true,
                            "addCrowStackOnHarmfulSkillUse": true,
                            "tooltipText": "This character has Crow Stacks."
                        }
                    }
                ]
            },
            {
                "id": "young-itachi-demonic-illusion-mirage-crow",
                "name": "Demonic Illusion: Mirage Crow",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "For 1 turn, Young Itachi reduces all enemies' non-affliction damage by 0, increased by 5 for each crow stack they have.",
                "energy": [
                    "Genjutsu"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "young_itachi_mirage_crow_debuff",
                        "duration": 1,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "damageDebuffFlatPerCrowStack": 5,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character's non-affliction damage is reduced by 5 for each Crow Stack."
                        }
                    }
                ]
            },
            {
                "id": "young-itachi-illusion-walking-unseen-step",
                "name": "Illusion Walking: Unseen Step",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "Young Itachi deals 0 piercing damage to one enemy, increased by 10 for each crow stack they have.",
                "energy": [
                    "Taijutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Mental",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 0,
                        "scope": "target",
                        "metadata": {
                            "amountPerCrowStackOnTarget": 10,
                            "afflictionDamage": true,
                            "ignoreDamageReduction": true,
                            "ignoreDestructibleDefense": true
                        }
                    }
                ]
            },
            {
                "id": "young-itachi-expert-retreat",
                "name": "Expert Retreat",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "This skill makes Young Itachi invulnerable for 1 turn.",
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
    {
        "id": "young-yahiko",
        "characterId": "young-yahiko",
        "name": "Young Yahiko",
        "facePicture": "deadcharacter-remaster.png?v=2",
        "characterdeescription": "The Rain Orphans were three children who lost their parents due to the Hidden Rain Village's involvement in the Second Shinobi World War. Yahiko is a stoic boy who leads his team in the fight for the survival during the war. ORIGINAL DESIGN: Liann",
        "requiredMissionId": null,
        "skills": [
            {
                "id": "young-yahiko-water-release-wild-water-wave",
                "name": "Water Release: Wild Water Wave",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "Young Yahiko deals 5 damage to one enemy for 3 turns. During this time, if 'Lateral Kick' or 'Descending Fist' are used on this enemy, they will deal 5 additional damage and will also make this enemy deal 5 less non-affliction damage for 3 turns. This effect stacks.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Ninjutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "young_yahiko_wild_water_wave",
                        "duration": 3,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 5,
                            "turnEndTrigger": "source_turn",
                            "turnDurationAnchor": "source_turn",
                            "ongoingClass": "action",
                            "tooltipText": "This character takes 5 damage each turn from Wild Water Wave for 3 turns."
                        }
                    }
                ]
            },
            {
                "id": "young-yahiko-lateral-kick",
                "name": "Lateral Kick",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "Young Yahiko deals 20 damage to one enemy. For 1 turn, if this enemy uses a new physical or strategic skill, they will take 15 damage.",
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
                        "type": "apply_status",
                        "statusId": "young_yahiko_lateral_kick_trap",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "triggerOnEnemyPhysicalOrStrategicSkill": true,
                            "counterDamage": 15,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "If this character uses a new physical or strategic skill, they will take 15 damage."
                        }
                    }
                ]
            },
            {
                "id": "young-yahiko-descending-fist",
                "name": "Descending Fist",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "Young Yahiko deals 25 damage to one enemy and becomes invulnerable to physical skills for 1 turn.",
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
                        "amount": 25,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "young_yahiko_physical_immunity",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "ignoreEnemyPhysicalDamage": true,
                            "tooltipText": "Young Yahiko is invulnerable to physical skills for 1 turn."
                        }
                    }
                ]
            },
            {
                "id": "young-yahiko-in-the-shadows",
                "name": "In the Shadows",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "This skill makes Young Yahiko invulnerable for 1 turn.",
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
            },
            {
                "id": "young-yahiko-the-rain-orphans",
                "name": "The Rain Orphans",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "Everytime a character uses 'Lateral Kick', 'Winding Paper Shuriken' or 'Rinnegan Domination' while having 15 or less health, the other 2 mentioned skills will also be applied on the enemy target.",
                "energy": [],
                "target": "self",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Passive"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "the_rain_orphans_passive",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "permanent": true,
                            "rainOrphansPassive": true,
                            "tooltipText": "Everytime a character uses Lateral Kick, Winding Paper Shuriken, or Rinnegan Domination while having 15 or less health, the other 2 mentioned skills will also be applied on the enemy target."
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "young-konan",
        "characterId": "young-konan",
        "name": "Young Konan",
        "facePicture": "deadcharacter-remaster.png?v=2",
        "characterdeescription": "The Rain Orphans were three children who lost their parents due to the Hidden Rain Village's involvement in the Second Shinobi World War. Konan is a sweet girl who is always caring about her teammates more than about herself. ORIGINAL DESIGN: Liann",
        "requiredMissionId": null,
        "skills": [
            {
                "id": "young-konan-paper-shuriken-preparation",
                "name": "Paper Shuriken Preparation",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "Until 'Winding Paper Shuriken' is used, Young Konan will deal 10 piercing damage instantly to any enemy who uses a new skill on her and during this time, everytime an enemy does so, 'Winding Paper Shuriken' will deal 10 additional damage the next time it's used. This effect stacks. This skill does not stack and will re-apply itself.",
                "energy": [],
                "target": "self",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Physical",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "young_konan_paper_shuriken_preparation",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "permanent": true,
                            "counterOnEnemySkillTargetingSelf": true,
                            "counterDamagePiercing": 10,
                            "incrementShurikenDamagePerHit": 10,
                            "tooltipText": "Until Winding Paper Shuriken is used, deals 10 piercing damage instantly to any enemy using a skill on Konan."
                        }
                    }
                ]
            },
            {
                "id": "young-konan-winding-paper-shuriken",
                "name": "Winding Paper Shuriken",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "Young Konan deals 20 piercing damage to one enemy and makes them ignore healing effects for 1 turn.",
                "energy": [
                    "Bloodline"
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
                            "afflictionDamage": true,
                            "ignoreDamageReduction": true,
                            "ignoreDestructibleDefense": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "young_konan_ignore_healing",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "healReceivedMultiplier": 0,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character ignores healing effects for 1 turn."
                        }
                    }
                ]
            },
            {
                "id": "young-konan-origami-rose",
                "name": "Origami Rose",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "Young Konan grants one ally 35 points of permanent destructible defense that stacks. If this skill is already active on them, they will also be unable to be killed for 2 turns.",
                "energy": [
                    "Bloodline"
                ],
                "target": "single-ally",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "young_konan_origami_rose",
                        "duration": 99,
                        "scope": "target",
                        "metadata": {
                            "helpful": true,
                            "permanent": true,
                            "destructibleDefensePoints": 35,
                            "mergeNumericAddKeys": [
                                "destructibleDefensePoints"
                            ],
                            "tooltipText": "This character has 35 points of permanent destructible defense."
                        }
                    }
                ]
            },
            {
                "id": "young-konan-in-the-shadows",
                "name": "In the Shadows",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "This skill makes Young Konan invulnerable for 1 turn.",
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
            },
            {
                "id": "young-konan-the-rain-orphans",
                "name": "The Rain Orphans",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "Everytime a character uses 'Lateral Kick', 'Winding Paper Shuriken' or 'Rinnegan Domination' while having 15 or less health, the other 2 mentioned skills will also be applied on the enemy target.",
                "energy": [],
                "target": "self",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Passive"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "the_rain_orphans_passive",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "permanent": true,
                            "rainOrphansPassive": true,
                            "tooltipText": "Everytime a character uses Lateral Kick, Winding Paper Shuriken, or Rinnegan Domination while having 15 or less health, the other 2 mentioned skills will also be applied on the enemy target."
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "young-nagato",
        "characterId": "young-nagato",
        "name": "Young Nagato",
        "facePicture": "deadcharacter-remaster.png?v=2",
        "characterdeescription": "The Rain Orphans were three children who lost their parents due to the Hidden Rain Village's involvement in the Second Shinobi World War. Nagato is a quiet boy who is not only afraid of the world, but also afraid of himself. ORIGINAL DESIGN: Liann",
        "requiredMissionId": null,
        "skills": [
            {
                "id": "young-nagato-wind-release-gale-palm",
                "name": "Wind Release: Gale Palm",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "This skill can be used on an enemy or on an ally. If used on an enemy, they will take 20 damage and then the invulnerability effects of their new skills will last 1 less turn for 2 turns. If used on an ally, that character will deal 10 additional damage with physical and energy skills for 2 turns.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Ninjutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 20,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "young_nagato_gale_palm_debuff",
                        "duration": 2,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "invulnerabilityDurationReduction": 1,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "The invulnerability effects of this character's new skills will last 1 less turn for 2 turns."
                        }
                    }
                ]
            },
            {
                "id": "young-nagato-rinnegan-domination",
                "name": "Rinnegan Domination",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "Young Nagato deals 20 piercing damage to one enemy. This skill ignores invulnerability and cannot be countered or reflected.",
                "energy": [
                    "Random"
                ],
                "target": "single-enemy",
                "cannotBeCountered": true,
                "cannotBeReflected": true,
                "ignoreInvulnerability": true,
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
                        "scope": "target",
                        "metadata": {
                            "afflictionDamage": true,
                            "ignoreDamageReduction": true,
                            "ignoreDestructibleDefense": true
                        }
                    }
                ]
            },
            {
                "id": "young-nagato-minor-almighty-push",
                "name": "Minor Almighty Push",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "Young Nagato grants his team 10 points of unpierceable damage reduction for 1 turn. This effect is applied again for every 20 health Young Nagato has lost.",
                "energy": [
                    "Genjutsu"
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
                        "statusId": "young_nagato_minor_almighty_push",
                        "duration": 1,
                        "scope": "all-allies",
                        "metadata": {
                            "helpful": true,
                            "unpierceableDamageReductionFlat": 10,
                            "amountFromSourceMissingHpStep": 10,
                            "amountFromSourceMissingHpDivisor": 20,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character has 10 points of unpierceable damage reduction for 1 turn (increased by 10 for every 20 health Nagato has lost)."
                        }
                    }
                ]
            },
            {
                "id": "young-nagato-in-the-shadows",
                "name": "In the Shadows",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "This skill makes Young Nagato invulnerable for 1 turn.",
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
            },
            {
                "id": "young-nagato-the-rain-orphans",
                "name": "The Rain Orphans",
                "skillimage": "deadcharacter-remaster.png?v=2",
                "skilldescription": "Everytime a character uses 'Lateral Kick', 'Winding Paper Shuriken' or 'Rinnegan Domination' while having 15 or less health, the other 2 mentioned skills will also be applied on the enemy target.",
                "energy": [],
                "target": "self",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Passive"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "the_rain_orphans_passive",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "permanent": true,
                            "rainOrphansPassive": true,
                            "tooltipText": "Everytime a character uses Lateral Kick, Winding Paper Shuriken, or Rinnegan Domination while having 15 or less health, the other 2 mentioned skills will also be applied on the enemy target."
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "umino-iruka",
        "characterId": "umino-iruka",
        "name": "Umino Iruka",
        "facePicture": "https://i.imgur.com/snz8zD4.png",
        "characterdeescription": "An instructor for Konoha, Iruka is a caring man who has acted like something of a father and mentor to Naruto throughout his youth. Iruka fights with his allies in mind, preferring to protect them and help them as support.",
        "requiredMissionId": "duty-of-a-sensei",
        "skills": [
            {
                "id": "umino-iruka-shuriken-throw",
                "name": "Shuriken Throw",
                "skillimage": "https://i.imgur.com/LmS1XVp.png",
                "skilldescription": "Umino Iruka deals 20 damage to one enemy and 10 additional damage for each 25 health Umino Iruka has lost.",
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
                            "amountFromSourceMissingHpStep": 10,
                            "amountFromSourceMissingHpDivisor": 25
                        }
                    }
                ]
            },
            {
                "id": "umino-iruka-ally-shield",
                "name": "Ally Shield",
                "skillimage": "https://i.imgur.com/KCALU7E.png",
                "skilldescription": "Umino Iruka makes one ally invulnerable for 1 turn.",
                "energy": [
                    "Random"
                ],
                "target": "single-ally",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "invulnerable",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "helpful": true,
                            "invulnerable": true,
                            "tooltipText": "This character is invulnerable."
                        }
                    }
                ]
            },
            {
                "id": "umino-iruka-sealed-bomb-square-release",
                "name": "Sealed Bomb Square Release",
                "skillimage": "https://i.imgur.com/TeDfWJB.png",
                "skilldescription": "Umino Iruka targets one enemy. The following turn, if that enemy uses a new harmful skill, they will take 40 damage that ignores invulnerability, and for 1 turn they will take 25 additional damage from physical and chakra skills. This skill is invisible.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Strategic",
                    "Ninjutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "iruka_sealed_bomb_trap",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "hideTooltipFromUnitOwner": true,
                            "triggerOnEnemyHarmfulSkill": true,
                            "counterDamage": 40,
                            "counterDamageIgnoresReduction": true,
                            "counterDamageIgnoresDestructibleDefense": true,
                            "counterStatusId": "iruka_sealed_bomb_vulnerability",
                            "counterStatusDuration": 1,
                            "counterStatusMetadata": {
                                "harmful": true,
                                "damageTakenBonusBySkillClass": {
                                    "physical": 25,
                                    "energy": 25
                                },
                                "tooltipText": "This character takes 25 additional damage from physical and chakra skills from Sealed Bomb Square Release."
                            },
                            "tooltipText": "If this character uses a new harmful skill, they will take 40 damage from Sealed Bomb Square Release and take 25 additional damage from physical and chakra skills.",
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            },
            {
                "id": "umino-iruka-iruka-parry",
                "name": "Iruka Parry",
                "skillimage": "https://i.imgur.com/EhxgxK3.png",
                "skilldescription": "This skill makes Umino Iruka invulnerable for 1 turn.",
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
    {
        "id": "mizuki",
        "characterId": "mizuki",
        "name": "Mizuki",
        "facePicture": "https://i.imgur.com/NZS59L7.png",
        "characterdeescription": "An instructor for Konoha, Mizuki is a chuunin and old friend of Iruka that over time grew jealous and petty. While Mizuki doesn't have any special abilities, he knows to instead be patient, and wait until the right time to strike.",
        "requiredMissionId": "a-dishonored-shinobi",
        "skills": [
            {
                "id": "mizuki-kunai-assault",
                "name": "Kunai Assault",
                "skillimage": "https://i.imgur.com/FZHixlO.png",
                "skilldescription": "Mizuki deals 10 piercing damage to one enemy for 3 turns. This skill stacks.",
                "energy": [
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Physical",
                    "Action"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "mizuki_kunai_assault",
                        "duration": 3,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 10,
                            "turnEndTrigger": "source_turn",
                            "turnDurationAnchor": "source_turn",
                            "ongoingClass": "action",
                            "ignoreTargetDamageReduction": true,
                            "triggerOnApply": true,
                            "mergeNumericAddKeys": [
                                "turnEndDamage"
                            ],
                            "tooltipText": "This character takes 10 piercing damage from Kunai Assault."
                        }
                    }
                ]
            },
            {
                "id": "mizuki-execution-shuriken",
                "name": "Execution Shuriken",
                "skillimage": "https://i.imgur.com/sqwpwQd.png",
                "skilldescription": "Mizuki deals 20 damage to one enemy and 10 additional damage for each 20 health they have lost. This skill can only be used twice.",
                "energy": [
                    "Taijutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "maxUses": 2,
                "baseSkillId": "mizuki-execution-shuriken",
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
                            "amountFromTargetMissingHpStep": 10,
                            "amountFromTargetMissingHpDivisor": 20
                        }
                    }
                ]
            },
            {
                "id": "mizuki-genjutsu-ambush-tactics",
                "name": "Genjutsu Ambush Tactics",
                "skillimage": "https://i.imgur.com/I4EX3j3.png",
                "skilldescription": "After 1 turn, Mizuki will become invulnerable, 'Kunai Assault' will deal 30 damage instantly and lower the target's non-affliction damage by 5, and 'Execution Shuriken' will deal 30 additional damage for 1 turn. This skill is invisible the first turn and will end if Mizuki receives new non-affliction damage.",
                "energy": [
                    "Genjutsu"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "mizuki_ambush_priming",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "hideTooltipFromEnemy": true,
                            "turnDurationAnchor": "any_turn",
                            "removeStatusIdsOnNewNonAfflictionDamage": [
                                "mizuki_ambush_priming"
                            ],
                            "onExpireApplyStatusToSelf": {
                                "statusId": "mizuki_ambush_ready",
                                "duration": 1,
                                "metadata": {
                                    "helpful": true,
                                    "invulnerable": true,
                                    "skillReplacements": {
                                        "mizuki-kunai-assault": "mizuki-kunai-assault-empowered",
                                        "mizuki-execution-shuriken": "mizuki-execution-shuriken-empowered"
                                    },
                                    "tooltipText": "Mizuki is invulnerable. 'Kunai Assault' deals instant damage and lowers damage, and 'Execution Shuriken' deals additional damage."
                                }
                            },
                            "tooltipText": "Mizuki is preparing an ambush."
                        }
                    }
                ]
            },
            {
                "id": "mizuki-effortless-side-step",
                "name": "Effortless Side-Step",
                "skillimage": "https://i.imgur.com/Lt7IMdA.png",
                "skilldescription": "This skill makes Mizuki invulnerable for 1 turn.",
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
            },
            {
                "id": "mizuki-kunai-assault-empowered",
                "name": "Kunai Assault",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/FZHixlO.png",
                "skilldescription": "Mizuki deals 30 piercing damage to one enemy instantly. For 1 turn, this enemy will deal 5 less non-affliction damage.",
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
                        "amount": 30,
                        "scope": "target",
                        "metadata": {
                            "ignoreDestructibleDefense": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "mizuki_empowered_kunai_assault_damage_debuff",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "NonAfflictionDamageDebuff": 5,
                            "tooltipText": "This character deals 5 less non-affliction damage.",
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            },
            {
                "id": "mizuki-execution-shuriken-empowered",
                "name": "Execution Shuriken",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/sqwpwQd.png",
                "skilldescription": "Mizuki deals 50 damage to one enemy and 10 additional damage for each 20 health they have lost.",
                "energy": [
                    "Taijutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "maxUses": 2,
                "baseSkillId": "mizuki-execution-shuriken",
                "classes": [
                    "Physical",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 50,
                        "scope": "target",
                        "metadata": {
                            "amountFromTargetMissingHpStep": 10,
                            "amountFromTargetMissingHpDivisor": 20
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "demon-brothers",
        "characterId": "demon-brothers",
        "name": "Demon Brothers",
        "facePicture": "https://i.imgur.com/ekQ5QZR.png",
        "characterdeescription": "A duo of Mist ninja who work for Zabuza, the Demon Brothers specialize in assassinating their targets with their shuriken chain. Using their weapons and teamwork, the Demon Brothers can gang up on one enemy, disable him, and then kill him.",
        "requiredMissionId": "mist-ascendant",
        "skills": [
            {
                "id": "demon-brothers-chain-wrap",
                "name": "Chain Wrap",
                "skillimage": "https://i.imgur.com/qm5cAjZ.png",
                "skilldescription": "Demon Brothers stun one enemy's physical, mental, and strategic skills for 1 turn and bind them with chains for 2 turns. The following turn, this skill will be replaced by 'Chain Shred'.",
                "energy": [
                    "Taijutsu"
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
                        "statusId": "demon_brothers_chain_wrap_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "cannotUseSkillClasses": [
                                "physical",
                                "mental",
                                "strategic"
                            ],
                            "tooltipText": "This character's physical, mental, and strategic skills are stunned."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "demon_brothers_bound_by_chain",
                        "duration": 2,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "tooltipText": "This character is bound by Demon Brothers' chains."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "demon_brothers_chain_wrap_ready",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillReplacements": {
                                "demon-brothers-chain-wrap": "demon-brothers-chain-shred"
                            },
                            "tooltipText": "Chain Wrap is replaced by Chain Shred."
                        }
                    }
                ]
            },
            {
                "id": "demon-brothers-bladed-gauntlet",
                "name": "Bladed Gauntlet",
                "skillimage": "https://i.imgur.com/SjVUKDT.png",
                "skilldescription": "Demon Brothers deal 25 damage to one enemy. If this skill is used on an enemy affected by 'Chain Wrap' or 'Bound by Chain', it will deal 10 additional damage and Demon Brothers will gain 10 destructible defense.",
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
                        "amount": 25,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "statusIdsAny": [
                                "demon_brothers_bound_by_chain",
                                "demon_brothers_chain_wrap_stun"
                            ],
                            "conditionalAmount": 35
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "demon_brothers_bladed_gauntlet_defense",
                        "duration": 99,
                        "scope": "self",
                        "condition": {
                            "scope": "target",
                            "statusIdsAny": [
                                "demon_brothers_bound_by_chain",
                                "demon_brothers_chain_wrap_stun"
                            ]
                        },
                        "metadata": {
                            "helpful": true,
                            "destructibleDefensePoints": 10,
                            "mergeNumericAddKeys": [
                                "destructibleDefensePoints"
                            ],
                            "tooltipText": "Demon Brothers have 10 points of destructible defense from Bladed Gauntlet."
                        }
                    }
                ]
            },
            {
                "id": "demon-brothers-water-melding",
                "name": "Water Melding",
                "skillimage": "https://i.imgur.com/ogryqGA.png",
                "skilldescription": "Demon Brothers gain 15 points of permanent destructible defense and 1 green chakra.",
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
                        "statusId": "demon_brothers_water_melding_defense",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "destructibleDefensePoints": 15,
                            "mergeNumericAddKeys": [
                                "destructibleDefensePoints"
                            ],
                            "tooltipText": "Demon Brothers have 15 points of permanent destructible defense from Water Melding."
                        }
                    },
                    {
                        "type": "gain_chakra",
                        "amount": 1,
                        "chakraType": "taijutsu",
                        "scope": "self"
                    }
                ]
            },
            {
                "id": "demon-brothers-vanish",
                "name": "Vanish",
                "skillimage": "https://i.imgur.com/1LmsPwX.png",
                "skilldescription": "This skill makes Demon Brothers invulnerable for 1 turn.",
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
            },
            {
                "id": "demon-brothers-chain-shred",
                "name": "Chain Shred",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/TZmKHyi.png",
                "skilldescription": "Demon Brothers target one enemy affected by 'Chain Wrap', dealing 40 piercing damage to them and re-applying 'Chain Wrap' on them.",
                "energy": [
                    "Taijutsu"
                ],
                "target": "single-enemy",
                "targetCondition": {
                    "statusId": "demon_brothers_chain_wrap_stun"
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
                        "amount": 40,
                        "scope": "target",
                        "metadata": {
                            "ignoreDestructibleDefense": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "demon_brothers_bound_by_chain",
                        "duration": 2,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "tooltipText": "This character is bound by Demon Brothers' chains."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "demon_brothers_chain_wrap_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "cannotUseSkillClasses": [
                                "physical",
                                "mental",
                                "strategic"
                            ],
                            "tooltipText": "This character's physical, mental, and strategic skills are stunned."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "demon_brothers_chain_wrap_ready",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillReplacements": {
                                "demon-brothers-chain-wrap": "demon-brothers-chain-shred"
                            },
                            "tooltipText": "Chain Wrap is replaced by Chain Shred."
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "haku",
        "characterId": "haku",
        "name": "Haku",
        "facePicture": "https://i.imgur.com/1iuyTS5.png",
        "requiredMissionId": "hidden-hunter",
        "shopPrice": 500,
        "characterdeescription": "The sole survivor of the Yuki clan, and the subordinate of Zabuza; Haku, despite being young, holds enough potential strength to surpass almost any ninja. Using his ice based bloodline, and his intelligence, Haku can attack and defend nearly simultaneously.",
        "skills": [
            {
                "id": "haku-flying-water-needles-of-death",
                "name": "Flying Water Needles of Death",
                "skillimage": "https://i.imgur.com/DaN3ECR.png",
                "skilldescription": "Haku deals 30 damage to one enemy. During 'Demonic Mirroring Ice Crystals', this skill targets all enemies.",
                "energy": [
                    "Bloodline",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 30,
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
                "id": "haku-acupuncture",
                "name": "Acupuncture",
                "skillimage": "https://i.imgur.com/dDxetJr.png",
                "skilldescription": "Haku targets one enemy, stunning them and making them unable to reduce damage or become invulnerable for 1 turn. During 'Demonic Mirroring Ice Crystals', this skill targets all enemies and costs 1 additional random chakra. This skill ignores invulnerability.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "ignoreInvulnerability": true,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "haku_acupuncture_debuff",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkills": true,
                            "cannotReduceDamage": true,
                            "cannotBecomeInvulnerable": true,
                            "tooltipText": "This character is stunned and cannot reduce damage or become invulnerable.",
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            },
            {
                "id": "haku-demonic-mirroring-ice-crystals",
                "name": "Demonic Mirroring Ice Crystals",
                "skillimage": "https://i.imgur.com/2sgPkS0.png",
                "skilldescription": "Haku becomes invulnerable for 3 turns. While active, 'Flying Water Needles of Death' will target all enemies, and 'Acupuncture' will target all enemies and cost 1 additional random chakra.",
                "energy": [
                    "Bloodline",
                    "Ninjutsu"
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
                        "statusId": "haku_demonic_mirroring_ice_crystals",
                        "duration": 3,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "invulnerable": true,
                            "skillReplacements": {
                                "haku-flying-water-needles-of-death": "haku-flying-water-needles-of-death-empowered",
                                "haku-acupuncture": "haku-acupuncture-empowered"
                            },
                            "tooltipText": "Haku is invulnerable.\nFlying Water Needles of Death targets all enemies.\nAcupuncture targets all enemies.\nAcupuncture costs 1 additional random chakra."
                        }
                    }
                ]
            },
            {
                "id": "haku-needle-parry",
                "name": "Needle Parry",
                "skillimage": "https://i.imgur.com/0qDDVuG.png",
                "skilldescription": "This skill makes Haku invulnerable for 1 turn.",
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
                        "statusId": "haku_needle_parry_invulnerable",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "invulnerable": true,
                            "tooltipText": "Haku is invulnerable for 1 turn."
                        }
                    }
                ]
            },
            {
                "id": "haku-flying-water-needles-of-death-empowered",
                "hiddenFromSelectionViewer": true,
                "name": "Flying Water Needles of Death",
                "skillimage": "https://i.imgur.com/DaN3ECR.png",
                "skilldescription": "Haku deals 30 damage to all enemies during 'Demonic Mirroring Ice Crystals'.",
                "energy": [
                    "Bloodline",
                    "Random"
                ],
                "target": "all-enemy",
                "damage": 30,
                "cooldown": 0,
                "classes": [
                    "Physical",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 30,
                        "scope": "all-enemy"
                    }
                ]
            },
            {
                "id": "haku-acupuncture-empowered",
                "hiddenFromSelectionViewer": true,
                "name": "Acupuncture",
                "skillimage": "https://i.imgur.com/dDxetJr.png",
                "skilldescription": "Haku targets all enemies during 'Demonic Mirroring Ice Crystals', stunning them and making them unable to reduce damage or become invulnerable for 1 turn. This skill ignores invulnerability.",
                "energy": [
                    "Ninjutsu",
                    "Random"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 1,
                "ignoreInvulnerability": true,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "haku_acupuncture_debuff",
                        "duration": 1,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkills": true,
                            "cannotReduceDamage": true,
                            "cannotBecomeInvulnerable": true,
                            "tooltipText": "This character is stunned and cannot reduce damage or become invulnerable.",
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "momochi-zabuza",
        "characterId": "momochi-zabuza",
        "name": "Momochi Zabuza",
        "facePicture": "https://i.imgur.com/8OoPNPv.png",
        "characterdeescription": "Zabuza is a missing-nin from the Hidden Mist Village that specializes in silent assassination. Using the various ninjutsu abilities Zabuza has, he is able to attack his enemies all at once, or stealthily try to kill them.",
        "requiredMissionId": "devotion",
        "skills": [
            {
                "id": "momochi-zabuza-soundless-murder",
                "name": "Soundless Murder",
                "skillimage": "https://i.imgur.com/74KvAbq.png",
                "skilldescription": "Momochi Zabuza deals 30 piercing damage to one enemy. During 'Hidden Mist', this skill will deal 15 additional damage and will ignore invulnerability.",
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
                        "scope": "target",
                        "metadata": {
                            "ignoreDestructibleDefense": true
                        }
                    }
                ]
            },
            {
                "id": "momochi-zabuza-water-dragon-missile",
                "name": "Water Dragon Missile",
                "skillimage": "https://i.imgur.com/2l9QztL.png",
                "skilldescription": "Momochi Zabuza deals 15 damage to all enemies and stuns their physical and strategic skills for 1 turn.",
                "energy": [
                    "Ninjutsu",
                    "Random"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Ninjutsu",
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
                        "statusId": "momochi_zabuza_water_dragon_stun",
                        "duration": 1,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkillClasses": [
                                "physical",
                                "strategic"
                            ],
                            "tooltipText": "This character's physical and strategic skills are stunned.",
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            },
            {
                "id": "momochi-zabuza-hidden-mist",
                "name": "Hidden Mist",
                "skillimage": "https://i.imgur.com/7mpGS0U.png",
                "skilldescription": "For 2 turns, all enemies' physical and chakra skills will cost 1 additional random chakra and Momochi Zabuza will gain 5 points of damage reduction. The following 2 turns, 'Soundless Murder' will deal 15 additional damage and will ignore invulnerability. This skill ignores invulnerability.",
                "energy": [
                    "Genjutsu"
                ],
                "target": "self",
                "ignoreInvulnerability": true,
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "momochi_zabuza_hidden_mist_enemy_cost",
                        "duration": 2,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "randomCostIncreaseForSkillClasses": {
                                "physical": 1,
                                "energy": 1,
                                "ninjutsu": 1
                            },
                            "tooltipText": "This character's physical and chakra skills cost 1 additional random chakra from Hidden Mist."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "momochi_zabuza_hidden_mist_defense",
                        "duration": 2,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "damageReductionFlat": 5,
                            "mergeNumericAddKeys": [
                                "damageReductionFlat"
                            ],
                            "onExpireApplyStatusToSelf": {
                                "statusId": "momochi_zabuza_hidden_mist_empowered",
                                "duration": 2,
                                "metadata": {
                                    "helpful": true,
                                    "skillReplacements": {
                                        "momochi-zabuza-soundless-murder": "momochi-zabuza-soundless-murder-empowered"
                                    },
                                    "tooltipText": "'Soundless Murder' deals additional damage and ignores invulnerability."
                                }
                            },
                            "tooltipText": "Momochi Zabuza has 5 damage reduction from Hidden Mist."
                        }
                    }
                ]
            },
            {
                "id": "momochi-zabuza-water-clone-zabuza",
                "name": "Water Clone Zabuza",
                "skillimage": "https://i.imgur.com/nl8kDkS.png",
                "skilldescription": "This skill makes Momochi Zabuza invulnerable for 1 turn.",
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
            },
            {
                "id": "momochi-zabuza-soundless-murder-empowered",
                "name": "Soundless Murder",
                "hiddenFromSelectionViewer": true,
                "skillimage": "deadcharacter.png",
                "skilldescription": "Momochi Zabuza deals 45 piercing damage to one enemy, ignoring invulnerability.",
                "energy": [
                    "Taijutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "ignoreInvulnerability": true,
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Physical",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 45,
                        "scope": "target",
                        "metadata": {
                            "ignoreDestructibleDefense": true
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "oboro",
        "characterId": "oboro",
        "name": "Oboro",
        "facePicture": "https://i.imgur.com/q3FfmTs.png",
        "characterdeescription": "A Rain Genin in the Chuunin exams, Oboro is vindictive ninja that specializes in genjutsu. Using the various illusions that Oboro creates, he is able to hide his true self while attacking from below.",
        "requiredMissionId": "yellow-flash",
        "skills": [
            {
                "id": "oboro-exploding-kunai",
                "name": "Exploding Kunai",
                "skillimage": "https://i.imgur.com/fo853Ic.png",
                "skilldescription": "Oboro deals 15 damage to all enemies and reduces their damage by 5 for 1 turn. During 'Haze Clone', this skill has no cooldown.",
                "energy": [
                    "Random"
                ],
                "target": "all-enemy",
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
                        "scope": "all-enemy"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "oboro_exploding_kunai_debuff",
                        "duration": 1,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "damageDebuffFlat": 5,
                            "mergeNumericAddKeys": [
                                "damageDebuffFlat"
                            ],
                            "tooltipText": "This character deals 5 less damage from Exploding Kunai."
                        }
                    }
                ]
            },
            {
                "id": "oboro-earth-swim",
                "name": "Earth Swim",
                "skillimage": "https://i.imgur.com/8iLEEf6.png",
                "skilldescription": "Oboro deals 20 damage to one enemy and stuns their physical, chakra and affliction skills for 1 turn. During 'Haze Clone', this skill will target all enemies and will cost 1 less random chakra.",
                "energy": [
                    "Genjutsu",
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
                        "amount": 20,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "oboro_earth_swim_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkillClasses": [
                                "physical",
                                "energy",
                                "affliction",
                                "ninjutsu"
                            ],
                            "tooltipText": "This character's physical, chakra and affliction skills are stunned.",
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            },
            {
                "id": "oboro-haze-clone",
                "name": "Haze Clone",
                "skillimage": "https://i.imgur.com/6zjMsdw.png",
                "skilldescription": "Oboro gains 25 points of destructible defense for 2 turns. During this time, 'Exploding Kunai' has no cooldown and 'Earth Swim' will target all enemies.",
                "energy": [
                    "Random"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "oboro_haze_clone",
                        "duration": 2,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "destructibleDefensePoints": 25,
                            "skillReplacements": {
                                "oboro-exploding-kunai": "oboro-exploding-kunai-empowered",
                                "oboro-earth-swim": "oboro-earth-swim-empowered"
                            },
                            "tooltipText": "Oboro has 25 destructible defense. 'Exploding Kunai' has no cooldown and 'Earth Swim' is improved."
                        }
                    }
                ]
            },
            {
                "id": "oboro-hiding-tactics",
                "name": "Oboro Hiding Tactics",
                "skillimage": "https://i.imgur.com/VEOVr6w.png",
                "skilldescription": "This skill makes Oboro invulnerable for 1 turn.",
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
            },
            {
                "id": "oboro-exploding-kunai-empowered",
                "name": "Exploding Kunai",
                "hiddenFromSelectionViewer": true,
                "skillimage": "deadcharacter.png",
                "skilldescription": "Oboro deals 25 damage to all enemies and reduces their damage by 5 for 1 turn during 'Haze Clone'.",
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
                        "amount": 25,
                        "scope": "all-enemy"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "oboro_exploding_kunai_debuff",
                        "duration": 1,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "damageDebuffFlat": 5,
                            "mergeNumericAddKeys": [
                                "damageDebuffFlat"
                            ],
                            "tooltipText": "This character deals 5 less damage from Exploding Kunai.",
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            },
            {
                "id": "oboro-earth-swim-empowered",
                "name": "Earth Swim",
                "hiddenFromSelectionViewer": true,
                "skillimage": "deadcharacter.png",
                "skilldescription": "Oboro deals 20 damage to all enemies, stuns their physical, chakra and affliction skills for 1 turn, and lowers their damage by 5 for 1 turn during 'Haze Clone'.",
                "energy": [
                    "Genjutsu"
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
                        "amount": 20,
                        "scope": "all-enemy"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "oboro_earth_swim_stun",
                        "duration": 1,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkillClasses": [
                                "physical",
                                "energy",
                                "affliction",
                                "ninjutsu"
                            ],
                            "tooltipText": "This character's physical, chakra and affliction skills are stunned.",
                            "turnDurationAnchor": "source_turn"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "oboro_earth_swim_damage_debuff",
                        "duration": 1,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "damageDebuffFlat": 5,
                            "tooltipText": "This character deals 5 less damage.",
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "shigure",
        "characterId": "shigure",
        "name": "Shigure",
        "facePicture": "https://i.imgur.com/n72OXiY.png",
        "characterdeescription": "A genin from the village of rain, Shigure is a strong, but arrogant ninja. Using a number of Umbrellas, Shigure is able to attack all enemies with sharp senbon needles, or focus everything to one enemy.",
        "requiredMissionId": "a-rare-opportunity",
        "skills": [
            {
                "id": "shigure-umbrella-toss",
                "name": "Umbrella Toss",
                "skillimage": "https://i.imgur.com/miNRsh2.png",
                "skilldescription": "For 4 turns, Shigure will have 5 points of damage reduction. During this time, his next 'Needle Barrage' will not consume 'Needle Field'. This skill does not stack.",
                "energy": [
                    "Random"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "shigure_umbrella_toss_active",
                        "duration": 4,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "damageReductionFlat": 5,
                            "replaceSkillDamageBonuses": true,
                            "tooltipText": "Shigure has 5 damage reduction and his next Needle Barrage will not consume Needle Field."
                        }
                    }
                ]
            },
            {
                "id": "shigure-needle-barrage",
                "name": "Needle Barrage",
                "skillimage": "https://i.imgur.com/IonrXRg.png",
                "skilldescription": "Shigure deals 25 damage to one enemy affected by 'Needle Field'. This skill deals 10 additional damage to that target and consumes 'Needle Field' unless 'Umbrella Toss' is active.",
                "energy": [
                    "Random"
                ],
                "target": "single-enemy",
                "targetCondition": {
                    "statusId": "shigure_needle_field"
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
                        "amount": 25,
                        "scope": "target"
                    },
                    {
                        "type": "damage",
                        "amount": 10,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "statusId": "shigure_needle_field"
                        }
                    },
                    {
                        "type": "cleanse_statuses",
                        "scope": "target",
                        "statusId": "shigure_needle_field",
                        "condition": {
                            "scope": "self",
                            "missingStatusId": "shigure_umbrella_toss_active"
                        }
                    }
                ]
            },
            {
                "id": "shigure-sprinkling-needles",
                "name": "Sprinkling Needles",
                "skillimage": "https://i.imgur.com/LOYbNWz.png",
                "skilldescription": "Shigure deals 10 piercing damage to all enemies for 3 turns and applies 'Needle Field' to them. During this time, 'Needle Barrage' can be used on them. This skill cannot be countered.",
                "energy": [
                    "Random",
                    "Random"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 2,
                "cannotBeCountered": true,
                "classes": [
                    "Physical",
                    "Action"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "shigure_sprinkling_needles_mark",
                        "duration": 3,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 10,
                            "turnEndTrigger": "source_turn",
                            "ignoreTargetDamageReduction": true,
                            "tooltipText": "This character takes 10 piercing damage each turn from Sprinkling Needles and can be targeted by Needle Barrage.",
                            "ongoingClass": "action"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "shigure_needle_field",
                        "duration": 3,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "tooltipText": "This character is caught in Needle Field.",
                            "ongoingClass": "action"
                        }
                    }
                ]
            },
            {
                "id": "shigure-umbrella-block",
                "name": "Umbrella Block",
                "skillimage": "https://i.imgur.com/D1BTZbK.png",
                "skilldescription": "This skill makes Umbrella invulnerable for 1 turn.",
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
    {
        "id": "shiore-orochimaru",
        "characterId": "shiore-orochimaru",
        "name": "Shiore Orochimaru",
        "facePicture": "https://i.imgur.com/SSVCMic.png",
        "characterdeescription": "Shiore was a genin from the Hidden Grass Village that was killed by Orochimaru before the Chuunin Exams. He had his identity stolen by him afterwards. ORIGINAL DESIGN: AnteMito",
        "requiredMissionId": "a-new-find-skin",
        "skills": [
            {
                "id": "shiore-orochimaru-five-elements-seal",
                "name": "Five Elements Seal",
                "skillimage": "https://i.imgur.com/c7GzZkw.png",
                "skilldescription": "Shiore Orochimaru targets one enemy, removing 1 random chakra from them and making their skills cost 1 additional random chakra for 1 turn. If this skill is used on an enemy affected by 'Giant Snake Bind', this enemy will have 1 random chakra stolen instead and the chakra cost increase effect will last 2 turns.",
                "energy": [
                    "Ninjutsu"
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
                        "type": "remove_random_chakra",
                        "amount": 1,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "missingStatusId": "shiore_orochimaru_giant_snake_bind"
                        }
                    },
                    {
                        "type": "drain_chakra_random_from_target_to_self",
                        "amount": 1,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "statusId": "shiore_orochimaru_giant_snake_bind"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "shiore_orochimaru_five_elements_seal_cost",
                        "duration": 1,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "missingStatusId": "shiore_orochimaru_giant_snake_bind"
                        },
                        "metadata": {
                            "harmful": true,
                            "randomCostIncrease": 1,
                            "tooltipText": "This character's skills cost 1 additional random chakra.",
                            "turnDurationAnchor": "source_turn"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "shiore_orochimaru_five_elements_seal_cost",
                        "duration": 2,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "statusId": "shiore_orochimaru_giant_snake_bind"
                        },
                        "metadata": {
                            "harmful": true,
                            "randomCostIncrease": 1,
                            "tooltipText": "This character's skills cost 1 additional random chakra."
                        }
                    }
                ]
            },
            {
                "id": "shiore-orochimaru-fire-release-fire-ball",
                "name": "Fire Release: Fire Ball",
                "skillimage": "https://i.imgur.com/rbD0Uyi.png",
                "skilldescription": "Shiore Orochimaru deals 15 affliction damage to one enemy for 2 turns. This skill cannot be used on an enemy already affected by it and cannot be ignored or removed.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "single-enemy",
                "targetCondition": {
                    "missingStatusId": "shiore_orochimaru_fireball_dot"
                },
                "damage": 0,
                "cooldown": 0,
                "cannotBeCountered": true,
                "classes": [
                    "Affliction",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "shiore_orochimaru_fireball_dot",
                        "duration": 2,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "afflictionDamage": true,
                            "cannotBeCleansed": true,
                            "cannotBeEvaded": true,
                            "turnEndDamage": 15,
                            "turnEndTrigger": "source_turn",
                            "tooltipText": "This character takes 15 affliction damage from Fire Release: Fire Ball."
                        }
                    }
                ]
            },
            {
                "id": "shiore-orochimaru-giant-snake-bind",
                "name": "Giant Snake Bind",
                "skillimage": "https://i.imgur.com/8NjKcaE.png",
                "skilldescription": "Shiore Orochimaru stuns one enemy for 1 turn. For 1 turn, this skill can be used for no cost to deal 25 damage to the enemy affected by it.",
                "energy": [
                    "Taijutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Physical",
                    "Action"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "shiore_orochimaru_giant_snake_bind",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkills": true,
                            "tooltipText": "This character is stunned by Giant Snake Bind.",
                            "ongoingClass": "action",
                            "turnDurationAnchor": "source_turn"
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 25,
                        "scope": "target",
                        "condition": {
                            "scope": "self",
                            "statusId": "shiore_orochimaru_giant_snake_bind_followup"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "shiore_orochimaru_giant_snake_bind_followup",
                        "duration": 1,
                        "scope": "self",
                        "condition": {
                            "scope": "self",
                            "missingStatusId": "shiore_orochimaru_giant_snake_bind_followup"
                        },
                        "metadata": {
                            "helpful": true,
                            "skillCostOverridesBySkillId": {
                                "shiore-orochimaru-giant-snake-bind": {
                                    "energy": []
                                }
                            },
                            "tooltipText": "Giant Snake Bind may be used for no cost to deal 25 damage.",
                            "ongoingClass": "action"
                        }
                    }
                ]
            },
            {
                "id": "shiore-orochimaru-snake-body-retreat",
                "name": "Snake Body Retreat",
                "skillimage": "https://i.imgur.com/B5p2YML.png",
                "skilldescription": "This skill makes Snake invulnerable for 1 turn.",
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
    {
        "id": "akadou-yoroi",
        "characterId": "akadou-yoroi",
        "name": "Akadou Yoroi",
        "facePicture": "https://i.imgur.com/U0Ziv1r.png",
        "characterdeescription": "A sound village genin that infiltrated Konoha as a spy, Yoroi is a capable, but brash ninja who likes to toy with his enemies. Yoroi is capable of absorbing the strength of his enemies, and make it his own in more than one way.",
        "requiredMissionId": "the-sounds-amongst-the-leaves",
        "skills": [
            {
                "id": "akadou-yoroi-energy-drain",
                "name": "Energy Drain",
                "skillimage": "https://i.imgur.com/93Ubu8K.png",
                "skilldescription": "Akadou Yoroi steals 20 health from one enemy then lowers their non-affliction damage by 5 for 2 turns. The following 2 turns, Akadou Yoroi will deal 5 additional damage with his skills.",
                "energy": [
                    "Taijutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Ninjutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "health_steal_damage",
                        "amount": 20,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "akadou_yoroi_drain_debuff",
                        "duration": 2,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "nonAfflictionDamageDebuffFlat": 5,
                            "tooltipText": "This character deals 5 less non-affliction damage."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "akadou_yoroi_empowered",
                        "duration": 2,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "damageBonusFlat": 5,
                            "tooltipText": "Akadou Yoroi deals 5 additional damage with his skills."
                        }
                    },
                    {
                        "type": "drain_chakra_random_from_target_to_self",
                        "amount": 1,
                        "scope": "target",
                        "condition": {
                            "scope": "self",
                            "statusId": "akadou_yoroi_chakra_focus",
                            "consumeOnMatch": true
                        }
                    }
                ]
            },
            {
                "id": "akadou-yoroi-draining-assault",
                "name": "Draining Assault",
                "skillimage": "https://i.imgur.com/zBoZAxl.png",
                "skilldescription": "For 3 turns, Akadou Yoroi steals 15 health from one enemy each turn. Their non-affliction damage will be lowered by 5 for 2 turns. The following 2 turns, Akadou Yoroi will deal 5 additional damage with his skills. During 'Chakra Focus', this skill also steals 1 random chakra on use.",
                "energy": [
                    "Taijutsu",
                    "Random",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Ninjutsu",
                    "Action"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "akadou_yoroi_draining_assault_dot",
                        "duration": 3,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 15,
                            "turnEndTrigger": "source_turn",
                            "tooltipText": "This character loses 15 health each turn to Draining Assault.",
                            "ongoingClass": "action"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "akadou_yoroi_draining_assault_heal",
                        "duration": 3,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "turnEndHealFlat": 15,
                            "tooltipText": "Akadou Yoroi heals 15 health each turn from Draining Assault.",
                            "ongoingClass": "action"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "akadou_yoroi_drain_debuff",
                        "duration": 2,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "nonAfflictionDamageDebuffFlat": 5,
                            "tooltipText": "This character deals 5 less non-affliction damage.",
                            "ongoingClass": "action"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "akadou_yoroi_empowered",
                        "duration": 2,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "damageBonusFlat": 5,
                            "tooltipText": "Akadou Yoroi deals 5 additional damage with his skills.",
                            "ongoingClass": "action"
                        }
                    },
                    {
                        "type": "drain_chakra_random_from_target_to_self",
                        "amount": 1,
                        "scope": "target",
                        "condition": {
                            "scope": "self",
                            "statusId": "akadou_yoroi_chakra_focus",
                            "consumeOnMatch": true
                        }
                    }
                ]
            },
            {
                "id": "akadou-yoroi-chakra-focus",
                "name": "Chakra Focus",
                "skillimage": "https://i.imgur.com/8oUT5Mk.png",
                "skilldescription": "For 3 turns, if 'Energy Drain' or 'Draining Assault' are used, they will also steal 1 random chakra. This effect is consumed when triggered.",
                "energy": [
                    "Random"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "akadou_yoroi_chakra_focus",
                        "duration": 3,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "tooltipText": "Energy Drain or Draining Assault will also steal 1 random chakra."
                        }
                    }
                ]
            },
            {
                "id": "akadou-yoroi-chakra-block",
                "name": "Chakra Block",
                "skillimage": "https://i.imgur.com/ubYpqC3.png",
                "skilldescription": "This skill makes Chakra invulnerable for 1 turn.",
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
    {
        "id": "tsurugi-misumi",
        "characterId": "tsurugi-misumi",
        "name": "Tsurugi Misumi",
        "facePicture": "https://i.imgur.com/0eoJQlb.png",
        "characterdeescription": "A sound village genin that infiltrated Konoha as a spy, Misumi likes taking the initiative when it comes to combat. Misumi can flex his muscles and bones, twisting them to wrap around his enemies, or even defend his allies.",
        "requiredMissionId": "twisting-sound",
        "skills": [
            {
                "id": "tsurugi-misumi-flexible-twisting-joints",
                "name": "Flexible Twisting Joints",
                "skillimage": "https://i.imgur.com/6CRiBav.png",
                "skilldescription": "Tsurugi Misumi gains 20 points of damage reduction for 1 turn and targets one enemy or one member of his team. If used on an enemy, they will take 20 damage that ignores invulnerability. If used on a member of his team, they will gain 20 points of damage reduction for 1 turn.",
                "energy": [
                    "Random"
                ],
                "target": "single-character",
                "damage": 0,
                "cooldown": 0,
                "ignoreInvulnerability": true,
                "classes": [
                    "Physical",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "tsurugi_misumi_flexible_joints_self",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "damageReductionFlat": 20,
                            "tooltipText": "This character has 20 damage reduction."
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 20,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "targetRelation": "enemy"
                        },
                        "metadata": {
                            "cannotBeEvaded": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "tsurugi_misumi_flexible_joints_ally",
                        "duration": 1,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "targetRelation": "ally"
                        },
                        "metadata": {
                            "helpful": true,
                            "damageReductionFlat": 20,
                            "tooltipText": "This character has 20 damage reduction."
                        }
                    }
                ]
            },
            {
                "id": "tsurugi-misumi-soft-physique-modification",
                "name": "Soft Physique Modification",
                "skillimage": "https://i.imgur.com/N1qHrVL.png",
                "skilldescription": "Tsurugi Misumi targets one enemy. For 2 turns, all new harmful skills used on Tsurugi Misumi will be reflected onto that enemy instead. During this time, that enemy will be unable to reduce damage or become invulnerable.",
                "energy": [
                    "Random",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 4,
                "classes": [
                    "Strategic",
                    "Control"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "tsurugi_misumi_soft_physique_reflect",
                        "duration": 2,
                        "scope": "self",
                        "condition": {
                            "scope": "target"
                        },
                        "metadata": {
                            "helpful": true,
                            "reflectNextIncomingSkill": true,
                            "reflectToFixedTarget": true,
                            "persistReflectAcrossTriggers": true,
                            "copyTargetUsernameToKeys": [
                                "reflectTargetUsername"
                            ],
                            "copyTargetSlotToKeys": [
                                "reflectTargetSlot"
                            ],
                            "tooltipText": "New harmful skills used on this character will be reflected onto the enemy affected by Soft Physique Modification.",
                            "ongoingClass": "control"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "tsurugi_misumi_soft_physique_mark",
                        "duration": 2,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotReduceDamage": true,
                            "cannotBecomeInvulnerable": true,
                            "tooltipText": "This character cannot reduce damage or become invulnerable.",
                            "ongoingClass": "control"
                        }
                    }
                ]
            },
            {
                "id": "tsurugi-misumi-tighten-joints",
                "name": "Tighten Joints",
                "skillimage": "https://i.imgur.com/GasBrwW.png",
                "skilldescription": "Tsurugi Misumi gains 15 points of permanent destructible defense. If 'Soft Physique Modification' is active, the enemy targeted by it will also take 20 damage and be stunned for 1 turn, and Misumi will heal 10 health.",
                "energy": [
                    "Random"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Physical",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "tsurugi_misumi_tighten_joints_dd",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "destructibleDefensePoints": 15,
                            "mergeNumericAddKeys": [
                                "destructibleDefensePoints"
                            ],
                            "tooltipText": "Misumi has 15 points of permanent destructible defense from Tighten Joints."
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 20,
                        "scope": "all-enemy",
                        "condition": {
                            "scope": "target",
                            "statusId": "tsurugi_misumi_soft_physique_mark"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "tsurugi_misumi_tighten_joints_stun",
                        "duration": 1,
                        "scope": "all-enemy",
                        "condition": {
                            "scope": "target",
                            "statusId": "tsurugi_misumi_soft_physique_mark"
                        },
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkills": true,
                            "tooltipText": "This character is stunned by Tighten Joints.",
                            "turnDurationAnchor": "source_turn"
                        }
                    },
                    {
                        "type": "heal",
                        "amount": 10,
                        "scope": "self",
                        "condition": {
                            "scope": "self",
                            "statusId": "tsurugi_misumi_soft_physique_reflect"
                        }
                    }
                ]
            },
            {
                "id": "tsurugi-misumi-misumi-block",
                "name": "Misumi Block",
                "skillimage": "https://i.imgur.com/LJMVcjB.png",
                "skilldescription": "This skill makes Misumi invulnerable for 1 turn.",
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
    {
        "id": "jiroubou",
        "characterId": "jiroubou",
        "name": "Jiroubou",
        "facePicture": "https://i.imgur.com/inrbCC3.png",
        "characterdeescription": "A member of the Sound Five, Jiroubou is the largest member of the team, and while he appears calm, is actually arrogant and easy to anger. Jiroubou uses his fists to attack his enemies or can manipulate the battleground around him.",
        "requiredMissionId": "the-search-for-jiroubou",
        "skills": [
            {
                "id": "jiroubou-arhat-fist",
                "name": "Arhat Fist",
                "skillimage": "https://i.imgur.com/cBKzOKe.png",
                "skilldescription": "Jiroubou deals 30 damage to one enemy. The following turn, 'Earth Mausoleum Dumpling' will deal 10 additional damage.",
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
                        "statusId": "jiroubou_arhat_fist_bonus",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillDamageBonuses": {
                                "jiroubou-earth-mausoleum-dumpling": 10
                            },
                            "removeSelfOnSkillUseSkillIds": [
                                "jiroubou-earth-mausoleum-dumpling"
                            ],
                            "tooltipText": "Earth Mausoleum Dumpling deals 10 additional damage."
                        }
                    }
                ]
            },
            {
                "id": "jiroubou-earth-mausoleum-dumpling",
                "name": "Earth Mausoleum Dumpling",
                "skillimage": "https://i.imgur.com/gKynZ3c.png",
                "skilldescription": "Jiroubou deals 20 damage to all enemies. The following turn, 'Arhat Fist' will deal 10 additional damage.",
                "energy": [
                    "Taijutsu",
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
                        "amount": 20,
                        "scope": "all-enemy"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "jiroubou_earth_mausoleum_dumpling_bonus",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillDamageBonuses": {
                                "jiroubou-arhat-fist": 10
                            },
                            "removeSelfOnSkillUseSkillIds": [
                                "jiroubou-arhat-fist"
                            ],
                            "tooltipText": "Arhat Fist deals 10 additional damage."
                        }
                    }
                ]
            },
            {
                "id": "jiroubou-earth-prison-of-magnificent-nothingness",
                "name": "Earth Prison of Magnificent Nothingness",
                "skillimage": "https://i.imgur.com/plmoESM.png",
                "skilldescription": "For 3 turns, Jiroubou and all allies will gain 35 points of destructible defense. One target enemy loses 1 random chakra on use and will lose 1 random chakra again if the prison survives. This skill's chakra removal effect will end if Jiroubou's destructible defense is destroyed.",
                "energy": [
                    "Ninjutsu",
                    "Random",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 6,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "jiroubou_earth_prison_defense",
                        "duration": 3,
                        "scope": "all-allies",
                        "condition": {
                            "scope": "target",
                            "targetRelation": "self"
                        },
                        "metadata": {
                            "helpful": true,
                            "destructibleDefensePoints": 35,
                            "removeStatusIdsFromEnemyOnBreak": [
                                "jiroubou_earth_prison_drain"
                            ],
                            "tooltipText": "This character has 35 points of destructible defense from Earth Prison of Magnificent Nothingness. If it is destroyed, this skill's chakra drain effect will end."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "jiroubou_earth_prison_defense",
                        "duration": 3,
                        "scope": "all-allies",
                        "condition": {
                            "scope": "target",
                            "targetRelation": "ally"
                        },
                        "metadata": {
                            "helpful": true,
                            "destructibleDefensePoints": 35,
                            "tooltipText": "This character has 35 points of destructible defense from Earth Prison of Magnificent Nothingness."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "jiroubou_earth_prison_drain",
                        "duration": 3,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "turnEndRemoveRandomChakra": 1,
                            "turnEndTrigger": "source_turn",
                            "tooltipText": "This character loses 1 random chakra each turn while Earth Prison survives."
                        }
                    },
                    {
                        "type": "remove_random_chakra",
                        "amount": 1,
                        "scope": "target"
                    }
                ]
            },
            {
                "id": "jiroubou-terra-shield",
                "name": "Terra Shield",
                "skillimage": "https://i.imgur.com/gdsdurL.png",
                "skilldescription": "This skill makes Jiroubou invulnerable for 1 turn.",
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
    {
        "id": "kidoumaru",
        "characterId": "kidoumaru",
        "name": "Kidoumaru",
        "facePicture": "https://i.imgur.com/zW32e4B.png",
        "characterdeescription": "A member of the Sound Five, Kidoumaru resembles a spider in both appearance and fighting style. Kidoumaru is able to trap enemies in his web while assaulting them from afar with both spiders and powerful arrows.",
        "requiredMissionId": "the-search-for-kidoumaru",
        "skills": [
            {
                "id": "kidoumaru-spider-bow-fierce-rip",
                "name": "Spider Bow: Fierce Rip",
                "skillimage": "https://i.imgur.com/H6O53Dh.png",
                "skilldescription": "Kidoumaru deals 50 piercing damage to one enemy.",
                "energy": [
                    "Bloodline",
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
                        "type": "damage",
                        "amount": 50,
                        "scope": "target",
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    }
                ]
            },
            {
                "id": "kidoumaru-summoning-kyodaigumo",
                "name": "Summoning: Kyodaigumo",
                "skillimage": "https://i.imgur.com/bOb3ubG.png",
                "skilldescription": "Kidoumaru deals 10 damage to all enemies for 5 turns. During this time, Kidoumaru will gain 10 points of damage reduction and all enemies who use a new skill will have the cooldown of that skill increased by 1.",
                "energy": [
                    "Bloodline",
                    "Ninjutsu"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 5,
                "classes": [
                    "Physical",
                    "Action"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "kidoumaru_kyodaigumo_dot",
                        "duration": 5,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 10,
                            "turnEndTrigger": "source_turn",
                            "ongoingClass": "action",
                            "tooltipText": "This character takes 10 damage each turn from Summoning: Kyodaigumo."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kidoumaru_kyodaigumo_dr",
                        "duration": 5,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "damageReductionFlat": 10,
                            "usedSkillCooldownPenalty": 1,
                            "tooltipText": "This character has 10 points of damage reduction. All enemies who use a new skill will have the cooldown of that skill increased by 1.",
                            "ongoingClass": "action"
                        }
                    }
                ]
            },
            {
                "id": "kidoumaru-spiral-web",
                "name": "Spiral Web",
                "skillimage": "https://i.imgur.com/9q2wtiH.png",
                "skilldescription": "Kidoumaru targets himself or one ally. The following turn, the first non-strategic skill used on the target will be countered. This skill is invisible.",
                "energy": [
                    "Bloodline"
                ],
                "target": "self-or-single-ally",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "kidoumaru_spiral_web",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "helpful": true,
                            "hideTooltipFromEnemy": true,
                            "triggerOnEnemyHarmfulNonStrategic": true,
                            "counterCancelsSkill": true,
                            "tooltipText": "The first non-strategic skill used on this character will be countered."
                        }
                    }
                ]
            },
            {
                "id": "kidoumaru-golden-armor",
                "name": "Golden Armor",
                "skillimage": "https://i.imgur.com/RdMruyD.png",
                "skilldescription": "This skill makes Kidoumaru invulnerable for 1 turn.",
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
    {
        "id": "tayuya",
        "characterId": "tayuya",
        "name": "Tayuya",
        "facePicture": "https://i.imgur.com/hAshWTO.png",
        "characterdeescription": "A member of the Sound Five, Tayuya is the only female member of the team, and the most foul-mouthed one too. Tayuya uses her flute to both trap her enemies in genjutsu while controlling the beasts she summons.",
        "requiredMissionId": "the-search-for-tayuya",
        "skills": [
            {
                "id": "tayuya-summoning-doki",
                "name": "Summoning: Doki",
                "skillimage": "https://i.imgur.com/SBJYjtZ.png",
                "skilldescription": "Tayuya deals 15 damage to all enemies for 2 turns. During this time, Tayuya will gain 15 points of damage reduction and 'Demonic Flute: Phantom Wave' will also remove 1 random chakra from its target if used.",
                "energy": [
                    "Genjutsu",
                    "Random"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Physical",
                    "Action"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "tayuya_summoning_doki_active",
                        "duration": 2,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 15,
                            "turnEndTrigger": "source_turn",
                            "tooltipText": "This character takes 15 damage each turn from Summoning: Doki.",
                            "ongoingClass": "action"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "tayuya_summoning_doki_self",
                        "duration": 2,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "damageReductionFlat": 15,
                            "tooltipText": "Tayuya has 15 damage reduction and Demonic Flute: Phantom Wave will also remove 1 random chakra.",
                            "ongoingClass": "action"
                        }
                    }
                ]
            },
            {
                "id": "tayuya-demonic-flute-phantom-wave",
                "name": "Demonic Flute: Phantom Wave",
                "skillimage": "https://i.imgur.com/vgPEfaF.png",
                "skilldescription": "Tayuya deals 10 affliction damage to one enemy. During 'Summoning: Doki', this skill will also remove 1 random chakra from its target.",
                "energy": [
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Affliction",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 10,
                        "scope": "target",
                        "metadata": {
                            "afflictionDamage": true
                        }
                    },
                    {
                        "type": "remove_random_chakra",
                        "amount": 1,
                        "scope": "target",
                        "condition": {
                            "scope": "self",
                            "statusId": "tayuya_summoning_doki_self"
                        }
                    }
                ]
            },
            {
                "id": "tayuya-demonic-flute",
                "name": "Demonic Flute",
                "skillimage": "https://i.imgur.com/IfHMbxw.png",
                "skilldescription": "Tayuya stuns all enemies' non-mental skills for 1 turn.",
                "energy": [
                    "Genjutsu"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 5,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "tayuya_demonic_flute_stun",
                        "duration": 1,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "cannotUseNonMentalSkills": true,
                            "tooltipText": "This character's non-mental skills are stunned.",
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            },
            {
                "id": "tayuya-insight",
                "name": "Insight",
                "skillimage": "https://i.imgur.com/sSjvCQK.png",
                "skilldescription": "This skill makes Tayuya invulnerable for 1 turn.",
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
    {
        "id": "sakon-and-ukon",
        "characterId": "sakon-and-ukon",
        "name": "Sakon and Ukon",
        "facePicture": "https://i.imgur.com/hCiXr6K.png",
        "characterdeescription": "A member of the Sound Five, Sakon, along with his brother Ukon, are nearly identical twins with a bloodline that let them live inside one another's body. Sakon and Ukon can double team an enemy, or invade another's body.",
        "requiredMissionId": "the-search-for-sakon",
        "skills": [
            {
                "id": "sakon-and-ukon-gattling-punch",
                "name": "Gattling Punch",
                "skillimage": "https://i.imgur.com/nB8CLYd.png",
                "skilldescription": "Sakon and Ukon deal 40 damage to one enemy. During 'Parasite Demon Demolition', this skill will deal 10 less damage.",
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
                        "amount": 40,
                        "scope": "target"
                    }
                ]
            },
            {
                "id": "sakon-and-ukon-parasite-demon-demolition",
                "name": "Parasite Demon Demolition",
                "skillimage": "https://i.imgur.com/GGykRJS.png",
                "skilldescription": "Sakon and Ukon deal 15 affliction damage to one enemy permanently. During this time, Sakon and Ukon will gain 20 points of damage reduction, that enemy will deal 5 less non-affliction damage, and 'Gattling Punch' will deal 5 less damage while active. This skill cannot be used while active. This skill ends if 'Rest' or 'Summoning: Rashoumon' are used, or if the enemy or Sakon and Ukon die.",
                "energy": [
                    "Bloodline",
                    "Bloodline"
                ],
                "target": "single-enemy",
                "actorCondition": {
                    "missingStatusId": "sakon_and_ukon_parasite_demon_demolition_self"
                },
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Affliction",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "sakon_and_ukon_parasite_demon_demolition_dot",
                        "duration": 99,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "afflictionDamage": true,
                            "turnEndDamage": 15,
                            "turnEndTrigger": "source_turn",
                            "tooltipText": "This character takes 15 affliction damage and deals 5 less non-affliction damage from Parasite Demon Demolition.",
                            "NonAfflictionDamageDebuff": 5
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "sakon_and_ukon_parasite_demon_demolition_self",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "damageReductionFlat": 20,
                            "skillDamageBonuses": {
                                "sakon-and-ukon-gattling-punch": -5
                            },
                            "tooltipText": "Sakon and Ukon have 20 damage reduction and Gattling Punch deals 5 less damage."
                        }
                    }
                ]
            },
            {
                "id": "sakon-and-ukon-rest",
                "name": "Rest",
                "skillimage": "https://i.imgur.com/rDxLn5c.png",
                "skilldescription": "Sakon and Ukon heal themselves for 25 health. If 'Parasite Demon Demolition' is active, they heal 35 health instead and it will end.",
                "energy": [
                    "Bloodline",
                    "Random"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "heal",
                        "amount": 25,
                        "scope": "self",
                        "condition": {
                            "scope": "self",
                            "missingStatusId": "sakon_and_ukon_parasite_demon_demolition_self"
                        }
                    },
                    {
                        "type": "heal",
                        "amount": 35,
                        "scope": "self",
                        "condition": {
                            "scope": "self",
                            "statusId": "sakon_and_ukon_parasite_demon_demolition_self"
                        }
                    },
                    {
                        "type": "cleanse_statuses",
                        "scope": "self",
                        "statusId": "sakon_and_ukon_parasite_demon_demolition_self",
                        "count": 1
                    },
                    {
                        "type": "cleanse_statuses",
                        "scope": "all-enemy",
                        "statusId": "sakon_and_ukon_parasite_demon_demolition_dot",
                        "count": 1
                    }
                ]
            },
            {
                "id": "sakon-and-ukon-summoning-rashoumon",
                "name": "Summoning: Rashoumon",
                "skillimage": "https://i.imgur.com/Py47f2p.png",
                "skilldescription": "This skill makes Sakon and Ukon invulnerable for 1 turn. If 'Parasite Demon Demolition' is active, it will end.",
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
                    },
                    {
                        "type": "cleanse_statuses",
                        "scope": "self",
                        "statusId": "sakon_and_ukon_parasite_demon_demolition_self",
                        "count": 1
                    },
                    {
                        "type": "cleanse_statuses",
                        "scope": "all-enemy",
                        "statusId": "sakon_and_ukon_parasite_demon_demolition_dot",
                        "count": 1
                    }
                ]
            }
        ]
    },
    {
        "id": "kimimaro",
        "characterId": "kimimaro",
        "name": "Kimimaro",
        "facePicture": "https://i.imgur.com/oC5Q8hX.png",
        "characterdeescription": "A member of the Sound Five, Kimimaro was the leader, and the strongest of the team before his illness. Kimimaro's bloodline grants him unstoppable offensive power, however, his illness is slowly killing him, giving him precious little time.",
        "requiredMissionId": "the-search-for-kimimaro",
        "skills": [
            {
                "id": "kimimaro-dance-of-the-camellia",
                "name": "Dance of the Camellia",
                "skillimage": "https://i.imgur.com/xC8MDIQ.png",
                "skilldescription": "Kimimaro deals 30 damage to one enemy. This skill cannot be countered or reflected. Kimimaro will take 5 affliction damage.",
                "energy": [
                    "Taijutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "cannotBeCountered": true,
                "cannotBeReflected": true,
                "classes": [
                    "Physical",
                    "Instant",
                    "Affliction"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 30,
                        "scope": "target"
                    },
                    {
                        "type": "damage",
                        "amount": 5,
                        "scope": "self",
                        "metadata": {
                            "afflictionDamage": true
                        }
                    }
                ]
            },
            {
                "id": "kimimaro-dance-of-the-clematis",
                "name": "Dance of the Clematis",
                "skillimage": "https://i.imgur.com/MIrGNsC.png",
                "skilldescription": "Kimimaro deals 40 damage to one enemy and stuns them for 1 turn. This skill cannot be countered or reflected. Kimimaro will take 10 affliction damage.",
                "energy": [
                    "Taijutsu",
                    "Bloodline"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "cannotBeCountered": true,
                "cannotBeReflected": true,
                "classes": [
                    "Physical",
                    "Instant",
                    "Affliction"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 40,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kimimaro_dance_of_the_clematis_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkills": true,
                            "tooltipText": "This character is stunned by Dance of the Clematis.",
                            "turnDurationAnchor": "source_turn"
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 10,
                        "scope": "self",
                        "metadata": {
                            "afflictionDamage": true
                        }
                    }
                ]
            },
            {
                "id": "kimimaro-dance-of-the-seedling-fern",
                "name": "Dance of the Seedling Fern",
                "skillimage": "https://i.imgur.com/T9Usfo0.png",
                "skilldescription": "Kimimaro deals 30 damage to all enemies and reduces their physical and chakra damage by 20 for 1 turn. This skill cannot be countered or reflected. Kimimaro will take 10 affliction damage for 2 turns.",
                "energy": [
                    "Bloodline",
                    "Random",
                    "Random"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 2,
                "cannotBeCountered": true,
                "cannotBeReflected": true,
                "classes": [
                    "Physical",
                    "Strategic",
                    "Instant",
                    "Affliction"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 30,
                        "scope": "all-enemy"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kimimaro_dance_of_the_seedling_fern_debuff",
                        "duration": 1,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "damageDebuffBySkillClass": {
                                "physical": 20,
                                "energy": 20
                            },
                            "tooltipText": "This character deals 20 less physical and chakra damage.",
                            "turnDurationAnchor": "source_turn"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kimimaro_dance_of_the_seedling_fern_self_damage",
                        "duration": 2,
                        "scope": "self",
                        "metadata": {
                            "harmful": true,
                            "afflictionDamage": true,
                            "turnEndDamage": 10,
                            "turnEndTrigger": "source_turn",
                            "tooltipText": "Kimimaro takes 10 affliction damage each turn."
                        }
                    }
                ]
            },
            {
                "id": "kimimaro-bone-defense",
                "name": "Bone Defense",
                "skillimage": "https://i.imgur.com/NgObkLl.png",
                "skilldescription": "This skill makes Kimimaro invulnerable for 1 turn.",
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
    {
        "id": "mitarashi-anko",
        "characterId": "mitarashi-anko",
        "name": "Mitarashi Anko",
        "facePicture": "https://i.imgur.com/MXeuah1.png",
        "characterdeescription": "A former student of Orochimaru and bearer of the Cursed Seal, Anko is now a teacher at Konoha. Having learned from Orochimaru, Anko utilizes various types of poisons and forbidden techniques to dismantle her enemies.",
        "requiredMissionId": "the-survivor-of-the-seal",
        "skills": [
            {
                "id": "mitarashi-anko-dual-pin",
                "name": "Dual Pin",
                "skillimage": "https://i.imgur.com/VttrJQn.png",
                "skilldescription": "Mitarashi Anko deals 10 damage to one enemy and makes them unable to reduce damage or become invulnerable for 1 turn. The following turn, this skill will be replaced by 'Twin Snakes Mutual Death'.",
                "energy": [],
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
                        "amount": 10,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "mitarashi_anko_dual_pin_debuff",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "cannotReduceDamage": true,
                            "cannotBecomeInvulnerable": true,
                            "tooltipText": "This character cannot reduce damage or become invulnerable."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "mitarashi_anko_dual_pin_mark",
                        "duration": 2,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "tooltipText": "This character can be targeted by Twin Snakes Mutual Death."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "mitarashi_anko_dual_pin_replacement",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillReplacements": {
                                "mitarashi-anko-dual-pin": "mitarashi-anko-twin-snakes-mutual-death"
                            },
                            "tooltipText": "Dual Pin is replaced by Twin Snakes Mutual Death."
                        }
                    }
                ]
            },
            {
                "id": "mitarashi-anko-dragon-fire",
                "name": "Dragon Fire",
                "skillimage": "https://i.imgur.com/V8R4vRw.png",
                "skilldescription": "Mitarashi Anko deals 10 affliction damage to all enemies for 2 turns. The following 2 turns, these enemies will take 5 additional damage from Mitarashi Anko's other skills.",
                "energy": [
                    "Ninjutsu"
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
                        "type": "apply_status",
                        "statusId": "mitarashi_anko_dragon_fire_dot",
                        "duration": 2,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "afflictionDamage": true,
                            "turnEndDamage": 10,
                            "turnEndTrigger": "source_turn",
                            "tooltipText": "This character takes 10 affliction damage each turn from Dragon Fire."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "mitarashi_anko_dragon_fire_vulnerable",
                        "duration": 2,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "bonusDamageFromSourceSkillsFlat": 5,
                            "bonusDamageFromSourceCharacterId": "mitarashi-anko",
                            "bonusDamageAppliesToSkillIds": [
                                "mitarashi-anko-dual-pin",
                                "mitarashi-anko-hidden-shadow-snake-hand",
                                "mitarashi-anko-twin-snakes-mutual-death"
                            ],
                            "tooltipText": "This character takes 5 additional damage from Mitarashi Anko's skills."
                        }
                    }
                ]
            },
            {
                "id": "mitarashi-anko-hidden-shadow-snake-hand",
                "name": "Hidden Shadow Snake Hand",
                "skillimage": "https://i.imgur.com/ApBRFMM.png",
                "skilldescription": "Mitarashi Anko deals 10 affliction damage to one enemy. The following 3 turns, this enemy will take 5 affliction damage each turn. This skill stacks.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Affliction",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 10,
                        "scope": "target",
                        "metadata": {
                            "afflictionDamage": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "mitarashi_anko_hidden_shadow_snake_hand_dot",
                        "duration": 3,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "afflictionDamage": true,
                            "turnEndDamage": 5,
                            "turnEndTrigger": "source_turn",
                            "mergeNumericAddKeys": [
                                "turnEndDamage"
                            ],
                            "tooltipText": "This character takes 5 affliction damage each turn from Hidden Shadow Snake Hand. This effect stacks."
                        }
                    }
                ]
            },
            {
                "id": "mitarashi-anko-quick-reflexes",
                "name": "Quick Reflexes",
                "skillimage": "https://i.imgur.com/jOjcH7H.png",
                "skilldescription": "This skill makes Mitarashi Anko invulnerable for 1 turn.",
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
            },
            {
                "id": "mitarashi-anko-twin-snakes-mutual-death",
                "name": "Twin Snakes Mutual Death",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/3Wv9VMP.png",
                "skilldescription": "Mitarashi Anko targets the enemy affected by 'Dual Pin' and herself. Both take 60 affliction damage that ignores invulnerability and destructible defense. This damage cannot kill Anko.",
                "energy": [
                    "Ninjutsu",
                    "Ninjutsu"
                ],
                "target": "single-enemy",
                "targetCondition": {
                    "statusId": "mitarashi_anko_dual_pin_mark"
                },
                "damage": 0,
                "cooldown": 2,
                "cannotBeCountered": true,
                "ignoreInvulnerability": true,
                "classes": [
                    "Affliction",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 60,
                        "scope": "target",
                        "metadata": {
                            "afflictionDamage": true,
                            "ignoreDamageReduction": true,
                            "ignoreDestructibleDefense": true,
                            "cannotBeEvaded": true
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 60,
                        "scope": "self",
                        "metadata": {
                            "afflictionDamage": true,
                            "ignoreDamageReduction": true,
                            "ignoreDestructibleDefense": true,
                            "minimumHp": 1,
                            "cannotBeEvaded": true
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "gekko-hayate",
        "characterId": "gekko-hayate",
        "name": "Gekko Hayate",
        "facePicture": "https://i.imgur.com/ZJCc6tw.png",
        "characterdeescription": "A Jounin and exam proctor from Konoha; while sickly and afflicted with a chronic cough, he is calm and composed. Hayate is an expert sword user, and is well acquainted with using stealth to increase the deadliness of his attacks.",
        "requiredMissionId": "the-moonlight-of-the-leaf",
        "skills": [
            {
                "id": "gekko-hayate-crescent-moon-slash",
                "name": "Crescent Moon Slash",
                "skillimage": "https://i.imgur.com/HFHgwlb.png",
                "skilldescription": "Gekko Hayate deals 20 damage to one enemy. This skill deals 5 additional damage with each use.",
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
                        "type": "apply_status",
                        "statusId": "gekko_hayate_crescent_moon_slash_stacks",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillDamageBonuses": {
                                "gekko-hayate-crescent-moon-slash": 5
                            },
                            "mergeObjectNumericAddKeys": [
                                "skillDamageBonuses"
                            ],
                            "tooltipText": "Crescent Moon Slash deals 5 additional damage. This effect stacks."
                        }
                    }
                ]
            },
            {
                "id": "gekko-hayate-dance-of-the-crescent-moon",
                "name": "Dance of the Crescent Moon",
                "skillimage": "https://i.imgur.com/AedMe5J.png",
                "skilldescription": "Gekko Hayate deals 30 damage to one enemy. For 1 turn, the first harmful skill used on Gekko Hayate will be countered.",
                "energy": [
                    "Genjutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Mental",
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
                        "statusId": "gekko_hayate_crescent_moon_counter",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "triggerOnEnemyHarmfulSkill": true,
                            "counterCancelsSkill": true,
                            "tooltipText": "The first harmful skill used on this character will be countered."
                        }
                    }
                ]
            },
            {
                "id": "gekko-hayate-meld-into-shadows",
                "name": "Meld into Shadows",
                "skillimage": "https://i.imgur.com/Gu0mKFX.png",
                "skilldescription": "Gekko Hayate becomes invulnerable to physical and chakra skills for 1 turn. His next 'Crescent Moon Slash' will deal 15 additional damage and ignore invulnerability.",
                "energy": [
                    "Genjutsu"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "gekko_hayate_meld_into_shadows",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "invulnerableToSkillClasses": [
                                "physical",
                                "energy"
                            ],
                            "skillDamageBonuses": {
                                "gekko-hayate-crescent-moon-slash": 15
                            },
                            "removeSelfOnSkillUseSkillIds": [
                                "gekko-hayate-crescent-moon-slash"
                            ],
                            "ignoreInvulnerabilityForSkillIds": [
                                "gekko-hayate-crescent-moon-slash"
                            ],
                            "tooltipText": "Hayate is invulnerable to physical and chakra skills. Crescent Moon Slash deals 15 additional damage and ignores invulnerability."
                        }
                    }
                ]
            },
            {
                "id": "gekko-hayate-backflip-dodge",
                "name": "Backflip Dodge",
                "skillimage": "https://i.imgur.com/Kxa0NCU.png",
                "skilldescription": "This skill makes Gekko Hayate invulnerable for 1 turn.",
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
    {
        "id": "shizune",
        "characterId": "shizune",
        "name": "Shizune",
        "facePicture": "https://i.imgur.com/V7UX5TB.png",
        "characterdeescription": "The apprentice to Tsunade, and the niece of Dan, Shizune is a calm, practical but loyal ninja of Konoha's medical squad. Shizune is agile and quick, able to attack continually when not using her powerful medical jutsu to heal her allies.",
        "requiredMissionId": "medical-training",
        "skills": [
            {
                "id": "shizune-prepared-needle-shot",
                "name": "Prepared Needle Shot",
                "skillimage": "https://i.imgur.com/eOiK0aq.png",
                "skilldescription": "Shizune deals 15 damage to one enemy and prepares a needle for 1 turn. If this enemy is affected by 'Poison Mist', this skill deals 10 additional damage.",
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
                        "type": "damage",
                        "amount": 15,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "missingStatusId": "shizune_poison_mist_dot",
                            "conditionalAmount": 25
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "shizune_prepared_needle",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "bonusDamageFromSourceSkillsFlat": 10,
                            "bonusDamageFromSourceCharacterId": "shizune",
                            "bonusDamageAppliesToSkillIds": [
                                "shizune-poison-mist"
                            ],
                            "tooltipText": "This character will take 10 additional damage from Poison Mist.",
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            },
            {
                "id": "shizune-poison-mist",
                "name": "Poison Mist",
                "skillimage": "https://i.imgur.com/B8hT2h4.png",
                "skilldescription": "Shizune deals 10 affliction damage to one enemy for 3 turns. If this enemy was hit by 'Prepared Needle Shot', the first tick deals 10 additional damage. This skill cannot be used on an enemy already being affected.",
                "energy": [
                    "Random"
                ],
                "target": "single-enemy",
                "targetCondition": {
                    "missingStatusId": "shizune_poison_mist_dot"
                },
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Affliction",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "shizune_poison_mist_dot",
                        "duration": 3,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "afflictionDamage": true,
                            "turnEndDamage": 10,
                            "turnEndTrigger": "source_turn",
                            "tooltipText": "This character takes 10 affliction damage each turn from Poison Mist."
                        }
                    }
                ]
            },
            {
                "id": "shizune-healing-resuscitation-regeneration",
                "name": "Healing Resuscitation Regeneration",
                "skillimage": "https://i.imgur.com/8zcBYFX.png",
                "skilldescription": "Shizune heals one ally for 35 health and removes all harmful affliction skills from them.",
                "energy": [
                    "Random",
                    "Random"
                ],
                "target": "single-ally",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "heal",
                        "amount": 35,
                        "scope": "target"
                    },
                    {
                        "type": "cleanse_statuses",
                        "scope": "target",
                        "metadataAny": [
                            "afflictionDamage"
                        ],
                        "harmfulOnly": true,
                        "count": 0
                    }
                ]
            },
            {
                "id": "shizune-shizune-dodge",
                "name": "Shizune Dodge",
                "skillimage": "https://i.imgur.com/9fjcyuQ.png",
                "skilldescription": "This skill makes Shizune invulnerable for 1 turn.",
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
    {
        "id": "hatake-kakashi",
        "characterId": "hatake-kakashi",
        "name": "Hatake Kakashi",
        "facePicture": "https://i.imgur.com/Ult0SsC.png",
        "characterdeescription": "The squad leader of Team 7, known as the Copy Ninja, Kakashi is a man who puts the life of his teammates above all else. Kakashi is able to copy the abilities of his enemies while using his own original technique, the Raikiri.",
        "requiredMissionId": "team-7-fights-as-a-team",
        "skills": [
            {
                "id": "hatake-kakashi-sharingan-counter",
                "name": "Sharingan",
                "skillimage": "https://i.imgur.com/4sfYWaL.png",
                "skilldescription": "For 1 turn, the first physical, chakra or strategic skill used on Hatake Kakashi will be countered and copied. For 2 turns, Sharingan will be replaced by the copied skill, which costs 1 random chakra. This skill is invisible.",
                "energy": [
                    "Bloodline"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "kakashi_sharingan_counter",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "hideTooltipFromEnemy": true,
                            "triggerOnEnemyHarmfulSkillClassesAny": [
                                "physical",
                                "energy",
                                "strategic"
                            ],
                            "counterCancelsSkill": true,
                            "counterCopySkillReplacementFor": "hatake-kakashi-sharingan-counter",
                            "counterCopySkillReplacementDuration": 2,
                            "tooltipText": "The first physical, chakra or strategic skill used on Kakashi will be countered and copied.",
                            "counterCopiedSkillEnergy": [
                                "Random"
                            ]
                        }
                    }
                ]
            },
            {
                "id": "hatake-kakashi-summoning-ninja-dogs",
                "name": "Summoning: Ninja Dogs",
                "skillimage": "https://i.imgur.com/1TSYjNE.png",
                "skilldescription": "Hatake Kakashi stuns one enemy's physical, chakra, and strategic skills for 1 turn. During this time, allies deal 10 additional non-affliction damage to this enemy and 'Raikiri' deals 45 piercing damage to them.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Strategic",
                    "Control"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "kakashi_ninja_dogs_mark",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "cannotUseSkillClasses": [
                                "physical",
                                "energy",
                                "strategic",
                                "ninjutsu"
                            ],
                            "tooltipText": "This character is stunned and takes 10 additional non-affliction damage.",
                            "bonusDamageFromSourceNonAfflictionFlat": 10,
                            "ongoingClass": "control"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kakashi_ninja_dogs_raikiri_cost",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillCostOverridesBySkillId": {
                                "hatake-kakashi-raikiri": {
                                    "energy": [
                                        "Ninjutsu"
                                    ]
                                }
                            },
                            "tooltipText": "Raikiri costs 1 Ninjutsu this turn.",
                            "ongoingClass": "control"
                        }
                    }
                ]
            },
            {
                "id": "hatake-kakashi-raikiri",
                "name": "Raikiri",
                "skillimage": "https://i.imgur.com/BUvxnE4.png",
                "skilldescription": "Hatake Kakashi deals 35 piercing damage to one enemy. Against an enemy affected by 'Summoning: Ninja Dogs', this skill deals 45 piercing damage and costs 1 less chakra.",
                "energy": [
                    "Ninjutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Ninjutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 35,
                        "scope": "target",
                        "metadata": {
                            "ignoreDamageReduction": true
                        },
                        "condition": {
                            "scope": "target",
                            "statusId": "kakashi_ninja_dogs_mark",
                            "conditionalAmount": 35
                        }
                    }
                ]
            },
            {
                "id": "hatake-kakashi-clever-hiding",
                "name": "Clever Hiding",
                "skillimage": "https://i.imgur.com/Px6V4yg.png",
                "skilldescription": "This skill makes Hatake Kakashi invulnerable for 1 turn.",
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
    {
        "id": "yuhi-kurenai",
        "characterId": "yuhi-kurenai",
        "name": "Yuhi Kurenai",
        "facePicture": "https://i.imgur.com/0KdXrps.png",
        "characterdeescription": "The squad leader of Team 8, Kurenai is a caring woman and a close companion to Asuma. Kurenai is a genjutsu master, being able to use a variety of illusions to disrupt and trap her enemies in nigh impossible to escape illusions.",
        "requiredMissionId": "team-8-scouting-at-its-best",
        "skills": [
            {
                "id": "yuhi-kurenai-demonic-illusion-entrap",
                "name": "Demonic Illusion: Entrap",
                "skillimage": "https://i.imgur.com/7TlVCo0.png",
                "skilldescription": "Yuhi Kurenai targets one enemy. For 2 turns, they will take 5 damage each turn, will be unable to reduce damage or become invulnerable, their non-affliction damage will be reduced by 10, and the cost of their skills will be increased by 1 random chakra.",
                "energy": [
                    "Genjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Mental",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "kurenai_entrap_debuff",
                        "duration": 2,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotReduceDamage": true,
                            "cannotBecomeInvulnerable": true,
                            "nonAfflictionDamageDebuffFlat": 10,
                            "randomCostIncrease": 1,
                            "turnEndDamage": 5,
                            "turnEndTrigger": "source_turn",
                            "tooltipText": "This character takes 5 damage, cannot reduce damage or become invulnerable, deals 10 less non-affliction damage, and their skills cost 1 additional random chakra."
                        }
                    }
                ]
            },
            {
                "id": "yuhi-kurenai-illusionary-tree-meld",
                "name": "Illusionary Tree Meld",
                "skillimage": "https://i.imgur.com/eW1yYm5.png",
                "skilldescription": "Yuhi Kurenai gains 15 points of permanent destructible defense and 5 additional points for every skill Yuhi Kurenai has used. The additional destructible defense is reset when this skill is used.",
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
                        "type": "cleanse_statuses",
                        "scope": "self",
                        "statusId": "kurenai_tree_meld_dd",
                        "count": 1
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kurenai_tree_meld_dd",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "destructibleDefensePoints": 15,
                            "tooltipText": "Kurenai has 15 points of destructible defense from Illusionary Tree Meld."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kurenai_tree_meld_growth",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "onOwnerUseSkillTrigger": true,
                            "persistOnOwnerUseSkillTrigger": true,
                            "onOwnerUseSkillEffects": [
                                {
                                    "type": "apply_status",
                                    "statusId": "kurenai_tree_meld_dd",
                                    "duration": 99,
                                    "metadata": {
                                        "helpful": true,
                                        "destructibleDefensePoints": 5,
                                        "mergeNumericAddKeys": [
                                            "destructibleDefensePoints"
                                        ],
                                        "tooltipText": "This character has 5 permanent destructible defense from Illusionary Tree Meld."
                                    }
                                }
                            ],
                            "tooltipText": "Illusionary Tree Meld gains 5 additional destructible defense for every skill used."
                        }
                    }
                ]
            },
            {
                "id": "yuhi-kurenai-demonic-illusion-tree-binding-death",
                "name": "Demonic Illusion: Tree Binding Death",
                "skillimage": "https://i.imgur.com/OxtOFCb.png",
                "skilldescription": "Yuhi Kurenai stuns one enemy for 2 turns. The following 2 turns, this skill will be replaced by 'Tree Binding Death Attack'.",
                "energy": [
                    "Genjutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Strategic",
                    "Control"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "kurenai_tree_binding_stun",
                        "duration": 2,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkills": true,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character is stunned by Demonic Illusion: Tree Binding Death.",
                            "ongoingClass": "control"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kurenai_tree_binding_replacement",
                        "duration": 2,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillReplacements": {
                                "yuhi-kurenai-demonic-illusion-tree-binding-death": "yuhi-kurenai-tree-binding-death-attack"
                            },
                            "tooltipText": "Demonic Illusion: Tree Binding Death is replaced by Tree Binding Death Attack.",
                            "ongoingClass": "control"
                        }
                    }
                ]
            },
            {
                "id": "yuhi-kurenai-vanishing-illusion",
                "name": "Vanishing Illusion",
                "skillimage": "https://i.imgur.com/W2xhlma.png",
                "skilldescription": "This skill makes Yuhi Kurenai invulnerable for 1 turn.",
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
            },
            {
                "id": "yuhi-kurenai-tree-binding-death-attack",
                "name": "Tree Binding Death Attack",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/D9fJNxi.png",
                "skilldescription": "Yuhi Kurenai deals 25 piercing damage to one enemy affected by 'Demonic Illusion: Tree Binding Death'.",
                "energy": [
                    "Random"
                ],
                "target": "single-enemy",
                "targetCondition": {
                    "statusId": "kurenai_tree_binding_stun"
                },
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Mental",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 25,
                        "scope": "target",
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "sarutobi-asuma",
        "characterId": "sarutobi-asuma",
        "name": "Sarutobi Asuma",
        "facePicture": "https://i.imgur.com/Hk2DwUA.png",
        "characterdeescription": "The squad leader of Team 10, Asuma is the son of the 3rd Hokage; Asuma is a chronic smoker that fights to protect his allies. Asuma fights with a pair of trench knives, augmented by his chakra to a highly deadly degree.",
        "requiredMissionId": "team-10-proves-its-worth",
        "skills": [
            {
                "id": "sarutobi-asuma-sharpen-blades",
                "name": "Sharpen Blades",
                "skillimage": "https://i.imgur.com/k1FF8kx.png",
                "skilldescription": "Sarutobi Asuma sharpens his blades, replacing this skill with 'Flying Swallow' until it is used.",
                "energy": [],
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
                        "statusId": "asuma_flying_swallow_ready",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillReplacements": {
                                "sarutobi-asuma-sharpen-blades": "sarutobi-asuma-flying-swallow"
                            },
                            "tooltipText": "Sharpen Blades is replaced by Flying Swallow."
                        }
                    }
                ]
            },
            {
                "id": "sarutobi-asuma-finishing-blow",
                "name": "Finishing Blow",
                "hiddenFromSelectionViewer": false,
                "skillimage": "https://i.imgur.com/SbZfAzh.png",
                "skilldescription": "Sarutobi Asuma deals 35 piercing damage to one enemy. After use, this skill is replaced by 'Flying Kick'.",
                "energy": [
                    "Taijutsu",
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
                        "amount": 35,
                        "scope": "target",
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "asuma_flying_kick_ready",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillReplacements": {
                                "sarutobi-asuma-finishing-blow": "sarutobi-asuma-flying-kick"
                            },
                            "tooltipText": "Finishing Blow is replaced by Flying Kick."
                        }
                    }
                ]
            },
            {
                "id": "sarutobi-asuma-self-sacrifice",
                "name": "Self-Sacrifice",
                "skillimage": "https://i.imgur.com/i3HWtZR.png",
                "skilldescription": "Sarutobi Asuma targets one ally. For 3 turns, all harmful skills used on this ally will be reflected to Sarutobi Asuma. During this time, Sarutobi Asuma can use this skill again for no cost to cancel it.",
                "energy": [
                    "Random"
                ],
                "target": "single-ally",
                "actorCondition": {
                    "missingStatusId": "asuma_self_sacrifice_active"
                },
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "asuma_self_sacrifice_reflect",
                        "duration": 3,
                        "scope": "target",
                        "metadata": {
                            "helpful": true,
                            "reflectNextIncomingSkill": true,
                            "reflectToSourceCaster": true,
                            "persistReflectAcrossTriggers": true,
                            "tooltipText": "All harmful skills used on this character will be reflected to Sarutobi Asuma."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "asuma_self_sacrifice_active",
                        "duration": 3,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillReplacements": {
                                "sarutobi-asuma-self-sacrifice": "sarutobi-asuma-cancel-self-sacrifice"
                            },
                            "tooltipText": "Self-Sacrifice is replaced by a free skill that cancels it."
                        }
                    }
                ]
            },
            {
                "id": "sarutobi-asuma-knife-block",
                "name": "Knife Block",
                "skillimage": "https://i.imgur.com/e4dn075.png",
                "skilldescription": "This skill makes Sarutobi Asuma invulnerable for 1 turn.",
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
            },
            {
                "id": "sarutobi-asuma-flying-swallow",
                "name": "Flying Swallow",
                "skillimage": "https://i.imgur.com/a50zdDY.png",
                "skilldescription": "Sarutobi Asuma deals 10 damage to all enemies for 3 turns. This ongoing action requires 'Sharpen Blades' to be used first and returns to 'Sharpen Blades' after use.",
                "energy": [
                    "Taijutsu",
                    "Ninjutsu"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 2,
                "cannotBeCountered": true,
                "cannotBeReflected": true,
                "classes": [
                    "Physical",
                    "Action"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "asuma_flying_swallow_dot",
                        "duration": 3,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 10,
                            "turnEndTrigger": "source_turn",
                            "turnDurationAnchor": "source_turn",
                            "ongoingClass": "action",
                            "triggerOnApply": true,
                            "tooltipText": "This character takes 10 damage from Flying Swallow. This action ends if Asuma is stunned or the target becomes invulnerable."
                        }
                    },
                    {
                        "type": "cleanse_statuses",
                        "scope": "self",
                        "statusId": "asuma_flying_swallow_ready"
                    }
                ],
                "hiddenFromSelectionViewer": true
            },
            {
                "id": "sarutobi-asuma-flying-kick",
                "name": "Flying Kick",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/skCMnBl.png",
                "skilldescription": "Sarutobi Asuma deals 35 damage to one enemy and stuns them for 1 turn. After use, this skill is replaced by 'Finishing Blow'.",
                "energy": [
                    "Taijutsu",
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
                        "amount": 35,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "asuma_flying_kick_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "cannotUseSkills": true,
                            "tooltipText": "This character is stunned by Flying Kick."
                        }
                    },
                    {
                        "type": "cleanse_statuses",
                        "scope": "self",
                        "statusId": "asuma_flying_kick_ready"
                    }
                ]
            },
            {
                "id": "sarutobi-asuma-cancel-self-sacrifice",
                "name": "Self-Sacrifice",
                "hiddenFromSelectionViewer": true,
                "omitFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/i3HWtZR.png",
                "skilldescription": "Cancels Self-Sacrifice for no cost.",
                "energy": [],
                "target": "self",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "cleanse_statuses",
                        "scope": "all-allies",
                        "statusId": "asuma_self_sacrifice_reflect",
                        "count": 1
                    },
                    {
                        "type": "cleanse_statuses",
                        "scope": "self",
                        "statusId": "asuma_self_sacrifice_active",
                        "count": 1
                    }
                ]
            }
        ]
    },
    {
        "id": "maito-gai",
        "characterId": "maito-gai",
        "name": "Maito Gai",
        "facePicture": "https://i.imgur.com/Kimqis6.png",
        "characterdeescription": "The squad leader of Team Gai, and father-like figure to Lee, Gai is a passionate man that's always there for those who need him. In combat, Gai's taijutsu has no equal, being able to open the Eight Gates and pound away at all threats.",
        "requiredMissionId": "team-9-the-best-taijutsu-team",
        "skills": [
            {
                "id": "maito-gai-leaf-whirlwind",
                "name": "Leaf Whirlwind",
                "skillimage": "https://i.imgur.com/5bcxm2m.png",
                "skilldescription": "Maito Gai deals 30 damage to one enemy. During 'Sixth Gate Opening', this skill will be improved and deal 60 piercing damage that ignores invulnerability.",
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
                    }
                ]
            },
            {
                "id": "maito-gai-sixth-gate-opening",
                "name": "Sixth Gate Opening",
                "skillimage": "https://i.imgur.com/Lf75g0n.png",
                "skilldescription": "Maito Gai takes 30 affliction damage. This effect cannot kill Maito Gai. The following 2 turns, 'Leaf Whirlwind' will deal 60 piercing damage that ignores invulnerability. During this time, Maito Gai is invulnerable.",
                "energy": [
                    "Taijutsu"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 4,
                "classes": [
                    "Strategic",
                    "Instant",
                    "Affliction"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "gai_sixth_gate",
                        "duration": 2,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "invulnerable": true,
                            "minimumHpFromSelfSkillDamage": 1,
                            "skillReplacements": {
                                "maito-gai-leaf-whirlwind": "maito-gai-leaf-whirlwind-empowered",
                                "maito-gai-counter-punch": "maito-gai-morning-peacock-feint"
                            },
                            "tooltipText": "Maito Gai is invulnerable. Leaf Whirlwind is empowered and Counter Punch becomes Morning Peacock Feint."
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 30,
                        "scope": "self",
                        "metadata": {
                            "afflictionDamage": true
                        }
                    }
                ]
            },
            {
                "id": "maito-gai-counter-punch",
                "name": "Counter Punch",
                "skillimage": "https://i.imgur.com/WN5AnD8.png",
                "skilldescription": "Maito Gai targets one enemy. If this enemy uses a new harmful skill the following turn, they will take 30 damage. This skill is invisible.",
                "energy": [
                    "Taijutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Strategic",
                    "Physical",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "gai_counter_punch_mark",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "hideTooltipFromUnitOwner": true,
                            "onOwnerUseSkillTrigger": true,
                            "onOwnerUseSkillHarmfulOnly": true,
                            "onOwnerUseSkillEffects": [
                                {
                                    "type": "damage",
                                    "amount": 30,
                                    "scope": "self"
                                }
                            ],
                            "tooltipText": "If this character uses a new harmful skill, they will take 30 damage.",
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            },
            {
                "id": "maito-gai-gai-dodge",
                "name": "Gai Dodge",
                "skillimage": "https://i.imgur.com/GtBoCxV.png",
                "skilldescription": "This skill makes Maito Gai invulnerable for 1 turn.",
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
            },
            {
                "id": "maito-gai-leaf-whirlwind-empowered",
                "name": "Leaf Whirlwind",
                "hiddenFromSelectionViewer": true,
                "skillimage": "deadcharacter.png",
                "skilldescription": "Maito Gai deals 60 piercing damage to one enemy that ignores invulnerability.",
                "energy": [
                    "Taijutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "ignoreInvulnerability": true,
                "classes": [
                    "Physical",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 60,
                        "scope": "target",
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    }
                ]
            },
            {
                "id": "maito-gai-morning-peacock-feint",
                "name": "Morning Peacock Feint",
                "hiddenFromSelectionViewer": true,
                "skillimage": "deadcharacter.png",
                "skilldescription": "Maito Gai targets himself or one ally. The following turn, the first harmful non-mental skill used on that target will be countered and the attacker will take 30 piercing damage. This skill is invisible.",
                "energy": [
                    "Taijutsu"
                ],
                "target": "self-or-single-ally",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Strategic",
                    "Physical",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "gai_morning_peacock_feint",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "helpful": true,
                            "hideTooltipFromEnemy": true,
                            "triggerOnEnemyHarmfulNonMental": true,
                            "counterCancelsSkill": true,
                            "counterDamage": 30,
                            "counterDamageIgnoresReduction": true,
                            "counterDamageIgnoresDestructibleDefense": true,
                            "tooltipText": "The first harmful non-mental skill used on this character will be countered and the attacker will take 30 piercing damage."
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "baki",
        "characterId": "baki",
        "name": "Baki",
        "facePicture": "https://i.imgur.com/pjjdWz8.png",
        "characterdeescription": "A Jounin of the Sand Village, and the leader of Gaara's team; Baki is cruel and ruthless, despite his normally calm nature. Baki fights using both taijutsu and ninjutsu together with top of the line Sand Village branded Flak Jackets.",
        "requiredMissionId": "sand-siblings-at-war",
        "skills": [
            {
                "id": "baki-sudden-strike",
                "name": "Sudden Strike",
                "skillimage": "https://i.imgur.com/tCTh2Ce.png",
                "skilldescription": "Baki destroys one enemy's destructible defense and then deals 20 piercing damage to them.",
                "energy": [
                    "Genjutsu"
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
                        "type": "destroy_destructible_defense",
                        "scope": "target"
                    },
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
                "id": "baki-wind-blade",
                "name": "Wind Blade",
                "skillimage": "https://i.imgur.com/yw1nPc2.png",
                "skilldescription": "Baki destroys one enemy's destructible defense and then deals 40 piercing damage to them.",
                "energy": [
                    "Ninjutsu",
                    "Genjutsu"
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
                        "type": "destroy_destructible_defense",
                        "scope": "target"
                    },
                    {
                        "type": "damage",
                        "amount": 40,
                        "scope": "target",
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    }
                ]
            },
            {
                "id": "baki-flak-jacket",
                "name": "Flak Jacket",
                "skillimage": "https://i.imgur.com/4i77YrB.png",
                "skilldescription": "Baki targets himself or an ally, granting this character 45 points of destructible defense for 4 turns. During this time, they will ignore enemy stun effects and affliction damage. This skill ends if the destructible defense is destroyed.",
                "energy": [
                    "Random",
                    "Random"
                ],
                "target": "self-or-single-ally",
                "damage": 0,
                "cooldown": 4,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "baki_flak_jacket",
                        "duration": 4,
                        "scope": "target",
                        "metadata": {
                            "helpful": true,
                            "destructibleDefensePoints": 45,
                            "cannotBeStunned": true,
                            "stunImmune": true,
                            "invulnerableToSkillClasses": [
                                "affliction"
                            ],
                            "tooltipText": "This character has 45 points of destructible defense from Flak Jacket, ignores stun effects, and is immune to affliction damage."
                        }
                    }
                ]
            },
            {
                "id": "baki-baki-teleportation",
                "name": "Baki Teleportation",
                "skillimage": "https://i.imgur.com/cMOrPng.png",
                "skilldescription": "This skill makes Baki invulnerable for 1 turn.",
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
    {
        "id": "yakushi-kabuto",
        "characterId": "yakushi-kabuto",
        "name": "Yakushi Kabuto",
        "facePicture": "https://i.imgur.com/uBA8Srn.png",
        "characterdeescription": "Kabuto is the close assistant and confidant to Orochimaru; calm, logical and highly intelligent, Kabuto is a mystery to many. Kabuto knows how to disrupt an enemy's body while regenerating his own.",
        "requiredMissionId": "survival",
        "skills": [
            {
                "id": "yakushi-kabuto-chakra-scalpel",
                "name": "Chakra Scalpel",
                "skillimage": "https://i.imgur.com/nHQweGx.png",
                "skilldescription": "Yakushi Kabuto deals 15 piercing damage to one enemy. For 1 turn, that enemy's skills will cost 1 additional random chakra and they will take 5 additional damage from physical and chakra skills. The following turn, 'Chakra Scalpel' will deal 10 additional damage.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Ninjutsu",
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
                        "type": "apply_status",
                        "statusId": "kabuto_chakra_scalpel_debuff",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "randomCostIncrease": 1,
                            "damageTakenBonusBySkillClass": {
                                "physical": 5,
                                "energy": 5,
                                "ninjutsu": 5
                            },
                            "tooltipText": "This character's skills cost 1 additional random chakra and they take 5 additional damage from physical and chakra skills."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kabuto_chakra_scalpel_bonus",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "replaceSkillDamageBonuses": true,
                            "removeSelfOnSkillUseCount": [
                                {
                                    "skillId": "yakushi-kabuto-chakra-scalpel",
                                    "atLeast": 1
                                }
                            ],
                            "skillDamageBonuses": {
                                "yakushi-kabuto-chakra-scalpel": 10
                            },
                            "tooltipText": "Chakra Scalpel deals 10 additional damage."
                        }
                    }
                ]
            },
            {
                "id": "yakushi-kabuto-yin-healing-wound-destruction",
                "name": "Yin Healing Wound Destruction",
                "skillimage": "https://i.imgur.com/YFKXdyo.png",
                "skilldescription": "Yakushi Kabuto first removes all enemy affliction skills from himself, then heals himself for 15 health each turn for 5 turns. This skill becomes 'Critical Injury' for 5 turns after used.",
                "energy": [
                    "Ninjutsu"
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
                        "type": "cleanse_statuses",
                        "scope": "self",
                        "sourceRelation": "enemy",
                        "metadataAny": [
                            "afflictionDamage"
                        ],
                        "harmfulOnly": true,
                        "count": 0
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kabuto_yin_healing_regen",
                        "duration": 5,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "turnEndHealFlat": 15,
                            "tooltipText": "Yakushi Kabuto heals 15 health each turn from Yin Healing Wound Destruction."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kabuto_yin_healing_replacement",
                        "duration": 5,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillReplacements": {
                                "yakushi-kabuto-yin-healing-wound-destruction": "yakushi-kabuto-critical-injury"
                            },
                            "tooltipText": "Yin Healing Wound Destruction is replaced by Critical Injury."
                        }
                    }
                ]
            },
            {
                "id": "yakushi-kabuto-temple-of-nirvana",
                "name": "Temple of Nirvana",
                "skillimage": "https://i.imgur.com/JyyJvB0.png",
                "skilldescription": "The following turn, any enemy that skips using a new skill will be stunned for 1 turn and take 5 additional damage from physical and chakra skills for 2 turns. This skill is invisible.",
                "energy": [
                    "Genjutsu"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "kabuto_temple_of_nirvana_watch",
                        "duration": 1,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "hideTooltipFromUnitOwner": true,
                            "copyTargetTotalSkillUseCountToKeys": [
                                "skillUseCountSnapshot"
                            ],
                            "onExpireEffectsIfNoNewSkillUsed": [
                                {
                                    "type": "apply_status",
                                    "statusId": "kabuto_temple_of_nirvana_stun",
                                    "duration": 1,
                                    "metadata": {
                                        "harmful": true,
                                        "cannotUseSkills": true,
                                        "tooltipText": "This character is stunned by Temple of Nirvana."
                                    }
                                },
                                {
                                    "type": "apply_status",
                                    "statusId": "kabuto_temple_of_nirvana_vulnerable",
                                    "duration": 2,
                                    "metadata": {
                                        "harmful": true,
                                        "damageTakenBonusBySkillClass": {
                                            "physical": 5,
                                            "energy": 5
                                        },
                                        "tooltipText": "This character takes 5 additional damage from physical and chakra skills."
                                    }
                                }
                            ],
                            "tooltipText": "If this character skips using a new skill, they are stunned for 1 turn and take 5 additional damage from physical and chakra skills for 2 turns.",
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            },
            {
                "id": "yakushi-kabuto-dead-soul-technique",
                "name": "Dead Soul Technique",
                "skillimage": "https://i.imgur.com/f88Jtva.png",
                "skilldescription": "This skill makes Yakushi Kabuto invulnerable for 1 turn.",
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
            },
            {
                "id": "yakushi-kabuto-critical-injury",
                "name": "Critical Injury",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/YdnlhyM.png",
                "skilldescription": "Yakushi Kabuto deals 25 damage to one enemy.",
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
                        "amount": 25,
                        "scope": "target"
                    }
                ]
            }
        ]
    },
    {
        "id": "tsunade",
        "characterId": "tsunade",
        "name": "Tsunade",
        "facePicture": "https://i.imgur.com/N6D7kcS.png",
        "characterdeescription": "One of the three sannins, Tsunade is a gambling, sake drinking loving woman with a tough exterior but soft interior. Tsunade is an expert at medical jutsu, using it to remove all her wounds, or delivering high impact kicks.",
        "requiredMissionId": "disciples-of-the-slug",
        "skills": [
            {
                "id": "tsunade-heavenly-foot-of-pain",
                "name": "Heavenly Foot of Pain",
                "skillimage": "https://i.imgur.com/pZx6mNz.png",
                "skilldescription": "Tsunade deals 30 damage to one enemy and stuns their physical, mental, and strategic skills for 1 turn.",
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
                        "statusId": "tsunade_heavenly_foot_of_pain_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkillClasses": [
                                "physical",
                                "mental",
                                "strategic"
                            ],
                            "tooltipText": "This character's physical, mental, and strategic skills are stunned.",
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            },
            {
                "id": "tsunade-creation-rebirth",
                "name": "Creation Rebirth",
                "skillimage": "https://i.imgur.com/nSlS0Nu.png",
                "skilldescription": "Tsunade removes all harmful effects on her and then sets her health to 100 (this is a healing effect).",
                "energy": [
                    "Ninjutsu",
                    "Ninjutsu"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "cleanse_statuses",
                        "scope": "self",
                        "harmfulOnly": true,
                        "count": 0
                    },
                    {
                        "type": "heal",
                        "amount": 999,
                        "scope": "self"
                    }
                ]
            },
            {
                "id": "tsunade-major-summoning-katsuyu",
                "name": "Major Summoning: Katsuyu",
                "skillimage": "https://i.imgur.com/bMT9EFI.png",
                "skilldescription": "Tsunade heals herself and her allies for 45 health. For the rest of the game, Tsunade's team will be healed for 5 health each turn, and this skill will be replaced by 'Slug Division'. This skill will end if Tsunade dies.",
                "energy": [
                    "Bloodline",
                    "Ninjutsu",
                    "Genjutsu"
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
                        "type": "heal",
                        "amount": 45,
                        "scope": "all-allies"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "tsunade_katsuyu_regen",
                        "duration": 99,
                        "scope": "all-allies",
                        "metadata": {
                            "helpful": true,
                            "ongoingClass": "action",
                            "turnEndHealFlat": 5,
                            "tooltipText": "This character heals 5 health each turn from Major Summoning: Katsuyu."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "tsunade_katsuyu_replacement",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "ongoingClass": "action",
                            "skillReplacements": {
                                "tsunade-major-summoning-katsuyu": "tsunade-slug-division"
                            },
                            "tooltipText": "Major Summoning: Katsuyu is replaced by Slug Division."
                        }
                    }
                ]
            },
            {
                "id": "tsunade-elbow-block",
                "name": "Elbow Block",
                "skillimage": "https://i.imgur.com/wS89CFy.png",
                "skilldescription": "This skill makes Tsunade invulnerable for 1 turn.",
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
            },
            {
                "id": "tsunade-slug-division",
                "name": "Slug Division",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/oyxiuxw.png",
                "skilldescription": "Tsunade heals her team for 10 health and grants them 10 points of permanent destructible defense.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "heal",
                        "amount": 10,
                        "scope": "all-allies"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "tsunade_slug_division_dd",
                        "duration": 99,
                        "scope": "all-allies",
                        "metadata": {
                            "helpful": true,
                            "destructibleDefensePoints": 10,
                            "mergeNumericAddKeys": [
                                "destructibleDefensePoints"
                            ],
                            "tooltipText": "This character has 10 points of permanent destructible defense from Slug Division."
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "jiraiya",
        "characterId": "jiraiya",
        "name": "Jiraiya",
        "facePicture": "https://i.imgur.com/7nC6nSS.png",
        "characterdeescription": "One of the three sannins, Jiraiya is a perverted frog hermit who travels the world in search of some sort of knowledge. Using numerous frog based summons, Jiraiya can greatly hinder his enemies all while setting them ablaze.",
        "requiredMissionId": "disciples-of-the-toad",
        "skills": [
            {
                "id": "jiraiya-great-spitting-fireball",
                "name": "Great Spitting Fireball",
                "skillimage": "https://i.imgur.com/dotn0mw.png",
                "skilldescription": "Jiraiya deals 20 affliction damage to one enemy and 10 affliction damage to all others.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Affliction",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 20,
                        "scope": "target",
                        "metadata": {
                            "afflictionDamage": true
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 10,
                        "scope": "all-other-enemy",
                        "metadata": {
                            "afflictionDamage": true
                        }
                    }
                ]
            },
            {
                "id": "jiraiya-summoning-toad-mouth-bind",
                "name": "Summoning: Toad Mouth Bind",
                "skillimage": "https://i.imgur.com/E0vmRac.png",
                "skilldescription": "For 2 turns, all enemies cannot reduce damage or become invulnerable. During this time, if Jiraiya or one of his allies is targeted by a new harmful physical skill, they become invulnerable for 1 turn.",
                "energy": [
                    "Genjutsu"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "jiraiya_toad_mouth_bind_debuff",
                        "duration": 2,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "cannotReduceDamage": true,
                            "cannotBecomeInvulnerable": true,
                            "tooltipText": "This character cannot reduce damage or become invulnerable."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "jiraiya_toad_mouth_bind_ward",
                        "duration": 2,
                        "scope": "all-allies",
                        "metadata": {
                            "helpful": true,
                            "triggerOnEnemyHarmfulSkillClassesAny": [
                                "physical"
                            ],
                            "counterApplyStatusToRecipient": {
                                "statusId": "invulnerable",
                                "duration": 1,
                                "metadata": {
                                    "invulnerable": true,
                                    "tooltipText": "This character is invulnerable."
                                }
                            },
                            "tooltipText": "If this character is targeted by a new harmful physical skill, they become invulnerable for 1 turn."
                        }
                    }
                ]
            },
            {
                "id": "jiraiya-major-summoning-gamabunta",
                "name": "Major Summoning: Gamabunta",
                "skillimage": "https://i.imgur.com/Qti5Che.png",
                "skilldescription": "Jiraiya deals 25 affliction damage to all enemies. For the rest of the game, the enemy team will take 5 additional damage from affliction skills and this skill will be replaced by 'Toad Oil Flame Bullet'.",
                "energy": [
                    "Taijutsu",
                    "Bloodline",
                    "Genjutsu"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Affliction",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 25,
                        "scope": "all-enemy",
                        "metadata": {
                            "afflictionDamage": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "jiraiya_gamabunta_vulnerable",
                        "duration": 99,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "damageTakenBonusBySkillClass": {
                                "affliction": 5
                            },
                            "tooltipText": "This character takes 5 additional damage from affliction skills."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "jiraiya_gamabunta_replacement",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillReplacements": {
                                "jiraiya-major-summoning-gamabunta": "jiraiya-toad-oil-flame-bullet"
                            },
                            "tooltipText": "Major Summoning: Gamabunta is replaced by Toad Oil Flame Bullet."
                        }
                    }
                ]
            },
            {
                "id": "jiraiya-spiked-budda",
                "name": "Spiked Budda",
                "skillimage": "https://i.imgur.com/0Lw6GVr.png",
                "skilldescription": "This skill makes Jiraiya invulnerable for 1 turn.",
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
            },
            {
                "id": "jiraiya-toad-oil-flame-bullet",
                "name": "Toad Oil Flame Bullet",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/UOM0Dx3.png",
                "skilldescription": "Jiraiya deals 15 affliction damage to all enemies for 2 turns.",
                "energy": [
                    "Ninjutsu",
                    "Random"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Affliction",
                    "Action"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "jiraiya_toad_oil_flame_bullet_dot",
                        "duration": 2,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "afflictionDamage": true,
                            "turnEndDamage": 15,
                            "turnEndTrigger": "source_turn",
                            "tooltipText": "This character takes 15 affliction damage each turn from Toad Oil Flame Bullet.",
                            "ongoingClass": "action"
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "orochimaru",
        "characterId": "orochimaru",
        "name": "Orochimaru",
        "facePicture": "https://i.imgur.com/xqD8hwf.png",
        "characterdeescription": "One of the three sannins, Orochimaru craves nothing more than to learn all the jutsu and abilities in the world. Orochimaru uses his snake summons and cursed seals to various effects, beating down his enemies regardless of their defenses.",
        "requiredMissionId": "disciples-of-the-snake",
        "skills": [
            {
                "id": "orochimaru-kusanagi",
                "name": "Kusanagi",
                "skillimage": "https://i.imgur.com/28mN4E1.png",
                "skilldescription": "Orochimaru destroys all of one enemy's destructible defense then deals 25 damage to them.",
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
                        "type": "destroy_destructible_defense",
                        "scope": "target"
                    },
                    {
                        "type": "damage",
                        "amount": 25,
                        "scope": "target"
                    }
                ]
            },
            {
                "id": "orochimaru-cursed-seal-technique",
                "name": "Cursed Seal Technique",
                "skillimage": "https://i.imgur.com/OPwllfS.png",
                "skilldescription": "Orochimaru targets one ally or one enemy, dealing 15 affliction damage to them. The target will gain 1 random chakra. This skill ignores invulnerability.",
                "energy": [],
                "target": "single-character",
                "damage": 0,
                "cooldown": 3,
                "ignoreInvulnerability": true,
                "classes": [
                    "Affliction",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 15,
                        "scope": "target",
                        "metadata": {
                            "afflictionDamage": true
                        }
                    },
                    {
                        "type": "gain_chakra",
                        "amount": 1,
                        "chakraType": "random",
                        "scope": "target"
                    }
                ]
            },
            {
                "id": "orochimaru-major-summoning-manda",
                "name": "Major Summoning: Manda",
                "skillimage": "https://i.imgur.com/YQEJtJR.png",
                "skilldescription": "Orochimaru deals 45 damage to one enemy. For the rest of the game, Orochimaru will gain 1 additional random chakra each turn, and this skill will be replaced by 'Constrict and Bite'. This skill will end if Orochimaru dies.",
                "energy": [
                    "Taijutsu",
                    "Bloodline",
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
                        "amount": 45,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "orochimaru_manda_chakra_gain",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "ongoingClass": "action",
                            "turnEndGainChakra": {
                                "chakraType": "random",
                                "amount": 1
                            },
                            "turnEndTrigger": "source_turn",
                            "tooltipText": "Orochimaru gains 1 additional random chakra each turn."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "orochimaru_manda_replacement",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "ongoingClass": "action",
                            "skillReplacements": {
                                "orochimaru-major-summoning-manda": "orochimaru-constrict-and-bite"
                            },
                            "tooltipText": "Major Summoning: Manda is replaced by Constrict and Bite."
                        }
                    }
                ]
            },
            {
                "id": "orochimaru-earth-clone-technique",
                "name": "Earth Clone Technique",
                "skillimage": "https://i.imgur.com/yqkQKWQ.png",
                "skilldescription": "This skill makes Orochimaru invulnerable for 1 turn.",
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
            },
            {
                "id": "orochimaru-constrict-and-bite",
                "name": "Constrict and Bite",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/ZZj6kHM.png",
                "skilldescription": "Orochimaru stuns one enemy for 1 turn. The following turn, Orochimaru will deal 30 damage to them.",
                "energy": [
                    "Random",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Physical",
                    "Control"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "orochimaru_constrict_bite_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkills": true,
                            "onExpireEffects": [
                                {
                                    "type": "damage",
                                    "amount": 30
                                }
                            ],
                            "tooltipText": "This character is stunned by Constrict and Bite and will take 30 damage when it ends.",
                            "ongoingClass": "control",
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "edo-tensei-hashirama",
        "characterId": "edo-tensei-hashirama",
        "name": "Edo Tensei Hashirama",
        "facePicture": "https://i.imgur.com/XKnOdST.png",
        "characterdeescription": "The first Hokage, and founder of the Hidden Leaf Village; Hashirama, a member of the legendary Senju clan. Hashirama has the unique ability to give life to trees, creating them, and manipulating them to assault the enemy team while protecting his own.",
        "requiredMissionId": "the-resurrection-of-the-first",
        "skills": [
            {
                "id": "edo-tensei-hashirama-tree-wave-destruction",
                "name": "Tree Wave Destruction",
                "skillimage": "https://i.imgur.com/N1okEw0.png",
                "skilldescription": "Edo Tensei Hashirama deals 10 damage to all enemies and grants his team 5 points of permanent destructible defense.",
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
                        "amount": 10,
                        "scope": "all-enemy"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "edo_tensei_hashirama_tree_wave_defense",
                        "duration": 99,
                        "scope": "all-allies",
                        "metadata": {
                            "helpful": true,
                            "destructibleDefensePoints": 5,
                            "mergeNumericAddKeys": [
                                "destructibleDefensePoints"
                            ],
                            "tooltipText": "This character has 5 points of permanent destructible defense from Tree Wave Destruction."
                        }
                    }
                ]
            },
            {
                "id": "edo-tensei-hashirama-tree-strangulation",
                "name": "Tree Strangulation",
                "skillimage": "https://i.imgur.com/A3Xmo68.png",
                "skilldescription": "Edo Tensei Hashirama deals 20 damage to one enemy and stuns their physical and energy skills for 1 turn. During 'A World of Trees', this skill will stun all skills.",
                "energy": [
                    "Bloodline"
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
                        "type": "apply_status",
                        "statusId": "edo_tensei_hashirama_tree_strangulation_stun_partial",
                        "duration": 1,
                        "scope": "target",
                        "condition": {
                            "scope": "self",
                            "missingStatusId": "edo_tensei_hashirama_world_of_trees"
                        },
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkillClasses": [
                                "physical",
                                "energy",
                                "ninjutsu"
                            ],
                            "tooltipText": "This character's physical and energy skills are stunned by Tree Strangulation.",
                            "turnDurationAnchor": "source_turn"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "edo_tensei_hashirama_tree_strangulation_stun_full",
                        "duration": 1,
                        "scope": "target",
                        "condition": {
                            "scope": "self",
                            "statusId": "edo_tensei_hashirama_world_of_trees"
                        },
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkills": true,
                            "tooltipText": "This character is stunned by Tree Strangulation.",
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            },
            {
                "id": "edo-tensei-hashirama-a-world-of-trees",
                "name": "A World of Trees",
                "skillimage": "https://i.imgur.com/spbtu4f.png",
                "skilldescription": "For 2 turns, all enemies' physical, energy, and strategic skills cost 1 additional random chakra and their cooldowns are increased by 1 turn. During this time, this skill can be used again to grant Edo Tensei Hashirama's team 30 points of permanent destructible defense and to stun all enemies' skills for 1 turn.",
                "energy": [
                    "Bloodline",
                    "Bloodline"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "edo_tensei_hashirama_world_of_trees_defense",
                        "duration": 99,
                        "scope": "all-allies",
                        "condition": {
                            "scope": "self",
                            "statusId": "edo_tensei_hashirama_world_of_trees"
                        },
                        "metadata": {
                            "helpful": true,
                            "destructibleDefensePoints": 30,
                            "mergeNumericAddKeys": [
                                "destructibleDefensePoints"
                            ],
                            "tooltipText": "This character has 30 points of permanent destructible defense from A World of Trees."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "edo_tensei_hashirama_world_of_trees_stun",
                        "duration": 1,
                        "scope": "all-enemy",
                        "condition": {
                            "scope": "self",
                            "statusId": "edo_tensei_hashirama_world_of_trees"
                        },
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkills": true,
                            "tooltipText": "This character is stunned by A World of Trees.",
                            "turnDurationAnchor": "source_turn"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "edo_tensei_hashirama_world_of_trees_enemy_cost",
                        "duration": 2,
                        "scope": "all-enemy",
                        "condition": {
                            "scope": "self",
                            "missingStatusId": "edo_tensei_hashirama_world_of_trees"
                        },
                        "metadata": {
                            "harmful": true,
                            "randomCostIncreaseForSkillClasses": {
                                "physical": 1,
                                "energy": 1,
                                "strategic": 1,
                                "ninjutsu": 1
                            },
                            "tooltipText": "This character's physical, energy, and strategic skills cost 1 additional random chakra."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "edo_tensei_hashirama_world_of_trees",
                        "duration": 2,
                        "scope": "self",
                        "condition": {
                            "scope": "self",
                            "missingStatusId": "edo_tensei_hashirama_world_of_trees"
                        },
                        "metadata": {
                            "helpful": true,
                            "usedSkillCooldownPenalty": 1,
                            "tooltipText": "All enemies who use a new skill will have that skill's cooldown increased by 1. Edo Tensei Hashirama can use 'A World of Trees' again for a bonus."
                        }
                    }
                ]
            },
            {
                "id": "edo-tensei-hashirama-deflection",
                "name": "Deflection",
                "skillimage": "https://i.imgur.com/GKhZ1S9.png",
                "skilldescription": "This skill makes Edo Tensei Hashirama invulnerable for 1 turn.",
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
                        "statusId": "edo_tensei_hashirama_deflection",
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
    {
        "id": "edo-tensei-tobirama",
        "characterId": "edo-tensei-tobirama",
        "name": "Edo Tensei Tobirama",
        "facePicture": "https://i.imgur.com/D1qp4Pu.png",
        "characterdeescription": "The second Hokage of the Hidden Leaf Village; Tobirama, a member of the Senju clan, puts the well being of the village and people above all else. Tobirama is a master of many jutsu, using both ninjutsu and genjutsu to stop his enemies in different ways.",
        "requiredMissionId": "the-resurrection-of-the-second",
        "skills": [
            {
                "id": "edo-tensei-tobirama-water-assault",
                "name": "Water Assault",
                "skillimage": "https://i.imgur.com/fMuYLsW.png",
                "skilldescription": "Edo Tensei Tobirama makes one enemy ignore all helpful effects except energy cost changes for 1 turn and deals 15 damage to them.",
                "energy": [
                    "Ninjutsu",
                    "Genjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Ninjutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "edo_tensei_tobirama_water_assault_seal",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "invulnerableToHelpfulSkills": true,
                            "tooltipText": "This character ignores all helpful effects except energy cost changes.",
                            "turnDurationAnchor": "source_turn"
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 15,
                        "scope": "target"
                    }
                ]
            },
            {
                "id": "edo-tensei-tobirama-water-colliding-wave",
                "name": "Water Colliding Wave",
                "skillimage": "https://i.imgur.com/rt5NJBN.png",
                "skilldescription": "Edo Tensei Tobirama deals 15 damage to all enemies for 3 turns and stuns their affliction skills each turn. During this time, 'Water Assault' will deal 15 additional damage.",
                "energy": [
                    "Ninjutsu",
                    "Genjutsu"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Ninjutsu",
                    "Action"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "edo_tensei_tobirama_water_colliding_wave_dot",
                        "duration": 3,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 15,
                            "turnEndTrigger": "source_turn",
                            "ongoingClass": "action",
                            "cannotUseSkillClasses": [
                                "affliction"
                            ],
                            "tooltipText": "This character takes 15 damage each turn and their affliction skills are stunned."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "edo_tensei_tobirama_water_colliding_wave_buff",
                        "duration": 3,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillDamageBonuses": {
                                "edo-tensei-tobirama-water-assault": 15
                            },
                            "tooltipText": "Water Assault deals 15 additional damage.",
                            "ongoingClass": "action"
                        }
                    }
                ]
            },
            {
                "id": "edo-tensei-tobirama-bringer-of-darkness",
                "name": "Bringer of Darkness",
                "skillimage": "https://i.imgur.com/Jq7lvi0.png",
                "skilldescription": "Edo Tensei Tobirama makes his team invulnerable to all physical and strategic skills for 1 turn.",
                "energy": [
                    "Genjutsu"
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
                        "statusId": "edo_tensei_tobirama_bringer_of_darkness",
                        "duration": 1,
                        "scope": "all-allies",
                        "metadata": {
                            "helpful": true,
                            "invulnerableToSkillClasses": [
                                "physical",
                                "strategic"
                            ],
                            "tooltipText": "This character is invulnerable to physical and strategic skills."
                        }
                    }
                ]
            },
            {
                "id": "edo-tensei-tobirama-water-encampment-wall",
                "name": "Water Encampment Wall",
                "skillimage": "https://i.imgur.com/3rOMjSA.png",
                "skilldescription": "This skill makes Edo Tensei Tobirama invulnerable for 1 turn.",
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
                        "statusId": "edo_tensei_tobirama_water_encampment_wall",
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
    {
        "id": "sarutobi-hiruzen",
        "characterId": "sarutobi-hiruzen",
        "name": "Sarutobi Hiruzen",
        "facePicture": "https://i.imgur.com/OVXPrec.png",
        "characterdeescription": "The third and most recent Hokage of the Hidden Leaf Village to die; Hiruzen, known as the God of Shinobi was considered to be one of the strongest ninja alive in his prime. While powerful using just his normal jutsu, Hiruzen is able to pull out a trump card when desperation strikes.",
        "requiredMissionId": "the-god-of-the-shinobi",
        "skills": [
            {
                "id": "sarutobi-hiruzen-fire-dragon-flame-bullet",
                "name": "Fire Dragon Flame Bullet",
                "skillimage": "https://i.imgur.com/ljmijF8.png",
                "skilldescription": "Sarutobi Hiruzen deals 30 affliction damage to one enemy. The following turn, that enemy will take 10 affliction damage.",
                "energy": [
                    "Ninjutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Affliction",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 30,
                        "scope": "target",
                        "metadata": {
                            "afflictionDamage": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "sarutobi_hiruzen_fire_dragon_dot",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "tooltipText": "This character will take 10 affliction damage next turn from Fire Dragon Flame Bullet.",
                            "onExpireEffects": [
                                {
                                    "type": "damage",
                                    "amount": 10,
                                    "metadata": {
                                        "afflictionDamage": true
                                    }
                                }
                            ],
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            },
            {
                "id": "sarutobi-hiruzen-dead-demon-consuming-seal",
                "name": "Dead Demon Consuming Seal",
                "skillimage": "https://i.imgur.com/HjM3iLD.png",
                "skilldescription": "Permanently, one enemy takes 40 affliction damage, is stunned and cannot reduce damage or become invulnerable each turn. Sarutobi Hiruzen himself takes 20 affliction damage and is stunned each turn. This skill cannot be removed or ignored and will end when Sarutobi Hiruzen dies.",
                "energy": [
                    "Random",
                    "Random",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Affliction",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 40,
                        "scope": "target",
                        "metadata": {
                            "afflictionDamage": true
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 20,
                        "scope": "self",
                        "metadata": {
                            "afflictionDamage": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "sarutobi_hiruzen_dead_demon_seal_enemy",
                        "duration": 99,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "ongoingClass": "action",
                            "ignoreOngoingSourceStun": true,
                            "afflictionDamage": true,
                            "cannotUseSkills": true,
                            "cannotReduceDamage": true,
                            "cannotBecomeInvulnerable": true,
                            "cannotBeCleansed": true,
                            "turnEndDamage": 40,
                            "turnEndTrigger": "source_turn",
                            "tooltipText": "This character takes 40 affliction damage each turn, is stunned, and cannot reduce damage or become invulnerable. This effect cannot be removed or ignored and ends if Sarutobi Hiruzen dies."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "sarutobi_hiruzen_dead_demon_seal_self",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "harmful": true,
                            "ongoingClass": "action",
                            "ignoreOngoingSourceStun": true,
                            "afflictionDamage": true,
                            "cannotUseSkills": true,
                            "cannotBeCleansed": true,
                            "turnEndDamage": 20,
                            "turnEndTrigger": "source_turn",
                            "tooltipText": "Sarutobi Hiruzen takes 20 affliction damage each turn and is stunned."
                        }
                    }
                ]
            },
            {
                "id": "sarutobi-hiruzen-major-summoning-enma",
                "name": "Major Summoning: Enma",
                "skillimage": "https://i.imgur.com/O3lc03n.png",
                "skilldescription": "Sarutobi Hiruzen and his team become invulnerable for 1 turn. For the rest of the game, Sarutobi Hiruzen will deal 5 damage to all enemies each turn, Sarutobi Hiruzen's team will gain 5 points of damage reduction, and this skill will be replaced by 'Adamantine Prison Wall'. This skill will end if Sarutobi Hiruzen dies.",
                "energy": [
                    "Taijutsu",
                    "Ninjutsu",
                    "Genjutsu"
                ],
                "target": "all-allies",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Physical",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "sarutobi_hiruzen_enma_invuln",
                        "duration": 1,
                        "scope": "all-allies",
                        "metadata": {
                            "helpful": true,
                            "invulnerable": true,
                            "tooltipText": "This character is invulnerable."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "sarutobi_hiruzen_enma_dot",
                        "duration": 99,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "ongoingClass": "action",
                            "turnEndDamage": 5,
                            "turnEndTrigger": "source_turn",
                            "tooltipText": "This character takes 5 damage each turn from Major Summoning: Enma."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "sarutobi_hiruzen_enma_dr",
                        "duration": 99,
                        "scope": "all-allies",
                        "metadata": {
                            "helpful": true,
                            "ongoingClass": "action",
                            "damageReductionFlat": 5,
                            "tooltipText": "This character has 5 points of damage reduction from Major Summoning: Enma."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "sarutobi_hiruzen_enma_replace",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "ongoingClass": "action",
                            "skillReplacements": {
                                "sarutobi-hiruzen-major-summoning-enma": "sarutobi-hiruzen-adamantine-prison-wall"
                            },
                            "tooltipText": "Major Summoning: Enma is replaced by Adamantine Prison Wall."
                        }
                    }
                ]
            },
            {
                "id": "sarutobi-hiruzen-earth-style-wall",
                "name": "Earth-Style Wall",
                "skillimage": "https://i.imgur.com/w8Zg0Py.png",
                "skilldescription": "This skill makes Sarutobi Hiruzen invulnerable for 1 turn.",
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
                        "statusId": "sarutobi_hiruzen_earth_style_wall",
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
                "id": "sarutobi-hiruzen-adamantine-prison-wall",
                "name": "Adamantine Prison Wall",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/O3lc03n.png",
                "skilldescription": "For 1 turn, Sarutobi Hiruzen and his team will gain 20 points of unpierceable damage reduction and they cannot be killed.",
                "energy": [
                    "Taijutsu"
                ],
                "target": "all-allies",
                "damage": 0,
                "cooldown": 4,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "sarutobi_hiruzen_adamantine_wall",
                        "duration": 1,
                        "scope": "all-allies",
                        "metadata": {
                            "helpful": true,
                            "unpierceableDamageReductionFlat": 20,
                            "minimumHp": 1,
                            "tooltipText": "This character has 20 points of unpierceable damage reduction and cannot be killed."
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "kyuubi-naruto",
        "characterId": "kyuubi-naruto",
        "name": "Kyuubi Naruto",
        "facePicture": "https://i.imgur.com/hOCQuU9.png",
        "characterdeescription": "Naruto's anger and desperation has forced the Kyuubi's chakra to come up to the surface, changing Naruto into a single-minded beast with a nearly endless amount of chakra. With the Kyuubi chakra around Naruto, he is able to unleash powerful waves of raw chakra to endow his power further, or gather it back to guard and heal him.",
        "requiredMissionId": "the-rise-of-a-jinchuuriki",
        "skills": [
            {
                "id": "kyuubi-naruto-kyuubi-rasengan",
                "name": "Kyuubi Rasengan",
                "skillimage": "https://i.imgur.com/X6CF3vc.png",
                "skilldescription": "Kyuubi Naruto deals 35 damage to one enemy and stuns them for 1 turn. Kyuubi Naruto will take 5 affliction damage.",
                "energy": [
                    "Ninjutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Ninjutsu",
                    "Instant",
                    "Affliction"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 35,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kyuubi_naruto_rasengan_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkills": true,
                            "tooltipText": "This character is stunned.",
                            "turnDurationAnchor": "source_turn"
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 5,
                        "scope": "self",
                        "metadata": {
                            "afflictionDamage": true
                        }
                    }
                ]
            },
            {
                "id": "kyuubi-naruto-kyuubi-rage",
                "name": "Kyuubi Rage",
                "skillimage": "https://i.imgur.com/wAfz5KW.png",
                "skilldescription": "Kyuubi Naruto deals 15 damage to all enemies for 3 turns. During this time, 'Kyuubi Rasengan' will deal 10 additional damage. 'Kyuubi Chakra' may not be used during this time.",
                "energy": [
                    "Taijutsu",
                    "Bloodline"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 3,
                "actorCondition": {
                    "missingStatusId": "kyuubi_naruto_chakra_buff"
                },
                "classes": [
                    "Ninjutsu",
                    "Action"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "kyuubi_naruto_rage_dot",
                        "duration": 3,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 15,
                            "turnEndTrigger": "source_turn",
                            "tooltipText": "This character takes 15 damage each turn from Kyuubi Rage.",
                            "ongoingClass": "action"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kyuubi_naruto_rage_buff",
                        "duration": 3,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillDamageBonuses": {
                                "kyuubi-naruto-kyuubi-rasengan": 10
                            },
                            "tooltipText": "Kyuubi Rasengan deals 10 additional damage. Kyuubi Chakra cannot be used.",
                            "ongoingClass": "action"
                        }
                    }
                ]
            },
            {
                "id": "kyuubi-naruto-kyuubi-chakra",
                "name": "Kyuubi Chakra",
                "skillimage": "https://i.imgur.com/LazNndR.png",
                "skilldescription": "Kyuubi Naruto heals himself for 15 health each turn for 5 turns. During this time, Kyuubi Naruto will gain 15 points of damage reduction and 'Kyuubi Rasengan' will deal 5 less damage. 'Kyuubi Rage' may not be used during this time.",
                "energy": [
                    "Bloodline",
                    "Random"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 5,
                "actorCondition": {
                    "missingStatusId": "kyuubi_naruto_rage_buff"
                },
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "kyuubi_naruto_chakra_buff",
                        "duration": 5,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "turnEndHealFlat": 15,
                            "damageReductionFlat": 15,
                            "skillDamageBonuses": {
                                "kyuubi-naruto-kyuubi-rasengan": -5
                            },
                            "tooltipText": "Kyuubi Naruto heals 15 health each turn, has 15 points of damage reduction, and Kyuubi Rasengan deals 5 less damage. Kyuubi Rage cannot be used."
                        }
                    }
                ]
            },
            {
                "id": "kyuubi-naruto-kyuubi-dodge",
                "name": "Kyuubi Dodge",
                "skillimage": "https://i.imgur.com/4ZFrdfW.png",
                "skilldescription": "This skill makes Kyuubi Naruto invulnerable for 1 turn.",
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
                        "statusId": "kyuubi_naruto_dodge",
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
    {
        "id": "cursed-seal-lv1-sasuke",
        "characterId": "cursed-seal-lv1-sasuke",
        "name": "Cursed Seal Lv1 Sasuke",
        "facePicture": "https://i.imgur.com/9KgJEk8.png",
        "characterdeescription": "Sasuke is pushed into his maximum during the Chuunin Exams and ends awakening his Cursed Seal to fight the Sound Genin and save Sakura. Sasuke is not in full control of the seal yet, but his anger and power were already raised a lot. ORIGINAL DESIGN: TheDarkLegend",
        "requiredMissionId": "dark-enhancing",
        "skills": [
            {
                "id": "cursed-seal-lv1-sasuke-silent-blow",
                "name": "Silent Blow",
                "skillimage": "https://i.imgur.com/CDW4x4g.png",
                "skilldescription": "Cursed Seal Lv1 Sasuke deals 25 damage to one enemy. The following turn, Cursed Seal Lv1 Sasuke's skills will deal 5 additional damage.",
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
                        "amount": 25,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "cursed_seal_lv1_sasuke_silent_blow_delay",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "tooltipText": "This character's skills will deal 5 additional damage next turn.",
                            "onExpireEffects": [
                                {
                                    "type": "apply_status",
                                    "statusId": "cursed_seal_lv1_sasuke_silent_blow_buff",
                                    "duration": 1,
                                    "metadata": {
                                        "helpful": true,
                                        "damageBonusFlat": 5,
                                        "tooltipText": "This character's skills deal 5 additional damage."
                                    }
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "cursed-seal-lv1-sasuke-cursed-chidori",
                "name": "Cursed Chidori",
                "skillimage": "https://i.imgur.com/ApGd3KB.png",
                "skilldescription": "Cursed Seal Lv1 Sasuke deals 25 piercing damage to one enemy. The following turn, Cursed Seal Lv1 Sasuke's skills will deal 5 additional damage.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Ninjutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 25,
                        "scope": "target",
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "cursed_seal_lv1_sasuke_cursed_chidori_delay",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "tooltipText": "This character's skills will deal 5 additional damage next turn.",
                            "onExpireEffects": [
                                {
                                    "type": "apply_status",
                                    "statusId": "cursed_seal_lv1_sasuke_cursed_chidori_buff",
                                    "duration": 1,
                                    "metadata": {
                                        "helpful": true,
                                        "damageBonusFlat": 5,
                                        "tooltipText": "This character's skills deal 5 additional damage."
                                    }
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "cursed-seal-lv1-sasuke-cursed-sharingan",
                "name": "Cursed Sharingan",
                "skillimage": "https://i.imgur.com/QKXCpCn.png",
                "skilldescription": "For 3 turns, Cursed Seal Lv1 Sasuke gains 10 points of damage reduction and targets all enemies. If they use a new harmful skill, they will take 10 additional physical and chakra damage for 1 turn. This skill cannot be countered and ends if Cursed Seal Lv1 Sasuke dies.",
                "energy": [
                    "Random"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 3,
                "cannotBeCountered": true,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "cursed_seal_lv1_sasuke_cursed_sharingan_dr",
                        "duration": 3,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "damageReductionFlat": 10,
                            "tooltipText": "This character has 10 points of damage reduction."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "cursed_seal_lv1_sasuke_cursed_sharingan_trap",
                        "duration": 3,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "hideTooltipFromEnemy": true,
                            "triggerOnEnemyHarmfulSkill": true,
                            "counterStatusId": "cursed_seal_lv1_sasuke_cursed_sharingan_vulnerability",
                            "counterStatusDuration": 1,
                            "counterStatusMetadata": {
                                "harmful": true,
                                "damageTakenBonusBySkillClass": {
                                    "physical": 10,
                                    "energy": 10
                                },
                                "tooltipText": "This character takes 10 additional physical and chakra damage."
                            },
                            "tooltipText": "If this character uses a new harmful skill, they will take 10 additional physical and chakra damage."
                        }
                    }
                ]
            },
            {
                "id": "cursed-seal-lv1-sasuke-dark-aura",
                "name": "Dark Aura",
                "skillimage": "https://i.imgur.com/WQWQgc5.png",
                "skilldescription": "This skill makes Cursed Seal Lv1 Sasuke invulnerable for 1 turn.",
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
                        "statusId": "cursed_seal_lv1_sasuke_dark_aura",
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
    {
        "id": "cursed-seal-sasuke",
        "characterId": "cursed-seal-sasuke",
        "name": "Cursed Seal Sasuke",
        "facePicture": "https://i.imgur.com/h62tBoY.png",
        "characterdeescription": "Having gotten used to the Cursed Seal, Sasuke is able to draw Orochimaru's vile chakra through it, becoming a twisted hideous version of himself, but also getting stronger and faster. With the Cursed Seal, Sasuke's powers have exponentially increased, allowing him to pierce or trap enemies with his dark chakra.",
        "requiredMissionId": "descent-into-darkness",
        "skills": [
            {
                "id": "cursed-seal-sasuke-corrupt-chidori",
                "name": "Corrupt Chidori",
                "skillimage": "https://i.imgur.com/JuEWNgD.png",
                "skilldescription": "Cursed Seal Sasuke deals 45 damage to one enemy, reducing their non-affliction damage by 20 for 2 turns.",
                "energy": [
                    "Ninjutsu",
                    "Ninjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Ninjutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 45,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "cursed_seal_sasuke_corrupt_chidori_debuff",
                        "duration": 2,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "nonAfflictionDamageDebuffFlat": 20,
                            "tooltipText": "This character deals 20 less non-affliction damage."
                        }
                    }
                ]
            },
            {
                "id": "cursed-seal-sasuke-dark-void",
                "name": "Dark Void",
                "skillimage": "https://i.imgur.com/ybMA3WL.png",
                "skilldescription": "Cursed Seal Sasuke stuns one enemy for 2 turns, makes them invulnerable to harmful skills for 1 turn and invulnerable to helpful skills for 2 turns. When this skill ends, this enemy will take 55 damage. This skill will end if Cursed Seal Sasuke dies.",
                "energy": [
                    "Ninjutsu",
                    "Ninjutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 5,
                "classes": [
                    "Strategic",
                    "Ninjutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "cursed_seal_sasuke_dark_void_stun",
                        "duration": 2,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkills": true,
                            "invulnerableToHelpfulSkills": true,
                            "tooltipText": "This character is stunned, invulnerable to helpful skills, and will take 55 damage when this ends.",
                            "onExpireEffects": [
                                {
                                    "type": "damage",
                                    "amount": 55
                                }
                            ]
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "cursed_seal_sasuke_dark_void_invuln_harmful",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "invulnerableToHarmfulEffects": true,
                            "tooltipText": "This character is invulnerable to harmful skills.",
                            "turnDurationAnchor": "source_turn"
                        }
                    }
                ]
            },
            {
                "id": "cursed-seal-sasuke-cursed-seal",
                "name": "Cursed Seal",
                "skillimage": "https://i.imgur.com/0Fk3SCs.png",
                "skilldescription": "Cursed Seal Sasuke becomes invulnerable for 1 turn and takes 15 affliction damage that cannot kill him. For 1 turn, 'Corrupt Chidori' will cost 1 random energy instead and 'Dark Void' will cost 2 random energies instead. For 2 turns, Cursed Seal Sasuke will ignore healing effects.",
                "energy": [
                    "Bloodline"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Strategic",
                    "Instant",
                    "Affliction"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "cursed_seal_sasuke_cursed_seal_floor",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "minimumHp": 1,
                            "tooltipText": "This character cannot be killed."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "cursed_seal_sasuke_cursed_seal_invuln",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "invulnerable": true,
                            "tooltipText": "This character is invulnerable."
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 15,
                        "scope": "self",
                        "metadata": {
                            "afflictionDamage": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "cursed_seal_sasuke_cursed_seal_cost",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillCostOverridesBySkillId": {
                                "cursed-seal-sasuke-corrupt-chidori": {
                                    "energy": [
                                        "Random"
                                    ]
                                },
                                "cursed-seal-sasuke-dark-void": {
                                    "energy": [
                                        "Random",
                                        "Random"
                                    ]
                                }
                            },
                            "tooltipText": "Corrupt Chidori costs 1 random chakra and Dark Void costs 2 random chakra."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "cursed_seal_sasuke_cursed_seal_no_heal",
                        "duration": 2,
                        "scope": "self",
                        "metadata": {
                            "harmful": true,
                            "healReceivedMultiplier": 0,
                            "tooltipText": "This character ignores healing effects."
                        }
                    }
                ]
            },
            {
                "id": "cursed-seal-sasuke-sharingan-evasion",
                "name": "Sharingan Evasion",
                "skillimage": "https://i.imgur.com/gz8961h.png",
                "skilldescription": "This skill makes Cursed Seal Sasuke invulnerable for 1 turn.",
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
                        "statusId": "cursed_seal_sasuke_sharingan_evasion",
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
    {
        "id": "butterfly-chouji",
        "characterId": "butterfly-chouji",
        "name": "Butterfly Chouji",
        "facePicture": "https://i.imgur.com/UoRyA7v.png",
        "characterdeescription": "Chouji has evolved into butterfly mode by consuming all three akimichi's coloured pills, gaining incredible speed and strenght at the cost of rapid weight loss. ORIGINAL DESIGN: AnteMito",
        "requiredMissionId": "chouji-awakens",
        "skills": [
            {
                "id": "butterfly-chouji-chakra-wings",
                "name": "Chakra Wings",
                "skillimage": "https://i.imgur.com/4J4U6wU.png",
                "skilldescription": "Butterfly Chouji gains 10 points of damage reduction and 10 points of destructible defense. He will take 5 affliction damage each turn. Butterfly Chouji can use his other skills while this is active. Butterfly Chouji's skills will deal 5 additional damage every turn with a max of 10 stacks. This skill may be used once and is permanent. This skill cannot be removed.",
                "energy": [],
                "target": "self",
                "damage": 0,
                "cooldown": 0,
                "actorCondition": {
                    "missingStatusId": "butterfly_chouji_chakra_wings_active"
                },
                "classes": [
                    "Strategic",
                    "Instant",
                    "Affliction"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "butterfly_chouji_chakra_wings_active",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "cannotBeCleansed": true,
                            "damageReductionFlat": 10,
                            "destructibleDefensePoints": 10,
                            "afflictionDamage": true,
                            "turnEndDamage": 5,
                            "turnEndTrigger": "source_turn",
                            "damageBonusFlat": 5,
                            "growPerTurn": [
                                {
                                    "key": "damageBonusFlat",
                                    "amount": 5,
                                    "max": 50
                                }
                            ],
                            "tooltipText": "Butterfly Chouji has 10 points of damage reduction and 10 points of destructible defense.\nButterfly Chouji takes 5 affliction damage each turn.\nButterfly Chouji's skills deal 5 additional damage, increasing by 5 each turn up to 50 additional damage."
                        }
                    }
                ]
            },
            {
                "id": "butterfly-chouji-butterfly-bullet-bombing",
                "name": "Butterfly Bullet Bombing",
                "skillimage": "https://i.imgur.com/Icq6uAf.png",
                "skilldescription": "Butterfly Chouji targets one enemy, destroying all destructible defense that target has and then dealing 20 damage to them. This skill cannot be countered and can only be used during 'Chakra Wings'.",
                "energy": [
                    "Taijutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "cannotBeCountered": true,
                "actorCondition": {
                    "statusId": "butterfly_chouji_chakra_wings_active"
                },
                "classes": [
                    "Physical",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "destroy_destructible_defense",
                        "scope": "target"
                    },
                    {
                        "type": "damage",
                        "amount": 20,
                        "scope": "target"
                    }
                ]
            },
            {
                "id": "butterfly-chouji-enemy-immobilization",
                "name": "Enemy Immobilization",
                "skillimage": "https://i.imgur.com/yGZ8NW9.png",
                "skilldescription": "Butterfly Chouji deals 5 damage to one enemy. For 1 turn, that enemy's skills will be stunned and Butterfly Chouji will ignore enemy stun effects. This skill may only be used during 'Chakra Wings'.",
                "energy": [
                    "Taijutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "actorCondition": {
                    "statusId": "butterfly_chouji_chakra_wings_active"
                },
                "classes": [
                    "Physical",
                    "Control"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 5,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "butterfly_chouji_enemy_immobilization_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkills": true,
                            "tooltipText": "This character is stunned.",
                            "ongoingClass": "control",
                            "turnDurationAnchor": "source_turn"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "butterfly_chouji_enemy_immobilization_self",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "stunImmune": true,
                            "tooltipText": "This character ignores stun effects.",
                            "ongoingClass": "control"
                        }
                    }
                ]
            },
            {
                "id": "butterfly-chouji-effortless-block",
                "name": "Effortless Block",
                "skillimage": "https://i.imgur.com/csCBOSU.png",
                "skilldescription": "This skill makes Butterfly Chouji invulnerable for 1 turn.",
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
                        "statusId": "butterfly_chouji_effortless_block",
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
    {
        "id": "drunken-lee",
        "characterId": "drunken-lee",
        "name": "Drunken Lee",
        "facePicture": "https://i.imgur.com/gLFtzf2.png",
        "characterdeescription": "Having accidentally drank sake, Lee's hidden Drunken Fist powers have awakened, completely changing his fighting style. While drunk, Lee attacks randomly, but is harder to stop the more he keeps fighting.",
        "requiredMissionId": "the-drunken-master",
        "skills": [
            {
                "id": "drunken-lee-unpredictable-assault",
                "name": "Unpredictable Assault",
                "skillimage": "https://i.imgur.com/IWFEmKO.png",
                "skilldescription": "Drunken Lee deals 20 damage to a random enemy. This skill cannot be countered. Each time this skill is used, it will deal 5 additional damage.",
                "energy": [
                    "Taijutsu"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 0,
                "cannotBeCountered": true,
                "classes": [
                    "Physical",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 20,
                        "scope": "random-enemy"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "drunken_lee_unpredictable_assault_stacks",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillDamageBonuses": {
                                "drunken-lee-unpredictable-assault": 5
                            },
                            "mergeObjectNumericAddKeys": [
                                "skillDamageBonuses"
                            ],
                            "tooltipText": "Unpredictable Assault deals 5 additional damage. This effect stacks each time Unpredictable Assault is used."
                        }
                    }
                ]
            },
            {
                "id": "drunken-lee-drunken-counter",
                "name": "Drunken Counter",
                "skillimage": "https://i.imgur.com/UTArdyQ.png",
                "skilldescription": "Drunken Lee targets himself or an ally. For 1 turn, the first harmful non-strategic skill used on the target will be countered for 20 damage. This skill is invisible.",
                "energy": [
                    "Random"
                ],
                "target": "self-or-single-ally",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "drunken_lee_drunken_counter",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "helpful": true,
                            "hideTooltipFromEnemy": true,
                            "triggerOnEnemyHarmfulNonStrategic": true,
                            "counterCancelsSkill": true,
                            "counterDamage": 20,
                            "tooltipText": "The first non-strategic skill used on this character will be countered and the attacker will take 20 damage."
                        }
                    }
                ]
            },
            {
                "id": "drunken-lee-drunken-fist",
                "name": "Drunken Fist",
                "skillimage": "https://i.imgur.com/sJakDhe.png",
                "skilldescription": "Drunken Lee deals 15 damage to one enemy for 3 turns. The following 3 turns, Drunken Lee will ignore all enemy stun effects, and 'Unpredictable Assault' will deal 5 additional damage.",
                "energy": [
                    "Random",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Strategic",
                    "Action"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "drunken_lee_drunken_fist_dot",
                        "duration": 3,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 15,
                            "turnEndTrigger": "source_turn",
                            "tooltipText": "This character takes 15 damage each turn from Drunken Fist.",
                            "ongoingClass": "action"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "drunken_lee_drunken_fist_self",
                        "duration": 3,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "stunImmune": true,
                            "skillDamageBonuses": {
                                "drunken-lee-unpredictable-assault": 5
                            },
                            "tooltipText": "This character ignores enemy stun effects. Unpredictable Assault deals 5 additional damage.",
                            "ongoingClass": "action"
                        }
                    }
                ]
            },
            {
                "id": "drunken-lee-drunken-leap",
                "name": "Drunken Leap",
                "skillimage": "https://i.imgur.com/rXB5r9a.png",
                "skilldescription": "This skill makes Drunken Lee invulnerable for 1 turn.",
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
                        "statusId": "drunken_lee_drunken_leap",
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
    {
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
                "skillimage": "https://i.imgur.com/1zFEDxZ.png",
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
                "skillimage": "https://i.imgur.com/tNBIXfI.png",
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
    },
    {
        "id": "rehabilitated-gaara",
        "characterId": "rehabilitated-gaara",
        "name": "Rehabilitated Gaara",
        "facePicture": "https://i.imgur.com/bF8DLyH.png",
        "characterdeescription": "After his fateful encounter with Naruto, Gaara has left behind his murderous ways, and has instead rehabilitated. Gaara has honed his abilities to shape and craft his sand, allowing him to create giant waves of sand or quicksand traps.",
        "requiredMissionId": "the-redemption-of-gaara",
        "skills": [
            {
                "id": "rehabilitated-gaara-sand-mastery",
                "name": "Sand Mastery",
                "skillimage": "https://i.imgur.com/q60UfkP.png",
                "skilldescription": "Rehabilitated Gaara deals 15 damage to one enemy for 3 turns and gains 35 points of permanent destructible defense. This skill does not stack and will re-apply itself.",
                "energy": [
                    "Random",
                    "Random"
                ],
                "target": "single-enemy",
                "actorCondition": {
                    "missingStatusId": "rehabilitated_gaara_sand_mastery_defense"
                },
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Physical",
                    "Action"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "rehabilitated_gaara_sand_mastery_dot",
                        "duration": 3,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 15,
                            "turnEndTrigger": "source_turn",
                            "turnDurationAnchor": "source_turn",
                            "ongoingClass": "action",
                            "triggerOnApply": true,
                            "tooltipText": "This character takes 15 damage from Sand Mastery."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "rehabilitated_gaara_sand_mastery_defense",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "destructibleDefensePoints": 35,
                            "tooltipText": "Rehabilitated Gaara has 35 points of permanent destructible defense from Sand Mastery.",
                            "ongoingClass": "action"
                        }
                    }
                ]
            },
            {
                "id": "rehabilitated-gaara-prison-sand-burial",
                "name": "Prison Sand Burial",
                "skillimage": "https://i.imgur.com/WoNpe2N.png",
                "skilldescription": "For 1 turn, all enemies' non-strategic skills will have their costs increased by 1 random energy. Afterwards, this skill will be replaced by 'Desert Imperial Funeral' for 1 turn.",
                "energy": [
                    "Random"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "rehabilitated_gaara_prison_sand_burial",
                        "duration": 1,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "randomCostIncreaseForSkillClasses": {
                                "physical": 1,
                                "energy": 1,
                                "mental": 1,
                                "affliction": 1,
                                "ninjutsu": 1
                            },
                            "tooltipText": "This character's non-strategic skills cost 1 additional random chakra.",
                            "turnDurationAnchor": "source_turn"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "rehabilitated_gaara_prison_sand_burial_ready",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillReplacements": {
                                "rehabilitated-gaara-prison-sand-burial": "rehabilitated-gaara-desert-imperial-funeral"
                            },
                            "tooltipText": "Prison Sand Burial is replaced by Desert Imperial Funeral."
                        }
                    }
                ]
            },
            {
                "id": "rehabilitated-gaara-quicksand-waterfall-flow",
                "name": "Quicksand Waterfall Flow",
                "skillimage": "https://i.imgur.com/fFk2WGR.png",
                "skilldescription": "Rehabilitated Gaara deals 15 damage to all enemies for 4 turns.",
                "energy": [
                    "Bloodline",
                    "Ninjutsu"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 4,
                "classes": [
                    "Physical",
                    "Action"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "rehabilitated_gaara_quicksand_dot",
                        "duration": 4,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 15,
                            "turnEndTrigger": "source_turn",
                            "turnDurationAnchor": "source_turn",
                            "ongoingClass": "action",
                            "triggerOnApply": true,
                            "tooltipText": "This character takes 15 damage from Quicksand Waterfall Flow."
                        }
                    }
                ]
            },
            {
                "id": "rehabilitated-gaara-shield-of-shukaku",
                "name": "Shield of Shukaku",
                "skillimage": "https://i.imgur.com/Kr87iAU.png",
                "skilldescription": "This skill makes Rehabilitated Gaara invulnerable for 1 turn.",
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
                        "statusId": "rehabilitated_gaara_shield_of_shukaku",
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
                "id": "rehabilitated-gaara-desert-imperial-funeral",
                "name": "Desert Imperial Funeral",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/WoNpe2N.png",
                "skilldescription": "Rehabilitated Gaara targets all enemies affected by 'Prison Sand Burial', destroying their destructible defense then dealing 40 piercing damage to them.",
                "energy": [
                    "Bloodline",
                    "Ninjutsu"
                ],
                "target": "all-enemy",
                "targetCondition": {
                    "statusId": "rehabilitated_gaara_prison_sand_burial"
                },
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Physical",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "destroy_destructible_defense",
                        "scope": "all-enemy"
                    },
                    {
                        "type": "damage",
                        "amount": 40,
                        "scope": "all-enemy",
                        "metadata": {
                            "ignoreDamageReduction": true,
                            "ignoreDestructibleDefense": true
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "hoshigaki-kisame",
        "characterId": "hoshigaki-kisame",
        "name": "Hoshigaki Kisame",
        "facePicture": "https://i.imgur.com/tij8Nxm.png",
        "characterdeescription": "Formerly one of the Seven Swordsmen of the Mist Village, Kisame is an S-Rank missing ninja that is now a member of Akatsuki, having been partnered with Uchiha Itachi. Using his powerful, and ominous sword, mixed with his powerful water based ninjutsu, Kisame can disable enemies in every manner of way.",
        "requiredMissionId": "s-rank-criminal-kisame",
        "skills": [
            {
                "id": "hoshigaki-kisame-samehada-slash",
                "name": "Samehada Slash",
                "skillimage": "https://i.imgur.com/Knwkie7.png",
                "skilldescription": "Hoshigaki Kisame deals 20 damage to one enemy and stuns their energy, mental, and strategic skills for 1 turn.",
                "energy": [
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
                        "type": "damage",
                        "amount": 20,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "hoshigaki_kisame_samehada_slash_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "cannotUseSkillClasses": [
                                "energy",
                                "mental",
                                "strategic",
                                "ninjutsu"
                            ],
                            "tooltipText": "This character's energy, mental, and strategic skills are stunned."
                        }
                    }
                ]
            },
            {
                "id": "hoshigaki-kisame-samehada-shred",
                "name": "Samehada Shred",
                "skillimage": "https://i.imgur.com/PC7su7O.png",
                "skilldescription": "Hoshigaki Kisame deals 15 damage to one enemy for 2 turns, stealing 1 random non-bloodline energy from them each turn.",
                "energy": [
                    "Taijutsu",
                    "Ninjutsu"
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
                        "statusId": "hoshigaki_kisame_samehada_shred_dot",
                        "duration": 2,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 15,
                            "turnEndDrainNonBloodlineToSource": 1,
                            "turnEndTrigger": "source_turn",
                            "turnDurationAnchor": "source_turn",
                            "ongoingClass": "action",
                            "triggerOnApply": true,
                            "tooltipText": "This character takes 15 damage each turn and loses 1 random non-bloodline chakra to Hoshigaki Kisame from Samehada Shred."
                        }
                    }
                ]
            },
            {
                "id": "hoshigaki-kisame-water-shark-projectile",
                "name": "Water Shark Projectile",
                "skillimage": "https://i.imgur.com/Cvpp0VQ.png",
                "skilldescription": "Hoshigaki Kisame deals 20 damage to one enemy and stuns their physical, affliction, and strategic skills for 1 turn.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Ninjutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 20,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "hoshigaki_kisame_water_shark_projectile_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "cannotUseSkillClasses": [
                                "physical",
                                "affliction",
                                "strategic"
                            ],
                            "tooltipText": "This character's physical, affliction, and strategic skills are stunned."
                        }
                    }
                ]
            },
            {
                "id": "hoshigaki-kisame-samehada-scale-block",
                "name": "Samehada Scale Block",
                "skillimage": "https://i.imgur.com/mSXuepK.png",
                "skilldescription": "This skill makes Hoshigaki Kisame invulnerable for 1 turn.",
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
                        "statusId": "hoshigaki_kisame_samehada_scale_block",
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
    {
        "id": "uchiha-itachi",
        "characterId": "uchiha-itachi",
        "name": "Uchiha Itachi",
        "facePicture": "https://i.imgur.com/KOjV2Qf.png",
        "characterdeescription": "The only other surviving Uchiha, Itachi is a master of doujutsu, an S-Rank missing nin, and a member of Akatsuki, having been partnered with Hoshigaki Kisame. Despite being powerful, Itachi is slowly going blind, making his abilities weaker, but when Itachi activates his Sharingan he becomes an unstoppable force of pure power.",
        "requiredMissionId": "s-rank-criminal-itachi",
        "skills": [
            {
                "id": "uchiha-itachi-mangekyou-sharingan",
                "name": "Mangekyou Sharingan",
                "skillimage": "https://i.imgur.com/5jjNw5f.png",
                "maxUses": 1,
                "skilldescription": "For the rest of the game, Uchiha Itachi becomes invulnerable to non-strategic skills, enhances 'Amaterasu' and 'Tsukuyomi', increases their cooldowns by 2 turns, and doubles their costs. During this time, Uchiha Itachi will take 15 affliction damage each turn and ignore healing effects and this skill cannot be used again.",
                "energy": [
                    "Bloodline"
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
                        "statusId": "uchiha_itachi_mangekyou_sharingan",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "invulnerableToSkillClasses": [
                                "physical",
                                "energy",
                                "mental",
                                "affliction"
                            ],
                            "skillCostOverridesBySkillId": {
                                "uchiha-itachi-amaterasu": {
                                    "energy": [
                                        "Ninjutsu",
                                        "Ninjutsu"
                                    ]
                                },
                                "uchiha-itachi-tsukuyomi": {
                                    "energy": [
                                        "Genjutsu",
                                        "Genjutsu"
                                    ]
                                }
                            },
                            "skillCooldownIncreaseBySkillId": {
                                "uchiha-itachi-amaterasu": 2,
                                "uchiha-itachi-tsukuyomi": 2
                            },
                            "skillTargetOverrides": {
                                "uchiha-itachi-amaterasu": "all-enemy"
                            },
                            "skillDurationBonuses": {
                                "uchiha-itachi-tsukuyomi": 2
                            },
                            "tooltipText": "Uchiha Itachi is invulnerable to non-strategic skills. Amaterasu and Tsukuyomi are enhanced: double cost and +2 cooldowns."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "uchiha_itachi_mangekyou_sharingan_toll",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 15,
                            "afflictionDamage": true,
                            "healReceivedMultiplier": 0,
                            "tooltipText": "Uchiha Itachi takes 15 affliction damage each turn and ignores healing effects."
                        }
                    }
                ]
            },
            {
                "id": "uchiha-itachi-amaterasu",
                "name": "Amaterasu",
                "skillimage": "https://i.imgur.com/XbFWWxp.png",
                "skilldescription": "Uchiha Itachi deals 15 affliction damage to one enemy, who will take 5 affliction damage each following turn. If used during 'Mangekyou Sharingan', this skill will target all enemies and deal double damage.",
                "energy": [
                    "Ninjutsu"
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
                        "type": "damage",
                        "amount": 15,
                        "scope": "target",
                        "metadata": {
                            "afflictionDamage": true,
                            "ignoreDamageReduction": true,
                            "ignoreDestructibleDefense": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "uchiha_itachi_amaterasu_dot",
                        "duration": 3,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 5,
                            "afflictionDamage": true,
                            "turnEndTrigger": "source_turn",
                            "turnDurationAnchor": "source_turn",
                            "ongoingClass": "action",
                            "tooltipText": "This character takes 5 affliction damage each turn from Amaterasu."
                        }
                    }
                ]
            },
            {
                "id": "uchiha-itachi-tsukuyomi",
                "name": "Tsukuyomi",
                "skillimage": "https://i.imgur.com/EmcZEZB.png",
                "skilldescription": "Uchiha Itachi deals 20 damage to one enemy and stuns them for 1 turn. If used during 'Mangekyou Sharingan', this skill will last 3 turns.",
                "energy": [
                    "Genjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Mental",
                    "Control"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 20,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "uchiha_itachi_tsukuyomi_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "cannotUseSkills": true,
                            "tooltipText": "This character is stunned by Tsukuyomi.",
                            "ongoingClass": "control"
                        }
                    }
                ]
            },
            {
                "id": "uchiha-itachi-sharingan-insight",
                "name": "Sharingan Insight",
                "skillimage": "https://i.imgur.com/u3zgHCh.png",
                "skilldescription": "This skill makes Uchiha Itachi invulnerable for 1 turn.",
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
                        "statusId": "uchiha_itachi_sharingan_insight",
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
    {
        "id": "rokushou-aoi",
        "characterId": "rokushou-aoi",
        "name": "Rokushou Aoi",
        "facePicture": "https://i.imgur.com/XtzW95D.png",
        "characterdeescription": "Aoi is a jounin from the Hidden Rain Village and a missing-nin from the Hidden Leaf Village. A former instructor in the Hidden Leaf, he tricked Idate to steal the legendary Sword of the Thunder God, which had once belonged to Senju Tobirama, the Second Hokage. ORIGINAL DESIGN: Liann",
        "requiredMissionId": "the-theft-plan",
        "skills": [
            {
                "id": "rokushou-aoi-senbon-shower",
                "name": "Senbon Shower",
                "skillimage": "https://i.imgur.com/6QupUQg.png",
                "skilldescription": "Rokushou Aoi deals 5 piercing damage to all enemies, who will take 5 affliction damage each turn for 3 turns. During this time, the main target will ignore healing effects.",
                "energy": [
                    "Random",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 4,
                "classes": [
                    "Physical",
                    "Instant",
                    "Affliction"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 5,
                        "scope": "all-enemy",
                        "metadata": {
                            "ignoreDestructibleDefense": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "rokushou_aoi_senbon_shower_dot",
                        "duration": 3,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 5,
                            "afflictionDamage": true,
                            "turnEndTrigger": "source_turn",
                            "turnDurationAnchor": "source_turn",
                            "ongoingClass": "action",
                            "triggerOnApply": true,
                            "tooltipText": "This character takes 5 affliction damage each turn from Senbon Shower."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "rokushou_aoi_senbon_shower_no_heal",
                        "duration": 3,
                        "scope": "target",
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
                "id": "rokushou-aoi-umbrella-shock-wave",
                "name": "Umbrella Shock Wave",
                "skillimage": "https://i.imgur.com/uExBxVs.png",
                "skilldescription": "Rokushou Aoi destroys all enemies' destructible defense and deals 10 damage to them. From now on, 'Senbon Shower' will last 1 additional turn. This effect stacks each time this skill is used.",
                "energy": [
                    "Random"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Physical",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "destroy_destructible_defense",
                        "scope": "all-enemy"
                    },
                    {
                        "type": "damage",
                        "amount": 10,
                        "scope": "all-enemy"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "rokushou_aoi_umbrella_shock_wave_stack",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillDurationBonuses": {
                                "rokushou-aoi-senbon-shower": 1
                            },
                            "mergeObjectNumericAddKeys": [
                                "skillDurationBonuses"
                            ],
                            "tooltipText": "Senbon Shower lasts 1 additional turn. This effect stacks."
                        }
                    }
                ]
            },
            {
                "id": "rokushou-aoi-sword-of-the-thunder-god",
                "name": "Sword of the Thunder God",
                "skillimage": "https://i.imgur.com/lIkGCvd.png",
                "skilldescription": "Permanently, Rokushou Aoi will deal 10 piercing damage instantly to any enemy who uses a new skill on him and during this time, 'Senbon Shower' and 'Umbrella Shock Wave' will be replaced by 'Lightning Moon Cut' and 'Ring of Electricity' respectively. This skill cannot be used while active and ends when Rokushou Aoi uses 'Lightning Moon Cut' 3 times or 'Ring of Electricity' once.",
                "energy": [
                    "Random"
                ],
                "target": "self",
                "targetCondition": {
                    "missingStatusId": "rokushou_aoi_sword_of_the_thunder_god"
                },
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Strategic",
                    "Ninjutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "rokushou_aoi_sword_of_the_thunder_god",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "triggerOnEnemyHarmfulSkill": true,
                            "counterDamage": 10,
                            "counterDamageIgnoresDestructibleDefense": true,
                            "trapReappliesSelf": true,
                            "skillReplacements": {
                                "rokushou-aoi-senbon-shower": "rokushou-aoi-lightning-moon-cut",
                                "rokushou-aoi-umbrella-shock-wave": "rokushou-aoi-ring-of-electricity"
                            },
                            "removeSelfOnSkillUseCount": [
                                {
                                    "skillId": "rokushou-aoi-lightning-moon-cut",
                                    "atLeast": 3
                                },
                                {
                                    "skillId": "rokushou-aoi-ring-of-electricity",
                                    "atLeast": 1
                                }
                            ],
                            "tooltipText": "Any enemy who uses a new skill on this character takes 10 piercing damage. Senbon Shower is replaced by Lightning Moon Cut and Umbrella Shock Wave is replaced by Ring of Electricity."
                        }
                    }
                ]
            },
            {
                "id": "rokushou-aoi-umbrella-shield",
                "name": "Umbrella Shield",
                "skillimage": "https://i.imgur.com/zxodmCK.png",
                "skilldescription": "This skill makes Rokushou Aoi invulnerable for 1 turn.",
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
                        "statusId": "rokushou_aoi_umbrella_shield",
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
                "id": "rokushou-aoi-lightning-moon-cut",
                "name": "Lightning Moon Cut",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/6QupUQg.png",
                "skilldescription": "Rokushou Aoi deals 25 piercing damage to one enemy. For 3 turns, if they use a new skill, the cooldown of that skill will be increased by 1 turn. This skill stacks.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Ninjutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 25,
                        "scope": "target",
                        "metadata": {
                            "ignoreDestructibleDefense": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "rokushou_aoi_lightning_moon_cut_penalty",
                        "duration": 3,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "usedSkillCooldownPenalty": 1,
                            "tooltipText": "If this character uses a new skill, its cooldown is increased by 1 turn."
                        }
                    }
                ]
            },
            {
                "id": "rokushou-aoi-ring-of-electricity",
                "name": "Ring of Electricity",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/uExBxVs.png",
                "skilldescription": "Rokushou Aoi deals 35 piercing damage to one enemy and then stuns them for 2 turns. For the rest of the game, if they use a new skill, the cooldown of that skill will be increased by 2 turns. This skill stacks.",
                "energy": [
                    "Ninjutsu",
                    "Genjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Ninjutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 35,
                        "scope": "target",
                        "metadata": {
                            "ignoreDestructibleDefense": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "rokushou_aoi_ring_of_electricity_stun",
                        "duration": 2,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "cannotUseSkills": true,
                            "tooltipText": "This character is stunned by Ring of Electricity."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "rokushou_aoi_ring_of_electricity_penalty",
                        "duration": 99,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "usedSkillCooldownPenalty": 2,
                            "tooltipText": "If this character uses a new skill, its cooldown is increased by 2 turns."
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "kurosuki-raiga",
        "characterId": "kurosuki-raiga",
        "name": "Kurosuki Raiga",
        "facePicture": "https://i.imgur.com/ndeHzMP.png",
        "characterdeescription": "Kurosuki Raiga, renowned as the Thunder of the Hidden Mist, was a jounin from the Hidden Mist Village as well as a member of the Seven Ninja Swordsmen of the Mist. Raiga wields Kiba, twin swords imbued with lightning. Considered the sharpest swords ever made, they can cut through anything. ORIGINAL DESIGN: Liann",
        "requiredMissionId": "thunder-of-the-hidden-mist",
        "skills": [
            {
                "id": "kurosuki-raiga-lightning-ball",
                "name": "Lightning Ball",
                "skillimage": "https://i.imgur.com/Zbv3Opt.png",
                "skilldescription": "Kurosuki Raiga deals 10 piercing damage to one enemy, who will take 5 additional damage from Kurosuki Raiga's skills permanently. This skill stacks and ends if Kurosuki Raiga dies.",
                "energy": [
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Ninjutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 10,
                        "scope": "target",
                        "metadata": {
                            "ignoreDestructibleDefense": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kurosuki_raiga_lightning_mark",
                        "duration": 99,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "ongoingClass": "action",
                            "bonusDamageFromSourceSkillsFlat": 5,
                            "bonusDamageFromSourceCharacterId": "kurosuki-raiga",
                            "mergeNumericAddKeys": [
                                "bonusDamageFromSourceSkillsFlat"
                            ],
                            "tooltipText": "This character takes 5 additional damage from Kurosuki Raiga's skills. This effect stacks."
                        }
                    }
                ]
            },
            {
                "id": "kurosuki-raiga-feast-of-lightning",
                "name": "Feast of Lightning",
                "skillimage": "https://i.imgur.com/LOoAU6E.png",
                "skilldescription": "Kurosuki Raiga makes all enemies take 5 additional damage from his skills permanently. This skill stacks and ends if Kurosuki Raiga dies.",
                "energy": [],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "kurosuki_raiga_lightning_mark",
                        "duration": 99,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "ongoingClass": "action",
                            "bonusDamageFromSourceSkillsFlat": 5,
                            "bonusDamageFromSourceCharacterId": "kurosuki-raiga",
                            "mergeNumericAddKeys": [
                                "bonusDamageFromSourceSkillsFlat"
                            ],
                            "tooltipText": "This character takes 5 additional damage from Kurosuki Raiga's skills. This effect stacks."
                        }
                    }
                ]
            },
            {
                "id": "kurosuki-raiga-fangs-of-lightning",
                "name": "Fangs of Lightning",
                "skillimage": "https://i.imgur.com/tLaGdI3.png",
                "skilldescription": "Kurosuki Raiga deals 15 piercing damage to one enemy and increases the cost of that enemy's non-strategic skills by 1 random energy for 1 turn. This skill becomes 'Lightning Burial: Banquet of Lightning' permanently after used.",
                "energy": [
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Ninjutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 15,
                        "scope": "target",
                        "metadata": {
                            "ignoreDestructibleDefense": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kurosuki_raiga_fangs_of_lightning_cost",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "randomCostIncreaseForSkillClasses": {
                                "physical": 1,
                                "energy": 1,
                                "mental": 1,
                                "affliction": 1,
                                "ninjutsu": 1
                            },
                            "tooltipText": "This character's non-strategic skills cost 1 additional random chakra."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kurosuki_raiga_stage_banquet",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillReplacements": {
                                "kurosuki-raiga-fangs-of-lightning": "kurosuki-raiga-lightning-burial-banquet-of-lightning"
                            },
                            "tooltipText": "Fangs of Lightning is replaced by Lightning Burial: Banquet of Lightning."
                        }
                    }
                ]
            },
            {
                "id": "kurosuki-raiga-lightning-strike-armor",
                "name": "Lightning Strike Armor",
                "skillimage": "https://i.imgur.com/xJZHpqR.png",
                "skilldescription": "This skill makes Kurosuki Raiga invulnerable for 1 turn.",
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
                        "statusId": "kurosuki_raiga_lightning_strike_armor",
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
                "id": "kurosuki-raiga-lightning-burial-banquet-of-lightning",
                "name": "Lightning Burial: Banquet of Lightning",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/tLaGdI3.png",
                "skilldescription": "Kurosuki Raiga deals 15 piercing damage to the main target and 5 piercing damage to all other enemies. This skill becomes 'Siege of Lightning' permanently after used.",
                "energy": [
                    "Ninjutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Ninjutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 15,
                        "scope": "target",
                        "metadata": {
                            "ignoreDestructibleDefense": true
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 5,
                        "scope": "all-other-enemy",
                        "metadata": {
                            "ignoreDestructibleDefense": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kurosuki_raiga_stage_siege",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillReplacements": {
                                "kurosuki-raiga-lightning-burial-banquet-of-lightning": "kurosuki-raiga-siege-of-lightning"
                            },
                            "tooltipText": "Lightning Burial: Banquet of Lightning is replaced by Siege of Lightning."
                        }
                    }
                ]
            },
            {
                "id": "kurosuki-raiga-siege-of-lightning",
                "name": "Siege of Lightning",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/ndeHzMP.png",
                "skilldescription": "Kurosuki Raiga targets all enemies. For 2 turns, every time they use a new skill, they will be dealt 15 piercing damage. This skill becomes 'Lightning Dragon Tornado' permanently after used.",
                "energy": [
                    "Ninjutsu",
                    "Random"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Strategic",
                    "Ninjutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "kurosuki_raiga_siege_trap",
                        "duration": 2,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "onOwnerUseSkillTrigger": true,
                            "preserveOnOwnerUseSkillTrigger": true,
                            "onOwnerUseSkillEffects": [
                                {
                                    "type": "damage",
                                    "amount": 15,
                                    "metadata": {
                                        "ignoreDestructibleDefense": true
                                    }
                                }
                            ],
                            "tooltipText": "Every time this character uses a new skill, they take 15 piercing damage."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kurosuki_raiga_stage_dragon_tornado",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillReplacements": {
                                "kurosuki-raiga-siege-of-lightning": "kurosuki-raiga-lightning-dragon-tornado"
                            },
                            "tooltipText": "Siege of Lightning is replaced by Lightning Dragon Tornado."
                        }
                    }
                ]
            },
            {
                "id": "kurosuki-raiga-lightning-dragon-tornado",
                "name": "Lightning Dragon Tornado",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/ndeHzMP.png",
                "skilldescription": "Kurosuki Raiga deals 60 piercing damage to one enemy. This skill becomes 'Lightning Demon' permanently after used.",
                "energy": [
                    "Ninjutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Ninjutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 60,
                        "scope": "target",
                        "metadata": {
                            "ignoreDestructibleDefense": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kurosuki_raiga_stage_demon",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillReplacements": {
                                "kurosuki-raiga-lightning-dragon-tornado": "kurosuki-raiga-lightning-demon"
                            },
                            "tooltipText": "Lightning Dragon Tornado is replaced by Lightning Demon."
                        }
                    }
                ]
            },
            {
                "id": "kurosuki-raiga-lightning-demon",
                "name": "Lightning Demon",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/ndeHzMP.png",
                "maxUses": 1,
                "skilldescription": "For the rest of the game, every time an enemy uses a new skill on Kurosuki Raiga, that enemy will be dealt 100 piercing damage. This skill can only be used once and cannot be removed.",
                "energy": [
                    "Ninjutsu",
                    "Ninjutsu"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Strategic",
                    "Ninjutsu",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "kurosuki_raiga_lightning_demon",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "cannotBeCleansed": true,
                            "triggerOnEnemyHarmfulSkill": true,
                            "counterDamage": 100,
                            "counterDamageIgnoresDestructibleDefense": true,
                            "trapReappliesSelf": true,
                            "tooltipText": "Any enemy who uses a new skill on this character takes 100 piercing damage."
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "uzumaki-naruto-s",
        "characterId": "uzumaki-naruto-s",
        "name": "Uzumaki Naruto (S)",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "Having trained with Jiraya for almost three years, Naruto has grown, both mentally and physically. With his training behind him, Naruto is able to utilize his clones even more, granting him strong defense while augmenting his already powerful rasengan.",
        "requiredMissionId": "the-prodigal-son-returns",
        "skills": [
            {
                "id": "uzumaki-naruto-s-oodama-rasengan",
                "name": "Oodama Rasengan",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Uzumaki Naruto (S) deals 40 damage to one enemy. This skill ignores invulnerability.",
                "energy": [
                    "Taijutsu",
                    "Ninjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Energy",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 40,
                        "scope": "target",
                        "metadata": {
                            "ignoreInvulnerability": true
                        }
                    }
                ],
                "ignoreInvulnerability": true
            },
            {
                "id": "uzumaki-naruto-s-mass-shadow-clones",
                "name": "Mass Shadow Clones",
                "skillimage": "deadcharacter.png",
                "skilldescription": "The following turn, Uzumaki Naruto (S) will counter the first new harmful skill used on him and 'Oodama Rasengan' will be replaced by 'Rasenshuriken'. This skill is invisible.",
                "energy": [
                    "Random"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "uzumaki_naruto_s_mass_shadow_clones_trap",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "invisible": true,
                            "triggerOnEnemyHarmfulSkill": true,
                            "counterStatusId": "uzumaki_naruto_s_countered_by_mass_shadow_clones",
                            "counterStatusDuration": 2,
                            "counterStatusMetadata": {
                                "harmful": true,
                                "tooltipText": "Countered by Mass Shadow Clones. Takes 50 additional damage from Rasenshuriken."
                            },
                            "counterApplyStatusToSourceOwner": {
                                "statusId": "uzumaki_naruto_s_rasenshuriken_active",
                                "duration": 1,
                                "metadata": {
                                    "helpful": true,
                                    "skillReplacements": {
                                        "uzumaki-naruto-s-oodama-rasengan": "uzumaki-naruto-s-rasenshuriken"
                                    },
                                    "tooltipText": "Oodama Rasengan is replaced by Rasenshuriken."
                                }
                            },
                            "tooltipText": "Naruto will counter the first harmful skill used on him next turn."
                        }
                    }
                ]
            },
            {
                "id": "uzumaki-naruto-s-chakra-boost",
                "name": "Chakra Boost",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Uzumaki Naruto (S) removes all harmful skills on him then gains 2 random energies. The following turn, Uzumaki Naruto (S) will gain 10 points of damage reduction and 'Oodama Rasengan' will cost 2 random energies.",
                "energy": [
                    "Random",
                    "Random"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "remove_status",
                        "scope": "self",
                        "metadata": {
                            "harmfulOnly": true
                        }
                    },
                    {
                        "type": "gain_chakra",
                        "chakraType": "random",
                        "amount": 2,
                        "scope": "self"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "uzumaki_naruto_s_chakra_boost_buff",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "damageReductionFlat": 10,
                            "skillCostOverridesBySkillId": {
                                "uzumaki-naruto-s-oodama-rasengan": {
                                    "energy": [
                                        "Random",
                                        "Random"
                                    ]
                                }
                            },
                            "tooltipText": "Naruto has 10 damage reduction and Oodama Rasengan costs 2 random energy."
                        }
                    }
                ]
            },
            {
                "id": "uzumaki-naruto-s-shadow-clone-save",
                "name": "Shadow Clone Save",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill makes Uzumaki Naruto (S) invulnerable for 1 turn.",
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
                        "statusId": "uzumaki_naruto_s_shadow_clone_save_invul",
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
                "id": "uzumaki-naruto-s-rasenshuriken",
                "name": "Rasenshuriken",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Uzumaki Naruto (S) deals 50 piercing damage to one enemy. This skill deals 50 additional damage to an enemy countered by 'Mass Shadow Clones'. This skill ignores invulnerability.",
                "energy": [
                    "Taijutsu",
                    "Ninjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Energy",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 50,
                        "scope": "target",
                        "metadata": {
                            "ignoreDamageReduction": true,
                            "ignoreInvulnerability": true
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 50,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "hasStatusId": "uzumaki_naruto_s_countered_by_mass_shadow_clones"
                        },
                        "metadata": {
                            "ignoreDamageReduction": true,
                            "ignoreInvulnerability": true
                        }
                    }
                ],
                "ignoreInvulnerability": true
            }
        ]
    },
    {
        "id": "haruno-sakura-s",
        "characterId": "haruno-sakura-s",
        "name": "Haruno Sakura (S)",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "With her extensive training under Tsunade for the last two and a half years, Sakura has gained a greater understanding of healing and the human body. While Sakura's physical strength and healing prowess have both increased, her greatest ability is a powerful chakra storing seal taught to her by Tsunade.",
        "requiredMissionId": "a-girl-grown-up",
        "skills": [
            {
                "id": "haruno-sakura-s-chakra-enhanced-punch",
                "name": "Chakra Enhanced Punch",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Haruno Sakura (S) deals 25 damage to one enemy. While 'Chakra Gathering' is active, this skill will deal 35 damage to one enemy, and 10 damage to all other enemies.",
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
                        "amount": 25,
                        "scope": "target",
                        "condition": {
                            "scope": "self",
                            "missingStatusId": "haruno_sakura_s_chakra_gathering_seals"
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 35,
                        "scope": "target",
                        "condition": {
                            "scope": "self",
                            "hasStatusId": "haruno_sakura_s_chakra_gathering_seals"
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 10,
                        "scope": "other-enemy",
                        "condition": {
                            "scope": "self",
                            "hasStatusId": "haruno_sakura_s_chakra_gathering_seals"
                        }
                    }
                ]
            },
            {
                "id": "haruno-sakura-s-superior-healing",
                "name": "Superior Healing",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Haruno Sakura (S) heals half of one ally's missing health, rounded, and removes all enemy affliction skills from them. While 'Chakra Gathering' is active, this skill will cost 1 random energy and have no cooldown.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "single-ally",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "heal_missing_health_percent",
                        "percent": 50,
                        "scope": "target"
                    },
                    {
                        "type": "remove_status",
                        "scope": "target",
                        "metadata": {
                            "afflictionOnly": true,
                            "harmfulOnly": true
                        }
                    }
                ]
            },
            {
                "id": "haruno-sakura-s-chakra-gathering",
                "name": "Chakra Gathering",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Haruno Sakura (S) gains 3 seals. During this time, each skill that Haruno Sakura (S) uses other than her invulnerability will use up 1 Seal. While 'Chakra Gathering' is active, Haruno Sakura (S) can use this skill again for no cost to heal herself for 15 health and remove all harmful effects on her.",
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
                        "statusId": "haruno_sakura_s_chakra_gathering_seals",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "stacks": 3,
                            "consumeStackOnSkillUseExceptInvul": true,
                            "skillReplacements": {
                                "haruno-sakura-s-chakra-gathering": "haruno-sakura-s-chakra-heal-release"
                            },
                            "skillCostOverridesBySkillId": {
                                "haruno-sakura-s-superior-healing": {
                                    "energy": [
                                        "Random"
                                    ]
                                }
                            },
                            "skillCooldownOverridesBySkillId": {
                                "haruno-sakura-s-superior-healing": 0
                            },
                            "tooltipText": "Sakura has 3 Chakra Gathering seals active."
                        }
                    }
                ]
            },
            {
                "id": "haruno-sakura-s-insightful-dodge",
                "name": "Insightful Dodge",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill makes Haruno Sakura (S) invulnerable for 1 turn.",
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
                        "statusId": "haruno_sakura_s_insightful_dodge_invul",
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
                "id": "haruno-sakura-s-chakra-heal-release",
                "name": "Chakra Gathering: Heal",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Haruno Sakura (S) heals herself for 15 health and removes all harmful effects on her.",
                "energy": [],
                "target": "self",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "heal",
                        "amount": 15,
                        "scope": "self"
                    },
                    {
                        "type": "remove_status",
                        "scope": "self",
                        "metadata": {
                            "harmfulOnly": true
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "sai",
        "characterId": "sai",
        "name": "Sai",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "A current member of the Elite ANBU Root, Sai is a quiet, but expressive individual with a mysterious past. Sai uses a set of brushes with a special ink to give life to his art, from tigers to lions to bears, that allow him to compete with his enemies.",
        "requiredMissionId": "a-blank-slate",
        "skills": [
            {
                "id": "sai-super-beast-imitating-drawing-lions",
                "name": "Super Beast Imitating Drawing: Lions",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Sai deals 30 damage to one enemy. For 1 turn, Sai will gain 20 points of destructible defense.",
                "energy": [
                    "Genjutsu",
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
                        "statusId": "sai_lions_destructible_defense",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "destructibleDefensePoints": 20,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "Sai has 20 points of destructible defense."
                        }
                    }
                ]
            },
            {
                "id": "sai-super-beast-imitating-drawing-snake",
                "name": "Super Beast Imitating Drawing: Snake",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Sai stuns one enemy's physical, energy and strategic skills for 1 turn. During this time, that enemy will be unable to reduce damage or become invulnerable. This skill ignores invulnerability. During 'Adaptive Painting', this skill will be replaced.",
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
                        "statusId": "sai_snake_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkillClasses": [
                                "physical",
                                "energy",
                                "strategic"
                            ],
                            "cannotReduceDamage": true,
                            "cannotBecomeInvulnerable": true,
                            "ignoreInvulnerability": true,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character's physical, energy and strategic skills are stunned and they cannot reduce damage or become invulnerable."
                        }
                    }
                ],
                "ignoreInvulnerability": true
            },
            {
                "id": "sai-adaptive-painting",
                "name": "Adaptive Painting",
                "skillimage": "deadcharacter.png",
                "skilldescription": "For 3 turns, any ally that is targeted by a new direct stun skill will become invulnerable for 1 turn; any ally that has energy removed/stolen will gain 1 random energy, and any ally that successfully receives new non-affliction damage by an enemy will increase Sai's damage by 10 for 1 turn.",
                "energy": [
                    "Random",
                    "Random"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "sai_adaptive_painting_active",
                        "duration": 3,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "adaptivePaintingActive": true,
                            "skillReplacements": {
                                "sai-super-beast-imitating-drawing-snake": "sai-super-beast-imitating-drawing-bird"
                            },
                            "tooltipText": "Adaptive Painting is active: allies counter stuns and energy drain, taking damage buffs Sai."
                        }
                    }
                ]
            },
            {
                "id": "sai-ink-clone",
                "name": "Ink Clone",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill makes Sai invulnerable for 1 turn.",
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
                        "statusId": "sai_ink_clone_invul",
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
                "id": "sai-super-beast-imitating-drawing-bird",
                "name": "Super Beast Imitating Drawing: Bird",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Sai deals 25 damage to one enemy and stuns their physical, energy and strategic skills for 1 turn.",
                "energy": [
                    "Genjutsu"
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
                        "amount": 25,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "sai_bird_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkillClasses": [
                                "physical",
                                "energy",
                                "strategic"
                            ],
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character's physical, energy and strategic skills are stunned for 1 turn."
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "inuzuka-kiba-s",
        "characterId": "inuzuka-kiba-s",
        "name": "Inuzuka Kiba (S)",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "Over the last several years. Kiba, and his dog, Akamaru have grown considerably, not wanting to be left last in their group. Having improved their team work, and provided they are given enough time, Kiba and Akamaru can become unstoppable rampaging beasts.",
        "requiredMissionId": "a-boy-and-his-dog",
        "skills": [
            {
                "id": "inuzuka-kiba-s-three-headed-wolf",
                "name": "Three-Headed Wolf",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Inuzuka Kiba (S) gains 30 points of damage reduction and ignores enemy stun effects and energy drain or removal effects for 3 turns. The following 3 turns, this skill will be replaced by 'Tail Chasing Rotating Fang'.",
                "energy": [
                    "Bloodline",
                    "Bloodline"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 5,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "inuzuka_kiba_s_three_headed_wolf_active",
                        "duration": 3,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "damageReductionFlat": 30,
                            "immuneToStun": true,
                            "immuneToEnergyDrain": true,
                            "skillReplacements": {
                                "inuzuka-kiba-s-three-headed-wolf": "inuzuka-kiba-s-tail-chasing-rotating-fang"
                            },
                            "tooltipText": "Kiba has 30 damage reduction, ignores enemy stuns and energy drain/removal, and has transformed."
                        }
                    }
                ]
            },
            {
                "id": "inuzuka-kiba-s-rotating-fang",
                "name": "Rotating Fang",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Inuzuka Kiba (S) deals 30 damage to one enemy and 20 damage to another random enemy. During 'Three-Headed Wolf', this skill will instead deal 20 damage to all other enemies.",
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
                        "amount": 20,
                        "scope": "random-other-enemy",
                        "condition": {
                            "scope": "self",
                            "missingStatusId": "inuzuka_kiba_s_three_headed_wolf_active"
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 20,
                        "scope": "other-enemy",
                        "condition": {
                            "scope": "self",
                            "hasStatusId": "inuzuka_kiba_s_three_headed_wolf_active"
                        }
                    }
                ]
            },
            {
                "id": "inuzuka-kiba-s-fang-over-fang",
                "name": "Fang Over Fang",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Inuzuka Kiba (S) deals 35 damage and 10 affliction damage* to one enemy and then reduces their non-affliction damage by 10 permanently. During 'Three-Headed Wolf', this skill will deal 5 additional damage.",
                "energy": [
                    "Taijutsu",
                    "Bloodline"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Physical",
                    "Instant",
                    "Affliction*"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 35,
                        "scope": "target"
                    },
                    {
                        "type": "damage",
                        "amount": 5,
                        "scope": "target",
                        "condition": {
                            "scope": "self",
                            "hasStatusId": "inuzuka_kiba_s_three_headed_wolf_active"
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 10,
                        "scope": "target",
                        "metadata": {
                            "afflictionDamage": true,
                            "ignoreDamageReduction": true,
                            "ignoreDestructibleDefense": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "inuzuka_kiba_s_fang_over_fang_weaken",
                        "duration": 99,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "damageDealtFlatModifier": -10,
                            "tooltipText": "This character deals 10 less non-affliction damage permanently."
                        }
                    }
                ]
            },
            {
                "id": "inuzuka-kiba-s-hide-in-the-shade",
                "name": "Hide in the Shade",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill makes Inuzuka Kiba (S) invulnerable for 1 turn.",
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
                        "statusId": "inuzuka_kiba_s_hide_in_the_shade_invul",
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
                "id": "inuzuka-kiba-s-tail-chasing-rotating-fang",
                "name": "Tail Chasing Rotating Fang",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Inuzuka Kiba (S) deals 40 damage to all enemies and stuns them for 1 turn.",
                "energy": [
                    "Taijutsu",
                    "Bloodline",
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
                        "amount": 40,
                        "scope": "all-enemy"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "inuzuka_kiba_s_tail_chasing_stun",
                        "duration": 1,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "stun": true,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character is stunned for 1 turn."
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "aburame-shino-s",
        "characterId": "aburame-shino-s",
        "name": "Aburame Shino (S)",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "Still as mysterious and secretive as ever, Shino has improved greatly over the years, learning and practicing with his loyal bugs. With his new found mastery, Shino can disable enemies even harder while slowly waiting for his bugs to erupt from their bodies and destroy them.",
        "requiredMissionId": "the-konoha-man-of-mystery",
        "skills": [
            {
                "id": "aburame-shino-s-insect-swarm",
                "name": "Insect Swarm",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Aburame Shino (S) deals 15 affliction damage to one enemy for 3 turns. The following 3 turns, that enemy will be invulnerable to all friendly skills. During this time, this skill will be replaced by 'Insect Consumption'.",
                "energy": [
                    "Bloodline",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Affliction",
                    "Action"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "aburame_shino_s_insect_swarm_dot",
                        "duration": 3,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "action": true,
                            "ongoingClass": "action",
                            "damagePerTurn": 15,
                            "afflictionDamage": true,
                            "ignoreDamageReduction": true,
                            "ignoreDestructibleDefense": true,
                            "invulnerableToFriendlySkills": true,
                            "tooltipText": "Taking 15 affliction damage each turn and invulnerable to friendly skills."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "aburame_shino_s_insect_swarm_stance",
                        "duration": 3,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "ongoingClass": "action",
                            "skillReplacements": {
                                "aburame-shino-s-insect-swarm": "aburame-shino-s-insect-consumption"
                            },
                            "tooltipText": "Insect Swarm is active: replaced by Insect Consumption."
                        }
                    }
                ]
            },
            {
                "id": "aburame-shino-s-insect-barricade",
                "name": "Insect Barricade",
                "skillimage": "deadcharacter.png",
                "skilldescription": "The following turn, the first new harmful skill used on one ally or Aburame Shino (S) will be countered, 'Parasitic Giant Beetle Infestation' will be placed on the countered enemy and then activated. If this skill does not counter an enemy skill, Aburame Shino (S) will gain 1 red energy. This skill is invisible.",
                "energy": [
                    "Bloodline"
                ],
                "target": "all-allies",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "aburame_shino_s_insect_barricade_trap",
                        "duration": 1,
                        "scope": "all-ally",
                        "metadata": {
                            "invisible": true,
                            "triggerOnEnemyHarmfulSkill": true,
                            "counterStatusId": "aburame_shino_s_parasitic_beetle_active_trigger",
                            "counterStatusDuration": 1,
                            "counterStatusMetadata": {
                                "harmful": true,
                                "damageInstantPiercing": 25,
                                "tooltipText": "Infested with Parasitic Giant Beetles for 25 damage."
                            },
                            "onExpireIfUnusedEffects": [
                                {
                                    "type": "gain_chakra",
                                    "chakraType": "taijutsu",
                                    "amount": 1,
                                    "scope": "self"
                                }
                            ],
                            "tooltipText": "The first harmful skill targeting this ally next turn will be countered for 25 damage, or Shino gains 1 energy."
                        }
                    }
                ]
            },
            {
                "id": "aburame-shino-s-parasitic-giant-beetle-infestation",
                "name": "Parasitic Giant Beetle Infestation",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Aburame Shino (S) targets one enemy. After 3 turns, they will take 25 affliction damage and all other copies of this skill on them will be activated. This skill is invisible.",
                "energy": [
                    "Bloodline"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Affliction",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "aburame_shino_s_parasitic_beetle_pending",
                        "duration": 3,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "invisible": true,
                            "turnDurationAnchor": "any_turn",
                            "onExpireEffects": [
                                {
                                    "type": "damage",
                                    "amount": 25,
                                    "scope": "target",
                                    "metadata": {
                                        "afflictionDamage": true,
                                        "ignoreDamageReduction": true,
                                        "ignoreDestructibleDefense": true
                                    }
                                }
                            ],
                            "tooltipText": "Parasitic Giant Beetles will erupt after 3 turns for 25 affliction damage."
                        }
                    }
                ]
            },
            {
                "id": "aburame-shino-s-insect-cocoon",
                "name": "Insect Cocoon",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill makes Aburame Shino (S) invulnerable for 1 turn.",
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
                        "statusId": "aburame_shino_s_insect_cocoon_invul",
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
                "id": "aburame-shino-s-insect-consumption",
                "name": "Insect Consumption",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Aburame Shino (S) steals 1 random energy from one enemy affected by 'Insect Swarm' and increases the damage that enemy receives from 'Insect Swarm' by 5 that turn.",
                "energy": [
                    "Bloodline"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Affliction",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "steal_chakra",
                        "chakraType": "random",
                        "amount": 1,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "hasStatusId": "aburame_shino_s_insect_swarm_dot"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "aburame_shino_s_insect_consumption_amp",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "bonusDamageFromSourceSkillsFlat": 5,
                            "bonusDamageAppliesToSkillIds": [
                                "aburame-shino-s-insect-swarm"
                            ],
                            "tooltipText": "Takes 5 additional damage from Insect Swarm this turn."
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "hyuuga-hinata-s",
        "characterId": "hyuuga-hinata-s",
        "name": "Hyuuga Hinata (S)",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "With the Chuunin Exam behind her, and with Naruto's words deep in her heart, Hinata has grown and become stronger and a woman. With her mastery of the Hyuuga clan tactics, Hinata can give life to powerful chakra lions while hindering her enemies' chakra paths.",
        "requiredMissionId": "a-lovestruck-girl",
        "skills": [
            {
                "id": "hyuuga-hinata-s-pressure-point-closure",
                "name": "Pressure Point Closure",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Hyuuga Hinata (S) targets one enemy, dealing 10 damage to them, increasing the cost of their skills by 1 random energy for 1 turn, and removing all stacks of 'Hinata - Eight Trigrams Field' from them (including the skill itself). During 'Hinata - Eight Trigrams Field', this skill will deal 10 additional damage.",
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
                        "type": "damage",
                        "amount": 10,
                        "scope": "target"
                    },
                    {
                        "type": "damage",
                        "amount": 10,
                        "scope": "target",
                        "condition": {
                            "scope": "self",
                            "hasStatusId": "hyuuga_hinata_s_eight_trigrams_field_stance"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "hyuuga_hinata_s_pressure_point_closure_debuff",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "energyCostIncrease": {
                                "random": 1
                            },
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "Skills cost 1 additional random energy."
                        }
                    }
                ]
            },
            {
                "id": "hyuuga-hinata-s-gentle-step-twin-lion-fists",
                "name": "Gentle Step Twin Lion Fists",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill deals 30 damage to one enemy and removes 1 random energy from them. This skill will deal 5 additional damage for each 'Pressure Point Closure' stack. Once used, this skill removes all stacks of 'Pressure Point Closure' from the targeted enemy.",
                "energy": [
                    "Ninjutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Energy",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 30,
                        "scope": "target"
                    },
                    {
                        "type": "remove_chakra",
                        "chakraType": "random",
                        "amount": 1,
                        "scope": "target"
                    },
                    {
                        "type": "remove_status",
                        "statusId": "hyuuga_hinata_s_pressure_point_closure_debuff",
                        "scope": "target"
                    }
                ]
            },
            {
                "id": "hyuuga-hinata-s-eight-trigrams-field",
                "name": "Hinata - Eight Trigrams Field",
                "skillimage": "deadcharacter.png",
                "skilldescription": "For 4 turns, if an enemy uses a new harmful skill, the energy cost increase of 'Pressure Point Closure' will last 1 additional turn on them permanently.",
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
                        "statusId": "hyuuga_hinata_s_eight_trigrams_field_stance",
                        "duration": 4,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "tooltipText": "Eight Trigrams Field is active: Pressure Point Closure deals 10 additional damage."
                        }
                    }
                ]
            },
            {
                "id": "hyuuga-hinata-s-byakugan-sight",
                "name": "Byakugan Sight",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill makes Hyuuga Hinata (S) invulnerable for 1 turn.",
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
                        "statusId": "hyuuga_hinata_s_byakugan_sight_invul",
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
    {
        "id": "nara-shikamaru-s",
        "characterId": "nara-shikamaru-s",
        "name": "Nara Shikamaru (S)",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "Once known to be one of the laziest ninja, Shikamaru has worked tireless to become not only stronger, but a leader too. More than ever before, Shikamaru excels at coming up with long winded and convoluted plans meant to defeat any enemies in his path.",
        "requiredMissionId": "where-the-shadows-lie",
        "skills": [
            {
                "id": "nara-shikamaru-s-shadow-sewing",
                "name": "Shadow Sewing",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Nara Shikamaru (S) deals 35 damage to one enemy and stuns their physical, energy and strategic skills for 1 turn. If this skill is used on an enemy affected by 'Long-Range Tactics', it will deal 10 additional damage.",
                "energy": [
                    "Genjutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Energy",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 35,
                        "scope": "target"
                    },
                    {
                        "type": "damage",
                        "amount": 10,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "hasStatusId": "nara_shikamaru_s_long_range_tactics_stun"
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "nara_shikamaru_s_shadow_sewing_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkillClasses": [
                                "physical",
                                "energy",
                                "strategic"
                            ],
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character's physical, energy and strategic skills are stunned for 1 turn."
                        }
                    }
                ]
            },
            {
                "id": "nara-shikamaru-s-long-range-tactics",
                "name": "Long-Range Tactics",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Nara Shikamaru (S) targets one enemy. That enemy has their non-strategic skills stunned 2 turns and Nara Shikamaru (S) will be invulnerable during this time.",
                "energy": [
                    "Ninjutsu",
                    "Genjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "nara_shikamaru_s_long_range_tactics_stun",
                        "duration": 2,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkillClasses": [
                                "physical",
                                "energy",
                                "mental",
                                "ninjutsu"
                            ],
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character's non-strategic skills are stunned for 2 turns."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "nara_shikamaru_s_long_range_tactics_invul",
                        "duration": 2,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "invulnerable": true,
                            "tooltipText": "Shikamaru is invulnerable during Long-Range Tactics."
                        }
                    }
                ]
            },
            {
                "id": "nara-shikamaru-s-expert-analysis",
                "name": "Expert Analysis",
                "skillimage": "deadcharacter.png",
                "skilldescription": "For 3 turns, any time that one target enemy uses a new skill, that enemy will be unable to reduce damage or become invulnerable and all helpful counters and reflect skills on them will be ignored for 1 turn. This skill is invisible.",
                "energy": [],
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
                        "statusId": "nara_shikamaru_s_expert_analysis_mark",
                        "duration": 3,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "invisible": true,
                            "cannotReduceDamage": true,
                            "cannotBecomeInvulnerable": true,
                            "ignoreCounters": true,
                            "ignoreReflects": true,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character cannot reduce damage, become invulnerable, or benefit from counters/reflects."
                        }
                    }
                ]
            },
            {
                "id": "nara-shikamaru-s-panicked-dodge",
                "name": "Panicked Dodge",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill makes Nara Shikamaru (S) invulnerable for 1 turn.",
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
                        "statusId": "nara_shikamaru_s_panicked_dodge_invul",
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
    {
        "id": "akimichi-chouji-s",
        "characterId": "akimichi-chouji-s",
        "name": "Akimichi Chouji (S)",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "After nearly three years, Chouji has developed in both strength and size, mastering the Akimichi clan techniques. No longer does Chouji need the Akimichi pills to tap into his true strength, instead, he merely needs to control his chakra and become a force to reckon with.",
        "requiredMissionId": "a-portly-but-steadfast-ninja",
        "skills": [
            {
                "id": "akimichi-chouji-s-expansion-technique",
                "name": "Expansion Technique",
                "skillimage": "deadcharacter.png",
                "skilldescription": "For 4 turns, Akimichi Chouji (S) gains 25 points of destructible defense, 'Spiked Meat Tank' will do its alternate effects and have 1 less turn of cooldown, and 'Mega Palm Thrust' will be improved.",
                "energy": [
                    "Random"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "akimichi_chouji_s_expansion_technique_active",
                        "duration": 4,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "destructibleDefensePoints": 25,
                            "skillReplacements": {
                                "akimichi-chouji-s-spiked-meat-tank": "akimichi-chouji-s-spiked-meat-tank-alt"
                            },
                            "tooltipText": "Expansion Technique is active with 25 destructible defense: Spiked Meat Tank and Mega Palm Thrust are empowered."
                        }
                    }
                ]
            },
            {
                "id": "akimichi-chouji-s-spiked-meat-tank",
                "name": "Spiked Meat Tank",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Akimichi Chouji (S) targets one ally or himself and will counter all enemy non-mental skills used on the target for 1 turn. The countered enemies will take 25 damage. This skill is invisible. Alternate: Akimichi Chouji (S) deals 25 damage to one enemy and becomes invulnerable for 1 turn.",
                "energy": [
                    "Bloodline"
                ],
                "target": "single-ally",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Physical",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "akimichi_chouji_s_spiked_meat_tank_counter",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "invisible": true,
                            "triggerOnEnemyHarmfulNonMental": true,
                            "counterDamage": 25,
                            "tooltipText": "Counters enemy non-mental skills and deals 25 damage to the attacker."
                        }
                    }
                ]
            },
            {
                "id": "akimichi-chouji-s-spiked-meat-tank-alt",
                "name": "Spiked Meat Tank (Alternate)",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Akimichi Chouji (S) deals 25 damage to one enemy and becomes invulnerable for 1 turn.",
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
                        "amount": 25,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "akimichi_chouji_s_spiked_meat_tank_alt_invul",
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
                "id": "akimichi-chouji-s-mega-palm-thrust",
                "name": "Mega Palm Thrust",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Akimichi Chouji (S) deals 25 piercing damage to one enemy. During 'Expansion Technique', this damage is improved to 40, the targeted enemy has their non-strategic skills stunned for 1 turn, and this skill has an 1 turn cooldown.",
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
                        "amount": 25,
                        "scope": "target",
                        "condition": {
                            "scope": "self",
                            "missingStatusId": "akimichi_chouji_s_expansion_technique_active"
                        },
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 40,
                        "scope": "target",
                        "condition": {
                            "scope": "self",
                            "hasStatusId": "akimichi_chouji_s_expansion_technique_active"
                        },
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "akimichi_chouji_s_mega_palm_thrust_stun",
                        "duration": 1,
                        "scope": "target",
                        "condition": {
                            "scope": "self",
                            "hasStatusId": "akimichi_chouji_s_expansion_technique_active"
                        },
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkillClasses": [
                                "physical",
                                "energy",
                                "mental",
                                "ninjutsu"
                            ],
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character's non-strategic skills are stunned for 1 turn."
                        }
                    }
                ]
            },
            {
                "id": "akimichi-chouji-s-effortful-block",
                "name": "Effortful Block",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill makes Akimichi Chouji (S) invulnerable for 1 turn.",
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
                        "statusId": "akimichi_chouji_s_effortful_block_invul",
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
    {
        "id": "yamanaka-ino-s",
        "characterId": "yamanaka-ino-s",
        "name": "Yamanaka Ino (S)",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "Not one to be left behind, Ino has trained non-stop to improve her abilities and teamwork. With her improved techniques, Ino can not only control her enemies, but her allies too all while seeing everything on the battlefield.",
        "requiredMissionId": "blondes-have-all-the-fun",
        "skills": [
            {
                "id": "yamanaka-ino-s-mind-body-switch",
                "name": "Mind Body Switch",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Yamanaka Ino (S) targets one enemy. After 1 turn, that enemy will take 15 damage and if that enemy uses a new harmful skill during this time, they will be countered and this skill will be replaced by the skill they used for 1 turn. This skill cannot be reflected and is invisible.",
                "energy": [
                    "Genjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Mental",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "yamanaka_ino_s_mind_body_switch_mark",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "invisible": true,
                            "cannotBeReflected": true,
                            "triggerOnEnemyHarmfulSkill": true,
                            "counterCopySkillReplacementFor": "yamanaka-ino-s-mind-body-switch",
                            "counterCopySkillReplacementDuration": 1,
                            "turnDurationAnchor": "any_turn",
                            "onExpireEffects": [
                                {
                                    "type": "damage",
                                    "amount": 15,
                                    "scope": "target"
                                }
                            ],
                            "tooltipText": "Subject to Mind Body Switch: will take 15 damage and have their next harmful skill countered and copied."
                        }
                    }
                ]
            },
            {
                "id": "yamanaka-ino-s-proxy-surveillance",
                "name": "Proxy Surveillance",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Yamanaka Ino (S) targets all enemies. For 3 turns, everytime they use a new skill, they will take 5 piercing damage. During this time, all new invisible skills they use will become visible. This skill cannot be countered or reflected.",
                "energy": [
                    "Random"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Mental",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "yamanaka_ino_s_proxy_surveillance_debuff",
                        "duration": 3,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "cannotBeCountered": true,
                            "cannotBeReflected": true,
                            "damageOnSkillUsePiercing": 5,
                            "revealInvisibleSkills": true,
                            "tooltipText": "Takes 5 piercing damage on skill use and invisible skills are revealed."
                        }
                    }
                ]
            },
            {
                "id": "yamanaka-ino-s-mind-clone-switch",
                "name": "Mind Clone Switch",
                "skillimage": "deadcharacter.png",
                "skilldescription": "For 2 turns, both of Yamanaka Ino (S)'s allies will ignore all harmful effects other than damage and energy cost changes. This skill is invisible and will end if Yamanaka Ino (S) dies.",
                "energy": [
                    "Genjutsu",
                    "Random"
                ],
                "target": "all-allies",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "yamanaka_ino_s_mind_clone_switch_guard",
                        "duration": 2,
                        "scope": "all-ally",
                        "metadata": {
                            "helpful": true,
                            "invisible": true,
                            "ignoreHarmfulNonDamageEffects": true,
                            "tooltipText": "Ignores all harmful non-damage and non-energy effects."
                        }
                    }
                ]
            },
            {
                "id": "yamanaka-ino-s-hide",
                "name": "Hide",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill makes Yamanaka Ino (S) invulnerable for 1 turn.",
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
                        "statusId": "yamanaka_ino_s_hide_invul",
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
    {
        "id": "rock-lee-s",
        "characterId": "rock-lee-s",
        "name": "Rock Lee (S)",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "Now a chuunin, Lee has trained endlessly with Gai, and not only learned new abilities, but has learned what it truly means to fight. In battle, Lee now fights for his friends and allies, growing stronger as they fall around him.",
        "requiredMissionId": "a-genius-of-hard-work",
        "skills": [
            {
                "id": "rock-lee-s-leaf-rising-wind",
                "name": "Leaf Rising Wind",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Rock Lee (S) targets one enemy, dealing 15 damage to them and lowering their non-affliction damage by 10 for 2 turns. This skill will deal 10 additional damage, and the damage reduction effect will last 1 additional turn for each ally that is dead.",
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
                        "amount": 15,
                        "scope": "target"
                    },
                    {
                        "type": "damage_per_dead_ally",
                        "amountPerDeadAlly": 10,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "rock_lee_s_leaf_rising_wind_weaken",
                        "duration": 2,
                        "durationPerDeadAllyBonus": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "damageDealtFlatModifier": -10,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character deals 10 less non-affliction damage."
                        }
                    }
                ]
            },
            {
                "id": "rock-lee-s-leaf-great-whirlwind",
                "name": "Leaf Great Whirlwind",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Rock Lee (S) targets one enemy, dealing 20 damage to one enemy and gaining 10 points of damage reduction for 1 turn. The following turn, this skill will deal 10 additional damage and grant 10 additional damage reduction. This skill will deal 5 additional damage for every ally that has been killed.",
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
                        "scope": "target",
                        "condition": {
                            "scope": "self",
                            "hasStatusId": "rock_lee_s_leaf_great_whirlwind_momentum"
                        }
                    },
                    {
                        "type": "damage_per_dead_ally",
                        "amountPerDeadAlly": 5,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "rock_lee_s_leaf_great_whirlwind_defense",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "damageReductionFlat": 10,
                            "tooltipText": "Lee has 10 damage reduction."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "rock_lee_s_leaf_great_whirlwind_momentum",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "turnDurationAnchor": "source_turn",
                            "damageReductionFlat": 10,
                            "tooltipText": "Empowers Leaf Great Whirlwind for the following turn with 10 damage reduction."
                        }
                    }
                ]
            },
            {
                "id": "rock-lee-s-maximum-force-blast",
                "name": "Maximum Force Blast",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Rock Lee (S) targets one enemy, dealing 20 damage to them. This skill will deal 15 additional damage for each ally that is dead and 15 additional damage for every 30 health that Rock Lee (S) has lost.",
                "energy": [
                    "Random",
                    "Random"
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
                        "type": "damage",
                        "amount": 20,
                        "scope": "target"
                    },
                    {
                        "type": "damage_per_dead_ally",
                        "amountPerDeadAlly": 15,
                        "scope": "target"
                    },
                    {
                        "type": "damage_per_lost_health_threshold",
                        "threshold": 30,
                        "amountPerThreshold": 15,
                        "scope": "target"
                    }
                ]
            },
            {
                "id": "rock-lee-s-jumping-dodge",
                "name": "Jumping Dodge",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill makes Rock Lee (S) invulnerable for 1 turn.",
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
                        "statusId": "rock_lee_s_jumping_dodge_invul",
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
    {
        "id": "tenten-s",
        "characterId": "tenten-s",
        "name": "Tenten (S)",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "Now a chuunin, Tenten has added a myriad of powerful and potent weapons in her arsenal, even procuring the legendary fan of the sage of the six paths. Having an arsenal of weapons at her side, Tenten can chose to fight at different levels, upgrading her weapons until she finds something suitable for her battle.",
        "requiredMissionId": "a-genius-of-ranged-combat",
        "skills": [
            {
                "id": "tenten-s-kunai-grenade",
                "name": "Kunai Grenade",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Tenten (S) deals 20 damage to one enemy and 10 damage to all other enemies. This skill cannot be countered or reflected.",
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
                            "cannotBeCountered": true,
                            "cannotBeReflected": true
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 10,
                        "scope": "other-enemy",
                        "metadata": {
                            "cannotBeCountered": true,
                            "cannotBeReflected": true
                        }
                    }
                ]
            },
            {
                "id": "tenten-s-chain-spin",
                "name": "Chain Spin",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Tenten (S) makes her team invulnerable to non-strategic skills for 1 turn.",
                "energy": [
                    "Random"
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
                        "statusId": "tenten_s_chain_spin_invul",
                        "duration": 1,
                        "scope": "all-ally",
                        "metadata": {
                            "invulnerableToNonStrategicSkills": true,
                            "tooltipText": "Invulnerable to non-strategic skills for 1 turn."
                        }
                    }
                ]
            },
            {
                "id": "tenten-s-weapon-upgrade",
                "name": "Weapon Upgrade",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Tenten (S) gains 5 points of destructible defense. The first time this skill is used, it will replace 'Kunai Grenade' and 'Chain Spin'. The second time it is used, they will be replaced again. The third time this skill is used, it will reset, and her skills will revert back to the original ones.",
                "energy": [],
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
                        "statusId": "tenten_s_weapon_upgrade_tier",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "destructibleDefensePoints": 5,
                            "destructibleDefensePermanent": true,
                            "tentenWeaponUpgradeCycle": true,
                            "tooltipText": "Tenten has upgraded her weapons with 5 destructible defense."
                        }
                    }
                ]
            },
            {
                "id": "tenten-s-leaping-dodge",
                "name": "Leaping Dodge",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill makes Tenten (S) invulnerable for 1 turn.",
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
                        "statusId": "tenten_s_leaping_dodge_invul",
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
                "id": "tenten-s-heavenly-chain-disaster",
                "name": "Heavenly Chain Disaster",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Tenten (S) deals 25 piercing damage to all enemies.",
                "energy": [
                    "Taijutsu",
                    "Random"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 1,
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
                            "ignoreDamageReduction": true
                        }
                    }
                ]
            },
            {
                "id": "tenten-s-iron-protection-wall",
                "name": "Iron Protection Wall",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Tenten (S) makes her team invulnerable to physical skills for 1 turn and grants them 20 points of permanent destructible defense. This effect stacks.",
                "energy": [
                    "Ninjutsu",
                    "Random"
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
                        "statusId": "tenten_s_iron_protection_wall_invul",
                        "duration": 1,
                        "scope": "all-ally",
                        "metadata": {
                            "invulnerableToPhysicalSkills": true,
                            "destructibleDefensePoints": 20,
                            "destructibleDefensePermanent": true,
                            "tooltipText": "Invulnerable to physical skills for 1 turn and gained 20 permanent destructible defense."
                        }
                    }
                ]
            },
            {
                "id": "tenten-s-bashousen-coil-of-wind",
                "name": "Bashousen: Coil of Wind",
                "skillimage": "deadcharacter.png",
                "skilldescription": "The following turn, any new non-mental skill used on Tenten (S) or her team will be reflected onto the character who used it. This skill is invisible.",
                "energy": [
                    "Ninjutsu",
                    "Random"
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
                        "statusId": "tenten_s_coil_of_wind_reflect",
                        "duration": 1,
                        "scope": "all-ally",
                        "metadata": {
                            "invisible": true,
                            "reflectOnEnemyHarmfulNonMental": true,
                            "tooltipText": "Reflects enemy non-mental skills next turn."
                        }
                    }
                ]
            },
            {
                "id": "tenten-s-bashousen-coil-of-fire",
                "name": "Bashousen: Coil of Fire",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Tenten (S) targets all enemies, dealing 10 damage and 10 affliction damage* to them. They will then receive 5 affliction damage* for the following 3 turns.",
                "energy": [
                    "Taijutsu",
                    "Ninjutsu"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Physical",
                    "Instant",
                    "Affliction*"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 10,
                        "scope": "all-enemy"
                    },
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
                        "statusId": "tenten_s_coil_of_fire_burn",
                        "duration": 3,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "damagePerTurn": 5,
                            "afflictionDamage": true,
                            "ignoreDamageReduction": true,
                            "ignoreDestructibleDefense": true,
                            "tooltipText": "Taking 5 affliction damage per turn."
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "hyuuga-neji-s",
        "characterId": "hyuuga-neji-s",
        "name": "Hyuuga Neji (S)",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "The only of the original genins to become a Jounin, Neji has only increased his already powerful set of abilities and skills during the near three years of time. While still being able to rely on his pressure point attacks, Neji is now also able to unleash giant waves of chakra for brutish damage as well.",
        "requiredMissionId": "pride-of-the-hyuuga",
        "skills": [
            {
                "id": "hyuuga-neji-s-eight-trigrams-vacuum-palm",
                "name": "Eight Trigrams Vacuum Palm",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Hyuuga Neji (S) deals 20 damage to one enemy and removes 1 random energy from them.",
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
                        "amount": 20,
                        "scope": "target"
                    },
                    {
                        "type": "remove_chakra",
                        "chakraType": "random",
                        "amount": 1,
                        "scope": "target"
                    }
                ]
            },
            {
                "id": "hyuuga-neji-s-eight-trigrams-mountain-crusher",
                "name": "Eight Trigrams Mountain Crusher",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Hyuuga Neji (S) targets one enemy, destroying any destructible defense they have and dealing 45 damage to them.",
                "energy": [
                    "Taijutsu",
                    "Bloodline"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Energy",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "destroy_destructible_defense",
                        "scope": "target"
                    },
                    {
                        "type": "damage",
                        "amount": 45,
                        "scope": "target"
                    }
                ]
            },
            {
                "id": "hyuuga-neji-s-byakugan-eight-trigrams-field",
                "name": "Byakugan - Eight Trigrams Field",
                "skillimage": "deadcharacter.png",
                "skilldescription": "For 2 turns, all enemies will be unable to reduce damage or become invulnerable. For 1 turn, any enemy that uses a new harmful skill on Hyuuga Neji (S) will be countered and this skill will be replaced by 'Pressure Point Strike'. This skill is invisible.",
                "energy": [
                    "Bloodline"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "hyuuga_neji_s_eight_trigrams_enemy_debuff",
                        "duration": 2,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "cannotReduceDamage": true,
                            "cannotBecomeInvulnerable": true,
                            "tooltipText": "Cannot reduce damage or become invulnerable for 2 turns."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "hyuuga_neji_s_field_counter_trap",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "invisible": true,
                            "triggerOnEnemyHarmfulSkill": true,
                            "counterStatusId": "hyuuga_neji_s_countered_by_field",
                            "counterStatusDuration": 2,
                            "counterStatusMetadata": {
                                "harmful": true,
                                "tooltipText": "Countered by Byakugan Field."
                            },
                            "counterApplyStatusToSourceOwner": {
                                "statusId": "hyuuga_neji_s_pressure_point_strike_active",
                                "duration": 1,
                                "metadata": {
                                    "helpful": true,
                                    "skillReplacements": {
                                        "hyuuga-neji-s-byakugan-eight-trigrams-field": "hyuuga-neji-s-pressure-point-strike"
                                    },
                                    "tooltipText": "Byakugan Field is replaced by Pressure Point Strike."
                                }
                            },
                            "tooltipText": "Neji will counter the first harmful skill used on him this turn."
                        }
                    }
                ]
            },
            {
                "id": "hyuuga-neji-s-byakugan-defense",
                "name": "Byakugan Defense",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill makes Hyuuga Neji (S) invulnerable for 1 turn.",
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
                        "statusId": "hyuuga_neji_s_byakugan_defense_invul",
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
                "id": "hyuuga-neji-s-pressure-point-strike",
                "name": "Pressure Point Strike",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Hyuuga Neji (S) attacks one enemy countered by 'Byakugan - Eight Trigrams Field' or this skill, dealing 5 damage and removing 1 random energy from them. The following turn this skill will deal 5 additional damage and will remain replaced. This effect stacks and is cumulative until Hyuuga Neji (S) stops using this skill.",
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
                        "type": "damage",
                        "amount": 5,
                        "scope": "target"
                    },
                    {
                        "type": "damage_stacking_consecutive",
                        "stackAmount": 5,
                        "scope": "target"
                    },
                    {
                        "type": "remove_chakra",
                        "chakraType": "random",
                        "amount": 1,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "hyuuga_neji_s_pressure_point_strike_chain",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillReplacements": {
                                "hyuuga-neji-s-byakugan-eight-trigrams-field": "hyuuga-neji-s-pressure-point-strike"
                            },
                            "tooltipText": "Pressure Point Strike chain active: deals +5 additional damage next turn."
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "hatake-kakashi-s",
        "characterId": "hatake-kakashi-s",
        "name": "Hatake Kakashi (S)",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "Kakashi has not let the years pass by idle, and has trained as hard as any other, improving his sharingan and his own unique jutsu. While Kakashi's raikiri is still a potent finisher, he is now also able to rely on his kamui, aiming it at his enemies or even rescuing his allies.",
        "requiredMissionId": "from-teacher-to-partner",
        "skills": [
            {
                "id": "hatake-kakashi-s-lightning-beast-fang",
                "name": "Lightning Beast Fang",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Hatake Kakashi (S) deals 25 piercing damage to one enemy and stuns them for 1 turn. The following turn, this skill will be replaced by 'Finishing Raikiri'.",
                "energy": [
                    "Ninjutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Energy",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 25,
                        "scope": "target",
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "hatake_kakashi_s_lightning_beast_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "stun": true,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character is stunned for 1 turn."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "hatake_kakashi_s_lightning_beast_mark",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "Marked by Lightning Beast Fang."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "hatake_kakashi_s_finishing_raikiri_active",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "turnDurationAnchor": "source_turn",
                            "skillReplacements": {
                                "hatake-kakashi-s-lightning-beast-fang": "hatake-kakashi-s-finishing-raikiri"
                            },
                            "tooltipText": "Lightning Beast Fang is replaced by Finishing Raikiri."
                        }
                    }
                ]
            },
            {
                "id": "hatake-kakashi-s-kakashi-kamui",
                "name": "Kakashi Kamui",
                "skillimage": "deadcharacter.png",
                "skilldescription": "If used on an enemy, they will receive 40 piercing damage, and for 1 turn their cooldowns will be increased by 1 and their skills will cost 1 additional random energy. If used on an ally or himself, all harmful effects on them will be removed and they will become invulnerable for 1 turn. This skill ignores invulnerability.",
                "energy": [
                    "Bloodline",
                    "Genjutsu"
                ],
                "target": "single-target",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Mental",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 40,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "isEnemy": true
                        },
                        "metadata": {
                            "ignoreDamageReduction": true,
                            "ignoreInvulnerability": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "hatake_kakashi_s_kamui_enemy_debuff",
                        "duration": 1,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "isEnemy": true
                        },
                        "metadata": {
                            "harmful": true,
                            "energyCostIncrease": {
                                "random": 1
                            },
                            "cooldownIncrease": 1,
                            "ignoreInvulnerability": true,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "Cooldowns increased by 1 and skills cost 1 additional random energy."
                        }
                    },
                    {
                        "type": "remove_status",
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "isAlly": true
                        },
                        "metadata": {
                            "harmfulOnly": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "hatake_kakashi_s_kamui_ally_invul",
                        "duration": 1,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "isAlly": true
                        },
                        "metadata": {
                            "helpful": true,
                            "invulnerable": true,
                            "tooltipText": "This character is invulnerable."
                        }
                    }
                ],
                "ignoreInvulnerability": true
            },
            {
                "id": "hatake-kakashi-s-team-tactics",
                "name": "Team Tactics",
                "skillimage": "deadcharacter.png",
                "skilldescription": "For 3 turns, Hatake Kakashi (S)'s allies will have the cooldown of their skills reduced by 1. The following 3 turns, the first new harmful skill used by one enemy will be copied and will replace this skill for 1 turn. This skill cannot be reflected.",
                "energy": [
                    "Random",
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
                        "statusId": "hatake_kakashi_s_team_tactics_buff",
                        "duration": 3,
                        "scope": "all-ally",
                        "metadata": {
                            "helpful": true,
                            "cannotBeReflected": true,
                            "cooldownReduction": 1,
                            "triggerOnEnemyHarmfulSkill": true,
                            "counterCopySkillReplacementFor": "hatake-kakashi-s-team-tactics",
                            "counterCopySkillReplacementDuration": 1,
                            "tooltipText": "Allies cooldowns reduced by 1."
                        }
                    }
                ]
            },
            {
                "id": "hatake-kakashi-s-bunshin-stand-in",
                "name": "Bunshin Stand-in",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill makes Hatake Kakashi (S) invulnerable for 1 turn.",
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
                        "statusId": "hatake_kakashi_s_bunshin_invul",
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
                "id": "hatake-kakashi-s-finishing-raikiri",
                "name": "Finishing Raikiri",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Hatake Kakashi (S) targets one enemy, dealing 30 piercing damage to them. This skill will deal 10 additional damage to that enemy if they are stunned or if 'Lightning Beast Fang' was used on them the previous turn.",
                "energy": [
                    "Ninjutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Energy",
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
                        "type": "damage",
                        "amount": 10,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "hasAnyStatusId": [
                                "hatake_kakashi_s_lightning_beast_stun",
                                "hatake_kakashi_s_lightning_beast_mark"
                            ]
                        },
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "yamato",
        "characterId": "yamato",
        "name": "Yamato",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "A member of the secretive ANBU organization and a man who was once injected with the cells of Hashirama, the 1st Hokage. Due to the cells that live inside of him, Yamato is capable of small scale wood element abilities, from trapping enemies to protecting his comrades.",
        "requiredMissionId": "a-new-team-leader",
        "skills": [
            {
                "id": "yamato-bliss-bringing-hands",
                "name": "Bliss-Bringing Hands",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Yamato targets one enemy, dealing 30 damage to them and making them ignore all helpful effects except energy cost changes for 1 turn.",
                "energy": [
                    "Bloodline",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Energy",
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
                        "statusId": "yamato_bliss_bringing_hands_nullify",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "ignoreHelpfulNonEnergyEffects": true,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "Ignores all helpful effects except energy cost changes for 1 turn."
                        }
                    }
                ]
            },
            {
                "id": "yamato-wood-release-wood-clone",
                "name": "Wood Release: Wood Clone",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Yamato targets one ally or himself for 1 turn, countering the first physical, energy or strategic skill used against them, dealing 20 damage to the enemy and granting that ally 20 points of destructible defense. This skill is invisible.",
                "energy": [
                    "Bloodline"
                ],
                "target": "single-ally",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Physical",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "yamato_wood_clone_counter_trap",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "invisible": true,
                            "triggerOnEnemyPhysicalOrStrategicSkill": true,
                            "counterDamage": 20,
                            "counterApplyStatusToRecipient": {
                                "statusId": "yamato_wood_clone_destructible_defense",
                                "duration": 99,
                                "metadata": {
                                    "helpful": true,
                                    "destructibleDefensePoints": 20,
                                    "destructibleDefensePermanent": true,
                                    "tooltipText": "Protected by Wood Clone (20 Destructible Defense)."
                                }
                            },
                            "tooltipText": "Counters the next physical, energy, or strategic skill, dealing 20 damage and granting 20 destructible defense."
                        }
                    }
                ]
            },
            {
                "id": "yamato-wood-release-four-pillar-prison",
                "name": "Wood Release: Four-Pillar Prison",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill can be used on one enemy or one ally. If used on an enemy, that enemy will have their physical, energy and strategic skills stunned for 2 turns. If used on an ally, that ally will gain 40 points of permanent destructible defense. This skill ignores invulnerability.",
                "energy": [
                    "Bloodline",
                    "Ninjutsu"
                ],
                "target": "single-target",
                "damage": 0,
                "cooldown": 4,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "yamato_four_pillar_prison_enemy_stun",
                        "duration": 2,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "isEnemy": true
                        },
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkillClasses": [
                                "physical",
                                "energy",
                                "strategic"
                            ],
                            "ignoreInvulnerability": true,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character's physical, energy and strategic skills are stunned for 2 turns."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "yamato_four_pillar_prison_ally_defense",
                        "duration": 99,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "isAlly": true
                        },
                        "metadata": {
                            "helpful": true,
                            "destructibleDefensePoints": 40,
                            "destructibleDefensePermanent": true,
                            "tooltipText": "Gained 40 permanent destructible defense."
                        }
                    }
                ],
                "ignoreInvulnerability": true
            },
            {
                "id": "yamato-wood-release-wood-shelter",
                "name": "Wood Release: Wood Shelter",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill makes Yamato invulnerable for 1 turn.",
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
                        "statusId": "yamato_wood_shelter_invul",
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
    {
        "id": "maito-gai-s",
        "characterId": "maito-gai-s",
        "name": "Maito Gai (S)",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "Still the leader of Team Gai, Gai is not one to let himself fall behind in terms of training and strength. Gai no longer feels the need to go straight into the highest level of gates that he can, instead taking his time, until the time requires the green beast of Konoha to go all out.",
        "requiredMissionId": "the-green-beast",
        "skills": [
            {
                "id": "maito-gai-s-nunchaku-taijutsu",
                "name": "Nunchaku Taijutsu",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Maito Gai (S) deals 10 damage to one enemy for 3 turns. During this time, if an enemy uses a new harmful physical skill on Maito Gai (S), he will deal 10 damage to them.*",
                "energy": [
                    "Taijutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Physical",
                    "Action",
                    "Instant*"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "maito_gai_s_nunchaku_action_dot",
                        "duration": 3,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "action": true,
                            "ongoingClass": "action",
                            "damagePerTurn": 10,
                            "tooltipText": "Taking 10 physical damage per turn from Nunchaku Taijutsu."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "maito_gai_s_nunchaku_retaliation_stance",
                        "duration": 3,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "ongoingClass": "action",
                            "retaliateOnIncomingHarmfulPhysicalDamage": 10,
                            "tooltipText": "Deals 10 damage back when hit by an enemy physical skill."
                        }
                    }
                ]
            },
            {
                "id": "maito-gai-s-fiery-kick",
                "name": "Fiery Kick",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Maito Gai (S) targets one enemy, dealing 35 damage to them and reducing all non-affliction damage they deal by 20 for 1 turn.",
                "energy": [
                    "Taijutsu",
                    "Bloodline"
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
                        "amount": 35,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "maito_gai_s_fiery_kick_weaken",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "damageDealtFlatModifier": -20,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character deals 20 less non-affliction damage for 1 turn."
                        }
                    }
                ]
            },
            {
                "id": "maito-gai-s-single-gate-release",
                "name": "Single Gate Release",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Maito Gai (S) receives 5 affliction damage*, but permanently gains 5 points of damage reduction and increases the damage of 'Nunchaku Taijutsu' and 'Fiery Kick' by 5. At 6 usages of this skill, 'Fiery Kick' will be replaced by 'Morning Peacock', and at 7 usages of this skill, it will be replaced by 'Daytime Tiger'. This skill can only be used 7 times.",
                "energy": [],
                "target": "self",
                "damage": 0,
                "cooldown": 0,
                "maxUsagesPerMatch": 7,
                "classes": [
                    "Strategic",
                    "Instant",
                    "Affliction*"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 5,
                        "scope": "self",
                        "metadata": {
                            "afflictionDamage": true,
                            "ignoreDamageReduction": true,
                            "ignoreDestructibleDefense": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "maito_gai_s_gate_stack",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "stackable": true,
                            "maxStacks": 7,
                            "damageReductionFlat": 5,
                            "skillDamageBonuses": {
                                "maito-gai-s-nunchaku-taijutsu": 5,
                                "maito-gai-s-fiery-kick": 5
                            },
                            "gaiGateProgression": true,
                            "tooltipText": "Gai has opened an Eight Gate granting 5 damage reduction, 5 skill damage, up to 7 gates."
                        }
                    }
                ]
            },
            {
                "id": "maito-gai-s-muscle-block",
                "name": "Muscle Block",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill makes Maito Gai (S) invulnerable for 1 turn.",
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
                        "statusId": "maito_gai_s_muscle_block_invul",
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
                "id": "maito-gai-s-morning-peacock",
                "name": "Morning Peacock",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Maito Gai (S) deals 60 damage to one enemy and stuns them for 1 turn.",
                "energy": [
                    "Taijutsu",
                    "Bloodline"
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
                        "amount": 60,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "maito_gai_s_morning_peacock_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "stun": true,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character is stunned for 1 turn."
                        }
                    }
                ]
            },
            {
                "id": "maito-gai-s-daytime-tiger",
                "name": "Daytime Tiger",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Maito Gai (S) deals 300 damage to one enemy.",
                "energy": [
                    "Taijutsu",
                    "Bloodline"
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
                        "amount": 300,
                        "scope": "target"
                    }
                ]
            }
        ]
    },
    {
        "id": "kankuro-s",
        "characterId": "kankuro-s",
        "name": "Kankuro (S)",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "In the last couple years Kankuro has become a Jounin and has created a new puppet. He is now able to harness three puppets at once and is a more versatile combatant. ORIGINAL DESIGN: Yaseen16",
        "requiredMissionId": "the-aspiring-puppet-master",
        "skills": [
            {
                "id": "kankuro-s-kuroari-trap",
                "name": "Kuroari Trap",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Kankuro (S) targets one enemy, countering any harmful skill they use for 1 turn. If countered, that enemy will take 100% more damage from 'Karasu Knives' the following turn. This skill is invisible until triggered.",
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
                        "statusId": "kankuro_s_kuroari_trap_mark",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "invisible": true,
                            "triggerOnEnemyHarmfulSkill": true,
                            "counterStatusId": "kankuro_s_kuroari_trap_triggered",
                            "counterStatusDuration": 1,
                            "counterStatusMetadata": {
                                "harmful": true,
                                "bonusDamageFromSourceSkillsPercent": 100,
                                "bonusDamageAppliesToSkillIds": [
                                    "kankuro-s-karasu-knives"
                                ],
                                "tooltipText": "Takes 100% more damage from Karasu Knives."
                            },
                            "tooltipText": "Subject to Kuroari Trap: next harmful skill will be countered, increasing Karasu Knives damage by 100%."
                        }
                    }
                ]
            },
            {
                "id": "kankuro-s-karasu-knives",
                "name": "Karasu Knives",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Kankuro (S) targets an enemy, dealing 20 damage to them. The following turn, that enemy will take 10 affliction damage.*",
                "energy": [
                    "Random",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Physical",
                    "Instant",
                    "Affliction*"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 20,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kankuro_s_karasu_knives_poison",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "onExpireEffects": [
                                {
                                    "type": "damage",
                                    "amount": 10,
                                    "scope": "target",
                                    "metadata": {
                                        "afflictionDamage": true,
                                        "ignoreDamageReduction": true,
                                        "ignoreDestructibleDefense": true
                                    }
                                }
                            ],
                            "tooltipText": "Will take 10 affliction damage next turn."
                        }
                    }
                ]
            },
            {
                "id": "kankuro-s-sanshouo-shield",
                "name": "Sanshouo Shield",
                "skillimage": "deadcharacter.png",
                "skilldescription": "For 3 turns, Kankuro (S) and his allies will have 10 points of damage reduction and will ignore harmful non-conditional affliction damage. This skill becomes 'Defensive Puppet Control' for 3 turns after used.",
                "energy": [
                    "Random",
                    "Random"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "kankuro_s_sanshouo_shield_buff",
                        "duration": 3,
                        "scope": "all-ally",
                        "metadata": {
                            "helpful": true,
                            "damageReductionFlat": 10,
                            "immuneToNonConditionalAfflictionDamage": true,
                            "tooltipText": "Has 10 damage reduction and ignores non-conditional affliction damage."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kankuro_s_sanshouo_shield_stance",
                        "duration": 3,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillReplacements": {
                                "kankuro-s-sanshouo-shield": "kankuro-s-defensive-puppet-control"
                            },
                            "tooltipText": "Sanshouo Shield is active: replaced by Defensive Puppet Control."
                        }
                    }
                ]
            },
            {
                "id": "kankuro-s-puppet-distraction",
                "name": "Puppet Distraction",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill makes Kankuro (S) invulnerable for 1 turn.",
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
                        "statusId": "kankuro_s_puppet_distraction_invul",
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
                "id": "kankuro-s-defensive-puppet-control",
                "name": "Defensive Puppet Control",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Kankuro (S) targets one ally or himself, granting them 20 points of damage reduction for 1 turn.",
                "energy": [],
                "target": "single-ally",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "kankuro_s_defensive_puppet_control_dr",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "helpful": true,
                            "damageReductionFlat": 20,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character has 20 damage reduction for 1 turn."
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "temari-s",
        "characterId": "temari-s",
        "name": "Temari (S)",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "Temari has grown over the years. She is now a Jounin as well as the sister of Kankuro and Gaara. Temari is also the Hidden Sand Village's ambassador to the Hidden Leaf Village.",
        "requiredMissionId": "the-third-sand-sibling",
        "skills": [
            {
                "id": "temari-s-first-moon",
                "name": "First Moon",
                "skillimage": "deadcharacter.png",
                "skilldescription": "'Wind Scythe' will deal 5 additional damage permanently. Temari (S) gains 15 points of damage reduction permanently and this skill becomes 'Second Moon' permanently when used.",
                "energy": [],
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
                        "statusId": "temari_s_first_moon_active",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "damageReductionFlat": 15,
                            "skillDamageBonuses": {
                                "temari-s-wind-scythe": 5
                            },
                            "skillReplacements": {
                                "temari-s-first-moon": "temari-s-second-moon"
                            },
                            "tooltipText": "First Moon active: 15 damage reduction, Wind Scythe deals +5 damage."
                        }
                    }
                ]
            },
            {
                "id": "temari-s-ally-protection",
                "name": "Ally Protection",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Temari (S) targets one ally. For 1 turn, that ally will gain 20 points of damage reduction and they cannot be killed.",
                "energy": [
                    "Random"
                ],
                "target": "single-ally",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "temari_s_ally_protection_buff",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "helpful": true,
                            "damageReductionFlat": 20,
                            "cannotBeKilled": true,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character has 20 damage reduction and cannot be killed for 1 turn."
                        }
                    }
                ]
            },
            {
                "id": "temari-s-wind-scythe",
                "name": "Wind Scythe",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Temari (S) deals 25 damage to one enemy.",
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
                        "amount": 25,
                        "scope": "target"
                    }
                ]
            },
            {
                "id": "temari-s-fan-offensive-defense",
                "name": "Fan Offensive Defense",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill makes Temari (S) invulnerable for 1 turn.",
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
                        "statusId": "temari_s_fan_offensive_defense_invul",
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
                "id": "temari-s-second-moon",
                "name": "Second Moon",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Temari (S) ends 'First Moon'. Temari (S) gains 5 points of damage reduction and 10 points of unpierceable damage reduction permanently and 'Wind Scythe' will deal 10 additional damage permanently. This skill becomes 'Third Moon' permanently when used.",
                "energy": [],
                "target": "self",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "remove_status",
                        "statusId": "temari_s_first_moon_active",
                        "scope": "self"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "temari_s_second_moon_active",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "damageReductionFlat": 5,
                            "damageReductionUnpierceableFlat": 10,
                            "skillDamageBonuses": {
                                "temari-s-wind-scythe": 10
                            },
                            "skillReplacements": {
                                "temari-s-first-moon": "temari-s-third-moon",
                                "temari-s-second-moon": "temari-s-third-moon"
                            },
                            "tooltipText": "Second Moon active: 5 DR, 10 unpierceable DR, Wind Scythe deals +10 damage."
                        }
                    }
                ]
            },
            {
                "id": "temari-s-third-moon",
                "name": "Third Moon",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Temari (S) deals 20 damage to all enemies and makes them deal 5 less damage for 1 turn.",
                "energy": [
                    "Ninjutsu",
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
                        "amount": 20,
                        "scope": "all-enemy"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "temari_s_third_moon_weaken",
                        "duration": 1,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "damageDealtFlatModifier": -5,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "Deals 5 less damage for 1 turn."
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "kazekage-gaara",
        "characterId": "kazekage-gaara",
        "name": "Kazekage Gaara",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "After a few short years and much soul-searching, Gaara has risen to be his village's Kazekage. Rather than destroying others he now protects those he cares about to prove his existence. ORIGINAL DESIGN: Liann",
        "requiredMissionId": "finding-his-purpose",
        "skills": [
            {
                "id": "kazekage-gaara-desert-missile",
                "name": "Desert Missile",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Kazekage Gaara deals 15 piercing damage to one enemy and reduces their non-affliction damage by 10 for 1 turn. This effect lasts 1 additional turn for each Desert Charge Kazekage Gaara has and then removes all Desert Charges on him.",
                "energy": [
                    "Bloodline"
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
                        "type": "apply_status",
                        "statusId": "kazekage_gaara_desert_missile_weaken",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "damageDealtFlatModifier": -10,
                            "consumeChargeStatusId": "kazekage_gaara_desert_charge",
                            "durationPerChargeBonus": 1,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character deals 10 less non-affliction damage."
                        }
                    }
                ]
            },
            {
                "id": "kazekage-gaara-desert-prison",
                "name": "Desert Prison",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Kazekage Gaara deals 25 damage to one enemy and stuns them for 1 turn. This skill grants Kazekage Gaara 1 Desert Charge.",
                "energy": [
                    "Bloodline",
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
                        "amount": 25,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kazekage_gaara_desert_prison_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "stun": true,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character is stunned for 1 turn."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kazekage_gaara_desert_charge",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "stackable": true,
                            "tooltipText": "Desert Charge active."
                        }
                    }
                ]
            },
            {
                "id": "kazekage-gaara-sand-summoning",
                "name": "Sand Summoning",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Kazekage Gaara gains 5 points of permanent damage reduction and 1 Desert Charge. His allies gain 10 points of permanent destructible defense. 'Desert Missile' and 'Desert Prison' will deal 5 additional damage permanently. This skill stacks.",
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
                        "statusId": "kazekage_gaara_sand_summoning_buff",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "stackable": true,
                            "damageReductionFlat": 5,
                            "skillDamageBonuses": {
                                "kazekage-gaara-desert-missile": 5,
                                "kazekage-gaara-desert-prison": 5
                            },
                            "tooltipText": "Gaara gains 5 damage reduction and +5 skill damage."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kazekage_gaara_desert_charge",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "stackable": true,
                            "tooltipText": "Desert Charge active."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kazekage_gaara_ally_destructible_defense",
                        "duration": 99,
                        "scope": "all-ally",
                        "metadata": {
                            "helpful": true,
                            "destructibleDefensePoints": 10,
                            "destructibleDefensePermanent": true,
                            "tooltipText": "Protected by Sand Summoning (10 permanent Destructible Defense)."
                        }
                    }
                ]
            },
            {
                "id": "kazekage-gaara-sand-sphere",
                "name": "Sand Sphere",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill makes Kazekage Gaara invulnerable for 1 turn.",
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
                        "statusId": "kazekage_gaara_sand_sphere_invul",
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
    {
        "id": "yakushi-kabuto-s",
        "characterId": "yakushi-kabuto-s",
        "name": "Yakushi Kabuto (S)",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "Kabuto is the loyal servant of Orochimaru and is a very dangerous missing-nin. He is a calculating individual who is both accomplished at combat and healing.",
        "requiredMissionId": "a-double-agent",
        "skills": [
            {
                "id": "yakushi-kabuto-s-charging-mystical-palm",
                "name": "Charging Mystical Palm",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Yakushi Kabuto (S) deals 20 damage to one enemy. For 1 turn, that enemy will ignore all helpful effects except energy cost changes.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Energy",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 20,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "yakushi_kabuto_s_charging_palm_nullify",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "ignoreHelpfulNonEnergyEffects": true,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "Ignores all helpful effects except energy cost changes for 1 turn."
                        }
                    }
                ]
            },
            {
                "id": "yakushi-kabuto-s-dead-soul-technique",
                "name": "Dead Soul Technique",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Yakushi Kabuto (S) targets one enemy, dealing 30 piercing damage to them. For the rest of the game, that enemy will ignore healing effects.",
                "energy": [
                    "Ninjutsu",
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
                        "amount": 30,
                        "scope": "target",
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "yakushi_kabuto_s_dead_soul_curse",
                        "duration": 99,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "ignoreHealing": true,
                            "tooltipText": "This character cannot be healed for the rest of the game."
                        }
                    }
                ]
            },
            {
                "id": "yakushi-kabuto-s-medical-ninjutsu",
                "name": "Medical Ninjutsu",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Yakushi Kabuto (S) heals one ally or himself for 25 health and removes all enemy affliction skills from them.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "single-ally",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "heal",
                        "amount": 25,
                        "scope": "target"
                    },
                    {
                        "type": "remove_status",
                        "scope": "target",
                        "metadata": {
                            "afflictionOnly": true,
                            "harmfulOnly": true
                        }
                    }
                ]
            },
            {
                "id": "yakushi-kabuto-s-precise-evasion",
                "name": "Precise Evasion",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill makes Yakushi Kabuto (S) invulnerable for 1 turn.",
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
                        "statusId": "yakushi_kabuto_s_precise_evasion_invul",
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
    {
        "id": "orochimaru-s",
        "characterId": "orochimaru-s",
        "name": "Orochimaru (S)",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "Orochimaru returns, strong as ever and with some new tricks up his sleeve, but his body seems to be on borrowed time.",
        "requiredMissionId": "return-of-the-snake",
        "skills": [
            {
                "id": "orochimaru-s-second-skin",
                "name": "Second Skin",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Orochimaru (S) sets his health to 100 (this is a healing effect). This skill will be replaced by 'Triple Rashoumon' permanently.",
                "energy": [
                    "Ninjutsu"
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
                        "type": "set_health",
                        "amount": 100,
                        "isHealingEffect": true,
                        "scope": "self"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "orochimaru_s_triple_rashoumon_permanent_replacement",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillReplacements": {
                                "orochimaru-s-second-skin": "orochimaru-s-triple-rashoumon"
                            },
                            "tooltipText": "Second Skin replaced by Triple Rashoumon."
                        }
                    }
                ]
            },
            {
                "id": "orochimaru-s-sword-snake-horde",
                "name": "Sword Snake Horde",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Orochimaru (S) deals 20 affliction damage to one enemy. For 1 turn, the stun effects of their skills will last 1 turn less.",
                "energy": [
                    "Bloodline"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Affliction",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 20,
                        "scope": "target",
                        "metadata": {
                            "afflictionDamage": true,
                            "ignoreDamageReduction": true,
                            "ignoreDestructibleDefense": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "orochimaru_s_sword_snake_horde_stun_reduction",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "stunDurationReduction": 1,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "Stun effects of skills last 1 turn less for 1 turn."
                        }
                    }
                ]
            },
            {
                "id": "orochimaru-s-extended-kusanagi",
                "name": "Extended Kusanagi",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Orochimaru (S) targets one enemy. That enemy has their non-mental skills stunned for 2 turns. During this time, this enemy takes 20 piercing damage each turn.",
                "energy": [
                    "Taijutsu",
                    "Bloodline"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Physical",
                    "Control"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "orochimaru_s_extended_kusanagi_control",
                        "duration": 2,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "control": true,
                            "ongoingClass": "control",
                            "damagePerTurn": 20,
                            "ignoreDamageReduction": true,
                            "cannotUseSkillClasses": [
                                "physical",
                                "energy",
                                "strategic",
                                "ninjutsu"
                            ],
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character is stunned for non-mental skills and takes 20 piercing damage per turn."
                        }
                    }
                ]
            },
            {
                "id": "orochimaru-s-ground-mobility",
                "name": "Ground Mobility",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill makes Orochimaru (S) invulnerable for 1 turn.",
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
                        "statusId": "orochimaru_s_ground_mobility_invul",
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
                "id": "orochimaru-s-triple-rashoumon",
                "name": "Triple Rashoumon",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Orochimaru (S) targets both teams. For 2 turns, Orochimaru (S)'s team will be invulnerable to harmful skills. For 1 turn, the enemy team will be invulnerable to harmful skills. This skill cannot be countered or reflected.",
                "energy": [
                    "Ninjutsu",
                    "Ninjutsu",
                    "Random"
                ],
                "target": "all-characters",
                "damage": 0,
                "cooldown": 5,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "orochimaru_s_triple_rashoumon_team_invul",
                        "duration": 2,
                        "scope": "all-ally",
                        "metadata": {
                            "helpful": true,
                            "cannotBeCountered": true,
                            "cannotBeReflected": true,
                            "invulnerableToHarmfulSkills": true,
                            "tooltipText": "Invulnerable to harmful skills for 2 turns."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "orochimaru_s_triple_rashoumon_enemy_invul",
                        "duration": 1,
                        "scope": "all-enemy",
                        "metadata": {
                            "helpful": true,
                            "cannotBeCountered": true,
                            "cannotBeReflected": true,
                            "invulnerableToHarmfulSkills": true,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "Invulnerable to harmful skills for 1 turn."
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "four-tails-kyuubi-naruto",
        "characterId": "four-tails-kyuubi-naruto",
        "name": "Four Tails Kyuubi Naruto",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "Naruto, after giving into his rage and manifesting a fourth tail, ceases to be himself. In this state, Naruto becomes a mindless being of rage and destruction - but the price is his own life.",
        "requiredMissionId": "what-lies-beneath",
        "skills": [
            {
                "id": "four-tails-kyuubi-naruto-transformation",
                "name": "Four Tails Transformation",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Four Tails Kyuubi Naruto gains 15 points of unpierceable damage reduction and 15 points of destructible defense permanently. He takes 5 affliction damage* each turn. He ignores healing effects and enemy stun effects. Four Tails Kyuubi Naruto can use 'Shockwave Smash' and 'Compressed Chakra Blast' while this skill is active. This skill becomes 'Enrage' permanently. This skill cannot be removed.",
                "energy": [
                    "Random"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Strategic",
                    "Instant",
                    "Affliction*"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "four_tails_kyuubi_transformation_stance",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "damageReductionUnpierceableFlat": 15,
                            "destructibleDefensePoints": 15,
                            "destructibleDefensePermanent": true,
                            "damagePerTurn": 5,
                            "afflictionDamage": true,
                            "ignoreDamageReduction": true,
                            "ignoreDestructibleDefense": true,
                            "ignoreHealing": true,
                            "immuneToStun": true,
                            "cannotBeRemoved": true,
                            "skillReplacements": {
                                "four-tails-kyuubi-naruto-transformation": "four-tails-kyuubi-naruto-enrage"
                            },
                            "tooltipText": "Four Tails Transformation is active: 15 unpierceable DR, takes 5 affliction damage per turn, immune to healing and stuns."
                        }
                    }
                ]
            },
            {
                "id": "four-tails-kyuubi-naruto-shockwave-smash",
                "name": "Shockwave Smash",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Four Tails Kyuubi Naruto deals 20 damage to all enemies. This skill may only be used during 'Four Tails Transformation' and cannot be reflected.",
                "energy": [
                    "Random",
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
                        "amount": 20,
                        "scope": "all-enemy",
                        "condition": {
                            "scope": "self",
                            "hasStatusId": "four_tails_kyuubi_transformation_stance"
                        },
                        "metadata": {
                            "cannotBeReflected": true
                        }
                    }
                ]
            },
            {
                "id": "four-tails-kyuubi-naruto-compressed-chakra-blast",
                "name": "Compressed Chakra Blast",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Four Tails Kyuubi Naruto deals 50 piercing damage to one enemy. This skill may only be used during 'Four Tails Transformation' and cannot be reflected.",
                "energy": [
                    "Random",
                    "Random",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Energy",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 50,
                        "scope": "target",
                        "condition": {
                            "scope": "self",
                            "hasStatusId": "four_tails_kyuubi_transformation_stance"
                        },
                        "metadata": {
                            "ignoreDamageReduction": true,
                            "cannotBeReflected": true
                        }
                    }
                ]
            },
            {
                "id": "four-tails-kyuubi-naruto-skin-of-chakra",
                "name": "Skin of Chakra",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill makes Four Tails Kyuubi Naruto invulnerable for 1 turn.",
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
                        "statusId": "four_tails_kyuubi_skin_of_chakra_invul",
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
                "id": "four-tails-kyuubi-naruto-enrage",
                "name": "Enrage",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Four Tails Kyuubi Naruto takes 10 affliction damage*. For 2 turns, 'Shockwave Smash' will deal 5 additional damage and 'Compressed Chakra Blast' will cost 1 random energy less.",
                "energy": [],
                "target": "self",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Strategic",
                    "Instant",
                    "Affliction*"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 10,
                        "scope": "self",
                        "metadata": {
                            "afflictionDamage": true,
                            "ignoreDamageReduction": true,
                            "ignoreDestructibleDefense": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "four_tails_kyuubi_enrage_buff",
                        "duration": 2,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillDamageBonuses": {
                                "four-tails-kyuubi-naruto-shockwave-smash": 5
                            },
                            "skillCostOverridesBySkillId": {
                                "four-tails-kyuubi-naruto-compressed-chakra-blast": {
                                    "energy": [
                                        "Random",
                                        "Random"
                                    ]
                                }
                            },
                            "tooltipText": "Shockwave Smash deals +5 damage and Compressed Chakra Blast costs 1 less energy."
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "kisame-body-double",
        "characterId": "kisame-body-double",
        "name": "Kisame Body Double",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "By using one of Pain's techniques a Sand Nin spy for Akatsuki is changed to look like Kisame. The body double is controlled by Kisame but only has a third of his chakra.",
        "requiredMissionId": "return-of-a-rival",
        "skills": [
            {
                "id": "kisame-body-double-explosive-water-shock-wave",
                "name": "Explosive Water Shock Wave",
                "skillimage": "deadcharacter.png",
                "skilldescription": "For 4 turns, Kisame Body Double and his allies will lose 1 less energy if a energy removal or stealing skill is used on them. For 4 turns, all enemies who use a new skill will have the cooldown of that skill increased by 2 turns. During this time, 'Water Prison Technique' and 'Five Man-Eating Sharks' will be improved and this skill will be replaced by 'Sentient Water Disabling'.",
                "energy": [
                    "Bloodline",
                    "Ninjutsu"
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
                        "statusId": "kisame_body_double_shock_wave_stance",
                        "duration": 4,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "energyDrainResistance": 1,
                            "enemySkillCooldownIncreaseOnUse": 2,
                            "skillReplacements": {
                                "kisame-body-double-explosive-water-shock-wave": "kisame-body-double-sentient-water-disabling"
                            },
                            "skillCostOverridesBySkillId": {
                                "kisame-body-double-water-prison-technique": {
                                    "energy": [
                                        "Random"
                                    ]
                                },
                                "kisame-body-double-five-man-eating-sharks": {
                                    "energy": [
                                        "Genjutsu"
                                    ]
                                }
                            },
                            "tooltipText": "Explosive Water Shock Wave active: enemies suffer +2 CD on skills, energy drain reduced by 1."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kisame_body_double_drain_resistance_team",
                        "duration": 4,
                        "scope": "all-ally",
                        "metadata": {
                            "helpful": true,
                            "energyDrainResistance": 1,
                            "tooltipText": "Loses 1 less energy when energy is removed or stolen."
                        }
                    }
                ]
            },
            {
                "id": "kisame-body-double-water-prison-technique",
                "name": "Water Prison Technique",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Kisame Body Double deals 15 piercing damage to one enemy, stuns their non-strategic skills for 1 turn and makes them invulnerable to friendly skills also for 1 turn. During this time, Kisame Body Double gains 15 points of damage reduction. During 'Explosive Water Shock Wave', this skill costs 1 random energy instead.",
                "energy": [
                    "Bloodline"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Energy",
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
                        "type": "apply_status",
                        "statusId": "kisame_body_double_water_prison_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkillClasses": [
                                "physical",
                                "energy",
                                "mental",
                                "ninjutsu"
                            ],
                            "invulnerableToFriendlySkills": true,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "Non-strategic skills are stunned and invulnerable to friendly skills."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kisame_body_double_water_prison_dr",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "damageReductionFlat": 15,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "Gained 15 damage reduction."
                        }
                    }
                ]
            },
            {
                "id": "kisame-body-double-five-man-eating-sharks",
                "name": "Five Man-Eating Sharks",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Kisame Body Double deals 25 damage to one enemy for 2 turns. During 'Explosive Water Shock Wave', this skill costs 1 random energy less.",
                "energy": [
                    "Ninjutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Energy",
                    "Action"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "kisame_body_double_sharks_action_dot",
                        "duration": 2,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "action": true,
                            "ongoingClass": "action",
                            "damagePerTurn": 25,
                            "tooltipText": "Taking 25 energy damage per turn."
                        }
                    }
                ]
            },
            {
                "id": "kisame-body-double-samehada-block",
                "name": "Samehada Block",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill makes Kisame Body Double invulnerable for 1 turn.",
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
                        "statusId": "kisame_body_double_samehada_block_invul",
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
                "id": "kisame-body-double-sentient-water-disabling",
                "name": "Sentient Water Disabling",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Kisame Body Double targets himself or an ally. For 1 turn, the first harmful non-mental skill used on the target will be countered and the countered enemy will have 'Water Prison Technique' applied on them. This skill is invisible.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "single-ally",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "kisame_body_double_sentient_water_trap",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "invisible": true,
                            "triggerOnEnemyHarmfulNonMental": true,
                            "counterStatusId": "kisame_body_double_water_prison_stun",
                            "counterStatusDuration": 1,
                            "counterStatusMetadata": {
                                "harmful": true,
                                "cannotUseSkillClasses": [
                                    "physical",
                                    "energy",
                                    "mental",
                                    "ninjutsu"
                                ],
                                "invulnerableToFriendlySkills": true,
                                "tooltipText": "Non-strategic skills stunned and invulnerable to friendly skills."
                            },
                            "tooltipText": "Counters the next harmful non-mental skill."
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "itachi-body-double",
        "characterId": "itachi-body-double",
        "name": "Itachi Body Double",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "By using one of Pain's techniques a Sand Nin spy for Akatsuki is changed to look like Itachi. The body double is controlled by Itachi but only has a third of his chakra.",
        "requiredMissionId": "the-real-itachi",
        "skills": [
            {
                "id": "itachi-body-double-finger-genjutsu",
                "name": "Finger Genjutsu",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Itachi Body Double targets one enemy. If the affected enemy uses a new harmful skill, that skill will be countered, that enemy will take 10 damage, and Itachi Body Double will gain 1 genjutsu energy. The target of this skill is invisible.",
                "energy": [
                    "Genjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Mental",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "itachi_body_double_finger_genjutsu_mark",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "invisible": true,
                            "triggerOnEnemyHarmfulSkill": true,
                            "counterDamage": 10,
                            "counterApplyStatusToSourceOwner": {
                                "statusId": "itachi_body_double_finger_gain_chakra",
                                "duration": 1,
                                "metadata": {
                                    "onApplyGainChakra": {
                                        "chakraType": "genjutsu",
                                        "amount": 1
                                    }
                                }
                            },
                            "tooltipText": "Under Finger Genjutsu: next harmful skill will be countered for 10 damage and 1 genjutsu chakra."
                        }
                    }
                ]
            },
            {
                "id": "itachi-body-double-genjutsu-reversal",
                "name": "Genjutsu Reversal",
                "skillimage": "deadcharacter.png",
                "skilldescription": "For 2 turns, if any enemy uses a non-mental skill on Itachi Body Double, he will reflect that skill onto the enemy who used it. This skill is invisible.",
                "energy": [
                    "Bloodline",
                    "Genjutsu"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "itachi_body_double_genjutsu_reversal_reflect",
                        "duration": 2,
                        "scope": "self",
                        "metadata": {
                            "invisible": true,
                            "reflectOnEnemyHarmfulNonMental": true,
                            "tooltipText": "Reflects non-mental skills back to the attacker for 2 turns."
                        }
                    }
                ]
            },
            {
                "id": "itachi-body-double-fire-release-fireball",
                "name": "Fire Release: Fireball",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Itachi Body Double attacks, dealing 20 damage to one enemy. The following turn, all enemies take an additional 10 affliction damage.*",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Energy",
                    "Instant",
                    "Affliction*"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 20,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "itachi_body_double_fireball_burn",
                        "duration": 1,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "onExpireEffects": [
                                {
                                    "type": "damage",
                                    "amount": 10,
                                    "scope": "target",
                                    "metadata": {
                                        "afflictionDamage": true,
                                        "ignoreDamageReduction": true,
                                        "ignoreDestructibleDefense": true
                                    }
                                }
                            ],
                            "tooltipText": "All enemies will take 10 affliction damage next turn."
                        }
                    }
                ]
            },
            {
                "id": "itachi-body-double-illusionary-raven-bunshin",
                "name": "Illusionary Raven Bunshin",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill makes Itachi Body Double invulnerable for 1 turn.",
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
                        "statusId": "itachi_body_double_raven_bunshin_invul",
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
    {
        "id": "deidara",
        "characterId": "deidara",
        "name": "Deidara",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "A former ninja of the Earth Village and now a junior Akatsuki member, Deidara is able to fuse clay and chakra to create devastating explosives. ORIGINAL DESIGN: Liann",
        "requiredMissionId": "a-true-artist",
        "skills": [
            {
                "id": "deidara-c1-birds",
                "name": "C1: Birds",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Deidara deals 10 piercing damage to one enemy for 2 turns. During this skill Deidara will be invulnerable to mental skills and this enemy's energy skills will deal 10 less damage*. 'Art is a Bang!' will deal 5 additional damage permanently*. This effect stacks.",
                "energy": [
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Energy",
                    "Action",
                    "Instant*"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "deidara_c1_birds_action_dot",
                        "duration": 2,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "action": true,
                            "ongoingClass": "action",
                            "damagePerTurn": 10,
                            "ignoreDamageReduction": true,
                            "skillClassDamageDealtModifiers": {
                                "energy": -10
                            },
                            "tooltipText": "Taking 10 piercing damage per turn and energy skills deal 10 less damage."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "deidara_c1_birds_mental_invul",
                        "duration": 2,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "ongoingClass": "action",
                            "invulnerableToMentalSkills": true,
                            "tooltipText": "Invulnerable to mental skills."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "deidara_art_is_a_bang_boost",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "ongoingClass": "action",
                            "stackable": true,
                            "skillDamageBonuses": {
                                "deidara-art-is-a-bang": 5
                            },
                            "tooltipText": "Art is a Bang! deals +5 additional damage permanently."
                        }
                    }
                ]
            },
            {
                "id": "deidara-c1-centipede",
                "name": "C1: Centipede",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Deidara deals 25 piercing damage to one enemy. For 1 turn Deidara will be invulnerable to energy skills and this enemy's physical skills will deal 10 less damage. 'Art is a Bang!' will deal 5 additional damage permanently. This effect stacks.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Energy",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 25,
                        "scope": "target",
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "deidara_c1_centipede_energy_invul",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "invulnerableToEnergySkills": true,
                            "tooltipText": "Invulnerable to energy skills for 1 turn."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "deidara_c1_centipede_physical_weaken",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "skillClassDamageDealtModifiers": {
                                "physical": -10
                            },
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "Physical skills deal 10 less damage for 1 turn."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "deidara_art_is_a_bang_boost",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "stackable": true,
                            "skillDamageBonuses": {
                                "deidara-art-is-a-bang": 5
                            },
                            "tooltipText": "Art is a Bang! deals +5 additional damage permanently."
                        }
                    }
                ]
            },
            {
                "id": "deidara-art-is-a-bang",
                "name": "Art is a Bang!",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Deidara deals 25 piercing damage to all enemies. Deidara will instantly die after this skill is used. This skill cannot be countered or reflected and its self-death effect cannot be ignored.",
                "energy": [
                    "Bloodline",
                    "Ninjutsu"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Energy",
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
                        "type": "instant_kill",
                        "scope": "self",
                        "metadata": {
                            "cannotBeIgnored": true
                        }
                    }
                ]
            },
            {
                "id": "deidara-clay-mold",
                "name": "Clay Mold",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Deidara gains 5 points of permanent destructible defense. This effect stacks. The first time this skill is used, it replaces 'C1: Birds' and 'C1: Centipede' with their alternative versions. The second time this skill is used Deidara's skills will revert back to their original versions.",
                "energy": [],
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
                        "statusId": "deidara_clay_mold_stance",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "destructibleDefensePoints": 5,
                            "destructibleDefensePermanent": true,
                            "deidaraClayMoldToggle": true,
                            "tooltipText": "Deidara has molded clay granting 5 destructible defense: alternate skills toggled."
                        }
                    }
                ]
            },
            {
                "id": "deidara-c3-statue",
                "name": "C3: Statue",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Deidara deals 35 piercing damage to one enemy. For 1 turn Deidara will be invulnerable to physical skills and this enemy's mental skills will deal 10 less damage. 'Art is a Bang!' will deal 5 additional damage permanently. This effect stacks.",
                "energy": [
                    "Ninjutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Energy",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 35,
                        "scope": "target",
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "deidara_c3_statue_physical_invul",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "invulnerableToPhysicalSkills": true,
                            "tooltipText": "Invulnerable to physical skills for 1 turn."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "deidara_c3_statue_mental_weaken",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "skillClassDamageDealtModifiers": {
                                "mental": -10
                            },
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "Mental skills deal 10 less damage for 1 turn."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "deidara_art_is_a_bang_boost",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "stackable": true,
                            "skillDamageBonuses": {
                                "deidara-art-is-a-bang": 5
                            },
                            "tooltipText": "Art is a Bang! deals +5 additional damage permanently."
                        }
                    }
                ]
            },
            {
                "id": "deidara-c2-dragon",
                "name": "C2: Dragon",
                "skillimage": "deadcharacter.png",
                "skilldescription": "For 2 turns, all enemies will take 10 piercing damage if they use a new skill. During this time they will take 5 additional damage from energy skills and 'Clay Mold' will grant 10 additional destructible defense.",
                "energy": [
                    "Random",
                    "Random"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Energy",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "deidara_c2_dragon_field",
                        "duration": 2,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "damageOnSkillUsePiercing": 10,
                            "damageTakenFromSkillClassModifiers": {
                                "energy": 5
                            },
                            "tooltipText": "Takes 10 piercing damage when using a skill and +5 damage from energy skills."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "deidara_c2_dragon_clay_mold_amp",
                        "duration": 2,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "clayMoldExtraDefense": 10,
                            "tooltipText": "Clay Mold grants 10 additional destructible defense."
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "hiruko-sasori",
        "characterId": "hiruko-sasori",
        "name": "Hiruko Sasori",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "Hiruko is a puppet used by the Akatsuki shinobi, Sasori. Serving as a \"puppet armor\", it allowed Sasori to hide inside of it. Hiruko is a human puppet made from the corpse of a renowned shinobi - this puppet is also Sasori's favorite. ORIGINAL DESIGN: Liann",
        "requiredMissionId": "covering-puppet",
        "skills": [
            {
                "id": "hiruko-sasori-poisonous-tail-stab",
                "name": "Poisonous Tail Stab",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Hiruko Sasori deals 10 affliction damage to one enemy, who will take 5 affliction damage each following turn permanently. This skill stacks.",
                "energy": [
                    "Taijutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Affliction",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 10,
                        "scope": "target",
                        "metadata": {
                            "afflictionDamage": true,
                            "ignoreDamageReduction": true,
                            "ignoreDestructibleDefense": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "hiruko_sasori_poisonous_tail_poison",
                        "duration": 99,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "stackable": true,
                            "damagePerTurn": 5,
                            "afflictionDamage": true,
                            "ignoreDamageReduction": true,
                            "ignoreDestructibleDefense": true,
                            "tooltipText": "Taking 5 affliction damage each turn permanently."
                        }
                    }
                ]
            },
            {
                "id": "hiruko-sasori-sand-clone-trap",
                "name": "Sand Clone Trap",
                "skillimage": "deadcharacter.png",
                "skilldescription": "For 1 turn, Hiruko Sasori will ignore all enemy damage dealt. Every enemy that use a new non-strategic skill on him during this time will take 10 affliction damage instantly and then take 10 affliction damage permanently. This skill stacks and ends when Hiruko Sasori dies. This skill is invisible.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Affliction",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "hiruko_sasori_sand_clone_trap_active",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "invisible": true,
                            "invulnerableToEnemyDamage": true,
                            "triggerOnEnemyHarmfulNonStrategic": true,
                            "counterDamage": 10,
                            "counterDamageIgnoresReduction": true,
                            "counterDamageIgnoresDestructibleDefense": true,
                            "counterStatusId": "hiruko_sasori_sand_clone_poison_perm",
                            "counterStatusDuration": 99,
                            "counterStatusMetadata": {
                                "harmful": true,
                                "stackable": true,
                                "damagePerTurn": 10,
                                "afflictionDamage": true,
                                "ignoreDamageReduction": true,
                                "ignoreDestructibleDefense": true,
                                "tooltipText": "Taking 10 permanent affliction damage per turn."
                            },
                            "tooltipText": "Ignores enemy damage for 1 turn and poisons attackers for 10 instant damage and 10 permanent damage."
                        }
                    }
                ]
            },
            {
                "id": "hiruko-sasori-puppet-reveal",
                "name": "Puppet Reveal",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Hiruko Sasori removes all enemy affliction skills on him then becomes invulnerable to energy and affliction skills for 3 turns. During this time, 'Poisonous Tail Stab' will be replaced by 'Eight Waves of Needles' and 'Sand Clone Trap' will be replaced by 'Prosthetic Arm Senbon'.",
                "energy": [
                    "Random"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 5,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "remove_status",
                        "scope": "self",
                        "metadata": {
                            "afflictionOnly": true,
                            "harmfulOnly": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "hiruko_sasori_puppet_reveal_active",
                        "duration": 3,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "invulnerableToEnergySkills": true,
                            "invulnerableToAfflictionSkills": true,
                            "skillReplacements": {
                                "hiruko-sasori-poisonous-tail-stab": "hiruko-sasori-eight-waves-of-needles",
                                "hiruko-sasori-sand-clone-trap": "hiruko-sasori-prosthetic-arm-senbon"
                            },
                            "tooltipText": "Puppet Reveal active: Invulnerable to energy and affliction skills."
                        }
                    }
                ]
            },
            {
                "id": "hiruko-sasori-tail-deflection",
                "name": "Tail Deflection",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill makes Hiruko Sasori invulnerable for 1 turn.",
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
                        "statusId": "hiruko_sasori_tail_deflection_invul",
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
                "id": "hiruko-sasori-eight-waves-of-needles",
                "name": "Eight Waves of Needles",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Hiruko Sasori removes all enemy affliction skills on his team and then deals 5 affliction damage to all enemies each turn permanently. This skill stacks.",
                "energy": [
                    "Taijutsu",
                    "Ninjutsu"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Affliction",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "remove_status",
                        "scope": "all-ally",
                        "metadata": {
                            "afflictionOnly": true,
                            "harmfulOnly": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "hiruko_sasori_eight_waves_dot",
                        "duration": 99,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "stackable": true,
                            "damagePerTurn": 5,
                            "afflictionDamage": true,
                            "ignoreDamageReduction": true,
                            "ignoreDestructibleDefense": true,
                            "tooltipText": "Taking 5 affliction damage each turn permanently."
                        }
                    }
                ]
            },
            {
                "id": "hiruko-sasori-prosthetic-arm-senbon",
                "name": "Prosthetic Arm Senbon",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Hiruko Sasori removes all enemy affliction skills on his team and then deals 5 piercing damage and 5 affliction damage* to all enemies for 3 turns. When this skill ends, Hiruko Sasori will become invulnerable for 1 turn. This skill ends if Hiruko Sasori dies.",
                "energy": [
                    "Random",
                    "Random"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Physical",
                    "Instant",
                    "Affliction*"
                ],
                "effects": [
                    {
                        "type": "remove_status",
                        "scope": "all-ally",
                        "metadata": {
                            "afflictionOnly": true,
                            "harmfulOnly": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "hiruko_sasori_prosthetic_arm_dot",
                        "duration": 3,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "damagePerTurn": 5,
                            "ignoreDamageReduction": true,
                            "afflictionDamagePerTurn": 5,
                            "onExpireEffects": [
                                {
                                    "type": "apply_status",
                                    "statusId": "hiruko_sasori_prosthetic_arm_end_invul",
                                    "duration": 1,
                                    "scope": "source",
                                    "metadata": {
                                        "helpful": true,
                                        "invulnerable": true,
                                        "tooltipText": "Invulnerable for 1 turn."
                                    }
                                }
                            ],
                            "tooltipText": "Taking 5 piercing damage and 5 affliction damage per turn for 3 turns."
                        }
                    }
                ]
            }
        ]
    },
    {
        "id": "sasori-of-the-red-sand",
        "characterId": "sasori-of-the-red-sand",
        "name": "Sasori of the Red Sand",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "Sasori is a senior Akatsuki member and a legendary puppet master. He is even rumored to have defeated an entire nation with puppets alone. ORIGINAL DESIGN: Pavera",
        "requiredMissionId": "master-of-puppets",
        "skills": [
            {
                "id": "sasori-of-the-red-sand-thousand-hands",
                "name": "Thousand Hands",
                "skillimage": "deadcharacter.png",
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
                "skillimage": "deadcharacter.png",
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
                "skillimage": "deadcharacter.png",
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
                "skillimage": "deadcharacter.png",
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
                "skillimage": "deadcharacter.png",
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
                "skillimage": "deadcharacter.png",
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
    },
    {
        "id": "puppet-sasori",
        "characterId": "puppet-sasori",
        "name": "Puppet Sasori",
        "facePicture": "deadcharacter.png",
        "characterdeescription": "Sasori's true form is a puppet body with a living core attached to it. In this form, he can use weapons like a flamethrower and water jets, while still controling a hundred puppets. ORIGINAL DESIGN: AnteMito",
        "requiredMissionId": "a-perfect-body",
        "skills": [
            {
                "id": "puppet-sasori-flamethrower",
                "name": "Flamethrower",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Puppet Sasori deals 20 affliction damage to one enemy. If 'Water Stream Shooters' was used on this enemy the previous turn, they will have their non-affliction damage reduced by 10 for 1 turn.",
                "energy": [
                    "Bloodline"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Affliction",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 20,
                        "scope": "target",
                        "metadata": {
                            "afflictionDamage": true,
                            "ignoreDamageReduction": true,
                            "ignoreDestructibleDefense": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "puppet_sasori_flamethrower_mark",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "Marked by Flamethrower."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "puppet_sasori_flamethrower_weaken",
                        "duration": 1,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "hasStatusId": "puppet_sasori_water_stream_mark"
                        },
                        "metadata": {
                            "harmful": true,
                            "damageDealtFlatModifier": -10,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character deals 10 less non-affliction damage for 1 turn."
                        }
                    }
                ]
            },
            {
                "id": "puppet-sasori-water-stream-shooters",
                "name": "Water Stream Shooters",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Puppet Sasori deals 20 piercing damage to one enemy. If 'Flamethrower' was used on this enemy the previous turn, they will be stunned for 1 turn.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Energy",
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
                    },
                    {
                        "type": "apply_status",
                        "statusId": "puppet_sasori_water_stream_mark",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "Marked by Water Stream Shooters."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "puppet_sasori_water_stream_stun",
                        "duration": 1,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "hasStatusId": "puppet_sasori_flamethrower_mark"
                        },
                        "metadata": {
                            "harmful": true,
                            "stun": true,
                            "turnDurationAnchor": "source_turn",
                            "tooltipText": "This character is stunned for 1 turn."
                        }
                    }
                ]
            },
            {
                "id": "puppet-sasori-performance-of-a-hundred-puppets",
                "name": "Performance of a Hundred Puppets",
                "skillimage": "deadcharacter.png",
                "skilldescription": "For 3 turns, 'Flamethrower' and 'Water Stream Shooters' will deal 10 additional damage. During this time, Puppet Sasori targets all enemies and everytime they use a new harmful skill, they will take 5 piercing damage. The following 3 turns, this skill will be replaced by 'Puppet Attack'.",
                "energy": [
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
                        "type": "apply_status",
                        "statusId": "puppet_sasori_hundred_puppets_self_buff",
                        "duration": 3,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillDamageBonuses": {
                                "puppet-sasori-flamethrower": 10,
                                "puppet-sasori-water-stream-shooters": 10
                            },
                            "skillReplacements": {
                                "puppet-sasori-performance-of-a-hundred-puppets": "puppet-sasori-puppet-attack"
                            },
                            "tooltipText": "Flamethrower and Water Stream Shooters deal 10 additional damage."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "puppet_sasori_hundred_puppets_retaliation_mark",
                        "duration": 3,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "damageOnHarmfulSkillUsePiercing": 5,
                            "tooltipText": "Takes 5 piercing damage when using a harmful skill."
                        }
                    }
                ]
            },
            {
                "id": "puppet-sasori-living-core",
                "name": "Living Core",
                "skillimage": "deadcharacter.png",
                "skilldescription": "This skill makes Puppet Sasori invulnerable for 1 turn.",
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
                        "statusId": "puppet_sasori_living_core_invul",
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
                "id": "puppet-sasori-puppet-attack",
                "name": "Puppet Attack",
                "skillimage": "deadcharacter.png",
                "skilldescription": "Puppet Sasori deals 25 damage to all enemies.",
                "energy": [
                    "Random",
                    "Random"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Physical",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 25,
                        "scope": "all-enemy"
                    }
                ]
            }
        ]
    }
];

if (typeof module !== 'undefined') {
    module.exports = characters;
}
