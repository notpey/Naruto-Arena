    (function () {
        var settings = document.querySelector(".selection-hub-settings");
        var settingsButton = document.querySelector(".selection-hub-settings-button");
        var settingsMenu = document.querySelector(".selection-hub-settings-menu");
        var environment = document.querySelector("[data-hub-environment]");
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-hub-panel]"));
        var tabButtons = Array.prototype.slice.call(document.querySelectorAll(".selection-hub-tabs [data-hub-view]"));
        var viewButtons = Array.prototype.slice.call(document.querySelectorAll("[data-hub-view]"));
        var shopGrid = document.querySelector("[data-shop-env-grid]");
        var shopGrid = document.querySelector("[data-shop-env-grid]");
        var shopStatus = document.querySelector("[data-shop-env-status]");
        var shopTabButtons = Array.prototype.slice.call(document.querySelectorAll("[data-shop-tab]"));
        var activeShopTab = "characters";
        var activeInventoryTab = "avatars";
        var cachedShopData = null;
        var cachedInventoryData = null;
        var loadedInventory = false;

        var missionGrid = document.querySelector("[data-mission-grid]");
        var missionDetailEl = document.querySelector("[data-mission-detail]");
        var missionWorkspace = document.querySelector("[data-mission-workspace]");
        var missionSummary = document.querySelector("[data-mission-summary]");
        var missionSearch = document.querySelector("[data-mission-search]");
        var missionStatusSelect = document.querySelector("[data-mission-status]");
        var missionRankButtons = Array.prototype.slice.call(document.querySelectorAll("[data-mission-rank]"));
        var inventoryGrid = document.querySelector(".selection-hub-inventory-grid");
        var inventoryTabButtons = Array.prototype.slice.call(document.querySelectorAll("[data-inventory-tab]"));
        var pveModeButtons = Array.prototype.slice.call(document.querySelectorAll("[data-pve-mode]"));
        var storyListEl = document.querySelector("[data-story-list]");
        var storyBriefingEl = document.querySelector("[data-story-briefing]");
        var gauntletPanelEl = document.querySelector("[data-gauntlet-panel]");
        var storyBattleStarting = false;
        var gauntletBusy = false;
        var loadedShop = false;
        var loadedMissions = false;
        var loadedStory = false;
        var loadedGauntlet = false;
        var missions = [];
        var missionProgressByMissionId = {};
        var missionRank = "all";
        var selectedMissionId = "";
        var storyNodes = [];
        var storyProgressByNodeId = {};
        var gauntletState = {
            run: null,
            actOneEvent: null,
            reachableNodeIds: [],
            catalog: null,
            activeEventNodeId: "",
            status: "",
            statusType: ""
        };

        var rankMeta = {
            dc: "D & C Rank Missions",
            b: "B Rank Missions",
            a: "A Rank Missions",
            s: "S Rank Missions"
        };

        var rarityColors = {
            common: "#38bdf8",
            uncommon: "#34d399",
            rare: "#c084fc",
            epic: "#fbbf24",
            legendary: "#ef4444"
        };

        function updatePlayerCardDisplay(profile) {
            if (!profile) return;
            var avatarEl = document.getElementById("player-avatar-img") || document.querySelector(".player-avatar");
            if (avatarEl && profile.avatarUrl) {
                avatarEl.src = profile.avatarUrl;
            }

            var borderOverlay = document.getElementById("player-avatar-border-overlay");
            var frameEl = document.getElementById("player-avatar-frame");
            if (borderOverlay) {
                if (profile.equippedBorder && (profile.equippedBorder.indexOf("/") !== -1 || profile.equippedBorder.indexOf(".") !== -1)) {
                    borderOverlay.src = profile.equippedBorder;
                    borderOverlay.style.display = "block";
                } else {
                    borderOverlay.style.display = "none";
                }
            }

            if (frameEl) {
                var classesToRemove = [];
                for (var i = 0; i < frameEl.classList.length; i++) {
                    var cls = frameEl.classList[i];
                    if (cls.startsWith("border-")) classesToRemove.push(cls);
                }
                classesToRemove.forEach(function(c) { frameEl.classList.remove(c); });
                frameEl.style.borderColor = "";
                frameEl.style.boxShadow = "";

                if (profile.equippedBorder && profile.equippedBorder.startsWith("border-")) {
                    frameEl.classList.add(profile.equippedBorder);
                }
            }

            var titleBadge = document.getElementById("player-equipped-title-badge");
            if (titleBadge) {
                if (profile.equippedTitle) {
                    titleBadge.style.display = "inline-block";
                    titleBadge.textContent = profile.equippedTitle;
                } else {
                    titleBadge.style.display = "none";
                }
            }
        }

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

        function formatRyo(value) {
            var amount = Math.max(0, Math.round(Number(value) || 0));
            return amount.toLocaleString("en-US");
        }

        function escapeHtml(value) {
            return String(value == null ? "" : value)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }

        function updateBalanceDisplays(ryo) {
            document.querySelectorAll("[data-shop-balance]").forEach(function (el) {
                el.textContent = formatRyo(ryo);
            });
        }

        function renderShopMessage(message) {
            if (!shopGrid) return;
            shopGrid.innerHTML = "";
            var empty = document.createElement("div");
            empty.className = "selection-hub-env-empty";
            empty.textContent = message;
            shopGrid.appendChild(empty);
        }

        function renderShopEnvironment() {
            if (!shopGrid || !cachedShopData) return;
            shopGrid.innerHTML = "";

            shopTabButtons.forEach(function (btn) {
                btn.classList.toggle("active", btn.getAttribute("data-shop-tab") === activeShopTab);
            });

            var ryo = Number(cachedShopData.ryo) || 0;
            var ownedAvatars = (cachedShopData.inventory && Array.isArray(cachedShopData.inventory.avatars)) ? cachedShopData.inventory.avatars : [];
            var ownedTitles = (cachedShopData.inventory && Array.isArray(cachedShopData.inventory.titles)) ? cachedShopData.inventory.titles : [];
            var ownedBorders = (cachedShopData.inventory && Array.isArray(cachedShopData.inventory.borders)) ? cachedShopData.inventory.borders : [];

            if (activeShopTab === "characters") {
                var characters = Array.isArray(cachedShopData.characters) ? cachedShopData.characters : [];
                if (!characters.length) {
                    renderShopMessage("Every shop character is already unlocked, or none are for sale yet.");
                    return;
                }
                characters.forEach(function (character) {
                    var card = document.createElement("article");
                    card.className = "selection-hub-shop-card";

                    var face = document.createElement("div");
                    face.className = "selection-hub-shop-face";
                    if (character.facePicture) {
                        var img = document.createElement("img");
                        img.src = character.facePicture;
                        img.alt = character.name || character.characterId || "Character";
                        face.appendChild(img);
                    }

                    var name = document.createElement("div");
                    name.className = "selection-hub-shop-name";
                    name.textContent = character.name || character.characterId || "Character";

                    var price = document.createElement("div");
                    price.className = "selection-hub-shop-price";
                    price.textContent = formatRyo(character.shopPrice) + " Ryo";

                    var buy = document.createElement("button");
                    buy.type = "button";
                    buy.className = "selection-hub-shop-buy";
                    buy.setAttribute("data-shop-env-buy", character.characterId || "");
                    buy.disabled = ryo < Number(character.shopPrice || 0);
                    buy.textContent = buy.disabled ? "Not Enough Ryo" : "Unlock";

                    card.appendChild(face);
                    card.appendChild(name);
                    card.appendChild(price);
                    card.appendChild(buy);
                    shopGrid.appendChild(card);
                });
                return;
            }

            var cosmetics = cachedShopData.cosmetics || { avatars: [], titles: [], borders: [] };
            var items = [];
            var ownedList = [];

            if (activeShopTab === "avatars") {
                items = cosmetics.avatars || [];
                ownedList = ownedAvatars;
            } else if (activeShopTab === "titles") {
                items = cosmetics.titles || [];
                ownedList = ownedTitles;
            } else if (activeShopTab === "borders") {
                items = cosmetics.borders || [];
                ownedList = ownedBorders;
            }

            if (!items.length) {
                renderShopMessage("No items currently available in this category.");
                return;
            }

            items.forEach(function (item) {
                var isOwned = ownedList.indexOf(item.id) !== -1 || (activeShopTab === "avatars" && item.imageUrl && cachedShopData.avatarUrl === item.imageUrl);
                var isEquipped = (activeShopTab === "avatars" && cachedShopData.avatarUrl === item.imageUrl) ||
                                 (activeShopTab === "titles" && cachedShopData.equippedTitle === item.name) ||
                                 (activeShopTab === "borders" && (cachedShopData.equippedBorder === item.borderStyle || cachedShopData.equippedBorder === item.borderColor));

                var card = document.createElement("article");
                card.className = "selection-hub-cosmetic-card" + (isEquipped ? " equipped" : "");

                // Preview wrapper
                var previewWrapper = document.createElement("div");
                previewWrapper.className = "cosmetic-preview-wrapper";

                if (item.category === "avatars") {
                    var aImg = document.createElement("img");
                    aImg.className = "cosmetic-avatar-img";
                    aImg.src = item.imageUrl || "found-remaster.png";
                    aImg.alt = item.name;
                    previewWrapper.appendChild(aImg);
                } else if (item.category === "titles") {
                    var tPreview = document.createElement("span");
                    tPreview.className = "cosmetic-title-preview";
                    tPreview.style.fontWeight = "800";
                    tPreview.style.fontSize = "13px";
                    tPreview.style.color = "#ffae42";
                    tPreview.style.textTransform = "uppercase";
                    tPreview.textContent = item.name;
                    previewWrapper.appendChild(tPreview);
                } else if (item.category === "borders") {
                    var bFrame = document.createElement("div");
                    bFrame.className = "cosmetic-border-frame-preview";
                    bFrame.style.position = "relative";
                    bFrame.style.width = "56px";
                    bFrame.style.height = "56px";
                    bFrame.style.borderRadius = "6px";
                    bFrame.style.overflow = "hidden";
                    bFrame.style.background = "#000";

                    var bImg = document.createElement("img");
                    bImg.src = "sharingan-remaster.png?v=2";
                    bImg.style.width = "100%";
                    bImg.style.height = "100%";
                    bImg.style.objectFit = "cover";

                    var bOverlay = document.createElement("img");
                    bOverlay.src = item.imageUrl || "borders/anbu_frame.svg";
                    bOverlay.style.position = "absolute";
                    bOverlay.style.inset = "0";
                    bOverlay.style.width = "100%";
                    bOverlay.style.height = "100%";
                    bOverlay.style.objectFit = "contain";

                    bFrame.appendChild(bImg);
                    bFrame.appendChild(bOverlay);
                    previewWrapper.appendChild(bFrame);
                }

                // Rarity Tag
                var rCol = rarityColors[item.rarity] || "#38bdf8";
                var rTag = document.createElement("span");
                rTag.className = "gacha-pull-rank-tag rarity-" + (item.rarity || "common");
                rTag.textContent = item.rarity || "common";

                // Name & Desc
                var nameEl = document.createElement("div");
                nameEl.className = "cosmetic-card-name";
                nameEl.textContent = item.name;

                var descEl = document.createElement("div");
                descEl.className = "cosmetic-card-desc";
                descEl.textContent = item.description || "";

                // Price
                var priceEl = document.createElement("div");
                priceEl.className = "cosmetic-card-price";
                priceEl.innerHTML = '🪙 ' + formatRyo(item.price) + ' Ryo';

                // Action Button
                var btn = document.createElement("button");
                btn.type = "button";
                if (isEquipped) {
                    btn.className = "cosmetic-card-btn equipped-btn";
                    btn.textContent = "Equipped";
                    btn.disabled = true;
                } else if (isOwned) {
                    btn.className = "cosmetic-card-btn equip-btn";
                    btn.textContent = "Equip";
                    btn.setAttribute("data-cosmetic-equip-type", item.category === "avatars" ? "avatar" : (item.category === "titles" ? "title" : "border"));
                    btn.setAttribute("data-cosmetic-equip-id", item.id);
                } else {
                    btn.className = "cosmetic-card-btn buy-btn";
                    btn.setAttribute("data-cosmetic-buy-id", item.id);
                    btn.setAttribute("data-cosmetic-buy-cat", item.category);
                    btn.disabled = ryo < Number(item.price || 0);
                    btn.textContent = btn.disabled ? "Not Enough Ryo" : "Purchase";
                }

                card.appendChild(previewWrapper);
                card.appendChild(rTag);
                card.appendChild(nameEl);
                card.appendChild(descEl);
                card.appendChild(priceEl);
                card.appendChild(btn);
                shopGrid.appendChild(card);
            });
        }

        function loadShopEnvironment(force) {
            if (!shopGrid || (loadedShop && !force)) return;
            loadedShop = true;
            if (shopStatus) shopStatus.textContent = "Loading shop...";
            renderShopMessage("Loading shop...");
            fetchJson("/api/shop").then(function (data) {
                cachedShopData = data;
                updateBalanceDisplays(data.ryo);
                if (shopStatus) shopStatus.textContent = "Balance: " + formatRyo(data.ryo) + " Ryo";
                updatePlayerCardDisplay(data);
                renderShopEnvironment();
            }).catch(function (error) {
                loadedShop = false;
                if (shopStatus) shopStatus.textContent = "Shop unavailable";
                renderShopMessage(error.message || "You must be logged in to visit the shop.");
            });
        }

        function handleShopPurchase(characterId, button) {
            if (!characterId || !button) return;
            button.disabled = true;
            button.textContent = "Unlocking...";
            fetchJson("/api/shop/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ characterId: characterId })
            }).then(function (data) {
                updateBalanceDisplays(data.ryo);
                loadedShop = false;
                loadShopEnvironment(true);
            }).catch(function (error) {
                button.disabled = false;
                button.textContent = error.message || "Try Again";
            });
        }

        function handleCosmeticPurchase(itemId, category, button) {
            if (!itemId || !button) return;
            button.disabled = true;
            button.textContent = "Purchasing...";
            fetchJson("/api/shop/purchase-cosmetic", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId: itemId, category: category })
            }).then(function (data) {
                alert(data.message || "Purchased successfully!");
                updateBalanceDisplays(data.ryo);
                loadedShop = false;
                loadedInventory = false;
                loadShopEnvironment(true);
            }).catch(function (error) {
                alert(error.message || "Purchase failed.");
                button.disabled = false;
                button.textContent = "Purchase";
            });
        }

        function handleEquipItem(type, itemId, button) {
            if (!type || !button) return;
            button.disabled = true;
            button.textContent = "Equipping...";
            fetchJson("/api/profile/equip", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: type, itemId: itemId })
            }).then(function (data) {
                alert(data.message || "Equipped successfully!");
                if (cachedShopData) {
                    if (type === "avatar") cachedShopData.avatarUrl = data.avatarUrl;
                    if (type === "title") cachedShopData.equippedTitle = data.equippedTitle;
                    if (type === "border") cachedShopData.equippedBorder = data.equippedBorder;
                }
                if (cachedInventoryData) {
                    if (type === "avatar") cachedInventoryData.avatarUrl = data.avatarUrl;
                    if (type === "title") cachedInventoryData.equippedTitle = data.equippedTitle;
                    if (type === "border") cachedInventoryData.equippedBorder = data.equippedBorder;
                }
                updatePlayerCardDisplay(data);
                if (environment && !environment.hidden) {
                    renderShopEnvironment();
                    renderInventoryTab(activeInventoryTab);
                }
            }).catch(function (error) {
                alert(error.message || "Equip failed.");
            }).finally(function () {
                button.disabled = false;
            });
        }

        function loadInventoryEnvironment(force, preferredTab) {
            if (!inventoryGrid || (loadedInventory && !force)) {
                if (preferredTab) renderInventoryTab(preferredTab);
                return;
            }
            loadedInventory = true;
            inventoryGrid.innerHTML = '<div class="selection-hub-env-empty">Loading inventory...</div>';
            fetchJson("/api/profile/inventory").then(function (data) {
                cachedInventoryData = data;
                updatePlayerCardDisplay(data);
                renderInventoryTab(preferredTab || activeInventoryTab);
            }).catch(function (err) {
                loadedInventory = false;
                inventoryGrid.innerHTML = '<div class="selection-hub-env-empty">' + escapeHtml(err.message || "Failed to load inventory.") + '</div>';
            });
        }

        function renderInventoryTab(tab) {
            if (!inventoryGrid) return;
            activeInventoryTab = tab || "avatars";

            inventoryTabButtons.forEach(function (button) {
                button.classList.toggle("active", button.getAttribute("data-inventory-tab") === activeInventoryTab);
            });

            inventoryGrid.innerHTML = "";

            if (!cachedInventoryData) {
                loadInventoryEnvironment(false, activeInventoryTab);
                return;
            }

            var items = [];
            var currentEquipped = "";

            if (activeInventoryTab === "avatars") {
                items = cachedInventoryData.avatars || [];
                currentEquipped = cachedInventoryData.avatarUrl || "";
            } else if (activeInventoryTab === "titles") {
                items = (cachedInventoryData.titles || []).concat(cachedInventoryData.customTitles || []);
                currentEquipped = cachedInventoryData.equippedTitle || "";
            } else if (activeInventoryTab === "borders") {
                items = cachedInventoryData.borders || [];
                currentEquipped = cachedInventoryData.equippedBorder || "";
            } else if (activeInventoryTab === "consumables") {
                var cRyo = cachedInventoryData.ryo || 0;
                var cScrolls = cachedInventoryData.summonScrolls || 0;
                var cShards = cachedInventoryData.chakraShards || 0;

                var consumCard = document.createElement("article");
                consumCard.className = "selection-hub-cosmetic-card";
                consumCard.style.gridColumn = "1 / -1";
                consumCard.style.maxWidth = "400px";
                consumCard.style.margin = "0 auto";
                consumCard.innerHTML =
                    '<h3 style="color:#ffae42; margin:0 0 12px 0; text-transform:uppercase; font-size:16px;">Shinobi Resources</h3>' +
                    '<div style="display:flex; justify-content:space-around; width:100%; font-size:14px; font-weight:800;">' +
                        '<div>🪙 ' + formatRyo(cRyo) + ' Ryo</div>' +
                        '<div>📜 ' + cScrolls + ' Scrolls</div>' +
                        '<div>💎 ' + cShards + ' Shards</div>' +
                    '</div>';
                inventoryGrid.appendChild(consumCard);
                return;
            } else if (activeInventoryTab === "backgrounds") {
                var bgCard = document.createElement("article");
                bgCard.className = "selection-hub-cosmetic-card";
                bgCard.style.gridColumn = "1 / -1";
                bgCard.style.maxWidth = "500px";
                bgCard.style.margin = "0 auto";
                bgCard.innerHTML =
                    '<h3 style="color:#ffae42; margin:0 0 12px 0; text-transform:uppercase; font-size:16px;">Arena Backgrounds</h3>' +
                    '<p style="font-size:12px; color:#cbd5e1; margin-bottom:14px;">Customize your background artwork URLs for selection and battle screens.</p>' +
                    '<div style="width:100%; display:flex; flex-direction:column; gap:10px; margin-bottom:14px; text-align:left;">' +
                        '<label style="font-size:11px; font-weight:700; color:#cbd5e1;">Selection Screen Background URL:' +
                            '<input type="text" id="inv-bg-selection" class="shinobi-input" value="' + escapeHtml(cachedInventoryData.customSelectionBackground || "") + '" placeholder="https://..." style="width:100%; padding:6px 10px; font-size:12px; box-sizing:border-box; margin-top:4px; background:#0e121a; color:#fff; border:1px solid #334155; border-radius:4px;">' +
                        '</label>' +
                        '<label style="font-size:11px; font-weight:700; color:#cbd5e1;">Battle Screen Background URL:' +
                            '<input type="text" id="inv-bg-ingame" class="shinobi-input" value="' + escapeHtml(cachedInventoryData.customIngameBackground || "") + '" placeholder="https://..." style="width:100%; padding:6px 10px; font-size:12px; box-sizing:border-box; margin-top:4px; background:#0e121a; color:#fff; border:1px solid #334155; border-radius:4px;">' +
                        '</label>' +
                    '</div>' +
                    '<button type="button" class="cosmetic-card-btn buy-btn" id="inv-save-bg-btn" style="max-width:200px;">Save Backgrounds</button>';
                inventoryGrid.appendChild(bgCard);

                var saveBtn = bgCard.querySelector("#inv-save-bg-btn");
                if (saveBtn) {
                    saveBtn.addEventListener("click", function() {
                        var selBg = document.getElementById("inv-bg-selection") ? document.getElementById("inv-bg-selection").value.trim() : "";
                        var inBg = document.getElementById("inv-bg-ingame") ? document.getElementById("inv-bg-ingame").value.trim() : "";
                        saveBtn.disabled = true;
                        saveBtn.textContent = "Saving...";
                        fetchJson("/api/profile/backgrounds", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ selectionBackground: selBg, ingameBackground: inBg })
                        }).then(function(res) {
                            alert(res.message || "Backgrounds saved!");
                        }).catch(function(err) {
                            alert(err.message || "Failed to save backgrounds.");
                        }).finally(function() {
                            saveBtn.disabled = false;
                            saveBtn.textContent = "Save Backgrounds";
                        });
                    });
                }
                return;
            }

            if (!items.length) {
                var empty = document.createElement("div");
                empty.className = "selection-hub-env-empty selection-hub-inventory-empty";
                empty.textContent = "No items in this category yet. Unlock more in the Shop!";
                inventoryGrid.appendChild(empty);
                return;
            }

            items.forEach(function (item) {
                var isEquipped = false;
                if (activeInventoryTab === "avatars") isEquipped = (currentEquipped === item.imageUrl || (!currentEquipped && item.id === "avatar_starter"));
                if (activeInventoryTab === "titles") isEquipped = (currentEquipped === item.name);
                if (activeInventoryTab === "borders") isEquipped = (currentEquipped === item.borderStyle || currentEquipped === item.borderColor);

                var card = document.createElement("article");
                card.className = "selection-hub-cosmetic-card" + (isEquipped ? " equipped" : "");

                // Preview wrapper
                var previewWrapper = document.createElement("div");
                previewWrapper.className = "cosmetic-preview-wrapper";

                if (activeInventoryTab === "avatars") {
                    var aImg = document.createElement("img");
                    aImg.className = "cosmetic-avatar-img";
                    aImg.src = item.imageUrl || "found-remaster.png";
                    aImg.alt = item.name;
                    previewWrapper.appendChild(aImg);
                } else if (activeInventoryTab === "titles") {
                    var tPreview = document.createElement("span");
                    tPreview.className = "cosmetic-title-preview";
                    tPreview.style.fontWeight = "800";
                    tPreview.style.fontSize = "13px";
                    tPreview.style.color = "#ffae42";
                    tPreview.style.textTransform = "uppercase";
                    tPreview.textContent = item.name;
                    previewWrapper.appendChild(tPreview);
                } else if (activeInventoryTab === "borders") {
                    var bFrame = document.createElement("div");
                    bFrame.className = "cosmetic-border-frame-preview";
                    bFrame.style.position = "relative";
                    bFrame.style.width = "56px";
                    bFrame.style.height = "56px";
                    bFrame.style.borderRadius = "6px";
                    bFrame.style.overflow = "hidden";
                    bFrame.style.background = "#000";

                    var bImg = document.createElement("img");
                    bImg.src = "sharingan-remaster.png?v=2";
                    bImg.style.width = "100%";
                    bImg.style.height = "100%";
                    bImg.style.objectFit = "cover";

                    var bOverlay = document.createElement("img");
                    bOverlay.src = item.imageUrl || "borders/anbu_frame.svg";
                    bOverlay.style.position = "absolute";
                    bOverlay.style.inset = "0";
                    bOverlay.style.width = "100%";
                    bOverlay.style.height = "100%";
                    bOverlay.style.objectFit = "contain";

                    bFrame.appendChild(bImg);
                    bFrame.appendChild(bOverlay);
                    previewWrapper.appendChild(bFrame);
                }

                // Rarity Tag
                var rTag = document.createElement("span");
                rTag.className = "gacha-pull-rank-tag rarity-" + (item.rarity || "common");
                rTag.textContent = item.rarity || "common";

                // Name & Desc
                var nameEl = document.createElement("div");
                nameEl.className = "cosmetic-card-name";
                nameEl.textContent = item.name;

                var descEl = document.createElement("div");
                descEl.className = "cosmetic-card-desc";
                descEl.textContent = item.description || "";

                // Action Button
                var btn = document.createElement("button");
                btn.type = "button";
                if (isEquipped) {
                    btn.className = "cosmetic-card-btn equipped-btn";
                    btn.textContent = "Equipped";
                    btn.disabled = true;
                } else {
                    btn.className = "cosmetic-card-btn equip-btn";
                    btn.textContent = "Equip";
                    btn.setAttribute("data-cosmetic-equip-type", activeInventoryTab === "avatars" ? "avatar" : (activeInventoryTab === "titles" ? "title" : "border"));
                    btn.setAttribute("data-cosmetic-equip-id", item.id || item.name);
                }

                card.appendChild(previewWrapper);
                card.appendChild(rTag);
                card.appendChild(nameEl);
                card.appendChild(descEl);
                card.appendChild(btn);
                inventoryGrid.appendChild(card);
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
                mode_restriction: { allowed_modes: allowedModes.filter(function (m) { return m === "quick" || m === "ladder"; }) },
                reward_character: String(src.reward_character || src.rewardCharacter || "").trim(),
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
            var rewardName = String(mission.reward_character_name || mission.reward_character || "").trim();
            if (rewardName) {
                var rewardRow = missionNode("div", "mission-reward-row");
                if (mission.portrait && !/deadcharacter/i.test(mission.portrait)) {
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

        function normalizeStoryNode(node, chapterTitle, chapterSortOrder) {
            var src = node && typeof node === "object" ? node : {};
            return {
                nodeId: String(src.nodeId || "").trim(),
                chapterTitle: String(chapterTitle || "").trim(),
                chapterSortOrder: Number(chapterSortOrder) || 1,
                title: String(src.title || "Battle").trim(),
                arcTitle: String(src.arcTitle || "").trim(),
                episodeRange: String(src.episodeRange || "").trim(),
                summary: String(src.summary || "").trim(),
                level_requirement: Number(src.level_requirement) || 0,
                image: String(src.image || "").trim(),
                imageAlt: String(src.imageAlt || src.title || "Battle artwork").trim(),
                enemyDisplayName: String(src.enemyDisplayName || "Rogue Ninja").trim(),
                playerTeam: Array.isArray(src.playerTeam) ? src.playerTeam : [],
                rewardText: String(src.rewardText || "").trim(),
                requiresPreviousNode: src.requiresPreviousNode !== false
            };
        }

        function isStoryNodeCompleted(nodeId) {
            var progress = storyProgressByNodeId[nodeId];
            return Boolean(progress && progress.completedAt);
        }

        function isStoryNodeHardCompleted(nodeId) {
            var progress = storyProgressByNodeId[nodeId];
            return Boolean(progress && progress.hardCompletedAt);
        }

        function getPreviousStoryNode(node) {
            var index = storyNodes.findIndex(function (entry) { return entry.nodeId === node.nodeId; });
            return index > 0 ? storyNodes[index - 1] : null;
        }

        function isStoryNodeLocked(node) {
            if (!node || node.requiresPreviousNode === false) return false;
            var previous = getPreviousStoryNode(node);
            return Boolean(previous && !isStoryNodeCompleted(previous.nodeId));
        }

        function findCharacterById(characterId) {
            var roster = Array.isArray(window.characters)
                ? window.characters
                : (typeof characters !== "undefined" ? characters : []);
            return roster.find(function (c) { return c && c.characterId === characterId; }) || null;
        }

        function findCharacterByIndex(index) {
            var roster = Array.isArray(window.characters)
                ? window.characters
                : (typeof characters !== "undefined" ? characters : []);
            return roster[Number(index)] || null;
        }

        function getCharacterNameByIndex(index) {
            var character = findCharacterByIndex(index);
            return (character && (character.name || character.characterName || character.characterId)) || ("Character " + index);
        }

        function getCharacterFaceByIndex(index) {
            var character = findCharacterByIndex(index);
            return (character && (character.facePicture || character.face || character.image || character.avatar)) || "deadcharacter-remaster.png?v=2";
        }

        function setPveMode(mode) {
            var nextMode = mode === "gauntlet" ? "gauntlet" : "story";
            pveModeButtons.forEach(function (button) {
                button.classList.toggle("active", button.getAttribute("data-pve-mode") === nextMode);
            });
            if (storyListEl) storyListEl.hidden = nextMode !== "story";
            if (storyBriefingEl) {
                storyBriefingEl.hidden = true;
                if (nextMode !== "story") storyBriefingEl.innerHTML = "";
            }
            if (gauntletPanelEl) gauntletPanelEl.hidden = nextMode !== "gauntlet";
            if (nextMode === "story") {
                showStoryList();
                loadStoryEnvironment(false);
            } else {
                loadGauntletEnvironment(false);
            }
        }

        function showStoryList() {
            if (storyListEl) storyListEl.hidden = false;
            if (storyBriefingEl) { storyBriefingEl.hidden = true; storyBriefingEl.innerHTML = ""; }
            if (gauntletPanelEl) gauntletPanelEl.hidden = true;
            pveModeButtons.forEach(function (button) {
                button.classList.toggle("active", button.getAttribute("data-pve-mode") === "story");
            });
        }

        function getSelectedStoryTeamIndices() {
            return Array.prototype.slice.call(document.querySelectorAll(".selected-character-slot"))
                .map(function (slot) { return Number(slot.dataset.characterIndex); })
                .filter(function (index) { return Number.isInteger(index); });
        }

        function startStoryBattleFromHub(node, statusEl, beginBtn, difficulty) {
            if (storyBattleStarting) return;
            var isHard = difficulty === "hard";
            var hardTeam = isHard ? getSelectedStoryTeamIndices() : [];
            if (isHard && hardTeam.length !== 3) {
                statusEl.textContent = "Select and save a full team of 3 before starting Hard Mode.";
                statusEl.classList.add("error");
                return;
            }
            storyBattleStarting = true;
            beginBtn.disabled = true;
            beginBtn.textContent = "Starting Battle...";
            statusEl.textContent = isHard ? "Assembling your selected team..." : "Assembling your team...";
            statusEl.classList.remove("error");
            fetchJson("/api/story/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nodeId: node.nodeId,
                    difficulty: isHard ? "hard" : "normal",
                    team: isHard ? hardTeam : undefined
                })
            }).then(function (data) {
                window.location.href = "ingame.html?matchId=" + encodeURIComponent(data.matchId);
            }).catch(function (error) {
                storyBattleStarting = false;
                beginBtn.disabled = false;
                beginBtn.textContent = isHard ? "Hard Mode" : "Begin Battle";
                statusEl.textContent = (error && error.message) || "Could not start this battle.";
                statusEl.classList.add("error");
            });
        }
        function showStoryBriefing(node) {
            if (!storyBriefingEl) return;
            if (storyListEl) storyListEl.hidden = true;
            storyBriefingEl.hidden = false;
            storyBriefingEl.innerHTML = "";

            var back = document.createElement("button");
            back.type = "button";
            back.className = "selection-hub-story-back";
            back.textContent = "‹ Back to Story";
            back.addEventListener("click", showStoryList);

            var title = document.createElement("div");
            title.className = "selection-hub-story-briefing-title";
            title.textContent = node.title;

            var opponentLine = document.createElement("p");
            opponentLine.className = "selection-hub-story-briefing-line";
            opponentLine.innerHTML = "<strong>Opponent:</strong> " + node.enemyDisplayName;

            var summaryLine = document.createElement("p");
            summaryLine.className = "selection-hub-story-briefing-line";
            summaryLine.textContent = node.summary || "";

            var rewardLine = document.createElement("p");
            rewardLine.className = "selection-hub-story-briefing-line";
            rewardLine.innerHTML = "<strong>Reward:</strong> " + (node.rewardText || "Story progression.");

            var hardLine = document.createElement("p");
            hardLine.className = "selection-hub-story-briefing-line";
            hardLine.innerHTML = "<strong>Hard Mode:</strong> Use your selected team against empowered enemies for 250 Ryo on first clear.";

            var noteLine = document.createElement("p");
            noteLine.className = "selection-hub-story-briefing-line";
            noteLine.textContent = "This battle uses a preset team so the story plays out consistently.";

            var teamLabel = document.createElement("div");
            teamLabel.className = "selection-hub-story-team-label";
            teamLabel.textContent = "Your Team";

            var teamRow = document.createElement("div");
            teamRow.className = "selection-hub-story-team-row";
            (node.playerTeam.length ? node.playerTeam : []).forEach(function (characterId) {
                var character = findCharacterById(characterId);
                var member = document.createElement("div");
                member.className = "selection-hub-story-team-member";
                var img = document.createElement("img");
                img.className = "selection-hub-story-team-portrait";
                img.src = (character && character.facePicture) || "deadcharacter-remaster.png?v=2";
                img.alt = (character && character.name) || characterId;
                var name = document.createElement("div");
                name.className = "selection-hub-story-team-name";
                name.textContent = (character && character.name) || characterId;
                member.appendChild(img);
                member.appendChild(name);
                teamRow.appendChild(member);
            });

            var actions = document.createElement("div");
            actions.className = "selection-hub-story-actions";
            var beginBtn = document.createElement("button");
            beginBtn.type = "button";
            beginBtn.className = "selection-hub-story-begin";
            var locked = isStoryNodeLocked(node);
            beginBtn.textContent = locked ? "Locked" : "Begin Battle";
            beginBtn.disabled = locked;
            var status = document.createElement("span");
            status.className = "selection-hub-story-status";
            beginBtn.addEventListener("click", function () {
                startStoryBattleFromHub(node, status, beginBtn, "normal");
            });
            actions.appendChild(beginBtn);
            var hardBtn = document.createElement("button");
            hardBtn.type = "button";
            hardBtn.className = "selection-hub-story-begin hard";
            var normalCompleted = isStoryNodeCompleted(node.nodeId);
            var hardCompleted = isStoryNodeHardCompleted(node.nodeId);
            hardBtn.textContent = hardCompleted ? "Hard Cleared" : "Hard Mode";
            hardBtn.disabled = locked || !normalCompleted;
            hardBtn.addEventListener("click", function () {
                startStoryBattleFromHub(node, status, hardBtn, "hard");
            });
            actions.appendChild(hardBtn);
            actions.appendChild(status);

            storyBriefingEl.appendChild(back);
            storyBriefingEl.appendChild(title);
            storyBriefingEl.appendChild(opponentLine);
            if (summaryLine.textContent) storyBriefingEl.appendChild(summaryLine);
            storyBriefingEl.appendChild(rewardLine);
            storyBriefingEl.appendChild(hardLine);
            storyBriefingEl.appendChild(noteLine);
            storyBriefingEl.appendChild(teamLabel);
            storyBriefingEl.appendChild(teamRow);
            storyBriefingEl.appendChild(actions);
        }

        function buildStoryRow(node) {
            var completed = isStoryNodeCompleted(node.nodeId);
            var hardCompleted = isStoryNodeHardCompleted(node.nodeId);
            var locked = isStoryNodeLocked(node);
            var row = document.createElement("div");
            row.className = "selection-hub-story-row";
            if (locked) row.classList.add("locked");
            row.setAttribute("data-story-node", node.nodeId);

            var thumb = document.createElement("div");
            thumb.className = "selection-hub-story-thumb";
            var img = document.createElement("img");
            img.loading = "lazy";
            img.src = node.image || "deadcharacter-remaster.png?v=2";
            img.alt = node.imageAlt;
            thumb.appendChild(img);

            var body = document.createElement("div");
            var title = document.createElement("div");
            title.className = "selection-hub-story-title";
            title.textContent = node.title;
            var meta = document.createElement("p");
            meta.className = "selection-hub-story-meta";
            meta.textContent = [
                node.arcTitle,
                node.episodeRange,
                "Vs. " + node.enemyDisplayName,
                "Level " + (node.level_requirement || 1) + "+"
            ].filter(Boolean).join(" - ");
            body.appendChild(title);
            body.appendChild(meta);
            if (node.summary) {
                var summary = document.createElement("p");
                summary.className = "selection-hub-story-meta";
                summary.textContent = node.summary;
                body.appendChild(summary);
            }
            if (node.rewardText) {
                var reward = document.createElement("p");
                reward.className = "selection-hub-story-meta";
                reward.textContent = node.rewardText;
                body.appendChild(reward);
            }

            var pill = document.createElement("span");
            pill.className = "selection-hub-status-pill " + (hardCompleted ? "hard" : completed ? "completed" : locked ? "locked" : "available");
            pill.textContent = hardCompleted ? "Hard Clear" : completed ? "Completed" : locked ? "Locked" : "Available";

            row.appendChild(thumb);
            row.appendChild(body);
            row.appendChild(pill);
            return row;
        }
        function renderStoryPanel() {
            if (!storyListEl) return;
            storyListEl.innerHTML = "";
            if (!storyNodes.length) {
                var empty = document.createElement("div");
                empty.className = "selection-hub-env-empty";
                empty.textContent = "No story battles are available yet.";
                storyListEl.appendChild(empty);
                return;
            }
            var chaptersByTitle = new Map();
            storyNodes.forEach(function (node) {
                if (!chaptersByTitle.has(node.chapterTitle)) chaptersByTitle.set(node.chapterTitle, []);
                chaptersByTitle.get(node.chapterTitle).push(node);
            });
            Array.from(chaptersByTitle.keys())
                .sort(function (a, b) {
                    var nodesA = chaptersByTitle.get(a);
                    var nodesB = chaptersByTitle.get(b);
                    return (nodesA[0].chapterSortOrder || 1) - (nodesB[0].chapterSortOrder || 1);
                })
                .forEach(function (chapterTitle) {
                    var nodes = chaptersByTitle.get(chapterTitle);
                    var completedCount = nodes.filter(function (n) { return isStoryNodeCompleted(n.nodeId); }).length;

                    var block = document.createElement("div");
                    block.className = "selection-hub-story-chapter";
                    var head = document.createElement("div");
                    head.className = "selection-hub-story-chapter-head";
                    var title = document.createElement("div");
                    title.className = "selection-hub-story-chapter-title";
                    title.textContent = chapterTitle;
                    var progress = document.createElement("span");
                    progress.className = "selection-hub-story-chapter-progress";
                    progress.textContent = completedCount + " / " + nodes.length;
                    head.appendChild(title);
                    head.appendChild(progress);
                    block.appendChild(head);

                    nodes.forEach(function (node) { block.appendChild(buildStoryRow(node)); });
                    storyListEl.appendChild(block);
                });
        }

        function loadStoryEnvironment(force) {
            if (!storyListEl || (loadedStory && !force)) return;
            loadedStory = true;
            showStoryList();
            storyListEl.innerHTML = '<div class="selection-hub-env-empty">Loading story battles...</div>';
            fetchJson("/api/story").then(function (data) {
                var chapters = Array.isArray(data.chapters) ? data.chapters : [];
                storyNodes = [];
                chapters.forEach(function (chapter) {
                    (Array.isArray(chapter.nodes) ? chapter.nodes : []).forEach(function (node) {
                        storyNodes.push(normalizeStoryNode(node, chapter.title, chapter.sortOrder));
                    });
                });
                storyNodes.sort(function (a, b) {
                    return (a.chapterSortOrder || 1) - (b.chapterSortOrder || 1);
                });
                storyProgressByNodeId = (data.storyProgressByNodeId && typeof data.storyProgressByNodeId === "object")
                    ? data.storyProgressByNodeId : {};
                renderStoryPanel();
            }).catch(function () {
                loadedStory = false;
                storyNodes = [];
                storyListEl.innerHTML = '<div class="selection-hub-env-empty">Unable to load story mode.</div>';
            });
        }

        function gauntletNodeTypeLabel(type) {
            var labels = {
                battle: "Battle",
                elite_battle: "Elite",
                event: "Event",
                rest_camp: "Rest",
                merchant: "Merchant",
                scroll_cache: "Scroll"
            };
            return labels[type] || String(type || "Node").replace(/_/g, " ");
        }

        function gauntletNodeName(node) {
            if (!node) return "Unknown";
            if (node.type === "battle" || node.type === "elite_battle") {
                var enemyTeamId = node.enemyTeamId || (node.content && node.content.enemyTeamId) || "";
                var enemyTeam = findGauntletCatalogEntry("enemyTeams", enemyTeamId);
                return (enemyTeam && enemyTeam.name) || gauntletDisplayId(enemyTeamId || "Rival Team");
            }
            if (node.type === "event") return "Forest Event";
            if (node.type === "rest_camp") return "Camp";
            if (node.type === "merchant") return "Trader";
            if (node.type === "scroll_cache") return "Scroll Cache";
            return "Exam Node";
        }

        function gauntletHasBothScrolls(run) {
            return (Number(run && run.heavenScrolls) || 0) > 0 && (Number(run && run.earthScrolls) || 0) > 0;
        }

        function findGauntletNode(run, nodeId) {
            var rows = Array.isArray(run && run.map && run.map.rows) ? run.map.rows : [];
            for (var i = 0; i < rows.length; i += 1) {
                var nodes = getGauntletRowNodes(rows[i]);
                for (var j = 0; j < nodes.length; j += 1) {
                    if (nodes[j] && nodes[j].id === nodeId) return nodes[j];
                }
            }
            if (nodeId === "act3-preliminary") return { id: "act3-preliminary", type: "elite_battle", enemyTeamId: "Preliminaries" };
            if (nodeId === "act3-finals") return { id: "act3-finals", type: "elite_battle", enemyTeamId: "Finals" };
            return null;
        }

        function getGauntletRowNodes(row) {
            if (Array.isArray(row)) return row;
            if (row && Array.isArray(row.nodes)) return row.nodes;
            return [];
        }

        function getGauntletRowNumber(row, fallback) {
            if (Array.isArray(row)) {
                var first = row.find(function (node) { return node && Number(node.row); });
                return first ? Number(first.row) : fallback;
            }
            return Number(row && row.row) || fallback;
        }

        function findGauntletEvent(eventId) {
            var catalog = gauntletState.catalog || {};
            var events = []
                .concat(Array.isArray(catalog.actOneEvents) ? catalog.actOneEvents : [])
                .concat(Array.isArray(catalog.actTwoEvents) ? catalog.actTwoEvents : []);
            return events.find(function (event) { return event && event.eventId === eventId; }) || null;
        }

        function findGauntletCatalogEntry(collectionName, entryId) {
            var catalog = gauntletState.catalog || {};
            var entries = Array.isArray(catalog[collectionName]) ? catalog[collectionName] : [];
            return entries.find(function (entry) { return entry && entry.id === entryId; }) || null;
        }

        function findGauntletModifier(modifierId) {
            return findGauntletCatalogEntry("relicScrolls", modifierId) ||
                findGauntletCatalogEntry("curses", modifierId) ||
                null;
        }

        function gauntletDisplayId(id) {
            return String(id || "Unknown").replace(/-/g, " ").replace(/\b\w/g, function (letter) {
                return letter.toUpperCase();
            });
        }

        function gauntletNodeHelp(node, run) {
            if (!node) return "Unknown exam space.";
            if (node.type === "battle") return "Fight a normal enemy team. Rewards Ryo and has a small chance to drop an exam scroll.";
            if (node.type === "elite_battle" && Number(node.row) === 7 && !gauntletHasBothScrolls(run)) return "Exit battle locked: you need at least 1 Heaven and 1 Earth Scroll to enter.";
            if (node.type === "elite_battle") return "Harder battle with better Ryo and a high chance to drop an exam scroll.";
            if (node.type === "event") return "Choose one outcome. Events can grant Ryo, healing, relics, fragments, scrolls, or risky curse offers.";
            if (node.type === "rest_camp") return "Recover before the next stretch. Rest camps are guaranteed somewhere on each generated path.";
            if (node.type === "merchant") return "Spend Ryo on healing, relics, or missing Heaven/Earth scrolls.";
            if (node.type === "scroll_cache") return "Guaranteed exam scroll. Taking it can lock sibling choices from the same branch.";
            return "Advance through the exam route.";
        }

        function renderGauntletGuide(run) {
            var act = Number(run && run.currentAct) || 0;
            var title = !run ? "How This Run Works" : act === 1 ? "Act 1 - Written Test" : act === 2 ? "Act 2 - Forest of Death" : "Act 3 - Preliminaries and Finals";
            var copy = !run
                ? "Choose three characters, pick your first exam scroll, then build enough resources to survive a branching PvE run."
                : act === 1
                    ? "This is not a fight. Pick one exam-room approach to gain your first advantage before the Forest of Death opens."
                    : act === 2
                        ? "Your goal is to reach the exit battles on Row 7 with at least one Heaven Scroll and one Earth Scroll."
                        : "The scroll gate is passed. Win the preliminary battle, then the finals, to complete the exam.";
            return '<div class="selection-hub-gauntlet-card selection-hub-gauntlet-guide">' +
                '<p class="selection-hub-gauntlet-title">' + title + '</p>' +
                '<p class="selection-hub-gauntlet-copy">' + copy + '</p>' +
                '<div class="selection-hub-gauntlet-steps">' +
                    '<span class="' + (act === 1 ? "active" : run ? "done" : "") + '">1 Written Test: pick a starting reward</span>' +
                    '<span class="' + (act === 2 ? "active" : act > 2 ? "done" : "") + '">2 Forest: route through battles, events, shops, and rest</span>' +
                    '<span class="' + (act === 3 ? "active" : "") + '">3 Finals: clear two elite fights</span>' +
                '</div></div>';
        }

        function renderGauntletHero(run) {
            var act = Number(run && run.currentAct) || 0;
            var eyebrow = run ? "Active Run" : "PvE Roguelike";
            var title = run
                ? (act === 1 ? "Written Test" : act === 2 ? "Forest of Death" : "Final Exam")
                : "Chunin Exams";
            var copy = run
                ? (act === 1
                    ? "Make three setup decisions. Each choice changes your resources before the route begins."
                    : act === 2
                        ? "Pick a route, preserve your team, and bring one Heaven plus one Earth Scroll to the Row 7 gate."
                        : "The gate is open. Clear the preliminary match and the final battle to finish the run.")
                : "A compact PvE run using your selected team: decisions, route choices, battles, shops, and run-long relics.";
            var action = run
                ? ""
                : '<button type="button" class="selection-hub-story-begin" data-gauntlet-start>Start Run</button>';
            var scrollPicker = run ? "" : '<select class="selection-hub-gauntlet-select" data-gauntlet-start-scroll><option value="heaven">Heaven Scroll Start</option><option value="earth">Earth Scroll Start</option></select>';
            return '<section class="selection-hub-gauntlet-hero"><div><p class="selection-hub-gauntlet-eyebrow">' + eyebrow + '</p><h2>' + title + '</h2><p>' + copy + '</p></div><div class="selection-hub-gauntlet-hero-actions">' + scrollPicker + action + '</div></section>';
        }

        function renderGauntletTeam(run) {
            var team = Array.isArray(run && run.team) ? run.team : getSelectedStoryTeamIndices();
            var hp = Array.isArray(run && run.teamHp) ? run.teamHp : [];
            if (!team.length) return '<p class="selection-hub-gauntlet-copy">Select three characters on the Start Playing screen first.</p>';
            return '<section class="selection-hub-gauntlet-section"><div class="selection-hub-gauntlet-section-head"><h3>Team</h3></div><div class="selection-hub-gauntlet-team">' + team.map(function (index, slot) {
                return '<div class="selection-hub-gauntlet-member">' +
                    '<img src="' + escapeHtml(getCharacterFaceByIndex(index)) + '" alt="">' +
                    '<div><strong>' + escapeHtml(getCharacterNameByIndex(index)) + '</strong>' +
                    '<p class="selection-hub-gauntlet-meta">HP ' + (hp[slot] == null ? 100 : hp[slot]) + '/100</p></div>' +
                '</div>';
            }).join("") + '</div></section>';
        }

        function renderGauntletResources(run) {
            var items = [
                ["Ryo", Number(run && run.ryo) || 0, "Spend at merchants."],
                ["Heaven", Number(run && run.heavenScrolls) || 0, "One half of the Row 7 exit requirement."],
                ["Earth", Number(run && run.earthScrolls) || 0, "One half of the Row 7 exit requirement."],
                ["Fragments", Number(run && run.scrollFragments) || 0, "Forge 3 into a Heaven or Earth Scroll."]
            ];
            return '<section class="selection-hub-gauntlet-section selection-hub-gauntlet-resources-section"><div class="selection-hub-gauntlet-section-head"><h3>Resources</h3><p>Keep both scroll types before the gate.</p></div><div class="selection-hub-gauntlet-resources">' + items.map(function (entry) {
                return '<div class="selection-hub-gauntlet-resource"><span>' + entry[0] + '</span><strong>' + entry[1] + '</strong><em>' + entry[2] + '</em></div>';
            }).join("") + '</div>' + renderGauntletForge(run) + '</section>';
        }

        function renderGauntletRelics(run) {
            var relicIds = Array.from(new Set(Array.isArray(run && run.relics) ? run.relics : []));
            if (!relicIds.length) {
                return '<section class="selection-hub-gauntlet-section selection-hub-gauntlet-relics-section"><div class="selection-hub-gauntlet-section-head"><h3>Relics</h3><p>Run-long effects</p></div><p class="selection-hub-gauntlet-copy">No relic or curse effects are active yet.</p></section>';
            }
            return '<section class="selection-hub-gauntlet-section selection-hub-gauntlet-relics-section"><div class="selection-hub-gauntlet-section-head"><h3>Relics</h3><p>Hover for details</p></div><div class="selection-hub-gauntlet-relic-list">' +
                relicIds.map(function (id) {
                    var modifier = findGauntletModifier(id);
                    var name = (modifier && modifier.name) || gauntletDisplayId(id);
                    var description = (modifier && modifier.description) || "No effect description available.";
                    var isCurse = Boolean(modifier && modifier.isCurse);
                    return '<span class="selection-hub-gauntlet-relic' + (isCurse ? " curse" : "") + '" tabindex="0" title="' + escapeHtml(description) + '" data-tooltip="' + escapeHtml(description) + '"><strong>' + escapeHtml(name) + '</strong></span>';
                }).join("") +
            '</div></section>';
        }

        function renderGauntletForge(run) {
            var fragments = Number(run && run.scrollFragments) || 0;
            if (!run || fragments < 3) return "";
            return '<div class="selection-hub-gauntlet-callout"><p>You have enough fragments to forge an exam scroll. Use this to fix a missing Heaven/Earth requirement before Row 7.</p><div class="selection-hub-gauntlet-actions">' +
                '<button type="button" class="selection-hub-story-begin" data-gauntlet-forge="heaven">Forge Heaven Scroll</button>' +
                '<button type="button" class="selection-hub-story-begin" data-gauntlet-forge="earth">Forge Earth Scroll</button>' +
            '</div></div>';
        }

        function renderGauntletLastResult(run) {
            var result = run && run.lastNodeResult;
            var reward = result && result.reward;
            if (!reward) return "";
            var bits = [];
            if (reward.ryo) bits.push((reward.ryo > 0 ? "+" : "") + reward.ryo + " Ryo");
            if (reward.heavenScrolls) bits.push("+" + reward.heavenScrolls + " Heaven");
            if (reward.earthScrolls) bits.push("+" + reward.earthScrolls + " Earth");
            if (reward.scrollFragments) bits.push((reward.scrollFragments > 0 ? "+" : "") + reward.scrollFragments + " Fragments");
            if (Array.isArray(reward.relics) && reward.relics.length) {
                bits.push("Relic: " + reward.relics.map(function (id) {
                    var modifier = findGauntletModifier(id);
                    return (modifier && modifier.name) || gauntletDisplayId(id);
                }).join(", "));
            }
            if (!bits.length) return "";
            return '<div class="selection-hub-gauntlet-last"><span>Last Result</span><strong>' + escapeHtml(bits.join(" / ")) + '</strong></div>';
        }

        function renderGauntletOffers(run) {
            var offers = Array.isArray(run && run.pendingOffers) ? run.pendingOffers : [];
            if (!offers.length) return "";
            return '<section class="selection-hub-gauntlet-section"><div class="selection-hub-gauntlet-section-head"><h3>Pending Offers</h3><p>Curses are optional run-long tradeoffs.</p></div><div class="selection-hub-gauntlet-offers">' +
                offers.map(function (offer) {
                    return '<button type="button" class="selection-hub-story-begin hard" data-gauntlet-offer-type="' + escapeHtml(offer.type || "") + '" data-gauntlet-offer-id="' + escapeHtml(offer.id || "") + '">Accept ' + escapeHtml(String(offer.id || "Offer").replace(/-/g, " ")) + '</button>';
                }).join("") + '</div></section>';
        }

        function renderGauntletMerchant(run) {
            var mapRows = Array.isArray(run && run.map && run.map.rows) ? run.map.rows : [];
            var current = null;
            mapRows.forEach(function (row) {
                getGauntletRowNodes(row).forEach(function (node) {
                    if (node && node.id === run.currentNodeId) current = node;
                });
            });
            if (!current || current.type !== "merchant") return "";
            return '<section class="selection-hub-gauntlet-section"><div class="selection-hub-gauntlet-section-head"><h3>Forest Trader</h3><p>Spend Ryo before choosing the next node.</p></div><div class="selection-hub-gauntlet-actions">' +
                '<button type="button" class="selection-hub-story-begin" data-gauntlet-buy="heaven_scroll">Heaven - 100</button>' +
                '<button type="button" class="selection-hub-story-begin" data-gauntlet-buy="earth_scroll">Earth - 100</button>' +
                '<button type="button" class="selection-hub-story-begin" data-gauntlet-buy="heal">Heal - 55</button>' +
                '<button type="button" class="selection-hub-story-begin" data-gauntlet-buy="random_relic">Relic - 120</button>' +
            '</div></section>';
        }

        function renderGauntletMap(run) {
            var rows = Array.isArray(run && run.map && run.map.rows) ? run.map.rows : [];
            var reachable = getGauntletReachableNodeIds(run);
            var visited = Array.isArray(run && run.visitedNodeIds) ? run.visitedNodeIds : [];
            if (Number(run && run.currentAct) === 3) {
                rows = [
                    { row: 8, nodes: [{ id: "act3-preliminary", type: "elite_battle", enemyTeamId: "Preliminaries" }] },
                    { row: 9, nodes: [{ id: "act3-finals", type: "elite_battle", enemyTeamId: "Finals" }] }
                ];
            }
            return '<section class="selection-hub-gauntlet-section selection-hub-gauntlet-route"><div class="selection-hub-gauntlet-section-head"><h3>Route</h3><p>Choose highlighted nodes. The Row 7 gate needs both scrolls.</p></div><div class="selection-hub-gauntlet-map">' + rows.map(function (row, idx) {
                var nodes = getGauntletRowNodes(row);
                var rowNumber = getGauntletRowNumber(row, idx + 1);
                return '<div class="selection-hub-gauntlet-row"><div class="selection-hub-gauntlet-row-label">Row ' + rowNumber + '</div><div class="selection-hub-gauntlet-nodes">' +
                    nodes.map(function (node) {
                        var isReachable = reachable.indexOf(node.id) !== -1;
                        var blockedByScrollGate = Number(node.row || rowNumber) === 7 && !gauntletHasBothScrolls(run);
                        var canUseNode = isReachable && !blockedByScrollGate;
                        var classes = "selection-hub-gauntlet-node type-" + String(node.type || "node").replace(/_/g, "-") + (canUseNode ? " reachable" : "") + (visited.indexOf(node.id) !== -1 ? " visited" : "") + (!canUseNode && visited.indexOf(node.id) === -1 ? " locked" : "");
                        var nodeState = visited.indexOf(node.id) !== -1
                            ? "Cleared"
                            : blockedByScrollGate
                                ? "Needs both scrolls"
                                : canUseNode ? "Available" : "Locked";
                        return '<button type="button" class="' + classes + '" data-gauntlet-node="' + escapeHtml(node.id) + '" title="' + escapeHtml(gauntletNodeHelp(node, run)) + '"' + (canUseNode ? "" : " disabled") + '><span>' + escapeHtml(gauntletNodeTypeLabel(node.type)) + '</span><strong>' + escapeHtml(gauntletNodeName(node)) + '</strong><em>' + escapeHtml(nodeState) + '</em></button>';
                    }).join("") + '</div></div>';
            }).join("") + '</div></section>';
        }

        function renderGauntletNextSteps(run) {
            var usableNodes = getGauntletUsableNodes(run);
            if (!usableNodes.length) {
                return '<section class="selection-hub-gauntlet-next"><div><span>Next Step</span><strong>Gate blocked</strong><p>No reachable node is available. If you are at Row 7, gather or forge both a Heaven Scroll and an Earth Scroll.</p></div></section>';
            }
            return '<section class="selection-hub-gauntlet-next"><div><span>Next Step</span><strong>Advance the run</strong><p>Pick one available node. Battles open the fight client immediately.</p></div><div class="selection-hub-gauntlet-actions">' +
                usableNodes.map(function (node) {
                    var label = node.type === "battle" || node.type === "elite_battle"
                        ? "Start " + gauntletNodeTypeLabel(node.type)
                        : "Enter " + gauntletNodeTypeLabel(node.type);
                    return '<button type="button" class="selection-hub-story-begin" data-gauntlet-node="' + escapeHtml(node.id) + '">' + escapeHtml(label) + '</button>';
                }).join("") +
            '</div></section>';
        }

        function getGauntletUsableNodes(run) {
            var reachable = getGauntletReachableNodeIds(run);
            return reachable
                .map(function (nodeId) { return findGauntletNode(run, nodeId); })
                .filter(function (node) { return node && !(Number(node.row) === 7 && !gauntletHasBothScrolls(run)); });
        }

        function renderGauntletCommandBar(run) {
            if (!run) return "";
            var act = Number(run.currentAct) || 1;
            var usableNodes = getGauntletUsableNodes(run);
            var summary = act === 1
                ? "Finish the Written Test choices to open the Forest route."
                : !usableNodes.length
                    ? "The gate is blocked. Forge or find the missing Heaven/Earth Scroll."
                    : usableNodes.length === 1
                        ? gauntletNodeTypeLabel(usableNodes[0].type) + ": " + gauntletNodeName(usableNodes[0])
                        : usableNodes.length + " route choices are available.";
            var primary = "";
            if (act !== 1 && usableNodes.length === 1) {
                var onlyNode = usableNodes[0];
                var label = onlyNode.type === "battle" || onlyNode.type === "elite_battle" ? "Start Battle" : "Enter Node";
                primary = '<button type="button" class="selection-hub-story-begin" data-gauntlet-node="' + escapeHtml(onlyNode.id) + '">' + label + '</button>';
            } else if (act !== 1 && usableNodes.length > 1) {
                primary = '<span class="selection-hub-gauntlet-command-hint">Pick a highlighted route node below</span>';
            }
            return '<section class="selection-hub-gauntlet-command"><div><span>Next</span><strong>' + escapeHtml(summary) + '</strong></div><div class="selection-hub-gauntlet-command-actions">' + primary + '<button type="button" class="selection-hub-story-begin hard compact" data-gauntlet-abandon>Abandon</button></div></section>';
        }

        function getGauntletReachableNodeIds(run) {
            var fromServer = Array.isArray(gauntletState.reachableNodeIds) ? gauntletState.reachableNodeIds.filter(Boolean) : [];
            if (fromServer.length) return fromServer;
            if (!run || Number(run.currentAct) === 1) return [];
            if (Number(run.currentAct) === 3) {
                var act3Visited = Array.isArray(run.visitedNodeIds) ? run.visitedNodeIds : [];
                if (act3Visited.indexOf("act3-preliminary") === -1) return ["act3-preliminary"];
                if (act3Visited.indexOf("act3-finals") === -1) return ["act3-finals"];
                return [];
            }
            var rows = Array.isArray(run.map && run.map.rows) ? run.map.rows : [];
            var visited = Array.isArray(run.visitedNodeIds) ? run.visitedNodeIds : [];
            var locked = Array.isArray(run.lockedNodeIds) ? run.lockedNodeIds : [];
            if (!run.currentNodeId) {
                var firstRow = rows.find(function (row) { return getGauntletRowNumber(row, 0) === 1; });
                return getGauntletRowNodes(firstRow).map(function (node) { return node.id; }).filter(function (id) {
                    return visited.indexOf(id) === -1 && locked.indexOf(id) === -1;
                });
            }
            var current = findGauntletNode(run, run.currentNodeId);
            return (Array.isArray(current && current.connectsTo) ? current.connectsTo : []).filter(function (id) {
                return visited.indexOf(id) === -1 && locked.indexOf(id) === -1;
            });
        }

        function renderGauntletEventDecision(run) {
            var node = findGauntletNode(run, gauntletState.activeEventNodeId);
            var event = node && findGauntletEvent(node.content && node.content.eventId);
            if (!node || !event) return "";
            return '<section class="selection-hub-gauntlet-section selection-hub-gauntlet-event-card"><div class="selection-hub-gauntlet-section-head"><h3>' + escapeHtml(event.title) + '</h3><p>Choose one result. The run advances after this decision.</p></div>' +
                (Array.isArray(event.choices) ? event.choices : []).map(function (choice, index) {
                    return '<div class="selection-hub-gauntlet-choice"><strong>' + escapeHtml(choice.label) + '</strong><p>' + escapeHtml(choice.outcomeSummary || "") + '</p><button type="button" class="selection-hub-story-begin" data-gauntlet-event-choice="' + index + '">Choose</button></div>';
                }).join("") +
                '<button type="button" class="selection-hub-story-begin hard" data-gauntlet-event-cancel>Back to Map</button></section>';
        }

        function renderGauntletPanel() {
            if (!gauntletPanelEl) return;
            var run = gauntletState.run;
            var status = gauntletState.status
                ? '<p class="selection-hub-gauntlet-status ' + escapeHtml(gauntletState.statusType) + '">' + escapeHtml(gauntletState.status) + '</p>'
                : "";
            if (!run) {
                gauntletPanelEl.innerHTML = renderGauntletHero(null) +
                    '<div class="selection-hub-gauntlet-dashboard">' +
                        '<div class="selection-hub-gauntlet-main">' + renderGauntletGuide(null) + '</div>' +
                        '<aside class="selection-hub-gauntlet-side">' + renderGauntletTeam(null) + '</aside>' +
                    '</div>' +
                    status;
                return;
            }
            if (Number(run.currentAct) === 1 && gauntletState.actOneEvent) {
                var event = gauntletState.actOneEvent;
                var writtenTest = '<section class="selection-hub-gauntlet-section"><div class="selection-hub-gauntlet-section-head"><h3>' + escapeHtml(event.title) + '</h3><p>Choose the setup reward you want before entering the Forest.</p></div><div class="selection-hub-gauntlet-choice-list">' + (Array.isArray(event.choices) ? event.choices : []).map(function (choice, index) {
                    return '<div class="selection-hub-gauntlet-choice"><strong>' + escapeHtml(choice.label) + '</strong><p>' + escapeHtml(choice.outcomeSummary || "") + '</p><button type="button" class="selection-hub-story-begin" data-gauntlet-act1="' + index + '">Choose</button></div>';
                }).join("") + '</div></section>';
                gauntletPanelEl.innerHTML = renderGauntletHero(run) +
                    renderGauntletCommandBar(run) +
                    '<div class="selection-hub-gauntlet-dashboard">' +
                        '<div class="selection-hub-gauntlet-main">' + renderGauntletGuide(run) + writtenTest + status + '</div>' +
                        '<aside class="selection-hub-gauntlet-side">' + renderGauntletResources(run) + renderGauntletRelics(run) + renderGauntletTeam(run) + renderGauntletLastResult(run) + '</aside>' +
                    '</div>';
                return;
            }
            gauntletPanelEl.innerHTML = renderGauntletHero(run) +
                renderGauntletCommandBar(run) +
                '<div class="selection-hub-gauntlet-dashboard">' +
                    '<div class="selection-hub-gauntlet-main">' +
                        renderGauntletEventDecision(run) +
                        renderGauntletMerchant(run) +
                        renderGauntletOffers(run) +
                        renderGauntletMap(run) +
                        status +
                    '</div>' +
                    '<aside class="selection-hub-gauntlet-side">' +
                        renderGauntletGuide(run) +
                        renderGauntletResources(run) +
                        renderGauntletRelics(run) +
                        renderGauntletLastResult(run) +
                        renderGauntletTeam(run) +
                    '</aside>' +
                '</div>';
        }

        function loadGauntletEnvironment(force) {
            if (!gauntletPanelEl || (loadedGauntlet && !force)) return;
            loadedGauntlet = true;
            gauntletPanelEl.innerHTML = '<div class="selection-hub-env-empty">Loading Chunin Exams...</div>';
            Promise.all([
                fetchJson("/api/gauntlet/run"),
                gauntletState.catalog ? Promise.resolve(gauntletState.catalog) : fetchJson("/api/gauntlet/catalog")
            ]).then(function (results) {
                var data = results[0] || {};
                gauntletState.catalog = results[1] || gauntletState.catalog;
                gauntletState.run = data.run || null;
                gauntletState.actOneEvent = data.actOneEvent || null;
                gauntletState.reachableNodeIds = Array.isArray(data.reachableNodeIds) ? data.reachableNodeIds : [];
                gauntletState.activeEventNodeId = "";
                gauntletState.status = "";
                gauntletState.statusType = "";
                renderGauntletPanel();
            }).catch(function (error) {
                loadedGauntlet = false;
                gauntletState.status = (error && error.message) || "Log in to use Chunin Exams.";
                gauntletState.statusType = "error";
                renderGauntletPanel();
            });
        }

        function updateGauntletFromResponse(data, message) {
            gauntletState.run = data.run || null;
            gauntletState.actOneEvent = data.actOneEvent || null;
            gauntletState.reachableNodeIds = Array.isArray(data.reachableNodeIds) ? data.reachableNodeIds : [];
            gauntletState.activeEventNodeId = "";
            gauntletState.status = message || "";
            gauntletState.statusType = message ? "success" : "";
            loadedGauntlet = true;
            renderGauntletPanel();
        }

        function runGauntletRequest(button, request, resetText) {
            if (gauntletBusy) return;
            gauntletBusy = true;
            if (button) {
                button.disabled = true;
                button.textContent = "Working...";
            }
            request().catch(function (error) {
                gauntletState.status = (error && error.message) || "Gauntlet action failed.";
                gauntletState.statusType = "error";
                renderGauntletPanel();
            }).finally(function () {
                gauntletBusy = false;
                if (button && document.body.contains(button)) {
                    button.disabled = false;
                    button.textContent = resetText || button.textContent;
                }
            });
        }

        function setHubView(view) {
            var nextView = view === "missions" ? "missions" : "play";
            var isEnvironment = nextView !== "play";
            document.body.classList.remove("hub-view-shop", "hub-view-missions", "hub-view-inventory", "hub-view-story");
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

        shopTabButtons.forEach(function (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                activeShopTab = button.getAttribute("data-shop-tab") || "characters";
                renderShopEnvironment();
            });
        });

        if (shopGrid) {
            shopGrid.addEventListener("click", function (event) {
                var charBuyBtn = event.target.closest("[data-shop-env-buy]");
                if (charBuyBtn && !charBuyBtn.disabled) {
                    handleShopPurchase(charBuyBtn.getAttribute("data-shop-env-buy"), charBuyBtn);
                    return;
                }
                var cosBuyBtn = event.target.closest("[data-cosmetic-buy-id]");
                if (cosBuyBtn && !cosBuyBtn.disabled) {
                    handleCosmeticPurchase(cosBuyBtn.getAttribute("data-cosmetic-buy-id"), cosBuyBtn.getAttribute("data-cosmetic-buy-cat"), cosBuyBtn);
                    return;
                }
                var cosEquipBtn = event.target.closest("[data-cosmetic-equip-id]");
                if (cosEquipBtn && !cosEquipBtn.disabled) {
                    handleEquipItem(cosEquipBtn.getAttribute("data-cosmetic-equip-type"), cosEquipBtn.getAttribute("data-cosmetic-equip-id"), cosEquipBtn);
                    return;
                }
            });
        }

        if (inventoryGrid) {
            inventoryGrid.addEventListener("click", function (event) {
                var equipBtn = event.target.closest("[data-cosmetic-equip-id]");
                if (equipBtn && !equipBtn.disabled) {
                    handleEquipItem(equipBtn.getAttribute("data-cosmetic-equip-type"), equipBtn.getAttribute("data-cosmetic-equip-id"), equipBtn);
                }
            });
        }

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

        inventoryTabButtons.forEach(function (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                activeInventoryTab = button.getAttribute("data-inventory-tab") || "avatars";
                renderInventoryTab(activeInventoryTab);
            });
        });

        pveModeButtons.forEach(function (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                setPveMode(button.getAttribute("data-pve-mode") || "story");
            });
        });

        if (missionSearch) {
            missionSearch.addEventListener("input", renderMissions);
        }

        if (storyListEl) {
            storyListEl.addEventListener("click", function (event) {
                var row = event.target.closest("[data-story-node]");
                if (!row) return;
                var nodeId = row.getAttribute("data-story-node");
                var node = storyNodes.find(function (n) { return n.nodeId === nodeId; });
                if (!node) return;
                showStoryBriefing(node);
            });
        }

        if (gauntletPanelEl) {
            gauntletPanelEl.addEventListener("click", function (event) {
                var start = event.target.closest("[data-gauntlet-start]");
                if (start) {
                    runGauntletRequest(start, function () {
                        var team = getSelectedStoryTeamIndices();
                        var scrollSelect = gauntletPanelEl.querySelector("[data-gauntlet-start-scroll]");
                        return fetchJson("/api/gauntlet/run/start", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                team: team.length === 3 ? team : undefined,
                                startingScrollType: scrollSelect ? scrollSelect.value : "heaven"
                            })
                        }).then(function (data) {
                            updateGauntletFromResponse(data, "Gauntlet started.");
                        });
                    }, "Start Gauntlet");
                    return;
                }
                var actOne = event.target.closest("[data-gauntlet-act1]");
                if (actOne) {
                    runGauntletRequest(actOne, function () {
                        return fetchJson("/api/gauntlet/run/act1/choose", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ choiceIndex: Number(actOne.getAttribute("data-gauntlet-act1")) || 0 })
                        }).then(function (data) {
                            updateGauntletFromResponse(data, "Written Test cleared.");
                        });
                    }, actOne.textContent);
                    return;
                }
                var nodeButton = event.target.closest("[data-gauntlet-node]");
                if (nodeButton) {
                    var clickedNode = findGauntletNode(gauntletState.run, nodeButton.getAttribute("data-gauntlet-node"));
                    if (clickedNode && clickedNode.type === "event") {
                        gauntletState.activeEventNodeId = clickedNode.id;
                        gauntletState.status = "";
                        gauntletState.statusType = "";
                        renderGauntletPanel();
                        return;
                    }
                    runGauntletRequest(nodeButton, function () {
                        return fetchJson("/api/gauntlet/run/node/enter", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ nodeId: nodeButton.getAttribute("data-gauntlet-node") })
                        }).then(function (data) {
                            if (data.battleStarted && data.match && data.match.matchId) {
                                window.location.href = "ingame.html?matchId=" + encodeURIComponent(data.match.matchId);
                                return;
                            }
                            updateGauntletFromResponse(data, "Node cleared.");
                        });
                    }, "Enter");
                    return;
                }
                var eventChoice = event.target.closest("[data-gauntlet-event-choice]");
                if (eventChoice) {
                    runGauntletRequest(eventChoice, function () {
                        return fetchJson("/api/gauntlet/run/node/enter", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                nodeId: gauntletState.activeEventNodeId,
                                choiceIndex: Number(eventChoice.getAttribute("data-gauntlet-event-choice")) || 0
                            })
                        }).then(function (data) {
                            updateGauntletFromResponse(data, "Event resolved.");
                        });
                    }, "Choose");
                    return;
                }
                if (event.target.closest("[data-gauntlet-event-cancel]")) {
                    gauntletState.activeEventNodeId = "";
                    renderGauntletPanel();
                    return;
                }
                var buy = event.target.closest("[data-gauntlet-buy]");
                if (buy) {
                    runGauntletRequest(buy, function () {
                        return fetchJson("/api/gauntlet/run/merchant/buy", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ itemType: buy.getAttribute("data-gauntlet-buy") })
                        }).then(function (data) {
                            updateGauntletFromResponse(data, "Purchase complete.");
                        });
                    }, buy.textContent);
                    return;
                }
                var forge = event.target.closest("[data-gauntlet-forge]");
                if (forge) {
                    runGauntletRequest(forge, function () {
                        return fetchJson("/api/gauntlet/run/fragments/forge", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ scrollType: forge.getAttribute("data-gauntlet-forge") })
                        }).then(function (data) {
                            updateGauntletFromResponse(data, "Scroll forged.");
                        });
                    }, forge.textContent);
                    return;
                }
                var offer = event.target.closest("[data-gauntlet-offer-id]");
                if (offer) {
                    runGauntletRequest(offer, function () {
                        return fetchJson("/api/gauntlet/run/offer/accept", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                offerType: offer.getAttribute("data-gauntlet-offer-type"),
                                offerId: offer.getAttribute("data-gauntlet-offer-id")
                            })
                        }).then(function (data) {
                            updateGauntletFromResponse(data, "Offer accepted.");
                        });
                    }, offer.textContent);
                    return;
                }
                var abandon = event.target.closest("[data-gauntlet-abandon]");
                if (abandon) {
                    runGauntletRequest(abandon, function () {
                        return fetchJson("/api/gauntlet/run/abandon", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: "{}"
                        }).then(function (data) {
                            updateGauntletFromResponse(data, "Run abandoned.");
                        });
                    }, "Abandon");
                }
            });
        }

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