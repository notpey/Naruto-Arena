module.exports = {
    "id": "mitarashi-anko",
    "characterId": "mitarashi-anko",
    "name": "Mitarashi Anko",
    "facePicture": "https://i.imgur.com/MXeuah1.png",
    "characterdeescription": "A former student of Orochimaru and bearer of the Cursed Seal, Anko is now a teacher at Konoha. Having learned from Orochimaru, Anko utilizes various types of poisons and forbidden techniques to dismantle her enemies.",
    "requiredMissionId": "the-survivor-of-the-seal",
    "skills": [
        {
            "id": "mitarashi-anko-dual-pin",
            "name": "Dual Pin",
            "skillimage": "https://i.imgur.com/VttrJQn.png",
            "skilldescription": "Mitarashi Anko deals 10 damage to one enemy and makes them unable to reduce damage or become invulnerable for 1 turn. The following turn, this skill will be replaced by 'Twin Snakes Mutual Death'.",
            "energy": [],
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
                    "amount": 10,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "mitarashi_anko_dual_pin_debuff",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "cannotReduceDamage": true,
                        "cannotBecomeInvulnerable": true,
                        "tooltipText": "This character cannot reduce damage or become invulnerable."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "mitarashi_anko_dual_pin_mark",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "tooltipText": "This character can be targeted by Twin Snakes Mutual Death."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "mitarashi_anko_dual_pin_replacement",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillReplacements": {
                            "mitarashi-anko-dual-pin": "mitarashi-anko-twin-snakes-mutual-death"
                        },
                        "tooltipText": "Dual Pin is replaced by Twin Snakes Mutual Death."
                    }
                }
            ]
        },
        {
            "id": "mitarashi-anko-dragon-fire",
            "name": "Dragon Fire",
            "skillimage": "https://i.imgur.com/V8R4vRw.png",
            "skilldescription": "Mitarashi Anko deals 10 affliction damage to all enemies for 2 turns. The following 2 turns, these enemies will take 5 additional damage from Mitarashi Anko's other skills.",
            "energy": [
                "Ninjutsu"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Affliction",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "mitarashi_anko_dragon_fire_dot",
                    "duration": 2,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "afflictionDamage": true,
                        "turnEndDamage": 10,
                        "turnEndTrigger": "source_turn",
                        "tooltipText": "This character takes 10 affliction damage each turn from Dragon Fire."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "mitarashi_anko_dragon_fire_vulnerable",
                    "duration": 2,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "bonusDamageFromSourceSkillsFlat": 5,
                        "bonusDamageFromSourceCharacterId": "mitarashi-anko",
                        "bonusDamageAppliesToSkillIds": [
                            "mitarashi-anko-dual-pin",
                            "mitarashi-anko-hidden-shadow-snake-hand",
                            "mitarashi-anko-twin-snakes-mutual-death"
                        ],
                        "tooltipText": "This character takes 5 additional damage from Mitarashi Anko's skills."
                    }
                }
            ]
        },
        {
            "id": "mitarashi-anko-hidden-shadow-snake-hand",
            "name": "Hidden Shadow Snake Hand",
            "skillimage": "https://i.imgur.com/ApBRFMM.png",
            "skilldescription": "Mitarashi Anko deals 10 affliction damage to one enemy. The following 3 turns, this enemy will take 5 affliction damage each turn. This skill stacks.",
            "energy": [
                "Ninjutsu"
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
                    "amount": 10,
                    "scope": "target",
                    "metadata": {
                        "afflictionDamage": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "mitarashi_anko_hidden_shadow_snake_hand_dot",
                    "duration": 3,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "afflictionDamage": true,
                        "turnEndDamage": 5,
                        "turnEndTrigger": "source_turn",
                        "mergeNumericAddKeys": [
                            "turnEndDamage"
                        ],
                        "tooltipText": "This character takes 5 affliction damage each turn from Hidden Shadow Snake Hand. This effect stacks."
                    }
                }
            ]
        },
        {
            "id": "mitarashi-anko-quick-reflexes",
            "name": "Quick Reflexes",
            "skillimage": "https://i.imgur.com/jOjcH7H.png",
            "skilldescription": "This skill makes Mitarashi Anko invulnerable for 1 turn.",
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
            "id": "mitarashi-anko-twin-snakes-mutual-death",
            "name": "Twin Snakes Mutual Death",
            "hiddenFromSelectionViewer": true,
            "skillimage": "https://i.imgur.com/3Wv9VMP.png",
            "skilldescription": "Mitarashi Anko targets the enemy affected by 'Dual Pin' and herself. Both take 60 affliction damage that ignores invulnerability and destructible defense. This damage cannot kill Anko.",
            "energy": [
                "Ninjutsu",
                "Ninjutsu"
            ],
            "target": "single-enemy",
            "targetCondition": {
                "statusId": "mitarashi_anko_dual_pin_mark"
            },
            "damage": 0,
            "cooldown": 2,
            "cannotBeCountered": true,
            "ignoreInvulnerability": true,
            "classes": [
                "Affliction",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 60,
                    "scope": "target",
                    "metadata": {
                        "afflictionDamage": true,
                        "ignoreDamageReduction": true,
                        "ignoreDestructibleDefense": true,
                        "cannotBeEvaded": true
                    }
                },
                {
                    "type": "damage",
                    "amount": 60,
                    "scope": "self",
                    "metadata": {
                        "afflictionDamage": true,
                        "ignoreDamageReduction": true,
                        "ignoreDestructibleDefense": true,
                        "minimumHp": 1,
                        "cannotBeEvaded": true
                    }
                }
            ]
        }
    ]
};
