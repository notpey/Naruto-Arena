(function () {
    let token;
    const form = document.getElementById('recovery-form');
    const status = document.getElementById('recovery-status');
    const button = document.getElementById('recovery-submit');
    function readResetLink() {
        token = new URLSearchParams(location.hash.slice(1)).get('token') || token;
        if (!token) return;
        // Also handles opening an email link while this recovery page is already open.
        history.replaceState(null, '', location.pathname);
        document.getElementById('recovery-title').textContent = 'Choose a new password';
        document.getElementById('recovery-description').textContent = 'Use 8–128 characters. Your other sessions will be signed out.';
        document.getElementById('email-fields').hidden = true;
        form.elements.email.required = false;
        document.getElementById('password-fields').hidden = false;
        form.elements.password.required = form.elements.confirmPassword.required = true;
        button.textContent = 'Save new password';
        document.getElementById('request-new-link').hidden = false;
    }
    readResetLink();
    window.addEventListener('hashchange', readResetLink);
    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (token && form.elements.password.value !== form.elements.confirmPassword.value) {
            status.textContent = 'The passwords do not match.'; return;
        }
        button.disabled = true;
        status.textContent = 'Please wait…';
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 30000);
        try {
            const body = token ? { token, password: form.elements.password.value, confirmPassword: form.elements.confirmPassword.value } : { email: form.elements.email.value };
            const response = await fetch(token ? '/api/reset-password' : '/api/forgot-password', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: controller.signal,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Please try again later.');
            status.textContent = data.message;
            if (token) { form.reset(); button.hidden = true; }
        } catch (error) {
            status.textContent = error.name === 'AbortError' || error instanceof TypeError ? 'Unable to reach the game. Check your connection and try again.' : error.message;
        } finally { clearTimeout(timer); button.disabled = false; }
    });
})();
