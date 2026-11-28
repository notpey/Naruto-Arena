const { test } = require('node:test');
const assert = require('node:assert/strict');
const server = require('../server.js');

// A one-collection stand-in for MongoDB that understands the operators quest progress uses:
// dotted paths, $ne, $inc, $set and $addToSet.
const getPath = (doc, path) => path.split('.').reduce((value, part) => value?.[part], doc);
const setPath = (doc, path, value) => {
    const parts = path.split('.');
    const last = parts.pop();
    const target = parts.reduce((current, part) => (current[part] ??= {}), doc);
    target[last] = value;
};
const matches = (doc, query) => Object.entries(query).every(([path, condition]) => {
    const value = getPath(doc, path);
    if (condition && typeof condition === 'object' && '$ne' in condition) {
        return Array.isArray(value) ? !value.includes(condition.$ne) : value !== condition.$ne;
    }
    return value === condition;
});
const createUsers = (docs) => ({
    docs,
    async findOne(query) { return structuredClone(docs.find((doc) => matches(doc, query)) || null); },
    async updateOne(query, update) {
        const doc = docs.find((entry) => matches(entry, query));
        if (!doc) return { matchedCount: 0 };
        Object.entries(update.$set || {}).forEach(([path, value]) => setPath(doc, path, structuredClone(value)));
        Object.entries(update.$inc || {}).forEach(([path, amount]) => setPath(doc, path, (Number(getPath(doc, path)) || 0) + amount));
        Object.entries(update.$addToSet || {}).forEach(([path, value]) => {
            const list = getPath(doc, path) || [];
            if (!list.includes(value)) setPath(doc, path, [...list, value]);
        });
        return { matchedCount: 1 };
    },
});

const WEDNESDAY = new Date('2026-11-25T15:00:00Z');
const THURSDAY = new Date('2026-11-26T09:00:00Z');
const NEXT_MONDAY = new Date('2026-11-30T00:30:00Z');

test('dailies reset at 00:00 UTC and weeklies at 00:00 UTC on Monday', () => {
    assert.equal(server.questPeriodKey('daily', WEDNESDAY), '2026-11-25');
    assert.equal(server.questPeriodKey('weekly', WEDNESDAY), '2026-11-23');
    assert.equal(server.questPeriodKey('weekly', NEXT_MONDAY), '2026-11-30');
    assert.equal(server.questPeriodResetsAt('daily', WEDNESDAY), '2026-11-26T00:00:00.000Z');
    assert.equal(server.questPeriodResetsAt('weekly', WEDNESDAY), '2026-11-30T00:00:00.000Z');
});

test('progress and claims from an earlier period are not carried into the next', () => {
    const stored = {
        daily: { key: '2026-11-25', progress: { battlesWon: 3 }, claimedIds: ['daily_win_3'] },
        weekly: { key: '2026-11-23', progress: { rankedWins: 4 }, claimedIds: [] },
    };
    const sameDay = server.normalizeQuestsState(stored, WEDNESDAY);
    assert.equal(sameDay.daily.progress.battlesWon, 3);
    assert.deepEqual(sameDay.daily.claimedIds, ['daily_win_3']);
    const nextDay = server.normalizeQuestsState(stored, THURSDAY);
    assert.equal(nextDay.daily.progress.battlesWon, 0, 'the daily resets');
    assert.deepEqual(nextDay.daily.claimedIds, []);
    assert.equal(nextDay.weekly.progress.rankedWins, 4, 'the weekly carries through the week');
    assert.equal(server.normalizeQuestsState(stored, NEXT_MONDAY).weekly.progress.rankedWins, 0);
    // The old single-bucket shape (which never counted anything) reads as a fresh start.
    assert.equal(server.normalizeQuestsState({ progress: { battlesWon: 9 }, claimedIds: ['daily_win_3'] }, WEDNESDAY)
        .daily.progress.battlesWon, 0);
});

test('progress adds up within a period and starts fresh in a new one', async () => {
    const users = createUsers([{ username: 'p', profile: { quests: {} } }]);
    server.__setTestUsersCollection(users);
    await server.recordQuestProgress('p', { skillsUsed: 2, chakraSpent: 3 }, WEDNESDAY);
    await server.recordQuestProgress('p', { skillsUsed: 1, chakraSpent: 2 }, WEDNESDAY);
    let quests = server.normalizeQuestsState(users.docs[0].profile.quests, WEDNESDAY);
    assert.equal(quests.daily.progress.skillsUsed, 3);
    assert.equal(quests.daily.progress.chakraSpent, 5);
    assert.equal(quests.weekly.progress.skillsUsed, 3);

    await server.recordQuestProgress('p', { skillsUsed: 4 }, THURSDAY);
    quests = server.normalizeQuestsState(users.docs[0].profile.quests, THURSDAY);
    assert.equal(quests.daily.progress.skillsUsed, 4, 'a new day starts from zero');
    assert.equal(quests.weekly.progress.skillsUsed, 7, 'the week keeps adding');
});

test('a turn counts the skills the player sends and the chakra they cost', () => {
    const tally = server.tallyQueuedQuestProgress({
        queueOrder: [0, 2],
        queuedByActorSlot: {
            0: { skillIndex: 1, reservedSpecific: { ninjutsu: 1, taijutsu: 0, bloodline: 0, genjutsu: 0 }, requiredRandom: 1 },
            2: { skillIndex: 0, reservedSpecific: { ninjutsu: 0, taijutsu: 1, bloodline: 1, genjutsu: 0 }, requiredRandom: 0 },
        },
    });
    assert.deepEqual(tally, { skillsUsed: 2, chakraSpent: 4 });
    assert.deepEqual(server.tallyQueuedQuestProgress(null), { skillsUsed: 0, chakraSpent: 0 });
});

test('a finished match counts wins, ranked wins and fallen enemies, for players only', async () => {
    const users = createUsers([
        { username: 'winner', profile: { quests: {} } },
        { username: 'loser', profile: { quests: {} } },
    ]);
    server.__setTestUsersCollection(users);
    const fallen = { alive: false, hp: 0 };
    const standing = { alive: true, hp: 40 };
    const match = (mode, players) => ({
        mode,
        players,
        board: { winner: [standing, fallen, standing], loser: [fallen, fallen, fallen], bot: [fallen, fallen, standing] },
    });
    await server.recordQuestMatchResults(match('ladder', [{ username: 'winner' }, { username: 'loser' }]), 'winner');
    const winner = server.normalizeQuestsState(users.docs[0].profile.quests);
    const loser = server.normalizeQuestsState(users.docs[1].profile.quests);
    assert.equal(winner.daily.progress.battlesWon, 1);
    assert.equal(winner.weekly.progress.rankedWins, 1);
    assert.equal(winner.weekly.progress.charactersKilled, 3);
    assert.equal(loser.daily.progress.battlesWon, 0);
    assert.equal(loser.weekly.progress.charactersKilled, 1, 'a loss still counts the enemies it defeated');

    await server.recordQuestMatchResults(match('quick', [{ username: 'winner' }, { username: 'bot', isBot: true }]), 'winner');
    const afterQuick = server.normalizeQuestsState(users.docs[0].profile.quests);
    assert.equal(afterQuick.daily.progress.battlesWon, 2, 'a quick win against a bot counts');
    assert.equal(afterQuick.weekly.progress.rankedWins, 1, 'only ladder wins are ranked wins');

    for (const mode of ['tower', 'training']) {
        await server.recordQuestMatchResults(match(mode, [{ username: 'winner' }, { username: 'loser' }]), 'winner');
    }
    assert.equal(server.normalizeQuestsState(users.docs[0].profile.quests).daily.progress.battlesWon, 2,
        'the Tower and training do not count');
});
