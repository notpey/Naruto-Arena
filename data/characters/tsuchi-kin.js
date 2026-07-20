module.exports = {
    "id": "tsuchi-kin",
    "characterId": "tsuchi-kin",
    "name": "Tsuchi Kin",
    "facePicture": "https://i.imgur.com/hOoNOfj.png",
    "characterdeescription": "Tsuchi Kin is a kunoichi of the Hidden Sound who weaponizes resonance and deception through the ringing of her bells. She excels at destabilizing opponents, unraveling their rhythm before striking with precision. Every bell she casts is a trap layered within another, turning confidence into hesitation and timing into ruin.",
    "skills": [
        {
            "id": "tsuchi-kin-illusion-bell-needles",
            "name": "Illusion Bell Needles",
            "skillimage": "https://i.imgur.com/wFHxiW6.png",
            "skilldescription": "One enemy takes 25 damage. If used after 'Needle and Bell Trap', the target has all their skills silenced for 1 turn. If used after 'Unnerving Bells', the target has all their skills delayed for 1 turn. If used on a disoriented enemy, they will deal 10 less non-affliction damage for 1 turn.",
            "energy": [
                "Genjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Mental",
                "Ranged",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 25
                },
                {
                    "type": "apply_status",
                    "statusId": "tsuchi_kin_illusion_bell_silence",
                    "duration": 1,
                    "scope": "target",
                    "condition": {
                        "scope": "self",
                        "statusId": "tsuchi_kin_illusion_bell_trigger_needle_and_bell_trap"
                    },
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "silenceNonDamageEffects": true,
                        "tooltipText": "Silenced: only damage from this character's skills will work."
                    }
                },
                {
                    "type": "modify_cooldowns",
                    "amount": 1,
                    "includeAllCharacterSkills": true,
                    "scope": "target",
                    "condition": {
                        "scope": "self",
                        "statusId": "tsuchi_kin_illusion_bell_trigger_unnerving_bells"
                    },
                    "metadata": {
                        "harmful": true,
                        "tooltipText": "This character's skill cooldowns were delayed by 1 turn."
                    }
                },
                {
                    "type": "damage",
                    "amount": 5,
                    "condition": {
                        "scope": "self",
                        "statusId": "tsuchi_kin_illusion_bell_trigger_needle_and_bell_trap",
                        "consumeOnMatch": true
                    }
                },
                {
                    "type": "damage",
                    "amount": 5,
                    "condition": {
                        "scope": "self",
                        "statusId": "tsuchi_kin_illusion_bell_trigger_unnerving_bells",
                        "consumeOnMatch": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "tsuchi_kin_disoriented_damage_debuff",
                    "duration": 1,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "statusId": "tsuchi_kin_disoriented"
                    },
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "NonAfflictionDamageDebuff": 10,
                        "tooltipText": "This character deals 10 less non-affliction damage."
                    }
                }
            ]
        },
        {
            "id": "tsuchi-kin-needle-and-bell-trap",
            "name": "Needle and Bell Trap",
            "skillimage": "https://i.imgur.com/spMHiJJ.png",
            "skilldescription": "One enemy cannot reduce damage or become invulnerable for 2 turns and has their skills stunned for 1 turn. 'Illusion Bell Needles' deals 5 damage next turn.",
            "energy": [
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Physical",
                "Ranged",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "tsuchi_kin_needle_and_bell_trap_debuff",
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
                    "statusId": "tsuchi_kin_needle_and_bell_trap_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkills": true,
                        "tooltipText": "This character is stunned and cannot use skills."
                    }
                },
                {
                    "type": "cleanse_statuses",
                    "scope": "self",
                    "metadataAny": [
                        "tsuchiKinIllusionBellPrep"
                    ]
                },
                {
                    "type": "apply_status",
                    "statusId": "tsuchi_kin_illusion_bell_trigger_needle_and_bell_trap",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "tsuchiKinIllusionBellPrep": true,
                        "tooltipText": "Illusion Bell Needles is empowered by Needle and Bell Trap."
                    }
                }
            ]
        },
        {
            "id": "tsuchi-kin-unnerving-bells",
            "name": "Unnerving Bells",
            "skillimage": "https://i.imgur.com/BU6EHyR.png",
            "skilldescription": "One enemy loses 1 random chakra and becomes disoriented for 1 turn. 'Illusion Bell Needles' deals 5 additional damage next turn.",
            "energy": [
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Mental",
                "Ranged",
                "Instant"
            ],
            "effects": [
                {
                    "type": "remove_random_chakra",
                    "amount": 1,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "tsuchi_kin_disoriented",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character is disoriented by Unnerving Bells."
                    }
                },
                {
                    "type": "cleanse_statuses",
                    "scope": "self",
                    "metadataAny": [
                        "tsuchiKinIllusionBellPrep"
                    ]
                },
                {
                    "type": "apply_status",
                    "statusId": "tsuchi_kin_illusion_bell_trigger_unnerving_bells",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "tsuchiKinIllusionBellPrep": true,
                        "tooltipText": "Illusion Bell Needles is empowered by Unnerving Bells."
                    }
                }
            ]
        },
        {
            "id": "tsuchi-kin-kin-substitution",
            "name": "Kin Substitution",
            "skillimage": "https://i.imgur.com/XVx6f4x.png",
            "skilldescription": "This skill makes Tsuchi Kin invulnerable for 1 turn.",
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
