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
                "skilldescription": "Uchiha Sasuke deals 35 damage to one enemy. This skill will deal 10 additional damage to an enemy affected by 'Sharingan'.",
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
                        "amount": 35,
                        "scope": "target"
                    },
                    {
                        "type": "damage",
                        "amount": 10,
                        "scope": "target",
                        "condition": {
                            "statusId": "uchiha_sasuke_sharingan_target",
                            "scope": "target"
                        }
                    }
                ]
            },
            {
                "id": "uchiha-sasuke-chidori",
                "name": "Chidori",
                "skillimage": "https://i.imgur.com/rJ3WZmI.png",
                "skilldescription": "Uchiha Sasuke deals 35 piercing damage to one enemy. This skill will deal 25 additional damage to an enemy affected by 'Sharingan'.",
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
                        "type": "damage",
                        "amount": 25,
                        "scope": "target",
                        "condition": {
                            "statusId": "uchiha_sasuke_sharingan_target",
                            "scope": "target"
                        },
                        "metadata": {
                            "ignoreDamageReduction": true
                        }
                    }
                ]
            },
            {
                "id": "uchiha-sasuke-sharingan",
                "name": "Sharingan",
                "skillimage": "https://i.imgur.com/IkTLWta.png",
                "skilldescription": "Uchiha Sasuke targets one enemy. For 3 turns, Uchiha Sasuke will gain 10 points of damage reduction. During this time, that enemy will be unable to reduce damage or become invulnerable. This skill will end if Uchiha Sasuke dies.",
                "energy": [
                    "Random"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 4,
                "classes": [
                    "Strategic",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "apply_status",
                        "statusId": "uchiha_sasuke_sharingan_target",
                        "duration": 3,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotReduceDamage": true,
                            "cannotBecomeInvulnerable": true,
                            "ongoingClass": "action",
                            "tooltipText": "This character is affected by Sharingan and cannot reduce damage or become invulnerable."
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "uchiha_sasuke_sharingan_focus",
                        "duration": 3,
                        "scope": "self",
                        "metadata": {
                            "damageReductionFlat": 10,
                            "tooltipText": "Sasuke has 10 damage reduction while Sharingan is active."
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
            }
        ]
    };
});
