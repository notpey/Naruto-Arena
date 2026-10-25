const express = require('express');
const fs = require('fs');
const path = require('path');
const { ObjectId } = require('mongodb');
const { evaluateAccess } = require('../services/characterRankAccess');

const DEFAULT_GACHA_CONFIG = {
    pityThreshold: 50,
    rates: {
        legendary: 0.5,
        epic: 3.5,
        rare: 11.0,
        uncommon: 30.0,
        common: 55.0
    },
    duplicateShards: {
        legendary: 150,
        epic: 100,
        rare: 50,
        uncommon: 25,
        common: 10
    },
    banners: [
        {
            bannerId: 'standard',
            title: 'Scroll of the Five Nations',
            subtitle: 'Standard Shinobi Summon',
            description: 'Summon brave shinobi across all five hidden villages with guaranteed drop protection!',
            active: true,
            bannerImage: 'https://i.imgur.com/4JoDMuI.png',
            singleCostScrolls: 1,
            singleCostRyo: 100,
            multiCostScrolls: 9,
            multiCostRyo: 900,
            featuredCharacters: ['hatake-kakashi', 'maito-gai', 'sarutobi-asuma']
        },
        {
            bannerId: 'akatsuki',
            title: 'Akatsuki Unsealed',
            subtitle: 'Featured Rate-Up Summon',
            description: 'Featured 50% rate up on legendary Akatsuki rogues and mist assassins!',
            active: true,
            bannerImage: 'https://i.imgur.com/4JoDMuI.png',
            singleCostScrolls: 1,
            singleCostRyo: 100,
            multiCostScrolls: 9,
            multiCostRyo: 900,
            featuredCharacters: ['uchiha-itachi', 'hoshigaki-kisame', 'momochi-zabuza']
        }
    ]
};

module.exports = function (context = {}) {
    const router = express.Router();
    const {
        usersCollection,
        appStateCollection,
        normalizeUserProfile,
        requireSession,
        getCharactersData,
        rootDir = path.join(__dirname, '..'),
        SESSION_COOKIE_NAME = 'naruto_arena_session',
        getSessionUserCached
    } = context;
    const loadRankPolicies = () => context.characterRankAccess?.getPolicies?.() || Promise.resolve({});
    const canShowCharacter = (policies, role, character) => !evaluateAccess({
        policies, characterId: character?.characterId || character?.id,
        role, inheritedUnlocked: true,
    }).hidden;

    const GACHA_CONFIG_FILE = path.join(rootDir, 'gacha_config.json');
    let currentGachaMemoryCache = null;

    async function getGachaSessionUser(req) {
        if (!usersCollection || !req.authUser) return null;
        let user = null;
        if (req.authUser._id && ObjectId.isValid(req.authUser._id)) {
            try {
                user = await usersCollection.findOne({ _id: new ObjectId(req.authUser._id) });
            } catch (e) {}
        }
        if (!user && req.authUser.id && ObjectId.isValid(req.authUser.id)) {
            try {
                user = await usersCollection.findOne({ _id: new ObjectId(req.authUser.id) });
            } catch (e) {}
        }
        if (!user && req.authUser.username) {
            try {
                const rawUsername = String(req.authUser.username).trim();
                user = await usersCollection.findOne({
                    $or: [
                        { username: rawUsername },
                        { usernameLower: rawUsername.toLowerCase() }
                    ]
                });
            } catch (e) {}
        }
        return user;
    }

    function getStoredGachaConfigSync() {
        if (fs.existsSync(GACHA_CONFIG_FILE)) {
            try {
                const raw = fs.readFileSync(GACHA_CONFIG_FILE, 'utf8');
                const parsed = JSON.parse(raw);
                if (parsed && Array.isArray(parsed.banners) && parsed.banners.length > 0) {
                    return parsed;
                }
            } catch (e) {}
        }
        return null;
    }

    async function getStoredGachaConfig() {
        const fileConfig = getStoredGachaConfigSync();
        if (fileConfig) {
            currentGachaMemoryCache = fileConfig;
            return fileConfig;
        }
        if (currentGachaMemoryCache) return currentGachaMemoryCache;
        if (appStateCollection) {
            try {
                const doc = await appStateCollection.findOne({
                    $or: [{ _id: 'gachaConfig' }, { key: 'gacha_config' }]
                });
                if (doc && doc.config && Array.isArray(doc.config.banners) && doc.config.banners.length > 0) {
                    currentGachaMemoryCache = doc.config;
                    try {
                        fs.writeFileSync(GACHA_CONFIG_FILE, JSON.stringify(doc.config, null, 2));
                    } catch (e) {}
                    return doc.config;
                }
            } catch (e) {
                console.error('Error fetching gacha config:', e);
            }
        }
        return DEFAULT_GACHA_CONFIG;
    }

    async function saveStoredGachaConfig(rawConfig = {}) {
        const config = {
            pityThreshold: Math.max(1, Number(rawConfig?.pityThreshold) || 50),
            rates: {
                legendary: Math.max(0, Number(rawConfig?.rates?.legendary) || 0.5),
                epic: Math.max(0, Number(rawConfig?.rates?.epic) || 3.5),
                rare: Math.max(0, Number(rawConfig?.rates?.rare) || 11.0),
                uncommon: Math.max(0, Number(rawConfig?.rates?.uncommon) || 30.0),
                common: Math.max(0, Number(rawConfig?.rates?.common) || 55.0)
            },
            duplicateShards: {
                legendary: Math.max(0, Number(rawConfig?.duplicateShards?.legendary) || 150),
                epic: Math.max(0, Number(rawConfig?.duplicateShards?.epic) || 100),
                rare: Math.max(0, Number(rawConfig?.duplicateShards?.rare) || 50),
                uncommon: Math.max(0, Number(rawConfig?.duplicateShards?.uncommon) || 25),
                common: Math.max(0, Number(rawConfig?.duplicateShards?.common) || 10)
            },
            banners: Array.isArray(rawConfig?.banners) && rawConfig.banners.length > 0
                ? rawConfig.banners.map((b, i) => ({
                    bannerId: String(b.bannerId || `banner-${i + 1}`).trim().toLowerCase(),
                    title: String(b.title || 'Shinobi Summon').trim(),
                    subtitle: String(b.subtitle || '').trim(),
                    description: String(b.description || '').trim(),
                    active: b.active !== false,
                    bannerImage: String(b.bannerImage || 'https://i.imgur.com/4JoDMuI.png').trim(),
                    singleCostScrolls: Math.max(1, Number(b.singleCostScrolls) || 1),
                    singleCostRyo: Math.max(1, Number(b.singleCostRyo) || 100),
                    multiCostScrolls: Math.max(1, Number(b.multiCostScrolls) || 9),
                    multiCostRyo: Math.max(1, Number(b.multiCostRyo) || 900),
                    featuredCharacters: Array.isArray(b.featuredCharacters) ? b.featuredCharacters.filter(Boolean) : []
                }))
                : DEFAULT_GACHA_CONFIG.banners
        };

        currentGachaMemoryCache = config;
        try {
            fs.writeFileSync(GACHA_CONFIG_FILE, JSON.stringify(config, null, 2));
        } catch (e) {
            console.error('Failed to write gacha_config.json:', e);
        }

        if (appStateCollection) {
            try {
                await appStateCollection.updateOne(
                    { _id: 'gachaConfig' },
                    { $set: { key: 'gacha_config', config, updatedAt: new Date() } },
                    { upsert: true }
                );
            } catch (e) {
                console.error('Failed to persist gachaConfig to DB:', e);
            }
        }
        return config;
    }

    router.get('/gacha/banners', async (req, res) => {
        try {
            let authUser = null;
            try {
                const token = req.cookies?.[SESSION_COOKIE_NAME];
                if (token && typeof getSessionUserCached === 'function') {
                    authUser = await getSessionUserCached(token);
                }
            } catch (e) {}

            req.authUser = authUser || req.authUser || null;
            const user = authUser ? await getGachaSessionUser(req) : null;
            const profile = user ? normalizeUserProfile(user) : (authUser?.profile || { ryo: 0, summonScrolls: 0, chakraShards: 0, gachaStats: { pityCounter: 0 } });
            const config = await getStoredGachaConfig();
            const policies = await loadRankPolicies();
            const role = user?.role || authUser?.role || 'player';
            const activeBanners = (config.banners || []).filter(b => b.active !== false)
                .map((banner) => ({
                    ...banner,
                    featuredCharacters: (Array.isArray(banner.featuredCharacters)
                        ? banner.featuredCharacters : []).filter((characterId) =>
                        canShowCharacter(policies, role, { characterId })),
                }));

            return res.json({
                ok: true,
                ryo: Number(profile.ryo) || 0,
                summonScrolls: Number(profile.summonScrolls) || 0,
                chakraShards: Number(profile.chakraShards) || 0,
                gachaStats: profile.gachaStats || { pityCounter: 0 },
                pityThreshold: config.pityThreshold || 50,
                rates: config.rates,
                banners: activeBanners
            });
        } catch (error) {
            console.error('Gacha banner load error:', error);
            return res.status(500).json({ error: 'Unable to load gacha banners.' });
        }
    });

    router.post('/gacha/pull', requireSession, async (req, res) => {
        try {
            const user = await getGachaSessionUser(req);
            if (!user) return res.status(404).json({ error: 'User not found.' });

            const profile = normalizeUserProfile(user);
            const config = await getStoredGachaConfig();
            const policies = await loadRankPolicies();
            const allChars = (typeof getCharactersData === 'function' ? getCharactersData() : [])
                .filter((character) => canShowCharacter(policies, user.role, character));
            if (!allChars.length) {
                return res.status(409).json({ error: 'No characters are available for your web rank.' });
            }
            const { bannerId = 'standard', count = 1, paymentType = 'scrolls' } = req.body;

            const pullCount = Math.min(Math.max(Number(count) || 1, 1), 10);
            const banner = (config.banners || []).find((b) => b.bannerId === bannerId) || config.banners[0] || DEFAULT_GACHA_CONFIG.banners[0];

            let scrollCost = pullCount === 10 ? (banner.multiCostScrolls || 9) : (banner.singleCostScrolls || 1) * pullCount;
            let ryoCost = pullCount === 10 ? (banner.multiCostRyo || 900) : (banner.singleCostRyo || 100) * pullCount;

            let scrollsAvailable = Number(profile.summonScrolls || 0);
            let ryoAvailable = Number(profile.ryo || 0);

            if (paymentType === 'ryo') {
                if (ryoAvailable >= ryoCost) {
                    profile.ryo = ryoAvailable - ryoCost;
                } else if (scrollsAvailable >= scrollCost) {
                    profile.summonScrolls = scrollsAvailable - scrollCost;
                } else {
                    return res.status(400).json({ error: `Insufficient currency. Need ${scrollCost} Scrolls or ${ryoCost} Ryo.` });
                }
            } else {
                if (scrollsAvailable >= scrollCost) {
                    profile.summonScrolls = scrollsAvailable - scrollCost;
                } else if (ryoAvailable >= ryoCost) {
                    profile.ryo = ryoAvailable - ryoCost;
                } else {
                    return res.status(400).json({ error: `Insufficient currency. Need ${scrollCost} Scrolls or ${ryoCost} Ryo.` });
                }
            }

            const unlockedSet = new Set(Array.isArray(profile.unlockedCharacterIds) ? profile.unlockedCharacterIds : []);

            let pityCounter = Number(profile.gachaStats?.pityCounter || 0);
            const pityLimit = Number(config.pityThreshold) || 50;

            const pulls = [];
            const newUnlockedIds = [];

            for (let i = 0; i < pullCount; i++) {
                pityCounter += 1;
                let rarity = 'common';

                if (pityCounter >= pityLimit) {
                    rarity = Math.random() < 0.3 ? 'legendary' : 'epic';
                    pityCounter = 0;
                } else {
                    const rand = Math.random() * 100;
                    const rLeg = Number(config.rates?.legendary) || 0.5;
                    const rEpic = rLeg + (Number(config.rates?.epic) || 3.5);
                    const rRare = rEpic + (Number(config.rates?.rare) || 11.0);
                    const rUnc = rRare + (Number(config.rates?.uncommon) || 30.0);

                    if (rand < rLeg) rarity = 'legendary';
                    else if (rand < rEpic) rarity = 'epic';
                    else if (rand < rRare) rarity = 'rare';
                    else if (rand < rUnc) rarity = 'uncommon';
                    else rarity = 'common';
                }

                if (rarity === 'epic' || rarity === 'legendary') {
                    pityCounter = 0;
                }

                const pool = allChars.filter((c) => {
                    const r = String(c.rank || '').toLowerCase();
                    if (rarity === 'legendary') return r.includes('s-rank') || r.includes('hokage') || r.includes('kage');
                    if (rarity === 'epic') return r.includes('s-rank') || r.includes('akatsuki') || r.includes('a-rank');
                    if (rarity === 'rare') return r.includes('a-rank') || r.includes('jounin') || r.includes('jonin');
                    if (rarity === 'uncommon') return r.includes('b-rank') || r.includes('chunin') || r.includes('chuunin');
                    return r.includes('c-rank') || r.includes('d-rank') || r.includes('genin') || !r;
                });

                const candidateChars = pool.length > 0 ? pool : allChars;
                const picked = candidateChars[Math.floor(Math.random() * candidateChars.length)] || { characterId: 'naruto', name: 'Naruto Uzumaki' };
                const charId = picked.characterId || picked.id;

                let isDuplicate = unlockedSet.has(charId);
                let shardsGranted = 0;

                if (isDuplicate) {
                    shardsGranted = Number(config.duplicateShards?.[rarity]) || 10;
                    profile.chakraShards = Number(profile.chakraShards || 0) + shardsGranted;
                } else {
                    unlockedSet.add(charId);
                    newUnlockedIds.push(charId);
                }

                pulls.push({
                    characterId: charId,
                    name: picked.name || charId,
                    facePicture: picked.facePicture || 'deadcharacter-remaster.png',
                    rarity,
                    isDuplicate,
                    shardsGranted
                });
            }

            profile.unlockedCharacterIds = Array.from(unlockedSet);
            profile.gachaStats = {
                totalPulls: Number(profile.gachaStats?.totalPulls || 0) + pullCount,
                pityCounter
            };

            await usersCollection.updateOne(
                { _id: user._id },
                {
                    $set: {
                        profile,
                        updatedAt: new Date()
                    }
                }
            );

            return res.json({
                ok: true,
                pulls,
                results: pulls,
                summonScrolls: profile.summonScrolls,
                ryo: profile.ryo,
                chakraShards: profile.chakraShards,
                unlockedCharacterIds: profile.unlockedCharacterIds,
                gachaStats: profile.gachaStats
            });
        } catch (e) {
            console.error('Gacha pull error:', e);
            return res.status(500).json({ error: 'Summon failed.' });
        }
    });

    router.post('/gacha/craft-shards', requireSession, async (req, res) => {
        try {
            const user = await getGachaSessionUser(req);
            if (!user) return res.status(404).json({ error: 'User session expired. Please refresh page.' });
            const profile = normalizeUserProfile(user);

            const { craftType } = req.body;
            const shardsAvailable = Number(profile.chakraShards || 0);

            if (craftType === 'scroll') {
                const cost = 50;
                if (shardsAvailable < cost) return res.status(400).json({ error: 'Requires 50 Chakra Shards.' });
                profile.chakraShards = shardsAvailable - cost;
                profile.summonScrolls = Number(profile.summonScrolls || 0) + 1;
            } else if (craftType === 'ryo') {
                const cost = 20;
                if (shardsAvailable < cost) return res.status(400).json({ error: 'Requires 20 Chakra Shards.' });
                profile.chakraShards = shardsAvailable - cost;
                profile.ryo = Number(profile.ryo || 0) + 250;
            } else if (craftType === 'character') {
                const cost = 200;
                if (shardsAvailable < cost) return res.status(400).json({ error: 'Requires 200 Chakra Shards.' });
                const unlockedSet = new Set(Array.isArray(profile.unlockedCharacterIds) ? profile.unlockedCharacterIds : []);
                const policies = await loadRankPolicies();
                const allChars = (typeof getCharactersData === 'function' ? getCharactersData() : [])
                    .filter((character) => canShowCharacter(policies, user.role, character));
                const lockedList = allChars.filter((c) => !unlockedSet.has(c.characterId || c.id));
                if (!lockedList.length) return res.status(400).json({ error: 'You have already unlocked all available characters!' });
                const randomNinja = lockedList[Math.floor(Math.random() * lockedList.length)];
                const ninjaId = randomNinja.characterId || randomNinja.id;
                unlockedSet.add(ninjaId);
                profile.unlockedCharacterIds = Array.from(unlockedSet);
                profile.chakraShards = shardsAvailable - cost;
                res.locals.unlockedNinjaName = randomNinja.name || ninjaId;
            } else {
                return res.status(400).json({ error: 'Invalid craft type.' });
            }

            await usersCollection.updateOne(
                { _id: user._id },
                {
                    $set: {
                        profile,
                        updatedAt: new Date()
                    }
                }
            );

            return res.json({
                ok: true,
                chakraShards: profile.chakraShards,
                summonScrolls: profile.summonScrolls,
                ryo: profile.ryo,
                unlockedCharacterIds: profile.unlockedCharacterIds,
                unlockedNinjaName: res.locals.unlockedNinjaName || null
            });
        } catch (e) {
            console.error('Craft shards error:', e);
            return res.status(500).json({ error: 'Failed to exchange shards.' });
        }
    });

    return router;
};
