module.exports = {
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
            "skilldescription": "Gekko Hayate becomes invulnerable to physical and chakra skills for 1 turn. His next 'Crescent Moon Slash' will deal 15 additional damage and ignore invulnerability.",
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
                    "statusId": "gekko_hayate_meld_into_shadows",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "invulnerableToSkillClasses": [
                            "physical",
                            "energy"
                        ],
                        "skillDamageBonuses": {
                            "gekko-hayate-crescent-moon-slash": 15
                        },
                        "removeSelfOnSkillUseSkillIds": [
                            "gekko-hayate-crescent-moon-slash"
                        ],
                        "ignoreInvulnerabilityForSkillIds": [
                            "gekko-hayate-crescent-moon-slash"
                        ],
                        "tooltipText": "Hayate is invulnerable to physical and chakra skills. Crescent Moon Slash deals 15 additional damage and ignores invulnerability."
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
};
