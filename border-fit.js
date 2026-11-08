// Shop borders are frames: they should sit around the avatar, overlapping it only slightly.
// Border art varies (padding, thickness), so measure each image's frame and centre its band on
// the avatar's edge, never letting it reach more than a little way outside.
(function () {
    "use strict";
    var OVERLAY_SELECTOR = [
        "#player-avatar-border-overlay",
        ".loadout-avatar-border",
        ".battle-avatar-border",
        ".shop-avatar-border",
        ".daily-spin-avatar-border",
        ".profile-avatar-border"
    ].join(",");
    var ALPHA_THRESHOLD = 96; // Measure the solid frame, not its soft glow.
    var MAX_OUTSIDE = 0.06; // Most a frame may extend past the avatar, as a share of its size.
    var MAX_INSIDE = 0.03; // Most a frame's band covers the avatar while it can still hang outside.
    var SAMPLE_SIZE = 256;
    var MAX_BAND_GAP = 0.03; // Gaps this small (double-line frames) still count as one band.
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
        // From the opening's edge, follow the band outward to where it ends. Measuring the band on
        // the same lines (not the art's outer bounds) keeps corner ornaments from reading as thickness.
        var maxGap = Math.max(1, Math.round(Math.min(w, h) * MAX_BAND_GAP));
        function bandEnd(start, step, limit, isOpaque) {
            var last = start;
            var gap = 0;
            for (var p = start; step < 0 ? p >= limit : p <= limit; p += step) {
                if (isOpaque(p)) {
                    last = p;
                    gap = 0;
                } else if ((gap += 1) > maxGap) {
                    break;
                }
            }
            return last;
        }
        // Walk outward from the centre along several lines; the median ignores flame tips and gaps.
        var hits = { left: [], right: [], top: [], bottom: [] };
        var ends = { left: [], right: [], top: [], bottom: [] };
        [0.4, 0.45, 0.5, 0.55, 0.6].forEach(function (fraction) {
            var row = Math.min(h - 1, Math.round(minY + (maxY - minY) * fraction));
            var col = Math.min(w - 1, Math.round(minX + (maxX - minX) * fraction));
            var inRow = function (x) { return opaque(x, row); };
            var inCol = function (y) { return opaque(col, y); };
            var x, y;
            for (x = cx; x >= minX && !opaque(x, row); x -= 1) {}
            if (x >= minX) {
                hits.left.push((x + 1) / w);
                ends.left.push(bandEnd(x, -1, minX, inRow) / w);
            }
            for (x = cx; x <= maxX && !opaque(x, row); x += 1) {}
            if (x <= maxX) {
                hits.right.push(x / w);
                ends.right.push((bandEnd(x, 1, maxX, inRow) + 1) / w);
            }
            for (y = cy; y >= minY && !opaque(col, y); y -= 1) {}
            if (y >= minY) {
                hits.top.push((y + 1) / h);
                ends.top.push(bandEnd(y, -1, minY, inCol) / h);
            }
            for (y = cy; y <= maxY && !opaque(col, y); y += 1) {}
            if (y <= maxY) {
                hits.bottom.push(y / h);
                ends.bottom.push((bandEnd(y, 1, maxY, inCol) + 1) / h);
            }
        });
        if (!hits.left.length || !hits.right.length || !hits.top.length || !hits.bottom.length) return { outer: outer, inner: null };
        return {
            outer: outer,
            inner: { left: median(hits.left), right: median(hits.right), top: median(hits.top), bottom: median(hits.bottom) },
            band: { left: median(ends.left), right: median(ends.right), top: median(ends.top), bottom: median(ends.bottom) }
        };
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
        // No opening: the art is an overlay drawn over the whole avatar (a haze, floating hearts),
        // so the image itself is the avatar's box. Fitting its visible pixels instead would shift it.
        if (!inner) return { scale: 1, x: 0, y: 0 };
        var band = frame.band;
        var opening = ((inner.right - inner.left) + (inner.bottom - inner.top)) / 2;
        // How far past the opening's edge the avatar reaches on one side, in image units. Each side
        // uses its own band, so a window's title bar or a lower ribbon doesn't shift the other sides.
        // Thin bands are centred on the avatar's edge; thicker ones cover at most MAX_INSIDE of the
        // avatar and hang outside, until the overhang reaches MAX_OUTSIDE and the rest sits inside.
        var insideCap = (MAX_INSIDE * opening) / (1 - 2 * MAX_INSIDE);
        function reach(thickness) {
            var t = Math.max(0, thickness);
            var leastForOverhang = (t - MAX_OUTSIDE * opening) / (1 + 2 * MAX_OUTSIDE);
            return Math.max(leastForOverhang, Math.min(t / 2, insideCap));
        }
        var left = inner.left - reach(inner.left - band.left);
        var right = inner.right + reach(band.right - inner.right);
        var top = inner.top - reach(inner.top - band.top);
        var bottom = inner.bottom + reach(band.bottom - inner.bottom);
        var scale = 2 / ((right - left) + (bottom - top));
        return {
            scale: scale,
            x: 0.5 - ((left + right) / 2) * scale,
            y: 0.5 - ((top + bottom) / 2) * scale
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
            // Percentages resolve inside the box's own outline; widen by that outline so the frame
            // centres on the edge players actually see and covers the default outline.
            var box = img.parentElement ? window.getComputedStyle(img.parentElement) : null;
            var bx = box ? parseFloat(box.borderLeftWidth) || 0 : 0;
            var by = box ? parseFloat(box.borderTopWidth) || 0 : 0;
            var length = function (fraction, px) { return "calc(" + (fraction * 100) + "% + " + px + "px)"; };
            img.style.inset = "auto";
            img.style.maxWidth = "none";
            img.style.maxHeight = "none";
            img.style.width = length(place.scale, 2 * place.scale * bx);
            img.style.height = length(place.scale, 2 * place.scale * by);
            img.style.left = length(place.x, (2 * place.x - 1) * bx);
            img.style.top = length(place.y, (2 * place.y - 1) * by);
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
