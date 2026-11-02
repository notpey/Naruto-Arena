const DUAL_PIN = 'mitarashi_anko_dual_pin_debuff';
const DUAL_PIN_SKILL = 'mitarashi-anko-dual-pin';
const TWIN_SNAKES = 'mitarashi-anko-twin-snakes-mutual-death';

module.exports = {
    id: 'mitarashi-anko', characterId: 'mitarashi-anko', name: 'Mitarashi Anko',
    facePicture: 'https://i.imgur.com/98lWH8z.png',
    characterdeescription: 'A fearless special jonin of the Hidden Leaf Village, Anko serves as a proctor during the Chuunin Exams. Once a student of Orochimaru, she bears the Cursed Seal of Heaven and uses the forbidden techniques of her former master against her enemies.',
    requiredMissionId: 'the-survivor-of-the-seal',
    passive: {
        name: "Anko's Cursed Seal", icon: 'https://i.imgur.com/tuJRWvE.png',
        description: 'When Anko dies, her team gains 1 chakra.',
        onOwnerDeathGainTeamChakra: { chakraType: 'random', amount: 1 },
    },
    skills: [
        {
            id: DUAL_PIN_SKILL, name: 'Dual Pin',
            skillimage: 'https://i.imgur.com/IZFaSKq.png',
            skilldescription: 'Anko pins an enemy with her kunai, dealing 5 piercing physical damage. For 1 turn, the target cannot reduce incoming damage or become invulnerable, and takes 5 additional damage from affliction effects. This skill is replaced by Twin Snakes Mutual Death for 1 turn.',
            energy: ['Random'], target: 'single-enemy', damage: 0, cooldown: 2,
            classes: ['Physical', 'Instant'],
            effects: [
                { type: 'damage', amount: 5, scope: 'target', metadata: { ignoreDamageReduction: true } },
                { type: 'apply_status', statusId: DUAL_PIN, duration: 1, scope: 'target',
                    metadata: {
                        harmful: true, turnDurationAnchor: 'source_turn',
                        cannotReduceDamage: true, cannotBecomeInvulnerable: true,
                        damageTakenBonusBySkillClass: { affliction: 5 },
                        tooltipText: 'This character cannot reduce damage or become invulnerable, takes 5 additional damage from affliction effects, and can be targeted by Twin Snakes Mutual Death.',
                    } },
                { type: 'apply_status', statusId: 'mitarashi_anko_dual_pin_replacement', duration: 1, scope: 'self',
                    metadata: { helpful: true, skillReplacements: { [DUAL_PIN_SKILL]: TWIN_SNAKES },
                        tooltipText: 'Dual Pin is replaced by Twin Snakes Mutual Death.' } },
            ],
        },
        {
            id: 'mitarashi-anko-dragon-fire', name: 'Dragon Fire',
            skillimage: 'https://i.imgur.com/Kh95uYY.png',
            skilldescription: 'Anko unleashes a stream of flames, dealing 10 affliction damage to all enemies each turn for 2 turns.',
            energy: ['Ninjutsu'], target: 'all-enemy', damage: 0, cooldown: 2,
            classes: ['Affliction', 'Instant'],
            effects: [{ type: 'apply_status', statusId: 'mitarashi_anko_dragon_fire', duration: 2, scope: 'all-enemy',
                metadata: {
                    harmful: true, afflictionDamage: true, turnEndDamage: 10,
                    turnEndTrigger: 'source_turn', turnDurationAnchor: 'source_turn', triggerOnApply: true,
                    tooltipText: 'This character takes 10 affliction damage each turn from Dragon Fire.',
                } }],
        },
        {
            id: 'mitarashi-anko-hidden-shadow-snake-hand', name: 'Hidden Shadow Snake Hand',
            skillimage: 'https://i.imgur.com/7CtEQFV.png',
            skilldescription: 'Anko unleashes a swarm of snakes from her sleeve, dealing 20 physical damage to an enemy. The target also takes 5 affliction damage each turn for the following 2 turns.',
            energy: ['Ninjutsu', 'Random'], target: 'single-enemy', damage: 0, cooldown: 1,
            classes: ['Physical', 'Affliction', 'Instant'],
            effects: [
                { type: 'damage', amount: 20, scope: 'target', metadata: { skillClasses: ['Physical'] } },
                { type: 'apply_status', statusId: 'mitarashi_anko_hidden_shadow_snake_hand', duration: 2,
                    scope: 'target', metadata: {
                        harmful: true, afflictionDamage: true, turnEndDamage: 5,
                        turnEndTrigger: 'source_turn', turnDurationAnchor: 'source_turn',
                        tooltipText: 'This character takes 5 affliction damage each turn from Hidden Shadow Snake Hand.',
                    } },
            ],
        },
        {
            id: 'mitarashi-anko-quick-reflexes', name: 'Quick Reflexes',
            skillimage: 'https://i.imgur.com/aUjk9L3.png',
            skilldescription: 'Anko swiftly evades incoming attacks, becoming invulnerable for 1 turn.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: 'mitarashi_anko_quick_reflexes', duration: 1, scope: 'self',
                metadata: { helpful: true, invulnerable: true, tooltipText: 'Anko is invulnerable.' } }],
        },
        {
            id: TWIN_SNAKES, name: 'Twin Snakes Mutual Death',
            hiddenFromSelectionViewer: true,
            skillimage: 'https://i.imgur.com/QmkHQ8x.png',
            skilldescription: 'Anko performs a forbidden technique, executing an enemy affected by Dual Pin. Anko is executed afterward.',
            energy: ['Ninjutsu', 'Ninjutsu'], target: 'single-enemy', damage: 0, cooldown: 0,
            targetCondition: { statusId: DUAL_PIN },
            classes: ['Affliction', 'Instant'],
            effects: [
                { type: 'instant_kill', scope: 'target' },
                { type: 'instant_kill', scope: 'self' },
            ],
        },
    ],
};
