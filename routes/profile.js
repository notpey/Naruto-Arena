const express = require('express');
const Joi = require('joi');
const { AvatarImageError, prepareAvatarDataUrl } = require('../services/avatarImage');

module.exports = function(context) {
    const router = express.Router();
    const {
        usersCollection,
        normalizeUserProfile = (p) => p,
        serializeUserForClient = (u) => u,
        serializePublicUserProfile = (u) => u,
        avatarUpdateSchema,
        prepareAvatarUrl = async (url) => url,
        validateBackgroundUrl = () => ({ valid: true }),
        getExperienceRequiredForNextLevel = () => 200,
        recalculatePlayerLadderStandings = () => {},
        findBattleBotPublicProfile = async () => null,
    } = context || {};
    const requireSession = typeof context?.requireSession === 'function' ? context.requireSession : (req, res, next) => next();

    const publicProfileLookupSchema = Joi.object({
        username: Joi.string().trim().min(1).max(64).required(),
    });

    const matchmakingSettingsSchema = Joi.object({
        battleBotEnabled: Joi.boolean().required(),
    });

    const backgroundUpdateSchema = Joi.object({
        selectionUrl: Joi.string().trim().allow('').max(2048).default(''),
        ingameUrl: Joi.string().trim().allow('').max(2048).default(''),
    });

    router.get('/api/users/:username/profile', async (req, res) => {
        res.set('Cache-Control', 'no-store');
        const { error: validationError, value } = publicProfileLookupSchema.validate({
            username: req.params.username,
        });
        if (validationError) {
            return res.status(400).json({ error: 'Invalid username.' });
        }
        const requestedUsername = value.username.trim();
        const normalizedRequestedUsername = requestedUsername.toLowerCase();
        let user = await usersCollection.findOne({ usernameLower: normalizedRequestedUsername });
        if (!user) {
            user = await usersCollection.findOne({ username: requestedUsername });
        }
        if (!user) {
            const users = await usersCollection
                .find({}, { projection: { _id: 1, username: 1 } })
                .toArray();
            const matchedUser = users.find((candidate) => {
                const candidateUsername =
                    typeof candidate?.username === 'string' ? candidate.username.trim().toLowerCase() : '';
                return candidateUsername === normalizedRequestedUsername;
            });
            if (matchedUser?._id) {
                user = await usersCollection.findOne({ _id: matchedUser._id });
                if (user) {
                    await usersCollection.updateOne(
                        { _id: matchedUser._id },
                        { $set: { usernameLower: normalizedRequestedUsername } }
                    );
                }
            }
        }
        if (!user) {
            const botProfile = await Promise.resolve(findBattleBotPublicProfile(requestedUsername)).catch(() => null);
            if (botProfile) {
                return res.json({ ok: true, user: botProfile });
            }
            return res.status(404).json({ error: 'Player not found.' });
        }

        return res.json({
            ok: true,
            user: serializePublicUserProfile(user),
        });
    });

    router.post('/api/profile/avatar', requireSession, async (req, res) => {
        try {
            const { error: validationError, value } = avatarUpdateSchema.validate(req.body || {});
            if (validationError) {
                return res.status(400).json({ error: 'A valid direct image URL is required.' });
            }

            const avatarUrl = await prepareAvatarUrl(value.avatarUrl);
            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            const profile = normalizeUserProfile(user);
            profile.avatarUrl = avatarUrl;
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { profile } }
            );
            const updatedUser = {
                ...user,
                profile,
            };
            return res.json({
                ok: true,
                user: serializeUserForClient(updatedUser),
            });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Unable to update avatar.' });
        }
    });

    router.post('/api/profile/avatar/upload', requireSession, async (req, res) => {
        try {
            const avatarUrl = await prepareAvatarDataUrl(req.body?.dataUrl);
            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            const profile = normalizeUserProfile(user);
            profile.avatarUrl = avatarUrl;
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { profile } }
            );
            const updatedUser = { ...user, profile };
            return res.json({
                ok: true,
                user: serializeUserForClient(updatedUser),
            });
        } catch (error) {
            if (error instanceof AvatarImageError) {
                return res.status(400).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Unable to upload avatar.' });
        }
    });

    router.post('/api/profile/matchmaking', requireSession, async (req, res) => {
        try {
            const { error: validationError, value } = matchmakingSettingsSchema.validate(req.body || {});
            if (validationError) {
                return res.status(400).json({ error: 'A valid matchmaking preference is required.' });
            }
            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            const profile = normalizeUserProfile(user);
            profile.matchmaking = {
                ...profile.matchmaking,
                battleBotEnabled: Boolean(value.battleBotEnabled),
            };
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { profile } }
            );
            return res.json({
                ok: true,
                user: serializeUserForClient({
                    ...user,
                    profile,
                }),
            });
        } catch (error) {
            return res.status(500).json({ error: 'Unable to update matchmaking settings.' });
        }
    });

    router.post('/api/profile/reset-account', requireSession, async (req, res) => {
        try {
            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            const profile = normalizeUserProfile(user);
            profile.recentQuickGames = [];
            profile.recentPrivateGames = [];
            profile.recentLadderGames = [];
            profile.ladder.level = 1;
            profile.ladder.rank = 'Academy Student';
            profile.ladder.rankHatUrl = 'hats/academy.png';
            profile.ladder.experiencePoints = 0;
            profile.ladder.experienceIntoLevel = 0;
            profile.ladder.experienceForNextLevel = getExperienceRequiredForNextLevel(1);
            profile.ladder.experienceToNextLevel = getExperienceRequiredForNextLevel(1);
            profile.ladder.ladderRank = null;
            profile.ladder.wins = 0;
            profile.ladder.losses = 0;
            profile.ladder.streak = 0;
            profile.ladder.highestStreak = 0;
            profile.ladder.highestLevel = 1;
            profile.ladder.famePoints = 0;
            profile.ladder.isHokage = false;

            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { profile } }
            );
            await recalculatePlayerLadderStandings();
            const updatedUser = await usersCollection.findOne({ _id: user._id });

            return res.json({
                ok: true,
                user: serializeUserForClient(updatedUser || { ...user, profile }),
            });
        } catch (error) {
            console.error('Reset account error:', error);
            return res.status(500).json({ error: 'Unable to reset account.' });
        }
    });

    router.post('/api/profile/backgrounds', requireSession, async (req, res) => {
        try {
            const { error: validationError, value } = backgroundUpdateSchema.validate(req.body || {});
            if (validationError) {
                return res.status(400).json({ error: 'Direct background URLs are required.' });
            }

            await validateBackgroundUrl(value.selectionUrl);
            await validateBackgroundUrl(value.ingameUrl);

            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            const profile = normalizeUserProfile(user);
            profile.backgrounds = {
                selectionUrl: value.selectionUrl,
                ingameUrl: value.ingameUrl,
            };

            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { profile } }
            );

            return res.json({
                ok: true,
                user: serializeUserForClient({
                    ...user,
                    profile,
                }),
            });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Unable to update backgrounds.' });
        }
    });

    router.get('/api/profile/inventory', requireSession, async (req, res) => {
        try {
            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            const rawProfile = normalizeUserProfile(user);
            const profile = rawProfile.profile || rawProfile;
            const cosmeticsCatalog = context.cosmeticsService
                ? (typeof context.cosmeticsService.loadCatalog === 'function'
                    ? await context.cosmeticsService.loadCatalog()
                    : context.cosmeticsService.getCatalogSync())
                : { avatars: [], titles: [], borders: [] };

            const userInventory = profile.inventory || { avatars: [], titles: [], borders: [], customTitles: [] };
            
            // Hydrate owned items with their catalog details
            const ownedAvatars = (cosmeticsCatalog.avatars || []).filter(a => (userInventory.avatars || []).includes(a.id));
            const ownedTitles = (cosmeticsCatalog.titles || []).filter(t => (userInventory.titles || []).includes(t.id));
            const ownedBorders = (cosmeticsCatalog.borders || []).filter(b => (userInventory.borders || []).includes(b.id));
            const customTitles = userInventory.customTitles || [];

            return res.json({
                ok: true,
                inventory: userInventory,
                equippedTitle: profile.equippedTitle || '',
                equippedBorder: profile.equippedBorder || '',
                avatarUrl: profile.avatarUrl || '',
                avatars: ownedAvatars,
                titles: ownedTitles,
                borders: ownedBorders,
                customTitles,
                ownedItems: {
                    avatars: ownedAvatars,
                    titles: ownedTitles,
                    borders: ownedBorders,
                    customTitles
                },
                catalog: cosmeticsCatalog,
                ryo: profile.ryo || 0,
                backgrounds: {
                    selectionUrl: profile.backgrounds?.selectionUrl || '',
                    ingameUrl: profile.backgrounds?.ingameUrl || '',
                },
            });
        } catch (error) {
            console.error('Fetch inventory error:', error);
            return res.status(500).json({ error: 'Unable to load inventory.' });
        }
    });

    router.post('/api/profile/equip', requireSession, async (req, res) => {
        try {
            const { type, itemId, customStyle } = req.body || {};
            const cleanType = String(type || '').trim().toLowerCase();
            const cleanItemId = typeof itemId === 'string' ? itemId.trim() : '';

            if (!['avatar', 'title', 'border'].includes(cleanType)) {
                return res.status(400).json({ error: 'Type must be avatar, title, or border.' });
            }

            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            const rawProfile = normalizeUserProfile(user);
            const profile = rawProfile.profile || rawProfile;
            const inventory = profile.inventory || { avatars: [], titles: [], borders: [], customTitles: [] };
            const cosmeticsCatalog = context.cosmeticsService
                ? (typeof context.cosmeticsService.loadCatalog === 'function' ? await context.cosmeticsService.loadCatalog() : context.cosmeticsService.getCatalogSync())
                : { avatars: [], titles: [], borders: [] };
            let message = '';

            // Only owned catalog items can be equipped; custom avatar URLs go through the validated avatar routes.
            if (cleanType === 'avatar') {
                if (!cleanItemId) {
                    profile.avatarUrl = '';
                    message = 'Restored the default avatar.';
                } else {
                    const catalogItem = (cosmeticsCatalog.avatars || []).find(a => a.id === cleanItemId || a.imageUrl === cleanItemId);
                    if (!catalogItem) {
                        return res.status(404).json({ error: 'That avatar is not in the catalog.' });
                    }
                    if (!(inventory.avatars || []).includes(catalogItem.id)) {
                        return res.status(403).json({ error: 'You do not own this avatar.' });
                    }
                    profile.avatarUrl = catalogItem.imageUrl;
                    message = `Equipped ${catalogItem.name || 'avatar'}.`;
                }
            } else if (cleanType === 'title') {
                if (!cleanItemId) {
                    profile.equippedTitle = '';
                    message = 'Removed your title.';
                } else {
                    const customTitle = (inventory.customTitles || []).find(t => (typeof t === 'string' ? t : t?.id || t?.name) === cleanItemId);
                    if (customTitle) {
                        profile.equippedTitle = typeof customTitle === 'string' ? customTitle : String(customTitle.name || customTitle.id);
                    } else {
                        if (!(inventory.titles || []).includes(cleanItemId)) {
                            return res.status(403).json({ error: 'You do not own this title.' });
                        }
                        const tObj = (cosmeticsCatalog.titles || []).find(t => t.id === cleanItemId);
                        profile.equippedTitle = tObj ? tObj.name : cleanItemId;
                    }
                    message = `Equipped title: ${profile.equippedTitle}.`;
                }
            } else if (cleanType === 'border') {
                if (!cleanItemId) {
                    profile.equippedBorder = '';
                    message = 'Removed your border.';
                } else {
                    const bObj = (cosmeticsCatalog.borders || []).find(b => b.id === cleanItemId || b.imageUrl === cleanItemId);
                    if (!bObj) {
                        return res.status(404).json({ error: 'That border is not in the catalog.' });
                    }
                    if (!(inventory.borders || []).includes(bObj.id)) {
                        return res.status(403).json({ error: 'You do not own this border.' });
                    }
                    profile.equippedBorder = bObj.imageUrl || bObj.id;
                    message = `Equipped ${bObj.name || 'border'}.`;
                }
            }

            const normalizedProfile = normalizeUserProfile({ ...user, profile });
            const savedProfile = normalizedProfile.profile || normalizedProfile;
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { profile: savedProfile, updatedAt: new Date() } }
            );

            return res.json({
                ok: true,
                message,
                equippedTitle: savedProfile.equippedTitle,
                equippedBorder: savedProfile.equippedBorder,
                avatarUrl: savedProfile.avatarUrl,
                inventory: savedProfile.inventory
            });
        } catch (error) {
            console.error('Equip item error:', error);
            return res.status(500).json({ error: 'Unable to equip item.' });
        }
    });

    return router;
};
