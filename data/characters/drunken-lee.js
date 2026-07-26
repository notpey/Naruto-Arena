module.exports = {
    "id": "drunken-lee",
    "characterId": "drunken-lee",
    "name": "Drunken Lee",
    "facePicture": "https://i.imgur.com/gLFtzf2.png",
    "characterdeescription": "Having accidentally drank sake, Lee's hidden Drunken Fist powers have awakened, completely changing his fighting style. While drunk, Lee attacks randomly, but is harder to stop the more he keeps fighting.",
    "requiredMissionId": "the-drunken-master",
    "skills": [
        {
            "id": "drunken-lee-unpredictable-assault",
            "name": "Unpredictable Assault",
            "skillimage": "https://i.imgur.com/IWFEmKO.png",
            "skilldescription": "Drunken Lee deals 20 damage to a random enemy. This skill cannot be countered. Each time this skill is used, it will deal 5 additional damage.",
            "energy": [
                "Taijutsu"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 0,
            "cannotBeCountered": true,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 20,
                    "scope": "random-enemy"
                },
                {
                    "type": "apply_status",
                    "statusId": "drunken_lee_unpredictable_assault_stacks",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillDamageBonuses": {
                            "drunken-lee-unpredictable-assault": 5
                        },
                        "mergeObjectNumericAddKeys": [
                            "skillDamageBonuses"
                        ],
                        "tooltipText": "Unpredictable Assault deals 5 additional damage. This effect stacks each time Unpredictable Assault is used."
                    }
                }
            ]
        },
        {
            "id": "drunken-lee-drunken-counter",
            "name": "Drunken Counter",
            "skillimage": "https://i.imgur.com/UTArdyQ.png",
            "skilldescription": "Drunken Lee targets himself or an ally. For 1 turn, the first harmful non-strategic skill used on the target will be countered for 20 damage. This skill is invisible.",
            "energy": [
                "Random"
            ],
            "target": "self-or-single-ally",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "drunken_lee_drunken_counter",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "helpful": true,
                        "hideTooltipFromEnemy": true,
                        "triggerOnEnemyHarmfulNonStrategic": true,
                        "counterCancelsSkill": true,
                        "counterDamage": 20,
                        "tooltipText": "The first non-strategic skill used on this character will be countered and the attacker will take 20 damage."
                    }
                }
            ]
        },
        {
            "id": "drunken-lee-drunken-fist",
            "name": "Drunken Fist",
            "skillimage": "https://i.imgur.com/sJakDhe.png",
            "skilldescription": "Drunken Lee deals 15 damage to one enemy for 3 turns. The following 3 turns, Drunken Lee will ignore all enemy stun effects, and 'Unpredictable Assault' will deal 5 additional damage.",
            "energy": [
                "Random",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Strategic",
                "Action"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "drunken_lee_drunken_fist_dot",
                    "duration": 3,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 15,
                        "turnEndTrigger": "source_turn",
                        "tooltipText": "This character takes 15 damage each turn from Drunken Fist.",
                        "ongoingClass": "action"
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "drunken_lee_drunken_fist_self",
                    "duration": 3,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "stunImmune": true,
                        "skillDamageBonuses": {
                            "drunken-lee-unpredictable-assault": 5
                        },
                        "tooltipText": "This character ignores enemy stun effects. Unpredictable Assault deals 5 additional damage.",
                        "ongoingClass": "action"
                    }
                }
            ]
        },
        {
            "id": "drunken-lee-drunken-leap",
            "name": "Drunken Leap",
            "skillimage": "https://i.imgur.com/rXB5r9a.png",
            "skilldescription": "This skill makes Drunken Lee invulnerable for 1 turn.",
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
                    "statusId": "drunken_lee_drunken_leap",
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
