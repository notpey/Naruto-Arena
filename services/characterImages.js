const manifest = require('../assets/characters/manifest.json');
function localizeArtwork(value) {
    if (typeof value === 'string') {
        if (value === 'https://i.imgur.com/3Wv9VMP.png') return '/skillqqueue-remaster.png';
        return manifest[value]?.local || value;
    }
    if (Array.isArray(value)) return value.map(localizeArtwork);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localizeArtwork(item)]));
    return value;
}
module.exports = { localizeArtwork };
