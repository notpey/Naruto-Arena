(function () {
    'use strict';
    const protectedPage = /\/(selection|ingame)\.html$/.test(location.pathname);
    const storage = {
        getItem(key) { try { return localStorage.getItem(key); } catch { return null; } },
        setItem(key, value) { try { localStorage.setItem(key, value); } catch {} },
        removeItem(key) { try { localStorage.removeItem(key); } catch {} },
    };
    let dialog;
    function showState(message, expired) {
        if (!protectedPage) return;
        if (!dialog) {
            dialog = document.createElement('dialog');
            dialog.className = 'account-session-dialog';
            dialog.setAttribute('aria-label', 'Game connection');
            dialog.innerHTML = '<h2>Connecting to Naruto-Arena</h2><p role="status" aria-live="polite"></p><div class="account-actions"><button type="button">Retry</button><a href="/selection-login.html">Sign in</a></div>';
            dialog.querySelector('button').onclick = () => location.reload();
            dialog.addEventListener('cancel', event => event.preventDefault());
            document.body.appendChild(dialog);
        }
        dialog.querySelector('h2').textContent = expired ? 'Please sign in again' : 'Connecting to Naruto-Arena';
        dialog.querySelector('p').textContent = message;
        dialog.querySelector('a').hidden = !expired;
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
                showState('Your session has ended. Sign in to load your characters and inventory.', true);
            }
            return response;
        } finally { clearTimeout(timeout); }
    }
    async function checkSession(initial) {
        if (initial) showState('Checking your account. The server may take a moment to wake up.', false);
        try {
            const response = await request('/api/me');
            if (response.status === 401) return null;
            if (!response.ok) throw new Error('Server unavailable');
            const data = await response.json();
            if (!data.user?.username) throw new Error('Incomplete session response');
            if (dialog?.open) dialog.close();
            return data.user;
        } catch {
            showState('We could not reach the game. Check your connection, then retry. Your account has not been signed out.', false);
            return null;
        }
    }
    const ready = protectedPage ? new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', () => checkSession(true).then(resolve), { once: true });
    }) : Promise.resolve(null);
    window.ArenaSession = { fetch: request, storage, ready };
    // Mobile browsers suspend tabs. Recheck the cookie when returning to the game.
    if (protectedPage) {
        document.addEventListener('visibilitychange', () => { if (!document.hidden) checkSession(false); });
        window.addEventListener('pageshow', event => { if (event.persisted) checkSession(false); });
    }
})();
