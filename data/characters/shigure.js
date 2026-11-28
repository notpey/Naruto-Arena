module.exports = {
    "id": "shigure",
    "characterId": "shigure",
    "name": "Shigure",
    "facePicture": "https://i.imgur.com/d9JMGi8.png",
    "characterdeescription": "A genin of the Hidden Rain Village, Shigure specializes in manipulating concealed senbon needles using his chakra. Armed with a collection of deadly umbrellas, he overwhelms his opponents with relentless showers of precisely controlled projectiles.",
    "requiredMissionId": "a-rare-opportunity",
    "passive": {
        "name": "Needle Curtain",
        "icon": "https://i.imgur.com/fudCwzE.png",
        "description": "While Sprinkling Needles is active, any enemy that uses a new harmful skill on Shigure or his allies will receive 5 damage."
    },
    "skills": [
        {
            "id": "shigure-umbrella-toss",
            "name": "Umbrella Toss",
            "skillimage": "https://i.imgur.com/McFmuU5.png",
            "skilldescription": "Shigure launches his umbrella into the air, increasing the damage of his skills by 5 for 3 turns.",
            "energy": [
                "Random"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "shigure_umbrella_toss_active",
                    "duration": 3,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "damageBonusFlat": 5,
                        "tooltipText": "Shigure deals 5 additional damage with his skills."
                    }
                }
            ]
        },
        {
            "id": "shigure-sprinkling-needles",
            "name": "Sprinkling Needles",
            "skillimage": "https://i.imgur.com/EXAXp4s.png",
            "skilldescription": "Shigure deals 10 physical damage to all enemies each turn for 3 turns. Needle Barrage can be used during this time. This skill cannot be countered or reflected.",
            "energy": [
                "Random",
                "Random"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 2,
            "cannotBeCountered": true,
            "cannotBeReflected": true,
            "ignoreDamageReflection": true,
            "classes": [
                "Physical",
                "Action"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "shigure_sprinkling_needles",
                    "duration": 3,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "ongoingClass": "action",
                        "turnEndDamage": 10,
                        "turnEndTrigger": "source_turn",
                        "turnEndSkillClasses": [
                            "Physical"
                        ],
                        "tooltipText": "This character takes 10 physical damage each turn from Sprinkling Needles and can be targeted by Needle Barrage."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "shigure_needle_curtain",
                    "duration": 3,
                    "scope": "all-allies",
                    "metadata": {
                        "helpful": true,
                        "ongoingClass": "action",
                        "removeOnSourceDeath": true,
                        "onEnemySkillTargetedHarmfulOnly": true,
                        "onEnemySkillTargetedUseStatusSource": true,
                        "onEnemySkillTargetedOncePerCastGroup": "shigure_needle_curtain",
                        "onEnemySkillTargetedDamageToSourceAmount": 5,
                        "onEnemySkillTargetedDamageToSourceSkillClasses": [
                            "Physical"
                        ],
                        "tooltipText": "Enemies who use a harmful skill on this team take 5 physical damage while Sprinkling Needles is active."
                    }
                }
            ]
        },
        {
            "id": "shigure-needle-barrage",
            "name": "Needle Barrage",
            "skillimage": "https://i.imgur.com/umfSMC4.png",
            "skilldescription": "Shigure deals 20 physical damage to one enemy affected by Sprinkling Needles.",
            "energy": [
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "targetCondition": {
                "statusId": "shigure_sprinkling_needles"
            },
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
            "id": "shigure-umbrella-block",
            "name": "Umbrella Block",
            "skillimage": "https://i.imgur.com/RusWUiG.png",
            "skilldescription": "Shigure becomes invulnerable for 1 turn.",
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
                    "statusId": "shigure_umbrella_block",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "invulnerable": true,
                        "tooltipText": "Shigure is invulnerable."
                    }
                }
            ]
        }
    ]
};
