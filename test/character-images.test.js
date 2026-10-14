const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { localizeArtwork } = require('../services/characterImages');
const manifest = require('../assets/characters/manifest.json');
const roster = require('../data/characters');

test('every mirrored image exists with its recorded content hash; every roster artwork URL has a local presentation', () => {
    for (const [source, entry] of Object.entries(manifest)) {
        assert.match(source, /^https:\/\/i\.imgur\.com\//);
        const bytes = fs.readFileSync(path.join(__dirname, '..', entry.local));
        assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), entry.sha256);
    }
    const rendered = localizeArtwork(roster);
    assert.ok(!JSON.stringify(rendered).includes('i.imgur.com'));
    function verify(original, localized) {
        if (Array.isArray(original)) original.forEach((item, i) => verify(item, localized[i]));
        else if (original && typeof original === 'object') {
            assert.deepEqual(Object.keys(localized), Object.keys(original));
            for (const key of Object.keys(original)) verify(original[key], localized[key]);
        } else if (typeof original === 'string' && original.startsWith('https://i.imgur.com/')) {
            assert.ok(fs.existsSync(path.join(__dirname, '..', localized)));
        } else assert.equal(localized, original, 'non-artwork gameplay values stay unchanged');
    }
    verify(roster, rendered);
});
