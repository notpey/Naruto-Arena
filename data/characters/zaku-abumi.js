module.exports = {
    "id": "zaku-abumi",
    "characterId": "zaku-abumi",
    "name": "Zaku Abumi",
    "facePicture": "https://i.imgur.com/GMkH15X.png",
    "characterdeescription": "One of the three sound genin; Zaku is a willful individual who has a very strong desire to win and succeed. Using the implanted tubes in his arm, Zaku can create powerful waves of chakra, or alter the wind ever so gently to protect an ally.",
    "skills": [
        {
            "id": "zaku-abumi-decapitating-airwaves",
            "name": "Decapitating Airwaves",
            "skillimage": "https://i.imgur.com/wYuJK6u.png",
            "skilldescription": "Abumi Zaku deals 25 damage to one enemy. During the following turn, 'Extreme Decapitating Airwaves' may be used.",
            "energy": [
                "Bloodline"
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
                },
                {
                    "type": "apply_status",
                    "statusId": "zaku_abumi_decapitating_airwaves_unlock",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "turnDurationAnchor": "source_turn",
                        "skillReplacements": {
                            "zaku-abumi-extreme-decapitating-airwaves": "zaku-abumi-extreme-decapitating-airwaves-active"
                        },
                        "tooltipText": "Extreme Decapitating Airwaves may be used."
                    }
                }
            ]
        },
        {
            "id": "zaku-abumi-wall-of-air",
            "name": "Wall of Air",
            "skillimage": "https://i.imgur.com/1bKTzwA.png",
            "skilldescription": "Abumi Zaku targets one ally. The following turn, the first harmful non-strategic skill used on this ally will be countered. This skill is invisible.",
            "energy": [
                "Random"
            ],
            "target": "self-or-single-ally",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "zaku_abumi_wall_of_air",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "helpful": true,
                        "hideTooltipFromEnemy": true,
                        "triggerOnEnemyHarmfulNonStrategic": true,
                        "counterCancelsSkill": true,
                        "tooltipText": "The first non-strategic skill used on this character will be countered."
                    }
                }
            ]
        },
        {
            "id": "zaku-abumi-extreme-decapitating-airwaves",
            "name": "Extreme Decapitating Airwaves",
            "skillimage": "https://i.imgur.com/BGu8oPg.png",
            "skilldescription": "Abumi Zaku deals 45 damage to all enemies. This skill can only be used during the turn after 'Decapitating Airwaves' is used.",
            "energy": [
                "Bloodline",
                "Random",
                "Random"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 0,
            "actorCondition": {
                "statusId": "zaku_abumi_decapitating_airwaves_unlock"
            },
            "classes": [
                "Strategic",
                "Physical",
                "Instant"
            ],
            "effects": []
        },
        {
            "id": "zaku-abumi-airwave-deflection",
            "name": "Airwave Deflection",
            "skillimage": "https://i.imgur.com/yszdsLO.png",
            "skilldescription": "Abumi Zaku becomes invulnerable for 1 turn.",
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
            "id": "zaku-abumi-extreme-decapitating-airwaves-active",
            "name": "Extreme Decapitating Airwaves",
            "hiddenFromSelectionViewer": true,
            "skillimage": "https://i.imgur.com/BGu8oPg.png",
            "skilldescription": "Abumi Zaku deals 45 damage to all enemies.",
            "energy": [
                "Bloodline",
                "Random",
                "Random"
            ],
            "target": "all-enemy",
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
                    "scope": "all-enemy"
                }
            ]
        }
    ]
};
