module.exports = {
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
};
