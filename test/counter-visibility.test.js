const test = require('node:test');
const assert = require('node:assert/strict');
const characters = require('../data/characters');
const { buildInitialBoard } = require('../battleLogic');
const { buildMatchPayloadForUser } = require('../server');

const rosterIndex = characters.findIndex((character) => character.characterId === 'haruno-sakura');
const matchFor = () => {
    const players = [{ username: 'a', team: [rosterIndex] }, { username: 'b', team: [rosterIndex] }];
    return { players, board: buildInitialBoard(players, characters) };
};
const addStatus = (match, unitUsername, metadata, id = 'counter_test') => {
    match.board[unitUsername][0].state.statuses.push({
        id, remainingTurns: 1, sourceUsername: 'a', sourceSlot: 0, metadata,
    });
};
const hasStatus = (match, viewerUsername, unitUsername, id) =>
    buildMatchPayloadForUser(match, viewerUsername).board[unitUsername][0].state.statuses
        .some((status) => status.id === id);

test('counter effects on allies and enemy targets are hidden from the opposing team', () => {
    const match = matchFor();
    addStatus(match, 'a', { helpful: true, counterCancelsSkill: true }, 'defensive_counter');
    addStatus(match, 'b', { harmful: true, counterDamage: 10 }, 'enemy_trap');
    assert.equal(hasStatus(match, 'b', 'a', 'defensive_counter'), false);
    assert.equal(hasStatus(match, 'b', 'b', 'enemy_trap'), false);
    assert.equal(hasStatus(match, 'a', 'a', 'defensive_counter'), true);
    assert.equal(hasStatus(match, 'a', 'b', 'enemy_trap'), true);
});

test('character counter statuses are hidden unless marked visible, while ordinary statuses remain visible', () => {
    const counterEffects = [];
    const collect = (value) => {
        if (Array.isArray(value)) return value.forEach(collect);
        if (!value || typeof value !== 'object') return;
        if (value.statusId && value.metadata &&
            Object.keys(value.metadata).some((key) => /^counter[A-Z]/.test(key))) {
            counterEffects.push(value);
        }
        Object.values(value).forEach(collect);
    };
    characters.forEach((character) => collect(character.skills));
    assert.ok(counterEffects.length > 20);
    counterEffects.forEach((effect, index) => {
        for (const unitUsername of ['a', 'b']) {
            const match = matchFor();
            const id = `counter_${index}`;
            addStatus(match, unitUsername, effect.metadata, id);
            // A counter marked visibleCounter (Kin, Mizuki, Ebisu) is shown to both teams.
            assert.equal(hasStatus(match, 'b', unitUsername, id), Boolean(effect.metadata.visibleCounter),
                `${effect.statusId} must be ${effect.metadata.visibleCounter ? 'visible to' : 'hidden from'} the opposing team`);
            assert.equal(hasStatus(match, 'a', unitUsername, id), true,
                `${effect.statusId} must remain visible to its caster`);
        }
    });
    assert.deepEqual(counterEffects.filter((effect) => effect.metadata.visibleCounter)
        .map((effect) => effect.statusId).sort(),
    ['ebisu_textbook_counter', 'mizuki_kunai_ambush_trap', 'tsuchi_kin_illusion_bell_needles']);
    const match = matchFor();
    addStatus(match, 'a', { helpful: true, damageReductionFlat: 5 }, 'ordinary_defense');
    assert.equal(hasStatus(match, 'b', 'a', 'ordinary_defense'), true);
});

test('a reveal invisible skills effect can still expose a counter', () => {
    const match = matchFor();
    addStatus(match, 'a', { helpful: true, counterCancelsSkill: true }, 'defensive_counter');
    match.board.b[0].state.statuses.push({ id: 'reveal', remainingTurns: 1,
        metadata: { helpful: true, revealInvisibleSkills: true } });
    assert.equal(hasStatus(match, 'b', 'a', 'defensive_counter'), true);
});
