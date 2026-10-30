module.exports = {
    "id": "temari-s",
    "characterId": "temari-s",
    "name": "Temari (S)",
    "facePicture": "https://i.imgur.com/hTu7W3f.png",
    "characterdeescription": "Temari has grown over the years. She is now a Jounin as well as the sister of Kankuro and Gaara. Temari is also the Hidden Sand Village's ambassador to the Hidden Leaf Village.",
    "requiredMissionId": "the-third-sand-sibling",
    "skills": [
        {
            "id": "temari-s-first-moon",
            "name": "First Moon",
            "skillimage": "https://i.imgur.com/7z5yOKa.png",
            "skilldescription": "'Wind Scythe' will deal 5 additional damage permanently. Temari (S) gains 15 points of damage reduction permanently and this skill becomes 'Second Moon' permanently when used.",
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
                    "statusId": "temari_s_first_moon_active",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "damageReductionFlat": 15,
                        "skillDamageBonuses": {
                            "temari-s-wind-scythe": 5
                        },
                        "skillReplacements": {
                            "temari-s-first-moon": "temari-s-second-moon"
                        },
                        "tooltipText": "First Moon active: 15 damage reduction, Wind Scythe deals +5 damage."
                    }
                }
            ]
        },
        {
            "id": "temari-s-ally-protection",
            "name": "Ally Protection",
            "skillimage": "https://i.imgur.com/iQYMkJx.png",
            "skilldescription": "Temari (S) targets one ally. For 1 turn, that ally will gain 20 points of damage reduction and they cannot be killed.",
            "energy": [
                "Random"
            ],
            "target": "single-ally",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "temari_s_ally_protection_buff",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "helpful": true,
                        "damageReductionFlat": 20,
                        "cannotBeKilled": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character has 20 damage reduction and cannot be killed for 1 turn."
                    }
                }
            ]
        },
        {
            "id": "temari-s-wind-scythe",
            "name": "Wind Scythe",
            "skillimage": "https://i.imgur.com/t5cDkdF.png",
            "skilldescription": "Temari (S) deals 25 damage to one enemy.",
            "energy": [
                "Ninjutsu"
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
            "id": "temari-s-fan-offensive-defense",
            "name": "Fan Offensive Defense",
            "skillimage": "https://i.imgur.com/zAC9lgX.png",
            "skilldescription": "Temari (S) becomes invulnerable for 1 turn.",
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
                    "statusId": "temari_s_fan_offensive_defense_invul",
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
            "id": "temari-s-second-moon",
            "name": "Second Moon",
            "skillimage": "https://i.imgur.com/yim1I1h.png",
            "skilldescription": "Temari (S) ends 'First Moon'. Temari (S) gains 5 points of damage reduction and 10 points of unpierceable damage reduction permanently and 'Wind Scythe' will deal 10 additional damage permanently. This skill becomes 'Third Moon' permanently when used.",
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
                    "type": "remove_status",
                    "statusId": "temari_s_first_moon_active",
                    "scope": "self"
                },
                {
                    "type": "apply_status",
                    "statusId": "temari_s_second_moon_active",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "damageReductionFlat": 5,
                        "damageReductionUnpierceableFlat": 10,
                        "skillDamageBonuses": {
                            "temari-s-wind-scythe": 10
                        },
                        "skillReplacements": {
                            "temari-s-first-moon": "temari-s-third-moon",
                            "temari-s-second-moon": "temari-s-third-moon"
                        },
                        "tooltipText": "Second Moon active: 5 DR, 10 unpierceable DR, Wind Scythe deals +10 damage."
                    }
                }
            ]
        },
        {
            "id": "temari-s-third-moon",
            "name": "Third Moon",
            "skillimage": "https://i.imgur.com/IJVBvYr.png",
            "skilldescription": "Temari (S) deals 20 damage to all enemies and makes them deal 5 less damage for 1 turn.",
            "energy": [
                "Ninjutsu",
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
                    "amount": 20,
                    "scope": "all-enemy"
                },
                {
                    "type": "apply_status",
                    "statusId": "temari_s_third_moon_weaken",
                    "duration": 1,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "damageDealtFlatModifier": -5,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character deals 5 less damage."
                    }
                }
            ]
        }
    ]
};
