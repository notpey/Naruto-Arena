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
                                "skilldescription": "Rock Lee deals 25 piercing damage to one enemy. Afterwards, Lee takes 5 affliction damage which cannot kill him.",
                                "energy": [
                                        "Taijutsu"
                                ],
                                "target": "single-enemy",
                                "damage": 0,
                                "cooldown": 0,
                                "classes": [
                                        "Physical",
                                        "Melee",
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
                                "skilldescription": "Rock Lee deals 35 piercing damage to one enemy. For 1 turn, this skill is replaced by 'Final Lotus'.",
                                "energy": [
                                        "Taijutsu",
                                        "Random"
                                ],
                                "target": "single-enemy",
                                "damage": 0,
                                "cooldown": 1,
                                "classes": [
                                        "Physical",
                                        "Melee",
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
                                "skilldescription": "Rock Lee opens five of his chakra gates. Permanently, 'High Speed Taijutsu' and 'Front Lotus' may be used. During this time, Lee will deal 5 additional damage each time he is damaged by a skill. This skill is replaced by 'Fiery Spirit'.",
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
                                        "Melee",
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
                                                        "bonusDamageFromSourceCharacterId": "tenten",
                                                        "bonusDamageAppliesToSkillIds": [
                                                                "tenten-twin-rising-dragons-trap"
                                                        ],
                                                        "tooltipText": "This character takes 10 additional damage from Twin Rising Dragons Trap."
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
                                                        "bonusDamageFromSourceCharacterId": "tenten",
                                                        "bonusDamageAppliesToSkillIds": [
                                                                "tenten-twin-rising-dragons-trap"
                                                        ],
                                                        "tooltipText": "This character takes 20 additional damage from Twin Rising Dragons Trap."
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
                                                                "energy"
                                                        ],
                                                        "tooltipText": "This character's physical and chakra skills are stunned."
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
                                                        "tooltipText": "Tenten's next harmful skill is improved."
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
                                        "Energy",
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
                                "skilldescription": "Gaara stuns one enemy's physical, chakra and strategic skills for 2 turns. For 1 turn, this enemy will be unable to reduce damage or become invulnerable. During this time, this skill will be replaced by 'Sand Burial'.",
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
                                                                "strategic"
                                                        ],
                                                        "tooltipText": "This character's physical, chakra and strategic skills are stunned."
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
                                                        "tooltipText": "This character cannot reduce damage or become invulnerable."
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
                            "tooltipText": "Sand Coffin is replaced by Sand Burial."
                                                }
                                        }
                                ]
                        },
                        {
                                "id": "gaara-of-the-desert-sand-clone",
                                "name": "Sand Clone",
                                "skillimage": "https://i.imgur.com/SCRKMIU.png",
                                "skilldescription": "Until the next time an enemy uses a harmful non-mental skill on him, Gaara will ignore all enemy stun effects. This skill cannot be used while active.",
                                "energy": [
                                        "none"
                                ],
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
                                "skilldescription": "Kankuro gains 15 points of permanent destructible defense. For 4 turns, 'Black Secret Machine One Shot' and 'Poison Bomb' will deal 10 additional damage. This damage bonus does not stack.",
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
                                                "statusId": "kankuro_puppet_preparation_defense",
                                                "duration": 99,
                                                "scope": "self",
                                                "metadata": {
                                                        "destructibleDefensePoints": 15,
                                                        "mergeNumericAddKeys": [
                                                                "destructibleDefensePoints"
                                                        ],
                                                        "tooltipTextTemplate": "Kankuro has {destructibleDefensePoints} points of permanent destructible defense from Puppet Preparation."
                                                }
                                        },
                                        {
                                                "type": "apply_status",
                                                "statusId": "kankuro_puppet_preparation_bonus",
                                                "duration": 4,
                                                "scope": "self",
                                                "metadata": {
                                                        "skillDamageBonuses": {
                                                                "kankuro-black-secret-machine-one-shot": 10,
                                                                "kankuro-poison-bomb": 10
                                                        },
                                                        "replaceSkillDamageBonuses": true,
                                                        "tooltipText": "Black Secret Machine One Shot and Poison Bomb deal 10 additional damage."
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
                                                        "tooltipText": "Temari is invulnerable to non-mental skills and Summoning Quick Beheading Dance costs 1 less random chakra."
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
                                                        "tooltipText": "This character deals 20 less non-affliction damage."
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
