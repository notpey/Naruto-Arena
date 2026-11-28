// One-time migration: Dance of the Crescent Moon stopped spending Hayate's charges
// (bug-report-fixes-2026-11-28), but the Crescent Moon tooltip still said it spends them.
// Text-level: only that sentence in Hayate's tooltips changes; everything else is kept.
const HAYATE_TOOLTIP_FIX_MIGRATION_ID = 'gekko-hayate-crescent-moon-tooltip-2026-11-28';
const HAYATE_TOOLTIP_FIX_CHARACTER_IDS = ['gekko-hayate'];
const OLD_TEXT = 'deals 10 additional damage for each and spends them.';
const NEW_TEXT = 'deals 10 additional damage for each.';

const fixText = (value) => {
    if (typeof value === 'string') return value.split(OLD_TEXT).join(NEW_TEXT);
    if (Array.isArray(value)) return value.map(fixText);
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, fixText(entry)]));
    }
    return value;
};
// The sentence only appears in the Crescent Moon tooltips, so the whole character passes through.
const applyHayateTooltipFix = (entry) => (entry?.characterId === 'gekko-hayate' ? fixText(entry) : entry);

module.exports = { HAYATE_TOOLTIP_FIX_MIGRATION_ID, HAYATE_TOOLTIP_FIX_CHARACTER_IDS, applyHayateTooltipFix };
