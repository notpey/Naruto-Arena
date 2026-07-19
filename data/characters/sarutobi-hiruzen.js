module.exports = {
    "id": "sarutobi-hiruzen",
    "characterId": "sarutobi-hiruzen",
    "name": "Sarutobi Hiruzen",
    "facePicture": "https://i.imgur.com/OVXPrec.png",
    "characterdeescription": "The third and most recent Hokage of the Hidden Leaf Village to die; Hiruzen, known as the God of Shinobi was considered to be one of the strongest ninja alive in his prime. While powerful using just his normal jutsu, Hiruzen is able to pull out a trump card when desperation strikes.",
    "requiredMissionId": "the-god-of-the-shinobi",
    "skills": [
        {
            "id": "sarutobi-hiruzen-fire-dragon-flame-bullet",
            "name": "Fire Dragon Flame Bullet",
            "skillimage": "https://i.imgur.com/ljmijF8.png",
            "skilldescription": "Sarutobi Hiruzen deals 30 affliction damage to one enemy. The following turn, that enemy will take 10 affliction damage.",
            "energy": [
                "Ninjutsu",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Affliction",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 30,
                    "scope": "target",
                    "metadata": {
                        "afflictionDamage": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "sarutobi_hiruzen_fire_dragon_dot",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "tooltipText": "This character will take 10 affliction damage next turn from Fire Dragon Flame Bullet.",
                        "onExpireEffects": [
                            {
                                "type": "damage",
                                "amount": 10,
                                "metadata": {
                                    "afflictionDamage": true
                                }
                            }
                        ]
                    }
                }
            ]
        },
        {
            "id": "sarutobi-hiruzen-dead-demon-consuming-seal",
            "name": "Dead Demon Consuming Seal",
            "skillimage": "https://i.imgur.com/HjM3iLD.png",
            "skilldescription": "Permanently, one enemy takes 40 affliction damage, is stunned and cannot reduce damage or become invulnerable each turn. Sarutobi Hiruzen himself takes 20 affliction damage and is stunned each turn. This skill cannot be removed or ignored and will end when Sarutobi Hiruzen dies.",
            "energy": [
                "Random",
                "Random",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Affliction",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "sarutobi_hiruzen_dead_demon_seal_enemy",
                    "duration": 99,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "ongoingClass": "action",
                        "ignoreOngoingSourceStun": true,
                        "afflictionDamage": true,
                        "cannotUseSkills": true,
                        "cannotReduceDamage": true,
                        "cannotBecomeInvulnerable": true,
                        "cannotBeCleansed": true,
                        "turnEndDamage": 40,
                        "turnEndTrigger": "source_turn",
                        "tooltipText": "This character takes 40 affliction damage each turn, is stunned, and cannot reduce damage or become invulnerable. This effect cannot be removed or ignored and ends if Sarutobi Hiruzen dies."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "sarutobi_hiruzen_dead_demon_seal_self",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "harmful": true,
                        "ongoingClass": "action",
                        "ignoreOngoingSourceStun": true,
                        "afflictionDamage": true,
                        "cannotUseSkills": true,
                        "cannotBeCleansed": true,
                        "turnEndDamage": 20,
                        "turnEndTrigger": "source_turn",
                        "tooltipText": "Sarutobi Hiruzen takes 20 affliction damage each turn and is stunned."
                    }
                }
            ]
        },
        {
            "id": "sarutobi-hiruzen-major-summoning-enma",
            "name": "Major Summoning: Enma",
            "skillimage": "https://i.imgur.com/O3lc03n.png",
            "skilldescription": "Sarutobi Hiruzen and his team become invulnerable for 1 turn. For the rest of the game, Sarutobi Hiruzen will deal 5 damage to all enemies each turn, Sarutobi Hiruzen's team will gain 5 points of damage reduction, and this skill will be replaced by 'Adamantine Prison Wall'. This skill will end if Sarutobi Hiruzen dies.",
            "energy": [
                "Taijutsu",
                "Ninjutsu",
                "Genjutsu"
            ],
            "target": "all-allies",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "sarutobi_hiruzen_enma_invuln",
                    "duration": 1,
                    "scope": "all-allies",
                    "metadata": {
                        "helpful": true,
                        "invulnerable": true,
                        "tooltipText": "This character is invulnerable."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "sarutobi_hiruzen_enma_dot",
                    "duration": 99,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "ongoingClass": "action",
                        "turnEndDamage": 5,
                        "turnEndTrigger": "source_turn",
                        "tooltipText": "This character takes 5 damage each turn from Major Summoning: Enma."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "sarutobi_hiruzen_enma_dr",
                    "duration": 99,
                    "scope": "all-allies",
                    "metadata": {
                        "helpful": true,
                        "ongoingClass": "action",
                        "damageReductionFlat": 5,
                        "tooltipText": "This character has 5 points of damage reduction from Major Summoning: Enma."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "sarutobi_hiruzen_enma_replace",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "ongoingClass": "action",
                        "skillReplacements": {
                            "sarutobi-hiruzen-major-summoning-enma": "sarutobi-hiruzen-adamantine-prison-wall"
                        },
                        "tooltipText": "Major Summoning: Enma is replaced by Adamantine Prison Wall."
                    }
                }
            ]
        },
        {
            "id": "sarutobi-hiruzen-earth-style-wall",
            "name": "Earth-Style Wall",
            "skillimage": "https://i.imgur.com/w8Zg0Py.png",
            "skilldescription": "This skill makes Sarutobi Hiruzen invulnerable for 1 turn.",
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
                    "statusId": "sarutobi_hiruzen_earth_style_wall",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "invulnerable": true,
                        "tooltipText": "This character is invulnerable."
                    }
                }
            ]
        },
        {
            "id": "sarutobi-hiruzen-adamantine-prison-wall",
            "name": "Adamantine Prison Wall",
            "hiddenFromSelectionViewer": true,
            "skillimage": "",
            "skilldescription": "For 1 turn, Sarutobi Hiruzen and his team will gain 20 points of unpierceable damage reduction and they cannot be killed.",
            "energy": [
                "Taijutsu"
            ],
            "target": "all-allies",
            "damage": 0,
            "cooldown": 4,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "sarutobi_hiruzen_adamantine_wall",
                    "duration": 1,
                    "scope": "all-allies",
                    "metadata": {
                        "helpful": true,
                        "unpierceableDamageReductionFlat": 20,
                        "minimumHp": 1,
                        "tooltipText": "This character has 20 points of unpierceable damage reduction and cannot be killed."
                    }
                }
            ]
        }
    ]
};
