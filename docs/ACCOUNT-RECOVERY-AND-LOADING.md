# Account recovery and loading

## Enable real recovery emails

The recovery implementation is complete, but email delivery requires an email provider. Without configuration the page honestly reports that recovery is unavailable. It never returns a reset token to the browser or logs one.

1. Create a [Resend account](https://resend.com), add a sending domain you control, and complete its DNS verification. The Render `onrender.com` hostname is not a domain you control for email. If you do not have a domain, choose one before configuring the sender.
2. Create an API key with permission to send email from that domain.
3. In **Render → Naruto-Arena service → Environment**, set:
   - `PUBLIC_APP_URL=https://naruto-arena-56xa.onrender.com` (or the actual HTTPS game origin)
   - `RESEND_API_KEY` to the API key
   - `RECOVERY_EMAIL_FROM=Naruto-Arena <accounts@your-verified-domain>` using your actual verified sender.
4. Save/redeploy after the code is released. Keep `JWT_SECRET` stable across deployments. Do not copy development `.env` onto Render or set `ALLOW_INSECURE_HTTP=true` in production.
5. Use a test account with an inbox you control. Request recovery from **Forgot password?**, receive the message, reset the password, and sign in. Verify that the old password and old reset link fail and another already-signed-in browser is asked to sign in again.

Do not use Resend's onboarding/test sender for general player recovery. Follow [Resend's sending documentation](https://resend.com/docs/api-reference/emails/send-email). No email has been sent to real players by the local QA scripts.

## Recovery behavior

- Requests use the same response for known and unknown emails and perform lookup/delivery after responding.
- Limits: ten requests per IP per fifteen minutes, plus a one-minute cooldown per account.
- Tokens have 256 bits of randomness, are stored as SHA-256 hashes, expire in thirty minutes, and are consumed atomically. A newer request replaces the previous link.
- Passwords retain the existing 8–128 character policy and bcrypt hashing. Reset increments a session version, clears the server session cache, and closes that user's current game sockets. Legacy cookies with no version remain valid until that account's first reset.
- The token travels in the email URL fragment, keeping it out of HTTP access logs. The reset page removes it from the visible URL and sends it only in the reset request body.
- Recovery does not automatically log someone in. It sends a password-change notification and asks them to sign in normally.
- The current delivery is asynchronous within the game server process, not a durable job queue. If delivery fails or a deploy interrupts it, the player can request another link. Provider errors are recorded without email addresses, secrets, or tokens.

Security design reference: [OWASP Forgot Password Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html).

## Loading fixes

- The game checks the actual session cookie before initializing selection/battle. Expired sessions show a sign-in prompt; temporary connection failures show a retry prompt. Returning to a suspended mobile tab checks the session again.
- Browser local storage is optional. Blocking it no longer stops login or player initialization.
- Game login submits once, and both login forms verify that the cookie was accepted before reporting success.
- Registration now receives its standings-refresh dependency and does not report a failed account creation when only the standings refresh fails. Username duplicate lookup matches the case-insensitive login lookup.
- HTML/JS/CSS requests reach the existing cache-control layer, preventing the earlier static middleware from serving stale client files ahead of it.
- `assets/characters/` contains 492 original portraits/skill images with a source/hash manifest. The unavailable Anko skill image `3Wv9VMP.png` uses the existing local skill placeholder; its gameplay definition is unchanged. Run `node scripts/vendor-character-images.cjs` when original artwork changes.
- Small screens keep navigation and inventory at readable width. Only the fixed game board scales. Landscape or pinch zoom provides larger battle controls. Physical devices still need a release smoke test; emulation cannot establish support for every device/browser.

## Reproduce validation

```powershell
npm ci
npm test
npx playwright install chromium webkit
node scripts/qa-account-loading.cjs
```

Browser QA requires local MongoDB at `127.0.0.1:27017` and free port 4012. It starts a separate server with a random QA database, creates only test accounts, blocks Imgur, and removes that database afterward. It never uses the production database. Screenshots and results go to ignored `tmp-ui-qa-screenshots/accounts/`.

Automated recovery tests inject a fake email sender; browser reset tests insert hashed tokens only into the isolated QA database. Neither proves real inbox delivery. Complete the Render/email checklist before calling recovery live.

## Verification completed October 14, 2026

- `npm test`: 174 passed, zero failed.
- Browser QA: desktop Chromium, portrait Chromium with local storage blocked, landscape Chromium, portrait WebKit, and landscape WebKit all passed.
- Each browser registered and signed in, loaded local portraits with Imgur blocked, opened inventory, selected a team, entered a bot battle, reset a password using a QA-only token, rejected the old session, signed in with the new password, recovered from a simulated 503, and displayed the expired-session prompt.
- Phone inventory width, whole battle-board fit, recovery-page overflow, and session-prompt bounds were checked.
- No production deployment or real email delivery was performed.
