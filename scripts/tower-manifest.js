// Writes docs/tower-2.0-manifest.json: every Tower 2.0 catalog id with its tier, scope,
// implementation status and blocker, straight from the registries. Re-run after changing
// towerAugments.js, towerFusions.js or towerCharacterAugments.js:
//   node scripts/tower-manifest.js
const fs = require('node:fs');
const path = require('node:path');
const { AUGMENTS } = require('../services/tower/towerAugments');
const { RECIPES } = require('../services/tower/towerFusions');
const { CHARACTER_AUGMENTS, validateCharacterAugments } = require('../services/tower/towerCharacterAugments');
const characters = require('../data/characters');

const tally = (entries) => entries.reduce((counts, entry) => ({
    ...counts, [entry.implementationStatus]: (counts[entry.implementationStatus] || 0) + 1,
}), { implemented: 0, pending: 0, blocked: 0 });

const problems = validateCharacterAugments(characters);
const manifest = {
    generatedFrom: 'services/tower/{towerAugments,towerFusions,towerCharacterAugments}.js',
    standardTotalFloors: 200,
    totals: {
        augments: tally(AUGMENTS),
        fusions: tally(RECIPES),
        characterAugments: tally(CHARACTER_AUGMENTS),
    },
    augments: AUGMENTS.map((entry) => ({
        code: entry.code, id: entry.id, name: entry.name, tier: entry.tier, scope: entry.scope,
        status: entry.implementationStatus, needs: entry.needs, descriptionOriginal: entry.descriptionOriginal,
        descriptionNormalized: entry.descriptionNormalized,
    })),
    fusions: RECIPES.map((recipe) => ({
        code: recipe.id, resultId: recipe.resultId, name: recipe.name, tier: recipe.tier, ingredients: recipe.ingredients,
        workbookScope: recipe.workbookScope, scope: recipe.scope, status: recipe.implementationStatus, needs: recipe.needs,
    })),
    characterAugments: CHARACTER_AUGMENTS.map((entry) => ({
        code: entry.code, id: entry.id, name: entry.name, tier: entry.tier, characterId: entry.characterId,
        targetSkillIds: entry.targetSkillIds, status: entry.implementationStatus, needs: entry.needs,
        rosterProblems: problems.filter((problem) => problem.code === entry.code).map((problem) => problem.error),
    })),
};

const target = path.join(__dirname, '..', 'docs', 'tower-2.0-manifest.json');
fs.writeFileSync(target, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${path.relative(process.cwd(), target)}:`, JSON.stringify(manifest.totals));
