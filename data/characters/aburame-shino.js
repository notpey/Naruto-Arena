module.exports = {
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
                        "mergeSkillDamageBonuses": true,
                        "stackMetadataKey": "chakraLeachBonus",
                        "stackDelta": 5,
                        "stackMax": 9999,
                        "tooltipTextTemplate": "Chakra Leach deals {chakraLeachBonus} additional damage."
                    }
                }
            ]
        },
        {
            "id": "aburame-shino-female-bug",
            "name": "Female Bug",
            "skillimage": "https://i.imgur.com/QMWOMRt.png",
            "skilldescription": "Aburame Shino targets one enemy. For 3 turns, their non-affliction damage will be reduced by 5. During this time, 'Chakra Leach' will deal 5 additional damage to them. Using Female Bug on them again refreshes its duration without stacking its effects.",
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
};
