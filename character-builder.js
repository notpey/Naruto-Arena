// Character Builder: block-based editing of a character's mechanics for the ACP Character Editor.
// Every form comes from the engine catalog (/api/admin/builder-catalog), so admins can only build
// what battleLogic.js actually reads. The builder edits the editor's working copy in place through
// JSON paths and asks the editor to re-render after structural changes (adding, removing, moving).
(function () {
  'use strict';

  function create(options) {
    const catalog = options.catalog || {};
    const vocab = catalog.vocabulary || {};
    const esc = options.escapeHtml;
    const imageSrc = options.imageSrc || (value => value);
    const getCharacter = options.getCharacter;
    const getRoster = options.getRoster || (() => []);
    const getMissions = options.getMissions || (() => []);
    const onChange = options.onChange || (() => {});
    const onStructure = options.onStructure || (() => {});
    const openKeys = new Set();

    const effectTypes = catalog.effectTypes || {};
    const effectSettings = catalog.effectSettings || {};
    const statusSettings = catalog.statusSettings || {};
    const statusGroups = catalog.statusGroups || [];
    const conditionChecks = catalog.conditionChecks || {};
    const conditionOutcomes = catalog.conditionOutcomes || {};
    const conditionPlaces = catalog.conditionPlaces || {};
    const skillFields = catalog.skillFields || {};
    const passiveFields = catalog.passiveFields || {};
    const questFields = catalog.questFields || {};
    const usage = catalog.usage || {};
    const BASE_SKILL_FIELDS = ['name', 'skillimage', 'skilldescription', 'energy', 'cooldown', 'classes', 'target', 'effects'];
    const BASE_PASSIVE_FIELDS = ['name', 'icon', 'description', 'awakening'];
    const CHAKRA_COUNT_TYPES = ['Taijutsu', 'Bloodline', 'Ninjutsu', 'Genjutsu', 'Random'];

    // ------------------------------------------------------------ paths and values
    const P = path => esc(JSON.stringify(path));
    const keyOf = path => path.join('.');
    const getAt = (object, path) => path.reduce((value, key) => (value == null ? undefined : value[key]), object);
    function setAt(path, value) {
      const parent = getAt(getCharacter(), path.slice(0, -1));
      if (parent && typeof parent === 'object') parent[path[path.length - 1]] = value;
    }
    function deleteAt(path) {
      const parent = getAt(getCharacter(), path.slice(0, -1));
      const last = path[path.length - 1];
      if (Array.isArray(parent)) parent.splice(Number(last), 1);
      else if (parent && typeof parent === 'object') delete parent[last];
    }
    function ensureObject(path) {
      let value = getAt(getCharacter(), path);
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        value = {};
        setAt(path, value);
      }
      return value;
    }
    const slug = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const nameOfCharacter = id => (getRoster().find(entry => entry.characterId === id) || {}).name || id;
    const usedBy = list => (Array.isArray(list) && list.length
      ? `Used by ${list.slice(0, 4).map(nameOfCharacter).join(', ')}${list.length > 4 ? ` and ${list.length - 4} more` : ''}.`
      : 'Not used by any live character yet.');

    // Status names already made by this character, offered as suggestions wherever a status is picked.
    function knownStatusIds() {
      const ids = new Set(catalog.builtInStatusIds || ['invulnerable', 'stunned']);
      JSON.stringify(getCharacter() || {}, (key, value) => {
        if (key === 'statusId' && typeof value === 'string' && value) ids.add(value);
        return value;
      });
      return [...ids].sort();
    }
    function knownCounters() {
      const names = new Set();
      JSON.stringify(getCharacter() || {}, (key, value) => {
        if (['stackMetadataKey', 'onDamageStackMetadataKey', 'onUndamagedTurnStackMetadataKey', 'metadataKey'].includes(key) &&
          typeof value === 'string' && value) names.add(value);
        return value;
      });
      return [...names].sort();
    }
    function uniqueStatusId(base) {
      const taken = new Set(knownStatusIds());
      let id = slug(base) || 'status';
      if (!taken.has(id)) return id;
      let n = 2;
      while (taken.has(`${id}_${n}`)) n += 1;
      return `${id}_${n}`;
    }
    const skills = () => (getCharacter().skills || []);
    const skillLabel = id => {
      const skill = skills().find(entry => entry && entry.id === id);
      return skill ? `${skill.name || id}${skill.hiddenFromSelectionViewer ? ' (alternate)' : ''}` : id;
    };

    // A sensible starting value for a newly added field of this kind.
    function defaultValue(field, context) {
      if (field && field.default !== undefined) return field.default;
      switch (field && field.kind) {
        case 'bool': return true;
        case 'int': case 'number': return Math.max(field.min || 0, 0);
        case 'classes': case 'statusIds': case 'skillIds': case 'characterIds': case 'statusSettingKeys':
        case 'chakraList': case 'effects': case 'statusList': case 'list': case 'skillSlots': case 'tags': return [];
        case 'skillMap': case 'skillCostMap': case 'skillSwapMap': case 'skillTargetMap': case 'classMap':
        case 'counterMap': case 'settingMap': case 'statusSettings': case 'map': return {};
        case 'condition': case 'targetCondition': case 'actorCondition': return {};
        case 'conditionList': return [{}];
        case 'status': return { statusId: uniqueStatusId(`${getCharacter().characterId}_${context || 'status'}`), duration: 1, metadata: {} };
        case 'counterCheck': return { statusId: '', metadataKey: '', value: 1 };
        case 'skillUseCheck': return { skillId: (skills()[0] || {}).id || '', value: 1 };
        case 'object': {
          const value = {};
          Object.entries(field.fields || {}).forEach(([key, sub]) => { if (sub.required) value[key] = defaultValue(sub, context); });
          return value;
        }
        case 'statusId':
          return field.defines ? uniqueStatusId(`${getCharacter().characterId}_${context || 'status'}`) : '';
        case 'scope': return 'target';
        case 'chakraEffectType': return 'random';
        case 'enum': return (field.options && field.options[0] && field.options[0].id) || '';
        default: return '';
      }
    }

    // ------------------------------------------------------------ small pieces
    const help = text => (text ? `<small class="cb-help">${esc(text)}</small>` : '');
    const removeButton = (path, label) => `<button type="button" class="cb-link cb-danger" data-bact="remove" data-bpath="${P(path)}" aria-label="Remove ${esc(label)}">Remove</button>`;
    function select(path, kind, options, current, label, extra = '') {
      const ids = options.map(option => option.id);
      const list = ids.includes(current) || current === undefined || current === '' ? options : [{ id: current, label: `${current} (not recognised)` }, ...options];
      return `<select data-bpath="${P(path)}" data-bkind="${kind}" aria-label="${esc(label)}" ${extra}>${list.map(option =>
        `<option value="${esc(option.id)}"${option.id === (current ?? '') ? ' selected' : ''}>${esc(option.label || option.id)}</option>`).join('')}</select>`;
    }
    function picker(action, path, groups, placeholder, extra = '') {
      const hasOptions = groups.some(group => group.options.length);
      if (!hasOptions) return '';
      return `<select class="cb-picker" data-bact="${action}" data-bpath="${P(path)}" aria-label="${esc(placeholder)}" ${extra}><option value="">${esc(placeholder)}</option>${groups.filter(group => group.options.length).map(group =>
        `${group.label ? `<optgroup label="${esc(group.label)}">` : ''}${group.options.map(option =>
          `<option value="${esc(option.id)}">${esc(option.label)}</option>`).join('')}${group.label ? '</optgroup>' : ''}`).join('')}</select>`;
    }
    const skillOptions = (exclude = []) => skills().filter(skill => skill && skill.id && !exclude.includes(skill.id))
      .map(skill => ({ id: skill.id, label: skillLabel(skill.id) }));
    const classOptions = () => (vocab.SKILL_CLASSES || []).map(entry => ({ id: entry.id, label: entry.id }));

    // ------------------------------------------------------------ value widgets by kind
    function widget(kind, path, value, field = {}, context = '') {
      const label = field.label || path[path.length - 1];
      switch (kind) {
        case 'int': case 'number':
          return `<input type="number" class="cb-num" data-bpath="${P(path)}" data-bkind="${kind}" value="${esc(value ?? '')}" ${field.min !== undefined ? `min="${field.min}"` : ''} ${field.max !== undefined ? `max="${field.max}"` : ''} step="${kind === 'number' ? '0.1' : '1'}" aria-label="${esc(label)}">`;
        case 'bool':
          return `<input type="checkbox" data-bpath="${P(path)}" data-bkind="bool" ${value ? 'checked' : ''} aria-label="${esc(label)}">`;
        case 'longtext':
          return `<textarea rows="2" data-bpath="${P(path)}" data-bkind="text" aria-label="${esc(label)}">${esc(value ?? '')}</textarea>`;
        case 'image':
          return `<span class="cb-image"><span class="cb-thumb" data-art="${P(path)}">${value ? `<img src="${esc(imageSrc(value))}" alt="">` : ''}</span><input type="text" data-bpath="${P(path)}" data-bkind="text" value="${esc(value ?? '')}" placeholder="Image URL or upload" aria-label="${esc(label)}"><button type="button" class="ce-upload" data-upload="${P(path)}" aria-label="Upload ${esc(label)}">Upload</button></span>`;
        case 'statusId':
          return `<input type="text" class="cb-id" list="cb-status-ids" data-bpath="${P(path)}" data-bkind="id" value="${esc(value ?? '')}" placeholder="${field.defines ? 'name_this_status' : 'pick a status'}" aria-label="${esc(label)}">`;
        case 'counterKey':
          return `<input type="text" class="cb-id" list="cb-counters" data-bpath="${P(path)}" data-bkind="counter" value="${esc(value ?? '')}" placeholder="counterName" aria-label="${esc(label)}">`;
        case 'skillId':
          return select(path, 'text', [{ id: '', label: 'Choose a skill' }, ...skillOptions()], value, label);
        case 'characterId':
          return select(path, 'text', [{ id: '', label: 'Choose a character' }, ...getRoster().map(entry => ({ id: entry.characterId, label: entry.name }))], value, label);
        case 'skillTarget':
          return select(path, 'text', vocab.SKILL_TARGETS || [], value, label);
        case 'scope':
          return select(path, 'text', (vocab.EFFECT_SCOPES || []).map(entry => ({ id: entry.id, label: entry.label })), value || 'target', label);
        case 'chakraEffectType':
          return select(path, 'text', vocab.CHAKRA_EFFECT_TYPES || [], value || 'random', label);
        case 'durationAnchor':
          return select(path, 'optional', vocab.DURATION_ANCHORS || [], value || '', label);
        case 'ongoingClass':
          return select(path, 'optional', vocab.ONGOING_CLASSES || [], value || '', label);
        case 'enum':
          return select(path, 'optional', field.options || [], value ?? '', label);
        case 'mission':
          return select(path, 'optional', [{ id: '', label: 'None' }, ...getMissions().map(mission => ({ id: mission.missionId, label: mission.title || mission.missionId }))], value || '', label);
        case 'chakraList': {
          const counts = Object.fromEntries(CHAKRA_COUNT_TYPES.map(type => [type, (Array.isArray(value) ? value : []).filter(entry => entry === type).length]));
          return `<span class="cb-chakra">${CHAKRA_COUNT_TYPES.map(type =>
            `<label><span class="chakra-square ${type.toLowerCase()}" aria-hidden="true"></span><input type="number" min="0" max="9" data-bpath="${P(path)}" data-bkind="chakraCount" data-bchakra="${type}" value="${counts[type]}" aria-label="${esc(type)} chakra"></label>`).join('')}</span>`;
        }
        case 'classes':
          return chips(path, value, entry => entry, picker('add-chip', path, [{ options: classOptions().filter(option => !(value || []).some(entry => String(entry).toLowerCase() === option.id.toLowerCase())) }], 'Add a class'));
        case 'skillIds':
          return chips(path, value, skillLabel, picker('add-chip', path, [{ options: skillOptions(value || []) }], 'Add a skill'));
        case 'characterIds':
          return chips(path, value, nameOfCharacter, picker('add-chip', path, [{ options: getRoster().filter(entry => !(value || []).includes(entry.characterId)).map(entry => ({ id: entry.characterId, label: entry.name })) }], 'Add a character'));
        case 'statusIds':
          return chips(path, value, entry => entry, `<span class="cb-chip-add"><input type="text" class="cb-id" list="cb-status-ids" data-bchipinput="${P(path)}" placeholder="status name" aria-label="Status to add"><button type="button" class="cb-link" data-bact="add-chip-input" data-bpath="${P(path)}">Add</button></span>`);
        case 'statusSettingKeys':
          return chips(path, value, entry => (statusSettings[entry] || {}).label || entry, picker('add-chip', path, [{ options: Object.entries(statusSettings).filter(([key, setting]) => ['int', 'number'].includes(setting.kind) && !(value || []).includes(key)).map(([key, setting]) => ({ id: key, label: setting.label })) }], 'Add a setting'));
        case 'tags':
          return chips(path, value, entry => entry, `<span class="cb-chip-add"><input type="text" data-bchipinput="${P(path)}" placeholder="tag" aria-label="Tag to add"><button type="button" class="cb-link" data-bact="add-chip-input" data-bpath="${P(path)}">Add</button></span>`);
        case 'skillSlots':
          return `<span class="cb-slots">${[0, 1, 2, 3].map(index => `<label><input type="checkbox" data-bpath="${P(path)}" data-bkind="slot" data-bslot="${index}" ${(value || []).includes(index) ? 'checked' : ''}>Skill ${index + 1}</label>`).join('')}</span>`;
        case 'skillMap': case 'classMap': case 'counterMap': case 'settingMap': case 'skillCostMap': case 'skillTargetMap': case 'skillSwapMap': case 'map':
          return mapEditor(kind, path, value || {}, field);
        case 'condition': case 'targetCondition': case 'actorCondition':
          return conditionEditor(path, kind === 'condition' ? 'effect' : kind);
        case 'conditionList':
          return `<div class="cb-list">${(Array.isArray(value) ? value : []).map((part, index) =>
            `<div class="cb-block cb-part"><div class="cb-block-head"><strong>Part ${index + 1}</strong>${removeButton(path.concat(index), `part ${index + 1}`)}</div>${conditionEditor(path.concat(index), 'effect')}</div>`).join('')}<button type="button" class="cb-link" data-bact="add-item" data-bpath="${P(path)}" data-bitem="condition">Add a part</button></div>`;
        case 'counterCheck':
          return `<span class="cb-inline">${widget('statusId', path.concat('statusId'), value && value.statusId, { label: 'Status' })}${widget('counterKey', path.concat('metadataKey'), value && value.metadataKey, { label: 'Counter' })}<span class="cb-muted">at least</span>${widget('int', path.concat('value'), value && value.value, { label: 'Value' })}</span>`;
        case 'skillUseCheck':
          return `<span class="cb-inline">${widget('skillId', path.concat('skillId'), value && value.skillId, { label: 'Skill' })}${widget('int', path.concat('value'), value && value.value, { label: 'Times', min: 0 })}<span class="cb-muted">times</span></span>`;
        case 'effects':
          return effectsEditor(path, { triggered: true });
        case 'status':
          return statusEditor(path, value);
        case 'statusList':
          return `<div class="cb-list">${(Array.isArray(value) ? value : []).map((spec, index) =>
            `<div class="cb-block cb-status-block"><div class="cb-block-head"><strong>Status ${index + 1}</strong>${removeButton(path.concat(index), `status ${index + 1}`)}</div>${statusEditor(path.concat(index), spec)}</div>`).join('')}<button type="button" class="cb-link" data-bact="add-item" data-bpath="${P(path)}" data-bitem="status" data-bcontext="${esc(context)}">Add a status</button></div>`;
        case 'statusSettings':
          return settingsEditor(path, value || {});
        case 'object':
          return objectEditor(path, value || {}, field.fields || {}, context);
        case 'list':
          return `<div class="cb-list">${(Array.isArray(value) ? value : []).map((entry, index) =>
            `<div class="cb-row-block">${objectEditor(path.concat(index), entry || {}, field.item || {}, context)}${removeButton(path.concat(index), `entry ${index + 1}`)}</div>`).join('')}<button type="button" class="cb-link" data-bact="add-item" data-bpath="${P(path)}" data-bitem="object">Add</button></div>`;
        case 'quest':
          return '';
        default:
          return `<input type="text" data-bpath="${P(path)}" data-bkind="text" value="${esc(typeof value === 'string' ? value : value == null ? '' : JSON.stringify(value))}" aria-label="${esc(label)}">`;
      }
    }
    function chips(path, value, labelOf, adder) {
      const list = Array.isArray(value) ? value : [];
      return `<span class="cb-chips">${list.map((entry, index) =>
        `<span class="ce-chip">${esc(labelOf(entry))}<button type="button" data-bact="remove" data-bpath="${P(path.concat(index))}" aria-label="Remove ${esc(labelOf(entry))}">×</button></span>`).join('') || '<span class="cb-muted">None</span>'}${adder}</span>`;
    }
    // Keyed values: { skillId: number }, { class: number }, { fromSkill: toSkill }, ...
    function mapEditor(kind, path, value, field) {
      const keyKind = { skillMap: 'skill', skillCostMap: 'skill', skillTargetMap: 'skill', skillSwapMap: 'skill', classMap: 'class', counterMap: 'counter', settingMap: 'setting', map: field.keys === 'skillId' ? 'skill' : 'text' }[kind];
      const keyLabel = key => (keyKind === 'skill' ? skillLabel(key) : keyKind === 'setting' ? ((statusSettings[key] || {}).label || key) : key);
      const rows = Object.entries(value).map(([key, entry]) => {
        const at = path.concat(key);
        let input;
        if (kind === 'skillSwapMap') input = `<span class="cb-muted">becomes</span>${widget('skillId', at, entry, { label: `${keyLabel(key)} becomes` })}`;
        else if (kind === 'skillTargetMap') input = widget('skillTarget', at, entry, { label: `${keyLabel(key)} target` });
        else if (kind === 'skillCostMap') input = widget('chakraList', at.concat('energy'), entry && entry.energy, { label: `${keyLabel(key)} cost` });
        else if (kind === 'map' && field.values === 'chakraEffectType') input = widget('chakraEffectType', at, entry, { label: keyLabel(key) });
        else input = widget('int', at, entry, { label: keyLabel(key), min: -99 });
        return `<div class="cb-map-row"><span class="cb-map-key">${esc(keyLabel(key))}</span>${input}${removeButton(at, keyLabel(key))}</div>`;
      }).join('');
      let adder = '';
      const taken = Object.keys(value);
      if (keyKind === 'skill') adder = picker('add-key', path, [{ options: skillOptions(taken) }], 'Add a skill', `data-bmap="${kind}"`);
      else if (keyKind === 'class') adder = picker('add-key', path, [{ options: classOptions().filter(option => !taken.includes(option.id.toLowerCase())).map(option => ({ id: option.id.toLowerCase(), label: option.id })) }], 'Add a class', `data-bmap="${kind}"`);
      else if (keyKind === 'setting') adder = picker('add-key', path, [{ options: Object.entries(statusSettings).filter(([key, setting]) => ['int', 'number'].includes(setting.kind) && !taken.includes(key)).map(([key, setting]) => ({ id: key, label: setting.label })) }], 'Add a setting', `data-bmap="${kind}"`);
      else adder = `<span class="cb-chip-add"><input type="text" list="cb-counters" data-bkeyinput="${P(path)}" placeholder="name" aria-label="Name to add"><button type="button" class="cb-link" data-bact="add-key-input" data-bpath="${P(path)}" data-bmap="${kind}">Add</button></span>`;
      return `<div class="cb-map">${rows || '<span class="cb-muted">None yet</span>'}${adder}</div>`;
    }
    function fieldRow(label, control, description, path, removable) {
      // On/off settings read best as one line: the box, then its label.
      if (/^<input type="checkbox"/.test(control)) {
        return `<div class="cb-field cb-field-bool"><div class="cb-field-head"><label class="cb-check">${control}<span class="cb-label">${esc(label)}</span></label>${removable ? removeButton(path, label) : ''}</div>${help(description)}</div>`;
      }
      return `<div class="cb-field"><div class="cb-field-head"><span class="cb-label">${esc(label)}</span>${removable ? removeButton(path, label) : ''}</div>${control}${help(description)}</div>`;
    }
    function objectEditor(path, value, fields, context) {
      return `<div class="cb-fields">${Object.entries(fields).map(([key, field]) =>
        fieldRow(field.label || key, widget(field.kind, path.concat(key), value[key], field, context), field.description, path.concat(key), false)).join('')}</div>`;
    }

    // ------------------------------------------------------------ conditions
    function conditionEditor(path, place) {
      const condition = getAt(getCharacter(), path) || {};
      const allowed = (conditionPlaces[place] || Object.keys(conditionChecks)).concat(place === 'targetCondition' ? ['missingStatusIdsAny'] : []);
      const rows = Object.entries(condition).map(([key, value]) => {
        const check = conditionChecks[key] || conditionOutcomes[key];
        if (!check) return fieldRow(key, `<code>${esc(JSON.stringify(value))}</code>`, 'Not a condition the engine checks.', path.concat(key), true);
        return fieldRow(check.label, widget(check.kind, path.concat(key), value, check, key), check.description, path.concat(key), true);
      }).join('');
      const checkOptions = allowed.filter(key => !(key in condition) && conditionChecks[key]).map(key => ({ id: key, label: conditionChecks[key].label }));
      const outcomeOptions = place === 'effect' ? Object.entries(conditionOutcomes).filter(([key]) => !(key in condition)).map(([key, entry]) => ({ id: key, label: entry.label })) : [];
      return `<div class="cb-condition">${rows || '<p class="cb-muted">No checks yet: this always passes.</p>'}${picker('add-check', path, [{ label: 'Checks', options: checkOptions }, { label: 'When it matches', options: outcomeOptions }], 'Add a check')}</div>`;
    }

    // ------------------------------------------------------------ statuses
    function statusEditor(path, spec) {
      const value = spec || {};
      return `<div class="cb-status">
        <div class="cb-fields cb-fields-row">${fieldRow('Status name', widget('statusId', path.concat('statusId'), value.statusId, { label: 'Status name', defines: true }), '', path.concat('statusId'), false)}${fieldRow('Turns', widget('int', path.concat('duration'), value.duration, { label: 'Turns', min: 1, max: 99 }), '99 lasts all match.', path.concat('duration'), false)}</div>
        ${settingsEditor(path.concat('metadata'), value.metadata || {})}
      </div>`;
    }
    function settingsEditor(path, metadata) {
      const set = Object.keys(metadata);
      const byGroup = statusGroups.map(group => ({
        group,
        keys: set.filter(key => statusSettings[key] && statusSettings[key].group === group.id),
      })).filter(entry => entry.keys.length);
      const effectLevel = set.filter(key => !statusSettings[key] && effectSettings[key] && effectSettings[key].anyEffect);
      const unknown = set.filter(key => !statusSettings[key] && !(effectSettings[key] && effectSettings[key].anyEffect));
      const settingRow = key => {
        const setting = statusSettings[key] || effectSettings[key];
        return fieldRow(setting.label, widget(setting.kind, path.concat(key), metadata[key], setting, key),
          `${setting.description ? `${setting.description} ` : ''}${usage.statusSettings && statusSettings[key] ? usedBy(usage.statusSettings[key]) : ''}`, path.concat(key), true);
      };
      const groupsHtml = byGroup.map(({ group, keys }) => `<div class="cb-group"><h5>${esc(group.label)}</h5>${keys.map(settingRow).join('')}</div>`).join('');
      const extraHtml = effectLevel.length ? `<div class="cb-group"><h5>Who it lands on</h5>${effectLevel.map(settingRow).join('')}</div>` : '';
      const unknownHtml = unknown.length ? `<div class="cb-group"><h5>Not in the catalog</h5>${unknown.map(key =>
        fieldRow(key, `<textarea rows="1" class="cb-json" data-bpath="${P(path.concat(key))}" data-bkind="json" aria-label="${esc(key)}">${esc(JSON.stringify(metadata[key]))}</textarea>`, 'The engine may not read this. Check the Checks tab.', path.concat(key), true)).join('')}</div>` : '';
      const pickerGroups = statusGroups.map(group => ({
        label: group.label,
        options: Object.entries(statusSettings).filter(([key, setting]) => setting.group === group.id && !set.includes(key))
          .map(([key, setting]) => ({ id: key, label: `${setting.label}${setting.advanced ? ' (advanced)' : ''}` })),
      }));
      return `<div class="cb-settings">${groupsHtml}${extraHtml}${unknownHtml}${set.length ? '' : '<p class="cb-muted">No settings yet. A status does nothing until you add some.</p>'}${picker('add-setting', path, pickerGroups, 'Add a status setting')}</div>`;
    }

    // ------------------------------------------------------------ effects
    function effectsEditor(path, { triggered = false } = {}) {
      const list = getAt(getCharacter(), path);
      const effects = Array.isArray(list) ? list : [];
      const blocks = effects.map((effect, index) => effectBlock(path.concat(index), effect, index, effects.length)).join('');
      const groups = {};
      Object.entries(effectTypes).forEach(([type, definition]) => {
        if (triggered && !definition.triggered) return;
        (groups[definition.group] = groups[definition.group] || []).push({ id: type, label: `${definition.label}${definition.advanced ? ' (advanced)' : ''}` });
      });
      const pickerGroups = Object.entries(groups).map(([label, options]) => ({ label, options }));
      return `<div class="cb-effects">${blocks || `<p class="cb-muted">${triggered ? 'No effects yet.' : 'This skill does nothing yet. Add what it does, in order.'}</p>`}${picker('add-effect', path, pickerGroups, triggered ? 'Add an effect' : 'Add what it does', triggered ? 'data-btriggered="1"' : '')}</div>`;
    }
    function effectBlock(path, effect, index, count) {
      const definition = effectTypes[effect && effect.type];
      const openKey = keyOf(path);
      if (!definition) {
        return `<div class="cb-block cb-effect"><div class="cb-block-head"><strong>Unknown effect "${esc(effect && effect.type)}"</strong>${removeButton(path, 'effect')}</div><p class="cb-muted">The engine doesn't know this effect, so it does nothing. Edit it in Raw data or remove it.</p></div>`;
      }
      const fields = definition.fields || {};
      const moves = `${index > 0 ? `<button type="button" class="cb-link" data-bact="move" data-bdir="-1" data-bpath="${P(path)}" aria-label="Move ${esc(definition.label)} up">Up</button>` : ''}${index < count - 1 ? `<button type="button" class="cb-link" data-bact="move" data-bdir="1" data-bpath="${P(path)}" aria-label="Move ${esc(definition.label)} down">Down</button>` : ''}`;
      const recipient = fields.scope ? `<span class="cb-recipient"><span class="cb-muted">on</span>${widget('scope', path.concat('scope'), effect.scope, { label: `${definition.label} lands on` })}</span>` : '';
      const shown = Object.entries(fields).filter(([key, field]) => key !== 'scope' && key !== 'condition' && (!field.optional && !field.advanced || effect[key] !== undefined));
      const hidden = Object.entries(fields).filter(([key, field]) => key !== 'scope' && key !== 'condition' && (field.optional || field.advanced) && effect[key] === undefined);
      const fieldsHtml = shown.map(([key, field]) => fieldRow(field.label, widget(field.kind, path.concat(key), effect[key], field, key), field.description, path.concat(key), Boolean(field.optional || field.advanced))).join('');
      const morePicker = hidden.length ? picker('add-field', path, [{ options: hidden.map(([key, field]) => ({ id: key, label: field.label })) }], 'More options', `data-bfields="effect:${esc(effect.type)}"`) : '';
      const hasCondition = effect.condition && Object.keys(effect.condition).length;
      const conditionHtml = fields.condition
        ? `<details class="cb-sub" data-open-key="${esc(`${openKey}.condition`)}"${hasCondition || openKeys.has(`${openKey}.condition`) ? ' open' : ''}><summary>Only if… ${hasCondition ? `<span class="cb-count">${Object.keys(effect.condition).length}</span>` : '<span class="cb-muted">(always)</span>'}</summary>${conditionEditor(path.concat('condition'), 'effect')}</details>`
        : '';
      let settingsHtml = '';
      if (effect.type === 'apply_status') {
        settingsHtml = `<div class="cb-sub cb-status-settings"><h4>What the status does</h4>${settingsEditor(path.concat('metadata'), effect.metadata || {})}</div>`;
      } else {
        const allowed = (Array.isArray(definition.settings) ? definition.settings : []).concat(Object.keys(effectSettings).filter(key => effectSettings[key].anyEffect));
        const metadata = effect.metadata || {};
        const setKeys = Object.keys(metadata);
        const rows = setKeys.map(key => {
          const setting = effectSettings[key];
          if (!setting) return fieldRow(key, `<textarea rows="1" class="cb-json" data-bpath="${P(path.concat('metadata', key))}" data-bkind="json" aria-label="${esc(key)}">${esc(JSON.stringify(metadata[key]))}</textarea>`, 'Not a setting this effect reads.', path.concat('metadata', key), true);
          return fieldRow(setting.label, widget(setting.kind, path.concat('metadata', key), metadata[key], setting, key), setting.description, path.concat('metadata', key), true);
        }).join('');
        const options = [...new Set(allowed)].filter(key => effectSettings[key] && !setKeys.includes(key)).map(key => ({ id: key, label: `${effectSettings[key].label}${effectSettings[key].advanced ? ' (advanced)' : ''}` }));
        if (rows || options.length) {
          settingsHtml = `<details class="cb-sub" data-open-key="${esc(`${openKey}.settings`)}"${setKeys.length || openKeys.has(`${openKey}.settings`) ? ' open' : ''}><summary>${esc(definition.group)} settings ${setKeys.length ? `<span class="cb-count">${setKeys.length}</span>` : ''}</summary><div class="cb-fields">${rows}</div>${picker('add-setting', path.concat('metadata'), [{ options }], 'Add a setting', 'data-beffect="1"')}</details>`;
        }
      }
      return `<div class="cb-block cb-effect" data-effect-type="${esc(effect.type)}">
        <div class="cb-block-head"><strong>${index + 1}. ${esc(definition.label)}</strong>${recipient}<span class="cb-actions">${moves}${removeButton(path, definition.label)}</span></div>
        ${help(definition.description)}
        ${fieldsHtml ? `<div class="cb-fields cb-fields-row">${fieldsHtml}</div>` : ''}${morePicker}
        ${conditionHtml}${settingsHtml}
      </div>`;
    }
    function newEffect(type, listPath) {
      const definition = effectTypes[type];
      const effect = { type };
      const skillIndex = listPath[0] === 'skills' ? listPath[1] : null;
      const context = skillIndex !== null ? (skills()[skillIndex] || {}).name : 'status';
      Object.entries(definition.fields || {}).forEach(([key, field]) => {
        if (key === 'scope') effect.scope = 'target';
        else if (field.required) effect[key] = key === 'duration' ? 1 : defaultValue(field, context);
      });
      if (type === 'apply_status') effect.metadata = {};
      return effect;
    }

    // ------------------------------------------------------------ skills, passive, quest
    function skillRules(skillIndex) {
      const path = ['skills', skillIndex];
      const skill = skills()[skillIndex] || {};
      const optional = Object.entries(skillFields).filter(([key]) => !BASE_SKILL_FIELDS.includes(key));
      const rows = optional.filter(([key]) => skill[key] !== undefined).map(([key, field]) =>
        fieldRow(field.label, widget(field.kind, path.concat(key), skill[key], field, key), `${field.description || ''} ${usage.skillFields ? usedBy(usage.skillFields[key]) : ''}`.trim(), path.concat(key), true)).join('');
      const options = optional.filter(([key]) => skill[key] === undefined).map(([key, field]) => ({ id: key, label: `${field.label}${field.advanced ? ' (advanced)' : ''}` }));
      return `<div class="cb-fields">${rows || '<p class="cb-muted">No extra rules.</p>'}</div>${picker('add-field', path, [{ options }], 'Add a rule', 'data-bfields="skill"')}`;
    }
    function passiveFeatures() {
      const passive = getCharacter().passive || {};
      const path = ['passive'];
      const features = Object.entries(passiveFields).filter(([key]) => !BASE_PASSIVE_FIELDS.includes(key));
      const groups = {};
      features.forEach(([key, field]) => { (groups[field.group || 'Other'] = groups[field.group || 'Other'] || []).push([key, field]); });
      const rows = features.filter(([key]) => passive[key] !== undefined).map(([key, field]) =>
        fieldRow(field.label, widget(field.kind, path.concat(key), passive[key], field, key), `${field.description || ''} ${usage.passiveFields ? usedBy(usage.passiveFields[key]) : ''}`.trim(), path.concat(key), true)).join('');
      const pickerGroups = Object.entries(groups).map(([label, entries]) => ({ label, options: entries.filter(([key]) => passive[key] === undefined).map(([key, field]) => ({ id: key, label: field.label })) }));
      return `<div class="cb-fields">${rows}</div>${picker('add-field', path, pickerGroups, 'Add a passive feature', 'data-bfields="passive"')}`;
    }
    function questEditor() {
      const passive = getCharacter().passive;
      if (!passive) return '';
      const quest = passive.awakening;
      if (!quest) return `<p class="cb-muted">No quest. A quest is a goal the character completes during a match for a permanent reward.</p><button type="button" class="button secondary" data-bact="add-quest">Add a quest</button>`;
      const path = ['passive', 'awakening'];
      const groups = {};
      Object.entries(questFields).forEach(([key, field]) => { (groups[field.group || 'Quest'] = groups[field.group || 'Quest'] || []).push([key, field]); });
      return `<div class="cb-quest">${fieldRow(questFields.statusId.label, widget('statusId', path.concat('statusId'), quest.statusId, questFields.statusId), questFields.statusId.description, path.concat('statusId'), false)}
        ${Object.entries(groups).filter(([label]) => label !== 'Quest').map(([label, entries]) => `<div class="cb-group"><h5>${esc(label)}</h5>${entries.map(([key, field]) =>
          fieldRow(field.label, widget(field.kind, path.concat(key), quest[key], field, key), field.description, path.concat(key), false)).join('')}</div>`).join('')}
        <button type="button" class="cb-link cb-danger" data-bact="remove-quest">Remove quest</button></div>`;
    }
    function startStatuses() {
      return widget('statusList', ['startStatuses'], getCharacter().startStatuses, { label: 'Starting statuses' }, 'start');
    }
    function datalists() {
      return `<datalist id="cb-status-ids">${knownStatusIds().map(id => `<option value="${esc(id)}"></option>`).join('')}</datalist><datalist id="cb-counters">${knownCounters().map(id => `<option value="${esc(id)}"></option>`).join('')}</datalist>`;
    }

    // ------------------------------------------------------------ events
    // Returns true when the event belonged to the builder.
    function input(target) {
      const raw = target.dataset.bpath;
      if (!raw) return false;
      const path = JSON.parse(raw);
      const kind = target.dataset.bkind;
      let value = target.value;
      switch (kind) {
        case 'int': case 'number':
          if (value === '') { deleteAt(path); onChange(); return true; }
          value = kind === 'int' ? Math.round(Number(value)) : Number(value);
          if (!Number.isFinite(value)) return true;
          break;
        case 'bool':
          value = target.checked;
          if (!value) { deleteAt(path); onChange(); return true; }
          break;
        case 'id':
          value = value.trim();
          break;
        case 'counter':
          value = value.trim().replace(/[^A-Za-z0-9_]/g, '');
          break;
        case 'optional':
          if (!value) { deleteAt(path); onChange(); return true; }
          break;
        case 'chakraCount': {
          const container = target.closest('.cb-chakra');
          const energy = [];
          container.querySelectorAll('[data-bchakra]').forEach(field => {
            const count = Math.max(0, Math.min(9, Math.round(Number(field.value) || 0)));
            for (let i = 0; i < count; i += 1) energy.push(field.dataset.bchakra);
          });
          value = energy;
          break;
        }
        case 'slot': {
          const current = new Set(getAt(getCharacter(), path) || []);
          if (target.checked) current.add(Number(target.dataset.bslot)); else current.delete(Number(target.dataset.bslot));
          value = [...current].sort();
          break;
        }
        case 'json':
          try { value = JSON.parse(value); target.classList.remove('cb-invalid'); } catch (_) { target.classList.add('cb-invalid'); return true; }
          break;
        default:
          break;
      }
      setAt(path, value);
      onChange();
      return true;
    }
    function action(target, value) {
      const act = target.dataset.bact;
      if (!act) return false;
      const path = target.dataset.bpath ? JSON.parse(target.dataset.bpath) : [];
      const character = getCharacter();
      const structural = (openKey) => { if (openKey) openKeys.add(openKey); onStructure(); };
      switch (act) {
        case 'remove':
          deleteAt(path);
          return structural(), true;
        case 'move': {
          const list = getAt(character, path.slice(0, -1));
          const from = Number(path[path.length - 1]);
          const to = from + Number(target.dataset.bdir);
          if (!Array.isArray(list) || to < 0 || to >= list.length) return true;
          [list[from], list[to]] = [list[to], list[from]];
          return structural(), true;
        }
        case 'add-effect': {
          if (!value) return true;
          let list = getAt(character, path);
          if (!Array.isArray(list)) { list = []; setAt(path, list); }
          list.push(newEffect(value, path));
          return structural(), true;
        }
        case 'add-setting': {
          if (!value) return true;
          const object = ensureObject(path);
          const setting = target.dataset.beffect ? effectSettings[value] : (statusSettings[value] || effectSettings[value]);
          object[value] = defaultValue(setting, value);
          return structural(), true;
        }
        case 'add-check': {
          if (!value) return true;
          const object = ensureObject(path);
          const check = conditionChecks[value] || conditionOutcomes[value];
          object[value] = defaultValue(check, value);
          return structural(), true;
        }
        case 'add-field': {
          if (!value) return true;
          const [scope, type] = String(target.dataset.bfields || '').split(':');
          const fields = scope === 'effect' ? (effectTypes[type] || {}).fields || {} : scope === 'skill' ? skillFields : passiveFields;
          const object = ensureObject(path);
          object[value] = defaultValue(fields[value], value);
          return structural(), true;
        }
        case 'add-chip': {
          if (!value) return true;
          let list = getAt(character, path);
          if (!Array.isArray(list)) { list = []; setAt(path, list); }
          if (!list.includes(value)) list.push(value);
          return structural(), true;
        }
        case 'add-chip-input': {
          const field = target.parentElement.querySelector('[data-bchipinput]');
          const text = field && field.value.trim();
          if (!text) return true;
          let list = getAt(character, path);
          if (!Array.isArray(list)) { list = []; setAt(path, list); }
          if (!list.includes(text)) list.push(text);
          return structural(), true;
        }
        case 'add-key': case 'add-key-input': {
          const key = act === 'add-key' ? value : ((target.parentElement.querySelector('[data-bkeyinput]') || {}).value || '').trim();
          if (!key) return true;
          const object = ensureObject(path);
          const kind = target.dataset.bmap;
          if (kind === 'skillSwapMap') object[key] = (skills().find(skill => skill.hiddenFromSelectionViewer && skill.id !== key) || {}).id || '';
          else if (kind === 'skillTargetMap') object[key] = 'single-enemy';
          else if (kind === 'skillCostMap') object[key] = { energy: ['Random'] };
          else if (kind === 'map') object[key] = 'random';
          else object[key] = kind === 'classMap' || kind === 'skillMap' ? 5 : 1;
          return structural(), true;
        }
        case 'add-item': {
          let list = getAt(character, path);
          if (!Array.isArray(list)) { list = []; setAt(path, list); }
          const item = target.dataset.bitem;
          if (item === 'status') list.push(defaultValue({ kind: 'status' }, target.dataset.bcontext || 'status'));
          else if (item === 'condition') list.push({});
          else list.push({});
          return structural(), true;
        }
        case 'add-quest':
          if (!character.passive) return true;
          character.passive.awakening = {
            statusId: uniqueStatusId(`${character.characterId}_${character.passive.name || 'quest'}_awakened`),
            afterOwnerSkillUses: 4,
            progressTooltipTextTemplate: `Quest: ${character.name || 'This character'} uses 4 skills. Progress: {awakeningSkillUses}/4.`,
            completedTooltipText: '',
            metadata: { helpful: true },
          };
          return structural(), true;
        case 'remove-quest':
          if (character.passive && confirm('Remove the quest and its reward?')) delete character.passive.awakening;
          return structural(), true;
        case 'add-skill': {
          const list = character.skills || (character.skills = []);
          const n = list.length + 1;
          let id = `${character.characterId}-skill-${n}`;
          while (list.some(skill => skill.id === id)) id += '-new';
          list.push({ id, name: `Skill ${n}`, skillimage: '', skilldescription: '', energy: ['Random'], target: 'single-enemy', cooldown: 0, classes: ['Instant'], effects: [] });
          return structural(), true;
        }
        case 'remove-skill': {
          const index = Number(target.dataset.bskill);
          const skill = (character.skills || [])[index];
          if (!skill || !confirm(`Remove ${skill.name || 'this skill'}? Its effects go with it.`)) return true;
          character.skills.splice(index, 1);
          return structural(), true;
        }
        case 'move-skill': {
          const index = Number(target.dataset.bskill);
          const to = index + Number(target.dataset.bdir);
          const list = character.skills || [];
          if (to < 0 || to >= list.length) return true;
          [list[index], list[to]] = [list[to], list[index]];
          return structural(), true;
        }
        default:
          return false;
      }
    }

    return {
      effects: (path, opts) => effectsEditor(path, opts),
      skillRules, passiveFeatures, questEditor, startStatuses, datalists,
      input, action, openKeys,
    };
  }

  window.CharacterBlockBuilder = { create };
})();
