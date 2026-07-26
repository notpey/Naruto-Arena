module.exports = {
    "id": "kyuubi-naruto",
    "characterId": "kyuubi-naruto",
    "name": "Kyuubi Naruto",
    "facePicture": "https://i.imgur.com/hOCQuU9.png",
    "characterdeescription": "Naruto's anger and desperation has forced the Kyuubi's chakra to come up to the surface, changing Naruto into a single-minded beast with a nearly endless amount of chakra. With the Kyuubi chakra around Naruto, he is able to unleash powerful waves of raw chakra to endow his power further, or gather it back to guard and heal him.",
    "requiredMissionId": "the-rise-of-a-jinchuuriki",
    "skills": [
        {
            "id": "kyuubi-naruto-kyuubi-rasengan",
            "name": "Kyuubi Rasengan",
            "skillimage": "https://i.imgur.com/X6CF3vc.png",
            "skilldescription": "Kyuubi Naruto deals 35 damage to one enemy and stuns them for 1 turn. Kyuubi Naruto will take 5 affliction damage.",
            "energy": [
                "Ninjutsu",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Ninjutsu",
                "Instant",
                "Affliction"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 35,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "kyuubi_naruto_rasengan_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkills": true,
                        "tooltipText": "This character is stunned.",
                        "turnDurationAnchor": "source_turn"
                    }
                },
                {
                    "type": "damage",
                    "amount": 5,
                    "scope": "self",
                    "metadata": {
                        "afflictionDamage": true
                    }
                }
            ]
        },
        {
            "id": "kyuubi-naruto-kyuubi-rage",
            "name": "Kyuubi Rage",
            "skillimage": "https://i.imgur.com/wAfz5KW.png",
            "skilldescription": "Kyuubi Naruto deals 15 damage to all enemies for 3 turns. During this time, 'Kyuubi Rasengan' will deal 10 additional damage. 'Kyuubi Chakra' may not be used during this time.",
            "energy": [
                "Taijutsu",
                "Bloodline"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 3,
            "actorCondition": {
                "missingStatusId": "kyuubi_naruto_chakra_buff"
            },
            "classes": [
                "Ninjutsu",
                "Action",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "kyuubi_naruto_rage_dot",
                    "duration": 3,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 15,
                        "turnEndTrigger": "source_turn",
                        "tooltipText": "This character takes 15 damage each turn from Kyuubi Rage.",
                        "ongoingClass": "action"
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kyuubi_naruto_rage_buff",
                    "duration": 3,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillDamageBonuses": {
                            "kyuubi-naruto-kyuubi-rasengan": 10
                        },
                        "tooltipText": "Kyuubi Rasengan deals 10 additional damage. Kyuubi Chakra cannot be used.",
                        "ongoingClass": "action"
                    }
                }
            ]
        },
        {
            "id": "kyuubi-naruto-kyuubi-chakra",
            "name": "Kyuubi Chakra",
            "skillimage": "https://i.imgur.com/LazNndR.png",
            "skilldescription": "Kyuubi Naruto heals himself for 15 health each turn for 5 turns. During this time, Kyuubi Naruto will gain 15 points of damage reduction and 'Kyuubi Rasengan' will deal 5 less damage. 'Kyuubi Rage' may not be used during this time.",
            "energy": [
                "Bloodline",
                "Random"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 5,
            "actorCondition": {
                "missingStatusId": "kyuubi_naruto_rage_buff"
            },
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "kyuubi_naruto_chakra_buff",
                    "duration": 5,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "turnEndHealFlat": 15,
                        "damageReductionFlat": 15,
                        "skillDamageBonuses": {
                            "kyuubi-naruto-kyuubi-rasengan": -5
                        },
                        "tooltipText": "Kyuubi Naruto heals 15 health each turn, has 15 points of damage reduction, and Kyuubi Rasengan deals 5 less damage. Kyuubi Rage cannot be used."
                    }
                }
            ]
        },
        {
            "id": "kyuubi-naruto-kyuubi-dodge",
            "name": "Kyuubi Dodge",
            "skillimage": "https://i.imgur.com/4ZFrdfW.png",
            "skilldescription": "This skill makes Kyuubi Naruto invulnerable for 1 turn.",
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
                    "statusId": "kyuubi_naruto_dodge",
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
