// Run manually when roster artwork changes. Existing artwork is copied, not regenerated.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.join(__dirname, '..');
const roster = require('../data/characters');
const urls = [...new Set(JSON.stringify(roster).match(/https:\/\/i\.imgur\.com\/[a-zA-Z0-9]+\.(?:png|jpg|jpeg|gif|webp)/g) || [])];
const directory = path.join(root, 'assets', 'characters');
fs.mkdirSync(directory, { recursive: true });
const manifestPath = path.join(directory, 'manifest.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath)) : {};
const failures = [];
async function download(url) {
    const file = path.basename(new URL(url).pathname);
    const target = path.join(directory, file);
    if (manifest[url] && fs.existsSync(target)) return;
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(20000), redirect: 'follow' });
        if (!response.ok || !response.headers.get('content-type')?.startsWith('image/') || new URL(response.url).pathname !== new URL(url).pathname) throw new Error(`Unavailable (${response.status})`);
        const bytes = Buffer.from(await response.arrayBuffer());
        if (bytes.length < 100 || bytes.length > 5 * 1024 * 1024) throw new Error('Unexpected image size');
        fs.writeFileSync(target, bytes);
        manifest[url] = { local: '/assets/characters/' + file, sha256: crypto.createHash('sha256').update(bytes).digest('hex') };
    } catch (error) { failures.push({ url, error: error.message }); }
}
(async () => {
    const queue = [...urls];
    await Promise.all(Array.from({ length: 6 }, async () => { while (queue.length) await download(queue.shift()); }));
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
    fs.writeFileSync(path.join(directory, 'unavailable.json'), JSON.stringify(failures, null, 2) + '\n');
    const browserPath = path.join(root, 'character-images.js');
    if (fs.existsSync(browserPath)) {
        const names = Object.values(manifest).map(item => path.basename(item.local));
        const source = fs.readFileSync(browserPath, 'utf8').replace(/const available = new Set\(\[[^\n]*\]\);/, 'const available = new Set(' + JSON.stringify(names) + ');');
        fs.writeFileSync(browserPath, source);
    }
    console.log(JSON.stringify({ requested: urls.length, available: Object.keys(manifest).length, unavailable: failures.length }));
})();
