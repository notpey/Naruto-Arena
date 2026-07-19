module.exports = {
    "id": "nohara-rin",
    "characterId": "nohara-rin",
    "name": "Nohara Rin",
    "facePicture": "https://i.imgur.com/nVN2Va7.png",
    "characterdeescription": "A chuunin medical nin assigned to Team Minato, Rin is a quiet and passive girl who focuses on keeping her team mates alive. Using her healing abilities, and her intelligence, Rin is able to heal her allies while trapping her enemies.",
    "skills": [
        {
            "id": "nohara-rin-pit-trap",
            "name": "Pit Trap",
            "skillimage": "https://i.imgur.com/h7PnmYi.png",
            "skilldescription": "For 1 turn, Nohara Rin will gain 15 points of damage reduction and one target enemy will take 15 piercing damage that ignores invulnerability at the end of their turn. If that enemy uses a new skill, they will also take another 15 damage from this skill. This skill is invisible and ignores invulnerability. This skill's damage isn't increased nor decreased by effects used on Nohara Rin.",
            "energy": [
                "Genjutsu"
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
                    "type": "apply_status",
                    "statusId": "nohara_rin_pit_trap_defense",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "hideTooltipFromEnemy": true,
                        "damageReductionFlat": 15,
                        "tooltipText": "Nohara Rin has 15 points of damage reduction from Pit Trap."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "nohara_rin_pit_trap",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "hideTooltipFromEnemy": true,
                        "turnEndDamage": 15,
                        "ignoreSourceNonAfflictionDamageBonus": true,
                        "ignoreTargetDestructibleDefense": true,
                        "triggerOnEnemyHarmfulSkill": true,
                        "counterDamage": 15,
                        "counterDamageIgnoresDestructibleDefense": true,
                        "tooltipText": "This character takes 15 piercing damage that ignores invulnerability at the end of their turn. If they use a new skill, they take another 15 damage."
                    }
                }
            ]
        },
        {
            "id": "nohara-rin-mystical-palm-healing",
            "name": "Rin Mystical Palm Healing",
            "skillimage": "https://i.imgur.com/vMIpkz6.png",
            "skilldescription": "Nohara Rin heals herself or an ally for 25 health and removes all enemy affliction skills on this character.",
            "energy": [
                "Ninjutsu"
            ],
            "target": "single-ally",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "heal",
                    "amount": 25,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "nohara_rin_mystical_palm_healing_cleanse",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "helpful": true,
                        "hideTooltip": true,
                        "removeEnemyAfflictionStatusesOnApply": true
                    }
                }
            ]
        },
        {
            "id": "nohara-rin-medical-kit",
            "name": "Medical Kit",
            "skillimage": "https://i.imgur.com/uLva4cB.png",
            "skilldescription": "Nohara Rin targets herself or an ally. For 3 turns, that character will be healed for 10 health each turn. During this time, they will deal 5 additional damage with physical and energy skills.",
            "energy": [
                "Random",
                "Random"
            ],
            "target": "single-ally",
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "nohara_rin_medical_kit",
                    "duration": 3,
                    "scope": "target",
                    "metadata": {
                        "helpful": true,
                        "turnEndHealFlat": 10,
                        "damageBonusBySkillClass": {
                            "physical": 5,
                            "energy": 5
                        },
                        "tooltipText": "This character heals 10 health each turn and deals 5 additional damage with physical and energy skills from Medical Kit."
                    }
                }
            ]
        },
        {
            "id": "nohara-rin-flee",
            "name": "Flee",
            "skillimage": "https://i.imgur.com/10ydruj.png",
            "skilldescription": "This skill makes Nohara Rin invulnerable for 1 turn.",
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
                    "statusId": "nohara_rin_flee",
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
};
