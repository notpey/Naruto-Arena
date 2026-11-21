const PASSIVE_ICON = 'https://i.imgur.com/srHzKvO.png';
const SAKURA_KICK = 'haruno-sakura-sakura-kick';
const MENTAL_OVERWHELM = 'haruno-sakura-mental-overwhelm';
const RUDIMENTARY_HEALING = 'haruno-sakura-rudimentary-healing';
const CLONE_TECHNIQUE = 'haruno-sakura-clone-technique';
const INNER_MENTAL_OVERWHELM = 'haruno-sakura-inner-mental-overwhelm';
const INNER_SAKURA = 'haruno_sakura_inner_sakura_awakened';
// Placed by the engine on any enemy that stuns Sakura's team, until the end of Sakura's next turn.
const STUNNED_SAKURAS_TEAM = 'haruno_sakura_stunned_sakuras_team';

const KICK_ICON = 'https://www.animehistory.org/uploads/screencaps/naruto-episode-011-the-land-where-a-hero-once-lived/cap_05-19_bc8e.jpg';
const OVERWHELM_ICON = 'https://www.animehistory.org/uploads/screencaps/naruto-episode-042-the-ultimate-battle-cha_/cap_14-45_f141.jpg';

const INNER_SAKURA_TOOLTIP = 'Inner Sakura has awakened. Sakura ignores partial stuns, and Mental Overwhelm fully stuns and deals 20 affliction damage.';

// Each of Sakura's other skills permanently adds 5 to Rudimentary Healing, once per skill (up to +15).
const healingBonus = (statusId, skillName) => ({
    type: 'apply_status', statusId, duration: 99, scope: 'self',
    metadata: {
        helpful: true, permanent: true, cannotBeCleansed: true,
        skillHealingBonuses: { [RUDIMENTARY_HEALING]: 5 },
        tooltipText: `${skillName}: Rudimentary Healing heals 5 more.`,
    },
});
const KICK_HEALING_BONUS = healingBonus('haruno_sakura_kick_healing_bonus', 'Sakura Kick');
const OVERWHELM_HEALING_BONUS = healingBonus('haruno_sakura_overwhelm_healing_bonus', 'Mental Overwhelm');
const CLONE_HEALING_BONUS = healingBonus('haruno_sakura_clone_healing_bonus', 'Clone Technique');

module.exports = {
    id: 'haruno-sakura', characterId: 'haruno-sakura', name: 'Haruno Sakura',
    facePicture: 'https://i.imgur.com/q2K5CEj.png',
    characterdeescription: "A young kunoichi with exceptional chakra control and a sharp mind, Sakura Haruno joins Team 7 alongside Naruto Uzumaki and Sasuke Uchiha, hoping to prove herself as a capable shinobi. Though initially inexperienced in combat and often overshadowed by her teammates, Sakura's early encounters with dangerous enemies begin to test her courage and strengthen her resolve to protect those she cares about.",
    passive: {
        name: 'Inner Sakura', icon: PASSIVE_ICON,
        description: 'Quest: Sakura uses 4 skills, or Sasuke is on her team.\n\nReward: Sakura awakens her Inner Sakura, ignoring partial stuns.',
        recordEnemyStunners: {
            statusId: STUNNED_SAKURAS_TEAM, statusIcon: OVERWHELM_ICON,
            tooltipText: "This character stunned Sakura's team this turn. Mental Overwhelm can target them.",
        },
        awakening: {
            statusId: INNER_SAKURA,
            afterOwnerSkillUses: 4,
            allyCharacterIdsAny: ['uchiha-sasuke'],
            progressTooltipTextTemplate: 'Quest: Sakura uses 4 skills, or Sasuke is on her team. Skills used: {awakeningSkillUses}/4.\n\nReward: Sakura awakens her Inner Sakura, ignoring partial stuns.',
            completedTooltipText: INNER_SAKURA_TOOLTIP,
            metadata: {
                helpful: true, permanent: true, cannotBeCleansed: true,
                sourceSkillName: 'Inner Sakura',
                ignoresPartialStuns: true,
                skillReplacements: { [MENTAL_OVERWHELM]: INNER_MENTAL_OVERWHELM },
                tooltipText: INNER_SAKURA_TOOLTIP,
            },
        },
    },
    skills: [
        {
            id: SAKURA_KICK, name: 'Sakura Kick',
            skillimage: KICK_ICON,
            skilldescription: 'Sakura deals 20 physical damage to an enemy. They will ignore healing effects for 1 turn. Rudimentary Healing will permanently heal +5 (this effect does not stack).',
            energy: ['Taijutsu'], target: 'single-enemy', damage: 0, cooldown: 0,
            classes: ['Physical', 'Instant'],
            effects: [
                { type: 'damage', amount: 20, scope: 'target' },
                { type: 'apply_status', statusId: 'haruno_sakura_sakura_kick_no_heal', duration: 1, scope: 'target',
                    metadata: { harmful: true, turnDurationAnchor: 'source_turn', healReceivedMultiplier: 0,
                        tooltipText: 'This character ignores healing effects.' } },
                KICK_HEALING_BONUS,
            ],
        },
        {
            id: MENTAL_OVERWHELM, name: 'Mental Overwhelm',
            skillimage: OVERWHELM_ICON,
            skilldescription: "This skill can only be used on enemies who used a stun skill this turn. For 1 turn, Sakura will stun on that enemy the same classes that they stunned on Sakura's team. Rudimentary Healing will permanently heal +5 (this effect does not stack). During Inner Sakura this skill becomes a full stun every time, and deals 20 affliction damage to the enemy.",
            energy: ['Genjutsu'], target: 'single-enemy', damage: 0, cooldown: 0,
            targetCondition: { statusId: STUNNED_SAKURAS_TEAM },
            classes: ['Chakra', 'Instant'],
            effects: [
                { type: 'apply_status', statusId: 'haruno_sakura_mental_overwhelm_stun', duration: 1, scope: 'target',
                    metadata: { harmful: true, copyStunLocksFromTargetStatusId: STUNNED_SAKURAS_TEAM,
                        tooltipTextTemplate: 'Stunned by Mental Overwhelm: {stunLocks}.',
                        tooltipText: 'Stunned by Mental Overwhelm.' } },
                OVERWHELM_HEALING_BONUS,
            ],
        },
        {
            id: RUDIMENTARY_HEALING, name: 'Rudimentary Healing',
            skillimage: 'https://i.imgur.com/In5poGk.png',
            skilldescription: 'Sakura heals an ally or herself for 20 health.',
            energy: ['Ninjutsu'], target: 'self-or-single-ally', damage: 0, cooldown: 0,
            classes: ['Strategic', 'Instant'],
            effects: [
                { type: 'heal', amount: 20, scope: 'target' },
            ],
        },
        {
            id: CLONE_TECHNIQUE, name: 'Clone Technique',
            skillimage: 'https://i.imgur.com/JT9UvYv.png',
            skilldescription: 'Sakura becomes invulnerable for 1 turn. Rudimentary Healing will permanently heal +5 (this effect does not stack).',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [
                { type: 'apply_status', statusId: 'invulnerable', duration: 1, scope: 'self',
                    metadata: { helpful: true, invulnerable: true, tooltipText: 'This character is invulnerable.' } },
                CLONE_HEALING_BONUS,
            ],
        },
        {
            id: INNER_MENTAL_OVERWHELM, name: 'Mental Overwhelm',
            skillimage: OVERWHELM_ICON,
            skilldescription: "Inner Sakura: this skill can only be used on enemies who used a stun skill this turn. Sakura fully stuns that enemy for 1 turn and deals 20 affliction damage to them. Rudimentary Healing will permanently heal +5 (this effect does not stack).",
            energy: ['Genjutsu'], target: 'single-enemy', damage: 0, cooldown: 0,
            targetCondition: { statusId: STUNNED_SAKURAS_TEAM },
            classes: ['Chakra', 'Affliction', 'Instant'],
            effects: [
                { type: 'damage', amount: 20, scope: 'target' },
                { type: 'apply_status', statusId: 'haruno_sakura_mental_overwhelm_stun', duration: 1, scope: 'target',
                    metadata: { harmful: true, cannotUseSkills: true,
                        tooltipText: 'Stunned by Mental Overwhelm: all skills.' } },
                OVERWHELM_HEALING_BONUS,
            ],
        },
    ],
};
