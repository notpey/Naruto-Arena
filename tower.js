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
    const pickSheet = document.querySelector('[data-pick-sheet]');
    const pickSheetTitle = pickSheet.querySelector('[data-pick-sheet-title]');
    const pickSheetDetail = pickSheet.querySelector('[data-pick-sheet-detail]');
    const pickSheetList = pickSheet.querySelector('[data-pick-sheet-list]');
    const pickSheetCancel = pickSheet.querySelector('[data-pick-sheet-cancel]');
    const phoneLayout = window.matchMedia('(max-width: 860px)');
    const toastEl = document.querySelector('[data-toast]');
    const confirmEl = document.querySelector('[data-confirm]');

    const NODE_META = {
        battle: { kanji: '戦', label: 'Battle', hint: 'Fight a squad. Win a Forbidden Scroll and ryō.' },
        elite: { kanji: '精', label: 'Elite', hint: 'A tougher squad with two affixes. Jōnin or Kage scrolls.' },
        boss: { kanji: '鬼', label: 'Boss', hint: 'A scripted fight that telegraphs its moves.' },
        ramen: { kanji: '麺', label: 'Ramen Stand', hint: 'Recover health before the next fight.' },
        merchant: { kanji: '商', label: 'Merchant', hint: 'Spend ryō on scrolls and medicine.' },
        recruit: { kanji: '募', label: 'Recruit', hint: 'Swap one ninja for a fresh recruit.' },
        event: { kanji: '謎', label: 'Event', hint: 'Something happens on the road. Choose how to answer it.' },
        exam: { kanji: '試', label: 'Written Exam', hint: 'Ibiki Morino\'s first exam, and its tenth question.' },
        duel: { kanji: '闘', label: 'Duel', hint: 'One of your ninjas fights alone. Losing costs that ninja a life, not the run.' },
        training: { kanji: '修', label: 'Training', hint: 'A month to train with a Leaf jōnin.' },
    };
    // Each act's merchant is someone different.
    const MERCHANT_LABEL = { 1: 'A travelling merchant', 2: 'A Leaf weapons dealer' };
    // Chakra colours match the battle screen's chakra pool.
    const CHAKRA = [
        { key: 'Taijutsu', label: 'Taijutsu', color: '#4caf50' },
        { key: 'Bloodline', label: 'Bloodline', color: '#e04545' },
        { key: 'Ninjutsu', label: 'Ninjutsu', color: '#4a7bdc' },
        { key: 'Genjutsu', label: 'Genjutsu', color: '#e8e8e8' },
    ];
    const ACTIVE_STATUSES = ['draft', 'map', 'battle', 'ramen', 'merchant', 'recruit', 'reward', 'event', 'interlude'];
    const actLabelEl = document.querySelector('[data-act-label]');
    const examChip = document.querySelector('[data-exam-chip]');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let state = { run: null, bestFloor: null };
    let busy = false;
    let pick = null; // { label, onPick(slot), disabledFor(member) }
    let selectedNodeId = null;
    let toastTimer = null;
    let lastStatusKey = '';
    let lastTeamHp = null; // previous health per slot, to float +/- changes
    let lastRyo = null;
    let draftPicks = { key: '', ids: [] }; // the candidate kept in each draft slot

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
            const wasPicking = Boolean(pick);
            pick = null;
            selectedNodeId = null;
            state = { run: data.run, bestFloor: data.bestFloor };
            render();
            if (wasPicking && phoneLayout.matches && stage.getBoundingClientRect().top < 0) {
                stage.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
            }
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

    const pairsLine = (scroll) => (scroll.pairsWith?.length ? `Pairs with ${scroll.pairsWith.join(' and ')}.` : '');

    const scrollIcon = (scroll, size = 'sm') =>
        `<span class="tower-scroll-icon is-${size} tier-${escapeHtml(scroll.tier)}" tabindex="0" ` +
        `data-tip="${escapeHtml(`${scroll.name} · ${scroll.tierLabel}\n${scroll.description} ${pairsLine(scroll)}`.trim())}">` +
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
        (pairsLine(scroll) ? `<span class="tower-scroll-pairs">${escapeHtml(pairsLine(scroll))}</span>` : '') +
        `<span class="tower-scroll-scope">${scroll.scope === 'team' ? 'Whole team' : 'Choose a ninja'}</span>` +
        footer + '</button>';

    // Ask the player to pick a ninja, then run the action. On wide screens the team panel
    // beside the stage becomes the picker; on phones a sheet opens at the bottom of the
    // screen, repeating what is being chosen and the fact that matters for each ninja.
    // detail: what the choice does. factFor(member): a short line shown per ninja.
    const startPick = ({ label, detail = '', onPick, disabledFor = () => '', factFor = null, allowDead = false }) => {
        pick = { label, detail, onPick, disabledFor, factFor, allowDead };
        renderTeam();
        if (phoneLayout.matches) {
            pickSheetList.querySelector('button:not(:disabled)')?.focus({ preventScroll: true });
            return;
        }
        teamPanel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
        teamList.querySelector('.tower-member:not(.is-disabled)')?.focus({ preventScroll: true });
    };

    const memberHp = (member) => (member.dead ? 'Dead' : `${member.hp} / ${member.maxHp} HP`);

    // Chakra Weave names one chakra type; count how many of each ninja's skills use it.
    const scrollFactFor = (scroll) => {
        const weave = /^chakra-weave:(\w+)$/.exec(scroll.key || '');
        if (!weave) return memberHp;
        const type = weave[1].toLowerCase();
        const label = CHAKRA.find((entry) => entry.key.toLowerCase() === type)?.label || weave[1];
        return (member) => {
            const count = (member.skills || []).filter((skill) =>
                (skill.energy || []).some((cost) => String(cost).toLowerCase() === type)).length;
            return `${count} ${label} skill${count === 1 ? '' : 's'} · ${memberHp(member)}`;
        };
    };

    const withScrollTarget = (scroll, action) => {
        if (scroll.scope === 'team') return action(null);
        return startPick({
            label: `Choose a ninja for ${scroll.name}`,
            detail: scroll.description,
            onPick: action,
            disabledFor: (member) => (member.scrolls.some((owned) => owned.key === scroll.key) ? 'Already learned' : ''),
            factFor: scrollFactFor(scroll),
        });
    };

    const cancelPick = () => {
        pick = null;
        renderTeam();
    };

    const renderPickSheet = () => {
        const open = Boolean(pick) && phoneLayout.matches && Boolean(state.run?.team?.length);
        pickSheet.hidden = !open;
        document.body.classList.toggle('has-pick-sheet', open);
        if (!open) return;
        pickSheetTitle.textContent = pick.label;
        pickSheetDetail.textContent = pick.detail || '';
        pickSheetDetail.hidden = !pick.detail;
        pickSheetList.innerHTML = state.run.team.map((member, slot) => {
            const reason = member.dead && !pick.allowDead ? 'Dead' : pick.disabledFor(member, slot);
            const fact = pick.factFor ? pick.factFor(member) : memberHp(member);
            return '<li><button type="button" class="tower-pick-option' + (member.dead ? ' is-dead' : '') + '" ' +
                `data-sheet-slot="${slot}" ${reason ? 'disabled' : ''}>` + portrait(member) +
                `<span class="tower-pick-option-body"><strong>${escapeHtml(member.name)}</strong>` +
                `<span>${escapeHtml(reason || fact)}</span></span></button></li>`;
        }).join('');
        pickSheetList.querySelectorAll('[data-sheet-slot]').forEach((button) => {
            button.onclick = () => pick?.onPick(Number(button.dataset.sheetSlot));
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
        renderPickSheet();
        teamList.innerHTML = team.map((member, slot) => {
            const disabled = pick ? (member.dead && !pick.allowDead ? 'Dead' : pick.disabledFor(member, slot)) : '';
            const percent = hpPercent(member);
            const tone = member.wounded ? 'is-low' : percent < 60 ? 'is-mid' : '';
            const mark = member.dead ? '死' : member.wounded ? '傷' : '';
            const stateClass = member.dead ? ' is-dead' : member.wounded ? ' is-wounded' : '';
            return `<li class="tower-member${stateClass}${disabled ? ' is-disabled' : ''}" ` +
                `data-slot="${slot}" ${pick && !disabled ? 'tabindex="0" role="button"' : ''}>` +
                `<div class="tower-member-face">${portrait(member)}${mark ? `<span class="tower-wound-mark" aria-hidden="true">${mark}</span>` : ''}</div>` +
                '<div class="tower-member-body">' +
                `<div class="tower-member-name"><strong>${escapeHtml(member.name)}</strong>` +
                (member.dead ? '<span class="tower-tag is-dead">Dead</span>'
                    : member.fallen ? '<span class="tower-tag is-fallen" tabindex="0" data-tip="Fell once this run. The next fall is permanent.">Last life</span>'
                    : member.wounded ? '<span class="tower-tag is-wounded">Wounded</span>' : '') +
                (member.stackCount && !member.dead ? `<span class="tower-tag is-stacks" tabindex="0" data-tip="Stacks this ninja carries into the next battle.">${member.stackCount} carried</span>` : '') +
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
            '<span class="tower-kicker">PvE roguelike · Act I · Land of Waves · Act II · The Chūnin Exams</span>' +
            '<h1>Climb the Tower</h1>' +
            '<p class="tower-lead">Draft a random squad, fight up ten floors of the Land of Waves, and shape your team ' +
            'with Forbidden Scrolls along the way. Beat Zabuza and you can enter the Chūnin Exams for ten floors more. ' +
            'Health, leftover chakra and stacks carry between battles. One loss ends the run.</p>' +
            '<ol class="tower-steps">' +
            '<li><span class="tower-step-mark" aria-hidden="true">選</span><div><b>Draft</b><span>Keep one of three random ninjas for each slot, then take a Jōnin or Kage starting scroll. Mission locks do not apply.</span></div></li>' +
            '<li><span class="tower-step-mark" aria-hidden="true">道</span><div><b>Choose a path</b><span>Battles, ramen stands, merchants and recruits. Floor 5 is guarded by elites.</span></div></li>' +
            '<li><span class="tower-step-mark" aria-hidden="true">巻</span><div><b>Collect scrolls</b><span>Every win offers a Forbidden Scroll. Genin, Jōnin and Kage rarities.</span></div></li>' +
            '<li><span class="tower-step-mark is-boss" aria-hidden="true">鬼</span><div><b>Face the Demon</b><span>Floor 10: Zabuza telegraphs his next move. Stun him to interrupt it.</span></div></li>' +
            '<li><span class="tower-step-mark" aria-hidden="true">試</span><div><b>The Chūnin Exams</b><span>Floors 11 to 20: the written exam, the Forest of Death, duels, and Gaara in the finals.</span></div></li>' +
            '</ol>' +
            '<p class="tower-fineprint">Survivors recover 25 health after every win. A ninja who falls is carried out at 1 health; ' +
            'a second fall is permanent. Tower battles never touch your ladder record. ' +
            'A finished run pays 15 account ryō per floor cleared, plus 150 for clearing Act I and 250 for Act II.</p>' +
            '<div class="tower-actions">' +
            '<button type="button" class="tower-button is-primary is-large" data-start>Begin the climb</button>' +
            (best ? `<span class="tower-best"><span aria-hidden="true">塔</span>Best climb: floor ${best.floor}${best.cleared ? ' · conquered' : ''}</span>` : '') +
            '</div></div>' +
            '<img class="tower-intro-render" src="kakashi-render.png" alt="">' +
            '</div>';
        stage.querySelector('[data-start]').onclick = (event) => act('/start', {}, { button: event.currentTarget });
    };

    // The draft offers three candidates per slot; the player keeps one from each.
    const renderDraft = (run) => {
        const { offers, rerolls } = run.draft;
        const offersKey = offers.map((candidates) => candidates.map((c) => c.characterId).join(',')).join('|');
        if (draftPicks.key !== offersKey) {
            // A reroll replaces one slot's candidates; keep the picks made in the other slots.
            const previous = draftPicks.ids || [];
            draftPicks = {
                key: offersKey,
                ids: offers.map((candidates, slot) =>
                    candidates.some((c) => c.characterId === previous[slot]) ? previous[slot] : null),
            };
        }
        const chosen = offers.map((candidates, slot) => candidates.find((c) => c.characterId === draftPicks.ids[slot]) || null);
        const ready = chosen.every(Boolean);
        stage.innerHTML =
            '<div class="tower-card">' +
            '<span class="tower-kicker">Draft</span><h1>Choose your squad</h1>' +
            '<p class="tower-lead">Keep one ninja from each slot. Hover or tap a skill to read it. Each slot can be rerolled once.</p>' +
            '<div class="tower-draft">' +
            offers.map((candidates, slot) =>
                `<fieldset class="tower-slot" style="--i:${slot}">` +
                `<legend class="tower-slot-head"><span class="tower-slot-mark" aria-hidden="true">${['一', '二', '三'][slot]}</span>Slot ${slot + 1}</legend>` +
                candidates.map((character) => {
                    const selected = draftPicks.ids[slot] === character.characterId;
                    return `<div class="tower-candidate${selected ? ' is-selected' : ''}" ` +
                        `data-slot="${slot}" data-id="${escapeHtml(character.characterId)}">` +
                        `<button type="button" class="tower-candidate-pick" aria-pressed="${selected}">` +
                        portrait(character) + `<strong>${escapeHtml(character.name)}</strong></button>` +
                        `<span class="tower-skills">${skillStrip(character)}</span></div>`;
                }).join('') +
                `<button type="button" class="tower-button is-quiet" data-reroll="${slot}" ${rerolls[slot] > 0 ? '' : 'disabled'}>` +
                `<span aria-hidden="true">↻</span> ${rerolls[slot] > 0 ? 'Reroll slot' : 'No rerolls left'}</button>` +
                '</fieldset>').join('') +
            '</div>' +
            '<div class="tower-draft-footer">' +
            (ready ? chakraMix(chosen) : '<p class="tower-muted">Pick a ninja in every slot to see the chakra your squad asks for.</p>') +
            `<button type="button" class="tower-button is-primary is-large" data-confirm ${ready ? '' : 'disabled'}>Take this squad</button>` +
            '</div></div>';
        stage.querySelectorAll('.tower-candidate').forEach((element) => {
            // A tap anywhere on the card picks the ninja; tapping a skill also shows its tip.
            element.addEventListener('click', () => {
                draftPicks.ids[Number(element.dataset.slot)] = element.dataset.id;
                renderDraft(run);
                stage.querySelector(`.tower-candidate[data-id="${CSS.escape(element.dataset.id)}"] .tower-candidate-pick`)?.focus();
            });
        });
        stage.querySelectorAll('[data-reroll]').forEach((button) => {
            button.onclick = () => act('/draft/reroll', { slot: Number(button.dataset.reroll) }, { button });
        });
        stage.querySelector('[data-confirm]').onclick = (event) => act('/draft', {
            picks: offers.map((candidates, slot) => candidates.findIndex((c) => c.characterId === draftPicks.ids[slot])),
        }, { button: event.currentTarget });
    };

    // What waits behind an open node: the squad and its affixes, or the trainer.
    const previewHtml = (run, node) => {
        const preview = run.previews?.[node.id];
        if (!preview) return '';
        if (preview.trainer) {
            return `<span class="tower-preview-line">${escapeHtml(preview.trainer.title)}</span>`;
        }
        const encounter = preview.encounter;
        if (!encounter) return '';
        const facts = [
            ...encounter.affixes.map((affix) => `<span class="tower-preview-chip is-affix" tabindex="0" data-tip="${escapeHtml(`${affix.name}\n${affix.description}`)}">${escapeHtml(affix.name)}</span>`),
            encounter.carries ? `<span class="tower-preview-chip is-${escapeHtml(encounter.carries)}">${encounter.carries === 'heaven' ? '天 Heaven scroll' : '地 Earth scroll'}</span>` : '',
        ].join('');
        return '<span class="tower-preview">' +
            `<span class="tower-preview-name">${escapeHtml(encounter.name)}</span>` +
            '<span class="tower-preview-enemies">' + encounter.enemies.map((enemy) =>
                `<span class="tower-preview-enemy" tabindex="0" data-tip="${escapeHtml(`${enemy.name}\n${enemy.hp} health`)}">${portrait(enemy)}<b>${enemy.hp}</b></span>`).join('') +
            '</span>' + (facts ? `<span class="tower-preview-facts">${facts}</span>` : '') + '</span>';
    };

    const renderMap = (run, { entering = false } = {}) => {
        // Only the current act's floors are drawn; earlier acts are finished.
        const actRange = run.act || { firstFloor: 1, lastFloor: run.totalFloors };
        const floors = run.map.floors.filter((floor) => floor[0] &&
            floor[0].floor >= actRange.firstFloor && floor[0].floor <= actRange.lastFloor);
        const firstFloor = floors[0]?.[0]?.floor || 1;
        const rowOf = (floor) => floor - firstFloor + 1;
        const floorNodes = (floor) => floors[rowOf(floor) - 1] || [];
        const available = new Set(run.availableNodeIds);
        const path = run.path || [];
        const taken = new Set(path);
        const takenEdges = new Set(path.slice(1).map((id, index) => `${path[index]}>${id}`));
        const rowHeight = 54;
        const height = floors.length * rowHeight;
        const position = (node) => ({
            x: floorNodes(node.floor).length === 1 ? 50 : ((node.lane + 0.5) / 3) * 100,
            y: height - ((rowOf(node.floor) - 0.5) * rowHeight),
        });
        const lines = floors.flatMap((floor) => floor.flatMap((node) => node.next.map((nextId) => {
            const nextNode = floorNodes(node.floor + 1).find((entry) => entry.id === nextId);
            if (!nextNode) return '';
            const from = position(node);
            const to = position(nextNode);
            const isTaken = takenEdges.has(`${node.id}>${nextId}`);
            const isLive = node.id === run.currentNodeId && available.has(nextId);
            return `<line x1="${from.x}%" y1="${from.y}" x2="${to.x}%" y2="${to.y}" class="${isTaken ? 'is-taken' : isLive ? 'is-live' : ''}"/>`;
        }))).join('');
        const nextFloor = run.floor + 1;
        const band = nextFloor >= firstFloor && rowOf(nextFloor) <= floors.length
            ? `<span class="tower-floor-band" style="top:${height - rowOf(nextFloor) * rowHeight}px;height:${rowHeight}px"></span>` : '';
        const nodes = floors.flat().map((node) => {
            const meta = NODE_META[node.type] || NODE_META.event;
            const { x, y } = position(node);
            const isAvailable = available.has(node.id);
            const classes = ['tower-node', `type-${node.type}`,
                isAvailable ? 'is-available' : '', taken.has(node.id) ? 'is-visited' : '',
                !taken.has(node.id) && node.floor <= run.floor ? 'is-skipped' : '',
                node.id === run.currentNodeId ? 'is-current' : '', node.id === selectedNodeId ? 'is-selected' : '']
                .filter(Boolean).join(' ');
            const boss = node.type === 'boss' ? run.bosses?.[node.bossId] || run.boss : null;
            const face = boss?.leader?.facePicture
                ? `<img src="${escapeHtml(boss.leader.facePicture)}" alt="">` : `<span aria-hidden="true">${meta.kanji}</span>`;
            const label = boss ? boss.name : meta.label;
            return `<button type="button" class="${classes}" style="left:${x}%;top:${y}px" data-node="${node.id}" ` +
                `data-tip="${escapeHtml(`Floor ${node.floor} · ${label}\n${boss?.title || meta.hint}`)}" ` +
                `${isAvailable ? '' : 'disabled'} aria-label="Floor ${node.floor}: ${escapeHtml(label)}${isAvailable ? ', available' : ''}">${face}</button>`;
        }).join('');
        const selected = selectedNodeId ? floors.flat().find((node) => node.id === selectedNodeId) : null;
        const selectedMeta = selected ? NODE_META[selected.type] || NODE_META.event : null;
        const selectedBoss = selected?.type === 'boss' ? run.bosses?.[selected.bossId] : null;
        const legendTypes = [...new Set(floors.flat().map((node) => node.type))];
        const remaining = run.totalFloors - run.floor;
        stage.innerHTML =
            '<div class="tower-card tower-map-card">' +
            `<div class="tower-map-head"><div><span class="tower-kicker">${run.floor >= firstFloor
                ? `Floor ${run.floor} cleared · ${remaining} to go` : `${escapeHtml(run.act?.name || 'Act I')} begins`}` +
            `${run.stage ? ` · ${escapeHtml(run.stage)}` : ''}</span>` +
            '<h1>Choose your path</h1></div>' +
            '<ul class="tower-legend">' + legendTypes.map((type) => NODE_META[type] ?
                `<li class="type-${type}"><span aria-hidden="true">${NODE_META[type].kanji}</span>${NODE_META[type].label}</li>` : '').join('') + '</ul></div>' +
            `<div class="tower-map" style="height:${height}px">${band}` +
            `<svg class="tower-map-lines" width="100%" height="${height}" aria-hidden="true">${lines}</svg>` +
            floors.map((floor) => {
                const number = floor[0].floor;
                return `<span class="tower-floor-label${number === nextFloor ? ' is-next' : ''}" style="top:${height - (rowOf(number) - 0.5) * rowHeight}px">${number}</span>`;
            }).join('') +
            nodes + '</div>' +
            `<div class="tower-node-detail${selected ? ' has-selection' : ''}">${selected
                ? `<span class="tower-detail-mark type-${selected.type}" aria-hidden="true">${selectedMeta.kanji}</span>` +
                  `<div><strong>Floor ${selected.floor} · ${escapeHtml(selectedBoss?.name || selectedMeta.label)}</strong>` +
                  `<span>${escapeHtml(selectedBoss?.title || selectedMeta.hint)}</span>${previewHtml(run, selected)}</div>` +
                  '<button type="button" class="tower-button is-primary" data-go>Go</button>'
                : '<span class="tower-muted">Pick a glowing node to continue the climb. Open battles show who waits there.</span>'}</div>` +
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

    let championSlot = null; // the ninja picked for a duel before entering it

    const enterBattle = (button, body = {}) => act('/battle', body, {
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
        const kindLabel = encounter.kind === 'boss' ? 'Boss' : encounter.kind === 'elite' ? 'Elite'
            : encounter.kind === 'duel' ? 'Duel' : 'Battle';
        const kindMark = encounter.kind === 'boss' ? '鬼' : encounter.kind === 'elite' ? '精'
            : encounter.kind === 'duel' ? '闘' : '戦';
        const boss = encounter.boss;
        const duel = Boolean(encounter.duel);
        const team = run.team || [];
        if (!duel || matchId) championSlot = null;
        else if (championSlot !== null && team[championSlot]?.dead) championSlot = null;
        if (duel && !matchId && championSlot === null) {
            // Default to the healthiest living ninja; the player can change it.
            let best = -1;
            team.forEach((member, slot) => {
                if (!member.dead && (best < 0 || member.hp > team[best].hp)) best = slot;
            });
            championSlot = best >= 0 ? best : null;
        }
        const championPicker = duel && !matchId
            ? '<fieldset class="tower-champions"><legend>Choose your champion</legend>' +
              team.map((member, slot) => `<button type="button" class="tower-champion${slot === championSlot ? ' is-selected' : ''}" ` +
                  `data-champion="${slot}" aria-pressed="${slot === championSlot}" ${member.dead ? 'disabled' : ''}>` +
                  portrait(member) + `<strong>${escapeHtml(member.name)}</strong>` +
                  `<span>${member.dead ? 'Dead' : `${member.hp} / ${member.maxHp} HP${member.fallen ? ' · last life' : ''}`}</span></button>`).join('') +
              '</fieldset>'
            : '';
        stage.innerHTML =
            `<div class="tower-card tower-battle is-${escapeHtml(encounter.kind)}">` +
            '<div class="tower-battle-head">' +
            `<span class="tower-battle-seal" aria-hidden="true">${kindMark}</span>` +
            `<div><span class="tower-kicker">Floor ${encounter.floor} · ${kindLabel}${boss ? ` · ${escapeHtml(boss.title.split('—').pop().trim())}` : ''}</span>` +
            `<h1>${escapeHtml(encounter.name)}</h1>` +
            (boss ? `<p class="tower-lead">${escapeHtml(boss.intro)}</p>`
                : encounter.blurb ? `<p class="tower-lead">${escapeHtml(encounter.blurb)}</p>` : '') + '</div></div>' +
            '<div class="tower-enemies">' + encounter.enemies.map((enemy, index) =>
                `<div class="tower-enemy${boss && index === 0 ? ' is-leader' : ''}" style="--i:${index}">` + portrait(enemy) +
                `<strong>${escapeHtml(enemy.name)}</strong>` +
                `<span class="tower-enemy-hp${enemy.hp > 100 ? ' is-boosted' : ''}">${enemy.hp} HP</span>` +
                `<div class="tower-skills">${skillStrip(enemy)}</div></div>`).join('') +
            '</div>' +
            '<ul class="tower-encounter-facts">' +
            encounter.affixes.map((affix) => `<li><span class="tower-fact-mark is-affix" aria-hidden="true">${escapeHtml(affix.kanji || '!')}</span><span><b>${escapeHtml(affix.name)}</b> ${escapeHtml(affix.description)}</span></li>`).join('') +
            (boss ? boss.mechanics.map((line) => `<li><span class="tower-fact-mark is-boss" aria-hidden="true">鬼</span>${escapeHtml(line)}</li>`).join('') : '') +
            (encounter.carries
                ? `<li><span class="tower-fact-mark is-${escapeHtml(encounter.carries)}" aria-hidden="true">${encounter.carries === 'heaven' ? '天' : '地'}</span>` +
                  `<span><b>${encounter.carries === 'heaven' ? 'Heaven' : 'Earth'} scroll</b> This squad carries it. Win to take it.</span></li>` : '') +
            (duel && !boss
                ? '<li><span class="tower-fact-mark" aria-hidden="true">闘</span><span><b>Duel</b> One ninja fights; the others watch and rest. Both fighters gain 1 extra chakra a turn. Losing costs your champion a life, not the run.</span></li>' : '') +
            (!boss && !duel && encounter.hpMultiplier <= 1 && !encounter.affixes.length
                ? '<li><span class="tower-fact-mark" aria-hidden="true">戦</span>A plain squad. Win to claim a scroll.</li>' : '') +
            '</ul>' +
            championPicker +
            '<div class="tower-battle-foot">' +
            '<span class="tower-muted">The battle starts when you enter, and your first turn timer starts with it.</span>' +
            `<button type="button" class="tower-button is-primary is-large" data-fight ${duel && !matchId && championSlot === null ? 'disabled' : ''}>` +
            `${matchId ? 'Return to battle' : duel ? 'Enter the arena' : 'Enter battle'}</button>` +
            '</div></div>';
        stage.querySelectorAll('[data-champion]').forEach((button) => {
            button.onclick = () => {
                championSlot = Number(button.dataset.champion);
                renderBattle(run);
                stage.querySelector(`[data-champion="${championSlot}"]`)?.focus();
            };
        });
        stage.querySelector('[data-fight]').onclick = (event) => enterBattle(event.currentTarget,
            duel && !matchId ? { slot: championSlot } : {});
    };

    // An event: a short scene and a choice. Options that need a ninja open the picker.
    const renderEvent = (run) => {
        const event = run.event;
        if (!event) return renderEnded(run);
        stage.innerHTML =
            `<div class="tower-card tower-event is-${escapeHtml(event.pool)}">` +
            '<div class="tower-event-head">' +
            `<span class="tower-event-seal" aria-hidden="true">${escapeHtml(event.kanji)}</span>` +
            `<div><span class="tower-kicker">Floor ${run.floor + 1}${run.stage ? ` · ${escapeHtml(run.stage)}` : ''}${event.speaker ? ` · ${escapeHtml(event.speaker)}` : ''}</span>` +
            `<h1>${escapeHtml(event.title)}</h1></div></div>` +
            `<p class="tower-lead tower-event-text">${escapeHtml(event.text)}</p>` +
            '<div class="tower-choices">' + event.options.map((option, index) =>
                `<button type="button" class="tower-choice" data-option="${escapeHtml(option.id)}" style="--i:${index}" ${option.blocked ? 'disabled' : ''}>` +
                `<strong>${escapeHtml(option.label)}</strong>` +
                `<span>${escapeHtml(option.description)}</span>` +
                (option.cost ? `<span class="tower-price${option.cost > run.ryo ? ' is-short' : ''}">${option.cost} ryō</span>` : '') +
                (option.blocked ? `<span class="tower-choice-blocked">${escapeHtml(option.blocked)}</span>` : '') +
                '</button>').join('') + '</div></div>';
        stage.querySelectorAll('[data-option]').forEach((button) => {
            button.onclick = () => {
                const option = event.options.find((entry) => entry.id === button.dataset.option);
                if (!option.needsSlot) return act('/event', { optionId: option.id }, { button });
                return startPick({
                    label: option.label,
                    detail: option.description,
                    disabledFor: (member, slot) => option.slotReasons?.[slot] || '',
                    onPick: (slot) => act('/event', { optionId: option.id, slot }),
                });
            };
        });
    };

    // Between acts: continue the climb, or retire with what has been earned.
    const renderInterlude = (run) => {
        const next = run.interlude;
        stage.innerHTML =
            '<div class="tower-card tower-interlude">' +
            `<span class="tower-kicker">${escapeHtml(run.act?.name || 'Act I')} cleared · ${escapeHtml(run.act?.title || '')}</span>` +
            '<h1>The bridge is finished</h1>' +
            '<p class="tower-lead">Gatō is gone and the Land of Waves is free. Back in Konoha, Kakashi hands you three application forms. ' +
            '"I nominated you for the Chūnin Exams. You don\'t have to take them."</p>' +
            (next ? '<ol class="tower-steps">' +
                '<li><span class="tower-step-mark" aria-hidden="true">試</span><div><b>The written exam</b><span>Ibiki\'s ten questions. The tenth is the real test.</span></div></li>' +
                '<li><span class="tower-step-mark" aria-hidden="true">森</span><div><b>The Forest of Death</b><span>Take a Heaven and an Earth scroll from rival teams. Something else hunts in the trees.</span></div></li>' +
                '<li><span class="tower-step-mark" aria-hidden="true">闘</span><div><b>Preliminaries and finals</b><span>One-on-one duels. Pick your champion for each bout.</span></div></li>' +
                '<li><span class="tower-step-mark is-boss" aria-hidden="true">砂</span><div><b>The final bout</b><span>Gaara of the Desert, floor 20.</span></div></li>' +
                '</ol>' : '') +
            '<p class="tower-fineprint">Continuing returns every living ninja to full health and gives back their last life. ' +
            'Retiring ends the run now and pays its account ryō.</p>' +
            '<div class="tower-actions">' +
            `<button type="button" class="tower-button is-primary is-large" data-continue>${next ? `Enter ${escapeHtml(next.title)}` : 'Continue'}</button>` +
            '<button type="button" class="tower-button" data-retire>Retire</button></div></div>';
        stage.querySelector('[data-continue]').onclick = (event) => act('/continue', { choice: 'continue' }, { button: event.currentTarget });
        stage.querySelector('[data-retire]').onclick = async (event) => {
            const button = event.currentTarget;
            const confirmed = await confirmAction({
                title: 'Retire after Act I?',
                body: 'The run ends here and pays its account ryō. You cannot continue into the Chūnin Exams later.',
                confirmLabel: 'Retire',
            });
            if (confirmed) act('/continue', { choice: 'retire' }, { button });
        };
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
            label: 'Choose a ninja to rest',
            detail: 'They recover to full health.',
            onPick: (slot) => act('/ramen', { option: 'rest', slot }),
            disabledFor: (member) => (member.hp >= member.maxHp ? 'Full health' : ''),
        });
    };

    const renderMerchant = (run) => {
        const stock = run.merchant.stock;
        stage.innerHTML =
            `<div class="tower-card"><span class="tower-kicker">Merchant</span><h1>${escapeHtml(MERCHANT_LABEL[run.act?.act] || MERCHANT_LABEL[1])}</h1>` +
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
                    label: `Choose who ${offer.name} replaces`,
                    detail: `${offer.name} arrives at full health and inherits the departing ninja's scrolls.`,
                    factFor: (member) => `${memberHp(member)} · ${member.scrolls.length} scroll${member.scrolls.length === 1 ? '' : 's'}`,
                    onPick: (slot) => act('/recruit', { offerIndex: Number(button.dataset.recruit), slot }),
                    allowDead: true,
                });
            };
        });
        stage.querySelector('[data-leave]').onclick = (event) => act('/leave', {}, { button: event.currentTarget });
    };

    const renderReward = (run) => {
        stage.innerHTML =
            (run.reward.starting
                // Before the first fight: a starting scroll from the Hokage's vault.
                ? '<div class="tower-card tower-reward is-starting"><span class="tower-kicker">Before the climb</span>' +
                  '<h1>Choose a starting scroll</h1>' +
                  '<p class="tower-lead">Someone "borrowed" the Scroll of Seals again. Before anyone notices, copy one technique for the road. ' +
                  `Choose one, or skip it for ${run.constants.skipScrollRyo} ryō.</p>`
                // Rewards from events (the tenth question, Jiraiya) pay no ryō and are not victories.
                : `<div class="tower-card tower-reward"><span class="tower-kicker">${run.reward.ryoGained ? 'Victory' : 'Reward'} · Floor ${run.floor + (run.reward.ryoGained ? 0 : 1)}</span><h1>Claim a Forbidden Scroll</h1>` +
                  `<p class="tower-lead">${run.reward.ryoGained ? `<b class="tower-ryo-inline">+${run.reward.ryoGained} ryō</b> earned. ` : ''}Choose one scroll, or skip it for ${run.constants.skipScrollRyo} more ryō.</p>`) +
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
        const actsCleared = Math.max(Number(run.stats?.actsCleared) || 0, run.status === 'victory' ? 1 : 0);
        const finalsInterrupted = run.status === 'victory' && actsCleared >= 2;
        const titles = {
            victory: finalsInterrupted ? 'The finals are interrupted' : 'Tower conquered',
            defeated: 'The climb ends',
            abandoned: 'Run abandoned',
        };
        const art = run.status === 'victory' ? 'battle-victory.png' : 'battle-defeat.png';
        const reward = run.accountReward;
        const kicker = run.status === 'victory'
            ? (finalsInterrupted ? 'Act II cleared · The Chūnin Exams' : 'Act I cleared · Retired')
            : `Reached floor ${run.floor} of ${run.totalFloors}`;
        stage.innerHTML =
            `<div class="tower-card tower-ended is-${escapeHtml(run.status)}">` +
            '<div class="tower-ended-head">' +
            `<img class="tower-ended-art" src="${art}" alt="">` +
            '<div>' +
            `<span class="tower-kicker">${escapeHtml(kicker)}</span>` +
            `<h1>${titles[run.status] || 'Run over'}</h1>` +
            (finalsInterrupted
                ? '<p class="tower-lead">Feathers drift over the stadium and the crowd falls asleep. Sand and Sound shinobi pour over the walls. ' +
                  `<b>${escapeHtml(run.nextActTeaser || 'Act III is coming.')}</b></p>` : '') +
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
    // Act II: the exam hall, the forest's green gloom, then the stadium.
    const sceneFor = (run) => {
        if (!run) return 'waves';
        if (run.status === 'victory') return 'victory';
        if (run.status === 'battle' && run.battle?.encounter?.kind === 'boss') return 'boss';
        if (run.status === 'defeated') return 'dusk';
        if ((run.act?.act || 1) >= 2) {
            const next = run.floor + 1;
            if (next >= 12 && next <= 15) return 'forest';
            return 'konoha';
        }
        if (run.floor >= 9) return 'dusk';
        return 'waves';
    };

    const render = () => {
        const run = state.run;
        const statusKey = run ? `${run.runId}:${run.status}:${run.currentNodeId || ''}` : 'none';
        const entering = statusKey !== lastStatusKey;
        lastStatusKey = statusKey;
        document.body.dataset.scene = sceneFor(run);
        runMeta.hidden = !run || !ACTIVE_STATUSES.includes(run.status);
        if (actLabelEl) {
            actLabelEl.textContent = run?.act ? `${run.act.name} · ${run.act.title}` : 'Act I · Land of Waves';
        }
        const exam = run && ACTIVE_STATUSES.includes(run.status) ? run.examScrolls : null;
        examChip.hidden = !exam;
        if (exam) {
            examChip.innerHTML = `<span class="${exam.heaven ? 'is-held' : ''}">天 ${exam.heaven}</span>` +
                `<span class="${exam.earth ? 'is-held' : ''}">地 ${exam.earth}</span>`;
        }
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
            recruit: renderRecruit, reward: renderReward, event: renderEvent, interlude: renderInterlude,
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
    pickCancel.onclick = cancelPick;
    pickSheetCancel.onclick = cancelPick;
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && pick) cancelPick();
    });
    // Rotating or resizing across the phone breakpoint moves an open pick between sheet and panel.
    phoneLayout.addEventListener('change', () => { if (pick) renderTeam(); });
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
