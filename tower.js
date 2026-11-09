// The Tower page. It only sends the player's choices to /api/tower and renders the run
// the server returns; every outcome (offers, healing, battle results) is decided there.
(function () {
    'use strict';

    const stage = document.querySelector('[data-stage]');
    const teamPanel = document.querySelector('[data-team-panel]');
    const teamList = document.querySelector('[data-team-list]');
    const teamScrollsEl = document.querySelector('[data-team-scrolls]');
    const logEl = document.querySelector('[data-log]');
    const runMeta = document.querySelector('[data-run-meta]');
    const floorChip = document.querySelector('[data-floor-chip]');
    const ryoChip = document.querySelector('[data-ryo-chip]');
    const abandonButton = document.querySelector('[data-abandon]');
    const pickBanner = document.querySelector('[data-pick-banner]');
    const pickLabel = document.querySelector('[data-pick-label]');
    const pickCancel = document.querySelector('[data-pick-cancel]');
    const toastEl = document.querySelector('[data-toast]');
    const confirmEl = document.querySelector('[data-confirm]');

    const NODE_META = {
        battle: { kanji: '戦', label: 'Battle', hint: 'Fight a squad. Win a Forbidden Scroll and ryō.' },
        elite: { kanji: '精', label: 'Elite', hint: 'A tougher squad with two affixes. Jōnin or Kage scrolls.' },
        boss: { kanji: '鬼', label: 'Boss', hint: 'The Demon of the Hidden Mist waits on the bridge.' },
        ramen: { kanji: '麺', label: 'Ramen Stand', hint: 'Recover health before the next fight.' },
        merchant: { kanji: '商', label: 'Merchant', hint: 'Spend ryō on scrolls and medicine.' },
        recruit: { kanji: '募', label: 'Recruit', hint: 'Swap one ninja for a fresh recruit.' },
    };
    // Chakra colours match the battle screen's chakra pool.
    const CHAKRA = [
        { key: 'Taijutsu', label: 'Taijutsu', color: '#4caf50' },
        { key: 'Bloodline', label: 'Bloodline', color: '#e04545' },
        { key: 'Ninjutsu', label: 'Ninjutsu', color: '#4a7bdc' },
        { key: 'Genjutsu', label: 'Genjutsu', color: '#e8e8e8' },
    ];
    const ACTIVE_STATUSES = ['draft', 'map', 'battle', 'ramen', 'merchant', 'recruit', 'reward'];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let state = { run: null, bestFloor: null };
    let busy = false;
    let pick = null; // { label, onPick(slot), disabledFor(member) }
    let selectedNodeId = null;
    let toastTimer = null;
    let lastStatusKey = '';
    let lastTeamHp = null; // previous health per slot, to float +/- changes
    let lastRyo = null;

    // ------------------------------------------------------------ helpers
    const escapeHtml = (value) => String(value ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const showToast = (message, tone = 'info') => {
        toastEl.textContent = message;
        toastEl.dataset.tone = tone;
        toastEl.hidden = false;
        toastEl.classList.remove('is-in');
        void toastEl.offsetWidth; // restart the entrance animation
        toastEl.classList.add('is-in');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { toastEl.hidden = true; }, 4200);
    };

    const api = async (path, body) => {
        const response = await window.ArenaSession.fetch(`/api/tower${path}`, {
            method: body === undefined ? 'GET' : 'POST',
            headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: body === undefined ? undefined : JSON.stringify(body),
        });
        let data = null;
        try { data = await response.json(); } catch (_) { /* handled below */ }
        if (response.status === 401) {
            window.location.href = 'selection-login.html';
            throw new Error('Please sign in again.');
        }
        if (!response.ok || !data?.ok) throw new Error(data?.error || 'The Tower could not be reached.');
        return data;
    };

    const act = async (path, body = {}, { onSuccess, button } = {}) => {
        if (busy) return;
        busy = true;
        document.body.classList.add('is-busy');
        if (button) button.classList.add('is-loading');
        try {
            const data = await api(path, body);
            pick = null;
            selectedNodeId = null;
            state = { run: data.run, bestFloor: data.bestFloor };
            render();
            if (onSuccess) onSuccess(data);
        } catch (error) {
            showToast(error.message, 'error');
            if (/changed/.test(error.message)) load();
        } finally {
            busy = false;
            document.body.classList.remove('is-busy');
            if (button) button.classList.remove('is-loading');
        }
    };

    const load = async () => {
        try {
            const data = await api('/run');
            state = { run: data.run, bestFloor: data.bestFloor };
            render();
        } catch (error) {
            stage.innerHTML = `<div class="tower-card tower-error"><p>${escapeHtml(error.message)}</p>` +
                '<button type="button" class="tower-button" data-retry>Retry</button></div>';
            stage.querySelector('[data-retry]').onclick = load;
        }
    };

    // A styled confirmation instead of the browser's own dialog.
    const confirmAction = ({ title, body, confirmLabel }) => new Promise((resolve) => {
        confirmEl.querySelector('[data-confirm-title]').textContent = title;
        confirmEl.querySelector('[data-confirm-body]').textContent = body;
        const ok = confirmEl.querySelector('[data-confirm-ok]');
        const cancel = confirmEl.querySelector('[data-confirm-cancel]');
        ok.textContent = confirmLabel;
        const close = (result) => {
            confirmEl.close();
            ok.onclick = null;
            cancel.onclick = null;
            resolve(result);
        };
        ok.onclick = () => close(true);
        cancel.onclick = () => close(false);
        confirmEl.oncancel = (event) => { event.preventDefault(); close(false); };
        confirmEl.showModal();
        cancel.focus();
    });

    const hpPercent = (member) => Math.max(0, Math.min(100, Math.round((member.hp / member.maxHp) * 100)));

    const scrollIcon = (scroll, size = 'sm') =>
        `<span class="tower-scroll-icon is-${size} tier-${escapeHtml(scroll.tier)}" tabindex="0" ` +
        `data-tip="${escapeHtml(`${scroll.name} · ${scroll.tierLabel}\n${scroll.description}`)}">` +
        `<img src="${escapeHtml(scroll.icon)}" alt="${escapeHtml(scroll.name)}"></span>`;

    const skillStrip = (character) => (character.skills || []).map((skill) =>
        `<img class="tower-skill" src="${escapeHtml(skill.skillimage)}" alt="${escapeHtml(skill.name)}" tabindex="0" ` +
        `data-tip="${escapeHtml(`${skill.name}\n${skill.skilldescription}`)}">`).join('');

    const portrait = (character, extraClass = '') =>
        `<img class="tower-portrait ${extraClass}" src="${escapeHtml(character.facePicture || 'found-remaster.png')}" ` +
        `alt="${escapeHtml(character.name)}">`;

    // How much of each chakra type a set of characters asks for (random costs left out).
    const chakraMix = (characters) => {
        const counts = Object.fromEntries(CHAKRA.map((entry) => [entry.key, 0]));
        characters.forEach((character) => (character.skills || []).forEach((skill) =>
            (skill.energy || []).forEach((type) => { if (type in counts) counts[type] += 1; })));
        const total = Object.values(counts).reduce((sum, value) => sum + value, 0) || 1;
        const segments = CHAKRA.filter((entry) => counts[entry.key] > 0).map((entry) =>
            `<span style="flex:${counts[entry.key]};background:${entry.color}" title="${entry.label}: ${counts[entry.key]}"></span>`).join('');
        const legend = CHAKRA.filter((entry) => counts[entry.key] > 0).map((entry) =>
            `<span><i style="background:${entry.color}"></i>${entry.label} ${Math.round((counts[entry.key] / total) * 100)}%</span>`).join('');
        return `<div class="tower-chakra-mix" aria-label="Chakra the team's skills ask for"><div class="tower-chakra-bar">${segments}</div>` +
            `<div class="tower-chakra-legend">${legend}</div></div>`;
    };

    const scrollCard = (scroll, { footer = '', attrs = '', index = 0 } = {}) =>
        `<button type="button" class="tower-scroll-card tier-${escapeHtml(scroll.tier)}" style="--i:${index}" ${attrs}>` +
        `<span class="tower-scroll-tier">${escapeHtml(scroll.tierLabel)} scroll</span>` +
        `<span class="tower-scroll-art-wrap"><img class="tower-scroll-art" src="${escapeHtml(scroll.icon)}" alt=""></span>` +
        `<strong>${escapeHtml(scroll.name)}</strong>` +
        `<span class="tower-scroll-desc">${escapeHtml(scroll.description)}</span>` +
        `<span class="tower-scroll-scope">${scroll.scope === 'team' ? 'Whole team' : 'Choose a ninja'}</span>` +
        footer + '</button>';

    // Ask the player to pick a ninja on the team panel, then run the action.
    const startPick = ({ label, onPick, disabledFor = () => '' }) => {
        pick = { label, onPick, disabledFor };
        renderTeam();
        teamPanel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
        teamList.querySelector('.tower-member:not(.is-disabled)')?.focus({ preventScroll: true });
    };

    const withScrollTarget = (scroll, action) => {
        if (scroll.scope === 'team') return action(null);
        return startPick({
            label: `Choose a ninja for ${scroll.name}.`,
            onPick: action,
            disabledFor: (member) => (member.scrolls.some((owned) => owned.key === scroll.key) ? 'Already learned' : ''),
        });
    };

    // Floats a "+12" (or "-30") over an element.
    const floatDelta = (element, delta, tone) => {
        if (!element || !delta || reduceMotion) return;
        const badge = document.createElement('span');
        badge.className = `tower-float is-${tone}`;
        badge.textContent = `${delta > 0 ? '+' : ''}${delta}`;
        element.appendChild(badge);
        setTimeout(() => badge.remove(), 1400);
    };

    // ------------------------------------------------------------ team panel
    const renderTeam = () => {
        const run = state.run;
        const team = run?.team || [];
        // A finished run shows its final team on the summary card instead.
        teamPanel.hidden = !team.length || !ACTIVE_STATUSES.includes(run?.status);
        pickBanner.hidden = !pick;
        if (pick) pickLabel.textContent = pick.label;
        teamPanel.classList.toggle('is-picking', Boolean(pick));
        teamList.innerHTML = team.map((member, slot) => {
            const disabled = pick ? pick.disabledFor(member, slot) : '';
            const percent = hpPercent(member);
            const tone = member.wounded ? 'is-low' : percent < 60 ? 'is-mid' : '';
            return `<li class="tower-member${member.wounded ? ' is-wounded' : ''}${disabled ? ' is-disabled' : ''}" ` +
                `data-slot="${slot}" ${pick && !disabled ? 'tabindex="0" role="button"' : ''}>` +
                `<div class="tower-member-face">${portrait(member)}${member.wounded ? '<span class="tower-wound-mark" aria-hidden="true">傷</span>' : ''}</div>` +
                '<div class="tower-member-body">' +
                `<div class="tower-member-name"><strong>${escapeHtml(member.name)}</strong>` +
                (member.wounded ? '<span class="tower-tag is-wounded">Wounded</span>' : '') +
                (disabled ? `<span class="tower-tag">${escapeHtml(disabled)}</span>` : '') + '</div>' +
                `<div class="tower-hp ${tone}" role="meter" aria-valuemin="0" aria-valuemax="${member.maxHp}" aria-valuenow="${member.hp}" aria-label="Health">` +
                `<span class="tower-hp-fill" style="width:${percent}%"></span>` +
                `<span class="tower-hp-text">${member.hp} / ${member.maxHp}</span></div>` +
                `<div class="tower-member-scrolls">${member.scrolls.map((scroll) => scrollIcon(scroll)).join('') ||
                    '<span class="tower-muted">No scrolls yet</span>'}</div>` +
                `<div class="tower-skills">${skillStrip(member)}</div>` +
                '</div></li>';
        }).join('');
        teamList.querySelectorAll('.tower-member').forEach((element) => {
            const choose = () => {
                if (!pick || element.classList.contains('is-disabled')) return;
                pick.onPick(Number(element.dataset.slot));
            };
            element.addEventListener('click', choose);
            element.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(); }
            });
        });
        // Health changes since the last render (ramen, medkits, battles) float over the bars.
        const nextHp = team.map((member) => `${member.characterId}:${member.hp}`);
        if (lastTeamHp && lastTeamHp.length === team.length) {
            team.forEach((member, slot) => {
                const [previousId, previousHp] = lastTeamHp[slot].split(':');
                if (previousId !== member.characterId) return;
                const delta = member.hp - Number(previousHp);
                floatDelta(teamList.children[slot]?.querySelector('.tower-hp'), delta, delta > 0 ? 'heal' : 'hurt');
            });
        }
        lastTeamHp = nextHp;
        const teamScrolls = run?.teamScrolls || [];
        teamScrollsEl.innerHTML = teamScrolls.length
            ? `<span class="tower-team-scrolls-label">Team scrolls</span>${teamScrolls.map((scroll) => scrollIcon(scroll, 'md')).join('')}`
            : '';
        logEl.innerHTML = (run?.log || []).slice().reverse()
            .map((entry, index) => `<li class="${index === 0 ? 'is-latest' : ''}">${escapeHtml(entry.text)}</li>`).join('');
    };

    // ------------------------------------------------------------ stages
    const renderIntro = () => {
        const best = state.bestFloor;
        stage.innerHTML =
            '<div class="tower-card tower-intro">' +
            '<div class="tower-intro-copy">' +
            '<span class="tower-kicker">PvE roguelike · Act I · Land of Waves</span>' +
            '<h1>Climb the Tower</h1>' +
            '<p class="tower-lead">Draft a random squad, fight up ten floors of the Land of Waves, and shape your team ' +
            'with Forbidden Scrolls along the way. Health carries between battles. One loss ends the run.</p>' +
            '<ol class="tower-steps">' +
            '<li><span class="tower-step-mark" aria-hidden="true">選</span><div><b>Draft</b><span>Pick one of three random teams from the whole roster. Mission locks do not apply.</span></div></li>' +
            '<li><span class="tower-step-mark" aria-hidden="true">道</span><div><b>Choose a path</b><span>Battles, ramen stands, merchants and recruits. Floor 5 is guarded by elites.</span></div></li>' +
            '<li><span class="tower-step-mark" aria-hidden="true">巻</span><div><b>Collect scrolls</b><span>Every win offers a Forbidden Scroll. Genin, Jōnin and Kage rarities.</span></div></li>' +
            '<li><span class="tower-step-mark is-boss" aria-hidden="true">鬼</span><div><b>Face the Demon</b><span>Floor 10: Zabuza telegraphs his next move. Stun him to interrupt it.</span></div></li>' +
            '</ol>' +
            '<p class="tower-fineprint">Fallen ninjas return wounded at 25% health. Tower battles never touch your ladder record. ' +
            'A finished run pays 15 account ryō per floor cleared, plus 150 for the boss.</p>' +
            '<div class="tower-actions">' +
            '<button type="button" class="tower-button is-primary is-large" data-start>Begin the climb</button>' +
            (best ? `<span class="tower-best"><span aria-hidden="true">塔</span>Best climb: floor ${best.floor}${best.cleared ? ' · conquered' : ''}</span>` : '') +
            '</div></div>' +
            '<img class="tower-intro-render" src="kakashi-render.png" alt="">' +
            '</div>';
        stage.querySelector('[data-start]').onclick = (event) => act('/start', {}, { button: event.currentTarget });
    };

    const renderDraft = (run) => {
        stage.innerHTML =
            '<div class="tower-card">' +
            '<span class="tower-kicker">Draft</span><h1>Choose your squad</h1>' +
            '<p class="tower-lead">Hover or tap a skill to read it. The bar shows the chakra each team asks for. You can reroll the offers once.</p>' +
            '<div class="tower-draft">' +
            run.draft.offers.map((trio, index) =>
                `<div class="tower-trio" style="--i:${index}">` +
                `<span class="tower-trio-index">Team ${['一', '二', '三'][index]}</span>` +
                trio.map((character) =>
                    '<div class="tower-trio-member">' + portrait(character) +
                    `<div><strong>${escapeHtml(character.name)}</strong><div class="tower-skills">${skillStrip(character)}</div></div></div>`
                ).join('') +
                chakraMix(trio) +
                `<button type="button" class="tower-button is-primary" data-offer="${index}">Take this team</button></div>`).join('') +
            '</div>' +
            `<button type="button" class="tower-button" data-reroll ${run.draft.rerollsLeft ? '' : 'disabled'}>` +
            `<span aria-hidden="true">↻</span> Reroll offers (${run.draft.rerollsLeft} left)</button></div>`;
        stage.querySelectorAll('[data-offer]').forEach((button) => {
            button.onclick = () => act('/draft', { offerIndex: Number(button.dataset.offer) }, { button });
        });
        stage.querySelector('[data-reroll]').onclick = (event) => act('/draft/reroll', {}, { button: event.currentTarget });
    };

    const renderMap = (run, { entering = false } = {}) => {
        const floors = run.map.floors;
        const available = new Set(run.availableNodeIds);
        const path = run.path || [];
        const taken = new Set(path);
        const takenEdges = new Set(path.slice(1).map((id, index) => `${path[index]}>${id}`));
        const rowHeight = 54;
        const height = floors.length * rowHeight;
        const position = (node) => ({
            x: floors[node.floor - 1].length === 1 ? 50 : ((node.lane + 0.5) / 3) * 100,
            y: height - ((node.floor - 0.5) * rowHeight),
        });
        const lines = floors.flatMap((floor) => floor.flatMap((node) => node.next.map((nextId) => {
            const nextNode = floors[node.floor].find((entry) => entry.id === nextId);
            const from = position(node);
            const to = position(nextNode);
            const isTaken = takenEdges.has(`${node.id}>${nextId}`);
            const isLive = node.id === run.currentNodeId && available.has(nextId);
            return `<line x1="${from.x}%" y1="${from.y}" x2="${to.x}%" y2="${to.y}" class="${isTaken ? 'is-taken' : isLive ? 'is-live' : ''}"/>`;
        }))).join('');
        const nextFloor = run.floor + 1;
        const band = nextFloor <= floors.length
            ? `<span class="tower-floor-band" style="top:${height - nextFloor * rowHeight}px;height:${rowHeight}px"></span>` : '';
        const nodes = floors.flat().map((node) => {
            const meta = NODE_META[node.type];
            const { x, y } = position(node);
            const isAvailable = available.has(node.id);
            const classes = ['tower-node', `type-${node.type}`,
                isAvailable ? 'is-available' : '', taken.has(node.id) ? 'is-visited' : '',
                !taken.has(node.id) && node.floor <= run.floor ? 'is-skipped' : '',
                node.id === run.currentNodeId ? 'is-current' : '', node.id === selectedNodeId ? 'is-selected' : '']
                .filter(Boolean).join(' ');
            const face = node.type === 'boss' && run.boss?.leader?.facePicture
                ? `<img src="${escapeHtml(run.boss.leader.facePicture)}" alt="">` : `<span aria-hidden="true">${meta.kanji}</span>`;
            return `<button type="button" class="${classes}" style="left:${x}%;top:${y}px" data-node="${node.id}" ` +
                `data-tip="${escapeHtml(`Floor ${node.floor} · ${meta.label}\n${meta.hint}`)}" ` +
                `${isAvailable ? '' : 'disabled'} aria-label="Floor ${node.floor}: ${meta.label}${isAvailable ? ', available' : ''}">${face}</button>`;
        }).join('');
        const selected = selectedNodeId ? floors.flat().find((node) => node.id === selectedNodeId) : null;
        const selectedMeta = selected ? NODE_META[selected.type] : null;
        stage.innerHTML =
            '<div class="tower-card tower-map-card">' +
            `<div class="tower-map-head"><div><span class="tower-kicker">${run.floor
                ? `Floor ${run.floor} cleared · ${run.totalFloors - run.floor} to go` : 'The climb begins'}</span>` +
            '<h1>Choose your path</h1></div>' +
            '<ul class="tower-legend">' + Object.entries(NODE_META).map(([type, meta]) =>
                `<li class="type-${type}"><span aria-hidden="true">${meta.kanji}</span>${meta.label}</li>`).join('') + '</ul></div>' +
            `<div class="tower-map" style="height:${height}px">${band}` +
            `<svg class="tower-map-lines" width="100%" height="${height}" aria-hidden="true">${lines}</svg>` +
            floors.map((floor, index) => `<span class="tower-floor-label${index + 1 === nextFloor ? ' is-next' : ''}" style="top:${height - (index + 0.5) * rowHeight}px">${index + 1}</span>`).join('') +
            nodes + '</div>' +
            `<div class="tower-node-detail${selected ? ' has-selection' : ''}">${selected
                ? `<span class="tower-detail-mark type-${selected.type}" aria-hidden="true">${selectedMeta.kanji}</span>` +
                  `<div><strong>Floor ${selected.floor} · ${escapeHtml(selectedMeta.label)}</strong><span>${escapeHtml(selectedMeta.hint)}</span></div>` +
                  '<button type="button" class="tower-button is-primary" data-go>Go</button>'
                : '<span class="tower-muted">Pick a glowing node to continue the climb.</span>'}</div>` +
            '</div>';
        stage.querySelectorAll('[data-node]').forEach((button) => {
            button.onclick = () => {
                selectedNodeId = button.dataset.node;
                renderMap(state.run);
                const go = stage.querySelector('[data-go]');
                stage.querySelector('.tower-node-detail')?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
                go?.focus({ preventScroll: true });
            };
        });
        const go = stage.querySelector('[data-go]');
        if (go) go.onclick = () => act('/node', { nodeId: selectedNodeId }, { button: go });
        if (entering) {
            // Bring the open floor into view: it is near the bottom early on and near the top later.
            const open = stage.querySelector('.tower-node.is-available');
            const rect = open?.getBoundingClientRect();
            if (rect && (rect.top < 80 || rect.bottom > window.innerHeight - 90)) open.scrollIntoView({ block: 'center' });
        }
    };

    const enterBattle = (button) => act('/battle', {}, {
        button,
        onSuccess: (data) => {
            if (data.matchId) {
                document.body.classList.add('is-leaving');
                setTimeout(() => { window.location.href = `ingame.html?matchId=${encodeURIComponent(data.matchId)}`; }, reduceMotion ? 0 : 260);
            }
        },
    });

    const renderBattle = (run) => {
        const { encounter, matchId } = run.battle;
        const kindLabel = encounter.kind === 'boss' ? 'Boss' : encounter.kind === 'elite' ? 'Elite' : 'Battle';
        const kindMark = encounter.kind === 'boss' ? '鬼' : encounter.kind === 'elite' ? '精' : '戦';
        const boss = encounter.boss;
        stage.innerHTML =
            `<div class="tower-card tower-battle is-${escapeHtml(encounter.kind)}">` +
            '<div class="tower-battle-head">' +
            `<span class="tower-battle-seal" aria-hidden="true">${kindMark}</span>` +
            `<div><span class="tower-kicker">Floor ${encounter.floor} · ${kindLabel}${boss ? ` · ${escapeHtml(boss.title.split('—').pop().trim())}` : ''}</span>` +
            `<h1>${escapeHtml(encounter.name)}</h1>` +
            (boss ? `<p class="tower-lead">${escapeHtml(boss.intro)}</p>` : '') + '</div></div>' +
            '<div class="tower-enemies">' + encounter.enemies.map((enemy, index) =>
                `<div class="tower-enemy${boss && index === 0 ? ' is-leader' : ''}" style="--i:${index}">` + portrait(enemy) +
                `<strong>${escapeHtml(enemy.name)}</strong>` +
                `<span class="tower-enemy-hp${enemy.hp > 100 ? ' is-boosted' : ''}">${enemy.hp} HP</span>` +
                `<div class="tower-skills">${skillStrip(enemy)}</div></div>`).join('') +
            '</div>' +
            '<ul class="tower-encounter-facts">' +
            encounter.affixes.map((affix) => `<li><span class="tower-fact-mark is-affix" aria-hidden="true">${escapeHtml(affix.kanji || '!')}</span><b>${escapeHtml(affix.name)}</b> ${escapeHtml(affix.description)}</li>`).join('') +
            (boss ? boss.mechanics.map((line) => `<li><span class="tower-fact-mark is-boss" aria-hidden="true">鬼</span>${escapeHtml(line)}</li>`).join('') : '') +
            (!boss && encounter.hpMultiplier <= 1 && !encounter.affixes.length
                ? '<li><span class="tower-fact-mark" aria-hidden="true">戦</span>A plain squad. Win to claim a scroll.</li>' : '') +
            '</ul>' +
            '<div class="tower-battle-foot">' +
            '<span class="tower-muted">The battle starts when you enter, and your first turn timer starts with it.</span>' +
            `<button type="button" class="tower-button is-primary is-large" data-fight>${matchId ? 'Return to battle' : 'Enter battle'}</button>` +
            '</div></div>';
        stage.querySelector('[data-fight]').onclick = (event) => enterBattle(event.currentTarget);
    };

    const renderRamen = (run) => {
        stage.innerHTML =
            '<div class="tower-card tower-ramen"><span class="tower-kicker">Rest</span><h1>Ichiraku Ramen</h1>' +
            '<p class="tower-lead">Steam rises from the counter. A warm bowl before the next floor. Choose one.</p>' +
            '<div class="tower-choices">' +
            `<button type="button" class="tower-choice" data-feast style="--i:0"><span class="tower-choice-mark" aria-hidden="true">宴</span><strong>Team feast</strong><span>Every ninja recovers ${run.constants.ramenFeastPercent}% of their health.</span></button>` +
            '<button type="button" class="tower-choice" data-rest style="--i:1"><span class="tower-choice-mark" aria-hidden="true">休</span><strong>Full rest</strong><span>One ninja recovers to full health.</span></button>' +
            '</div></div>';
        stage.querySelector('[data-feast]').onclick = (event) => act('/ramen', { option: 'feast' }, { button: event.currentTarget });
        stage.querySelector('[data-rest]').onclick = () => startPick({
            label: 'Choose a ninja to rest.',
            onPick: (slot) => act('/ramen', { option: 'rest', slot }),
            disabledFor: (member) => (member.hp >= member.maxHp ? 'Full health' : ''),
        });
    };

    const renderMerchant = (run) => {
        const stock = run.merchant.stock;
        stage.innerHTML =
            '<div class="tower-card"><span class="tower-kicker">Merchant</span><h1>A travelling merchant</h1>' +
            `<p class="tower-lead">You carry <b class="tower-ryo-inline">${run.ryo} ryō</b>. Run ryō is lost when the run ends, so spend it.</p>` +
            '<div class="tower-shop">' + stock.map((item, index) => {
                const short = !item.sold && item.price > run.ryo;
                const price = `<span class="tower-price${short ? ' is-short' : ''}">${item.sold ? 'Sold' : `${item.price} ryō`}</span>`;
                const disabled = item.sold || short ? 'disabled' : '';
                const soldClass = item.sold ? ' is-sold' : '';
                if (item.kind === 'scroll') {
                    return scrollCard(item.scroll, { footer: price, attrs: `data-buy="${index}" ${disabled}`, index }).replace('tower-scroll-card ', `tower-scroll-card${soldClass} `);
                }
                return `<button type="button" class="tower-scroll-card tier-medkit${soldClass}" style="--i:${index}" data-buy="${index}" ${disabled}>` +
                    '<span class="tower-scroll-tier">Supplies</span><span class="tower-scroll-art-wrap"><span class="tower-medkit-art" aria-hidden="true">薬</span></span>' +
                    `<strong>Medical kit</strong><span class="tower-scroll-desc">Every ninja recovers ${run.constants.medkitHealPercent}% of their health.</span>` +
                    price + '</button>';
            }).join('') + '</div>' +
            '<button type="button" class="tower-button" data-leave>Leave the merchant</button></div>';
        stage.querySelectorAll('[data-buy]').forEach((button) => {
            button.onclick = () => {
                const index = Number(button.dataset.buy);
                const item = stock[index];
                if (item.kind !== 'scroll') return act('/merchant/buy', { itemIndex: index }, { button });
                return withScrollTarget(item.scroll, (slot) => act('/merchant/buy', { itemIndex: index, slot }));
            };
        });
        stage.querySelector('[data-leave]').onclick = (event) => act('/leave', {}, { button: event.currentTarget });
    };

    const renderRecruit = (run) => {
        stage.innerHTML =
            '<div class="tower-card"><span class="tower-kicker">Recruit</span><h1>Shinobi for hire</h1>' +
            '<p class="tower-lead">Swap one of your ninjas for a recruit. The recruit arrives at full health and inherits the departing ninja\'s scrolls.</p>' +
            '<div class="tower-recruits">' + run.recruit.offers.map((character, index) =>
                `<div class="tower-recruit" style="--i:${index}">${portrait(character)}` +
                `<strong>${escapeHtml(character.name)}</strong><div class="tower-skills">${skillStrip(character)}</div>` +
                (character.passive
                    ? `<span class="tower-passive" tabindex="0" data-tip="${escapeHtml(`${character.passive.name}\n${character.passive.description}`)}">Passive: ${escapeHtml(character.passive.name)}</span>`
                    : '') +
                chakraMix([character]) +
                `<button type="button" class="tower-button" data-recruit="${index}">Recruit</button></div>`).join('') + '</div>' +
            '<button type="button" class="tower-button" data-leave>Keep my team</button></div>';
        stage.querySelectorAll('[data-recruit]').forEach((button) => {
            button.onclick = () => {
                const offer = run.recruit.offers[Number(button.dataset.recruit)];
                startPick({
                    label: `Choose who ${offer.name} replaces.`,
                    onPick: (slot) => act('/recruit', { offerIndex: Number(button.dataset.recruit), slot }),
                });
            };
        });
        stage.querySelector('[data-leave]').onclick = (event) => act('/leave', {}, { button: event.currentTarget });
    };

    const renderReward = (run) => {
        stage.innerHTML =
            '<div class="tower-card tower-reward"><span class="tower-kicker">Victory · Floor ' + run.floor + '</span><h1>Claim a Forbidden Scroll</h1>' +
            `<p class="tower-lead"><b class="tower-ryo-inline">+${run.reward.ryoGained} ryō</b> earned. Choose one scroll, or skip it for ${run.constants.skipScrollRyo} more ryō.</p>` +
            '<div class="tower-shop is-reveal">' + run.reward.offers.map((scroll, index) =>
                scrollCard(scroll, { attrs: `data-reward="${index}"`, index })).join('') + '</div>' +
            `<button type="button" class="tower-button" data-skip>Skip (+${run.constants.skipScrollRyo} ryō)</button></div>`;
        stage.querySelectorAll('[data-reward]').forEach((button) => {
            button.onclick = () => {
                const index = Number(button.dataset.reward);
                withScrollTarget(run.reward.offers[index], (slot) => act('/reward', { offerIndex: index, slot }, { button }));
            };
        });
        stage.querySelector('[data-skip]').onclick = (event) => act('/reward/skip', {}, { button: event.currentTarget });
    };

    const renderEnded = (run) => {
        const titles = { victory: 'Tower conquered', defeated: 'The climb ends', abandoned: 'Run abandoned' };
        const art = run.status === 'victory' ? 'battle-victory.png' : 'battle-defeat.png';
        const reward = run.accountReward;
        stage.innerHTML =
            `<div class="tower-card tower-ended is-${escapeHtml(run.status)}">` +
            '<div class="tower-ended-head">' +
            `<img class="tower-ended-art" src="${art}" alt="">` +
            '<div>' +
            `<span class="tower-kicker">${run.status === 'victory' ? 'Act I cleared' : `Reached floor ${run.floor} of ${run.totalFloors}`}</span>` +
            `<h1>${titles[run.status] || 'Run over'}</h1>` +
            `<div class="tower-progress" aria-label="Floors cleared">${Array.from({ length: run.totalFloors }, (_, index) =>
                `<span class="${index < run.floor ? 'is-done' : ''}${index === run.totalFloors - 1 ? ' is-boss' : ''}"></span>`).join('')}</div>` +
            '</div></div>' +
            '<dl class="tower-summary">' +
            `<div><dt>Floors cleared</dt><dd>${run.floor} / ${run.totalFloors}</dd></div>` +
            `<div><dt>Battles won</dt><dd>${run.stats.battlesWon}</dd></div>` +
            `<div><dt>Scrolls learned</dt><dd>${run.stats.scrollsTaken}</dd></div>` +
            `<div class="is-reward"><dt>Account ryō earned</dt><dd>${reward ? `+${reward.ryo}` : '0'}</dd></div>` +
            '</dl>' +
            '<h2 class="tower-panel-title">Final team</h2>' +
            '<div class="tower-final-team">' + run.team.map((member) =>
                `<div class="tower-final-member">${portrait(member)}<strong>${escapeHtml(member.name)}</strong>` +
                `<div class="tower-member-scrolls">${member.scrolls.map((scroll) => scrollIcon(scroll)).join('') || '<span class="tower-muted">No scrolls</span>'}</div></div>`).join('') +
            (run.teamScrolls.length ? `<div class="tower-final-member is-team"><span class="tower-muted">Team scrolls</span><div class="tower-member-scrolls">${run.teamScrolls.map((scroll) => scrollIcon(scroll)).join('')}</div></div>` : '') +
            '</div>' +
            '<div class="tower-actions"><button type="button" class="tower-button is-primary is-large" data-new>Start a new run</button>' +
            '<a class="tower-button" href="selection.html">Back to the hub</a></div></div>';
        stage.querySelector('[data-new]').onclick = (event) => act('/start', {}, { button: event.currentTarget });
    };

    // The backdrop follows the run: the misty climb, the boss's waterfall, or the clear sky after a win.
    const sceneFor = (run) => {
        if (!run) return 'waves';
        if (run.status === 'victory') return 'victory';
        if (run.status === 'battle' && run.battle?.encounter?.kind === 'boss') return 'boss';
        if (run.floor >= 9 || run.status === 'defeated') return 'dusk';
        return 'waves';
    };

    const render = () => {
        const run = state.run;
        const statusKey = run ? `${run.runId}:${run.status}:${run.currentNodeId || ''}` : 'none';
        const entering = statusKey !== lastStatusKey;
        lastStatusKey = statusKey;
        document.body.dataset.scene = sceneFor(run);
        runMeta.hidden = !run || !ACTIVE_STATUSES.includes(run.status);
        if (run) {
            floorChip.innerHTML = `<span aria-hidden="true">塔</span> Floor ${run.floor} / ${run.totalFloors}`;
            ryoChip.innerHTML = `<span class="tower-coin" aria-hidden="true">両</span> ${run.ryo} ryō`;
            if (lastRyo !== null && run.ryo !== lastRyo && ACTIVE_STATUSES.includes(run.status)) {
                floatDelta(ryoChip, run.ryo - lastRyo, run.ryo > lastRyo ? 'gain' : 'spend');
            }
            lastRyo = run.ryo;
        }
        renderTeam();
        if (!run) renderIntro();
        else if (run.status === 'map') renderMap(run, { entering });
        else ({
            draft: renderDraft, battle: renderBattle, ramen: renderRamen, merchant: renderMerchant,
            recruit: renderRecruit, reward: renderReward,
        }[run.status] || renderEnded)(run);
        if (entering && !reduceMotion) {
            stage.querySelector('.tower-card')?.classList.add('is-entering');
        }
    };

    // ------------------------------------------------------------ tooltips
    const tip = document.createElement('div');
    tip.className = 'tower-tip';
    tip.setAttribute('role', 'tooltip');
    tip.hidden = true;
    document.body.appendChild(tip);
    const showTip = (target) => {
        const text = target.getAttribute('data-tip');
        if (!text) return;
        const [title, ...rest] = text.split('\n');
        tip.innerHTML = `<strong>${escapeHtml(title)}</strong>${rest.length ? `<span>${escapeHtml(rest.join(' '))}</span>` : ''}`;
        tip.hidden = false;
        const rect = target.getBoundingClientRect();
        const tipRect = tip.getBoundingClientRect();
        const left = Math.min(window.innerWidth - tipRect.width - 8, Math.max(8, rect.left + rect.width / 2 - tipRect.width / 2));
        const above = rect.top - tipRect.height - 8;
        tip.style.left = `${left}px`;
        tip.style.top = `${above > 8 ? above : rect.bottom + 8}px`;
    };
    const hideTip = () => { tip.hidden = true; };
    document.addEventListener('mouseover', (event) => {
        const target = event.target.closest('[data-tip]');
        if (target) showTip(target); else hideTip();
    });
    document.addEventListener('focusin', (event) => {
        const target = event.target.closest('[data-tip]');
        if (target) showTip(target); else hideTip();
    });
    document.addEventListener('focusout', hideTip);
    window.addEventListener('scroll', hideTip, { passive: true });

    // ------------------------------------------------------------ chrome
    // Broken portraits fall back to the default avatar (inline handlers are blocked by the CSP).
    document.addEventListener('error', (event) => {
        const image = event.target;
        if (image instanceof HTMLImageElement && image.classList.contains('tower-portrait') &&
            !image.src.endsWith('found-remaster.png')) {
            image.src = 'found-remaster.png';
        }
    }, true);
    pickCancel.onclick = () => { pick = null; renderTeam(); };
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && pick) { pick = null; renderTeam(); }
    });
    abandonButton.onclick = async () => {
        if (!state.run) return;
        const confirmed = await confirmAction({
            title: 'Abandon this run?',
            body: 'Your team, scrolls and run ryō are lost, and no account ryō is paid.',
            confirmLabel: 'Abandon run',
        });
        if (confirmed) act('/abandon');
    };

    window.ArenaSession.ready.then((user) => {
        if (!user) return;
        load();
    });
}());
