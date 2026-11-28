// Character Editor test bench: plays a short scripted match with the real battle engine, using
// the character as it stands in the editor (unsaved edits included), on a throwaway board.
// Nothing is saved and no live match is touched. Every run replays the whole script from the
// start with the same random seed, so the same steps always give the same result.
//
// runTestBench({ roster, character, allies, enemies, steps }) ->
//   { ok, teams, frames: [{ step, note, turn, units, chakra }], error? }
// steps: { do: 'cast', side, slot, skillId, target?: { side, slot } }
//        { do: 'endTurn' }                         (ends the current side's turn)
//        { do: 'setHealth', side, slot, hp }       (set up a situation, e.g. low health)
const battle = require('../battleLogic');
const RulesVocab = require('../character-rules-vocab');
const { previewSkills } = require('../skill-visibility');

const MAX_STEPS = 120;
const SIDES = ['p1', 'p2'];
const pool = () => ({ taijutsu: 9, ninjutsu: 9, bloodline: 9, genjutsu: 9 });
const seeded = (seed) => () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
};
const humanize = (value) => String(value || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase()).trim();

// Every rules list in a value (statuses, passives), for naming counters.
const rulesIn = (value, out = []) => {
    if (!value || typeof value !== 'object') return out;
    if (Array.isArray(value)) { value.forEach((entry) => rulesIn(entry, out)); return out; }
    Object.entries(value).forEach(([key, entry]) => {
        if (key === 'rules' && Array.isArray(entry)) out.push(...entry);
        rulesIn(entry, out);
    });
    return out;
};

const runTestBench = ({ roster, character, allies = [], enemies = [], steps = [] }) => {
    if (!Array.isArray(roster) || !character?.characterId) return { ok: false, error: 'There is no character to test.' };
    // The edited character replaces its saved version (or joins, if it is new).
    const benchRoster = roster.some((entry) => entry?.characterId === character.characterId)
        ? roster.map((entry) => (entry?.characterId === character.characterId ? character : entry))
        : [...roster, character];
    const indexOf = (id) => benchRoster.findIndex((entry) => entry?.characterId === id);
    const teams = { p1: allies.slice(0, 3), p2: enemies.slice(0, 3) };
    const missing = [...teams.p1, ...teams.p2].filter((id) => indexOf(id) < 0);
    if (missing.length) return { ok: false, error: `Unknown character: ${missing.join(', ')}.` };
    if (teams.p1.length !== 3 || teams.p2.length !== 3) return { ok: false, error: 'Each side needs three characters.' };
    if (!Array.isArray(steps) || steps.length > MAX_STEPS) return { ok: false, error: `A test can have at most ${MAX_STEPS} steps.` };

    const counterNames = new Set(RulesVocab.counterNamesIn(rulesIn(benchRoster.filter((entry) =>
        [...teams.p1, ...teams.p2].includes(entry.characterId)))));
    const realRandom = Math.random;
    Math.random = seeded(7);
    const frames = [];
    try {
        const players = SIDES.map((side) => ({ username: side, team: teams[side].map(indexOf) }));
        const match = { matchId: 'test-bench', mode: 'training', players, board: battle.buildInitialBoard(players, benchRoster),
            chakraPools: { p1: pool(), p2: pool() }, economy: { turnCounts: { p1: 0, p2: 0 } }, pendingTurns: {} };
        Object.entries(match.board).forEach(([side, units]) => units.forEach((unit) => { unit.username = side; }));
        let turn = 'p1';
        const characterAt = (side, slot) => benchRoster[match.board[side]?.[slot]?.rosterIndex];
        const unitName = (side, slot) => characterAt(side, slot)?.name || `${side} ${slot + 1}`;
        // Status names without the character prefix: "gekko_hayate_crescent_moon" reads "Crescent Moon".
        const prefixes = [...teams.p1, ...teams.p2].map((id) => `${id.replace(/-/g, '_')}_`);
        const statusName = (id) => humanize(prefixes.reduce((name, prefix) => (name.startsWith(prefix) ? name.slice(prefix.length) : name), String(id || '')));

        const frame = (step, note = '') => frames.push({
            step, note, turn,
            chakra: { p1: { ...match.chakraPools.p1 }, p2: { ...match.chakraPools.p2 } },
            units: SIDES.flatMap((side) => match.board[side].map((unit, slot) => {
                const owner = characterAt(side, slot);
                return {
                    side, slot, name: owner?.name || '', characterId: owner?.characterId || '',
                    hp: Math.max(0, Number(unit.hp) || 0), alive: unit.alive !== false,
                    cooldowns: Object.entries(unit.state?.cooldowns || {}).filter(([, turns]) => turns > 0)
                        .map(([skillId, turns]) => ({ skill: owner?.skills?.find((skill) => skill.id === skillId)?.name || skillId, turns })),
                    statuses: unit.alive === false ? [] : (unit.state?.statuses || [])
                        .filter((status) => (Number(status.remainingTurns) || 0) > 0)
                        .map((status) => {
                            const metadata = status.metadata || {};
                            const counters = {};
                            [...counterNames, metadata.stackMetadataKey].filter(Boolean).forEach((key) => {
                                if (Number.isFinite(Number(metadata[key])) && metadata[key] !== undefined) counters[RulesVocab.counterLabel(key)] = Number(metadata[key]);
                            });
                            return {
                                id: status.id,
                                name: metadata.passive ? metadata.sourceSkillName || statusName(status.id) : statusName(status.id),
                                turns: status.remainingTurns >= 99 ? 'permanent' : status.remainingTurns,
                                text: metadata.tooltipText || '',
                                counters,
                                hidden: Boolean(metadata.invisible || metadata.hideTooltip),
                            };
                        }),
                };
            })),
        });

        frame('The match starts');
        steps.forEach((step) => {
            if (step?.do === 'endTurn') {
                const ended = turn;
                battle.tickStatusesForTurnEnd({ match, endingUsername: ended });
                battle.tickCooldownsForTurnEnd({ match, endingUsername: ended });
                match.economy.turnCounts[ended] += 1;
                turn = ended === 'p1' ? 'p2' : 'p1';
                frame(`${ended === 'p1' ? 'Your team ends its turn' : 'The opponents end their turn'}`);
                return;
            }
            if (step?.do === 'setHealth') {
                const unit = match.board[step.side]?.[step.slot];
                if (!unit) return frame('Set health', 'There is no character there.');
                unit.hp = Math.max(1, Math.min(100, Math.round(Number(step.hp) || 1)));
                return frame(`${unitName(step.side, step.slot)} is set to ${unit.hp} health`);
            }
            if (step?.do !== 'cast') return frame('Unknown step', 'Skipped.');
            const { side, slot } = step;
            const unit = match.board[side]?.[slot];
            const owner = characterAt(side, slot);
            const skillIndex = owner ? owner.skills.findIndex((skill) => skill.id === step.skillId) : -1;
            const skill = owner?.skills?.[skillIndex];
            const label = `${unitName(side, slot)} uses ${skill?.name || 'a skill'}`;
            if (!unit || !skill) return frame(label, 'That skill was not found.');
            if (unit.alive === false) return frame(label, `${unitName(side, slot)} has been defeated.`);
            if (side !== turn) return frame(label, `It's ${turn === 'p1' ? "your team's" : "the opponents'"} turn. End the turn to play the other side.`);
            const state = battle.getUnitState(match, side, slot);
            if (battle.isActorUnableToUseSkills(state)) return frame(label, `${unitName(side, slot)} is stunned and can't act.`);
            const options = battle.computeTargetOptions({ match, actingUsername: side, actorSlot: slot, skillIndex, characters: benchRoster });
            if (!options.targets.length) return frame(label, 'This skill has no one it can target right now.');
            let selection;
            if (options.mode === 'all') selection = options.targets.map(({ username, slot: s }) => ({ username, slot: s }));
            else if (options.mode === 'self') selection = [{ username: side, slot }];
            else {
                const wanted = step.target && options.targets.find((t) => t.username === step.target.side && t.slot === step.target.slot);
                if (!wanted) return frame(label, `It can't target ${step.target ? unitName(step.target.side, step.target.slot) : 'nobody'}. Allowed: ${options.targets.map((t) => unitName(t.username, t.slot)).join(', ')}.`);
                selection = [{ username: wanted.username, slot: wanted.slot }];
            }
            const cooldownBefore = Number(state.cooldowns?.[skill.id]) || 0;
            if (cooldownBefore > 0) return frame(label, `${skill.name} is on cooldown for ${cooldownBefore} more turn${cooldownBefore === 1 ? '' : 's'}.`);
            match.pendingTurns[side] = { queueOrder: [slot], queuedByActorSlot: { [slot]: { skillIndex, targetSelection: selection } } };
            battle.resolvePendingTurnSkills({ match, actingUsername: side, characters: benchRoster });
            const target = selection.length === 1 && options.mode !== 'self' ? ` on ${unitName(selection[0].username, selection[0].slot)}` : '';
            return frame(`${label}${target}`);
        });
        return {
            ok: true,
            teams: Object.fromEntries(SIDES.map((side) => [side, teams[side].map((id) => {
                const entry = benchRoster[indexOf(id)];
                // The skills a player picks from (alternate forms are reached through their base skill).
                return { characterId: id, name: entry.name, skills: previewSkills(entry.skills)
                    .filter((skill) => !skill.hiddenFromSelectionViewer)
                    .map((skill) => ({ id: skill.id, name: skill.name, target: skill.target, cooldown: skill.cooldown })) };
            })])),
            frames,
        };
    } catch (error) {
        return { ok: false, error: `The engine stopped on this setup: ${error.message}`, frames };
    } finally {
        Math.random = realRandom;
    }
};

module.exports = { runTestBench, MAX_STEPS };
