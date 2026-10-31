(function () {
    'use strict';
    const protectedPage = /\/(selection|ingame)\.html$/.test(location.pathname);
    const storage = {
        getItem(key) { try { return localStorage.getItem(key); } catch { return null; } },
        setItem(key, value) { try { localStorage.setItem(key, value); } catch {} },
        removeItem(key) { try { localStorage.removeItem(key); } catch {} },
    };
    const startupLogging = location.search.includes('perf=1') || storage.getItem('naPerf') === '1';
    function markStartup(stage) {
        const elapsed = performance.now();
        performance.mark(`na:${stage}`);
        if (startupLogging) console.info(`[NA load] ${stage}: ${elapsed.toFixed(1)}ms`);
    }
    function paintCachedIdentity() {
        if (!protectedPage) return;
        let cached;
        try { cached = JSON.parse(storage.getItem('narutoUser') || 'null'); } catch { return; }
        if (!cached || typeof cached.username !== 'string' || !cached.username.trim()) return;
        document.querySelectorAll('.player-nameselection, .player-left .player-name').forEach(element => {
            element.textContent = cached.username;
        });
        if (typeof cached.avatarUrl === 'string' && cached.avatarUrl) {
            document.querySelectorAll('.player-avatar, .player-avatar-left').forEach(element => {
                element.src = cached.avatarUrl;
            });
        }
        markStartup('cached-identity');
    }
    let dialog;
    let sessionCheck;
    let lastCheckAt = 0;
    function showState(message, state) {
        if (!protectedPage) return;
        if (!dialog) {
            dialog = document.createElement('dialog');
            dialog.className = 'account-session-dialog';
            dialog.setAttribute('aria-label', 'Game connection');
            dialog.innerHTML = '<div class="account-session-loader" aria-hidden="true"><span></span><span></span><span></span></div><h2></h2><p role="status" aria-live="polite"></p><div class="account-actions"><button type="button">Retry</button><a href="/selection-login.html">Sign in</a></div>';
            dialog.querySelector('button').onclick = () => location.reload();
            dialog.addEventListener('cancel', event => event.preventDefault());
            document.body.appendChild(dialog);
        }
        dialog.dataset.state = state;
        dialog.querySelector('h2').textContent = state === 'loading' ? 'Preparing the arena' : state === 'expired' ? 'Please sign in again' : 'Connection interrupted';
        dialog.querySelector('p').textContent = message;
        dialog.querySelector('.account-actions').hidden = state === 'loading';
        dialog.querySelector('a').hidden = state !== 'expired';
        if (!dialog.open) dialog.showModal();
    }
    async function request(url, options = {}) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);
        try {
            const response = await fetch(url, { credentials: 'same-origin', cache: 'no-store', ...options, signal: options.signal || controller.signal });
            const pathname = new URL(typeof url === 'string' ? url : url.url, location.href).pathname;
            if (response.status === 401 && !['/api/login', '/api/register'].includes(pathname)) {
                storage.removeItem('narutoUser');
                showState('Your session has ended. Sign in to load your characters and inventory.', 'expired');
            }
            return response;
        } finally { clearTimeout(timeout); }
    }
    function checkSession(initial) {
        if (sessionCheck) return sessionCheck;
        lastCheckAt = Date.now();
        sessionCheck = (async () => {
            if (initial) markStartup('session-check-start');
            const loadingTimer = initial ? setTimeout(() => {
                showState('Checking your account...', 'loading');
            }, 700) : null;
            try {
                const response = await request('/api/me');
                if (response.status === 401) return null;
                if (!response.ok) throw new Error('Server unavailable');
                const data = await response.json();
                if (!data.user?.username) throw new Error('Incomplete session response');
                if (dialog?.open) dialog.close();
                if (initial) markStartup('session-verified');
                return data.user;
            } catch {
                showState('We could not reach the game. Check your connection, then retry. Your account has not been signed out.', 'offline');
                return null;
            } finally {
                if (loadingTimer) clearTimeout(loadingTimer);
                sessionCheck = null;
            }
        })();
        return sessionCheck;
    }
    paintCachedIdentity();
    const ready = protectedPage ? checkSession(true) : Promise.resolve(null);
    window.ArenaSession = { fetch: request, storage, ready, markStartup };
    // Mobile browsers suspend tabs. Recheck the cookie when returning to the game.
    if (protectedPage) {
        const recheckSession = () => {
            if (Date.now() - lastCheckAt >= 60000) checkSession(false);
        };
        document.addEventListener('visibilitychange', () => { if (!document.hidden) recheckSession(); });
        window.addEventListener('pageshow', event => { if (event.persisted) recheckSession(); });
    }
})();
