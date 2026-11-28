// Which of a character's skills the skill previews show (selection screen, shop, Characters & Skills).
// A skill marked omitFromSelectionViewer is never shown. An alternate form that carries the same name
// as a skill the character already shows (Haku's area Flying Needles, Lee's High Speed Taijutsu during
// his gates) is the same skill working differently, so it is left out too: its base skill's description
// explains the change. Alternates with their own name (Raikiri, Double Garouga) stay, badged as alternates.
(function (root) {
    'use strict';

    const nameKey = (skill) => String(skill && skill.name || '').trim().toLowerCase();
    const isAlternate = (skill) => Boolean(skill && (skill.hiddenFromSelectionViewer || skill.baseSkillId));

    function previewSkills(skills) {
        const list = (Array.isArray(skills) ? skills : []).filter((skill) => skill && !skill.omitFromSelectionViewer);
        const baseNames = new Set(list.filter((skill) => !isAlternate(skill)).map(nameKey).filter(Boolean));
        return list.filter((skill) => !isAlternate(skill) || !baseNames.has(nameKey(skill)));
    }

    const api = { previewSkills, isAlternateSkill: isAlternate };
    root.ArenaSkillVisibility = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
