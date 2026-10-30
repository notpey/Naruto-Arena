module.exports = {
    id: 'inuzuka-kiba',
    characterId: 'inuzuka-kiba',
    name: 'Inuzuka Kiba',
    facePicture: 'https://i.imgur.com/1uY4Ta3.png',
    characterdeescription: 'A headstrong and competitive genin of Team 8, Kiba relies on the Inuzuka clan\'s heightened senses and ferocious fighting techniques to overwhelm his opponents. Confident in his abilities and eager to prove his strength, he charges into battle with reckless enthusiasm.',
    passive: {
        name: 'Heightened Senses', icon: 'https://i.imgur.com/0ctBe2q.png',
        description: 'Kiba can see invisible enemy skills.',
        revealInvisibleSkills: true,
    },
    skills: [
        {
            id: 'inuzuka-kiba-dynamic-air-marking', name: 'Dynamic Air Marking',
            skillimage: 'https://i.imgur.com/ImizG0d.png',
            skilldescription: 'Kiba marks an enemy for 4 turns. During this time, they cannot reduce incoming damage or become invulnerable, and their counter effects are ignored. This skill cannot be used on an enemy already affected by it.',
            energy: [], target: 'single-enemy', damage: 0, cooldown: 0,
            classes: ['Strategic', 'Instant'],
            targetCondition: { missingStatusId: 'inuzuka_kiba_dynamic_air_marking' },
            effects: [{
                type: 'apply_status', statusId: 'inuzuka_kiba_dynamic_air_marking', duration: 4,
                scope: 'target', metadata: {
                    harmful: true, cannotReduceDamage: true, cannotBecomeInvulnerable: true,
                    ignoreCounters: true, turnDurationAnchor: 'source_turn',
                    tooltipText: 'This character cannot reduce incoming damage or become invulnerable, and their counter effects are ignored.',
                },
            }],
        },
        {
            id: 'inuzuka-kiba-garouga', name: 'Garouga',
            skillimage: 'https://i.imgur.com/2zAwPJv.png',
            skilldescription: 'Kiba deals 30 physical damage to one enemy. If they are affected by Dynamic Air Marking, Garouga costs 1 less random chakra for 1 turn.',
            energy: ['Taijutsu', 'Random'], target: 'single-enemy', damage: 0, cooldown: 0,
            classes: ['Physical', 'Instant'],
            effects: [
                { type: 'damage', amount: 30, scope: 'target' },
                {
                    type: 'apply_status', statusId: 'inuzuka_kiba_garouga_discount',
                    duration: 1, scope: 'self',
                    condition: { scope: 'target', statusId: 'inuzuka_kiba_dynamic_air_marking' },
                    metadata: {
                        helpful: true, skillCostOverridesBySkillId: {
                            'inuzuka-kiba-garouga': { energy: ['Taijutsu'] },
                        },
                        tooltipText: 'Garouga costs 1 less random chakra for 1 turn.',
                    },
                },
            ],
        },
        {
            id: 'inuzuka-kiba-double-headed-wolf', name: 'Double Headed Wolf',
            skillimage: 'https://i.imgur.com/rfOPouH.png',
            skilldescription: 'Kiba and all allies become invulnerable to enemy physical skills for 1 turn. The following turn, Garouga is replaced by Double Garouga.',
            energy: ['Bloodline'], target: 'all-allies', damage: 0, cooldown: 3,
            classes: ['Strategic', 'Instant'],
            effects: [
                {
                    type: 'apply_status', statusId: 'inuzuka_kiba_double_headed_wolf_protection',
                    duration: 1, scope: 'all-allies', metadata: {
                        helpful: true, invulnerableToSkillClasses: ['physical'],
                        tooltipText: 'This character is invulnerable to enemy physical skills.',
                    },
                },
                {
                    type: 'apply_status', statusId: 'inuzuka_kiba_double_headed_wolf_form',
                    duration: 1, scope: 'self', metadata: {
                        helpful: true, skillReplacements: {
                            'inuzuka-kiba-garouga': 'inuzuka-kiba-double-garouga',
                        },
                        tooltipText: 'Garouga is replaced by Double Garouga next turn.',
                    },
                },
            ],
        },
        {
            id: 'inuzuka-kiba-smoke-bomb', name: 'Smoke Bomb',
            skillimage: 'https://i.imgur.com/DHgVzdv.png',
            skilldescription: 'Kiba becomes invulnerable for 1 turn.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [{
                type: 'apply_status', statusId: 'inuzuka_kiba_smoke_bomb', duration: 1,
                scope: 'self', metadata: { helpful: true, invulnerable: true,
                    tooltipText: 'This character is invulnerable.' },
            }],
        },
        {
            id: 'inuzuka-kiba-double-garouga', name: 'Double Garouga',
            skillimage: 'https://i.imgur.com/jLD3s0g.png',
            skilldescription: 'Kiba deals 30 physical damage to one enemy and 30 physical damage to a different random enemy. If either is affected by Dynamic Air Marking, Garouga costs 1 less random chakra for 1 turn.',
            energy: ['Taijutsu', 'Random'], target: 'single-enemy', damage: 0, cooldown: 0,
            classes: ['Physical', 'Instant'],
            effects: [
                { type: 'damage', amount: 30, scope: 'target' },
                { type: 'damage', amount: 30, scope: 'random-other-enemy',
                    metadata: { randomScopeGroupKey: 'kiba_double_garouga_secondary' } },
                {
                    type: 'apply_status', statusId: 'inuzuka_kiba_garouga_discount',
                    duration: 1, scope: 'self',
                    condition: { scope: 'target', statusId: 'inuzuka_kiba_dynamic_air_marking' },
                    metadata: {
                        helpful: true, skillCostOverridesBySkillId: {
                            'inuzuka-kiba-garouga': { energy: ['Taijutsu'] },
                        },
                        tooltipText: 'Garouga costs 1 less random chakra for 1 turn.',
                    },
                },
                {
                    type: 'apply_status', statusId: 'inuzuka_kiba_garouga_discount',
                    duration: 1, scope: 'random-other-enemy', applyToSource: true,
                    condition: { scope: 'target', statusId: 'inuzuka_kiba_dynamic_air_marking' },
                    metadata: {
                        helpful: true, randomScopeGroupKey: 'kiba_double_garouga_secondary',
                        skillCostOverridesBySkillId: {
                            'inuzuka-kiba-garouga': { energy: ['Taijutsu'] },
                        },
                        tooltipText: 'Garouga costs 1 less random chakra for 1 turn.',
                    },
                },
            ],
        },
    ],
};
