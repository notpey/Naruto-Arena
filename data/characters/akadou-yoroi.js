module.exports = {
    "id": "akadou-yoroi",
    "characterId": "akadou-yoroi",
    "name": "Akadou Yoroi",
    "facePicture": "https://i.imgur.com/U0Ziv1r.png",
    "characterdeescription": "A sound village genin that infiltrated Konoha as a spy, Yoroi is a capable, but brash ninja who likes to toy with his enemies. Yoroi is capable of absorbing the strength of his enemies, and make it his own in more than one way.",
    "requiredMissionId": "the-sounds-amongst-the-leaves",
    "skills": [
        {
            "id": "akadou-yoroi-energy-drain",
            "name": "Energy Drain",
            "skillimage": "https://i.imgur.com/93Ubu8K.png",
            "skilldescription": "Akadou Yoroi steals 20 health from one enemy then lowers their non-affliction damage by 5 for 2 turns. The following 2 turns, Akadou Yoroi will deal 5 additional damage with his skills.",
            "energy": [
                "Taijutsu",
                "Random"
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
                    "type": "health_steal_damage",
                    "amount": 20,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "akadou_yoroi_drain_debuff",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "nonAfflictionDamageDebuffFlat": 5,
                        "tooltipText": "This character deals 5 less non-affliction damage."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "akadou_yoroi_empowered",
                    "duration": 2,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "damageBonusFlat": 5,
                        "tooltipText": "Akadou Yoroi deals 5 additional damage with his skills."
                    }
                },
                {
                    "type": "drain_chakra_random_from_target_to_self",
                    "amount": 1,
                    "scope": "target",
                    "condition": {
                        "scope": "self",
                        "statusId": "akadou_yoroi_chakra_focus",
                        "consumeOnMatch": true
                    }
                }
            ]
        },
        {
            "id": "akadou-yoroi-draining-assault",
            "name": "Draining Assault",
            "skillimage": "https://i.imgur.com/zBoZAxl.png",
            "skilldescription": "For 3 turns, Akadou Yoroi steals 15 health from one enemy each turn. Their non-affliction damage will be lowered by 5 for 2 turns. The following 2 turns, Akadou Yoroi will deal 5 additional damage with his skills. During 'Chakra Focus', this skill also steals 1 random chakra on use.",
            "energy": [
                "Taijutsu",
                "Random",
                "Random"
            ],
            "target": "single-enemy",
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
                    "statusId": "akadou_yoroi_draining_assault_dot",
                    "duration": 3,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 15,
                        "turnEndTrigger": "source_turn",
                        "tooltipText": "This character loses 15 health each turn to Draining Assault."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "akadou_yoroi_draining_assault_heal",
                    "duration": 3,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "turnEndHealFlat": 15,
                        "tooltipText": "Akadou Yoroi heals 15 health each turn from Draining Assault."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "akadou_yoroi_drain_debuff",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "nonAfflictionDamageDebuffFlat": 5,
                        "tooltipText": "This character deals 5 less non-affliction damage."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "akadou_yoroi_empowered",
                    "duration": 2,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "damageBonusFlat": 5,
                        "tooltipText": "Akadou Yoroi deals 5 additional damage with his skills."
                    }
                },
                {
                    "type": "drain_chakra_random_from_target_to_self",
                    "amount": 1,
                    "scope": "target",
                    "condition": {
                        "scope": "self",
                        "statusId": "akadou_yoroi_chakra_focus",
                        "consumeOnMatch": true
                    }
                }
            ]
        },
        {
            "id": "akadou-yoroi-chakra-focus",
            "name": "Chakra Focus",
            "skillimage": "https://i.imgur.com/8oUT5Mk.png",
            "skilldescription": "For 3 turns, if 'Energy Drain' or 'Draining Assault' are used, they will also steal 1 random chakra. This effect is consumed when triggered.",
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
                    "statusId": "akadou_yoroi_chakra_focus",
                    "duration": 3,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "tooltipText": "Energy Drain or Draining Assault will also steal 1 random chakra."
                    }
                }
            ]
        },
        {
            "id": "akadou-yoroi-chakra-block",
            "name": "Chakra Block",
            "skillimage": "https://i.imgur.com/ubYpqC3.png",
            "skilldescription": "This skill makes Chakra invulnerable for 1 turn.",
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
