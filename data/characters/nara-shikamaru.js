module.exports = {
    "id": "nara-shikamaru",
    "characterId": "nara-shikamaru",
    "name": "Nara Shikamaru",
    "facePicture": "https://i.imgur.com/KbecCsk.png",
    "characterdeescription": "A Genin from Team 10, a member of the Nara clan, Shikamaru is considered to be the smartest Genin of all the Konoha 11. Using his bloodline, Shikamaru can manipulate the shadows in the battlefield to disable and attack his enemies.",
    "skills": [
        {
            "id": "nara-shikamaru-meditate",
            "name": "Meditate",
            "cannotBeCountered": true,
            "cannotBeReflected": true,
            "skillimage": "https://i.imgur.com/s3o4f1D.png",
            "skilldescription": "Nara Shikamaru targets one enemy permanently. During this time 'Shadow-Neck Bind' and 'Shadow Imitation' can be used on them. This skill ignores invulnerability and cannot be countered or reflected.",
            "energy": [],
            "target": "single-enemy",
            "targetCondition": {
                "missingStatusId": "nara_shikamaru_meditate"
            },
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "nara_shikamaru_meditate",
                    "duration": 99,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "tooltipText": "Shadow-Neck Bind and Shadow Imitation can be used on this character."
                    }
                }
            ],
            "ignoreInvulnerability": true
        },
        {
            "id": "nara-shikamaru-shadow-neck-bind",
            "name": "Shadow-Neck Bind",
            "skillimage": "https://i.imgur.com/qrtbpQH.png",
            "skilldescription": "Nara Shikamaru can only use this skill on enemies affected by 'Meditate'. Affected enemies are unable to reduce damage or become invulnerable and take 15 damage for 2 turns.",
            "energy": [
                "Genjutsu"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Ninjutsu",
                "Action"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "nara_shikamaru_shadow_neck_bind",
                    "duration": 2,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "cannotReduceDamage": true,
                        "cannotBecomeInvulnerable": true,
                        "turnEndDamage": 15,
                        "turnEndTrigger": "source_turn",
                        "turnDurationAnchor": "source_turn",
                        "ongoingClass": "action",
                        "triggerOnApply": true,
                        "tooltipText": "This character cannot reduce damage or become invulnerable and takes 15 damage."
                    }
                }
            ],
            "targetCondition": {
                "statusId": "nara_shikamaru_meditate"
            }
        },
        {
            "id": "nara-shikamaru-shadow-imitation",
            "name": "Shadow Imitation",
            "skillimage": "https://i.imgur.com/Hip2U8C.png",
            "skilldescription": "Nara Shikamaru can only use this skill on enemies affected by 'Meditate'. Affected enemies' physical, chakra, and strategic skills are stunned for 2 turns.",
            "energy": [
                "Random",
                "Random"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Strategic",
                "Control"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "nara_shikamaru_shadow_imitation",
                    "duration": 2,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkillClasses": [
                            "physical",
                            "energy",
                            "strategic",
                            "ninjutsu"
                        ],
                        "tooltipText": "This character's physical, chakra, and strategic skills are stunned.",
                        "ongoingClass": "control"
                    }
                },
                {
                    "type": "cleanse_statuses",
                    "statusId": "nara_shikamaru_meditate",
                    "scope": "all-enemy"
                }
            ],
            "targetCondition": {
                "statusId": "nara_shikamaru_meditate"
            }
        },
        {
            "id": "nara-shikamaru-shikamaru-hide",
            "name": "Shikamaru Hide",
            "skillimage": "https://i.imgur.com/NF4jrLc.png",
            "skilldescription": "This skill makes Nara Shikamaru invulnerable for 1 turn.",
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
