// Seeded stress test: random augment loadouts on random teams play real turns (both sides
// use legal skills) through battleLogic with the Tower hooks. Every combination must resolve
// without throwing and leave the board in a sane state.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const characters = require('../data/characters');
const battleLogic = require('../battleLogic');
const effects = require('../services/tower/towerAugmentEffects');
const towerScrolls = require('../services/tower/towerScrolls');
const { ACTIVE_ROSTER_IDS } = require('../data/activeRoster');
const { applyTowerSetupToBoard } = require('../server.js');

const rng = (seed) => () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
};
const pickN = (items, count, random) => items.slice().sort(() => random() - 0.5).slice(0, count);
const pool = () => ({ taijutsu: 20, ninjutsu: 20, bloodline: 20, genjutsu: 20 });
const roster = ACTIVE_ROSTER_IDS.filter((id) => characters.some((c) => c.characterId === id && c.skills?.length));
const index = (id) => characters.findIndex((character) => character.characterId === id);

// The first legal skill (with a legal target) for each living unit.
const playTurn = (match, username, random) => {
    const queueOrder = [];
    const queuedByActorSlot = {};
    match.board[username].forEach((unit, slot) => {
        if (!unit || unit.alive === false || battleLogic.isActorUnableToUseSkills(unit.state)) return;
        const skills = characters[unit.rosterIndex].skills;
        const order = pickN(skills.map((_, skillIndex) => skillIndex), skills.length, random);
        for (const skillIndex of order) {
            const skill = battleLogic.resolveEffectiveSkill({ characters, rosterIndex: unit.rosterIndex, skillIndex, actorState: unit.state });
            if (!skill || skill.hiddenFromSelectionViewer || battleLogic.isSkillIndexBlockedForActor(unit.state, skillIndex)) continue;
            if (battleLogic.getSkillCooldownRemaining(unit.state, skill.id) > 0) continue;
            if (!battleLogic.doesActorSatisfySkillCondition(unit, unit.state, skill)) continue;
            const options = battleLogic.computeTargetOptions({ match, actingUsername: username, actorSlot: slot, skillIndex, characters });
            if (!options?.targets?.length) continue;
            const targetSelection = options.mode === 'single' || options.mode === 'self' ? [options.targets[Math.floor(random() * options.targets.length)]] : options.targets;
            queueOrder.push(slot);
            queuedByActorSlot[slot] = { skillIndex, targetSelection };
            break;
        }
    });
    match.pendingTurns[username] = { queueOrder, queuedByActorSlot };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: username, characters });
    battleLogic.tickStatusesForTurnEnd({ match, endingUsername: username });
    battleLogic.tickCooldownsForTurnEnd({ match, endingUsername: username });
    effects.onTurnEnd(match, username);
    match.economy.turnCounts[username] += 1;
    match.currentTurn = username === 'p' ? 'bot' : 'p';
    effects.onTurnStart(match, match.currentTurn);
};

test('40 seeded battles with random augment loadouts resolve cleanly', () => {
    const teamKeys = towerScrolls.STANDARD_OFFERED_SCROLL_KEYS.filter((key) => towerScrolls.parseScrollKey(key).scroll.scope === 'team');
    const fusionKeys = towerScrolls.SCROLL_DEFINITIONS.filter((scroll) => scroll.catalog === 'fusion').map((scroll) => scroll.id);
    const characterKeys = towerScrolls.SCROLL_DEFINITIONS.filter((scroll) => scroll.catalog === 'character');
    let damageDealt = 0;
    let deaths = 0;
    for (let seed = 1; seed <= 40; seed += 1) {
        const random = rng(seed);
        // Lean on characters that have character augments half the time.
        const featured = characterKeys.map((scroll) => scroll.eligibleCharacterIds[0]).filter((id) => roster.includes(id));
        const allies = pickN(seed % 2 ? [...new Set(featured)] : roster, 3, random);
        const enemies = pickN(roster, 3, random);
        const loadout = [...pickN(teamKeys, 10, random), ...pickN(fusionKeys, 3, random)];
        const players = [{ username: 'p', team: allies.map(index) }, { username: 'bot', team: enemies.map(index) }];
        const board = battleLogic.buildInitialBoard(players, characters);
        const setup = {
            team: allies.map((characterId) => ({
                characterId, hp: 100, maxHp: 100,
                scrolls: [...loadout, ...characterKeys.filter((scroll) => scroll.eligibleCharacterIds.includes(characterId)).map((scroll) => scroll.id)],
            })),
            encounter: { kind: 'battle', hpMultiplier: 1.5, affixes: [] },
        };
        applyTowerSetupToBoard({ board, username: 'p', botUsername: 'bot', setup });
        const match = { matchId: `stress-${seed}`, mode: 'tower', players, board, currentTurn: 'p', towerEncounter: {},
            chakraPools: { p: pool(), bot: pool() }, economy: { turnCounts: { p: 0, bot: 0 } }, pendingTurns: {} };
        Object.entries(board).forEach(([username, units]) => units.forEach((unit) => { unit.username = username; }));
        effects.initBattle(match, { username: 'p', botUsername: 'bot', setup, characters });
        for (let turn = 0; turn < 8; turn += 1) {
            if (board.p.every((unit) => unit.alive === false) || board.bot.every((unit) => unit.alive === false)) break;
            assert.doesNotThrow(() => playTurn(match, match.currentTurn, random), `seed ${seed} turn ${turn}`);
        }
        [...board.p, ...board.bot].forEach((unit) => {
            assert.ok(Number.isFinite(unit.hp) && unit.hp >= 0 && unit.hp <= unit.hpCap, `seed ${seed}: health stays within 0..max`);
        });
        Object.values(match.chakraPools.p).forEach((amount) => assert.ok(amount >= 0, `seed ${seed}: no negative chakra`));
        assert.doesNotThrow(() => JSON.stringify(match.towerEncounter), 'augment state stays serializable');
        damageDealt += board.bot.reduce((sum, unit) => sum + unit.hpCap - unit.hp, 0);
        deaths += [...board.p, ...board.bot].filter((unit) => unit.alive === false).length;
    }
    assert.ok(damageDealt > 40 * 100, `real fights happened (${damageDealt} damage dealt)`);
    assert.ok(deaths > 0, 'and some ended in deaths');
});
