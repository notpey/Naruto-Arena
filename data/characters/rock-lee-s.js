module.exports = {
    "id": "rock-lee-s",
    "characterId": "rock-lee-s",
    "name": "Rock Lee (S)",
    "facePicture": "https://i.imgur.com/n9iULjL.png",
    "characterdeescription": "Now a chuunin, Lee has trained endlessly with Gai, and not only learned new abilities, but has learned what it truly means to fight. In battle, Lee now fights for his friends and allies, growing stronger as they fall around him.",
    "requiredMissionId": "a-genius-of-hard-work",
    "skills": [
        {
            "id": "rock-lee-s-leaf-rising-wind",
            "name": "Leaf Rising Wind",
            "skillimage": "https://i.imgur.com/ZmY4vF1.png",
            "skilldescription": "Rock Lee (S) targets one enemy, dealing 15 damage to them and lowering their non-affliction damage by 10 for 2 turns. This skill will deal 10 additional damage, and the damage reduction effect will last 1 additional turn for each ally that is dead.",
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
                    "amount": 15,
                    "scope": "target"
                },
                {
                    "type": "damage_per_dead_ally",
                    "amountPerDeadAlly": 10,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "rock_lee_s_leaf_rising_wind_weaken",
                    "duration": 2,
                    "durationPerDeadAllyBonus": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "damageDealtFlatModifier": -10,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character deals 10 less non-affliction damage."
                    }
                }
            ]
        },
        {
            "id": "rock-lee-s-leaf-great-whirlwind",
            "name": "Leaf Great Whirlwind",
            "skillimage": "https://i.imgur.com/t2sNHYG.png",
            "skilldescription": "Rock Lee (S) targets one enemy, dealing 20 damage to one enemy and gaining 10 points of damage reduction for 1 turn. The following turn, this skill will deal 10 additional damage and grant 10 additional damage reduction. This skill will deal 5 additional damage for every ally that has been killed.",
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
                },
                {
                    "type": "damage",
                    "amount": 10,
                    "scope": "target",
                    "condition": {
                        "scope": "self",
                        "hasStatusId": "rock_lee_s_leaf_great_whirlwind_momentum"
                    }
                },
                {
                    "type": "damage_per_dead_ally",
                    "amountPerDeadAlly": 5,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "rock_lee_s_leaf_great_whirlwind_defense",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "damageReductionFlat": 10,
                        "tooltipText": "Lee has 10 damage reduction."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "rock_lee_s_leaf_great_whirlwind_momentum",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "turnDurationAnchor": "source_turn",
                        "damageReductionFlat": 10,
                        "tooltipText": "Empowers Leaf Great Whirlwind for the following turn with 10 damage reduction."
                    }
                }
            ]
        },
        {
            "id": "rock-lee-s-maximum-force-blast",
            "name": "Maximum Force Blast",
            "skillimage": "https://i.imgur.com/j35nh5A.png",
            "skilldescription": "Rock Lee (S) targets one enemy, dealing 20 damage to them. This skill will deal 15 additional damage for each ally that is dead and 15 additional damage for every 30 health that Rock Lee (S) has lost.",
            "energy": [
                "Random",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 2,
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
                    "type": "damage_per_dead_ally",
                    "amountPerDeadAlly": 15,
                    "scope": "target"
                },
                {
                    "type": "damage_per_lost_health_threshold",
                    "threshold": 30,
                    "amountPerThreshold": 15,
                    "scope": "target"
                }
            ]
        },
        {
            "id": "rock-lee-s-jumping-dodge",
            "name": "Jumping Dodge",
            "skillimage": "https://i.imgur.com/y6PYTiZ.png",
            "skilldescription": "This skill makes Rock Lee (S) invulnerable for 1 turn.",
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
                    "statusId": "rock_lee_s_jumping_dodge_invul",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "invulnerable": true,
                        "tooltipText": "This character is invulnerable."
                    }
                }
            ]
        }
    ]
};
