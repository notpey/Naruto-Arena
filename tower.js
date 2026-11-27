// The Tower page: a screen of the game. It sends the player's choices to /api/tower and
// renders the run the server returns; every outcome (offers, healing, fusion, battles) is
// decided there. Every screen is the same board: a floor header over a row of postings,
// with the team column beside it once there is a team.
(function () {
    'use strict';

    const stageRoot = document.querySelector('[data-stage-root]');
    const bodyEl = document.querySelector('[data-body]');
    const fusionEl = document.querySelector('[data-fusion]');
    const abandonButton = document.querySelector('[data-abandon]');
    const compendiumButton = document.querySelector('[data-compendium]');
    const toastEl = document.querySelector('[data-toast]');
    const confirmEl = document.querySelector('[data-confirm]');
    const replaceEl = document.querySelector('[data-replace]');
    const compendiumEl = document.querySelector('[data-compendium-dialog]');
    const sheet = document.querySelector('[data-pick-sheet]');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ACTIVE = ['draft', 'map', 'battle', 'ramen', 'merchant', 'recruit', 'reward', 'event', 'interlude', 'fusion'];
    const NODES = {
        battle: { kanji: '戦', label: 'Battle', hint: 'A squad blocks the stairs. Win an augment and ryō.', verb: 'Fight' },
        elite: { kanji: '精', label: 'Elite', hint: 'A tougher squad. Better augments, more ryō.', verb: 'Fight' },
        miniboss: { kanji: '将', label: 'Champion', hint: 'The champion guarding this stretch of the Tower.', verb: 'Fight' },
        boss: { kanji: '鬼', label: 'Boss', hint: 'Telegraphs each technique a turn ahead.', verb: 'Face the boss', tone: 'is-boss' },
        duel: { kanji: '闘', label: 'Duel', hint: 'One of your ninjas fights alone.', verb: 'Choose a champion' },
        ramen: { kanji: '麺', label: 'Ramen Stand', hint: 'Recover health before the next fight.', verb: 'Rest', tone: 'is-rest' },
        fusion: { kanji: '麺', label: 'Ramen Stand', hint: 'Recover health before the next fight.', verb: 'Rest', tone: 'is-rest' },
        merchant: { kanji: '商', label: 'Merchant', hint: 'Spend ryō on augments and medicine.', verb: 'Browse', tone: 'is-shop' },
        recruit: { kanji: '募', label: 'Recruit', hint: 'Swap one ninja for a fresh one.', verb: 'Visit', tone: 'is-shop' },
        event: { kanji: '謎', label: 'Event', hint: 'Something happens on the road.', verb: 'Go', tone: 'is-event' },
        exam: { kanji: '試', label: 'Written Exam', hint: 'Ibiki Morino\'s first exam.', verb: 'Go', tone: 'is-event' },
        training: { kanji: '修', label: 'Training', hint: 'A month to train with a Leaf jōnin.', verb: 'Train', tone: 'is-event' },
    };
    const QUICK_FIGHT = new Set(['battle', 'elite', 'miniboss']);
    const CHAKRA = { Taijutsu: '#4caf50', Bloodline: '#e04545', Ninjutsu: '#4a7bdc', Genjutsu: '#e8e8e8' };
    const TIER_LABEL = { common: 'Common', rare: 'Rare', forbidden: 'Forbidden', prismatic: 'Prismatic' };
    const REROLL_ICON = '<svg class="tw-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.34-5.66"/><path d="M20 4v5h-5"/></svg>';

    let state = { run: null, bestFloor: null };
    let busy = false;
    let pick = null; // { label, detail, onPick(slot), disabledFor(member, slot), allowDead }
    let draftIds = { key: '', ids: [] };
    let championSlot = null;
    let chosenMode = 'standard';
    let catalog = null;
    let lastKey = '';
    let toastTimer = null;

    // ------------------------------------------------------------ helpers
    const e = (value) => String(value ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const isStd = (run) => run?.mode === 'standard';
    const noun = (run, plural) => (isStd(run) ? (plural ? 'augments' : 'augment') : (plural ? 'scrolls' : 'scroll'));
    const portrait = (character, cls = 'tw-portrait') =>
        `<img class="${cls}" src="${e(character.facePicture || 'found-remaster.png')}" alt="${e(character.name)}">`;
    const tip = (title, text) => `data-tip="${e(`${title}\n${text || ''}`.trim())}"`;
    // Inside a pickable member row (itself a button) the icons must not be buttons.
    const augIcon = (scroll, plain = false) => `<${plain ? 'span' : 'button type="button"'} class="tw-aug tier-${e(scroll.tier)}" ${tip(`${scroll.name} · ${scroll.tierLabel}`, scroll.description)}>` +
        `<img src="${e(scroll.icon)}" alt="${e(scroll.name)}"></${plain ? 'span' : 'button'}>`;
    const skillStrip = (character, limit = 4) => `<span class="tw-skills">${(character.skills || []).slice(0, limit).map((skill) =>
        `<img src="${e(skill.skillimage)}" alt="${e(skill.name)}" tabindex="0" ${tip(skill.name, skill.skilldescription)}>`).join('')}</span>`;

    const showToast = (message, tone = 'info') => {
        toastEl.textContent = message;
        toastEl.dataset.tone = tone;
        toastEl.hidden = false;
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

    const act = async (path, body = {}, { button, onSuccess } = {}) => {
        if (busy) return;
        busy = true;
        document.body.classList.add('is-busy');
        button?.classList.add('is-loading');
        try {
            const data = await api(path, body);
            pick = null;
            state = { run: data.run, bestFloor: data.bestFloor };
            render();
            if (onSuccess) await onSuccess(data);
        } catch (error) {
            showToast(error.message, 'error');
            if (/changed/.test(error.message)) load();
        } finally {
            busy = false;
            document.body.classList.remove('is-busy');
            button?.classList.remove('is-loading');
        }
    };

    const load = async () => {
        try {
            const data = await api('/run');
            state = { run: data.run, bestFloor: data.bestFloor };
            render();
        } catch (error) {
            bodyEl.className = 'tw-body';
            bodyEl.innerHTML = `<div class="tw-board tw-error"><p>${e(error.message)}</p>` +
                '<button type="button" class="tw-button is-primary" data-retry>Try again</button></div>';
            bodyEl.querySelector('[data-retry]').onclick = load;
        }
    };

    const confirmAction = ({ title, body, confirmLabel, cancelLabel = 'Keep climbing' }) => new Promise((resolve) => {
        confirmEl.querySelector('[data-confirm-title]').textContent = title;
        confirmEl.querySelector('[data-confirm-body]').textContent = body;
        const ok = confirmEl.querySelector('[data-confirm-ok]');
        const cancel = confirmEl.querySelector('[data-confirm-cancel]');
        ok.textContent = confirmLabel;
        cancel.textContent = cancelLabel;
        const close = (result) => { confirmEl.close(); ok.onclick = null; cancel.onclick = null; resolve(result); };
        ok.onclick = () => close(true);
        cancel.onclick = () => close(false);
        confirmEl.oncancel = (event) => { event.preventDefault(); close(false); };
        confirmEl.showModal();
        cancel.focus();
    });

    // ------------------------------------------------------------ fitting the stage
    // Desktop: the 1100x800 stage scales to the window and the page never scrolls.
    // Phones and narrow windows: the stage reflows into a stacked page.
    const fit = () => {
        const width = document.documentElement.clientWidth;
        const height = document.documentElement.clientHeight;
        const compact = width < 760 || (width < 1000 && height > width);
        document.body.classList.toggle('tw-compact', compact);
        const scale = compact ? 1 : Math.min(1, width / 1100, height / 800);
        document.documentElement.style.setProperty('--tw-scale', String(scale));
    };

    // ------------------------------------------------------------ shared pieces
    // The floor header: big floor number (or a seal), a title and a line, and a side.
    const head = ({ floor = null, total = null, seal = null, sealTone = '', title, sub = '', side = '', pips = '' }) =>
        '<header class="tw-board tw-head">' +
        (floor !== null
            ? `<div class="tw-floor">${floor}<small>/ ${total}</small></div>`
            : `<span class="tw-seal-big ${sealTone}" aria-hidden="true">${e(seal || '塔')}</span>`) +
        `<div class="tw-title"><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ''}${pips}</div>` +
        `<div class="tw-head-side">${side}</div></header>`;

    const posting = ({ art = '', seal = '', sealTone = '', boss = false, tone = '', title, kind = '', kindClass = '', body = '', foot = '', attrs = '' }) =>
        `<article class="tw-board tw-posting${boss ? ' is-boss' : ''}${tone ? ` ${tone}` : ''}" ${attrs}>` +
        `<div class="tw-posting-art">${art}${seal ? `<span class="tw-seal ${sealTone}" aria-hidden="true">${e(seal)}</span>` : ''}</div>` +
        `<div class="tw-posting-body"><h2>${title}</h2>${kind ? `<span class="tw-posting-kind ${kindClass}">${kind}</span>` : ''}` +
        `${body}<div class="tw-posting-foot">${foot}</div></div></article>`;

    const fusionNote = (scroll) => (scroll.fusion
        ? `<p class="tw-fuse-note">Fuses with <b>${e(scroll.fusion.partner)}</b> into <b>${e(scroll.fusion.name)}</b></p>` : '');

    const scrollPosting = (scroll, { foot, attrs = '' }) => posting({
        art: `<img class="tw-art-icon tier-${e(scroll.tier)}" src="${e(scroll.icon)}" alt="">`,
        title: e(scroll.name),
        kind: `${e(scroll.tierLabel)} · ${scroll.scope === 'team' ? 'whole team' : scroll.eligibleCharacterIds ? 'character augment' : 'one ninja'}`,
        kindClass: `tier-${e(scroll.tier)}`,
        body: `<p class="tw-posting-text" tabindex="0" ${tip(scroll.name, scroll.description)}>${e(scroll.description)}</p>${fusionNote(scroll)}`,
        foot,
        attrs,
    });

    // ------------------------------------------------------------ team column
    const memberRow = (member, slot, { pickable = false, reason = '' } = {}) => {
        const percent = member.dead ? 0 : Math.max(0, Math.min(100, Math.round((member.hp / member.maxHp) * 100)));
        const status = member.dead ? '<span class="tw-state is-dead">Dead</span>'
            : member.fallen ? `<span class="tw-state is-fallen" ${tip('Last life', 'Fell once this run. The next fall is permanent.')} tabindex="0">Last life</span>` : '';
        const tag = pickable ? 'button type="button"' : 'div';
        return `<li><${tag} class="tw-member${member.dead ? ' is-dead' : ''}${pickable ? ' is-pickable' : ''}${reason ? ' is-blocked' : ''}" ` +
            `data-slot="${slot}" ${reason ? 'aria-disabled="true"' : ''}>` +
            `<span class="tw-face">${portrait(member)}</span>` +
            `<span><span class="tw-member-name"><b>${e(member.name)}</b>${status}</span>` +
            `<span class="tw-hp${member.dead ? ' is-dead' : member.wounded ? ' is-low' : ''}" role="img" aria-label="${member.dead ? 'Dead' : `${member.hp} of ${member.maxHp} health`}">` +
            `<i style="width:${percent}%"></i><span>${member.dead ? 'Dead' : `${member.hp} / ${member.maxHp}`}</span></span>` +
            `<span class="tw-icons">${reason ? `<span class="tw-none">${e(reason)}</span>` : member.scrolls.map((scroll) => augIcon(scroll, pickable)).join('')}</span></span>` +
            `</${pickable ? 'button' : 'div'}></li>`;
    };

    const teamColumn = (run) => {
        const capacity = isStd(run) ? run.standard?.capacity?.team : null;
        const team = run.team || [];
        const picking = Boolean(pick);
        const rows = team.map((member, slot) => {
            const reason = picking ? (member.dead && !pick.allowDead ? 'Dead' : pick.disabledFor(member, slot)) : '';
            return memberRow(member, slot, { pickable: picking && !reason, reason });
        }).join('');
        const chakra = run.chakra ? Object.values(run.chakra).reduce((sum, amount) => sum + amount, 0) : 0;
        return '<aside class="tw-board tw-team" aria-label="Your team">' +
            (picking ? `<div class="tw-pickbar"><span>${e(pick.label)}</span><button type="button" data-pick-cancel>Cancel</button></div>`
                : '<h2 class="tw-label">Your team</h2>') +
            `<ul class="tw-members">${rows}</ul>` +
            `<h2 class="tw-label">Team ${noun(run, true)}${capacity ? ` <b class="${capacity.full ? 'is-full' : ''}">${capacity.used} / ${capacity.max}</b>` : ''}</h2>` +
            `<ul class="tw-auglist">${(run.teamScrolls || []).map((scroll) => `<li><button type="button" class="tw-augrow tier-${e(scroll.tier)}" data-key="${e(scroll.key)}" ` +
                `${tip(`${scroll.name} · ${scroll.tierLabel}`, scroll.description)}><img src="${e(scroll.icon)}" alt=""><span>${e(scroll.name)}</span></button></li>`).join('') ||
                '<li class="tw-none">None yet</li>'}</ul>` +
            `<div class="tw-purse"><strong>${run.ryo} ryō</strong>` +
            `<span>Chakra carried: ${chakra}${isStd(run) ? ` / ${run.standard.chakraCarryCap}` : ''}</span></div>` +
            '</aside>';
    };

    const startPick = ({ label, detail = '', onPick, disabledFor = () => '', allowDead = false }) => {
        pick = { label, detail, onPick, disabledFor, allowDead };
        render();
        const first = document.body.classList.contains('tw-compact')
            ? sheet.querySelector('button.tw-member') : bodyEl.querySelector('.tw-member.is-pickable');
        first?.focus({ preventScroll: true });
    };
    const cancelPick = () => { pick = null; render(); };

    const renderSheet = (run) => {
        const open = Boolean(pick) && document.body.classList.contains('tw-compact');
        sheet.hidden = !open;
        document.body.classList.toggle('has-sheet', open);
        if (!open) return;
        sheet.querySelector('[data-pick-sheet-title]').textContent = pick.label;
        sheet.querySelector('[data-pick-sheet-detail]').textContent = pick.detail;
        sheet.querySelector('[data-pick-sheet-list]').innerHTML = run.team.map((member, slot) => {
            const reason = member.dead && !pick.allowDead ? 'Dead' : pick.disabledFor(member, slot);
            return memberRow(member, slot, { pickable: !reason, reason });
        }).join('');
        sheet.querySelectorAll('button.tw-member').forEach((button) => {
            button.onclick = () => pick?.onPick(Number(button.dataset.slot));
        });
    };

    // A scroll that binds to one ninja asks which; full Standard slots ask what to salvage.
    const askReplacement = (scroll, slot, action) => {
        const run = state.run;
        const capacity = isStd(run) && !scroll.fusion
            ? (scroll.scope === 'team' ? run.standard.capacity.team : run.standard.capacity.ninja[slot]) : null;
        if (!capacity?.full) return action(slot, null);
        const held = (scroll.scope === 'team' ? run.teamScrolls : run.team[slot].scrolls).filter((owned) => !(owned.tags || []).includes('cursed'));
        replaceEl.querySelector('[data-replace-title]').textContent = 'Slots are full';
        replaceEl.querySelector('[data-replace-body]').textContent =
            `Salvage one for ${run.constants.salvageRyo} ryō to make room for ${scroll.name}.`;
        const list = replaceEl.querySelector('[data-replace-list]');
        list.innerHTML = held.map((owned) => `<li><button type="button" data-key="${e(owned.key)}">` +
            `<img src="${e(owned.icon)}" alt=""><span><b>${e(owned.name)}</b><small>${e(owned.description)}</small></span></button></li>`).join('');
        list.querySelectorAll('[data-key]').forEach((button) => {
            button.onclick = () => { replaceEl.close(); action(slot, button.dataset.key); };
        });
        replaceEl.querySelector('[data-replace-cancel]').onclick = () => replaceEl.close();
        replaceEl.showModal();
        return null;
    };
    const withTarget = (scroll, action) => {
        if (scroll.scope === 'team') return askReplacement(scroll, null, action);
        return startPick({
            label: `Who learns ${scroll.name}?`,
            detail: scroll.description,
            onPick: (slot) => askReplacement(scroll, slot, action),
            disabledFor: (member) => (scroll.eligibleCharacterIds && !scroll.eligibleCharacterIds.includes(member.characterId) ? 'Another character\'s'
                : member.scrolls.some((owned) => owned.key === scroll.key) ? 'Already learned' : ''),
        });
    };

    // ------------------------------------------------------------ screens
    // Each screen returns { team, html, bind }.
    const introScreen = () => {
        const best = state.bestFloor;
        const option = (mode, seal, title, line, kind) => posting({
            seal, title, kind, body: `<p class="tw-posting-text">${line}</p>`,
            art: `<img class="tw-art-portrait" src="${mode === 'standard' ? 'selectionbg_1.jpg' : 'ingamebg_4.jpg'}" alt="">`,
            foot: `<button type="button" class="tw-button is-primary is-wide is-large" data-start="${mode}">Begin</button>`,
        });
        return {
            team: false,
            html: head({ seal: '塔', title: 'The Tower', sub: best ? `Best climb: floor <b>${best.floor}</b>${best.cleared ? ' · conquered' : ''}` : 'A solo climb. Tower battles never touch your ladder record.' }) +
                '<div class="tw-postings is-scenic">' +
                option('standard', '塔', 'Standard', '200 floors. A boss every 20. Augments in four tiers, and pairs that fuse into something stronger.', '200 floors') +
                option('legacy', '橋', 'Legacy', 'The Land of Waves and the Chūnin Exams, as the story goes.', 'Story · 10 to 20 floors') +
                '</div>',
            bind: () => bodyEl.querySelectorAll('[data-start]').forEach((button) => {
                button.onclick = () => act('/start', { mode: button.dataset.start }, { button });
            }),
        };
    };

    const draftScreen = (run) => {
        const { offers, rerolls } = run.draft;
        const key = offers.map((candidates) => candidates.map((c) => c.characterId).join(',')).join('|');
        if (draftIds.key !== key) {
            const previous = draftIds.ids;
            draftIds = { key, ids: offers.map((candidates, slot) => (candidates.some((c) => c.characterId === previous[slot]) ? previous[slot] : null)) };
        }
        const ready = draftIds.ids.every(Boolean);
        const slots = offers.map((candidates, slot) =>
            `<section class="tw-board tw-posting is-slot" aria-label="Slot ${slot + 1}"><div class="tw-title" style="padding:16px 16px 0"><h2 class="tw-label">Slot ${slot + 1}</h2></div>` +
            `<ul class="tw-slot-list">${candidates.map((character) => `<li><button type="button" class="tw-candidate" data-slot="${slot}" data-id="${e(character.characterId)}" aria-pressed="${draftIds.ids[slot] === character.characterId}">` +
                `${portrait(character)}<span><b>${e(character.name)}</b>${skillStrip(character)}</span></button></li>`).join('')}</ul>` +
            `<div class="tw-slot-foot"><button type="button" class="tw-button is-wide" data-reroll="${slot}" ${rerolls[slot] > 0 ? '' : 'disabled'}>${REROLL_ICON}${rerolls[slot] > 0 ? 'Reroll' : 'No rerolls left'}</button></div></section>`).join('');
        return {
            team: false,
            html: head({ seal: '選', title: 'Choose your squad', sub: 'One ninja from each slot. Each slot can be rerolled once.',
                side: `<button type="button" class="tw-button is-primary is-large" data-take ${ready ? '' : 'disabled'}>Take this squad</button>` }) +
                `<div class="tw-postings">${slots}</div>`,
            bind: () => {
                bodyEl.querySelectorAll('.tw-candidate').forEach((button) => {
                    button.onclick = () => { draftIds.ids[Number(button.dataset.slot)] = button.dataset.id; render(); };
                });
                bodyEl.querySelectorAll('[data-reroll]').forEach((button) => {
                    button.onclick = () => act('/draft/reroll', { slot: Number(button.dataset.reroll) }, { button });
                });
                const take = bodyEl.querySelector('[data-take]');
                take.onclick = () => act('/draft', { picks: offers.map((candidates, slot) => candidates.findIndex((c) => c.characterId === draftIds.ids[slot])) }, { button: take });
            },
        };
    };

    // Where the climb stands: how far to the next boss and the next rest stop.
    const climbFacts = (run) => {
        const floors = run.map?.floors || [];
        const ahead = (types) => floors.find((floor) => floor[0]?.floor > run.floor && floor.some((node) => types.includes(node.type)))?.[0]?.floor || null;
        const next = run.floor + 1;
        const bossFloor = ahead(['boss']) || (isStd(run) ? Math.ceil(next / 20) * 20 : null);
        const restFloor = ahead(['ramen']);
        const range = run.act || { firstFloor: 1, lastFloor: run.totalFloors };
        const pips = [];
        for (let floor = range.firstFloor; floor <= range.lastFloor; floor += 1) {
            const row = floors.find((entry) => entry[0]?.floor === floor) || [];
            const guarded = row.some((node) => ['boss', 'miniboss'].includes(node.type));
            pips.push(`<i class="${[floor <= run.floor ? 'is-done' : '', floor === next ? 'is-next' : '', guarded ? 'is-boss' : ''].filter(Boolean).join(' ')}"></i>`);
        }
        return { next, bossFloor, restFloor, pips: `<div class="tw-pips" aria-hidden="true">${pips.join('')}</div>` };
    };

    const enemyFaces = (enemies) => `<div class="tw-faces">${enemies.slice(0, 3).map((enemy) =>
        `<figure ${tip(enemy.name, `${enemy.hp} health`)} tabindex="0">${portrait(enemy)}<figcaption>${enemy.hp}</figcaption></figure>`).join('')}</div>`;
    const affixList = (affixes) => (affixes.length ? `<div class="tw-affixes">${affixes.map((affix) =>
        `<button type="button" class="tw-affix" ${tip(affix.name, affix.description)}>${e(affix.name)}</button>`).join('')}</div>` : '');

    const mapScreen = (run) => {
        const facts = climbFacts(run);
        const region = isStd(run) ? `${run.act.name} · ${run.act.title}` : `${run.act?.name || 'Act I'} · ${run.act?.title || ''}${run.stage && run.stage !== run.act?.title ? ` · ${run.stage}` : ''}`;
        const side = (facts.bossFloor ? `<div class="tw-dist is-boss"><strong>${facts.bossFloor - run.floor}</strong>to the boss</div>` : '') +
            (facts.restFloor ? `<div class="tw-dist"><strong>${facts.restFloor - run.floor}</strong>to a rest</div>` : '');
        const nodes = run.availableNodeIds.map((id) => run.map.floors.flat().find((node) => node.id === id)).filter(Boolean);
        const cards = nodes.map((node) => {
            const meta = NODES[node.type] || NODES.event;
            const preview = run.previews?.[node.id] || {};
            const encounter = preview.encounter;
            const bossInfo = node.type === 'boss' ? run.bosses?.[node.bossId] : null;
            const isBoss = node.type === 'boss';
            let title = meta.label;
            let kind = '';
            let art = '';
            let body = `<p class="tw-posting-text is-short">${e(meta.hint)}</p>`;
            if (encounter) {
                title = e(encounter.boss?.name || encounter.name);
                kind = isBoss ? 'Boss' : `${meta.label} · ${encounter.enemies.length} ${encounter.enemies.length === 1 ? 'enemy' : 'enemies'}`;
                art = enemyFaces(encounter.enemies);
                body = `${affixList(encounter.affixes)}<p class="tw-posting-text is-short">${e(isBoss ? encounter.boss?.intro || meta.hint : encounter.blurb || meta.hint)}</p>`;
            } else if (bossInfo) {
                title = e(bossInfo.name);
                kind = 'Boss';
                art = enemyFaces([{ ...bossInfo.leader, hp: '' }]);
            } else if (preview.trainer) {
                title = e(preview.trainer.title);
                kind = 'Training';
            }
            return posting({
                art, seal: meta.kanji, sealTone: meta.tone || '', boss: isBoss, tone: node.type === 'elite' ? 'is-elite' : '', title, kind: e(kind),
                body, foot: `<button type="button" class="tw-button is-primary is-wide" data-node="${e(node.id)}" data-type="${e(node.type)}">${e(meta.verb)}</button>`,
            });
        }).join('');
        return {
            team: true,
            html: head({ floor: facts.next, total: run.totalFloors, title: e(region), sub: isStd(run) ? `${e(run.standard.band)} · segment ${run.standard.segment} of ${run.standard.segments}` : 'Choose where to go next', side, pips: facts.pips }) +
                `<div class="tw-postings">${cards}</div>`,
            bind: () => bodyEl.querySelectorAll('[data-node]').forEach((button) => {
                button.onclick = () => act('/node', { nodeId: button.dataset.node }, {
                    button,
                    onSuccess: (data) => (QUICK_FIGHT.has(button.dataset.type) && data.run.status === 'battle' ? enterBattle(null) : null),
                });
            }),
        };
    };

    const enterBattle = (button, body = {}) => act('/battle', body, {
        button,
        onSuccess: (data) => {
            if (!data.matchId) return;
            document.body.classList.add('is-leaving');
            setTimeout(() => { window.location.href = `ingame.html?matchId=${encodeURIComponent(data.matchId)}`; }, reduceMotion ? 0 : 240);
        },
    });

    const battleScreen = (run) => {
        const { encounter, matchId } = run.battle;
        const boss = encounter.boss;
        const duel = Boolean(encounter.duel);
        const team = run.team || [];
        if (!duel || matchId) championSlot = null;
        else if (championSlot === null || team[championSlot]?.dead) {
            championSlot = team.reduce((best, member, slot) => (!member.dead && (best < 0 || member.hp > team[best].hp) ? slot : best), -1);
            if (championSlot < 0) championSlot = null;
        }
        const kindLabel = encounter.final ? 'Final boss' : boss ? 'Boss' : encounter.checkpoint === 'mini' ? 'Champion'
            : encounter.kind === 'elite' ? 'Elite' : duel ? 'Duel' : 'Battle';
        const rules = [
            ...(boss?.mechanics || []),
            ...encounter.affixes.map((affix) => `${affix.name}: ${affix.description}`),
            ...(encounter.carries ? [`This squad carries the ${encounter.carries === 'heaven' ? 'Heaven' : 'Earth'} scroll.`] : []),
            ...(duel && !boss ? ['One ninja fights; the others rest. Losing costs your champion a life, not the run.'] : []),
        ];
        const champions = duel && !matchId ? `<h2 class="tw-label">Your champion</h2><div class="tw-champions">${team.map((member, slot) =>
            `<button type="button" class="tw-champion" data-champion="${slot}" aria-pressed="${slot === championSlot}" ${member.dead ? 'disabled' : ''}>` +
            `${portrait(member)}${e(member.name.split(' ')[0])}</button>`).join('')}</div>` : '';
        return {
            team: true,
            html: head({ seal: boss ? '鬼' : NODES[encounter.kind]?.kanji || '戦', sealTone: boss ? 'is-boss' : '', title: e(boss?.name || encounter.name),
                sub: `Floor <b>${encounter.floor}</b> · <span class="${boss ? 'is-boss' : ''}">${kindLabel}</span>` }) +
                '<section class="tw-board tw-detail">' +
                `<div class="tw-detail-col"><div class="tw-enemies${boss ? ' has-leader' : ''}">${encounter.enemies.map((enemy, index) =>
                    `<div class="tw-enemy${boss && index === 0 ? ' is-leader' : ''}">${portrait(enemy)}<b>${e(enemy.name)}</b><span>${enemy.hp} health</span></div>`).join('')}</div>` +
                `${boss?.intro || encounter.blurb ? `<p class="tw-story">${e(boss?.intro || encounter.blurb)}</p>` : ''}</div>` +
                `<div class="tw-detail-col">${rules.length ? `<ul class="tw-rules${boss ? ' is-boss' : ''}">${rules.map((line) => `<li tabindex="0" ${tip(line.split(':')[0].length < 40 && line.includes(':') ? line.split(':')[0] : 'Rule', line)}><span>${e(line)}</span></li>`).join('')}</ul>` : ''}${champions}` +
                `<div class="tw-detail-foot"><button type="button" class="tw-button is-primary is-large" data-fight ${duel && !matchId && championSlot === null ? 'disabled' : ''}>` +
                `${matchId ? 'Return to battle' : duel ? 'Enter the arena' : 'Enter battle'}</button></div></div></section>`,
            bind: () => {
                bodyEl.querySelectorAll('[data-champion]').forEach((button) => {
                    button.onclick = () => { championSlot = Number(button.dataset.champion); render(); };
                });
                const fight = bodyEl.querySelector('[data-fight]');
                fight.onclick = () => enterBattle(fight, duel && !matchId ? { slot: championSlot } : {});
            },
        };
    };

    const eventScreen = (run) => {
        const event = run.event;
        if (!event) return endedScreen(run);
        return {
            team: true,
            html: head({ floor: run.floor + 1, total: run.totalFloors, title: e(event.title), sub: `<span class="tw-story-line">${e(event.text)}</span>` }) +
                `<div class="tw-postings">${event.options.map((option) => posting({
                    seal: event.kanji, sealTone: 'is-event', title: e(option.label),
                    kind: option.cost ? `<span class="tw-price${option.cost > run.ryo ? ' is-short' : ''}">${option.cost} ryō</span>` : (option.needsSlot ? 'One ninja' : ''),
                    body: `<p class="tw-posting-text">${e(option.blocked || option.description)}</p>`,
                    foot: `<button type="button" class="tw-button is-primary is-wide" data-option="${e(option.id)}" ${option.blocked ? 'disabled' : ''}>${option.needsSlot ? 'Choose who' : 'Choose'}</button>`,
                })).join('')}</div>`,
            bind: () => bodyEl.querySelectorAll('[data-option]').forEach((button) => {
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
            }),
        };
    };

    const ramenScreen = (run) => ({
        team: true,
        html: head({ seal: '麺', sealTone: 'is-rest', title: 'Ichiraku Ramen', sub: 'One bowl before the next floor.' }) +
            '<div class="tw-postings">' +
            posting({ seal: '宴', sealTone: 'is-rest', title: 'Team feast', kind: `+${run.constants.ramenFeastPercent}% health`, body: '<p class="tw-posting-text">Every ninja recovers part of their health.</p>',
                foot: '<button type="button" class="tw-button is-primary is-wide" data-feast>Eat together</button>' }) +
            posting({ seal: '休', sealTone: 'is-rest', title: 'Full rest', kind: 'One ninja to full', body: '<p class="tw-posting-text">One ninja recovers all of their health.</p>',
                foot: '<button type="button" class="tw-button is-primary is-wide" data-rest>Choose who rests</button>' }) +
            '</div>',
        bind: () => {
            const feast = bodyEl.querySelector('[data-feast]');
            feast.onclick = () => act('/ramen', { option: 'feast' }, { button: feast });
            bodyEl.querySelector('[data-rest]').onclick = () => startPick({
                label: 'Who rests?',
                detail: 'They recover to full health.',
                onPick: (slot) => act('/ramen', { option: 'rest', slot }),
                disabledFor: (member) => (member.hp >= member.maxHp ? 'Full health' : ''),
            });
        },
    });

    const merchantScreen = (run) => {
        const stock = run.merchant.stock;
        return {
            team: true,
            html: head({ seal: '商', sealTone: 'is-shop', title: isStd(run) ? 'A wandering merchant' : (run.act?.act === 2 ? 'A Leaf weapons dealer' : 'A travelling merchant'),
                sub: `You carry <b>${run.ryo} ryō</b>. It is lost when the run ends.`, side: '<button type="button" class="tw-button" data-leave>Leave</button>' }) +
                `<div class="tw-postings">${stock.map((item, index) => {
                    const short = !item.sold && item.price > run.ryo;
                    const foot = `<span class="tw-price${short ? ' is-short' : ''}">${item.sold ? 'Sold' : `${item.price} ryō`}</span>` +
                        `<button type="button" class="tw-button is-primary" style="margin-left:auto" data-buy="${index}" ${item.sold || short ? 'disabled' : ''}>Buy</button>`;
                    return item.kind === 'scroll' ? scrollPosting(item.scroll, { foot })
                        : posting({ seal: '薬', sealTone: 'is-rest', title: 'Medical kit', kind: `+${run.constants.medkitHealPercent}% health`, body: '<p class="tw-posting-text">Every ninja recovers part of their health.</p>', foot });
                }).join('')}</div>`,
            bind: () => {
                bodyEl.querySelectorAll('[data-buy]').forEach((button) => {
                    button.onclick = () => {
                        const index = Number(button.dataset.buy);
                        const item = stock[index];
                        if (item.kind !== 'scroll') return act('/merchant/buy', { itemIndex: index }, { button });
                        return withTarget(item.scroll, (slot, replaceKey) => act('/merchant/buy', { itemIndex: index, slot, replaceKey }));
                    };
                });
                const leave = bodyEl.querySelector('[data-leave]');
                leave.onclick = () => act('/leave', {}, { button: leave });
            },
        };
    };

    const recruitScreen = (run) => ({
        team: true,
        html: head({ seal: '募', sealTone: 'is-shop', title: 'Shinobi for hire', sub: 'The recruit arrives at full health and keeps the scrolls of the ninja they replace.',
            side: '<button type="button" class="tw-button" data-leave>Keep my team</button>' }) +
            `<div class="tw-postings">${run.recruit.offers.map((character, index) => posting({
                art: `<img class="tw-art-face" src="${e(character.facePicture)}" alt="">`,
                title: e(character.name),
                kind: character.passive ? `Passive: ${e(character.passive.name)}` : '',
                body: skillStrip(character),
                foot: `<button type="button" class="tw-button is-primary is-wide" data-recruit="${index}">Recruit</button>`,
            })).join('')}</div>`,
        bind: () => {
            bodyEl.querySelectorAll('[data-recruit]').forEach((button) => {
                button.onclick = () => {
                    const offer = run.recruit.offers[Number(button.dataset.recruit)];
                    startPick({
                        label: `Who does ${offer.name.split(' ')[0]} replace?`,
                        detail: `${offer.name} arrives at full health.`,
                        onPick: (slot) => act('/recruit', { offerIndex: Number(button.dataset.recruit), slot }),
                        allowDead: true,
                    });
                };
            });
            const leave = bodyEl.querySelector('[data-leave]');
            leave.onclick = () => act('/leave', {}, { button: leave });
        },
    });

    const rewardScreen = (run) => {
        const { reward } = run;
        const title = reward.starting ? `Choose a starting ${noun(run)}` : isStd(run) ? 'Claim an augment' : 'Claim a Forbidden Scroll';
        const sub = reward.starting ? 'Take one for the road, or skip it for ryō.'
            : reward.ryoGained ? `Floor <b>${run.floor}</b> cleared · <b>+${reward.ryoGained} ryō</b>` : `Floor <b>${run.floor + 1}</b>`;
        return {
            team: true,
            html: head({ seal: '巻', title, sub, side: `<button type="button" class="tw-button" data-skip>Skip · +${run.constants.skipScrollRyo} ryō</button>` }) +
                `<div class="tw-postings">${reward.offers.map((scroll, index) => scrollPosting(scroll, {
                    foot: `<button type="button" class="tw-button is-primary is-wide" data-reward="${index}">${scroll.fusion ? 'Take and fuse' : 'Take'}</button>`,
                })).join('')}</div>`,
            bind: () => {
                bodyEl.querySelectorAll('[data-reward]').forEach((button) => {
                    button.onclick = () => {
                        const index = Number(button.dataset.reward);
                        withTarget(reward.offers[index], (slot, replaceKey) => act('/reward', { offerIndex: index, slot, replaceKey }, { button }));
                    };
                });
                const skip = bodyEl.querySelector('[data-skip]');
                skip.onclick = () => act('/reward/skip', {}, { button: skip });
            },
        };
    };

    const interludeScreen = (run) => {
        const next = run.interlude;
        return {
            team: true,
            html: head({ seal: '橋', title: 'The bridge is finished', sub: `${e(run.act?.name || 'Act I')} cleared · ${e(run.act?.title || '')}` }) +
                '<div class="tw-postings">' +
                posting({ seal: '試', title: next ? `Enter ${e(next.title)}` : 'Continue', kind: 'Floors 11 to 20',
                    body: '<p class="tw-posting-text">The written exam, the Forest of Death, duels, and Gaara in the finals. Every living ninja returns to full health and regains their last life.</p>',
                    foot: '<button type="button" class="tw-button is-primary is-wide" data-continue>Continue</button>' }) +
                posting({ seal: '退', title: 'Retire', kind: 'End the run now', body: '<p class="tw-posting-text">Collect the run\'s account ryō and stop here.</p>',
                    foot: '<button type="button" class="tw-button is-wide" data-retire>Retire</button>' }) +
                '</div>',
            bind: () => {
                const go = bodyEl.querySelector('[data-continue]');
                go.onclick = () => act('/continue', { choice: 'continue' }, { button: go });
                const retire = bodyEl.querySelector('[data-retire]');
                retire.onclick = async () => {
                    if (await confirmAction({ title: 'Retire now?', body: 'The run ends here and pays its account ryō.', confirmLabel: 'Retire' })) {
                        act('/continue', { choice: 'retire' }, { button: retire });
                    }
                };
            },
        };
    };

    const leftChamberScreen = () => ({
        team: true,
        html: head({ seal: '麺', sealTone: 'is-rest', title: 'A quiet floor', sub: 'Nothing waits here any more.' }) +
            '<div class="tw-postings">' + posting({ seal: '麺', sealTone: 'is-rest', title: 'Move on', kind: 'Fusion is automatic now',
                body: '<p class="tw-posting-text">Taking the second half of a pair fuses it on the spot.</p>',
                foot: '<button type="button" class="tw-button is-primary is-wide" data-leave>Continue</button>' }) + '</div>',
        bind: () => { const leave = bodyEl.querySelector('[data-leave]'); leave.onclick = () => act('/leave', {}, { button: leave }); },
    });

    const endedScreen = (run) => {
        const victory = run.status === 'victory';
        const reward = run.accountReward;
        const legacyActs = Math.max(Number(run.stats?.actsCleared) || 0, victory ? 1 : 0);
        const title = run.status === 'abandoned' ? 'Run abandoned' : victory
            ? (isStd(run) ? 'The Tower is conquered' : legacyActs >= 2 ? 'The finals are interrupted' : 'Act I cleared') : 'The climb ends';
        const ledger = [
            ['Floor', `${run.floor} / ${run.totalFloors}`],
            ['Battles won', run.stats.battlesWon],
            ...(isStd(run) ? [['Bosses', run.stats.bossesDefeated || 0], ['Fusions', (run.fusions || []).length]] : []),
            ['Account ryō', reward ? `+${reward.ryo}` : '0', 'is-ryo'],
        ];
        return {
            team: false,
            html: `<section class="tw-board tw-ended${victory ? ' is-victory' : ''}">` +
                `<h1>${title}</h1>` +
                `<dl class="tw-ledger">${ledger.map(([label, value, cls]) => `<div class="${cls || ''}"><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>` +
                '<div class="tw-final">' + run.team.map((member) =>
                    `<div class="tw-final-member${member.dead ? ' is-dead' : ''}">${portrait(member)}${e(member.name)}` +
                    `<span class="tw-icons">${member.scrolls.map(augIcon).join('')}</span></div>`).join('') +
                `<div class="tw-final-member is-team"><span class="tw-label">Team ${noun(run, true)}</span><span class="tw-icons is-grid">${run.teamScrolls.map(augIcon).join('') || '<span class="tw-none">None</span>'}</span>` +
                ((run.fusions || []).length ? `<ul class="tw-fusions-made">${run.fusions.map((entry) => `<li>Floor ${entry.floor}: <b>${e(entry.name)}</b></li>`).join('')}</ul>` : '') +
                '</div></div>' +
                '<div class="tw-actions"><button type="button" class="tw-button is-primary is-large" data-new>New run</button>' +
                '<a class="tw-button is-large" href="selection.html">Back to the hub</a></div></section>',
            bind: () => {
                const again = bodyEl.querySelector('[data-new]');
                again.onclick = () => act('/dismiss', {}, { button: again });
            },
        };
    };

    // ------------------------------------------------------------ the fusion moment
    const seenFusion = (run) => { try { return localStorage.getItem(`tower:fusion:${run.runId}`); } catch (_) { return null; } };
    const markFusion = (run, id) => { try { localStorage.setItem(`tower:fusion:${run.runId}`, id); } catch (_) { /* per-session only */ } };
    let shownFusion = null;
    const playFusion = (run) => {
        const fusion = run?.lastFusion;
        // Only a fusion made on this floor plays; an old one is in the team column already.
        if (!fusion || fusion.floor !== run.floor || !ACTIVE.includes(run.status) || fusion.id === shownFusion || fusion.id === seenFusion(run)) return;
        shownFusion = fusion.id;
        markFusion(run, fusion.id);
        const [left, right] = fusion.consumed;
        fusionEl.innerHTML = '<div class="tw-board tw-fusion-card">' +
            '<div class="tw-fusion-stage" aria-hidden="true">' +
            (left ? `<img class="is-left tier-${e(left.tier)}" src="${e(left.icon)}" alt="">` : '') +
            (right ? `<img class="is-right tier-${e(right.tier)}" src="${e(right.icon)}" alt="">` : '') +
            `<img class="is-result tier-${e(fusion.result.tier)}" src="${e(fusion.result.icon)}" alt=""></div>` +
            `<h2 id="tw-fusion-title">${e(fusion.name)}</h2>` +
            `<span class="tw-posting-kind tier-${e(fusion.result.tier)}">${e(fusion.result.tierLabel)} fusion</span>` +
            `<p class="tw-fusion-from">${fusion.consumed.map((entry) => `<b class="tier-${e(entry.tier)}">${e(entry.name)}</b>`).join(' + ')}</p>` +
            `<p class="tw-posting-text">${e(fusion.result.description)}</p>` +
            '<button type="button" class="tw-button is-primary is-large" data-fusion-ok>Continue</button></div>';
        fusionEl.hidden = false;
        const ok = fusionEl.querySelector('[data-fusion-ok]');
        const close = () => {
            fusionEl.hidden = true;
            document.removeEventListener('keydown', onKey);
            const row = bodyEl.querySelector(`.tw-augrow[data-key="${CSS.escape(fusion.result.key || '')}"]`);
            if (row) { row.classList.add('is-new'); row.scrollIntoView({ block: 'nearest' }); }
        };
        const onKey = (event) => { if (event.key === 'Escape') close(); };
        document.addEventListener('keydown', onKey);
        fusionEl.onclick = (event) => { if (event.target === fusionEl) close(); };
        ok.onclick = close;
        ok.focus();
    };

    // ------------------------------------------------------------ render
    const sceneFor = (run) => {
        if (!run) return 'konoha';
        if (run.status === 'victory') return 'victory';
        if (run.status === 'battle' && run.battle?.encounter?.kind === 'boss') return 'boss';
        if (run.status === 'defeated') return 'dusk';
        if (isStd(run)) return run.scene || 'waves';
        if ((run.act?.act || 1) >= 2) return run.floor + 1 >= 12 && run.floor + 1 <= 15 ? 'forest' : 'konoha';
        return run.floor >= 9 ? 'dusk' : 'waves';
    };

    const render = () => {
        const run = state.run;
        document.body.dataset.scene = sceneFor(run);
        abandonButton.hidden = !run || !ACTIVE.includes(run.status);
        const screens = {
            draft: draftScreen, map: mapScreen, battle: battleScreen, event: eventScreen, ramen: ramenScreen,
            merchant: merchantScreen, recruit: recruitScreen, reward: rewardScreen, interlude: interludeScreen, fusion: leftChamberScreen,
        };
        const screen = !run ? introScreen() : (screens[run.status] || endedScreen)(run);
        const key = run ? `${run.runId}:${run.status}:${run.currentNodeId || ''}:${run.floor}` : 'intro';
        const entering = key !== lastKey;
        lastKey = key;
        const withTeam = screen.team && run?.team?.length;
        bodyEl.className = `tw-body${withTeam ? ' has-team' : ''}${entering && !reduceMotion ? ' tw-enter' : ''}`;
        bodyEl.innerHTML = (withTeam ? teamColumn(run) : '') + `<main class="tw-main" aria-live="polite">${screen.html}</main>`;
        screen.bind?.();
        bodyEl.querySelector('[data-pick-cancel]')?.addEventListener('click', cancelPick);
        bodyEl.querySelectorAll('button.tw-member.is-pickable').forEach((button) => {
            button.onclick = () => pick?.onPick(Number(button.dataset.slot));
        });
        if (run) renderSheet(run);
        else { sheet.hidden = true; document.body.classList.remove('has-sheet'); }
        playFusion(run);
    };

    // ------------------------------------------------------------ compendium
    const renderCompendium = () => {
        const list = compendiumEl.querySelector('[data-compendium-list]');
        if (!catalog) { list.innerHTML = '<li class="tw-none">Loading…</li>'; return; }
        const kind = compendiumEl.querySelector('[data-compendium-filter]').value;
        const query = compendiumEl.querySelector('[data-compendium-search]').value.trim().toLowerCase();
        const nameOf = (code) => catalog.augments.find((augment) => augment.code === code)?.name || code;
        const entries = (catalog[kind] || []).filter((entry) => !query || [entry.name, entry.characterName, entry.descriptionNormalized, entry.descriptionOriginal, entry.effectOriginal]
            .some((field) => String(field || '').toLowerCase().includes(query)));
        list.innerHTML = entries.map((entry) => `<li class="tw-entry tier-${e(entry.tier)}${entry.status === 'implemented' ? '' : ' is-off'}">` +
            `<header><b>${e(entry.name)}</b><span>${e(TIER_LABEL[entry.tier] || entry.tier)}</span>` +
            `${entry.characterName ? `<span style="color:var(--tw-muted)">${e(entry.characterName)}</span>` : ''}` +
            `${entry.ingredients ? `<span style="color:var(--tw-muted)">${e(entry.ingredients.map(nameOf).join(' + '))}</span>` : ''}` +
            `${entry.status === 'implemented' ? '' : '<span style="color:var(--tw-faint)">Not in the Tower yet</span>'}</header>` +
            `<p>${e(entry.descriptionNormalized || entry.descriptionOriginal || entry.effectOriginal || '')}</p></li>`).join('') ||
            '<li class="tw-none">Nothing matches.</li>';
    };
    const openCompendium = async () => {
        compendiumEl.showModal();
        renderCompendium();
        if (catalog) return;
        try { catalog = await api('/catalog'); renderCompendium(); } catch (error) {
            compendiumEl.querySelector('[data-compendium-list]').innerHTML = `<li class="tw-none">${e(error.message)}</li>`;
        }
    };
    compendiumEl.querySelector('[data-compendium-search]').addEventListener('input', renderCompendium);
    compendiumEl.querySelector('[data-compendium-filter]').addEventListener('change', renderCompendium);
    compendiumEl.querySelector('[data-compendium-close]').onclick = () => compendiumEl.close();
    compendiumButton.onclick = openCompendium;

    // ------------------------------------------------------------ tooltips
    const tipEl = document.createElement('div');
    tipEl.className = 'tw-tip';
    tipEl.setAttribute('role', 'tooltip');
    tipEl.hidden = true;
    document.body.appendChild(tipEl);
    const showTip = (target) => {
        const [title, ...rest] = target.getAttribute('data-tip').split('\n');
        tipEl.innerHTML = `<strong>${e(title)}</strong>${rest.join(' ').trim() ? `<span>${e(rest.join(' '))}</span>` : ''}`;
        tipEl.hidden = false;
        const rect = target.getBoundingClientRect();
        const box = tipEl.getBoundingClientRect();
        tipEl.style.left = `${Math.min(window.innerWidth - box.width - 8, Math.max(8, rect.left + rect.width / 2 - box.width / 2))}px`;
        tipEl.style.top = `${rect.top - box.height - 8 > 8 ? rect.top - box.height - 8 : rect.bottom + 8}px`;
    };
    const onTip = (event) => {
        const target = event.target.closest?.('[data-tip]');
        if (target) showTip(target); else tipEl.hidden = true;
    };
    document.addEventListener('mouseover', onTip);
    document.addEventListener('focusin', onTip);
    document.addEventListener('focusout', () => { tipEl.hidden = true; });

    // ------------------------------------------------------------ chrome
    document.addEventListener('error', (event) => {
        const image = event.target;
        if (image instanceof HTMLImageElement && !image.src.endsWith('found-remaster.png') && image.closest('.tw-stage, .tw-sheet')) {
            image.src = 'found-remaster.png';
        }
    }, true);
    sheet.querySelector('[data-pick-sheet-cancel]').onclick = cancelPick;
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && pick) cancelPick(); });
    abandonButton.onclick = async () => {
        if (!state.run) return;
        if (await confirmAction({ title: 'Abandon this run?', body: 'Your team, augments and run ryō are lost, and no account ryō is paid.', confirmLabel: 'Abandon run' })) {
            act('/abandon');
        }
    };
    fit();
    window.addEventListener('resize', () => { const was = document.body.classList.contains('tw-compact'); fit(); if (was !== document.body.classList.contains('tw-compact') && state.run) render(); });
    stageRoot.hidden = false;

    window.ArenaSession.ready.then((user) => { if (user) load(); });
}());
