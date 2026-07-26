module.exports = {
    "id": "neji-hyuuga",
    "characterId": "neji-hyuuga",
    "name": "Hyuuga Neji",
    "facePicture": "https://i.imgur.com/ExAFrus.png",
    "characterdeescription": "A member of team Gai; Neji is the most talented member of the Hyuuga clan in both mind and body. Neji can use the most powerful techniques of his clan, shutting down an enemy's chakra or defending with an absolute defense.",
    "skills": [
        {
            "id": "neji-hyuuga-neji-gentle-fist",
            "name": "Neji Gentle Fist",
            "skillimage": "https://i.imgur.com/q8jlVNU.png",
            "skilldescription": "Hyuuga Neji deals 20 damage to one enemy for 2 turns. During this time, this enemy's non-affliction damage will be lowered by 10.",
            "energy": [
                "Taijutsu",
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
                        "NonAfflictionDamageDebuff": 10,
                        "tooltipText": "This character takes 20 damage and deals 10 less non-affliction damage. Eight Trigrams Sixty-Four Palms will remove 1 additional random chakra."
                    }
                }
            ]
        },
        {
            "id": "neji-hyuuga-eight-trigrams-revolving-heaven",
            "name": "Eight Trigrams Revolving Heaven",
            "skillimage": "https://i.imgur.com/o0ufVHY.png",
            "skilldescription": "Hyuuga Neji deals 10 damage to all enemies and becomes invulnerable for 1 turn.",
            "energy": [
                "Bloodline"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Ninjutsu",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 10,
                    "scope": "all-enemy"
                },
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
            "id": "neji-hyuuga-eight-trigrams-sixty-four-palms",
            "name": "Eight Trigrams Sixty-Four Palms",
            "skillimage": "https://i.imgur.com/HsyJQsX.png",
            "skilldescription": "Hyuuga Neji deals 35 damage to one enemy and removes 1 random chakra from them. If this enemy is affected by 'Gentle Fist', 1 additional random chakra will be removed.",
            "energy": [
                "Taijutsu",
                "Bloodline"
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
                    "amount": 35,
                    "scope": "target"
                },
                {
                    "type": "remove_random_chakra",
                    "amount": 1,
                    "scope": "target"
                },
                {
                    "type": "remove_random_chakra",
                    "amount": 1,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "statusId": "neji_hyuuga_neji_gentle_fist"
                    }
                }
            ]
        },
        {
            "id": "neji-hyuuga-byakugan-insight",
            "name": "Byakugan Insight",
            "skillimage": "https://i.imgur.com/2eXVucA.png",
            "skilldescription": "This skill makes Hyuuga Neji invulnerable for 1 turn.",
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
