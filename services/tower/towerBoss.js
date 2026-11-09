// Scripted Tower boss: the Demon of the Hidden Mist (Zabuza, Haku and the Demon Brothers).
//
// The boss telegraphs one signature technique a turn ahead ("intent"). On its next turn
// it queues exactly that technique through the same queue a player uses, so the engine
// resolves it under the normal rules. The player can answer the telegraph: stun the
// caster to interrupt it, or protect the named target. Every unit the script does not
// move is played by the regular battle bot.
//
// Boss rules (Tower-only, stated to the player before the fight):
//  - telegraphed techniques are always fuelled: the boss is granted the chakra they cost;
//  - when Haku first drops to half health, the next intent is Demonic Mirroring Ice Crystals;
//  - when Haku falls, Zabuza is enraged for the rest of the fight.

const BOSS_ID = 'demon-of-the-mist';
const ZABUZA_SLOT = 0;
const HAKU_SLOT = 1;

const SKILLS = {
    sword: 'momochi-zabuza-kubikiribocho',
    prison: 'momochi-zabuza-water-prison-technique',
    mist: 'momochi-zabuza-hidden-mist-technique',
    mirrors: 'haku-demonic-mirroring-ice-crystals',
};

// Zabuza's rotation, one entry telegraphed per boss turn.
const ZABUZA_CYCLE = [
    { skillId: SKILLS.mist, rule: 'self' },
    { skillId: SKILLS.prison, rule: 'highest-hp' },
    { skillId: SKILLS.sword, rule: 'lowest-hp' },
    { skillId: SKILLS.sword, rule: 'lowest-hp' },
];

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

const BOSS_DEFINITION = {
    bossId: BOSS_ID,
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
};

const buildBossEncounter = ({ floor }) => ({
    kind: 'boss',
    floor,
    bossId: BOSS_ID,
    name: BOSS_DEFINITION.name,
    enemyIds: BOSS_DEFINITION.enemyIds.slice(),
    hpCaps: BOSS_DEFINITION.hpCaps.slice(),
    hpMultiplier: 1,
    affixes: [],
});

const describeBossForClient = () => ({
    bossId: BOSS_ID,
    name: BOSS_DEFINITION.name,
    title: BOSS_DEFINITION.title,
    intro: BOSS_DEFINITION.intro,
    mechanics: BOSS_DEFINITION.mechanics.slice(),
});

// Raise the boss units' health to their scripted values once the board exists.
const applyBossVitality = (board, botUsername) => {
    (board?.[botUsername] || []).forEach((unit, slot) => {
        const cap = BOSS_DEFINITION.hpCaps[slot];
        if (!unit || !cap) return;
        unit.hpCap = cap;
        unit.hp = cap;
    });
};

const createBossState = () => ({
    bossId: BOSS_ID, turn: 0, cycle: 0, phase: 1,
    mirrorsTriggered: false, enraged: false, intent: null, lastEvent: null,
});

// ---------------------------------------------------------------- helpers
const isAlive = (unit) => Boolean(unit) && unit.alive !== false && Number(unit.hp) > 0;

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

// ---------------------------------------------------------------- telegraph
// Decides (and describes) the technique the boss will use on its next turn.
const computeNextIntent = ({ state, match, botUsername, playerUsername, characters, battleLogic }) => {
    const bossUnits = match.board?.[botUsername] || [];
    const zabuza = bossUnits[ZABUZA_SLOT];
    const haku = bossUnits[HAKU_SLOT];
    let plan = null;
    if (!state.mirrorsTriggered && isAlive(haku) && Number(haku.hp) <= Number(haku.hpCap) / 2) {
        plan = { actorSlot: HAKU_SLOT, skillId: SKILLS.mirrors, rule: 'self', phaseChange: true };
    } else if (isAlive(zabuza)) {
        const zabuzaState = battleLogic.getUnitState(match, botUsername, ZABUZA_SLOT);
        let step = ZABUZA_CYCLE[state.cycle % ZABUZA_CYCLE.length];
        if (battleLogic.getSkillCooldownRemaining(zabuzaState, step.skillId) > 0) {
            step = { skillId: SKILLS.sword, rule: 'lowest-hp' };
        } else {
            state.cycle += 1;
        }
        plan = { actorSlot: ZABUZA_SLOT, ...step };
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
    const usedSlots = [];
    const events = [];
    state.turn += 1;
    const bossUnits = match.board?.[botUsername] || [];
    const zabuza = bossUnits[ZABUZA_SLOT];

    if (!state.enraged && isAlive(zabuza) && !isAlive(bossUnits[HAKU_SLOT])) {
        battleLogic.applyStatus({
            targetState: battleLogic.getUnitState(match, botUsername, ZABUZA_SLOT),
            statusId: ENRAGE_STATUS.statusId,
            duration: ENRAGE_STATUS.duration,
            sourceSkillId: null,
            sourceUsername: botUsername,
            sourceSlot: ZABUZA_SLOT,
            metadata: { ...ENRAGE_STATUS.metadata },
        });
        state.enraged = true;
        state.phase = 3;
        events.push('Haku has fallen. The Demon is unleashed: Zabuza gains 10 damage and 5 damage reduction.');
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
                if (intent.phaseChange) {
                    state.mirrorsTriggered = true;
                    state.phase = Math.max(state.phase, 2);
                    events.push('Haku raises the Demonic Mirroring Ice Crystals!');
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
const describeBossStateForClient = (state) => (state ? {
    bossId: state.bossId,
    phase: state.phase,
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
} : null);

module.exports = {
    BOSS_ID,
    BOSS_DEFINITION,
    SKILLS,
    ENRAGE_STATUS,
    buildBossEncounter,
    describeBossForClient,
    applyBossVitality,
    createBossState,
    computeNextIntent,
    runScriptedBossTurn,
    describeBossStateForClient,
};
