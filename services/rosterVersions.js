'use strict';

// Live roster versions. Every save of the roster gets a new version id. A match records the
// version it started on (match.rosterVersion), and keeps playing on that version's character
// data until it ends, so a balance change only reaches matches that start after it.
//
// Older versions still in use are kept in memory and in app_state ("roster_snapshot:<id>")
// so a restart or deploy mid-match doesn't move those matches onto the new numbers.
// Matches created before versions existed have no rosterVersion and use the current roster.

const crypto = require('crypto');

const SNAPSHOT_KEY_PREFIX = 'roster_snapshot:';

const newRosterVersionId = () =>
    `r${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}`;

const sameData = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// getLocalMatches: matches held in memory, which may not have reached the database yet.
function createRosterVersions({ getAppState, getMatches, getLocalMatches, log = console } = {}) {
    let version = null;
    const snapshots = new Map();

    const appState = () => (typeof getAppState === 'function' ? getAppState() : null);
    const matches = () => (typeof getMatches === 'function' ? getMatches() : null);

    const activeVersions = async () => {
        const inUse = new Set();
        const local = typeof getLocalMatches === 'function' ? getLocalMatches() : null;
        for (const match of local || []) {
            if (match && match.status !== 'ended' && typeof match.rosterVersion === 'string') inUse.add(match.rosterVersion);
        }
        const collection = matches();
        if (!collection || typeof collection.distinct !== 'function') return inUse;
        const versions = await collection.distinct('rosterVersion', {
            status: { $ne: 'ended' },
            rosterVersion: { $type: 'string' },
        });
        versions.forEach((entry) => inUse.add(entry));
        return inUse;
    };

    const persistSnapshot = async (snapshotVersion, characters) => {
        const collection = appState();
        if (!collection || !snapshotVersion) return;
        await collection.updateOne(
            { key: SNAPSHOT_KEY_PREFIX + snapshotVersion },
            { $set: { key: SNAPSHOT_KEY_PREFIX + snapshotVersion, rosterVersion: snapshotVersion,
                characters, createdAt: new Date() } },
            { upsert: true }
        );
    };

    // Drops snapshots no unfinished match uses any more, in memory and in storage.
    const prune = async () => {
        const inUse = await activeVersions();
        for (const key of [...snapshots.keys()]) {
            if (!inUse.has(key)) snapshots.delete(key);
        }
        const collection = appState();
        if (collection && typeof collection.deleteMany === 'function') {
            const keep = [...inUse].filter((entry) => entry !== version)
                .map((entry) => SNAPSHOT_KEY_PREFIX + entry);
            await collection.deleteMany({
                key: { $regex: `^${SNAPSHOT_KEY_PREFIX}`, $nin: keep },
            });
        }
    };

    // Loads the snapshots that unfinished matches still need after a restart.
    const loadSnapshotsInUse = async () => {
        const collection = appState();
        if (!collection) return;
        const inUse = [...await activeVersions()].filter((entry) => entry !== version && !snapshots.has(entry));
        for (const entry of inUse) {
            const doc = await collection.findOne({ key: SNAPSHOT_KEY_PREFIX + entry });
            if (doc && Array.isArray(doc.characters)) snapshots.set(entry, doc.characters);
        }
    };

    return {
        get version() { return version; },

        // The character list a match plays with: its own version's, or the current roster.
        forMatch(match, currentCharacters) {
            const matchVersion = match && typeof match.rosterVersion === 'string' ? match.rosterVersion : '';
            if (!matchVersion || matchVersion === version) return currentCharacters;
            return snapshots.get(matchVersion) || currentCharacters;
        },

        // Called as a match is created.
        stamp(match) {
            if (match && typeof match === 'object' && !match.rosterVersion && version) {
                match.rosterVersion = version;
            }
            return match;
        },

        newVersionId: newRosterVersionId,

        // Startup: `stored` is the characters document as it was before this boot's code updates,
        // `characters` the roster the server will run. Keeps the stored version id when nothing
        // changed; otherwise starts a new version and keeps the old one for matches still on it.
        async initialize({ stored, characters }) {
            const storedVersion = typeof stored?.rosterVersion === 'string' ? stored.rosterVersion : '';
            const unchanged = storedVersion && Array.isArray(stored?.characters) && sameData(stored.characters, characters);
            version = unchanged ? storedVersion : newRosterVersionId();
            try {
                if (!unchanged && storedVersion && Array.isArray(stored?.characters)) {
                    snapshots.set(storedVersion, stored.characters);
                    await persistSnapshot(storedVersion, stored.characters);
                }
                const collection = appState();
                if (collection && !unchanged) {
                    await collection.updateOne(
                        { key: 'characters' },
                        { $set: { rosterVersion: version } }
                    );
                }
                await loadSnapshotsInUse();
                await prune();
            } catch (error) {
                log.warn('Roster version setup failed; matches in progress use the current roster.', error);
            }
            return version;
        },

        // Admin save, step 1 (before the roster is written): keeps the outgoing roster for
        // matches still playing it. Returns the id the new roster is saved under.
        async prepareNextVersion(outgoingCharacters) {
            if (version) {
                try {
                    await persistSnapshot(version, outgoingCharacters);
                } catch (error) {
                    log.warn('Could not store the outgoing roster version.', error);
                }
            }
            return newRosterVersionId();
        },

        // Admin save, step 2 (after the roster is written): switches new matches to the new
        // version. Synchronous so no match can start between the switch and the data change.
        activate(nextVersion, outgoingCharacters) {
            if (version && Array.isArray(outgoingCharacters)) snapshots.set(version, outgoingCharacters);
            version = nextVersion;
        },

        prune: () => prune().catch((error) => log.warn('Could not prune old roster versions.', error)),

        // Tests only.
        _snapshots: snapshots,
    };
}

// Characters whose data differs between two roster lists, matched by characterId.
const diffRosters = (before = [], after = []) => {
    const keyOf = (entry) => (entry && (entry.characterId || entry.id)) || '';
    const beforeById = new Map(before.filter(Boolean).map((entry) => [keyOf(entry), entry]));
    const afterById = new Map(after.filter(Boolean).map((entry) => [keyOf(entry), entry]));
    const changes = [];
    afterById.forEach((next, id) => {
        const previous = beforeById.get(id);
        if (!previous) changes.push({ characterId: id, before: null, after: next });
        else if (!sameData(previous, next)) changes.push({ characterId: id, before: previous, after: next });
    });
    beforeById.forEach((previous, id) => {
        if (!afterById.has(id)) changes.push({ characterId: id, before: previous, after: null });
    });
    return changes;
};

module.exports = { createRosterVersions, diffRosters, newRosterVersionId, SNAPSHOT_KEY_PREFIX };
