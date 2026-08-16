module.exports = {
    "id": "uzumaki-naruto-s",
    "characterId": "uzumaki-naruto-s",
    "name": "Uzumaki Naruto (S)",
    "facePicture": "https://i.imgur.com/K0gVNTu.png",
    "characterdeescription": "Having trained with Jiraya for almost three years, Naruto has grown, both mentally and physically. With his training behind him, Naruto is able to utilize his clones even more, granting him strong defense while augmenting his already powerful rasengan.",
    "requiredMissionId": "the-prodigal-son-returns",
    "skills": [
        {
            "id": "uzumaki-naruto-s-oodama-rasengan",
            "name": "Oodama Rasengan",
            "skillimage": "https://i.imgur.com/fYmYPhq.png",
            "skilldescription": "Uzumaki Naruto (S) deals 40 damage to one enemy. This skill ignores invulnerability.",
            "energy": [
                "Taijutsu",
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
                    "amount": 40,
                    "scope": "target",
                    "metadata": {
                        "ignoreInvulnerability": true
                    }
                }
            ],
            "ignoreInvulnerability": true
        },
        {
            "id": "uzumaki-naruto-s-mass-shadow-clones",
            "name": "Mass Shadow Clones",
            "skillimage": "https://i.imgur.com/XvBwj6z.png",
            "skilldescription": "The following turn, Uzumaki Naruto (S) will counter the first new harmful skill used on him and 'Oodama Rasengan' will be replaced by 'Rasenshuriken'. This skill is invisible.",
            "energy": [
                "Random"
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
                    "statusId": "uzumaki_naruto_s_mass_shadow_clones_trap",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "invisible": true,
                        "triggerOnEnemyHarmfulSkill": true,
                        "counterStatusId": "uzumaki_naruto_s_countered_by_mass_shadow_clones",
                        "counterStatusDuration": 2,
                        "counterStatusMetadata": {
                            "harmful": true,
                            "tooltipText": "Countered by Mass Shadow Clones. Takes 50 additional damage from Rasenshuriken."
                        },
                        "counterApplyStatusToSourceOwner": {
                            "statusId": "uzumaki_naruto_s_rasenshuriken_active",
                            "duration": 1,
                            "metadata": {
                                "helpful": true,
                                "skillReplacements": {
                                    "uzumaki-naruto-s-oodama-rasengan": "uzumaki-naruto-s-rasenshuriken"
                                },
                                "tooltipText": "Oodama Rasengan is replaced by Rasenshuriken."
                            }
                        },
                        "tooltipText": "Naruto will counter the first harmful skill used on him next turn."
                    }
                }
            ]
        },
        {
            "id": "uzumaki-naruto-s-chakra-boost",
            "name": "Chakra Boost",
            "skillimage": "https://i.imgur.com/CbWBxfA.png",
            "skilldescription": "Uzumaki Naruto (S) removes all harmful skills on him then gains 2 random energies. The following turn, Uzumaki Naruto (S) will gain 10 points of damage reduction and 'Oodama Rasengan' will cost 2 random energies.",
            "energy": [
                "Random",
                "Random"
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
                    "type": "remove_status",
                    "scope": "self",
                    "metadata": {
                        "harmfulOnly": true
                    }
                },
                {
                    "type": "gain_chakra",
                    "chakraType": "random",
                    "amount": 2,
                    "scope": "self"
                },
                {
                    "type": "apply_status",
                    "statusId": "uzumaki_naruto_s_chakra_boost_buff",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "damageReductionFlat": 10,
                        "skillCostOverridesBySkillId": {
                            "uzumaki-naruto-s-oodama-rasengan": {
                                "energy": [
                                    "Random",
                                    "Random"
                                ]
                            }
                        },
                        "tooltipText": "Naruto has 10 damage reduction and Oodama Rasengan costs 2 random energy."
                    }
                }
            ]
        },
        {
            "id": "uzumaki-naruto-s-shadow-clone-save",
            "name": "Shadow Clone Save",
            "skillimage": "https://i.imgur.com/xw8NvvK.png",
            "skilldescription": "This skill makes Uzumaki Naruto (S) invulnerable for 1 turn.",
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
                    "statusId": "uzumaki_naruto_s_shadow_clone_save_invul",
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
            "id": "uzumaki-naruto-s-rasenshuriken",
            "name": "Rasenshuriken",
            "skillimage": "https://i.imgur.com/KMSMh17.png",
            "skilldescription": "Uzumaki Naruto (S) deals 50 piercing damage to one enemy. This skill deals 50 additional damage to an enemy countered by 'Mass Shadow Clones'. This skill ignores invulnerability.",
            "energy": [
                "Taijutsu",
                "Ninjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Chakra",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 50,
                    "scope": "target",
                    "metadata": {
                        "ignoreDamageReduction": true,
                        "ignoreInvulnerability": true
                    }
                },
                {
                    "type": "damage",
                    "amount": 50,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "hasStatusId": "uzumaki_naruto_s_countered_by_mass_shadow_clones"
                    },
                    "metadata": {
                        "ignoreDamageReduction": true,
                        "ignoreInvulnerability": true
                    }
                }
            ],
            "ignoreInvulnerability": true
        }
    ]
};
