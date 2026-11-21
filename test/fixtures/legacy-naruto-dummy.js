// Test-only sparring partner: the pre-rework Uzumaki Naruto kit (Shadow Clone Assault, Shadow Clone
// Technique, Demon Wind Shuriken Feint, Sexy Technique). Older engine tests use it. It is not part of the game roster.
module.exports = {
    "id": "test-naruto-dummy",
    "characterId": "test-naruto-dummy",
    "name": "Naruto Sparring Dummy",
    "facePicture": "https://i.imgur.com/NwbpKdo.png",
    "characterdeescription": "Shunned by the Hidden Leaf Village for the Nine-Tailed Fox sealed within him, Naruto Uzumaki is a mischievous young genin determined to earn everyone's recognition and one day become Hokage. Armed with his newly learned Shadow Clone Technique and an unshakable spirit, Naruto begins his journey alongside Team 7, eager to prove that he's more than the village outcast.",
    "passive": {
        "name": "Kyuubi Awakening",
        "icon": "https://i.imgur.com/TxXUuaP.png",
        "description": "The first time Naruto falls to 40 or fewer health, he heals 20 health and gains 1 random chakra.",
        "onFirstHpAtMost": {
            "threshold": 40,
            "heal": 20,
            "randomChakra": 1
        }
    },
    "skills": [
        {
            "id": "test-naruto-dummy-shadow-clone-assault",
            "name": "Shadow Clone Assault",
            "skillimage": "https://i.imgur.com/VrsLUU6.png",
            "skilldescription": "Naruto deals 20 physical damage to one enemy. During Shadow Clone Technique, this skill deals 10 additional damage.",
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
                }
            ]
        },
        {
            "id": "test-naruto-dummy-shadow-clone-technique",
            "name": "Shadow Clone Technique",
            "skillimage": "https://i.imgur.com/5QFHIrv.png",
            "skilldescription": "Naruto gains 15 damage reduction for 3 turns. During this time, Shadow Clone Assault and Demon Wind Shuriken Feint are empowered.",
            "energy": [
                "Random"
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
                    "statusId": "uzumaki_naruto_shadow_clone_technique",
                    "duration": 3,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "damageReductionFlat": 15,
                        "skillDamageBonuses": {
                            "test-naruto-dummy-shadow-clone-assault": 10,
                            "test-naruto-dummy-demon-wind-shuriken-feint": 15
                        },
                        "tooltipText": "Naruto has 15 damage reduction. Shadow Clone Assault deals 10 additional damage; Demon Wind Shuriken Feint deals 15 additional damage."
                    }
                }
            ]
        },
        {
            "id": "test-naruto-dummy-demon-wind-shuriken-feint",
            "name": "Demon Wind Shuriken Feint",
            "skillimage": "https://i.imgur.com/F2Jw7I4.png",
            "skilldescription": "Naruto deals 25 physical damage to one enemy and stuns their Physical skills for 1 turn. During Shadow Clone Technique, this skill deals 15 additional damage and ends Shadow Clone Technique.",
            "energy": [
                "Taijutsu",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 2,
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
                    "statusId": "uzumaki_naruto_rasengan_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkillClasses": [
                            "physical"
                        ],
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character's Physical skills are stunned."
                    }
                },
                {
                    "type": "remove_status",
                    "statusId": "uzumaki_naruto_shadow_clone_technique",
                    "scope": "self",
                    "condition": {
                        "statusId": "uzumaki_naruto_shadow_clone_technique"
                    }
                }
            ]
        },
        {
            "id": "test-naruto-dummy-sexy-technique",
            "name": "Sexy Technique",
            "skillimage": "https://i.imgur.com/lopF3Mp.png",
            "skilldescription": "Naruto Uzumaki becomes invulnerable for 1 turn.",
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
                        "helpful": true,
                        "invulnerable": true,
                        "tooltipText": "This character is invulnerable."
                    }
                }
            ]
        }
    ]
};
