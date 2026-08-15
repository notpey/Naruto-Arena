module.exports = {
    "id": "orochimaru-s",
    "characterId": "orochimaru-s",
    "name": "Orochimaru (S)",
    "facePicture": "deadcharacter.png",
    "characterdeescription": "Orochimaru returns, strong as ever and with some new tricks up his sleeve, but his body seems to be on borrowed time.",
    "requiredMissionId": "return-of-the-snake",
    "skills": [
        {
            "id": "orochimaru-s-second-skin",
            "name": "Second Skin",
            "skillimage": "deadcharacter.png",
            "skilldescription": "Orochimaru (S) sets his health to 100 (this is a healing effect). This skill will be replaced by 'Triple Rashoumon' permanently.",
            "energy": [
                "Ninjutsu"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "set_health",
                    "amount": 100,
                    "isHealingEffect": true,
                    "scope": "self"
                },
                {
                    "type": "apply_status",
                    "statusId": "orochimaru_s_triple_rashoumon_permanent_replacement",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillReplacements": {
                            "orochimaru-s-second-skin": "orochimaru-s-triple-rashoumon"
                        },
                        "tooltipText": "Second Skin replaced by Triple Rashoumon."
                    }
                }
            ]
        },
        {
            "id": "orochimaru-s-sword-snake-horde",
            "name": "Sword Snake Horde",
            "skillimage": "deadcharacter.png",
            "skilldescription": "Orochimaru (S) deals 20 affliction damage to one enemy. For 1 turn, the stun effects of their skills will last 1 turn less.",
            "energy": [
                "Bloodline"
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
                        "afflictionDamage": true,
                        "ignoreDamageReduction": true,
                        "ignoreDestructibleDefense": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "orochimaru_s_sword_snake_horde_stun_reduction",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "stunDurationReduction": 1,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "Stun effects of skills last 1 turn less for 1 turn."
                    }
                }
            ]
        },
        {
            "id": "orochimaru-s-extended-kusanagi",
            "name": "Extended Kusanagi",
            "skillimage": "deadcharacter.png",
            "skilldescription": "Orochimaru (S) targets one enemy. That enemy has their non-mental skills stunned for 2 turns. During this time, this enemy takes 20 piercing damage each turn.",
            "energy": [
                "Taijutsu",
                "Bloodline"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Physical",
                "Control"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "orochimaru_s_extended_kusanagi_control",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "control": true,
                        "ongoingClass": "control",
                        "damagePerTurn": 20,
                        "ignoreDamageReduction": true,
                        "cannotUseSkillClasses": [
                            "physical",
                            "energy",
                            "strategic",
                            "ninjutsu"
                        ],
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character is stunned for non-mental skills and takes 20 piercing damage per turn."
                    }
                }
            ]
        },
        {
            "id": "orochimaru-s-ground-mobility",
            "name": "Ground Mobility",
            "skillimage": "deadcharacter.png",
            "skilldescription": "This skill makes Orochimaru (S) invulnerable for 1 turn.",
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
                    "statusId": "orochimaru_s_ground_mobility_invul",
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
            "id": "orochimaru-s-triple-rashoumon",
            "name": "Triple Rashoumon",
            "skillimage": "deadcharacter.png",
            "skilldescription": "Orochimaru (S) targets both teams. For 2 turns, Orochimaru (S)'s team will be invulnerable to harmful skills. For 1 turn, the enemy team will be invulnerable to harmful skills. This skill cannot be countered or reflected.",
            "energy": [
                "Ninjutsu",
                "Ninjutsu",
                "Random"
            ],
            "target": "all-characters",
            "damage": 0,
            "cooldown": 5,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "orochimaru_s_triple_rashoumon_team_invul",
                    "duration": 2,
                    "scope": "all-ally",
                    "metadata": {
                        "helpful": true,
                        "cannotBeCountered": true,
                        "cannotBeReflected": true,
                        "invulnerableToHarmfulSkills": true,
                        "tooltipText": "Invulnerable to harmful skills for 2 turns."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "orochimaru_s_triple_rashoumon_enemy_invul",
                    "duration": 1,
                    "scope": "all-enemy",
                    "metadata": {
                        "helpful": true,
                        "cannotBeCountered": true,
                        "cannotBeReflected": true,
                        "invulnerableToHarmfulSkills": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "Invulnerable to harmful skills for 1 turn."
                    }
                }
            ]
        }
    ]
};
