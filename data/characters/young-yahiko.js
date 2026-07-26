module.exports = {
    "id": "young-yahiko",
    "characterId": "young-yahiko",
    "name": "Young Yahiko",
    "facePicture": "https://i.imgur.com/8vJ128J.png",
    "characterdeescription": "The Rain Orphans were three children who lost their parents due to the Hidden Rain Village's involvement in the Second Shinobi World War. Yahiko is a stoic boy who leads his team in the fight for the survival during the war. ORIGINAL DESIGN: Liann",
    "requiredMissionId": null,
    "skills": [
        {
            "id": "young-yahiko-water-release-wild-water-wave",
            "name": "Water Release: Wild Water Wave",
            "skillimage": "https://i.imgur.com/8vJ128J.png",
            "skilldescription": "Young Yahiko deals 5 damage to one enemy for 3 turns. During this time, if 'Lateral Kick' or 'Descending Fist' are used on this enemy, they will deal 5 additional damage and will also make this enemy deal 5 less non-affliction damage for 3 turns. This effect stacks.",
            "energy": [
                "Ninjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Ninjutsu",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "young_yahiko_wild_water_wave",
                    "duration": 3,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 5,
                        "turnEndTrigger": "source_turn",
                        "turnDurationAnchor": "source_turn",
                        "ongoingClass": "action",
                        "tooltipText": "This character takes 5 damage each turn from Wild Water Wave for 3 turns."
                    }
                }
            ]
        },
        {
            "id": "young-yahiko-lateral-kick",
            "name": "Lateral Kick",
            "skillimage": "https://i.imgur.com/8vJ128J.png",
            "skilldescription": "Young Yahiko deals 20 damage to one enemy. For 1 turn, if this enemy uses a new physical or strategic skill, they will take 15 damage.",
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
                    "statusId": "young_yahiko_lateral_kick_trap",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "triggerOnEnemyPhysicalOrStrategicSkill": true,
                        "counterDamage": 15,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "If this character uses a new physical or strategic skill, they will take 15 damage."
                    }
                }
            ]
        },
        {
            "id": "young-yahiko-descending-fist",
            "name": "Descending Fist",
            "skillimage": "https://i.imgur.com/8vJ128J.png",
            "skilldescription": "Young Yahiko deals 25 damage to one enemy and becomes invulnerable to physical skills for 1 turn.",
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
                },
                {
                    "type": "apply_status",
                    "statusId": "young_yahiko_physical_immunity",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "ignoreEnemyPhysicalDamage": true,
                        "tooltipText": "Young Yahiko is invulnerable to physical skills for 1 turn."
                    }
                }
            ]
        },
        {
            "id": "young-yahiko-in-the-shadows",
            "name": "In the Shadows",
            "skillimage": "https://i.imgur.com/8vJ128J.png",
            "skilldescription": "This skill makes Young Yahiko invulnerable for 1 turn.",
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
            "id": "young-yahiko-the-rain-orphans",
            "name": "The Rain Orphans",
            "skillimage": "https://i.imgur.com/8vJ128J.png",
            "skilldescription": "Everytime a character uses 'Lateral Kick', 'Winding Paper Shuriken' or 'Rinnegan Domination' while having 15 or less health, the other 2 mentioned skills will also be applied on the enemy target.",
            "energy": [],
            "target": "self",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Passive"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "the_rain_orphans_passive",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "permanent": true,
                        "rainOrphansPassive": true,
                        "tooltipText": "Everytime a character uses Lateral Kick, Winding Paper Shuriken, or Rinnegan Domination while having 15 or less health, the other 2 mentioned skills will also be applied on the enemy target."
                    }
                }
            ]
        }
    ]
};
