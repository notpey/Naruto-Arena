module.exports = {
    "id": "akimichi-chouji",
    "characterId": "akimichi-chouji",
    "name": "Akimichi Chouji",
    "facePicture": "https://i.imgur.com/QicD98O.png",
    "characterdeescription": "A Genin from Team 10, Chouji is a member of the Akimichi clan, a large eater, and a close friend to his allies. While innately strong, Chouji is able to sacrifice his own life using special pills from his clan to become insanely powerful.",
    "skills": [
        {
            "id": "akimichi-chouji-partial-double-size",
            "name": "Partial Double Size",
            "skillimage": "https://i.imgur.com/7iQlK0v.png",
            "skilldescription": "Akimichi Chouji deals 20 damage to one enemy.",
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
                    "scope": "target"
                }
            ]
        },
        {
            "id": "akimichi-chouji-meat-tank",
            "name": "Meat Tank",
            "skillimage": "https://i.imgur.com/Iwup0It.png",
            "skilldescription": "Akimichi Chouji deals 10 damage to one enemy for 2 turns, becomes invulnerable for 2 turns, and ignores all healing effects while active.",
            "energy": [
                "Bloodline"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Physical",
                "Action",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "akimichi_chouji_meat_tank_damage",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 10,
                        "turnEndTrigger": "source_turn",
                        "turnDurationAnchor": "source_turn",
                        "ongoingClass": "action",
                        "triggerOnApply": true,
                        "tooltipText": "This character takes 10 damage from Meat Tank."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "akimichi_chouji_meat_tank_invulnerable",
                    "duration": 2,
                    "scope": "self",
                    "metadata": {
                        "invulnerable": true,
                        "tooltipText": "Chouji is invulnerable and ignores healing effects.",
                        "healReceivedMultiplier": 0
                    }
                }
            ]
        },
        {
            "id": "akimichi-chouji-akimichi-pills",
            "name": "Akimichi Pills",
            "maxUses": 3,
            "skillimage": "https://i.imgur.com/xva0CTn.png",
            "skilldescription": "For the rest of the game, 'Partial Double Size' will deal 20 additional damage and 'Meat Tank' will deal 10 additional damage. Akimichi Chouji takes 20 damage. This skill can only be used three times.",
            "energy": [
                "Random"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Strategic",
                "Instant",
                "Affliction"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "akimichi_chouji_akimichi_pills",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "mergeSkillDamageBonuses": true,
                        "skillDamageBonuses": {
                            "akimichi-chouji-partial-double-size": 20,
                            "akimichi-chouji-meat-tank": 10
                        },
                        "tooltipText": "Partial Double Size deals 20 additional damage.\nMeat Tank deals 10 additional damage."
                    }
                },
                {
                    "type": "HealthLoss",
                    "amount": 20,
                    "scope": "self"
                }
            ]
        },
        {
            "id": "akimichi-chouji-effortless-block",
            "name": "Effortless Block",
            "skillimage": "https://i.imgur.com/9ZNpEEN.png",
            "skilldescription": "This skill makes Akimichi Chouji invulnerable for 1 turn.",
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
