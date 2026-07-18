const DEFAULT_ROWS = 7;

const NODE_TYPES = Object.freeze({
    BATTLE: 'battle',
    ELITE_BATTLE: 'elite_battle',
    EVENT: 'event',
    REST_CAMP: 'rest_camp',
    MERCHANT: 'merchant',
    SCROLL_CACHE: 'scroll_cache',
});

const EXAM_SCROLL_TYPES = Object.freeze({
    HEAVEN: 'heaven',
    EARTH: 'earth',
});

const RELIC_SCROLLS = Object.freeze([
    {
        id: 'reserve-cache',
        name: 'Reserve Cache',
        rarity: 'common',
        description: 'Start each battle with +1 random chakra already in the pool.',
        isCurse: false,
        effects: [{ kind: 'chakra_income_delta', amount: 1, scope: 'battle_start' }],
    },
    {
        id: 'steady-hands',
        name: 'Steady Hands',
        rarity: 'common',
        description: 'The first skill your team uses each battle costs 1 less chakra of any one required color.',
        isCurse: false,
        effects: [{ kind: 'chakra_cost_delta', amount: -1, appliesTo: 'first_skill_per_battle' }],
    },
    {
        id: 'second-wind',
        name: 'Second Wind',
        rarity: 'uncommon',
        description: "The first time a teammate would be KO'd each battle, they instead survive at 1 HP.",
        isCurse: false,
        effects: [{ kind: 'survive_lethal', usesPerBattle: 1, hpLeft: 1 }],
    },
    {
        id: 'overclocked-cooldowns',
        name: 'Overclocked Cooldowns',
        rarity: 'uncommon',
        description: 'All cooldowns of 4+ turns are reduced by 1 for the rest of the run.',
        isCurse: false,
        effects: [{ kind: 'cooldown_delta', amount: -1, filter: { minCooldown: 4 } }],
    },
    {
        id: 'iron-will',
        name: 'Iron Will',
        rarity: 'common',
        description: "Your team's Invulnerable-granting skills last 1 additional turn.",
        isCurse: false,
        effects: [{ kind: 'invuln_duration_delta', amount: 1 }],
    },
    {
        id: 'bleeding-edge',
        name: 'Bleeding Edge',
        rarity: 'common',
        description: "Your team's Affliction-class skills deal +5 damage.",
        isCurse: false,
        effects: [{ kind: 'damage_delta', amount: 5, classFilter: 'affliction' }],
    },
    {
        id: 'scroll-hoarder',
        name: 'Scroll Hoarder',
        rarity: 'common',
        description: 'Merchant prices for Heaven/Earth Scrolls are reduced by 30%.',
        isCurse: false,
        effects: [{ kind: 'shop_price_multiplier', category: 'exam_scroll', multiplier: 0.7 }],
    },
    {
        id: 'combo-discipline',
        name: 'Combo Discipline',
        rarity: 'uncommon',
        description: 'Skills that require a prior skill/state to be active have their cooldown reduced by 1.',
        isCurse: false,
        effects: [{ kind: 'cooldown_delta', amount: -1, filter: { comboGatedOnly: true } }],
    },
    {
        id: 'forest-instincts',
        name: 'Forest Instincts',
        rarity: 'common',
        description: "Your team's chakra income is +1 on the very first turn of every battle only.",
        isCurse: false,
        effects: [{ kind: 'chakra_income_delta', amount: 1, scope: 'first_turn_only' }],
    },
    {
        id: 'clean-getaway',
        name: 'Clean Getaway',
        rarity: 'rare',
        description: "Once per run, when your team would wipe, retreat with 1 HP and skip the current node's rewards.",
        isCurse: false,
        effects: [{ kind: 'survive_run_wipe', usesPerRun: 1, hpLeft: 1, skipRewards: true }],
    },
]);

const CURSES = Object.freeze([
    {
        id: 'cursed-seal-lesser',
        name: 'Cursed Seal (Lesser)',
        rarity: 'rare',
        description: 'Physical-class skills deal +8 damage, but your team takes 3 damage at the start of each turn.',
        isCurse: true,
        effects: [
            { kind: 'damage_delta', amount: 8, classFilter: 'physical' },
            { kind: 'turn_start_team_damage', amount: 3 },
        ],
    },
    {
        id: 'borrowed-power',
        name: 'Borrowed Power',
        rarity: 'rare',
        description: '+1 chakra income per turn, but each Heal effect is capped at 20 HP.',
        isCurse: true,
        effects: [
            { kind: 'chakra_income_delta', amount: 1, scope: 'per_turn' },
            { kind: 'heal_cap', maxPerInstance: 20 },
        ],
    },
    {
        id: 'reckless-momentum',
        name: 'Reckless Momentum',
        rarity: 'rare',
        description: 'Melee-class cooldowns are reduced by 1, but your team can no longer gain Invulnerable.',
        isCurse: true,
        effects: [
            { kind: 'cooldown_delta', amount: -1, filter: { classFilter: 'melee' } },
            { kind: 'disable_status_grant', status: 'invulnerable' },
        ],
    },
    {
        id: 'forbidden-shortcut',
        name: 'Forbidden Shortcut',
        rarity: 'rare',
        description: "Skip the current node's fight and keep rewards, but lose 1 Heaven or Earth Scroll.",
        isCurse: true,
        effects: [{ kind: 'skip_node_for_scroll_payment', amount: 1 }],
    },
]);

const ENEMY_TEAMS = Object.freeze([
    { id: 'leaf-rookies-team-7', name: 'Team 7', characterIds: ['uzumaki-naruto', 'uchiha-sasuke', 'haruno-sakura'], tier: 1 },
    { id: 'leaf-rookies-team-8', name: 'Team 8', characterIds: ['inuzuka-kiba', 'hyuuga-hinata', 'aburame-shino'], tier: 1 },
    { id: 'leaf-rookies-team-10', name: 'Team 10', characterIds: ['nara-shikamaru', 'yamanaka-ino', 'akimichi-chouji'], tier: 1 },
    { id: 'rain-genin', name: 'Rain Genin', characterIds: ['oboro', 'shigure', 'mizuki'], tier: 2 },
    { id: 'sound-genin', name: 'Sound Genin', characterIds: ['dosu-kinuta', 'tsuchi-kin', 'zaku-abumi'], tier: 2 },
    { id: 'sand-siblings', name: 'Sand Siblings', characterIds: ['gaara-of-the-desert', 'temari', 'kankuro'], tier: 3 },
    { id: 'exam-infiltrators', name: 'Exam Infiltrators', characterIds: ['yakushi-kabuto', 'akadou-yoroi', 'tsurugi-misumi'], tier: 3 },
    { id: 'sound-four-vanguard', name: 'Sound Four Vanguard', characterIds: ['jiroubou', 'kidoumaru', 'tayuya'], tier: 3 },
    { id: 'sound-four-ambush', name: 'Sound Four Ambush', characterIds: ['sakon-and-ukon', 'kidoumaru', 'tayuya'], tier: 3 },
    { id: 'curse-mark-finalists', name: 'Curse Mark Finalists', characterIds: ['kimimaro', 'cursed-seal-lv1-sasuke', 'shiore-orochimaru'], tier: 3 },
]);

const ACT_ONE_EVENTS = Object.freeze([
    makeEvent('copied-answers', 'Copied Answers', [
        choice('Copy the confident team', 'Gain Reserve Cache and start with a Heaven Scroll.', [
            { kind: 'relic', relicId: 'reserve-cache' },
            { kind: 'scroll', scrollType: 'heaven', amount: 1 },
        ]),
        choice('Watch the examiner', 'Gain 35 Ryo and start with an Earth Scroll.', [
            { kind: 'ryo', amount: 35 },
            { kind: 'scroll', scrollType: 'earth', amount: 1 },
        ]),
    ]),
    makeEvent('quiet-cheat-sheet', 'Quiet Cheat Sheet', [
        choice('Pocket the notes', 'Gain Steady Hands.', [{ kind: 'relic', relicId: 'steady-hands' }]),
        choice('Trade the notes', 'Gain 50 Ryo.', [{ kind: 'ryo', amount: 50 }]),
    ]),
    makeEvent('paper-screen', 'Paper Screen', [
        choice('Hide behind the screen', 'Gain Iron Will.', [{ kind: 'relic', relicId: 'iron-will' }]),
        choice('Take the obvious hint', 'Gain 1 random exam scroll.', [{ kind: 'random_scroll', amount: 1 }]),
    ]),
    makeEvent('sharp-pencil', 'Sharp Pencil', [
        choice('Mark every opening', 'Gain Bleeding Edge.', [{ kind: 'relic', relicId: 'bleeding-edge' }]),
        choice('Keep your head down', 'Heal all teammates for 10 HP.', [{ kind: 'hp', target: 'all', amount: 10 }]),
    ]),
    makeEvent('proctor-glance', 'Proctor Glance', [
        choice('Risk one glance', 'Gain 60-90 Ryo.', [{ kind: 'ryo_range', min: 60, max: 90 }]),
        choice('Stay disciplined', 'Gain Combo Discipline.', [{ kind: 'relic', relicId: 'combo-discipline' }]),
    ]),
    makeEvent('false-question', 'False Question', [
        choice('Challenge it', 'Gain Forest Instincts.', [{ kind: 'relic', relicId: 'forest-instincts' }]),
        choice('Answer anyway', 'Gain 25 Ryo and 1 Scroll Fragment.', [
            { kind: 'ryo', amount: 25 },
            { kind: 'fragment', amount: 1 },
        ]),
    ]),
    makeEvent('ink-smudge', 'Ink Smudge', [
        choice('Fix the answer', 'Gain Scroll Hoarder.', [{ kind: 'relic', relicId: 'scroll-hoarder' }]),
        choice('Turn it in', 'Start with an Earth Scroll.', [{ kind: 'scroll', scrollType: 'earth', amount: 1 }]),
    ]),
    makeEvent('final-question', 'Final Question', [
        choice('Do not quit', 'Gain Clean Getaway.', [{ kind: 'relic', relicId: 'clean-getaway' }]),
        choice('Trust the team', 'Gain Second Wind.', [{ kind: 'relic', relicId: 'second-wind' }]),
    ]),
]);

const ACT_TWO_EVENTS = Object.freeze([
    makeEvent('marked-tree', 'Marked Tree', [
        choice('Follow the marks', 'Gain 40 Ryo.', [{ kind: 'ryo', amount: 40 }]),
        choice('Erase the marks', 'Gain Forest Instincts.', [{ kind: 'relic', relicId: 'forest-instincts' }]),
    ]),
    makeEvent('abandoned-pack', 'Abandoned Pack', [
        choice('Search it', 'Gain 55 Ryo.', [{ kind: 'ryo', amount: 55 }]),
        choice('Leave a decoy', 'Gain Steady Hands.', [{ kind: 'relic', relicId: 'steady-hands' }]),
    ]),
    makeEvent('sound-trap', 'Sound Trap', [
        choice('Disarm it', 'Gain 1 Scroll Fragment.', [{ kind: 'fragment', amount: 1 }]),
        choice('Force through', 'All teammates lose 12 HP, then gain a random relic.', [
            { kind: 'hp', target: 'all', amount: -12 },
            { kind: 'random_relic' },
        ]),
    ]),
    makeEvent('lost-rival', 'Lost Rival', [
        choice('Steal their scroll', 'Lose 18 HP on one teammate and gain the opposite exam scroll.', [
            { kind: 'hp', target: 'one', amount: -18 },
            { kind: 'opposite_scroll', amount: 1 },
        ]),
        choice('Let them pass', 'Gain 35 Ryo.', [{ kind: 'ryo', amount: 35 }]),
    ]),
    makeEvent('muddy-footprints', 'Muddy Footprints', [
        choice('Set an ambush', 'Gain the opposite exam scroll, but all teammates lose 10 HP.', [
            { kind: 'opposite_scroll', amount: 1 },
            { kind: 'hp', target: 'all', amount: -10 },
        ]),
        choice('Avoid the fight', 'Gain 25 Ryo.', [{ kind: 'ryo', amount: 25 }]),
    ]),
    makeEvent('snake-shed', 'Snake Shed', [
        choice('Study the skin', 'Receive a Curse offer.', [{ kind: 'curse_offer', curseId: 'cursed-seal-lesser' }]),
        choice('Burn it', 'Gain Iron Will.', [{ kind: 'relic', relicId: 'iron-will' }]),
    ]),
    makeEvent('river-crossing', 'River Crossing', [
        choice('Build a rope line', 'Heal all teammates for 15 HP.', [{ kind: 'hp', target: 'all', amount: 15 }]),
        choice('Sprint across', 'Gain 50-80 Ryo.', [{ kind: 'ryo_range', min: 50, max: 80 }]),
    ]),
    makeEvent('hidden-cache', 'Hidden Cache', [
        choice('Open it carefully', 'Gain 1 Heaven or Earth Scroll.', [{ kind: 'random_scroll', amount: 1 }]),
        choice('Break it open', 'Gain 70 Ryo and one teammate loses 15 HP.', [
            { kind: 'ryo', amount: 70 },
            { kind: 'hp', target: 'one', amount: -15 },
        ]),
    ]),
    makeEvent('medic-nin', 'Medic Nin', [
        choice('Pay for treatment', 'Lose 35 Ryo and heal all teammates for 25 HP.', [
            { kind: 'ryo', amount: -35 },
            { kind: 'hp', target: 'all', amount: 25 },
        ]),
        choice('Ask for backup', 'Receive a recruit offer.', [{ kind: 'recruit_offer' }]),
    ]),
    makeEvent('examiner-warning', 'Examiner Warning', [
        choice('Take the warning', 'Gain Second Wind.', [{ kind: 'relic', relicId: 'second-wind' }]),
        choice('Ignore it', 'Gain a Curse offer.', [{ kind: 'curse_offer', curseId: 'borrowed-power' }]),
    ]),
    makeEvent('fallen-branch', 'Fallen Branch', [
        choice('Rest briefly', 'Heal one teammate for 30 HP.', [{ kind: 'hp', target: 'one', amount: 30 }]),
        choice('Train while waiting', 'Gain 1 Scroll Fragment.', [{ kind: 'fragment', amount: 1 }]),
    ]),
    makeEvent('tower-in-sight', 'Tower in Sight', [
        choice('Push ahead', 'Gain 45 Ryo.', [{ kind: 'ryo', amount: 45 }]),
        choice('Check supplies', 'Gain Scroll Hoarder.', [{ kind: 'relic', relicId: 'scroll-hoarder' }]),
    ]),
]);

const ACT_THREE_NODES = Object.freeze([
    {
        id: 'act3-preliminary',
        row: 8,
        type: NODE_TYPES.ELITE_BATTLE,
        connectsTo: ['act3-finals'],
        content: {
            enemyTeamId: 'sound-genin',
            aggressionTier: 3,
            scrollDropChance: 0,
            rewardRyo: [90, 120],
            act3Stage: 'preliminary',
        },
    },
    {
        id: 'act3-finals',
        row: 9,
        type: NODE_TYPES.ELITE_BATTLE,
        connectsTo: [],
        content: {
            enemyTeamId: 'curse-mark-finalists',
            aggressionTier: 3,
            scrollDropChance: 0,
            rewardRyo: [140, 180],
            act3Stage: 'finals',
        },
    },
]);

function choice(label, outcomeSummary, effects) {
    return { label, outcomeSummary, effects };
}

function makeEvent(eventId, title, choices) {
    return { eventId, title, choices };
}

function createSeededRng(seed = 'gauntlet') {
    let h = 2166136261;
    const text = String(seed || 'gauntlet');
    for (let i = 0; i < text.length; i += 1) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return () => {
        h += 0x6d2b79f5;
        let t = h;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function pick(rng, values) {
    return values[Math.floor(rng() * values.length)] || values[0];
}

function rangeInt(rng, min, max) {
    return min + Math.floor(rng() * (max - min + 1));
}

function weightedPick(rng, weightedEntries) {
    const total = weightedEntries.reduce((sum, entry) => sum + Math.max(0, Number(entry.weight) || 0), 0);
    let roll = rng() * total;
    for (const entry of weightedEntries) {
        roll -= Math.max(0, Number(entry.weight) || 0);
        if (roll <= 0) return entry.value;
    }
    return weightedEntries[weightedEntries.length - 1]?.value;
}

function getAggressionTierForRow(row) {
    if (row <= 2) return 1;
    if (row <= 5) return 2;
    return 3;
}

function getRewardRangeForNode(type, row) {
    if (type === NODE_TYPES.ELITE_BATTLE) return [70 + row * 5, 95 + row * 8];
    return [25 + row * 5, 45 + row * 6];
}

function getEnemyTeamForNode(rng, type, row) {
    const targetTier = type === NODE_TYPES.ELITE_BATTLE || row >= 6 ? 3 : getAggressionTierForRow(row);
    const pool = ENEMY_TEAMS.filter((team) => team.tier <= targetTier && (type === NODE_TYPES.ELITE_BATTLE ? team.tier >= 2 : true));
    return pick(rng, pool.length ? pool : ENEMY_TEAMS).id;
}

function buildNodeContent({ rng, row, type, startingScrollType }) {
    if (type === NODE_TYPES.BATTLE || type === NODE_TYPES.ELITE_BATTLE) {
        return {
            enemyTeamId: getEnemyTeamForNode(rng, type, row),
            aggressionTier: getAggressionTierForRow(row),
            scrollDropChance: type === NODE_TYPES.ELITE_BATTLE ? 0.75 : 0.25,
            rewardRyo: getRewardRangeForNode(type, row),
        };
    }
    if (type === NODE_TYPES.EVENT) {
        return { eventId: pick(rng, ACT_TWO_EVENTS).eventId };
    }
    if (type === NODE_TYPES.REST_CAMP) {
        return { choices: ['heal_full', 'upgrade_skill'] };
    }
    if (type === NODE_TYPES.MERCHANT) {
        return { inventorySlots: 3, sellsExamScrolls: true, sellsRecruits: true, sellsHeal: true };
    }
    if (type === NODE_TYPES.SCROLL_CACHE) {
        const opposite = startingScrollType === EXAM_SCROLL_TYPES.HEAVEN ? EXAM_SCROLL_TYPES.EARTH : EXAM_SCROLL_TYPES.HEAVEN;
        return { scrollType: rng() < 0.7 ? opposite : pick(rng, [EXAM_SCROLL_TYPES.HEAVEN, EXAM_SCROLL_TYPES.EARTH]) };
    }
    return {};
}

function pickNodeTypeForRow(rng, row, slot, startingScrollType) {
    if (row === 1) return NODE_TYPES.BATTLE;
    if (row === 4) return NODE_TYPES.REST_CAMP;
    if (row === 5) return slot % 2 === 0 ? NODE_TYPES.SCROLL_CACHE : NODE_TYPES.ELITE_BATTLE;
    if (row === 7) return NODE_TYPES.ELITE_BATTLE;
    if (row === 2) {
        return weightedPick(rng, [
            { value: NODE_TYPES.BATTLE, weight: 55 },
            { value: NODE_TYPES.EVENT, weight: 25 },
            { value: NODE_TYPES.MERCHANT, weight: 20 },
        ]);
    }
    if (row === 3) {
        return weightedPick(rng, [
            { value: NODE_TYPES.BATTLE, weight: 45 },
            { value: NODE_TYPES.EVENT, weight: 25 },
            { value: NODE_TYPES.MERCHANT, weight: 15 },
            { value: NODE_TYPES.ELITE_BATTLE, weight: 15 },
        ]);
    }
    if (row === 6) {
        return weightedPick(rng, [
            { value: NODE_TYPES.BATTLE, weight: 40 },
            { value: NODE_TYPES.ELITE_BATTLE, weight: 40 },
            { value: NODE_TYPES.REST_CAMP, weight: 20 },
        ]);
    }
    return weightedPick(rng, [
        { value: NODE_TYPES.BATTLE, weight: 35 },
        { value: NODE_TYPES.ELITE_BATTLE, weight: 25 },
        { value: NODE_TYPES.EVENT, weight: 20 },
        { value: NODE_TYPES.REST_CAMP, weight: 10 },
        { value: NODE_TYPES.SCROLL_CACHE, weight: 10 },
    ]);
}

function connectRows(rng, rows) {
    for (let rowIndex = 0; rowIndex < rows.length - 1; rowIndex += 1) {
        const current = rows[rowIndex];
        const next = rows[rowIndex + 1];
        current.forEach((node, index) => {
            const primaryIndex = Math.min(next.length - 1, Math.floor((index / Math.max(1, current.length)) * next.length));
            const connectsTo = new Set([next[primaryIndex].id]);
            if (next.length > 1 && rng() < 0.65) {
                const offset = rng() < 0.5 ? -1 : 1;
                const secondaryIndex = Math.max(0, Math.min(next.length - 1, primaryIndex + offset));
                connectsTo.add(next[secondaryIndex].id);
            }
            node.connectsTo = Array.from(connectsTo);
        });

        next.forEach((nextNode, nextIndex) => {
            const hasParent = current.some((node) => node.connectsTo.includes(nextNode.id));
            if (!hasParent) {
                const parent = current[Math.min(current.length - 1, nextIndex)];
                if (parent && parent.connectsTo.length < 2) {
                    parent.connectsTo.push(nextNode.id);
                }
            }
        });
    }
}

function annotateScrollCacheLocks(rows) {
    const byId = new Map(rows.flat().map((node) => [node.id, node]));
    rows.flat().forEach((parent) => {
        const childIds = Array.isArray(parent.connectsTo) ? parent.connectsTo : [];
        childIds.forEach((childId) => {
            const child = byId.get(childId);
            if (child?.type !== NODE_TYPES.SCROLL_CACHE) return;
            child.locksSiblings = Array.from(new Set([...(child.locksSiblings || []), ...childIds.filter((id) => id !== childId)]));
        });
    });
}

function generateAct2Map(options = {}) {
    const seed = String(options.seed || `gauntlet-${Date.now()}`);
    const rng = createSeededRng(seed);
    const startingScrollType =
        options.startingScrollType === EXAM_SCROLL_TYPES.EARTH ? EXAM_SCROLL_TYPES.EARTH : EXAM_SCROLL_TYPES.HEAVEN;
    const rows = [];

    for (let row = 1; row <= DEFAULT_ROWS; row += 1) {
        const nodeCount = row === 1 ? 1 : row === DEFAULT_ROWS ? rangeInt(rng, 2, 3) : rangeInt(rng, 2, 4);
        const nodes = [];
        for (let slot = 0; slot < nodeCount; slot += 1) {
            const type = pickNodeTypeForRow(rng, row, slot, startingScrollType);
            nodes.push({
                id: `r${row}n${slot + 1}`,
                row,
                type,
                connectsTo: [],
                content: buildNodeContent({ rng, row, type, startingScrollType }),
            });
        }
        rows.push(nodes);
    }

    connectRows(rng, rows);
    annotateScrollCacheLocks(rows);

    return {
        seed,
        act: 2,
        rows,
        nodes: rows.flat(),
    };
}

function hasBothExamScrolls(runState = {}) {
    return Math.max(0, Number(runState.heavenScrolls) || 0) > 0 && Math.max(0, Number(runState.earthScrolls) || 0) > 0;
}

function canEnterNode(runState = {}, mapNode = {}) {
    if (!mapNode || typeof mapNode !== 'object') return false;
    if (mapNode.row > DEFAULT_ROWS) return true;
    if (mapNode.row === DEFAULT_ROWS || mapNode.type === NODE_TYPES.ELITE_BATTLE && mapNode.row === DEFAULT_ROWS) {
        return hasBothExamScrolls(runState);
    }
    return true;
}

function createInitialRunState(options = {}) {
    const seed = String(options.seed || `gauntlet-${Date.now()}`);
    const startingScrollType =
        options.startingScrollType === EXAM_SCROLL_TYPES.EARTH ? EXAM_SCROLL_TYPES.EARTH : EXAM_SCROLL_TYPES.HEAVEN;
    const team = Array.isArray(options.team) ? options.team.slice(0, 3) : [];
    const map =
        options.map && typeof options.map === 'object'
            ? options.map
            : generateAct2Map({ seed, startingScrollType });
    return {
        seed,
        status: 'active',
        startingScrollType,
        team,
        teamHp: team.map(() => 100),
        actOneStep: 0,
        actThreeStep: '',
        benchAvailable: false,
        heavenScrolls: startingScrollType === EXAM_SCROLL_TYPES.HEAVEN ? 1 : 0,
        earthScrolls: startingScrollType === EXAM_SCROLL_TYPES.EARTH ? 1 : 0,
        ryo: 0,
        scrollFragments: 0,
        relics: [],
        currentAct: 1,
        currentNodeId: null,
        visitedNodeIds: [],
        lockedNodeIds: [],
        pendingBattle: null,
        map,
        startedAt: new Date(),
        endedAt: null,
    };
}

function findAllPaths(map) {
    const nodes = Array.isArray(map?.nodes) ? map.nodes : [];
    const byId = new Map(nodes.map((node) => [node.id, node]));
    const starts = nodes.filter((node) => node.row === 1);
    const paths = [];
    const walk = (node, path) => {
        const nextPath = [...path, node];
        if (!Array.isArray(node.connectsTo) || node.connectsTo.length === 0) {
            paths.push(nextPath);
            return;
        }
        node.connectsTo.forEach((id) => {
            const next = byId.get(id);
            if (next) walk(next, nextPath);
        });
    };
    starts.forEach((node) => walk(node, []));
    return paths;
}

function pathHasRestAndScrollSource(path) {
    const hasRest = path.some((node) => node.type === NODE_TYPES.REST_CAMP);
    const scrollSources = path.filter((node) => node.type === NODE_TYPES.SCROLL_CACHE || node.type === NODE_TYPES.ELITE_BATTLE);
    return hasRest && scrollSources.length >= 2;
}

function getNodeById(map, nodeId) {
    const normalizedNodeId = typeof nodeId === 'string' ? nodeId.trim() : '';
    if (!normalizedNodeId) return null;
    const actThreeNode = ACT_THREE_NODES.find((node) => node.id === normalizedNodeId);
    if (actThreeNode) return actThreeNode;
    return (Array.isArray(map?.nodes) ? map.nodes : []).find((node) => node?.id === normalizedNodeId) || null;
}

function getEnemyTeamById(enemyTeamId) {
    const normalizedEnemyTeamId = typeof enemyTeamId === 'string' ? enemyTeamId.trim() : '';
    return ENEMY_TEAMS.find((team) => team.id === normalizedEnemyTeamId) || null;
}

function getEventById(eventId) {
    const normalizedEventId = typeof eventId === 'string' ? eventId.trim() : '';
    return [...ACT_ONE_EVENTS, ...ACT_TWO_EVENTS].find((event) => event.eventId === normalizedEventId) || null;
}

function getRelicById(relicId) {
    const normalizedRelicId = typeof relicId === 'string' ? relicId.trim() : '';
    return RELIC_SCROLLS.find((relic) => relic.id === normalizedRelicId) || null;
}

function getCurseById(curseId) {
    const normalizedCurseId = typeof curseId === 'string' ? curseId.trim() : '';
    return CURSES.find((curse) => curse.id === normalizedCurseId) || null;
}

function getReachableNodeIds(runState = {}) {
    if (Number(runState.currentAct) === 1) {
        return [];
    }
    if (Number(runState.currentAct) === 3) {
        const visited = new Set(Array.isArray(runState.visitedNodeIds) ? runState.visitedNodeIds : []);
        if (!visited.has('act3-preliminary')) return ['act3-preliminary'];
        if (!visited.has('act3-finals')) return ['act3-finals'];
        return [];
    }
    const map = runState.map;
    const nodes = Array.isArray(map?.nodes) ? map.nodes : [];
    const visited = new Set(Array.isArray(runState.visitedNodeIds) ? runState.visitedNodeIds : []);
    const locked = new Set(Array.isArray(runState.lockedNodeIds) ? runState.lockedNodeIds : []);
    if (!runState.currentNodeId) {
        return nodes
            .filter((node) => node.row === 1)
            .map((node) => node.id)
            .filter((id) => !visited.has(id) && !locked.has(id));
    }
    const current = getNodeById(map, runState.currentNodeId);
    return (Array.isArray(current?.connectsTo) ? current.connectsTo : []).filter(
        (id) => !visited.has(id) && !locked.has(id)
    );
}

module.exports = {
    ACT_ONE_EVENTS,
    ACT_THREE_NODES,
    ACT_TWO_EVENTS,
    CURSES,
    DEFAULT_ROWS,
    ENEMY_TEAMS,
    EXAM_SCROLL_TYPES,
    NODE_TYPES,
    RELIC_SCROLLS,
    canEnterNode,
    createInitialRunState,
    createSeededRng,
    findAllPaths,
    generateAct2Map,
    getEnemyTeamById,
    getCurseById,
    getEventById,
    getNodeById,
    getReachableNodeIds,
    getRelicById,
    hasBothExamScrolls,
    pathHasRestAndScrollSource,
};
