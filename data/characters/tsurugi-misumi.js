module.exports = {
    "id": "tsurugi-misumi",
    "characterId": "tsurugi-misumi",
    "name": "Tsurugi Misumi",
    "facePicture": "https://i.imgur.com/0eoJQlb.png",
    "characterdeescription": "A sound village genin that infiltrated Konoha as a spy, Misumi likes taking the initiative when it comes to combat. Misumi can flex his muscles and bones, twisting them to wrap around his enemies, or even defend his allies.",
    "requiredMissionId": "twisting-sound",
    "skills": [
        {
            "id": "tsurugi-misumi-flexible-twisting-joints",
            "name": "Flexible Twisting Joints",
            "skillimage": "https://i.imgur.com/6CRiBav.png",
            "skilldescription": "Tsurugi Misumi gains 20 points of damage reduction for 1 turn and targets one enemy or one member of his team. If used on an enemy, they will take 20 damage that ignores invulnerability. If used on a member of his team, they will gain 20 points of damage reduction for 1 turn.",
            "energy": [
                "Random"
            ],
            "target": "single-character",
            "damage": 0,
            "cooldown": 0,
            "ignoreInvulnerability": true,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "tsurugi_misumi_flexible_joints_self",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "damageReductionFlat": 20,
                        "tooltipText": "This character has 20 damage reduction."
                    }
                },
                {
                    "type": "damage",
                    "amount": 20,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "targetRelation": "enemy"
                    },
                    "metadata": {
                        "cannotBeEvaded": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "tsurugi_misumi_flexible_joints_ally",
                    "duration": 1,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "targetRelation": "ally"
                    },
                    "metadata": {
                        "helpful": true,
                        "damageReductionFlat": 20,
                        "tooltipText": "This character has 20 damage reduction."
                    }
                }
            ]
        },
        {
            "id": "tsurugi-misumi-soft-physique-modification",
            "name": "Soft Physique Modification",
            "skillimage": "https://i.imgur.com/N1qHrVL.png",
            "skilldescription": "Tsurugi Misumi targets one enemy. For 2 turns, all new harmful skills used on Tsurugi Misumi will be reflected onto that enemy instead. During this time, that enemy will be unable to reduce damage or become invulnerable.",
            "energy": [
                "Random",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 4,
            "classes": [
                "Strategic",
                "Control"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "tsurugi_misumi_soft_physique_reflect",
                    "duration": 2,
                    "scope": "self",
                    "condition": {
                        "scope": "target"
                    },
                    "metadata": {
                        "helpful": true,
                        "reflectNextIncomingSkill": true,
                        "reflectToFixedTarget": true,
                        "persistReflectAcrossTriggers": true,
                        "copyTargetUsernameToKeys": [
                            "reflectTargetUsername"
                        ],
                        "copyTargetSlotToKeys": [
                            "reflectTargetSlot"
                        ],
                        "tooltipText": "New harmful skills used on this character will be reflected onto the enemy affected by Soft Physique Modification.",
                        "ongoingClass": "control"
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "tsurugi_misumi_soft_physique_mark",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotReduceDamage": true,
                        "cannotBecomeInvulnerable": true,
                        "tooltipText": "This character cannot reduce damage or become invulnerable.",
                        "ongoingClass": "control"
                    }
                }
            ]
        },
        {
            "id": "tsurugi-misumi-tighten-joints",
            "name": "Tighten Joints",
            "skillimage": "https://i.imgur.com/GasBrwW.png",
            "skilldescription": "Tsurugi Misumi gains 15 points of permanent destructible defense. If 'Soft Physique Modification' is active, the enemy targeted by it will also take 20 damage and be stunned for 1 turn, and Misumi will heal 10 health.",
            "energy": [
                "Random"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "tsurugi_misumi_tighten_joints_dd",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePoints": 15,
                        "mergeNumericAddKeys": [
                            "destructibleDefensePoints"
                        ],
                        "tooltipTextTemplate": "This character has {destructibleDefensePoints} permanent destructible defense."
                    }
                },
                {
                    "type": "damage",
                    "amount": 20,
                    "scope": "all-enemy",
                    "condition": {
                        "scope": "target",
                        "statusId": "tsurugi_misumi_soft_physique_mark"
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "tsurugi_misumi_tighten_joints_stun",
                    "duration": 1,
                    "scope": "all-enemy",
                    "condition": {
                        "scope": "target",
                        "statusId": "tsurugi_misumi_soft_physique_mark"
                    },
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkills": true,
                        "tooltipText": "This character is stunned by Tighten Joints.",
                        "turnDurationAnchor": "source_turn"
                    }
                },
                {
                    "type": "heal",
                    "amount": 10,
                    "scope": "self",
                    "condition": {
                        "scope": "self",
                        "statusId": "tsurugi_misumi_soft_physique_reflect"
                    }
                }
            ]
        },
        {
            "id": "tsurugi-misumi-misumi-block",
            "name": "Misumi Block",
            "skillimage": "https://i.imgur.com/LJMVcjB.png",
            "skilldescription": "Misumi becomes invulnerable for 1 turn.",
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
