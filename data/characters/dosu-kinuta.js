module.exports = {
    "id": "dosu-kinuta",
    "characterId": "dosu-kinuta",
    "name": "Dosu Kinuta",
    "facePicture": "https://i.imgur.com/NY3b12m.png",
    "characterdeescription": "One of the three sound genin, and possibly the strongest; Dosu is an intelligent and patient ninja that likes to act with logic. Using a powerful sound based arm, Dosu can disable his enemies by disrupting their hearing and throwing them off.",
    "skills": [
        {
            "id": "dosu-kinuta-resonating-echo-drill",
            "name": "Resonating Echo Drill",
            "skillimage": "https://i.imgur.com/arSzsOV.png",
            "skilldescription": "Kinuta Dosu deals 20 damage to one enemy. This enemy will be unable to reduce damage or become invulnerable for 1 turn. The following turn, 'Sound Manipulation' will deal 10 additional damage to them.",
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
                    "amount": 20,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "dosu_kinuta_resonating_echo_drill_debuff",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotReduceDamage": true,
                        "cannotBecomeInvulnerable": true,
                        "tooltipText": "This character cannot reduce damage or become invulnerable."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "dosu_kinuta_resonating_echo_drill_mark",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "Dosu's Sound Manipulation will deal 10 additional damage to this character."
                    }
                }
            ]
        },
        {
            "id": "dosu-kinuta-sound-manipulation",
            "name": "Sound Manipulation",
            "skillimage": "https://i.imgur.com/eSCnMmL.png",
            "skilldescription": "Kinuta Dosu deals 10 damage to one enemy. For 1 turn, this enemy will take 5 additional damage from non-affliction skills and will deal 5 less damage with non-affliction skills. During 'Melody Arm Tuning', this skill's non-damage effects will last permanently instead and may stack.",
            "energy": [
                "Genjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Mental",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 10,
                    "scope": "target"
                },
                {
                    "type": "damage",
                    "amount": 10,
                    "scope": "target",
                    "condition": {
                        "statusId": "dosu_kinuta_resonating_echo_drill_mark",
                        "scope": "target",
                        "consumeOnMatch": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "dosu_kinuta_sound_manipulation_debuff",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "nonAfflictionDamageTakenBonusFlat": 5,
                        "nonAfflictionDamageDebuffFlat": 5,
                        "tooltipText": "This character takes 5 additional damage from non-affliction skills and deals 5 less damage with non-affliction skills.",
                        "turnDurationAnchor": "source_turn"
                    }
                }
            ]
        },
        {
            "id": "dosu-kinuta-melody-arm-tuning",
            "name": "Melody Arm Tuning",
            "skillimage": "https://i.imgur.com/yqkQKWQ.png",
            "skilldescription": "For the following 3 turns, 'Resonating Echo Drill' will deal 20 additional damage and 'Sound Manipulation' will deal 10 additional damage.",
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
                    "statusId": "dosu_kinuta_melody_arm_tuning_active",
                    "duration": 3,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillReplacements": {
                            "dosu-kinuta-resonating-echo-drill": "dosu-kinuta-resonating-echo-drill-improved",
                            "dosu-kinuta-sound-manipulation": "dosu-kinuta-sound-manipulation-improved"
                        },
                        "tooltipText": "Resonating Echo Drill deals 20 additional damage and Sound Manipulation deals 10 additional damage."
                    }
                }
            ]
        },
        {
            "id": "dosu-kinuta-agile-leap",
            "name": "Agile Leap",
            "skillimage": "https://i.imgur.com/Irubt1X.png",
            "skilldescription": "This skill makes Kinuta Dosu invulnerable for 1 turn.",
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
            "id": "dosu-kinuta-resonating-echo-drill-improved",
            "name": "Resonating Echo Drill",
            "hiddenFromSelectionViewer": true,
            "skillimage": "https://i.imgur.com/arSzsOV.png",
            "skilldescription": "Kinuta Dosu deals 40 damage to one enemy. This enemy will be unable to reduce damage or become invulnerable for 2 turns. The following turn, 'Sound Manipulation' will deal 10 additional damage to them.",
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
                    "amount": 40,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "dosu_kinuta_resonating_echo_drill_debuff",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotReduceDamage": true,
                        "cannotBecomeInvulnerable": true,
                        "tooltipText": "This character cannot reduce damage or become invulnerable."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "dosu_kinuta_resonating_echo_drill_mark",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "Dosu's Sound Manipulation will deal 10 additional damage to this character."
                    }
                }
            ]
        },
        {
            "id": "dosu-kinuta-sound-manipulation-improved",
            "name": "Sound Manipulation",
            "hiddenFromSelectionViewer": true,
            "skillimage": "https://i.imgur.com/eSCnMmL.png",
            "skilldescription": "Kinuta Dosu deals 20 damage to one enemy. This character permanently takes 5 additional damage from non-affliction skills and deals 5 less damage with non-affliction skills (stacks).",
            "energy": [
                "Genjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Mental",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 20,
                    "scope": "target"
                },
                {
                    "type": "damage",
                    "amount": 10,
                    "scope": "target",
                    "condition": {
                        "statusId": "dosu_kinuta_resonating_echo_drill_mark",
                        "scope": "target",
                        "consumeOnMatch": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "dosu_kinuta_sound_manipulation_debuff_permanent",
                    "duration": 99,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "nonAfflictionDamageTakenBonusFlat": 5,
                        "nonAfflictionDamageDebuffFlat": 5,
                        "mergeNumericAddKeys": [
                            "nonAfflictionDamageTakenBonusFlat",
                            "nonAfflictionDamageDebuffFlat"
                        ],
                        "tooltipText": "This character permanently takes 5 additional damage from non-affliction skills and deals 5 less damage with non-affliction skills (stacks)."
                    }
                }
            ]
        }
    ]
};
