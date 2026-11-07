const CURSED_SEAL = 'shiore_orochimaru_cursed_seal';
const DEVOUR = 'shiore_orochimaru_devour';
const DEVOUR_GUARD = 'shiore_orochimaru_devour_guard';
const PASSIVE_ICON = 'https://i.imgur.com/YC4ewK4.png';

module.exports = {
    id: 'shiore-orochimaru', characterId: 'shiore-orochimaru', name: 'Shiore Orochimaru',
    facePicture: 'https://i.imgur.com/fC4xg6L.png',
    characterdeescription: 'Disguised as a genin of the Hidden Grass Village, Orochimaru infiltrates the Chuunin Exams after murdering Shiore and assuming her identity. Obsessed with acquiring powerful techniques, he sets his sights on Sasuke Uchiha as a potential vessel for his forbidden ambitions.',
    requiredMissionId: 'hostile-takeover',
    passive: {
        name: 'Cursed Seal', icon: PASSIVE_ICON,
        description: 'Enemies struck by Cursed Seal Bite are permanently marked. Whenever a marked enemy ends an action with no remaining chakra, they take 5 affliction damage. This effect does not stack and cannot be removed, even after Orochimaru dies.',
    },
    skills: [
        {
            id: 'shiore-orochimaru-five-elements-seal', name: 'Five Elements Seal',
            skillimage: 'https://i.imgur.com/SZOdcEy.png',
            skilldescription: "Orochimaru disrupts an enemy's chakra flow, increasing the cost of their skills by 1 random chakra for 3 turns.",
            energy: ['Ninjutsu'], target: 'single-enemy', damage: 0, cooldown: 3,
            classes: ['Chakra', 'Instant'],
            effects: [{ type: 'apply_status', statusId: 'shiore_orochimaru_five_elements_seal', duration: 3,
                scope: 'target', metadata: {
                    harmful: true, turnDurationAnchor: 'source_turn', randomCostIncrease: 1,
                    tooltipText: "This character's skills cost 1 additional random chakra.",
                } }],
        },
        {
            id: 'shiore-orochimaru-devour', name: 'Devour',
            skillimage: 'https://i.imgur.com/Jp5mx0x.png',
            skilldescription: 'Orochimaru marks an enemy for 3 turns. When this effect ends, the target takes 20 affliction damage, increased by 5 for each turn it remained active, and has their physical skills stunned for 1 turn. During this time, Orochimaru gains 10 damage reduction, and this skill cannot be used again.',
            energy: ['Bloodline', 'Random'], target: 'single-enemy', damage: 0, cooldown: 0,
            actorCondition: { missingStatusId: DEVOUR_GUARD },
            classes: ['Physical', 'Affliction', 'Control'],
            effects: [
                { type: 'apply_status', statusId: DEVOUR, duration: 3, scope: 'target',
                    metadata: {
                        harmful: true, ongoingClass: 'control', turnDurationAnchor: 'source_turn',
                        turnEndTrigger: 'source_turn',
                        growPerTurn: [{ key: 'devourBonus', amount: 5 }],
                        expireEffectsOnEarlyEnd: true, endSourceStatusIdsOnExpire: [DEVOUR_GUARD],
                        onExpireEffects: [
                            { type: 'damage', amount: 20, metadata: {
                                afflictionDamage: true, skillClasses: ['Affliction'],
                                bonusFromStatusMetadataKey: 'devourBonus',
                            } },
                            { type: 'apply_status', statusId: 'shiore_orochimaru_devour_stun', duration: 1,
                                metadata: { harmful: true, cannotUseSkillClasses: ['physical'],
                                    tooltipText: "This character's physical skills are stunned." } },
                        ],
                        tooltipText: 'When Devour ends, this character takes 20 affliction damage, increased by 5 for each turn it remained active, and has their physical skills stunned for 1 turn.',
                    } },
                { type: 'apply_status', statusId: DEVOUR_GUARD, duration: 3, scope: 'self',
                    metadata: {
                        helpful: true, ongoingClass: 'control', controlIgnoresOwnerInvulnerability: true,
                        damageReductionFlat: 10,
                        tooltipText: 'Orochimaru has 10 damage reduction while Devour is active, and Devour cannot be used again.',
                    } },
            ],
        },
        {
            id: 'shiore-orochimaru-cursed-seal-bite', name: 'Cursed Seal Bite',
            skillimage: 'https://i.imgur.com/LWpHTiQ.png',
            skilldescription: 'Orochimaru bites an enemy, dealing 10 affliction damage with Lifesteal and applying Cursed Seal.',
            energy: ['Random'], target: 'single-enemy', damage: 0, cooldown: 1,
            classes: ['Physical', 'Affliction', 'Instant', 'Unique'],
            effects: [
                { type: 'health_steal_damage', amount: 10, scope: 'target',
                    metadata: { afflictionDamage: true } },
                { type: 'apply_status', statusId: CURSED_SEAL, duration: 99, scope: 'target',
                    metadata: {
                        harmful: true, permanent: true, cannotBeCleansed: true,
                        afflictionDamage: true, turnEndDamage: 5, turnEndDamageRequiresNoTeamChakra: true,
                        statusIcon: PASSIVE_ICON, sourceSkillName: 'Cursed Seal',
                        tooltipText: 'Cursed Seal: if this character\'s team has no chakra at the end of their turn, they take 5 affliction damage.',
                    } },
            ],
        },
        {
            id: 'shiore-orochimaru-skin-shed', name: 'Skin Shed',
            skillimage: 'https://i.imgur.com/wQEugXY.png',
            skilldescription: 'Orochimaru sheds his skin to evade incoming attacks, becoming invulnerable for 1 turn.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: 'shiore_orochimaru_skin_shed', duration: 1, scope: 'self',
                metadata: { helpful: true, invulnerable: true, tooltipText: 'Orochimaru is invulnerable.' } }],
        },
    ],
};
