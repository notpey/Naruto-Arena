module.exports = {
    "id": "tsunade",
    "characterId": "tsunade",
    "name": "Tsunade",
    "facePicture": "https://www.animehistory.org/uploads/screencaps/naruto-episode-089-an-impossible-choice-the-pain-within-tsunade_s-heart/cap_20-38_f81e.jpg",
    "characterdeescription": "One of the three sannins, Tsunade is a gambling, sake drinking loving woman with a tough exterior but soft interior. Tsunade is an expert at medical jutsu, using it to remove all her wounds, or delivering high impact kicks.",
    "skills": [
        {
            "id": "tsunade-heavenly-foot-of-pain",
            "name": "Heavenly Foot of Pain",
            "skillimage": "https://i.imgur.com/pZx6mNz.png",
            "skilldescription": "Tsunade deals 30 physical damage to an enemy and stuns their physical and strategic skills for 1 turn.",
            "energy": [
                "Taijutsu",
                "Random"
            ],
            "target": "single-enemy",
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
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character's Physical skills are stunned.",
                        "cannotUseSkillClasses": [
                            "physical"
                        ]
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "tsunade_heavenly_foot_of_pain_stun_3",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character's Strategic skills are stunned.",
                        "cannotUseSkillClasses": [
                            "strategic"
                        ]
                    }
                }
            ]
        },
        {
            "id": "tsunade-creation-rebirth",
            "name": "Creation Rebirth",
            "skillimage": "https://i.imgur.com/nSlS0Nu.png",
            "skilldescription": "Tsunade cleanses and fully heals.",
            "energy": [
                "Ninjutsu",
                "Ninjutsu"
            ],
            "target": "self",
            "cooldown": 4,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "cleanse_statuses",
                    "scope": "self",
                    "harmfulOnly": true
                },
                {
                    "type": "heal",
                    "amount": 100,
                    "scope": "self"
                }
            ]
        },
        {
            "id": "tsunade-major-summoning-katsuyu",
            "name": "Major Summoning: Katsuyu",
            "skillimage": "https://i.imgur.com/bMT9EFI.png",
            "skilldescription": "Tsunade heals all team members for 45 hp. Permanently, the targets will heal 5 hp each turn, and this skill will be replaced by Slug Division. This skill ends if Tsunade dies.",
            "energy": [
                "Bloodline",
                "Ninjutsu",
                "Genjutsu"
            ],
            "target": "all-allies",
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
                    "statusId": "tsunade_major_summoning_katsuyu_healovertime",
                    "duration": 99,
                    "scope": "all-allies",
                    "metadata": {
                        "helpful": true,
                        "turnEndHealFlat": 5,
                        "tooltipText": "This character heals 5 health each turn."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "tsunade_major_summoning_katsuyu_transform",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillReplacements": {
                            "tsunade-major-summoning-katsuyu": "tsunade-slug-division"
                        },
                        "tooltipText": "Major Summoning: Katsuyu becomes Slug Division."
                    }
                }
            ]
        },
        {
            "id": "tsunade-elbow-block",
            "name": "Elbow Block",
            "skillimage": "https://i.imgur.com/wS89CFy.png",
            "skilldescription": "Tsunade becomes invulnerable for 1 turn.",
            "energy": [
                "Random"
            ],
            "target": "self",
            "cooldown": 4,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "tsunade_elbow_block_invulnerable",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "invulnerable": true,
                        "tooltipText": "This character is invulnerable."
                    }
                }
            ]
        },
        {
            "id": "tsunade-slug-division",
            "name": "Slug Division",
            "skillimage": "https://i.imgur.com/oyxiuxw.png",
            "skilldescription": "Tsunade heals all team members 10 hp and grants them 20 permanent affliction mitigation.\n",
            "energy": [
                "Ninjutsu"
            ],
            "target": "all-allies",
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
                }
            ],
            "hiddenFromSelectionViewer": true
        }
    ],
    "passive": {
        "name": "Legendary Sannin",
        "icon": "https://www.animehistory.org/uploads/screencaps/naruto-episode-095-the-fifth-hokage_-a-life-on-the-line_/cap_20-16_8aa7.jpg",
        "description": "When an allied Major Summoning skill is used, this character becomes invulnerable for 1 turn."
    }
};
