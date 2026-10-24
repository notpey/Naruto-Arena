(function () {
  "use strict";

  var blockRoot = document.getElementById("news-block-editor");
  var changeRoot = document.getElementById("news-change-editor");
  if (!blockRoot || !changeRoot) return;

  var blocks = [];
  var changes = [];
  var catalog = [];
  var onChange = function () {};

  function node(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function button(label, action, index, disabled) {
    var element = node("button", "news-composer-icon-button", label);
    element.type = "button";
    element.dataset.action = action;
    element.dataset.index = String(index);
    element.disabled = !!disabled;
    element.setAttribute("aria-label", label === "↑" ? "Move up" : label === "↓" ? "Move down" : label === "×" ? "Remove" : label);
    return element;
  }

  function field(label, control) {
    var wrapper = node("label", "news-composer-field");
    wrapper.appendChild(node("span", "", label));
    wrapper.appendChild(control);
    return wrapper;
  }

  function select(options, value, fieldName, index) {
    var element = node("select", "news-admin-input");
    element.dataset.field = fieldName;
    element.dataset.index = String(index);
    options.forEach(function (choice) {
      var option = node("option", "", choice.label);
      option.value = choice.value;
      element.appendChild(option);
    });
    element.value = value || "";
    return element;
  }

  function decodeBlock(block) {
    if (!block || block.type === "divider") return { kind: "divider", text: "" };
    var text = String(block.text || "");
    if (text.indexOf("## ") === 0) return { kind: "heading", text: text.slice(3) };
    if (/^- /m.test(text) && text.split("\n").every(function (line) { return line.indexOf("- ") === 0; })) {
      return { kind: "list", text: text.split("\n").map(function (line) { return line.slice(2); }).join("\n") };
    }
    return { kind: "paragraph", text: text };
  }

  function encodeBlock(block) {
    if (block.kind === "divider") return { type: "divider", text: "" };
    var text = String(block.text || "").trim();
    if (!text) return null;
    if (block.kind === "heading") text = "## " + text;
    if (block.kind === "list") text = text.split(/\r?\n/).map(function (line) { return line.trim(); }).filter(Boolean).map(function (line) { return "- " + line; }).join("\n");
    return text ? { type: "paragraph", text: text } : null;
  }

  function renderBlocks() {
    blockRoot.replaceChildren();
    if (!blocks.length) blockRoot.appendChild(node("p", "news-composer-empty", "Start with a paragraph or add a section heading."));
    blocks.forEach(function (block, index) {
      var row = node("div", "news-composer-row");
      var top = node("div", "news-composer-row-top");
      var kinds = [
        { value: "paragraph", label: "Paragraph" },
        { value: "heading", label: "Section heading" },
        { value: "list", label: "Bulleted list" },
        { value: "divider", label: "Divider" }
      ];
      var kindSelect = select(kinds, block.kind, "block-kind", index);
      kindSelect.setAttribute("aria-label", "Block " + (index + 1) + " type");
      top.appendChild(kindSelect);
      var actions = node("div", "news-composer-row-actions");
      actions.appendChild(button("↑", "block-up", index, index === 0));
      actions.appendChild(button("↓", "block-down", index, index === blocks.length - 1));
      actions.appendChild(button("×", "block-remove", index));
      top.appendChild(actions);
      row.appendChild(top);
      if (block.kind !== "divider") {
        var input = node("textarea", "news-admin-textarea news-block-text");
        input.dataset.field = "block-text";
        input.dataset.index = String(index);
        input.rows = block.kind === "heading" ? 2 : 4;
        input.placeholder = block.kind === "heading" ? "Section title" : block.kind === "list" ? "One item per line" : "Write a paragraph…";
        input.setAttribute("aria-label", "Block " + (index + 1) + " " + block.kind + " text");
        input.value = block.text;
        row.appendChild(input);
      }
      blockRoot.appendChild(row);
    });
  }

  function findCharacter(change) {
    return catalog.find(function (item) {
      return item && ((change.characterId && item.characterId === change.characterId) || (!change.characterId && change.characterName && item.name === change.characterName));
    });
  }

  function renderChanges() {
    changeRoot.replaceChildren();
    if (!changes.length) changeRoot.appendChild(node("p", "news-composer-empty", "No character changes in this post. Add one for balance notes or releases."));
    changes.forEach(function (change, index) {
      var row = node("div", "news-composer-row news-change-editor-row");
      var top = node("div", "news-composer-row-top");
      top.appendChild(node("strong", "", "Change " + (index + 1)));
      var actions = node("div", "news-composer-row-actions");
      actions.appendChild(button("↑", "change-up", index, index === 0));
      actions.appendChild(button("↓", "change-down", index, index === changes.length - 1));
      actions.appendChild(button("×", "change-remove", index));
      top.appendChild(actions);
      row.appendChild(top);

      var grid = node("div", "news-change-fields");
      grid.appendChild(field("Type", select([
        { value: "", label: "General" }, { value: "buff", label: "Buff" }, { value: "nerf", label: "Nerf" }, { value: "adjustment", label: "Adjustment" }
      ], change.changeType, "change-type", index)));

      var characterChoices = [{ value: "", label: "Choose character" }].concat(catalog.map(function (item) {
        return { value: item.characterId, label: item.name };
      }));
      if (change.characterId && !characterChoices.some(function (item) { return item.value === change.characterId; })) {
        characterChoices.push({ value: change.characterId, label: change.characterName || change.characterId });
      }
      grid.appendChild(field("Character", select(characterChoices, change.characterId, "change-character", index)));
      var character = findCharacter(change);
      var skillChoices = [{ value: "", label: "No specific skill" }].concat(character && Array.isArray(character.skills) ? character.skills.map(function (item) {
        return { value: item.id, label: item.name };
      }) : []);
      if (change.skillId && !skillChoices.some(function (item) { return item.value === change.skillId; })) {
        skillChoices.push({ value: change.skillId, label: change.skillName || change.skillId });
      }
      grid.appendChild(field("Skill", select(skillChoices, change.skillId, "change-skill", index)));
      row.appendChild(grid);

      var media = node("div", "news-change-media");
      var portrait = character && character.facePicture ? character.facePicture : change.facePicture;
      if (portrait) {
        var image = node("img", "");
        image.src = portrait;
        image.alt = change.characterName || (character && character.name) || "Character portrait";
        media.appendChild(image);
      }
      media.appendChild(node("span", "", portrait ? "Roster portrait added automatically" : "Select a character to add its portrait"));
      row.appendChild(media);

      var description = node("textarea", "news-admin-textarea news-change-description");
      description.dataset.field = "change-text";
      description.dataset.index = String(index);
      description.rows = 3;
      description.placeholder = "Describe what changed and why. Include old and new values when useful.";
      description.value = String(change.text || "").replace(/\\n/g, "\n");
      row.appendChild(field("Change details", description));
      changeRoot.appendChild(row);
    });
  }

  function swap(list, index, direction) {
    var other = index + direction;
    if (index < 0 || other < 0 || other >= list.length) return;
    var item = list[index];
    list[index] = list[other];
    list[other] = item;
  }

  document.querySelectorAll("[data-news-add-block]").forEach(function (control) {
    control.addEventListener("click", function () {
      blocks.push({ kind: control.dataset.newsAddBlock, text: "" });
      renderBlocks();
      onChange();
      var last = blockRoot.lastElementChild;
      if (last) { var field = last.querySelector("textarea"); if (field) field.focus(); }
    });
  });
  document.getElementById("news-add-change").addEventListener("click", function () {
    changes.push({ text: "", changeType: "", characterId: "", characterName: "", skillId: "", skillName: "", facePicture: "", skillimage: "" });
    renderChanges();
    onChange();
    var last = changeRoot.lastElementChild;
    if (last) last.querySelector("select").focus();
  });

  blockRoot.addEventListener("input", function (event) {
    var index = Number(event.target.dataset.index);
    if (event.target.dataset.field === "block-text" && blocks[index]) { blocks[index].text = event.target.value; onChange(); }
  });
  blockRoot.addEventListener("change", function (event) {
    var index = Number(event.target.dataset.index);
    if (event.target.dataset.field === "block-kind" && blocks[index]) {
      blocks[index].kind = event.target.value;
      renderBlocks();
      var replacement = blockRoot.querySelector('[data-field="block-kind"][data-index="' + index + '"]');
      if (replacement) replacement.focus();
      onChange();
    }
  });
  blockRoot.addEventListener("click", function (event) {
    var control = event.target.closest("button[data-action]");
    if (!control) return;
    var index = Number(control.dataset.index);
    var action = control.dataset.action;
    if (action === "block-remove") blocks.splice(index, 1);
    if (action === "block-up") swap(blocks, index, -1);
    if (action === "block-down") swap(blocks, index, 1);
    renderBlocks();
    var nextIndex = action === "block-up" ? index - 1 : action === "block-down" ? index + 1 : Math.min(index, blocks.length - 1);
    var nextControl = blockRoot.querySelector('[data-field="block-kind"][data-index="' + nextIndex + '"]') || document.querySelector('[data-news-add-block="paragraph"]');
    if (nextControl) nextControl.focus();
    onChange();
  });
  changeRoot.addEventListener("input", function (event) {
    var index = Number(event.target.dataset.index);
    if (event.target.dataset.field === "change-text" && changes[index]) { changes[index].text = event.target.value; onChange(); }
  });
  changeRoot.addEventListener("change", function (event) {
    var index = Number(event.target.dataset.index);
    var change = changes[index];
    if (!change) return;
    var fieldName = event.target.dataset.field;
    if (fieldName === "change-type") change.changeType = event.target.value;
    if (fieldName === "change-character") {
      var character = catalog.find(function (item) { return item.characterId === event.target.value; });
      change.characterId = character ? character.characterId : "";
      change.characterName = character ? character.name : "";
      change.facePicture = character ? character.facePicture || "" : "";
      change.skillId = ""; change.skillName = ""; change.skillimage = "";
    }
    if (fieldName === "change-skill") {
      var selectedCharacter = findCharacter(change);
      var skill = selectedCharacter && selectedCharacter.skills && selectedCharacter.skills.find(function (item) { return item.id === event.target.value; });
      change.skillId = skill ? skill.id : "";
      change.skillName = skill ? skill.name : "";
      change.skillimage = skill ? skill.skillimage || "" : "";
    }
    renderChanges();
    var replacement = changeRoot.querySelector('[data-field="' + fieldName + '"][data-index="' + index + '"]');
    if (replacement) replacement.focus();
    onChange();
  });
  changeRoot.addEventListener("click", function (event) {
    var control = event.target.closest("button[data-action]");
    if (!control) return;
    var index = Number(control.dataset.index);
    var action = control.dataset.action;
    if (action === "change-remove") changes.splice(index, 1);
    if (action === "change-up") swap(changes, index, -1);
    if (action === "change-down") swap(changes, index, 1);
    renderChanges();
    var nextIndex = action === "change-up" ? index - 1 : action === "change-down" ? index + 1 : Math.min(index, changes.length - 1);
    var nextControl = changeRoot.querySelector('[data-field="change-type"][data-index="' + nextIndex + '"]') || document.getElementById("news-add-change");
    if (nextControl) nextControl.focus();
    onChange();
  });

  window.ArenaNewsComposer = {
    setOnChange: function (callback) { onChange = callback; },
    setCatalog: function (items) {
      catalog = Array.isArray(items) ? items.slice().sort(function (a, b) { return String(a.name).localeCompare(String(b.name)); }) : [];
      changes.forEach(function (change) {
        var character = findCharacter(change);
        if (!character) return;
        change.characterId = character.characterId;
        change.characterName = character.name;
        change.facePicture = character.facePicture || change.facePicture || "";
        if (change.skillId || change.skillName) {
          var skill = (character.skills || []).find(function (item) { return item.id === change.skillId || item.name === change.skillName; });
          if (skill) { change.skillId = skill.id; change.skillName = skill.name; change.skillimage = skill.skillimage || change.skillimage || ""; }
        }
      });
      renderChanges(); onChange();
    },
    load: function (post) { blocks = (post && Array.isArray(post.blocks) ? post.blocks : []).map(decodeBlock); changes = (post && Array.isArray(post.changes) ? post.changes : []).map(function (entry) { return Object.assign({}, entry); }); renderBlocks(); renderChanges(); onChange(); },
    reset: function () { blocks = [{ kind: "paragraph", text: "" }]; changes = []; renderBlocks(); renderChanges(); onChange(); },
    getBlocks: function () { return blocks.map(encodeBlock).filter(Boolean); },
    getChanges: function () { return changes.filter(function (entry) { return String(entry.text || "").trim(); }).map(function (entry) { return Object.assign({}, entry, { text: String(entry.text).trim().replace(/\r?\n/g, "\\n") }); }); }
  };
  window.ArenaNewsComposer.reset();
}());
