module.exports = {
    "id": "haruno-sakura",
    "characterId": "haruno-sakura",
    "name": "Haruno Sakura",
    "facePicture": "https://i.imgur.com/q2K5CEj.png",
    "characterdeescription": "A young kunoichi with exceptional chakra control and a sharp mind, Sakura Haruno joins Team 7 alongside Naruto Uzumaki and Sasuke Uchiha, hoping to prove herself as a capable shinobi. Though initially inexperienced in combat and often overshadowed by her teammates, Sakura's early encounters with dangerous enemies begin to test her courage and strengthen her resolve to protect those she cares about.",
    "passive": {
        "name": "Inner Sakura",
        "icon": "https://i.imgur.com/srHzKvO.png",
        "description": "Quest: Sakura uses 4 skills. Each other member of Team 7 on her team counts as 1 skill.\n\nReward: Sakura awakens her Inner Sakura, ignoring partial stuns.",
        "recordEnemyStunners": {
            "statusId": "haruno_sakura_stunned_sakuras_team",
            "statusIcon": "https://www.animehistory.org/uploads/screencaps/naruto-episode-042-the-ultimate-battle-cha_/cap_14-45_f141.jpg",
            "tooltipText": "This character stunned Sakura's team this turn. Mental Overwhelm can target them."
        },
        "awakening": {
            "statusId": "haruno_sakura_inner_sakura_awakened",
            "afterOwnerSkillUses": 4,
            "allyCharacterIdsProgress": [
                "uzumaki-naruto",
                "uchiha-sasuke"
            ],
            "progressTooltipTextTemplate": "Quest: Sakura uses 4 skills. Each other member of Team 7 on her team counts as 1 skill. Progress: {awakeningSkillUses}/4.\n\nReward: Sakura awakens her Inner Sakura, ignoring partial stuns.",
            "completedTooltipText": "Inner Sakura has awakened. Sakura ignores partial stuns, and Mental Overwhelm fully stuns and deals 20 affliction damage.",
            "metadata": {
                "helpful": true,
                "permanent": true,
                "cannotBeCleansed": true,
                "sourceSkillName": "Inner Sakura",
                "ignoresPartialStuns": true,
                "skillReplacements": {
                    "haruno-sakura-mental-overwhelm": "haruno-sakura-inner-mental-overwhelm"
                },
                "tooltipText": "Inner Sakura has awakened. Sakura ignores partial stuns, and Mental Overwhelm fully stuns and deals 20 affliction damage."
            }
        }
    },
    "skills": [
        {
            "id": "haruno-sakura-sakura-kick",
            "name": "Sakura Kick",
            "skillimage": "https://i.imgur.com/8NbIpnf.png",
            "skilldescription": "Sakura deals 20 physical damage to an enemy. They will ignore healing effects for 1 turn. Rudimentary Healing will permanently heal +5 (this effect does not stack).",
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
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "haruno_sakura_sakura_kick_no_heal",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "healReceivedMultiplier": 0,
                        "tooltipText": "This character ignores healing effects."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "haruno_sakura_kick_healing_bonus",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "permanent": true,
                        "cannotBeCleansed": true,
                        "skillHealingBonuses": {
                            "haruno-sakura-rudimentary-healing": 5
                        },
                        "tooltipText": "Sakura Kick: Rudimentary Healing heals 5 more."
                    }
                }
            ]
        },
        {
            "id": "haruno-sakura-mental-overwhelm",
            "name": "Mental Overwhelm",
            "skillimage": "https://i.imgur.com/XPY7fpe.png",
            "skilldescription": "This skill can only be used on enemies who used a stun skill this turn. For 1 turn, Sakura will stun on that enemy the same classes that they stunned on Sakura's team. Rudimentary Healing will permanently heal +5 (this effect does not stack). During Inner Sakura this skill becomes a full stun every time, and deals 20 affliction damage to the enemy.",
            "energy": [
                "Genjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "targetCondition": {
                "statusId": "haruno_sakura_stunned_sakuras_team"
            },
            "classes": [
                "Chakra",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "haruno_sakura_mental_overwhelm_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "copyStunLocksFromTargetStatusId": "haruno_sakura_stunned_sakuras_team",
                        "tooltipTextTemplate": "Stunned by Mental Overwhelm: {stunLocks}.",
                        "tooltipText": "Stunned by Mental Overwhelm."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "haruno_sakura_overwhelm_healing_bonus",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "permanent": true,
                        "cannotBeCleansed": true,
                        "skillHealingBonuses": {
                            "haruno-sakura-rudimentary-healing": 5
                        },
                        "tooltipText": "Mental Overwhelm: Rudimentary Healing heals 5 more."
                    }
                }
            ]
        },
        {
            "id": "haruno-sakura-rudimentary-healing",
            "name": "Rudimentary Healing",
            "skillimage": "https://i.imgur.com/In5poGk.png",
            "skilldescription": "Sakura heals an ally or herself for 20 health.",
            "energy": [
                "Ninjutsu"
            ],
            "target": "self-or-single-ally",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "heal",
                    "amount": 20,
                    "scope": "target"
                }
            ]
        },
        {
            "id": "haruno-sakura-clone-technique",
            "name": "Clone Technique",
            "skillimage": "https://i.imgur.com/JT9UvYv.png",
            "skilldescription": "Sakura becomes invulnerable for 1 turn. Rudimentary Healing will permanently heal +5 (this effect does not stack).",
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
                },
                {
                    "type": "apply_status",
                    "statusId": "haruno_sakura_clone_healing_bonus",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "permanent": true,
                        "cannotBeCleansed": true,
                        "skillHealingBonuses": {
                            "haruno-sakura-rudimentary-healing": 5
                        },
                        "tooltipText": "Clone Technique: Rudimentary Healing heals 5 more."
                    }
                }
            ]
        },
        {
            "id": "haruno-sakura-inner-mental-overwhelm",
            "name": "Mental Overwhelm",
            "skillimage": "https://i.imgur.com/XPY7fpe.png",
            "skilldescription": "Inner Sakura: this skill can only be used on enemies who used a stun skill this turn. Sakura fully stuns that enemy for 1 turn and deals 20 affliction damage to them. Rudimentary Healing will permanently heal +5 (this effect does not stack).",
            "energy": [
                "Genjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "targetCondition": {
                "statusId": "haruno_sakura_stunned_sakuras_team"
            },
            "classes": [
                "Chakra",
                "Affliction",
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
                    "statusId": "haruno_sakura_mental_overwhelm_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkills": true,
                        "tooltipText": "Stunned by Mental Overwhelm: all skills."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "haruno_sakura_overwhelm_healing_bonus",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "permanent": true,
                        "cannotBeCleansed": true,
                        "skillHealingBonuses": {
                            "haruno-sakura-rudimentary-healing": 5
                        },
                        "tooltipText": "Mental Overwhelm: Rudimentary Healing heals 5 more."
                    }
                }
            ],
            "hiddenFromSelectionViewer": true
        }
    ]
};
