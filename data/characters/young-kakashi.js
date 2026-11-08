const WHITE_FANG_SLASH = 'young-kakashi-white-fang-slash';
const AMATEUR_RAIKIRI = 'young-kakashi-amateur-raikiri';
const IMPLANTED_SHARINGAN = 'young_kakashi_implanted_sharingan';

// An enemy carrying either mark lengthens Implanted Sharingan when they use a chakra removal,
// chakra stealing, or stun effect.
const extendSharingan = { statusId: IMPLANTED_SHARINGAN, amount: 1 };
const chakraLossMark = {
    type: 'apply_status', statusId: 'young_kakashi_white_fang_slash_mark', duration: 1, scope: 'target',
    metadata: {
        harmful: true, turnDurationAnchor: 'source_turn',
        outgoingChakraLossReduction: 1, onOutgoingControlEffectExtendSourceStatus: extendSharingan,
        tooltipText: "This character's chakra removal and stealing effects remove or steal 1 less chakra.",
    },
};
const stunMark = {
    type: 'apply_status', statusId: 'young_kakashi_amateur_raikiri_mark', duration: 1, scope: 'target',
    metadata: {
        harmful: true, turnDurationAnchor: 'source_turn',
        outgoingStunDurationReduction: 1, onOutgoingControlEffectExtendSourceStatus: extendSharingan,
        tooltipText: "This character's stun effects stun for 1 less turn.",
    },
};
const empower = (statusId, skillId, skillName) => ({
    type: 'apply_status', statusId, duration: 1, scope: 'self',
    metadata: {
        helpful: true, skillDamageBonuses: { [skillId]: 5 },
        tooltipText: `${skillName} deals 5 additional damage.`,
    },
});
const empowerRaikiri = empower('young_kakashi_amateur_raikiri_empowered', AMATEUR_RAIKIRI, 'Amateur Raikiri');
const empowerFang = empower('young_kakashi_white_fang_slash_empowered', WHITE_FANG_SLASH, 'White Fang Slash');
// During Implanted Sharingan, each skill also applies the other's non-damage effects.
const whileSharingan = (effect) => ({ ...effect, condition: { scope: 'self', statusId: IMPLANTED_SHARINGAN } });

module.exports = {
    id: 'young-kakashi',
    characterId: 'young-kakashi',
    name: 'Young Kakashi',
    facePicture: 'https://i.imgur.com/e0OCi7n.png',
    characterdeescription: "A jounin at just thirteen and the son of Konoha's legendary White Fang, Kakashi is a gifted member of Team Minato. Skilled with both a blade and ninjutsu, he uses his newly implanted Sharingan to fight even when left on his own.",
    passive: {
        name: 'Lone Wolf',
        icon: 'https://i.imgur.com/MmyKEoD.png',
        description: 'Young Kakashi deals 5 additional physical and chakra damage for each dead ally.',
        damageBonusPerDeadAlly: { amount: 5, skillClassesAny: ['Physical', 'Chakra'] },
    },
    skills: [
        {
            id: WHITE_FANG_SLASH, name: 'White Fang Slash',
            skillimage: 'https://i.imgur.com/qm9sNZL.png',
            skilldescription: "Young Kakashi deals 20 piercing physical damage to an enemy. This turn, that enemy's chakra removal and stealing effects remove or steal 1 less chakra. Amateur Raikiri deals 5 additional damage for 1 turn.",
            energy: ['Taijutsu'], target: 'single-enemy', damage: 0, cooldown: 0,
            classes: ['Physical', 'Instant'],
            effects: [
                { type: 'damage', amount: 20, scope: 'target', metadata: { ignoreDamageReduction: true } },
                chakraLossMark,
                empowerRaikiri,
                whileSharingan(stunMark),
                whileSharingan(empowerFang),
            ],
        },
        {
            id: AMATEUR_RAIKIRI, name: 'Amateur Raikiri',
            skillimage: 'https://i.imgur.com/AB0oyRm.png',
            skilldescription: "Young Kakashi deals 20 piercing chakra damage to an enemy. This turn, that enemy's stun effects stun for 1 less turn. White Fang Slash deals 5 additional damage for 1 turn.",
            energy: ['Ninjutsu'], target: 'single-enemy', damage: 0, cooldown: 0,
            classes: ['Chakra', 'Instant'],
            effects: [
                { type: 'damage', amount: 20, scope: 'target', metadata: { ignoreDamageReduction: true } },
                stunMark,
                empowerFang,
                whileSharingan(chakraLossMark),
                whileSharingan(empowerRaikiri),
            ],
        },
        {
            id: 'young-kakashi-implanted-sharingan', name: 'Implanted Sharingan',
            skillimage: 'https://i.imgur.com/b4nAfIo.png',
            skilldescription: 'For 2 turns, White Fang Slash and Amateur Raikiri share their non-damage effects. If an enemy affected by these effects uses a chakra removal, chakra stealing, or stun effect, Implanted Sharingan lasts 1 additional turn. Cannot be used while active.',
            energy: [], target: 'self', damage: 0, cooldown: 3,
            actorCondition: { missingStatusId: IMPLANTED_SHARINGAN },
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: IMPLANTED_SHARINGAN, duration: 2, scope: 'self', metadata: {
                helpful: true,
                tooltipText: 'White Fang Slash and Amateur Raikiri share their non-damage effects. An affected enemy who uses a chakra removal, chakra stealing, or stun effect makes this last 1 additional turn.',
            } }],
        },
        {
            id: 'young-kakashi-sword-parry', name: 'Sword Parry',
            skillimage: 'https://i.imgur.com/BM6zhus.png',
            skilldescription: 'Young Kakashi becomes invulnerable for 1 turn.',
            energy: ['Random'], target: 'self', damage: 0, cooldown: 4,
            classes: ['Strategic', 'Instant'],
            effects: [{ type: 'apply_status', statusId: 'young_kakashi_sword_parry', duration: 1, scope: 'self', metadata: {
                helpful: true, invulnerable: true, tooltipText: 'This character is invulnerable.',
            } }],
        },
    ],
};
