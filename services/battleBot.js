// Battle bot decision-making. The bot plays by the same rules as a player: it only uses
// skills and targets the server's own targeting reports as legal, and only skills it can
// pay for. This module only decides which of those legal plays is worth making.

const liveStatuses = (unit) =>
    (Array.isArray(unit?.state?.statuses) ? unit.state.statuses : [])
        .filter((status) => (Number(status?.remainingTurns) || 0) > 0);

const hasLiveStatusWith = (unit, predicate) => liveStatuses(unit).some((status) => predicate(status?.metadata || {}, status));

const isInvulnerable = (unit) => hasLiveStatusWith(unit, (metadata) =>
    metadata.invulnerable || metadata.invulnerableToAllSkills || metadata.invulnerableToNonAffliction);

const isStunned = (unit) => hasLiveStatusWith(unit, (metadata) =>
    metadata.cannotUseSkills || metadata.cannotUseHarmfulSkills);

const hpOf = (unit) => Math.max(0, Number(unit?.hp) || 0);
const hpCapOf = (unit) => Math.max(1, Number(unit?.hpCap) || 100);

const STUN_KEYS = ['cannotUseSkills', 'cannotUseHarmfulSkills', 'cannotUseNonMentalSkills', 'cannotUseSkillClasses'];
const DEFENSE_KEYS = ['invulnerable', 'invulnerableToAllSkills', 'invulnerableToNonAffliction',
    'invulnerableToSkillClasses', 'damageReductionFlat', 'destructibleDefensePoints', 'unpierceableDamageReductionFlat'];
const COUNTER_KEYS = ['counterCancelsSkill', 'triggerOnEnemyHarmfulSkillClassesAny', 'reflect'];

const isEnemyScope = (scope, targetType) => {
    const value = String(scope || '').toLowerCase();
    if (value.includes('enemy') || value.includes('enemies')) return true;
    if (value === 'target') return /enemy|target|character/.test(String(targetType || ''));
    return false;
};

// A rough, rules-free summary of what a skill does, read from its definition.
const describeSkill = (skill) => {
    const summary = {
        damage: 0, afflictionPerTurn: 0, heal: 0, stun: false, defense: false, counter: false,
        enemyDebuff: false, selfBuff: false, chakraDenial: false, instantKill: false, hitsAllEnemies: false,
    };
    const targetType = String(skill?.target || '');
    if (targetType === 'all-enemy') summary.hitsAllEnemies = true;
    (Array.isArray(skill?.effects) ? skill.effects : []).forEach((effect) => {
        const type = String(effect?.type || '');
        const metadata = effect?.metadata || {};
        const scope = String(effect?.scope || '');
        if (scope === 'all-enemy') summary.hitsAllEnemies = true;
        if (type.includes('damage') && !scope.startsWith('self')) {
            summary.damage += Math.max(0, Number(effect.amount) || 0);
        } else if (type === 'instant_kill' || type === 'execute_threshold') {
            summary.instantKill = true;
        } else if (type.startsWith('heal')) {
            summary.heal += Math.max(10, Number(effect.amount) || 0);
        } else if (type.includes('chakra') && type !== 'gain_chakra') {
            summary.chakraDenial = true;
        } else if (type === 'apply_status') {
            const enemy = isEnemyScope(scope, targetType) || Boolean(metadata.harmful);
            if (STUN_KEYS.some((key) => metadata[key])) summary.stun = enemy || summary.stun;
            if (enemy && Number(metadata.turnEndDamage) > 0) {
                const turns = Math.max(1, Number(effect.duration) || 1);
                summary.afflictionPerTurn += Number(metadata.turnEndDamage) * Math.min(turns, 3);
            }
            if (!enemy && DEFENSE_KEYS.some((key) => metadata[key])) summary.defense = true;
            if (!enemy && COUNTER_KEYS.some((key) => metadata[key])) summary.counter = true;
            if (!enemy && (Number(metadata.turnEndHealFlat) > 0)) summary.heal += Number(metadata.turnEndHealFlat) * 3;
            if (enemy) summary.enemyDebuff = true;
            if (!enemy) summary.selfBuff = true;
        }
    });
    return summary;
};

const scoreTarget = ({ summary, targetUnit, isEnemy, elite = false }) => {
    if (!targetUnit) return 0;
    const hp = hpOf(targetUnit);
    const missing = hpCapOf(targetUnit) - hp;
    if (isEnemy) {
        let score = 0;
        const hit = summary.damage + summary.afflictionPerTurn;
        if (hit > 0) {
            score += Math.min(hit, hp);
            if (hit >= hp) score += 60; // A likely kill is worth the most.
            score += (100 - hp) * (elite ? 0.5 : 0.3); // Focus the most hurt enemy.
        }
        if (summary.instantKill) score += hp <= 30 ? 70 : 10;
        if (summary.stun) score += isStunned(targetUnit) ? 2 : 25 + hp * (elite ? 0.25 : 0.1);
        if (summary.enemyDebuff && !summary.stun) score += 8;
        if (summary.chakraDenial) score += 12;
        return score;
    }
    let score = 0;
    if (summary.heal > 0) score += Math.min(summary.heal, missing) * (missing > 30 ? 1.4 : 0.6);
    return score;
};

// Scores one legal play. options.targets are the server's legal targets for the skill.
// Elite bosses play sharper: harder focus fire, earlier stuns and defense, and far less randomness.
const scorePlay = ({ match, username, actorSlot, skill, options, random = Math.random, elite = false }) => {
    const summary = describeSkill(skill);
    const actorUnit = match.board?.[username]?.[actorSlot];
    const targets = Array.isArray(options?.targets) ? options.targets : [];
    if (!targets.length) return null;
    const resolveUnit = (target) => match.board?.[target?.username]?.[target?.slot];
    const scored = targets.map((target) => ({
        target,
        score: scoreTarget({ summary, targetUnit: resolveUnit(target), isEnemy: target.username !== username, elite }),
    }));
    let selection;
    let score;
    if (options.mode === 'single' || options.mode === 'self') {
        scored.sort((left, right) => right.score - left.score);
        selection = [scored[0].target];
        score = scored[0].score;
    } else {
        selection = targets;
        score = scored.reduce((sum, entry) => sum + entry.score, 0);
    }

    const actorHpRatio = hpOf(actorUnit) / hpCapOf(actorUnit);
    const selfTargeted = selection.some((target) => target.username === username && target.slot === actorSlot);
    if (summary.defense && (selfTargeted || options.mode === 'self')) {
        // Defend when hurt and not already protected; otherwise defensive skills mostly wait.
        if (isInvulnerable(actorUnit)) score += 0;
        else if (actorHpRatio <= (elite ? 0.45 : 0.35)) score += 45;
        else if (actorHpRatio <= (elite ? 0.7 : 0.6)) score += 18;
        else score += 3;
    }
    if (summary.counter) score += 14;
    if (summary.selfBuff && !summary.defense && !summary.counter && summary.damage === 0 && summary.heal === 0) {
        score += 10; // Setup skills (stance changes, empowerments) are worth using early.
    }
    // A little variety, so the bot is not perfectly predictable.
    score += random() * (elite ? 1.5 : 6);
    return { selection, score };
};

const MIN_PLAY_SCORE = 6;

/**
 * Plans and queues the bot's turn. Each living, able actor queues at most one skill.
 * Plays are chosen greedily by score and re-scored after each queue, since chakra changes.
 */
const planBattleBotTurn = ({
    match, username, characters, battleLogic, canAfford, queue, random = Math.random, elite = false,
    skipActorSlots = [],
}) => {
    const team = Array.isArray(match.board?.[username]) ? match.board[username] : [];
    // skipActorSlots: actors that already queued a skill this turn (a scripted boss move).
    const remainingActors = new Set(team
        .map((unit, slot) => (unit && unit.alive !== false && !skipActorSlots.includes(slot) ? slot : null))
        .filter((slot) => Number.isInteger(slot)));
    const queued = [];
    while (remainingActors.size > 0) {
        let best = null;
        remainingActors.forEach((actorSlot) => {
            const actorUnit = team[actorSlot];
            const actorState = battleLogic.getUnitState(match, username, actorSlot);
            if (!actorUnit || actorUnit.alive === false || battleLogic.isActorUnableToUseSkills(actorState)) return;
            const character = characters?.[actorUnit.rosterIndex];
            (Array.isArray(character?.skills) ? character.skills : []).forEach((baseSkill, skillIndex) => {
                // Hidden alternates are only reachable through their base skill's slot.
                if (!baseSkill || baseSkill.hiddenFromSelectionViewer || baseSkill.omitFromSelectionViewer) return;
                const options = battleLogic.computeTargetOptions({
                    match, actingUsername: username, actorSlot, skillIndex, characters,
                });
                if (!options?.targetType || options.mode === 'unknown' || !options.targets?.length) return;
                const skill = battleLogic.resolveEffectiveSkill({
                    characters, rosterIndex: actorUnit.rosterIndex, skillIndex, actorState,
                });
                if (!canAfford({ skill, actorState })) return;
                const play = scorePlay({ match, username, actorSlot, skill, options, random, elite });
                if (!play || play.score < MIN_PLAY_SCORE) return;
                if (!best || play.score > best.score) best = { ...play, actorSlot, skillIndex, skill };
            });
        });
        if (!best) break;
        remainingActors.delete(best.actorSlot);
        const classChoice = Array.isArray(best.skill?.classChoiceOptions) && best.skill.classChoiceOptions.length
            ? String(best.skill.classChoiceOptions[0]).trim().toLowerCase()
            : null;
        try {
            queue({ actorSlot: best.actorSlot, skillIndex: best.skillIndex, targetSelection: best.selection, classChoice });
            queued.push({ actorSlot: best.actorSlot, skillIndex: best.skillIndex, targetSelection: best.selection });
        } catch (_) {
            // The server refused the play; this actor sits the turn out.
        }
    }
    return queued;
};

// Spend random chakra from the types the bot holds most of, keeping scarce types for specific costs.
const pickRandomChakraType = (pool, chakraTypes) => chakraTypes
    .filter((type) => (Number(pool?.[type]) || 0) > 0)
    .sort((left, right) => (Number(pool[right]) || 0) - (Number(pool[left]) || 0))[0] || null;

module.exports = {
    describeSkill,
    scorePlay,
    planBattleBotTurn,
    pickRandomChakraType,
};
