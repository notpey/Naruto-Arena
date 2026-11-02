const { test } = require('node:test');
const assert = require('node:assert/strict');

const characters = require('../data/characters');
const {
    ARCHETYPE_TAGS,
    detectCharacterArchetypes,
    buildArchetypeSnapshot,
} = require('../services/warArchetypes');

const byId = (id) => {
    const character = characters.find((entry) => entry.id === id);
    assert.ok(character, `missing character ${id}`);
    return character;
};

test('partial stuns and conditional all-enemy skills count as stun and AoE', () => {
    const result = detectCharacterArchetypes(byId('nara-shikamaru'));
    assert.ok(result.tags.includes('stun'));
    assert.ok(result.tags.includes('aoe'));
    assert.deepEqual(result.reasons.stun, ['Shadow Imitation']);
    assert.ok(result.reasons.aoe.includes('Shadow-Neck Bind'));
});

test('stuns applied through counters on an ally-targeted skill count as stun', () => {
    const result = detectCharacterArchetypes(byId('kisame-body-double'));
    assert.ok(result.reasons.stun.includes('Sentient Water Disabling'));
});

test('splash damage to other enemies counts as AoE', () => {
    const result = detectCharacterArchetypes(byId('temari'));
    assert.ok(result.reasons.aoe.includes('Cutting Whirlwind'));
});

test('removing statuses from all enemies is not an AoE attack', () => {
    const result = detectCharacterArchetypes(byId('sakon-and-ukon'));
    assert.ok(!(result.reasons.aoe || []).includes('Rest'));
});

test('self-inflicted affliction damage does not make a character an affliction character', () => {
    const result = detectCharacterArchetypes(byId('rock-lee'));
    assert.ok(!result.tags.includes('affliction'));
});

test('alternate skills that only appear mid-battle are scanned', () => {
    const result = detectCharacterArchetypes(byId('aburame-shino-s'));
    assert.deepEqual(result.reasons.drain, ['Insect Consumption']);
});

test('chakra removal is detected as drain', () => {
    const result = detectCharacterArchetypes(byId('akadou-yoroi'));
    assert.ok(result.tags.includes('drain'));
});

test('admin overrides add and remove tags', () => {
    const result = detectCharacterArchetypes(byId('nara-shikamaru'), { add: ['heal'], remove: ['aoe'] });
    assert.ok(result.tags.includes('heal'));
    assert.ok(!result.tags.includes('aoe'));
    assert.deepEqual(result.reasons.heal, ['Admin override']);
    assert.equal(result.reasons.aoe, undefined);
});

test('the snapshot classifies every character with known tags only', () => {
    const snapshot = buildArchetypeSnapshot(characters);
    assert.equal(Object.keys(snapshot.characters).length, characters.length);
    for (const entry of Object.values(snapshot.characters)) {
        for (const tag of entry.tags) {
            assert.ok(ARCHETYPE_TAGS.includes(tag));
            assert.ok(entry.reasons[tag].length > 0);
        }
    }
});
