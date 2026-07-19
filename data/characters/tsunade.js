module.exports = {
    "id": "tsunade",
    "characterId": "tsunade",
    "name": "Tsunade",
    "facePicture": "https://i.imgur.com/N6D7kcS.png",
    "characterdeescription": "One of the three sannins, Tsunade is a gambling, sake drinking loving woman with a tough exterior but soft interior. Tsunade is an expert at medical jutsu, using it to remove all her wounds, or delivering high impact kicks.",
    "requiredMissionId": "disciples-of-the-slug",
    "skills": [
        {
            "id": "tsunade-heavenly-foot-of-pain",
            "name": "Heavenly Foot of Pain",
            "skillimage": "https://i.imgur.com/pZx6mNz.png",
            "skilldescription": "Tsunade deals 30 damage to one enemy and stuns their physical, mental, and strategic skills for 1 turn.",
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
                    "type": "damage",
                    "amount": 30,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "tsunade_heavenly_foot_of_pain_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkillClasses": [
                            "physical",
                            "mental",
                            "strategic"
                        ],
                        "tooltipText": "This character's physical, mental, and strategic skills are stunned."
                    }
                }
            ]
        },
        {
            "id": "tsunade-creation-rebirth",
            "name": "Creation Rebirth",
            "skillimage": "https://i.imgur.com/nSlS0Nu.png",
            "skilldescription": "Tsunade removes all harmful effects on her and then sets her health to 100 (this is a healing effect).",
            "energy": [
                "Ninjutsu",
                "Ninjutsu"
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
                    "type": "cleanse_statuses",
                    "scope": "self",
                    "harmfulOnly": true,
                    "count": 0
                },
                {
                    "type": "heal",
                    "amount": 999,
                    "scope": "self"
                }
            ]
        },
        {
            "id": "tsunade-major-summoning-katsuyu",
            "name": "Major Summoning: Katsuyu",
            "skillimage": "https://i.imgur.com/bMT9EFI.png",
            "skilldescription": "Tsunade heals herself and her allies for 45 health. For the rest of the game, Tsunade's team will be healed for 5 health each turn, and this skill will be replaced by 'Slug Division'. This skill will end if Tsunade dies.",
            "energy": [
                "Bloodline",
                "Ninjutsu",
                "Genjutsu"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "heal",
                    "amount": 45,
                    "scope": "all-allies"
                },
                {
                    "type": "apply_status",
                    "statusId": "tsunade_katsuyu_regen",
                    "duration": 99,
                    "scope": "all-allies",
                    "metadata": {
                        "helpful": true,
                        "ongoingClass": "action",
                        "turnEndHealFlat": 5,
                        "tooltipText": "This character heals 5 health each turn from Major Summoning: Katsuyu."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "tsunade_katsuyu_replacement",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "ongoingClass": "action",
                        "skillReplacements": {
                            "tsunade-major-summoning-katsuyu": "tsunade-slug-division"
                        },
                        "tooltipText": "Major Summoning: Katsuyu is replaced by Slug Division."
                    }
                }
            ]
        },
        {
            "id": "tsunade-elbow-block",
            "name": "Elbow Block",
            "skillimage": "https://i.imgur.com/wS89CFy.png",
            "skilldescription": "This skill makes Tsunade invulnerable for 1 turn.",
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
            "id": "tsunade-slug-division",
            "name": "Slug Division",
            "hiddenFromSelectionViewer": true,
            "skillimage": "https://i.imgur.com/oyxiuxw.png",
            "skilldescription": "Tsunade heals her team for 10 health and grants them 10 points of permanent destructible defense.",
            "energy": [
                "Ninjutsu"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "heal",
                    "amount": 10,
                    "scope": "all-allies"
                },
                {
                    "type": "apply_status",
                    "statusId": "tsunade_slug_division_dd",
                    "duration": 99,
                    "scope": "all-allies",
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePoints": 10,
                        "mergeNumericAddKeys": [
                            "destructibleDefensePoints"
                        ],
                        "tooltipText": "This character has 10 points of permanent destructible defense from Slug Division."
                    }
                }
            ]
        }
    ]
};
