module.exports = {
    "id": "tenten-s",
    "characterId": "tenten-s",
    "name": "Tenten (S)",
    "facePicture": "https://i.imgur.com/KIlLyZW.png",
    "characterdeescription": "Now a chuunin, Tenten has added a myriad of powerful and potent weapons in her arsenal, even procuring the legendary fan of the sage of the six paths. Having an arsenal of weapons at her side, Tenten can chose to fight at different levels, upgrading her weapons until she finds something suitable for her battle.",
    "requiredMissionId": "a-genius-of-ranged-combat",
    "skills": [
        {
            "id": "tenten-s-kunai-grenade",
            "name": "Kunai Grenade",
            "skillimage": "https://i.imgur.com/aJmF4ft.png",
            "skilldescription": "Tenten (S) deals 20 damage to one enemy and 10 damage to all other enemies. This skill cannot be countered or reflected.",
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
                        "cannotBeCountered": true,
                        "cannotBeReflected": true
                    }
                },
                {
                    "type": "damage",
                    "amount": 10,
                    "scope": "other-enemy",
                    "metadata": {
                        "cannotBeCountered": true,
                        "cannotBeReflected": true
                    }
                }
            ]
        },
        {
            "id": "tenten-s-chain-spin",
            "name": "Chain Spin",
            "skillimage": "https://i.imgur.com/HtNe7Ys.png",
            "skilldescription": "Tenten (S) makes her team invulnerable to non-strategic skills for 1 turn.",
            "energy": [
                "Random"
            ],
            "target": "all-allies",
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "tenten_s_chain_spin_invul",
                    "duration": 1,
                    "scope": "all-ally",
                    "metadata": {
                        "invulnerableToNonStrategicSkills": true,
                        "tooltipText": "Invulnerable to non-strategic skills for 1 turn."
                    }
                }
            ]
        },
        {
            "id": "tenten-s-weapon-upgrade",
            "name": "Weapon Upgrade",
            "skillimage": "https://i.imgur.com/EzGlhJv.png",
            "skilldescription": "Tenten (S) gains 5 points of destructible defense. The first time this skill is used, it will replace 'Kunai Grenade' and 'Chain Spin'. The second time it is used, they will be replaced again. The third time this skill is used, it will reset, and her skills will revert back to the original ones.",
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
                    "statusId": "tenten_s_weapon_upgrade_tier",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePoints": 5,
                        "destructibleDefensePermanent": true,
                        "tentenWeaponUpgradeCycle": true,
                        "tooltipText": "Tenten has upgraded her weapons with 5 destructible defense."
                    }
                }
            ]
        },
        {
            "id": "tenten-s-leaping-dodge",
            "name": "Leaping Dodge",
            "skillimage": "https://i.imgur.com/qM4w2Qr.png",
            "skilldescription": "This skill makes Tenten (S) invulnerable for 1 turn.",
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
                    "statusId": "tenten_s_leaping_dodge_invul",
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
            "id": "tenten-s-heavenly-chain-disaster",
            "name": "Heavenly Chain Disaster",
            "skillimage": "https://i.imgur.com/VB5VDDo.png",
            "skilldescription": "Tenten (S) deals 25 piercing damage to all enemies.",
            "energy": [
                "Taijutsu",
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
                    "scope": "all-enemy",
                    "metadata": {
                        "ignoreDamageReduction": true
                    }
                }
            ]
        },
        {
            "id": "tenten-s-iron-protection-wall",
            "name": "Iron Protection Wall",
            "skillimage": "https://i.imgur.com/jkb9GzA.png",
            "skilldescription": "Tenten (S) makes her team invulnerable to physical skills for 1 turn and grants them 20 points of permanent destructible defense. This effect stacks.",
            "energy": [
                "Ninjutsu",
                "Random"
            ],
            "target": "all-allies",
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "tenten_s_iron_protection_wall_invul",
                    "duration": 1,
                    "scope": "all-ally",
                    "metadata": {
                        "invulnerableToPhysicalSkills": true,
                        "destructibleDefensePoints": 20,
                        "destructibleDefensePermanent": true,
                        "tooltipText": "Invulnerable to physical skills for 1 turn and gained 20 permanent destructible defense."
                    }
                }
            ]
        },
        {
            "id": "tenten-s-bashousen-coil-of-wind",
            "name": "Bashousen: Coil of Wind",
            "skillimage": "https://i.imgur.com/48AoQR3.png",
            "skilldescription": "The following turn, any new non-mental skill used on Tenten (S) or her team will be reflected onto the character who used it. This skill is invisible.",
            "energy": [
                "Ninjutsu",
                "Random"
            ],
            "target": "all-allies",
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "tenten_s_coil_of_wind_reflect",
                    "duration": 1,
                    "scope": "all-ally",
                    "metadata": {
                        "invisible": true,
                        "reflectOnEnemyHarmfulNonMental": true,
                        "tooltipText": "Reflects enemy non-mental skills next turn."
                    }
                }
            ]
        },
        {
            "id": "tenten-s-bashousen-coil-of-fire",
            "name": "Bashousen: Coil of Fire",
            "skillimage": "https://i.imgur.com/S2wOVgc.png",
            "skilldescription": "Tenten (S) targets all enemies, dealing 10 damage and 10 affliction damage* to them. They will then receive 5 affliction damage* for the following 3 turns.",
            "energy": [
                "Taijutsu",
                "Ninjutsu"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Physical",
                "Instant",
                "Affliction*"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 10,
                    "scope": "all-enemy"
                },
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
                    "statusId": "tenten_s_coil_of_fire_burn",
                    "duration": 3,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "damagePerTurn": 5,
                        "afflictionDamage": true,
                        "ignoreDamageReduction": true,
                        "ignoreDestructibleDefense": true,
                        "tooltipText": "Taking 5 affliction damage per turn."
                    }
                }
            ]
        }
    ]
};
