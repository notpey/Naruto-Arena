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

  let roster = [];
  let missions = [];
  let knownClasses = [];
  let knownTargets = [];
  let original = null;
  let working = null;
  let isNew = false;
  let view = 'edit';
  let busy = false;

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
  function changes() { return original && working ? diff(original, working, [], []) : (isNew && working ? [{ path: ['characterId'], before: undefined, after: working.characterId }] : []); }
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
  function refreshStatus() {
    const count = changes().length;
    const badge = $('changes-count');
    badge.hidden = !count;
    badge.textContent = String(count);
    saveButton.disabled = busy || !working || (!count && !isNew);
    saveButton.textContent = busy ? 'Saving…' : isNew ? 'Create character' : count ? `Save ${count} change${count === 1 ? '' : 's'}` : 'Save changes';
    $('revert-character').hidden = !count || isNew;
    if (!busy && working) setState(isNew ? 'New character · not saved yet' : count ? `${count} unsaved change${count === 1 ? '' : 's'}` : `${working.name} · saved and live`);
    renderList();
    document.querySelectorAll('[data-stale-hint]').forEach(node => { node.hidden = !staleDescriptions().includes(Number(node.dataset.staleHint)); });
  }

  // ---------- roster list ----------
  function renderList() {
    const query = $('roster-search').value.trim().toLowerCase();
    const visible = roster.filter(c => `${c.name} ${c.characterId}`.toLowerCase().includes(query));
    if (!visible.length) { list.innerHTML = `<p class="empty">${roster.length ? 'No characters match.' : 'No characters loaded.'}</p>`; return; }
    const dirtyId = working && !isNew && changes().length ? original.characterId : '';
    list.innerHTML = visible.map(c => `<button type="button" class="draft-item ce-roster-item${working && !isNew && c.characterId === original.characterId ? ' active' : ''}" data-character-id="${escapeHtml(c.characterId)}">
      <img src="${escapeHtml(imageSrc(c.facePicture))}" alt="" loading="lazy">
      <span><strong>${escapeHtml(c.name)}${c.characterId === dirtyId ? ' <span class="ce-dirty-dot" title="Unsaved changes">●</span>' : ''}</strong><small>${escapeHtml(c.characterId)}${c.requiredMissionId ? ' · mission unlock' : ''}</small></span>
    </button>`).join('');
    list.querySelectorAll('img').forEach(img => img.addEventListener('error', () => { img.style.visibility = 'hidden'; }, { once: true }));
  }

  // ---------- edit form ----------
  function field(path, kind, attrs) {
    const value = getAt(working, path);
    return `data-path="${pathAttr(path)}" data-kind="${kind}" ${attrs || ''} value="${escapeHtml(value ?? '')}"`;
  }
  function art(path, label) {
    const url = getAt(working, path) || '';
    return `<div class="inline-art"><div class="inline-art-preview" data-art="${pathAttr(path)}">${url ? `<img src="${escapeHtml(imageSrc(url))}" alt="${escapeHtml(label)}">` : escapeHtml(label)}</div><input type="url" placeholder="https://i.imgur.com/…" aria-label="${escapeHtml(label)} URL" ${field(path, 'text')}></div>`;
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
      return `<label class="ce-tip ce-tip-icon"><span>${escapeHtml(label)}</span><span class="ce-tip-icon-row"><span class="ce-tip-thumb" data-art="${pathAttr(path)}">${url ? `<img src="${escapeHtml(imageSrc(url))}" alt="">` : ''}</span><input type="url" ${field(path, 'text')}></span></label>`;
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
    return `<article class="inline-skill-card${isAlternate ? ' alternate' : ''}" data-skill="${i}">
      <div class="inline-card-title"><div class="inline-skill-title"><span class="skill-order">${i + 1}</span><input maxlength="80" placeholder="Skill name" aria-label="Skill ${i + 1} name" ${field(['skills', i, 'name'], 'text')}></div>${isAlternate ? '<span class="ce-badge">Alternate</span>' : ''}</div>
      <div class="inline-skill-main">${art(['skills', i, 'skillimage'], 'Skill image')}<textarea rows="4" maxlength="4000" placeholder="Skill description" aria-label="Skill ${i + 1} description" data-path="${pathAttr(['skills', i, 'skilldescription'])}" data-kind="text">${escapeHtml(skill.skilldescription)}</textarea></div>
      <p class="ce-stale" data-stale-hint="${i}" hidden>You changed numbers on this skill. Check the description still matches.</p>
      <div class="inline-skill-footer ce-skill-footer"><label>Cooldown ${stepper(['skills', i, 'cooldown'], `Skill ${i + 1} cooldown`, 99)}</label>${targetSelect(i)}${classControls(i)}${chakraControls(i)}</div>
      ${effectRows(i)}
      ${ruleToggles(i)}
    </article>`;
  }
  function passiveSection() {
    const passive = working.passive;
    const bar = `<div class="inline-section-bar"><h2>Passive skill</h2><button type="button" class="button secondary" id="toggle-passive">${passive ? 'Remove passive' : 'Add passive'}</button></div>`;
    if (!passive) return `<section class="passive-section">${bar}</section>`;
    const tips = tooltipFields(passive, ['passive'], () => false).map(path => tooltipInput(path, labelFor(path).split(' · ').slice(1).join(' · ')));
    return `<section class="passive-section">${bar}<div class="inline-passive-card">
      <div class="inline-card-title"><input maxlength="80" placeholder="Passive name" aria-label="Passive name" ${field(['passive', 'name'], 'text')}></div>
      <div class="inline-character-main">${art(['passive', 'icon'], 'Passive image')}<textarea rows="3" maxlength="4000" placeholder="What does this passive do?" aria-label="Passive description" data-path="${pathAttr(['passive', 'description'])}" data-kind="text">${escapeHtml(passive.description)}</textarea></div>
      ${tips.length ? `<details class="inline-skill-more ce-effects"><summary>Passive tooltips &amp; icons (${tips.length})</summary><div><div class="ce-effect">${tips.join('')}</div></div></details>` : ''}
    </div></section>`;
  }
  function renderForm() {
    const missionOptions = [`<option value="">None (always available)</option>`].concat(missions.map(m => `<option value="${escapeHtml(m.missionId)}"${m.missionId === working.requiredMissionId ? ' selected' : ''}>${escapeHtml(m.title || m.name || m.missionId)}</option>`));
    if (working.requiredMissionId && !missions.some(m => m.missionId === working.requiredMissionId)) missionOptions.push(`<option value="${escapeHtml(working.requiredMissionId)}" selected>${escapeHtml(working.requiredMissionId)} (not found)</option>`);
    form.innerHTML = `<section class="inline-character">
        <div class="inline-card-title"><input maxlength="80" placeholder="Character name" aria-label="Character name" ${field(['name'], 'text')}></div>
        <div class="inline-character-main">${art(['facePicture'], 'Portrait')}<textarea rows="5" maxlength="4000" placeholder="Character description" aria-label="Character description" data-path="${pathAttr(['characterdeescription'])}" data-kind="text">${escapeHtml(working.characterdeescription)}</textarea></div>
        <div class="inline-character-bottom"><label>Character id <input ${isNew ? '' : 'readonly title="Ids can\'t change on a live character."'} ${field(['characterId'], 'id')}></label><label>Mission to unlock <select data-path="${pathAttr(['requiredMissionId'])}" data-kind="mission">${missionOptions.join('')}</select></label><label>Tags <input placeholder="none" data-path="${pathAttr(['tags'])}" data-kind="list" value="${escapeHtml((working.tags || []).join(', '))}"></label></div>
      </section>
      ${passiveSection()}
      <section class="skills-section"><div class="inline-section-bar"><h2>Skills</h2><span class="ce-muted">Add, remove, or reorder skills in Raw data.</span></div><div class="inline-skill-grid">${working.skills.map(skillCard).join('')}</div></section>`;
    form.querySelectorAll('[data-art] img').forEach(img => img.addEventListener('error', () => { img.replaceWith(document.createTextNode('No image')); }, { once: true }));
    fitTextareas(form);
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
    if (isNew) { changesContent.innerHTML = '<p class="ce-muted">This character is new. Everything here will be created when you save.</p>'; return; }
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
    document.querySelectorAll('[data-panel]').forEach(panel => { panel.hidden = !working || panel.dataset.panel !== view; });
    if (!working) return;
    if (view === 'edit') fitTextareas(form);
    if (view === 'preview') renderPreview();
    if (view === 'changes') renderChanges();
    if (view === 'raw') { raw.value = JSON.stringify(working, null, 2); raw.dataset.dirty = 'false'; $('raw-state').textContent = ''; }
  }

  function renderAll() {
    $('export-character').hidden = !working;
    $('delete-character').hidden = !working || isNew;
    if (working) renderForm();
    setView(view);
    refreshStatus();
  }

  // ---------- loading & selecting ----------
  function confirmLeave() {
    return !working || (!changes().length && !isNew) || confirm('Discard your unsaved changes?');
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
    const url = new URL(location.href); url.searchParams.set('character', characterId); history.replaceState(null, '', url);
    if (view === 'raw' || view === 'changes') view = 'edit';
    renderAll();
  }
  function startNew() {
    original = null;
    working = clone(NEW_CHARACTER);
    isNew = true;
    view = 'edit';
    const url = new URL(location.href); url.searchParams.delete('character'); history.replaceState(null, '', url);
    renderAll();
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
    if (event.target.id === 'toggle-passive') {
      if (working.passive) {
        if (!confirm(`Remove ${working.passive.name || 'this passive'}? Its mechanics go with it.`)) return;
        delete working.passive;
      } else {
        working.passive = { name: '', icon: '', description: '' };
      }
      renderForm();
      refreshStatus();
    }
  });
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
    busy = true;
    refreshStatus();
    setState(isNew ? 'Creating character…' : 'Saving…');
    try {
      const url = isNew ? '/api/admin/characters' : `/api/admin/characters/${encodeURIComponent(original.characterId)}`;
      const data = await request(url, { method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(working) });
      const saved = data.character || working;
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
      setState(wasNew ? `Created ${saved.name}. It's in the live roster.` : `Saved ${count} change${count === 1 ? '' : 's'} to ${saved.name}. Live for new matches.`, 'success');
    } catch (error) {
      busy = false;
      refreshStatus();
      setState(error.message || 'The character could not be saved.', 'error');
    }
  }

  async function removeCharacter() {
    if (!original || busy) return;
    const typed = prompt(`Deleting ${original.name} removes them from the live roster for everyone, and can shift saved teams.\n\nType ${original.characterId} to confirm.`);
    if (typed === null) return;
    if (typed.trim() !== original.characterId) { setState('The id didn’t match, so nothing was deleted.', 'error'); return; }
    busy = true;
    try {
      await request(`/api/admin/characters/${encodeURIComponent(original.characterId)}`, { method: 'DELETE' });
      roster = roster.filter(c => c.characterId !== original.characterId);
      const name = original.name;
      original = null; working = null; busy = false;
      const url = new URL(location.href); url.searchParams.delete('character'); history.replaceState(null, '', url);
      renderAll();
      setState(`Deleted ${name}.`, 'success');
    } catch (error) {
      busy = false;
      setState(error.message, 'error');
    }
  }

  // ---------- wiring ----------
  list.addEventListener('click', event => {
    const item = event.target.closest('[data-character-id]');
    if (!item || (working && !isNew && item.dataset.characterId === original.characterId)) return;
    if (confirmLeave()) select(item.dataset.characterId);
  });
  $('roster-search').addEventListener('input', renderList);
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
    renderForm();
    refreshStatus();
    $('raw-state').textContent = 'Applied. Review the Changes tab, then save.';
  });
  $('raw-reset').addEventListener('click', () => { raw.value = JSON.stringify(working, null, 2); raw.dataset.dirty = 'false'; $('raw-state').textContent = ''; });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') { event.preventDefault(); if (!saveButton.disabled) save(); }
  });
  window.addEventListener('beforeunload', event => { if (working && (changes().length || isNew)) { event.preventDefault(); event.returnValue = ''; } });

  (async () => {
    await Promise.all([loadRoster(), loadMissions()]);
    const requested = new URLSearchParams(location.search).get('character');
    if (requested) select(requested);
    else renderAll();
  })();
})();
