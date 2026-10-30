module.exports = {
    "id": "jiraiya",
    "characterId": "jiraiya",
    "name": "Jiraiya",
    "facePicture": "https://i.imgur.com/7nC6nSS.png",
    "characterdeescription": "One of the three sannins, Jiraiya is a perverted frog hermit who travels the world in search of some sort of knowledge. Using numerous frog based summons, Jiraiya can greatly hinder his enemies all while setting them ablaze.",
    "requiredMissionId": "disciples-of-the-toad",
    "skills": [
        {
            "id": "jiraiya-great-spitting-fireball",
            "name": "Great Spitting Fireball",
            "skillimage": "https://i.imgur.com/dotn0mw.png",
            "skilldescription": "Jiraiya deals 20 affliction damage to one enemy and 10 affliction damage to all others.",
            "energy": [
                "Ninjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Affliction",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 20,
                    "scope": "target",
                    "metadata": {
                        "afflictionDamage": true
                    }
                },
                {
                    "type": "damage",
                    "amount": 10,
                    "scope": "all-other-enemy",
                    "metadata": {
                        "afflictionDamage": true
                    }
                }
            ]
        },
        {
            "id": "jiraiya-summoning-toad-mouth-bind",
            "name": "Summoning: Toad Mouth Bind",
            "skillimage": "https://i.imgur.com/E0vmRac.png",
            "skilldescription": "For 2 turns, all enemies cannot reduce damage or become invulnerable. During this time, if Jiraiya or one of his allies is targeted by a new harmful physical skill, they become invulnerable for 1 turn.",
            "energy": [
                "Genjutsu"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "jiraiya_toad_mouth_bind_debuff",
                    "duration": 2,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "cannotReduceDamage": true,
                        "cannotBecomeInvulnerable": true,
                        "tooltipText": "This character cannot reduce damage or become invulnerable."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "jiraiya_toad_mouth_bind_ward",
                    "duration": 2,
                    "scope": "all-allies",
                    "metadata": {
                        "helpful": true,
                        "triggerOnEnemyHarmfulSkillClassesAny": [
                            "physical"
                        ],
                        "counterApplyStatusToRecipient": {
                            "statusId": "invulnerable",
                            "duration": 1,
                            "metadata": {
                                "invulnerable": true,
                                "tooltipText": "This character is invulnerable."
                            }
                        },
                        "tooltipText": "If this character is targeted by a new harmful physical skill, they become invulnerable for 1 turn."
                    }
                }
            ]
        },
        {
            "id": "jiraiya-major-summoning-gamabunta",
            "name": "Major Summoning: Gamabunta",
            "skillimage": "https://i.imgur.com/Qti5Che.png",
            "skilldescription": "Jiraiya deals 25 affliction damage to all enemies. For the rest of the game, the enemy team will take 5 additional damage from affliction skills and this skill will be replaced by 'Toad Oil Flame Bullet'.",
            "energy": [
                "Taijutsu",
                "Bloodline",
                "Genjutsu"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Affliction",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 25,
                    "scope": "all-enemy",
                    "metadata": {
                        "afflictionDamage": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "jiraiya_gamabunta_vulnerable",
                    "duration": 99,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "damageTakenBonusBySkillClass": {
                            "affliction": 5
                        },
                        "tooltipText": "This character takes 5 additional damage from affliction skills."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "jiraiya_gamabunta_replacement",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillReplacements": {
                            "jiraiya-major-summoning-gamabunta": "jiraiya-toad-oil-flame-bullet"
                        },
                        "tooltipText": "Major Summoning: Gamabunta is replaced by Toad Oil Flame Bullet."
                    }
                }
            ]
        },
        {
            "id": "jiraiya-spiked-budda",
            "name": "Spiked Budda",
            "skillimage": "https://i.imgur.com/0Lw6GVr.png",
            "skilldescription": "Jiraiya becomes invulnerable for 1 turn.",
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
        },
        {
            "id": "jiraiya-toad-oil-flame-bullet",
            "name": "Toad Oil Flame Bullet",
            "hiddenFromSelectionViewer": true,
            "skillimage": "https://i.imgur.com/UOM0Dx3.png",
            "skilldescription": "Jiraiya deals 15 affliction damage to all enemies for 2 turns.",
            "energy": [
                "Ninjutsu",
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
                    "statusId": "jiraiya_toad_oil_flame_bullet_dot",
                    "duration": 2,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "afflictionDamage": true,
                        "turnEndDamage": 15,
                        "turnEndTrigger": "source_turn",
                        "tooltipText": "This character takes 15 affliction damage each turn from Toad Oil Flame Bullet.",
                        "ongoingClass": "action"
                    }
                }
            ]
        }
    ]
};
