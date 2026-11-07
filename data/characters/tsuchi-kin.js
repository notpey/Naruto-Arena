const BELLS = 'tsuchi_kin_unnerving_bells';
const BELLS_GRACE = 'tsuchi_kin_unnerving_bells_grace';
const BELLS_BREAK = 'tsuchi_kin_unnerving_bells_break';
const NEEDLES = 'tsuchi_kin_illusion_bell_needles';

module.exports = {
    id: 'tsuchi-kin', characterId: 'tsuchi-kin', name: 'Tsuchi Kin',
    facePicture: 'https://i.imgur.com/aSPsypU.png',
    characterdeescription: 'One of the three sound genin; Kin is a confident ninja that likes to toy with her enemies before finishing them off. Using a set of needles and bells, Kin has a number of different effects she can create to attack her enemies.',
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
            id: 'tsuchi-kin-illusion-bell-needles', name: 'Illusion Bell Needles',
            skillimage: 'https://i.imgur.com/r7SrvC3.png',
            skilldescription: 'Kin will counter the next skill used on her. This skill cannot be used while its counter is active.',
            energy: ['Genjutsu'], target: 'self', damage: 0, cooldown: 2,
            actorCondition: { missingStatusId: NEEDLES },
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: NEEDLES,
                duration: 99, scope: 'self', metadata: {
                    helpful: true, triggerOnEnemyHarmfulSkill: true, counterCancelsSkill: true,
                    tooltipText: 'The next enemy skill used on Kin will be countered.',
                } }],
        },
        {
            id: 'tsuchi-kin-needle-and-bell-trap', name: 'Needle and Bell Trap',
            skillimage: 'https://i.imgur.com/giDdgX6.png',
            skilldescription: 'Kin deals 15 piercing physical damage to an enemy. Enemies affected by Unnerving Bells take 5 extra damage and have their strategic skills stunned for 1 turn.',
            energy: ['Random'], target: 'single-enemy', damage: 0, cooldown: 0,
            classes: ['Physical', 'Instant'],
            effects: [
                { type: 'damage', amount: 15, scope: 'target',
                    condition: { scope: 'target', statusId: BELLS, conditionalAmount: 20 },
                    metadata: { ignoreDamageReduction: true } },
                { type: 'apply_status', statusId: 'tsuchi_kin_needle_and_bell_trap_stun', duration: 1,
                    scope: 'target', condition: { scope: 'target', statusId: BELLS },
                    metadata: { harmful: true, cannotUseSkillClasses: ['strategic'],
                        turnDurationAnchor: 'source_turn',
                        tooltipText: "This character's strategic skills are stunned." } },
            ],
        },
        {
            id: 'tsuchi-kin-unnerving-bells', name: 'Unnerving Bells',
            skillimage: 'https://i.imgur.com/G5mXyIU.png',
            skilldescription: 'An enemy will take 10 affliction damage each turn, permanently. During this time, their skills cost 1 extra genjutsu chakra to use. This effect lasts at least 2 turns, then ends when the target uses a skill. This skill cannot be used on an enemy already affected by it.',
            energy: ['Genjutsu'], target: 'single-enemy', damage: 0, cooldown: 1,
            targetCondition: { missingStatusId: BELLS },
            classes: ['Affliction', 'Chakra', 'Instant'],
            effects: [
                { type: 'remove_status', statusId: BELLS_BREAK, scope: 'target' },
                { type: 'apply_status', statusId: BELLS, duration: 99, scope: 'target',
                    metadata: {
                        harmful: true, afflictionDamage: true, turnEndDamage: 10,
                        turnEndTrigger: 'source_turn', genjutsuCostIncrease: 1,
                        tooltipText: "This character takes 10 affliction damage each turn and their skills cost 1 additional genjutsu chakra. After 2 turns, this effect ends when they use a skill.",
                    } },
                // For the target's next 2 turns, using skills cannot end Bells. When this
                // grace period runs out, it arms a breaker that ends Bells on their next skill.
                { type: 'apply_status', statusId: BELLS_GRACE, duration: 2, scope: 'target',
                    metadata: {
                        harmful: true, hideTooltip: true,
                        onExpireApplyStatusToSelf: {
                            statusId: BELLS_BREAK, duration: 99,
                            metadata: {
                                harmful: true, hideTooltip: true,
                                onOwnerUseSkillTrigger: true,
                                removeStatusIdsOnOwnerUseSkill: [BELLS],
                            },
                        },
                    } },
            ],
        },
        {
            id: 'tsuchi-kin-sharp-analysis', name: 'Sharp Analysis',
            skillimage: 'https://i.imgur.com/JOJymkR.png',
            skilldescription: 'Makes Tsuchi Kin invulnerable for 1 turn.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: 'tsuchi_kin_sharp_analysis',
                duration: 1, scope: 'self', metadata: {
                    helpful: true, invulnerable: true,
                    tooltipText: 'Kin is invulnerable.',
                } }],
        },
    ],
};
