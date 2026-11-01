const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const characters = require('../data/characters');
const battle = require('../battleLogic');

const indexOf = (id) => characters.findIndex((character) => character.id === id);
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
const cast = (match, username, actorSlot, skillIndex, targetUsername = null, targetSlot = 0) => {
    match.pendingTurns[username] = {
        queueOrder: [actorSlot],
        queuedByActorSlot: { [actorSlot]: {
            skillIndex,
            targetSelection: targetUsername ? [{ username: targetUsername, slot: targetSlot }] : [],
        } },
    };
    battle.resolvePendingTurnSkills({ match, actingUsername: username, characters });
};
const hit = (match, amount) => battle.applyDamageToUnit(match.board.p1[0], amount, {
    match, sourceUsername: 'p2', sourceSlot: 0, targetUsername: 'p1', targetSlot: 0,
});
const tooltipFor = (match, statusId) => {
    const { buildMatchPayloadForUser } = require('../server.js');
    return buildMatchPayloadForUser(match, 'p1').board.p1[0].state.statuses
        .find((status) => status.id === statusId)?.metadata?.tooltipText;
};

for (const [characterId, skillIndex, statusId, starting, phrase] of [
    ['oboro', 2, 'oboro_haze_clones', 30, 'Oboro has {n} destructible defense.'],
    ['baki', 2, 'baki_flak_jacket', 50, 'Baki has {n} destructible defense.'],
    ['demon-brothers', null, 'demon_brothers_water_melding_defense', 15,
        'Demon Brothers have {n} destructible defense'],
    ['haruno-sakura', null, 'haruno_sakura_guard_duty_defense', 25, 'This character has {n} destructible defense.'],
]) {
    test(`${characterId} destructible defense tooltip tracks the remaining points`, () => {
        const match = matchFor([characterId], ['tenten']);
        if (skillIndex === null) {
            const character = characters[indexOf(characterId)];
            const effect = character.skills.flatMap((skill) => skill.effects || [])
                .find((entry) => entry.statusId === statusId);
            battle.applyStatus({ targetState: match.board.p1[0].state, statusId, duration: 2,
                sourceUsername: 'p1', sourceSlot: 0, metadata: effect.metadata });
        } else {
            cast(match, 'p1', 0, skillIndex);
        }
        const status = match.board.p1[0].state.statuses.find((entry) => entry.id === statusId);
        assert.equal(status.metadata.destructibleDefensePoints, starting);
        const expected = (n) => phrase.replace('{n}', n);
        assert.ok(tooltipFor(match, statusId).includes(expected(starting)));

        hit(match, 10);
        const remaining = starting - 10;
        assert.equal(status.metadata.destructibleDefensePoints, remaining);
        assert.ok(tooltipFor(match, statusId).includes(expected(remaining)),
            `expected "${expected(remaining)}" in "${tooltipFor(match, statusId)}"`);

        hit(match, remaining);
        assert.equal(tooltipFor(match, statusId), undefined, 'a broken defense is removed with its tooltip');
    });
}

test("Konohamaru's Stubborn Rivalry defense tooltip tracks the remaining points", () => {
    const match = matchFor(['sarutobi-konohamaru'], ['tenten']);
    hit(match, 30);
    const status = match.board.p1[0].state.statuses.find((entry) =>
        Number(entry.metadata?.destructibleDefensePoints) > 0);
    assert.ok(status, 'taking 30 damage in a turn grants the rivalry defense');
    hit(match, 4);
    assert.equal(status.metadata.destructibleDefensePoints, 6);
    assert.equal(tooltipFor(match, status.id), 'Stubborn Rivalry: 6 destructible defense.');
});

test('the client rewrites destructible defense amounts with the same pattern as the server', () => {
    const client = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
    const pattern = '/\\b\\d+(\\s+(?:points? of\\s+)?(?:permanent\\s+)?destructible defense)/gi';
    assert.ok(client.includes(pattern), 'script.js should rewrite baked-in destructible defense numbers');
    const server = fs.readFileSync(path.join(__dirname, '..', 'battleLogic.js'), 'utf8');
    assert.ok(server.includes(pattern));
});
