// Character Rules vocabulary, shared by the Character Editor (browser) and its checks (server).
// Every event, check and action a rule can use, in plain words, plus:
//   describeRule(rule, ctx)   -> one sentence an admin can read ("When ..., if ..., then ...")
//   checkRules(rules, ctx)    -> problems the engine would ignore or misread, in plain words
//   counterNamesIn(rules)     -> the counters these rules use
// ctx = { statusName(id), skillName(id), isPassive }.
// The engine side lives in characterRules.js; keep the two lists in step.
(function (root, factory) {
    const api = factory();
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    else root.CharacterRulesVocab = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
    'use strict';

    // Who an action lands on, and who a check looks at.
    const TARGETS = [
        { id: 'owner', label: 'the holder', hint: 'the character this status is on' },
        { id: 'caster', label: 'the caster', hint: 'the character who placed this status' },
        { id: 'attacker', label: 'the attacker', hint: 'the enemy who used the skill', events: ['enemySkillOnOwner'] },
        { id: 'oppositeEnemy', label: 'the enemy opposite the holder', hint: 'the enemy in the same position' },
    ];
    const CLASSES = ['Physical', 'Chakra', 'Strategic', 'Affliction'];
    const DAMAGE_KINDS = [
        { id: 'normal', label: 'damage' },
        { id: 'piercing', label: 'piercing damage' },
        { id: 'affliction', label: 'affliction damage' },
    ];
    const CHAKRA_TYPES = ['random', 'taijutsu', 'ninjutsu', 'bloodline', 'genjutsu'];

    // Each event: what it means, and the extra choices that narrow it.
    const EVENTS = [
        { id: 'matchStart', label: 'the match starts' },
        { id: 'turnEnds', label: 'a turn ends', fields: [{ key: 'whose', kind: 'choice', label: 'Whose turn',
            options: [{ id: 'owner', label: "the holder's team's" }, { id: 'caster', label: "the caster's team's" }], default: 'owner' }] },
        { id: 'statusApplied', label: 'this status is placed by a skill' },
        { id: 'statusEnds', label: 'this status ends', fields: [{ key: 'reasons', kind: 'multi', label: 'When it',
            options: [{ id: 'expired', label: 'runs out' }, { id: 'interrupted', label: 'is broken by a stun or invulnerability' },
                { id: 'casterDied', label: 'ends because the caster dies' }, { id: 'ownerDied', label: 'ends because the holder dies' }] }] },
        { id: 'countered', label: 'this status counters a skill' },
        { id: 'ownerUsesSkill', label: 'the holder uses a skill', fields: [
            { key: 'skillIds', kind: 'skills', label: 'Only these skills' },
            { key: 'classesAny', kind: 'classes', label: 'Only these classes' },
            { key: 'harmfulOnly', kind: 'bool', label: 'Only harmful skills' }] },
        { id: 'enemySkillOnOwner', label: 'an enemy uses a skill on the holder', fields: [
            { key: 'classesAny', kind: 'classes', label: 'Only these classes' },
            { key: 'harmfulOnly', kind: 'bool', label: 'Only harmful skills' },
            { key: 'damagingOnly', kind: 'bool', label: 'Only when the skill deals damage' }] },
        { id: 'ownerKills', label: 'the holder defeats a character', fields: [
            { key: 'skillIds', kind: 'skills', label: 'Only with these skills' },
            { key: 'relation', kind: 'choice', label: 'Who', options: [{ id: 'enemy', label: 'an enemy' }, { id: 'ally', label: 'an ally' }, { id: 'any', label: 'anyone' }], default: 'enemy' }] },
        { id: 'unitDies', label: 'a character dies', fields: [{ key: 'who', kind: 'choice', label: 'Who',
            options: [{ id: 'owner', label: 'the holder' }, { id: 'ally', label: 'an ally of the holder' }, { id: 'enemy', label: 'an enemy of the holder' }], default: 'owner' }] },
        { id: 'damaged', label: 'the holder takes damage' },
        { id: 'undamagedTurn', label: "the holder's team ends a turn in which the holder took no damage" },
        { id: 'healthBelow', label: 'health drops below a number', fields: [
            { key: 'who', kind: 'choice', label: 'Whose health', options: [{ id: 'owner', label: "the holder's" }, { id: 'ally', label: "an ally's" }], default: 'owner' },
            { key: 'below', kind: 'number', label: 'Below', min: 1, max: 100, default: 50 }] },
        { id: 'ownerStuns', label: 'a skill of the holder stuns an enemy' },
        { id: 'enemyPaysMore', label: 'an enemy uses a skill that costs more than usual' },
    ];

    const CHECKS = [
        { id: 'has', label: 'has a status' },
        { id: 'lacks', label: 'does not have a status' },
        { id: 'counter', label: 'a counter is at least / at most' },
    ];

    const ACTIONS = [
        { id: 'damage', label: 'Deal damage' },
        { id: 'heal', label: 'Heal' },
        { id: 'apply_status', label: 'Apply a status' },
        { id: 'remove_status', label: 'Remove a status' },
        { id: 'add_counter', label: 'Add to a counter' },
        { id: 'gain_chakra', label: 'Gain chakra' },
        { id: 'clear_cooldown', label: "Reset a skill's cooldown" },
        { id: 'grant_skill_use', label: 'Give one more use of a skill' },
    ];
    const KNOWN_ACTIONS = new Set(ACTIONS.map((action) => action.id).concat(['health_steal_damage', 'cleanse_statuses']));

    const byId = (list, id) => list.find((entry) => entry.id === id) || null;
    const targetLabel = (on) => (byId(TARGETS, on || 'owner') || TARGETS[0]).label;
    const list = (items) => (items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`);
    const orList = (items) => (items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} or ${items[items.length - 1]}`);
    const named = (ctx, kind, id) => {
        const fn = ctx && ctx[kind === 'status' ? 'statusName' : 'skillName'];
        return (typeof fn === 'function' && fn(id)) || id || (kind === 'status' ? 'a status' : 'a skill');
    };
    const counterLabel = (name) => String(name || 'counter').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
    const damageKind = (action) => (action.metadata && action.metadata.afflictionDamage ? 'affliction'
        : action.metadata && action.metadata.ignoreDamageReduction ? 'piercing' : 'normal');

    // ------------------------------------------------------------ reading a rule as a sentence
    function describeWhen(when, ctx) {
        const event = byId(EVENTS, when && when.event);
        if (!event) return 'something unknown happens';
        switch (event.id) {
            case 'turnEnds': return when.whose === 'caster' ? "the caster's team ends a turn" : "the holder's team ends a turn";
            case 'statusEnds': {
                const reasons = Array.isArray(when.reasons) && when.reasons.length ? when.reasons : null;
                if (!reasons) return 'this status ends for any reason';
                return `this status ${orList(reasons.map((id) => (byId(event.fields[0].options, id) || { label: id }).label))}`;
            }
            case 'ownerUsesSkill':
            case 'enemySkillOnOwner': {
                const who = event.id === 'ownerUsesSkill' ? 'the holder uses' : 'an enemy uses';
                const kinds = [];
                if (when.harmfulOnly) kinds.push('harmful');
                if (Array.isArray(when.classesAny) && when.classesAny.length) kinds.push(orList(when.classesAny));
                const skills = Array.isArray(when.skillIds) && when.skillIds.length ? orList(when.skillIds.map((id) => named(ctx, 'skill', id))) : '';
                const what = skills || `${kinds.length ? `a ${kinds.join(' ')} skill` : 'a skill'}`;
                return `${who} ${what}${event.id === 'enemySkillOnOwner' ? ' on the holder' : ''}${when.damagingOnly ? ' that deals damage' : ''}`;
            }
            case 'ownerKills': {
                const who = when.relation === 'ally' ? 'an ally' : when.relation === 'any' ? 'a character' : 'an enemy';
                const skills = Array.isArray(when.skillIds) && when.skillIds.length ? ` with ${orList(when.skillIds.map((id) => named(ctx, 'skill', id)))}` : '';
                return `the holder defeats ${who}${skills}`;
            }
            case 'unitDies':
                return when.who === 'ally' ? 'an ally of the holder dies' : when.who === 'enemy' ? 'an enemy of the holder dies' : 'the holder dies';
            case 'healthBelow':
                return `${when.who === 'ally' ? "an ally's" : "the holder's"} health drops below ${Number(when.below) || 0}`;
            default:
                return event.label;
        }
    }
    function describeCheck(check, ctx) {
        if (!check || typeof check !== 'object') return '';
        // A check still being filled in reads with its blank ("a status", "a counter").
        if ('has' in check) return `${targetLabel(check.on)} has ${check.has ? named(ctx, 'status', check.has) : 'a status'}`;
        if ('lacks' in check) return `${targetLabel(check.on)} does not have ${check.lacks ? named(ctx, 'status', check.lacks) : 'a status'}`;
        if ('counter' in check) {
            const where = check.statusId ? ` on ${named(ctx, 'status', check.statusId)}` : '';
            const parts = [];
            if (check.atLeast !== undefined) parts.push(`at least ${check.atLeast}`);
            if (check.atMost !== undefined) parts.push(`at most ${check.atMost}`);
            return `${counterLabel(check.counter)}${where} is ${parts.join(' and ') || 'set'}`;
        }
        return '';
    }
    function describeAction(action, ctx) {
        if (!action || typeof action !== 'object') return '';
        const to = targetLabel(action.on);
        switch (action.type) {
            case 'damage': {
                const kind = byId(DAMAGE_KINDS, damageKind(action)).label;
                const per = action.metadata && action.metadata.bonusFromStatusMetadataKey
                    ? `, plus ${counterLabel(action.metadata.bonusFromStatusMetadataKey)}` : '';
                return `deal ${Number(action.amount) || 0} ${kind}${per} to ${to}`;
            }
            case 'heal': return `heal ${to} for ${Number(action.amount) || 0}`;
            case 'apply_status': {
                const turns = Number(action.duration) || 1;
                return `apply ${named(ctx, 'status', action.statusId)} to ${to} ${turns >= 99 ? 'permanently' : `for ${turns} turn${turns === 1 ? '' : 's'}`}`;
            }
            case 'remove_status': return `remove ${named(ctx, 'status', action.statusId)} from ${to}`;
            case 'add_counter': {
                const amount = Number(action.amount ?? 1) || 0;
                const where = action.statusId ? ` on ${named(ctx, 'status', action.statusId)}` : '';
                const cap = action.max !== undefined ? ` (at most ${action.max})` : '';
                return `${amount < 0 ? `take ${-amount} from` : `add ${amount} to`} ${counterLabel(action.counter)}${where}${cap}`;
            }
            case 'gain_chakra': {
                const amount = Number(action.amount) || 0;
                const type = String(action.chakraType || 'random').toLowerCase();
                return `${action.on === 'owner' || !action.on ? "the holder's" : `${to}'s`} team gains ${amount} ${type} chakra`;
            }
            case 'clear_cooldown': return `reset the cooldown of ${list((action.skillIds || []).map((id) => named(ctx, 'skill', id)))}`;
            case 'grant_skill_use': return `give ${to} ${Number(action.amount ?? 1) || 1} more use of ${named(ctx, 'skill', action.skillId)}`;
            default: return `do "${action.type}"`;
        }
    }
    function describeRule(rule, ctx) {
        if (!rule || typeof rule !== 'object') return '';
        const checks = (Array.isArray(rule.if) ? rule.if : []).map((check) => describeCheck(check, ctx)).filter(Boolean);
        const actions = (Array.isArray(rule.do) ? rule.do : []).map((action) => describeAction(action, ctx)).filter(Boolean);
        const sentence = `When ${describeWhen(rule.when, ctx)}${checks.length ? `, if ${list(checks)}` : ''}: ${actions.length ? list(actions) : 'nothing happens yet'}.`;
        return sentence.charAt(0).toUpperCase() + sentence.slice(1);
    }

    // ------------------------------------------------------------ problems
    function counterNamesIn(rules) {
        const names = new Set();
        (Array.isArray(rules) ? rules : []).forEach((rule) => {
            (Array.isArray(rule && rule.if) ? rule.if : []).forEach((check) => { if (check && check.counter) names.add(check.counter); });
            (Array.isArray(rule && rule.do) ? rule.do : []).forEach((action) => {
                if (action && action.type === 'add_counter' && action.counter) names.add(action.counter);
                if (action && action.metadata && action.metadata.bonusFromStatusMetadataKey) names.add(action.metadata.bonusFromStatusMetadataKey);
            });
        });
        return [...names];
    }
    function checkRules(rules, ctx) {
        const problems = [];
        const add = (level, message) => problems.push({ level, message });
        if (!Array.isArray(rules)) { add('error', 'Rules must be a list.'); return problems; }
        rules.forEach((rule, index) => {
            const at = `Rule ${index + 1}`;
            const event = byId(EVENTS, rule && rule.when && rule.when.event);
            if (!event) { add('error', `${at} has no "when", so it never happens.`); return; }
            if (ctx && ctx.isPassive && ['statusApplied', 'statusEnds', 'countered'].includes(event.id)) {
                add('warning', `${at}: a passive is never placed, ended or used to counter, so "${event.label}" never happens.`);
            }
            const actions = Array.isArray(rule.do) ? rule.do : [];
            if (!actions.length) add('warning', `${at} does nothing yet: add at least one action.`);
            actions.forEach((action, i) => {
                const where = `${at}, action ${i + 1}`;
                if (!action || !KNOWN_ACTIONS.has(action.type)) { add('error', `${where} isn't an action the engine knows.`); return; }
                const target = byId(TARGETS, action.on || 'owner');
                if (!target) add('error', `${where} lands on "${action.on}", which isn't someone the engine knows.`);
                else if (target.events && !target.events.includes(event.id)) add('error', `${where} lands on ${target.label}, but there is no attacker when ${event.label}.`);
                if (['damage', 'heal'].includes(action.type) && !(Number(action.amount) > 0)) add('warning', `${where} has no amount.`);
                if (['apply_status', 'remove_status'].includes(action.type) && !action.statusId) add('error', `${where} doesn't name a status.`);
                if (action.type === 'add_counter' && !action.counter) add('error', `${where} doesn't name a counter.`);
                if (action.type === 'grant_skill_use' && !action.skillId) add('error', `${where} doesn't name a skill.`);
                if (action.type === 'clear_cooldown' && !(action.skillIds || []).length) add('error', `${where} doesn't name a skill.`);
            });
            (Array.isArray(rule.if) ? rule.if : []).forEach((check, i) => {
                if (!check || !(check.has || check.lacks || check.counter)) add('error', `${at}, check ${i + 1} is empty, so the rule never passes it.`);
            });
        });
        return problems;
    }

    return { TARGETS, CLASSES, DAMAGE_KINDS, CHAKRA_TYPES, EVENTS, CHECKS, ACTIONS, describeRule, describeWhen,
        describeCheck, describeAction, checkRules, counterNamesIn, counterLabel, damageKind };
});
