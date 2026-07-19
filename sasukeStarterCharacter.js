(function (root, factory) {
    const character = factory();
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = character;
    } else {
        root.SASUKE_STARTER_CHARACTER = character;
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    return {
        "id": "uchiha-sasuke",
        "characterId": "uchiha-sasuke",
        "name": "Uchiha Sasuke",
        "facePicture": "https://i.imgur.com/bwuEwsM.png",
        "characterdeescription": "A Genin from Team 7, Sasuke is the lone survivor of the Uchiha clan and has sworn vengeance against his brother. Using his sharingan, Sasuke is able to anticipate incoming attacks and is capable of advanced offensive moves.",
        "skills": [
                {
                        "id": "uchiha-sasuke-lion-combo",
                        "name": "Lion Combo",
                        "skillimage": "https://i.imgur.com/z0L2daw.png",
                        "skilldescription": "Uchiha Sasuke deals 25 damage to one enemy.",
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
                                        "amount": 25,
                                        "scope": "target"
                                }
                        ]
                },
                {
                        "id": "uchiha-sasuke-chidori",
                        "name": "Chidori",
                        "skillimage": "https://i.imgur.com/rJ3WZmI.png",
                        "skilldescription": "Uchiha Sasuke deals 35 piercing damage to one enemy. For 1 turn, 'Lion Combo' and 'Grand Fireball Technique' will cost 1 random chakra.",
                        "energy": [
                                "Ninjutsu",
                                "Random"
                        ],
                        "target": "single-enemy",
                        "damage": 0,
                        "cooldown": 1,
                        "classes": [
                                "Energy",
                                "Instant"
                        ],
                        "effects": [
                                {
                                        "type": "damage",
                                        "amount": 35,
                                        "scope": "target",
                                        "metadata": {
                                                "ignoreDamageReduction": true
                                        }
                                },
                                {
                                        "type": "apply_status",
                                        "statusId": "uchiha_sasuke_chidori_cost_shift",
                                        "duration": 1,
                                        "scope": "self",
                                        "metadata": {
                                                "skillCostOverridesBySkillId": {
                                                        "uchiha-sasuke-lion-combo": {
                                                                "energy": [
                                                                        "Random"
                                                                ]
                                                        },
                                                        "uchiha-sasuke-grand-fireball-technique": {
                                                                "energy": [
                                                                        "Random"
                                                                ]
                                                        }
                                                },
                                                "tooltipText": "Lion Combo and Grand Fireball Technique cost 1 random chakra."
                                        }
                                }
                        ]
                },
                {
                        "id": "uchiha-sasuke-sharingan",
                        "name": "Sharingan",
                        "skillimage": "https://i.imgur.com/IkTLWta.png",
                        "skilldescription": "Uchiha Sasuke gains 10 damage reduction permanently. If he uses a skill on an enemy he used a skill on the previous turn, it deals 5 additional damage. This skill is replaced by 'Grand Fireball Technique'.",
                        "energy": [],
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
                                        "statusId": "uchiha_sasuke_sharingan_focus",
                                        "duration": 99,
                                        "scope": "self",
                                        "metadata": {
                                                "damageReductionFlat": 10,
                                                "samePreviousTargetDamageBonusFlat": 5,
                                                "samePreviousTargetMarkerStatusId": "uchiha_sasuke_sharingan_previous_target",
                                                "samePreviousTargetMarkerTooltipText": "Sasuke will deal 5 additional damage to this character if he targets them again.",
                                                "skillReplacements": {
                                                        "uchiha-sasuke-sharingan": "uchiha-sasuke-grand-fireball-technique"
                                                },
                                                "tooltipText": "Sasuke has 10 damage reduction\nSasuke deals 5 additional damage to any enemy he targeted last turn\nSharingan is replaced by Grand Fireball Jutsu."
                                        }
                                }
                        ]
                },
                {
                        "id": "uchiha-sasuke-swift-block",
                        "name": "Swift Block",
                        "skillimage": "https://i.imgur.com/dit1Ltq.png",
                        "skilldescription": "This skill makes Uchiha Sasuke invulnerable for 1 turn.",
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
                },
                {
                        "id": "uchiha-sasuke-grand-fireball-technique",
                        "name": "Grand Fireball Technique",
                        "hiddenFromSelectionViewer": true,
                        "skillimage": "https://i.imgur.com/IkTLWta.png",
                        "skilldescription": "Uchiha Sasuke deals 5 affliction damage to all enemies this turn and 5 affliction damage to them the following turn.",
                        "energy": [
                                "Ninjutsu"
                        ],
                        "target": "all-enemy",
                        "damage": 0,
                        "cooldown": 1,
                        "classes": [
                                "Affliction",
                                "Instant"
                        ],
                        "effects": [
                                {
                                        "type": "apply_status",
                                        "statusId": "uchiha_sasuke_grand_fireball_burn",
                                        "duration": 2,
                                        "scope": "all-enemy",
                                        "metadata": {
                                                "harmful": true,
                                                "turnEndDamage": 5,
                                                "turnEndTrigger": "source_turn",
                                                "turnDurationAnchor": "source_turn",
                                                "triggerOnApply": true,
                                                "afflictionDamage": true,
                                                "ignoreDamageReduction": true,
                                                "ignoreDestructibleDefense": true,
                                                "tooltipText": "This character takes 5 affliction damage from Grand Fireball Technique."
                                        }
                                }
                        ]
                }
        ]
};
});
