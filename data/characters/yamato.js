module.exports = {
    "id": "yamato",
    "characterId": "yamato",
    "name": "Yamato",
    "facePicture": "https://i.imgur.com/bqEBFnr.png",
    "characterdeescription": "A member of the secretive ANBU organization and a man who was once injected with the cells of Hashirama, the 1st Hokage. Due to the cells that live inside of him, Yamato is capable of small scale wood element abilities, from trapping enemies to protecting his comrades.",
    "requiredMissionId": "a-new-team-leader",
    "skills": [
        {
            "id": "yamato-bliss-bringing-hands",
            "name": "Bliss-Bringing Hands",
            "skillimage": "https://i.imgur.com/fa2R9Pp.png",
            "skilldescription": "Yamato targets one enemy, dealing 30 damage to them and making them ignore all helpful effects except energy cost changes for 1 turn.",
            "energy": [
                "Bloodline",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Chakra",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 30,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "yamato_bliss_bringing_hands_nullify",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "ignoreHelpfulNonEnergyEffects": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "Ignores all helpful effects except energy cost changes for 1 turn."
                    }
                }
            ]
        },
        {
            "id": "yamato-wood-release-wood-clone",
            "name": "Wood Release: Wood Clone",
            "skillimage": "https://i.imgur.com/V0n6c3b.png",
            "skilldescription": "Yamato targets one ally or himself for 1 turn, countering the first physical, energy or strategic skill used against them, dealing 20 damage to the enemy and granting that ally 20 points of destructible defense. This skill is invisible.",
            "energy": [
                "Bloodline"
            ],
            "target": "single-ally",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "yamato_wood_clone_counter_trap",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "invisible": true,
                        "triggerOnEnemyPhysicalOrStrategicSkill": true,
                        "counterDamage": 20,
                        "counterApplyStatusToRecipient": {
                            "statusId": "yamato_wood_clone_destructible_defense",
                            "duration": 99,
                            "metadata": {
                                "helpful": true,
                                "destructibleDefensePoints": 20,
                                "destructibleDefensePermanent": true,
                                "tooltipText": "Protected by Wood Clone (20 Destructible Defense)."
                            }
                        },
                        "tooltipText": "Counters the next physical, energy, or strategic skill, dealing 20 damage and granting 20 destructible defense."
                    }
                }
            ]
        },
        {
            "id": "yamato-wood-release-four-pillar-prison",
            "name": "Wood Release: Four-Pillar Prison",
            "skillimage": "https://i.imgur.com/pMDbi3L.png",
            "skilldescription": "This skill can be used on one enemy or one ally. If used on an enemy, that enemy will have their physical, energy and strategic skills stunned for 2 turns. If used on an ally, that ally will gain 40 points of permanent destructible defense. This skill ignores invulnerability.",
            "energy": [
                "Bloodline",
                "Ninjutsu"
            ],
            "target": "single-target",
            "damage": 0,
            "cooldown": 4,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "yamato_four_pillar_prison_enemy_stun",
                    "duration": 2,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "isEnemy": true
                    },
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkillClasses": [
                            "physical",
                            "energy",
                            "strategic"
                        ],
                        "ignoreInvulnerability": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character's physical, energy and strategic skills are stunned for 2 turns."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "yamato_four_pillar_prison_ally_defense",
                    "duration": 99,
                    "scope": "target",
                    "condition": {
                        "scope": "target",
                        "isAlly": true
                    },
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePoints": 40,
                        "destructibleDefensePermanent": true,
                        "tooltipText": "Gained 40 permanent destructible defense."
                    }
                }
            ],
            "ignoreInvulnerability": true
        },
        {
            "id": "yamato-wood-release-wood-shelter",
            "name": "Wood Release: Wood Shelter",
            "skillimage": "https://i.imgur.com/UudEEcp.png",
            "skilldescription": "This skill makes Yamato invulnerable for 1 turn.",
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
                    "statusId": "yamato_wood_shelter_invul",
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
