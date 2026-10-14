        (function initGachaAltarController() {
            var modal = document.getElementById("gacha-modal");
            var ratesModal = document.getElementById("gacha-rates-modal");
            var shardShopModal = document.getElementById("gacha-shard-shop-modal");

            var closeBtn = document.getElementById("gacha-modal-close");
            var ratesBtn = document.getElementById("gacha-open-rates-btn");
            var ratesClose = document.getElementById("gacha-rates-close");
            var shardShopBtn = document.getElementById("gacha-open-shard-shop-btn");
            var shardShopClose = document.getElementById("gacha-shard-shop-close");

            var scrollsEl = document.getElementById("gacha-scrolls-count");
            var ryoEl = document.getElementById("gacha-ryo-count");
            var shardsEl = document.getElementById("gacha-shards-count");
            var pityEl = document.getElementById("gacha-pity-counter");
            var shardBalanceEl = document.getElementById("shard-shop-balance");

            var bannerTabsEl = document.getElementById("gacha-banner-tabs");
            var artworkEl = document.getElementById("gacha-banner-artwork");
            var nameEl = document.getElementById("gacha-banner-name");
            var subEl = document.getElementById("gacha-banner-sub");
            var descEl = document.getElementById("gacha-banner-desc");

            var pullSingleBtn = document.getElementById("gacha-pull-single-btn");
            var pullMultiBtn = document.getElementById("gacha-pull-multi-btn");
            var costSingleEl = document.getElementById("gacha-cost-single");
            var costMultiEl = document.getElementById("gacha-cost-multi");

            var resultsContainer = document.getElementById("gacha-results-container");
            var cardsGrid = document.getElementById("gacha-cards-grid");
            var claimBtn = document.getElementById("gacha-claim-results-btn");

            var activeBanners = [];
            var currentBanner = null;
            var userBalances = { summonScrolls: 0, ryo: 0, chakraShards: 0, pityCounter: 0 };
            var characterRosterMap = new Map();

            function formatNum(val) {
                return Math.max(0, Math.round(Number(val) || 0)).toLocaleString("en-US");
            }

            function fetchJsonLocal(url, options) {
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

            function buildRosterMap(catalogList) {
                var roster = Array.isArray(catalogList) && catalogList.length ? catalogList : (typeof characters !== "undefined" ? characters : (window.characters || []));
                if (Array.isArray(roster)) {
                    roster.forEach(function (c) {
                        var id = String(c.id || c.characterId || "").trim().toLowerCase();
                        if (id) characterRosterMap.set(id, c);
                        var nameKey = String(c.name || "").trim().toLowerCase();
                        if (nameKey) characterRosterMap.set(nameKey, c);
                    });
                }
            }

            function fetchCatalog() {
                return fetchJsonLocal("/api/characters/catalog").then(function(res) {
                    if (res && Array.isArray(res.characters)) {
                        buildRosterMap(res.characters);
                        if (currentBanner) {
                            renderFeaturedFacesOverlay(currentBanner.featuredCharacters);
                        }
                    }
                }).catch(function(){});
            }

            function syncUserProfile() {
                return fetchJsonLocal("/api/me").then(function(res) {
                    if (res && res.user && res.user.profile) {
                        updateBalances(res.user.profile);
                    }
                }).catch(function(){});
            }

            function updateBalances(data) {
                if (!data) return;
                var source = data.profile || (data.user && data.user.profile) || data;

                if (source.summonScrolls !== undefined) userBalances.summonScrolls = Number(source.summonScrolls) || 0;
                else if (data.summonScrolls !== undefined) userBalances.summonScrolls = Number(data.summonScrolls) || 0;

                if (source.ryo !== undefined) userBalances.ryo = Number(source.ryo) || 0;
                else if (data.ryo !== undefined) userBalances.ryo = Number(data.ryo) || 0;

                if (source.chakraShards !== undefined) userBalances.chakraShards = Number(source.chakraShards) || 0;
                else if (data.chakraShards !== undefined) userBalances.chakraShards = Number(data.chakraShards) || 0;

                var gStats = source.gachaStats || data.gachaStats;
                if (gStats && gStats.pityCounter !== undefined) {
                    userBalances.pityCounter = Number(gStats.pityCounter) || 0;
                }

                var formattedRyo = formatNum(userBalances.ryo);
                var formattedScrolls = formatNum(userBalances.summonScrolls);
                var formattedShards = formatNum(userBalances.chakraShards);

                if (scrollsEl) scrollsEl.textContent = formattedScrolls;
                if (ryoEl) ryoEl.textContent = formattedRyo;
                if (shardsEl) shardsEl.textContent = formattedShards;
                if (shardBalanceEl) shardBalanceEl.textContent = formattedShards;
                if (pityEl) pityEl.textContent = "Pity: " + userBalances.pityCounter + "/50 (Guaranteed Epic)";

                // Sync top nav bar and global shop Ryo displays
                document.querySelectorAll(".user-ryo-amount, .rs-shop-balance-amount, [data-shop-balance]").forEach(function(el) {
                    el.textContent = formattedRyo;
                });
            }

            function renderFeaturedFacesOverlay(featuredIds) {
                var infoFacesWrap = document.getElementById("gacha-banner-featured-faces");
                if (infoFacesWrap) infoFacesWrap.innerHTML = "";

                var existingOverlay = artworkEl ? artworkEl.querySelector(".gacha-featured-faces-overlay") : null;
                if (existingOverlay) existingOverlay.remove();

                var idsList = [];
                if (Array.isArray(featuredIds)) {
                    idsList = featuredIds;
                } else if (typeof featuredIds === "string") {
                    idsList = featuredIds.split(",").map(function(s) { return s.trim(); }).filter(Boolean);
                }

                if (!idsList.length || !infoFacesWrap) return;

                buildRosterMap();

                var title = document.createElement("span");
                title.className = "gacha-featured-showcase-title";
                title.textContent = "Featured:";
                infoFacesWrap.appendChild(title);

                idsList.forEach(function (id) {
                    var rawId = String(id || "").trim();
                    var charId = rawId.toLowerCase();
                    var char = characterRosterMap.get(charId);

                    var faceSrc = (char && char.facePicture) ? char.facePicture : "";
                    if (!faceSrc) {
                        if (charId.includes("kakashi")) faceSrc = "https://i.imgur.com/rt5r1bu.png";
                        else if (charId.includes("gai") || charId.includes("guy")) faceSrc = "https://i.imgur.com/3ulWurz.png";
                        else if (charId.includes("asuma")) faceSrc = "https://i.imgur.com/6U45iS4.png";
                        else if (charId.includes("itachi")) faceSrc = "itachi-render.png";
                        else if (charId.includes("konan")) faceSrc = "konan-render.png";
                        else if (charId.includes("pain")) faceSrc = "pain-render.png";
                        else if (charId.includes("deidara")) faceSrc = "deidara-render.png";
                        else faceSrc = "deadcharacter-remaster.png?v=2";
                    }
                    var charName = (char && char.name) ? char.name : rawId.replace(/-/g, ' ').replace(/\b\w/g, function(l){ return l.toUpperCase(); });

                    var chip = document.createElement("div");
                    chip.className = "gacha-featured-chip";
                    chip.title = "Featured Shinobi: " + charName;

                    var chipImg = document.createElement("img");
                    chipImg.className = "gacha-featured-chip-img";
                    chipImg.src = faceSrc;
                    chipImg.alt = charName;
                    chipImg.onerror = function() { this.src = "deadcharacter-remaster.png?v=2"; };

                    var chipName = document.createElement("span");
                    chipName.className = "gacha-featured-chip-name";
                    chipName.textContent = charName;

                    chip.appendChild(chipImg);
                    chip.appendChild(chipName);
                    infoFacesWrap.appendChild(chip);
                });
            }

            function selectBanner(banner) {
                currentBanner = banner;
                if (!banner) return;

                if (bannerTabsEl) {
                    Array.prototype.slice.call(bannerTabsEl.children).forEach(function (tabBtn) {
                        tabBtn.classList.toggle("active", tabBtn.getAttribute("data-banner-id") === banner.bannerId);
                    });
                }

                if (artworkEl) {
                    var bgImg = banner.bannerImage || "selectionbg_1.jpg";
                    artworkEl.style.backgroundImage = "url('" + bgImg + "')";
                }

                var heroRenderEl = document.getElementById("gacha-hero-render");
                if (heroRenderEl) {
                    var bId = String(banner.bannerId || "").toLowerCase();
                    if (bId.includes("akatsuki") || (banner.featuredCharacters && banner.featuredCharacters.includes("uchiha-itachi"))) {
                        heroRenderEl.src = "itachi-render.png";
                        heroRenderEl.style.display = "block";
                    } else if (bId.includes("pain") || (banner.featuredCharacters && banner.featuredCharacters.includes("pain-render"))) {
                        heroRenderEl.src = "pain-render.png";
                        heroRenderEl.style.display = "block";
                    } else if (bId.includes("deidara")) {
                        heroRenderEl.src = "deidara-render.png";
                        heroRenderEl.style.display = "block";
                    } else {
                        // For standard banner, show clean character render
                        heroRenderEl.src = "itachi-render.png";
                        heroRenderEl.style.display = "block";
                    }
                }

                if (nameEl) nameEl.textContent = banner.title || "Shinobi Summon Altar";
                if (subEl) subEl.textContent = banner.subtitle || "Rate Up Summon";
                if (descEl) descEl.textContent = banner.description || "Summon brave shinobi across all five hidden villages!";

                if (costSingleEl) {
                    costSingleEl.textContent = (banner.singleCostScrolls || 1) + " Scroll or " + formatNum(banner.singleCostRyo || 100) + " Ryo";
                }
                if (costMultiEl) {
                    costMultiEl.textContent = (banner.multiCostScrolls || 9) + " Scrolls or " + formatNum(banner.multiCostRyo || 900) + " Ryo";
                }

                renderFeaturedFacesOverlay(banner.featuredCharacters);
            }

            function renderBannerTabs(banners) {
                if (!bannerTabsEl) return;
                bannerTabsEl.innerHTML = "";
                if (!banners || !banners.length) return;

                banners.forEach(function (b, index) {
                    var btn = document.createElement("button");
                    btn.type = "button";
                    btn.className = "gacha-tab-btn" + (index === 0 ? " active" : "");
                    btn.setAttribute("data-banner-id", b.bannerId);
                    btn.textContent = b.title || "Banner " + (index + 1);
                    btn.addEventListener("click", function () {
                        selectBanner(b);
                    });
                    bannerTabsEl.appendChild(btn);
                });

                selectBanner(banners[0]);
            }

            function fetchGachaConfig() {
                fetchCatalog();
                return fetchJsonLocal("/api/gacha/banners").then(function (data) {
                    if (data && data.ok) {
                        activeBanners = Array.isArray(data.banners) ? data.banners : [];
                        updateBalances(data);
                        renderBannerTabs(activeBanners);
                    }
                }).catch(function(e) {
                    console.error("Gacha banner fetch error:", e);
                });
            }

            function executePull(count) {
                if (!currentBanner) return;
                if (pullSingleBtn) pullSingleBtn.disabled = true;
                if (pullMultiBtn) pullMultiBtn.disabled = true;

                var payload = {
                    bannerId: currentBanner.bannerId,
                    count: count,
                    paymentType: userBalances.summonScrolls >= (count === 10 ? currentBanner.multiCostScrolls : currentBanner.singleCostScrolls) ? "scrolls" : "ryo"
                };

                fetchJsonLocal("/api/gacha/pull", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                }).then(function(res) {
                    if (res && res.ok) {
                        updateBalances(res);
                        renderPullResults(res.results || []);
                    } else {
                        alert((res && res.error) || "Summon failed.");
                    }
                }).catch(function(err) {
                    alert(err.message || "Summon failed.");
                }).finally(function() {
                    if (pullSingleBtn) pullSingleBtn.disabled = false;
                    if (pullMultiBtn) pullMultiBtn.disabled = false;
                });
            }

            function renderPullResults(results) {
                if (!cardsGrid || !resultsContainer) return;
                cardsGrid.innerHTML = "";
                buildRosterMap();

                results.forEach(function(item, i) {
                    var card = document.createElement("div");
                    var rarity = (item.rarity || "common").toLowerCase();
                    card.className = "gacha-pull-card gacha-result-card rarity-" + rarity;
                    card.style.animationDelay = (i * 0.05) + "s";
                    
                    var char = characterRosterMap.get(String(item.characterId || "").toLowerCase());
                    var faceSrc = item.facePicture || (char && char.facePicture) || "deadcharacter-remaster.png?v=2";
                    var name = item.name || (char && char.name) || item.characterId;

                    var dupBadge = item.isDuplicate 
                        ? '<div class="gacha-pull-badge">+' + (item.shardsGranted || 10) + ' SHARDS</div>'
                        : '<div class="gacha-pull-new-badge">NEW!</div>';

                    card.innerHTML =
                        dupBadge +
                        '<div class="gacha-pull-rank-tag rarity-' + rarity + '">' + rarity.toUpperCase() + '</div>' +
                        '<div class="gacha-pull-avatar-frame gacha-result-portrait rarity-' + rarity + '">' +
                            '<img class="gacha-pull-avatar" src="' + (faceSrc || "") + '" alt="' + (name || "") + '" onerror="this.onerror=null;this.src=\'deadcharacter-remaster.png?v=2\';">' +
                        '</div>' +
                        '<div class="gacha-pull-name gacha-result-name" title="' + (name || "") + '">' + (name || "") + '</div>' +
                        (item.isDuplicate 
                            ? '<div class="gacha-pull-status gacha-dup">+ ' + (item.shardsGranted || 10) + ' Chakra Shards</div>' 
                            : '<div class="gacha-pull-status gacha-new">NEW UNLOCK</div>');

                    cardsGrid.appendChild(card);
                });

                var bCard = document.getElementById("gacha-banner-card");
                if (bCard) bCard.classList.add("hidden");
                resultsContainer.classList.remove("hidden");
            }


            function openGachaModal() {
                if (modal) modal.classList.remove("hidden");
                fetchGachaConfig();
            }

            function closeGachaModal() {
                if (modal) modal.classList.add("hidden");
            }

            document.addEventListener("click", function(e) {
                var trigger = e.target.closest("[data-gacha-trigger]");
                if (trigger) {
                    e.preventDefault();
                    openGachaModal();
                }
            });

            if (closeBtn) closeBtn.addEventListener("click", closeGachaModal);
            if (ratesBtn) ratesBtn.addEventListener("click", function() { if (ratesModal) ratesModal.classList.remove("hidden"); });
            if (ratesClose) ratesClose.addEventListener("click", function() { if (ratesModal) ratesModal.classList.add("hidden"); });
            if (shardShopBtn) shardShopBtn.addEventListener("click", function() { if (shardShopModal) shardShopModal.classList.remove("hidden"); });
            if (shardShopClose) shardShopClose.addEventListener("click", function() { if (shardShopModal) shardShopModal.classList.add("hidden"); });

            if (pullSingleBtn) pullSingleBtn.addEventListener("click", function() { executePull(1); });
            if (pullMultiBtn) pullMultiBtn.addEventListener("click", function() { executePull(10); });

            if (claimBtn) {
                claimBtn.addEventListener("click", function() {
                    if (resultsContainer) resultsContainer.classList.add("hidden");
                    var bCard = document.getElementById("gacha-banner-card");
                    if (bCard) bCard.classList.remove("hidden");
                });
            }

            document.querySelectorAll(".shard-craft-btn").forEach(function(btn) {
                btn.addEventListener("click", function() {
                    var craftType = btn.getAttribute("data-craft-type");
                    var msgEl = document.getElementById("shard-shop-message");
                    if (msgEl) msgEl.textContent = "Crafting...";

                    fetchJsonLocal("/api/gacha/craft-shards", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ craftType: craftType })
                    }).then(function(res) {
                        if (res && res.ok) {
                            updateBalances(res);
                            if (msgEl) msgEl.textContent = res.message || "Craft successful!";
                        } else {
                            if (msgEl) msgEl.textContent = (res && res.error) || "Craft failed.";
                        }
                    }).catch(function(err) {
                        if (msgEl) msgEl.textContent = err.message || "Craft failed.";
                    });
                });
            });

            // Automatically fetch gacha config and sync user profile balances on page load
            syncUserProfile();
            fetchGachaConfig();
        })();

        // ── QUESTS, ACHIEVEMENTS, LOGIN REWARDS & PROMO CODES CONTROLLER ──
        (function initQuestsAndRewardsController() {
            var questsModal = document.getElementById("quests-modal");
            var achievementsModal = document.getElementById("achievements-modal");
            var loginRewardsModal = document.getElementById("login-rewards-modal");
            var promoCodeModal = document.getElementById("promo-code-modal");
            var settingsModal = document.getElementById("settings-modal");

            // Open Triggers
            document.querySelectorAll("[data-settings-trigger]").forEach(function(btn) {
                btn.addEventListener("click", function(e) {
                    e.preventDefault();
                    if (settingsModal) settingsModal.classList.remove("hidden");
                });
            });

            document.querySelectorAll("[data-quests-trigger]").forEach(function(btn) {
                btn.addEventListener("click", function() {
                    if (settingsModal) settingsModal.classList.add("hidden");
                    if (questsModal) questsModal.classList.remove("hidden");
                    loadQuests();
                });
            });

            document.querySelectorAll("[data-achievements-trigger]").forEach(function(btn) {
                btn.addEventListener("click", function() {
                    if (settingsModal) settingsModal.classList.add("hidden");
                    if (achievementsModal) achievementsModal.classList.remove("hidden");
                    loadAchievements();
                });
            });

            document.querySelectorAll("[data-login-rewards-trigger]").forEach(function(btn) {
                btn.addEventListener("click", function() {
                    if (settingsModal) settingsModal.classList.add("hidden");
                    if (loginRewardsModal) loginRewardsModal.classList.remove("hidden");
                    loadLoginRewards();
                });
            });

            document.querySelectorAll("[data-promo-code-trigger]").forEach(function(btn) {
                btn.addEventListener("click", function() {
                    if (settingsModal) settingsModal.classList.add("hidden");
                    if (promoCodeModal) promoCodeModal.classList.remove("hidden");
                });
            });

            // Back to Settings Buttons
            document.querySelectorAll("[data-back-to-settings]").forEach(function(btn) {
                btn.addEventListener("click", function() {
                    if (questsModal) questsModal.classList.add("hidden");
                    if (achievementsModal) achievementsModal.classList.add("hidden");
                    if (loginRewardsModal) loginRewardsModal.classList.add("hidden");
                    if (promoCodeModal) promoCodeModal.classList.add("hidden");
                    if (settingsModal) settingsModal.classList.remove("hidden");
                });
            });

            // Close Triggers
            var sClose = document.getElementById("settings-modal-close");
            if (sClose) sClose.addEventListener("click", function() { if (settingsModal) settingsModal.classList.add("hidden"); });

            var qClose = document.getElementById("quests-modal-close");
            if (qClose) qClose.addEventListener("click", function() { if (questsModal) questsModal.classList.add("hidden"); });

            var aClose = document.getElementById("achievements-modal-close");
            if (aClose) aClose.addEventListener("click", function() { if (achievementsModal) achievementsModal.classList.add("hidden"); });

            var lClose = document.getElementById("login-rewards-modal-close");
            if (lClose) lClose.addEventListener("click", function() { if (loginRewardsModal) loginRewardsModal.classList.add("hidden"); });

            var pClose = document.getElementById("promo-code-modal-close");
            if (pClose) pClose.addEventListener("click", function() { if (promoCodeModal) promoCodeModal.classList.add("hidden"); });

            // Volume Slider Sync
            var volSlider = document.getElementById("settings-master-volume") || document.querySelector(".settings-slider.sound-volume");
            var volBadge = document.getElementById("settings-volume-val");
            if (volSlider) {
                try {
                    var rawSound = window.ArenaSession.storage.getItem("narutoSoundSettings");
                    if (rawSound) {
                        var parsedSound = JSON.parse(rawSound);
                        if (parsedSound && typeof parsedSound.volume === 'number') {
                            var pct = Math.round(parsedSound.volume * 100);
                            volSlider.value = pct;
                            if (volBadge) volBadge.textContent = pct + "%";
                        }
                    }
                } catch(e) {}

                volSlider.addEventListener("input", function(e) {
                    var val = parseInt(e.target.value, 10) || 0;
                    if (volBadge) volBadge.textContent = val + "%";
                    try {
                        window.ArenaSession.storage.setItem("narutoSoundSettings", JSON.stringify({ volume: val / 100 }));
                    } catch(err) {}
                });
            }

            // Training Dummy & Bug Report Diverted Actions
            var dummyBtn = document.getElementById("modal-training-dummy-btn");
            if (dummyBtn) {
                dummyBtn.addEventListener("click", function() {
                    if (settingsModal) settingsModal.classList.add("hidden");
                    var raw = window.ArenaSession.storage.getItem("narutoSelectedTeam");
                    var team = null;
                    try {
                        team = JSON.parse(raw);
                    } catch (e) {}
                    window.ArenaSession.fetch("/api/admin/training-dummy/start", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ team: Array.isArray(team) && team.length === 3 ? team : undefined })
                    }).then(function(r) { return r.json(); }).then(function(data) {
                        if (data && data.matchId) {
                            window.location.href = "ingame.html?matchId=" + encodeURIComponent(data.matchId);
                        } else {
                            alert((data && data.error) || "Could not start training dummy match. Admin access required.");
                        }
                    }).catch(function() {
                        alert("Could not start training dummy match.");
                    });
                });
            }

            var bugBtn = document.getElementById("modal-bug-report-btn");
            if (bugBtn) {
                bugBtn.addEventListener("click", function() {
                    var desc = prompt("Describe the bug or issue you encountered:");
                    if (desc && desc.trim()) {
                        window.ArenaSession.fetch("/api/bugs", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ title: desc.trim(), category: "general", description: desc.trim() })
                        }).then(function(r) { return r.json(); }).then(function(d) {
                            alert(d.ok ? "Thank you! Your bug report has been submitted." : (d.error || "Failed to submit report."));
                        }).catch(function() { alert("Failed to submit bug report."); });
                    }
                });
            }

            // Backdrop Click & Escape Key Dismissal
            document.querySelectorAll(".shinobi-modal-overlay, .settings-modal-overlay").forEach(function(overlay) {
                overlay.addEventListener("click", function(e) {
                    if (e.target === overlay) {
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

            // 📜 Quests Functions
            var activeQuestType = "daily";
            var cachedQuests = [];

            document.querySelectorAll(".quest-tab-btn").forEach(function(btn) {
                btn.addEventListener("click", function() {
                    document.querySelectorAll(".quest-tab-btn").forEach(function(b) { b.classList.remove("active"); });
                    btn.classList.add("active");
                    activeQuestType = btn.getAttribute("data-quest-type") || "daily";
                    renderQuestsList();
                });
            });

            function loadQuests() {
                window.ArenaSession.fetch("/api/quests").then(function(r) { return r.json(); }).then(function(d) {
                    if (d.ok) {
                        cachedQuests = d.quests || [];
                        renderQuestsList();
                    }
                }).catch(console.error);
            }

            function renderQuestsList() {
                var container = document.getElementById("quests-list-container");
                if (!container) return;
                var filtered = cachedQuests.filter(function(q) { return q.type === activeQuestType; });
                if (!filtered.length) {
                    container.innerHTML = '<div style="text-align:center; padding:32px 20px; background:#0f172a; border:1px dashed rgba(245,158,11,0.25); border-radius:8px;"><p style="margin:0; color:#94a3b8; font-size:13px; font-weight:700;">No active Shinobi Contracts in this category.</p></div>';
                    return;
                }
                var html = '';
                filtered.forEach(function(q, idx) {
                    var pct = Math.min(100, Math.round((q.currentProgress / q.target) * 100));
                    var rankClass = (q.type === 'event' ? 's-rank' : q.type === 'weekly' ? 'b-rank' : (idx % 2 === 0 ? 'd-rank' : 'c-rank'));
                    var rankLabel = (q.type === 'event' ? 'S-RANK' : q.type === 'weekly' ? 'B-RANK' : (idx % 2 === 0 ? 'D-RANK' : 'C-RANK'));
                    var rankInline = (rankClass === 's-rank' ? 'background:rgba(239,68,68,0.15); border:1px solid #ef4444; color:#f87171;' : rankClass === 'b-rank' ? 'background:rgba(245,158,11,0.15); border:1px solid #f59e0b; color:#fbbf24;' : rankClass === 'c-rank' ? 'background:rgba(16,185,129,0.15); border:1px solid #10b981; color:#34d399;' : 'background:rgba(59,130,246,0.15); border:1px solid #3b82f6; color:#60a5fa;');

                    var btnHtml = '';
                    if (q.isClaimed) {
                        btnHtml = '<button class="quest-claim-btn claimed" disabled style="-webkit-appearance:none; appearance:none; outline:none; background: #020617; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; color: #64748b; padding: 8px 14px; font-size: 11px; font-weight: 800; cursor: default; white-space: nowrap;">Claimed ✓</button>';
                    } else if (q.canClaim) {
                        btnHtml = '<button class="shinobi-claim-btn" onclick="claimQuest(\'' + q.questId + '\')" style="-webkit-appearance:none; appearance:none; outline:none; background: #10b981; border: 1px solid #34d399; border-radius: 6px; color: #ffffff; padding: 8px 16px; font-size: 11px; font-weight: 900; cursor: pointer; white-space: nowrap; text-transform: uppercase;">Claim Reward!</button>';
                    } else {
                        btnHtml = '<button class="quest-claim-btn" disabled style="-webkit-appearance:none; appearance:none; outline:none; background: #1e293b; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; color: #94a3b8; padding: 8px 14px; font-size: 11px; font-weight: 800; cursor: default; white-space: nowrap;">' + q.currentProgress + ' / ' + q.target + '</button>';
                    }

                    var rewardsHtml = [];
                    if (q.rewards.ryo) rewardsHtml.push('<span class="reward-pill ryo" style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); color: #fbbf24; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 800;">' + q.rewards.ryo + ' Ryo</span>');
                    if (q.rewards.summonScrolls) rewardsHtml.push('<span class="reward-pill scrolls" style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 800;">' + q.rewards.summonScrolls + ' Scrolls</span>');
                    if (q.rewards.chakraShards) rewardsHtml.push('<span class="reward-pill shards" style="background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 800;">' + q.rewards.chakraShards + ' Shards</span>');

                    html += '<div class="shinobi-quest-contract" style="position: relative; background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px 18px; display: flex; align-items: center; gap: 16px; margin-bottom: 10px; transition: border-color 0.15s ease;">' +
                        '<div class="quest-info" style="flex-grow: 1;">' +
                            '<div class="contract-title-row" style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">' +
                                '<span class="mission-rank-tag ' + rankClass + '" style="font-size: 9px; font-weight: 900; letter-spacing: 0.06em; text-transform: uppercase; padding: 2px 6px; border-radius: 3px; font-family: \'Outfit\', sans-serif; display: inline-block; ' + rankInline + '">' + rankLabel + '</span>' +
                                '<h3 class="contract-title" style="margin: 0; font-size: 14px; font-weight: 800; color: #f8fafc; letter-spacing: 0.02em; text-transform: uppercase; font-family: \'Outfit\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif !important;">' + q.title + '</h3>' +
                            '</div>' +
                            '<p class="contract-desc" style="margin: 0 0 8px; font-size: 12px; color: #94a3b8; line-height: 1.4;">' + q.description + '</p>' +
                            '<div class="contract-rewards" style="display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">' + rewardsHtml.join(' ') + '</div>' +
                            '<div class="chakra-track" style="height: 6px; background: #020617; border-radius: 3px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.06); position: relative;"><div class="chakra-fill" style="width: ' + pct + '%; height: 100%; background: #d97706; border-radius: 3px; transition: width 0.3s ease;"></div></div>' +
                        '</div>' +
                        '<div class="quest-action" style="flex-shrink: 0;">' + btnHtml + '</div>' +
                    '</div>';
                });
                container.innerHTML = html;
            }

            window.claimQuest = function(questId) {
                window.ArenaSession.fetch("/api/quests/claim", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ questId: questId })
                }).then(function(r) { return r.json(); }).then(function(d) {
                    if (d.ok) {
                        loadQuests();
                        if (typeof updateBalances === 'function') updateBalances(d);
                    } else {
                        alert(d.error || "Failed to claim quest.");
                    }
                }).catch(console.error);
            };

            // 🏆 Achievements Functions
            function loadAchievements() {
                window.ArenaSession.fetch("/api/achievements").then(function(r) { return r.json(); }).then(function(d) {
                    if (d.ok) {
                        renderAchievementsList(d.achievements || []);
                    }
                }).catch(console.error);
            }

            function renderAchievementsList(achievements) {
                var container = document.getElementById("achievements-list-container");
                if (!container) return;
                var html = '';
                achievements.forEach(function(ach) {
                    html += '<div class="shinobi-quest-contract" style="background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px 18px; margin-bottom: 12px; display: flex; flex-direction: column; align-items: stretch;">' +
                        '<div class="achievement-header" style="margin-bottom: 10px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 8px;">' +
                            '<h3 class="contract-title" style="margin: 0; font-size: 15px; font-weight: 800; color: #fbbf24; text-transform: uppercase; font-family: \'Outfit\', -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, sans-serif !important;">' + ach.title + '</h3>' +
                            '<p class="contract-desc" style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">' + ach.description + '</p>' +
                        '</div>' +
                        '<div class="achievement-tiers-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">';
                    (ach.tiers || []).forEach(function(t) {
                        var pct = Math.min(100, Math.round((t.currentProgress / t.target) * 100));
                        var tierRankName = (t.tier === 1 ? 'GENIN · TIER 1' : t.tier === 2 ? 'CHUNIN · TIER 2' : 'JONIN · TIER 3');
                        var btnHtml = '';
                        if (t.isClaimed) {
                            btnHtml = '<button class="quest-claim-btn claimed" disabled style="-webkit-appearance:none; appearance:none; outline:none; background: #020617; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; color: #64748b; padding: 6px 10px; font-size: 11px; font-weight: 800;">Claimed ✓</button>';
                        } else if (t.canClaim) {
                            btnHtml = '<button class="shinobi-claim-btn" onclick="claimAchievement(\'' + ach.id + '\', ' + t.tier + ')" style="-webkit-appearance:none; appearance:none; outline:none; background: #10b981; border: 1px solid #34d399; border-radius: 6px; color: #ffffff; padding: 6px 10px; font-size: 11px; font-weight: 900; cursor: pointer; text-transform: uppercase;">Claim Reward!</button>';
                        } else {
                            btnHtml = '<button class="quest-claim-btn" disabled style="-webkit-appearance:none; appearance:none; outline:none; background: #1e293b; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; color: #94a3b8; padding: 6px 10px; font-size: 11px; font-weight: 800;">' + t.currentProgress + ' / ' + t.target + '</button>';
                        }

                        var rewardsText = [];
                        if (t.rewards.ryo) rewardsText.push(t.rewards.ryo + ' Ryo');
                        if (t.rewards.summonScrolls) rewardsText.push(t.rewards.summonScrolls + ' Scrolls');
                        if (t.rewards.chakraShards) rewardsText.push(t.rewards.chakraShards + ' Shards');

                        html += '<div class="achievement-tier-box" style="background: #020617; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 10px; display: flex; flex-direction: column; gap: 6px; text-align: center;">' +
                            '<div class="tier-badge" style="font-size: 10px; font-weight: 900; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.05em; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 4px; padding: 2px 4px;">' + tierRankName + '</div>' +
                            '<div class="tier-target" style="font-size: 11px; color: #cbd5e1; font-weight: 700;">Target: ' + t.target + '</div>' +
                            '<div class="chakra-track" style="height: 6px; background: #0f172a; border-radius: 3px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.06);"><div class="chakra-fill" style="width: ' + pct + '%; height: 100%; background: #d97706; border-radius: 3px; transition: width 0.3s ease;"></div></div>' +
                            '<div class="tier-rewards" style="font-size: 11px; font-weight: 800; color: #f59e0b;">' + rewardsText.join(' · ') + '</div>' +
                            btnHtml +
                        '</div>';
                    });
                    html += '</div></div>';
                });
                container.innerHTML = html;
            }

            window.claimAchievement = function(achievementId, tier) {
                window.ArenaSession.fetch("/api/achievements/claim", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ achievementId: achievementId, tier: tier })
                }).then(function(r) { return r.json(); }).then(function(d) {
                    if (d.ok) {
                        loadAchievements();
                        if (typeof updateBalances === 'function') updateBalances(d);
                    } else {
                        alert(d.error || "Failed to claim achievement.");
                    }
                }).catch(console.error);
            };

            // 📅 Login Rewards Functions
            function loadLoginRewards() {
                window.ArenaSession.fetch("/api/login-rewards").then(function(r) { return r.json(); }).then(function(d) {
                    if (d.ok) {
                        renderLoginCalendar(d);
                    }
                }).catch(console.error);
            }

            function renderLoginCalendar(data) {
                var grid = document.getElementById("login-calendar-grid");
                var claimBtn = document.getElementById("claim-daily-login-btn");
                var msgEl = document.getElementById("login-reward-msg");
                if (!grid) return;

                var calendar = data.calendar || [];
                var currentDay = data.currentDayIndex || 1;
                var canClaim = data.canClaimToday;

                if (msgEl) msgEl.textContent = canClaim ? "Today's reward is ready to claim!" : "Already claimed today! Return tomorrow for Day " + ((currentDay % 7) + 1) + ".";
                if (claimBtn) {
                    claimBtn.disabled = !canClaim;
                    claimBtn.textContent = canClaim ? "Claim Day " + currentDay + " Reward" : "Claimed Today ✓";
                    if (canClaim) {
                        claimBtn.style.opacity = "1";
                        claimBtn.style.cursor = "pointer";
                    } else {
                        claimBtn.style.opacity = "0.5";
                        claimBtn.style.cursor = "not-allowed";
                    }
                }

                var html = '';
                calendar.forEach(function(day) {
                    var isToday = day.day === currentDay;
                    var isClaimed = day.day < currentDay || (isToday && !canClaim);
                    var rewardsText = [];
                    if (day.rewards.ryo) rewardsText.push(day.rewards.ryo + ' Ryo');
                    if (day.rewards.summonScrolls) rewardsText.push(day.rewards.summonScrolls + ' Scrolls');
                    if (day.rewards.chakraShards) rewardsText.push(day.rewards.chakraShards + ' Shards');

                    var borderStyle = isToday ? 'border: 1px solid #f59e0b; background: rgba(245, 158, 11, 0.12);' : 'border: 1px solid rgba(255, 255, 255, 0.08); background: #020617;';
                    if (day.day === 7) borderStyle = 'border: 1px solid #fbbf24; background: rgba(245, 158, 11, 0.18);';

                    html += '<div class="login-day-card" style="border-radius: 6px; padding: 10px 4px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 4px; ' + borderStyle + ' opacity: ' + (isClaimed ? '0.5' : '1') + ';">' +
                        '<div style="font-size: 10px; font-weight: 900; color: #fbbf24; text-transform: uppercase;">Day ' + day.day + '</div>' +
                        '<div style="font-size: 10px; font-weight: 700; color: #e2e8f0; line-height: 1.3;">' + rewardsText.join('<br>') + '</div>' +
                        '<div style="font-size: 10px; font-weight: 800; color: ' + (isClaimed ? '#475569' : isToday ? '#34d399' : '#94a3b8') + '; margin-top: 2px;">' + (isClaimed ? 'Claimed ✓' : isToday ? 'READY' : 'Locked') + '</div>' +
                    '</div>';
                });
                grid.innerHTML = html;
            }

            var claimLoginBtn = document.getElementById("claim-daily-login-btn");
            if (claimLoginBtn) {
                claimLoginBtn.addEventListener("click", function() {
                    var msgEl = document.getElementById("login-reward-msg");
                    if (msgEl) msgEl.textContent = "Claiming...";
                    window.ArenaSession.fetch("/api/login-rewards/claim", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" }
                    }).then(function(r) { return r.json(); }).then(function(d) {
                        if (d.ok) {
                            if (msgEl) msgEl.textContent = d.message || "Login reward claimed!";
                            loadLoginRewards();
                            if (typeof updateBalances === 'function') updateBalances(d);
                        } else {
                            if (msgEl) msgEl.textContent = d.error || "Claim failed.";
                        }
                    }).catch(function(err) {
                        if (msgEl) msgEl.textContent = err.message || "Claim failed.";
                    });
                });
            }

            // 🎁 Promo Code Redemption Functions
            var submitPromoBtn = document.getElementById("submit-promo-code-btn");
            if (submitPromoBtn) {
                submitPromoBtn.addEventListener("click", function() {
                    var input = document.getElementById("promo-code-input");
                    var msgEl = document.getElementById("promo-code-msg");
                    var codeStr = input ? input.value.trim() : '';
                    if (!codeStr) {
                        if (msgEl) msgEl.textContent = "Please enter a valid code.";
                        return;
                    }
                    if (msgEl) msgEl.textContent = "Validating code...";

                    window.ArenaSession.fetch("/api/promo-codes/redeem", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ code: codeStr })
                    }).then(function(r) { return r.json(); }).then(function(d) {
                        if (d.ok) {
                            if (msgEl) msgEl.style.color = "#4ade80";
                            if (msgEl) msgEl.textContent = d.message || "Code redeemed!";
                            if (input) input.value = "";
                            if (typeof updateBalances === 'function') updateBalances(d);
                        } else {
                            if (msgEl) msgEl.style.color = "#f87171";
                            if (msgEl) msgEl.textContent = d.error || "Redemption failed.";
                        }
                    }).catch(function(err) {
                        if (msgEl) msgEl.style.color = "#f87171";
                        if (msgEl) msgEl.textContent = err.message || "Redemption failed.";
                    });
                });
            }
        })();
