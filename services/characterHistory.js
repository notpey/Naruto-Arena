'use strict';

// Version history for live characters: every save from the Character Editor, and every change a
// code update makes on deploy, is recorded with the character before and after, who made it, and
// when. The editor lists these and can load any earlier version back in to review and re-save.
const crypto = require('crypto');

const HISTORY_LIMIT = 30;

const describeAction = ({ before, after }, fallback) => {
    if (!before) return 'create';
    if (after?.retired && !before.retired) return 'retire';
    if (before.retired && after && !after.retired) return 'restore';
    return fallback;
};

function createCharacterHistory({ getCollection, log = console }) {
    const collection = () => (typeof getCollection === 'function' ? getCollection() : null);
    return {
        // changes: [{ characterId, before, after }] from diffRosters.
        async record(changes, { savedBy = '', action = 'edit', rosterVersion = null } = {}) {
            const store = collection();
            if (!store || !Array.isArray(changes) || !changes.length) return;
            const savedAt = new Date();
            const entries = changes.map((change) => ({
                entryId: crypto.randomBytes(8).toString('hex'),
                characterId: change.characterId,
                action: describeAction(change, action),
                savedBy,
                savedAt,
                rosterVersion,
                before: change.before || null,
                after: change.after || null,
            }));
            try {
                await store.insertMany(entries);
            } catch (error) {
                log.warn('Could not record character history.', error);
            }
        },
        async list(characterId, limit = HISTORY_LIMIT) {
            const store = collection();
            if (!store) return [];
            return store.find({ characterId }, { projection: { _id: 0 } })
                .sort({ savedAt: -1 })
                .limit(Math.max(1, Math.min(HISTORY_LIMIT, Number(limit) || HISTORY_LIMIT)))
                .toArray();
        },
        async ensureIndexes() {
            const store = collection();
            if (store) await store.createIndex({ characterId: 1, savedAt: -1 });
        },
    };
}

module.exports = { createCharacterHistory, HISTORY_LIMIT };
