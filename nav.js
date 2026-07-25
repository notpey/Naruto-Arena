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

    // Shared website hero banner rotation. Index has static markup for this;
    // subpages get the same layer injected here so the game client stays untouched.
    document.querySelectorAll(".ca-hero").forEach(function (hero) {
      if (hero.querySelector(".ca-hero-banners")) { return; }

      var banners = document.createElement("div");
      banners.className = "ca-hero-banners";
      banners.setAttribute("aria-hidden", "true");

      ["cloud", "leaf", "sound", "sand"].forEach(function (name) {
        var banner = document.createElement("span");
        banner.className = "ca-hero-banner ca-hero-banner--" + name;
        banners.appendChild(banner);
      });

      hero.insertBefore(banners, hero.firstChild);
    });

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

    window.rebindNavEvents = function() {
      menuItems = Array.prototype.slice.call(navLinks.querySelectorAll(".ca-has-menu"));
      menuItems.forEach(function (item) {
        var toggle = item.querySelector(".ca-nav-toggle");
        var menu = item.querySelector(".ca-nav-menu");
        if (!toggle || !menu || toggle.dataset.bound) { return; }
        toggle.dataset.bound = "true";
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
              setTimeout(function () {
                if (!item.contains(document.activeElement)) { closeItem(item); }
              }, 0);
            }
          });
        });
      });
    };
    
    window.injectAdminNav = function() {
        if (!navLinks || document.querySelector("#admin-nav-item")) return;
        var li = document.createElement("li");
        li.className = "ca-nav-item ca-has-menu";
        li.id = "admin-nav-item";
        li.innerHTML = '<button class="ca-nav-toggle" type="button" aria-haspopup="true" aria-expanded="false" data-nav="admin.html charactereditor.html editmission.html playeraccounts.html newspost.html winrates.html">Admin Tools<span class="ca-caret" aria-hidden="true">&#9662;</span></button><ul class="ca-nav-menu" role="menu" aria-label="Admin Tools"><li role="none"><a role="menuitem" class="ca-nav-menu-link" href="admin.html">Control Panel</a></li><li role="none"><a role="menuitem" class="ca-nav-menu-link" href="charactereditor.html">Character Editor</a></li><li role="none"><a role="menuitem" class="ca-nav-menu-link" href="editmission.html">Mission Editor</a></li><li role="none"><a role="menuitem" class="ca-nav-menu-link" href="playeraccounts.html">Player Accounts</a></li><li role="none"><a role="menuitem" class="ca-nav-menu-link" href="newspost.html">News & Updates</a></li><li role="none"><a role="menuitem" class="ca-nav-menu-link" href="winrates.html">Winrates</a></li></ul>';
        navLinks.appendChild(li);
        window.rebindNavEvents();
    };
    
    window.rebindNavEvents();
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
        var targetWidth = 1100;
        var targetHeight = 800;
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
        // The game client renders in a fixed 1100×800 stage (see style.css
        // .backgroundingame); size the popup to that natural size.
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
        var isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth < 768;
        if (isMobile) {
          return; // Let standard direct navigation proceed on mobile
        }
        var url = gameLink.getAttribute("href") || "selection.html";
        var targetWidth = 1100;
        var targetHeight = 800;
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
        // The game client renders in a fixed 1100×800 stage (see style.css
        // .backgroundingame); size the popup to that natural size.
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
