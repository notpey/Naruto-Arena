document.addEventListener('DOMContentLoaded', function () {
    const stage = document.querySelector('.background, .backgroundingame');
    if (!stage) return;
    const stageScroll = document.createElement('div');
    stageScroll.className = 'game-stage-scroll';
    const movable = ['.selection-hub-nav', '.selection-hub-environment', '.academy-guide-overlay'];
    const entries = movable.map(selector => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const marker = document.createComment('Desktop position: ' + selector);
        element.before(marker);
        return { element, marker };
    }).filter(Boolean);
    function fit() {
        // clientWidth measures the viewport, not the overflowing fixed-width game canvas.
        const width = document.documentElement.clientWidth;
        const mobile = width < 1100;
        const battle = document.body.classList.contains('ingame-client-page');
        const compactSelectionNav = !battle && width < 760;
        if (mobile && !stageScroll.isConnected) {
            stage.before(stageScroll);
            stageScroll.append(stage);
        } else if (!mobile && stageScroll.isConnected) {
            stageScroll.before(stage);
            stageScroll.remove();
        }
        for (const { element, marker } of entries) {
            const detached = element.matches('.selection-hub-nav') ? compactSelectionNav : mobile;
            if (detached) (mobile ? stageScroll : stage).before(element);
            else marker.after(element);
        }
        const height = document.documentElement.clientHeight;
        const hubNav = compactSelectionNav ? document.querySelector('body > .selection-hub-nav') : null;
        const availableHeight = height - (hubNav ? hubNav.getBoundingClientRect().height : 0);
        const fitScale = Math.min(1, width / 1100, Math.max(0, availableHeight) / 800);
        // Keep characters and controls legible in very small windows; let the stage scroll there.
        const minimumScale = mobile ? 0.6 : 0.7;
        const scale = Math.max(minimumScale, fitScale);
        document.documentElement.style.setProperty('--mobile-game-scale', String(scale));
        document.body.classList.toggle('game-viewport-scroll', scale > fitScale + 0.001);
        const hint = document.getElementById('mobile-orientation-overlay');
        if (hint) hint.style.display = 'none'; // Keep portrait usable; do not block navigation behind a rotation prompt.
    }
    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);
    window.__applyMobileLandscapeFit = fit;
});
