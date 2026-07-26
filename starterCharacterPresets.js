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
        },
        "teuchi": {
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
        "young-minato": {
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
        "young-kushina": {
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
        "young-itachi": {
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
        "young-yahiko": {
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
        "young-konan": {
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
        "young-nagato": {
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
        }
};
});
