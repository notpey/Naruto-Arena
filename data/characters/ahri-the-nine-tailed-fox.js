const CHARM = 'ahri_charm';

module.exports = {
    id: 'ahri-the-nine-tailed-fox',
    characterId: 'ahri-the-nine-tailed-fox',
    name: 'Ahri, the Nine-Tailed Fox',
    facePicture: 'https://i.imgur.com/k8je7nT.png',
    characterdeescription: 'A mysterious vastaya from Ionia, Ahri possesses the ability to manipulate emotions and consume the life essence of those she encounters. Wielding powerful spirit magic, she uses her deceptive charm and supernatural agility to overwhelm unsuspecting opponents.',
    passive: {
        name: 'Essence Theft',
        icon: 'https://i.imgur.com/T9EtzHn.png',
        description: 'Whenever an enemy dies, Ahri heals 15 health.',
        onEnemyDeathHealSelfAmount: 15,
    },
    skills: [
        {
            id: 'ahri-orb-of-deception', name: 'Orb of Deception',
            skillimage: 'https://i.imgur.com/K7OxawM.png',
            skilldescription: 'Ahri deals 15 chakra damage to one enemy. At the end of Ahri’s next turn, the orb returns for 15 piercing chakra damage, plus 10 if the target is affected by Charm.',
            energy: ['Bloodline'], target: 'single-enemy', damage: 0, cooldown: 1,
            classes: ['Chakra', 'Instant'],
            effects: [
                { type: 'damage', amount: 15, scope: 'target' },
                { type: 'apply_status', statusId: 'ahri_orb_return', duration: 1, scope: 'target',
                    metadata: {
                        harmful: true, turnDurationAnchor: 'source_turn',
                        onExpireEffects: [
                            { type: 'damage', amount: 15,
                                metadata: { skillClasses: ['Chakra'],
                                    ignoreDamageReduction: true,
                                    ignoreDestructibleDefense: true,
                                    bonusIfTargetStatus: { statusId: CHARM, amount: 10 } } },
                        ],
                        tooltipText: 'At the end of Ahri’s next turn, this character takes 15 piercing chakra damage, plus 10 if affected by Charm.',
                    } },
            ],
        },
        {
            id: 'ahri-fox-fire', name: 'Fox-Fire',
            skillimage: 'https://i.imgur.com/kXFWkRA.png',
            skilldescription: 'Ahri deals 10 chakra damage to one enemy and 5 chakra damage to two random enemies. If the selected enemy is affected by Charm, all three fox-fires strike them instead.',
            energy: ['Random'], target: 'single-enemy', damage: 0, cooldown: 0,
            classes: ['Chakra', 'Instant'],
            effects: [
                { type: 'damage', amount: 10, scope: 'target' },
                { type: 'damage', amount: 5, scope: 'two-random-enemies',
                    condition: { selectedTargetMissingStatusId: CHARM } },
                { type: 'damage', amount: 10, scope: 'target',
                    condition: { selectedTargetStatusId: CHARM } },
            ],
        },
        {
            id: 'ahri-charm', name: 'Charm',
            skillimage: 'https://i.imgur.com/nyjiefn.png',
            skilldescription: 'Ahri charms one enemy for 2 turns and stuns all their skills for 1 turn. Orb of Deception and Fox-Fire gain additional effects against the charmed enemy.',
            energy: ['Bloodline'], target: 'single-enemy', damage: 0, cooldown: 1,
            classes: ['Strategic', 'Instant'],
            effects: [
                { type: 'apply_status', statusId: CHARM, duration: 2, scope: 'target',
                    metadata: { harmful: true, turnDurationAnchor: 'source_turn',
                        tooltipText: 'Affected by Charm for 2 turns. Orb of Deception and Fox-Fire have additional effects against this character.' } },
                { type: 'apply_status', statusId: 'ahri_charm_stun', duration: 1, scope: 'target',
                    metadata: { harmful: true, cannotUseSkills: true,
                        tooltipText: 'All skills are stunned for 1 turn.' } },
            ],
        },
        {
            id: 'ahri-spirit-rush', name: 'Spirit Rush',
            skillimage: 'https://i.imgur.com/WV9cmsA.png',
            skilldescription: 'Ahri deals 10 chakra damage to a random enemy and becomes invulnerable for 1 turn.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 2,
            classes: ['Chakra', 'Instant'],
            effects: [
                { type: 'damage', amount: 10, scope: 'random-enemy' },
                { type: 'apply_status', statusId: 'ahri_spirit_rush_invulnerable',
                    duration: 1, scope: 'self',
                    metadata: { helpful: true, invulnerable: true,
                        tooltipText: 'Ahri is invulnerable for 1 turn.' } },
            ],
        },
    ],
};
