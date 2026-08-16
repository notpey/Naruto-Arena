module.exports = {
    "id": "yakushi-kabuto-s",
    "characterId": "yakushi-kabuto-s",
    "name": "Yakushi Kabuto (S)",
    "facePicture": "https://i.imgur.com/bFuiE0L.png",
    "characterdeescription": "Kabuto is the loyal servant of Orochimaru and is a very dangerous missing-nin. He is a calculating individual who is both accomplished at combat and healing.",
    "requiredMissionId": "a-double-agent",
    "skills": [
        {
            "id": "yakushi-kabuto-s-charging-mystical-palm",
            "name": "Charging Mystical Palm",
            "skillimage": "https://i.imgur.com/AdyJI48.png",
            "skilldescription": "Yakushi Kabuto (S) deals 20 damage to one enemy. For 1 turn, that enemy will ignore all helpful effects except energy cost changes.",
            "energy": [
                "Ninjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Chakra",
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
                    "statusId": "yakushi_kabuto_s_charging_palm_nullify",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "ignoreHelpfulNonEnergyEffects": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "Ignores all helpful effects except energy cost changes for 1 turn."
                    }
                }
            ]
        },
        {
            "id": "yakushi-kabuto-s-dead-soul-technique",
            "name": "Dead Soul Technique",
            "skillimage": "https://i.imgur.com/KeMc7ui.png",
            "skilldescription": "Yakushi Kabuto (S) targets one enemy, dealing 30 piercing damage to them. For the rest of the game, that enemy will ignore healing effects.",
            "energy": [
                "Ninjutsu",
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
                        "ignoreDamageReduction": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "yakushi_kabuto_s_dead_soul_curse",
                    "duration": 99,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "ignoreHealing": true,
                        "tooltipText": "This character cannot be healed for the rest of the game."
                    }
                }
            ]
        },
        {
            "id": "yakushi-kabuto-s-medical-ninjutsu",
            "name": "Medical Ninjutsu",
            "skillimage": "https://i.imgur.com/BtimDkr.png",
            "skilldescription": "Yakushi Kabuto (S) heals one ally or himself for 25 health and removes all enemy affliction skills from them.",
            "energy": [
                "Ninjutsu"
            ],
            "target": "single-ally",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "heal",
                    "amount": 25,
                    "scope": "target"
                },
                {
                    "type": "remove_status",
                    "scope": "target",
                    "metadata": {
                        "afflictionOnly": true,
                        "harmfulOnly": true
                    }
                }
            ]
        },
        {
            "id": "yakushi-kabuto-s-precise-evasion",
            "name": "Precise Evasion",
            "skillimage": "https://i.imgur.com/WaHCzhg.png",
            "skilldescription": "This skill makes Yakushi Kabuto (S) invulnerable for 1 turn.",
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
                    "statusId": "yakushi_kabuto_s_precise_evasion_invul",
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
