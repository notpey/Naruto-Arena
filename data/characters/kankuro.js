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
            "skilldescription": "Kankuro deals 30 piercing damage to one enemy. For 1 turn, this enemy will take 5 additional damage from 'Poison Bomb'.",
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
                    "metadata": {
                        "ignoreDamageReduction": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kankuro_black_secret_machine_one_shot_mark",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "bonusDamageFromSourceSkillsFlat": 5,
                        "bonusDamageFromSourceCharacterId": "kankuro",
                        "bonusDamageAppliesToSkillIds": [
                            "kankuro-poison-bomb"
                        ],
                        "tooltipText": "This character takes 5 additional damage from Poison Bomb."
                    }
                }
            ]
        },
        {
            "id": "kankuro-poison-bomb",
            "name": "Poison Bomb",
            "skillimage": "https://i.imgur.com/3MFMSHu.png",
            "skilldescription": "Kankuro deals 10 affliction damage to all enemies. For 1 turn, these enemies will take 5 additional damage from 'Black Secret Machine One Shot'. If Kankuro has 'Puppet Preparation', this effect will last 2 turns.",
            "energy": [
                "Random"
            ],
            "target": "all-enemy",
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
                    "scope": "all-enemy",
                    "metadata": {
                        "afflictionDamage": true,
                        "ignoreDamageReduction": true,
                        "ignoreDestructibleDefense": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kankuro_poison_bomb_mark",
                    "duration": 1,
                    "scope": "all-enemy",
                    "condition": {
                        "scope": "self",
                        "missingStatusId": "kankuro_puppet_preparation_bonus"
                    },
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "bonusDamageFromSourceSkillsFlat": 5,
                        "bonusDamageFromSourceCharacterId": "kankuro",
                        "bonusDamageAppliesToSkillIds": [
                            "kankuro-black-secret-machine-one-shot"
                        ],
                        "tooltipText": "This character takes 5 additional damage from Black Secret Machine One Shot."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kankuro_poison_bomb_mark",
                    "duration": 2,
                    "scope": "all-enemy",
                    "condition": {
                        "scope": "self",
                        "statusId": "kankuro_puppet_preparation_bonus"
                    },
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "bonusDamageFromSourceSkillsFlat": 5,
                        "bonusDamageFromSourceCharacterId": "kankuro",
                        "bonusDamageAppliesToSkillIds": [
                            "kankuro-black-secret-machine-one-shot"
                        ],
                        "tooltipText": "This character takes 5 additional damage from Black Secret Machine One Shot."
                    }
                }
            ]
        },
        {
            "id": "kankuro-puppet-preparation",
            "name": "Puppet Preparation",
            "skillimage": "https://i.imgur.com/ghx3V0n.png",
            "skilldescription": "Kankuro gains 10 points of permanent destructible defense. His next 'Black Secret Machine One Shot' or 'Poison Bomb' will deal 10 additional damage. This damage bonus does not stack.",
            "energy": [],
            "target": "self",
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
                    "statusId": "kankuro_puppet_preparation_bonus",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "skillDamageBonuses": {
                            "kankuro-black-secret-machine-one-shot": 10,
                            "kankuro-poison-bomb": 10
                        },
                        "onOwnerUseSkillIdsAny": [
                            "kankuro-black-secret-machine-one-shot",
                            "kankuro-poison-bomb"
                        ],
                        "replaceSkillDamageBonuses": true,
                        "tooltipText": "Kankuro's next Black Secret Machine One Shot or Poison Bomb deals 10 additional damage."
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
