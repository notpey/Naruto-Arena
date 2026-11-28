// Character Editor: the Rules tab. Each status the character places (and its passive) is a card;
// each rule on it is one sentence with blanks: WHEN something happens, IF checks pass, THEN do
// things. Edits change the working character directly; the editor saves it as usual.
// Words and lists come from character-rules-vocab.js; the engine side is characterRules.js.
(function () {
  'use strict';
  const V = window.CharacterRulesVocab;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const attr = path => esc(JSON.stringify(path));
  const getAt = (object, path) => path.reduce((value, key) => (value == null ? undefined : value[key]), object);
  const clone = value => JSON.parse(JSON.stringify(value));
  const AFFLICTION = { afflictionDamage: true, skillClasses: ['Affliction'] };

  function mount({ container, getWorking, onChange, statusName }) {
    if (!container || !V) return { render() {} };
    const working = () => getWorking();

    // ------------------------------------------------------------ what can carry rules
    // The passive, and every status a skill places directly.
    function owners() {
      const character = working();
      const out = [];
      if (character.passive && character.passive.name) {
        out.push({ key: 'passive', path: ['passive'], title: character.passive.name, kind: 'Passive', isPassive: true,
          note: 'Its holder is this character, for the whole match.' });
      }
      (character.skills || []).forEach((skill, i) => (skill.effects || []).forEach((effect, j) => {
        if (!effect || effect.type !== 'apply_status' || !effect.statusId) return;
        const where = effect.scope === 'self' ? 'on the user' : effect.scope === 'target' ? 'on the target'
          : effect.scope === 'all-enemy' ? 'on every enemy' : effect.scope === 'all-allies' ? 'on every ally' : `on ${effect.scope || 'the target'}`;
        out.push({ key: `${i}:${j}`, path: ['skills', i, 'effects', j, 'metadata'], title: statusName(effect.statusId),
          kind: `${skill.name || 'Skill'}, ${where}`, statusId: effect.statusId,
          note: `Its holder is whoever it is placed ${where.replace(/^on /, 'on: ')}. Its caster is ${character.name || 'this character'}.` });
      }));
      return out;
    }
    const ownerObject = owner => {
      const character = working();
      if (owner.isPassive) return character.passive;
      const effect = getAt(character, owner.path.slice(0, -1));
      effect.metadata = effect.metadata || {};
      return effect.metadata;
    };
    const rulesOf = owner => (Array.isArray(ownerObject(owner).rules) ? ownerObject(owner).rules : []);

    // Statuses and skills an admin can pick from: everything this character defines.
    function statusChoices() {
      const ids = new Map();
      const walk = value => {
        if (!value || typeof value !== 'object') return;
        if (Array.isArray(value)) { value.forEach(walk); return; }
        if (typeof value.statusId === 'string' && value.statusId && !ids.has(value.statusId)) {
          ids.set(value.statusId, { duration: value.duration, metadata: value.metadata });
        }
        Object.values(value).forEach(walk);
      };
      walk(working());
      ids.set('stunned', ids.get('stunned') || { duration: 1, metadata: { harmful: true, cannotUseSkills: true, tooltipText: 'This character is stunned.' } });
      return ids;
    }
    const skillChoices = () => (working().skills || []).filter(skill => skill && skill.id).map(skill => ({ id: skill.id, name: skill.name || skill.id }));
    const skillName = id => (skillChoices().find(skill => skill.id === id) || {}).name || id;
    const ctx = owner => ({ statusName, skillName, isPassive: owner.isPassive });

    // ------------------------------------------------------------ controls
    const select = (path, value, options, label) => `<select class="sl-select" data-r="${attr(path)}" aria-label="${esc(label)}">${options.map(([id, text]) => `<option value="${esc(id)}"${String(id) === String(value ?? '') ? ' selected' : ''}>${esc(text)}</option>`).join('')}</select>`;
    const number = (path, value, label, opts = {}) => `<input type="number" class="sl-num" data-r="${attr(path)}" data-r-kind="number"${opts.optional ? ' data-r-optional="1"' : ''} value="${esc(value ?? '')}" min="${opts.min ?? 0}" max="${opts.max ?? 999}" aria-label="${esc(label)}"${opts.placeholder ? ` placeholder="${esc(opts.placeholder)}"` : ''}>`;
    const text = (path, value, label, placeholder) => `<input type="text" class="sl-num rr-text" data-r="${attr(path)}" data-r-kind="text" value="${esc(value ?? '')}" aria-label="${esc(label)}" placeholder="${esc(placeholder || '')}">`;
    const check = (path, on, label) => `<label class="sl-check"><input type="checkbox" data-r="${attr(path)}" data-r-kind="bool"${on ? ' checked' : ''}> ${esc(label)}</label>`;
    const multi = (path, values, options) => `<span class="rr-multi">${options.map(([id, label]) => `<label class="sl-check"><input type="checkbox" data-r="${attr(path)}" data-r-kind="multi" value="${esc(id)}"${(values || []).includes(id) ? ' checked' : ''}> ${esc(label)}</label>`).join('')}</span>`;
    const button = (act, path, label, cls = 'text-button') => `<button type="button" class="${cls}" data-r-act="${act}" data-r="${attr(path)}">${esc(label)}</button>`;
    const targets = (event) => V.TARGETS.filter(target => !target.events || target.events.includes(event)).map(target => [target.id, target.label]);
    const statusOptions = (value) => {
      const options = [...statusChoices().keys()].map(id => [id, statusName(id)]);
      if (value && !options.some(([id]) => id === value)) options.unshift([value, statusName(value)]);
      return [['', 'choose a status'], ...options];
    };
    const skillOptions = (value) => [['', 'choose a skill'], ...skillChoices().map(skill => [skill.id, skill.name])]
      .concat(value && !skillChoices().some(skill => skill.id === value) ? [[value, value]] : []);

    // ------------------------------------------------------------ one rule
    function whenPart(rule, base, owner) {
      const when = rule.when || {};
      const event = V.EVENTS.find(entry => entry.id === when.event);
      const pick = select(base.concat('when', 'event'), when.event, [['', 'choose an event'], ...V.EVENTS.map(entry => [entry.id, entry.label])], 'When');
      const fields = (event && event.fields || []).map(field => {
        const path = base.concat('when', field.key);
        const value = when[field.key];
        if (field.kind === 'choice') return `<span class="rr-field">${esc(field.label)} ${select(path, value ?? field.default, field.options.map(o => [o.id, o.label]), field.label)}</span>`;
        if (field.kind === 'number') return `<span class="rr-field">${esc(field.label)} ${number(path, value ?? field.default, field.label, field)}</span>`;
        if (field.kind === 'bool') return check(path, value, field.label);
        if (field.kind === 'multi') return `<span class="rr-field">${esc(field.label)}: ${multi(path, value, field.options.map(o => [o.id, o.label]))}</span>`;
        if (field.kind === 'classes') return `<span class="rr-field">${esc(field.label)}: ${multi(path, value, V.CLASSES.map(c => [c, c]))}</span>`;
        if (field.kind === 'skills') return `<span class="rr-field">${esc(field.label)}: ${multi(path, value, skillChoices().map(s => [s.id, s.name]))}</span>`;
        return '';
      }).join('');
      return `<div class="rr-part"><span class="rr-label is-when">When</span><div class="rr-part-body">${pick}${fields ? `<div class="rr-fields">${fields}</div>` : ''}</div></div>`;
    }
    function checkPart(rule, base, owner) {
      const checks = Array.isArray(rule.if) ? rule.if : [];
      const items = checks.map((item, i) => {
        const path = base.concat('if', i);
        const kind = item.counter !== undefined ? 'counter' : item.lacks !== undefined ? 'lacks' : 'has';
        let body;
        if (kind === 'counter') {
          const bound = item.atMost !== undefined && item.atLeast === undefined ? 'atMost' : 'atLeast';
          body = `${text(path.concat('counter'), item.counter, 'Counter', 'counter name')} is ${select(path.concat('_bound'), bound, [['atLeast', 'at least'], ['atMost', 'at most']], 'Comparison')} ${number(path.concat(bound), item[bound], 'Value', { max: 99 })}`;
        } else {
          body = `${select(path.concat('on'), item.on || 'owner', [['owner', 'the holder'], ['caster', 'the caster']], 'Who')} ${select(path.concat('_kind'), kind, [['has', 'has'], ['lacks', 'does not have']], 'Has or not')} ${select(path.concat(kind), item[kind], statusOptions(item[kind]), 'Status')}`;
        }
        return `<li class="rr-item">${body}${button('remove', path, 'Remove')}</li>`;
      }).join('');
      const add = `<select class="sl-add" data-r-act="add-check" data-r="${attr(base.concat('if'))}" aria-label="Add a check"><option value="">+ Add a check</option>${V.CHECKS.map(c => `<option value="${c.id}">${esc(c.label)}</option>`).join('')}</select>`;
      return `<div class="rr-part"><span class="rr-label is-if">If</span><div class="rr-part-body">${checks.length ? `<ul class="rr-items">${items}</ul>` : '<p class="sl-muted rr-none">Always (no checks).</p>'}${add}</div></div>`;
    }
    function actionBody(action, path, event, owner) {
      const to = select(path.concat('on'), action.on || 'owner', targets(event), 'Who');
      switch (action.type) {
        case 'damage': {
          const counters = V.counterNamesIn(rulesOf(owner)).concat(Object.keys(owner.isPassive ? (ownerObject(owner).counters || {}) : {}));
          const plus = [['', 'no bonus'], ...[...new Set(counters)].map(name => [name, `plus ${V.counterLabel(name)}`])];
          return `Deal ${number(path.concat('amount'), action.amount, 'Damage')} ${select(path.concat('_damageKind'), V.damageKind(action), V.DAMAGE_KINDS.map(k => [k.id, k.label]), 'Damage kind')} ${select(path.concat('_bonus'), action.metadata?.bonusFromStatusMetadataKey || '', plus, 'Bonus')} to ${to}`;
        }
        case 'heal': return `Heal ${to} for ${number(path.concat('amount'), action.amount, 'Healing')}`;
        case 'apply_status': return `Apply ${select(path.concat('statusId'), action.statusId, statusOptions(action.statusId), 'Status')} to ${to} for ${number(path.concat('duration'), action.duration ?? 1, 'Turns', { min: 1, max: 99 })} turns <span class="ce-hint">(99 = permanent)</span>`;
        case 'remove_status': return `Remove ${select(path.concat('statusId'), action.statusId, statusOptions(action.statusId), 'Status')} from ${to}`;
        case 'add_counter': {
          const where = action.statusId ? action.statusId : '';
          const places = [['', 'this status'], ...[...statusChoices().keys()].filter(id => id !== owner.statusId).map(id => [id, statusName(id)])];
          return `Add ${number(path.concat('amount'), action.amount ?? 1, 'Amount', { min: -99, max: 99 })} to ${text(path.concat('counter'), action.counter, 'Counter', 'counter name')} on ${select(path.concat('_counterStatus'), where, places, 'Which status')} at most ${number(path.concat('max'), action.max, 'Most', { optional: true, max: 999, placeholder: 'no limit' })}`;
        }
        case 'gain_chakra': return `${select(path.concat('on'), action.on || 'owner', targets(event), 'Whose team')}'s team gains ${number(path.concat('amount'), action.amount ?? 1, 'Chakra', { min: 1, max: 9 })} ${select(path.concat('chakraType'), action.chakraType || 'random', V.CHAKRA_TYPES.map(t => [t, t]), 'Chakra type')} chakra`;
        case 'clear_cooldown': return `Reset the cooldown of ${select(path.concat('_skill'), (action.skillIds || [])[0] || '', skillOptions((action.skillIds || [])[0]), 'Skill')} for ${to}`;
        case 'grant_skill_use': return `Give ${to} ${number(path.concat('amount'), action.amount ?? 1, 'Uses', { min: 1, max: 9 })} more use of ${select(path.concat('skillId'), action.skillId, skillOptions(action.skillId), 'Skill')}`;
        default: return `<span class="sl-tag">Advanced</span> ${esc(action.type)} (edit in Raw data)`;
      }
    }
    function actionPart(rule, base, owner) {
      const actions = Array.isArray(rule.do) ? rule.do : [];
      const event = rule.when?.event;
      const items = actions.map((action, i) => `<li class="rr-item">${actionBody(action, base.concat('do', i), event, owner)}${button('remove', base.concat('do', i), 'Remove')}</li>`).join('');
      const add = `<select class="sl-add" data-r-act="add-action" data-r="${attr(base.concat('do'))}" aria-label="Add an action"><option value="">+ Add an action</option>${V.ACTIONS.map(a => `<option value="${a.id}">${esc(a.label)}</option>`).join('')}</select>`;
      return `<div class="rr-part"><span class="rr-label is-then">Then</span><div class="rr-part-body">${actions.length ? `<ul class="rr-items">${items}</ul>` : '<p class="sl-muted rr-none">Nothing yet.</p>'}${add}</div></div>`;
    }
    function ruleCard(rule, index, total, owner) {
      const base = [owner.key, index];
      return `<li class="rr-rule" data-rule="${esc(owner.key)}|${index}">
        <div class="rr-rule-head"><span class="sl-index">${index + 1}</span>
          <p class="rr-readback" data-readback="${esc(owner.key)}|${index}">${esc(V.describeRule(rule, ctx(owner)))}</p>
          <span class="rr-rule-tools">${index > 0 ? button('up', base, 'Move up') : ''}${index < total - 1 ? button('down', base, 'Move down') : ''}${button('remove-rule', base, 'Remove rule', 'text-button danger')}</span></div>
        ${whenPart(rule, base, owner)}${checkPart(rule, base, owner)}${actionPart(rule, base, owner)}
      </li>`;
    }

    // ------------------------------------------------------------ counters
    function counterPanel(owner) {
      const object = ownerObject(owner);
      const names = [...new Set(V.counterNamesIn(rulesOf(owner)).concat(Object.keys(owner.isPassive ? object.counters || {} : {})))];
      if (!names.length) return '';
      const start = name => (owner.isPassive ? (object.counters || {})[name] : object[name]) ?? 0;
      return `<div class="rr-counters"><span class="rr-counters-label">Counters</span>${names.map(name => `<label class="rr-counter">${esc(V.counterLabel(name))} starts at ${number([owner.key, '_counter', name], start(name), `${name} start`, { max: 99 })}</label>`).join('')}</div>`;
    }

    function render() {
      const character = working();
      if (!character) { container.innerHTML = ''; return; }
      const list = owners();
      const problems = (window.CharacterRulesVocab && list.flatMap(owner => V.checkRules(rulesOf(owner), ctx(owner)).map(problem => ({ ...problem, owner })))) || [];
      container.innerHTML = `${list.length ? '' : '<p class="ce-muted">This character has no passive and places no statuses, so there is nothing to add rules to yet. Add a status in the Edit tab first.</p>'}
        ${problems.length ? `<div class="ce-warning rr-problems"><strong>${problems.length} thing${problems.length === 1 ? '' : 's'} to fix:</strong><ul>${problems.map(p => `<li>${esc(p.owner.title)}: ${esc(p.message)}</li>`).join('')}</ul></div>` : ''}
        ${list.map(owner => {
          const rules = rulesOf(owner);
          return `<section class="rr-owner" data-owner="${esc(owner.key)}">
            <header class="rr-owner-head"><div><span class="sl-tag">${esc(owner.kind)}</span><h3>${esc(owner.title)}</h3><p class="sl-note">${esc(owner.note)}</p></div>
              <span class="rr-count">${rules.length ? `${rules.length} rule${rules.length === 1 ? '' : 's'}` : 'No rules'}</span></header>
            ${counterPanel(owner)}
            ${rules.length ? `<ol class="rr-rules">${rules.map((rule, i) => ruleCard(rule, i, rules.length, owner)).join('')}</ol>` : ''}
            ${button('add-rule', [owner.key], '+ Add a rule', 'button secondary rr-add-rule')}
          </section>`;
        }).join('')}`;
    }

    // ------------------------------------------------------------ editing
    const ownerByKey = key => owners().find(owner => owner.key === key);
    // A control's path is [ownerKey, ruleIndex, ...inside the rule].
    function locate(path) {
      const owner = ownerByKey(path[0]);
      if (!owner) return null;
      const object = ownerObject(owner);
      if (!Array.isArray(object.rules)) object.rules = [];
      return { owner, object, rules: object.rules, rest: path.slice(1) };
    }
    const parentOf = (root, rest) => ({ parent: getAt(root, rest.slice(0, -1)), key: rest[rest.length - 1] });
    function changed(structural) {
      onChange();
      if (structural) render();
      else refreshReadbacks();
    }
    function refreshReadbacks() {
      container.querySelectorAll('[data-readback]').forEach(node => {
        const [key, index] = node.dataset.readback.split('|');
        const owner = ownerByKey(key);
        const rule = owner && rulesOf(owner)[Number(index)];
        if (rule) node.textContent = V.describeRule(rule, ctx(owner));
      });
    }

    function applyControl(target) {
      const path = JSON.parse(target.dataset.r);
      const found = locate(path);
      if (!found) return;
      const { owner, object, rules, rest } = found;
      // Counter start values sit outside the rules.
      if (rest[0] === '_counter') {
        const value = Math.max(0, Math.round(Number(target.value) || 0));
        if (owner.isPassive) object.counters = { ...(object.counters || {}), [rest[1]]: value };
        else object[rest[1]] = value;
        return changed(false);
      }
      const { parent, key } = parentOf(rules, rest);
      if (!parent) return;
      const kind = target.dataset.rKind;
      let structural = target.tagName === 'SELECT';
      if (key === 'event') {
        const event = V.EVENTS.find(entry => entry.id === target.value);
        parent.event = target.value;
        Object.keys(parent).forEach(k => { if (k !== 'event') delete parent[k]; });
        (event?.fields || []).forEach(field => { if (field.default !== undefined) parent[field.key] = field.default; });
        // An action on "the attacker" makes no sense once the event has none.
        const rule = rules[rest[0]];
        (rule.do || []).forEach(action => { if (action.on === 'attacker' && target.value !== 'enemySkillOnOwner') action.on = 'owner'; });
      } else if (key === '_kind') { // has / does not have
        const status = parent.has ?? parent.lacks ?? '';
        delete parent.has; delete parent.lacks;
        parent[target.value] = status;
      } else if (key === '_bound') { // at least / at most
        const value = parent.atLeast ?? parent.atMost ?? 1;
        delete parent.atLeast; delete parent.atMost;
        parent[target.value] = value;
      } else if (key === '_damageKind') {
        const metadata = { ...(parent.metadata || {}) };
        delete metadata.afflictionDamage; delete metadata.ignoreDamageReduction;
        if (Array.isArray(metadata.skillClasses)) metadata.skillClasses = metadata.skillClasses.filter(c => String(c).toLowerCase() !== 'affliction');
        if (!metadata.skillClasses?.length) delete metadata.skillClasses;
        if (target.value === 'affliction') Object.assign(metadata, AFFLICTION);
        if (target.value === 'piercing') metadata.ignoreDamageReduction = true;
        parent.metadata = metadata;
      } else if (key === '_bonus') {
        parent.metadata = { ...(parent.metadata || {}) };
        if (target.value) parent.metadata.bonusFromStatusMetadataKey = target.value; else delete parent.metadata.bonusFromStatusMetadataKey;
      } else if (key === '_counterStatus') {
        if (target.value) {
          parent.statusId = target.value;
          parent.on = parent.on || 'owner';
          // First use creates the counter's status on the holder if it isn't there yet.
          parent.create = { duration: 99, metadata: { helpful: true, permanent: true } };
        } else { delete parent.statusId; delete parent.create; }
      } else if (key === '_skill') {
        parent.skillIds = target.value ? [target.value] : [];
      } else if (key === 'statusId' && parent.type === 'apply_status') {
        // A status placed by a rule uses the settings of that status as this character defines it.
        const spec = statusChoices().get(target.value);
        parent.statusId = target.value;
        parent.metadata = clone(spec?.metadata || {});
        if (spec?.duration && !parent.duration) parent.duration = spec.duration;
      } else if (kind === 'multi') {
        const values = new Set(Array.isArray(parent[key]) ? parent[key] : []);
        if (target.checked) values.add(target.value); else values.delete(target.value);
        if (values.size) parent[key] = [...values]; else delete parent[key];
        structural = false;
      } else if (kind === 'bool') {
        if (target.checked) parent[key] = true; else delete parent[key];
        structural = false;
      } else if (kind === 'number') {
        if (target.value === '' && target.dataset.rOptional) delete parent[key];
        else parent[key] = Math.round(Number(target.value) || 0);
        structural = false;
      } else {
        parent[key] = target.value;
        structural = structural || false;
      }
      changed(structural);
    }

    function act(control) {
      const path = JSON.parse(control.dataset.r);
      const found = locate(path);
      if (!found) return;
      const { rules, rest } = found;
      switch (control.dataset.rAct) {
        case 'add-rule':
          rules.push({ when: { event: 'turnEnds', whose: 'owner' }, do: [] });
          break;
        case 'remove-rule':
          rules.splice(rest[0], 1);
          break;
        case 'up': case 'down': {
          const from = rest[0];
          const to = control.dataset.rAct === 'up' ? from - 1 : from + 1;
          [rules[from], rules[to]] = [rules[to], rules[from]];
          break;
        }
        case 'remove': {
          const { parent, key } = parentOf(rules, rest);
          if (Array.isArray(parent)) parent.splice(key, 1);
          const holder = getAt(rules, rest.slice(0, -2));
          if (holder && Array.isArray(holder.if) && !holder.if.length) delete holder.if;
          break;
        }
        case 'add-check': {
          if (!control.value) return;
          const list = getAt(rules, rest.slice(0, -1));
          list.if = list.if || [];
          list.if.push(control.value === 'counter' ? { counter: '', atLeast: 1 } : { [control.value]: '', on: 'owner' });
          break;
        }
        case 'add-action': {
          if (!control.value) return;
          const rule = getAt(rules, rest.slice(0, -1));
          rule.do = rule.do || [];
          const fresh = { type: control.value, on: 'owner' };
          if (['damage', 'heal'].includes(control.value)) fresh.amount = 10;
          if (control.value === 'add_counter') { fresh.counter = 'charges'; fresh.amount = 1; delete fresh.on; }
          if (control.value === 'gain_chakra') { fresh.amount = 1; fresh.chakraType = 'random'; }
          if (control.value === 'apply_status') fresh.duration = 1;
          if (control.value === 'clear_cooldown') fresh.skillIds = [];
          if (control.value === 'grant_skill_use') fresh.amount = 1;
          rule.do.push(fresh);
          break;
        }
        default: return;
      }
      changed(true);
    }

    container.addEventListener('change', event => {
      const target = event.target;
      if (target.matches('[data-r-act]')) { act(target); return; }
      if (target.matches('[data-r]')) applyControl(target);
    });
    container.addEventListener('input', event => {
      const target = event.target;
      if (target.matches('input[data-r][data-r-kind="number"], input[data-r][data-r-kind="text"]')) applyControl(target);
    });
    container.addEventListener('click', event => {
      const control = event.target.closest('button[data-r-act]');
      if (control) act(control);
    });
    return { render };
  }

  window.CharacterRulesEditor = { mount };
})();
