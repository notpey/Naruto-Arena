module.exports = {
    "id": "neji-hyuuga",
    "characterId": "neji-hyuuga",
    "name": "Hyuuga Neji",
    "facePicture": "https://i.imgur.com/j5onpzd.png",
    "characterdeescription": "A gifted genin of the Hyuuga clan's branch family, Neji possesses exceptional mastery of the Byakugan and Gentle Fist fighting style. Cold and calculating, he believes that one's destiny is determined at birth and that no amount of effort can change it.",
    "passive": {
        "name": "Neji's Byakugan",
        "icon": "https://i.imgur.com/ymCAsBc.png",
        "description": "Neji's skills cannot be countered."
    },
    "skills": [
        {
            "id": "neji-hyuuga-neji-gentle-fist",
            "name": "Neji Gentle Fist",
            "skillimage": "https://i.imgur.com/svJIAbh.png",
            "skilldescription": "Neji deals 20 physical damage to one enemy for 2 turns. During this time, Eight Trigram Sixty-Four Palm will cost 1 Taijutsu, 1 Random chakra.",
            "energy": [
                "Taijutsu",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "cannotBeCountered": true,
            "classes": [
                "Physical",
                "Action"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "neji_hyuuga_neji_gentle_fist",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 20,
                        "turnEndTrigger": "source_turn",
                        "turnDurationAnchor": "source_turn",
                        "ongoingClass": "action",
                        "triggerOnApply": true,
                        "tooltipText": "This character takes 20 physical damage from Neji Gentle Fist each turn."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "neji_hyuuga_gentle_fist_palm_cost",
                    "duration": 2,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "turnDurationAnchor": "source_turn",
                        "ongoingClass": "action",
                        "triggerOnApply": true,
                        "skillCostOverridesBySkillId": {
                            "neji-hyuuga-eight-trigrams-sixty-four-palms": {
                                "energy": ["Taijutsu", "Random"]
                            }
                        },
                        "tooltipText": "Eight Trigram Sixty-Four Palm costs 1 Taijutsu and 1 Random chakra."
                    }
                }
            ]
        },
        {
            "id": "neji-hyuuga-eight-trigrams-revolving-heaven",
            "name": "Eight Trigram Heavenly Spin",
            "skillimage": "https://i.imgur.com/hB5n56N.png",
            "skilldescription": "Neji deals 15 physical damage to all enemies and becomes invulnerable for 1 turn. During this time, Eight Trigram Sixty-Four Palm will cost 1 Bloodline, 1 Random chakra.",
            "energy": [
                "Bloodline"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 2,
            "cannotBeCountered": true,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 15,
                    "scope": "all-enemy"
                },
                {
                    "type": "apply_status",
                    "statusId": "neji_hyuuga_heavenly_spin",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "invulnerable": true,
                        "skillCostOverridesBySkillId": {
                            "neji-hyuuga-eight-trigrams-sixty-four-palms": {
                                "energy": ["Bloodline", "Random"]
                            }
                        },
                        "tooltipText": "Neji is invulnerable. Eight Trigram Sixty-Four Palm costs 1 Bloodline and 1 Random chakra."
                    }
                }
            ]
        },
        {
            "id": "neji-hyuuga-eight-trigrams-sixty-four-palms",
            "name": "Eight Trigram Sixty-Four Palm",
            "skillimage": "https://i.imgur.com/KgBRINj.png",
            "skilldescription": "Neji deals 35 physical damage to one enemy and removes 1 random chakra.",
            "energy": [
                "Taijutsu",
                "Bloodline"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "cannotBeCountered": true,
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
                    "type": "remove_random_chakra",
                    "amount": 1,
                    "scope": "target"
                }
            ]
        },
        {
            "id": "neji-hyuuga-byakugan-insight",
            "name": "Byakugan Insight",
            "skillimage": "https://i.imgur.com/Yw9xYPS.png",
            "skilldescription": "Neji becomes invulnerable for 1 turn.",
            "energy": [
                "Random"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 4,
            "cannotBeCountered": true,
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
