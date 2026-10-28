(function () {
  'use strict';

  const storageKey = 'naruto-arena-character-tracker-v1';
  const rosterImportedKey = 'naruto-arena-character-tracker-roster-imported-v1';
  const arcCorrectionKey = 'naruto-arena-character-tracker-arc-correction-v1';
  const arcs = [
    'Prologue', 'Land of Waves', 'Chūnin Exams', 'Konoha Crush', 'Search for Tsunade',
    'Sasuke Retrieval', 'Kazekage Rescue', 'Tenchi Bridge', 'Akatsuki Suppression',
    'Itachi Pursuit', 'Pain’s Assault', 'Five Kage Summit', 'Fourth Shinobi War', 'Other'
  ];
  const priorities = { high: 'High', medium: 'Medium', low: 'Low' };
  const statuses = { 'not-started': 'Not started', 'kit-made': 'Kit made', coded: 'Coded' };
  const arcOverrides = { 'yamanaka-ino': 'Chūnin Exams', 'hyuuga-hinata': 'Chūnin Exams', 'aburame-shino': 'Chūnin Exams' };
  const arcLabels = Object.fromEntries(arcs.map(arc => [arc, arc]));
  const seedNames = [
    'Shikamaru Nara', 'Ino Yamanaka', 'Chōji Akimichi', 'Hinata Hyūga', 'Kiba Inuzuka',
    'Shino Aburame', 'Rock Lee', 'Neji Hyūga', 'Tenten', 'Gaara', 'Kankurō', 'Temari',
    'Kabuto Yakushi', 'Dosu Kinuta', 'Zaku Abumi', 'Kin Tsuchi', 'Yoroi Akadō',
    'Misumi Tsurugi', 'Shigure', 'Oboro', 'Anko Mitarashi'
  ];
  const kitMade = new Set(['Hinata Hyūga', 'Kiba Inuzuka', 'Neji Hyūga', 'Gaara', 'Shigure', 'Oboro']);
  const seed = seedNames.map((name, index) => ({
    id: `seed-${index + 1}`, name, arc: 'Chūnin Exams', priority: 'high',
    status: name === 'Ino Yamanaka' ? 'coded' : kitMade.has(name) ? 'kit-made' : 'not-started', notes: ''
  }));
  const groups = document.getElementById('tracker-groups');
  const search = document.getElementById('tracker-search');
  const arcFilter = document.getElementById('tracker-arc-filter');
  const statusFilter = document.getElementById('tracker-status-filter');
  const addForm = document.getElementById('tracker-add');
  const message = document.getElementById('tracker-message');
  const importInput = document.getElementById('tracker-import');
  let rows = load();

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }
  function validRow(row) {
    return row && typeof row.id === 'string' && row.id.length <= 100 &&
      typeof row.name === 'string' && row.name.trim().length > 0 && row.name.length <= 80 &&
      arcs.includes(row.arc) && Object.hasOwn(priorities, row.priority) &&
      Object.hasOwn(statuses, row.status) && typeof row.notes === 'string' && row.notes.length <= 2000;
  }
  function load() {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return seed;
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) && parsed.every(validRow) ? parsed : seed;
    } catch (_) { return seed; }
  }
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(rows)); message.textContent = 'Saved in this browser.'; }
    catch (_) { message.textContent = 'Could not save here. Export JSON to keep your changes.'; }
  }
  function nameKey(name) {
    return String(name).toLocaleLowerCase().replace(/ō/g, 'ou').replace(/ū/g, 'uu')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .split(/[^a-z0-9]+/).filter(Boolean).sort().join(' ');
  }
  async function addCurrentRoster() {
    try {
      const response = await fetch('/api/characters', { credentials: 'same-origin' });
      if (!response.ok) throw new Error('Roster unavailable');
      const data = await response.json();
      if (!Array.isArray(data.characters)) throw new Error('Roster unavailable');
      let added = 0;
      let updated = 0;
      data.characters.filter(character => character && character.hidden !== true).forEach(character => {
        const id = character.characterId || character.id;
        const name = String(character.name || '').trim();
        if (!id || !name) return;
        const arc = arcOverrides[id] || window.NarutoRosterCatalog?.getArc(character)?.label || 'Other';
        const existing = rows.find(row => row.rosterId === id || nameKey(row.name) === nameKey(name));
        if (existing) {
          if (existing.rosterId !== id) { existing.rosterId = id; updated++; }
          if (existing.id.startsWith('seed-') && (existing.arc !== arc || existing.status !== 'coded')) {
            existing.arc = arc;
            existing.status = 'coded';
            updated++;
          }
        } else {
          rows.push({ id: `roster-${id}`, rosterId: id, name, arc, priority: 'medium', status: 'coded', notes: '' });
          added++;
        }
      });
      if (added || updated) { save(); render(); }
      try { localStorage.setItem(rosterImportedKey, '1'); } catch (_) { /* Storage may be unavailable. */ }
    } catch (_) {
      // Keep the supplied spreadsheet entries visible if the roster cannot load.
    }
  }
  function options(values, selected) {
    return Object.entries(values).map(([value, label]) => `<option value="${escapeHtml(value)}"${value === selected ? ' selected' : ''}>${escapeHtml(label)}</option>`).join('');
  }
  function renderRow(row) {
    const label = escapeHtml(row.name);
    return `<tr data-tracker-id="${escapeHtml(row.id)}">
      <th scope="row">${label}</th>
      <td><select class="tracker-arc" data-field="arc" aria-label="${label} story arc">${options(arcLabels, row.arc)}</select></td>
      <td><select class="tracker-priority" data-field="priority" aria-label="${label} priority">${options(priorities, row.priority)}</select></td>
      <td><select class="tracker-status ${escapeHtml(row.status)}" data-field="status" aria-label="${label} status">${options(statuses, row.status)}</select></td>
      <td><input data-field="notes" maxlength="2000" value="${escapeHtml(row.notes)}" aria-label="${label} notes" placeholder="Add a note"></td>
      <td><button type="button" class="text-button danger" data-remove aria-label="Remove ${label} from tracker">Remove</button></td>
    </tr>`;
  }
  function render() {
    const query = search.value.trim().toLocaleLowerCase();
    const visible = rows.filter(row => (!arcFilter.value || row.arc === arcFilter.value) &&
      (!statusFilter.value || row.status === statusFilter.value) &&
      (!query || `${row.name} ${row.notes}`.toLocaleLowerCase().includes(query)));
    const coded = rows.filter(row => row.status === 'coded').length;
    const kits = rows.filter(row => row.status === 'kit-made').length;
    document.getElementById('tracker-summary').textContent = `${rows.length} planned · ${kits} kits made · ${coded} coded${visible.length !== rows.length ? ` · ${visible.length} shown` : ''}`;
    groups.innerHTML = visible.length ? arcs.filter(arc => visible.some(row => row.arc === arc)).map(arc => {
      const arcRows = visible.filter(row => row.arc === arc);
      return `<section class="tracker-group"><h3>${escapeHtml(arc)} <span>${arcRows.length}</span></h3><div class="tracker-table-wrap"><table><thead><tr><th scope="col">Character name</th><th scope="col">Story arc</th><th scope="col">Priority</th><th scope="col">Status</th><th scope="col">Notes</th><th scope="col">Actions</th></tr></thead><tbody>${arcRows.map(renderRow).join('')}</tbody></table></div></section>`;
    }).join('') : '<p class="tracker-empty">No characters match these filters.</p>';
  }

  const arcOptions = arcs.map(arc => `<option value="${escapeHtml(arc)}">${escapeHtml(arc)}</option>`).join('');
  arcFilter.insertAdjacentHTML('beforeend', arcOptions);
  addForm.elements.arc.innerHTML = arcOptions;
  addForm.elements.arc.value = 'Chūnin Exams';
  [search, arcFilter, statusFilter].forEach(control => control.addEventListener('input', render));
  groups.addEventListener('input', event => {
    const field = event.target.dataset.field;
    if (field !== 'notes') return;
    const row = rows.find(item => item.id === event.target.closest('tr')?.dataset.trackerId);
    if (row) { row.notes = event.target.value; save(); }
  });
  groups.addEventListener('change', event => {
    const field = event.target.dataset.field;
    if (!['arc', 'priority', 'status'].includes(field)) return;
    const row = rows.find(item => item.id === event.target.closest('tr')?.dataset.trackerId);
    const validValues = field === 'arc' ? arcLabels : field === 'priority' ? priorities : statuses;
    if (row && Object.hasOwn(validValues, event.target.value)) {
      row[field] = event.target.value; save(); render();
    }
  });
  groups.addEventListener('click', event => {
    const button = event.target.closest('[data-remove]');
    if (!button) return;
    const row = rows.find(item => item.id === button.closest('tr')?.dataset.trackerId);
    if (row && confirm(`Remove ${row.name} from the tracker?`)) {
      rows = rows.filter(item => item.id !== row.id); save(); render();
    }
  });
  addForm.addEventListener('submit', event => {
    event.preventDefault();
    const name = addForm.elements.name.value.trim();
    if (!name) return;
    if (rows.some(row => row.name.toLocaleLowerCase() === name.toLocaleLowerCase() && row.arc === addForm.elements.arc.value)) {
      message.textContent = `${name} is already listed in that arc.`; return;
    }
    rows.push({ id: crypto.randomUUID(), name, arc: addForm.elements.arc.value, priority: addForm.elements.priority.value, status: 'not-started', notes: '' });
    save();
    arcFilter.value = addForm.elements.arc.value; statusFilter.value = ''; search.value = '';
    addForm.elements.name.value = '';
    render();
  });
  document.getElementById('tracker-export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ version: 1, characters: rows }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'naruto-character-tracker.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  document.getElementById('tracker-import-button').addEventListener('click', () => importInput.click());
  importInput.addEventListener('change', async () => {
    const file = importInput.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (data.version !== 1 || !Array.isArray(data.characters) || data.characters.length > 2000 ||
        !data.characters.every(validRow) || new Set(data.characters.map(row => row.id)).size !== data.characters.length) {
        throw new Error('Choose a valid tracker export.');
      }
      if (!confirm(`Replace this browser’s tracker with ${data.characters.length} imported characters?`)) return;
      rows = data.characters; save(); render();
    } catch (error) { message.textContent = error.message || 'Could not import this file.'; }
    finally { importInput.value = ''; }
  });
  try {
    if (localStorage.getItem(arcCorrectionKey) !== '1') {
      let corrected = false;
      rows.forEach(row => {
        if (row.id.startsWith('seed-') && arcOverrides[row.rosterId] && row.arc === 'Prologue') {
          row.arc = arcOverrides[row.rosterId];
          corrected = true;
        }
      });
      if (corrected) save();
      localStorage.setItem(arcCorrectionKey, '1');
    }
  } catch (_) { /* Keep the tracker usable when storage is unavailable. */ }
  render();
  try { if (localStorage.getItem(rosterImportedKey) !== '1') addCurrentRoster(); }
  catch (_) { addCurrentRoster(); }
})();
