(function (root, factory) {
    const character = factory();
    character.tags = ['konoha-genin'];
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = character;
    } else {
        root.SASUKE_STARTER_CHARACTER = character;
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    return {
        "id": "uchiha-sasuke",
        "characterId": "uchiha-sasuke",
        "name": "Uchiha Sasuke",
        "facePicture": "https://i.imgur.com/bwuEwsM.png",
        "characterdeescription": "One of the last surviving members of the Uchiha clan, Sasuke is a gifted young shinobi driven by a single ambition: to avenge his family's massacre at the hands of his older brother, Itachi. A member of Team 7, Sasuke combines his natural talent with relentless training, mastering his clan's Fire Release techniques while gradually awakening the formidable power of the Sharingan.",
        "passive": {
            "name": "Two-Tomoe Sharingan",
            "icon": "https://i.imgur.com/IkTLWta.png",
            "description": "Quest: Sasuke uses 4 skills. Each other member of Team 7 on his team counts as 1 skill.\n\nReward: Sasuke awakens his Sharingan, unlocking Chidori and enhancing Shadow Shuriken Technique and Sasuke Evasion.",
            "awakening": {
                "statusId": "uchiha_sasuke_two_tomoe_sharingan_awakened",
                "afterOwnerSkillUses": 4,
                "allyCharacterIdsProgress": [
                    "uzumaki-naruto",
                    "haruno-sakura"
                ],
                "clearCooldownSkillIds": [
                    "uchiha-sasuke-shadow-shuriken-technique"
                ],
                "progressTooltipTextTemplate": "Quest: Sasuke uses 4 skills. Each other member of Team 7 on his team counts as 1 skill. Progress: {awakeningSkillUses}/4.\n\nReward: Sasuke awakens his Sharingan, unlocking Chidori and enhancing Shadow Shuriken Technique and Sasuke Evasion.",
                "completedTooltipText": "Two-Tomoe Sharingan has awakened. Chidori is available, and Shadow Shuriken Technique and Sasuke Evasion have 1 less cooldown.",
                "metadata": {
                    "helpful": true,
                    "permanent": true,
                    "cannotBeCleansed": true,
                    "sourceSkillName": "Two-Tomoe Sharingan",
                    "skillCooldownOverridesBySkillId": {
                        "uchiha-sasuke-shadow-shuriken-technique": 0,
                        "uchiha-sasuke-sasuke-evasion": 3
                    },
                    "tooltipText": "Two-Tomoe Sharingan has awakened. Chidori is available, and Shadow Shuriken Technique and Sasuke Evasion have 1 less cooldown."
                }
            }
        },
        "skills": [
            {
                "id": "uchiha-sasuke-shadow-shuriken-technique",
                "name": "Shadow Shuriken Technique",
                "skillimage": "https://i.imgur.com/ynDNiUT.png",
                "skilldescription": "Sasuke deals 20 physical damage to an enemy. For 1 turn, the first enemy to use a skill on Sasuke will be affected by Ninja Wire Trap. While Two-Tomoe Sharingan is active, this skill's cooldown is reduced by 1.",
                "energy": [
                    "Taijutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "classes": [
                    "Physical",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 20,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "uchiha_sasuke_shadow_shuriken_trap",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "triggerOnEnemyHarmfulSkill": true,
                            "counterCancelsSkill": false,
                            "counterStatusId": "uchiha_sasuke_ninja_wire_trap",
                            "counterStatusDuration": 1,
                            "counterStatusMetadata": {
                                "harmful": true,
                                "ongoingClass": "control",
                                "invisible": true,
                                "hideTooltipFromUnitOwner": true,
                                "copyTargetTotalSkillUseCountToKeys": [
                                    "skillUseCountSnapshot"
                                ],
                                "onExpireEffectsIfNoNewSkillUsed": [
                                    {
                                        "type": "apply_status",
                                        "statusId": "uchiha_sasuke_ninja_wire_trap_stun",
                                        "duration": 1,
                                        "metadata": {
                                            "harmful": true,
                                            "cannotUseSkillClasses": [
                                                "physical"
                                            ],
                                            "tooltipText": "This character's Physical skills are stunned by Ninja Wire Trap."
                                        }
                                    }
                                ],
                                "tooltipText": "If this character does not use a new skill, their Physical skills will be stunned for 1 turn."
                            },
                            "counterApplyStatusToRecipient": {
                                "statusId": "uchiha_sasuke_dragon_flame_ready",
                                "duration": 1,
                                "metadata": {
                                    "helpful": true,
                                    "invisible": true,
                                    "hideTooltipFromEnemy": true,
                                    "ongoingClass": "control",
                                    "controlIgnoresOwnerInvulnerability": true,
                                    "skillReplacements": {
                                        "uchiha-sasuke-ninja-wire-trap": "uchiha-sasuke-dragon-flame-jutsu"
                                    },
                                    "tooltipText": "Ninja Wire Trap is replaced by Dragon Flame Jutsu.",
                                    "turnDurationAnchor": "any_turn"
                                }
                            },
                            "tooltipText": "The first enemy to use a harmful skill on Sasuke will be affected by Ninja Wire Trap."
                        }
                    }
                ]
            },
            {
                "id": "uchiha-sasuke-ninja-wire-trap",
                "name": "Ninja Wire Trap",
                "skillimage": "https://www.animehistory.org/uploads/screencaps/naruto-episode-030-the-sharingan-revived-dragon-flame-jutsu_/cap_07-13_8a50.jpg",
                "skilldescription": "Sasuke targets an enemy for 1 turn, invisible to them. If the target does not use a skill during this turn, their physical skills will be stunned for 1 turn. The following turn, this skill is replaced by Dragon Flame Jutsu.",
                "energy": [],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Strategic",
                    "Control"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "uchiha_sasuke_ninja_wire_trap",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "ongoingClass": "control",
                            "invisible": true,
                            "hideTooltipFromUnitOwner": true,
                            "copyTargetTotalSkillUseCountToKeys": [
                                "skillUseCountSnapshot"
                            ],
                            "onExpireEffectsIfNoNewSkillUsed": [
                                {
                                    "type": "apply_status",
                                    "statusId": "uchiha_sasuke_ninja_wire_trap_stun",
                                    "duration": 1,
                                    "metadata": {
                                        "harmful": true,
                                        "cannotUseSkillClasses": [
                                            "physical"
                                        ],
                                        "tooltipText": "This character's Physical skills are stunned by Ninja Wire Trap."
                                    }
                                }
                            ],
                            "tooltipText": "If this character does not use a new skill, their Physical skills will be stunned for 1 turn."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "uchiha_sasuke_dragon_flame_ready",
                        "duration": 1,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "invisible": true,
                            "hideTooltipFromEnemy": true,
                            "ongoingClass": "control",
                            "controlIgnoresOwnerInvulnerability": true,
                            "skillReplacements": {
                                "uchiha-sasuke-ninja-wire-trap": "uchiha-sasuke-dragon-flame-jutsu"
                            },
                            "tooltipText": "Ninja Wire Trap is replaced by Dragon Flame Jutsu."
                        }
                    }
                ]
            },
            {
                "id": "uchiha-sasuke-chidori",
                "name": "Chidori",
                "skillimage": "https://i.imgur.com/ApGd3KB.png",
                "skilldescription": "Requires Two-Tomoe Sharingan. Sasuke deals 45 piercing chakra damage to an enemy.",
                "energy": [
                    "Ninjutsu",
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "actorCondition": {
                    "statusId": "uchiha_sasuke_two_tomoe_sharingan_awakened"
                },
                "classes": [
                    "Chakra",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 45,
                        "scope": "target",
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    }
                ]
            },
            {
                "id": "uchiha-sasuke-sasuke-evasion",
                "name": "Sasuke Evasion",
                "skillimage": "https://i.imgur.com/dC3c6Vs.png",
                "skilldescription": "Sasuke becomes invulnerable for 1 turn. While Two-Tomoe Sharingan is active, this skill's cooldown is reduced by 1.",
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
                            "helpful": true,
                            "invulnerable": true,
                            "tooltipText": "This character is invulnerable."
                        }
                    }
                ]
            },
            {
                "id": "uchiha-sasuke-dragon-flame-jutsu",
                "name": "Dragon Flame Jutsu",
                "skillimage": "https://i.imgur.com/60VDgWY.png",
                "skilldescription": "Sasuke deals 20 chakra damage to an enemy and 10 chakra damage to all other enemies. Enemies affected by Ninja Wire Trap take an additional 15 chakra damage.",
                "energy": [
                    "Bloodline"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Chakra",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 20,
                        "scope": "target",
                        "condition": {
                            "scope": "target",
                            "statusId": "uchiha_sasuke_ninja_wire_trap_stun",
                            "conditionalAmount": 35
                        }
                    },
                    {
                        "type": "damage",
                        "amount": 10,
                        "scope": "other-enemies",
                        "condition": {
                            "scope": "target",
                            "statusId": "uchiha_sasuke_ninja_wire_trap_stun",
                            "conditionalAmount": 25
                        }
                    }
                ]
            }
        ]
    };
});
