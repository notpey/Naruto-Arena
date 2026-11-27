// Tower 2.0 event-engine augments (towerAugmentEffects.js) in real battles: skills are
// resolved by battleLogic exactly as in a live Tower match, and turn boundaries follow
// server.js's order (resolve, tick statuses, tick cooldowns, turn end, next turn start).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const characters = require('../data/characters');
const battleLogic = require('../battleLogic');
const towerScrolls = require('../services/tower/towerScrolls');
const effects = require('../services/tower/towerAugmentEffects');
const { AUGMENTS_BY_CODE } = require('../services/tower/towerAugments');
const { RECIPES_BY_ID } = require('../services/tower/towerFusions');
const { applyTowerSetupToBoard } = require('../server.js');

const index = (id) => characters.findIndex((character) => character.characterId === id);
const skillIndex = (characterId, skillId) => characters[index(characterId)].skills.findIndex((skill) => skill.id === `${characterId}-${skillId}`);
const key = (code) => (code.startsWith('F') ? RECIPES_BY_ID.get(code).resultId : AUGMENTS_BY_CODE.get(code).id);
const pool = () => ({ taijutsu: 20, ninjutsu: 20, bloodline: 20, genjutsu: 20 });
const ALLIES = ['momochi-zabuza', 'baki', 'haruno-sakura'];
const FOES = ['gato', 'zaku-abumi', 'tsurugi-misumi']; // no passives that redirect or execute

// A Tower match with the given augments, at the start of the player's first turn.
// dead: slots whose ninja died earlier in the run (they start the battle out of it).
const battle = ({ codes = [], allies = ALLIES, enemies = FOES, hp = [100, 100, 100], enemyHp = null, dead = [], matchId = 'm-test' } = {}) => {
    const players = [{ username: 'p', team: allies.map(index) }, { username: 'bot', team: enemies.map(index) }];
    const board = battleLogic.buildInitialBoard(players, characters);
    const scrolls = codes.map(key);
    const setup = {
        team: allies.map((characterId, slot) => ({ characterId, hp: hp[slot], maxHp: 100, scrolls: scrolls.slice(), dead: dead.includes(slot) })),
        encounter: { kind: 'battle', hpMultiplier: 1, affixes: [] },
    };
    applyTowerSetupToBoard({ board, username: 'p', botUsername: 'bot', setup });
    if (enemyHp) board.bot.forEach((unit, slot) => { unit.hp = enemyHp[slot]; });
    const match = {
        matchId, mode: 'tower', players, board, currentTurn: 'p', towerEncounter: {},
        chakraPools: { p: pool(), bot: pool() }, economy: { turnCounts: { p: 0, bot: 0 } }, pendingTurns: {},
    };
    Object.entries(board).forEach(([username, units]) => units.forEach((unit) => { unit.username = username; }));
    effects.initBattle(match, { username: 'p', botUsername: 'bot', setup, characters });
    return match;
};
const cast = (match, username, slot, characterId, skillId, target) => {
    const queued = { skillIndex: skillIndex(characterId, skillId), targetSelection: target ? [{ username: target[0], slot: target[1] }] : [] };
    assert.ok(queued.skillIndex >= 0, `${characterId}-${skillId} exists`);
    match.pendingTurns[username] = { queueOrder: [slot], queuedByActorSlot: { [slot]: queued } };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: username, characters });
};
// Several skills in one resolution (one per actor slot).
const castAll = (match, username, actions) => {
    match.pendingTurns[username] = {
        queueOrder: actions.map(([slot]) => slot),
        queuedByActorSlot: Object.fromEntries(actions.map(([slot, characterId, skillId, target]) => [slot, {
            skillIndex: skillIndex(characterId, skillId), targetSelection: target ? [{ username: target[0], slot: target[1] }] : [] }])),
    };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: username, characters });
};
// Ends `username`'s turn and starts the other side's, in server.js's order.
const endTurn = (match, username) => {
    battleLogic.tickStatusesForTurnEnd({ match, endingUsername: username });
    battleLogic.tickCooldownsForTurnEnd({ match, endingUsername: username });
    effects.onTurnEnd(match, username);
    match.economy.turnCounts[username] += 1;
    match.currentTurn = username === 'p' ? 'bot' : 'p';
    effects.onTurnStart(match, match.currentTurn);
};
const round = (match) => { endTurn(match, 'p'); endTurn(match, 'bot'); };
// Chakra on hand. (The server deducts a skill's cost when it is queued, so these direct
// resolutions never pay; deltas below are the augments' gains and losses alone.)
const chakra = (match) => Object.values(match.chakraPools.p).reduce((sum, amount) => sum + amount, 0);
const has = (unit, statusId) => unit.state.statuses.some((status) => status.id === statusId);
const lost = (unit, before = 100) => before - unit.hp;
const zabuza = (match, target = 0) => cast(match, 'p', 0, 'momochi-zabuza', 'kubikiribocho', ['bot', target]);
const enemyHits = (match, target = 0) => cast(match, 'bot', 0, 'gato', 'hired-help', ['p', target]);

test('the hooks stay out of ordinary matches', () => {
    const match = battle({ codes: ['A023', 'A055'] });
    match.mode = 'quick';
    zabuza(match);
    assert.equal(lost(match.board.bot[0]), 30, 'no echo, no augment effects outside mode tower');
});

test('damage augments: echoes, counters, bonuses and pierce', () => {
    let match = battle({ codes: ['A023'] });
    zabuza(match);
    assert.equal(lost(match.board.bot[0]), 45, 'A023: 30 + a 15 damage echo');
    zabuza(match);
    assert.equal(lost(match.board.bot[0]), 75, 'A023: only the first damaging skill repeats');

    match = battle({ codes: ['A024'] });
    zabuza(match); zabuza(match); zabuza(match);
    assert.equal(lost(match.board.bot[1]), 10, 'A024: the third damaging skill hits every enemy for 10');
    assert.equal(lost(match.board.bot[0]), 100);

    match = battle({ codes: ['A066'] });
    for (let i = 0; i < 3; i += 1) zabuza(match, 1);
    zabuza(match, 0);
    assert.equal(lost(match.board.bot[0]), 60, 'A066: the fourth damaging skill adds 30 piercing');

    match = battle({ codes: ['A027'] });
    cast(match, 'p', 1, 'baki', 'sudden-strike', ['bot', 0]);
    assert.equal(lost(match.board.bot[0]), 20);
    assert.equal(lost(match.board.bot[1]) + lost(match.board.bot[2]), 10, 'A027: 10 to a different enemy');

    match = battle({ codes: ['A029'], enemyHp: [40, 100, 100] });
    zabuza(match);
    assert.equal(match.board.bot[0].alive, false, 'A029: left at 10, then 10 piercing');

    match = battle({ codes: ['A049'], enemyHp: [35, 100, 100] });
    zabuza(match);
    assert.equal(match.board.bot[0].alive, false, 'A049: survived at 5, then 5 piercing');

    match = battle({ codes: ['A043'] });
    zabuza(match); zabuza(match);
    assert.equal(lost(match.board.bot[0]), 65, 'A043: the second hit carries +5 against that enemy');

    match = battle({ codes: ['A046'] });
    castAll(match, 'p', [[0, 'momochi-zabuza', 'kubikiribocho', ['bot', 0]], [1, 'baki', 'sudden-strike', ['bot', 0]]]);
    assert.equal(lost(match.board.bot[0]), 60, 'A046: the second ally\'s hit deals 10 more');

    const reduced = (codes) => {
        const m = battle({ codes });
        battleLogic.applyStatus({ targetState: m.board.bot[0].state, statusId: 'test_dr', duration: 9, metadata: { helpful: true, damageReductionFlat: 10 } });
        battleLogic.applyStatus({ targetState: m.board.bot[0].state, statusId: 'test_dd', duration: 9, metadata: { helpful: true, destructibleDefensePoints: 20 } });
        zabuza(m);
        return lost(m.board.bot[0]);
    };
    assert.equal(reduced([]), 0, 'baseline: 30 - 10 reduction, then 20 defense');
    assert.equal(reduced(['A048']), 10, 'A048: ignores 10 reduction');
    assert.equal(reduced(['A055']), 30, 'A055: ignores reduction and destructible defense');

    match = battle({ codes: ['A006'], allies: ['aburame-shino', 'baki', 'haruno-sakura'] });
    cast(match, 'p', 0, 'aburame-shino', 'infestation', ['bot', 0]);
    assert.equal(lost(match.board.bot[0]), 10, 'A006: a 5-damage effect deals 10');

    match = battle({ codes: ['A097'] });
    cast(match, 'p', 1, 'baki', 'sudden-strike', ['bot', 0]);
    cast(match, 'p', 1, 'baki', 'sudden-strike', ['bot', 1]);
    assert.equal(lost(match.board.bot[1]), 25, 'A097: the next Chakra skill deals 5 more');

    match = battle({ codes: ['A083'] });
    for (let i = 0; i < 3; i += 1) cast(match, 'p', 1, 'baki', 'sudden-strike', ['bot', 1]);
    assert.equal(lost(match.board.bot[1]), 70, 'A083: the third Chakra skill repeats 50%');

    match = battle({ codes: ['A076'] });
    zabuza(match);
    const total = [0, 1, 2].reduce((sum, slot) => sum + lost(match.board.bot[slot]), 0);
    assert.equal(total, 45, 'A076: the direct skill repeats 15 on a random enemy');

    match = battle({ codes: ['A084'] });
    zabuza(match);
    assert.ok(has(match.board.p[0], 'tower_aug_a084_dd'), 'A084: 25+ direct damage grants defense');

    match = battle({ codes: ['F01'] });
    cast(match, 'p', 1, 'baki', 'wind-blade', ['bot', 0]);
    assert.equal(lost(match.board.bot[0]), 50, 'F01: a 2-cost Chakra skill deals 10 more');

    match = battle({ codes: ['F05'], enemyHp: [45, 100, 100] });
    cast(match, 'p', 1, 'baki', 'sudden-strike', ['bot', 0]);
    assert.equal(lost(match.board.bot[0], 45), 35, 'F05: +15 against an enemy below 50');

    match = battle({ codes: ['F09'] });
    for (let i = 0; i < 3; i += 1) zabuza(match, 0);
    assert.equal(lost(match.board.bot[2]), 15, 'F09: every third direct skill blasts all enemies for 15');

    match = battle({ codes: ['F15'] });
    castAll(match, 'p', [[0, 'momochi-zabuza', 'kubikiribocho', ['bot', 0]], [1, 'baki', 'sudden-strike', ['bot', 0]]]);
    assert.equal(lost(match.board.bot[1]) + lost(match.board.bot[2]), 10, 'F15: the second hit echoes 50% elsewhere');
});

test('affliction augments (A018, A021, A033, A059, F07, A013, F04)', () => {
    const shino = ['aburame-shino', 'baki', 'haruno-sakura'];
    let match = battle({ codes: ['A018', 'A021', 'A033'], allies: shino });
    const before = chakra(match);
    cast(match, 'p', 0, 'aburame-shino', 'infestation', ['bot', 0]);
    assert.equal(lost(match.board.bot[0]), 10, 'A018: 5 + 5 affliction once per enemy per turn');
    assert.equal(chakra(match) - before, 1, 'A021: affliction damage gives 1 chakra');
    assert.ok(has(match.board.bot[0], 'tower_aug_a033'), 'A033: healing received cut');

    match = battle({ codes: ['F07'], allies: shino });
    cast(match, 'p', 0, 'aburame-shino', 'infestation', ['bot', 0]);
    assert.ok(has(match.board.bot[0], 'tower_aug_f07'));

    match = battle({ codes: ['A059'] });
    zabuza(match);
    assert.ok(has(match.board.bot[0], 'tower_aug_a059_burn'), 'A059: the first enemy damaged burns');
    zabuza(match, 1);
    assert.ok(!has(match.board.bot[1], 'tower_aug_a059_burn'), 'once per turn');

    match = battle({ codes: ['A013', 'F04'] });
    zabuza(match);
    assert.ok(has(match.board.bot[0], 'tower_aug_a013_poison'));
    assert.ok(has(match.board.bot[0], 'tower_aug_f04_poison'));
    endTurn(match, 'p');
    endTurn(match, 'bot');
    assert.ok(lost(match.board.bot[0]) > 30, 'the poison ticks');
});

test('chakra augments (A001, A053, A017, A081, A011, A079, A031, A037, A090, F13)', () => {
    const zabuzaSkill = characters[index('momochi-zabuza')].skills[0];
    const windBlade = characters[index('baki')].skills.find((skill) => skill.id === 'baki-wind-blade');
    let match = battle({ codes: ['A001'] });
    assert.equal(battleLogic.computeEffectiveEnergyCost({ skill: zabuzaSkill, actorState: match.board.p[0].state }).requiredRandom, 0);
    zabuza(match);
    assert.equal(battleLogic.computeEffectiveEnergyCost({ skill: zabuzaSkill, actorState: match.board.p[0].state }).requiredRandom, 1, 'A001: once per battle');

    match = battle({ codes: ['A053'] });
    const blade = battleLogic.computeEffectiveEnergyCost({ skill: windBlade, actorState: match.board.p[1].state });
    assert.equal(blade.requiredRandom + Object.values(blade.reservedSpecific).reduce((s, v) => s + v, 0), 1, 'A053: one required chakra off, minimum 1');

    match = battle({ codes: ['A017'] });
    const mental = { id: 'test-mental', classes: ['Mental'], energy: ['Genjutsu', 'Random'], effects: [] };
    assert.equal(battleLogic.computeEffectiveEnergyCost({ skill: mental, actorState: match.board.p[0].state }).requiredRandom, 0, 'A017: a Mental skill random cost drops on first use');

    match = battle({ codes: ['A081'] });
    assert.ok(match.board.p.every((unit) => has(unit, 'tower_aug_a081')), 'A081: a seeded type each turn');
    assert.ok(['taijutsu', 'ninjutsu', 'genjutsu', 'bloodline'].includes(match.towerEncounter.augments.choices.A081));

    match = battle({ codes: ['A011', 'A079'], allies: ['temari', 'baki', 'haruno-sakura'] });
    let start = chakra(match);
    castAll(match, 'p', [[0, 'temari', 'summoning-quick-beheading-dance', ['bot', 0]], [1, 'baki', 'wind-blade', ['bot', 0]]]);
    assert.equal(chakra(match) - start, 1 + 2, '5 spent in one turn: A011 +1, A079 +2');

    match = battle({ codes: ['A031'], allies: ['baki', 'baki', 'haruno-sakura'] });
    start = chakra(match);
    castAll(match, 'p', [[0, 'baki', 'wind-blade', ['bot', 0]], [1, 'baki', 'sudden-strike', ['bot', 1]]]);
    assert.equal(chakra(match) - start, 1, 'A031: two Genjutsu spent, 1 of another type back');

    const danceTotal = (codes) => {
        const m = battle({ codes, allies: ['temari', 'baki', 'haruno-sakura'] });
        cast(m, 'p', 0, 'temari', 'summoning-quick-beheading-dance', ['bot', 0]);
        return [0, 1, 2].reduce((sum, slot) => sum + lost(m.board.bot[slot]), 0);
    };
    assert.equal(danceTotal(['A037']) - danceTotal([]), 10, 'A037: a 3-cost skill adds 10 piercing to a random enemy');

    match = battle({ codes: ['A090'], allies: ['momochi-zabuza', 'baki', 'yamanaka-ino-s'] });
    start = chakra(match);
    castAll(match, 'p', [[0, 'momochi-zabuza', 'kubikiribocho', ['bot', 0]], [1, 'baki', 'sudden-strike', ['bot', 0]],
        [2, 'yamanaka-ino-s', 'proxy-surveillance', ['bot', 0]]]);
    assert.equal(chakra(match) - start, 2, 'A090: Physical, Chakra and Mental in one turn refund 2');

    match = battle({ codes: ['F13'] });
    castAll(match, 'p', [[0, 'momochi-zabuza', 'kubikiribocho', ['bot', 0]], [1, 'baki', 'sudden-strike', ['bot', 1]]]);
    assert.equal(lost(match.board.bot[2]) + lost(match.board.bot[0]) + lost(match.board.bot[1]), 60, 'F13: 3 spent, 10 piercing to a random enemy');
});

test('stun augments (A009, A025, F11, A040, A045, A092, F16, A057)', () => {
    // Speedy Flanker stuns only while Young Minato is at 40 health or less.
    const minatoFoe = ['young-minato', 'zaku-abumi', 'gato'];
    const weakMinato = [40, 100, 100];
    const stunned = (unit) => unit.state.statuses.some((status) => status.metadata?.cannotUseSkills);
    let match = battle({ codes: ['A025'], enemies: minatoFoe, enemyHp: weakMinato });
    match.currentTurn = 'bot';
    cast(match, 'bot', 0, 'young-minato', 'speedy-flanker', ['p', 0]);
    assert.equal(stunned(match.board.p[0]), false, 'A025: the first stun is prevented');
    assert.ok(has(match.board.p[0], 'tower_aug_a025'));

    match = battle({ codes: ['F11'], enemies: minatoFoe, enemyHp: weakMinato });
    match.currentTurn = 'bot';
    cast(match, 'bot', 0, 'young-minato', 'speedy-flanker', ['p', 0]);
    assert.equal(stunned(match.board.p[0]), false, 'F11: the first full stun is ignored');

    match = battle({ codes: ['A009'], enemies: minatoFoe, enemyHp: weakMinato });
    match.currentTurn = 'bot';
    cast(match, 'bot', 0, 'young-minato', 'speedy-flanker', ['p', 0]);
    assert.equal(stunned(match.board.p[0]), false, 'A009: a 1-turn stun loses its turn');

    const stunDuration = (codes) => {
        const m = battle({ codes, allies: ['young-minato', 'baki', 'haruno-sakura'], hp: [40, 100, 100] });
        cast(m, 'p', 0, 'young-minato', 'speedy-flanker', ['bot', 0]);
        return m.board.bot[0].state.statuses.find((status) => status.metadata?.cannotUseSkills)?.remainingTurns || 0;
    };
    assert.equal(stunDuration([]), 1);
    assert.equal(stunDuration(['A040']), 2, 'A040: the first stun lasts 1 turn longer');

    match = battle({ codes: ['A045'], allies: ['young-minato', 'baki', 'haruno-sakura'], hp: [40, 100, 100] });
    cast(match, 'p', 0, 'young-minato', 'speedy-flanker', ['bot', 0]);
    assert.ok(has(match.board.bot[0], 'tower_aug_a045'), 'A045: the stunned enemy\'s skills cost more');

    match = battle({ codes: ['F16'], allies: ['young-minato', 'baki', 'haruno-sakura'], hp: [40, 100, 100] });
    cast(match, 'p', 0, 'young-minato', 'speedy-flanker', ['bot', 0]);
    assert.ok(has(match.board.bot[0], 'tower_aug_f16_burn'), 'F16: the first enemy stunned burns');

    match = battle({ codes: ['A092'] });
    cast(match, 'p', 0, 'momochi-zabuza', 'water-prison-technique', ['bot', 0]);
    const prison = match.board.bot[0].state.statuses.find((status) => status.metadata?.cannotUseSkillClasses);
    assert.equal(prison.remainingTurns, 3, 'A092: a 2-turn harmful effect lasts 3');

    match = battle({ codes: ['A057'] });
    for (let turn = 1; turn < 4; turn += 1) round(match);
    assert.ok(match.board.bot.every((unit) => stunned(unit)), 'A057: every enemy is stunned on turn 4');
});

test('defense and healing augments (A007, F06, A030, F10, A032, A044, A047, A039, A067, A093, A078, A094, A022)', () => {
    let match = battle({ codes: ['A007', 'F06'] });
    cast(match, 'p', 0, 'momochi-zabuza', 'hidden-mist-technique');
    assert.ok(has(match.board.p[0], 'tower_aug_a007') && has(match.board.p[0], 'tower_aug_f06'));

    match = battle({ codes: ['A030'], hp: [40, 100, 100] });
    match.currentTurn = 'bot';
    enemyHits(match, 0);
    assert.equal(match.board.p[0].hp, 40, 'A030: 40 - 20 = 20, below 25, heals 20');

    match = battle({ codes: ['F10'], hp: [40, 100, 100] });
    match.currentTurn = 'bot';
    enemyHits(match, 0);
    assert.equal(match.board.p[0].hp, 45, 'F10: heals 25');

    match = battle({ codes: ['A032', 'A002'] });
    assert.ok(has(match.board.p[0], 'tower_aug_a032'), 'A032: starting defense brings damage reduction');

    match = battle({ codes: ['A044', 'A002'] });
    match.currentTurn = 'bot';
    enemyHits(match, 0);
    assert.ok(has(match.board.p[0], 'tower_aug_a044'), 'A044: defense broken, 15 reduction');

    match = battle({ codes: ['A047'], hp: [50, 50, 50] });
    match.currentTurn = 'bot';
    enemyHits(match, 0);
    match.currentTurn = 'p';
    endTurn(match, 'p');
    assert.deepEqual(match.board.p.map((unit) => unit.hp), [30, 55, 55], 'A047: only the undamaged heal 5');

    match = battle({ codes: ['A039', 'A067'], hp: [50, 60, 100] });
    cast(match, 'p', 2, 'haruno-sakura', 'rudimentary-healing', ['p', 0]);
    assert.equal(match.board.p[0].hp, 70);
    assert.equal(match.board.p[1].hp, 70, 'A067: other allies heal half (10)');
    assert.ok(has(match.board.p[0], 'tower_aug_a039_dd') && has(match.board.p[2], 'tower_aug_a039_dd'), 'A039: both gain defense');

    match = battle({ codes: ['A093'] });
    cast(match, 'p', 2, 'haruno-sakura', 'rudimentary-healing', ['p', 0]);
    assert.equal(match.board.p[0].state.statuses.find((status) => status.id === 'tower_aug_a093_dd')?.metadata.destructibleDefensePoints, 20,
        'A093: overhealing becomes defense');

    match = battle({ codes: ['A078'] });
    cast(match, 'p', 0, 'momochi-zabuza', 'hidden-mist-technique');
    const mist = match.board.p[0].state.statuses.find((status) => status.metadata?.damageReductionFlat === 5 && !status.metadata?.towerScroll);
    assert.equal(mist.remainingTurns, 3, 'A078: a 2-turn defense boost lasts 3');

    match = battle({ codes: ['A094'], enemies: ['momochi-zabuza', 'haku', 'gato'] });
    match.currentTurn = 'bot';
    cast(match, 'bot', 0, 'momochi-zabuza', 'kubikiribocho', ['p', 0]);
    assert.deepEqual(match.board.p.map((unit) => 100 - unit.hp), [21, 4, 4], 'A094: 9 of 30 moved and split');

    match = battle({ codes: ['A022'], hp: [50, 100, 100] });
    zabuza(match);
    assert.equal(match.board.p[0].hp, 56, 'A022: heals 20% of 30');
});

test('growth augments (A028, F08, F19, A082, A050, F12, A091, F20)', () => {
    let match = battle({ codes: ['A028'] });
    zabuza(match); round(match);
    zabuza(match); round(match);
    const before = match.board.bot[0].hp;
    zabuza(match);
    assert.equal(before - match.board.bot[0].hp, 35, 'A028: the second consecutive turn earns +5 for the next hit');

    match = battle({ codes: ['A082'] });
    zabuza(match);
    const afterFirst = match.board.bot[0].hp;
    zabuza(match);
    assert.equal(afterFirst - match.board.bot[0].hp, 35, 'A082: +5 per damaging skill');
    endTurn(match, 'p');
    assert.equal(match.board.p[0].hp, 95, 'A082: 5 affliction at turn end while stacked');

    match = battle({ codes: ['F19'], hp: [80, 100, 100] });
    zabuza(match);
    assert.equal(match.board.p[0].hp, 87, 'F19: heals 25% of 30');
    endTurn(match, 'p');
    assert.equal(match.board.p[0].hp, 77, 'F19: loses 10 at turn end');

    match = battle({ codes: ['A050', 'A091'] });
    zabuza(match); round(match);
    zabuza(match); round(match);
    const third = match.board.bot[0].hp;
    zabuza(match);
    assert.equal(third - match.board.bot[0].hp, 33, 'A050: third consecutive turn takes +10%');
    endTurn(match, 'p');
    assert.equal(match.board.bot[0].alive, false, 'A091: three consecutive turns, then 30 piercing (7 left)');

    match = battle({ codes: ['F20'] });
    castAll(match, 'p', [[0, 'momochi-zabuza', 'kubikiribocho', ['bot', 0]], [1, 'baki', 'sudden-strike', ['bot', 1]]]);
    assert.ok(match.board.p.every((unit) => has(unit, 'tower_aug_f20')), 'F20: two direct skills, a team boon');
});

test('death augments (A019, A058, A061, A080, A062, A051, A071, A054, A087, A098, A041, A074, A070)', () => {
    const killSlot0 = (codes, extra = {}) => {
        const m = battle({ codes, hp: [10, 100, 100], ...extra });
        m.currentTurn = 'bot';
        enemyHits(m, 0);
        return m;
    };
    let match = killSlot0(['A019', 'A058', 'A061', 'A080', 'A062']);
    assert.equal(match.board.p[0].alive, false);
    assert.ok(has(match.board.p[1], 'tower_aug_a019_dd'), 'A019');
    assert.ok(has(match.board.p[1], 'tower_aug_a061_dr'), 'A061');
    assert.equal(lost(match.board.bot[1]), 25, 'A080: 25 to every enemy');
    assert.equal(lost(match.board.bot[0]), 65, 'A080 25 + A062 40 on the killer');

    match = killSlot0(['A051']);
    assert.equal(match.board.p[0].alive, false);
    endTurn(match, 'bot');
    assert.equal(match.board.p[0].alive, true, 'A051: back at the start of your turn');
    assert.equal(match.board.p[0].hp, 30);

    match = killSlot0(['A071']);
    endTurn(match, 'bot');
    assert.equal(match.board.p[0].hp, 50);
    assert.equal(match.board.p[0].hpCap, 90, 'A071: 10 less maximum health');

    match = killSlot0(['A087']);
    assert.equal(match.board.p[0].hp, 25);
    assert.ok(has(match.board.p[0], 'tower_aug_a087'), 'A087: removed from combat for a turn');

    match = killSlot0(['A098']);
    assert.equal(match.board.p[0].hp, 1, 'A098: held at 1 health');
    endTurn(match, 'bot');
    endTurn(match, 'p');
    assert.equal(match.board.p[0].alive, false, 'A098: dies at the end of your next turn unless healed');

    match = battle({ codes: ['A054'], hp: [10, 100, 100], dead: [1, 2] });
    match.currentTurn = 'bot';
    enemyHits(match, 0);
    assert.equal(match.board.p[0].hp, 50, 'A054: the last ninja is restored to 50');

    match = battle({ codes: ['A041', 'A074'], enemyHp: [20, 100, 100] });
    cast(match, 'p', 1, 'baki', 'wind-blade', ['bot', 1]);
    const cooldownBefore = match.board.p[0].state.cooldowns || {};
    const start = chakra(match);
    zabuza(match, 0);
    assert.equal(chakra(match) - start, 2, 'A074: +2 chakra on a kill');
    assert.ok(has(match.board.p[0], 'tower_aug_a074'));
    assert.ok(cooldownBefore);

    match = battle({ codes: ['A070'], hp: [60, 100, 100], dead: [1, 2] });
    assert.equal(match.board.p[0].hp, 70, 'A070: heals 10 at the start of your turn while alone');
    assert.ok(has(match.board.p[0], 'tower_aug_a070'), 'A070: 20 damage reduction while alone');
    zabuza(match);
    assert.equal(lost(match.board.bot[0]), 45, 'A070: +50% direct damage while alone');

    match = battle({ codes: ['A070'] });
    match.currentTurn = 'bot';
    assert.ok(!has(match.board.p[0], 'tower_aug_a070'), 'not while allies live');
});

test('turn-start augments (A063, A064, A085, A089, A072, F17, F18)', () => {
    let match = battle({ codes: ['A064'], hp: [20, 50, 100] });
    assert.deepEqual(match.board.p.map((unit) => unit.hp), [40, 60, 100], 'A064: 20 below 30 health, 10 otherwise');

    match = battle({ codes: ['A063'], hp: [50, 50, 50] });
    round(match);
    const start = chakra(match);
    round(match);
    assert.equal(chakra(match) - start, 2, 'A063: turn 3 gives 2 chakra');
    assert.deepEqual(match.board.p.map((unit) => unit.hp), [60, 60, 60]);

    match = battle({ codes: ['A085'] });
    const gainedChakra = chakra(match) === 82;
    const tookDamage = match.board.p.filter((unit) => unit.hp === 85).length === 1;
    assert.ok(gainedChakra !== tookDamage, 'A085: exactly one of 2 chakra or 15 piercing to one ninja');

    match = battle({ codes: ['A072'] });
    assert.ok(['damage', 'reduction', 'healing'].includes(match.towerEncounter.augments.choices.A072));
    assert.ok(match.board.p.every((unit) => has(unit, 'tower_aug_a072')));

    match = battle({ codes: ['F17'] });
    assert.equal(chakra(match), 82, 'F17: +2 at turn start');
    endTurn(match, 'p');
    assert.equal(chakra(match), 81, 'F17: -1 at turn end');
    assert.deepEqual(match.board.p.map((unit) => unit.hp), [95, 95, 95]);

    match = battle({ codes: ['F18'], hp: [60, 100, 100], dead: [1, 2] });
    assert.ok(match.board.p[0].hp === 80 || has(match.board.p[0], 'tower_aug_f18'), 'F18: a boon while alone');
    match = battle({ codes: ['F18'], hp: [60, 100, 100] });
    assert.ok(match.board.p[0].hp === 60 && !has(match.board.p[0], 'tower_aug_f18'), 'F18: nothing while allies live');

    match = battle({ codes: ['A089'] });
    round(match); round(match);
    assert.ok(match.board.p.every((unit) => has(unit, 'tower_aug_a089') || has(unit, 'tower_aug_a089_dd')), 'A089: turn 3 boon');
});

test('counter augments (A065, A060, A035, A088, F11 counters)', () => {
    let match = battle({ codes: ['A065', 'A088'], enemies: ['momochi-zabuza', 'haku', 'gato'] });
    match.currentTurn = 'bot';
    cast(match, 'bot', 0, 'momochi-zabuza', 'kubikiribocho', ['p', 1]);
    assert.equal(match.board.p[1].hp, 100, 'A065: the first harmful skill is countered');
    assert.ok(match.board.bot[0].state.statuses.some((status) => status.metadata?.cannotUseSkills), 'A065: its user is stunned');
    assert.equal(lost(match.board.bot[0]), 15, 'A088: half its 30 damage reflected');
    assert.ok(match.board.p.every((unit) => !has(unit, 'tower_aug_a065_counter')), 'A065 is spent for the whole team');
    cast(match, 'bot', 1, 'haku', 'flying-needles-of-death', ['p', 1]);
    assert.equal(match.board.p[1].hp, 70, 'only once per battle');

    match = battle({ codes: ['A060', 'A035'], enemies: ['momochi-zabuza', 'haku', 'gato'] });
    cast(match, 'p', 0, 'momochi-zabuza', 'water-prison-technique', ['bot', 2]);
    const cooldown = match.board.p[0].state.cooldowns['momochi-zabuza-water-prison-technique'];
    match.currentTurn = 'bot';
    cast(match, 'bot', 0, 'momochi-zabuza', 'kubikiribocho', ['p', 0]);
    assert.equal(match.board.p[0].hp, 100, 'A060: countered');
    assert.equal(match.board.p[0].state.cooldowns['momochi-zabuza-water-prison-technique'], cooldown - 1, 'A035: a cooldown recovers');
    assert.ok(!has(match.board.p[0], 'tower_aug_a060_counter'));
    for (let i = 0; i < 3; i += 1) { endTurn(match, 'bot'); endTurn(match, 'p'); }
    endTurn(match, 'bot');
    assert.ok(has(match.board.p[0], 'tower_aug_a060_counter'), 'A060: re-armed 3 turns later');
});

test('enemy-spend augments (A069, A095) and cooldowns (A026)', () => {
    let match = battle({ codes: ['A069', 'A095'], enemies: ['momochi-zabuza', 'haku', 'gato'] });
    match.currentTurn = 'bot';
    const start = chakra(match);
    cast(match, 'bot', 0, 'momochi-zabuza', 'kubikiribocho', ['p', 0]);
    assert.equal(chakra(match) - start, 1, 'A069: an enemy 2-cost skill gives 1 chakra');
    assert.equal(lost(match.board.bot[0]), 10, 'A095: 5 affliction per chakra spent');

    match = battle({ codes: ['A026'] });
    cast(match, 'p', 0, 'momochi-zabuza', 'water-prison-technique', ['bot', 0]);
    assert.equal(match.board.p[0].state.cooldowns['momochi-zabuza-water-prison-technique'], 3, 'A026: 3 + 1 tick, minus 1');
});

test('every operational source augment and fusion builds a scroll that the battle accepts', () => {
    const all = [...require('../services/tower/towerAugments').AUGMENTS.filter((entry) => entry.impl).map((entry) => entry.code),
        ...require('../services/tower/towerFusions').RECIPES.map((recipe) => recipe.id)];
    assert.equal(all.length, 118);
    const match = battle({ codes: all });
    zabuza(match);
    cast(match, 'p', 2, 'haruno-sakura', 'rudimentary-healing', ['p', 0]);
    for (let turn = 0; turn < 6; turn += 1) {
        round(match);
        if (match.board.p[0].alive !== false) zabuza(match, 1);
        match.currentTurn = 'bot';
        enemyHits(match, 0);
        match.currentTurn = 'p';
    }
    assert.ok(match.towerEncounter.augments.codes.length >= 118, 'all codes are active together without errors');
    assert.ok(towerScrolls.STANDARD_OFFERED_SCROLL_KEYS.length >= 98);
});

test('more memory augments (A034, A041, A058, F08, F12) and the static fusions (F03, F14)', () => {
    let match = battle({ codes: ['A034'], enemies: ['momochi-zabuza', 'zaku-abumi', 'gato'] });
    match.currentTurn = 'bot';
    cast(match, 'bot', 0, 'momochi-zabuza', 'kubikiribocho', ['p', 0]);
    match.currentTurn = 'p';
    zabuza(match, 0);
    assert.equal(lost(match.board.bot[0]), 45, 'A034: +15 on the enemy who hit this ninja first');
    zabuza(match, 0);
    assert.equal(lost(match.board.bot[0]), 75, 'A034: only the next skill');

    match = battle({ codes: ['A041'], enemyHp: [20, 100, 100] });
    cast(match, 'p', 0, 'momochi-zabuza', 'water-prison-technique', ['bot', 1]);
    const prisonCooldown = match.board.p[0].state.cooldowns['momochi-zabuza-water-prison-technique'];
    cast(match, 'p', 1, 'baki', 'sudden-strike', ['bot', 0]);
    assert.equal(match.board.bot[0].alive, false);
    assert.equal(match.board.p[0].state.cooldowns['momochi-zabuza-water-prison-technique'], prisonCooldown - 1, 'A041: a kill lowers cooldowns');

    match = battle({ codes: ['A058'], hp: [10, 50, 50] });
    match.currentTurn = 'bot';
    const before = chakra(match);
    enemyHits(match, 0);
    assert.deepEqual([match.board.p[1].hp, match.board.p[2].hp], [75, 75], 'A058: survivors heal 25');
    assert.equal(chakra(match) - before, 1, 'A058: +1 chakra');

    match = battle({ codes: ['F08'], hp: [50, 100, 100] });
    zabuza(match);
    assert.equal(match.board.p[0].hp, 56, 'F08: heals 20% of direct damage');
    round(match); zabuza(match); round(match);
    const hpBefore = match.board.bot[0].hp;
    zabuza(match);
    assert.equal(hpBefore - match.board.bot[0].hp, 35, 'F08: consecutive turns add +5');

    match = battle({ codes: ['F12'] });
    zabuza(match); round(match);
    zabuza(match); round(match);
    const third = match.board.bot[0].hp;
    zabuza(match);
    assert.equal(third - match.board.bot[0].hp, 33, 'F12: +10% on the third consecutive turn');

    const sakuraHeal = (codes) => {
        const m = battle({ codes, hp: [100, 40, 100] });
        cast(m, 'p', 2, 'haruno-sakura', 'rudimentary-healing', ['p', 1]);
        return m.board.p[1].hp - 40;
    };
    assert.equal(sakuraHeal(['F03']), sakuraHeal([]) + 10, 'F03: heals restore 10 more');
    match = battle({ codes: ['F03'], hp: [60, 100, 100] });
    match.currentTurn = 'bot';
    enemyHits(match, 0);
    assert.equal(match.board.p[0].hp, 55, 'F03: dropping to 40 heals 15');

    assert.equal(lost((() => { const m = battle({ codes: ['F14'] }); zabuza(m); return m; })().board.bot[0]), 37, 'F14: +25%');
    const desperate = battle({ codes: ['F14'], hp: [29, 100, 100] });
    zabuza(desperate);
    assert.equal(lost(desperate.board.bot[0]), 48, 'F14: +60% at 29 health or less');
});
