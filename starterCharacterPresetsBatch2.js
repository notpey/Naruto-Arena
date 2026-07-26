(function (root, factory) {
    const presets = factory();
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = presets;
    } else {
        root.STARTER_CHARACTER_PRESETS = Object.assign(root.STARTER_CHARACTER_PRESETS || {}, presets);
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    return {
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
                                "skilldescription": "Rock Lee deals 25 piercing damage to one enemy. Afterwards, Lee takes 5 affliction damage which cannot kill him. This skill requires 'Fifth Gate Opening'.",
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
                                        "Instant",
                                        "Affliction"
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
                                                "type": "apply_status",
                                                "statusId": "rock_lee_high_speed_taijutsu_minimum_hp",
                                                "duration": 1,
                                                "scope": "self",
                                                "metadata": {
                                                        "minimumHp": 1,
                                                        "hideTooltip": true,
                                                        "tooltipText": "High Speed Taijutsu cannot kill Rock Lee."
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
                                "skilldescription": "Rock Lee expends all his chakra and deals 50 piercing damage to one enemy. Afterwards, Lee takes 5 affliction damage. This skill cannot be countered.",
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
                                        "Instant",
                                        "Affliction"
                                ],
                                "effects": [
                                        {
                                                "type": "damage",
                                                "amount": 50,
                                                "scope": "target",
                                                "metadata": {
                                                        "ignoreDamageReduction": true
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "rock_lee_final_lotus_minimum_hp",
                                                "duration": 1,
                                                "scope": "self",
                                                "metadata": {
                                                        "minimumHp": 1,
                                                        "tooltipText": "Final Lotus cannot kill Rock Lee."
                                                }
                                        },
                                        {
                                                "type": "HealthLoss",
                                                "amount": 5,
                                                "scope": "self"
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
                                "cooldown": 0,
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
                                                        "tooltipText": "This character takes 20 damage and deals 10 less non-affliction damage. Eight Trigrams Sixty-Four Palms will remove 1 additional random chakra."
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
                                "skilldescription": "Hyuuga Neji deals 35 damage to one enemy and removes 1 random chakra from them. If this enemy is affected by 'Gentle Fist', 1 additional random chakra will be removed.",
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
                                "skilldescription": "Gaara stuns one enemy's physical, chakra, and strategic skills for 2 turns. For 1 turn, this enemy cannot reduce damage or become invulnerable. During this time, this skill will be replaced by 'Sand Burial'.",
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
                                "id": "gaara-of-the-desert-sand-clone",
                                "name": "Sand Clone",
                                "skillimage": "https://i.imgur.com/SCRKMIU.png",
                                "skilldescription": "Until the next time an enemy uses a harmful non-mental skill on him, Gaara will ignore all enemy stun effects. This skill cannot be used while active.",
                                "energy": [],
                                "target": "self",
                                "targetCondition": {
                                        "missingStatusId": "gaara_sand_clone"
                                },
                                "damage": 0,
                                "cooldown": 1,
                                "classes": [
                                        "Strategic",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "apply_status",
                                                "statusId": "gaara_sand_clone",
                                                "duration": 99,
                                                "scope": "self",
                                                "metadata": {
                                                        "cannotBeStunned": true,
                                                        "stunImmune": true,
                                                        "triggerOnEnemyHarmfulNonMental": true,
                                                        "tooltipText": "Gaara ignores stuns until an enemy next uses a harmful non-mental skill on him."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "gaara-of-the-desert-armor-of-sand",
                                "name": "Armor of Sand",
                                "skillimage": "https://i.imgur.com/qfrA8gB.png",
                                "skilldescription": "Gaara gains 40 points of permanent destructible defense. This skill cannot be used again while it is still active.",
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
                                                        "destructibleDefensePoints": 40,
                                                        "tooltipText": "Gaara has 40 points of permanent destructible defense from Armor of Sand."
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
                        },
                        {
                                "id": "gaara-of-the-desert-sand-burial",
                                "name": "Sand Burial",
                                "hiddenFromSelectionViewer": true,
                                "cannotBeCountered": true,
                                "cannotBeReflected": true,
                                "skillimage": "https://i.imgur.com/ljX9izT.png",
                                "skilldescription": "Gaara destroys all destructible defense on one enemy, deals 50 piercing damage to them, and removes 1 random chakra. This skill requires 'Sand Coffin' to be active on this enemy. This skill cannot be countered or reflected.",
                                "energy": [
                                        "Ninjutsu",
                                        "Ninjutsu"
                                ],
                                "target": "single-enemy",
                                "targetCondition": {
                                        "statusId": "gaara_sand_coffin_crush"
                                },
                                "damage": 0,
                                "cooldown": 0,
                                "classes": [
                                        "Physical",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "destroy_destructible_defense",
                                                "scope": "target"
                                        },
                                        {
                                                "type": "damage",
                                                "amount": 50,
                                                "scope": "target",
                                                "metadata": {
                                                        "ignoreDamageReduction": true
                                                }
                                        },
                                        {
                                                "type": "remove_random_chakra",
                                                "amount": 1,
                                                "scope": "target"
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
                                                        "onOwnerUseSkillIdsAny": [
                                                                "kankuro-black-secret-machine-one-shot",
                                                                "kankuro-poison-bomb"
                                                        ],
                                                        "removeSelfOnSkillUseSkillIds": [
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
                                "skilldescription": "Temari kicks up dust, making her team invulnerable for 1 turn. If targetable, all enemies will deal 20 less non-affliction damage for 1 turn. If used one turn after 'Cutting Whirlwind', this skill will decrease damage for 2 turns instead.",
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
                                                "scope": "all-allies",
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
        },
        "teuchi": {
                "id": "teuchi",
                "characterId": "teuchi",
                "name": "Teuchi",
                "facePicture": "deadcharacter-remaster.png?v=2",
                "characterdeescription": "Teuchi is a citizen of the Hidden Leaf Village and the owner of Ramen Ichiraku. As a teenager, Teuchi devoted his life to making ramen, what undoubtedly makes him the most important character from the Naruto franchise. ORIGINAL DESIGN: Alexandre",
                "requiredMissionId": null,
                "skills": [
                        {
                                "id": "teuchi-stick-throw",
                                "name": "Stick Throw",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "Teuchi deals 20 damage to one enemy.",
                                "energy": [
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
                                                "amount": 20,
                                                "scope": "target"
                                        }
                                ]
                        },
                        {
                                "id": "teuchi-ramen",
                                "name": "Ramen",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "Teuchi heals his allies for 15 health and gains 20 points of destructible defense for 1 turn.",
                                "energy": [
                                        "Random",
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
                                                "type": "heal",
                                                "amount": 15,
                                                "scope": "all-allies"
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "teuchi_ramen_defense",
                                                "duration": 1,
                                                "scope": "self",
                                                "metadata": {
                                                        "helpful": true,
                                                        "destructibleDefensePoints": 20,
                                                        "tooltipText": "Teuchi has 20 points of destructible defense."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "teuchi-ramen-ichiraku-open",
                                "name": "Ramen Ichiraku: Open",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "Teuchi targets all his allies. For the rest of the game, everytime an ally uses a new skill, 'Ramen' will heal 5 additional health permanently. This skill stacks and ends if Teuchi dies.",
                                "energy": [],
                                "target": "all-allies",
                                "damage": 0,
                                "cooldown": 2,
                                "classes": [
                                        "Strategic",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "apply_status",
                                                "statusId": "teuchi_ramen_open",
                                                "duration": 99,
                                                "scope": "self",
                                                "metadata": {
                                                        "helpful": true,
                                                        "permanent": true,
                                                        "ongoingClass": "action",
                                                        "tooltipText": "Everytime an ally uses a new skill, Ramen will heal 5 additional health permanently."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "teuchi-ramen-ichiraku-closed",
                                "name": "Ramen Ichiraku: Closed",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "This skill makes Teuchi invulnerable for 1 turn, heals him for 35 health and ends 'Ramen Ichiraku: Open' on his team.",
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
                                        },
                                        {
                                                "type": "heal",
                                                "amount": 35,
                                                "scope": "self"
                                        },
                                        {
                                                "type": "cleanse_statuses",
                                                "scope": "self",
                                                "statusId": "teuchi_ramen_open"
                                        }
                                ]
                        }
                ]
        },
        "young-minato": {
                "id": "young-minato",
                "characterId": "young-minato",
                "name": "Young Minato",
                "facePicture": "deadcharacter-remaster.png?v=2",
                "characterdeescription": "Minato is a prodigy kid from the Hidden Leaf Village who is capable of fighting other shinobi in higher ranks by having faster and stronger taijutsu skills. He entered the Hidden Leaf's Academy with the dream of earning the villagers' respect and recognition by becoming Hokage. ORIGINAL DESIGN: Liann",
                "requiredMissionId": null,
                "skills": [
                        {
                                "id": "young-minato-speedy-flanker",
                                "name": "Speedy Flanker",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "Young Minato deals 25 damage to one enemy. If Young Minato's health is at 40 or below, this skill will also stun the enemy for 1 turn. This skill cannot be countered.",
                                "energy": [
                                        "Taijutsu"
                                ],
                                "target": "single-enemy",
                                "cannotBeCountered": true,
                                "damage": 0,
                                "cooldown": 0,
                                "classes": [
                                        "Physical",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "damage",
                                                "amount": 25,
                                                "scope": "target"
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "young_minato_speedy_flanker_stun",
                                                "duration": 1,
                                                "scope": "target",
                                                "condition": {
                                                        "scope": "self",
                                                        "sourceCurrentHpAtMost": 40
                                                },
                                                "metadata": {
                                                        "harmful": true,
                                                        "cannotUseSkills": true,
                                                        "turnDurationAnchor": "source_turn",
                                                        "tooltipText": "This character is stunned for 1 turn by Speedy Flanker if Young Minato is at 40 HP or below."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "young-minato-night-saviour",
                                "name": "Night Saviour",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "Young Minato removes all harmful skills from one ally and makes them invulnerable for 1 turn. If 'Highground Watcher' was used the previous turn, this invulnerability will last 2 turns instead.",
                                "energy": [
                                        "Random"
                                ],
                                "target": "single-ally",
                                "damage": 0,
                                "cooldown": 2,
                                "classes": [
                                        "Strategic",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "cleanse_statuses",
                                                "scope": "target",
                                                "metadata": {
                                                        "cleanseHarmfulOnly": true
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "invulnerable",
                                                "duration": 1,
                                                "scope": "target",
                                                "metadata": {
                                                        "invulnerable": true,
                                                        "tooltipText": "This character is invulnerable."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "young-minato-night-crawler",
                                "name": "Night Crawler",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "One random enemy will have 'Speedy Flanker' applied on them. One random ally will have 'Night Saviour' applied on them. These skills' conditional effects won't trigger this way. This skill cannot be countered or reflected.",
                                "energy": [
                                        "Taijutsu"
                                ],
                                "target": "self",
                                "cannotBeCountered": true,
                                "cannotBeReflected": true,
                                "damage": 0,
                                "cooldown": 3,
                                "classes": [
                                        "Strategic",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "damage",
                                                "amount": 25,
                                                "scope": "random-enemy"
                                        },
                                        {
                                                "type": "cleanse_statuses",
                                                "scope": "random-ally",
                                                "metadata": {
                                                        "cleanseHarmfulOnly": true
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "invulnerable",
                                                "duration": 1,
                                                "scope": "random-ally",
                                                "metadata": {
                                                        "invulnerable": true,
                                                        "tooltipText": "This character is invulnerable."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "young-minato-highground-watcher",
                                "name": "Highground Watcher",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "This skill makes Young Minato invulnerable for 1 turn.",
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
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "young_minato_highground_watcher_primed",
                                                "duration": 1,
                                                "scope": "self",
                                                "metadata": {
                                                        "helpful": true,
                                                        "turnDurationAnchor": "source_turn"
                                                }
                                        }
                                ]
                        }
                ]
        },
        "young-kushina": {
                "id": "young-kushina",
                "characterId": "young-kushina",
                "name": "Young Kushina",
                "facePicture": "deadcharacter-remaster.png?v=2",
                "characterdeescription": "Kushina is a kunoichi from the Hidden Leaf Village originated from the Hidden Eddy Village's Uzumaki Clan. Due to her special origins, Kushina has a red colored hair that constantly puts her into trouble. ORIGINAL DESIGN: TheDarkLegend",
                "requiredMissionId": null,
                "skills": [
                        {
                                "id": "young-kushina-red-hot-habanero-rage",
                                "name": "Red-Hot Habanero Rage",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "Young Kushina gains 1 random energy. For 4 turns, Young Kushina gains 20 points of destructible defense and ignores enemy stun effects.",
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
                                                "type": "gain_chakra",
                                                "amount": 1,
                                                "scope": "self"
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "young_kushina_habanero_rage",
                                                "duration": 4,
                                                "scope": "self",
                                                "metadata": {
                                                        "helpful": true,
                                                        "destructibleDefensePoints": 20,
                                                        "stunImmune": true,
                                                        "cannotBeStunned": true,
                                                        "tooltipText": "Young Kushina has 20 points of destructible defense and ignores enemy stun effects for 4 turns."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "young-kushina-fierce-punch",
                                "name": "Fierce Punch",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "Young Kushina destroys all of one enemy's destructible defense and then deals 20 damage to them. The following turn, 'Dropping Kick' will deal 20 additional damage and will first destroy its target's destructible defense.",
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
                                                        "clearDestructibleDefenseFirst": true
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "young_kushina_fierce_punch_buff",
                                                "duration": 1,
                                                "scope": "self",
                                                "metadata": {
                                                        "helpful": true,
                                                        "turnDurationAnchor": "source_turn"
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "young-kushina-dropping-kick",
                                "name": "Dropping Kick",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "Young Kushina deals 10 damage to one enemy and stuns their non-strategic skills for 1 turn. The following turn, 'Fierce Punch' will deal 10 additional damage and will stun its target's non-strategic skills for 1 turn.",
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
                                                "amount": 10,
                                                "scope": "target"
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "young_kushina_dropping_kick_stun",
                                                "duration": 1,
                                                "scope": "target",
                                                "metadata": {
                                                        "harmful": true,
                                                        "cannotUseNonStrategicSkills": true,
                                                        "cannotUseSkillClasses": [
                                                                "physical",
                                                                "ninjutsu",
                                                                "mental",
                                                                "affliction"
                                                        ],
                                                        "turnDurationAnchor": "source_turn",
                                                        "tooltipText": "This character's non-strategic skills are stunned for 1 turn."
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "young_kushina_dropping_kick_buff",
                                                "duration": 1,
                                                "scope": "self",
                                                "metadata": {
                                                        "helpful": true,
                                                        "turnDurationAnchor": "source_turn"
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "young-kushina-skilled-landing",
                                "name": "Skilled Landing",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "This skill makes Young Kushina invulnerable for 1 turn.",
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
        "young-itachi": {
                "id": "young-itachi",
                "characterId": "young-itachi",
                "name": "Young Itachi",
                "facePicture": "deadcharacter-remaster.png?v=2",
                "characterdeescription": "The first child born to Uchiha Mikoto and Fugaku, Itachi's childhood was marked with violence. The death and destruction he experienced at such a young age traumatised Itachi and made him a pacifist, leading to him training non-stop to achieve his dream of becoming a ninja among ninja in order to erase fighting from the world. ORIGINAL DESIGN: Liann",
                "requiredMissionId": null,
                "skills": [
                        {
                                "id": "young-itachi-summoning-crow",
                                "name": "Summoning: Crow",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "Young Itachi becomes unable to be killed for 1 turn and grants 1 crow stack to all enemies. For the rest of the game, everytime they use a new harmful skill, they will gain 1 crow stack. This skill can be used while active to make Young Itachi unable to be killed for 1 turn. This skill cannot be removed.",
                                "energy": [],
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
                                                "statusId": "young_itachi_crow_unreachable",
                                                "duration": 1,
                                                "scope": "self",
                                                "metadata": {
                                                        "helpful": true,
                                                        "minimumHp": 1,
                                                        "tooltipText": "Young Itachi cannot be killed."
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "young_itachi_crow_stack",
                                                "duration": 99,
                                                "scope": "all-enemy",
                                                "metadata": {
                                                        "harmful": true,
                                                        "permanent": true,
                                                        "addCrowStackOnHarmfulSkillUse": true,
                                                        "tooltipText": "This character has Crow Stacks."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "young-itachi-demonic-illusion-mirage-crow",
                                "name": "Demonic Illusion: Mirage Crow",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "For 1 turn, Young Itachi reduces all enemies' non-affliction damage by 0, increased by 5 for each crow stack they have.",
                                "energy": [
                                        "Genjutsu"
                                ],
                                "target": "all-enemy",
                                "damage": 0,
                                "cooldown": 1,
                                "classes": [
                                        "Strategic",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "apply_status",
                                                "statusId": "young_itachi_mirage_crow_debuff",
                                                "duration": 1,
                                                "scope": "all-enemy",
                                                "metadata": {
                                                        "harmful": true,
                                                        "damageDebuffFlatPerCrowStack": 5,
                                                        "turnDurationAnchor": "source_turn",
                                                        "tooltipText": "This character's non-affliction damage is reduced by 5 for each Crow Stack."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "young-itachi-illusion-walking-unseen-step",
                                "name": "Illusion Walking: Unseen Step",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "Young Itachi deals 0 piercing damage to one enemy, increased by 10 for each crow stack they have.",
                                "energy": [
                                        "Taijutsu"
                                ],
                                "target": "single-enemy",
                                "damage": 0,
                                "cooldown": 1,
                                "classes": [
                                        "Mental",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "damage",
                                                "amount": 0,
                                                "scope": "target",
                                                "metadata": {
                                                        "amountPerCrowStackOnTarget": 10,
                                                        "afflictionDamage": true,
                                                        "ignoreDamageReduction": true,
                                                        "ignoreDestructibleDefense": true
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "young-itachi-expert-retreat",
                                "name": "Expert Retreat",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "This skill makes Young Itachi invulnerable for 1 turn.",
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
        "young-yahiko": {
                "id": "young-yahiko",
                "characterId": "young-yahiko",
                "name": "Young Yahiko",
                "facePicture": "deadcharacter-remaster.png?v=2",
                "characterdeescription": "The Rain Orphans were three children who lost their parents due to the Hidden Rain Village's involvement in the Second Shinobi World War. Yahiko is a stoic boy who leads his team in the fight for the survival during the war. ORIGINAL DESIGN: Liann",
                "requiredMissionId": null,
                "skills": [
                        {
                                "id": "young-yahiko-water-release-wild-water-wave",
                                "name": "Water Release: Wild Water Wave",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "Young Yahiko deals 5 damage to one enemy for 3 turns. During this time, if 'Lateral Kick' or 'Descending Fist' are used on this enemy, they will deal 5 additional damage and will also make this enemy deal 5 less non-affliction damage for 3 turns. This effect stacks.",
                                "energy": [
                                        "Ninjutsu"
                                ],
                                "target": "single-enemy",
                                "damage": 0,
                                "cooldown": 3,
                                "classes": [
                                        "Ninjutsu",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "apply_status",
                                                "statusId": "young_yahiko_wild_water_wave",
                                                "duration": 3,
                                                "scope": "target",
                                                "metadata": {
                                                        "harmful": true,
                                                        "turnEndDamage": 5,
                                                        "turnEndTrigger": "source_turn",
                                                        "turnDurationAnchor": "source_turn",
                                                        "ongoingClass": "action",
                                                        "tooltipText": "This character takes 5 damage each turn from Wild Water Wave for 3 turns."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "young-yahiko-lateral-kick",
                                "name": "Lateral Kick",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "Young Yahiko deals 20 damage to one enemy. For 1 turn, if this enemy uses a new physical or strategic skill, they will take 15 damage.",
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
                                                "statusId": "young_yahiko_lateral_kick_trap",
                                                "duration": 1,
                                                "scope": "target",
                                                "metadata": {
                                                        "harmful": true,
                                                        "triggerOnEnemyPhysicalOrStrategicSkill": true,
                                                        "counterDamage": 15,
                                                        "turnDurationAnchor": "source_turn",
                                                        "tooltipText": "If this character uses a new physical or strategic skill, they will take 15 damage."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "young-yahiko-descending-fist",
                                "name": "Descending Fist",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "Young Yahiko deals 25 damage to one enemy and becomes invulnerable to physical skills for 1 turn.",
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
                                                "amount": 25,
                                                "scope": "target"
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "young_yahiko_physical_immunity",
                                                "duration": 1,
                                                "scope": "self",
                                                "metadata": {
                                                        "helpful": true,
                                                        "ignoreEnemyPhysicalDamage": true,
                                                        "tooltipText": "Young Yahiko is invulnerable to physical skills for 1 turn."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "young-yahiko-in-the-shadows",
                                "name": "In the Shadows",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "This skill makes Young Yahiko invulnerable for 1 turn.",
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
                                "id": "young-yahiko-the-rain-orphans",
                                "name": "The Rain Orphans",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "Everytime a character uses 'Lateral Kick', 'Winding Paper Shuriken' or 'Rinnegan Domination' while having 15 or less health, the other 2 mentioned skills will also be applied on the enemy target.",
                                "energy": [],
                                "target": "self",
                                "damage": 0,
                                "cooldown": 0,
                                "classes": [
                                        "Passive"
                                ],
                                "effects": [
                                        {
                                                "type": "apply_status",
                                                "statusId": "the_rain_orphans_passive",
                                                "duration": 99,
                                                "scope": "self",
                                                "metadata": {
                                                        "helpful": true,
                                                        "permanent": true,
                                                        "rainOrphansPassive": true,
                                                        "tooltipText": "Everytime a character uses Lateral Kick, Winding Paper Shuriken, or Rinnegan Domination while having 15 or less health, the other 2 mentioned skills will also be applied on the enemy target."
                                                }
                                        }
                                ]
                        }
                ]
        },
        "young-konan": {
                "id": "young-konan",
                "characterId": "young-konan",
                "name": "Young Konan",
                "facePicture": "deadcharacter-remaster.png?v=2",
                "characterdeescription": "The Rain Orphans were three children who lost their parents due to the Hidden Rain Village's involvement in the Second Shinobi World War. Konan is a sweet girl who is always caring about her teammates more than about herself. ORIGINAL DESIGN: Liann",
                "requiredMissionId": null,
                "skills": [
                        {
                                "id": "young-konan-paper-shuriken-preparation",
                                "name": "Paper Shuriken Preparation",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "Until 'Winding Paper Shuriken' is used, Young Konan will deal 10 piercing damage instantly to any enemy who uses a new skill on her and during this time, everytime an enemy does so, 'Winding Paper Shuriken' will deal 10 additional damage the next time it's used. This effect stacks. This skill does not stack and will re-apply itself.",
                                "energy": [],
                                "target": "self",
                                "damage": 0,
                                "cooldown": 0,
                                "classes": [
                                        "Physical",
                                        "Instant"
                                ],
                                "effects": [
                                        {
                                                "type": "apply_status",
                                                "statusId": "young_konan_paper_shuriken_preparation",
                                                "duration": 99,
                                                "scope": "self",
                                                "metadata": {
                                                        "helpful": true,
                                                        "permanent": true,
                                                        "counterOnEnemySkillTargetingSelf": true,
                                                        "counterDamagePiercing": 10,
                                                        "incrementShurikenDamagePerHit": 10,
                                                        "tooltipText": "Until Winding Paper Shuriken is used, deals 10 piercing damage instantly to any enemy using a skill on Konan."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "young-konan-winding-paper-shuriken",
                                "name": "Winding Paper Shuriken",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "Young Konan deals 20 piercing damage to one enemy and makes them ignore healing effects for 1 turn.",
                                "energy": [
                                        "Bloodline"
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
                                                        "afflictionDamage": true,
                                                        "ignoreDamageReduction": true,
                                                        "ignoreDestructibleDefense": true
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "young_konan_ignore_healing",
                                                "duration": 1,
                                                "scope": "target",
                                                "metadata": {
                                                        "harmful": true,
                                                        "healReceivedMultiplier": 0,
                                                        "turnDurationAnchor": "source_turn",
                                                        "tooltipText": "This character ignores healing effects for 1 turn."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "young-konan-origami-rose",
                                "name": "Origami Rose",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "Young Konan grants one ally 35 points of permanent destructible defense that stacks. If this skill is already active on them, they will also be unable to be killed for 2 turns.",
                                "energy": [
                                        "Bloodline"
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
                                                "statusId": "young_konan_origami_rose",
                                                "duration": 99,
                                                "scope": "target",
                                                "metadata": {
                                                        "helpful": true,
                                                        "permanent": true,
                                                        "destructibleDefensePoints": 35,
                                                        "mergeNumericAddKeys": [
                                                                "destructibleDefensePoints"
                                                        ],
                                                        "tooltipText": "This character has 35 points of permanent destructible defense."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "young-konan-in-the-shadows",
                                "name": "In the Shadows",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "This skill makes Young Konan invulnerable for 1 turn.",
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
                                "id": "young-konan-the-rain-orphans",
                                "name": "The Rain Orphans",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "Everytime a character uses 'Lateral Kick', 'Winding Paper Shuriken' or 'Rinnegan Domination' while having 15 or less health, the other 2 mentioned skills will also be applied on the enemy target.",
                                "energy": [],
                                "target": "self",
                                "damage": 0,
                                "cooldown": 0,
                                "classes": [
                                        "Passive"
                                ],
                                "effects": [
                                        {
                                                "type": "apply_status",
                                                "statusId": "the_rain_orphans_passive",
                                                "duration": 99,
                                                "scope": "self",
                                                "metadata": {
                                                        "helpful": true,
                                                        "permanent": true,
                                                        "rainOrphansPassive": true,
                                                        "tooltipText": "Everytime a character uses Lateral Kick, Winding Paper Shuriken, or Rinnegan Domination while having 15 or less health, the other 2 mentioned skills will also be applied on the enemy target."
                                                }
                                        }
                                ]
                        }
                ]
        },
        "young-nagato": {
                "id": "young-nagato",
                "characterId": "young-nagato",
                "name": "Young Nagato",
                "facePicture": "deadcharacter-remaster.png?v=2",
                "characterdeescription": "The Rain Orphans were three children who lost their parents due to the Hidden Rain Village's involvement in the Second Shinobi World War. Nagato is a quiet boy who is not only afraid of the world, but also afraid of himself. ORIGINAL DESIGN: Liann",
                "requiredMissionId": null,
                "skills": [
                        {
                                "id": "young-nagato-wind-release-gale-palm",
                                "name": "Wind Release: Gale Palm",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "This skill can be used on an enemy or on an ally. If used on an enemy, they will take 20 damage and then the invulnerability effects of their new skills will last 1 less turn for 2 turns. If used on an ally, that character will deal 10 additional damage with physical and energy skills for 2 turns.",
                                "energy": [
                                        "Ninjutsu"
                                ],
                                "target": "single-enemy",
                                "damage": 0,
                                "cooldown": 1,
                                "classes": [
                                        "Ninjutsu",
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
                                                "statusId": "young_nagato_gale_palm_debuff",
                                                "duration": 2,
                                                "scope": "target",
                                                "metadata": {
                                                        "harmful": true,
                                                        "invulnerabilityDurationReduction": 1,
                                                        "turnDurationAnchor": "source_turn",
                                                        "tooltipText": "The invulnerability effects of this character's new skills will last 1 less turn for 2 turns."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "young-nagato-rinnegan-domination",
                                "name": "Rinnegan Domination",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "Young Nagato deals 20 piercing damage to one enemy. This skill ignores invulnerability and cannot be countered or reflected.",
                                "energy": [
                                        "Random"
                                ],
                                "target": "single-enemy",
                                "cannotBeCountered": true,
                                "cannotBeReflected": true,
                                "ignoreInvulnerability": true,
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
                                                "scope": "target",
                                                "metadata": {
                                                        "afflictionDamage": true,
                                                        "ignoreDamageReduction": true,
                                                        "ignoreDestructibleDefense": true
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "young-nagato-minor-almighty-push",
                                "name": "Minor Almighty Push",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "Young Nagato grants his team 10 points of unpierceable damage reduction for 1 turn. This effect is applied again for every 20 health Young Nagato has lost.",
                                "energy": [
                                        "Genjutsu"
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
                                                "statusId": "young_nagato_minor_almighty_push",
                                                "duration": 1,
                                                "scope": "all-allies",
                                                "metadata": {
                                                        "helpful": true,
                                                        "unpierceableDamageReductionFlat": 10,
                                                        "amountFromSourceMissingHpStep": 10,
                                                        "amountFromSourceMissingHpDivisor": 20,
                                                        "turnDurationAnchor": "source_turn",
                                                        "tooltipText": "This character has 10 points of unpierceable damage reduction for 1 turn (increased by 10 for every 20 health Nagato has lost)."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "young-nagato-in-the-shadows",
                                "name": "In the Shadows",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "This skill makes Young Nagato invulnerable for 1 turn.",
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
                                "id": "young-nagato-the-rain-orphans",
                                "name": "The Rain Orphans",
                                "skillimage": "deadcharacter-remaster.png?v=2",
                                "skilldescription": "Everytime a character uses 'Lateral Kick', 'Winding Paper Shuriken' or 'Rinnegan Domination' while having 15 or less health, the other 2 mentioned skills will also be applied on the enemy target.",
                                "energy": [],
                                "target": "self",
                                "damage": 0,
                                "cooldown": 0,
                                "classes": [
                                        "Passive"
                                ],
                                "effects": [
                                        {
                                                "type": "apply_status",
                                                "statusId": "the_rain_orphans_passive",
                                                "duration": 99,
                                                "scope": "self",
                                                "metadata": {
                                                        "helpful": true,
                                                        "permanent": true,
                                                        "rainOrphansPassive": true,
                                                        "tooltipText": "Everytime a character uses Lateral Kick, Winding Paper Shuriken, or Rinnegan Domination while having 15 or less health, the other 2 mentioned skills will also be applied on the enemy target."
                                                }
                                        }
                                ]
                        }
                ]
        }
};
});
