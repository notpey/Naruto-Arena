module.exports = {
    "id": "mizuki",
    "characterId": "mizuki",
    "name": "Mizuki",
    "facePicture": "https://i.imgur.com/NZS59L7.png",
    "characterdeescription": "An instructor for Konoha, Mizuki is a chuunin and old friend of Iruka that over time grew jealous and petty. While Mizuki doesn't have any special abilities, he knows to instead be patient, and wait until the right time to strike.",
    "requiredMissionId": "a-dishonored-shinobi",
    "skills": [
        {
            "id": "mizuki-kunai-assault",
            "name": "Kunai Assault",
            "skillimage": "https://i.imgur.com/FZHixlO.png",
            "skilldescription": "Mizuki deals 10 piercing damage to one enemy for 3 turns. This skill stacks.",
            "energy": [
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Physical",
                "Action"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "mizuki_kunai_assault",
                    "duration": 3,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 10,
                        "turnEndTrigger": "source_turn",
                        "turnDurationAnchor": "source_turn",
                        "ongoingClass": "action",
                        "ignoreTargetDamageReduction": true,
                        "triggerOnApply": true,
                        "mergeNumericAddKeys": [
                            "turnEndDamage"
                        ],
                        "tooltipText": "This character takes 10 piercing damage from Kunai Assault."
                    }
                }
            ]
        },
        {
            "id": "mizuki-execution-shuriken",
            "name": "Execution Shuriken",
            "skillimage": "https://i.imgur.com/sqwpwQd.png",
            "skilldescription": "Mizuki deals 20 damage to one enemy and 10 additional damage for each 20 health they have lost. This skill can only be used twice.",
            "energy": [
                "Taijutsu",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "maxUses": 2,
            "baseSkillId": "mizuki-execution-shuriken",
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 20,
                    "scope": "target",
                    "metadata": {
                        "amountFromTargetMissingHpStep": 10,
                        "amountFromTargetMissingHpDivisor": 20
                    }
                }
            ]
        },
        {
            "id": "mizuki-genjutsu-ambush-tactics",
            "name": "Genjutsu Ambush Tactics",
            "skillimage": "https://i.imgur.com/I4EX3j3.png",
            "skilldescription": "After 1 turn, Mizuki will become invulnerable, 'Kunai Assault' will deal 30 damage instantly and lower the target's non-affliction damage by 5, and 'Execution Shuriken' will deal 30 additional damage for 1 turn. This skill is invisible the first turn and will end if Mizuki receives new non-affliction damage.",
            "energy": [
                "Genjutsu"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "mizuki_ambush_priming",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "hideTooltipFromEnemy": true,
                        "turnDurationAnchor": "any_turn",
                        "removeStatusIdsOnNewNonAfflictionDamage": [
                            "mizuki_ambush_priming"
                        ],
                        "onExpireApplyStatusToSelf": {
                            "statusId": "mizuki_ambush_ready",
                            "duration": 1,
                            "metadata": {
                                "helpful": true,
                                "invulnerable": true,
                                "skillReplacements": {
                                    "mizuki-kunai-assault": "mizuki-kunai-assault-empowered",
                                    "mizuki-execution-shuriken": "mizuki-execution-shuriken-empowered"
                                },
                                "tooltipText": "Mizuki is invulnerable. 'Kunai Assault' deals instant damage and lowers damage, and 'Execution Shuriken' deals additional damage."
                            }
                        },
                        "tooltipText": "Mizuki is preparing an ambush."
                    }
                }
            ]
        },
        {
            "id": "mizuki-effortless-side-step",
            "name": "Effortless Side-Step",
            "skillimage": "https://i.imgur.com/Lt7IMdA.png",
            "skilldescription": "This skill makes Mizuki invulnerable for 1 turn.",
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
            "id": "mizuki-kunai-assault-empowered",
            "name": "Kunai Assault",
            "hiddenFromSelectionViewer": true,
            "skillimage": "https://i.imgur.com/FZHixlO.png",
            "skilldescription": "Mizuki deals 30 piercing damage to one enemy instantly. For 1 turn, this enemy will deal 5 less non-affliction damage.",
            "energy": [
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
                    "amount": 30,
                    "scope": "target",
                    "metadata": {
                        "ignoreDestructibleDefense": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "mizuki_empowered_kunai_assault_damage_debuff",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "NonAfflictionDamageDebuff": 5,
                        "tooltipText": "This character deals 5 less non-affliction damage.",
                        "turnDurationAnchor": "source_turn"
                    }
                }
            ]
        },
        {
            "id": "mizuki-execution-shuriken-empowered",
            "name": "Execution Shuriken",
            "hiddenFromSelectionViewer": true,
            "skillimage": "https://i.imgur.com/sqwpwQd.png",
            "skilldescription": "Mizuki deals 50 damage to one enemy and 10 additional damage for each 20 health they have lost.",
            "energy": [
                "Taijutsu",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "maxUses": 2,
            "baseSkillId": "mizuki-execution-shuriken",
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 50,
                    "scope": "target",
                    "metadata": {
                        "amountFromTargetMissingHpStep": 10,
                        "amountFromTargetMissingHpDivisor": 20
                    }
                }
            ]
        }
    ]
};
