const test = require('node:test');
const assert = require('node:assert/strict');

const { validateCharacterPayload } = require('../services/characterValidation.js');
const createAdminRouter = require('../routes/admin.js');
const canonicalCharacters = require('../data/characters');

test('every canonical character passes editor validation', () => {
    canonicalCharacters.forEach((character) => {
        assert.deepEqual(validateCharacterPayload(character), [], character.characterId);
    });
});

test('validation catches shapes that would break the battle engine', () => {
    const base = JSON.parse(JSON.stringify(canonicalCharacters.find((entry) => entry.characterId === 'haruno-sakura')));
    const broken = JSON.parse(JSON.stringify(base));
    broken.characterId = 'Bad Id';
    broken.skills[0].cooldown = -1;
    broken.skills[1].energy = ['Wind'];
    broken.skills[2].id = broken.skills[3].id;
    broken.skills[3].classes = 'Physical';
    const errors = validateCharacterPayload(broken);
    assert.equal(errors.length, 5, errors.join('\n'));
    assert.deepEqual(validateCharacterPayload({ characterId: 'x', name: 'X', skills: [] }), ['A character needs at least one skill.']);
});

test('admin character updates reject invalid payloads and keep valid ones', async () => {
    const saved = [];
    const roster = [JSON.parse(JSON.stringify(canonicalCharacters.find((entry) => entry.characterId === 'haruno-sakura')))];
    const router = createAdminRouter({
        requireSession: (req, res, next) => next(),
        getCharactersData: () => roster,
        saveCharacters: async (next) => { saved.push(next); },
    });
    const layer = router.stack.find((entry) => entry.route && entry.route.path === '/characters/:characterId' && entry.route.methods.put);
    const handler = layer.route.stack[layer.route.stack.length - 1].handle;
    const run = async (body) => {
        const result = {};
        const res = { status(code) { result.status = code; return res; }, json(data) { result.body = data; return res; } };
        await handler({ authUser: { username: 'boss', role: 'admin' }, params: { characterId: 'haruno-sakura' }, body }, res);
        return result;
    };

    const invalid = JSON.parse(JSON.stringify(roster[0]));
    invalid.skills[0].cooldown = 'soon';
    const rejected = await run(invalid);
    assert.equal(rejected.status, 400);
    assert.match(rejected.body.error, /cooldown/);
    assert.equal(saved.length, 0);

    const tuned = JSON.parse(JSON.stringify(roster[0]));
    tuned.skills[0].cooldown = 2;
    const accepted = await run(tuned);
    assert.equal(accepted.status, undefined);
    assert.equal(accepted.body.character.skills[0].cooldown, 2);
    assert.equal(saved.length, 1);
});
