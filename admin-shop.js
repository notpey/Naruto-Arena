// ACP Shop section: publish avatars, borders, and titles to the in-game Shop.
// The server validates everything (including the image itself); this page previews and submits.
(function () {
    "use strict";
    var shop = document.querySelector('[data-acp-section="shop"]');
    if (!shop) return;

    var CATEGORIES = ["avatars", "borders", "titles"];
    var SINGULAR = { avatars: "avatar", borders: "border", titles: "title" };
    var RARITIES = ["common", "uncommon", "rare", "epic", "legendary"];
    // Starting points that match the launch catalog; admins can price anything they like.
    var SUGGESTED_PRICES = {
        avatars: { common: 100, uncommon: 150, rare: 250, epic: 400, legendary: 700 },
        borders: { common: 200, uncommon: 300, rare: 450, epic: 650, legendary: 900 },
        titles: { common: 100, uncommon: 150, rare: 350, epic: 650, legendary: 1000 }
    };
    var NAME_LIMITS = { avatars: 40, borders: 40, titles: 28 };
    var STATUS_LABELS = { draft: "Draft", live: "Live", retired: "Retired" };
    var SAMPLE_AVATAR = "found-remaster.png";
    var IMGUR_HINT = /^https?:\/\/(i\.)?(www\.|m\.)?imgur\.com\//i;

    var sections = Array.prototype.slice.call(document.querySelectorAll("[data-acp-section]"));
    var sectionLinks = Array.prototype.slice.call(document.querySelectorAll("[data-acp-section-link]"));
    var draftBadge = document.querySelector("[data-shop-draft-badge]");
    var statsEl = shop.querySelector("[data-shop-stats]");
    var listEl = shop.querySelector("[data-shop-list]");
    var bulkEl = shop.querySelector("[data-shop-bulk]");
    var editorEl = shop.querySelector("[data-shop-editor]");
    var errorEl = shop.querySelector("[data-shop-error]");
    var searchEl = shop.querySelector("[data-shop-search]");
    var newButton = shop.querySelector("[data-shop-new]");
    var tabs = Array.prototype.slice.call(shop.querySelectorAll("[data-shop-category]"));
    var statusButtons = Array.prototype.slice.call(shop.querySelectorAll("[data-shop-status]"));

    var state = {
        loaded: false,
        loading: null,
        catalog: { avatars: [], borders: [], titles: [] },
        owners: {},
        category: "avatars",
        status: "all",
        search: "",
        selected: {},
        editor: null,
        busy: false,
        player: { name: "Shinobi", rank: "Academy Student", level: 1 }
    };

    // ---------- helpers ----------

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text != null) node.textContent = text;
        return node;
    }

    function button(className, text, onClick) {
        var node = el("button", className, text);
        node.type = "button";
        if (onClick) node.addEventListener("click", onClick);
        return node;
    }

    function fetchJson(url, options) {
        return fetch(url, Object.assign({ credentials: "same-origin", cache: "no-store" }, options || {})).then(function (res) {
            return res.json().catch(function () { return {}; }).then(function (data) {
                if (!res.ok) {
                    var error = new Error((data && data.error) || "Request failed.");
                    error.status = res.status;
                    error.data = data;
                    throw error;
                }
                return data;
            });
        });
    }

    function send(method, url, body) {
        return fetchJson(url, { method: method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) });
    }

    function formatNumber(value) {
        return Math.max(0, Math.round(Number(value) || 0)).toLocaleString("en-US");
    }

    function capitalize(value) {
        var text = String(value || "");
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    function statusOf(item) {
        return STATUS_LABELS[item && item.status] ? item.status : "live";
    }

    function allItems() {
        return CATEGORIES.reduce(function (list, category) { return list.concat(state.catalog[category] || []); }, []);
    }

    function findItem(id) {
        return allItems().find(function (item) { return item.id === id; }) || null;
    }

    function ownersOf(id) {
        return Number(state.owners[id]) || 0;
    }

    function image(src, className, fallback) {
        var img = el("img", className);
        img.alt = "";
        img.decoding = "async";
        if (fallback) img.addEventListener("error", function () { if (img.getAttribute("src") !== fallback) img.src = fallback; });
        img.src = src || fallback || "";
        return img;
    }

    // Avatar with an optional border overlay, at the size it appears in-game.
    function avatar(avatarUrl, borderUrl, size) {
        var frame = el("span", "shop-avatar");
        frame.style.width = size + "px";
        frame.style.height = size + "px";
        frame.appendChild(image(avatarUrl || SAMPLE_AVATAR, "shop-avatar-img", SAMPLE_AVATAR));
        if (borderUrl) frame.appendChild(image(borderUrl, "shop-avatar-border"));
        return frame;
    }

    // ---------- section routing ----------

    function showSection(name) {
        var target = name === "shop" ? "shop" : "operations";
        sections.forEach(function (section) { section.hidden = section.getAttribute("data-acp-section") !== target; });
        sectionLinks.forEach(function (link) {
            if (link.getAttribute("data-acp-section-link") === target) link.setAttribute("aria-current", "page");
            else link.removeAttribute("aria-current");
        });
        if (target === "shop") {
            load(false);
            render();
        }
    }

    function routeFromHash() {
        showSection(String(location.hash || "").replace("#", ""));
    }

    // ---------- data ----------

    function load(force) {
        if (state.loading && !force) return state.loading;
        if (state.loaded && !force) return Promise.resolve();
        state.loading = fetchJson("/api/admin/cosmetics").then(function (data) {
            var catalog = data.catalog || {};
            CATEGORIES.forEach(function (category) {
                state.catalog[category] = Array.isArray(catalog[category]) ? catalog[category] : [];
            });
            state.owners = data.owners || {};
            state.loaded = true;
            setError("");
        }).catch(function (error) {
            setError(error.status === 401 || error.status === 403
                ? "Sign in with an admin account to manage the shop."
                : (error.message || "The catalog could not be loaded."));
        }).then(function () {
            state.loading = null;
            render();
        });
        return state.loading;
    }

    function loadPlayer() {
        fetchJson("/api/me").then(function (data) {
            var user = data && data.user;
            if (!user) return;
            var ladder = (user.profile && user.profile.ladder) || {};
            state.player = { name: user.username || "Shinobi", rank: ladder.rank || "Academy Student", level: ladder.level || 1, avatarUrl: user.profile && user.profile.avatarUrl };
            if (state.editor) renderEditor();
        }).catch(function () {});
    }

    function setError(message) {
        if (!errorEl) return;
        errorEl.textContent = message || "";
        errorEl.hidden = !message;
    }

    // ---------- list ----------

    function render() {
        // Keep an open, unmodified item in step with the reloaded catalog.
        if (state.editor && state.editor.mode === "edit" && !state.editor.dirty) {
            var fresh = findItem(state.editor.id);
            if (!fresh) state.editor = null;
            else state.editor.original = fresh;
        }
        renderStats();
        renderTabs();
        renderList();
        if (!state.editor) startNew();
        else renderEditor();
    }

    function renderStats() {
        var counts = { live: 0, draft: 0, retired: 0 };
        allItems().forEach(function (item) { counts[statusOf(item)] += 1; });
        statsEl.innerHTML = "";
        [["Live", counts.live], ["Drafts", counts.draft], ["Retired", counts.retired]].forEach(function (pair) {
            var row = el("div", "acp-shop-stat");
            row.appendChild(el("dt", "", pair[0]));
            row.appendChild(el("dd", "", formatNumber(pair[1])));
            statsEl.appendChild(row);
        });
        if (draftBadge) {
            draftBadge.textContent = counts.draft ? String(counts.draft) : "";
            draftBadge.hidden = !counts.draft;
            draftBadge.title = counts.draft ? counts.draft + " unpublished draft" + (counts.draft === 1 ? "" : "s") : "";
        }
    }

    function renderTabs() {
        tabs.forEach(function (tab) {
            var category = tab.getAttribute("data-shop-category");
            var active = category === state.category;
            tab.classList.toggle("is-active", active);
            tab.setAttribute("aria-selected", String(active));
            var count = tab.querySelector("[data-shop-tab-count]");
            if (count) count.textContent = String((state.catalog[category] || []).length);
        });
        statusButtons.forEach(function (statusButton) {
            var active = statusButton.getAttribute("data-shop-status") === state.status;
            statusButton.classList.toggle("is-active", active);
            statusButton.setAttribute("aria-pressed", String(active));
        });
        if (newButton) newButton.textContent = "New " + SINGULAR[state.category];
    }

    function visibleItems() {
        var query = state.search.trim().toLowerCase();
        return (state.catalog[state.category] || []).filter(function (item) {
            if (state.status !== "all" && statusOf(item) !== state.status) return false;
            return !query || String(item.name || "").toLowerCase().indexOf(query) !== -1;
        }).sort(function (a, b) {
            var order = { draft: 0, live: 1, retired: 2 };
            if (order[statusOf(a)] !== order[statusOf(b)]) return order[statusOf(a)] - order[statusOf(b)];
            return (Number(a.price) || 0) - (Number(b.price) || 0) || String(a.name).localeCompare(String(b.name));
        });
    }

    function listThumb(item) {
        if (item.category === "titles") return el("span", "acp-shop-row-title", item.name);
        if (item.category === "borders") return avatar(state.player.avatarUrl || SAMPLE_AVATAR, item.imageUrl, 44);
        return avatar(item.imageUrl, "", 44);
    }

    function renderList() {
        listEl.innerHTML = "";
        if (!state.loaded) {
            listEl.appendChild(el("p", "acp-shop-empty", state.loading ? "Loading the catalog..." : "The catalog isn't loaded."));
            renderBulk();
            return;
        }
        var items = visibleItems();
        if (!items.length) {
            var empty = el("div", "acp-shop-empty");
            empty.appendChild(el("p", "", state.search || state.status !== "all"
                ? "Nothing matches these filters."
                : "No " + state.category + " yet."));
            empty.appendChild(button("acp-button secondary", "Create a " + SINGULAR[state.category], startNew));
            listEl.appendChild(empty);
            renderBulk();
            return;
        }
        var editingId = state.editor && state.editor.mode === "edit" ? state.editor.id : "";
        var list = el("ul", "acp-shop-rows");
        items.forEach(function (item) {
            var row = el("li", "acp-shop-row" + (item.id === editingId ? " is-editing" : ""));
            var check = el("input", "acp-shop-check");
            check.type = "checkbox";
            check.checked = Boolean(state.selected[item.id]);
            check.setAttribute("aria-label", "Select " + item.name);
            check.addEventListener("change", function () {
                if (check.checked) state.selected[item.id] = true;
                else delete state.selected[item.id];
                renderBulk();
            });
            row.appendChild(check);
            var open = button("acp-shop-row-open", "", function () { startEdit(item.id); });
            open.setAttribute("aria-label", "Edit " + item.name);
            var thumb = el("span", "acp-shop-row-thumb");
            thumb.appendChild(listThumb(item));
            open.appendChild(thumb);
            var text = el("span", "acp-shop-row-text");
            if (item.category !== "titles") text.appendChild(el("strong", "", item.name));
            var meta = el("span", "acp-shop-row-meta");
            meta.appendChild(el("span", "acp-shop-rarity rarity-" + (item.rarity || "common"), capitalize(item.rarity || "common")));
            meta.appendChild(el("span", "", formatNumber(item.price) + " Ryo"));
            var owned = ownersOf(item.id);
            if (owned) meta.appendChild(el("span", "", owned + " owner" + (owned === 1 ? "" : "s")));
            text.appendChild(meta);
            open.appendChild(text);
            open.appendChild(el("span", "acp-shop-pill is-" + statusOf(item), STATUS_LABELS[statusOf(item)]));
            row.appendChild(open);
            list.appendChild(row);
        });
        listEl.appendChild(list);
        renderBulk();
    }

    function selectedIds() {
        return Object.keys(state.selected).filter(function (id) { return findItem(id); });
    }

    function renderBulk() {
        var ids = selectedIds();
        bulkEl.innerHTML = "";
        bulkEl.hidden = !ids.length;
        if (!ids.length) return;
        bulkEl.appendChild(el("span", "acp-shop-bulk-count", ids.length + " selected"));
        [["live", "Publish"], ["draft", "Move to drafts"], ["retired", "Retire"]].forEach(function (action) {
            // Owned items can't go back to drafts: drafts are invisible, even to owners.
            var targets = ids.filter(function (id) {
                return statusOf(findItem(id)) !== action[0] && !(action[0] === "draft" && ownersOf(id));
            });
            var actionButton = button("acp-button" + (action[0] === "live" ? "" : " secondary"), action[1] + (targets.length && targets.length !== ids.length ? " (" + targets.length + ")" : ""), function () {
                bulkSetStatus(targets, action[0]);
            });
            actionButton.disabled = state.busy || !targets.length;
            bulkEl.appendChild(actionButton);
        });
        bulkEl.appendChild(button("acp-shop-link", "Clear", function () { state.selected = {}; renderList(); }));
    }

    function bulkSetStatus(ids, status) {
        if (!ids.length || state.busy) return;
        state.busy = true;
        renderBulk();
        var failures = [];
        ids.reduce(function (chain, id) {
            return chain.then(function () {
                return send("PATCH", "/api/admin/cosmetics/" + encodeURIComponent(id), { status: status }).catch(function (error) {
                    failures.push((findItem(id) || {}).name + ": " + error.message);
                });
            });
        }, Promise.resolve()).then(function () {
            state.busy = false;
            state.selected = {};
            var done = ids.length - failures.length;
            setEditorMessage(failures.length
                ? failures.join(" ")
                : (status === "live" ? "Published " : status === "retired" ? "Retired " : "Moved to drafts: ") + done + " item" + (done === 1 ? "" : "s") + ".", failures.length ? "error" : "success");
            return load(true);
        });
    }

    // ---------- editor ----------

    function blankDraft(category) {
        return { category: category, name: "", description: "", rarity: "rare", price: SUGGESTED_PRICES[category].rare, imageUrl: "", status: "draft" };
    }

    function startNew() {
        if (!confirmDiscard()) return;
        state.editor = { mode: "new", draft: blankDraft(state.category), priceTouched: false, check: null, message: null, dirty: false };
        renderList();
        renderEditor();
    }

    function startBatch() {
        if (!confirmDiscard()) return;
        state.editor = { mode: "batch", text: "", rows: [], rarity: "common", price: SUGGESTED_PRICES.avatars.common, pattern: "Avatar #", start: 1, message: null, dirty: false };
        renderEditor();
    }

    function startEdit(id) {
        var item = findItem(id);
        if (!item) return;
        if (state.editor && state.editor.mode === "edit" && state.editor.id === id) return;
        if (!confirmDiscard()) return;
        state.editor = {
            mode: "edit",
            id: id,
            original: item,
            draft: { category: item.category, name: item.name || "", description: item.description || "", rarity: item.rarity || "common", price: Number(item.price) || 0, imageUrl: item.imageUrl || "", status: statusOf(item) },
            priceTouched: true,
            check: item.imageUrl ? { state: "ok", info: null, saved: true } : null,
            message: null,
            dirty: false
        };
        renderList();
        renderEditor();
    }

    function confirmDiscard() {
        if (!state.editor || !state.editor.dirty) return true;
        return window.confirm("Discard your unsaved changes?");
    }

    function setEditorMessage(text, tone) {
        if (state.editor) state.editor.message = text ? { text: text, tone: tone || "info" } : null;
        renderEditor();
    }

    // Rebuilds the editor, keeping focus and caret in whichever field the admin is typing in.
    function renderEditor() {
        var active = document.activeElement;
        var key = active && editorEl.contains(active) ? active.getAttribute("data-focus-key") : "";
        var selection = null;
        try { if (key) selection = [active.selectionStart, active.selectionEnd]; } catch (error) {}
        buildEditor();
        if (!key) return;
        var next = editorEl.querySelector('[data-focus-key="' + key + '"]');
        if (!next) return;
        next.focus();
        try { if (selection && selection[0] != null) next.setSelectionRange(selection[0], selection[1]); } catch (error) {}
    }

    function buildEditor() {
        editorEl.innerHTML = "";
        var editor = state.editor;
        if (!editor) return;
        if (editor.mode === "batch") {
            renderBatchEditor(editor);
            return;
        }
        var draft = editor.draft;
        var category = draft.category;
        var head = el("div", "acp-shop-editor-head");
        var heading = el("div", "");
        heading.appendChild(el("span", "acp-shop-kicker", editor.mode === "new" ? "New " + SINGULAR[category] : capitalize(SINGULAR[category]) + " · " + STATUS_LABELS[editor.original ? statusOf(editor.original) : "draft"]));
        heading.appendChild(el("h3", "acp-shop-editor-title", editor.mode === "new" ? (draft.name || "Untitled " + SINGULAR[category]) : editor.original.name));
        head.appendChild(heading);
        if (editor.mode === "new" && category === "avatars") {
            head.appendChild(button("acp-shop-link", "Paste several links", startBatch));
        } else if (editor.mode === "edit") {
            head.appendChild(button("acp-shop-link", "New " + SINGULAR[category], startNew));
        }
        editorEl.appendChild(head);

        var body = el("div", "acp-shop-editor-body");
        var form = el("form", "acp-shop-form");
        form.noValidate = true;
        form.addEventListener("submit", function (event) { event.preventDefault(); });

        if (category !== "titles") form.appendChild(imageField(editor));
        form.appendChild(textField(editor, "name", category === "titles" ? "Title text" : "Name", NAME_LIMITS[category],
            category === "titles" ? "Shown in place of the player's rank, e.g. The Copy Ninja." : ""));
        form.appendChild(textField(editor, "description", "Shop description", 160, "One line shown in the Shop."));
        form.appendChild(rarityField(editor));
        form.appendChild(priceField(editor));
        body.appendChild(form);
        body.appendChild(previewPanel(draft));
        editorEl.appendChild(body);
        editorEl.appendChild(editorActions(editor));
        if (editor.message) editorEl.appendChild(el("p", "acp-shop-message is-" + editor.message.tone, editor.message.text));
    }

    function fieldWrap(label, hint) {
        var wrap = el("label", "acp-shop-field");
        var top = el("span", "acp-shop-field-label", label);
        wrap.appendChild(top);
        if (hint) wrap.dataset.hint = hint;
        return wrap;
    }

    function textField(editor, key, label, limit, hint) {
        var wrap = fieldWrap(label);
        var input = el("input", "acp-shop-input");
        input.type = "text";
        input.dataset.focusKey = key;
        input.maxLength = limit;
        input.value = editor.draft[key] || "";
        input.autocomplete = "off";
        var counter = el("span", "acp-shop-counter", input.value.length + "/" + limit);
        input.addEventListener("input", function () {
            editor.draft[key] = input.value;
            editor.dirty = true;
            counter.textContent = input.value.length + "/" + limit;
            if (key === "name") {
                var title = editorEl.querySelector(".acp-shop-editor-title");
                if (title && editor.mode === "new") title.textContent = input.value || "Untitled " + SINGULAR[editor.draft.category];
                refreshPreview();
            }
        });
        wrap.appendChild(input);
        var foot = el("span", "acp-shop-field-foot");
        foot.appendChild(el("span", "", hint || ""));
        foot.appendChild(counter);
        wrap.appendChild(foot);
        return wrap;
    }

    function rarityField(editor) {
        var wrap = el("div", "acp-shop-field");
        wrap.appendChild(el("span", "acp-shop-field-label", "Rarity"));
        var group = el("div", "acp-shop-rarities");
        group.setAttribute("role", "radiogroup");
        group.setAttribute("aria-label", "Rarity");
        RARITIES.forEach(function (rarity) {
            var choice = button("acp-shop-rarity-choice rarity-" + rarity + (editor.draft.rarity === rarity ? " is-active" : ""), capitalize(rarity), function () {
                editor.draft.rarity = rarity;
                editor.dirty = true;
                if (!editor.priceTouched) editor.draft.price = SUGGESTED_PRICES[editor.draft.category][rarity];
                renderEditor();
            });
            choice.setAttribute("role", "radio");
            choice.setAttribute("aria-checked", String(editor.draft.rarity === rarity));
            group.appendChild(choice);
        });
        wrap.appendChild(group);
        return wrap;
    }

    function priceField(editor) {
        var wrap = fieldWrap("Price (Ryo)");
        var row = el("span", "acp-shop-price-row");
        var input = el("input", "acp-shop-input acp-shop-price");
        input.type = "number";
        input.dataset.focusKey = "price";
        input.min = "0";
        input.max = "100000";
        input.step = "1";
        input.inputMode = "numeric";
        input.value = String(editor.draft.price);
        input.addEventListener("input", function () {
            editor.draft.price = input.value === "" ? "" : Number(input.value);
            editor.priceTouched = true;
            editor.dirty = true;
            refreshPreview();
        });
        row.appendChild(input);
        var suggested = SUGGESTED_PRICES[editor.draft.category][editor.draft.rarity];
        if (suggested && Number(editor.draft.price) !== suggested) {
            row.appendChild(button("acp-shop-link", "Use suggested " + formatNumber(suggested), function () {
                editor.draft.price = suggested;
                editor.priceTouched = false;
                editor.dirty = true;
                renderEditor();
            }));
        }
        wrap.appendChild(row);
        return wrap;
    }

    function imageField(editor) {
        var category = editor.draft.category;
        var wrap = fieldWrap(category === "borders" ? "Border image (Imgur link)" : "Avatar image (Imgur link)");
        var input = el("input", "acp-shop-input");
        input.type = "url";
        input.dataset.focusKey = "imageUrl";
        input.inputMode = "url";
        input.placeholder = "https://i.imgur.com/…";
        input.autocomplete = "off";
        input.spellcheck = false;
        input.value = editor.draft.imageUrl || "";
        var timer = null;
        var queueCheck = function (delay) {
            clearTimeout(timer);
            timer = setTimeout(function () { checkImage(editor, input.value); }, delay);
        };
        input.addEventListener("input", function () {
            editor.draft.imageUrl = input.value.trim();
            editor.dirty = true;
            editor.check = input.value.trim() ? { state: "pending" } : null;
            renderCheck(status, editor);
            queueCheck(600);
        });
        input.addEventListener("paste", function () { queueCheck(50); });
        wrap.appendChild(input);
        var status = el("span", "acp-shop-check-status");
        renderCheck(status, editor);
        wrap.appendChild(status);
        var hint = category === "borders"
            ? "Square PNG or WebP with a transparent center. It is drawn over the player's avatar at the same size."
            : "Square image, at least 100×100. Upload to Imgur, then paste the image link.";
        wrap.appendChild(el("span", "acp-shop-field-foot", hint));
        return wrap;
    }

    function renderCheck(node, editor) {
        var check = editor.check;
        node.className = "acp-shop-check-status";
        node.textContent = "";
        if (!check) return;
        if (check.state === "pending" || check.state === "checking") {
            node.classList.add("is-pending");
            node.textContent = "Checking image…";
        } else if (check.state === "error") {
            node.classList.add("is-error");
            node.textContent = check.message;
        } else if (check.saved && !check.info) {
            node.classList.add("is-ok");
            node.textContent = "Current image";
        } else if (check.info) {
            node.classList.add("is-ok");
            var parts = [check.info.width + "×" + check.info.height, String(check.info.format || "").toUpperCase()];
            if (editor.draft.category === "borders") parts.push(check.info.hasAlpha ? "transparent" : "transparency unknown");
            node.textContent = "✓ " + parts.filter(Boolean).join(" · ") + (check.warnings && check.warnings.length ? " — " + check.warnings.join(" ") : "");
        }
    }

    function checkImage(editor, value) {
        var url = String(value || "").trim();
        if (state.editor !== editor || !url) return;
        if (editor.original && url === editor.original.imageUrl) {
            editor.check = { state: "ok", saved: true };
            renderEditor();
            return;
        }
        if (!IMGUR_HINT.test(url)) {
            editor.check = { state: "error", message: "Use an Imgur link, for example https://i.imgur.com/abc1234.png." };
            renderEditor();
            return;
        }
        editor.check = { state: "checking" };
        var request = send("POST", "/api/admin/cosmetics/inspect-image", { category: editor.draft.category, url: url });
        editor.pendingCheck = request;
        request.then(function (data) {
            if (editor.pendingCheck !== request) return;
            editor.draft.imageUrl = data.imageUrl || url;
            editor.check = data.errors && data.errors.length
                ? { state: "error", message: data.errors.join(" ") }
                : { state: "ok", info: data, warnings: data.warnings || [] };
        }).catch(function (error) {
            if (editor.pendingCheck !== request) return;
            editor.check = { state: "error", message: error.message || "That image could not be checked." };
        }).then(function () {
            if (state.editor === editor) renderEditor();
        });
        renderEditor();
    }

    // How the item looks where players will see it.
    function previewPanel(draft) {
        var panel = el("div", "acp-shop-preview");
        panel.appendChild(el("span", "acp-shop-field-label", "Preview"));
        var body = el("div", "acp-shop-preview-body");
        panel.appendChild(body);
        fillPreview(body, draft);
        return panel;
    }

    function refreshPreview() {
        var body = editorEl.querySelector(".acp-shop-preview-body");
        if (body && state.editor && state.editor.draft) fillPreview(body, state.editor.draft);
    }

    function fillPreview(body, draft) {
        body.innerHTML = "";
        var category = draft.category;
        var hasImage = state.editor && state.editor.check && state.editor.check.state === "ok";
        var avatarUrl = category === "avatars" && hasImage ? draft.imageUrl : (state.player.avatarUrl || SAMPLE_AVATAR);
        var borderUrl = category === "borders" && hasImage ? draft.imageUrl : "";
        var title = category === "titles" ? (draft.name || "Your title") : "";

        var card = el("div", "acp-shop-mock-card");
        card.appendChild(avatar(avatarUrl, borderUrl, 88));
        var info = el("div", "acp-shop-mock-info");
        info.appendChild(el("strong", "acp-shop-mock-name", state.player.name));
        info.appendChild(el("span", "acp-shop-mock-rank" + (title ? " is-title" : ""), title || state.player.rank));
        info.appendChild(el("span", "acp-shop-mock-meta", "Level " + state.player.level + " · Clan: None"));
        card.appendChild(info);
        body.appendChild(labelled("Player card", card));

        var plate = el("div", "acp-shop-mock-plate");
        var plateInfo = el("div", "acp-shop-mock-info is-right");
        plateInfo.appendChild(el("strong", "acp-shop-mock-name", state.player.name));
        plateInfo.appendChild(el("span", "acp-shop-mock-rank" + (title ? " is-title" : ""), title || state.player.rank));
        plate.appendChild(plateInfo);
        plate.appendChild(avatar(avatarUrl, borderUrl, 68));
        body.appendChild(labelled("Battle nameplate", plate));

        if (category === "borders") {
            var alone = el("div", "acp-shop-mock-checker");
            if (borderUrl) alone.appendChild(image(borderUrl, "acp-shop-mock-border-alone"));
            else alone.appendChild(el("span", "acp-shop-mock-hint", "Paste a border link to check its transparency."));
            body.appendChild(labelled("Border alone (checkerboard = transparent)", alone));
        }
        if (category === "avatars" && !hasImage) {
            body.appendChild(el("p", "acp-shop-mock-hint", "Paste an avatar link to see it here."));
        }
    }

    function labelled(text, node) {
        var wrap = el("figure", "acp-shop-mock");
        wrap.appendChild(node);
        wrap.appendChild(el("figcaption", "", text));
        return wrap;
    }

    function editorActions(editor) {
        var bar = el("div", "acp-shop-actions");
        var category = editor.draft.category;
        var imageReady = category === "titles" || (editor.check && editor.check.state === "ok");
        var disabled = state.busy || !imageReady;

        if (editor.mode === "new") {
            var publish = button("acp-button", state.busy ? "Saving…" : "Publish to shop", function () { saveNew("live"); });
            publish.disabled = disabled;
            var draftButton = button("acp-button secondary", "Save as draft", function () { saveNew("draft"); });
            draftButton.disabled = disabled;
            bar.appendChild(publish);
            bar.appendChild(draftButton);
            if (!imageReady && category !== "titles") bar.appendChild(el("span", "acp-shop-actions-note", "Add a working image link first."));
            return bar;
        }

        var current = statusOf(editor.original);
        var save = button("acp-button", state.busy ? "Saving…" : "Save changes", function () { saveEdit({}); });
        save.disabled = disabled || !editor.dirty;
        bar.appendChild(save);
        var owners = ownersOf(editor.id);
        if (current === "draft") {
            var go = button("acp-button secondary", "Publish", function () { saveEdit({ status: "live" }); });
            go.disabled = disabled;
            bar.appendChild(go);
        } else if (current === "live") {
            var retire = button("acp-button secondary", "Retire", function () { saveEdit({ status: "retired" }); });
            retire.disabled = state.busy;
            retire.title = "Stop selling it. Players who own it keep it.";
            bar.appendChild(retire);
            if (!owners) {
                var unpublish = button("acp-button secondary", "Move to drafts", function () { saveEdit({ status: "draft" }); });
                unpublish.disabled = state.busy;
                bar.appendChild(unpublish);
            }
        } else {
            var relist = button("acp-button secondary", "Put back on sale", function () { saveEdit({ status: "live" }); });
            relist.disabled = state.busy;
            bar.appendChild(relist);
        }
        var remove = button("acp-button acp-shop-danger", "Delete", deleteItem);
        remove.disabled = state.busy || owners > 0;
        if (owners > 0) remove.title = owners + " player" + (owners === 1 ? " owns" : "s own") + " this. Retire it instead.";
        bar.appendChild(remove);
        bar.appendChild(el("span", "acp-shop-actions-note", owners
            ? "Owned by " + owners + " player" + (owners === 1 ? "" : "s") + "."
            : "Not owned by anyone yet."));
        return bar;
    }

    function payloadFrom(draft) {
        var payload = { name: draft.name, description: draft.description, rarity: draft.rarity, price: draft.price === "" ? "" : Number(draft.price) };
        if (draft.category !== "titles") payload.imageUrl = draft.imageUrl;
        return payload;
    }

    function saveNew(status) {
        var editor = state.editor;
        if (!editor || state.busy) return;
        var item = Object.assign({ category: editor.draft.category, status: status }, payloadFrom(editor.draft));
        state.busy = true;
        renderEditor();
        send("POST", "/api/admin/cosmetics", { items: [item] }).then(function (data) {
            var saved = data.items && data.items[0];
            state.busy = false;
            editor.dirty = false;
            return load(true).then(function () {
                if (saved) startEdit(saved.id);
                setEditorMessage(status === "live"
                    ? "Published " + item.name + ". It's in the Shop now."
                    : "Saved " + item.name + " as a draft. Publish it when it's ready.", "success");
            });
        }).catch(function (error) {
            state.busy = false;
            setEditorMessage(error.message || "That item couldn't be saved.", "error");
        });
    }

    function saveEdit(extra) {
        var editor = state.editor;
        if (!editor || state.busy) return;
        var payload = editor.dirty ? payloadFrom(editor.draft) : {};
        Object.keys(extra).forEach(function (key) { payload[key] = extra[key]; });
        state.busy = true;
        renderEditor();
        send("PATCH", "/api/admin/cosmetics/" + encodeURIComponent(editor.id), payload).then(function (data) {
            state.busy = false;
            editor.dirty = false;
            var message = data.message || "Saved.";
            if (extra.status === "live") message = "Published " + (data.item ? data.item.name : "the item") + ". It's in the Shop now.";
            if (extra.status === "retired") message = "Retired " + (data.item ? data.item.name : "the item") + ". Owners keep it; it's no longer sold.";
            if (extra.status === "draft") message = "Moved to drafts. It's hidden from the Shop.";
            var id = editor.id;
            return load(true).then(function () {
                state.editor = null;
                startEdit(id);
                setEditorMessage(message, "success");
            });
        }).catch(function (error) {
            state.busy = false;
            setEditorMessage(error.message || "That change couldn't be saved.", "error");
        });
    }

    function deleteItem() {
        var editor = state.editor;
        if (!editor || state.busy) return;
        if (!window.confirm("Delete " + editor.original.name + " permanently? This can't be undone.")) return;
        state.busy = true;
        renderEditor();
        send("DELETE", "/api/admin/cosmetics/" + encodeURIComponent(editor.id)).then(function (data) {
            state.busy = false;
            state.editor = null;
            return load(true).then(function () { setEditorMessage(data.message || "Deleted.", "success"); });
        }).catch(function (error) {
            state.busy = false;
            setEditorMessage(error.message || "That item couldn't be deleted.", "error");
        });
    }

    // ---------- batch avatars ----------

    function renderBatchEditor(editor) {
        var head = el("div", "acp-shop-editor-head");
        var heading = el("div", "");
        heading.appendChild(el("span", "acp-shop-kicker", "New avatars"));
        heading.appendChild(el("h3", "acp-shop-editor-title", "Paste several Imgur links"));
        head.appendChild(heading);
        head.appendChild(button("acp-shop-link", "One avatar instead", function () {
            editor.dirty = false;
            startNew();
        }));
        editorEl.appendChild(head);

        var form = el("div", "acp-shop-batch");
        var check = button("acp-button secondary", "Check links", function () { checkBatch(editor); });
        var area = fieldWrap("Imgur links, one per line");
        var textarea = el("textarea", "acp-shop-input acp-shop-textarea");
        textarea.rows = 5;
        textarea.dataset.focusKey = "batchText";
        textarea.placeholder = "https://i.imgur.com/abc1234.png\nhttps://i.imgur.com/def5678.png";
        textarea.value = editor.text;
        textarea.spellcheck = false;
        textarea.addEventListener("input", function () {
            editor.text = textarea.value;
            editor.dirty = true;
            check.disabled = state.busy || !editor.text.trim();
        });
        area.appendChild(textarea);
        form.appendChild(area);

        var defaults = el("div", "acp-shop-batch-defaults");
        var pattern = fieldWrap("Names");
        var patternInput = el("input", "acp-shop-input");
        patternInput.value = editor.pattern;
        patternInput.dataset.focusKey = "pattern";
        patternInput.addEventListener("input", function () { editor.pattern = patternInput.value; renameBatchRows(editor); });
        pattern.appendChild(patternInput);
        pattern.appendChild(el("span", "acp-shop-field-foot", "# becomes a running number."));
        defaults.appendChild(pattern);
        var start = fieldWrap("Start at");
        var startInput = el("input", "acp-shop-input acp-shop-price");
        startInput.type = "number";
        startInput.dataset.focusKey = "start";
        startInput.min = "1";
        startInput.value = String(editor.start);
        startInput.addEventListener("input", function () { editor.start = Math.max(1, Number(startInput.value) || 1); renameBatchRows(editor); });
        start.appendChild(startInput);
        defaults.appendChild(start);
        var rarity = fieldWrap("Rarity");
        var raritySelect = el("select", "acp-shop-input");
        RARITIES.forEach(function (value) {
            var option = el("option", "", capitalize(value));
            option.value = value;
            option.selected = value === editor.rarity;
            raritySelect.appendChild(option);
        });
        raritySelect.addEventListener("change", function () {
            editor.rarity = raritySelect.value;
            editor.price = SUGGESTED_PRICES.avatars[editor.rarity];
            renderEditor();
        });
        rarity.appendChild(raritySelect);
        defaults.appendChild(rarity);
        var price = fieldWrap("Price (Ryo)");
        var priceInput = el("input", "acp-shop-input acp-shop-price");
        priceInput.type = "number";
        priceInput.dataset.focusKey = "batchPrice";
        priceInput.min = "0";
        priceInput.value = String(editor.price);
        priceInput.addEventListener("input", function () { editor.price = priceInput.value === "" ? "" : Number(priceInput.value); });
        price.appendChild(priceInput);
        defaults.appendChild(price);
        form.appendChild(defaults);

        check.disabled = state.busy || !editor.text.trim();
        form.appendChild(check);
        editorEl.appendChild(form);

        if (editor.rows.length) {
            var list = el("ul", "acp-shop-batch-rows");
            editor.rows.forEach(function (row, index) {
                var item = el("li", "acp-shop-batch-row is-" + row.state);
                item.appendChild(avatar(row.state === "ok" ? row.imageUrl : "", "", 44));
                var fields = el("div", "acp-shop-batch-fields");
                var name = el("input", "acp-shop-input");
                name.value = row.name;
                name.maxLength = NAME_LIMITS.avatars;
                name.dataset.focusKey = "row-" + index;
                name.setAttribute("aria-label", "Name for avatar " + (index + 1));
                name.addEventListener("input", function () { row.name = name.value; row.renamed = true; });
                fields.appendChild(name);
                fields.appendChild(el("span", "acp-shop-batch-note", row.message || row.url));
                item.appendChild(fields);
                item.appendChild(button("acp-shop-link", "Remove", function () {
                    editor.rows.splice(index, 1);
                    renderEditor();
                }));
                list.appendChild(item);
            });
            editorEl.appendChild(list);

            var ready = editor.rows.filter(function (row) { return row.state === "ok"; }).length;
            var bar = el("div", "acp-shop-actions");
            var publish = button("acp-button", state.busy ? "Saving…" : "Publish " + ready + " avatar" + (ready === 1 ? "" : "s"), function () { saveBatch(editor, "live"); });
            var drafts = button("acp-button secondary", "Save as drafts", function () { saveBatch(editor, "draft"); });
            var blocked = state.busy || !ready || ready !== editor.rows.length;
            publish.disabled = blocked;
            drafts.disabled = blocked;
            bar.appendChild(publish);
            bar.appendChild(drafts);
            if (ready !== editor.rows.length) bar.appendChild(el("span", "acp-shop-actions-note", "Fix or remove the links marked in red."));
            editorEl.appendChild(bar);
        }
        if (editor.message) editorEl.appendChild(el("p", "acp-shop-message is-" + editor.message.tone, editor.message.text));
    }

    function batchName(editor, index) {
        return String(editor.pattern || "Avatar #").replace("#", String(editor.start + index));
    }

    function renameBatchRows(editor) {
        editor.rows.forEach(function (row, index) { if (!row.renamed) row.name = batchName(editor, index); });
        editorEl.querySelectorAll(".acp-shop-batch-row input").forEach(function (input, index) {
            if (editor.rows[index] && !editor.rows[index].renamed) input.value = editor.rows[index].name;
        });
    }

    function checkBatch(editor) {
        var urls = editor.text.split(/\s+/).map(function (line) { return line.trim(); }).filter(Boolean);
        var seen = {};
        urls = urls.filter(function (url) { if (seen[url]) return false; seen[url] = true; return true; });
        if (urls.length > 50) urls = urls.slice(0, 50);
        editor.rows = urls.map(function (url, index) {
            return { url: url, imageUrl: "", name: batchName(editor, index), state: "checking", message: "Checking…" };
        });
        editor.message = null;
        renderEditor();
        editor.rows.reduce(function (chain, row) {
            return chain.then(function () {
                return send("POST", "/api/admin/cosmetics/inspect-image", { category: "avatars", url: row.url }).then(function (data) {
                    row.imageUrl = data.imageUrl || row.url;
                    if (data.errors && data.errors.length) {
                        row.state = "error";
                        row.message = data.errors.join(" ");
                    } else {
                        row.state = "ok";
                        row.message = data.width + "×" + data.height + " " + String(data.format || "").toUpperCase() + (data.warnings && data.warnings.length ? " — " + data.warnings.join(" ") : "");
                    }
                }).catch(function (error) {
                    row.state = "error";
                    row.message = error.message || "That link could not be checked.";
                }).then(function () { if (state.editor === editor) renderEditor(); });
            });
        }, Promise.resolve());
    }

    function saveBatch(editor, status) {
        if (state.busy) return;
        var items = editor.rows.map(function (row) {
            return { category: "avatars", name: row.name, description: "", rarity: editor.rarity, price: editor.price, imageUrl: row.imageUrl, status: status };
        });
        state.busy = true;
        renderEditor();
        send("POST", "/api/admin/cosmetics", { items: items }).then(function (data) {
            state.busy = false;
            editor.dirty = false;
            state.status = status === "live" ? "all" : "draft";
            return load(true).then(function () {
                startBatch();
                setEditorMessage(data.message || "Saved.", "success");
            });
        }).catch(function (error) {
            state.busy = false;
            var failures = (error.data && error.data.failures) || [];
            failures.forEach(function (failure) {
                var row = editor.rows[failure.index];
                if (row) { row.state = "error"; row.message = failure.error; }
            });
            setEditorMessage(error.message || "Those avatars couldn't be saved.", "error");
        });
    }

    // ---------- wiring ----------

    tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            var category = tab.getAttribute("data-shop-category");
            if (category === state.category || !confirmDiscard()) return;
            state.category = category;
            state.selected = {};
            state.editor = null;
            render();
        });
    });

    statusButtons.forEach(function (statusButton) {
        statusButton.addEventListener("click", function () {
            state.status = statusButton.getAttribute("data-shop-status");
            renderTabs();
            renderList();
        });
    });

    if (searchEl) searchEl.addEventListener("input", function () {
        state.search = searchEl.value;
        renderList();
    });

    if (newButton) newButton.addEventListener("click", function () {
        if (state.editor && state.editor.mode === "new") {
            var first = editorEl.querySelector("input");
            if (first) first.focus();
            return;
        }
        startNew();
    });

    window.addEventListener("beforeunload", function (event) {
        if (state.editor && state.editor.dirty) {
            event.preventDefault();
            event.returnValue = "";
        }
    });

    window.addEventListener("hashchange", routeFromHash);
    routeFromHash();
    loadPlayer();
    // The section badge counts drafts, so load quietly even when Operations is showing.
    load(false);
})();
