module.exports = {
    id: 'umino-iruka', characterId: 'umino-iruka', name: 'Umino Iruka (RW)',
    facePicture: 'https://i.imgur.com/snz8zD4.png',
    characterdeescription: "A compassionate instructor at Konoha's Ninja Academy, Iruka serves as a trusted mentor and father figure to Naruto. Deeply devoted to his students, he willingly puts himself in harm's way to protect those he cares about.",
    requiredMissionId: null,
    passive: {
        name: 'Beloved Sensei', icon: 'https://i.imgur.com/fo7qWJv.png',
        description: "Iruka's guidance strengthens his students. All allied Konoha Genin gain 10 maximum health.",
        alliedCharacterTagMaxHealthBonus: { tag: 'konoha-genin', amount: 10 },
    },
    skills: [
        {
            id: 'umino-iruka-shuriken-throw', name: 'Shuriken Throw',
            skillimage: 'https://i.imgur.com/LmS1XVp.png',
            skilldescription: 'Iruka throws a barrage of shuriken, dealing 20 physical damage to an enemy. If Iruka has 50 health or less, this skill deals 10 additional damage.',
            energy: ['Random'], target: 'single-enemy', damage: 0, cooldown: 1,
            classes: ['Physical', 'Instant'], effects: [
                { type: 'damage', amount: 20, scope: 'target' },
                { type: 'damage', amount: 10, scope: 'target', condition: { scope: 'self', sourceCurrentHpAtMost: 50 } },
            ],
        },
        {
            id: 'umino-iruka-sacrifice', name: 'Sacrifice',
            skillimage: 'https://i.imgur.com/KCALU7E.png',
            skilldescription: "Iruka puts himself in harm's way to protect a teammate, making them invulnerable for 1 turn.",
            energy: ['Random'], target: 'single-ally', damage: 0, cooldown: 1,
            classes: ['Strategic', 'Instant'], effects: [{
                type: 'apply_status', statusId: 'invulnerable', duration: 1, scope: 'target',
                metadata: { helpful: true, invulnerable: true, tooltipText: 'This character is invulnerable.' },
            }],
        },
        {
            id: 'umino-iruka-sealed-bomb-square-release', name: 'Sealed Bomb Square Release',
            skillimage: 'https://i.imgur.com/TeDfWJB.png',
            skilldescription: 'Iruka places an invisible mark on an enemy for 1 turn. If they use a damaging skill during this time, they take 20 affliction damage. If the enemy falls to 50 health or less, their non-strategic skills are also stunned for 1 turn.',
            energy: ['Ninjutsu'], target: 'single-enemy', damage: 0, cooldown: 2,
            classes: ['Chakra', 'Affliction', 'Instant'], effects: [{
                type: 'apply_status', statusId: 'iruka_sealed_bomb_trap', duration: 1, scope: 'target',
                metadata: {
                    harmful: true, hideTooltipFromUnitOwner: true, triggerOnEnemyHarmfulSkill: true,
                    triggerOnlyOnOwnerSkillUse: true, triggerOnlyOnDamagingSkill: true,
                    counterDamageAttributedToStatusSource: true, counterDamageRespectsInvulnerability: true,
                    counterCancelsSkill: false, counterDamage: 20, counterDamageSkillClasses: ['Affliction'],
                    counterStatusId: 'iruka_sealed_bomb_stun', counterStatusDuration: 1,
                    counterStatusApplyIfTargetHpAtMost: 50,
                    counterStatusMetadata: {
                        harmful: true, cannotUseSkillClasses: ['physical', 'energy', 'mental', 'ninjutsu'],
                        tooltipText: "This character's non-strategic skills are stunned for 1 turn.",
                    },
                    turnDurationAnchor: 'source_turn',
                    tooltipText: 'If this character uses a damaging skill, Sealed Bomb Square Release deals 20 affliction damage and stuns non-strategic skills if their health falls to 50 or less.',
                },
            }],
        },
        {
            id: 'umino-iruka-kunai-parry', name: 'Kunai Parry',
            skillimage: 'https://i.imgur.com/ZRDdP9S.png',
            skilldescription: 'Iruka deflects incoming attacks with his kunai, becoming invulnerable for 1 turn.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'], effects: [{
                type: 'apply_status', statusId: 'invulnerable', duration: 1, scope: 'target',
                metadata: { helpful: true, invulnerable: true, tooltipText: 'This character is invulnerable.' },
            }],
        },
    ],
};
