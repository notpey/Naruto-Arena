const TACTICS_MARK = 'nara_shikamaru_ninja_tactics_mark';
const MEDITATE = 'nara_shikamaru_meditate';
const markedEnemies = { statusIdsAny: [TACTICS_MARK, MEDITATE] };

module.exports = {
    id: 'nara-shikamaru', characterId: 'nara-shikamaru', name: 'Nara Shikamaru',
    facePicture: 'https://i.imgur.com/4Pwe4ro.png',
    characterdeescription: "A brilliant yet notoriously lazy genin of Team 10, Shikamaru possesses an exceptional intellect and mastery of the Nara clan's shadow techniques. Despite his carefree attitude, his cunning strategies allow him to outwit opponents and turn even the most unfavorable battles to his advantage.",
    requiredMissionId: null,
    passive: {
        name: 'Ninja Tactics, for Dummies', icon: 'https://i.imgur.com/e7udnLJ.png',
        description: 'At the start of the battle, Shikamaru secretly marks a random enemy. Shadow-Neck Bind and Shadow Imitation affect all enemies marked by this passive or Meditate.',
        startApplyStatusToRandomEnemy: {
            statusId: TACTICS_MARK, duration: 99,
            metadata: { harmful: true, permanent: true, hideTooltipFromUnitOwner: true,
                statusIcon: 'https://i.imgur.com/e7udnLJ.png', sourceSkillName: 'Ninja Tactics, for Dummies',
                tooltipText: 'Shikamaru has secretly marked this character. Shadow-Neck Bind and Shadow Imitation affect them.' },
        },
    },
    skills: [
        {
            id: 'nara-shikamaru-meditate', name: 'Meditate',
            skillimage: 'https://i.imgur.com/fglmxM1.png',
            skilldescription: "Shikamaru studies an enemy's movements, marking them with Meditate for 5 turns. This skill cannot be used on an enemy already affected by it, and the effect ends if Shikamaru dies.",
            energy: [], target: 'single-enemy', damage: 0, cooldown: 0,
            targetCondition: { missingStatusId: MEDITATE },
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: MEDITATE, duration: 5, scope: 'target',
                metadata: { harmful: true, turnDurationAnchor: 'source_turn', removeOnSourceDeath: true,
                    tooltipText: 'Shadow-Neck Bind and Shadow Imitation affect this character.' } }],
        },
        {
            id: 'nara-shikamaru-shadow-neck-bind', name: 'Shadow-Neck Bind',
            skillimage: 'https://i.imgur.com/ZQXKyPQ.png',
            skilldescription: 'Shikamaru constricts his enemies with shadows, dealing 15 physical damage to all marked enemies each turn for 2 turns. During this time, affected enemies cannot reduce incoming damage or become invulnerable.',
            energy: ['Genjutsu'], target: 'all-enemy', damage: 0, cooldown: 0,
            targetCondition: markedEnemies,
            classes: ['Physical', 'Control'],
            effects: [{ type: 'apply_status', statusId: 'nara_shikamaru_shadow_neck_bind', duration: 2,
                scope: 'all-enemy', metadata: {
                    harmful: true, ongoingClass: 'control',
                    cannotReduceDamage: true, cannotBecomeInvulnerable: true,
                    turnEndDamage: 15, turnEndTrigger: 'source_turn', turnEndSkillClasses: ['Physical'],
                    turnDurationAnchor: 'source_turn', triggerOnApply: true,
                    tooltipText: 'This character takes 15 physical damage each turn and cannot reduce damage or become invulnerable.',
                } }],
        },
        {
            id: 'nara-shikamaru-shadow-imitation', name: 'Shadow Imitation',
            skillimage: 'https://i.imgur.com/jlKHCbs.png',
            skilldescription: 'Shikamaru binds his enemies with their own shadows, stunning the physical and chakra skills of all marked enemies for 2 turns.',
            energy: ['Bloodline', 'Genjutsu'], target: 'all-enemy', damage: 0, cooldown: 2,
            targetCondition: markedEnemies,
            classes: ['Chakra', 'Control'],
            effects: [{ type: 'apply_status', statusId: 'nara_shikamaru_shadow_imitation', duration: 2,
                scope: 'all-enemy', metadata: {
                    harmful: true, ongoingClass: 'control', turnDurationAnchor: 'source_turn',
                    cannotUseSkillClasses: ['physical', 'chakra'],
                    tooltipText: "This character's physical and chakra skills are stunned.",
                } }],
        },
        {
            id: 'nara-shikamaru-shikamaru-hide', name: 'Shikamaru Hide',
            skillimage: 'https://i.imgur.com/eAbeTyw.png',
            skilldescription: 'Shikamaru conceals himself in the shadows, becoming invulnerable for 1 turn.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: 'nara_shikamaru_shikamaru_hide', duration: 1, scope: 'self',
                metadata: { helpful: true, invulnerable: true, tooltipText: 'Shikamaru is invulnerable.' } }],
        },
    ],
};
