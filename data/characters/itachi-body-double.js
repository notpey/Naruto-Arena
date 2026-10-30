module.exports = {
    "id": "itachi-body-double",
    "characterId": "itachi-body-double",
    "name": "Itachi Body Double",
    "facePicture": "https://i.imgur.com/E7mAnm3.png",
    "characterdeescription": "By using one of Pain's techniques a Sand Nin spy for Akatsuki is changed to look like Itachi. The body double is controlled by Itachi but only has a third of his chakra.",
    "requiredMissionId": "the-real-itachi",
    "skills": [
        {
            "id": "itachi-body-double-finger-genjutsu",
            "name": "Finger Genjutsu",
            "skillimage": "https://i.imgur.com/YZXkMwP.png",
            "skilldescription": "Itachi Body Double targets one enemy. If the affected enemy uses a new harmful skill, that skill will be countered, that enemy will take 10 damage, and Itachi Body Double will gain 1 genjutsu energy. The target of this skill is invisible.",
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
                    "type": "apply_status",
                    "statusId": "itachi_body_double_finger_genjutsu_mark",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "invisible": true,
                        "triggerOnEnemyHarmfulSkill": true,
                        "counterDamage": 10,
                        "counterApplyStatusToSourceOwner": {
                            "statusId": "itachi_body_double_finger_gain_chakra",
                            "duration": 1,
                            "metadata": {
                                "onApplyGainChakra": {
                                    "chakraType": "genjutsu",
                                    "amount": 1
                                }
                            }
                        },
                        "tooltipText": "The next harmful skill this character uses is countered for 10 damage and 1 Genjutsu chakra."
                    }
                }
            ]
        },
        {
            "id": "itachi-body-double-genjutsu-reversal",
            "name": "Genjutsu Reversal",
            "skillimage": "https://i.imgur.com/ZVPp494.png",
            "skilldescription": "For 2 turns, if any enemy uses a non-mental skill on Itachi Body Double, he will reflect that skill onto the enemy who used it. This skill is invisible.",
            "energy": [
                "Bloodline",
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
                    "statusId": "itachi_body_double_genjutsu_reversal_reflect",
                    "duration": 2,
                    "scope": "self",
                    "metadata": {
                        "invisible": true,
                        "reflectOnEnemyHarmfulNonMental": true,
                        "tooltipText": "This character reflects non-Mental skills back to the attacker."
                    }
                }
            ]
        },
        {
            "id": "itachi-body-double-fire-release-fireball",
            "name": "Fire Release: Fireball",
            "skillimage": "https://i.imgur.com/rIju3Zc.png",
            "skilldescription": "Itachi Body Double deals 20 damage to one enemy. The following turn, all enemies take an additional 10 affliction damage.*",
            "energy": [
                "Ninjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Chakra",
                "Instant",
                "Affliction*"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 20,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "itachi_body_double_fireball_burn",
                    "duration": 1,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "onExpireEffects": [
                            {
                                "type": "damage",
                                "amount": 10,
                                "scope": "target",
                                "metadata": {
                                    "afflictionDamage": true,
                                    "ignoreDamageReduction": true,
                                    "ignoreDestructibleDefense": true
                                }
                            }
                        ],
                        "tooltipText": "All enemies will take 10 affliction damage next turn."
                    }
                }
            ]
        },
        {
            "id": "itachi-body-double-illusionary-raven-bunshin",
            "name": "Illusionary Raven Bunshin",
            "skillimage": "https://i.imgur.com/RuNxccO.png",
            "skilldescription": "Itachi Body Double becomes invulnerable for 1 turn.",
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
                    "statusId": "itachi_body_double_raven_bunshin_invul",
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
