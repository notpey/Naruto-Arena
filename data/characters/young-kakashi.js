module.exports = {
    "id": "young-kakashi",
    "characterId": "young-kakashi",
    "name": "Young Kakashi",
    "facePicture": "https://i.imgur.com/U3Ivdp4.png",
    "characterdeescription": "A jounin at the age of 13 and the son of the legendary White Fang, Kakashi is a member of Team Minato. Using his early ninjutsu, and borrowed sharingan, Kakashi can fight any adult on an equal level.",
    "skills": [
        {
            "id": "young-kakashi-white-fang-slash",
            "name": "White Fang Slash",
            "skillimage": "https://i.imgur.com/UOC5Fsb.png",
            "skilldescription": "Young Kakashi deals 20 piercing damage to one enemy. For 1 turn, this enemy will deal 5 less non-affliction damage. The following turn, Young Kakashi will deal 5 additional damage with his skills.",
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
                    "scope": "target",
                    "metadata": {
                        "ignoreDestructibleDefense": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "young_kakashi_white_fang_slash_debuff",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "nonAfflictionDamageDebuffFlat": 5,
                        "tooltipText": "This character deals 5 less non-affliction damage."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "young_kakashi_white_fang_slash_bonus",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "damageBonusFlat": 5,
                        "tooltipText": "Young Kakashi deals 5 additional damage with his skills."
                    }
                }
            ]
        },
        {
            "id": "young-kakashi-amateur-raikiri",
            "name": "Amateur Raikiri",
            "skillimage": "https://i.imgur.com/uy8jRiS.png",
            "skilldescription": "Young Kakashi deals 20 piercing damage to one enemy. For 1 turn, this enemy will deal 5 less non-affliction damage. The following turn, Young Kakashi will deal 5 additional damage with his skills.",
            "energy": [
                "Ninjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Energy",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 20,
                    "scope": "target",
                    "metadata": {
                        "ignoreDestructibleDefense": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "young_kakashi_amateur_raikiri_debuff",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "nonAfflictionDamageDebuffFlat": 5,
                        "tooltipText": "This character deals 5 less non-affliction damage."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "young_kakashi_amateur_raikiri_bonus",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "damageBonusFlat": 5,
                        "tooltipText": "Young Kakashi deals 5 additional damage with his skills."
                    }
                }
            ]
        },
        {
            "id": "young-kakashi-implanted-sharingan",
            "name": "Implanted Sharingan",
            "skillimage": "https://i.imgur.com/VrPbW1z.png",
            "skilldescription": "For 2 turns, if one enemy uses a new skill on Young Kakashi, his skills will deal 10 additional damage for 1 turn. This skill is invisible and ends when triggered.",
            "energy": [],
            "target": "self",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "young_kakashi_implanted_sharingan_trap",
                    "duration": 2,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "hideTooltipFromEnemy": true,
                        "triggerOnEnemyHarmfulSkill": true,
                        "counterApplyStatusToRecipient": {
                            "statusId": "young_kakashi_implanted_sharingan_bonus",
                            "duration": 1,
                            "metadata": {
                                "helpful": true,
                                "damageBonusFlat": 10,
                                "tooltipText": "Young Kakashi deals 10 additional damage with his skills."
                            }
                        },
                        "tooltipText": "If an enemy uses a new skill on this character, his skills deal 10 additional damage for 1 turn."
                    }
                }
            ]
        },
        {
            "id": "young-kakashi-sword-parry",
            "name": "Sword Parry",
            "skillimage": "https://i.imgur.com/V9vfQQQ.png",
            "skilldescription": "This skill makes Young Kakashi invulnerable for 1 turn.",
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
                    "statusId": "young_kakashi_sword_parry",
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
