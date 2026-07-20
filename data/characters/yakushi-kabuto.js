module.exports = {
    "id": "yakushi-kabuto",
    "characterId": "yakushi-kabuto",
    "name": "Yakushi Kabuto",
    "facePicture": "https://i.imgur.com/uBA8Srn.png",
    "characterdeescription": "Kabuto is the close assistant and confidant to Orochimaru; calm, logical and highly intelligent, Kabuto is a mystery to many. Kabuto knows how to disrupt an enemy's body while regenerating his own.",
    "requiredMissionId": "survival",
    "skills": [
        {
            "id": "yakushi-kabuto-chakra-scalpel",
            "name": "Chakra Scalpel",
            "skillimage": "https://i.imgur.com/nHQweGx.png",
            "skilldescription": "Yakushi Kabuto deals 15 piercing damage to one enemy. For 1 turn, that enemy's skills will cost 1 additional random chakra and they will take 5 additional damage from physical and chakra skills. The following turn, 'Chakra Scalpel' will deal 10 additional damage.",
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
                    "amount": 15,
                    "scope": "target",
                    "metadata": {
                        "ignoreDamageReduction": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kabuto_chakra_scalpel_debuff",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "randomCostIncrease": 1,
                        "damageTakenBonusBySkillClass": {
                            "physical": 5,
                            "energy": 5
                        },
                        "tooltipText": "This character's skills cost 1 additional random chakra and they take 5 additional damage from physical and chakra skills."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kabuto_chakra_scalpel_bonus",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "replaceSkillDamageBonuses": true,
                        "removeSelfOnSkillUseCount": [
                            {
                                "skillId": "yakushi-kabuto-chakra-scalpel",
                                "atLeast": 1
                            }
                        ],
                        "skillDamageBonuses": {
                            "yakushi-kabuto-chakra-scalpel": 10
                        },
                        "tooltipText": "Chakra Scalpel deals 10 additional damage."
                    }
                }
            ]
        },
        {
            "id": "yakushi-kabuto-yin-healing-wound-destruction",
            "name": "Yin Healing Wound Destruction",
            "skillimage": "https://i.imgur.com/YFKXdyo.png",
            "skilldescription": "Yakushi Kabuto first removes all enemy affliction skills from himself, then heals himself for 15 health each turn for 5 turns. This skill becomes 'Critical Injury' for 5 turns after used.",
            "energy": [
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
                    "type": "cleanse_statuses",
                    "scope": "self",
                    "sourceRelation": "enemy",
                    "metadataAny": [
                        "afflictionDamage"
                    ],
                    "harmfulOnly": true,
                    "count": 0
                },
                {
                    "type": "apply_status",
                    "statusId": "kabuto_yin_healing_regen",
                    "duration": 5,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "turnEndHealFlat": 15,
                        "tooltipText": "Yakushi Kabuto heals 15 health each turn from Yin Healing Wound Destruction."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kabuto_yin_healing_replacement",
                    "duration": 5,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillReplacements": {
                            "yakushi-kabuto-yin-healing-wound-destruction": "yakushi-kabuto-critical-injury"
                        },
                        "tooltipText": "Yin Healing Wound Destruction is replaced by Critical Injury."
                    }
                }
            ]
        },
        {
            "id": "yakushi-kabuto-temple-of-nirvana",
            "name": "Temple of Nirvana",
            "skillimage": "https://i.imgur.com/JyyJvB0.png",
            "skilldescription": "The following turn, any enemy that skips using a new skill will be stunned for 1 turn and take 5 additional damage from physical and chakra skills for 2 turns. This skill is invisible.",
            "energy": [
                "Genjutsu"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "kabuto_temple_of_nirvana_watch",
                    "duration": 1,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "hideTooltipFromUnitOwner": true,
                        "copyTargetTotalSkillUseCountToKeys": [
                            "skillUseCountSnapshot"
                        ],
                        "onExpireEffectsIfNoNewSkillUsed": [
                            {
                                "type": "apply_status",
                                "statusId": "kabuto_temple_of_nirvana_stun",
                                "duration": 1,
                                "metadata": {
                                    "harmful": true,
                                    "cannotUseSkills": true,
                                    "tooltipText": "This character is stunned by Temple of Nirvana."
                                }
                            },
                            {
                                "type": "apply_status",
                                "statusId": "kabuto_temple_of_nirvana_vulnerable",
                                "duration": 2,
                                "metadata": {
                                    "harmful": true,
                                    "damageTakenBonusBySkillClass": {
                                        "physical": 5,
                                        "energy": 5
                                    },
                                    "tooltipText": "This character takes 5 additional damage from physical and chakra skills."
                                }
                            }
                        ],
                        "tooltipText": "If this character skips using a new skill, they are stunned for 1 turn and take 5 additional damage from physical and chakra skills for 2 turns."
                    }
                }
            ]
        },
        {
            "id": "yakushi-kabuto-dead-soul-technique",
            "name": "Dead Soul Technique",
            "skillimage": "https://i.imgur.com/f88Jtva.png",
            "skilldescription": "This skill makes Yakushi Kabuto invulnerable for 1 turn.",
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
            "id": "yakushi-kabuto-critical-injury",
            "name": "Critical Injury",
            "hiddenFromSelectionViewer": true,
            "skillimage": "https://i.imgur.com/YdnlhyM.png",
            "skilldescription": "Yakushi Kabuto deals 25 damage to one enemy.",
            "energy": [
                "Taijutsu"
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
                    "scope": "target"
                }
            ]
        }
    ]
};
