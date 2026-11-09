// Forbidden Scrolls: the run-long upgrades a Tower run collects.
//
// Every scroll is expressed with status metadata the combat engine already understands
// (damage bonuses, damage reduction, cost reductions, stun immunity, healing). At the
// start of each Tower battle the server applies them as permanent, uncleansable statuses,
// so battleLogic.js resolves them exactly like any character passive. Nothing here
// changes how combat itself works.

const SCROLL_TIERS = Object.freeze({
    genin: { key: 'genin', label: 'Genin', rank: 1 },
    jonin: { key: 'jonin', label: 'Jōnin', rank: 2 },
    kage: { key: 'kage', label: 'Kage', rank: 3 },
});

const CHAKRA_TYPES = ['taijutsu', 'ninjutsu', 'genjutsu', 'bloodline'];
const CHAKRA_LABELS = { taijutsu: 'Taijutsu', ninjutsu: 'Ninjutsu', genjutsu: 'Genjutsu', bloodline: 'Bloodline' };

const iconFor = (id) => `assets/tower/scrolls/${id}.svg`;

// scope: 'ninja' scrolls bind to one chosen ninja; 'team' scrolls apply to every ninja.
// metadata: status metadata keys read by battleLogic's getStatusMetadataTotals.
// maxHpBonus: applied by the Tower run itself (it raises the ninja's carried max HP).
const SCROLL_DEFINITIONS = [
    {
        id: 'sharpened-kunai', name: 'Sharpened Kunai', tier: 'genin', scope: 'ninja', kanji: '刃',
        description: 'This ninja deals 5 additional non-affliction damage.',
        metadata: { nonAfflictionDamageBonusFlat: 5 },
    },
    {
        id: 'flak-jacket', name: 'Flak Jacket', tier: 'genin', scope: 'ninja', kanji: '鎧',
        description: 'This ninja gains 5 permanent damage reduction.',
        metadata: { damageReductionFlat: 5 },
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
    },
    {
        id: 'chakra-blades', name: 'Chakra Blades', tier: 'jonin', scope: 'ninja', kanji: '刀',
        description: 'This ninja deals 10 additional non-affliction damage.',
        metadata: { nonAfflictionDamageBonusFlat: 10 },
    },
    {
        id: 'medical-ninjutsu', name: 'Medical Ninjutsu', tier: 'jonin', scope: 'team', kanji: '医',
        description: 'Your ninjas heal 5 health at the end of each turn.',
        metadata: { turnEndHealFlat: 5 },
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

// The client-facing description of a scroll key.
const describeScroll = (key) => {
    const parsed = parseScrollKey(key);
    if (!parsed) return null;
    const { scroll, variant } = parsed;
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
    };
};

// The permanent status a scroll grants inside a battle.
const buildScrollStatus = (key) => {
    const parsed = parseScrollKey(key);
    if (!parsed) return null;
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
            ...resolveValue(scroll.metadata, variant),
        },
    };
};

const getScrollMaxHpBonus = (key) => Math.max(0, Number(parseScrollKey(key)?.scroll?.maxHpBonus) || 0);

// Every concrete key (Chakra Weave expands to one key per chakra type).
const ALL_SCROLL_KEYS = SCROLL_DEFINITIONS.flatMap((scroll) =>
    scroll.variants ? scroll.variants.map((variant) => `${scroll.id}:${variant}`) : [scroll.id]);

module.exports = {
    SCROLL_TIERS,
    SCROLL_DEFINITIONS,
    ALL_SCROLL_KEYS,
    parseScrollKey,
    describeScroll,
    buildScrollStatus,
    getScrollMaxHpBonus,
};
