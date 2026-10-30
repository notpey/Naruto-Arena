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
                "facePicture": "https://i.imgur.com/h2p3QjN.png",
                "characterdeescription": "A confident young kunoichi from Konohagakure's Yamanaka clan, Ino specializes in secret techniques that allow her to transfer her consciousness into another person's body. During the Chūnin Exams, her rivalry with Sakura reveals a clever and resourceful fighter capable of deceiving opponents into falling for her carefully prepared traps.",
                "passive": {
                        "name": "Art of the Valentine",
                        "icon": "https://i.imgur.com/kZPSOwC.png",
                        "description": "Whenever Ino stuns an enemy with one of her skills, that enemy receives 5 piercing damage.",
                        "piercingDamageOnStun": 5,
                        "piercingDamageOnStunSkillIds": [
                                "yamanaka-ino-mind-body-switch",
                                "yamanaka-ino-chakra-hair-strand-trap"
                        ]
                },
                "skills": [
                        {
                                "id": "yamanaka-ino-mind-transfer-feint",
                                "name": "Mind Transfer Feint",
                                "skillimage": "https://i.imgur.com/1RddcCQ.png",
                                "skilldescription": "Ino deals 20 physical damage to one enemy. If that enemy is stunned, this skill deals 10 additional damage.",
                                "energy": [
                                        "Random"
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
                                                "metadata": {
                                                        "skillClasses": [
                                                                "Physical"
                                                        ],
                                                        "bonusDamageIfTargetStunned": 10
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "yamanaka-ino-mind-body-switch",
                                "name": "Mind Body Switch",
                                "skillimage": "https://i.imgur.com/cKdM0Dy.png",
                                "skilldescription": "Ino stuns one enemy’s harmful skills for 2 turns. During this time, this skill is replaced by Forced Betrayal. If Ino is stunned, Mind Body Switch ends.",
                                "energy": [
                                        "Genjutsu",
                                        "Random"
                                ],
                                "target": "single-enemy",
                                "damage": 0,
                                "cooldown": 0,
                                "classes": [
                                        "Chakra",
                                        "Control"
                                ],
                                "effects": [
                                        {
                                                "type": "apply_status",
                                                "statusId": "ino_mind_body_switch_target",
                                                "duration": 2,
                                                "scope": "target",
                                                "metadata": {
                                                        "harmful": true,
                                                        "cannotUseHarmfulSkills": true,
                                                        "ongoingClass": "control",
                                                        "endsOnAnySourceStun": true,
                                                        "turnDurationAnchor": "source_turn",
                                                        "tooltipText": "Mind Body Switch: harmful skills are stunned while Ino maintains control."
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "ino_mind_body_switch_trap_break",
                                                "duration": 1,
                                                "scope": "target",
                                                "condition": {
                                                        "scope": "target",
                                                        "statusId": "ino_hair_strand_trap",
                                                        "statusFromActor": true
                                                },
                                                "metadata": {
                                                        "harmful": true,
                                                        "cannotReduceDamage": true,
                                                        "cannotBecomeInvulnerable": true,
                                                        "ongoingClass": "control",
                                                        "turnDurationAnchor": "source_turn",
                                                        "tooltipText": "This character cannot reduce damage or become invulnerable."
                                                }
                                        },
                                        {
                                                "type": "remove_status",
                                                "statusId": "ino_hair_strand_trap",
                                                "scope": "target",
                                                "condition": {
                                                        "scope": "target",
                                                        "statusId": "ino_hair_strand_trap",
                                                        "statusFromActor": true
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "ino_mind_body_switch_active",
                                                "duration": 2,
                                                "scope": "self",
                                                "condition": {
                                                        "scope": "target",
                                                        "statusId": "ino_mind_body_switch_target",
                                                        "statusFromActor": true
                                                },
                                                "metadata": {
                                                        "helpful": true,
                                                        "ongoingClass": "control",
                                                        "endsOnAnySourceStun": true,
                                                        "linkedTargetStatusId": "ino_mind_body_switch_target",
                                                        "copyTargetKeyToKeys": [
                                                                "linkedTargetKey"
                                                        ],
                                                        "skillReplacements": {
                                                                "yamanaka-ino-mind-body-switch": "yamanaka-ino-forced-betrayal"
                                                        },
                                                        "tooltipText": "Mind Body Switch is replaced by Forced Betrayal while the target is controlled."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "yamanaka-ino-chakra-hair-strand-trap",
                                "name": "Chakra Hair Strand Trap",
                                "skillimage": "https://i.imgur.com/7m4IPdu.png",
                                "skilldescription": "Ino places an invisible trap on one enemy for 2 turns. The first time that enemy uses a new harmful skill, their Physical and Chakra skills are stunned for 1 turn, and the trap ends. If Ino uses Mind Body Switch on that enemy while the trap is active, they also become unable to reduce damage or become invulnerable for 1 turn, and the trap ends.",
                                "energy": [
                                        "Genjutsu"
                                ],
                                "target": "single-enemy",
                                "damage": 0,
                                "cooldown": 0,
                                "classes": [
                                        "Strategic",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "apply_status",
                                                "statusId": "ino_hair_strand_trap",
                                                "duration": 2,
                                                "scope": "target",
                                                "metadata": {
                                                        "harmful": true,
                                                        "invisible": true,
                                                        "hideTooltipFromUnitOwner": true,
                                                        "onOwnerUseSkillTrigger": true,
                                                        "onOwnerUseSkillHarmfulOnly": true,
                                                        "onOwnerUseSkillEffects": [
                                                                {
                                                                        "type": "apply_status",
                                                                        "statusId": "ino_hair_strand_stun",
                                                                        "duration": 1,
                                                                        "fresh": true,
                                                                        "scope": "self",
                                                                        "metadata": {
                                                                                "harmful": true,
                                                                                "cannotUseSkillClasses": [
                                                                                        "physical",
                                                                                        "chakra"
                                                                                ],
                                                                                "tooltipText": "Physical and Chakra skills are stunned."
                                                                        }
                                                                }
                                                        ],
                                                        "turnDurationAnchor": "source_turn",
                                                        "tooltipText": "The next harmful skill triggers a Physical and Chakra stun."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "yamanaka-ino-ino-block",
                                "name": "Ino Block",
                                "skillimage": "https://i.imgur.com/bgwFeRq.png",
                                "skilldescription": "Yamanaka Ino becomes invulnerable for 1 turn.",
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
                                                "statusId": "ino_block",
                                                "duration": 1,
                                                "scope": "self",
                                                "metadata": {
                                                        "helpful": true,
                                                        "invulnerable": true,
                                                        "tooltipText": "Ino is invulnerable."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "yamanaka-ino-forced-betrayal",
                                "name": "Forced Betrayal",
                                "hiddenFromSelectionViewer": true,
                                "skillimage": "https://i.imgur.com/TX3m6tw.png",
                                "skilldescription": "Ino deals 30 physical damage to one enemy through Mind Body Switch.",
                                "energy": [
                                        "Random"
                                ],
                                "target": "single-enemy",
                                "targetCondition": {
                                        "statusId": "ino_mind_body_switch_target",
                                        "statusFromActor": true
                                },
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
                                                "metadata": {
                                                        "damageSourceControlledStatusId": "ino_mind_body_switch_target"
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
                                "skilldescription": "Rock Lee becomes invulnerable for 1 turn.",
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
                "facePicture": "https://i.imgur.com/NHZg6gh.png",
                "characterdeescription": "A hardworking genin of Team Guy, Tenten specializes in weapons combat, using summoning scrolls to unleash a vast arsenal of deadly projectiles. Determined to become a legendary kunoichi, she relies on precision, preparation, and relentless training to overcome her opponents.",
                "passive": {
                        "name": "Sharp Tools",
                        "icon": "https://i.imgur.com/4KEJ94b.png",
                        "description": "Enemies who use a damaging skill on Tenten take 5 physical damage.",
                        "onEnemySkillTargetedDamageToSourceAmount": 5,
                        "onEnemySkillTargetedDamageToSourceSkillClasses": [
                                "Physical"
                        ],
                        "onEnemySkillTargetedDamagingOnly": true
                },
                "skills": [
                        {
                                "id": "tenten-twin-rising-dragons",
                                "name": "Twin Rising Dragons",
                                "skillimage": "https://i.imgur.com/g4ksO57.png",
                                "skilldescription": "Tenten deals 15 physical damage to one enemy and 10 physical damage to all other enemies.",
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
                                                "statusId": "tenten_full_release_dragons_primary_repeat",
                                                "duration": 1,
                                                "scope": "target",
                                                "condition": {
                                                        "scope": "self",
                                                        "statusId": "tenten_full_release_active"
                                                },
                                                "metadata": {
                                                        "harmful": true,
                                                        "turnEndDamage": 15,
                                                        "turnEndTrigger": "source_turn",
                                                        "turnDurationAnchor": "source_turn",
                                                        "turnEndSkillClasses": [
                                                                "Physical"
                                                        ],
                                                        "tooltipText": "This character takes 15 physical damage on Tenten's next turn."
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "tenten_full_release_dragons_other_repeat",
                                                "duration": 1,
                                                "scope": "all-other-enemy",
                                                "condition": {
                                                        "scope": "self",
                                                        "statusId": "tenten_full_release_active"
                                                },
                                                "metadata": {
                                                        "harmful": true,
                                                        "turnEndDamage": 10,
                                                        "turnEndTrigger": "source_turn",
                                                        "turnDurationAnchor": "source_turn",
                                                        "turnEndSkillClasses": [
                                                                "Physical"
                                                        ],
                                                        "tooltipText": "This character takes 10 physical damage on Tenten's next turn."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "tenten-twin-rising-dragons-trap",
                                "name": "Twin Rising Dragons Trap",
                                "skillimage": "https://i.imgur.com/LZze4F3.png",
                        "skilldescription": "Tenten deals 5 physical damage to all enemies and makes them deal 5 less non-affliction damage for 1 turn. Each use also adds a stacking 10-point non-affliction damage penalty.",
                                "energy": [
                                        "Random"
                                ],
                                "target": "all-enemy",
                                "damage": 0,
                                "cooldown": 0,
                                "classes": [],
                                "effects": [
                                        {
                                                "type": "damage",
                                                "amount": 5,
                                                "scope": "all-enemy",
                                                "metadata": {
                                                        "skillClasses": [
                                                                "Physical"
                                                        ]
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "tenten_twin_rising_dragons_trap_debuff",
                                                "duration": 1,
                                                "scope": "all-enemy",
                                                "metadata": {
                                                        "harmful": true,
                                                        "turnDurationAnchor": "source_turn",
                                                        "nonAfflictionDamageDebuffFlat": 5,
                                                        "tooltipText": "This character deals 5 less non-affliction damage for 1 turn."
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "tenten_twin_rising_dragons_trap_stack",
                                                "duration": 99,
                                                "scope": "all-enemy",
                                                "metadata": {
                                                        "harmful": true,
                                                        "nonAfflictionDamageDebuffFlat": 10,
                                                        "mergeNumericAddKeys": [
                                                                "nonAfflictionDamageDebuffFlat"
                                                        ],
                                                        "tooltipTextTemplate": "This character deals {nonAfflictionDamageDebuffFlat} less non-affliction damage from Twin Rising Dragons Trap stacks."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "tenten-twin-rising-dragons-full-release",
                                "name": "Twin Rising Dragons Full Release",
                                "skillimage": "https://i.imgur.com/4KGkFYx.png",
                                "skilldescription": "Tenten becomes invulnerable to enemy Physical skills for 1 turn. On her next turn, Twin Rising Dragons repeats its damage on the following turn and Twin Rising Dragons Trap's damage reduction lasts 1 additional turn.",
                                "energy": [
                                        "Random"
                                ],
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
                                                "statusId": "tenten_full_release_invulnerability",
                                                "duration": 1,
                                                "scope": "self",
                                                "metadata": {
                                                        "helpful": true,
                                                        "invulnerableToSkillClasses": [
                                                                "physical"
                                                        ],
                                                        "tooltipText": "This character is invulnerable to enemy Physical skills."
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "tenten_full_release_active",
                                                "duration": 1,
                                                "scope": "self",
                                                "metadata": {
                                                        "helpful": true,
                                                        "turnDurationAnchor": "source_turn",
                                                        "skillDurationBonuses": {
                                                                "tenten-twin-rising-dragons-trap": 1
                                                        },
                                                        "tooltipText": "On Tenten's next turn, Twin Rising Dragons repeats its damage on the following turn, and Twin Rising Dragons Trap lasts 1 additional turn."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "tenten-spiked-boulder-wall",
                                "name": "Spike Boulder Shield",
                                "skillimage": "https://i.imgur.com/WcN7LHU.png",
                                "skilldescription": "Tenten shields herself behind a massive spiked boulder, becoming invulnerable for 1 turn.",
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
                        }
                ]
        },
        "neji-hyuuga": {
                "id": "neji-hyuuga",
                "characterId": "neji-hyuuga",
                "name": "Hyuuga Neji",
                "facePicture": "https://i.imgur.com/j5onpzd.png",
                "characterdeescription": "A gifted genin of the Hyuuga clan's branch family, Neji possesses exceptional mastery of the Byakugan and Gentle Fist fighting style. Cold and calculating, he believes that one's destiny is determined at birth and that no amount of effort can change it.",
                "passive": {
                        "name": "Neji's Byakugan",
                        "icon": "https://i.imgur.com/ymCAsBc.png",
                        "description": "Neji's skills cannot be countered."
                },
                "skills": [
                        {
                                "id": "neji-hyuuga-neji-gentle-fist",
                                "name": "Neji Gentle Fist",
                                "skillimage": "https://i.imgur.com/svJIAbh.png",
                                "skilldescription": "Neji deals 20 physical damage to one enemy for 2 turns. During this time, Eight Trigram Sixty-Four Palm will cost 1 Taijutsu, 1 Random chakra.",
                                "energy": [
                                        "Taijutsu",
                                        "Random"
                                ],
                                "target": "single-enemy",
                                "damage": 0,
                                "cooldown": 1,
                                "cannotBeCountered": true,
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
                                                        "tooltipText": "This character takes 20 physical damage from Neji Gentle Fist each turn."
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "neji_hyuuga_gentle_fist_palm_cost",
                                                "duration": 2,
                                                "scope": "self",
                                                "metadata": {
                                                        "helpful": true,
                                                        "turnDurationAnchor": "source_turn",
                                                        "ongoingClass": "action",
                                                        "triggerOnApply": true,
                                                        "skillCostOverridesBySkillId": {
                                                                "neji-hyuuga-eight-trigrams-sixty-four-palms": {
                                                                        "energy": [
                                                                                "Taijutsu",
                                                                                "Random"
                                                                        ]
                                                                }
                                                        },
                                                        "tooltipText": "Eight Trigram Sixty-Four Palm costs 1 Taijutsu and 1 Random chakra."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "neji-hyuuga-eight-trigrams-revolving-heaven",
                                "name": "Eight Trigram Heavenly Spin",
                                "skillimage": "https://i.imgur.com/hB5n56N.png",
                                "skilldescription": "Neji deals 15 physical damage to all enemies and becomes invulnerable for 1 turn. During this time, Eight Trigram Sixty-Four Palm will cost 1 Bloodline, 1 Random chakra.",
                                "energy": [
                                        "Bloodline"
                                ],
                                "target": "all-enemy",
                                "damage": 0,
                                "cooldown": 2,
                                "cannotBeCountered": true,
                                "classes": [
                                        "Physical",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "damage",
                                                "amount": 15,
                                                "scope": "all-enemy"
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "neji_hyuuga_heavenly_spin",
                                                "duration": 1,
                                                "scope": "self",
                                                "metadata": {
                                                        "helpful": true,
                                                        "invulnerable": true,
                                                        "skillCostOverridesBySkillId": {
                                                                "neji-hyuuga-eight-trigrams-sixty-four-palms": {
                                                                        "energy": [
                                                                                "Bloodline",
                                                                                "Random"
                                                                        ]
                                                                }
                                                        },
                                                        "tooltipText": "Neji is invulnerable. Eight Trigram Sixty-Four Palm costs 1 Bloodline and 1 Random chakra."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "neji-hyuuga-eight-trigrams-sixty-four-palms",
                                "name": "Eight Trigram Sixty-Four Palm",
                                "skillimage": "https://i.imgur.com/KgBRINj.png",
                                "skilldescription": "Neji deals 35 physical damage to one enemy and removes 1 random chakra.",
                                "energy": [
                                        "Taijutsu",
                                        "Bloodline"
                                ],
                                "target": "single-enemy",
                                "damage": 0,
                                "cooldown": 1,
                                "cannotBeCountered": true,
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
                                        }
                                ]
                        },
                        {
                                "id": "neji-hyuuga-byakugan-insight",
                                "name": "Byakugan Insight",
                                "skillimage": "https://i.imgur.com/Yw9xYPS.png",
                                "skilldescription": "Neji becomes invulnerable for 1 turn.",
                                "energy": [
                                        "Random"
                                ],
                                "target": "self",
                                "damage": 0,
                                "cooldown": 4,
                                "cannotBeCountered": true,
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
            "name": "Gaara of the Desert",
            "facePicture": "https://i.imgur.com/IiEAyw6.png",
            "characterdeescription": "A ruthless genin from the Hidden Sand Village, Gaara commands a seemingly endless supply of sand that protects him from harm and crushes his enemies. Feared for his merciless nature and mysterious abilities, he seeks to prove his existence through the lives of those who challenge him.",
            "passive": {
                "name": "Sand Flow",
                "icon": "https://i.imgur.com/qOFhrZc.png",
                "description": "Gaara has 5 unpierceable damage reduction. He gains 1 Sand Flow stack when damaged and 2 after a turn without taking damage.",
                "unpierceableDamageReductionFlat": 5,
                "onDamageStackMetadataKey": "sandFlowStacks",
                "onDamageStackAmount": 1,
                "onUndamagedTurnStackMetadataKey": "sandFlowStacks",
                "onUndamagedTurnStackAmount": 2,
                "sandFlowStacks": 0,
                "stackTooltipTextTemplate": "Gaara has 5 unpierceable damage reduction and {sandFlowStacks} Sand Flow stacks."
            },
            "skills": [
                {
                    "id": "gaara-of-the-desert-sand-binding-coffin",
                    "name": "Sand Binding Coffin",
                        "skillimage": "https://i.imgur.com/3aST3cX.png",
                    "skilldescription": "Gaara stuns one enemy for 1 turn and gains 2 Sand Flow stacks.",
                    "energy": [
                        "Ninjutsu"
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
                            "type": "apply_status",
                            "statusId": "gaara_sand_binding_coffin_stun",
                            "duration": 1,
                            "scope": "target",
                            "metadata": {
                                "harmful": true,
                                "cannotUseSkills": true,
                                "tooltipText": "This character is stunned."
                            }
                        },
                        {
                            "type": "apply_status",
                            "statusId": "gaara_of_the_desert_sand_flow",
                            "duration": 99,
                            "scope": "self",
                            "metadata": {
                                "stackMetadataKey": "sandFlowStacks",
                                "stackDelta": 2,
                                "stackMax": 9999,
                                "tooltipTextTemplate": "Gaara has 5 unpierceable damage reduction and {sandFlowStacks} Sand Flow stacks."
                            }
                        }
                    ]
                },
                {
                    "id": "gaara-of-the-desert-desert-funeral",
                    "name": "Desert Funeral",
                    "skillimage": "https://i.imgur.com/9do9XxC.png",
                    "skilldescription": "Gaara deals 30 piercing physical damage to one enemy, plus 5 for each Sand Flow stack. All stacks are consumed. If the enemy falls to 10 health or less, they are executed.",
                    "energy": [
                        "Bloodline",
                        "Random"
                    ],
                    "target": "single-enemy",
                    "damage": 30,
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
                            "metadata": {
                                "ignoreDamageReduction": true,
                                "executeBelowHpThreshold": 10,
                                "bonusPerStatusMetadata": {
                                    "scope": "self",
                                    "statusId": "gaara_of_the_desert_sand_flow",
                                    "metadataKey": "sandFlowStacks",
                                    "multiplier": 5,
                                    "consumeStacks": true
                                }
                            }
                        }
                    ]
                },
                {
                    "id": "gaara-of-the-desert-sand-sphere",
                    "name": "Sand Sphere",
                        "skillimage": "https://i.imgur.com/eUfA1nN.png",
                    "skilldescription": "Gaara gains 25 destructible defense for 3 turns, plus 5 for each Sand Flow stack. Enemies who use a skill on Gaara take 15 physical damage. This effect ends when Gaara uses another skill.",
                    "energy": [
                        "Ninjutsu",
                        "Random"
                    ],
                    "target": "self",
                    "damage": 0,
                    "cooldown": 5,
                    "classes": [
                        "Strategic",
                        "Physical*",
                        "Instant"
                    ],
                    "effects": [
                        {
                            "type": "apply_status",
                            "statusId": "gaara_sand_sphere",
                            "duration": 3,
                            "scope": "self",
                            "metadata": {
                                "helpful": true,
                                "destructibleDefensePoints": 25,
                                "scaleFromSourceStatusMetadata": {
                                    "statusId": "gaara_of_the_desert_sand_flow",
                                    "metadataKey": "sandFlowStacks",
                                    "multiplier": 5,
                                    "targetKeys": [
                                        "destructibleDefensePoints"
                                    ],
                                    "addToTargetKeys": true
                                },
                                "onEnemySkillTargetedDamageToSourceAmount": 15,
                                "onEnemySkillTargetedDamageToSourceSkillClasses": [
                                    "Physical"
                                ],
                                "onOwnerUseSkillTrigger": true,
                                "onOwnerUseSkillIdsAny": [
                                    "gaara-of-the-desert-sand-binding-coffin",
                                    "gaara-of-the-desert-desert-funeral",
                                    "gaara-of-the-desert-sand-shield"
                                ],
                                "tooltipTextTemplate": "This character has {destructibleDefensePoints} destructible defense. Enemies who use a skill on them take 15 physical damage. This effect ends when this character uses another skill."
                            }
                        }
                    ]
                },
                {
                    "id": "gaara-of-the-desert-sand-shield",
                    "name": "Sand Shield",
                        "skillimage": "https://i.imgur.com/2oNtSkX.png",
                    "skilldescription": "Gaara becomes invulnerable for 1 turn.",
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
                            "statusId": "gaara_sand_shield",
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
                                "skilldescription": "Kankuro becomes invulnerable for 1 turn.",
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
                                "skilldescription": "Temari deals 20 piercing damage to one enemy and 10 piercing damage to all other enemies. For 1 turn, Temari becomes invulnerable to non-mental skills.",
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
                                "skilldescription": "Temari deals 35 damage to all enemies. If used one turn after Cutting Whirlwind, this skill costs 1 less random chakra.",
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
                                "skilldescription": "Temari becomes invulnerable for 1 turn.",
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
