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

  // Rules keywords get a one-line definition. "Chakra" and "cooldown" are resources here, not
  // skill classes, so they are left undefined.
  function glossaryFor(term) {
    const display = window.NarutoStatusDisplay;
    if (!display || termKinds.get(term) === 'resource') return '';
    return display.glossaryFor(term) || display.glossaryFor(term.replace(/\s+damage$/, ''));
  }

  // One floating popover for every defined keyword: hover, keyboard focus, or tap.
  let popover = null;
  function showDefinition(el) {
    if (!popover) {
      popover = document.createElement('div');
      popover.className = 'keyword-popover';
      popover.setAttribute('role', 'tooltip');
      // Base look inline so pages without the battle stylesheet still show a readable popover.
      Object.assign(popover.style, {
        position: 'fixed', zIndex: '100000', maxWidth: 'min(280px, calc(100vw - 16px))',
        padding: '7px 9px', borderRadius: '5px', background: '#192933', color: '#e9eeeb',
        border: '1px solid #6e8188', font: '500 12px/1.4 sans-serif', textTransform: 'none',
        pointerEvents: 'none', boxShadow: '0 8px 20px rgba(0, 0, 0, .45)',
      });
      document.body.appendChild(popover);
    }
    popover.textContent = el.dataset.definition;
    popover.style.display = 'block';
    const rect = el.getBoundingClientRect();
    const box = popover.getBoundingClientRect();
    const left = Math.min(window.innerWidth - box.width - 8, Math.max(8, rect.left + rect.width / 2 - box.width / 2));
    const above = rect.top - box.height - 6;
    popover.style.left = `${left}px`;
    popover.style.top = `${above >= 8 ? above : rect.bottom + 6}px`;
  }
  function hideDefinition() {
    if (popover) popover.style.display = 'none';
  }
  const definitionTarget = (event) => event.target instanceof Element
    ? event.target.closest('.has-definition[data-definition]') : null;
  document.addEventListener('pointerover', (event) => {
    const el = definitionTarget(event);
    if (el && event.pointerType !== 'touch') showDefinition(el);
  });
  document.addEventListener('pointerout', (event) => {
    if (definitionTarget(event) && event.pointerType !== 'touch') hideDefinition();
  });
  document.addEventListener('focusin', (event) => {
    const el = definitionTarget(event);
    if (el) showDefinition(el);
  });
  document.addEventListener('focusout', (event) => {
    if (definitionTarget(event)) hideDefinition();
  });
  document.addEventListener('click', (event) => {
    const el = definitionTarget(event);
    if (el) {
      showDefinition(el);
    } else {
      hideDefinition();
    }
  }, true);
  window.addEventListener('scroll', hideDefinition, true);

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
      const definition = nameSet.has(normalized) ? '' : glossaryFor(normalized);
      if (definition) {
        emphasis.classList.add('has-definition');
        emphasis.dataset.definition = definition;
        emphasis.tabIndex = 0;
      }
      fragment.append(emphasis);
      previous = start + match[2].length;
    }
    fragment.append(document.createTextNode(source.slice(previous)));
    target.replaceChildren(fragment);
  };
})();
