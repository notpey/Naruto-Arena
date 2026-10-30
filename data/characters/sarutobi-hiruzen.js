module.exports = {
    id: 'sarutobi-hiruzen',
    characterId: 'sarutobi-hiruzen',
    name: 'Hokage Hiruzen',
    facePicture: 'https://i.imgur.com/fxZCWtI.png',
    characterdeescription: 'The Third Hokage of Konohagakure, Hiruzen Sarutobi is a respected village leader responsible for guiding its shinobi and overseeing their missions. Despite his advanced age and legendary reputation, Hiruzen spends much of his time attending to village affairs, observing Naruto\'s antics, and ensuring the next generation receives the guidance it needs.',
    requiredMissionId: 'the-god-of-the-shinobi',
    passive: {
        name: 'Will of Fire',
        icon: 'https://i.imgur.com/44tJLMZ.png',
        description: "Hiruzen and his allies' damaging skills deal 5 additional non-affliction damage while they have destructible defense.",
        teamNonAfflictionDamageBonusWhileDestructibleDefense: 5,
    },
    skills: [
        {
            id: 'sarutobi-hiruzen-crystal-ball-technique',
            name: 'Crystal Ball Technique',
            skillimage: 'https://i.imgur.com/yubcK01.png',
            skilldescription: 'Hiruzen reveals one enemy’s hidden skills for 2 turns. During this time, the first harmful skill that enemy uses against Hiruzen or his allies deals 10 less non-affliction damage, and Search Party deals 15 additional piercing damage to them.',
            energy: ['Random'], target: 'single-enemy', damage: 0, cooldown: 1,
            classes: ['Strategic', 'Instant'],
            effects: [
                { type: 'apply_status', statusId: 'sarutobi_hiruzen_crystal_ball_observation',
                    duration: 2, scope: 'target', metadata: {
                        harmful: true, revealInvisibleSkillsToSourceTeam: true,
                        turnDurationAnchor: 'source_turn',
                        tooltipText: 'Hiruzen can see this character\'s hidden effects. Search Party deals 15 additional piercing damage to this character.',
                    } },
                { type: 'apply_status', statusId: 'sarutobi_hiruzen_crystal_ball_suppression',
                    duration: 2, scope: 'target', metadata: {
                        harmful: true, firstHarmfulSkillAgainstSourceTeamNonAfflictionReductionFlat: 10,
                        turnDurationAnchor: 'source_turn',
                        tooltipText: 'The first harmful skill this character uses against Hiruzen\'s team deals 10 less non-affliction damage.',
                    } },
            ],
        },
        {
            id: 'sarutobi-hiruzen-mission-assignment',
            name: 'Mission Assignment',
            skillimage: 'https://i.imgur.com/ABkaTAl.png',
            skilldescription: 'Hiruzen grants himself or one ally 15 destructible defense for 2 turns. Their next single-target damaging skill during this time deals 10 additional non-affliction damage.',
            energy: ['Random'], target: 'self-or-single-ally', damage: 0, cooldown: 1,
            classes: ['Strategic', 'Instant'],
            effects: [
                { type: 'apply_status', statusId: 'sarutobi_hiruzen_mission_assignment_defense',
                    duration: 2, scope: 'target', metadata: {
                        helpful: true, destructibleDefensePoints: 15,
                        tooltipTextTemplate: 'This character has {destructibleDefensePoints} destructible defense from Mission Assignment.',
                    } },
                { type: 'apply_status', statusId: 'sarutobi_hiruzen_mission_assignment_bonus',
                    duration: 2, scope: 'target', metadata: {
                        helpful: true, nextSingleTargetNonAfflictionDamageBonusFlat: 10,
                        tooltipText: 'The next single-target damaging skill deals 10 additional non-affliction damage.',
                    } },
            ],
        },
        {
            id: 'sarutobi-hiruzen-search-party',
            name: 'Search Party',
            skillimage: 'https://i.imgur.com/OdtmZna.png',
            skilldescription: 'Hiruzen deals 20 physical damage to one enemy. If that enemy is affected by Crystal Ball Technique, this skill also deals 15 piercing damage.',
            energy: ['Random'], target: 'single-enemy', damage: 0, cooldown: 1,
            classes: ['Physical', 'Instant'],
            effects: [
                { type: 'damage', amount: 20, scope: 'target' },
                { type: 'damage', amount: 15, scope: 'target',
                    condition: { scope: 'target', statusId: 'sarutobi_hiruzen_crystal_ball_observation', statusFromActor: true },
                    metadata: { ignoreDamageReduction: true, ignoreDestructibleDefense: true,
                        skillClasses: ['Piercing'] } },
            ],
        },
        {
            id: 'sarutobi-hiruzen-hokages-guard',
            name: "Hokage's Guard",
            skillimage: 'https://i.imgur.com/fJmy67o.png',
            skilldescription: 'Sarutobi Hiruzen becomes invulnerable for 1 turn.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [
                { type: 'apply_status', statusId: 'sarutobi_hiruzen_hokages_guard',
                    duration: 1, scope: 'self', metadata: {
                        helpful: true, invulnerable: true,
                        tooltipText: 'Hokage Hiruzen is invulnerable.',
                    } },
            ],
        },
    ],
};
