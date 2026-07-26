module.exports = {
    "id": "cursed-seal-lv1-sasuke",
    "characterId": "cursed-seal-lv1-sasuke",
    "name": "Cursed Seal Lv1 Sasuke",
    "facePicture": "https://i.imgur.com/9KgJEk8.png",
    "characterdeescription": "Sasuke is pushed into his maximum during the Chuunin Exams and ends awakening his Cursed Seal to fight the Sound Genin and save Sakura. Sasuke is not in full control of the seal yet, but his anger and power were already raised a lot. ORIGINAL DESIGN: TheDarkLegend",
    "requiredMissionId": "dark-enhancing",
    "skills": [
        {
            "id": "cursed-seal-lv1-sasuke-silent-blow",
            "name": "Silent Blow",
            "skillimage": "https://i.imgur.com/CDW4x4g.png",
            "skilldescription": "Cursed Seal Lv1 Sasuke deals 25 damage to one enemy. The following turn, Cursed Seal Lv1 Sasuke's skills will deal 5 additional damage.",
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
                    "amount": 25,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "cursed_seal_lv1_sasuke_silent_blow_delay",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "tooltipText": "This character's skills will deal 5 additional damage next turn.",
                        "onExpireEffects": [
                            {
                                "type": "apply_status",
                                "statusId": "cursed_seal_lv1_sasuke_silent_blow_buff",
                                "duration": 1,
                                "metadata": {
                                    "helpful": true,
                                    "damageBonusFlat": 5,
                                    "tooltipText": "This character's skills deal 5 additional damage."
                                }
                            }
                        ]
                    }
                }
            ]
        },
        {
            "id": "cursed-seal-lv1-sasuke-cursed-chidori",
            "name": "Cursed Chidori",
            "skillimage": "https://i.imgur.com/ApGd3KB.png",
            "skilldescription": "Cursed Seal Lv1 Sasuke deals 25 piercing damage to one enemy. The following turn, Cursed Seal Lv1 Sasuke's skills will deal 5 additional damage.",
            "energy": [
                "Ninjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Ninjutsu",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 25,
                    "scope": "target",
                    "metadata": {
                        "ignoreDamageReduction": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "cursed_seal_lv1_sasuke_cursed_chidori_delay",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "tooltipText": "This character's skills will deal 5 additional damage next turn.",
                        "onExpireEffects": [
                            {
                                "type": "apply_status",
                                "statusId": "cursed_seal_lv1_sasuke_cursed_chidori_buff",
                                "duration": 1,
                                "metadata": {
                                    "helpful": true,
                                    "damageBonusFlat": 5,
                                    "tooltipText": "This character's skills deal 5 additional damage."
                                }
                            }
                        ]
                    }
                }
            ]
        },
        {
            "id": "cursed-seal-lv1-sasuke-cursed-sharingan",
            "name": "Cursed Sharingan",
            "skillimage": "https://i.imgur.com/QKXCpCn.png",
            "skilldescription": "For 3 turns, Cursed Seal Lv1 Sasuke gains 10 points of damage reduction and targets all enemies. If they use a new harmful skill, they will take 10 additional physical and chakra damage for 1 turn. This skill cannot be countered and ends if Cursed Seal Lv1 Sasuke dies.",
            "energy": [
                "Random"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 3,
            "cannotBeCountered": true,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "cursed_seal_lv1_sasuke_cursed_sharingan_dr",
                    "duration": 3,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "damageReductionFlat": 10,
                        "tooltipText": "This character has 10 points of damage reduction."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "cursed_seal_lv1_sasuke_cursed_sharingan_trap",
                    "duration": 3,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "hideTooltipFromEnemy": true,
                        "triggerOnEnemyHarmfulSkill": true,
                        "counterStatusId": "cursed_seal_lv1_sasuke_cursed_sharingan_vulnerability",
                        "counterStatusDuration": 1,
                        "counterStatusMetadata": {
                            "harmful": true,
                            "damageTakenBonusBySkillClass": {
                                "physical": 10,
                                "energy": 10
                            },
                            "tooltipText": "This character takes 10 additional physical and chakra damage."
                        },
                        "tooltipText": "If this character uses a new harmful skill, they will take 10 additional physical and chakra damage."
                    }
                }
            ]
        },
        {
            "id": "cursed-seal-lv1-sasuke-dark-aura",
            "name": "Dark Aura",
            "skillimage": "https://i.imgur.com/WQWQgc5.png",
            "skilldescription": "This skill makes Cursed Seal Lv1 Sasuke invulnerable for 1 turn.",
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
                    "statusId": "cursed_seal_lv1_sasuke_dark_aura",
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
