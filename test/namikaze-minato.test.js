const assert = require('node:assert/strict');
const test = require('node:test');
const characters = require('../data/characters');
const battle = require('../battleLogic');
const { ACTIVE_ROSTER_IDS } = require('../data/activeRoster');
const { CANONICAL_ROSTER_ORDER } = require('../data/rosterOrder');
const { getMissionCharacterTags } = require('../data/missionCharacterTags');
const { buildMatchPayloadForUser, getDefaultMissionCatalog, getMissionTagGoalIncrement } = require('../server');

const FTG = 'namikaze-minato-flying-thunder-god';
const MARK = 'namikaze_minato_flying_thunder_god_mark';
const indexOf = (id) => characters.findIndex((character) => character.id === id);
const character = (id) => characters[indexOf(id)];
const pool = () => ({ taijutsu: 10, ninjutsu: 10, bloodline: 10, genjutsu: 10 });
const status = (unit, id) => unit.state.statuses.find((entry) => entry.id === id && entry.remainingTurns > 0);
const isInvulnerable = (unit) => unit.state.statuses.some((entry) =>
    entry.remainingTurns > 0 && entry.metadata?.invulnerable);
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
const skillIndexOf = (match, username, actorSlot, skillId) => {
    const index = characters[match.board[username][actorSlot].rosterIndex].skills
        .findIndex((skill) => skill.id === skillId);
    assert.ok(index >= 0, `unknown skill ${skillId}`);
    return index;
};
const cast = (match, username, actorSlot, skillId, targetUsername = null, targetSlot = 0) => {
    match.pendingTurns[username] = {
        queueOrder: [actorSlot],
        queuedByActorSlot: { [actorSlot]: {
            skillIndex: skillIndexOf(match, username, actorSlot, skillId),
            targetSelection: targetUsername ? [{ username: targetUsername, slot: targetSlot }] : [],
        } },
    };
    battle.resolvePendingTurnSkills({ match, actingUsername: username, characters });
};
const endTurn = (match, username) => battle.tickStatusesForTurnEnd({ match, endingUsername: username });
const endRound = (match) => { endTurn(match, 'p1'); endTurn(match, 'p2'); };
const targets = (match, username, actorSlot, skillId) => battle.computeTargetOptions({
    characters, match, actingUsername: username, actorSlot,
    skillIndex: skillIndexOf(match, username, actorSlot, skillId),
}).targets.map((target) => `${target.username}:${target.slot}`);
const ftgCost = (match) => battle.computeEffectiveEnergyCost({
    skill: character('namikaze-minato').skills[0], actorState: match.board.p1[0].state,
});
const visibleTo = (match, viewer, unitUsername, slot, statusId) =>
    buildMatchPayloadForUser(match, viewer).board[unitUsername][slot].state.statuses
        .some((entry) => entry.id === statusId);

test('Namikaze Minato matches the draft and is unlocked by The Yellow Flash', () => {
    const minato = character('namikaze-minato');
    assert.equal(minato.passive.name, 'Flying Thunder God Mark');
    assert.deepEqual(minato.skills.map((skill) =>
        [skill.name, skill.energy, skill.cooldown, skill.target, skill.classes]), [
        ['Flying Thunder God', ['Genjutsu'], 0, 'single-character', ['Physical', 'Instant']],
        ['Chakra Surveillance', ['Ninjutsu'], 2, 'all-enemy', ['Strategic', 'Instant']],
        ['Custom Kunai', ['Taijutsu'], 2, 'single-ally', ['Strategic', 'Instant']],
        ['Reroute', ['Random'], 4, 'self', ['Strategic', 'Instant']],
    ]);
    assert.ok(ACTIVE_ROSTER_IDS.includes('namikaze-minato'));
    assert.equal(CANONICAL_ROSTER_ORDER.indexOf('namikaze-minato'), 101, 'appended without shifting indices');
    assert.equal(minato.requiredMissionId, 'the-yellow-flash');

    const mission = getDefaultMissionCatalog().find((entry) => entry.missionId === 'the-yellow-flash');
    assert.equal(mission.title, 'The Yellow Flash');
    assert.equal(mission.level_requirement, 26);
    assert.equal(mission.reward_character, 'namikaze-minato');
    assert.deepEqual(mission.goals.map((goal) =>
        [goal.type, goal.character_id || goal.character_tag, goal.wins]), [
        ['win_matches', 'nohara-rin', 5],
        ['win_matches', 'uchiha-obito', 5],
        ['win_matches', 'young-kakashi', 5],
        ['win_matches_tag', 'konoha-ninja-outside-team-minato', 20],
    ]);
});

test('"any other Konoha ninja" excludes Rin, Obito and Young Kakashi', () => {
    const tagged = (id) => getMissionCharacterTags(character(id)).has('konoha-ninja-outside-team-minato');
    assert.deepEqual(['nohara-rin', 'uchiha-obito', 'young-kakashi'].map(tagged), [false, false, false]);
    assert.deepEqual(['uzumaki-naruto', 'hatake-kakashi', 'umino-iruka', 'namikaze-minato'].map(tagged),
        [true, true, true, true]);
    assert.equal(tagged('gaara-of-the-desert'), false);

    const roster = new Map(ACTIVE_ROSTER_IDS.map((id, index) => [id, index]));
    const team = (...ids) => ids.map((id) => roster.get(id));
    const goal = { type: 'win_matches_tag', character_tag: 'konoha-ninja-outside-team-minato' };
    const match = { players: [
        { username: 'winner', team: team('nohara-rin', 'uchiha-obito', 'young-kakashi') },
        { username: 'loser', team: team('gaara-of-the-desert', 'kankuro', 'temari') },
    ] };
    assert.equal(getMissionTagGoalIncrement(match, 'winner', goal), 0, 'Team Minato alone does not count');
    match.players[0].team = team('nohara-rin', 'uzumaki-naruto', 'hatake-kakashi');
    assert.equal(getMissionTagGoalIncrement(match, 'winner', goal), 1, 'one win per battle');
});

test('Flying Thunder God on an enemy ignores invulnerability, protects Minato, marks the target, and costs more next turn', () => {
    const match = matchFor(['namikaze-minato'], ['haruno-sakura', 'uchiha-sasuke']);
    const [minato] = match.board.p1;
    const [sakura] = match.board.p2;
    battle.applyStatus({ targetState: sakura.state, statusId: 'test_invulnerable', duration: 9,
        sourceUsername: 'p2', sourceSlot: 0, metadata: { helpful: true, invulnerable: true, tooltipText: 'x' } });
    assert.deepEqual(targets(match, 'p1', 0, FTG), ['p2:0', 'p2:1'], 'Minato cannot target himself');
    assert.equal(ftgCost(match).requiredRandom, 0);

    cast(match, 'p1', 0, FTG, 'p2', 0);
    assert.equal(sakura.hp, 80);
    assert.ok(isInvulnerable(minato));
    assert.ok(status(sakura, MARK));
    endTurn(match, 'p1');
    assert.equal(ftgCost(match).requiredRandom, 1, 'costs 1 additional chakra on the next turn');
    assert.deepEqual(ftgCost(match).reservedSpecific.genjutsu, 1);
    endTurn(match, 'p2');
    assert.ok(status(sakura, MARK), 'the mark lasts into Minato\'s next turn');
    endTurn(match, 'p1');
    assert.equal(ftgCost(match).requiredRandom, 0);
    assert.equal(status(sakura, MARK), undefined);
});

test('Flying Thunder God on an ally makes them invulnerable without hurting them', () => {
    const match = matchFor(['namikaze-minato', 'haruno-sakura'], ['uchiha-sasuke']);
    const [minato, ally] = match.board.p1;
    cast(match, 'p1', 0, FTG, 'p1', 1);
    assert.equal(ally.hp, 100);
    assert.ok(isInvulnerable(ally));
    assert.ok(isInvulnerable(minato));
    assert.ok(status(ally, MARK));
    assert.equal(status(ally, MARK).metadata.helpful, true);
});

test('Flying Thunder God also targets every character Minato has marked', () => {
    const match = matchFor(['namikaze-minato', 'haruno-sakura'], ['uchiha-sasuke', 'inuzuka-kiba', 'tenten']);
    const [, ally] = match.board.p1;
    const [sasuke, kiba, tenten] = match.board.p2;
    cast(match, 'p1', 0, FTG, 'p2', 1);
    assert.equal(kiba.hp, 80);
    endRound(match);
    assert.equal(isInvulnerable(ally), false);

    cast(match, 'p1', 0, FTG, 'p1', 1);
    assert.equal(kiba.hp, 60, 'the marked enemy is hit even though an ally was chosen');
    assert.ok(isInvulnerable(ally));
    assert.deepEqual([sasuke.hp, tenten.hp], [100, 100], 'unmarked enemies are not targeted');
    endRound(match);

    // Clear the earlier protection so the check below can only pass if the marked ally is targeted.
    ally.state.statuses = ally.state.statuses.filter((entry) =>
        entry.id !== 'namikaze_minato_flying_thunder_god_guard');
    assert.equal(isInvulnerable(ally), false);
    cast(match, 'p1', 0, FTG, 'p2', 0);
    assert.equal(sasuke.hp, 80);
    assert.equal(kiba.hp, 60, "Kiba's mark ended after Minato's turn");
    assert.ok(isInvulnerable(ally), 'the marked ally is also targeted and becomes invulnerable');
});

test('Chakra Surveillance gives Minato 1 random chakra', () => {
    const match = matchFor(['namikaze-minato'], ['uzumaki-naruto']);
    const total = () => Object.values(match.chakraPools.p1).reduce((sum, value) => sum + (Number(value) || 0), 0);
    const before = total();
    cast(match, 'p1', 0, 'namikaze-minato-chakra-surveillance');
    assert.equal(total(), before + 1);
});

test('Chakra Surveillance invisibly marks enemies who use a skill', () => {
    const match = matchFor(['namikaze-minato'], ['uzumaki-naruto', 'nara-shikamaru']);
    const [naruto, shikamaru] = match.board.p2;
    cast(match, 'p1', 0, 'namikaze-minato-chakra-surveillance');
    assert.equal(visibleTo(match, 'p2', 'p2', 0, 'namikaze_minato_chakra_surveillance'), false);
    assert.equal(visibleTo(match, 'p1', 'p2', 0, 'namikaze_minato_chakra_surveillance'), true);
    endTurn(match, 'p1');
    cast(match, 'p2', 1, 'nara-shikamaru-meditate', 'p1', 0);
    assert.ok(status(shikamaru, MARK));
    assert.equal(status(naruto, MARK), undefined, 'an enemy who used no skill is not marked');
    endTurn(match, 'p2');

    cast(match, 'p1', 0, FTG, 'p2', 0);
    assert.deepEqual([naruto.hp, shikamaru.hp], [80, 80]);
});

test('Custom Kunai marks enemies who use harmful skills on its holder and ends when Minato dies', () => {
    const match = matchFor(['namikaze-minato', 'haruno-sakura'], ['uzumaki-naruto', 'nara-shikamaru']);
    const [minato, ally] = match.board.p1;
    const [naruto, shikamaru] = match.board.p2;
    assert.deepEqual(targets(match, 'p1', 0, 'namikaze-minato-custom-kunai'), ['p1:1']);
    cast(match, 'p1', 0, 'namikaze-minato-custom-kunai', 'p1', 1);
    assert.equal(status(ally, 'namikaze_minato_custom_kunai').remainingTurns, 99);
    minato.state.cooldowns = {};
    assert.deepEqual(targets(match, 'p1', 0, 'namikaze-minato-custom-kunai'), [],
        'cannot be used on an already affected ally');
    endTurn(match, 'p1');

    cast(match, 'p2', 0, 'uzumaki-naruto-demon-wind-shuriken-feint', 'p1', 1);
    cast(match, 'p2', 1, 'nara-shikamaru-meditate', 'p1', 0);
    assert.ok(status(naruto, MARK));
    assert.equal(status(naruto, MARK).sourceUsername, 'p1');
    assert.equal(status(shikamaru, MARK), undefined, 'a skill used on another character does not trigger it');
    endRound(match);
    endRound(match);

    battle.applyDamageToUnit(minato, 200, { match, sourceUsername: 'p2', sourceSlot: 0,
        targetUsername: 'p1', targetSlot: 0 });
    assert.equal(status(ally, 'namikaze_minato_custom_kunai'), undefined);
    cast(match, 'p2', 0, 'uzumaki-naruto-shadow-clone-assault', 'p1', 1);
    assert.equal(status(naruto, MARK), undefined);
});

test('Reroute makes Minato invulnerable for 1 turn', () => {
    const match = matchFor(['namikaze-minato'], ['uzumaki-naruto']);
    cast(match, 'p1', 0, 'namikaze-minato-reroute');
    assert.ok(isInvulnerable(match.board.p1[0]));
    assert.deepEqual(targets(match, 'p2', 0, 'uzumaki-naruto-demon-wind-shuriken-feint'), []);
});
