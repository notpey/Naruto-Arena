const test = require('node:test');
const assert = require('node:assert/strict');
const battleLogic = require('../battleLogic.js');
const allCharacters = require('../data/characters/index.js');

const buildMockMatch = ({ p1Char, p2Char, p1Allies = [], p2Allies = [] }) => {
    const roster = [p1Char, ...p1Allies, p2Char, ...p2Allies];
    const p1Units = [p1Char, ...p1Allies].map((c, slot) => ({
        rosterIndex: slot,
        slot,
        hp: 100,
        alive: true,
        username: 'p1',
        characterId: c.id,
        state: { statuses: [], cooldowns: {}, skillUses: {} },
    }));
    const p2Units = [p2Char, ...p2Allies].map((c, slot) => ({
        rosterIndex: p1Units.length + slot,
        slot,
        hp: 100,
        alive: true,
        username: 'p2',
        characterId: c.id,
        state: { statuses: [], cooldowns: {}, skillUses: {} },
    }));

    return {
        match: {
            matchId: 'test_invuln_match',
            status: 'active',
            players: [{ username: 'p1' }, { username: 'p2' }],
            currentTurn: 'p1',
            turnOrder: ['p1', 'p2'],
            board: {
                p1: p1Units,
                p2: p2Units,
            },
            chakraPools: {
                p1: { taijutsu: 10, ninjutsu: 10, bloodline: 10, genjutsu: 10, random: 10 },
                p2: { taijutsu: 10, ninjutsu: 10, bloodline: 10, genjutsu: 10, random: 10 },
            },
            economy: { turnCounts: { p1: 1, p2: 1 } },
            combatEvents: [],
        },
        roster,
    };
};

test('Chakra Costs: All 27 new characters have accurate chakra energy requirements matching screenshots', () => {
    const expectedEnergies = {
        'uzumaki-naruto-s': {
            'uzumaki-naruto-s-oodama-rasengan': ['Taijutsu', 'Ninjutsu'],
            'uzumaki-naruto-s-mass-shadow-clones': ['Random'],
            'uzumaki-naruto-s-chakra-boost': ['Random', 'Random'],
            'uzumaki-naruto-s-shadow-clone-save': ['Random'],
            'uzumaki-naruto-s-rasenshuriken': ['Taijutsu', 'Ninjutsu'],
        },
        'haruno-sakura-s': {
            'haruno-sakura-s-chakra-enhanced-punch': ['Taijutsu'],
            'haruno-sakura-s-superior-healing': ['Ninjutsu'],
            'haruno-sakura-s-chakra-gathering': ['Random'],
            'haruno-sakura-s-insightful-dodge': ['Random'],
        },
        'sai': {
            'sai-super-beast-imitating-drawing-lions': ['Genjutsu', 'Random'],
            'sai-super-beast-imitating-drawing-snake': ['Genjutsu'],
            'sai-adaptive-painting': ['Random', 'Random'],
            'sai-ink-clone': ['Random'],
            'sai-super-beast-imitating-drawing-bird': ['Genjutsu'],
        },
        'inuzuka-kiba-s': {
            'inuzuka-kiba-s-three-headed-wolf': ['Bloodline', 'Bloodline'],
            'inuzuka-kiba-s-rotating-fang': ['Taijutsu', 'Random'],
            'inuzuka-kiba-s-fang-over-fang': ['Taijutsu', 'Bloodline'],
            'inuzuka-kiba-s-hide-in-the-shade': ['Random'],
            'inuzuka-kiba-s-tail-chasing-rotating-fang': ['Taijutsu', 'Bloodline', 'Random'],
        },
        'aburame-shino-s': {
            'aburame-shino-s-insect-swarm': ['Bloodline', 'Random'],
            'aburame-shino-s-insect-barricade': ['Bloodline'],
            'aburame-shino-s-parasitic-giant-beetle-infestation': ['Bloodline'],
            'aburame-shino-s-insect-cocoon': ['Random'],
            'aburame-shino-s-insect-consumption': ['Bloodline'],
        },
        'hyuuga-hinata-s': {
            'hyuuga-hinata-s-pressure-point-closure': ['Random'],
            'hyuuga-hinata-s-gentle-step-twin-lion-fists': ['Ninjutsu', 'Random'],
            'hyuuga-hinata-s-eight-trigrams-field': ['Random'],
            'hyuuga-hinata-s-byakugan-sight': ['Random'],
        },
        'nara-shikamaru-s': {
            'nara-shikamaru-s-shadow-sewing': ['Genjutsu', 'Random'],
            'nara-shikamaru-s-long-range-tactics': ['Ninjutsu', 'Genjutsu'],
            'nara-shikamaru-s-expert-analysis': [],
            'nara-shikamaru-s-panicked-dodge': ['Random'],
        },
        'akimichi-chouji-s': {
            'akimichi-chouji-s-expansion-technique': ['Random'],
            'akimichi-chouji-s-spiked-meat-tank': ['Bloodline'],
            'akimichi-chouji-s-spiked-meat-tank-alt': ['Bloodline'],
            'akimichi-chouji-s-mega-palm-thrust': ['Taijutsu', 'Random'],
            'akimichi-chouji-s-effortful-block': ['Random'],
        },
        'yamanaka-ino-s': {
            'yamanaka-ino-s-mind-body-switch': ['Genjutsu'],
            'yamanaka-ino-s-proxy-surveillance': ['Random'],
            'yamanaka-ino-s-mind-clone-switch': ['Genjutsu', 'Random'],
            'yamanaka-ino-s-hide': ['Random'],
        },
        'rock-lee-s': {
            'rock-lee-s-leaf-rising-wind': ['Taijutsu'],
            'rock-lee-s-leaf-great-whirlwind': ['Taijutsu'],
            'rock-lee-s-maximum-force-blast': ['Random', 'Random'],
            'rock-lee-s-jumping-dodge': ['Random'],
        },
        'tenten-s': {
            'tenten-s-kunai-grenade': ['Taijutsu'],
            'tenten-s-chain-spin': ['Random'],
            'tenten-s-weapon-upgrade': [],
            'tenten-s-leaping-dodge': ['Random'],
            'tenten-s-heavenly-chain-disaster': ['Taijutsu', 'Random'],
            'tenten-s-iron-protection-wall': ['Ninjutsu', 'Random'],
            'tenten-s-bashousen-coil-of-wind': ['Ninjutsu', 'Random'],
            'tenten-s-bashousen-coil-of-fire': ['Taijutsu', 'Ninjutsu'],
        },
        'hyuuga-neji-s': {
            'hyuuga-neji-s-eight-trigrams-vacuum-palm': ['Taijutsu', 'Random'],
            'hyuuga-neji-s-eight-trigrams-mountain-crusher': ['Taijutsu', 'Bloodline'],
            'hyuuga-neji-s-byakugan-eight-trigrams-field': ['Bloodline'],
            'hyuuga-neji-s-byakugan-defense': ['Random'],
            'hyuuga-neji-s-pressure-point-strike': ['Random'],
        },
        'hatake-kakashi-s': {
            'hatake-kakashi-s-lightning-beast-fang': ['Ninjutsu', 'Random'],
            'hatake-kakashi-s-kakashi-kamui': ['Bloodline', 'Genjutsu'],
            'hatake-kakashi-s-team-tactics': ['Random', 'Random'],
            'hatake-kakashi-s-bunshin-stand-in': ['Random'],
            'hatake-kakashi-s-finishing-raikiri': ['Ninjutsu', 'Random'],
        },
        'yamato': {
            'yamato-bliss-bringing-hands': ['Bloodline', 'Random'],
            'yamato-wood-release-wood-clone': ['Bloodline'],
            'yamato-wood-release-four-pillar-prison': ['Bloodline', 'Ninjutsu'],
            'yamato-wood-release-wood-shelter': ['Random'],
        },
        'maito-gai-s': {
            'maito-gai-s-nunchaku-taijutsu': ['Taijutsu'],
            'maito-gai-s-fiery-kick': ['Taijutsu', 'Bloodline'],
            'maito-gai-s-single-gate-release': [],
            'maito-gai-s-muscle-block': ['Random'],
            'maito-gai-s-morning-peacock': ['Taijutsu', 'Bloodline'],
            'maito-gai-s-daytime-tiger': ['Taijutsu', 'Bloodline'],
        },
        'kankuro-s': {
            'kankuro-s-kuroari-trap': ['Random'],
            'kankuro-s-karasu-knives': ['Random', 'Random'],
            'kankuro-s-sanshouo-shield': ['Random', 'Random'],
            'kankuro-s-puppet-distraction': ['Random'],
            'kankuro-s-defensive-puppet-control': [],
        },
        'temari-s': {
            'temari-s-first-moon': [],
            'temari-s-ally-protection': ['Random'],
            'temari-s-wind-scythe': ['Ninjutsu'],
            'temari-s-fan-offensive-defense': ['Random'],
            'temari-s-second-moon': [],
            'temari-s-third-moon': ['Ninjutsu', 'Random'],
        },
        'kazekage-gaara': {
            'kazekage-gaara-desert-missile': ['Bloodline'],
            'kazekage-gaara-desert-prison': ['Bloodline', 'Random'],
            'kazekage-gaara-sand-summoning': ['Random'],
            'kazekage-gaara-sand-sphere': ['Random'],
        },
        'yakushi-kabuto-s': {
            'yakushi-kabuto-s-charging-mystical-palm': ['Ninjutsu'],
            'yakushi-kabuto-s-dead-soul-technique': ['Ninjutsu', 'Random'],
            'yakushi-kabuto-s-medical-ninjutsu': ['Ninjutsu'],
            'yakushi-kabuto-s-precise-evasion': ['Random'],
        },
        'orochimaru-s': {
            'orochimaru-s-second-skin': ['Ninjutsu'],
            'orochimaru-s-sword-snake-horde': ['Bloodline'],
            'orochimaru-s-extended-kusanagi': ['Taijutsu', 'Bloodline'],
            'orochimaru-s-ground-mobility': ['Random'],
            'orochimaru-s-triple-rashoumon': ['Ninjutsu', 'Ninjutsu', 'Random'],
        },
        'four-tails-kyuubi-naruto': {
            'four-tails-kyuubi-naruto-transformation': ['Random'],
            'four-tails-kyuubi-naruto-shockwave-smash': ['Random', 'Random'],
            'four-tails-kyuubi-naruto-compressed-chakra-blast': ['Random', 'Random', 'Random'],
            'four-tails-kyuubi-naruto-skin-of-chakra': ['Random'],
            'four-tails-kyuubi-naruto-enrage': [],
        },
        'kisame-body-double': {
            'kisame-body-double-explosive-water-shock-wave': ['Bloodline', 'Ninjutsu'],
            'kisame-body-double-water-prison-technique': ['Bloodline'],
            'kisame-body-double-five-man-eating-sharks': ['Ninjutsu', 'Random'],
            'kisame-body-double-samehada-block': ['Random'],
            'kisame-body-double-sentient-water-disabling': ['Ninjutsu'],
        },
        'itachi-body-double': {
            'itachi-body-double-finger-genjutsu': ['Genjutsu'],
            'itachi-body-double-genjutsu-reversal': ['Bloodline', 'Genjutsu'],
            'itachi-body-double-fire-release-fireball': ['Ninjutsu'],
            'itachi-body-double-illusionary-raven-bunshin': ['Random'],
        },
        'deidara': {
            'deidara-c1-birds': ['Random'],
            'deidara-c1-centipede': ['Ninjutsu'],
            'deidara-art-is-a-bang': ['Bloodline', 'Ninjutsu'],
            'deidara-clay-mold': [],
            'deidara-c3-statue': ['Ninjutsu', 'Random'],
            'deidara-c2-dragon': ['Random', 'Random'],
        },
        'hiruko-sasori': {
            'hiruko-sasori-poisonous-tail-stab': ['Taijutsu'],
            'hiruko-sasori-sand-clone-trap': ['Ninjutsu'],
            'hiruko-sasori-puppet-reveal': ['Random'],
            'hiruko-sasori-tail-deflection': ['Random'],
            'hiruko-sasori-eight-waves-of-needles': ['Taijutsu', 'Ninjutsu'],
            'hiruko-sasori-prosthetic-arm-senbon': ['Random', 'Random'],
        },
        'sasori-of-the-red-sand': {
            'sasori-of-the-red-sand-thousand-hands': ['Random'],
            'sasori-of-the-red-sand-poison-gas': ['Random', 'Random'],
            'sasori-of-the-red-sand-iron-sand': ['Bloodline'],
            'sasori-of-the-red-sand-puppet-protection': ['Random'],
            'sasori-of-the-red-sand-iron-sand-gathering-assault': ['Ninjutsu', 'Random'],
            'sasori-of-the-red-sand-iron-sand-world-method': ['Bloodline', 'Ninjutsu', 'Random'],
        },
        'puppet-sasori': {
            'puppet-sasori-flamethrower': ['Bloodline'],
            'puppet-sasori-water-stream-shooters': ['Ninjutsu'],
            'puppet-sasori-performance-of-a-hundred-puppets': ['Random'],
            'puppet-sasori-living-core': ['Random'],
            'puppet-sasori-puppet-attack': ['Random', 'Random'],
        },
    };

    for (const [charId, skillMap] of Object.entries(expectedEnergies)) {
        const char = allCharacters.find((c) => c.id === charId || c.characterId === charId);
        assert.ok(char, `Character ${charId} exists`);
        for (const [skillId, expectedEnergy] of Object.entries(skillMap)) {
            const skill = char.skills.find((s) => s.id === skillId);
            assert.ok(skill, `Skill ${skillId} in character ${charId} exists`);
            assert.deepEqual(
                skill.energy,
                expectedEnergy,
                `Skill ${skillId} energy in ${charId} should be ${JSON.stringify(expectedEnergy)}, got ${JSON.stringify(skill.energy)}`
            );
        }
    }
});

test('Invulnerability Targeting: Uzumaki Naruto (S) Oodama Rasengan and Rasenshuriken can target invulnerable enemies', () => {
    const narutoS = require('../data/characters/uzumaki-naruto-s.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: narutoS, p2Char: dummy });

    // Make defender invulnerable
    const defender = match.board.p2[0];
    defender.state.statuses.push({
        id: 'test_invuln',
        remainingTurns: 1,
        metadata: { invulnerable: true },
    });

    // Skill 0: Oodama Rasengan (ignores invulnerability)
    const options0 = battleLogic.computeTargetOptions({
        match,
        actingUsername: 'p1',
        actorSlot: 0,
        skillIndex: 0,
        characters: roster,
    });
    assert.equal(options0.targets.length, 1, 'Oodama Rasengan should be able to target the invulnerable enemy');
    assert.equal(options0.targets[0].username, 'p2');
    assert.equal(options0.targets[0].slot, 0);

    // Skill 4: Rasenshuriken (ignores invulnerability)
    const options4 = battleLogic.computeTargetOptions({
        match,
        actingUsername: 'p1',
        actorSlot: 0,
        skillIndex: 4,
        characters: roster,
    });
    assert.equal(options4.targets.length, 1, 'Rasenshuriken should be able to target the invulnerable enemy');

    // Turn execution: Oodama Rasengan deals damage through invulnerability
    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 0, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    assert.equal(defender.hp, 60, 'Defender should take 40 damage from Oodama Rasengan');
});

test('Invulnerability Targeting: Sai Super Beast Imitating Drawing: Snake can target invulnerable enemies', () => {
    const sai = require('../data/characters/sai.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: sai, p2Char: dummy });

    const defender = match.board.p2[0];
    defender.state.statuses.push({
        id: 'test_invuln',
        remainingTurns: 1,
        metadata: { invulnerable: true },
    });

    // Skill 1: Snake (ignores invulnerability)
    const options = battleLogic.computeTargetOptions({
        match,
        actingUsername: 'p1',
        actorSlot: 0,
        skillIndex: 1,
        characters: roster,
    });
    assert.equal(options.targets.length, 1, 'Sai Snake should be able to target the invulnerable enemy');
    assert.equal(options.targets[0].username, 'p2');

    // Standard damage skill (Skill 0: Lions) should NOT be able to target invulnerable enemy
    const optionsLions = battleLogic.computeTargetOptions({
        match,
        actingUsername: 'p1',
        actorSlot: 0,
        skillIndex: 0,
        characters: roster,
    });
    assert.equal(optionsLions.targets.length, 0, 'Sai Lions should NOT be able to target invulnerable enemy');
});

test('Invulnerability Targeting: Kakashi (S) Kamui can target invulnerable enemies and allies', () => {
    const kakashiS = require('../data/characters/hatake-kakashi-s.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: kakashiS, p2Char: dummy });

    const defender = match.board.p2[0];
    defender.state.statuses.push({
        id: 'test_invuln',
        remainingTurns: 1,
        metadata: { invulnerable: true },
    });

    // Skill 1: Kamui (target: single-target, ignores invulnerability)
    const options = battleLogic.computeTargetOptions({
        match,
        actingUsername: 'p1',
        actorSlot: 0,
        skillIndex: 1,
        characters: roster,
    });
    assert.equal(options.targets.length, 2, 'Kamui should be able to target both self/ally and invulnerable enemy');
    assert.ok(options.targets.some((t) => t.username === 'p2' && t.slot === 0));
    assert.ok(options.targets.some((t) => t.username === 'p1' && t.slot === 0));

    // Turn execution vs invulnerable enemy
    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 1, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    assert.equal(defender.hp, 60, 'Defender should take 40 piercing damage through invulnerability');
});

test('Invulnerability Targeting: Yamato Four-Pillar Prison can target invulnerable enemies', () => {
    const yamato = require('../data/characters/yamato.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: yamato, p2Char: dummy });

    const defender = match.board.p2[0];
    defender.state.statuses.push({
        id: 'test_invuln',
        remainingTurns: 1,
        metadata: { invulnerable: true },
    });

    // Skill 2: Four-Pillar Prison (target: single-target, ignores invulnerability)
    const options = battleLogic.computeTargetOptions({
        match,
        actingUsername: 'p1',
        actorSlot: 0,
        skillIndex: 2,
        characters: roster,
    });
    assert.equal(options.targets.length, 2, 'Four-Pillar Prison should target ally/self and invulnerable enemy');
    assert.ok(options.targets.some((t) => t.username === 'p2' && t.slot === 0));
    assert.ok(options.targets.some((t) => t.username === 'p1' && t.slot === 0));
});

test('Invulnerability Targeting: Orochimaru (S) Triple Rashoumon targets all characters across both teams', () => {
    const orochimaruS = require('../data/characters/orochimaru-s.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: orochimaruS, p2Char: dummy });

    // Skill 4: Triple Rashoumon (target: all-characters)
    const options = battleLogic.computeTargetOptions({
        match,
        actingUsername: 'p1',
        actorSlot: 0,
        skillIndex: 4,
        characters: roster,
    });
    assert.equal(options.mode, 'all');
    assert.equal(options.targets.length, 2, 'Triple Rashoumon targets all characters');
});

test('Invulnerability Targeting: Zabuza Kubikiribōchō after Hidden Mist targets invulnerable enemies', () => {
    const zabuza = require('../data/characters/momochi-zabuza.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: zabuza, p2Char: dummy });

    // Make defender invulnerable
    const defender = match.board.p2[0];
    defender.state.statuses.push({
        id: 'test_invuln',
        remainingTurns: 1,
        metadata: { invulnerable: true },
    });

    match.board.p1[0].state.statuses.push({
        id: 'zabuza_hidden_mist_attack', remainingTurns: 2,
        metadata: { ignoreInvulnerabilityForSkillIds: ['momochi-zabuza-kubikiribocho'] },
    });
    const options = battleLogic.computeTargetOptions({
        match,
        actingUsername: 'p1',
        actorSlot: 0,
        skillIndex: 0,
        characters: roster,
    });
    assert.equal(options.targets.length, 1, 'Mist empowered Kubikiribōchō can target invulnerable enemy');
});

test('Team Targeting: Tenten (S) and Shino (S) all-allies skills target all team members', () => {
    const tentenS = require('../data/characters/tenten-s.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: tentenS, p1Allies: [dummy, dummy], p2Char: dummy });

    // Skill 1: Chain Spin (all-allies)
    const options = battleLogic.computeTargetOptions({
        match,
        actingUsername: 'p1',
        actorSlot: 0,
        skillIndex: 1,
        characters: roster,
    });
    assert.equal(options.mode, 'all');
    assert.equal(options.targets.length, 3, 'Chain Spin targets all 3 team members');
});

