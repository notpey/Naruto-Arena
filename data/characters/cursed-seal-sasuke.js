module.exports = {
    "id": "cursed-seal-sasuke",
    "characterId": "cursed-seal-sasuke",
    "name": "Cursed Seal Sasuke",
    "facePicture": "https://i.imgur.com/h62tBoY.png",
    "characterdeescription": "Having gotten used to the Cursed Seal, Sasuke is able to draw Orochimaru's vile chakra through it, becoming a twisted hideous version of himself, but also getting stronger and faster. With the Cursed Seal, Sasuke's powers have exponentially increased, allowing him to pierce or trap enemies with his dark chakra.",
    "requiredMissionId": "descent-into-darkness",
    "skills": [
        {
            "id": "cursed-seal-sasuke-corrupt-chidori",
            "name": "Corrupt Chidori",
            "skillimage": "https://i.imgur.com/JuEWNgD.png",
            "skilldescription": "Cursed Seal Sasuke deals 45 damage to one enemy, reducing their non-affliction damage by 20 for 2 turns.",
            "energy": [
                "Ninjutsu",
                "Ninjutsu"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 1,
            "classes": [
                "Ninjutsu",
                "Instant"
            ],
            "effects": [
                {
                    "type": "damage",
                    "amount": 45,
                    "scope": "target"
                },
                {
                    "type": "apply_status",
                    "statusId": "cursed_seal_sasuke_corrupt_chidori_debuff",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "nonAfflictionDamageDebuffFlat": 20,
                        "tooltipText": "This character deals 20 less non-affliction damage."
                    }
                }
            ]
        },
        {
            "id": "cursed-seal-sasuke-dark-void",
            "name": "Dark Void",
            "skillimage": "https://i.imgur.com/ybMA3WL.png",
            "skilldescription": "Cursed Seal Sasuke stuns one enemy for 2 turns, makes them invulnerable to harmful skills for 1 turn and invulnerable to helpful skills for 2 turns. When this skill ends, this enemy will take 55 damage. This skill will end if Cursed Seal Sasuke dies.",
            "energy": [
                "Ninjutsu",
                "Ninjutsu",
                "Random"
            ],
            "target": "single-enemy",
            "damage": 0,
            "cooldown": 5,
            "classes": [
                "Ninjutsu",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "cursed_seal_sasuke_dark_void_stun",
                    "duration": 2,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "cannotUseSkills": true,
                        "invulnerableToHelpfulSkills": true,
                        "tooltipText": "This character is stunned, invulnerable to helpful skills, and will take 55 damage when this ends.",
                        "onExpireEffects": [
                            {
                                "type": "damage",
                                "amount": 55
                            }
                        ]
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "cursed_seal_sasuke_dark_void_invuln_harmful",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "invulnerableToHarmfulEffects": true,
                        "tooltipText": "This character is invulnerable to harmful skills.",
                        "turnDurationAnchor": "source_turn"
                    }
                }
            ]
        },
        {
            "id": "cursed-seal-sasuke-cursed-seal",
            "name": "Cursed Seal",
            "skillimage": "https://i.imgur.com/0Fk3SCs.png",
            "skilldescription": "Cursed Seal Sasuke becomes invulnerable for 1 turn and takes 15 affliction damage that cannot kill him. For 1 turn, 'Corrupt Chidori' will cost 1 random energy instead and 'Dark Void' will cost 2 random energies instead. For 2 turns, Cursed Seal Sasuke will ignore healing effects.",
            "energy": [
                "Bloodline"
            ],
            "target": "self",
            "damage": 0,
            "cooldown": 2,
            "classes": [
                "Strategic",
                "Instant",
                "Affliction"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "cursed_seal_sasuke_cursed_seal_floor",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "minimumHp": 1,
                        "tooltipText": "This character cannot be killed."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "cursed_seal_sasuke_cursed_seal_invuln",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "invulnerable": true,
                        "tooltipText": "This character is invulnerable."
                    }
                },
                {
                    "type": "damage",
                    "amount": 15,
                    "scope": "self",
                    "metadata": {
                        "afflictionDamage": true
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "cursed_seal_sasuke_cursed_seal_cost",
                    "duration": 1,
                    "scope": "self",
                    "metadata": {
                        "helpful": true,
                        "skillCostOverridesBySkillId": {
                            "cursed-seal-sasuke-corrupt-chidori": {
                                "energy": [
                                    "Random"
                                ]
                            },
                            "cursed-seal-sasuke-dark-void": {
                                "energy": [
                                    "Random",
                                    "Random"
                                ]
                            }
                        },
                        "tooltipText": "Corrupt Chidori costs 1 random chakra and Dark Void costs 2 random chakra."
                    }
                },
                {
                    "type": "apply_status",
                    "statusId": "cursed_seal_sasuke_cursed_seal_no_heal",
                    "duration": 2,
                    "scope": "self",
                    "metadata": {
                        "harmful": true,
                        "healReceivedMultiplier": 0,
                        "tooltipText": "This character ignores healing effects."
                    }
                }
            ]
        },
        {
            "id": "cursed-seal-sasuke-sharingan-evasion",
            "name": "Sharingan Evasion",
            "skillimage": "https://i.imgur.com/gz8961h.png",
            "skilldescription": "This skill makes Cursed Seal Sasuke invulnerable for 1 turn.",
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
                    "statusId": "cursed_seal_sasuke_sharingan_evasion",
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
