        // ── SETTINGS MENU & PROFILE REWARDS CONTROLLER ──
        (function initQuestsAndRewardsController() {
            var settingsModal = document.getElementById("settings-modal");

            document.querySelectorAll("[data-settings-trigger]").forEach(function(btn) {
                btn.addEventListener("click", function(e) {
                    e.preventDefault();
                    if (settingsModal) settingsModal.classList.remove("hidden");
                });
            });

            var sClose = document.getElementById("settings-modal-close");
            if (sClose) sClose.addEventListener("click", function() { if (settingsModal) settingsModal.classList.add("hidden"); });

            // Audio: Master, Music and Effects. The sound manager in script.js owns and saves the
            // levels; these controls only read and change them through window.ArenaSound.
            var audioChannels = [
                { channel: "volume", slider: "settings-master-volume", value: "settings-volume-val", name: "all sound" },
                { channel: "music", slider: "settings-music-volume", value: "settings-music-val", name: "music" },
                { channel: "effects", slider: "settings-effects-volume", value: "settings-effects-val", name: "sound effects" }
            ];
            var renderAudio = function(levels) {
                audioChannels.forEach(function(entry) {
                    var pct = Math.round((Number(levels[entry.channel]) || 0) * 100);
                    var slider = document.getElementById(entry.slider);
                    var output = document.getElementById(entry.value);
                    var mute = document.querySelector('[data-sound-mute="' + entry.channel + '"]');
                    var row = slider ? slider.closest(".as-audio-row") : null;
                    if (slider) {
                        slider.value = String(pct);
                        // The filled part of the track follows the value.
                        slider.style.setProperty("--fill", pct + "%");
                        slider.setAttribute("aria-valuetext", pct === 0 ? "Muted" : pct + "%");
                    }
                    if (output) output.textContent = pct === 0 ? "Off" : pct + "%";
                    if (row) row.classList.toggle("is-muted", pct === 0);
                    if (mute) {
                        mute.setAttribute("aria-pressed", String(pct === 0));
                        mute.setAttribute("aria-label", (pct === 0 ? "Unmute " : "Mute ") + entry.name);
                    }
                });
                // Music and Effects play as a share of Master, so they read as off while Master is.
                var settingsPanel = document.querySelector(".arena-settings");
                if (settingsPanel) settingsPanel.classList.toggle("is-master-muted", !(Number(levels.volume) > 0));
            };
            var wireAudio = function() {
                audioChannels.forEach(function(entry) {
                    var slider = document.getElementById(entry.slider);
                    // Master's own slider is also the sound manager's input, which saves it itself.
                    if (slider && entry.channel !== "volume") {
                        slider.addEventListener("input", function() {
                            window.ArenaSound.setChannel(entry.channel, (parseInt(slider.value, 10) || 0) / 100);
                        });
                    }
                    var mute = document.querySelector('[data-sound-mute="' + entry.channel + '"]');
                    if (mute) {
                        mute.addEventListener("click", function() { window.ArenaSound.toggleMute(entry.channel); });
                    }
                });
                window.ArenaSound.onChange(renderAudio);
                renderAudio(window.ArenaSound.getSettings());
            };
            // script.js defines ArenaSound only after the session check, which is usually after this runs.
            if (window.ArenaSound) {
                wireAudio();
            } else {
                document.addEventListener("arena:sound-ready", wireAudio, { once: true });
            }

            // Training Dummy & Bug Report Diverted Actions
            var dummyBtn = document.getElementById("modal-training-dummy-btn");
            if (dummyBtn) {
                dummyBtn.addEventListener("click", function() {
                    if (settingsModal) settingsModal.classList.add("hidden");
                });
            }

            // Bug report: a second view inside the settings panel.
            var bugBtn = document.getElementById("modal-bug-report-btn");
            var settingsTitle = document.getElementById("settings-modal-title");
            var settingsBack = document.getElementById("settings-back");
            var bugForm = document.getElementById("settings-bug-form");
            var bugDone = document.getElementById("settings-bug-done");
            var bugTitle = document.getElementById("settings-bug-title");
            var bugDetails = document.getElementById("settings-bug-details");
            var bugCount = document.getElementById("settings-bug-count");
            var bugStatus = document.getElementById("settings-bug-status");
            var bugSubmit = document.getElementById("settings-bug-submit");
            var showSettingsView = function(name) {
                document.querySelectorAll("#settings-modal [data-settings-view]").forEach(function(view) {
                    view.hidden = view.getAttribute("data-settings-view") !== name;
                });
                if (settingsTitle) settingsTitle.textContent = name === "bug" ? "Report a bug" : "Settings";
                if (settingsBack) settingsBack.hidden = name !== "bug";
                if (name === "bug") {
                    if (bugForm) bugForm.hidden = false;
                    if (bugDone) bugDone.hidden = true;
                    if (bugTitle) bugTitle.focus();
                } else if (bugBtn) {
                    bugBtn.focus();
                }
            };
            var setBugStatus = function(text, tone) {
                if (!bugStatus) return;
                bugStatus.textContent = text || "";
                bugStatus.className = "as-form-status" + (tone ? " is-" + tone : "");
            };
            var updateBugCount = function() {
                if (bugCount && bugDetails) bugCount.textContent = bugDetails.value.length + " / 3000";
            };
            if (bugBtn) bugBtn.addEventListener("click", function() { setBugStatus(""); showSettingsView("bug"); });
            if (settingsBack) settingsBack.addEventListener("click", function() { showSettingsView("main"); });
            document.querySelectorAll("#settings-modal [data-settings-back]").forEach(function(btn) {
                btn.addEventListener("click", function() { showSettingsView("main"); });
            });
            // Reopening settings always starts on the main view.
            document.querySelectorAll("[data-settings-trigger]").forEach(function(btn) {
                btn.addEventListener("click", function() { showSettingsView("main"); });
            });
            if (bugDetails) bugDetails.addEventListener("input", updateBugCount);
            if (bugForm) {
                bugForm.addEventListener("submit", function(e) {
                    e.preventDefault();
                    var title = bugTitle ? bugTitle.value.trim() : "";
                    var description = bugDetails ? bugDetails.value.trim() : "";
                    // Same limits the server enforces, checked first so the player gets a quick answer.
                    if (title.length < 3) {
                        setBugStatus("Add a short summary (at least 3 characters).", "error");
                        if (bugTitle) bugTitle.focus();
                        return;
                    }
                    if (description.length < 5) {
                        setBugStatus("Describe what happened (at least 5 characters).", "error");
                        if (bugDetails) bugDetails.focus();
                        return;
                    }
                    var picked = bugForm.querySelector('input[name="bug-category"]:checked');
                    if (bugSubmit) { bugSubmit.disabled = true; bugSubmit.textContent = "Sending…"; }
                    setBugStatus("");
                    window.ArenaSession.fetch("/api/bugs", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            category: picked ? picked.value : "other",
                            title: title,
                            description: description,
                            pageUrl: window.location.pathname,
                            clientMetadata: { userAgent: navigator.userAgent || "" }
                        })
                    }).then(function(r) {
                        return r.json().catch(function() { return {}; }).then(function(d) { return { ok: r.ok && d.ok, data: d }; });
                    }).then(function(result) {
                        if (!result.ok) {
                            setBugStatus((result.data && result.data.error) || "The report couldn't be sent. Try again in a moment.", "error");
                            return;
                        }
                        bugForm.reset();
                        updateBugCount();
                        bugForm.hidden = true;
                        if (bugDone) bugDone.hidden = false;
                    }).catch(function() {
                        setBugStatus("The report couldn't be sent. Check your connection and try again.", "error");
                    }).then(function() {
                        if (bugSubmit) { bugSubmit.disabled = false; bugSubmit.textContent = "Send report"; }
                    });
                });
            }

            // Backdrop Click & Escape Key Dismissal
            // Only a press that starts AND ends on the backdrop closes: dragging a slider out of the
            // panel and releasing on the backdrop must not.
            document.querySelectorAll(".shinobi-modal-overlay, .settings-modal-overlay").forEach(function(overlay) {
                var pressedOnBackdrop = false;
                overlay.addEventListener("pointerdown", function(e) {
                    pressedOnBackdrop = e.target === overlay;
                });
                overlay.addEventListener("click", function(e) {
                    var startedOnBackdrop = pressedOnBackdrop;
                    pressedOnBackdrop = false;
                    if (e.target === overlay && startedOnBackdrop) {
                        overlay.classList.add("hidden");
                    }
                });
            });

            document.addEventListener("keydown", function(e) {
                if (e.key === "Escape") {
                    document.querySelectorAll(".shinobi-modal-overlay, .settings-modal-overlay").forEach(function(overlay) {
                        overlay.classList.add("hidden");
                    });
                }
            });

            // ── PROFILE > REWARDS BOARD ──
            // Check-in, contracts, achievements and promo codes, claimed in place. The server decides
            // every outcome: the board renders what /api returns, claims post intent, then reload.
            var board = document.querySelector("[data-rewards-board]");
            var liveEl = document.querySelector("[data-rewards-live]");
            var rewardsState = { quests: null, achievements: null, checkIn: null, spin: null };
            var busy = {};
            var justClaimed = {};
            var TIER_NAMES = { 1: "Genin", 2: "Chūnin", 3: "Jōnin" };
            var SVG_NS = "http://www.w3.org/2000/svg";

            function node(tag, className, text) {
                var n = document.createElement(tag);
                if (className) n.className = className;
                if (text !== undefined && text !== null) n.textContent = text;
                return n;
            }
            function fmt(value) {
                return (Number(value) || 0).toLocaleString("en-US");
            }
            function checkIcon() {
                var svg = document.createElementNS(SVG_NS, "svg");
                svg.setAttribute("viewBox", "0 0 16 16");
                svg.setAttribute("aria-hidden", "true");
                svg.setAttribute("class", "rw-check");
                var path = document.createElementNS(SVG_NS, "path");
                path.setAttribute("d", "M3.5 8.5l3 3 6-7");
                svg.appendChild(path);
                return svg;
            }
            // A ryō amount with the nav's coin, so rewards read as the same currency as the balance.
            function ryoAmount(amount, className) {
                var wrap = node("span", "rw-ryo" + (className ? " " + className : ""));
                wrap.appendChild(node("span", "rw-coin", "R")).setAttribute("aria-hidden", "true");
                wrap.appendChild(node("span", "rw-ryo-value", fmt(amount)));
                wrap.appendChild(node("span", "sr-only", " ryō"));
                return wrap;
            }
            function announce(text) {
                if (!liveEl) return;
                liveEl.textContent = "";
                setTimeout(function() { liveEl.textContent = text; }, 30);
            }
            function setCanonicalRyo(ryo) {
                if (typeof ryo !== "number") return;
                if (window.ArenaRoster && typeof window.ArenaRoster.setRyo === "function") window.ArenaRoster.setRyo(ryo);
                else document.querySelectorAll("[data-ryo-balance]").forEach(function(n) { n.textContent = fmt(ryo); });
                document.dispatchEvent(new CustomEvent("arena:ryo-changed"));
            }
            function getJson(url) {
                return window.ArenaSession.fetch(url).then(function(r) {
                    return r.json().catch(function() { return {}; });
                });
            }
            function postJson(url, body) {
                return window.ArenaSession.fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body || {})
                }).then(function(r) {
                    return r.json().catch(function() { return {}; }).then(function(d) {
                        if (!r.ok || !d.ok) throw new Error(d.error || "That didn't go through. Try again.");
                        return d;
                    });
                });
            }
            function claimButton(label, amount, onClick, key) {
                var btn = node("button", "rw-btn rw-btn-primary rw-btn-claim");
                btn.type = "button";
                btn.appendChild(node("span", "rw-btn-label", label));
                if (amount) btn.appendChild(ryoAmount(amount, "rw-ryo-on-btn"));
                if (busy[key]) {
                    btn.disabled = true;
                    btn.classList.add("is-loading");
                    btn.setAttribute("aria-busy", "true");
                }
                btn.addEventListener("click", onClick);
                return btn;
            }
            // Runs a claim: lock its button, post, take the server's balance, then reload canonical state.
            function runClaim(key, url, body, reload, successText) {
                if (busy[key]) return;
                busy[key] = true;
                reload(true);
                postJson(url, body).then(function(d) {
                    justClaimed[key] = true;
                    setCanonicalRyo(d.ryo);
                    announce(successText(d));
                }).catch(function(err) {
                    announce(err.message);
                }).then(function() {
                    busy[key] = false;
                    reload();
                });
            }

            // Check-in: a seven-day track. currentDayIndex is the day the next claim pays.
            function renderCheckIn() {
                var week = board && board.querySelector("[data-checkin-week]");
                if (!week) return;
                var data = rewardsState.checkIn;
                var note = board.querySelector("[data-checkin-note]");
                var status = board.querySelector("[data-checkin-status]");
                var claim = board.querySelector("[data-checkin-claim]");
                week.innerHTML = "";
                if (!data) return;
                var calendar = data.calendar || [];
                var nextDay = Number(data.currentDayIndex) || 1;
                var canClaim = Boolean(data.canClaimToday);
                // After the seventh day the next claim starts a new week; until then the full week stays stamped.
                var weekDone = !canClaim && nextDay === 1 && Number(data.streakCount) > 0;
                var claimedThrough = weekDone ? calendar.length : nextDay - 1;
                var fresh = justClaimed.checkIn;
                justClaimed.checkIn = false;
                week.style.setProperty("--rw-reach", calendar.length > 1 ? Math.max(0, claimedThrough - 1) / (calendar.length - 1) : 0);

                calendar.forEach(function(day, i) {
                    var isClaimed = day.day <= claimedThrough;
                    var isReady = canClaim && day.day === nextDay;
                    var isGrand = i === calendar.length - 1;
                    var li = node("li", "rw-day");
                    if (isClaimed) li.classList.add("is-claimed");
                    if (isReady) li.classList.add("is-ready");
                    if (isGrand) li.classList.add("is-grand");
                    if (fresh && day.day === claimedThrough) li.classList.add("is-fresh");
                    var stamp = node("span", "rw-day-stamp");
                    if (isClaimed) stamp.appendChild(checkIcon());
                    else if (isGrand) stamp.appendChild(node("span", "rw-day-kanji", "礼"));
                    else stamp.appendChild(node("span", "rw-day-num", String(day.day)));
                    li.appendChild(stamp);
                    li.appendChild(node("span", "rw-day-label", isReady ? "Today" : "Day " + day.day));
                    li.appendChild(node("span", "rw-day-amount", fmt(day.rewards && day.rewards.ryo)));
                    li.setAttribute("aria-label", "Day " + day.day + ", " + fmt(day.rewards && day.rewards.ryo) + " ryō, " + (isClaimed ? "claimed" : isReady ? "ready to claim" : "not yet"));
                    week.appendChild(li);
                });

                var nextReward = calendar[nextDay - 1] || calendar[0] || { rewards: {} };
                if (note) note.textContent = canClaim ? "Day " + nextDay + " of " + calendar.length : weekDone ? "Week complete" : "Day " + (nextDay - 1) + " of " + calendar.length;
                if (status) {
                    // The pulsing stamp and the Claim button say "ready"; the line only speaks once today is done.
                    status.hidden = canClaim || Boolean(busy.checkIn);
                    status.textContent = "Claimed today. Day " + nextDay + " pays " + fmt(nextReward.rewards && nextReward.rewards.ryo) + " ryō tomorrow.";
                }
                if (claim) {
                    claim.hidden = !canClaim && !busy.checkIn;
                    var fresh2 = claimButton("Claim", nextReward.rewards && nextReward.rewards.ryo, function() {
                        runClaim("checkIn", "/api/login-rewards/claim", {}, loadCheckIn, function(d) {
                            return "Day " + (d.claimedDay || nextDay) + " claimed: " + fmt(d.rewards && d.rewards.ryo) + " ryō.";
                        });
                    }, "checkIn");
                    fresh2.setAttribute("data-checkin-claim", "");
                    fresh2.hidden = claim.hidden;
                    claim.replaceWith(fresh2);
                }
            }

            // A progress track: a thin well with an amber fill and a tabular count.
            function progressTrack(current, target, label) {
                var wrap = node("div", "rw-progress");
                var track = node("span", "rw-track");
                var fill = node("span", "rw-track-fill");
                var pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
                fill.style.width = pct + "%";
                track.appendChild(fill);
                track.setAttribute("role", "progressbar");
                track.setAttribute("aria-valuemin", "0");
                track.setAttribute("aria-valuemax", String(target));
                track.setAttribute("aria-valuenow", String(current));
                track.setAttribute("aria-label", label);
                wrap.appendChild(track);
                wrap.appendChild(node("span", "rw-count", fmt(current) + " / " + fmt(target)));
                return wrap;
            }
            function claimedMark(amount) {
                var mark = node("span", "rw-claimed");
                mark.appendChild(checkIcon());
                mark.appendChild(node("span", "rw-claimed-label", "Claimed"));
                return mark;
            }

            function renderContracts() {
                var list = board && board.querySelector("[data-contracts-list]");
                var note = board && board.querySelector("[data-contracts-note]");
                if (!list) return;
                var quests = rewardsState.quests;
                if (!quests) return;
                list.innerHTML = "";
                if (!quests.length) {
                    list.appendChild(node("li", "rw-empty", "No contracts are posted right now."));
                    if (note) note.textContent = "";
                    return;
                }
                // Daily first, then weekly, each in server order, so rows never jump when one is claimed.
                var ordered = quests.filter(function(q) { return q.type === "daily"; })
                    .concat(quests.filter(function(q) { return q.type !== "daily"; }));
                var claimed = 0;
                ordered.forEach(function(q) {
                    if (q.isClaimed) claimed += 1;
                    var key = "quest:" + q.questId;
                    var li = node("li", "rw-row");
                    if (q.canClaim) li.classList.add("is-ready");
                    if (q.isClaimed) li.classList.add("is-done");
                    if (justClaimed[key]) { li.classList.add("is-fresh"); justClaimed[key] = false; }
                    var main = node("div", "rw-row-main");
                    main.appendChild(node("strong", "rw-row-title", q.title));
                    var meta = node("p", "rw-row-meta");
                    var cadence = node("span", "rw-cadence", q.type === "weekly" ? "Weekly" : q.type === "daily" ? "Daily" : q.type);
                    if (q.resetsAt && untilText(q.resetsAt)) cadence.title = "Resets in " + untilText(q.resetsAt);
                    meta.appendChild(cadence);
                    meta.appendChild(document.createTextNode(q.description));
                    main.appendChild(meta);
                    if (!q.isClaimed) main.appendChild(progressTrack(Number(q.currentProgress) || 0, Number(q.target) || 0, q.title + " progress"));
                    li.appendChild(main);
                    var end = node("div", "rw-row-end");
                    var ryo = q.rewards && q.rewards.ryo;
                    if (q.isClaimed) end.appendChild(claimedMark(ryo));
                    else if (q.canClaim || busy[key]) {
                        end.appendChild(claimButton("Claim", ryo, function() {
                            runClaim(key, "/api/quests/claim", { questId: q.questId }, loadQuests, function() {
                                return q.title + " claimed: " + fmt(ryo) + " ryō.";
                            });
                        }, key));
                    } else if (ryo) end.appendChild(ryoAmount(ryo));
                    li.appendChild(end);
                    list.appendChild(li);
                });
                // Dailies reset at the server's daily reset; show how long is left.
                var dailyReset = ordered.filter(function(q) { return q.type === "daily" && q.resetsAt; })[0];
                var resetText = dailyReset ? untilText(dailyReset.resetsAt) : "";
                if (note) note.textContent = claimed + " of " + ordered.length + " claimed" + (resetText ? " · dailies reset in " + resetText : "");
            }

            // Achievements: three tiers on one track. Each segment fills with progress toward its tier.
            function renderAchievements() {
                var list = board && board.querySelector("[data-achievements-list]");
                var note = board && board.querySelector("[data-achievements-note]");
                if (!list) return;
                var achievements = rewardsState.achievements;
                if (!achievements) return;
                list.innerHTML = "";
                if (!achievements.length) {
                    list.appendChild(node("li", "rw-empty", "No achievements yet."));
                    return;
                }
                var tiersClaimed = 0;
                var tiersTotal = 0;
                achievements.forEach(function(ach) {
                    var tiers = ach.tiers || [];
                    var value = Number(ach.currentValue) || 0;
                    var li = node("li", "rw-row rw-ach");
                    var main = node("div", "rw-row-main");
                    main.appendChild(node("strong", "rw-row-title", ach.title));
                    main.appendChild(node("p", "rw-row-meta", ach.description));
                    var ladder = node("ol", "rw-tiers");
                    ladder.setAttribute("aria-label", ach.title + " tiers");
                    var claimable = null;
                    var nextLocked = null;
                    tiers.forEach(function(t, i) {
                        tiersTotal += 1;
                        if (t.isClaimed) tiersClaimed += 1;
                        if (t.canClaim && !claimable) claimable = t;
                        if (!t.isCompleted && !nextLocked) nextLocked = t;
                        var prevTarget = i > 0 ? Number(tiers[i - 1].target) || 0 : 0;
                        var span = (Number(t.target) || 0) - prevTarget;
                        var reach = span > 0 ? Math.max(0, Math.min(1, (value - prevTarget) / span)) : 1;
                        var key = "ach:" + ach.id + ":" + t.tier;
                        var tierEl = node("li", "rw-tier");
                        tierEl.style.setProperty("--rw-reach", reach);
                        if (t.isClaimed) tierEl.classList.add("is-claimed");
                        else if (t.isCompleted) tierEl.classList.add("is-ready");
                        if (justClaimed[key]) { tierEl.classList.add("is-fresh"); justClaimed[key] = false; }
                        // Each tier's marker carries its target, so the track reads 5 · 25 · 100 at a glance.
                        var stamp = node("span", "rw-tier-stamp");
                        if (t.isClaimed) stamp.appendChild(checkIcon());
                        stamp.appendChild(node("span", "rw-tier-target", fmt(t.target)));
                        tierEl.appendChild(stamp);
                        var name = TIER_NAMES[t.tier] || "Tier " + t.tier;
                        tierEl.title = name + ": reach " + fmt(t.target) + " for " + fmt(t.rewards && t.rewards.ryo) + " ryō";
                        tierEl.setAttribute("aria-label", name + ", " + fmt(t.target) + ", " + fmt(t.rewards && t.rewards.ryo) + " ryō, " + (t.isClaimed ? "claimed" : t.isCompleted ? "ready to claim" : "not reached"));
                        ladder.appendChild(tierEl);
                    });
                    main.appendChild(ladder);
                    li.appendChild(main);
                    var end = node("div", "rw-row-end");
                    var claimKey = claimable ? "ach:" + ach.id + ":" + claimable.tier : "";
                    if (claimable) {
                        li.classList.add("is-ready");
                        end.appendChild(claimButton("Claim", claimable.rewards && claimable.rewards.ryo, function() {
                            runClaim(claimKey, "/api/achievements/claim", { achievementId: ach.id, tier: claimable.tier }, loadAchievements, function() {
                                return ach.title + " " + (TIER_NAMES[claimable.tier] || "tier") + " claimed: " + fmt(claimable.rewards && claimable.rewards.ryo) + " ryō.";
                            });
                        }, claimKey));
                    } else if (nextLocked) {
                        end.appendChild(node("span", "rw-next-label", "Next"));
                        end.appendChild(ryoAmount(nextLocked.rewards && nextLocked.rewards.ryo));
                    } else {
                        li.classList.add("is-done");
                        end.appendChild(claimedMark());
                    }
                    li.appendChild(end);
                    list.appendChild(li);
                });
                if (note) note.textContent = tiersClaimed + " of " + tiersTotal + " tiers";
            }

            function untilText(iso) {
                var ms = new Date(iso).getTime() - Date.now();
                if (!(ms > 0)) return "";
                var hours = Math.floor(ms / 3600000);
                if (hours >= 24) return Math.floor(hours / 24) + "d " + (hours % 24) + "h";
                return (hours ? hours + "h " : "") + Math.max(1, Math.floor((ms % 3600000) / 60000)) + "m";
            }

            function renderSpin() {
                var cell = board && board.querySelector("[data-spin-cell]");
                if (!cell) return;
                var spin = rewardsState.spin;
                var status = cell.querySelector("[data-spin-status]");
                var open = cell.querySelector("[data-spin-open]");
                cell.classList.toggle("is-ready", Boolean(spin && spin.available));
                if (!spin) return;
                if (spin.available) {
                    status.textContent = "Free spin ready";
                    open.textContent = "Spin the wheel";
                    open.classList.add("rw-btn-primary");
                } else {
                    var ms = spin.nextSpinAt ? new Date(spin.nextSpinAt).getTime() - Date.now() : 0;
                    var hours = Math.floor(ms / 3600000);
                    var minutes = Math.max(0, Math.floor((ms % 3600000) / 60000));
                    status.textContent = ms > 0 ? "Next in " + (hours ? hours + "h " : "") + minutes + "m" : "Spun today";
                    open.textContent = "View the wheel";
                    open.classList.remove("rw-btn-primary");
                }
            }

            function loadQuests(keepRender) {
                if (keepRender === true) return renderContracts();
                getJson("/api/quests").then(function(d) {
                    if (!d.ok) return;
                    rewardsState.quests = d.quests || [];
                    setRewardCount("quests", rewardsState.quests.filter(function(q) { return q.canClaim; }).length);
                    renderContracts();
                }).catch(console.error);
            }
            function loadAchievements(keepRender) {
                if (keepRender === true) return renderAchievements();
                getJson("/api/achievements").then(function(d) {
                    if (!d.ok) return;
                    rewardsState.achievements = d.achievements || [];
                    setRewardCount("achievements", rewardsState.achievements.reduce(function(sum, ach) {
                        return sum + (ach.tiers || []).filter(function(t) { return t.canClaim; }).length;
                    }, 0));
                    renderAchievements();
                }).catch(console.error);
            }
            function loadCheckIn(keepRender) {
                if (keepRender === true) return renderCheckIn();
                getJson("/api/login-rewards").then(function(d) {
                    if (!d.ok) return;
                    rewardsState.checkIn = d;
                    setRewardCount("checkIn", d.canClaimToday ? 1 : 0);
                    renderCheckIn();
                }).catch(console.error);
            }

            // Promo codes redeem inline; the server's message is shown as-is.
            var promoForm = document.querySelector("[data-promo-form]");
            if (promoForm) {
                promoForm.addEventListener("submit", function(e) {
                    e.preventDefault();
                    var input = promoForm.querySelector("[data-promo-input]");
                    var msg = promoForm.querySelector("[data-promo-msg]");
                    var submit = promoForm.querySelector("[data-promo-submit]");
                    var code = input ? input.value.trim() : "";
                    msg.classList.remove("is-error", "is-success");
                    if (!code) {
                        msg.textContent = "Enter a code first.";
                        msg.classList.add("is-error");
                        input.focus();
                        return;
                    }
                    submit.disabled = true;
                    submit.classList.add("is-loading");
                    msg.textContent = "Checking the code…";
                    postJson("/api/promo-codes/redeem", { code: code }).then(function(d) {
                        msg.textContent = d.message || "Code redeemed.";
                        msg.classList.add("is-success");
                        input.value = "";
                        setCanonicalRyo(d.ryo);
                        document.dispatchEvent(new CustomEvent("arena:inventory-changed"));
                    }).catch(function(err) {
                        msg.textContent = err.message;
                        msg.classList.add("is-error");
                    }).then(function() {
                        submit.disabled = false;
                        submit.classList.remove("is-loading");
                    });
                });
            }

            // Reward alerts: count everything waiting to be claimed and light an orb on the Profile tab,
            // so players notice dailies without opening a menu. The Profile > Rewards tab shows the count.
            var rewardCounts = { quests: 0, achievements: 0, checkIn: 0, spin: 0 };
            var rewardsTab = document.querySelector("[data-rewards-tab]");
            var rewardsOrb = document.querySelector("[data-rewards-orb]");
            var rewardsCountEl = document.querySelector("[data-rewards-count]");
            function setRewardCount(key, count) {
                rewardCounts[key] = Math.max(0, Number(count) || 0);
                var total = rewardCounts.quests + rewardCounts.achievements + rewardCounts.checkIn + rewardCounts.spin;
                if (rewardsCountEl) {
                    rewardsCountEl.hidden = total === 0;
                    rewardsCountEl.textContent = total > 9 ? "9+" : String(total);
                }
                if (rewardsOrb) rewardsOrb.hidden = total === 0;
                if (rewardsTab) {
                    if (total > 0) {
                        rewardsTab.setAttribute("aria-label", "Profile, " + total + (total === 1 ? " reward" : " rewards") + " ready to claim");
                        rewardsTab.title = total + (total === 1 ? " reward" : " rewards") + " ready to claim";
                    } else {
                        rewardsTab.removeAttribute("aria-label");
                        rewardsTab.removeAttribute("title");
                    }
                }
            }
            function refreshRewardAlerts() {
                loadQuests();
                loadAchievements();
                loadCheckIn();
            }
            document.addEventListener("arena:rewards-refresh", refreshRewardAlerts);
            document.addEventListener("arena:daily-spin-state", function(event) {
                var detail = event.detail || {};
                rewardsState.spin = { available: Boolean(detail.available), nextSpinAt: detail.nextSpinAt || "" };
                setRewardCount("spin", detail.available ? 1 : 0);
                renderSpin();
            });
            if (window.ArenaSession && window.ArenaSession.ready) {
                window.ArenaSession.ready.then(function(user) { if (user) refreshRewardAlerts(); }).catch(function() {});
            }
            // Dailies reset while the page is open; recheck when the player comes back and every few minutes.
            document.addEventListener("visibilitychange", function() {
                if (document.visibilityState === "visible") refreshRewardAlerts();
            });
            setInterval(function() {
                if (document.visibilityState === "visible") {
                    refreshRewardAlerts();
                    renderSpin();
                }
            }, 5 * 60 * 1000);
        })();
