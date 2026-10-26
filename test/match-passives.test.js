const test = require('node:test');
const assert = require('node:assert/strict');
const battleLogic = require('../battleLogic');
const fullRoster = require('../data/characters');
const { ACTIVE_ROSTER_IDS } = require('../data/activeRoster');
const { reconcileUnitPassive } = require('../services/matchPassives');

const activeRoster = ACTIVE_ROSTER_IDS.map((id) =>
    fullRoster.find((character) => (character.characterId || character.id) === id)
);

test('repairs swapped Sakura and Sasuke passives on both sides of an existing match', () => {
    const players = [
        { username: 'ally', team: [1, 2] },
        { username: 'enemy', team: [2, 1] },
    ];
    const board = battleLogic.buildInitialBoard(players); // Legacy full-roster order.
    const extraStatus = { id: 'existing_buff', remainingTurns: 2, metadata: { helpful: true } };
    board.ally[0].state.statuses.push(extraStatus);
    board.ally[0].state.cooldowns.test_skill = 2;
    board.ally[0].hp = 75;

    for (const units of Object.values(board)) {
        for (const unit of units) {
            assert.equal(reconcileUnitPassive(unit, activeRoster, battleLogic.buildInitialBoard), true);
            const expected = activeRoster[unit.rosterIndex].passive;
            const passives = unit.state.statuses.filter((status) => status.metadata.passive === true);
            assert.equal(passives.length, 1);
            assert.equal(passives[0].metadata.sourceSkillName, expected.name);
            assert.equal(passives[0].metadata.statusIcon, expected.icon);
            assert.equal(reconcileUnitPassive(unit, activeRoster, battleLogic.buildInitialBoard), false);
        }
    }
    assert.equal(board.ally[0].hp, 75);
    assert.equal(board.ally[0].state.cooldowns.test_skill, 2);
    assert.equal(board.ally[0].state.statuses[1], extraStatus);
});

test('removes an invalid passive from a living character without one', () => {
    const unit = battleLogic.buildInitialBoard([{ username: 'ally', team: [1] }]).ally[0];
    const rosterWithoutPassive = activeRoster.map((character, index) =>
        index === 1 ? { ...character, passive: undefined } : character);
    assert.equal(reconcileUnitPassive(unit, rosterWithoutPassive, battleLogic.buildInitialBoard), true);
    assert.equal(unit.state.statuses.some((status) => status.metadata.passive === true), false);
});
