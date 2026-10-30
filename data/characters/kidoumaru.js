module.exports = {
    "id": "kidoumaru",
    "characterId": "kidoumaru",
    "name": "Kidoumaru",
    "facePicture": "https://i.imgur.com/zW32e4B.png",
    "characterdeescription": "A member of the Sound Five, Kidoumaru resembles a spider in both appearance and fighting style. Kidoumaru is able to trap enemies in his web while assaulting them from afar with both spiders and powerful arrows.",
    "requiredMissionId": "the-search-for-kidoumaru",
    "skills": [
        {
            "id": "kidoumaru-spider-bow-fierce-rip",
            "name": "Spider Bow: Fierce Rip",
            "skillimage": "https://i.imgur.com/H6O53Dh.png",
            "skilldescription": "Kidoumaru deals 50 piercing damage to one enemy.",
            "energy": [
                "Bloodline",
                "Ninjutsu"
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
                    "amount": 50,
                    "scope": "target",
                    "metadata": {
                        "ignoreDamageReduction": true
                    }
                }
            ]
        },
        {
            "id": "kidoumaru-summoning-kyodaigumo",
            "name": "Summoning: Kyodaigumo",
            "skillimage": "https://i.imgur.com/bOb3ubG.png",
            "skilldescription": "Kidoumaru deals 10 damage to all enemies for 5 turns. During this time, Kidoumaru will gain 10 points of damage reduction and all enemies who use a new skill will have the cooldown of that skill increased by 1.",
            "energy": [
                "Bloodline",
                "Ninjutsu"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 5,
            "classes": [
                "Physical",
                "Action"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "kidoumaru_kyodaigumo_dot",
                    "duration": 5,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 10,
                        "turnEndTrigger": "source_turn",
                        "ongoingClass": "action",
                        "tooltipText": "This character takes 10 damage each turn from Summoning: Kyodaigumo."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "kidoumaru_kyodaigumo_dr",
                    "duration": 5,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "damageReductionFlat": 10,
                        "usedSkillCooldownPenalty": 1,
                        "tooltipText": "This character has 10 points of damage reduction. All enemies who use a new skill will have the cooldown of that skill increased by 1.",
                        "ongoingClass": "action"
                    }
                }
            ]
        },
        {
            "id": "kidoumaru-spiral-web",
            "name": "Spiral Web",
            "skillimage": "https://i.imgur.com/9q2wtiH.png",
            "skilldescription": "Kidoumaru targets himself or one ally. The following turn, the first non-strategic skill used on the target will be countered. This skill is invisible.",
            "energy": [
                "Bloodline"
            ],
            "target": "self-or-single-ally",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "kidoumaru_spiral_web",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "helpful": true,
                        "hideTooltipFromEnemy": true,
                        "triggerOnEnemyHarmfulNonStrategic": true,
                        "counterCancelsSkill": true,
                        "tooltipText": "The first non-strategic skill used on this character will be countered."
                    }
                }
            ]
        },
        {
            "id": "kidoumaru-golden-armor",
            "name": "Golden Armor",
            "skillimage": "https://i.imgur.com/RdMruyD.png",
            "skilldescription": "Kidoumaru becomes invulnerable for 1 turn.",
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
