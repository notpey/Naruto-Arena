(function (root, factory) {
    const character = factory();
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = character;
    } else {
        root.SAKURA_STARTER_CHARACTER = character;
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    return {
        "id": "haruno-sakura",
        "characterId": "haruno-sakura",
        "name": "Haruno Sakura",
        "facePicture": "https://i.imgur.com/q2K5CEj.png",
        "characterdeescription": "A Genin from Team 7, Sakura is very intelligent, but self-conscious about herself. Having just recently received training from Tsunade, Sakura is now able to deliver powerful punches and heal her own allies.",
        "skills": [
                {
                        "id": "haruno-sakura-ko-punch",
                        "name": "KO Punch",
                        "skillimage": "https://i.imgur.com/CoiXCFk.png",
                        "skilldescription": "Haruno Sakura deals 20 damage to one enemy and stuns their physical and strategic skills for 1 turn.",
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
                                },
                                {
                                        "type": "apply_status",
                                        "statusId": "haruno_sakura_ko_punch_stun",
                                        "duration": 1,
                                        "scope": "target",
                                        "metadata": {
                                                "harmful": true,
                                                "cannotUseSkillClasses": [
                                                        "physical",
                                                        "strategic"
                                                ],
                                                "tooltipText": "This character's physical and strategic skills are stunned."
                                        }
                                }
                        ]
                },
                {
                        "id": "haruno-sakura-cure",
                        "name": "Cure",
                        "skillimage": "https://i.imgur.com/SHNkcVv.png",
                        "skilldescription": "Haruno Sakura heals herself or an ally for 25 health.",
                        "energy": [
                                "Ninjutsu"
                        ],
                        "target": "self-or-single-ally",
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
                                }
                        ]
                },
                {
                        "id": "haruno-sakura-inner-sakura",
                        "name": "Inner Sakura",
                        "skillimage": "https://i.imgur.com/srHzKvO.png",
                "skilldescription": "Haruno Sakura gains 5 points of damage reduction permanently. This skill is replaced by 'Inner Sakura Strangle'.",
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
                                        "statusId": "haruno_sakura_inner_sakura_active",
                                        "duration": 99,
                                        "scope": "self",
                                        "metadata": {
                                                "damageReductionFlat": 5,
                            "skillReplacements": {
                                "haruno-sakura-inner-sakura": "haruno-sakura-inner-sakura-strangle"
                            },
                            "tooltipText": "Sakura has 5 damage reduction\nInner Sakura is replaced by Inner Sakura Strangle."
                                        }
                                }
                        ]
                },
                {
                        "id": "haruno-sakura-sakura-hide",
                        "name": "Sakura Hide",
                        "skillimage": "https://i.imgur.com/IYpA8yI.png",
                        "skilldescription": "This skill makes Haruno Sakura invulnerable for 1 turn.",
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
                        "id": "haruno-sakura-inner-sakura-strangle",
                        "name": "Inner Sakura Strangle",
                        "hiddenFromSelectionViewer": true,
                        "skillimage": "https://i.imgur.com/srHzKvO.png",
                        "skilldescription": "Haruno Sakura targets one enemy or one ally. An ally receives 5 damage and deals an additional 5 damage permanently. An enemy receives 20 damage and deals 10 less damage with their next damaging skill.",
                        "energy": [
                                "Genjutsu"
                        ],
                        "target": "single-character",
                        "damage": 0,
                        "cooldown": 1,
                        "classes": [
                                "Mental",
                                "Instant"
                        ],
                        "effects": [
                                {
                                        "type": "HealthLoss",
                                        "amount": 5,
                                        "scope": "target",
                                        "condition": {
                                                "scope": "target",
                                                "targetRelation": "ally"
                                        }
                                },
                                {
                                        "type": "apply_status",
                                        "statusId": "haruno_sakura_inner_sakura_strangle_ally_power",
                                        "duration": 99,
                                        "scope": "target",
                                        "metadata": {
                                                "damageBonusFlat": 5,
                                                "tooltipText": "This character deals 5 additional damage."
                                        },
                                        "condition": {
                                                "scope": "target",
                                                "targetRelation": "ally"
                                        }
                                },
                                {
                                        "type": "damage",
                                        "amount": 20,
                                        "scope": "target",
                                        "condition": {
                                                "scope": "target",
                                                "targetRelation": "enemy"
                                        }
                                },
                                {
                                        "type": "apply_status",
                                        "statusId": "haruno_sakura_inner_sakura_strangle_enemy_weakness",
                                        "duration": 1,
                                        "scope": "target",
                                        "metadata": {
                                                "harmful": true,
                                                "damageDebuffFlat": 10,
                                                "tooltipText": "This character's next damaging skill deals 10 less damage."
                                        },
                                        "condition": {
                                                "scope": "target",
                                                "targetRelation": "enemy"
                                        }
                                }
                        ]
                }
        ]
};
});
