module.exports = {
    "id": "akadou-yoroi",
    "characterId": "akadou-yoroi",
    "name": "Akadou Yoroi",
    "facePicture": "https://i.imgur.com/U0Ziv1r.png",
    "characterdeescription": "A mysterious genin assigned to Kabuto's team during the Chuunin Exams, Yoroi secretly serves as a spy for Orochimaru. Specializing in close-range combat, he possesses the ability to absorb his opponents' chakra, gradually draining their strength while sustaining his own.",
    "passive": {
        "name": "Close Quarters",
        "icon": "https://i.imgur.com/MUx03Dx.png",
        "description": "Yoroi's chakra-absorbing abilities grant him Lifesteal: he recovers health equal to the health damage his skills deal.",
        "lifestealPercent": 100
    },
    "skills": [
        {
            "id": "akadou-yoroi-chakra-and-life-absorption",
            "name": "Chakra and Life Absorption",
            "skillimage": "https://i.imgur.com/0qvKdhQ.png",
            "skilldescription": "Yoroi concentrates his chakra-absorbing abilities, enhancing Energy Drain and Draining Assault for 3 turns.",
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
                    "statusId": "akadou_yoroi_chakra_and_life_absorption",
                    "duration": 3,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "tooltipText": "Energy Drain steals 1 chakra on use. Draining Assault steals 1 chakra from its target each turn."
                    }
                }
            ]
        },
        {
            "id": "akadou-yoroi-energy-drain",
            "name": "Energy Drain",
            "skillimage": "https://i.imgur.com/5WXWl5W.png",
            "skilldescription": "Yoroi strikes an enemy, dealing 20 physical damage. While enhanced by Chakra and Life Absorption, this skill also steals 1 chakra from the target.",
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
                    "type": "drain_chakra_random_from_target_to_self",
                    "amount": 1,
                    "scope": "target",
                    "condition": {
                        "scope": "self",
                        "statusId": "akadou_yoroi_chakra_and_life_absorption"
                    }
                }
            ]
        },
        {
            "id": "akadou-yoroi-draining-assault",
            "name": "Draining Assault",
            "skillimage": "https://i.imgur.com/F4ymMEe.png",
            "skilldescription": "Yoroi continuously drains an enemy, dealing 15 physical damage each turn for 3 turns. While enhanced by Chakra and Life Absorption, this skill also steals 1 chakra from the target each turn.",
            "energy": [
                "Taijutsu",
                "Random",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Physical",
                "Action"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "akadou_yoroi_draining_assault_dot",
                    "duration": 3,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 15,
                        "turnEndSkillClasses": [
                            "Physical"
                        ],
                        "turnEndTrigger": "source_turn",
                        "turnDurationAnchor": "source_turn",
                        "ongoingClass": "action",
                        "triggerOnApply": true,
                        "turnEndDrainRandomToSource": 1,
                        "turnEndDrainRandomToSourceRequiresSourceStatusId": "akadou_yoroi_chakra_and_life_absorption",
                        "tooltipText": "This character takes 15 physical damage each turn for 3 turns. While Yoroi has Chakra and Life Absorption, 1 chakra is also stolen each turn."
                    }
                }
            ]
        },
        {
            "id": "akadou-yoroi-chakra-block",
            "name": "Chakra Block",
            "skillimage": "https://i.imgur.com/MNnA4mF.png",
            "skilldescription": "Yoroi uses his chakra to defend himself, becoming invulnerable for 1 turn.",
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
                    "statusId": "akadou_yoroi_chakra_block",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "invulnerable": true,
                        "tooltipText": "Yoroi is invulnerable for 1 turn."
                    }
                }
            ]
        }
    ]
};
