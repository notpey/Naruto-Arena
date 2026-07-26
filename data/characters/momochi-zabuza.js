module.exports = {
    "id": "momochi-zabuza",
    "characterId": "momochi-zabuza",
    "name": "Momochi Zabuza",
    "facePicture": "https://i.imgur.com/8OoPNPv.png",
    "characterdeescription": "Zabuza is a missing-nin from the Hidden Mist Village that specializes in silent assassination. Using the various ninjutsu abilities Zabuza has, he is able to attack his enemies all at once, or stealthily try to kill them.",
    "requiredMissionId": "devotion",
    "skills": [
        {
            "id": "momochi-zabuza-soundless-murder",
            "name": "Soundless Murder",
            "skillimage": "https://i.imgur.com/74KvAbq.png",
            "skilldescription": "Momochi Zabuza deals 30 piercing damage to one enemy. During 'Hidden Mist', this skill will deal 15 additional damage and will ignore invulnerability.",
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
                    "amount": 30,
                    "scope": "target",
                    "metadata": {
                        "ignoreDestructibleDefense": true
                    }
                }
            ]
        },
        {
            "id": "momochi-zabuza-water-dragon-missile",
            "name": "Water Dragon Missile",
            "skillimage": "https://i.imgur.com/2l9QztL.png",
            "skilldescription": "Momochi Zabuza deals 15 damage to all enemies and stuns their physical and strategic skills for 1 turn.",
            "energy": [
                "Ninjutsu",
                "Random"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Ninjutsu",
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
                    "statusId": "momochi_zabuza_water_dragon_stun",
                    "duration": 1,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkillClasses": [
                            "physical",
                            "strategic"
                        ],
                        "tooltipText": "This character's physical and strategic skills are stunned.",
                        "turnDurationAnchor": "source_turn"
                    }
                }
            ]
        },
        {
            "id": "momochi-zabuza-hidden-mist",
            "name": "Hidden Mist",
            "skillimage": "https://i.imgur.com/7mpGS0U.png",
            "skilldescription": "For 2 turns, all enemies' physical and chakra skills will cost 1 additional random chakra and Momochi Zabuza will gain 5 points of damage reduction. The following 2 turns, 'Soundless Murder' will deal 15 additional damage and will ignore invulnerability. This skill ignores invulnerability.",
            "energy": [
                "Genjutsu"
            ],
            "target": "self",
            "ignoreInvulnerability": true,
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "momochi_zabuza_hidden_mist_enemy_cost",
                    "duration": 2,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "randomCostIncreaseForSkillClasses": {
                            "physical": 1,
                            "energy": 1,
                            "ninjutsu": 1
                        },
                        "tooltipText": "This character's physical and chakra skills cost 1 additional random chakra from Hidden Mist."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "momochi_zabuza_hidden_mist_defense",
                    "duration": 2,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "damageReductionFlat": 5,
                        "mergeNumericAddKeys": [
                            "damageReductionFlat"
                        ],
                        "onExpireApplyStatusToSelf": {
                            "statusId": "momochi_zabuza_hidden_mist_empowered",
                            "duration": 2,
                            "metadata": {
                                "helpful": true,
                                "skillReplacements": {
                                    "momochi-zabuza-soundless-murder": "momochi-zabuza-soundless-murder-empowered"
                                },
                                "tooltipText": "'Soundless Murder' deals additional damage and ignores invulnerability."
                            }
                        },
                        "tooltipText": "Momochi Zabuza has 5 damage reduction from Hidden Mist."
                    }
                }
            ]
        },
        {
            "id": "momochi-zabuza-water-clone-zabuza",
            "name": "Water Clone Zabuza",
            "skillimage": "https://i.imgur.com/nl8kDkS.png",
            "skilldescription": "This skill makes Momochi Zabuza invulnerable for 1 turn.",
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
            "id": "momochi-zabuza-soundless-murder-empowered",
            "name": "Soundless Murder",
            "hiddenFromSelectionViewer": true,
            "skillimage": "deadcharacter.png",
            "skilldescription": "Momochi Zabuza deals 45 piercing damage to one enemy, ignoring invulnerability.",
            "energy": [
                "Taijutsu",
                "Random"
            ],
            "target": "single-enemy",
            "ignoreInvulnerability": true,
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 45,
                    "scope": "target",
                    "metadata": {
                        "ignoreDestructibleDefense": true
                    }
                }
            ]
        }
    ]
};
