// Shop borders are often drawn on a canvas with transparent padding around the frame.
// This scales every border overlay so the visible frame meets the avatar's edges.
(function () {
    "use strict";
    var OVERLAY_SELECTOR = [
        "#player-avatar-border-overlay",
        ".loadout-avatar-border",
        ".battle-avatar-border",
        ".shop-avatar-border",
        ".daily-spin-avatar-border"
    ].join(",");
    var ALPHA_THRESHOLD = 32; // Ignore faint glow when finding the frame's edge.
    var MIN_PADDING = 0.03; // Frames already filling 97% of the image are left alone.
    var SAMPLE_SIZE = 256;
    var cache = new Map();

    // Visible bounds of the image as fractions of its width and height, or null if unreadable.
    function measure(src) {
        if (cache.has(src)) return cache.get(src);
        var pending = new Promise(function (resolve) {
            var probe = new Image();
            probe.crossOrigin = "anonymous";
            probe.onload = function () {
                try {
                    var width = probe.naturalWidth;
                    var height = probe.naturalHeight;
                    if (!width || !height) return resolve(null);
                    var scale = Math.min(1, SAMPLE_SIZE / Math.max(width, height));
                    var w = Math.max(1, Math.round(width * scale));
                    var h = Math.max(1, Math.round(height * scale));
                    var canvas = document.createElement("canvas");
                    canvas.width = w;
                    canvas.height = h;
                    var context = canvas.getContext("2d", { willReadFrequently: true });
                    context.drawImage(probe, 0, 0, w, h);
                    var data = context.getImageData(0, 0, w, h).data;
                    var minX = w, minY = h, maxX = -1, maxY = -1;
                    for (var y = 0; y < h; y += 1) {
                        for (var x = 0; x < w; x += 1) {
                            if (data[(y * w + x) * 4 + 3] >= ALPHA_THRESHOLD) {
                                if (x < minX) minX = x;
                                if (x > maxX) maxX = x;
                                if (y < minY) minY = y;
                                if (y > maxY) maxY = y;
                            }
                        }
                    }
                    if (maxX < 0) return resolve(null);
                    resolve({ x: minX / w, y: minY / h, w: (maxX - minX + 1) / w, h: (maxY - minY + 1) / h, aspect: width / height });
                } catch (error) {
                    resolve(null); // Unreadable (no CORS): keep the default sizing.
                }
            };
            probe.onerror = function () { resolve(null); };
            probe.src = src;
        });
        cache.set(src, pending);
        return pending;
    }

    function reset(img) {
        ["left", "top", "width", "height", "inset", "maxWidth", "maxHeight"].forEach(function (key) { img.style[key] = ""; });
        delete img.dataset.borderFit;
    }

    function fit(img) {
        var src = img.getAttribute("src") || "";
        if (!src || img.dataset.borderFit === src) return;
        img.dataset.borderFit = src;
        measure(img.src).then(function (bounds) {
            if ((img.getAttribute("src") || "") !== src) return;
            // Only square art maps cleanly onto the square avatar; anything else keeps default sizing.
            if (!bounds || Math.abs(bounds.aspect - 1) > 0.02 || Math.max(bounds.w, bounds.h) > 1 - MIN_PADDING) {
                reset(img);
                img.dataset.borderFit = src;
                return;
            }
            // Uniform scale so the frame's larger side fills the box, centered on the frame.
            var scale = 1 / Math.max(bounds.w, bounds.h);
            img.style.inset = "auto";
            img.style.maxWidth = "none";
            img.style.maxHeight = "none";
            img.style.width = (scale * 100) + "%";
            img.style.height = (scale * 100) + "%";
            img.style.left = (50 - (bounds.x + bounds.w / 2) * scale * 100) + "%";
            img.style.top = (50 - (bounds.y + bounds.h / 2) * scale * 100) + "%";
        });
    }

    function scan(root) {
        if (!root || root.nodeType !== 1) return;
        if (root.matches && root.matches(OVERLAY_SELECTOR)) fit(root);
        if (root.querySelectorAll) root.querySelectorAll(OVERLAY_SELECTOR).forEach(fit);
    }

    new MutationObserver(function (records) {
        records.forEach(function (record) {
            if (record.type === "attributes") {
                if (record.target.matches && record.target.matches(OVERLAY_SELECTOR)) fit(record.target);
                return;
            }
            record.addedNodes.forEach(scan);
        });
    }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["src"] });

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { scan(document.body); });
    else scan(document.body);

    window.fitBorderOverlay = fit;
})();
