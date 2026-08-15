const express = require('express');
const Joi = require('joi');

module.exports = function(context) {
    const router = express.Router();
    const {
        characterService,
        requireSession,
        SESSION_COOKIE_NAME,
        getSessionUserFromToken,
        getMissionLockedCharacterIds,
        normalizeUserProfile,
        normalizeCharacterId,
        profileHasUnlockedCharacter,
    } = context;

    const lookupSchema = Joi.object({
        characterIds: Joi.array().items(Joi.string().trim().min(1).max(128)).max(3).required(),
    });

    const buildCharacterFaceMap = () => {
        const characters = characterService ? characterService.getCharacters() : [];
        const map = new Map();
        characters.forEach((character) => {
            if (character?.characterId && character?.facePicture) {
                map.set(character.characterId, character.facePicture);
            }
        });
        return map;
    };

    router.get('/characters.js', (req, res) => {
        res.type('application/javascript');
        res.send(characterService.getBrowserScript());
    });

    router.get('/api/characters/catalog', (req, res) => {
        return res.json({
            ok: true,
            characters: characterService.getCharacterCatalog(),
        });
    });

    router.get('/api/characters', async (req, res) => {
        res.setHeader('Cache-Control', 'no-store');
        try {
            const token = req.cookies?.[SESSION_COOKIE_NAME];
            const authUser = token ? await getSessionUserFromToken(token) : null;
            const normalizedRole = String(authUser?.role || '').trim().toLowerCase();
            const bypassLocks = normalizedRole === 'admin' || normalizedRole === 'moderator';
            const lockedCharacterIds = authUser && !bypassLocks ? await getMissionLockedCharacterIds() : new Set();
            const profile = authUser ? normalizeUserProfile(authUser) : null;
            const characterList = characterService ? characterService.getCharacters() : [];
            return res.json({
                ok: true,
                characters: characterList.map((character) => {
                    const characterId = normalizeCharacterId(character?.characterId);
                    const unlocked =
                        !authUser ||
                        bypassLocks ||
                        profileHasUnlockedCharacter(profile, characterId, lockedCharacterIds);
                    return {
                        ...character,
                        unlocked,
                    };
                }),
            });
        } catch (error) {
            console.error('Character roster load error:', error);
            return res.status(500).json({ error: 'Unable to load character data.' });
        }
    });

    router.post('/api/characters/faces', requireSession, async (req, res) => {
        const { error: validationError, value } = lookupSchema.validate(req.body || {});
        if (validationError) {
            return res.status(400).json({ error: 'characterIds are required.' });
        }

        const faceMap = buildCharacterFaceMap();

        return res.json({
            ok: true,
            faces: value.characterIds.map((characterId) => ({
                characterId,
                facePicture: faceMap.get(characterId) || '',
            })),
        });
    });

    return router;
};
