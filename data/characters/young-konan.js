module.exports = {
    "id": "young-konan",
    "characterId": "young-konan",
    "name": "Young Konan",
    "facePicture": "https://i.imgur.com/tsmObzW.png",
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
                        "tooltipTextTemplate": "This character has {destructibleDefensePoints} permanent destructible defense."
                    }
                }
            ]
        },
        {
            "id": "young-konan-in-the-shadows",
            "name": "In the Shadows",
            "skillimage": "deadcharacter-remaster.png?v=2",
            "skilldescription": "Young Konan becomes invulnerable for 1 turn.",
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
};
