    (function () {
        var settings = document.querySelector(".selection-hub-settings");
        var settingsButton = document.querySelector(".selection-hub-settings-button");
        var settingsMenu = document.querySelector(".selection-hub-settings-menu");
        var environment = document.querySelector("[data-hub-environment]");
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-hub-panel]"));
        var tabButtons = Array.prototype.slice.call(document.querySelectorAll(".selection-hub-tabs [data-hub-view]"));
        var viewButtons = Array.prototype.slice.call(document.querySelectorAll("[data-hub-view]"));

        var missionGrid = document.querySelector("[data-mission-grid]");
        var missionDetailEl = document.querySelector("[data-mission-detail]");
        var missionWorkspace = document.querySelector("[data-mission-workspace]");
        var missionSummary = document.querySelector("[data-mission-summary]");
        var missionSearch = document.querySelector("[data-mission-search]");
        var missionStatusSelect = document.querySelector("[data-mission-status]");
        var missionRankButtons = Array.prototype.slice.call(document.querySelectorAll("[data-mission-rank]"));
        var loadedMissions = false;
        var missions = [];
        var missionProgressByMissionId = {};
        var missionRank = "all";
        var selectedMissionId = "";
        var rankMeta = {
            dc: "D & C Rank Missions",
            b: "B Rank Missions",
            a: "A Rank Missions",
            s: "S Rank Missions"
        };

        function setSettingsOpen(open) {
            if (settings) {
                if (open) {
                    settings.classList.add("open");
                    if (settingsButton) settingsButton.setAttribute("aria-expanded", "true");
                } else {
                    settings.classList.remove("open");
                    if (settingsButton) settingsButton.setAttribute("aria-expanded", "false");
                }
            }
            var sm = document.getElementById("settings-modal");
            if (sm) {
                if (open) {
                    sm.classList.remove("hidden");
                } else {
                    sm.classList.add("hidden");
                }
            }
        }

        function fetchJson(url, options) {
            return window.ArenaSession.fetch(url, Object.assign({ credentials: "include" }, options || {})).then(function (res) {
                return res.json().catch(function () {
                    return {};
                }).then(function (data) {
                    if (!res.ok) {
                        throw new Error((data && data.error) || "Request failed.");
                    }
                    return data;
                });
            });
        }

        function slug(value) {
            return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        }

        function getLevelRequirementValue(mission) {
            var value = Number(mission && mission.level_requirement ? mission.level_requirement : 0);
            return Number.isFinite(value) && value > 0 ? value : 0;
        }

        function rankOf(mission) {
            if (mission && ["dc", "b", "a", "s"].indexOf(mission.mission_rank) !== -1) return mission.mission_rank;
            var level = getLevelRequirementValue(mission) || 1;
            if (level >= 40) return "s";
            if (level >= 30) return "a";
            if (level >= 20) return "b";
            return "dc";
        }

        function normalizeMissionGoal(goal) {
            if (typeof goal === "string") {
                var text = goal.trim();
                if (!text) return null;
                var m;
                if ((m = text.match(/^Reach\s+rank\s+(\d+)(?:\.\s*\(0\/\d+\))?$/i))) return { type: "reach_rank", rank: Number(m[1]) || 0 };
                if ((m = text.match(/^Win\s+(\d+)\s+matches?\s+with\s+(.+?)(?:\.\s*\(0\/\d+\))?$/i))) return { type: "win_matches", character_name: m[2].trim(), wins: Number(m[1]) || 0 };
                if ((m = text.match(/^Win\s+(\d+)\s+battles?\s+in\s+a\s+row\s+with\s+(.+?)(?:\.\s*\(0\/\d+\))?$/i))) return { type: "win_streak", character_name: m[2].trim(), wins: Number(m[1]) || 0 };
                return { type: "text", text: text };
            }
            var s = goal && typeof goal === "object" ? goal : {};
            var type = String(s.type || s.goalType || "text").trim().toLowerCase();
            var wins = Number(s.wins != null ? s.wins : (s.count != null ? s.count : 0)) || 0;
            var cname = String(s.character_name || s.characterName || s.character_id || s.characterId || "").trim();
            var rank = Number(s.rank != null ? s.rank : (s.level != null ? s.level : 0)) || 0;
            if (type === "reach_rank") return rank ? { type: "reach_rank", rank: rank } : null;
            if (type === "win_matches" || type === "win_streak") return wins ? { type: type, character_name: cname, wins: wins } : null;
            if (["win_matches_tag", "win_matches_against_tag", "win_matches_all_team_tag", "win_matches_tag_members"].indexOf(type) !== -1) {
                return wins && s.character_tag ? { type: type, character_name: cname, character_tag: String(s.character_tag), wins: wins } : null;
            }
            if (type === "win_streak_any" || type === "win_matches_any") {
                var anyNames = Array.isArray(s.character_names) ? s.character_names.filter(Boolean) : [];
                var anyIds = Array.isArray(s.character_ids) ? s.character_ids.filter(Boolean) : [];
                var groupLabel = String(s.character_name || s.group_label || "").trim();
                if (!wins || (anyNames.length < 2 && anyIds.length < 2 && !groupLabel)) return null;
                return { type: type, character_names: anyNames, group_label: groupLabel, wins: wins };
            }
            if (type === "use_skill") {
                var skillId = String(s.skill_id || s.skillId || "").trim().toLowerCase();
                var skillName = String(s.skill_name || s.skillName || "").trim();
                if (!wins || !skillId) return null;
                return { type: "use_skill", skill_id: skillId, skill_name: skillName, character_name: cname, wins: wins };
            }
            var freeText = String(s.text || s.value || s.label || s.description || "").trim();
            return freeText ? { type: "text", text: freeText } : null;
        }

        function formatMissionGoal(goal, progress) {
            var n = normalizeMissionGoal(goal);
            if (!n) return "";
            var c = Math.max(0, Number(progress && progress.count ? progress.count : 0) || 0);
            if (n.type === "reach_rank") return "Reach rank " + n.rank + ". (" + Math.min(c, n.rank) + "/" + n.rank + ")";
            if (n.type === "win_matches") return "Win " + n.wins + " battles" + (n.character_name ? " with " + n.character_name : "") + ". (" + Math.min(c, n.wins) + "/" + n.wins + ")";
            if (n.type === "win_streak") return "Win " + n.wins + " battles in a row" + (n.character_name ? " with " + n.character_name : "") + ". (" + Math.min(c, n.wins) + "/" + n.wins + ")";
            if (n.type === "win_streak_any") return "Win " + n.wins + " battles in a row with " + (n.group_label || n.character_names.join(" or ")) + ". (" + Math.min(c, n.wins) + "/" + n.wins + ")";
            if (n.type === "win_matches_any") return "Win " + n.wins + " battles with " + (n.group_label || n.character_names.join(" or ")) + ". (" + Math.min(c, n.wins) + "/" + n.wins + ")";
            if (n.type === "win_matches_tag") return "Win " + n.wins + " battles with " + n.character_name + ". (" + Math.min(c, n.wins) + "/" + n.wins + ")";
            if (n.type === "win_matches_against_tag") return "Win " + n.wins + " battles against a team with " + n.character_name + ". (" + Math.min(c, n.wins) + "/" + n.wins + ")";
            if (n.type === "win_matches_all_team_tag") return "Win " + n.wins + " battles with all three teammates from " + n.character_name + ". (" + Math.min(c, n.wins) + "/" + n.wins + ")";
            if (n.type === "win_matches_tag_members") return "Earn " + n.wins + " winning-team credits with " + n.character_name + " (one per teammate). (" + Math.min(c, n.wins) + "/" + n.wins + ")";
            if (n.type === "use_skill") return "Use " + (n.character_name ? n.character_name + "'s " : "") + "\"" + (n.skill_name || n.skill_id) + "\" " + n.wins + " times. (" + Math.min(c, n.wins) + "/" + n.wins + ")";
            return n.text || "";
        }

        function getGoalProgress(missionId, goalIndex) {
            var mp = missionProgressByMissionId[missionId];
            var gp = mp && mp.goalProgressByIndex ? mp.goalProgressByIndex[String(goalIndex)] : null;
            return { count: Math.max(0, Number(gp && gp.count ? gp.count : 0) || 0) };
        }

        function getModeText(mission) {
            var modes = (mission && mission.mode_restriction && Array.isArray(mission.mode_restriction.allowed_modes)) ? mission.mode_restriction.allowed_modes : [];
            if (!modes.length) return "";
            if (modes.length === 2 && modes.indexOf("quick") !== -1 && modes.indexOf("ladder") !== -1) return "Quick games and ladder games only.";
            return modes.map(function (x) { return x.charAt(0).toUpperCase() + x.slice(1); }).join(", ") + ".";
        }

        function getRequirementLines(mission) {
            var lines = [];
            var modeText = getModeText(mission);
            if (modeText) lines.push("Mode: " + modeText);
            var sw = mission && mission.win_streak ? mission.win_streak : null;
            if (sw && sw.wins > 0 && sw.character_name) lines.push("Win " + sw.wins + " battles in a row with " + sw.character_name + ".");
            (Array.isArray(mission && mission.requirements) ? mission.requirements : []).forEach(function (r) {
                if (r && lines.indexOf(r) === -1) lines.push(r);
            });
            return lines;
        }

        function getRewardText(mission) {
            if (mission && mission.reward_characters && mission.reward_characters.length > 1) return mission.reward || "";
            var rcn = String((mission && mission.reward_character_name) || (mission && mission.reward_character) || "").trim();
            if (rcn) return "Unlock " + rcn + ".";
            return String(mission && mission.reward ? mission.reward : "").trim();
        }

        function normalizeMission(mission, index) {
            var src = mission && typeof mission === "object" ? mission : {};
            var id = slug(src.missionId || src.id || src.title || src.name || "") || "mission-" + (index + 1);
            var allowedModes = Array.isArray(src.mode_restriction && src.mode_restriction.allowed_modes) ? src.mode_restriction.allowed_modes : ["quick", "ladder"];
            return {
                missionId: id,
                title: String(src.title || src.name || "Mission " + (index + 1)).trim(),
                level_requirement: Number(src.level_requirement != null ? src.level_requirement : (src.levelRequirement || src.rank || 0)) || 0,
                mission_rank: String(src.mission_rank || "").toLowerCase(),
                mode_restriction: { allowed_modes: allowedModes.filter(function (m) { return m === "quick" || m === "ladder"; }) },
                reward_character: String(src.reward_character || src.rewardCharacter || "").trim(),
                reward_characters: Array.isArray(src.reward_characters) ? src.reward_characters.map(String) : [],
                reward_character_name: String(src.reward_character_name || src.rewardCharacterName || "").trim(),
                reward: String(src.reward || "").trim(),
                win_streak: {
                    character_name: String((src.win_streak && src.win_streak.character_name) || (src.winStreak && src.winStreak.characterName) || "").trim(),
                    wins: Number((src.win_streak && src.win_streak.wins) || (src.winStreak && src.winStreak.wins) || 0) || 0
                },
                image: String(src.image || "").trim(),
                imageAlt: String(src.imageAlt || src.title || "Mission artwork").trim(),
                characterName: String(src.characterName || "").trim(),
                portrait: String(src.portrait || "").trim(),
                requirements: Array.isArray(src.requirements) ? src.requirements.map(function (e) { return String(e || "").trim(); }).filter(Boolean) : [],
                goals: Array.isArray(src.goals) ? src.goals.map(normalizeMissionGoal).filter(Boolean) : [],
                available: src.available !== false,
                sortOrder: Number.isFinite(Number(src.sortOrder)) ? Number(src.sortOrder) : index + 1
            };
        }

        function normalizeMissionProgress(progressByMissionId) {
            var source = progressByMissionId && typeof progressByMissionId === "object" ? progressByMissionId : {};
            var out = {};
            Object.keys(source).forEach(function (id) {
                var entry = source[id] && typeof source[id] === "object" ? source[id] : {};
                var rawGoalProgress = (entry.goalProgressByIndex && typeof entry.goalProgressByIndex === "object")
                    ? entry.goalProgressByIndex
                    : ((entry.goalProgress && typeof entry.goalProgress === "object") ? entry.goalProgress : {});
                var goalProgressByIndex = {};
                Object.keys(rawGoalProgress).forEach(function (goalIndex) {
                    var normalizedIndex = String(parseInt(goalIndex, 10));
                    if (normalizedIndex && normalizedIndex !== "NaN") {
                        var goalEntry = rawGoalProgress[goalIndex] || {};
                        goalProgressByIndex[normalizedIndex] = {
                            count: Math.max(0, Number(goalEntry.count != null ? goalEntry.count : (goalEntry.progress || 0)) || 0)
                        };
                    }
                });
                out[id] = { completedAt: entry.completedAt || null, goalProgressByIndex: goalProgressByIndex };
            });
            return out;
        }

        function statusOf(mission) {
            var progress = missionProgressByMissionId[mission.missionId];
            if (progress && progress.completedAt) return "completed";
            if (mission.available === false) return "locked";
            return "available";
        }

        function missionNode(tag, className, text) {
            var node = document.createElement(tag);
            node.className = className;
            if (text !== undefined) node.textContent = text;
            return node;
        }

        function missionGoalTarget(goal) {
            var normalized = normalizeMissionGoal(goal);
            return normalized ? Math.max(0, Number(normalized.type === "reach_rank" ? normalized.rank : normalized.wins) || 0) : 0;
        }

        function renderMissions() {
            if (!missionGrid) return;
            var query = String(missionSearch && missionSearch.value ? missionSearch.value : "").trim().toLowerCase();
            var selectedStatus = missionStatusSelect ? missionStatusSelect.value : "all";
            var list = missions.filter(function (mission) {
                if (missionRank !== "all" && rankOf(mission) !== missionRank) return false;
                if (selectedStatus !== "all" && statusOf(mission) !== selectedStatus) return false;
                if (!query) return true;
                return [mission.title, mission.missionId, mission.characterName,
                    mission.reward_character_name, mission.reward_character, mission.reward]
                    .join(" ").toLowerCase().indexOf(query) !== -1;
            }).sort(function (a, b) {
                var order = { available: 0, locked: 1, completed: 2 };
                return order[statusOf(a)] - order[statusOf(b)] ||
                    getLevelRequirementValue(a) - getLevelRequirementValue(b) || a.title.localeCompare(b.title);
            });

            if (missionSummary) {
                var completeCount = missions.filter(function (mission) { return statusOf(mission) === "completed"; }).length;
                missionSummary.textContent = missions.length ? completeCount + " of " + missions.length + " completed" : "";
            }
            missionGrid.innerHTML = "";
            missionGrid.appendChild(missionNode("div", "mission-list-heading", list.length + (list.length === 1 ? " mission" : " missions")));
            if (!list.length) {
                var empty = missionNode("div", "selection-hub-env-empty", missions.length ? "No missions match your filters." : "No missions are available yet.");
                if (missions.length) {
                    var clear = missionNode("button", "mission-clear-filters", "Clear filters");
                    clear.type = "button";
                    clear.addEventListener("click", function () {
                        missionRank = "all";
                        missionRankButtons.forEach(function (button) {
                            var active = button.getAttribute("data-mission-rank") === "all";
                            button.classList.toggle("active", active);
                            button.setAttribute("aria-pressed", String(active));
                        });
                        if (missionStatusSelect) missionStatusSelect.value = "all";
                        if (missionSearch) missionSearch.value = "";
                        renderMissions();
                    });
                    empty.appendChild(clear);
                }
                missionGrid.appendChild(empty);
                if (missionDetailEl) missionDetailEl.hidden = true;
                if (missionWorkspace) missionWorkspace.dataset.detailOpen = "false";
                return;
            }

            var selected = list.find(function (mission) { return mission.missionId === selectedMissionId; });
            var keepMobileDetail = Boolean(selected && missionWorkspace && missionWorkspace.dataset.detailOpen === "true");
            if (!selected) selected = list[0];
            list.forEach(function (mission) {
                var state = statusOf(mission);
                var row = missionNode("button", "mission-list-row " + state);
                row.type = "button";
                row.dataset.missionId = mission.missionId;
                var main = missionNode("span", "mission-row-main");
                main.appendChild(missionNode("strong", "mission-row-title", mission.title));
                main.appendChild(missionNode("span", "mission-row-reward", getRewardText(mission) || "View reward"));
                if (mission.goals[0]) main.appendChild(missionNode("span", "mission-row-goal", formatMissionGoal(mission.goals[0], getGoalProgress(mission.missionId, 0))));
                var meta = missionNode("span", "mission-row-meta");
                meta.appendChild(missionNode("span", "mission-row-level", "LEVEL " + (getLevelRequirementValue(mission) || 1)));
                meta.appendChild(missionNode("span", "mission-row-state " + state, state === "completed" ? "Complete" : state === "locked" ? "Locked" : "Available"));
                row.appendChild(main);
                row.appendChild(meta);
                row.addEventListener("click", function () { showMissionDetail(mission, true); });
                missionGrid.appendChild(row);
            });
            showMissionDetail(selected, keepMobileDetail);
        }

        function showMissionsGrid() {
            if (missionGrid) missionGrid.hidden = false;
            if (missionWorkspace) missionWorkspace.dataset.detailOpen = "false";
        }

        function showMissionDetail(mission, openMobileDetail) {
            if (!missionDetailEl || !mission) return;
            selectedMissionId = mission.missionId;
            if (missionWorkspace) missionWorkspace.dataset.detailOpen = openMobileDetail ? "true" : "false";
            if (missionGrid) {
                missionGrid.querySelectorAll("[data-mission-id]").forEach(function (row) {
                    var selected = row.dataset.missionId === mission.missionId;
                    row.classList.toggle("selected", selected);
                    row.setAttribute("aria-pressed", String(selected));
                });
            }
            missionDetailEl.hidden = false;
            missionDetailEl.innerHTML = "";
            var state = statusOf(mission);
            var top = missionNode("div", "mission-detail-top");
            var back = missionNode("button", "selection-hub-mission-back", "Back to missions");
            back.type = "button";
            back.addEventListener("click", function () {
                showMissionsGrid();
                var row = missionGrid && missionGrid.querySelector(".mission-list-row.selected");
                if (row) row.focus();
            });
            top.appendChild(back);
            top.appendChild(missionNode("span", "mission-detail-state " + state, state === "completed" ? "Completed" : state === "locked" ? "Locked" : "Available"));
            missionDetailEl.appendChild(top);

            var hero = missionNode("div", "mission-detail-hero");
            if (mission.image || mission.portrait) {
                var art = document.createElement("img");
                art.className = "mission-detail-art";
                art.src = mission.image || mission.portrait;
                art.alt = mission.imageAlt || mission.title;
                art.addEventListener("error", function () { art.remove(); hero.classList.add("no-art"); });
                hero.appendChild(art);
            } else hero.classList.add("no-art");
            var heroText = missionNode("div", "mission-detail-hero-text");
            heroText.appendChild(missionNode("span", "mission-detail-level", "Level " + (getLevelRequirementValue(mission) || 1) + " / " + (rankMeta[rankOf(mission)] || "Ninja Missions")));
            heroText.appendChild(missionNode("h2", "mission-detail-title", mission.title));
            heroText.appendChild(missionNode("p", "mission-detail-reward", getRewardText(mission) || "Mission reward"));
            hero.appendChild(heroText);
            missionDetailEl.appendChild(hero);

            var goalsSection = missionNode("section", "mission-detail-section");
            goalsSection.appendChild(missionNode("h3", "mission-detail-section-title", "Objectives"));
            if (!mission.goals.length) goalsSection.appendChild(missionNode("p", "mission-detail-note", "Finish the mission to unlock its reward."));
            mission.goals.forEach(function (goal, index) {
                var progress = getGoalProgress(mission.missionId, index);
                var target = missionGoalTarget(goal);
                var row = missionNode("div", "mission-goal");
                row.appendChild(missionNode("p", "mission-goal-text", formatMissionGoal(goal, progress)));
                if (target) {
                    var track = missionNode("div", "mission-goal-track");
                    var fill = missionNode("span", "mission-goal-fill");
                    fill.style.width = (state === "completed" ? 100 : Math.min(100, progress.count / target * 100)) + "%";
                    track.appendChild(fill);
                    row.appendChild(track);
                }
                goalsSection.appendChild(row);
            });
            missionDetailEl.appendChild(goalsSection);

            var requirements = missionNode("section", "mission-detail-section mission-detail-requirements");
            requirements.appendChild(missionNode("h3", "mission-detail-section-title", "Requirements"));
            requirements.appendChild(missionNode("p", "mission-detail-note", "Level " + (getLevelRequirementValue(mission) || 1) + " or higher"));
            if (mission.characterName) requirements.appendChild(missionNode("p", "mission-detail-note", "Featured ninja: " + mission.characterName));
            getRequirementLines(mission).forEach(function (line) { requirements.appendChild(missionNode("p", "mission-detail-note", line)); });
            missionDetailEl.appendChild(requirements);

            var rewardSection = missionNode("section", "mission-detail-section mission-detail-reward-section");
            rewardSection.appendChild(missionNode("h3", "mission-detail-section-title", "Reward"));
            var multipleRewards = mission.reward_characters && mission.reward_characters.length > 1;
            var rewardName = multipleRewards
                ? getRewardText(mission).replace(/^Unlock\s+/i, "").replace(/\.$/, "")
                : String(mission.reward_character_name || mission.reward_character || "").trim();
            if (rewardName) {
                var rewardRow = missionNode("div", "mission-reward-row");
                if (multipleRewards) {
                    var rewardPortraits = missionNode("div", "mission-reward-portraits");
                    mission.reward_characters.forEach(function (characterId) {
                        var character = findCharacterById(characterId);
                        var face = character && character.facePicture;
                        if (!face) return;
                        var image = document.createElement("img");
                        image.src = face;
                        image.alt = character.name || characterId;
                        image.addEventListener("error", function () { image.remove(); });
                        rewardPortraits.appendChild(image);
                    });
                    rewardRow.appendChild(rewardPortraits);
                } else if (mission.portrait && !/deadcharacter/i.test(mission.portrait)) {
                    var portrait = document.createElement("img");
                    portrait.src = mission.portrait;
                    portrait.alt = rewardName;
                    portrait.addEventListener("error", function () { portrait.remove(); });
                    rewardRow.appendChild(portrait);
                }
                rewardRow.appendChild(missionNode("strong", "mission-reward-name", "Unlock " + rewardName));
                rewardSection.appendChild(rewardRow);
            } else rewardSection.appendChild(missionNode("p", "mission-detail-note", getRewardText(mission) || "Mission completion reward."));
            missionDetailEl.appendChild(rewardSection);
        }

        function loadMissionEnvironment(force) {
            if (!missionGrid || (loadedMissions && !force)) {
                renderMissions();
                return;
            }
            loadedMissions = true;
            missionGrid.innerHTML = '<div class="selection-hub-env-empty">Loading missions...</div>';
            fetchJson("/api/missions").then(function (data) {
                missions = (Array.isArray(data.missions) ? data.missions : []).map(normalizeMission).sort(function (a, b) {
                    var levelDiff = (getLevelRequirementValue(a) || 0) - (getLevelRequirementValue(b) || 0);
                    if (levelDiff !== 0) return levelDiff;
                    var order = (a.sortOrder || 0) - (b.sortOrder || 0);
                    return order !== 0 ? order : a.title.localeCompare(b.title);
                });
                missionProgressByMissionId = normalizeMissionProgress(data.missionProgressByMissionId);
                renderMissions();
            }).catch(function () {
                loadedMissions = false;
                missions = [];
                missionProgressByMissionId = {};
                if (missionSummary) missionSummary.textContent = "";
                if (missionDetailEl) missionDetailEl.hidden = true;
                if (missionWorkspace) missionWorkspace.dataset.detailOpen = "false";
                missionGrid.innerHTML = '';
                var empty = missionNode("div", "selection-hub-env-empty", "Unable to load missions.");
                var retry = missionNode("button", "mission-clear-filters", "Try again");
                retry.type = "button";
                retry.addEventListener("click", function () { loadMissionEnvironment(true); });
                empty.appendChild(retry);
                missionGrid.appendChild(empty);
            });
        }

        function findCharacterById(characterId) {
            var roster = Array.isArray(window.characters)
                ? window.characters
                : (typeof characters !== "undefined" ? characters : []);
            return roster.find(function (c) { return c && c.characterId === characterId; }) || null;
        }

        function setHubView(view) {
            var nextView = ["missions", "shop", "profile"].indexOf(view) !== -1 ? view : "play";
            var isEnvironment = nextView !== "play";
            document.body.classList.remove("hub-view-missions", "hub-view-shop", "hub-view-profile");
            if (isEnvironment) {
                document.body.classList.add("hub-view-" + nextView);
            }
            if (environment) {
                environment.hidden = !isEnvironment;
            }
            panels.forEach(function (panel) {
                panel.hidden = panel.getAttribute("data-hub-panel") !== nextView;
            });
            tabButtons.forEach(function (button) {
                var active = button.getAttribute("data-hub-view") === nextView;
                button.classList.toggle("active", active);
                if (active) button.setAttribute("aria-current", "page");
                else button.removeAttribute("aria-current");
            });
            setSettingsOpen(false);
            if (nextView === "missions") { showMissionsGrid(); loadMissionEnvironment(false); }
            document.dispatchEvent(new CustomEvent("arena:hub-view", { detail: { view: nextView } }));
        }

        if (settingsButton) {
            settingsButton.addEventListener("click", function (event) {
                event.preventDefault();
                setSettingsOpen(!settings || !settings.classList.contains("open"));
            });
        }

        viewButtons.forEach(function (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                setHubView(button.getAttribute("data-hub-view"));
            });
        });

        try {
            setHubView(new URLSearchParams(window.location.search).get("view"));
        } catch (error) { setHubView("play"); }

        missionRankButtons.forEach(function (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                missionRank = button.getAttribute("data-mission-rank") || "all";
                missionRankButtons.forEach(function (candidate) {
                    var active = candidate === button;
                    candidate.classList.toggle("active", active);
                    candidate.setAttribute("aria-pressed", String(active));
                });
                renderMissions();
            });
        });

        if (missionStatusSelect) missionStatusSelect.addEventListener("change", renderMissions);

        document.addEventListener("click", function (event) {
            if (settings && settings.contains(event.target)) return;
            if (typeof setSettingsOpen === "function") setSettingsOpen(false);
        });

        document.addEventListener("keydown", function (event) {
            if (event.key !== "Escape") return;
            if (typeof setSettingsOpen === "function") setSettingsOpen(false);
        });
    })();
    (function() {
        function hideGuide() {
            var guide = document.getElementById('academy-starter-guide');
            if (guide) {
                guide.classList.add('dismissed');
                guide.setAttribute('hidden', '');
                guide.style.setProperty('display', 'none', 'important');
            }
            try { window.ArenaSession.storage.setItem('naruto_academy_guide_dismissed', 'true'); } catch (e) {}
        }
        window.dismissAcademyGuide = hideGuide;
        document.addEventListener('DOMContentLoaded', function() {
            var btn = document.querySelector('.academy-guide-dismiss-btn');
            if (btn) btn.addEventListener('click', hideGuide);
            try {
                var dismissed = window.ArenaSession.storage.getItem('naruto_academy_guide_dismissed');
                var guide = document.getElementById('academy-starter-guide');
                if (dismissed && guide) {
                    guide.classList.add('dismissed');
                    guide.setAttribute('hidden', '');
                    guide.style.setProperty('display', 'none', 'important');
                } else if (guide) {
                    guide.classList.remove('dismissed');
                    guide.removeAttribute('hidden');
                    guide.style.setProperty('display', 'flex', 'important');
                }
            } catch (e) {}
        });
    })();