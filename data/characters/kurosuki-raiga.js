module.exports = {
    "id": "kurosuki-raiga",
    "characterId": "kurosuki-raiga",
    "name": "Kurosuki Raiga",
    "facePicture": "https://i.imgur.com/ndeHzMP.png",
    "characterdeescription": "Kurosuki Raiga, renowned as the Thunder of the Hidden Mist, was a jounin from the Hidden Mist Village as well as a member of the Seven Ninja Swordsmen of the Mist. Raiga wields Kiba, twin swords imbued with lightning. Considered the sharpest swords ever made, they can cut through anything. ORIGINAL DESIGN: Liann",
    "requiredMissionId": "thunder-of-the-hidden-mist",
    "skills": [
        {
            "id": "kurosuki-raiga-lightning-ball",
            "name": "Lightning Ball",
            "skillimage": "https://i.imgur.com/Zbv3Opt.png",
            "skilldescription": "Kurosuki Raiga deals 10 piercing damage to one enemy, who will take 5 additional damage from Kurosuki Raiga's skills permanently. This skill stacks and ends if Kurosuki Raiga dies.",
            "energy": [
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Ninjutsu",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 10,
                    "scope": "target",
                    "metadata": {
                        "ignoreDestructibleDefense": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kurosuki_raiga_lightning_mark",
                    "duration": 99,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "ongoingClass": "action",
                        "bonusDamageFromSourceSkillsFlat": 5,
                        "bonusDamageFromSourceCharacterId": "kurosuki-raiga",
                        "mergeNumericAddKeys": [
                            "bonusDamageFromSourceSkillsFlat"
                        ],
                        "tooltipText": "This character takes 5 additional damage from Kurosuki Raiga's skills. This effect stacks."
                    }
                }
            ]
        },
        {
            "id": "kurosuki-raiga-feast-of-lightning",
            "name": "Feast of Lightning",
            "skillimage": "https://i.imgur.com/LOoAU6E.png",
            "skilldescription": "Kurosuki Raiga makes all enemies take 5 additional damage from his skills permanently. This skill stacks and ends if Kurosuki Raiga dies.",
            "energy": [],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "kurosuki_raiga_lightning_mark",
                    "duration": 99,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "ongoingClass": "action",
                        "bonusDamageFromSourceSkillsFlat": 5,
                        "bonusDamageFromSourceCharacterId": "kurosuki-raiga",
                        "mergeNumericAddKeys": [
                            "bonusDamageFromSourceSkillsFlat"
                        ],
                        "tooltipText": "This character takes 5 additional damage from Kurosuki Raiga's skills. This effect stacks."
                    }
                }
            ]
        },
        {
            "id": "kurosuki-raiga-fangs-of-lightning",
            "name": "Fangs of Lightning",
            "skillimage": "https://i.imgur.com/tLaGdI3.png",
            "skilldescription": "Kurosuki Raiga deals 15 piercing damage to one enemy and increases the cost of that enemy's non-strategic skills by 1 random energy for 1 turn. This skill becomes 'Lightning Burial: Banquet of Lightning' permanently after used.",
            "energy": [
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Ninjutsu",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 15,
                    "scope": "target",
                    "metadata": {
                        "ignoreDestructibleDefense": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kurosuki_raiga_fangs_of_lightning_cost",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "randomCostIncreaseForSkillClasses": {
                            "physical": 1,
                            "energy": 1,
                            "mental": 1,
                            "affliction": 1,
                            "ninjutsu": 1
                        },
                        "tooltipText": "This character's non-strategic skills cost 1 additional random chakra."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kurosuki_raiga_stage_banquet",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillReplacements": {
                            "kurosuki-raiga-fangs-of-lightning": "kurosuki-raiga-lightning-burial-banquet-of-lightning"
                        },
                        "tooltipText": "Fangs of Lightning is replaced by Lightning Burial: Banquet of Lightning."
                    }
                }
            ]
        },
        {
            "id": "kurosuki-raiga-lightning-strike-armor",
            "name": "Lightning Strike Armor",
            "skillimage": "https://i.imgur.com/xJZHpqR.png",
            "skilldescription": "This skill makes Kurosuki Raiga invulnerable for 1 turn.",
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
                    "statusId": "kurosuki_raiga_lightning_strike_armor",
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
            "id": "kurosuki-raiga-lightning-burial-banquet-of-lightning",
            "name": "Lightning Burial: Banquet of Lightning",
            "hiddenFromSelectionViewer": true,
            "skillimage": "https://i.imgur.com/tLaGdI3.png",
            "skilldescription": "Kurosuki Raiga deals 15 piercing damage to the main target and 5 piercing damage to all other enemies. This skill becomes 'Siege of Lightning' permanently after used.",
            "energy": [
                "Ninjutsu",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Ninjutsu",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 15,
                    "scope": "target",
                    "metadata": {
                        "ignoreDestructibleDefense": true
                    }
                },
                {
                    "type": "damage",
                    "amount": 5,
                    "scope": "all-other-enemy",
                    "metadata": {
                        "ignoreDestructibleDefense": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kurosuki_raiga_stage_siege",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillReplacements": {
                            "kurosuki-raiga-lightning-burial-banquet-of-lightning": "kurosuki-raiga-siege-of-lightning"
                        },
                        "tooltipText": "Lightning Burial: Banquet of Lightning is replaced by Siege of Lightning."
                    }
                }
            ]
        },
        {
            "id": "kurosuki-raiga-siege-of-lightning",
            "name": "Siege of Lightning",
            "hiddenFromSelectionViewer": true,
            "skillimage": "https://i.imgur.com/ndeHzMP.png",
            "skilldescription": "Kurosuki Raiga targets all enemies. For 2 turns, every time they use a new skill, they will be dealt 15 piercing damage. This skill becomes 'Lightning Dragon Tornado' permanently after used.",
            "energy": [
                "Ninjutsu",
                "Random"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Ninjutsu",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "kurosuki_raiga_siege_trap",
                    "duration": 2,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "onOwnerUseSkillTrigger": true,
                        "preserveOnOwnerUseSkillTrigger": true,
                        "onOwnerUseSkillEffects": [
                            {
                                "type": "damage",
                                "amount": 15,
                                "metadata": {
                                    "ignoreDestructibleDefense": true
                                }
                            }
                        ],
                        "tooltipText": "Every time this character uses a new skill, they take 15 piercing damage."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kurosuki_raiga_stage_dragon_tornado",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillReplacements": {
                            "kurosuki-raiga-siege-of-lightning": "kurosuki-raiga-lightning-dragon-tornado"
                        },
                        "tooltipText": "Siege of Lightning is replaced by Lightning Dragon Tornado."
                    }
                }
            ]
        },
        {
            "id": "kurosuki-raiga-lightning-dragon-tornado",
            "name": "Lightning Dragon Tornado",
            "hiddenFromSelectionViewer": true,
            "skillimage": "https://i.imgur.com/ndeHzMP.png",
            "skilldescription": "Kurosuki Raiga deals 60 piercing damage to one enemy. This skill becomes 'Lightning Demon' permanently after used.",
            "energy": [
                "Ninjutsu",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Ninjutsu",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 60,
                    "scope": "target",
                    "metadata": {
                        "ignoreDestructibleDefense": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kurosuki_raiga_stage_demon",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillReplacements": {
                            "kurosuki-raiga-lightning-dragon-tornado": "kurosuki-raiga-lightning-demon"
                        },
                        "tooltipText": "Lightning Dragon Tornado is replaced by Lightning Demon."
                    }
                }
            ]
        },
        {
            "id": "kurosuki-raiga-lightning-demon",
            "name": "Lightning Demon",
            "hiddenFromSelectionViewer": true,
            "skillimage": "https://i.imgur.com/ndeHzMP.png",
            "maxUses": 1,
            "skilldescription": "For the rest of the game, every time an enemy uses a new skill on Kurosuki Raiga, that enemy will be dealt 100 piercing damage. This skill can only be used once and cannot be removed.",
            "energy": [
                "Ninjutsu",
                "Ninjutsu"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Ninjutsu",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "kurosuki_raiga_lightning_demon",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "cannotBeCleansed": true,
                        "triggerOnEnemyHarmfulSkill": true,
                        "counterDamage": 100,
                        "counterDamageIgnoresDestructibleDefense": true,
                        "trapReappliesSelf": true,
                        "tooltipText": "Any enemy who uses a new skill on this character takes 100 piercing damage."
                    }
                }
            ]
        }
    ]
};
