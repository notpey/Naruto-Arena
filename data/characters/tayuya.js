module.exports = {
    "id": "tayuya",
    "characterId": "tayuya",
    "name": "Tayuya",
    "facePicture": "https://i.imgur.com/hAshWTO.png",
    "characterdeescription": "A member of the Sound Five, Tayuya is the only female member of the team, and the most foul-mouthed one too. Tayuya uses her flute to both trap her enemies in genjutsu while controlling the beasts she summons.",
    "requiredMissionId": "the-search-for-tayuya",
    "skills": [
        {
            "id": "tayuya-summoning-doki",
            "name": "Summoning: Doki",
            "skillimage": "https://i.imgur.com/SBJYjtZ.png",
            "skilldescription": "Tayuya deals 15 damage to all enemies for 2 turns. During this time, Tayuya will gain 15 points of damage reduction and 'Demonic Flute: Phantom Wave' will also remove 1 random chakra from its target if used.",
            "energy": [
                "Genjutsu",
                "Random"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Physical",
                "Action",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "tayuya_summoning_doki_active",
                    "duration": 2,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 15,
                        "turnEndTrigger": "source_turn",
                        "tooltipText": "This character takes 15 damage each turn from Summoning: Doki.",
                        "ongoingClass": "action"
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "tayuya_summoning_doki_self",
                    "duration": 2,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "damageReductionFlat": 15,
                        "tooltipText": "Tayuya has 15 damage reduction and Demonic Flute: Phantom Wave will also remove 1 random chakra.",
                        "ongoingClass": "action"
                    }
                }
            ]
        },
        {
            "id": "tayuya-demonic-flute-phantom-wave",
            "name": "Demonic Flute: Phantom Wave",
            "skillimage": "https://i.imgur.com/vgPEfaF.png",
            "skilldescription": "Tayuya deals 10 affliction damage to one enemy. During 'Summoning: Doki', this skill will also remove 1 random chakra from its target.",
            "energy": [
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Affliction",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 10,
                    "scope": "target",
                    "metadata": {
                        "afflictionDamage": true
                    }
                },
                {
                    "type": "remove_random_chakra",
                    "amount": 1,
                    "scope": "target",
                    "condition": {
                        "scope": "self",
                        "statusId": "tayuya_summoning_doki_self"
                    }
                }
            ]
        },
        {
            "id": "tayuya-demonic-flute",
            "name": "Demonic Flute",
            "skillimage": "https://i.imgur.com/IfHMbxw.png",
            "skilldescription": "Tayuya stuns all enemies' non-mental skills for 1 turn.",
            "energy": [
                "Genjutsu"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 5,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "tayuya_demonic_flute_stun",
                    "duration": 1,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "cannotUseNonMentalSkills": true,
                        "tooltipText": "This character's non-mental skills are stunned."
                    }
                }
            ]
        },
        {
            "id": "tayuya-insight",
            "name": "Insight",
            "skillimage": "https://i.imgur.com/sSjvCQK.png",
            "skilldescription": "This skill makes Tayuya invulnerable for 1 turn.",
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
