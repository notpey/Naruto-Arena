module.exports = {
    "id": "hatake-kakashi-s",
    "characterId": "hatake-kakashi-s",
    "name": "Hatake Kakashi (S)",
    "facePicture": "https://i.imgur.com/QkC8m4x.png",
    "characterdeescription": "Kakashi has not let the years pass by idle, and has trained as hard as any other, improving his sharingan and his own unique jutsu. While Kakashi's raikiri is still a potent finisher, he is now also able to rely on his kamui, aiming it at his enemies or even rescuing his allies.",
    "requiredMissionId": "from-teacher-to-partner",
    "skills": [
        {
            "id": "hatake-kakashi-s-lightning-beast-fang",
            "name": "Lightning Beast Fang",
            "skillimage": "https://i.imgur.com/rcVY3zt.png",
            "skilldescription": "Hatake Kakashi (S) deals 25 piercing damage to one enemy and stuns them for 1 turn. The following turn, this skill will be replaced by 'Finishing Raikiri'.",
            "energy": [
                "Ninjutsu",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Energy",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 25,
                    "scope": "target",
                    "metadata": {
                        "ignoreDamageReduction": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "hatake_kakashi_s_lightning_beast_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "stun": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character is stunned for 1 turn."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "hatake_kakashi_s_lightning_beast_mark",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "Marked by Lightning Beast Fang."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "hatake_kakashi_s_finishing_raikiri_active",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "turnDurationAnchor": "source_turn",
                        "skillReplacements": {
                            "hatake-kakashi-s-lightning-beast-fang": "hatake-kakashi-s-finishing-raikiri"
                        },
                        "tooltipText": "Lightning Beast Fang is replaced by Finishing Raikiri."
                    }
                }
            ]
        },
        {
            "id": "hatake-kakashi-s-kakashi-kamui",
            "name": "Kakashi Kamui",
            "skillimage": "https://i.imgur.com/5VLh0hv.png",
            "skilldescription": "If used on an enemy, they will receive 40 piercing damage, and for 1 turn their cooldowns will be increased by 1 and their skills will cost 1 additional random energy. If used on an ally or himself, all harmful effects on them will be removed and they will become invulnerable for 1 turn. This skill ignores invulnerability.",
            "energy": [
                "Bloodline",
                "Genjutsu"
            ],
            "target": "single-target",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Mental",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 40,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "isEnemy": true
                    },
                    "metadata": {
                        "ignoreDamageReduction": true,
                        "ignoreInvulnerability": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "hatake_kakashi_s_kamui_enemy_debuff",
                    "duration": 1,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "isEnemy": true
                    },
                    "metadata": {
                        "harmful": true,
                        "energyCostIncrease": {
                            "random": 1
                        },
                        "cooldownIncrease": 1,
                        "ignoreInvulnerability": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "Cooldowns increased by 1 and skills cost 1 additional random energy."
                    }
                },
                {
                    "type": "remove_status",
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "isAlly": true
                    },
                    "metadata": {
                        "harmfulOnly": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "hatake_kakashi_s_kamui_ally_invul",
                    "duration": 1,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "isAlly": true
                    },
                    "metadata": {
                        "helpful": true,
                        "invulnerable": true,
                        "tooltipText": "This character is invulnerable."
                    }
                }
            ],
            "ignoreInvulnerability": true
        },
        {
            "id": "hatake-kakashi-s-team-tactics",
            "name": "Team Tactics",
            "skillimage": "https://i.imgur.com/u6PAqZ8.png",
            "skilldescription": "For 3 turns, Hatake Kakashi (S)'s allies will have the cooldown of their skills reduced by 1. The following 3 turns, the first new harmful skill used by one enemy will be copied and will replace this skill for 1 turn. This skill cannot be reflected.",
            "energy": [
                "Random",
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
                    "statusId": "hatake_kakashi_s_team_tactics_buff",
                    "duration": 3,
                    "scope": "all-ally",
                    "metadata": {
                        "helpful": true,
                        "cannotBeReflected": true,
                        "cooldownReduction": 1,
                        "triggerOnEnemyHarmfulSkill": true,
                        "counterCopySkillReplacementFor": "hatake-kakashi-s-team-tactics",
                        "counterCopySkillReplacementDuration": 1,
                        "tooltipText": "Allies cooldowns reduced by 1."
                    }
                }
            ]
        },
        {
            "id": "hatake-kakashi-s-bunshin-stand-in",
            "name": "Bunshin Stand-in",
            "skillimage": "https://i.imgur.com/lp2Q1v2.png",
            "skilldescription": "This skill makes Hatake Kakashi (S) invulnerable for 1 turn.",
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
                    "statusId": "hatake_kakashi_s_bunshin_invul",
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
            "id": "hatake-kakashi-s-finishing-raikiri",
            "name": "Finishing Raikiri",
            "skillimage": "https://i.imgur.com/aQUkK2t.png",
            "skilldescription": "Hatake Kakashi (S) targets one enemy, dealing 30 piercing damage to them. This skill will deal 10 additional damage to that enemy if they are stunned or if 'Lightning Beast Fang' was used on them the previous turn.",
            "energy": [
                "Ninjutsu",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Energy",
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
                    "type": "damage",
                    "amount": 10,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "hasAnyStatusId": [
                            "hatake_kakashi_s_lightning_beast_stun",
                            "hatake_kakashi_s_lightning_beast_mark"
                        ]
                    },
                    "metadata": {
                        "ignoreDamageReduction": true
                    }
                }
            ]
        }
    ]
};
