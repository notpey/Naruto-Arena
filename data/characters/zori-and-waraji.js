const IAIDO = 'zori-and-waraji-iaido';
const SAVAGE_SLASH = 'zori-and-waraji-savage-slash';

module.exports = {
    id: 'zori-and-waraji',
    characterId: 'zori-and-waraji',
    name: 'Zōri & Waraji',
    requiredMissionId: 'gatos-enforcers',
    facePicture: 'https://i.imgur.com/EIsg1h5.png',
    characterdeescription: "Mercenary swordsmen hired as personal bodyguards by Gatō, Zōri and Waraji enforce his ruthless control over the Land of Waves. The pair rely on their blades and intimidation to carry out their employer's orders, even threatening Tazuna's family to halt construction of the bridge. Working together, they overwhelm their enemies with swift strikes and relentless aggression.",
    passive: {
        name: 'Forced Entry',
        icon: 'https://i.imgur.com/6wswhvT.png',
        description: 'At the start of the battle, Zōri & Waraji deal 10 physical damage to all enemies.',
        startDamageAllEnemies: { amount: 10, classes: ['Physical'] },
    },
    skills: [
        {
            id: IAIDO, name: "Zōri's Iaidō",
            skillimage: 'https://i.imgur.com/ghsKrge.png',
            skilldescription: "Zōri deals 25 piercing physical damage to an enemy. For 1 turn, Waraji's Savage Slash deals an additional 10 damage.",
            energy: ['Taijutsu'], target: 'single-enemy', damage: 0, cooldown: 0,
            classes: ['Physical', 'Instant'],
            effects: [
                { type: 'damage', amount: 25, scope: 'target', metadata: { ignoreDamageReduction: true } },
                { type: 'apply_status', statusId: 'zori_and_waraji_savage_slash_bonus', duration: 1,
                    scope: 'self', metadata: { helpful: true, turnDurationAnchor: 'source_turn',
                        skillDamageBonuses: { [SAVAGE_SLASH]: 10 },
                        tooltipText: "Waraji's Savage Slash deals 10 additional damage." } },
            ],
        },
        {
            id: SAVAGE_SLASH, name: "Waraji's Savage Slash",
            skillimage: 'https://i.imgur.com/yDtMIqS.png',
            skilldescription: "Waraji destroys an enemy's destructible defense and deals 15 physical damage to them. For 1 turn, Zōri's Iaidō deals an additional 10 damage.",
            energy: ['Random'], target: 'single-enemy', damage: 0, cooldown: 0,
            classes: ['Physical', 'Instant'],
            effects: [
                { type: 'destroy_destructible_defense', scope: 'target' },
                { type: 'damage', amount: 15, scope: 'target' },
                { type: 'apply_status', statusId: 'zori_and_waraji_iaido_bonus', duration: 1,
                    scope: 'self', metadata: { helpful: true, turnDurationAnchor: 'source_turn',
                        skillDamageBonuses: { [IAIDO]: 10 },
                        tooltipText: "Zōri's Iaidō deals 10 additional damage." } },
            ],
        },
        {
            id: 'zori-and-waraji-bodyguards', name: 'Bodyguards',
            skillimage: 'https://i.imgur.com/51dDIFU.png',
            skilldescription: 'For 3 turns, enemy skills that target all enemies instead target only Zōri & Waraji. During this time, Zōri & Waraji have 5 damage reduction. This effect ends if they die.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 3,
            classes: ['Strategic', 'Instant'],
            effects: [
                { type: 'apply_status', statusId: 'zori_and_waraji_bodyguards', duration: 3, scope: 'self',
                    metadata: { helpful: true, redirectEnemyAreaSkillsToSelf: true, damageReductionFlat: 5,
                        tooltipText: 'Enemy skills that target all enemies target only Zōri & Waraji. Zōri & Waraji have 5 damage reduction.' } },
            ],
        },
        {
            id: 'zori-and-waraji-take-cover', name: 'Take Cover',
            skillimage: 'https://i.imgur.com/q8dKy5X.png',
            skilldescription: 'Zōri & Waraji become invulnerable for 1 turn.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: 'invulnerable', duration: 1, scope: 'self',
                metadata: { helpful: true, invulnerable: true,
                    tooltipText: 'This character is invulnerable.' } }],
        },
    ],
};
