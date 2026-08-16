const path = require('path');
const { MongoClient } = require(path.join(process.cwd(), 'node_modules', 'mongodb'));

const title = 'Major Update: 27 New Shippuden Characters & Combat Overhaul!';
const rawText = [
    'Welcome Shinobi! Today brings one of the biggest content updates to Naruto-Arena yet, featuring 27 brand new Shippuden and Akatsuki characters, a combat engine upgrade, and high-definition artwork across the board!',
    '🌟 27 New Characters Enter the Arena!',
    'Expand your team rosters and discover powerful new synergies with the arrival of the Shippuden era:',
    '• Team Kakashi / Yamato: Uzumaki Naruto (S), Haruno Sakura (S), Sai, Yamato, Hatake Kakashi (S)\n• Team Kurenai: Inuzuka Kiba (S), Aburame Shino (S), Hyuuga Hinata (S)\n• Team Asuma: Nara Shikamaru (S), Akimichi Chouji (S), Yamanaka Ino (S)\n• Team Gai: Rock Lee (S), Tenten (S), Hyuuga Neji (S), Maito Gai (S)\n• Sand Siblings: Kazekage Gaara, Kankuro (S), Temari (S)\n• Sound & Rogue Shinobi: Yakushi Kabuto (S), Orochimaru (S), Four Tails Kyuubi Naruto\n• Akatsuki & Body Doubles: Deidara, Hiruko (Sasori), Sasori of the Red Sand, Puppet Sasori, Kisame Body Double, Itachi Body Double\n• Flashback & Special Shinobi: Tsuchi Kin, Teuchi, Young Minato, Young Kushina, Young Itachi, Young Yahiko, Young Konan, Young Nagato',
    '---',
    '⚔️ Combat & Skill Engine Upgrades',
    '• Chakra Class Standardization: All skills now consistently utilize the Chakra class instead of legacy Energy types.\n• Accurate Chakra Costs: All 27 new character energy costs have been fine-tuned and verified for balanced competitive play.\n• Invulnerability Bypass: Skills designed to bypass invulnerability (e.g. Dead Soul Technique, Eight Trigrams Mountain Crusher, Rinnegan Domination) now reliably strike through defensive barriers.\n• Targeting Flexibility: Enhanced targeting rules supporting single-target (any unit), all-ally, and all-characters modes.',
    '---',
    '🎨 Visual & Mission Enhancements',
    '• HD Artwork & Icons: Full character portraits and custom skill icons restored and baked for all 97 shinobi.\n• Mission Hub Backdrops: 40+ mission illustration artworks refreshed.\n• Persistence & Performance: Improved character asset caching and database fallback reliability.',
    'Jump into Quick Play or Ladder matches now to try out new team compositions! If you notice any bugs, click 🐛 Report Bug to let us know.'
];

const blocks = rawText.map(item => {
    if (item === '---') return { type: 'divider', text: '' };
    return { type: 'paragraph', text: item };
});

const paragraphs = rawText.filter(t => t !== '---');

async function main() {
    const client = await MongoClient.connect('mongodb://127.0.0.1:27017/naruto-arena');
    const db = client.db('naruto-arena');
    const newsCol = db.collection('news_posts');

    await newsCol.deleteOne({ title });
    await newsCol.insertOne({
        title,
        blocks,
        paragraphs,
        changes: [],
        author: 'Naruto-Arena Team',
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    console.log('Inserted formatted news post into MongoDB!');
    await client.close();
}

main().catch(console.error);
