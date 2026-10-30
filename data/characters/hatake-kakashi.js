module.exports = {
    id: 'hatake-kakashi',
    characterId: 'hatake-kakashi',
    name: 'Hatake Kakashi',
    facePicture: 'https://i.imgur.com/wmmoCGJ.png',
    characterdeescription: 'The squad leader of Team 7, known as the Copy Ninja, Kakashi is a man who puts the lives of his teammates above all else. He can copy enemy abilities with his Sharingan and finish a fight with his own Raikiri.',
    requiredMissionId: 'team-7-fights-as-a-team',
    passive: {
        name: 'Copy Ninja',
        icon: 'https://i.imgur.com/xg8yXfM.png',
        description: 'When Sharingan Insight counters a skill, Kakashi copies it for 1 turn at a cost of 1 Random chakra. Unique skills and skills requiring preparation cannot be copied.',
    },
    skills: [
        {
            id: 'hatake-kakashi-sharingan-counter',
            name: 'Sharingan Insight',
            skillimage: 'https://i.imgur.com/wrowrxL.png',
            skilldescription: 'Kakashi reveals hidden enemy effects for 1 turn and invisibly counters the first harmful skill used against him during this time. Copy Ninja may replace this skill with the countered skill for 1 turn.',
            energy: ['Bloodline'], target: 'self', damage: 0, cooldown: 2,
            classes: ['Strategic', 'Instant', 'Unique'],
            effects: [
                {
                    type: 'apply_status', statusId: 'kakashi_sharingan_reveal', duration: 1, scope: 'self',
                    metadata: {
                        helpful: true, revealInvisibleSkills: true, hideTooltipFromEnemy: true,
                        tooltipText: 'Kakashi can see hidden enemy effects.',
                    },
                },
                {
                    type: 'apply_status', statusId: 'kakashi_sharingan_insight', duration: 1, scope: 'self',
                    metadata: {
                        helpful: true, invisible: true, hideTooltipFromEnemy: true,
                        triggerOnEnemyHarmfulSkill: true,
                        counterCancelsSkill: true,
                        counterCopySkillReplacementFor: 'hatake-kakashi-sharingan-counter',
                        counterCopySkillReplacementDuration: 1,
                        counterCopyRequiresPassiveName: 'Copy Ninja',
                        counterCopyExcludeUniqueAndPreparation: true,
                        counterCopiedSkillEnergy: ['Random'],
                        tooltipText: 'Kakashi counters the first harmful skill used against him. Copy Ninja can then copy that skill.',
                    },
                },
            ],
        },
        {
            id: 'hatake-kakashi-summoning-ninja-dogs',
            name: 'Nin-Dogs Summoning',
            skillimage: 'https://i.imgur.com/PFMVHdp.png',
            skilldescription: 'Kakashi deals 20 physical damage to one enemy and stuns their Physical skills for 1 turn. Nin-Dogs Summoning becomes Raikiri for 1 turn, costing 1 Ninjutsu and 1 Random chakra.',
            energy: ['Ninjutsu'], target: 'single-enemy', damage: 0, cooldown: 2,
            classes: ['Strategic', 'Instant'],
            effects: [
                { type: 'damage', amount: 20, scope: 'target', metadata: { skillClasses: ['Physical'] } },
                {
                    type: 'apply_status', statusId: 'kakashi_nin_dogs_stun', duration: 1, scope: 'target',
                    metadata: {
                        harmful: true, cannotUseSkillClasses: ['physical'], turnDurationAnchor: 'source_turn',
                        tooltipText: 'This character cannot use Physical skills.',
                    },
                },
                {
                    type: 'apply_status', statusId: 'kakashi_nin_dogs_raikiri_ready', duration: 1, scope: 'self',
                    metadata: {
                        helpful: true, turnDurationAnchor: 'source_turn',
                        skillReplacements: { 'hatake-kakashi-summoning-ninja-dogs': 'hatake-kakashi-raikiri' },
                        skillCostOverridesBySkillId: { 'hatake-kakashi-raikiri': { energy: ['Ninjutsu', 'Random'] } },
                        tooltipText: 'Nin-Dogs Summoning is replaced by Raikiri for 1 turn. It costs 1 Ninjutsu and 1 Random chakra.',
                    },
                },
            ],
        },
        {
            id: 'hatake-kakashi-earth-style-headhunter-jutsu',
            name: 'Earth Style: Headhunter Jutsu',
            skillimage: 'https://i.imgur.com/m9r8Dpo.png',
            skilldescription: 'Kakashi deals 20 physical damage to one enemy and stuns their Chakra and Strategic skills for 1 turn. This skill becomes Raikiri for 1 turn, costing 1 Taijutsu and 1 Random chakra.',
            energy: ['Taijutsu'], target: 'single-enemy', damage: 0, cooldown: 2,
            classes: ['Physical', 'Instant'],
            effects: [
                { type: 'damage', amount: 20, scope: 'target' },
                {
                    type: 'apply_status', statusId: 'kakashi_headhunter_stun', duration: 1, scope: 'target',
                    metadata: {
                        harmful: true, cannotUseSkillClasses: ['chakra', 'strategic'], turnDurationAnchor: 'source_turn',
                        tooltipText: 'This character cannot use Chakra or Strategic skills.',
                    },
                },
                {
                    type: 'apply_status', statusId: 'kakashi_headhunter_raikiri_ready', duration: 1, scope: 'self',
                    metadata: {
                        helpful: true, turnDurationAnchor: 'source_turn',
                        skillReplacements: { 'hatake-kakashi-earth-style-headhunter-jutsu': 'hatake-kakashi-raikiri' },
                        skillCostOverridesBySkillId: { 'hatake-kakashi-raikiri': { energy: ['Taijutsu', 'Random'] } },
                        tooltipText: 'Headhunter Jutsu is replaced by Raikiri for 1 turn. It costs 1 Taijutsu and 1 Random chakra.',
                    },
                },
            ],
        },
        {
            id: 'hatake-kakashi-defender',
            name: 'Defender',
            skillimage: 'https://i.imgur.com/kB9dl7E.png',
            skilldescription: 'Kakashi defends the mission, becoming invulnerable for 1 turn.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [{
                type: 'apply_status', statusId: 'invulnerable', duration: 1, scope: 'self',
                metadata: { helpful: true, invulnerable: true, tooltipText: 'This character is invulnerable.' },
            }],
        },
        {
            id: 'hatake-kakashi-raikiri',
            name: 'Raikiri',
            skillimage: 'https://i.imgur.com/CVE7tBQ.png',
            skilldescription: 'Kakashi deals 45 piercing damage to one enemy.',
            energy: ['Ninjutsu', 'Taijutsu'], target: 'single-enemy', damage: 0, cooldown: 0,
            classes: ['Chakra', 'Instant'], hiddenFromSelectionViewer: true, requiresPreparation: true,
            effects: [{ type: 'damage', amount: 45, scope: 'target', metadata: { ignoreDamageReduction: true } }],
        },
    ],
};
