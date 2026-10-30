module.exports = {
    "id": "jiroubou",
    "characterId": "jiroubou",
    "name": "Jiroubou",
    "facePicture": "https://i.imgur.com/inrbCC3.png",
    "characterdeescription": "A member of the Sound Five, Jiroubou is the largest member of the team, and while he appears calm, is actually arrogant and easy to anger. Jiroubou uses his fists to attack his enemies or can manipulate the battleground around him.",
    "requiredMissionId": "the-search-for-jiroubou",
    "skills": [
        {
            "id": "jiroubou-arhat-fist",
            "name": "Arhat Fist",
            "skillimage": "https://i.imgur.com/cBKzOKe.png",
            "skilldescription": "Jiroubou deals 30 damage to one enemy. The following turn, 'Earth Mausoleum Dumpling' will deal 10 additional damage.",
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
                    "statusId": "jiroubou_arhat_fist_bonus",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillDamageBonuses": {
                            "jiroubou-earth-mausoleum-dumpling": 10
                        },
                        "removeSelfOnSkillUseSkillIds": [
                            "jiroubou-earth-mausoleum-dumpling"
                        ],
                        "tooltipText": "Earth Mausoleum Dumpling deals 10 additional damage."
                    }
                }
            ]
        },
        {
            "id": "jiroubou-earth-mausoleum-dumpling",
            "name": "Earth Mausoleum Dumpling",
            "skillimage": "https://i.imgur.com/gKynZ3c.png",
            "skilldescription": "Jiroubou deals 20 damage to all enemies. The following turn, 'Arhat Fist' will deal 10 additional damage.",
            "energy": [
                "Taijutsu",
                "Random"
            ],
            "target": "all-enemy",
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
                    "scope": "all-enemy"
                },
                {
                    "type": "apply_status",
                    "statusId": "jiroubou_earth_mausoleum_dumpling_bonus",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillDamageBonuses": {
                            "jiroubou-arhat-fist": 10
                        },
                        "removeSelfOnSkillUseSkillIds": [
                            "jiroubou-arhat-fist"
                        ],
                        "tooltipText": "Arhat Fist deals 10 additional damage."
                    }
                }
            ]
        },
        {
            "id": "jiroubou-earth-prison-of-magnificent-nothingness",
            "name": "Earth Prison of Magnificent Nothingness",
            "skillimage": "https://i.imgur.com/plmoESM.png",
            "skilldescription": "For 3 turns, Jiroubou and all allies will gain 35 points of destructible defense. One target enemy loses 1 random chakra on use and will lose 1 random chakra again if the prison survives. This skill's chakra removal effect will end if Jiroubou's destructible defense is destroyed.",
            "energy": [
                "Ninjutsu",
                "Random",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 6,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "jiroubou_earth_prison_defense",
                    "duration": 3,
                    "scope": "all-allies",
                    "condition": {
                        "scope": "target",
                        "targetRelation": "self"
                    },
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePoints": 35,
                        "removeStatusIdsFromEnemyOnBreak": [
                            "jiroubou_earth_prison_drain"
                        ],
                        "tooltipText": "This character has 35 points of destructible defense from Earth Prison of Magnificent Nothingness. If it is destroyed, this skill's chakra drain effect will end."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "jiroubou_earth_prison_defense",
                    "duration": 3,
                    "scope": "all-allies",
                    "condition": {
                        "scope": "target",
                        "targetRelation": "ally"
                    },
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePoints": 35,
                        "tooltipText": "This character has 35 points of destructible defense from Earth Prison of Magnificent Nothingness."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "jiroubou_earth_prison_drain",
                    "duration": 3,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "turnEndRemoveRandomChakra": 1,
                        "turnEndTrigger": "source_turn",
                        "tooltipText": "This character loses 1 random chakra each turn while Earth Prison survives."
                    }
                },
                {
                    "type": "remove_random_chakra",
                    "amount": 1,
                    "scope": "target"
                }
            ]
        },
        {
            "id": "jiroubou-terra-shield",
            "name": "Terra Shield",
            "skillimage": "https://i.imgur.com/gdsdurL.png",
            "skilldescription": "Jiroubou becomes invulnerable for 1 turn.",
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
