const test = require('node:test');
const assert = require('node:assert/strict');
const characters = require('../data/characters');
const battle = require('../battleLogic');

test('roster tooltips describe every visible effect without generic defensive boilerplate', () => {
    const missing = [];
    const boilerplate = [];
    const walk = (value, path) => {
        if (Array.isArray(value)) {
            value.forEach((entry, index) => walk(entry, `${path}[${index}]`));
            return;
        }
        if (!value || typeof value !== 'object') return;
        if (value.type === 'apply_status') {
            const metadata = value.metadata || {};
            if (!metadata.hideTooltip && !metadata.tooltipText && !metadata.tooltipTextTemplate) {
                missing.push(`${path}: ${value.statusId || 'unnamed status'}`);
            }
        }
        Object.entries(value).forEach(([key, entry]) => walk(entry, `${path}.${key}`));
    };

    characters.forEach((character) => {
        if (character.passive && !character.passive.description?.trim()) {
            missing.push(`${character.id}: passive description`);
        }
        character.skills.forEach((skill) => {
            if (!skill.skilldescription?.trim()) missing.push(`${skill.id}: skill description`);
            if (/^This skill makes .+ invulnerable for 1 turn\./.test(skill.skilldescription || '')) {
                boilerplate.push(skill.id);
            }
            walk(skill.effects, skill.id);
        });
    });

    assert.deepEqual(missing, []);
    assert.deepEqual(boilerplate, []);

    const neji = characters.find((character) => character.id === 'neji-hyuuga');
    const gaara = characters.find((character) => character.id === 'gaara-of-the-desert');
    assert.equal(neji.passive.description, "Neji's skills cannot be countered.");
    assert.equal(gaara.passive.stackTooltipTextTemplate,
        'Gaara has 5 unpierceable damage reduction and {sandFlowStacks} Sand Flow stacks.');

    const tenten = characters.find((character) => character.id === 'tenten');
    const match = { players: [{ username: 'p1', team: [characters.indexOf(tenten)] }] };
    const passive = battle.buildInitialBoard(match.players, characters).p1[0].state.statuses[0];
    assert.equal(passive.metadata.tooltipText, tenten.passive.description);
    assert.equal(passive.metadata.tooltipText.includes('This passive cannot be removed'), false);
});

test('stacking defense tooltips show the current defense amount', () => {
    const shukaku = characters.find((character) => character.id === 'shukaku-gaara');
    const effect = shukaku.skills.find((skill) => skill.name === 'Sand Claw').effects
        .find((entry) => entry.statusId === 'shukaku_gaara_sand_claw_defense');
    const targetState = { statuses: [] };
    const apply = () => battle.applyStatus({ targetState, statusId: effect.statusId,
        duration: effect.duration, sourceSkillId: shukaku.skills[0].id, metadata: effect.metadata });

    apply();
    assert.equal(targetState.statuses[0].metadata.tooltipText,
        'This character has 10 permanent destructible defense.');
    apply();
    assert.equal(targetState.statuses[0].metadata.tooltipText,
        'This character has 20 permanent destructible defense.');
});
