const express = require('express');
const Joi = require('joi');

module.exports = function(context) {
    const router = express.Router();
    const {
        usersCollection,
        requireSession,
        normalizeUserProfile,
        serializeUserForClient,
        serializePublicUserProfile,
        buildPublicClanProfile,
        clanRankHasPermission,
        resolveBaseClanRankLabel,
        normalizeClanRankNames,
        avatarUpdateSchema,
        validateAvatarUrl,
    } = context;

    const clanCreateSchema = Joi.object({
        name: Joi.string().trim().min(3).max(35).required(),
        abbreviation: Joi.string().trim().min(2).max(6).required(),
    });

    const clanUpdateSchema = Joi.object({
        bio: Joi.string().allow('').max(600).default(''),
    });

    const clanRanksSchema = Joi.object({
        customRankNames: Joi.object({
            clanLeader: Joi.string().trim().allow('').max(35).default(''),
            coLeader: Joi.string().trim().allow('').max(35).default(''),
            elder: Joi.string().trim().allow('').max(35).default(''),
            veteran: Joi.string().trim().allow('').max(35).default(''),
            member: Joi.string().trim().allow('').max(35).default(''),
        }).required(),
    });

    const clanRankDeleteSchema = Joi.object({
        rankKey: Joi.string().valid('coLeader', 'elder', 'veteran').required(),
    });

    const clanMemberRankSchema = Joi.object({
        username: Joi.string().trim().min(1).max(64).required(),
        rankKey: Joi.string().valid('clanLeader', 'coLeader', 'elder', 'veteran', 'member').required(),
    });

    const clanInviteSchema = Joi.object({
        username: Joi.string().trim().min(1).max(64).required(),
    });

    router.get('/api/clans/:clanName/profile', async (req, res) => {
        res.set('Cache-Control', 'no-store');
        const requestedClanName = typeof req.params?.clanName === 'string' ? req.params.clanName.trim() : '';
        if (!requestedClanName || requestedClanName.length > 35) {
            return res.status(400).json({ error: 'Invalid clan name.' });
        }

        try {
            const clan = await buildPublicClanProfile(requestedClanName);
            if (!clan) {
                return res.status(404).json({ error: 'Clan not found.' });
            }
            return res.json({
                ok: true,
                clan,
            });
        } catch (error) {
            console.error('Public clan profile error:', error);
            return res.status(500).json({ error: 'Unable to load clan.' });
        }
    });

    router.post('/api/clan/avatar', requireSession, async (req, res) => {
        try {
            const { error: validationError, value } = avatarUpdateSchema.validate(req.body || {});
            if (validationError) {
                return res.status(400).json({ error: 'A valid direct image URL is required.' });
            }

            await validateAvatarUrl(value.avatarUrl);
            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            const profile = normalizeUserProfile(user);
            const clan = profile.clan;
            if (!clan || !clan.name) {
                return res.status(400).json({ error: 'You are not in a clan.' });
            }
            if (!clanRankHasPermission(clan.rankKey, 'manageAvatar')) {
                return res.status(403).json({ error: 'Your clan rank cannot manage the clan avatar.' });
            }

            const currentClanName = String(clan.name || '').trim().toLowerCase();
            const currentClanAbbreviation = String(clan.abbreviation || '').trim().toLowerCase();
            const allUsers = await usersCollection
                .find({}, { projection: { _id: 1, profile: 1 } })
                .toArray();

            const clanMembers = allUsers.filter((entry = {}) => {
                const entryClan = normalizeUserProfile(entry).clan;
                if (!entryClan || !entryClan.name) {
                    return false;
                }
                const entryClanName = String(entryClan.name || '').trim().toLowerCase();
                const entryClanAbbreviation = String(entryClan.abbreviation || '').trim().toLowerCase();
                return currentClanAbbreviation && entryClanAbbreviation
                    ? entryClanName === currentClanName && entryClanAbbreviation === currentClanAbbreviation
                    : entryClanName === currentClanName;
            });

            await Promise.all(
                clanMembers.map(async (entry = {}) => {
                    const entryProfile = normalizeUserProfile(entry);
                    if (!entryProfile.clan) {
                        return;
                    }
                    entryProfile.clan = {
                        ...entryProfile.clan,
                        avatarUrl: value.avatarUrl,
                    };
                    await usersCollection.updateOne(
                        { _id: entry._id },
                        { $set: { profile: entryProfile } }
                    );
                })
            );

            const updatedUser = await usersCollection.findOne({ _id: user._id });
            return res.json({
                ok: true,
                user: serializeUserForClient(updatedUser),
            });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ error: error.message });
            }
            return res.status(500).json({ error: 'Unable to update clan avatar.' });
        }
    });

    router.post('/api/clan/create', requireSession, async (req, res) => {
        try {
            const { error: validationError, value } = clanCreateSchema.validate(req.body || {});
            if (validationError) {
                return res.status(400).json({ error: 'Valid clan details are required.' });
            }

            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            const profile = normalizeUserProfile(user);
            if (profile.clan && profile.clan.name) {
                return res.status(409).json({ error: 'You are already in a clan.' });
            }

            const requestedName = value.name.trim();
            const requestedAbbreviation = value.abbreviation.trim();
            const requestedNameLower = requestedName.toLowerCase();
            const requestedAbbreviationLower = requestedAbbreviation.toLowerCase();

            const existingUsers = await usersCollection
                .find({}, { projection: { _id: 1, profile: 1 } })
                .toArray();

            const duplicateClan = existingUsers.some((entry) => {
                const clan = normalizeUserProfile(entry).clan;
                if (!clan || !clan.name) {
                    return false;
                }
                const clanName = String(clan.name || '').trim().toLowerCase();
                const clanAbbreviation = String(clan.abbreviation || '').trim().toLowerCase();
                return clanName === requestedNameLower || clanAbbreviation === requestedAbbreviationLower;
            });
            if (duplicateClan) {
                return res.status(409).json({ error: 'Clan name or abbreviation is already in use.' });
            }

            const now = new Date();
            profile.clan = {
                name: requestedName,
                abbreviation: requestedAbbreviation,
                rankKey: 'clanLeader',
                customRankName: '',
                rank: resolveBaseClanRankLabel('clanLeader'),
                avatarUrl: '',
                joinedAt: now,
                bio: '',
                experiencePoints: 0,
                createdBy: user.username,
                createdAt: now,
                customRankNames: normalizeClanRankNames(),
            };

            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { profile } }
            );

            const updatedUser = await usersCollection.findOne({ _id: user._id });
            return res.json({
                ok: true,
                user: serializeUserForClient(updatedUser),
            });
        } catch (error) {
            console.error('Clan create error:', error);
            return res.status(500).json({ error: 'Unable to create clan.' });
        }
    });

    router.post('/api/clan/leave', requireSession, async (req, res) => {
        try {
            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            const profile = normalizeUserProfile(user);
            const clan = profile.clan;
            if (!clan || !clan.name) {
                return res.status(400).json({ error: 'You are not in a clan.' });
            }

            const currentClanName = String(clan.name || '').trim().toLowerCase();
            const allUsers = await usersCollection
                .find({}, { projection: { _id: 1, profile: 1 } })
                .toArray();

            const clanMembers = allUsers.filter((entry = {}) => {
                const entryClan = normalizeUserProfile(entry).clan;
                return entryClan && entryClan.name && String(entryClan.name || '').trim().toLowerCase() === currentClanName;
            });

            if (clan.rankKey === 'clanLeader' && clanMembers.length > 1) {
                return res.status(400).json({ error: 'Pass clan leadership to another member before leaving.' });
            }

            profile.clan = null;
            await usersCollection.updateOne(
                { _id: user._id },
                { $set: { profile } }
            );

            const updatedUser = await usersCollection.findOne({ _id: user._id });
            return res.json({
                ok: true,
                user: serializeUserForClient(updatedUser),
            });
        } catch (error) {
            console.error('Clan leave error:', error);
            return res.status(500).json({ error: 'Unable to leave clan.' });
        }
    });

    router.post('/api/clan/update', requireSession, async (req, res) => {
        try {
            const { error: validationError, value } = clanUpdateSchema.validate(req.body || {});
            if (validationError) {
                return res.status(400).json({ error: 'Valid clan bio is required.' });
            }

            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            const profile = normalizeUserProfile(user);
            const clan = profile.clan;
            if (!clan || !clan.name) {
                return res.status(400).json({ error: 'You are not in a clan.' });
            }
            if (!clanRankHasPermission(clan.rankKey, 'editClanBio')) {
                return res.status(403).json({ error: 'Your clan rank cannot edit the clan bio.' });
            }

            const currentClanName = String(clan.name || '').trim().toLowerCase();
            const allUsers = await usersCollection
                .find({}, { projection: { _id: 1, profile: 1 } })
                .toArray();

            const clanMembers = allUsers.filter((entry = {}) => {
                const entryClan = normalizeUserProfile(entry).clan;
                return entryClan && entryClan.name && String(entryClan.name || '').trim().toLowerCase() === currentClanName;
            });

            await Promise.all(
                clanMembers.map(async (entry = {}) => {
                    const entryProfile = normalizeUserProfile(entry);
                    if (!entryProfile.clan) return;
                    entryProfile.clan = {
                        ...entryProfile.clan,
                        bio: value.bio,
                    };
                    await usersCollection.updateOne({ _id: entry._id }, { $set: { profile: entryProfile } });
                })
            );

            const updatedUser = await usersCollection.findOne({ _id: user._id });
            return res.json({
                ok: true,
                user: serializeUserForClient(updatedUser),
            });
        } catch (error) {
            console.error('Clan update error:', error);
            return res.status(500).json({ error: 'Unable to update clan.' });
        }
    });

    router.post('/api/clan/ranks', requireSession, async (req, res) => {
        try {
            const { error: validationError, value } = clanRanksSchema.validate(req.body || {});
            if (validationError) {
                return res.status(400).json({ error: 'Valid custom rank names are required.' });
            }

            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            const profile = normalizeUserProfile(user);
            const clan = profile.clan;
            if (!clan || !clan.name) {
                return res.status(400).json({ error: 'You are not in a clan.' });
            }
            if (!clanRankHasPermission(clan.rankKey, 'editClanRanks')) {
                return res.status(403).json({ error: 'Your clan rank cannot edit clan rank titles.' });
            }

            const currentClanName = String(clan.name || '').trim().toLowerCase();
            const allUsers = await usersCollection
                .find({}, { projection: { _id: 1, profile: 1 } })
                .toArray();

            const clanMembers = allUsers.filter((entry = {}) => {
                const entryClan = normalizeUserProfile(entry).clan;
                return entryClan && entryClan.name && String(entryClan.name || '').trim().toLowerCase() === currentClanName;
            });

            const nextCustomRanks = normalizeClanRankNames(value.customRankNames);

            await Promise.all(
                clanMembers.map(async (entry = {}) => {
                    const entryProfile = normalizeUserProfile(entry);
                    if (!entryProfile.clan) return;
                    const rankKey = entryProfile.clan.rankKey || 'member';
                    entryProfile.clan = {
                        ...entryProfile.clan,
                        customRankNames: nextCustomRanks,
                        customRankName: nextCustomRanks[rankKey] || '',
                        rank: nextCustomRanks[rankKey] || resolveBaseClanRankLabel(rankKey),
                    };
                    await usersCollection.updateOne({ _id: entry._id }, { $set: { profile: entryProfile } });
                })
            );

            const updatedUser = await usersCollection.findOne({ _id: user._id });
            return res.json({
                ok: true,
                user: serializeUserForClient(updatedUser),
            });
        } catch (error) {
            console.error('Clan ranks update error:', error);
            return res.status(500).json({ error: 'Unable to update clan rank titles.' });
        }
    });

    router.post('/api/clan/ranks/delete', requireSession, async (req, res) => {
        try {
            const { error: validationError, value } = clanRankDeleteSchema.validate(req.body || {});
            if (validationError) {
                return res.status(400).json({ error: 'A valid rank is required.' });
            }

            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            const profile = normalizeUserProfile(user);
            const clan = profile.clan;
            if (!clan || !clan.name) {
                return res.status(400).json({ error: 'You are not in a clan.' });
            }
            if (!clanRankHasPermission(clan.rankKey, 'editClanRanks')) {
                return res.status(403).json({ error: 'Your clan rank cannot remove custom rank titles.' });
            }

            const currentClanName = String(clan.name || '').trim().toLowerCase();
            const allUsers = await usersCollection
                .find({}, { projection: { _id: 1, profile: 1 } })
                .toArray();

            const clanMembers = allUsers.filter((entry = {}) => {
                const entryClan = normalizeUserProfile(entry).clan;
                return entryClan && entryClan.name && String(entryClan.name || '').trim().toLowerCase() === currentClanName;
            });

            const nextCustomRanks = normalizeClanRankNames(clan.customRankNames);
            delete nextCustomRanks[value.rankKey];

            await Promise.all(
                clanMembers.map(async (entry = {}) => {
                    const entryProfile = normalizeUserProfile(entry);
                    if (!entryProfile.clan) return;
                    const rankKey = entryProfile.clan.rankKey || 'member';
                    entryProfile.clan = {
                        ...entryProfile.clan,
                        customRankNames: nextCustomRanks,
                        customRankName: nextCustomRanks[rankKey] || '',
                        rank: nextCustomRanks[rankKey] || resolveBaseClanRankLabel(rankKey),
                    };
                    await usersCollection.updateOne({ _id: entry._id }, { $set: { profile: entryProfile } });
                })
            );

            const updatedUser = await usersCollection.findOne({ _id: user._id });
            return res.json({
                ok: true,
                user: serializeUserForClient(updatedUser),
            });
        } catch (error) {
            console.error('Clan rank title delete error:', error);
            return res.status(500).json({ error: 'Unable to delete custom rank title.' });
        }
    });

    router.get('/api/clan/members', requireSession, async (req, res) => {
        try {
            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            const profile = normalizeUserProfile(user);
            const clan = profile.clan;
            if (!clan || !clan.name) {
                return res.status(400).json({ error: 'You are not in a clan.' });
            }

            const currentClanName = String(clan.name || '').trim().toLowerCase();
            const allUsers = await usersCollection
                .find({}, { projection: { _id: 1, username: 1, role: 1, createdAt: 1, profile: 1 } })
                .toArray();

            const clanMembers = allUsers
                .filter((entry = {}) => {
                    const entryClan = normalizeUserProfile(entry).clan;
                    return entryClan && entryClan.name && String(entryClan.name || '').trim().toLowerCase() === currentClanName;
                })
                .map((entry = {}) => {
                    const entryProfile = normalizeUserProfile(entry);
                    const memberClan = entryProfile.clan || {};
                    return {
                        username: entry.username,
                        avatarUrl: entryProfile.avatarUrl,
                        rank: memberClan.rank || resolveBaseClanRankLabel(memberClan.rankKey || 'member'),
                        rankKey: memberClan.rankKey || 'member',
                        ladderRank: entryProfile.ladder?.rank || 'Academy Student',
                        ladderRankHatUrl: entryProfile.ladder?.rankHatUrl || 'hats/academy.png',
                        ladderLevel: entryProfile.ladder?.level || 1,
                        joinedAt: memberClan.joinedAt || entry.createdAt,
                    };
                });

            return res.json({
                ok: true,
                members: clanMembers,
            });
        } catch (error) {
            console.error('Clan members lookup error:', error);
            return res.status(500).json({ error: 'Unable to load clan members.' });
        }
    });

    router.post('/api/clan/member-rank', requireSession, async (req, res) => {
        try {
            const { error: validationError, value } = clanMemberRankSchema.validate(req.body || {});
            if (validationError) {
                return res.status(400).json({ error: 'Valid member and rank are required.' });
            }

            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            const profile = normalizeUserProfile(user);
            const clan = profile.clan;
            if (!clan || !clan.name) {
                return res.status(400).json({ error: 'You are not in a clan.' });
            }
            if (!clanRankHasPermission(clan.rankKey, 'editMemberRanks')) {
                return res.status(403).json({ error: 'Your clan rank cannot edit member ranks.' });
            }

            const targetUser = await usersCollection.findOne({ username: value.username });
            if (!targetUser) {
                return res.status(404).json({ error: 'Target member not found.' });
            }

            const targetProfile = normalizeUserProfile(targetUser);
            if (!targetProfile.clan || String(targetProfile.clan.name || '').trim().toLowerCase() !== String(clan.name || '').trim().toLowerCase()) {
                return res.status(400).json({ error: 'User is not a member of your clan.' });
            }

            if (value.rankKey === 'clanLeader' && clan.rankKey !== 'clanLeader') {
                return res.status(403).json({ error: 'Only the current Clan Leader can transfer leadership.' });
            }

            const customRankNames = normalizeClanRankNames(clan.customRankNames);

            if (value.rankKey === 'clanLeader') {
                profile.clan = {
                    ...profile.clan,
                    rankKey: 'coLeader',
                    customRankName: customRankNames.coLeader || '',
                    rank: customRankNames.coLeader || resolveBaseClanRankLabel('coLeader'),
                };
                await usersCollection.updateOne({ _id: user._id }, { $set: { profile } });
            }

            targetProfile.clan = {
                ...targetProfile.clan,
                rankKey: value.rankKey,
                customRankName: customRankNames[value.rankKey] || '',
                rank: customRankNames[value.rankKey] || resolveBaseClanRankLabel(value.rankKey),
            };

            await usersCollection.updateOne({ _id: targetUser._id }, { $set: { profile: targetProfile } });

            const updatedUser = await usersCollection.findOne({ _id: user._id });
            return res.json({
                ok: true,
                user: serializeUserForClient(updatedUser),
            });
        } catch (error) {
            console.error('Clan member rank update error:', error);
            return res.status(500).json({ error: 'Unable to update member rank.' });
        }
    });

    router.get('/api/clan/recruitment', requireSession, async (req, res) => {
        try {
            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            const profile = normalizeUserProfile(user);
            const clan = profile.clan;
            if (!clan || !clan.name) {
                return res.status(400).json({ error: 'You are not in a clan.' });
            }

            const allUsers = await usersCollection
                .find({}, { projection: { _id: 1, username: 1, role: 1, createdAt: 1, profile: 1 } })
                .toArray();

            const candidates = allUsers
                .filter((entry = {}) => {
                    const entryProfile = normalizeUserProfile(entry);
                    return !entryProfile.clan || !entryProfile.clan.name;
                })
                .map((entry = {}) => {
                    const entryProfile = normalizeUserProfile(entry);
                    return {
                        username: entry.username,
                        avatarUrl: entryProfile.avatarUrl,
                        ladderRank: entryProfile.ladder?.rank || 'Academy Student',
                        ladderRankHatUrl: entryProfile.ladder?.rankHatUrl || 'hats/academy.png',
                        ladderLevel: entryProfile.ladder?.level || 1,
                    };
                });

            return res.json({
                ok: true,
                candidates,
            });
        } catch (error) {
            console.error('Clan recruitment lookup error:', error);
            return res.status(500).json({ error: 'Unable to load recruit candidates.' });
        }
    });

    router.post('/api/clan/invite', requireSession, async (req, res) => {
        try {
            const { error: validationError, value } = clanInviteSchema.validate(req.body || {});
            if (validationError) {
                return res.status(400).json({ error: 'Valid candidate username is required.' });
            }

            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            const profile = normalizeUserProfile(user);
            const clan = profile.clan;
            if (!clan || !clan.name) {
                return res.status(400).json({ error: 'You are not in a clan.' });
            }
            if (!clanRankHasPermission(clan.rankKey, 'inviteMembers')) {
                return res.status(403).json({ error: 'Your clan rank cannot invite members.' });
            }

            const targetUser = await usersCollection.findOne({ username: value.username });
            if (!targetUser) {
                return res.status(404).json({ error: 'Candidate not found.' });
            }

            const targetProfile = normalizeUserProfile(targetUser);
            if (targetProfile.clan && targetProfile.clan.name) {
                return res.status(400).json({ error: 'Candidate is already in a clan.' });
            }

            const existingInvitations = Array.isArray(targetProfile.clanInvitations) ? targetProfile.clanInvitations : [];
            const alreadyInvited = existingInvitations.some(
                (inv) => String(inv.clanName || '').trim().toLowerCase() === String(clan.name || '').trim().toLowerCase()
            );
            if (alreadyInvited) {
                return res.status(409).json({ error: 'Candidate has already received an invitation from your clan.' });
            }

            targetProfile.clanInvitations = [
                ...existingInvitations,
                {
                    clanName: clan.name,
                    clanAbbreviation: clan.abbreviation || '',
                    avatarUrl: clan.avatarUrl || '',
                    invitedBy: user.username,
                    invitedAt: new Date(),
                },
            ];

            await usersCollection.updateOne({ _id: targetUser._id }, { $set: { profile: targetProfile } });

            return res.json({
                ok: true,
                invited: targetUser.username,
            });
        } catch (error) {
            console.error('Clan invite error:', error);
            return res.status(500).json({ error: 'Unable to send clan invitation.' });
        }
    });

    router.post('/api/clan/invite/retract', requireSession, async (req, res) => {
        try {
            const { error: validationError, value } = clanInviteSchema.validate(req.body || {});
            if (validationError) {
                return res.status(400).json({ error: 'Valid candidate username is required.' });
            }

            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            const profile = normalizeUserProfile(user);
            const clan = profile.clan;
            if (!clan || !clan.name) {
                return res.status(400).json({ error: 'You are not in a clan.' });
            }
            if (!clanRankHasPermission(clan.rankKey, 'inviteMembers')) {
                return res.status(403).json({ error: 'Your clan rank cannot retract clan invitations.' });
            }

            const targetUser = await usersCollection.findOne({ username: value.username });
            if (!targetUser) {
                return res.status(404).json({ error: 'Candidate not found.' });
            }

            const targetProfile = normalizeUserProfile(targetUser);
            targetProfile.clanInvitations = (Array.isArray(targetProfile.clanInvitations) ? targetProfile.clanInvitations : []).filter(
                (inv) => String(inv.clanName || '').trim().toLowerCase() !== String(clan.name || '').trim().toLowerCase()
            );

            await usersCollection.updateOne({ _id: targetUser._id }, { $set: { profile: targetProfile } });

            return res.json({
                ok: true,
                retracted: targetUser.username,
            });
        } catch (error) {
            console.error('Clan invite retract error:', error);
            return res.status(500).json({ error: 'Unable to retract clan invitation.' });
        }
    });

    router.get('/api/clan/invitations', requireSession, async (req, res) => {
        try {
            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            const profile = normalizeUserProfile(user);
            const invitations = Array.isArray(profile.clanInvitations) ? profile.clanInvitations : [];
            if (!invitations.length) {
                return res.json({ ok: true, invitations: [] });
            }

            const inviters = await usersCollection
                .find(
                    { username: { $in: invitations.map((entry) => entry.invitedBy).filter(Boolean) } },
                    { projection: { username: 1, profile: 1 } }
                )
                .toArray();
            const inviterMap = new Map(
                inviters.map((entry) => [String(entry.username || '').trim().toLowerCase(), normalizeUserProfile(entry)])
            );
            const validInvitations = invitations.filter((entry) => {
                const inviterProfile = inviterMap.get(String(entry.invitedBy || '').trim().toLowerCase());
                const inviterClan = inviterProfile && inviterProfile.clan ? inviterProfile.clan : null;
                if (!inviterClan || !inviterClan.name) {
                    return false;
                }
                const sameClanName =
                    String(inviterClan.name || '').trim().toLowerCase() === String(entry.clanName || '').trim().toLowerCase();
                if (!sameClanName) {
                    return false;
                }
                if (entry.clanAbbreviation) {
                    return (
                        String(inviterClan.abbreviation || '').trim().toLowerCase() ===
                        String(entry.clanAbbreviation || '').trim().toLowerCase()
                    );
                }
                return true;
            });

            if (validInvitations.length !== invitations.length) {
                profile.clanInvitations = validInvitations;
                await usersCollection.updateOne({ _id: user._id }, { $set: { profile } });
            }

            return res.json({
                ok: true,
                invitations: validInvitations,
            });
        } catch (error) {
            console.error('Clan invitations lookup error:', error);
            return res.status(500).json({ error: 'Unable to load clan invitations.' });
        }
    });

    router.post('/api/clan/invitations/accept', requireSession, async (req, res) => {
        try {
            const { error: validationError, value } = clanInviteSchema.validate(req.body || {});
            if (validationError) {
                return res.status(400).json({ error: 'A valid clan name is required.' });
            }

            const user = await usersCollection.findOne({ username: req.authUser.username });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }

            const profile = normalizeUserProfile(user);
            if (profile.clan && profile.clan.name) {
                return res.status(409).json({ error: 'You are already in a clan.' });
            }

            const requestedClanName = value.username.trim().toLowerCase();
            const invitation = (Array.isArray(profile.clanInvitations) ? profile.clanInvitations : []).find(
                (entry) => String(entry.clanName || '').trim().toLowerCase() === requestedClanName
            );
            if (!invitation) {
                return res.status(404).json({ error: 'Clan invitation not found.' });
            }

            const inviter = await usersCollection.findOne({ username: invitation.invitedBy });
            if (!inviter) {
                return res.status(404).json({ error: 'Inviting clan could not be found.' });
            }

            const inviterProfile = normalizeUserProfile(inviter);
            const inviterClan = inviterProfile.clan;
            if (!inviterClan || !inviterClan.name) {
                return res.status(404).json({ error: 'Inviting clan could not be found.' });
            }

            const sameClanName =
                String(inviterClan.name || '').trim().toLowerCase() === String(invitation.clanName || '').trim().toLowerCase();
            if (!sameClanName) {
                return res.status(409).json({ error: 'That invitation is no longer valid.' });
            }

            profile.clan = {
                name: inviterClan.name,
                abbreviation: inviterClan.abbreviation || '',
                rankKey: 'member',
                customRankName: '',
                rank: resolveBaseClanRankLabel('member'),
                avatarUrl: inviterClan.avatarUrl || '',
                joinedAt: new Date(),
                bio: inviterClan.bio || '',
                experiencePoints: Math.max(0, Number(inviterClan.experiencePoints) || 0),
                createdBy: inviterClan.createdBy || inviter.username,
                createdAt: inviterClan.createdAt || new Date(),
                customRankNames: normalizeClanRankNames(inviterClan.customRankNames),
            };
            profile.clanInvitations = (Array.isArray(profile.clanInvitations) ? profile.clanInvitations : []).filter(
                (entry) => String(entry.clanName || '').trim().toLowerCase() !== requestedClanName
            );

            await usersCollection.updateOne({ _id: user._id }, { $set: { profile } });

            const updatedUser = await usersCollection.findOne({ _id: user._id });
            return res.json({
                ok: true,
                user: serializeUserForClient(updatedUser),
            });
        } catch (error) {
            console.error('Clan invitation accept error:', error);
            return res.status(500).json({ error: 'Unable to accept clan invitation.' });
        }
    });

    return router;
};
