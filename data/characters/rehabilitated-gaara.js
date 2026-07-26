module.exports = {
    "id": "rehabilitated-gaara",
    "characterId": "rehabilitated-gaara",
    "name": "Rehabilitated Gaara",
    "facePicture": "https://i.imgur.com/bF8DLyH.png",
    "characterdeescription": "After his fateful encounter with Naruto, Gaara has left behind his murderous ways, and has instead rehabilitated. Gaara has honed his abilities to shape and craft his sand, allowing him to create giant waves of sand or quicksand traps.",
    "requiredMissionId": "the-redemption-of-gaara",
    "skills": [
        {
            "id": "rehabilitated-gaara-sand-mastery",
            "name": "Sand Mastery",
            "skillimage": "https://i.imgur.com/q60UfkP.png",
            "skilldescription": "Rehabilitated Gaara deals 15 damage to one enemy for 3 turns and gains 35 points of permanent destructible defense. This skill does not stack and will re-apply itself.",
            "energy": [
                "Random",
                "Random"
            ],
            "target": "single-enemy",
            "actorCondition": {
                "missingStatusId": "rehabilitated_gaara_sand_mastery_defense"
            },
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Physical",
                "Action"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "rehabilitated_gaara_sand_mastery_dot",
                    "duration": 3,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 15,
                        "turnEndTrigger": "source_turn",
                        "turnDurationAnchor": "source_turn",
                        "ongoingClass": "action",
                        "triggerOnApply": true,
                        "tooltipText": "This character takes 15 damage from Sand Mastery."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "rehabilitated_gaara_sand_mastery_defense",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePoints": 35,
                        "tooltipText": "Rehabilitated Gaara has 35 points of permanent destructible defense from Sand Mastery.",
                        "ongoingClass": "action"
                    }
                }
            ]
        },
        {
            "id": "rehabilitated-gaara-prison-sand-burial",
            "name": "Prison Sand Burial",
            "skillimage": "https://i.imgur.com/WoNpe2N.png",
            "skilldescription": "For 1 turn, all enemies' non-strategic skills will have their costs increased by 1 random energy. Afterwards, this skill will be replaced by 'Desert Imperial Funeral' for 1 turn.",
            "energy": [
                "Random"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "rehabilitated_gaara_prison_sand_burial",
                    "duration": 1,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "randomCostIncreaseForSkillClasses": {
                            "physical": 1,
                            "energy": 1,
                            "mental": 1,
                            "affliction": 1,
                            "ninjutsu": 1
                        },
                        "tooltipText": "This character's non-strategic skills cost 1 additional random chakra.",
                        "turnDurationAnchor": "source_turn"
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "rehabilitated_gaara_prison_sand_burial_ready",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillReplacements": {
                            "rehabilitated-gaara-prison-sand-burial": "rehabilitated-gaara-desert-imperial-funeral"
                        },
                        "tooltipText": "Prison Sand Burial is replaced by Desert Imperial Funeral."
                    }
                }
            ]
        },
        {
            "id": "rehabilitated-gaara-quicksand-waterfall-flow",
            "name": "Quicksand Waterfall Flow",
            "skillimage": "https://i.imgur.com/fFk2WGR.png",
            "skilldescription": "Rehabilitated Gaara deals 15 damage to all enemies for 4 turns.",
            "energy": [
                "Bloodline",
                "Ninjutsu"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 4,
            "classes": [
                "Physical",
                "Action"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "rehabilitated_gaara_quicksand_dot",
                    "duration": 4,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 15,
                        "turnEndTrigger": "source_turn",
                        "turnDurationAnchor": "source_turn",
                        "ongoingClass": "action",
                        "triggerOnApply": true,
                        "tooltipText": "This character takes 15 damage from Quicksand Waterfall Flow."
                    }
                }
            ]
        },
        {
            "id": "rehabilitated-gaara-shield-of-shukaku",
            "name": "Shield of Shukaku",
            "skillimage": "https://i.imgur.com/Kr87iAU.png",
            "skilldescription": "This skill makes Rehabilitated Gaara invulnerable for 1 turn.",
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
                    "statusId": "rehabilitated_gaara_shield_of_shukaku",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "invulnerable": true,
                        "tooltipText": "This character is invulnerable."
                    }
                }
            ]
        },
        {
            "id": "rehabilitated-gaara-desert-imperial-funeral",
            "name": "Desert Imperial Funeral",
            "hiddenFromSelectionViewer": true,
            "skillimage": "https://i.imgur.com/WoNpe2N.png",
            "skilldescription": "Rehabilitated Gaara targets all enemies affected by 'Prison Sand Burial', destroying their destructible defense then dealing 40 piercing damage to them.",
            "energy": [
                "Bloodline",
                "Ninjutsu"
            ],
            "target": "all-enemy",
            "targetCondition": {
                "statusId": "rehabilitated_gaara_prison_sand_burial"
            },
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "destroy_destructible_defense",
                    "scope": "all-enemy"
                },
                {
                    "type": "damage",
                    "amount": 40,
                    "scope": "all-enemy",
                    "metadata": {
                        "ignoreDamageReduction": true,
                        "ignoreDestructibleDefense": true
                    }
                }
            ]
        }
    ]
};
