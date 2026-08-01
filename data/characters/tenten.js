module.exports = {
    "id": "tenten",
    "characterId": "tenten",
    "name": "Tenten",
    "facePicture": "https://i.imgur.com/xkYENuj.png",
    "characterdeescription": "A member of team Gai, Tenten is a tomboyish weapon specialist who believes a kunoichi can be as strong as a male ninja. In battle, Tenten surrounds the battlefield in weapons, using them for damage and for disabling her opponents.",
    "skills": [
        {
            "id": "tenten-twin-rising-dragons",
            "name": "Twin Rising Dragons",
            "skillimage": "https://i.imgur.com/735M5GV.png",
            "skilldescription": "Tenten deals 15 damage to one enemy and 10 damage to all others. For 2 turns, all enemies will take 10 additional damage from 'Twin Rising Dragons Trap'.",
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
                    "amount": 15,
                    "scope": "target"
                },
                {
                    "type": "damage",
                    "amount": 10,
                    "scope": "all-other-enemy"
                },
                {
                    "type": "apply_status",
                    "statusId": "tenten_twin_rising_dragons_mark",
                    "duration": 2,
                    "scope": "all-enemy",
                    "condition": {
                        "scope": "self",
                        "missingStatusId": "tenten_full_release_active"
                    },
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "bonusDamageFromSourceSkillsFlat": 10,
                        "mergeNumericAddKeys": [
                            "bonusDamageFromSourceSkillsFlat"
                        ],
                        "bonusDamageFromSourceCharacterId": "tenten",
                        "bonusDamageAppliesToSkillIds": [
                            "tenten-twin-rising-dragons-trap"
                        ],
                        "tooltipTextTemplate": "This character takes {bonusDamageFromSourceSkillsFlat} additional damage from Twin Rising Dragons Trap."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "tenten_twin_rising_dragons_mark",
                    "duration": 2,
                    "scope": "all-enemy",
                    "condition": {
                        "scope": "self",
                        "statusId": "tenten_full_release_active"
                    },
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "bonusDamageFromSourceSkillsFlat": 20,
                        "mergeNumericAddKeys": [
                            "bonusDamageFromSourceSkillsFlat"
                        ],
                        "bonusDamageFromSourceCharacterId": "tenten",
                        "bonusDamageAppliesToSkillIds": [
                            "tenten-twin-rising-dragons-trap"
                        ],
                        "tooltipTextTemplate": "This character takes {bonusDamageFromSourceSkillsFlat} additional damage from Twin Rising Dragons Trap."
                    }
                },
                {
                    "type": "cleanse_statuses",
                    "scope": "self",
                    "statusId": "tenten_full_release_active",
                    "condition": {
                        "scope": "self",
                        "statusId": "tenten_full_release_active"
                    }
                }
            ]
        },
        {
            "id": "tenten-twin-rising-dragons-trap",
            "name": "Twin Rising Dragons Trap",
            "skillimage": "https://i.imgur.com/pOsj115.png",
            "skilldescription": "Tenten deals 5 damage to all enemies. Enemies affected by 'Twin Rising Dragons' will have their physical and chakra skills stunned for 1 turn and will deal 10 less physical and chakra damage. All stacks of 'Twin Rising Dragons' will be removed from all targets afterwards.",
            "energy": [
                "Random"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 5,
                    "scope": "all-enemy"
                },
                {
                    "type": "apply_status",
                    "statusId": "tenten_twin_rising_dragons_trap_debuff",
                    "duration": 1,
                    "scope": "all-enemy",
                    "condition": {
                        "all": [
                            {
                                "scope": "target",
                                "statusId": "tenten_twin_rising_dragons_mark"
                            },
                            {
                                "scope": "self",
                                "missingStatusId": "tenten_full_release_active"
                            }
                        ]
                    },
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "damageDebuffBySkillClass": {
                            "physical": 10,
                            "energy": 10
                        },
                        "tooltipText": "This character deals 10 less physical and chakra damage."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "tenten_twin_rising_dragons_trap_debuff",
                    "duration": 2,
                    "scope": "all-enemy",
                    "condition": {
                        "all": [
                            {
                                "scope": "target",
                                "statusId": "tenten_twin_rising_dragons_mark"
                            },
                            {
                                "scope": "self",
                                "statusId": "tenten_full_release_active"
                            }
                        ]
                    },
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "damageDebuffBySkillClass": {
                            "physical": 10,
                            "energy": 10
                        },
                        "tooltipText": "This character deals 10 less physical and chakra damage."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "tenten_twin_rising_dragons_trap_skill_stun",
                    "duration": 1,
                    "scope": "all-enemy",
                    "condition": {
                        "scope": "target",
                        "statusId": "tenten_twin_rising_dragons_mark"
                    },
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkillClasses": [
                            "physical",
                            "energy",
                            "ninjutsu"
                        ],
                        "tooltipText": "This character's physical and chakra skills are stunned.",
                        "turnDurationAnchor": "source_turn"
                    }
                },
                {
                    "type": "cleanse_statuses",
                    "scope": "self",
                    "statusId": "tenten_full_release_active",
                    "condition": {
                        "scope": "self",
                        "statusId": "tenten_full_release_active"
                    }
                },
                {
                    "type": "cleanse_statuses",
                    "scope": "all-enemy",
                    "statusId": "tenten_twin_rising_dragons_mark"
                }
            ]
        },
        {
            "id": "tenten-twin-rising-dragons-full-release",
            "name": "Twin Rising Dragons Full Release",
            "skillimage": "https://i.imgur.com/5cUbYBW.png",
            "skilldescription": "Tenten becomes invulnerable for 1 turn and improves her harmful skills until the next time she uses one; this does not stack. Twin Rising Dragons marks will cause Twin Rising Dragons Trap to deal 20 additional damage, and Twin Rising Dragons Trap's damage reduction will last 1 additional turn.",
            "energy": [
                "Random"
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
                    "statusId": "tenten_full_release_invulnerability",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "invulnerable": true,
                        "tooltipText": "Tenten is invulnerable."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "tenten_full_release_active",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "consumeOnNextSkillUse": true,
                        "tooltipText": "Tenten's next harmful skill is improved. Twin Rising Dragons marks will make Twin Rising Dragons Trap deal 20 additional damage. Twin Rising Dragons Trap's damage reduction will last 1 additional turn."
                    }
                }
            ]
        },
        {
            "id": "tenten-spiked-boulder-wall",
            "name": "Spiked Boulder Wall",
            "skillimage": "https://i.imgur.com/45XopDc.png",
            "skilldescription": "This skill makes Tenten invulnerable for 1 turn.",
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
