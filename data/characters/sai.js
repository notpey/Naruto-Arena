module.exports = {
    "id": "sai",
    "characterId": "sai",
    "name": "Sai",
    "facePicture": "deadcharacter.png",
    "characterdeescription": "A current member of the Elite ANBU Root, Sai is a quiet, but expressive individual with a mysterious past. Sai uses a set of brushes with a special ink to give life to his art, from tigers to lions to bears, that allow him to compete with his enemies.",
    "requiredMissionId": "a-blank-slate",
    "skills": [
        {
            "id": "sai-super-beast-imitating-drawing-lions",
            "name": "Super Beast Imitating Drawing: Lions",
            "skillimage": "deadcharacter.png",
            "skilldescription": "Sai deals 30 damage to one enemy. For 1 turn, Sai will gain 20 points of destructible defense.",
            "energy": [
                "Genjutsu",
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
                    "amount": 30,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "sai_lions_destructible_defense",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "destructibleDefensePoints": 20,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "Sai has 20 points of destructible defense."
                    }
                }
            ]
        },
        {
            "id": "sai-super-beast-imitating-drawing-snake",
            "name": "Super Beast Imitating Drawing: Snake",
            "skillimage": "deadcharacter.png",
            "skilldescription": "Sai stuns one enemy's physical, energy and strategic skills for 1 turn. During this time, that enemy will be unable to reduce damage or become invulnerable. This skill ignores invulnerability. During 'Adaptive Painting', this skill will be replaced.",
            "energy": [
                "Genjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 0,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "sai_snake_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkillClasses": [
                            "physical",
                            "energy",
                            "strategic"
                        ],
                        "cannotReduceDamage": true,
                        "cannotBecomeInvulnerable": true,
                        "ignoreInvulnerability": true,
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character's physical, energy and strategic skills are stunned and they cannot reduce damage or become invulnerable."
                    }
                }
            ],
            "ignoreInvulnerability": true
        },
        {
            "id": "sai-adaptive-painting",
            "name": "Adaptive Painting",
            "skillimage": "deadcharacter.png",
            "skilldescription": "For 3 turns, any ally that is targeted by a new direct stun skill will become invulnerable for 1 turn; any ally that has energy removed/stolen will gain 1 random energy, and any ally that successfully receives new non-affliction damage by an enemy will increase Sai's damage by 10 for 1 turn.",
            "energy": [
                "Random",
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
                    "statusId": "sai_adaptive_painting_active",
                    "duration": 3,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "adaptivePaintingActive": true,
                        "skillReplacements": {
                            "sai-super-beast-imitating-drawing-snake": "sai-super-beast-imitating-drawing-bird"
                        },
                        "tooltipText": "Adaptive Painting is active: allies counter stuns and energy drain, taking damage buffs Sai."
                    }
                }
            ]
        },
        {
            "id": "sai-ink-clone",
            "name": "Ink Clone",
            "skillimage": "deadcharacter.png",
            "skilldescription": "This skill makes Sai invulnerable for 1 turn.",
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
                    "statusId": "sai_ink_clone_invul",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "invulnerable": true,
                        "tooltipText": "This character is invulnerable."
                    }
                }
            ]
        },
        {
            "id": "sai-super-beast-imitating-drawing-bird",
            "name": "Super Beast Imitating Drawing: Bird",
            "skillimage": "deadcharacter.png",
            "skilldescription": "Sai deals 25 damage to one enemy and stuns their physical, energy and strategic skills for 1 turn.",
            "energy": [
                "Genjutsu"
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
                    "amount": 25,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "sai_bird_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkillClasses": [
                            "physical",
                            "energy",
                            "strategic"
                        ],
                        "turnDurationAnchor": "source_turn",
                        "tooltipText": "This character's physical, energy and strategic skills are stunned for 1 turn."
                    }
                }
            ]
        }
    ]
};
