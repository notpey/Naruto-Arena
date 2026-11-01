const express = require('express');
const { isOnSale } = require('../services/cosmeticsRules.js');

const COSMETIC_CATEGORIES = ['avatars', 'borders', 'titles'];

module.exports = function(context) {
    const router = express.Router();
    const {
        usersCollection,
        normalizeUserProfile = (user) => user?.profile || {},
        cosmeticsService,
    } = context || {};
    const requireSession = typeof context?.requireSession === 'function' ? context.requireSession : (req, res, next) => next();

    const loadCatalog = async () => {
        if (!cosmeticsService) return { avatars: [], titles: [], borders: [] };
        return typeof cosmeticsService.loadCatalog === 'function'
            ? cosmeticsService.loadCatalog()
            : cosmeticsService.getCatalogSync();
    };

    // Equipped state is stored by value (avatar URL, border URL, title name), so map it back to item ids.
    const isEquipped = (category, item, profile) => {
        if (category === 'avatars') return Boolean(item.imageUrl) && profile.avatarUrl === item.imageUrl;
        if (category === 'borders') return Boolean(profile.equippedBorder) && (profile.equippedBorder === item.imageUrl || profile.equippedBorder === item.id);
        return Boolean(profile.equippedTitle) && profile.equippedTitle === item.name;
    };

    const buildShopPayload = (profile, catalog) => {
        const inventory = profile.inventory || {};
        const items = {};
        COSMETIC_CATEGORIES.forEach((category) => {
            const owned = new Set(Array.isArray(inventory[category]) ? inventory[category] : []);
            // Drafts stay hidden; retired items only appear for the players who already own them.
            items[category] = (Array.isArray(catalog[category]) ? catalog[category] : [])
                .filter((item) => item && item.id && (isOnSale(item) || owned.has(item.id)))
                .map((item) => ({
                    id: item.id,
                    name: item.name || item.id,
                    description: item.description || '',
                    rarity: item.rarity || 'common',
                    price: Math.max(0, Number(item.price) || 0),
                    imageUrl: item.imageUrl || '',
                    category,
                    owned: owned.has(item.id),
                    retired: !isOnSale(item),
                    equipped: isEquipped(category, item, profile),
                }));
        });
        return {
            ok: true,
            ryo: Math.max(0, Number(profile.ryo) || 0),
            avatarUrl: profile.avatarUrl || '',
            equippedBorder: profile.equippedBorder || '',
            equippedTitle: profile.equippedTitle || '',
            items,
        };
    };

    router.get('/api/shop', requireSession, async (req, res) => {
        res.set('Cache-Control', 'no-store');
        try {
            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            return res.json(buildShopPayload(normalizeUserProfile(user), await loadCatalog()));
        } catch (error) {
            console.error('Shop catalog load error:', error);
            return res.status(500).json({ error: 'Unable to load the shop.' });
        }
    });

    router.post('/api/shop/purchase-cosmetic', requireSession, async (req, res) => {
        try {
            const category = String(req.body?.category || '').trim().toLowerCase();
            const itemId = String(req.body?.itemId || '').trim();
            if (!itemId || !COSMETIC_CATEGORIES.includes(category)) {
                return res.status(400).json({ error: 'A valid item and category are required.' });
            }

            const catalog = await loadCatalog();
            const item = (Array.isArray(catalog[category]) ? catalog[category] : []).find((entry) => entry && entry.id === itemId);
            if (!item || !isOnSale(item)) {
                return res.status(404).json({ error: 'That item is no longer sold in the shop.' });
            }

            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            const profile = normalizeUserProfile(user);
            const ownedList = Array.isArray(profile.inventory?.[category]) ? profile.inventory[category] : [];
            if (ownedList.includes(itemId)) {
                return res.status(400).json({ error: 'You already own this item.' });
            }
            const price = Math.max(0, Number(item.price) || 0);
            if ((Number(profile.ryo) || 0) < price) {
                return res.status(400).json({ error: `Not enough Ryo. ${item.name || 'This item'} costs ${price.toLocaleString('en-US')} Ryo.` });
            }

            // Guard the balance and ownership in the write itself so double-clicks cannot double-spend.
            const inventoryPath = `profile.inventory.${category}`;
            const purchase = await usersCollection.updateOne(
                {
                    _id: user._id,
                    'profile.ryo': { $gte: price },
                    [inventoryPath]: { $ne: itemId },
                },
                {
                    $inc: { 'profile.ryo': -price },
                    $addToSet: { [inventoryPath]: itemId },
                    $set: { updatedAt: new Date() },
                }
            );
            if (purchase.modifiedCount !== 1) {
                return res.status(409).json({ error: 'Your Ryo or inventory changed. Refresh the shop and try again.' });
            }

            const updatedUser = await usersCollection.findOne({ _id: user._id });
            return res.json({
                ...buildShopPayload(normalizeUserProfile(updatedUser), catalog),
                purchased: { id: item.id, category, name: item.name || item.id, price },
            });
        } catch (error) {
            console.error('Cosmetic purchase error:', error);
            return res.status(500).json({ error: 'Unable to complete the purchase.' });
        }
    });

    return router;
};
