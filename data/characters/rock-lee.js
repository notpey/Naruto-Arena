const GATES = 'rock_lee_gate_openings';
const WEIGHTS = 'rock_lee_training_weights_removed';
const FIFTH_USED = 'rock_lee_fifth_gate_used';
const HIGH_SPEED = 'rock-lee-high-speed-taijutsu';
const FRONT_LOTUS = 'rock-lee-front-lotus';
const FINAL_LOTUS = 'rock-lee-final-lotus';
const FOLLOW_UP = 'rock-lee-high-speed-follow-up';
const WEIGHT_SKILL = 'rock-lee-remove-training-weights';

const gateCondition = (value) => ({
    statusMetadataAtLeast: { statusId: GATES, metadataKey: 'gateCount', value },
});
const firstFifthGate = { all: [gateCondition(5), { missingStatusId: FIFTH_USED }] };
const fifthGateEffects = () => [
    { type: 'cleanse_statuses', scope: 'self', harmfulOnly: true, condition: firstFifthGate },
    { type: 'gain_chakra', scope: 'self', chakraType: 'taijutsu', amount: 1,
        condition: firstFifthGate },
    { type: 'damage', scope: 'self', amount: 50, condition: firstFifthGate,
        metadata: { afflictionDamage: true, minimumHp: 1, skillClasses: ['Affliction'] } },
    { type: 'apply_status', scope: 'self', statusId: 'rock_lee_fifth_gate_invulnerable',
        duration: 1, condition: firstFifthGate,
        metadata: { helpful: true, invulnerable: true,
            tooltipText: 'Lee is invulnerable for 1 turn.' } },
    { type: 'apply_status', scope: 'self', statusId: FIFTH_USED, duration: 99,
        condition: firstFifthGate, metadata: { helpful: true,
            tooltipText: 'Lee has opened his fifth Gate.' } },
];
const physicalDefense = {
    type: 'apply_status', scope: 'self', statusId: 'rock_lee_high_speed_physical_invulnerable',
    duration: 1, metadata: { helpful: true, invulnerableToPhysicalSkills: true,
        tooltipText: 'Lee is invulnerable to physical skills.' },
};
const gateDamage = (amount) => ({
    type: 'damage', amount, scope: 'target',
    metadata: { bonusPerStatusMetadata: {
        scope: 'self', statusId: GATES, metadataKey: 'gateCount', multiplier: 5,
    } },
});

module.exports = {
    id: 'rock-lee', characterId: 'rock-lee', name: 'Rock Lee',
    facePicture: 'https://i.imgur.com/LUA3QK2.jpg',
    characterdeescription: 'A hardworking genin of Team Guy, Rock Lee lacks the ability to use ninjutsu or genjutsu and has devoted himself entirely to mastering taijutsu. Through relentless training and unwavering determination, he seeks to prove that hard work can overcome natural talent.',
    passive: {
        name: 'Gate Opening', icon: 'https://i.imgur.com/P9VlwlX.jpg',
        description: 'Whenever Lee uses a physical skill, he opens 1 Gate, up to 5 times. Each Gate Opening increases his physical damage by 5. Upon opening his fifth Gate, Lee cleanses himself, gains 1 taijutsu chakra, takes 50 affliction damage that cannot kill him, and becomes invulnerable for 1 turn.',
    },
    startStatuses: [{
        statusId: 'rock_lee_gate_opening_trigger', duration: 99,
        metadata: {
            permanent: true, cannotBeCleansed: true, hideTooltip: true,
            onOwnerUseSkillTrigger: true,
            preserveOnOwnerUseSkillTrigger: true,
            onOwnerUseSkillClassesAny: ['Physical'],
            onOwnerUseSkillApplyStatusToOwner: {
                statusId: GATES, duration: 99,
                metadata: {
                    helpful: true, cannotBeCleansed: true, stackMetadataKey: 'gateCount',
                    stackDelta: 1, stackMax: 5,
                    stackDerivedNumericKeys: { gateDamageBonus: 5 },
                    tooltipTextTemplate: 'Lee has opened {gateCount} Gates and deals {gateDamageBonus} additional physical damage.',
                    applyStatusAtStack: {
                        metadataKey: 'gateCount', value: 5,
                        statusId: 'rock_lee_fifth_gate_skills', duration: 99,
                        metadata: {
                            helpful: true, cannotBeCleansed: true,
                            onOwnerKillSourceSkillIdsAny: [FINAL_LOTUS],
                            onOwnerKillTargetRelation: 'enemy',
                            onOwnerKillGainChakra: { chakraType: 'taijutsu', amount: 1 },
                            onOwnerKillApplyStatusToSelf: {
                                statusId: 'rock_lee_final_lotus_immortal', duration: 1,
                                metadata: { helpful: true, minimumHp: 1,
                                    tooltipText: 'Lee cannot be killed for 1 turn.' },
                            },
                            skillCooldownOverridesBySkillId: {
                                [HIGH_SPEED]: 0, [FRONT_LOTUS]: 0,
                            },
                            skillReplacements: { [WEIGHT_SKILL]: FINAL_LOTUS },
                            tooltipText: 'High Speed Taijutsu and Front Lotus have no cooldown. Remove Training Weights is replaced by Final Lotus.',
                        },
                    },
                },
            },
        },
    }],
    skills: [
        {
            id: HIGH_SPEED, name: 'High Speed Taijutsu',
            skillimage: 'https://i.imgur.com/roHIgPj.jpg',
            skilldescription: 'Lee deals 25 physical damage to one enemy and becomes invulnerable to physical skills for 1 turn. On the following turn, this skill can be used again for 1 random chakra. At 3 or more Gate Openings, its first use costs 1 less random chakra. At 5 Gate Openings, this skill has no cooldown.',
            energy: ['Taijutsu', 'Random'],
            energyBySourceStatusMetadata: { statusId: GATES, metadataKey: 'gateCount',
                tiers: [{ min: 3, energy: ['Taijutsu'] }] },
            target: 'single-enemy', damage: 0, cooldown: 2,
            classes: ['Physical', 'Instant'],
            effects: [
                ...fifthGateEffects(), gateDamage(25),
                physicalDefense,
                { type: 'apply_status', scope: 'self', statusId: 'rock_lee_high_speed_follow_up',
                    duration: 1, metadata: { helpful: true, turnDurationAnchor: 'source_turn',
                        skillReplacements: { [HIGH_SPEED]: FOLLOW_UP },
                        tooltipText: 'High Speed Taijutsu can be used again next turn for 1 random chakra.' } },
            ],
        },
        {
            id: FRONT_LOTUS, name: 'Front Lotus',
            skillimage: 'https://i.imgur.com/xTW0rSg.jpg',
            skilldescription: 'Lee deals 45 physical damage to one enemy. At 3 or more Gate Openings, this skill costs 1 taijutsu chakra and 1 random chakra. At 5 Gate Openings, this skill has no cooldown.',
            energy: ['Taijutsu', 'Taijutsu'],
            energyBySourceStatusMetadata: { statusId: GATES, metadataKey: 'gateCount',
                tiers: [{ min: 3, energy: ['Taijutsu', 'Random'] }] },
            target: 'single-enemy', damage: 0, cooldown: 2,
            classes: ['Physical', 'Instant'],
            effects: [...fifthGateEffects(), gateDamage(45)],
        },
        {
            id: WEIGHT_SKILL, name: 'Remove Training Weights',
            skillimage: 'https://www.animehistory.org/uploads/screencaps/naruto-episode-048-gaara-vs-rock-lee-the-power-of-youth-explodes_/cap_13-42_678c.jpg',
            skilldescription: 'Lee removes his training weights, causing his physical skills to deal 10 less damage but ignore counters, reflects, and invulnerability for the rest of the battle. Lee also gains 1 taijutsu chakra. This skill cannot be used while active. At 5 Gate Openings, this skill is replaced by Final Lotus.',
            energy: [], target: 'self', damage: 0, cooldown: 0,
            actorCondition: { missingStatusId: WEIGHTS },
            classes: ['Strategic', 'Instant'],
            effects: [
                { type: 'apply_status', scope: 'self', statusId: WEIGHTS, duration: 99,
                    metadata: {
                        helpful: true, permanent: true,
                        damageDebuffBySkillClass: { physical: 10 },
                        uncounterableSkillIds: [HIGH_SPEED, FOLLOW_UP, FRONT_LOTUS, FINAL_LOTUS],
                        unreflectableSkillIds: [HIGH_SPEED, FOLLOW_UP, FRONT_LOTUS, FINAL_LOTUS],
                        ignoreInvulnerabilityForSkillIds: [HIGH_SPEED, FOLLOW_UP, FRONT_LOTUS, FINAL_LOTUS],
                        tooltipText: 'Lee deals 10 less physical damage and ignores counters, reflects, and invulnerability with his physical skills.',
                    } },
                { type: 'gain_chakra', scope: 'self', chakraType: 'taijutsu', amount: 1 },
            ],
        },
        {
            id: 'rock-lee-lee-dodge', name: 'Lee Dodge',
            skillimage: 'https://www.animehistory.org/uploads/screencaps/naruto-episode-048-gaara-vs-rock-lee-the-power-of-youth-explodes_/cap_12-21_5fa6.jpg',
            skilldescription: 'Lee becomes invulnerable for 1 turn.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', scope: 'self', statusId: 'rock_lee_dodge',
                duration: 1, metadata: { helpful: true, invulnerable: true,
                    tooltipText: 'Lee is invulnerable.' } }],
        },
        {
            id: FINAL_LOTUS, name: 'Final Lotus', hiddenFromSelectionViewer: true,
            skillimage: 'https://www.animehistory.org/uploads/screencaps/naruto-episode-050-the-fifth-gate-a-splendid-ninja-is-born/cap_04-41_363a.jpg',
            skilldescription: 'Lee executes one enemy. If successful, he gains 1 taijutsu chakra and becomes immortal for 1 turn.',
            energy: ['Taijutsu', 'Taijutsu', 'Taijutsu'],
            target: 'single-enemy', damage: 0, cooldown: 1,
            classes: ['Physical', 'Instant'],
            effects: [...fifthGateEffects(), gateDamage(9999)],
        },
        {
            id: FOLLOW_UP, name: 'High Speed Taijutsu', hiddenFromSelectionViewer: true,
            skillimage: 'https://i.imgur.com/roHIgPj.jpg',
            skilldescription: 'Lee deals 25 physical damage to one enemy and becomes invulnerable to physical skills for 1 turn.',
            energy: ['Random'], target: 'single-enemy', damage: 0, cooldown: 0,
            classes: ['Physical', 'Instant'],
            effects: [...fifthGateEffects(), gateDamage(25),
                physicalDefense],
        },
    ],
};
