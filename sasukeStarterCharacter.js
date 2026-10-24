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
    "characterdeescription": "A gifted young shinobi and one of the few survivors of the Uchiha clan, Sasuke Uchiha trains relentlessly to gain the strength needed to avenge his family. Already skilled in his clan's signature Fire Release techniques, Sasuke joins Team 7, where his encounters with dangerous enemies begin to awaken the power of his Sharingan.",
    "passive": {
        "name": "Uchiha Prodigy",
        "icon": "https://i.imgur.com/3mHd0j3.png",
        "description": "Sasuke's Physical skills deal 5 additional damage to enemies affected by his Fireball Jutsu.",
        "physicalDamageBonusAgainstTargetStatus": {
            "statusId": "uchiha_sasuke_great_fireball_burn",
            "amount": 5
        }
    },
    "skills": [
        {
            "id": "uchiha-sasuke-shadow-shuriken-technique",
            "name": "Shadow Shuriken Technique",
            "skillimage": "https://i.imgur.com/ynDNiUT.png",
            "skilldescription": "Sasuke throws shuriken at one enemy, dealing 20 physical damage. If that enemy is affected by his Fireball Jutsu, this skill also stuns their Physical skills for 1 turn and ends Fireball Jutsu's remaining effect.",
            "energy": [
                "Ninjutsu"
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
                    "statusId": "uchiha_sasuke_shadow_shuriken_stun",
                    "duration": 1,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "statusId": "uchiha_sasuke_great_fireball_burn",
                        "statusFromActor": true
                    },
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkillClasses": [
                            "physical"
                        ],
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character's Physical skills are stunned."
                    }
                },
                {
                    "type": "remove_status",
                    "statusId": "uchiha_sasuke_great_fireball_burn",
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "statusId": "uchiha_sasuke_great_fireball_burn",
                        "statusFromActor": true
                    }
                }
            ]
        },
        {
            "id": "uchiha-sasuke-great-fireball-jutsu",
            "name": "Fire Style: Great Fireball Jutsu",
            "skillimage": "https://i.imgur.com/60VDgWY.png",
            "skilldescription": "Sasuke unleashes a massive fireball at one enemy, dealing 20 chakra damage and 5 affliction damage* for 3 turns.",
            "energy": [
                "Bloodline"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Chakra",
                "Instant",
                "Affliction*"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 20,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "uchiha_sasuke_great_fireball_burn",
                    "duration": 3,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 5,
                        "turnEndTrigger": "source_turn",
                        "turnDurationAnchor": "source_turn",
                        "triggerOnApply": true,
                        "afflictionDamage": true,
                        "ignoreDamageReduction": true,
                        "ignoreDestructibleDefense": true,
                        "tooltipText": "This character takes 5 affliction damage from Fire Style: Great Fireball Jutsu for 3 turns."
                    }
                }
            ]
        },
        {
            "id": "uchiha-sasuke-sharingan",
            "name": "Sharingan",
            "skillimage": "https://i.imgur.com/IkTLWta.png",
            "skilldescription": "Sasuke activates his Sharingan, gaining 10 damage reduction for 3 turns and countering the first harmful Physical skill used against him during this time. Sharingan ends after successfully countering a skill.",
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
                    "statusId": "uchiha_sasuke_sharingan",
                    "duration": 3,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "damageReductionFlat": 10,
                        "triggerOnEnemyHarmfulSkillClassesAny": [
                            "physical"
                        ],
                        "counterCancelsSkill": true,
                        "tooltipText": "Sasuke has 10 damage reduction. The first harmful Physical skill used against him is countered, ending Sharingan."
                    }
                }
            ]
        },
        {
            "id": "uchiha-sasuke-stealth",
            "name": "Stealth",
            "skillimage": "https://i.imgur.com/dC3c6Vs.png",
            "skilldescription": "This skill makes Sasuke Uchiha invulnerable for 1 turn.",
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
                        "helpful": true,
                        "invulnerable": true,
                        "tooltipText": "This character is invulnerable."
                    }
                }
            ]
        }
    ]
};
});
