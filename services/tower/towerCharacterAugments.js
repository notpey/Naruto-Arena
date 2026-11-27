// Tower 2.0 character augments: the 40 designs C01-C40. Each targets one exact character
// id and the exact skill (or passive) ids verified against data/characters on 2026-11-22.
// The workbook's provisional ids marked VERIFY_IN_REPO / PASSIVE are resolved here.
// Operational entries run in towerCharacterAugmentEffects.js; `needs` names what the rest require.
// validateCharacterAugments() checks every row against the live roster and is run by the
// registry health test, so a renamed character or skill fails loudly instead of crashing.

// [code, name, tier, characterId, target skill ids ('passive' = the character's passive),
//  intended effect, safeguard, estimate, needs]
const SOURCE = [
    ['C01', 'Clone Coordination', 'rare', 'uzumaki-naruto', ['uzumaki-naruto-shadow-clones'],
        'Whenever Naruto uses Shadow Clones, he gains 1 additional Shadow Clone.', 'Once per use; clone stack cap remains active.', 'Low',
        'a per-skill extra-stack overlay on Shadow Clones'],
    ['C02', 'Rasengan Mastery', 'forbidden', 'uzumaki-naruto', ['uzumaki-naruto-rasengan'],
        'Rasengan requires at least 1 Shadow Clone instead of 2 and deals 10 additional direct damage.', 'Does not change Rasengan stun, cost, or defensive restrictions.', 'Medium',
        'a Tower-only actor-condition override for Rasengan'],
    ['C03', 'Clone Uprising', 'prismatic', 'uzumaki-naruto', ['uzumaki-naruto-uzumaki-naruto-combo'],
        'While Naruto has at least 3 Shadow Clones, Uzumaki Naruto Combo also hits a different random enemy for 50% of its direct damage. After use, Naruto loses 1 Shadow Clone.', 'Secondary hit applies no secondary effects and does not trigger other echoes.', 'High',
        'a damage-only secondary hit and a stack-consumption overlay'],
    ['C04', 'Wire Specialist', 'rare', 'uchiha-sasuke', ['uchiha-sasuke-ninja-wire-trap', 'uchiha-sasuke-dragon-flame-jutsu'],
        'When Ninja Wire Trap triggers its stun, the next Dragon Flame Jutsu Sasuke uses deals 10 additional direct damage.', 'One stored charge; lost if no Dragon Flame is used by end of following turn.', 'Medium',
        'an on-trap-trigger stored charge consumed by one skill id'],
    ['C05', 'Precocious Sharingan', 'forbidden', 'uchiha-sasuke', ['passive', 'uchiha-sasuke-chidori'],
        'Sasuke needs 3 skill uses instead of 4 to awaken Two-Tomoe Sharingan. His first Chidori after awakening deals 10 additional piercing damage.', 'Team 7 passive contributions still count; no double-awakening.', 'High',
        'a Tower-only awakening-threshold override for Two-Tomoe Sharingan'],
    ['C06', 'Chidori Storm', 'prismatic', 'uchiha-sasuke', ['uchiha-sasuke-chidori'],
        'Chidori now deals 35 piercing damage to its primary target and 15 piercing damage to every other enemy, but costs 1 additional Random chakra.', 'Only after Sharingan awakening; secondary hits cannot apply on-hit effects.', 'High',
        'a Tower-only skill overlay (replacement Chidori definition)'],
    ['C07', 'Triage Training', 'rare', 'haruno-sakura', ['haruno-sakura-rudimentary-healing'],
        'Rudimentary Healing restores 10 additional health when its target is below 50 health.', 'Check target\'s health immediately before healing; once per use.', 'Low',
        'a target-health-conditional heal bonus scoped to one skill id'],
    ['C08', 'Inner Sakura Unleashed', 'forbidden', 'haruno-sakura', ['haruno-sakura-inner-mental-overwhelm'],
        'After Inner Sakura awakens, Mental Overwhelm may target an enemy who has not used a stun skill; against such a target it stuns only Chakra and Strategic skills for 1 turn.', 'Against original valid targets, preserve existing stronger effect.', 'High',
        'a Tower-only target-condition override with an alternate effect'],
    ['C09', 'Combat Medic', 'prismatic', 'haruno-sakura', ['haruno-sakura-rudimentary-healing'],
        'Rudimentary Healing may now target an enemy instead of an ally, dealing piercing Chakra damage equal to its current healing amount, capped at 40.', 'On an enemy it never heals; no heal-triggered bonuses activate.', 'High',
        'a Tower-only skill overlay that adds an enemy-target mode'],
    ['C10', 'Nin-Dog Pursuit', 'rare', 'hatake-kakashi', ['hatake-kakashi-summoning-ninja-dogs', 'hatake-kakashi-raikiri'],
        'An enemy damaged by Nin-Dogs Summoning is marked for 1 turn. The next Raikiri Kakashi uses against them deals 10 additional direct damage.', 'Mark is consumed by the bonus; one mark per target.', 'Medium',
        'an on-hit mark consumed by one skill id'],
    ['C11', 'Copy Perfection', 'forbidden', 'hatake-kakashi', ['hatake-kakashi-sharingan-counter'],
        'When Sharingan Insight copies an eligible non-Unique skill, the copied skill remains available for 2 Kakashi turns rather than 1.', 'Does not permit a second simultaneous copied skill or change the copying exclusions.', 'High',
        'a copied-skill duration override'],
    ['C12', 'Living Arsenal', 'prismatic', 'hatake-kakashi', ['hatake-kakashi-sharingan-counter'],
        'The first eligible copied skill Kakashi uses each battle repeats its direct damage against the same target at 50% strength.', 'Repeat does not replay statuses, costs, triggers or copying effects.', 'High',
        'a damage-only echo for copied skills'],
    ['C13', 'Kikaichū Queen', 'rare', 'aburame-shino', ['aburame-shino-female-bug'],
        'Female Bug deals 2 additional affliction damage per chakra spent by its marked target.', 'Only Shino\'s existing Female Bug application receives this bonus.', 'Medium',
        'a per-chakra affliction bonus applied to statuses from one skill id'],
    ['C14', 'Living Hive', 'prismatic', 'aburame-shino', ['aburame-shino-female-bug'],
        'Shino may maintain Female Bug on two different enemies instead of one, but each mark deals 3 affliction damage per chakra spent instead of 5.', 'Cannot mark the same enemy twice; both marks end if Shino dies.', 'High',
        'a Tower-only skill overlay allowing two concurrent marks'],
    ['C15', 'Lotus Discipline', 'forbidden', 'rock-lee', ['rock-lee-front-lotus', 'rock-lee-high-speed-taijutsu'],
        'When Front Lotus defeats an enemy, Lee gains 1 random chakra and his next High Speed Taijutsu costs 1 less Random chakra.', 'Can trigger once per turn, and final skill cost cannot fall below 1.', 'Medium',
        'an on-kill-by-skill-id trigger with a one-use cost reduction'],
    ['C16', 'Unbound Gates', 'prismatic', 'rock-lee', ['rock-lee-remove-training-weights'],
        'While Remove Training Weights is active, Lee no longer suffers its 10-damage penalty, but loses 10 health after each Physical damaging skill he uses.', 'Preserve its existing bypass rules; self-loss cannot trigger on-hit damage effects.', 'High',
        'a Tower-only status overlay for Remove Training Weights'],
    ['C17', 'Desert Harvest', 'rare', 'gaara-of-the-desert', ['gaara-of-the-desert-desert-funeral'],
        'When Desert Funeral consumes at least 3 Sand Flow stacks, Gaara gains 1 random chakra.', 'Once per turn; evaluated after the skill is used.', 'Medium',
        'an on-stack-consumed trigger for one skill id'],
    ['C18', 'Sand Sovereign', 'forbidden', 'gaara-of-the-desert', ['gaara-of-the-desert-sand-sphere'],
        'Sand Sphere grants 15 additional destructible defense and preserves 1 Sand Flow stack when it would consume stacks.', 'Preserve the original ends-on-other-skill rule.', 'Medium',
        'a per-skill destructible-defense bonus and a stack-preservation overlay'],
    ['C19', 'Shukaku Rampage', 'prismatic', 'gaara-of-the-desert', ['gaara-of-the-desert-desert-funeral'],
        'Desert Funeral consumes at most 3 Sand Flow stacks. If Gaara had at least 5 stacks before use, it also deals 15 piercing damage to all other enemies.', 'The bonus area attack does not execute or trigger other on-hit effects.', 'High',
        'a stack-consumption cap overlay and a damage-only area hit'],
    ['C20', 'Poisoned Marionette', 'rare', 'kankuro', ['kankuro-poison-bomb', 'kankuro-puppet-trap'],
        'Poison Bomb deals 5 additional affliction damage to enemies currently affected by Puppet Trap.', 'Bonus once per affected target per skill use.', 'Medium',
        'a per-skill bonus against targets carrying a status from another skill id'],
    ['C21', 'Puppet Theater', 'prismatic', 'kankuro', ['kankuro-puppet-trap'],
        'Kankurō may maintain Puppet Trap on up to two enemies. When a Puppet Trap successfully counters a skill, deal 10 affliction damage to all enemies.', 'Area trigger once per Kankurō turn; preserve original stun/counter limitations.', 'High',
        'a two-concurrent-trap overlay and an on-counter area trigger'],
    ['C22', 'Needle Precision', 'rare', 'haku', ['haku-flying-needles-of-death', 'haku-flying-needles-of-death-mirrors', 'haku-acupuncture', 'haku-acupuncture-mirrors'],
        'Flying Needles of Death deals 10 additional direct damage to enemies currently affected by Acupuncture.', 'Applies to its single-target and mirror-enhanced versions.', 'Medium',
        'a per-skill bonus against targets carrying a status from another skill id'],
    ['C23', 'Fractured Mirrors', 'prismatic', 'haku', ['haku-demonic-mirroring-ice-crystals', 'haku-flying-needles-of-death-mirrors'],
        'During Demonic Mirroring Ice Crystals, Flying Needles of Death becomes single-target and strikes twice for 20 Physical damage per hit instead of its usual area attack.', 'Second hit is damage-only; no double on-hit triggers.', 'High',
        'a Tower-only replacement-skill overlay'],
    ['C24', 'Gentle Fist Precision', 'rare', 'hyuuga-hinata', ['hyuuga-hinata-hinata-gentle-fist'],
        'Hinata Gentle Fist reduces its target\'s non-affliction damage by 15 instead of 10.', 'Duration stays 1 turn; does not stack with itself.', 'Low',
        'a Tower-only status-metadata overlay for one skill id'],
    ['C25', 'Sixty-Four Palms Mastery', 'forbidden', 'hyuuga-hinata', ['hyuuga-hinata-eight-trigrams-64-palms'],
        'Each use of Eight Trigrams 64 Palms grants its next use 5 more healing and damage, stacking up to 15 additional for the battle.', 'Existing skill replacement/awakening conditions remain.', 'High',
        'a per-use growing bonus scoped to one skill id'],
    ['C26', 'Pack Instinct', 'rare', 'inuzuka-kiba', ['inuzuka-kiba-dynamic-air-marking', 'inuzuka-kiba-garouga'],
        'The next Garouga used against an enemy affected by Dynamic Air Marking deals 10 additional direct damage.', 'Consumes the augment\'s bonus but not the base mark.', 'Medium',
        'a one-use per-skill bonus against marked targets'],
    ['C27', 'Twin Fang Assault', 'forbidden', 'inuzuka-kiba', ['inuzuka-kiba-garouga', 'inuzuka-kiba-double-garouga'],
        'The first Garouga Kiba uses each battle repeats 50% of its direct damage against its primary target.', 'Repeat is damage-only; Double Garouga follows its own rules.', 'High',
        'a damage-only echo scoped to one skill id'],
    ['C28', 'Calculated Capture', 'rare', 'nara-shikamaru', ['nara-shikamaru-meditate'],
        'Meditate\'s mark lasts 1 additional turn, up to 6 total turns.', 'Do not extend other Shikamaru mark types.', 'Low',
        'a status-duration bonus scoped to one skill id'],
    ['C29', 'Grand Strategy', 'prismatic', 'nara-shikamaru', ['nara-shikamaru-meditate', 'nara-shikamaru-shadow-imitation'],
        'Meditate now marks all living enemies for 2 turns rather than one enemy for 5 turns. Shadow Imitation deals 10 piercing damage to each marked enemy when applied.', 'Original target exclusions remain; extra damage once per target per use.', 'High',
        'a Tower-only skill overlay changing Meditate\'s targeting'],
    ['C30', 'Marked Refuge', 'rare', 'namikaze-minato', ['namikaze-minato-custom-kunai'],
        'Allies carrying Custom Kunai take 5 less direct damage from the first harmful skill that targets them each turn.', 'While Minato lives; one prevention trigger per marked ally turn.', 'Medium',
        'a once-per-turn damage reduction tied to another skill\'s status'],
    ['C31', 'Thunder God Relay', 'prismatic', 'namikaze-minato', ['namikaze-minato-flying-thunder-god'],
        'When Flying Thunder God hits a marked enemy, it also deals 15 piercing damage to a different marked enemy. When used on an ally, that ally also gains 15 destructible defense.', 'Never repeats teleport/invulnerability; extra damage once per use.', 'High',
        'a Tower-only skill overlay with a damage-only secondary hit'],
    ['C32', 'Stubborn Promise', 'rare', 'uchiha-obito', ['uchiha-obito-piercing-stab'],
        'Piercing Stab deals 5 additional direct damage to enemies currently unable to receive healing.', 'Bonus is separate from the skill\'s existing stacking vulnerability.', 'Low',
        'a per-skill bonus against targets that cannot be healed'],
    ['C33', 'Last Promise', 'prismatic', 'uchiha-obito', ['uchiha-obito-parting-gift'],
        'Parting Gift may target two different living allies simultaneously, permanently giving each 5 additional non-affliction damage; Obito loses 25 health instead of 10.', 'Still once per battle; no effect on dead allies.', 'High',
        'a Tower-only skill overlay with two targets'],
    ['C34', 'Emergency Triage', 'rare', 'nohara-rin', ['nohara-rin-healing-touch'],
        'Healing Touch restores 10 additional health when it removes at least one enemy affliction.', 'Bonus once per use; no overheal conversion unless another scroll provides it.', 'Medium',
        'an on-cleanse-succeeded heal bonus scoped to one skill id'],
    ['C35', 'Mobile Hospital', 'prismatic', 'nohara-rin', ['nohara-rin-medical-kit'],
        'Medical Kit now affects all living allies for 2 turns, restoring 5 health each turn and another 5 when an affected ally uses a Physical or Chakra skill.', 'Extra on-skill heal once per ally per turn; does not stack applications.', 'High',
        'a Tower-only skill overlay changing Medical Kit\'s targets'],
    ['C36', 'The Hidden Mist', 'forbidden', 'momochi-zabuza', ['momochi-zabuza-hidden-mist-technique'],
        'The first direct damaging skill Zabuza uses after Hidden Mist Technique deals 15 additional damage and applies 10 damage reduction to Zabuza for 1 turn.', 'Bonus is lost if not used within 2 Zabuza turns.', 'Medium',
        'an on-skill-use stored charge with an expiry'],
    ['C37', 'Perfect Ambush', 'rare', 'oboro', ['oboro-haze-clones', 'oboro-exploding-kunais', 'oboro-exploding-kunais-haze'],
        'After using Haze Clones, Oboro\'s next Exploding Kunais deals 10 additional direct damage.', 'Expires after 2 Oboro turns; one charge only.', 'Medium',
        'an on-skill-use stored charge consumed by one skill id'],
    ['C38', 'Seal Hunter', 'forbidden', 'shiore-orochimaru', ['shiore-orochimaru-five-elements-seal'],
        'An enemy affected by Five Elements Seal also takes 5 affliction damage whenever they spend 2 or more chakra on a skill.', 'Once per affected enemy per turn; does not cause extra chakra spending.', 'High',
        'a chakra-spent trigger added to another skill\'s status'],
    ['C39', 'Trap Master', 'rare', 'tenten', ['tenten-twin-rising-dragons-trap'],
        'The first enemy to trigger Twin Rising Dragons Trap each battle takes 10 additional piercing damage.', 'Once per battle; preserve existing trap behavior.', 'Medium',
        'an on-trap-trigger damage bonus'],
    ['C40', 'Ninja\'s Sacrifice', 'forbidden', 'umino-iruka', ['umino-iruka-sacrifice'],
        'When Iruka uses Sacrifice, his two allies gain 15 destructible defense for 2 turns.', 'Cannot target dead allies; defense duration is explicit.', 'Medium',
        'an on-skill-use status applied to the user\'s allies'],
];

const slug = (name) => name.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const { CHARACTER_RULES } = require('./towerAugmentRules');

const CHARACTER_AUGMENTS = SOURCE.map(([code, name, tier, characterId, targetSkillIds, effect, safeguard, estimate, needs]) => ({
    id: `${code.toLowerCase()}-${slug(name)}`,
    code,
    name,
    tier,
    scope: 'ninja',
    eligibleCharacterIds: [characterId],
    characterId,
    targetSkillIds,
    effectOriginal: effect,
    safeguard,
    estimate,
    descriptionNormalized: CHARACTER_RULES[code] || null,
    implementationStatus: CHARACTER_RULES[code] ? 'implemented' : 'pending',
    needs: CHARACTER_RULES[code] ? null : `Not operational yet: needs ${needs}.`,
    impl: CHARACTER_RULES[code] ? { engine: 'events', normalized: CHARACTER_RULES[code] } : null,
    tags: ['character'],
}));

// Checks every row against the live roster. Returns [{ code, error }] (empty when healthy).
const validateCharacterAugments = (characters) => {
    const byId = new Map((characters || []).map((character) => [character?.characterId, character]));
    const problems = [];
    CHARACTER_AUGMENTS.forEach((entry) => {
        const character = byId.get(entry.characterId);
        if (!character) {
            problems.push({ code: entry.code, error: `Unknown character id ${entry.characterId}.` });
            return;
        }
        const skillIds = new Set((character.skills || []).map((skill) => skill?.id));
        entry.targetSkillIds.forEach((skillId) => {
            if (skillId === 'passive') {
                if (!character.passive) problems.push({ code: entry.code, error: `${entry.characterId} has no passive.` });
            } else if (!skillIds.has(skillId)) {
                problems.push({ code: entry.code, error: `Unknown skill id ${skillId} on ${entry.characterId}.` });
            }
        });
    });
    return problems;
};

// A character augment may be offered only for an operational, valid entry whose character
// is a living member of the team. With no operational entries this returns [].
const eligibleCharacterAugments = (team, characters) => {
    const invalid = new Set(validateCharacterAugments(characters).map((problem) => problem.code));
    const living = new Set((team || []).filter((member) => !member.dead).map((member) => member.characterId));
    return CHARACTER_AUGMENTS.filter((entry) => entry.implementationStatus === 'implemented' &&
        !invalid.has(entry.code) && living.has(entry.characterId));
};

module.exports = { CHARACTER_AUGMENTS, validateCharacterAugments, eligibleCharacterAugments };
