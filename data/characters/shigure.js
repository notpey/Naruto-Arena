module.exports = {
    "id": "shigure",
    "characterId": "shigure",
    "name": "Shigure",
    "facePicture": "https://i.imgur.com/n72OXiY.png",
    "characterdeescription": "A genin from the village of rain, Shigure is a strong, but arrogant ninja. Using a number of Umbrellas, Shigure is able to attack all enemies with sharp senbon needles, or focus everything to one enemy.",
    "requiredMissionId": "a-rare-opportunity",
    "skills": [
        {
            "id": "shigure-umbrella-toss",
            "name": "Umbrella Toss",
            "skillimage": "https://i.imgur.com/miNRsh2.png",
            "skilldescription": "For 4 turns, Shigure will have 5 points of damage reduction. During this time, his next 'Needle Barrage' will not consume 'Needle Field'. This skill does not stack.",
            "energy": [
                "Random"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "shigure_umbrella_toss_prepared",
                    "duration": 4,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "damageReductionFlat": 5,
                        "replaceSkillDamageBonuses": true,
                        "tooltipText": "Shigure has 5 damage reduction and his next Needle Barrage will not consume Needle Field."
                    }
                }
            ]
        },
        {
            "id": "shigure-needle-barrage",
            "name": "Needle Barrage",
            "skillimage": "https://i.imgur.com/IonrXRg.png",
            "skilldescription": "Shigure deals 25 damage to one enemy affected by 'Needle Field'. This skill deals 10 additional damage to that target and consumes 'Needle Field' unless 'Umbrella Toss' is active.",
            "energy": [
                "Random"
            ],
            "target": "single-enemy",
            "targetCondition": {
                "statusId": "shigure_needle_field"
            },
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
                    "type": "cleanse_statuses",
                    "scope": "target",
                    "statusId": "shigure_needle_field",
                    "condition": {
                        "scope": "self",
                        "missingStatusId": "shigure_umbrella_toss_prepared"
                    }
                },
                {
                    "type": "cleanse_statuses",
                    "scope": "self",
                    "statusId": "shigure_umbrella_toss_prepared"
                }
            ]
        },
        {
            "id": "shigure-sprinkling-needles",
            "name": "Sprinkling Needles",
            "skillimage": "https://i.imgur.com/LOYbNWz.png",
            "skilldescription": "Shigure deals 10 piercing damage to all enemies for 3 turns and applies 'Needle Field' to them. During this time, 'Needle Barrage' can be used on them. This skill cannot be countered.",
            "energy": [
                "Random",
                "Random"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 2,
            "cannotBeCountered": true,
            "classes": [
                "Physical",
                "Action"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "shigure_sprinkling_needles_mark",
                    "duration": 3,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 10,
                        "turnEndTrigger": "source_turn",
                        "ignoreTargetDamageReduction": true,
                        "tooltipText": "This character takes 10 piercing damage each turn from Sprinkling Needles and can be targeted by Needle Barrage.",
                        "ongoingClass": "action"
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "shigure_needle_field",
                    "duration": 3,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "tooltipText": "This character is caught in Needle Field.",
                        "ongoingClass": "action"
                    }
                }
            ]
        },
        {
            "id": "shigure-umbrella-block",
            "name": "Umbrella Block",
            "skillimage": "https://i.imgur.com/D1BTZbK.png",
            "skilldescription": "This skill makes Umbrella invulnerable for 1 turn.",
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
