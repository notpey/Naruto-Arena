// Balance update 0.5: a one-time migration that swaps in the seed version of
// only the skills listed below. Stored skill art and every other skill, the
// passive and admin edits elsewhere on the character are kept.
const BALANCE_UPDATE_0_5_MIGRATION_ID = 'balance-update-0-5-2026-11-21';

const BALANCE_UPDATE_0_5_SKILL_IDS = {
    'gaara-of-the-desert': ['gaara-of-the-desert-desert-funeral'],
    'uchiha-obito': ['uchiha-obito-goukakyuu-no-jutsu'],
    'dosu-kinuta': ['dosu-kinuta-melody-arm-tuning'],
    shigure: ['shigure-sprinkling-needles'],
    'mitarashi-anko': ['mitarashi-anko-dual-pin'],
    baki: ['baki-flak-jacket'],
};

const BALANCE_UPDATE_0_5_CHARACTER_IDS = Object.keys(BALANCE_UPDATE_0_5_SKILL_IDS);

const applyBalanceUpdate05 = (entry, seedEntry) => {
    const skillIds = BALANCE_UPDATE_0_5_SKILL_IDS[entry?.characterId];
    if (!skillIds || !Array.isArray(entry?.skills) || !Array.isArray(seedEntry?.skills)) return entry;
    const seedSkillsById = new Map(seedEntry.skills.map((skill) => [skill?.id, skill]));
    return {
        ...entry,
        skills: entry.skills.map((skill) => {
            const seedSkill = skillIds.includes(skill?.id) ? seedSkillsById.get(skill.id) : null;
            if (!seedSkill) return skill;
            return { ...seedSkill, skillimage: skill.skillimage || seedSkill.skillimage };
        }),
    };
};

module.exports = {
    BALANCE_UPDATE_0_5_MIGRATION_ID,
    BALANCE_UPDATE_0_5_CHARACTER_IDS,
    applyBalanceUpdate05,
};
