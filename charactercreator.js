(function () {
  'use strict';
  const form = document.getElementById('draft-form');
  const skillEditor = document.getElementById('skill-editor');
  const passiveEditor = document.getElementById('passive-editor');
  const preview = document.getElementById('preview-content');
  const list = document.getElementById('draft-list');
  const state = document.getElementById('save-state');
  const saveButton = document.getElementById('save-draft');
  const deleteButton = document.getElementById('delete-draft');
  const copyButton = document.getElementById('copy-link');
  const commentForm = document.getElementById('comment-form');
  const topicForm = document.getElementById('topic-form');
  const commentList = document.getElementById('discussion-list');
  const topicList = document.getElementById('topic-list');
  const costTypes = ['bloodline', 'ninjutsu', 'taijutsu', 'genjutsu', 'random'];
  let drafts = [];
  let current = blankDraft();
  let dirty = false;
  let comments = [];
  let activeTopicId = null;
  let activeView = 'edit';

  function blankSkill() {
    return { name: '', icon: '', description: '', cooldown: 0, target: '', classes: '', notes: '', alternate: false, cost: Object.fromEntries(costTypes.map(type => [type, 0])) };
  }
  function blankDraft() {
    return { name: '', portrait: '', description: '', health: 100, unlock: '', notes: '', stage: 'idea', passive: null, skills: [blankSkill(), blankSkill(), blankSkill(), blankSkill()] };
  }
  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }
  function safeImage(value) {
    try { const url = new URL(String(value || ''), location.href); return /^https?:$/.test(url.protocol) ? url.href : ''; }
    catch (_) { return ''; }
  }
  function imageMarkup(url, label, className) {
    const safe = safeImage(url);
    return `<div class="${className}">${safe ? `<img src="${escapeHtml(safe)}" alt="${escapeHtml(label)}" loading="lazy">` : escapeHtml(label)}</div>`;
  }
  function setState(message, error) {
    state.textContent = message;
    state.classList.toggle('error', Boolean(error));
  }
  async function request(url, options) {
    const response = await fetch(url, { credentials: 'same-origin', ...options });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
    return data;
  }
  function renderList() {
    const query = document.getElementById('draft-search').value.trim().toLowerCase();
    const visible = drafts.filter(draft => draft.name.toLowerCase().includes(query));
    if (!visible.length) { list.innerHTML = `<p class="empty">${drafts.length ? 'No matching drafts.' : 'No team drafts yet. Start with a new concept.'}</p>`; return; }
    list.innerHTML = visible.map(draft => `<button type="button" class="draft-item${draft.id === current.id ? ' active' : ''}" data-draft-id="${escapeHtml(draft.id)}"><strong>${escapeHtml(draft.name)}</strong><small>${escapeHtml(draft.stage === 'review' ? 'Ready for review' : draft.stage === 'revised' ? 'Revised' : 'Idea')} · ${escapeHtml(draft.updatedBy || '')}</small></button>`).join('');
  }
  function chakraSummary(skill) {
    return costTypes.filter(type => Number(skill.cost?.[type])).map(type => `${skill.cost[type]} ${type}`).join(', ') || 'None';
  }
  function setImageBox(box, url, fallback) {
    if (!box) return;
    box.textContent = fallback;
    const safe = safeImage(url);
    if (!safe) return;
    const img = document.createElement('img');
    img.alt = fallback;
    img.src = safe;
    img.addEventListener('error', () => { if (img.parentElement === box) box.textContent = fallback; }, { once: true });
    box.replaceChildren(img);
  }
  function renderPassive() {
    const button = document.getElementById('toggle-passive');
    button.textContent = current.passive ? 'Remove passive' : 'Add passive';
    passiveEditor.innerHTML = current.passive ? `<div class="inline-passive-card" data-passive>
      <div class="inline-card-title"><input data-passive-field="name" maxlength="80" value="${escapeHtml(current.passive.name)}" placeholder="Passive skill name" aria-label="Passive skill name"></div>
      <div class="inline-character-main"><div class="inline-art"><div class="inline-art-preview" data-passive-image>Passive image</div><input data-passive-field="icon" type="url" maxlength="500" value="${escapeHtml(current.passive.icon)}" placeholder="Passive image URL" aria-label="Passive image URL"></div><textarea data-passive-field="description" maxlength="4000" rows="3" placeholder="What does this passive do?" aria-label="Passive description">${escapeHtml(current.passive.description)}</textarea></div>
      <textarea class="inline-notes" data-passive-field="notes" maxlength="2000" rows="2" placeholder="Passive notes (optional)" aria-label="Passive notes">${escapeHtml(current.passive.notes)}</textarea>
    </div>` : '';
    if (current.passive) setImageBox(passiveEditor.querySelector('[data-passive-image]'), current.passive.icon, 'Passive image');
  }
  function renderSkillEditors() {
    skillEditor.innerHTML = current.skills.map((skill, index) => `<article class="inline-skill-card${skill.alternate ? ' alternate' : ''}" data-skill="${index}">
      <div class="inline-card-title"><div class="inline-skill-title"><span class="skill-order">${index + 1}</span><input data-field="name" maxlength="80" value="${escapeHtml(skill.name)}" placeholder="Skill name" aria-label="Skill ${index + 1} name"></div><div class="inline-card-actions"><button type="button" class="text-button" data-move-skill="${index}" data-direction="-1" ${index === 0 ? 'disabled' : ''} aria-label="Move skill up">↑</button><button type="button" class="text-button" data-move-skill="${index}" data-direction="1" ${index === current.skills.length - 1 ? 'disabled' : ''} aria-label="Move skill down">↓</button><button type="button" class="text-button danger" data-remove-skill="${index}" aria-label="Remove skill">×</button></div></div>
      <div class="inline-skill-main"><div class="inline-art"><div class="inline-art-preview" data-skill-image>Skill image</div><input data-field="icon" type="url" maxlength="500" value="${escapeHtml(skill.icon)}" placeholder="Skill image URL" aria-label="Skill ${index + 1} image URL"></div><textarea data-field="description" maxlength="4000" rows="3" placeholder="Skill description" aria-label="Skill ${index + 1} description">${escapeHtml(skill.description)}</textarea></div>
      <textarea class="inline-notes" data-field="notes" maxlength="2000" rows="2" placeholder="Skill notes (optional)" aria-label="Skill ${index + 1} notes">${escapeHtml(skill.notes)}</textarea>
      <div class="inline-skill-footer"><label>Cooldown <input data-field="cooldown" type="number" min="0" max="99" value="${escapeHtml(skill.cooldown)}" aria-label="Skill ${index + 1} cooldown"></label><label class="classes-field">Classes <input data-field="classes" maxlength="300" value="${escapeHtml(skill.classes)}" placeholder="None" aria-label="Skill ${index + 1} classes"></label><div class="chakra-cost-field" role="group" aria-label="Skill ${index + 1} chakra cost"><span class="chakra-cost-heading">Chakra cost</span><div class="chakra-cost-controls">${costTypes.map(type => `<label class="chakra-cost-item" title="${type[0].toUpperCase() + type.slice(1)} chakra"><span class="chakra-square ${type}" aria-hidden="true"></span><input data-cost="${type}" type="number" min="0" max="9" value="${escapeHtml(skill.cost?.[type] || 0)}" aria-label="${type} chakra cost"></label>`).join('')}</div></div></div>
      <details class="inline-skill-more"><summary>Target and alternate options</summary><div><label>Target <input data-field="target" maxlength="100" value="${escapeHtml(skill.target)}" placeholder="One enemy, allies, self…"></label><label class="check-field"><input data-field="alternate" type="checkbox" ${skill.alternate ? 'checked' : ''}>Alternate skill</label></div></details>
    </article>`).join('');
    skillEditor.querySelectorAll('[data-skill]').forEach((card, index) => setImageBox(card.querySelector('[data-skill-image]'), current.skills[index].icon, 'Skill image'));
    document.getElementById('add-skill').disabled = current.skills.length >= 12;
  }
  function renderPreview() {
    const name = current.name || 'Character name';
    const pips = skill => costTypes.flatMap(type => Array.from({ length: Math.min(9, Math.max(0, Number(skill.cost?.[type]) || 0)) }, () => `<span class="concept-pip ${type}" title="${type}" aria-label="${type}"></span>`)).join('') || 'None';
    preview.innerHTML = `<div class="concept-head">${imageMarkup(current.portrait, 'Portrait', 'concept-face')}<div class="concept-head-info"><h3>${escapeHtml(name)}</h3><p>${escapeHtml(current.description || 'Character description will appear here.')}</p><div class="concept-head-meta"><span>${escapeHtml(current.health || 100)} max health</span><span>Mission: ${escapeHtml(current.unlock || 'None')}</span><span>${escapeHtml(current.stage === 'review' ? 'Ready for review' : current.stage === 'revised' ? 'Revised' : 'Idea')}</span></div></div></div>
      ${current.passive ? `<article class="concept-passive"><div class="concept-skill-head">${imageMarkup(current.passive.icon, current.passive.name || 'Passive image', 'concept-skill-image')}<div><span class="alternate-label">Passive skill</span><h4>${escapeHtml(current.passive.name || 'Passive skill')}</h4><p>${escapeHtml(current.passive.description || 'Passive description will appear here.')}</p></div></div>${current.passive.notes ? `<p class="concept-passive-notes">${escapeHtml(current.passive.notes)}</p>` : ''}</article>` : ''}
      <div class="concept-skills">${current.skills.length ? current.skills.map((skill, index) => `<article class="concept-skill${skill.alternate ? ' alternate' : ''}"><div class="concept-skill-head">${imageMarkup(skill.icon, skill.name || 'Skill image', 'concept-skill-image')}<div>${skill.alternate ? '<span class="alternate-label">Alternate skill</span>' : ''}<h4>${escapeHtml(skill.name || `Skill ${index + 1}`)}</h4><p>${escapeHtml(skill.description || 'Skill description will appear here.')}</p></div></div><div class="concept-skill-meta"><div><span class="lbl">Cooldown</span><span class="val">${Number(skill.cooldown) ? escapeHtml(skill.cooldown) : 'None'}</span></div><div><span class="lbl">Classes</span><span class="val">${escapeHtml(skill.classes || 'None')}</span></div><div><span class="lbl">Chakra cost</span><span class="val concept-pips" aria-label="${escapeHtml(chakraSummary(skill))}">${pips(skill)}</span></div></div></article>`).join('') : '<p class="empty">No skills added yet.</p>'}</div>
      ${current.notes ? `<div class="concept-extra"><section><h4>Balance notes</h4><p>${escapeHtml(current.notes)}</p></section></div>` : ''}`;
    const skillNames = current.skills.map(skill => skill.name);
    if (current.passive) skillNames.push(current.passive.name);
    preview.querySelectorAll('.concept-passive .concept-skill-head p').forEach(node => window.renderSkillDescription(node, current.passive.description || 'Passive description will appear here.', skillNames));
    preview.querySelectorAll('.concept-skills .concept-skill-head p').forEach((node, index) => window.renderSkillDescription(node, current.skills[index].description || 'Skill description will appear here.', skillNames));
    preview.querySelectorAll('img').forEach(img => {
      const showFallback = () => { if (img.parentElement) img.parentElement.textContent = img.alt; };
      img.addEventListener('error', showFallback, { once: true });
      if (img.complete && !img.naturalWidth) showFallback();
    });
  }
  function setView(view) {
    activeView = view;
    document.querySelector('.creator-shell').classList.toggle('tracker-mode', view === 'tracker');
    document.querySelectorAll('[data-view]').forEach(button => {
      const selected = button.dataset.view === view;
      button.classList.toggle('active', selected);
      if (selected) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    });
    document.querySelectorAll('[data-panel]').forEach(panel => { panel.hidden = panel.dataset.panel !== view; });
    if (view === 'discussion' && current.id) loadComments();
  }
  function renderComments() {
    const count = document.getElementById('discussion-count');
    const byId = new Map(comments.map(comment => [comment.id, comment]));
    const rootOf = comment => {
      let root = comment;
      for (let step = 0; step < 20 && root.replyTo && byId.has(root.replyTo); step++) root = byId.get(root.replyTo);
      return root;
    };
    const topics = new Map();
    comments.forEach(comment => {
      const root = rootOf(comment);
      if (!topics.has(root.id)) topics.set(root.id, { root, posts: [] });
      if (comment.id !== root.id) topics.get(root.id).posts.push(comment);
    });
    const topicRows = [...topics.values()].sort((a, b) => new Date(b.posts.at(-1)?.createdAt || b.root.createdAt) - new Date(a.posts.at(-1)?.createdAt || a.root.createdAt));
    count.hidden = topicRows.length === 0;
    count.textContent = String(topicRows.length);
    const empty = document.getElementById('discussion-empty');
    empty.hidden = Boolean(current.id);
    document.getElementById('new-topic').disabled = !current.id;
    if (!current.id) { activeTopicId = null; topicForm.hidden = true; }
    if (activeTopicId && !topics.has(activeTopicId)) activeTopicId = null;
    document.getElementById('topic-index').hidden = Boolean(activeTopicId);
    document.getElementById('topic-detail').hidden = !activeTopicId;
    topicList.innerHTML = topicRows.length ? topicRows.map(({ root, posts }) => {
      const latest = posts.at(-1) || root;
      const date = new Date(latest.createdAt);
      return `<button type="button" class="topic-row" data-topic="${escapeHtml(root.id)}"><span class="topic-row-main"><span class="topic-title">${escapeHtml(root.title || root.text.split('\n')[0].slice(0, 120))}</span><span class="topic-excerpt">${escapeHtml(root.text)}</span><span class="topic-byline">Started by ${escapeHtml(root.author)} · ${posts.length} ${posts.length === 1 ? 'reply' : 'replies'}</span></span><span class="topic-row-side"><span class="topic-badge${root.resolvedAt ? ' resolved' : root.type === 'suggestion' ? ' suggestion' : ''}">${root.type === 'suggestion' ? (root.resolvedAt ? 'Resolved' : 'Suggestion') : 'Discussion'}</span><time>${Number.isNaN(date.getTime()) ? '' : escapeHtml(date.toLocaleDateString())}</time></span></button>`;
    }).join('') : '<div class="discussion-empty">No topics yet. Start with one question or proposed change.</div>';
    if (!activeTopicId) return;
    const { root, posts } = topics.get(activeTopicId);
    document.getElementById('topic-heading').innerHTML = `<div><span class="topic-badge${root.resolvedAt ? ' resolved' : root.type === 'suggestion' ? ' suggestion' : ''}">${root.type === 'suggestion' ? (root.resolvedAt ? 'Resolved suggestion' : 'Suggested change') : 'Discussion'}</span><h3>${escapeHtml(root.title || root.text.split('\n')[0].slice(0, 120))}</h3><p>Started by ${escapeHtml(root.author)} · ${posts.length} ${posts.length === 1 ? 'reply' : 'replies'}</p></div>${root.type === 'suggestion' ? `<button type="button" class="button secondary" data-resolve="${escapeHtml(root.id)}">${root.resolvedAt ? 'Reopen suggestion' : 'Mark resolved'}</button>` : ''}`;
    const renderPost = (comment, index) => {
      const date = new Date(comment.createdAt);
      const dateLabel = Number.isNaN(date.getTime()) ? '' : date.toLocaleString();
      return `<article class="thread-message"><div class="message-head"><div><strong>${escapeHtml(comment.author)}</strong><span class="message-type">${index === 0 ? 'Original post' : `Reply ${index}`}</span></div><time>${escapeHtml(dateLabel)}</time></div><p>${escapeHtml(comment.text)}</p></article>`;
    };
    commentList.innerHTML = [root, ...posts].map(renderPost).join('');
  }
  async function loadComments() {
    const draftId = current.id;
    if (!draftId) { comments = []; renderComments(); return; }
    try {
      const data = await request(`/api/admin/character-drafts/${encodeURIComponent(draftId)}/comments`);
      if (current.id !== draftId) return;
      comments = data.comments || [];
      renderComments();
    } catch (error) { if (current.id === draftId) commentList.innerHTML = `<div class="discussion-empty">${escapeHtml(error.message)}</div>`; }
  }
  function renderForm() {
    ['name', 'portrait', 'description', 'health', 'unlock', 'notes', 'stage'].forEach(field => { form.elements[field].value = current[field] ?? ''; });
    setImageBox(document.getElementById('portrait-preview'), current.portrait, 'Portrait');
    renderPassive();
    renderSkillEditors();
    renderPreview();
    renderList();
    deleteButton.hidden = !current.id;
    copyButton.hidden = !current.id;
    setState(current.id ? `Saved draft · version ${current.version}` : 'New concept');
    comments = [];
    renderComments();
  }
  function changed() { dirty = true; setState('Unsaved changes'); renderPreview(); }
  function selectDraft(draft) {
    if ((dirty || commentForm.elements.text.value.trim() || topicForm.elements.text.value.trim()) && !confirm('Discard your unsaved changes or unfinished message?')) return;
    current = draft ? structuredClone(draft) : blankDraft();
    dirty = false;
    commentForm.reset();
    topicForm.reset();
    topicForm.hidden = true;
    activeTopicId = null;
    document.getElementById('comment-state').textContent = '';
    const url = new URL(location.href);
    if (current.id) url.searchParams.set('draft', current.id); else url.searchParams.delete('draft');
    history.replaceState(null, '', url);
    renderForm();
    setView('edit');
    loadComments();
  }
  async function loadDrafts(selectId) {
    try {
      const data = await request('/api/admin/character-drafts');
      drafts = data.drafts || [];
      if (selectId) {
        const found = drafts.find(draft => draft.id === selectId);
        if (found) {
          current = structuredClone(found); dirty = false; activeTopicId = null;
          const url = new URL(location.href); url.searchParams.set('draft', found.id); history.replaceState(null, '', url);
          renderForm(); setView('preview'); loadComments(); return;
        }
        setState('The requested draft was not found.', true);
      }
      renderList();
    } catch (error) { list.innerHTML = `<p class="empty">${escapeHtml(error.message)}</p>`; setState(error.message, true); }
  }
  form.addEventListener('input', event => {
    const target = event.target;
    const skillBox = target.closest('[data-skill]');
    const passiveBox = target.closest('[data-passive]');
    if (skillBox) {
      const skill = current.skills[Number(skillBox.dataset.skill)];
      if (target.dataset.field) skill[target.dataset.field] = target.type === 'checkbox' ? target.checked : target.type === 'number' ? Math.max(0, Number(target.value) || 0) : target.value;
      if (target.dataset.cost) skill.cost[target.dataset.cost] = Math.max(0, Number(target.value) || 0);
      if (target.dataset.field === 'icon') setImageBox(skillBox.querySelector('[data-skill-image]'), skill.icon, 'Skill image');
      if (target.dataset.field === 'alternate') skillBox.classList.toggle('alternate', skill.alternate);
    } else if (passiveBox) {
      if (target.dataset.passiveField) current.passive[target.dataset.passiveField] = target.value;
      if (target.dataset.passiveField === 'icon') setImageBox(passiveBox.querySelector('[data-passive-image]'), current.passive.icon, 'Passive image');
    } else if (target.name) current[target.name] = target.type === 'number' ? Math.max(1, Number(target.value) || 100) : target.value;
    if (target.name === 'portrait') setImageBox(document.getElementById('portrait-preview'), current.portrait, 'Portrait');
    changed();
  });
  form.addEventListener('change', event => { if (event.target.name === 'stage') { current.stage = event.target.value; changed(); } });
  skillEditor.addEventListener('click', event => {
    const move = event.target.closest('[data-move-skill]');
    if (move) {
      const from = Number(move.dataset.moveSkill);
      const to = from + Number(move.dataset.direction);
      if (to < 0 || to >= current.skills.length) return;
      [current.skills[from], current.skills[to]] = [current.skills[to], current.skills[from]];
      renderSkillEditors(); changed(); return;
    }
    const remove = event.target.closest('[data-remove-skill]');
    if (!remove) return;
    current.skills.splice(Number(remove.dataset.removeSkill), 1);
    renderSkillEditors(); changed();
  });
  document.getElementById('add-skill').addEventListener('click', () => {
    if (current.skills.length >= 12) return;
    current.skills.push(blankSkill()); renderSkillEditors(); changed();
    skillEditor.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  document.getElementById('toggle-passive').addEventListener('click', () => {
    if (current.passive && !confirm('Remove the passive skill from this draft?')) return;
    current.passive = current.passive ? null : { name: '', icon: '', description: '', notes: '' };
    renderPassive(); changed();
  });
  list.addEventListener('click', event => {
    const item = event.target.closest('[data-draft-id]');
    if (item) selectDraft(drafts.find(draft => draft.id === item.dataset.draftId));
  });
  document.getElementById('new-draft').addEventListener('click', () => selectDraft(null));
  document.getElementById('draft-search').addEventListener('input', renderList);
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
  document.getElementById('preview-edit').addEventListener('click', () => setView('edit'));
  document.getElementById('refresh-comments').addEventListener('click', loadComments);
  document.getElementById('new-topic').addEventListener('click', () => {
    if (!current.id) return;
    topicForm.hidden = false;
    topicForm.elements.title.focus();
  });
  document.getElementById('cancel-topic').addEventListener('click', () => { topicForm.hidden = true; topicForm.reset(); });
  document.getElementById('back-to-topics').addEventListener('click', () => { activeTopicId = null; renderComments(); });
  topicList.addEventListener('click', event => {
    const row = event.target.closest('[data-topic]');
    if (!row) return;
    activeTopicId = row.dataset.topic;
    renderComments();
  });
  document.getElementById('topic-heading').addEventListener('click', async event => {
    const resolveButton = event.target.closest('[data-resolve]');
    if (!resolveButton || !current.id) return;
    const comment = comments.find(item => item.id === resolveButton.dataset.resolve);
    if (!comment) return;
    resolveButton.disabled = true;
    try {
      await request(`/api/admin/character-drafts/${encodeURIComponent(current.id)}/comments/${encodeURIComponent(comment.id)}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resolved: !comment.resolvedAt }),
      });
      await loadComments();
    } catch (error) { document.getElementById('comment-state').textContent = error.message; resolveButton.disabled = false; }
  });
  topicForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!current.id || !topicForm.reportValidity()) return;
    const title = topicForm.elements.title.value.trim();
    const text = topicForm.elements.text.value.trim();
    if (!title || !text) return;
    const button = topicForm.querySelector('[type=submit]');
    const status = document.getElementById('topic-state');
    button.disabled = true; status.textContent = 'Creating topic…';
    try {
      const data = await request(`/api/admin/character-drafts/${encodeURIComponent(current.id)}/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, text, type: topicForm.elements.type.value }),
      });
      activeTopicId = data.comment.id;
      topicForm.reset(); topicForm.hidden = true;
      await loadComments();
      status.textContent = '';
    } catch (error) { status.textContent = error.message; }
    finally { button.disabled = false; }
  });
  commentForm.addEventListener('submit', async event => {
    event.preventDefault();
    if (!current.id || !activeTopicId || !commentForm.reportValidity()) return;
    const text = commentForm.elements.text.value.trim();
    if (!text) return;
    const button = document.getElementById('post-comment');
    const status = document.getElementById('comment-state');
    button.disabled = true; status.classList.remove('error'); status.textContent = 'Posting…';
    try {
      await request(`/api/admin/character-drafts/${encodeURIComponent(current.id)}/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, type: 'comment', replyTo: activeTopicId }),
      });
      commentForm.elements.text.value = '';
      await loadComments();
      status.textContent = 'Reply posted';
    } catch (error) { status.textContent = error.message; status.classList.add('error'); }
    finally { button.disabled = false; }
  });
  document.getElementById('refresh-drafts').addEventListener('click', async () => {
    if (dirty && !confirm('Discard your unsaved changes and refresh drafts?')) return;
    await loadDrafts(current.id);
  });
  saveButton.addEventListener('click', async () => {
    if (!form.reportValidity()) return;
    if (!String(current.name || '').trim()) { form.elements.name.focus(); return; }
    saveButton.disabled = true; setState('Saving…');
    try {
      const url = current.id ? `/api/admin/character-drafts/${encodeURIComponent(current.id)}` : '/api/admin/character-drafts';
      const data = await request(url, { method: current.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(current) });
      current = structuredClone(data.draft); dirty = false;
      const pageUrl = new URL(location.href); pageUrl.searchParams.set('draft', current.id); history.replaceState(null, '', pageUrl);
      renderForm();
      await loadDrafts();
      loadComments();
      setState('Saved for team review');
    } catch (error) { setState(error.message, true); }
    finally { saveButton.disabled = false; }
  });
  deleteButton.addEventListener('click', async () => {
    if (!current.id || !confirm(`Delete the draft for ${current.name}? This cannot be undone.`)) return;
    try {
      await request(`/api/admin/character-drafts/${encodeURIComponent(current.id)}`, { method: 'DELETE' });
      current = blankDraft(); dirty = false; renderForm(); setView('edit'); await loadDrafts(); setState('Draft deleted');
      const url = new URL(location.href); url.searchParams.delete('draft'); history.replaceState(null, '', url);
    } catch (error) { setState(error.message, true); }
  });
  copyButton.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.href); setState('Draft link copied'); }
    catch (_) { setState('Could not copy the link. Copy it from the address bar.', true); }
  });
  document.getElementById('export-draft').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(current, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url;
    link.download = `${String(current.name || 'character-concept').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'character-concept'}-draft.json`;
    link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  window.addEventListener('beforeunload', event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } });
  renderForm();
  loadDrafts(new URLSearchParams(location.search).get('draft'));
})();
