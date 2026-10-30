module.exports = {
    "id": "inuzuka-kiba-s",
    "characterId": "inuzuka-kiba-s",
    "name": "Inuzuka Kiba (S)",
    "facePicture": "https://i.imgur.com/O9pHpzM.png",
    "characterdeescription": "Over the last several years. Kiba, and his dog, Akamaru have grown considerably, not wanting to be left last in their group. Having improved their team work, and provided they are given enough time, Kiba and Akamaru can become unstoppable rampaging beasts.",
    "requiredMissionId": "a-boy-and-his-dog",
    "skills": [
        {
            "id": "inuzuka-kiba-s-three-headed-wolf",
            "name": "Three-Headed Wolf",
            "skillimage": "https://i.imgur.com/TkewjMk.png",
            "skilldescription": "Inuzuka Kiba (S) gains 30 points of damage reduction and ignores enemy stun effects and energy drain or removal effects for 3 turns. The following 3 turns, this skill will be replaced by 'Tail Chasing Rotating Fang'.",
            "energy": [
                "Bloodline",
                "Bloodline"
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
                    "type": "apply_status",
                    "statusId": "inuzuka_kiba_s_three_headed_wolf_active",
                    "duration": 3,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "damageReductionFlat": 30,
                        "immuneToStun": true,
                        "immuneToEnergyDrain": true,
                        "skillReplacements": {
                            "inuzuka-kiba-s-three-headed-wolf": "inuzuka-kiba-s-tail-chasing-rotating-fang"
                        },
                        "tooltipText": "Kiba has 30 damage reduction, ignores enemy stuns and energy drain/removal, and has transformed."
                    }
                }
            ]
        },
        {
            "id": "inuzuka-kiba-s-rotating-fang",
            "name": "Rotating Fang",
            "skillimage": "https://i.imgur.com/WNui7wo.png",
            "skilldescription": "Inuzuka Kiba (S) deals 30 damage to one enemy and 20 damage to another random enemy. During 'Three-Headed Wolf', this skill will instead deal 20 damage to all other enemies.",
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
                    "type": "damage",
                    "amount": 20,
                    "scope": "random-other-enemy",
                    "condition": {
                        "scope": "self",
                        "missingStatusId": "inuzuka_kiba_s_three_headed_wolf_active"
                    }
                },
                {
                    "type": "damage",
                    "amount": 20,
                    "scope": "other-enemy",
                    "condition": {
                        "scope": "self",
                        "hasStatusId": "inuzuka_kiba_s_three_headed_wolf_active"
                    }
                }
            ]
        },
        {
            "id": "inuzuka-kiba-s-fang-over-fang",
            "name": "Fang Over Fang",
            "skillimage": "https://i.imgur.com/gpMpjn1.png",
            "skilldescription": "Inuzuka Kiba (S) deals 35 damage and 10 affliction damage* to one enemy and then reduces their non-affliction damage by 10 permanently. During 'Three-Headed Wolf', this skill will deal 5 additional damage.",
            "energy": [
                "Taijutsu",
                "Bloodline"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Physical",
                "Instant",
                "Affliction*"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 35,
                    "scope": "target"
                },
                {
                    "type": "damage",
                    "amount": 5,
                    "scope": "target",
                    "condition": {
                        "scope": "self",
                        "hasStatusId": "inuzuka_kiba_s_three_headed_wolf_active"
                    }
                },
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
                    "statusId": "inuzuka_kiba_s_fang_over_fang_weaken",
                    "duration": 99,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "damageDealtFlatModifier": -10,
                        "tooltipText": "This character deals 10 less non-affliction damage permanently."
                    }
                }
            ]
        },
        {
            "id": "inuzuka-kiba-s-hide-in-the-shade",
            "name": "Hide in the Shade",
            "skillimage": "https://i.imgur.com/2NGDdwF.png",
            "skilldescription": "Inuzuka Kiba (S) becomes invulnerable for 1 turn.",
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
                    "statusId": "inuzuka_kiba_s_hide_in_the_shade_invul",
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
            "id": "inuzuka-kiba-s-tail-chasing-rotating-fang",
            "name": "Tail Chasing Rotating Fang",
            "skillimage": "https://i.imgur.com/Rvw0gam.png",
            "skilldescription": "Inuzuka Kiba (S) deals 40 damage to all enemies and stuns them for 1 turn.",
            "energy": [
                "Taijutsu",
                "Bloodline",
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
                    "type": "damage",
                    "amount": 40,
                    "scope": "all-enemy"
                },
                {
                    "type": "apply_status",
                    "statusId": "inuzuka_kiba_s_tail_chasing_stun",
                    "duration": 1,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "stun": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character is stunned for 1 turn."
                    }
                }
            ]
        }
    ]
};
