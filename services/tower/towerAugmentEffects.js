// Tower augment effects that need battle events (Tower 2.0, Standard mode).
//
// battleLogic.js reports events for matches whose mode is 'tower' only (setTowerHooks):
// a skill being used and resolved, each damage instance, heals, statuses being applied,
// successful counters, and outgoing skill damage it lets us adjust. server.js adds the
// turn boundaries (onTurnStart / onTurnEnd) and battle setup (initBattle). Ordinary
// matches never reach this file.
//
// Per-battle memory lives in match.towerEncounter.augments (saved with the match), so a
// server restart mid-battle keeps once-per-battle flags and stacks.
//
// Rules shared by every effect here:
//  - damage and healing created by an augment carry context.towerAugment and never trigger
//    other augments (no echo of an echo, no lifesteal from self-damage);
//  - "piercing" ignores damage reduction; "affliction" ignores reduction and destructible
//    defense; augment hits on enemies skip invulnerable targets unless the effect says it
//    ignores invulnerability;
//  - random choices are seeded by the match id and a label, and saved once rolled.

const battleLogic = require('../../battleLogic');
const { AUGMENTS } = require('./towerAugments');
const { RECIPES } = require('./towerFusions');
const { CHARACTER_AUGMENTS } = require('./towerCharacterAugments');
const characterEffects = require('./towerCharacterAugmentEffects');

const CHAKRA_TYPES = ['taijutsu', 'ninjutsu', 'genjutsu', 'bloodline'];
const CODE_BY_KEY = new Map([
    ...AUGMENTS.map((entry) => [entry.id, entry.code]),
    ...RECIPES.map((recipe) => [recipe.resultId, recipe.id]),
    ...CHARACTER_AUGMENTS.map((entry) => [entry.id, entry.code]),
]);

// ---------------------------------------------------------------- seeded rolls
const hash = (text) => {
    let value = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
        value ^= text.charCodeAt(index);
        value = Math.imul(value, 16777619);
    }
    return value >>> 0;
};
const roll = (match, label) => {
    let t = (hash(`${match.matchId || 'tower'}:${label}`) + 0x6D2B79F5) >>> 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = (match, label, items) => (items.length ? items[Math.floor(roll(match, label) * items.length)] : null);

// ---------------------------------------------------------------- state and lookups
const stateOf = (match) => match?.towerEncounter?.augments || null;
const has = (state, code) => Boolean(state?.codes?.includes(code));
const unitMemo = (state, username, slot) => {
    state.units = state.units || {};
    const key = `${username}:${slot}`;
    state.units[key] = state.units[key] || {};
    return state.units[key];
};
const team = (match, username) => (Array.isArray(match.board?.[username]) ? match.board[username] : []);
const living = (match, username) => team(match, username)
    .map((unit, slot) => ({ unit, slot, username }))
    .filter((entry) => entry.unit && entry.unit.alive !== false && Number(entry.unit.hp) > 0);
const locate = (match, unit) => {
    for (const username of Object.keys(match.board || {})) {
        const slot = team(match, username).indexOf(unit);
        if (slot >= 0) return { unit, username, slot };
    }
    return null;
};
const turnOf = (state, username) => Number(state.turns?.[username]) || 0;
const perTurn = (state) => {
    state.perTurn = state.perTurn || {};
    return state.perTurn;
};
const once = (state, key) => {
    state.once = state.once || {};
    if (state.once[key]) return false;
    state.once[key] = true;
    return true;
};
const skillDealsDamage = (skill) => (skill?.effects || []).some((effect) =>
    (effect?.type === 'damage' || effect?.type === 'health_steal_damage') && Number(effect.amount) > 0);
// There is no Mental class: a skill written as Mental counts as Strategic.
const classKey = (entry) => { const key = String(entry).toLowerCase(); return key === 'mental' ? 'strategic' : key; };
const hasClass = (skill, name) => (skill?.classes || []).some((entry) => classKey(entry) === classKey(name));
const rawCost = (skill) => (skill?.energy || []).filter((entry) => entry && String(entry).toLowerCase() !== 'none').length;
// A skill "grants invulnerability" when it puts a helpful invulnerability status on its user
// or allies (a control effect that makes an enemy invulnerable, like Water Prison, does not).
const skillGrantsInvulnerability = (skill) => (skill?.effects || []).some((effect) => {
    const metadata = effect?.metadata || {};
    const onOwnSide = ['self', 'ally', 'all-allies', 'self-or-single-ally', 'single-ally'].includes(effect?.scope) || metadata.helpful;
    if (!onOwnSide || metadata.harmful) return false;
    return metadata.invulnerable || metadata.invulnerableToAllSkills || metadata.invulnerableToNonAffliction ||
        Object.keys(metadata).some((key) => key.startsWith('invulnerableTo'));
});
const isStunArgs = (args, fullOnly = false) => {
    const metadata = args?.metadata || {};
    if (args?.statusId === 'stunned' || metadata.cannotUseSkills) return true;
    if (fullOnly) return false;
    return Boolean(metadata.cannotUseHarmfulSkills || metadata.cannotUseHelpfulSkills ||
        (Array.isArray(metadata.cannotUseSkillClasses) && metadata.cannotUseSkillClasses.length));
};
const BOOST_KEYS = ['damageBonusFlat', 'nonAfflictionDamageBonusFlat', 'damageBonusBySkillClass', 'damageReductionFlat',
    'damageReductionPercent', 'unpierceableDamageReductionFlat', 'destructibleDefensePoints'];

// ---------------------------------------------------------------- actions
const gainChakra = (match, state, amount, label, exclude = null) => {
    const pool = match.chakraPools?.[state.player];
    if (!pool) return;
    for (let index = 0; index < amount; index += 1) {
        const options = CHAKRA_TYPES.filter((type) => type !== exclude);
        const type = pick(match, `${label}:${state.rolls = (state.rolls || 0) + 1}`, options);
        pool[type] = (Number(pool[type]) || 0) + 1;
    }
};
const loseChakra = (match, state, amount, label) => {
    const pool = match.chakraPools?.[state.player];
    if (!pool) return;
    for (let index = 0; index < amount; index += 1) {
        const held = CHAKRA_TYPES.filter((type) => (Number(pool[type]) || 0) > 0);
        if (!held.length) return;
        const type = pick(match, `${label}:${state.rolls = (state.rolls || 0) + 1}`, held);
        pool[type] -= 1;
    }
};

// Applies an augment status. Own-team statuses are fresh while that team is acting, so a
// "1 turn" boon lasts through the enemy's next turn like a skill's would.
const applyAugmentStatus = (match, state, { username, slot, unit }, code, statusId, duration, metadata) => {
    if (!unit || unit.alive === false) return null;
    const unitState = unit.state;
    unitState.statuses = (unitState.statuses || []).filter((status) => status?.id !== statusId);
    battleLogic.applyStatus({
        targetState: unitState,
        statusId,
        duration,
        sourceSkillId: null,
        sourceUsername: state.player,
        sourceSlot: username === state.player ? slot : null,
        metadata: {
            helpful: username === state.player,
            harmful: username !== state.player,
            fromPassive: username === state.player,
            towerScroll: code,
            towerNoHook: true,
            sourceSkillName: AUGMENT_NAMES.get(code) || code,
            ...metadata,
        },
        fresh: username === match.currentTurn,
    });
    return unitState.statuses.find((status) => status?.id === statusId) || null;
};
const removeStatus = (unit, statusId) => {
    if (unit?.state?.statuses) unit.state.statuses = unit.state.statuses.filter((status) => status?.id !== statusId);
};
const statusOn = (unit, statusId) => (unit?.state?.statuses || []).find((status) => status?.id === statusId) || null;

// A permanent per-unit status whose numeric metadata the augment rewrites (growing stacks).
const setStackStatus = (match, state, entry, code, statusId, metadata, tooltipText) => {
    let status = statusOn(entry.unit, statusId);
    if (!status) status = applyAugmentStatus(match, state, entry, code, statusId, 99, { permanent: true, cannotBeCleansed: true });
    if (!status) return;
    status.remainingTurns = 99;
    status.metadata = { ...status.metadata, ...metadata, tooltipText };
};

const AUGMENT_NAMES = new Map([
    ...AUGMENTS.map((entry) => [entry.code, entry.name]),
    ...RECIPES.map((recipe) => [recipe.id, recipe.name]),
    ...CHARACTER_AUGMENTS.map((entry) => [entry.code, entry.name]),
]);

// Damage from an augment. target: { unit, username, slot }.
const strike = (match, state, target, amount, { sourceSlot = null, piercing = false, affliction = false,
    ignoreInvulnerability = false, ignoreDefense = false, label = 'Tower augment' } = {}) => {
    if (!target?.unit || target.unit.alive === false || amount <= 0) return 0;
    if (!ignoreInvulnerability && target.username !== state.player &&
        battleLogic.isUnitInvulnerableForSkill(target.unit, affliction ? ['Affliction'] : [])) return 0;
    // Augment damage is always the player's own (self-inflicted on their ninjas).
    return battleLogic.applyDamageToUnit(target.unit, Math.floor(amount), {
        match,
        sourceUsername: state.player,
        sourceSlot,
        targetUsername: target.username,
        targetSlot: target.slot,
        afflictionDamage: affliction,
        ignoreDamageReduction: piercing || affliction,
        ignoreDestructibleDefense: affliction || ignoreDefense,
        skipDamageReflection: true,
        towerAugment: true,
        damageDebugReason: label,
    });
};
const heal = (unit, amount) => {
    if (!unit || unit.alive === false || amount <= 0) return 0;
    const before = Number(unit.hp) || 0;
    state_heal_guard.active = true;
    try { battleLogic.applyHealToUnit(unit, Math.floor(amount)); } finally { state_heal_guard.active = false; }
    return (Number(unit.hp) || 0) - before;
};
const state_heal_guard = { active: false };
const healthLoss = (match, state, entry, amount) => {
    if (!entry?.unit || entry.unit.alive === false || amount <= 0) return;
    battleLogic.applyDamageToUnit(entry.unit, amount, {
        match, sourceUsername: entry.username, sourceSlot: entry.slot, targetUsername: entry.username, targetSlot: entry.slot,
        ignoreDamageReduction: true, ignoreDestructibleDefense: true, skipDamageReflection: true, towerAugment: true,
        damageDebugReason: 'Tower augment health loss',
    });
};
const addDefense = (match, state, entry, code, points) => {
    const statusId = `tower_aug_${code.toLowerCase()}_dd`;
    const existing = statusOn(entry.unit, statusId);
    const current = existing ? Math.max(0, Number(existing.metadata?.destructibleDefensePoints) || 0) : 0;
    const status = applyAugmentStatus(match, state, entry, code, statusId, 99, {
        destructibleDefensePoints: current + points, activeOnlyWithDestructibleDefense: true,
        tooltipText: `${AUGMENT_NAMES.get(code)}: destructible defense.`,
    });
    return status;
};
const reduceCooldown = (unit, amount, { exclude = null, skipInvulnerability = false, characters = null } = {}) => {
    const cooldowns = unit?.state?.cooldowns;
    if (!cooldowns) return null;
    const skills = characters?.[unit.rosterIndex]?.skills || [];
    const candidates = Object.keys(cooldowns)
        .filter((id) => id !== exclude && (Number(cooldowns[id]) || 0) > 0)
        .filter((id) => !skipInvulnerability || !skillGrantsInvulnerability(skills.find((skill) => skill?.id === id)))
        .sort((left, right) => cooldowns[right] - cooldowns[left] || left.localeCompare(right));
    if (!candidates.length) return null;
    cooldowns[candidates[0]] = Math.max(0, cooldowns[candidates[0]] - amount);
    return candidates[0];
};

let charactersRef = null;

// ---------------------------------------------------------------- battle setup
// setup: the battle setup built by towerRun.buildBattleSetup. Called by server.js once the
// match document exists, before the player's first turn.
const initBattle = (match, { username, botUsername, setup, characters = null }) => {
    if (characters) charactersRef = characters;
    const owned = [...new Set((setup.team || []).flatMap((member) => (member.dead ? [] : member.scrolls || [])))];
    const codes = owned.map((key) => CODE_BY_KEY.get(key)).filter(Boolean);
    const state = {
        player: username,
        enemy: botUsername,
        codes,
        ninja: (setup.team || []).map((member) => (member.scrolls || []).map((key) => CODE_BY_KEY.get(key)).filter(Boolean)),
        turns: {},
        once: {},
        units: {},
        counters: {},
        perTurn: {},
    };
    match.towerEncounter = match.towerEncounter || {};
    match.towerEncounter.augments = state;
    const allies = living(match, username);
    allies.forEach((entry) => {
        if (has(state, 'A001')) applyAugmentStatus(match, state, entry, 'A001', 'tower_aug_a001_discount', 99,
            { towerCostDiscount: { amount: 1, minTotal: 2 }, tooltipText: 'Chakra Efficiency: your first skill costing 2 or more costs 1 less random chakra.' });
        if (has(state, 'A017')) applyAugmentStatus(match, state, entry, 'A017', 'tower_aug_a017_discount', 99,
            { towerCostDiscount: { amount: 1, minTotal: 2, skillClassesAny: ['Strategic'], requireRandom: true, excludeSkillIds: [] },
                tooltipText: 'Strategic Clarity: each Strategic skill costs 1 less random chakra the first time it is used.' });
        if (has(state, 'A053')) applyAugmentStatus(match, state, entry, 'A053', 'tower_aug_a053_discount', 99,
            { towerCostDiscount: { amount: 1, minTotal: 2, fallbackSpecific: true },
                tooltipText: 'Infinite Chakra: this ninja\'s skill each turn costs 1 less chakra (minimum 1).' });
        if (has(state, 'F01')) applyAugmentStatus(match, state, entry, 'F01', 'tower_aug_f01_discount', 99,
            { towerCostDiscount: { amount: 1, minTotal: 2, skillClassesAny: ['Chakra'] },
                tooltipText: 'Perfect Channeling: Chakra skills costing 2 or more cost 1 less random chakra and deal 10 additional damage.' });
        if (has(state, 'A060')) armCounter(match, state, entry, 'A060');
        if (has(state, 'A065')) armCounter(match, state, entry, 'A065');
        if (has(state, 'A032') && battleLogicDefense(entry.unit) > 0) sandArmor(match, state, entry);
    });
    if (has(state, 'A072')) {
        const boon = pick(match, 'a072', ['damage', 'reduction', 'healing']);
        state.choices = { ...(state.choices || {}), A072: boon };
        allies.forEach((entry) => applyAugmentStatus(match, state, entry, 'A072', 'tower_aug_a072', 99, {
            permanent: true, cannotBeCleansed: true,
            ...(boon === 'damage' ? { towerDirectDamagePercent: 25, tooltipText: 'Forbidden Experimentation: +25% direct damage.' }
                : boon === 'reduction' ? { damageReductionFlat: 15, tooltipText: 'Forbidden Experimentation: 15 damage reduction.' }
                    : { turnEndHealFlat: 10, tooltipText: 'Forbidden Experimentation: heals 10 health at the end of each turn.' }),
        }));
    }
    if (has(state, 'A061')) allies.forEach((entry) => applyAugmentStatus(match, state, entry, 'A061', 'tower_aug_a061', 99, {
        permanent: true, cannotBeCleansed: true, damageBonusPerDeadAlly: { amount: 15, skillClassesAny: [] },
        tooltipText: 'The Will of Fire: +15 damage and 10 damage reduction for each fallen ally.',
    }));
    refreshLastStand(match, state);
    characterEffects.initBattle(kit, match, state);
    onTurnStart(match, username);
    return state;
};
const battleLogicDefense = (unit) => (unit?.state?.statuses || []).reduce((sum, status) =>
    ((Number(status?.remainingTurns) || 0) > 0 ? sum + Math.max(0, Number(status?.metadata?.destructibleDefensePoints) || 0) : sum), 0);

const armCounter = (match, state, entry, code) => applyAugmentStatus(match, state, entry, code, `tower_aug_${code.toLowerCase()}_counter`, 99, {
    counterOnEnemySkillTargetingSelf: true,
    triggerOnEnemyHarmfulSkill: true,
    invisible: true,
    hideTooltipFromEnemy: true,
    ...(code === 'A065' ? { statusGroupId: 'tower_aug_a065', removeStatusGroupIdOnTrigger: 'tower_aug_a065' } : {}),
    tooltipText: code === 'A065'
        ? 'Kotoamatsukami: the first harmful skill an enemy uses on your team is countered and its user is stunned.'
        : 'Flying Thunder God: the next harmful skill targeting this ninja is countered (re-arms every 3 turns).',
});

const sandArmor = (match, state, entry) => applyAugmentStatus(match, state, entry, 'A032', 'tower_aug_a032', 1, {
    damageReductionFlat: 10, tooltipText: 'Sand Armor: 10 damage reduction.',
});

// The Last Stand: 20 damage reduction while one ninja stands.
const refreshLastStand = (match, state) => {
    if (!has(state, 'A070')) return;
    const allies = living(match, state.player);
    team(match, state.player).forEach((unit) => removeStatus(unit, 'tower_aug_a070'));
    if (allies.length === 1) {
        applyAugmentStatus(match, state, allies[0], 'A070', 'tower_aug_a070', 99, {
            permanent: true, damageReductionFlat: 20, tooltipText: 'The Last Stand: +50% direct damage, 20 damage reduction, heals 10 each turn.',
        });
    }
};

// ---------------------------------------------------------------- turn boundaries
const onTurnStart = (match, username) => {
    const state = stateOf(match);
    if (!state) return;
    state.turns = state.turns || {};
    state.turns[username] = turnOf(state, username) + 1;
    state.perTurn = {};
    if (username !== state.player) return;
    const turn = turnOf(state, username);
    const allies = () => living(match, state.player);
    // Delayed revives (Edo Tensei, Impure Resurrection).
    (state.pendingRevives || []).filter((entry) => entry.turn <= turn).forEach((entry) => {
        const unit = team(match, state.player)[entry.slot];
        if (!unit || unit.alive !== false) return;
        battleLogic.reviveUnitToHp(unit, entry.hp);
        if (entry.maxHpLoss) {
            unit.hpCap = Math.max(1, (Number(unit.hpCap) || 100) - entry.maxHpLoss);
            unit.hp = Math.min(unit.hp, unit.hpCap);
        }
        refreshLastStand(match, state);
    });
    state.pendingRevives = (state.pendingRevives || []).filter((entry) => entry.turn > turn);
    if (has(state, 'A057') && turn === 4 && once(state, 'A057')) {
        living(match, state.enemy).forEach((entry) => applyAugmentStatus(match, state, entry, 'A057', 'tower_aug_a057_stun', 1, {
            cannotUseSkills: true, towerNoExtend: true, tooltipText: 'Infinite Tsukuyomi: stunned.',
        }));
    }
    if (has(state, 'A063') && turn % 3 === 0) {
        gainChakra(match, state, 2, `a063:${turn}`);
        allies().forEach((entry) => heal(entry.unit, 10));
    }
    if (has(state, 'F17')) gainChakra(match, state, 2, `f17:${turn}`);
    if (has(state, 'A064')) allies().forEach((entry) => heal(entry.unit, Number(entry.unit.hp) < 30 ? 20 : 10));
    if (has(state, 'A070') && allies().length === 1) heal(allies()[0].unit, 10);
    if (has(state, 'F18') && allies().length === 1) {
        const boon = pick(match, `f18:${turn}`, ['damage', 'reduction', 'recovery']);
        const entry = allies()[0];
        removeStatus(entry.unit, 'tower_aug_f18');
        if (boon === 'recovery') heal(entry.unit, 20);
        else applyAugmentStatus(match, state, entry, 'F18', 'tower_aug_f18', 1, boon === 'damage'
            ? { nonAfflictionDamageBonusFlat: 40, tooltipText: 'Undying Legend: +40 direct damage this turn.' }
            : { damageReductionFlat: 30, tooltipText: 'Undying Legend: 30 damage reduction this turn.' });
    }
    if (has(state, 'A085')) {
        if (roll(match, `a085:${turn}`) < 0.5) gainChakra(match, state, 2, `a085c:${turn}`);
        else {
            const victim = pick(match, `a085v:${turn}`, allies());
            if (victim) strike(match, state, victim, 15, { piercing: true, ignoreInvulnerability: true, label: 'The Gambler' });
        }
    }
    if (has(state, 'A089') && turn % 3 === 0) {
        const boon = pick(match, `a089:${turn}`, ['damage', 'reduction', 'defense']);
        allies().forEach((entry) => {
            if (boon === 'defense') addDefense(match, state, entry, 'A089', 15);
            else applyAugmentStatus(match, state, entry, 'A089', 'tower_aug_a089', 2, boon === 'damage'
                ? { nonAfflictionDamageBonusFlat: 10, tooltipText: 'Unstable Evolution: +10 direct damage.' }
                : { damageReductionFlat: 10, tooltipText: 'Unstable Evolution: 10 damage reduction.' });
        });
    }
    if (has(state, 'A081')) {
        const type = pick(match, `a081:${turn}`, CHAKRA_TYPES);
        state.choices = { ...(state.choices || {}), A081: type };
        allies().forEach((entry) => applyAugmentStatus(match, state, entry, 'A081', 'tower_aug_a081', 1, {
            towerCostDiscount: { amount: 1, minTotal: 2, chakraType: type },
            tooltipText: `Chakra Roulette: skills costing ${type} chakra cost 1 less ${type} this turn (minimum 1 total).`,
        }));
    }
    if (has(state, 'A060')) {
        allies().forEach((entry) => {
            const memo = unitMemo(state, entry.username, entry.slot);
            if (memo.a060Rearm && turn >= memo.a060Rearm && !statusOn(entry.unit, 'tower_aug_a060_counter')) {
                armCounter(match, state, entry, 'A060');
                memo.a060Rearm = null;
            }
        });
    }
};

const onTurnEnd = (match, username) => {
    const state = stateOf(match);
    if (!state || username !== state.player) return;
    const turn = turnOf(state, username);
    const hitEnemies = new Set(Object.keys(perTurn(state).hitEnemies || {}));
    // Consecutive-turn pressure on enemies.
    team(match, state.enemy).forEach((unit, slot) => {
        const memo = unitMemo(state, state.enemy, slot);
        const hit = hitEnemies.has(String(slot));
        memo.streak = hit ? (Number(memo.streak) || 0) + 1 : 0;
        if (has(state, 'A050')) memo.pressure = hit ? Math.min(3, Math.max(0, memo.streak - 1)) : 0;
        if (has(state, 'F12')) memo.pursuit = hit ? Math.min(4, Math.max(0, memo.streak - 1)) : 0;
        if (has(state, 'A091') && hit && unit && unit.alive !== false) {
            memo.deathMark = (Number(memo.deathMark) || 0) + 1;
            if (memo.deathMark >= 3) {
                memo.deathMark = 0;
                strike(match, state, { unit, username: state.enemy, slot }, 30, { piercing: true, label: 'Death Mark' });
            }
        } else if (!hit) memo.deathMark = 0;
    });
    living(match, state.player).forEach((entry) => {
        const memo = unitMemo(state, entry.username, entry.slot);
        if (has(state, 'A047') && !memo.damagedSinceTurnEnd) heal(entry.unit, 5);
        memo.damagedSinceTurnEnd = false;
        if (has(state, 'A082') && (Number(memo.cursedStacks) || 0) > 0) {
            strike(match, state, entry, 5, { affliction: true, ignoreInvulnerability: true, label: 'Cursed Seal' });
        }
        if (has(state, 'F19')) healthLoss(match, state, entry, 10);
        if (has(state, 'F17')) healthLoss(match, state, entry, 5);
        if (memo.lastBreathUntil && turn >= memo.lastBreathUntil) {
            memo.lastBreathUntil = null;
            if (entry.unit.alive !== false && Number(entry.unit.hp) <= 1) {
                entry.unit.hp = 0;
                entry.unit.alive = false;
            }
        }
    });
    if (has(state, 'F17')) loseChakra(match, state, 1, `f17l:${turn}`);
};

// ---------------------------------------------------------------- skill events
let openAction = null;

const beforeSkill = ({ match, actingUsername, actorSlot, skill, paidChakraCount, cost, isAutoCast, characters, targetSelection }) => {
    const state = stateOf(match);
    if (!state) return null;
    if (characters) charactersRef = characters;
    const action = {
        match, state, actingUsername, actorSlot, skill, paid: Math.max(0, Number(paidChakraCount) || 0), cost,
        isAutoCast, targetSelection: Array.isArray(targetSelection) ? targetSelection : [], hits: new Map(), heals: [], soul: [],
        defenseBefore: team(match, state.player).map((unit) => battleLogicDefense(unit)),
    };
    characterEffects.beforeSkill(kit, action);
    openAction = action;
    return action;
};

// Damage this skill dealt per target, built from the onDamage events recorded while it ran.
const recordHit = (action, target, event) => {
    const key = `${target.username}:${target.slot}`;
    const entry = action.hits.get(key) || { ...target, raw: 0, dealt: 0, absorbed: 0, direct: 0, affliction: 0 };
    entry.raw += Math.max(0, Number(event.rawAmount) || 0);
    entry.dealt += Math.max(0, Number(event.dealt) || 0);
    entry.absorbed += Math.max(0, (event.ddBefore || 0) - (event.ddAfter || 0));
    if (event.affliction) entry.affliction += event.dealt;
    else entry.direct += event.dealt;
    entry.rawDirect = (entry.rawDirect || 0) + (event.affliction ? 0 : Math.max(0, Number(event.rawAmount) || 0));
    action.hits.set(key, entry);
};

const afterSkill = (action) => {
    if (openAction === action) openAction = null;
    const { match, state, actingUsername, actorSlot, skill } = action;
    if (!state) return;
    const actorUnit = team(match, actingUsername)[actorSlot];
    const actor = { unit: actorUnit, username: actingUsername, slot: actorSlot };
    const memo = unitMemo(state, actingUsername, actorSlot);
    const turnState = perTurn(state);
    const hits = [...action.hits.values()];
    const enemyHits = hits.filter((hit) => hit.username !== actingUsername && (hit.dealt > 0 || hit.absorbed > 0));
    const directHits = enemyHits.filter((hit) => hit.direct > 0 || hit.rawDirect > 0);
    const damaging = enemyHits.length > 0;
    const direct = directHits.length > 0;
    const enemyTeam = actingUsername === state.player ? state.enemy : state.player;

    if (actingUsername !== state.player) {
        // Enemy skills: costs they paid, and Soul Link's redistributed damage.
        if (has(state, 'A069') && action.paid >= 2 && !turnState.a069) {
            turnState.a069 = true;
            gainChakra(match, state, 1, `a069:${turnOf(state, actingUsername)}`);
        }
        if (has(state, 'A095') && action.paid > 0 && actorUnit && actorUnit.alive !== false) {
            turnState.a095 = turnState.a095 || {};
            const spent = Math.min(15 - (turnState.a095[actorSlot] || 0), action.paid * 5);
            if (spent > 0) {
                turnState.a095[actorSlot] = (turnState.a095[actorSlot] || 0) + spent;
                strike(match, state, actor, spent, { affliction: true, label: 'Chakra Burn' });
            }
        }
        action.soul.forEach(({ recipientSlot, amount }) => {
            const others = living(match, state.player).filter((entry) => entry.slot !== recipientSlot);
            if (!others.length) return;
            const share = Math.floor(amount / others.length);
            others.forEach((entry) => strike(match, state, entry, share, { piercing: true, ignoreDefense: true, ignoreInvulnerability: true, label: 'Soul Link' }));
        });
        characterEffects.afterSkill(kit, action, { enemyHits, directHits, ownTurn: turnOf(state, state.player) });
        return;
    }
    if (!actorUnit) return;
    const physical = hasClass(skill, 'physical');
    const chakra = hasClass(skill, 'chakra');
    const strategic = hasClass(skill, 'strategic');
    const ownTurn = turnOf(state, state.player);

    // Costs and spending.
    if (has(state, 'A001') && rawCost(skill) >= 2 && once(state, 'A001')) {
        team(match, state.player).forEach((unit) => removeStatus(unit, 'tower_aug_a001_discount'));
    }
    if (has(state, 'A017') && strategic && (skill.energy || []).some((type) => String(type).toLowerCase() === 'random')) {
        const status = statusOn(actorUnit, 'tower_aug_a017_discount');
        const discount = status?.metadata?.towerCostDiscount;
        if (discount && !discount.excludeSkillIds.includes(skill.id)) discount.excludeSkillIds.push(skill.id);
    }
    turnState.spent = (turnState.spent || 0) + action.paid;
    if (has(state, 'A011') && turnState.spent >= 3 && once(state, 'A011')) gainChakra(match, state, 1, 'a011');
    if (has(state, 'A079') && turnState.spent >= 5 && !turnState.a079) {
        turnState.a079 = true;
        gainChakra(match, state, 2, `a079:${ownTurn}`);
    }
    if (has(state, 'F13') && turnState.spent >= 3 && !turnState.f13) {
        turnState.f13 = true;
        gainChakra(match, state, 1, `f13:${ownTurn}`);
        const target = pick(match, `f13t:${ownTurn}`, living(match, enemyTeam));
        if (target) strike(match, state, target, 10, { piercing: true, label: 'Chakra Reactor' });
    }
    if (has(state, 'A031') && !turnState.a031) {
        turnState.byType = turnState.byType || {};
        Object.entries(action.cost?.reservedSpecific || {}).forEach(([type, amount]) => {
            turnState.byType[type] = (turnState.byType[type] || 0) + (Number(amount) || 0);
        });
        const doubled = Object.keys(turnState.byType).find((type) => turnState.byType[type] >= 2);
        if (doubled) {
            turnState.a031 = true;
            gainChakra(match, state, 1, `a031:${ownTurn}`, doubled);
        }
    }
    if (has(state, 'A090') && !turnState.a090) {
        turnState.classes = turnState.classes || {};
        if (physical) turnState.classes.physical = true;
        if (chakra) turnState.classes.chakra = true;
        if (strategic) turnState.classes.strategic = true;
        if (turnState.classes.physical && turnState.classes.chakra && turnState.classes.strategic) {
            turnState.a090 = true;
            gainChakra(match, state, 2, `a090:${ownTurn}`);
        }
    }
    if (has(state, 'A037') && action.paid >= 3) {
        const target = pick(match, `a037:${ownTurn}:${actorSlot}`, living(match, enemyTeam));
        if (target) strike(match, state, target, 10, { piercing: true, label: 'Chakra Overload' });
    }

    // Non-damaging skills.
    if (!skillDealsDamage(skill)) {
        if (has(state, 'A007')) applyAugmentStatus(match, state, actor, 'A007', 'tower_aug_a007', 1, {
            damageReductionFlat: 5, tooltipText: 'Defensive Stance: 5 damage reduction.' });
        if (has(state, 'F06')) applyAugmentStatus(match, state, actor, 'F06', 'tower_aug_f06', 1, {
            damageReductionFlat: Number(actorUnit.hp) < 50 ? 15 : 10, tooltipText: 'Defensive Discipline: damage reduction.' });
    }

    // Growth on damaging skills.
    const grow = (code, statusId, step, max, key, tooltip, { consecutive = false } = {}) => {
        if (!has(state, code)) return;
        if (!damaging) {
            if (consecutive) { memo[key] = 0; memo[`${key}Turn`] = null; }
        } else if (consecutive) {
            // Consecutive own turns build the bonus; a gap starts it over.
            memo[key] = memo[`${key}Turn`] === ownTurn - 1 ? Math.min(max, (memo[key] || 0) + step) : 0;
            memo[`${key}Turn`] = ownTurn;
        } else {
            memo[key] = Math.min(max, (memo[key] || 0) + step);
        }
        setStackStatus(match, state, actor, code, statusId, { nonAfflictionDamageBonusFlat: memo[key] || 0 },
            `${AUGMENT_NAMES.get(code)}: +${memo[key] || 0} direct damage.`);
    };
    grow('A028', 'tower_aug_a028', 5, 20, 'relentless', '', { consecutive: true });
    grow('F08', 'tower_aug_f08', 5, 25, 'crimsonRhythm', '', { consecutive: true });
    grow('F19', 'tower_aug_f19', 10, 30, 'crimsonGate', '');
    grow('A082', 'tower_aug_a082', 5, 30, 'cursedStacks', '');
    if (has(state, 'A097') && chakra) {
        state.counters.elemental = Math.min(30, (state.counters.elemental || 0) + 5);
        living(match, state.player).forEach((entry) => setStackStatus(match, state, entry, 'A097', 'tower_aug_a097',
            { damageBonusBySkillClass: { Chakra: state.counters.elemental } }, `Elemental Mastery: Chakra skills deal +${state.counters.elemental} damage.`));
    }

    // Damage-over-time on hits.
    if (has(state, 'A013') && physical && damaging && !memo.a013) {
        memo.a013 = true;
        enemyHits.forEach((hit) => applyAugmentStatus(match, state, hit, 'A013', 'tower_aug_a013_poison', 2, {
            afflictionDamage: true, turnEndDamage: 5, tooltipText: 'Poisoned Weapons: 5 affliction damage each turn.' }));
    }
    if (has(state, 'F04') && physical && direct) {
        directHits.forEach((hit) => applyAugmentStatus(match, state, hit, 'F04', 'tower_aug_f04_poison', 2, {
            afflictionDamage: true, turnEndDamage: 5, tooltipText: 'Venomcraft: 5 affliction damage each turn.' }));
    }

    // Echoes: damage only, never statuses or triggers.
    const echo = (hit, percent, target = hit, label) => {
        const amount = Math.floor((hit.rawDirect || hit.raw) * percent / 100);
        if (amount > 0) strike(match, state, target, amount, { sourceSlot: actorSlot, label });
    };
    if (has(state, 'A023') && damaging && !memo.a023) {
        memo.a023 = true;
        enemyHits.forEach((hit) => echo({ ...hit, rawDirect: hit.raw }, 50, hit, 'Shadow Clone Training'));
    }
    if (has(state, 'A076') && direct && (!memo.a076Next || ownTurn >= memo.a076Next)) {
        memo.a076Next = ownTurn + 3;
        const target = pick(match, `a076:${ownTurn}:${actorSlot}`, living(match, enemyTeam));
        if (target) echo(directHits[0], 50, target, 'Shadow Clone Army');
    }
    if (has(state, 'A083') && chakra) {
        state.counters.doubleCast = (state.counters.doubleCast || 0) + 1;
        if (state.counters.doubleCast % 3 === 0) directHits.forEach((hit) => echo(hit, 50, hit, 'Double Casting'));
    }
    if (has(state, 'F15') && direct && !turnState.f15) {
        const focused = directHits.find((hit) => (turnState.focus?.[hit.slot] || []).some((slot) => slot !== actorSlot));
        if (focused) {
            turnState.f15 = true;
            const target = pick(match, `f15:${ownTurn}`, living(match, enemyTeam).filter((entry) => entry.slot !== focused.slot));
            if (target) echo(focused, 50, target, 'Thousand Shadows');
        }
    }
    if (direct) {
        directHits.forEach((hit) => {
            turnState.focus = turnState.focus || {};
            turnState.focus[hit.slot] = [...new Set([...(turnState.focus[hit.slot] || []), actorSlot])];
        });
    }

    // Team skill counters.
    if (damaging) {
        state.counters.damaging = (state.counters.damaging || 0) + 1;
        if (has(state, 'A024') && state.counters.damaging % 3 === 0) {
            living(match, enemyTeam).forEach((entry) => strike(match, state, entry, 10, { sourceSlot: actorSlot, label: 'Explosive Tags' }));
        }
        if (has(state, 'A066') && state.counters.damaging % 4 === 0) {
            strike(match, state, enemyHits[0], 30, { sourceSlot: actorSlot, piercing: true, label: "Indra's Wrath" });
        }
    }
    if (direct) {
        state.counters.direct = (state.counters.direct || 0) + 1;
        if (has(state, 'F09') && state.counters.direct % 3 === 0) {
            living(match, enemyTeam).forEach((entry) => strike(match, state, entry, 15, { sourceSlot: actorSlot, label: 'Storm of Paper' }));
        }
        turnState.directSkills = (turnState.directSkills || 0) + 1;
        if (has(state, 'F20') && turnState.directSkills >= 2 && !turnState.f20) {
            turnState.f20 = true;
            const boon = pick(match, `f20:${ownTurn}`, ['damage', 'reduction', 'healing']);
            living(match, state.player).forEach((entry) => {
                removeStatus(entry.unit, 'tower_aug_f20');
                applyAugmentStatus(match, state, entry, 'F20', 'tower_aug_f20', 1, boon === 'damage'
                    ? { nonAfflictionDamageBonusFlat: 15, tooltipText: 'Mutation Protocol: +15 direct damage.' }
                    : boon === 'reduction' ? { damageReductionFlat: 15, tooltipText: 'Mutation Protocol: 15 damage reduction.' }
                        : { turnEndHealFlat: 10, tooltipText: 'Mutation Protocol: heals 10 at the end of the turn.' });
            });
        }
    }

    // Cooldowns.
    if (has(state, 'A026') && Number(skill.cooldown) >= 3 && !skillGrantsInvulnerability(skill)) {
        const cooldowns = actorUnit.state?.cooldowns || {};
        [skill.id, skill.baseSkillId].filter(Boolean).forEach((id) => {
            if ((Number(cooldowns[id]) || 0) > 0) cooldowns[id] -= 1;
        });
    }

    // Secondary hits.
    if (has(state, 'A027') && chakra && direct && !(turnState.a027 || {})[actorSlot]) {
        turnState.a027 = { ...(turnState.a027 || {}), [actorSlot]: true };
        const struck = new Set(directHits.map((hit) => hit.slot));
        const target = pick(match, `a027:${ownTurn}:${actorSlot}`, living(match, enemyTeam).filter((entry) => !struck.has(entry.slot)));
        if (target) strike(match, state, target, 10, { sourceSlot: actorSlot, label: 'Chain Lightning' });
    }
    if (has(state, 'A049')) {
        enemyHits.forEach((hit) => {
            const enemyMemo = unitMemo(state, hit.username, hit.slot);
            if (hit.unit.alive !== false && Number(hit.unit.hp) <= 10 && !enemyMemo.a049) {
                enemyMemo.a049 = true;
                strike(match, state, hit, 5, { sourceSlot: actorSlot, piercing: true, label: 'Unfinished Business' });
            }
        });
    }

    // Defense.
    if (has(state, 'A084') && directHits.reduce((sum, hit) => sum + hit.direct + hit.absorbed, 0) >= 25) {
        addDefense(match, state, actor, 'A084', 10);
    }
    if (has(state, 'A032')) {
        team(match, state.player).forEach((unit, slot) => {
            if (unit && unit.alive !== false && battleLogicDefense(unit) > (action.defenseBefore[slot] || 0)) {
                sandArmor(match, state, { unit, username: state.player, slot });
            }
        });
    }

    // Heals this skill restored to allies.
    const allyHeals = action.heals.filter((entry) => entry.amount > 0);
    allyHeals.forEach((healed) => {
        if (healed.slot !== actorSlot) {
            if (has(state, 'A039')) {
                addDefense(match, state, actor, 'A039', 10);
                addDefense(match, state, healed, 'A039', 10);
            }
            if (has(state, 'F10')) {
                addDefense(match, state, actor, 'F10', 15);
                addDefense(match, state, healed, 'F10', 15);
            }
        }
        if (has(state, 'A067')) {
            living(match, state.player).filter((entry) => entry.slot !== healed.slot)
                .forEach((entry) => heal(entry.unit, Math.floor(healed.amount / 2)));
        }
    });

    // Per-target memory.
    if (has(state, 'A043')) {
        memo.cuts = memo.cuts || {};
        enemyHits.forEach((hit) => {
            const entry = memo.cuts[hit.slot] || { skills: [], bonus: 0 };
            if (!entry.skills.includes(skill.id)) {
                entry.skills.push(skill.id);
                entry.bonus = Math.min(20, entry.bonus + 5);
            }
            memo.cuts[hit.slot] = entry;
        });
    }
    if (has(state, 'A034') && memo.insight && enemyHits.some((hit) => hit.slot === memo.insight.slot)) memo.insight = null;

    characterEffects.afterSkill(kit, action, { enemyHits, directHits, ownTurn });
};

// ---------------------------------------------------------------- damage events
const onDamage = (event) => {
    const { match, unit, context, dealt, hpBefore, wasAlive, ddBefore, ddAfter } = event;
    const state = stateOf(match);
    if (!state) return;
    const target = locate(match, unit);
    if (!target) return;
    const augmentDamage = Boolean(context?.towerAugment);
    const affliction = Boolean(context?.afflictionDamage) ||
        (context?.skillClasses || []).some((entry) => String(entry).toLowerCase() === 'affliction');
    const sourceUsername = context?.sourceUsername || null;
    const sourceSlot = Number.isInteger(context?.sourceSlot) ? context.sourceSlot : null;
    const fromPlayer = sourceUsername === state.player && target.username === state.enemy;
    const fromEnemy = sourceUsername === state.enemy && target.username === state.player;
    const killed = wasAlive && (unit.alive === false || Number(unit.hp) <= 0);
    const landed = dealt > 0 || (ddBefore || 0) > (ddAfter || 0);
    const turnState = perTurn(state);
    const enriched = { ...event, affliction };

    if (openAction && !augmentDamage && !context?.healthLoss && sourceUsername === openAction.actingUsername &&
        (sourceSlot === null || sourceSlot === openAction.actorSlot)) {
        recordHit(openAction, { unit, username: target.username, slot: target.slot }, enriched);
    }
    if (target.username === state.player && landed) unitMemo(state, target.username, target.slot).damagedSinceTurnEnd = true;

    if (!augmentDamage && fromPlayer && landed) {
        turnState.hitEnemies = { ...(turnState.hitEnemies || {}), [target.slot]: true };
        if (affliction) {
            if (has(state, 'A018')) {
                turnState.a018 = turnState.a018 || {};
                if (!turnState.a018[target.slot] && unit.alive !== false) {
                    turnState.a018[target.slot] = true;
                    strike(match, state, target, 5, { sourceSlot, affliction: true, label: 'Lingering Pain' });
                }
            }
            if (has(state, 'A021') && !turnState.a021) {
                turnState.a021 = true;
                gainChakra(match, state, 1, `a021:${turnOf(state, state.player)}`);
            }
            if (has(state, 'A033') && unit.alive !== false) applyAugmentStatus(match, state, target, 'A033', 'tower_aug_a033', 1, {
                healReceivedMultiplier: 0.75, tooltipText: 'Venomous Touch: healing received is reduced by 25%.' });
            if (has(state, 'F07') && !turnState.f07) {
                turnState.f07 = true;
                gainChakra(match, state, 1, `f07:${turnOf(state, state.player)}`);
                if (unit.alive !== false) applyAugmentStatus(match, state, target, 'F07', 'tower_aug_f07', 1, {
                    healReceivedMultiplier: 0.5, tooltipText: 'Parasitic Chakra: healing received is halved.' });
            }
        } else if (!context?.healthLoss && dealt > 0) {
            const attacker = Number.isInteger(sourceSlot) ? team(match, state.player)[sourceSlot] : null;
            const lifesteal = (code, percent) => {
                if (!has(state, code) || !attacker || attacker.alive === false) return;
                turnState[`${code}Heal`] = turnState[`${code}Heal`] || {};
                const room = 15 - (turnState[`${code}Heal`][sourceSlot] || 0);
                const amount = Math.min(room, Math.floor(dealt * percent / 100));
                if (amount > 0) turnState[`${code}Heal`][sourceSlot] = (turnState[`${code}Heal`][sourceSlot] || 0) + heal(attacker, amount);
            };
            lifesteal('A022', 20);
            lifesteal('F08', 20);
            lifesteal('F19', 25);
        }
        if (has(state, 'A029') && unit.alive !== false && Number(unit.hp) < 30) {
            turnState.a029 = turnState.a029 || {};
            if (!turnState.a029[target.slot]) {
                turnState.a029[target.slot] = true;
                strike(match, state, target, 10, { sourceSlot, piercing: true, label: "Executioner's Mark" });
            }
        }
        if (has(state, 'A059') && !turnState.a059 && unit.alive !== false) {
            turnState.a059 = true;
            applyAugmentStatus(match, state, target, 'A059', 'tower_aug_a059_burn', 2, {
                afflictionDamage: true, turnEndDamage: 10, tooltipText: 'Amaterasu: 10 affliction damage each turn.' });
        }
    }

    if (!augmentDamage && fromEnemy && landed) {
        const memo = unitMemo(state, target.username, target.slot);
        if (has(state, 'A034') && !memo.insightUsed && Number.isInteger(sourceSlot)) {
            memo.insightUsed = true;
            memo.insight = { slot: sourceSlot };
        }
    }

    if (target.username === state.player && !killed && unit.alive !== false) {
        const memo = unitMemo(state, target.username, target.slot);
        if (has(state, 'A030') && hpBefore >= 25 && Number(unit.hp) < 25 && once(state, 'A030')) heal(unit, 20);
        if (has(state, 'F10') && hpBefore >= 25 && Number(unit.hp) < 25 && !memo.f10) {
            memo.f10 = true;
            heal(unit, 25);
        }
        if (has(state, 'A044') && (ddBefore || 0) > 0 && (ddAfter || 0) === 0) {
            applyAugmentStatus(match, state, target, 'A044', 'tower_aug_a044', 1, {
                damageReductionFlat: 15, tooltipText: 'Resilient Defense: 15 damage reduction.' });
        }
    }

    if (killed) onDeath(match, state, target, { sourceUsername, sourceSlot });
};

// ---------------------------------------------------------------- deaths
const onDeath = (match, state, dead, killer) => {
    if (dead.username === state.player) {
        const memo = unitMemo(state, dead.username, dead.slot);
        const survivors = living(match, state.player);
        // Death prevention, in order: Izanagi (last ninja), Reverse Summoning, Last Breath.
        if (has(state, 'A054') && !survivors.length && once(state, 'A054')) {
            battleLogic.reviveUnitToHp(dead.unit, 50);
            return;
        }
        if (has(state, 'A087') && once(state, 'A087')) {
            battleLogic.reviveUnitToHp(dead.unit, 25);
            applyAugmentStatus(match, state, dead, 'A087', 'tower_aug_a087', 1, {
                banished: true, tooltipText: 'Reverse Summoning: removed from combat for 1 turn.' });
            return;
        }
        if (has(state, 'A098') && once(state, 'A098')) {
            battleLogic.reviveUnitToHp(dead.unit, 1);
            // Alive at 1 health until the end of the player's next turn.
            memo.lastBreathUntil = turnOf(state, state.player) + 1;
            return;
        }
        if (has(state, 'A062') && killer.sourceUsername === state.enemy && Number.isInteger(killer.sourceSlot) && once(state, 'A062')) {
            const enemy = team(match, state.enemy)[killer.sourceSlot];
            strike(match, state, { unit: enemy, username: state.enemy, slot: killer.sourceSlot }, 40,
                { piercing: true, ignoreInvulnerability: true, label: 'Reaper Death Seal' });
        }
        if (has(state, 'A080') && !memo.a080) {
            memo.a080 = true;
            living(match, state.enemy).forEach((entry) => strike(match, state, entry, 25,
                { piercing: true, ignoreInvulnerability: true, label: 'The Final Technique' }));
        }
        survivors.forEach((entry) => {
            if (has(state, 'A019')) addDefense(match, state, entry, 'A019', 10);
            if (has(state, 'A058')) heal(entry.unit, 25);
            if (has(state, 'A061')) {
                const status = statusOn(entry.unit, 'tower_aug_a061_dr');
                const current = Number(status?.metadata?.damageReductionFlat) || 0;
                applyAugmentStatus(match, state, entry, 'A061', 'tower_aug_a061_dr', 99, {
                    permanent: true, damageReductionFlat: current + 10, tooltipText: 'The Will of Fire: damage reduction from fallen allies.' });
            }
        });
        if (has(state, 'A058') && survivors.length) gainChakra(match, state, 1, `a058:${dead.slot}`);
        const nextTurn = turnOf(state, state.player) + 1;
        if (has(state, 'A051') && once(state, 'A051')) {
            state.pendingRevives = [...(state.pendingRevives || []), { slot: dead.slot, hp: 30, turn: nextTurn }];
        } else if (has(state, 'A071') && once(state, 'A071')) {
            state.pendingRevives = [...(state.pendingRevives || []), { slot: dead.slot, hp: 50, turn: nextTurn, maxHpLoss: 10 }];
        }
        refreshLastStand(match, state);
        return;
    }
    // An enemy died.
    if (has(state, 'A041')) living(match, state.player).forEach((entry) => reduceCooldown(entry.unit, 1));
    if (has(state, 'A074')) {
        gainChakra(match, state, 2, `a074:${dead.slot}`);
        state.counters.devoured = (state.counters.devoured || 0) + 5;
        living(match, state.player).forEach((entry) => setStackStatus(match, state, entry, 'A074', 'tower_aug_a074',
            { nonAfflictionDamageBonusFlat: state.counters.devoured }, `Chakra Devourer: +${state.counters.devoured} direct damage.`));
    }
    if (has(state, 'F16') && statusOn(dead.unit, 'tower_aug_f16_burn') && once(state, 'F16:spread')) {
        const next = pick(match, 'f16:spread', living(match, state.enemy));
        if (next) applyAugmentStatus(match, state, next, 'F16', 'tower_aug_f16_burn', 3, {
            afflictionDamage: true, turnEndDamage: 10, towerSpread: true, tooltipText: 'Infernal Nightmare: 10 affliction damage each turn.' });
    }
};

// ---------------------------------------------------------------- heals
const onHeal = ({ match, unit, rawAmount, hpBefore, hpAfter }) => {
    const state = stateOf(match);
    if (!state) return;
    const target = locate(match, unit);
    if (!target) return;
    if (target.username !== state.player) {
        if (!state_heal_guard.active) characterEffects.onEnemyHeal(kit, match, state, openAction, target, rawAmount, hpBefore);
        return;
    }
    const restored = Math.max(0, hpAfter - hpBefore);
    if (openAction && !state_heal_guard.active && openAction.actingUsername === state.player && restored > 0) {
        openAction.heals.push({ ...target, unit, amount: restored, hpBefore });
    }
    if (has(state, 'A093') && !state_heal_guard.active) {
        const cap = Number(unit.hpCap) || 100;
        const excess = Math.min(20, Math.max(0, Math.floor(rawAmount) - restored));
        if (hpAfter >= cap && excess > 0) addDefense(match, state, target, 'A093', excess);
    }
};

// ---------------------------------------------------------------- statuses
const onStatusApply = ({ match, args }) => {
    const state = stateOf(match);
    const metadata = args.metadata || {};
    if (!state || metadata.towerNoHook) return args;
    const target = (() => {
        for (const username of [state.player, state.enemy]) {
            const slot = team(match, username).findIndex((unit) => unit?.state === args.targetState);
            if (slot >= 0) return { unit: team(match, username)[slot], username, slot };
        }
        return null;
    })();
    // Statuses staged by expiring effects sit in a temporary container until merged; only
    // the source-based character hooks apply to them.
    if (!target) return characterEffects.onStatusApply(kit, match, state, args, null);
    let duration = Number(args.duration) || 0;
    const timed = duration > 0 && duration < 99 && !metadata.passive && !metadata.permanent;
    const harmful = Boolean(metadata.harmful);
    if (harmful && target.username === state.player && isStunArgs(args)) {
        const memo = unitMemo(state, target.username, target.slot);
        if (has(state, 'F11') && isStunArgs(args, true) && !memo.f11) {
            memo.f11 = true;
            return null;
        }
        if (has(state, 'A025') && !memo.a025) {
            memo.a025 = true;
            applyAugmentStatus(match, state, target, 'A025', 'tower_aug_a025', 1, {
                damageReductionFlat: 10, tooltipText: 'Unbreakable Will: 10 damage reduction.' });
            return null;
        }
        if (has(state, 'A009') && !memo.a009 && timed) {
            memo.a009 = true;
            duration -= 1;
            if (duration <= 0) return null;
        }
    }
    const fromPlayer = args.sourceUsername === state.player && Number.isInteger(args.sourceSlot);
    if (harmful && fromPlayer && target.username === state.enemy) {
        if (isStunArgs(args)) {
            const memo = unitMemo(state, state.player, args.sourceSlot);
            if (has(state, 'A040') && !memo.a040 && timed && !metadata.towerNoExtend) {
                memo.a040 = true;
                duration = Math.min(2, duration + 1);
            }
            const turnState = perTurn(state);
            if (has(state, 'A045') && !turnState.a045) {
                turnState.a045 = true;
                applyAugmentStatus(match, state, target, 'A045', 'tower_aug_a045', 1, {
                    randomCostIncrease: 1, tooltipText: 'Chakra Suppression: skills cost 1 additional random chakra.' });
            }
            if (has(state, 'F16') && isStunArgs(args, true) && once(state, 'F16')) {
                applyAugmentStatus(match, state, target, 'F16', 'tower_aug_f16_burn', 3, {
                    afflictionDamage: true, turnEndDamage: 10, tooltipText: 'Infernal Nightmare: 10 affliction damage each turn.' });
            }
        }
        if (has(state, 'A092') && timed && duration >= 2 && !metadata.towerNoExtend) duration += 1;
    }
    if (!harmful && target.username === state.player && has(state, 'A078') && timed &&
        BOOST_KEYS.some((key) => metadata[key] !== undefined) && duration < 4) {
        duration = Math.min(4, duration + 1);
    }
    const adjusted = duration === Number(args.duration) ? args : { ...args, duration };
    return characterEffects.onStatusApply(kit, match, state, adjusted, target);
};

// ---------------------------------------------------------------- counters
const onCounter = ({ match, actingUsername, actorUnit, recipient, trapStatus, skill }) => {
    const state = stateOf(match);
    if (!state || actingUsername !== state.enemy) return;
    characterEffects.onCounter(kit, match, state, trapStatus);
    const code = trapStatus?.metadata?.towerScroll;
    const actor = locate(match, actorUnit);
    const ownerSlot = Number.isInteger(trapStatus?.sourceSlot) ? trapStatus.sourceSlot : recipient?.slot;
    const owner = team(match, state.player)[ownerSlot];
    if (code === 'A065' && actor) {
        applyAugmentStatus(match, state, actor, 'A065', 'tower_aug_a065_stun', 1, {
            cannotUseSkills: true, towerNoExtend: true, tooltipText: 'Kotoamatsukami: stunned.' });
    }
    if (code === 'A060') {
        unitMemo(state, state.player, recipient.slot).a060Rearm = turnOf(state, state.player) + 3;
    }
    if (!owner || owner.alive === false) return;
    if (has(state, 'A035')) reduceCooldown(owner, 1, { characters: charactersRef });
    const turnState = perTurn(state);
    if (has(state, 'F11') && !(turnState.f11 || {})[ownerSlot]) {
        turnState.f11 = { ...(turnState.f11 || {}), [ownerSlot]: true };
        reduceCooldown(owner, 1, { skipInvulnerability: true, characters: charactersRef });
    }
    if (has(state, 'A088') && actor && skillDealsDamage(skill)) {
        const amount = (skill.effects || []).filter((effect) => effect?.type === 'damage' && !effect?.metadata?.afflictionDamage)
            .reduce((sum, effect) => sum + (Number(effect.amount) || 0), 0);
        strike(match, state, actor, Math.floor(amount / 2), { sourceSlot: ownerSlot, label: 'Mirror Technique' });
    }
};

// ---------------------------------------------------------------- outgoing damage
const adjustDamage = (args) => {
    const { match, actingUsername, actorSlot, recipient, skill, effect, amount, afflictionDamage, targetDamageReductionFlat } = args;
    const state = stateOf(match);
    if (!state) return null;
    // Soul Link: an enemy's direct hit on your ninja is reduced by 30%; the 30% is shared
    // among their living allies when the skill finishes.
    if (actingUsername === state.enemy && recipient.username === state.player && has(state, 'A094') && !afflictionDamage) {
        const shared = Math.floor(amount * 0.3);
        if (shared > 0 && openAction && living(match, state.player).some((entry) => entry.slot !== recipient.slot)) {
            openAction.soul.push({ recipientSlot: recipient.slot, amount: shared });
            return { extra: -shared };
        }
        return null;
    }
    if (actingUsername === state.enemy && recipient.username === state.player) {
        const reduction = characterEffects.adjustDamage(kit, args, state);
        return reduction ? { extra: reduction } : null;
    }
    if (actingUsername !== state.player || recipient.username !== state.enemy) return null;
    const memo = unitMemo(state, state.player, actorSlot);
    const enemyMemo = unitMemo(state, state.enemy, recipient.slot);
    let extra = 0;
    let percent = 0;
    const targetHp = Number(recipient.unit?.hp) || 0;
    if (has(state, 'A006') && Number(effect?.amount) > 0 && Number(effect.amount) <= 10) extra += 5;
    if (has(state, 'A034') && memo.insight && memo.insight.slot === recipient.slot) extra += 15;
    if (has(state, 'A043')) extra += Number(memo.cuts?.[recipient.slot]?.bonus) || 0;
    if (has(state, 'A046') && (perTurn(state).focus?.[recipient.slot] || []).some((slot) => slot !== actorSlot)) extra += 10;
    if (has(state, 'F01') && hasClass(skill, 'chakra') && rawCost(skill) >= 2 && !afflictionDamage) extra += 10;
    if (has(state, 'F05') && targetHp < 50) extra += 15;
    extra += characterEffects.adjustDamage(kit, args, state);
    if (!afflictionDamage) {
        if (has(state, 'A048')) extra += Math.min(10, Number(targetDamageReductionFlat) || 0);
        if (has(state, 'A050')) percent += 10 * (Number(enemyMemo.pressure) || 0);
        if (has(state, 'F12')) percent += 10 * (Number(enemyMemo.pursuit) || 0);
        if (has(state, 'A070') && living(match, state.player).length === 1) percent += 50;
    }
    const result = { extra: extra + Math.floor(((amount + extra) * percent) / 100) };
    if (has(state, 'A055') && !afflictionDamage) {
        result.ignoreDamageReduction = true;
        result.ignoreDestructibleDefense = true;
    }
    return result;
};

// The toolbox the character-augment handlers use.
const kit = {
    applyAugmentStatus, removeStatus, statusOn, setStackStatus, strike, heal, healthLoss, addDefense, gainChakra,
    living, team, unitMemo, perTurn, turnOf, once, pick, hasClass, skillDealsDamage,
    characters: () => charactersRef,
    openAction: () => openAction,
};

const hooks = { beforeSkill, afterSkill, onDamage, onHeal, onStatusApply, onCounter, adjustDamage };
battleLogic.setTowerHooks(hooks);

module.exports = { hooks, initBattle, onTurnStart, onTurnEnd, stateOf };
