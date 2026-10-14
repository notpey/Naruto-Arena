// Keep keys in the server environment, never in client scripts or Git.
function createRecoveryEmail(env = process.env, fetchImpl = fetch) {
    let origin;
    try {
        const url = new URL(env.PUBLIC_APP_URL);
        if (url.protocol === 'https:' && !url.username && !url.password) origin = url.origin;
    } catch {}
    const configured = Boolean(origin && env.RESEND_API_KEY && env.RECOVERY_EMAIL_FROM);
    return {
        configured,
        origin,
        async send(to, subject, text) {
            if (!configured) throw new Error('Recovery email is not configured');
            const response = await fetchImpl('https://api.resend.com/emails', {
                method: 'POST',
                headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ from: env.RECOVERY_EMAIL_FROM, to: [to], subject, text }),
                signal: AbortSignal.timeout(10000),
            });
            if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
        },
    };
}
module.exports = { createRecoveryEmail };
