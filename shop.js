(function () {
    'use strict';

    var overlayEl = null;
    var panelBodyEl = null;
    var balanceEl = null;
    var isOpen = false;

    var escapeHtml = function (value) {
        return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
        });
    };

    var formatRyo = function (value) {
        var amount = Math.max(0, Math.round(Number(value) || 0));
        return amount.toLocaleString('en-US');
    };

    var updateBalanceDisplays = function (ryo) {
        var text = formatRyo(ryo);
        document.querySelectorAll('[data-shop-balance]').forEach(function (el) {
            el.textContent = text;
        });
        if (balanceEl) {
            balanceEl.textContent = text;
        }
    };

    var fetchJson = function (url, options) {
        return fetch(url, Object.assign({ credentials: 'include' }, options || {})).then(function (res) {
            return res
                .json()
                .catch(function () {
                    return {};
                })
                .then(function (data) {
                    if (!res.ok) {
                        throw new Error((data && data.error) || 'Request failed.');
                    }
                    return data;
                });
        });
    };

    var refreshBalance = function () {
        return fetchJson('/api/me')
            .then(function (data) {
                var ryo = data && data.user && data.user.profile ? data.user.profile.ryo : 0;
                updateBalanceDisplays(ryo);
                return ryo;
            })
            .catch(function () {
                // Not logged in, or offline — leave balance displays as-is.
            });
    };

    var renderMessage = function (message) {
        panelBodyEl.innerHTML =
            '<p class="rs-shop-message">' + escapeHtml(message) + '</p>';
    };

    var renderCharacters = function (ryo, characters) {
        if (!characters.length) {
            renderMessage(
                'Every character currently in the shop has already been unlocked, or none are for sale yet. Check back after the next update!'
            );
            return;
        }

        var cardsHtml = characters
            .map(function (character) {
                var affordable = ryo >= character.shopPrice;
                return (
                    '<div class="rs-shop-card" data-character-id="' +
                    escapeHtml(character.characterId) +
                    '">' +
                    '<div class="rs-shop-card-face">' +
                    (character.facePicture
                        ? '<img src="' + escapeHtml(character.facePicture) + '" alt="' + escapeHtml(character.name) + '">'
                        : '') +
                    '</div>' +
                    '<div class="rs-shop-card-name">' + escapeHtml(character.name || character.characterId) + '</div>' +
                    '<div class="rs-shop-card-price"><span class="rs-shop-coin">両</span>' +
                    formatRyo(character.shopPrice) +
                    '</div>' +
                    '<button type="button" class="rs-shop-buy" data-buy="' +
                    escapeHtml(character.characterId) +
                    '"' +
                    (affordable ? '' : ' disabled') +
                    '>' +
                    (affordable ? 'Unlock' : 'Not enough Ryo') +
                    '</button>' +
                    '</div>'
                );
            })
            .join('');

        panelBodyEl.innerHTML = '<div class="rs-shop-grid">' + cardsHtml + '</div>';
    };

    var loadCatalog = function () {
        renderMessage('Loading the shop…');
        fetchJson('/api/shop')
            .then(function (data) {
                updateBalanceDisplays(data.ryo);
                renderCharacters(Number(data.ryo) || 0, Array.isArray(data.characters) ? data.characters : []);
            })
            .catch(function (error) {
                renderMessage(error.message || 'You must be logged in to visit the shop.');
            });
    };

    var handlePurchaseClick = function (characterId, buttonEl) {
        buttonEl.disabled = true;
        buttonEl.textContent = 'Unlocking…';
        fetchJson('/api/shop/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ characterId: characterId }),
        })
            .then(function (data) {
                updateBalanceDisplays(data.ryo);
                var card = buttonEl.closest('.rs-shop-card');
                if (card) {
                    card.classList.add('rs-shop-card-unlocked');
                    card.innerHTML =
                        '<div class="rs-shop-unlocked-banner">Unlocked!<br><span>Related mission marked complete.</span></div>';
                    window.setTimeout(function () {
                        if (card.parentNode) {
                            card.parentNode.removeChild(card);
                            if (!panelBodyEl.querySelector('.rs-shop-card')) {
                                renderMessage('You’ve unlocked every character in the shop. Nicely done, shinobi.');
                            }
                        }
                    }, 1400);
                }
            })
            .catch(function (error) {
                buttonEl.disabled = false;
                buttonEl.textContent = error.message || 'Try again';
            });
    };

    var build = function () {
        if (overlayEl) {
            return;
        }
        overlayEl = document.createElement('div');
        overlayEl.className = 'rs-shop-overlay';
        overlayEl.setAttribute('role', 'dialog');
        overlayEl.setAttribute('aria-modal', 'true');
        overlayEl.setAttribute('aria-label', 'Ryo Shop');
        overlayEl.innerHTML =
            '<div class="rs-shop-panel">' +
            '<div class="rs-shop-header">' +
            '<div class="rs-shop-title"><span class="rs-shop-coin">両</span> Ryo Shop</div>' +
            '<div class="rs-shop-balance-pill">Balance: <strong class="rs-shop-balance-amount">0</strong> Ryo</div>' +
            '<button type="button" class="rs-shop-close" aria-label="Close shop">✕</button>' +
            '</div>' +
            '<div class="rs-shop-body"></div>' +
            '</div>';
        document.body.appendChild(overlayEl);

        panelBodyEl = overlayEl.querySelector('.rs-shop-body');
        balanceEl = overlayEl.querySelector('.rs-shop-balance-amount');

        overlayEl.addEventListener('click', function (event) {
            if (event.target === overlayEl) {
                close();
            }
        });
        overlayEl.querySelector('.rs-shop-close').addEventListener('click', close);

        panelBodyEl.addEventListener('click', function (event) {
            var buyBtn = event.target.closest('[data-buy]');
            if (buyBtn && !buyBtn.disabled) {
                handlePurchaseClick(buyBtn.getAttribute('data-buy'), buyBtn);
            }
        });

        document.addEventListener('keydown', function (event) {
            if (isOpen && event.key === 'Escape') {
                close();
            }
        });
    };

    var open = function () {
        build();
        overlayEl.classList.add('rs-shop-open');
        isOpen = true;
        loadCatalog();
    };

    var close = function () {
        if (overlayEl) {
            overlayEl.classList.remove('rs-shop-open');
        }
        isOpen = false;
    };

    document.addEventListener('click', function (event) {
        var trigger = event.target.closest('[data-shop-trigger]');
        if (trigger) {
            event.preventDefault();
            open();
        }
    });

    window.NarutoShop = {
        open: open,
        close: close,
        refreshBalance: refreshBalance,
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', refreshBalance);
    } else {
        refreshBalance();
    }
})();
