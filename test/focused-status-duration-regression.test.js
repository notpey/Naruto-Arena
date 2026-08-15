const assert = require('node:assert/strict');
const test = require('node:test');

const characters = require("../data/characters/index.js");
const {
    buildInitialBoard,
    computeTargetOptions,
    resolveEffectiveSkill,
    resolvePendingTurnSkills,
    tickStatusesForTurnEnd,
} = require('../battleLogic.js');

const indexById = Object.fromEntries(characters.map((character, index) => [character.characterId, index]));

const fullPool = () => ({
    taijutsu: 10,
    ninjutsu: 10,
    bloodline: 10,
    genjutsu: 10,
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

test('Gaara Sand Coffin remains replaced by Sand Burial on Gaara next turn', () => {
    const match = makeMatch([indexById['gaara-of-the-desert']], [indexById.tenten]);

    queueSkill(match, 'p1', 0, 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    tickStatusesForTurnEnd({ match, endingUsername: 'p2' });

    assert.equal(
        resolveEffectiveSkill({
            characters,
            rosterIndex: indexById['gaara-of-the-desert'],
            skillIndex: 0,
            actorState: match.board.p1[0].state,
        }).id,
        'gaara-of-the-desert-sand-burial'
    );
});

test('Tenten Twin Rising Dragons Trap debuff expires instead of freezing', () => {
    const match = makeMatch([indexById.tenten], [indexById['gaara-of-the-desert']]);

    queueSkill(match, 'p1', 0, 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    queueSkill(match, 'p1', 0, 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    assert.equal(getStatus(match, 'p2', 0, 'tenten_twin_rising_dragons_trap_debuff')?.remainingTurns, 1);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(getStatus(match, 'p2', 0, 'tenten_twin_rising_dragons_trap_debuff'), undefined);
});

test('Tenten Twin Rising Dragons and Trap apply expected damage', () => {
    const match = makeMatch([indexById.tenten], [indexById['gaara-of-the-desert'], indexById['tsuchi-kin']]);

    queueSkill(match, 'p1', 0, 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 85);
    assert.equal(match.board.p2[1].hp, 90);

    queueSkill(match, 'p1', 0, 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 70);
    assert.equal(match.board.p2[1].hp, 75);
});

test('Tenten Twin Rising Dragons marks stack their Trap damage bonus', () => {
    const match = makeMatch([indexById.tenten], [indexById['gaara-of-the-desert']]);

    queueSkill(match, 'p1', 0, 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    match.board.p1[0].state.cooldowns = {};

    queueSkill(match, 'p1', 0, 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    assert.equal(
        getStatus(match, 'p2', 0, 'tenten_twin_rising_dragons_mark')?.metadata?.bonusDamageFromSourceSkillsFlat,
        20
    );
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
    assert.equal(hpBefore - match.board.p2[0].hp, 45);
});

test('Asuma Sharpen Blades unlocks Flying Swallow and Finishing Blow cycles with Flying Kick', () => {
    const match = makeMatch([indexById['sarutobi-asuma']], [indexById.tenten]);

    queueSkill(match, 'p1', 0, 0);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(
        resolveEffectiveSkill({
            characters,
            rosterIndex: indexById['sarutobi-asuma'],
            skillIndex: 0,
            actorState: match.board.p1[0].state,
        }).id,
        'sarutobi-asuma-flying-swallow'
    );

    queueSkill(match, 'p1', 0, 0);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(
        resolveEffectiveSkill({
            characters,
            rosterIndex: indexById['sarutobi-asuma'],
            skillIndex: 0,
            actorState: match.board.p1[0].state,
        }).id,
        'sarutobi-asuma-sharpen-blades'
    );

    queueSkill(match, 'p1', 0, 1, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(
        resolveEffectiveSkill({
            characters,
            rosterIndex: indexById['sarutobi-asuma'],
            skillIndex: 1,
            actorState: match.board.p1[0].state,
        }).id,
        'sarutobi-asuma-flying-kick'
    );

    match.board.p1[0].state.cooldowns = {};
    queueSkill(match, 'p1', 0, 1, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(
        resolveEffectiveSkill({
            characters,
            rosterIndex: indexById['sarutobi-asuma'],
            skillIndex: 1,
            actorState: match.board.p1[0].state,
        }).id,
        'sarutobi-asuma-finishing-blow'
    );
});

test('Itachi Mangekyou changes Amaterasu targeting to all enemies without a replacement skill', () => {
    const match = makeMatch([indexById['uchiha-itachi']], [indexById.tenten, indexById['gaara-of-the-desert']]);

    queueSkill(match, 'p1', 0, 0);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    const effectiveAmaterasu = resolveEffectiveSkill({
        characters,
        rosterIndex: indexById['uchiha-itachi'],
        skillIndex: 1,
        actorState: match.board.p1[0].state,
    });
    const targetOptions = computeTargetOptions({
        match,
        actingUsername: 'p1',
        actorSlot: 0,
        skillIndex: 1,
        characters,
    });

    assert.equal(effectiveAmaterasu.id, 'uchiha-itachi-amaterasu');
    assert.equal(effectiveAmaterasu.target, 'all-enemy');
    assert.equal(targetOptions.mode, 'all');
    assert.equal(targetOptions.targets.length, 2);
});

test('Iruka Sealed Bomb Square marks only the chosen enemy', () => {
    const match = makeMatch([indexById['umino-iruka']], [indexById.tenten, indexById['gaara-of-the-desert']]);

    queueSkill(match, 'p1', 0, 2, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    assert.ok(getStatus(match, 'p2', 0, 'iruka_sealed_bomb_trap'));
    assert.equal(getStatus(match, 'p2', 1, 'iruka_sealed_bomb_trap'), undefined);
});

test('Hiruzen Dead Demon Consuming Seal ticks while Hiruzen is self-stunned', () => {
    const match = makeMatch([indexById['sarutobi-hiruzen']], [indexById.tenten]);

    queueSkill(match, 'p1', 0, 1, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    tickStatusesForTurnEnd({ match, endingUsername: 'p2' });

    assert.equal(match.board.p2[0].hp, 60);
    assert.equal(match.board.p1[0].hp, 80);
});

test('Jiroubou Earth Prison drains chakra each source turn while it survives', () => {
    const match = makeMatch([indexById.jiroubou], [indexById.tenten]);

    queueSkill(match, 'p1', 0, 2, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(Object.values(match.chakraPools.p2).reduce((sum, amount) => sum + amount, 0), 39);

    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(Object.values(match.chakraPools.p2).reduce((sum, amount) => sum + amount, 0), 39);

    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(Object.values(match.chakraPools.p2).reduce((sum, amount) => sum + amount, 0), 38);
});

test('Gai Morning Peacock Feint protects an ally during Sixth Gate Opening', () => {
    const match = makeMatch([indexById['maito-gai'], indexById.tenten], [indexById['gaara-of-the-desert']]);

    queueSkill(match, 'p1', 0, 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(
        resolveEffectiveSkill({
            characters,
            rosterIndex: indexById['maito-gai'],
            skillIndex: 2,
            actorState: match.board.p1[0].state,
        }).id,
        'maito-gai-morning-peacock-feint'
    );

    queueSkill(match, 'p1', 0, 2, [{ username: 'p1', slot: 1 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(getStatus(match, 'p1', 1, 'gai_morning_peacock_feint')?.remainingTurns, 1);

    const hpBefore = match.board.p2[0].hp;
    queueSkill(match, 'p2', 0, 0, [{ username: 'p1', slot: 1 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p2', characters });
    assert.equal(hpBefore - match.board.p2[0].hp, 30);
    assert.equal(match.board.p1[1].hp, 100);
});

test('Shikamaru Shadow Imitation and Shadow-Neck Bind target options filter only enemies affected by Meditate', () => {
    const match = makeMatch([indexById['nara-shikamaru']], [indexById.tenten, indexById['gaara-of-the-desert']]);

    queueSkill(match, 'p1', 0, 0, [{ username: 'p2', slot: 1 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    const targetOptions = computeTargetOptions({
        match,
        actingUsername: 'p1',
        actorSlot: 0,
        skillIndex: 2,
        characters,
    });

    assert.equal(targetOptions.targets.length, 1);
    assert.equal(targetOptions.targets[0].slot, 1);
});
