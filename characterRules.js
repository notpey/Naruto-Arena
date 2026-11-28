// Character Rules: statuses that react to what happens in a match.
//
// A status (or a passive) can carry `rules` in its metadata. Each rule reads as one sentence:
//   { when: { event, ...filters }, if: [checks], do: [actions] }
// "When this happens, if every check passes, do these things." Rules fire top to bottom, and a
// chain of rules triggering rules stops after MAX_RULE_CHAIN steps in one moment, so a rule that
// triggers itself cannot stall a match.
//
// Counters are plain numbers in the status's metadata (metadata.charges), the same place the
// engine's existing stacks live, so existing damage scaling and checks read them unchanged.
//
// Only statuses that carry rules are touched here. Every other status, and every current
// character, runs on the engine's existing settings exactly as before.
//
// The battle engine passes its own functions in (createRuleRunner(api)), so rule damage, healing
// and statuses go through the same code as everything else and come out identical.

const MAX_RULE_CHAIN = 10;

// Events this runner understands, and the extra filters each one takes:
//   matchStart                         the match begins
//   turnEnds    { whose }              'owner' (default): the turn of the team holding the status
//                                      'caster': the turn of the team that placed it
//   countered                          this status countered an enemy skill
//   statusEnds  { reasons }            why it ended: 'expired', 'interrupted' (a control effect
//                                      broken by a stun or invulnerability), 'casterDied',
//                                      'ownerDied'; all reasons when left out
//   healthBelow { who, below }         'ally' (default, the owner's allies) or 'owner' has health
//                                      under `below`
//   statusApplied                      this status was just placed by a skill
//   ownerUsesSkill { skillIds, classesAny, harmfulOnly }
//                                      the owner uses a skill (before its effects resolve)
//   enemySkillOnOwner { classesAny, harmfulOnly, damagingOnly }
//                                      an enemy uses a skill on the owner; 'attacker' is that enemy
//   ownerKills  { skillIds, classesAny, relation }
//                                      the owner kills a unit ('enemy', 'ally' or 'any' relation)
//   unitDies    { who }                'owner' (default), 'ally' or 'enemy' of the owner dies
//   damaged                            the owner takes damage
//   undamagedTurn                      the owner's team ends a turn in which the owner took none
//   ownerStuns                         a skill of the owner stuns an enemy
//   enemyPaysMore                      an enemy uses a skill that costs more than usual
const RULE_EVENTS = ['matchStart', 'turnEnds', 'countered', 'statusEnds', 'healthBelow', 'statusApplied',
    'ownerUsesSkill', 'enemySkillOnOwner', 'ownerKills', 'unitDies', 'damaged', 'undamagedTurn', 'ownerStuns',
    'enemyPaysMore'];

// Actions beyond ordinary effects (damage, heal, apply_status, gain_chakra and the rest, run by the engine).
const RULE_ACTIONS = ['add_counter', 'clear_cooldown', 'remove_status', 'grant_skill_use'];

// Class names as the engine reads them: Energy is Chakra, and there is no Mental class (it is Strategic).
const classKey = (value) => {
    const key = String(value || '').trim().toLowerCase();
    return key === 'energy' ? 'chakra' : key === 'mental' ? 'strategic' : key;
};
const classesMatch = (wanted, classes) => !Array.isArray(wanted) || !wanted.length ||
    wanted.some((entry) => (Array.isArray(classes) ? classes : []).some((cls) => classKey(cls) === classKey(entry)));

const isActive = (status) => Boolean(status) && (Number(status.remainingTurns) || 0) > 0;
const rulesOf = (status) => (Array.isArray(status?.metadata?.rules) ? status.metadata.rules : []);

const createRuleRunner = (api) => {
    const { applyTriggeredEffectsFromStatus, applyStatus, ensureUnitStateShape, refreshDerivedStatusTooltips } = api;
    // The engine's own test of whether a status is in force (some only work under a condition,
    // e.g. while the owner has destructible defense); turns left when no test is given.
    const inForce = (status, unit) => (typeof api.isStatusActive === 'function' ? api.isStatusActive(status, unit) : isActive(status));

    // ---------------------------------------------------------------- who is who
    // "owner" holds the status; "caster" placed it; "oppositeEnemy" stands across from the owner.
    const resolve = (ctx, on = 'owner') => {
        const { match } = ctx;
        if (on === 'caster') {
            // A passive has no caster of its own: its owner stands in.
            const username = ctx.status?.sourceUsername || ctx.username;
            const slot = ctx.status?.sourceUsername ? ctx.status?.sourceSlot : ctx.slot;
            const unit = username && Number.isInteger(slot) ? match?.board?.[username]?.[slot] : null;
            return unit ? { username, slot, unit } : null;
        }
        if (on === 'attacker') {
            const username = ctx.info?.attackerUsername;
            const slot = ctx.info?.attackerSlot;
            const unit = username && Number.isInteger(slot) ? match?.board?.[username]?.[slot] : null;
            return unit ? { username, slot, unit } : null;
        }
        if (on === 'oppositeEnemy') {
            const enemy = Object.keys(match?.board || {}).find((username) => username !== ctx.username);
            const unit = enemy ? match.board[enemy]?.[ctx.slot] : null;
            return unit ? { username: enemy, slot: ctx.slot, unit } : null;
        }
        return ctx.unit ? { username: ctx.username, slot: ctx.slot, unit: ctx.unit } : null;
    };
    const findStatus = (unit, statusId) => (unit?.state?.statuses || [])
        .find((status) => status?.id === statusId && isActive(status)) || null;
    // A counter lives on this rule's status unless the check or action names another status.
    const counterStatus = (ctx, spec) => {
        if (!spec?.statusId) return ctx.status;
        return findStatus(resolve(ctx, spec.on)?.unit, spec.statusId);
    };

    // ---------------------------------------------------------------- checks ("if")
    const passes = (ctx, check) => {
        if (!check || typeof check !== 'object') return true;
        if (check.has) return Boolean(findStatus(resolve(ctx, check.on)?.unit, check.has));
        if (check.lacks) return !findStatus(resolve(ctx, check.on)?.unit, check.lacks);
        if (check.counter) {
            const value = Number(counterStatus(ctx, check)?.metadata?.[check.counter]) || 0;
            if (check.atLeast !== undefined && value < Number(check.atLeast)) return false;
            if (check.atMost !== undefined && value > Number(check.atMost)) return false;
            return true;
        }
        return true;
    };

    // ---------------------------------------------------------------- actions ("do")
    const refreshTooltip = (state, status) => {
        if (typeof status?.metadata?.tooltipTextTemplate === 'string' && status.metadata.tooltipTextTemplate) {
            status.metadata.tooltipText = status.metadata.tooltipTextTemplate.replace(
                /\{(\w+)\}/g, (match, key) => String(status.metadata[key] ?? 0));
        }
        if (state && typeof refreshDerivedStatusTooltips === 'function') refreshDerivedStatusTooltips(state);
    };
    const addToCounter = (ctx, action) => {
        const amount = Number(action.amount ?? 1) || 0;
        let status = counterStatus(ctx, action);
        const holder = resolve(ctx, action.on);
        if (!status && action.statusId && action.create && holder) {
            // First use: create the counter's status, starting at 0.
            const state = ensureUnitStateShape(holder.unit);
            applyStatus({
                targetState: state, statusId: action.statusId, duration: Number(action.create.duration) || 99,
                sourceSkillId: ctx.status?.sourceSkillId || null,
                sourceUsername: holder.username, sourceSlot: holder.slot,
                metadata: { ...(action.create.metadata || {}), [action.counter]: 0 }, fresh: false,
            });
            status = findStatus(holder.unit, action.statusId);
        }
        if (!status) return;
        const max = action.max === undefined ? Infinity : Number(action.max);
        const min = action.min === undefined ? 0 : Number(action.min);
        const next = (Number(status.metadata?.[action.counter]) || 0) + amount;
        status.metadata = { ...(status.metadata || {}), [action.counter]: Math.max(min, Math.min(max, next)) };
        refreshTooltip(holder?.unit?.state, status);
    };
    const runAction = (ctx, action) => {
        if (!action || typeof action !== 'object') return;
        if (action.type === 'add_counter') return addToCounter(ctx, action);
        const target = resolve(ctx, action.on);
        if (!target) return;
        const state = ensureUnitStateShape(target.unit);
        if (action.type === 'clear_cooldown') {
            (Array.isArray(action.skillIds) ? action.skillIds : []).forEach((skillId) => {
                if (state.cooldowns && typeof skillId === 'string') delete state.cooldowns[skillId];
            });
            return;
        }
        if (action.type === 'grant_skill_use') {
            // One more use of a skill that has a limited number of uses.
            if (typeof action.skillId !== 'string' || !action.skillId) return;
            state.bonusSkillUses = state.bonusSkillUses || {};
            state.bonusSkillUses[action.skillId] = Math.max(0, Number(state.bonusSkillUses[action.skillId]) || 0) +
                Math.max(0, Number(action.amount ?? 1) || 0);
            return;
        }
        if (action.type === 'remove_status') {
            const before = state.statuses.length;
            state.statuses = state.statuses.filter((status) => status?.id !== action.statusId);
            if (state.statuses.length !== before) refreshTooltip(state, null);
            return;
        }
        // Everything else is an ordinary effect, run by the engine exactly as a status effect is.
        // Damage and healing need a living target; chakra still reaches a fallen unit's team.
        if (target.unit.alive === false && ['damage', 'heal', 'health_steal_damage', 'cleanse_statuses'].includes(action.type)) return;
        const { on, ...effect } = action;
        // A passive has no caster of its own: its owner is the one acting.
        const acting = ctx.status?.sourceUsername ? ctx.status
            : { ...(ctx.status || {}), sourceUsername: ctx.username, sourceSlot: ctx.slot };
        applyTriggeredEffectsFromStatus({
            effects: [effect], match: ctx.match, status: acting,
            targetUnit: target.unit, targetState: state, targetUsername: target.username, targetSlot: target.slot,
            pendingStatuses: target.unit === ctx.unit ? ctx.pendingStatuses || null : null,
        });
    };

    // ---------------------------------------------------------------- matching ("when")
    const matchesWhen = (ctx, when, info) => {
        if (!when || when.event !== info.event) return false;
        switch (info.event) {
            case 'turnEnds': {
                const whose = when.whose === 'caster' ? ctx.status?.sourceUsername : ctx.username;
                return Boolean(whose) && whose === info.endingUsername;
            }
            case 'statusEnds':
                return !Array.isArray(when.reasons) || when.reasons.includes(info.reason);
            case 'healthBelow': {
                const below = Number(when.below) || 0;
                if (below <= 0) return false;
                if (when.who === 'owner') return (Number(ctx.unit?.hp) || 0) < below;
                const team = ctx.match?.board?.[ctx.username] || [];
                return team.some((ally, allySlot) => allySlot !== ctx.slot && ally && Number(ally.hp) < below);
            }
            case 'ownerUsesSkill':
            case 'enemySkillOnOwner':
            case 'ownerKills': {
                if (Array.isArray(when.skillIds) && when.skillIds.length && !when.skillIds.includes(info.skillId)) return false;
                if (!classesMatch(when.classesAny, info.classes)) return false;
                if (when.harmfulOnly && !info.harmful) return false;
                if (info.event === 'enemySkillOnOwner' && Boolean(when.damagingOnly) !== Boolean(info.damagingPass)) return false;
                if (info.event === 'ownerKills') {
                    const relation = when.relation || 'any';
                    if (relation !== 'any' && relation !== info.relation) return false;
                }
                return true;
            }
            case 'unitDies': {
                const isOwner = info.dyingUsername === ctx.username && info.dyingSlot === ctx.slot;
                const who = when.who || 'owner';
                if (who === 'owner') return isOwner;
                if (isOwner) return false;
                return who === 'ally' ? info.dyingUsername === ctx.username : info.dyingUsername !== ctx.username;
            }
            default:
                return true;
        }
    };

    // Runs one status's rules for one event. Returns true if any rule fired.
    const fireStatus = ({ match, event, username, slot, status, info = {}, pendingStatuses = null }) => {
        const rules = rulesOf(status);
        if (!rules.length || !match) return false;
        const unit = match.board?.[username]?.[slot];
        if (!unit) return false;
        // A status does nothing at the end of the turn it was placed (as every status works today).
        if (event === 'turnEnds' && status.fresh) return false;
        match.ruleChainDepth = Number(match.ruleChainDepth) || 0;
        if (match.ruleChainDepth >= MAX_RULE_CHAIN) return false;
        match.ruleChainDepth += 1;
        let fired = false;
        try {
            const eventInfo = { ...info, event };
            const ctx = { match, username, slot, unit, status, pendingStatuses, info: eventInfo };
            rules.forEach((rule) => {
                if (!matchesWhen(ctx, rule?.when, eventInfo)) return;
                if (!(Array.isArray(rule.if) ? rule.if : []).every((check) => passes(ctx, check))) return;
                fired = true;
                (Array.isArray(rule.do) ? rule.do : []).forEach((action) => runAction(ctx, action));
            });
        } finally {
            match.ruleChainDepth -= 1;
        }
        return fired;
    };

    // Runs an event for every status with rules on the board (or on one team).
    const fireBoard = ({ match, event, info = {}, usernames = null }) => {
        Object.entries(match?.board || {}).forEach(([username, units]) => {
            if (Array.isArray(usernames) && !usernames.includes(username)) return;
            (Array.isArray(units) ? units : []).forEach((unit, slot) => {
                if (!unit || unit.alive === false) return;
                // A copy of the list: rules may add or remove statuses while they run.
                [...(unit.state?.statuses || [])].forEach((status) => {
                    if (!inForce(status, unit) || !rulesOf(status).length) return;
                    fireStatus({ match, event, username, slot, status, info });
                });
            });
        });
    };

    // Adds to a counter from a skill effect ({ type: 'add_counter', ... }), with the skill's user
    // as the owner of the counter's status.
    const addCounterFromSkill = ({ match, username, slot, effect, sourceSkillId = null }) => {
        const unit = match?.board?.[username]?.[slot];
        if (!unit) return;
        addToCounter({ match, username, slot, unit, status: { sourceSkillId } }, { ...effect, on: effect.on || 'owner' });
    };

    // Runs an event for every status with rules on one unit (alive or, for its death, just fallen).
    const fireUnit = ({ match, event, username, slot, info = {}, pendingStatuses = null }) => {
        const unit = match?.board?.[username]?.[slot];
        if (!unit) return;
        [...(unit.state?.statuses || [])].forEach((status) => {
            if (!inForce(status, unit) || !rulesOf(status).length) return;
            fireStatus({ match, event, username, slot, status, info, pendingStatuses });
        });
    };

    return { fireStatus, fireBoard, fireUnit, addCounterFromSkill };
};

const hasRules = (status) => rulesOf(status).length > 0;

module.exports = { createRuleRunner, hasRules, MAX_RULE_CHAIN, RULE_EVENTS, RULE_ACTIONS };
