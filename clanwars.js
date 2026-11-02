// Clan Wars page. The server owns every rule, score, and reward; this page
// renders the war state it returns and sends the player's choices back.
(function () {
    "use strict";

    var REFRESH_MS = 10000;
    var DURATIONS = [
        { hours: 24, label: "1 day" },
        { hours: 48, label: "2 days" },
        { hours: 72, label: "3 days" },
        { hours: 168, label: "1 week" },
        { hours: 336, label: "2 weeks" }
    ];
    var NO_REPEAT_LABELS = { none: "Characters may repeat", set: "No repeat characters within a set", war: "No repeat characters for the whole war" };
    var REASON_LABELS = { target: "reached the win target", deadline: "led at the deadline", surrender: "won by surrender" };

    var view = document.getElementById("cw-view");
    var statusEl = document.getElementById("cw-status");
    var params = new URLSearchParams(window.location.search);
    var warId = params.get("war");
    var catalog = null;

    var escapeHtml = function (value) {
        return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
        });
    };

    var setStatus = function (message, isError) {
        statusEl.textContent = message || "";
        statusEl.classList.toggle("error", Boolean(isError));
    };

    var request = function (path, options) {
        var init = Object.assign({ credentials: "include" }, options || {});
        if (init.body && typeof init.body !== "string") {
            init.headers = { "Content-Type": "application/json" };
            init.body = JSON.stringify(init.body);
        }
        return window.ArenaSession.fetch(path, init).then(function (response) {
            return response.json().catch(function () { return {}; }).then(function (data) {
                if (!response.ok || !data.ok) {
                    var error = new Error(data.error || "Something went wrong. Please try again.");
                    error.status = response.status;
                    throw error;
                }
                return data;
            });
        });
    };

    var loadCatalog = function () {
        if (catalog) return Promise.resolve(catalog);
        return request("/api/clan-wars/archetypes").then(function (data) {
            catalog = data;
            return catalog;
        });
    };

    var formatTimeLeft = function (date) {
        var ms = new Date(date).getTime() - Date.now();
        if (ms <= 0) return "now";
        var hours = Math.floor(ms / 3600000);
        if (hours >= 48) return Math.floor(hours / 24) + " days";
        if (hours >= 1) return hours + "h " + Math.floor((ms % 3600000) / 60000) + "m";
        return Math.max(1, Math.floor(ms / 60000)) + "m";
    };

    var otherSide = function (side) { return side === "challenger" ? "defender" : "challenger"; };
    var clanLabel = function (war, side) { return war[side].name; };

    // ── Terms form, shared by declaring and counter-proposing ────────────
    var renderTermsForm = function (container, terms) {
        var characters = catalog.characters;
        var definitions = catalog.definitions;
        var ids = Object.keys(characters).sort(function (a, b) {
            return characters[a].name.localeCompare(characters[b].name);
        });
        var ruleset = (terms && terms.ruleset) || {};
        var banned = {};
        (ruleset.bannedCharacterIds || []).forEach(function (id) { banned[id] = true; });
        var combos = (ruleset.bannedCombinations || []).map(function (combo) { return combo.slice(); });
        var limits = {};
        (ruleset.archetypeLimits || []).forEach(function (limit) { limits[limit.tag] = limit.max; });
        var value = function (key, fallback) { return terms && terms[key] != null ? terms[key] : fallback; };

        var characterOptions = '<option value="">Choose a character</option>' + ids.map(function (id) {
            return '<option value="' + escapeHtml(id) + '">' + escapeHtml(characters[id].name) + "</option>";
        }).join("");
        var option = function (optionValue, label, selected) {
            return '<option value="' + optionValue + '"' + (String(selected) === String(optionValue) ? " selected" : "") + ">" + label + "</option>";
        };

        container.innerHTML =
            '<div class="cw-form-grid">' +
            '<label class="cw-field">Sets needed to win<input type="number" min="1" max="25" data-term="winTarget" value="' + value("winTarget", 5) + '"></label>' +
            '<label class="cw-field">Set length<select data-term="bestOf">' + option(3, "Best of 3", value("bestOf", 3)) + option(5, "Best of 5", value("bestOf", 3)) + "</select></label>" +
            '<label class="cw-field">Sets per member<input type="number" min="1" max="10" data-term="maxSetsPerMember" value="' + value("maxSetsPerMember", 3) + '"></label>' +
            '<label class="cw-field">Repeat opponents<select data-term="repeatOpponents">' + option("once", "One set per pair", value("repeatOpponents", "once")) + option("allowed", "Rematches allowed", value("repeatOpponents", "once")) + "</select></label>" +
            '<label class="cw-field">War length<select data-term="durationHours">' + DURATIONS.map(function (d) { return option(d.hours, d.label, value("durationHours", 72)); }).join("") + "</select></label>" +
            '<label class="cw-field">Repeat characters<select data-term="noRepeatScope">' + Object.keys(NO_REPEAT_LABELS).map(function (key) { return option(key, NO_REPEAT_LABELS[key], ruleset.noRepeatScope || "none"); }).join("") + "</select></label>" +
            "</div>" +
            "<h3>Character type limits</h3>" +
            '<p class="cw-muted">Types are read from each character\'s skills. A character counts as a type if any of its skills does that.</p>' +
            '<div class="cw-form-grid">' + Object.keys(definitions).map(function (tag) {
                var current = limits[tag] == null ? "" : limits[tag];
                return '<label class="cw-field" title="' + escapeHtml(definitions[tag].description) + '">' + escapeHtml(definitions[tag].label) +
                    '<select data-limit="' + tag + '">' + option("", "No limit", current) + option(2, "At most 2", current) + option(1, "At most 1", current) + option(0, "Not allowed", current) + "</select></label>";
            }).join("") + "</div>" +
            "<h3>Banned characters</h3>" +
            '<input class="cw-select cw-ban-search" type="search" placeholder="Search characters" aria-label="Search characters to ban" data-ban-search>' +
            '<div class="cw-ban-list" data-ban-list>' + ids.map(function (id) {
                var tags = characters[id].tags.map(function (tag) { return definitions[tag].label; }).join(", ");
                return '<label data-name="' + escapeHtml(characters[id].name.toLowerCase()) + '"><input type="checkbox" value="' + escapeHtml(id) + '"' + (banned[id] ? " checked" : "") + ">" +
                    "<span>" + escapeHtml(characters[id].name) + (tags ? ' <span class="cw-tags">' + escapeHtml(tags) + "</span>" : "") + "</span></label>";
            }).join("") + "</div>" +
            "<h3>Banned combinations</h3>" +
            '<div class="cw-combo-row">' +
            '<select class="cw-select" data-combo="0" aria-label="First character">' + characterOptions + "</select>" +
            '<select class="cw-select" data-combo="1" aria-label="Second character">' + characterOptions + "</select>" +
            '<select class="cw-select" data-combo="2" aria-label="Third character (optional)">' + characterOptions.replace("Choose a character", "Optional third") + "</select>" +
            '<button type="button" class="cw-button secondary" data-combo-add>Add combination</button>' +
            "</div>" +
            '<ul class="cw-chip-list" data-combo-list></ul>';

        var comboList = container.querySelector("[data-combo-list]");
        var renderCombos = function () {
            comboList.innerHTML = combos.map(function (combo, index) {
                var names = combo.map(function (id) { return characters[id] ? characters[id].name : id; }).join(" + ");
                return '<li class="cw-chip">' + escapeHtml(names) + '<button type="button" data-combo-remove="' + index + '" aria-label="Remove ' + escapeHtml(names) + '">✕</button></li>';
            }).join("");
        };
        renderCombos();

        container.querySelector("[data-ban-search]").addEventListener("input", function (event) {
            var query = event.target.value.trim().toLowerCase();
            container.querySelectorAll("[data-ban-list] label").forEach(function (label) {
                label.hidden = query !== "" && label.getAttribute("data-name").indexOf(query) === -1;
            });
        });
        container.querySelector("[data-combo-add]").addEventListener("click", function () {
            var picks = [0, 1, 2].map(function (i) { return container.querySelector('[data-combo="' + i + '"]').value; }).filter(Boolean);
            var unique = picks.filter(function (id, i) { return picks.indexOf(id) === i; });
            if (unique.length < 2) {
                setStatus("Choose at least 2 different characters for a combination.", true);
                return;
            }
            combos.push(unique);
            renderCombos();
            [0, 1, 2].forEach(function (i) { container.querySelector('[data-combo="' + i + '"]').value = ""; });
            setStatus("");
        });
        comboList.addEventListener("click", function (event) {
            var button = event.target.closest("[data-combo-remove]");
            if (!button) return;
            combos.splice(Number(button.getAttribute("data-combo-remove")), 1);
            renderCombos();
        });

        return function readTerms() {
            var read = function (key) { return container.querySelector('[data-term="' + key + '"]').value; };
            var archetypeLimits = [];
            container.querySelectorAll("[data-limit]").forEach(function (select) {
                if (select.value !== "") archetypeLimits.push({ tag: select.getAttribute("data-limit"), max: Number(select.value) });
            });
            var bannedCharacterIds = [];
            container.querySelectorAll("[data-ban-list] input:checked").forEach(function (box) { bannedCharacterIds.push(box.value); });
            return {
                winTarget: Number(read("winTarget")),
                bestOf: Number(read("bestOf")),
                maxSetsPerMember: Number(read("maxSetsPerMember")),
                repeatOpponents: read("repeatOpponents"),
                durationHours: Number(read("durationHours")),
                ruleset: {
                    noRepeatScope: read("noRepeatScope"),
                    archetypeLimits: archetypeLimits,
                    bannedCharacterIds: bannedCharacterIds,
                    bannedCombinations: combos
                }
            };
        };
    };

    var describeTerms = function (terms, snapshot) {
        var definitions = (snapshot && snapshot.definitions) || (catalog && catalog.definitions) || {};
        var characters = (snapshot && snapshot.characters) || (catalog && catalog.characters) || {};
        var name = function (id) { return characters[id] ? characters[id].name : id; };
        var rules = terms.ruleset;
        var lines = [
            "First clan to " + terms.winTarget + " set wins takes the war",
            "Sets are best of " + terms.bestOf,
            "Each member can play up to " + terms.maxSetsPerMember + " sets",
            terms.repeatOpponents === "once" ? "Each pair of players meets at most once" : "Rematches are allowed",
            "The war lasts " + (DURATIONS.filter(function (d) { return d.hours === terms.durationHours; })[0] || { label: terms.durationHours + " hours" }).label,
            NO_REPEAT_LABELS[rules.noRepeatScope]
        ];
        rules.archetypeLimits.forEach(function (limit) {
            var label = definitions[limit.tag] ? definitions[limit.tag].label : limit.tag;
            lines.push(limit.max === 0 ? "No " + label + " characters" : "At most " + limit.max + " " + label + " character" + (limit.max === 1 ? "" : "s") + " per team");
        });
        if (rules.bannedCharacterIds.length) lines.push("Banned: " + rules.bannedCharacterIds.map(name).join(", "));
        rules.bannedCombinations.forEach(function (combo) { lines.push("Banned combination: " + combo.map(name).join(" + ")); });
        return '<ul class="cw-rules">' + lines.map(function (line) { return "<li>" + escapeHtml(line) + "</li>"; }).join("") + "</ul>";
    };

    // ── War list and declaring war ────────────────────────────────────
    var renderList = function () {
        setStatus("Loading wars…");
        Promise.all([request("/api/clan-wars"), loadCatalog()])
            .then(function (results) {
                var wars = results[0].wars;
                setStatus("");
                view.innerHTML =
                    '<section class="cw-panel"><h2>Your Clan\'s Wars</h2>' +
                    (wars.length
                        ? '<ul class="cw-war-list">' + wars.map(function (war) {
                              var score = war.status === "proposed" ? "Awaiting " + clanLabel(war, war.awaitingSide)
                                  : war.score.challenger + " – " + war.score.defender + " sets";
                              return '<li><a class="cw-war-link" href="clanwars.html?war=' + encodeURIComponent(war.warId) + '">' +
                                  "<strong>" + escapeHtml(war.challenger.name) + " vs " + escapeHtml(war.defender.name) + "</strong>" +
                                  '<span><span class="cw-pill ' + war.status + '">' + escapeHtml(war.status) + "</span> " + escapeHtml(score) + "</span></a></li>";
                          }).join("") + "</ul>"
                        : '<p class="cw-muted">Your clan has not fought any wars yet.</p>') +
                    "</section>" +
                    '<section class="cw-panel" id="cw-declare"><h2>Declare War</h2>' +
                    '<p class="cw-muted">Only the Clan Leader can declare war. The other clan\'s leader can accept, decline, or propose different rules.</p>' +
                    '<label class="cw-field">Enemy clan name<input type="text" maxlength="40" data-opponent autocomplete="off"></label>' +
                    '<div data-terms style="margin-top:14px"></div>' +
                    '<div class="cw-actions"><button type="button" class="cw-button" data-declare>Declare War</button></div></section>';

                var readTerms = renderTermsForm(view.querySelector("[data-terms]"), null);
                view.querySelector("[data-declare]").addEventListener("click", function (event) {
                    var opponentClan = view.querySelector("[data-opponent]").value.trim();
                    if (!opponentClan) {
                        setStatus("Enter the name of the clan you want to fight.", true);
                        return;
                    }
                    event.target.disabled = true;
                    request("/api/clan-wars", { method: "POST", body: { opponentClan: opponentClan, terms: readTerms() } })
                        .then(function (data) { window.location.href = "clanwars.html?war=" + encodeURIComponent(data.war.warId); })
                        .catch(function (error) {
                            event.target.disabled = false;
                            setStatus(error.message, true);
                        });
                });
            })
            .catch(function (error) {
                view.innerHTML = "";
                setStatus(error.status === 400 ? "Join a clan to take part in clan wars." : error.message, true);
            });
    };

    // ── War detail ───────────────────────────────────────────────────
    var openGameWindow = function (url) {
        var width = 1100 + Math.max(0, window.outerWidth - window.innerWidth);
        var height = 800 + Math.max(0, window.outerHeight - window.innerHeight);
        var left = Math.max(0, Math.round((window.screen.width - width) / 2));
        var top = Math.max(0, Math.round((window.screen.height - height) / 2));
        var win = window.open(url, "narutoArenaGame", "width=" + width + ",height=" + height + ",left=" + left + ",top=" + top + ",resizable=yes,scrollbars=no");
        if (!win) window.location.href = url;
        else win.focus();
    };

    var describeResult = function (war) {
        if (war.status === "declined") return "The war was declined.";
        if (war.status === "expired") return "The proposal expired without an answer.";
        if (war.status === "cancelled") return "The proposal was withdrawn.";
        var result = war.result || {};
        if (!result.winnerSide) return "The war ended in a draw.";
        return clanLabel(war, result.winnerSide) + " won the war — " + (REASON_LABELS[result.reason] || result.reason) + ".";
    };

    var renderSet = function (war, set) {
        var me = war.viewer.username;
        var mySide = null;
        if (set.players.challenger === me) mySide = "challenger";
        if (set.players.defender === me) mySide = "defender";
        var actions = [];
        if (war.status === "active" && set.status === "pending") {
            if (mySide && mySide !== set.challengedBy) {
                actions.push('<button type="button" class="cw-button" data-set-action="accept" data-set="' + set.setId + '">Accept</button>');
                actions.push('<button type="button" class="cw-button secondary" data-set-action="decline" data-set="' + set.setId + '">Decline</button>');
            } else if (mySide) {
                actions.push('<button type="button" class="cw-button secondary" data-set-action="cancel" data-set="' + set.setId + '">Cancel challenge</button>');
            }
        }
        if (war.status === "active" && set.status === "active" && mySide) {
            actions.push('<button type="button" class="cw-button" data-set-action="play" data-set="' + set.setId + '">Start Battle</button>');
            actions.push('<button type="button" class="cw-button danger" data-set-action="forfeit" data-set="' + set.setId + '">Forfeit set</button>');
        }
        var status = set.status === "completed"
            ? set.players[set.winnerSide] + " won" + (set.forfeitedBy ? " (forfeit)" : "")
            : set.status === "pending" ? "Waiting for " + set.players[otherSide(set.challengedBy)] + " to accept" : set.status;
        return '<div class="cw-set"><div class="cw-set-top"><div>' +
            '<span class="cw-set-players">' + escapeHtml(set.players.challenger) + '<span class="cw-set-score">' + set.score.challenger + " – " + set.score.defender + "</span>" + escapeHtml(set.players.defender) + "</span>" +
            '<div class="cw-muted">' + escapeHtml(status) + " · " + set.battles.length + " battle" + (set.battles.length === 1 ? "" : "s") + " played</div></div>" +
            '<div class="cw-actions" style="margin-top:0">' + actions.join("") + "</div></div></div>";
    };

    var renderWar = function (war) {
        var side = war.viewer.side;
        var leader = war.viewer.isClanLeader;
        var parts = [];
        var deadline = war.status === "proposed" ? "Answer due in " + formatTimeLeft(war.respondBy)
            : war.status === "active" ? "Ends in " + formatTimeLeft(war.endsAt) : "";

        parts.push('<section class="cw-panel"><div class="cw-head"><div>' +
            '<p class="cw-matchup">' + escapeHtml(war.challenger.name) + " vs " + escapeHtml(war.defender.name) + "</p>" +
            '<span class="cw-pill ' + war.status + '">' + escapeHtml(war.status) + '</span> <span class="cw-muted">' + escapeHtml(deadline) + "</span></div>" +
            '<div class="cw-score">' + war.score.challenger + " – " + war.score.defender + "<small>Sets won</small></div></div>" +
            (["completed", "declined", "expired", "cancelled"].indexOf(war.status) !== -1 ? '<p class="cw-result" style="margin-top:12px">' + escapeHtml(describeResult(war)) + "</p>" : "") +
            "</section>");

        if (war.status === "completed" && war.rewards && side) {
            var myRyo = war.rewards.players[war.viewer.username] || 0;
            parts.push('<section class="cw-panel"><h2>Rewards</h2><p>You earned <strong>' + myRyo + " Ryo</strong> from this war." +
                " " + escapeHtml(war[side].name) + " earned <strong>" + (war.rewards.clans[side] || 0) + " clan XP</strong>.</p></section>");
        }

        if (war.status === "proposed") {
            var proposalActions = "";
            if (leader && side === war.awaitingSide) {
                proposalActions = '<button type="button" class="cw-button" data-war-action="accept">Accept War</button>' +
                    '<button type="button" class="cw-button secondary" data-war-action="counter">Propose Different Rules</button>' +
                    '<button type="button" class="cw-button danger" data-war-action="decline">Decline</button>';
            } else if (leader && side) {
                proposalActions = '<button type="button" class="cw-button danger" data-war-action="withdraw">Withdraw Proposal</button>';
            }
            parts.push('<section class="cw-panel"><h2>Proposal</h2><p>Waiting for <strong>' + escapeHtml(clanLabel(war, war.awaitingSide)) +
                "</strong>'s Clan Leader to respond.</p>" + '<div class="cw-actions">' + proposalActions + '</div><div data-counter-form style="margin-top:14px" hidden></div></section>');
        }

        parts.push('<section class="cw-panel"><h2>Rules</h2>' + describeTerms(war.terms, war.archetypeSnapshot) + "</section>");

        var rosterColumn = function (rosterSide) {
            var names = war.rosters[rosterSide];
            var canRemove = leader && side === rosterSide && ["proposed", "active"].indexOf(war.status) !== -1;
            return "<div><h3>" + escapeHtml(war[rosterSide].name) + " (" + names.length + ")</h3>" +
                (names.length
                    ? '<ul class="cw-roster">' + names.map(function (name) {
                          return "<li><span>" + escapeHtml(name) + "</span>" +
                              (canRemove && name !== war.viewer.username ? '<button type="button" class="cw-button secondary" data-remove="' + escapeHtml(name) + '">Remove</button>' : "") + "</li>";
                      }).join("") + "</ul>"
                    : '<p class="cw-muted">No one has joined yet.</p>') + "</div>";
        };
        var rosterActions = "";
        if (side && ["proposed", "active"].indexOf(war.status) !== -1) {
            rosterActions = war.viewer.onRoster
                ? '<button type="button" class="cw-button secondary" data-war-action="leave">Leave Roster</button>'
                : '<button type="button" class="cw-button" data-war-action="join">Join Roster</button>';
        }
        var challengeForm = "";
        if (war.status === "active" && war.viewer.onRoster) {
            var enemies = war.rosters[otherSide(side)];
            challengeForm = enemies.length
                ? '<label class="cw-field" style="flex:1 1 200px">Challenge an enemy member<select data-challenge-target>' +
                  enemies.map(function (name) { return '<option value="' + escapeHtml(name) + '">' + escapeHtml(name) + "</option>"; }).join("") +
                  '</select></label><button type="button" class="cw-button" data-war-action="challenge" style="align-self:flex-end">Challenge</button>'
                : '<p class="cw-muted">No enemy members have joined the roster yet.</p>';
        }
        parts.push('<section class="cw-panel"><h2>Rosters</h2><div class="cw-columns">' + rosterColumn("challenger") + rosterColumn("defender") + "</div>" +
            '<div class="cw-actions">' + rosterActions + challengeForm + "</div></section>");

        var sets = (war.sets || []).filter(function (set) { return set.status !== "declined" && set.status !== "cancelled"; }).reverse();
        parts.push('<section class="cw-panel"><h2>Sets</h2>' +
            (sets.length ? sets.map(function (set) { return renderSet(war, set); }).join("") : '<p class="cw-muted">No sets yet. Join the roster and challenge an enemy member.</p>') +
            "</section>");

        if (war.status === "active" && leader && side) {
            parts.push('<section class="cw-panel"><h2>Surrender</h2><p class="cw-muted">Surrendering ends the war immediately and gives the win to ' +
                escapeHtml(clanLabel(war, otherSide(side))) + '.</p><div class="cw-actions"><button type="button" class="cw-button danger" data-war-action="surrender">Surrender War</button></div></section>');
        }

        parts.push('<p><a href="clanwars.html">← All clan wars</a></p>');
        view.innerHTML = parts.join("");
    };

    var currentWar = null;

    var act = function (path, body, confirmMessage) {
        if (confirmMessage && !window.confirm(confirmMessage)) return;
        setStatus("Saving…");
        request("/api/clan-wars/" + encodeURIComponent(warId) + path, { method: "POST", body: body || {} })
            .then(function (data) {
                setStatus("");
                currentWar = data.war;
                renderWar(currentWar);
            })
            .catch(function (error) { setStatus(error.message, true); });
    };

    var loadWar = function (quiet) {
        if (!quiet) setStatus("Loading war…");
        return request("/api/clan-wars/" + encodeURIComponent(warId))
            .then(function (data) {
                if (!quiet) setStatus("");
                currentWar = data.war;
                // Do not redraw over a counter-proposal or a control the player is using.
                var editing = view.querySelector("[data-counter-form]:not([hidden])") ||
                    (view.contains(document.activeElement) && /^(SELECT|INPUT)$/.test(document.activeElement.tagName));
                if (!editing) renderWar(currentWar);
            })
            .catch(function (error) { setStatus(error.message, true); });
    };

    view.addEventListener("click", function (event) {
        if (!warId || !currentWar) return;
        var warButton = event.target.closest("[data-war-action]");
        var setButton = event.target.closest("[data-set-action]");
        var removeButton = event.target.closest("[data-remove]");

        if (warButton) {
            var action = warButton.getAttribute("data-war-action");
            if (action === "accept") act("/respond", { action: "accept" }, "Accept this war? The rules lock once accepted.");
            if (action === "decline") act("/respond", { action: "decline" }, "Decline this war?");
            if (action === "withdraw") act("/withdraw", {}, "Withdraw your war proposal?");
            if (action === "surrender") act("/surrender", {}, "Surrender the war? The other clan wins immediately.");
            if (action === "join") act("/roster/join");
            if (action === "leave") act("/roster/leave");
            if (action === "challenge") act("/challenges", { opponent: view.querySelector("[data-challenge-target]").value });
            if (action === "counter") {
                var form = view.querySelector("[data-counter-form]");
                form.hidden = false;
                loadCatalog().then(function () {
                    form.innerHTML = '<div data-terms></div><div class="cw-actions"><button type="button" class="cw-button" data-war-action="send-counter">Send Proposal</button>' +
                        '<button type="button" class="cw-button secondary" data-war-action="close-counter">Cancel</button></div>';
                    form.readTerms = renderTermsForm(form.querySelector("[data-terms]"), currentWar.terms);
                });
            }
            if (action === "send-counter") {
                var counterForm = view.querySelector("[data-counter-form]");
                var terms = counterForm.readTerms();
                counterForm.hidden = true;
                act("/respond", { action: "counter", terms: terms });
            }
            if (action === "close-counter") {
                view.querySelector("[data-counter-form]").hidden = true;
            }
        }

        if (setButton) {
            var setId = setButton.getAttribute("data-set");
            var setAction = setButton.getAttribute("data-set-action");
            var setPath = "/sets/" + encodeURIComponent(setId);
            if (setAction === "accept") act(setPath + "/respond", { accept: true });
            if (setAction === "decline") act(setPath + "/respond", { accept: false });
            if (setAction === "cancel") act(setPath + "/cancel");
            if (setAction === "forfeit") act(setPath + "/forfeit", {}, "Forfeit this set? Your opponent wins it.");
            if (setAction === "play") {
                openGameWindow("selection.html?war=" + encodeURIComponent(warId) + "&warSet=" + encodeURIComponent(setId));
            }
        }

        if (removeButton) {
            var username = removeButton.getAttribute("data-remove");
            act("/roster/remove", { username: username }, "Remove " + username + " from the war roster?");
        }
    });

    var start = function () {
        if (!window.ArenaSession) {
            setStatus("Unable to reach the server.", true);
            return;
        }
        if (!warId) {
            renderList();
            return;
        }
        loadCatalog().catch(function () {}).then(function () { return loadWar(false); });
        window.setInterval(function () {
            if (document.hidden || !currentWar || ["proposed", "active"].indexOf(currentWar.status) === -1) return;
            loadWar(true);
        }, REFRESH_MS);
    };

    start();
})();
