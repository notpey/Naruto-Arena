// Shop borders are frames: they should sit around the avatar, overlapping it only slightly.
// Border art varies (padding, thickness), so measure each image's frame and place it so its
// inner edge overlaps the avatar by a fraction of the frame's thickness and the rest hangs outside.
(function () {
    "use strict";
    var OVERLAY_SELECTOR = [
        "#player-avatar-border-overlay",
        ".loadout-avatar-border",
        ".battle-avatar-border",
        ".shop-avatar-border",
        ".daily-spin-avatar-border"
    ].join(",");
    var ALPHA_THRESHOLD = 32; // Ignore faint glow when finding edges.
    var OVERLAP = 0.25; // Share of the frame's thickness drawn over the avatar.
    var SAMPLE_SIZE = 256;
    var cache = new Map();

    function median(values) {
        var sorted = values.slice().sort(function (a, b) { return a - b; });
        return sorted.length ? sorted[Math.floor(sorted.length / 2)] : null;
    }

    // Frame geometry as fractions of the image: outer bounds plus the opening in the middle.
    function readFrame(data, w, h) {
        var opaque = function (x, y) { return data[(y * w + x) * 4 + 3] >= ALPHA_THRESHOLD; };
        var minX = w, minY = h, maxX = -1, maxY = -1;
        for (var y = 0; y < h; y += 1) {
            for (var x = 0; x < w; x += 1) {
                if (opaque(x, y)) {
                    if (x < minX) minX = x;
                    if (x > maxX) maxX = x;
                    if (y < minY) minY = y;
                    if (y > maxY) maxY = y;
                }
            }
        }
        if (maxX < 0) return null;
        var outer = { left: minX / w, top: minY / h, right: (maxX + 1) / w, bottom: (maxY + 1) / h };
        var cx = Math.floor((minX + maxX) / 2);
        var cy = Math.floor((minY + maxY) / 2);
        if (opaque(cx, cy)) return { outer: outer, inner: null }; // Solid art, not a frame.
        // Walk outward from the centre along several lines; the median ignores flame tips and gaps.
        var hits = { left: [], right: [], top: [], bottom: [] };
        [0.4, 0.45, 0.5, 0.55, 0.6].forEach(function (fraction) {
            var row = Math.min(h - 1, Math.round(minY + (maxY - minY) * fraction));
            var col = Math.min(w - 1, Math.round(minX + (maxX - minX) * fraction));
            var x, y;
            for (x = cx; x >= minX && !opaque(x, row); x -= 1) {}
            if (x >= minX) hits.left.push((x + 1) / w);
            for (x = cx; x <= maxX && !opaque(x, row); x += 1) {}
            if (x <= maxX) hits.right.push(x / w);
            for (y = cy; y >= minY && !opaque(col, y); y -= 1) {}
            if (y >= minY) hits.top.push((y + 1) / h);
            for (y = cy; y <= maxY && !opaque(col, y); y += 1) {}
            if (y <= maxY) hits.bottom.push(y / h);
        });
        if (!hits.left.length || !hits.right.length || !hits.top.length || !hits.bottom.length) return { outer: outer, inner: null };
        return { outer: outer, inner: { left: median(hits.left), right: median(hits.right), top: median(hits.top), bottom: median(hits.bottom) } };
    }

    function measure(src) {
        if (cache.has(src)) return cache.get(src);
        var pending = new Promise(function (resolve) {
            var probe = new Image();
            probe.crossOrigin = "anonymous";
            probe.onload = function () {
                try {
                    // SVGs with only a viewBox report no natural size; treat them as square.
                    var width = probe.naturalWidth || SAMPLE_SIZE;
                    var height = probe.naturalHeight || SAMPLE_SIZE;
                    if (!width || !height || Math.abs(width / height - 1) > 0.02) return resolve(null);
                    var size = Math.min(SAMPLE_SIZE, width);
                    var canvas = document.createElement("canvas");
                    canvas.width = size;
                    canvas.height = size;
                    var context = canvas.getContext("2d", { willReadFrequently: true });
                    context.drawImage(probe, 0, 0, size, size);
                    resolve(readFrame(context.getImageData(0, 0, size, size).data, size, size));
                } catch (error) {
                    resolve(null); // Unreadable (no CORS) or non-square: keep the default sizing.
                }
            };
            probe.onerror = function () { resolve(null); };
            probe.src = src;
        });
        cache.set(src, pending);
        return pending;
    }

    // Image-space placement: scale `a` (box units per image unit) and offsets for the image's origin.
    function placement(frame) {
        var inner = frame.inner;
        var outer = frame.outer;
        if (!inner) {
            // No opening: line the art's outer bounds up with the avatar.
            var span = Math.max(outer.right - outer.left, outer.bottom - outer.top);
            var solidScale = 1 / span;
            return { scale: solidScale, x: 0.5 - ((outer.left + outer.right) / 2) * solidScale, y: 0.5 - ((outer.top + outer.bottom) / 2) * solidScale };
        }
        var thickness = ((inner.left - outer.left) + (outer.right - inner.right) + (inner.top - outer.top) + (outer.bottom - inner.bottom)) / 4;
        var opening = ((inner.right - inner.left) + (inner.bottom - inner.top)) / 2;
        // The opening plus the overlapping share of the frame on both sides spans the avatar.
        var scale = 1 / (opening + 2 * OVERLAP * thickness);
        return {
            scale: scale,
            x: 0.5 - ((inner.left + inner.right) / 2) * scale,
            y: 0.5 - ((inner.top + inner.bottom) / 2) * scale
        };
    }

    function reset(img) {
        ["left", "top", "width", "height", "inset", "maxWidth", "maxHeight"].forEach(function (key) { img.style[key] = ""; });
    }

    function fit(img) {
        var src = img.getAttribute("src") || "";
        if (!src || img.dataset.borderFit === src) return;
        img.dataset.borderFit = src;
        measure(img.src).then(function (frame) {
            if ((img.getAttribute("src") || "") !== src) return;
            if (!frame) {
                reset(img);
                return;
            }
            var place = placement(frame);
            img.style.inset = "auto";
            img.style.maxWidth = "none";
            img.style.maxHeight = "none";
            img.style.width = (place.scale * 100) + "%";
            img.style.height = (place.scale * 100) + "%";
            img.style.left = (place.x * 100) + "%";
            img.style.top = (place.y * 100) + "%";
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
