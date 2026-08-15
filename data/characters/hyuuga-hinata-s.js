module.exports = {
    "id": "hyuuga-hinata-s",
    "characterId": "hyuuga-hinata-s",
    "name": "Hyuuga Hinata (S)",
    "facePicture": "https://i.imgur.com/M5GPPe5.png",
    "characterdeescription": "With the Chuunin Exam behind her, and with Naruto's words deep in her heart, Hinata has grown and become stronger and a woman. With her mastery of the Hyuuga clan tactics, Hinata can give life to powerful chakra lions while hindering her enemies' chakra paths.",
    "requiredMissionId": "a-lovestruck-girl",
    "skills": [
        {
            "id": "hyuuga-hinata-s-pressure-point-closure",
            "name": "Pressure Point Closure",
            "skillimage": "https://i.imgur.com/djpQ5Eg.png",
            "skilldescription": "Hyuuga Hinata (S) targets one enemy, dealing 10 damage to them, increasing the cost of their skills by 1 random energy for 1 turn, and removing all stacks of 'Hinata - Eight Trigrams Field' from them (including the skill itself). During 'Hinata - Eight Trigrams Field', this skill will deal 10 additional damage.",
            "energy": [
                "Random"
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
                    "amount": 10,
                    "scope": "target"
                },
                {
                    "type": "damage",
                    "amount": 10,
                    "scope": "target",
                    "condition": {
                        "scope": "self",
                        "hasStatusId": "hyuuga_hinata_s_eight_trigrams_field_stance"
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "hyuuga_hinata_s_pressure_point_closure_debuff",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "energyCostIncrease": {
                            "random": 1
                        },
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "Skills cost 1 additional random energy."
                    }
                }
            ]
        },
        {
            "id": "hyuuga-hinata-s-gentle-step-twin-lion-fists",
            "name": "Gentle Step Twin Lion Fists",
            "skillimage": "https://i.imgur.com/48pvYwu.png",
            "skilldescription": "This skill deals 30 damage to one enemy and removes 1 random energy from them. This skill will deal 5 additional damage for each 'Pressure Point Closure' stack. Once used, this skill removes all stacks of 'Pressure Point Closure' from the targeted enemy.",
            "energy": [
                "Ninjutsu",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Energy",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 30,
                    "scope": "target"
                },
                {
                    "type": "remove_chakra",
                    "chakraType": "random",
                    "amount": 1,
                    "scope": "target"
                },
                {
                    "type": "remove_status",
                    "statusId": "hyuuga_hinata_s_pressure_point_closure_debuff",
                    "scope": "target"
                }
            ]
        },
        {
            "id": "hyuuga-hinata-s-eight-trigrams-field",
            "name": "Hinata - Eight Trigrams Field",
            "skillimage": "https://i.imgur.com/uF6EIgn.png",
            "skilldescription": "For 4 turns, if an enemy uses a new harmful skill, the energy cost increase of 'Pressure Point Closure' will last 1 additional turn on them permanently.",
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
                    "statusId": "hyuuga_hinata_s_eight_trigrams_field_stance",
                    "duration": 4,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "tooltipText": "Eight Trigrams Field is active: Pressure Point Closure deals 10 additional damage."
                    }
                }
            ]
        },
        {
            "id": "hyuuga-hinata-s-byakugan-sight",
            "name": "Byakugan Sight",
            "skillimage": "https://i.imgur.com/hPD2pLH.png",
            "skilldescription": "This skill makes Hyuuga Hinata (S) invulnerable for 1 turn.",
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
                    "statusId": "hyuuga_hinata_s_byakugan_sight_invul",
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
