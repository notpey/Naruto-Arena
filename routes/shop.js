const express = require('express');

module.exports = function(context) {
    const router = express.Router();
    const {
        usersCollection,
        normalizeUserProfile,
        getMissionLockedCharacterIds,
        getStoredMissionCatalog,
        characterService,
        cosmeticsService,
        profileHasUnlockedCharacter,
        characterRankAccess,
        getCharacterAvailability,
        getShopPriceForMissionId,
        normalizeCharacterId,
        normalizeMissionState,
        normalizeMissionProgressEntry,
    } = context || {};
    const requireSession = typeof context?.requireSession === 'function' ? context.requireSession : (req, res, next) => next();
    const loadRankPolicies = () => characterRankAccess?.getPolicies?.() || Promise.resolve({});
    const resolveAvailability = (args) => typeof getCharacterAvailability === 'function'
        ? getCharacterAvailability(args)
        : { hidden: false, unlocked: profileHasUnlockedCharacter(
            args.profile, args.characterId, args.lockedCharacterIds
        ) };

    router.get('/api/shop', requireSession, async (req, res) => {
        try {
            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            const profile = normalizeUserProfile(user);
            const lockedCharacterIds = await getMissionLockedCharacterIds();
            const policies = await loadRankPolicies();
            const missionCatalog = await getStoredMissionCatalog();
            const catalog = characterService ? characterService.getCharacterCatalog() : [];
            const characters = catalog.filter((character) => {
                if (!character.requiredMissionId) {
                    return false;
                }
                const access = resolveAvailability({
                    policies, user, profile, characterId: character.characterId, lockedCharacterIds,
                });
                return !access.hidden && !access.unlocked;
            }).map((character) => {
                const shopPrice = getShopPriceForMissionId(character.requiredMissionId, missionCatalog);
                return {
                    ...character,
                    shopPrice,
                };
            });

            const cosmeticsCatalog = cosmeticsService
                ? (typeof cosmeticsService.loadCatalog === 'function' ? await cosmeticsService.loadCatalog() : cosmeticsService.getCatalogSync())
                : { avatars: [], titles: [], borders: [] };

            return res.json({
                ok: true,
                ryo: profile.ryo,
                inventory: profile.inventory || { avatars: [], titles: [], borders: [], customTitles: [] },
                equippedTitle: profile.equippedTitle || '',
                equippedBorder: profile.equippedBorder || '',
                avatarUrl: profile.avatarUrl || '',
                characters,
                cosmetics: cosmeticsCatalog,
            });
        } catch (error) {
            console.error('Shop catalog load error:', error);
            return res.status(500).json({ error: 'Unable to load shop.' });
        }
    });

    router.post('/api/shop/purchase-cosmetic', requireSession, async (req, res) => {
        try {
            const { itemId, category } = req.body || {};
            const cleanCategory = String(category || '').trim().toLowerCase();
            const cleanItemId = String(itemId || '').trim();

            if (!cleanItemId || !['avatars', 'titles', 'borders'].includes(cleanCategory)) {
                return res.status(400).json({ error: 'Valid cosmetic itemId and category are required.' });
            }

            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            const rawProfile = normalizeUserProfile(user);
            const profile = rawProfile.profile || rawProfile;
            const inventory = profile.inventory || { avatars: [], titles: [], borders: [], customTitles: [] };
            const ownedList = inventory[cleanCategory] || [];

            if (ownedList.includes(cleanItemId)) {
                return res.status(400).json({ error: 'You already own this item.' });
            }

            const cosmeticsCatalog = cosmeticsService
                ? (typeof cosmeticsService.loadCatalog === 'function' ? await cosmeticsService.loadCatalog() : cosmeticsService.getCatalogSync())
                : { avatars: [], titles: [], borders: [] };

            const categoryList = cosmeticsCatalog[cleanCategory] || [];
            const item = categoryList.find(c => c.id === cleanItemId);
            if (!item) {
                return res.status(404).json({ error: 'Cosmetic item not found in shop catalog.' });
            }

            const price = Math.max(0, Number(item.price) || 0);
            if ((Number(profile.ryo) || 0) < price) {
                return res.status(400).json({ error: `Not enough Ryo. Required: ${price} Ryo.` });
            }

            profile.ryo = Math.max(0, (Number(profile.ryo) || 0) - price);
            inventory[cleanCategory] = Array.from(new Set([...ownedList, cleanItemId]));
            profile.inventory = inventory;

            const normalizedProfile = normalizeUserProfile({ ...user, profile });
            const savedProfile = normalizedProfile.profile || normalizedProfile;
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { profile: savedProfile, updatedAt: new Date() } }
            );

            return res.json({
                ok: true,
                message: `Purchased ${item.name}!`,
                ryo: savedProfile.ryo,
                inventory: savedProfile.inventory,
                item
            });
        } catch (error) {
            console.error('Cosmetic purchase error:', error);
            return res.status(500).json({ error: 'Unable to complete cosmetic purchase.' });
        }
    });

    router.post('/api/shop/purchase', requireSession, async (req, res) => {
        try {
            const characterId = normalizeCharacterId(req.body?.characterId);
            if (!characterId) {
                return res.status(400).json({ error: 'Character is required.' });
            }
            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            const charactersData = characterService ? characterService.getCharacters() : [];
            const characterEntry = (Array.isArray(charactersData) ? charactersData : []).find(
                (entry) => normalizeCharacterId(entry && entry.characterId) === characterId
            );
            const requiredMissionId =
                characterEntry && typeof characterEntry.requiredMissionId === 'string'
                    ? characterEntry.requiredMissionId.trim()
                    : '';
            if (!characterEntry || !requiredMissionId) {
                return res.status(400).json({ error: 'This character is not available in the shop.' });
            }
            const missionCatalog = await getStoredMissionCatalog();
            const shopPrice = getShopPriceForMissionId(requiredMissionId, missionCatalog);

            const profile = normalizeUserProfile(user);
            const lockedCharacterIds = await getMissionLockedCharacterIds();
            const access = resolveAvailability({
                policies: await loadRankPolicies(), user, profile,
                characterId, lockedCharacterIds,
            });
            if (access.hidden) {
                return res.status(403).json({ error: 'This character is unavailable for your web rank.' });
            }
            if (access.unlocked) {
                return res.status(400).json({ error: 'Character already unlocked.' });
            }
            if ((Number(profile.ryo) || 0) < shopPrice) {
                return res.status(400).json({ error: 'Not enough Ryo.' });
            }

            const missionState = normalizeMissionState(profile.missions);
            const unlockedIds = new Set(missionState.unlockedCharacterIds || []);
            unlockedIds.add(characterId);
            const progressByMissionId = { ...(missionState.progressByMissionId || {}) };
            const existingProgress = normalizeMissionProgressEntry(
                progressByMissionId[requiredMissionId] || {}
            );
            progressByMissionId[requiredMissionId] = normalizeMissionProgressEntry({
                ...existingProgress,
                completedAt: existingProgress.completedAt || new Date(),
            });

            profile.ryo = Math.max(0, (Number(profile.ryo) || 0) - shopPrice);
            profile.missions = {
                ...profile.missions,
                progressByMissionId,
                progress: progressByMissionId,
                unlockedCharacterIds: Array.from(unlockedIds),
            };

            const normalizedProfile = normalizeUserProfile({ ...user, profile });
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { profile: normalizedProfile } }
            );

            return res.json({
                ok: true,
                ryo: normalizedProfile.ryo,
                unlockedCharacterIds: normalizedProfile.missions.unlockedCharacterIds,
                missionProgressByMissionId: normalizedProfile.missions.progressByMissionId,
            });
        } catch (error) {
            console.error('Shop purchase error:', error);
            return res.status(500).json({ error: 'Unable to complete purchase.' });
        }
    });

    router.post('/api/characters/buy-direct', requireSession, async (req, res) => {
        try {
            const characterId = normalizeCharacterId(req.body?.characterId);
            if (!characterId) {
                return res.status(400).json({ error: 'Character ID is required.' });
            }
            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            const charactersData = characterService ? characterService.getCharacters() : [];
            const characterEntry = (Array.isArray(charactersData) ? charactersData : []).find(
                (entry) => normalizeCharacterId(entry && entry.characterId) === characterId
            );
            if (!characterEntry) {
                return res.status(400).json({ error: 'Character not found.' });
            }

            const requiredMissionId =
                typeof characterEntry.requiredMissionId === 'string'
                    ? characterEntry.requiredMissionId.trim()
                    : '';
            const missionCatalog = await getStoredMissionCatalog();
            const price = requiredMissionId
                ? getShopPriceForMissionId(requiredMissionId, missionCatalog)
                : 1000;

            const profile = normalizeUserProfile(user);
            const lockedCharacterIds = await getMissionLockedCharacterIds();
            const access = resolveAvailability({
                policies: await loadRankPolicies(), user, profile,
                characterId, lockedCharacterIds,
            });
            if (access.hidden) {
                return res.status(403).json({ error: 'This character is unavailable for your web rank.' });
            }
            if (access.unlocked) {
                return res.status(400).json({ error: 'Character already unlocked.' });
            }
            if ((Number(profile.ryo) || 0) < price) {
                return res.status(400).json({ error: `Not enough Ryo. Required: ${price} Ryo.` });
            }

            const missionState = normalizeMissionState(profile.missions);
            const unlockedIds = new Set(missionState.unlockedCharacterIds || []);
            unlockedIds.add(characterId);
            const progressByMissionId = { ...(missionState.progressByMissionId || {}) };
            if (requiredMissionId) {
                const existingProgress = normalizeMissionProgressEntry(
                    progressByMissionId[requiredMissionId] || {}
                );
                progressByMissionId[requiredMissionId] = normalizeMissionProgressEntry({
                    ...existingProgress,
                    completedAt: existingProgress.completedAt || new Date(),
                });
            }

            profile.ryo = Math.max(0, (Number(profile.ryo) || 0) - price);
            profile.missions = {
                ...profile.missions,
                progressByMissionId,
                progress: progressByMissionId,
                unlockedCharacterIds: Array.from(unlockedIds),
            };

            const normalizedProfile = normalizeUserProfile({ ...user, profile });
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { profile: normalizedProfile } }
            );

            return res.json({
                ok: true,
                characterId,
                price,
                ryo: normalizedProfile.ryo,
                unlockedCharacterIds: normalizedProfile.missions.unlockedCharacterIds,
                missionProgressByMissionId: normalizedProfile.missions.progressByMissionId,
            });
        } catch (error) {
            console.error('Direct character buy error:', error);
            return res.status(500).json({ error: 'Unable to purchase character.' });
        }
    });

    return router;
};
