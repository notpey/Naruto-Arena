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

test('Hokage Hiruzen migration replaces the old stored character while keeping its ID', async () => {
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
    assert.equal(hiruzen.name, 'Hokage Hiruzen');
    assert.equal(hiruzen.facePicture, 'https://i.imgur.com/fxZCWtI.png');
    assert.equal(hiruzen.requiredMissionId, 'the-god-of-the-shinobi');
    assert.deepEqual(hiruzen.skills.map((skill) => skill.name), [
        'Crystal Ball Technique', 'Mission Assignment', 'Search Party', "Hokage's Guard",
    ]);
    assert.equal(hiruzen.skills.some((skill) =>
        skill.id === 'sarutobi-hiruzen-dead-demon-consuming-seal'), false);
});

test('launch unlock migration aligns starter and mission requirements without replacing stored edits', async () => {
    const ids = ['sarutobi-konohamaru', 'ebisu', 'zori-and-waraji', 'gato'];
    const storedCharacters = ids.map((id) => ({
        characterId: id, id, name: id, characterdeescription: `Edited ${id}`,
        skills: [],
    }));
    storedCharacters.push({ characterId: 'uzumaki-naruto', id: 'uzumaki-naruto',
        name: 'Uzumaki Naruto', characterdeescription: 'Edited Naruto',
        requiredMissionId: 'obsolete-mission', skills: [] });
    const writes = [];
    const collection = {
        findOne: async ({ key }) => key === 'characters'
            ? { key, characters: storedCharacters }
            : { key, completed: {
                'starter-rebalance-2026-07-16': new Date(),
                'exams-rebalance-2026-07-16-v4': new Date(),
                'uzumaki-naruto-rework-2026-10-23': new Date(),
                'team-7-sakura-sasuke-rework-2026-10-24-v2': new Date(),
                'kakashi-iruka-rework-2026-10-24': new Date(),
                'waves-haku-zabuza-mizuki-rework-2026-10-24': new Date(),
                'demon-brothers-rework-2026-10-25': new Date(),
                'hokage-hiruzen-rework-2026-10-26': new Date(),
            } },
        updateOne: async (filter, update) => { writes.push({ filter, update }); },
    };
    const stored = await new CharacterService({ appStateCollection: collection }).getStoredCharacters();
    const expected = new Map([
        ['sarutobi-konohamaru', 'a-new-generation'],
        ['ebisu', 'private-lesson'],
        ['zori-and-waraji', 'gatos-enforcers'],
        ['gato', 'the-shipping-magnate'],
    ]);
    for (const [id, missionId] of expected) {
        const character = stored.find((entry) => entry.characterId === id);
        assert.equal(character.requiredMissionId, missionId);
        assert.equal(character.characterdeescription, `Edited ${id}`);
    }
    const naruto = stored.find((entry) => entry.characterId === 'uzumaki-naruto');
    assert.equal(naruto.requiredMissionId, null);
    assert.equal(naruto.characterdeescription, 'Edited Naruto');
    assert.ok(writes.some(({ filter }) => filter.key === 'characters'));
});

test('Naruto rework replaces stale stored artwork and skills once', async () => {
    const oldNaruto = {
        id: 'uzumaki-naruto', characterId: 'uzumaki-naruto', name: 'Uzumaki Naruto',
        facePicture: 'https://example.com/old-naruto.png',
        characterdeescription: 'Old Naruto description',
        skills: [{ id: 'uzumaki-naruto-combo', name: 'Uzumaki Naruto Combo' }],
    };
    const writes = [];
    const mockCollection = {
        findOne: async ({ key }) => key === 'characters'
            ? { key, characters: [oldNaruto] }
            : { key, completed: {
                'starter-rebalance-2026-07-16': new Date(),
                'exams-rebalance-2026-07-16-v4': new Date(),
            } },
        updateOne: async (query, update) => { writes.push({ query, update }); },
    };
    const service = new CharacterService({ appStateCollection: mockCollection });
    const stored = await service.getStoredCharacters();
    const naruto = stored.find(character => character.id === 'uzumaki-naruto');
    assert.equal(naruto.facePicture, 'https://i.imgur.com/NwbpKdo.png');
    assert.equal(naruto.skills[0].name, 'Shadow Clone Assault');
    assert.equal(naruto.passive.name, 'Unpredictable Ninja');
    assert.ok(writes.some(({ query, update }) => query.key === 'character_migrations' &&
        update.$set['completed.uzumaki-naruto-rework-2026-10-23']));
});

test('Sakura and Sasuke rework replaces stale stored character concepts once', async () => {
    const oldSakura = {
        id: 'haruno-sakura', characterId: 'haruno-sakura', name: 'Haruno Sakura',
        facePicture: 'https://example.com/old-sakura.png',
        skills: [{ id: 'haruno-sakura-ko-punch', name: 'KO Punch' }],
    };
    const oldSasuke = {
        id: 'uchiha-sasuke', characterId: 'uchiha-sasuke', name: 'Uchiha Sasuke',
        facePicture: 'https://example.com/old-sasuke.png',
        skills: [{ id: 'uchiha-sasuke-lion-combo', name: 'Lion Combo' }],
    };
    const writes = [];
    const mockCollection = {
        findOne: async ({ key }) => key === 'characters'
            ? { key, characters: [oldSakura, oldSasuke] }
            : { key, completed: {
                'starter-rebalance-2026-07-16': new Date(),
                'exams-rebalance-2026-07-16-v4': new Date(),
                'uzumaki-naruto-rework-2026-10-23': new Date(),
            } },
        updateOne: async (query, update) => { writes.push({ query, update }); },
    };
    const service = new CharacterService({ appStateCollection: mockCollection });
    const stored = await service.getStoredCharacters();
    const sakura = stored.find(character => character.id === 'haruno-sakura');
    const sasuke = stored.find(character => character.id === 'uchiha-sasuke');
    assert.equal(sakura.skills[0].name, 'Kunai Interference');
    assert.equal(sakura.passive.name, 'Exceptional Chakra Control');
    assert.equal(sasuke.skills[0].name, 'Shadow Shuriken Technique');
    assert.equal(sasuke.passive.name, 'Uchiha Prodigy');
    assert.ok(writes.some(({ query, update }) => query.key === 'character_migrations' &&
        update.$set['completed.team-7-sakura-sasuke-rework-2026-10-24-v2']));
});

test('Kakashi and Iruka rework replaces stale stored kits once', async () => {
    const oldKakashi = {
        id: 'hatake-kakashi', characterId: 'hatake-kakashi', name: 'Hatake Kakashi',
        facePicture: 'https://example.com/old-kakashi.png',
        skills: [{ id: 'hatake-kakashi-sharingan-counter', name: 'Sharingan' }],
    };
    const oldIruka = {
        id: 'umino-iruka', characterId: 'umino-iruka', name: 'Umino Iruka',
        facePicture: 'https://example.com/old-iruka.png',
        skills: [{ id: 'umino-iruka-ally-shield', name: 'Ally Shield' }],
    };
    const writes = [];
    const mockCollection = {
        findOne: async ({ key }) => key === 'characters'
            ? { key, characters: [oldKakashi, oldIruka] }
            : { key, completed: {
                'starter-rebalance-2026-07-16': new Date(),
                'exams-rebalance-2026-07-16-v4': new Date(),
                'uzumaki-naruto-rework-2026-10-23': new Date(),
                'team-7-sakura-sasuke-rework-2026-10-24-v2': new Date(),
            } },
        updateOne: async (query, update) => { writes.push({ query, update }); },
    };
    const service = new CharacterService({ appStateCollection: mockCollection });
    const stored = await service.getStoredCharacters();
    const kakashi = stored.find(character => character.id === 'hatake-kakashi');
    const iruka = stored.find(character => character.id === 'umino-iruka');
    assert.equal(kakashi.passive.name, 'Copy Ninja');
    assert.equal(kakashi.skills[0].name, 'Sharingan Insight');
    assert.equal(kakashi.skills[4].name, 'Raikiri');
    assert.equal(iruka.passive.name, 'Genin Promotion');
    assert.equal(iruka.skills[1].name, 'Academy Instruction');
    assert.ok(writes.some(({ query, update }) => query.key === 'character_migrations' &&
        update.$set['completed.kakashi-iruka-rework-2026-10-24']));
});

test('Haku, Zabuza, and Mizuki rework replaces stored concepts once', async () => {
    const old = ['haku', 'momochi-zabuza', 'mizuki'].map((id) => ({
        id, characterId: id, name: id, facePicture: 'https://example.com/old.png',
        characterdeescription: 'Old description', skills: [{ id: `${id}-old` }],
    }));
    const writes = [];
    const mockCollection = {
        findOne: async ({ key }) => key === 'characters'
            ? { key, characters: old }
            : { key, completed: {
                'starter-rebalance-2026-07-16': new Date(),
                'exams-rebalance-2026-07-16-v4': new Date(),
                'uzumaki-naruto-rework-2026-10-23': new Date(),
                'team-7-sakura-sasuke-rework-2026-10-24-v2': new Date(),
                'kakashi-iruka-rework-2026-10-24': new Date(),
            } },
        updateOne: async (query, update) => { writes.push({ query, update }); },
    };
    const service = new CharacterService({ appStateCollection: mockCollection });
    const stored = await service.getStoredCharacters();
    for (const [id, passive, skill] of [
        ['haku', 'Demon of the Ice', 'Demonic Mirroring Ice Crystals'],
        ['momochi-zabuza', 'Silent Killing', 'Kubikiribōchō'],
        ['mizuki', 'Meld in the Shadows', 'Kunai Ambush'],
    ]) {
        const character = stored.find((entry) => entry.characterId === id);
        assert.equal(character.passive.name, passive);
        assert.equal(character.skills[0].name, skill);
        assert.notEqual(character.characterdeescription, 'Old description');
    }
    assert.ok(writes.some(({ query, update }) => query.key === 'character_migrations' &&
        update.$set['completed.waves-haku-zabuza-mizuki-rework-2026-10-24']));
});

test('Demon Brothers rework replaces the stored concept once', async () => {
    const oldBrothers = {
        id: 'demon-brothers', characterId: 'demon-brothers', name: 'Demon Brothers',
        facePicture: 'https://example.com/old-brothers.png',
        characterdeescription: 'Old description',
        skills: [{ id: 'demon-brothers-chain-wrap', name: 'Old Chain Wrap' }],
    };
    const writes = [];
    const completed = {
        'starter-rebalance-2026-07-16': new Date(),
        'exams-rebalance-2026-07-16-v4': new Date(),
        'uzumaki-naruto-rework-2026-10-23': new Date(),
        'team-7-sakura-sasuke-rework-2026-10-24-v2': new Date(),
        'kakashi-iruka-rework-2026-10-24': new Date(),
        'waves-haku-zabuza-mizuki-rework-2026-10-24': new Date(),
    };
    const mockCollection = {
        findOne: async ({ key }) => key === 'characters'
            ? { key, characters: [oldBrothers] }
            : { key, completed },
        updateOne: async (query, update) => { writes.push({ query, update }); },
    };
    const service = new CharacterService({ appStateCollection: mockCollection });
    const stored = await service.getStoredCharacters();
    const brothers = stored.find((entry) => entry.characterId === 'demon-brothers');
    assert.equal(brothers.passive.name, 'Lust for Murder');
    assert.equal(brothers.skills[0].cooldown, 1);
    assert.match(brothers.characterdeescription, /Gōzu and Meizu/);
    assert.ok(writes.some(({ query, update }) => query.key === 'character_migrations' &&
        update.$set['completed.demon-brothers-rework-2026-10-25']));
});

