module.exports = {
    "id": "edo-tensei-hashirama",
    "characterId": "edo-tensei-hashirama",
    "name": "Edo Tensei Hashirama",
    "facePicture": "https://i.imgur.com/XKnOdST.png",
    "characterdeescription": "The first Hokage, and founder of the Hidden Leaf Village; Hashirama, a member of the legendary Senju clan. Hashirama has the unique ability to give life to trees, creating them, and manipulating them to assault the enemy team while protecting his own.",
    "requiredMissionId": "the-resurrection-of-the-first",
    "skills": [
        {
            "id": "edo-tensei-hashirama-tree-wave-destruction",
            "name": "Tree Wave Destruction",
            "skillimage": "https://i.imgur.com/N1okEw0.png",
            "skilldescription": "Edo Tensei Hashirama deals 10 damage to all enemies and grants his team 5 points of permanent destructible defense.",
            "energy": [
                "Random"
            ],
            "target": "all-enemy",
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
                    "scope": "all-enemy"
                },
                {
                    "type": "apply_status",
                    "statusId": "edo_tensei_hashirama_tree_wave_defense",
                    "duration": 99,
                    "scope": "all-allies",
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePoints": 5,
                        "mergeNumericAddKeys": [
                            "destructibleDefensePoints"
                        ],
                        "tooltipText": "This character has 5 points of permanent destructible defense from Tree Wave Destruction."
                    }
                }
            ]
        },
        {
            "id": "edo-tensei-hashirama-tree-strangulation",
            "name": "Tree Strangulation",
            "skillimage": "https://i.imgur.com/A3Xmo68.png",
            "skilldescription": "Edo Tensei Hashirama deals 20 damage to one enemy and stuns their physical and energy skills for 1 turn. During 'A World of Trees', this skill will stun all skills.",
            "energy": [
                "Bloodline"
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
                    "type": "apply_status",
                    "statusId": "edo_tensei_hashirama_tree_strangulation_stun_partial",
                    "duration": 1,
                    "scope": "target",
                    "condition": {
                        "scope": "self",
                        "missingStatusId": "edo_tensei_hashirama_world_of_trees"
                    },
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkillClasses": [
                            "physical",
                            "energy",
                            "ninjutsu"
                        ],
                        "tooltipText": "This character's physical and energy skills are stunned by Tree Strangulation.",
                        "turnDurationAnchor": "source_turn"
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "edo_tensei_hashirama_tree_strangulation_stun_full",
                    "duration": 1,
                    "scope": "target",
                    "condition": {
                        "scope": "self",
                        "statusId": "edo_tensei_hashirama_world_of_trees"
                    },
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkills": true,
                        "tooltipText": "This character is stunned by Tree Strangulation.",
                        "turnDurationAnchor": "source_turn"
                    }
                }
            ]
        },
        {
            "id": "edo-tensei-hashirama-a-world-of-trees",
            "name": "A World of Trees",
            "skillimage": "https://i.imgur.com/spbtu4f.png",
            "skilldescription": "For 2 turns, all enemies' physical, energy, and strategic skills cost 1 additional random chakra and their cooldowns are increased by 1 turn. During this time, this skill can be used again to grant Edo Tensei Hashirama's team 30 points of permanent destructible defense and to stun all enemies' skills for 1 turn.",
            "energy": [
                "Bloodline",
                "Bloodline"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "edo_tensei_hashirama_world_of_trees_defense",
                    "duration": 99,
                    "scope": "all-allies",
                    "condition": {
                        "scope": "self",
                        "statusId": "edo_tensei_hashirama_world_of_trees"
                    },
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePoints": 30,
                        "mergeNumericAddKeys": [
                            "destructibleDefensePoints"
                        ],
                        "tooltipText": "This character has 30 points of permanent destructible defense from A World of Trees."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "edo_tensei_hashirama_world_of_trees_stun",
                    "duration": 1,
                    "scope": "all-enemy",
                    "condition": {
                        "scope": "self",
                        "statusId": "edo_tensei_hashirama_world_of_trees"
                    },
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkills": true,
                        "tooltipText": "This character is stunned by A World of Trees.",
                        "turnDurationAnchor": "source_turn"
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "edo_tensei_hashirama_world_of_trees_enemy_cost",
                    "duration": 2,
                    "scope": "all-enemy",
                    "condition": {
                        "scope": "self",
                        "missingStatusId": "edo_tensei_hashirama_world_of_trees"
                    },
                    "metadata": {
                        "harmful": true,
                        "randomCostIncreaseForSkillClasses": {
                            "physical": 1,
                            "energy": 1,
                            "strategic": 1,
                            "ninjutsu": 1
                        },
                        "tooltipText": "This character's physical, energy, and strategic skills cost 1 additional random chakra."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "edo_tensei_hashirama_world_of_trees",
                    "duration": 2,
                    "scope": "self",
                    "condition": {
                        "scope": "self",
                        "missingStatusId": "edo_tensei_hashirama_world_of_trees"
                    },
                    "metadata": {
                        "helpful": true,
                        "usedSkillCooldownPenalty": 1,
                        "tooltipText": "All enemies who use a new skill will have that skill's cooldown increased by 1. Edo Tensei Hashirama can use 'A World of Trees' again for a bonus."
                    }
                }
            ]
        },
        {
            "id": "edo-tensei-hashirama-deflection",
            "name": "Deflection",
            "skillimage": "https://i.imgur.com/GKhZ1S9.png",
            "skilldescription": "This skill makes Edo Tensei Hashirama invulnerable for 1 turn.",
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
                    "statusId": "edo_tensei_hashirama_deflection",
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
