const PIT_TRAP = 'nohara_rin_pit_trap';
const pitTrapMetadata = (turnEndDamage) => ({
    harmful: true, invisible: true, hideTooltipFromUnitOwner: true,
    turnEndDamage, turnEndSkillClasses: ['Physical'], ignoreTargetDamageReduction: true,
    tooltipText: 'This character takes 15 piercing physical damage at the end of their turn. If they use a physical skill this turn, the trap deals 10 additional damage.',
    tooltipTextTemplate: 'This character takes {turnEndDamage} piercing physical damage at the end of their turn. If they use a physical skill this turn, the trap deals 10 additional damage.',
});

module.exports = {
    id: 'nohara-rin',
    characterId: 'nohara-rin',
    name: 'Nohara Rin',
    facePicture: 'https://i.imgur.com/2Yeevq9.png',
    characterdeescription: "A chuunin medical ninja assigned to Team Minato, Rin is a kind and resourceful shinobi who puts her teammates' safety first. She uses her medical ninjutsu to heal allies and carefully placed traps to catch enemies off guard.",
    passive: {
        name: 'Caretaker',
        icon: 'https://i.imgur.com/dRvfEpT.png',
        description: "Rin's skills heal an additional 5 health if the target has 50 health or less.",
        healBonusWhenTargetHpAtMost: { threshold: 50, amount: 5 },
    },
    skills: [
        {
            id: 'nohara-rin-pit-trap', name: 'Pit Trap',
            skillimage: 'https://i.imgur.com/up1Gi06.png',
            skilldescription: 'Rin places an invisible trap on an enemy. At the end of their turn, the trap deals 15 piercing physical damage. If that enemy uses a physical skill this turn, the trap deals 10 additional damage. Rin has 10 damage reduction during this skill.',
            energy: ['Genjutsu'], target: 'single-enemy', damage: 0, cooldown: 0,
            classes: ['Physical', 'Instant'],
            effects: [
                // The trap springs at the end of the trapped enemy's next turn, then ends.
                { type: 'apply_status', statusId: PIT_TRAP, duration: 1, scope: 'target', metadata: pitTrapMetadata(15) },
                // The first physical skill the trapped enemy uses adds 10 to the same hit.
                { type: 'apply_status', statusId: `${PIT_TRAP}_trigger`, duration: 1, scope: 'target', metadata: {
                    harmful: true, invisible: true, hideTooltip: true,
                    onOwnerUseSkillTrigger: true, onOwnerUseSkillClassesAny: ['Physical'],
                    onOwnerUseSkillEffects: [
                        { type: 'apply_status', statusId: PIT_TRAP, duration: 1, metadata: {
                            ...pitTrapMetadata(10), mergeNumericAddKeys: ['turnEndDamage'],
                        } },
                    ],
                } },
                // Lasts exactly as long as the trap: through the trapped enemy's turn.
                { type: 'apply_status', statusId: `${PIT_TRAP}_guard`, duration: 1, scope: 'self', metadata: {
                    helpful: true, invisible: true, hideTooltipFromEnemy: true,
                    damageReductionFlat: 10, turnDurationAnchor: 'any_turn',
                    tooltipText: 'This character has 10 damage reduction while Pit Trap is set.',
                } },
            ],
        },
        {
            id: 'nohara-rin-healing-touch', name: 'Healing Touch',
            skillimage: 'https://i.imgur.com/Hywvj4g.png',
            skilldescription: 'Rin heals an ally for 20 health and removes enemy afflictions from them.',
            energy: ['Ninjutsu'], target: 'single-ally', damage: 0, cooldown: 0,
            classes: ['Strategic', 'Instant'],
            effects: [
                { type: 'heal', amount: 20, scope: 'target' },
                { type: 'cleanse_statuses', scope: 'target', sourceRelation: 'enemy', metadataAny: ['afflictionDamage'] },
            ],
        },
        {
            id: 'nohara-rin-medical-kit', name: 'Medical Kit',
            skillimage: 'https://i.imgur.com/gfTD7t7.png',
            skilldescription: 'Rin heals an ally for 10 health each turn for 3 turns. Whenever that ally uses a physical or chakra skill during this time, they heal an additional 10 health.',
            energy: ['Random', 'Random'], target: 'single-ally', damage: 0, cooldown: 3,
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: 'nohara_rin_medical_kit', duration: 3, scope: 'target', metadata: {
                helpful: true, turnEndHealFlat: 10, turnEndTrigger: 'source_turn', triggerOnApply: true,
                turnDurationAnchor: 'source_turn',
                onOwnerUseSkillTrigger: true, persistOnOwnerUseSkillTrigger: true,
                onOwnerUseSkillClassesAny: ['Physical', 'Chakra'],
                onOwnerUseSkillEffects: [{ type: 'heal', amount: 10 }],
                tooltipText: 'This character heals 10 health each turn. Whenever they use a physical or chakra skill, they heal an additional 10 health.',
            } }],
        },
        {
            id: 'nohara-rin-flee', name: 'Rin Flee',
            skillimage: 'https://i.imgur.com/LqYCr2e.png',
            skilldescription: 'Rin becomes invulnerable for 1 turn.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: 'nohara_rin_flee', duration: 1, scope: 'self', metadata: {
                helpful: true, invulnerable: true, tooltipText: 'This character is invulnerable.',
            } }],
        },
    ],
};
