const { test } = require('node:test');
const assert = require('node:assert/strict');
const characters = require('../data/characters');
const { ACTIVE_ROSTER_SET } = require('../data/activeRoster');
const { previewSkills } = require('../skill-visibility.js');

const hiddenFor = (character) => character.skills
    .filter((skill) => skill && !skill.omitFromSelectionViewer && !previewSkills(character.skills).includes(skill))
    .map((skill) => skill.name);

test('skill previews leave out alternate forms that share a shown skill\'s name', () => {
    const hidden = Object.fromEntries(characters
        .filter((character) => ACTIVE_ROSTER_SET.has(character.characterId))
        .map((character) => [character.characterId, hiddenFor(character)])
        .filter(([, names]) => names.length));
    assert.deepEqual(hidden, {
        'haruno-sakura': ['Mental Overwhelm'],
        'rock-lee': ['High Speed Taijutsu'],
        'dosu-kinuta': ['Vibrating Sound Drill', 'Sound Manipulation'],
        'haku': ['Flying Needles of Death', 'Acupuncture'],
        'oboro': ['Exploding Kunais'],
    });
});

test('alternate skills with their own name stay in the preview', () => {
    const lee = characters.find((character) => character.characterId === 'rock-lee');
    assert.ok(previewSkills(lee.skills).some((skill) => skill.name === 'Final Lotus'));
    const kakashi = characters.find((character) => character.characterId === 'hatake-kakashi');
    assert.ok(previewSkills(kakashi.skills).some((skill) => skill.name === 'Raikiri'));
});

test('omitted skills are never shown, and an empty list stays empty', () => {
    assert.deepEqual(previewSkills([{ name: 'A' }, { name: 'B', omitFromSelectionViewer: true }]).map((s) => s.name), ['A']);
    assert.deepEqual(previewSkills(null), []);
});
