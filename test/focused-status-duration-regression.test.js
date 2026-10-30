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

test('Gaara Sand Binding Coffin stuns for one target turn', () => {
    const match = makeMatch([indexById['gaara-of-the-desert']], [indexById.tenten]);

    queueSkill(match, 'p1', 0, 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    assert.equal(getStatus(match, 'p2', 0, 'gaara_sand_binding_coffin_stun')?.remainingTurns, 1);
    tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.equal(getStatus(match, 'p2', 0, 'gaara_sand_binding_coffin_stun'), undefined);
});

test('Gaara Sand Binding Coffin adds two persistent Sand Flow stacks', () => {
    const match = makeMatch([indexById['gaara-of-the-desert']], [indexById.tenten]);

    queueSkill(match, 'p1', 0, 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    tickStatusesForTurnEnd({ match, endingUsername: 'p2' });

    assert.equal(getStatus(match, 'p1', 0, 'gaara_of_the_desert_sand_flow')?.metadata.sandFlowStacks, 4);
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
    assert.equal(match.board.p2[0].hp, 90);
    assert.equal(match.board.p2[1].hp, 90);

    queueSkill(match, 'p1', 0, 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(match.board.p2[0].hp, 90, 'Gaara reduces the 5 physical Trap damage to zero');
    assert.equal(match.board.p2[1].hp, 85);
});

test('Tenten Twin Rising Dragons Trap stacks its additional damage reduction', () => {
    const match = makeMatch([indexById.tenten], [indexById['gaara-of-the-desert']]);

    queueSkill(match, 'p1', 0, 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    queueSkill(match, 'p1', 0, 1);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    assert.equal(
        getStatus(match, 'p2', 0, 'tenten_twin_rising_dragons_trap_stack')?.metadata?.nonAfflictionDamageDebuffFlat,
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
    assert.equal(match.board.p2[1].hp, 70);
    assert.equal(match.board.p2[2].hp, 65);
});

test('Kakashi Nin-Dogs prepares Raikiri for his next turn', () => {
    const match = makeMatch([indexById['hatake-kakashi']], [indexById['gaara-of-the-desert']]);

    queueSkill(match, 'p1', 0, 1, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    assert.equal(getStatus(match, 'p2', 0, 'kakashi_nin_dogs_stun')?.remainingTurns, 1);
    assert.equal(getStatus(match, 'p1', 0, 'kakashi_nin_dogs_raikiri_ready')?.remainingTurns, 1);
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.equal(
        getStatus(match, 'p1', 0, 'kakashi_nin_dogs_raikiri_ready')?.remainingTurns,
        1,
        'Raikiri should remain available on Kakashi’s next turn'
    );

    const hpBefore = match.board.p2[0].hp;
    assert.equal(resolveEffectiveSkill({
        characters, rosterIndex: indexById['hatake-kakashi'],
        skillIndex: 1, actorState: match.board.p1[0].state,
    }).id, 'hatake-kakashi-raikiri');
    queueSkill(match, 'p1', 0, 1, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });
    assert.equal(hpBefore - match.board.p2[0].hp, 40);
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

test('Hokage Hiruzen Crystal Ball observation lasts two source turns', () => {
    const match = makeMatch([indexById['sarutobi-hiruzen']], [indexById.tenten]);

    queueSkill(match, 'p1', 0, 0, [{ username: 'p2', slot: 0 }]);
    resolvePendingTurnSkills({ match, actingUsername: 'p1', characters });

    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    tickStatusesForTurnEnd({ match, endingUsername: 'p2' });
    assert.ok(getStatus(match, 'p2', 0, 'sarutobi_hiruzen_crystal_ball_observation'));
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.ok(getStatus(match, 'p2', 0, 'sarutobi_hiruzen_crystal_ball_observation'));
    tickStatusesForTurnEnd({ match, endingUsername: 'p1' });
    assert.equal(getStatus(match, 'p2', 0, 'sarutobi_hiruzen_crystal_ball_observation'), undefined);
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
    assert.equal(hpBefore - match.board.p2[0].hp, 25);
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
