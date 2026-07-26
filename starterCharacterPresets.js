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
        "hyuuga-hinata": {
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
                                "skilldescription": "Hyuuga Hinata gains 15 points of damage reduction for 3 turns. During this time, 'Hinata Gentle Fist' and 'Protective Eight Trigrams Sixty-Four Palms' last 1 additional turn.",
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
                                                "statusId": "hyuuga_hinata_byakugan",
                                                "duration": 3,
                                                "scope": "self",
                                                "metadata": {
                                                        "damageReductionFlat": 15,
                                                        "tooltipText": "Hinata has 15 damage reduction. Hinata Gentle Fist lasts 1 additional turn and Protective Eight Trigrams Sixty-Four Palms refreshes destructible defense once."
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
                                        "Action"
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
                                                        "ongoingClass": "action",
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
        },
        "yamanaka-ino": {
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
        }
};
});
