// Forbidden Scrolls: the run-long upgrades a Tower run collects.
//
// Every scroll is expressed with status metadata the combat engine already understands
// (damage bonuses, damage reduction, cost reductions, stun immunity, healing, turn-end
// triggers). At the start of each Tower battle the server applies them as permanent,
// uncleansable statuses, so battleLogic.js resolves them exactly like any character
// passive. Nothing here changes how combat itself works.

// Cursed scrolls are never offered as rewards: events and bosses force them on a ninja.
const SCROLL_TIERS = Object.freeze({
    genin: { key: 'genin', label: 'Genin', rank: 1 },
    jonin: { key: 'jonin', label: 'Jōnin', rank: 2 },
    kage: { key: 'kage', label: 'Kage', rank: 3 },
    cursed: { key: 'cursed', label: 'Cursed', rank: 4 },
});
const OFFERED_TIERS = new Set(['genin', 'jonin', 'kage']);

const CHAKRA_TYPES = ['taijutsu', 'ninjutsu', 'genjutsu', 'bloodline'];
const CHAKRA_LABELS = { taijutsu: 'Taijutsu', ninjutsu: 'Ninjutsu', genjutsu: 'Genjutsu', bloodline: 'Bloodline' };

const iconFor = (id) => `assets/tower/scrolls/${id}.svg`;

// scope: 'ninja' scrolls bind to one chosen ninja; 'team' scrolls apply to every ninja.
// metadata: status metadata keys read by battleLogic (totals, turn-end and kill hooks).
// maxHpBonus: applied by the Tower run itself (it raises the ninja's carried max HP).
// runOnly: the scroll changes the run (ryō), not battles, so it builds no status.
// pairsWith: scroll ids that combo with this one. Owning one half makes the other more
//   likely to be offered, and the description names the pairing.
// upgradesTo: the scroll Kakashi's training turns this one into.
const SCROLL_DEFINITIONS = [
    // ------------------------------------------------------------ Genin
    {
        id: 'sharpened-kunai', name: 'Sharpened Kunai', tier: 'genin', scope: 'ninja', kanji: '刃',
        description: 'This ninja deals 5 additional non-affliction damage.',
        metadata: { nonAfflictionDamageBonusFlat: 5 },
        upgradesTo: 'chakra-blades',
    },
    {
        id: 'flak-jacket', name: 'Flak Jacket', tier: 'genin', scope: 'ninja', kanji: '鎧',
        description: 'This ninja gains 5 permanent damage reduction.',
        metadata: { damageReductionFlat: 5 },
        upgradesTo: 'steel-skin',
    },
    {
        id: 'chakra-weave', name: 'Chakra Weave', tier: 'genin', scope: 'ninja', kanji: '練',
        variants: CHAKRA_TYPES,
        description: (variant) => `This ninja's skills cost 1 less ${CHAKRA_LABELS[variant]} chakra.`,
        metadata: (variant) => ({ [`${variant}CostReduction`]: 1 }),
        nameFor: (variant) => `Chakra Weave: ${CHAKRA_LABELS[variant]}`,
    },
    {
        id: 'vitality-seal', name: 'Vitality Seal', tier: 'genin', scope: 'ninja', kanji: '命',
        description: 'This ninja gains 20 maximum health for the rest of the run, and heals 20 now.',
        metadata: {}, maxHpBonus: 20,
    },
    {
        id: 'soldier-pills', name: 'Soldier Pills', tier: 'genin', scope: 'team', kanji: '糧',
        description: 'Your ninjas receive 5 additional health from every heal.',
        metadata: { healReceivedBonusFlat: 5 },
        pairsWith: ['medical-ninjutsu'],
    },
    {
        id: 'ninja-wire', name: 'Ninja Wire', tier: 'genin', scope: 'ninja', kanji: '糸',
        description: 'This ninja takes 10 less damage from Physical skills.',
        metadata: { physicalDamageReductionFlat: 10 },
    },
    {
        id: 'leg-weights', name: 'Leg Weights', tier: 'genin', scope: 'ninja', kanji: '重',
        description: "This ninja's Physical skills deal 10 additional damage on hit.",
        metadata: { damageBonusBySkillClass: { Physical: 10 } },
    },
    {
        id: 'akimichi-rations', name: 'Akimichi Rations', tier: 'genin', scope: 'ninja', kanji: '飯',
        description: 'At the end of your turn, this ninja heals 10% of their current health.',
        metadata: { turnEndHealPercentCurrent: 10 },
        pairsWith: ['konoha-herb-salve', 'eight-inner-gates'],
    },
    {
        id: 'paper-bomb-tags', name: 'Paper Bomb Tags', tier: 'genin', scope: 'ninja', kanji: '爆',
        description: 'At the end of your turn, a random enemy takes 5 damage.',
        metadata: { turnEndRandomEnemyDamage: 5 },
        pairsWith: ['shadow-clone-swarm'],
    },
    {
        id: 'ryo-pouch', name: 'Ryō Pouch', tier: 'genin', scope: 'team', kanji: '財',
        description: 'Every battle you win pays 10 additional ryō.',
        metadata: {}, runOnly: true,
    },

    // ------------------------------------------------------------ Jōnin
    {
        id: 'chakra-blades', name: 'Chakra Blades', tier: 'jonin', scope: 'ninja', kanji: '刀',
        description: 'This ninja deals 10 additional non-affliction damage.',
        metadata: { nonAfflictionDamageBonusFlat: 10 },
    },
    {
        id: 'medical-ninjutsu', name: 'Medical Ninjutsu', tier: 'jonin', scope: 'team', kanji: '医',
        description: 'Your ninjas heal 5 health at the end of each turn.',
        metadata: { turnEndHealFlat: 5 },
        pairsWith: ['soldier-pills', 'konoha-herb-salve', 'eight-inner-gates'],
    },
    {
        id: 'steel-skin', name: 'Steel Skin', tier: 'jonin', scope: 'ninja', kanji: '鋼',
        description: 'This ninja gains 10 permanent damage reduction.',
        metadata: { damageReductionFlat: 10 },
    },
    {
        id: 'iron-will', name: 'Iron Will', tier: 'jonin', scope: 'ninja', kanji: '志',
        description: 'This ninja ignores full stuns. Stuns that only block some skill classes still apply.',
        metadata: { stunImmune: true },
    },
    {
        id: 'sand-armor', name: 'Sand Armor', tier: 'jonin', scope: 'ninja', kanji: '砂',
        description: 'This ninja gains 5 damage reduction that piercing damage cannot ignore.',
        metadata: { unpierceableDamageReductionFlat: 5 },
    },
    {
        id: 'hunter-nin-training', name: 'Hunter-nin Training', tier: 'jonin', scope: 'ninja', kanji: '狩',
        description: 'When this ninja kills an enemy, they heal 20 health and your team gains 1 random chakra.',
        metadata: {
            onOwnerKillHealSelfAmount: 20,
            onOwnerKillGainChakra: { chakraType: 'random', amount: 1 },
            onOwnerKillTargetRelation: 'enemy',
        },
    },
    {
        id: 'will-of-the-fallen', name: 'Will of the Fallen', tier: 'jonin', scope: 'ninja', kanji: '弔',
        description: 'This ninja deals 15 additional damage for each fallen ally.',
        metadata: { damageBonusPerDeadAlly: { amount: 15 } },
    },
    {
        id: 'konoha-herb-salve', name: 'Konoha Herb Salve', tier: 'jonin', scope: 'ninja', kanji: '薬',
        description: 'Healing this ninja receives is increased by 50%.',
        metadata: { healReceivedMultiplier: 1.5 },
        pairsWith: ['medical-ninjutsu', 'akimichi-rations'],
    },
    {
        id: 'kankuro-poison', name: "Kankurō's Poison", tier: 'jonin', scope: 'ninja', kanji: '毒',
        description: 'At the end of your turn, a random enemy is poisoned: 5 affliction damage a turn for 3 turns.',
        metadata: {
            turnEndApplyStatusToRandomEnemy: {
                statusId: 'tower_scroll_kankuro_poison_dot',
                duration: 3,
                metadata: {
                    harmful: true,
                    afflictionDamage: true,
                    turnEndDamage: 5,
                    sourceSkillName: "Kankurō's Poison",
                    statusIcon: 'assets/tower/scrolls/kankuro-poison.svg',
                    tooltipText: 'Poisoned: 5 affliction damage at the end of each turn.',
                },
            },
        },
    },
    {
        id: 'shadow-clone-swarm', name: 'Shadow Clone Swarm', tier: 'jonin', scope: 'ninja', kanji: '影',
        description: 'At the end of your turn, a random enemy takes 10 damage.',
        metadata: { turnEndRandomEnemyDamage: 10 },
        pairsWith: ['paper-bomb-tags'],
    },
    {
        id: 'sharingan-foresight', name: 'Sharingan Foresight', tier: 'jonin', scope: 'ninja', kanji: '写',
        description: 'This ninja takes 20% less damage from non-affliction attacks.',
        metadata: { damageReductionPercent: 20 },
    },

    // ------------------------------------------------------------ Kage
    {
        id: 'will-of-fire', name: 'Will of Fire', tier: 'kage', scope: 'team', kanji: '火',
        description: 'Your ninjas deal 5 additional damage and gain 5 damage reduction.',
        metadata: { damageBonusFlat: 5, damageReductionFlat: 5 },
    },
    {
        id: 'curse-mark', name: 'Curse Mark', tier: 'kage', scope: 'ninja', kanji: '呪',
        description: 'This ninja deals 20 additional damage, but takes 10 additional damage from every hit.',
        metadata: { damageBonusFlat: 20, damageTakenBonusFlat: 10 },
    },
    {
        id: 'sage-training', name: 'Sage Training', tier: 'kage', scope: 'ninja', kanji: '仙',
        description: "This ninja's skills cost 1 less random chakra.",
        metadata: { randomCostReduction: 1 },
    },
    {
        id: 'eight-inner-gates', name: 'Eight Inner Gates', tier: 'kage', scope: 'ninja', kanji: '門',
        description: "At the end of your turn, this ninja's damage rises by 5 (up to 25), and they lose 5 health.",
        metadata: {
            damageBonusFlat: 0,
            growPerTurn: [{ key: 'damageBonusFlat', amount: 5, max: 25 }],
            turnEndHealthLoss: 5,
        },
        pairsWith: ['medical-ninjutsu', 'akimichi-rations'],
    },
    {
        id: 'flying-thunder-god', name: 'Flying Thunder God Formula', tier: 'kage', scope: 'ninja', kanji: '雷',
        description: "This ninja's cooldowns recover twice as fast.",
        metadata: { ownerTurnEndExtraCooldownTicksAllSkills: 1 },
    },
    {
        id: 'nine-tails-chakra', name: 'Nine-Tails Chakra', tier: 'kage', scope: 'ninja', kanji: '狐',
        description: 'While this ninja lives, your team gains 1 random chakra at the end of your turn.',
        metadata: { turnEndGainChakra: { chakraType: 'random', amount: 1 } },
    },
    {
        id: 'undying-will', name: 'Undying Will', tier: 'kage', scope: 'ninja', kanji: '生',
        description: 'Once per battle, when this ninja would die, they rise again with 30 health.',
        metadata: {
            onOwnerDeathReviveToHp: 30,
            onOwnerDeathApplyStatusToSelf: {
                statusId: 'tower_scroll_undying_will_spent',
                duration: 1,
                metadata: { helpful: true, sourceSkillName: 'Undying Will', tooltipText: 'Rose again with Undying Will.' },
            },
        },
    },
    {
        id: 'forbidden-pact', name: 'Forbidden Pact', tier: 'kage', scope: 'ninja', kanji: '契',
        description: 'This ninja deals 15 additional damage, but their skills cost 1 more random chakra.',
        metadata: { damageBonusFlat: 15, randomCostIncrease: 1 },
    },
    {
        id: 'demonic-illusion', name: 'Demonic Illusion', tier: 'kage', scope: 'ninja', kanji: '幻',
        description: 'At the end of your turn, a random enemy is stunned for 1 turn, and this ninja loses 10 health.',
        metadata: {
            turnEndApplyStatusToRandomEnemy: {
                statusId: 'tower_scroll_demonic_illusion_stun',
                duration: 1,
                metadata: {
                    harmful: true,
                    cannotUseSkills: true,
                    sourceSkillName: 'Demonic Illusion',
                    statusIcon: 'assets/tower/scrolls/demonic-illusion.svg',
                    tooltipText: 'Trapped in a genjutsu: cannot use skills.',
                },
            },
            turnEndHealthLoss: 10,
        },
    },

    // ------------------------------------------------------------ Cursed (forced by events and bosses)
    {
        id: 'cursed-seal-of-heaven', name: 'Cursed Seal of Heaven', tier: 'cursed', scope: 'ninja', kanji: '天',
        description: "Orochimaru's mark. This ninja deals 15 additional damage, but loses 5 health at the end of your turn.",
        metadata: { damageBonusFlat: 15, turnEndHealthLoss: 5 },
    },
    {
        id: 'executioners-shard', name: "Executioner's Shard", tier: 'cursed', scope: 'ninja', kanji: '斬',
        description: 'A shard of a Mist blade. This ninja deals 15 additional non-affliction damage and heals 15 on a kill, but takes 5 additional damage from every hit.',
        metadata: {
            nonAfflictionDamageBonusFlat: 15,
            onOwnerKillHealSelfAmount: 15,
            onOwnerKillTargetRelation: 'enemy',
            damageTakenBonusFlat: 5,
        },
    },
];

const SCROLLS_BY_ID = new Map(SCROLL_DEFINITIONS.map((scroll) => [scroll.id, scroll]));

// A scroll key is "<id>" or "<id>:<variant>" (Chakra Weave carries its chakra type).
const parseScrollKey = (key) => {
    const [id, variant = ''] = String(key || '').split(':');
    const scroll = SCROLLS_BY_ID.get(id);
    if (!scroll) return null;
    if (scroll.variants && !scroll.variants.includes(variant)) return null;
    if (!scroll.variants && variant) return null;
    return { scroll, variant };
};

const resolveValue = (value, variant) => (typeof value === 'function' ? value(variant) : value);

const scrollName = (id) => SCROLLS_BY_ID.get(id)?.name || id;

// The client-facing description of a scroll key.
const describeScroll = (key) => {
    const parsed = parseScrollKey(key);
    if (!parsed) return null;
    const { scroll, variant } = parsed;
    const pairs = (scroll.pairsWith || []).map(scrollName);
    return {
        key,
        id: scroll.id,
        name: scroll.nameFor ? scroll.nameFor(variant) : scroll.name,
        tier: scroll.tier,
        tierLabel: SCROLL_TIERS[scroll.tier].label,
        scope: scroll.scope,
        kanji: scroll.kanji,
        icon: iconFor(scroll.id),
        description: resolveValue(scroll.description, variant),
        pairsWith: pairs,
        upgradesTo: scroll.upgradesTo ? scrollName(scroll.upgradesTo) : null,
    };
};

// The permanent status a scroll grants inside a battle (null for run-only scrolls).
const buildScrollStatus = (key) => {
    const parsed = parseScrollKey(key);
    if (!parsed || parsed.scroll.runOnly) return null;
    const { scroll, variant } = parsed;
    const info = describeScroll(key);
    return {
        statusId: `tower_scroll_${scroll.id.replace(/-/g, '_')}${variant ? `_${variant}` : ''}`,
        duration: 99,
        metadata: {
            helpful: true,
            permanent: true,
            cannotBeCleansed: true,
            fromPassive: true,
            towerScroll: key,
            sourceSkillName: `${info.name} (${info.tierLabel} Scroll)`,
            statusIcon: info.icon,
            tooltipText: info.description,
            // Cloned so turn-end growth on one battle's status never leaks into the definition.
            ...JSON.parse(JSON.stringify(resolveValue(scroll.metadata, variant) || {})),
        },
    };
};

const getScrollMaxHpBonus = (key) => Math.max(0, Number(parseScrollKey(key)?.scroll?.maxHpBonus) || 0);

const getScrollPairs = (key) => parseScrollKey(key)?.scroll?.pairsWith || [];

const getScrollUpgrade = (key) => parseScrollKey(key)?.scroll?.upgradesTo || null;

const isOfferedScroll = (key) => OFFERED_TIERS.has(parseScrollKey(key)?.scroll?.tier);

const isCursedScroll = (key) => parseScrollKey(key)?.scroll?.tier === 'cursed';

// Every concrete key (Chakra Weave expands to one key per chakra type).
const ALL_SCROLL_KEYS = SCROLL_DEFINITIONS.flatMap((scroll) =>
    scroll.variants ? scroll.variants.map((variant) => `${scroll.id}:${variant}`) : [scroll.id]);

// The keys rewards, merchants and trainers may offer (cursed scrolls excluded).
const OFFERED_SCROLL_KEYS = ALL_SCROLL_KEYS.filter(isOfferedScroll);

module.exports = {
    SCROLL_TIERS,
    SCROLL_DEFINITIONS,
    ALL_SCROLL_KEYS,
    OFFERED_SCROLL_KEYS,
    CHAKRA_TYPES,
    CHAKRA_LABELS,
    parseScrollKey,
    describeScroll,
    buildScrollStatus,
    getScrollMaxHpBonus,
    getScrollPairs,
    getScrollUpgrade,
    isOfferedScroll,
    isCursedScroll,
};
