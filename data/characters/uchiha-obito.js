module.exports = {
    "id": "uchiha-obito",
    "characterId": "uchiha-obito",
    "name": "Uchiha Obito",
    "facePicture": "https://i.imgur.com/JbvGcwk.png",
    "characterdeescription": "A minor member of the Uchiha clan and a chuunin, Obito is a member of Team Minato. While Obito does not possess any singular powerful ability, he can use all of what he knows with his developing sharingan to put up a fight.",
    "skills": [
        {
            "id": "uchiha-obito-piercing-stab",
            "name": "Piercing Stab",
            "skillimage": "https://i.imgur.com/YjvbfdY.png",
            "skilldescription": "Uchiha Obito deals 15 piercing damage to one enemy. During 'Obito Sharingan', this skill will deal 10 additional damage.",
            "energy": [
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
                    "amount": 15,
                    "scope": "target",
                    "condition": {
                        "scope": "self",
                        "statusId": "uchiha_obito_sharingan",
                        "conditionalAmount": 25
                    },
                    "metadata": {
                        "ignoreDestructibleDefense": true
                    }
                }
            ]
        },
        {
            "id": "uchiha-obito-great-fireball",
            "name": "Obito Great Fireball",
            "skillimage": "https://i.imgur.com/YQwIDCR.png",
            "skilldescription": "Uchiha Obito deals 15 affliction damage to one enemy for 2 turns. During 'Obito Sharingan', this skill will deal 30 affliction damage instantly.",
            "energy": [
                "Ninjutsu"
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
                    "type": "apply_status",
                    "statusId": "uchiha_obito_great_fireball_dot",
                    "duration": 2,
                    "scope": "target",
                    "condition": {
                        "scope": "self",
                        "missingStatusId": "uchiha_obito_sharingan"
                    },
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 15,
                        "afflictionDamage": true,
                        "turnEndTrigger": "source_turn",
                        "turnDurationAnchor": "source_turn",
                        "ongoingClass": "action",
                        "triggerOnApply": true,
                        "tooltipText": "This character takes 15 affliction damage each turn from Obito Great Fireball."
                    }
                },
                {
                    "type": "damage",
                    "amount": 30,
                    "scope": "target",
                    "condition": {
                        "scope": "self",
                        "statusId": "uchiha_obito_sharingan"
                    },
                    "metadata": {
                        "afflictionDamage": true,
                        "ignoreDamageReduction": true
                    }
                }
            ]
        },
        {
            "id": "uchiha-obito-sharingan",
            "name": "Obito Sharingan",
            "skillimage": "https://i.imgur.com/HB5GL7k.png",
            "skilldescription": "For 4 turns, Uchiha Obito will gain 15 points of damage reduction. This skill becomes 'Sharingan-Enhanced Parry' for 4 turns after used.",
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
                    "statusId": "uchiha_obito_sharingan",
                    "duration": 4,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "damageReductionFlat": 15,
                        "tooltipText": "Uchiha Obito has 15 points of damage reduction from Obito Sharingan."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "uchiha_obito_sharingan_replacement",
                    "duration": 4,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillReplacements": {
                            "uchiha-obito-sharingan": "uchiha-obito-sharingan-enhanced-parry"
                        },
                        "tooltipText": "Obito Sharingan is replaced by Sharingan-Enhanced Parry."
                    }
                }
            ]
        },
        {
            "id": "uchiha-obito-flee",
            "name": "Obito Flee",
            "skillimage": "https://i.imgur.com/WJAbDGt.png",
            "skilldescription": "This skill makes Uchiha Obito invulnerable for 1 turn.",
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
                    "statusId": "uchiha_obito_flee",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "invulnerable": true,
                        "tooltipText": "This character is invulnerable."
                    }
                }
            ]
        },
        {
            "id": "uchiha-obito-sharingan-enhanced-parry",
            "name": "Sharingan-Enhanced Parry",
            "hiddenFromSelectionViewer": true,
            "skillimage": "https://i.imgur.com/HB5GL7k.png",
            "skilldescription": "Uchiha Obito makes his allies invulnerable for 1 turn.",
            "energy": [
                "Random",
                "Random"
            ],
            "target": "all-allies",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "uchiha_obito_sharingan_enhanced_parry",
                    "duration": 1,
                    "scope": "all-allies",
                    "metadata": {
                        "helpful": true,
                        "invulnerable": true,
                        "tooltipText": "This character is invulnerable."
                    }
                }
            ]
        }
    ]
};
