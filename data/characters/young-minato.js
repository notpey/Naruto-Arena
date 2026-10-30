module.exports = {
    "id": "young-minato",
    "characterId": "young-minato",
    "name": "Young Minato",
    "facePicture": "https://i.imgur.com/REfg6Ri.png",
    "characterdeescription": "Minato is a prodigy kid from the Hidden Leaf Village who is capable of fighting other shinobi in higher ranks by having faster and stronger taijutsu skills. He entered the Hidden Leaf's Academy with the dream of earning the villagers' respect and recognition by becoming Hokage. ORIGINAL DESIGN: Liann",
    "requiredMissionId": null,
    "skills": [
        {
            "id": "young-minato-speedy-flanker",
            "name": "Speedy Flanker",
            "skillimage": "deadcharacter-remaster.png?v=2",
            "skilldescription": "Young Minato deals 25 damage to one enemy. If Young Minato's health is at 40 or below, this skill will also stun the enemy for 1 turn. This skill cannot be countered.",
            "energy": [
                "Taijutsu"
            ],
            "target": "single-enemy",
            "cannotBeCountered": true,
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
                    "statusId": "young_minato_speedy_flanker_stun",
                    "duration": 1,
                    "scope": "target",
                    "condition": {
                        "scope": "self",
                        "sourceCurrentHpAtMost": 40
                    },
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkills": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character is stunned for 1 turn by Speedy Flanker if Young Minato is at 40 HP or below."
                    }
                }
            ]
        },
        {
            "id": "young-minato-night-saviour",
            "name": "Night Saviour",
            "skillimage": "deadcharacter-remaster.png?v=2",
            "skilldescription": "Young Minato removes all harmful skills from one ally and makes them invulnerable for 1 turn. If 'Highground Watcher' was used the previous turn, this invulnerability will last 2 turns instead.",
            "energy": [
                "Random"
            ],
            "target": "single-ally",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "cleanse_statuses",
                    "scope": "target",
                    "metadata": {
                        "cleanseHarmfulOnly": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "invulnerable",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "invulnerable": true,
                        "tooltipText": "This character is invulnerable."
                    }
                }
            ]
        },
        {
            "id": "young-minato-night-crawler",
            "name": "Night Crawler",
            "skillimage": "deadcharacter-remaster.png?v=2",
            "skilldescription": "One random enemy will have 'Speedy Flanker' applied on them. One random ally will have 'Night Saviour' applied on them. These skills' conditional effects won't trigger this way. This skill cannot be countered or reflected.",
            "energy": [
                "Taijutsu"
            ],
            "target": "self",
            "cannotBeCountered": true,
            "cannotBeReflected": true,
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 25,
                    "scope": "random-enemy"
                },
                {
                    "type": "cleanse_statuses",
                    "scope": "random-ally",
                    "metadata": {
                        "cleanseHarmfulOnly": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "invulnerable",
                    "duration": 1,
                    "scope": "random-ally",
                    "metadata": {
                        "invulnerable": true,
                        "tooltipText": "This character is invulnerable."
                    }
                }
            ]
        },
        {
            "id": "young-minato-highground-watcher",
            "name": "Highground Watcher",
            "skillimage": "deadcharacter-remaster.png?v=2",
            "skilldescription": "Young Minato becomes invulnerable for 1 turn.",
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
                },
                {
                    "type": "apply_status",
                    "statusId": "young_minato_highground_watcher_primed",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "hideTooltip": true,
                        "turnDurationAnchor": "source_turn"
                    }
                }
            ]
        }
    ]
};
