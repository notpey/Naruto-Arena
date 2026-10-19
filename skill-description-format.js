(function () {
  'use strict';

  // Keep display emphasis separate from the canonical skill description.
  const terms = [
    'destructible defense', 'damage reduction', 'piercing damage', 'affliction damage',
    'ignore invulnerability', 'ignores invulnerability', 'invulnerable',
    'chakra', 'cooldown', 'stunned', 'stuns', 'stun', 'countered', 'reflected',
    'healing', 'heals', 'heal', 'damage', 'defense',
    'physical', 'strategic', 'mental', 'affliction', 'piercing'
  ];

  function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  window.renderSkillDescription = function (target, description, skillNames) {
    const source = String(description || '');
    const names = [...new Set((skillNames || []).map(name => String(name || '').trim()).filter(Boolean))];
    const phrases = [...names, ...terms].sort((a, b) => b.length - a.length);
    const matcher = new RegExp('(^|[^\\p{L}\\p{N}])(' + phrases.map(escapeRegex).join('|') + ')(?=$|[^\\p{L}\\p{N}])', 'giu');
    const nameSet = new Set(names.map(name => name.toLocaleLowerCase()));
    const fragment = document.createDocumentFragment();
    let previous = 0;
    for (const match of source.matchAll(matcher)) {
      const start = match.index + match[1].length;
      if (start > previous) fragment.append(document.createTextNode(source.slice(previous, start)));
      const emphasis = document.createElement('strong');
      emphasis.className = nameSet.has(match[2].toLocaleLowerCase()) ? 'skill-ref' : 'skill-term';
      emphasis.textContent = match[2];
      fragment.append(emphasis);
      previous = start + match[2].length;
    }
    fragment.append(document.createTextNode(source.slice(previous)));
    target.replaceChildren(fragment);
  };
})();
