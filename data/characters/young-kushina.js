module.exports = {
    "id": "young-kushina",
    "characterId": "young-kushina",
    "name": "Young Kushina",
    "facePicture": "https://i.imgur.com/DyZ6C5C.png",
    "characterdeescription": "Kushina is a kunoichi from the Hidden Leaf Village originated from the Hidden Eddy Village's Uzumaki Clan. Due to her special origins, Kushina has a red colored hair that constantly puts her into trouble. ORIGINAL DESIGN: TheDarkLegend",
    "requiredMissionId": null,
    "skills": [
        {
            "id": "young-kushina-red-hot-habanero-rage",
            "name": "Red-Hot Habanero Rage",
            "skillimage": "deadcharacter-remaster.png?v=2",
            "skilldescription": "Young Kushina gains 1 random energy. For 4 turns, Young Kushina gains 20 points of destructible defense and ignores enemy stun effects.",
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
                    "type": "gain_chakra",
                    "amount": 1,
                    "scope": "self"
                },
                {
                    "type": "apply_status",
                    "statusId": "young_kushina_habanero_rage",
                    "duration": 4,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePoints": 20,
                        "stunImmune": true,
                        "cannotBeStunned": true,
                        "tooltipText": "Young Kushina has 20 points of destructible defense and ignores enemy stun effects for 4 turns."
                    }
                }
            ]
        },
        {
            "id": "young-kushina-fierce-punch",
            "name": "Fierce Punch",
            "skillimage": "deadcharacter-remaster.png?v=2",
            "skilldescription": "Young Kushina destroys all of one enemy's destructible defense and then deals 20 damage to them. The following turn, 'Dropping Kick' will deal 20 additional damage and will first destroy its target's destructible defense.",
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
                    "scope": "target",
                    "metadata": {
                        "clearDestructibleDefenseFirst": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "young_kushina_fierce_punch_buff",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "hideTooltip": true,
                        "turnDurationAnchor": "source_turn"
                    }
                }
            ]
        },
        {
            "id": "young-kushina-dropping-kick",
            "name": "Dropping Kick",
            "skillimage": "deadcharacter-remaster.png?v=2",
            "skilldescription": "Young Kushina deals 10 damage to one enemy and stuns their non-strategic skills for 1 turn. The following turn, 'Fierce Punch' will deal 10 additional damage and will stun its target's non-strategic skills for 1 turn.",
            "energy": [
                "Taijutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 10,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "young_kushina_dropping_kick_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotUseNonStrategicSkills": true,
                        "cannotUseSkillClasses": [
                            "physical",
                            "ninjutsu",
                            "mental",
                            "affliction"
                        ],
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character's non-strategic skills are stunned for 1 turn."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "young_kushina_dropping_kick_buff",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "hideTooltip": true,
                        "turnDurationAnchor": "source_turn"
                    }
                }
            ]
        },
        {
            "id": "young-kushina-skilled-landing",
            "name": "Skilled Landing",
            "skillimage": "deadcharacter-remaster.png?v=2",
            "skilldescription": "Young Kushina becomes invulnerable for 1 turn.",
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
        }
    ]
};
