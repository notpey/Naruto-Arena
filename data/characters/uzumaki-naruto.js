module.exports = {
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
            "skilldescription": "Uzumaki Naruto deals 25 damage to one enemy.",
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
                    "amount": 25,
                    "scope": "target"
                }
            ]
        },
        {
            "id": "uzumaki-naruto-overwhelming-chakra-wave",
            "name": "Overwhelming Chakra Wave",
            "skillimage": "https://i.imgur.com/N1LUxVU.png",
            "skilldescription": "Uzumaki Naruto will gain 1 random chakra after 1 turn. Permanently, 'Uzumaki Naruto Combo' and 'Rasengan' deal 5 additional damage.",
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
                    "statusId": "uzumaki_naruto_overwhelming_chakra_wave_focus",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "skillDamageBonuses": {
                            "uzumaki-naruto-combo": 5,
                            "uzumaki-naruto-rasengan": 5
                        },
                        "tooltipText": "Uzumaki Naruto Combo and Rasengan deal 5 additional damage."
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
            "skilldescription": "Uzumaki Naruto gains 10 points of damage reduction permanently and this skill is replaced by 'Rasengan'.",
            "energy": [],
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
                    "statusId": "uzumaki_naruto_shadow_clones_active",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "damageReductionFlat": 10,
                        "skillReplacements": {
                            "uzumaki-naruto-shadow-clones": "uzumaki-naruto-rasengan"
                        },
                        "tooltipText": "Naruto has 10 damage reduction\nShadow Clones is replaced by Rasengan."
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
            "skilldescription": "Uzumaki Naruto deals 35 damage to one enemy and stuns their non-strategic skills for 1 turn.",
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
                    "amount": 35,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "uzumaki_naruto_rasengan_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkillClasses": [
                            "physical",
                            "energy",
                            "mental"
                        ],
                        "tooltipText": "This character's non-strategic skills are stunned."
                    }
                }
            ]
        }
    ]
};
