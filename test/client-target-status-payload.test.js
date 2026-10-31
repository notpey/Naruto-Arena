const test = require('node:test');
const assert = require('node:assert/strict');
const characters = require('../data/characters');
const battle = require('../battleLogic');
const { buildMatchPayloadForUser } = require('../server');

const index = (id) => characters.findIndex((character) => character.characterId === id);

test('match payload exposes visible status origin and invulnerability needed for skill availability', () => {
    const players = [
        { username: 'ally', team: [index('uzumaki-naruto')] },
        { username: 'enemy', team: [index('uzumaki-naruto')] },
    ];
    const match = { players, board: battle.buildInitialBoard(players, characters) };
    match.board.ally[0].state.statuses.push({
        id: 'ally_guard', remainingTurns: 1, sourceSkillId: 'uzumaki-naruto-shadow-clone-technique',
        sourceUsername: 'ally', sourceSlot: 0, metadata: { helpful: true, invulnerable: true },
    });
    match.board.enemy[0].state.statuses.push({
        id: 'enemy_guard', remainingTurns: 1, sourceSkillId: 'uzumaki-naruto-shadow-clone-technique',
        sourceUsername: 'enemy', sourceSlot: 0, metadata: { helpful: true, invulnerable: true },
    });
    const payload = buildMatchPayloadForUser(match, 'ally');
    const allyGuard = payload.board.ally[0].state.statuses.find((status) => status.id === 'ally_guard');
    const enemyGuard = payload.board.enemy[0].state.statuses.find((status) => status.id === 'enemy_guard');
    assert.equal(allyGuard.sourceUsername, 'ally');
    assert.equal(enemyGuard.sourceUsername, 'enemy');
    assert.equal(enemyGuard.metadata.invulnerable, true);
    assert.deepEqual(battle.computeTargetOptions({ match, actingUsername: 'ally', actorSlot: 0,
        skillIndex: 0, characters }).targets, []);
});
