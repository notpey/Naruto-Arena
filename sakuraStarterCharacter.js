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
                "skilldescription": "Haruno Sakura deals 20 damage to one enemy and stuns their physical and strategic skills for 1 turn. During 'Inner Sakura', 'KO Punch' deals 10 additional damage.",
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
                            "tooltipText": "This character physical and strategic skills are stunned."
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
                "skilldescription": "For 4 turns, Haruno Sakura will gain 10 points of damage reduction and will ignore all enemy stun effects. During this time 'KO Punch' will deal 10 additional damage.",
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
                        "statusId": "haruno_sakura_inner_sakura_active",
                        "duration": 4,
                        "scope": "self",
                        "metadata": {
                            "damageReductionFlat": 10,
                            "cannotBeStunned": true,
                            "skillDamageBonuses": {
                                "haruno-sakura-ko-punch": 10
                            },
                            "tooltipText": "Sakura has 10 damage reduction, ignores stuns, and KO Punch deals 10 additional damage."
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
            }
        ]
    };
});
