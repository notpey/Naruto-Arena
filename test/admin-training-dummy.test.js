const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const serverSource = fs.readFileSync('server.js', 'utf8');
const selectionSource = fs.readFileSync('selection.html', 'utf8');
const scriptSource = fs.readFileSync('script.js', 'utf8');

test('admin training dummy endpoint is admin-only and creates a training match', () => {
    assert.match(serverSource, /app\.post\('\/api\/admin\/training-dummy\/start', requireSession/);
    assert.match(serverSource, /Admin access required\./);
    assert.match(serverSource, /mode: 'training'/);
    assert.match(serverSource, /passive: true/);
    assert.match(serverSource, /TRAINING_DUMMY_DISPLAY_NAME/);
});

test('training matches do not grant normal match rewards', () => {
    assert.match(serverSource, /if \(match\.mode === 'training'\) \{\s*return null;\s*\}/);
});

test('selection screen exposes training dummy only through the admin client control', () => {
    assert.match(selectionSource, /class="training-dummy-button" hidden/);
    assert.match(scriptSource, /trainingDummyButton\.hidden = !isCurrentUserAdmin\(\)/);
    assert.match(scriptSource, /\/api\/admin\/training-dummy\/start/);
});
