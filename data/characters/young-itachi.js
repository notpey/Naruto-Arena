module.exports = {
    "id": "young-itachi",
    "characterId": "young-itachi",
    "name": "Young Itachi",
    "facePicture": "https://i.imgur.com/N9A11eT.png",
    "characterdeescription": "The first child born to Uchiha Mikoto and Fugaku, Itachi's childhood was marked with violence. The death and destruction he experienced at such a young age traumatised Itachi and made him a pacifist, leading to him training non-stop to achieve his dream of becoming a ninja among ninja in order to erase fighting from the world. ORIGINAL DESIGN: Liann",
    "requiredMissionId": null,
    "skills": [
        {
            "id": "young-itachi-summoning-crow",
            "name": "Summoning: Crow",
            "skillimage": "deadcharacter-remaster.png?v=2",
            "skilldescription": "Young Itachi becomes unable to be killed for 1 turn and grants 1 crow stack to all enemies. For the rest of the game, everytime they use a new harmful skill, they will gain 1 crow stack. This skill can be used while active to make Young Itachi unable to be killed for 1 turn. This skill cannot be removed.",
            "energy": [],
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
                    "statusId": "young_itachi_crow_unreachable",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "minimumHp": 1,
                        "tooltipText": "Young Itachi cannot be killed."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "young_itachi_crow_stack",
                    "duration": 99,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "permanent": true,
                        "addCrowStackOnHarmfulSkillUse": true,
                        "tooltipText": "This character has Crow Stacks."
                    }
                }
            ]
        },
        {
            "id": "young-itachi-demonic-illusion-mirage-crow",
            "name": "Demonic Illusion: Mirage Crow",
            "skillimage": "deadcharacter-remaster.png?v=2",
            "skilldescription": "For 1 turn, Young Itachi reduces all enemies' non-affliction damage by 0, increased by 5 for each crow stack they have.",
            "energy": [
                "Genjutsu"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "young_itachi_mirage_crow_debuff",
                    "duration": 1,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "damageDebuffFlatPerCrowStack": 5,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character's non-affliction damage is reduced by 5 for each Crow Stack."
                    }
                }
            ]
        },
        {
            "id": "young-itachi-illusion-walking-unseen-step",
            "name": "Illusion Walking: Unseen Step",
            "skillimage": "deadcharacter-remaster.png?v=2",
            "skilldescription": "Young Itachi deals 0 piercing damage to one enemy, increased by 10 for each crow stack they have.",
            "energy": [
                "Taijutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Mental",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 0,
                    "scope": "target",
                    "metadata": {
                        "amountPerCrowStackOnTarget": 10,
                        "afflictionDamage": true,
                        "ignoreDamageReduction": true,
                        "ignoreDestructibleDefense": true
                    }
                }
            ]
        },
        {
            "id": "young-itachi-expert-retreat",
            "name": "Expert Retreat",
            "skillimage": "deadcharacter-remaster.png?v=2",
            "skilldescription": "This skill makes Young Itachi invulnerable for 1 turn.",
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
