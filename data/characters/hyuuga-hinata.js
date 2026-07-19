module.exports = {
    "id": "hyuuga-hinata",
    "characterId": "hyuuga-hinata",
    "name": "Hyuuga Hinata",
    "facePicture": "https://i.imgur.com/NWuk5fw.png",
    "characterdeescription": "A Genin from Team 8, Hinata is the next in line in the Hyuuga clan, but she is shy and very withdrawn. Using the trademark Byakugan of the Hyuuga, Hinata is able to delicately target an enemy's Chakra Points while defending the team.",
    "skills": [
        {
            "id": "hyuuga-hinata-hinata-gentle-fist",
            "name": "Hinata Gentle Fist",
            "skillimage": "https://i.imgur.com/guOfm9P.png",
            "skilldescription": "Hyuuga Hinata deals 20 damage to one enemy. For 1 turn, they will have their chakra costs increased by 1 random. During 'Byakugan', the cost increase lasts 1 additional turn and the target takes 20 damage each turn for 2 turns.",
            "energy": [
                "Taijutsu"
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
                    "amount": 20,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "hyuuga_hinata_gentle_fist_cost",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "randomCostIncrease": 1,
                        "tooltipText": "This character's skills cost 1 additional random chakra."
                    },
                    "condition": {
                        "scope": "self",
                        "missingStatusId": "hyuuga_hinata_byakugan"
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "hyuuga_hinata_gentle_fist_cost",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "randomCostIncrease": 1,
                        "tooltipText": "This character's skills cost 1 additional random chakra."
                    },
                    "condition": {
                        "scope": "self",
                        "statusId": "hyuuga_hinata_byakugan"
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "hyuuga_hinata_gentle_fist_damage",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 20,
                        "turnEndTrigger": "source_turn",
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character takes 20 damage each turn from Hinata Gentle Fist."
                    },
                    "condition": {
                        "scope": "self",
                        "statusId": "hyuuga_hinata_byakugan"
                    }
                }
            ]
        },
        {
            "id": "hyuuga-hinata-protective-eight-trigrams-sixty-four-palms",
            "name": "Protective Eight Trigrams Sixty-Four Palms",
            "skillimage": "https://i.imgur.com/CFkIcA6.png",
            "skilldescription": "Hyuuga Hinata grants her team 10 points of destructible defense for 1 turn. Any enemy that breaks this destructible defense will have their chakra costs increased by 1 random for 1 turn. During 'Byakugan', this defense lasts 1 additional turn and refreshes 10 destructible defense on Hinata's next turn.",
            "energy": [
                "Ninjutsu"
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
                    "statusId": "hyuuga_hinata_protective_palms_defense",
                    "duration": 1,
                    "scope": "all-allies",
                    "metadata": {
                        "destructibleDefensePoints": 10,
                        "onBreakApplyStatusToSource": {
                            "statusId": "hyuuga_hinata_protective_palms_cost",
                            "duration": 1,
                            "metadata": {
                                "harmful": true,
                                "randomCostIncrease": 1,
                                "tooltipText": "This character's skills cost 1 additional random chakra."
                            }
                        },
                        "tooltipText": "This character has 10 destructible defense. If it is destroyed, Hinata's skills cost 1 additional random chakra."
                    },
                    "condition": {
                        "scope": "self",
                        "missingStatusId": "hyuuga_hinata_byakugan"
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "hyuuga_hinata_protective_palms_defense",
                    "duration": 2,
                    "scope": "all-allies",
                    "metadata": {
                        "destructibleDefensePoints": 10,
                        "turnEndApplyStatusToSelf": {
                            "statusId": "hyuuga_hinata_protective_palms_defense_refresh",
                            "duration": 1,
                            "metadata": {
                                "helpful": true,
                                "destructibleDefensePoints": 10,
                                "tooltipText": "This character has 10 refreshed destructible defense from Protective Eight Trigrams Sixty-Four Palms."
                            }
                        },
                        "turnEndTrigger": "source_turn",
                        "onBreakApplyStatusToSource": {
                            "statusId": "hyuuga_hinata_protective_palms_cost",
                            "duration": 1,
                            "metadata": {
                                "harmful": true,
                                "randomCostIncrease": 1,
                                "tooltipText": "This character's skills cost 1 additional random chakra."
                            }
                        },
                        "tooltipText": "This character has 10 destructible defense. This defense refreshes once on Hinata's next turn. If it is destroyed, Hinata's skills cost 1 additional random chakra."
                    },
                    "condition": {
                        "scope": "self",
                        "statusId": "hyuuga_hinata_byakugan"
                    }
                }
            ]
        },
        {
            "id": "hyuuga-hinata-byakugan",
            "name": "Byakugan",
            "skillimage": "https://i.imgur.com/TcjSSGB.png",
            "skilldescription": "Hyuuga Hinata gains 15 points of damage reduction for 3 turns. During this time, 'Hinata Gentle Fist' and 'Protective Eight Trigrams Sixty-Four Palms' last 1 additional turn.",
            "energy": [
                "Random"
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
                    "statusId": "hyuuga_hinata_byakugan",
                    "duration": 3,
                    "scope": "self",
                    "metadata": {
                        "damageReductionFlat": 15,
                        "tooltipText": "Hinata has 15 damage reduction. Hinata Gentle Fist lasts 1 additional turn and Protective Eight Trigrams Sixty-Four Palms refreshes destructible defense once."
                    }
                }
            ]
        },
        {
            "id": "hyuuga-hinata-hinata-block",
            "name": "Hinata Block",
            "skillimage": "https://i.imgur.com/jRh5417.png",
            "skilldescription": "This skill makes Hyuuga Hinata invulnerable for 1 turn.",
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
