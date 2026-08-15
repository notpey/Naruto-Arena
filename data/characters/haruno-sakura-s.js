module.exports = {
    "id": "haruno-sakura-s",
    "characterId": "haruno-sakura-s",
    "name": "Haruno Sakura (S)",
    "facePicture": "https://i.imgur.com/dMRqjIP.png",
    "characterdeescription": "With her extensive training under Tsunade for the last two and a half years, Sakura has gained a greater understanding of healing and the human body. While Sakura's physical strength and healing prowess have both increased, her greatest ability is a powerful chakra storing seal taught to her by Tsunade.",
    "requiredMissionId": "a-girl-grown-up",
    "skills": [
        {
            "id": "haruno-sakura-s-chakra-enhanced-punch",
            "name": "Chakra Enhanced Punch",
            "skillimage": "https://i.imgur.com/R6sD2MG.png",
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
            "skillimage": "https://i.imgur.com/uJHSPqu.png",
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
            "skillimage": "https://i.imgur.com/zgbp6dp.png",
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
            "skillimage": "https://i.imgur.com/H1t6mfB.png",
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
            "skillimage": "https://i.imgur.com/zgbp6dp.png",
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
};
