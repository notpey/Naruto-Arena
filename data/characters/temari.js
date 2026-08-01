module.exports = {
    "id": "temari",
    "characterId": "temari",
    "name": "Temari",
    "facePicture": "https://i.imgur.com/a3la0h5.png",
    "characterdeescription": "The elder sister of Gaara and Kankuro, Temari is a somewhat cruel and blunt ninja that fights using the wind at her side. With her fan, Temari can create powerful gusts of wind that she can manipulate at her desire.",
    "skills": [
        {
            "id": "temari-cutting-whirlwind",
            "name": "Cutting Whirlwind",
            "skillimage": "https://i.imgur.com/VU7HluY.png",
            "skilldescription": "Temari creates a razor sharp wind, dealing 20 piercing damage to one enemy and 10 piercing damage to all other enemies. For 1 turn, Temari becomes invulnerable to non-mental skills.",
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
                    "amount": 20,
                    "scope": "target",
                    "metadata": {
                        "ignoreDamageReduction": true
                    }
                },
                {
                    "type": "damage",
                    "amount": 10,
                    "scope": "all-other-enemy",
                    "metadata": {
                        "ignoreDamageReduction": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "temari_cutting_whirlwind_active",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "invulnerableToSkillClasses": [
                            "physical",
                            "energy",
                            "strategic",
                            "affliction"
                        ],
                        "skillCostOverridesBySkillId": {
                            "temari-summoning-quick-beheading-dance": {
                                "energy": [
                                    "Ninjutsu",
                                    "Random"
                                ]
                            }
                        },
                        "tooltipText": "Temari is invulnerable to non-mental skills. Summoning Quick Beheading Dance costs 1 less random chakra."
                    }
                }
            ]
        },
        {
            "id": "temari-summoning-quick-beheading-dance",
            "name": "Summoning Quick Beheading Dance",
            "skillimage": "https://i.imgur.com/9VRqsM7.png",
            "skilldescription": "Temari summons the wind weasel Kamatari in the battlefield, dealing 35 damage to all enemies. If used one turn after 'Cutting Whirlwind', this skill will cost 1 less random chakra.",
            "energy": [
                "Ninjutsu",
                "Random",
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
                    "type": "apply_status",
                    "statusId": "temari_summoning_quick_beheading_dance",
                    "duration": 1,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 35,
                        "turnEndTrigger": "source_turn",
                        "turnDurationAnchor": "source_turn",
                        "ongoingClass": "action",
                        "triggerOnApply": true,
                        "tooltipText": "This character will take 35 damage from Summoning Quick Beheading Dance."
                    }
                }
            ]
        },
        {
            "id": "temari-dust-wind",
            "name": "Dust Wind",
            "skillimage": "https://i.imgur.com/oBQQWNM.png",
            "skilldescription": "Temari kicks up dust, making herself invulnerable for 1 turn. If targetable, all enemies will deal 20 less non-affliction damage for 1 turn. If used one turn after 'Cutting Whirlwind', this skill will decrease damage for 2 turns instead.",
            "energy": [
                "Ninjutsu",
                "Random"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 4,
            "classes": [
                "Strategic",
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "temari_dust_wind_invulnerable",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "invulnerable": true,
                        "tooltipText": "This character is invulnerable."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "temari_dust_wind_debuff",
                    "duration": 1,
                    "scope": "all-enemy",
                    "condition": {
                        "scope": "self",
                        "missingStatusId": "temari_cutting_whirlwind_active"
                    },
                    "metadata": {
                        "harmful": true,
                        "NonAfflictionDamageDebuff": 20,
                        "tooltipText": "This character deals 20 less non-affliction damage.",
                        "turnDurationAnchor": "source_turn"
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "temari_dust_wind_debuff",
                    "duration": 2,
                    "scope": "all-enemy",
                    "condition": {
                        "scope": "self",
                        "statusId": "temari_cutting_whirlwind_active"
                    },
                    "metadata": {
                        "harmful": true,
                        "NonAfflictionDamageDebuff": 20,
                        "tooltipText": "This character deals 20 less non-affliction damage."
                    }
                }
            ]
        },
        {
            "id": "temari-fan-defence-technique",
            "name": "Fan Defence Technique",
            "skillimage": "https://i.imgur.com/nnNAsmM.png",
            "skilldescription": "This skill makes Temari invulnerable for 1 turn.",
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
