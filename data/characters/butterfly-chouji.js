module.exports = {
    "id": "butterfly-chouji",
    "characterId": "butterfly-chouji",
    "name": "Butterfly Chouji",
    "facePicture": "https://i.imgur.com/UoRyA7v.png",
    "characterdeescription": "Chouji has evolved into butterfly mode by consuming all three akimichi's coloured pills, gaining incredible speed and strenght at the cost of rapid weight loss. ORIGINAL DESIGN: AnteMito",
    "requiredMissionId": "chouji-awakens",
    "skills": [
        {
            "id": "butterfly-chouji-chakra-wings",
            "name": "Chakra Wings",
            "skillimage": "https://i.imgur.com/4J4U6wU.png",
            "skilldescription": "Butterfly Chouji gains 10 points of damage reduction and 10 points of destructible defense. He will take 5 affliction damage each turn. Butterfly Chouji can use his other skills while this is active. Butterfly Chouji's skills will deal 5 additional damage every turn with a max of 10 stacks. This skill may be used once and is permanent. This skill cannot be removed.",
            "energy": [],
            "target": "self",
            "damage": 0,
            "cooldown": 0,
            "actorCondition": {
                "missingStatusId": "butterfly_chouji_chakra_wings_active"
            },
            "classes": [
                "Strategic",
                "Instant",
                "Affliction"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "butterfly_chouji_chakra_wings_active",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "cannotBeCleansed": true,
                        "damageReductionFlat": 10,
                        "destructibleDefensePoints": 10,
                        "afflictionDamage": true,
                        "turnEndDamage": 5,
                        "turnEndTrigger": "source_turn",
                        "damageBonusFlat": 5,
                        "growPerTurn": [
                            {
                                "key": "damageBonusFlat",
                                "amount": 5,
                                "max": 50
                            }
                        ],
                        "tooltipText": "Butterfly Chouji has 10 points of damage reduction and 10 points of destructible defense.\nButterfly Chouji takes 5 affliction damage each turn.\nButterfly Chouji's skills deal 5 additional damage, increasing by 5 each turn up to 50 additional damage."
                    }
                }
            ]
        },
        {
            "id": "butterfly-chouji-butterfly-bullet-bombing",
            "name": "Butterfly Bullet Bombing",
            "skillimage": "https://i.imgur.com/Icq6uAf.png",
            "skilldescription": "Butterfly Chouji targets one enemy, destroying all destructible defense that target has and then dealing 20 damage to them. This skill cannot be countered and can only be used during 'Chakra Wings'.",
            "energy": [
                "Taijutsu",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "cannotBeCountered": true,
            "actorCondition": {
                "statusId": "butterfly_chouji_chakra_wings_active"
            },
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "destroy_destructible_defense",
                    "scope": "target"
                },
                {
                    "type": "damage",
                    "amount": 20,
                    "scope": "target"
                }
            ]
        },
        {
            "id": "butterfly-chouji-enemy-immobilization",
            "name": "Enemy Immobilization",
            "skillimage": "https://i.imgur.com/yGZ8NW9.png",
            "skilldescription": "Butterfly Chouji deals 5 damage to one enemy. For 1 turn, that enemy's skills will be stunned and Butterfly Chouji will ignore enemy stun effects. This skill may only be used during 'Chakra Wings'.",
            "energy": [
                "Taijutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "actorCondition": {
                "statusId": "butterfly_chouji_chakra_wings_active"
            },
            "classes": [
                "Physical",
                "Instant",
                "Control"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 5,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "butterfly_chouji_enemy_immobilization_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkills": true,
                        "tooltipText": "This character is stunned.",
                        "ongoingClass": "control",
                        "turnDurationAnchor": "source_turn"
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "butterfly_chouji_enemy_immobilization_self",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "stunImmune": true,
                        "tooltipText": "This character ignores stun effects.",
                        "ongoingClass": "control"
                    }
                }
            ]
        },
        {
            "id": "butterfly-chouji-effortless-block",
            "name": "Effortless Block",
            "skillimage": "https://i.imgur.com/csCBOSU.png",
            "skilldescription": "This skill makes Butterfly Chouji invulnerable for 1 turn.",
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
                    "statusId": "butterfly_chouji_effortless_block",
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
