// Character Editor sentences: everyday mechanics as plain fill-in-the-blank lines.
//
// Each sentence is exactly one engine effect. A sentence can create its effect, recognise an
// existing effect as itself (so live characters open as sentences too), and update an effect's
// numbers and choices in place. Updating never renames a status or replaces a hand-written tooltip,
// because other skills' conditions may refer to them. Effects no sentence recognises are shown by
// the editor as special mechanics whose numbers can be tuned.
//
// The shapes copy what the live roster uses: helpful effects on the user count down on the user's
// turns; harmful effects on others count down on the caster's turns (turnDurationAnchor
// 'source_turn'), so "for 1 turn" means until the caster's next turn.
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CharacterSentences = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const WHO = [
    { id: 'target', label: 'the target' },
    { id: 'self', label: '{name}' },
    { id: 'all-enemy', label: 'all enemies' },
    { id: 'all-allies', label: '{name} and allies' },
  ];
  const WHO_IDS = WHO.map(entry => entry.id);
  const DAMAGE_KINDS = [
    { id: 'normal', label: 'normal' },
    { id: 'piercing', label: 'piercing' },
    { id: 'affliction', label: 'affliction' },
  ];
  // Damage reduction is ignored by piercing damage unless it is unpierceable.
  const REDUCTION_KINDS = [
    { id: 'normal', label: '(piercing ignores it)' },
    { id: 'unpierceable', label: 'that piercing cannot ignore' },
  ];
  const STUN_KINDS = [
    { id: 'all', label: 'all' },
    { id: 'physical', label: 'Physical' },
    { id: 'chakra', label: 'Chakra' },
    { id: 'strategic', label: 'Strategic' },
    { id: 'physical,chakra', label: 'Physical and Chakra' },
    { id: 'non-strategic', label: 'non-Strategic' },
  ];
  const CHAKRA = [
    { id: 'random', label: 'random' },
    { id: 'taijutsu', label: 'Taijutsu' },
    { id: 'bloodline', label: 'Bloodline' },
    { id: 'ninjutsu', label: 'Ninjutsu' },
    { id: 'genjutsu', label: 'Genjutsu' },
  ];
  // Settings a status may carry and still count as a plain sentence: presentation and timing.
  // They're kept untouched when the sentence is edited.
  const KEEP = ['tooltipText', 'tooltipTextTemplate', 'helpful', 'harmful', 'statusIcon', 'sourceSkillName',
    'turnDurationAnchor', 'hideTooltipFromEnemy', 'hideTooltipFromUnitOwner', 'invisible', 'cannotBeCleansed',
    'permanent', 'removeOnSourceDeath', 'ongoingClass', 'triggerOnApply', 'turnEndTrigger', 'fromPassive'];

  const plural = (n, word) => `${n} ${word}${Number(n) === 1 ? '' : 's'}`;
  const slug = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const whoText = (who, ctx, form) => {
    const name = (ctx && ctx.name) || 'the user';
    if (who === 'self') return form === 'object' ? name : name;
    if (who === 'target') return form === 'subject' ? 'The target' : 'the target';
    if (who === 'all-enemy') return form === 'subject' ? 'All enemies' : 'all enemies';
    if (who === 'all-allies') return form === 'subject' ? `${name} and allies` : `${name} and allies`;
    return 'the target';
  };
  const cap = text => text.charAt(0).toUpperCase() + text.slice(1);
  const turnsText = turns => (Number(turns) >= 99 ? 'for the rest of the match' : `for ${plural(turns, 'turn')}`);

  // A status-based sentence: core setting keys, how values map to and from them, and its wording.
  function statusSentence(def) {
    return {
      ...def,
      status: true,
      create(values, ctx) {
        const harmful = def.harmful(values);
        const metadata = { [harmful ? 'harmful' : 'helpful']: true };
        if (harmful && values.who !== 'self') metadata.turnDurationAnchor = 'source_turn';
        Object.assign(metadata, def.toSettings(values));
        if (def.extraSettings) Object.assign(metadata, def.extraSettings(values));
        metadata.tooltipText = def.tooltip(values, ctx);
        return {
          type: 'apply_status',
          statusId: ctx.newStatusId(def.id),
          duration: Math.max(1, Number(values.turns) || 1),
          scope: values.who,
          metadata,
        };
      },
      read(effect) {
        if (!effect || effect.type !== 'apply_status' || effect.condition || !WHO_IDS.includes(effect.scope || 'target')) return null;
        const keys = Object.keys(effect).filter(key => !['type', 'statusId', 'duration', 'scope', 'metadata', 'fresh'].includes(key));
        if (keys.length) return null;
        const metadata = effect.metadata || {};
        const core = Object.keys(metadata).filter(key => !KEEP.includes(key));
        if (!core.length || core.some(key => !def.keys.includes(key))) return null;
        const values = def.fromSettings(metadata);
        if (!values) return null;
        return { who: effect.scope || 'target', turns: Number(effect.duration) || 1, ...values };
      },
      write(effect, values, previous, ctx) {
        effect.scope = values.who;
        effect.duration = Math.max(1, Number(values.turns) || 1);
        const metadata = effect.metadata || (effect.metadata = {});
        const next = def.toSettings(values);
        // Only rewrite the core settings when they actually change, so untouched effects stay as saved.
        if (JSON.stringify(def.toSettings(previous || {})) !== JSON.stringify(next)) {
          def.keys.forEach(key => { delete metadata[key]; });
          Object.assign(metadata, next);
        }
        if (!metadata.tooltipTextTemplate && (!metadata.tooltipText || metadata.tooltipText === def.tooltip(previous, ctx))) {
          metadata.tooltipText = def.tooltip(values, ctx);
        }
      },
    };
  }

  const SENTENCES = [
    // ------------------------------------------------------------- damage and healing
    {
      id: 'damage', group: 'Damage', label: 'Deal damage',
      fields: [
        { key: 'amount', label: 'Damage', kind: 'number', min: 0, max: 999, default: 20 },
        { key: 'kind', label: 'Kind', kind: 'choice', options: DAMAGE_KINDS, default: 'normal' },
        { key: 'who', label: 'To', kind: 'who', default: 'target', exclude: ['self', 'all-allies'] },
      ],
      parts: ['Deal', 'amount', 'kind', 'damage to', 'who'],
      create(values) {
        const effect = { type: 'damage', amount: Number(values.amount) || 0, scope: values.who };
        const metadata = kindSettings(values.kind);
        if (Object.keys(metadata).length) effect.metadata = metadata;
        return effect;
      },
      read(effect) {
        if (!effect || effect.type !== 'damage' || effect.condition || !WHO_IDS.includes(effect.scope || 'target')) return null;
        if (Object.keys(effect).some(key => !['type', 'amount', 'scope', 'metadata'].includes(key))) return null;
        const metadata = effect.metadata || {};
        const keys = Object.keys(metadata);
        let kind = 'normal';
        if (keys.length === 1 && metadata.ignoreDamageReduction === true) kind = 'piercing';
        else if (keys.length && keys.every(key => ['afflictionDamage', 'ignoreDamageReduction', 'ignoreDestructibleDefense'].includes(key)) && metadata.afflictionDamage === true) kind = 'affliction';
        else if (keys.length) return null;
        return { amount: Number(effect.amount) || 0, kind, who: effect.scope || 'target' };
      },
      write(effect, values, previous) {
        effect.amount = Number(values.amount) || 0;
        effect.scope = values.who;
        // Keep the existing damage settings unless the kind itself was changed.
        if (previous && previous.kind === values.kind) return;
        const metadata = kindSettings(values.kind);
        if (Object.keys(metadata).length) effect.metadata = metadata; else delete effect.metadata;
      },
      describe: (v, ctx) => `${ctx.name} deals ${v.amount} ${v.kind === 'normal' ? '' : `${v.kind} `}damage to ${whoText(v.who, ctx)}.`,
    },
    {
      id: 'heal', group: 'Damage', label: 'Heal',
      fields: [
        { key: 'who', label: 'Who', kind: 'who', default: 'self', exclude: ['all-enemy'] },
        { key: 'amount', label: 'Health', kind: 'number', min: 0, max: 999, default: 15 },
      ],
      parts: ['Heal', 'who', 'for', 'amount', 'health'],
      create: values => ({ type: 'heal', amount: Number(values.amount) || 0, scope: values.who }),
      read(effect) {
        if (!effect || effect.type !== 'heal' || effect.condition || effect.metadata || !WHO_IDS.includes(effect.scope || 'target')) return null;
        if (Object.keys(effect).some(key => !['type', 'amount', 'scope'].includes(key))) return null;
        return { who: effect.scope || 'target', amount: Number(effect.amount) || 0 };
      },
      write(effect, values) { effect.amount = Number(values.amount) || 0; effect.scope = values.who; },
      describe: (v, ctx) => `${ctx.name} heals ${whoText(v.who, ctx) === ctx.name ? 'themself' : whoText(v.who, ctx)} for ${v.amount} health.`,
    },
    statusSentence({
      id: 'damageOverTime', group: 'Damage', label: 'Damage each turn',
      fields: [
        { key: 'who', label: 'Who', kind: 'who', default: 'target', exclude: ['self', 'all-allies'] },
        { key: 'amount', label: 'Damage', kind: 'number', min: 0, max: 999, default: 10 },
        { key: 'kind', label: 'Kind', kind: 'choice', options: DAMAGE_KINDS, default: 'affliction' },
        { key: 'turns', label: 'Turns', kind: 'turns', default: 2 },
      ],
      parts: ['Deal', 'amount', 'kind', 'damage each turn to', 'who', 'turns'],
      keys: ['turnEndDamage', 'afflictionDamage', 'ignoreTargetDamageReduction'],
      harmful: () => true,
      toSettings: v => ({ turnEndDamage: Number(v.amount) || 0, ...(v.kind === 'affliction' ? { afflictionDamage: true } : v.kind === 'piercing' ? { ignoreTargetDamageReduction: true } : {}) }),
      extraSettings: () => ({ turnEndTrigger: 'source_turn', triggerOnApply: true }),
      fromSettings: m => (m.turnEndDamage > 0 ? { amount: m.turnEndDamage, kind: m.afflictionDamage ? 'affliction' : m.ignoreTargetDamageReduction ? 'piercing' : 'normal' } : null),
      tooltip: v => `This character takes ${v.amount} ${v.kind === 'normal' ? '' : `${v.kind} `}damage each turn.`,
      describe: (v, ctx) => `${cap(whoText(v.who, ctx))} take${v.who === 'target' ? 's' : ''} ${v.amount} ${v.kind === 'normal' ? '' : `${v.kind} `}damage each turn ${turnsText(v.turns)}.`,
    }),
    statusSentence({
      id: 'healOverTime', group: 'Damage', label: 'Heal each turn',
      fields: [
        { key: 'who', label: 'Who', kind: 'who', default: 'self', exclude: ['all-enemy'] },
        { key: 'amount', label: 'Health', kind: 'number', min: 0, max: 999, default: 5 },
        { key: 'turns', label: 'Turns', kind: 'turns', default: 3 },
      ],
      parts: ['Heal', 'who', 'for', 'amount', 'health each turn', 'turns'],
      keys: ['turnEndHealFlat'],
      harmful: () => false,
      toSettings: v => ({ turnEndHealFlat: Number(v.amount) || 0 }),
      fromSettings: m => (m.turnEndHealFlat > 0 ? { amount: m.turnEndHealFlat } : null),
      tooltip: v => `This character heals ${v.amount} health each turn.`,
      describe: (v, ctx) => `${cap(whoText(v.who, ctx))} heal${v.who === 'all-allies' ? '' : 's'} ${v.amount} health each turn ${turnsText(v.turns)}.`,
    }),

    // ------------------------------------------------------------- control
    statusSentence({
      id: 'stun', group: 'Control', label: 'Stun',
      fields: [
        { key: 'who', label: 'Who', kind: 'who', default: 'target', exclude: ['self', 'all-allies'] },
        { key: 'skills', label: 'Skills', kind: 'choice', options: STUN_KINDS, default: 'all' },
        { key: 'turns', label: 'Turns', kind: 'turns', default: 1 },
      ],
      parts: ['Stun', 'skills', 'skills of', 'who', 'turns'],
      keys: ['cannotUseSkills', 'cannotUseSkillClasses', 'cannotUseNonStrategicSkills'],
      harmful: () => true,
      toSettings: v => (v.skills === 'all' ? { cannotUseSkills: true }
        : v.skills === 'non-strategic' ? { cannotUseNonStrategicSkills: true }
          : { cannotUseSkillClasses: String(v.skills).split(',') }),
      fromSettings(m) {
        if (m.cannotUseSkills === true && !m.cannotUseSkillClasses) return { skills: 'all' };
        if (m.cannotUseNonStrategicSkills === true && !m.cannotUseSkills && !m.cannotUseSkillClasses) return { skills: 'non-strategic' };
        if (Array.isArray(m.cannotUseSkillClasses) && !m.cannotUseSkills) {
          const id = m.cannotUseSkillClasses.map(entry => String(entry).toLowerCase()).sort().join(',');
          return STUN_KINDS.some(kind => kind.id === id) ? { skills: id } : null;
        }
        return null;
      },
      tooltip: v => (v.skills === 'all' ? 'This character is stunned.' : `This character's ${stunLabel(v.skills)} skills are stunned.`),
      describe: (v, ctx) => (v.skills === 'all'
        ? `${cap(whoText(v.who, ctx))} ${v.who === 'all-enemy' ? 'are' : 'is'} stunned ${turnsText(v.turns)}.`
        : `${cap(whoText(v.who, ctx))}'${v.who === 'all-enemy' ? '' : 's'} ${stunLabel(v.skills)} skills are stunned ${turnsText(v.turns)}.`),
    }),
    statusSentence({
      id: 'cantBeHealed', group: 'Control', label: "Can't be healed",
      fields: [
        { key: 'who', label: 'Who', kind: 'who', default: 'target', exclude: ['self', 'all-allies'] },
        { key: 'turns', label: 'Turns', kind: 'turns', default: 1 },
      ],
      parts: ['Stop', 'who', 'from being healed', 'turns'],
      keys: ['healReceivedMultiplier'],
      harmful: () => true,
      toSettings: () => ({ healReceivedMultiplier: 0 }),
      fromSettings: m => (m.healReceivedMultiplier === 0 ? {} : null),
      tooltip: () => 'This character cannot be healed.',
      describe: (v, ctx) => `${cap(whoText(v.who, ctx))} can't be healed ${turnsText(v.turns)}.`,
    }),
    statusSentence({
      id: 'costMore', group: 'Control', label: 'Skills cost more',
      fields: [
        { key: 'who', label: 'Who', kind: 'who', default: 'target', exclude: ['self', 'all-allies'] },
        { key: 'amount', label: 'Extra random chakra', kind: 'number', min: 1, max: 5, default: 1 },
        { key: 'turns', label: 'Turns', kind: 'turns', default: 1 },
      ],
      parts: ['Make the skills of', 'who', 'cost', 'amount', 'more random chakra', 'turns'],
      keys: ['randomCostIncrease'],
      harmful: () => true,
      toSettings: v => ({ randomCostIncrease: Number(v.amount) || 1 }),
      fromSettings: m => (m.randomCostIncrease > 0 ? { amount: m.randomCostIncrease } : null),
      tooltip: v => `This character's skills cost ${v.amount} additional random chakra.`,
      describe: (v, ctx) => `${cap(whoText(v.who, ctx))}'s skills cost ${v.amount} more random chakra ${turnsText(v.turns)}.`,
    }),
    statusSentence({
      id: 'weaken', group: 'Control', label: 'Deal less damage',
      fields: [
        { key: 'who', label: 'Who', kind: 'who', default: 'target', exclude: ['self', 'all-allies'] },
        { key: 'amount', label: 'Less damage', kind: 'number', min: 1, max: 99, default: 10 },
        { key: 'turns', label: 'Turns', kind: 'turns', default: 1 },
      ],
      parts: ['Make', 'who', 'deal', 'amount', 'less non-affliction damage', 'turns'],
      keys: ['nonAfflictionDamageDebuffFlat'],
      harmful: () => true,
      toSettings: v => ({ nonAfflictionDamageDebuffFlat: Number(v.amount) || 0 }),
      fromSettings: m => (m.nonAfflictionDamageDebuffFlat > 0 ? { amount: m.nonAfflictionDamageDebuffFlat } : null),
      tooltip: v => `This character deals ${v.amount} less non-affliction damage.`,
      describe: (v, ctx) => `${cap(whoText(v.who, ctx))} deal${v.who === 'target' ? 's' : ''} ${v.amount} less non-affliction damage ${turnsText(v.turns)}.`,
    }),

    // ------------------------------------------------------------- protection and boosts
    statusSentence({
      id: 'invulnerable', group: 'Protection', label: 'Invulnerable',
      fields: [
        { key: 'who', label: 'Who', kind: 'who', default: 'self', exclude: ['all-enemy'] },
        { key: 'turns', label: 'Turns', kind: 'turns', default: 1 },
      ],
      parts: ['Make', 'who', 'invulnerable', 'turns'],
      keys: ['invulnerable'],
      harmful: () => false,
      toSettings: () => ({ invulnerable: true }),
      fromSettings: m => (m.invulnerable === true ? {} : null),
      tooltip: () => 'This character is invulnerable.',
      describe: (v, ctx) => `${cap(whoText(v.who, ctx))} become${v.who === 'all-allies' ? '' : 's'} invulnerable ${turnsText(v.turns)}.`,
    }),
    statusSentence({
      id: 'reduction', group: 'Protection', label: 'Damage reduction',
      fields: [
        { key: 'who', label: 'Who', kind: 'who', default: 'self', exclude: ['all-enemy'] },
        { key: 'amount', label: 'Less damage taken', kind: 'number', min: 1, max: 99, default: 10 },
        { key: 'pierce', label: 'Piercing', kind: 'choice', options: REDUCTION_KINDS, default: 'normal' },
        { key: 'turns', label: 'Turns', kind: 'turns', default: 1 },
      ],
      parts: ['Give', 'who', 'amount', 'damage reduction', 'pierce', 'turns'],
      keys: ['damageReductionFlat', 'unpierceableDamageReductionFlat'],
      harmful: () => false,
      toSettings: v => (v.pierce === 'unpierceable'
        ? { unpierceableDamageReductionFlat: Number(v.amount) || 0 }
        : { damageReductionFlat: Number(v.amount) || 0 }),
      fromSettings(m) {
        if (m.damageReductionFlat > 0 && !m.unpierceableDamageReductionFlat) return { amount: m.damageReductionFlat, pierce: 'normal' };
        if (m.unpierceableDamageReductionFlat > 0 && !m.damageReductionFlat) return { amount: m.unpierceableDamageReductionFlat, pierce: 'unpierceable' };
        return null;
      },
      tooltip: v => (v.pierce === 'unpierceable'
        ? `This character has ${v.amount} damage reduction that piercing damage cannot ignore.`
        : `This character has ${v.amount} damage reduction.`),
      describe: (v, ctx) => `${cap(whoText(v.who, ctx))} gain${v.who === 'all-allies' ? '' : 's'} ${v.amount} ${v.pierce === 'unpierceable' ? 'unpierceable ' : ''}damage reduction ${turnsText(v.turns)}.`,
    }),
    statusSentence({
      id: 'defense', group: 'Protection', label: 'Destructible defense',
      fields: [
        { key: 'who', label: 'Who', kind: 'who', default: 'self', exclude: ['all-enemy'] },
        { key: 'amount', label: 'Defense', kind: 'number', min: 1, max: 999, default: 20 },
        { key: 'turns', label: 'Turns', kind: 'turns', default: 2 },
      ],
      parts: ['Give', 'who', 'amount', 'destructible defense', 'turns'],
      keys: ['destructibleDefensePoints'],
      harmful: () => false,
      toSettings: v => ({ destructibleDefensePoints: Number(v.amount) || 0 }),
      fromSettings: m => (m.destructibleDefensePoints > 0 ? { amount: m.destructibleDefensePoints } : null),
      tooltip: v => `This character has ${v.amount} destructible defense.`,
      describe: (v, ctx) => `${cap(whoText(v.who, ctx))} gain${v.who === 'all-allies' ? '' : 's'} ${v.amount} points of destructible defense ${turnsText(v.turns)}.`,
    }),
    statusSentence({
      id: 'boost', group: 'Protection', label: 'Deal more damage',
      fields: [
        { key: 'who', label: 'Who', kind: 'who', default: 'self', exclude: ['all-enemy'] },
        { key: 'amount', label: 'More damage', kind: 'number', min: 1, max: 99, default: 5 },
        { key: 'turns', label: 'Turns', kind: 'turns', default: 2 },
      ],
      parts: ['Make', 'who', 'deal', 'amount', 'more damage', 'turns'],
      keys: ['damageBonusFlat'],
      harmful: () => false,
      toSettings: v => ({ damageBonusFlat: Number(v.amount) || 0 }),
      fromSettings: m => (m.damageBonusFlat > 0 ? { amount: m.damageBonusFlat } : null),
      tooltip: v => `This character deals ${v.amount} additional damage.`,
      describe: (v, ctx) => `${cap(whoText(v.who, ctx))} deal${v.who === 'all-allies' ? '' : 's'} ${v.amount} additional damage ${turnsText(v.turns)}.`,
    }),

    // ------------------------------------------------------------- chakra and cleanup
    {
      id: 'gainChakra', group: 'Chakra', label: 'Gain chakra',
      fields: [
        { key: 'amount', label: 'Chakra', kind: 'number', min: 1, max: 5, default: 1 },
        { key: 'chakra', label: 'Type', kind: 'choice', options: CHAKRA, default: 'random' },
      ],
      parts: ['Gain', 'amount', 'chakra', 'chakra'],
      create: v => ({ type: 'gain_chakra', amount: Number(v.amount) || 1, chakraType: v.chakra }),
      read(effect) {
        if (!effect || effect.type !== 'gain_chakra' || effect.condition || effect.metadata) return null;
        if (Object.keys(effect).some(key => !['type', 'amount', 'chakraType', 'scope'].includes(key))) return null;
        return { amount: Number(effect.amount) || 1, chakra: String(effect.chakraType || 'random').toLowerCase() };
      },
      write(effect, v) { effect.amount = Number(v.amount) || 1; effect.chakraType = v.chakra; },
      describe: (v, ctx) => `${ctx.name} gains ${v.amount} ${v.chakra === 'random' ? 'random' : cap(v.chakra)} chakra.`,
    },
    {
      id: 'removeChakra', group: 'Chakra', label: 'Remove chakra',
      fields: [
        { key: 'amount', label: 'Chakra', kind: 'number', min: 1, max: 5, default: 1 },
        { key: 'chakra', label: 'Type', kind: 'choice', options: CHAKRA, default: 'random' },
      ],
      parts: ['Remove', 'amount', 'chakra', "chakra from the target's team"],
      create: v => (v.chakra === 'random'
        ? { type: 'remove_random_chakra', amount: Number(v.amount) || 1, scope: 'target' }
        : { type: 'remove_chakra', amount: Number(v.amount) || 1, chakraType: v.chakra, scope: 'target' }),
      read(effect) {
        if (!effect || effect.condition || effect.metadata) return null;
        if (effect.type === 'remove_random_chakra' && Object.keys(effect).every(key => ['type', 'amount', 'scope'].includes(key))) return { amount: Number(effect.amount) || 1, chakra: 'random' };
        if (effect.type === 'remove_chakra' && Object.keys(effect).every(key => ['type', 'amount', 'scope', 'chakraType'].includes(key))) return { amount: Number(effect.amount) || 1, chakra: String(effect.chakraType || 'random').toLowerCase() };
        return null;
      },
      write(effect, v) {
        const fresh = this.create(v);
        Object.keys(effect).forEach(key => { delete effect[key]; });
        Object.assign(effect, fresh);
      },
      describe: v => `The target's team loses ${v.amount} ${v.chakra === 'random' ? 'random' : cap(v.chakra)} chakra.`,
    },
    {
      id: 'stealChakra', group: 'Chakra', label: 'Steal chakra',
      fields: [{ key: 'amount', label: 'Chakra', kind: 'number', min: 1, max: 5, default: 1 }],
      parts: ['Steal', 'amount', "random chakra from the target's team"],
      create: v => ({ type: 'steal_chakra', amount: Number(v.amount) || 1, scope: 'target' }),
      read(effect) {
        if (!effect || effect.type !== 'steal_chakra' || effect.condition || effect.metadata) return null;
        if (Object.keys(effect).some(key => !['type', 'amount', 'scope'].includes(key))) return null;
        return { amount: Number(effect.amount) || 1 };
      },
      write(effect, v) { effect.amount = Number(v.amount) || 1; },
      describe: (v, ctx) => `${ctx.name} steals ${v.amount} random chakra from the target's team.`,
    },
    {
      id: 'cleanse', group: 'Chakra', label: 'Remove harmful effects',
      fields: [{ key: 'who', label: 'From', kind: 'who', default: 'self', exclude: ['all-enemy'] }],
      parts: ['Remove harmful effects from', 'who'],
      create: v => ({ type: 'cleanse_statuses', scope: v.who, harmfulOnly: true }),
      read(effect) {
        if (!effect || effect.type !== 'cleanse_statuses' || effect.condition || effect.metadata || effect.harmfulOnly !== true) return null;
        if (Object.keys(effect).some(key => !['type', 'scope', 'harmfulOnly'].includes(key))) return null;
        return { who: effect.scope || 'target' };
      },
      write(effect, v) { effect.scope = v.who; },
      describe: (v, ctx) => `Harmful effects are removed from ${whoText(v.who, ctx)}.`,
    },
    {
      id: 'breakDefense', group: 'Chakra', label: 'Destroy destructible defense',
      fields: [{ key: 'who', label: 'Whose', kind: 'who', default: 'target', exclude: ['self', 'all-allies'] }],
      parts: ['Destroy the destructible defense of', 'who'],
      create: v => ({ type: 'destroy_destructible_defense', scope: v.who }),
      read(effect) {
        if (!effect || effect.type !== 'destroy_destructible_defense' || effect.condition || effect.metadata || effect.amount !== undefined) return null;
        if (Object.keys(effect).some(key => !['type', 'scope'].includes(key))) return null;
        return { who: effect.scope || 'target' };
      },
      write(effect, v) { effect.scope = v.who; },
      describe: (v, ctx) => `${cap(whoText(v.who, ctx))}'s destructible defense is destroyed.`,
    },
  ];

  // ------------------------------------------------------------- signature mechanics
  // Guided versions of the distinctive mechanics the live roster uses. Each copies a proven shape:
  // counters (Sasuke), traps (Iruka, Kankuro), transforms (Oboro), marks (Tenten), stacks (Naruto, Chouji).
  const CANCEL = [
    { id: 'cancel', label: 'is cancelled' },
    { id: 'land', label: 'still works' },
  ];
  const TRAP_WHEN = [
    { id: 'harmful', label: 'a harmful skill' },
    { id: 'damaging', label: 'a damaging skill' },
    { id: 'any', label: 'any skill' },
  ];
  const COUNTER_KEYS = ['triggerOnEnemyHarmfulSkill', 'counterCancelsSkill', 'counterDamage', 'counterStatusId',
    'counterStatusDuration', 'counterStatusMetadata', 'counterDamageAttributedToStatusSource'];
  const TRAP_KEYS = [...COUNTER_KEYS, 'triggerOnlyOnOwnerSkillUse', 'triggerOnlyOnDamagingSkill', 'triggerOnOwnerHelpfulSkill'];
  const onlyKeys = (metadata, allowed) => Object.keys(metadata || {}).every(key => KEEP.includes(key) || allowed.includes(key));
  const statusShapeOk = effect => effect && effect.type === 'apply_status' && !effect.condition &&
    Object.keys(effect).every(key => ['type', 'statusId', 'duration', 'scope', 'metadata', 'fresh'].includes(key));
  // The stun a counter or trap puts on whoever sets it off.
  const stunOk = metadata => !metadata || (Object.keys(metadata).every(key => ['harmful', 'cannotUseSkills', 'tooltipText'].includes(key)) && metadata.cannotUseSkills === true);
  function counterSettings(values, statusId, base) {
    const metadata = { ...base, counterCancelsSkill: values.cancel !== 'land' };
    if (Number(values.damage) > 0) metadata.counterDamage = Number(values.damage);
    if (Number(values.stun) > 0) {
      metadata.counterStatusId = `${statusId}_stun`;
      metadata.counterStatusDuration = Number(values.stun);
      metadata.counterStatusMetadata = { harmful: true, cannotUseSkills: true, tooltipText: 'This character is stunned.' };
    }
    return metadata;
  }
  function counterOutcome(values) {
    const parts = [];
    if (Number(values.damage) > 0) parts.push(`take ${values.damage} damage`);
    if (Number(values.stun) > 0) parts.push(`are stunned for ${plural(values.stun, 'turn')}`);
    return parts.length ? parts.join(' and ') : 'suffer nothing else';
  }
  // Counters and traps are rebuilt from their values, keeping the status name, the stun's name,
  // presentation settings and any hand-written tooltip.
  function writeCounter(effect, values, previous, ctx, sentence) {
    const keep = effect.metadata || {};
    const fresh = sentence.create(values, { ...ctx, newStatusId: () => effect.statusId });
    effect.scope = fresh.scope;
    effect.duration = fresh.duration;
    const metadata = { ...fresh.metadata };
    if (keep.counterStatusId && metadata.counterStatusId) metadata.counterStatusId = keep.counterStatusId;
    KEEP.forEach(key => { if (keep[key] !== undefined && key !== 'tooltipText') metadata[key] = keep[key]; });
    if (keep.tooltipText && keep.tooltipText !== sentence.tooltip(previous, ctx)) metadata.tooltipText = keep.tooltipText;
    if (JSON.stringify(values) === JSON.stringify(previous)) return; // nothing changed: leave the saved effect alone
    effect.metadata = metadata;
  }

  const SIGNATURE = [
    {
      id: 'counter', group: 'Signature mechanics', label: 'Counter',
      fields: [
        { key: 'turns', label: 'Turns', kind: 'turns', default: 1 },
        { key: 'who', label: 'Protects', kind: 'who', default: 'self', exclude: ['all-enemy', 'all-allies'] },
        { key: 'cancel', label: 'Their skill', kind: 'choice', options: CANCEL, default: 'cancel' },
        { key: 'damage', label: 'Damage', kind: 'number', min: 0, max: 999, default: 0 },
        { key: 'stun', label: 'Stun turns', kind: 'number', min: 0, max: 5, default: 1 },
      ],
      parts: ['turns', ', the first enemy who uses a harmful skill on', 'who', 'is countered. Their skill', 'cancel', '. They take', 'damage', 'damage and are stunned for', 'stun', 'turns (0 for none).'],
      create(values, ctx) {
        const statusId = ctx.newStatusId('counter');
        const effect = { type: 'apply_status', statusId, duration: Math.max(1, Number(values.turns) || 1), scope: values.who,
          metadata: counterSettings(values, statusId, { helpful: true, hideTooltipFromEnemy: true, triggerOnEnemyHarmfulSkill: true }) };
        effect.metadata.tooltipText = this.tooltip(values, ctx);
        return effect;
      },
      read(effect) {
        if (!statusShapeOk(effect) || !['self', 'target'].includes(effect.scope || 'target')) return null;
        const m = effect.metadata || {};
        if (m.triggerOnEnemyHarmfulSkill !== true || m.triggerOnlyOnOwnerSkillUse || !onlyKeys(m, COUNTER_KEYS) || !stunOk(m.counterStatusMetadata)) return null;
        return { turns: Number(effect.duration) || 1, who: effect.scope || 'target', cancel: m.counterCancelsSkill === false ? 'land' : 'cancel',
          damage: Number(m.counterDamage) || 0, stun: m.counterStatusMetadata ? Number(m.counterStatusDuration) || 0 : 0 };
      },
      write(effect, values, previous, ctx) { writeCounter(effect, values, previous, ctx, this); },
      tooltip: v => `The first enemy to use a harmful skill on this character is countered: their skill ${v.cancel === 'land' ? 'still works' : 'is cancelled'}, and they ${counterOutcome(v)}.`,
      describe: (v, ctx) => `${cap(turnsText(v.turns))}, the first enemy who uses a harmful skill on ${whoText(v.who, ctx)} is countered: their skill ${v.cancel === 'land' ? 'still works' : 'is cancelled'}, and they ${counterOutcome(v)}.`,
    },
    {
      id: 'trap', group: 'Signature mechanics', label: 'Trap',
      fields: [
        { key: 'turns', label: 'Turns', kind: 'turns', default: 1 },
        { key: 'who', label: 'Trapped', kind: 'who', default: 'target', exclude: ['self', 'all-allies'] },
        { key: 'when', label: 'Uses', kind: 'choice', options: TRAP_WHEN, default: 'harmful' },
        { key: 'cancel', label: 'Their skill', kind: 'choice', options: CANCEL, default: 'land' },
        { key: 'damage', label: 'Damage', kind: 'number', min: 0, max: 999, default: 20 },
        { key: 'stun', label: 'Stun turns', kind: 'number', min: 0, max: 5, default: 0 },
      ],
      parts: ['turns', ', if', 'who', 'uses', 'when', ', that skill', 'cancel', '. They take', 'damage', 'damage and are stunned for', 'stun', 'turns (0 for none).'],
      create(values, ctx) {
        const statusId = ctx.newStatusId('trap');
        const base = { harmful: true, hideTooltipFromUnitOwner: true, turnDurationAnchor: 'source_turn',
          triggerOnEnemyHarmfulSkill: true, triggerOnlyOnOwnerSkillUse: true };
        if (values.when === 'damaging') base.triggerOnlyOnDamagingSkill = true;
        if (values.when === 'any') base.triggerOnOwnerHelpfulSkill = true;
        if (Number(values.damage) > 0) base.counterDamageAttributedToStatusSource = true;
        const effect = { type: 'apply_status', statusId, duration: Math.max(1, Number(values.turns) || 1), scope: values.who,
          metadata: counterSettings(values, statusId, base) };
        effect.metadata.tooltipText = this.tooltip(values, ctx);
        return effect;
      },
      read(effect) {
        if (!statusShapeOk(effect) || !['target', 'all-enemy'].includes(effect.scope || 'target')) return null;
        const m = effect.metadata || {};
        if (m.triggerOnEnemyHarmfulSkill !== true || m.triggerOnlyOnOwnerSkillUse !== true || !onlyKeys(m, TRAP_KEYS) || !stunOk(m.counterStatusMetadata)) return null;
        if (m.triggerOnlyOnDamagingSkill && m.triggerOnOwnerHelpfulSkill) return null;
        return { turns: Number(effect.duration) || 1, who: effect.scope || 'target',
          when: m.triggerOnlyOnDamagingSkill ? 'damaging' : m.triggerOnOwnerHelpfulSkill ? 'any' : 'harmful',
          cancel: m.counterCancelsSkill === false ? 'land' : 'cancel', damage: Number(m.counterDamage) || 0,
          stun: m.counterStatusMetadata ? Number(m.counterStatusDuration) || 0 : 0 };
      },
      write(effect, values, previous, ctx) { writeCounter(effect, values, previous, ctx, this); },
      tooltip: v => `If this character uses ${(TRAP_WHEN.find(w => w.id === v.when) || TRAP_WHEN[0]).label}, it ${v.cancel === 'land' ? 'still works' : 'is cancelled'} and they ${counterOutcome(v)}.`,
      describe: (v, ctx) => `${cap(turnsText(v.turns))}, if ${whoText(v.who, ctx)} use${v.who === 'all-enemy' ? '' : 's'} ${(TRAP_WHEN.find(w => w.id === v.when) || TRAP_WHEN[0]).label}, it ${v.cancel === 'land' ? 'still works' : 'is cancelled'} and they ${counterOutcome(v)}.`,
    },
    {
      id: 'transform', group: 'Signature mechanics', label: 'Transform a skill',
      fields: [
        { key: 'turns', label: 'Turns', kind: 'turns', default: 2 },
        { key: 'from', label: 'Skill', kind: 'skill', default: '' },
        { key: 'to', label: 'Becomes', kind: 'skill', default: '', allowNew: true },
      ],
      parts: ['turns', ',', 'from', 'becomes', 'to'],
      create(values, ctx) {
        return { type: 'apply_status', statusId: ctx.newStatusId('transform'), duration: Math.max(1, Number(values.turns) || 1), scope: 'self',
          metadata: { helpful: true, skillReplacements: { [values.from]: values.to }, tooltipText: this.tooltip(values, ctx) } };
      },
      read(effect) {
        if (!statusShapeOk(effect) || (effect.scope || 'target') !== 'self') return null;
        const m = effect.metadata || {};
        const swaps = m.skillReplacements && typeof m.skillReplacements === 'object' ? Object.entries(m.skillReplacements) : [];
        if (swaps.length !== 1 || !onlyKeys(m, ['skillReplacements'])) return null;
        return { turns: Number(effect.duration) || 1, from: swaps[0][0], to: swaps[0][1] };
      },
      write(effect, values, previous, ctx) {
        effect.duration = Math.max(1, Number(values.turns) || 1);
        const metadata = effect.metadata || (effect.metadata = {});
        if (previous.from !== values.from || previous.to !== values.to) metadata.skillReplacements = { [values.from]: values.to };
        if (!metadata.tooltipTextTemplate && (!metadata.tooltipText || metadata.tooltipText === this.tooltip(previous, ctx))) metadata.tooltipText = this.tooltip(values, ctx);
      },
      tooltip: (v, ctx) => `${ctx.skillName(v.from)} becomes ${ctx.skillName(v.to)}.`,
      describe: (v, ctx) => `${cap(turnsText(v.turns))}, ${ctx.skillName(v.from)} becomes ${ctx.skillName(v.to)}.`,
    },
    {
      id: 'mark', group: 'Signature mechanics', label: 'Mark an enemy',
      fields: [
        { key: 'who', label: 'Marked', kind: 'who', default: 'target', exclude: ['self', 'all-allies'] },
        { key: 'turns', label: 'Turns', kind: 'turns', default: 3 },
        { key: 'amount', label: 'More damage', kind: 'number', min: 1, max: 99, default: 10 },
        { key: 'skill', label: 'From', kind: 'skill', default: '', allowAll: true },
      ],
      parts: ['Mark', 'who', 'turns', ': they take', 'amount', 'more damage from', 'skill'],
      create(values, ctx) {
        const metadata = { harmful: true, turnDurationAnchor: 'source_turn', bonusDamageFromSourceSkillsFlat: Number(values.amount) || 0,
          bonusDamageFromSourceCharacterId: ctx.characterId };
        if (values.skill) metadata.bonusDamageAppliesToSkillIds = [values.skill];
        metadata.tooltipText = this.tooltip(values, ctx);
        return { type: 'apply_status', statusId: ctx.newStatusId('mark'), duration: Math.max(1, Number(values.turns) || 1), scope: values.who, metadata };
      },
      read(effect) {
        if (!statusShapeOk(effect) || !['target', 'all-enemy'].includes(effect.scope || 'target')) return null;
        const m = effect.metadata || {};
        if (!(m.bonusDamageFromSourceSkillsFlat > 0) || !m.bonusDamageFromSourceCharacterId ||
          !onlyKeys(m, ['bonusDamageFromSourceSkillsFlat', 'bonusDamageFromSourceCharacterId', 'bonusDamageAppliesToSkillIds'])) return null;
        const ids = m.bonusDamageAppliesToSkillIds;
        if (Array.isArray(ids) && ids.length > 1) return null;
        return { who: effect.scope || 'target', turns: Number(effect.duration) || 1, amount: m.bonusDamageFromSourceSkillsFlat, skill: Array.isArray(ids) ? ids[0] : '' };
      },
      write(effect, values, previous, ctx) {
        effect.scope = values.who;
        effect.duration = Math.max(1, Number(values.turns) || 1);
        const metadata = effect.metadata || (effect.metadata = {});
        metadata.bonusDamageFromSourceSkillsFlat = Number(values.amount) || 0;
        if (previous.skill !== values.skill) {
          if (values.skill) metadata.bonusDamageAppliesToSkillIds = [values.skill]; else delete metadata.bonusDamageAppliesToSkillIds;
        }
        if (!metadata.tooltipTextTemplate && (!metadata.tooltipText || metadata.tooltipText === this.tooltip(previous, ctx))) metadata.tooltipText = this.tooltip(values, ctx);
      },
      tooltip: (v, ctx) => `This character takes ${v.amount} more damage from ${v.skill ? ctx.skillName(v.skill) : `${ctx.name}'s skills`}.`,
      describe: (v, ctx) => `${cap(whoText(v.who, ctx))} ${v.who === 'all-enemy' ? 'are' : 'is'} marked ${turnsText(v.turns)}, taking ${v.amount} more damage from ${v.skill ? ctx.skillName(v.skill) : `${ctx.name}'s skills`}.`,
    },
    {
      id: 'gainStack', group: 'Signature mechanics', label: 'Gain a stack',
      askName: true,
      fields: [
        { key: 'name', label: 'Stack', kind: 'label', default: 'Stack' },
        { key: 'max', label: 'Most', kind: 'number', min: 1, max: 99, default: 5 },
      ],
      parts: ['Gain 1', 'name', '(up to', 'max', ')'],
      create(values, ctx) {
        const key = stackKey(values.name);
        return { type: 'apply_status', statusId: ctx.newStatusId(slug(values.name) || 'stacks'), duration: 99, scope: 'self',
          metadata: { helpful: true, cannotBeCleansed: true, stackMetadataKey: key, stackDelta: 1, stackMax: Number(values.max) || 5,
            tooltipTextTemplate: `${ctx.name}'s ${values.name} stacks: {${key}}.` } };
      },
      read(effect) {
        if (!statusShapeOk(effect) || (effect.scope || 'target') !== 'self') return null;
        const m = effect.metadata || {};
        if (typeof m.stackMetadataKey !== 'string' || m.stackDelta !== 1 || !onlyKeys(m, ['stackMetadataKey', 'stackDelta', 'stackMax'])) return null;
        return { name: stackLabel(m.stackMetadataKey), max: Number(m.stackMax) || 1 };
      },
      write(effect, values) { (effect.metadata || (effect.metadata = {})).stackMax = Number(values.max) || 1; },
      describe: (v, ctx) => `${ctx.name} gains 1 ${v.name} (up to ${v.max}).`,
    },
    {
      id: 'damagePerStack', group: 'Signature mechanics', label: 'Damage that grows with stacks',
      fields: [
        { key: 'amount', label: 'Damage', kind: 'number', min: 0, max: 999, default: 20 },
        { key: 'kind', label: 'Kind', kind: 'choice', options: DAMAGE_KINDS, default: 'normal' },
        { key: 'who', label: 'To', kind: 'who', default: 'target', exclude: ['self', 'all-allies'] },
        { key: 'per', label: 'Extra per stack', kind: 'number', min: 1, max: 99, default: 5 },
        { key: 'stack', label: 'Stack', kind: 'stack', default: '' },
      ],
      parts: ['Deal', 'amount', 'kind', 'damage to', 'who', ', plus', 'per', 'for each', 'stack'],
      create(values) {
        const [statusId, metadataKey] = String(values.stack || '|').split('|');
        return { type: 'damage', amount: Number(values.amount) || 0, scope: values.who,
          metadata: { ...kindSettings(values.kind), bonusPerStatusMetadata: { statusId, metadataKey, multiplier: Number(values.per) || 0, scope: 'self' } } };
      },
      read(effect) {
        if (!effect || effect.type !== 'damage' || effect.condition || !WHO_IDS.includes(effect.scope || 'target')) return null;
        if (Object.keys(effect).some(key => !['type', 'amount', 'scope', 'metadata'].includes(key))) return null;
        const m = effect.metadata || {};
        const bonus = m.bonusPerStatusMetadata;
        if (!bonus || (bonus.scope && bonus.scope !== 'self') || Object.keys(m).some(key => !['bonusPerStatusMetadata', 'afflictionDamage', 'ignoreDamageReduction'].includes(key))) return null;
        if (Object.keys(bonus).some(key => !['statusId', 'metadataKey', 'multiplier', 'scope'].includes(key))) return null;
        return { amount: Number(effect.amount) || 0, kind: m.afflictionDamage ? 'affliction' : m.ignoreDamageReduction ? 'piercing' : 'normal',
          who: effect.scope || 'target', per: Number(bonus.multiplier) || 0, stack: `${bonus.statusId}|${bonus.metadataKey}` };
      },
      write(effect, values, previous) {
        effect.amount = Number(values.amount) || 0;
        effect.scope = values.who;
        const metadata = effect.metadata || (effect.metadata = {});
        const bonus = metadata.bonusPerStatusMetadata || (metadata.bonusPerStatusMetadata = {});
        bonus.multiplier = Number(values.per) || 0;
        if (previous.stack !== values.stack) {
          const [statusId, metadataKey] = String(values.stack || '|').split('|');
          bonus.statusId = statusId;
          bonus.metadataKey = metadataKey;
        }
        if (previous.kind !== values.kind) {
          delete metadata.afflictionDamage;
          delete metadata.ignoreDamageReduction;
          Object.assign(metadata, kindSettings(values.kind));
        }
      },
      describe: (v, ctx) => `${ctx.name} deals ${v.amount} ${v.kind === 'normal' ? '' : `${v.kind} `}damage to ${whoText(v.who, ctx)}, plus ${v.per} for each ${ctx.stackName(v.stack)}.`,
    },
  ];

  function stackKey(name) {
    const words = String(name || 'stack').replace(/[^A-Za-z0-9 ]/g, ' ').trim().split(/\s+/).filter(Boolean);
    return words.map((word, index) => (index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())).join('') || 'stacks';
  }
  function stackLabel(key) {
    return String(key || '').replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, ch => ch.toUpperCase());
  }

  SENTENCES.push(...SIGNATURE);

  // ------------------------------------------------------------- quests
  // A simple quest: after using N skills, the character awakens and gains rewards. Shapes copy
  // Naruto's and Sakura's quests; anything more involved stays a special mechanic.
  const QUEST_KEYS = ['statusId', 'afterOwnerSkillUses', 'progressTooltipTextTemplate', 'completedTooltipText', 'metadata'];
  const QUEST_REWARD_KEYS = ['turnEndHealFlat', 'damageReductionFlat', 'damageBonusFlat', 'ignoresPartialStuns', 'skillReplacements'];
  const QUEST_KEEP = ['helpful', 'permanent', 'cannotBeCleansed', 'sourceSkillName', 'tooltipText', 'statusIcon'];
  function readQuest(quest) {
    if (!quest || typeof quest !== 'object') return null;
    if (Object.keys(quest).some(key => !QUEST_KEYS.includes(key)) || !(quest.afterOwnerSkillUses > 0)) return null;
    const m = quest.metadata || {};
    if (Object.keys(m).some(key => !QUEST_REWARD_KEYS.includes(key) && !QUEST_KEEP.includes(key))) return null;
    const swaps = m.skillReplacements ? Object.entries(m.skillReplacements) : [];
    if (swaps.length > 1) return null;
    return {
      skills: Number(quest.afterOwnerSkillUses),
      heal: Number(m.turnEndHealFlat) || 0,
      reduction: Number(m.damageReductionFlat) || 0,
      boost: Number(m.damageBonusFlat) || 0,
      partialStuns: m.ignoresPartialStuns === true,
      swapFrom: swaps.length ? swaps[0][0] : '',
      swapTo: swaps.length ? swaps[0][1] : '',
    };
  }
  function questRewardsText(values, ctx) {
    const parts = [];
    if (values.heal > 0) parts.push(`heals ${values.heal} health each turn`);
    if (values.reduction > 0) parts.push(`takes ${values.reduction} less damage`);
    if (values.boost > 0) parts.push(`deals ${values.boost} more damage`);
    if (values.partialStuns) parts.push('ignores partial stuns');
    if (values.swapFrom && values.swapTo) parts.push(`${ctx.skillName(values.swapFrom)} becomes ${ctx.skillName(values.swapTo)}`);
    if (!parts.length) return 'gains nothing yet';
    return parts.length === 1 ? parts[0] : `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
  }
  function questTexts(values, ctx, passiveName) {
    const rewards = questRewardsText(values, ctx);
    return {
      progress: `Quest: ${ctx.name} uses ${values.skills} skills. Progress: {awakeningSkillUses}/${values.skills}.\n\nReward: ${ctx.name} ${rewards}.`,
      completed: `${passiveName || 'The quest'} is complete. ${ctx.name} ${rewards}.`,
    };
  }
  function questMetadata(values, base) {
    const metadata = { ...(base || {}) };
    QUEST_REWARD_KEYS.forEach(key => { delete metadata[key]; });
    if (values.heal > 0) metadata.turnEndHealFlat = values.heal;
    if (values.reduction > 0) metadata.damageReductionFlat = values.reduction;
    if (values.boost > 0) metadata.damageBonusFlat = values.boost;
    if (values.partialStuns) metadata.ignoresPartialStuns = true;
    if (values.swapFrom && values.swapTo) metadata.skillReplacements = { [values.swapFrom]: values.swapTo };
    return metadata;
  }
  // Writes a quest onto a passive: creates it, or updates it in place keeping hand-written tooltips.
  function writeQuest(passive, values, previous, ctx) {
    const texts = questTexts(values, ctx, passive.name);
    if (!passive.awakening) {
      passive.awakening = {
        statusId: ctx.newStatusId('awakened'),
        afterOwnerSkillUses: values.skills,
        progressTooltipTextTemplate: texts.progress,
        completedTooltipText: texts.completed,
        metadata: questMetadata(values, { helpful: true, permanent: true, cannotBeCleansed: true }),
      };
      return;
    }
    const quest = passive.awakening;
    const old = previous ? questTexts(previous, ctx, passive.name) : null;
    quest.afterOwnerSkillUses = values.skills;
    if (!previous || JSON.stringify(questMetadata(previous, {})) !== JSON.stringify(questMetadata(values, {}))) {
      quest.metadata = questMetadata(values, quest.metadata);
    }
    if (!quest.progressTooltipTextTemplate || (old && quest.progressTooltipTextTemplate === old.progress)) quest.progressTooltipTextTemplate = texts.progress;
    if (!quest.completedTooltipText || (old && quest.completedTooltipText === old.completed)) quest.completedTooltipText = texts.completed;
  }

  function kindSettings(kind) {
    if (kind === 'piercing') return { ignoreDamageReduction: true };
    if (kind === 'affliction') return { afflictionDamage: true };
    return {};
  }
  function stunLabel(id) {
    return (STUN_KINDS.find(kind => kind.id === id) || { label: id }).label;
  }

  const BY_ID = Object.fromEntries(SENTENCES.map(sentence => [sentence.id, sentence]));

  // Which sentence (if any) an existing effect is, and its values.
  function readEffect(effect) {
    for (const sentence of SENTENCES) {
      const values = sentence.read(effect);
      if (values) return { sentence: sentence.id, values };
    }
    return null;
  }
  function defaults(sentenceId) {
    const sentence = BY_ID[sentenceId];
    return Object.fromEntries((sentence ? sentence.fields : []).map(field => [field.key, field.default]));
  }
  // A context for one character: its name, and fresh status names that don't clash.
  function contextFor(character, skill) {
    const taken = new Set();
    JSON.stringify(character || {}, (key, value) => { if (key === 'statusId' && typeof value === 'string') taken.add(value); return value; });
    const name = String((character && character.name) || 'This character').split(' ').slice(-1)[0] || 'This character';
    const skills = ((character && character.skills) || []).filter(entry => entry && entry.id)
      .map(entry => ({ id: entry.id, name: entry.name || entry.id, alternate: Boolean(entry.hiddenFromSelectionViewer) }));
    // Stacks this character keeps (from "Gain a stack" lines anywhere on it).
    const stacks = [];
    JSON.stringify(character || {}, (key, value) => {
      if (value && typeof value === 'object' && typeof value.statusId === 'string' && value.metadata && typeof value.metadata.stackMetadataKey === 'string') {
        const id = `${value.statusId}|${value.metadata.stackMetadataKey}`;
        if (!stacks.some(entry => entry.id === id)) stacks.push({ id, label: stackLabel(value.metadata.stackMetadataKey) });
      }
      return value;
    });
    return {
      name,
      characterId: (character && character.characterId) || '',
      skills,
      stacks,
      skillName: id => (skills.find(entry => entry.id === id) || { name: id || 'a skill' }).name,
      stackName: id => (stacks.find(entry => entry.id === id) || { label: String(id || '').split('|')[1] || 'stack' }).label,
      newStatusId(kind) {
        const base = slug(`${(character && character.characterId) || 'character'}_${(skill && skill.name) || 'skill'}_${kind}`);
        let id = base;
        let n = 2;
        while (taken.has(id)) { id = `${base}_${n}`; n += 1; }
        taken.add(id);
        return id;
      },
    };
  }

  // A description written from the skill's sentences (special mechanics are left out).
  function describeSkill(skill, character) {
    const ctx = contextFor(character, skill);
    return (skill.effects || []).map(effect => {
      const found = readEffect(effect);
      return found ? BY_ID[found.sentence].describe(found.values, ctx) : '';
    }).filter(Boolean).join(' ');
  }

  return { SENTENCES, BY_ID, WHO, readEffect, defaults, contextFor, describeSkill, stackKey, stackLabel, readQuest, writeQuest };
});
