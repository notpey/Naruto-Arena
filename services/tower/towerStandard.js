// Standard Tower (Tower 2.0): a finite 200-floor procedural climb. Pure data and seeded
// generation; towerRun.js calls into it whenever run.mode === 'standard'. Legacy runs (the
// Land of Waves / Chūnin Exams story) never touch this module.
//
// Structure: 200 floors = 20 segments of 10 floors = 10 regions of 20 floors.
//  - floors 10, 30, ..., 190: a single miniboss (champion) node;
//  - floors 20, 40, ..., 200: a single major boss node; floor 200 is the final boss and ends
//    the run in victory;
//  - floor 9 of every segment: every lane is a ramen stand, merchant or
//    recruit, so every route gets a recovery or shop stop right before each checkpoint.
// Only the current segment's ten floors are stored on the run. The next segment is built
// from (seed, segmentIndex, GENERATION_VERSION) when the checkpoint is cleared, so a run
// never serializes 200 floors and a reload can never change a committed segment.

const STANDARD = Object.freeze({
    mode: 'standard',
    rulesetVersion: 1,
    schemaVersion: 2,
    // 2: Fusion Chambers removed (fusion happens automatically). Segments already stored
    // on a run keep the version they were generated with.
    generationVersion: 2,
    contentVersion: 'tower-2.0',
    totalFloors: 200,
    segmentLength: 10,
    regionLength: 20,
    segments: 20,
    lanes: 3,
    // Active capacity (a starting hypothesis; see docs/tower-augment-decisions.md).
    teamScrollCap: 8,
    ninjaScrollCap: 5,
    // Chakra carried from one battle to the next is capped (Legacy keeps no cap).
    chakraCarryCap: 3,
    postBattleRegen: 20,
    salvageRyo: 10,
    // Major boss victory: the living recover this share of max health and regain a last life.
    majorBossHealPercent: 40,
    // A draft that has gone this many offers without a Prismatic forces one.
    prismaticPity: 15,
    // Major bosses on these floors always show one Prismatic offer.
    prismaticMilestones: [40, 80, 120, 160],
});

const REGIONS = [
    { title: 'The Misty Coast', scene: 'waves' },
    { title: 'Bamboo Thickets', scene: 'forest' },
    { title: 'The Ruined Outpost', scene: 'konoha' },
    { title: 'Valley of Echoes', scene: 'dusk' },
    { title: 'The Sand Wastes', scene: 'waves' },
    { title: 'Rain-Soaked Ruins', scene: 'forest' },
    { title: 'The Frozen Pass', scene: 'konoha' },
    { title: 'The Ember Caldera', scene: 'dusk' },
    { title: 'The Storm Peaks', scene: 'konoha' },
    { title: 'Summit of the Tower', scene: 'dusk' },
];
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

const SQUAD_NAMES = [
    'Rogue Shinobi', 'Masked Trackers', 'Mercenary Cell', 'Border Raiders', 'Deserter Band',
    'Hunter-nin Patrol', 'Smuggler Escort', 'Missing-nin Trio', 'Bounty Hunters', 'Shadow Patrol',
];
const ELITE_NAMES = ['The Ashen Fang', 'Widow of the Mist', 'The Nameless Jōnin', 'Mourning Blade', 'The Grey Lantern', 'Silent Choir'];

// ---------------------------------------------------------------- floor arithmetic
const segmentIndexOf = (floor) => Math.max(0, Math.floor((Math.max(1, floor) - 1) / STANDARD.segmentLength));
const regionIndexOf = (floor) => Math.max(0, Math.floor((Math.max(1, floor) - 1) / STANDARD.regionLength));
const isCheckpointFloor = (floor) => floor % STANDARD.segmentLength === 0;
const isMajorFloor = (floor) => floor % STANDARD.regionLength === 0;
const isFinalFloor = (floor) => floor === STANDARD.totalFloors;
const segmentRange = (segmentIndex) => ({
    firstFloor: segmentIndex * STANDARD.segmentLength + 1,
    lastFloor: (segmentIndex + 1) * STANDARD.segmentLength,
});
const regionFor = (floor) => {
    const index = regionIndexOf(floor);
    return { index, number: index + 1, name: `Region ${ROMAN[index]}`, ...REGIONS[index],
        firstFloor: index * STANDARD.regionLength + 1, lastFloor: (index + 1) * STANDARD.regionLength };
};

// Pacing bands (procedural intensity, not story chapters).
const BANDS = [
    { id: 'ramp', last: 40, label: 'Early ramp' },
    { id: 'synergy', last: 80, label: 'Developing synergy' },
    { id: 'pressure', last: 120, label: 'Build pressure' },
    { id: 'counterplay', last: 160, label: 'Advanced counterplay' },
    { id: 'late', last: 190, label: 'Late challenge' },
    { id: 'preparation', last: 199, label: 'Final preparation' },
    { id: 'capstone', last: 200, label: 'Capstone' },
];
const bandFor = (floor) => BANDS.find((band) => floor <= band.last) || BANDS[BANDS.length - 1];

// ---------------------------------------------------------------- difficulty
// Enemy health grows on a capped curve (1.0 on floor 1, ~1.76 on floor 100, ~1.95 on 200):
// later fights get harder through affixes, elites and bosses, not 500-health slogs.
const hpMultiplierFor = (floor) => Math.round((1 + (1 - Math.exp(-Math.max(0, floor - 1) / 70))) * 100) / 100;
const affixCountFor = (floor) => (floor <= 5 ? 0 : floor <= 40 ? 1 : floor <= 120 ? 2 : 3);
const ELITE_HP_BONUS = 0.45;
const CHAMPION_HP_BONUS = 0.6;

// Affix pairs that would remove all counterplay together (stun immunity plus heavy
// mitigation) never roll on the same squad.
const AFFIX_POOL = ['fortified', 'frenzied', 'regenerating', 'swift', 'hidden-mist', 'vengeful', 'stalwart', 'sand-shroud'];
const AFFIX_CONFLICTS = { stalwart: ['hidden-mist', 'sand-shroud'], 'hidden-mist': ['stalwart', 'sand-shroud'], 'sand-shroud': ['stalwart', 'hidden-mist'] };
const rollAffixes = (rng, shuffled, count) => {
    const picked = [];
    shuffled(AFFIX_POOL, rng).forEach((id) => {
        if (picked.length >= count) return;
        if (picked.some((other) => (AFFIX_CONFLICTS[other] || []).includes(id))) return;
        picked.push(id);
    });
    return picked;
};

// ---------------------------------------------------------------- segment map
const randomLaneTypes = (segmentIndex, rng, pickWeighted) => {
    const weights = [['battle', 46], ['event', 14], ['recruit', 7], ['merchant', 8], ['ramen', 10]];
    if (segmentIndex >= 1) weights.push(['elite', 10]);
    const types = Array.from({ length: STANDARD.lanes }, () => pickWeighted(weights, rng));
    if (!types.includes('battle')) types[Math.floor(rng() * STANDARD.lanes)] = 'battle';
    return types;
};

const floorTypesFor = (floor, rng, { pickWeighted, shuffled }) => {
    const segmentIndex = segmentIndexOf(floor);
    const position = floor - segmentIndex * STANDARD.segmentLength;
    if (position === 10) return [isMajorFloor(floor) ? 'boss' : 'miniboss'];
    if (position === 9) return shuffled(['ramen', 'merchant', 'recruit'], rng);
    if (floor === 1) return ['battle', 'battle', 'battle'];
    const types = randomLaneTypes(segmentIndex, rng, pickWeighted);
    if (position === 5 && !types.includes('elite')) {
        const lane = Math.floor(rng() * STANDARD.lanes);
        types[lane] = 'elite';
        if (!types.includes('battle')) types[(lane + 1) % STANDARD.lanes] = 'battle';
    }
    return types;
};

// tools: { createRng, pickWeighted, shuffled, linkFloors } from towerRun.js.
const generateSegment = (seed, segmentIndex, tools) => {
    const { createRng, linkFloors } = tools;
    const rng = createRng(seed, `standard:v${STANDARD.generationVersion}:segment:${segmentIndex}`);
    const { firstFloor, lastFloor } = segmentRange(segmentIndex);
    const floors = [];
    for (let floor = firstFloor; floor <= lastFloor; floor += 1) {
        floors.push(floorTypesFor(floor, rng, tools).map((type, lane) => ({
            id: `f${floor}-${lane}`, floor, lane, type, next: [],
            ...(type === 'boss' ? { bossId: `std-boss-f${floor}` } : {}),
        })));
    }
    linkFloors(floors, rng);
    return { segment: segmentIndex, generationVersion: STANDARD.generationVersion, floors };
};

// ---------------------------------------------------------------- bosses
const SCRIPTED_POOL = ['demon-of-the-mist', 'grass-ninja'];

// A skill the synthesized boss may telegraph: it deals damage to enemies and has no
// special use condition (so the server can always queue it).
const isTelegraphSkill = (skill) => Boolean(skill) &&
    ['single-enemy', 'all-enemies'].includes(skill.target) &&
    !skill.actorCondition && !skill.targetCondition && !skill.requiresPreparation &&
    !skill.hiddenFromSelectionViewer &&
    (skill.effects || []).some((effect) => effect?.type === 'damage' && Number(effect.amount) > 0);

const bossStatus = (statusId, name, icon, text, metadata) => ({
    statusId, duration: 99,
    metadata: { helpful: true, permanent: true, cannotBeCleansed: true, fromPassive: true,
        sourceSkillName: name, statusIcon: icon, tooltipText: text, ...metadata },
});

// Builds a telegraphed, three-phase boss around one roster character.
const synthesizeBoss = ({ floor, leaderId, companions, skillsOf, nameOf }) => {
    const skills = (skillsOf(leaderId) || []).filter(isTelegraphSkill).slice(0, 3);
    if (!skills.length) return null;
    const final = isFinalFloor(floor);
    const multiplier = hpMultiplierFor(floor);
    const damage = Math.round(5 + floor / 10);
    const reduction = Math.round(5 + floor / 25);
    const leaderName = nameOf(leaderId) || 'The Warden';
    const region = regionFor(floor);
    const rotation = skills.map((skill, index) => ({
        actorSlot: 0, skillId: skill.id, rule: index % 2 === 0 ? 'highest-hp' : 'lowest-hp',
    }));
    const unleashed = bossStatus(`tower_std_boss_unleashed`, 'Unleashed', 'assets/tower/boss-enrage.svg',
        `The boss is unleashed: +${damage} damage.`, { damageBonusFlat: damage });
    const fury = bossStatus(`tower_std_boss_last_stand`, 'Last Stand', 'assets/tower/boss-shukaku.svg',
        `A guard has fallen: the boss gains ${reduction} damage reduction and +${Math.round(damage / 2)} damage.`,
        { damageReductionFlat: reduction, damageBonusFlat: Math.round(damage / 2) });
    const hpCaps = final
        ? [Math.round(260 * multiplier), Math.round(140 * multiplier), Math.round(140 * multiplier)]
        : [Math.round(190 * multiplier), Math.round(120 * multiplier), Math.round(120 * multiplier)];
    return {
        bossId: `std-${final ? 'apex' : 'warden'}-f${floor}-${leaderId}`,
        generic: true,
        act: null,
        name: final ? `${leaderName}, Apex of the Tower` : `${leaderName}, Warden of ${region.title.replace(/^The /, '')}`,
        title: final ? 'Floor 200 — The Final Ascent' : `Floor ${floor} Boss — ${region.name}`,
        enemyIds: [leaderId, ...companions],
        hpCaps,
        intro: final
            ? `At the top of the Tower, ${leaderName} waits with two guards. Two hundred floors end here.`
            : `${leaderName} holds the stairway out of ${region.title}, flanked by two guards.`,
        mechanics: [
            `${leaderName} announces the next technique a turn ahead. Telegraphed techniques are always paid for.`,
            'Stun the boss before its turn to interrupt the telegraphed technique, or protect the named target.',
            `Phase 2: at half health the boss is unleashed (+${damage} damage).`,
            `Phase 3: when the guard in the second slot falls, the boss gains ${reduction} damage reduction and +${Math.round(damage / 2)} damage.`,
        ],
        rotation,
        fallback: rotation[0],
        trigger: {
            watchSlot: 0, actorSlot: 0, skillId: rotation[0].skillId, rule: 'highest-hp', phase: 2,
            applyStatus: unleashed, event: `${leaderName} is unleashed!`,
        },
        enrage: { whenDeadSlot: 1, targetSlot: 0, status: fury, phase: 3,
            event: `A guard has fallen. ${leaderName} makes a last stand.` },
        phaseLabels: { 2: 'Unleashed', 3: 'Last stand' },
        victoryText: final
            ? `${leaderName} fell. The Tower is conquered: two hundred floors climbed.`
            : `${leaderName} fell. The way out of ${region.title} is open.`,
    };
};

// ---------------------------------------------------------------- rewards
// Starting targets for draft tier weights (Common, Rare, Forbidden, Prismatic), by floor
// band and reward table. Tunable; boss tables are separately and markedly better.
const W = (common, rare, forbidden, prismatic) =>
    [['common', common], ['rare', rare], ['forbidden', forbidden], ['prismatic', prismatic]].filter(([, weight]) => weight > 0);
const TIER_WEIGHTS = {
    battle: { early: W(60, 32, 7, 1), mid: W(35, 40, 20, 5), late: W(20, 35, 32, 13) },
    elite: { early: W(30, 50, 17, 3), mid: W(15, 45, 32, 8), late: W(5, 40, 40, 15) },
    champion: { early: W(10, 50, 35, 5), mid: W(5, 35, 48, 12), late: W(0, 30, 50, 20) },
    boss: { early: W(0, 40, 48, 12), mid: W(0, 25, 50, 25), late: W(0, 15, 50, 35) },
    merchant: { early: W(55, 35, 9, 1), mid: W(35, 40, 20, 5), late: W(20, 38, 32, 10) },
    starting: { early: W(50, 50, 0, 0), mid: W(50, 50, 0, 0), late: W(50, 50, 0, 0) },
    kage: { early: W(0, 0, 100, 0), mid: W(0, 0, 100, 0), late: W(0, 0, 100, 0) },
};
const weightBand = (floor) => (floor <= 40 ? 'early' : floor <= 120 ? 'mid' : 'late');
const tierWeightsFor = (table, floor) => (TIER_WEIGHTS[table] || TIER_WEIGHTS.battle)[weightBand(floor)];
const MERCHANT_PRICES = { common: 45, rare: 80, forbidden: 130, prismatic: 190, medkit: 35 };

// Run ryō per win, by encounter kind (checkpoints pay more).
const RYO_REWARDS = { battle: 25, elite: 45, champion: 60, boss: 80 };

// Account ryō for a finished Standard run: per floor cleared, plus each checkpoint cleared,
// plus the completion bonus. Abandoning pays nothing, as in Legacy.
const ACCOUNT = { perFloor: 5, perMiniboss: 40, perMajorBoss: 80, completion: 600 };
const computeAccountReward = (run) => {
    const floorsCleared = Math.max(0, Math.min(STANDARD.totalFloors, Number(run.floor) || 0));
    const minis = Math.floor((floorsCleared + 10) / 20);
    const majors = Math.floor(floorsCleared / 20);
    const victory = run.status === 'victory' && floorsCleared >= STANDARD.totalFloors;
    return {
        floorsCleared,
        ryo: floorsCleared * ACCOUNT.perFloor + minis * ACCOUNT.perMiniboss + majors * ACCOUNT.perMajorBoss +
            (victory ? ACCOUNT.completion : 0),
    };
};

module.exports = {
    TIER_WEIGHTS,
    tierWeightsFor,
    MERCHANT_PRICES,
    RYO_REWARDS,
    ACCOUNT,
    computeAccountReward,
    STANDARD,
    REGIONS,
    BANDS,
    SQUAD_NAMES,
    ELITE_NAMES,
    SCRIPTED_POOL,
    ELITE_HP_BONUS,
    CHAMPION_HP_BONUS,
    segmentIndexOf,
    regionIndexOf,
    regionFor,
    bandFor,
    segmentRange,
    isCheckpointFloor,
    isMajorFloor,
    isFinalFloor,
    hpMultiplierFor,
    affixCountFor,
    rollAffixes,
    generateSegment,
    isTelegraphSkill,
    synthesizeBoss,
};
