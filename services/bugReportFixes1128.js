// One-time migration for the November 28 bug reports. Field-level: each fix changes only the
// fields it names, so stored art and any other admin edits on these characters are kept.
//   Gekko Hayate     Dance of the Crescent Moon no longer spends his Crescent Moon charges.
//   Chouji, Neji,    Meat Tank, Heavenly Spin and Hidden Mist show the user and all enemies as
//   Zabuza           targets; Temari's Dust Wind shows everyone. (Who is affected is unchanged.)
//   Zabuza           Hidden Mist Technique ends if Zabuza dies.
//   Oboro            Exploding Kunais' affliction no longer ends when Oboro dies (instant skill).
//   Kin, Mizuki,     Illusion Bell Needles, Kunai Ambush and Textbook Taijutsu are visible
//   Ebisu            counters.
//   Iruka            Sealed Bomb Square Release stuns non-Strategic skills, as its description says
//                    (it listed classes that do not exist, so Chakra skills were never stunned).
const BUG_REPORT_FIXES_1128_MIGRATION_ID = 'bug-report-fixes-2026-11-28';

const HIDDEN_MIST_DEATH_TEXT = 'This skill ends if Zabuza dies.';

const editSkill = (entry, skillId, edit) => ({
    ...entry,
    skills: entry.skills.map((skill) => (skill?.id === skillId ? edit(structuredClone(skill)) : skill)),
});
const editStatusMetadata = (skill, statusId, edit) => {
    (Array.isArray(skill.effects) ? skill.effects : []).forEach((effect) => {
        if (effect?.statusId === statusId) effect.metadata = edit({ ...(effect.metadata || {}) });
    });
    return skill;
};
const setTarget = (target) => (skill) => ({ ...skill, target });
const visibleCounter = (statusId) => (skill) =>
    editStatusMetadata(skill, statusId, (metadata) => ({ ...metadata, visibleCounter: true }));
const keepAfterOboroDies = (skill) => editStatusMetadata(skill, 'oboro_exploding_kunais_affliction', (metadata) => {
    delete metadata.removeOnSourceDeath;
    return metadata;
});

const FIXES = {
    'gekko-hayate': [['gekko-hayate-dance-of-the-crescent-moon', (skill) => ({
        ...skill,
        effects: (skill.effects || []).filter((effect) =>
            !(effect?.type === 'remove_status' && effect?.statusId === 'gekko_hayate_crescent_moon')),
    })]],
    'akimichi-chouji': [['akimichi-chouji-meat-tank', setTarget('self-and-all-enemies')]],
    'neji-hyuuga': [['neji-hyuuga-eight-trigrams-revolving-heaven', setTarget('self-and-all-enemies')]],
    'temari': [['temari-dust-wind', setTarget('all-characters')]],
    'momochi-zabuza': [['momochi-zabuza-hidden-mist-technique', (skill) => {
        ['zabuza_hidden_mist_cost', 'zabuza_hidden_mist_defense'].forEach((statusId) =>
            editStatusMetadata(skill, statusId, (metadata) => ({ ...metadata, removeOnSourceDeath: true })));
        const description = String(skill.skilldescription || '').trim();
        return {
            ...skill,
            target: 'self-and-all-enemies',
            skilldescription: description.includes(HIDDEN_MIST_DEATH_TEXT)
                ? description : `${description} ${HIDDEN_MIST_DEATH_TEXT}`.trim(),
        };
    }]],
    'oboro': [['oboro-exploding-kunais', keepAfterOboroDies], ['oboro-exploding-kunais-haze', keepAfterOboroDies]],
    'tsuchi-kin': [['tsuchi-kin-illusion-bell-needles', visibleCounter('tsuchi_kin_illusion_bell_needles')]],
    'mizuki': [['mizuki-kunai-ambush', visibleCounter('mizuki_kunai_ambush_trap')]],
    'ebisu': [['ebisu-textbook-taijutsu', visibleCounter('ebisu_textbook_counter')]],
    'umino-iruka': [['umino-iruka-sealed-bomb-square-release', (skill) => {
        (Array.isArray(skill.effects) ? skill.effects : []).forEach((effect) => {
            const stun = effect?.metadata?.counterStatusMetadata;
            if (!stun || typeof stun !== 'object' || !Array.isArray(stun.cannotUseSkillClasses)) return;
            delete stun.cannotUseSkillClasses;
            stun.cannotUseNonStrategicSkills = true;
        });
        return skill;
    }]],
};
const BUG_REPORT_FIXES_1128_CHARACTER_IDS = Object.keys(FIXES);

// Applying it twice gives the same result, so a re-run or an already-fixed entry is harmless.
const applyBugReportFixes1128 = (entry) => {
    const fixes = FIXES[entry?.characterId];
    if (!fixes || !Array.isArray(entry?.skills)) return entry;
    return fixes.reduce((next, [skillId, edit]) => editSkill(next, skillId, edit), entry);
};

module.exports = {
    BUG_REPORT_FIXES_1128_MIGRATION_ID,
    BUG_REPORT_FIXES_1128_CHARACTER_IDS,
    applyBugReportFixes1128,
};
