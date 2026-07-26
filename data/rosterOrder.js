// Canonical Naruto-Arena Roster Grid Order (7 columns x 3 rows = 21 slots per page)
// Defines the exact grid slot index for each character to preserve player muscle memory.

const CANONICAL_ROSTER_ORDER = [
    // Page 1 (Slots 0 - 20)
    'uzumaki-naruto',        // Slot 0
    'haruno-sakura',         // Slot 1
    'uchiha-sasuke',         // Slot 2
    'inuzuka-kiba',          // Slot 3
    'aburame-shino',         // Slot 4
    'hyuuga-hinata',         // Slot 5
    'nara-shikamaru',        // Slot 6
    'akimichi-chouji',       // Slot 7
    'yamanaka-ino',          // Slot 8
    'rock-lee',              // Slot 9
    'tenten',                // Slot 10
    'neji-hyuuga',           // Slot 11
    'gaara-of-the-desert',   // Slot 12
    'kankuro',               // Slot 13
    'temari',                // Slot 14
    'haku',                  // Slot 15
    'momochi-zabuza',        // Slot 16
    'umino-iruka',           // Slot 17
    'hatake-kakashi',        // Slot 18
    'uchiha-obito',          // Slot 19
    'nohara-rin',            // Slot 20

    // Page 2 (Slots 21 - 41)
    'hyuuga-hanabi',         // Slot 21
    'teuchi',                // Slot 22
    'young-kushina',         // Slot 23
    'young-minato',          // Slot 24
    'young-itachi',          // Slot 25
    'young-yahiko',          // Slot 26
    'young-konan',           // Slot 27
    'young-nagato',          // Slot 28
    'yakushi-kabuto',        // Slot 29
    'sarutobi-asuma',        // Slot 30
    'yuhi-kurenai',          // Slot 31
    'maito-gai',             // Slot 32
    'young-kakashi',         // Slot 33
    'anbu-itachi',           // Slot 34
    'anbu-yamato',           // Slot 35
    'uchiha-madara',         // Slot 36
    'hoshigaki-kisame',      // Slot 37
    'tsunade',               // Slot 38
    'jiraiya',               // Slot 39
    'orochimaru',            // Slot 40
    'yamato',                // Slot 41

    // Page 3 (Slots 42 - 62)
    'gekko-hayate',          // Slot 42
    'shizune',               // Slot 43
    'kotetsu-hagane',        // Slot 44
    'izumo-kamizuki',        // Slot 45
    'demon-brothers',        // Slot 46
    'zaku-abumi',            // Slot 47
    'dosu-kinuta',           // Slot 48
    'tsuchi-kin',            // Slot 49
    'shigure',               // Slot 50
    'oboro',                 // Slot 51
    'akadou-yoroi',          // Slot 52
    'tsurugi-misumi',        // Slot 53
    'mizuki',                // Slot 54
    'tayuya',                // Slot 55
    'suigetsu-hozuki',       // Slot 56
    'kimimaro',              // Slot 57
    'mitarashi-anko',        // Slot 58
    'sakon-and-ukon',        // Slot 59
    'kidoumaru',             // Slot 60
    'sharingan-kakashi',     // Slot 61
    'genjutsu-kurenai',      // Slot 62

    // Page 4 (Slots 63 - 83)
    'baki',                  // Slot 63
    'rokushou-aoi',          // Slot 64
    'kurosuki-raiga',        // Slot 65
    'shiore-orochimaru',     // Slot 66
    'young-tsunade',         // Slot 67
    'young-jiraiya',         // Slot 68
    'young-orochimaru',      // Slot 69
    'sannin-tsunade',        // Slot 70
    'sannin-jiraiya',        // Slot 71
    'sannin-orochimaru',     // Slot 72
    'sarutobi-hiruzen',      // Slot 73
    'edo-tensei-tobirama',   // Slot 74
    'edo-tensei-hashirama',  // Slot 75
    'shimura-danzo',         // Slot 76
    'gamabunta',             // Slot 77
    'kyuubi-naruto',         // Slot 78
    'cursed-seal-lv1-sasuke',// Slot 79
    'cursed-seal-sasuke',    // Slot 80
    'jiroubou',              // Slot 81
    'butterfly-chouji',      // Slot 82
    'drunken-lee',           // Slot 83

    // Page 5 (Slots 84 - 104)
    'shukaku-gaara',         // Slot 84
    'rehabilitated-gaara',   // Slot 85
    'uchiha-itachi',         // Slot 86
    'deidara',               // Slot 87
    'sasori',                // Slot 88
    'hidan',                 // Slot 89
    'kakuzu',                // Slot 90
    'pain',                  // Slot 91
    'konan',                 // Slot 92
    'zetsu',                 // Slot 93
    'akatsuki-orochimaru',   // Slot 94
    'shippuden-naruto',      // Slot 95
    'shippuden-sakura',      // Slot 96
    'shippuden-sai',         // Slot 97
    'shippuden-kiba',        // Slot 98
    'shippuden-shino',       // Slot 99
    'shippuden-hinata',      // Slot 100
    'shippuden-shikamaru',   // Slot 101
    'shippuden-chouji',      // Slot 102
    'shippuden-ino',         // Slot 103
    'shippuden-lee',         // Slot 104
];

const ORDER_MAP = new Map(
    CANONICAL_ROSTER_ORDER.map((id, index) => [id, index])
);

function getCharacterRosterOrder(character) {
    if (!character) return 9999;
    if (typeof character.orderIndex === 'number' && Number.isFinite(character.orderIndex)) {
        return character.orderIndex;
    }
    const id = character.characterId || character.id || '';
    if (ORDER_MAP.has(id)) {
        return ORDER_MAP.get(id);
    }
    return 9999;
}

function sortCharactersByRosterOrder(characters = []) {
    if (!Array.isArray(characters)) return [];
    return characters.slice().sort((a, b) => {
        const orderA = getCharacterRosterOrder(a);
        const orderB = getCharacterRosterOrder(b);
        if (orderA !== orderB) {
            return orderA - orderB;
        }
        const nameA = String(a.name || a.characterId || '');
        const nameB = String(b.name || b.characterId || '');
        return nameA.localeCompare(nameB);
    });
}

module.exports = {
    CANONICAL_ROSTER_ORDER,
    getCharacterRosterOrder,
    sortCharactersByRosterOrder,
};
