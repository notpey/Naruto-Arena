// Character augments (C01-C40) in Tower battles. Called by towerAugmentEffects.js at the same
// battle events as the team augments; `kit` is that module's toolbox. Every handler checks
// that the augment sits on that exact ninja (state.ninja[slot]) and acts only on the exact
// skill and status ids validated in towerCharacterAugments.js.

const SKILL = {
    shadowClones: 'uzumaki-naruto-shadow-clones', rasengan: 'uzumaki-naruto-rasengan', combo: 'uzumaki-naruto-uzumaki-naruto-combo',
    dragonFlame: 'uchiha-sasuke-dragon-flame-jutsu', chidori: 'uchiha-sasuke-chidori',
    rudimentary: 'haruno-sakura-rudimentary-healing', innerOverwhelm: 'haruno-sakura-inner-mental-overwhelm',
    mirrorNeedles: 'haku-flying-needles-of-death-mirrors',
    ninDogs: 'hatake-kakashi-summoning-ninja-dogs', raikiri: 'hatake-kakashi-raikiri',
    femaleBug: 'aburame-shino-female-bug',
    frontLotus: 'rock-lee-front-lotus', highSpeed: 'rock-lee-high-speed-taijutsu',
    funeral: 'gaara-of-the-desert-desert-funeral', sandSphere: 'gaara-of-the-desert-sand-sphere',
    needles: ['haku-flying-needles-of-death', 'haku-flying-needles-of-death-mirrors'],
    palms: 'hyuuga-hinata-eight-trigrams-64-palms',
    airMarking: 'inuzuka-kiba-dynamic-air-marking', garouga: 'inuzuka-kiba-garouga',
    meditate: 'nara-shikamaru-meditate', shadowImitation: 'nara-shikamaru-shadow-imitation',
    thunderGod: 'namikaze-minato-flying-thunder-god',
    piercingStab: 'uchiha-obito-piercing-stab', partingGift: 'uchiha-obito-parting-gift',
    healingTouch: 'nohara-rin-healing-touch', medicalKit: 'nohara-rin-medical-kit',
    hiddenMist: 'momochi-zabuza-hidden-mist-technique',
    hazeClones: 'oboro-haze-clones', kunais: ['oboro-exploding-kunais', 'oboro-exploding-kunais-haze'],
    trap: 'tenten-twin-rising-dragons-trap', sacrifice: 'umino-iruka-sacrifice',
};
const STATUS = {
    clones: 'uzumaki_naruto_shadow_clones', awakened: 'uchiha_sasuke_two_tomoe_sharingan_awakened',
    wireStun: 'uchiha_sasuke_ninja_wire_trap_stun', insight: 'kakashi_sharingan_insight',
    femaleBug: 'aburame_shino_female_bug', weights: 'rock_lee_training_weights_removed',
    sandFlow: 'gaara_of_the_desert_sand_flow', sandSphere: 'gaara_sand_sphere',
    poisonBomb: 'kankuro_poison_bomb_poison', puppetTrap: 'kankuro_puppet_trap',
    overwhelmStun: 'haruno_sakura_mental_overwhelm_stun', usedStun: 'haruno_sakura_stunned_sakuras_team',
    acupuncture: 'haku_acupuncture_stun', gentleFist: 'hyuuga_hinata_gentle_fist_debuff',
    airMarking: 'inuzuka_kiba_dynamic_air_marking', meditate: 'nara_shikamaru_meditate',
    customKunai: 'namikaze_minato_custom_kunai', thunderMark: 'namikaze_minato_flying_thunder_god_mark',
    partingGift: 'uchiha_obito_parting_gift', medicalKit: 'nohara_rin_medical_kit',
    fiveElements: 'shiore_orochimaru_five_elements_seal',
};

const hasC = (state, code, slot) => Boolean(Number.isInteger(slot) && state.ninja?.[slot]?.includes(code));
const anyC = (state, code) => (state.ninja || []).some((codes) => codes?.includes(code));
const clone = (value) => JSON.parse(JSON.stringify(value));
const stackOf = (unit, statusId, keyName) => Number(unit?.state?.statuses?.find((status) => status?.id === statusId)?.metadata?.[keyName]) || 0;
const setStack = (unit, statusId, keyName, value) => {
    const status = unit?.state?.statuses?.find((entry) => entry?.id === statusId);
    if (status?.metadata) status.metadata[keyName] = Math.max(0, value);
};
const charged = (charge, turn) => Boolean(charge) && (charge.expires === undefined || turn <= charge.expires);

// ---------------------------------------------------------------- battle start
const initBattle = (kit, match, state) => {
    kit.living(match, state.player).forEach((entry) => {
        const { slot, unit } = entry;
        if (hasC(state, 'C02', slot)) kit.applyAugmentStatus(match, state, entry, 'C02', 'tower_aug_c02', 99, {
            permanent: true, towerConditionValueOverride: { [`${STATUS.clones}:shadowClones`]: 1 },
            tooltipText: 'Rasengan Mastery: Rasengan needs 1 Shadow Clone and deals 10 more damage.' });
        if (hasC(state, 'C05', slot)) {
            const passive = unit.state.statuses.find((status) => status?.metadata?.awakening?.statusId === STATUS.awakened);
            if (passive) passive.metadata.awakeningBonusProgress = (Number(passive.metadata.awakeningBonusProgress) || 0) + 1;
        }
        if (hasC(state, 'C06', slot)) kit.applyAugmentStatus(match, state, entry, 'C06', 'tower_aug_c06', 99, {
            permanent: true, randomCostIncreaseForSkillIds: { [SKILL.chidori]: 1 },
            tooltipText: 'Chidori Storm: Chidori costs 1 more random chakra, deals 35 piercing and 15 piercing to every other enemy.' });
        if (hasC(state, 'C08', slot)) kit.applyAugmentStatus(match, state, entry, 'C08', 'tower_aug_c08', 99, {
            permanent: true, towerIgnoreTargetConditionSkillIds: [SKILL.innerOverwhelm],
            tooltipText: 'Inner Sakura Unleashed: Mental Overwhelm can target any enemy; on one who used no stun it stuns only Chakra and Strategic skills.' });
        if (hasC(state, 'C23', slot)) kit.applyAugmentStatus(match, state, entry, 'C23', 'tower_aug_c23', 99, {
            permanent: true, skillTargetOverrides: { [SKILL.mirrorNeedles]: 'single-enemy' },
            tooltipText: 'Fractured Mirrors: during the mirrors, Flying Needles of Death strikes one enemy twice for 20.' });
        if (hasC(state, 'C09', slot)) kit.applyAugmentStatus(match, state, entry, 'C09', 'tower_aug_c09', 99, {
            permanent: true, skillTargetOverrides: { [SKILL.rudimentary]: 'single-character' },
            tooltipText: 'Combat Medic: Rudimentary Healing can target an enemy, dealing piercing damage equal to its healing (up to 40).' });
    });
};

// ---------------------------------------------------------------- before a skill resolves
const beforeSkill = (kit, action) => {
    const { match, state, actingUsername, actorSlot, skill } = action;
    if (actingUsername !== state.player) return;
    const unit = kit.team(match, state.player)[actorSlot];
    if (skill.id === SKILL.combo && hasC(state, 'C03', actorSlot)) action.c03Clones = stackOf(unit, STATUS.clones, 'shadowClones');
    if (skill.id === SKILL.femaleBug && hasC(state, 'C14', actorSlot)) {
        const previous = kit.team(match, state.enemy).findIndex((enemy) => enemy?.alive !== false &&
            enemy.state.statuses.some((status) => status.id === STATUS.femaleBug && status.sourceSlot === actorSlot));
        if (previous >= 0) {
            const status = kit.team(match, state.enemy)[previous].state.statuses.find((entry) => entry.id === STATUS.femaleBug);
            action.c14Previous = { slot: previous, status: clone(status) };
        }
    }
    if ([SKILL.funeral, SKILL.sandSphere].includes(skill.id)) {
        action.sandBefore = stackOf(unit, STATUS.sandFlow, 'sandFlowStacks');
        if (skill.id === SKILL.funeral && hasC(state, 'C19', actorSlot) && action.sandBefore > 3) {
            action.sandStash = action.sandBefore - 3;
            setStack(unit, STATUS.sandFlow, 'sandFlowStacks', 3);
        }
    }
    if (skill.id === SKILL.healingTouch && hasC(state, 'C34', actorSlot)) {
        const target = action.targetSelection?.[0];
        const ally = target && kit.team(match, target.username)[target.slot];
        action.c34Afflictions = (ally?.state?.statuses || []).filter((status) => status?.metadata?.harmful).length;
    }
};

// ---------------------------------------------------------------- after a skill resolves
const afterSkill = (kit, action, info) => {
    const { match, state, actingUsername, actorSlot, skill } = action;
    const { enemyHits, directHits, ownTurn } = info;
    if (actingUsername !== state.player) {
        // Seal Hunter: a sealed enemy paying 2+ chakra takes 5 affliction once per turn.
        if (anyC(state, 'C38') && action.paid >= 2) {
            const actorUnit = kit.team(match, actingUsername)[actorSlot];
            const sealed = actorUnit?.state?.statuses?.find((status) => status.id === STATUS.fiveElements &&
                hasC(state, 'C38', status.sourceSlot));
            const turnState = kit.perTurn(state);
            turnState.c38 = turnState.c38 || {};
            if (sealed && !turnState.c38[actorSlot]) {
                turnState.c38[actorSlot] = true;
                kit.strike(match, state, { unit: actorUnit, username: actingUsername, slot: actorSlot }, 5,
                    { sourceSlot: sealed.sourceSlot, affliction: true, label: 'Seal Hunter' });
            }
        }
        return;
    }
    const unit = kit.team(match, state.player)[actorSlot];
    if (!unit) return;
    const entry = { unit, username: state.player, slot: actorSlot };
    const memo = kit.unitMemo(state, state.player, actorSlot);
    const has = (code) => hasC(state, code, actorSlot);
    const enemies = () => kit.living(match, state.enemy);
    const echo = (hit, target, label) => {
        const amount = Math.floor((hit.rawDirect || hit.raw) / 2);
        if (amount > 0) kit.strike(match, state, target, amount, { sourceSlot: actorSlot, label });
    };
    const target = action.targetSelection?.[0] || null;

    if (skill.id === SKILL.shadowClones && has('C01')) setStack(unit, STATUS.clones, 'shadowClones', stackOf(unit, STATUS.clones, 'shadowClones') + 1);
    if (skill.id === SKILL.mirrorNeedles && has('C23') && target) {
        const struck = kit.team(match, state.enemy)[target.slot];
        if (struck && struck.alive !== false) kit.strike(match, state, { unit: struck, username: state.enemy, slot: target.slot }, 20,
            { sourceSlot: actorSlot, label: 'Fractured Mirrors' });
    }
    if (skill.id === SKILL.combo && has('C03') && action.c03Clones >= 3) {
        const struck = new Set(enemyHits.map((hit) => hit.slot));
        const other = kit.pick(match, `c03:${ownTurn}`, enemies().filter((enemy) => !struck.has(enemy.slot)));
        if (other && directHits[0]) echo(directHits[0], other, 'Clone Uprising');
        setStack(unit, STATUS.clones, 'shadowClones', stackOf(unit, STATUS.clones, 'shadowClones') - 1);
    }
    if (skill.id === SKILL.dragonFlame && has('C04') && enemyHits.length) memo.c04 = null;
    if (skill.id === SKILL.chidori && has('C05') && unit.state.statuses.some((status) => status.id === STATUS.awakened)) memo.c05 = true;
    if (skill.id === SKILL.chidori && has('C06')) {
        const struck = new Set(enemyHits.map((hit) => hit.slot));
        enemies().filter((enemy) => !struck.has(enemy.slot))
            .forEach((enemy) => kit.strike(match, state, enemy, 15, { sourceSlot: actorSlot, piercing: true, label: 'Chidori Storm' }));
    }
    if (skill.id === SKILL.rudimentary && has('C07')) {
        action.heals.filter((healed) => healed.hpBefore < 50).forEach((healed) => kit.heal(healed.unit, 10));
    }
    if (skill.id === SKILL.ninDogs && has('C10') && enemyHits.length) memo.c10 = { slot: enemyHits[0].slot, expires: ownTurn + 1 };
    if (skill.id === SKILL.raikiri && has('C10') && memo.c10 && enemyHits.some((hit) => hit.slot === memo.c10.slot)) memo.c10 = null;
    if (has('C12') && !memo.c12 && enemyHits.length) {
        const own = new Set((kit.characters()?.[unit.rosterIndex]?.skills || []).map((entrySkill) => entrySkill?.id));
        if (!own.has(skill.id)) {
            memo.c12 = true;
            directHits.forEach((hit) => echo(hit, hit, 'Living Arsenal'));
        }
    }
    if (skill.id === SKILL.femaleBug && has('C14') && action.c14Previous) {
        const previous = kit.team(match, state.enemy)[action.c14Previous.slot];
        const marked = (target && target.slot === action.c14Previous.slot) || previous?.alive === false;
        if (previous && !marked) {
            previous.state.statuses = previous.state.statuses.filter((status) => status.id !== STATUS.femaleBug);
            previous.state.statuses.push({ ...action.c14Previous.status, metadata: { ...action.c14Previous.status.metadata,
                onOwnerUseChakraSpentAfflictionDamagePerChakra: femaleBugDamage(state, actorSlot) } });
        }
    }
    if (skill.id === SKILL.frontLotus && has('C15') && enemyHits.some((hit) => hit.unit.alive === false)) {
        const turnState = kit.perTurn(state);
        if (!turnState.c15) {
            turnState.c15 = true;
            kit.gainChakra(match, state, 1, `c15:${ownTurn}`);
            kit.applyAugmentStatus(match, state, entry, 'C15', 'tower_aug_c15', 99, {
                towerCostDiscount: { amount: 1, minTotal: 2, skillIds: [SKILL.highSpeed] },
                tooltipText: 'Lotus Discipline: the next High Speed Taijutsu costs 1 less random chakra.' });
        }
    }
    if (skill.id === SKILL.highSpeed && has('C15')) kit.removeStatus(unit, 'tower_aug_c15');
    if (has('C16') && kit.hasClass(skill, 'physical') && enemyHits.length &&
        unit.state.statuses.some((status) => status.id === STATUS.weights)) {
        kit.healthLoss(match, state, entry, 10);
    }
    if (skill.id === SKILL.funeral && has('C17') && action.sandBefore >= 3) {
        const turnState = kit.perTurn(state);
        if (!turnState.c17) {
            turnState.c17 = true;
            kit.gainChakra(match, state, 1, `c17:${ownTurn}`);
        }
    }
    if (skill.id === SKILL.sandSphere && has('C18') && action.sandBefore >= 1) {
        const after = stackOf(unit, STATUS.sandFlow, 'sandFlowStacks');
        if (after < action.sandBefore) setStack(unit, STATUS.sandFlow, 'sandFlowStacks', Math.min(action.sandBefore, after + 1));
    }
    if (skill.id === SKILL.funeral && has('C19')) {
        if (action.sandStash) setStack(unit, STATUS.sandFlow, 'sandFlowStacks', stackOf(unit, STATUS.sandFlow, 'sandFlowStacks') + action.sandStash);
        if (action.sandBefore >= 5) {
            const struck = new Set(enemyHits.map((hit) => hit.slot));
            enemies().filter((enemy) => !struck.has(enemy.slot))
                .forEach((enemy) => kit.strike(match, state, enemy, 15, { sourceSlot: actorSlot, piercing: true, label: 'Shukaku Rampage' }));
        }
    }
    if (skill.id === SKILL.palms && has('C25')) {
        memo.c25 = Math.min(15, (memo.c25 || 0) + 5);
        kit.setStackStatus(match, state, entry, 'C25', 'tower_aug_c25', {
            skillDamageBonuses: { [SKILL.palms]: memo.c25 }, skillHealingBonuses: { [SKILL.palms]: memo.c25 },
        }, `Sixty-Four Palms Mastery: Eight Trigrams 64 Palms deals and heals ${memo.c25} more.`);
    }
    if (skill.id === SKILL.airMarking && has('C26') && target) memo.c26 = { ...(memo.c26 || {}), [target.slot]: true };
    if (skill.id === SKILL.garouga && has('C26')) enemyHits.forEach((hit) => { if (memo.c26) delete memo.c26[hit.slot]; });
    if (skill.id === SKILL.garouga && has('C27') && !memo.c27 && directHits[0]) {
        memo.c27 = true;
        echo(directHits[0], directHits[0], 'Twin Fang Assault');
    }
    if (skill.id === SKILL.meditate && has('C29')) {
        const source = kit.team(match, state.enemy).map((enemy) => enemy?.state?.statuses?.find((status) =>
            status.id === STATUS.meditate && status.sourceSlot === actorSlot)).find(Boolean);
        if (source) {
            enemies().forEach((enemy) => {
                enemy.unit.state.statuses = enemy.unit.state.statuses.filter((status) => !(status.id === STATUS.meditate && status.sourceSlot === actorSlot));
                enemy.unit.state.statuses.push({ ...clone(source), remainingTurns: 2 });
            });
        }
    }
    if (skill.id === SKILL.shadowImitation && has('C29')) {
        enemies().filter((enemy) => enemy.unit.state.statuses.some((status) => status.id === STATUS.meditate))
            .forEach((enemy) => kit.strike(match, state, enemy, 10, { sourceSlot: actorSlot, piercing: true, label: 'Grand Strategy' }));
    }
    if (skill.id === SKILL.thunderGod && has('C31')) {
        if (target && target.username === state.player) {
            kit.addDefense(match, state, { unit: kit.team(match, state.player)[target.slot], username: state.player, slot: target.slot }, 'C31', 15);
        }
        const markedHit = enemyHits.find((hit) => hit.unit.state.statuses.some((status) => status.id === STATUS.thunderMark));
        if (markedHit) {
            const other = enemies().find((enemy) => enemy.slot !== markedHit.slot &&
                enemy.unit.state.statuses.some((status) => status.id === STATUS.thunderMark));
            if (other) kit.strike(match, state, other, 15, { sourceSlot: actorSlot, piercing: true, label: 'Thunder God Relay' });
        }
    }
    if (skill.id === SKILL.partingGift && has('C33') && target) {
        const gift = kit.team(match, state.player)[target.slot]?.state?.statuses?.find((status) => status.id === STATUS.partingGift);
        const second = kit.living(match, state.player).find((ally) => ally.slot !== actorSlot && ally.slot !== target.slot &&
            !ally.unit.state.statuses.some((status) => status.id === STATUS.partingGift));
        if (gift && second) second.unit.state.statuses.push(clone(gift));
        kit.healthLoss(match, state, entry, 15);
    }
    if (skill.id === SKILL.healingTouch && has('C34') && target) {
        const ally = kit.team(match, target.username)[target.slot];
        const now = (ally?.state?.statuses || []).filter((status) => status?.metadata?.harmful).length;
        if (now < (action.c34Afflictions || 0)) kit.heal(ally, 10);
    }
    if (skill.id === SKILL.medicalKit && has('C35') && target) {
        const kit0 = kit.team(match, state.player)[target.slot]?.state?.statuses?.find((status) => status.id === STATUS.medicalKit);
        if (kit0) kit.living(match, state.player).filter((ally) => ally.slot !== target.slot &&
            !ally.unit.state.statuses.some((status) => status.id === STATUS.medicalKit))
            .forEach((ally) => ally.unit.state.statuses.push(clone(kit0)));
    }
    if (has('C36')) {
        if (skill.id === SKILL.hiddenMist) memo.c36 = { expires: ownTurn + 2 };
        else if (charged(memo.c36, ownTurn) && directHits.length) {
            memo.c36 = null;
            kit.applyAugmentStatus(match, state, entry, 'C36', 'tower_aug_c36', 1, {
                damageReductionFlat: 10, tooltipText: 'The Hidden Mist: 10 damage reduction.' });
        }
    }
    if (has('C37')) {
        if (skill.id === SKILL.hazeClones) memo.c37 = { expires: ownTurn + 2 };
        else if (SKILL.kunais.includes(skill.id) && charged(memo.c37, ownTurn)) memo.c37 = null;
    }
    if (skill.id === SKILL.trap && has('C39') && enemyHits[0] && kit.once(state, 'C39')) {
        kit.strike(match, state, enemyHits[0], 10, { sourceSlot: actorSlot, piercing: true, label: 'Trap Master' });
    }
    if (skill.id === SKILL.sacrifice && has('C40')) {
        kit.living(match, state.player).filter((ally) => ally.slot !== actorSlot).forEach((ally) => {
            kit.applyAugmentStatus(match, state, ally, 'C40', 'tower_aug_c40', 2, {
                destructibleDefensePoints: 15, activeOnlyWithDestructibleDefense: true,
                tooltipText: "Ninja's Sacrifice: 15 destructible defense." });
        });
    }
};

const femaleBugDamage = (state, slot) => (hasC(state, 'C14', slot) ? 3 : 5) + (hasC(state, 'C13', slot) ? 2 : 0);

// ---------------------------------------------------------------- outgoing damage
const adjustDamage = (kit, args, state) => {
    const { match, actingUsername, actorSlot, recipient, skill, effect, afflictionDamage } = args;
    let extra = 0;
    if (actingUsername === state.enemy && recipient.username === state.player && !afflictionDamage) {
        // Marked Refuge: Custom Kunai carriers take 5 less from the first enemy skill each turn.
        const kunai = recipient.unit.state.statuses.find((status) => status.id === STATUS.customKunai);
        const minato = kunai && kit.team(match, state.player)[kunai.sourceSlot];
        const turnState = kit.perTurn(state);
        turnState.c30 = turnState.c30 || {};
        if (kunai && hasC(state, 'C30', kunai.sourceSlot) && minato && minato.alive !== false && !turnState.c30[recipient.slot]) {
            turnState.c30[recipient.slot] = true;
            extra -= 5;
        }
        return extra;
    }
    if (actingUsername !== state.player) return 0;
    const unit = kit.team(match, state.player)[actorSlot];
    const memo = kit.unitMemo(state, state.player, actorSlot);
    const has = (code) => hasC(state, code, actorSlot);
    const ownTurn = kit.turnOf(state, state.player);
    const targetHas = (statusId) => recipient.unit.state.statuses.some((status) => status.id === statusId);
    const primary = (effect?.scope || 'target') === 'target';
    if (skill.id === SKILL.rasengan && has('C02')) extra += 10;
    if (skill.id === SKILL.dragonFlame && has('C04') && primary && charged(memo.c04, ownTurn)) extra += 10;
    if (skill.id === SKILL.chidori && has('C05') && !memo.c05 && unit.state.statuses.some((status) => status.id === STATUS.awakened)) extra += 10;
    if (skill.id === SKILL.chidori && has('C06')) extra -= 10;
    if (skill.id === SKILL.raikiri && has('C10') && charged(memo.c10, ownTurn) && memo.c10.slot === recipient.slot) extra += 10;
    if (SKILL.needles.includes(skill.id) && has('C22') && targetHas(STATUS.acupuncture)) extra += 10;
    if (skill.id === SKILL.mirrorNeedles && has('C23')) {
        // One chosen enemy takes two 20-damage hits; the area hit on everyone else is cancelled.
        const chosen = kit.openAction()?.targetSelection?.[0];
        if (!chosen || chosen.slot !== recipient.slot) return -Math.max(0, Number(args.amount) || 0);
        extra -= 10;
    }
    if (skill.id === SKILL.garouga && has('C26') && memo.c26?.[recipient.slot] && targetHas(STATUS.airMarking)) extra += 10;
    if (skill.id === SKILL.piercingStab && has('C32') && recipient.unit.state.statuses.some((status) =>
        (Number(status.remainingTurns) || 0) > 0 && (status.metadata?.healReceivedMultiplier === 0 ||
            status.metadata?.cannotBeHealed || status.metadata?.ignoreHealing))) extra += 5;
    if (has('C36') && !afflictionDamage && skill.id !== SKILL.hiddenMist && charged(memo.c36, ownTurn)) extra += 15;
    if (SKILL.kunais.includes(skill.id) && has('C37') && charged(memo.c37, ownTurn)) extra += 10; // each target
    return extra;
};

// ---------------------------------------------------------------- statuses being applied
const onStatusApply = (kit, match, state, args, target) => {
    const sourceSlot = args.sourceUsername === state.player ? args.sourceSlot : null;
    if (!Number.isInteger(sourceSlot)) return args;
    const has = (code) => hasC(state, code, sourceSlot);
    let next = args;
    const withMetadata = (changes) => { next = { ...next, metadata: { ...next.metadata, ...changes } }; };
    switch (args.statusId) {
    case STATUS.insight: if (has('C11')) withMetadata({ counterCopySkillReplacementDuration: 2 }); break;
    case STATUS.femaleBug:
        if (has('C13') || has('C14')) withMetadata({ onOwnerUseChakraSpentAfflictionDamagePerChakra: femaleBugDamage(state, sourceSlot) });
        break;
    case STATUS.weights: if (has('C16')) {
        const { damageDebuffBySkillClass, ...rest } = next.metadata || {};
        next = { ...next, metadata: rest };
    } break;
    case STATUS.sandSphere: if (has('C18')) withMetadata({ destructibleDefensePoints: (Number(args.metadata?.destructibleDefensePoints) || 0) + 15 }); break;
    case STATUS.poisonBomb:
        if (has('C20') && target?.unit?.state?.statuses?.some((status) => status.id === STATUS.puppetTrap)) {
            withMetadata({ turnEndDamage: (Number(args.metadata?.turnEndDamage) || 0) + 5 });
        }
        break;
    case STATUS.gentleFist: if (has('C24')) withMetadata({ nonAfflictionDamageDebuffFlat: 15 }); break;
    case STATUS.overwhelmStun:
        if (has('C08') && target && !target.unit.state.statuses.some((status) => status.id === STATUS.usedStun)) {
            const { cannotUseSkills, ...rest } = next.metadata || {};
            next = { ...next, metadata: { ...rest, cannotUseSkillClasses: ['chakra', 'strategic'],
                tooltipText: 'Inner Sakura Unleashed: Chakra and Strategic skills are stunned.' } };
        }
        break;
    case STATUS.meditate: if (has('C28')) next = { ...next, duration: Math.min(6, (Number(args.duration) || 0) + 1) }; break;
    case STATUS.medicalKit: if (has('C35')) {
        next = { ...next, duration: 2 };
        withMetadata({ turnEndHealFlat: 5, onOwnerUseSkillEffects: [{ type: 'heal', amount: 5 }] });
    } break;
    case STATUS.wireStun: if (has('C04')) kit.unitMemo(state, state.player, sourceSlot).c04 = { expires: kit.turnOf(state, state.player) + 1 }; break;
    default: break;
    }
    return next;
};

// ---------------------------------------------------------------- counters and heals
const onCounter = (kit, match, state, trapStatus) => {
    if (trapStatus?.id !== STATUS.puppetTrap || !hasC(state, 'C21', trapStatus.sourceSlot)) return;
    const turnState = kit.perTurn(state);
    if (turnState.c21) return;
    turnState.c21 = true;
    kit.living(match, state.enemy).forEach((enemy) => kit.strike(match, state, enemy, 10,
        { sourceSlot: trapStatus.sourceSlot, affliction: true, label: 'Puppet Theater' }));
};

// Combat Medic: Rudimentary Healing aimed at an enemy deals piercing damage instead.
const onEnemyHeal = (kit, match, state, action, target, rawAmount, hpBefore) => {
    if (!action || action.actingUsername !== state.player || action.skill?.id !== SKILL.rudimentary || !hasC(state, 'C09', action.actorSlot)) return;
    target.unit.hp = hpBefore;
    kit.strike(match, state, target, Math.min(40, Math.floor(rawAmount)), { sourceSlot: action.actorSlot, piercing: true, label: 'Combat Medic' });
};

module.exports = { initBattle, beforeSkill, afterSkill, adjustDamage, onStatusApply, onCounter, onEnemyHeal, hasC, SKILL, STATUS };
