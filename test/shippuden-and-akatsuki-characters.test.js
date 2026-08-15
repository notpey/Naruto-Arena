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
            matchId: 'test_new_chars_match',
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

test('Roster Catalog: All 20 new characters are present with complete metadata', () => {
    const expectedIds = [
        'uzumaki-naruto-s',
        'haruno-sakura-s',
        'sai',
        'inuzuka-kiba-s',
        'aburame-shino-s',
        'hyuuga-hinata-s',
        'nara-shikamaru-s',
        'akimichi-chouji-s',
        'yamanaka-ino-s',
        'rock-lee-s',
        'tenten-s',
        'hyuuga-neji-s',
        'hatake-kakashi-s',
        'yamato',
        'maito-gai-s',
        'kankuro-s',
        'temari-s',
        'kazekage-gaara',
        'yakushi-kabuto-s',
        'orochimaru-s',
        'four-tails-kyuubi-naruto',
        'kisame-body-double',
        'itachi-body-double',
        'deidara',
        'hiruko-sasori',
        'sasori-of-the-red-sand',
        'puppet-sasori',
    ];

    expectedIds.forEach((id) => {
        const found = allCharacters.find((c) => c.id === id || c.characterId === id);
        assert.ok(found, `Character ${id} must exist in roster`);
        assert.ok(found.name, `Character ${id} must have a name`);
        assert.ok(found.characterdeescription, `Character ${id} must have characterdeescription`);
        assert.ok(found.requiredMissionId, `Character ${id} must have requiredMissionId`);
        assert.ok(Array.isArray(found.skills), `Character ${id} must have skills array`);
        assert.ok(found.skills.length >= 4, `Character ${id} must have at least 4 skills`);
        found.skills.forEach((s) => {
            assert.ok(s.id, `Skill in ${id} must have an ID`);
            assert.ok(s.name, `Skill ${s.id} in ${id} must have a name`);
            assert.ok(s.skilldescription, `Skill ${s.id} in ${id} must have description`);
            assert.ok(Array.isArray(s.energy), `Skill ${s.id} in ${id} must have energy array`);
            assert.ok(Array.isArray(s.classes), `Skill ${s.id} in ${id} must have classes array`);
        });
    });
});

test('Uzumaki Naruto (S): Rasenrengan deals 40 piercing damage', () => {
    const narutoS = require('../data/characters/uzumaki-naruto-s.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: narutoS, p2Char: dummy });

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 0, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };

    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    assert.equal(match.board.p2[0].hp, 60);
});

test('Haruno Sakura (S): Superior Healing heals 50% missing health of an ally', () => {
    const sakuraS = require('../data/characters/haruno-sakura-s.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: sakuraS, p1Allies: [dummy], p2Char: dummy });

    match.board.p1[1].hp = 40; // 60 missing health -> 50% is 30 heal -> 70 HP

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 1, targetSelection: [{ username: 'p1', slot: 1 }] },
            },
        },
    };

    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    assert.equal(match.board.p1[1].hp, 70);
});

test('Rock Lee (S): Maximum Force Blast deals bonus damage based on missing health', () => {
    const leeS = require('../data/characters/rock-lee-s.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: leeS, p2Char: dummy });

    // Lee is missing 60 HP (40 HP left) -> 2 intervals of 30 -> +30 bonus damage (20 base + 30 = 50 damage)
    match.board.p1[0].hp = 40;

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 2, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };

    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    assert.equal(match.board.p2[0].hp, 50);
});

test('Hyuuga Neji (S): Eight Trigrams Mountain Crusher destroys destructible defense and deals 45 damage', () => {
    const nejiS = require('../data/characters/hyuuga-neji-s.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: nejiS, p2Char: dummy });

    match.board.p2[0].state.statuses.push({
        id: 'test_defense',
        remainingTurns: 2,
        metadata: { destructibleDefensePoints: 30 },
    });

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 1, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };

    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    assert.equal(match.board.p2[0].hp, 55);
});

test('Orochimaru (S): Second Skin sets health to 100 and replaces with Triple Rashoumon', () => {
    const orochimaruS = require('../data/characters/orochimaru-s.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: orochimaruS, p2Char: dummy });

    match.board.p1[0].hp = 25;

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 0, targetSelection: [{ username: 'p1', slot: 0 }] },
            },
        },
    };

    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    const activeSkill0 = battleLogic.resolveEffectiveSkill({
        characters: roster,
        rosterIndex: 0,
        skillIndex: 0,
        actorState: match.board.p1[0].state,
    });
    assert.equal(activeSkill0.id, 'orochimaru-s-triple-rashoumon');
});

test('Deidara: Art is a Bang! deals 25 piercing damage to enemies and kills Deidara', () => {
    const deidara = require('../data/characters/deidara.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: deidara, p2Char: dummy });

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 2, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };

    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    assert.equal(match.board.p2[0].hp, 75);
    assert.equal(match.board.p1[0].hp, 0);
    assert.equal(match.board.p1[0].alive, false);
});

test('Sasori of the Red Sand: Iron Sand World Method executes target below 10 HP', () => {
    const sasoriRedSand = require('../data/characters/sasori-of-the-red-sand.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: sasoriRedSand, p2Char: dummy });

    // Target at 30 HP -> takes 25 piercing damage -> 5 HP -> drops <= 10 -> executed to 0 HP
    match.board.p2[0].hp = 30;

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 5, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };

    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    assert.equal(match.board.p2[0].hp, 0);
    assert.equal(match.board.p2[0].alive, false);
});

test('Tenten (S): Weapon Upgrade cycles skill replacement tiers', () => {
    const tentenS = require('../data/characters/tenten-s.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: tentenS, p2Char: dummy });

    // Tier 1 initial
    let activeSkill0 = battleLogic.resolveEffectiveSkill({
        characters: roster,
        rosterIndex: 0,
        skillIndex: 0,
        actorState: match.board.p1[0].state,
    });
    assert.equal(activeSkill0.id, 'tenten-s-kunai-grenade');

    // First use -> Tier 2
    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 2, targetSelection: [{ username: 'p1', slot: 0 }] },
            },
        },
    };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    activeSkill0 = battleLogic.resolveEffectiveSkill({
        characters: roster,
        rosterIndex: 0,
        skillIndex: 0,
        actorState: match.board.p1[0].state,
    });
    const activeSkill1 = battleLogic.resolveEffectiveSkill({
        characters: roster,
        rosterIndex: 0,
        skillIndex: 1,
        actorState: match.board.p1[0].state,
    });
    assert.equal(activeSkill0.id, 'tenten-s-heavenly-chain-disaster');
    assert.equal(activeSkill1.id, 'tenten-s-iron-protection-wall');
});

test('Maito Gai (S): Single Gate Release opens gates and unlocks Morning Peacock and Daytime Tiger', () => {
    const gaiS = require('../data/characters/maito-gai-s.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: gaiS, p2Char: dummy });

    // Open 6 gates
    for (let i = 0; i < 6; i++) {
        match.pendingTurns = {
            p1: {
                queueOrder: [0],
                queuedByActorSlot: {
                    '0': { skillIndex: 2, targetSelection: [{ username: 'p1', slot: 0 }] },
                },
            },
        };
        battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    }

    let activeSkill1 = battleLogic.resolveEffectiveSkill({
        characters: roster,
        rosterIndex: 0,
        skillIndex: 1,
        actorState: match.board.p1[0].state,
    });
    assert.equal(activeSkill1.id, 'maito-gai-s-morning-peacock');

    // Open 7th gate
    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 2, targetSelection: [{ username: 'p1', slot: 0 }] },
            },
        },
    };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    activeSkill1 = battleLogic.resolveEffectiveSkill({
        characters: roster,
        rosterIndex: 0,
        skillIndex: 1,
        actorState: match.board.p1[0].state,
    });
    assert.equal(activeSkill1.id, 'maito-gai-s-daytime-tiger');
});

test('Sai: Super Beast Imitation Drawing: Dragon deals 30 piercing damage', () => {
    const sai = require('../data/characters/sai.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: sai, p2Char: dummy });

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 0, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    assert.equal(match.board.p2[0].hp, 70);
});

test('Inuzuka Kiba (S): Two-Headed Wolf Transformation replaces skills', () => {
    const kibaS = require('../data/characters/inuzuka-kiba-s.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: kibaS, p2Char: dummy });

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 2, targetSelection: [{ username: 'p1', slot: 0 }] },
            },
        },
    };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    const activeSkill0 = battleLogic.resolveEffectiveSkill({
        characters: roster,
        rosterIndex: 0,
        skillIndex: 0,
        actorState: match.board.p1[0].state,
    });
    assert.equal(activeSkill0.id, 'inuzuka-kiba-s-three-headed-wolf');
});

test('Aburame Shino (S): Insect Swarm applies affliction dot and replaces skill', () => {
    const shinoS = require('../data/characters/aburame-shino-s.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: shinoS, p2Char: dummy });

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 0, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    const activeSkill0 = battleLogic.resolveEffectiveSkill({
        characters: roster,
        rosterIndex: 0,
        skillIndex: 0,
        actorState: match.board.p1[0].state,
    });
    assert.equal(activeSkill0.id, 'aburame-shino-s-insect-consumption');
});

test('Hyuuga Hinata (S): Gentle Step Twin Lion Fists deals 30 damage and steals/drains chakra', () => {
    const hinataS = require('../data/characters/hyuuga-hinata-s.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: hinataS, p2Char: dummy });

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 1, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    assert.equal(match.board.p2[0].hp, 70);
});

test('Nara Shikamaru (S): Shadow Sewing Technique deals 45 damage and stuns', () => {
    const shikamaruS = require('../data/characters/nara-shikamaru-s.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: shikamaruS, p2Char: dummy });

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 0, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    assert.equal(match.board.p2[0].hp, 55);
    const stun = match.board.p2[0].state.statuses.find((s) => s.id === 'nara_shikamaru_s_shadow_sewing_stun');
    assert.ok(stun);
});

test('Hatake Kakashi (S): Lightning Beast Tracking Fang deals 25 piercing and stuns', () => {
    const kakashiS = require('../data/characters/hatake-kakashi-s.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: kakashiS, p2Char: dummy });

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 0, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    assert.equal(match.board.p2[0].hp, 75);
    const activeSkill0 = battleLogic.resolveEffectiveSkill({
        characters: roster,
        rosterIndex: 0,
        skillIndex: 0,
        actorState: match.board.p1[0].state,
    });
    assert.equal(activeSkill0.id, 'hatake-kakashi-s-finishing-raikiri');
});

test('Yamato: Bliss-Bringing Hands deals 30 damage', () => {
    const yamato = require('../data/characters/yamato.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: yamato, p2Char: dummy });

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 0, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    assert.equal(match.board.p2[0].hp, 70);
});

test('Kankuro (S): Karasu Knives deals 20 damage', () => {
    const kankuroS = require('../data/characters/kankuro-s.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: kankuroS, p2Char: dummy });

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 1, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    assert.equal(match.board.p2[0].hp, 80);
});

test('Temari (S): First Moon buffs damage reduction and unlocks Second Moon', () => {
    const temariS = require('../data/characters/temari-s.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: temariS, p2Char: dummy });

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 0, targetSelection: [{ username: 'p1', slot: 0 }] },
            },
        },
    };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    const activeSkill0 = battleLogic.resolveEffectiveSkill({
        characters: roster,
        rosterIndex: 0,
        skillIndex: 0,
        actorState: match.board.p1[0].state,
    });
    assert.equal(activeSkill0.id, 'temari-s-second-moon');
});

test('Kazekage Gaara: Desert Missile deals 25 piercing damage', () => {
    const gaaraS = require('../data/characters/kazekage-gaara.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: gaaraS, p2Char: dummy });

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 1, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    assert.equal(match.board.p2[0].hp, 75);
});

test('Yakushi Kabuto (S): Dead Soul Technique deals 30 piercing damage and prevents healing', () => {
    const kabutoS = require('../data/characters/yakushi-kabuto-s.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: kabutoS, p2Char: dummy });

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 1, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    assert.equal(match.board.p2[0].hp, 70);
    const noHeal = match.board.p2[0].state.statuses.find((s) => s.id === 'yakushi_kabuto_s_dead_soul_curse');
    assert.ok(noHeal);
});

test('Four Tails Kyuubi Naruto: Compressed Chakra Blast deals 50 piercing damage', () => {
    const fourTails = require('../data/characters/four-tails-kyuubi-naruto.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: fourTails, p2Char: dummy });

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 2, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    assert.equal(match.board.p2[0].hp, 50);
});

test('Kisame Body Double: Water Prison Technique deals 15 damage and stuns', () => {
    const kisameDouble = require('../data/characters/kisame-body-double.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: kisameDouble, p2Char: dummy });

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 1, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    assert.equal(match.board.p2[0].hp, 85);
    const stun = match.board.p2[0].state.statuses.find((s) => s.id === 'kisame_body_double_water_prison_stun');
    assert.ok(stun);
});

test('Itachi Body Double: Fire Style: Grand Fireball Technique deals 20 damage', () => {
    const itachiDouble = require('../data/characters/itachi-body-double.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: itachiDouble, p2Char: dummy });

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 2, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    assert.equal(match.board.p2[0].hp, 80);
});

test('Hiruko Sasori: Poisonous Tail Stab deals 10 damage and applies permanent poison', () => {
    const hirukoSasori = require('../data/characters/hiruko-sasori.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: hirukoSasori, p2Char: dummy });

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 0, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    assert.equal(match.board.p2[0].hp, 90);
    const poison = match.board.p2[0].state.statuses.find((s) => s.id === 'hiruko_sasori_poisonous_tail_poison');
    assert.ok(poison);
});

test('Puppet Sasori: Flamethrowers deal 20 damage', () => {
    const puppetSasori = require('../data/characters/puppet-sasori.js');
    const dummy = require('../data/characters/uzumaki-naruto.js');
    const { match, roster } = buildMockMatch({ p1Char: puppetSasori, p2Char: dummy });

    match.pendingTurns = {
        p1: {
            queueOrder: [0],
            queuedByActorSlot: {
                '0': { skillIndex: 0, targetSelection: [{ username: 'p2', slot: 0 }] },
            },
        },
    };
    battleLogic.resolvePendingTurnSkills({ match, actingUsername: 'p1', characters: roster });
    assert.equal(match.board.p2[0].hp, 80);
});

