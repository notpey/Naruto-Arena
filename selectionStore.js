// Shop and Profile hub panels. The server owns prices, balances, ownership, and equipped
// cosmetics; this file only renders those values and sends the player's choices back.
(function () {
    "use strict";
    var shopPanel = document.querySelector('[data-hub-panel="shop"]');
    var profilePanel = document.querySelector('[data-hub-panel="profile"]');
    if (!shopPanel || !profilePanel) return;

    var DEFAULT_AVATAR = "found-remaster.png";
    var AVATAR_MAX_FILE_BYTES = 2 * 1024 * 1024;
    var AVATAR_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
    var CATEGORIES = ["characters", "avatars", "borders", "titles"];
    var CATEGORY_NOUNS = {
        characters: ["character", "characters"],
        avatars: ["avatar", "avatars"],
        borders: ["border", "borders"],
        titles: ["title", "titles"]
    };
    var EQUIP_TYPES = { avatars: "avatar", borders: "border", titles: "title" };

    var shopGrid = shopPanel.querySelector("[data-shop-grid]");
    var shopDetail = shopPanel.querySelector("[data-shop-detail]");
    var shopHeading = shopPanel.querySelector("[data-shop-heading]");
    var shopSummary = shopPanel.querySelector("[data-shop-summary]");
    var shopWorkspace = shopPanel.querySelector("[data-shop-workspace]");
    var shopSearch = shopPanel.querySelector("[data-shop-search]");
    var shopFilter = shopPanel.querySelector("[data-shop-filter]");
    var shopTabs = Array.prototype.slice.call(shopPanel.querySelectorAll("[data-shop-category]"));
    var profileIdentity = profilePanel.querySelector("[data-profile-identity]");
    var profileBody = profilePanel.querySelector("[data-profile-body]");
    var profileTabs = Array.prototype.slice.call(profilePanel.querySelectorAll("[data-profile-section]"));
    var profileLink = profilePanel.querySelector("[data-profile-public-link]");
    var avatarFileInput = profilePanel.querySelector("[data-profile-avatar-file]");

    var state = {
        view: "play",
        user: null,
        shop: null,
        shopRequest: null,
        missionTitles: null,
        loadout: { avatarUrl: "", equippedBorder: "", equippedTitle: "" },
        category: "characters",
        filter: "sale",
        search: "",
        selected: { characters: "", avatars: "", borders: "", titles: "" },
        confirmKey: "",
        busyKey: "",
        shopStatus: { key: "", text: "", tone: "" },
        storeSkill: { key: "", index: -1 },
        profileSection: "overview",
        lockerCategory: "avatars",
        lockerStatus: { text: "", tone: "" },
        settingsStatus: {},
        backgroundDraft: null,
        shopError: ""
    };

    // ---------- small helpers ----------

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
        return window.ArenaSession.fetch(url, Object.assign({ credentials: "include" }, options || {})).then(function (res) {
            return res.json().catch(function () { return {}; }).then(function (data) {
                if (!res.ok) throw new Error((data && data.error) || "Request failed.");
                return data;
            });
        });
    }

    function postJson(url, body) {
        return fetchJson(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body || {}) });
    }

    function formatNumber(value) {
        return Math.max(0, Math.round(Number(value) || 0)).toLocaleString("en-US");
    }

    function plural(count, category) {
        var nouns = CATEGORY_NOUNS[category] || ["item", "items"];
        return count + " " + (count === 1 ? nouns[0] : nouns[1]);
    }

    function capitalize(value) {
        var text = String(value || "");
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    function isImagePath(value) {
        return typeof value === "string" && (value.indexOf("/") !== -1 || value.indexOf(".") !== -1);
    }

    function coin(amount, className) {
        var wrap = el("span", "store-price" + (className ? " " + className : ""));
        wrap.appendChild(el("span", "store-coin", "R"));
        wrap.appendChild(el("span", "store-price-value", formatNumber(amount)));
        return wrap;
    }

    function playSound(src) {
        var volume = 0.7;
        try {
            var saved = JSON.parse(window.ArenaSession.storage.getItem("narutoSoundSettings") || "null");
            if (saved && typeof saved.volume === "number") volume = Math.min(1, Math.max(0, saved.volume));
        } catch (error) {}
        if (!volume) return;
        try {
            var audio = new Audio(src);
            audio.volume = volume;
            var playing = audio.play();
            if (playing && playing.catch) playing.catch(function () {});
        } catch (error) {}
    }

    function getRyo() {
        if (window.ArenaRoster) return window.ArenaRoster.getRyo();
        return state.shop ? Number(state.shop.ryo) || 0 : 0;
    }

    function setRyo(value) {
        if (state.shop) state.shop.ryo = value;
        if (state.user && state.user.profile) state.user.profile.ryo = value;
        if (window.ArenaRoster) {
            window.ArenaRoster.setRyo(value);
        } else {
            document.querySelectorAll("[data-ryo-balance]").forEach(function (node) { node.textContent = formatNumber(value); });
        }
    }

    // ---------- player loadout (avatar, border, title) ----------

    function buildAvatar(avatarUrl, borderUrl, sizeClass) {
        var frame = el("span", "loadout-avatar" + (sizeClass ? " " + sizeClass : ""));
        var img = el("img", "loadout-avatar-img");
        img.alt = "";
        img.decoding = "async";
        img.addEventListener("error", function () {
            if (img.getAttribute("src") !== DEFAULT_AVATAR) img.src = DEFAULT_AVATAR;
        });
        img.src = avatarUrl || DEFAULT_AVATAR;
        frame.appendChild(img);
        if (isImagePath(borderUrl)) {
            var border = el("img", "loadout-avatar-border");
            border.alt = "";
            border.src = borderUrl;
            border.addEventListener("error", function () { border.remove(); });
            frame.appendChild(border);
        }
        return frame;
    }

    function ladderRank() {
        var ladder = state.user && state.user.profile && state.user.profile.ladder;
        return (ladder && ladder.rank) || "Academy Student";
    }

    function rankLabel(title) {
        return (title === undefined ? state.loadout.equippedTitle : title) || ladderRank();
    }

    // What players see under a name in-game: the equipped title, or the level-based rank.
    function rankChip(title, className) {
        var label = el("span", "loadout-rank" + (title ? " is-title" : "") + (className ? " " + className : ""), rankLabel(title));
        return label;
    }

    function setLoadout(source) {
        if (!source) return;
        ["avatarUrl", "equippedBorder", "equippedTitle"].forEach(function (key) {
            if (typeof source[key] === "string") state.loadout[key] = source[key];
        });
        if (state.user && state.user.profile) {
            state.user.profile.avatarUrl = state.loadout.avatarUrl;
            state.user.profile.equippedBorder = state.loadout.equippedBorder;
            state.user.profile.equippedTitle = state.loadout.equippedTitle;
        }
        syncEquippedFlags();
        applyPlayerCard();
    }

    // Mirrors the server's equipped-state rules so freshly equipped items light up without a refetch.
    function syncEquippedFlags() {
        if (!state.shop || !state.shop.items) return;
        var loadout = state.loadout;
        (state.shop.items.avatars || []).forEach(function (item) { item.equipped = Boolean(item.imageUrl) && loadout.avatarUrl === item.imageUrl; });
        (state.shop.items.borders || []).forEach(function (item) { item.equipped = Boolean(loadout.equippedBorder) && (loadout.equippedBorder === item.imageUrl || loadout.equippedBorder === item.id); });
        (state.shop.items.titles || []).forEach(function (item) { item.equipped = Boolean(loadout.equippedTitle) && loadout.equippedTitle === item.name; });
    }

    function applyPlayerCard() {
        var loadout = state.loadout;
        var avatarUrl = loadout.avatarUrl || DEFAULT_AVATAR;
        document.querySelectorAll(".player-card .player-avatar").forEach(function (img) {
            if (img.getAttribute("src") !== avatarUrl) img.src = avatarUrl;
        });
        var overlay = document.getElementById("player-avatar-border-overlay");
        if (overlay) {
            if (isImagePath(loadout.equippedBorder)) {
                overlay.src = loadout.equippedBorder;
                overlay.style.display = "block";
            } else {
                overlay.removeAttribute("src");
                overlay.style.display = "none";
            }
        }
        // The equipped title takes the rank's place on the card, as it does in battle.
        var rankLine = document.querySelector("[data-player-rank]");
        if (rankLine && state.user) {
            rankLine.textContent = rankLabel();
            rankLine.classList.toggle("is-equipped-title", Boolean(loadout.equippedTitle));
        }
        try {
            var cached = JSON.parse(window.ArenaSession.storage.getItem("narutoUser") || "null");
            if (cached && cached.username && cached.avatarUrl !== avatarUrl) {
                cached.avatarUrl = avatarUrl;
                window.ArenaSession.storage.setItem("narutoUser", JSON.stringify(cached));
            }
        } catch (error) {}
    }

    function setUser(user) {
        if (!user || !user.profile) return;
        state.user = user;
        setLoadout(user.profile);
        if (profileLink && user.username) profileLink.href = "profile.html?user=" + encodeURIComponent(user.username);
    }

    // ---------- data loading ----------

    function loadShop(force) {
        if (state.shopRequest && !force) return state.shopRequest;
        state.shopError = "";
        state.shopRequest = fetchJson("/api/shop").then(function (data) {
            state.shop = data;
            setLoadout(data);
            return data;
        }).catch(function (error) {
            state.shopRequest = null;
            state.shopError = error.message || "The shop could not be loaded.";
            throw error;
        });
        return state.shopRequest;
    }

    function loadProfile() {
        return fetchJson("/api/me").then(function (data) {
            setUser(data.user);
            return data.user;
        });
    }

    function loadMissionTitles() {
        if (state.missionTitles) return Promise.resolve(state.missionTitles);
        return fetchJson("/api/missions").then(function (data) {
            var titles = {};
            (Array.isArray(data.missions) ? data.missions : []).forEach(function (mission) {
                if (mission && mission.missionId) titles[mission.missionId] = mission.name || mission.title || "";
            });
            state.missionTitles = titles;
            return titles;
        }).catch(function () { return {}; });
    }

    // ---------- shop ----------

    function getCharacterItems() {
        if (!window.ArenaRoster) return null;
        return window.ArenaRoster.getCharacters().filter(function (character) {
            return character && character.hidden !== true && (character.characterId || character.id);
        }).map(function (character) {
            var arc = window.ArenaRoster.getArc(character);
            var price = Number(character.purchasePrice);
            return {
                key: character.characterId || character.id,
                category: "characters",
                name: character.name || "Unknown shinobi",
                description: character.characterdeescription || character.description || "",
                imageUrl: character.facePicture || "",
                price: Number.isFinite(price) ? Math.max(0, price) : 1000,
                owned: character.unlocked !== false,
                equipped: false,
                rarity: "",
                arcLabel: arc ? arc.series + " / " + arc.label : "",
                requiredMissionId: character.requiredMissionId || "",
                skills: (Array.isArray(character.skills) ? character.skills : []).filter(function (skill) {
                    return skill && !skill.omitFromSelectionViewer;
                }).slice(0, 4)
            };
        });
    }

    function getCosmeticItems(category) {
        if (!state.shop || !state.shop.items) return null;
        return (state.shop.items[category] || []).map(function (item) {
            return Object.assign({ key: item.id }, item);
        });
    }

    function getItems(category) {
        return category === "characters" ? getCharacterItems() : getCosmeticItems(category);
    }

    function filterItems(items) {
        var ryo = getRyo();
        var query = state.search.trim().toLowerCase();
        return items.filter(function (item) {
            if (state.filter === "sale" && item.owned) return false;
            if (state.filter === "owned" && !item.owned) return false;
            if (state.filter === "affordable" && (item.owned || item.price > ryo)) return false;
            if (query && (item.name + " " + item.description + " " + (item.arcLabel || "")).toLowerCase().indexOf(query) === -1) return false;
            return true;
        }).sort(function (a, b) {
            if (a.owned !== b.owned) return a.owned ? 1 : -1;
            if (a.price !== b.price) return a.price - b.price;
            return a.name.localeCompare(b.name);
        });
    }

    function renderShopTabs() {
        shopTabs.forEach(function (tab) {
            var category = tab.getAttribute("data-shop-category");
            var active = category === state.category;
            tab.classList.toggle("active", active);
            tab.setAttribute("aria-selected", String(active));
            var countEl = tab.querySelector("[data-shop-count]");
            var items = getItems(category);
            if (countEl) countEl.textContent = items ? String(items.filter(function (item) { return !item.owned; }).length) : "";
        });
    }

    function renderShopSummary() {
        if (!shopSummary) return;
        var cosmetics = ["avatars", "borders", "titles"].reduce(function (all, category) {
            return all.concat(getCosmeticItems(category) || []);
        }, []);
        if (!cosmetics.length) {
            shopSummary.textContent = "";
            return;
        }
        var owned = cosmetics.filter(function (item) { return item.owned; }).length;
        shopSummary.textContent = owned + " of " + cosmetics.length + " cosmetics collected";
    }

    function renderShop() {
        renderShopTabs();
        renderShopSummary();
        shopGrid.innerHTML = "";
        shopDetail.innerHTML = "";

        var items = getItems(state.category);
        if (!items) {
            var waiting = state.category !== "characters" && state.shopError;
            shopHeading.textContent = "";
            var loadingNode = el("div", "store-empty", waiting ? state.shopError : "Loading the shop...");
            if (waiting) {
                loadingNode.appendChild(button("store-button store-button-ghost", "Try again", function () { openShop(); }));
            }
            shopGrid.appendChild(loadingNode);
            renderShopDetailEmpty("Pick an item to see it up close.");
            return;
        }

        var visible = filterItems(items);
        var nouns = CATEGORY_NOUNS[state.category];
        var filterLabel = { sale: "for sale", affordable: "you can afford", owned: "owned", all: "in the shop" }[state.filter];
        shopHeading.textContent = visible.length + " " + (visible.length === 1 ? nouns[0] : nouns[1]) + " " + filterLabel;

        if (!visible.length) {
            renderShopEmpty(items);
            return;
        }

        // Fall back to the first tile without forgetting the player's pick, which may reappear.
        var selectedKey = state.selected[state.category];
        var selected = visible.find(function (item) { return item.key === selectedKey; }) || visible[0];

        visible.forEach(function (item) {
            shopGrid.appendChild(buildShopTile(item, item.key === selected.key));
        });
        renderShopDetail(selected);
    }

    function renderShopEmpty(items) {
        var everythingOwned = items.length && items.every(function (item) { return item.owned; });
        var message;
        if (state.search) message = "Nothing matches “" + state.search + "”.";
        else if (state.filter === "sale" && everythingOwned) message = "You own every " + CATEGORY_NOUNS[state.category][0] + " in the shop.";
        else if (state.filter === "affordable") message = "Nothing here fits your current balance. Win battles and complete missions to earn more Ryo.";
        else if (state.filter === "owned") message = "You don't own any " + CATEGORY_NOUNS[state.category][1] + " yet.";
        else message = "No " + CATEGORY_NOUNS[state.category][1] + " are on sale right now.";
        var empty = el("div", "store-empty", message);
        if (state.search || state.filter !== "all") {
            empty.appendChild(button("store-button store-button-ghost", "Show everything", function () {
                state.search = "";
                state.filter = "all";
                if (shopSearch) shopSearch.value = "";
                if (shopFilter) shopFilter.value = "all";
                renderShop();
            }));
        }
        shopGrid.appendChild(empty);
        renderShopDetailEmpty("Nothing selected.");
    }

    function renderShopDetailEmpty(message) {
        shopDetail.innerHTML = "";
        shopDetail.appendChild(el("div", "store-detail-empty", message));
    }

    function buildTileArt(item) {
        var art = el("span", "store-tile-art");
        if (item.category === "titles") {
            art.classList.add("is-title");
            art.appendChild(el("span", "store-tile-title-text", item.name));
        } else if (item.category === "borders") {
            art.appendChild(buildAvatar(state.loadout.avatarUrl, item.imageUrl, "is-tile"));
        } else {
            var img = el("img", "store-tile-img");
            img.alt = "";
            img.loading = "lazy";
            img.decoding = "async";
            img.src = item.imageUrl || DEFAULT_AVATAR;
            img.addEventListener("error", function () { img.src = DEFAULT_AVATAR; });
            art.appendChild(img);
        }
        return art;
    }

    function buildShopTile(item, selected) {
        var ryo = getRyo();
        var tile = el("button", "store-tile" + (item.rarity ? " rarity-" + item.rarity : ""));
        tile.type = "button";
        tile.setAttribute("data-shop-item", item.key);
        tile.setAttribute("aria-pressed", String(selected));
        if (selected) tile.classList.add("is-selected");
        if (item.owned) tile.classList.add("is-owned");
        if (item.equipped) tile.classList.add("is-equipped");
        if (!item.owned && item.price > ryo) tile.classList.add("is-unaffordable");

        tile.appendChild(buildTileArt(item));
        var body = el("span", "store-tile-body");
        if (item.category !== "titles") body.appendChild(el("span", "store-tile-name", item.name));
        var foot = el("span", "store-tile-foot");
        if (item.equipped) foot.appendChild(el("span", "store-tile-state is-equipped", "Equipped"));
        else if (item.owned) foot.appendChild(el("span", "store-tile-state", item.category === "characters" ? "Unlocked" : "Owned"));
        else foot.appendChild(coin(item.price));
        if (item.rarity) foot.appendChild(el("span", "store-rarity-dot", "")).setAttribute("title", capitalize(item.rarity));
        body.appendChild(foot);
        tile.appendChild(body);
        tile.setAttribute("aria-label", item.name + (item.owned ? ", owned" : ", " + formatNumber(item.price) + " Ryo"));
        return tile;
    }

    function buildCharacterStage(item) {
        var stage = el("div", "store-stage is-character");
        var portrait = el("img", "store-stage-portrait");
        portrait.alt = item.name + " portrait";
        portrait.src = item.imageUrl || DEFAULT_AVATAR;
        portrait.addEventListener("error", function () { portrait.src = DEFAULT_AVATAR; });
        stage.appendChild(portrait);
        if (item.skills.length) {
            var skills = el("div", "store-stage-skills");
            item.skills.forEach(function (skill, index) {
                var pick = button("store-stage-skill", null, function () {
                    var open = state.storeSkill.key === item.key && state.storeSkill.index === index;
                    state.storeSkill = open ? { key: "", index: -1 } : { key: item.key, index: index };
                    showStoreSkill(item);
                });
                pick.setAttribute("aria-label", skill.name || "Skill");
                pick.setAttribute("aria-controls", "store-skill-panel");
                pick.title = skill.name || "Skill";
                var icon = el("img");
                icon.src = skill.skillimage || skill.image || "skillqqueue-remaster.png?v=2";
                icon.alt = "";
                icon.loading = "lazy";
                icon.addEventListener("error", function () { icon.src = "skillqqueue-remaster.png?v=2"; });
                pick.appendChild(icon);
                skills.appendChild(pick);
            });
            stage.appendChild(skills);
        }
        stage.appendChild(el("span", "store-stage-label", item.skills.length ? "Select a skill to read it" : "Character"));
        return stage;
    }

    var STORE_ENERGY_CLASSES = {
        ninjutsu: "energy-ninjutsu",
        bloodline: "energy-bloodline",
        random: "energy-random",
        genjutsu: "energy-genjutsu",
        taijutsu: "energy-taijutsu"
    };

    // Shows the chosen skill under the character's bio and marks its icon as active.
    function showStoreSkill(item) {
        var selected = state.storeSkill.key === item.key ? state.storeSkill.index : -1;
        Array.prototype.forEach.call(shopDetail.querySelectorAll(".store-stage-skill"), function (pick, index) {
            pick.setAttribute("aria-pressed", String(index === selected));
        });
        var panel = shopDetail.querySelector(".store-skill-panel");
        if (!panel) return;
        var skill = item.skills[selected];
        // One description at a time: an open skill replaces the character's bio.
        var bio = shopDetail.querySelector(".store-detail-desc");
        if (bio) bio.hidden = Boolean(skill);
        panel.innerHTML = "";
        panel.hidden = !skill;
        if (!skill) return;

        var head = el("div", "store-skill-head");
        head.appendChild(el("h3", "store-skill-name", skill.name || "Skill"));
        var cooldown = Math.max(0, Number(skill.cooldown) || 0);
        head.appendChild(el("span", "store-skill-cooldown", cooldown ? "Cooldown " + cooldown : "No cooldown"));
        panel.appendChild(head);

        var meta = el("div", "store-skill-meta");
        var cost = el("span", "store-skill-cost");
        var energy = (Array.isArray(skill.energy) ? skill.energy : []).filter(function (type) {
            var normalized = String(type || "").trim().toLowerCase();
            return normalized && normalized !== "none" && normalized !== "non";
        });
        if (energy.length) {
            energy.forEach(function (type) {
                var pip = el("span", ["energy-pip", "filled", STORE_ENERGY_CLASSES[String(type).trim().toLowerCase()]].filter(Boolean).join(" "));
                pip.title = type;
                cost.appendChild(pip);
            });
        } else {
            cost.textContent = "No chakra";
        }
        meta.appendChild(cost);
        var classes = (Array.isArray(skill.classes) ? skill.classes : [])
            .map(function (entry) { return String(entry || "").trim().toLowerCase() === "energy" ? "Chakra" : String(entry || "").trim(); })
            .filter(function (entry) { return entry && entry.toLowerCase() !== "invisible"; });
        if (classes.length) meta.appendChild(el("span", "store-skill-classes", classes.join(" · ")));
        panel.appendChild(meta);

        var description = el("p", "store-skill-desc");
        var text = skill.skilldescription || skill.description || "";
        if (typeof window.renderSkillDescription === "function") {
            window.renderSkillDescription(description, text, item.skills.map(function (entry) { return entry && entry.name; }));
        } else {
            description.textContent = text;
        }
        panel.appendChild(description);
    }

    // Shows the cosmetic on the player's own card, layered over what they currently wear.
    function buildCosmeticStage(item) {
        var stage = el("div", "store-stage" + (item.rarity ? " rarity-" + item.rarity : ""));
        var avatarUrl = item.category === "avatars" ? item.imageUrl : state.loadout.avatarUrl;
        var borderUrl = item.category === "borders" ? item.imageUrl : state.loadout.equippedBorder;
        var title = item.category === "titles" ? item.name : state.loadout.equippedTitle;
        var card = el("div", "store-preview-card");
        card.appendChild(buildAvatar(avatarUrl, borderUrl, "is-preview"));
        var text = el("div", "store-preview-text");
        text.appendChild(el("span", "store-preview-name", state.user ? state.user.username : "Your name"));
        text.appendChild(rankChip(title, item.category === "titles" ? "is-highlight" : ""));
        card.appendChild(text);
        stage.appendChild(card);
        stage.appendChild(el("span", "store-stage-label", "Preview on your player card"));
        return stage;
    }

    function renderShopDetail(item) {
        shopDetail.innerHTML = "";
        var back = button("store-detail-back", "‹ All " + CATEGORY_NOUNS[state.category][1], function () {
            shopWorkspace.setAttribute("data-detail-open", "false");
        });
        shopDetail.appendChild(back);
        shopDetail.appendChild(item.category === "characters" ? buildCharacterStage(item) : buildCosmeticStage(item));

        var info = el("div", "store-detail-info");
        var kicker = item.category === "characters"
            ? (item.arcLabel || "Character")
            : capitalize(item.rarity) + " " + CATEGORY_NOUNS[item.category][0];
        info.appendChild(el("span", "store-detail-kicker" + (item.rarity ? " rarity-" + item.rarity : ""), kicker));
        info.appendChild(el("h2", "store-detail-title", item.name));
        if (item.description) info.appendChild(el("p", "store-detail-desc", item.description));
        if (item.category === "characters" && item.skills.length) {
            var skillPanel = el("div", "store-skill-panel");
            skillPanel.id = "store-skill-panel";
            skillPanel.setAttribute("aria-live", "polite");
            skillPanel.hidden = true;
            info.appendChild(skillPanel);
        }
        if (item.category === "characters" && !item.owned && item.requiredMissionId) {
            var hint = el("p", "store-detail-hint", "");
            var missionTitle = state.missionTitles && state.missionTitles[item.requiredMissionId];
            hint.textContent = missionTitle
                ? "Prefer to earn it? Complete the mission “" + missionTitle + "” to unlock for free."
                : "Prefer to earn it? A mission unlocks this character for free.";
            info.appendChild(hint);
        }
        shopDetail.appendChild(info);
        shopDetail.appendChild(buildPurchaseBox(item));
        if (item.category === "characters") showStoreSkill(item);
    }

    function buildPurchaseBox(item) {
        var box = el("div", "store-buy");
        var ryo = getRyo();
        var busy = state.busyKey === item.key;
        var status = state.shopStatus.key === item.key ? state.shopStatus : null;

        if (!item.owned) {
            var priceRow = el("div", "store-buy-price");
            priceRow.appendChild(coin(item.price, "is-large"));
            var short = item.price - ryo;
            priceRow.appendChild(el("span", "store-buy-note" + (short > 0 ? " is-short" : ""),
                short > 0 ? "You need " + formatNumber(short) + " more Ryo" : "Balance after purchase: " + formatNumber(ryo - item.price)));
            box.appendChild(priceRow);
        }

        var actions = el("div", "store-buy-actions");
        if (!item.owned) {
            if (item.price > ryo) {
                var poor = button("store-button store-button-primary", "Not enough Ryo");
                poor.disabled = true;
                actions.appendChild(poor);
            } else if (state.confirmKey === item.key) {
                var confirm = button("store-button store-button-primary is-confirm", busy ? "Purchasing..." : "Confirm · " + formatNumber(item.price) + " Ryo", function () { purchase(item); });
                confirm.disabled = busy;
                actions.appendChild(confirm);
                var cancel = button("store-button store-button-ghost", "Cancel", function () {
                    state.confirmKey = "";
                    renderShop();
                });
                cancel.disabled = busy;
                actions.appendChild(cancel);
            } else {
                actions.appendChild(button("store-button store-button-primary", item.price ? "Purchase" : "Claim for free", function () {
                    state.confirmKey = item.key;
                    state.shopStatus = { key: "", text: "", tone: "" };
                    renderShop();
                    var confirmButton = shopDetail.querySelector(".is-confirm");
                    if (confirmButton) confirmButton.focus();
                }));
            }
        } else if (item.category === "characters") {
            actions.appendChild(button("store-button store-button-primary", "Build a team", function () {
                var playTab = document.querySelector('.selection-hub-tabs [data-hub-view="play"]');
                if (playTab) playTab.click();
            }));
        } else {
            actions.appendChild(buildEquipButton(item, busy, function () { renderShop(); }));
        }
        box.appendChild(actions);
        if (status && status.text) box.appendChild(el("p", "store-status is-" + (status.tone || "info"), status.text));
        return box;
    }

    function buildEquipButton(item, busy, rerender) {
        var type = EQUIP_TYPES[item.category];
        if (item.equipped) {
            var label = item.category === "avatars" ? "Use default avatar" : "Remove " + CATEGORY_NOUNS[item.category][0];
            var remove = button("store-button store-button-ghost", busy ? "Saving..." : label, function () {
                equip(type, "", item.key, rerender);
            });
            remove.disabled = busy;
            var wrap = el("span", "store-equipped-row");
            wrap.appendChild(el("span", "store-equipped-flag", "Equipped"));
            wrap.appendChild(remove);
            return wrap;
        }
        var equipButton = button("store-button store-button-primary", busy ? "Equipping..." : "Equip", function () {
            equip(type, item.key, item.key, rerender);
        });
        equipButton.disabled = busy;
        return equipButton;
    }

    function purchase(item) {
        if (state.busyKey) return;
        state.busyKey = item.key;
        state.selected[item.category] = item.key;
        renderShop();
        var request = item.category === "characters"
            ? postJson("/api/characters/buy-direct", { characterId: item.key }).then(function (data) {
                if (!Array.isArray(data.unlockedCharacterIds) || data.unlockedCharacterIds.indexOf(item.key) === -1) {
                    throw new Error("Purchase went through, but the roster could not confirm it. Refresh the page.");
                }
                if (window.ArenaRoster) window.ArenaRoster.markUnlocked(item.key, data.ryo);
                if (state.shop) state.shop.ryo = data.ryo;
                return item.name + " joined your roster.";
            })
            : postJson("/api/shop/purchase-cosmetic", { category: item.category, itemId: item.key }).then(function (data) {
                state.shop = data;
                setLoadout(data);
                setRyo(data.ryo);
                return "Purchased " + item.name + ". Equip it whenever you like.";
            });
        request.then(function (message) {
            state.shopStatus = { key: item.key, text: message, tone: "success" };
            playSound("sounds/start-round.mp3");
        }).catch(function (error) {
            state.shopStatus = { key: item.key, text: error.message || "The purchase could not be completed.", tone: "error" };
        }).then(function () {
            state.busyKey = "";
            state.confirmKey = "";
            // Keep the purchased item in view even though "For sale" would now hide it.
            if (state.filter === "sale" || state.filter === "affordable") {
                var stillListed = filterItems(getItems(state.category) || []).some(function (entry) { return entry.key === item.key; });
                if (!stillListed && state.shopStatus.tone === "success") {
                    state.filter = "all";
                    if (shopFilter) shopFilter.value = "all";
                }
            }
            renderShop();
        });
    }

    function equip(type, itemId, statusKey, rerender) {
        if (state.busyKey) return;
        state.busyKey = statusKey;
        rerender();
        postJson("/api/profile/equip", { type: type, itemId: itemId }).then(function (data) {
            setLoadout(data);
            setStatusFor(statusKey, data.message || "Saved.", "success");
        }).catch(function (error) {
            setStatusFor(statusKey, error.message || "That change could not be saved.", "error");
        }).then(function () {
            state.busyKey = "";
            rerenderVisible();
        });
    }

    function setStatusFor(key, text, tone) {
        if (state.view === "profile") state.lockerStatus = { text: text, tone: tone };
        else state.shopStatus = { key: key, text: text, tone: tone };
    }

    function rerenderVisible() {
        if (state.view === "shop") renderShop();
        if (state.view === "profile") renderProfile();
    }

    function openShop() {
        renderShop();
        loadShop(false).then(renderShop, renderShop);
        loadMissionTitles().then(function () { if (state.view === "shop" && state.category === "characters") renderShop(); });
    }

    // ---------- profile ----------

    function renderProfile() {
        profileTabs.forEach(function (tab) {
            var active = tab.getAttribute("data-profile-section") === state.profileSection;
            tab.classList.toggle("active", active);
            tab.setAttribute("aria-selected", String(active));
        });
        renderIdentity();
        profileBody.innerHTML = "";
        if (!state.user) {
            profileBody.appendChild(el("div", "store-empty", "Loading profile..."));
            return;
        }
        if (state.profileSection === "locker") renderLocker();
        else if (state.profileSection === "settings") renderSettings();
        else renderOverview();
    }

    function renderIdentity() {
        profileIdentity.innerHTML = "";
        if (!state.user) {
            profileIdentity.appendChild(el("div", "store-empty", "Loading profile..."));
            return;
        }
        var profile = state.user.profile || {};
        var ladder = profile.ladder || {};
        var clan = profile.clan || null;
        profileIdentity.appendChild(buildAvatar(state.loadout.avatarUrl, state.loadout.equippedBorder, "is-identity"));
        profileIdentity.appendChild(el("h2", "profile-identity-name", state.user.username));
        profileIdentity.appendChild(rankChip(state.loadout.equippedTitle));
        profileIdentity.appendChild(el("p", "profile-identity-rank", "Level " + formatNumber(ladder.level || 1) + (state.loadout.equippedTitle ? " · " + ladderRank() : "")));

        var next = Number(ladder.experienceForNextLevel) || 0;
        var into = Number(ladder.experienceIntoLevel) || 0;
        var meter = el("div", "profile-level");
        var track = el("div", "profile-level-track");
        var fill = el("span", "profile-level-fill");
        fill.style.width = (next ? Math.min(100, Math.max(0, (into / next) * 100)) : 100) + "%";
        track.appendChild(fill);
        meter.appendChild(track);
        meter.appendChild(el("span", "profile-level-text", next ? formatNumber(into) + " / " + formatNumber(next) + " XP" : "Max level"));
        profileIdentity.appendChild(meter);

        var facts = el("dl", "profile-identity-facts");
        [
            ["Clan", clan && clan.name ? (clan.abbreviation || clan.name) : "None"],
            ["Ladder rank", ladder.ladderRank ? "#" + formatNumber(ladder.ladderRank) : "Unranked"],
            ["Record", formatNumber(ladder.wins) + "W – " + formatNumber(ladder.losses) + "L"]
        ].forEach(function (pair) {
            var row = el("div", "profile-fact");
            row.appendChild(el("dt", "", pair[0]));
            row.appendChild(el("dd", "", pair[1]));
            facts.appendChild(row);
        });
        profileIdentity.appendChild(facts);

        if (state.profileSection !== "locker") {
            profileIdentity.appendChild(button("store-button store-button-ghost profile-customize", "Customize look", function () {
                setProfileSection("locker");
            }));
        }
    }

    function section(title, extraClass) {
        var card = el("section", "profile-card" + (extraClass ? " " + extraClass : ""));
        card.appendChild(el("h3", "profile-card-title", title));
        return card;
    }

    function formatDate(value, withTime) {
        var date = value ? new Date(value) : null;
        if (!date || Number.isNaN(date.getTime())) return "Unknown";
        var options = withTime
            ? { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }
            : { year: "numeric", month: "long", day: "numeric" };
        return date.toLocaleString("en-US", options);
    }

    function formatSigned(value) {
        var number = Math.round(Number(value) || 0);
        return number > 0 ? "+" + number : String(number);
    }

    function opponentName(name) {
        var text = String(name || "").trim();
        if (!text) return "Unknown";
        return text.toLowerCase().indexOf("__game_bot__:") === 0 ? "Game Bot" : text;
    }

    function renderOverview() {
        var profile = state.user.profile || {};
        var ladder = profile.ladder || {};
        var wins = Number(ladder.wins) || 0;
        var losses = Number(ladder.losses) || 0;
        var total = wins + losses;

        var record = section("Ladder record");
        var stats = el("div", "profile-stats");
        [
            ["Wins", formatNumber(wins)],
            ["Losses", formatNumber(losses)],
            ["Win rate", total ? ((wins / total) * 100).toFixed(1) + "%" : "—"],
            ["Streak", formatSigned(ladder.streak)],
            ["Best streak", formatSigned(ladder.highestStreak)],
            ["Ladder rank", ladder.ladderRank ? "#" + formatNumber(ladder.ladderRank) : "Unranked"],
            ["Experience", formatNumber(ladder.experiencePoints) + " XP"],
            ["Highest level", "Level " + formatNumber(ladder.highestLevel || ladder.level || 1)],
            ["Fame points", formatNumber(ladder.famePoints)]
        ].forEach(function (pair) {
            var stat = el("div", "profile-stat");
            stat.appendChild(el("span", "profile-stat-label", pair[0]));
            stat.appendChild(el("strong", "profile-stat-value", pair[1]));
            stats.appendChild(stat);
        });
        record.appendChild(stats);
        profileBody.appendChild(record);

        var account = section("Account");
        var facts = el("dl", "profile-facts");
        var clan = profile.clan || null;
        var role = String(state.user.role || "player").replace(/_/g, " ");
        [
            ["Registered", formatDate(state.user.createdAt)],
            ["Site rank", role === "player" ? "Member" : capitalize(role)],
            ["Clan", clan && clan.name ? clan.name : "No clan"],
            ["Ryo", formatNumber(getRyo())]
        ].forEach(function (pair) {
            var row = el("div", "profile-fact");
            row.appendChild(el("dt", "", pair[0]));
            row.appendChild(el("dd", "", pair[1]));
            facts.appendChild(row);
        });
        account.appendChild(facts);
        profileBody.appendChild(account);

        var history = section("Recent battles", "is-wide");
        history.querySelector(".profile-card-title").appendChild(el("span", "profile-card-note", "Last 24 hours"));
        var games = [];
        [["recentLadderGames", "Ranked"], ["recentQuickGames", "Quick"], ["recentPrivateGames", "Private"]].forEach(function (pair) {
            (Array.isArray(profile[pair[0]]) ? profile[pair[0]] : []).forEach(function (game) {
                games.push({ game: game, mode: pair[1] });
            });
        });
        games.sort(function (a, b) { return new Date(b.game.playedAt || 0) - new Date(a.game.playedAt || 0); });
        if (!games.length) {
            history.appendChild(el("p", "profile-muted", "No battles in the last 24 hours. Queue up from Start Playing."));
        } else {
            var list = el("ul", "profile-games");
            games.slice(0, 12).forEach(function (entry) {
                var game = entry.game;
                var winner = String(game.winnerUsername || "");
                var outcome = !winner ? "draw" : winner === state.user.username ? "win" : "loss";
                var row = el("li", "profile-game is-" + outcome);
                row.appendChild(el("span", "profile-game-result", outcome === "win" ? "W" : outcome === "loss" ? "L" : "–"));
                var main = el("span", "profile-game-main");
                main.appendChild(el("span", "profile-game-opponent", "vs " + opponentName(game.opponentUsername)));
                main.appendChild(el("span", "profile-game-meta", entry.mode + " · " + formatDate(game.playedAt, true)));
                row.appendChild(main);
                if (entry.mode === "Ranked" && Number.isFinite(Number(game.expDelta))) {
                    row.appendChild(el("span", "profile-game-xp", formatSigned(game.expDelta) + " XP"));
                }
                list.appendChild(row);
            });
            history.appendChild(list);
        }
        profileBody.appendChild(history);
    }

    function renderLocker() {
        var card = section("Locker", "is-wide is-locker");
        var tabs = el("div", "locker-tabs");
        tabs.setAttribute("role", "tablist");
        ["avatars", "borders", "titles"].forEach(function (category) {
            var owned = (getCosmeticItems(category) || []).filter(function (item) { return item.owned; }).length;
            var tab = button("locker-tab" + (state.lockerCategory === category ? " active" : ""), capitalize(category), function () {
                state.lockerCategory = category;
                state.lockerStatus = { text: "", tone: "" };
                renderProfile();
            });
            tab.setAttribute("role", "tab");
            tab.setAttribute("aria-selected", String(state.lockerCategory === category));
            tab.appendChild(el("span", "store-tab-count", String(owned)));
            tabs.appendChild(tab);
        });
        card.appendChild(tabs);

        var items = getCosmeticItems(state.lockerCategory);
        if (!items) {
            card.appendChild(el("div", "store-empty", state.shopError || "Loading your locker..."));
            profileBody.appendChild(card);
            return;
        }

        var grid = el("div", "locker-grid");
        grid.appendChild(buildLockerDefaultTile());
        if (state.lockerCategory === "avatars") {
            var customUrl = state.loadout.avatarUrl;
            var isCatalogAvatar = items.some(function (item) { return item.imageUrl === customUrl; });
            if (customUrl && customUrl !== DEFAULT_AVATAR && !isCatalogAvatar) {
                var custom = buildLockerTile({ key: "custom", name: "Custom upload", category: "avatars", imageUrl: customUrl, equipped: true }, null);
                grid.appendChild(custom);
            }
        }
        var owned = items.filter(function (item) { return item.owned; });
        owned.forEach(function (item) {
            grid.appendChild(buildLockerTile(item, function () { equip(EQUIP_TYPES[item.category], item.key, item.key, renderProfile); }));
        });
        if (state.lockerCategory === "avatars") {
            var upload = button("locker-tile is-action", "", function () { if (avatarFileInput) avatarFileInput.click(); });
            upload.appendChild(el("span", "locker-action-icon", "+"));
            upload.appendChild(el("span", "locker-tile-name", state.busyKey === "upload" ? "Uploading..." : "Upload image"));
            upload.disabled = Boolean(state.busyKey);
            grid.appendChild(upload);
        }
        var unowned = items.length - owned.length;
        if (unowned > 0) {
            var more = button("locker-tile is-action is-shop", "", function () { goToShop(state.lockerCategory); });
            more.appendChild(el("span", "locker-action-icon", "R"));
            more.appendChild(el("span", "locker-tile-name", unowned + " more in the Shop"));
            grid.appendChild(more);
        }
        card.appendChild(grid);

        var note = state.lockerCategory === "avatars"
            ? "Larger images are cropped to 100×100 (GIFs stay animated) and replace any earlier custom image."
            : state.lockerCategory === "borders"
                ? "Borders frame your avatar on your player card."
                : "An equipped title replaces your rank under your name in-game.";
        card.appendChild(el("p", "profile-muted locker-note", note));
        if (state.lockerStatus.text) card.appendChild(el("p", "store-status is-" + state.lockerStatus.tone, state.lockerStatus.text));
        profileBody.appendChild(card);
    }

    function buildLockerDefaultTile() {
        var category = state.lockerCategory;
        var equipped = category === "avatars"
            ? !state.loadout.avatarUrl || state.loadout.avatarUrl === DEFAULT_AVATAR
            : category === "borders" ? !state.loadout.equippedBorder : !state.loadout.equippedTitle;
        var label = category === "avatars" ? "Default avatar" : category === "borders" ? "No border" : "Show my rank";
        return buildLockerTile({ key: "none", name: label, category: category, imageUrl: category === "avatars" ? DEFAULT_AVATAR : "", equipped: equipped, isDefault: true }, function () {
            equip(EQUIP_TYPES[category], "", "none", renderProfile);
        });
    }

    function buildLockerTile(item, onEquip) {
        var tile = el("button", "locker-tile" + (item.rarity ? " rarity-" + item.rarity : ""));
        tile.type = "button";
        if (item.equipped) tile.classList.add("is-equipped");
        if (item.isDefault) tile.classList.add("is-default");
        var art = el("span", "locker-tile-art");
        if (item.category === "titles") {
            art.classList.add("is-title");
            art.appendChild(el("span", "store-tile-title-text" + (item.isDefault ? " is-empty" : ""), item.isDefault ? ladderRank() : item.name));
        } else if (item.category === "borders") {
            art.appendChild(buildAvatar(state.loadout.avatarUrl, item.imageUrl, "is-tile"));
        } else {
            art.appendChild(buildAvatar(item.imageUrl, "", "is-tile"));
        }
        tile.appendChild(art);
        if (item.category !== "titles" || item.isDefault) tile.appendChild(el("span", "locker-tile-name", item.name));
        var busy = state.busyKey === item.key;
        tile.appendChild(el("span", "locker-tile-state", busy ? "Saving..." : item.equipped ? "Equipped" : "Equip"));
        tile.setAttribute("aria-pressed", String(Boolean(item.equipped)));
        tile.setAttribute("aria-label", (item.equipped ? "Equipped: " : "Equip ") + item.name);
        if (item.equipped || !onEquip) {
            tile.setAttribute("aria-disabled", "true");
        } else {
            tile.disabled = Boolean(state.busyKey);
            tile.addEventListener("click", onEquip);
        }
        return tile;
    }

    function goToShop(category) {
        state.category = CATEGORIES.indexOf(category) !== -1 ? category : "characters";
        var shopTab = document.querySelector('.selection-hub-tabs [data-hub-view="shop"]');
        if (shopTab) shopTab.click();
    }

    function uploadAvatar(file) {
        if (!file) return;
        if (AVATAR_TYPES.indexOf(file.type) === -1) {
            state.lockerStatus = { text: "Use a PNG, JPEG, GIF, or WebP image.", tone: "error" };
            renderProfile();
            return;
        }
        if (file.size > AVATAR_MAX_FILE_BYTES) {
            state.lockerStatus = { text: "That image is over 2 MB. Pick a smaller one.", tone: "error" };
            renderProfile();
            return;
        }
        state.busyKey = "upload";
        state.lockerStatus = { text: "", tone: "" };
        renderProfile();
        readAsDataUrl(file).then(function (dataUrl) {
            return postJson("/api/profile/avatar/upload", { dataUrl: dataUrl });
        }).then(function (data) {
            if (data.user) setUser(data.user);
            state.lockerStatus = { text: "Your new avatar is live.", tone: "success" };
        }).catch(function (error) {
            state.lockerStatus = { text: error.message || "The avatar could not be uploaded.", tone: "error" };
        }).then(function () {
            state.busyKey = "";
            renderProfile();
        });
    }

    // The server crops and resizes to 100x100, so send the original file (animated GIFs stay animated).
    function readAsDataUrl(file) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onerror = function () { reject(new Error("That image could not be read.")); };
            reader.onload = function () { resolve(reader.result); };
            reader.readAsDataURL(file);
        });
    }

    function settingsStatus(key) {
        var status = state.settingsStatus[key];
        return status && status.text ? el("p", "store-status is-" + status.tone, status.text) : null;
    }

    function renderSettings() {
        var profile = state.user.profile || {};

        var sound = section("Sound");
        var modalSlider = document.getElementById("settings-master-volume");
        var volume = modalSlider ? Number(modalSlider.value) || 0 : 70;
        var soundRow = el("label", "settings-row is-stacked");
        var soundText = el("span", "settings-row-text");
        soundText.appendChild(el("strong", "", "Master volume"));
        soundText.appendChild(el("span", "", "Battle effects, match alerts, and menu sounds."));
        soundRow.appendChild(soundText);
        var sliderWrap = el("span", "settings-slider-wrap profile-slider");
        var slider = el("input", "");
        slider.type = "range";
        slider.min = "0";
        slider.max = "100";
        slider.step = "1";
        slider.value = String(volume);
        slider.setAttribute("aria-label", "Master volume");
        var sliderValue = el("span", "settings-value", volume + "%");
        slider.addEventListener("input", function () {
            sliderValue.textContent = slider.value + "%";
            // Route through the Headquarters slider so the existing sound manager stays the single owner.
            if (modalSlider) {
                modalSlider.value = slider.value;
                modalSlider.dispatchEvent(new Event("input", { bubbles: true }));
            }
        });
        sliderWrap.appendChild(slider);
        sliderWrap.appendChild(sliderValue);
        soundRow.appendChild(sliderWrap);
        sound.appendChild(soundRow);
        profileBody.appendChild(sound);

        var matchmaking = section("Matchmaking");
        var botEnabled = !profile.matchmaking || profile.matchmaking.battleBotEnabled !== false;
        var botRow = el("div", "settings-row");
        var botText = el("span", "settings-row-text");
        botText.appendChild(el("strong", "", "Game Bot fallback"));
        botText.appendChild(el("span", "", "If no opponent is found within a few seconds, you'll face the Game Bot instead of waiting."));
        botRow.appendChild(botText);
        var toggle = button("settings-toggle" + (botEnabled ? " is-on" : ""), "", function () {
            toggle.disabled = true;
            postJson("/api/profile/matchmaking", { battleBotEnabled: !botEnabled }).then(function (data) {
                if (data.user) state.user = data.user;
                state.settingsStatus.matchmaking = { text: !botEnabled ? "Game Bot fallback is on." : "Game Bot fallback is off.", tone: "success" };
            }).catch(function (error) {
                state.settingsStatus.matchmaking = { text: error.message || "That setting could not be saved.", tone: "error" };
            }).then(renderProfile);
        });
        toggle.setAttribute("role", "switch");
        toggle.setAttribute("aria-checked", String(botEnabled));
        toggle.setAttribute("aria-label", "Game Bot fallback");
        toggle.appendChild(el("span", "settings-toggle-knob", ""));
        botRow.appendChild(toggle);
        matchmaking.appendChild(botRow);
        var matchStatus = settingsStatus("matchmaking");
        if (matchStatus) matchmaking.appendChild(matchStatus);
        profileBody.appendChild(matchmaking);

        var backgrounds = section("Backgrounds", "is-wide");
        backgrounds.appendChild(el("p", "profile-muted", "Use direct image links (https). Leave a field empty to rotate the default village art."));
        var current = state.backgroundDraft || profile.backgrounds || {};
        var form = el("form", "settings-form");
        form.noValidate = true;
        var fields = [["selectionUrl", "Menu background", current.selectionUrl], ["ingameUrl", "Battle background", current.ingameUrl]];
        var inputs = {};
        fields.forEach(function (field) {
            var label = el("label", "settings-field");
            label.appendChild(el("span", "", field[1]));
            var input = el("input", "");
            input.type = "url";
            input.inputMode = "url";
            input.placeholder = "https://...";
            input.autocomplete = "off";
            input.spellcheck = false;
            input.value = field[2] || "";
            inputs[field[0]] = input;
            label.appendChild(input);
            form.appendChild(label);
        });
        var formActions = el("div", "settings-form-actions");
        var save = el("button", "store-button store-button-primary", "Save backgrounds");
        save.type = "submit";
        var reset = button("store-button store-button-ghost", "Use defaults", function () {
            inputs.selectionUrl.value = "";
            inputs.ingameUrl.value = "";
            saveBackgrounds(inputs, save);
        });
        formActions.appendChild(save);
        formActions.appendChild(reset);
        form.appendChild(formActions);
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            saveBackgrounds(inputs, save);
        });
        backgrounds.appendChild(form);
        var bgStatus = settingsStatus("backgrounds");
        if (bgStatus) backgrounds.appendChild(bgStatus);
        profileBody.appendChild(backgrounds);

        var account = section("Account", "is-wide");
        var links = el("div", "settings-links");
        var hq = button("store-button store-button-ghost", "Quests, achievements & rewards", function () {
            var trigger = document.querySelector("[data-settings-trigger]");
            if (trigger) trigger.click();
        });
        links.appendChild(hq);
        var site = el("a", "store-button store-button-ghost", "Manage account on the website ↗");
        site.href = "profile.html";
        site.target = "_blank";
        site.rel = "noopener";
        links.appendChild(site);
        links.appendChild(button("store-button store-button-danger", "Sign out", signOut));
        account.appendChild(links);
        profileBody.appendChild(account);
    }

    function saveBackgrounds(inputs, save) {
        var selectionUrl = inputs.selectionUrl.value.trim();
        var ingameUrl = inputs.ingameUrl.value.trim();
        save.disabled = true;
        save.textContent = "Saving...";
        postJson("/api/profile/backgrounds", { selectionUrl: selectionUrl, ingameUrl: ingameUrl }).then(function (data) {
            if (data.user) state.user = data.user;
            state.backgroundDraft = null;
            applySelectionBackground(selectionUrl);
            state.settingsStatus.backgrounds = { text: "Backgrounds saved.", tone: "success" };
        }).catch(function (error) {
            // Keep what the player typed so they can correct it.
            state.backgroundDraft = { selectionUrl: selectionUrl, ingameUrl: ingameUrl };
            state.settingsStatus.backgrounds = { text: error.message || "Backgrounds could not be saved.", tone: "error" };
        }).then(renderProfile);
    }

    function applySelectionBackground(url) {
        var stage = document.querySelector(".background");
        if (!stage) return;
        var image = url || stage.dataset.poolBg;
        if (image) stage.style.setProperty("--selection-stage-image", 'url("' + image.replace(/"/g, "%22") + '")');
    }

    function signOut() {
        window.ArenaSession.fetch("/api/logout", { method: "POST", credentials: "include" }).catch(function () {}).then(function () {
            window.ArenaSession.storage.removeItem("narutoUser");
            window.location.href = "selection-login.html";
        });
    }

    function setProfileSection(name) {
        state.profileSection = ["overview", "locker", "settings"].indexOf(name) !== -1 ? name : "overview";
        state.lockerStatus = { text: "", tone: "" };
        renderProfile();
        if (state.profileSection === "locker" && !state.shop) loadShop(false).then(renderProfile, renderProfile);
    }

    function openProfile() {
        renderProfile();
        loadProfile().then(renderProfile).catch(function () {});
        loadShop(false).then(renderProfile, renderProfile);
    }

    // ---------- wiring ----------

    shopTabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            state.category = tab.getAttribute("data-shop-category") || "characters";
            state.confirmKey = "";
            state.shopStatus = { key: "", text: "", tone: "" };
            shopWorkspace.setAttribute("data-detail-open", "false");
            renderShop();
        });
    });

    if (shopFilter) shopFilter.addEventListener("change", function () {
        state.filter = shopFilter.value;
        state.confirmKey = "";
        renderShop();
    });

    if (shopSearch) shopSearch.addEventListener("input", function () {
        state.search = shopSearch.value;
        renderShop();
    });

    shopGrid.addEventListener("click", function (event) {
        var tile = event.target.closest("[data-shop-item]");
        if (!tile) return;
        var key = tile.getAttribute("data-shop-item");
        if (state.selected[state.category] !== key) {
            state.selected[state.category] = key;
            state.confirmKey = "";
            state.shopStatus = { key: "", text: "", tone: "" };
            renderShop();
            var focusTile = shopGrid.querySelector('[data-shop-item="' + key.replace(/"/g, '\\"') + '"]');
            if (focusTile) focusTile.focus();
        }
        shopWorkspace.setAttribute("data-detail-open", "true");
    });

    profileTabs.forEach(function (tab) {
        tab.addEventListener("click", function () { setProfileSection(tab.getAttribute("data-profile-section")); });
    });

    if (avatarFileInput) avatarFileInput.addEventListener("change", function () {
        var file = avatarFileInput.files && avatarFileInput.files[0];
        avatarFileInput.value = "";
        uploadAvatar(file);
    });

    document.addEventListener("arena:hub-view", function (event) {
        state.view = event.detail && event.detail.view;
        if (state.view === "shop") openShop();
        if (state.view === "profile") openProfile();
    });

    document.addEventListener("arena:ryo-changed", function () {
        if (state.busyKey) return;
        if (state.view === "shop") renderShop();
        if (state.view === "profile") renderIdentity();
    });

    // Rewards granted elsewhere (the daily spin) change ownership and loadout.
    document.addEventListener("arena:inventory-changed", function () {
        state.shopRequest = null;
        if (state.view === "shop" || state.view === "profile" || state.shop) {
            loadShop(true).then(rerenderVisible, rerenderVisible);
        }
    });

    document.addEventListener("arena:loadout-changed", function (event) {
        setLoadout(event.detail || {});
        rerenderVisible();
    });

    document.addEventListener("arena:roster-ready", function () {
        if (state.view === "shop") renderShop();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && state.view === "shop" && state.confirmKey && !state.busyKey) {
            state.confirmKey = "";
            renderShop();
        }
    });

    // Paint the equipped border and title on the player card as soon as the session is known.
    if (window.ArenaSession && window.ArenaSession.ready) {
        window.ArenaSession.ready.then(function (user) {
            if (user) setUser(user);
        });
    }
})();
