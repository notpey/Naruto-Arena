module.exports = {
    "id": "kimimaro",
    "characterId": "kimimaro",
    "name": "Kimimaro",
    "facePicture": "https://i.imgur.com/oC5Q8hX.png",
    "characterdeescription": "A member of the Sound Five, Kimimaro was the leader, and the strongest of the team before his illness. Kimimaro's bloodline grants him unstoppable offensive power, however, his illness is slowly killing him, giving him precious little time.",
    "requiredMissionId": "the-search-for-kimimaro",
    "skills": [
        {
            "id": "kimimaro-dance-of-the-camellia",
            "name": "Dance of the Camellia",
            "skillimage": "https://i.imgur.com/xC8MDIQ.png",
            "skilldescription": "Kimimaro deals 30 damage to one enemy. This skill cannot be countered or reflected. Kimimaro will take 5 affliction damage.",
            "energy": [
                "Taijutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "cannotBeCountered": true,
            "cannotBeReflected": true,
            "classes": [
                "Physical",
                "Instant",
                "Affliction"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 30,
                    "scope": "target"
                },
                {
                    "type": "damage",
                    "amount": 5,
                    "scope": "self",
                    "metadata": {
                        "afflictionDamage": true
                    }
                }
            ]
        },
        {
            "id": "kimimaro-dance-of-the-clematis",
            "name": "Dance of the Clematis",
            "skillimage": "https://i.imgur.com/MIrGNsC.png",
            "skilldescription": "Kimimaro deals 40 damage to one enemy and stuns them for 1 turn. This skill cannot be countered or reflected. Kimimaro will take 10 affliction damage.",
            "energy": [
                "Taijutsu",
                "Bloodline"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "cannotBeCountered": true,
            "cannotBeReflected": true,
            "classes": [
                "Physical",
                "Instant",
                "Affliction"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 40,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "kimimaro_dance_of_the_clematis_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkills": true,
                        "tooltipText": "This character is stunned by Dance of the Clematis."
                    }
                },
                {
                    "type": "damage",
                    "amount": 10,
                    "scope": "self",
                    "metadata": {
                        "afflictionDamage": true
                    }
                }
            ]
        },
        {
            "id": "kimimaro-dance-of-the-seedling-fern",
            "name": "Dance of the Seedling Fern",
            "skillimage": "https://i.imgur.com/T9Usfo0.png",
            "skilldescription": "Kimimaro deals 30 damage to all enemies and reduces their physical and chakra damage by 20 for 1 turn. This skill cannot be countered or reflected. Kimimaro will take 10 affliction damage for 2 turns.",
            "energy": [
                "Bloodline",
                "Random",
                "Random"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 2,
            "cannotBeCountered": true,
            "cannotBeReflected": true,
            "classes": [
                "Physical",
                "Strategic",
                "Instant",
                "Affliction"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 30,
                    "scope": "all-enemy"
                },
                {
                    "type": "apply_status",
                    "statusId": "kimimaro_dance_of_the_seedling_fern_debuff",
                    "duration": 1,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "damageDebuffBySkillClass": {
                            "physical": 20,
                            "energy": 20
                        },
                        "tooltipText": "This character deals 20 less physical and chakra damage."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kimimaro_dance_of_the_seedling_fern_self_damage",
                    "duration": 2,
                    "scope": "self",
                    "metadata": {
                        "harmful": true,
                        "afflictionDamage": true,
                        "turnEndDamage": 10,
                        "turnEndTrigger": "source_turn",
                        "tooltipText": "Kimimaro takes 10 affliction damage each turn."
                    }
                }
            ]
        },
        {
            "id": "kimimaro-bone-defense",
            "name": "Bone Defense",
            "skillimage": "https://i.imgur.com/NgObkLl.png",
            "skilldescription": "This skill makes Kimimaro invulnerable for 1 turn.",
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
