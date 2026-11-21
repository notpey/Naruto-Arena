// Presentation helpers for battle tooltips, shared by the server and the battle client.
//
// Everything here only describes canonical state the server already decided: it turns status
// metadata into short labels, explains durations and defines keywords. Nothing here changes or
// predicts a gameplay outcome.
(function (root, factory) {
    const api = factory();
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = api;
    } else {
        root.NarutoStatusDisplay = api;
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    const CHAKRA_LABELS = {
        taijutsu: 'Taijutsu', ninjutsu: 'Ninjutsu', bloodline: 'Bloodline', genjutsu: 'Genjutsu', random: 'Random',
    };
    const CLASS_LABELS = {
        physical: 'Physical', chakra: 'Chakra', energy: 'Chakra', mental: 'Mental', strategic: 'Strategic',
        affliction: 'Affliction', instant: 'Instant', action: 'Action', control: 'Control', unique: 'Unique',
    };

    const positive = (value) => {
        const number = Number(value);
        return Number.isFinite(number) && number > 0 ? number : 0;
    };
    const classLabel = (value) => {
        const key = String(value || '').trim().toLowerCase().replace(/\*$/, '');
        return CLASS_LABELS[key] || (key ? key.charAt(0).toUpperCase() + key.slice(1) : '');
    };
    const listLabel = (values) => {
        const labels = (Array.isArray(values) ? values : []).map(classLabel).filter(Boolean);
        if (labels.length <= 1) return labels[0] || '';
        return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
    };
    const classMapEntries = (value) => (value && typeof value === 'object' && !Array.isArray(value)
        ? Object.entries(value).filter(([, amount]) => positive(amount) > 0)
        : []);

    // Each rule reads one or more metadata keys and returns chips. A chip's `stat` names the
    // quantity it measures so the same stat from several statuses can be totalled.
    // `keys` is every metadata key the rule fully explains; the server uses that list to decide
    // whether a status's chips say everything about it.
    const CHIP_RULES = [
        { keys: ['invulnerable', 'invulnerableToAllSkills'], chips: (m) =>
            (m.invulnerable || m.invulnerableToAllSkills ? [{ stat: 'invulnerable', text: 'Invulnerable' }] : []) },
        { keys: ['invulnerableToSkillClasses'], chips: (m) => {
            const label = listLabel(m.invulnerableToSkillClasses);
            return label ? [{ stat: 'invulnerable-classes', text: `Invulnerable to ${label} skills` }] : [];
        } },
        { keys: ['invulnerableToAffliction'], chips: (m) =>
            (m.invulnerableToAffliction && !m.invulnerable ? [{ stat: 'invulnerable-affliction', text: 'Invulnerable to Affliction' }] : []) },
        { keys: ['invulnerableToNonAffliction'], chips: (m) =>
            (m.invulnerableToNonAffliction ? [{ stat: 'invulnerable-non-affliction', text: 'Invulnerable to non-Affliction' }] : []) },
        { keys: ['invulnerableToNonStrategicSkills'], chips: (m) =>
            (m.invulnerableToNonStrategicSkills ? [{ stat: 'invulnerable-non-strategic', text: 'Invulnerable to non-Strategic skills' }] : []) },
        { keys: ['invulnerableToHelpfulSkills'], chips: (m) =>
            (m.invulnerableToHelpfulSkills ? [{ stat: 'invulnerable-helpful', text: "Allies' skills can't target" }] : []) },
        { keys: ['damageReductionFlat'], chips: (m) => (positive(m.damageReductionFlat)
            ? [{ stat: 'damage-reduction', value: positive(m.damageReductionFlat), text: '{value} damage reduction', good: true }] : []) },
        { keys: ['destructibleDefensePoints'], chips: (m) => (positive(m.destructibleDefensePoints)
            ? [{ stat: 'destructible-defense', value: positive(m.destructibleDefensePoints), text: '{value} destructible defense', good: true }] : []) },
        { keys: ['damageBonusFlat'], chips: (m) => (positive(m.damageBonusFlat)
            ? [{ stat: 'damage-dealt', value: positive(m.damageBonusFlat), text: '+{value} damage dealt', good: true }] : []) },
        { keys: ['damageDebuffFlat', 'DamageDebuff'], chips: (m) => {
            const value = positive(m.damageDebuffFlat) + positive(m.DamageDebuff);
            return value ? [{ stat: 'damage-dealt-down', value, text: '−{value} damage dealt', good: false }] : [];
        } },
        { keys: ['nonAfflictionDamageDebuffFlat', 'NonAfflictionDamageDebuff'], chips: (m) => {
            const value = positive(m.nonAfflictionDamageDebuffFlat) + positive(m.NonAfflictionDamageDebuff);
            return value ? [{ stat: 'non-affliction-dealt-down', value, text: '−{value} non-affliction damage dealt', good: false }] : [];
        } },
        { keys: ['damageTakenBonusFlat'], chips: (m) => (positive(m.damageTakenBonusFlat)
            ? [{ stat: 'damage-taken', value: positive(m.damageTakenBonusFlat), text: '+{value} damage taken', good: false }] : []) },
        { keys: ['nonAfflictionDamageTakenBonusFlat'], chips: (m) => (positive(m.nonAfflictionDamageTakenBonusFlat)
            ? [{ stat: 'non-affliction-taken', value: positive(m.nonAfflictionDamageTakenBonusFlat), text: '+{value} non-affliction damage taken', good: false }] : []) },
        { keys: ['damageBonusBySkillClass'], chips: (m) => classMapEntries(m.damageBonusBySkillClass).map(([cls, amount]) =>
            ({ stat: `class-dealt:${cls}`, value: positive(amount), text: `+{value} ${classLabel(cls)} damage dealt`, good: true })) },
        { keys: ['damageDebuffBySkillClass'], chips: (m) => classMapEntries(m.damageDebuffBySkillClass).map(([cls, amount]) =>
            ({ stat: `class-dealt-down:${cls}`, value: positive(amount), text: `−{value} ${classLabel(cls)} damage dealt`, good: false })) },
        { keys: ['damageTakenBonusBySkillClass'], chips: (m) => classMapEntries(m.damageTakenBonusBySkillClass).map(([cls, amount]) =>
            ({ stat: `class-taken:${cls}`, value: positive(amount), text: `+{value} damage taken from ${classLabel(cls)} skills`, good: false })) },
        { keys: ['cannotUseSkills'], chips: (m) => (m.cannotUseSkills ? [{ stat: 'stun', text: 'Stunned' }] : []) },
        { keys: ['cannotUseSkillClasses'], chips: (m) => {
            const label = listLabel(m.cannotUseSkillClasses);
            return label && !m.cannotUseSkills ? [{ stat: 'stun-classes', text: `${label} skills stunned` }] : [];
        } },
        { keys: ['cannotUseHarmfulSkills'], chips: (m) =>
            (m.cannotUseHarmfulSkills && !m.cannotUseSkills ? [{ stat: 'stun-harmful', text: 'Harmful skills stunned' }] : []) },
        { keys: ['cannotUseNonMentalSkills'], chips: (m) =>
            (m.cannotUseNonMentalSkills && !m.cannotUseSkills ? [{ stat: 'stun-non-mental', text: 'Non-Mental skills stunned' }] : []) },
        { keys: ['cannotUseSkillIndices'], chips: (m, ctx) => {
            const indices = Array.isArray(m.cannotUseSkillIndices) ? m.cannotUseSkillIndices : [];
            if (!indices.length || m.cannotUseSkills) return [];
            const names = indices.map((index) => ctx?.skillNameAt?.(Number(index))).filter(Boolean);
            return [{ stat: 'stun-indices', text: names.length ? `${names.join(', ')} stunned` : 'Some skills stunned' }];
        } },
        { keys: ['cannotBeStunned'], chips: (m) => (m.cannotBeStunned ? [{ stat: 'stun-immune', text: "Can't be stunned", good: true }] : []) },
        { keys: ['cannotBecomeInvulnerable'], chips: (m) =>
            (m.cannotBecomeInvulnerable ? [{ stat: 'no-invulnerable', text: "Can't become invulnerable", good: false }] : []) },
        { keys: ['cannotReduceDamage'], chips: (m) =>
            (m.cannotReduceDamage ? [{ stat: 'no-reduction', text: "Can't reduce damage", good: false }] : []) },
        { keys: ['cannotIgnoreStuns'], chips: (m) =>
            (m.cannotIgnoreStuns ? [{ stat: 'stuns-stick', text: "Can't ignore stuns", good: false }] : []) },
        { keys: ['ignoreEnemyInvulnerability'], chips: (m) =>
            (m.ignoreEnemyInvulnerability ? [{ stat: 'ignore-invulnerable', text: 'Ignores invulnerability', good: true }] : []) },
        ...['taijutsu', 'ninjutsu', 'bloodline', 'genjutsu', 'random'].flatMap((type) => [
            { keys: [`${type}CostIncrease`], chips: (m) => (positive(m[`${type}CostIncrease`])
                ? [{ stat: `cost-up:${type}`, value: positive(m[`${type}CostIncrease`]), text: `+{value} ${CHAKRA_LABELS[type]} cost`, good: false }] : []) },
            { keys: [`${type}CostReduction`], chips: (m) => (positive(m[`${type}CostReduction`])
                ? [{ stat: `cost-down:${type}`, value: positive(m[`${type}CostReduction`]), text: `−{value} ${CHAKRA_LABELS[type]} cost`, good: true }] : []) },
        ]),
        { keys: ['overrideAllSkillsToAllRandom'], chips: (m) =>
            (m.overrideAllSkillsToAllRandom ? [{ stat: 'all-random', text: 'All skills cost Random chakra' }] : []) },
        { keys: ['turnEndDamage', 'afflictionDamage', 'turnEndTrigger'], chips: (m, ctx) => {
            const value = positive(m.turnEndDamage);
            if (!value) return [];
            // A status with one tick left hits once; "each turn" would overstate it. The
            // duration label already says when.
            const once = Number(ctx?.turnEnds) === 1;
            const kind = m.afflictionDamage ? 'affliction damage' : 'damage';
            return [{ stat: m.afflictionDamage ? 'dot-affliction' : 'dot', value,
                text: once ? `{value} ${kind}` : `{value} ${kind} each turn`, good: false }];
        } },
        { keys: ['skillDamageBonuses'], chips: (m, ctx) => classMapEntries(m.skillDamageBonuses).map(([skillId, amount]) =>
            ({ stat: `skill-bonus:${skillId}`, value: positive(amount),
                text: `+{value} ${ctx?.skillName?.(skillId) || 'skill'} damage`, good: true })) },
        { keys: ['skillReplacements'], chips: (m, ctx) => Object.entries(
            m.skillReplacements && typeof m.skillReplacements === 'object' ? m.skillReplacements : {})
            .filter(([from, to]) => from && to)
            .map(([from, to]) => ({ stat: `replace:${from}`,
                text: `${ctx?.skillName?.(from) || 'A skill'} becomes ${ctx?.skillName?.(to) || 'another skill'}` })) },
        { keys: ['ongoingClass'], chips: (m) => {
            const cls = String(m.ongoingClass || '').toLowerCase();
            return cls === 'control' || cls === 'action'
                ? [{ stat: `ongoing:${cls}`, text: classLabel(cls), tag: true, keyword: classLabel(cls) }] : [];
        } },
    ];

    const CHIP_KEYS = new Set(CHIP_RULES.flatMap((rule) => rule.keys));

    // Keys that only control presentation, bookkeeping or timing the duration label already
    // explains. They never need prose to describe them.
    const PRESENTATION_KEYS = new Set([
        'tooltipText', 'tooltipTextTemplate', 'statusIcon', 'sourceSkillName', 'helpful', 'harmful',
        'permanent', 'passive', 'fromPassive', 'cannotBeCleansed', 'turnDurationAnchor', 'triggerOnApply',
        'invisible', 'hideTooltip', 'hideTooltipFromEnemy', 'hideTooltipFromUnitOwner', 'hideTooltipFromOwner',
        'removeOnSourceDeath', 'endsOnSourceDeath', 'removeWhenSourceDies', 'sourceDeathPurge',
        'stackMetadataKey', 'stackDelta', 'stackMax', 'mergeNumericAddKeys', 'mergeObjectNumericAddKeys',
        'passiveAwakening', 'controlIgnoresOwnerInvulnerability', 'ignoreDamageReduction',
        'ignoreDestructibleDefense', 'ignoreTargetDamageReduction', 'ignoreTargetDestructibleDefense',
        'infiniteDuration', 'skipFirstTurnEndTick', 'statusGroup', 'tooltipAggregateStatusIds',
        'tooltipAggregateMetadataKey',
    ]);

    // True when the chips alone describe every gameplay-relevant key of this metadata, so the
    // prose can be folded away. Runs on the server against full (unsanitized) metadata.
    const chipsDescribeMetadata = (metadata) => {
        if (!metadata || typeof metadata !== 'object') return false;
        let anyChip = false;
        for (const [key, value] of Object.entries(metadata)) {
            if (key.startsWith('_') || PRESENTATION_KEYS.has(key)) continue;
            if (value === false || value === null || value === undefined || value === 0 || value === '') continue;
            if (Array.isArray(value) && value.length === 0) continue;
            if (!CHIP_KEYS.has(key)) return false;
            anyChip = true;
        }
        return anyChip;
    };

    const fillChip = (chip) => ({ ...chip, text: String(chip.text).replace('{value}', String(chip.value ?? '')) });

    const buildStatusChips = (metadata, ctx = {}) => {
        if (!metadata || typeof metadata !== 'object') return [];
        const chips = [];
        CHIP_RULES.forEach((rule) => {
            (rule.chips(metadata, ctx) || []).forEach((chip) => chips.push(chip));
        });
        return chips;
    };

    // Adds the same stat from several statuses together: "15 damage reduction (10 + 5)".
    const totalChips = (chips) => {
        const byStat = new Map();
        const order = [];
        chips.forEach((chip) => {
            const existing = byStat.get(chip.stat);
            if (!existing) {
                byStat.set(chip.stat, { ...chip, parts: chip.value !== undefined ? [chip.value] : [] });
                order.push(chip.stat);
                return;
            }
            if (chip.value !== undefined && existing.value !== undefined) {
                existing.value += chip.value;
                existing.parts.push(chip.value);
            }
        });
        return order.map((stat) => {
            const chip = byStat.get(stat);
            const filled = fillChip(chip);
            return chip.parts.length > 1 ? { ...filled, breakdown: chip.parts.join(' + ') } : filled;
        });
    };

    // Turns the server's duration facts into words for the viewing player.
    const describeDuration = (duration) => {
        if (!duration || duration.permanent) return '';
        const ends = Math.max(0, Number(duration.turnEnds) || 0);
        if (!ends) return '';
        if (duration.endsThisTurn) return 'Ends after this turn';
        if (duration.whose === 'any') return ends === 1 ? 'Ends after this turn' : `Ends in ${ends} turns`;
        const mine = duration.whose === 'viewer';
        if (ends === 1) return mine ? 'Ends after your next turn' : "Ends after the enemy's next turn";
        return mine ? `Lasts ${ends} of your turns` : `Lasts ${ends} enemy turns`;
    };

    // Short, accurate definitions of the rules keywords players meet in descriptions.
    const GLOSSARY = {
        piercing: 'Piercing damage ignores damage reduction.',
        affliction: 'Affliction damage ignores damage reduction and destructible defense.',
        'damage reduction': 'Lowers non-affliction damage taken by that amount.',
        'destructible defense': 'Absorbs non-affliction damage until it is used up.',
        invulnerable: "Enemy skills can't target this character.",
        invulnerability: "Invulnerable characters can't be targeted by enemy skills.",
        stun: "A stunned character can't use the affected skills.",
        stunned: "A stunned character can't use the affected skills.",
        stuns: "A stunned character can't use the affected skills.",
        counter: 'A counter cancels the enemy skill that triggers it.',
        countered: 'A countered skill is cancelled and has no effect.',
        reflect: 'A reflected skill takes effect on its user instead.',
        reflected: 'A reflected skill takes effect on its user instead.',
        invisible: 'Hidden from the enemy until it takes effect.',
        control: 'Control: an ongoing effect that ends if its user is stunned or its target becomes invulnerable.',
        action: 'Action: an ongoing effect that ends if its user dies.',
        instant: 'Instant: takes effect immediately.',
        physical: 'Physical: a skill class. Some effects only affect certain classes.',
        chakra: 'Chakra: a skill class. Some effects only affect certain classes.',
        mental: 'Mental: a skill class. Some effects only affect certain classes.',
        strategic: 'Strategic: a skill class. Some effects only affect certain classes.',
    };
    const glossaryFor = (term) => GLOSSARY[String(term || '').trim().toLowerCase()] || '';

    // Removes words the tooltip's title and icon already say: "This character's Physical skills
    // are stunned by Ninja Wire Trap." -> "Physical skills are stunned".
    const tidyTooltipLine = (line, sourceName = '') => {
        let text = String(line || '').trim();
        if (!text) return text;
        const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1);
        text = text
            .replace(/^This character's\s+/i, '')
            .replace(/^This character is\s+(?=[a-z])/i, '')
            .replace(/^This character has\s+(?=\d)/i, '')
            .replace(/^This character\s+/i, '');
        if (sourceName) {
            const escaped = sourceName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            text = text.replace(new RegExp(`\\s+(?:by|from)\\s+(?:'|")?${escaped}(?:'|")?(?=\\s*[.,]?$)`, 'i'), '');
        }
        text = text.replace(/\.$/, '');
        return capitalize(text);
    };

    // Readable names for skill target types.
    const TARGET_LABELS = {
        'single-enemy': 'One enemy', 'all-enemy': 'All enemies', 'random-enemy': 'Random enemy',
        self: 'Self', 'single-ally': 'One ally', 'all-allies': 'All allies', 'self-or-single-ally': 'Self or one ally',
        'single-character': 'Any one character', 'single-target': 'Any one character', 'all-characters': 'Everyone',
    };
    const targetLabel = (target) => TARGET_LABELS[String(target || '').trim().toLowerCase()] || '';

    return {
        CHIP_KEYS, PRESENTATION_KEYS, GLOSSARY,
        buildStatusChips, totalChips, chipsDescribeMetadata, describeDuration, glossaryFor,
        tidyTooltipLine, targetLabel, classLabel,
    };
});
