// Fake-player identities for matchmaking bots. A bot opponent should read like
// another ninja on the ladder: a believable username, a level near the player's,
// a win/loss record that fits that level, and sometimes shop cosmetics.
// Everything here is presentation; the battle bot's play is unchanged.

const DAY_MS = 24 * 60 * 60 * 1000;

const ADJECTIVES = [
    'Silent', 'Crimson', 'Hidden', 'Shadow', 'Swift', 'Lone', 'Rogue', 'Burning', 'Frozen', 'Storm',
    'Iron', 'Golden', 'Black', 'White', 'Silver', 'Dark', 'Wild', 'Lucky', 'Lazy', 'Sleepy',
    'Angry', 'Quiet', 'Mad', 'Fallen', 'Rising', 'Last', 'True', 'Red', 'Blue', 'Night',
];
const NOUNS = [
    'Kunai', 'Shuriken', 'Fox', 'Wolf', 'Raven', 'Hawk', 'Tiger', 'Dragon', 'Viper', 'Lotus',
    'Blade', 'Scroll', 'Leaf', 'Sand', 'Mist', 'Cloud', 'Stone', 'Flame', 'Thunder', 'Ninja',
    'Shinobi', 'Ronin', 'Samurai', 'Monk', 'Ghost', 'Phantom', 'Toad', 'Slug', 'Snake', 'Crow',
];
const JAPANESE_WORDS = [
    'Kage', 'Raijin', 'Fujin', 'Kitsune', 'Tengu', 'Oni', 'Tsuki', 'Hikari', 'Kaze', 'Kumo',
    'Ryu', 'Tora', 'Okami', 'Karasu', 'Hebi', 'Yami', 'Hoshi', 'Sora', 'Kiri', 'Suna',
    'Hayate', 'Shinobu', 'Akira', 'Ren', 'Kaito', 'Yuki', 'Haru', 'Daichi', 'Nami', 'Kenji',
];
const FAN_NAMES = [
    'itachi', 'kakashi', 'gaara', 'neji', 'shikamaru', 'hinata', 'sasuke', 'naruto', 'minato',
    'jiraiya', 'rocklee', 'obito', 'zabuza', 'haku', 'temari', 'kiba', 'shino', 'sakura',
    'tenten', 'chouji', 'ino', 'kankuro', 'anko', 'hayate', 'iruka', 'rin',
];
const FAN_SUFFIXES = ['fan', 'main', 'stan', 'enjoyer', 'lover', 'sensei', 'kun', 'sama', 'chan'];
const FIRST_NAMES = [
    'kenji', 'lucas', 'mateo', 'noah', 'liam', 'dmitri', 'yusuf', 'ali', 'omar', 'diego',
    'leo', 'kai', 'max', 'sam', 'alex', 'jay', 'marco', 'nico', 'theo', 'ivan',
    'emma', 'mia', 'sofia', 'lena', 'nina', 'yara', 'ava', 'zoe', 'lily', 'sara',
];
const GAMER_WORDS = ['pro', 'god', 'op', 'gg', 'ez', 'tv', 'yt', 'x', 'jr', 'irl'];

const pick = (list, rng) => list[Math.floor(rng() * list.length) % list.length];
const randomInt = (min, max, rng) => min + Math.floor(rng() * (max - min + 1));
const chance = (probability, rng) => rng() < probability;

const randomDigits = (rng) => {
    const roll = rng();
    if (roll < 0.35) return String(randomInt(1, 99, rng));
    if (roll < 0.6) return String(randomInt(1990, 2012, rng));
    if (roll < 0.8) return String(randomInt(100, 999, rng));
    return ['777', '1337', '007', '13', '21', '7', '99', '11'][randomInt(0, 7, rng)];
};

const NAME_STYLES = [
    // SilentKunai, CrimsonFox42
    [16, (rng) => `${pick(ADJECTIVES, rng)}${pick(NOUNS, rng)}${chance(0.35, rng) ? randomDigits(rng) : ''}`],
    // kunai_77, shinobi2009
    [12, (rng) => `${pick(NOUNS, rng).toLowerCase()}${chance(0.5, rng) ? '_' : ''}${randomDigits(rng)}`],
    // itachi_fan, gaaramain, Kakashi_Sensei
    [14, (rng) => {
        const name = pick(FAN_NAMES, rng);
        const suffix = pick(FAN_SUFFIXES, rng);
        const joined = chance(0.5, rng) ? `${name}_${suffix}` : `${name}${suffix}`;
        return chance(0.3, rng) ? joined.replace(/(^|_)([a-z])/g, (_, sep, letter) => sep + letter.toUpperCase()) : joined;
    }],
    // RaijinKage, kitsune_ryu, Tsuki88
    [14, (rng) => {
        const first = pick(JAPANESE_WORDS, rng);
        if (chance(0.4, rng)) return `${first}${randomDigits(rng)}`;
        const second = pick(JAPANESE_WORDS.filter((word) => word !== first), rng);
        return chance(0.5, rng) ? `${first}${second}` : `${first.toLowerCase()}_${second.toLowerCase()}`;
    }],
    // kenji_r, lucas2004, MiaB
    [14, (rng) => {
        const name = pick(FIRST_NAMES, rng);
        const roll = rng();
        if (roll < 0.4) return `${name}${randomDigits(rng)}`;
        if (roll < 0.7) return `${name}_${String.fromCharCode(97 + randomInt(0, 25, rng))}`;
        return `${name[0].toUpperCase()}${name.slice(1)}${String.fromCharCode(65 + randomInt(0, 25, rng))}`;
    }],
    // narutopro, ShinobiGG, notgaara
    [10, (rng) => {
        const base = chance(0.5, rng) ? pick(FAN_NAMES, rng) : pick(NOUNS, rng).toLowerCase();
        const roll = rng();
        if (roll < 0.35) return `not${base}`;
        if (roll < 0.55) return `the${base}`;
        const word = pick(GAMER_WORDS, rng);
        return chance(0.5, rng) ? `${base}${word}` : `${base[0].toUpperCase()}${base.slice(1)}${word.toUpperCase()}`;
    }],
    // xXShadowWolfXx (rare)
    [3, (rng) => `xX${pick(ADJECTIVES, rng)}${pick(NOUNS, rng)}Xx`],
    // sleepyninja, lazy_toad
    [10, (rng) => {
        const adjective = pick(ADJECTIVES, rng).toLowerCase();
        const noun = pick(NOUNS, rng).toLowerCase();
        return chance(0.5, rng) ? `${adjective}${noun}` : `${adjective}_${noun}`;
    }],
];
const NAME_STYLE_TOTAL = NAME_STYLES.reduce((sum, [weight]) => sum + weight, 0);

const generatePersonaName = (rng = Math.random) => {
    for (let attempt = 0; attempt < 8; attempt += 1) {
        let roll = rng() * NAME_STYLE_TOTAL;
        const style = NAME_STYLES.find(([weight]) => (roll -= weight) < 0) || NAME_STYLES[0];
        const name = style[1](rng).replace(/[^A-Za-z0-9_]/g, '');
        if (name.length >= 3 && name.length <= 20) return name;
    }
    return `${pick(NOUNS, rng)}${randomInt(10, 99, rng)}`;
};

// Mostly within a few levels of the player, occasionally further out, the way a
// small ladder pairs people.
const pickPersonaLevel = (playerLevel, maxLevel, rng = Math.random) => {
    const base = Math.max(1, Math.min(maxLevel, Math.round(Number(playerLevel) || 1)));
    const offset = Math.round((rng() - 0.5) * 4 + (rng() - 0.5) * 4 + (rng() - 0.5) * 4);
    return Math.max(1, Math.min(maxLevel, base + offset));
};

const buildPersonaRecord = (level, rng = Math.random) => {
    const normalizedLevel = Math.max(1, Number(level) || 1);
    const gamesPerLevel = 2 + rng() * 3.5;
    const games = normalizedLevel <= 1
        ? randomInt(0, 4, rng)
        : Math.max(1, Math.round(normalizedLevel * gamesPerLevel + randomInt(-3, 6, rng)));
    const winRate = 0.42 + rng() * 0.2;
    const wins = Math.max(0, Math.min(games, Math.round(games * winRate)));
    const losses = Math.max(0, games - wins);
    const streak = wins === 0 || chance(0.45, rng) ? 0 : randomInt(1, Math.min(wins, 6), rng);
    const highestStreak = Math.min(wins, streak + randomInt(0, 2 + Math.floor(normalizedLevel / 8), rng));
    return { wins, losses, streak, highestStreak: Math.max(streak, highestStreak) };
};

const priceOf = (item) => Math.max(50, Number(item?.price) || 100);
const pickWeightedByPrice = (items, rng) => {
    const candidates = (Array.isArray(items) ? items : []).filter(Boolean);
    if (!candidates.length) return null;
    const weights = candidates.map((item) => 1 / priceOf(item));
    let roll = rng() * weights.reduce((sum, weight) => sum + weight, 0);
    return candidates.find((_, index) => (roll -= weights[index]) < 0) || candidates[candidates.length - 1];
};

// Higher-level players have had longer to earn ryo, so they show more cosmetics.
const pickPersonaCosmetics = (level, catalog = {}, maxLevel = 80, rng = Math.random) => {
    const progress = Math.max(0, Math.min(1, (Number(level) || 1) / maxLevel));
    const avatar = chance(0.3 + progress * 0.45, rng)
        ? pickWeightedByPrice((catalog.avatars || []).filter((item) => item?.imageUrl), rng)
        : null;
    const border = chance(0.08 + progress * 0.37, rng)
        ? pickWeightedByPrice((catalog.borders || []).filter((item) => item?.imageUrl), rng)
        : null;
    const title = chance(0.05 + progress * 0.3, rng)
        ? pickWeightedByPrice((catalog.titles || []).filter((item) => item?.name), rng)
        : null;
    return {
        avatarUrl: avatar?.imageUrl || '',
        equippedBorder: border ? border.imageUrl || border.id : '',
        equippedTitle: title?.name || '',
    };
};

const buildBattleBotPersona = ({
    playerLevel = 1,
    maxLevel = 80,
    catalog = {},
    rng = Math.random,
    now = Date.now(),
} = {}) => {
    const level = pickPersonaLevel(playerLevel, maxLevel, rng);
    const record = buildPersonaRecord(level, rng);
    const cosmetics = pickPersonaCosmetics(level, catalog, maxLevel, rng);
    const accountAgeDays = 5 + level * 2 + randomInt(0, 160, rng);
    return {
        displayName: generatePersonaName(rng),
        level,
        experienceProgress: rng(),
        ...record,
        ...cosmetics,
        createdAt: new Date(now - accountAgeDays * DAY_MS),
    };
};

module.exports = {
    generatePersonaName,
    pickPersonaLevel,
    buildPersonaRecord,
    pickPersonaCosmetics,
    buildBattleBotPersona,
};
