const CHARGES = 'gekko_hayate_crescent_moon';
const PASSIVE_ICON = 'https://i.imgur.com/71oZt5q.png';
const gainCharge = {
    statusId: CHARGES, duration: 99,
    metadata: {
        helpful: true, permanent: true, stackMetadataKey: 'charges', stackDelta: 1, stackMax: 99,
        tooltipTextTemplate: 'Hayate has {charges} Crescent Moon charges. Dance of the Crescent Moon deals 10 additional damage for each and spends them.',
    },
};

module.exports = {
    id: 'gekko-hayate', characterId: 'gekko-hayate', name: 'Gekko Hayate',
    facePicture: 'https://i.imgur.com/xVcPeeU.png',
    characterdeescription: 'A skilled swordsman and special jonin of the Hidden Leaf Village, Hayate serves as a proctor during the Chuunin Exams. Despite his sickly appearance, he possesses remarkable speed and mastery of the Dance of the Crescent Moon, using deceptive sword techniques to overwhelm his opponents.',
    requiredMissionId: null,
    passive: {
        name: 'Fair Fight', icon: PASSIVE_ICON,
        description: 'Hayate deals 5 additional damage and ignores invulnerability when attacking the enemy directly opposite him on the battlefield.',
        startApplyStatusToOppositeEnemy: {
            statusId: 'gekko_hayate_fair_fight_mark', duration: 99,
            metadata: {
                permanent: true, cannotBeCleansed: true,
                bonusDamageFromSourceSkillsFlat: 5, bonusDamageFromSourceCharacterId: 'gekko-hayate',
                ignoreInvulnerabilityFromSourceCharacterId: 'gekko-hayate',
                statusIcon: PASSIVE_ICON, sourceSkillName: 'Fair Fight',
                tooltipText: 'This character is directly opposite Hayate. He deals 5 additional damage to them and ignores their invulnerability.',
            },
        },
    },
    skills: [
        {
            id: 'gekko-hayate-crescent-moon-slash', name: 'Crescent Moon Slash',
            skillimage: 'https://i.imgur.com/dHceKsI.png',
            skilldescription: 'Hayate strikes an enemy with a swift sword attack, dealing 20 physical damage and gaining 1 Crescent Moon charge.',
            energy: ['Taijutsu'], target: 'single-enemy', damage: 0, cooldown: 0,
            classes: ['Physical', 'Instant'],
            effects: [
                { type: 'damage', amount: 20, scope: 'target' },
                { type: 'apply_status', scope: 'self', ...gainCharge },
            ],
        },
        {
            id: 'gekko-hayate-dance-of-the-crescent-moon', name: 'Dance of the Crescent Moon',
            skillimage: 'https://i.imgur.com/w1OaCxF.png',
            skilldescription: 'Hayate unleashes a series of deceptive sword strikes, dealing 30 physical damage to an enemy, increased by 10 for each Crescent Moon charge. Hayate also becomes invulnerable for 1 turn.',
            energy: ['Genjutsu', 'Random'], target: 'single-enemy', damage: 0, cooldown: 1,
            classes: ['Physical', 'Instant'],
            effects: [
                { type: 'damage', amount: 30, scope: 'target',
                    metadata: { bonusPerStatusMetadata: {
                        scope: 'self', statusId: CHARGES, metadataKey: 'charges', multiplier: 10,
                    } } },
                { type: 'remove_status', statusId: CHARGES, scope: 'self',
                    metadata: { deferUntilAfterDamage: true } },
                { type: 'apply_status', statusId: 'gekko_hayate_dance_invulnerable', duration: 1, scope: 'self',
                    metadata: { helpful: true, invulnerable: true, tooltipText: 'Hayate is invulnerable.' } },
            ],
        },
        {
            id: 'gekko-hayate-eavesdrop', name: 'Eavesdrop',
            skillimage: 'https://i.imgur.com/e7fdZI6.png',
            skilldescription: 'Hayate secretly prepares to intercept an attack, countering the first physical or chakra skill used against him for 1 turn. If a skill is countered, he gains 1 Crescent Moon charge.',
            energy: ['Genjutsu'], target: 'self', damage: 0, cooldown: 2,
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: 'gekko_hayate_eavesdrop', duration: 1, scope: 'self',
                metadata: {
                    helpful: true, invisible: true, hideTooltipFromEnemy: true,
                    triggerOnEnemyHarmfulSkillClassesAny: ['Physical', 'Chakra'], counterCancelsSkill: true,
                    counterApplyStatusToSourceOwner: gainCharge,
                    tooltipText: 'The first physical or chakra skill used on Hayate will be countered, granting him 1 Crescent Moon charge.',
                } }],
        },
        {
            id: 'gekko-hayate-backflip-dodge', name: 'Backflip Dodge',
            skillimage: 'https://i.imgur.com/c7o02Kj.png',
            skilldescription: 'Hayate swiftly retreats from danger, becoming invulnerable for 1 turn.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: 'gekko_hayate_backflip_dodge', duration: 1, scope: 'self',
                metadata: { helpful: true, invulnerable: true, tooltipText: 'Hayate is invulnerable.' } }],
        },
    ],
};
