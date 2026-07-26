module.exports = {
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
                            "strategic"
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
};
