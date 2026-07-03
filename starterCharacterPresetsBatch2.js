(function (root, factory) {
    const presets = factory();
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = presets;
    } else {
        root.STARTER_CHARACTER_PRESETS = Object.assign(root.STARTER_CHARACTER_PRESETS || {}, presets);
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    const invulnerableSkill = ({ id, name, ownerName, image }) => ({
        "id": id,
        "name": name,
        "skillimage": image,
        "skilldescription": `This skill makes ${ownerName} invulnerable for 1 turn.`,
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
    });

    const rockLee = {
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
                "skilldescription": "Rock Lee deals 10 damage to one enemy for 3 turns and takes 10 affliction damage. The following 3 turns, Rock Lee will gain 10 points of damage reduction and that enemy will take 10 additional damage from 'Front Lotus'. This skill stacks and will deal 15 additional damage during 'Fifth Gate Opening'.",
                "energy": [
                    "Taijutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 0,
                "classes": [
                    "Physical",
                    "Action",
                    "Instant",
                    "Affliction"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "rock_lee_high_speed_taijutsu_damage",
                        "duration": 3,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "turnEndDamage": 10,
                            "turnEndTrigger": "source_turn",
                            "turnDurationAnchor": "source_turn",
                            "ongoingClass": "action",
                            "triggerOnApply": true,
                            "tooltipText": "This character takes 10 damage from High Speed Taijutsu."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "rock_lee_high_speed_taijutsu_front_lotus_mark",
                        "duration": 3,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "bonusDamageFromSourceSkillsFlat": 10,
                            "bonusDamageFromSourceCharacterId": "rock-lee",
                            "bonusDamageAppliesToSkillIds": [
                                "rock-lee-front-lotus"
                            ],
                            "mergeNumericAddKeys": [
                                "bonusDamageFromSourceSkillsFlat"
                            ],
                            "tooltipText": "This character takes additional damage from Front Lotus."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "rock_lee_high_speed_taijutsu_defense",
                        "duration": 3,
                        "scope": "self",
                        "metadata": {
                            "damageReductionFlat": 10,
                            "mergeNumericAddKeys": [
                                "damageReductionFlat"
                            ],
                            "tooltipText": "Rock Lee has damage reduction from High Speed Taijutsu."
                        }
                    },
                    {
                        "type": "HealthLoss",
                        "amount": 10,
                        "scope": "self"
                    }
                ]
            },
            {
                "id": "rock-lee-front-lotus",
                "name": "Front Lotus",
                "skillimage": "https://i.imgur.com/4boHWJ0.png",
                "skilldescription": "Rock Lee deals 30 damage to one enemy, takes 10 affliction damage and gains 20 points of permanent destructible defense that stacks. This skill deals 30 additional damage during 'Fifth Gate Opening'.",
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
                        "type": "HealthLoss",
                        "amount": 10,
                        "scope": "self"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "rock_lee_front_lotus_defense",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "destructibleDefensePoints": 20,
                            "mergeNumericAddKeys": [
                                "destructibleDefensePoints"
                            ],
                            "tooltipText": "Rock Lee has permanent destructible defense from Front Lotus."
                        }
                    }
                ]
            },
            {
                "id": "rock-lee-fifth-gate-opening",
                "name": "Fifth Gate Opening",
                "skillimage": "https://i.imgur.com/OvlloQo.png",
                "skilldescription": "Rock Lee removes all harmful effects on him, losing 30 health, and then becoming invulnerable to all harmful skills for 2 turns. The following 2 turns, this skill will be replaced by 'Final Lotus'. The affliction damage dealt by this skill cannot be ignored and cannot kill Rock Lee. This skill can only be used if Rock Lee has 80 or less health.",
                "energy": [
                    "Taijutsu"
                ],
                "target": "self",
                "actorCondition": {
                    "sourceCurrentHpAtMost": 80
                },
                "damage": 0,
                "cooldown": 4,
                "classes": [
                    "Strategic",
                    "Instant",
                    "Affliction"
                ],
                "effects": [
                    {
                        "type": "cleanse_harmful",
                        "scope": "self"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "rock_lee_fifth_gate_minimum_hp",
                        "duration": 2,
                        "scope": "self",
                        "metadata": {
                            "minimumHp": 1,
                            "tooltipText": "Fifth Gate Opening cannot kill Rock Lee."
                        }
                    },
                    {
                        "type": "HealthLoss",
                        "amount": 30,
                        "scope": "self"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "rock_lee_fifth_gate_opening",
                        "duration": 2,
                        "scope": "self",
                        "metadata": {
                            "invulnerable": true,
                            "skillDamageBonuses": {
                                "rock-lee-high-speed-taijutsu": 15,
                                "rock-lee-front-lotus": 30
                            },
                            "skillReplacements": {
                                "rock-lee-fifth-gate-opening": "rock-lee-final-lotus"
                            },
                            "tooltipText": "Rock Lee is invulnerable, High Speed Taijutsu and Front Lotus are improved, and Fifth Gate Opening is replaced by Final Lotus."
                        }
                    }
                ]
            },
            invulnerableSkill({
                id: "rock-lee-lee-block",
                name: "Lee Block",
                ownerName: "Rock Lee",
                image: "https://i.imgur.com/qgiODIf.png"
            }),
            {
                "id": "rock-lee-final-lotus",
                "name": "Final Lotus",
                "hiddenFromSelectionViewer": true,
                "useBaseSkillCooldown": true,
                "skillimage": "https://i.imgur.com/h658CGb.png",
                "skilldescription": "Rock Lee deals 100 damage to one enemy.",
                "energy": [
                    "Taijutsu",
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
                        "amount": 100,
                        "scope": "target"
                    }
                ]
            }
        ]
    };

    const tenten = {
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
                "skilldescription": "Tenten deals 20 damage to one enemy and 10 damage to all others. All enemies will take 10 additional damage from 'Twin Rising Dragons Trap' and will have their physical and chakra damage lowered by 10 additional points from it.",
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
                        "type": "damage",
                        "amount": 10,
                        "scope": "all-other-enemy"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "tenten_twin_rising_dragons_mark",
                        "duration": 1,
                        "scope": "all-enemy",
                        "condition": {
                            "scope": "self",
                            "missingStatusId": "tenten_full_release_active"
                        },
                        "metadata": {
                            "harmful": true,
                            "bonusDamageFromSourceSkillsFlat": 10,
                            "bonusDamageFromSourceCharacterId": "tenten",
                            "bonusDamageAppliesToSkillIds": [
                                "tenten-twin-rising-dragons-trap"
                            ],
                            "tooltipText": "This character takes additional damage from Twin Rising Dragons Trap."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "tenten_twin_rising_dragons_mark",
                        "duration": 1,
                        "scope": "all-enemy",
                        "condition": {
                            "scope": "self",
                            "statusId": "tenten_full_release_active"
                        },
                        "metadata": {
                            "harmful": true,
                            "bonusDamageFromSourceSkillsFlat": 20,
                            "bonusDamageFromSourceCharacterId": "tenten",
                            "bonusDamageAppliesToSkillIds": [
                                "tenten-twin-rising-dragons-trap"
                            ],
                            "tooltipText": "This character takes additional damage from Twin Rising Dragons Trap."
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
                "skilldescription": "Tenten deals 5 damage to all enemies. For 1 turn, their physical and chakra damage will be lowered by 5. All stacks of 'Twin Rising Dragons' will be removed from all targets afterwards.",
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
                            "scope": "self",
                            "missingStatusId": "tenten_full_release_active"
                        },
                        "metadata": {
                            "harmful": true,
                            "damageDebuffBySkillClass": {
                                "physical": 5,
                                "energy": 5
                            },
                            "tooltipText": "This character deals 5 less physical and chakra damage."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "tenten_twin_rising_dragons_trap_debuff",
                        "duration": 2,
                        "scope": "all-enemy",
                        "condition": {
                            "scope": "self",
                            "statusId": "tenten_full_release_active"
                        },
                        "metadata": {
                            "harmful": true,
                            "damageDebuffBySkillClass": {
                                "physical": 5,
                                "energy": 5
                            },
                            "tooltipText": "This character deals 5 less physical and chakra damage."
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
                "skilldescription": "Tenten becomes invulnerable for 1 turn and improves her harmful skills until the next time she uses one; this does not stack. Twin Rising Dragons will apply its non-damage effect twice and the damage reduction effect of Twin Rising Dragons Trap will last 1 additional turn.",
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
            invulnerableSkill({
                id: "tenten-spiked-boulder-wall",
                name: "Spiked Boulder Wall",
                ownerName: "Tenten",
                image: "https://i.imgur.com/45XopDc.png"
            }),
            {
                "id": "tenten-twin-rising-dragons-full-release-version",
                "name": "Twin Rising Dragons",
                "hiddenFromSelectionViewer": true,
                "omitFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/735M5GV.png",
                "skilldescription": "Tenten deals 20 damage to one enemy and 10 damage to all others. All enemies will take 10 additional damage from Twin Rising Dragons Trap and will have their physical and chakra damage lowered by 10 additional points from it.",
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
                        "type": "damage",
                        "amount": 10,
                        "scope": "all-other-enemy"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "tenten_twin_rising_dragons_mark",
                        "duration": 1,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "bonusDamageFromSourceSkillsFlat": 20,
                            "bonusDamageFromSourceCharacterId": "tenten",
                            "bonusDamageAppliesToSkillIds": [
                                "tenten-twin-rising-dragons-trap",
                                "tenten-twin-rising-dragons-trap-full-release-version"
                            ],
                            "tooltipText": "This character takes additional damage from Twin Rising Dragons Trap."
                        }
                    }
                ]
            },
            {
                "id": "tenten-twin-rising-dragons-trap-full-release-version",
                "name": "Twin Rising Dragons Trap",
                "hiddenFromSelectionViewer": true,
                "omitFromSelectionViewer": true,
                "skillimage": "https://i.imgur.com/pOsj115.png",
                "skilldescription": "Tenten deals 5 damage to all enemies. For 2 turns, their physical and chakra damage will be lowered by 5.",
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
                        "duration": 2,
                        "scope": "all-enemy",
                        "metadata": {
                            "harmful": true,
                            "damageDebuffBySkillClass": {
                                "physical": 5,
                                "energy": 5
                            },
                            "tooltipText": "This character deals 5 less physical and chakra damage."
                        }
                    },
                    {
                        "type": "cleanse_statuses",
                        "scope": "all-enemy",
                        "statusId": "tenten_twin_rising_dragons_mark"
                    }
                ]
            }
        ]
    };

    const neji = {
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
                "skilldescription": "Hyuuga Neji deals 25 damage to one enemy for 2 turns. During this time, this enemy's non-affliction damage will be lowered by 5.",
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
                            "turnEndDamage": 25,
                            "turnEndTrigger": "source_turn",
                            "turnDurationAnchor": "source_turn",
                            "ongoingClass": "action",
                            "triggerOnApply": true,
                            "NonAfflictionDamageDebuff": 5,
                            "tooltipText": "This character takes 25 damage and deals 5 less non-affliction damage."
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
                "skilldescription": "Hyuuga Neji deals 40 damage to one enemy and removes 1 random chakra from them.",
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
                        "amount": 40,
                        "scope": "target"
                    },
                    {
                        "type": "remove_random_chakra",
                        "amount": 1,
                        "scope": "target"
                    }
                ]
            },
            invulnerableSkill({
                id: "neji-hyuuga-byakugan-insight",
                name: "Byakugan Insight",
                ownerName: "Hyuuga Neji",
                image: "https://i.imgur.com/2eXVucA.png"
            })
        ]
    };

    const gaara = {
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
                            "tooltipText": "Sand Coffin is replaced by Sand Burial."
                        }
                    }
                ]
            },
            {
                "id": "gaara-of-the-desert-sand-clone",
                "name": "Sand Clone",
                "skillimage": "https://i.imgur.com/SCRKMIU.png",
                "skilldescription": "Until the next time Gaara receives new non-affliction damage, he will ignore all enemy stun effects. This skill cannot be used while active.",
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
                            "invulnerableToNonAffliction": true,
                            "triggerOnEnemyHarmfulNonMental": true,
                            "removeStatusIdsOnOwnerUseSkill": [],
                            "tooltipText": "Gaara ignores stuns and non-affliction damage until triggered."
                        }
                    }
                ]
            },
            {
                "id": "gaara-of-the-desert-armor-of-sand",
                "name": "Armor of Sand",
                "skillimage": "https://i.imgur.com/qfrA8gB.png",
                "skilldescription": "Gaara gains 40 points of permanent destructible defense. This skill cannot stack and will re-apply itself.",
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
                            "tooltipText": "Gaara has permanent destructible defense from Armor of Sand."
                        }
                    }
                ]
            },
            invulnerableSkill({
                id: "gaara-of-the-desert-shield-of-sand",
                name: "Shield of Sand",
                ownerName: "Gaara",
                image: "https://i.imgur.com/vL03kPm.png"
            }),
            {
                "id": "gaara-of-the-desert-sand-burial",
                "name": "Sand Burial",
                "hiddenFromSelectionViewer": true,
                "cannotBeCountered": true,
                "cannotBeReflected": true,
                "skillimage": "https://i.imgur.com/ljX9izT.png",
                "skilldescription": "Gaara kills one enemy. This skill requires 'Sand Coffin' to be active on this enemy. This skill cannot be countered or reflected.",
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
                        "type": "execute_below_hp",
                        "threshold": 999,
                        "scope": "target"
                    }
                ]
            }
        ]
    };

    const kankuro = {
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
                            "bonusDamageFromSourceSkillsFlat": 5,
                            "bonusDamageFromSourceCharacterId": "kankuro",
                            "bonusDamageAppliesToSkillIds": [
                                "kankuro-poison-bomb"
                            ],
                            "tooltipText": "This character takes additional damage from Poison Bomb."
                        }
                    }
                ]
            },
            {
                "id": "kankuro-poison-bomb",
                "name": "Poison Bomb",
                "skillimage": "https://i.imgur.com/3MFMSHu.png",
                "skilldescription": "Kankuro deals 10 affliction damage to all enemies. For 1 turn, these enemies will take 5 additional damage from 'Black Secret Machine One Shot'.",
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
                        "metadata": {
                            "harmful": true,
                            "bonusDamageFromSourceSkillsFlat": 5,
                            "bonusDamageFromSourceCharacterId": "kankuro",
                            "bonusDamageAppliesToSkillIds": [
                                "kankuro-black-secret-machine-one-shot"
                            ],
                            "tooltipText": "This character takes additional damage from Black Secret Machine One Shot."
                        }
                    }
                ]
            },
            {
                "id": "kankuro-puppet-preparation",
                "name": "Puppet Preparation",
                "skillimage": "https://i.imgur.com/ghx3V0n.png",
                "skilldescription": "Kankuro gains 15 points of permanent destructible defense. For 4 turns, 'Black Secret Machine One Shot' and 'Poison Bomb' will deal 5 additional damage. This skill stacks.",
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
                            "tooltipText": "Kankuro has permanent destructible defense from Puppet Preparation."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "kankuro_puppet_preparation_bonus",
                        "duration": 4,
                        "scope": "self",
                        "metadata": {
                            "skillDamageBonuses": {
                                "kankuro-black-secret-machine-one-shot": 5,
                                "kankuro-poison-bomb": 5
                            },
                            "tooltipText": "Black Secret Machine One Shot and Poison Bomb deal additional damage."
                        }
                    }
                ]
            },
            invulnerableSkill({
                id: "kankuro-puppet-replacement-technique",
                name: "Puppet Replacement Technique",
                ownerName: "Kankuro",
                image: "https://i.imgur.com/P2K3Uue.png"
            })
        ]
    };

    const temari = {
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
                            "skillReplacements": {
                                "temari-summoning-quick-beheading-dance": "temari-summoning-quick-beheading-dance-reduced"
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
            invulnerableSkill({
                id: "temari-fan-defence-technique",
                name: "Fan Defence Technique",
                ownerName: "Temari",
                image: "https://i.imgur.com/nnNAsmM.png"
            }),
            {
                "id": "temari-summoning-quick-beheading-dance-reduced",
                "name": "Summoning Quick Beheading Dance",
                "hiddenFromSelectionViewer": true,
                "useBaseSkillCooldown": true,
                "skillimage": "https://i.imgur.com/AsbfOOH.png",
                "skilldescription": "Temari summons the wind weasel Kamatari in the battlefield, dealing 35 damage to all enemies.",
                "energy": [
                    "Ninjutsu",
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
            }
        ]
    };

    return {
        "rock-lee": rockLee,
        "tenten": tenten,
        "neji-hyuuga": neji,
        "gaara-of-the-desert": gaara,
        "kankuro": kankuro,
        "temari": temari
    };
});
