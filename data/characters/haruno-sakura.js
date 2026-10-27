module.exports = {
    "id": "haruno-sakura",
    "characterId": "haruno-sakura",
    "name": "Haruno Sakura",
    "facePicture": "https://i.imgur.com/q2K5CEj.png",
    "characterdeescription": "A young kunoichi with exceptional chakra control and a sharp mind, Sakura Haruno joins Team 7 alongside Naruto Uzumaki and Sasuke Uchiha, hoping to prove herself as a capable shinobi. Though initially inexperienced in combat and often overshadowed by her teammates, Sakura's early encounters with dangerous enemies begin to test her courage and strengthen her resolve to protect those she cares about.",
    "passive": {
        "name": "Exceptional Chakra Control",
        "icon": "https://i.imgur.com/srHzKvO.png",
        "description": "Destructible defense granted by Sakura's skills is increased by 5.",
        "destructibleDefenseBonusGranted": 5
    },
    "skills": [
        {
            "id": "haruno-sakura-kunai-interference",
            "name": "Kunai Interference",
            "skillimage": "https://i.imgur.com/Y4iU5Lv.png",
            "skilldescription": "Sakura attacks one enemy with a kunai, dealing 15 physical damage and causing their harmful skills to deal 10 less non-affliction damage for 1 turn. During Clone Technique, this skill instead affects all enemies, dealing 10 physical damage and reducing their non-affliction damage by 5 for 1 turn.",
            "energy": [
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
                    "amount": 15,
                    "scope": "target",
                    "condition": {
                        "missingStatusId": "haruno_sakura_clone_technique",
                        "requireMatch": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "haruno_sakura_kunai_interference",
                    "duration": 1,
                    "scope": "target",
                    "condition": {
                        "missingStatusId": "haruno_sakura_clone_technique",
                        "requireMatch": true
                    },
                    "metadata": {
                        "harmful": true,
                        "nonAfflictionDamageDebuffFlat": 10,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character's harmful skills deal 10 less non-affliction damage."
                    }
                },
                {
                    "type": "damage",
                    "amount": 10,
                    "scope": "all-enemy",
                    "condition": {
                        "statusId": "haruno_sakura_clone_technique",
                        "requireMatch": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "haruno_sakura_kunai_interference",
                    "duration": 1,
                    "scope": "all-enemy",
                    "condition": {
                        "statusId": "haruno_sakura_clone_technique",
                        "requireMatch": true
                    },
                    "metadata": {
                        "harmful": true,
                        "nonAfflictionDamageDebuffFlat": 5,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character's harmful skills deal 5 less non-affliction damage."
                    }
                }
            ]
        },
        {
            "id": "haruno-sakura-guard-duty",
            "name": "Guard Duty",
            "skillimage": "https://i.imgur.com/t4I45Ck.png",
            "skilldescription": "Sakura protects herself or one ally, granting them 25 destructible defense and 10 damage reduction for 2 turns. During Clone Technique, this skill instead grants all allies 15 destructible defense and 5 damage reduction for 2 turns.",
            "energy": [
                "Random",
                "Random"
            ],
            "target": "self-or-single-ally",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "haruno_sakura_guard_duty_defense",
                    "duration": 2,
                    "scope": "target",
                    "condition": {
                        "missingStatusId": "haruno_sakura_clone_technique",
                        "requireMatch": true
                    },
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePoints": 25,
                        "tooltipTextTemplate": "This character has {destructibleDefensePoints} destructible defense.",
                        "tooltipText": "This character has 25 destructible defense."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "haruno_sakura_guard_duty_reduction",
                    "duration": 2,
                    "scope": "target",
                    "condition": {
                        "missingStatusId": "haruno_sakura_clone_technique",
                        "requireMatch": true
                    },
                    "metadata": {
                        "helpful": true,
                        "damageReductionFlat": 10,
                        "tooltipText": "This character has 10 damage reduction."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "haruno_sakura_guard_duty_defense",
                    "duration": 2,
                    "scope": "all-allies",
                    "condition": {
                        "statusId": "haruno_sakura_clone_technique",
                        "requireMatch": true
                    },
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePoints": 15,
                        "tooltipTextTemplate": "This character has {destructibleDefensePoints} destructible defense.",
                        "tooltipText": "This character has 15 destructible defense."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "haruno_sakura_guard_duty_reduction",
                    "duration": 2,
                    "scope": "all-allies",
                    "condition": {
                        "statusId": "haruno_sakura_clone_technique",
                        "requireMatch": true
                    },
                    "metadata": {
                        "helpful": true,
                        "damageReductionFlat": 5,
                        "tooltipText": "This character has 5 damage reduction."
                    }
                }
            ]
        },
        {
            "id": "haruno-sakura-clone-technique",
            "name": "Clone Technique",
            "skillimage": "https://i.imgur.com/6GrbwOM.png",
            "skilldescription": "Sakura creates illusionary clones for 3 turns, gaining 10 damage reduction. During this time, Kunai Interference and Guard Duty affect all eligible targets instead of one.",
            "energy": [
                "Genjutsu"
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
                    "statusId": "haruno_sakura_clone_technique",
                    "duration": 3,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "damageReductionFlat": 10,
                        "skillTargetOverrides": {
                            "haruno-sakura-kunai-interference": "all-enemy",
                            "haruno-sakura-guard-duty": "all-allies"
                        },
                        "tooltipText": "Sakura has 10 damage reduction. Kunai Interference affects all enemies and Guard Duty affects all allies."
                    }
                }
            ]
        },
        {
            "id": "haruno-sakura-sakura-hide",
            "name": "Sakura Hide",
            "skillimage": "https://i.imgur.com/MJNI438.png",
            "skilldescription": "This skill makes Sakura Haruno invulnerable for 1 turn.",
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
                        "helpful": true,
                        "invulnerable": true,
                        "tooltipText": "This character is invulnerable."
                    }
                }
            ]
        }
    ]
};
