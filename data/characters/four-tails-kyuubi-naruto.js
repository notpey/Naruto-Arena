module.exports = {
    "id": "four-tails-kyuubi-naruto",
    "characterId": "four-tails-kyuubi-naruto",
    "name": "Four Tails Kyuubi Naruto",
    "facePicture": "https://i.imgur.com/JwO8ylH.png",
    "characterdeescription": "Naruto, after giving into his rage and manifesting a fourth tail, ceases to be himself. In this state, Naruto becomes a mindless being of rage and destruction - but the price is his own life.",
    "requiredMissionId": "what-lies-beneath",
    "skills": [
        {
            "id": "four-tails-kyuubi-naruto-transformation",
            "name": "Four Tails Transformation",
            "skillimage": "https://i.imgur.com/KqbxHIZ.png",
            "skilldescription": "Four Tails Kyuubi Naruto gains 15 points of unpierceable damage reduction and 15 points of destructible defense permanently. He takes 5 affliction damage* each turn. He ignores healing effects and enemy stun effects. Four Tails Kyuubi Naruto can use 'Shockwave Smash' and 'Compressed Chakra Blast' while this skill is active. This skill becomes 'Enrage' permanently. This skill cannot be removed.",
            "energy": [
                "Random"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Strategic",
                "Instant",
                "Affliction*"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "four_tails_kyuubi_transformation_stance",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "damageReductionUnpierceableFlat": 15,
                        "destructibleDefensePoints": 15,
                        "destructibleDefensePermanent": true,
                        "damagePerTurn": 5,
                        "afflictionDamage": true,
                        "ignoreDamageReduction": true,
                        "ignoreDestructibleDefense": true,
                        "ignoreHealing": true,
                        "immuneToStun": true,
                        "cannotBeRemoved": true,
                        "skillReplacements": {
                            "four-tails-kyuubi-naruto-transformation": "four-tails-kyuubi-naruto-enrage"
                        },
                        "tooltipText": "Four Tails Transformation is active: 15 unpierceable DR, takes 5 affliction damage per turn, immune to healing and stuns."
                    }
                }
            ]
        },
        {
            "id": "four-tails-kyuubi-naruto-shockwave-smash",
            "name": "Shockwave Smash",
            "skillimage": "https://i.imgur.com/pNtv4Ur.png",
            "skilldescription": "Four Tails Kyuubi Naruto deals 20 damage to all enemies. This skill may only be used during 'Four Tails Transformation' and cannot be reflected.",
            "energy": [
                "Random",
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
                    "amount": 20,
                    "scope": "all-enemy",
                    "condition": {
                        "scope": "self",
                        "hasStatusId": "four_tails_kyuubi_transformation_stance"
                    },
                    "metadata": {
                        "cannotBeReflected": true
                    }
                }
            ]
        },
        {
            "id": "four-tails-kyuubi-naruto-compressed-chakra-blast",
            "name": "Compressed Chakra Blast",
            "skillimage": "https://i.imgur.com/E0fppGJ.png",
            "skilldescription": "Four Tails Kyuubi Naruto deals 50 piercing damage to one enemy. This skill may only be used during 'Four Tails Transformation' and cannot be reflected.",
            "energy": [
                "Random",
                "Random",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Chakra",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 50,
                    "scope": "target",
                    "condition": {
                        "scope": "self",
                        "hasStatusId": "four_tails_kyuubi_transformation_stance"
                    },
                    "metadata": {
                        "ignoreDamageReduction": true,
                        "cannotBeReflected": true
                    }
                }
            ]
        },
        {
            "id": "four-tails-kyuubi-naruto-skin-of-chakra",
            "name": "Skin of Chakra",
            "skillimage": "https://i.imgur.com/BRrJuMb.png",
            "skilldescription": "This skill makes Four Tails Kyuubi Naruto invulnerable for 1 turn.",
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
                    "statusId": "four_tails_kyuubi_skin_of_chakra_invul",
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
            "id": "four-tails-kyuubi-naruto-enrage",
            "name": "Enrage",
            "skillimage": "https://i.imgur.com/NgRmGUF.png",
            "skilldescription": "Four Tails Kyuubi Naruto takes 10 affliction damage*. For 2 turns, 'Shockwave Smash' will deal 5 additional damage and 'Compressed Chakra Blast' will cost 1 random energy less.",
            "energy": [],
            "target": "self",
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Strategic",
                "Instant",
                "Affliction*"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 10,
                    "scope": "self",
                    "metadata": {
                        "afflictionDamage": true,
                        "ignoreDamageReduction": true,
                        "ignoreDestructibleDefense": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "four_tails_kyuubi_enrage_buff",
                    "duration": 2,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillDamageBonuses": {
                            "four-tails-kyuubi-naruto-shockwave-smash": 5
                        },
                        "skillCostOverridesBySkillId": {
                            "four-tails-kyuubi-naruto-compressed-chakra-blast": {
                                "energy": [
                                    "Random",
                                    "Random"
                                ]
                            }
                        },
                        "tooltipText": "Shockwave Smash deals +5 damage and Compressed Chakra Blast costs 1 less energy."
                    }
                }
            ]
        }
    ]
};
