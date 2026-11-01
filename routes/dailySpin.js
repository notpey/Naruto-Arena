const express = require('express');
const crypto = require('node:crypto');
const { isOnSale } = require('../services/cosmeticsRules.js');

// Wheel slices in display order, clockwise from the top. Weights are relative chances.
// A prize slice the player can't use (they own everything in it) pays its fallback Ryo instead.
const WHEEL = [
    { id: 'ryo-50', kind: 'ryo', ryo: 50, weight: 20, label: '50 Ryo' },
    { id: 'avatar', kind: 'avatars', weight: 16, label: 'Avatar', fallbackRyo: 100 },
    { id: 'ryo-100', kind: 'ryo', ryo: 100, weight: 14, label: '100 Ryo' },
    { id: 'title', kind: 'titles', weight: 12, label: 'Title', fallbackRyo: 150 },
    { id: 'ryo-150', kind: 'ryo', ryo: 150, weight: 8, label: '150 Ryo' },
    { id: 'border', kind: 'borders', weight: 10, label: 'Border', fallbackRyo: 200 },
    { id: 'ryo-75', kind: 'ryo', ryo: 75, weight: 15, label: '75 Ryo' },
    { id: 'character', kind: 'character', weight: 5, label: 'Character', fallbackRyo: 300 },
];

const todayKey = (now = new Date()) => now.toISOString().slice(0, 10);
const nextResetAt = (now = new Date()) => {
    const reset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
    return reset.toISOString();
};

module.exports = function(context) {
    const router = express.Router();
    const {
        usersCollection,
        normalizeUserProfile = (user) => user?.profile || {},
        cosmeticsService,
        characterService,
        characterRankAccess,
        getCharacterAvailability,
        getMissionLockedCharacterIds = async () => new Set(),
        normalizeCharacterId = (value) => String(value || '').trim(),
    } = context || {};
    const requireSession = typeof context?.requireSession === 'function' ? context.requireSession : (req, res, next) => next();
    // Injectable so tests can force outcomes.
    const randomInt = typeof context?.randomInt === 'function' ? context.randomInt : crypto.randomInt;
    const clock = typeof context?.now === 'function' ? context.now : () => new Date();

    const loadCatalog = async () => {
        if (!cosmeticsService) return { avatars: [], borders: [], titles: [] };
        return typeof cosmeticsService.loadCatalog === 'function' ? cosmeticsService.loadCatalog() : cosmeticsService.getCatalogSync();
    };

    // Everything the player could still win, per wheel prize.
    const getPrizePools = async (user, profile) => {
        const catalog = await loadCatalog();
        const inventory = profile.inventory || {};
        const pools = {};
        ['avatars', 'borders', 'titles'].forEach((category) => {
            const owned = new Set(Array.isArray(inventory[category]) ? inventory[category] : []);
            pools[category] = (Array.isArray(catalog[category]) ? catalog[category] : [])
                .filter((item) => item && item.id && isOnSale(item) && !owned.has(item.id));
        });
        const policies = await (characterRankAccess?.getPolicies?.() || Promise.resolve({}));
        const lockedCharacterIds = await getMissionLockedCharacterIds();
        const characters = characterService ? characterService.getCharacters() : [];
        pools.character = (Array.isArray(characters) ? characters : []).filter((character) => {
            const characterId = normalizeCharacterId(character?.characterId);
            if (!characterId || typeof getCharacterAvailability !== 'function') return false;
            const access = getCharacterAvailability({ policies, user, profile, characterId, lockedCharacterIds });
            return !access.hidden && !access.unlocked;
        });
        return pools;
    };

    const describeWheel = (pools) => WHEEL.map((slice) => ({
        id: slice.id,
        kind: slice.kind,
        label: slice.label,
        ryo: slice.ryo || 0,
        chance: slice.weight,
        exhausted: slice.kind !== 'ryo' && !(pools[slice.kind] || []).length,
        fallbackRyo: slice.fallbackRyo || 0,
    }));

    const pickSlice = () => {
        const total = WHEEL.reduce((sum, slice) => sum + slice.weight, 0);
        let roll = randomInt(total);
        for (let index = 0; index < WHEEL.length; index += 1) {
            roll -= WHEEL[index].weight;
            if (roll < 0) return index;
        }
        return 0;
    };

    router.get('/api/daily-spin', requireSession, async (req, res) => {
        res.set('Cache-Control', 'no-store');
        try {
            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) return res.status(404).json({ error: 'User not found.' });
            const profile = normalizeUserProfile(user);
            const spin = profile.dailySpin || {};
            const now = clock();
            const available = spin.lastSpinDate !== todayKey(now);
            return res.json({
                ok: true,
                available,
                nextSpinAt: nextResetAt(now),
                totalSpins: spin.totalSpins || 0,
                lastResult: available ? null : spin.lastResult || null,
                wheel: describeWheel(await getPrizePools(user, profile)),
            });
        } catch (error) {
            console.error('Daily spin load error:', error);
            return res.status(500).json({ error: 'Unable to load the daily spin.' });
        }
    });

    router.post('/api/daily-spin', requireSession, async (req, res) => {
        try {
            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) return res.status(404).json({ error: 'User not found.' });
            const profile = normalizeUserProfile(user);
            const now = clock();
            const today = todayKey(now);
            if ((profile.dailySpin || {}).lastSpinDate === today) {
                return res.status(409).json({ error: 'You already spun today. Come back after the daily reset.', nextSpinAt: nextResetAt(now) });
            }

            const pools = await getPrizePools(user, profile);
            const sliceIndex = pickSlice();
            const slice = WHEEL[sliceIndex];
            const update = { $set: { updatedAt: now } };
            let reward;

            const pool = slice.kind === 'ryo' ? null : pools[slice.kind] || [];
            if (slice.kind === 'ryo' || !pool.length) {
                const amount = slice.kind === 'ryo' ? slice.ryo : slice.fallbackRyo;
                reward = { kind: 'ryo', ryo: amount, fallback: slice.kind !== 'ryo', prize: slice.kind };
                update.$inc = { 'profile.ryo': amount };
            } else if (slice.kind === 'character') {
                const character = pool[randomInt(pool.length)];
                const characterId = normalizeCharacterId(character.characterId);
                reward = { kind: 'character', character: { characterId, name: character.name || characterId, facePicture: character.facePicture || '' } };
                update.$addToSet = { 'profile.missions.unlockedCharacterIds': characterId };
            } else {
                const item = pool[randomInt(pool.length)];
                reward = {
                    kind: slice.kind,
                    item: { id: item.id, name: item.name || item.id, category: slice.kind, rarity: item.rarity || 'common', imageUrl: item.imageUrl || '', description: item.description || '' },
                };
                update.$addToSet = { [`profile.inventory.${slice.kind}`]: item.id };
            }

            update.$set['profile.dailySpin.lastSpinDate'] = today;
            update.$set['profile.dailySpin.lastResult'] = { sliceId: slice.id, ...reward, spunAt: now };
            update.$inc = { ...(update.$inc || {}), 'profile.dailySpin.totalSpins': 1 };

            // The date guard is part of the write, so two spins at once can't both pay out.
            const result = await usersCollection.updateOne(
                { _id: user._id, 'profile.dailySpin.lastSpinDate': { $ne: today } },
                update
            );
            if (result.modifiedCount !== 1) {
                return res.status(409).json({ error: 'You already spun today. Come back after the daily reset.', nextSpinAt: nextResetAt(now) });
            }

            const savedProfile = normalizeUserProfile(await usersCollection.findOne({ _id: user._id }));
            return res.json({
                ok: true,
                sliceIndex,
                sliceId: slice.id,
                reward,
                ryo: Math.max(0, Number(savedProfile.ryo) || 0),
                nextSpinAt: nextResetAt(now),
            });
        } catch (error) {
            console.error('Daily spin error:', error);
            return res.status(500).json({ error: 'The wheel jammed. Try again.' });
        }
    });

    return router;
};

module.exports.WHEEL = WHEEL;
