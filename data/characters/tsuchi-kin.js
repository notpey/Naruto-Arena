module.exports = {
    "id": "tsuchi-kin",
    "characterId": "tsuchi-kin",
    "name": "Tsuchi Kin",
    "facePicture": "https://i.imgur.com/hOoNOfj.png",
    "characterdeescription": "Tsuchi Kin is a kunoichi of the Hidden Sound who weaponizes resonance and deception through the ringing of her bells. She excels at destabilizing opponents, unraveling their rhythm before striking with precision.",
    "skills": [
        {
            "id": "tsuchi-kin-illusion-bell-needles",
            "name": "Illusion Bell Needles",
            "skillimage": "https://i.imgur.com/wFHxiW6.png",
            "skilldescription": "Tsuchi Kin deals 20 damage to one enemy.",
            "energy": [
                "Genjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Mental",
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
            "id": "tsuchi-kin-needle-and-bell-trap",
            "name": "Needle and Bell Trap",
            "skillimage": "https://i.imgur.com/spMHiJJ.png",
            "skilldescription": "Tsuchi Kin deals 15 damage to one enemy and stuns their physical and strategic skills for 1 turn.",
            "energy": [
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 15,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "tsuchi_kin_needle_and_bell_trap_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkillClasses": [
                            "physical",
                            "strategic"
                        ],
                        "tooltipText": "This character's physical and strategic skills are stunned.",
                        "turnDurationAnchor": "source_turn"
                    }
                }
            ]
        },
        {
            "id": "tsuchi-kin-unnerving-bells",
            "name": "Unnerving Bells",
            "skillimage": "https://i.imgur.com/BU6EHyR.png",
            "skilldescription": "Tsuchi Kin deals 10 damage to one enemy and removes 1 random chakra from them.",
            "energy": [
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 10,
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
