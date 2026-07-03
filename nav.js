/* ============================================================
   Naruto-Arena — shared top-nav behaviour
   Dropdown menus (Game Manual / Ladders / Ninja Missions),
   keyboard accessibility, mobile hamburger, and active-state
   detection by current page. No gameplay/system logic here.
   ============================================================ */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") { fn(); }
    else { document.addEventListener("DOMContentLoaded", fn); }
  }

  ready(function () {
    var nav = document.querySelector(".ca-nav");
    var navLinks = document.querySelector(".ca-nav-links");
    if (!nav || !navLinks) { return; }

    var menuItems = Array.prototype.slice.call(navLinks.querySelectorAll(".ca-has-menu"));

    // ── Dropdown open/close ──────────────────────────────────
    function closeAll(except) {
      menuItems.forEach(function (item) {
        if (item === except) { return; }
        item.classList.remove("open");
        var t = item.querySelector(".ca-nav-toggle");
        if (t) { t.setAttribute("aria-expanded", "false"); }
      });
    }
    function openItem(item) {
      closeAll(item);
      item.classList.add("open");
      var t = item.querySelector(".ca-nav-toggle");
      if (t) { t.setAttribute("aria-expanded", "true"); }
    }
    function closeItem(item) {
      item.classList.remove("open");
      var t = item.querySelector(".ca-nav-toggle");
      if (t) { t.setAttribute("aria-expanded", "false"); }
    }

    menuItems.forEach(function (item) {
      var toggle = item.querySelector(".ca-nav-toggle");
      var menu = item.querySelector(".ca-nav-menu");
      if (!toggle || !menu) { return; }
      var links = Array.prototype.slice.call(menu.querySelectorAll('[role="menuitem"]'));

      toggle.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (item.classList.contains("open")) { closeItem(item); }
        else { openItem(item); }
      });

      toggle.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openItem(item);
          if (links[0]) { links[0].focus(); }
        } else if (e.key === "Escape") {
          closeItem(item);
        }
      });

      links.forEach(function (link, idx) {
        link.addEventListener("keydown", function (e) {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            (links[idx + 1] || links[0]).focus();
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            (links[idx - 1] || links[links.length - 1]).focus();
          } else if (e.key === "Escape") {
            e.preventDefault();
            closeItem(item);
            toggle.focus();
          } else if (e.key === "Tab") {
            // allow natural tab-out; close after focus leaves
            setTimeout(function () {
              if (!item.contains(document.activeElement)) { closeItem(item); }
            }, 0);
          }
        });
      });
    });

    // Close on outside click / Esc
    document.addEventListener("click", function (e) {
      if (!navLinks.contains(e.target)) { closeAll(null); }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeAll(null); }
    });

    // ── Start Playing → open game in its own popup-style window ──
    var gameLink = navLinks.querySelector("[data-game-window]");
    if (gameLink) {
      gameLink.addEventListener("click", function (e) {
        var url = gameLink.getAttribute("href") || "selection.html";
        var useRemasterPreview = false;
        try {
          useRemasterPreview = localStorage.getItem("na-selection-remaster-preview") === "enabled";
        } catch (err0) {}
        var targetWidth = useRemasterPreview ? 1100 : 770;
        var targetHeight = useRemasterPreview ? 800 : 560;
        var chromeWidth = Math.max(0, window.outerWidth - window.innerWidth);
        var chromeHeight = Math.max(0, window.outerHeight - window.innerHeight);
        var popupWidth = targetWidth + chromeWidth;
        var popupHeight = targetHeight + chromeHeight;
        var left = Math.max(0, Math.round((window.screen.width - popupWidth) / 2));
        var top = Math.max(0, Math.round((window.screen.height - popupHeight) / 2));
        var features = [
          "width=" + popupWidth,
          "height=" + popupHeight,
          "left=" + left,
          "top=" + top,
          "resizable=yes",
          "scrollbars=no"
        ].join(",");
        // The game client renders in a fixed 770×560 stage (see style.css
        // .background); size the popup to that natural size so it doesn't look
        // stretched. A little extra height covers minor window chrome.
        var win = null;
        try {
          win = window.open(url, "narutoArenaGame", features);
        } catch (err) { win = null; }
        if (win) {
          // popup opened — keep the current site page where it is
          e.preventDefault();
          try {
            win.resizeTo(popupWidth, popupHeight);
            win.moveTo(left, top);
            win.focus();
          } catch (err2) {}
        }
        // if blocked (win is null), default navigation to selection.html proceeds
      });
    }

    // ── Active state by current page ─────────────────────────
    var page = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    if (!page) { page = "index.html"; }
    navLinks.querySelectorAll("[data-nav]").forEach(function (el) {
      var matches = el.getAttribute("data-nav").toLowerCase().split(/\s+/);
      if (matches.indexOf(page) !== -1) {
        el.classList.add("active");
        var parentItem = el.closest(".ca-nav-item");
        if (parentItem) { parentItem.classList.add("is-current"); }
      }
    });

    // ── Ryo shop trigger ──────────────────────────────────────
    var accountEl = nav.querySelector(".ca-nav-account");
    if (accountEl && !nav.querySelector(".ca-nav-shop")) {
      var shopBtn = document.createElement("button");
      shopBtn.type = "button";
      shopBtn.className = "ca-nav-shop";
      shopBtn.setAttribute("data-shop-trigger", "");
      shopBtn.setAttribute("aria-label", "Open the Ryo shop");
      shopBtn.title = "Ryo Shop";
      shopBtn.innerHTML =
        '<span class="ca-nav-shop-coin" aria-hidden="true">両</span>' +
        '<span class="ca-nav-shop-label">Shop</span>' +
        '<span class="ca-nav-shop-balance" data-shop-balance>0</span>';
      accountEl.insertBefore(shopBtn, accountEl.firstChild);
    }

    // ── Mobile hamburger ─────────────────────────────────────
    var inner = nav.querySelector(".ca-nav-inner") || nav;
    var burger = document.createElement("button");
    burger.className = "ca-nav-burger";
    burger.type = "button";
    burger.setAttribute("aria-label", "Toggle navigation menu");
    burger.setAttribute("aria-expanded", "false");
    burger.innerHTML = '<span></span><span></span><span></span>';
    // place the burger as the first child of the nav inner row
    inner.insertBefore(burger, inner.firstChild);

    burger.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = nav.classList.toggle("ca-nav-mobile-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      if (!open) { closeAll(null); }
    });
    // close mobile panel when a real link is chosen
    navLinks.addEventListener("click", function (e) {
      var link = e.target.closest("a");
      if (link) {
        nav.classList.remove("ca-nav-mobile-open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("ca-nav-mobile-open") &&
          !navLinks.contains(e.target) && e.target !== burger && !burger.contains(e.target)) {
        nav.classList.remove("ca-nav-mobile-open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  });
})();
