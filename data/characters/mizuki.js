module.exports = {
    id: 'mizuki', characterId: 'mizuki', name: 'Mizuki',
    facePicture: 'https://i.imgur.com/4MCaK7l.png', requiredMissionId: 'a-dishonored-shinobi',
    characterdeescription: "An instructor at the Hidden Leaf's Ninja Academy, Mizuki conceals his hunger for power beneath a sympathetic demeanor. Hoping to steal the forbidden Scroll of Seals, he manipulates Naruto's desire to become a ninja, only to have his betrayal exposed by Iruka.",
    passive: { name: 'Meld in the Shadows', icon: 'https://i.imgur.com/JDdDwn0.png',
        description: "Mizuki's damaging skills deal 5 additional damage to enemies who use a non-damaging skill that turn.",
        bonusAgainstNonDamagingSkillUser: 5 },
    skills: [
        {
            id: 'mizuki-kunai-ambush', name: 'Kunai Ambush', skillimage: 'https://i.imgur.com/oTFkPZG.png',
            skilldescription: 'Mizuki attacks one enemy with a barrage of kunai, dealing 15 physical damage. For 1 turn, the next helpful skill that enemy uses is countered.',
            energy: ['Random'], target: 'single-enemy', damage: 0, cooldown: 1,
            classes: ['Physical', 'Instant'], effects: [
                { type: 'damage', amount: 15, scope: 'target' },
                { type: 'apply_status', statusId: 'mizuki_kunai_ambush_trap', duration: 1, scope: 'target',
                    metadata: { harmful: true, triggerOnOwnerHelpfulSkill: true,
                        counterCancelsSkill: true, turnDurationAnchor: 'source_turn',
                        tooltipText: 'The next helpful skill this character uses is countered.' } },
            ],
        },
        {
            id: 'mizuki-execution-shuriken', name: 'Execution Shuriken',
            skillimage: 'https://i.imgur.com/O3Y4Q29.png',
            skilldescription: 'Mizuki hurls a giant shuriken at one enemy, dealing 30 physical damage. During Windmill, this skill instead deals 20 physical damage to all enemies, and Windmill ends.',
            energy: ['Taijutsu', 'Random'], target: 'single-enemy', damage: 0, cooldown: 1,
            classes: ['Physical', 'Instant'], effects: [{ type: 'damage', amount: 30, scope: 'target' }],
        },
        {
            id: 'mizuki-windmill', name: 'Windmill', skillimage: 'https://i.imgur.com/jETOs8w.png',
            skilldescription: 'Mizuki prepares his giant shuriken for a sweeping attack. For 2 turns, his next Execution Shuriken affects all enemies.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 2,
            classes: ['Strategic', 'Instant', 'Physical*'], effects: [
                { type: 'apply_status', statusId: 'mizuki_windmill', duration: 2, scope: 'self',
                    metadata: { helpful: true,
                        skillReplacements: { 'mizuki-execution-shuriken': 'mizuki-execution-shuriken-windmill' },
                        removeSelfOnSkillUseSkillIds: ['mizuki-execution-shuriken-windmill'],
                        tooltipText: 'The next Execution Shuriken hits all enemies, then Windmill ends.' } },
            ],
        },
        {
            id: 'mizuki-effortless-side-step', name: 'Effortless Side-step',
            skillimage: 'https://i.imgur.com/jP0RmHY.png',
            skilldescription: 'Mizuki becomes invulnerable for 1 turn.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 0,
            classes: ['Strategic', 'Instant'], effects: [
                { type: 'apply_status', statusId: 'mizuki_effortless_side_step', duration: 1, scope: 'self',
                    metadata: { helpful: true, invulnerable: true, tooltipText: 'Mizuki is invulnerable.' } },
            ],
        },
        {
            id: 'mizuki-execution-shuriken-windmill', baseSkillId: 'mizuki-execution-shuriken', useBaseSkillCooldown: true,
            hiddenFromSelectionViewer: true, name: 'Execution Shuriken',
            skillimage: 'https://i.imgur.com/O3Y4Q29.png',
            skilldescription: 'Mizuki deals 20 physical damage to all enemies, ending Windmill.',
            energy: ['Taijutsu', 'Random'], target: 'all-enemy', damage: 0, cooldown: 1,
            classes: ['Physical', 'Instant'], effects: [
                { type: 'damage', amount: 20, scope: 'all-enemy' },
                { type: 'remove_status', statusId: 'mizuki_windmill', scope: 'self' },
            ],
        },
    ],
};
