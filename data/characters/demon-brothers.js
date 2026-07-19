module.exports = {
    "id": "demon-brothers",
    "characterId": "demon-brothers",
    "name": "Demon Brothers",
    "facePicture": "https://i.imgur.com/ekQ5QZR.png",
    "characterdeescription": "A duo of Mist ninja who work for Zabuza, the Demon Brothers specialize in assassinating their targets with their shuriken chain. Using their weapons and teamwork, the Demon Brothers can gang up on one enemy, disable him, and then kill him.",
    "requiredMissionId": "mist-ascendant",
    "skills": [
        {
            "id": "demon-brothers-chain-wrap",
            "name": "Chain Wrap",
            "skillimage": "https://i.imgur.com/qm5cAjZ.png",
            "skilldescription": "Demon Brothers stun one enemy's physical, mental, and strategic skills for 1 turn and bind them with chains for 2 turns. The following turn, this skill will be replaced by 'Chain Shred'.",
            "energy": [
                "Taijutsu"
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
                    "type": "apply_status",
                    "statusId": "demon_brothers_chain_wrap_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "cannotUseSkillClasses": [
                            "physical",
                            "mental",
                            "strategic"
                        ],
                        "tooltipText": "This character's physical, mental, and strategic skills are stunned."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "demon_brothers_bound_by_chain",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "tooltipText": "This character is bound by Demon Brothers' chains."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "demon_brothers_chain_wrap_ready",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillReplacements": {
                            "demon-brothers-chain-wrap": "demon-brothers-chain-shred"
                        },
                        "tooltipText": "Chain Wrap is replaced by Chain Shred."
                    }
                }
            ]
        },
        {
            "id": "demon-brothers-bladed-gauntlet",
            "name": "Bladed Gauntlet",
            "skillimage": "https://i.imgur.com/SjVUKDT.png",
            "skilldescription": "Demon Brothers deal 25 damage to one enemy. If this skill is used on an enemy affected by 'Chain Wrap' or 'Bound by Chain', it will deal 10 additional damage and Demon Brothers will gain 10 destructible defense.",
            "energy": [
                "Random",
                "Random"
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
                    "amount": 25,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "statusIdsAny": [
                            "demon_brothers_bound_by_chain",
                            "demon_brothers_chain_wrap_stun"
                        ],
                        "conditionalAmount": 35
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "demon_brothers_bladed_gauntlet_defense",
                    "duration": 99,
                    "scope": "self",
                    "condition": {
                        "scope": "target",
                        "statusIdsAny": [
                            "demon_brothers_bound_by_chain",
                            "demon_brothers_chain_wrap_stun"
                        ]
                    },
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePoints": 10,
                        "mergeNumericAddKeys": [
                            "destructibleDefensePoints"
                        ],
                        "tooltipText": "Demon Brothers have 10 points of destructible defense from Bladed Gauntlet."
                    }
                }
            ]
        },
        {
            "id": "demon-brothers-water-melding",
            "name": "Water Melding",
            "skillimage": "https://i.imgur.com/ogryqGA.png",
            "skilldescription": "Demon Brothers gain 15 points of permanent destructible defense and 1 green chakra.",
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
                    "type": "apply_status",
                    "statusId": "demon_brothers_water_melding_defense",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "destructibleDefensePoints": 15,
                        "mergeNumericAddKeys": [
                            "destructibleDefensePoints"
                        ],
                        "tooltipText": "Demon Brothers have 15 points of permanent destructible defense from Water Melding."
                    }
                },
                {
                    "type": "gain_chakra",
                    "amount": 1,
                    "chakraType": "taijutsu",
                    "scope": "self"
                }
            ]
        },
        {
            "id": "demon-brothers-vanish",
            "name": "Vanish",
            "skillimage": "https://i.imgur.com/1LmsPwX.png",
            "skilldescription": "This skill makes Demon Brothers invulnerable for 1 turn.",
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
            "id": "demon-brothers-chain-shred",
            "name": "Chain Shred",
            "hiddenFromSelectionViewer": true,
            "skillimage": "https://i.imgur.com/TZmKHyi.png",
            "skilldescription": "Demon Brothers target one enemy affected by 'Chain Wrap', dealing 45 piercing damage to them and re-applying 'Chain Wrap' on them.",
            "energy": [
                "Taijutsu"
            ],
            "target": "single-enemy",
            "targetCondition": {
                "statusId": "demon_brothers_chain_wrap_stun"
            },
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 45,
                    "scope": "target",
                    "metadata": {
                        "ignoreDestructibleDefense": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "demon_brothers_bound_by_chain",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "tooltipText": "This character is bound by Demon Brothers' chains."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "demon_brothers_chain_wrap_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "cannotUseSkillClasses": [
                            "physical",
                            "mental",
                            "strategic"
                        ],
                        "tooltipText": "This character's physical, mental, and strategic skills are stunned."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "demon_brothers_chain_wrap_ready",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillReplacements": {
                            "demon-brothers-chain-wrap": "demon-brothers-chain-shred"
                        },
                        "tooltipText": "Chain Wrap is replaced by Chain Shred."
                    }
                }
            ]
        }
    ]
};
