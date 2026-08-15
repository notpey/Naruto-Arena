module.exports = {
    "id": "hiruko-sasori",
    "characterId": "hiruko-sasori",
    "name": "Hiruko Sasori",
    "facePicture": "https://i.imgur.com/TA5UaWE.png",
    "characterdeescription": "Hiruko is a puppet used by the Akatsuki shinobi, Sasori. Serving as a \"puppet armor\", it allowed Sasori to hide inside of it. Hiruko is a human puppet made from the corpse of a renowned shinobi - this puppet is also Sasori's favorite. ORIGINAL DESIGN: Liann",
    "requiredMissionId": "covering-puppet",
    "skills": [
        {
            "id": "hiruko-sasori-poisonous-tail-stab",
            "name": "Poisonous Tail Stab",
            "skillimage": "https://i.imgur.com/mkBepem.png",
            "skilldescription": "Hiruko Sasori deals 10 affliction damage to one enemy, who will take 5 affliction damage each following turn permanently. This skill stacks.",
            "energy": [
                "Taijutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Affliction",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 10,
                    "scope": "target",
                    "metadata": {
                        "afflictionDamage": true,
                        "ignoreDamageReduction": true,
                        "ignoreDestructibleDefense": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "hiruko_sasori_poisonous_tail_poison",
                    "duration": 99,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "stackable": true,
                        "damagePerTurn": 5,
                        "afflictionDamage": true,
                        "ignoreDamageReduction": true,
                        "ignoreDestructibleDefense": true,
                        "tooltipText": "Taking 5 affliction damage each turn permanently."
                    }
                }
            ]
        },
        {
            "id": "hiruko-sasori-sand-clone-trap",
            "name": "Sand Clone Trap",
            "skillimage": "https://i.imgur.com/aaIW9Km.png",
            "skilldescription": "For 1 turn, Hiruko Sasori will ignore all enemy damage dealt. Every enemy that use a new non-strategic skill on him during this time will take 10 affliction damage instantly and then take 10 affliction damage permanently. This skill stacks and ends when Hiruko Sasori dies. This skill is invisible.",
            "energy": [
                "Ninjutsu"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Affliction",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "hiruko_sasori_sand_clone_trap_active",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "invisible": true,
                        "invulnerableToEnemyDamage": true,
                        "triggerOnEnemyHarmfulNonStrategic": true,
                        "counterDamage": 10,
                        "counterDamageIgnoresReduction": true,
                        "counterDamageIgnoresDestructibleDefense": true,
                        "counterStatusId": "hiruko_sasori_sand_clone_poison_perm",
                        "counterStatusDuration": 99,
                        "counterStatusMetadata": {
                            "harmful": true,
                            "stackable": true,
                            "damagePerTurn": 10,
                            "afflictionDamage": true,
                            "ignoreDamageReduction": true,
                            "ignoreDestructibleDefense": true,
                            "tooltipText": "Taking 10 permanent affliction damage per turn."
                        },
                        "tooltipText": "Ignores enemy damage for 1 turn and poisons attackers for 10 instant damage and 10 permanent damage."
                    }
                }
            ]
        },
        {
            "id": "hiruko-sasori-puppet-reveal",
            "name": "Puppet Reveal",
            "skillimage": "https://i.imgur.com/YOqOLrm.png",
            "skilldescription": "Hiruko Sasori removes all enemy affliction skills on him then becomes invulnerable to energy and affliction skills for 3 turns. During this time, 'Poisonous Tail Stab' will be replaced by 'Eight Waves of Needles' and 'Sand Clone Trap' will be replaced by 'Prosthetic Arm Senbon'.",
            "energy": [
                "Random"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 5,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "remove_status",
                    "scope": "self",
                    "metadata": {
                        "afflictionOnly": true,
                        "harmfulOnly": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "hiruko_sasori_puppet_reveal_active",
                    "duration": 3,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "invulnerableToEnergySkills": true,
                        "invulnerableToAfflictionSkills": true,
                        "skillReplacements": {
                            "hiruko-sasori-poisonous-tail-stab": "hiruko-sasori-eight-waves-of-needles",
                            "hiruko-sasori-sand-clone-trap": "hiruko-sasori-prosthetic-arm-senbon"
                        },
                        "tooltipText": "Puppet Reveal active: Invulnerable to energy and affliction skills."
                    }
                }
            ]
        },
        {
            "id": "hiruko-sasori-tail-deflection",
            "name": "Tail Deflection",
            "skillimage": "https://i.imgur.com/KdJD3ve.png",
            "skilldescription": "This skill makes Hiruko Sasori invulnerable for 1 turn.",
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
                    "statusId": "hiruko_sasori_tail_deflection_invul",
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
            "id": "hiruko-sasori-eight-waves-of-needles",
            "name": "Eight Waves of Needles",
            "skillimage": "https://i.imgur.com/Ossz08T.png",
            "skilldescription": "Hiruko Sasori removes all enemy affliction skills on his team and then deals 5 affliction damage to all enemies each turn permanently. This skill stacks.",
            "energy": [
                "Taijutsu",
                "Ninjutsu"
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
                    "type": "remove_status",
                    "scope": "all-ally",
                    "metadata": {
                        "afflictionOnly": true,
                        "harmfulOnly": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "hiruko_sasori_eight_waves_dot",
                    "duration": 99,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "stackable": true,
                        "damagePerTurn": 5,
                        "afflictionDamage": true,
                        "ignoreDamageReduction": true,
                        "ignoreDestructibleDefense": true,
                        "tooltipText": "Taking 5 affliction damage each turn permanently."
                    }
                }
            ]
        },
        {
            "id": "hiruko-sasori-prosthetic-arm-senbon",
            "name": "Prosthetic Arm Senbon",
            "skillimage": "https://i.imgur.com/GpzHQEE.png",
            "skilldescription": "Hiruko Sasori removes all enemy affliction skills on his team and then deals 5 piercing damage and 5 affliction damage* to all enemies for 3 turns. When this skill ends, Hiruko Sasori will become invulnerable for 1 turn. This skill ends if Hiruko Sasori dies.",
            "energy": [
                "Random",
                "Random"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Physical",
                "Instant",
                "Affliction*"
            ],
            "effects": [
                {
                    "type": "remove_status",
                    "scope": "all-ally",
                    "metadata": {
                        "afflictionOnly": true,
                        "harmfulOnly": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "hiruko_sasori_prosthetic_arm_dot",
                    "duration": 3,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "damagePerTurn": 5,
                        "ignoreDamageReduction": true,
                        "afflictionDamagePerTurn": 5,
                        "onExpireEffects": [
                            {
                                "type": "apply_status",
                                "statusId": "hiruko_sasori_prosthetic_arm_end_invul",
                                "duration": 1,
                                "scope": "source",
                                "metadata": {
                                    "helpful": true,
                                    "invulnerable": true,
                                    "tooltipText": "Invulnerable for 1 turn."
                                }
                            }
                        ],
                        "tooltipText": "Taking 5 piercing damage and 5 affliction damage per turn for 3 turns."
                    }
                }
            ]
        }
    ]
};
