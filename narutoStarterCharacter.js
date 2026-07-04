(function (root, factory) {
    const character = factory();
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = character;
    } else {
        root.NARUTO_STARTER_CHARACTER = character;
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    return {
        "id": "uzumaki-naruto",
        "characterId": "uzumaki-naruto",
        "name": "Uzumaki Naruto",
        "facePicture": "https://i.imgur.com/jp3OIOA.png",
        "characterdeescription": "A Genin from Team 7, Naruto is an orphan with the goal to one day become Hokage. Using his signature move, Shadow Clones, Naruto is able to perform powerful moves such as the Uzumaki Naruto Combo and the Rasengan.",
        "skills": [
            {
                "id": "uzumaki-naruto-combo",
                "name": "Uzumaki Naruto Combo",
                "skillimage": "https://i.imgur.com/wZVMrBY.png",
                "skilldescription": "Uzumaki Naruto deals 20 damage to one enemy. During 'Shadow Clones' this skill will deal 10 additional damage.",
                "energy": [
                    "Taijutsu"
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
                    }
                ]
            },
            {
                "id": "uzumaki-naruto-overwhelming-chakra-wave",
                "name": "Overwhelming Chakra Wave",
                "skillimage": "https://i.imgur.com/N1LUxVU.png",
                "skilldescription": "Uzumaki Naruto will gain 1 random chakra after 1 turn. For 1 turn 'Uzumaki Naruto Combo' and 'Rasengan' will be unable to be used.",
                "energy": [],
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
                        "statusId": "uzumaki_naruto_overwhelming_chakra_wave_lock",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "cannotUseSkillIndices": [
                                0,
                                4
                            ],
                            "tooltipText": "Uzumaki Naruto Combo and Rasengan cannot be used."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "uzumaki_naruto_overwhelming_chakra_wave_pending",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "turnDurationAnchor": "any_turn",
                            "tooltipText": "Naruto will gain 1 random chakra after 1 turn.",
                            "onExpireEffects": [
                                {
                                    "type": "gain_chakra",
                                    "chakraType": "random",
                                    "amount": 1
                                }
                            ]
                        }
                    }
                ]
            },
            {
                "id": "uzumaki-naruto-shadow-clones",
                "name": "Shadow Clones",
                "skillimage": "https://i.imgur.com/eQSV2d1.png",
                "skilldescription": "Uzumaki Naruto gains 15 points of damage reduction for 4 turns. For 3 turns 'Uzumaki Naruto Combo' will deal 10 additional damage and this skill will be replaced by 'Rasengan'.",
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
                        "statusId": "uzumaki_naruto_shadow_clones_defense",
                        "duration": 4,
                        "scope": "self",
                        "metadata": {
                            "damageReductionFlat": 15,
                            "tooltipText": "Naruto has 15 damage reduction."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "uzumaki_naruto_shadow_clones_active",
                        "duration": 3,
                        "scope": "self",
                        "metadata": {
                            "skillDamageBonuses": {
                                "uzumaki-naruto-combo": 10
                            },
                            "skillReplacements": {
                                "uzumaki-naruto-shadow-clones": "uzumaki-naruto-rasengan"
                            },
                            "tooltipText": "Uzumaki Naruto Combo deals 10 additional damage and Shadow Clones is replaced by Rasengan."
                        }
                    }
                ]
            },
            {
                "id": "uzumaki-naruto-sexy-technique",
                "name": "Sexy Technique",
                "skillimage": "https://i.imgur.com/BgiSFsF.png",
                "skilldescription": "This skill makes Uzumaki Naruto invulnerable for 1 turn.",
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
                "id": "uzumaki-naruto-rasengan",
                "name": "Rasengan",
                "hiddenFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/lro3e07.png",
                "skilldescription": "Uzumaki Naruto deals 45 damage to one enemy and stuns their skills for 1 turn.",
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
                        "amount": 45,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "stunned",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkills": true,
                            "tooltipText": "This character is stunned and cannot use skills."
                        }
                    }
                ]
            }
        ]
    };
});
