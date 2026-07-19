module.exports = {
    "id": "rokushou-aoi",
    "characterId": "rokushou-aoi",
    "name": "Rokushou Aoi",
    "facePicture": "https://i.imgur.com/XtzW95D.png",
    "characterdeescription": "Aoi is a jounin from the Hidden Rain Village and a missing-nin from the Hidden Leaf Village. A former instructor in the Hidden Leaf, he tricked Idate to steal the legendary Sword of the Thunder God, which had once belonged to Senju Tobirama, the Second Hokage. ORIGINAL DESIGN: Liann",
    "requiredMissionId": "the-theft-plan",
    "skills": [
        {
            "id": "rokushou-aoi-senbon-shower",
            "name": "Senbon Shower",
            "skillimage": "https://i.imgur.com/6QupUQg.png",
            "skilldescription": "Rokushou Aoi deals 5 piercing damage to all enemies, who will take 5 affliction damage each turn for 3 turns. During this time, the main target will ignore healing effects.",
            "energy": [
                "Random",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 4,
            "classes": [
                "Physical",
                "Instant",
                "Affliction"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 5,
                    "scope": "all-enemy",
                    "metadata": {
                        "ignoreDestructibleDefense": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "rokushou_aoi_senbon_shower_dot",
                    "duration": 3,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 5,
                        "afflictionDamage": true,
                        "turnEndTrigger": "source_turn",
                        "turnDurationAnchor": "source_turn",
                        "ongoingClass": "action",
                        "triggerOnApply": true,
                        "tooltipText": "This character takes 5 affliction damage each turn from Senbon Shower."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "rokushou_aoi_senbon_shower_no_heal",
                    "duration": 3,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "healReceivedMultiplier": 0,
                        "tooltipText": "This character ignores healing effects."
                    }
                }
            ]
        },
        {
            "id": "rokushou-aoi-umbrella-shock-wave",
            "name": "Umbrella Shock Wave",
            "skillimage": "https://i.imgur.com/uExBxVs.png",
            "skilldescription": "Rokushou Aoi destroys all enemies' destructible defense and deals 10 damage to them. From now on, 'Senbon Shower' will last 1 additional turn. This effect stacks each time this skill is used.",
            "energy": [
                "Random"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "destroy_destructible_defense",
                    "scope": "all-enemy"
                },
                {
                    "type": "damage",
                    "amount": 10,
                    "scope": "all-enemy"
                },
                {
                    "type": "apply_status",
                    "statusId": "rokushou_aoi_umbrella_shock_wave_stack",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillDurationBonuses": {
                            "rokushou-aoi-senbon-shower": 1
                        },
                        "mergeObjectNumericAddKeys": [
                            "skillDurationBonuses"
                        ],
                        "tooltipText": "Senbon Shower lasts 1 additional turn. This effect stacks."
                    }
                }
            ]
        },
        {
            "id": "rokushou-aoi-sword-of-the-thunder-god",
            "name": "Sword of the Thunder God",
            "skillimage": "https://i.imgur.com/lIkGCvd.png",
            "skilldescription": "Permanently, Rokushou Aoi will deal 10 piercing damage instantly to any enemy who uses a new skill on him and during this time, 'Senbon Shower' and 'Umbrella Shock Wave' will be replaced by 'Lightning Moon Cut' and 'Ring of Electricity' respectively. This skill cannot be used while active and ends when Rokushou Aoi uses 'Lightning Moon Cut' 3 times or 'Ring of Electricity' once.",
            "energy": [
                "Random"
            ],
            "target": "self",
            "targetCondition": {
                "missingStatusId": "rokushou_aoi_sword_of_the_thunder_god"
            },
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Energy",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "rokushou_aoi_sword_of_the_thunder_god",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "triggerOnEnemyHarmfulSkill": true,
                        "counterDamage": 10,
                        "counterDamageIgnoresDestructibleDefense": true,
                        "trapReappliesSelf": true,
                        "skillReplacements": {
                            "rokushou-aoi-senbon-shower": "rokushou-aoi-lightning-moon-cut",
                            "rokushou-aoi-umbrella-shock-wave": "rokushou-aoi-ring-of-electricity"
                        },
                        "removeSelfOnSkillUseCount": [
                            {
                                "skillId": "rokushou-aoi-lightning-moon-cut",
                                "atLeast": 3
                            },
                            {
                                "skillId": "rokushou-aoi-ring-of-electricity",
                                "atLeast": 1
                            }
                        ],
                        "tooltipText": "Any enemy who uses a new skill on this character takes 10 piercing damage. Senbon Shower is replaced by Lightning Moon Cut and Umbrella Shock Wave is replaced by Ring of Electricity."
                    }
                }
            ]
        },
        {
            "id": "rokushou-aoi-umbrella-shield",
            "name": "Umbrella Shield",
            "skillimage": "https://i.imgur.com/zxodmCK.png",
            "skilldescription": "This skill makes Rokushou Aoi invulnerable for 1 turn.",
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
                    "statusId": "rokushou_aoi_umbrella_shield",
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
            "id": "rokushou-aoi-lightning-moon-cut",
            "name": "Lightning Moon Cut",
            "hiddenFromSelectionViewer": true,
            "skillimage": "",
            "skilldescription": "Rokushou Aoi deals 25 piercing damage to one enemy. For 3 turns, if they use a new skill, the cooldown of that skill will be increased by 1 turn. This skill stacks.",
            "energy": [
                "Ninjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Energy",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 25,
                    "scope": "target",
                    "metadata": {
                        "ignoreDestructibleDefense": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "rokushou_aoi_lightning_moon_cut_penalty",
                    "duration": 3,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "usedSkillCooldownPenalty": 1,
                        "tooltipText": "If this character uses a new skill, its cooldown is increased by 1 turn."
                    }
                }
            ]
        },
        {
            "id": "rokushou-aoi-ring-of-electricity",
            "name": "Ring of Electricity",
            "hiddenFromSelectionViewer": true,
            "skillimage": "",
            "skilldescription": "Rokushou Aoi deals 35 piercing damage to one enemy and then stuns them for 2 turns. For the rest of the game, if they use a new skill, the cooldown of that skill will be increased by 2 turns. This skill stacks.",
            "energy": [
                "Ninjutsu",
                "Genjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Energy",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 35,
                    "scope": "target",
                    "metadata": {
                        "ignoreDestructibleDefense": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "rokushou_aoi_ring_of_electricity_stun",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "cannotUseSkills": true,
                        "tooltipText": "This character is stunned by Ring of Electricity."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "rokushou_aoi_ring_of_electricity_penalty",
                    "duration": 99,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "usedSkillCooldownPenalty": 2,
                        "tooltipText": "If this character uses a new skill, its cooldown is increased by 2 turns."
                    }
                }
            ]
        }
    ]
};
