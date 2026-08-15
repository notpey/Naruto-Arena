module.exports = {
    "id": "gaara-of-the-desert",
    "characterId": "gaara-of-the-desert",
    "name": "Gaara",
    "facePicture": "https://i.imgur.com/mmAjCZ7.png",
    "characterdeescription": "A Jinchuuriki from the Village of Sand, Gaara is an unstable ninja with the Shukaku, the one-tailed beast. With the Shukaku, and his own abilities, Gaara can manipulate the sand in his gourd to crush the enemy, or defend himself.",
    "skills": [
        {
            "id": "gaara-of-the-desert-sand-coffin",
            "name": "Sand Coffin",
            "skillimage": "https://i.imgur.com/cZ7Pk49.png",
            "skilldescription": "Gaara stuns one enemy's physical, chakra, and strategic skills for 2 turns. For 1 turn, this enemy cannot reduce damage or become invulnerable.",
            "energy": [
                "Ninjutsu",
                "Random"
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
                    "statusId": "gaara_sand_coffin_stun",
                    "duration": 2,
                    "scope": "target",
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
                    "type": "apply_status",
                    "statusId": "gaara_sand_coffin_crush",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotReduceDamage": true,
                        "cannotBecomeInvulnerable": true,
                        "tooltipText": "This character cannot reduce damage or become invulnerable.",
                        "ongoingClass": "control",
                        "turnDurationAnchor": "source_turn"
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "gaara_sand_coffin_ready",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "skillReplacements": {
                            "gaara-of-the-desert-sand-coffin": "gaara-of-the-desert-sand-burial"
                        },
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "Sand Coffin is replaced by Sand Burial.",
                        "ongoingClass": "control"
                    }
                }
            ]
        },
        {
            "id": "gaara-of-the-desert-sand-burial",
            "name": "Sand Burial",
            "cannotBeCountered": true,
            "cannotBeReflected": true,
            "skillimage": "https://i.imgur.com/ljX9izT.png",
            "skilldescription": "Gaara deals 30 piercing damage to one enemy and ignores helpful effects for 1 turn. If used 1 turn after 'Sand Coffin', this skill costs 1 ninjutsu and 1 bloodline chakra and deals 50 piercing damage instead.",
            "energy": [
                "Ninjutsu"
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
                    "condition": {
                        "scope": "target",
                        "missingStatusId": "gaara_sand_coffin_crush"
                    },
                    "metadata": {
                        "ignoreDamageReduction": true
                    }
                },
                {
                    "type": "damage",
                    "amount": 50,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "statusId": "gaara_sand_coffin_crush"
                    },
                    "metadata": {
                        "ignoreDamageReduction": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "gaara_sand_burial_ignore_helpful",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character ignores helpful effects for 1 turn."
                    }
                }
            ]
        },
        {
            "id": "gaara-of-the-desert-armor-of-sand",
            "name": "Armor of Sand",
            "skillimage": "https://i.imgur.com/qfrA8gB.png",
            "skilldescription": "Gaara gains 25 points of permanent destructible defense. This skill cannot be used again while it is still active.",
            "energy": [
                "Random"
            ],
            "target": "self",
            "targetCondition": {
                "missingStatusId": "gaara_armor_of_sand"
            },
            "damage": 0,
            "cooldown": 4,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "gaara_armor_of_sand",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "destructibleDefensePoints": 25,
                        "tooltipText": "Gaara has 25 points of permanent destructible defense from Armor of Sand."
                    }
                }
            ]
        },
        {
            "id": "gaara-of-the-desert-shield-of-sand",
            "name": "Shield of Sand",
            "skillimage": "https://i.imgur.com/vL03kPm.png",
            "skilldescription": "This skill makes Gaara invulnerable for 1 turn.",
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
