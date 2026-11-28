// Character Editor: the Test bench tab. Plays the character as it stands in the editor (unsaved
// edits included) against three opponents, with the real battle engine on the server
// (POST /api/admin/test-bench). Click a skill, click a target, end turns, and watch health,
// statuses, counters and cooldowns change. Every change replays the whole script, so a step can
// be undone or looked back at. Nothing is saved.
(function () {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const SIDE_LABEL = { p1: 'Your team', p2: 'Opponents' };

  function mount({ container, getWorking, getRoster, request }) {
    if (!container) return { render() {} };
    const bench = { forId: '', allies: [], enemies: [], steps: [], result: null, at: -1, pending: null, error: '', busy: false };
    let runToken = 0;

    const playable = () => getRoster().filter(entry => entry && entry.characterId && !entry.retired);
    function defaults(character) {
      const others = playable().filter(entry => entry.characterId !== character.characterId).map(entry => entry.characterId);
      bench.forId = character.characterId;
      bench.allies = [character.characterId, others[0], others[1]].filter(Boolean);
      bench.enemies = [others[2], others[3], others[4]].filter(Boolean);
      bench.steps = [];
      bench.at = -1;
      bench.pending = null;
    }

    async function run() {
      const character = getWorking();
      if (!character) return;
      const token = ++runToken;
      bench.busy = true;
      bench.error = '';
      render();
      try {
        const result = await request('/api/admin/test-bench', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ character, allies: bench.allies, enemies: bench.enemies, steps: bench.steps }) });
        if (token !== runToken) return;
        bench.result = result;
        bench.at = result.frames.length - 1;
      } catch (error) {
        if (token !== runToken) return;
        bench.error = error.message || 'The test bench could not run.';
      }
      bench.busy = false;
      render();
    }

    const frame = () => (bench.result && bench.result.frames[bench.at]) || null;
    const latest = () => bench.result && bench.at === bench.result.frames.length - 1;
    const team = side => (bench.result && bench.result.teams[side]) || [];

    // ------------------------------------------------------------ pieces
    function picker(side, index, value) {
      const character = getWorking();
      const options = playable().map(entry => [entry.characterId, entry.name || entry.characterId]);
      if (side === 'p1' && index === 0) return `<span class="tb-fixed">${esc(character.name)} <span class="sl-tag">editing</span></span>`;
      return `<select class="sl-select" data-tb-pick="${side}:${index}" aria-label="${esc(SIDE_LABEL[side])} ${index + 1}">${options.map(([id, name]) => `<option value="${esc(id)}"${id === value ? ' selected' : ''}>${esc(name)}</option>`).join('')}</select>`;
    }
    function statusChip(status) {
      const counters = Object.entries(status.counters || {}).map(([name, value]) => `${name} ${value}`).join(', ');
      return `<li class="tb-status${status.hidden ? ' is-hidden' : ''}" title="${esc(status.text)}"><strong>${esc(status.name)}</strong> <span>${status.turns === 'permanent' ? 'permanent' : `${status.turns} turn${status.turns === 1 ? '' : 's'}`}</span>${counters ? ` <span class="tb-counters">${esc(counters)}</span>` : ''}${status.hidden ? ' <span class="sl-tag">hidden</span>' : ''}</li>`;
    }
    function unitCard(unit, current) {
      const yourTurn = latest() && current.turn === unit.side && unit.alive && !bench.busy;
      const targeting = bench.pending && latest() && unit.alive;
      const skills = yourTurn ? (team(unit.side)[unit.slot]?.skills || []) : [];
      const pct = Math.max(0, Math.min(100, unit.hp));
      return `<article class="tb-unit${unit.alive ? '' : ' is-dead'}${targeting ? ' is-target' : ''}" ${targeting ? `data-tb-target="${unit.side}:${unit.slot}" tabindex="0" role="button" aria-label="Target ${esc(unit.name)}"` : ''}>
        <header><h4>${esc(unit.name)}</h4><span class="tb-hp">${unit.alive ? `${unit.hp} hp` : 'defeated'}</span></header>
        <div class="tb-bar" aria-hidden="true"><span style="width:${pct}%"></span></div>
        ${unit.statuses.length ? `<ul class="tb-statuses">${unit.statuses.map(statusChip).join('')}</ul>` : '<p class="sl-muted">No statuses.</p>'}
        ${unit.cooldowns.length ? `<p class="tb-cooldowns">Cooldown: ${unit.cooldowns.map(c => `${esc(c.skill)} ${c.turns}`).join(', ')}</p>` : ''}
        ${skills.length ? `<div class="tb-skills">${skills.map(skill => `<button type="button" class="tb-skill" data-tb-skill="${unit.side}:${unit.slot}:${esc(skill.id)}">${esc(skill.name)}</button>`).join('')}</div>` : ''}
        ${latest() && unit.alive && !bench.pending ? `<label class="tb-sethp">Set health <input type="number" class="sl-num" min="1" max="100" value="${unit.hp}" data-tb-hp="${unit.side}:${unit.slot}" aria-label="Set ${esc(unit.name)}'s health"></label>` : ''}
      </article>`;
    }

    function render() {
      const character = getWorking();
      if (!character) { container.innerHTML = ''; return; }
      if (bench.forId !== character.characterId) { defaults(character); bench.result = null; run(); return; }
      const current = frame();
      const log = bench.result ? bench.result.frames : [];
      container.innerHTML = `
        <div class="tb-setup">
          <div class="tb-side"><span class="rr-counters-label">Your team</span>${bench.allies.map((id, i) => picker('p1', i, id)).join('')}</div>
          <div class="tb-side"><span class="rr-counters-label">Opponents</span>${bench.enemies.map((id, i) => picker('p2', i, id)).join('')}</div>
        </div>
        ${bench.error ? `<p class="ce-warning">${esc(bench.error)}</p>` : ''}
        ${current ? `
          <div class="tb-turnbar" role="status" aria-live="polite">
            <span>${latest() ? `<strong>${current.turn === 'p1' ? "Your team's turn" : "The opponents' turn"}</strong>${bench.pending ? ` · choose a target for <strong>${esc(bench.pending.name)}</strong>` : ' · click a skill to use it'}` : `Looking back at step ${bench.at + 1} of ${log.length}`}${bench.busy ? ' · running…' : ''}</span>
            <span class="tb-turn-tools">
              ${bench.pending ? '<button type="button" class="text-button" data-tb-act="cancel">Cancel</button>' : ''}
              ${latest() ? `<button type="button" class="button secondary" data-tb-act="end"${bench.busy ? ' disabled' : ''}>End turn</button>` : '<button type="button" class="button secondary" data-tb-act="latest">Back to now</button>'}
            </span>
          </div>
          <div class="tb-board">
            ${['p1', 'p2'].map(side => `<section class="tb-row" aria-label="${SIDE_LABEL[side]}"><h3>${SIDE_LABEL[side]}</h3><div class="tb-units">${current.units.filter(u => u.side === side).map(u => unitCard(u, current)).join('')}</div></section>`).join('')}
          </div>` : `<p class="ce-muted">${bench.busy ? 'Setting up the match…' : 'Pick both teams to start.'}</p>`}
        <section class="tb-log" aria-label="Steps">
          <header><h3>Steps</h3><span class="tb-turn-tools">
            <button type="button" class="text-button" data-tb-act="undo"${bench.steps.length ? '' : ' disabled'}>Undo last step</button>
            <button type="button" class="text-button" data-tb-act="reset"${bench.steps.length ? '' : ' disabled'}>Start over</button>
            <button type="button" class="text-button" data-tb-act="rerun">Run again with my latest edits</button></span></header>
          <ol>${log.map((entry, i) => `<li${i === bench.at ? ' class="is-current"' : ''}><button type="button" class="tb-step" data-tb-at="${i}">${esc(entry.step)}</button>${entry.note ? `<span class="tb-note">${esc(entry.note)}</span>` : ''}</li>`).join('')}</ol>
        </section>`;
    }

    // ------------------------------------------------------------ actions
    function addStep(step) {
      bench.steps.push(step);
      bench.pending = null;
      run();
    }
    function useSkill(side, slot, skillId) {
      const skill = (team(side)[slot]?.skills || []).find(entry => entry.id === skillId);
      if (!skill) return;
      // Skills with one chosen target wait for a click on the board; the rest go straight in.
      const single = ['single-enemy', 'single-ally', 'self-or-single-ally', 'single-character', 'single-target', 'self-or-single-enemy'].includes(skill.target);
      if (single) { bench.pending = { side, slot, skillId, name: skill.name }; render(); return; }
      addStep({ do: 'cast', side, slot, skillId });
    }

    container.addEventListener('click', event => {
      const skill = event.target.closest('[data-tb-skill]');
      if (skill) { const [side, slot, id] = skill.dataset.tbSkill.split(':'); useSkill(side, Number(slot), id); return; }
      const target = event.target.closest('[data-tb-target]');
      if (target && bench.pending) {
        const [side, slot] = target.dataset.tbTarget.split(':');
        addStep({ do: 'cast', side: bench.pending.side, slot: bench.pending.slot, skillId: bench.pending.skillId, target: { side, slot: Number(slot) } });
        return;
      }
      const at = event.target.closest('[data-tb-at]');
      if (at) { bench.at = Number(at.dataset.tbAt); bench.pending = null; render(); return; }
      const control = event.target.closest('[data-tb-act]');
      if (!control) return;
      switch (control.dataset.tbAct) {
        case 'end': addStep({ do: 'endTurn' }); break;
        case 'cancel': bench.pending = null; render(); break;
        case 'latest': bench.at = bench.result.frames.length - 1; render(); break;
        case 'undo': bench.steps.pop(); bench.pending = null; run(); break;
        case 'reset': bench.steps = []; bench.pending = null; run(); break;
        case 'rerun': run(); break;
        default:
      }
    });
    container.addEventListener('keydown', event => {
      if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-tb-target]')) { event.preventDefault(); event.target.click(); }
    });
    container.addEventListener('change', event => {
      const pick = event.target.closest('[data-tb-pick]');
      if (pick) {
        const [side, index] = pick.dataset.tbPick.split(':');
        (side === 'p1' ? bench.allies : bench.enemies)[Number(index)] = pick.value;
        bench.steps = [];
        bench.pending = null;
        run();
        return;
      }
      const hp = event.target.closest('[data-tb-hp]');
      if (hp) {
        const [side, slot] = hp.dataset.tbHp.split(':');
        addStep({ do: 'setHealth', side, slot: Number(slot), hp: Number(hp.value) || 1 });
      }
    });
    return { render, run };
  }

  window.CharacterTestBench = { mount };
})();
