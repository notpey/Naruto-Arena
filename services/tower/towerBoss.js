// Scripted Tower bosses.
//
// A boss telegraphs one signature technique a turn ahead ("intent"). On its next turn it
// queues exactly that technique through the same queue a player uses, so the engine
// resolves it under the normal rules. The player can answer the telegraph: stun the
// caster to interrupt it, or protect the named target. Every unit the script does not
// move is played by the regular battle bot.
//
// Shared boss rules (stated to the player before each fight):
//  - telegraphed techniques are always fuelled: the boss is granted the chakra they cost;
//  - each boss has one trigger, fired the first time a watched unit drops to half health;
//  - a boss may enrage when a named unit falls.
//
// Bosses:
//  - Act I, floor 10: the Demon of the Hidden Mist (Zabuza, Haku and the Demon Brothers).
//  - Act II, floor 15: the Grass Ninja (Orochimaru in disguise), who brands one ninja with
//    the Cursed Seal of Heaven for the rest of the run.
//  - Act II, floor 20: Gaara of the Desert in the final bout of the Chūnin Exam, a duel.

const isAlive = (unit) => Boolean(unit) && unit.alive !== false && Number(unit.hp) > 0;

// ---------------------------------------------------------------- Act I: the Demon of the Mist
const BOSS_ID = 'demon-of-the-mist';

const SKILLS = {
    sword: 'momochi-zabuza-kubikiribocho',
    prison: 'momochi-zabuza-water-prison-technique',
    mist: 'momochi-zabuza-hidden-mist-technique',
    mirrors: 'haku-demonic-mirroring-ice-crystals',
};

const ENRAGE_STATUS = {
    statusId: 'tower_boss_demon_unleashed',
    duration: 99,
    metadata: {
        helpful: true, permanent: true, cannotBeCleansed: true, fromPassive: true,
        sourceSkillName: 'Demon Unleashed',
        statusIcon: 'assets/tower/boss-enrage.svg',
        tooltipText: 'Haku has fallen. Zabuza deals 10 additional damage and has 5 damage reduction.',
        damageBonusFlat: 10,
        damageReductionFlat: 5,
    },
};

// ---------------------------------------------------------------- Act II: Orochimaru and Gaara
const OROCHIMARU_SKILLS = {
    seal: 'shiore-orochimaru-five-elements-seal',
    devour: 'shiore-orochimaru-devour',
    bite: 'shiore-orochimaru-cursed-seal-bite',
};

const GAARA_SKILLS = {
    coffin: 'gaara-of-the-desert-sand-binding-coffin',
    funeral: 'gaara-of-the-desert-desert-funeral',
    sphere: 'gaara-of-the-desert-sand-sphere',
};

const SHUKAKU_STATUS = {
    statusId: 'tower_boss_shukaku_stirs',
    duration: 99,
    metadata: {
        helpful: true, permanent: true, cannotBeCleansed: true, fromPassive: true,
        sourceSkillName: 'Shukaku Stirs',
        statusIcon: 'assets/tower/boss-shukaku.svg',
        tooltipText: 'The One-Tail stirs inside Gaara. He deals 10 additional damage.',
        damageBonusFlat: 10,
    },
};

// rotation: one step telegraphed per boss turn; fallback replaces a step on cooldown.
// trigger: fired once, the first time trigger.watchSlot drops to half health.
//   marksCursedSeal: the trigger's target receives the Cursed Seal of Heaven after a win.
// enrage: when enrage.whenDeadSlot falls, enrage.targetSlot gains enrage.status.
// phaseLabels: what the battle screen calls each phase.
const BOSSES = {
    [BOSS_ID]: {
        bossId: BOSS_ID,
        act: 1,
        name: 'Demon of the Hidden Mist',
        title: 'Act I Boss — The Great Naruto Bridge',
        enemyIds: ['momochi-zabuza', 'haku', 'demon-brothers'],
        hpCaps: [220, 160, 130],
        intro: 'Zabuza waits on the unfinished bridge, his tools at his side.',
        mechanics: [
            'Zabuza announces his next technique a turn ahead. Telegraphed techniques are always paid for.',
            'Stun the caster before its turn to interrupt the telegraphed technique.',
            'When Haku first falls to half health, Haku raises the Demonic Mirroring Ice Crystals.',
            'If Haku falls, Zabuza is enraged: +10 damage and 5 damage reduction.',
        ],
        rotation: [
            { actorSlot: 0, skillId: SKILLS.mist, rule: 'self' },
            { actorSlot: 0, skillId: SKILLS.prison, rule: 'highest-hp' },
            { actorSlot: 0, skillId: SKILLS.sword, rule: 'lowest-hp' },
            { actorSlot: 0, skillId: SKILLS.sword, rule: 'lowest-hp' },
        ],
        fallback: { actorSlot: 0, skillId: SKILLS.sword, rule: 'lowest-hp' },
        trigger: {
            watchSlot: 1, actorSlot: 1, skillId: SKILLS.mirrors, rule: 'self', phase: 2,
            flag: 'mirrorsTriggered', event: 'Haku raises the Demonic Mirroring Ice Crystals!',
        },
        enrage: {
            whenDeadSlot: 1, targetSlot: 0, status: ENRAGE_STATUS, phase: 3,
            event: 'Haku has fallen. The Demon is unleashed: Zabuza gains 10 damage and 5 damage reduction.',
        },
        phaseLabels: { 2: 'Mirrors raised', 3: 'Enraged' },
        victoryText: 'Defeated the Demon of the Hidden Mist. The Land of Waves is free.',
    },
    'grass-ninja': {
        bossId: 'grass-ninja',
        act: 2,
        name: 'The Grass Ninja',
        title: 'Act II — The Forest of Death',
        enemyIds: ['shiore-orochimaru', null, null],
        hpCaps: [300],
        intro: 'A Grass genin blocks the path. Her face peels away like wet paper: Orochimaru has come for a vessel.',
        mechanics: [
            'Orochimaru fights alone, announcing his next technique a turn ahead. It is always paid for.',
            'Stun him before his turn to interrupt the telegraphed technique.',
            'When he first falls to half health, he lunges for your healthiest ninja with Cursed Seal Bite.',
            'If the bite lands, that ninja keeps the Cursed Seal of Heaven for the rest of the run: +15 damage, but 5 health lost every turn.',
        ],
        rotation: [
            { actorSlot: 0, skillId: OROCHIMARU_SKILLS.seal, rule: 'highest-hp' },
            { actorSlot: 0, skillId: OROCHIMARU_SKILLS.devour, rule: 'highest-hp' },
            { actorSlot: 0, skillId: OROCHIMARU_SKILLS.bite, rule: 'lowest-hp' },
        ],
        fallback: { actorSlot: 0, skillId: OROCHIMARU_SKILLS.bite, rule: 'lowest-hp' },
        trigger: {
            watchSlot: 0, actorSlot: 0, skillId: OROCHIMARU_SKILLS.bite, rule: 'highest-hp', phase: 2,
            marksCursedSeal: true, event: 'Orochimaru\'s neck stretches impossibly far. The Cursed Seal of Heaven!',
        },
        enrage: null,
        phaseLabels: { 2: 'The bite' },
        victoryText: 'Orochimaru melted into the mud. "We will meet again."',
    },
    'final-bout': {
        bossId: 'final-bout',
        act: 2,
        duel: true,
        name: 'Gaara of the Desert',
        title: 'Act II Boss — The Chūnin Exam Finals',
        enemyIds: ['gaara-of-the-desert', null, null],
        hpCaps: [170],
        intro: 'The stadium falls silent. Gaara steps into the arena, and sand spills from the gourd on his back.',
        mechanics: [
            'A duel: choose one ninja to face Gaara. The others watch from the stands.',
            'Gaara announces his next technique a turn ahead. It is always paid for.',
            'Stun him before his turn to interrupt it, or answer Sand Binding Coffin with invulnerability.',
            'When Gaara first falls to half health, Shukaku stirs: he raises Sand Sphere and deals 10 additional damage.',
        ],
        rotation: [
            { actorSlot: 0, skillId: GAARA_SKILLS.coffin, rule: 'highest-hp' },
            { actorSlot: 0, skillId: GAARA_SKILLS.funeral, rule: 'lowest-hp' },
            { actorSlot: 0, skillId: GAARA_SKILLS.funeral, rule: 'lowest-hp' },
        ],
        fallback: { actorSlot: 0, skillId: GAARA_SKILLS.funeral, rule: 'lowest-hp' },
        trigger: {
            watchSlot: 0, actorSlot: 0, skillId: GAARA_SKILLS.sphere, rule: 'self', phase: 2,
            applyStatus: SHUKAKU_STATUS, event: 'Sand coils into a tail. Shukaku stirs inside Gaara!',
        },
        enrage: null,
        phaseLabels: { 2: 'Shukaku stirs' },
        victoryText: 'Gaara staggered, and feathers began to fall over the stadium. The Konoha Crush has begun.',
    },
};

const BOSS_DEFINITION = BOSSES[BOSS_ID];
const getBossDefinition = (bossId, custom = null) => custom || BOSSES[bossId] || BOSSES[BOSS_ID];
// A Standard-mode boss is synthesized from the roster and carries its definition in its state.
const defOf = (state) => state?.def || getBossDefinition(state?.bossId);

const buildBossEncounter = ({ floor, bossId = BOSS_ID, def: custom = null }) => {
    const def = getBossDefinition(bossId, custom);
    return {
        kind: 'boss',
        floor,
        bossId: def.bossId,
        name: def.name,
        enemyIds: def.enemyIds.slice(),
        hpCaps: def.hpCaps.slice(),
        hpMultiplier: 1,
        affixes: [],
        duel: Boolean(def.duel),
        ...(custom ? { bossDef: custom } : {}),
    };
};

const describeBossForClient = (bossIdOrEncounter, custom = null) => {
    const bossId = typeof bossIdOrEncounter === 'string' ? bossIdOrEncounter : bossIdOrEncounter?.bossId;
    const def = getBossDefinition(bossId, custom || bossIdOrEncounter?.bossDef || null);
    return {
        bossId: def.bossId,
        name: def.name,
        title: def.title,
        intro: def.intro,
        mechanics: def.mechanics.slice(),
        duel: Boolean(def.duel),
    };
};

// Raise the boss units' health to their scripted values once the board exists.
const applyBossVitality = (board, botUsername, hpCaps = BOSS_DEFINITION.hpCaps) => {
    (board?.[botUsername] || []).forEach((unit, slot) => {
        const cap = hpCaps[slot];
        if (!unit || !cap || unit.alive === false) return;
        unit.hpCap = cap;
        unit.hp = cap;
    });
};

const createBossState = (bossId = BOSS_ID, custom = null) => ({
    ...(custom ? { def: custom } : {}),
    bossId: getBossDefinition(bossId, custom).bossId, turn: 0, cycle: 0, phase: 1,
    triggerFired: false, mirrorsTriggered: false, enraged: false, intent: null, lastEvent: null,
    cursedSlot: null,
});

// ---------------------------------------------------------------- helpers
const characterOf = (characters, unit) => characters?.[unit?.rosterIndex] || null;

const skillIndexOf = (characters, unit, skillId) =>
    (characterOf(characters, unit)?.skills || []).findIndex((skill) => skill?.id === skillId);

const shortName = (character) => String(character?.name || 'Unknown').split(' ')[0];

const pickByRule = (candidates, rule) => {
    const alive = candidates.filter((entry) => isAlive(entry.unit));
    if (!alive.length) return null;
    const sorted = alive.slice().sort((left, right) => (rule === 'lowest-hp'
        ? Number(left.unit.hp) - Number(right.unit.hp)
        : Number(right.unit.hp) - Number(left.unit.hp)) || left.slot - right.slot);
    return sorted[0];
};

const legalTargets = ({ match, botUsername, actorSlot, skillIndex, characters, battleLogic }) => {
    const options = battleLogic.computeTargetOptions({
        match, actingUsername: botUsername, actorSlot, skillIndex, characters,
    });
    return options && Array.isArray(options.targets) ? options : { mode: 'unknown', targets: [] };
};

const describeIntent = ({ intent, match, botUsername, playerUsername, characters }) => {
    const actor = match.board?.[botUsername]?.[intent.actorSlot];
    const actorCharacter = characterOf(characters, actor);
    const skill = (actorCharacter?.skills || []).find((entry) => entry?.id === intent.skillId);
    const targetUnit = Number.isInteger(intent.targetSlot) ? match.board?.[playerUsername]?.[intent.targetSlot] : null;
    const targetName = targetUnit ? shortName(characterOf(characters, targetUnit)) : '';
    const actorName = shortName(actorCharacter);
    const skillName = skill?.name || 'a technique';
    return {
        ...intent,
        actorName,
        skillName,
        skillImage: skill?.skillimage || '',
        skillDescription: skill?.skilldescription || '',
        targetName,
        text: targetName ? `${actorName} will use ${skillName} on ${targetName}.` : `${actorName} will use ${skillName}.`,
    };
};

const markTriggerFired = (state, def) => {
    state.triggerFired = true;
    if (def.trigger?.flag) state[def.trigger.flag] = true;
};

// ---------------------------------------------------------------- telegraph
// Decides (and describes) the technique the boss will use on its next turn.
const computeNextIntent = ({ state, match, botUsername, playerUsername, characters, battleLogic }) => {
    const def = defOf(state);
    const bossUnits = match.board?.[botUsername] || [];
    const trigger = def.trigger;
    const fired = state.triggerFired || (trigger?.flag && state[trigger.flag]);
    let plan = null;
    if (trigger && !fired) {
        const watched = bossUnits[trigger.watchSlot];
        if (isAlive(watched) && isAlive(bossUnits[trigger.actorSlot]) &&
            Number(watched.hp) <= Number(watched.hpCap) / 2) {
            plan = { actorSlot: trigger.actorSlot, skillId: trigger.skillId, rule: trigger.rule, phaseChange: true };
        }
    }
    if (!plan && def.rotation.length) {
        let step = def.rotation[state.cycle % def.rotation.length];
        const actor = bossUnits[step.actorSlot];
        if (isAlive(actor)) {
            const actorState = battleLogic.getUnitState(match, botUsername, step.actorSlot);
            if (battleLogic.getSkillCooldownRemaining(actorState, step.skillId) > 0) {
                step = def.fallback && battleLogic.getSkillCooldownRemaining(actorState, def.fallback.skillId) <= 0
                    ? def.fallback : null;
            } else {
                state.cycle += 1;
            }
            if (step) plan = { ...step };
        }
    }
    if (!plan) return null;
    if (plan.rule !== 'self') {
        const actor = bossUnits[plan.actorSlot];
        const skillIndex = skillIndexOf(characters, actor, plan.skillId);
        const options = legalTargets({ match, botUsername, actorSlot: plan.actorSlot, skillIndex, characters, battleLogic });
        const reachable = options.targets
            .filter((target) => target.username === playerUsername)
            .map((target) => ({ slot: target.slot, unit: match.board[playerUsername][target.slot] }));
        const fallback = (match.board?.[playerUsername] || []).map((unit, slot) => ({ slot, unit }));
        const chosen = pickByRule(reachable.length ? reachable : fallback, plan.rule);
        plan.targetSlot = chosen ? chosen.slot : null;
    }
    return describeIntent({ intent: plan, match, botUsername, playerUsername, characters });
};

// ---------------------------------------------------------------- the boss turn
/**
 * Runs the scripted part of a boss turn. Returns the boss slots that already queued a
 * skill, so the regular bot planner skips them.
 *  fundSkill({ skill, actorState }): grants the chakra a telegraphed skill needs.
 *  queue({ actorSlot, skillIndex, targetSelection }): the server's normal skill queue.
 */
const runScriptedBossTurn = ({
    state, match, botUsername, playerUsername, characters, battleLogic, fundSkill, queue,
}) => {
    const def = defOf(state);
    const usedSlots = [];
    const events = [];
    state.turn += 1;
    const bossUnits = match.board?.[botUsername] || [];

    const enrage = def.enrage;
    if (enrage && !state.enraged && isAlive(bossUnits[enrage.targetSlot]) && !isAlive(bossUnits[enrage.whenDeadSlot])) {
        battleLogic.applyStatus({
            targetState: battleLogic.getUnitState(match, botUsername, enrage.targetSlot),
            statusId: enrage.status.statusId,
            duration: enrage.status.duration,
            sourceSkillId: null,
            sourceUsername: botUsername,
            sourceSlot: enrage.targetSlot,
            metadata: { ...enrage.status.metadata },
        });
        state.enraged = true;
        state.phase = enrage.phase;
        events.push(enrage.event);
    }

    const intent = state.intent;
    state.intent = null;
    if (intent) {
        const actor = bossUnits[intent.actorSlot];
        const actorState = actor ? battleLogic.getUnitState(match, botUsername, intent.actorSlot) : null;
        const skillIndex = skillIndexOf(characters, actor, intent.skillId);
        const skill = skillIndex >= 0
            ? battleLogic.resolveEffectiveSkill({ characters, rosterIndex: actor.rosterIndex, skillIndex, actorState })
            : null;
        const options = isAlive(actor) && skill
            ? legalTargets({ match, botUsername, actorSlot: intent.actorSlot, skillIndex, characters, battleLogic })
            : { mode: 'unknown', targets: [] };
        if (!isAlive(actor)) {
            events.push(`${intent.actorName} fell before using ${intent.skillName}.`);
        } else if (battleLogic.isActorUnableToUseSkills(actorState)) {
            events.push(`Interrupted! ${intent.actorName} was stunned and could not use ${intent.skillName}.`);
        } else if (!options.targets.length) {
            events.push(`${intent.actorName}'s ${intent.skillName} found no target.`);
        } else {
            let selection;
            if (options.mode === 'single' || options.mode === 'self') {
                const planned = options.targets.find((target) =>
                    target.username === playerUsername && target.slot === intent.targetSlot);
                const enemyTargets = options.targets.filter((target) => target.username === playerUsername);
                const byRule = pickByRule(enemyTargets.map((target) => ({
                    slot: target.slot, unit: match.board[playerUsername][target.slot], target,
                })), intent.rule);
                selection = [planned || byRule?.target || options.targets[0]];
            } else {
                selection = options.targets;
            }
            try {
                fundSkill({ skill, actorState });
                queue({ actorSlot: intent.actorSlot, skillIndex, targetSelection: selection });
                usedSlots.push(intent.actorSlot);
                if (intent.phaseChange && def.trigger) {
                    markTriggerFired(state, def);
                    state.phase = Math.max(state.phase, def.trigger.phase || 2);
                    if (def.trigger.applyStatus) {
                        const status = def.trigger.applyStatus;
                        battleLogic.applyStatus({
                            targetState: actorState,
                            statusId: status.statusId,
                            duration: status.duration,
                            sourceSkillId: null,
                            sourceUsername: botUsername,
                            sourceSlot: intent.actorSlot,
                            metadata: { ...status.metadata },
                        });
                    }
                    if (def.trigger.marksCursedSeal) {
                        const bitten = selection.find((target) => target?.username === playerUsername);
                        if (bitten && Number.isInteger(bitten.slot)) state.cursedSlot = bitten.slot;
                    }
                    events.push(def.trigger.event);
                }
            } catch (error) {
                events.push(`Interrupted! ${intent.actorName} could not use ${intent.skillName}.`);
            }
        }
    }
    state.lastEvent = events.length ? { turn: state.turn, text: events.join(' ') } : null;
    return { usedSlots, events };
};

// What the battle screen shows about the boss.
const describeBossStateForClient = (state) => {
    if (!state) return null;
    const def = defOf(state);
    return {
        bossId: state.bossId,
        phase: state.phase,
        phaseLabel: def.phaseLabels?.[state.phase] || '',
        enraged: Boolean(state.enraged),
        intent: state.intent ? {
            actorName: state.intent.actorName,
            skillName: state.intent.skillName,
            skillImage: state.intent.skillImage,
            skillDescription: state.intent.skillDescription,
            targetName: state.intent.targetName,
            text: state.intent.text,
        } : null,
        lastEvent: state.lastEvent || null,
    };
};

module.exports = {
    BOSS_ID,
    BOSSES,
    BOSS_DEFINITION,
    SKILLS,
    OROCHIMARU_SKILLS,
    GAARA_SKILLS,
    ENRAGE_STATUS,
    SHUKAKU_STATUS,
    getBossDefinition,
    defOf,
    buildBossEncounter,
    describeBossForClient,
    applyBossVitality,
    createBossState,
    computeNextIntent,
    runScriptedBossTurn,
    describeBossStateForClient,
};
