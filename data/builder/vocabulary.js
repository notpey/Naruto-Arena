// Character Builder catalog: the fixed vocabularies the battle engine understands.
// Every value here was checked against battleLogic.js; the builder only offers these.

const CHAKRA_TYPES = [
    { id: 'Taijutsu', label: 'Taijutsu' },
    { id: 'Bloodline', label: 'Bloodline' },
    { id: 'Ninjutsu', label: 'Ninjutsu' },
    { id: 'Genjutsu', label: 'Genjutsu' },
    { id: 'Random', label: 'Random', description: 'Paid with any chakra the player chooses.' },
];

// Lower-case chakra names used by effects that give, take or remove chakra.
const CHAKRA_EFFECT_TYPES = [
    { id: 'random', label: 'Random' },
    { id: 'taijutsu', label: 'Taijutsu' },
    { id: 'bloodline', label: 'Bloodline' },
    { id: 'ninjutsu', label: 'Ninjutsu' },
    { id: 'genjutsu', label: 'Genjutsu' },
];

// Classes the engine checks. Matching ignores capitals, and "Energy" counts as "Chakra".
// A class written with a trailing * (e.g. "Affliction*") is shown to players but the engine
// does not treat it as that class: use it to mark a class that only part of the skill has.
const SKILL_CLASSES = [
    { id: 'Physical', group: 'damage', description: 'A physical attack. Physical stuns, invulnerability and reductions apply to it.' },
    { id: 'Chakra', group: 'damage', description: 'A chakra attack. Chakra stuns, invulnerability and reductions apply to it.' },
    { id: 'Mental', group: 'damage', description: 'A mental (genjutsu-style) skill.' },
    { id: 'Affliction', group: 'damage', description: 'An affliction skill. Its damage passes ordinary invulnerability when it resolves, if the damage effect also has "Affliction damage" on. (The ignoring of reduction and defense comes from that effect setting.)' },
    { id: 'Piercing', group: 'damage', description: 'Shown to players only. To make damage pierce, turn on "Ignore damage reduction" on the damage effect.' },
    { id: 'Instant', group: 'timing', description: 'Resolves at once instead of lasting over turns.' },
    { id: 'Action', group: 'timing', description: 'Lasts over turns. Shown to players; the lasting effects themselves follow the status "Ongoing class".' },
    { id: 'Control', group: 'timing', description: 'Lasts over turns. Shown to players; the lasting effects themselves follow the status "Ongoing class".' },
    { id: 'Strategic', group: 'kind', description: 'A helpful, defensive or setup skill.' },
    { id: 'Unique', group: 'kind', description: 'Cannot be copied by copy-style counters.' },
    { id: 'Ninjutsu', group: 'kind', description: 'Ninjutsu skill (used by some class-based effects).' },
    { id: 'Passive', group: 'kind', description: 'Used for passive-triggered damage.' },
];

// Who a skill can be used on (skill "target").
const SKILL_TARGETS = [
    { id: 'single-enemy', label: 'One enemy' },
    { id: 'all-enemy', label: 'All enemies' },
    { id: 'self', label: 'Self' },
    { id: 'single-ally', label: 'One ally (not self)' },
    { id: 'self-or-single-ally', label: 'Self or one ally' },
    { id: 'all-allies', label: 'All allies (including self)' },
    { id: 'single-character', label: 'One ally (not self) or one enemy' },
    { id: 'single-target', label: 'Any one character, including self' },
    { id: 'self-or-single-enemy', label: 'Self or one enemy' },
];

// Who one effect lands on (effect "scope"). Only these are resolved by the engine; anything else
// silently falls back to the chosen target.
const EFFECT_SCOPES = [
    { id: 'target', label: 'The chosen target(s)' },
    { id: 'self', label: 'The user' },
    { id: 'all-enemy', label: 'All enemies' },
    { id: 'all-allies', label: 'All allies (including the user)' },
    { id: 'all-units', label: 'Everyone on both teams' },
    { id: 'all-other-enemy', label: 'All enemies except the chosen target' },
    { id: 'other-enemies', label: 'All enemies except the chosen target (same as above)' },
    { id: 'random-enemy', label: 'One random enemy' },
    { id: 'random-other-enemy', label: 'One random enemy other than the chosen target' },
    { id: 'two-random-enemies', label: 'Two random enemies' },
    { id: 'linked-enemy-other-than-target', label: 'Enemies carrying the linked status (see "Linked target status")', advanced: true },
    { id: 'all-enemy-without-source-status', label: 'Enemies that do not carry the excluded status from this user', advanced: true },
    { id: 'controlled-source', label: 'The enemy this user currently controls (see "Controlled status")', advanced: true },
];

// When a status's turns count down.
const DURATION_ANCHORS = [
    { id: '', label: "The owner's turns", description: 'Default: counts down at the end of the turns of the character who has the status.' },
    { id: 'source_turn', label: "The user's turns", description: "Counts down at the end of the turns of the character who applied it. Most skill effects use this, so \"for 1 turn\" means until the user's next turn." },
    { id: 'any_turn', label: 'Every turn', description: "Counts down at the end of every player's turn." },
];

// Ongoing class of a lasting effect.
const ONGOING_CLASSES = [
    { id: '', label: 'None' },
    { id: 'action', label: 'Action', description: "Ends if the user dies. Its turn-by-turn effects skip a turn while the user is stunned or the target is invulnerable." },
    { id: 'control', label: 'Control', description: 'Ends if the user dies or is stunned, or if the target becomes invulnerable (unless "Control ignores invulnerability" is on).' },
];

const RELATIONS = [
    { id: 'self', label: 'The user' },
    { id: 'ally', label: 'An ally' },
    { id: 'enemy', label: 'An enemy' },
];

module.exports = {
    CHAKRA_TYPES,
    CHAKRA_EFFECT_TYPES,
    SKILL_CLASSES,
    SKILL_TARGETS,
    EFFECT_SCOPES,
    DURATION_ANCHORS,
    ONGOING_CLASSES,
    RELATIONS,
};
