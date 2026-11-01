const AIR_CUTTER_FOLLOW_UP = 'zaku_abumi_air_cutter_follow_up';

module.exports = {
    id: 'zaku-abumi', characterId: 'zaku-abumi', name: 'Abumi Zaku',
    facePicture: 'https://i.imgur.com/1hP3uis.png',
    characterdeescription: 'Abumi Zaku is one of the three sound genin sent to the chuunin exams. He was surgically altered with hollow tubes in his arms, allowing him to create waves of compressed air.',
    requiredMissionId: 'chuunin-exam-the-forest-of-death',
    passive: {
        name: 'Sound Trio',
        icon: 'https://www.animehistory.org/uploads/screencaps/naruto-episode-051-a-shadow-in-darkness-danger-approaches-sasuke/cap_09-45_1865.jpg',
        description: "When an enemy uses a skill with increased cost, this character's physical damage is increased by 5 for one turn.",
        onEnemyIncreasedCostSkillApplyStatusToSelf: {
            statusId: 'sound_trio_physical_bonus', duration: 1,
            metadata: { helpful: true, damageBonusBySkillClass: { physical: 5 },
                tooltipText: 'This character deals 5 additional physical damage.' },
        },
    },
    skills: [
        {
            id: 'zaku-abumi-air-cutter', name: 'Air Cutter',
            skillimage: 'https://i.imgur.com/mUBqjVI.png',
            skilldescription: 'Zaku deals 20 physical damage to an enemy. Extreme Air Cutter may be used for 1 turn.',
            energy: ['Bloodline'], target: 'single-enemy', damage: 0, cooldown: 0,
            classes: ['Physical', 'Instant'],
            effects: [
                { type: 'damage', amount: 20, scope: 'target' },
                { type: 'apply_status', statusId: AIR_CUTTER_FOLLOW_UP, duration: 1, scope: 'self',
                    metadata: { helpful: true, turnDurationAnchor: 'source_turn',
                        tooltipText: 'Extreme Air Cutter may be used.' } },
            ],
        },
        {
            id: 'zaku-abumi-sound-wall', name: 'Sound Wall',
            skillimage: 'https://i.imgur.com/fjsUpgG.png',
            skilldescription: 'Zaku will counter the first physical skill used on his team for 1 turn. If a skill is countered, he will gain 1 Bloodline chakra. This skill is invisible and ends if Zaku dies.',
            energy: ['Bloodline'], target: 'all-allies', damage: 0, cooldown: 2,
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: 'zaku_abumi_sound_wall', duration: 1,
                scope: 'all-allies', metadata: {
                    helpful: true, invisible: true, hideTooltipFromEnemy: true,
                    turnDurationAnchor: 'source_turn', removeOnSourceDeath: true,
                    triggerOnEnemyHarmfulSkillClassesAny: ['Physical'], counterCancelsSkill: true,
                    statusGroupId: 'zaku_abumi_sound_wall', removeStatusGroupIdOnTrigger: 'zaku_abumi_sound_wall',
                    counterEffectsToSourceOwner: [
                        { type: 'gain_chakra', chakraType: 'bloodline', amount: 1 },
                    ],
                    tooltipText: 'The first physical skill used on Zaku\'s team will be countered and Zaku will gain 1 Bloodline chakra.',
                } }],
        },
        {
            id: 'zaku-abumi-extreme-air-cutter', name: 'Extreme Air Cutter',
            skillimage: 'https://i.imgur.com/Be54D9f.png',
            skilldescription: 'Requires Air Cutter. Zaku deals 45 physical damage to all enemies.',
            energy: ['Bloodline', 'Random', 'Random'], target: 'all-enemy', damage: 0, cooldown: 0,
            actorCondition: { statusId: AIR_CUTTER_FOLLOW_UP },
            classes: ['Physical', 'Instant'],
            effects: [{ type: 'damage', amount: 45, scope: 'all-enemy' }],
        },
        {
            id: 'zaku-abumi-sound-deflection', name: 'Sound Deflection',
            skillimage: 'https://i.imgur.com/cTyqfr0.png',
            skilldescription: 'Makes Abumi Zaku invulnerable for 1 turn.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: 'zaku_abumi_sound_deflection',
                duration: 1, scope: 'self', metadata: {
                    helpful: true, invulnerable: true,
                    tooltipText: 'Zaku is invulnerable.',
                } }],
        },
    ],
};
