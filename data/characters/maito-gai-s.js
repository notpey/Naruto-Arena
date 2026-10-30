module.exports = {
    "id": "maito-gai-s",
    "characterId": "maito-gai-s",
    "name": "Maito Gai (S)",
    "facePicture": "https://i.imgur.com/cyxLCgn.png",
    "characterdeescription": "Still the leader of Team Gai, Gai is not one to let himself fall behind in terms of training and strength. Gai no longer feels the need to go straight into the highest level of gates that he can, instead taking his time, until the time requires the green beast of Konoha to go all out.",
    "requiredMissionId": "the-green-beast",
    "skills": [
        {
            "id": "maito-gai-s-nunchaku-taijutsu",
            "name": "Nunchaku Taijutsu",
            "skillimage": "https://i.imgur.com/dHHQmGI.png",
            "skilldescription": "Maito Gai (S) deals 10 damage to one enemy for 3 turns. During this time, if an enemy uses a new harmful physical skill on Maito Gai (S), he will deal 10 damage to them.*",
            "energy": [
                "Taijutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Physical",
                "Action",
                "Instant*"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "maito_gai_s_nunchaku_action_dot",
                    "duration": 3,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "action": true,
                        "ongoingClass": "action",
                        "damagePerTurn": 10,
                        "tooltipText": "This character takes 10 physical damage each turn from Nunchaku Taijutsu."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "maito_gai_s_nunchaku_retaliation_stance",
                    "duration": 3,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "ongoingClass": "action",
                        "retaliateOnIncomingHarmfulPhysicalDamage": 10,
                        "tooltipText": "This character deals 10 damage to enemies who hit them with a Physical skill."
                    }
                }
            ]
        },
        {
            "id": "maito-gai-s-fiery-kick",
            "name": "Fiery Kick",
            "skillimage": "https://i.imgur.com/HxQ3okr.png",
            "skilldescription": "Maito Gai (S) targets one enemy, dealing 35 damage to them and reducing all non-affliction damage they deal by 20 for 1 turn.",
            "energy": [
                "Taijutsu",
                "Bloodline"
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
                    "amount": 35,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "maito_gai_s_fiery_kick_weaken",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "damageDealtFlatModifier": -20,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character deals 20 less non-affliction damage for 1 turn."
                    }
                }
            ]
        },
        {
            "id": "maito-gai-s-single-gate-release",
            "name": "Single Gate Release",
            "skillimage": "https://i.imgur.com/DSUDqoQ.png",
            "skilldescription": "Maito Gai (S) receives 5 affliction damage*, but permanently gains 5 points of damage reduction and increases the damage of 'Nunchaku Taijutsu' and 'Fiery Kick' by 5. At 6 usages of this skill, 'Fiery Kick' will be replaced by 'Morning Peacock', and at 7 usages of this skill, it will be replaced by 'Daytime Tiger'. This skill can only be used 7 times.",
            "energy": [],
            "target": "self",
            "damage": 0,
            "cooldown": 0,
            "maxUsagesPerMatch": 7,
            "classes": [
                "Strategic",
                "Instant",
                "Affliction*"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 5,
                    "scope": "self",
                    "metadata": {
                        "afflictionDamage": true,
                        "ignoreDamageReduction": true,
                        "ignoreDestructibleDefense": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "maito_gai_s_gate_stack",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "stackable": true,
                        "maxStacks": 7,
                        "damageReductionFlat": 5,
                        "skillDamageBonuses": {
                            "maito-gai-s-nunchaku-taijutsu": 5,
                            "maito-gai-s-fiery-kick": 5
                        },
                        "gaiGateProgression": true,
                        "tooltipText": "Gai has opened an Eight Gate granting 5 damage reduction, 5 skill damage, up to 7 gates."
                    }
                }
            ]
        },
        {
            "id": "maito-gai-s-muscle-block",
            "name": "Muscle Block",
            "skillimage": "https://i.imgur.com/KgkDleV.png",
            "skilldescription": "Maito Gai (S) becomes invulnerable for 1 turn.",
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
                    "statusId": "maito_gai_s_muscle_block_invul",
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
            "id": "maito-gai-s-morning-peacock",
            "name": "Morning Peacock",
            "skillimage": "https://i.imgur.com/rZHrDmS.png",
            "skilldescription": "Maito Gai (S) deals 60 damage to one enemy and stuns them for 1 turn.",
            "energy": [
                "Taijutsu",
                "Bloodline"
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
                    "amount": 60,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "maito_gai_s_morning_peacock_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "stun": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character is stunned for 1 turn."
                    }
                }
            ]
        },
        {
            "id": "maito-gai-s-daytime-tiger",
            "name": "Daytime Tiger",
            "skillimage": "https://i.imgur.com/Ip9pKpB.png",
            "skilldescription": "Maito Gai (S) deals 300 damage to one enemy.",
            "energy": [
                "Taijutsu",
                "Bloodline"
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
                    "amount": 300,
                    "scope": "target"
                }
            ]
        }
    ]
};
