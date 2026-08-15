module.exports = {
    "id": "hyuuga-neji-s",
    "characterId": "hyuuga-neji-s",
    "name": "Hyuuga Neji (S)",
    "facePicture": "deadcharacter.png",
    "characterdeescription": "The only of the original genins to become a Jounin, Neji has only increased his already powerful set of abilities and skills during the near three years of time. While still being able to rely on his pressure point attacks, Neji is now also able to unleash giant waves of chakra for brutish damage as well.",
    "requiredMissionId": "pride-of-the-hyuuga",
    "skills": [
        {
            "id": "hyuuga-neji-s-eight-trigrams-vacuum-palm",
            "name": "Eight Trigrams Vacuum Palm",
            "skillimage": "deadcharacter.png",
            "skilldescription": "Hyuuga Neji (S) deals 20 damage to one enemy and removes 1 random energy from them.",
            "energy": [
                "Taijutsu",
                "Random"
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
                    "scope": "target"
                },
                {
                    "type": "remove_chakra",
                    "chakraType": "random",
                    "amount": 1,
                    "scope": "target"
                }
            ]
        },
        {
            "id": "hyuuga-neji-s-eight-trigrams-mountain-crusher",
            "name": "Eight Trigrams Mountain Crusher",
            "skillimage": "deadcharacter.png",
            "skilldescription": "Hyuuga Neji (S) targets one enemy, destroying any destructible defense they have and dealing 45 damage to them.",
            "energy": [
                "Taijutsu",
                "Bloodline"
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
                    "type": "destroy_destructible_defense",
                    "scope": "target"
                },
                {
                    "type": "damage",
                    "amount": 45,
                    "scope": "target"
                }
            ]
        },
        {
            "id": "hyuuga-neji-s-byakugan-eight-trigrams-field",
            "name": "Byakugan - Eight Trigrams Field",
            "skillimage": "deadcharacter.png",
            "skilldescription": "For 2 turns, all enemies will be unable to reduce damage or become invulnerable. For 1 turn, any enemy that uses a new harmful skill on Hyuuga Neji (S) will be countered and this skill will be replaced by 'Pressure Point Strike'. This skill is invisible.",
            "energy": [
                "Bloodline"
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
                    "statusId": "hyuuga_neji_s_eight_trigrams_enemy_debuff",
                    "duration": 2,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "cannotReduceDamage": true,
                        "cannotBecomeInvulnerable": true,
                        "tooltipText": "Cannot reduce damage or become invulnerable for 2 turns."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "hyuuga_neji_s_field_counter_trap",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "invisible": true,
                        "triggerOnEnemyHarmfulSkill": true,
                        "counterStatusId": "hyuuga_neji_s_countered_by_field",
                        "counterStatusDuration": 2,
                        "counterStatusMetadata": {
                            "harmful": true,
                            "tooltipText": "Countered by Byakugan Field."
                        },
                        "counterApplyStatusToSourceOwner": {
                            "statusId": "hyuuga_neji_s_pressure_point_strike_active",
                            "duration": 1,
                            "metadata": {
                                "helpful": true,
                                "skillReplacements": {
                                    "hyuuga-neji-s-byakugan-eight-trigrams-field": "hyuuga-neji-s-pressure-point-strike"
                                },
                                "tooltipText": "Byakugan Field is replaced by Pressure Point Strike."
                            }
                        },
                        "tooltipText": "Neji will counter the first harmful skill used on him this turn."
                    }
                }
            ]
        },
        {
            "id": "hyuuga-neji-s-byakugan-defense",
            "name": "Byakugan Defense",
            "skillimage": "deadcharacter.png",
            "skilldescription": "This skill makes Hyuuga Neji (S) invulnerable for 1 turn.",
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
                    "statusId": "hyuuga_neji_s_byakugan_defense_invul",
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
            "id": "hyuuga-neji-s-pressure-point-strike",
            "name": "Pressure Point Strike",
            "skillimage": "deadcharacter.png",
            "skilldescription": "Hyuuga Neji (S) attacks one enemy countered by 'Byakugan - Eight Trigrams Field' or this skill, dealing 5 damage and removing 1 random energy from them. The following turn this skill will deal 5 additional damage and will remain replaced. This effect stacks and is cumulative until Hyuuga Neji (S) stops using this skill.",
            "energy": [
                "Random"
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
                    "amount": 5,
                    "scope": "target"
                },
                {
                    "type": "damage_stacking_consecutive",
                    "stackAmount": 5,
                    "scope": "target"
                },
                {
                    "type": "remove_chakra",
                    "chakraType": "random",
                    "amount": 1,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "hyuuga_neji_s_pressure_point_strike_chain",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillReplacements": {
                            "hyuuga-neji-s-byakugan-eight-trigrams-field": "hyuuga-neji-s-pressure-point-strike"
                        },
                        "tooltipText": "Pressure Point Strike chain active: deals +5 additional damage next turn."
                    }
                }
            ]
        }
    ]
};
