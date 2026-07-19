module.exports = {
    "id": "sakon-and-ukon",
    "characterId": "sakon-and-ukon",
    "name": "Sakon and Ukon",
    "facePicture": "https://i.imgur.com/hCiXr6K.png",
    "characterdeescription": "A member of the Sound Five, Sakon, along with his brother Ukon, are nearly identical twins with a bloodline that let them live inside one another's body. Sakon and Ukon can double team an enemy, or invade another's body.",
    "requiredMissionId": "the-search-for-sakon",
    "skills": [
        {
            "id": "sakon-and-ukon-gattling-punch",
            "name": "Gattling Punch",
            "skillimage": "https://i.imgur.com/nB8CLYd.png",
            "skilldescription": "Sakon and Ukon deal 40 damage to one enemy. During 'Parasite Demon Demolition', this skill will deal 10 less damage.",
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
                    "amount": 40,
                    "scope": "target"
                }
            ]
        },
        {
            "id": "sakon-and-ukon-parasite-demon-demolition",
            "name": "Parasite Demon Demolition",
            "skillimage": "https://i.imgur.com/GGykRJS.png",
            "skilldescription": "Sakon and Ukon deal 15 affliction damage to one enemy permanently. During this time, Sakon and Ukon will gain 20 points of damage reduction, that enemy will deal 5 less non-affliction damage, and 'Gattling Punch' will deal 5 less damage while active. This skill cannot be used while active. This skill ends if 'Rest' or 'Summoning: Rashoumon' are used, or if the enemy or Sakon and Ukon die.",
            "energy": [
                "Bloodline",
                "Bloodline"
            ],
            "target": "single-enemy",
            "actorCondition": {
                "missingStatusId": "sakon_and_ukon_parasite_demon_demolition_self"
            },
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Affliction",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "sakon_and_ukon_parasite_demon_demolition_dot",
                    "duration": 99,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "afflictionDamage": true,
                        "turnEndDamage": 15,
                        "turnEndTrigger": "source_turn",
                        "tooltipText": "This character takes 15 affliction damage and deals 5 less non-affliction damage from Parasite Demon Demolition.",
                        "NonAfflictionDamageDebuff": 5
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "sakon_and_ukon_parasite_demon_demolition_self",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "damageReductionFlat": 20,
                        "skillDamageBonuses": {
                            "sakon-and-ukon-gattling-punch": -5
                        },
                        "tooltipText": "Sakon and Ukon have 20 damage reduction and Gattling Punch deals 5 less damage."
                    }
                }
            ]
        },
        {
            "id": "sakon-and-ukon-rest",
            "name": "Rest",
            "skillimage": "https://i.imgur.com/rDxLn5c.png",
            "skilldescription": "Sakon and Ukon heal themselves for 25 health. If 'Parasite Demon Demolition' is active, they heal 35 health instead and it will end.",
            "energy": [
                "Bloodline",
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
                    "type": "heal",
                    "amount": 25,
                    "scope": "self",
                    "condition": {
                        "scope": "self",
                        "missingStatusId": "sakon_and_ukon_parasite_demon_demolition_self"
                    }
                },
                {
                    "type": "heal",
                    "amount": 35,
                    "scope": "self",
                    "condition": {
                        "scope": "self",
                        "statusId": "sakon_and_ukon_parasite_demon_demolition_self"
                    }
                },
                {
                    "type": "cleanse_statuses",
                    "scope": "self",
                    "statusId": "sakon_and_ukon_parasite_demon_demolition_self",
                    "count": 1
                },
                {
                    "type": "cleanse_statuses",
                    "scope": "all-enemy",
                    "statusId": "sakon_and_ukon_parasite_demon_demolition_dot",
                    "count": 1
                }
            ]
        },
        {
            "id": "sakon-and-ukon-summoning-rashoumon",
            "name": "Summoning: Rashoumon",
            "skillimage": "https://i.imgur.com/Py47f2p.png",
            "skilldescription": "This skill makes Sakon and Ukon invulnerable for 1 turn. If 'Parasite Demon Demolition' is active, it will end.",
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
                },
                {
                    "type": "cleanse_statuses",
                    "scope": "self",
                    "statusId": "sakon_and_ukon_parasite_demon_demolition_self",
                    "count": 1
                },
                {
                    "type": "cleanse_statuses",
                    "scope": "all-enemy",
                    "statusId": "sakon_and_ukon_parasite_demon_demolition_dot",
                    "count": 1
                }
            ]
        }
    ]
};
