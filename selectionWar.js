// Clan war banner for the character selection screen. Opened as
// selection.html?war=<warId>&warSet=<setId>. The server checks every war team;
// this banner only shows the set, the rules, and why a team is not allowed.
(function () {
    "use strict";
    var params = new URLSearchParams(window.location.search);
    var warId = params.get("war");
    var setId = params.get("warSet");
    if (!warId || !setId) return;

    var CHECK_INTERVAL_MS = 700;
    var war = null;
    var set = null;
    var lastTeamKey = "";
    var checking = false;
    var teamAllowed = false;

    var style = document.createElement("style");
    style.textContent =
        ".war-banner{position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:9000;width:min(560px,calc(100vw - 32px));" +
        "background:rgba(12,10,8,.95);border:1px solid #d7953a;border-radius:6px;box-shadow:0 10px 30px rgba(0,0,0,.6);" +
        "color:#f2ede4;font:13px/1.4 Outfit,system-ui,sans-serif;padding:10px 14px}" +
        ".war-banner h2{margin:0;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#f0bd62}" +
        ".war-banner-row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}" +
        ".war-banner-vs{font-size:15px;font-weight:700;margin:2px 0}" +
        ".war-banner-rules{margin:4px 0 0;color:#c8beb0;font-size:12px}" +
        ".war-banner-problems{margin:6px 0 0;padding-left:18px;color:#ff9a9c;font-size:12px}" +
        ".war-banner-ok{margin:6px 0 0;color:#9fd89a;font-size:12px}" +
        ".war-banner-actions{display:flex;gap:8px;align-items:center}" +
        ".war-banner button{background:#d7953a;color:#1a1208;border:0;border-radius:4px;padding:8px 14px;font:700 13px Outfit,system-ui,sans-serif;cursor:pointer}" +
        ".war-banner button:disabled{opacity:.45;cursor:not-allowed}" +
        ".war-banner a{color:#f0bd62;font-size:12px}" +
        ".war-banner button:focus-visible,.war-banner a:focus-visible{outline:2px solid #f0bd62;outline-offset:2px}";
    document.head.appendChild(style);

    var banner = document.createElement("section");
    banner.className = "war-banner";
    banner.setAttribute("aria-label", "Clan war battle");
    banner.innerHTML =
        '<div class="war-banner-row">' +
        '<div><h2>Clan War Battle</h2><div class="war-banner-vs" data-war-vs>Loading war…</div></div>' +
        '<div class="war-banner-actions"><a href="clanwars.html?war=' + encodeURIComponent(warId) + '" target="_blank" rel="noopener">War page</a>' +
        '<button type="button" data-war-start disabled>Start War Battle</button></div>' +
        "</div>" +
        '<p class="war-banner-rules" data-war-rules></p>' +
        '<div data-war-check aria-live="polite"></div>';
    document.body.appendChild(banner);

    var vsEl = banner.querySelector("[data-war-vs]");
    var rulesEl = banner.querySelector("[data-war-rules]");
    var checkEl = banner.querySelector("[data-war-check]");
    var startButton = banner.querySelector("[data-war-start]");

    var escapeHtml = function (value) {
        return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
        });
    };

    var request = function (path, options) {
        return window.ArenaSession.fetch(path, Object.assign({ credentials: "include" }, options || {})).then(function (response) {
            return response.json().catch(function () { return {}; }).then(function (data) {
                if (!response.ok || !data.ok) throw new Error(data.error || "Request failed.");
                return data;
            });
        });
    };

    var describeRules = function () {
        var rules = war.terms.ruleset;
        var labels = (war.archetypeSnapshot && war.archetypeSnapshot.definitions) || {};
        var parts = ["Best of " + war.terms.bestOf];
        if (rules.bannedCharacterIds.length) parts.push(rules.bannedCharacterIds.length + " banned characters");
        if (rules.bannedCombinations.length) parts.push(rules.bannedCombinations.length + " banned combinations");
        rules.archetypeLimits.forEach(function (limit) {
            var label = labels[limit.tag] ? labels[limit.tag].label : limit.tag;
            parts.push(limit.max === 0 ? "No " + label : "Max " + limit.max + " " + label);
        });
        if (rules.noRepeatScope === "set") parts.push("No repeat characters this set");
        if (rules.noRepeatScope === "war") parts.push("No repeat characters this war");
        return parts.join(" · ");
    };

    var renderSet = function () {
        var mySide = war.viewer.side;
        var theirSide = mySide === "challenger" ? "defender" : "challenger";
        vsEl.textContent = "vs " + set.players[theirSide] + " · Set " + set.score[mySide] + "–" + set.score[theirSide];
        rulesEl.textContent = describeRules();
        if (set.status !== "active") {
            checkEl.innerHTML = '<p class="war-banner-problems">This set is ' + escapeHtml(set.status) + ". Return to the war page.</p>";
            startButton.disabled = true;
            return false;
        }
        return true;
    };

    var checkTeam = function () {
        var api = window.ArenaWarBattle;
        if (!api || checking || !set || set.status !== "active") return;
        var team = api.getTeam();
        var key = team.join(",");
        if (key === lastTeamKey) return;
        lastTeamKey = key;
        if (team.length !== 3) {
            teamAllowed = false;
            startButton.disabled = true;
            checkEl.innerHTML = '<p class="war-banner-rules">Pick 3 characters to check your team against the war rules.</p>';
            return;
        }
        checking = true;
        request("/api/clan-wars/" + encodeURIComponent(warId) + "/sets/" + encodeURIComponent(setId) + "/check-team", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ team: team }),
        })
            .then(function (data) {
                teamAllowed = data.valid;
                startButton.disabled = !teamAllowed;
                checkEl.innerHTML = data.valid
                    ? '<p class="war-banner-ok">This team follows the war rules.</p>'
                    : '<ul class="war-banner-problems">' +
                      data.violations.map(function (v) { return "<li>" + escapeHtml(v.message) + "</li>"; }).join("") +
                      "</ul>";
            })
            .catch(function (error) {
                lastTeamKey = "";
                checkEl.innerHTML = '<p class="war-banner-problems">' + escapeHtml(error.message) + "</p>";
            })
            .then(function () { checking = false; });
    };

    startButton.addEventListener("click", function () {
        if (!teamAllowed || !window.ArenaWarBattle || !set) return;
        var opponent = set.players[war.viewer.side === "challenger" ? "defender" : "challenger"];
        window.ArenaWarBattle.start(setId, opponent);
    });

    request("/api/clan-wars/" + encodeURIComponent(warId))
        .then(function (data) {
            war = data.war;
            set = (war.sets || []).filter(function (entry) { return entry.setId === setId; })[0] || null;
            if (!set || !war.viewer.side) throw new Error("You are not playing in this war set.");
            if (renderSet()) {
                checkEl.innerHTML = '<p class="war-banner-rules">Pick 3 characters to check your team against the war rules.</p>';
                window.setInterval(checkTeam, CHECK_INTERVAL_MS);
            }
        })
        .catch(function (error) {
            vsEl.textContent = "War unavailable";
            checkEl.innerHTML = '<p class="war-banner-problems">' + escapeHtml(error.message) + "</p>";
        });
})();
