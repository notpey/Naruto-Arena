const MARK = 'dosu_kinuta_vibrating_sound_drill';
const TUNING = 'dosu_kinuta_melody_arm_tuning';
const DRILL = 'dosu-kinuta-vibrating-sound-drill';
const MANIPULATION = 'dosu-kinuta-sound-manipulation';
const DRILL_ENHANCED = 'dosu-kinuta-vibrating-sound-drill-enhanced';
const MANIPULATION_ENHANCED = 'dosu-kinuta-sound-manipulation-enhanced';

const drillEffects = (markDuration) => [
    { type: 'damage', amount: 20, scope: 'target' },
    { type: 'apply_status', statusId: MARK, duration: markDuration, scope: 'target',
        metadata: { harmful: true, turnDurationAnchor: 'source_turn',
            tooltipText: 'Sound Manipulation may be used on this character.' } },
];

module.exports = {
    id: 'dosu-kinuta', characterId: 'dosu-kinuta', name: 'Kinuta Dosu',
    facePicture: 'https://i.imgur.com/d5yZAyK.png',
    characterdeescription: 'Perhaps the strongest of the three sound genin, Kinuta Dosu uses his implanted Melody Arm to amplify sound waves and increase the power of his taijutsu.',
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
            id: DRILL, name: 'Vibrating Sound Drill',
            skillimage: 'https://i.imgur.com/RHsi6uX.png',
            skilldescription: 'Dosu deals 20 physical damage to an enemy. For 4 turns, Sound Manipulation may be used on them. This effect renews. Enhanced effect: the enemy is permanently marked by this ability.',
            energy: ['Taijutsu'], target: 'single-enemy', damage: 0, cooldown: 0,
            classes: ['Physical', 'Instant'],
            effects: drillEffects(4),
        },
        {
            id: MANIPULATION, name: 'Sound Manipulation',
            skillimage: 'https://i.imgur.com/hz3JOSD.png',
            skilldescription: 'Dosu deals 10 affliction damage to all enemies affected by Vibrating Sound Drill. For 2 turns, their physical skills will cost 1 extra chakra. Enhanced effect: affects all skills and deals damage each turn. In both states this skill ignores invulnerability.',
            energy: ['Genjutsu'], target: 'all-enemy', damage: 0, cooldown: 2,
            targetCondition: { statusId: MARK }, ignoreInvulnerability: true,
            classes: ['Affliction', 'Chakra', 'Instant'],
            effects: [
                { type: 'damage', amount: 10, scope: 'all-enemy' },
                { type: 'apply_status', statusId: 'dosu_kinuta_sound_manipulation', duration: 2,
                    scope: 'all-enemy', metadata: {
                        harmful: true, turnDurationAnchor: 'source_turn',
                        randomCostIncreaseForSkillClasses: { physical: 1 },
                        tooltipText: "This character's physical skills cost 1 additional random chakra.",
                    } },
            ],
        },
        {
            id: 'dosu-kinuta-melody-arm-tuning', name: 'Melody Arm Tuning',
            skillimage: 'https://i.imgur.com/mcaE8De.png',
            skilldescription: 'The next use of Vibrating Sound Drill or Sound Manipulation will be enhanced. This skill ends when Dosu uses any of those skills and cannot be used while active.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 2,
            actorCondition: { missingStatusId: TUNING },
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: TUNING, duration: 99, scope: 'self',
                metadata: {
                    helpful: true, onOwnerUseSkillTrigger: true,
                    onOwnerUseSkillIdsAny: [DRILL_ENHANCED, MANIPULATION_ENHANCED],
                    skillReplacements: { [DRILL]: DRILL_ENHANCED, [MANIPULATION]: MANIPULATION_ENHANCED },
                    tooltipText: 'The next Vibrating Sound Drill or Sound Manipulation will be enhanced.',
                } }],
        },
        {
            id: 'dosu-kinuta-dosu-dodge', name: 'Dosu Dodge',
            skillimage: 'https://i.imgur.com/xCBubIe.png',
            skilldescription: 'Makes Kinuta Dosu invulnerable for 1 turn.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: 'dosu_kinuta_dosu_dodge',
                duration: 1, scope: 'self', metadata: {
                    helpful: true, invulnerable: true,
                    tooltipText: 'Dosu is invulnerable.',
                } }],
        },
        {
            id: DRILL_ENHANCED, name: 'Vibrating Sound Drill',
            hiddenFromSelectionViewer: true, useBaseSkillCooldown: true,
            skillimage: 'https://i.imgur.com/RHsi6uX.png',
            skilldescription: 'Dosu deals 20 physical damage to an enemy and permanently marks them. Sound Manipulation may be used on marked enemies.',
            energy: ['Taijutsu'], target: 'single-enemy', damage: 0, cooldown: 0,
            classes: ['Physical', 'Instant'],
            effects: drillEffects(99),
        },
        {
            id: MANIPULATION_ENHANCED, name: 'Sound Manipulation',
            hiddenFromSelectionViewer: true, useBaseSkillCooldown: true,
            skillimage: 'https://i.imgur.com/hz3JOSD.png',
            skilldescription: 'Dosu deals 10 affliction damage to all enemies affected by Vibrating Sound Drill each turn for 2 turns. For 2 turns, all of their skills will cost 1 extra chakra. This skill ignores invulnerability.',
            energy: ['Genjutsu'], target: 'all-enemy', damage: 0, cooldown: 2,
            targetCondition: { statusId: MARK }, ignoreInvulnerability: true,
            classes: ['Affliction', 'Chakra', 'Instant'],
            effects: [
                { type: 'damage', amount: 10, scope: 'all-enemy' },
                { type: 'apply_status', statusId: 'dosu_kinuta_sound_manipulation_enhanced', duration: 2,
                    scope: 'all-enemy', metadata: {
                        harmful: true, turnDurationAnchor: 'source_turn', randomCostIncrease: 1,
                        tooltipText: 'All of this character\'s skills cost 1 additional random chakra.',
                    } },
                { type: 'apply_status', statusId: 'dosu_kinuta_sound_manipulation_affliction', duration: 1,
                    scope: 'all-enemy', metadata: {
                        harmful: true, afflictionDamage: true, turnEndDamage: 10,
                        turnEndTrigger: 'source_turn', turnDurationAnchor: 'source_turn',
                        tooltipText: 'This character takes 10 affliction damage on Dosu\'s following turn.',
                    } },
            ],
        },
    ],
};
