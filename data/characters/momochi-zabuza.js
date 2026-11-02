const KUBIKIRIBOCHO = 'momochi-zabuza-kubikiribocho';

module.exports = {
    id: 'momochi-zabuza', characterId: 'momochi-zabuza', name: 'Zabuza Momochi',
    facePicture: 'https://i.imgur.com/8OoPNPv.png', requiredMissionId: 'devotion',
    characterdeescription: 'One of the Seven Ninja Swordsmen of the Mist, Zabuza Momochi is a ruthless missing-nin whose mastery of silent assassination earned him the title Demon of the Hidden Mist. Armed with the massive Kubikiribōchō, he terrorizes his opponents through concealment, overwhelming force, and deadly Water Release techniques.',
    passive: { name: 'Silent Killing', icon: 'https://i.imgur.com/9eJkbJa.png',
        description: "Zabuza's skills ignore invulnerability and deal 5 additional damage to invulnerable targets." },
    startStatuses: [{
        statusId: 'zabuza_silent_killing', duration: 99,
        metadata: {
            helpful: true, permanent: true, cannotBeCleansed: true, fromPassive: true, hideTooltip: true,
            ignoreEnemyInvulnerability: true,
            bonusDamageAgainstInvulnerableTargets: 5,
        },
    }],
    skills: [
        {
            id: KUBIKIRIBOCHO, name: 'Kubikiribōchō',
            skillimage: 'https://i.imgur.com/aZfxDVs.png',
            skilldescription: 'Zabuza deals 30 physical damage to one enemy. For the 2 turns after Hidden Mist Technique, this skill deals 10 additional damage.',
            energy: ['Taijutsu', 'Random'], target: 'single-enemy', damage: 0, cooldown: 1,
            classes: ['Physical', 'Instant'], effects: [{ type: 'damage', amount: 30, scope: 'target' }],
        },
        {
            id: 'momochi-zabuza-water-prison-technique', name: 'Water Prison Technique',
            skillimage: 'https://i.imgur.com/dT988nl.png',
            skilldescription: "Zabuza stuns one enemy's physical and chakra skills for 2 turns. During this time, the target is invulnerable to both allied and enemy skills.",
            energy: ['Ninjutsu', 'Random'], target: 'single-enemy', damage: 0, cooldown: 3,
            classes: ['Chakra', 'Control'], effects: [
                { type: 'apply_status', statusId: 'zabuza_water_prison', duration: 2, scope: 'target',
                    metadata: { harmful: true, ongoingClass: 'control', turnDurationAnchor: 'source_turn',
                        cannotUseSkillClasses: ['physical', 'chakra'],
                        invulnerable: true, invulnerableToHelpfulSkills: true,
                        // The prison's own invulnerability must not break the prison.
                        controlIgnoresOwnerInvulnerability: true,
                        tooltipText: 'This character cannot use physical or chakra skills and is invulnerable to allied and enemy skills.' } },
            ],
        },
        {
            id: 'momochi-zabuza-hidden-mist-technique', name: 'Hidden Mist Technique',
            skillimage: 'https://i.imgur.com/IkZwEbi.png',
            skilldescription: "For 2 turns, all enemies' Physical and Chakra skills cost 1 additional random chakra and Zabuza gains 5 damage reduction. For the following 2 turns, Kubikiribōchō deals 10 additional damage.",
            energy: ['Genjutsu'], target: 'self', damage: 0, cooldown: 3, ignoreInvulnerability: true,
            classes: ['Strategic', 'Instant'], effects: [
                { type: 'apply_status', statusId: 'zabuza_hidden_mist_cost', duration: 2, scope: 'all-enemy',
                    metadata: { harmful: true, randomCostIncreaseForSkillClasses: { physical: 1, chakra: 1, energy: 1, ninjutsu: 1 },
                        tooltipText: 'Physical and Chakra skills cost 1 additional random chakra from Hidden Mist Technique.' } },
                { type: 'apply_status', statusId: 'zabuza_hidden_mist_defense', duration: 2, scope: 'self',
                    metadata: { helpful: true, damageReductionFlat: 5,
                        onExpireApplyStatusToSelf: { statusId: 'zabuza_hidden_mist_attack', duration: 2,
                            metadata: { helpful: true,
                                skillDamageBonuses: { [KUBIKIRIBOCHO]: 10 },
                                tooltipText: 'Kubikiribōchō deals 10 additional damage.' } },
                        tooltipText: 'Zabuza has 5 damage reduction for 2 turns. For the following 2 turns, Kubikiribōchō deals 10 additional damage.' } },
            ],
        },
        {
            id: 'momochi-zabuza-water-clone-technique', name: 'Water Clone Technique',
            skillimage: 'https://i.imgur.com/m1hfJAx.png',
            skilldescription: 'Zabuza becomes invulnerable for 1 turn.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'], effects: [
                { type: 'apply_status', statusId: 'zabuza_water_clone', duration: 1, scope: 'self',
                    metadata: { helpful: true, invulnerable: true, tooltipText: 'Zabuza is invulnerable.' } },
            ],
        },
    ],
};
