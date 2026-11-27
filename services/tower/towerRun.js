// The Tower: a PvE roguelike run. This module is pure run logic. It decides what the
// player is offered and keeps the run's state (team, health, scrolls, ryo, map). It
// never resolves combat: Tower battles are ordinary server matches resolved by
// battleLogic.js, and only their outcome (winner and each ninja's remaining health)
// comes back here.
//
// Every random choice is seeded by the run's seed and a fixed label, so refreshing a
// page or retrying a request can never reroll an offer.
//
// Two modes share this module (run.mode; a run saved before modes existed is 'legacy'):
//  - legacy: acts of ten floors (towerActs.js). Act I ends at Zabuza on floor 10, where the
//    player may retire or continue into Act II, the Chūnin Exams (20 floors at most).
//  - standard: Tower 2.0, a finite 200-floor procedural climb (towerStandard.js) with the
//    four-tier augment catalog, capacity limits and automatic fusion (taking the second
//    augment of a recipe fuses the pair on the spot).
// The mode is fixed when a run is created and never changes.

const {
    OFFERED_SCROLL_KEYS, SCROLL_TIERS, parseScrollKey, describeScroll, getScrollMaxHpBonus,
    getScrollPairs, getScrollUpgrade, isCursedScroll,
    STANDARD_OFFERED_SCROLL_KEYS, standardTierOf, getScrollSetup, COMMON_AUGMENT_KEYS,
} = require('./towerScrolls');
const towerBoss = require('./towerBoss');
const towerActs = require('./towerActs');
const towerStandard = require('./towerStandard');
const { RECIPES, RECIPES_BY_ID } = require('./towerFusions');
const { AUGMENTS_BY_CODE } = require('./towerAugments');
const { EVENT_IDS_BY_POOL, getEvent } = require('./towerEvents');

const { STANDARD } = towerStandard;
const MODES = Object.freeze({
    standard: { id: 'standard', label: 'Standard', totalFloors: STANDARD.totalFloors },
    legacy: { id: 'legacy', label: 'Legacy', totalFloors: 20 },
});
const modeOf = (run) => (run?.mode === 'standard' ? 'standard' : 'legacy');
const isStandard = (run) => modeOf(run) === 'standard';

const { ACTS } = towerActs;
const TOTAL_FLOORS = ACTS[1].lastFloor;
const MAX_FLOORS = ACTS[towerActs.FINAL_ACT].lastFloor;
const ELITE_FLOOR = 5;
const REST_FLOOR = 9;
const BOSS_FLOOR = TOTAL_FLOORS;
const LANES = 3;
const BASE_MAX_HP = 100;
const STARTING_RYO = 40;
const WOUNDED_HP_FRACTION = 0.25;
const DRAFT_REROLLS_PER_SLOT = 1;
// Survivors of a won fight recover this much health before the next node.
const POST_BATTLE_REGEN = 25;

const RYO_REWARDS = { battle: 30, elite: 60, duel: 40, boss: 60, skipScroll: 15, pouch: 10 };
const RAMEN = { feastPercent: 40, restSlotPercent: 100 };
const MERCHANT_PRICES = { genin: 45, jonin: 80, kage: 130, medkit: 35 };
const MEDKIT_HEAL_PERCENT = 30;
// Account ryo granted once when a run ends (defeat or victory; abandoning grants nothing).
const ACCOUNT_RYO_PER_FLOOR = 15;
const ACCOUNT_RYO_BOSS_BONUS = ACTS[1].accountBossBonus;
// Reaching the forest's central tower with both scrolls, or without them.
const EXAM_TOWER = { healPercent: 40, ryo: 30, penalty: 25 };

const ACTIVE_STATUSES = new Set(['draft', 'map', 'battle', 'ramen', 'merchant', 'recruit', 'reward', 'event', 'interlude', 'fusion']);
const ENDED_STATUSES = new Set(['victory', 'defeated', 'abandoned']);

const NODE_TYPES = {
    battle: { label: 'Battle' },
    elite: { label: 'Elite' },
    boss: { label: 'Boss' },
    ramen: { label: 'Ramen Stand' },
    merchant: { label: 'Merchant' },
    recruit: { label: 'Recruit' },
    event: { label: 'Event' },
    exam: { label: 'Written Exam' },
    duel: { label: 'Duel' },
    training: { label: 'Training' },
    miniboss: { label: 'Champion' },
    // Retired: segments generated before automatic fusion may still hold one; it now rests.
    fusion: { label: 'Ramen Stand' },
};
const COMBAT_NODE_TYPES = new Set(['battle', 'elite', 'boss', 'duel', 'miniboss']);
const EVENT_NODE_TYPES = new Set(['event', 'exam', 'training']);

const SQUAD_NAMES = [
    "Gatō's Hired Swords", 'Mist Hunter-nin', 'Rogue Genin Cell', 'Bandits of the Great Bridge',
    'Deserters of the Mist', 'Wave Country Mercenaries', 'Masked Trackers', 'Fog Raiders',
];
const ELITE_NAMES = ['The Ashen Fang', 'Widow of the Mist', 'The Nameless Jonin', 'Mourning Blade'];

// Enemy affixes are plain status metadata too, applied to every unit of the enemy team.
// acts: the acts whose squads may roll the affix.
const AFFIXES = {
    fortified: { id: 'fortified', name: 'Fortified', kanji: '堅', acts: [1, 2],
        description: 'These enemies have 5 damage reduction.', metadata: { damageReductionFlat: 5 } },
    frenzied: { id: 'frenzied', name: 'Frenzied', kanji: '狂', acts: [1, 2],
        description: 'These enemies deal 5 additional damage.', metadata: { damageBonusFlat: 5 } },
    regenerating: { id: 'regenerating', name: 'Regenerating', kanji: '癒', acts: [1, 2],
        description: 'These enemies heal 5 health at the end of each turn.', metadata: { turnEndHealFlat: 5 } },
    swift: { id: 'swift', name: 'Swift', kanji: '迅', acts: [1, 2],
        description: "These enemies' skills cost 1 less random chakra.", metadata: { randomCostReduction: 1 } },
    'hidden-mist': { id: 'hidden-mist', name: 'Hidden Mist', kanji: '霧', acts: [1],
        description: 'These enemies take 15% less damage from non-affliction attacks.', metadata: { damageReductionPercent: 15 } },
    vengeful: { id: 'vengeful', name: 'Vengeful', kanji: '仇', acts: [1, 2],
        description: 'These enemies deal 10 additional damage for each of their fallen allies.',
        metadata: { damageBonusPerDeadAlly: { amount: 10 } } },
    stalwart: { id: 'stalwart', name: 'Stalwart', kanji: '不', acts: [2],
        description: 'These enemies ignore full stuns.', metadata: { stunImmune: true } },
    'sand-shroud': { id: 'sand-shroud', name: 'Sand Shroud', kanji: '砂', acts: [2],
        description: 'These enemies have 5 damage reduction that piercing damage cannot ignore.',
        metadata: { unpierceableDamageReductionFlat: 5 } },
};
const AFFIX_IDS = Object.keys(AFFIXES);
const affixPool = (act) => AFFIX_IDS.filter((id) => AFFIXES[id].acts.includes(act));

// Every duelist gains 1 extra random chakra a turn, so a lone fighter can still act.
const DUEL_RULE_STATUS = {
    statusId: 'tower_duel_proctor_rules',
    duration: 99,
    metadata: {
        helpful: true, permanent: true, cannotBeCleansed: true, fromPassive: true,
        sourceSkillName: "Proctor's Rules", statusIcon: 'assets/tower/node-duel.svg',
        tooltipText: 'A duel: this fighter gains 1 random chakra at the end of their turn.',
        turnEndGainChakra: { chakraType: 'random', amount: 1 },
    },
};

// ---------------------------------------------------------------- seeded randomness
const hashString = (text) => {
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
        hash ^= text.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
};

const createRng = (seed, label) => {
    let state = hashString(`${seed}:${label}`) || 1;
    return () => {
        state = (state + 0x6D2B79F5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

const shuffled = (items, rng) => {
    const next = items.slice();
    for (let index = next.length - 1; index > 0; index -= 1) {
        const swap = Math.floor(rng() * (index + 1));
        [next[index], next[swap]] = [next[swap], next[index]];
    }
    return next;
};

const pickWeighted = (entries, rng) => {
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = rng() * total;
    for (const [value, weight] of entries) {
        roll -= weight;
        if (roll < 0) return value;
    }
    return entries[entries.length - 1][0];
};

// ---------------------------------------------------------------- errors
class TowerError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
    }
}
const fail = (message, status) => { throw new TowerError(message, status); };

// ---------------------------------------------------------------- team helpers
const memberMaxHp = (member) => BASE_MAX_HP +
    (member.scrolls || []).reduce((sum, key) => sum + getScrollMaxHpBonus(key), 0);

const allOwnedKeys = (run) => [
    ...(run.teamScrolls || []),
    ...(run.team || []).filter((member) => !isDead(member)).flatMap((member) => member.scrolls || []),
];

// fallen: died once and was carried out at 1 health. dead: died a second time; the
// ninja stays dead for the rest of the run (a recruit can still take the slot).
// carriedStatuses: the ninja's own stacks, carried from one Tower battle to the next.
const createMember = (characterId) => ({
    characterId, hp: BASE_MAX_HP, scrolls: [], fallen: false, dead: false, carriedStatuses: [],
});

const isDead = (member) => Boolean(member?.dead);

const healMember = (member, amount) => {
    if (isDead(member)) return;
    member.hp = Math.min(memberMaxHp(member), Math.max(0, Number(member.hp) || 0) + Math.max(0, amount));
};

// Run-side health loss (events). It never kills: a ninja is left with at least 1 health.
const hurtMember = (member, amount) => {
    if (isDead(member)) return;
    member.hp = Math.max(1, (Number(member.hp) || 1) - Math.max(0, amount));
};

const isWounded = (member) => !isDead(member) && member.hp <= memberMaxHp(member) * WOUNDED_HP_FRACTION;

const requireSlot = (run, slot) => {
    if (!Number.isInteger(slot) || slot < 0 || slot >= run.team.length) fail('Choose one of your ninjas.');
    return run.team[slot];
};

const requireLivingSlot = (run, slot) => {
    const member = requireSlot(run, slot);
    if (isDead(member)) fail('That ninja has fallen for good.');
    return member;
};

const actOf = (run) => ACTS[run.act] || ACTS[1];

// ---------------------------------------------------------------- run creation and draft
// The draft offers three candidates for each of the three team slots, nine distinct
// ninjas in all. Each slot can be rerolled on its own.
const buildDraftOffers = (seed, rosterIds) => {
    const pool = shuffled(rosterIds, createRng(seed, 'draft:0'));
    if (pool.length < 9) fail('The roster is too small for a Tower draft.', 500);
    return [pool.slice(0, 3), pool.slice(3, 6), pool.slice(6, 9)];
};

const buildSlotReroll = (seed, rosterIds, slot, round, exclude) => {
    const pool = shuffled(rosterIds.filter((id) => !exclude.includes(id)), createRng(seed, `draft:slot${slot}:${round}`));
    if (pool.length < 3) fail('No more ninjas to offer for that slot.');
    return pool.slice(0, 3);
};

// Runs drafted before per-slot rerolls carry { round, rerollsLeft } instead.
const normalizeDraft = (draft) => {
    if (!Array.isArray(draft.rerolls)) {
        draft.rerolls = draft.offers.map(() => DRAFT_REROLLS_PER_SLOT);
        draft.rerollRounds = draft.offers.map(() => 0);
    }
    return draft;
};

const createRun = ({ username, rosterIds, seed, now = new Date(), runId, mode = 'legacy' }) => ({
    runId,
    username,
    ...(mode === 'standard' ? {
        mode: 'standard',
        rulesetVersion: STANDARD.rulesetVersion,
        schemaVersion: STANDARD.schemaVersion,
        contentVersion: STANDARD.contentVersion,
        generationVersion: STANDARD.generationVersion,
        totalFloors: STANDARD.totalFloors,
        // pity: reward drafts since one last showed a Prismatic offer.
        standard: { segment: 0, pity: 0 },
        fusions: [],
    } : { mode: 'legacy', totalFloors: MODES.legacy.totalFloors }),
    seed: String(seed),
    status: 'draft',
    version: 0,
    createdAt: now,
    updatedAt: now,
    act: 1,
    floor: 0,
    currentNodeId: null,
    path: [],
    map: null,
    draft: {
        offers: buildDraftOffers(seed, rosterIds),
        rerolls: [DRAFT_REROLLS_PER_SLOT, DRAFT_REROLLS_PER_SLOT, DRAFT_REROLLS_PER_SLOT],
        rerollRounds: [0, 0, 0],
    },
    team: [],
    teamScrolls: [],
    ryo: STARTING_RYO,
    // Chakra left over from the last won battle; it opens the next one. No cap.
    chakra: null,
    // The Forest of Death's Heaven and Earth scrolls (Act II only).
    examScrolls: null,
    seenEvents: [],
    pending: null,
    battle: null,
    stats: { battlesWon: 0, elitesWon: 0, scrollsTaken: 0, actsCleared: 0 },
    log: [],
    accountReward: null,
});

const rerollDraft = (run, rosterIds, slot) => {
    if (run.status !== 'draft') fail('The draft is already over.');
    const draft = normalizeDraft(run.draft);
    if (!Number.isInteger(slot) || !draft.offers[slot]) fail('Choose a slot to reroll.');
    if (draft.rerolls[slot] <= 0) fail('No rerolls left for that slot.');
    draft.rerollRounds[slot] += 1;
    draft.rerolls[slot] -= 1;
    // Never offer a ninja already shown in this slot or still offered in another one.
    draft.offers[slot] = buildSlotReroll(run.seed, rosterIds, slot, draft.rerollRounds[slot], draft.offers.flat());
    return run;
};

// picks: for each slot, the index of the chosen candidate.
const chooseDraft = (run, picks) => {
    if (run.status !== 'draft') fail('The draft is already over.');
    const offers = run.draft.offers;
    if (!Array.isArray(picks) || picks.length !== offers.length) fail('Choose one ninja for every slot.');
    const chosen = offers.map((candidates, slot) => candidates[Number(picks[slot])]);
    if (chosen.some((id) => !id)) fail('Choose one of the offered ninjas for every slot.');
    run.team = chosen.map(createMember);
    run.map = isStandard(run) ? generateStandardSegment(run.seed, 0) : generateMap(run.seed);
    run.draft = null;
    addLog(run, isStandard(run)
        ? `The 200-floor climb begins with ${chosen.length} ninjas.`
        : `The climb begins with ${chosen.length} ninjas.`);
    // Before the first fight the squad picks one of three starting scrolls (or skips it for
    // ryō). It is an ordinary reward with no node behind it, so claiming it opens floor 1.
    run.status = 'reward';
    run.pending = {
        nodeId: null,
        starting: true,
        offers: rollScrollKeys(run, createRng(run.seed, 'reward:start'),
            isStandard(run) ? towerStandard.tierWeightsFor('starting', 1) : TIER_WEIGHTS.starting, 3),
        ryoGained: 0,
    };
    return run;
};

const generateStandardSegment = (seed, segmentIndex) =>
    towerStandard.generateSegment(seed, segmentIndex, { createRng, pickWeighted, shuffled, linkFloors });

// Clearing a segment's checkpoint opens the next segment: only its ten floors are stored.
const advanceSegment = (run) => {
    const next = towerStandard.segmentIndexOf(run.floor + 1);
    if (next >= STANDARD.segments || run.map?.segment === next) return;
    run.map = generateStandardSegment(run.seed, next);
    run.currentNodeId = null;
    run.standard = { ...(run.standard || {}), segment: next };
    const region = towerStandard.regionFor(run.floor + 1);
    addLog(run, run.floor % STANDARD.regionLength === 0
        ? `Entered ${region.name}: ${region.title}.` : `Floor ${run.floor + 1}: the next ten floors open.`);
};

// ---------------------------------------------------------------- map
const randomActOneTypes = (rng) => {
    const types = Array.from({ length: LANES }, () => pickWeighted(
        [['battle', 45], ['event', 14], ['recruit', 14], ['merchant', 13], ['ramen', 14]], rng));
    if (!types.includes('battle')) types[Math.floor(rng() * LANES)] = 'battle';
    return types;
};

const randomForestTypes = (rng) => {
    const types = Array.from({ length: LANES }, () => pickWeighted(
        [['battle', 55], ['event', 25], ['merchant', 10], ['ramen', 10]], rng));
    if (!types.includes('battle')) types[Math.floor(rng() * LANES)] = 'battle';
    return types;
};

const floorTypesFor = (floor, rng) => {
    // Act I · Land of Waves
    if (floor === 1) return ['battle', 'battle', 'battle'];
    if (floor === ELITE_FLOOR) return ['elite', 'elite', 'elite'];
    if (floor === REST_FLOOR) return shuffled(['ramen', 'merchant', 'ramen'], rng);
    if (floor === BOSS_FLOOR) return ['boss'];
    if (floor < BOSS_FLOOR) return randomActOneTypes(rng);
    // Act II · the Chūnin Exams
    if (floor === 11) return ['exam'];
    if (floor === 12 || floor === 13) return randomForestTypes(rng);
    if (floor === 14) {
        const types = randomForestTypes(rng);
        types[Math.floor(rng() * LANES)] = 'elite';
        if (!types.includes('battle')) types[types.indexOf('elite') === 0 ? 1 : 0] = 'battle';
        return types;
    }
    if (floor === 15) return ['boss'];
    if (floor === 16 || floor === 19) return ['duel', 'duel', 'duel'];
    if (floor === 17) return ['training', 'training', 'training'];
    if (floor === 18) return shuffled(['training', 'ramen', 'merchant'], rng);
    if (floor === 20) return ['boss'];
    return ['battle', 'battle', 'battle'];
};

const BOSS_IDS_BY_FLOOR = { 10: 'demon-of-the-mist', 15: 'grass-ninja', 20: 'final-bout' };

// Links each floor to the next. A single-node floor opens onto every lane above it; a
// floor below a single node funnels into it; otherwise each node leads to its own lane
// and one neighbouring lane, so every node is reachable and paths can cross.
const linkFloors = (floors, rng) => {
    for (let index = 0; index < floors.length - 1; index += 1) {
        const nextFloor = floors[index + 1];
        floors[index].forEach((node) => {
            if (nextFloor.length === 1) {
                node.next = [nextFloor[0].id];
                return;
            }
            if (floors[index].length === 1) {
                node.next = nextFloor.map((entry) => entry.id);
                return;
            }
            const neighbours = [node.lane - 1, node.lane + 1].filter((lane) => lane >= 0 && lane < LANES);
            const neighbour = neighbours[Math.floor(rng() * neighbours.length)];
            node.next = [node.lane, neighbour].sort().map((lane) => nextFloor[lane].id);
        });
    }
};

const buildFloors = (firstFloor, lastFloor, rng) => {
    const floors = [];
    for (let floor = firstFloor; floor <= lastFloor; floor += 1) {
        floors.push(floorTypesFor(floor, rng).map((type, lane) => ({
            id: `f${floor}-${lane}`, floor, lane, type, next: [],
            ...(type === 'boss' ? { bossId: BOSS_IDS_BY_FLOOR[floor] || towerBoss.BOSS_ID } : {}),
        })));
    }
    return floors;
};

// Training nodes name their trainer on the map: three different trainers on floor 17,
// and the rest on floor 18.
const assignTrainers = (floors, seed) => {
    const trainers = shuffled(EVENT_IDS_BY_POOL.training || [], createRng(seed, 'trainers'));
    let next = 0;
    floors.flat().filter((node) => node.type === 'training').forEach((node) => {
        node.eventId = trainers[next % trainers.length];
        next += 1;
    });
};

// Act I's map. Act II's floors are added when the player continues past Zabuza.
const generateMap = (seed) => {
    const rng = createRng(seed, 'map');
    const floors = buildFloors(ACTS[1].firstFloor, ACTS[1].lastFloor, rng);
    linkFloors(floors, rng);
    return { floors };
};

const generateActFloors = (seed, act) => {
    const config = ACTS[act];
    const rng = createRng(seed, `map:act${act}`);
    const floors = buildFloors(config.firstFloor, config.lastFloor, rng);
    linkFloors(floors, rng);
    assignTrainers(floors, seed);
    return floors;
};

const findNode = (run, nodeId) => {
    for (const floor of run.map?.floors || []) {
        const node = floor.find((entry) => entry.id === nodeId);
        if (node) return node;
    }
    return null;
};

const getAvailableNodeIds = (run) => {
    if (run.status !== 'map' || !run.map) return [];
    if (!run.currentNodeId) return run.map.floors[0].map((node) => node.id);
    return findNode(run, run.currentNodeId)?.next || [];
};

// ---------------------------------------------------------------- encounters
const pickEnemyIds = (rng, rosterIds, exclude = []) =>
    shuffled(rosterIds.filter((id) => !exclude.includes(id)), rng).slice(0, 3);

const inRoster = (rosterIds, ids) => ids.every((id) => id === null || rosterIds.includes(id));

const squadEncounter = ({ squad, floor, rng, kind, hpMultiplier, affixCount, act }) => ({
    kind,
    floor,
    act,
    squadId: squad.id,
    name: squad.name,
    blurb: squad.blurb || '',
    enemyIds: squad.enemyIds.slice(),
    hpMultiplier: Math.round((hpMultiplier + (squad.hpBonus || 0)) * 100) / 100,
    affixes: shuffled(affixPool(act), rng).slice(0, affixCount),
});

const forestScroll = (rng) => (rng() < 0.5 ? 'heaven' : 'earth');

const duelEncounter = ({ run, node, rosterIds, nameOf }) => {
    const teamIds = run.team.map((member) => member.characterId);
    const usable = (pool) => pool.filter((id) => rosterIds.includes(id) && !teamIds.includes(id));
    const finals = node.floor >= 19;
    let pool = usable(finals ? towerActs.FINALS_POOL : towerActs.PRELIMINARY_POOL);
    if (pool.length < LANES) pool = [...pool, ...usable(towerActs.PRELIMINARY_POOL).filter((id) => !pool.includes(id))];
    // One draw per floor, so the three lanes always face three different opponents.
    const drawn = shuffled(pool, createRng(run.seed, `duel:${node.floor}`));
    const opponent = drawn[node.lane % Math.max(1, drawn.length)] || pickEnemyIds(createRng(run.seed, `duel:${node.id}`), rosterIds, teamIds)[0];
    const stage = finals ? 'Finals' : 'Preliminaries';
    return {
        kind: 'duel',
        floor: node.floor,
        act: 2,
        duel: true,
        name: `${stage}: ${nameOf(opponent) || 'a genin'}`,
        blurb: finals
            ? 'The stadium is full. One opponent, one champion, no help from the stands.'
            : 'Hayate coughs into his fist. "Two names on the board. Begin."',
        enemyIds: [opponent, null, null],
        hpMultiplier: towerActs.DUEL_HP_MULTIPLIER[finals ? 19 : 16],
        affixes: [],
    };
};

// ---------------------------------------------------------------- Standard encounters
// The major boss on a floor. Walks every major floor up to this one so the previous boss is
// known (never the same featured boss twice in a row when another is eligible) without
// storing anything. skillsOf(characterId) lists a character's skills; without it only the
// scripted bosses can be chosen.
const pickStandardBoss = (run, floor, rosterIds, { skillsOf, nameOf = () => '' } = {}) => {
    const telegraphers = typeof skillsOf === 'function'
        ? rosterIds.filter((id) => (skillsOf(id) || []).some(towerStandard.isTelegraphSkill)) : [];
    const scripted = towerStandard.SCRIPTED_POOL.filter((bossId) =>
        inRoster(rosterIds, towerBoss.getBossDefinition(bossId).enemyIds));
    let previous = null;
    let choice = null;
    for (let majorFloor = STANDARD.regionLength; majorFloor <= floor; majorFloor += STANDARD.regionLength) {
        const rng = createRng(run.seed, `standard:boss:${majorFloor}`);
        const final = towerStandard.isFinalFloor(majorFloor);
        const options = [
            ...(telegraphers.length ? [['generic', final ? 100 : 70]] : []),
            ...(final ? [] : scripted.filter((id) => id !== previous).map((id) => [id, 15])),
        ];
        const kind = options.length ? pickWeighted(options, rng) : (scripted[0] || null);
        if (kind === 'generic') {
            const leaders = telegraphers.filter((id) => id !== previous);
            const leaderId = shuffled(leaders.length ? leaders : telegraphers, rng)[0];
            const companions = pickEnemyIds(rng, rosterIds, [leaderId]).slice(0, 2);
            choice = { identity: leaderId, def: towerStandard.synthesizeBoss({ floor: majorFloor, leaderId, companions, skillsOf, nameOf }) };
            if (!choice.def) choice = { identity: scripted[0], bossId: scripted[0] };
        } else {
            choice = { identity: kind, bossId: kind };
        }
        previous = choice.identity;
    }
    return choice;
};

const buildStandardEncounter = (run, node, rosterIds, { nameOf = () => '', skillsOf } = {}) => {
    const rng = createRng(run.seed, `encounter:${node.id}`);
    const floor = node.floor;
    const hpMultiplier = towerStandard.hpMultiplierFor(floor);
    const affixCount = towerStandard.affixCountFor(floor);
    const region = towerStandard.regionFor(floor);
    const base = { floor, act: region.number, region: region.number, standard: true, totalFloors: STANDARD.totalFloors };
    if (node.type === 'boss') {
        const choice = pickStandardBoss(run, floor, rosterIds, { skillsOf, nameOf });
        if (!choice || (!choice.def && !choice.bossId)) fail('No boss is eligible for this floor.', 500);
        const encounter = towerBoss.buildBossEncounter({ floor, bossId: choice.bossId, def: choice.def || null });
        if (!choice.def) {
            const scale = Math.max(1, Math.round(hpMultiplier * 0.95 * 100) / 100);
            encounter.hpCaps = encounter.hpCaps.map((hp) => Math.round(hp * scale));
        }
        return { ...encounter, ...base, checkpoint: 'major', final: towerStandard.isFinalFloor(floor) };
    }
    if (node.type === 'miniboss') {
        const enemyIds = pickEnemyIds(rng, rosterIds);
        return {
            ...base,
            kind: 'elite',
            checkpoint: 'mini',
            name: `Champion: ${nameOf(enemyIds[0]) || 'the Gatekeeper'}`,
            blurb: `The champion of ${region.title} guards floor ${floor}.`,
            enemyIds,
            hpMultiplier: Math.round((hpMultiplier + towerStandard.CHAMPION_HP_BONUS) * 100) / 100,
            affixes: towerStandard.rollAffixes(rng, shuffled, Math.min(3, affixCount + 1)),
            rewardTable: 'champion',
        };
    }
    const elite = node.type === 'elite';
    return {
        ...base,
        kind: elite ? 'elite' : 'battle',
        name: elite
            ? towerStandard.ELITE_NAMES[Math.floor(rng() * towerStandard.ELITE_NAMES.length)]
            : towerStandard.SQUAD_NAMES[Math.floor(rng() * towerStandard.SQUAD_NAMES.length)],
        enemyIds: pickEnemyIds(rng, rosterIds),
        hpMultiplier: Math.round((hpMultiplier + (elite ? towerStandard.ELITE_HP_BONUS : 0)) * 100) / 100,
        affixes: towerStandard.rollAffixes(rng, shuffled, Math.min(3, affixCount + (elite ? 1 : 0))),
        rewardTable: elite ? 'elite' : 'battle',
    };
};

const buildEncounter = (run, node, rosterIds, nameOf = () => '', options = {}) => {
    if (isStandard(run)) return buildStandardEncounter(run, node, rosterIds, { nameOf, ...options });
    const rng = createRng(run.seed, `encounter:${node.id}`);
    const act = node.floor > ACTS[1].lastFloor ? 2 : 1;
    if (node.type === 'boss') {
        const encounter = towerBoss.buildBossEncounter({ floor: node.floor, bossId: node.bossId || towerBoss.BOSS_ID });
        return { ...encounter, act, final: node.floor === ACTS[act].bossFloor };
    }
    if (node.type === 'duel') return duelEncounter({ run, node, rosterIds, nameOf });
    if (node.type === 'elite') {
        if (act === 2 && inRoster(rosterIds, towerActs.FOREST_ELITE.enemyIds)) {
            return {
                ...squadEncounter({
                    squad: towerActs.FOREST_ELITE, floor: node.floor, rng, kind: 'elite',
                    hpMultiplier: towerActs.ELITE_HP_MULTIPLIER[2], affixCount: 2, act,
                }),
                carries: forestScroll(rng),
            };
        }
        return {
            kind: 'elite',
            floor: node.floor,
            act,
            name: ELITE_NAMES[Math.floor(rng() * ELITE_NAMES.length)],
            enemyIds: pickEnemyIds(rng, rosterIds),
            hpMultiplier: towerActs.ELITE_HP_MULTIPLIER[act],
            affixes: shuffled(affixPool(act), rng).slice(0, 2),
        };
    }
    const affixCount = towerActs.battleAffixCount(node.floor);
    const hpMultiplier = towerActs.battleHpMultiplier(node.floor);
    if (act === 2) {
        const squads = towerActs.FOREST_SQUADS.filter((squad) => inRoster(rosterIds, squad.enemyIds));
        if (squads.length) {
            const squad = squads[Math.floor(rng() * squads.length)];
            return {
                ...squadEncounter({ squad, floor: node.floor, rng, kind: 'battle', hpMultiplier, affixCount, act }),
                carries: forestScroll(rng),
            };
        }
    } else {
        const themed = towerActs.ACT_I_SQUADS.filter((squad) => node.floor >= squad.floors[0] &&
            node.floor <= squad.floors[1] && inRoster(rosterIds, squad.enemyIds));
        if (themed.length && rng() < towerActs.ACT_I_THEMED_CHANCE) {
            const squad = themed[Math.floor(rng() * themed.length)];
            return squadEncounter({ squad, floor: node.floor, rng, kind: 'battle', hpMultiplier, affixCount, act });
        }
    }
    return {
        kind: 'battle',
        floor: node.floor,
        act,
        name: SQUAD_NAMES[Math.floor(rng() * SQUAD_NAMES.length)],
        enemyIds: pickEnemyIds(rng, rosterIds),
        hpMultiplier,
        affixes: shuffled(affixPool(act), rng).slice(0, affixCount),
    };
};

// ---------------------------------------------------------------- scroll offers
const TIER_WEIGHTS = {
    battle: [['genin', 65], ['jonin', 30], ['kage', 5]],
    battleActTwo: [['genin', 40], ['jonin', 48], ['kage', 12]],
    elite: [['jonin', 70], ['kage', 30]],
    // The starting scroll is meant to be felt from the first fight.
    starting: [['jonin', 75], ['kage', 25]],
    kage: [['kage', 100]],
    merchant: [['genin', 55], ['jonin', 35], ['kage', 10]],
};
// A scroll that pairs with one the team already owns is this many times more likely, and
// one that would complete a fusion recipe more likely still.
const PAIR_WEIGHT = 3;
const FUSION_WEIGHT = 4;

// A scroll can be offered while at least one ninja could still take it.
// Character augments may only go to a living ninja of their character.
const eligibleFor = (scroll, member) => !scroll.eligibleCharacterIds || scroll.eligibleCharacterIds.includes(member?.characterId);

const canTakeScroll = (run, key) => {
    const parsed = parseScrollKey(key);
    if (!parsed) return false;
    if (parsed.scroll.scope === 'team') return !run.teamScrolls.includes(key);
    return run.team.some((member) => !isDead(member) && !member.scrolls.includes(key) && eligibleFor(parsed.scroll, member));
};

const ownedScrollIds = (run) => new Set([
    ...(run.teamScrolls || []),
    ...run.team.filter((member) => !isDead(member)).flatMap((member) => member.scrolls || []),
].map((key) => String(key).split(':')[0]));

// forceTiers: tiers the first offers must have (milestones and Prismatic pity, Standard only).
const rollScrollKeys = (run, rng, weights, count, exclude = [], { forceTiers = [] } = {}) => {
    const picked = [];
    const owned = ownedScrollIds(run);
    const standard = isStandard(run);
    const keys = standard ? STANDARD_OFFERED_SCROLL_KEYS : OFFERED_SCROLL_KEYS;
    const tierOf = (key) => (standard ? standardTierOf(key) : parseScrollKey(key).scroll.tier);
    const poolFor = (tier) => keys.filter((key) => {
        const parsed = parseScrollKey(key);
        return tierOf(key) === tier && canTakeScroll(run, key) &&
            !picked.some((entry) => entry.split(':')[0] === parsed.scroll.id) &&
            !exclude.includes(key);
    });
    const weightOf = (key) => (recipeCompletedBy(run, key) ? FUSION_WEIGHT
        : getScrollPairs(key).some((id) => owned.has(id)) ? PAIR_WEIGHT : 1);
    const take = (pool) => picked.push(pickWeighted(pool.map((key) => [key, weightOf(key)]), rng));
    forceTiers.forEach((tier) => {
        const pool = picked.length < count ? poolFor(tier) : [];
        if (pool.length) take(pool);
    });
    for (let attempt = 0; picked.length < count && attempt < 60; attempt += 1) {
        const pool = poolFor(pickWeighted(weights, rng));
        if (pool.length) take(pool);
    }
    return picked;
};

// Standard mode's active capacity: team scrolls and each ninja's own scrolls are limited.
// Cursed scrolls forced by bosses and events ignore the limit (they cannot be refused).
const capacityFor = (run, scope, member = null) => {
    if (!isStandard(run)) return null;
    const list = scope === 'team' ? run.teamScrolls : member?.scrolls || [];
    const used = list.filter((key) => !isCursedScroll(key)).length;
    const max = scope === 'team' ? STANDARD.teamScrollCap : STANDARD.ninjaScrollCap;
    return { used, max, full: used >= max };
};

// replaceKey: when the slots are full, the owned scroll to salvage (for ryō) in its place.
const grantScroll = (run, key, slot, { replaceKey = null } = {}) => {
    const parsed = parseScrollKey(key);
    if (!parsed) fail('Unknown scroll.');
    const team = parsed.scroll.scope === 'team';
    const member = team ? null : requireLivingSlot(run, slot);
    if (member && !eligibleFor(parsed.scroll, member)) fail('Only that character can learn this augment.');
    const list = team ? run.teamScrolls : member.scrolls;
    if (list.includes(key)) fail(team ? 'Your team already has that scroll.' : 'That ninja already has this scroll.');
    // Completing a recipe fuses two slots into one, so it never needs a free slot.
    const completes = team ? recipeCompletedBy(run, key) : null;
    const capacity = isCursedScroll(key) || completes ? null : capacityFor(run, team ? 'team' : 'ninja', member);
    if (capacity?.full) {
        if (!replaceKey) fail(`${team ? 'Team' : 'This ninja\'s'} scroll slots are full (${capacity.max}). Choose a scroll to replace.`, 409);
        if (!list.includes(replaceKey) || isCursedScroll(replaceKey)) fail('Choose one of the scrolls already held there to replace.');
        salvageScroll(run, list, replaceKey, member);
    }
    list.push(key);
    if (member) {
        const bonus = getScrollMaxHpBonus(key);
        if (bonus > 0) healMember(member, bonus);
    }
    run.stats.scrollsTaken += 1;
    addLog(run, `Learned ${describeScroll(key, { mode: modeOf(run) }).name}.`);
    if (completes) fuseRecipe(run, completes);
};

// Removes a held scroll for ryō. Max-health bonuses it gave are removed with it.
const salvageScroll = (run, list, key, member) => {
    const index = list.indexOf(key);
    if (index < 0) return;
    list.splice(index, 1);
    if (member) member.hp = Math.min(member.hp, memberMaxHp(member));
    run.ryo += STANDARD.salvageRyo;
    addLog(run, `Salvaged ${describeScroll(key, { mode: modeOf(run) })?.name || key} for ${STANDARD.salvageRyo} ryō.`);
};

// ---------------------------------------------------------------- node choice
const chooseNode = (run, nodeId, rosterIds, { nameOf, skillsOf } = {}) => {
    if (!getAvailableNodeIds(run).includes(nodeId)) fail('That path is not open.');
    const node = findNode(run, nodeId);
    run.currentNodeId = node.id;
    run.path = [...(run.path || []), node.id];
    const rng = createRng(run.seed, `node:${node.id}`);
    if (COMBAT_NODE_TYPES.has(node.type)) {
        run.status = 'battle';
        run.battle = { nodeId: node.id, matchId: null, encounter: buildEncounter(run, node, rosterIds, nameOf, { skillsOf }) };
        return run;
    }
    // Fusion Chambers are retired (fusion is automatic); one left in an older segment rests.
    if (node.type === 'fusion') {
        run.status = 'ramen';
        run.pending = { nodeId: node.id };
        return run;
    }
    if (EVENT_NODE_TYPES.has(node.type)) {
        const eventId = pickEventId(run, node);
        run.status = 'event';
        run.pending = { nodeId: node.id, eventId };
        run.seenEvents = [...(run.seenEvents || []), eventId];
        return run;
    }
    if (node.type === 'ramen') {
        run.status = 'ramen';
        run.pending = { nodeId: node.id };
    } else if (node.type === 'merchant') {
        run.status = 'merchant';
        run.pending = {
            nodeId: node.id,
            stock: isStandard(run) ? [
                ...rollScrollKeys(run, rng, towerStandard.tierWeightsFor('merchant', node.floor), 3).map((key) => ({
                    kind: 'scroll', key, price: towerStandard.MERCHANT_PRICES[standardTierOf(key)], sold: false,
                })),
                { kind: 'medkit', price: towerStandard.MERCHANT_PRICES.medkit, sold: false },
            ] : [
                ...rollScrollKeys(run, rng, TIER_WEIGHTS.merchant, 3).map((key) => ({
                    kind: 'scroll', key, price: MERCHANT_PRICES[parseScrollKey(key).scroll.tier], sold: false,
                })),
                { kind: 'medkit', price: MERCHANT_PRICES.medkit, sold: false },
            ],
        };
    } else if (node.type === 'recruit') {
        const teamIds = run.team.map((member) => member.characterId);
        run.status = 'recruit';
        run.pending = { nodeId: node.id, offers: pickEnemyIds(rng, rosterIds, teamIds) };
    }
    return run;
};

// Leaving a non-combat node clears its floor. In Standard mode, clearing a checkpoint
// (floor 10, 20, ...) opens the next segment.
const completeNode = (run) => {
    const node = findNode(run, run.currentNodeId);
    run.floor = node ? node.floor : run.floor;
    run.pending = null;
    run.status = 'map';
    if (isStandard(run) && node && towerStandard.isCheckpointFloor(node.floor) && node.floor < STANDARD.totalFloors) {
        advanceSegment(run);
    }
    return run;
};

const applyRamen = (run, option, slot) => {
    if (run.status !== 'ramen') fail('There is no ramen stand here.');
    if (option === 'feast') {
        run.team.forEach((member) => healMember(member, Math.round(memberMaxHp(member) * RAMEN.feastPercent / 100)));
        addLog(run, `Ichiraku feast: every ninja recovered ${RAMEN.feastPercent}% health.`);
    } else if (option === 'rest') {
        const member = requireLivingSlot(run, slot);
        healMember(member, memberMaxHp(member));
        addLog(run, 'One ninja rested to full health.');
    } else {
        fail('Choose a meal.');
    }
    return completeNode(run);
};

const merchantBuy = (run, itemIndex, slot, { replaceKey = null } = {}) => {
    if (run.status !== 'merchant') fail('There is no merchant here.');
    const item = run.pending.stock[itemIndex];
    if (!item || item.sold) fail('That item is not for sale.');
    if (run.ryo < item.price) fail('Not enough ryō.');
    if (item.kind === 'scroll') {
        grantScroll(run, item.key, slot, { replaceKey });
    } else if (item.kind === 'medkit') {
        run.team.forEach((member) => healMember(member, Math.round(memberMaxHp(member) * MEDKIT_HEAL_PERCENT / 100)));
        addLog(run, `Bought a medical kit: every ninja recovered ${MEDKIT_HEAL_PERCENT}% health.`);
    }
    run.ryo -= item.price;
    item.sold = true;
    return run;
};

// 'fusion' remains leavable for runs saved while standing in a retired Fusion Chamber.
const leaveNode = (run) => {
    if (!['merchant', 'recruit', 'fusion'].includes(run.status)) fail('There is nothing to leave.');
    return completeNode(run);
};

// ---------------------------------------------------------------- fusion
// Fusion is automatic: the moment the team takes the second augment of a recipe, the pair
// fuses into the recipe's result inside the same grant (one save, so it cannot half-happen).
// Every source augment is team-scoped, so a fusion only ever consumes team augments.

// A recipe's two ingredients and result as scroll keys (stable source ids, never names).
const recipeKeys = (recipe) => ({
    ingredients: recipe.ingredients.map((code) => AUGMENTS_BY_CODE.get(code)?.id || null),
    result: recipe.resultId,
});

const recipeOperational = (recipe) => recipe.implementationStatus === 'implemented' &&
    Boolean(parseScrollKey(recipe.resultId)) && recipeKeys(recipe).ingredients.every((key) => key && parseScrollKey(key));

// The recipe that taking `key` would complete for this team, or null.
const recipeCompletedBy = (run, key) => {
    if (!isStandard(run)) return null;
    const owned = run.teamScrolls || [];
    return RECIPES.find((recipe) => {
        if (!recipeOperational(recipe)) return false;
        const { ingredients, result } = recipeKeys(recipe);
        return ingredients.includes(key) && !owned.includes(key) && !owned.includes(result) &&
            ingredients.every((ingredient) => ingredient === key || owned.includes(ingredient));
    }) || null;
};

// Consumes both ingredients and grants the result. lastFusion lets the page play the
// fusion moment once (its id changes with every fusion).
const fuseRecipe = (run, recipe) => {
    const { ingredients, result } = recipeKeys(recipe);
    run.teamScrolls = run.teamScrolls.filter((key) => !ingredients.includes(key));
    run.teamScrolls.push(result);
    const entry = { recipeId: recipe.id, consumed: ingredients.slice(), result, floor: run.floor };
    run.fusions = [...(run.fusions || []), entry];
    run.lastFusion = { ...entry, id: `${recipe.id}:${run.fusions.length}` };
    addLog(run, `${ingredients.map((key) => describeScroll(key, { mode: 'standard' }).name).join(' and ')} fused into ${recipe.name}.`);
};

const recruit = (run, offerIndex, slot) => {
    if (run.status !== 'recruit') fail('There is no one to recruit here.');
    const characterId = run.pending.offers[offerIndex];
    if (!characterId) fail('Choose one of the offered ninjas.');
    const member = requireSlot(run, slot);
    // The newcomer inherits the departing ninja's scrolls (not their stacks) and arrives
    // fully rested. Recruiting is the one way to fill a slot whose ninja has died for good.
    // Character augments cannot pass to a different character: they are salvaged for ryō.
    const kept = [];
    member.scrolls.forEach((key) => {
        const scroll = parseScrollKey(key)?.scroll;
        if (scroll?.eligibleCharacterIds && !scroll.eligibleCharacterIds.includes(characterId)) {
            run.ryo += STANDARD.salvageRyo;
            addLog(run, `${describeScroll(key, { mode: modeOf(run) }).name} cannot pass to the recruit: salvaged for ${STANDARD.salvageRyo} ryō.`);
        } else {
            kept.push(key);
        }
    });
    member.scrolls = kept;
    member.characterId = characterId;
    member.fallen = false;
    member.dead = false;
    member.carriedStatuses = [];
    member.hp = memberMaxHp(member);
    addLog(run, 'A recruit joined the team and inherited the departing ninja\'s scrolls.');
    return completeNode(run);
};

// ---------------------------------------------------------------- events
// Standard mode reuses the road and training events as themed pools. The written exam and
// the Forest of Death events (Heaven/Earth scrolls) are Legacy story gates and never appear.
const STANDARD_EVENT_POOLS = ['act1', 'training'];

const pickEventId = (run, node) => {
    if (node.type === 'exam') return 'written-exam';
    if (node.type === 'training' && node.eventId) return node.eventId;
    const pool = node.type === 'training' ? 'training' : node.floor > ACTS[1].lastFloor ? 'forest' : 'act1';
    const ids = isStandard(run)
        ? STANDARD_EVENT_POOLS.flatMap((name) => EVENT_IDS_BY_POOL[name] || [])
        : EVENT_IDS_BY_POOL[pool] || [];
    // Standard runs are long: events repeat once each has been seen.
    const unseen = ids.filter((id) => !(run.seenEvents || []).slice(isStandard(run) ? -ids.length + 1 : 0).includes(id));
    const choices = unseen.length ? unseen : ids;
    return choices[Math.floor(createRng(run.seed, `event:${node.id}`)() * choices.length)];
};

const upgradableKeys = (member) => (member.scrolls || []).filter((key) => {
    const upgrade = getScrollUpgrade(key);
    return upgrade && !member.scrolls.includes(upgrade);
});

// Whether a ninja may be chosen for an event option ('' when they may).
const slotBlockReason = (run, member, rule) => {
    if (!rule) return '';
    if (isDead(member)) return 'Dead';
    if (rule.rule === 'fallen') return member.fallen ? '' : 'Not on their last life';
    if (rule.rule === 'cursed') return member.scrolls.some(isCursedScroll) ? '' : 'No cursed scroll';
    if (rule.rule === 'upgradable') return upgradableKeys(member).length ? '' : 'Nothing to upgrade';
    if (rule.rule === 'lacks-scroll') return member.scrolls.includes(rule.key) ? 'Already learned' : '';
    return '';
};

const optionBlockReason = (run, option) => {
    if (option.cost && run.ryo < option.cost) return `Needs ${option.cost} ryō`;
    const custom = typeof option.available === 'function' ? option.available(run) : '';
    if (custom) return custom;
    if (option.slot && !run.team.some((member) => !slotBlockReason(run, member, option.slot))) {
        return { fallen: 'No ninja on their last life', cursed: 'No ninja carries a cursed scroll',
            upgradable: 'No scroll to upgrade' }[option.slot.rule] || 'No ninja can take this';
    }
    return '';
};

const resolveEvent = (run, optionId, slot, rosterIds, { nameOf } = {}) => {
    if (run.status !== 'event' || !run.pending?.eventId) fail('There is no event here.');
    const event = getEvent(run.pending.eventId);
    const option = event?.options.find((entry) => entry.id === optionId);
    if (!option) fail('Choose one of the options.');
    const blocked = optionBlockReason(run, option);
    if (blocked) fail(blocked);
    let member = null;
    if (option.slot) {
        member = requireLivingSlot(run, slot);
        const reason = slotBlockReason(run, member, option.slot);
        if (reason) fail(`That ninja cannot: ${reason.toLowerCase()}.`);
    }
    if (option.cost) run.ryo -= option.cost;
    const node = findNode(run, run.pending.nodeId);
    const rng = createRng(run.seed, `event:${run.pending.nodeId}:${optionId}`);
    const api = {
        run,
        member,
        rng,
        log: (text) => addLog(run, text),
        gainRyo: (amount) => { run.ryo += amount; },
        loseRyo: (amount) => { run.ryo = Math.max(0, run.ryo - amount); },
        healTeamPercent: (percent) => run.team.forEach((entry) =>
            healMember(entry, Math.round(memberMaxHp(entry) * percent / 100))),
        healTeamFlat: (amount) => run.team.forEach((entry) => healMember(entry, amount)),
        healMemberFull: () => healMember(member, memberMaxHp(member)),
        hurtTeam: (amount) => run.team.forEach((entry) => hurtMember(entry, amount)),
        // A scroll an event grants into full Standard slots is salvaged for ryō instead (logged).
        grantScroll: (key) => {
            const scope = parseScrollKey(key)?.scroll?.scope;
            const capacity = isCursedScroll(key) ? null : capacityFor(run, scope === 'team' ? 'team' : 'ninja', member);
            if (capacity?.full) {
                run.ryo += STANDARD.salvageRyo;
                addLog(run, `No free scroll slot for ${describeScroll(key, { mode: 'standard' }).name}: salvaged for ${STANDARD.salvageRyo} ryō.`);
                return;
            }
            grantScroll(run, key, slot);
        },
        upgradeScroll: () => {
            const from = upgradableKeys(member)[0];
            const to = getScrollUpgrade(from);
            member.scrolls = member.scrolls.map((key) => (key === from ? to : key));
            addLog(run, `${describeScroll(from).name} became ${describeScroll(to).name}.`);
        },
        removeCursedScrolls: () => {
            const removed = member.scrolls.filter(isCursedScroll);
            member.scrolls = member.scrolls.filter((key) => !isCursedScroll(key));
            member.hp = Math.min(member.hp, memberMaxHp(member));
            addLog(run, `The Evil Sealing Method sealed away ${removed.map((key) => describeScroll(key).name).join(', ')}.`);
        },
        loseExamScroll: () => {
            const scrolls = run.examScrolls || { heaven: 0, earth: 0 };
            const kind = scrolls.heaven >= scrolls.earth ? 'heaven' : 'earth';
            scrolls[kind] = Math.max(0, scrolls[kind] - 1);
            run.examScrolls = scrolls;
        },
        gainMissingExamScroll: () => {
            const scrolls = run.examScrolls || { heaven: 0, earth: 0 };
            scrolls[scrolls.heaven > 0 ? 'earth' : 'heaven'] += 1;
            run.examScrolls = scrolls;
        },
        offerReward: (table) => {
            run.status = 'reward';
            run.pending = {
                nodeId: run.pending.nodeId,
                offers: rollScrollKeys(run, createRng(run.seed, `reward:${run.pending.nodeId}`), isStandard(run)
                    ? towerStandard.tierWeightsFor(table, node.floor)
                    : TIER_WEIGHTS[table] || TIER_WEIGHTS.elite, 3),
                ryoGained: 0,
            };
        },
        startBattle: ({ name, hpBonus = 0, affixCount = 0, rewardTable = null }) => {
            const encounterRng = createRng(run.seed, `encounter:${node.id}:event`);
            const standard = isStandard(run);
            run.status = 'battle';
            run.pending = null;
            run.battle = {
                nodeId: node.id,
                matchId: null,
                encounter: {
                    kind: 'battle',
                    floor: node.floor,
                    act: standard ? towerStandard.regionFor(node.floor).number : node.floor > ACTS[1].lastFloor ? 2 : 1,
                    ...(standard ? { standard: true, totalFloors: STANDARD.totalFloors } : {}),
                    name,
                    enemyIds: pickEnemyIds(encounterRng, rosterIds),
                    hpMultiplier: Math.round(((standard ? towerStandard.hpMultiplierFor(node.floor)
                        : towerActs.battleHpMultiplier(node.floor)) + hpBonus) * 100) / 100,
                    affixes: standard
                        ? towerStandard.rollAffixes(encounterRng, shuffled, Math.min(3, towerStandard.affixCountFor(node.floor) + affixCount))
                        : shuffled(affixPool(node.floor > ACTS[1].lastFloor ? 2 : 1), encounterRng).slice(0, affixCount),
                    rewardTable: standard && rewardTable === 'elite' ? 'elite' : rewardTable,
                },
            };
        },
        startForestBattle: (squadId) => {
            const squad = towerActs.FOREST_SQUADS.find((entry) => entry.id === squadId);
            const encounterRng = createRng(run.seed, `encounter:${node.id}:event`);
            run.status = 'battle';
            run.pending = null;
            const usable = squad && inRoster(rosterIds, squad.enemyIds);
            run.battle = {
                nodeId: node.id,
                matchId: null,
                encounter: usable ? {
                    ...squadEncounter({
                        squad, floor: node.floor, rng: encounterRng, kind: 'battle', act: 2,
                        hpMultiplier: towerActs.battleHpMultiplier(node.floor),
                        affixCount: towerActs.battleAffixCount(node.floor),
                    }),
                    carries: forestScroll(encounterRng),
                } : buildEncounter(run, { ...node, type: 'battle' }, rosterIds, nameOf),
            };
        },
    };
    option.resolve(api);
    if (run.status === 'event') completeNode(run);
    return run;
};

// ---------------------------------------------------------------- acts
// After Zabuza falls the player chooses: retire with Act I's reward, or continue into the
// Chūnin Exams. Continuing heals the living to full and gives back every last life.
const continueRun = (run, choice) => {
    if (run.status !== 'interlude') fail('There is no decision to make.');
    if (choice === 'retire') {
        run.status = 'victory';
        run.endedAt = new Date();
        run.pending = null;
        addLog(run, 'Retired after the Land of Waves.');
        return run;
    }
    if (choice !== 'continue') fail('Choose to continue or retire.');
    const nextAct = run.pending?.nextAct || (run.act || 1) + 1;
    if (!ACTS[nextAct]) fail('There is no next act yet.');
    const floors = generateActFloors(run.seed, nextAct);
    const lastFloor = run.map.floors[run.map.floors.length - 1];
    lastFloor.forEach((node) => { node.next = floors[0].map((entry) => entry.id); });
    run.map.floors.push(...floors);
    run.act = nextAct;
    run.team.forEach((member) => {
        if (isDead(member)) return;
        member.fallen = false;
        member.hp = memberMaxHp(member);
    });
    // Every team in the second exam starts with one scroll of the pair.
    const gift = forestScroll(createRng(run.seed, 'exam-scroll'));
    run.examScrolls = { heaven: gift === 'heaven' ? 1 : 0, earth: gift === 'earth' ? 1 : 0 };
    run.pending = null;
    run.status = 'map';
    addLog(run, `Returned to Konoha and entered the Chūnin Exams, holding the ${gift === 'heaven' ? 'Heaven' : 'Earth'} scroll.`);
    return run;
};

// ---------------------------------------------------------------- battle
// A duel needs a champion: one living ninja fights, the others sit in the stands.
const chooseChampion = (run, slot) => {
    if (run.status !== 'battle' || !run.battle?.encounter?.duel) fail('This battle is not a duel.');
    if (run.battle.matchId) return run;
    requireLivingSlot(run, slot);
    run.battle.championSlot = slot;
    return run;
};

const CHAKRA_POOL_TYPES = ['taijutsu', 'ninjutsu', 'genjutsu', 'bloodline'];

// Augment effects that act on the battle setup rather than inside the engine: extra random
// chakra, Forbidden Exchange's health cost, and The Tower's Blessing's borrowed Commons.
// Every roll is seeded by the node, so re-entering a battle rebuilds the same setup.
const applyAugmentSetup = (run, team) => {
    const owned = [...new Set(allOwnedKeys(run))];
    const rng = createRng(run.seed, `battle-setup:${run.battle.nodeId}`);
    const blessing = [];
    owned.forEach((key) => {
        const count = Math.max(0, Number(getScrollSetup(key)?.blessingCommons) || 0);
        if (!count) return;
        const candidates = COMMON_AUGMENT_KEYS.filter((entry) => !owned.includes(entry) && !blessing.includes(entry));
        blessing.push(...shuffled(candidates, rng).slice(0, count));
    });
    if (blessing.length) team.forEach((member) => { if (!member.dead) member.scrolls.push(...blessing); });
    const bonusChakra = {};
    let hpLoss = 0;
    [...owned, ...blessing].forEach((key) => {
        const setup = getScrollSetup(key);
        for (let index = 0; index < Math.max(0, Number(setup?.randomChakra) || 0); index += 1) {
            const type = CHAKRA_POOL_TYPES[Math.floor(rng() * CHAKRA_POOL_TYPES.length)];
            bonusChakra[type] = (bonusChakra[type] || 0) + 1;
        }
        hpLoss += Math.max(0, Number(setup?.teamHpLoss) || 0);
    });
    const fighting = team.filter((member) => !member.dead && !member.benched);
    if (hpLoss > 0 && fighting.length) {
        const share = Math.floor(hpLoss / fighting.length);
        fighting.forEach((member) => { member.hp = Math.max(1, member.hp - share); });
    }
    return { bonusChakra: Object.keys(bonusChakra).length ? bonusChakra : null, blessing };
};

// What the server needs to build a Tower match for this run's current battle.
const buildBattleSetup = (run) => {
    if (run.status !== 'battle' || !run.battle) fail('No Tower battle is ready.');
    const { encounter } = run.battle;
    const duel = Boolean(encounter.duel);
    if (duel && !Number.isInteger(run.battle.championSlot)) fail('Choose a champion for the duel.');
    const team = run.team.map((member, slot) => ({
        characterId: member.characterId,
        dead: isDead(member),
        benched: duel && slot !== run.battle.championSlot,
        hp: isDead(member) ? 0 : Math.max(1, Math.round(member.hp)),
        maxHp: memberMaxHp(member),
        scrolls: [...run.teamScrolls, ...member.scrolls],
        carriedStatuses: isDead(member) ? [] : (member.carriedStatuses || []),
    }));
    const setup = {
        encounter: { ...encounter, totalFloors: isStandard(run) ? STANDARD.totalFloors : actOf(run).lastFloor },
        team,
        chakra: run.chakra || null,
    };
    if (isStandard(run)) Object.assign(setup, applyAugmentSetup(run, team));
    return setup;
};

// Standard mode caps carried chakra: the largest stacks shrink first until the total fits.
const capCarriedChakra = (chakra) => {
    const next = { ...chakra };
    let total = Object.values(next).reduce((sum, amount) => sum + amount, 0);
    while (total > STANDARD.chakraCarryCap) {
        const [largest] = Object.entries(next).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0];
        next[largest] -= 1;
        total -= 1;
    }
    return next;
};

// ---------------------------------------------------------------- carried stacks
// A ninja's self-stacks survive from one Tower battle to the next: helpful statuses the
// ninja applied to itself that count up (stackable, stackMetadataKey, merged numeric
// keys), plus the stack counters on its own passive. Everything else (timed buffs,
// enemy effects, counters, invulnerability) is left behind when the battle ends.
const STACK_EVIDENCE_KEYS = ['stackable', 'stackMetadataKey', 'mergeNumericAddKeys', 'mergeObjectNumericAddKeys'];
const clone = (value) => JSON.parse(JSON.stringify(value));

const passiveStackKeys = (metadata) => {
    const keys = new Set(['tooltipText']);
    ['stackMetadataKey', 'onDamageStackMetadataKey', 'onUndamagedTurnStackMetadataKey'].forEach((field) => {
        if (typeof metadata[field] === 'string' && metadata[field]) keys.add(metadata[field]);
    });
    (Array.isArray(metadata.growPerTurn) ? metadata.growPerTurn : []).forEach((entry) => {
        if (typeof entry?.key === 'string' && entry.key) keys.add(entry.key);
    });
    Object.keys(metadata.stackDerivedNumericKeys || {}).forEach((key) => keys.add(key));
    return [...keys];
};

const extractCarriedStatuses = (unit, username, slot) => {
    const statuses = Array.isArray(unit?.state?.statuses) ? unit.state.statuses : [];
    const carried = [];
    statuses.forEach((status) => {
        const metadata = status?.metadata;
        if (!status?.id || !metadata || typeof metadata !== 'object' || metadata.harmful) return;
        // Scrolls are rebuilt fresh every battle (Eight Inner Gates starts over at +0).
        if (metadata.towerScroll) return;
        if (metadata.passive) {
            const values = {};
            passiveStackKeys(metadata).forEach((key) => {
                if (metadata[key] !== undefined) values[key] = clone(metadata[key]);
            });
            const hasCounter = Object.keys(values).some((key) => key !== 'tooltipText');
            if (hasCounter) carried.push({ id: status.id, passive: true, metadata: values });
            return;
        }
        const selfApplied = status.sourceUsername === username && status.sourceSlot === slot;
        const stacks = STACK_EVIDENCE_KEYS.some((key) => Boolean(metadata[key]));
        if (!selfApplied || !stacks) return;
        carried.push({
            id: status.id,
            passive: false,
            remainingTurns: Math.max(0, Number(status.remainingTurns) || 0),
            stacks: status.stacks || null,
            sourceSkillId: status.sourceSkillId || null,
            metadata: clone(metadata),
        });
    });
    return carried;
};

const rewardTableFor = (run, encounter) => {
    if (encounter.rewardTable && TIER_WEIGHTS[encounter.rewardTable]) return TIER_WEIGHTS[encounter.rewardTable];
    if (encounter.kind === 'elite' || encounter.kind === 'boss') return TIER_WEIGHTS.elite;
    return (encounter.act || run.act) >= 2 ? TIER_WEIGHTS.battleActTwo : TIER_WEIGHTS.battle;
};

const offerRewards = (run, encounter) => {
    const node = findNode(run, run.battle.nodeId);
    const rng = createRng(run.seed, `reward:${node.id}`);
    return { nodeId: node.id, offers: rollScrollKeys(run, rng, rewardTableFor(run, encounter), 3) };
};

// One ninja's battle outcome: survivors recover a little and keep their stacks; the first
// death is survived at 1 health; the second is permanent.
const settleMember = (run, member, unit, username, slot) => {
    const maxHp = memberMaxHp(member);
    const alive = unit && unit.alive !== false && Number(unit.hp) > 0;
    if (alive) {
        const regen = isStandard(run) ? STANDARD.postBattleRegen : POST_BATTLE_REGEN;
        member.hp = Math.min(maxHp, Math.max(1, Math.round(Number(unit.hp))) + regen);
        member.carriedStatuses = extractCarriedStatuses(unit, username, slot);
    } else if (!member.fallen) {
        member.fallen = true;
        member.hp = 1;
        member.carriedStatuses = [];
        addLog(run, 'A ninja was carried out at 1 health. Another fall will be their last.');
    } else {
        member.dead = true;
        member.hp = 0;
        member.carriedStatuses = [];
        addLog(run, 'A ninja fell for the second time and will not rise again.');
    }
};

const endRun = (run, status, text) => {
    run.status = status;
    run.endedAt = new Date();
    run.battle = null;
    run.pending = null;
    addLog(run, text);
    return run;
};

// The central tower of the Forest of Death: both scrolls bring Iruka and a rest; missing
// one means days lost searching the forest.
const reachExamTower = (run) => {
    const scrolls = run.examScrolls || { heaven: 0, earth: 0 };
    if (scrolls.heaven > 0 && scrolls.earth > 0) {
        run.team.forEach((member) => healMember(member, Math.round(memberMaxHp(member) * EXAM_TOWER.healPercent / 100)));
        run.ryo += EXAM_TOWER.ryo;
        addLog(run, `Opened the Heaven and Earth scrolls in the tower. Iruka appeared: the team rested (+${EXAM_TOWER.healPercent}% health, +${EXAM_TOWER.ryo} ryō).`);
    } else {
        run.team.forEach((member) => hurtMember(member, EXAM_TOWER.penalty));
        addLog(run, `Reached the tower without both scrolls. Days lost searching the forest cost every ninja ${EXAM_TOWER.penalty} health.`);
    }
};

// units: the player's board units at the end of the match, in team order.
// chakra: the player's chakra pool at the end of the match.
// bossState: the scripted boss's state, when the battle had one.
// Standard reward table for an encounter.
const standardRewardTable = (encounter) => (encounter.kind === 'boss' ? 'boss'
    : encounter.checkpoint === 'mini' ? 'champion' : encounter.rewardTable || (encounter.kind === 'elite' ? 'elite' : 'battle'));

// Standard reward offers. Milestone bosses always show a Prismatic; every major boss shows at
// least one Forbidden; and after STANDARD.prismaticPity drafts without one, a Prismatic is
// forced. Offers are stored once rolled, so reloading can never reroll them.
const offerStandardRewards = (run, encounter) => {
    const nodeId = run.battle.nodeId;
    const forceTiers = [];
    const pity = Number(run.standard?.pity) || 0;
    if (encounter.kind === 'boss' && STANDARD.prismaticMilestones.includes(encounter.floor)) forceTiers.push('prismatic');
    else if (pity + 1 >= STANDARD.prismaticPity) forceTiers.push('prismatic');
    if (encounter.kind === 'boss') forceTiers.push('forbidden');
    const offers = rollScrollKeys(run, createRng(run.seed, `reward:${nodeId}`),
        towerStandard.tierWeightsFor(standardRewardTable(encounter), encounter.floor), 3, [], { forceTiers });
    const sawPrismatic = offers.some((key) => standardTierOf(key) === 'prismatic');
    run.standard = { ...(run.standard || {}), pity: sawPrismatic ? 0 : pity + 1 };
    return { nodeId, offers };
};

const recordStandardBattleResult = (run, { won, units, chakra, username, bossState }) => {
    const { encounter } = run.battle;
    if (!won) return endRun(run, 'defeated', `Fell on floor ${encounter.floor} of ${STANDARD.totalFloors} to ${encounter.name}.`);
    run.team.forEach((member, slot) => {
        if (!isDead(member)) settleMember(run, member, units[slot], username, slot);
    });
    run.floor = encounter.floor;
    if (chakra && typeof chakra === 'object') {
        run.chakra = capCarriedChakra(Object.fromEntries(Object.entries(chakra)
            .map(([type, amount]) => [type, Math.max(0, Math.floor(Number(amount) || 0))])));
    }
    run.stats.battlesWon += 1;
    if (encounter.kind === 'elite') run.stats.elitesWon += 1;
    if (encounter.kind === 'boss') {
        const boss = encounter.bossDef || towerBoss.getBossDefinition(encounter.bossId);
        run.stats.bossesDefeated = (run.stats.bossesDefeated || 0) + 1;
        if (encounter.final || towerStandard.isFinalFloor(encounter.floor)) {
            run.stats.actsCleared = towerStandard.REGIONS.length;
            return endRun(run, 'victory', boss.victoryText);
        }
        if (boss.trigger?.marksCursedSeal && Number.isInteger(bossState?.cursedSlot)) {
            const marked = run.team[bossState.cursedSlot];
            if (marked && !isDead(marked) && !marked.scrolls.includes('cursed-seal-of-heaven')) {
                marked.scrolls.push('cursed-seal-of-heaven');
                addLog(run, 'The Cursed Seal of Heaven burns on a ninja\'s neck.');
            }
        }
        // Clearing a region: the living recover and regain their last life.
        run.team.forEach((member) => {
            if (isDead(member)) return;
            member.fallen = false;
            healMember(member, Math.round(memberMaxHp(member) * STANDARD.majorBossHealPercent / 100));
        });
        run.stats.actsCleared = Math.max(run.stats.actsCleared || 0, towerStandard.regionFor(encounter.floor).number);
        addLog(run, `${boss.victoryText} The living recover ${STANDARD.majorBossHealPercent}% health and regain their last life.`);
    } else if (encounter.checkpoint === 'mini') {
        run.stats.championsDefeated = (run.stats.championsDefeated || 0) + 1;
    }
    const kind = encounter.kind === 'boss' ? 'boss' : encounter.checkpoint === 'mini' ? 'champion' : encounter.kind;
    const pouch = (run.teamScrolls || []).includes('ryo-pouch') ? RYO_REWARDS.pouch : 0;
    const ryoGained = (towerStandard.RYO_REWARDS[kind] || towerStandard.RYO_REWARDS.battle) + pouch;
    run.ryo += ryoGained;
    run.status = 'reward';
    run.pending = { ...offerStandardRewards(run, encounter), ryoGained };
    run.battle = null;
    addLog(run, `Defeated ${encounter.name} on floor ${encounter.floor} (+${ryoGained} ryō).`);
    return run;
};

const recordBattleResult = (run, { won, units = [], chakra = null, username = run.username, bossState = null }) => {
    if (run.status !== 'battle' || !run.battle) return run;
    if (isStandard(run)) return recordStandardBattleResult(run, { won, units, chakra, username, bossState });
    const { encounter } = run.battle;
    const duel = Boolean(encounter.duel);
    const championSlot = run.battle.championSlot;

    // A lost preliminary or finals bout is not the end of the run: the champion is carried
    // out of the arena. Losing any other battle, the final bout included, ends the climb.
    if (!won && (!duel || encounter.kind === 'boss')) {
        return endRun(run, 'defeated', `Fell on floor ${encounter.floor} to ${encounter.name}.`);
    }

    run.team.forEach((member, slot) => {
        if (isDead(member)) return;
        if (duel && slot !== championSlot) {
            healMember(member, POST_BATTLE_REGEN);
            return;
        }
        settleMember(run, member, units[slot], username, slot);
    });
    run.floor = encounter.floor;

    if (!won) {
        run.battle = null;
        if (run.team.every(isDead)) return endRun(run, 'defeated', `Lost ${encounter.name}, and no one is left to fight.`);
        addLog(run, `Lost ${encounter.name}. The champion was carried out of the arena.`);
        run.status = 'map';
        return run;
    }

    if (chakra && typeof chakra === 'object') {
        run.chakra = Object.fromEntries(Object.entries(chakra)
            .map(([type, amount]) => [type, Math.max(0, Math.floor(Number(amount) || 0))]));
    }
    run.stats.battlesWon += 1;
    if (encounter.kind === 'elite') run.stats.elitesWon += 1;
    if (encounter.carries && run.examScrolls) {
        run.examScrolls[encounter.carries] += 1;
        addLog(run, `Took the ${encounter.carries === 'heaven' ? 'Heaven' : 'Earth'} scroll from ${encounter.name}.`);
    }

    if (encounter.kind === 'boss') {
        const boss = towerBoss.getBossDefinition(encounter.bossId);
        if (encounter.final || encounter.bossId === towerBoss.BOSS_ID || !encounter.bossId) {
            const act = encounter.act || run.act || 1;
            run.stats.actsCleared = Math.max(run.stats.actsCleared || 0, act);
            run.battle = null;
            if (act >= towerActs.FINAL_ACT) {
                return endRun(run, 'victory', `${boss.victoryText} ${towerActs.NEXT_ACT_TEASER}`);
            }
            run.status = 'interlude';
            run.pending = { nextAct: act + 1 };
            addLog(run, boss.victoryText);
            return run;
        }
        // A mid-act boss: Orochimaru leaves his mark, then the forest's central tower.
        if (boss.trigger?.marksCursedSeal && Number.isInteger(bossState?.cursedSlot)) {
            const marked = run.team[bossState.cursedSlot];
            if (marked && !isDead(marked) && !marked.scrolls.includes('cursed-seal-of-heaven')) {
                marked.scrolls.push('cursed-seal-of-heaven');
                addLog(run, 'The Cursed Seal of Heaven burns on a ninja\'s neck.');
            }
        }
        addLog(run, boss.victoryText);
        if (run.examScrolls) reachExamTower(run);
    }

    const pouch = (run.teamScrolls || []).includes('ryo-pouch') ? RYO_REWARDS.pouch : 0;
    const ryoGained = (RYO_REWARDS[encounter.kind] || RYO_REWARDS.battle) + pouch;
    run.ryo += ryoGained;
    run.status = 'reward';
    run.pending = { ...offerRewards(run, encounter), ryoGained };
    run.battle = null;
    addLog(run, `Defeated ${encounter.name} on floor ${encounter.floor} (+${ryoGained} ryō).`);
    return run;
};

const chooseReward = (run, offerIndex, slot, { replaceKey = null } = {}) => {
    if (run.status !== 'reward') fail('There is no reward to claim.');
    const key = run.pending.offers[offerIndex];
    if (!key) fail('Choose one of the offered scrolls.');
    grantScroll(run, key, slot, { replaceKey });
    return completeNode(run);
};

const skipReward = (run) => {
    if (run.status !== 'reward') fail('There is no reward to skip.');
    run.ryo += RYO_REWARDS.skipScroll;
    addLog(run, `Skipped the ${isStandard(run) ? 'augment' : 'scroll'} for ${RYO_REWARDS.skipScroll} ryō.`);
    return completeNode(run);
};

const abandonRun = (run) => {
    if (!ACTIVE_STATUSES.has(run.status)) fail('This run is already over.');
    run.status = 'abandoned';
    run.endedAt = new Date();
    run.battle = null;
    addLog(run, 'The run was abandoned.');
    return run;
};

// Account ryo for a finished run; null when nothing is owed. Every cleared act pays its
// boss bonus (runs from before acts existed count a victory as Act I).
const computeAccountReward = (run) => {
    if (run.status === 'abandoned' || !ENDED_STATUSES.has(run.status)) return null;
    if (isStandard(run)) return towerStandard.computeAccountReward(run);
    const floorsCleared = Math.max(0, Number(run.floor) || 0);
    const actsCleared = Math.max(Number(run.stats?.actsCleared) || 0, run.status === 'victory' ? 1 : 0);
    let bossBonus = 0;
    for (let act = 1; act <= actsCleared; act += 1) bossBonus += ACTS[act]?.accountBossBonus || 0;
    return { floorsCleared, ryo: floorsCleared * ACCOUNT_RYO_PER_FLOOR + bossBonus };
};

const addLog = (run, text) => {
    run.log = [...(run.log || []), { at: new Date(), text }].slice(-30);
};

// ---------------------------------------------------------------- client view
const describeAffix = (id) => {
    const affix = AFFIXES[id];
    return affix ? { id, name: affix.name, kanji: affix.kanji, description: affix.description } : null;
};

const describeEncounter = (encounter, character) => ({
    kind: encounter.kind,
    floor: encounter.floor,
    name: encounter.name,
    blurb: encounter.blurb || '',
    duel: Boolean(encounter.duel),
    carries: encounter.carries || null,
    hpMultiplier: encounter.hpMultiplier || 1,
    affixes: (encounter.affixes || []).map(describeAffix).filter(Boolean),
    // Starting health is shown so the player can judge the fight before entering it.
    enemies: (encounter.enemyIds || []).map((id, slot) => (id ? {
        ...character(id),
        hp: encounter.hpCaps?.[slot] || Math.round(BASE_MAX_HP * Math.max(1, Number(encounter.hpMultiplier) || 1)),
    } : null)).filter(Boolean),
    boss: encounter.kind === 'boss'
        ? towerBoss.describeBossForClient(encounter.bossId || towerBoss.BOSS_ID, encounter.bossDef || null) : null,
    checkpoint: encounter.checkpoint || null,
    final: Boolean(encounter.final),
});

const describeEventForClient = (run) => {
    const event = getEvent(run.pending?.eventId);
    if (!event) return null;
    return {
        id: run.pending.eventId,
        pool: event.pool,
        kanji: event.kanji,
        title: event.title,
        speaker: event.speaker || '',
        text: event.text,
        options: event.options.map((option) => ({
            id: option.id,
            label: option.label,
            description: option.description,
            cost: option.cost || 0,
            needsSlot: Boolean(option.slot),
            blocked: optionBlockReason(run, option),
            slotReasons: option.slot ? run.team.map((member) => slotBlockReason(run, member, option.slot)) : null,
        })),
    };
};

// Scouting: what waits behind each open node. Encounters are seeded, so the preview is
// exactly the fight the node will start.
const describePreviews = (run, rosterIds, character, nameOf, skillsOf) => {
    if (run.status !== 'map' || !rosterIds) return {};
    const previews = {};
    getAvailableNodeIds(run).forEach((nodeId) => {
        const node = findNode(run, nodeId);
        if (!node) return;
        if (COMBAT_NODE_TYPES.has(node.type)) {
            previews[nodeId] = { encounter: describeEncounter(buildEncounter(run, node, rosterIds, nameOf, { skillsOf }), character) };
        } else if (node.type === 'training' && node.eventId) {
            const event = getEvent(node.eventId);
            previews[nodeId] = { trainer: { title: event.title, speaker: event.speaker || '' } };
        }
    });
    return previews;
};

// The Standard-mode view: segment map, region, progress rail checkpoints, capacity, fusion.
const serializeStandardRun = (run, { character, nameOf, rosterIds, skillsOf }) => {
    const mode = { mode: 'standard' };
    const describe = (key) => describeScroll(key, mode);
    const nextFloor = Math.min(STANDARD.totalFloors, (run.floor || 0) + 1);
    const segmentIndex = Number.isInteger(run.map?.segment) ? run.map.segment : towerStandard.segmentIndexOf(nextFloor);
    const range = towerStandard.segmentRange(segmentIndex);
    const region = towerStandard.regionFor(Math.max(range.firstFloor, Math.min(nextFloor, range.lastFloor)));
    const pending = run.pending || null;
    const bosses = {};
    (run.map?.floors || []).flat().filter((node) => node.type === 'boss').forEach((node) => {
        if (!rosterIds) return;
        const encounter = buildStandardEncounter(run, node, rosterIds, { nameOf, skillsOf });
        const def = encounter.bossDef || towerBoss.getBossDefinition(encounter.bossId);
        bosses[node.bossId] = { name: def.name, title: def.title, leader: character(def.enemyIds[0]) };
    });
    const checkpoints = Array.from({ length: STANDARD.segments }, (_, index) => {
        const floor = (index + 1) * STANDARD.segmentLength;
        return { floor, kind: towerStandard.isMajorFloor(floor) ? (floor === STANDARD.totalFloors ? 'final' : 'major') : 'mini',
            cleared: (run.floor || 0) >= floor };
    });
    const capacity = {
        team: capacityFor(run, 'team'),
        ninja: (run.team || []).map((member) => capacityFor(run, 'ninja', member)),
    };
    const view = {
        mode: 'standard',
        modeLabel: 'Standard',
        rulesetVersion: run.rulesetVersion || STANDARD.rulesetVersion,
        act: { act: region.number, name: region.name, title: region.title, firstFloor: range.firstFloor, lastFloor: range.lastFloor },
        totalFloors: STANDARD.totalFloors,
        maxFloors: STANDARD.totalFloors,
        stage: region.title,
        scene: region.scene,
        standard: {
            segment: segmentIndex + 1,
            segments: STANDARD.segments,
            region: { number: region.number, name: region.name, title: region.title, firstFloor: region.firstFloor, lastFloor: region.lastFloor },
            band: towerStandard.bandFor(nextFloor).label,
            checkpoints,
            nextCheckpoint: checkpoints.find((entry) => !entry.cleared) || null,
            capacity,
            chakraCarryCap: STANDARD.chakraCarryCap,
        },
        boss: null,
        bosses,
        // The latest automatic fusion, so the page can play its moment once (keyed by id).
        lastFusion: run.lastFusion ? {
            id: run.lastFusion.id,
            floor: run.lastFusion.floor,
            name: RECIPES_BY_ID.get(run.lastFusion.recipeId)?.name || run.lastFusion.recipeId,
            result: describe(run.lastFusion.result),
            consumed: run.lastFusion.consumed.map((key) => describe(key)).filter(Boolean),
        } : null,
        fusions: (run.fusions || []).map((entry) => ({
            ...entry, name: RECIPES_BY_ID.get(entry.recipeId)?.name || entry.recipeId,
            consumedNames: entry.consumed.map((key) => describe(key)?.name || key),
        })),
        previews: describePreviews(run, rosterIds, character, nameOf, skillsOf),
    };
    return view;
};

// An offered scroll as the page sees it; in Standard runs it also says when taking it would
// complete a fusion (and into what).
const describeOffer = (run, key) => {
    const info = describeScroll(key, { mode: modeOf(run) });
    const recipe = info ? recipeCompletedBy(run, key) : null;
    if (!recipe) return info;
    const { ingredients, result } = recipeKeys(recipe);
    const partner = ingredients.find((ingredient) => ingredient !== key);
    return {
        ...info,
        fusion: {
            name: recipe.name,
            partner: describeScroll(partner, { mode: 'standard' })?.name || partner,
            result: describeScroll(result, { mode: 'standard' }),
        },
    };
};

const serializeRun = (run, describeCharacter, { rosterIds = null, skillsOf = null } = {}) => {
    if (!run) return null;
    const character = (id) => describeCharacter(id) || { characterId: id, name: id };
    const nameOf = (id) => character(id).name;
    const pending = run.pending || null;
    const scrollMode = { mode: modeOf(run) };
    const act = actOf(run);
    const bossIds = new Set((run.map?.floors || []).flat().filter((node) => node.type === 'boss')
        .map((node) => node.bossId || towerBoss.BOSS_ID));
    const view = {
        runId: run.runId,
        status: run.status,
        version: run.version,
        act: { act: act.act, name: act.name, title: act.title, firstFloor: act.firstFloor, lastFloor: act.lastFloor },
        floor: run.floor,
        totalFloors: act.lastFloor,
        maxFloors: MAX_FLOORS,
        stage: towerActs.stageForFloor(Math.min(act.lastFloor, (run.floor || 0) + 1)),
        ryo: run.ryo,
        chakra: run.chakra || null,
        examScrolls: run.examScrolls || null,
        currentNodeId: run.currentNodeId,
        path: run.path || [],
        boss: { name: towerBoss.getBossDefinition(act.bossId).name, leader: character(towerBoss.getBossDefinition(act.bossId).enemyIds[0]) },
        bosses: Object.fromEntries([...bossIds].map((id) => {
            const def = towerBoss.getBossDefinition(id);
            return [id, { name: def.name, title: def.title, leader: character(def.enemyIds[0]) }];
        })),
        availableNodeIds: getAvailableNodeIds(run),
        previews: isStandard(run) ? {} : describePreviews(run, rosterIds, character, nameOf),
        map: run.map,
        mode: modeOf(run),
        modeLabel: MODES[modeOf(run)].label,
        team: (run.team || []).map((member) => ({
            ...character(member.characterId),
            hp: Math.round(member.hp),
            maxHp: memberMaxHp(member),
            wounded: isWounded(member),
            fallen: Boolean(member.fallen),
            dead: isDead(member),
            stackCount: (member.carriedStatuses || []).length,
            scrolls: member.scrolls.map((key) => describeScroll(key, scrollMode)).filter(Boolean),
        })),
        teamScrolls: (run.teamScrolls || []).map((key) => describeScroll(key, scrollMode)).filter(Boolean),
        stats: run.stats,
        log: (run.log || []).slice(-8),
        accountReward: run.accountReward || null,
        createdAt: run.createdAt,
        endedAt: run.endedAt || null,
        constants: {
            ramenFeastPercent: RAMEN.feastPercent, medkitHealPercent: MEDKIT_HEAL_PERCENT,
            skipScrollRyo: RYO_REWARDS.skipScroll, woundedPercent: WOUNDED_HP_FRACTION * 100,
            postBattleRegen: isStandard(run) ? STANDARD.postBattleRegen : POST_BATTLE_REGEN, examTower: EXAM_TOWER,
            salvageRyo: STANDARD.salvageRyo,
        },
        nextActTeaser: towerActs.NEXT_ACT_TEASER,
    };
    if (run.status === 'draft' && run.draft) {
        const draft = normalizeDraft({ ...run.draft });
        view.draft = {
            rerolls: draft.rerolls,
            offers: draft.offers.map((candidates) => candidates.map(character)),
        };
    }
    if (run.status === 'battle' && run.battle) {
        view.battle = {
            matchId: run.battle.matchId,
            championSlot: Number.isInteger(run.battle.championSlot) ? run.battle.championSlot : null,
            encounter: describeEncounter(run.battle.encounter, character),
        };
    }
    if (pending && run.status === 'merchant') {
        view.merchant = {
            stock: pending.stock.map((item) => ({
                kind: item.kind,
                price: item.price,
                sold: item.sold,
                scroll: item.kind === 'scroll' ? describeOffer(run, item.key) : null,
            })),
        };
    }
    if (pending && run.status === 'recruit') view.recruit = { offers: pending.offers.map(character) };
    if (pending && run.status === 'reward') {
        view.reward = {
            ryoGained: pending.ryoGained,
            starting: Boolean(pending.starting),
            offers: pending.offers.map((key) => describeOffer(run, key)).filter(Boolean),
        };
    }
    if (pending && run.status === 'event') view.event = describeEventForClient(run);
    if (run.status === 'interlude') {
        const next = ACTS[pending?.nextAct || (run.act || 1) + 1];
        view.interlude = next ? { act: next.act, name: next.name, title: next.title, firstFloor: next.firstFloor } : null;
    }
    if (isStandard(run)) Object.assign(view, serializeStandardRun(run, { character, nameOf, rosterIds, skillsOf }));
    return view;
};

module.exports = {
    MODES,
    modeOf,
    STANDARD,
    recipeCompletedBy,
    capacityFor,
    pickStandardBoss,
    generateStandardSegment,
    TOTAL_FLOORS, MAX_FLOORS, ELITE_FLOOR, REST_FLOOR, BOSS_FLOOR, BASE_MAX_HP, STARTING_RYO, WOUNDED_HP_FRACTION,
    POST_BATTLE_REGEN, DRAFT_REROLLS_PER_SLOT, EXAM_TOWER, DUEL_RULE_STATUS,
    extractCarriedStatuses,
    RYO_REWARDS, MERCHANT_PRICES, AFFIXES, NODE_TYPES, ACTIVE_STATUSES, ENDED_STATUSES, SCROLL_TIERS,
    TowerError,
    createRng,
    createRun,
    rerollDraft,
    chooseDraft,
    generateMap,
    generateActFloors,
    findNode,
    getAvailableNodeIds,
    buildEncounter,
    chooseNode,
    applyRamen,
    merchantBuy,
    leaveNode,
    recruit,
    resolveEvent,
    continueRun,
    chooseChampion,
    buildBattleSetup,
    recordBattleResult,
    chooseReward,
    skipReward,
    abandonRun,
    computeAccountReward,
    memberMaxHp,
    describeAffix,
    serializeRun,
};
