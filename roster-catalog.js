// Presentation metadata for the playable roster. Keep these arc names aligned
// with the story chapters; the server's character array remains untouched.
const NarutoRosterCatalog = (() => {
    const arcs = [
        { id: 'prologue', series: 'Naruto', label: 'Prologue', order: 0 },
        { id: 'land-of-waves', series: 'Naruto', label: 'Land of Waves', order: 1 },
        { id: 'konoha-crush', series: 'Naruto', label: 'Konoha Crush', order: 2 },
    ];

    const characters = [
        ['uzumaki-naruto', 'prologue'],
        ['uchiha-sasuke', 'prologue'],
        ['haruno-sakura', 'prologue'],
        ['hatake-kakashi', 'prologue'],
        ['umino-iruka', 'prologue'],
        ['mizuki', 'prologue'],
        ['demon-brothers', 'land-of-waves'],
        ['momochi-zabuza', 'land-of-waves'],
        ['haku', 'land-of-waves'],
        ['gato', 'land-of-waves'],
        ['zori-and-waraji', 'land-of-waves'],
        ['yamanaka-ino', 'prologue'],
        ['sarutobi-konohamaru', 'prologue'],
        ['ebisu', 'prologue'],
        ['sarutobi-hiruzen', 'konoha-crush'],
    ];

    const arcsById = new Map(arcs.map((arc) => [arc.id, arc]));
    const characterMeta = new Map(characters.map(([id, arcId], order) => [id, { arcId, order }]));
    const getCharacterId = (character) => character?.characterId || character?.id;
    const getArc = (character) => arcsById.get(characterMeta.get(getCharacterId(character))?.arcId) || null;

    const listAvailableArcs = (roster) => {
        const present = new Set(roster.filter((character) => character?.hidden !== true)
            .map((character) => getArc(character)?.id).filter(Boolean));
        return arcs.filter((arc) => present.has(arc.id));
    };

    const filterRosterIndices = (roster, { search = '', arc = '', availability = '', sort = 'arc' } = {}) => {
        const query = String(search).trim().toLocaleLowerCase();
        return roster
            .map((_, index) => index)
            .filter((index) => {
                const character = roster[index];
                if (character?.hidden === true) return false;
                if (arc && getArc(character)?.id !== arc) return false;
                if (availability === 'locked' && character.unlocked !== false) return false;
                if (availability === 'unlocked' && character.unlocked === false) return false;
                if (!query) return true;
                const name = String(character.name || '').toLocaleLowerCase();
                const id = String(getCharacterId(character) || '').replace(/-/g, ' ').toLocaleLowerCase();
                return name.includes(query) || id.includes(query);
            })
            .sort((a, b) => {
                const first = roster[a];
                const second = roster[b];
                if (sort === 'name') {
                    return String(first.name || '').localeCompare(String(second.name || '')) || a - b;
                }
                const firstMeta = characterMeta.get(getCharacterId(first));
                const secondMeta = characterMeta.get(getCharacterId(second));
                const firstArc = arcsById.get(firstMeta?.arcId);
                const secondArc = arcsById.get(secondMeta?.arcId);
                return (firstArc?.order ?? Infinity) - (secondArc?.order ?? Infinity)
                    || (firstMeta?.order ?? Infinity) - (secondMeta?.order ?? Infinity)
                    || String(first.name || '').localeCompare(String(second.name || ''))
                    || a - b;
            });
    };

    return { getArc, listAvailableArcs, filterRosterIndices };
})();

if (typeof window !== 'undefined') window.NarutoRosterCatalog = NarutoRosterCatalog;
if (typeof module !== 'undefined' && module.exports) module.exports = NarutoRosterCatalog;
