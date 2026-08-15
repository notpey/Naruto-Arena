const fs = require('fs');
const path = require('path');
const { sortCharactersByRosterOrder } = require('../data/rosterOrder');

const CHARACTERS_STATE_KEY = 'characters';
const CHARACTER_MIGRATIONS_STATE_KEY = 'character_migrations';
const STARTER_REBALANCE_MIGRATION_ID = 'starter-rebalance-2026-07-16';
const EXAMS_REBALANCE_MIGRATION_ID = 'exams-rebalance-2026-07-16-v4';

const STARTER_REBALANCE_CHARACTER_IDS = new Set([
    'uzumaki-naruto',
    'haruno-sakura',
    'uchiha-sasuke',
    'inuzuka-kiba',
    'hyuuga-hinata',
    'nara-shikamaru',
    'akimichi-chouji',
    'yamanaka-ino',
    'rock-lee',
]);

const EXAMS_REBALANCE_CHARACTER_IDS = new Set([
    'uzumaki-naruto',
    'haruno-sakura',
    'uchiha-sasuke',
    'neji-hyuuga',
    'tenten',
    'gaara-of-the-desert',
    'temari',
    'kankuro',
    'tsuchi-kin',
    'zaku-abumi',
    'dosu-kinuta',
    'haku',
    'umino-iruka',
    'mizuki',
    'demon-brothers',
    'momochi-zabuza',
    'oboro',
    'shigure',
    'shiore-orochimaru',
    'akadou-yoroi',
    'tsurugi-misumi',
    'mitarashi-anko',
    'jiroubou',
    'kidoumaru',
    'tayuya',
    'sakon-and-ukon',
    'kimimaro',
    'gekko-hayate',
    'shizune',
    'hatake-kakashi',
    'yuhi-kurenai',
    'sarutobi-asuma',
    'maito-gai',
    'baki',
    'yakushi-kabuto',
]);

class CharacterService {
    constructor({ appStateCollection = null, initialCharacters = null, rootDir = path.join(__dirname, '..') } = {}) {
        this.appStateCollection = appStateCollection;
        this.rootDir = rootDir;
        let startingChars = initialCharacters;
        if (!Array.isArray(startingChars) || startingChars.length === 0) {
            try {
                const modularChars = require(path.join(rootDir, 'data', 'characters'));
                if (Array.isArray(modularChars) && modularChars.length > 0) {
                    startingChars = modularChars;
                }
            } catch (e) {
                try {
                    startingChars = require(path.join(rootDir, 'characters.js'));
                } catch (e2) {
                    startingChars = [];
                }
            }
        }
        this.charactersData = sortCharactersByRosterOrder(startingChars || []);
        this.updateBrowserScript();
        this.characterCatalog = this.buildCharacterCatalog();
    }

    setAppStateCollection(coll) {
        this.appStateCollection = coll;
    }

    getCharacters() {
        return this.charactersData;
    }

    getCharacterCatalog() {
        return this.characterCatalog;
    }

    buildCatalog() {
        return this.buildCharacterCatalog();
    }

    buildFaceMap() {
        const faceMap = new Map();
        (Array.isArray(this.charactersData) ? this.charactersData : []).forEach((c) => {
            if (c?.id && c?.facePicture) faceMap.set(c.id, c.facePicture);
            if (c?.characterId && c?.facePicture) faceMap.set(c.characterId, c.facePicture);
        });
        return faceMap;
    }

    getBrowserScript() {
        return this.charactersBrowserScript;
    }

    updateBrowserScript() {
        this.charactersBrowserScript = `const characters = ${JSON.stringify(this.charactersData)};\nif (typeof window !== 'undefined') window.characters = characters;`;
    }

    buildCharacterCatalog() {
        const list = Array.isArray(this.charactersData) ? this.charactersData : [];
        return list.map((character) => ({
            id: character.id,
            characterId: character.characterId || character.id,
            name: character.name,
            facePicture: character.facePicture,
            characterdescription: character.characterdeescription || character.characterdescription || '',
            skills: (character.skills || []).map((skill) => ({
                id: skill.id,
                name: skill.name,
                skillimage: skill.skillimage,
                skilldescription: skill.skilldescription,
                energy: Array.isArray(skill.energy) ? skill.energy : [],
                classes: Array.isArray(skill.classes) ? skill.classes : [],
                cooldown: Number(skill.cooldown) || 0,
            })),
        }));
    }

    static serializeCharactersScript(nextCharacters) {
        return `const characters = ${JSON.stringify(nextCharacters)};\nif (typeof window !== 'undefined') window.characters = characters;`;
    }

    static serializeCharactersDataFile(nextCharacters) {
        return (
            'const characters = ' +
            JSON.stringify(nextCharacters, null, 4) +
            ';\n\nif (typeof module !== \'undefined\') {\n    module.exports = characters;\n}\n'
        );
    }

    serializeCharactersDataFile(nextCharacters) {
        return CharacterService.serializeCharactersDataFile(nextCharacters);
    }


    syncToModularFiles(charactersList) {
        const charsDir = path.join(this.rootDir, 'data', 'characters');
        if (!fs.existsSync(charsDir)) {
            fs.mkdirSync(charsDir, { recursive: true });
        }
        const currentFiles = fs.readdirSync(charsDir).filter((f) => f.endsWith('.js') && f !== 'index.js');
        const validFileNames = new Set();

        charactersList.forEach((char) => {
            if (!char || !char.id) return;
            const fileName = `${char.id}.js`;
            validFileNames.add(fileName);
            const filePath = path.join(charsDir, fileName);
            const fileContent = `module.exports = ${JSON.stringify(char, null, 4)};\n`;
            fs.writeFileSync(filePath, fileContent, 'utf-8');
        });

        currentFiles.forEach((file) => {
            if (!validFileNames.has(file)) {
                try {
                    fs.unlinkSync(path.join(charsDir, file));
                } catch (e) {
                    // ignore unlink error
                }
            }
        });

        const indexLines = [
            'const { sortCharactersByRosterOrder } = require("../rosterOrder");\n',
            'const rawCharacters = ['
        ];
        charactersList.forEach((char) => {
            if (!char || !char.id) return;
            indexLines.push(`    require('./${char.id}.js'),`);
        });
        indexLines.push('];\n');
        indexLines.push('module.exports = sortCharactersByRosterOrder(rawCharacters);\n');
        fs.writeFileSync(path.join(charsDir, 'index.js'), indexLines.join('\n'), 'utf-8');
    }

    async saveCharacters(nextCharacters) {
        if (!this.appStateCollection) {
            throw new Error('Database not connected.');
        }
        const now = new Date();
        await this.appStateCollection.updateOne(
            { key: CHARACTERS_STATE_KEY },
            {
                $set: {
                    key: CHARACTERS_STATE_KEY,
                    characters: nextCharacters,
                    updatedAt: now,
                },
            },
            { upsert: true }
        );
        await this.appStateCollection.updateOne(
            { key: CHARACTER_MIGRATIONS_STATE_KEY },
            {
                $set: {
                    key: CHARACTER_MIGRATIONS_STATE_KEY,
                    [`completed.${STARTER_REBALANCE_MIGRATION_ID}`]: now,
                    [`completed.${EXAMS_REBALANCE_MIGRATION_ID}`]: now,
                    updatedAt: now,
                },
            },
            { upsert: true }
        );
        const sortedCharacters = sortCharactersByRosterOrder(nextCharacters);
        this.charactersData = sortedCharacters;
        this.updateBrowserScript();
        this.characterCatalog = this.buildCharacterCatalog();

        try {
            fs.writeFileSync(
                path.join(this.rootDir, 'characters.js'),
                this.serializeCharactersDataFile(sortedCharacters),
                'utf-8'
            );
        } catch (diskErr) {
            console.warn('Could not write updated characters.js to disk:', diskErr);
        }

        try {
            this.syncToModularFiles(sortedCharacters);
        } catch (modErr) {
            console.warn('Could not write updated modular character files to disk:', modErr);
        }
    }

    async getStoredCharacters() {
        const defaultCharacters = Array.isArray(this.charactersData) ? this.charactersData : [];
        if (!this.appStateCollection) {
            return defaultCharacters;
        }

        const storedState = await this.appStateCollection.findOne({ key: CHARACTERS_STATE_KEY });
        if (!storedState || !Array.isArray(storedState.characters)) {
            const now = new Date();
            await this.appStateCollection.updateOne(
                { key: CHARACTERS_STATE_KEY },
                { $set: { key: CHARACTERS_STATE_KEY, characters: defaultCharacters, updatedAt: now } },
                { upsert: true }
            );
            await this.appStateCollection.updateOne(
                { key: CHARACTER_MIGRATIONS_STATE_KEY },
                {
                    $set: {
                        key: CHARACTER_MIGRATIONS_STATE_KEY,
                        [`completed.${STARTER_REBALANCE_MIGRATION_ID}`]: now,
                        [`completed.${EXAMS_REBALANCE_MIGRATION_ID}`]: now,
                        updatedAt: now,
                    },
                },
                { upsert: true }
            );
            return defaultCharacters;
        }

        const migrationState =
            (await this.appStateCollection.findOne({ key: CHARACTER_MIGRATIONS_STATE_KEY })) || {};
        const completedMigrations =
            migrationState.completed && typeof migrationState.completed === 'object'
                ? migrationState.completed
                : {};
        const shouldApplyStarterRebalance = !completedMigrations[STARTER_REBALANCE_MIGRATION_ID];
        const shouldApplyExamsRebalance = !completedMigrations[EXAMS_REBALANCE_MIGRATION_ID];
        const characterIdsToRefresh = new Set([
            ...(shouldApplyStarterRebalance ? Array.from(STARTER_REBALANCE_CHARACTER_IDS) : []),
            ...(shouldApplyExamsRebalance ? Array.from(EXAMS_REBALANCE_CHARACTER_IDS) : []),
        ]);
        const defaultByCharacterId = new Map(
            defaultCharacters
                .filter((entry) => entry && typeof entry.characterId === 'string' && entry.characterId)
                .map((entry) => [entry.characterId, entry])
        );

        let backfilledMissingImages = false;
        const withSeedImageFallback = (entry) => {
            const characterId = entry && typeof entry.characterId === 'string' ? entry.characterId : '';
            const seedEntry = characterId ? defaultByCharacterId.get(characterId) : null;
            const storedFace = typeof entry?.facePicture === 'string' ? entry.facePicture.trim() : '';
            const seedFace = typeof seedEntry?.facePicture === 'string' ? seedEntry.facePicture.trim() : '';
            let nextEntry = entry;
            if (!storedFace && seedFace) {
                backfilledMissingImages = true;
                nextEntry = {
                    ...nextEntry,
                    facePicture: seedFace,
                };
            }
            const seedSkillsById = new Map(
                (Array.isArray(seedEntry?.skills) ? seedEntry.skills : [])
                    .filter((skill) => skill && typeof skill.id === 'string' && skill.id)
                    .map((skill) => [skill.id, skill])
            );
            const skills = Array.isArray(nextEntry?.skills) ? nextEntry.skills : [];
            if (!seedSkillsById.size || !skills.length) {
                return nextEntry;
            }
            let changedSkills = false;
            const nextSkills = skills.map((skill) => {
                const seedSkill = skill?.id ? seedSkillsById.get(skill.id) : null;
                const storedImage = typeof skill?.skillimage === 'string' ? skill.skillimage.trim() : '';
                const seedImage = typeof seedSkill?.skillimage === 'string' ? seedSkill.skillimage.trim() : '';
                if (storedImage || !seedImage) {
                    return skill;
                }
                changedSkills = true;
                return {
                    ...skill,
                    skillimage: seedImage,
                };
            });
            if (changedSkills) {
                backfilledMissingImages = true;
                nextEntry = {
                    ...nextEntry,
                    skills: nextSkills,
                };
            }
            return nextEntry;
        };

        const refreshedStored = storedState.characters.map((entry) => {
            const characterId = entry && typeof entry.characterId === 'string' ? entry.characterId : '';
            const seedEntry = characterId ? defaultByCharacterId.get(characterId) : null;
            if (seedEntry) {
                return {
                    ...seedEntry,
                    facePicture: (typeof entry.facePicture === 'string' && entry.facePicture.trim()) || seedEntry.facePicture,
                    characterdeescription: (typeof entry.characterdeescription === 'string' && entry.characterdeescription.trim()) || seedEntry.characterdeescription,
                };
            }
            return withSeedImageFallback(entry);
        });

        const storedIds = new Set(
            refreshedStored
                .filter((entry) => entry && typeof entry.characterId === 'string' && entry.characterId)
                .map((entry) => entry.characterId)
        );

        const newSeedCharacters = defaultCharacters.filter(
            (entry) =>
                entry &&
                typeof entry.characterId === 'string' &&
                entry.characterId &&
                !storedIds.has(entry.characterId)
        );

        const mergedCharacters = sortCharactersByRosterOrder([...refreshedStored, ...newSeedCharacters]);
        this.charactersData = mergedCharacters;
        this.updateBrowserScript();
        this.characterCatalog = this.buildCharacterCatalog();

        if (
            shouldApplyStarterRebalance ||
            shouldApplyExamsRebalance ||
            newSeedCharacters.length > 0 ||
            backfilledMissingImages
        ) {
            const now = new Date();
            await this.appStateCollection.updateOne(
                { key: CHARACTERS_STATE_KEY },
                { $set: { key: CHARACTERS_STATE_KEY, characters: mergedCharacters, updatedAt: now } },
                { upsert: true }
            );
            await this.appStateCollection.updateOne(
                { key: CHARACTER_MIGRATIONS_STATE_KEY },
                {
                    $set: {
                        key: CHARACTER_MIGRATIONS_STATE_KEY,
                        [`completed.${STARTER_REBALANCE_MIGRATION_ID}`]: now,
                        [`completed.${EXAMS_REBALANCE_MIGRATION_ID}`]: now,
                        updatedAt: now,
                    },
                },
                { upsert: true }
            );
        }

        return mergedCharacters;
    }
}

module.exports = {
    CharacterService,
    CHARACTERS_STATE_KEY,
    CHARACTER_MIGRATIONS_STATE_KEY,
};
