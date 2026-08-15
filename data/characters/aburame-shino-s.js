module.exports = {
    "id": "aburame-shino-s",
    "characterId": "aburame-shino-s",
    "name": "Aburame Shino (S)",
    "facePicture": "deadcharacter.png",
    "characterdeescription": "Still as mysterious and secretive as ever, Shino has improved greatly over the years, learning and practicing with his loyal bugs. With his new found mastery, Shino can disable enemies even harder while slowly waiting for his bugs to erupt from their bodies and destroy them.",
    "requiredMissionId": "the-konoha-man-of-mystery",
    "skills": [
        {
            "id": "aburame-shino-s-insect-swarm",
            "name": "Insect Swarm",
            "skillimage": "deadcharacter.png",
            "skilldescription": "Aburame Shino (S) deals 15 affliction damage to one enemy for 3 turns. The following 3 turns, that enemy will be invulnerable to all friendly skills. During this time, this skill will be replaced by 'Insect Consumption'.",
            "energy": [
                "Bloodline",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Affliction",
                "Action"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "aburame_shino_s_insect_swarm_dot",
                    "duration": 3,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "action": true,
                        "ongoingClass": "action",
                        "damagePerTurn": 15,
                        "afflictionDamage": true,
                        "ignoreDamageReduction": true,
                        "ignoreDestructibleDefense": true,
                        "invulnerableToFriendlySkills": true,
                        "tooltipText": "Taking 15 affliction damage each turn and invulnerable to friendly skills."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "aburame_shino_s_insect_swarm_stance",
                    "duration": 3,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "ongoingClass": "action",
                        "skillReplacements": {
                            "aburame-shino-s-insect-swarm": "aburame-shino-s-insect-consumption"
                        },
                        "tooltipText": "Insect Swarm is active: replaced by Insect Consumption."
                    }
                }
            ]
        },
        {
            "id": "aburame-shino-s-insect-barricade",
            "name": "Insect Barricade",
            "skillimage": "deadcharacter.png",
            "skilldescription": "The following turn, the first new harmful skill used on one ally or Aburame Shino (S) will be countered, 'Parasitic Giant Beetle Infestation' will be placed on the countered enemy and then activated. If this skill does not counter an enemy skill, Aburame Shino (S) will gain 1 red energy. This skill is invisible.",
            "energy": [
                "Bloodline"
            ],
            "target": "all-allies",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "aburame_shino_s_insect_barricade_trap",
                    "duration": 1,
                    "scope": "all-ally",
                    "metadata": {
                        "invisible": true,
                        "triggerOnEnemyHarmfulSkill": true,
                        "counterStatusId": "aburame_shino_s_parasitic_beetle_active_trigger",
                        "counterStatusDuration": 1,
                        "counterStatusMetadata": {
                            "harmful": true,
                            "damageInstantPiercing": 25,
                            "tooltipText": "Infested with Parasitic Giant Beetles for 25 damage."
                        },
                        "onExpireIfUnusedEffects": [
                            {
                                "type": "gain_chakra",
                                "chakraType": "taijutsu",
                                "amount": 1,
                                "scope": "self"
                            }
                        ],
                        "tooltipText": "The first harmful skill targeting this ally next turn will be countered for 25 damage, or Shino gains 1 energy."
                    }
                }
            ]
        },
        {
            "id": "aburame-shino-s-parasitic-giant-beetle-infestation",
            "name": "Parasitic Giant Beetle Infestation",
            "skillimage": "deadcharacter.png",
            "skilldescription": "Aburame Shino (S) targets one enemy. After 3 turns, they will take 25 affliction damage and all other copies of this skill on them will be activated. This skill is invisible.",
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
                    "type": "apply_status",
                    "statusId": "aburame_shino_s_parasitic_beetle_pending",
                    "duration": 3,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "invisible": true,
                        "turnDurationAnchor": "any_turn",
                        "onExpireEffects": [
                            {
                                "type": "damage",
                                "amount": 25,
                                "scope": "target",
                                "metadata": {
                                    "afflictionDamage": true,
                                    "ignoreDamageReduction": true,
                                    "ignoreDestructibleDefense": true
                                }
                            }
                        ],
                        "tooltipText": "Parasitic Giant Beetles will erupt after 3 turns for 25 affliction damage."
                    }
                }
            ]
        },
        {
            "id": "aburame-shino-s-insect-cocoon",
            "name": "Insect Cocoon",
            "skillimage": "deadcharacter.png",
            "skilldescription": "This skill makes Aburame Shino (S) invulnerable for 1 turn.",
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
                    "statusId": "aburame_shino_s_insect_cocoon_invul",
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
            "id": "aburame-shino-s-insect-consumption",
            "name": "Insect Consumption",
            "skillimage": "deadcharacter.png",
            "skilldescription": "Aburame Shino (S) steals 1 random energy from one enemy affected by 'Insect Swarm' and increases the damage that enemy receives from 'Insect Swarm' by 5 that turn.",
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
                    "type": "steal_chakra",
                    "chakraType": "random",
                    "amount": 1,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "hasStatusId": "aburame_shino_s_insect_swarm_dot"
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "aburame_shino_s_insect_consumption_amp",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "bonusDamageFromSourceSkillsFlat": 5,
                        "bonusDamageAppliesToSkillIds": [
                            "aburame-shino-s-insect-swarm"
                        ],
                        "tooltipText": "Takes 5 additional damage from Insect Swarm this turn."
                    }
                }
            ]
        }
    ]
};
