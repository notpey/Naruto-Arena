module.exports = {
    "id": "baki",
    "characterId": "baki",
    "name": "Baki",
    "facePicture": "https://i.imgur.com/pjjdWz8.png",
    "characterdeescription": "A Jounin of the Sand Village, and the leader of Gaara's team; Baki is cruel and ruthless, despite his normally calm nature. Baki fights using both taijutsu and ninjutsu together with top of the line Sand Village branded Flak Jackets.",
    "requiredMissionId": "sand-siblings-at-war",
    "skills": [
        {
            "id": "baki-sudden-strike",
            "name": "Sudden Strike",
            "skillimage": "https://i.imgur.com/tCTh2Ce.png",
            "skilldescription": "Baki destroys one enemy's destructible defense and then deals 20 piercing damage to them.",
            "energy": [
                "Genjutsu"
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
                    "type": "destroy_destructible_defense",
                    "scope": "target"
                },
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
            "id": "baki-wind-blade",
            "name": "Wind Blade",
            "skillimage": "https://i.imgur.com/yw1nPc2.png",
            "skilldescription": "Baki destroys one enemy's destructible defense and then deals 40 piercing damage to them.",
            "energy": [
                "Ninjutsu",
                "Genjutsu"
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
                    "type": "destroy_destructible_defense",
                    "scope": "target"
                },
                {
                    "type": "damage",
                    "amount": 40,
                    "scope": "target",
                    "metadata": {
                        "ignoreDamageReduction": true
                    }
                }
            ]
        },
        {
            "id": "baki-flak-jacket",
            "name": "Flak Jacket",
            "skillimage": "https://i.imgur.com/4i77YrB.png",
            "skilldescription": "Baki targets himself or an ally, granting this character 45 points of destructible defense for 4 turns. During this time, they will ignore enemy stun effects and affliction damage. This skill ends if the destructible defense is destroyed.",
            "energy": [
                "Random",
                "Random"
            ],
            "target": "self-or-single-ally",
            "damage": 0,
            "cooldown": 4,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "baki_flak_jacket",
                    "duration": 4,
                    "scope": "target",
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePoints": 45,
                        "cannotBeStunned": true,
                        "stunImmune": true,
                        "invulnerableToSkillClasses": [
                            "affliction"
                        ],
                        "tooltipText": "This character has 45 points of destructible defense from Flak Jacket, ignores stun effects, and is immune to affliction damage."
                    }
                }
            ]
        },
        {
            "id": "baki-baki-teleportation",
            "name": "Baki Teleportation",
            "skillimage": "https://i.imgur.com/cMOrPng.png",
            "skilldescription": "This skill makes Baki invulnerable for 1 turn.",
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
