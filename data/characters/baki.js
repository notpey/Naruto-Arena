const PASSIVE_ICON = 'https://i.imgur.com/Y7oszT6.png';
// No Witnesses: every damaging skill executes at 5 health, plus any per-enemy increase.
const witnessDamage = (amount) => ({
    type: 'damage', amount, scope: 'target',
    metadata: { ignoreDamageReduction: true, executeBelowHpThreshold: 5 },
});

module.exports = {
    id: 'baki', characterId: 'baki', name: 'Baki',
    facePicture: 'https://i.imgur.com/6LazJdG.png',
    characterdeescription: "A seasoned jonin of the Hidden Sand Village, Baki serves as the instructor of Gaara, Temari, and Kankuro during the Chuunin Exams. Cold and calculating, he specializes in deadly Wind Release techniques and carries out his village's secret missions with ruthless efficiency.",
    requiredMissionId: null,
    passive: {
        name: 'No Witnesses', icon: PASSIVE_ICON,
        description: "Baki's damaging skills execute enemies who fall to 5 health or less.",
    },
    skills: [
        {
            id: 'baki-sudden-strike', name: 'Sudden Strike',
            skillimage: 'https://i.imgur.com/FPdqxJa.png',
            skilldescription: 'Baki catches an enemy off guard, dealing 20 piercing chakra damage.',
            energy: ['Genjutsu'], target: 'single-enemy', damage: 0, cooldown: 0,
            classes: ['Chakra', 'Instant'],
            effects: [witnessDamage(20)],
        },
        {
            id: 'baki-wind-blade', name: 'Wind Blade',
            skillimage: 'https://i.imgur.com/f5uPqEh.png',
            skilldescription: 'Baki unleashes a razor-sharp blade of wind, dealing 40 piercing chakra damage to an enemy.',
            energy: ['Ninjutsu', 'Genjutsu'], target: 'single-enemy', damage: 0, cooldown: 0,
            classes: ['Chakra', 'Instant'],
            effects: [witnessDamage(40)],
        },
        {
            id: 'baki-flak-jacket', name: 'Flak Jacket',
            skillimage: 'https://i.imgur.com/LLtxU8O.png',
            skilldescription: 'Baki reinforces his defenses, gaining 50 destructible defense for 4 turns. While this defense remains, he ignores enemy non-damage effects. Enemies who use a physical or chakra skill on Baki during this time permanently have the execution threshold of No Witnesses increased by 5 against them.',
            energy: ['Random', 'Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: 'baki_flak_jacket', duration: 4, scope: 'self',
                metadata: {
                    helpful: true, destructibleDefensePoints: 50, activeOnlyWithDestructibleDefense: true,
                    ignoreHarmfulNonDamageEffects: true,
                    onEnemySkillTargetedHarmfulOnly: true,
                    onEnemySkillTargetedSkillClassesAny: ['Physical', 'Chakra'],
                    onEnemySkillTargetedApplyStatusToSource: {
                        statusId: 'baki_no_witnesses_threshold', duration: 99,
                        metadata: {
                            harmful: true, permanent: true, cannotBeCleansed: true,
                            executeThresholdBonusForSource: 5,
                            mergeNumericAddKeys: ['executeThresholdBonusForSource'],
                            statusIcon: PASSIVE_ICON, sourceSkillName: 'No Witnesses',
                            tooltipText: "Baki's No Witnesses executes this character at 5 more health for each physical or chakra skill they used on him during Flak Jacket.",
                        },
                    },
                    tooltipText: 'Baki has 50 destructible defense. While it remains, he ignores enemy non-damage effects, and enemies who use physical or chakra skills on him become easier to execute.',
                } }],
        },
        {
            id: 'baki-baki-teleportation', name: 'Baki Teleportation',
            skillimage: 'https://i.imgur.com/UxdiVF7.png',
            skilldescription: 'Baki swiftly evades incoming attacks, becoming invulnerable for 1 turn.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: 'baki_teleportation', duration: 1, scope: 'self',
                metadata: { helpful: true, invulnerable: true, tooltipText: 'Baki is invulnerable.' } }],
        },
    ],
};
