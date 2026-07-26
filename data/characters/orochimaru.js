module.exports = {
    "id": "orochimaru",
    "characterId": "orochimaru",
    "name": "Orochimaru",
    "facePicture": "https://i.imgur.com/xqD8hwf.png",
    "characterdeescription": "One of the three sannins, Orochimaru craves nothing more than to learn all the jutsu and abilities in the world. Orochimaru uses his snake summons and cursed seals to various effects, beating down his enemies regardless of their defenses.",
    "requiredMissionId": "disciples-of-the-snake",
    "skills": [
        {
            "id": "orochimaru-kusanagi",
            "name": "Kusanagi",
            "skillimage": "https://i.imgur.com/28mN4E1.png",
            "skilldescription": "Orochimaru destroys all of one enemy's destructible defense then deals 25 damage to them.",
            "energy": [
                "Taijutsu",
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
                    "type": "destroy_destructible_defense",
                    "scope": "target"
                },
                {
                    "type": "damage",
                    "amount": 25,
                    "scope": "target"
                }
            ]
        },
        {
            "id": "orochimaru-cursed-seal-technique",
            "name": "Cursed Seal Technique",
            "skillimage": "https://i.imgur.com/OPwllfS.png",
            "skilldescription": "Orochimaru targets one ally or one enemy, dealing 15 affliction damage to them. The target will gain 1 random chakra. This skill ignores invulnerability.",
            "energy": [],
            "target": "single-character",
            "damage": 0,
            "cooldown": 3,
            "ignoreInvulnerability": true,
            "classes": [
                "Affliction",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 15,
                    "scope": "target",
                    "metadata": {
                        "afflictionDamage": true
                    }
                },
                {
                    "type": "gain_chakra",
                    "amount": 1,
                    "chakraType": "random",
                    "scope": "target"
                }
            ]
        },
        {
            "id": "orochimaru-major-summoning-manda",
            "name": "Major Summoning: Manda",
            "skillimage": "https://i.imgur.com/YQEJtJR.png",
            "skilldescription": "Orochimaru deals 45 damage to one enemy. For the rest of the game, Orochimaru will gain 1 additional random chakra each turn, and this skill will be replaced by 'Constrict and Bite'. This skill will end if Orochimaru dies.",
            "energy": [
                "Taijutsu",
                "Bloodline",
                "Ninjutsu"
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
                    "amount": 45,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "orochimaru_manda_chakra_gain",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "ongoingClass": "action",
                        "turnEndGainChakra": {
                            "chakraType": "random",
                            "amount": 1
                        },
                        "turnEndTrigger": "source_turn",
                        "tooltipText": "Orochimaru gains 1 additional random chakra each turn."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "orochimaru_manda_replacement",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "ongoingClass": "action",
                        "skillReplacements": {
                            "orochimaru-major-summoning-manda": "orochimaru-constrict-and-bite"
                        },
                        "tooltipText": "Major Summoning: Manda is replaced by Constrict and Bite."
                    }
                }
            ]
        },
        {
            "id": "orochimaru-earth-clone-technique",
            "name": "Earth Clone Technique",
            "skillimage": "https://i.imgur.com/yqkQKWQ.png",
            "skilldescription": "This skill makes Orochimaru invulnerable for 1 turn.",
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
            "id": "orochimaru-constrict-and-bite",
            "name": "Constrict and Bite",
            "hiddenFromSelectionViewer": true,
            "skillimage": "https://i.imgur.com/ZZj6kHM.png",
            "skilldescription": "Orochimaru stuns one enemy for 1 turn. The following turn, Orochimaru will deal 30 damage to them.",
            "energy": [
                "Random",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Physical",
                "Control"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "orochimaru_constrict_bite_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkills": true,
                        "onExpireEffects": [
                            {
                                "type": "damage",
                                "amount": 30
                            }
                        ],
                        "tooltipText": "This character is stunned by Constrict and Bite and will take 30 damage when it ends.",
                        "ongoingClass": "control",
                        "turnDurationAnchor": "source_turn"
                    }
                }
            ]
        }
    ]
};
