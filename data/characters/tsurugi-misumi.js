const JOINTS_PREP = 'tsurugi_misumi_flexible_twisting_joints';
const SOFT_MARK = 'tsurugi_misumi_soft_physique_mark';
const SOFT_REFLECT = 'tsurugi_misumi_soft_physique_reflect';
const PASSIVE_ICON = 'https://i.imgur.com/XAt3Ht4.png';

module.exports = {
    id: 'tsurugi-misumi', characterId: 'tsurugi-misumi', name: 'Tsurugi Misumi',
    facePicture: 'https://i.imgur.com/gI96GYe.png',
    characterdeescription: 'A deceptive genin of the Hidden Sound Village, Misumi possesses an unusually flexible body that allows him to twist and contort his limbs at will. Using his unnatural physique to entangle opponents and redirect incoming attacks, he specializes in immobilizing enemies before they can fight back.',
    requiredMissionId: null,
    passive: {
        name: 'Twisted Advantage', icon: PASSIVE_ICON,
        description: "Whenever Misumi reflects an enemy's physical skill with Soft Physique Modification, he gains 1 random chakra.",
    },
    skills: [
        {
            id: 'tsurugi-misumi-flexible-twisting-joints', name: 'Flexible Twisting Joints',
            skillimage: 'https://i.imgur.com/363kxVX.png',
            skilldescription: 'Misumi twists his body to strike an enemy, dealing 15 physical damage. Tighten Joints can be used on the target for 1 turn.',
            energy: ['Random'], target: 'single-enemy', damage: 0, cooldown: 0,
            classes: ['Physical', 'Instant'],
            effects: [
                { type: 'damage', amount: 15, scope: 'target' },
                { type: 'apply_status', statusId: JOINTS_PREP, duration: 1, scope: 'target',
                    metadata: { harmful: true, turnDurationAnchor: 'source_turn',
                        tooltipText: 'Tighten Joints can be used on this character.' } },
            ],
        },
        {
            id: 'tsurugi-misumi-soft-physique-modification', name: 'Soft Physique Modification',
            skillimage: 'https://i.imgur.com/4kSRPt1.png',
            skilldescription: 'Misumi secretly marks an enemy for 1 turn, reflecting all physical skills used against him onto that target. Tighten Joints can be used on the marked enemy for 1 turn.',
            energy: ['Random'], target: 'single-enemy', damage: 0, cooldown: 3,
            classes: ['Strategic', 'Instant'],
            effects: [
                { type: 'apply_status', statusId: SOFT_REFLECT, duration: 1, scope: 'self',
                    condition: { scope: 'target' },
                    metadata: {
                        helpful: true, hideTooltipFromEnemy: true,
                        reflectNextIncomingSkill: true, reflectOnlyHarmfulSkills: true,
                        reflectOnlySkillClasses: ['Physical'], persistReflectAcrossTriggers: true,
                        reflectToFixedTarget: true,
                        copyTargetUsernameToKeys: ['reflectTargetUsername'],
                        copyTargetSlotToKeys: ['reflectTargetSlot'],
                        onReflectGainChakra: { chakraType: 'random', amount: 1 },
                        tooltipText: 'Physical skills used on Misumi are reflected onto the enemy marked by Soft Physique Modification. Each reflected skill grants 1 random chakra.',
                    } },
                { type: 'apply_status', statusId: SOFT_MARK, duration: 1, scope: 'target',
                    metadata: {
                        harmful: true, turnDurationAnchor: 'source_turn', hideTooltipFromUnitOwner: true,
                        statusIcon: 'https://i.imgur.com/4kSRPt1.png',
                        tooltipText: "Physical skills used on Misumi are reflected onto this character, and Tighten Joints can be used on them.",
                    } },
            ],
        },
        {
            id: 'tsurugi-misumi-tighten-joints', name: 'Tighten Joints',
            skillimage: 'https://i.imgur.com/PrYadov.png',
            skilldescription: 'Misumi wraps his body around a prepared enemy, dealing 15 physical damage each turn for 2 turns and stunning their physical and strategic skills. Misumi cannot use other skills during this time.',
            energy: ['Random', 'Random'], target: 'single-enemy', damage: 0, cooldown: 0,
            targetCondition: { statusIdsAny: [JOINTS_PREP, SOFT_MARK] },
            classes: ['Physical', 'Action'],
            effects: [
                { type: 'apply_status', statusId: 'tsurugi_misumi_tighten_joints', duration: 2, scope: 'target',
                    metadata: {
                        harmful: true, ongoingClass: 'action',
                        turnEndDamage: 15, turnEndTrigger: 'source_turn', turnEndSkillClasses: ['Physical'],
                        turnDurationAnchor: 'source_turn', triggerOnApply: true,
                        tooltipText: 'This character takes 15 physical damage each turn from Tighten Joints.',
                    } },
                { type: 'apply_status', statusId: 'tsurugi_misumi_tighten_joints_stun', duration: 2, scope: 'target',
                    metadata: {
                        harmful: true, ongoingClass: 'action', turnDurationAnchor: 'source_turn',
                        cannotUseSkillClasses: ['physical', 'strategic'],
                        tooltipText: "This character's physical and strategic skills are stunned.",
                    } },
                { type: 'apply_status', statusId: 'tsurugi_misumi_tighten_joints_lock', duration: 1, scope: 'self',
                    metadata: {
                        ongoingClass: 'action', cannotBeCleansed: true, cannotUseSkillIndices: [0, 1, 3],
                        tooltipText: 'Misumi cannot use other skills while Tighten Joints is active.',
                    } },
            ],
        },
        {
            id: 'tsurugi-misumi-misumi-block', name: 'Misumi Block',
            skillimage: 'https://i.imgur.com/m17inXY.png',
            skilldescription: 'Misumi contorts his body to evade incoming attacks, becoming invulnerable for 1 turn.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: 'tsurugi_misumi_misumi_block', duration: 1, scope: 'self',
                metadata: { helpful: true, invulnerable: true, tooltipText: 'Misumi is invulnerable.' } }],
        },
    ],
};
