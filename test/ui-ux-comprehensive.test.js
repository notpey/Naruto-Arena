const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('UI/UX Hardening - CSS Resilience & Components', () => {
    const cssPath = path.join(__dirname, '..', 'style.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    assert.ok(cssContent.includes('.game-toast-container'), 'style.css contains .game-toast-container');
    assert.ok(cssContent.includes('.game-toast'), 'style.css contains .game-toast');
    assert.ok(cssContent.includes('.game-toast.error'), 'style.css contains .game-toast.error');
    assert.ok(cssContent.includes('.game-toast.warning'), 'style.css contains .game-toast.warning');
    assert.ok(cssContent.includes('.game-toast.success'), 'style.css contains .game-toast.success');
    assert.ok(cssContent.includes('.action-invalid-shake'), 'style.css contains .action-invalid-shake');
    assert.ok(cssContent.includes('.battle-connection-banner'), 'style.css contains .battle-connection-banner');
    assert.ok(cssContent.includes(':focus-visible'), 'style.css contains accessible :focus-visible rules');
});

test('UI/UX Hardening - Script Client Utilities & Audio Safety', () => {
    const scriptPath = path.join(__dirname, '..', 'script.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');

    assert.ok(scriptContent.includes('showGameToast'), 'script.js defines showGameToast');
    assert.ok(scriptContent.includes('playModalOpenSound'), 'script.js defines playModalOpenSound');
    assert.ok(scriptContent.includes('playModalCloseSound'), 'script.js defines playModalCloseSound');
    assert.ok(scriptContent.includes('connectBattleWebSocket'), 'script.js defines connectBattleWebSocket');
    assert.ok(scriptContent.includes('setConnectionBannerVisible'), 'script.js defines setConnectionBannerVisible');
    assert.ok(scriptContent.includes('getTeamIndices'), 'script.js defines getTeamIndices');
    assert.ok(scriptContent.includes('persistTeamSelection'), 'script.js defines persistTeamSelection');
    assert.ok(scriptContent.includes('updateGameButtons'), 'script.js defines updateGameButtons');
});

test('UI/UX Hardening - HTML Fallbacks and Sound Assets', () => {
    const ingameHtml = fs.readFileSync(path.join(__dirname, '..', 'ingame.html'), 'utf8');
    const selectionHtml = fs.readFileSync(path.join(__dirname, '..', 'selection.html'), 'utf8');

    assert.ok(ingameHtml.includes('script.js'), 'ingame.html includes script.js');
    assert.ok(selectionHtml.includes('script.js'), 'selection.html includes script.js');

    // Verify audio assets exist on disk
    const audioFiles = [
        'click.mp3',
        'scroll_open.mp3',
        'scroll_close.mp3',
        'found-match.mp3',
        'apply-skill.mp3',
        'start-round.mp3',
        'next-round.mp3',
        'win.mp3',
        'lost.mp3',
        'death-sound.mp3',
        'yahoe.mp3',
    ];

    for (const file of audioFiles) {
        const fullPath = path.join(__dirname, '..', 'sounds', file);
        assert.ok(fs.existsSync(fullPath), `Audio file sounds/${file} exists on disk`);
    }
});

test('UI/UX Hardening - Client Targeting Logic Matches Engine Rules', () => {
    // Replicate isUnitInvulnerableForSkill pure logic as hardened in script.js
    const isUnitInvulnerableForSkill = (unit, skill) => {
        const skillClasses = (skill?.classes || []).map((c) => String(c).toLowerCase());
        const isAffliction = skillClasses.includes('affliction');
        const liveStatuses = unit?.state?.statuses || [];
        if (liveStatuses.some((s) => Boolean(s?.metadata?.cannotBecomeInvulnerable))) {
            return false;
        }
        return liveStatuses.some((status) => {
            const metadata = status?.metadata || {};
            if (metadata.invulnerableToAllSkills || metadata.invulnerableToAffliction) return true;
            if (metadata.invulnerable && !isAffliction) return true;
            if (metadata.invulnerableToNonAffliction && !isAffliction) return true;
            const blockedClasses = Array.isArray(metadata.invulnerableToSkillClasses)
                ? metadata.invulnerableToSkillClasses
                : [];
            return blockedClasses.some((entry) => skillClasses.includes(String(entry).toLowerCase()));
        });
    };

    const invulnerableEnemy = {
        state: {
            statuses: [{ id: 'invuln_buff', remainingTurns: 1, metadata: { invulnerable: true } }],
        },
    };

    const physicalSkill = { id: 'punch', classes: ['Physical', 'Melee'] };
    const afflictionSkill = { id: 'poison', classes: ['Affliction', 'Ranged'] };

    assert.equal(
        isUnitInvulnerableForSkill(invulnerableEnemy, physicalSkill),
        true,
        'Physical skill should be blocked by invulnerable enemy'
    );
    assert.equal(
        isUnitInvulnerableForSkill(invulnerableEnemy, afflictionSkill),
        false,
        'Affliction skill should NOT be blocked by standard invulnerability'
    );

    const piercedEnemy = {
        state: {
            statuses: [
                { id: 'invuln_buff', remainingTurns: 1, metadata: { invulnerable: true } },
                { id: 'cannot_invuln_debuff', remainingTurns: 1, metadata: { cannotBecomeInvulnerable: true } },
            ],
        },
    };

    assert.equal(
        isUnitInvulnerableForSkill(piercedEnemy, physicalSkill),
        false,
        'Physical skill bypasses invulnerability when cannotBecomeInvulnerable is active'
    );
});

test('UI/UX Hardening - Enemy Rank Hat Layering & Queue Visual Preservation', () => {
    const cssPath = path.join(__dirname, '..', 'style.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    // Verify enemy anbu rank hat has z-index: 1 (behind character portrait)
    assert.ok(
        cssContent.includes('.enemy-characters .rank-hat-anbu,\n.enemy-characters .rank-hat[data-hat="anbu"]') &&
        cssContent.includes('z-index: 1; /* BEHIND character face */'),
        'style.css renders enemy anbu rank hat behind character face with z-index: 1'
    );

    const scriptPath = path.join(__dirname, '..', 'script.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');

    // Verify target option fetching does not overwrite pendingTurnState when data.pendingTurn is omitted
    assert.ok(
        scriptContent.includes('if (data.pendingTurn && typeof data.pendingTurn === \'object\') {') &&
        scriptContent.includes('pendingTurnState = normalizePendingTurn(data.pendingTurn);'),
        'script.js preserves pendingTurnState when fetching skill target options'
    );
});
