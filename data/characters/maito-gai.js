module.exports = {
    "id": "maito-gai",
    "characterId": "maito-gai",
    "name": "Maito Gai",
    "facePicture": "https://i.imgur.com/Kimqis6.png",
    "characterdeescription": "The squad leader of Team Gai, and father-like figure to Lee, Gai is a passionate man that's always there for those who need him. In combat, Gai's taijutsu has no equal, being able to open the Eight Gates and pound away at all threats.",
    "requiredMissionId": "team-9-the-best-taijutsu-team",
    "skills": [
        {
            "id": "maito-gai-leaf-whirlwind",
            "name": "Leaf Whirlwind",
            "skillimage": "https://i.imgur.com/5bcxm2m.png",
            "skilldescription": "Maito Gai deals 30 damage to one enemy. During 'Sixth Gate Opening', this skill will be improved and deal 60 piercing damage that ignores invulnerability.",
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
                }
            ]
        },
        {
            "id": "maito-gai-sixth-gate-opening",
            "name": "Sixth Gate Opening",
            "skillimage": "https://i.imgur.com/Lf75g0n.png",
            "skilldescription": "Maito Gai takes 30 affliction damage. This effect cannot kill Maito Gai. The following 2 turns, 'Leaf Whirlwind' will deal 60 piercing damage that ignores invulnerability. During this time, Maito Gai is invulnerable.",
            "energy": [
                "Taijutsu"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 4,
            "classes": [
                "Strategic",
                "Instant",
                "Affliction"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "gai_sixth_gate",
                    "duration": 2,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "invulnerable": true,
                        "minimumHpFromSelfSkillDamage": 1,
                        "skillReplacements": {
                            "maito-gai-leaf-whirlwind": "maito-gai-leaf-whirlwind-empowered",
                            "maito-gai-counter-punch": "maito-gai-morning-peacock-feint"
                        },
                        "tooltipText": "Maito Gai is invulnerable. Leaf Whirlwind is empowered and Counter Punch becomes Morning Peacock Feint."
                    }
                },
                {
                    "type": "damage",
                    "amount": 30,
                    "scope": "self",
                    "metadata": {
                        "afflictionDamage": true
                    }
                }
            ]
        },
        {
            "id": "maito-gai-counter-punch",
            "name": "Counter Punch",
            "skillimage": "https://i.imgur.com/WN5AnD8.png",
            "skilldescription": "Maito Gai targets one enemy. If this enemy uses a new harmful skill the following turn, they will take 30 damage. This skill is invisible.",
            "energy": [
                "Taijutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "gai_counter_punch_mark",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "hideTooltipFromUnitOwner": true,
                        "onOwnerUseSkillTrigger": true,
                        "onOwnerUseSkillHarmfulOnly": true,
                        "onOwnerUseSkillEffects": [
                            {
                                "type": "damage",
                                "amount": 30,
                                "scope": "self"
                            }
                        ],
                        "tooltipText": "If this character uses a new harmful skill, they will take 30 damage.",
                        "turnDurationAnchor": "source_turn"
                    }
                }
            ]
        },
        {
            "id": "maito-gai-gai-dodge",
            "name": "Gai Dodge",
            "skillimage": "https://i.imgur.com/GtBoCxV.png",
            "skilldescription": "This skill makes Maito Gai invulnerable for 1 turn.",
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
            "id": "maito-gai-leaf-whirlwind-empowered",
            "name": "Leaf Whirlwind",
            "hiddenFromSelectionViewer": true,
            "skillimage": "deadcharacter.png",
            "skilldescription": "Maito Gai deals 60 piercing damage to one enemy that ignores invulnerability.",
            "energy": [
                "Taijutsu",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "ignoreInvulnerability": true,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 60,
                    "scope": "target",
                    "metadata": {
                        "ignoreDamageReduction": true
                    }
                }
            ]
        },
        {
            "id": "maito-gai-morning-peacock-feint",
            "name": "Morning Peacock Feint",
            "hiddenFromSelectionViewer": true,
            "skillimage": "deadcharacter.png",
            "skilldescription": "Maito Gai targets himself or one ally. The following turn, the first harmful non-mental skill used on that target will be countered and the attacker will take 30 piercing damage. This skill is invisible.",
            "energy": [
                "Taijutsu"
            ],
            "target": "self-or-single-ally",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "gai_morning_peacock_feint",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "helpful": true,
                        "hideTooltipFromEnemy": true,
                        "triggerOnEnemyHarmfulNonMental": true,
                        "counterCancelsSkill": true,
                        "counterDamage": 30,
                        "counterDamageIgnoresReduction": true,
                        "counterDamageIgnoresDestructibleDefense": true,
                        "tooltipText": "The first harmful non-mental skill used on this character will be countered and the attacker will take 30 piercing damage."
                    }
                }
            ]
        }
    ]
};
