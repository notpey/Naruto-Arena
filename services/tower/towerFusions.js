// Tower 2.0 Scroll Fusion: the 20 recipes F01-F20. A fusion consumes two owned augments
// and grants the result. Ingredients are bound to source codes (A001...), never to names.
// `effect` is the workbook's intended text (kept verbatim); `impl` is what the code runs.
// A recipe is usable only when both ingredients and its result are operational.
//
// Scope policy: every source augment is team-scoped, so both ingredients are always
// team-owned. F01's workbook scope ("Ninja") is normalized to team ownership; see
// docs/tower-augment-decisions.md.

const PROMOTION = { 'common+common': 'rare', 'rare+rare': 'forbidden', 'forbidden+rare': 'prismatic', 'rare+forbidden': 'prismatic' };

const ALL_SKILLS = (amount) => (unit) => ({
    skillHealingBonuses: Object.fromEntries((unit?.skillIds || []).map((id) => [id, amount])),
});

const NEEDS = {
    perTurnFirstSkill: 'a once-per-turn first-qualifying-skill modifier (cost and damage)',
    perTurnFirstPhysicalDot: 'a once-per-character-per-turn on-physical-hit DoT trigger',
    perTurnLowHpBonus: 'a once-per-character-per-turn bonus against low-health enemies',
    nonDamageSkillTrigger: 'an on-use trigger filtered to skills with no damage effect',
    teamAfflictionTrigger: 'a team-wide on-affliction-damage trigger with a per-turn cap',
    consecutiveTurns: 'per-character consecutive-turn tracking plus a capped lifesteal',
    teamSkillCounter: 'a team-wide counter of direct-damage skills with an every-third detonation',
    healAllyTrigger: 'an on-heal-ally trigger and a team-wide low-health trigger',
    stunPrevention: 'a stun-prevention trigger and an on-counter cooldown trigger',
    perTargetConsecutive: 'per-target consecutive-turn damage tracking',
    spendTrigger: 'a team chakra-spent-per-turn trigger',
    teamFocusEcho: 'a same-target-second-hit echo onto a different enemy',
    stunBurnSpread: 'an on-first-stun DoT that spreads once on its victim\'s death',
    turnStartChakraAndLoss: 'a turn-start chakra gain plus a turn-end unspent-chakra loss',
    lastAliveBoon: 'a "only one ally alive" condition with a seeded turn-start boon',
    growthLifestealCap: 'on-damaging-skill growth plus a capped lifesteal',
    twoHitBoon: 'a two-direct-hits-per-turn trigger with a seeded team boon',
};

// [code, name, tier, [ingredient codes], workbook scope, effect, safeguard, estimate, impl | null, needs]
const SOURCE = [
    ['F01', 'Perfect Channeling', 'rare', ['A001', 'A016'], 'Ninja',
        'The first Chakra skill this ninja uses each turn that costs at least 2 chakra costs 1 less Random chakra and deals 10 additional direct damage.',
        'Minimum final cost: 1; one trigger per turn.', 'Medium', null, NEEDS.perTurnFirstSkill],
    ['F02', 'Fortress Doctrine', 'rare', ['A002', 'A010'], 'Team',
        'At the start of each battle, living allies gain 20 destructible defense. Additional destructible defense they receive is increased by 5.',
        'Starting defense is not itself re-triggered by the second bonus.', 'Low', {
            metadata: { passive: true, destructibleDefenseBonusGranted: 5 },
            battleStart: [{ scope: 'each', duration: 99, metadata: {
                destructibleDefensePoints: 20, activeOnlyWithDestructibleDefense: true,
                tooltipText: 'Fortress Doctrine: 20 destructible defense from the start of the battle.' } }],
            normalized: 'Each living ninja starts every battle with 20 destructible defense. Destructible defense your ninjas\' skills grant to your team gains 5 points (the starting defense does not).',
        }],
    ['F03', 'Field Medic', 'rare', ['A004', 'A008'], 'Team',
        'Your healing skills restore 10 additional health. Once per character per battle, the first time they fall below 50 health, heal them for 15 health.',
        'Threshold event checks after damage; cannot trigger on death.', 'Medium', {
            metadata: { passive: true, onFirstHpAtMost: { threshold: 49, heal: 15 } },
            metadataForUnit: ALL_SKILLS(10),
            normalized: 'Your ninjas\' skills that heal restore 10 additional health (per heal effect). Once per battle, the first time each ninja drops to 49 health or less from damage and survives, they heal 15.',
        }],
    ['F04', 'Venomcraft', 'rare', ['A013', 'A018'], 'Team',
        'Once per character per turn, the first Physical skill to deal direct damage applies 5 affliction damage at the end of the target\'s turn for 2 turns.',
        'Reapplying refreshes duration; never creates additional stacks.', 'Medium', null, NEEDS.perTurnFirstPhysicalDot],
    ['F05', 'Finisher\'s Instinct', 'rare', ['A003', 'A020'], 'Team',
        'Once per character per turn, their first damaging skill against an enemy below 50 health deals 15 additional direct damage.',
        'No bonus from repeated scroll-triggered damage.', 'Low', null, NEEDS.perTurnLowHpBonus],
    ['F06', 'Defensive Discipline', 'rare', ['A007', 'A014'], 'Team',
        'Whenever a character uses a non-damaging skill, they gain 10 damage reduction for 1 turn. This increases to 15 while they have less than 50 health.',
        'Damage reduction expires at end of their next turn; no permanent stacking.', 'Low', null, NEEDS.nonDamageSkillTrigger],
    ['F07', 'Parasitic Chakra', 'forbidden', ['A021', 'A033'], 'Team',
        'Once per team per turn, damaging an enemy with affliction grants 1 random chakra and reduces that enemy\'s healing received by 50% for 1 turn.',
        'Damage-over-time ticks may trigger, but only once per team turn.', 'Medium', null, NEEDS.teamAfflictionTrigger],
    ['F08', 'Crimson Rhythm', 'forbidden', ['A022', 'A028'], 'Team',
        'Consecutive turns using a direct-damage skill grant the acting ninja 5 additional direct damage, up to 25. They heal for 20% of direct damage dealt.',
        'Healing capped at 15 per ninja per turn; resets after a turn without a damaging skill.', 'High', null, NEEDS.consecutiveTurns],
    ['F09', 'Storm of Paper', 'forbidden', ['A024', 'A027'], 'Team',
        'Every third direct-damaging skill used by your team detonates for 15 direct damage to all enemies.',
        'Triggered explosions cannot count toward the next detonation.', 'Medium', null, NEEDS.teamSkillCounter],
    ['F10', 'Guardian\'s Renewal', 'forbidden', ['A039', 'A030'], 'Team',
        'Whenever a ninja heals an ally, both gain 15 destructible defense. Once per ally per battle, falling below 25 health heals them for 25.',
        'No recursive healing triggers; death prevention is not implied.', 'Medium', null, NEEDS.healAllyTrigger],
    ['F11', 'Perfect Reflex', 'forbidden', ['A035', 'A025'], 'Team',
        'Each ninja ignores the first full stun that would affect them per battle. Their first successful counter each turn reduces a non-invulnerability cooldown by 1.',
        'Cooldown cannot fall below 0; copying cannot be refreshed.', 'High', null, NEEDS.stunPrevention],
    ['F12', 'Relentless Pursuit', 'forbidden', ['A043', 'A050'], 'Team',
        'Each consecutive turn your team damages the same enemy, direct damage against them increases by 10%, up to 40%.',
        'One stack per target per team turn; reset on missed turn.', 'High', null, NEEDS.perTargetConsecutive],
    ['F13', 'Chakra Reactor', 'forbidden', ['A031', 'A037'], 'Team',
        'Once per team turn, spending 3 chakra in a turn refunds 1 random chakra and deals 10 piercing damage to a random enemy.',
        'Refund/bonus damage cannot trigger additional spending or damage hooks.', 'High', null, NEEDS.spendTrigger],
    ['F14', 'Blood Moon Contract', 'prismatic', ['A077', 'A036'], 'Team',
        'Living allies deal 25% more direct damage. Below 30 health, their bonus becomes 60%, but they cannot receive healing while below that threshold.',
        'Health thresholds snapshot before action; cannot bypass minimum death conditions.', 'High', {
            metadata: {
                towerDirectDamagePercent: 25,
                healReceivedMultiplierWhenOwnerCurrentHpAtMostThreshold: 29,
                healReceivedMultiplierWhenOwnerCurrentHpAtMost: 0,
            },
            battleStart: [{ scope: 'each', duration: 99, metadata: {
                towerDirectDamagePercent: 35, activeWhileOwnerCurrentHpAtMost: 29, permanent: true, cannotBeCleansed: true,
                tooltipText: 'Blood Moon Contract: below 30 health, direct damage is raised to +60%.' } }],
            normalized: 'Your ninjas\' direct (non-affliction) skill hits deal 25% more damage, rising to 60% while the attacker is at 29 health or less (checked when each hit resolves); a ninja at 29 health or less cannot receive healing.',
        }],
    ['F15', 'Thousand Shadows', 'prismatic', ['A076', 'A046'], 'Team',
        'Once per team turn, when a second ally damages the same enemy, the second hit echoes for 50% of its direct damage against a different random enemy.',
        'Echo never copies statuses, stuns, or on-hit triggers.', 'High', null, NEEDS.teamFocusEcho],
    ['F16', 'Infernal Nightmare', 'prismatic', ['A059', 'A040'], 'Team',
        'The first enemy stunned by your team each battle is burned for 10 affliction damage at the end of their turn for 3 turns; the burn spreads once to another enemy if its victim dies.',
        'Burn is unique per target; spreading cannot cascade.', 'High', null, NEEDS.stunBurnSpread],
    ['F17', 'Chaotic Wellspring', 'prismatic', ['A063', 'A042'], 'Team',
        'At the start of each player turn, gain 2 random chakra. At its end, lose up to 1 random unspent chakra and each living ally takes 5 health loss.',
        'Self-damage bypasses damage reduction but not death rules; generated chakra capped.', 'Medium', null, NEEDS.turnStartChakraAndLoss],
    ['F18', 'Undying Legend', 'prismatic', ['A070', 'A038'], 'Team',
        'When only one ninja remains alive, at the start of each player turn they gain one randomly selected boon for 1 turn: +40 direct damage, 30 damage reduction, or 20 health recovery.',
        'One boon active at a time; deterministic seeded roll; stops when team is no longer alone.', 'High', null, NEEDS.lastAliveBoon],
    ['F19', 'Crimson Gate', 'prismatic', ['A052', 'A022'], 'Team',
        'Each living ninja gains 10 additional direct damage after using a damaging skill, up to 30. They heal for 25% of direct damage, but lose 10 health at the end of their turn.',
        'Healing cap 15 per ninja turn; self-health loss cannot trigger lifesteal.', 'High', null, NEEDS.growthLifestealCap],
    ['F20', 'Mutation Protocol', 'prismatic', ['A078', 'A028'], 'Team',
        'After your team uses two direct-damaging skills in one turn, randomly gain one team-wide boon for the next turn: +15 direct damage, 15 damage reduction, or 10 turn-end healing.',
        'One boon active at a time, seeded roll, at most one activation per team turn.', 'Medium', null, NEEDS.twoHitBoon],
];

const slug = (name) => name.toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Results run by the battle-event engine (towerAugmentEffects.js).
const { FUSION_RULES } = require('./towerAugmentRules');

const RECIPES = SOURCE.map(([code, name, tier, ingredients, workbookScope, effect, safeguard, estimate, staticImpl, needs]) => {
    const impl = staticImpl || (FUSION_RULES[code] ? { engine: 'events', normalized: FUSION_RULES[code] } : null);
    return {
        id: code,
        resultId: `${code.toLowerCase()}-${slug(name)}`,
        code,
        name,
        tier,
        ingredients,
        workbookScope,
        scope: 'team',
        effectOriginal: effect,
        safeguard,
        estimate,
        descriptionNormalized: impl ? impl.normalized : null,
        implementationStatus: impl ? 'implemented' : 'pending',
        needs: impl ? null : `Result not operational yet: needs ${needs}.`,
        impl: impl || null,
    };
});

const RECIPES_BY_ID = new Map(RECIPES.map((recipe) => [recipe.id, recipe]));
const RECIPES_BY_RESULT = new Map(RECIPES.map((recipe) => [recipe.resultId, recipe]));

const expectedTier = (tiers) => PROMOTION[tiers.join('+')] || null;

module.exports = { RECIPES, RECIPES_BY_ID, RECIPES_BY_RESULT, PROMOTION, expectedTier };
