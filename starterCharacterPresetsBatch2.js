(function (root, factory) {
    const presets = factory();
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = presets;
    } else {
        root.STARTER_CHARACTER_PRESETS = Object.assign(root.STARTER_CHARACTER_PRESETS || {}, presets);
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    return {
        "yamanaka-ino": {
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
                                        "Strategic",
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
        },
        "rock-lee": {
                "id": "rock-lee",
                "characterId": "rock-lee",
                "name": "Rock Lee",
                "facePicture": "https://i.imgur.com/DuPEnHb.png",
                "characterdeescription": "A member of team Gai; Lee is a genin with no talent at all in ninjutsu or genjutsu, so he has focused his life all on taijutsu. With his powerful hand to hand techniques, Lee can crush any defense with his immense power.",
                "skills": [
                        {
                                "id": "rock-lee-high-speed-taijutsu",
                                "name": "High Speed Taijutsu",
                                "skillimage": "https://i.imgur.com/f59XWBW.png",
                                "skilldescription": "Rock Lee deals 25 piercing damage to one enemy. This skill requires 'Fifth Gate Opening'.",
                                "energy": [
                                        "Taijutsu"
                                ],
                                "target": "single-enemy",
                                "actorCondition": {
                                        "statusId": "rock_lee_fifth_gate_opening"
                                },
                                "damage": 0,
                                "cooldown": 0,
                                "classes": [
                                        "Physical",
                                        "Taijutsu",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "damage",
                                                "amount": 25,
                                                "scope": "target",
                                                "metadata": {
                                                        "ignoreDamageReduction": true
                                                }
                                        },
                                        {
                                                "type": "HealthLoss",
                                                "amount": 5,
                                                "scope": "self"
                                        }
                                ]
                        },
                        {
                                "id": "rock-lee-front-lotus",
                                "name": "Front Lotus",
                                "skillimage": "https://i.imgur.com/4boHWJ0.png",
                                "skilldescription": "Rock Lee deals 35 piercing damage to one enemy. For 1 turn, this skill is replaced by 'Final Lotus'. This skill requires 'Fifth Gate Opening'.",
                                "energy": [
                                        "Taijutsu",
                                        "Random"
                                ],
                                "target": "single-enemy",
                                "actorCondition": {
                                        "statusId": "rock_lee_fifth_gate_opening"
                                },
                                "damage": 0,
                                "cooldown": 1,
                                "classes": [
                                        "Physical",
                                        "Taijutsu",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "damage",
                                                "amount": 35,
                                                "scope": "target",
                                                "metadata": {
                                                        "ignoreDamageReduction": true
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "rock_lee_front_lotus_final_lotus",
                                                "duration": 1,
                                                "scope": "self",
                                                "metadata": {
                                                        "skillReplacements": {
                                                                "rock-lee-front-lotus": "rock-lee-final-lotus"
                                                        },
                                                        "tooltipText": "Front Lotus is replaced by Final Lotus."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "rock-lee-fifth-gate-opening",
                                "name": "Fifth Gate Opening",
                                "skillimage": "https://i.imgur.com/OvlloQo.png",
                                "skilldescription": "Rock Lee opens five of his chakra gates. Permanently, 'High Speed Taijutsu' and 'Front Lotus' may be used. During this time, Lee's harmful skills deal 5 additional damage each time he is damaged by an enemy skill. This skill is replaced by 'Fiery Spirit'.",
                                "energy": [],
                                "target": "self",
                                "damage": 0,
                                "cooldown": 0,
                                "classes": [
                                        "Strategic",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "apply_status",
                                                "statusId": "rock_lee_fifth_gate_opening",
                                                "duration": 99,
                                                "scope": "self",
                                                "metadata": {
                                                        "onOwnerDamagedByBaseDamageAtLeastApplyStatusToOwner": {
                                                                "threshold": 1,
                                                                "enemyOnly": true,
                                                                "duration": 99,
                                                                "statusId": "rock_lee_fifth_gate_damage_growth",
                                                                "metadata": {
                                                                        "skillDamageBonuses": {
                                                                                "rock-lee-high-speed-taijutsu": 5,
                                                                                "rock-lee-front-lotus": 5,
                                                                                "rock-lee-final-lotus": 5
                                                                        },
                                                                        "tooltipText": "Rock Lee's harmful skills deal 5 additional damage."
                                                                }
                                                        },
                                                        "skillReplacements": {
                                                                "rock-lee-fifth-gate-opening": "rock-lee-fiery-spirit"
                                                        },
                                                        "tooltipText": "Fifth Gate is open. Lee gains damage each time he is damaged by an enemy skill and Fifth Gate Opening is replaced by Fiery Spirit."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "rock-lee-lee-block",
                                "name": "Lee Block",
                                "skillimage": "https://i.imgur.com/qgiODIf.png",
                                "skilldescription": "This skill makes Rock Lee invulnerable for 1 turn.",
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
                                "id": "rock-lee-final-lotus",
                                "name": "Final Lotus",
                                "hiddenFromSelectionViewer": true,
                                "useBaseSkillCooldown": true,
                                "skillimage": "https://i.imgur.com/h658CGb.png",
                                "skilldescription": "Rock Lee deals 50 piercing damage to one enemy. This skill cannot be countered.",
                                "energy": [
                                        "Taijutsu",
                                        "Taijutsu"
                                ],
                                "target": "single-enemy",
                                "damage": 0,
                                "cooldown": 0,
                                "classes": [
                                        "Physical",
                                        "Taijutsu",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "damage",
                                                "amount": 50,
                                                "scope": "target",
                                                "metadata": {
                                                        "ignoreDamageReduction": true
                                                }
                                        }
                                ],
                                "cannotBeCountered": true
                        },
                        {
                                "id": "rock-lee-fiery-spirit",
                                "name": "Fiery Spirit",
                                "hiddenFromSelectionViewer": true,
                                "skillimage": "https://i.imgur.com/OvlloQo.png",
                                "skilldescription": "Rock Lee gains 1 taijutsu chakra and heals 10 health plus an additional 10 health for each 25 health he has lost.",
                                "energy": [
                                        "Random"
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
                                                "type": "gain_chakra",
                                                "chakraType": "taijutsu",
                                                "amount": 1,
                                                "scope": "self"
                                        },
                                        {
                                                "type": "heal",
                                                "amount": 10,
                                                "scope": "self",
                                                "metadata": {
                                                        "amountPerSourceMissingHpStep": 10,
                                                        "sourceMissingHpStep": 25
                                                }
                                        }
                                ]
                        }
                ]
        },
        "tenten": {
                "id": "tenten",
                "characterId": "tenten",
                "name": "Tenten",
                "facePicture": "https://i.imgur.com/xkYENuj.png",
                "characterdeescription": "A member of team Gai, Tenten is a tomboyish weapon specialist who believes a kunoichi can be as strong as a male ninja. In battle, Tenten surrounds the battlefield in weapons, using them for damage and for disabling her opponents.",
                "skills": [
                        {
                                "id": "tenten-twin-rising-dragons",
                                "name": "Twin Rising Dragons",
                                "skillimage": "https://i.imgur.com/735M5GV.png",
                                "skilldescription": "Tenten deals 15 damage to one enemy and 10 damage to all others. For 2 turns, all enemies will take 10 additional damage from 'Twin Rising Dragons Trap'.",
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
                                                "amount": 15,
                                                "scope": "target"
                                        },
                                        {
                                                "type": "damage",
                                                "amount": 10,
                                                "scope": "all-other-enemy"
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "tenten_twin_rising_dragons_mark",
                                                "duration": 2,
                                                "scope": "all-enemy",
                                                "condition": {
                                                        "scope": "self",
                                                        "missingStatusId": "tenten_full_release_active"
                                                },
                                                "metadata": {
                                                        "harmful": true,
                                                        "turnDurationAnchor": "source_turn",
                                                        "bonusDamageFromSourceSkillsFlat": 10,
                                                        "mergeNumericAddKeys": [
                                                                "bonusDamageFromSourceSkillsFlat"
                                                        ],
                                                        "bonusDamageFromSourceCharacterId": "tenten",
                                                        "bonusDamageAppliesToSkillIds": [
                                                                "tenten-twin-rising-dragons-trap"
                                                        ],
                                                        "tooltipTextTemplate": "This character takes {bonusDamageFromSourceSkillsFlat} additional damage from Twin Rising Dragons Trap."
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "tenten_twin_rising_dragons_mark",
                                                "duration": 2,
                                                "scope": "all-enemy",
                                                "condition": {
                                                        "scope": "self",
                                                        "statusId": "tenten_full_release_active"
                                                },
                                                "metadata": {
                                                        "harmful": true,
                                                        "turnDurationAnchor": "source_turn",
                                                        "bonusDamageFromSourceSkillsFlat": 20,
                                                        "mergeNumericAddKeys": [
                                                                "bonusDamageFromSourceSkillsFlat"
                                                        ],
                                                        "bonusDamageFromSourceCharacterId": "tenten",
                                                        "bonusDamageAppliesToSkillIds": [
                                                                "tenten-twin-rising-dragons-trap"
                                                        ],
                                                        "tooltipTextTemplate": "This character takes {bonusDamageFromSourceSkillsFlat} additional damage from Twin Rising Dragons Trap."
                                                }
                                        },
                                        {
                                                "type": "cleanse_statuses",
                                                "scope": "self",
                                                "statusId": "tenten_full_release_active",
                                                "condition": {
                                                        "scope": "self",
                                                        "statusId": "tenten_full_release_active"
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "tenten-twin-rising-dragons-trap",
                                "name": "Twin Rising Dragons Trap",
                                "skillimage": "https://i.imgur.com/pOsj115.png",
                                "skilldescription": "Tenten deals 5 damage to all enemies. Enemies affected by 'Twin Rising Dragons' will have their physical and chakra skills stunned for 1 turn and will deal 10 less physical and chakra damage. All stacks of 'Twin Rising Dragons' will be removed from all targets afterwards.",
                                "energy": [
                                        "Random"
                                ],
                                "target": "all-enemy",
                                "damage": 0,
                                "cooldown": 2,
                                "classes": [
                                        "Physical",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "damage",
                                                "amount": 5,
                                                "scope": "all-enemy"
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "tenten_twin_rising_dragons_trap_debuff",
                                                "duration": 1,
                                                "scope": "all-enemy",
                                                "condition": {
                                                        "all": [
                                                                {
                                                                        "scope": "target",
                                                                        "statusId": "tenten_twin_rising_dragons_mark"
                                                                },
                                                                {
                                                                        "scope": "self",
                                                                        "missingStatusId": "tenten_full_release_active"
                                                                }
                                                        ]
                                                },
                                                "metadata": {
                                                        "harmful": true,
                                                        "turnDurationAnchor": "source_turn",
                                                        "damageDebuffBySkillClass": {
                                                                "physical": 10,
                                                                "energy": 10
                                                        },
                                                        "tooltipText": "This character deals 10 less physical and chakra damage."
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "tenten_twin_rising_dragons_trap_debuff",
                                                "duration": 2,
                                                "scope": "all-enemy",
                                                "condition": {
                                                        "all": [
                                                                {
                                                                        "scope": "target",
                                                                        "statusId": "tenten_twin_rising_dragons_mark"
                                                                },
                                                                {
                                                                        "scope": "self",
                                                                        "statusId": "tenten_full_release_active"
                                                                }
                                                        ]
                                                },
                                                "metadata": {
                                                        "harmful": true,
                                                        "turnDurationAnchor": "source_turn",
                                                        "damageDebuffBySkillClass": {
                                                                "physical": 10,
                                                                "energy": 10
                                                        },
                                                        "tooltipText": "This character deals 10 less physical and chakra damage."
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "tenten_twin_rising_dragons_trap_skill_stun",
                                                "duration": 1,
                                                "scope": "all-enemy",
                                                "condition": {
                                                        "scope": "target",
                                                        "statusId": "tenten_twin_rising_dragons_mark"
                                                },
                                                "metadata": {
                                                        "harmful": true,
                                                        "cannotUseSkillClasses": [
                                                                "physical",
                                                                "energy",
                                                                "ninjutsu"
                                                        ],
                                                        "tooltipText": "This character's physical and chakra skills are stunned.",
                                                        "turnDurationAnchor": "source_turn"
                                                }
                                        },
                                        {
                                                "type": "cleanse_statuses",
                                                "scope": "self",
                                                "statusId": "tenten_full_release_active",
                                                "condition": {
                                                        "scope": "self",
                                                        "statusId": "tenten_full_release_active"
                                                }
                                        },
                                        {
                                                "type": "cleanse_statuses",
                                                "scope": "all-enemy",
                                                "statusId": "tenten_twin_rising_dragons_mark"
                                        }
                                ]
                        },
                        {
                                "id": "tenten-twin-rising-dragons-full-release",
                                "name": "Twin Rising Dragons Full Release",
                                "skillimage": "https://i.imgur.com/5cUbYBW.png",
                                "skilldescription": "Tenten becomes invulnerable for 1 turn and improves her harmful skills until the next time she uses one; this does not stack. Twin Rising Dragons marks will cause Twin Rising Dragons Trap to deal 20 additional damage, and Twin Rising Dragons Trap's damage reduction will last 1 additional turn.",
                                "energy": [
                                        "Random"
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
                                                "type": "apply_status",
                                                "statusId": "tenten_full_release_invulnerability",
                                                "duration": 1,
                                                "scope": "self",
                                                "metadata": {
                                                        "invulnerable": true,
                                                        "tooltipText": "Tenten is invulnerable."
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "tenten_full_release_active",
                                                "duration": 99,
                                                "scope": "self",
                                                "metadata": {
                                                        "consumeOnNextSkillUse": true,
                                                        "tooltipText": "Tenten's next harmful skill is improved. Twin Rising Dragons marks will make Twin Rising Dragons Trap deal 20 additional damage. Twin Rising Dragons Trap's damage reduction will last 1 additional turn."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "tenten-spiked-boulder-wall",
                                "name": "Spiked Boulder Wall",
                                "skillimage": "https://i.imgur.com/45XopDc.png",
                                "skilldescription": "This skill makes Tenten invulnerable for 1 turn.",
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
        },
        "neji-hyuuga": {
                "id": "neji-hyuuga",
                "characterId": "neji-hyuuga",
                "name": "Hyuuga Neji",
                "facePicture": "https://i.imgur.com/ExAFrus.png",
                "characterdeescription": "A member of team Gai; Neji is the most talented member of the Hyuuga clan in both mind and body. Neji can use the most powerful techniques of his clan, shutting down an enemy's chakra or defending with an absolute defense.",
                "skills": [
                        {
                                "id": "neji-hyuuga-neji-gentle-fist",
                                "name": "Neji Gentle Fist",
                                "skillimage": "https://i.imgur.com/q8jlVNU.png",
                                "skilldescription": "Hyuuga Neji deals 20 damage to one enemy for 2 turns. During this time, this enemy's non-affliction damage will be lowered by 10.",
                                "energy": [
                                        "Taijutsu",
                                        "Random"
                                ],
                                "target": "single-enemy",
                                "damage": 0,
                                "cooldown": 1,
                                "classes": [
                                        "Physical",
                                        "Action"
                                ],
                                "effects": [
                                        {
                                                "type": "apply_status",
                                                "statusId": "neji_hyuuga_neji_gentle_fist",
                                                "duration": 2,
                                                "scope": "target",
                                                "metadata": {
                                                        "harmful": true,
                                                        "turnEndDamage": 20,
                                                        "turnEndTrigger": "source_turn",
                                                        "turnDurationAnchor": "source_turn",
                                                        "ongoingClass": "action",
                                                        "triggerOnApply": true,
                                                        "NonAfflictionDamageDebuff": 10,
                                                        "tooltipText": "This character takes 20 damage and deals 10 less non-affliction damage."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "neji-hyuuga-eight-trigrams-revolving-heaven",
                                "name": "Eight Trigrams Revolving Heaven",
                                "skillimage": "https://i.imgur.com/o0ufVHY.png",
                                "skilldescription": "Hyuuga Neji deals 10 damage to all enemies and becomes invulnerable for 1 turn.",
                                "energy": [
                                        "Bloodline"
                                ],
                                "target": "all-enemy",
                                "damage": 0,
                                "cooldown": 1,
                                "classes": [
                                        "Ninjutsu",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "damage",
                                                "amount": 10,
                                                "scope": "all-enemy"
                                        },
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
                                "id": "neji-hyuuga-eight-trigrams-sixty-four-palms",
                                "name": "Eight Trigrams Sixty-Four Palms",
                                "skillimage": "https://i.imgur.com/HsyJQsX.png",
                                "skilldescription": "Hyuuga Neji deals 35 damage to one enemy and removes 1 random chakra from them.",
                                "energy": [
                                        "Taijutsu",
                                        "Bloodline"
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
                                                "amount": 35,
                                                "scope": "target"
                                        },
                                        {
                                                "type": "remove_random_chakra",
                                                "amount": 1,
                                                "scope": "target"
                                        },
                                        {
                                                "type": "remove_random_chakra",
                                                "amount": 1,
                                                "scope": "target",
                                                "condition": {
                                                        "scope": "target",
                                                        "statusId": "neji_hyuuga_neji_gentle_fist"
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "neji-hyuuga-byakugan-insight",
                                "name": "Byakugan Insight",
                                "skillimage": "https://i.imgur.com/2eXVucA.png",
                                "skilldescription": "This skill makes Hyuuga Neji invulnerable for 1 turn.",
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
        },
        "gaara-of-the-desert": {
                "id": "gaara-of-the-desert",
                "characterId": "gaara-of-the-desert",
                "name": "Gaara",
                "facePicture": "https://i.imgur.com/mmAjCZ7.png",
                "characterdeescription": "A Jinchuuriki from the Village of Sand, Gaara is an unstable ninja with the Shukaku, the one-tailed beast. With the Shukaku, and his own abilities, Gaara can manipulate the sand in his gourd to crush the enemy, or defend himself.",
                "skills": [
                        {
                                "id": "gaara-of-the-desert-sand-coffin",
                                "name": "Sand Coffin",
                                "skillimage": "https://i.imgur.com/cZ7Pk49.png",
                                "skilldescription": "Gaara stuns one enemy's physical, chakra, and strategic skills for 2 turns. For 1 turn, this enemy cannot reduce damage or become invulnerable.",
                                "energy": [
                                        "Ninjutsu",
                                        "Random"
                                ],
                                "target": "single-enemy",
                                "damage": 0,
                                "cooldown": 2,
                                "classes": [
                                        "Strategic",
                                        "Control"
                                ],
                                "effects": [
                                        {
                                                "type": "apply_status",
                                                "statusId": "gaara_sand_coffin_stun",
                                                "duration": 2,
                                                "scope": "target",
                                                "metadata": {
                                                        "harmful": true,
                                                        "cannotUseSkillClasses": [
                                                                "physical",
                                                                "energy",
                                                                "strategic",
                                                                "ninjutsu"
                                                        ],
                                                        "tooltipText": "This character's physical, chakra, and strategic skills are stunned.",
                                                        "ongoingClass": "control"
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "gaara_sand_coffin_crush",
                                                "duration": 1,
                                                "scope": "target",
                                                "metadata": {
                                                        "harmful": true,
                                                        "cannotReduceDamage": true,
                                                        "cannotBecomeInvulnerable": true,
                                                        "tooltipText": "This character cannot reduce damage or become invulnerable.",
                                                        "ongoingClass": "control",
                                                        "turnDurationAnchor": "source_turn"
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "gaara_sand_coffin_ready",
                                                "duration": 1,
                                                "scope": "self",
                                                "metadata": {
                                                        "skillReplacements": {
                                                                "gaara-of-the-desert-sand-coffin": "gaara-of-the-desert-sand-burial"
                                                        },
                                                        "turnDurationAnchor": "source_turn",
                                                        "tooltipText": "Sand Coffin is replaced by Sand Burial.",
                                                        "ongoingClass": "control"
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "gaara-of-the-desert-sand-burial",
                                "name": "Sand Burial",
                                "cannotBeCountered": true,
                                "cannotBeReflected": true,
                                "skillimage": "https://i.imgur.com/ljX9izT.png",
                                "skilldescription": "Gaara deals 30 piercing damage to one enemy and ignores helpful effects for 1 turn. If used 1 turn after 'Sand Coffin', this skill costs 1 ninjutsu and 1 bloodline chakra and deals 50 piercing damage instead.",
                                "energy": [
                                        "Ninjutsu"
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
                                                "scope": "target",
                                                "condition": {
                                                        "scope": "target",
                                                        "missingStatusId": "gaara_sand_coffin_crush"
                                                },
                                                "metadata": {
                                                        "ignoreDamageReduction": true
                                                }
                                        },
                                        {
                                                "type": "damage",
                                                "amount": 50,
                                                "scope": "target",
                                                "condition": {
                                                        "scope": "target",
                                                        "statusId": "gaara_sand_coffin_crush"
                                                },
                                                "metadata": {
                                                        "ignoreDamageReduction": true
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "gaara_sand_burial_ignore_helpful",
                                                "duration": 1,
                                                "scope": "target",
                                                "metadata": {
                                                        "harmful": true,
                                                        "turnDurationAnchor": "source_turn",
                                                        "tooltipText": "This character ignores helpful effects for 1 turn."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "gaara-of-the-desert-armor-of-sand",
                                "name": "Armor of Sand",
                                "skillimage": "https://i.imgur.com/qfrA8gB.png",
                                "skilldescription": "Gaara gains 25 points of permanent destructible defense. This skill cannot be used again while it is still active.",
                                "energy": [
                                        "Random"
                                ],
                                "target": "self",
                                "targetCondition": {
                                        "missingStatusId": "gaara_armor_of_sand"
                                },
                                "damage": 0,
                                "cooldown": 4,
                                "classes": [
                                        "Strategic",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "apply_status",
                                                "statusId": "gaara_armor_of_sand",
                                                "duration": 99,
                                                "scope": "self",
                                                "metadata": {
                                                        "destructibleDefensePoints": 25,
                                                        "tooltipText": "Gaara has 25 points of permanent destructible defense from Armor of Sand."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "gaara-of-the-desert-shield-of-sand",
                                "name": "Shield of Sand",
                                "skillimage": "https://i.imgur.com/vL03kPm.png",
                                "skilldescription": "This skill makes Gaara invulnerable for 1 turn.",
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
        },
        "kankuro": {
                "id": "kankuro",
                "characterId": "kankuro",
                "name": "Kankuro",
                "facePicture": "https://i.imgur.com/GN0osit.png",
                "characterdeescription": "The brother of Gaara, and a master puppeteer, Kankuro is one of the three sand siblings. With his puppets, Kankuro is able to use the varied abilities hidden inside them to attack his enemies, or even protect himself.",
                "skills": [
                        {
                                "id": "kankuro-black-secret-machine-one-shot",
                                "name": "Black Secret Machine One Shot",
                                "skillimage": "https://i.imgur.com/wjpmZQI.png",
                                "skilldescription": "Kankuro deals 30 piercing damage to one enemy. For 1 turn, this enemy will take 5 additional damage from 'Poison Bomb'.",
                                "energy": [
                                        "Random",
                                        "Random"
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
                                                "amount": 30,
                                                "scope": "target",
                                                "metadata": {
                                                        "ignoreDamageReduction": true
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "kankuro_black_secret_machine_one_shot_mark",
                                                "duration": 1,
                                                "scope": "target",
                                                "metadata": {
                                                        "harmful": true,
                                                        "turnDurationAnchor": "source_turn",
                                                        "bonusDamageFromSourceSkillsFlat": 5,
                                                        "bonusDamageFromSourceCharacterId": "kankuro",
                                                        "bonusDamageAppliesToSkillIds": [
                                                                "kankuro-poison-bomb"
                                                        ],
                                                        "tooltipText": "This character takes 5 additional damage from Poison Bomb."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "kankuro-poison-bomb",
                                "name": "Poison Bomb",
                                "skillimage": "https://i.imgur.com/3MFMSHu.png",
                                "skilldescription": "Kankuro deals 10 affliction damage to all enemies. For 1 turn, these enemies will take 5 additional damage from 'Black Secret Machine One Shot'. If Kankuro has 'Puppet Preparation', this effect will last 2 turns.",
                                "energy": [
                                        "Random"
                                ],
                                "target": "all-enemy",
                                "damage": 0,
                                "cooldown": 1,
                                "classes": [
                                        "Affliction",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "damage",
                                                "amount": 10,
                                                "scope": "all-enemy",
                                                "metadata": {
                                                        "afflictionDamage": true,
                                                        "ignoreDamageReduction": true,
                                                        "ignoreDestructibleDefense": true
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "kankuro_poison_bomb_mark",
                                                "duration": 1,
                                                "scope": "all-enemy",
                                                "condition": {
                                                        "scope": "self",
                                                        "missingStatusId": "kankuro_puppet_preparation_bonus"
                                                },
                                                "metadata": {
                                                        "harmful": true,
                                                        "turnDurationAnchor": "source_turn",
                                                        "bonusDamageFromSourceSkillsFlat": 5,
                                                        "bonusDamageFromSourceCharacterId": "kankuro",
                                                        "bonusDamageAppliesToSkillIds": [
                                                                "kankuro-black-secret-machine-one-shot"
                                                        ],
                                                        "tooltipText": "This character takes 5 additional damage from Black Secret Machine One Shot."
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "kankuro_poison_bomb_mark",
                                                "duration": 2,
                                                "scope": "all-enemy",
                                                "condition": {
                                                        "scope": "self",
                                                        "statusId": "kankuro_puppet_preparation_bonus"
                                                },
                                                "metadata": {
                                                        "harmful": true,
                                                        "turnDurationAnchor": "source_turn",
                                                        "bonusDamageFromSourceSkillsFlat": 5,
                                                        "bonusDamageFromSourceCharacterId": "kankuro",
                                                        "bonusDamageAppliesToSkillIds": [
                                                                "kankuro-black-secret-machine-one-shot"
                                                        ],
                                                        "tooltipText": "This character takes 5 additional damage from Black Secret Machine One Shot."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "kankuro-puppet-preparation",
                                "name": "Puppet Preparation",
                                "skillimage": "https://i.imgur.com/ghx3V0n.png",
                                "skilldescription": "Kankuro gains 10 points of permanent destructible defense. His next 'Black Secret Machine One Shot' or 'Poison Bomb' will deal 10 additional damage. This damage bonus does not stack.",
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
                                                "statusId": "kankuro_puppet_preparation_defense",
                                                "duration": 99,
                                                "scope": "self",
                                                "metadata": {
                                                        "destructibleDefensePoints": 10,
                                                        "mergeNumericAddKeys": [
                                                                "destructibleDefensePoints"
                                                        ],
                                                        "tooltipTextTemplate": "Kankuro has {destructibleDefensePoints} points of permanent destructible defense from Puppet Preparation."
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "kankuro_puppet_preparation_bonus",
                                                "duration": 99,
                                                "scope": "self",
                                                "metadata": {
                                                        "skillDamageBonuses": {
                                                                "kankuro-black-secret-machine-one-shot": 10,
                                                                "kankuro-poison-bomb": 10
                                                        },
                                                        "removeSelfOnSkillUseSkillIds": [
                                                                "kankuro-black-secret-machine-one-shot",
                                                                "kankuro-poison-bomb"
                                                        ],
                                                        "onOwnerUseSkillIdsAny": [
                                                                "kankuro-black-secret-machine-one-shot",
                                                                "kankuro-poison-bomb"
                                                        ],
                                                        "replaceSkillDamageBonuses": true,
                                                        "tooltipText": "Kankuro's next Black Secret Machine One Shot or Poison Bomb deals 10 additional damage."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "kankuro-puppet-replacement-technique",
                                "name": "Puppet Replacement Technique",
                                "skillimage": "https://i.imgur.com/P2K3Uue.png",
                                "skilldescription": "This skill makes Kankuro invulnerable for 1 turn.",
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
        },
        "temari": {
                "id": "temari",
                "characterId": "temari",
                "name": "Temari",
                "facePicture": "https://i.imgur.com/a3la0h5.png",
                "characterdeescription": "The elder sister of Gaara and Kankuro, Temari is a somewhat cruel and blunt ninja that fights using the wind at her side. With her fan, Temari can create powerful gusts of wind that she can manipulate at her desire.",
                "skills": [
                        {
                                "id": "temari-cutting-whirlwind",
                                "name": "Cutting Whirlwind",
                                "skillimage": "https://i.imgur.com/VU7HluY.png",
                                "skilldescription": "Temari creates a razor sharp wind, dealing 20 piercing damage to one enemy and 10 piercing damage to all other enemies. For 1 turn, Temari becomes invulnerable to non-mental skills.",
                                "energy": [
                                        "Ninjutsu"
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
                                                        "ignoreDamageReduction": true
                                                }
                                        },
                                        {
                                                "type": "damage",
                                                "amount": 10,
                                                "scope": "all-other-enemy",
                                                "metadata": {
                                                        "ignoreDamageReduction": true
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "temari_cutting_whirlwind_active",
                                                "duration": 1,
                                                "scope": "self",
                                                "metadata": {
                                                        "invulnerableToSkillClasses": [
                                                                "physical",
                                                                "energy",
                                                                "strategic",
                                                                "affliction"
                                                        ],
                                                        "skillCostOverridesBySkillId": {
                                                                "temari-summoning-quick-beheading-dance": {
                                                                        "energy": [
                                                                                "Ninjutsu",
                                                                                "Random"
                                                                        ]
                                                                }
                                                        },
                                                        "tooltipText": "Temari is invulnerable to non-mental skills. Summoning Quick Beheading Dance costs 1 less random chakra."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "temari-summoning-quick-beheading-dance",
                                "name": "Summoning Quick Beheading Dance",
                                "skillimage": "https://i.imgur.com/9VRqsM7.png",
                                "skilldescription": "Temari summons the wind weasel Kamatari in the battlefield, dealing 35 damage to all enemies. If used one turn after 'Cutting Whirlwind', this skill will cost 1 less random chakra.",
                                "energy": [
                                        "Ninjutsu",
                                        "Random",
                                        "Random"
                                ],
                                "target": "all-enemy",
                                "damage": 0,
                                "cooldown": 2,
                                "classes": [
                                        "Physical",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "apply_status",
                                                "statusId": "temari_summoning_quick_beheading_dance",
                                                "duration": 1,
                                                "scope": "all-enemy",
                                                "metadata": {
                                                        "harmful": true,
                                                        "turnEndDamage": 35,
                                                        "turnEndTrigger": "source_turn",
                                                        "turnDurationAnchor": "source_turn",
                                                        "ongoingClass": "action",
                                                        "triggerOnApply": true,
                                                        "tooltipText": "This character will take 35 damage from Summoning Quick Beheading Dance."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "temari-dust-wind",
                                "name": "Dust Wind",
                                "skillimage": "https://i.imgur.com/oBQQWNM.png",
                                "skilldescription": "Temari kicks up dust, making herself invulnerable for 1 turn. If targetable, all enemies will deal 20 less non-affliction damage for 1 turn. If used one turn after 'Cutting Whirlwind', this skill will decrease damage for 2 turns instead.",
                                "energy": [
                                        "Ninjutsu",
                                        "Random"
                                ],
                                "target": "all-enemy",
                                "damage": 0,
                                "cooldown": 4,
                                "classes": [
                                        "Strategic",
                                        "Physical",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "apply_status",
                                                "statusId": "temari_dust_wind_invulnerable",
                                                "duration": 1,
                                                "scope": "self",
                                                "metadata": {
                                                        "invulnerable": true,
                                                        "tooltipText": "This character is invulnerable."
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "temari_dust_wind_debuff",
                                                "duration": 1,
                                                "scope": "all-enemy",
                                                "condition": {
                                                        "scope": "self",
                                                        "missingStatusId": "temari_cutting_whirlwind_active"
                                                },
                                                "metadata": {
                                                        "harmful": true,
                                                        "NonAfflictionDamageDebuff": 20,
                                                        "tooltipText": "This character deals 20 less non-affliction damage.",
                                                        "turnDurationAnchor": "source_turn"
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "temari_dust_wind_debuff",
                                                "duration": 2,
                                                "scope": "all-enemy",
                                                "condition": {
                                                        "scope": "self",
                                                        "statusId": "temari_cutting_whirlwind_active"
                                                },
                                                "metadata": {
                                                        "harmful": true,
                                                        "NonAfflictionDamageDebuff": 20,
                                                        "tooltipText": "This character deals 20 less non-affliction damage."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "temari-fan-defence-technique",
                                "name": "Fan Defence Technique",
                                "skillimage": "https://i.imgur.com/nnNAsmM.png",
                                "skilldescription": "This skill makes Temari invulnerable for 1 turn.",
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
        }
};
});
