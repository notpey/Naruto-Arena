module.exports = {
    "id": "yuhi-kurenai",
    "characterId": "yuhi-kurenai",
    "name": "Yuhi Kurenai",
    "facePicture": "https://i.imgur.com/0KdXrps.png",
    "characterdeescription": "The squad leader of Team 8, Kurenai is a caring woman and a close companion to Asuma. Kurenai is a genjutsu master, being able to use a variety of illusions to disrupt and trap her enemies in nigh impossible to escape illusions.",
    "requiredMissionId": "team-8-scouting-at-its-best",
    "skills": [
        {
            "id": "yuhi-kurenai-demonic-illusion-entrap",
            "name": "Demonic Illusion: Entrap",
            "skillimage": "https://i.imgur.com/7TlVCo0.png",
            "skilldescription": "Yuhi Kurenai targets one enemy. For 2 turns, they will take 5 damage each turn, will be unable to reduce damage or become invulnerable, their non-affliction damage will be reduced by 10, and the cost of their skills will be increased by 1 random chakra.",
            "energy": [
                "Genjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Mental",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "kurenai_entrap_debuff",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotReduceDamage": true,
                        "cannotBecomeInvulnerable": true,
                        "nonAfflictionDamageDebuffFlat": 10,
                        "randomCostIncrease": 1,
                        "turnEndDamage": 5,
                        "turnEndTrigger": "source_turn",
                        "tooltipText": "This character takes 5 damage, cannot reduce damage or become invulnerable, deals 10 less non-affliction damage, and their skills cost 1 additional random chakra."
                    }
                }
            ]
        },
        {
            "id": "yuhi-kurenai-illusionary-tree-meld",
            "name": "Illusionary Tree Meld",
            "skillimage": "https://i.imgur.com/eW1yYm5.png",
            "skilldescription": "Yuhi Kurenai gains 15 points of permanent destructible defense and 5 additional points for every skill Yuhi Kurenai has used. The additional destructible defense is reset when this skill is used.",
            "energy": [
                "Random"
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
                    "type": "cleanse_statuses",
                    "scope": "self",
                    "statusId": "kurenai_tree_meld_dd",
                    "count": 1
                },
                {
                    "type": "apply_status",
                    "statusId": "kurenai_tree_meld_dd",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePoints": 15,
                        "tooltipText": "Kurenai has 15 points of destructible defense from Illusionary Tree Meld."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kurenai_tree_meld_growth",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "onOwnerUseSkillTrigger": true,
                        "persistOnOwnerUseSkillTrigger": true,
                        "onOwnerUseSkillEffects": [
                            {
                                "type": "apply_status",
                                "statusId": "kurenai_tree_meld_dd",
                                "duration": 99,
                                "metadata": {
                                    "helpful": true,
                                    "destructibleDefensePoints": 5,
                                    "mergeNumericAddKeys": [
                                        "destructibleDefensePoints"
                                    ],
                                    "tooltipText": "This character has 5 permanent destructible defense from Illusionary Tree Meld."
                                }
                            }
                        ],
                        "tooltipText": "Illusionary Tree Meld gains 5 additional destructible defense for every skill used."
                    }
                }
            ]
        },
        {
            "id": "yuhi-kurenai-demonic-illusion-tree-binding-death",
            "name": "Demonic Illusion: Tree Binding Death",
            "skillimage": "https://i.imgur.com/OxtOFCb.png",
            "skilldescription": "Yuhi Kurenai stuns one enemy for 2 turns. The following 2 turns, this skill will be replaced by 'Tree Binding Death Attack'.",
            "energy": [
                "Genjutsu",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Strategic",
                "Control"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "kurenai_tree_binding_stun",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkills": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character is stunned by Demonic Illusion: Tree Binding Death."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kurenai_tree_binding_replacement",
                    "duration": 2,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillReplacements": {
                            "yuhi-kurenai-demonic-illusion-tree-binding-death": "yuhi-kurenai-tree-binding-death-attack"
                        },
                        "tooltipText": "Demonic Illusion: Tree Binding Death is replaced by Tree Binding Death Attack."
                    }
                }
            ]
        },
        {
            "id": "yuhi-kurenai-vanishing-illusion",
            "name": "Vanishing Illusion",
            "skillimage": "https://i.imgur.com/W2xhlma.png",
            "skilldescription": "This skill makes Yuhi Kurenai invulnerable for 1 turn.",
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
            "id": "yuhi-kurenai-tree-binding-death-attack",
            "name": "Tree Binding Death Attack",
            "hiddenFromSelectionViewer": true,
            "skillimage": "https://i.imgur.com/D9fJNxi.png",
            "skilldescription": "Yuhi Kurenai deals 25 piercing damage to one enemy affected by 'Demonic Illusion: Tree Binding Death'.",
            "energy": [
                "Random"
            ],
            "target": "single-enemy",
            "targetCondition": {
                "statusId": "kurenai_tree_binding_stun"
            },
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Mental",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 25,
                    "scope": "target",
                    "metadata": {
                        "ignoreDamageReduction": true
                    }
                }
            ]
        }
    ]
};
