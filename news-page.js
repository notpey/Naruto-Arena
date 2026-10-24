(function () {
  "use strict";
  var archive = document.getElementById("news-archive-list");
  var archiveStatus = document.getElementById("news-archive-status");
  var article = document.getElementById("news-article");
  var toc = document.getElementById("news-toc");
  var search = document.getElementById("news-search");
  var posts = [];
  var selectedId = new URLSearchParams(location.search).get("post") || "";

  function make(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function date(value) {
    if (!value) return "";
    var parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? "" : parsed.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
  }
  function addToc(text, id) {
    var link = make("a", "", text);
    link.href = "#" + id;
    toc.appendChild(link);
  }
  function textBlock(block, body, headingIndex) {
    if (!block) return headingIndex;
    if (block.type === "divider") { body.appendChild(make("hr")); return headingIndex; }
    var value = String(block.text || "").trim();
    if (!value) return headingIndex;
    if (value.indexOf("## ") === 0) {
      var heading = make("h2", "", value.slice(3));
      heading.id = "section-" + (++headingIndex);
      body.appendChild(heading);
      addToc(heading.textContent, heading.id);
      return headingIndex;
    }
    var lines = value.split("\n");
    if (lines.every(function (line) { return line.indexOf("- ") === 0; })) {
      var list = make("ul");
      lines.forEach(function (line) { list.appendChild(make("li", "", line.slice(2))); });
      body.appendChild(list);
      return headingIndex;
    }
    body.appendChild(make("p", "", value));
    return headingIndex;
  }
  function appendChanges(changes, body) {
    if (!changes.length) return;
    var heading = make("h2", "news-changes-heading", "Character and skill changes");
    heading.id = "character-changes";
    body.appendChild(heading);
    addToc(heading.textContent, heading.id);
    var groups = [];
    changes.forEach(function (entry) {
      var key = entry.characterId || entry.characterName || "change-" + groups.length;
      var group = groups.find(function (item) { return item.key === key; });
      if (!group) { group = { key: key, entries: [], name: entry.characterName || "Other changes", face: entry.facePicture || "" }; groups.push(group); }
      group.entries.push(entry);
    });
    groups.forEach(function (group, index) {
      var section = make("section", "news-page-change");
      if (group.face) { var face = make("img"); face.src = group.face; face.alt = group.name; face.loading = "lazy"; section.appendChild(face); }
      else section.classList.add("no-portrait");
      var copy = make("div");
      var name = make("h3", "", group.name);
      name.id = "character-" + index;
      copy.appendChild(name);
      addToc(group.name, name.id);
      group.entries.forEach(function (entry) {
        var item = make("div", "news-page-change-item");
        var head = make("div", "news-page-change-item-head");
        if (entry.changeType) head.appendChild(make("span", "news-page-change-type " + String(entry.changeType).toLowerCase(), entry.changeType));
        if (entry.skillName || entry.skillimage) {
          var skill = make("span", "news-page-skill");
          if (entry.skillimage) { var image = make("img"); image.src = entry.skillimage; image.alt = ""; image.loading = "lazy"; skill.appendChild(image); }
          skill.appendChild(make("span", "", entry.skillName || "Skill"));
          head.appendChild(skill);
        }
        if (head.childNodes.length) item.appendChild(head);
        item.appendChild(make("p", "", String(entry.text || "").replace(/\\n/g, "\n")));
        copy.appendChild(item);
      });
      section.appendChild(copy);
      body.appendChild(section);
    });
  }
  function renderArticle(post) {
    article.replaceChildren();
    toc.replaceChildren();
    if (!post) { article.appendChild(make("p", "news-page-status", "Select an announcement to read.")); return; }
    document.title = post.title + " | Naruto-Arena";
    var back = make("a", "news-article-back", "Browse all announcements");
    back.href = "#news-archive-heading";
    article.appendChild(back);
    article.appendChild(make("h1", "news-article-title", post.title || "Untitled announcement"));
    var meta = make("div", "news-article-meta");
    var published = date(post.updatedAt || post.createdAt);
    meta.appendChild(window.ArenaNewsAuthor.create(post.author || "Unknown"));
    if (published) {
      var publishedDate = make("time", "news-article-date", published);
      publishedDate.dateTime = post.updatedAt || post.createdAt;
      meta.appendChild(publishedDate);
    }
    article.appendChild(meta);
    var body = make("div", "news-article-body");
    var blocks = Array.isArray(post.blocks) && post.blocks.length ? post.blocks : (Array.isArray(post.paragraphs) ? post.paragraphs.map(function (value) { return { type: "paragraph", text: value }; }) : []);
    var headingIndex = 0;
    blocks.forEach(function (block) { headingIndex = textBlock(block, body, headingIndex); });
    appendChanges(Array.isArray(post.changes) ? post.changes : [], body);
    if (!body.childNodes.length) body.appendChild(make("p", "", "This announcement has no content yet."));
    article.appendChild(body);
    document.querySelector(".news-on-page").hidden = !toc.childNodes.length;
  }
  function renderArchive() {
    archive.replaceChildren();
    var term = search.value.trim().toLowerCase();
    var filtered = posts.filter(function (post) { return !term || String(post.title || "").toLowerCase().includes(term); });
    if (!filtered.length && posts.length) { archiveStatus.textContent = "No matching announcements."; return; }
    archiveStatus.textContent = "";
    filtered.forEach(function (post) {
      var control = make("button", "news-archive-link");
      control.type = "button";
      if (post.id === selectedId) control.setAttribute("aria-current", "true");
      control.appendChild(make("span", "news-archive-date", date(post.updatedAt || post.createdAt)));
      control.appendChild(make("span", "news-archive-title", post.title || "Untitled announcement"));
      control.addEventListener("click", function () {
        selectedId = post.id;
        history.replaceState(null, "", "news.html?post=" + encodeURIComponent(selectedId));
        renderArticle(post);
        renderArchive();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      archive.appendChild(control);
    });
  }
  async function load() {
    archiveStatus.textContent = "Loading announcements…";
    delete archiveStatus.dataset.state;
    try {
      var response = await window.ArenaSession.fetch("/api/news", { credentials: "same-origin" });
      var data = await response.json().catch(function () { return {}; });
      if (!response.ok) throw new Error(data.error || "Unable to load announcements.");
      posts = Array.isArray(data.posts) ? data.posts : [];
      if (!posts.length) {
        archiveStatus.textContent = "No announcements have been published yet.";
        article.replaceChildren(make("p", "news-page-status", "Check back for game news and balance updates."));
        return;
      }
      var selected = posts.find(function (post) { return post.id === selectedId; }) || posts[0];
      selectedId = selected.id;
      renderArchive();
      renderArticle(selected);
    } catch (error) {
      archiveStatus.textContent = error.message || "Unable to load announcements.";
      archiveStatus.dataset.state = "error";
      article.replaceChildren(make("p", "news-page-status", "Announcements are unavailable right now."));
      var retry = make("button", "news-page-retry", "Try again");
      retry.type = "button";
      retry.addEventListener("click", load);
      article.appendChild(retry);
    }
  }
  search.addEventListener("input", renderArchive);
  load();
}());
