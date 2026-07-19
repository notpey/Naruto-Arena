module.exports = {
    "id": "hoshigaki-kisame",
    "characterId": "hoshigaki-kisame",
    "name": "Hoshigaki Kisame",
    "facePicture": "https://i.imgur.com/tij8Nxm.png",
    "characterdeescription": "Formerly one of the Seven Swordsmen of the Mist Village, Kisame is an S-Rank missing ninja that is now a member of Akatsuki, having been partnered with Uchiha Itachi. Using his powerful, and ominous sword, mixed with his powerful water based ninjutsu, Kisame can disable enemies in every manner of way.",
    "requiredMissionId": "s-rank-criminal-kisame",
    "skills": [
        {
            "id": "hoshigaki-kisame-samehada-slash",
            "name": "Samehada Slash",
            "skillimage": "https://i.imgur.com/Knwkie7.png",
            "skilldescription": "Hoshigaki Kisame deals 20 damage to one enemy and stuns their energy, mental, and strategic skills for 1 turn.",
            "energy": [
                "Taijutsu"
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
                    "amount": 20,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "hoshigaki_kisame_samehada_slash_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "cannotUseSkillClasses": [
                            "energy",
                            "mental",
                            "strategic"
                        ],
                        "tooltipText": "This character's energy, mental, and strategic skills are stunned."
                    }
                }
            ]
        },
        {
            "id": "hoshigaki-kisame-samehada-shred",
            "name": "Samehada Shred",
            "skillimage": "https://i.imgur.com/PC7su7O.png",
            "skilldescription": "Hoshigaki Kisame deals 15 damage to one enemy for 2 turns, stealing 1 random non-bloodline energy from them each turn.",
            "energy": [
                "Taijutsu",
                "Ninjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Physical",
                "Action"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "hoshigaki_kisame_samehada_shred_dot",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnEndDamage": 15,
                        "turnEndDrainNonBloodlineToSource": 1,
                        "turnEndTrigger": "source_turn",
                        "turnDurationAnchor": "source_turn",
                        "ongoingClass": "action",
                        "triggerOnApply": true,
                        "tooltipText": "This character takes 15 damage each turn and loses 1 random non-bloodline chakra to Hoshigaki Kisame from Samehada Shred."
                    }
                }
            ]
        },
        {
            "id": "hoshigaki-kisame-water-shark-projectile",
            "name": "Water Shark Projectile",
            "skillimage": "https://i.imgur.com/Cvpp0VQ.png",
            "skilldescription": "Hoshigaki Kisame deals 20 damage to one enemy and stuns their physical, affliction, and strategic skills for 1 turn.",
            "energy": [
                "Ninjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Energy",
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
                    "statusId": "hoshigaki_kisame_water_shark_projectile_stun",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "turnDurationAnchor": "source_turn",
                        "cannotUseSkillClasses": [
                            "physical",
                            "affliction",
                            "strategic"
                        ],
                        "tooltipText": "This character's physical, affliction, and strategic skills are stunned."
                    }
                }
            ]
        },
        {
            "id": "hoshigaki-kisame-samehada-scale-block",
            "name": "Samehada Scale Block",
            "skillimage": "https://i.imgur.com/mSXuepK.png",
            "skilldescription": "This skill makes Hoshigaki Kisame invulnerable for 1 turn.",
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
                    "statusId": "hoshigaki_kisame_samehada_scale_block",
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
