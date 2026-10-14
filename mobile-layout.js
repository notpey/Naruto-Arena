document.addEventListener('DOMContentLoaded', function () {
    const stage = document.querySelector('.background, .backgroundingame');
    if (!stage) return;
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
        const heightScale = battle ? document.documentElement.clientHeight / 800 : 1;
        document.documentElement.style.setProperty('--mobile-game-scale', String(Math.min(1, width / 1100, heightScale)));
        for (const { element, marker } of entries) {
            if (mobile) stage.before(element);
            else marker.after(element);
        }
        const hint = document.getElementById('mobile-orientation-overlay');
        if (hint) hint.style.display = 'none'; // Keep portrait usable; do not block navigation behind a rotation prompt.
    }
    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);
    window.__applyMobileLandscapeFit = fit;
});
