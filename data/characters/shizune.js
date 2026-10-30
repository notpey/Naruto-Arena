module.exports = {
    "id": "shizune",
    "characterId": "shizune",
    "name": "Shizune",
    "facePicture": "https://i.imgur.com/V7UX5TB.png",
    "characterdeescription": "The apprentice to Tsunade, and the niece of Dan, Shizune is a calm, practical but loyal ninja of Konoha's medical squad. Shizune is agile and quick, able to attack continually when not using her powerful medical jutsu to heal her allies.",
    "requiredMissionId": "medical-training",
    "skills": [
        {
            "id": "shizune-prepared-needle-shot",
            "name": "Prepared Needle Shot",
            "skillimage": "https://i.imgur.com/eOiK0aq.png",
            "skilldescription": "Shizune deals 15 damage to one enemy and gains a prepared needle for 1 turn. If this enemy is affected by 'Poison Mist', this skill deals 10 additional damage.",
            "energy": [
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
                    "amount": 15,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "missingStatusId": "shizune_poison_mist_dot",
                        "conditionalAmount": 25
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "shizune_prepared_needle",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "bonusDamageFromSourceSkillsFlat": 10,
                        "bonusDamageFromSourceCharacterId": "shizune",
                        "bonusDamageAppliesToSkillIds": [
                            "shizune-poison-mist"
                        ],
                        "tooltipText": "This character will take 10 additional damage from Poison Mist.",
                        "turnDurationAnchor": "source_turn"
                    }
                }
            ]
        },
        {
            "id": "shizune-poison-mist",
            "name": "Poison Mist",
            "skillimage": "https://i.imgur.com/B8hT2h4.png",
            "skilldescription": "Shizune deals 10 affliction damage to one enemy for 3 turns. If this enemy was hit by 'Prepared Needle Shot', the first tick deals 10 additional damage. This skill cannot be used on an enemy already being affected.",
            "energy": [
                "Random"
            ],
            "target": "single-enemy",
            "targetCondition": {
                "missingStatusId": "shizune_poison_mist_dot"
            },
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Affliction",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "shizune_poison_mist_dot",
                    "duration": 3,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "afflictionDamage": true,
                        "turnEndDamage": 10,
                        "turnEndTrigger": "source_turn",
                        "tooltipText": "This character takes 10 affliction damage each turn from Poison Mist."
                    }
                }
            ]
        },
        {
            "id": "shizune-healing-resuscitation-regeneration",
            "name": "Healing Resuscitation Regeneration",
            "skillimage": "https://i.imgur.com/8zcBYFX.png",
            "skilldescription": "Shizune heals one ally for 35 health and removes all harmful affliction skills from them.",
            "energy": [
                "Random",
                "Random"
            ],
            "target": "single-ally",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "heal",
                    "amount": 35,
                    "scope": "target"
                },
                {
                    "type": "cleanse_statuses",
                    "scope": "target",
                    "metadataAny": [
                        "afflictionDamage"
                    ],
                    "harmfulOnly": true,
                    "count": 0
                }
            ]
        },
        {
            "id": "shizune-shizune-dodge",
            "name": "Shizune Dodge",
            "skillimage": "https://i.imgur.com/9fjcyuQ.png",
            "skilldescription": "Shizune becomes invulnerable for 1 turn.",
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
        }
    ]
};
