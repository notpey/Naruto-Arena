// Tower events: short story beats with a choice. Pure run logic; nothing here touches combat.
//
// Each option may need a ninja (slot) chosen by the player; `slot` names the rule a ninja
// must meet. `available(run)` returns '' when the option can be taken, or the reason it
// cannot. `resolve(api)` applies the outcome through the helpers towerRun.js passes in
// (healing, scrolls, ryō, a reward offer, or a battle).
//
// Pools:
//  act1     · Land of Waves events, on Act I event nodes.
//  forest   · Forest of Death events, on Act II forest event nodes.
//  training · the month before the finals; one trainer per training node.
//  exam     · the written exam (floor 11).

const { CHAKRA_TYPES, CHAKRA_LABELS } = require('./towerScrolls');

const weaveOptions = (verb) => CHAKRA_TYPES.map((type) => ({
    id: `weave-${type}`,
    label: `${verb} ${CHAKRA_LABELS[type]}`,
    description: `A ninja learns Chakra Weave: ${CHAKRA_LABELS[type]} (skills cost 1 less ${CHAKRA_LABELS[type]} chakra).`,
    slot: { rule: 'lacks-scroll', key: `chakra-weave:${type}` },
    resolve: (api) => api.grantScroll(`chakra-weave:${type}`),
}));

const leave = (label = 'Move on', description = 'Leave without changing anything.') => ({
    id: 'leave', label, description, resolve: (api) => api.log('Moved on.'),
});

const EVENTS = {
    // ------------------------------------------------------------ Act I · Land of Waves
    'tree-climbing': {
        pool: 'act1', kanji: '木', speaker: 'Kakashi',
        title: 'Tree-Climbing Practice',
        text: 'Kakashi walks up a tree trunk, hands in his pockets. "Focus chakra in the soles of your feet. Too little and you fall; too much and you blast the bark away."',
        options: [
            ...weaveOptions('Focus'),
            {
                id: 'rest', label: 'Rest at the roots', description: 'Every ninja recovers 15% of their health.',
                resolve: (api) => { api.healTeamPercent(15); api.log('Rested beneath the practice trees.'); },
            },
        ],
    },
    'tazuna-bridge': {
        pool: 'act1', kanji: '橋', speaker: 'Tazuna',
        title: "Tazuna's Bridge",
        text: 'The old bridge-builder squints at you over a bottle of sake. "Gatō\'s men scared my workers off. I could use strong backs... or I could just feed you."',
        options: [
            {
                id: 'build', label: 'Help build the bridge', description: 'Earn 30 ryō. Every ninja loses 10 health.',
                resolve: (api) => { api.gainRyo(30); api.hurtTeam(10); api.log('Hauled timber for Tazuna (+30 ryō).'); },
            },
            {
                id: 'feast', label: "Eat at Tsunami's table", description: 'Pay 25 ryō. Every ninja recovers 30% of their health.',
                cost: 25,
                resolve: (api) => { api.healTeamPercent(30); api.log('Ate a home-cooked meal with Tazuna\'s family.'); },
            },
            leave(),
        ],
    },
    'inari-courage': {
        pool: 'act1', kanji: '勇', speaker: 'Inari',
        title: "Inari's Courage",
        text: 'The boy who said heroes don\'t exist is standing in the road with a crossbow and the whole village behind him.',
        options: [
            {
                id: 'restore', label: 'Stand up again', description: 'A ninja on their last life regains it.',
                slot: { rule: 'fallen' },
                resolve: (api) => { api.member.fallen = false; api.log('Inari\'s courage gave a fallen ninja their footing back.'); },
            },
            {
                id: 'cheer', label: 'Let the village cheer you on', description: 'Every ninja recovers 15 health.',
                resolve: (api) => { api.healTeamFlat(15); api.log('The village cheered the team on.'); },
            },
        ],
    },
    'swordsman-grave': {
        pool: 'act1', kanji: '墓', speaker: '',
        title: "The Swordsman's Grave",
        text: 'A cleaver-sized blade stands in a mound of earth above the sea. A shard has split from its edge and still hums with killing intent.',
        options: [
            {
                id: 'take', label: 'Take the shard',
                description: "A ninja gains Executioner's Shard (cursed): +15 non-affliction damage and 15 healing on a kill, but 5 more damage taken from every hit.",
                slot: { rule: 'lacks-scroll', key: 'executioners-shard' },
                resolve: (api) => api.grantScroll('executioners-shard'),
            },
            {
                id: 'respect', label: 'Pay your respects', description: 'Every ninja recovers 10% of their health.',
                resolve: (api) => { api.healTeamPercent(10); api.log('Paid respects at the swordsman\'s grave.'); },
            },
        ],
    },
    'hunter-nin-ambush': {
        pool: 'act1', kanji: '襲', speaker: '',
        title: 'Hunter-nin Ambush',
        text: 'Masked figures drop from the mist. Mist hunter-nin, and they think you know where a missing-nin is hiding.',
        options: [
            {
                id: 'fight', label: 'Fight them', description: 'A battle against a tougher squad. Winning offers a Jōnin or Kage scroll.',
                resolve: (api) => api.startBattle({
                    name: 'Mist Hunter-nin', hpBonus: 0.15, affixCount: 1, rewardTable: 'elite',
                }),
            },
            {
                id: 'slip', label: 'Slip away', description: 'Drop 15 ryō as a distraction and leave.',
                resolve: (api) => { api.loseRyo(15); api.log('Slipped away from the hunter-nin.'); },
            },
        ],
    },

    // ------------------------------------------------------------ Act II · the written exam
    'written-exam': {
        pool: 'exam', kanji: '試', speaker: 'Ibiki Morino',
        title: 'The First Exam',
        text: 'Ibiki Morino lets the silence stretch. "Before the tenth question: if you take it and fail, you will remain genin forever. Those who wish to leave may do so now."',
        options: [
            {
                id: 'tenth', label: 'Take the tenth question',
                description: 'Have the nerve. Choose a Jōnin or Kage scroll.',
                resolve: (api) => {
                    api.log('Took the tenth question. There was never a question at all.');
                    api.offerReward('elite');
                },
            },
            {
                id: 'cheat', label: 'Cheat with style', description: 'Read answers off the proctors. Earn 40 ryō.',
                resolve: (api) => { api.gainRyo(40); api.log('Cheated through the written exam without a single mark (+40 ryō).'); },
            },
            {
                id: 'steady', label: 'Steady your nerves', description: 'Every ninja recovers 30% of their health.',
                resolve: (api) => { api.healTeamPercent(30); api.log('Kept calm through the written exam.'); },
            },
        ],
    },

    // ------------------------------------------------------------ Act II · the Forest of Death
    'forbidden-peek': {
        pool: 'forest', kanji: '巻', speaker: '',
        title: 'The Forbidden Peek',
        text: 'The rules were clear: do not open the scrolls before you reach the tower. Nobody said why.',
        options: [
            {
                id: 'open', label: 'Open a scroll',
                description: 'A gamble. Either a Jōnin or Kage scroll, or a summoning trap that costs a scroll and 20 health from every ninja.',
                available: (run) => (((run.examScrolls?.heaven || 0) + (run.examScrolls?.earth || 0)) > 0 ? '' : 'You hold no scroll'),
                resolve: (api) => {
                    if (api.rng() < 0.5) {
                        api.log('The scroll held nothing but a summoning seal, and a lesson in restraint.');
                        api.offerReward('elite');
                    } else {
                        api.loseExamScroll();
                        api.hurtTeam(20);
                        api.log('The scroll was a trap: a summoning seal exploded and the scroll burned away.');
                    }
                },
            },
            leave('Keep it sealed', 'Respect the rules and move on.'),
        ],
    },
    'anko-dango': {
        pool: 'forest', kanji: '団', speaker: 'Anko Mitarashi',
        title: "Anko's Dango Break",
        text: 'The proctor is sitting on a branch, eating dango and watching the forest kill people. "Don\'t die before the tower, brats. It makes paperwork."',
        options: [
            {
                id: 'eat', label: 'Share her dango', description: 'Every ninja recovers 25% of their health.',
                resolve: (api) => { api.healTeamPercent(25); api.log('Shared dango with Anko.'); },
            },
            {
                id: 'lesson', label: 'Ask for a lesson', description: 'A ninja learns Sharpened Kunai.',
                slot: { rule: 'lacks-scroll', key: 'sharpened-kunai' },
                resolve: (api) => api.grantScroll('sharpened-kunai'),
            },
        ],
    },
    'rain-genjutsu': {
        pool: 'forest', kanji: '雨', speaker: '',
        title: 'A Genjutsu Trap',
        text: 'You have passed this same tree three times. Somewhere above, the Rain genin are waiting for you to tire.',
        options: [
            {
                id: 'fight', label: 'Break it and fight', description: 'Fight the Rain genin. They carry an exam scroll.',
                resolve: (api) => api.startForestBattle('rain-genin'),
            },
            {
                id: 'endure', label: 'Walk it off', description: 'Every ninja loses 15 health.',
                resolve: (api) => { api.hurtTeam(15); api.log('Walked through the genjutsu until it broke.'); },
            },
        ],
    },
    'kabuto-cards': {
        pool: 'forest', kanji: '札', speaker: 'Kabuto Yakushi',
        title: "Kabuto's Kindness",
        text: 'A friendly Leaf genin with round glasses. "You look lost. I happen to have a spare scroll... for a small fee." He smiles a little too much.',
        options: [
            {
                id: 'buy', label: 'Buy the missing scroll', description: 'Pay 30 ryō for the exam scroll you lack.',
                cost: 30,
                available: (run) => (run.examScrolls && run.examScrolls.heaven > 0 && run.examScrolls.earth > 0
                    ? 'You already hold both scrolls' : ''),
                resolve: (api) => { api.gainMissingExamScroll(); api.log('Bought a scroll from a helpful genin named Kabuto.'); },
            },
            leave('Decline', 'Something about him is wrong. Leave.'),
        ],
    },

    // ------------------------------------------------------------ Act II · a month of training
    'kakashi-training': {
        pool: 'training', kanji: '雷', speaker: 'Kakashi',
        title: "Kakashi's Training",
        text: 'Kakashi closes his book. "One month. I can sharpen what you already have, or seal what should never have been put on you."',
        options: [
            {
                id: 'upgrade', label: 'Sharpen a technique',
                description: 'Upgrade a ninja\'s Sharpened Kunai to Chakra Blades, or Flak Jacket to Steel Skin.',
                slot: { rule: 'upgradable' },
                resolve: (api) => api.upgradeScroll(),
            },
            {
                id: 'seal', label: 'Evil Sealing Method', description: 'Remove every cursed scroll from a ninja.',
                slot: { rule: 'cursed' },
                resolve: (api) => api.removeCursedScrolls(),
            },
            leave('Thank him and go'),
        ],
    },
    'ebisu-tutoring': {
        pool: 'training', kanji: '眼', speaker: 'Ebisu',
        title: "Ebisu's Elite Tutoring",
        text: 'Ebisu adjusts his sunglasses. "The shortcut to becoming Hokage does not exist! But chakra control... that I can teach."',
        options: [...weaveOptions('Control'), leave('Decline politely')],
    },
    'jiraiya-lesson': {
        pool: 'training', kanji: '蝦', speaker: 'Jiraiya',
        title: 'The Toad Sage',
        text: 'A huge man in red is peering through a fence at the hot springs. "Training? Fine, fine. But my time is expensive, kid."',
        options: [
            {
                id: 'lesson', label: 'Pay for a real lesson', description: 'Pay 60 ryō. Choose a Kage scroll.',
                cost: 60,
                resolve: (api) => { api.log('Jiraiya agreed to teach, eventually.'); api.offerReward('kage'); },
            },
            {
                id: 'research', label: 'Help with his "research"', description: 'Keep watch at the hot springs. Earn 40 ryō.',
                resolve: (api) => { api.gainRyo(40); api.log('Kept watch for Jiraiya\'s research (+40 ryō).'); },
            },
            leave(),
        ],
    },
    'gai-springtime': {
        pool: 'training', kanji: '青', speaker: 'Might Guy',
        title: 'The Springtime of Youth',
        text: 'A green blur stops in front of you and gives a thumbs up. "Five hundred laps of the village! On your hands! YOSH!"',
        options: [
            {
                id: 'gates', label: 'Open the Gates', description: 'A ninja learns Eight Inner Gates (Kage).',
                slot: { rule: 'lacks-scroll', key: 'eight-inner-gates' },
                resolve: (api) => api.grantScroll('eight-inner-gates'),
            },
            {
                id: 'laps', label: 'Run the laps', description: 'A ninja learns Vitality Seal: +20 maximum health.',
                slot: { rule: 'lacks-scroll', key: 'vitality-seal' },
                resolve: (api) => api.grantScroll('vitality-seal'),
            },
            leave(),
        ],
    },
    'konoha-hospital': {
        pool: 'training', kanji: '院', speaker: '',
        title: 'Konoha Hospital',
        text: 'Clean sheets, quiet halls and a medical-nin who does not want to hear how you got those injuries.',
        options: [
            {
                id: 'treat', label: 'Full treatment', description: 'A ninja recovers to full health and regains their last life.',
                slot: { rule: 'living' },
                resolve: (api) => { api.healMemberFull(); api.member.fallen = false; api.log('A ninja was fully treated at the hospital.'); },
            },
            {
                id: 'ward', label: 'A night in the ward', description: 'Every ninja recovers 40% of their health.',
                resolve: (api) => { api.healTeamPercent(40); api.log('The team rested in the hospital ward.'); },
            },
        ],
    },
};

const EVENT_IDS_BY_POOL = Object.entries(EVENTS).reduce((pools, [id, event]) => {
    (pools[event.pool] = pools[event.pool] || []).push(id);
    return pools;
}, {});

const getEvent = (eventId) => EVENTS[eventId] || null;

module.exports = { EVENTS, EVENT_IDS_BY_POOL, getEvent };
