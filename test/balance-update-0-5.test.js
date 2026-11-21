const test = require('node:test');
const assert = require('node:assert/strict');
const characters = require('../data/characters');
const battle = require('../battleLogic');
const {
    BALANCE_UPDATE_0_5_CHARACTER_IDS,
    applyBalanceUpdate05,
} = require('../services/balanceUpdate05');

const indexOf = (id) => characters.findIndex((character) => character.characterId === id);
const character = (id) => characters[indexOf(id)];
const skill = (characterId, skillId) => character(characterId).skills.find((entry) => entry.id === skillId);
const skillIndex = (characterId, skillId) => character(characterId).skills.findIndex((entry) => entry.id === skillId);
const pool = () => ({ taijutsu: 10, ninjutsu: 10, bloodline: 10, genjutsu: 10 });
const matchFor = (allies, enemies) => {
    const players = [
        { username: 'p1', team: allies.map(indexOf) },
        { username: 'p2', team: enemies.map(indexOf) },
    ];
    const match = {
        players, board: battle.buildInitialBoard(players, characters),
        chakraPools: { p1: pool(), p2: pool() },
        economy: { turnCounts: { p1: 0, p2: 0 } }, pendingTurns: {},
    };
    Object.entries(match.board).forEach(([username, units]) =>
        units.forEach((unit) => { unit.username = username; }));
    return match;
};
const cast = (match, username, actorSlot, index, targetUsername = null, targetSlot = 0) => {
    match.pendingTurns[username] = {
        queueOrder: [actorSlot],
        queuedByActorSlot: { [actorSlot]: {
            skillIndex: index,
            targetSelection: targetUsername ? [{ username: targetUsername, slot: targetSlot }] : [],
        } },
    };
    battle.resolvePendingTurnSkills({ match, actingUsername: username, characters });
};
const status = (unit, id) => unit.state.statuses.find((entry) => entry.id === id && entry.remainingTurns > 0);

test('Balance 0.5 costs and cooldowns', () => {
    assert.deepEqual(skill('gaara-of-the-desert', 'gaara-of-the-desert-desert-funeral').energy, ['Bloodline', 'Random']);
    const tuning = skill('dosu-kinuta', 'dosu-kinuta-melody-arm-tuning');
    assert.deepEqual([tuning.energy, tuning.cooldown], [[], 0]);
    assert.deepEqual(skill('mitarashi-anko', 'mitarashi-anko-dual-pin').energy, []);
    const needles = skill('shigure', 'shigure-sprinkling-needles');
    assert.equal(needles.cannotBeCountered, true);
    assert.equal(needles.cannotBeReflected, true);
});

test('Obito Goukakyuu no Jutsu stops its targets from being healed for 1 turn', () => {
    const match = matchFor(['uchiha-obito'], ['nohara-rin', 'haruno-sakura']);
    cast(match, 'p1', 0, skillIndex('uchiha-obito', 'uchiha-obito-goukakyuu-no-jutsu'));
    assert.equal(match.board.p2[1].hp, 85, '30 damage split over two enemies');
    assert.ok(status(match.board.p2[0], 'uchiha_obito_goukakyuu_no_heal'));
    assert.ok(status(match.board.p2[1], 'uchiha_obito_goukakyuu_no_heal'));
    cast(match, 'p2', 0, skillIndex('nohara-rin', 'nohara-rin-healing-touch'), 'p2', 1);
    assert.equal(match.board.p2[1].hp, 85, 'the heal is blocked');
});

test('Sprinkling Needles goes through a counter', () => {
    const match = matchFor(['shigure'], ['tsuchi-kin']);
    cast(match, 'p2', 0, skillIndex('tsuchi-kin', 'tsuchi-kin-illusion-bell-needles'));
    cast(match, 'p1', 0, skillIndex('shigure', 'shigure-sprinkling-needles'));
    assert.ok(status(match.board.p2[0], 'shigure_sprinkling_needles'), 'the needles land on Kin');
});

test('The balance 0.5 migration replaces only the changed skills and keeps stored art', () => {
    assert.deepEqual(BALANCE_UPDATE_0_5_CHARACTER_IDS.sort(),
        ['baki', 'dosu-kinuta', 'gaara-of-the-desert', 'mitarashi-anko', 'shigure', 'uchiha-obito']);
    const seed = character('gaara-of-the-desert');
    const stored = {
        ...seed,
        skills: seed.skills.map((entry) => ({ ...entry, skillimage: `custom-${entry.id}.png`,
            energy: entry.id === 'gaara-of-the-desert-desert-funeral' ? ['Bloodline', 'Bloodline'] : entry.energy,
            cooldown: entry.id === 'gaara-of-the-desert-sand-sphere' ? 9 : entry.cooldown })),
    };
    const migrated = applyBalanceUpdate05(stored, seed);
    const funeral = migrated.skills.find((entry) => entry.id === 'gaara-of-the-desert-desert-funeral');
    assert.deepEqual(funeral.energy, ['Bloodline', 'Random']);
    assert.equal(funeral.skillimage, 'custom-gaara-of-the-desert-desert-funeral.png');
    const sphere = migrated.skills.find((entry) => entry.id === 'gaara-of-the-desert-sand-sphere');
    assert.equal(sphere.cooldown, 9, 'skills outside the update keep stored edits');
});
