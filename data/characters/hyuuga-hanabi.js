module.exports = {
    "id": "hyuuga-hanabi",
    "characterId": "hyuuga-hanabi",
    "name": "Hyuuga Hanabi",
    "facePicture": "https://i.imgur.com/UgOE7eF.png",
    "characterdeescription": "The younger sister of Hinata, Hanabi is a Hyuuga clan member who trains endlessly to prove herself. Hanabi's skills surpass her elder sister's, and while lacking in strength, Hanabi makes up for it with her tenacity and speed.",
    "skills": [
        {
            "id": "hyuuga-hanabi-gentle-fist",
            "name": "Hanabi Gentle Fist",
            "skillimage": "https://i.imgur.com/nPYcr3w.png",
            "skilldescription": "Hyuuga Hanabi deals 15 damage to one enemy for 2 turns. The following 2 turns, this enemy loses 1 random chakra each turn.",
            "energy": [
                "Taijutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Physical",
                "Action",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "hyuuga_hanabi_gentle_fist_dot",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 15,
                        "turnEndTrigger": "source_turn",
                        "turnDurationAnchor": "source_turn",
                        "ongoingClass": "action",
                        "triggerOnApply": true,
                        "tooltipText": "This character takes 15 damage from Gentle Fist. Afterward, this character loses 1 random chakra each turn for 2 turns.",
                        "onExpireEffects": [
                            {
                                "type": "apply_status",
                                "statusId": "hyuuga_hanabi_gentle_fist_drain",
                                "duration": 2,
                                "metadata": {
                                    "harmful": true,
                                    "turnEndRemoveRandomChakra": 1,
                                    "tooltipText": "This character loses 1 random chakra each turn from Gentle Fist."
                                }
                            }
                        ]
                    }
                }
            ]
        },
        {
            "id": "hyuuga-hanabi-eight-trigrams-revolving-heaven",
            "name": "Hanabi Eight Trigrams Revolving Heaven",
            "skillimage": "https://i.imgur.com/peE9cHB.png",
            "skilldescription": "Hyuuga Hanabi deals 15 damage to one enemy for 2 turns. The following 2 turns, this enemy deals 5 less damage.",
            "energy": [
                "Taijutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Energy",
                "Action",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "hyuuga_hanabi_revolving_heaven_dot",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 15,
                        "turnEndTrigger": "source_turn",
                        "turnDurationAnchor": "source_turn",
                        "ongoingClass": "action",
                        "triggerOnApply": true,
                        "tooltipText": "This character takes 15 damage from Eight Trigrams Revolving Heaven. Afterward, this character deals 5 less damage for 2 turns.",
                        "onExpireEffects": [
                            {
                                "type": "apply_status",
                                "statusId": "hyuuga_hanabi_revolving_heaven_debuff",
                                "duration": 2,
                                "metadata": {
                                    "harmful": true,
                                    "damageDebuffFlat": 5,
                                    "tooltipText": "This character deals 5 less damage from Eight Trigrams Revolving Heaven."
                                }
                            }
                        ]
                    }
                }
            ]
        },
        {
            "id": "hyuuga-hanabi-unyielding-tenacity",
            "name": "Unyielding Tenacity",
            "skillimage": "https://i.imgur.com/8EqBz4y.png",
            "skilldescription": "For 2 turns, Hyuuga Hanabi will be unable to be killed and will ignore all enemy stun effects. During this time, 'Hanabi Gentle Fist' and 'Hanabi Eight Trigrams Revolving Heaven' will cost 1 random energy instead and Hyuuga Hanabi will deal 5 additional damage.",
            "energy": [
                "Random",
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
                    "statusId": "hyuuga_hanabi_unyielding_tenacity",
                    "duration": 2,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "minimumHp": 1,
                        "cannotBeStunned": true,
                        "stunImmune": true,
                        "damageBonusFlat": 5,
                        "skillCostOverridesBySkillId": {
                            "hyuuga-hanabi-gentle-fist": {
                                "energy": [
                                    "Random"
                                ]
                            },
                            "hyuuga-hanabi-eight-trigrams-revolving-heaven": {
                                "energy": [
                                    "Random"
                                ]
                            }
                        },
                        "tooltipText": "Hyuuga Hanabi cannot be killed, ignores enemy stun effects, deals 5 additional damage, and Hanabi Gentle Fist and Hanabi Eight Trigrams Revolving Heaven cost 1 random chakra instead."
                    }
                }
            ]
        },
        {
            "id": "hyuuga-hanabi-byakugan",
            "name": "Hanabi Byakugan",
            "skillimage": "https://i.imgur.com/BEe5lIp.png",
            "skilldescription": "This skill makes Hyuuga Hanabi invulnerable for 1 turn.",
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
                    "statusId": "hyuuga_hanabi_byakugan_invuln",
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
