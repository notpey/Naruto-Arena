module.exports = {
    "id": "temari",
    "characterId": "temari",
    "name": "Temari",
    "facePicture": "https://i.imgur.com/z5lW2jl.png",
    "characterdeescription": "A confident and sharp-tongued genin of the Hidden Sand Village, Temari wields an enormous iron fan to unleash powerful wind techniques against her opponents. As the eldest of the three Sand siblings, she combines her tactical instincts with overwhelming force to control the battlefield.",
    "passive": {
        "name": "Phantom Gale",
        "icon": "https://i.imgur.com/74m04BG.png",
        "description": "Temari's winds strike unpredictably. Whenever she uses a skill, a random enemy takes 5 piercing damage.",
        "onSkillUseRandomEnemyPiercingDamage": {
            "amount": 5,
            "extraTriggersStatusId": "temari_phantom_gale_growth"
        }
    },
    "skills": [
        {
            "id": "temari-cutting-whirlwind",
            "name": "Cutting Whirlwind",
            "skillimage": "https://i.imgur.com/TceZL1M.png",
            "skilldescription": "Temari unleashes a razor-sharp gust of wind, dealing 20 piercing damage to an enemy and 10 piercing damage to all other enemies. Temari also becomes invulnerable to non-mental skills for 1 turn.",
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
                        "helpful": true,
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
                        "tooltipText": "Temari is invulnerable to non-mental skills. Summoning: Quick Beheading Dance costs 1 less Random chakra on her next turn."
                    }
                }
            ]
        },
        {
            "id": "temari-summoning-quick-beheading-dance",
            "name": "Summoning: Quick Beheading Dance",
            "skillimage": "https://i.imgur.com/cvblibj.png",
            "skilldescription": "Temari summons Kamatari, the wind weasel, dealing 35 damage to all enemies. If used the turn after Cutting Whirlwind, this skill costs 1 less random chakra. Each use permanently increases the number of times Phantom Gale triggers by 1.",
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
                    "type": "damage",
                    "amount": 35,
                    "scope": "all-enemy"
                },
                {
                    "type": "apply_status",
                    "statusId": "temari_phantom_gale_growth",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "permanent": true,
                        "stackMetadataKey": "extraTriggers",
                        "stackDelta": 1,
                        "stackMax": 9999,
                        "tooltipTextTemplate": "Phantom Gale triggers {extraTriggers} additional times whenever Temari uses a skill."
                    }
                }
            ]
        },
        {
            "id": "temari-dust-wind",
            "name": "Dust Wind",
            "skillimage": "https://i.imgur.com/O7YnMRH.png",
            "skilldescription": "Temari kicks up a cloud of dust, making herself and all allies invulnerable for 1 turn. If enemies can be targeted, their non-affliction damage is also reduced by 20 for 1 turn. If used the turn after Cutting Whirlwind, this reduction lasts 2 turns instead.",
            "energy": [
                "Ninjutsu",
                "Ninjutsu"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 4,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "temari_dust_wind_invulnerable",
                    "duration": 1,
                    "scope": "all-allies",
                    "metadata": {
                        "helpful": true,
                        "invulnerable": true,
                        "tooltipText": "This character is invulnerable for 1 turn."
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
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character deals 20 less non-affliction damage for 1 turn."
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
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character deals 20 less non-affliction damage for 2 turns."
                    }
                }
            ]
        },
        {
            "id": "temari-backflip",
            "name": "Backflip",
            "skillimage": "https://i.imgur.com/lnhXY2D.png",
            "skilldescription": "Temari evades incoming attacks, becoming invulnerable for 1 turn.",
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
                    "statusId": "temari_backflip_invulnerable",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "invulnerable": true,
                        "tooltipText": "Temari is invulnerable for 1 turn."
                    }
                }
            ]
        }
    ]
};
