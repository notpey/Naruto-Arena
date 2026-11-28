// ACP Character Editor: adjust live characters with the Concept Drafts card layout.
// The form edits a deep copy of the saved character; anything it doesn't show (effect logic,
// engine flags) is carried through untouched. The server validates the shape on save.
(function () {
  'use strict';
  const CHAKRA = ['Taijutsu', 'Bloodline', 'Ninjutsu', 'Genjutsu', 'Random'];
  const RULES = [
    ['cannotBeCountered', "Can't be countered"],
    ['cannotBeReflected', "Can't be reflected"],
    ['ignoreInvulnerability', 'Ignores invulnerability'],
    ['hiddenFromSelectionViewer', 'Hidden on the selection screen'],
  ];
  // Text and icon fields players see in tooltips, wherever they sit in a skill or passive.
  const TOOLTIP_KEYS = ['tooltipText', 'tooltipTextTemplate', 'stackTooltipTextTemplate', 'statusIcon'];
  const FIELD_LABELS = {
    name: 'Name', facePicture: 'Face picture', characterdeescription: 'Description', requiredMissionId: 'Unlock mission',
    tags: 'Tags', characterId: 'Character id', skillimage: 'Image', skilldescription: 'Description', energy: 'Chakra cost',
    cooldown: 'Cooldown', classes: 'Classes', target: 'Target', icon: 'Image', description: 'Description',
    amount: 'Amount', duration: 'Duration', tooltipText: 'Tooltip', tooltipTextTemplate: 'Tooltip template',
    stackTooltipTextTemplate: 'Stack tooltip', statusIcon: 'Status icon',
    cannotBeCountered: "Can't be countered", cannotBeReflected: "Can't be reflected",
    ignoreInvulnerability: 'Ignores invulnerability', hiddenFromSelectionViewer: 'Hidden on selection screen',
  };
  const NEW_CHARACTER = {
    id: 'new-character', characterId: 'new-character', name: 'New Character', facePicture: '', characterdeescription: '',
    skills: [1, 2, 3, 4].map(n => ({ id: `new-character-skill-${n}`, name: `Skill ${n}`, skillimage: '', skilldescription: '', energy: n === 4 ? [] : ['Random'], target: n === 4 ? 'self' : 'single-enemy', damage: 0, cooldown: n === 4 ? 4 : 0, classes: n === 4 ? ['Instant'] : [], effects: [] })),
  };

  const $ = id => document.getElementById(id);
  const form = $('character-form');
  const list = $('roster-list');
  const saveButton = $('save-character');
  const state = $('save-state');
  const preview = $('preview-content');
  const changesContent = $('changes-content');
  const raw = $('raw-json');

  const ARCS = (window.NarutoRosterCatalog && window.NarutoRosterCatalog.arcs) || [];
  const ACTION_LABELS = { create: 'Created', edit: 'Edited', retire: 'Retired', restore: 'Brought back', 'code-update': 'Code update' };

  let roster = [];
  let revisions = {};
  let accessPolicies = null;
  let missions = [];
  let knownClasses = [];
  let knownTargets = [];
  let original = null;
  let working = null;
  // Draft mode: the working copy is an editor draft (not live) rather than a roster character.
  let isNew = false;
  let draftMeta = null;
  let drafts = [];
  let builder = null;
  // The sentence view is the default; the full block builder is an owner-only Advanced view.
  let advancedView = false;
  const SL = window.CharacterSentences || null;
  let view = 'edit';
  let busy = false;
  let uploadPath = null;
  let historyFor = '';
  let builderCatalog = null;
  let currentChecks = [];

  // ---------- helpers ----------
  const clone = value => JSON.parse(JSON.stringify(value));
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  }
  function imageSrc(url) {
    const value = String(url || '').trim();
    if (!value) return '';
    return window.localCharacterImage ? window.localCharacterImage(value) : value;
  }
  function getAt(object, path) { return path.reduce((value, key) => (value == null ? undefined : value[key]), object); }
  function setAt(object, path, value) {
    const parent = getAt(object, path.slice(0, -1));
    if (parent && typeof parent === 'object') parent[path[path.length - 1]] = value;
  }
  function pathAttr(path) { return escapeHtml(JSON.stringify(path)); }
  function humanize(value) {
    return String(value || '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, ch => ch.toUpperCase());
  }
  function statusName(statusId) {
    const prefix = String(working?.characterId || '').replace(/-/g, '_') + '_';
    const id = String(statusId || '');
    return humanize(id.startsWith(prefix) ? id.slice(prefix.length) : id);
  }
  function scopeLabel(scope) {
    return ({ target: 'target', self: 'self', 'all-enemy': 'all enemies', 'all-allies': 'all allies', 'all-ally': 'all allies', 'other-allies': 'other allies' })[scope] || humanize(scope).toLowerCase();
  }
  async function request(url, options) {
    const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...options });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || `Request failed (${response.status}).`);
      error.status = response.status;
      throw error;
    }
    return data;
  }
  function setState(message, tone) {
    state.textContent = message;
    state.className = tone ? `is-${tone}` : '';
  }

  // ---------- change tracking ----------
  function diff(before, after, path, out) {
    if (same(before, after)) return out;
    const leaf = v => v == null || typeof v !== 'object' || (Array.isArray(v) && v.every(item => item == null || typeof item !== 'object'));
    if (leaf(before) || leaf(after) || Array.isArray(before) !== Array.isArray(after)) {
      out.push({ path, before, after });
      return out;
    }
    new Set([...Object.keys(before), ...Object.keys(after)]).forEach(key => diff(before[key], after[key], path.concat(Array.isArray(before) ? Number(key) : key), out));
    return out;
  }
  function changes() { return original && working ? diff(original, working, [], []) : []; }
  function labelFor(path) {
    const parts = [];
    let base = working;
    let index = 0;
    if (path[0] === 'skills') {
      const skill = working.skills?.[path[1]];
      parts.push(skill?.name || `Skill ${path[1] + 1}`);
      base = skill; index = 2;
    } else if (path[0] === 'passive') {
      parts.push(`Passive (${working.passive?.name || 'unnamed'})`);
      base = working.passive; index = 1;
    }
    if (path[index] === 'effects') {
      const effect = base?.effects?.[path[index + 1]];
      const status = effect?.statusId ? statusName(effect.statusId) : '';
      parts.push(status && status !== parts[0] ? status : status ? 'Status' : `Effect ${path[index + 1] + 1} (${humanize(effect?.type)})`);
      index += 2;
      if (path[index] === 'metadata') index += 1;
    }
    const rest = path.slice(index).filter(part => part !== 'metadata');
    const last = rest[rest.length - 1];
    const context = rest.slice(0, -1).map(part => (typeof part === 'number' ? `#${part + 1}` : humanize(part))).join(' › ');
    parts.push(`${context ? `${context} › ` : ''}${FIELD_LABELS[last] || (last === undefined ? 'Value' : humanize(last))}`);
    return parts.join(' · ');
  }
  function formatValue(value) {
    if (value === undefined) return '—';
    if (Array.isArray(value)) return value.length ? value.join(', ') : 'none';
    if (value === '' || value === null) return 'empty';
    const text = typeof value === 'object' ? JSON.stringify(value) : String(value);
    return text.length > 140 ? `${text.slice(0, 140)}…` : text;
  }
  // Numbers changed but the description text didn't: a likely out-of-date tooltip.
  function staleDescriptions() {
    if (!original || !working) return [];
    return (working.skills || []).map((skill, i) => {
      const before = original.skills?.[i];
      if (!before || before.skilldescription !== skill.skilldescription) return null;
      const numbersChanged = diff(before, skill, [], []).some(change => ['amount', 'duration'].includes(change.path[change.path.length - 1]));
      return numbersChanged ? i : null;
    }).filter(i => i !== null);
  }
  // ---------- checks ----------
  function runChecks() {
    currentChecks = working && builderCatalog && window.CharacterBuilderChecks
      ? window.CharacterBuilderChecks.checkCharacter(working, { catalog: builderCatalog, roster })
      : [];
    const errors = currentChecks.filter(issue => issue.level === 'error').length;
    const badge = $('checks-count');
    badge.hidden = !currentChecks.length;
    badge.textContent = String(errors || currentChecks.length);
    badge.classList.toggle('is-error', errors > 0);
    badge.title = `${errors} problem${errors === 1 ? '' : 's'}, ${currentChecks.length - errors} warning${currentChecks.length - errors === 1 ? '' : 's'}`;
  }
  function renderChecks() {
    const content = $('checks-content');
    if (!builderCatalog) { content.innerHTML = '<p class="ce-muted">Checks are unavailable: the engine catalog could not be loaded.</p>'; return; }
    if (!currentChecks.length) { content.innerHTML = '<p class="ce-checks-clear">No problems found. The engine will read everything on this character.</p>'; return; }
    const section = (level, title, note) => {
      const list = currentChecks.filter(issue => issue.level === level);
      if (!list.length) return '';
      return `<section class="ce-check-group is-${level}"><h3>${title} <span>${list.length}</span></h3><p class="ce-muted">${note}</p><ul>${list.map(issue => `<li><strong>${escapeHtml(issue.where)}</strong><span>${escapeHtml(issue.message)}</span></li>`).join('')}</ul></section>`;
    };
    content.innerHTML = section('error', 'Problems', 'The engine will ignore or misread these. Fix them before saving.') +
      section('warning', 'Worth a look', 'These work, but may not be what you meant.');
  }
  async function loadCatalog() {
    try { builderCatalog = (await request('/api/admin/builder-catalog')).catalog || null; }
    catch (_) { builderCatalog = null; }
  }

  function refreshStatus() {
    runChecks();
    const count = changes().length;
    const badge = $('changes-count');
    badge.hidden = !count;
    badge.textContent = String(count);
    saveButton.hidden = !working;
    saveButton.disabled = busy || !working || !count;
    saveButton.textContent = busy ? 'Saving…' : isNew ? 'Save draft' : count ? `Save ${count} change${count === 1 ? '' : 's'}` : 'Save changes';
    $('revert-character').hidden = !count;
    $('publish-draft').hidden = !isNew;
    $('publish-draft').disabled = busy;
    const savedState = isNew ? 'draft, not live' : original?.retired ? 'retired' : hiddenFromPlayers(original?.characterId) ? 'saved · staff only' : 'saved and live';
    if (!busy && working) setState(count ? `${count} unsaved change${count === 1 ? '' : 's'}` : `${working.name} · ${savedState}`);
    renderList();
    renderDrafts();
    document.querySelectorAll('[data-stale-hint]').forEach(node => { node.hidden = !staleDescriptions().includes(Number(node.dataset.staleHint)); });
  }

  // ---------- roster list ----------
  function renderList() {
    const query = $('roster-search').value.trim().toLowerCase();
    const visible = roster.filter(c => `${c.name} ${c.characterId}`.toLowerCase().includes(query));
    if (!visible.length) { list.innerHTML = `<p class="empty">${roster.length ? 'No characters match.' : 'No characters loaded.'}</p>`; return; }
    const dirtyId = working && !isNew && changes().length ? original.characterId : '';
    list.innerHTML = visible.map(c => `<button type="button" class="draft-item ce-roster-item${working && !isNew && c.characterId === original.characterId ? ' active' : ''}${c.retired ? ' is-retired' : ''}" data-character-id="${escapeHtml(c.characterId)}">
      <img src="${escapeHtml(imageSrc(c.facePicture))}" alt="" loading="lazy">
      <span><strong>${escapeHtml(c.name)}${c.characterId === dirtyId ? ' <span class="ce-dirty-dot" title="Unsaved changes">●</span>' : ''}</strong><small>${escapeHtml(c.characterId)}${c.retired ? ' · retired' : hiddenFromPlayers(c.characterId) ? ' · staff only' : c.requiredMissionId ? ' · mission unlock' : ''}</small></span>
    </button>`).join('');
    list.querySelectorAll('img').forEach(img => img.addEventListener('error', () => { img.style.visibility = 'hidden'; }, { once: true }));
  }

  function renderDrafts() {
    const box = $('drafts-list');
    if (!box) return;
    if (!drafts.length) { box.innerHTML = '<p class="empty">No drafts. New characters and Character Creator concepts start here.</p>'; return; }
    box.innerHTML = drafts.map(d => `<button type="button" class="draft-item ce-roster-item${isNew && draftMeta && draftMeta.id === d.id ? ' active' : ''}" data-draft-id="${escapeHtml(d.id)}">
      ${d.facePicture ? `<img src="${escapeHtml(imageSrc(d.facePicture))}" alt="" loading="lazy">` : `<span class="ce-initial" aria-hidden="true">${escapeHtml((d.name || '?').trim().charAt(0).toUpperCase())}</span>`}
      <span><strong>${escapeHtml(d.name)}${isNew && draftMeta && draftMeta.id === d.id && changes().length ? ' <span class="ce-dirty-dot" title="Unsaved changes">●</span>' : ''}</strong><small>${escapeHtml(d.source && d.source.type === 'concept' ? `from concept · ${d.updatedBy || ''}` : `draft · ${d.updatedBy || ''}`)}</small></span>
    </button>`).join('');
    box.querySelectorAll('img').forEach(img => img.addEventListener('error', () => { img.style.visibility = 'hidden'; }, { once: true }));
  }
  async function loadDrafts() {
    try { drafts = (await request('/api/admin/editor-drafts')).drafts || []; }
    catch (_) { drafts = []; }
    renderDrafts();
  }

  // ---------- edit form ----------
  function field(path, kind, attrs) {
    const value = getAt(working, path);
    return `data-path="${pathAttr(path)}" data-kind="${kind}" ${attrs || ''} value="${escapeHtml(value ?? '')}"`;
  }
  function art(path, label) {
    const url = getAt(working, path) || '';
    return `<div class="inline-art"><div class="inline-art-preview" data-art="${pathAttr(path)}">${url ? `<img src="${escapeHtml(imageSrc(url))}" alt="${escapeHtml(label)}">` : escapeHtml(label)}</div><input type="text" placeholder="Image URL or upload" aria-label="${escapeHtml(label)} URL" ${field(path, 'text')}>${uploadButton(path, label)}</div>`;
  }
  function uploadButton(path, label) {
    return `<button type="button" class="ce-upload" data-upload="${pathAttr(path)}" aria-label="Upload ${escapeHtml(label)}">Upload</button>`;
  }
  function stepper(path, label, max) {
    return `<span class="ce-stepper" role="group" aria-label="${escapeHtml(label)}"><button type="button" data-step="${pathAttr(path)}" data-delta="-1" aria-label="Decrease ${escapeHtml(label)}">−</button><input type="number" min="0" max="${max}" inputmode="numeric" aria-label="${escapeHtml(label)}" ${field(path, 'int', `data-max="${max}"`)}><button type="button" data-step="${pathAttr(path)}" data-delta="1" aria-label="Increase ${escapeHtml(label)}">+</button></span>`;
  }
  function chakraControls(skillIndex) {
    const energy = working.skills[skillIndex].energy || [];
    return `<div class="chakra-cost-field" role="group" aria-label="Chakra cost"><span class="chakra-cost-heading">Chakra cost</span><div class="chakra-cost-controls">${CHAKRA.map(type => {
      const count = energy.filter(entry => entry === type).length;
      return `<span class="chakra-cost-item ce-chakra${count ? ' has-cost' : ''}" title="${type}"><span class="chakra-square ${type.toLowerCase()}" aria-hidden="true"></span><button type="button" data-chakra="${skillIndex}" data-type="${type}" data-delta="-1" aria-label="Remove ${type}" ${count ? '' : 'disabled'}>−</button><b aria-label="${type} cost">${count}</b><button type="button" data-chakra="${skillIndex}" data-type="${type}" data-delta="1" aria-label="Add ${type}">+</button></span>`;
    }).join('')}</div></div>`;
  }
  function classControls(skillIndex) {
    const classes = working.skills[skillIndex].classes || [];
    const options = knownClasses.filter(name => !classes.includes(name));
    return `<div class="ce-classes" role="group" aria-label="Skill classes"><span class="chakra-cost-heading">Classes</span><div class="ce-chips">${classes.map((name, i) => `<span class="ce-chip">${escapeHtml(name)}<button type="button" data-remove-class="${skillIndex}" data-class-index="${i}" aria-label="Remove ${escapeHtml(name)}">×</button></span>`).join('') || '<span class="ce-muted">None</span>'}
      <select data-add-class="${skillIndex}" aria-label="Add a class"><option value="">+ Add class</option>${options.map(name => `<option value="${escapeHtml(name)}">${escapeHtml(name)}</option>`).join('')}<option value="__custom">Other…</option></select></div></div>`;
  }
  function targetSelect(skillIndex) {
    const current = working.skills[skillIndex].target || '';
    const options = knownTargets.includes(current) ? knownTargets : [current, ...knownTargets];
    return `<label>Target <select data-path="${pathAttr(['skills', skillIndex, 'target'])}" data-kind="text">${options.map(target => `<option value="${escapeHtml(target)}"${target === current ? ' selected' : ''}>${escapeHtml(humanize(target))}</option>`).join('')}</select></label>`;
  }
  // Collects tooltip text and status icons anywhere below `object`, skipping paths already shown.
  function tooltipFields(object, basePath, skip) {
    const found = [];
    (function walk(value, path) {
      if (!value || typeof value !== 'object') return;
      Object.keys(value).forEach(key => {
        const next = path.concat(Array.isArray(value) ? Number(key) : key);
        if (TOOLTIP_KEYS.includes(key) && typeof value[key] === 'string') {
          if (!skip(next)) found.push(next);
        } else walk(value[key], next);
      });
    })(object, basePath);
    return found;
  }
  function tooltipInput(path, label) {
    const key = path[path.length - 1];
    if (key === 'statusIcon') {
      const url = getAt(working, path) || '';
      return `<div class="ce-tip ce-tip-icon"><span>${escapeHtml(label)}</span><span class="ce-tip-icon-row"><span class="ce-tip-thumb" data-art="${pathAttr(path)}">${url ? `<img src="${escapeHtml(imageSrc(url))}" alt="">` : ''}</span><input type="text" aria-label="${escapeHtml(label)} URL" ${field(path, 'text')}>${uploadButton(path, label)}</span></div>`;
    }
    return `<label class="ce-tip"><span>${escapeHtml(label)}</span><textarea rows="2" data-path="${pathAttr(path)}" data-kind="text">${escapeHtml(getAt(working, path))}</textarea></label>`;
  }
  function effectRows(skillIndex) {
    const effects = working.skills[skillIndex].effects || [];
    const rows = effects.map((effect, i) => {
      const base = ['skills', skillIndex, 'effects', i];
      const meta = effect.metadata || {};
      const name = effect.statusId ? statusName(effect.statusId) : '';
      const inputs = [];
      if (typeof effect.amount === 'number') inputs.push(`<label>Amount ${stepper(base.concat('amount'), `${name || humanize(effect.type)} amount`, 999)}</label>`);
      if (typeof effect.duration === 'number') inputs.push(`<label>Turns ${stepper(base.concat('duration'), `${name || humanize(effect.type)} duration`, 99)}</label>`);
      const tips = ['tooltipText', 'tooltipTextTemplate', 'statusIcon'].filter(key => typeof meta[key] === 'string').map(key => tooltipInput(base.concat('metadata', key), FIELD_LABELS[key]));
      if (!inputs.length && !tips.length) return '';
      return `<div class="ce-effect"><div class="ce-effect-head"><strong>${escapeHtml(humanize(effect.type))}</strong><span>${escapeHtml(scopeLabel(effect.scope))}${name ? ` · ${escapeHtml(name)}` : ''}${effect.condition ? ' · conditional' : ''}</span></div>${inputs.length ? `<div class="ce-effect-numbers">${inputs.join('')}</div>` : ''}${tips.join('')}</div>`;
    }).filter(Boolean);
    const shown = path => path[2] === 'effects' && path[4] === 'metadata' && path.length === 6;
    const nested = tooltipFields(working.skills[skillIndex], ['skills', skillIndex], shown).map(path => tooltipInput(path, labelFor(path).split(' · ').slice(1).join(' · ')));
    const total = rows.length + nested.length;
    if (!total) return `<p class="ce-muted ce-effects-empty">No adjustable effects. Use Raw data for effect logic.</p>`;
    return `<details class="inline-skill-more ce-effects"><summary>Effects &amp; tooltips (${total})</summary><div>${rows.join('')}${nested.length ? `<div class="ce-effect"><div class="ce-effect-head"><strong>Triggered effects</strong><span>counters, reactions, follow-ups</span></div>${nested.join('')}</div>` : ''}</div></details>`;
  }
  function ruleToggles(skillIndex) {
    const skill = working.skills[skillIndex];
    return `<details class="inline-skill-more"><summary>Rules</summary><div>${RULES.map(([key, label]) => `<label class="check-field"><input type="checkbox" data-path="${pathAttr(['skills', skillIndex, key])}" data-kind="flag" ${skill[key] ? 'checked' : ''}>${escapeHtml(label)}</label>`).join('')}</div></details>`;
  }
  function skillCard(skill, i) {
    const isAlternate = Boolean(skill.hiddenFromSelectionViewer || skill.baseSkillId);
    const count = working.skills.length;
    const actions = builder || SL ? `<span class="cb-actions">${i > 0 ? `<button type="button" class="cb-link" data-bact="move-skill" data-bskill="${i}" data-bdir="-1" aria-label="Move skill ${i + 1} up">Up</button>` : ''}${i < count - 1 ? `<button type="button" class="cb-link" data-bact="move-skill" data-bskill="${i}" data-bdir="1" aria-label="Move skill ${i + 1} down">Down</button>` : ''}<button type="button" class="cb-link cb-danger" data-bact="remove-skill" data-bskill="${i}" aria-label="Remove skill ${i + 1}">Remove</button></span>` : '';
    const mechanics = SL && !advancedView
      ? `${sentenceSection(skill, i)}${skillExtras(skill, i)}`
      : builder
      ? `<section class="cb-skill-effects"><h3>What it does</h3>${builder.effects(['skills', i, 'effects'])}</section>
      <details class="inline-skill-more" data-open-key="skills.${i}.rules"${skillHasRules(skill) ? ' open' : ''}><summary>Rules and requirements</summary><div>${builder.skillRules(i)}</div></details>`
      : `${effectRows(i)}${ruleToggles(i)}`;
    return `<article class="inline-skill-card${isAlternate ? ' alternate' : ''}" data-skill="${i}">
      <div class="inline-card-title"><div class="inline-skill-title"><span class="skill-order">${i + 1}</span><input maxlength="80" placeholder="Skill name" aria-label="Skill ${i + 1} name" ${field(['skills', i, 'name'], 'text')}></div>${isAlternate ? '<span class="ce-badge">Alternate</span>' : ''}${actions}</div>
      <div class="inline-skill-main">${art(['skills', i, 'skillimage'], 'Skill image')}<textarea rows="4" maxlength="4000" placeholder="Skill description" aria-label="Skill ${i + 1} description" data-path="${pathAttr(['skills', i, 'skilldescription'])}" data-kind="text">${escapeHtml(skill.skilldescription)}</textarea></div>
      <p class="ce-stale" data-stale-hint="${i}" hidden>You changed numbers on this skill. Check the description still matches.</p>
      <div class="inline-skill-footer ce-skill-footer"><label>Cooldown ${stepper(['skills', i, 'cooldown'], `Skill ${i + 1} cooldown`, 99)}</label>${targetSelect(i)}${classControls(i)}${chakraControls(i)}</div>
      ${mechanics}
    </article>`;
  }
  // ---------- sentence view ----------
  // Plain lines for everyday mechanics; anything else is a "special" card with only its numbers editable.
  function slContext(skill) { return SL.contextFor(working, skill); }
  function whoOptions(field, ctx) {
    return SL.WHO.filter(who => !(field.exclude || []).includes(who.id))
      .map(who => ({ id: who.id, label: who.label.replace('{name}', ctx.name) }));
  }
  function slBlank(field, value, at, ctx) {
    const data = `data-sl="${pathAttr(at)}" data-sl-field="${escapeHtml(field.key)}"`;
    if (field.kind === 'number') return `<input type="number" class="sl-num" ${data} value="${escapeHtml(value ?? '')}" min="${field.min ?? 0}" max="${field.max ?? 999}" aria-label="${escapeHtml(field.label)}">`;
    if (field.kind === 'turns') {
      return `<span class="sl-turns">for <input type="number" class="sl-num" ${data} value="${escapeHtml(value ?? 1)}" min="1" max="99" aria-label="Turns"> ${Number(value) === 1 ? 'turn' : 'turns'}${Number(value) >= 99 ? ' (rest of the match)' : ''}</span>`;
    }
    if (field.kind === 'label') return `<strong class="sl-fixed">${escapeHtml(value || '')}</strong>`;
    let options;
    if (field.kind === 'skill') {
      options = [
        ...(field.allowAll ? [{ id: '', label: `all of ${ctx.name}'s skills` }] : []),
        ...ctx.skills.map(skill => ({ id: skill.id, label: `${skill.name}${skill.alternate ? ' (alternate)' : ''}` })),
        ...(field.allowNew ? [{ id: '__new', label: 'a new alternate skill…' }] : []),
      ];
      if (value && !options.some(option => option.id === value)) options.unshift({ id: value, label: `${value} (missing)` });
    } else if (field.kind === 'stack') {
      options = ctx.stacks.map(stack => ({ id: stack.id, label: stack.label }));
      if (value && !options.some(option => option.id === value)) options.unshift({ id: value, label: `${String(value).split('|')[1] || value} (missing)` });
    } else {
      options = field.kind === 'who' ? whoOptions(field, ctx) : field.options;
    }
    return `<select class="sl-select" ${data} aria-label="${escapeHtml(field.label)}">${options.map(option => `<option value="${escapeHtml(option.id)}"${option.id === value ? ' selected' : ''}>${escapeHtml(option.label)}</option>`).join('')}</select>`;
  }
  function slSentence(sentence, values, at, ctx) {
    const fields = Object.fromEntries(sentence.fields.map(field => [field.key, field]));
    // Words are spaced, but punctuation sits against the word before it ("for 1 turn, if").
    const html = sentence.parts.map((part, index) => {
      const piece = fields[part] ? slBlank(fields[part], values[part], at, ctx) : `<span>${escapeHtml(part)}</span>`;
      return index > 0 && !fields[part] && /^[,.:;)]/.test(part) ? piece : ` ${piece}`;
    }).join('').trim();
    return sentence.parts[0] === 'turns' ? html.replace('<span class="sl-turns">for', '<span class="sl-turns">For') : html;
  }
  function humanId(id) {
    const prefix = String(working.characterId || '').replace(/-/g, '_') + '_';
    const text = String(id || '');
    return humanize(text.startsWith(prefix) ? text.slice(prefix.length) : text);
  }
  // Every number inside a special effect, labelled by the status it belongs to ("Ninja Wire Trap: turns").
  const NUMBER_NAMES = { duration: 'turns', amount: 'amount', conditionalAmount: 'amount when the condition is met',
    skillCooldownOverridesBySkillId: 'cooldown', skillDamageBonuses: 'extra damage', skillHealingBonuses: 'extra healing',
    skillDurationBonuses: 'extra turns', randomCostIncreaseForSkillIds: 'extra random chakra' };
  function numberName(key, owner) {
    if (key === 'amount' && owner && owner.type) return { damage: 'damage', heal: 'healing', health_steal_damage: 'damage' }[owner.type] || (/chakra/.test(owner.type) ? 'chakra' : 'amount');
    if (/Duration$/.test(key)) return 'turns';
    if (NUMBER_NAMES[key]) return NUMBER_NAMES[key];
    const known = builderCatalog && ((builderCatalog.statusSettings || {})[key] || (builderCatalog.effectSettings || {})[key]);
    const label = known ? known.label.replace(/^…/, '') : humanize(key);
    return label.charAt(0).toLowerCase() + label.slice(1);
  }
  function slNumbers(value, path, context, out, depth) {
    if (depth > 5 || !value || typeof value !== 'object') return out;
    const here = value.statusId ? humanId(value.statusId) : value.type && builderCatalog && builderCatalog.effectTypes && builderCatalog.effectTypes[value.type] ? builderCatalog.effectTypes[value.type].label : context;
    Object.entries(value).forEach(([key, entry]) => {
      const next = path.concat(Array.isArray(value) ? Number(key) : key);
      if (typeof entry === 'number') {
        const skill = (working.skills || []).find(item => item && item.id === key);
        if (skill && path.length) {
          out.push({ path: next, label: `${skill.name}: ${numberName(path[path.length - 1], {})}`, value: entry });
          return;
        }
        const owner = key === 'counterStatusDuration' && value.counterStatusId ? humanId(value.counterStatusId) : here;
        out.push({ path: next, label: `${owner ? `${owner}: ` : ''}${numberName(key, value)}`, value: entry });
      } else if (entry && typeof entry === 'object' && !['skillReplacements', 'skillCostOverridesBySkillId', 'skillTargetOverrides'].includes(key)) {
        slNumbers(entry, next, here, out, depth + 1);
      }
    });
    return out;
  }
  function slSpecial(effect, at, title) {
    const type = builderCatalog && builderCatalog.effectTypes && builderCatalog.effectTypes[effect && effect.type];
    const name = title || `${type ? type.label : humanize(effect && effect.type)}${effect && effect.statusId ? `: ${humanId(effect.statusId)}` : ''}`;
    const tooltip = effect && effect.metadata && (effect.metadata.tooltipText || effect.metadata.tooltipTextTemplate);
    const numbers = slNumbers(effect, at, title || '', [], 0).slice(0, 16);
    return `<div class="sl-special-head"><span class="sl-tag">Special</span><strong>${escapeHtml(name)}</strong></div>
      ${tooltip ? `<p class="sl-special-text">${escapeHtml(tooltip)}</p>` : ''}
      ${numbers.length ? `<div class="sl-numbers">${numbers.map(entry => `<label>${escapeHtml(entry.label)}<input type="number" class="sl-num" data-path="${pathAttr(entry.path)}" data-kind="number" value="${escapeHtml(entry.value)}"></label>`).join('')}</div>` : ''}
      <p class="sl-note">How this works can only be changed in the Advanced view. You can tune its numbers here.</p>`;
  }
  function slLine(effect, i, j, count, ctx) {
    const at = ['skills', i, 'effects', j];
    const found = SL.readEffect(effect);
    const moves = `${j > 0 ? `<button type="button" class="cb-link" data-sl-move="${pathAttr(at)}" data-dir="-1" aria-label="Move line ${j + 1} up">Up</button>` : ''}${j < count - 1 ? `<button type="button" class="cb-link" data-sl-move="${pathAttr(at)}" data-dir="1" aria-label="Move line ${j + 1} down">Down</button>` : ''}`;
    const remove = `<button type="button" class="cb-link cb-danger" data-sl-remove="${pathAttr(at)}" aria-label="Remove line ${j + 1}">Remove</button>`;
    const body = found ? `<span class="sl-sentence">${slSentence(SL.BY_ID[found.sentence], found.values, at, ctx)}</span>` : `<div class="sl-special">${slSpecial(effect, at)}</div>`;
    return `<li class="sl-line${found ? '' : ' is-special'}"><span class="sl-index">${j + 1}</span><div class="sl-body">${body}</div><span class="sl-actions">${moves}${remove}</span></li>`;
  }
  function slAddPicker(attrs, filter) {
    const groups = {};
    SL.SENTENCES.filter(filter || (() => true)).forEach(sentence => { (groups[sentence.group] = groups[sentence.group] || []).push(sentence); });
    return `<select class="sl-add" ${attrs} aria-label="Add a line"><option value="">+ Add a line</option>${Object.entries(groups).map(([group, list]) =>
      `<optgroup label="${escapeHtml(group)}">${list.map(sentence => `<option value="${escapeHtml(sentence.id)}">${escapeHtml(sentence.label)}</option>`).join('')}</optgroup>`).join('')}</select>`;
  }
  function sentenceSection(skill, i) {
    const ctx = slContext(skill);
    const effects = skill.effects || [];
    return `<section class="sl-section"><h3>What it does</h3>
      ${effects.length ? `<ol class="sl-lines">${effects.map((effect, j) => slLine(effect, i, j, effects.length, ctx)).join('')}</ol>` : '<p class="sl-empty">Nothing yet. Add a line for each thing the skill does, in order.</p>'}
      <div class="sl-tools">${slAddPicker(`data-sl-add="${i}"`)}<button type="button" class="cb-link" data-sl-describe="${i}">Write the description from these lines</button></div>
    </section>`;
  }
  // The few skill rules admins commonly need, as plain switches.
  function skillExtras(skill, i) {
    const flag = (key, label) => `<label class="sl-check"><input type="checkbox" data-path="${pathAttr(['skills', i, key])}" data-kind="flag" ${skill[key] ? 'checked' : ''}>${escapeHtml(label)}</label>`;
    const number = (key, label, hint) => `<label class="sl-extra-num">${escapeHtml(label)}<input type="number" class="sl-num" min="0" max="20" placeholder="${escapeHtml(hint)}" data-path="${pathAttr(['skills', i, key])}" data-kind="number" value="${escapeHtml(skill[key] ?? '')}"></label>`;
    return `<details class="inline-skill-more sl-extras" data-open-key="skills.${i}.extras"><summary>Extras</summary><div class="sl-extras-body">
      ${number('maxUses', 'Uses per match', 'no limit')}${number('startingCooldown', 'Starts on cooldown for', '0')}
      ${flag('cannotBeCountered', "Can't be countered")}${flag('ignoreInvulnerability', 'Ignores invulnerability')}${flag('hiddenFromSelectionViewer', 'Alternate form (hidden on selection)')}
    </div></details>`;
  }
  // Passive: permanent bonuses as "always active" lines; its other mechanics as special cards.
  function alwaysActiveSection() {
    const ctx = slContext({ name: working.passive ? working.passive.name : 'passive' });
    const statuses = Array.isArray(working.startStatuses) ? working.startStatuses : [];
    const lines = statuses.map((spec, index) => {
      const at = ['startStatuses', index];
      const found = SL.readEffect({ type: 'apply_status', scope: 'self', ...specWithoutAlways(spec) });
      const remove = `<button type="button" class="cb-link cb-danger" data-sl-remove="${pathAttr(at)}" aria-label="Remove">Remove</button>`;
      if (found && found.values.who === 'self') {
        const sentence = SL.BY_ID[found.sentence];
        const fields = sentence.fields.filter(field => field.key !== 'who' && field.kind !== 'turns');
        const parts = sentence.parts.filter(part => part !== 'turns').map(part => (part === 'who' ? escapeHtml(ctx.name) : fields.some(field => field.key === part) ? slBlank(fields.find(field => field.key === part), found.values[part], at, ctx) : escapeHtml(part)));
        return `<li class="sl-line"><span class="sl-index">${index + 1}</span><div class="sl-body"><span class="sl-sentence" data-sl-always="1">${parts.join(' ')} <span class="sl-muted">(always)</span></span></div><span class="sl-actions">${remove}</span></li>`;
      }
      return `<li class="sl-line is-special"><span class="sl-index">${index + 1}</span><div class="sl-body"><div class="sl-special">${slSpecial({ ...spec, type: 'apply_status' }, at, humanId(spec.statusId) || 'Starting status')}</div></div><span class="sl-actions">${remove}</span></li>`;
    }).join('');
    const passive = working.passive || {};
    const quest = passive.awakening ? SL.readQuest(passive.awakening) : null;
    const specialFeatures = Object.keys(passive).filter(key => !['name', 'icon', 'description', 'awakening'].includes(key));
    const features = specialFeatures.map(key => {
      const field = builderCatalog && builderCatalog.passiveFields && builderCatalog.passiveFields[key];
      const title = key === 'awakening' ? 'Quest' : field ? field.label : humanize(key);
      const value = passive[key];
      const body = value && typeof value === 'object' ? slSpecial(value, ['passive', key], title) : slSpecial({ [key]: value }, ['passive'], title);
      return `<li class="sl-line is-special"><span class="sl-index">·</span><div class="sl-body"><div class="sl-special">${body}</div></div></li>`;
    }).join('');
    return `${questCard(quest)}<section class="sl-section"><h3>Always active</h3>
      ${lines || features ? `<ol class="sl-lines">${lines}${features}</ol>` : `<p class="sl-empty">Nothing yet. Add what the passive always does.</p>`}
      <div class="sl-tools">${slAddPicker('data-sl-add-always="1"', sentence => ['reduction', 'boost', 'healOverTime', 'defense'].includes(sentence.id))}</div>
    </section>`;
  }
  function questCard(quest) {
    const passive = working.passive || {};
    if (passive.awakening && !quest) {
      return `<section class="sl-section"><h3>Quest</h3><ol class="sl-lines"><li class="sl-line is-special"><span class="sl-index">1</span><div class="sl-body"><div class="sl-special">${slSpecial(passive.awakening, ['passive', 'awakening'], 'Quest')}</div></div></li></ol></section>`;
    }
    if (!quest) {
      return `<section class="sl-section"><h3>Quest</h3><p class="sl-empty">No quest. A quest is a goal the character completes during a match, like using 4 skills, for a permanent reward.</p><div class="sl-tools"><button type="button" class="cb-link" data-sl-quest="add">Add a quest</button></div></section>`;
    }
    const ctx = slContext({ name: passive.name });
    const at = ['passive', 'awakening'];
    const num = (key, value, label) => `<input type="number" class="sl-num" min="0" max="99" data-sl-quest-field="${key}" value="${escapeHtml(value)}" aria-label="${escapeHtml(label)}">`;
    const check = (key, on, label, body) => `<li class="sl-reward"><label class="sl-check"><input type="checkbox" data-sl-quest-toggle="${key}" ${on ? 'checked' : ''}><span>${label}</span></label>${body || ''}</li>`;
    const skillSelect = (key, value) => `<select class="sl-select" data-sl-quest-field="${key}" aria-label="${key === 'swapFrom' ? 'Skill' : 'Becomes'}">${ctx.skills.map(skill => `<option value="${escapeHtml(skill.id)}"${skill.id === value ? ' selected' : ''}>${escapeHtml(skill.name)}${skill.alternate ? ' (alternate)' : ''}</option>`).join('')}</select>`;
    return `<section class="sl-section"><h3>Quest</h3>
      <p class="sl-sentence">After using ${num('skills', quest.skills, 'Skills to use')} skills, ${escapeHtml(ctx.name)} completes the quest and:</p>
      <ul class="sl-rewards">
        ${check('heal', quest.heal > 0, 'heals', quest.heal > 0 ? `${num('heal', quest.heal, 'Healing each turn')} <span>health each turn</span>` : '<span class="sl-muted">health each turn</span>')}
        ${check('reduction', quest.reduction > 0, 'takes', quest.reduction > 0 ? `${num('reduction', quest.reduction, 'Less damage taken')} <span>less damage</span>` : '<span class="sl-muted">less damage</span>')}
        ${check('boost', quest.boost > 0, 'deals', quest.boost > 0 ? `${num('boost', quest.boost, 'More damage dealt')} <span>more damage</span>` : '<span class="sl-muted">more damage</span>')}
        ${check('partialStuns', quest.partialStuns, 'ignores partial stuns')}
        ${check('swap', Boolean(quest.swapFrom), 'turns a skill into another', quest.swapFrom ? `${skillSelect('swapFrom', quest.swapFrom)} <span>becomes</span> ${skillSelect('swapTo', quest.swapTo)}` : '')}
      </ul>
      <div class="sl-tools"><button type="button" class="cb-link cb-danger" data-sl-quest="remove">Remove quest</button></div>
    </section>`;
  }
  function questContext() { return SL.contextFor(working, { name: (working.passive && working.passive.name) || 'quest' }); }
  function questChange(change) {
    const passive = working.passive;
    if (!passive) return;
    const previous = passive.awakening ? SL.readQuest(passive.awakening) : null;
    const values = { ...(previous || { skills: 4, heal: 5, reduction: 0, boost: 0, partialStuns: false, swapFrom: '', swapTo: '' }), ...change };
    SL.writeQuest(passive, values, previous, questContext());
  }

  function specWithoutAlways(spec) {
    const copy = JSON.parse(JSON.stringify(spec || {}));
    if (copy.metadata) { delete copy.metadata.permanent; delete copy.metadata.cannotBeCleansed; }
    return copy;
  }

  function skillHasRules(skill) {
    const base = ['id', 'name', 'skillimage', 'skilldescription', 'energy', 'cooldown', 'classes', 'target', 'effects', 'damage'];
    return Object.keys(skill || {}).some(key => !base.includes(key));
  }
  function passiveSection() {
    const passive = working.passive;
    const bar = `<div class="inline-section-bar"><h2>Passive skill</h2>${passive
      ? '<button type="button" class="text-button danger" id="toggle-passive">Remove passive</button>'
      : '<button type="button" class="button secondary" id="toggle-passive">Add passive</button>'}</div>`;
    const starting = builder && (advancedView || !SL)
      ? `<section class="passive-section cb-start-section"><div class="inline-section-bar"><h2>Starting statuses</h2><span class="ce-muted">Statuses the character has from turn 1. Put a passive's lasting mechanics here.</span></div><div class="inline-passive-card">${builder.startStatuses()}</div></section>`
      : '';
    if (!passive) return `<section class="passive-section">${bar}</section>${starting}`;
    const card = `<div class="inline-card-title"><input maxlength="80" placeholder="Passive name" aria-label="Passive name" ${field(['passive', 'name'], 'text')}></div>
      <div class="inline-character-main">${art(['passive', 'icon'], 'Passive image')}<textarea rows="3" maxlength="4000" placeholder="What does this passive do?" aria-label="Passive description" data-path="${pathAttr(['passive', 'description'])}" data-kind="text">${escapeHtml(passive.description)}</textarea></div>`;
    if (SL && !advancedView) {
      return `<section class="passive-section">${bar}<div class="inline-passive-card">${card}${alwaysActiveSection()}</div></section>`;
    }
    if (builder) {
      return `<section class="passive-section">${bar}<div class="inline-passive-card">${card}
        <details class="inline-skill-more" data-open-key="passive.features" open><summary>Passive features</summary><div>${builder.passiveFeatures()}</div></details>
        <details class="inline-skill-more" data-open-key="passive.quest"${passive.awakening ? ' open' : ''}><summary>Quest</summary><div>${builder.questEditor()}</div></details>
      </div></section>${starting}`;
    }
    const tips = tooltipFields(passive, ['passive'], () => false).map(path => tooltipInput(path, labelFor(path).split(' · ').slice(1).join(' · ')));
    return `<section class="passive-section">${bar}<div class="inline-passive-card">${card}
      ${tips.length ? `<details class="inline-skill-more ce-effects"><summary>Passive tooltips &amp; icons (${tips.length})</summary><div><div class="ce-effect">${tips.join('')}</div></div></details>` : ''}
    </div></section>`;
  }
  // Concept notes and conversion notes carried over from the Character Creator.
  function draftNotes() {
    if (!isNew || !draftMeta) return '';
    const notes = draftMeta.notes || {};
    const problems = draftMeta.problems || [];
    const skillNotes = (notes.skills || []).filter(entry => entry.notes);
    const any = problems.length || notes.general || notes.unlock || notes.passive || skillNotes.length;
    if (!any) return '';
    return `<details class="ce-notes" data-open-key="draft.notes" open><summary>From the concept${draftMeta.source && draftMeta.source.name ? `: ${escapeHtml(draftMeta.source.name)}` : ''}</summary>
      ${problems.length ? `<ul class="ce-notes-problems">${problems.map(text => `<li>${escapeHtml(text)}</li>`).join('')}</ul>` : ''}
      ${notes.general ? `<p><strong>Notes</strong>${escapeHtml(notes.general)}</p>` : ''}
      ${notes.unlock ? `<p><strong>Unlock</strong>${escapeHtml(notes.unlock)}</p>` : ''}
      ${notes.passive ? `<p><strong>Passive</strong>${escapeHtml(notes.passive)}</p>` : ''}
      ${skillNotes.map(entry => `<p><strong>${escapeHtml(entry.name || 'Skill')}</strong>${escapeHtml(entry.notes)}</p>`).join('')}
    </details>`;
  }
  function renderForm() {
    const missionOptions = [`<option value="">None (always available)</option>`].concat(missions.map(m => `<option value="${escapeHtml(m.missionId)}"${m.missionId === working.requiredMissionId ? ' selected' : ''}>${escapeHtml(m.title || m.name || m.missionId)}</option>`));
    if (working.requiredMissionId && !missions.some(m => m.missionId === working.requiredMissionId)) missionOptions.push(`<option value="${escapeHtml(working.requiredMissionId)}" selected>${escapeHtml(working.requiredMissionId)} (not found)</option>`);
    const catalogArc = window.NarutoRosterCatalog && window.NarutoRosterCatalog.getArc({ characterId: working.characterId });
    const arcField = catalogArc
      ? `<label>Arc <input readonly value="${escapeHtml(catalogArc.label)}" title="This character's arc is set in roster-catalog.js."></label>`
      : `<label>Arc <select data-path="${pathAttr(['arc'])}" data-kind="optional">${[`<option value="">None</option>`].concat(ARCS.map(arc => `<option value="${escapeHtml(arc.id)}"${arc.id === working.arc ? ' selected' : ''}>${escapeHtml(arc.label)}</option>`)).join('')}</select></label>`;
    form.innerHTML = `${statusBanner()}${draftNotes()}<section class="inline-character">
        <div class="inline-card-title"><input maxlength="80" placeholder="Character name" aria-label="Character name" ${field(['name'], 'text')}></div>
        <div class="inline-character-main">${art(['facePicture'], 'Portrait')}<textarea rows="5" maxlength="4000" placeholder="Character description" aria-label="Character description" data-path="${pathAttr(['characterdeescription'])}" data-kind="text">${escapeHtml(working.characterdeescription)}</textarea></div>
        <div class="inline-character-bottom"><label>Character id <input ${isNew ? '' : 'readonly title="Ids can\'t change on a live character."'} ${field(['characterId'], 'id')}></label><label>Mission to unlock <select data-path="${pathAttr(['requiredMissionId'])}" data-kind="mission">${missionOptions.join('')}</select></label>${arcField}<label>Tags <input placeholder="none" data-path="${pathAttr(['tags'])}" data-kind="list" value="${escapeHtml((working.tags || []).join(', '))}"></label></div>
      </section>
      ${passiveSection()}
      <section class="skills-section"><div class="inline-section-bar"><h2>Skills</h2>${builder || SL ? '<button type="button" class="button secondary" data-sl-add-skill="1">Add skill</button>' : '<span class="ce-muted">Add, remove, or reorder skills in Raw data.</span>'}</div><div class="inline-skill-grid${builder ? ' cb-skill-list' : ''}">${working.skills.map(skillCard).join('')}</div></section>${builder ? builder.datalists() : ''}`;
    form.querySelectorAll('[data-art] img').forEach(img => img.addEventListener('error', () => { img.replaceWith(document.createTextNode('No image')); }, { once: true }));
    fitTextareas(form);
  }

  function rerenderForm() {
    const open = new Set([...form.querySelectorAll('details[data-open-key]')].filter(d => d.open).map(d => d.dataset.openKey));
    const closed = new Set([...form.querySelectorAll('details[data-open-key]')].filter(d => !d.open).map(d => d.dataset.openKey));
    if (builder) { builder.openKeys.forEach(key => { open.add(key); closed.delete(key); }); builder.openKeys.clear(); }
    const scroll = window.scrollY;
    renderForm();
    form.querySelectorAll('details[data-open-key]').forEach(d => {
      if (open.has(d.dataset.openKey)) d.open = true;
      else if (closed.has(d.dataset.openKey)) d.open = false;
    });
    fitTextareas(form);
    window.scrollTo(0, scroll);
    refreshStatus();
  }
  function setupBuilder() {
    if (!builderCatalog || !window.CharacterBlockBuilder) return;
    builder = window.CharacterBlockBuilder.create({
      catalog: builderCatalog,
      escapeHtml,
      imageSrc,
      getCharacter: () => working,
      getRoster: () => roster,
      getMissions: () => missions,
      onChange: () => refreshStatus(),
      onStructure: () => rerenderForm(),
    });
  }

  // ---------- live status: retired, staff only, or playable ----------
  function hiddenFromPlayers(characterId) {
    return accessPolicies?.[characterId]?.player?.visibility === 'hidden';
  }
  function statusBanner() {
    if (isNew) return `<p class="ce-status is-draft"><span><strong>Draft.</strong> Not in the game yet: save as often as you like, then Publish to add it to the roster as staff only. Players can't see it until you release it.</span></p>`;
    if (original?.retired) return `<p class="ce-status is-retired"><span><strong>Retired.</strong> Hidden everywhere and can't be picked. Saved teams and match history that use them are untouched.</span><button type="button" class="button secondary" id="restore-character">Bring back</button></p>`;
    if (accessPolicies && hiddenFromPlayers(original.characterId)) return `<p class="ce-status is-staff"><span><strong>Staff only.</strong> Players can't see or pick this character yet.</span><button type="button" class="button secondary" id="release-character">Release to players</button></p>`;
    return '';
  }
  async function setPlayerVisibility(characterId, visible) {
    const data = await request('/api/admin/character-access');
    const policies = { ...(data.policies || {}) };
    const player = { ...(policies[characterId]?.player || { unlock: 'inherit' }), visibility: visible ? 'visible' : 'hidden' };
    if (player.visibility === 'visible' && (player.unlock || 'inherit') === 'inherit') delete policies[characterId];
    else policies[characterId] = { player };
    accessPolicies = (await request('/api/admin/character-access', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ policies }) })).policies || policies;
  }
  async function loadAccess() {
    try { accessPolicies = (await request('/api/admin/character-access')).policies || {}; }
    catch (_) { accessPolicies = null; }
  }

  // ---------- image upload ----------
  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('That file could not be read.'));
      reader.readAsDataURL(file);
    });
  }
  async function uploadArt(file) {
    const path = uploadPath;
    uploadPath = null;
    if (!file || !path || !working) return;
    if (file.size > 2 * 1024 * 1024) { setState('That image is over 2 MB. Pick a smaller one.', 'error'); return; }
    setState('Uploading image…');
    try {
      const data = await request('/api/admin/character-art', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dataUrl: await readFileAsDataUrl(file) }) });
      setAt(working, path, data.url);
      const input = form.querySelector(`[data-path="${CSS.escape(JSON.stringify(path))}"], [data-bpath="${CSS.escape(JSON.stringify(path))}"]`);
      if (input) input.value = data.url;
      updateArt(path);
      refreshStatus();
      setState(`Image uploaded (${data.width}×${data.height}). Save to make it live.`, 'success');
    } catch (error) {
      setState(error.message || 'The image could not be uploaded.', 'error');
    }
  }

  // ---------- history ----------
  async function renderHistory() {
    const content = $('history-content');
    if (isNew || !original) { content.innerHTML = '<p class="ce-muted">History starts when the draft is published to the roster.</p>'; return; }
    const characterId = original.characterId;
    historyFor = characterId;
    content.innerHTML = '<p class="ce-muted">Loading history…</p>';
    let entries;
    try { entries = (await request(`/api/admin/characters/${encodeURIComponent(characterId)}/history`)).entries || []; }
    catch (error) { if (historyFor === characterId) content.innerHTML = `<p class="ce-warning">${escapeHtml(error.message)}</p>`; return; }
    if (historyFor !== characterId || view !== 'history') return;
    if (!entries.length) { content.innerHTML = '<p class="ce-muted">No saved versions yet. Versions are recorded from now on, each time someone saves this character or a code update changes it.</p>'; return; }
    content.innerHTML = `<ol class="ce-history-list">${entries.map((entry, i) => {
      const changeList = entry.before && entry.after ? diff(entry.before, entry.after, [], []) : [];
      const when = new Date(entry.savedAt);
      const rows = changeList.slice(0, 40).map(change => `<tr><td>${escapeHtml(labelFor(change.path))}</td><td class="ce-before">${escapeHtml(formatValue(change.before))}</td><td class="ce-after">${escapeHtml(formatValue(change.after))}</td></tr>`).join('');
      return `<li class="ce-history-entry">
        <div class="ce-history-head"><strong>${escapeHtml(ACTION_LABELS[entry.action] || humanize(entry.action))}</strong><span>${escapeHtml(entry.savedBy || 'Unknown')} · <time datetime="${escapeHtml(entry.savedAt)}">${escapeHtml(when.toLocaleString())}</time>${changeList.length ? ` · ${changeList.length} change${changeList.length === 1 ? '' : 's'}` : ''}</span></div>
        ${rows ? `<details><summary>What changed</summary><table class="ce-change-table"><thead><tr><th>What</th><th>Before</th><th>After</th></tr></thead><tbody>${rows}</tbody></table>${changeList.length > 40 ? `<p class="ce-muted">…and ${changeList.length - 40} more.</p>` : ''}</details>` : ''}
        <div class="ce-history-actions">${entry.after ? `<button type="button" class="text-button" data-load-version="${i}" data-side="after">Load this version</button>` : ''}${entry.before ? `<button type="button" class="text-button" data-load-version="${i}" data-side="before">Load the version before this</button>` : ''}</div>
      </li>`;
    }).join('')}</ol>`;
    content.querySelectorAll('[data-load-version]').forEach(button => button.addEventListener('click', () => {
      const entry = entries[Number(button.dataset.loadVersion)];
      const version = entry && entry[button.dataset.side];
      if (!version || !confirmLeave()) return;
      // Retiring and bringing back have their own buttons, so loading a version keeps the current state.
      working = clone(version);
      working.characterId = original.characterId;
      if (original.retired) working.retired = true; else delete working.retired;
      view = 'changes';
      renderAll();
      setState('Version loaded into the editor. Review the Changes tab, then save to make it live.', 'success');
    }));
  }

  // Descriptions grow to show their full text instead of scrolling inside a small box.
  function fitTextareas(root) {
    root.querySelectorAll('textarea').forEach(area => {
      if (!area.offsetParent) return; // Inside a closed section; fitted when it opens.
      area.style.height = 'auto';
      area.style.height = `${area.scrollHeight + 2}px`;
    });
  }

  // ---------- preview ----------
  function renderPreview() {
    const pips = skill => (skill.energy || []).map(type => `<span class="concept-pip ${escapeHtml(type.toLowerCase())}" title="${escapeHtml(type)}"></span>`).join('') || 'None';
    const img = (url, label, cls) => `<div class="${cls}">${url ? `<img src="${escapeHtml(imageSrc(url))}" alt="${escapeHtml(label)}">` : escapeHtml(label)}</div>`;
    const mission = missions.find(m => m.missionId === working.requiredMissionId);
    preview.innerHTML = `<div class="concept-head">${img(working.facePicture, 'Portrait', 'concept-face')}<div class="concept-head-info"><h3>${escapeHtml(working.name)}</h3><p></p><div class="concept-head-meta"><span>${escapeHtml(working.characterId)}</span><span>${mission ? `Unlock: ${escapeHtml(mission.title || mission.missionId)}` : 'Available from the start'}</span></div></div></div>
      ${working.passive ? `<article class="concept-passive"><div class="concept-skill-head">${img(working.passive.icon, 'Passive', 'concept-skill-image')}<div><span class="alternate-label">Passive skill</span><h4>${escapeHtml(working.passive.name)}</h4><p></p></div></div></article>` : ''}
      <div class="concept-skills">${working.skills.map((skill, i) => `<article class="concept-skill${skill.hiddenFromSelectionViewer ? ' alternate' : ''}"><div class="concept-skill-head">${img(skill.skillimage, skill.name || 'Skill', 'concept-skill-image')}<div>${skill.hiddenFromSelectionViewer ? '<span class="alternate-label">Alternate skill</span>' : ''}<h4>${escapeHtml(skill.name || `Skill ${i + 1}`)}</h4><p data-desc="${i}"></p></div></div><div class="concept-skill-meta"><div><span class="lbl">Cooldown</span><span class="val">${skill.cooldown ? escapeHtml(skill.cooldown) : 'None'}</span></div><div><span class="lbl">Classes</span><span class="val">${escapeHtml((skill.classes || []).join(', ') || 'None')}</span></div><div><span class="lbl">Chakra cost</span><span class="val concept-pips">${pips(skill)}</span></div></div></article>`).join('')}</div>`;
    const names = working.skills.map(s => s.name).concat(working.passive ? [working.passive.name] : []);
    const describe = (node, text) => { if (window.renderSkillDescription) window.renderSkillDescription(node, text || '', names); else node.textContent = text || ''; };
    describe(preview.querySelector('.concept-head-info p'), working.characterdeescription);
    if (working.passive) describe(preview.querySelector('.concept-passive p'), working.passive.description);
    preview.querySelectorAll('[data-desc]').forEach(node => describe(node, working.skills[Number(node.dataset.desc)].skilldescription));
    preview.querySelectorAll('img').forEach(image => image.addEventListener('error', () => { if (image.parentElement) image.parentElement.textContent = image.alt; }, { once: true }));
  }

  function renderChanges() {
    const list = changes();
    if (!list.length) { changesContent.innerHTML = '<p class="ce-muted">No unsaved changes.</p>'; return; }
    const stale = staleDescriptions();
    changesContent.innerHTML = `${stale.length ? `<p class="ce-warning">Numbers changed on ${stale.map(i => `<strong>${escapeHtml(working.skills[i].name)}</strong>`).join(', ')} but the description didn't. Check it still matches before saving.</p>` : ''}
      <table class="ce-change-table"><thead><tr><th>What</th><th>Before</th><th>After</th></tr></thead><tbody>${list.map(change => `<tr><td>${escapeHtml(labelFor(change.path))}</td><td class="ce-before">${escapeHtml(formatValue(change.before))}</td><td class="ce-after">${escapeHtml(formatValue(change.after))}</td></tr>`).join('')}</tbody></table>`;
  }

  function setView(next) {
    if (view === 'raw' && next !== 'raw' && raw.dataset.dirty === 'true' && !confirm('Leave Raw data without applying your JSON edits?')) return;
    view = next;
    document.querySelectorAll('[data-view]').forEach(button => {
      const active = button.dataset.view === view;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    });
    $('empty-state').hidden = Boolean(working);
    document.querySelector('.creator-tabs').hidden = !working; // the views only mean something once a character is open
    document.querySelectorAll('[data-panel]').forEach(panel => { panel.hidden = !working || panel.dataset.panel !== view; });
    if (!working) return;
    if (view === 'edit') fitTextareas(form);
    if (view === 'preview') renderPreview();
    if (view === 'changes') renderChanges();
    if (view === 'history') renderHistory();
    if (view === 'checks') renderChecks();
    if (view === 'raw') { raw.value = JSON.stringify(working, null, 2); raw.dataset.dirty = 'false'; $('raw-state').textContent = ''; }
  }

  function renderAll() {
    const technical = Boolean(builderCatalog && builderCatalog.advancedAllowed);
    $('export-character').hidden = !working || !technical;
    $('raw-tab').hidden = !technical;
    if (!technical && view === 'raw') view = 'edit';
    $('delete-character').hidden = !working || isNew || Boolean(original?.retired);
    $('discard-draft').hidden = !working || !isNew;
    if (working) renderForm();
    setView(view);
    refreshStatus();
  }

  // ---------- loading & selecting ----------
  function confirmLeave() {
    return !working || !changes().length || confirm('Discard your unsaved changes?');
  }
  function collectVocabulary() {
    const classes = new Set();
    const targets = new Set();
    roster.forEach(c => (c.skills || []).forEach(s => { (s.classes || []).forEach(name => classes.add(name)); if (s.target) targets.add(s.target); }));
    knownClasses = [...classes].sort();
    knownTargets = [...targets].sort();
  }
  async function loadRoster() {
    try {
      const data = await request('/api/admin/characters');
      roster = Array.isArray(data.characters) ? data.characters : [];
      revisions = data.revisions || {};
      collectVocabulary();
      renderList();
    } catch (error) {
      list.innerHTML = `<p class="empty">${escapeHtml(error.status === 403 || error.status === 401 ? 'Sign in with an admin account to edit characters.' : error.message)}</p>`;
      setState(error.message, 'error');
    }
  }
  async function loadMissions() {
    try { missions = (await request('/api/admin/missions')).missions || []; }
    catch (_) { missions = []; }
  }
  function select(characterId) {
    const found = roster.find(c => c.characterId === characterId);
    if (!found) { setState(`No character with id ${characterId}.`, 'error'); return; }
    original = clone(found);
    working = clone(found);
    isNew = false;
    draftMeta = null;
    const url = new URL(location.href); url.searchParams.set('character', characterId); url.searchParams.delete('draft'); history.replaceState(null, '', url);
    if (view === 'raw' || view === 'changes') view = 'edit';
    renderAll();
  }
  function showDraft(draft) {
    draftMeta = { id: draft.id, notes: draft.notes, problems: draft.problems || [], source: draft.source };
    original = clone(draft.character);
    working = clone(draft.character);
    isNew = true;
    if (view === 'raw' || view === 'changes' || view === 'history') view = 'edit';
    const url = new URL(location.href); url.searchParams.set('draft', draft.id); url.searchParams.delete('character'); history.replaceState(null, '', url);
    renderAll();
  }
  async function openDraft(id) {
    try {
      const data = await request(`/api/admin/editor-drafts/${encodeURIComponent(id)}`);
      showDraft(data.draft);
    } catch (error) {
      setState(error.status === 404 ? 'That draft no longer exists.' : error.message, 'error');
    }
  }
  // New characters start as a saved draft, so work is never lost between sessions.
  async function startNew() {
    const taken = new Set([...roster.map(c => c.characterId), ...drafts.map(d => d.characterId)]);
    let n = 1;
    while (taken.has(n === 1 ? 'new-character' : `new-character-${n}`)) n += 1;
    const id = n === 1 ? 'new-character' : `new-character-${n}`;
    const character = clone(NEW_CHARACTER);
    character.id = id;
    character.characterId = id;
    character.skills.forEach((skill, index) => { skill.id = `${id}-skill-${index + 1}`; delete skill.damage; });
    try {
      const data = await request('/api/admin/editor-drafts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ character }) });
      await loadDrafts();
      view = 'edit';
      showDraft(data.draft);
      setState('Draft created. Build the character, then Publish when it\'s ready.', 'success');
    } catch (error) {
      setState(error.message, 'error');
    }
  }

  // ---------- editing ----------
  function readInput(target) {
    const path = JSON.parse(target.dataset.path);
    const kind = target.dataset.kind;
    let value = target.value;
    if (kind === 'flag') {
      if (target.checked) setAt(working, path, true);
      else delete getAt(working, path.slice(0, -1))[path[path.length - 1]];
      return path;
    }
    if (kind === 'number') {
      if (value === '') { delete getAt(working, path.slice(0, -1))[path[path.length - 1]]; return path; }
      value = Number(value);
      if (!Number.isFinite(value)) return null;
    }
    if (kind === 'int') {
      if (value === '') return null;
      value = Math.min(Number(target.dataset.max) || 999, Math.max(0, Math.round(Number(value) || 0)));
    }
    if (kind === 'id') {
      value = value.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      // A new character's internal and skill ids follow its character id.
      const previous = working.characterId;
      working.id = value;
      (working.skills || []).forEach(skill => {
        if (typeof skill.id === 'string' && skill.id.startsWith(`${previous}-`)) skill.id = value + skill.id.slice(previous.length);
      });
    }
    if (kind === 'list') {
      value = value.split(',').map(entry => entry.trim()).filter(Boolean);
      if (!value.length && !getAt(working, path)) return path;
    }
    if (kind === 'optional' && !value) {
      delete getAt(working, path.slice(0, -1))[path[path.length - 1]];
      return path;
    }
    if (kind === 'mission' && !value) {
      // Keep however "no mission" was stored originally, so it doesn't register as a change.
      if (original && original.requiredMissionId !== undefined && !original.requiredMissionId) working.requiredMissionId = original.requiredMissionId;
      else delete working.requiredMissionId;
      return path;
    }
    setAt(working, path, value);
    return path;
  }
  function updateArt(path) {
    const box = form.querySelector(`[data-art="${CSS.escape(JSON.stringify(path))}"]`);
    if (!box) return;
    const url = getAt(working, path);
    box.textContent = url ? '' : 'No image';
    if (url) {
      const img = document.createElement('img');
      img.alt = '';
      img.src = imageSrc(url);
      img.addEventListener('error', () => { box.textContent = 'Image not found'; }, { once: true });
      box.append(img);
    }
  }
  form.addEventListener('input', event => {
    const target = event.target;
    if (target.dataset.sl) { slInput(target); return; }
    if (target.dataset.slQuestField) {
      const key = target.dataset.slQuestField;
      let value = target.value;
      if (!['swapFrom', 'swapTo'].includes(key)) { if (value === '') return; value = Math.max(key === 'skills' ? 1 : 0, Math.min(99, Math.round(Number(value) || 0))); }
      questChange({ [key]: value });
      refreshStatus();
      return;
    }
    if (target.dataset.slQuestToggle) {
      const key = target.dataset.slQuestToggle;
      const on = target.checked;
      const defaults = { heal: 5, reduction: 10, boost: 5 };
      if (key === 'partialStuns') questChange({ partialStuns: on });
      else if (key === 'swap') {
        const from = working.skills.find(skill => !skill.hiddenFromSelectionViewer) || working.skills[0] || {};
        const to = working.skills.find(skill => skill.hiddenFromSelectionViewer && skill.id !== from.id);
        questChange(on ? { swapFrom: from.id, swapTo: to ? to.id : newAlternateSkill(from.id) } : { swapFrom: '', swapTo: '' });
      } else questChange({ [key]: on ? defaults[key] : 0 });
      rerenderForm();
      return;
    }
    if (builder && target.dataset.bpath && !target.dataset.bact) {
      builder.input(target);
      if (target.tagName === 'TEXTAREA') { target.style.height = 'auto'; target.style.height = `${target.scrollHeight + 2}px`; }
      if (target.closest('.cb-image')) updateArt(JSON.parse(target.dataset.bpath));
      return;
    }
    if (!target.dataset.path) return;
    const path = readInput(target);
    if (target.tagName === 'TEXTAREA') { target.style.height = 'auto'; target.style.height = `${target.scrollHeight + 2}px`; }
    if (path && ['skillimage', 'facePicture', 'icon', 'statusIcon'].includes(path[path.length - 1])) updateArt(path);
    if (path && path.join('.') === 'skills.' + path[1] + '.name') {
      const order = target.closest('[data-skill]');
      if (order) order.setAttribute('aria-label', target.value);
    }
    refreshStatus();
  });
  form.addEventListener('toggle', event => { if (event.target.open) fitTextareas(event.target); }, true);
  form.addEventListener('change', event => {
    const target = event.target;
    if (target.dataset.slAdd !== undefined || target.dataset.slAddAlways !== undefined) {
      const id = target.value;
      target.value = '';
      if (id) slAdd(target, id);
      return;
    }
    if (builder && target.dataset.bact && target.tagName === 'SELECT') {
      const value = target.value;
      target.value = '';
      builder.action(target, value);
      return;
    }
    if (target.dataset.addClass !== undefined) {
      const skill = working.skills[Number(target.dataset.addClass)];
      let name = target.value;
      if (name === '__custom') name = (prompt('Class name (for example Physical or Instant*):') || '').trim();
      if (name && !skill.classes.includes(name)) skill.classes.push(name);
      if (name && !knownClasses.includes(name)) knownClasses.push(name);
      rerenderSkill(Number(target.dataset.addClass));
      return;
    }
    if (target.dataset.path && (target.tagName === 'SELECT' || target.type === 'checkbox')) { readInput(target); refreshStatus(); }
  });
  form.addEventListener('click', event => {
    const step = event.target.closest('[data-step]');
    if (step) {
      const path = JSON.parse(step.dataset.step);
      const input = step.parentElement.querySelector('input');
      const max = Number(input.dataset.max) || 999;
      const next = Math.min(max, Math.max(0, (Number(getAt(working, path)) || 0) + Number(step.dataset.delta)));
      setAt(working, path, next);
      input.value = String(next);
      refreshStatus();
      return;
    }
    const chakra = event.target.closest('[data-chakra]');
    if (chakra) {
      const index = Number(chakra.dataset.chakra);
      const skill = working.skills[index];
      const type = chakra.dataset.type;
      const energy = (skill.energy || []).slice();
      if (Number(chakra.dataset.delta) > 0) {
        // Keep the existing order and add new chakra next to matching types.
        const at = energy.lastIndexOf(type);
        if (at === -1) energy.push(type); else energy.splice(at + 1, 0, type);
      } else {
        const at = energy.lastIndexOf(type);
        if (at !== -1) energy.splice(at, 1);
      }
      skill.energy = energy;
      rerenderSkill(index, `[data-chakra="${index}"][data-type="${type}"][data-delta="${chakra.dataset.delta}"]`);
      return;
    }
    const removeClass = event.target.closest('[data-remove-class]');
    if (removeClass) {
      const index = Number(removeClass.dataset.removeClass);
      working.skills[index].classes.splice(Number(removeClass.dataset.classIndex), 1);
      rerenderSkill(index);
      return;
    }
    const upload = event.target.closest('[data-upload]');
    if (upload) {
      uploadPath = JSON.parse(upload.dataset.upload);
      $('art-file').value = '';
      $('art-file').click();
      return;
    }
    const questButton = event.target.closest('[data-sl-quest]');
    if (questButton) {
      if (questButton.dataset.slQuest === 'add') questChange({});
      else if (confirm('Remove the quest and its rewards?')) delete working.passive.awakening;
      rerenderForm();
      return;
    }
    const slButton = event.target.closest('[data-sl-remove], [data-sl-move], [data-sl-describe], [data-sl-add-skill]');
    if (slButton) { slClick(slButton); return; }
    const builderButton = event.target.closest('button[data-bact]');
    if (builder && builderButton) { builder.action(builderButton); return; }
    if (event.target.id === 'restore-character') { restoreCharacter(); return; }
    if (event.target.id === 'release-character') { releaseCharacter(); return; }
    if (event.target.id === 'toggle-passive') {
      if (working.passive) {
        if (!confirm(`Remove ${working.passive.name || 'this passive'}? Its mechanics go with it.`)) return;
        delete working.passive;
      } else {
        working.passive = { name: '', icon: '', description: '' };
      }
      rerenderForm();
    }
  });
  // Sentence edits: read the line's current values, change one blank, write it back in place.
  function slInput(target) {
    const at = JSON.parse(target.dataset.sl);
    const always = at[0] === 'startStatuses';
    const owner = getAt(working, at);
    if (!owner) return;
    const effect = always ? { type: 'apply_status', scope: 'self', ...specWithoutAlways(owner) } : owner;
    const found = SL.readEffect(effect);
    if (!found) return;
    const sentence = SL.BY_ID[found.sentence];
    const field = sentence.fields.find(entry => entry.key === target.dataset.slField);
    let value = target.value;
    if (field && (field.kind === 'number' || field.kind === 'turns')) {
      if (value === '') return;
      value = Math.max(field.min ?? (field.kind === 'turns' ? 1 : 0), Math.min(field.max ?? 999, Math.round(Number(value) || 0)));
    }
    if (field && field.kind === 'skill' && value === '__new') {
      value = newAlternateSkill(found.values.from);
      const next = { ...found.values, [target.dataset.slField]: value };
      sentence.write(effect, next, found.values, slContext(working.skills[at[1]]));
      rerenderForm();
      return;
    }
    const next = { ...found.values, [target.dataset.slField]: value };
    sentence.write(effect, next, found.values, slContext(always ? {} : working.skills[at[1]]));
    if (always) {
      owner.duration = 99;
      owner.metadata = { ...effect.metadata, permanent: true, cannotBeCleansed: true };
    }
    refreshStatus();
  }
  function newAlternateSkill(fromId) {
    const from = working.skills.find(skill => skill.id === fromId) || working.skills[0] || {};
    const name = `${from.name || 'Skill'} (Transformed)`;
    let id = `${working.characterId}-${String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`;
    while (working.skills.some(skill => skill.id === id)) id += '-2';
    working.skills.push({ id, name, skillimage: from.skillimage || '', skilldescription: '', energy: (from.energy || []).slice(),
      target: from.target || 'single-enemy', cooldown: from.cooldown || 0, classes: (from.classes || []).slice(), effects: [],
      hiddenFromSelectionViewer: true, useBaseSkillCooldown: true });
    return id;
  }
  // Starting values for a template line, filled from this character where it helps.
  function slStartValues(id, skillIndex) {
    const values = SL.defaults(id);
    const ctx = slContext(working.skills[skillIndex] || {});
    if (id === 'gainStack') {
      const name = (prompt('What are the stacks called? For example: Clone, Pill, Sand Flow.') || '').trim();
      if (!name) return null;
      values.name = name;
    }
    if (id === 'damagePerStack') {
      if (!ctx.stacks.length) { setState('Add a "Gain a stack" line first, so there is a stack to count.', 'error'); return null; }
      values.stack = ctx.stacks[0].id;
    }
    if (id === 'transform') {
      const own = working.skills[skillIndex];
      const from = working.skills.find(skill => skill !== own && !skill.hiddenFromSelectionViewer) || own;
      values.from = from.id;
      const alternate = working.skills.find(skill => skill.hiddenFromSelectionViewer && skill.id !== from.id);
      values.to = alternate ? alternate.id : newAlternateSkill(from.id);
    }
    return values;
  }
  function slAdd(target, id) {
    const sentence = SL.BY_ID[id];
    if (!sentence) return;
    if (target.dataset.slAddAlways !== undefined) {
      const ctx = slContext({ name: (working.passive && working.passive.name) || 'passive' });
      const effect = sentence.create({ ...SL.defaults(id), who: 'self', turns: 99 }, ctx);
      const spec = { statusId: effect.statusId, duration: 99, metadata: { ...effect.metadata, permanent: true, cannotBeCleansed: true } };
      delete spec.metadata.turnDurationAnchor;
      (working.startStatuses = working.startStatuses || []).push(spec);
    } else {
      const skill = working.skills[Number(target.dataset.slAdd)];
      if (!skill) return;
      const values = slStartValues(id, Number(target.dataset.slAdd));
      if (!values) return;
      (skill.effects = skill.effects || []).push(sentence.create(values, slContext(skill)));
    }
    rerenderForm();
  }
  function slClick(button) {
    if (button.dataset.slAddSkill !== undefined) {
      const list = working.skills || (working.skills = []);
      let id = `${working.characterId}-skill-${list.length + 1}`;
      while (list.some(skill => skill.id === id)) id += '-new';
      list.push({ id, name: `Skill ${list.length + 1}`, skillimage: '', skilldescription: '', energy: ['Random'], target: 'single-enemy', cooldown: 0, classes: ['Instant'], effects: [] });
      rerenderForm();
      return;
    }
    if (button.dataset.slDescribe !== undefined) {
      const skill = working.skills[Number(button.dataset.slDescribe)];
      const text = SL.describeSkill(skill, working);
      if (!text) { setState('Add some lines first. Special mechanics need describing by hand.', 'error'); return; }
      if (skill.skilldescription && skill.skilldescription.trim() && !confirm('Replace the current description with one written from the lines?')) return;
      skill.skilldescription = text;
      rerenderForm();
      return;
    }
    const at = JSON.parse(button.dataset.slRemove || button.dataset.slMove);
    const list = getAt(working, at.slice(0, -1));
    const index = Number(at[at.length - 1]);
    if (!Array.isArray(list)) return;
    if (button.dataset.slRemove) {
      list.splice(index, 1);
      if (at[0] === 'startStatuses' && !list.length) delete working.startStatuses;
    } else {
      const to = index + Number(button.dataset.dir);
      if (to < 0 || to >= list.length) return;
      [list[index], list[to]] = [list[to], list[index]];
    }
    rerenderForm();
  }
  // Admins on the server's advanced list can switch to the full block builder.
  function setAdvanced(on) {
    advancedView = Boolean(on && builder && builderCatalog && builderCatalog.advancedAllowed);
    try { localStorage.setItem('ce-advanced-view', advancedView ? '1' : '0'); } catch (_) {}
    const toggle = $('advanced-view');
    if (toggle) { toggle.hidden = !(builderCatalog && builderCatalog.advancedAllowed); toggle.textContent = advancedView ? 'Simple view' : 'Advanced view'; }
    if (working) rerenderForm();
  }

  // Re-renders one skill card, keeping its open sections and the focused control.
  function rerenderSkill(index, focusSelector) {
    const card = form.querySelector(`[data-skill="${index}"]`);
    if (!card) return;
    const openSections = [...card.querySelectorAll('details')].map(details => details.open);
    const wrapper = document.createElement('div');
    wrapper.innerHTML = skillCard(working.skills[index], index).trim();
    const fresh = wrapper.firstElementChild;
    fresh.querySelectorAll('details').forEach((details, i) => { details.open = Boolean(openSections[i]); });
    card.replaceWith(fresh);
    fitTextareas(fresh);
    const focus = focusSelector && fresh.querySelector(focusSelector);
    if (focus && !focus.disabled) focus.focus();
    refreshStatus();
  }

  // ---------- saving ----------
  async function save() {
    if (!working || busy) return;
    if (!String(working.name || '').trim()) { setState('Give the character a name before saving.', 'error'); return; }
    if (view === 'raw' && raw.dataset.dirty === 'true') { setState('Apply or discard your Raw data edits first.', 'error'); return; }
    if (isNew) { await saveDraft(); return; }
    const problems = currentChecks.filter(issue => issue.level === 'error').length;
    if (problems && !confirm(`The Checks tab found ${problems} problem${problems === 1 ? '' : 's'} the engine will ignore or misread. Save anyway?`)) {
      setView('checks');
      return;
    }
    busy = true;
    refreshStatus();
    setState('Saving…');
    try {
      const url = isNew ? '/api/admin/characters' : `/api/admin/characters/${encodeURIComponent(original.characterId)}`;
      const headers = { 'Content-Type': 'application/json' };
      if (!isNew && revisions[original.characterId]) headers['X-Character-Revision'] = revisions[original.characterId];
      const data = await request(url, { method: isNew ? 'POST' : 'PUT', headers, body: JSON.stringify(working) });
      const saved = data.character || working;
      if (data.revision) revisions[saved.characterId] = data.revision;
      if (data.hiddenFromPlayers && accessPolicies) accessPolicies[saved.characterId] = { player: { visibility: 'hidden', unlock: 'inherit' } };
      const count = isNew ? 0 : changes().length;
      const index = roster.findIndex(c => c.characterId === (original ? original.characterId : saved.characterId));
      if (index === -1) roster.push(clone(saved)); else roster[index] = clone(saved);
      collectVocabulary();
      original = clone(saved);
      working = clone(saved);
      const wasNew = isNew;
      isNew = false;
      busy = false;
      const pageUrl = new URL(location.href); pageUrl.searchParams.set('character', saved.characterId); history.replaceState(null, '', pageUrl);
      renderAll();
      setState(wasNew
        ? `Created ${saved.name}. ${data.hiddenFromPlayers ? 'Staff can play them now; release them to players when they’re ready.' : 'They’re in the live roster.'}`
        : `Saved ${count} change${count === 1 ? '' : 's'} to ${saved.name}. Live for new matches; matches in progress finish on the old version.`, 'success');
    } catch (error) {
      busy = false;
      refreshStatus();
      setState(error.message || 'The character could not be saved.', 'error');
    }
  }

  async function saveDraft() {
    if (!draftMeta) return false;
    busy = true;
    refreshStatus();
    setState('Saving draft…');
    try {
      const data = await request(`/api/admin/editor-drafts/${encodeURIComponent(draftMeta.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ character: working }) });
      original = clone(data.draft.character);
      working = clone(data.draft.character);
      busy = false;
      const index = drafts.findIndex(d => d.id === draftMeta.id);
      if (index !== -1) drafts[index] = { ...drafts[index], name: data.draft.name, characterId: data.draft.characterId, facePicture: data.draft.facePicture, updatedBy: data.draft.updatedBy };
      refreshStatus();
      setState(`Draft saved. It isn't in the game until you publish it.`, 'success');
      return true;
    } catch (error) {
      busy = false;
      refreshStatus();
      setState(error.message || 'The draft could not be saved.', 'error');
      return false;
    }
  }
  // Publishing adds the draft to the live roster (staff only at first) and removes the draft.
  async function publishDraft() {
    if (!isNew || !draftMeta || busy) return;
    if (roster.some(c => c.characterId === working.characterId)) { setState(`A live character already uses the id "${working.characterId}". Change the character id first.`, 'error'); return; }
    const problems = currentChecks.filter(issue => issue.level === 'error').length;
    if (problems && !confirm(`The Checks tab found ${problems} problem${problems === 1 ? '' : 's'} the engine will ignore or misread. Publish anyway?`)) { setView('checks'); return; }
    if (!confirm(`Publish ${working.name} to the roster? They start as staff only, so admins and moderators can test them before you release them to players.`)) return;
    if (changes().length && !(await saveDraft())) return;
    busy = true;
    refreshStatus();
    setState('Publishing…');
    try {
      const data = await request('/api/admin/characters', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(working) });
      const saved = data.character || working;
      if (data.revision) revisions[saved.characterId] = data.revision;
      if (data.hiddenFromPlayers && accessPolicies) accessPolicies[saved.characterId] = { player: { visibility: 'hidden', unlock: 'inherit' } };
      roster.push(clone(saved));
      collectVocabulary();
      await request(`/api/admin/editor-drafts/${encodeURIComponent(draftMeta.id)}`, { method: 'DELETE' }).catch(() => {});
      await loadDrafts();
      busy = false;
      select(saved.characterId);
      setState(`Published ${saved.name}. Staff can play them now; release them to players when they're ready.`, 'success');
    } catch (error) {
      busy = false;
      refreshStatus();
      setState(error.message || 'The draft could not be published.', 'error');
    }
  }
  async function discardDraft() {
    if (!isNew || !draftMeta || busy) return;
    if (!confirm(`Discard the draft "${working.name}"? This can't be undone.`)) return;
    try {
      await request(`/api/admin/editor-drafts/${encodeURIComponent(draftMeta.id)}`, { method: 'DELETE' });
      original = null; working = null; isNew = false; draftMeta = null;
      const url = new URL(location.href); url.searchParams.delete('draft'); history.replaceState(null, '', url);
      await loadDrafts();
      renderAll();
      setState('Draft discarded.', 'success');
    } catch (error) {
      setState(error.message, 'error');
    }
  }

  // Characters are retired, never deleted: matches, saved teams and stats refer to roster
  // positions, so a retired character keeps its place but is hidden and can't be picked.
  async function removeCharacter() {
    if (!original || busy) return;
    if (!working || changes().length) { setState('Save or discard your changes before retiring this character.', 'error'); return; }
    if (!confirm(`Retire ${original.name}?

They disappear from character selection, the shop, missions and the Tower for everyone. Matches in progress finish normally. You can bring them back any time.`)) return;
    busy = true;
    try {
      const data = await request(`/api/admin/characters/${encodeURIComponent(original.characterId)}`, { method: 'DELETE' });
      busy = false;
      applySaved(data);
      setState(`Retired ${original.name}. Use Bring back to return them to the roster.`, 'success');
    } catch (error) {
      busy = false;
      setState(error.message, 'error');
    }
  }
  async function restoreCharacter() {
    if (!original || busy) return;
    if (changes().length) { setState('Save or discard your changes first.', 'error'); return; }
    const next = clone(original);
    delete next.retired;
    busy = true;
    try {
      const data = await request(`/api/admin/characters/${encodeURIComponent(original.characterId)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Character-Revision': revisions[original.characterId] || '' }, body: JSON.stringify(next) });
      busy = false;
      applySaved(data);
      setState(`${original.name} is back in the roster for new matches.`, 'success');
    } catch (error) {
      busy = false;
      setState(error.message, 'error');
    }
  }
  function applySaved(data) {
    const saved = data.character;
    if (!saved) return;
    if (data.revision) revisions[saved.characterId] = data.revision;
    const index = roster.findIndex(c => c.characterId === saved.characterId);
    if (index !== -1) roster[index] = clone(saved);
    original = clone(saved);
    working = clone(saved);
    renderAll();
  }
  async function releaseCharacter() {
    if (!original || busy) return;
    if (!confirm(`Release ${original.name} to players? They'll appear on character selection for everyone who has them unlocked.`)) return;
    busy = true;
    try {
      await setPlayerVisibility(original.characterId, true);
      busy = false;
      renderAll();
      setState(`${original.name} is released to players.`, 'success');
    } catch (error) {
      busy = false;
      setState(error.message, 'error');
    }
  }

  // ---------- wiring ----------
  list.addEventListener('click', event => {
    const item = event.target.closest('[data-character-id]');
    if (!item || (working && !isNew && original && item.dataset.characterId === original.characterId)) return;
    if (confirmLeave()) select(item.dataset.characterId);
  });
  $('roster-search').addEventListener('input', renderList);
  $('drafts-list').addEventListener('click', event => {
    const item = event.target.closest('[data-draft-id]');
    if (!item || (isNew && draftMeta && item.dataset.draftId === draftMeta.id)) return;
    if (confirmLeave()) openDraft(item.dataset.draftId);
  });
  $('publish-draft').addEventListener('click', publishDraft);
  $('discard-draft').addEventListener('click', discardDraft);
  $('refresh-roster').addEventListener('click', async () => {
    if (!confirmLeave()) return;
    const current = original && original.characterId;
    await loadRoster();
    if (current && roster.some(c => c.characterId === current)) select(current);
  });
  $('new-character').addEventListener('click', () => { if (confirmLeave()) startNew(); });
  saveButton.addEventListener('click', save);
  $('revert-character').addEventListener('click', () => {
    if (!original || !confirm('Discard all unsaved changes to this character?')) return;
    working = clone(original);
    renderAll();
  });
  $('delete-character').addEventListener('click', removeCharacter);
  $('art-file').addEventListener('change', event => uploadArt(event.target.files && event.target.files[0]));
  $('export-character').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(working, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${working.characterId || 'character'}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
  raw.addEventListener('input', () => { raw.dataset.dirty = 'true'; $('raw-state').textContent = 'Not applied yet'; });
  $('raw-apply').addEventListener('click', () => {
    let parsed;
    try { parsed = JSON.parse(raw.value); }
    catch (error) { $('raw-state').textContent = `That isn't valid JSON: ${error.message}`; return; }
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.skills)) { $('raw-state').textContent = 'The character needs a skills list.'; return; }
    if (!isNew && parsed.characterId !== original.characterId) { $('raw-state').textContent = "The character id can't change on a live character."; return; }
    working = parsed;
    raw.dataset.dirty = 'false';
    rerenderForm();
    $('raw-state').textContent = 'Applied. Review the Changes tab, then save.';
  });
  $('raw-reset').addEventListener('click', () => { raw.value = JSON.stringify(working, null, 2); raw.dataset.dirty = 'false'; $('raw-state').textContent = ''; });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); if (!saveButton.disabled) save(); }
  });
  window.addEventListener('beforeunload', event => { if (working && changes().length) { event.preventDefault(); event.returnValue = ''; } });

  (async () => {
    await Promise.all([loadRoster(), loadMissions(), loadAccess(), loadCatalog(), loadDrafts()]);
    setupBuilder();
    let savedAdvanced = false;
    try { savedAdvanced = localStorage.getItem('ce-advanced-view') === '1'; } catch (_) {}
    setAdvanced(savedAdvanced);
    $('advanced-view').addEventListener('click', () => setAdvanced(!advancedView));
    const params = new URLSearchParams(location.search);
    if (params.get('draft')) await openDraft(params.get('draft'));
    else if (params.get('character')) select(params.get('character'));
    else renderAll();
  })();
})();
