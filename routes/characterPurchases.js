const express = require('express');

module.exports = function(context) {
    const router = express.Router();
    const {
        usersCollection,
        normalizeUserProfile,
        getMissionLockedCharacterIds,
        getStoredMissionCatalog,
        characterService,
        profileHasUnlockedCharacter,
        characterRankAccess,
        getCharacterAvailability,
        getCharacterPriceForMissionId,
        normalizeCharacterId,
        normalizeMissionState,
    } = context || {};
    const requireSession = typeof context?.requireSession === 'function' ? context.requireSession : (req, res, next) => next();
    const loadRankPolicies = () => characterRankAccess?.getPolicies?.() || Promise.resolve({});
    const resolveAvailability = (args) => typeof getCharacterAvailability === 'function'
        ? getCharacterAvailability(args)
        : { hidden: false, unlocked: profileHasUnlockedCharacter(
            args.profile, args.characterId, args.lockedCharacterIds
        ) };

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
                ? getCharacterPriceForMissionId(requiredMissionId, missionCatalog)
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

            const purchase = await usersCollection.updateOne(
                {
                    _id: user._id,
                    'profile.ryo': { $gte: price },
                    'profile.missions.unlockedCharacterIds': { $ne: characterId },
                },
                {
                    $inc: { 'profile.ryo': -price },
                    $addToSet: { 'profile.missions.unlockedCharacterIds': characterId },
                    $set: { updatedAt: new Date() },
                }
            );
            if (purchase.modifiedCount !== 1) {
                return res.status(409).json({ error: 'Your Ryo or character access changed. Refresh the roster and try again.' });
            }
            const updatedUser = await usersCollection.findOne({ _id: user._id });
            const savedProfile = normalizeUserProfile(updatedUser);

            return res.json({
                ok: true,
                characterId,
                price,
                ryo: savedProfile.ryo,
                unlockedCharacterIds: normalizeMissionState(savedProfile.missions).unlockedCharacterIds,
                missionProgressByMissionId: normalizeMissionState(savedProfile.missions).progressByMissionId,
            });
        } catch (error) {
            console.error('Direct character buy error:', error);
            return res.status(500).json({ error: 'Unable to purchase character.' });
        }
    });

    return router;
};
