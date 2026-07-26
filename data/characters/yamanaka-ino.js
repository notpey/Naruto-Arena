module.exports = {
    "id": "yamanaka-ino",
    "characterId": "yamanaka-ino",
    "name": "Yamanaka Ino",
    "facePicture": "https://i.imgur.com/qqaI3xv.png",
    "characterdeescription": "A Genin from Team 10, Ino is a member of the Yamanaka clan, and a very confident and vain girl. Ino is able to use a variety of abilities to take over and control her enemies, making it difficult to tell friend from foe.",
    "skills": [
        {
            "id": "yamanaka-ino-mind-body-disturbance",
            "name": "Mind Body Disturbance",
            "ignoreInvulnerability": false,
            "skillimage": "https://i.imgur.com/3g2XWzn.png",
            "skilldescription": "Yamanaka Ino targets one random enemy, stunning their physical, chakra, and strategic skills for 1 turn. Another random enemy takes 25 piercing damage.",
            "energy": [
                "Genjutsu"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Mental",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "yamanaka_ino_mind_body_disturbance_control",
                    "duration": 1,
                    "scope": "random-enemy",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkillClasses": [
                            "physical",
                            "energy",
                            "strategic",
                            "ninjutsu"
                        ],
                        "tooltipText": "This character's physical, chakra, and strategic skills are stunned."
                    }
                },
                {
                    "type": "damage",
                    "amount": 25,
                    "scope": "random-enemy",
                    "metadata": {
                        "ignoreDamageReduction": true,
                        "ignoreDestructibleDefense": true
                    }
                }
            ]
        },
        {
            "id": "yamanaka-ino-mind-body-switch",
            "name": "Mind Body Switch",
            "skillimage": "https://i.imgur.com/dHM9uYL.png",
            "skilldescription": "Yamanaka Ino targets one enemy for 3 turns. On the first turn, their physical skills are stunned. On the second turn, their physical and chakra skills are stunned. On the third turn, they are fully stunned for 1 turn. During this time, this skill becomes 'Art of the Valentine'.",
            "energy": [
                "Random",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 4,
            "classes": [
                "Strategic",
                "Control"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "yamanaka_ino_mind_body_switch_stage_1",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkillClasses": [
                            "physical"
                        ],
                        "tooltipText": "This character's physical skills are stunned. Next turn, their physical and chakra skills will be stunned. After that, they will be fully stunned.",
                        "onExpireEffects": [
                            {
                                "type": "apply_status",
                                "statusId": "yamanaka_ino_mind_body_switch_stage_2",
                                "duration": 1,
                                "scope": "self",
                                "metadata": {
                                    "harmful": true,
                                    "cannotUseSkillClasses": [
                                        "physical",
                                        "energy"
                                    ],
                                    "tooltipText": "This character's physical and chakra skills are stunned.",
                                    "onExpireEffects": [
                                        {
                                            "type": "apply_status",
                                            "statusId": "yamanaka_ino_mind_body_switch_stage_3",
                                            "duration": 1,
                                            "scope": "self",
                                            "metadata": {
                                                "harmful": true,
                                                "cannotUseSkills": true,
                                                "tooltipText": "This character is stunned and cannot use skills."
                                            }
                                        }
                                    ]
                                }
                            }
                        ],
                        "ongoingClass": "control",
                        "turnDurationAnchor": "source_turn"
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "yamanaka_ino_mind_body_switch_active",
                    "duration": 3,
                    "scope": "self",
                    "metadata": {
                        "skillReplacements": {
                            "yamanaka-ino-mind-body-switch": "yamanaka-ino-art-of-the-valentine"
                        },
                        "tooltipText": "Mind Body Switch is replaced by Art of the Valentine.",
                        "ongoingClass": "control"
                    }
                }
            ]
        },
        {
            "id": "yamanaka-ino-chakra-hair-strand-trap",
            "name": "Chakra Hair Strand Trap",
            "skillimage": "https://i.imgur.com/CH2jrFU.png",
            "skilldescription": "Yamanaka Ino targets one enemy. For 1 turn, if they use a skill, they receive 10 damage, have their strategic skills stunned for 1 turn, and become unable to ignore stun effects for 1 turn. This skill is invisible.",
            "energy": [],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Ninjutsu",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "yamanaka_ino_chakra_hair_strand_trap",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "hideTooltipFromUnitOwner": true,
                        "onOwnerUseSkillTrigger": true,
                        "onOwnerUseSkillEffects": [
                            {
                                "type": "damage",
                                "amount": 10,
                                "scope": "self"
                            },
                            {
                                "type": "apply_status",
                                "statusId": "yamanaka_ino_chakra_hair_strand_trap_strategic_stun",
                                "duration": 1,
                                "scope": "self",
                                "metadata": {
                                    "harmful": true,
                                    "cannotUseSkillClasses": [
                                        "strategic"
                                    ],
                                    "cannotIgnoreStuns": true,
                                    "tooltipText": "This character's strategic skills are stunned and they cannot ignore stun effects."
                                }
                            }
                        ],
                        "tooltipText": "If this character uses a skill, they take 10 damage and their strategic skills are stunned.",
                        "turnDurationAnchor": "source_turn"
                    }
                }
            ]
        },
        {
            "id": "yamanaka-ino-ino-block",
            "name": "Ino Block",
            "skillimage": "https://i.imgur.com/ZTn3Gt4.png",
            "skilldescription": "This skill makes Yamanaka Ino invulnerable for 1 turn.",
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
            "id": "yamanaka-ino-art-of-the-valentine",
            "name": "Art of the Valentine",
            "hiddenFromSelectionViewer": true,
            "skillimage": "https://i.imgur.com/p25BBXs.png",
            "skilldescription": "Yamanaka Ino deals 15 damage to one enemy. If the target is affected by a stun effect, this skill deals 10 additional damage.",
            "energy": [
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Mental",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 15,
                    "scope": "target"
                },
                {
                    "type": "damage",
                    "amount": 10,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "statusIdsAny": [
                            "stunned",
                            "yamanaka_ino_mind_body_disturbance_control",
                            "yamanaka_ino_mind_body_switch_stage_1",
                            "yamanaka_ino_mind_body_switch_stage_2",
                            "yamanaka_ino_mind_body_switch_stage_3",
                            "nara_shikamaru_shadow_imitation",
                            "haruno_sakura_ko_punch_stun",
                            "uzumaki_naruto_rasengan_stun"
                        ]
                    }
                }
            ]
        }
    ]
};
