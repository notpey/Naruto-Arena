// Older matches were initialized against the full roster, while team indices
// refer to the active roster. Replace only mismatched passive statuses; keep
// health, cooldowns, and every other live status as they are.
function reconcileUnitPassive(unit, characters, buildInitialBoard) {
    if (!unit || unit.alive === false || Number(unit.hp) <= 0) return false;
    if (!Array.isArray(unit.state?.statuses)) return false;
    const character = characters?.[unit.rosterIndex];
    if (!character) return false;

    const passive = character.passive;
    const expectedId = passive?.name
        ? `${character.characterId || character.id || ''}_${passive.name}`
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')
        : '';
    const current = unit.state.statuses.filter((status) => status?.metadata?.passive === true);
    if (expectedId
        && current.length === 1
        && current[0].id === expectedId
        && current[0].metadata.statusIcon === (passive.icon || '')) {
        return false;
    }
    if (!expectedId && current.length === 0) return false;

    const otherStatuses = unit.state.statuses.filter((status) => status?.metadata?.passive !== true);
    if (!expectedId) {
        unit.state.statuses = otherStatuses;
        return true;
    }
    const initialized = buildInitialBoard(
        [{ username: 'passive-repair', team: [unit.rosterIndex] }],
        characters
    );
    const replacement = initialized['passive-repair']?.[0]?.state?.statuses
        ?.find((status) => status?.metadata?.passive === true);
    if (!replacement) return false;
    unit.state.statuses = [replacement, ...otherStatuses];
    return true;
}

module.exports = { reconcileUnitPassive };
