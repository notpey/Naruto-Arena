// The November 28 bug reports: targeting, control skills and stuns, effects that outlive their
// caster, Hidden Mist, and Devour.
const assert = require('node:assert/strict');
const test = require('node:test');
const characters = require('../data/characters');
const battle = require('../battleLogic');

const indexOf = (id) => characters.findIndex((character) => character.characterId === id);
const skillIndex = (characterId, skillId) => characters[indexOf(characterId)].skills.findIndex((skill) => skill.id === skillId);
const pool = () => ({ taijutsu: 10, ninjutsu: 10, bloodline: 10, genjutsu: 10 });
const status = (unit, id) => unit.state.statuses.find((entry) => entry.id === id && entry.remainingTurns > 0);
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
const cast = (match, username, actorSlot, skillId, target = null) => {
    const characterId = characters[match.board[username][actorSlot].rosterIndex].characterId;
    const index = skillIndex(characterId, skillId);
    assert.ok(index >= 0, skillId);
    match.pendingTurns[username] = {
        queueOrder: [actorSlot],
        queuedByActorSlot: { [actorSlot]: {
            skillIndex: index,
            targetSelection: target ? [{ username: target[0], slot: target[1] }] : [],
        } },
    };
    battle.resolvePendingTurnSkills({ match, actingUsername: username, characters });
};
const endTurn = (match, username) => battle.tickStatusesForTurnEnd({ match, endingUsername: username });
const targetsOf = (match, username, actorSlot, skillId) => {
    const characterId = characters[match.board[username][actorSlot].rosterIndex].characterId;
    return battle.computeTargetOptions({
        match, actingUsername: username, actorSlot, skillIndex: skillIndex(characterId, skillId), characters,
    });
};
const keys = (options) => options.targets.map((target) => `${target.username}:${target.slot}`).sort();
const stun = (unit, metadata) => battle.applyStatus({ targetState: unit.state, statusId: 'test_stun',
    duration: 2, sourceUsername: 'p2', sourceSlot: 0, metadata: { harmful: true, ...metadata } });
// Kills a unit through the engine (so death hooks run) with Hayate's 20-damage slash.
const killWithSlash = (match, attacker, attackerSlot, victim) => {
    match.board[victim[0]][victim[1]].hp = 5;
    cast(match, attacker, attackerSlot, 'gekko-hayate-crescent-moon-slash', victim);
    assert.equal(match.board[victim[0]][victim[1]].alive, false, 'the victim dies');
};

test('Meat Tank, Heavenly Spin and Hidden Mist show the user and all enemies; Dust Wind shows everyone', () => {
    const match = matchFor(['akimichi-chouji', 'neji-hyuuga', 'momochi-zabuza'], ['temari', 'tenten', 'kankuro']);
    const selfAndEnemies = (slot) => [`p1:${slot}`, 'p2:0', 'p2:1', 'p2:2'].sort();
    assert.deepEqual(keys(targetsOf(match, 'p1', 0, 'akimichi-chouji-meat-tank')), selfAndEnemies(0));
    assert.deepEqual(keys(targetsOf(match, 'p1', 1, 'neji-hyuuga-eight-trigrams-revolving-heaven')), selfAndEnemies(1));
    assert.deepEqual(keys(targetsOf(match, 'p1', 2, 'momochi-zabuza-hidden-mist-technique')), selfAndEnemies(2));
    assert.deepEqual(keys(targetsOf(match, 'p2', 0, 'temari-dust-wind')),
        ['p1:0', 'p1:1', 'p1:2', 'p2:0', 'p2:1', 'p2:2']);
    assert.equal(targetsOf(match, 'p1', 0, 'akimichi-chouji-meat-tank').mode, 'all');

    // With every enemy invulnerable, the user can still be targeted, so Heavenly Spin stays usable.
    match.board.p2.forEach((unit) => battle.applyStatus({ targetState: unit.state, statusId: 'test_invulnerable',
        duration: 2, sourceUsername: 'p2', sourceSlot: 0, metadata: { helpful: true, invulnerable: true } }));
    assert.deepEqual(keys(targetsOf(match, 'p1', 1, 'neji-hyuuga-eight-trigrams-revolving-heaven')), ['p1:1']);
});

test('a control skill ends when its user is stunned in a way that stops that skill, not by other stuns', () => {
    const shadow = (stunMetadata) => {
        const match = matchFor(['nara-shikamaru', 'tenten', 'rock-lee'], ['kankuro', 'temari', 'baki']);
        cast(match, 'p1', 0, 'nara-shikamaru-shadow-imitation', ['p2', 0]);
        endTurn(match, 'p1');
        const imitating = () => match.board.p2.some((unit) => status(unit, 'nara_shikamaru_shadow_imitation')) ||
            Boolean(status(match.board.p1[0], 'nara_shikamaru_shadow_imitation'));
        assert.ok(imitating(), 'Shadow Imitation is active');
        if (stunMetadata) stun(match.board.p1[0], stunMetadata);
        endTurn(match, 'p2');
        return imitating();
    };
    assert.equal(shadow(null), true, 'unstunned, it continues');
    assert.equal(shadow({ cannotUseSkillClasses: ['physical'] }), true, 'a physical stun does not stop a chakra skill');
    assert.equal(shadow({ cannotUseSkillClasses: ['chakra'] }), false, 'a chakra stun ends Shadow Imitation');
    assert.equal(shadow({ cannotUseSkills: true }), false, 'a full stun ends it');
});

test('an instant skill keeps working after its user dies', () => {
    const burn = (anko) => {
        const match = matchFor(['mitarashi-anko', 'gekko-hayate', 'tenten'], ['gekko-hayate', 'temari', 'baki']);
        cast(match, 'p1', 0, 'mitarashi-anko-dragon-fire');
        assert.ok(status(match.board.p2[1], 'mitarashi_anko_dragon_fire'), 'Dragon Fire burns the enemies');
        if (anko === 'dies') killWithSlash(match, 'p2', 0, ['p1', 0]);
        const before = match.board.p2[1].hp;
        endTurn(match, 'p1');
        return before - match.board.p2[1].hp;
    };
    assert.equal(burn('lives'), 10);
    assert.equal(burn('dies'), 10, 'Dragon Fire still burns after Anko dies');
});

test('Hidden Mist Technique ends if Zabuza dies', () => {
    const match = matchFor(['momochi-zabuza', 'tenten', 'baki'], ['gekko-hayate', 'temari', 'kankuro']);
    cast(match, 'p1', 0, 'momochi-zabuza-hidden-mist-technique');
    assert.ok(status(match.board.p2[1], 'zabuza_hidden_mist_cost'), 'enemies pay more');
    killWithSlash(match, 'p2', 0, ['p1', 0]);
    assert.equal(match.board.p2.some((unit) => status(unit, 'zabuza_hidden_mist_cost')), false,
        'the cost increase ends with Zabuza');
});

test('Devour ends if its target dies, taking Orochimaru\'s damage reduction with it', () => {
    const match = matchFor(['shiore-orochimaru', 'gekko-hayate', 'tenten'], ['baki', 'temari', 'kankuro']);
    cast(match, 'p1', 0, 'shiore-orochimaru-devour', ['p2', 0]);
    assert.ok(status(match.board.p2[0], 'shiore_orochimaru_devour'), 'the target is marked');
    assert.ok(status(match.board.p1[0], 'shiore_orochimaru_devour_guard'), 'Orochimaru gains damage reduction');
    killWithSlash(match, 'p1', 1, ['p2', 0]);
    assert.equal(status(match.board.p1[0], 'shiore_orochimaru_devour_guard'), undefined,
        'the damage reduction ends with the target');
});

test('the deploy migration changes only the fixed fields and can safely run twice', () => {
    const { applyBugReportFixes1128 } = require('../services/bugReportFixes1128');
    // Hayate as stored before this change (Dance still spending charges), with an admin's
    // custom art on the fixed skill and another edit elsewhere.
    const hayate = structuredClone(characters[indexOf('gekko-hayate')]);
    hayate.skills[1].effects.splice(1, 0, { type: 'remove_status', statusId: 'gekko_hayate_crescent_moon',
        scope: 'self', metadata: { deferUntilAfterDamage: true } });
    hayate.skills[1].skillimage = 'https://example.invalid/custom-art.png';
    hayate.name = 'Admin Edited Name';
    const fixed = applyBugReportFixes1128(hayate);
    assert.equal(fixed.skills[1].skillimage, 'https://example.invalid/custom-art.png', 'custom art is kept');
    assert.equal(fixed.name, 'Admin Edited Name', 'other edits are kept');
    assert.equal(fixed.skills[1].effects.some((effect) => effect.type === 'remove_status'), false);
    assert.deepEqual(applyBugReportFixes1128(fixed), fixed, 'a second run changes nothing');

    const zabuza = applyBugReportFixes1128(applyBugReportFixes1128(structuredClone(characters[indexOf('momochi-zabuza')])));
    assert.equal(zabuza.skills[2].skilldescription.match(/This skill ends if Zabuza dies\./g).length, 1);
    // Every fixed character in the files already matches the migrated result.
    for (const id of ['gekko-hayate', 'akimichi-chouji', 'neji-hyuuga', 'temari', 'momochi-zabuza',
        'oboro', 'tsuchi-kin', 'mizuki', 'ebisu']) {
        const current = characters[indexOf(id)];
        assert.deepEqual(applyBugReportFixes1128(current), current, `${id} file already carries the fix`);
    }
});
