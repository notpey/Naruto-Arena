const { test } = require('node:test');
const assert = require('node:assert/strict');
const { CharacterService } = require('../services/characterService');

test('CharacterService serializes and syncs character data accurately', () => {
    const service = new CharacterService();
    const characters = service.getCharacters();

    assert.ok(Array.isArray(characters), 'Characters must be an array');
    assert.ok(characters.length > 0, 'Characters list should not be empty');

    // Test catalog building
    const catalog = service.buildCatalog();
    assert.ok(Array.isArray(catalog), 'Catalog must be an array');
    assert.equal(catalog.length, characters.length);

    // Test face mapping
    const faceMap = service.buildFaceMap();
    assert.ok(faceMap instanceof Map, 'Face map must be a Map instance');
    assert.ok(faceMap.size > 0, 'Face map should contain faces');

    // Test serialization to browser script
    const script = CharacterService.serializeCharactersScript(characters.slice(0, 3));
    assert.ok(typeof script === 'string', 'Serialized script must be a string');
    assert.ok(script.includes('window.characters = characters'), 'Must set window.characters');

    // Test serialization to data file
    const dataFile = CharacterService.serializeCharactersDataFile(characters.slice(0, 3));
    assert.ok(typeof dataFile === 'string', 'Serialized data file must be a string');
    assert.ok(dataFile.includes('module.exports = characters'), 'Must export array');
});

test('getStoredCharacters ensures official seed skills and effects take precedence over stale DB records', async () => {
    const staleHiruzen = {
        characterId: 'sarutobi-hiruzen',
        id: 'sarutobi-hiruzen',
        name: 'Sarutobi Hiruzen',
        facePicture: 'https://example.com/custom-hiruzen.png',
        characterdeescription: 'Custom Admin Description',
        skills: [
            {
                id: 'sarutobi-hiruzen-dead-demon-consuming-seal',
                name: 'Dead Demon Consuming Seal',
                effects: [] // Stale empty effects
            }
        ]
    };

    const mockCollection = {
        findOne: async (query) => {
            if (query.key === 'characters') {
                return { key: 'characters', characters: [staleHiruzen] };
            }
            if (query.key === 'character_migrations') {
                return { key: 'character_migrations', completed: { 'starter-rebalance-2026-07-16': new Date(), 'exams-rebalance-2026-07-16-v4': new Date() } };
            }
            return null;
        },
        updateOne: async () => ({ acknowledged: true })
    };

    const service = new CharacterService({ appStateCollection: mockCollection });
    const stored = await service.getStoredCharacters();
    const hiruzen = stored.find((c) => c.characterId === 'sarutobi-hiruzen');

    assert.ok(hiruzen, 'Hiruzen should be present');
    assert.equal(hiruzen.facePicture, 'https://example.com/custom-hiruzen.png', 'Custom face picture is preserved');
    assert.equal(hiruzen.characterdeescription, 'Custom Admin Description', 'Custom description is preserved');

    const seal = hiruzen.skills.find((s) => s.id === 'sarutobi-hiruzen-dead-demon-consuming-seal');
    assert.ok(seal, 'Dead Demon Seal skill must be present');
    assert.ok(seal.effects.length > 0, 'Dead Demon Seal effects must be synced from authoritative seed code');
    const sealEnemyEffect = seal.effects.find((e) => e.statusId === 'sarutobi_hiruzen_dead_demon_seal_enemy');
    assert.equal(sealEnemyEffect?.metadata?.turnEndDamage, 40, 'turnEndDamage 40 must be present');
    assert.equal(sealEnemyEffect?.metadata?.ignoreOngoingSourceStun, true, 'ignoreOngoingSourceStun must be present');
});

