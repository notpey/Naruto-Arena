module.exports = {
    "id": "umino-iruka",
    "characterId": "umino-iruka",
    "name": "Umino Iruka",
    "facePicture": "https://i.imgur.com/snz8zD4.png",
    "characterdeescription": "An instructor for Konoha, Iruka is a caring man who has acted like something of a father and mentor to Naruto throughout his youth. Iruka fights with his allies in mind, preferring to protect them and help them as support.",
    "requiredMissionId": "duty-of-a-sensei",
    "skills": [
        {
            "id": "umino-iruka-shuriken-throw",
            "name": "Shuriken Throw",
            "skillimage": "https://i.imgur.com/LmS1XVp.png",
            "skilldescription": "Umino Iruka deals 20 damage to one enemy and 10 additional damage for each 25 health Umino Iruka has lost.",
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
                        "amountFromSourceMissingHpStep": 10,
                        "amountFromSourceMissingHpDivisor": 25
                    }
                }
            ]
        },
        {
            "id": "umino-iruka-ally-shield",
            "name": "Ally Shield",
            "skillimage": "https://i.imgur.com/KCALU7E.png",
            "skilldescription": "Umino Iruka makes one ally invulnerable for 1 turn.",
            "energy": [
                "Random"
            ],
            "target": "single-ally",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "invulnerable",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "helpful": true,
                        "invulnerable": true,
                        "tooltipText": "This character is invulnerable."
                    }
                }
            ]
        },
        {
            "id": "umino-iruka-sealed-bomb-square-release",
            "name": "Sealed Bomb Square Release",
            "skillimage": "https://i.imgur.com/TeDfWJB.png",
            "skilldescription": "Umino Iruka targets one enemy. The following turn, if that enemy uses a new harmful skill, they will take 40 damage that ignores invulnerability, and for 1 turn they will take 25 additional damage from physical and chakra skills. This skill is invisible.",
            "energy": [
                "Ninjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Energy",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "iruka_sealed_bomb_trap",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "hideTooltipFromUnitOwner": true,
                        "triggerOnEnemyHarmfulSkill": true,
                        "counterDamage": 40,
                        "counterDamageIgnoresReduction": true,
                        "counterDamageIgnoresDestructibleDefense": true,
                        "counterStatusId": "iruka_sealed_bomb_vulnerability",
                        "counterStatusDuration": 1,
                        "counterStatusMetadata": {
                            "harmful": true,
                            "damageTakenBonusBySkillClass": {
                                "physical": 25,
                                "energy": 25
                            },
                            "tooltipText": "This character takes 25 additional damage from physical and chakra skills from Sealed Bomb Square Release."
                        },
                        "tooltipText": "If this character uses a new harmful skill, they will take 40 damage from Sealed Bomb Square Release and take 25 additional damage from physical and chakra skills."
                    }
                }
            ]
        },
        {
            "id": "umino-iruka-iruka-parry",
            "name": "Iruka Parry",
            "skillimage": "https://i.imgur.com/EhxgxK3.png",
            "skilldescription": "This skill makes Umino Iruka invulnerable for 1 turn.",
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
