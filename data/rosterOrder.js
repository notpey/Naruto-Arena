// Canonical Naruto-Arena Roster Grid Order (7 columns x 3 rows = 21 slots per page)
// Defines the exact grid slot index for each character to preserve player muscle memory.

const CANONICAL_ROSTER_ORDER = [
    'uzumaki-naruto',           // 0: Naruto
    'haruno-sakura',            // 1: Sakura
    'uchiha-sasuke',            // 2: Sasuke
    'inuzuka-kiba',             // 3: Kiba
    'aburame-shino',            // 4: Shino
    'hyuuga-hinata',            // 5: Hinata
    'nara-shikamaru',           // 6: Shikamaru
    'akimichi-chouji',          // 7: Chouji
    'yamanaka-ino',             // 8: Ino
    'rock-lee',                 // 9: Lee
    'tenten',                   // 10: Tenten
    'neji-hyuuga',              // 11: Neji
    'gaara-of-the-desert',      // 12: Gaara
    'kankuro',                  // 13: Kankuro
    'temari',                   // 14: Temari
    'dosu-kinuta',              // 15: Dosu
    'tsuchi-kin',               // 16: Kin
    'zaku-abumi',               // 17: Zaku
    'young-kakashi',            // 18: Young Kakashi
    'uchiha-obito',             // 19: Uchiha Obito
    'nohara-rin',               // 20: Nohara Rin
    'hyuuga-hanabi',            // 21: Hyuuga Hanabi
    'teuchi',                   // 22: Teuchi
    'young-minato',             // 23: Young Minato
    'young-kushina',            // 24: Young Kushina
    'young-itachi',             // 25: Young Itachi
    'young-yahiko',             // 26: Young Yahiko
    'young-konan',              // 27: Young Konan
    'young-nagato',             // 28: Young Nagato
    'umino-iruka',              // 29: Iruka
    'mizuki',                   // 30: Mizuki
    'demon-brothers',           // 31: Demon Brothers
    'haku',                     // 32: Haku
    'momochi-zabuza',           // 33: Zabuza
    'oboro',                    // 34: Oboro
    'shigure',                  // 35: Shigure
    'shiore-orochimaru',        // 36: Shiore Orochimaru
    'akadou-yoroi',             // 37: Akadou Yoroi
    'tsurugi-misumi',           // 38: Misumi
    'jiroubou',                 // 39: Jiroubo
    'kidoumaru',                // 40: Kidoumaru
    'tayuya',                   // 41: Tayuya
    'sakon-and-ukon',           // 42: Sakon
    'kimimaro',                 // 43: Kimimaro
    'mitarashi-anko',           // 44: Anko
    'gekko-hayate',             // 45: Hayate
    'shizune',                  // 46: Shizune
    'hatake-kakashi',           // 47: (older) Kakashi
    'yuhi-kurenai',             // 48: Kurenai
    'sarutobi-asuma',           // 49: Asuma
    'maito-gai',                // 50: Gai
    'baki',                     // 51: Baki
    'yakushi-kabuto',           // 52: Kabuto
    'tsunade',                  // 53: Tsunade
    'jiraiya',                  // 54: Jiraiya
    'orochimaru',               // 55: Orochimaru
    'edo-tensei-hashirama',     // 56: Hashirama
    'edo-tensei-tobirama',      // 57: Tobirama
    'sarutobi-hiruzen',         // 58: Hiruzen
    'kyuubi-naruto',            // 59: Kyuubi Naruto
    'cursed-seal-lv1-sasuke',   // 60: Cursed Seal Sasuke lvl 1
    'cursed-seal-sasuke',       // 61: Cursed Seal Sasuke
    'butterfly-chouji',         // 62: Butterfly Chouji
    'drunken-lee',              // 63: Drunken Lee
    'shukaku-gaara',            // 64: Shukaku Gaara
    'rehabilitated-gaara',      // 65: Rehabilitated Gaara
    'hoshigaki-kisame',         // 66: Kisame
    'uchiha-itachi',            // 67: Itachi
    'rokushou-aoi',             // 68: Aoi
    'kurosuki-raiga',           // 69: Raiga
    'uzumaki-naruto-s',         // 70: Uzumaki Naruto (S)
    'haruno-sakura-s',          // 71: Haruno Sakura (S)
    'sai',                      // 72: Sai
    'inuzuka-kiba-s',           // 73: Inuzuka Kiba (S)
    'aburame-shino-s',          // 74: Aburame Shino (S)
    'hyuuga-hinata-s',          // 75: Hyuuga Hinata (S)
    'nara-shikamaru-s',         // 76: Nara Shikamaru (S)
    'akimichi-chouji-s',        // 77: Akimichi Chouji (S)
    'yamanaka-ino-s',           // 78: Yamanaka Ino (S)
    'rock-lee-s',               // 79: Rock Lee (S)
    'tenten-s',                 // 80: Tenten (S)
    'hyuuga-neji-s',            // 81: Hyuuga Neji (S)
    'hatake-kakashi-s',         // 82: Hatake Kakashi (S)
    'yamato',                   // 83: Yamato
    'maito-gai-s',              // 84: Maito Gai (S)
    'kankuro-s',                // 85: Kankuro (S)
    'temari-s',                 // 86: Temari (S)
    'kazekage-gaara',           // 87: Kazekage Gaara
    'yakushi-kabuto-s',         // 88: Yakushi Kabuto (S)
    'orochimaru-s',             // 89: Orochimaru (S)
    'four-tails-kyuubi-naruto', // 90: Four Tails Kyuubi Naruto
    'kisame-body-double',       // 91: Kisame Body Double
    'itachi-body-double',       // 92: Itachi Body Double
    'deidara',                  // 93: Deidara
    'hiruko-sasori',            // 94: Hiruko Sasori
    'sasori-of-the-red-sand',   // 95: Sasori of the Red Sand
    'puppet-sasori',            // 96: Puppet Sasori
    'gato',                     // 97: Gatō
    'zori-and-waraji',          // 98: Zōri & Waraji
    'sarutobi-konohamaru',      // 99: Konohamaru
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
