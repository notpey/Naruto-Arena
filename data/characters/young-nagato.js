module.exports = {
    "id": "young-nagato",
    "characterId": "young-nagato",
    "name": "Young Nagato",
    "facePicture": "https://i.imgur.com/C1aW0e7.png",
    "characterdeescription": "The Rain Orphans were three children who lost their parents due to the Hidden Rain Village's involvement in the Second Shinobi World War. Nagato is a quiet boy who is not only afraid of the world, but also afraid of himself. ORIGINAL DESIGN: Liann",
    "requiredMissionId": null,
    "skills": [
        {
            "id": "young-nagato-wind-release-gale-palm",
            "name": "Wind Release: Gale Palm",
            "skillimage": "deadcharacter-remaster.png?v=2",
            "skilldescription": "This skill can be used on an enemy or on an ally. If used on an enemy, they will take 20 damage and then the invulnerability effects of their new skills will last 1 less turn for 2 turns. If used on an ally, that character will deal 10 additional damage with physical and energy skills for 2 turns.",
            "energy": [
                "Ninjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Ninjutsu",
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
                    "statusId": "young_nagato_gale_palm_debuff",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "invulnerabilityDurationReduction": 1,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "The invulnerability effects of this character's new skills will last 1 less turn for 2 turns."
                    }
                }
            ]
        },
        {
            "id": "young-nagato-rinnegan-domination",
            "name": "Rinnegan Domination",
            "skillimage": "deadcharacter-remaster.png?v=2",
            "skilldescription": "Young Nagato deals 20 piercing damage to one enemy. This skill ignores invulnerability and cannot be countered or reflected.",
            "energy": [
                "Random"
            ],
            "target": "single-enemy",
            "cannotBeCountered": true,
            "cannotBeReflected": true,
            "ignoreInvulnerability": true,
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 20,
                    "scope": "target",
                    "metadata": {
                        "afflictionDamage": true,
                        "ignoreDamageReduction": true,
                        "ignoreDestructibleDefense": true
                    }
                }
            ]
        },
        {
            "id": "young-nagato-minor-almighty-push",
            "name": "Minor Almighty Push",
            "skillimage": "deadcharacter-remaster.png?v=2",
            "skilldescription": "Young Nagato grants his team 10 points of unpierceable damage reduction for 1 turn. This effect is applied again for every 20 health Young Nagato has lost.",
            "energy": [
                "Genjutsu"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "young_nagato_minor_almighty_push",
                    "duration": 1,
                    "scope": "all-allies",
                    "metadata": {
                        "helpful": true,
                        "unpierceableDamageReductionFlat": 10,
                        "amountFromSourceMissingHpStep": 10,
                        "amountFromSourceMissingHpDivisor": 20,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character has 10 points of unpierceable damage reduction for 1 turn (increased by 10 for every 20 health Nagato has lost)."
                    }
                }
            ]
        },
        {
            "id": "young-nagato-in-the-shadows",
            "name": "In the Shadows",
            "skillimage": "deadcharacter-remaster.png?v=2",
            "skilldescription": "This skill makes Young Nagato invulnerable for 1 turn.",
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
            "id": "young-nagato-the-rain-orphans",
            "name": "The Rain Orphans",
            "skillimage": "deadcharacter-remaster.png?v=2",
            "skilldescription": "Everytime a character uses 'Lateral Kick', 'Winding Paper Shuriken' or 'Rinnegan Domination' while having 15 or less health, the other 2 mentioned skills will also be applied on the enemy target.",
            "energy": [],
            "target": "self",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Passive"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "the_rain_orphans_passive",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "permanent": true,
                        "rainOrphansPassive": true,
                        "tooltipText": "Everytime a character uses Lateral Kick, Winding Paper Shuriken, or Rinnegan Domination while having 15 or less health, the other 2 mentioned skills will also be applied on the enemy target."
                    }
                }
            ]
        }
    ]
};
