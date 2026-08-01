module.exports = {
    "id": "oboro",
    "characterId": "oboro",
    "name": "Oboro",
    "facePicture": "https://i.imgur.com/q3FfmTs.png",
    "characterdeescription": "A Rain Genin in the Chuunin exams, Oboro is vindictive ninja that specializes in genjutsu. Using the various illusions that Oboro creates, he is able to hide his true self while attacking from below.",
    "requiredMissionId": "yellow-flash",
    "skills": [
        {
            "id": "oboro-exploding-kunai",
            "name": "Exploding Kunai",
            "skillimage": "https://i.imgur.com/fo853Ic.png",
            "skilldescription": "Oboro deals 15 damage to all enemies and reduces their damage by 5 for 1 turn. During 'Haze Clone', this skill has no cooldown.",
            "energy": [
                "Random"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 15,
                    "scope": "all-enemy"
                },
                {
                    "type": "apply_status",
                    "statusId": "oboro_exploding_kunai_debuff",
                    "duration": 1,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "damageDebuffFlat": 5,
                        "mergeNumericAddKeys": [
                            "damageDebuffFlat"
                        ],
                        "tooltipText": "This character deals 5 less damage from Exploding Kunai."
                    }
                }
            ]
        },
        {
            "id": "oboro-earth-swim",
            "name": "Earth Swim",
            "skillimage": "https://i.imgur.com/8iLEEf6.png",
            "skilldescription": "Oboro deals 20 damage to one enemy and stuns their physical, chakra and affliction skills for 1 turn. During 'Haze Clone', this skill will target all enemies and will cost 1 less random chakra.",
            "energy": [
                "Genjutsu",
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
                    "type": "apply_status",
                    "statusId": "oboro_earth_swim_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkillClasses": [
                            "physical",
                            "energy",
                            "affliction",
                            "ninjutsu"
                        ],
                        "tooltipText": "This character's physical, chakra and affliction skills are stunned.",
                        "turnDurationAnchor": "source_turn"
                    }
                }
            ]
        },
        {
            "id": "oboro-haze-clone",
            "name": "Haze Clone",
            "skillimage": "https://i.imgur.com/6zjMsdw.png",
            "skilldescription": "Oboro gains 25 points of destructible defense for 2 turns. During this time, 'Exploding Kunai' has no cooldown and 'Earth Swim' will target all enemies.",
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
                    "statusId": "oboro_haze_clone",
                    "duration": 2,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePoints": 25,
                        "skillReplacements": {
                            "oboro-exploding-kunai": "oboro-exploding-kunai-empowered",
                            "oboro-earth-swim": "oboro-earth-swim-empowered"
                        },
                        "tooltipText": "Oboro has 25 destructible defense. 'Exploding Kunai' has no cooldown and 'Earth Swim' is improved."
                    }
                }
            ]
        },
        {
            "id": "oboro-hiding-tactics",
            "name": "Oboro Hiding Tactics",
            "skillimage": "https://i.imgur.com/VEOVr6w.png",
            "skilldescription": "This skill makes Oboro invulnerable for 1 turn.",
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
            "id": "oboro-exploding-kunai-empowered",
            "name": "Exploding Kunai",
            "hiddenFromSelectionViewer": true,
            "skillimage": "deadcharacter.png",
            "skilldescription": "Oboro deals 25 damage to all enemies and reduces their damage by 5 for 1 turn during 'Haze Clone'.",
            "energy": [
                "Random"
            ],
            "target": "all-enemy",
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
                    "scope": "all-enemy"
                },
                {
                    "type": "apply_status",
                    "statusId": "oboro_exploding_kunai_debuff",
                    "duration": 1,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "damageDebuffFlat": 5,
                        "mergeNumericAddKeys": [
                            "damageDebuffFlat"
                        ],
                        "tooltipText": "This character deals 5 less damage from Exploding Kunai.",
                        "turnDurationAnchor": "source_turn"
                    }
                }
            ]
        },
        {
            "id": "oboro-earth-swim-empowered",
            "name": "Earth Swim",
            "hiddenFromSelectionViewer": true,
            "skillimage": "deadcharacter.png",
            "skilldescription": "Oboro deals 20 damage to all enemies, stuns their physical, chakra and affliction skills for 1 turn, and lowers their damage by 5 for 1 turn during 'Haze Clone'.",
            "energy": [
                "Genjutsu"
            ],
            "target": "all-enemy",
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
                    "scope": "all-enemy"
                },
                {
                    "type": "apply_status",
                    "statusId": "oboro_earth_swim_stun",
                    "duration": 1,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkillClasses": [
                            "physical",
                            "energy",
                            "affliction",
                            "ninjutsu"
                        ],
                        "tooltipText": "This character's physical, chakra and affliction skills are stunned.",
                        "turnDurationAnchor": "source_turn"
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "oboro_earth_swim_damage_debuff",
                    "duration": 1,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "damageDebuffFlat": 5,
                        "tooltipText": "This character deals 5 less damage.",
                        "turnDurationAnchor": "source_turn"
                    }
                }
            ]
        }
    ]
};
