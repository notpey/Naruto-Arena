const test = require('node:test');
const assert = require('node:assert/strict');
const {
    generatePersonaName,
    pickPersonaLevel,
    buildPersonaRecord,
    pickPersonaCosmetics,
    buildBattleBotPersona,
} = require('../services/battleBotPersona');
const catalog = require('../data/cosmeticsCatalog.json');

// Small deterministic generator so failures reproduce.
const seededRng = (seed) => () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
};

test('persona names look like ordinary usernames and vary', () => {
    const rng = seededRng(7);
    const names = Array.from({ length: 600 }, () => generatePersonaName(rng));
    names.forEach((name) => {
        assert.match(name, /^[A-Za-z0-9_]{3,20}$/, name);
        assert.ok(!/game_bot|rogue ninja|bot$/i.test(name), name);
    });
    assert.ok(new Set(names).size > 480, `only ${new Set(names).size} distinct names`);
});

test('persona levels stay near the player and inside the ladder', () => {
    const rng = seededRng(11);
    for (let i = 0; i < 400; i += 1) {
        const level = pickPersonaLevel(30, 80, rng);
        assert.ok(level >= 24 && level <= 36, `level ${level}`);
    }
    for (let i = 0; i < 200; i += 1) {
        assert.ok(pickPersonaLevel(1, 80, rng) >= 1);
        assert.ok(pickPersonaLevel(80, 80, rng) <= 80);
    }
});

test('persona records are internally consistent', () => {
    const rng = seededRng(3);
    [1, 2, 10, 40, 80].forEach((level) => {
        for (let i = 0; i < 100; i += 1) {
            const record = buildPersonaRecord(level, rng);
            assert.ok(record.wins >= 0 && record.losses >= 0);
            assert.ok(record.streak <= record.highestStreak, JSON.stringify(record));
            assert.ok(record.highestStreak <= record.wins, JSON.stringify(record));
            if (level >= 10) assert.ok(record.wins + record.losses >= level, JSON.stringify(record));
        }
    });
});

test('persona cosmetics only come from the shop catalog and grow with level', () => {
    const rng = seededRng(5);
    const avatarUrls = new Set(catalog.avatars.map((item) => item.imageUrl));
    const borderUrls = new Set(catalog.borders.map((item) => item.imageUrl || item.id));
    const titleNames = new Set(catalog.titles.map((item) => item.name));
    let lowCount = 0;
    let highCount = 0;
    for (let i = 0; i < 500; i += 1) {
        const low = pickPersonaCosmetics(2, catalog, 80, rng);
        const high = pickPersonaCosmetics(70, catalog, 80, rng);
        [low, high].forEach((cosmetics) => {
            if (cosmetics.avatarUrl) assert.ok(avatarUrls.has(cosmetics.avatarUrl));
            if (cosmetics.equippedBorder) assert.ok(borderUrls.has(cosmetics.equippedBorder));
            if (cosmetics.equippedTitle) assert.ok(titleNames.has(cosmetics.equippedTitle));
        });
        lowCount += [low.avatarUrl, low.equippedBorder, low.equippedTitle].filter(Boolean).length;
        highCount += [high.avatarUrl, high.equippedBorder, high.equippedTitle].filter(Boolean).length;
    }
    assert.ok(lowCount > 0, 'low-level personas sometimes wear cosmetics');
    assert.ok(highCount > lowCount * 1.5, `high ${highCount} vs low ${lowCount}`);
    assert.deepEqual(pickPersonaCosmetics(50, {}, 80, rng), { avatarUrl: '', equippedBorder: '', equippedTitle: '' });
});

test('bot players carry the persona as their public identity', () => {
    const { createBattleBotPlayer, buildMatchPayloadForUser } = require('../server.js');
    const persona = buildBattleBotPersona({ playerLevel: 20, catalog, rng: seededRng(9), now: Date.now() });
    persona.avatarUrl = catalog.avatars[0].imageUrl;
    persona.equippedBorder = catalog.borders[0].imageUrl;
    persona.equippedTitle = catalog.titles[0].name;
    persona.ladderRank = 42;
    const bot = createBattleBotPlayer({ matchId: 'match-1', team: [0, 1, 2], persona });

    assert.match(bot.username, /^__game_bot__:/);
    assert.equal(bot.displayName, persona.displayName);
    assert.equal(bot.displayNameLower, persona.displayName.toLowerCase());
    assert.equal(bot.ladderLevel, persona.level);
    assert.equal(bot.profile.avatarUrl, persona.avatarUrl);
    assert.equal(bot.profile.equippedBorder, persona.equippedBorder);
    assert.equal(bot.profile.equippedTitle, persona.equippedTitle);
    assert.equal(bot.profile.ladder.level, persona.level);
    assert.equal(bot.profile.ladder.ladderRank, 42);
    assert.equal(bot.profile.ladder.wins, persona.wins);
    assert.equal(bot.profile.ladder.losses, persona.losses);
    assert.ok(bot.profile.ladder.experienceIntoLevel < bot.profile.ladder.experienceForNextLevel);

    const payload = buildMatchPayloadForUser({ matchId: 'match-1', players: [{ username: 'human', team: [3, 4, 5] }, bot], board: {} }, 'human');
    assert.equal(payload.opponent.displayName, persona.displayName);
    assert.equal(payload.opponent.profile.avatarUrl, persona.avatarUrl);

    const dummy = createBattleBotPlayer({ matchId: 'match-2', team: [0, 1, 2], displayName: 'Training Dummy' });
    assert.equal(dummy.displayName, 'Training Dummy');
    assert.equal(dummy.displayNameLower, undefined);
});

test('the bot queue wait varies per search but never drops below the minimum', () => {
    const { getBattleBotQueueWaitMs, pickBattleBotQueueWaitMs } = require('../server.js');
    const waits = Array.from({ length: 200 }, () => pickBattleBotQueueWaitMs());
    waits.forEach((wait) => assert.ok(wait >= 3000 && wait <= 10000, `wait ${wait}`));
    assert.ok(new Set(waits).size > 50);
    assert.equal(getBattleBotQueueWaitMs({ battleBotWaitMs: 8123 }), 8123);
    assert.equal(getBattleBotQueueWaitMs({}), 3000);
    assert.equal(getBattleBotQueueWaitMs({ battleBotWaitMs: 5 }), 3000);
});
