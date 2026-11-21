// One-time migration: Shadow Shuriken Technique's trap now turns Ninja Wire Trap into
// Dragon Flame Jutsu on Sasuke's next turn. Only that skill is swapped for its seed
// version; stored skill art and everything else on Sasuke are kept.
const SASUKE_SHADOW_SHURIKEN_FIX_MIGRATION_ID = 'uchiha-sasuke-shadow-shuriken-dragon-flame-2026-11-21';
const SASUKE_SHADOW_SHURIKEN_FIX_CHARACTER_IDS = ['uchiha-sasuke'];
const SHADOW_SHURIKEN_SKILL_ID = 'uchiha-sasuke-shadow-shuriken-technique';

const applySasukeShadowShurikenFix = (entry, seedEntry) => {
    if (!Array.isArray(entry?.skills) || !Array.isArray(seedEntry?.skills)) return entry;
    const seedSkill = seedEntry.skills.find((skill) => skill?.id === SHADOW_SHURIKEN_SKILL_ID);
    if (!seedSkill) return entry;
    return {
        ...entry,
        skills: entry.skills.map((skill) => skill?.id === SHADOW_SHURIKEN_SKILL_ID
            ? { ...seedSkill, skillimage: skill.skillimage || seedSkill.skillimage }
            : skill),
    };
};

module.exports = {
    SASUKE_SHADOW_SHURIKEN_FIX_MIGRATION_ID,
    SASUKE_SHADOW_SHURIKEN_FIX_CHARACTER_IDS,
    applySasukeShadowShurikenFix,
};
