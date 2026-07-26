module.exports = {
    "id": "haku",
    "characterId": "haku",
    "name": "Haku",
    "facePicture": "https://i.imgur.com/1iuyTS5.png",
    "requiredMissionId": "hidden-hunter",
    "shopPrice": 500,
    "characterdeescription": "The sole survivor of the Yuki clan, and the subordinate of Zabuza; Haku, despite being young, holds enough potential strength to surpass almost any ninja. Using his ice based bloodline, and his intelligence, Haku can attack and defend nearly simultaneously.",
    "skills": [
        {
            "id": "haku-flying-water-needles-of-death",
            "name": "Flying Water Needles of Death",
            "skillimage": "https://i.imgur.com/DaN3ECR.png",
            "skilldescription": "Haku deals 30 damage to one enemy. During 'Demonic Mirroring Ice Crystals', this skill targets all enemies.",
            "energy": [
                "Bloodline",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 30,
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
                }
            ]
        },
        {
            "id": "haku-acupuncture",
            "name": "Acupuncture",
            "skillimage": "https://i.imgur.com/dDxetJr.png",
            "skilldescription": "Haku targets one enemy, stunning them and making them unable to reduce damage or become invulnerable for 1 turn. During 'Demonic Mirroring Ice Crystals', this skill targets all enemies and costs 1 additional random chakra. This skill ignores invulnerability.",
            "energy": [
                "Ninjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "ignoreInvulnerability": true,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "haku_acupuncture_debuff",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkills": true,
                        "cannotReduceDamage": true,
                        "cannotBecomeInvulnerable": true,
                        "tooltipText": "This character is stunned and cannot reduce damage or become invulnerable.",
                        "turnDurationAnchor": "source_turn"
                    }
                }
            ]
        },
        {
            "id": "haku-demonic-mirroring-ice-crystals",
            "name": "Demonic Mirroring Ice Crystals",
            "skillimage": "https://i.imgur.com/2sgPkS0.png",
            "skilldescription": "Haku becomes invulnerable for 3 turns. While active, 'Flying Water Needles of Death' will target all enemies, and 'Acupuncture' will target all enemies and cost 1 additional random chakra.",
            "energy": [
                "Bloodline",
                "Ninjutsu"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 6,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "haku_demonic_mirroring_ice_crystals",
                    "duration": 3,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "invulnerable": true,
                        "skillReplacements": {
                            "haku-flying-water-needles-of-death": "haku-flying-water-needles-of-death-empowered",
                            "haku-acupuncture": "haku-acupuncture-empowered"
                        },
                        "tooltipText": "Haku is invulnerable.\nFlying Water Needles of Death targets all enemies.\nAcupuncture targets all enemies.\nAcupuncture costs 1 additional random chakra."
                    }
                }
            ]
        },
        {
            "id": "haku-needle-parry",
            "name": "Needle Parry",
            "skillimage": "https://i.imgur.com/0qDDVuG.png",
            "skilldescription": "This skill makes Haku invulnerable for 1 turn.",
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
                    "statusId": "haku_needle_parry_invulnerable",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "invulnerable": true,
                        "tooltipText": "Haku is invulnerable for 1 turn."
                    }
                }
            ]
        },
        {
            "id": "haku-flying-water-needles-of-death-empowered",
            "hiddenFromSelectionViewer": true,
            "name": "Flying Water Needles of Death",
            "skillimage": "https://i.imgur.com/DaN3ECR.png",
            "skilldescription": "Haku deals 30 damage to all enemies during 'Demonic Mirroring Ice Crystals'.",
            "energy": [
                "Bloodline",
                "Random"
            ],
            "target": "all-enemy",
            "damage": 30,
            "cooldown": 0,
            "classes": [
                "Physical",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 30,
                    "scope": "all-enemy"
                }
            ]
        },
        {
            "id": "haku-acupuncture-empowered",
            "hiddenFromSelectionViewer": true,
            "name": "Acupuncture",
            "skillimage": "https://i.imgur.com/dDxetJr.png",
            "skilldescription": "Haku targets all enemies during 'Demonic Mirroring Ice Crystals', stunning them and making them unable to reduce damage or become invulnerable for 1 turn. This skill ignores invulnerability.",
            "energy": [
                "Ninjutsu",
                "Random"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 1,
            "ignoreInvulnerability": true,
            "classes": [
                "Strategic",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "haku_acupuncture_debuff",
                    "duration": 1,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkills": true,
                        "cannotReduceDamage": true,
                        "cannotBecomeInvulnerable": true,
                        "tooltipText": "This character is stunned and cannot reduce damage or become invulnerable.",
                        "turnDurationAnchor": "source_turn"
                    }
                }
            ]
        }
    ]
};
