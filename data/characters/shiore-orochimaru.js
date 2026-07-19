module.exports = {
    "id": "shiore-orochimaru",
    "characterId": "shiore-orochimaru",
    "name": "Shiore Orochimaru",
    "facePicture": "https://i.imgur.com/SSVCMic.png",
    "characterdeescription": "Shiore was a genin from the Hidden Grass Village that was killed by Orochimaru before the Chuunin Exams. He had his identity stolen by him afterwards. ORIGINAL DESIGN: AnteMito",
    "requiredMissionId": "a-new-find-skin",
    "skills": [
        {
            "id": "shiore-orochimaru-five-elements-seal",
            "name": "Five Elements Seal",
            "skillimage": "https://i.imgur.com/c7GzZkw.png",
            "skilldescription": "Shiore Orochimaru targets one enemy, removing 1 random chakra from them and making their skills cost 1 additional random chakra for 1 turn. If this skill is used on an enemy affected by 'Giant Snake Bind', this enemy will have 1 random chakra stolen instead and the chakra cost increase effect will last 2 turns.",
            "energy": [
                "Ninjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "remove_random_chakra",
                    "amount": 1,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "missingStatusId": "shiore_orochimaru_giant_snake_bind"
                    }
                },
                {
                    "type": "drain_chakra_random_from_target_to_self",
                    "amount": 1,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "statusId": "shiore_orochimaru_giant_snake_bind"
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "shiore_orochimaru_five_elements_seal_cost",
                    "duration": 1,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "missingStatusId": "shiore_orochimaru_giant_snake_bind"
                    },
                    "metadata": {
                        "harmful": true,
                        "randomCostIncrease": 1,
                        "tooltipText": "This character's skills cost 1 additional random chakra."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "shiore_orochimaru_five_elements_seal_cost",
                    "duration": 2,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "statusId": "shiore_orochimaru_giant_snake_bind"
                    },
                    "metadata": {
                        "harmful": true,
                        "randomCostIncrease": 1,
                        "tooltipText": "This character's skills cost 1 additional random chakra."
                    }
                }
            ]
        },
        {
            "id": "shiore-orochimaru-fire-release-fire-ball",
            "name": "Fire Release: Fire Ball",
            "skillimage": "https://i.imgur.com/rbD0Uyi.png",
            "skilldescription": "Shiore Orochimaru deals 15 affliction damage to one enemy for 2 turns. This skill cannot be used on an enemy already affected by it and cannot be ignored or removed.",
            "energy": [
                "Ninjutsu"
            ],
            "target": "single-enemy",
            "targetCondition": {
                "missingStatusId": "shiore_orochimaru_fireball_dot"
            },
            "damage": 0,
            "cooldown": 0,
            "cannotBeCountered": true,
            "classes": [
                "Affliction",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "shiore_orochimaru_fireball_dot",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "afflictionDamage": true,
                        "cannotBeCleansed": true,
                        "cannotBeEvaded": true,
                        "turnEndDamage": 15,
                        "turnEndTrigger": "source_turn",
                        "tooltipText": "This character takes 15 affliction damage from Fire Release: Fire Ball."
                    }
                }
            ]
        },
        {
            "id": "shiore-orochimaru-giant-snake-bind",
            "name": "Giant Snake Bind",
            "skillimage": "https://i.imgur.com/8NjKcaE.png",
            "skilldescription": "Shiore Orochimaru stuns one enemy for 1 turn. For 1 turn, this skill can be used for no cost to deal 25 damage to the enemy affected by it.",
            "energy": [
                "Taijutsu",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Physical",
                "Action"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "shiore_orochimaru_giant_snake_bind",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkills": true,
                        "tooltipText": "This character is stunned by Giant Snake Bind."
                    }
                },
                {
                    "type": "damage",
                    "amount": 25,
                    "scope": "target",
                    "condition": {
                        "scope": "self",
                        "statusId": "shiore_orochimaru_giant_snake_bind_followup"
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "shiore_orochimaru_giant_snake_bind_followup",
                    "duration": 1,
                    "scope": "self",
                    "condition": {
                        "scope": "self",
                        "missingStatusId": "shiore_orochimaru_giant_snake_bind_followup"
                    },
                    "metadata": {
                        "helpful": true,
                        "skillCostOverridesBySkillId": {
                            "shiore-orochimaru-giant-snake-bind": {
                                "energy": []
                            }
                        },
                        "tooltipText": "Giant Snake Bind may be used for no cost to deal 25 damage."
                    }
                }
            ]
        },
        {
            "id": "shiore-orochimaru-snake-body-retreat",
            "name": "Snake Body Retreat",
            "skillimage": "https://i.imgur.com/B5p2YML.png",
            "skilldescription": "This skill makes Snake invulnerable for 1 turn.",
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
