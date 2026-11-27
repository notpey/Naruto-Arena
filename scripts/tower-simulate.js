// Seeded Standard-mode route and economy simulation:
//   node scripts/tower-simulate.js [seeds=50]
// Every battle is treated as won with a fixed health loss, so this measures the map, the
// reward economy and pacing (node mix, offer tiers, ryō, slot pressure, boss variety). It
// does NOT simulate combat: turn counts, damage and boss win rates need real matches.
const characters = require('../data/characters');
const towerRun = require('../services/tower/towerRun');
const { standardTierOf } = require('../services/tower/towerScrolls');

const seeds = Math.max(1, Number(process.argv[2]) || 50);
const rosterIds = characters.filter((c) => Array.isArray(c.skills) && c.skills.length).map((c) => c.characterId);
const skillsOf = (id) => characters.find((c) => c.characterId === id)?.skills || [];
const nameOf = (id) => characters.find((c) => c.characterId === id)?.name || id;
const BAND = (floor) => (floor <= 40 ? '1-40' : floor <= 120 ? '41-120' : '121-200');

const totals = { nodes: {}, offerTiers: {}, bossLeaders: {}, fullSlotsAtFloor: [], ryoAt: { 50: [], 100: [], 150: [], 200: [] } };
for (let seed = 1; seed <= seeds; seed += 1) {
    const run = towerRun.createRun({ username: 'sim', rosterIds, seed, runId: `sim-${seed}`, mode: 'standard' });
    towerRun.chooseDraft(run, [0, 0, 0]);
    towerRun.chooseReward(run, 0, 0);
    let fullAt = null;
    for (let guard = 0; guard < 5000 && towerRun.ACTIVE_STATUSES.has(run.status); guard += 1) {
        if (run.status === 'map') {
            const open = towerRun.getAvailableNodeIds(run);
            const pick = open[(seed + run.floor) % open.length];
            towerRun.chooseNode(run, pick, rosterIds, { nameOf, skillsOf });
            const node = towerRun.findNode(run, run.currentNodeId);
            totals.nodes[node.type] = (totals.nodes[node.type] || 0) + 1;
        } else if (run.status === 'battle') {
            const { encounter } = run.battle;
            if (encounter.kind === 'boss') {
                const leader = encounter.bossDef ? nameOf(encounter.bossDef.enemyIds[0]) : encounter.bossId;
                totals.bossLeaders[leader] = (totals.bossLeaders[leader] || 0) + 1;
            }
            towerRun.recordBattleResult(run, { won: true, units: run.team.map((m) => ({ hp: Math.max(1, m.hp - 35), alive: true })) });
        } else if (run.status === 'reward') {
            const band = BAND(run.floor || 1);
            run.pending.offers.forEach((key) => {
                const tier = standardTierOf(key);
                totals.offerTiers[band] = totals.offerTiers[band] || {};
                totals.offerTiers[band][tier] = (totals.offerTiers[band][tier] || 0) + 1;
            });
            const key = run.pending.offers[0];
            const capacity = key ? towerRun.capacityFor(run, 'team') : null;
            if (capacity?.full && fullAt === null) fullAt = run.floor;
            try {
                towerRun.chooseReward(run, 0, 0, { replaceKey: capacity?.full ? run.teamScrolls[0] : null });
            } catch (error) {
                towerRun.skipReward(run);
            }
        } else if (run.status === 'event') {
            const view = towerRun.serializeRun(run, (id) => ({ characterId: id, name: id }), { rosterIds });
            const option = view.event.options.find((o) => !o.blocked && !o.needsSlot) || view.event.options.find((o) => !o.blocked);
            towerRun.resolveEvent(run, option.id, 0, rosterIds, { nameOf });
        } else if (run.status === 'ramen') towerRun.applyRamen(run, 'feast');
        else towerRun.leaveNode(run);
        Object.keys(totals.ryoAt).forEach((floor) => {
            if (run.floor === Number(floor) && totals.ryoAt[floor].length < seed) totals.ryoAt[floor].push(run.ryo);
        });
    }
    totals.fullSlotsAtFloor.push(fullAt);
}

const mean = (values) => (values.length ? Math.round(values.reduce((s, v) => s + v, 0) / values.length) : null);
const percent = (counts) => {
    const all = Object.values(counts).reduce((s, v) => s + v, 0);
    return Object.fromEntries(Object.entries(counts).map(([key, value]) => [key, `${Math.round((value / all) * 1000) / 10}%`]));
};
console.log(`Standard simulation over ${seeds} seeds (combat not simulated; every battle won).`);
console.log('Node mix:', percent(totals.nodes));
Object.entries(totals.offerTiers).forEach(([band, counts]) => console.log(`Offer tiers, floors ${band}:`, percent(counts)));
console.log('Team slots first full at floor (mean):', mean(totals.fullSlotsAtFloor.filter((v) => v !== null)));
console.log('Run ryō on hand at floors 50/100/150/200 (mean):', Object.values(totals.ryoAt).map(mean).join(' / '));
console.log('Distinct featured bosses seen:', Object.keys(totals.bossLeaders).length);
