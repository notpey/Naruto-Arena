module.exports = {
    "id": "kankuro",
    "characterId": "kankuro",
    "name": "Kankuro",
    "facePicture": "https://i.imgur.com/GN0osit.png",
    "characterdeescription": "The brother of Gaara, and a master puppeteer, Kankuro is one of the three sand siblings. With his puppets, Kankuro is able to use the varied abilities hidden inside them to attack his enemies, or even protect himself.",
    "skills": [
        {
            "id": "kankuro-black-secret-machine-one-shot",
            "name": "Black Secret Machine One Shot",
            "skillimage": "https://i.imgur.com/wjpmZQI.png",
            "skilldescription": "Kankuro deals 30 piercing damage to one enemy. If this enemy is affected by 'Puppet Preparation', it deals 10 additional damage.",
            "energy": [
                "Random",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
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
                        "missingStatusId": "kankuro_puppet_preparation_target_mark"
                    },
                    "metadata": {
                        "ignoreDamageReduction": true
                    }
                },
                {
                    "type": "damage",
                    "amount": 40,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "statusId": "kankuro_puppet_preparation_target_mark"
                    },
                    "metadata": {
                        "ignoreDamageReduction": true
                    }
                }
            ]
        },
        {
            "id": "kankuro-poison-bomb",
            "name": "Poison Bomb",
            "skillimage": "https://i.imgur.com/3MFMSHu.png",
            "skilldescription": "Kankuro deals 10 affliction damage to all enemies each turn for 2 turns.",
            "energy": [
                "Random"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Affliction",
                "Action"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "kankuro_poison_bomb_action",
                    "duration": 2,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 10,
                        "afflictionDamage": true,
                        "turnEndTrigger": "source_turn",
                        "turnDurationAnchor": "source_turn",
                        "ongoingClass": "action",
                        "triggerOnApply": true,
                        "ignoreDamageReduction": true,
                        "ignoreDestructibleDefense": true,
                        "tooltipText": "This character takes 10 affliction damage each turn from Poison Bomb."
                    }
                }
            ]
        },
        {
            "id": "kankuro-puppet-preparation",
            "name": "Puppet Preparation",
            "skillimage": "https://i.imgur.com/ghx3V0n.png",
            "skilldescription": "Kankuro gains 10 points of permanent destructible defense and targets one enemy. For 3 turns, Kankuro's skills deal 10 additional damage to this target.",
            "energy": [],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "kankuro_puppet_preparation_defense",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "destructibleDefensePoints": 10,
                        "mergeNumericAddKeys": [
                            "destructibleDefensePoints"
                        ],
                        "tooltipTextTemplate": "Kankuro has {destructibleDefensePoints} points of permanent destructible defense from Puppet Preparation."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kankuro_puppet_preparation_target_mark",
                    "duration": 3,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "Kankuro's skills deal 10 additional damage to this target."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kankuro_puppet_preparation_bonus",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "removeSelfOnSkillUseSkillIds": [
                            "kankuro-black-secret-machine-one-shot",
                            "kankuro-poison-bomb"
                        ],
                        "tooltipText": "Kankuro's next skill deals additional damage."
                    }
                }
            ]
        },
        {
            "id": "kankuro-puppet-replacement-technique",
            "name": "Puppet Replacement Technique",
            "skillimage": "https://i.imgur.com/P2K3Uue.png",
            "skilldescription": "This skill makes Kankuro invulnerable for 1 turn.",
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
