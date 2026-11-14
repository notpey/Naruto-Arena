// The Tower's acts: what each stretch of floors is, who you meet there, and how hard it
// hits. Pure data; towerRun.js turns it into maps and encounters.
//
// Act I  · Land of Waves     floors 1-10   Zabuza and Haku on the Great Naruto Bridge.
// Act II · The Chūnin Exams  floors 11-20  The written exam, the Forest of Death, the
//                                          preliminaries, a month of training and the finals,
//                                          which the Konoha Crush interrupts (Act III).

const ACTS = {
    1: {
        act: 1, name: 'Act I', title: 'Land of Waves',
        firstFloor: 1, lastFloor: 10, bossFloor: 10, bossId: 'demon-of-the-mist',
        accountBossBonus: 150,
    },
    2: {
        act: 2, name: 'Act II', title: 'The Chūnin Exams',
        firstFloor: 11, lastFloor: 20, bossFloor: 20, bossId: 'final-bout',
        accountBossBonus: 250,
    },
};
const FINAL_ACT = 2;
const NEXT_ACT_TEASER = 'Act III · The Konoha Crush. Coming soon.';

const actForFloor = (floor) => (Number(floor) > ACTS[1].lastFloor ? ACTS[2] : ACTS[1]);

// What each Act II floor is called on the map and in the journal.
const FLOOR_STAGES = {
    11: 'The First Exam',
    12: 'The Forest of Death',
    13: 'The Forest of Death',
    14: 'The Forest of Death',
    15: 'The Forest of Death',
    16: 'The Preliminaries',
    17: 'A Month of Training',
    18: 'A Month of Training',
    19: 'The Finals',
    20: 'The Finals',
};
const stageForFloor = (floor) => FLOOR_STAGES[floor] || (Number(floor) <= 10 ? 'Land of Waves' : '');

// ---------------------------------------------------------------- squads
// enemyIds: null leaves a slot empty (that enemy starts the battle already gone).
// hpBonus: added to the floor's health multiplier, so smaller squads still last.
// floors: [first, last] floor the squad may appear on.
const ACT_I_SQUADS = [
    {
        id: 'academy-instructors', name: 'Academy Instructors', floors: [1, 4],
        enemyIds: ['umino-iruka', 'mizuki', 'ebisu'],
        blurb: 'A graduation test that has gone badly wrong.',
    },
    {
        id: 'gato-hired-swords', name: "Gatō's Hired Swords", floors: [2, 8],
        enemyIds: ['gato', 'zori-and-waraji', 'demon-brothers'],
        blurb: 'The shipping tycoon pays well for dead bridge-builders.',
    },
    {
        id: 'gato-enforcers', name: "Gatō's Enforcers", floors: [3, 8], hpBonus: 0.45,
        enemyIds: ['zori-and-waraji', 'demon-brothers', null],
        blurb: 'Two of Gatō\'s best, fighting as a pair.',
    },
];
// Chance that an Act I battle meets a themed squad rather than a band of rogues.
const ACT_I_THEMED_CHANCE = 0.45;

// Every Forest of Death squad carries a Heaven or an Earth scroll.
const FOREST_SQUADS = [
    { id: 'sound-genin', name: 'Sound Genin', enemyIds: ['dosu-kinuta', 'zaku-abumi', 'tsuchi-kin'],
        blurb: 'Orochimaru\'s pawns, hunting one team in particular.' },
    { id: 'rain-genin', name: 'Rain Genin', hpBonus: 0.45, enemyIds: ['oboro', 'shigure', null],
        blurb: 'Genjutsu specialists who wait in the trees.' },
    { id: 'kabuto-team', name: "Kabuto's Teammates", hpBonus: 0.45, enemyIds: ['akadou-yoroi', 'tsurugi-misumi', null],
        blurb: 'Their third member is somewhere else in the forest. Smiling.' },
    { id: 'team-kurenai', name: 'Team Kurenai', enemyIds: ['inuzuka-kiba', 'aburame-shino', 'hyuuga-hinata'],
        blurb: 'A tracking team. They found you first.' },
    { id: 'team-asuma', name: 'Team Asuma', enemyIds: ['yamanaka-ino', 'nara-shikamaru', 'akimichi-chouji'],
        blurb: 'Ino, Shika, Chō. The formation has been drilled for years.' },
    { id: 'team-guy', name: 'Team Guy', enemyIds: ['rock-lee', 'neji-hyuuga', 'tenten'],
        blurb: 'Last year\'s strongest genin team, back for the exam.' },
];
const FOREST_ELITE = {
    id: 'sand-siblings', name: 'The Sand Siblings', enemyIds: ['gaara-of-the-desert', 'kankuro', 'temari'],
    blurb: 'They will reach the tower in ninety-seven minutes. You are in the way.',
};

// Duel opponents: the preliminaries draw from every genin who reached the tower; the
// finals from those who advanced. Gaara is saved for the last bout.
const PRELIMINARY_POOL = [
    'akadou-yoroi', 'tsurugi-misumi', 'zaku-abumi', 'tsuchi-kin', 'dosu-kinuta', 'temari', 'kankuro',
    'neji-hyuuga', 'hyuuga-hinata', 'rock-lee', 'inuzuka-kiba', 'aburame-shino', 'yamanaka-ino',
    'haruno-sakura', 'nara-shikamaru', 'akimichi-chouji', 'tenten',
];
const FINALS_POOL = ['neji-hyuuga', 'temari', 'aburame-shino', 'kankuro', 'dosu-kinuta', 'nara-shikamaru'];

// ---------------------------------------------------------------- difficulty
const battleHpMultiplier = (floor) => {
    if (floor <= 2) return 1;
    if (floor <= 10) return Math.round((1 + 0.08 * (floor - 2)) * 100) / 100;
    return Math.round((1.3 + 0.05 * Math.max(0, floor - 12)) * 100) / 100;
};
const battleAffixCount = (floor) => {
    if (floor >= 14) return 2;
    if (floor >= 11) return 1;
    if (floor >= 7) return 2;
    if (floor >= 4) return 1;
    return 0;
};
const ELITE_HP_MULTIPLIER = { 1: 1.6, 2: 1.7 };
const DUEL_HP_MULTIPLIER = { 16: 1.4, 19: 1.6 };

module.exports = {
    ACTS,
    FINAL_ACT,
    NEXT_ACT_TEASER,
    actForFloor,
    stageForFloor,
    ACT_I_SQUADS,
    ACT_I_THEMED_CHANCE,
    FOREST_SQUADS,
    FOREST_ELITE,
    PRELIMINARY_POOL,
    FINALS_POOL,
    battleHpMultiplier,
    battleAffixCount,
    ELITE_HP_MULTIPLIER,
    DUEL_HP_MULTIPLIER,
};
