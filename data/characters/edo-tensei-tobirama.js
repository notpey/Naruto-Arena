module.exports = {
    "id": "edo-tensei-tobirama",
    "characterId": "edo-tensei-tobirama",
    "name": "Edo Tensei Tobirama",
    "facePicture": "https://i.imgur.com/D1qp4Pu.png",
    "characterdeescription": "The second Hokage of the Hidden Leaf Village; Tobirama, a member of the Senju clan, puts the well being of the village and people above all else. Tobirama is a master of many jutsu, using both ninjutsu and genjutsu to stop his enemies in different ways.",
    "requiredMissionId": "the-resurrection-of-the-second",
    "skills": [
        {
            "id": "edo-tensei-tobirama-water-assault",
            "name": "Water Assault",
            "skillimage": "https://i.imgur.com/fMuYLsW.png",
            "skilldescription": "Edo Tensei Tobirama makes one enemy ignore all helpful effects except energy cost changes for 1 turn and deals 15 damage to them.",
            "energy": [
                "Ninjutsu",
                "Genjutsu"
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
                    "type": "apply_status",
                    "statusId": "edo_tensei_tobirama_water_assault_seal",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "invulnerableToHelpfulSkills": true,
                        "tooltipText": "This character ignores all helpful effects except energy cost changes."
                    }
                },
                {
                    "type": "damage",
                    "amount": 15,
                    "scope": "target"
                }
            ]
        },
        {
            "id": "edo-tensei-tobirama-water-colliding-wave",
            "name": "Water Colliding Wave",
            "skillimage": "https://i.imgur.com/rt5NJBN.png",
            "skilldescription": "Edo Tensei Tobirama deals 15 damage to all enemies for 3 turns and stuns their affliction skills each turn. During this time, 'Water Assault' will deal 15 additional damage.",
            "energy": [
                "Ninjutsu",
                "Genjutsu"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Energy",
                "Action",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "edo_tensei_tobirama_water_colliding_wave_dot",
                    "duration": 3,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 15,
                        "turnEndTrigger": "source_turn",
                        "ongoingClass": "action",
                        "cannotUseSkillClasses": [
                            "affliction"
                        ],
                        "tooltipText": "This character takes 15 damage each turn and their affliction skills are stunned."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "edo_tensei_tobirama_water_colliding_wave_buff",
                    "duration": 3,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillDamageBonuses": {
                            "edo-tensei-tobirama-water-assault": 15
                        },
                        "tooltipText": "Water Assault deals 15 additional damage.",
                        "ongoingClass": "action"
                    }
                }
            ]
        },
        {
            "id": "edo-tensei-tobirama-bringer-of-darkness",
            "name": "Bringer of Darkness",
            "skillimage": "https://i.imgur.com/Jq7lvi0.png",
            "skilldescription": "Edo Tensei Tobirama makes his team invulnerable to all physical and strategic skills for 1 turn.",
            "energy": [
                "Genjutsu"
            ],
            "target": "all-allies",
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "edo_tensei_tobirama_bringer_of_darkness",
                    "duration": 1,
                    "scope": "all-allies",
                    "metadata": {
                        "helpful": true,
                        "invulnerableToSkillClasses": [
                            "physical",
                            "strategic"
                        ],
                        "tooltipText": "This character is invulnerable to physical and strategic skills."
                    }
                }
            ]
        },
        {
            "id": "edo-tensei-tobirama-water-encampment-wall",
            "name": "Water Encampment Wall",
            "skillimage": "https://i.imgur.com/3rOMjSA.png",
            "skilldescription": "This skill makes Edo Tensei Tobirama invulnerable for 1 turn.",
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
                    "statusId": "edo_tensei_tobirama_water_encampment_wall",
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
