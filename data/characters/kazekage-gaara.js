module.exports = {
    "id": "kazekage-gaara",
    "characterId": "kazekage-gaara",
    "name": "Kazekage Gaara",
    "facePicture": "https://i.imgur.com/iX1Omvr.png",
    "characterdeescription": "After a few short years and much soul-searching, Gaara has risen to be his village's Kazekage. Rather than destroying others he now protects those he cares about to prove his existence. ORIGINAL DESIGN: Liann",
    "requiredMissionId": "finding-his-purpose",
    "skills": [
        {
            "id": "kazekage-gaara-desert-missile",
            "name": "Desert Missile",
            "skillimage": "https://i.imgur.com/0gRwpJG.png",
            "skilldescription": "Kazekage Gaara deals 15 piercing damage to one enemy and reduces their non-affliction damage by 10 for 1 turn. This effect lasts 1 additional turn for each Desert Charge Kazekage Gaara has and then removes all Desert Charges on him.",
            "energy": [
                "Bloodline"
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
                    "scope": "target",
                    "metadata": {
                        "ignoreDamageReduction": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kazekage_gaara_desert_missile_weaken",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "damageDealtFlatModifier": -10,
                        "consumeChargeStatusId": "kazekage_gaara_desert_charge",
                        "durationPerChargeBonus": 1,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character deals 10 less non-affliction damage."
                    }
                }
            ]
        },
        {
            "id": "kazekage-gaara-desert-prison",
            "name": "Desert Prison",
            "skillimage": "https://i.imgur.com/7lhw4ni.png",
            "skilldescription": "Kazekage Gaara deals 25 damage to one enemy and stuns them for 1 turn. This skill grants Kazekage Gaara 1 Desert Charge.",
            "energy": [
                "Bloodline",
                "Random"
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
                    "statusId": "kazekage_gaara_desert_prison_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "stun": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character is stunned for 1 turn."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kazekage_gaara_desert_charge",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "stackable": true,
                        "tooltipText": "This character has a Desert Charge. Desert Missile consumes all charges to extend its damage reduction effect by 1 turn per charge."
                    }
                }
            ]
        },
        {
            "id": "kazekage-gaara-sand-summoning",
            "name": "Sand Summoning",
            "skillimage": "https://i.imgur.com/75wCs8N.png",
            "skilldescription": "Kazekage Gaara gains 5 points of permanent damage reduction and 1 Desert Charge. His allies gain 10 points of permanent destructible defense. 'Desert Missile' and 'Desert Prison' will deal 5 additional damage permanently. This skill stacks.",
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
                    "statusId": "kazekage_gaara_sand_summoning_buff",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "stackable": true,
                        "damageReductionFlat": 5,
                        "skillDamageBonuses": {
                            "kazekage-gaara-desert-missile": 5,
                            "kazekage-gaara-desert-prison": 5
                        },
                        "tooltipText": "This character has 5 damage reduction. Desert Missile and Desert Prison each deal 5 additional damage."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kazekage_gaara_desert_charge",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "stackable": true,
                        "tooltipText": "This character has a Desert Charge. Desert Missile consumes all charges to extend its damage reduction effect by 1 turn per charge."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kazekage_gaara_ally_destructible_defense",
                    "duration": 99,
                    "scope": "all-ally",
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePoints": 10,
                        "destructibleDefensePermanent": true,
                        "tooltipTextTemplate": "This character has {destructibleDefensePoints} permanent destructible defense."
                    }
                }
            ]
        },
        {
            "id": "kazekage-gaara-sand-sphere",
            "name": "Sand Sphere",
            "skillimage": "https://i.imgur.com/ISeDMEa.png",
            "skilldescription": "Kazekage Gaara becomes invulnerable for 1 turn.",
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
                    "statusId": "kazekage_gaara_sand_sphere_invul",
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
