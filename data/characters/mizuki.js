module.exports = {
    id: 'mizuki', characterId: 'mizuki', name: 'Mizuki',
    facePicture: 'https://i.imgur.com/4MCaK7l.png', requiredMissionId: 'a-dishonored-shinobi',
    characterdeescription: "An instructor at the Hidden Leaf's Ninja Academy, Mizuki conceals his hunger for power beneath a sympathetic demeanor. Hoping to steal the forbidden Scroll of Seals, he manipulates Naruto's desire to become a ninja, only to have his betrayal exposed by Iruka.",
    passive: {
        name: 'Windmill', icon: 'https://i.imgur.com/JDdDwn0.png',
        description: 'Mizuki can use Execution Shuriken twice. If it kills an enemy, Mizuki becomes invulnerable for 1 turn and gains one additional use.',
        onOwnerKillSourceSkillIdsAny: ['mizuki-execution-shuriken'],
        onOwnerKillTargetRelation: 'enemy',
        onOwnerKillGrantSkillUse: { skillId: 'mizuki-execution-shuriken', amount: 1 },
        onOwnerKillApplyStatusToSelf: {
            // fresh: lasts through the enemy's next turn, not just Mizuki's own.
            statusId: 'mizuki_windmill_invulnerable', duration: 1, fresh: true,
            metadata: { helpful: true, invulnerable: true,
                tooltipText: 'Mizuki is invulnerable for 1 turn after an Execution Shuriken kill.' },
        },
    },
    skills: [
        {
            id: 'mizuki-kunai-ambush', name: 'Kunai Ambush', skillimage: 'https://i.imgur.com/oTFkPZG.png',
            skilldescription: 'Mizuki deals 20 physical damage to one enemy. Their next helpful skill is countered for 1 turn.',
            energy: ['Random'], target: 'single-enemy', damage: 0, cooldown: 1,
            classes: ['Physical', 'Instant'], effects: [
                { type: 'damage', amount: 20, scope: 'target' },
                { type: 'apply_status', statusId: 'mizuki_kunai_ambush_trap', duration: 1, scope: 'target',
                    metadata: { harmful: true, triggerOnOwnerHelpfulSkill: true,
                        counterCancelsSkill: true, turnDurationAnchor: 'source_turn',
                        tooltipText: 'The next helpful skill this character uses is countered.' } },
            ],
        },
        {
            id: 'mizuki-execution-shuriken', name: 'Execution Shuriken',
            skillimage: 'https://i.imgur.com/O3Y4Q29.png',
            skilldescription: 'Mizuki deals 30 physical damage to one enemy. If the target falls to 10 health or less, they are executed. This skill can be used twice, gaining one use for each kill it makes.',
            energy: ['Taijutsu', 'Random'], target: 'single-enemy', damage: 0, cooldown: 1,
            maxUses: 2, classes: ['Physical', 'Instant'],
            effects: [{ type: 'damage', amount: 30, scope: 'target',
                metadata: { executeBelowHpThreshold: 10 } }],
        },
        {
            id: 'mizuki-meld-in-the-shadows', name: 'Meld in the Shadows',
            skillimage: 'https://i.imgur.com/jETOs8w.png',
            skilldescription: 'Mizuki secretly counters the first Physical skill used against him for 1 turn. The countered enemy is then targeted by Kunai Ambush. This skill is invisible.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 2,
            classes: ['Strategic', 'Instant'], effects: [
                { type: 'apply_status', statusId: 'mizuki_meld_in_the_shadows', duration: 1, scope: 'self',
                    metadata: { helpful: true, invisible: true, hideTooltipFromEnemy: true,
                        triggerOnEnemyHarmfulSkillClassesAny: ['physical'],
                        counterCancelsSkill: true,
                        counterEffectsToAttacker: [
                            { type: 'damage', amount: 20 },
                            // Applied during the attacker's turn, so it needs 2 of Mizuki's turn ends
                            // to still be waiting on the attacker's next turn.
                            { type: 'apply_status', statusId: 'mizuki_kunai_ambush_trap', duration: 2,
                                metadata: { harmful: true, triggerOnOwnerHelpfulSkill: true,
                                    counterCancelsSkill: true, turnDurationAnchor: 'source_turn',
                                    tooltipText: 'The next helpful skill this character uses is countered.' } },
                        ],
                        tooltipText: 'For 1 turn, Mizuki counters the first Physical skill used against him, then hits the attacker with Kunai Ambush for 20 damage.' } },
            ],
        },
        {
            id: 'mizuki-effortless-side-step', name: 'Effortless Side-step',
            skillimage: 'https://i.imgur.com/jP0RmHY.png',
            skilldescription: 'Mizuki becomes invulnerable for 1 turn.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'], effects: [
                { type: 'apply_status', statusId: 'mizuki_effortless_side_step', duration: 1, scope: 'self',
                    metadata: { helpful: true, invulnerable: true,
                        tooltipText: 'Mizuki is invulnerable.' } },
            ],
        },
    ],
};
