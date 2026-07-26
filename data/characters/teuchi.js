module.exports = {
    "id": "teuchi",
    "characterId": "teuchi",
    "name": "Teuchi",
    "facePicture": "https://i.imgur.com/8vJ128J.png",
    "characterdeescription": "Teuchi is a citizen of the Hidden Leaf Village and the owner of Ramen Ichiraku. As a teenager, Teuchi devoted his life to making ramen, what undoubtedly makes him the most important character from the Naruto franchise. ORIGINAL DESIGN: Alexandre",
    "requiredMissionId": null,
    "skills": [
        {
            "id": "teuchi-stick-throw",
            "name": "Stick Throw",
            "skillimage": "https://i.imgur.com/8vJ128J.png",
            "skilldescription": "Teuchi deals 20 damage to one enemy.",
            "energy": [
                "Random"
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
                }
            ]
        },
        {
            "id": "teuchi-ramen",
            "name": "Ramen",
            "skillimage": "https://i.imgur.com/8vJ128J.png",
            "skilldescription": "Teuchi heals his allies for 15 health and gains 20 points of destructible defense for 1 turn.",
            "energy": [
                "Random",
                "Random"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "heal",
                    "amount": 15,
                    "scope": "all-allies"
                },
                {
                    "type": "apply_status",
                    "statusId": "teuchi_ramen_defense",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePoints": 20,
                        "tooltipText": "Teuchi has 20 points of destructible defense."
                    }
                }
            ]
        },
        {
            "id": "teuchi-ramen-ichiraku-open",
            "name": "Ramen Ichiraku: Open",
            "skillimage": "https://i.imgur.com/8vJ128J.png",
            "skilldescription": "Teuchi targets all his allies. For the rest of the game, everytime an ally uses a new skill, 'Ramen' will heal 5 additional health permanently. This skill stacks and ends if Teuchi dies.",
            "energy": [],
            "target": "all-allies",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "teuchi_ramen_open",
                    "duration": 99,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "permanent": true,
                        "ongoingClass": "action",
                        "tooltipText": "Everytime an ally uses a new skill, Ramen will heal 5 additional health permanently."
                    }
                }
            ]
        },
        {
            "id": "teuchi-ramen-ichiraku-closed",
            "name": "Ramen Ichiraku: Closed",
            "skillimage": "https://i.imgur.com/8vJ128J.png",
            "skilldescription": "This skill makes Teuchi invulnerable for 1 turn, heals him for 35 health and ends 'Ramen Ichiraku: Open' on his team.",
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
                },
                {
                    "type": "heal",
                    "amount": 35,
                    "scope": "self"
                },
                {
                    "type": "cleanse_statuses",
                    "scope": "self",
                    "statusId": "teuchi_ramen_open"
                }
            ]
        }
    ]
};
