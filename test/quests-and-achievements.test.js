const test = require('node:test');
const assert = require('node:assert/strict');

// ── QUEST & ACHIEVEMENT UTILITIES FOR VERIFICATION ──────────────────────────

const DEFAULT_QUESTS = [
    {
        questId: 'daily_win_3',
        type: 'daily',
        title: 'Shinobi Victory',
        description: 'Win 3 battles in any game mode.',
        target: 3,
        metric: 'battlesWon',
        rewards: { ryo: 150, summonScrolls: 0, chakraShards: 10 }
    },
    {
        questId: 'daily_chakra_50',
        type: 'daily',
        title: 'Chakra Mastery',
        description: 'Spend 50 Chakra in battles.',
        target: 50,
        metric: 'chakraSpent',
        rewards: { ryo: 100, summonScrolls: 0, chakraShards: 15 }
    },
    {
        questId: 'weekly_ranked_10',
        type: 'weekly',
        title: 'Ranked Gladiator',
        description: 'Win 10 Ranked games.',
        target: 10,
        metric: 'rankedWins',
        rewards: { ryo: 500, summonScrolls: 2, chakraShards: 50 }
    }
];

const DEFAULT_ACHIEVEMENTS = [
    {
        id: 'ranked_wins',
        title: 'Ranked Master',
        description: 'Win ranked games to climb the shinobi ranks.',
        metric: 'rankedWins',
        tiers: [
            { tier: 1, target: 5, rewards: { ryo: 250, summonScrolls: 1, chakraShards: 20 } },
            { tier: 2, target: 25, rewards: { ryo: 1000, summonScrolls: 3, chakraShards: 50 } },
            { tier: 3, target: 100, rewards: { ryo: 3000, summonScrolls: 10, chakraShards: 200 } }
        ]
    },
    {
        id: 'win_streak',
        title: 'Unstoppable Shinobi',
        description: 'Win consecutive ranked games.',
        metric: 'highestStreak',
        tiers: [
            { tier: 1, target: 3, rewards: { ryo: 300, summonScrolls: 1, chakraShards: 25 } },
            { tier: 2, target: 5, rewards: { ryo: 800, summonScrolls: 2, chakraShards: 50 } },
            { tier: 3, target: 10, rewards: { ryo: 2500, summonScrolls: 5, chakraShards: 150 } }
        ]
    }
];

const DAILY_LOGIN_CALENDAR = [
    { day: 1, rewards: { ryo: 100, summonScrolls: 0, chakraShards: 0 } },
    { day: 2, rewards: { ryo: 0, summonScrolls: 0, chakraShards: 25 } },
    { day: 3, rewards: { ryo: 200, summonScrolls: 0, chakraShards: 0 } },
    { day: 4, rewards: { ryo: 0, summonScrolls: 1, chakraShards: 0 } },
    { day: 5, rewards: { ryo: 0, summonScrolls: 0, chakraShards: 50 } },
    { day: 6, rewards: { ryo: 300, summonScrolls: 0, chakraShards: 0 } },
    { day: 7, rewards: { ryo: 500, summonScrolls: 3, chakraShards: 100 } }
];

function updateProgressHelper(progressObj, metricsDelta) {
    const updated = { ...progressObj };
    Object.keys(metricsDelta).forEach((key) => {
        updated[key] = (Number(updated[key]) || 0) + (Number(metricsDelta[key]) || 0);
    });
    return updated;
}

function evaluateQuestClaims(questsList, progressObj, claimedIdsSet) {
    return questsList.map((q) => {
        const currentProgress = Number(progressObj[q.metric]) || 0;
        const isCompleted = currentProgress >= q.target;
        const isClaimed = claimedIdsSet.has(q.questId);
        return {
            ...q,
            progress: Math.min(currentProgress, q.target),
            isCompleted,
            isClaimed,
            canClaim: isCompleted && !isClaimed
        };
    });
}

function evaluateAchievementTiers(achievement, metricValue, claimedTiersSet) {
    return achievement.tiers.map((t) => {
        const isCompleted = (Number(metricValue) || 0) >= t.target;
        const isClaimed = claimedTiersSet.has(t.tier);
        return {
            ...t,
            progress: Math.min(Number(metricValue) || 0, t.target),
            isCompleted,
            isClaimed,
            canClaim: isCompleted && !isClaimed
        };
    });
}

// ── TESTS ────────────────────────────────────────────────────────────────────

test('Quests Engine: tracks progress and enables claiming when target is met', () => {
    let progress = { battlesWon: 0, chakraSpent: 0, rankedWins: 0 };
    let claimedQuests = new Set();

    // Player wins 2 battles and spends 30 chakra
    progress = updateProgressHelper(progress, { battlesWon: 2, chakraSpent: 30 });
    let evaluated = evaluateQuestClaims(DEFAULT_QUESTS, progress, claimedQuests);

    assert.equal(evaluated[0].canClaim, false); // Daily win 3 (has 2)
    assert.equal(evaluated[1].canClaim, false); // Daily chakra 50 (has 30)

    // Player wins 1 more battle and spends 25 more chakra
    progress = updateProgressHelper(progress, { battlesWon: 1, chakraSpent: 25 });
    evaluated = evaluateQuestClaims(DEFAULT_QUESTS, progress, claimedQuests);

    assert.equal(evaluated[0].canClaim, true); // Daily win 3 target reached
    assert.equal(evaluated[1].canClaim, true); // Daily chakra 50 target reached

    // Claim first quest
    claimedQuests.add(evaluated[0].questId);
    evaluated = evaluateQuestClaims(DEFAULT_QUESTS, progress, claimedQuests);

    assert.equal(evaluated[0].isClaimed, true);
    assert.equal(evaluated[0].canClaim, false);
});

test('Achievements Engine: tracks multi-tiered progression and reward eligibility', () => {
    const claimedTiers = new Set();
    const achievement = DEFAULT_ACHIEVEMENTS[0]; // Ranked Master

    // Player has 6 ranked wins (reaches Tier 1 target 5)
    let tiers = evaluateAchievementTiers(achievement, 6, claimedTiers);
    assert.equal(tiers[0].canClaim, true);  // Tier 1 (target 5)
    assert.equal(tiers[1].canClaim, false); // Tier 2 (target 25)

    // Claim Tier 1
    claimedTiers.add(1);
    tiers = evaluateAchievementTiers(achievement, 6, claimedTiers);
    assert.equal(tiers[0].isClaimed, true);
    assert.equal(tiers[0].canClaim, false);

    // Player reaches 30 ranked wins (reaches Tier 2 target 25)
    tiers = evaluateAchievementTiers(achievement, 30, claimedTiers);
    assert.equal(tiers[1].canClaim, true);  // Tier 2 (target 25)
    assert.equal(tiers[2].canClaim, false); // Tier 3 (target 100)
});

test('Daily Login Rewards: evaluates rolling 7-day calendar rewards correctly', () => {
    const day3Config = DAILY_LOGIN_CALENDAR[2]; // Day 3
    assert.equal(day3Config.day, 3);
    assert.equal(day3Config.rewards.ryo, 200);

    const day7Config = DAILY_LOGIN_CALENDAR[6]; // Day 7
    assert.equal(day7Config.day, 7);
    assert.equal(day7Config.rewards.summonScrolls, 3);
    assert.equal(day7Config.rewards.chakraShards, 100);
});

test('Promo Code Validation: prevents duplicate redemption and enforces limits', () => {
    const samplePromoCode = {
        code: 'WELCOME2026',
        active: true,
        maxRedemptions: 100,
        timesRedeemed: 5,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        rewards: { ryo: 500, summonScrolls: 2, chakraShards: 50 }
    };

    const userRedeemedSet = new Set();

    // First redemption succeeds
    const canRedeem1 = samplePromoCode.active &&
        !userRedeemedSet.has(samplePromoCode.code) &&
        samplePromoCode.timesRedeemed < samplePromoCode.maxRedemptions &&
        new Date(samplePromoCode.expiresAt) > new Date();

    assert.equal(canRedeem1, true);

    userRedeemedSet.add(samplePromoCode.code);

    // Second redemption attempt fails
    const canRedeem2 = samplePromoCode.active &&
        !userRedeemedSet.has(samplePromoCode.code);

    assert.equal(canRedeem2, false);
});
