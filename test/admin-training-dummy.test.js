const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const serverSource = fs.readFileSync('server.js', 'utf8');
const selectionSource = fs.readFileSync('selection.html', 'utf8');
const scriptSource = fs.readFileSync('script.js', 'utf8');
const adminSource = fs.readFileSync('routes/admin.js', 'utf8');

test('Admin training dummy integration', (t) => {
    // 1. Verify server endpoint exists
    assert.match(adminSource, /router\.(post|get)\('\/training-dummy\/start'/);
    assert.match(adminSource, /Admin access required\./);
    assert.match(adminSource, /mode: 'training'/);
    assert.match(serverSource, /passive: true/);
    assert.match(serverSource, /TRAINING_DUMMY_DISPLAY_NAME/);
});

test('training matches do not grant normal match rewards', () => {
    assert.match(serverSource, /if \(match\.mode === 'training'\) \{\s*return null;\s*\}/);
});

test('selection screen exposes training dummy modal control', () => {
    assert.match(selectionSource, /id="modal-training-dummy-btn"/);
    assert.match(adminSource, /\/training-dummy\/start/);
});

test('Admin mission and story catalog methods are properly injected into admin router', () => {
    assert.match(serverSource, /saveMissionCatalog,/);
    assert.match(serverSource, /getStoredMissionCatalog,/);
    assert.match(serverSource, /saveStoryCatalog,/);
    assert.match(serverSource, /getStoredStoryCatalog,/);
    assert.match(adminSource, /saveMissionCatalog/);
    assert.match(adminSource, /saveStoryCatalog/);
});

test('Admin cosmetics bulk upload and single upload routes require session and handle items', () => {
    assert.match(adminSource, /router\.post\('\/cosmetics\/upload-avatars-bulk',\s*requireSession/);
    assert.match(adminSource, /router\.post\('\/cosmetics\/upload-avatar',\s*requireSession/);
    assert.match(adminSource, /router\.post\('\/cosmetics\/upload-border',\s*requireSession/);
});


