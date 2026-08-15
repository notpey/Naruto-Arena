module.exports = {
    "id": "akimichi-chouji-s",
    "characterId": "akimichi-chouji-s",
    "name": "Akimichi Chouji (S)",
    "facePicture": "deadcharacter.png",
    "characterdeescription": "After nearly three years, Chouji has developed in both strength and size, mastering the Akimichi clan techniques. No longer does Chouji need the Akimichi pills to tap into his true strength, instead, he merely needs to control his chakra and become a force to reckon with.",
    "requiredMissionId": "a-portly-but-steadfast-ninja",
    "skills": [
        {
            "id": "akimichi-chouji-s-expansion-technique",
            "name": "Expansion Technique",
            "skillimage": "deadcharacter.png",
            "skilldescription": "For 4 turns, Akimichi Chouji (S) gains 25 points of destructible defense, 'Spiked Meat Tank' will do its alternate effects and have 1 less turn of cooldown, and 'Mega Palm Thrust' will be improved.",
            "energy": [
                "Random"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "akimichi_chouji_s_expansion_technique_active",
                    "duration": 4,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePoints": 25,
                        "skillReplacements": {
                            "akimichi-chouji-s-spiked-meat-tank": "akimichi-chouji-s-spiked-meat-tank-alt"
                        },
                        "tooltipText": "Expansion Technique is active with 25 destructible defense: Spiked Meat Tank and Mega Palm Thrust are empowered."
                    }
                }
            ]
        },
        {
            "id": "akimichi-chouji-s-spiked-meat-tank",
            "name": "Spiked Meat Tank",
            "skillimage": "deadcharacter.png",
            "skilldescription": "Akimichi Chouji (S) targets one ally or himself and will counter all enemy non-mental skills used on the target for 1 turn. The countered enemies will take 25 damage. This skill is invisible. Alternate: Akimichi Chouji (S) deals 25 damage to one enemy and becomes invulnerable for 1 turn.",
            "energy": [
                "Bloodline"
            ],
            "target": "single-ally",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "akimichi_chouji_s_spiked_meat_tank_counter",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "invisible": true,
                        "triggerOnEnemyHarmfulNonMental": true,
                        "counterDamage": 25,
                        "tooltipText": "Counters enemy non-mental skills and deals 25 damage to the attacker."
                    }
                }
            ]
        },
        {
            "id": "akimichi-chouji-s-spiked-meat-tank-alt",
            "name": "Spiked Meat Tank (Alternate)",
            "skillimage": "deadcharacter.png",
            "skilldescription": "Akimichi Chouji (S) deals 25 damage to one enemy and becomes invulnerable for 1 turn.",
            "energy": [
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
                    "amount": 25,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "akimichi_chouji_s_spiked_meat_tank_alt_invul",
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
            "id": "akimichi-chouji-s-mega-palm-thrust",
            "name": "Mega Palm Thrust",
            "skillimage": "deadcharacter.png",
            "skilldescription": "Akimichi Chouji (S) deals 25 piercing damage to one enemy. During 'Expansion Technique', this damage is improved to 40, the targeted enemy has their non-strategic skills stunned for 1 turn, and this skill has an 1 turn cooldown.",
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
                    "amount": 25,
                    "scope": "target",
                    "condition": {
                        "scope": "self",
                        "missingStatusId": "akimichi_chouji_s_expansion_technique_active"
                    },
                    "metadata": {
                        "ignoreDamageReduction": true
                    }
                },
                {
                    "type": "damage",
                    "amount": 40,
                    "scope": "target",
                    "condition": {
                        "scope": "self",
                        "hasStatusId": "akimichi_chouji_s_expansion_technique_active"
                    },
                    "metadata": {
                        "ignoreDamageReduction": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "akimichi_chouji_s_mega_palm_thrust_stun",
                    "duration": 1,
                    "scope": "target",
                    "condition": {
                        "scope": "self",
                        "hasStatusId": "akimichi_chouji_s_expansion_technique_active"
                    },
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkillClasses": [
                            "physical",
                            "energy",
                            "mental",
                            "ninjutsu"
                        ],
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character's non-strategic skills are stunned for 1 turn."
                    }
                }
            ]
        },
        {
            "id": "akimichi-chouji-s-effortful-block",
            "name": "Effortful Block",
            "skillimage": "deadcharacter.png",
            "skilldescription": "This skill makes Akimichi Chouji (S) invulnerable for 1 turn.",
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
                    "statusId": "akimichi_chouji_s_effortful_block_invul",
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
};
