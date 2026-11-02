// Daily Fortune Wheel. The server picks and grants the prize; this file draws the wheel,
// animates it onto the slice the server chose, and shows what was won.
(function () {
    "use strict";
    var modal = document.getElementById("daily-spin-modal");
    if (!modal) return;

    var wheelEl = modal.querySelector("[data-daily-spin-wheel]");
    var sideEl = modal.querySelector("[data-daily-spin-side]");
    var goButton = modal.querySelector("[data-daily-spin-go]");
    var readyBadge = document.querySelector("[data-daily-spin-ready]");
    var DISMISS_KEY = "naDailySpinDismissed";
    var SPIN_MS = 4600;
    var DEFAULT_AVATAR = "found-remaster.png";
    // Slice fills: prizes stand out from the Ryo slices around them.
    var SLICE_STYLE = {
        ryo: { fill: "#1d3039", text: "#f2d7b0" },
        avatars: { fill: "#24423a", text: "#bfe8cf" },
        titles: { fill: "#243650", text: "#c6dbf7" },
        borders: { fill: "#352c4a", text: "#e0cdfa" },
        character: { fill: "#4a3720", text: "#ffd9a0" }
    };
    var PRIZE_LABELS = { avatars: "Avatar", titles: "Title", borders: "Border", character: "Character" };

    var state = { wheel: [], available: false, nextSpinAt: "", lastResult: null, rotation: 0, spinning: false, result: null, error: "", loaded: false };
    var countdownTimer = null;

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text != null) node.textContent = text;
        return node;
    }

    function fetchJson(url, options) {
        return window.ArenaSession.fetch(url, Object.assign({ credentials: "include" }, options || {})).then(function (res) {
            return res.json().catch(function () { return {}; }).then(function (data) {
                if (!res.ok) {
                    var error = new Error((data && data.error) || "Request failed.");
                    error.data = data;
                    throw error;
                }
                return data;
            });
        });
    }

    function formatNumber(value) {
        return Math.max(0, Math.round(Number(value) || 0)).toLocaleString("en-US");
    }

    function todayKey() {
        return new Date().toISOString().slice(0, 10);
    }

    function storage(method, key, value) {
        try { return window.ArenaSession.storage[method](key, value); } catch (error) { return null; }
    }

    function soundVolume() {
        try {
            var saved = JSON.parse(storage("getItem", "narutoSoundSettings") || "null");
            if (saved && typeof saved.volume === "number") return Math.min(1, Math.max(0, saved.volume));
        } catch (error) {}
        return 0.7;
    }

    function playSound(src) {
        var volume = soundVolume();
        if (!volume) return;
        try {
            var audio = new Audio(src);
            audio.volume = volume;
            var playing = audio.play();
            if (playing && playing.catch) playing.catch(function () {});
        } catch (error) {}
    }

    function reducedMotion() {
        return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    // ---------- wheel drawing ----------

    function polar(cx, cy, r, degrees) {
        var radians = (degrees - 90) * Math.PI / 180;
        return [cx + r * Math.cos(radians), cy + r * Math.sin(radians)];
    }

    function sliceLabel(slice) {
        if (slice.kind === "ryo") return { main: formatNumber(slice.ryo), sub: "Ryo" };
        if (slice.exhausted) return { main: formatNumber(slice.fallbackRyo), sub: "Ryo" };
        return { main: PRIZE_LABELS[slice.kind] || slice.label, sub: slice.kind === "character" ? "Rare!" : "" };
    }

    function drawWheel() {
        var ns = "http://www.w3.org/2000/svg";
        var size = 300;
        var c = size / 2;
        var r = c - 6;
        var count = state.wheel.length || 1;
        var step = 360 / count;
        var svg = document.createElementNS(ns, "svg");
        svg.setAttribute("viewBox", "0 0 " + size + " " + size);
        svg.setAttribute("role", "img");
        svg.setAttribute("aria-label", "Prize wheel with " + count + " slices");
        var rim = document.createElementNS(ns, "circle");
        rim.setAttribute("cx", c); rim.setAttribute("cy", c); rim.setAttribute("r", c - 2);
        rim.setAttribute("class", "daily-spin-rim");
        svg.appendChild(rim);
        state.wheel.forEach(function (slice, index) {
            var start = index * step;
            var end = start + step;
            var a = polar(c, c, r, start);
            var b = polar(c, c, r, end);
            var style = SLICE_STYLE[slice.exhausted ? "ryo" : slice.kind] || SLICE_STYLE.ryo;
            var path = document.createElementNS(ns, "path");
            path.setAttribute("d", "M" + c + " " + c + " L" + a[0] + " " + a[1] + " A" + r + " " + r + " 0 0 1 " + b[0] + " " + b[1] + " Z");
            path.setAttribute("fill", style.fill);
            path.setAttribute("class", "daily-spin-slice" + (slice.kind !== "ryo" && !slice.exhausted ? " is-prize" : ""));
            path.setAttribute("data-slice", String(index));
            svg.appendChild(path);
            var label = sliceLabel(slice);
            var mid = start + step / 2;
            var group = document.createElementNS(ns, "g");
            group.setAttribute("transform", "rotate(" + mid + " " + c + " " + c + ")");
            var main = document.createElementNS(ns, "text");
            main.setAttribute("x", c); main.setAttribute("y", c - r + 34);
            main.setAttribute("text-anchor", "middle");
            main.setAttribute("class", "daily-spin-label");
            main.setAttribute("fill", style.text);
            main.textContent = label.main;
            group.appendChild(main);
            if (label.sub) {
                var sub = document.createElementNS(ns, "text");
                sub.setAttribute("x", c); sub.setAttribute("y", c - r + 48);
                sub.setAttribute("text-anchor", "middle");
                sub.setAttribute("class", "daily-spin-sublabel");
                sub.setAttribute("fill", style.text);
                sub.textContent = label.sub;
                group.appendChild(sub);
            }
            svg.appendChild(group);
        });
        wheelEl.innerHTML = "";
        wheelEl.appendChild(svg);
        wheelEl.style.transform = "rotate(" + state.rotation + "deg)";
    }

    // ---------- side panel ----------

    function renderSide() {
        sideEl.innerHTML = "";
        stopCountdown();
        if (state.error) sideEl.appendChild(el("p", "daily-spin-error", state.error));
        if (!state.loaded) {
            sideEl.appendChild(el("p", "daily-spin-muted", "Loading the wheel…"));
            return;
        }
        if (state.spinning) {
            sideEl.appendChild(el("p", "daily-spin-kicker", "Spinning…"));
            sideEl.appendChild(el("p", "daily-spin-muted", "Good luck, shinobi."));
            return;
        }
        if (state.result) {
            sideEl.appendChild(resultCard(state.result, true));
        } else if (!state.available && state.lastResult) {
            sideEl.appendChild(el("p", "daily-spin-kicker", "Today's prize"));
            sideEl.appendChild(resultCard(state.lastResult, false));
        } else {
            sideEl.appendChild(oddsList());
        }
        if (!state.available) sideEl.appendChild(countdown());
        updateButton();
    }

    function oddsList() {
        var wrap = el("div", "daily-spin-odds");
        wrap.appendChild(el("p", "daily-spin-kicker", "Possible prizes"));
        var groups = {};
        state.wheel.forEach(function (slice) {
            var key = slice.kind === "ryo" ? "ryo" : slice.kind;
            groups[key] = groups[key] || { chance: 0, slice: slice };
            groups[key].chance += slice.chance;
        });
        var list = el("ul", "");
        ["character", "borders", "titles", "avatars", "ryo"].forEach(function (key) {
            var group = groups[key];
            if (!group) return;
            var row = el("li", "daily-spin-odd is-" + key);
            row.appendChild(el("span", "daily-spin-swatch"));
            var text = el("span", "daily-spin-odd-text");
            text.appendChild(el("strong", "", key === "ryo" ? "Ryo (50–150)" : (key === "character" ? "Unowned character" : "Unowned " + PRIZE_LABELS[key].toLowerCase())));
            if (group.slice.exhausted) text.appendChild(el("small", "", "You own them all, so this pays " + formatNumber(group.slice.fallbackRyo) + " Ryo"));
            row.appendChild(text);
            row.appendChild(el("span", "daily-spin-odd-chance", group.chance + "%"));
            list.appendChild(row);
        });
        wrap.appendChild(list);
        return wrap;
    }

    function rewardArt(reward) {
        var art = el("div", "daily-spin-art is-" + reward.kind);
        if (reward.kind === "ryo") {
            art.appendChild(el("span", "daily-spin-coin", "R"));
        } else if (reward.kind === "titles") {
            art.appendChild(el("span", "daily-spin-title-art", reward.item.name));
        } else {
            var src = reward.kind === "character" ? reward.character.facePicture
                : reward.kind === "borders" ? currentAvatar() : reward.item.imageUrl;
            var frame = el("span", "daily-spin-avatar");
            var img = el("img", "");
            img.alt = "";
            img.src = window.localCharacterImage ? window.localCharacterImage(src || DEFAULT_AVATAR) : (src || DEFAULT_AVATAR);
            img.addEventListener("error", function () { img.src = DEFAULT_AVATAR; }, { once: true });
            frame.appendChild(img);
            if (reward.kind === "borders" && reward.item.imageUrl) {
                var border = el("img", "daily-spin-avatar-border");
                border.alt = "";
                border.src = reward.item.imageUrl;
                frame.appendChild(border);
            }
            art.appendChild(frame);
        }
        return art;
    }

    function currentAvatar() {
        var img = document.getElementById("player-avatar-img");
        return img && img.getAttribute("src") || DEFAULT_AVATAR;
    }

    function resultCard(reward, fresh) {
        var card = el("div", "daily-spin-result" + (fresh ? " is-fresh" : "") + (reward.item && reward.item.rarity ? " rarity-" + reward.item.rarity : ""));
        card.appendChild(rewardArt(reward));
        var text = el("div", "daily-spin-result-text");
        if (reward.kind === "ryo") {
            text.appendChild(el("span", "daily-spin-kicker", reward.fallback ? "You already own every " + (PRIZE_LABELS[reward.prize] || "prize").toLowerCase() : "Ryo"));
            text.appendChild(el("strong", "daily-spin-result-name", "+" + formatNumber(reward.ryo) + " Ryo"));
            if (reward.fallback) text.appendChild(el("p", "daily-spin-muted", "So you get Ryo instead."));
        } else if (reward.kind === "character") {
            text.appendChild(el("span", "daily-spin-kicker", "New character"));
            text.appendChild(el("strong", "daily-spin-result-name", reward.character.name));
            text.appendChild(el("p", "daily-spin-muted", "Unlocked and ready in your roster."));
        } else {
            text.appendChild(el("span", "daily-spin-kicker", (reward.item.rarity ? capitalize(reward.item.rarity) + " " : "") + PRIZE_LABELS[reward.kind].toLowerCase()));
            text.appendChild(el("strong", "daily-spin-result-name", reward.item.name));
            if (reward.item.description) text.appendChild(el("p", "daily-spin-muted", reward.item.description));
        }
        card.appendChild(text);
        if (fresh) card.appendChild(resultActions(reward));
        return card;
    }

    function capitalize(value) {
        var text = String(value || "");
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    function resultActions(reward) {
        var actions = el("div", "daily-spin-actions");
        if (reward.kind === "avatars" || reward.kind === "borders" || reward.kind === "titles") {
            var equip = el("button", "store-button store-button-primary", "Equip now");
            equip.type = "button";
            equip.addEventListener("click", function () {
                equip.disabled = true;
                equip.textContent = "Equipping…";
                var type = { avatars: "avatar", borders: "border", titles: "title" }[reward.kind];
                fetchJson("/api/profile/equip", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: type, itemId: reward.item.id })
                }).then(function (data) {
                    document.dispatchEvent(new CustomEvent("arena:loadout-changed", { detail: data }));
                    equip.textContent = "Equipped";
                }).catch(function (error) {
                    equip.disabled = false;
                    equip.textContent = "Equip now";
                    state.error = error.message;
                    renderSide();
                });
            });
            actions.appendChild(equip);
        }
        var done = el("button", "store-button store-button-ghost", reward.kind === "character" ? "Build a team" : "Close");
        done.type = "button";
        done.addEventListener("click", close);
        actions.appendChild(done);
        return actions;
    }

    function countdown() {
        var node = el("p", "daily-spin-countdown");
        var tick = function () {
            var ms = new Date(state.nextSpinAt).getTime() - Date.now();
            if (!(ms > 0)) {
                node.textContent = "A new spin is ready.";
                stopCountdown();
                load(true);
                return;
            }
            var hours = Math.floor(ms / 3600000);
            var minutes = Math.floor((ms % 3600000) / 60000);
            node.textContent = "Next spin in " + (hours ? hours + "h " : "") + minutes + "m";
        };
        tick();
        countdownTimer = setInterval(tick, 30000);
        return node;
    }

    function stopCountdown() {
        if (countdownTimer) clearInterval(countdownTimer);
        countdownTimer = null;
    }

    function updateButton() {
        goButton.disabled = state.spinning || !state.available || !state.loaded;
        goButton.textContent = state.spinning ? "…" : state.available ? "Spin" : "Done";
        goButton.setAttribute("aria-label", state.available ? "Spin the wheel" : "Already spun today");
        if (readyBadge) readyBadge.hidden = !state.available;
        document.dispatchEvent(new CustomEvent("arena:daily-spin-state", { detail: { available: state.available } }));
    }

    // ---------- spinning ----------

    function spin() {
        if (state.spinning || !state.available) return;
        state.spinning = true;
        state.error = "";
        state.result = null;
        renderSide();
        updateButton();
        fetchJson("/api/daily-spin", { method: "POST" }).then(function (data) {
            var count = state.wheel.length;
            var step = 360 / count;
            var center = data.sliceIndex * step + step / 2;
            var jitter = (Math.random() - 0.5) * step * 0.6;
            var base = state.rotation - (state.rotation % 360);
            var turns = reducedMotion() ? 1 : 6;
            state.rotation = base + turns * 360 + (360 - center) + jitter;
            wheelEl.style.transition = "transform " + (reducedMotion() ? 600 : SPIN_MS) + "ms cubic-bezier(.12,.72,.16,1)";
            wheelEl.style.transform = "rotate(" + state.rotation + "deg)";
            setTimeout(function () { reveal(data); }, reducedMotion() ? 650 : SPIN_MS + 80);
        }).catch(function (error) {
            state.spinning = false;
            state.error = error.message || "The wheel jammed. Try again.";
            if (error.data && error.data.nextSpinAt) {
                state.available = false;
                state.nextSpinAt = error.data.nextSpinAt;
            }
            renderSide();
        });
    }

    function reveal(data) {
        state.spinning = false;
        state.available = false;
        state.nextSpinAt = data.nextSpinAt;
        state.result = data.reward;
        state.lastResult = data.reward;
        wheelEl.style.transition = "none";
        var winner = wheelEl.querySelector('[data-slice="' + data.sliceIndex + '"]');
        if (winner) winner.classList.add("is-winner");
        applyReward(data);
        playSound("sounds/found-match.mp3");
        renderSide();
    }

    // Reflect the prize everywhere it shows: Ryo balance, roster locks, Shop and Locker.
    function applyReward(data) {
        var roster = window.ArenaRoster;
        if (data.reward.kind === "character") {
            if (roster) roster.markUnlocked(data.reward.character.characterId, data.ryo);
        } else if (roster) {
            roster.setRyo(data.ryo);
        } else {
            document.querySelectorAll("[data-ryo-balance]").forEach(function (node) { node.textContent = formatNumber(data.ryo); });
        }
        document.dispatchEvent(new CustomEvent("arena:inventory-changed"));
    }

    // ---------- open / close ----------

    function load(force) {
        if (state.loaded && !force) return Promise.resolve();
        return fetchJson("/api/daily-spin").then(function (data) {
            state.wheel = Array.isArray(data.wheel) ? data.wheel : [];
            state.available = Boolean(data.available);
            state.nextSpinAt = data.nextSpinAt || "";
            state.lastResult = data.lastResult || null;
            state.loaded = true;
            state.error = "";
            drawWheel();
            renderSide();
            updateButton();
        }).catch(function (error) {
            state.error = error.message || "The wheel couldn't be loaded.";
            renderSide();
        });
    }

    function open() {
        modal.classList.remove("hidden");
        var settingsMenu = document.getElementById("settings-modal");
        if (settingsMenu) settingsMenu.classList.add("hidden");
        state.result = null;
        load(true).then(function () {
            if (state.available) goButton.focus();
        });
    }

    function close() {
        if (state.spinning) return;
        modal.classList.add("hidden");
        stopCountdown();
        if (state.available) storage("setItem", DISMISS_KEY, todayKey());
    }

    goButton.addEventListener("click", spin);
    modal.querySelector("[data-daily-spin-close]").addEventListener("click", close);
    modal.addEventListener("click", function (event) { if (event.target === modal) close(); });
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !modal.classList.contains("hidden")) close();
    });
    document.querySelectorAll("[data-daily-spin-trigger]").forEach(function (trigger) {
        trigger.addEventListener("click", function (event) {
            event.preventDefault();
            open();
        });
    });

    // Offer the spin once per day on arrival, after the first-time academy guide is out of the way.
    function guideOpen() {
        var guide = document.getElementById("academy-starter-guide");
        return guide && !guide.hidden && guide.style.display !== "none" && !guide.classList.contains("dismissed");
    }

    function offerOnArrival() {
        load(false).then(function () {
            if (!state.available || storage("getItem", DISMISS_KEY) === todayKey()) return;
            if (new URLSearchParams(location.search).has("matchId")) return;
            if (guideOpen()) {
                var dismiss = document.querySelector(".academy-guide-dismiss-btn");
                if (dismiss) dismiss.addEventListener("click", function () { setTimeout(open, 250); }, { once: true });
                return;
            }
            open();
        });
    }

    if (window.ArenaSession && window.ArenaSession.ready) {
        window.ArenaSession.ready.then(function (user) {
            if (user) setTimeout(offerOnArrival, 600);
        });
    }
})();
