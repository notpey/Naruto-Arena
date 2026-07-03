const assert = require('node:assert/strict');
const test = require('node:test');

const characters = require('../characters.js');
const {
    buildInitialBoard,
    resolvePendingTurnSkills,
    tickStatusesForTurnEnd,
} = require('../battleLogic.js');

const indexById = Object.fromEntries(characters.map((character, index) => [character.characterId, index]));

const fullPool = () => ({
    taijutsu: 9,
    ninjutsu: 9,
    bloodline: 9,
    genjutsu: 9,
});

const makeMatch = (team1, team2) => {
    const players = [
        { username: 'p1', team: team1 },
        { username: 'p2', team: team2 },
    ];
    const match = {
        players,
        board: buildInitialBoard(players, characters),
        chakraPools: {
            p1: fullPool(),
            p2: fullPool(),
        },
        economy: {
            turnCounts: {
                p1: 0,
                p2: 0,
            },
        },
        pendingTurns: {},
    };
    Object.entries(match.board).forEach(([username, units]) => {
        units.forEach((unit) => {
            unit.username = username;
        });
    });
    return match;
};

const queueSkill = (match, username, actorSlot, skillIndex, targetSelection = []) => {
    match.pendingTurns[username] = {
        queueOrder: [actorSlot],
        queuedByActorSlot: {
            [actorSlot]: {
                skillIndex,
                targetSelection,
            },
        },
    };
};

const getStatus = (match, username, slot, statusId) =>
    (match.board?.[username]?.[slot]?.state?.statuses || []).find(
        (status) => status?.id === statusId && (Number(status?.remainingTurns) || 0) > 0
    );

test('Gaara Sand Coffin stun decrements on target turns and expires', () => {
    const match = makeMatch([indexById['gaara-of-the-desert']], [indexById.tenten]);

    queueSkill(match, 'p1', 0, 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    assert.equal(getStatus(match, 'p2', 0, 'gaara_sand_coffin_stun')?.remainingTurns, 2);
    tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.equal(getStatus(match, 'p2', 0, 'gaara_sand_coffin_stun')?.remainingTurns, 1);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(getStatus(match, 'p2', 0, 'gaara_sand_coffin_stun')?.remainingTurns, 1);
    tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.equal(getStatus(match, 'p2', 0, 'gaara_sand_coffin_stun'), undefined);
});

test('Tenten Twin Rising Dragons Trap debuff expires instead of freezing', () => {
    const match = makeMatch([indexById.tenten], [indexById['gaara-of-the-desert']]);

    queueSkill(match, 'p1', 0, 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    assert.equal(getStatus(match, 'p2', 0, 'tenten_twin_rising_dragons_trap_debuff')?.remainingTurns, 1);
    tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.equal(getStatus(match, 'p2', 0, 'tenten_twin_rising_dragons_trap_debuff'), undefined);
});

test('Tsuchi Kin Unnerving Bells no longer applies cooldown paralyze', () => {
    const match = makeMatch([indexById['tsuchi-kin']], [indexById['gaara-of-the-desert']]);

    queueSkill(match, 'p1', 0, 2, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    assert.equal(getStatus(match, 'p2', 0, 'tsuchi_kin_unnerving_bells_cooldown_paralyze'), undefined);
    assert.equal(getStatus(match, 'p1', 0, 'tsuchi_kin_illusion_bell_trigger_unnerving_bells')?.remainingTurns, 1);
});

test('Orochimaru Manda grants one random chakra on Orochimaru turn end', () => {
    const match = makeMatch([indexById.orochimaru], [indexById.tenten]);

    queueSkill(match, 'p1', 0, 2, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    assert.equal(getStatus(match, 'p1', 0, 'orochimaru_manda_chakra_gain')?.remainingTurns, 99);

    match.chakraPools.p1 = { taijutsu: 0, ninjutsu: 0, bloodline: 0, genjutsu: 0 };
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    const before = Object.values(match.chakraPools.p1).reduce((sum, value) => sum + value, 0);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    const after = Object.values(match.chakraPools.p1).reduce((sum, value) => sum + value, 0);

    assert.equal(after, before + 1);
});

test('Temari Summoning Quick Beheading Dance damages all enemies on apply', () => {
    const match = makeMatch(
        [indexById.temari],
        [indexById.tenten, indexById['gaara-of-the-desert'], indexById['tsuchi-kin']]
    );

    queueSkill(match, 'p1', 0, 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });

    assert.equal(match.board.p2[0].hp, 65);
    assert.equal(match.board.p2[1].hp, 65);
    assert.equal(match.board.p2[2].hp, 65);
});

test('Kakashi Raikiri still gets its Ninja Dogs bonus on his next turn', () => {
    const match = makeMatch([indexById['hatake-kakashi']], [indexById['gaara-of-the-desert']]);

    queueSkill(match, 'p1', 0, 1, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    assert.equal(getStatus(match, 'p2', 0, 'kakashi_ninja_dogs_mark')?.remainingTurns, 1);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.equal(
        getStatus(match, 'p2', 0, 'kakashi_ninja_dogs_mark')?.remainingTurns,
        1,
        'mark should survive the opponent turn so it is still up for Raikiri next Kakashi turn'
    );

    const hpBefore = match.board.p2[0].hp;
    queueSkill(match, 'p1', 0, 2, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(hpBefore - match.board.p2[0].hp, 100);
});
