module.exports = {
    "id": "kisame-body-double",
    "characterId": "kisame-body-double",
    "name": "Kisame Body Double",
    "facePicture": "deadcharacter.png",
    "characterdeescription": "By using one of Pain's techniques a Sand Nin spy for Akatsuki is changed to look like Kisame. The body double is controlled by Kisame but only has a third of his chakra.",
    "requiredMissionId": "return-of-a-rival",
    "skills": [
        {
            "id": "kisame-body-double-explosive-water-shock-wave",
            "name": "Explosive Water Shock Wave",
            "skillimage": "deadcharacter.png",
            "skilldescription": "For 4 turns, Kisame Body Double and his allies will lose 1 less energy if a energy removal or stealing skill is used on them. For 4 turns, all enemies who use a new skill will have the cooldown of that skill increased by 2 turns. During this time, 'Water Prison Technique' and 'Five Man-Eating Sharks' will be improved and this skill will be replaced by 'Sentient Water Disabling'.",
            "energy": [
                "Bloodline",
                "Ninjutsu"
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
                    "statusId": "kisame_body_double_shock_wave_stance",
                    "duration": 4,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "energyDrainResistance": 1,
                        "enemySkillCooldownIncreaseOnUse": 2,
                        "skillReplacements": {
                            "kisame-body-double-explosive-water-shock-wave": "kisame-body-double-sentient-water-disabling"
                        },
                        "skillCostOverridesBySkillId": {
                            "kisame-body-double-water-prison-technique": {
                                "energy": [
                                    "Random"
                                ]
                            },
                            "kisame-body-double-five-man-eating-sharks": {
                                "energy": [
                                    "Genjutsu"
                                ]
                            }
                        },
                        "tooltipText": "Explosive Water Shock Wave active: enemies suffer +2 CD on skills, energy drain reduced by 1."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kisame_body_double_drain_resistance_team",
                    "duration": 4,
                    "scope": "all-ally",
                    "metadata": {
                        "helpful": true,
                        "energyDrainResistance": 1,
                        "tooltipText": "Loses 1 less energy when energy is removed or stolen."
                    }
                }
            ]
        },
        {
            "id": "kisame-body-double-water-prison-technique",
            "name": "Water Prison Technique",
            "skillimage": "deadcharacter.png",
            "skilldescription": "Kisame Body Double deals 15 piercing damage to one enemy, stuns their non-strategic skills for 1 turn and makes them invulnerable to friendly skills also for 1 turn. During this time, Kisame Body Double gains 15 points of damage reduction. During 'Explosive Water Shock Wave', this skill costs 1 random energy instead.",
            "energy": [
                "Bloodline"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Energy",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 15,
                    "scope": "target",
                    "metadata": {
                        "ignoreDamageReduction": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kisame_body_double_water_prison_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkillClasses": [
                            "physical",
                            "energy",
                            "mental",
                            "ninjutsu"
                        ],
                        "invulnerableToFriendlySkills": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "Non-strategic skills are stunned and invulnerable to friendly skills."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kisame_body_double_water_prison_dr",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "damageReductionFlat": 15,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "Gained 15 damage reduction."
                    }
                }
            ]
        },
        {
            "id": "kisame-body-double-five-man-eating-sharks",
            "name": "Five Man-Eating Sharks",
            "skillimage": "deadcharacter.png",
            "skilldescription": "Kisame Body Double deals 25 damage to one enemy for 2 turns. During 'Explosive Water Shock Wave', this skill costs 1 random energy less.",
            "energy": [
                "Ninjutsu",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Energy",
                "Action"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "kisame_body_double_sharks_action_dot",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "action": true,
                        "ongoingClass": "action",
                        "damagePerTurn": 25,
                        "tooltipText": "Taking 25 energy damage per turn."
                    }
                }
            ]
        },
        {
            "id": "kisame-body-double-samehada-block",
            "name": "Samehada Block",
            "skillimage": "deadcharacter.png",
            "skilldescription": "This skill makes Kisame Body Double invulnerable for 1 turn.",
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
                    "statusId": "kisame_body_double_samehada_block_invul",
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
            "id": "kisame-body-double-sentient-water-disabling",
            "name": "Sentient Water Disabling",
            "skillimage": "deadcharacter.png",
            "skilldescription": "Kisame Body Double targets himself or an ally. For 1 turn, the first harmful non-mental skill used on the target will be countered and the countered enemy will have 'Water Prison Technique' applied on them. This skill is invisible.",
            "energy": [
                "Ninjutsu"
            ],
            "target": "single-ally",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "kisame_body_double_sentient_water_trap",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "invisible": true,
                        "triggerOnEnemyHarmfulNonMental": true,
                        "counterStatusId": "kisame_body_double_water_prison_stun",
                        "counterStatusDuration": 1,
                        "counterStatusMetadata": {
                            "harmful": true,
                            "cannotUseSkillClasses": [
                                "physical",
                                "energy",
                                "mental",
                                "ninjutsu"
                            ],
                            "invulnerableToFriendlySkills": true,
                            "tooltipText": "Non-strategic skills stunned and invulnerable to friendly skills."
                        },
                        "tooltipText": "Counters the next harmful non-mental skill."
                    }
                }
            ]
        }
    ]
};
