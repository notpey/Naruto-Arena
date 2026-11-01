const test = require('node:test');
const assert = require('node:assert/strict');
const battle = require('../battleLogic');

const characters = [
    {
        name: 'Attacker',
        skills: [{
            id: 'test_hit',
            target: 'single-enemy',
            classes: ['Physical'],
            effects: [{ type: 'damage', amount: 8 }],
        }],
    },
    { name: 'Defender', skills: [] },
];

const makeMatch = () => {
    const players = [{ username: 'p1', team: [0] }, { username: 'p2', team: [1] }];
    const match = {
        players,
        board: battle.buildInitialBoard(players, characters),
        chakraPools: { p1: {}, p2: {} },
        economy: { turnCounts: { p1: 0, p2: 0 } },
        pendingTurns: {},
    };
    const defender = match.board.p2[0];
    defender.state.statuses.push(
        { id: 'guard', remainingTurns: 3, metadata: { damageReductionFlat: 10 } },
        {
            id: 'ongoing_hit',
            remainingTurns: 3,
            sourceUsername: 'p1',
            sourceSlot: 0,
            metadata: { turnEndDamage: 8, turnEndTrigger: 'source_turn' },
        }
    );
    return match;
};

const cast = (match) => {
    match.pendingTurns.p1 = {
        queueOrder: [0],
        queuedByActorSlot: {
            0: { skillIndex: 0, targetSelection: [{ username: 'p2', slot: 0 }] },
        },
    };
    battle.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
};

test('flat damage reduction is shared by skill and turn-end damage, then resets next turn', () => {
    const match = makeMatch();
    const defender = match.board.p2[0];

    cast(match);
    assert.equal(defender.hp, 100);
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(defender.hp, 94, '10 reduction absorbs only 10 of 16 damage this turn');

    cast(match);
    assert.equal(defender.hp, 94, 'the next turn starts with a fresh reduction budget');
    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(defender.hp, 88);
});

test('flat damage reduction is shared by separate status expiry damage effects', () => {
    const match = makeMatch();
    const defender = match.board.p2[0];
    defender.state.statuses = defender.state.statuses.filter((status) => status.id !== 'ongoing_hit');
    defender.state.statuses.push({
        id: 'expiry_hits',
        remainingTurns: 1,
        sourceUsername: 'p1',
        sourceSlot: 0,
        metadata: {
            turnDurationAnchor: 'source_turn',
            onExpireEffects: [
                { type: 'damage', amount: 8 },
                { type: 'damage', amount: 8 },
            ],
        },
    });

    battle.tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(defender.hp, 94);
});
