module.exports = {
    "id": "uchiha-itachi",
    "characterId": "uchiha-itachi",
    "name": "Uchiha Itachi",
    "facePicture": "https://i.imgur.com/KOjV2Qf.png",
    "characterdeescription": "The only other surviving Uchiha, Itachi is a master of doujutsu, an S-Rank missing nin, and a member of Akatsuki, having been partnered with Hoshigaki Kisame. Despite being powerful, Itachi is slowly going blind, making his abilities weaker, but when Itachi activates his Sharingan he becomes an unstoppable force of pure power.",
    "requiredMissionId": "s-rank-criminal-itachi",
    "skills": [
        {
            "id": "uchiha-itachi-mangekyou-sharingan",
            "name": "Mangekyou Sharingan",
            "skillimage": "https://i.imgur.com/5jjNw5f.png",
            "maxUses": 1,
            "skilldescription": "For the rest of the game, Uchiha Itachi becomes invulnerable to non-strategic skills, enhances 'Amaterasu' and 'Tsukuyomi', increases their cooldowns by 2 turns, and doubles their costs. During this time, Uchiha Itachi will take 15 affliction damage each turn and ignore healing effects and this skill cannot be used again.",
            "energy": [
                "Bloodline"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Strategic",
                "Instant",
                "Affliction"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "uchiha_itachi_mangekyou_sharingan",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "invulnerableToSkillClasses": [
                            "physical",
                            "energy",
                            "mental",
                            "affliction"
                        ],
                        "skillCostOverridesBySkillId": {
                            "uchiha-itachi-amaterasu": {
                                "energy": [
                                    "Ninjutsu",
                                    "Ninjutsu"
                                ]
                            },
                            "uchiha-itachi-tsukuyomi": {
                                "energy": [
                                    "Genjutsu",
                                    "Genjutsu"
                                ]
                            }
                        },
                        "skillCooldownIncreaseBySkillId": {
                            "uchiha-itachi-amaterasu": 2,
                            "uchiha-itachi-tsukuyomi": 2
                        },
                        "skillTargetOverrides": {
                            "uchiha-itachi-amaterasu": "all-enemy"
                        },
                        "skillDurationBonuses": {
                            "uchiha-itachi-tsukuyomi": 2
                        },
                        "tooltipText": "Uchiha Itachi is invulnerable to non-strategic skills. Amaterasu and Tsukuyomi are enhanced: double cost and +2 cooldowns."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "uchiha_itachi_mangekyou_sharingan_toll",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 15,
                        "afflictionDamage": true,
                        "healReceivedMultiplier": 0,
                        "tooltipText": "Uchiha Itachi takes 15 affliction damage each turn and ignores healing effects."
                    }
                }
            ]
        },
        {
            "id": "uchiha-itachi-amaterasu",
            "name": "Amaterasu",
            "skillimage": "https://i.imgur.com/XbFWWxp.png",
            "skilldescription": "Uchiha Itachi deals 15 affliction damage to one enemy, who will take 5 affliction damage each following turn. If used during 'Mangekyou Sharingan', this skill will target all enemies and deal double damage.",
            "energy": [
                "Ninjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Affliction",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 15,
                    "scope": "target",
                    "metadata": {
                        "afflictionDamage": true,
                        "ignoreDamageReduction": true,
                        "ignoreDestructibleDefense": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "uchiha_itachi_amaterasu_dot",
                    "duration": 3,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 5,
                        "afflictionDamage": true,
                        "turnEndTrigger": "source_turn",
                        "turnDurationAnchor": "source_turn",
                        "ongoingClass": "action",
                        "tooltipText": "This character takes 5 affliction damage each turn from Amaterasu."
                    }
                }
            ]
        },
        {
            "id": "uchiha-itachi-tsukuyomi",
            "name": "Tsukuyomi",
            "skillimage": "https://i.imgur.com/EmcZEZB.png",
            "skilldescription": "Uchiha Itachi deals 20 damage to one enemy and stuns them for 1 turn. If used during 'Mangekyou Sharingan', this skill will last 3 turns.",
            "energy": [
                "Genjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Mental",
                "Control"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 20,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "uchiha_itachi_tsukuyomi_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "cannotUseSkills": true,
                        "tooltipText": "This character is stunned by Tsukuyomi.",
                        "ongoingClass": "control"
                    }
                }
            ]
        },
        {
            "id": "uchiha-itachi-sharingan-insight",
            "name": "Sharingan Insight",
            "skillimage": "https://i.imgur.com/u3zgHCh.png",
            "skilldescription": "This skill makes Uchiha Itachi invulnerable for 1 turn.",
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
                    "statusId": "uchiha_itachi_sharingan_insight",
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
