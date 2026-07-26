module.exports = {
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
            "energy": [
                "none"
            ],
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
};
