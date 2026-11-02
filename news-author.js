(function () {
  "use strict";

  var fallbackAvatar = "found-remaster.png";
  var profileRequests = new Map();

  function isPlayerName(username) {
    var key = String(username || "").trim().toLowerCase();
    return Boolean(key) && key !== "unknown" && key !== "preview" && key !== "naruto-arena team";
  }

  // Resolves to the poster's avatar, or null when no such player exists.
  function getProfile(username) {
    var key = String(username || "").trim().toLowerCase();
    if (!profileRequests.has(key)) {
      var request = window.ArenaSession.fetch("/api/users/" + encodeURIComponent(username) + "/profile", {
        credentials: "same-origin"
      }).then(function (response) {
        if (response.status === 404) return null;
        if (!response.ok) return { avatarUrl: fallbackAvatar };
        return response.json().then(function (data) {
          return {
            avatarUrl: data && data.user && data.user.profile && data.user.profile.avatarUrl
              ? String(data.user.profile.avatarUrl)
              : fallbackAvatar
          };
        });
      }).catch(function () {
        return { avatarUrl: fallbackAvatar };
      });
      profileRequests.set(key, request);
    }
    return profileRequests.get(key);
  }

  function create(username) {
    var name = String(username || "Unknown");
    var linked = isPlayerName(name);
    // Posts by a real player link to that player's profile.
    var author = document.createElement(linked ? "a" : "span");
    author.className = "news-author";
    if (linked) {
      author.href = "profile.html?user=" + encodeURIComponent(name.trim());
      author.title = "View " + name + "'s profile";
    }

    var avatar = document.createElement("img");
    avatar.className = "news-author-avatar";
    avatar.src = fallbackAvatar;
    avatar.alt = "";
    avatar.decoding = "async";
    avatar.addEventListener("error", function () {
      if (avatar.src !== new URL(fallbackAvatar, document.baseURI).href) avatar.src = fallbackAvatar;
    });
    author.appendChild(avatar);

    var label = document.createElement("span");
    label.className = "news-author-name";
    label.textContent = name;
    author.appendChild(label);

    if (linked) {
      getProfile(name).then(function (profile) {
        if (!author.isConnected) return;
        if (!profile) {
          // The account is gone; keep the byline but drop the dead link.
          author.removeAttribute("href");
          author.removeAttribute("title");
          return;
        }
        avatar.src = profile.avatarUrl || fallbackAvatar;
      });
    }
    return author;
  }

  window.ArenaNewsAuthor = { create: create };
}());
