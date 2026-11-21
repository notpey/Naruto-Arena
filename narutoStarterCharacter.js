(function (root, factory) {
    const character = factory();
    character.tags = ['konoha-genin'];
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = character;
    } else {
        root.NARUTO_STARTER_CHARACTER = character;
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    return {
        "id": "uzumaki-naruto",
        "characterId": "uzumaki-naruto",
        "name": "Uzumaki Naruto",
        "facePicture": "https://i.imgur.com/NwbpKdo.png",
        "characterdeescription": "Shunned by the Hidden Leaf Village for the Nine-Tailed Fox sealed within him, Naruto Uzumaki is a mischievous young genin determined to earn everyone's recognition and one day become Hokage. Armed with his newly learned Shadow Clone Technique and an unshakable spirit, Naruto begins his journey alongside Team 7, eager to prove that he's more than the village outcast.",
        "passive": {
            "name": "Kyuubi Awakening",
            "icon": "https://www.animehistory.org/uploads/screencaps/naruto-episode-016-the-broken-seal/cap_19-38_b1b8.jpg",
            "description": "Quest: Naruto uses 4 skills. Each other member of Team 7 on his team counts as 1 skill.\n\nReward: Naruto awakens the Kyuubi, healing 5 health each turn.",
            "awakening": {
                "statusId": "uzumaki_naruto_kyuubi_awakening_awakened",
                "afterOwnerSkillUses": 4,
                "allyCharacterIdsProgress": [
                    "uchiha-sasuke",
                    "haruno-sakura"
                ],
                "progressTooltipTextTemplate": "Quest: Naruto uses 4 skills. Each other member of Team 7 on his team counts as 1 skill. Progress: {awakeningSkillUses}/4.\n\nReward: Naruto awakens the Kyuubi, healing 5 health each turn.",
                "completedTooltipText": "The Kyuubi has awakened. Naruto heals 5 health each turn, Shadow Clones gives an extra Shadow Clone, and Rasengan gives 1 random chakra.",
                "metadata": {
                    "helpful": true,
                    "permanent": true,
                    "cannotBeCleansed": true,
                    "sourceSkillName": "Kyuubi Awakening",
                    "turnEndHealFlat": 5,
                    "tooltipText": "The Kyuubi has awakened. Naruto heals 5 health each turn, Shadow Clones gives an extra Shadow Clone, and Rasengan gives 1 random chakra."
                }
            }
        },
        "skills": [
            {
                "id": "uzumaki-naruto-uzumaki-naruto-combo",
                "name": "Uzumaki Naruto Combo",
                "skillimage": "https://i.imgur.com/vlSUp0N.png",
                "skilldescription": "Naruto deals 20 physical damage to an enemy. This skill deals 5 additional damage for each Shadow Clone. Naruto gains a Shadow Clone when used.",
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
                        "scope": "target",
                        "metadata": {
                            "bonusPerStatusMetadata": {
                                "statusId": "uzumaki_naruto_shadow_clones",
                                "metadataKey": "shadowClones",
                                "multiplier": 5,
                                "scope": "self"
                            }
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "uzumaki_naruto_shadow_clones",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "cannotBeCleansed": true,
                            "stackMetadataKey": "shadowClones",
                            "stackDelta": 1,
                            "stackMax": 99,
                            "stackDerivedNumericKeys": {
                                "damageReductionFlat": 5
                            },
                            "consumeStackOnEnemyDamagingSkill": {
                                "metadataKey": "shadowClones"
                            },
                            "skillTargetOverrides": {
                                "uzumaki-naruto-sexy-technique": "self-or-single-ally"
                            },
                            "tooltipTextTemplate": "Naruto has {shadowClones} Shadow Clones, giving {damageReductionFlat} damage reduction. Each damaging skill he receives uses up one. Sexy Technique can target any ally."
                        }
                    }
                ]
            },
            {
                "id": "uzumaki-naruto-shadow-clones",
                "name": "Shadow Clones",
                "skillimage": "https://i.imgur.com/LpWfxe9.png",
                "skilldescription": "Naruto gains 3 Shadow Clones. Each Shadow Clone gives him 5 damage reduction and is used up when he receives a damaging skill. During Kyuubi Awakening, this skill gives an extra Shadow Clone.",
                "energy": [
                    "Random"
                ],
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
                        "statusId": "uzumaki_naruto_shadow_clones",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "cannotBeCleansed": true,
                            "stackMetadataKey": "shadowClones",
                            "stackDelta": 3,
                            "stackMax": 99,
                            "stackDerivedNumericKeys": {
                                "damageReductionFlat": 5
                            },
                            "consumeStackOnEnemyDamagingSkill": {
                                "metadataKey": "shadowClones"
                            },
                            "skillTargetOverrides": {
                                "uzumaki-naruto-sexy-technique": "self-or-single-ally"
                            },
                            "tooltipTextTemplate": "Naruto has {shadowClones} Shadow Clones, giving {damageReductionFlat} damage reduction. Each damaging skill he receives uses up one. Sexy Technique can target any ally."
                        },
                        "condition": {
                            "missingStatusId": "uzumaki_naruto_kyuubi_awakening_awakened",
                            "requireMatch": true
                        }
                    },
                    {
                        "type": "apply_status",
                        "statusId": "uzumaki_naruto_shadow_clones",
                        "duration": 99,
                        "scope": "self",
                        "metadata": {
                            "helpful": true,
                            "cannotBeCleansed": true,
                            "stackMetadataKey": "shadowClones",
                            "stackDelta": 4,
                            "stackMax": 99,
                            "stackDerivedNumericKeys": {
                                "damageReductionFlat": 5
                            },
                            "consumeStackOnEnemyDamagingSkill": {
                                "metadataKey": "shadowClones"
                            },
                            "skillTargetOverrides": {
                                "uzumaki-naruto-sexy-technique": "self-or-single-ally"
                            },
                            "tooltipTextTemplate": "Naruto has {shadowClones} Shadow Clones, giving {damageReductionFlat} damage reduction. Each damaging skill he receives uses up one. Sexy Technique can target any ally."
                        },
                        "condition": {
                            "statusId": "uzumaki_naruto_kyuubi_awakening_awakened",
                            "requireMatch": true
                        }
                    }
                ]
            },
            {
                "id": "uzumaki-naruto-rasengan",
                "name": "Rasengan",
                "skillimage": "https://i.imgur.com/WldaOa7.png",
                "skilldescription": "Requires 2 or more Shadow Clones. Naruto deals 40 chakra damage to one enemy. For 1 turn, that enemy is stunned and invulnerable to their allies' skills. During Kyuubi Awakening, this skill also gives Naruto 1 random chakra.",
                "energy": [
                    "Ninjutsu",
                    "Taijutsu"
                ],
                "target": "single-enemy",
                "damage": 0,
                "cooldown": 1,
                "actorCondition": {
                    "statusMetadataAtLeast": {
                        "statusId": "uzumaki_naruto_shadow_clones",
                        "metadataKey": "shadowClones",
                        "value": 2
                    }
                },
                "classes": [
                    "Chakra",
                    "Instant"
                ],
                "effects": [
                    {
                        "type": "damage",
                        "amount": 40,
                        "scope": "target"
                    },
                    {
                        "type": "apply_status",
                        "statusId": "uzumaki_naruto_rasengan_stun",
                        "duration": 1,
                        "scope": "target",
                        "metadata": {
                            "harmful": true,
                            "cannotUseSkills": true,
                            "invulnerableToHelpfulSkills": true,
                            "tooltipText": "This character is stunned and invulnerable to their allies' skills."
                        }
                    },
                    {
                        "type": "gain_chakra",
                        "chakraType": "random",
                        "amount": 1,
                        "scope": "self",
                        "condition": {
                            "statusId": "uzumaki_naruto_kyuubi_awakening_awakened",
                            "requireMatch": true
                        }
                    }
                ]
            },
            {
                "id": "uzumaki-naruto-sexy-technique",
                "name": "Sexy Technique",
                "skillimage": "https://i.imgur.com/9QWZkQg.png",
                "skilldescription": "Naruto becomes invulnerable for 1 turn. While Naruto has Shadow Clones, this skill can be used on any ally.",
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
                        "scope": "target",
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
