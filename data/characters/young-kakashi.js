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
                        "tooltipText": "This character deals 5 less non-affliction damage.",
                        "turnDurationAnchor": "source_turn"
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
                "Ninjutsu",
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
                        "tooltipText": "This character deals 5 less non-affliction damage.",
                        "turnDurationAnchor": "source_turn"
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
            "skilldescription": "Young Kakashi targets one enemy, removes 1 random chakra from their pool, and stuns their chakra skills for 1 turn.",
            "energy": [],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "remove_chakra",
                    "amount": 1,
                    "chakraType": "random",
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "young_kakashi_implanted_sharingan_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkillClasses": ["energy", "ninjutsu"],
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character's chakra skills are stunned."
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
