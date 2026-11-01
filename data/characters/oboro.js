const HAZE = 'oboro_haze_clones';
const AMBUSH = 'oboro_underground_ambush';

const kunaiEffects = (scope) => [
    { type: 'damage', amount: 10, scope, metadata: { skillClasses: ['Physical'] } },
    { type: 'apply_status', statusId: 'oboro_exploding_kunais_affliction',
        duration: 1, scope, metadata: {
            harmful: true, afflictionDamage: true, turnEndDamage: 10,
            turnEndTrigger: 'source_turn', turnDurationAnchor: 'source_turn',
            removeOnSourceDeath: true,
            tooltipText: 'This character takes 10 affliction damage on Oboro\'s following turn.',
        } },
];

module.exports = {
    id: 'oboro', characterId: 'oboro', name: 'Oboro',
    facePicture: 'https://i.imgur.com/5Sw5ij0.png',
    characterdeescription: 'A cunning genin of the Hidden Rain Village, Oboro specializes in using illusory clones and underground ambushes to deceive his opponents. Relying on misdirection and surprise attacks, he strikes when his enemies least expect it.',
    requiredMissionId: 'yellow-flash',
    passive: {
        name: 'False Opening', icon: 'https://i.imgur.com/2Ne6VxL.png',
        description: 'Oboro takes 10 less non-affliction damage from the first damaging enemy skill used on him each turn.',
        firstEnemyDamagingSkillReductionFlat: 10,
    },
    skills: [
        {
            id: 'oboro-underground-ambush', name: 'Underground Ambush',
            skillimage: 'https://i.imgur.com/vKrmQQx.png',
            skilldescription: 'Oboro sets an invisible ambush against all enemies for 1 turn. The first enemy to use a skill takes 20 physical damage and has their physical skills stunned for 1 turn. During Haze Clones, this effect triggers against every enemy who uses a skill. This effect ends if Oboro dies.',
            energy: ['Genjutsu'], target: 'all-enemy', damage: 0, cooldown: 1,
            classes: ['Physical', 'Instant'],
            effects: [{ type: 'apply_status', statusId: AMBUSH, duration: 1,
                scope: 'all-enemy', metadata: {
                    harmful: true, invisible: true, hideTooltipFromEnemy: true,
                    turnDurationAnchor: 'source_turn', removeOnSourceDeath: true,
                    onOwnerUseSkillTrigger: true,
                    ownerUseTriggerRequiresLivingSource: true,
                    sharedFirstTriggerUnlessSourceStatusId: HAZE,
                    onOwnerUseSkillEffects: [
                        { type: 'damage', amount: 20,
                            metadata: { skillClasses: ['Physical'] } },
                        { type: 'apply_status', statusId: 'oboro_underground_ambush_stun',
                            duration: 1, fresh: true, metadata: {
                                harmful: true, cannotUseSkillClasses: ['physical'],
                                turnDurationAnchor: 'source_turn',
                                tooltipText: 'This character cannot use Physical skills for 1 turn.',
                            } },
                    ],
                    tooltipText: 'The next skill this character uses triggers a 20 physical damage ambush and a 1-turn Physical skill stun.',
                } }],
        },
        {
            id: 'oboro-exploding-kunais', name: 'Exploding Kunais',
            skillimage: 'https://i.imgur.com/gnjpskq.png',
            skilldescription: 'Oboro deals 10 physical damage to one enemy and 10 affliction damage the following turn. During Haze Clones, this skill targets all enemies.',
            energy: ['Random'], target: 'single-enemy', damage: 0, cooldown: 1,
            classes: ['Physical', 'Affliction', 'Instant'],
            effects: kunaiEffects('target'),
        },
        {
            id: 'oboro-haze-clones', name: 'Haze Clones',
            skillimage: 'https://i.imgur.com/o0DKaNj.png',
            skilldescription: 'Oboro gains 30 destructible defense for 4 turns. During this time, Underground Ambush and Exploding Kunais are enhanced.',
            energy: ['Genjutsu'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: HAZE, duration: 4,
                scope: 'self', metadata: {
                    helpful: true, destructibleDefensePoints: 30,
                    skillReplacements: {
                        'oboro-exploding-kunais': 'oboro-exploding-kunais-haze',
                    },
                    tooltipText: 'Oboro has 30 destructible defense. Underground Ambush triggers for every enemy, and Exploding Kunais targets all enemies.',
                } }],
        },
        {
            id: 'oboro-fleet-of-foot', name: 'Fleet of Foot',
            skillimage: 'https://i.imgur.com/kUC4WTS.png',
            skilldescription: 'Oboro becomes invulnerable for 1 turn.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: 'oboro_fleet_of_foot',
                duration: 1, scope: 'self', metadata: {
                    helpful: true, invulnerable: true,
                    tooltipText: 'Oboro is invulnerable.',
                } }],
        },
        {
            id: 'oboro-exploding-kunais-haze', name: 'Exploding Kunais',
            hiddenFromSelectionViewer: true,
            skillimage: 'https://i.imgur.com/gnjpskq.png',
            skilldescription: 'Oboro deals 10 physical damage to all enemies and 10 affliction damage to each the following turn.',
            energy: ['Random'], target: 'all-enemy', damage: 0, cooldown: 1,
            classes: ['Physical', 'Affliction', 'Instant'],
            effects: kunaiEffects('all-enemy'),
        },
    ],
};
