module.exports = {
    "id": "sarutobi-asuma",
    "characterId": "sarutobi-asuma",
    "name": "Sarutobi Asuma",
    "facePicture": "https://i.imgur.com/Hk2DwUA.png",
    "characterdeescription": "The squad leader of Team 10, Asuma is the son of the 3rd Hokage; Asuma is a chronic smoker that fights to protect his allies. Asuma fights with a pair of trench knives, augmented by his chakra to a highly deadly degree.",
    "requiredMissionId": "team-10-proves-its-worth",
    "skills": [
        {
            "id": "sarutobi-asuma-sharpen-blades",
            "name": "Sharpen Blades",
            "skillimage": "https://i.imgur.com/k1FF8kx.png",
            "skilldescription": "Sarutobi Asuma sharpens his blades, replacing this skill with 'Flying Swallow' until it is used.",
            "energy": [],
            "target": "self",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "asuma_flying_swallow_ready",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillReplacements": {
                            "sarutobi-asuma-sharpen-blades": "sarutobi-asuma-flying-swallow"
                        },
                        "tooltipText": "Sharpen Blades is replaced by Flying Swallow."
                    }
                }
            ]
        },
        {
            "id": "sarutobi-asuma-finishing-blow",
            "name": "Finishing Blow",
            "hiddenFromSelectionViewer": false,
            "skillimage": "https://i.imgur.com/SbZfAzh.png",
            "skilldescription": "Sarutobi Asuma deals 35 piercing damage to one enemy. After use, this skill is replaced by 'Flying Kick'.",
            "energy": [
                "Taijutsu",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 35,
                    "scope": "target",
                    "metadata": {
                        "ignoreDamageReduction": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "asuma_flying_kick_ready",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillReplacements": {
                            "sarutobi-asuma-finishing-blow": "sarutobi-asuma-flying-kick"
                        },
                        "tooltipText": "Finishing Blow is replaced by Flying Kick."
                    }
                }
            ]
        },
        {
            "id": "sarutobi-asuma-self-sacrifice",
            "name": "Self-Sacrifice",
            "skillimage": "https://i.imgur.com/i3HWtZR.png",
            "skilldescription": "Sarutobi Asuma targets one ally. For 3 turns, all harmful skills used on this ally will be reflected to Sarutobi Asuma. During this time, Sarutobi Asuma can use this skill again for no cost to cancel it.",
            "energy": [
                "Random"
            ],
            "target": "single-ally",
            "actorCondition": {
                "missingStatusId": "asuma_self_sacrifice_active"
            },
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "asuma_self_sacrifice_reflect",
                    "duration": 3,
                    "scope": "target",
                    "metadata": {
                        "helpful": true,
                        "reflectNextIncomingSkill": true,
                        "reflectToSourceCaster": true,
                        "persistReflectAcrossTriggers": true,
                        "tooltipText": "All harmful skills used on this character will be reflected to Sarutobi Asuma."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "asuma_self_sacrifice_active",
                    "duration": 3,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillReplacements": {
                            "sarutobi-asuma-self-sacrifice": "sarutobi-asuma-cancel-self-sacrifice"
                        },
                        "tooltipText": "Self-Sacrifice is replaced by a free skill that cancels it."
                    }
                }
            ]
        },
        {
            "id": "sarutobi-asuma-knife-block",
            "name": "Knife Block",
            "skillimage": "https://i.imgur.com/e4dn075.png",
            "skilldescription": "This skill makes Sarutobi Asuma invulnerable for 1 turn.",
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
            "id": "sarutobi-asuma-flying-swallow",
            "name": "Flying Swallow",
            "skillimage": "https://i.imgur.com/a50zdDY.png",
            "skilldescription": "Sarutobi Asuma deals 10 damage to all enemies for 3 turns. This ongoing action requires 'Sharpen Blades' to be used first and returns to 'Sharpen Blades' after use.",
            "energy": [
                "Taijutsu",
                "Ninjutsu"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 2,
            "cannotBeCountered": true,
            "cannotBeReflected": true,
            "classes": [
                "Physical",
                "Action",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "asuma_flying_swallow_dot",
                    "duration": 3,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 10,
                        "turnEndTrigger": "source_turn",
                        "turnDurationAnchor": "source_turn",
                        "ongoingClass": "action",
                        "triggerOnApply": true,
                        "tooltipText": "This character takes 10 damage from Flying Swallow. This action ends if Asuma is stunned or the target becomes invulnerable."
                    }
                },
                {
                    "type": "cleanse_statuses",
                    "scope": "self",
                    "statusId": "asuma_flying_swallow_ready"
                }
            ],
            "hiddenFromSelectionViewer": true
        },
        {
            "id": "sarutobi-asuma-flying-kick",
            "name": "Flying Kick",
            "hiddenFromSelectionViewer": true,
            "skillimage": "https://i.imgur.com/skCMnBl.png",
            "skilldescription": "Sarutobi Asuma deals 35 damage to one enemy and stuns them for 1 turn. After use, this skill is replaced by 'Finishing Blow'.",
            "energy": [
                "Taijutsu",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 35,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "asuma_flying_kick_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "cannotUseSkills": true,
                        "tooltipText": "This character is stunned by Flying Kick."
                    }
                },
                {
                    "type": "cleanse_statuses",
                    "scope": "self",
                    "statusId": "asuma_flying_kick_ready"
                }
            ]
        },
        {
            "id": "sarutobi-asuma-cancel-self-sacrifice",
            "name": "Self-Sacrifice",
            "hiddenFromSelectionViewer": true,
            "omitFromSelectionViewer": true,
            "skillimage": "https://i.imgur.com/i3HWtZR.png",
            "skilldescription": "Cancels Self-Sacrifice for no cost.",
            "energy": [],
            "target": "self",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "cleanse_statuses",
                    "scope": "all-allies",
                    "statusId": "asuma_self_sacrifice_reflect",
                    "count": 1
                },
                {
                    "type": "cleanse_statuses",
                    "scope": "self",
                    "statusId": "asuma_self_sacrifice_active",
                    "count": 1
                }
            ]
        }
    ]
};
