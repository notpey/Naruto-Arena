module.exports = {
    "id": "nara-shikamaru-s",
    "characterId": "nara-shikamaru-s",
    "name": "Nara Shikamaru (S)",
    "facePicture": "https://i.imgur.com/tXroLB1.png",
    "characterdeescription": "Once known to be one of the laziest ninja, Shikamaru has worked tireless to become not only stronger, but a leader too. More than ever before, Shikamaru excels at coming up with long winded and convoluted plans meant to defeat any enemies in his path.",
    "requiredMissionId": "where-the-shadows-lie",
    "skills": [
        {
            "id": "nara-shikamaru-s-shadow-sewing",
            "name": "Shadow Sewing",
            "skillimage": "https://i.imgur.com/OuCKCqh.png",
            "skilldescription": "Nara Shikamaru (S) deals 35 damage to one enemy and stuns their physical, energy and strategic skills for 1 turn. If this skill is used on an enemy affected by 'Long-Range Tactics', it will deal 10 additional damage.",
            "energy": [
                "Genjutsu",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Chakra",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 35,
                    "scope": "target"
                },
                {
                    "type": "damage",
                    "amount": 10,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "hasStatusId": "nara_shikamaru_s_long_range_tactics_stun"
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "nara_shikamaru_s_shadow_sewing_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkillClasses": [
                            "physical",
                            "energy",
                            "strategic"
                        ],
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character's physical, energy and strategic skills are stunned for 1 turn."
                    }
                }
            ]
        },
        {
            "id": "nara-shikamaru-s-long-range-tactics",
            "name": "Long-Range Tactics",
            "skillimage": "https://i.imgur.com/xlrjNhU.png",
            "skilldescription": "Nara Shikamaru (S) targets one enemy. That enemy has their non-strategic skills stunned 2 turns and Nara Shikamaru (S) will be invulnerable during this time.",
            "energy": [
                "Ninjutsu",
                "Genjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "nara_shikamaru_s_long_range_tactics_stun",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkillClasses": [
                            "physical",
                            "energy",
                            "mental",
                            "ninjutsu"
                        ],
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character's non-strategic skills are stunned for 2 turns."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "nara_shikamaru_s_long_range_tactics_invul",
                    "duration": 2,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "invulnerable": true,
                        "tooltipText": "Shikamaru is invulnerable during Long-Range Tactics."
                    }
                }
            ]
        },
        {
            "id": "nara-shikamaru-s-expert-analysis",
            "name": "Expert Analysis",
            "skillimage": "https://i.imgur.com/8bM6MSc.png",
            "skilldescription": "For 3 turns, any time that one target enemy uses a new skill, that enemy will be unable to reduce damage or become invulnerable and all helpful counters and reflect skills on them will be ignored for 1 turn. This skill is invisible.",
            "energy": [],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "nara_shikamaru_s_expert_analysis_mark",
                    "duration": 3,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "invisible": true,
                        "cannotReduceDamage": true,
                        "cannotBecomeInvulnerable": true,
                        "ignoreCounters": true,
                        "ignoreReflects": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character cannot reduce damage, become invulnerable, or benefit from counters/reflects."
                    }
                }
            ]
        },
        {
            "id": "nara-shikamaru-s-panicked-dodge",
            "name": "Panicked Dodge",
            "skillimage": "https://i.imgur.com/mEXRLAE.png",
            "skilldescription": "Nara Shikamaru (S) becomes invulnerable for 1 turn.",
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
                    "statusId": "nara_shikamaru_s_panicked_dodge_invul",
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
