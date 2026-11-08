const FLYING_THUNDER_GOD = 'namikaze-minato-flying-thunder-god';
const MARK = 'namikaze_minato_flying_thunder_god_mark';
const CUSTOM_KUNAI = 'namikaze_minato_custom_kunai';
const PASSIVE_ICON = 'https://i.imgur.com/qXB8HUP.png';

// Flying Thunder God Mark (the passive): a marked character is also targeted by Minato's next
// Flying Thunder God. Marks last through Minato's next turn and are passive effects, so they
// cannot be removed or ignored.
const markMetadata = (helpful) => ({
    ...(helpful ? { helpful: true } : { harmful: true }),
    fromPassive: true, cannotBeCleansed: true,
    turnDurationAnchor: 'source_turn', removeOnSourceDeath: true,
    statusIcon: PASSIVE_ICON, sourceSkillName: 'Flying Thunder God Mark',
    tooltipText: "Minato's next Flying Thunder God also targets this character.",
});
const enemyMark = { statusId: MARK, duration: 1, metadata: markMetadata(false) };
const onEnemy = { targetRelation: 'enemy' };
const onAlly = { targetRelation: 'ally' };

module.exports = {
    id: 'namikaze-minato',
    characterId: 'namikaze-minato',
    name: 'Namikaze Minato',
    facePicture: 'https://i.imgur.com/MSh8yU6.png',
    characterdeescription: "Known throughout the shinobi world as Konoha's Yellow Flash, Minato is the legendary Fourth Hokage. Renowned for his extraordinary speed and intelligence, he uses the Flying Thunder God technique and specially marked kunai to strike enemies and protect allies in the blink of an eye.",
    requiredMissionId: 'the-yellow-flash',
    passive: {
        name: 'Flying Thunder God Mark',
        icon: PASSIVE_ICON,
        description: 'The primary target of Flying Thunder God is marked for 1 turn. Whenever Minato uses Flying Thunder God, all marked characters are also targeted.',
    },
    skills: [
        {
            id: FLYING_THUNDER_GOD, name: 'Flying Thunder God',
            skillimage: 'https://i.imgur.com/nHMsa6Z.png',
            skilldescription: 'Minato teleports to a target. If used on an enemy, he deals 20 physical damage ignoring invulnerability. If used on an ally, they become invulnerable for 1 turn. Minato also becomes invulnerable for 1 turn. This skill costs 1 additional chakra for 1 turn after use.',
            energy: ['Genjutsu'], target: 'single-character', damage: 0, cooldown: 0,
            ignoreInvulnerability: true,
            classes: ['Physical', 'Instant'],
            effects: [
                { type: 'damage', amount: 20, scope: 'target', condition: onEnemy,
                    metadata: { alsoTargetMarkedStatusId: MARK } },
                { type: 'apply_status', statusId: 'namikaze_minato_flying_thunder_god_guard', duration: 1,
                    scope: 'target', condition: onAlly, metadata: {
                        helpful: true, invulnerable: true, alsoTargetMarkedStatusId: MARK,
                        tooltipText: 'This character is invulnerable.',
                    } },
                { type: 'apply_status', statusId: 'namikaze_minato_flying_thunder_god_evasion', duration: 1,
                    scope: 'self', metadata: {
                        helpful: true, invulnerable: true, tooltipText: 'This character is invulnerable.',
                    } },
                { type: 'apply_status', statusId: MARK, duration: 1, scope: 'target', condition: onEnemy,
                    metadata: markMetadata(false) },
                { type: 'apply_status', statusId: MARK, duration: 1, scope: 'target', condition: onAlly,
                    metadata: markMetadata(true) },
                { type: 'apply_status', statusId: 'namikaze_minato_flying_thunder_god_strain', duration: 1,
                    scope: 'self', metadata: {
                        cannotBeCleansed: true,
                        randomCostIncreaseForSkillIds: { [FLYING_THUNDER_GOD]: 1 },
                        tooltipText: 'Flying Thunder God costs 1 additional random chakra.',
                    } },
            ],
        },
        {
            id: 'namikaze-minato-chakra-surveillance', name: 'Chakra Surveillance',
            skillimage: 'https://i.imgur.com/2j02iq5.png',
            skilldescription: 'For 1 turn, any enemy who uses a skill will be marked. This skill is invisible.',
            energy: ['Random'], target: 'all-enemy', damage: 0, cooldown: 2,
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: 'namikaze_minato_chakra_surveillance', duration: 1,
                scope: 'all-enemy', metadata: {
                    harmful: true, invisible: true, hideTooltipFromUnitOwner: true,
                    turnDurationAnchor: 'source_turn',
                    onOwnerUseSkillTrigger: true, persistOnOwnerUseSkillTrigger: true,
                    onOwnerUseSkillEffects: [{ type: 'apply_status', ...enemyMark }],
                    tooltipText: 'If this character uses a skill, they are marked by Flying Thunder God Mark.',
                } }],
        },
        {
            id: 'namikaze-minato-custom-kunai', name: 'Custom Kunai',
            skillimage: 'https://i.imgur.com/MHXulZd.png',
            skilldescription: 'Minato gives an ally a custom kunai permanently. Whenever an enemy uses a harmful skill on that ally, they are marked for 1 turn. Cannot be used on an already affected ally. This effect ends if Minato dies.',
            energy: ['Taijutsu'], target: 'single-ally', damage: 0, cooldown: 2,
            targetCondition: { missingStatusId: CUSTOM_KUNAI },
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: CUSTOM_KUNAI, duration: 99, scope: 'target', metadata: {
                helpful: true, permanent: true, removeOnSourceDeath: true,
                onEnemySkillTargetedHarmfulOnly: true, onEnemySkillTargetedUseStatusSource: true,
                onEnemySkillTargetedApplyStatusToSource: enemyMark,
                tooltipText: 'Enemies who use a harmful skill on this character are marked by Flying Thunder God Mark.',
            } }],
        },
        {
            id: 'namikaze-minato-reroute', name: 'Reroute',
            skillimage: 'https://i.imgur.com/GPfm4Fp.png',
            skilldescription: 'Minato becomes invulnerable for 1 turn.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: 'namikaze_minato_reroute', duration: 1, scope: 'self', metadata: {
                helpful: true, invulnerable: true, tooltipText: 'This character is invulnerable.',
            } }],
        },
    ],
};
