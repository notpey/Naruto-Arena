(function (root, factory) {
    const presets = factory();
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = presets;
    } else {
        root.STARTER_CHARACTER_PRESETS = Object.assign(root.STARTER_CHARACTER_PRESETS || {}, presets);
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    const invulnerableEffect = {
        "type": "apply_status",
        "statusId": "invulnerable",
        "duration": 1,
        "scope": "self",
        "metadata": {
            "invulnerable": true,
            "tooltipText": "This character is invulnerable."
        }
    };

    const clone = (value) => JSON.parse(JSON.stringify(value));

    const invulnerableSkill = ({ id, name, ownerName, image }) => ({
        "id": id,
        "name": name,
        "skillimage": image,
        "skilldescription": `This skill makes ${ownerName} invulnerable for 1 turn.`,
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
            clone(invulnerableEffect)
        ]
    });

    const kiba = {
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
            invulnerableSkill({
                id: "inuzuka-kiba-smoke-bomb",
                name: "Smoke Bomb",
                ownerName: "Inuzuka Kiba",
                image: "https://i.imgur.com/CwFqO2U.png"
            }),
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
    };

    const shino = {
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
            invulnerableSkill({
                id: "aburame-shino-shino-hide",
                name: "Shino Hide",
                ownerName: "Aburame Shino",
                image: "https://i.imgur.com/BpembYr.png"
            })
        ]
    };

    const hinata = {
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
            invulnerableSkill({
                id: "hyuuga-hinata-hinata-block",
                name: "Hinata Block",
                ownerName: "Hyuuga Hinata",
                image: "https://i.imgur.com/jRh5417.png"
            }),
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
    };

    const shikamaru = {
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
            invulnerableSkill({
                id: "nara-shikamaru-shikamaru-hide",
                name: "Shikamaru Hide",
                ownerName: "Nara Shikamaru",
                image: "https://i.imgur.com/NF4jrLc.png"
            })
        ]
    };

    const chouji = {
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
            invulnerableSkill({
                id: "akimichi-chouji-effortless-block",
                name: "Effortless Block",
                ownerName: "Akimichi Chouji",
                image: "https://i.imgur.com/9ZNpEEN.png"
            })
        ]
    };

    const ino = {
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
            invulnerableSkill({
                id: "yamanaka-ino-ino-block",
                name: "Ino Block",
                ownerName: "Yamanaka Ino",
                image: "https://i.imgur.com/ZTn3Gt4.png"
            }),
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
    };

    return {
        "inuzuka-kiba": kiba,
        "aburame-shino": shino,
        "hyuuga-hinata": hinata,
        "nara-shikamaru": shikamaru,
        "akimichi-chouji": chouji,
        "yamanaka-ino": ino
    };
});
