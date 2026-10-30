module.exports = {
    "id": "deidara",
    "characterId": "deidara",
    "name": "Deidara",
    "facePicture": "https://i.imgur.com/Wgw4vZ4.png",
    "characterdeescription": "A former ninja of the Earth Village and now a junior Akatsuki member, Deidara is able to fuse clay and chakra to create devastating explosives. ORIGINAL DESIGN: Liann",
    "requiredMissionId": "a-true-artist",
    "skills": [
        {
            "id": "deidara-c1-birds",
            "name": "C1: Birds",
            "skillimage": "https://i.imgur.com/N4ocNTw.png",
            "skilldescription": "Deidara deals 10 piercing damage to one enemy for 2 turns. During this skill Deidara will be invulnerable to mental skills and this enemy's energy skills will deal 10 less damage*. 'Art is a Bang!' will deal 5 additional damage permanently*. This effect stacks.",
            "energy": [
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Chakra",
                "Action",
                "Instant*"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "deidara_c1_birds_action_dot",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "action": true,
                        "ongoingClass": "action",
                        "damagePerTurn": 10,
                        "ignoreDamageReduction": true,
                        "skillClassDamageDealtModifiers": {
                            "energy": -10
                        },
                        "tooltipText": "This character takes 10 piercing damage each turn, and their Energy skills deal 10 less damage."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "deidara_c1_birds_mental_invul",
                    "duration": 2,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "ongoingClass": "action",
                        "invulnerableToMentalSkills": true,
                        "tooltipText": "This character is invulnerable to Mental skills."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "deidara_art_is_a_bang_boost",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "ongoingClass": "action",
                        "stackable": true,
                        "skillDamageBonuses": {
                            "deidara-art-is-a-bang": 5
                        },
                        "tooltipText": "Art is a Bang! deals +5 additional damage permanently."
                    }
                }
            ]
        },
        {
            "id": "deidara-c1-centipede",
            "name": "C1: Centipede",
            "skillimage": "https://i.imgur.com/zAYKfoK.png",
            "skilldescription": "Deidara deals 25 piercing damage to one enemy. For 1 turn Deidara will be invulnerable to energy skills and this enemy's physical skills will deal 10 less damage. 'Art is a Bang!' will deal 5 additional damage permanently. This effect stacks.",
            "energy": [
                "Ninjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Chakra",
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
                    "statusId": "deidara_c1_centipede_energy_invul",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "invulnerableToEnergySkills": true,
                        "tooltipText": "This character is invulnerable to Energy skills."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "deidara_c1_centipede_physical_weaken",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "skillClassDamageDealtModifiers": {
                            "physical": -10
                        },
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "Physical skills deal 10 less damage for 1 turn."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "deidara_art_is_a_bang_boost",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "stackable": true,
                        "skillDamageBonuses": {
                            "deidara-art-is-a-bang": 5
                        },
                        "tooltipText": "Art is a Bang! deals +5 additional damage permanently."
                    }
                }
            ]
        },
        {
            "id": "deidara-art-is-a-bang",
            "name": "Art is a Bang!",
            "skillimage": "https://i.imgur.com/ldD9EAu.png",
            "skilldescription": "Deidara deals 25 piercing damage to all enemies. Deidara will instantly die after this skill is used. This skill cannot be countered or reflected and its self-death effect cannot be ignored.",
            "energy": [
                "Bloodline",
                "Ninjutsu"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Chakra",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 25,
                    "scope": "all-enemy",
                    "metadata": {
                        "ignoreDamageReduction": true,
                        "cannotBeCountered": true,
                        "cannotBeReflected": true
                    }
                },
                {
                    "type": "instant_kill",
                    "scope": "self",
                    "metadata": {
                        "cannotBeIgnored": true
                    }
                }
            ]
        },
        {
            "id": "deidara-clay-mold",
            "name": "Clay Mold",
            "skillimage": "https://i.imgur.com/5z4UE9Q.png",
            "skilldescription": "Deidara gains 5 points of permanent destructible defense. This effect stacks. The first time this skill is used, it replaces 'C1: Birds' and 'C1: Centipede' with their alternative versions. The second time this skill is used Deidara's skills will revert back to their original versions.",
            "energy": [],
            "target": "self",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "deidara_clay_mold_stance",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePoints": 5,
                        "destructibleDefensePermanent": true,
                        "deidaraClayMoldToggle": true,
                        "tooltipText": "Deidara has molded clay granting 5 destructible defense: alternate skills toggled."
                    }
                }
            ]
        },
        {
            "id": "deidara-c3-statue",
            "name": "C3: Statue",
            "skillimage": "https://i.imgur.com/JmF9ILU.png",
            "skilldescription": "Deidara deals 35 piercing damage to one enemy. For 1 turn Deidara will be invulnerable to physical skills and this enemy's mental skills will deal 10 less damage. 'Art is a Bang!' will deal 5 additional damage permanently. This effect stacks.",
            "energy": [
                "Ninjutsu",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Chakra",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 35,
                    "scope": "target",
                    "metadata": {
                        "ignoreDamageReduction": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "deidara_c3_statue_physical_invul",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "invulnerableToPhysicalSkills": true,
                        "tooltipText": "This character is invulnerable to Physical skills."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "deidara_c3_statue_mental_weaken",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "skillClassDamageDealtModifiers": {
                            "mental": -10
                        },
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "Mental skills deal 10 less damage for 1 turn."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "deidara_art_is_a_bang_boost",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "stackable": true,
                        "skillDamageBonuses": {
                            "deidara-art-is-a-bang": 5
                        },
                        "tooltipText": "Art is a Bang! deals +5 additional damage permanently."
                    }
                }
            ]
        },
        {
            "id": "deidara-c2-dragon",
            "name": "C2: Dragon",
            "skillimage": "https://i.imgur.com/vXzUE7g.png",
            "skilldescription": "For 2 turns, all enemies will take 10 piercing damage if they use a new skill. During this time they will take 5 additional damage from energy skills and 'Clay Mold' will grant 10 additional destructible defense.",
            "energy": [
                "Random",
                "Random"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Chakra",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "deidara_c2_dragon_field",
                    "duration": 2,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "damageOnSkillUsePiercing": 10,
                        "damageTakenFromSkillClassModifiers": {
                            "energy": 5
                        },
                        "tooltipText": "This character takes 10 piercing damage when using a skill and 5 additional damage from Energy skills."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "deidara_c2_dragon_clay_mold_amp",
                    "duration": 2,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "clayMoldExtraDefense": 10,
                        "tooltipText": "Clay Mold grants 10 additional destructible defense."
                    }
                }
            ]
        }
    ]
};
