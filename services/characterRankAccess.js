const STATE_KEY = 'character_rank_access';
const ROLES = ['admin', 'global_moderator', 'moderator', 'player'];
const MODES = ['inherit', 'allow', 'deny'];
const INITIAL_POLICIES = {
    'yamanaka-ino': {
        admin: 'allow',
        global_moderator: 'allow',
        moderator: 'deny',
        player: 'deny',
    },
};

const normalizeRole = (role) => {
    const value = String(role || '').trim().toLowerCase();
    return ROLES.includes(value) ? value : 'player';
};

const normalizePolicies = (input, knownIds, strict = false) => {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        if (strict) throw new Error('Character access policies must be an object.');
        return {};
    }
    const policies = {};
    for (const [characterId, row] of Object.entries(input)) {
        if (!knownIds.has(characterId)) {
            if (strict) throw new Error(`Unknown character: ${characterId}.`);
            continue;
        }
        if (!row || typeof row !== 'object' || Array.isArray(row)) {
            if (strict) throw new Error(`Invalid access settings for ${characterId}.`);
            continue;
        }
        if (strict && Object.keys(row).some((role) => !ROLES.includes(role))) {
            throw new Error(`Invalid rank in access settings for ${characterId}.`);
        }
        const normalizedRow = {};
        for (const role of ROLES) {
            const mode = row[role] === undefined ? 'inherit' : row[role];
            if (!MODES.includes(mode)) {
                if (strict) throw new Error(`Invalid ${role} access for ${characterId}.`);
                continue;
            }
            if (mode !== 'inherit') normalizedRow[role] = mode;
        }
        if (Object.keys(normalizedRow).length) policies[characterId] = normalizedRow;
    }
    return policies;
};

const evaluateAccess = ({ policies, characterId, role, inheritedUnlocked }) => {
    const mode = policies?.[characterId]?.[normalizeRole(role)] || 'inherit';
    return {
        mode,
        hidden: mode === 'deny',
        unlocked: mode === 'allow' || (mode === 'inherit' && Boolean(inheritedUnlocked)),
    };
};

const createCharacterRankAccessService = ({ getCollection, getCharacters }) => {
    const knownIds = () => new Set((getCharacters() || [])
        .map((entry) => entry?.characterId || entry?.id)
        .filter(Boolean));

    return {
        async getPolicies() {
            const collection = getCollection();
            const stored = collection ? await collection.findOne({ key: STATE_KEY }) : null;
            return normalizePolicies(
                stored ? stored.policies : INITIAL_POLICIES,
                knownIds()
            );
        },
        async savePolicies(input, updatedBy) {
            const policies = normalizePolicies(input, knownIds(), true);
            const collection = getCollection();
            if (!collection) throw new Error('Character access storage is unavailable.');
            await collection.updateOne(
                { key: STATE_KEY },
                { $set: { key: STATE_KEY, policies, updatedBy, updatedAt: new Date() } },
                { upsert: true }
            );
            return policies;
        },
    };
};

module.exports = { ROLES, MODES, INITIAL_POLICIES, normalizeRole, normalizePolicies,
    evaluateAccess, createCharacterRankAccessService };
