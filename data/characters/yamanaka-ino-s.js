module.exports = {
    "id": "yamanaka-ino-s",
    "characterId": "yamanaka-ino-s",
    "name": "Yamanaka Ino (S)",
    "facePicture": "https://i.imgur.com/0if0azl.png",
    "characterdeescription": "Not one to be left behind, Ino has trained non-stop to improve her abilities and teamwork. With her improved techniques, Ino can not only control her enemies, but her allies too all while seeing everything on the battlefield.",
    "requiredMissionId": "blondes-have-all-the-fun",
    "skills": [
        {
            "id": "yamanaka-ino-s-mind-body-switch",
            "name": "Mind Body Switch",
            "skillimage": "https://i.imgur.com/o3L4SaW.png",
            "skilldescription": "Yamanaka Ino (S) targets one enemy. After 1 turn, that enemy will take 15 damage and if that enemy uses a new harmful skill during this time, they will be countered and this skill will be replaced by the skill they used for 1 turn. This skill cannot be reflected and is invisible.",
            "energy": [
                "Genjutsu"
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
                    "type": "apply_status",
                    "statusId": "yamanaka_ino_s_mind_body_switch_mark",
                    "duration": 1,
                    "scope": "target",
                    "metadata": {
                        "harmful": true,
                        "invisible": true,
                        "cannotBeReflected": true,
                        "triggerOnEnemyHarmfulSkill": true,
                        "counterCopySkillReplacementFor": "yamanaka-ino-s-mind-body-switch",
                        "counterCopySkillReplacementDuration": 1,
                        "turnDurationAnchor": "any_turn",
                        "onExpireEffects": [
                            {
                                "type": "damage",
                                "amount": 15,
                                "scope": "target"
                            }
                        ],
                        "tooltipText": "Subject to Mind Body Switch: will take 15 damage and have their next harmful skill countered and copied."
                    }
                }
            ]
        },
        {
            "id": "yamanaka-ino-s-proxy-surveillance",
            "name": "Proxy Surveillance",
            "skillimage": "https://i.imgur.com/5K6bokD.png",
            "skilldescription": "Yamanaka Ino (S) targets all enemies. For 3 turns, everytime they use a new skill, they will take 5 piercing damage. During this time, all new invisible skills they use will become visible. This skill cannot be countered or reflected.",
            "energy": [
                "Random"
            ],
            "target": "all-enemy",
            "damage": 0,
            "cooldown": 3,
            "classes": [
                "Mental",
                "Instant"
            ],
            "effects": [
                {
                    "type": "apply_status",
                    "statusId": "yamanaka_ino_s_proxy_surveillance_debuff",
                    "duration": 3,
                    "scope": "all-enemy",
                    "metadata": {
                        "harmful": true,
                        "cannotBeCountered": true,
                        "cannotBeReflected": true,
                        "damageOnSkillUsePiercing": 5,
                        "revealInvisibleSkills": true,
                        "tooltipText": "Takes 5 piercing damage on skill use and invisible skills are revealed."
                    }
                }
            ]
        },
        {
            "id": "yamanaka-ino-s-mind-clone-switch",
            "name": "Mind Clone Switch",
            "skillimage": "https://i.imgur.com/orofy9Q.png",
            "skilldescription": "For 2 turns, both of Yamanaka Ino (S)'s allies will ignore all harmful effects other than damage and energy cost changes. This skill is invisible and will end if Yamanaka Ino (S) dies.",
            "energy": [
                "Genjutsu",
                "Random"
            ],
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
                    "statusId": "yamanaka_ino_s_mind_clone_switch_guard",
                    "duration": 2,
                    "scope": "all-ally",
                    "metadata": {
                        "helpful": true,
                        "invisible": true,
                        "ignoreHarmfulNonDamageEffects": true,
                        "tooltipText": "Ignores all harmful non-damage and non-energy effects."
                    }
                }
            ]
        },
        {
            "id": "yamanaka-ino-s-hide",
            "name": "Hide",
            "skillimage": "https://i.imgur.com/TrPzpBy.png",
            "skilldescription": "This skill makes Yamanaka Ino (S) invulnerable for 1 turn.",
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
                    "statusId": "yamanaka_ino_s_hide_invul",
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
