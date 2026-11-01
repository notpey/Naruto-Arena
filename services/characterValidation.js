// Structural checks for characters saved from the ACP Character Editor. These guard the shape
// the battle engine reads; they don't judge balance or the meaning of individual effects.
const CHAKRA_TYPES = ['Taijutsu', 'Bloodline', 'Ninjutsu', 'Genjutsu', 'Random'];
const CHARACTER_ID_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

function validateCharacterPayload(character) {
    const errors = [];
    if (!character || typeof character !== 'object' || Array.isArray(character)) {
        return ['Character data must be an object.'];
    }
    const characterId = typeof character.characterId === 'string' ? character.characterId.trim() : '';
    if (!CHARACTER_ID_PATTERN.test(characterId)) {
        errors.push('Character id must use lowercase letters, numbers, and hyphens.');
    }
    if (typeof character.name !== 'string' || !character.name.trim()) {
        errors.push('Character name is required.');
    }
    if (character.facePicture != null && typeof character.facePicture !== 'string') {
        errors.push('Face picture must be an image URL.');
    }
    if (character.passive != null && (typeof character.passive !== 'object' || Array.isArray(character.passive) || typeof character.passive.name !== 'string')) {
        errors.push('Passive must be an object with a name.');
    }
    if (!Array.isArray(character.skills) || !character.skills.length) {
        errors.push('A character needs at least one skill.');
        return errors;
    }
    const seenIds = new Set();
    character.skills.forEach((skill, index) => {
        const label = `Skill ${index + 1}${skill && typeof skill.name === 'string' && skill.name ? ` (${skill.name})` : ''}`;
        if (!skill || typeof skill !== 'object' || Array.isArray(skill)) {
            errors.push(`${label} must be an object.`);
            return;
        }
        const skillId = typeof skill.id === 'string' ? skill.id.trim() : '';
        if (!skillId) errors.push(`${label} needs an id.`);
        else if (seenIds.has(skillId)) errors.push(`${label} reuses the skill id "${skillId}".`);
        seenIds.add(skillId);
        if (typeof skill.name !== 'string' || !skill.name.trim()) errors.push(`${label} needs a name.`);
        if (!Array.isArray(skill.energy) || skill.energy.some((type) => !CHAKRA_TYPES.includes(type))) {
            errors.push(`${label} chakra cost must only use ${CHAKRA_TYPES.join(', ')}.`);
        } else if (skill.energy.length > 10) {
            errors.push(`${label} costs more chakra than the game allows.`);
        }
        if (!Number.isInteger(skill.cooldown) || skill.cooldown < 0 || skill.cooldown > 99) {
            errors.push(`${label} cooldown must be a whole number from 0 to 99.`);
        }
        if (!Array.isArray(skill.classes) || skill.classes.some((entry) => typeof entry !== 'string' || !entry.trim())) {
            errors.push(`${label} classes must be a list of names.`);
        }
        if (!Array.isArray(skill.effects)) errors.push(`${label} effects must be a list.`);
        if (typeof skill.target !== 'string' || !skill.target.trim()) errors.push(`${label} needs a target.`);
    });
    return errors;
}

module.exports = { CHAKRA_TYPES, validateCharacterPayload };
