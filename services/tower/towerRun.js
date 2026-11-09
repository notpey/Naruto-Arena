// The Tower: a PvE roguelike run. This module is pure run logic. It decides what the
// player is offered and keeps the run's state (team, health, scrolls, ryo, map). It
// never resolves combat: Tower battles are ordinary server matches resolved by
// battleLogic.js, and only their outcome (winner and each ninja's remaining health)
// comes back here.
//
// Every random choice is seeded by the run's seed and a fixed label, so refreshing a
// page or retrying a request can never reroll an offer.

const {
    ALL_SCROLL_KEYS, SCROLL_TIERS, parseScrollKey, describeScroll, getScrollMaxHpBonus,
} = require('./towerScrolls');
const towerBoss = require('./towerBoss');

const TOTAL_FLOORS = 10;
const ELITE_FLOOR = 5;
const REST_FLOOR = 9;
const BOSS_FLOOR = TOTAL_FLOORS;
const LANES = 3;
const BASE_MAX_HP = 100;
const STARTING_RYO = 40;
const WOUNDED_HP_FRACTION = 0.25;
const DRAFT_REROLLS = 1;

const RYO_REWARDS = { battle: 30, elite: 60, skipScroll: 15 };
const RAMEN = { feastPercent: 40, restSlotPercent: 100 };
const MERCHANT_PRICES = { genin: 45, jonin: 80, kage: 130, medkit: 35 };
const MEDKIT_HEAL_PERCENT = 30;
// Account ryo granted once when a run ends (defeat or victory; abandoning grants nothing).
const ACCOUNT_RYO_PER_FLOOR = 15;
const ACCOUNT_RYO_BOSS_BONUS = 150;

const ACTIVE_STATUSES = new Set(['draft', 'map', 'battle', 'ramen', 'merchant', 'recruit', 'reward']);
const ENDED_STATUSES = new Set(['victory', 'defeated', 'abandoned']);

const NODE_TYPES = {
    battle: { label: 'Battle' },
    elite: { label: 'Elite' },
    boss: { label: 'Boss' },
    ramen: { label: 'Ramen Stand' },
    merchant: { label: 'Merchant' },
    recruit: { label: 'Recruit' },
};
const COMBAT_NODE_TYPES = new Set(['battle', 'elite', 'boss']);

const SQUAD_NAMES = [
    "Gatō's Hired Swords", 'Mist Hunter-nin', 'Rogue Genin Cell', 'Bandits of the Great Bridge',
    'Deserters of the Mist', 'Wave Country Mercenaries', 'Masked Trackers', 'Fog Raiders',
];
const ELITE_NAMES = ['The Ashen Fang', 'Widow of the Mist', 'The Nameless Jonin', 'Mourning Blade'];

// Enemy affixes are plain status metadata too, applied to every unit of the enemy team.
const AFFIXES = {
    fortified: { id: 'fortified', name: 'Fortified', kanji: '堅',
        description: 'These enemies have 5 damage reduction.', metadata: { damageReductionFlat: 5 } },
    frenzied: { id: 'frenzied', name: 'Frenzied', kanji: '狂',
        description: 'These enemies deal 5 additional damage.', metadata: { damageBonusFlat: 5 } },
};
const AFFIX_IDS = Object.keys(AFFIXES);

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

const createMember = (characterId) => ({ characterId, hp: BASE_MAX_HP, scrolls: [] });

const healMember = (member, amount) => {
    member.hp = Math.min(memberMaxHp(member), Math.max(0, Number(member.hp) || 0) + Math.max(0, amount));
};

const isWounded = (member) => member.hp <= memberMaxHp(member) * WOUNDED_HP_FRACTION;

const requireSlot = (run, slot) => {
    if (!Number.isInteger(slot) || slot < 0 || slot >= run.team.length) fail('Choose one of your ninjas.');
    return run.team[slot];
};

// ---------------------------------------------------------------- run creation and draft
const buildDraftOffers = (seed, rosterIds, round) => {
    const pool = shuffled(rosterIds, createRng(seed, `draft:${round}`));
    if (pool.length < 9) fail('The roster is too small for a Tower draft.', 500);
    return [pool.slice(0, 3), pool.slice(3, 6), pool.slice(6, 9)];
};

const createRun = ({ username, rosterIds, seed, now = new Date(), runId }) => ({
    runId,
    username,
    seed: String(seed),
    status: 'draft',
    version: 0,
    createdAt: now,
    updatedAt: now,
    floor: 0,
    currentNodeId: null,
    path: [],
    map: null,
    draft: { round: 0, rerollsLeft: DRAFT_REROLLS, offers: buildDraftOffers(seed, rosterIds, 0) },
    team: [],
    teamScrolls: [],
    ryo: STARTING_RYO,
    pending: null,
    battle: null,
    stats: { battlesWon: 0, elitesWon: 0, scrollsTaken: 0 },
    log: [],
    accountReward: null,
});

const rerollDraft = (run, rosterIds) => {
    if (run.status !== 'draft') fail('The draft is already over.');
    if (run.draft.rerollsLeft <= 0) fail('No draft rerolls left.');
    run.draft.round += 1;
    run.draft.rerollsLeft -= 1;
    run.draft.offers = buildDraftOffers(run.seed, rosterIds, run.draft.round);
    return run;
};

const chooseDraft = (run, offerIndex) => {
    if (run.status !== 'draft') fail('The draft is already over.');
    const offer = run.draft.offers[offerIndex];
    if (!offer) fail('Choose one of the offered teams.');
    run.team = offer.map(createMember);
    run.map = generateMap(run.seed);
    run.status = 'map';
    run.draft = null;
    addLog(run, `The climb begins with ${offer.length} ninjas.`);
    return run;
};

// ---------------------------------------------------------------- map
const randomFloorTypes = (rng) => {
    const types = Array.from({ length: LANES }, () => pickWeighted(
        [['battle', 50], ['recruit', 18], ['merchant', 16], ['ramen', 16]], rng));
    if (!types.includes('battle')) types[Math.floor(rng() * LANES)] = 'battle';
    return types;
};

const floorTypesFor = (floor, rng) => {
    if (floor === 1) return ['battle', 'battle', 'battle'];
    if (floor === ELITE_FLOOR) return ['elite', 'elite', 'elite'];
    if (floor === REST_FLOOR) return shuffled(['ramen', 'merchant', 'ramen'], rng);
    if (floor === BOSS_FLOOR) return ['boss'];
    return randomFloorTypes(rng);
};

const generateMap = (seed) => {
    const rng = createRng(seed, 'map');
    const floors = [];
    for (let floor = 1; floor <= TOTAL_FLOORS; floor += 1) {
        floors.push(floorTypesFor(floor, rng).map((type, lane) => ({
            id: `f${floor}-${lane}`, floor, lane, type, next: [],
        })));
    }
    // Each node leads to the node in its own lane and one neighbouring lane, so every
    // node is reachable and paths can cross. The rest floor feeds the single boss node.
    for (let index = 0; index < floors.length - 1; index += 1) {
        const nextFloor = floors[index + 1];
        floors[index].forEach((node) => {
            if (nextFloor.length === 1) {
                node.next = [nextFloor[0].id];
                return;
            }
            const neighbours = [node.lane - 1, node.lane + 1].filter((lane) => lane >= 0 && lane < LANES);
            const neighbour = neighbours[Math.floor(rng() * neighbours.length)];
            node.next = [node.lane, neighbour].sort().map((lane) => nextFloor[lane].id);
        });
    }
    return { floors };
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

const buildEncounter = (run, node, rosterIds) => {
    const rng = createRng(run.seed, `encounter:${node.id}`);
    if (node.type === 'boss') return towerBoss.buildBossEncounter({ floor: node.floor });
    if (node.type === 'elite') {
        return {
            kind: 'elite',
            floor: node.floor,
            name: ELITE_NAMES[Math.floor(rng() * ELITE_NAMES.length)],
            enemyIds: pickEnemyIds(rng, rosterIds),
            hpMultiplier: 1.6,
            affixes: AFFIX_IDS.slice(),
        };
    }
    const affixCount = node.floor >= 7 ? 2 : node.floor >= 4 ? 1 : 0;
    return {
        kind: 'battle',
        floor: node.floor,
        name: SQUAD_NAMES[Math.floor(rng() * SQUAD_NAMES.length)],
        enemyIds: pickEnemyIds(rng, rosterIds),
        hpMultiplier: node.floor <= 2 ? 1 : Math.round((1 + 0.08 * (node.floor - 2)) * 100) / 100,
        affixes: shuffled(AFFIX_IDS, rng).slice(0, affixCount),
    };
};

// ---------------------------------------------------------------- scroll offers
const TIER_WEIGHTS = {
    battle: [['genin', 65], ['jonin', 30], ['kage', 5]],
    elite: [['jonin', 70], ['kage', 30]],
    merchant: [['genin', 55], ['jonin', 35], ['kage', 10]],
};

// A scroll can be offered while at least one ninja could still take it.
const canTakeScroll = (run, key) => {
    const parsed = parseScrollKey(key);
    if (!parsed) return false;
    if (parsed.scroll.scope === 'team') return !run.teamScrolls.includes(key);
    return run.team.some((member) => !member.scrolls.includes(key));
};

const rollScrollKeys = (run, rng, weights, count, exclude = []) => {
    const picked = [];
    for (let attempt = 0; picked.length < count && attempt < 60; attempt += 1) {
        const tier = pickWeighted(weights, rng);
        const pool = ALL_SCROLL_KEYS.filter((key) => {
            const parsed = parseScrollKey(key);
            return parsed.scroll.tier === tier && canTakeScroll(run, key) &&
                !picked.some((entry) => entry.split(':')[0] === parsed.scroll.id) &&
                !exclude.includes(key);
        });
        if (pool.length) picked.push(pool[Math.floor(rng() * pool.length)]);
    }
    return picked;
};

const grantScroll = (run, key, slot) => {
    const parsed = parseScrollKey(key);
    if (!parsed) fail('Unknown scroll.');
    if (parsed.scroll.scope === 'team') {
        if (run.teamScrolls.includes(key)) fail('Your team already has that scroll.');
        run.teamScrolls.push(key);
    } else {
        const member = requireSlot(run, slot);
        if (member.scrolls.includes(key)) fail('That ninja already has this scroll.');
        member.scrolls.push(key);
        const bonus = getScrollMaxHpBonus(key);
        if (bonus > 0) healMember(member, bonus);
    }
    run.stats.scrollsTaken += 1;
    addLog(run, `Learned ${describeScroll(key).name}.`);
};

// ---------------------------------------------------------------- node choice
const chooseNode = (run, nodeId, rosterIds) => {
    if (!getAvailableNodeIds(run).includes(nodeId)) fail('That path is not open.');
    const node = findNode(run, nodeId);
    run.currentNodeId = node.id;
    run.path = [...(run.path || []), node.id];
    const rng = createRng(run.seed, `node:${node.id}`);
    if (COMBAT_NODE_TYPES.has(node.type)) {
        run.status = 'battle';
        run.battle = { nodeId: node.id, matchId: null, encounter: buildEncounter(run, node, rosterIds) };
        return run;
    }
    if (node.type === 'ramen') {
        run.status = 'ramen';
        run.pending = { nodeId: node.id };
    } else if (node.type === 'merchant') {
        run.status = 'merchant';
        run.pending = {
            nodeId: node.id,
            stock: [
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

// Leaving a non-combat node clears its floor.
const completeNode = (run) => {
    const node = findNode(run, run.currentNodeId);
    run.floor = node ? node.floor : run.floor;
    run.pending = null;
    run.status = 'map';
    return run;
};

const applyRamen = (run, option, slot) => {
    if (run.status !== 'ramen') fail('There is no ramen stand here.');
    if (option === 'feast') {
        run.team.forEach((member) => healMember(member, Math.round(memberMaxHp(member) * RAMEN.feastPercent / 100)));
        addLog(run, `Ichiraku feast: every ninja recovered ${RAMEN.feastPercent}% health.`);
    } else if (option === 'rest') {
        const member = requireSlot(run, slot);
        healMember(member, memberMaxHp(member));
        addLog(run, 'One ninja rested to full health.');
    } else {
        fail('Choose a meal.');
    }
    return completeNode(run);
};

const merchantBuy = (run, itemIndex, slot) => {
    if (run.status !== 'merchant') fail('There is no merchant here.');
    const item = run.pending.stock[itemIndex];
    if (!item || item.sold) fail('That item is not for sale.');
    if (run.ryo < item.price) fail('Not enough ryō.');
    if (item.kind === 'scroll') {
        grantScroll(run, item.key, slot);
    } else if (item.kind === 'medkit') {
        run.team.forEach((member) => healMember(member, Math.round(memberMaxHp(member) * MEDKIT_HEAL_PERCENT / 100)));
        addLog(run, `Bought a medical kit: every ninja recovered ${MEDKIT_HEAL_PERCENT}% health.`);
    }
    run.ryo -= item.price;
    item.sold = true;
    return run;
};

const leaveNode = (run) => {
    if (!['merchant', 'recruit'].includes(run.status)) fail('There is nothing to leave.');
    return completeNode(run);
};

const recruit = (run, offerIndex, slot) => {
    if (run.status !== 'recruit') fail('There is no one to recruit here.');
    const characterId = run.pending.offers[offerIndex];
    if (!characterId) fail('Choose one of the offered ninjas.');
    const member = requireSlot(run, slot);
    // The newcomer inherits the departing ninja's scrolls and arrives fully rested.
    member.characterId = characterId;
    member.hp = memberMaxHp(member);
    addLog(run, 'A recruit joined the team and inherited the departing ninja\'s scrolls.');
    return completeNode(run);
};

// ---------------------------------------------------------------- battle
// What the server needs to build a Tower match for this run's current battle.
const buildBattleSetup = (run) => {
    if (run.status !== 'battle' || !run.battle) fail('No Tower battle is ready.');
    return {
        encounter: run.battle.encounter,
        team: run.team.map((member) => ({
            characterId: member.characterId,
            hp: Math.max(1, Math.round(member.hp)),
            maxHp: memberMaxHp(member),
            scrolls: [...run.teamScrolls, ...member.scrolls],
        })),
    };
};

const offerRewards = (run, kind) => {
    const node = findNode(run, run.battle.nodeId);
    const rng = createRng(run.seed, `reward:${node.id}`);
    return { nodeId: node.id, offers: rollScrollKeys(run, rng, TIER_WEIGHTS[kind] || TIER_WEIGHTS.battle, 3) };
};

// units: the player's board units at the end of the match, in team order.
const recordBattleResult = (run, { won, units = [] }) => {
    if (run.status !== 'battle' || !run.battle) return run;
    const { encounter } = run.battle;
    if (!won) {
        run.status = 'defeated';
        run.endedAt = new Date();
        addLog(run, `Fell on floor ${encounter.floor} to ${encounter.name}.`);
        run.battle = null;
        return run;
    }
    run.team.forEach((member, slot) => {
        const unit = units[slot];
        const maxHp = memberMaxHp(member);
        const alive = unit && unit.alive !== false && Number(unit.hp) > 0;
        // A fallen ninja is carried out wounded rather than lost.
        member.hp = alive
            ? Math.min(maxHp, Math.max(1, Math.round(Number(unit.hp))))
            : Math.max(1, Math.round(maxHp * WOUNDED_HP_FRACTION));
    });
    run.floor = encounter.floor;
    run.stats.battlesWon += 1;
    if (encounter.kind === 'elite') run.stats.elitesWon += 1;
    if (encounter.kind === 'boss') {
        run.status = 'victory';
        run.endedAt = new Date();
        run.battle = null;
        addLog(run, `Defeated ${encounter.name}. The Land of Waves is free.`);
        return run;
    }
    const ryoGained = RYO_REWARDS[encounter.kind] || RYO_REWARDS.battle;
    run.ryo += ryoGained;
    run.status = 'reward';
    run.pending = { ...offerRewards(run, encounter.kind), ryoGained };
    run.battle = null;
    addLog(run, `Defeated ${encounter.name} on floor ${encounter.floor} (+${ryoGained} ryō).`);
    return run;
};

const chooseReward = (run, offerIndex, slot) => {
    if (run.status !== 'reward') fail('There is no reward to claim.');
    const key = run.pending.offers[offerIndex];
    if (!key) fail('Choose one of the offered scrolls.');
    grantScroll(run, key, slot);
    return completeNode(run);
};

const skipReward = (run) => {
    if (run.status !== 'reward') fail('There is no reward to skip.');
    run.ryo += RYO_REWARDS.skipScroll;
    addLog(run, `Skipped the scroll for ${RYO_REWARDS.skipScroll} ryō.`);
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

// Account ryo for a finished run; null when nothing is owed.
const computeAccountReward = (run) => {
    if (run.status === 'abandoned' || !ENDED_STATUSES.has(run.status)) return null;
    const floorsCleared = Math.max(0, Number(run.floor) || 0);
    const bossBonus = run.status === 'victory' ? ACCOUNT_RYO_BOSS_BONUS : 0;
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

const serializeRun = (run, describeCharacter) => {
    if (!run) return null;
    const character = (id) => describeCharacter(id) || { characterId: id, name: id };
    const pending = run.pending || null;
    const view = {
        runId: run.runId,
        status: run.status,
        version: run.version,
        floor: run.floor,
        totalFloors: TOTAL_FLOORS,
        ryo: run.ryo,
        currentNodeId: run.currentNodeId,
        path: run.path || [],
        boss: { name: towerBoss.BOSS_DEFINITION.name, leader: character(towerBoss.BOSS_DEFINITION.enemyIds[0]) },
        availableNodeIds: getAvailableNodeIds(run),
        map: run.map,
        team: (run.team || []).map((member) => ({
            ...character(member.characterId),
            hp: Math.round(member.hp),
            maxHp: memberMaxHp(member),
            wounded: isWounded(member),
            scrolls: member.scrolls.map(describeScroll).filter(Boolean),
        })),
        teamScrolls: (run.teamScrolls || []).map(describeScroll).filter(Boolean),
        stats: run.stats,
        log: (run.log || []).slice(-8),
        accountReward: run.accountReward || null,
        createdAt: run.createdAt,
        endedAt: run.endedAt || null,
        constants: {
            ramenFeastPercent: RAMEN.feastPercent, medkitHealPercent: MEDKIT_HEAL_PERCENT,
            skipScrollRyo: RYO_REWARDS.skipScroll, woundedPercent: WOUNDED_HP_FRACTION * 100,
        },
    };
    if (run.status === 'draft' && run.draft) {
        view.draft = {
            rerollsLeft: run.draft.rerollsLeft,
            offers: run.draft.offers.map((trio) => trio.map(character)),
        };
    }
    if (run.status === 'battle' && run.battle) {
        const { encounter } = run.battle;
        view.battle = {
            matchId: run.battle.matchId,
            encounter: {
                kind: encounter.kind,
                floor: encounter.floor,
                name: encounter.name,
                hpMultiplier: encounter.hpMultiplier || 1,
                affixes: (encounter.affixes || []).map(describeAffix).filter(Boolean),
                // Starting health is shown so the player can judge the fight before entering it.
                enemies: (encounter.enemyIds || []).map((id, slot) => ({
                    ...character(id),
                    hp: encounter.hpCaps?.[slot] || Math.round(BASE_MAX_HP * Math.max(1, Number(encounter.hpMultiplier) || 1)),
                })),
                boss: encounter.kind === 'boss' ? towerBoss.describeBossForClient(encounter) : null,
            },
        };
    }
    if (pending && run.status === 'merchant') {
        view.merchant = {
            stock: pending.stock.map((item) => ({
                kind: item.kind,
                price: item.price,
                sold: item.sold,
                scroll: item.kind === 'scroll' ? describeScroll(item.key) : null,
            })),
        };
    }
    if (pending && run.status === 'recruit') view.recruit = { offers: pending.offers.map(character) };
    if (pending && run.status === 'reward') {
        view.reward = { ryoGained: pending.ryoGained, offers: pending.offers.map(describeScroll).filter(Boolean) };
    }
    return view;
};

module.exports = {
    TOTAL_FLOORS, ELITE_FLOOR, REST_FLOOR, BOSS_FLOOR, BASE_MAX_HP, STARTING_RYO, WOUNDED_HP_FRACTION,
    RYO_REWARDS, MERCHANT_PRICES, AFFIXES, NODE_TYPES, ACTIVE_STATUSES, ENDED_STATUSES, SCROLL_TIERS,
    TowerError,
    createRng,
    createRun,
    rerollDraft,
    chooseDraft,
    generateMap,
    findNode,
    getAvailableNodeIds,
    chooseNode,
    applyRamen,
    merchantBuy,
    leaveNode,
    recruit,
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
