module.exports = {
    "id": "puppet-sasori",
    "characterId": "puppet-sasori",
    "name": "Puppet Sasori",
    "facePicture": "https://i.imgur.com/huF0Rd7.png",
    "characterdeescription": "Sasori's true form is a puppet body with a living core attached to it. In this form, he can use weapons like a flamethrower and water jets, while still controling a hundred puppets. ORIGINAL DESIGN: AnteMito",
    "requiredMissionId": "a-perfect-body",
    "skills": [
        {
            "id": "puppet-sasori-flamethrower",
            "name": "Flamethrower",
            "skillimage": "https://i.imgur.com/NScpPLl.png",
            "skilldescription": "Puppet Sasori deals 20 affliction damage to one enemy. If 'Water Stream Shooters' was used on this enemy the previous turn, they will have their non-affliction damage reduced by 10 for 1 turn.",
            "energy": [
                "Bloodline"
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
                    "statusId": "puppet_sasori_flamethrower_mark",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "Marked by Flamethrower."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "puppet_sasori_flamethrower_weaken",
                    "duration": 1,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "hasStatusId": "puppet_sasori_water_stream_mark"
                    },
                    "metadata": {
                        "harmful": true,
                        "damageDealtFlatModifier": -10,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character deals 10 less non-affliction damage for 1 turn."
                    }
                }
            ]
        },
        {
            "id": "puppet-sasori-water-stream-shooters",
            "name": "Water Stream Shooters",
            "skillimage": "https://i.imgur.com/fnKcko9.png",
            "skilldescription": "Puppet Sasori deals 20 piercing damage to one enemy. If 'Flamethrower' was used on this enemy the previous turn, they will be stunned for 1 turn.",
            "energy": [
                "Ninjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Energy",
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
                    "type": "apply_status",
                    "statusId": "puppet_sasori_water_stream_mark",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "Marked by Water Stream Shooters."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "puppet_sasori_water_stream_stun",
                    "duration": 1,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "hasStatusId": "puppet_sasori_flamethrower_mark"
                    },
                    "metadata": {
                        "harmful": true,
                        "stun": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character is stunned for 1 turn."
                    }
                }
            ]
        },
        {
            "id": "puppet-sasori-performance-of-a-hundred-puppets",
            "name": "Performance of a Hundred Puppets",
            "skillimage": "https://i.imgur.com/8Cf3egf.png",
            "skilldescription": "For 3 turns, 'Flamethrower' and 'Water Stream Shooters' will deal 10 additional damage. During this time, Puppet Sasori targets all enemies and everytime they use a new harmful skill, they will take 5 piercing damage. The following 3 turns, this skill will be replaced by 'Puppet Attack'.",
            "energy": [
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
                    "statusId": "puppet_sasori_hundred_puppets_self_buff",
                    "duration": 3,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillDamageBonuses": {
                            "puppet-sasori-flamethrower": 10,
                            "puppet-sasori-water-stream-shooters": 10
                        },
                        "skillReplacements": {
                            "puppet-sasori-performance-of-a-hundred-puppets": "puppet-sasori-puppet-attack"
                        },
                        "tooltipText": "Flamethrower and Water Stream Shooters deal 10 additional damage."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "puppet_sasori_hundred_puppets_retaliation_mark",
                    "duration": 3,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "damageOnHarmfulSkillUsePiercing": 5,
                        "tooltipText": "Takes 5 piercing damage when using a harmful skill."
                    }
                }
            ]
        },
        {
            "id": "puppet-sasori-living-core",
            "name": "Living Core",
            "skillimage": "https://i.imgur.com/r9oI8D1.png",
            "skilldescription": "This skill makes Puppet Sasori invulnerable for 1 turn.",
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
                    "statusId": "puppet_sasori_living_core_invul",
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
            "id": "puppet-sasori-puppet-attack",
            "name": "Puppet Attack",
            "skillimage": "https://i.imgur.com/Q1HF3wS.png",
            "skilldescription": "Puppet Sasori deals 25 damage to all enemies.",
            "energy": [
                "Random",
                "Random"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 25,
                    "scope": "all-enemy"
                }
            ]
        }
    ]
};
