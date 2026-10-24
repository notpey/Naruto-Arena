(function () {
  "use strict";

  var fallbackAvatar = "found-remaster.png";
  var avatarRequests = new Map();

  function getAvatar(username) {
    var key = String(username || "").trim().toLowerCase();
    if (!key || key === "unknown" || key === "preview" || key === "naruto-arena team") {
      return Promise.resolve(fallbackAvatar);
    }
    if (!avatarRequests.has(key)) {
      var request = window.ArenaSession.fetch("/api/users/" + encodeURIComponent(username) + "/profile", {
        credentials: "same-origin"
      }).then(function (response) {
        if (!response.ok) return null;
        return response.json();
      }).then(function (data) {
        return data && data.user && data.user.profile && data.user.profile.avatarUrl
          ? String(data.user.profile.avatarUrl)
          : fallbackAvatar;
      }).catch(function () {
        return fallbackAvatar;
      });
      avatarRequests.set(key, request);
    }
    return avatarRequests.get(key);
  }

  function create(username) {
    var name = String(username || "Unknown");
    var author = document.createElement("span");
    author.className = "news-author";

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

    getAvatar(name).then(function (url) {
      if (avatar.isConnected) avatar.src = url || fallbackAvatar;
    });
    return author;
  }

  window.ArenaNewsAuthor = { create: create };
}());
