(function () {
  'use strict';

  // Keep display emphasis separate from the canonical skill description.
  const termGroups = {
    damage: ['piercing damage', 'affliction damage', 'damage'],
    healing: ['healing', 'heals', 'heal'],
    defense: ['destructible defense', 'damage reduction', 'ignore invulnerability', 'ignores invulnerability', 'invulnerable', 'defense'],
    control: ['stunned', 'stuns', 'stun', 'countered', 'reflected'],
    resource: ['chakra', 'cooldown'],
    class: ['non-strategic', 'non-affliction', 'non-physical', 'non-mental', 'physical', 'strategic', 'mental', 'affliction', 'piercing']
  };
  const termKinds = new Map(Object.entries(termGroups).flatMap(([kind, words]) => words.map(word => [word, kind])));

  function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  window.renderSkillDescription = function (target, description, skillNames) {
    const source = String(description || '');
    const names = [...new Set((skillNames || []).map(name => String(name || '').trim()).filter(Boolean))];
    const phrases = [...names, ...termKinds.keys()].sort((a, b) => b.length - a.length);
    const matcher = new RegExp('(^|[^\\p{L}\\p{N}])(' + phrases.map(escapeRegex).join('|') + ')(?=$|[^\\p{L}\\p{N}])', 'giu');
    const nameSet = new Set(names.map(name => name.toLocaleLowerCase()));
    const fragment = document.createDocumentFragment();
    let previous = 0;
    for (const match of source.matchAll(matcher)) {
      const start = match.index + match[1].length;
      if (start > previous) fragment.append(document.createTextNode(source.slice(previous, start)));
      const emphasis = document.createElement('strong');
      const normalized = match[2].toLocaleLowerCase();
      emphasis.className = nameSet.has(normalized)
        ? 'skill-ref'
        : `skill-term skill-term--${termKinds.get(normalized)}`;
      emphasis.textContent = match[2];
      fragment.append(emphasis);
      previous = start + match[2].length;
    }
    fragment.append(document.createTextNode(source.slice(previous)));
    target.replaceChildren(fragment);
  };
})();
