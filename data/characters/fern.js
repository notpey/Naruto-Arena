const CONCEALMENT = 'fern_magical_concealment';
const ZOLTRAAK = 'fern-zoltraak';
const ZOLTRAAK_BARRAGE = 'fern-zoltraak-barrage';
const BARRIER = 'fern_ordinary_defensive_magic';
const BARRIER_SHIELD = 'fern_ordinary_defensive_magic_shield';

const zoltraakCost = {
    statusId: CONCEALMENT,
    metadataKey: 'magicalConcealmentStacks',
    tiers: [
        { min: 8, energy: ['Ninjutsu', 'Random'] },
        { min: 5, energy: ['Ninjutsu'] },
        { min: 3, energy: ['Random'] },
    ],
};

const shieldMetadata = {
    helpful: true,
    destructibleDefensePoints: 6,
    scaleFromSourceStatusMetadata: {
        statusId: CONCEALMENT,
        metadataKey: 'magicalConcealmentStacks',
        multiplier: 5,
        targetKeys: ['destructibleDefensePoints'],
        addToTargetKeys: true,
    },
    tooltipTextTemplate: 'Fern has {destructibleDefensePoints} destructible defense from Ordinary Defensive Magic.',
};

module.exports = {
    id: 'fern', characterId: 'fern', name: 'Fern',
    facePicture: 'https://i.imgur.com/P0k4y6B.png',
    characterdeescription: 'A gifted young mage raised by the priest Heiter and trained under Frieren, Fern possesses exceptional talent for offensive and defensive magic. Despite her reserved demeanor, her precise spellcasting and mastery of mana concealment make her a formidable opponent.',
    passive: {
        name: 'Magical Concealment',
        icon: 'https://i.imgur.com/dzAWLyg.png',
        description: 'Fern carefully suppresses her mana, gaining 1 Magical Concealment stack each turn.',
        magicalConcealmentStacks: 0,
        stackMetadataKey: 'magicalConcealmentStacks',
        growPerTurn: [{ key: 'magicalConcealmentStacks', amount: 1 }],
        stackTooltipTextTemplate: 'Fern has {magicalConcealmentStacks} Magical Concealment stacks.',
    },
    skills: [
        {
            id: ZOLTRAAK, name: 'Zoltraak', skillimage: 'https://i.imgur.com/jGNhYNJ.png',
            skilldescription: 'Fern deals 5 chakra damage to one enemy for each Magical Concealment stack. At 3 stacks this costs 1 random chakra, at 5 stacks 1 ninjutsu chakra, and at 8 stacks 1 ninjutsu and 1 random chakra.',
            energy: [], energyBySourceStatusMetadata: zoltraakCost,
            target: 'single-enemy', damage: 0, cooldown: 0,
            classes: ['Chakra', 'Instant'],
            effects: [{ type: 'damage', amount: 0, scope: 'target',
                metadata: { bonusPerStatusMetadata: {
                    scope: 'self', statusId: CONCEALMENT,
                    metadataKey: 'magicalConcealmentStacks', multiplier: 5,
                } } }],
        },
        {
            id: 'fern-ordinary-defensive-magic', name: 'Ordinary Defensive Magic',
            skillimage: 'https://i.imgur.com/aFBoFrH.png',
            skilldescription: 'Fern gains 6 destructible defense for 1 turn each turn for the rest of the battle, increased by 5 for each Magical Concealment stack. This skill cannot be used while active.',
            energy: ['Ninjutsu'], target: 'self', damage: 0, cooldown: 0,
            actorCondition: { missingStatusId: BARRIER },
            classes: ['Strategic', 'Instant'],
            effects: [
                { type: 'apply_status', statusId: BARRIER, duration: 99, scope: 'self',
                    metadata: { helpful: true, permanent: true, cannotBeCleansed: true,
                        triggerOnApply: true,
                        turnEndApplyStatusToSelf: {
                            statusId: BARRIER_SHIELD, duration: 1,
                            metadata: shieldMetadata, fresh: true,
                        },
                        tooltipText: 'Ordinary Defensive Magic renews Fern’s 6 destructible defense, plus 5 per Magical Concealment stack, each turn.' } },
                { type: 'apply_status', statusId: BARRIER_SHIELD, duration: 1, scope: 'self',
                    metadata: shieldMetadata },
            ],
        },
        {
            id: 'fern-orbital-cannon', name: 'Orbital Cannon',
            skillimage: 'https://i.imgur.com/QlVdeAA.png',
            skilldescription: 'Fern prepares a concealed counter for 1 turn, countering the first Physical or Chakra skill used against her. If triggered, she gains 1 Magical Concealment stack. Otherwise, Zoltraak targets all enemies for 1 turn.',
            energy: ['Genjutsu'], target: 'self', damage: 0, cooldown: 2,
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: 'fern_orbital_cannon', duration: 1, scope: 'self',
                metadata: {
                    helpful: true, invisible: true,
                    triggerOnEnemyHarmfulSkillClassesAny: ['physical', 'chakra'],
                    counterCancelsSkill: true,
                    counterApplyStatusToSourceOwner: {
                        statusId: CONCEALMENT, duration: 99,
                        metadata: { stackMetadataKey: 'magicalConcealmentStacks', stackDelta: 1,
                            stackMax: 9999,
                            tooltipTextTemplate: 'Fern has {magicalConcealmentStacks} Magical Concealment stacks.' },
                    },
                    onExpireApplyStatusToSelf: {
                        statusId: 'fern_orbital_cannon_barrage', duration: 1,
                        metadata: { helpful: true,
                            skillReplacements: { [ZOLTRAAK]: ZOLTRAAK_BARRAGE },
                            tooltipText: 'Zoltraak targets all enemies this turn.' },
                    },
                    tooltipText: 'The first enemy Physical or Chakra skill used against Fern is countered, granting 1 Magical Concealment stack. Otherwise, Zoltraak hits all enemies next turn.',
                } }],
        },
        {
            id: 'fern-perfect-barrier', name: 'Perfect Barrier',
            skillimage: 'https://i.imgur.com/0qUWHlN.png',
            skilldescription: 'Fern becomes invulnerable for 1 turn.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: 'fern_perfect_barrier', duration: 1, scope: 'self',
                metadata: { helpful: true, invulnerable: true,
                    tooltipText: 'Fern is invulnerable.' } }],
        },
        {
            id: ZOLTRAAK_BARRAGE, baseSkillId: ZOLTRAAK, useBaseSkillCooldown: true,
            hiddenFromSelectionViewer: true, name: 'Zoltraak',
            skillimage: 'https://i.imgur.com/55OkCpY.png',
            skilldescription: 'Fern deals 5 chakra damage to all enemies for each Magical Concealment stack. This uses Zoltraak’s current chakra cost.',
            energy: [], energyBySourceStatusMetadata: zoltraakCost,
            target: 'all-enemy', damage: 0, cooldown: 0,
            classes: ['Chakra', 'Instant'],
            effects: [{ type: 'damage', amount: 0, scope: 'all-enemy',
                metadata: { bonusPerStatusMetadata: {
                    scope: 'self', statusId: CONCEALMENT,
                    metadataKey: 'magicalConcealmentStacks', multiplier: 5,
                } } }],
        },
    ],
};
