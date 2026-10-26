const STATE_KEY = 'character_rank_access';
const POLICY_VERSION = 2;
const ROLES = ['admin', 'global_moderator', 'moderator', 'player'];
const STAFF_ROLES = new Set(['admin', 'global_moderator', 'moderator']);
const VISIBILITY_MODES = ['visible', 'hidden'];
const UNLOCK_MODES = ['inherit', 'allow'];
const INITIAL_POLICIES = {
    'yamanaka-ino': { player: { visibility: 'hidden', unlock: 'inherit' } },
};

const normalizeRole = (role) => {
    const value = String(role || '').trim().toLowerCase();
    return ROLES.includes(value) ? value : 'player';
};

const normalizeMemberPolicy = (value, strict) => {
    if (typeof value === 'string') {
        if (value === 'deny') return { visibility: 'hidden', unlock: 'inherit' };
        if (value === 'allow') return { visibility: 'visible', unlock: 'allow' };
        if (value === 'inherit') return { visibility: 'visible', unlock: 'inherit' };
        if (strict) throw new Error('Invalid player access setting.');
        return null;
    }
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        if (strict) throw new Error('Invalid player access setting.');
        return null;
    }
    if (strict && Object.keys(value).some((key) => !['visibility', 'unlock'].includes(key))) {
        throw new Error('Invalid player access setting.');
    }
    const visibility = value.visibility || 'visible';
    const unlock = value.unlock || 'inherit';
    if (!VISIBILITY_MODES.includes(visibility) || !UNLOCK_MODES.includes(unlock)) {
        if (strict) throw new Error('Invalid player access setting.');
        return null;
    }
    return { visibility, unlock };
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
        if (strict && Object.keys(row).some((role) => role !== 'player')) {
            throw new Error(`Invalid rank in access settings for ${characterId}.`);
        }
        const member = row.player === undefined ? null : normalizeMemberPolicy(row.player, strict);
        if (member && (member.visibility !== 'visible' || member.unlock !== 'inherit')) {
            policies[characterId] = { player: member };
        }
    }
    return policies;
};

const evaluateAccess = ({ policies, characterId, role, inheritedUnlocked }) => {
    if (STAFF_ROLES.has(normalizeRole(role))) {
        return { visibility: 'visible', unlockMode: 'allow', hidden: false, unlocked: true };
    }
    const member = normalizeMemberPolicy(policies?.[characterId]?.player || 'inherit', false) ||
        { visibility: 'visible', unlock: 'inherit' };
    const hidden = member.visibility === 'hidden';
    return {
        visibility: member.visibility,
        unlockMode: member.unlock,
        hidden,
        unlocked: !hidden && (member.unlock === 'allow' ||
            (member.unlock === 'inherit' && Boolean(inheritedUnlocked))),
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
            const policies = normalizePolicies(
                stored ? stored.policies : INITIAL_POLICIES,
                knownIds()
            );
            if (collection && (!stored || !(Number(stored.version) >= POLICY_VERSION))) {
                // Preserve legacy Member overrides while restoring the staff-wide bypass.
                policies['yamanaka-ino'] = INITIAL_POLICIES['yamanaka-ino'];
                await collection.updateOne(
                    { key: STATE_KEY },
                    { $set: { key: STATE_KEY, version: POLICY_VERSION, policies,
                        updatedAt: new Date(), updatedBy: 'launch-roster-migration' } },
                    { upsert: true }
                );
            }
            return policies;
        },
        async savePolicies(input, updatedBy) {
            const policies = normalizePolicies(input, knownIds(), true);
            const collection = getCollection();
            if (!collection) throw new Error('Character access storage is unavailable.');
            await collection.updateOne(
                { key: STATE_KEY },
                { $set: { key: STATE_KEY, version: POLICY_VERSION,
                    policies, updatedBy, updatedAt: new Date() } },
                { upsert: true }
            );
            return policies;
        },
    };
};

module.exports = { ROLES, VISIBILITY_MODES, UNLOCK_MODES, INITIAL_POLICIES,
    normalizeRole, normalizePolicies, evaluateAccess, createCharacterRankAccessService };
