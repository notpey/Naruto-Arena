const fs = require('fs');
const path = require('path');

const COSMETICS_CATALOG_FILE = path.join(__dirname, '..', 'data', 'cosmeticsCatalog.json');

function getInitialCosmeticsCatalog() {
    try {
        if (fs.existsSync(COSMETICS_CATALOG_FILE)) {
            const raw = fs.readFileSync(COSMETICS_CATALOG_FILE, 'utf8');
            return JSON.parse(raw);
        }
    } catch (e) {
        console.error('Error reading cosmeticsCatalog.json:', e);
    }
    return { avatars: [], titles: [], borders: [] };
}

let inMemoryCosmetics = getInitialCosmeticsCatalog();

module.exports = function(context = {}) {
    const { appStateCollection } = context;

    async function loadCatalog() {
        if (appStateCollection) {
            try {
                const doc = await appStateCollection.findOne({ key: 'cosmetics_catalog' });
                if (doc && doc.catalog) {
                    inMemoryCosmetics = {
                        avatars: Array.isArray(doc.catalog.avatars) ? doc.catalog.avatars : [],
                        titles: Array.isArray(doc.catalog.titles) ? doc.catalog.titles : [],
                        borders: Array.isArray(doc.catalog.borders) ? doc.catalog.borders : []
                    };
                    return inMemoryCosmetics;
                }
            } catch (e) {
                console.error('Failed to load cosmetics catalog from DB:', e);
            }
        }
        if (!inMemoryCosmetics || (!inMemoryCosmetics.avatars?.length && !inMemoryCosmetics.titles?.length && !inMemoryCosmetics.borders?.length)) {
            inMemoryCosmetics = getInitialCosmeticsCatalog();
        }
        return inMemoryCosmetics;
    }

    async function saveCatalog(catalog) {
        inMemoryCosmetics = {
            avatars: Array.isArray(catalog.avatars) ? catalog.avatars : [],
            titles: Array.isArray(catalog.titles) ? catalog.titles : [],
            borders: Array.isArray(catalog.borders) ? catalog.borders : []
        };
        try {
            fs.writeFileSync(COSMETICS_CATALOG_FILE, JSON.stringify(inMemoryCosmetics, null, 2), 'utf8');
        } catch (e) {
            console.error('Failed to save cosmetics catalog to file:', e);
        }
        if (appStateCollection) {
            try {
                await appStateCollection.updateOne(
                    { key: 'cosmetics_catalog' },
                    { $set: { key: 'cosmetics_catalog', catalog: inMemoryCosmetics, updatedAt: new Date() } },
                    { upsert: true }
                );
            } catch (e) {
                console.error('Failed to save cosmetics catalog to DB:', e);
            }
        }
        return inMemoryCosmetics;
    }

    function getCatalogSync() {
        return inMemoryCosmetics;
    }

    async function addCosmeticItem(item) {
        await loadCatalog();
        const category = String(item.category || 'avatars').toLowerCase();
        if (!['avatars', 'titles', 'borders'].includes(category)) {
            throw new Error('Invalid cosmetic category');
        }
        const existingList = inMemoryCosmetics[category] || [];
        const filtered = existingList.filter(c => c.id !== item.id);
        filtered.push(item);
        inMemoryCosmetics[category] = filtered;
        await saveCatalog(inMemoryCosmetics);
        return item;
    }

    async function addCosmeticItems(items = []) {
        await loadCatalog();
        const itemsList = Array.isArray(items) ? items : [items];
        for (const item of itemsList) {
            const category = String(item.category || 'avatars').toLowerCase();
            if (['avatars', 'titles', 'borders'].includes(category)) {
                const existingList = inMemoryCosmetics[category] || [];
                const filtered = existingList.filter(c => c.id !== item.id);
                filtered.push(item);
                inMemoryCosmetics[category] = filtered;
            }
        }
        await saveCatalog(inMemoryCosmetics);
        return itemsList;
    }

    async function updateCosmeticItem(itemId, item) {
        await loadCatalog();
        const list = inMemoryCosmetics[item.category] || [];
        const index = list.findIndex(c => c.id === itemId);
        if (index === -1) return null;
        list[index] = { ...item, id: itemId };
        await saveCatalog(inMemoryCosmetics);
        return list[index];
    }

    async function deleteCosmeticItem(itemId) {
        await loadCatalog();
        for (const cat of ['avatars', 'titles', 'borders']) {
            inMemoryCosmetics[cat] = (inMemoryCosmetics[cat] || []).filter(c => c.id !== itemId);
        }
        await saveCatalog(inMemoryCosmetics);
        return true;
    }

    return {
        loadCatalog,
        saveCatalog,
        getCatalogSync,
        addCosmeticItem,
        addCosmeticItems,
        updateCosmeticItem,
        deleteCosmeticItem
    };
};
