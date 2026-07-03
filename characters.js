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
                "skilldescription": "Uzumaki Naruto deals 20 damage to one enemy. During 'Shadow Clones' this skill will deal 10 additional damage.",
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
                "id": "uzumaki-naruto-overwhelming-chakra-wave",
                "name": "Overwhelming Chakra Wave",
                "skillimage": "https://i.imgur.com/N1LUxVU.png",
                "skilldescription": "Uzumaki Naruto will gain 1 random chakra after 1 turn. For 1 turn 'Uzumaki Naruto Combo' and 'Rasengan' will be unable to be used.",
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
                        "statusId": "uzumaki_naruto_overwhelming_chakra_wave_lock",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "cannotUseSkillIndices": [
                                0,
                                2
                            ],
                            "tooltipText": "Uzumaki Naruto Combo and Rasengan cannot be used."
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
                "skilldescription": "Uzumaki Naruto gains 15 points of damage reduction for 4 turns. For 3 turns 'Uzumaki Naruto Combo' will deal 10 additional damage and this skill will be replaced by 'Rasengan'.",
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
                        "statusId": "uzumaki_naruto_shadow_clones_defense",
                        "duration": 4,
                        "scope": "self",
                        "metadata": {
                            "damageReductionFlat": 15,
                            "tooltipText": "Naruto has 15 damage reduction."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "uzumaki_naruto_shadow_clones_active",
                        "duration": 3,
                        "scope": "self",
                        "metadata": {
                            "skillDamageBonuses": {
                                "uzumaki-naruto-combo": 10
                            },
                            "skillReplacements": {
                                "uzumaki-naruto-shadow-clones": "uzumaki-naruto-rasengan"
                            },
                            "tooltipText": "Uzumaki Naruto Combo deals 10 additional damage and Shadow Clones is replaced by Rasengan."
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
                "skillimage": "https://i.imgur.com/lro3e07.png",
                "skilldescription": "Uzumaki Naruto deals 45 damage to one enemy and stuns their skills for 1 turn.",
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
                        "amount": 45,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "stunned",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkills": true,
                            "tooltipText": "This character is stunned and cannot use skills."
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
                "skilldescription": "Haruno Sakura deals 20 damage to one enemy and stuns their physical and strategic skills for 1 turn. During 'Inner Sakura', 'KO Punch' deals 10 additional damage.",
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
                            "tooltipText": "This character physical and strategic skills are stunned."
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
                "skilldescription": "For 4 turns, Haruno Sakura will gain 10 points of damage reduction and will ignore all enemy stun effects. During this time 'KO Punch' will deal 10 additional damage.",
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
                        "statusId": "haruno_sakura_inner_sakura_active",
                        "duration": 4,
                        "scope": "self",
                        "metadata": {
                            "damageReductionFlat": 10,
                            "cannotBeStunned": true,
                            "skillDamageBonuses": {
                                "haruno-sakura-ko-punch": 10
                            },
                            "tooltipText": "Sakura has 10 damage reduction, ignores stuns, and KO Punch deals 10 additional damage."
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
                "skilldescription": "Uchiha Sasuke deals 35 damage to one enemy. This skill will deal 10 additional damage to an enemy affected by 'Sharingan'.",
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
                        "amount": 35,
                        "scope": "target"
                    },
                    {
                        "type": "damage",
                        "amount": 10,
                        "scope": "target",
                        "condition": {
                            "statusId": "uchiha_sasuke_sharingan_target",
                            "scope": "target"
                        }
                    }
                ]
            },
            {
                "id": "uchiha-sasuke-chidori",
                "name": "Chidori",
                "skillimage": "https://i.imgur.com/rJ3WZmI.png",
                "skilldescription": "Uchiha Sasuke deals 35 piercing damage to one enemy. This skill will deal 25 additional damage to an enemy affected by 'Sharingan'.",
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
                        "amount": 35,
                        "scope": "target",
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 25,
                        "scope": "target",
                        "condition": {
                            "statusId": "uchiha_sasuke_sharingan_target",
                            "scope": "target"
                        },
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    }
                ]
            },
            {
                "id": "uchiha-sasuke-sharingan",
                "name": "Sharingan",
                "skillimage": "https://i.imgur.com/IkTLWta.png",
                "skilldescription": "Uchiha Sasuke targets one enemy. For 3 turns, Uchiha Sasuke will gain 10 points of damage reduction. During this time, that enemy will be unable to reduce damage or become invulnerable. This skill will end if Uchiha Sasuke dies.",
                "energy": [
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 4,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "uchiha_sasuke_sharingan_target",
                        "duration": 3,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotReduceDamage": true,
                            "cannotBecomeInvulnerable": true,
                            "ongoingClass": "action",
                            "tooltipText": "This character is affected by Sharingan and cannot reduce damage or become invulnerable."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "uchiha_sasuke_sharingan_focus",
                        "duration": 3,
                        "scope": "self",
                        "metadata": {
                            "damageReductionFlat": 10,
                            "tooltipText": "Sasuke has 10 damage reduction while Sharingan is active."
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
                "skilldescription": "Inuzuka Kiba deals 30 piercing damage to one enemy. During 'Double Headed Wolf' this skill costs 1 less random chakra.",
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
                            "ignoreDamageReduction": true
                        }
                    }
                ]
            },
            {
                "id": "inuzuka-kiba-double-headed-wolf",
                "name": "Double Headed Wolf",
                "skillimage": "https://i.imgur.com/cKssLAR.png",
                "skilldescription": "Inuzuka Kiba deals 15 damage to all enemies for 3 turns. For 3 turns, 'Garouga' will cost 1 random chakra less. During this time, Inuzuka Kiba gains 15 points of damage reduction.",
                "energy": [
                    "Taijutsu",
                    "Bloodline"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Physical",
                    "Action",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "inuzuka_kiba_double_headed_wolf_damage",
                        "duration": 3,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 15,
                            "turnEndTrigger": "source_turn",
                            "turnDurationAnchor": "source_turn",
                            "ongoingClass": "action",
                            "triggerOnApply": true,
                            "tooltipText": "This character takes 15 damage from Double Headed Wolf."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "inuzuka_kiba_double_headed_wolf_active",
                        "duration": 3,
                        "scope": "self",
                        "metadata": {
                            "damageReductionFlat": 15,
                            "skillReplacements": {
                                "inuzuka-kiba-garouga": "inuzuka-kiba-garouga-reduced"
                            },
                            "tooltipText": "Kiba has 15 damage reduction and Garouga costs 1 less random chakra."
                        }
                    }
                ]
            },
            {
                "id": "inuzuka-kiba-dynamic-marking",
                "name": "Dynamic Marking",
                "skillimage": "https://i.imgur.com/kiVGr2x.png",
                "skilldescription": "Inuzuka Kiba targets one enemy, making them unable to reduce damage or become invulnerable for 2 turns. During this time, 'Garouga' and 'Double Headed Wolf' will deal 5 additional damage to them. This skill cannot be used on an enemy already affected by it.",
                "energy": [
                    "none"
                ],
                "target": "single-enemy",
                "targetCondition": {
                    "missingStatusId": "inuzuka_kiba_dynamic_marking"
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
                                "inuzuka-kiba-garouga-reduced",
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
            },
            {
                "id": "inuzuka-kiba-garouga-reduced",
                "name": "Garouga",
                "hiddenFromSelectionViewer": true,
                "useBaseSkillCooldown": true,
                "skillimage": "https://i.imgur.com/dhx6Qvr.png",
                "skilldescription": "Inuzuka Kiba deals 30 piercing damage to one enemy.",
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
                        "amount": 30,
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
                    "Bloodline",
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
                "energy": [
                    "none"
                ],
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
                            "destructibleDefensePoints": 20,
                            "mergeNumericAddKeys": [
                                "destructibleDefensePoints"
                            ],
                            "tooltipText": "This character has permanent destructible defense from Bug Wall."
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
                "skilldescription": "Hyuuga Hinata deals 15 damage to one enemy for 2 turns. If used during 'Byakugan', this skill will also remove 1 random chakra each turn.",
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
                        "statusId": "hyuuga_hinata_gentle_fist",
                        "duration": 2,
                        "scope": "target",
                        "condition": {
                            "scope": "self",
                            "missingStatusId": "hyuuga_hinata_byakugan"
                        },
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 15,
                            "turnEndTrigger": "source_turn",
                            "turnDurationAnchor": "source_turn",
                            "ongoingClass": "action",
                            "triggerOnApply": true,
                            "tooltipText": "This character takes 15 damage from Gentle Fist."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "hyuuga_hinata_gentle_fist_byakugan",
                        "duration": 2,
                        "scope": "target",
                        "condition": {
                            "scope": "self",
                            "statusId": "hyuuga_hinata_byakugan"
                        },
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 15,
                            "turnEndRemoveRandomChakra": 1,
                            "turnEndTrigger": "source_turn",
                            "turnDurationAnchor": "source_turn",
                            "ongoingClass": "action",
                            "triggerOnApply": true,
                            "tooltipText": "This character takes 15 damage from Gentle Fist and loses 1 random chakra."
                        }
                    }
                ]
            },
            {
                "id": "hyuuga-hinata-protective-eight-trigrams-sixty-four-palms",
                "name": "Protective Eight Trigrams Sixty-Four Palms",
                "skillimage": "https://i.imgur.com/CFkIcA6.png",
                "skilldescription": "Hyuuga Hinata deals 10 piercing damage to all enemies and grants her team 10 points of destructible defense for 1 turn. If used during 'Byakugan', this skill will deal 5 additional damage.",
                "energy": [
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
                        "amount": 10,
                        "scope": "all-enemy",
                        "condition": {
                            "scope": "self",
                            "missingStatusId": "hyuuga_hinata_byakugan"
                        },
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 15,
                        "scope": "all-enemy",
                        "condition": {
                            "scope": "self",
                            "statusId": "hyuuga_hinata_byakugan"
                        },
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "hyuuga_hinata_protective_palms_defense",
                        "duration": 1,
                        "scope": "all-allies",
                        "metadata": {
                            "destructibleDefensePoints": 10,
                            "tooltipText": "This character has 10 destructible defense."
                        }
                    }
                ]
            },
            {
                "id": "hyuuga-hinata-byakugan",
                "name": "Byakugan",
                "skillimage": "https://i.imgur.com/TcjSSGB.png",
                "skilldescription": "Hyuuga Hinata gains 15 points of damage reduction for 4 turns. The following 4 turns, 'Hinata Gentle Fist' and 'Protective Eight Trigrams Sixty-Four Palms' will be improved.",
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
                        "statusId": "hyuuga_hinata_byakugan",
                        "duration": 4,
                        "scope": "self",
                        "metadata": {
                            "damageReductionFlat": 15,
                            "tooltipText": "Hinata has 15 damage reduction and her skills are improved."
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
            },
            {
                "id": "hyuuga-hinata-hinata-gentle-fist-byakugan",
                "name": "Hinata Gentle Fist",
                "hiddenFromSelectionViewer": true,
                "omitFromSelectionViewer": true,
                "useBaseSkillCooldown": true,
                "skillimage": "https://i.imgur.com/guOfm9P.png",
                "skilldescription": "Hyuuga Hinata deals 15 damage to one enemy for 2 turns and removes 1 random chakra from them each turn.",
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
                        "statusId": "hyuuga_hinata_gentle_fist_byakugan",
                        "duration": 2,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 15,
                            "turnEndRemoveRandomChakra": 1,
                            "turnEndTrigger": "source_turn",
                            "turnDurationAnchor": "source_turn",
                            "ongoingClass": "action",
                            "triggerOnApply": true,
                            "tooltipText": "This character takes 15 damage and loses 1 random chakra from Gentle Fist."
                        }
                    }
                ]
            },
            {
                "id": "hyuuga-hinata-protective-eight-trigrams-sixty-four-palms-byakugan",
                "name": "Protective Eight Trigrams Sixty-Four Palms",
                "hiddenFromSelectionViewer": true,
                "omitFromSelectionViewer": true,
                "useBaseSkillCooldown": true,
                "skillimage": "https://i.imgur.com/CFkIcA6.png",
                "skilldescription": "Hyuuga Hinata deals 15 piercing damage to all enemies and grants her team 10 points of destructible defense for 1 turn.",
                "energy": [
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
                        "amount": 15,
                        "scope": "all-enemy",
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "hyuuga_hinata_protective_palms_defense",
                        "duration": 1,
                        "scope": "all-allies",
                        "metadata": {
                            "destructibleDefensePoints": 10,
                            "tooltipText": "This character has 10 destructible defense."
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
                "skilldescription": "Nara Shikamaru targets one enemy for 5 turns. During this time 'Shadow-Neck Bind' and 'Shadow Imitation' will be improved on them. This skill cannot be countered or reflected and cannot be used on an enemy already being affected.",
                "energy": [
                    "none"
                ],
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
                        "duration": 5,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "tooltipText": "Shadow-Neck Bind and Shadow Imitation last 1 additional turn on this character."
                        }
                    }
                ]
            },
            {
                "id": "nara-shikamaru-shadow-neck-bind",
                "name": "Shadow-Neck Bind",
                "skillimage": "https://i.imgur.com/qrtbpQH.png",
                "skilldescription": "Nara Shikamaru makes all enemies unable to reduce damage or become invulnerable and deals 15 damage to them for 1 turn. This skill lasts 1 additional turn on enemies affected by 'Meditate'.",
                "energy": [
                    "Genjutsu"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Energy",
                    "Action",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "nara_shikamaru_shadow_neck_bind",
                        "duration": 1,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "cannotReduceDamage": true,
                            "cannotBecomeInvulnerable": true,
                            "turnEndDamage": 15,
                            "turnEndTrigger": "source_turn",
                            "turnDurationAnchor": "source_turn",
                            "ongoingClass": "action",
                            "triggerOnApply": true,
                            "tooltipText": "This character cannot reduce damage or become invulnerable and takes 15 damage."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "nara_shikamaru_shadow_neck_bind",
                        "duration": 2,
                        "scope": "all-enemy",
                        "condition": {
                            "scope": "target",
                            "statusId": "nara_shikamaru_meditate"
                        },
                        "metadata": {
                            "harmful": true,
                            "cannotReduceDamage": true,
                            "cannotBecomeInvulnerable": true,
                            "turnEndDamage": 15,
                            "turnEndTrigger": "source_turn",
                            "turnDurationAnchor": "source_turn",
                            "ongoingClass": "action",
                            "triggerOnApply": true,
                            "tooltipText": "This character cannot reduce damage or become invulnerable and takes 15 damage."
                        }
                    }
                ]
            },
            {
                "id": "nara-shikamaru-shadow-imitation",
                "name": "Shadow Imitation",
                "skillimage": "https://i.imgur.com/Hip2U8C.png",
                "skilldescription": "Nara Shikamaru stuns all enemies' physical, chakra and strategic skills for 1 turn. This skill lasts 1 additional turn on enemies affected by 'Meditate'.",
                "energy": [
                    "Random",
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
                        "duration": 1,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkillClasses": [
                                "physical",
                                "energy",
                                "strategic"
                            ],
                            "tooltipText": "This character's physical, chakra and strategic skills are stunned."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "nara_shikamaru_shadow_imitation",
                        "duration": 2,
                        "scope": "all-enemy",
                        "condition": {
                            "scope": "target",
                            "statusId": "nara_shikamaru_meditate"
                        },
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkillClasses": [
                                "physical",
                                "energy",
                                "strategic"
                            ],
                            "tooltipText": "This character's physical, chakra and strategic skills are stunned."
                        }
                    }
                ]
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
                "skilldescription": "Akimichi Chouji deals 10 damage to one enemy for 2 turns and becomes invulnerable for 2 turns.",
                "energy": [
                    "Bloodline"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Physical",
                    "Action",
                    "Instant"
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
                            "tooltipText": "Chouji is invulnerable."
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
                            "skillDamageBonuses": {
                                "akimichi-chouji-partial-double-size": 20,
                                "akimichi-chouji-meat-tank": 10
                            },
                            "tooltipText": "Partial Double Size and Meat Tank deal additional damage."
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
                "ignoreInvulnerability": true,
                "skillimage": "https://i.imgur.com/3g2XWzn.png",
                "skilldescription": "Yamanaka Ino stuns one enemy's physical, chakra and strategic skills and makes them unable to reduce damage or become invulnerable for 1 turn. One random enemy will take 30 piercing damage that ignores invulnerability.",
                "energy": [
                    "Random",
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
                        "type": "apply_status",
                        "statusId": "yamanaka_ino_mind_body_disturbance_control",
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
                            "tooltipText": "This character's physical, chakra and strategic skills are stunned and they cannot reduce damage or become invulnerable."
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 30,
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
                "skilldescription": "Yamanaka Ino targets one enemy for 4 turns, making them unable to reduce damage or become invulnerable and stunning their skills. During this time, this skill will be replaced by 'Art of the Valentine'.",
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
                        "statusId": "yamanaka_ino_mind_body_switch_target",
                        "duration": 4,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkills": true,
                            "cannotReduceDamage": true,
                            "cannotBecomeInvulnerable": true,
                            "tooltipText": "This character is controlled by Mind Body Switch."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "yamanaka_ino_mind_body_switch_active",
                        "duration": 4,
                        "scope": "self",
                        "metadata": {
                            "skillReplacements": {
                                "yamanaka-ino-mind-body-switch": "yamanaka-ino-art-of-the-valentine"
                            },
                            "tooltipText": "Mind Body Switch is replaced by Art of the Valentine."
                        }
                    }
                ]
            },
            {
                "id": "yamanaka-ino-chakra-hair-strand-trap",
                "name": "Chakra Hair Strand Trap",
                "skillimage": "https://i.imgur.com/CH2jrFU.png",
                "skilldescription": "For 1 turn, if one target enemy uses a new harmful skill, they will have the cooldowns of their skills increased by 1 for 2 turns. This skill is invisible until triggered.",
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
                        "type": "apply_status",
                        "statusId": "yamanaka_ino_chakra_hair_strand_trap",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "hideTooltipFromUnitOwner": true,
                            "onOwnerUseSkillTrigger": true,
                            "onOwnerUseSkillHarmfulOnly": true,
                            "onOwnerUseSkillEffects": [
                                {
                                    "type": "apply_status",
                                    "statusId": "yamanaka_ino_chakra_hair_strand_trap_cooldown",
                                    "duration": 2,
                                    "metadata": {
                                        "nextUsedSkillCooldownAdjustment": 1,
                                        "tooltipText": "This character's next used skill has its cooldown increased by 1."
                                    }
                                }
                            ],
                            "tooltipText": "If this character uses a new harmful skill, their cooldowns are increased."
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
                "skillimage": "https://i.imgur.com/p25BBXs.png",
                "skilldescription": "Yamanaka Ino deals 25 damage to one enemy.",
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
                        "amount": 25,
                        "scope": "target"
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
                "skilldescription": "Rock Lee deals 10 damage to one enemy for 3 turns and takes 10 affliction damage. The following 3 turns, Rock Lee will gain 10 points of damage reduction and that enemy will take 10 additional damage from 'Front Lotus'. This skill stacks and will deal 15 additional damage during 'Fifth Gate Opening'.",
                "energy": [
                    "Taijutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Physical",
                    "Action",
                    "Instant",
                    "Affliction"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "rock_lee_high_speed_taijutsu_damage",
                        "duration": 3,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 10,
                            "turnEndTrigger": "source_turn",
                            "turnDurationAnchor": "source_turn",
                            "ongoingClass": "action",
                            "triggerOnApply": true,
                            "tooltipText": "This character takes 10 damage from High Speed Taijutsu."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "rock_lee_high_speed_taijutsu_front_lotus_mark",
                        "duration": 3,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "bonusDamageFromSourceSkillsFlat": 10,
                            "bonusDamageFromSourceCharacterId": "rock-lee",
                            "bonusDamageAppliesToSkillIds": [
                                "rock-lee-front-lotus"
                            ],
                            "mergeNumericAddKeys": [
                                "bonusDamageFromSourceSkillsFlat"
                            ],
                            "tooltipText": "This character takes additional damage from Front Lotus."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "rock_lee_high_speed_taijutsu_defense",
                        "duration": 3,
                        "scope": "self",
                        "metadata": {
                            "damageReductionFlat": 10,
                            "mergeNumericAddKeys": [
                                "damageReductionFlat"
                            ],
                            "tooltipText": "Rock Lee has damage reduction from High Speed Taijutsu."
                        }
                    },
                    {
                        "type": "HealthLoss",
                        "amount": 10,
                        "scope": "self"
                    }
                ]
            },
            {
                "id": "rock-lee-front-lotus",
                "name": "Front Lotus",
                "skillimage": "https://i.imgur.com/4boHWJ0.png",
                "skilldescription": "Rock Lee deals 30 damage to one enemy, takes 10 affliction damage and gains 20 points of permanent destructible defense that stacks. This skill deals 30 additional damage during 'Fifth Gate Opening'.",
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
                        "type": "HealthLoss",
                        "amount": 10,
                        "scope": "self"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "rock_lee_front_lotus_defense",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "destructibleDefensePoints": 20,
                            "mergeNumericAddKeys": [
                                "destructibleDefensePoints"
                            ],
                            "tooltipText": "Rock Lee has permanent destructible defense from Front Lotus."
                        }
                    }
                ]
            },
            {
                "id": "rock-lee-fifth-gate-opening",
                "name": "Fifth Gate Opening",
                "skillimage": "https://i.imgur.com/OvlloQo.png",
                "skilldescription": "Rock Lee removes all harmful effects on him, losing 30 health, and then becoming invulnerable to all harmful skills for 2 turns. The following 2 turns, this skill will be replaced by 'Final Lotus'. The affliction damage dealt by this skill cannot be ignored and cannot kill Rock Lee. This skill can only be used if Rock Lee has 80 or less health.",
                "energy": [
                    "Taijutsu"
                ],
                "target": "self",
                "actorCondition": {
                    "sourceCurrentHpAtMost": 80
                },
                "damage": 0,
                "cooldown": 4,
                "classes": [
                    "Strategic",
                    "Instant",
                    "Affliction"
                ],
                "effects": [
                    {
                        "type": "cleanse_harmful",
                        "scope": "self"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "rock_lee_fifth_gate_minimum_hp",
                        "duration": 2,
                        "scope": "self",
                        "metadata": {
                            "minimumHp": 1,
                            "tooltipText": "Fifth Gate Opening cannot kill Rock Lee."
                        }
                    },
                    {
                        "type": "HealthLoss",
                        "amount": 30,
                        "scope": "self"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "rock_lee_fifth_gate_opening",
                        "duration": 2,
                        "scope": "self",
                        "metadata": {
                            "invulnerable": true,
                            "skillDamageBonuses": {
                                "rock-lee-high-speed-taijutsu": 15,
                                "rock-lee-front-lotus": 30
                            },
                            "skillReplacements": {
                                "rock-lee-fifth-gate-opening": "rock-lee-final-lotus"
                            },
                            "tooltipText": "Rock Lee is invulnerable, High Speed Taijutsu and Front Lotus are improved, and Fifth Gate Opening is replaced by Final Lotus."
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
                "skilldescription": "Rock Lee deals 100 damage to one enemy.",
                "energy": [
                    "Taijutsu",
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
                        "amount": 100,
                        "scope": "target"
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
                "skilldescription": "Hyuuga Neji deals 25 damage to one enemy for 2 turns. During this time, this enemy's non-affliction damage will be lowered by 5.",
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
                            "turnEndDamage": 25,
                            "turnEndTrigger": "source_turn",
                            "turnDurationAnchor": "source_turn",
                            "ongoingClass": "action",
                            "triggerOnApply": true,
                            "NonAfflictionDamageDebuff": 5,
                            "tooltipText": "This character takes 25 damage and deals 5 less non-affliction damage."
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
                    "Energy",
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
                "skilldescription": "Hyuuga Neji deals 40 damage to one enemy and removes 1 random chakra from them.",
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
                        "amount": 40,
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
                "skilldescription": "Tenten deals 20 damage to one enemy and 10 damage to all others. All enemies will take 10 additional damage from 'Twin Rising Dragons Trap' and will have their physical and chakra damage lowered by 10 additional points from it.",
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
                        "duration": 1,
                        "scope": "all-enemy",
                        "condition": {
                            "scope": "self",
                            "missingStatusId": "tenten_full_release_active"
                        },
                        "metadata": {
                            "harmful": true,
                            "bonusDamageFromSourceSkillsFlat": 10,
                            "bonusDamageFromSourceCharacterId": "tenten",
                            "bonusDamageAppliesToSkillIds": [
                                "tenten-twin-rising-dragons-trap"
                            ],
                            "tooltipText": "This character takes additional damage from Twin Rising Dragons Trap."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "tenten_twin_rising_dragons_mark",
                        "duration": 1,
                        "scope": "all-enemy",
                        "condition": {
                            "scope": "self",
                            "statusId": "tenten_full_release_active"
                        },
                        "metadata": {
                            "harmful": true,
                            "bonusDamageFromSourceSkillsFlat": 20,
                            "bonusDamageFromSourceCharacterId": "tenten",
                            "bonusDamageAppliesToSkillIds": [
                                "tenten-twin-rising-dragons-trap"
                            ],
                            "tooltipText": "This character takes additional damage from Twin Rising Dragons Trap."
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
                "skilldescription": "Tenten deals 5 damage to all enemies. For 1 turn, their physical and chakra damage will be lowered by 5. All stacks of 'Twin Rising Dragons' will be removed from all targets afterwards.",
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
                        "condition": {
                            "scope": "self",
                            "missingStatusId": "tenten_full_release_active"
                        },
                        "metadata": {
                            "harmful": true,
                            "damageDebuffBySkillClass": {
                                "physical": 5,
                                "energy": 5
                            },
                            "tooltipText": "This character deals 5 less physical and chakra damage."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "tenten_twin_rising_dragons_trap_debuff",
                        "duration": 2,
                        "scope": "all-enemy",
                        "condition": {
                            "scope": "self",
                            "statusId": "tenten_full_release_active"
                        },
                        "metadata": {
                            "harmful": true,
                            "damageDebuffBySkillClass": {
                                "physical": 5,
                                "energy": 5
                            },
                            "tooltipText": "This character deals 5 less physical and chakra damage."
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
                "skilldescription": "Tenten becomes invulnerable for 1 turn and improves her harmful skills until the next time she uses one; this does not stack. Twin Rising Dragons will apply its non-damage effect twice and the damage reduction effect of Twin Rising Dragons Trap will last 1 additional turn.",
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
                            "tooltipText": "Tenten's next harmful skill is improved."
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
            },
            {
                "id": "tenten-twin-rising-dragons-full-release-version",
                "name": "Twin Rising Dragons",
                "hiddenFromSelectionViewer": true,
                "omitFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/735M5GV.png",
                "skilldescription": "Tenten deals 20 damage to one enemy and 10 damage to all others. All enemies will take 10 additional damage from Twin Rising Dragons Trap and will have their physical and chakra damage lowered by 10 additional points from it.",
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
                        "duration": 1,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "bonusDamageFromSourceSkillsFlat": 20,
                            "bonusDamageFromSourceCharacterId": "tenten",
                            "bonusDamageAppliesToSkillIds": [
                                "tenten-twin-rising-dragons-trap",
                                "tenten-twin-rising-dragons-trap-full-release-version"
                            ],
                            "tooltipText": "This character takes additional damage from Twin Rising Dragons Trap."
                        }
                    }
                ]
            },
            {
                "id": "tenten-twin-rising-dragons-trap-full-release-version",
                "name": "Twin Rising Dragons Trap",
                "hiddenFromSelectionViewer": true,
                "omitFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/pOsj115.png",
                "skilldescription": "Tenten deals 5 damage to all enemies. For 2 turns, their physical and chakra damage will be lowered by 5.",
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
                        "duration": 2,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "damageDebuffBySkillClass": {
                                "physical": 5,
                                "energy": 5
                            },
                            "tooltipText": "This character deals 5 less physical and chakra damage."
                        }
                    },
                    {
                        "type": "cleanse_statuses",
                        "scope": "all-enemy",
                        "statusId": "tenten_twin_rising_dragons_mark"
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
                "skilldescription": "Gaara stuns one enemy's physical, chakra and strategic skills for 2 turns. For 1 turn, this enemy will be unable to reduce damage or become invulnerable. During this time, this skill will be replaced by 'Sand Burial'.",
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
                                "strategic"
                            ],
                            "tooltipText": "This character's physical, chakra and strategic skills are stunned."
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
                            "tooltipText": "This character cannot reduce damage or become invulnerable."
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
                            "tooltipText": "Sand Coffin is replaced by Sand Burial."
                        }
                    }
                ]
            },
            {
                "id": "gaara-of-the-desert-sand-clone",
                "name": "Sand Clone",
                "skillimage": "https://i.imgur.com/SCRKMIU.png",
                "skilldescription": "Until the next time Gaara receives new non-affliction damage, he will ignore all enemy stun effects. This skill cannot be used while active.",
                "energy": [
                    "none"
                ],
                "target": "self",
                "targetCondition": {
                    "missingStatusId": "gaara_sand_clone"
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
                        "statusId": "gaara_sand_clone",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "cannotBeStunned": true,
                            "invulnerableToNonAffliction": true,
                            "triggerOnEnemyHarmfulNonMental": true,
                            "removeStatusIdsOnOwnerUseSkill": [],
                            "tooltipText": "Gaara ignores stuns and non-affliction damage until triggered."
                        }
                    }
                ]
            },
            {
                "id": "gaara-of-the-desert-armor-of-sand",
                "name": "Armor of Sand",
                "skillimage": "https://i.imgur.com/qfrA8gB.png",
                "skilldescription": "Gaara gains 40 points of permanent destructible defense. This skill cannot stack and will re-apply itself.",
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
                            "destructibleDefensePoints": 40,
                            "tooltipText": "Gaara has permanent destructible defense from Armor of Sand."
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
            },
            {
                "id": "gaara-of-the-desert-sand-burial",
                "name": "Sand Burial",
                "hiddenFromSelectionViewer": true,
                "cannotBeCountered": true,
                "cannotBeReflected": true,
                "skillimage": "https://i.imgur.com/ljX9izT.png",
                "skilldescription": "Gaara kills one enemy. This skill requires 'Sand Coffin' to be active on this enemy. This skill cannot be countered or reflected.",
                "energy": [
                    "Ninjutsu",
                    "Ninjutsu"
                ],
                "target": "single-enemy",
                "targetCondition": {
                    "statusId": "gaara_sand_coffin_crush"
                },
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Physical",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "execute_below_hp",
                        "threshold": 999,
                        "scope": "target"
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
                            "skillReplacements": {
                                "temari-summoning-quick-beheading-dance": "temari-summoning-quick-beheading-dance-reduced"
                            },
                            "tooltipText": "Temari is invulnerable to non-mental skills and Summoning Quick Beheading Dance costs 1 less random chakra."
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
                "skilldescription": "Temari kicks up dust, making her team invulnerable for 1 turn. If targetable, all enemies will deal 20 less non-affliction damage for 1 turn. If used one turn after 'Cutting Whirlwind', this skill will decrease damage for 2 turns instead.",
                "energy": [
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
                        "type": "apply_status",
                        "statusId": "temari_dust_wind_invulnerable",
                        "duration": 1,
                        "scope": "all-allies",
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
                        "metadata": {
                            "harmful": true,
                            "NonAfflictionDamageDebuff": 20,
                            "tooltipText": "This character deals 20 less non-affliction damage."
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
            },
            {
                "id": "temari-summoning-quick-beheading-dance-reduced",
                "name": "Summoning Quick Beheading Dance",
                "hiddenFromSelectionViewer": true,
                "useBaseSkillCooldown": true,
                "skillimage": "https://i.imgur.com/AsbfOOH.png",
                "skilldescription": "Temari summons the wind weasel Kamatari in the battlefield, dealing 35 damage to all enemies.",
                "energy": [
                    "Ninjutsu",
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
                        "statusId": "kankuro_black_secret_machine_one_shot_mark",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "bonusDamageFromSourceSkillsFlat": 5,
                            "bonusDamageFromSourceCharacterId": "kankuro",
                            "bonusDamageAppliesToSkillIds": [
                                "kankuro-poison-bomb"
                            ],
                            "tooltipText": "This character takes additional damage from Poison Bomb."
                        }
                    }
                ]
            },
            {
                "id": "kankuro-poison-bomb",
                "name": "Poison Bomb",
                "skillimage": "https://i.imgur.com/3MFMSHu.png",
                "skilldescription": "Kankuro deals 10 affliction damage to all enemies. For 1 turn, these enemies will take 5 additional damage from 'Black Secret Machine One Shot'.",
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
                        "metadata": {
                            "harmful": true,
                            "bonusDamageFromSourceSkillsFlat": 5,
                            "bonusDamageFromSourceCharacterId": "kankuro",
                            "bonusDamageAppliesToSkillIds": [
                                "kankuro-black-secret-machine-one-shot"
                            ],
                            "tooltipText": "This character takes additional damage from Black Secret Machine One Shot."
                        }
                    }
                ]
            },
            {
                "id": "kankuro-puppet-preparation",
                "name": "Puppet Preparation",
                "skillimage": "https://i.imgur.com/ghx3V0n.png",
                "skilldescription": "Kankuro gains 15 points of permanent destructible defense. For 4 turns, 'Black Secret Machine One Shot' and 'Poison Bomb' will deal 5 additional damage. This skill stacks.",
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
                        "statusId": "kankuro_puppet_preparation_defense",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "destructibleDefensePoints": 15,
                            "mergeNumericAddKeys": [
                                "destructibleDefensePoints"
                            ],
                            "tooltipText": "Kankuro has permanent destructible defense from Puppet Preparation."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kankuro_puppet_preparation_bonus",
                        "duration": 4,
                        "scope": "self",
                        "metadata": {
                            "skillDamageBonuses": {
                                "kankuro-black-secret-machine-one-shot": 5,
                                "kankuro-poison-bomb": 5
                            },
                            "tooltipText": "Black Secret Machine One Shot and Poison Bomb deal additional damage."
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
        "id": "tsuchi-kin",
        "characterId": "tsuchi-kin",
        "name": "Tsuchi Kin",
        "facePicture": "https://i.imgur.com/hOoNOfj.png",
        "characterdeescription": "Tsuchi Kin is a kunoichi of the Hidden Sound who weaponizes resonance and deception through the ringing of her bells. She excels at destabilizing opponents, unraveling their rhythm before striking with precision. Every bell she casts is a trap layered within another, turning confidence into hesitation and timing into ruin.",
        "skills": [
            {
                "id": "tsuchi-kin-illusion-bell-needles",
                "name": "Illusion Bell Needles",
                "skillimage": "https://i.imgur.com/wFHxiW6.png",
                "skilldescription": "One enemy takes 25 damage. If used after 'Needle and Bell Trap', the target has all their skills silenced for 1 turn. If used after 'Unnerving Bells', the target has all their skills delayed for 1 turn.",
                "energy": [
                    "Genjutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Mental",
                    "Ranged",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 25
                    },
                    {
                        "type": "apply_status",
                        "statusId": "tsuchi_kin_illusion_bell_silence",
                        "duration": 1,
                        "scope": "target",
                        "condition": {
                            "scope": "self",
                            "statusId": "tsuchi_kin_illusion_bell_trigger_needle_and_bell_trap"
                        },
                        "metadata": {
                            "harmful": true,
                            "silenceNonDamageEffects": true,
                            "tooltipText": "Silenced: only damage from this character's skills will work."
                        }
                    },
                    {
                        "type": "modify_cooldowns",
                        "amount": 1,
                        "includeAllCharacterSkills": true,
                        "scope": "target",
                        "condition": {
                            "scope": "self",
                            "statusId": "tsuchi_kin_illusion_bell_trigger_unnerving_bells"
                        },
                        "metadata": {
                            "harmful": true,
                            "tooltipText": "This character's skill cooldowns were delayed by 1 turn."
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 5,
                        "condition": {
                            "scope": "self",
                            "statusId": "tsuchi_kin_illusion_bell_trigger_needle_and_bell_trap",
                            "consumeOnMatch": true
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 5,
                        "condition": {
                            "scope": "self",
                            "statusId": "tsuchi_kin_illusion_bell_trigger_unnerving_bells",
                            "consumeOnMatch": true
                        }
                    },
                ]
            },
            {
                "id": "tsuchi-kin-needle-and-bell-trap",
                "name": "Needle and Bell Trap",
                "skillimage": "https://i.imgur.com/spMHiJJ.png",
                "skilldescription": "One enemy cannot reduce damage or become invulnerable for 2 turns and has their skills stunned for 1 turn. 'Illusion Bell Needles' deals 5 damage next turn.",
                "energy": [
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Physical",
                    "Ranged",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "tsuchi_kin_needle_and_bell_trap_debuff",
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
                        "statusId": "tsuchi_kin_needle_and_bell_trap_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkills": true,
                            "tooltipText": "This character is stunned and cannot use skills."
                        }
                    },
                    {
                        "type": "cleanse_statuses",
                        "scope": "self",
                        "metadataAny": [
                            "tsuchiKinIllusionBellPrep"
                        ]
                    },
                    {
                        "type": "apply_status",
                        "statusId": "tsuchi_kin_illusion_bell_trigger_needle_and_bell_trap",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "tsuchiKinIllusionBellPrep": true,
                            "tooltipText": "Illusion Bell Needles is empowered by Needle and Bell Trap."
                        }
                    }
                ]
            },
            {
                "id": "tsuchi-kin-unnerving-bells",
                "name": "Unnerving Bells",
                "skillimage": "https://i.imgur.com/BU6EHyR.png",
                "skilldescription": "One enemy loses 1 random chakra. 'Illusion Bell Needles' deals 5 additional damage next turn.",
                "energy": [
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Mental",
                    "Ranged",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "remove_random_chakra",
                        "amount": 1,
                        "scope": "target"
                    },
                    {
                        "type": "cleanse_statuses",
                        "scope": "self",
                        "metadataAny": [
                            "tsuchiKinIllusionBellPrep"
                        ]
                    },
                    {
                        "type": "apply_status",
                        "statusId": "tsuchi_kin_illusion_bell_trigger_unnerving_bells",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "tsuchiKinIllusionBellPrep": true,
                            "tooltipText": "Illusion Bell Needles is empowered by Unnerving Bells."
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
                "skilldescription": "Abumi Zaku deals 25 damage to one enemy. The following turn, 'Extreme Decapitating Airwaves' may be used.",
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
                "skilldescription": "Abumi Zaku targets one ally. The following turn, the first non-strategic skill used on this ally will be countered. This skill is invisible.",
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
                "skilldescription": "Abumi Zaku deals 45 damage to all enemies. This skill requires 'Decapitating Airwaves' to be used in the previous turn.",
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
                    "Physical",
                    "Instant"
                ],
                "effects": []
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
                "skilldescription": "Kinuta Dosu deals 20 damage to one enemy. This enemy will be unable to reduce damage or become invulnerable for 2 turns. The following turn, 'Sound Manipulation' will deal 10 additional damage to them.",
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
                            "tooltipText": "This character takes 5 additional damage from non-affliction skills and deals 5 less damage with non-affliction skills."
                        }
                    }
                ]
            },
            {
                "id": "dosu-kinuta-melody-arm-tuning",
                "name": "Melody Arm Tuning",
                "skillimage": "https://i.imgur.com/Irubt1X.png",
                "skilldescription": "For the following 4 turns, 'Resonating Echo Drill' will deal 20 additional damage and 'Sound Manipulation' will deal 10 additional damage.",
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
                        "duration": 4,
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
            },
            {
                "id": "dosu-kinuta-agile-leap",
                "name": "Agile Leap",
                "skillimage": "https://i.imgur.com/yqkQKWQ.png",
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
            }
        ]
    },
    {
        "id": "haku",
        "characterId": "haku",
        "name": "Haku",
        "facePicture": "https://i.imgur.com/1iuyTS5.png",
        "requiredMissionId": "adored-elder-sister",
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
                            "tooltipText": "This character is stunned and cannot reduce damage or become invulnerable."
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
                            "tooltipText": "Haku is invulnerable.\n'Flying Water Needles of Death' will target all enemies, and 'Acupuncture' will cost 1 additional random chakra."
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
                "skilldescription": "Haku deals 30 damage to one enemy. During 'Demonic Mirroring Ice Crystals', this skill targets all enemies.",
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
                "skilldescription": "Haku targets one enemy, stunning them and making them unable to reduce damage or become invulnerable for 1 turn. During 'Demonic Mirroring Ice Crystals', this skill targets all enemies and costs 1 additional random chakra. This skill ignores invulnerability.",
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
                            "tooltipText": "This character is stunned and cannot reduce damage or become invulnerable."
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
                "skilldescription": "The following turn, if one enemy uses a new harmful skill, they will take 40 damage that ignores invulnerability, and for 1 turn they will take 25 additional damage from physical and chakra skills. This skill is invisible.",
                "energy": [
                    "Ninjutsu"
                ],
                "target": "self",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Energy",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "iruka_sealed_bomb_trap",
                        "duration": 1,
                        "scope": "all-allies",
                        "metadata": {
                            "helpful": true,
                            "hideTooltipFromEnemy": true,
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
                            "tooltipText": "An enemy that uses a new harmful skill will take 40 damage from Sealed Bomb Square Release."
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
                            "ignoreTargetDestructibleDefense": true,
                            "triggerOnApply": true,
                            "mergeNumericAddKeys": [
                                "turnEndDamage"
                            ],
                            "tooltipText": "This character takes piercing damage from Kunai Assault."
                        }
                    }
                ]
            },
            {
                "id": "mizuki-execution-shuriken",
                "name": "Execution Shuriken",
                "skillimage": "https://i.imgur.com/sqwpwQd.png",
                "skilldescription": "Mizuki deals 20 damage to one enemy and 10 additional damage for each 20 health they have lost. This skill can only be used twice. This skill cannot be removed.",
                "energy": [
                    "Taijutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "maxUses": 2,
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
                "skilldescription": "After 1 turn, Mizuki will become invulnerable, 'Kunai Assault' will deal 30 damage instantly and 'Execution Shuriken' will deal 30 additional damage for 1 turn. This skill is invisible the first turn and will end if Mizuki receives new non-affliction damage.",
                "energy": [
                    "Genjutsu"
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
                                    "tooltipText": "Mizuki is invulnerable. 'Kunai Assault' deals instant damage and 'Execution Shuriken' deals additional damage."
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
                "skillimage": "deadcharacter.png",
                "skilldescription": "Mizuki deals 30 damage to one enemy instantly.",
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
                    }
                ]
            },
            {
                "id": "mizuki-execution-shuriken-empowered",
                "name": "Execution Shuriken",
                "hiddenFromSelectionViewer": true,
                "skillimage": "deadcharacter.png",
                "skilldescription": "Mizuki deals 50 damage to one enemy and 10 additional damage for each 20 health they have lost.",
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
                "skilldescription": "Demon Brothers stun one enemy's physical, mental and strategic skills for 1 turn. The following turn, this skill will be replaced by 'Chain Shred'.",
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
                            "cannotUseSkillClasses": [
                                "physical",
                                "mental",
                                "strategic"
                            ],
                            "tooltipText": "This character's physical, mental and strategic skills are stunned."
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
                "skilldescription": "Demon Brothers deal 30 damage to one enemy. If this skill is used on an enemy affected by 'Chain Wrap', it will deal 10 additional damage.",
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
                        "scope": "target",
                        "condition": {
                            "statusId": "demon_brothers_chain_wrap_stun",
                            "scope": "target",
                            "conditionalAmount": 40
                        }
                    }
                ]
            },
            {
                "id": "demon-brothers-water-melding",
                "name": "Water Melding",
                "skillimage": "https://i.imgur.com/ogryqGA.png",
                "skilldescription": "Demon Brothers gain 20 points of permanent destructible defense and 1 green chakra.",
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
                            "destructibleDefensePoints": 20,
                            "mergeNumericAddKeys": [
                                "destructibleDefensePoints"
                            ],
                            "tooltipText": "Demon Brothers have permanent destructible defense from Water Melding."
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
                "skilldescription": "Demon Brothers target one enemy affected by 'Chain Wrap', dealing 45 piercing damage to them and re-applying 'Chain Wrap' on them.",
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
                        "amount": 45,
                        "scope": "target",
                        "metadata": {
                            "ignoreDestructibleDefense": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "demon_brothers_chain_wrap_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkillClasses": [
                                "physical",
                                "mental",
                                "strategic"
                            ],
                            "tooltipText": "This character's physical, mental and strategic skills are stunned."
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
                    "Energy",
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
                            "tooltipText": "This character's physical and strategic skills are stunned."
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
                                "energy": 1
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
                            "tooltipText": "Momochi Zabuza has damage reduction from Hidden Mist."
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
                "skilldescription": "Oboro deals 15 damage to all enemies and reduces their damage by 5 for 1 turn. During 'Haze Clone', this skill will cost 1 less random chakra and will deal 5 additional damage.",
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
                                "affliction"
                            ],
                            "tooltipText": "This character's physical, chakra and affliction skills are stunned."
                        }
                    }
                ]
            },
            {
                "id": "oboro-haze-clone",
                "name": "Haze Clone",
                "skillimage": "https://i.imgur.com/6zjMsdw.png",
                "skilldescription": "For 2 turns, 'Exploding Kunai' will cost 1 less random chakra and will deal 5 additional damage and 'Earth Swim' will target all enemies and will cost 1 less random chakra. During this time, Oboro will become invulnerable to non-strategic skills.",
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
                        "statusId": "oboro_haze_clone",
                        "duration": 2,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "invulnerableToSkillClasses": [
                                "physical",
                                "energy",
                                "affliction",
                                "mental"
                            ],
                            "skillReplacements": {
                                "oboro-exploding-kunai": "oboro-exploding-kunai-empowered",
                                "oboro-earth-swim": "oboro-earth-swim-empowered"
                            },
                            "tooltipText": "Oboro is invulnerable to non-strategic skills. 'Exploding Kunai' and 'Earth Swim' are improved."
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
                "skilldescription": "Oboro deals 20 damage to all enemies and reduces their damage by 5 for 1 turn.",
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
                        "amount": 20,
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
                            "tooltipText": "This character deals 5 less damage from Exploding Kunai."
                        }
                    }
                ]
            },
            {
                "id": "oboro-earth-swim-empowered",
                "name": "Earth Swim",
                "hiddenFromSelectionViewer": true,
                "skillimage": "deadcharacter.png",
                "skilldescription": "Oboro deals 20 damage to all enemies and stuns their physical, chakra and affliction skills for 1 turn.",
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
                                "affliction"
                            ],
                            "tooltipText": "This character's physical, chakra and affliction skills are stunned."
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
                "skilldescription": "For 4 turns, 'Needle Barrage' and 'Sprinkling Needles' will deal 5 additional damage. During this time Shigure will have 5 points of damage reduction. This skill stacks.",
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
                        "statusId": "shigure_umbrella_toss",
                        "duration": 4,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "damageReductionFlat": 5,
                            "skillDamageBonuses": {
                                "shigure-needle-barrage": 5,
                                "shigure-sprinkling-needles": 5
                            },
                            "mergeNumericAddKeys": [
                                "damageReductionFlat"
                            ],
                            "mergeObjectNumericAddKeys": [
                                "skillDamageBonuses"
                            ],
                            "tooltipText": "Needle Barrage and Sprinkling Needles deal 5 additional damage. Shigure has 5 points of damage reduction. This effect stacks."
                        }
                    }
                ]
            },
            {
                "id": "shigure-needle-barrage",
                "name": "Needle Barrage",
                "skillimage": "https://i.imgur.com/IonrXRg.png",
                "skilldescription": "Shigure deals 30 damage to one enemy affected by 'Sprinkling Needles'.",
                "energy": [
                    "Random"
                ],
                "target": "single-enemy",
                "targetCondition": {
                    "statusId": "shigure_sprinkling_needles_mark"
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
                        "condition": {
                            "scope": "target",
                            "statusId": "shigure_sprinkling_needles_mark"
                        }
                    }
                ]
            },
            {
                "id": "shigure-sprinkling-needles",
                "name": "Sprinkling Needles",
                "skillimage": "https://i.imgur.com/LOYbNWz.png",
                "skilldescription": "Shigure deals 10 piercing damage to all enemies for 3 turns. During this time, 'Needle Barrage' can be used on them. This skill cannot be countered.",
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
                            "tooltipText": "This character takes 10 piercing damage each turn from Sprinkling Needles and can be targeted by Needle Barrage."
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
                "cooldown": 1,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "remove_random_chakra",
                        "amount": 1,
                        "scope": "target"
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
                            "tooltipText": "This character's skills cost 1 additional random chakra."
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
                "skilldescription": "Shiore Orochimaru deals 20 affliction damage to one enemy for 2 turns. This skill cannot be used on an enemy already affected by it and cannot be ignored or removed.",
                "energy": [
                    "Ninjutsu",
                    "Random"
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
                            "turnEndDamage": 20,
                            "turnEndTrigger": "source_turn",
                            "tooltipText": "This character takes 20 affliction damage each turn from Fire Release: Fire Ball."
                        }
                    }
                ]
            },
            {
                "id": "shiore-orochimaru-giant-snake-bind",
                "name": "Giant Snake Bind",
                "skillimage": "https://i.imgur.com/8NjKcaE.png",
                "skilldescription": "Shiore Orochimaru stuns one enemy for 2 turns. For 1 turn, this skill can be used for no cost to deal 20 damage to the enemy affected by it.",
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
                        "duration": 2,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkills": true,
                            "tooltipText": "This character is stunned by Giant Snake Bind."
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 20,
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
                        "metadata": {
                            "helpful": true,
                            "skillCostOverridesBySkillId": {
                                "shiore-orochimaru-giant-snake-bind": {
                                    "energy": []
                                }
                            },
                            "tooltipText": "Giant Snake Bind can be used for no cost and deals 20 damage."
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
                    "Energy",
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
                        "type": "remove_random_chakra",
                        "amount": 1,
                        "scope": "target",
                        "condition": {
                            "scope": "self",
                            "statusId": "akadou_yoroi_chakra_focus"
                        }
                    }
                ]
            },
            {
                "id": "akadou-yoroi-draining-assault",
                "name": "Draining Assault",
                "skillimage": "https://i.imgur.com/zBoZAxl.png",
                "skilldescription": "For 3 turns, Akadou Yoroi steals 15 health from one enemy each turn. Their non-affliction damage will be lowered by 5 for 2 turns. The following 2 turns, Akadou Yoroi will deal 5 additional damage with his skills.",
                "energy": [
                    "Taijutsu",
                    "Random",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 3,
                "classes": [
                    "Energy",
                    "Action",
                    "Instant"
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
                            "tooltipText": "This character loses 15 health each turn to Draining Assault."
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
                            "tooltipText": "Akadou Yoroi heals 15 health each turn from Draining Assault."
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
                        "type": "remove_random_chakra",
                        "amount": 1,
                        "scope": "target",
                        "condition": {
                            "scope": "self",
                            "statusId": "akadou_yoroi_chakra_focus"
                        }
                    }
                ]
            },
            {
                "id": "akadou-yoroi-chakra-focus",
                "name": "Chakra Focus",
                "skillimage": "https://i.imgur.com/8oUT5Mk.png",
                "skilldescription": "For 2 turns, if 'Energy Drain' or 'Draining Assault' are used, they will also steal 1 random chakra for their duration.",
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
                        "statusId": "akadou_yoroi_chakra_focus",
                        "duration": 2,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "tooltipText": "Energy Drain and Draining Assault will also steal 1 random chakra."
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
                "skilldescription": "Tsurugi Misumi gains 15 points of damage reduction for 1 turn and targets one enemy or one member of his team. If used on an enemy, they will take 15 damage that ignores invulnerability. If used on a member of his team, they will gain 15 points of damage reduction for 1 turn.",
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
                            "damageReductionFlat": 15,
                            "tooltipText": "This character has 15 points of damage reduction."
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 15,
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
                            "damageReductionFlat": 15,
                            "tooltipText": "This character has 15 points of damage reduction."
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
                "cooldown": 5,
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
                            "copyTargetUsernameToKeys": [
                                "reflectTargetUsername"
                            ],
                            "copyTargetSlotToKeys": [
                                "reflectTargetSlot"
                            ],
                            "tooltipText": "New harmful skills used on this character will be reflected onto the enemy affected by Soft Physique Modification."
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
                            "tooltipText": "This character is unable to reduce damage or become invulnerable."
                        }
                    }
                ]
            },
            {
                "id": "tsurugi-misumi-tighten-joints",
                "name": "Tighten Joints",
                "skillimage": "https://i.imgur.com/GasBrwW.png",
                "skilldescription": "Tsurugi Misumi gains 20 points of permanent destructible defense. If 'Soft Physique Modification' is active, the enemy targeted by it will also take 20 damage and be stunned for 1 turn.",
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
                            "destructibleDefensePoints": 20,
                            "mergeNumericAddKeys": [
                                "destructibleDefensePoints"
                            ],
                            "tooltipText": "This character has permanent destructible defense from Tighten Joints."
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
                            "tooltipText": "This character is stunned by Tighten Joints."
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
                "skilldescription": "Mitarashi Anko deals 5 damage to one enemy and makes them unable to reduce damage or become invulnerable for 1 turn. The following turn, this skill will be replaced by 'Twin Snakes Mutual Death'.",
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
                        "amount": 5,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "mitarashi_anko_dual_pin_debuff",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotReduceDamage": true,
                            "cannotBecomeInvulnerable": true,
                            "tooltipText": "This character is unable to reduce damage or become invulnerable."
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
                "skillimage": "deadcharacter.png",
                "skilldescription": "Mitarashi Anko targets the enemy affected by 'Dual Pin' and herself, killing both targets. This skill cannot be ignored.",
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
                        "type": "execute_below_hp",
                        "threshold": 999,
                        "scope": "target",
                        "metadata": {
                            "cannotBeEvaded": true
                        }
                    },
                    {
                        "type": "execute_below_hp",
                        "threshold": 999,
                        "scope": "self",
                        "metadata": {
                            "cannotBeEvaded": true
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
                "skilldescription": "Jiroubou deals 30 damage to one enemy. The following turn, 'Earth Mausoleum Dumpling' will deal 5 additional damage.",
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
                                "jiroubou-earth-mausoleum-dumpling": 5
                            },
                            "tooltipText": "Earth Mausoleum Dumpling deals 5 additional damage."
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
                            "tooltipText": "Arhat Fist deals 10 additional damage."
                        }
                    }
                ]
            },
            {
                "id": "jiroubou-earth-prison-of-magnificent-nothingness",
                "name": "Earth Prison of Magnificent Nothingness",
                "skillimage": "https://i.imgur.com/plmoESM.png",
                "skilldescription": "For 3 turns, Jiroubou and all allies will gain 45 points of destructible defense. During this time, one target enemy will have 1 random chakra stolen each turn. This skill's chakra drain effect will end if Jiroubou's destructible defense is destroyed.",
                "energy": [
                    "Ninjutsu",
                    "Ninjutsu",
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
                            "destructibleDefensePoints": 45,
                            "removeStatusIdsFromEnemyOnBreak": [
                                "jiroubou_earth_prison_drain"
                            ],
                            "tooltipText": "This character has 45 points of destructible defense from Earth Prison of Magnificent Nothingness. If it is destroyed, this skill's chakra drain effect will end."
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
                            "destructibleDefensePoints": 45,
                            "tooltipText": "This character has 45 points of destructible defense from Earth Prison of Magnificent Nothingness."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "jiroubou_earth_prison_drain",
                        "duration": 3,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnEndRemoveRandomChakra": 1,
                            "turnEndTrigger": "source_turn",
                            "tooltipText": "This character loses 1 random chakra each turn from Earth Prison of Magnificent Nothingness."
                        }
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
                    "Action",
                    "Instant"
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
                            "tooltipText": "This character has 10 points of damage reduction. All enemies who use a new skill will have the cooldown of that skill increased by 1."
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
                "cooldown": 2,
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
                "skilldescription": "Tayuya deals 15 damage to all enemies for 2 turns. During this time, Tayuya will gain 10 points of damage reduction and 'Demonic Flute: Phantom Wave' will also remove 1 random chakra from its target if used.",
                "energy": [
                    "Genjutsu",
                    "Random"
                ],
                "target": "all-enemy",
                "damage": 0,
                "cooldown": 2,
                "classes": [
                    "Physical",
                    "Action",
                    "Instant"
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
                            "tooltipText": "This character takes 15 damage each turn from Summoning: Doki."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "tayuya_summoning_doki_self",
                        "duration": 2,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "damageReductionFlat": 10,
                            "tooltipText": "Tayuya has 10 points of damage reduction. Demonic Flute: Phantom Wave will also remove 1 random chakra from its target."
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
                "cooldown": 4,
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
                            "tooltipText": "This character's non-mental skills are stunned."
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
                "skilldescription": "Sakon and Ukon deal 20 affliction damage to one enemy permanently. During this time, Sakon and Ukon will gain 15 points of damage reduction and 'Gattling Punch' will deal 10 less damage while active. This skill cannot be used while active. This skill ends if 'Rest' or 'Summoning: Rashoumon' are used, or if the enemy or Sakon and Ukon die.",
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
                            "turnEndDamage": 20,
                            "turnEndTrigger": "source_turn",
                            "tooltipText": "This character takes 20 affliction damage each turn from Parasite Demon Demolition."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "sakon_and_ukon_parasite_demon_demolition_self",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "damageReductionFlat": 15,
                            "skillDamageBonuses": {
                                "sakon-and-ukon-gattling-punch": -10
                            },
                            "tooltipText": "Sakon and Ukon have 15 points of damage reduction. Gattling Punch deals 10 less damage. This effect ends if Rest or Summoning: Rashoumon are used."
                        }
                    }
                ]
            },
            {
                "id": "sakon-and-ukon-rest",
                "name": "Rest",
                "skillimage": "https://i.imgur.com/rDxLn5c.png",
                "skilldescription": "Sakon and Ukon heal themselves for 30 health. If 'Parasite Demon Demolition' is active, it will end.",
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
                        "amount": 30,
                        "scope": "self"
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
                "skilldescription": "Kimimaro deals 30 damage to one enemy. This skill cannot be countered or reflected. Kimimaro will take 10 affliction damage.",
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
                        "amount": 10,
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
                            "tooltipText": "This character is stunned by Dance of the Clematis."
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
                            "tooltipText": "This character deals 20 less physical and chakra damage."
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
                "skilldescription": "Gekko Hayate gains 25 points of damage reduction for 1 turn. The following turn, he will gain 15 points of damage reduction. The turn after, he will gain 5 points of damage reduction. The following 3 turns, Gekko Hayate's skills will deal 10 additional damage.",
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
                        "statusId": "gekko_hayate_meld_stage1",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "damageReductionFlat": 25,
                            "tooltipText": "This character has 25 points of damage reduction.",
                            "onExpireEffects": [
                                {
                                    "type": "apply_status",
                                    "statusId": "gekko_hayate_meld_stage2",
                                    "duration": 1,
                                    "metadata": {
                                        "helpful": true,
                                        "damageReductionFlat": 15,
                                        "tooltipText": "This character has 15 points of damage reduction.",
                                        "onExpireEffects": [
                                            {
                                                "type": "apply_status",
                                                "statusId": "gekko_hayate_meld_stage3",
                                                "duration": 1,
                                                "metadata": {
                                                    "helpful": true,
                                                    "damageReductionFlat": 5,
                                                    "tooltipText": "This character has 5 points of damage reduction.",
                                                    "onExpireEffects": [
                                                        {
                                                            "type": "apply_status",
                                                            "statusId": "gekko_hayate_meld_stage4",
                                                            "duration": 3,
                                                            "metadata": {
                                                                "helpful": true,
                                                                "damageBonusFlat": 10,
                                                                "tooltipText": "This character's skills deal 10 additional damage."
                                                            }
                                                        }
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
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
                "skilldescription": "Shizune deals 15 damage to one enemy.",
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
                        "scope": "target"
                    }
                ]
            },
            {
                "id": "shizune-poison-mist",
                "name": "Poison Mist",
                "skillimage": "https://i.imgur.com/B8hT2h4.png",
                "skilldescription": "Shizune deals 10 affliction damage to one enemy for 3 turns. This skill cannot be used on an enemy already being affected.",
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
                "name": "Sharingan Counter",
                "skillimage": "https://i.imgur.com/4sfYWaL.png",
                "skilldescription": "The following turn, the first physical, chakra or strategic skill used on Hatake Kakashi will be countered and will replace this skill for 1 turn. This skill is invisible.",
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
                            "counterCopySkillReplacementDuration": 1,
                            "tooltipText": "The first physical, chakra or strategic skill used on this character will be countered and copied, replacing this skill for 1 turn."
                        }
                    }
                ]
            },
            {
                "id": "hatake-kakashi-summoning-ninja-dogs",
                "name": "Summoning: Ninja Dogs",
                "skillimage": "https://i.imgur.com/1TSYjNE.png",
                "skilldescription": "Hatake Kakashi stuns one enemy's physical, chakra and strategic skills for 1 turn. During this time, 'Raikiri' will deal 50 additional damage to this enemy.",
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
                        "statusId": "kakashi_ninja_dogs_mark",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkillClasses": [
                                "physical",
                                "energy",
                                "strategic"
                            ],
                            "tooltipText": "This character's physical, chakra and strategic skills are stunned. Raikiri deals 50 additional damage to this character."
                        }
                    }
                ]
            },
            {
                "id": "hatake-kakashi-raikiri",
                "name": "Raikiri",
                "skillimage": "https://i.imgur.com/BUvxnE4.png",
                "skilldescription": "Hatake Kakashi deals 50 piercing damage to one enemy.",
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
                            "ignoreDamageReduction": true
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 50,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "statusId": "kakashi_ninja_dogs_mark"
                        },
                        "metadata": {
                            "ignoreDamageReduction": true
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
                "skilldescription": "Yuhi Kurenai targets one enemy. For 2 turns, they will take 10 damage each turn, will be unable to reduce damage or become invulnerable, their non-affliction damage will be reduced by 10, and the cost of their skills will be increased by 1 random chakra.",
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
                            "turnEndDamage": 10,
                            "turnEndTrigger": "source_turn",
                            "tooltipText": "This character takes 10 damage each turn, is unable to reduce damage or become invulnerable, deals 10 less non-affliction damage, and their skills cost 1 additional random chakra."
                        }
                    }
                ]
            },
            {
                "id": "yuhi-kurenai-illusionary-tree-meld",
                "name": "Illusionary Tree Meld",
                "skillimage": "https://i.imgur.com/eW1yYm5.png",
                "skilldescription": "Yuhi Kurenai gains 10 points of permanent destructible defense and 5 additional points for every skill Yuhi Kurenai has used. The additional destructible defense is reset when this skill is used.",
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
                            "destructibleDefensePoints": 10,
                            "tooltipText": "This character has permanent destructible defense from Illusionary Tree Meld."
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
                                        "tooltipText": "This character has permanent destructible defense from Illusionary Tree Meld."
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
                "cooldown": 4,
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
                            "tooltipText": "This character is stunned by Demonic Illusion: Tree Binding Death."
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
                            "tooltipText": "Demonic Illusion: Tree Binding Death is replaced by Tree Binding Death Attack."
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
                "id": "sarutobi-asuma-flying-swallow",
                "name": "Flying Swallow",
                "skillimage": "https://i.imgur.com/a50zdDY.png",
                "skilldescription": "Sarutobi Asuma deals 15 damage to all enemies for 2 turns. The following 2 turns, Sarutobi Asuma's team will gain 15 points of damage reduction. During this time, this skill will be replaced by 'Finishing Blow' and 'Sharpen Blades' will be replaced by 'Flying Kick'. This skill cannot be countered or reflected.",
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
                    "Action",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "asuma_flying_swallow_dot",
                        "duration": 2,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 15,
                            "turnEndTrigger": "source_turn",
                            "onExpireEffects": [
                                {
                                    "type": "apply_status",
                                    "scope": "all-allies",
                                    "statusId": "asuma_flying_swallow_dr",
                                    "duration": 2,
                                    "metadata": {
                                        "helpful": true,
                                        "damageReductionFlat": 15,
                                        "tooltipText": "This character has 15 points of damage reduction from Flying Swallow."
                                    }
                                }
                            ],
                            "tooltipText": "This character takes 15 damage each turn from Flying Swallow."
                        }
                    },
                    {
                        "type": "cleanse_statuses",
                        "scope": "self",
                        "statusId": "asuma_sharpen_blades_stack",
                        "count": 1
                    },
                    {
                        "type": "apply_status",
                        "statusId": "asuma_flying_swallow_replacement",
                        "duration": 2,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillReplacements": {
                                "sarutobi-asuma-flying-swallow": "sarutobi-asuma-finishing-blow",
                                "sarutobi-asuma-sharpen-blades": "sarutobi-asuma-flying-kick"
                            },
                            "tooltipText": "Flying Swallow is replaced by Finishing Blow and Sharpen Blades is replaced by Flying Kick."
                        }
                    }
                ]
            },
            {
                "id": "sarutobi-asuma-sharpen-blades",
                "name": "Sharpen Blades",
                "skillimage": "https://i.imgur.com/k1FF8kx.png",
                "skilldescription": "The next time 'Flying Swallow' is used, it will last 1 additional turn. This effect stacks and will end when 'Flying Swallow' is used.",
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
                        "statusId": "asuma_sharpen_blades_stack",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "skillDurationBonuses": {
                                "sarutobi-asuma-flying-swallow": 1
                            },
                            "mergeObjectNumericAddKeys": [
                                "skillDurationBonuses"
                            ],
                            "tooltipText": "The next time Flying Swallow is used, it will last 1 additional turn. This effect stacks."
                        }
                    }
                ]
            },
            {
                "id": "sarutobi-asuma-self-sacrifice",
                "name": "Self-Sacrifice",
                "skillimage": "https://i.imgur.com/i3HWtZR.png",
                "skilldescription": "Sarutobi Asuma targets one ally. Permanently, all harmful skills used on this ally will be reflected to Sarutobi Asuma. During this time, Sarutobi Asuma can use this skill again for no cost to cancel it.",
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
                        "statusId": "asuma_self_sacrifice_reflect",
                        "duration": 99,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "missingStatusId": "asuma_self_sacrifice_reflect"
                        },
                        "metadata": {
                            "helpful": true,
                            "reflectNextIncomingSkill": true,
                            "reflectToSourceCaster": true,
                            "tooltipText": "All harmful skills used on this character will be reflected to Sarutobi Asuma."
                        }
                    },
                    {
                        "type": "cleanse_statuses",
                        "scope": "target",
                        "statusId": "asuma_self_sacrifice_reflect",
                        "count": 1,
                        "condition": {
                            "scope": "target",
                            "statusId": "asuma_self_sacrifice_reflect"
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
                "id": "sarutobi-asuma-finishing-blow",
                "name": "Finishing Blow",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/SbZfAzh.png",
                "skilldescription": "Sarutobi Asuma deals 35 piercing damage to one enemy.",
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
                        "amount": 35,
                        "scope": "target",
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    }
                ]
            },
            {
                "id": "sarutobi-asuma-flying-kick",
                "name": "Flying Kick",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/skCMnBl.png",
                "skilldescription": "Sarutobi Asuma deals 35 damage to one enemy and stuns them for 1 turn.",
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
                            "cannotUseSkills": true,
                            "tooltipText": "This character is stunned by Flying Kick."
                        }
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
                                "maito-gai-leaf-whirlwind": "maito-gai-leaf-whirlwind-empowered"
                            },
                            "tooltipText": "Maito Gai is invulnerable. Leaf Whirlwind deals 60 piercing damage that ignores invulnerability."
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
                            "tooltipText": "If this character uses a new harmful skill, they will take 30 damage."
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
                "skilldescription": "Baki targets himself or an ally, granting this character 50 points of destructible defense for 4 turns. During this time, they will ignore enemy stun effects and harmful non-conditional affliction damage. This skill ends if the destructible defense is destroyed.",
                "energy": [
                    "Random",
                    "Random"
                ],
                "target": "self-or-single-ally",
                "damage": 0,
                "cooldown": 5,
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
                            "destructibleDefensePoints": 50,
                            "cannotBeStunned": true,
                            "invulnerableToSkillClasses": [
                                "affliction"
                            ],
                            "tooltipText": "This character has 50 points of destructible defense from Flak Jacket, ignores stun effects, and is immune to affliction damage."
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
                "skilldescription": "Yakushi Kabuto deals 15 piercing damage to one enemy. For 1 turn, that enemy's skills will cost 1 additional random chakra and they will take 5 additional damage from physical and chakra skills. The following turn, 'Chakra Scalpel' will deal 5 additional damage.",
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
                            "randomCostIncrease": 1,
                            "damageTakenBonusBySkillClass": {
                                "physical": 5,
                                "energy": 5
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
                            "skillDamageBonuses": {
                                "yakushi-kabuto-chakra-scalpel": 5
                            },
                            "tooltipText": "Chakra Scalpel deals 5 additional damage."
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
                "cooldown": 5,
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
                "skilldescription": "The following turn, any enemy that does not use a new skill will be stunned for 1 turn and take 5 additional damage from physical and chakra skills for 2 turns. This skill is invisible.",
                "energy": [
                    "Genjutsu"
                ],
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
                            "tooltipText": "If this character does not use a new skill, they will be stunned for 1 turn and take 5 additional damage from physical and chakra skills for 2 turns."
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
                "skilldescription": "Tsunade deals 30 damage to one enemy and stuns their physical, mental and strategic skills for 1 turn.",
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
                            "tooltipText": "This character's physical, mental and strategic skills are stunned."
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
                            "tooltipText": "This character has permanent destructible defense from Slug Division."
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
                "skilldescription": "For 2 turns, all enemies will be unable to reduce damage or become invulnerable. During this time, if Jiraiya or one of his allies receives a new harmful physical skill, they will become invulnerable for 1 turn.",
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
                            "tooltipText": "This character is unable to reduce damage or become invulnerable."
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
                            "tooltipText": "If this character receives a new harmful physical skill, they will become invulnerable for 1 turn."
                        }
                    }
                ]
            },
            {
                "id": "jiraiya-major-summoning-gamabunta",
                "name": "Major Summoning: Gamabunta",
                "skillimage": "https://i.imgur.com/Qti5Che.png",
                "skilldescription": "Jiraiya deals 25 affliction damage to all enemies. For the rest of the game, the enemy team will take 5 additional damage from affliction-only skills and this skill will be replaced by 'Toad Oil Flame Bullet'.",
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
                            "tooltipText": "This character takes 15 affliction damage each turn from Toad Oil Flame Bullet."
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
                            "tooltipText": "This character is stunned by Constrict and Bite."
                        }
                    }
                ]
            }
        ]
    }
];

if (typeof module !== 'undefined') {
    module.exports = characters;
}
