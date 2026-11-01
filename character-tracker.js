(function () {
  'use strict';

  const storageKey = 'naruto-arena-character-tracker-v1';
  const removedRosterKey = 'naruto-arena-character-tracker-removed-roster-v1';
  const arcCorrectionKey = 'naruto-arena-character-tracker-arc-correction-v1';
  const arcs = [
    'Prologue', 'Land of Waves', 'Chūnin Exams', 'Konoha Crush', 'Search for Tsunade',
    'Sasuke Retrieval', 'Kazekage Rescue', 'Tenchi Bridge', 'Akatsuki Suppression',
    'Itachi Pursuit', 'Pain’s Assault', 'Five Kage Summit', 'Fourth Shinobi War', 'Other'
  ];
  const priorities = { high: 'High', medium: 'Medium', low: 'Low' };
  const statuses = { 'not-started': 'Not started', 'kit-made': 'Kit made', coded: 'Coded' };
  const unlocks = { undecided: 'Undecided', starter: 'Starter', mission: 'Needs mission' };
  const arcOverrides = { 'yamanaka-ino': 'Chūnin Exams', 'hyuuga-hinata': 'Chūnin Exams', 'aburame-shino': 'Chūnin Exams' };
  const arcLabels = Object.fromEntries(arcs.map(arc => [arc, arc]));
  const seedNames = [
    'Shikamaru Nara', 'Ino Yamanaka', 'Chōji Akimichi', 'Hinata Hyūga', 'Kiba Inuzuka',
    'Shino Aburame', 'Rock Lee', 'Neji Hyūga', 'Tenten', 'Gaara', 'Kankurō', 'Temari',
    'Kabuto Yakushi', 'Dosu Kinuta', 'Zaku Abumi', 'Kin Tsuchi', 'Yoroi Akadō',
    'Misumi Tsurugi', 'Shigure', 'Oboro', 'Anko Mitarashi'
  ];
  const kitMade = new Set(['Hinata Hyūga', 'Kiba Inuzuka', 'Neji Hyūga', 'Gaara', 'Shigure', 'Oboro']);
  const blankUnlock = { unlock: 'undecided', missionName: '', missionRank: '', missionRequirements: '' };
  const seed = seedNames.map((name, index) => ({
    id: `seed-${index + 1}`, name, arc: 'Chūnin Exams', priority: 'high',
    status: name === 'Ino Yamanaka' ? 'coded' : kitMade.has(name) ? 'kit-made' : 'not-started', notes: '',
    ...blankUnlock
  }));
  const groups = document.getElementById('tracker-groups');
  const search = document.getElementById('tracker-search');
  const arcFilter = document.getElementById('tracker-arc-filter');
  const statusFilter = document.getElementById('tracker-status-filter');
  const unlockFilter = document.getElementById('tracker-unlock-filter');
  const addForm = document.getElementById('tracker-add');
  const message = document.getElementById('tracker-message');
  const importInput = document.getElementById('tracker-import');
  const rankList = document.getElementById('tracker-rank-options');
  // Unlock details for characters already in the game, read from the server's catalogs.
  const live = { byId: new Map(), loaded: false, rankTiers: [] };
  let rows = load();

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }
  function optionalText(value, max) {
    return value === undefined || (typeof value === 'string' && value.length <= max);
  }
  function validRow(row) {
    return row && typeof row.id === 'string' && row.id.length <= 100 &&
      typeof row.name === 'string' && row.name.trim().length > 0 && row.name.length <= 80 &&
      arcs.includes(row.arc) && Object.hasOwn(priorities, row.priority) &&
      Object.hasOwn(statuses, row.status) && typeof row.notes === 'string' && row.notes.length <= 2000 &&
      (row.unlock === undefined || Object.hasOwn(unlocks, row.unlock)) &&
      optionalText(row.missionName, 120) && optionalText(row.missionRank, 80) &&
      optionalText(row.missionRequirements, 2000);
  }
  function withUnlockFields(row) {
    return { ...blankUnlock, ...row };
  }
  function trackerArc(arc) {
    return arcs.includes(arc) ? arc : 'Other';
  }
  function load() {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return seed;
      const parsed = JSON.parse(stored);
      // Roster sync once stored catalog arcs (e.g. Frieren) that this list lacks; keep those rows as Other.
      const repaired = Array.isArray(parsed)
        ? parsed.map(row => row && typeof row === 'object' ? { ...row, arc: trackerArc(row.arc) } : row) : null;
      return repaired && repaired.every(validRow) ? repaired.map(withUnlockFields) : seed;
    } catch (_) { return seed; }
  }
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(rows)); message.textContent = 'Saved in this browser.'; }
    catch (_) { message.textContent = 'Could not save here. Export JSON to keep your changes.'; }
  }
  function loadRemovedRosterIds() {
    try { return new Set(JSON.parse(localStorage.getItem(removedRosterKey) || '[]')); }
    catch (_) { return new Set(); }
  }
  function rememberRemovedRosterId(id) {
    try {
      const removed = loadRemovedRosterIds();
      removed.add(id);
      localStorage.setItem(removedRosterKey, JSON.stringify([...removed]));
    } catch (_) { /* Storage may be unavailable. */ }
  }
  function nameKey(name) {
    return String(name).toLocaleLowerCase().replace(/ō/g, 'ou').replace(/ū/g, 'uu')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .split(/[^a-z0-9]+/).filter(Boolean).sort().join(' ');
  }
  async function getJson(url) {
    try {
      const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store' });
      return response.ok ? await response.json() : null;
    } catch (_) { return null; }
  }
  function rankForLevel(level) {
    const tier = live.rankTiers.find(entry => level >= entry.minLevel && level <= entry.maxLevel);
    return `Level ${level}+${tier ? ` · ${tier.rank}` : ''}`;
  }
  function formatGoal(goal, names) {
    const name = id => names.get(id) || id;
    const group = ids => goal.character_name || goal.group_label || (ids || []).map(name).join(' or ');
    const wins = Number(goal.wins) || 0;
    switch (goal.type) {
      case 'win_matches': return `Win ${wins} battles with ${name(goal.character_id)}.`;
      case 'win_matches_any': return `Win ${wins} battles with ${group(goal.character_ids)}.`;
      case 'win_matches_same_team': return `Win ${wins} battles with ${(goal.character_ids || []).map(name).join(' and ')} on the same team.`;
      case 'win_streak': return `Win ${wins} battles in a row with ${name(goal.character_id)}.`;
      case 'win_streak_any': return `Win ${wins} battles in a row with ${group(goal.character_ids)}.`;
      case 'use_skill': return `Use ${goal.character_id ? `${name(goal.character_id)}'s ` : ''}"${goal.skill_name || goal.skill_id}" ${wins} times.`;
      case 'reach_rank': return `Reach rank ${goal.rank}.`;
      default: return goal.text || 'Custom goal.';
    }
  }
  async function loadLiveUnlocks() {
    const [roster, missionData, ladder, access] = await Promise.all([
      getJson('/api/characters'), getJson('/api/missions'),
      getJson('/api/admin/ladder-rules'), getJson('/api/admin/character-access'),
    ]);
    if (!Array.isArray(roster?.characters)) return;
    live.rankTiers = Array.isArray(ladder?.ladderRules?.rankTiers) ? ladder.ladderRules.rankTiers : [];
    rankList.innerHTML = live.rankTiers.map(tier =>
      `<option value="${escapeHtml(`${tier.rank} (Level ${tier.minLevel}+)`)}"></option>`).join('');
    const playable = roster.characters.filter(character => character && character.hidden !== true);
    const names = new Map(playable.map(character => [character.characterId || character.id, character.name]));
    const missions = Array.isArray(missionData?.missions) ? missionData.missions : [];
    const policies = access?.policies || {};
    playable.forEach(character => {
      const id = character.characterId || character.id;
      const mission = missions.find(entry => entry?.reward_character === id);
      const policy = policies[id]?.player;
      live.byId.set(id, {
        mission: mission ? {
          title: mission.title || mission.missionId,
          level: rankForLevel(Math.max(1, Number(mission.level_requirement) || 1)),
          goals: (Array.isArray(mission.goals) ? mission.goals : []).map(goal => formatGoal(goal || {}, names)),
        } : null,
        access: policy?.visibility === 'hidden' ? 'Hidden from players'
          : policy?.unlock === 'allow' ? 'Unlocked for all players' : '',
      });
    });
    live.loaded = true;
    syncRoster(playable);
  }
  function syncRoster(playable) {
    const removed = loadRemovedRosterIds();
    let changed = false;
    playable.forEach(character => {
      const id = character.characterId || character.id;
      const name = String(character.name || '').trim();
      if (!id || !name) return;
      const arc = trackerArc(arcOverrides[id] || window.NarutoRosterCatalog?.getArc(character)?.label);
      const existing = rows.find(row => row.rosterId === id || nameKey(row.name) === nameKey(name));
      if (existing) {
        if (existing.rosterId !== id) { existing.rosterId = id; changed = true; }
        if (existing.status !== 'coded') { existing.status = 'coded'; changed = true; }
        if (existing.id.startsWith('seed-') && existing.arc !== arc) { existing.arc = arc; changed = true; }
      } else if (!removed.has(id)) {
        rows.push({ id: `roster-${id}`, rosterId: id, name, arc, priority: 'medium', status: 'coded', notes: '', ...blankUnlock });
        changed = true;
      }
    });
    if (changed) save();
    render();
  }
  function liveUnlock(row) {
    return row.rosterId ? live.byId.get(row.rosterId) : null;
  }
  function effectiveUnlock(row) {
    const info = liveUnlock(row);
    if (info) return info.mission ? 'mission' : 'starter';
    return row.unlock;
  }
  function options(values, selected) {
    return Object.entries(values).map(([value, label]) => `<option value="${escapeHtml(value)}"${value === selected ? ' selected' : ''}>${escapeHtml(label)}</option>`).join('');
  }
  function renderLiveUnlock(info) {
    const access = info.access ? `<span class="tracker-access">${escapeHtml(info.access)}</span>` : '';
    if (!info.mission) {
      return `<div class="tracker-unlock-live"><span class="tracker-badge starter">Starter</span>${access}<small>From game data</small></div>`;
    }
    const goals = info.mission.goals.map(goal => `<li>${escapeHtml(goal)}</li>`).join('');
    return `<div class="tracker-unlock-live"><span class="tracker-badge mission">Mission</span>${access}
      <strong>${escapeHtml(info.mission.title)}</strong><span class="tracker-rank">${escapeHtml(info.mission.level)}</span>
      ${goals ? `<ul>${goals}</ul>` : ''}<small>From game data</small></div>`;
  }
  function renderPlannedUnlock(row, label) {
    const missionFields = row.unlock === 'mission' ? `
      <input data-field="missionName" maxlength="120" value="${escapeHtml(row.missionName)}" aria-label="${label} mission name" placeholder="Mission name">
      <input data-field="missionRank" maxlength="80" list="tracker-rank-options" value="${escapeHtml(row.missionRank)}" aria-label="${label} mission rank" placeholder="Unlock rank or level">
      <textarea data-field="missionRequirements" maxlength="2000" rows="2" aria-label="${label} mission requirements" placeholder="Requirements, e.g. Win 4 battles with Haku">${escapeHtml(row.missionRequirements)}</textarea>` : '';
    return `<div class="tracker-unlock-plan"><select class="tracker-unlock ${escapeHtml(row.unlock)}" data-field="unlock" aria-label="${label} unlock">${options(unlocks, row.unlock)}</select>${missionFields}</div>`;
  }
  function renderRow(row) {
    const label = escapeHtml(row.name);
    const info = liveUnlock(row);
    return `<tr data-tracker-id="${escapeHtml(row.id)}">
      <th scope="row">${label}</th>
      <td><select class="tracker-arc" data-field="arc" aria-label="${label} story arc">${options(arcLabels, row.arc)}</select></td>
      <td><select class="tracker-priority" data-field="priority" aria-label="${label} priority">${options(priorities, row.priority)}</select></td>
      <td><select class="tracker-status ${escapeHtml(row.status)}" data-field="status" aria-label="${label} status">${options(statuses, row.status)}</select></td>
      <td class="tracker-unlock-cell">${info ? renderLiveUnlock(info) : renderPlannedUnlock(row, label)}</td>
      <td><input data-field="notes" maxlength="2000" value="${escapeHtml(row.notes)}" aria-label="${label} notes" placeholder="Add a note"></td>
      <td><button type="button" class="text-button danger" data-remove aria-label="Remove ${label} from tracker">Remove</button></td>
    </tr>`;
  }
  function render() {
    const query = search.value.trim().toLocaleLowerCase();
    const visible = rows.filter(row => (!arcFilter.value || row.arc === arcFilter.value) &&
      (!statusFilter.value || row.status === statusFilter.value) &&
      (!unlockFilter.value || effectiveUnlock(row) === unlockFilter.value) &&
      (!query || `${row.name} ${row.notes} ${row.missionName} ${row.missionRequirements} ${liveUnlock(row)?.mission?.title || ''}`
        .toLocaleLowerCase().includes(query)));
    const coded = rows.filter(row => row.status === 'coded').length;
    const kits = rows.filter(row => row.status === 'kit-made').length;
    const starters = rows.filter(row => effectiveUnlock(row) === 'starter').length;
    const missionUnlocks = rows.filter(row => effectiveUnlock(row) === 'mission').length;
    const undecided = rows.filter(row => effectiveUnlock(row) === 'undecided').length;
    document.getElementById('tracker-summary').textContent = `${rows.length} planned · ${kits} kits made · ${coded} coded · ${starters} starters · ${missionUnlocks} mission unlocks · ${undecided} unlock undecided${visible.length !== rows.length ? ` · ${visible.length} shown` : ''}${live.loaded ? '' : ' · loading game unlock data…'}`;
    groups.innerHTML = visible.length ? arcs.filter(arc => visible.some(row => row.arc === arc)).map(arc => {
      const arcRows = visible.filter(row => row.arc === arc);
      return `<section class="tracker-group"><h3>${escapeHtml(arc)} <span>${arcRows.length}</span></h3><div class="tracker-table-wrap"><table><thead><tr><th scope="col">Character name</th><th scope="col">Story arc</th><th scope="col">Priority</th><th scope="col">Status</th><th scope="col">Unlock</th><th scope="col">Notes</th><th scope="col">Actions</th></tr></thead><tbody>${arcRows.map(renderRow).join('')}</tbody></table></div></section>`;
    }).join('') : '<p class="tracker-empty">No characters match these filters.</p>';
  }

  const arcOptions = arcs.map(arc => `<option value="${escapeHtml(arc)}">${escapeHtml(arc)}</option>`).join('');
  arcFilter.insertAdjacentHTML('beforeend', arcOptions);
  addForm.elements.arc.innerHTML = arcOptions;
  addForm.elements.arc.value = 'Chūnin Exams';
  [search, arcFilter, statusFilter, unlockFilter].forEach(control => control.addEventListener('input', render));
  const textFields = { notes: 2000, missionName: 120, missionRank: 80, missionRequirements: 2000 };
  groups.addEventListener('input', event => {
    const field = event.target.dataset.field;
    if (!Object.hasOwn(textFields, field)) return;
    const row = rows.find(item => item.id === event.target.closest('tr')?.dataset.trackerId);
    if (row) { row[field] = event.target.value.slice(0, textFields[field]); save(); }
  });
  groups.addEventListener('change', event => {
    const field = event.target.dataset.field;
    if (!['arc', 'priority', 'status', 'unlock'].includes(field)) return;
    const row = rows.find(item => item.id === event.target.closest('tr')?.dataset.trackerId);
    const validValues = { arc: arcLabels, priority: priorities, status: statuses, unlock: unlocks }[field];
    if (row && Object.hasOwn(validValues, event.target.value)) {
      row[field] = event.target.value; save(); render();
    }
  });
  groups.addEventListener('click', event => {
    const button = event.target.closest('[data-remove]');
    if (!button) return;
    const row = rows.find(item => item.id === button.closest('tr')?.dataset.trackerId);
    if (row && confirm(`Remove ${row.name} from the tracker?`)) {
      if (row.rosterId) rememberRemovedRosterId(row.rosterId);
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
    rows.push({ id: crypto.randomUUID(), name, arc: addForm.elements.arc.value, priority: addForm.elements.priority.value, status: 'not-started', notes: '', ...blankUnlock });
    save();
    arcFilter.value = addForm.elements.arc.value; statusFilter.value = ''; unlockFilter.value = ''; search.value = '';
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
      rows = data.characters.map(withUnlockFields); save(); render();
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
  loadLiveUnlocks().finally(() => { live.loaded = true; render(); });
})();
