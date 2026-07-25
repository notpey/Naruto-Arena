require('dotenv').config();
const fs = require('fs');
const https = require('https');
const path = require('path');
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const { WebSocketServer, WebSocket } = require('ws');
const battleLogic = require('./battleLogic');
const gauntlet = require('./gauntlet');
let charactersData = require('./data/characters/index.js');
const charactersBrowserScript = `const characters = ${JSON.stringify(charactersData)};\nif (typeof window !== 'undefined') window.characters = characters;`;

const app = express();
app.use(compression());
app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 4000;
const TURN_DURATION_MS = 60 * 1000;
const MATCH_FOUND_HOLD_MS = 3 * 1000;
const BATTLE_BOT_QUEUE_TIMEOUT_MS = 3 * 1000;
const BATTLE_BOT_ACTION_DELAY_MIN_MS = 3 * 1000;
const BATTLE_BOT_ACTION_DELAY_MAX_MS = 7 * 1000;
const getBattleBotActionDelayMs = () =>
    BATTLE_BOT_ACTION_DELAY_MIN_MS +
    Math.floor(Math.random() * (BATTLE_BOT_ACTION_DELAY_MAX_MS - BATTLE_BOT_ACTION_DELAY_MIN_MS + 1));
const BATTLE_BOTS_ENABLED = process.env.ENABLE_BATTLE_BOTS !== 'false';
const DEFAULT_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.MONGODB_DB || 'naruto-arena';
const USERS_COLLECTION = process.env.MONGODB_USERS_COLLECTION || 'users';
const MATCHES_COLLECTION = process.env.MONGODB_MATCHES_COLLECTION || 'matches';
const APP_STATE_COLLECTION = process.env.MONGODB_APP_STATE_COLLECTION || 'app_state';
const NEWS_POSTS_COLLECTION = process.env.MONGODB_NEWS_POSTS_COLLECTION || 'news_posts';
const BUGS_COLLECTION = process.env.MONGODB_BUGS_COLLECTION || 'bug_reports';
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'naruto_session';
const SESSION_MAX_AGE_MS =
    Number.parseInt(process.env.SESSION_MAX_AGE_MS, 10) || 7 * 24 * 60 * 60 * 1000;
const ALLOW_INSECURE_HTTP = process.env.ALLOW_INSECURE_HTTP === 'true';
const HTTPS_KEY_PATH = process.env.HTTPS_KEY_PATH;
const HTTPS_CERT_PATH = process.env.HTTPS_CERT_PATH;
const LATEST_CHARACTER_RELEASES = [
    { label: 'Rock Lee', characterId: 'rock-lee' },
    { label: 'Aburame Shino', characterId: 'aburame-shino' },
    { label: 'Latest Character 3', characterId: '' },
];
const LATEST_CHARACTER_RELEASES_STATE_KEY = 'latest_character_releases';
const MAINTENANCE_MODE_STATE_KEY = 'maintenance_mode';
const LADDER_RANK_RULES_STATE_KEY = 'ladder_rank_rules';
const DEFAULT_PROFILE_AVATAR = 'https://i.postimg.cc/3JqVcPXm/default.png';
const LEGACY_DEFAULT_PROFILE_AVATAR = 'https://i.postimg.cc/zG3W1w6K/itachi.png';
const MISSION_CATALOG_STATE_KEY = 'missions';
let missionCatalogCache = null;
const CHARACTERS_STATE_KEY = 'characters';
const CHARACTER_MIGRATIONS_STATE_KEY = 'character_migrations';
const STARTER_REBALANCE_MIGRATION_ID = 'starter-rebalance-2026-07-16';
const EXAMS_REBALANCE_MIGRATION_ID = 'exams-rebalance-2026-07-16-v4';
const STARTER_REBALANCE_CHARACTER_IDS = new Set([
    'uzumaki-naruto',
    'haruno-sakura',
    'uchiha-sasuke',
    'inuzuka-kiba',
    'hyuuga-hinata',
    'nara-shikamaru',
    'akimichi-chouji',
    'yamanaka-ino',
    'rock-lee',
]);
const EXAMS_REBALANCE_CHARACTER_IDS = new Set([
    'uzumaki-naruto',
    'haruno-sakura',
    'uchiha-sasuke',
    'neji-hyuuga',
    'tenten',
    'gaara-of-the-desert',
    'temari',
    'kankuro',
    'tsuchi-kin',
    'zaku-abumi',
    'dosu-kinuta',
    'haku',
    'umino-iruka',
    'mizuki',
    'demon-brothers',
    'momochi-zabuza',
    'oboro',
    'shigure',
    'shiore-orochimaru',
    'akadou-yoroi',
    'tsurugi-misumi',
    'mitarashi-anko',
    'jiroubou',
    'kidoumaru',
    'tayuya',
    'sakon-and-ukon',
    'kimimaro',
    'gekko-hayate',
    'shizune',
    'hatake-kakashi',
    'yuhi-kurenai',
    'sarutobi-asuma',
    'maito-gai',
    'baki',
    'yakushi-kabuto',
]);
const STORY_CATALOG_STATE_KEY = 'story';
let storyCatalogCache = null;
const STORY_HARD_MODE_RYO_REWARD = 250;
const DEFAULT_MISSION_CATALOG = [
    {
        missionId: 'a-rare-opportunity',
        title: 'A Rare Opportunity',
        level_requirement: 6,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'shigure',
        reward_character_name: 'Shigure',
        reward: 'Unlock Shigure.',
        image: 'ingamebgexample.png',
        imageAlt: 'A Rare Opportunity mission artwork',
        characterName: 'Oboro',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Oboro portrait',
        requirements: [],
        goals: [
            {
                type: 'win_matches',
                character_id: 'oboro',
                character_name: 'Oboro',
                wins: 10,
            },
        ],
        sortOrder: 4,
    },
    {
        missionId: 'a-new-find-skin',
        title: 'A New-Find Skin',
        level_requirement: 16,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'shiore-orochimaru',
        reward_character_name: 'Shiore Orochimaru',
        reward: 'Unlock Shiore Orochimaru.',
        image: 'ingamebgexample2.png',
        imageAlt: 'A New-Find Skin mission artwork',
        characterName: 'Uchiha Sasuke',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Uchiha Sasuke portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak',
                character_id: 'uchiha-sasuke',
                character_name: 'Sasuke (classic)',
                wins: 5,
            },
            {
                type: 'win_streak',
                character_id: 'mitarashi-anko',
                character_name: 'Anko',
                wins: 5,
            },
        ],
        sortOrder: 5,
    },
    {
        missionId: 'the-sounds-amongst-the-leaves',
        title: 'The Sounds Amongst the Leaves',
        level_requirement: 6,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'akadou-yoroi',
        reward_character_name: 'Akadou Yoroi',
        reward: 'Unlock Akadou Yoroi.',
        image: 'ingamebgexample.png',
        imageAlt: 'The Sounds Amongst the Leaves mission artwork',
        characterName: 'Dosu Kinuta',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Dosu Kinuta portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak_any',
                character_ids: ['dosu-kinuta', 'tsuchi-kin', 'zaku-abumi'],
                character_name: 'any Sound Genin (Dosu, Kin, Zaku)',
                wins: 3,
            },
        ],
        sortOrder: 6,
    },
    {
        missionId: 'twisting-sound',
        title: 'Twisting Sound',
        level_requirement: 6,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'tsurugi-misumi',
        reward_character_name: 'Tsurugi Misumi',
        reward: 'Unlock Tsurugi Misumi.',
        image: 'ingamebgexample2.png',
        imageAlt: 'Twisting Sound mission artwork',
        characterName: 'Kankuro',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Kankuro portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak',
                character_id: 'kankuro',
                character_name: 'Kankuro',
                wins: 3,
            },
        ],
        sortOrder: 7,
    },
    {
        missionId: 'the-survivor-of-the-seal',
        title: 'The Survivor of the Seal',
        level_requirement: 16,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'mitarashi-anko',
        reward_character_name: 'Mitarashi Anko',
        reward: 'Unlock Mitarashi Anko.',
        image: 'ingamebgexample.png',
        imageAlt: 'The Survivor of the Seal mission artwork',
        characterName: 'Uchiha Sasuke',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Uchiha Sasuke portrait',
        requirements: [],
        goals: [
            {
                type: 'win_matches_any',
                character_ids: ['uzumaki-naruto', 'uchiha-sasuke', 'haruno-sakura'],
                character_name: 'any Team 7 (old era) member',
                wins: 6,
            },
            {
                type: 'win_matches_any',
                character_ids: ['inuzuka-kiba', 'hyuuga-hinata', 'aburame-shino'],
                character_name: 'any Team 8 member',
                wins: 6,
            },
            {
                type: 'win_matches_any',
                character_ids: ['rock-lee', 'neji-hyuuga', 'tenten'],
                character_name: 'any Team 9 member',
                wins: 6,
            },
            {
                type: 'win_matches_any',
                character_ids: ['nara-shikamaru', 'yamanaka-ino', 'akimichi-chouji'],
                character_name: 'any Team 10 (old era) member',
                wins: 6,
            },
            {
                type: 'win_matches_any',
                character_ids: ['gaara-of-the-desert', 'kankuro', 'temari'],
                character_name: 'any member of Team Baki',
                wins: 6,
            },
            {
                type: 'win_matches_any',
                character_ids: ['dosu-kinuta', 'tsuchi-kin', 'zaku-abumi'],
                character_name: 'any Sound Genin (Dosu, Kin, Zaku)',
                wins: 6,
            },
        ],
        sortOrder: 8,
    },
    {
        missionId: 'the-search-for-jiroubou',
        title: 'The Search for Jiroubou',
        level_requirement: 6,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'jiroubou',
        reward_character_name: 'Jiroubou',
        reward: 'Unlock Jiroubou.',
        image: 'ingamebgexample.png',
        imageAlt: 'The Search for Jiroubou mission artwork',
        characterName: 'Akimichi Chouji',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Akimichi Chouji portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak',
                character_id: 'akimichi-chouji',
                character_name: 'Chouji',
                wins: 3,
            },
        ],
        sortOrder: 9,
    },
    {
        missionId: 'the-search-for-kidoumaru',
        title: 'The Search for Kidoumaru',
        level_requirement: 6,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'kidoumaru',
        reward_character_name: 'Kidoumaru',
        reward: 'Unlock Kidoumaru.',
        image: 'ingamebgexample2.png',
        imageAlt: 'The Search for Kidoumaru mission artwork',
        characterName: 'Neji Hyuuga',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Neji Hyuuga portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak',
                character_id: 'neji-hyuuga',
                character_name: 'Neji',
                wins: 3,
            },
        ],
        sortOrder: 10,
    },
    {
        missionId: 'the-search-for-tayuya',
        title: 'The Search for Tayuya',
        level_requirement: 6,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'tayuya',
        reward_character_name: 'Tayuya',
        reward: 'Unlock Tayuya.',
        image: 'ingamebgexample.png',
        imageAlt: 'The Search for Tayuya mission artwork',
        characterName: 'Nara Shikamaru',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Nara Shikamaru portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak_any',
                character_ids: ['nara-shikamaru', 'temari'],
                character_name: 'Shikamaru or Temari (classic versions)',
                wins: 3,
            },
        ],
        sortOrder: 11,
    },
    {
        missionId: 'the-search-for-sakon',
        title: 'The Search for Sakon',
        level_requirement: 6,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'sakon-and-ukon',
        reward_character_name: 'Sakon and Ukon',
        reward: 'Unlock Sakon and Ukon.',
        image: 'ingamebgexample2.png',
        imageAlt: 'The Search for Sakon mission artwork',
        characterName: 'Inuzuka Kiba',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Inuzuka Kiba portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak_any',
                character_ids: ['inuzuka-kiba', 'kankuro'],
                character_name: 'Kiba or Kankuro (classic versions)',
                wins: 3,
            },
        ],
        sortOrder: 12,
    },
    {
        missionId: 'the-search-for-kimimaro',
        title: 'The Search for Kimimaro',
        level_requirement: 16,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'kimimaro',
        reward_character_name: 'Kimimaro',
        reward: 'Unlock Kimimaro.',
        image: 'ingamebgexample.png',
        imageAlt: 'The Search for Kimimaro mission artwork',
        characterName: 'Rock Lee',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Rock Lee portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak',
                character_id: 'rock-lee',
                character_name: 'Rock Lee',
                wins: 4,
            },
            {
                type: 'win_streak',
                character_id: 'gaara-of-the-desert',
                character_name: 'Gaara',
                wins: 4,
            },
            {
                type: 'win_matches',
                character_id: 'rock-lee',
                character_name: 'Rock Lee',
                wins: 10,
            },
            {
                type: 'win_matches',
                character_id: 'gaara-of-the-desert',
                character_name: 'Gaara',
                wins: 10,
            },
            {
                type: 'win_matches',
                character_id: 'uzumaki-naruto',
                character_name: 'Naruto',
                wins: 10,
            },
        ],
        sortOrder: 13,
    },
    {
        missionId: 'the-moonlight-of-the-leaf',
        title: 'The Moonlight of the Leaf',
        level_requirement: 21,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'gekko-hayate',
        reward_character_name: 'Gekko Hayate',
        reward: 'Unlock Gekko Hayate.',
        image: 'ingamebgexample.png',
        imageAlt: 'The Moonlight of the Leaf mission artwork',
        characterName: 'Gekko Hayate',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Gekko Hayate portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak',
                wins: 4,
            },
        ],
        sortOrder: 14,
    },
    {
        missionId: 'medical-training',
        title: 'Medical Training',
        level_requirement: 16,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'shizune',
        reward_character_name: 'Shizune',
        reward: 'Unlock Shizune.',
        image: 'ingamebgexample2.png',
        imageAlt: 'Medical Training mission artwork',
        characterName: 'Haruno Sakura',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Haruno Sakura portrait',
        requirements: [],
        goals: [
            {
                type: 'win_matches',
                character_id: 'haruno-sakura',
                character_name: 'Sakura',
                wins: 15,
            },
        ],
        sortOrder: 15,
    },
    {
        missionId: 'team-7-fights-as-a-team',
        title: 'Team 7 Fights as a Team',
        level_requirement: 21,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'hatake-kakashi',
        reward_character_name: 'Hatake Kakashi',
        reward: 'Unlock Hatake Kakashi.',
        image: 'ingamebgexample.png',
        imageAlt: 'Team 7 Fights as a Team mission artwork',
        characterName: 'Uzumaki Naruto',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Uzumaki Naruto portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak_any',
                character_ids: ['uzumaki-naruto', 'uchiha-sasuke', 'haruno-sakura'],
                character_name: 'any Team 7 (old era) member',
                wins: 4,
            },
            {
                type: 'win_matches_any',
                character_ids: ['uzumaki-naruto', 'uchiha-sasuke', 'haruno-sakura'],
                character_name: 'any Team 7 (old era) member',
                wins: 15,
            },
        ],
        sortOrder: 16,
    },
    {
        missionId: 'team-8-scouting-at-its-best',
        title: 'Team 8 Scouting at its Best',
        level_requirement: 21,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'yuhi-kurenai',
        reward_character_name: 'Yuhi Kurenai',
        reward: 'Unlock Yuhi Kurenai.',
        image: 'ingamebgexample2.png',
        imageAlt: 'Team 8 Scouting at its Best mission artwork',
        characterName: 'Inuzuka Kiba',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Inuzuka Kiba portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak_any',
                character_ids: ['inuzuka-kiba', 'hyuuga-hinata', 'aburame-shino'],
                character_name: 'any Team 8 member',
                wins: 4,
            },
            {
                type: 'win_matches_any',
                character_ids: ['inuzuka-kiba', 'hyuuga-hinata', 'aburame-shino'],
                character_name: 'any Team 8 member',
                wins: 15,
            },
        ],
        sortOrder: 17,
    },
    {
        missionId: 'team-10-proves-its-worth',
        title: 'Team 10 Proves Its Worth',
        level_requirement: 21,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'sarutobi-asuma',
        reward_character_name: 'Sarutobi Asuma',
        reward: 'Unlock Sarutobi Asuma.',
        image: 'ingamebgexample.png',
        imageAlt: 'Team 10 Proves Its Worth mission artwork',
        characterName: 'Nara Shikamaru',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Nara Shikamaru portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak_any',
                character_ids: ['nara-shikamaru', 'yamanaka-ino', 'akimichi-chouji'],
                character_name: 'any Team 10 (old era) member',
                wins: 4,
            },
            {
                type: 'win_matches_any',
                character_ids: ['nara-shikamaru', 'yamanaka-ino', 'akimichi-chouji'],
                character_name: 'any Team 10 (old era) member',
                wins: 15,
            },
        ],
        sortOrder: 18,
    },
    {
        missionId: 'team-9-the-best-taijutsu-team',
        title: 'Team 9 the Best Taijutsu Team',
        level_requirement: 21,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'maito-gai',
        reward_character_name: 'Maito Gai',
        reward: 'Unlock Maito Gai.',
        image: 'ingamebgexample2.png',
        imageAlt: 'Team 9 the Best Taijutsu Team mission artwork',
        characterName: 'Rock Lee',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Rock Lee portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak_any',
                character_ids: ['rock-lee', 'neji-hyuuga', 'tenten'],
                character_name: 'any Team 9 member',
                wins: 4,
            },
            {
                type: 'win_matches_any',
                character_ids: ['rock-lee', 'neji-hyuuga', 'tenten'],
                character_name: 'any Team 9 member',
                wins: 15,
            },
        ],
        sortOrder: 19,
    },
    {
        missionId: 'sand-siblings-at-war',
        title: 'Sand Siblings at War',
        level_requirement: 21,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'baki',
        reward_character_name: 'Baki',
        reward: 'Unlock Baki.',
        image: 'ingamebgexample.png',
        imageAlt: 'Sand Siblings at War mission artwork',
        characterName: 'Gaara',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Gaara portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak_any',
                character_ids: ['gaara-of-the-desert', 'kankuro', 'temari'],
                character_name: 'any member of Team Baki',
                wins: 4,
            },
            {
                type: 'win_matches_any',
                character_ids: ['gaara-of-the-desert', 'kankuro', 'temari'],
                character_name: 'any member of Team Baki',
                wins: 15,
            },
        ],
        sortOrder: 20,
    },
    {
        missionId: 'survival',
        title: 'Survival',
        level_requirement: 16,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'yakushi-kabuto',
        reward_character_name: 'Yakushi Kabuto',
        reward: 'Unlock Yakushi Kabuto.',
        image: 'ingamebgexample2.png',
        imageAlt: 'Survival mission artwork',
        characterName: 'Yakushi Kabuto',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Yakushi Kabuto portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak',
                character_id: 'yakushi-kabuto',
                character_name: 'Young Kabuto',
                wins: 4,
            },
            {
                type: 'win_streak_any',
                character_ids: ['akadou-yoroi', 'tsurugi-misumi'],
                character_name: 'Yoroi or Misumi',
                wins: 4,
            },
            {
                type: 'win_matches_any',
                character_ids: [
                    'dosu-kinuta',
                    'tsuchi-kin',
                    'zaku-abumi',
                    'jiroubou',
                    'kidoumaru',
                    'tayuya',
                    'sakon-and-ukon',
                    'kimimaro',
                ],
                character_name: 'any Sound Ninja',
                wins: 15,
            },
        ],
        sortOrder: 21,
    },
    {
        missionId: 'disciples-of-the-slug',
        title: 'Disciples of the Slug',
        level_requirement: 26,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'tsunade',
        reward_character_name: 'Tsunade',
        reward: 'Unlock Tsunade.',
        image: 'ingamebgexample.png',
        imageAlt: 'Disciples of the Slug mission artwork',
        characterName: 'Haruno Sakura',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Haruno Sakura portrait',
        requirements: [],
        goals: [
            {
                type: 'win_matches',
                character_id: 'haruno-sakura',
                character_name: 'Sakura',
                wins: 15,
            },
            {
                type: 'win_matches',
                character_id: 'shizune',
                character_name: 'Shizune',
                wins: 20,
            },
        ],
        sortOrder: 22,
    },
    {
        missionId: 'disciples-of-the-toad',
        title: 'Disciples of the Toad',
        level_requirement: 26,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'jiraiya',
        reward_character_name: 'Jiraiya',
        reward: 'Unlock Jiraiya.',
        image: 'ingamebgexample2.png',
        imageAlt: 'Disciples of the Toad mission artwork',
        characterName: 'Uzumaki Naruto',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Uzumaki Naruto portrait',
        requirements: [],
        goals: [
            {
                type: 'win_matches',
                character_id: 'uzumaki-naruto',
                character_name: 'Naruto',
                wins: 15,
            },
            {
                type: 'win_matches',
                character_id: 'hatake-kakashi',
                character_name: 'Kakashi',
                wins: 20,
            },
        ],
        sortOrder: 23,
    },
    {
        missionId: 'disciples-of-the-snake',
        title: 'Disciples of the Snake',
        level_requirement: 26,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'orochimaru',
        reward_character_name: 'Orochimaru',
        reward: 'Unlock Orochimaru.',
        image: 'ingamebgexample.png',
        imageAlt: 'Disciples of the Snake mission artwork',
        characterName: 'Uchiha Sasuke',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Uchiha Sasuke portrait',
        requirements: [],
        goals: [
            {
                type: 'win_matches',
                character_id: 'uchiha-sasuke',
                character_name: 'Sasuke',
                wins: 15,
            },
            {
                type: 'win_matches',
                character_id: 'yakushi-kabuto',
                character_name: 'Kabuto',
                wins: 20,
            },
        ],
        sortOrder: 24,
    },
    {
        missionId: 'hidden-hunter',
        title: 'The Hidden Hunter',
        level_requirement: 6,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'haku',
        reward_character_name: 'Haku',
        reward: 'Unlock Haku.',
        image: 'ingamebgexample.png',
        imageAlt: 'The Hidden Hunter mission artwork',
        characterName: 'Haku',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Haku portrait',
        requirements: [],
        goals: [
            {
                type: 'win_matches',
                character_id: 'uzumaki-naruto',
                character_name: 'Naruto',
                wins: 8,
            },
        ],
        sortOrder: 25,
    },
    {
        missionId: 'devotion',
        title: 'Devotion',
        level_requirement: 16,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'momochi-zabuza',
        reward_character_name: 'Momochi Zabuza',
        reward: 'Unlock Momochi Zabuza.',
        image: 'ingamebgexample2.png',
        imageAlt: 'Devotion mission artwork',
        characterName: 'Momochi Zabuza',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Momochi Zabuza portrait',
        requirements: [],
        goals: [
            {
                type: 'win_matches',
                character_id: 'uchiha-sasuke',
                character_name: 'Sasuke',
                wins: 10,
            },
        ],
        sortOrder: 26,
    },
    {
        missionId: 'mist-ascendant',
        title: 'Mist Ascendant',
        level_requirement: 1,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'demon-brothers',
        reward_character_name: 'Demon Brothers',
        reward: 'Unlock the Demon Brothers.',
        image: 'ingamebgexample.png',
        imageAlt: 'Mist Ascendant mission artwork',
        characterName: 'Demon Brothers',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Demon Brothers portrait',
        requirements: [],
        goals: [
            {
                type: 'win_matches',
                character_id: 'uzumaki-naruto',
                character_name: 'Naruto',
                wins: 5,
            },
        ],
        sortOrder: 27,
    },
    {
        missionId: 'duty-of-a-sensei',
        title: 'Duty of a Sensei',
        level_requirement: 1,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'umino-iruka',
        reward_character_name: 'Umino Iruka',
        reward: 'Unlock Umino Iruka.',
        image: 'ingamebgexample2.png',
        imageAlt: 'Duty of a Sensei mission artwork',
        characterName: 'Umino Iruka',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Umino Iruka portrait',
        requirements: [],
        goals: [
            {
                type: 'win_matches',
                character_id: 'uzumaki-naruto',
                character_name: 'Naruto',
                wins: 5,
            },
        ],
        sortOrder: 28,
    },
    {
        missionId: 'a-dishonored-shinobi',
        title: 'A Dishonored Shinobi',
        level_requirement: 1,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'mizuki',
        reward_character_name: 'Mizuki',
        reward: 'Unlock Mizuki.',
        image: 'ingamebgexample.png',
        imageAlt: 'A Dishonored Shinobi mission artwork',
        characterName: 'Mizuki',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Mizuki portrait',
        requirements: [],
        goals: [
            {
                type: 'win_matches',
                character_id: 'uzumaki-naruto',
                character_name: 'Naruto',
                wins: 5,
            },
        ],
        sortOrder: 29,
    },
    {
        missionId: 'the-god-of-the-shinobi',
        title: 'The God of the Shinobi',
        level_requirement: 31,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'sarutobi-hiruzen',
        reward_character_name: 'Sarutobi Hiruzen',
        reward: 'Unlock Sarutobi Hiruzen.',
        image: 'ingamebgexample.png',
        imageAlt: 'The God of the Shinobi mission artwork',
        characterName: 'Sarutobi Hiruzen',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Sarutobi Hiruzen portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak',
                character_id: 'jiraiya',
                character_name: 'Jiraiya',
                wins: 5,
            },
            {
                type: 'win_streak',
                character_id: 'tsunade',
                character_name: 'Tsunade',
                wins: 5,
            },
            {
                type: 'win_streak',
                character_id: 'orochimaru',
                character_name: 'Orochimaru',
                wins: 5,
            },
        ],
        sortOrder: 30,
    },
    {
        missionId: 'the-resurrection-of-the-first',
        title: 'The Resurrection of the First',
        level_requirement: 31,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'edo-tensei-hashirama',
        reward_character_name: 'Edo Tensei Hashirama',
        reward: 'Unlock Edo Tensei Hashirama.',
        image: 'ingamebgexample2.png',
        imageAlt: 'The Resurrection of the First mission artwork',
        characterName: 'Edo Tensei Hashirama',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Edo Tensei Hashirama portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak',
                character_id: 'orochimaru',
                character_name: 'Orochimaru',
                wins: 5,
            },
            {
                type: 'win_streak',
                character_id: 'sarutobi-hiruzen',
                character_name: 'Hiruzen',
                wins: 5,
            },
        ],
        sortOrder: 31,
    },
    {
        missionId: 'the-resurrection-of-the-second',
        title: 'The Resurrection of the Second',
        level_requirement: 31,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'edo-tensei-tobirama',
        reward_character_name: 'Edo Tensei Tobirama',
        reward: 'Unlock Edo Tensei Tobirama.',
        image: 'ingamebgexample.png',
        imageAlt: 'The Resurrection of the Second mission artwork',
        characterName: 'Edo Tensei Tobirama',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Edo Tensei Tobirama portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak',
                character_id: 'edo-tensei-hashirama',
                character_name: 'Hashirama',
                wins: 5,
            },
        ],
        sortOrder: 32,
    },
    {
        missionId: 'the-rise-of-a-jinchuuriki',
        title: 'The Rise of a Jinchuuriki',
        level_requirement: 16,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'kyuubi-naruto',
        reward_character_name: 'Kyuubi Naruto',
        reward: 'Unlock Kyuubi Naruto.',
        image: 'ingamebgexample2.png',
        imageAlt: 'The Rise of a Jinchuuriki mission artwork',
        characterName: 'Kyuubi Naruto',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Kyuubi Naruto portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak',
                character_id: 'uzumaki-naruto',
                character_name: 'Naruto',
                wins: 4,
            },
            {
                type: 'win_matches',
                character_id: 'uzumaki-naruto',
                character_name: 'Naruto',
                wins: 15,
            },
            {
                type: 'win_matches',
                character_id: 'uchiha-sasuke',
                character_name: 'Sasuke',
                wins: 20,
            },
        ],
        sortOrder: 33,
    },
    {
        missionId: 'dark-enhancing',
        title: 'Dark Enhancing',
        level_requirement: 6,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'cursed-seal-lv1-sasuke',
        reward_character_name: 'Cursed Seal Lv1 Sasuke',
        reward: 'Unlock Cursed Seal Lv1 Sasuke.',
        image: 'ingamebgexample.png',
        imageAlt: 'Dark Enhancing mission artwork',
        characterName: 'Uchiha Sasuke',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Uchiha Sasuke portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak',
                character_id: 'uchiha-sasuke',
                character_name: 'Sasuke',
                wins: 3,
            },
            {
                type: 'win_matches_any',
                character_ids: ['dosu-kinuta', 'tsuchi-kin', 'zaku-abumi'],
                character_name: 'any Sound Genin (Dosu, Kin, Zaku)',
                wins: 15,
            },
        ],
        sortOrder: 34,
    },
    {
        missionId: 'descent-into-darkness',
        title: 'Descent into Darkness',
        level_requirement: 11,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'cursed-seal-sasuke',
        reward_character_name: 'Cursed Seal Sasuke',
        reward: 'Unlock Cursed Seal Sasuke.',
        image: 'ingamebgexample2.png',
        imageAlt: 'Descent into Darkness mission artwork',
        characterName: 'Uchiha Sasuke',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Uchiha Sasuke portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak',
                character_id: 'uchiha-sasuke',
                character_name: 'Sasuke',
                wins: 4,
            },
            {
                type: 'win_matches',
                character_id: 'uchiha-sasuke',
                character_name: 'Sasuke',
                wins: 15,
            },
            {
                type: 'win_matches',
                character_id: 'uzumaki-naruto',
                character_name: 'Naruto',
                wins: 20,
            },
        ],
        sortOrder: 35,
    },
    {
        missionId: 'chouji-awakens',
        title: 'Chouji Awakens',
        level_requirement: 6,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'butterfly-chouji',
        reward_character_name: 'Butterfly Chouji',
        reward: 'Unlock Butterfly Chouji.',
        image: 'ingamebgexample.png',
        imageAlt: 'Chouji Awakens mission artwork',
        characterName: 'Akimichi Chouji',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Akimichi Chouji portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak',
                character_id: 'akimichi-chouji',
                character_name: 'Chouji',
                wins: 3,
            },
            {
                type: 'win_matches',
                character_id: 'akimichi-chouji',
                character_name: 'Chouji',
                wins: 15,
            },
        ],
        sortOrder: 36,
    },
    {
        missionId: 'the-drunken-master',
        title: 'The Drunken Master',
        level_requirement: 11,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'drunken-lee',
        reward_character_name: 'Drunken Lee',
        reward: 'Unlock Drunken Lee.',
        image: 'ingamebgexample2.png',
        imageAlt: 'The Drunken Master mission artwork',
        characterName: 'Rock Lee',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Rock Lee portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak',
                character_id: 'rock-lee',
                character_name: 'Rock Lee',
                wins: 3,
            },
            {
                type: 'win_matches',
                character_id: 'rock-lee',
                character_name: 'Rock Lee',
                wins: 10,
            },
        ],
        sortOrder: 37,
    },
    {
        missionId: 'the-beast-inside',
        title: 'The Beast Inside',
        level_requirement: 16,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'shukaku-gaara',
        reward_character_name: 'Shukaku Gaara',
        reward: 'Unlock Shukaku Gaara.',
        image: 'ingamebgexample.png',
        imageAlt: 'The Beast Inside mission artwork',
        characterName: 'Gaara',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Gaara portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak',
                character_id: 'gaara-of-the-desert',
                character_name: 'Gaara',
                wins: 4,
            },
            {
                type: 'win_matches',
                character_id: 'gaara-of-the-desert',
                character_name: 'Gaara',
                wins: 15,
            },
        ],
        sortOrder: 38,
    },
    {
        missionId: 'the-redemption-of-gaara',
        title: 'The Redemption of Gaara',
        level_requirement: 11,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'rehabilitated-gaara',
        reward_character_name: 'Rehabilitated Gaara',
        reward: 'Unlock Rehabilitated Gaara.',
        image: 'ingamebgexample.png',
        imageAlt: 'The Redemption of Gaara mission artwork',
        characterName: 'Gaara',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Gaara portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak',
                character_id: 'gaara-of-the-desert',
                character_name: 'Gaara',
                wins: 4,
            },
            {
                type: 'win_matches',
                character_id: 'gaara-of-the-desert',
                character_name: 'Gaara',
                wins: 15,
            },
        ],
        sortOrder: 39,
    },
    {
        missionId: 's-rank-criminal-kisame',
        title: 'S Rank Criminal Kisame',
        level_requirement: 21,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'hoshigaki-kisame',
        reward_character_name: 'Hoshigaki Kisame',
        reward: 'Unlock Hoshigaki Kisame.',
        image: 'ingamebgexample2.png',
        imageAlt: 'S Rank Criminal Kisame mission artwork',
        characterName: 'Hoshigaki Kisame',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Hoshigaki Kisame portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak',
                character_id: 'maito-gai',
                character_name: 'Gai',
                wins: 4,
            },
            {
                type: 'win_matches',
                character_id: 'maito-gai',
                character_name: 'Gai',
                wins: 20,
            },
        ],
        sortOrder: 40,
    },
    {
        missionId: 's-rank-criminal-itachi',
        title: 'S Rank Criminal Itachi',
        level_requirement: 21,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'uchiha-itachi',
        reward_character_name: 'Uchiha Itachi',
        reward: 'Unlock Uchiha Itachi.',
        image: 'ingamebgexample.png',
        imageAlt: 'S Rank Criminal Itachi mission artwork',
        characterName: 'Uchiha Itachi',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Uchiha Itachi portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak',
                character_id: 'uchiha-sasuke',
                character_name: 'Sasuke',
                wins: 3,
            },
            {
                type: 'win_streak',
                character_id: 'hatake-kakashi',
                character_name: 'Kakashi',
                wins: 4,
            },
            {
                type: 'win_matches',
                character_id: 'hatake-kakashi',
                character_name: 'Kakashi',
                wins: 20,
            },
        ],
        sortOrder: 41,
    },
    {
        missionId: 'the-theft-plan',
        title: 'The Theft Plan',
        level_requirement: 16,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'rokushou-aoi',
        reward_character_name: 'Rokushou Aoi',
        reward: 'Unlock Rokushou Aoi.',
        image: 'ingamebgexample2.png',
        imageAlt: 'The Theft Plan mission artwork',
        characterName: 'Rokushou Aoi',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Rokushou Aoi portrait',
        requirements: [],
        goals: [
            {
                type: 'win_matches_any',
                character_ids: ['rokushou-aoi'],
                group_label: 'any Rain Ninja',
                wins: 25,
            },
        ],
        sortOrder: 42,
    },
    {
        missionId: 'thunder-of-the-hidden-mist',
        title: 'Thunder of the Hidden Mist',
        level_requirement: 21,
        mode_restriction: { allowed_modes: ['quick', 'ladder'] },
        reward_character: 'kurosuki-raiga',
        reward_character_name: 'Kurosuki Raiga',
        reward: 'Unlock Kurosuki Raiga.',
        image: 'ingamebgexample.png',
        imageAlt: 'Thunder of the Hidden Mist mission artwork',
        characterName: 'Kurosuki Raiga',
        portrait: 'deadcharacter.png',
        portraitAlt: 'Kurosuki Raiga portrait',
        requirements: [],
        goals: [
            {
                type: 'win_streak_any',
                character_ids: ['momochi-zabuza', 'hoshigaki-kisame'],
                group_label: 'any member of the Seven Swordsmen of the Mist',
                wins: 5,
            },
            {
                type: 'win_matches_any',
                character_ids: ['hatake-kakashi', 'uchiha-sasuke'],
                group_label: 'any character with at least one lightning-related skill (in-game)',
                wins: 30,
            },
        ],
        sortOrder: 43,
    },
];

const getStoryPortrait = (characterId, fallback = '') => {
    const normalized = String(characterId || '').trim().toLowerCase();
    const character = (Array.isArray(charactersData) ? charactersData : []).find(
        (entry) => String(entry?.characterId || '').trim().toLowerCase() === normalized
    );
    return typeof character?.facePicture === 'string' && character.facePicture.trim()
        ? character.facePicture.trim()
        : fallback;
};

const STORY_PORTRAIT_NARUTO = getStoryPortrait('uzumaki-naruto', 'https://i.imgur.com/jp3OIOA.png');
const STORY_PORTRAIT_IRUKA = getStoryPortrait('umino-iruka', 'https://i.imgur.com/snz8zD4.png');
const STORY_PORTRAIT_MIZUKI = getStoryPortrait('mizuki', 'https://i.imgur.com/NZS59L7.png');
const STORY_PORTRAIT_SASUKE = getStoryPortrait('uchiha-sasuke');
const STORY_PORTRAIT_SAKURA = getStoryPortrait('haruno-sakura');
const STORY_PORTRAIT_KAKASHI = getStoryPortrait('hatake-kakashi');
const STORY_PORTRAIT_ZABUZA = getStoryPortrait('momochi-zabuza');
const STORY_PORTRAIT_HAKU = getStoryPortrait('haku');
const STORY_PORTRAIT_OROCHIMARU = getStoryPortrait('orochimaru');
const STORY_PORTRAIT_SHIORE_OROCHIMARU = getStoryPortrait('shiore-orochimaru');
const STORY_PORTRAIT_HIRUZEN = getStoryPortrait('sarutobi-hiruzen');
const STORY_PORTRAIT_GAARA = getStoryPortrait('gaara-of-the-desert');
const STORY_PORTRAIT_JIRAIYA = getStoryPortrait('jiraiya');
const STORY_PORTRAIT_TSUNADE = getStoryPortrait('tsunade');
const STORY_PORTRAIT_ITACHI = getStoryPortrait('uchiha-itachi');
const STORY_PORTRAIT_KISAME = getStoryPortrait('hoshigaki-kisame');
const STORY_PORTRAIT_AOI = getStoryPortrait('rokushou-aoi');
const STORY_PORTRAIT_SHIKAMARU = getStoryPortrait('nara-shikamaru');

const PART_ONE_STORY_PLAN = [
    {
        chapterId: 'chapter-1',
        title: 'Chapter 1: The Nine-Tails Vessel',
        nodeId: 'story-001-nine-tails-vessel',
        nodeTitle: 'The Forbidden Scroll',
        arcTitle: 'Prologue',
        episodeRange: 'Episode 1',
        summary: 'Naruto is introduced as the village outcast and the jinchuriki of the Nine-Tails. Mizuki tricks him into stealing the Scroll of Seals, but Iruka protects him.',
        playerTeam: ['uzumaki-naruto', 'umino-iruka'],
        enemyTeam: ['mizuki'],
        enemyDisplayName: 'Mizuki',
        reward_character: 'umino-iruka',
        rewardText: 'Unlock Umino Iruka.',
    },
    {
        chapterId: 'chapter-2',
        title: 'Chapter 2: Team 7 Begins',
        nodeId: 'story-002-team-7-begins',
        nodeTitle: 'The Bell Test',
        arcTitle: 'Prologue',
        episodeRange: 'Episodes 2-5',
        summary: 'Naruto, Sasuke, and Sakura are placed under Kakashi. The bell test teaches them that teamwork matters more than individual talent.',
        playerTeam: ['uzumaki-naruto', 'uchiha-sasuke', 'haruno-sakura'],
        enemyTeam: ['hatake-kakashi'],
        enemyDisplayName: 'Kakashi',
        rewardText: 'Story progression.',
    },
    {
        chapterId: 'chapter-3',
        title: 'Chapter 3: The Land of Waves',
        nodeId: 'story-003-land-of-waves',
        nodeTitle: 'Mist on the Road',
        arcTitle: 'Land of Waves',
        episodeRange: 'Episodes 6-12',
        summary: 'Team 7 first real mission turns dangerous when enemy ninja attack. Zabuza appears and Kakashi reveals the Sharingan.',
        playerTeam: ['uzumaki-naruto', 'uchiha-sasuke', 'hatake-kakashi'],
        enemyTeam: ['demon-brothers', 'momochi-zabuza'],
        enemyDisplayName: 'Zabuza and the Demon Brothers',
        reward_character: 'demon-brothers',
        rewardText: 'Unlock Demon Brothers.',
    },
    {
        chapterId: 'chapter-4',
        title: 'Chapter 4: The Bridge of Tears',
        nodeId: 'story-004-bridge-of-tears',
        nodeTitle: 'Haku and Zabuza',
        arcTitle: 'Land of Waves',
        episodeRange: 'Episodes 13-19',
        summary: 'Haku fights Naruto and Sasuke on the bridge. Sasuke awakens his Sharingan, Naruto taps Nine-Tails chakra, and Zabuza humanity resurfaces.',
        playerTeam: ['uzumaki-naruto', 'uchiha-sasuke', 'hatake-kakashi'],
        enemyTeam: ['haku', 'momochi-zabuza'],
        enemyDisplayName: 'Haku and Zabuza',
        reward_character: 'haku',
        rewardText: 'Unlock Haku.',
    },
    {
        chapterId: 'chapter-5',
        title: 'Chapter 5: The Chunin Exams Begin',
        nodeId: 'story-005-chunin-exams-begin',
        nodeTitle: 'Rookies and Rivals',
        arcTitle: 'Chunin Exams',
        episodeRange: 'Episodes 20-27',
        summary: 'The Rookie Nine, Team Guy, Sand Siblings, and Sound Genin enter the exam. This chapter introduces story progression using default characters.',
        playerTeam: ['uzumaki-naruto', 'nara-shikamaru', 'rock-lee'],
        enemyTeam: ['dosu-kinuta', 'zaku-abumi', 'tsuchi-kin'],
        enemyDisplayName: 'Sound Genin',
        rewardText: 'Story progression.',
    },
    {
        chapterId: 'chapter-6',
        title: 'Chapter 6: The Forest of Death',
        nodeId: 'story-006-forest-of-death',
        nodeTitle: 'The Curse Mark',
        arcTitle: 'Chunin Exams',
        episodeRange: 'Episodes 27-37',
        summary: 'Orochimaru attacks Team 7, gives Sasuke the Cursed Seal, and Sakura defends her unconscious teammates against the Sound Genin.',
        playerTeam: ['haruno-sakura', 'uchiha-sasuke', 'uzumaki-naruto'],
        enemyTeam: ['shiore-orochimaru', 'dosu-kinuta', 'zaku-abumi'],
        enemyDisplayName: 'Shiore Orochimaru and Sound Genin',
        reward_character: 'shiore-orochimaru',
        rewardText: 'Unlock Shiore Orochimaru.',
    },
    {
        chapterId: 'chapter-7',
        title: 'Chapter 7: Preliminary Battles',
        nodeId: 'story-007-preliminary-battles',
        nodeTitle: 'The Arena Narrows',
        arcTitle: 'Chunin Exams',
        episodeRange: 'Episodes 38-51',
        summary: 'The preliminaries spotlight Sakura, Ino, Naruto, Kiba, Hinata, Neji, Shikamaru, Lee, and Gaara.',
        playerTeam: ['uzumaki-naruto', 'hyuuga-hinata', 'rock-lee'],
        enemyTeam: ['inuzuka-kiba', 'neji-hyuuga', 'gaara-of-the-desert'],
        enemyDisplayName: 'Exam Finalists',
        rewardText: 'Story progression.',
    },
    {
        chapterId: 'chapter-8',
        title: 'Chapter 8: Finals Under Fire',
        nodeId: 'story-008-finals-under-fire',
        nodeTitle: 'The Finals Collapse',
        arcTitle: 'Chunin Exams',
        episodeRange: 'Episodes 52-67',
        summary: 'Naruto trains with Jiraiya, learns to better access Nine-Tails chakra, defeats Neji, and the finals collapse when the invasion begins.',
        playerTeam: ['uzumaki-naruto', 'jiraiya', 'shikamaru'],
        enemyTeam: ['neji-hyuuga', 'gaara-of-the-desert', 'baki'],
        enemyDisplayName: 'Finals Opposition',
        reward_character: 'jiraiya',
        rewardText: 'Unlock Jiraiya.',
    },
    {
        chapterId: 'chapter-9',
        title: 'Chapter 9: Konoha Crush',
        nodeId: 'story-009-konoha-crush',
        nodeTitle: 'The Third Hokage Stands',
        arcTitle: 'Konoha Crush',
        episodeRange: 'Episodes 68-80',
        summary: 'Orochimaru launches his attack on Konoha. Hiruzen battles Orochimaru and the reanimated First and Second Hokage.',
        playerTeam: ['sarutobi-hiruzen'],
        enemyTeam: ['orochimaru', 'edo-tensei-hashirama', 'edo-tensei-tobirama'],
        enemyDisplayName: 'Orochimaru and Edo Tensei',
        reward_character: 'sarutobi-hiruzen',
        rewardText: 'Unlock Sarutobi Hiruzen.',
    },
    {
        chapterId: 'chapter-10',
        title: 'Chapter 10: Naruto vs Gaara',
        nodeId: 'story-010-naruto-vs-gaara',
        nodeTitle: 'Lonely Monsters',
        arcTitle: 'Konoha Crush',
        episodeRange: 'Episodes 74-80',
        summary: 'Naruto pursues Gaara, sees the lonely monster he could have become, and reaches Gaara through empathy and strength.',
        playerTeam: ['uzumaki-naruto', 'haruno-sakura', 'uchiha-sasuke'],
        enemyTeam: ['shukaku-gaara'],
        enemyDisplayName: 'Shukaku Gaara',
        reward_character: 'shukaku-gaara',
        rewardText: 'Unlock Shukaku Gaara.',
    },
    {
        chapterId: 'chapter-11',
        title: 'Chapter 11: Akatsuki Appears',
        nodeId: 'story-011-akatsuki-appears',
        nodeTitle: 'Itachi Returns',
        arcTitle: 'Search for Tsunade',
        episodeRange: 'Episodes 81-85',
        summary: 'Itachi and Kisame enter Konoha looking for Naruto. Sasuke is humiliated, Kakashi is overwhelmed, and a larger threat is revealed.',
        playerTeam: ['hatake-kakashi', 'uchiha-sasuke', 'sarutobi-asuma'],
        enemyTeam: ['uchiha-itachi', 'hoshigaki-kisame'],
        enemyDisplayName: 'Itachi and Kisame',
        reward_character: 'hoshigaki-kisame',
        rewardText: 'Unlock Hoshigaki Kisame.',
    },
    {
        chapterId: 'chapter-12',
        title: 'Chapter 12: The Fifth Hokage',
        nodeId: 'story-012-fifth-hokage',
        nodeTitle: 'The Sannin Deadlock',
        arcTitle: 'Search for Tsunade',
        episodeRange: 'Episodes 86-100',
        summary: 'Naruto trains the Rasengan while Jiraiya searches for Tsunade. Orochimaru also seeks her out, leading to the Sannin confrontation.',
        playerTeam: ['uzumaki-naruto', 'jiraiya', 'tsunade'],
        enemyTeam: ['orochimaru', 'yakushi-kabuto'],
        enemyDisplayName: 'Orochimaru and Kabuto',
        reward_character: 'tsunade',
        rewardText: 'Unlock Tsunade.',
    },
    {
        chapterId: 'chapter-13',
        title: 'Chapter 13: Land of Tea Escort',
        nodeId: 'story-013-land-of-tea-escort',
        nodeTitle: 'The Thunder God Sword',
        arcTitle: 'Land of Tea',
        episodeRange: 'Episodes 102-106',
        summary: 'Team 7 protects Idate during a dangerous race. Aoi, a rogue Leaf ninja, becomes the main enemy.',
        playerTeam: ['uzumaki-naruto', 'uchiha-sasuke', 'haruno-sakura'],
        enemyTeam: ['rokushou-aoi'],
        enemyDisplayName: 'Rokushou Aoi',
        reward_character: 'rokushou-aoi',
        rewardText: 'Unlock Rokushou Aoi.',
    },
    {
        chapterId: 'chapter-14',
        title: 'Chapter 14: The Rooftop Clash',
        nodeId: 'story-014-rooftop-clash',
        nodeTitle: 'Rasengan and Chidori',
        arcTitle: 'Sasuke Recovery',
        episodeRange: 'Episodes 107-111',
        summary: 'Sasuke jealousy and trauma boil over. Naruto and Sasuke clash, Kakashi stops them, and the Sound Four tempt Sasuke away.',
        playerTeam: ['uzumaki-naruto', 'hatake-kakashi', 'haruno-sakura'],
        enemyTeam: ['cursed-seal-lv1-sasuke', 'sakon-and-ukon'],
        enemyDisplayName: 'Sasuke and the Sound Four',
        reward_character: 'cursed-seal-lv1-sasuke',
        rewardText: 'Unlock Cursed Seal Lv1 Sasuke.',
    },
    {
        chapterId: 'chapter-15',
        title: 'Chapter 15: The Retrieval Squad',
        nodeId: 'story-015-retrieval-squad',
        nodeTitle: 'Sound Four Gauntlet',
        arcTitle: 'Sasuke Recovery',
        episodeRange: 'Episodes 112-126',
        summary: 'Shikamaru leads Naruto, Neji, Chouji, and Kiba after Sasuke. Each member stays behind for a survival battle.',
        playerTeam: ['nara-shikamaru', 'neji-hyuuga', 'akimichi-chouji'],
        enemyTeam: ['jiroubou', 'kidoumaru', 'tayuya'],
        enemyDisplayName: 'Sound Four',
        reward_character: 'jiroubou',
        rewardText: 'Unlock Jiroubou.',
    },
    {
        chapterId: 'chapter-16',
        title: 'Chapter 16: Allied Sand Rescue',
        nodeId: 'story-016-allied-sand-rescue',
        nodeTitle: 'Changed Sand',
        arcTitle: 'Sasuke Recovery',
        episodeRange: 'Episodes 124-127',
        summary: 'The Sand Siblings return as allies. Kankuro, Temari, and Gaara save the Leaf Genin and show how much they have changed.',
        playerTeam: ['kankuro', 'temari', 'gaara-of-the-desert'],
        enemyTeam: ['sakon-and-ukon', 'tayuya', 'kimimaro'],
        enemyDisplayName: 'Sound Reinforcements',
        reward_character: 'rehabilitated-gaara',
        rewardText: 'Unlock Rehabilitated Gaara.',
    },
    {
        chapterId: 'chapter-17',
        title: 'Chapter 17: Valley of the End',
        nodeId: 'story-017-valley-of-the-end',
        nodeTitle: 'One Tail Against Curse Mark',
        arcTitle: 'Sasuke Recovery',
        episodeRange: 'Episodes 128-135',
        summary: 'Naruto catches Sasuke at the Valley of the End. Their friendship and rivalry erupt into the defining Part I battle.',
        playerTeam: ['kyuubi-naruto'],
        enemyTeam: ['cursed-seal-sasuke'],
        enemyDisplayName: 'Cursed Seal Sasuke',
        reward_character: 'cursed-seal-sasuke',
        rewardText: 'Unlock Cursed Seal Sasuke.',
    },
    {
        chapterId: 'chapter-18',
        title: 'Chapter 18: Departure',
        nodeId: 'story-018-departure',
        nodeTitle: 'The Promise Continues',
        arcTitle: 'End of Part I',
        episodeRange: 'Episode 220',
        summary: 'Naruto fails to bring Sasuke back, Sakura begins training under Tsunade, and Naruto leaves with Jiraiya to prepare for the road ahead.',
        playerTeam: ['uzumaki-naruto', 'haruno-sakura', 'jiraiya'],
        enemyTeam: ['orochimaru', 'yakushi-kabuto', 'cursed-seal-sasuke'],
        enemyDisplayName: 'The Road Ahead',
        reward_character: 'kyuubi-naruto',
        rewardText: 'Unlock Kyuubi Naruto.',
    },
];

const getPartOneStoryDialogue = (entry = {}) => {
    const naruto = STORY_PORTRAIT_NARUTO;
    const sasuke = STORY_PORTRAIT_SASUKE;
    const sakura = STORY_PORTRAIT_SAKURA;
    const kakashi = STORY_PORTRAIT_KAKASHI;
    const gaara = STORY_PORTRAIT_GAARA;
    const shikamaru = STORY_PORTRAIT_SHIKAMARU;
    const linesByNodeId = {
        'story-001-nine-tails-vessel': {
            intro: [
                { speaker: 'Mizuki', portrait: STORY_PORTRAIT_MIZUKI, text: 'Naruto, the village has lied to you long enough. Take the scroll and prove you deserve that headband.' },
                { speaker: 'Naruto', portrait: naruto, text: 'If this is my shot, I am not wasting it. I will master every jutsu in there!' },
                { speaker: 'Iruka', portrait: STORY_PORTRAIT_IRUKA, text: 'Naruto, stop! Mizuki is using you. That scroll is forbidden for a reason.' },
            ],
            win: [
                { speaker: 'Naruto', portrait: naruto, text: 'Multi Shadow Clone Jutsu!' },
                { speaker: 'Iruka', portrait: STORY_PORTRAIT_IRUKA, text: 'You protected what matters. Naruto, you pass.' },
            ],
            loss: [
                { speaker: 'Mizuki', portrait: STORY_PORTRAIT_MIZUKI, text: 'The scroll, the fox, the village... none of it matters if you are still this weak.' },
            ],
        },
        'story-002-team-7-begins': {
            intro: [
                { speaker: 'Kakashi', portrait: kakashi, text: 'Take these bells before noon. Anyone without one goes back to the academy.' },
                { speaker: 'Sasuke', portrait: sasuke, text: 'He is baiting us into fighting separately.' },
                { speaker: 'Naruto', portrait: naruto, text: 'Then we hit him together. That is what a squad does, right?' },
            ],
            win: [
                { speaker: 'Kakashi', portrait: kakashi, text: 'Those who abandon their comrades are worse than trash. Remember that.' },
            ],
            loss: [
                { speaker: 'Kakashi', portrait: kakashi, text: 'Three rookies, three separate plans. That is why you failed.' },
            ],
        },
        'story-003-land-of-waves': {
            intro: [
                { speaker: 'Zabuza', portrait: STORY_PORTRAIT_ZABUZA, text: 'Hand over the bridge builder and I may leave the brats breathing.' },
                { speaker: 'Kakashi', portrait: kakashi, text: 'Naruto, Sasuke, protect Tazuna. This is no longer a C-rank mission.' },
            ],
            win: [
                { speaker: 'Kakashi', portrait: kakashi, text: 'This is the world beyond the academy. Keep your guard up.' },
            ],
            loss: [
                { speaker: 'Zabuza', portrait: STORY_PORTRAIT_ZABUZA, text: 'Children playing ninja have no place on a battlefield.' },
            ],
        },
        'story-004-bridge-of-tears': {
            intro: [
                { speaker: 'Haku', portrait: STORY_PORTRAIT_HAKU, text: 'For Zabuza, I will become a weapon sharp enough to cut through you.' },
                { speaker: 'Sasuke', portrait: sasuke, text: 'Naruto, stay alive. I am starting to see his movements.' },
            ],
            win: [
                { speaker: 'Naruto', portrait: naruto, text: 'Haku fought for someone precious. Zabuza, did you ever see that?' },
                { speaker: 'Zabuza', portrait: STORY_PORTRAIT_ZABUZA, text: 'Say no more, kid.' },
            ],
            loss: [
                { speaker: 'Haku', portrait: STORY_PORTRAIT_HAKU, text: 'A shinobi who cannot protect their precious person cannot defeat me.' },
            ],
        },
        'story-005-chunin-exams-begin': {
            intro: [
                { speaker: 'Shikamaru', portrait: shikamaru, text: 'This exam is already troublesome. Too many teams are hiding what they can do.' },
                { speaker: 'Naruto', portrait: naruto, text: 'Good. Let them hide. I will beat them anyway.' },
            ],
            win: [
                { speaker: 'Shikamaru', portrait: shikamaru, text: 'Winning is nice. Surviving the next phase is the hard part.' },
            ],
            loss: [
                { speaker: 'Dosu', portrait: getStoryPortrait('dosu-kinuta'), text: 'Noise, pressure, panic. You rookies break easily.' },
            ],
        },
        'story-006-forest-of-death': {
            intro: [
                { speaker: 'Orochimaru', portrait: STORY_PORTRAIT_SHIORE_OROCHIMARU, text: 'Sasuke, your eyes deserve a stage larger than this village.' },
                { speaker: 'Sakura', portrait: sakura, text: 'Naruto and Sasuke cannot move. That means I stand here.' },
            ],
            win: [
                { speaker: 'Sakura', portrait: sakura, text: 'I was scared. I fought anyway.' },
            ],
            loss: [
                { speaker: 'Orochimaru', portrait: STORY_PORTRAIT_SHIORE_OROCHIMARU, text: 'Fear is honest. Power is what you do with it.' },
            ],
        },
        'story-007-preliminary-battles': {
            intro: [
                { speaker: 'Naruto', portrait: naruto, text: 'Kiba, Neji, Gaara... fine. I will climb over all of them.' },
                { speaker: 'Gaara', portrait: gaara, text: 'Then show me whether your life has weight.' },
            ],
            win: [
                { speaker: 'Naruto', portrait: naruto, text: 'Nobody gets to decide someone is a failure before the fight starts.' },
            ],
            loss: [
                { speaker: 'Gaara', portrait: gaara, text: 'Weakness exists to be crushed.' },
            ],
        },
        'story-008-finals-under-fire': {
            intro: [
                { speaker: 'Jiraiya', portrait: STORY_PORTRAIT_JIRAIYA, text: 'You want control over that chakra? Stop borrowing fear and start using will.' },
                { speaker: 'Naruto', portrait: naruto, text: 'Neji called destiny fixed. I am going to prove him wrong.' },
            ],
            win: [
                { speaker: 'Naruto', portrait: naruto, text: 'If destiny is a cage, I will break it open.' },
            ],
            loss: [
                { speaker: 'Baki', portrait: getStoryPortrait('baki'), text: 'The signal has been given. Konoha falls now.' },
            ],
        },
        'story-009-konoha-crush': {
            intro: [
                { speaker: 'Hiruzen', portrait: STORY_PORTRAIT_HIRUZEN, text: 'I failed to stop you once, Orochimaru. I will not fail this village again.' },
                { speaker: 'Orochimaru', portrait: STORY_PORTRAIT_OROCHIMARU, text: 'Then show me the strength of the professor before time takes the rest.' },
            ],
            win: [
                { speaker: 'Hiruzen', portrait: STORY_PORTRAIT_HIRUZEN, text: 'Even if I cannot take your life, I can take the hands you use to threaten Konoha.' },
            ],
            loss: [
                { speaker: 'Orochimaru', portrait: STORY_PORTRAIT_OROCHIMARU, text: 'Sentiment makes even legends slow.' },
            ],
        },
        'story-010-naruto-vs-gaara': {
            intro: [
                { speaker: 'Gaara', portrait: gaara, text: 'I exist by killing. That is the only proof I am alive.' },
                { speaker: 'Naruto', portrait: naruto, text: 'I know what being alone feels like. That is why I will stop you.' },
            ],
            win: [
                { speaker: 'Naruto', portrait: naruto, text: 'You do not have to stay alone, Gaara.' },
            ],
            loss: [
                { speaker: 'Gaara', portrait: gaara, text: 'Your bonds made you weak enough to lose them.' },
            ],
        },
        'story-011-akatsuki-appears': {
            intro: [
                { speaker: 'Itachi', portrait: STORY_PORTRAIT_ITACHI, text: 'We are here for the Nine-Tails. Do not interfere.' },
                { speaker: 'Sasuke', portrait: sasuke, text: 'Itachi... I have lived for this moment.' },
            ],
            win: [
                { speaker: 'Kakashi', portrait: kakashi, text: 'If this is Akatsuki, then Orochimaru was only one warning.' },
            ],
            loss: [
                { speaker: 'Itachi', portrait: STORY_PORTRAIT_ITACHI, text: 'Hatred alone does not close the distance between us, Sasuke.' },
            ],
        },
        'story-012-fifth-hokage': {
            intro: [
                { speaker: 'Tsunade', portrait: STORY_PORTRAIT_TSUNADE, text: 'The title of Hokage is not a joke. It is a promise paid for in blood.' },
                { speaker: 'Naruto', portrait: naruto, text: 'Then watch me protect that promise with the Rasengan!' },
            ],
            win: [
                { speaker: 'Tsunade', portrait: STORY_PORTRAIT_TSUNADE, text: 'Fine, brat. I will become the Fifth Hokage.' },
            ],
            loss: [
                { speaker: 'Orochimaru', portrait: STORY_PORTRAIT_OROCHIMARU, text: 'Dreams are fragile things. I prefer bodies that can be replaced.' },
            ],
        },
        'story-013-land-of-tea-escort': {
            intro: [
                { speaker: 'Aoi', portrait: STORY_PORTRAIT_AOI, text: 'A shinobi who abandons his village learns one thing: loyalty is just another tool.' },
                { speaker: 'Naruto', portrait: naruto, text: 'No. People who trust you are not tools.' },
            ],
            win: [
                { speaker: 'Sasuke', portrait: sasuke, text: 'The mission is not over until Idate crosses the line.' },
            ],
            loss: [
                { speaker: 'Aoi', portrait: STORY_PORTRAIT_AOI, text: 'Run home, Leaf brats. The sword has already chosen the stronger shinobi.' },
            ],
        },
        'story-014-rooftop-clash': {
            intro: [
                { speaker: 'Sasuke', portrait: sasuke, text: 'How did you get so strong while I stayed behind?' },
                { speaker: 'Naruto', portrait: naruto, text: 'I am not your enemy, Sasuke!' },
            ],
            win: [
                { speaker: 'Kakashi', portrait: kakashi, text: 'Power without purpose will only hollow you out.' },
            ],
            loss: [
                { speaker: 'Sasuke', portrait: sasuke, text: 'If bonds make me hesitate, I will cut them away.' },
            ],
        },
        'story-015-retrieval-squad': {
            intro: [
                { speaker: 'Shikamaru', portrait: shikamaru, text: 'The plan is ugly, but it works: one of us stays, the rest keep moving.' },
                { speaker: 'Naruto', portrait: naruto, text: 'Then nobody loses. We bring Sasuke home together.' },
            ],
            win: [
                { speaker: 'Shikamaru', portrait: shikamaru, text: 'Every second they bought us matters. Keep running.' },
            ],
            loss: [
                { speaker: 'Tayuya', portrait: getStoryPortrait('tayuya'), text: 'Your little formation falls apart as soon as one piece breaks.' },
            ],
        },
        'story-016-allied-sand-rescue': {
            intro: [
                { speaker: 'Gaara', portrait: gaara, text: 'I once fought only for myself. Now I will protect someone else.' },
                { speaker: 'Temari', portrait: getStoryPortrait('temari'), text: 'Leaf owes us one after this.' },
            ],
            win: [
                { speaker: 'Gaara', portrait: gaara, text: 'Naruto showed me another path. This is where I start walking it.' },
            ],
            loss: [
                { speaker: 'Kimimaro', portrait: getStoryPortrait('kimimaro'), text: 'My body may fail, but my loyalty does not.' },
            ],
        },
        'story-017-valley-of-the-end': {
            intro: [
                { speaker: 'Sasuke', portrait: sasuke, text: 'I am going to Orochimaru. I need power, no matter what it costs.' },
                { speaker: 'Naruto', portrait: naruto, text: 'Then I will drag you back by force!' },
            ],
            win: [
                { speaker: 'Naruto', portrait: naruto, text: 'I said I would bring you back. I do not break promises.' },
            ],
            loss: [
                { speaker: 'Sasuke', portrait: sasuke, text: 'This is the path I chose. Do not follow me.' },
            ],
        },
        'story-018-departure': {
            intro: [
                { speaker: 'Sakura', portrait: sakura, text: 'Next time, I want to stand beside both of you instead of watching from behind.' },
                { speaker: 'Jiraiya', portrait: STORY_PORTRAIT_JIRAIYA, text: 'Then train. The next threats will not wait for you to catch up.' },
                { speaker: 'Naruto', portrait: naruto, text: 'Sasuke left, but I am not giving up. Not now. Not ever.' },
            ],
            win: [
                { speaker: 'Naruto', portrait: naruto, text: 'I will get stronger, and I will bring him home.' },
            ],
            loss: [
                { speaker: 'Jiraiya', portrait: STORY_PORTRAIT_JIRAIYA, text: 'Losing hurts. Good. Remember it, then turn it into discipline.' },
            ],
        },
    };
    const fallback = {
        intro: [{ speaker: entry.nodeTitle || 'Story', portrait: '', text: entry.summary || 'The story continues.' }],
        win: [{ speaker: 'Story', portrait: '', text: `${entry.nodeTitle || 'Battle'} cleared.` }],
        loss: [{ speaker: 'Story', portrait: '', text: 'Regroup, adjust your plan, and try again.' }],
    };
    return linesByNodeId[entry.nodeId] || fallback;
};

const buildPartOneStoryCatalog = () =>
    PART_ONE_STORY_PLAN.map((entry, index) => {
        const dialogue = getPartOneStoryDialogue(entry);
        return {
            chapterId: entry.chapterId,
            title: entry.title,
            sortOrder: index + 1,
            nodes: [
                {
                    nodeId: entry.nodeId,
                    title: entry.nodeTitle,
                    arcTitle: entry.arcTitle,
                    episodeRange: entry.episodeRange,
                    summary: entry.summary,
                    level_requirement: 1,
                    image: '',
                    imageAlt: `${entry.nodeTitle} story artwork`,
                    enemyTeam: entry.enemyTeam,
                    playerTeam: entry.playerTeam,
                    enemyDisplayName: entry.enemyDisplayName,
                    introDialogue: dialogue.intro,
                    outroDialogueWin: dialogue.win,
                    outroDialogueLoss: dialogue.loss,
                    reward_character: entry.reward_character || null,
                    rewardText: entry.rewardText || 'Story progression.',
                    requiresPreviousNode: index > 0,
                    sortOrder: 1,
                },
            ],
        };
    });

let mongoClient;
let usersCollection;
let matchesCollection;
let appStateCollection;
let newsPostsCollection;
const matchSocketRooms = new Map();

const activeMatchesMap = new Map();

async function getMatchActive(matchId) {
    if (activeMatchesMap.has(matchId)) return activeMatchesMap.get(matchId);
    const match = await matchesCollection.findOne({ matchId });
    if (match && match.status !== 'ended') {
        activeMatchesMap.set(matchId, match);
    }
    return match;
}

function updateMatchActive(matchId, updateObj) {
    const match = activeMatchesMap.get(matchId);
    if (match && updateObj.$set) {
        Object.assign(match, updateObj.$set);
        if (updateObj.$set.status === 'ended') {
            activeMatchesMap.delete(matchId);
        }
    }
    // Background save
    matchesCollection.updateOne({ matchId }, updateObj).catch(err => console.error("Active match save error:", err));
    return Promise.resolve({ matchedCount: 1, modifiedCount: 1 });
}

function insertMatchActive(matchObj) {
    if (matchObj && matchObj.matchId && matchObj.status !== 'ended') {
        activeMatchesMap.set(matchObj.matchId, matchObj);
    }
    return matchesCollection.insertOne(matchObj);
}

const wsConnections = new Set();
const wsServer = new WebSocketServer({ noServer: true });
let turnSweepTimer = null;
let sessionCacheSweepTimer = null;
const activeBattleBotTurns = new Set();
const scheduledBattleBotTurns = new Set();
const GAME_BOT_USERNAME_PREFIX = '__game_bot__:';
const GAME_BOT_DISPLAY_NAME = 'Rogue Ninja';
const TRAINING_DUMMY_DISPLAY_NAME = 'Training Dummy';

const DEFAULT_CLAN_RANK_NAMES = {
    clanLeader: 'Clan Leader',
    leader: 'Leader',
    captain: 'Captain',
    lieutenant: 'Lieutenant',
    member: 'Member',
    trial: 'Trial',
};

const LADDER_MAX_LEVEL = 80;
const LADDER_MAX_EXPERIENCE_POINTS = 120000;
const LADDER_WIN_RYO = 50;
const LADDER_LOSS_RYO = 15;
const QUICK_WIN_RYO = 25;
const QUICK_LOSS_RYO = 8;
const DEFAULT_LADDER_RANK_TIERS = [
    { minLevel: 76, rank: '#1 Shinobi', hatUrl: 'hats/hokage.png' },
    { minLevel: 71, rank: 'Sage of Six Paths', hatUrl: 'hats/hokage.png' },
    { minLevel: 66, rank: 'Otsutsuki', hatUrl: 'hats/sannin.png' },
    { minLevel: 61, rank: 'Edo Tensei', hatUrl: 'hats/akatsuki.png' },
    { minLevel: 56, rank: 'Kage', hatUrl: 'hats/kage.png' },
    { minLevel: 51, rank: 'Shadow Hokage', hatUrl: 'hats/hokage.png' },
    { minLevel: 46, rank: "Susano'o", hatUrl: 'hats/jinch.png' },
    { minLevel: 41, rank: 'Jinchurikki', hatUrl: 'hats/jinch.png' },
    { minLevel: 36, rank: 'Sannin', hatUrl: 'hats/sannin.png' },
    { minLevel: 31, rank: 'Akatsuki', hatUrl: 'hats/akatsuki.png' },
    { minLevel: 26, rank: 'Missing-nin', hatUrl: 'hats/missingnin.png' },
    { minLevel: 21, rank: 'ANBU', hatUrl: 'hats/anbu.png' },
    { minLevel: 16, rank: 'Jounin', hatUrl: 'hats/jounin.png' },
    { minLevel: 11, rank: 'Chuunin', hatUrl: 'hats/chunin.png' },
    { minLevel: 6, rank: 'Genin', hatUrl: 'hats/genin.png' },
    { minLevel: 1, rank: 'Academy Student', hatUrl: 'hats/academy.png' },
];
let activeLadderRankTiers = DEFAULT_LADDER_RANK_TIERS.map((tier) => ({ ...tier }));
const HOKAGE_RANK_INFO = {
    rank: '#1 Shinobi',
    hatUrl: 'hats/hokage.png',
};
const LADDER_EXP_CURVE_POWER = 1.38;

const cloneLadderRankTiers = (tiers = activeLadderRankTiers) =>
    (Array.isArray(tiers) ? tiers : []).map((tier) => ({ ...tier }));

const normalizeLadderRankTiersForSave = (tiers) => {
    if (!Array.isArray(tiers) || !tiers.length) {
        throw new Error('At least one rank tier is required.');
    }

    const seenLevels = new Set();
    const normalizedTiers = tiers.map((tier) => {
        const minLevel = Math.max(1, Math.min(LADDER_MAX_LEVEL, Math.round(Number(tier?.minLevel) || 0)));
        const rank = typeof tier?.rank === 'string' ? tier.rank.trim() : '';
        const hatUrl =
            typeof tier?.rankHatUrl === 'string'
                ? tier.rankHatUrl.trim()
                : typeof tier?.hatUrl === 'string'
                ? tier.hatUrl.trim()
                : '';

        if (!minLevel || !rank) {
            throw new Error('Each rank tier needs a starting level and rank name.');
        }
        if (seenLevels.has(minLevel)) {
            throw new Error(`Duplicate rank starting level: ${minLevel}.`);
        }
        seenLevels.add(minLevel);
        return {
            minLevel,
            rank: rank.slice(0, 40),
            hatUrl: hatUrl.slice(0, 220),
        };
    });

    if (!seenLevels.has(1)) {
        throw new Error('Rank tiers must include a level 1 starting rank.');
    }

    return normalizedTiers.sort((left, right) => right.minLevel - left.minLevel);
};

const setActiveLadderRankTiers = (tiers) => {
    activeLadderRankTiers = normalizeLadderRankTiersForSave(tiers);
    return cloneLadderRankTiers();
};

const getDefaultLadderRankTiers = () => cloneLadderRankTiers(DEFAULT_LADDER_RANK_TIERS);

const getStoredLadderRankTiers = async () => {
    if (!appStateCollection) {
        return setActiveLadderRankTiers(getDefaultLadderRankTiers());
    }

    const state = await appStateCollection.findOne({ key: LADDER_RANK_RULES_STATE_KEY });
    try {
        const storedTiers = Array.isArray(state?.rankTiers) ? state.rankTiers : [];
        return setActiveLadderRankTiers(storedTiers.length ? storedTiers : getDefaultLadderRankTiers());
    } catch (error) {
        console.warn('Stored ladder rank rules are invalid; falling back to defaults:', error.message);
        return setActiveLadderRankTiers(getDefaultLadderRankTiers());
    }
};

const saveLadderRankTiers = async (tiers, updatedBy) => {
    const normalizedTiers = setActiveLadderRankTiers(tiers);
    await appStateCollection.updateOne(
        { key: LADDER_RANK_RULES_STATE_KEY },
        {
            $set: {
                key: LADDER_RANK_RULES_STATE_KEY,
                rankTiers: normalizedTiers,
                updatedAt: new Date(),
                updatedBy: updatedBy || '',
            },
        },
        { upsert: true }
    );
    return normalizedTiers;
};

const resetLadderRankTiers = async () => {
    const defaultTiers = setActiveLadderRankTiers(getDefaultLadderRankTiers());
    if (appStateCollection) {
        await appStateCollection.deleteOne({ key: LADDER_RANK_RULES_STATE_KEY });
    }
    return defaultTiers;
};

const getBaseRankInfoForLevel = (level) => {
    const normalizedLevel = Math.max(1, Number(level) || 1);
    return (
        activeLadderRankTiers.find((entry) => normalizedLevel >= entry.minLevel) ||
        activeLadderRankTiers[activeLadderRankTiers.length - 1]
    );
};

const getRankInfoForLevel = (level, isHokage = false) => {
    const normalizedLevel = Math.max(1, Number(level) || 1);
    if (isHokage && normalizedLevel >= 76) {
        return HOKAGE_RANK_INFO;
    }
    return getBaseRankInfoForLevel(normalizedLevel);
};

const getCumulativeExperienceThreshold = (level) => {
    const normalizedLevel = Math.min(LADDER_MAX_LEVEL, Math.max(1, Number(level) || 1));
    if (normalizedLevel <= 1) {
        return 0;
    }
    if (normalizedLevel === 2) {
        return 200;
    }
    if (normalizedLevel >= LADDER_MAX_LEVEL) {
        return LADDER_MAX_EXPERIENCE_POINTS;
    }
    const progress = (normalizedLevel - 1) / (LADDER_MAX_LEVEL - 1);
    return Math.max(0, Math.round(LADDER_MAX_EXPERIENCE_POINTS * Math.pow(progress, LADDER_EXP_CURVE_POWER)));
};

const getExperienceRequiredForNextLevel = (level) => {
    const normalizedLevel = Math.max(1, Number(level) || 1);
    if (normalizedLevel >= LADDER_MAX_LEVEL) {
        return 0;
    }
    return Math.max(
        0,
        getCumulativeExperienceThreshold(normalizedLevel + 1) -
            getCumulativeExperienceThreshold(normalizedLevel)
    );
};

const getCumulativeExperienceForLevel = (level) => {
    return getCumulativeExperienceThreshold(level);
};

const deriveLadderStateFromExperience = (experiencePoints) => {
    const normalizedExperience = Math.min(
        LADDER_MAX_EXPERIENCE_POINTS,
        Math.max(0, Number(experiencePoints) || 0)
    );
    let level = 1;
    let cumulativeForLevel = 0;

    while (level < LADDER_MAX_LEVEL) {
        const needed = getExperienceRequiredForNextLevel(level);
        if (!needed || normalizedExperience < cumulativeForLevel + needed) {
            break;
        }
        cumulativeForLevel += needed;
        level += 1;
    }

    const experienceForNextLevel = getExperienceRequiredForNextLevel(level);
    return {
        level,
        experiencePoints: normalizedExperience,
        cumulativeForLevel,
        experienceIntoLevel: Math.max(0, normalizedExperience - cumulativeForLevel),
        experienceForNextLevel,
        experienceToNextLevel: experienceForNextLevel
            ? Math.max(0, cumulativeForLevel + experienceForNextLevel - normalizedExperience)
            : 0,
    };
};

const resolveLadderExperienceDelta = ({ playerLevel, opponentLevel, didWin }) => {
    const normalizedPlayerLevel = Math.max(1, Number(playerLevel) || 1);
    const normalizedOpponentLevel = Math.max(1, Number(opponentLevel) || 1);
    const levelDifference = normalizedOpponentLevel - normalizedPlayerLevel;
    let rawDelta = 0;

    if (levelDifference >= 11) {
        rawDelta = didWin ? 600 : 0;
    } else if (levelDifference >= 6) {
        rawDelta = didWin ? 600 : 0;
    } else if (levelDifference >= 3) {
        rawDelta = didWin ? 450 : -25;
    } else if (levelDifference >= 1) {
        rawDelta = didWin ? 350 : -50;
    } else if (levelDifference <= -11) {
        rawDelta = didWin ? 15 : -600;
    } else if (levelDifference <= -6) {
        rawDelta = didWin ? 50 : -450;
    } else if (levelDifference <= -3) {
        rawDelta = didWin ? 150 : -300;
    } else if (levelDifference <= -1) {
        rawDelta = didWin ? 200 : -150;
    } else {
        rawDelta = didWin ? 250 : -75;
    }

    if (rawDelta > 0) {
        return Math.max(15, Math.min(600, rawDelta));
    }
    if (rawDelta < 0 && normalizedPlayerLevel <= 25) {
        return -Math.min(600, Math.round(Math.abs(rawDelta) * 0.5));
    }
    if (rawDelta === 0) {
        return 0;
    }
    return -Math.min(600, Math.abs(rawDelta));
};

const getLevelProgressPercent = (experienceIntoLevel, experienceForNextLevel, level) => {
    const nextLevelCost = Math.max(0, Number(experienceForNextLevel) || 0);
    if (nextLevelCost > 0) {
        const progress = Math.max(0, Number(experienceIntoLevel) || 0);
        return Math.max(6, Math.min(100, Math.round((progress / nextLevelCost) * 100)));
    }
    const normalizedLevel = Math.max(1, Number(level) || 1);
    if (normalizedLevel >= LADDER_MAX_LEVEL) {
        return 100;
    }
    return Math.max(6, Math.min(100, Math.round((normalizedLevel / LADDER_MAX_LEVEL) * 100)));
};

const buildLadderRulesForAdmin = () => {
    const levels = [];
    for (let level = 1; level <= LADDER_MAX_LEVEL; level += 1) {
        const rankInfo = getRankInfoForLevel(level);
        levels.push({
            level,
            cumulativeExperience: getCumulativeExperienceForLevel(level),
            experienceForNextLevel: getExperienceRequiredForNextLevel(level),
            rank: rankInfo.rank,
            rankHatUrl: rankInfo.hatUrl,
        });
    }

    const sortedTiers = cloneLadderRankTiers().sort((left, right) => left.minLevel - right.minLevel);
    return {
        maxLevel: LADDER_MAX_LEVEL,
        maxExperiencePoints: LADDER_MAX_EXPERIENCE_POINTS,
        hokageRequirement: {
            minLevel: 46,
            ladderRank: 1,
            rank: HOKAGE_RANK_INFO.rank,
            rankHatUrl: HOKAGE_RANK_INFO.hatUrl,
        },
        defaults: {
            rankTiers: getDefaultLadderRankTiers()
                .sort((left, right) => left.minLevel - right.minLevel)
                .map((entry, index, tiers) => ({
                    minLevel: entry.minLevel,
                    maxLevel: index < tiers.length - 1 ? tiers[index + 1].minLevel - 1 : LADDER_MAX_LEVEL,
                    rank: entry.rank,
                    rankHatUrl: entry.hatUrl,
                })),
        },
        rankTiers: sortedTiers.map((entry, index) => ({
            minLevel: entry.minLevel,
            maxLevel: index < sortedTiers.length - 1 ? sortedTiers[index + 1].minLevel - 1 : LADDER_MAX_LEVEL,
            rank: entry.rank,
            rankHatUrl: entry.hatUrl,
        })),
        levels,
    };
};

const getRosterCharacterId = (rosterIndex) => {
    const index = Number.parseInt(rosterIndex, 10);
    if (!Number.isInteger(index) || index < 0) {
        return '';
    }
    const character = Array.isArray(charactersData) ? charactersData[index] : null;
    return typeof character?.characterId === 'string' ? character.characterId.trim().toLowerCase() : '';
};

const getRosterCharacterName = (rosterIndex) => {
    const index = Number.parseInt(rosterIndex, 10);
    if (!Number.isInteger(index) || index < 0) {
        return '';
    }
    const character = Array.isArray(charactersData) ? charactersData[index] : null;
    return typeof character?.name === 'string' ? character.name.trim() : '';
};

const teamHasDuplicateCharacters = (team = []) => {
    if (!Array.isArray(team)) {
        return false;
    }
    const seen = new Set();
    return team.some((rosterIndex) => {
        const key = Number.parseInt(rosterIndex, 10);
        if (!Number.isInteger(key)) {
            return false;
        }
        if (seen.has(key)) {
            return true;
        }
        seen.add(key);
        return false;
    });
};

const normalizeCharacterId = (value) =>
    String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const getCharacterDisplayNameById = (characterId) => {
    const normalizedCharacterId = normalizeCharacterId(characterId);
    if (!normalizedCharacterId) {
        return '';
    }
    const characters = Array.isArray(charactersData) ? charactersData : [];
    const match = characters.find((character) => {
        const candidateId = normalizeCharacterId(
            character?.characterId || character?.id || character?.name || ''
        );
        return candidateId === normalizedCharacterId;
    });
    return typeof match?.name === 'string' && match.name.trim()
        ? match.name.trim()
        : String(characterId || '').trim();
};

const normalizeMissionModeRestriction = (source = {}) => {
    const allowedModes = Array.from(
        new Set(
            normalizeMissionTextList(
                Array.isArray(source.allowed_modes)
                    ? source.allowed_modes
                    : Array.isArray(source.allowedModes)
                        ? source.allowedModes
                        : typeof source.allowed_modes === 'string'
                            ? source.allowed_modes.split(',')
                            : typeof source.allowedModes === 'string'
                                ? source.allowedModes.split(',')
                                : []
            )
                .map((entry) => String(entry || '').trim().toLowerCase())
                .filter((entry) => entry === 'quick' || entry === 'ladder')
        )
    );
    return {
        allowed_modes: allowedModes.length ? allowedModes : ['quick', 'ladder'],
    };
};

const getLegacyLevelRequirement = (value) => {
    const numericValue = Number(value);
    if (Number.isFinite(numericValue) && numericValue > 0) {
        return Math.max(1, Math.floor(numericValue));
    }

    const label = String(value || '').trim().toLowerCase();
    if (!label) {
        return 0;
    }

    const legacyLevelMap = new Map([
        ['academy student', 1],
        ['genin', 6],
        ['chunin', 11],
        ['chuunin', 11],
        ['jounin', 26],
        ['jonin', 26],
        ['joinin', 26],
        ['missing-nin', 16],
        ['missing nin', 16],
        ['anbu', 21],
        ['sannin', 31],
        ['jinchuriki', 36],
        ['jinchuuriki', 36],
        ['akatsuki', 41],
        ['kage', 46],
        ['hokage', 46],
    ]);
    cloneLadderRankTiers().forEach((tier) => {
        const rankLabel = String(tier.rank || '').trim().toLowerCase();
        if (rankLabel) {
            legacyLevelMap.set(rankLabel, tier.minLevel);
            legacyLevelMap.set(rankLabel.replace(/-/g, ' '), tier.minLevel);
        }
    });
    return legacyLevelMap.get(label) || 0;
};

const normalizeMissionProgressEntry = (entry = {}) => {
    const source = entry && typeof entry === 'object' ? entry : {};
    const winStreak = Math.max(
        0,
        Number(
            source.winStreak ??
                source.rickGrimesWinStreak ??
                source.streak ??
                source.consecutiveWins ??
                0
        ) || 0
    );
    const completedAt =
        source.completedAt instanceof Date || typeof source.completedAt === 'string'
            ? source.completedAt
            : source.unlockedAt instanceof Date || typeof source.unlockedAt === 'string'
                ? source.unlockedAt
                : null;
    const updatedAt =
        source.updatedAt instanceof Date || typeof source.updatedAt === 'string'
            ? source.updatedAt
            : null;
    const rawGoalProgress =
        source.goalProgressByIndex && typeof source.goalProgressByIndex === 'object'
            ? source.goalProgressByIndex
            : source.goalProgress && typeof source.goalProgress === 'object'
                ? source.goalProgress
                : {};
    const goalProgressByIndex = {};
    Object.keys(rawGoalProgress).forEach((goalIndex) => {
        const normalizedGoalIndex = String(Number.parseInt(goalIndex, 10));
        if (!normalizedGoalIndex || normalizedGoalIndex === 'NaN') {
            return;
        }
        goalProgressByIndex[normalizedGoalIndex] = normalizeMissionGoalProgressEntry(
            rawGoalProgress[goalIndex]
        );
    });
    return {
        winStreak,
        rickGrimesWinStreak: winStreak,
        completedAt,
        unlockedAt: completedAt,
        updatedAt,
        goalProgressByIndex,
        goalProgress: goalProgressByIndex,
    };
};

const normalizeMissionGoalProgressEntry = (entry = {}) => {
    const source = entry && typeof entry === 'object' ? entry : {};
    const count = Math.max(0, Number(source.count ?? source.progress ?? 0) || 0);
    const completedAt =
        source.completedAt instanceof Date || typeof source.completedAt === 'string'
            ? source.completedAt
            : null;
    const updatedAt =
        source.updatedAt instanceof Date || typeof source.updatedAt === 'string'
            ? source.updatedAt
            : null;
    return {
        count,
        progress: count,
        completedAt,
        updatedAt,
    };
};

const createDefaultMissionState = () => {
    return {
        progressByMissionId: {},
        progress: {},
        unlockedCharacterIds: [],
    };
};

const normalizeMissionState = (missions = {}) => {
    const source = missions && typeof missions === 'object' ? missions : {};
    const sourceProgress =
        source.progressByMissionId && typeof source.progressByMissionId === 'object'
            ? source.progressByMissionId
            : source.progress && typeof source.progress === 'object'
                ? source.progress
                : {};
    const progressByMissionId = {};
    Object.keys(sourceProgress).forEach((missionId) => {
        const normalizedMissionId = slugifyMissionId(missionId);
        if (!normalizedMissionId) {
            return;
        }
        progressByMissionId[normalizedMissionId] = normalizeMissionProgressEntry(
            sourceProgress[missionId]
        );
    });
    const unlockedCharacterIds = new Set(
        (Array.isArray(source.unlockedCharacterIds) ? source.unlockedCharacterIds : [])
            .map((entry) => normalizeCharacterId(entry))
            .filter(Boolean)
    );
    return {
        progressByMissionId,
        progress: progressByMissionId,
        unlockedCharacterIds: Array.from(unlockedCharacterIds),
    };
};

const normalizeStoryProgressEntry = (entry = {}) => {
    const source = entry && typeof entry === 'object' ? entry : {};
    const completedAt =
        source.completedAt instanceof Date || typeof source.completedAt === 'string'
            ? source.completedAt
            : null;
    const hardCompletedAt =
        source.hardCompletedAt instanceof Date || typeof source.hardCompletedAt === 'string'
            ? source.hardCompletedAt
            : null;
    const hardRyoAwardedAt =
        source.hardRyoAwardedAt instanceof Date || typeof source.hardRyoAwardedAt === 'string'
            ? source.hardRyoAwardedAt
            : null;
    return {
        completedAt,
        hardCompletedAt,
        hardRyoAwardedAt,
        hardRyoAwarded: Math.max(0, Math.round(Number(source.hardRyoAwarded) || 0)),
    };
};

const normalizeStoryState = (story = {}) => {
    const source = story && typeof story === 'object' ? story : {};
    const sourceProgress =
        source.progressByNodeId && typeof source.progressByNodeId === 'object' ? source.progressByNodeId : {};
    const progressByNodeId = {};
    Object.keys(sourceProgress).forEach((nodeId) => {
        const normalizedNodeId = typeof nodeId === 'string' ? nodeId.trim() : '';
        if (!normalizedNodeId) return;
        progressByNodeId[normalizedNodeId] = normalizeStoryProgressEntry(sourceProgress[nodeId]);
    });
    return { progressByNodeId };
};

const normalizeGauntletRunState = (run = {}) => {
    if (!run || typeof run !== 'object') return null;
    const status = typeof run.status === 'string' ? run.status.trim().toLowerCase() : 'active';
    const validStatus = ['active', 'won', 'lost', 'abandoned'].includes(status) ? status : 'active';
    const team = Array.isArray(run.team)
        ? run.team
              .map((entry) => Number.parseInt(entry, 10))
              .filter((entry) => Number.isInteger(entry) && entry >= 0)
              .slice(0, 3)
        : [];
    const teamHp = team.map((_, index) => {
        const hp = Number(Array.isArray(run.teamHp) ? run.teamHp[index] : 100);
        return Math.max(0, Math.min(100, Number.isFinite(hp) ? Math.round(hp) : 100));
    });
    const map = run.map && typeof run.map === 'object' ? run.map : null;
    return {
        seed: typeof run.seed === 'string' && run.seed.trim() ? run.seed.trim() : `gauntlet-${Date.now()}`,
        status: validStatus,
        startingScrollType:
            run.startingScrollType === gauntlet.EXAM_SCROLL_TYPES.EARTH
                ? gauntlet.EXAM_SCROLL_TYPES.EARTH
                : gauntlet.EXAM_SCROLL_TYPES.HEAVEN,
        team,
        teamHp,
        actOneStep: Math.max(0, Math.min(3, Math.round(Number(run.actOneStep) || 0))),
        actThreeStep:
            typeof run.actThreeStep === 'string' && ['preliminary', 'finals', 'complete'].includes(run.actThreeStep)
                ? run.actThreeStep
                : '',
        benchAvailable: Boolean(run.benchAvailable),
        heavenScrolls: Math.max(0, Math.round(Number(run.heavenScrolls) || 0)),
        earthScrolls: Math.max(0, Math.round(Number(run.earthScrolls) || 0)),
        ryo: Math.max(0, Math.round(Number(run.ryo) || 0)),
        scrollFragments: Math.max(0, Math.round(Number(run.scrollFragments) || 0)),
        relics: (Array.isArray(run.relics) ? run.relics : [])
            .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
            .filter(Boolean),
        pendingOffers: (Array.isArray(run.pendingOffers) ? run.pendingOffers : [])
            .map((entry) => {
                if (!entry || typeof entry !== 'object') return null;
                const type = typeof entry.type === 'string' ? entry.type.trim().toLowerCase() : '';
                const id = typeof entry.id === 'string' ? entry.id.trim() : '';
                return type && id ? { type, id, sourceNodeId: entry.sourceNodeId || null } : null;
            })
            .filter(Boolean),
        currentAct: [1, 2, 3].includes(Number(run.currentAct)) ? Number(run.currentAct) : 2,
        currentNodeId: typeof run.currentNodeId === 'string' && run.currentNodeId.trim() ? run.currentNodeId.trim() : null,
        visitedNodeIds: Array.from(
            new Set(
                (Array.isArray(run.visitedNodeIds) ? run.visitedNodeIds : [])
                    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
                    .filter(Boolean)
            )
        ),
        lockedNodeIds: Array.from(
            new Set(
                (Array.isArray(run.lockedNodeIds) ? run.lockedNodeIds : [])
                    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
                    .filter(Boolean)
            )
        ),
        pendingBattle:
            run.pendingBattle && typeof run.pendingBattle === 'object'
                ? {
                      nodeId:
                          typeof run.pendingBattle.nodeId === 'string' && run.pendingBattle.nodeId.trim()
                              ? run.pendingBattle.nodeId.trim()
                              : '',
                      matchId:
                          typeof run.pendingBattle.matchId === 'string' && run.pendingBattle.matchId.trim()
                              ? run.pendingBattle.matchId.trim()
                              : '',
                  }
                : null,
        map,
        startedAt: run.startedAt || null,
        endedAt: run.endedAt || null,
        lastNodeResult: run.lastNodeResult && typeof run.lastNodeResult === 'object' ? run.lastNodeResult : null,
    };
};

const createDefaultGauntletState = () => ({
    activeRun: null,
    completedRuns: 0,
    wins: 0,
    losses: 0,
    abandonedRuns: 0,
    examMerit: 0,
    unlockedCharacterIds: [],
});

const normalizeGauntletState = (gauntletState = {}) => {
    const source = gauntletState && typeof gauntletState === 'object' ? gauntletState : {};
    return {
        activeRun: normalizeGauntletRunState(source.activeRun),
        completedRuns: Math.max(0, Math.round(Number(source.completedRuns) || 0)),
        wins: Math.max(0, Math.round(Number(source.wins) || 0)),
        losses: Math.max(0, Math.round(Number(source.losses) || 0)),
        abandonedRuns: Math.max(0, Math.round(Number(source.abandonedRuns) || 0)),
        examMerit: Math.max(0, Math.round(Number(source.examMerit) || 0)),
        unlockedCharacterIds: Array.from(
            new Set(
                (Array.isArray(source.unlockedCharacterIds) ? source.unlockedCharacterIds : [])
                    .map((entry) => normalizeCharacterId(entry))
                    .filter(Boolean)
            )
        ),
    };
};

const normalizeMissionTextList = (entries = []) =>
    (Array.isArray(entries) ? entries : [])
        .map((entry) => {
            if (typeof entry === 'string') {
                return entry.trim();
            }
            if (entry && typeof entry === 'object') {
                return typeof entry.text === 'string' && entry.text.trim()
                    ? entry.text.trim()
                    : typeof entry.value === 'string' && entry.value.trim()
                        ? entry.value.trim()
                        : typeof entry.label === 'string' && entry.label.trim()
                            ? entry.label.trim()
                            : '';
            }
            return '';
        })
        .filter(Boolean);

const normalizeMissionGoalEntry = (entry = {}, index = 0) => {
    if (typeof entry === 'string') {
        const text = entry.trim();
        if (!text) {
            return null;
        }

        const reachRankMatch = text.match(/^Reach\s+rank\s+(\d+)(?:\.\s*\(0\/\d+\))?$/i);
        if (reachRankMatch) {
            const rank = Math.max(0, Number(reachRankMatch[1]) || 0);
            return rank
                ? {
                      type: 'reach_rank',
                      rank,
                  }
                : null;
        }

        const winMatchesAnyMatch = text.match(
            /^Win\s+(\d+)\s+matches?\s+with\s+(.+?)\s+or\s+(.+?)(?:\.\s*\(0\/\d+\))?$/i
        );
        if (winMatchesAnyMatch) {
            const wins = Math.max(0, Number(winMatchesAnyMatch[1]) || 0);
            const firstCharacterName = winMatchesAnyMatch[2].trim();
            const secondCharacterName = winMatchesAnyMatch[3].trim();
            const firstCharacterId = normalizeCharacterId(firstCharacterName);
            const secondCharacterId = normalizeCharacterId(secondCharacterName);
            if (!wins || !firstCharacterId || !secondCharacterId) {
                return null;
            }
            return {
                type: 'win_matches_any',
                character_ids: [firstCharacterId, secondCharacterId],
                character_names: [firstCharacterName, secondCharacterName],
                wins,
            };
        }

        const winMatchesMatch = text.match(/^Win\s+(\d+)\s+matches?\s+with\s+(.+?)(?:\.\s*\(0\/\d+\))?$/i);
        if (winMatchesMatch) {
            const wins = Math.max(0, Number(winMatchesMatch[1]) || 0);
            const characterName = winMatchesMatch[2].trim();
            const characterId = normalizeCharacterId(characterName);
            return {
                type: 'win_matches',
                character_id: characterId,
                character_name: characterName,
                wins,
            };
        }

        const winStreakAnyMatch = text.match(
            /^Win\s+(\d+)\s+battles?\s+in\s+a\s+row\s+with\s+(.+?)\s+or\s+(.+?)(?:\.\s*\(0\/\d+\))?$/i
        );
        if (winStreakAnyMatch) {
            const wins = Math.max(0, Number(winStreakAnyMatch[1]) || 0);
            const firstCharacterName = winStreakAnyMatch[2].trim();
            const secondCharacterName = winStreakAnyMatch[3].trim();
            const firstCharacterId = normalizeCharacterId(firstCharacterName);
            const secondCharacterId = normalizeCharacterId(secondCharacterName);
            if (!wins || !firstCharacterId || !secondCharacterId) {
                return null;
            }
            return {
                type: 'win_streak_any',
                character_ids: [firstCharacterId, secondCharacterId],
                character_names: [firstCharacterName, secondCharacterName],
                wins,
            };
        }

        const winStreakMatch = text.match(
            /^Win\s+(\d+)\s+battles?\s+in\s+a\s+row\s+with\s+(.+?)(?:\.\s*\(0\/\d+\))?$/i
        );
        if (winStreakMatch) {
            const wins = Math.max(0, Number(winStreakMatch[1]) || 0);
            const characterName = winStreakMatch[2].trim();
            const characterId = normalizeCharacterId(characterName);
            return {
                type: 'win_streak',
                character_id: characterId,
                character_name: characterName,
                wins,
            };
        }

        const winSameTeamMatch = text.match(
            /^Win\s+(\d+)\s+games?\s+with\s+(.+?)\s+and\s+(.+?)\s+on\s+the\s+same\s+team(?:\.\s*\(0\/\d+\))?$/i
        );
        if (winSameTeamMatch) {
            const wins = Math.max(0, Number(winSameTeamMatch[1]) || 0);
            const firstCharacterName = winSameTeamMatch[2].trim();
            const secondCharacterName = winSameTeamMatch[3].trim();
            const firstCharacterId = normalizeCharacterId(firstCharacterName);
            const secondCharacterId = normalizeCharacterId(secondCharacterName);
            if (!wins || !firstCharacterId || !secondCharacterId) {
                return null;
            }
            return {
                type: 'win_matches_same_team',
                character_ids: [firstCharacterId, secondCharacterId],
                character_names: [firstCharacterName, secondCharacterName],
                wins,
            };
        }

        return {
            type: 'text',
            text,
        };
    }

    const source = entry && typeof entry === 'object' ? entry : {};
    const type = String(source.type || source.goalType || source.kind || 'text')
        .trim()
        .toLowerCase();
    const normalizedType =
        type === 'win_matches' || type === 'win_match' || type === 'match_wins'
            ? 'win_matches'
            : type === 'win_streak' || type === 'streak'
                ? 'win_streak'
                : type === 'reach_rank' || type === 'rank' || type === 'reach_level'
                    ? 'reach_rank'
                    : type === 'win_matches_same_team' ||
                        type === 'same_team_wins' ||
                        type === 'same_team'
                        ? 'win_matches_same_team'
                    : type === 'win_streak_any' || type === 'streak_any' || type === 'win_streak_either'
                        ? 'win_streak_any'
                    : type === 'win_matches_any' || type === 'match_wins_any' || type === 'win_matches_either'
                        ? 'win_matches_any'
                    : type === 'use_skill' || type === 'skill_uses' || type === 'use_skill_times'
                        ? 'use_skill'
                : 'text';

    if (normalizedType === 'win_matches' || normalizedType === 'win_streak') {
        const wins = Math.max(
            0,
            Number(source.wins ?? source.count ?? source.target ?? source.goal ?? 0) || 0
        );
        const characterId = normalizeCharacterId(
            source.character_id ?? source.characterId ?? source.character ?? source.target_character
        );
        const characterName = String(
            source.character_name ?? source.characterName ?? getCharacterDisplayNameById(characterId)
        ).trim();
        if (!wins) {
            return null;
        }
        return {
            type: normalizedType,
            character_id: characterId,
            character_name: characterName || getCharacterDisplayNameById(characterId),
            wins,
        };
    }

    if (normalizedType === 'reach_rank') {
        const rank = Math.max(
            0,
            Number(source.rank ?? source.level ?? source.target ?? source.goal ?? source.value ?? 0) || 0
        );
        if (!rank) {
            return null;
        }
        return {
            type: 'reach_rank',
            rank,
        };
    }

    if (normalizedType === 'win_matches_same_team') {
        const wins = Math.max(
            0,
            Number(source.wins ?? source.count ?? source.target ?? source.goal ?? 0) || 0
        );
        const characterIds = normalizeMissionTextList(
            Array.isArray(source.character_ids)
                ? source.character_ids
                : [
                      source.character_id ?? source.characterId ?? source.character ?? '',
                      source.teammate_character_id ??
                          source.teammateCharacterId ??
                          source.character_two_id ??
                          source.characterTwoId ??
                          '',
                  ]
        ).map((value) => normalizeCharacterId(value));
        const uniqueCharacterIds = Array.from(new Set(characterIds.filter(Boolean))).slice(0, 2);
        if (!wins || uniqueCharacterIds.length < 2) {
            return null;
        }
        const rawCharacterNames = Array.isArray(source.character_names)
            ? source.character_names
            : [
                  source.character_name ?? source.characterName ?? '',
                  source.teammate_character_name ??
                      source.teammateCharacterName ??
                      source.character_two_name ??
                      source.characterTwoName ??
                      '',
              ];
        const characterNames = uniqueCharacterIds.map((characterId, idx) => {
            const providedName = String(rawCharacterNames[idx] ?? '').trim();
            return providedName || getCharacterDisplayNameById(characterId);
        });
        return {
            type: 'win_matches_same_team',
            character_ids: uniqueCharacterIds,
            character_names: characterNames,
            wins,
        };
    }

    if (normalizedType === 'win_streak_any') {
        const wins = Math.max(
            0,
            Number(source.wins ?? source.count ?? source.target ?? source.goal ?? 0) || 0
        );
        const characterIds = normalizeMissionTextList(
            Array.isArray(source.character_ids) ? source.character_ids : []
        ).map((value) => normalizeCharacterId(value));
        const uniqueCharacterIds = Array.from(new Set(characterIds.filter(Boolean)));
        if (!wins || uniqueCharacterIds.length < 2) {
            return null;
        }
        const rawCharacterNames = Array.isArray(source.character_names) ? source.character_names : [];
        const characterNames = uniqueCharacterIds.map((characterId, idx) => {
            const providedName = String(rawCharacterNames[idx] ?? '').trim();
            return providedName || getCharacterDisplayNameById(characterId);
        });
        const groupLabel = String(source.character_name ?? source.group_label ?? '').trim();
        return {
            type: 'win_streak_any',
            character_ids: uniqueCharacterIds,
            character_names: characterNames,
            ...(groupLabel ? { character_name: groupLabel } : {}),
            wins,
        };
    }

    if (normalizedType === 'win_matches_any') {
        const wins = Math.max(
            0,
            Number(source.wins ?? source.count ?? source.target ?? source.goal ?? 0) || 0
        );
        const characterIds = normalizeMissionTextList(
            Array.isArray(source.character_ids) ? source.character_ids : []
        ).map((value) => normalizeCharacterId(value));
        const uniqueCharacterIds = Array.from(new Set(characterIds.filter(Boolean)));
        if (!wins || uniqueCharacterIds.length < 2) {
            return null;
        }
        const rawCharacterNames = Array.isArray(source.character_names) ? source.character_names : [];
        const characterNames = uniqueCharacterIds.map((characterId, idx) => {
            const providedName = String(rawCharacterNames[idx] ?? '').trim();
            return providedName || getCharacterDisplayNameById(characterId);
        });
        const groupLabel = String(source.character_name ?? source.group_label ?? '').trim();
        return {
            type: 'win_matches_any',
            character_ids: uniqueCharacterIds,
            character_names: characterNames,
            ...(groupLabel ? { character_name: groupLabel } : {}),
            wins,
        };
    }

    if (normalizedType === 'use_skill') {
        const wins = Math.max(
            0,
            Number(source.wins ?? source.count ?? source.target ?? source.goal ?? 0) || 0
        );
        const skillId = String(source.skill_id ?? source.skillId ?? '')
            .trim()
            .toLowerCase();
        const characterId = normalizeCharacterId(
            source.character_id ?? source.characterId ?? source.character ?? ''
        );
        const characterName = String(
            source.character_name ?? source.characterName ?? getCharacterDisplayNameById(characterId)
        ).trim();
        const skillName = String(source.skill_name ?? source.skillName ?? '').trim();
        if (!wins || !skillId) {
            return null;
        }
        return {
            type: 'use_skill',
            skill_id: skillId,
            skill_name: skillName,
            character_id: characterId,
            character_name: characterName || getCharacterDisplayNameById(characterId),
            wins,
        };
    }

    const text = normalizeMissionTextList([
        source.text ?? source.value ?? source.label ?? source.description ?? '',
    ])[0];
    if (!text) {
        return null;
    }
    return {
        type: 'text',
        text,
    };
};

const normalizeMissionGoalList = (entries = []) =>
    (Array.isArray(entries) ? entries : [])
        .map((entry, index) => normalizeMissionGoalEntry(entry, index))
        .filter(Boolean);

const slugifyMissionId = (value) =>
    String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const normalizeMissionCatalogEntry = (mission = {}, index = 0) => {
    const source = mission && typeof mission === 'object' ? mission : {};
    const missionTitle =
        typeof source.title === 'string' && source.title.trim()
            ? source.title.trim()
            : typeof source.name === 'string' && source.name.trim()
                ? source.name.trim()
                : `Mission ${index + 1}`;
    const missionId = slugifyMissionId(
        typeof source.missionId === 'string' && source.missionId.trim()
            ? source.missionId.trim()
            : missionTitle
    ) || `mission-${index + 1}`;
    const levelRequirement = Math.max(
        0,
        Number(
            source.level_requirement ??
                source.levelRequirement ??
                source.rank_requirement?.level ??
                source.rankRequirement?.level ??
                getLegacyLevelRequirement(source.rank)
        ) || 0
    );
    const rewardCharacterId = normalizeCharacterId(
        source.reward_character ??
            source.rewardCharacter ??
            source.rewardCharacterId ??
            source.reward_character_id
    );
    const winStreakCharacterId = normalizeCharacterId(
        source.win_streak?.character_id ??
            source.winStreak?.characterId ??
            source.win_streak_character_id ??
            source.winStreakCharacterId
    );
    const winStreakWins = Math.max(
        0,
        Number(
            source.win_streak?.wins ??
                source.winStreak?.wins ??
                source.win_streak_wins ??
                source.winStreakWins ??
                (winStreakCharacterId ? 1 : 0)
        ) || 0
    );
    const modeRestriction = normalizeMissionModeRestriction(
        source.mode_restriction || source.modeRestriction || {}
    );
    const requirementNotes = normalizeMissionTextList(
        source.requirements || source.requirementNotes || source.notes
    );
    const goals = normalizeMissionGoalList(source.goals || source.objectives);
    const legacyGoalCharacterId = normalizeCharacterId(
        source.character_used ??
            source.characterUsed ??
            source.characterUsedId ??
            source.character_used_id
    );
    if (
        legacyGoalCharacterId &&
        !goals.some(
            (goal) =>
                goal &&
                goal.type === 'win_streak' &&
                normalizeCharacterId(goal.character_id) === legacyGoalCharacterId
        )
    ) {
        goals.push({
            type: 'win_streak',
            character_id: legacyGoalCharacterId,
            character_name: getCharacterDisplayNameById(legacyGoalCharacterId),
            wins: Math.max(1, winStreakWins),
        });
    }
    return {
        missionId,
        title: missionTitle,
        level_requirement: levelRequirement,
        rank: levelRequirement ? String(levelRequirement) : '',
        reward_character: rewardCharacterId,
        reward_character_name: getCharacterDisplayNameById(rewardCharacterId),
        reward: typeof source.reward === 'string' ? source.reward.trim() : '',
        mode_restriction: modeRestriction,
        win_streak: {
            character_id: winStreakCharacterId,
            character_name: getCharacterDisplayNameById(winStreakCharacterId),
            wins: winStreakWins,
        },
        image: typeof source.image === 'string' ? source.image.trim() : '',
        imageAlt:
            typeof source.imageAlt === 'string' && source.imageAlt.trim()
                ? source.imageAlt.trim()
                : `${missionTitle} mission artwork`,
        characterName: typeof source.characterName === 'string' ? source.characterName.trim() : '',
        portrait: typeof source.portrait === 'string' ? source.portrait.trim() : '',
        portraitAlt:
            typeof source.portraitAlt === 'string' && source.portraitAlt.trim()
                ? source.portraitAlt.trim()
                : `${missionTitle} portrait`,
        requirements: requirementNotes,
        goals,
        sortOrder: Number.isFinite(Number(source.sortOrder)) ? Number(source.sortOrder) : index + 1,
    };
};

const normalizeMissionCatalog = (missions = []) => {
    const seen = new Set();
    return (Array.isArray(missions) ? missions : [])
        .map((mission, index) => normalizeMissionCatalogEntry(mission, index))
        .filter((mission) => mission.missionId && mission.title)
        .map((mission) => {
            let nextMissionId = mission.missionId;
            let duplicateIndex = 2;
            while (seen.has(nextMissionId)) {
                nextMissionId = `${mission.missionId}-${duplicateIndex}`;
                duplicateIndex += 1;
            }
            seen.add(nextMissionId);
            return {
                ...mission,
                missionId: nextMissionId,
            };
        })
        .sort((a, b) => {
            const sortDelta = Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
            if (sortDelta !== 0) {
                return sortDelta;
            }
            return String(a.title).localeCompare(String(b.title));
        });
};

const cloneMissionCatalog = (missions = []) =>
    normalizeMissionCatalog(
        (Array.isArray(missions) ? missions : []).map((mission) => ({
            ...mission,
            mode_restriction: mission?.mode_restriction
                ? {
                      allowed_modes: Array.isArray(mission.mode_restriction.allowed_modes)
                          ? mission.mode_restriction.allowed_modes.slice()
                          : [],
                  }
                : undefined,
            win_streak: mission?.win_streak
                ? {
                      character_id:
                          typeof mission.win_streak.character_id === 'string'
                              ? mission.win_streak.character_id
                              : '',
                      wins: Number(mission.win_streak.wins) || 0,
                  }
                : undefined,
            requirements: Array.isArray(mission?.requirements) ? mission.requirements.slice() : [],
            goals: Array.isArray(mission?.goals) ? mission.goals.slice() : [],
        }))
    );

const getDefaultMissionCatalog = () => cloneMissionCatalog(DEFAULT_MISSION_CATALOG);

const getStoredMissionCatalog = async () => {
    const defaultCatalog = getDefaultMissionCatalog();
    if (!appStateCollection) {
        missionCatalogCache = defaultCatalog;
        return defaultCatalog;
    }

    const storedState = await appStateCollection.findOne({ key: MISSION_CATALOG_STATE_KEY });
    const hasStoredDoc = Boolean(storedState);
    const storedCatalog = normalizeMissionCatalog(
        storedState && Array.isArray(storedState.missions) ? storedState.missions : []
    );
    if (!hasStoredDoc) {
        missionCatalogCache = defaultCatalog;
        return defaultCatalog;
    }

    // The stored catalog is the source of truth for admin edits (including deletions).
    // Merge in any missions newly added to DEFAULT_MISSION_CATALOG in code (e.g. unlock
    // missions shipped with new characters) that the admin has never seen/saved before,
    // without resurrecting anything the admin has deliberately deleted by missionId.
    const storedIds = new Set(storedCatalog.map((mission) => mission.missionId));
    const newDefaultMissions = defaultCatalog.filter((mission) => !storedIds.has(mission.missionId));
    if (!newDefaultMissions.length) {
        missionCatalogCache = storedCatalog;
        return storedCatalog;
    }

    const mergedCatalog = normalizeMissionCatalog([...storedCatalog, ...newDefaultMissions]);
    try {
        await appStateCollection.updateOne(
            { key: MISSION_CATALOG_STATE_KEY },
            {
                $set: {
                    key: MISSION_CATALOG_STATE_KEY,
                    missions: mergedCatalog,
                    updatedAt: new Date(),
                    updatedBy: 'system:merge-new-default-missions',
                },
            },
            { upsert: true }
        );
    } catch (error) {
        console.error('Mission catalog merge persist error:', error);
    }
    missionCatalogCache = mergedCatalog;
    return mergedCatalog;
};

const saveMissionCatalog = async (missions, updatedBy) => {
    const normalizedCatalog = normalizeMissionCatalog(missions);
    if (!normalizedCatalog.length) {
        throw new Error('At least one mission is required.');
    }

    await appStateCollection.updateOne(
        { key: MISSION_CATALOG_STATE_KEY },
        {
            $set: {
                key: MISSION_CATALOG_STATE_KEY,
                missions: normalizedCatalog,
                updatedAt: new Date(),
                updatedBy: updatedBy || '',
            },
        },
        { upsert: true }
    );

    missionCatalogCache = normalizedCatalog;
    return normalizedCatalog;
};

const normalizeStoryNode = (node = {}, index = 0) => {
    const source = node && typeof node === 'object' ? node : {};
    const title = typeof source.title === 'string' && source.title.trim() ? source.title.trim() : `Battle ${index + 1}`;
    const nodeId = slugifyMissionId(
        typeof source.nodeId === 'string' && source.nodeId.trim() ? source.nodeId.trim() : title
    ) || `node-${index + 1}`;
    const enemyTeam = (Array.isArray(source.enemyTeam) ? source.enemyTeam : [])
        .map((id) => normalizeCharacterId(id))
        .filter(Boolean)
        .slice(0, 3);
    const playerTeam = (Array.isArray(source.playerTeam) ? source.playerTeam : [])
        .map((id) => normalizeCharacterId(id))
        .filter(Boolean)
        .slice(0, 3);
    const bossScript = (Array.isArray(source.bossScript) ? source.bossScript : [])
        .map((rule) => (rule && typeof rule.skillId === 'string' && rule.skillId.trim()
            ? { skillId: rule.skillId.trim(), when: rule.when && typeof rule.when === 'object' ? rule.when : {} }
            : null))
        .filter(Boolean);
    const normalizeDialogue = (entries) =>
        (Array.isArray(entries) ? entries : [])
            .map((entry) => (entry && typeof entry.text === 'string' && entry.text.trim()
                ? {
                      speaker: typeof entry.speaker === 'string' ? entry.speaker.trim() : '',
                      portrait: typeof entry.portrait === 'string' ? entry.portrait.trim() : '',
                      text: entry.text.trim(),
                  }
                : null))
            .filter(Boolean);
    return {
        nodeId,
        title,
        arcTitle: typeof source.arcTitle === 'string' ? source.arcTitle.trim() : '',
        episodeRange: typeof source.episodeRange === 'string' ? source.episodeRange.trim() : '',
        summary: typeof source.summary === 'string' ? source.summary.trim() : '',
        level_requirement: Math.max(0, Number(source.level_requirement) || 0),
        image: typeof source.image === 'string' ? source.image.trim() : '',
        imageAlt:
            typeof source.imageAlt === 'string' && source.imageAlt.trim()
                ? source.imageAlt.trim()
                : `${title} artwork`,
        enemyTeam,
        playerTeam,
        enemyDisplayName:
            typeof source.enemyDisplayName === 'string' && source.enemyDisplayName.trim()
                ? source.enemyDisplayName.trim()
                : GAME_BOT_DISPLAY_NAME,
        bossScript,
        introDialogue: normalizeDialogue(source.introDialogue),
        outroDialogueWin: normalizeDialogue(source.outroDialogueWin),
        outroDialogueLoss: normalizeDialogue(source.outroDialogueLoss),
        reward_character: normalizeCharacterId(source.reward_character) || null,
        rewardText: typeof source.rewardText === 'string' ? source.rewardText.trim() : '',
        requiresPreviousNode: source.requiresPreviousNode !== false,
        sortOrder: Number.isFinite(Number(source.sortOrder)) ? Number(source.sortOrder) : index + 1,
    };
};

const normalizeStoryCatalog = (chapters = []) =>
    (Array.isArray(chapters) ? chapters : [])
        .map((chapter, index) => {
            const source = chapter && typeof chapter === 'object' ? chapter : {};
            const title =
                typeof source.title === 'string' && source.title.trim() ? source.title.trim() : `Chapter ${index + 1}`;
            const chapterId = slugifyMissionId(
                typeof source.chapterId === 'string' && source.chapterId.trim() ? source.chapterId.trim() : title
            ) || `chapter-${index + 1}`;
            return {
                chapterId,
                title,
                sortOrder: Number.isFinite(Number(source.sortOrder)) ? Number(source.sortOrder) : index + 1,
                nodes: (Array.isArray(source.nodes) ? source.nodes : []).map((node, nodeIndex) =>
                    normalizeStoryNode(node, nodeIndex)
                ),
            };
        })
        .filter((chapter) => chapter.chapterId && chapter.nodes.length)
        .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));

const getDefaultStoryCatalog = () => normalizeStoryCatalog(buildPartOneStoryCatalog());

const isGeneratedStoryDialogueNode = (node = {}) => {
    const planEntry = PART_ONE_STORY_PLAN.find((entry) => entry.nodeId === node.nodeId);
    if (!planEntry) {
        return false;
    }
    const intro = Array.isArray(node.introDialogue) ? node.introDialogue[0] : null;
    const win = Array.isArray(node.outroDialogueWin) ? node.outroDialogueWin[0] : null;
    const loss = Array.isArray(node.outroDialogueLoss) ? node.outroDialogueLoss[0] : null;
    const generatedIntroSpeaker = planEntry.title.replace(/^Chapter\s+\d+:\s*/i, '');
    return (
        intro?.speaker === generatedIntroSpeaker &&
        intro?.text === planEntry.summary &&
        win?.speaker === 'Story' &&
        win?.text === `${planEntry.nodeTitle} cleared. The next chapter is now within reach.` &&
        loss?.speaker === 'Story' &&
        loss?.text === 'Regroup, adjust your plan, and try this chapter again.'
    );
};

const mergeStoryNodeWithDefault = (storedNode = {}, defaultNode = {}) => {
    if (!defaultNode?.nodeId) {
        return storedNode;
    }
    if (!isGeneratedStoryDialogueNode(storedNode)) {
        return storedNode;
    }
    return {
        ...storedNode,
        introDialogue: defaultNode.introDialogue,
        outroDialogueWin: defaultNode.outroDialogueWin,
        outroDialogueLoss: defaultNode.outroDialogueLoss,
    };
};

const mergeStoredStoryCatalogWithDefaults = (storedCatalog = [], defaultCatalog = []) => {
    if (!Array.isArray(storedCatalog) || !storedCatalog.length) {
        return defaultCatalog;
    }
    const storedNodeIds = storedCatalog.reduce((ids, chapter) => {
        (Array.isArray(chapter?.nodes) ? chapter.nodes : []).forEach((node) => {
            if (node?.nodeId) ids.push(node.nodeId);
        });
        return ids;
    }, []);
    const legacyDefaultNodeIds = new Set(['chapter-1-node-1', 'chapter-1-node-2']);
    const isOnlyLegacyDefaultStory =
        storedNodeIds.length > 0 && storedNodeIds.every((nodeId) => legacyDefaultNodeIds.has(nodeId));
    if (isOnlyLegacyDefaultStory) {
        return defaultCatalog;
    }
    const storedChapterIds = new Set(storedCatalog.map((chapter) => chapter.chapterId).filter(Boolean));
    const merged = storedCatalog.map((chapter) => {
        const defaultChapter = defaultCatalog.find((entry) => entry.chapterId === chapter.chapterId);
        if (!defaultChapter) {
            return chapter;
        }
        const defaultNodesById = new Map(
            (Array.isArray(defaultChapter.nodes) ? defaultChapter.nodes : [])
                .filter((node) => node?.nodeId)
                .map((node) => [node.nodeId, node])
        );
        const storedNodes = (Array.isArray(chapter.nodes) ? chapter.nodes : []).map((node) =>
            mergeStoryNodeWithDefault(node, defaultNodesById.get(node.nodeId))
        );
        const storedNodeIds = new Set(storedNodes.map((node) => node.nodeId));
        const missingDefaultNodes = (Array.isArray(defaultChapter.nodes) ? defaultChapter.nodes : []).filter(
            (node) => node?.nodeId && !storedNodeIds.has(node.nodeId)
        );
        return missingDefaultNodes.length
            ? { ...chapter, nodes: [...storedNodes, ...missingDefaultNodes] }
            : { ...chapter, nodes: storedNodes };
    });
    const missingDefaultChapters = defaultCatalog.filter(
        (chapter) => chapter?.chapterId && !storedChapterIds.has(chapter.chapterId)
    );
    return [...merged, ...missingDefaultChapters].sort(
        (left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0)
    );
};

const getStoredStoryCatalog = async () => {
    const defaultCatalog = getDefaultStoryCatalog();
    if (!appStateCollection) {
        storyCatalogCache = defaultCatalog;
        return defaultCatalog;
    }
    try {
        const storedState = await appStateCollection.findOne({ key: STORY_CATALOG_STATE_KEY });
        const storedCatalog = normalizeStoryCatalog(
            storedState && Array.isArray(storedState.chapters) ? storedState.chapters : []
        );
        const nextCatalog = mergeStoredStoryCatalogWithDefaults(storedCatalog, defaultCatalog);
        storyCatalogCache = nextCatalog;
        return nextCatalog;
    } catch (error) {
        console.error('Stored story catalog is invalid; falling back to default story catalog:', error);
        storyCatalogCache = defaultCatalog;
        return defaultCatalog;
    }
};

const saveStoryCatalog = async (chapters, updatedBy) => {
    const normalizedCatalog = normalizeStoryCatalog(chapters);
    if (!normalizedCatalog.length) {
        throw new Error('At least one story chapter is required.');
    }
    await appStateCollection.updateOne(
        { key: STORY_CATALOG_STATE_KEY },
        {
            $set: {
                key: STORY_CATALOG_STATE_KEY,
                chapters: normalizedCatalog,
                updatedAt: new Date(),
                updatedBy: updatedBy || '',
            },
        },
        { upsert: true }
    );
    storyCatalogCache = normalizedCatalog;
    return normalizedCatalog;
};

const findStoryNode = (catalog, nodeId) => {
    const normalizedNodeId = typeof nodeId === 'string' ? nodeId.trim() : '';
    if (!normalizedNodeId) return null;
    for (const chapter of Array.isArray(catalog) ? catalog : []) {
        const node = (Array.isArray(chapter?.nodes) ? chapter.nodes : []).find((n) => n.nodeId === normalizedNodeId);
        if (node) {
            return { chapter, node };
        }
    }
    return null;
};

const flattenStoryNodes = (catalog = []) =>
    (Array.isArray(catalog) ? catalog : [])
        .slice()
        .sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0))
        .flatMap((chapter) =>
            (Array.isArray(chapter?.nodes) ? chapter.nodes : [])
                .slice()
                .sort((left, right) => Number(left.sortOrder || 0) - Number(right.sortOrder || 0))
                .map((node) => ({ chapter, node }))
        );

const getPreviousStoryNode = (catalog = [], nodeId = '') => {
    const nodes = flattenStoryNodes(catalog);
    const index = nodes.findIndex((entry) => entry?.node?.nodeId === nodeId);
    return index > 0 ? nodes[index - 1] : null;
};

const getMissionLockedCharacterIds = async () => {
    const catalog = missionCatalogCache && Array.isArray(missionCatalogCache)
        ? missionCatalogCache
        : await getStoredMissionCatalog();
    const storyCatalog = storyCatalogCache && Array.isArray(storyCatalogCache)
        ? storyCatalogCache
        : await getStoredStoryCatalog();
    const locked = new Set(
        (Array.isArray(catalog) ? catalog : [])
            .map((mission) => normalizeCharacterId(mission.reward_character))
            .filter(Boolean)
    );
    (Array.isArray(storyCatalog) ? storyCatalog : []).forEach((chapter) => {
        (Array.isArray(chapter?.nodes) ? chapter.nodes : []).forEach((node) => {
            const id = normalizeCharacterId(node.reward_character);
            if (id) locked.add(id);
        });
    });
    // Also lock any character that has requiredMissionId set directly on the character
    (Array.isArray(charactersData) ? charactersData : []).forEach((character) => {
        if (character && typeof character.requiredMissionId === 'string' && character.requiredMissionId.trim()) {
            const id = normalizeCharacterId(character.characterId);
            if (id) locked.add(id);
        }
    });
    return locked;
};

const profileHasUnlockedCharacter = (profile, characterId, lockedCharacterIds = new Set()) => {
    const normalizedCharacterId =
        typeof characterId === 'string' ? normalizeCharacterId(characterId) : '';
    if (!normalizedCharacterId) {
        return true;
    }
    if (!lockedCharacterIds.has(normalizedCharacterId)) {
        return true;
    }
    const missions = profile && typeof profile.missions === 'object' ? profile.missions : {};
    const unlocked = new Set(
        (Array.isArray(missions.unlockedCharacterIds) ? missions.unlockedCharacterIds : [])
            .map((entry) => normalizeCharacterId(entry))
            .filter(Boolean)
    );
    if (unlocked.has(normalizedCharacterId)) {
        return true;
    }
    // Check requiredMissionId completion directly on character data
    const characterEntry = (Array.isArray(charactersData) ? charactersData : [])
        .find((c) => normalizeCharacterId(c && c.characterId) === normalizedCharacterId);
    const requiredMissionId = characterEntry && typeof characterEntry.requiredMissionId === 'string'
        ? characterEntry.requiredMissionId.trim()
        : '';
    if (requiredMissionId) {
        const progressByMissionId =
            missions.progressByMissionId && typeof missions.progressByMissionId === 'object'
                ? missions.progressByMissionId
                : {};
        const missionProgress = progressByMissionId[requiredMissionId];
        if (missionProgress && missionProgress.completedAt) {
            return true;
        }
    }
    return false;
};

const assertTeamCanBeUsed = async (profile, team = [], userRole = 'player') => {
    if (teamHasDuplicateCharacters(team)) {
        throw new Error('Team characters must be unique.');
    }
    const normalizedRole = String(userRole || '').trim().toLowerCase();
    if (normalizedRole === 'admin' || normalizedRole === 'moderator') {
        return;
    }
    const lockedCharacterIds = await getMissionLockedCharacterIds();
    const normalizedProfile = normalizeUserProfile({
        profile,
    });
    const invalidCharacter = Array.isArray(team)
        ? team.find((slot) => {
              const rosterCharacterId = getRosterCharacterId(slot);
              if (!rosterCharacterId) {
                  return true;
              }
              return !profileHasUnlockedCharacter(
                  normalizedProfile,
                  rosterCharacterId,
                  lockedCharacterIds
              );
          })
        : null;
    if (invalidCharacter === undefined || invalidCharacter === null) {
        return;
    }
    const rosterCharacterId = getRosterCharacterId(invalidCharacter);
    const rosterCharacterName = getRosterCharacterName(invalidCharacter) || rosterCharacterId || 'Character';
    if (!rosterCharacterId) {
        throw new Error('Invalid team selection.');
    }
    throw new Error(`${rosterCharacterName} is locked.`);
};

const buildDefaultUserProfile = (user = {}) => {
    const createdAt = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt || Date.now());
    return {
        avatarUrl: DEFAULT_PROFILE_AVATAR,
        backgrounds: {
            selectionUrl: '',
            ingameUrl: '',
        },
        posts: 0,
        ryo: 0,
        clan: null,
        clanInvitations: [],
        recentQuickGames: [],
        recentPrivateGames: [],
        recentLadderGames: [],
        missions: createDefaultMissionState(),
        story: normalizeStoryState(),
        gauntlet: createDefaultGauntletState(),
        matchmaking: {
            battleBotEnabled: true,
        },
        ladder: {
            level: 1,
            rank: 'Academy Student',
            rankHatUrl: 'hats/academy.png',
            experiencePoints: 0,
            ladderRank: null,
            wins: 0,
            losses: 0,
            streak: 0,
            highestStreak: 0,
            highestLevel: 1,
            famePoints: 0,
            isHokage: false,
        },
        activity: {
            lastOnlineAt: createdAt,
            currentPage: '',
        },
    };
};

const QUICK_GAME_RETENTION_MS = 24 * 60 * 60 * 1000;

const normalizeClanInvitations = (entries = []) =>
    (Array.isArray(entries) ? entries : [])
        .map((entry) => ({
            clanName: typeof entry?.clanName === 'string' ? entry.clanName.trim() : '',
            clanAbbreviation: typeof entry?.clanAbbreviation === 'string' ? entry.clanAbbreviation.trim() : '',
            invitedBy: typeof entry?.invitedBy === 'string' ? entry.invitedBy.trim() : '',
            invitedUsername: typeof entry?.invitedUsername === 'string' ? entry.invitedUsername.trim() : '',
            invitedAt: entry?.invitedAt || null,
        }))
        .filter((entry) => entry.clanName && entry.invitedBy && entry.invitedUsername);

const normalizeCustomRankList = (value, fallbackLabel) => {
    if (Array.isArray(value)) {
        return value
            .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
            .filter(Boolean)
            .slice(0, 25);
    }
    if (typeof value === 'string' && value.trim() && value.trim() !== fallbackLabel) {
        return [value.trim()];
    }
    return [];
};

const normalizeClanRankNames = (value = {}) => ({
    clanLeader: normalizeCustomRankList(value?.clanLeader, DEFAULT_CLAN_RANK_NAMES.clanLeader),
    leader: normalizeCustomRankList(value?.leader, DEFAULT_CLAN_RANK_NAMES.leader),
    captain: normalizeCustomRankList(value?.captain, DEFAULT_CLAN_RANK_NAMES.captain),
    lieutenant: normalizeCustomRankList(value?.lieutenant, DEFAULT_CLAN_RANK_NAMES.lieutenant),
    member: normalizeCustomRankList(value?.member, DEFAULT_CLAN_RANK_NAMES.member),
    trial: normalizeCustomRankList(value?.trial, DEFAULT_CLAN_RANK_NAMES.trial),
});

const CLAN_RANK_KEYS = ['clanLeader', 'leader', 'captain', 'lieutenant', 'member', 'trial'];

const normalizeClanRankKey = (value, fallbackUser = {}, clan = null) => {
    const raw = typeof value === 'string' ? value.trim() : '';
    if (CLAN_RANK_KEYS.includes(raw)) {
        return raw;
    }

    const rankLabel = typeof clan?.rank === 'string' ? clan.rank.trim().toLowerCase() : '';
    if (rankLabel === 'clan leader') {
        return 'clanLeader';
    }
    if (rankLabel === 'leader') {
        if (
            typeof clan?.createdBy === 'string' &&
            typeof fallbackUser?.username === 'string' &&
            clan.createdBy.trim().toLowerCase() === fallbackUser.username.trim().toLowerCase()
        ) {
            return 'clanLeader';
        }
        return 'leader';
    }
    if (rankLabel === 'captain') {
        return 'captain';
    }
    if (rankLabel === 'lieutenant') {
        return 'lieutenant';
    }
    if (rankLabel === 'member') {
        return 'member';
    }
    if (rankLabel === 'trial') {
        return 'trial';
    }

    if (
        typeof clan?.createdBy === 'string' &&
        typeof fallbackUser?.username === 'string' &&
        clan.createdBy.trim().toLowerCase() === fallbackUser.username.trim().toLowerCase()
    ) {
        return 'clanLeader';
    }

    return 'member';
};

const resolveClanRankLabel = (rankKey, customRankName = '') => {
    const baseLabel = resolveBaseClanRankLabel(rankKey);
    const label = typeof customRankName === 'string' ? customRankName.trim() : '';
    if (!label) {
        return baseLabel;
    }
    return `${label} (Based On ${baseLabel})`;
};

const resolveBaseClanRankLabel = (rankKey) =>
    DEFAULT_CLAN_RANK_NAMES[normalizeClanRankKey(rankKey)] || DEFAULT_CLAN_RANK_NAMES.member;

const clanRankHasPermission = (rankKey, permission) => {
    const normalizedRankKey = normalizeClanRankKey(rankKey);
    const permissionMap = {
        clanLeader: {
            invite: true,
            assignRanks: true,
            manageInfo: true,
            manageAvatar: true,
        },
        leader: {
            invite: true,
            assignRanks: true,
            manageInfo: false,
            manageAvatar: true,
        },
        captain: {
            invite: true,
            assignRanks: true,
            manageInfo: false,
            manageAvatar: false,
        },
        lieutenant: {
            invite: true,
            assignRanks: false,
            manageInfo: false,
            manageAvatar: false,
        },
        member: {
            invite: false,
            assignRanks: false,
            manageInfo: false,
            manageAvatar: false,
        },
        trial: {
            invite: false,
            assignRanks: false,
            manageInfo: false,
            manageAvatar: false,
        },
    };
    return Boolean(permissionMap[normalizedRankKey]?.[permission]);
};

const normalizeRecentQuickGames = (entries = []) => {
    const cutoff = Date.now() - QUICK_GAME_RETENTION_MS;
    return (Array.isArray(entries) ? entries : [])
        .map((entry) => ({
            playedAt: entry?.playedAt || null,
            opponentUsername:
                typeof entry?.opponentUsername === 'string' ? entry.opponentUsername.trim() : '',
            winnerUsername:
                typeof entry?.winnerUsername === 'string' ? entry.winnerUsername.trim() : '',
        }))
        .filter((entry) => entry.playedAt && entry.opponentUsername)
        .map((entry) => {
            const playedDate = new Date(entry.playedAt);
            return Number.isNaN(playedDate.getTime())
                ? null
                : {
                      ...entry,
                      playedAt: playedDate,
                  };
        })
        .filter(Boolean)
        .filter((entry) => entry.playedAt.getTime() >= cutoff)
        .sort((left, right) => right.playedAt.getTime() - left.playedAt.getTime())
        .slice(0, 25);
};

const normalizeRecentLadderGames = (entries = []) => {
    const cutoff = Date.now() - QUICK_GAME_RETENTION_MS;
    return (Array.isArray(entries) ? entries : [])
        .map((entry) => ({
            playedAt: entry?.playedAt || null,
            opponentUsername:
                typeof entry?.opponentUsername === 'string' ? entry.opponentUsername.trim() : '',
            winnerUsername:
                typeof entry?.winnerUsername === 'string' ? entry.winnerUsername.trim() : '',
            expDelta: Number(entry?.expDelta) || 0,
            clanExpDelta: Math.max(0, Number(entry?.clanExpDelta) || 0),
        }))
        .filter((entry) => entry.playedAt && entry.opponentUsername)
        .map((entry) => {
            const playedDate = new Date(entry.playedAt);
            return Number.isNaN(playedDate.getTime())
                ? null
                : {
                      ...entry,
                      playedAt: playedDate,
                  };
        })
        .filter(Boolean)
        .filter((entry) => entry.playedAt.getTime() >= cutoff)
        .sort((left, right) => right.playedAt.getTime() - left.playedAt.getTime())
        .slice(0, 25);
};

const normalizeUserProfile = (user = {}) => {
    const defaults = buildDefaultUserProfile(user);
    const source = user.profile && typeof user.profile === 'object' ? user.profile : {};
    const ladder = source.ladder && typeof source.ladder === 'object' ? source.ladder : {};
    const activity = source.activity && typeof source.activity === 'object' ? source.activity : {};
    const matchmaking =
        source.matchmaking && typeof source.matchmaking === 'object' ? source.matchmaking : {};
    const clan =
        source.clan && typeof source.clan === 'object'
            ? (() => {
                  const customRankNames = normalizeClanRankNames(source.clan.customRankNames);
                  const rankKey = normalizeClanRankKey(source.clan.rankKey, user, source.clan);
                  return {
                      name: typeof source.clan.name === 'string' ? source.clan.name : '',
                      abbreviation:
                          typeof source.clan.abbreviation === 'string' ? source.clan.abbreviation : '',
                      rankKey,
                      customRankName:
                          typeof source.clan.customRankName === 'string' ? source.clan.customRankName.trim() : '',
                      rank:
                          typeof source.clan.customRankName === 'string' && source.clan.customRankName.trim()
                              ? resolveClanRankLabel(rankKey, source.clan.customRankName)
                          : resolveBaseClanRankLabel(rankKey),
                      avatarUrl:
                          typeof source.clan.avatarUrl === 'string' ? source.clan.avatarUrl.trim() : '',
                      joinedAt: source.clan.joinedAt || null,
                      bio: typeof source.clan.bio === 'string' ? source.clan.bio : '',
                      experiencePoints: Math.max(0, Number(source.clan.experiencePoints) || 0),
                      createdBy: typeof source.clan.createdBy === 'string' ? source.clan.createdBy : '',
                      createdAt: source.clan.createdAt || null,
                      customRankNames,
                  };
              })()
            : null;

    const storedExperiencePoints = Number.isFinite(Number(ladder.experiencePoints))
        ? Math.max(0, Number(ladder.experiencePoints))
        : defaults.ladder.experiencePoints;
    const storedLevel = Number.isFinite(Number(ladder.level))
        ? Math.max(1, Number(ladder.level))
        : defaults.ladder.level;
    const inferredExperiencePoints = Math.max(
        storedExperiencePoints,
        getCumulativeExperienceForLevel(storedLevel)
    );
    const normalizedLadderState = deriveLadderStateFromExperience(inferredExperiencePoints);
    const isHokage = Boolean(ladder.isHokage) && normalizedLadderState.level >= 46;
    const rankInfo = getRankInfoForLevel(normalizedLadderState.level, isHokage);

    return {
        avatarUrl:
            typeof source.avatarUrl === 'string' && source.avatarUrl.trim()
                ? source.avatarUrl.trim() === LEGACY_DEFAULT_PROFILE_AVATAR
                    ? defaults.avatarUrl
                    : source.avatarUrl.trim()
                : defaults.avatarUrl,
        backgrounds: {
            selectionUrl:
                typeof source.backgrounds?.selectionUrl === 'string'
                    ? source.backgrounds.selectionUrl.trim()
                    : defaults.backgrounds.selectionUrl,
            ingameUrl:
                typeof source.backgrounds?.ingameUrl === 'string'
                    ? source.backgrounds.ingameUrl.trim()
                    : defaults.backgrounds.ingameUrl,
        },
        posts: Number.isFinite(Number(source.posts)) ? Math.max(0, Number(source.posts)) : defaults.posts,
        ryo: Number.isFinite(Number(source.ryo))
            ? Math.max(0, Math.round(Number(source.ryo)))
            : defaults.ryo,
        clan,
        clanInvitations: normalizeClanInvitations(source.clanInvitations),
        recentQuickGames: normalizeRecentQuickGames(source.recentQuickGames),
        recentPrivateGames: normalizeRecentQuickGames(source.recentPrivateGames),
        recentLadderGames: normalizeRecentLadderGames(source.recentLadderGames),
        recentQuickGamesCount24Hours: normalizeRecentQuickGames(source.recentQuickGames).length,
        recentPrivateGamesCount24Hours: normalizeRecentQuickGames(source.recentPrivateGames).length,
        recentLadderGamesCount24Hours: normalizeRecentLadderGames(source.recentLadderGames).length,
        missions: normalizeMissionState(source.missions),
        story: normalizeStoryState(source.story),
        gauntlet: normalizeGauntletState(source.gauntlet),
        matchmaking: {
            battleBotEnabled:
                typeof matchmaking.battleBotEnabled === 'boolean'
                    ? matchmaking.battleBotEnabled
                    : defaults.matchmaking.battleBotEnabled,
        },
        ladder: {
            level: normalizedLadderState.level,
            rank: rankInfo.rank,
            rankHatUrl: rankInfo.hatUrl,
            experiencePoints: normalizedLadderState.experiencePoints,
            experienceIntoLevel: normalizedLadderState.experienceIntoLevel,
            experienceForNextLevel: normalizedLadderState.experienceForNextLevel,
            experienceToNextLevel: normalizedLadderState.experienceToNextLevel,
            ladderRank: Number.isFinite(Number(ladder.ladderRank))
                ? Math.max(1, Number(ladder.ladderRank))
                : null,
            wins: Number.isFinite(Number(ladder.wins)) ? Math.max(0, Number(ladder.wins)) : defaults.ladder.wins,
            losses: Number.isFinite(Number(ladder.losses))
                ? Math.max(0, Number(ladder.losses))
                : defaults.ladder.losses,
            streak: Number.isFinite(Number(ladder.streak)) ? Number(ladder.streak) : defaults.ladder.streak,
            highestStreak: Number.isFinite(Number(ladder.highestStreak))
                ? Number(ladder.highestStreak)
                : defaults.ladder.highestStreak,
            highestLevel: Math.max(
                normalizedLadderState.level,
                Number.isFinite(Number(ladder.highestLevel))
                    ? Math.max(1, Number(ladder.highestLevel))
                    : defaults.ladder.highestLevel
            ),
            famePoints: Number.isFinite(Number(ladder.famePoints))
                ? Math.max(0, Number(ladder.famePoints))
                : defaults.ladder.famePoints,
            isHokage,
        },
        activity: {
            lastOnlineAt: activity.lastOnlineAt || defaults.activity.lastOnlineAt,
            currentPage: typeof activity.currentPage === 'string' ? activity.currentPage.trim().slice(0, 120) : '',
        },
    };
};

const isGameBotUsername = (username) =>
    typeof username === 'string' && username.trim().toLowerCase().startsWith(GAME_BOT_USERNAME_PREFIX);

const getPlayerDisplayName = (player) => {
    const displayName =
        typeof player?.displayName === 'string' && player.displayName.trim()
            ? player.displayName.trim()
            : '';
    if (displayName) {
        return displayName;
    }
    const username = typeof player?.username === 'string' ? player.username.trim() : '';
    return isGameBotUsername(username) ? GAME_BOT_DISPLAY_NAME : username;
};

const recordRecentQuickGameForUsers = async ({ players, winnerUsername, endedAt }) => {
    const usernames = Array.isArray(players)
        ? players
              .map((player) => (typeof player?.username === 'string' ? player.username : ''))
              .filter(Boolean)
        : [];
    if (usernames.length < 2) {
        return;
    }

    const endedDate = endedAt instanceof Date ? endedAt : new Date(endedAt || Date.now());
    const existingUsers = await usersCollection
        .find(
            { username: { $in: usernames } },
            {
                projection: {
                    _id: 1,
                    username: 1,
                    profile: 1,
                    createdAt: 1,
                },
            }
        )
        .toArray();

    await Promise.all(
        existingUsers.map(async (user) => {
            const opponentPlayer = (Array.isArray(players) ? players : []).find(
                (player) => player?.username && player.username !== user.username
            );
            const opponentUsername = getPlayerDisplayName(opponentPlayer) || '';
            const winnerPlayer = (Array.isArray(players) ? players : []).find(
                (player) => player?.username && player.username === winnerUsername
            );
            const profile = normalizeUserProfile(user);
            const didWin = Boolean(winnerUsername) && winnerUsername === user.username;
            profile.ryo =
                Math.max(0, Number(profile.ryo) || 0) +
                (didWin ? QUICK_WIN_RYO : winnerUsername ? QUICK_LOSS_RYO : 0);
            profile.recentQuickGames = normalizeRecentQuickGames([
                {
                    playedAt: endedDate,
                    opponentUsername,
                    winnerUsername: getPlayerDisplayName(winnerPlayer) || winnerUsername || '',
                },
                ...(Array.isArray(profile.recentQuickGames) ? profile.recentQuickGames : []),
            ]);
            await usersCollection.updateOne(
                { _id: user._id },
                {
                    $set: {
                        profile,
                    },
                }
            );
        })
    );
};

const recordRecentPrivateGameForUsers = async ({ players, winnerUsername, endedAt }) => {
    const usernames = Array.isArray(players)
        ? players
              .map((player) => (typeof player?.username === 'string' ? player.username : ''))
              .filter(Boolean)
        : [];
    if (usernames.length < 2) {
        return;
    }

    const endedDate = endedAt instanceof Date ? endedAt : new Date(endedAt || Date.now());
    const existingUsers = await usersCollection
        .find(
            { username: { $in: usernames } },
            {
                projection: {
                    _id: 1,
                    username: 1,
                    profile: 1,
                    createdAt: 1,
                },
            }
        )
        .toArray();

    await Promise.all(
        existingUsers.map(async (user) => {
            const opponentPlayer = (Array.isArray(players) ? players : []).find(
                (player) => player?.username && player.username !== user.username
            );
            const opponentUsername = getPlayerDisplayName(opponentPlayer) || '';
            const winnerPlayer = (Array.isArray(players) ? players : []).find(
                (player) => player?.username && player.username === winnerUsername
            );
            const profile = normalizeUserProfile(user);
            profile.recentPrivateGames = normalizeRecentQuickGames([
                {
                    playedAt: endedDate,
                    opponentUsername,
                    winnerUsername: getPlayerDisplayName(winnerPlayer) || winnerUsername || '',
                },
                ...(Array.isArray(profile.recentPrivateGames) ? profile.recentPrivateGames : []),
            ]);
            await usersCollection.updateOne(
                { _id: user._id },
                {
                    $set: {
                        profile,
                    },
                }
            );
        })
    );
};

const teamHasCharacterId = (match, username, characterId) => {
    if (!match || !username || !characterId) {
        return false;
    }
    const playerEntry = Array.isArray(match.players)
        ? match.players.find((player) => player && player.username === username)
        : null;
    const team = Array.isArray(playerEntry?.team) ? playerEntry.team : [];
    return team.some((rosterIndex) => getRosterCharacterId(rosterIndex) === characterId);
};

const getSkillUseCountForUser = (match, username, skillId, characterId = '') => {
    if (!match || !username || !skillId) {
        return 0;
    }
    const units = Array.isArray(match.board?.[username]) ? match.board[username] : [];
    return units.reduce((total, unit) => {
        if (!unit) {
            return total;
        }
        if (characterId && getRosterCharacterId(unit.rosterIndex) !== characterId) {
            return total;
        }
        const skillUses = unit?.state?.skillUses;
        const uses =
            skillUses && typeof skillUses === 'object' ? Math.max(0, Number(skillUses[skillId]) || 0) : 0;
        return total + uses;
    }, 0);
};

const applyMissionProgressForUsers = async (match, winnerUsername, endedAt) => {
    if (!match || !Array.isArray(match.players) || match.players.length < 2) {
        return null;
    }
    if (match.mode !== 'quick' && match.mode !== 'ladder') {
        return null;
    }

    const usernames = match.players
        .map((player) => (typeof player?.username === 'string' ? player.username : ''))
        .filter(Boolean);
    if (!usernames.length) {
        return null;
    }

    const users = await usersCollection
        .find(
            { username: { $in: usernames } },
            {
                projection: {
                    _id: 1,
                    username: 1,
                    profile: 1,
                    createdAt: 1,
                },
            }
        )
        .toArray();
    if (!users.length) {
        return null;
    }

    const userByUsername = new Map(users.map((user) => [user.username, user]));
    const missionCatalog = await getStoredMissionCatalog();
    const missionResultsByUsername = new Map();

    await Promise.all(
        usernames.map(async (username) => {
            const user = userByUsername.get(username);
            if (!user) {
                return;
            }

            const profile = normalizeUserProfile(user);
            const missionState = normalizeMissionState(profile.missions);
            const progressByMissionId = {
                ...(missionState.progressByMissionId || {}),
            };
            const unlockedIds = new Set(missionState.unlockedCharacterIds || []);
            const userLevel = Number(profile?.ladder?.level) || 1;
            const didWin = Boolean(winnerUsername) && winnerUsername === username;
            let mutated = false;
            const completedMissionIds = [];
            const unlockedCharacterIds = [];

            for (const mission of missionCatalog) {
                if (!mission || !mission.missionId) {
                    continue;
                }

                const levelRequirement = Math.max(0, Number(mission.level_requirement) || 0);
                if (levelRequirement > 0 && userLevel < levelRequirement) {
                    continue;
                }

                const allowedModes = Array.isArray(mission.mode_restriction?.allowed_modes)
                    ? mission.mode_restriction.allowed_modes
                    : ['quick', 'ladder'];
                if (!allowedModes.includes(match.mode)) {
                    continue;
                }

                const rewardCharacterId = normalizeCharacterId(mission.reward_character);
                const missionGoals = normalizeMissionGoalList(mission.goals || []);
                const trackedGoals = missionGoals;
                const existingProgress = normalizeMissionProgressEntry(
                    progressByMissionId[mission.missionId] || {}
                );
                const alreadyCompleted = Boolean(existingProgress.completedAt);
                const existingGoalProgressByIndex = {
                    ...(existingProgress.goalProgressByIndex || existingProgress.goalProgress || {}),
                };
                if (rewardCharacterId && unlockedIds.has(rewardCharacterId)) {
                    if (!alreadyCompleted) {
                        progressByMissionId[mission.missionId] = normalizeMissionProgressEntry({
                            ...existingProgress,
                            completedAt: endedAt || existingProgress.completedAt || new Date(),
                        });
                        mutated = true;
                    }
                    continue;
                }
                const nextGoalProgressByIndex = { ...existingGoalProgressByIndex };
                let hasTrackableGoals = false;
                let allTrackableGoalsComplete = trackedGoals.length > 0;

                trackedGoals.forEach((goal, goalIndex) => {
                    if (!goal || !goal.type) {
                        return;
                    }
                    const goalType = String(goal.type).trim().toLowerCase();
                    if (
                        goalType !== 'win_matches' &&
                        goalType !== 'win_streak' &&
                        goalType !== 'reach_rank' &&
                        goalType !== 'win_matches_same_team' &&
                        goalType !== 'win_streak_any' &&
                        goalType !== 'win_matches_any' &&
                        goalType !== 'use_skill'
                    ) {
                        return;
                    }
                    hasTrackableGoals = true;
                    const targetCount =
                        goalType === 'reach_rank'
                            ? Math.max(0, Number(goal.rank) || 0)
                            : Math.max(0, Number(goal.wins) || 0);
                    if (!targetCount) {
                        allTrackableGoalsComplete = false;
                        return;
                    }
                    const goalCharacterId = normalizeCharacterId(goal.character_id);
                    const hasGoalCharacter = goalCharacterId
                        ? teamHasCharacterId(match, username, goalCharacterId)
                        : true;
                    const sameTeamCharacterIds = Array.isArray(goal.character_ids)
                        ? goal.character_ids.map((value) => normalizeCharacterId(value)).filter(Boolean)
                        : [];
                    const hasSameTeamCharacters =
                        sameTeamCharacterIds.length >= 2 &&
                        sameTeamCharacterIds.every((characterId) =>
                            teamHasCharacterId(match, username, characterId)
                        );
                    const anyStreakCharacterIds = Array.isArray(goal.character_ids)
                        ? goal.character_ids.map((value) => normalizeCharacterId(value)).filter(Boolean)
                        : [];
                    const hasAnyStreakCharacter =
                        anyStreakCharacterIds.length > 0 &&
                        anyStreakCharacterIds.some((characterId) => teamHasCharacterId(match, username, characterId));
                    const existingGoalProgress = normalizeMissionGoalProgressEntry(
                        nextGoalProgressByIndex[goalIndex] || {}
                    );
                    const nextGoalProgress = {
                        ...existingGoalProgress,
                    };

                    if (goalType === 'win_matches') {
                        if (didWin && hasGoalCharacter) {
                            nextGoalProgress.count = Math.min(
                                targetCount,
                                Math.max(0, Number(existingGoalProgress.count) || 0) + 1
                            );
                        }
                    } else if (goalType === 'win_streak') {
                        if (didWin && hasGoalCharacter) {
                            nextGoalProgress.count = Math.min(
                                targetCount,
                                Math.max(0, Number(existingGoalProgress.count) || 0) + 1
                            );
                        } else if (winnerUsername) {
                            nextGoalProgress.count = 0;
                        }
                    } else if (goalType === 'reach_rank') {
                        nextGoalProgress.count = Math.min(targetCount, Math.max(0, userLevel));
                    } else if (goalType === 'win_matches_same_team') {
                        if (didWin && hasSameTeamCharacters) {
                            nextGoalProgress.count = Math.min(
                                targetCount,
                                Math.max(0, Number(existingGoalProgress.count) || 0) + 1
                            );
                        }
                    } else if (goalType === 'win_streak_any') {
                        if (didWin && hasAnyStreakCharacter) {
                            nextGoalProgress.count = Math.min(
                                targetCount,
                                Math.max(0, Number(existingGoalProgress.count) || 0) + 1
                            );
                        } else if (winnerUsername) {
                            nextGoalProgress.count = 0;
                        }
                    } else if (goalType === 'win_matches_any') {
                        if (didWin && hasAnyStreakCharacter) {
                            nextGoalProgress.count = Math.min(
                                targetCount,
                                Math.max(0, Number(existingGoalProgress.count) || 0) + 1
                            );
                        }
                    } else if (goalType === 'use_skill') {
                        const skillId = String(goal.skill_id || '').trim().toLowerCase();
                        if (skillId) {
                            const usesThisMatch = getSkillUseCountForUser(
                                match,
                                username,
                                skillId,
                                goalCharacterId || ''
                            );
                            if (usesThisMatch > 0) {
                                nextGoalProgress.count = Math.min(
                                    targetCount,
                                    Math.max(0, Number(existingGoalProgress.count) || 0) + usesThisMatch
                                );
                            }
                        }
                    }

                    if (nextGoalProgress.count >= targetCount) {
                        nextGoalProgress.completedAt =
                            existingGoalProgress.completedAt || endedAt || new Date();
                    }
                    nextGoalProgress.updatedAt = endedAt || new Date();
                    nextGoalProgressByIndex[goalIndex] = normalizeMissionGoalProgressEntry(
                        nextGoalProgress
                    );

                    if (!nextGoalProgressByIndex[goalIndex].completedAt) {
                        allTrackableGoalsComplete = false;
                    }
                });

                const nextProgress = normalizeMissionProgressEntry({
                    ...existingProgress,
                    goalProgressByIndex: nextGoalProgressByIndex,
                    goalProgress: nextGoalProgressByIndex,
                });

                if (hasTrackableGoals && allTrackableGoalsComplete) {
                    nextProgress.completedAt = existingProgress.completedAt || endedAt || new Date();
                    nextProgress.unlockedAt = nextProgress.completedAt;
                    if (!alreadyCompleted) {
                        completedMissionIds.push(mission.missionId);
                    }
                    if (rewardCharacterId && !unlockedIds.has(rewardCharacterId)) {
                        unlockedIds.add(rewardCharacterId);
                        unlockedCharacterIds.push(rewardCharacterId);
                    }
                }

                const progressChanged =
                    JSON.stringify(nextProgress) !== JSON.stringify(existingProgress);
                if (progressChanged) {
                    progressByMissionId[mission.missionId] = nextProgress;
                    mutated = true;
                } else if (
                    rewardCharacterId &&
                    hasTrackableGoals &&
                    allTrackableGoalsComplete &&
                    !unlockedIds.has(rewardCharacterId)
                ) {
                    unlockedIds.add(rewardCharacterId);
                    unlockedCharacterIds.push(rewardCharacterId);
                    mutated = true;
                }
            }

            if (!mutated) {
                return;
            }

            profile.missions = {
                ...profile.missions,
                progressByMissionId,
                progress: progressByMissionId,
                unlockedCharacterIds: Array.from(unlockedIds),
            };

            const normalizedProfile = normalizeUserProfile({
                ...user,
                profile,
            });
            await usersCollection.updateOne(
                { _id: user._id },
                {
                    $set: {
                        profile: normalizedProfile,
                    },
                }
            );
            missionResultsByUsername.set(username, {
                completedMissionIds: Array.from(new Set(completedMissionIds)),
                unlockedCharacterIds: Array.from(new Set(unlockedCharacterIds)),
                unlockedCharacters: Array.from(new Set(unlockedCharacterIds)).map((characterId) => ({
                    characterId,
                    name: getCharacterDisplayNameById(characterId),
                })),
            });
        })
    );

    return Object.fromEntries(missionResultsByUsername);
};

const applyStoryProgressForUsers = async (match, winnerUsername, endedAt) => {
    if (!match || match.mode !== 'story' || !winnerUsername) {
        return null;
    }
    const nodeId = typeof match.storyMatch?.nodeId === 'string' ? match.storyMatch.nodeId : '';
    if (!nodeId) {
        return null;
    }
    const humanPlayer = (Array.isArray(match.players) ? match.players : []).find(
        (player) => player?.username && !isGameBotUsername(player.username)
    );
    if (!humanPlayer || humanPlayer.username !== winnerUsername) {
        return null;
    }

    const user = await usersCollection.findOne(
        { username: humanPlayer.username },
        { projection: { _id: 1, username: 1, createdAt: 1, profile: 1 } }
    );
    if (!user) {
        return null;
    }

    const storyCatalog = await getStoredStoryCatalog();
    const found = findStoryNode(storyCatalog, nodeId);
    const profile = normalizeUserProfile(user);
    const storyState = normalizeStoryState(profile.story);
    const progressByNodeId = { ...storyState.progressByNodeId };
    const previousProgress = normalizeStoryProgressEntry(progressByNodeId[nodeId]);
    const isHardMode = match.storyMatch?.difficulty === 'hard';
    const completedAt = previousProgress.completedAt || endedAt || new Date();
    const hardCompletedAt = isHardMode
        ? previousProgress.hardCompletedAt || endedAt || new Date()
        : previousProgress.hardCompletedAt;
    const shouldAwardHardRyo = isHardMode && !previousProgress.hardRyoAwardedAt;
    const hardRyoAwarded = previousProgress.hardRyoAwarded + (shouldAwardHardRyo ? STORY_HARD_MODE_RYO_REWARD : 0);
    progressByNodeId[nodeId] = normalizeStoryProgressEntry({
        completedAt,
        hardCompletedAt,
        hardRyoAwardedAt: shouldAwardHardRyo
            ? endedAt || new Date()
            : previousProgress.hardRyoAwardedAt,
        hardRyoAwarded,
    });

    const rewardCharacterId = normalizeCharacterId(found?.node?.reward_character);
    const missionState = normalizeMissionState(profile.missions);
    const unlockedIds = new Set(missionState.unlockedCharacterIds || []);
    let unlockedIdsChanged = false;
    if (rewardCharacterId && !unlockedIds.has(rewardCharacterId)) {
        unlockedIds.add(rewardCharacterId);
        unlockedIdsChanged = true;
    }

    if (shouldAwardHardRyo) {
        profile.ryo = Math.max(0, Number(profile.ryo) || 0) + STORY_HARD_MODE_RYO_REWARD;
    }

    const progressChanged =
        progressByNodeId[nodeId].completedAt !== previousProgress.completedAt ||
        progressByNodeId[nodeId].hardCompletedAt !== previousProgress.hardCompletedAt ||
        progressByNodeId[nodeId].hardRyoAwardedAt !== previousProgress.hardRyoAwardedAt ||
        progressByNodeId[nodeId].hardRyoAwarded !== previousProgress.hardRyoAwarded;
    const result = {
        nodeId,
        difficulty: isHardMode ? 'hard' : 'normal',
        hardCompleted: Boolean(progressByNodeId[nodeId].hardCompletedAt),
        hardFirstClear: shouldAwardHardRyo,
        ryoDelta: shouldAwardHardRyo ? STORY_HARD_MODE_RYO_REWARD : 0,
        rewardCharacterId: unlockedIdsChanged ? rewardCharacterId : null,
        unlockedCharacters: unlockedIdsChanged
            ? [{ characterId: rewardCharacterId, name: getCharacterDisplayNameById(rewardCharacterId) }]
            : [],
    };

    if (!progressChanged && !unlockedIdsChanged && !shouldAwardHardRyo) {
        return null;
    }

    profile.story = { progressByNodeId };
    if (unlockedIdsChanged) {
        profile.missions = {
            ...profile.missions,
            unlockedCharacterIds: Array.from(unlockedIds),
        };
    }

    const normalizedProfile = normalizeUserProfile({ ...user, profile });
    await usersCollection.updateOne(
        { _id: user._id },
        {
            $set: {
                profile: normalizedProfile,
            },
        }
    );
    return { [humanPlayer.username]: result };
};

const pickGauntletRandomEntry = (rng, entries = []) => {
    const pool = Array.isArray(entries) ? entries.filter(Boolean) : [];
    return pool[Math.floor(rng() * pool.length)] || pool[0] || null;
};

const buildGauntletModifierSummary = (runState = {}) =>
    Array.from(new Set(Array.isArray(runState.relics) ? runState.relics : []))
        .map((id) => {
            const relic = gauntlet.getRelicById(id);
            const curse = gauntlet.getCurseById(id);
            const source = relic || curse;
            if (!source) return null;
            return {
                id: source.id,
                name: source.name || source.id,
                description: source.description || '',
                isCurse: Boolean(source.isCurse || curse),
            };
        })
        .filter(Boolean);

const getGauntletRng = (runState = {}, node = {}, purpose = '') =>
    gauntlet.createSeededRng(`${runState.seed || 'gauntlet'}:${node.id || ''}:${purpose}`);

const getOppositeGauntletScrollType = (runState = {}) =>
    runState.startingScrollType === gauntlet.EXAM_SCROLL_TYPES.EARTH
        ? gauntlet.EXAM_SCROLL_TYPES.HEAVEN
        : gauntlet.EXAM_SCROLL_TYPES.EARTH;

const applyGauntletHpDelta = (runState = {}, target = 'all', amount = 0, rng = Math.random) => {
    const delta = Math.round(Number(amount) || 0);
    const hp = Array.isArray(runState.teamHp) ? runState.teamHp.slice() : [];
    const applyAtIndex = (index) => {
        const current = Math.max(1, Math.min(100, Math.round(Number(hp[index]) || 100)));
        hp[index] = Math.max(1, Math.min(100, current + delta));
    };
    if (target === 'one') {
        const livingIndices = hp.map((value, index) => (Number(value) > 0 ? index : null)).filter((index) => index !== null);
        const pickedIndex = livingIndices[Math.floor(rng() * livingIndices.length)] ?? 0;
        applyAtIndex(pickedIndex);
    } else {
        hp.forEach((_, index) => applyAtIndex(index));
    }
    runState.teamHp = hp;
};

const addGauntletRewardToRun = (runState = {}, reward = {}) => {
    runState.ryo = Math.max(0, (Number(runState.ryo) || 0) + (Number(reward.ryo) || 0));
    runState.scrollFragments = Math.max(
        0,
        (Number(runState.scrollFragments) || 0) + (Number(reward.scrollFragments) || 0)
    );
    runState.heavenScrolls = Math.max(0, (Number(runState.heavenScrolls) || 0) + (Number(reward.heavenScrolls) || 0));
    runState.earthScrolls = Math.max(0, (Number(runState.earthScrolls) || 0) + (Number(reward.earthScrolls) || 0));
    runState.relics = Array.from(
        new Set([...(Array.isArray(runState.relics) ? runState.relics : []), ...(Array.isArray(reward.relics) ? reward.relics : [])])
    );
    if (reward.benchAvailable) {
        runState.benchAvailable = true;
    }
    const curseOffers = Array.isArray(reward.curseOffers) ? reward.curseOffers : [];
    if (curseOffers.length > 0) {
        const existing = Array.isArray(runState.pendingOffers) ? runState.pendingOffers : [];
        runState.pendingOffers = [
            ...existing,
            ...curseOffers.map((id) => ({
                type: 'curse',
                id,
                sourceNodeId: reward.nodeId || reward.eventId || null,
            })),
        ];
    }
};

const getGauntletActOneEventForRun = (runState = {}) => {
    const step = Math.max(0, Math.min(3, Math.round(Number(runState.actOneStep) || 0)));
    return step < 3 ? gauntlet.ACT_ONE_EVENTS[step] || null : null;
};

const resolveGauntletActOneChoice = (runState = {}, choiceIndex = 0) => {
    const nextRun = normalizeGauntletRunState(runState);
    const event = getGauntletActOneEventForRun(nextRun);
    const pickedChoice = Array.isArray(event?.choices) ? event.choices[choiceIndex] || null : null;
    if (!event || !pickedChoice) {
        throw new Error('A valid Written Test choice is required.');
    }
    const fakeNode = {
        id: `act1-${nextRun.actOneStep + 1}`,
        row: 0,
        type: gauntlet.NODE_TYPES.EVENT,
        content: { eventId: event.eventId },
    };
    const reward = getGauntletNodeReward(nextRun, fakeNode, { choiceIndex });
    addGauntletRewardToRun(nextRun, reward);
    nextRun.actOneStep += 1;
    nextRun.currentAct = nextRun.actOneStep >= 3 ? 2 : 1;
    nextRun.lastNodeResult = {
        nodeId: fakeNode.id,
        nodeType: 'act1_event',
        clearedAt: new Date(),
        reward,
    };
    return nextRun;
};

const getGauntletBattleReward = (runState = {}, node = {}) => {
    const reward = {
        ryo: 0,
        scrollFragments: 0,
        heavenScrolls: 0,
        earthScrolls: 0,
        relics: [],
        curseOffers: [],
        recruitOffer: false,
        benchAvailable: false,
    };
    const type = typeof node?.type === 'string' ? node.type : '';
    if (type === gauntlet.NODE_TYPES.BATTLE || type === gauntlet.NODE_TYPES.ELITE_BATTLE) {
        const rng = getGauntletRng(runState, node, 'battle-reward');
        const rewardRange = Array.isArray(node.content?.rewardRyo) ? node.content.rewardRyo : [25, 40];
        const minRyo = Math.max(0, Math.round(Number(rewardRange[0]) || 0));
        const maxRyo = Math.max(minRyo, Math.round(Number(rewardRange[1]) || minRyo));
        reward.ryo = minRyo + Math.floor(rng() * (maxRyo - minRyo + 1));
        const scrollDropChance = Math.max(0, Math.min(1, Number(node.content?.scrollDropChance) || 0));
        if (rng() < scrollDropChance) {
            const scrollType = getOppositeGauntletScrollType(runState);
            if (scrollType === gauntlet.EXAM_SCROLL_TYPES.EARTH) {
                reward.earthScrolls = 1;
            } else {
                reward.heavenScrolls = 1;
            }
        }
        if (type === gauntlet.NODE_TYPES.ELITE_BATTLE) {
            reward.scrollFragments = 1;
            const relic = pickGauntletRandomEntry(rng, gauntlet.RELIC_SCROLLS);
            if (relic?.id) {
                reward.relics.push(relic.id);
            }
        }
        return reward;
    }
    return reward;
};

const getGauntletNodeReward = (runState = {}, node = {}, options = {}) => {
    const reward = getGauntletBattleReward(runState, node);
    const type = typeof node?.type === 'string' ? node.type : '';
    if (type === gauntlet.NODE_TYPES.BATTLE || type === gauntlet.NODE_TYPES.ELITE_BATTLE) {
        return reward;
    }
    if (type === gauntlet.NODE_TYPES.EVENT) {
        const event = gauntlet.getEventById(node.content?.eventId);
        const choiceIndex = Math.max(0, Number.parseInt(options.choiceIndex, 10) || 0);
        const pickedChoice = Array.isArray(event?.choices) ? event.choices[choiceIndex] || event.choices[0] : null;
        const rng = getGauntletRng(runState, node, `event-${choiceIndex}`);
        if (pickedChoice) {
            (Array.isArray(pickedChoice.effects) ? pickedChoice.effects : []).forEach((effect = {}) => {
                const amount = Math.round(Number(effect.amount) || 0);
                if (effect.kind === 'ryo') {
                    reward.ryo += amount;
                    return;
                }
                if (effect.kind === 'ryo_range') {
                    const min = Math.round(Number(effect.min) || 0);
                    const max = Math.max(min, Math.round(Number(effect.max) || min));
                    reward.ryo += min + Math.floor(rng() * (max - min + 1));
                    return;
                }
                if (effect.kind === 'fragment') {
                    reward.scrollFragments += amount;
                    return;
                }
                if (effect.kind === 'scroll') {
                    if (effect.scrollType === gauntlet.EXAM_SCROLL_TYPES.EARTH) {
                        reward.earthScrolls += amount;
                    } else {
                        reward.heavenScrolls += amount;
                    }
                    return;
                }
                if (effect.kind === 'random_scroll') {
                    for (let index = 0; index < Math.max(1, amount || 1); index += 1) {
                        if (rng() < 0.5) {
                            reward.heavenScrolls += 1;
                        } else {
                            reward.earthScrolls += 1;
                        }
                    }
                    return;
                }
                if (effect.kind === 'opposite_scroll') {
                    const scrollType = getOppositeGauntletScrollType(runState);
                    if (scrollType === gauntlet.EXAM_SCROLL_TYPES.EARTH) {
                        reward.earthScrolls += Math.max(1, amount || 1);
                    } else {
                        reward.heavenScrolls += Math.max(1, amount || 1);
                    }
                    return;
                }
                if (effect.kind === 'relic' && gauntlet.getRelicById(effect.relicId)) {
                    reward.relics.push(effect.relicId);
                    return;
                }
                if (effect.kind === 'random_relic') {
                    const relic = pickGauntletRandomEntry(rng, gauntlet.RELIC_SCROLLS);
                    if (relic?.id) reward.relics.push(relic.id);
                    return;
                }
                if (effect.kind === 'curse_offer' && gauntlet.getCurseById(effect.curseId)) {
                    reward.curseOffers.push(effect.curseId);
                    return;
                }
                if (effect.kind === 'hp') {
                    applyGauntletHpDelta(runState, effect.target, amount, rng);
                    return;
                }
                if (effect.kind === 'recruit_offer') {
                    reward.recruitOffer = true;
                    reward.benchAvailable = true;
                }
            });
            reward.eventId = event.eventId;
            reward.choiceIndex = choiceIndex;
            reward.choiceLabel = pickedChoice.label;
        }
        return reward;
    }
    if (type === gauntlet.NODE_TYPES.MERCHANT) {
        return reward;
    }
    if (type === gauntlet.NODE_TYPES.REST_CAMP) {
        return reward;
    }
    if (type === gauntlet.NODE_TYPES.SCROLL_CACHE) {
        const scrollType = node.content?.scrollType === gauntlet.EXAM_SCROLL_TYPES.EARTH
            ? gauntlet.EXAM_SCROLL_TYPES.EARTH
            : gauntlet.EXAM_SCROLL_TYPES.HEAVEN;
        if (scrollType === gauntlet.EXAM_SCROLL_TYPES.EARTH) {
            reward.earthScrolls = 1;
        } else {
            reward.heavenScrolls = 1;
        }
    }
    return reward;
};

const applyGauntletNodeClearToRun = (runState = {}, node = {}, options = {}) => {
    const nextRun = normalizeGauntletRunState(runState);
    if (!nextRun || !node) return nextRun;
    const reward = getGauntletNodeReward(nextRun, node, options);
    nextRun.currentAct = node.row >= gauntlet.DEFAULT_ROWS ? 3 : 2;
    nextRun.currentNodeId = node.id;
    nextRun.visitedNodeIds = Array.from(new Set([...(nextRun.visitedNodeIds || []), node.id]));
    nextRun.lockedNodeIds = Array.from(
        new Set([...(nextRun.lockedNodeIds || []), ...(Array.isArray(node.locksSiblings) ? node.locksSiblings : [])])
    );
    nextRun.pendingBattle = null;
    addGauntletRewardToRun(nextRun, reward);
    if (node.type === gauntlet.NODE_TYPES.REST_CAMP) {
        nextRun.teamHp = (Array.isArray(nextRun.teamHp) ? nextRun.teamHp : []).map(() => 100);
    }
    if (node.row === gauntlet.DEFAULT_ROWS) {
        nextRun.currentAct = 3;
        nextRun.actThreeStep = 'preliminary';
    }
    if (node.id === 'act3-preliminary') {
        nextRun.currentAct = 3;
        nextRun.actThreeStep = 'finals';
    }
    if (node.id === 'act3-finals') {
        nextRun.status = 'won';
        nextRun.currentAct = 3;
        nextRun.actThreeStep = 'complete';
        nextRun.endedAt = new Date();
        nextRun.pendingBattle = null;
    }
    nextRun.lastNodeResult = {
        nodeId: node.id,
        nodeType: node.type,
        clearedAt: new Date(),
        reward,
    };
    return nextRun;
};

const applyGauntletProgressForUsers = async (match, winnerUsername, endedAt) => {
    if (!match || match.mode !== 'gauntlet') {
        return null;
    }
    const humanPlayer = (Array.isArray(match.players) ? match.players : []).find(
        (player) => player?.username && !isGameBotUsername(player.username)
    );
    if (!humanPlayer) {
        return null;
    }
    const user = await usersCollection.findOne(
        { username: humanPlayer.username },
        { projection: { _id: 1, username: 1, createdAt: 1, profile: 1 } }
    );
    if (!user) {
        return null;
    }
    const profile = normalizeUserProfile(user);
    const gauntletState = normalizeGauntletState(profile.gauntlet);
    const activeRun = normalizeGauntletRunState(gauntletState.activeRun);
    const matchId = typeof match.matchId === 'string' ? match.matchId : '';
    if (!activeRun?.pendingBattle || activeRun.pendingBattle.matchId !== matchId) {
        return null;
    }
    const node = gauntlet.getNodeById(activeRun.map, activeRun.pendingBattle.nodeId);
    if (!node) {
        return null;
    }
    const humanUnits = Array.isArray(match.board?.[humanPlayer.username]) ? match.board[humanPlayer.username] : [];
    activeRun.teamHp = activeRun.team.map((_, index) => {
        const unit = humanUnits[index];
        if (!unit) return 0;
        return Math.max(0, Math.min(battleLogic.DEFAULT_HP, Math.round(Number(unit.hp) || 0)));
    });

    const didWin = Boolean(winnerUsername) && winnerUsername === humanPlayer.username;
    let nextRun;
    if (didWin) {
        nextRun = applyGauntletNodeClearToRun(activeRun, node);
    } else {
        nextRun = {
            ...activeRun,
            status: 'lost',
            pendingBattle: null,
            endedAt: endedAt || new Date(),
            lastNodeResult: {
                nodeId: node.id,
                nodeType: node.type,
                clearedAt: endedAt || new Date(),
                reward: getGauntletNodeReward(activeRun, node),
                lost: true,
            },
        };
    }

    const runEnded = nextRun.status === 'won' || nextRun.status === 'lost';
    const nextGauntletState = {
        ...gauntletState,
        activeRun: runEnded ? null : nextRun,
        completedRuns: gauntletState.completedRuns + (runEnded ? 1 : 0),
        wins: gauntletState.wins + (nextRun.status === 'won' ? 1 : 0),
        losses: gauntletState.losses + (nextRun.status === 'lost' ? 1 : 0),
    };
    profile.gauntlet = normalizeGauntletState(nextGauntletState);
    const normalizedProfile = normalizeUserProfile({ ...user, profile });
    await usersCollection.updateOne(
        { _id: user._id },
        {
            $set: {
                profile: normalizedProfile,
            },
        }
    );

    return {
        [humanPlayer.username]: {
            didWin,
            nodeId: node.id,
            nodeType: node.type,
            runStatus: nextRun.status,
            runEnded,
            reward: nextRun.lastNodeResult?.reward || null,
            activeRun: runEnded ? null : nextRun,
        },
    };
};

const addClanExperience = async (clanName, clanExpDelta) => {
    const normalizedClanName = typeof clanName === 'string' ? clanName.trim().toLowerCase() : '';
    const gain = Math.max(0, Number(clanExpDelta) || 0);
    if (!normalizedClanName || gain <= 0) {
        return 0;
    }

    const users = await usersCollection
        .find(
            {},
            {
                projection: {
                    _id: 1,
                    profile: 1,
                    createdAt: 1,
                },
            }
        )
        .toArray();

    const matchingUsers = users.filter((entry) => {
        const profile = normalizeUserProfile(entry);
        const clan = profile.clan;
        return (
            clan &&
            String(clan.name || '').trim().toLowerCase() === normalizedClanName
        );
    });

    if (!matchingUsers.length) {
        return 0;
    }

    await Promise.all(
        matchingUsers.map(async (entry) => {
            const profile = normalizeUserProfile(entry);
            if (!profile.clan) {
                return;
            }
            profile.clan.experiencePoints = Math.max(0, Number(profile.clan.experiencePoints) || 0) + gain;
            await usersCollection.updateOne(
                { _id: entry._id },
                {
                    $set: {
                        profile,
                    },
                }
            );
        })
    );

    return gain;
};

const recalculatePlayerLadderStandings = async () => {
    const users = await usersCollection
        .find(
            {},
            {
                projection: {
                    _id: 1,
                    username: 1,
                    createdAt: 1,
                    profile: 1,
                },
            }
        )
        .toArray();

    if (!users.length) {
        return new Map();
    }

    const normalizedUsers = users.map((user) => ({
        user,
        profile: normalizeUserProfile(user),
    }));

    normalizedUsers.sort((left, right) => {
        const leftLadder = left.profile.ladder || {};
        const rightLadder = right.profile.ladder || {};
        if ((rightLadder.level || 0) !== (leftLadder.level || 0)) {
            return (rightLadder.level || 0) - (leftLadder.level || 0);
        }
        if ((rightLadder.experiencePoints || 0) !== (leftLadder.experiencePoints || 0)) {
            return (rightLadder.experiencePoints || 0) - (leftLadder.experiencePoints || 0);
        }
        if ((rightLadder.wins || 0) !== (leftLadder.wins || 0)) {
            return (rightLadder.wins || 0) - (leftLadder.wins || 0);
        }
        return String(left.user.username || '').localeCompare(String(right.user.username || ''));
    });

    const hokageIndex = normalizedUsers.findIndex(
        (entry) => (Number(entry.profile?.ladder?.level) || 0) >= 46
    );
    const updates = [];
    const profileByUsername = new Map();

    normalizedUsers.forEach((entry, index) => {
        const normalizedProfile = normalizeUserProfile(entry.user);
        const shouldBeHokage = hokageIndex >= 0 && index === hokageIndex;
        normalizedProfile.ladder.ladderRank = index + 1;
        normalizedProfile.ladder.isHokage = shouldBeHokage;
        const finalProfile = normalizeUserProfile({
            ...entry.user,
            profile: normalizedProfile,
        });
        profileByUsername.set(entry.user.username, finalProfile);
        const profileChanged =
            JSON.stringify(entry.user.profile || null) !== JSON.stringify(finalProfile);
        if (profileChanged) {
            updates.push(
                usersCollection.updateOne(
                    { _id: entry.user._id },
                    {
                        $set: {
                            profile: finalProfile,
                        },
                    }
                )
            );
        }
    });

    if (updates.length > 0) {
        await Promise.all(updates);
    }

    return profileByUsername;
};

const applyMatchCompletionRewards = async (match, winnerUsername, endedAt) => {
    if (!match || !Array.isArray(match.players) || match.players.length < 2) {
        return null;
    }

    if (match.mode === 'training') {
        return null;
    }

    if (match.mode === 'gauntlet') {
        const gauntletResults = await applyGauntletProgressForUsers(match, winnerUsername, endedAt);
        match.gauntletResults =
            gauntletResults && Object.keys(gauntletResults).length > 0 ? gauntletResults : null;
        return null;
    }

    const missionResults = await applyMissionProgressForUsers(match, winnerUsername, endedAt);
    match.missionResults =
        missionResults && Object.keys(missionResults).length > 0 ? missionResults : null;

    if (match.mode === 'story') {
        const storyResults = await applyStoryProgressForUsers(match, winnerUsername, endedAt);
        match.storyResults =
            storyResults && Object.keys(storyResults).length > 0 ? storyResults : null;
        return null;
    }

    if (match.mode === 'private') {
        await recordRecentPrivateGameForUsers({
            players: match.players || [],
            winnerUsername: winnerUsername || '',
            endedAt,
        });
        return null;
    }

    if (match.mode !== 'ladder') {
        await recordRecentQuickGameForUsers({
            players: match.players || [],
            winnerUsername: winnerUsername || '',
            endedAt,
        });
        return null;
    }

    const usernames = match.players
        .map((player) => (typeof player?.username === 'string' ? player.username : ''))
        .filter(Boolean);
    if (usernames.length < 2) {
        return null;
    }

    const users = await usersCollection
        .find(
            { username: { $in: usernames } },
            {
                projection: {
                    _id: 1,
                    username: 1,
                    createdAt: 1,
                    profile: 1,
                },
            }
        )
        .toArray();
    if (users.length < 1) {
        return null;
    }

    const userByUsername = new Map(users.map((user) => [user.username, user]));
    const initialProfiles = new Map(
        users.map((user) => [user.username, normalizeUserProfile(user)])
    );
    const preliminaryResults = new Map();

    for (const username of usernames) {
        const user = userByUsername.get(username);
        const profile = initialProfiles.get(username);
        const opponentEntry = (Array.isArray(match.players) ? match.players : []).find(
            (entry) => entry?.username && entry.username !== username
        );
        const opponentUsername =
            typeof opponentEntry?.username === 'string' ? opponentEntry.username : '';
        const opponentProfile = initialProfiles.get(opponentUsername) || {
            ...buildDefaultUserProfile(),
            ladder: {
                ...buildDefaultUserProfile().ladder,
                level: Math.max(
                    1,
                    Number(opponentEntry?.ladderLevel) || Number(profile?.ladder?.level) || 1
                ),
            },
        };
        if (!user || !profile) {
            continue;
        }

        const didWin = Boolean(winnerUsername) && winnerUsername === username;
        const expChange = winnerUsername
            ? resolveLadderExperienceDelta({
                  playerLevel: profile.ladder.level,
                  opponentLevel: opponentProfile.ladder.level,
                  didWin,
              })
            : 0;
        const previousExperiencePoints = profile.ladder.experiencePoints;
        const nextExperiencePoints = Math.min(
            LADDER_MAX_EXPERIENCE_POINTS,
            Math.max(0, previousExperiencePoints + expChange)
        );
        const ryoDelta = didWin ? LADDER_WIN_RYO : winnerUsername ? LADDER_LOSS_RYO : 0;
        profile.ladder.experiencePoints = nextExperiencePoints;
        profile.ryo = Math.max(0, Number(profile.ryo) || 0) + ryoDelta;
        if (didWin) {
            profile.ladder.wins += 1;
            profile.ladder.streak = Math.max(0, Number(profile.ladder.streak) || 0) + 1;
            profile.ladder.highestStreak = Math.max(
                Number(profile.ladder.highestStreak) || 0,
                profile.ladder.streak
            );
        } else if (winnerUsername) {
            profile.ladder.losses += 1;
            profile.ladder.streak = 0;
        }

        const expDelta = nextExperiencePoints - previousExperiencePoints;
        const clanRankKey = normalizeClanRankKey(profile.clan?.rankKey || '', user, profile.clan);
        const clanExpDelta =
            expDelta > 0 && profile.clan?.name && clanRankKey !== 'trial'
                ? Math.floor(expDelta / 2)
                : 0;

        profile.recentLadderGames = normalizeRecentLadderGames([
            {
                playedAt: endedAt,
                opponentUsername: getPlayerDisplayName(opponentEntry) || opponentUsername,
                winnerUsername:
                    getPlayerDisplayName(
                        (Array.isArray(match.players) ? match.players : []).find(
                            (entry) => entry?.username && entry.username === winnerUsername
                        )
                    ) ||
                    winnerUsername ||
                    '',
                expDelta,
                clanExpDelta,
            },
            ...(Array.isArray(profile.recentLadderGames) ? profile.recentLadderGames : []),
        ]);

        const normalizedProfile = normalizeUserProfile({
            ...user,
            profile,
        });
        await usersCollection.updateOne(
            { _id: user._id },
            {
                $set: {
                    profile: normalizedProfile,
                },
            }
        );

        if (clanExpDelta > 0) {
            await addClanExperience(profile.clan?.name || '', clanExpDelta);
        }

        preliminaryResults.set(username, {
            didWin,
            expDelta,
            clanExpDelta,
            ryoDelta,
            missionResult: missionResults?.[username] || null,
            previousExperiencePoints,
            previousLevel: initialProfiles.get(username)?.ladder?.level || 1,
            previousRank: initialProfiles.get(username)?.ladder?.rank || 'Academy Student',
        });
    }

    const refreshedProfiles = await recalculatePlayerLadderStandings();
    const results = {};
    usernames.forEach((username) => {
        const prelim = preliminaryResults.get(username);
        const finalProfile = refreshedProfiles.get(username);
        if (!prelim || !finalProfile) {
            return;
        }
        results[username] = {
            didWin: prelim.didWin,
            expDelta: prelim.expDelta,
            clanExpDelta: prelim.clanExpDelta || 0,
            ryoDelta: prelim.ryoDelta || 0,
            missionResult: prelim.missionResult || null,
            previousExperiencePoints: prelim.previousExperiencePoints,
            currentExperiencePoints: finalProfile.ladder.experiencePoints,
            previousLevel: prelim.previousLevel,
            currentLevel: finalProfile.ladder.level,
            previousRank: prelim.previousRank,
            currentRank: finalProfile.ladder.rank,
            ladderRank: finalProfile.ladder.ladderRank || null,
            rankHatUrl: finalProfile.ladder.rankHatUrl || '',
        };
    });

    return results;
};

const serializeUserForClient = (user = {}) => ({
    username: user.username,
    email: user.email,
    role: user.role || 'player',
    createdAt: user.createdAt,
    savedTeamIndices: Array.isArray(user.savedTeamIndices) ? user.savedTeamIndices : [],
    profile: normalizeUserProfile(user),
});

const serializePublicUserProfile = (user = {}) => ({
    username: user.username,
    role: user.role || 'player',
    createdAt: user.createdAt,
    profile: normalizeUserProfile(user),
});

const serializeAdminUserDocument = (user = {}) => ({
    username: user.username,
    usernameLower: user.usernameLower,
    email: user.email,
    passwordHash: user.passwordHash,
    role: user.role || 'player',
    createdAt: user.createdAt,
    savedTeamIndices: Array.isArray(user.savedTeamIndices) ? user.savedTeamIndices : [],
    profile: normalizeUserProfile(user),
});

const normalizeNewsParagraphs = (value) =>
    (Array.isArray(value) ? value : [])
        .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
        .filter(Boolean)
        .slice(0, 100);

const buildCharacterCatalog = () =>
    charactersData.map((character = {}) => ({
        characterId: typeof character.characterId === 'string' ? character.characterId : '',
        name: typeof character.name === 'string' ? character.name : '',
        facePicture: typeof character.facePicture === 'string' ? character.facePicture : '',
        requiredMissionId: typeof character.requiredMissionId === 'string' ? character.requiredMissionId.trim() : '',
        shopPrice: Number.isFinite(Number(character.shopPrice))
            ? Math.max(0, Math.round(Number(character.shopPrice)))
            : 0,
        skills: (Array.isArray(character.skills) ? character.skills : []).map((skill = {}) => ({
            id: typeof skill.id === 'string' ? skill.id : '',
            name: typeof skill.name === 'string' ? skill.name : '',
            skillimage: typeof skill.skillimage === 'string' ? skill.skillimage : '',
        })),
    }));

const getMissionRankKey = (mission = {}) => {
    const level = Math.max(0, Number(mission?.level_requirement) || 0) || 1;
    if (level >= 40) return 's';
    if (level >= 30) return 'a';
    if (level >= 20) return 'b';
    return 'dc';
};

const getShopPriceForMissionRank = (rankKey = 'dc') => {
    const prices = {
        dc: 500,
        b: 1000,
        a: 2500,
        s: 5000,
    };
    return prices[rankKey] || prices.dc;
};

const getShopPriceForMissionId = (missionId = '', missionCatalog = []) => {
    const normalizedMissionId = slugifyMissionId(missionId);
    const mission = (Array.isArray(missionCatalog) ? missionCatalog : []).find(
        (entry) => slugifyMissionId(entry?.missionId) === normalizedMissionId
    );
    return getShopPriceForMissionRank(getMissionRankKey(mission));
};

let characterCatalog = buildCharacterCatalog();

const serializeCharactersDataFile = (nextCharacters) =>
    'const characters = ' +
    JSON.stringify(nextCharacters, null, 4) +
    ';\n\nif (typeof module !== \'undefined\') {\n    module.exports = characters;\n}\n';

const saveCharacters = async (nextCharacters) => {
    if (!appStateCollection) {
        throw new Error('Database not connected.');
    }
    await appStateCollection.updateOne(
        { key: CHARACTERS_STATE_KEY },
        {
            $set: {
                key: CHARACTERS_STATE_KEY,
                characters: nextCharacters,
                updatedAt: new Date(),
            },
        },
        { upsert: true }
    );
    charactersData = nextCharacters;
    characterCatalog = buildCharacterCatalog();
};

// Admin edits made through the Character Editor (including images) are stored in
// Mongo so they survive redeploys/restarts on hosts with an ephemeral filesystem.
// characters.js remains the version-controlled seed and the source for new
// characters shipped in code; it is merged in below without resurrecting anything
// the admin has deliberately deleted by characterId.
const getStoredCharacters = async () => {
    const defaultCharacters = Array.isArray(charactersData) ? charactersData : [];
    if (!appStateCollection) {
        return defaultCharacters;
    }

    const storedState = await appStateCollection.findOne({ key: CHARACTERS_STATE_KEY });
    if (!storedState || !Array.isArray(storedState.characters)) {
        const now = new Date();
        await appStateCollection.updateOne(
            { key: CHARACTERS_STATE_KEY },
            { $set: { key: CHARACTERS_STATE_KEY, characters: defaultCharacters, updatedAt: now } },
            { upsert: true }
        );
        await appStateCollection.updateOne(
            { key: CHARACTER_MIGRATIONS_STATE_KEY },
            {
                $set: {
                    key: CHARACTER_MIGRATIONS_STATE_KEY,
                    [`completed.${STARTER_REBALANCE_MIGRATION_ID}`]: now,
                    [`completed.${EXAMS_REBALANCE_MIGRATION_ID}`]: now,
                    updatedAt: now,
                },
            },
            { upsert: true }
        );
        return defaultCharacters;
    }

    const migrationState =
        (await appStateCollection.findOne({ key: CHARACTER_MIGRATIONS_STATE_KEY })) || {};
    const completedMigrations =
        migrationState.completed && typeof migrationState.completed === 'object'
            ? migrationState.completed
            : {};
    const shouldApplyStarterRebalance = !completedMigrations[STARTER_REBALANCE_MIGRATION_ID];
    const shouldApplyExamsRebalance = !completedMigrations[EXAMS_REBALANCE_MIGRATION_ID];
    const characterIdsToRefresh = new Set([
        ...(shouldApplyStarterRebalance ? Array.from(STARTER_REBALANCE_CHARACTER_IDS) : []),
        ...(shouldApplyExamsRebalance ? Array.from(EXAMS_REBALANCE_CHARACTER_IDS) : []),
    ]);
    const defaultByCharacterId = new Map(
        defaultCharacters
            .filter((entry) => entry && typeof entry.characterId === 'string' && entry.characterId)
            .map((entry) => [entry.characterId, entry])
    );
    let backfilledMissingImages = false;
    const withSeedImageFallback = (entry) => {
        const characterId = entry && typeof entry.characterId === 'string' ? entry.characterId : '';
        const seedEntry = characterId ? defaultByCharacterId.get(characterId) : null;
        const storedFace = typeof entry?.facePicture === 'string' ? entry.facePicture.trim() : '';
        const seedFace = typeof seedEntry?.facePicture === 'string' ? seedEntry.facePicture.trim() : '';
        let nextEntry = entry;
        if (!storedFace && seedFace) {
            backfilledMissingImages = true;
            nextEntry = {
                ...nextEntry,
                facePicture: seedFace,
            };
        }
        const seedSkillsById = new Map(
            (Array.isArray(seedEntry?.skills) ? seedEntry.skills : [])
                .filter((skill) => skill && typeof skill.id === 'string' && skill.id)
                .map((skill) => [skill.id, skill])
        );
        const skills = Array.isArray(nextEntry?.skills) ? nextEntry.skills : [];
        if (!seedSkillsById.size || !skills.length) {
            return nextEntry;
        }
        let changedSkills = false;
        const nextSkills = skills.map((skill) => {
            const seedSkill = skill?.id ? seedSkillsById.get(skill.id) : null;
            const storedImage = typeof skill?.skillimage === 'string' ? skill.skillimage.trim() : '';
            const seedImage = typeof seedSkill?.skillimage === 'string' ? seedSkill.skillimage.trim() : '';
            if (storedImage || !seedImage) {
                return skill;
            }
            changedSkills = true;
            return {
                ...skill,
                skillimage: seedImage,
            };
        });
        if (!changedSkills) {
            return nextEntry;
        }
        backfilledMissingImages = true;
        return {
            ...nextEntry,
            skills: nextSkills,
        };
    };
    const storedIds = new Set(
        storedState.characters
            .map((entry) => (entry && typeof entry.characterId === 'string' ? entry.characterId : ''))
            .filter(Boolean)
    );
    const migratedStoredCharacters = storedState.characters.map((entry) => {
        const characterId = entry && typeof entry.characterId === 'string' ? entry.characterId : '';
        if (characterIdsToRefresh.has(characterId) && defaultByCharacterId.has(characterId)) {
            return defaultByCharacterId.get(characterId);
        }
        return withSeedImageFallback(entry);
    });
    const newDefaultCharacters = defaultCharacters.filter(
        (entry) => entry && typeof entry.characterId === 'string' && !storedIds.has(entry.characterId)
    );
    const defaultOrderMap = new Map(
        defaultCharacters.map((c, i) => [(c && (c.characterId || c.id)) || '', i])
    );
    const sortBySeedOrder = (list) => {
        return [...list].sort((a, b) => {
            const idA = (a && (a.characterId || a.id)) || '';
            const idB = (b && (b.characterId || b.id)) || '';
            const idxA = defaultOrderMap.has(idA) ? defaultOrderMap.get(idA) : 9999;
            const idxB = defaultOrderMap.has(idB) ? defaultOrderMap.get(idB) : 9999;
            return idxA - idxB;
        });
    };

    const sortedStoredCharacters = sortBySeedOrder(migratedStoredCharacters);
    const orderChanged = JSON.stringify(storedState.characters.map(c => c.characterId || c.id)) !== JSON.stringify(sortedStoredCharacters.map(c => c.characterId || c.id));

    if (!characterIdsToRefresh.size && !newDefaultCharacters.length && !backfilledMissingImages && !orderChanged) {
        return storedState.characters;
    }

    const mergedCharacters = sortBySeedOrder([...sortedStoredCharacters, ...newDefaultCharacters]);
    const updates = {
        [CHARACTERS_STATE_KEY]: appStateCollection.updateOne(
            { key: CHARACTERS_STATE_KEY },
            { $set: { key: CHARACTERS_STATE_KEY, characters: mergedCharacters, updatedAt: new Date() } },
            { upsert: true }
        ),
    };
    if (shouldApplyStarterRebalance || shouldApplyExamsRebalance) {
        const completedMigrationUpdates = {};
        const migrationCompletedAt = new Date();
        if (shouldApplyStarterRebalance) {
            completedMigrationUpdates[`completed.${STARTER_REBALANCE_MIGRATION_ID}`] = migrationCompletedAt;
        }
        if (shouldApplyExamsRebalance) {
            completedMigrationUpdates[`completed.${EXAMS_REBALANCE_MIGRATION_ID}`] = migrationCompletedAt;
        }
        updates[CHARACTER_MIGRATIONS_STATE_KEY] = appStateCollection.updateOne(
            { key: CHARACTER_MIGRATIONS_STATE_KEY },
            {
                $set: {
                    key: CHARACTER_MIGRATIONS_STATE_KEY,
                    ...completedMigrationUpdates,
                    updatedAt: migrationCompletedAt,
                },
            },
            { upsert: true }
        );
    }
    await Promise.all(Object.values(updates));
    return mergedCharacters;
};

const resolveNewsChangeAssets = (entry = {}) => {
    const characterId = typeof entry.characterId === 'string' ? entry.characterId.trim() : '';
    const skillId = typeof entry.skillId === 'string' ? entry.skillId.trim() : '';
    const characterName = typeof entry.characterName === 'string' ? entry.characterName.trim() : '';
    const skillName = typeof entry.skillName === 'string' ? entry.skillName.trim() : '';

    const character = characterCatalog.find((item) =>
        (characterId && item.characterId === characterId) ||
        (characterName && item.name.toLowerCase() === characterName.toLowerCase())
    );
    const skill = character && character.skills
        ? character.skills.find((item) =>
            (skillId && item.id === skillId) ||
            (skillName && item.name.toLowerCase() === skillName.toLowerCase())
        )
        : null;

    return {
        characterId: character ? character.characterId : characterId,
        characterName: character ? character.name : characterName,
        facePicture: character ? character.facePicture : '',
        skillId: skill ? skill.id : skillId,
        skillName: skill ? skill.name : skillName,
        skillimage: skill ? skill.skillimage : '',
    };
};

const normalizeNewsChanges = (value) =>
    (Array.isArray(value) ? value : [])
        .map((entry) => {
            if (typeof entry === 'string') {
                const text = entry.trim();
                return text ? { text } : null;
            }
            if (!entry || typeof entry !== 'object') {
                return null;
            }
            const text = typeof entry.text === 'string' ? entry.text.trim() : '';
            if (!text) {
                return null;
            }
            const assets = resolveNewsChangeAssets(entry);
            return {
                text,
                changeType:
                    typeof entry.changeType === 'string' && entry.changeType.trim()
                        ? entry.changeType.trim().toLowerCase()
                        : '',
                characterId: assets.characterId,
                characterName: assets.characterName,
                facePicture: assets.facePicture,
                skillId: assets.skillId,
                skillName: assets.skillName,
                skillimage: assets.skillimage,
            };
        })
        .filter(Boolean)
        .slice(0, 200);

const normalizeNewsBlocks = (value) =>
    (Array.isArray(value) ? value : [])
        .map((entry) => ({
            type: typeof entry?.type === 'string' ? entry.type.trim().toLowerCase() : 'paragraph',
            text: typeof entry?.text === 'string' ? entry.text.trim() : '',
        }))
        .filter((entry) => entry.type === 'divider' || (entry.type === 'paragraph' && entry.text))
        .slice(0, 200);

const serializeNewsPost = (post = {}) => ({
    id: post._id ? String(post._id) : '',
    title: typeof post.title === 'string' ? post.title : 'Untitled Post',
    paragraphs: normalizeNewsParagraphs(post.paragraphs),
    changes: normalizeNewsChanges(post.changes),
    blocks: normalizeNewsBlocks(post.blocks),
    author: typeof post.author === 'string' ? post.author : 'Unknown',
    createdAt: post.createdAt || null,
    updatedAt: post.updatedAt || null,
});

const buildPublicClanProfile = async (requestedClanName = '') => {
    const normalizedRequestedName = typeof requestedClanName === 'string' ? requestedClanName.trim().toLowerCase() : '';
    if (!normalizedRequestedName) {
        return null;
    }

    const users = await usersCollection
        .find(
            {},
            {
                projection: {
                    username: 1,
                    createdAt: 1,
                    profile: 1,
                },
            }
        )
        .toArray();

    const clanMap = new Map();
    users.forEach((user = {}) => {
        const normalizedUser = {
            username: user.username,
            createdAt: user.createdAt,
            profile: normalizeUserProfile(user),
        };
        const clan = normalizedUser.profile.clan;
        if (!clan || !clan.name) {
            return;
        }

        const clanKey = String(clan.name || '').trim().toLowerCase();
        if (!clanKey) {
            return;
        }

        if (!clanMap.has(clanKey)) {
            clanMap.set(clanKey, {
                key: clanKey,
                name: clan.name,
                abbreviation: clan.abbreviation || '',
                avatarUrl: clan.avatarUrl || '',
                bio: clan.bio || '',
                experiencePoints: Math.max(0, Number(clan.experiencePoints) || 0),
                createdBy: clan.createdBy || '',
                createdAt: clan.createdAt || normalizedUser.createdAt || null,
                totalLevel: 0,
                totalExperiencePoints: 0,
                totalWins: 0,
                totalLosses: 0,
                members: [],
            });
        }

        const bucket = clanMap.get(clanKey);
        const ladder = normalizedUser.profile.ladder || {};
        bucket.name = bucket.name || clan.name;
        bucket.abbreviation = bucket.abbreviation || clan.abbreviation || '';
        bucket.avatarUrl = bucket.avatarUrl || clan.avatarUrl || '';
        bucket.bio = bucket.bio || clan.bio || '';
        bucket.experiencePoints = Math.max(
            Number(bucket.experiencePoints) || 0,
            Number(clan.experiencePoints) || 0
        );
        bucket.createdBy = bucket.createdBy || clan.createdBy || '';
        bucket.createdAt = bucket.createdAt || clan.createdAt || normalizedUser.createdAt || null;
        bucket.totalLevel += Number(ladder.level) || 0;
        bucket.totalExperiencePoints += Number(ladder.experiencePoints) || 0;
        bucket.totalWins += Number(ladder.wins) || 0;
        bucket.totalLosses += Number(ladder.losses) || 0;
        bucket.members.push({
            username: normalizedUser.username,
            avatarUrl: normalizedUser.profile.avatarUrl || DEFAULT_PROFILE_AVATAR,
            level: Number(ladder.level) || 1,
            joinedAt: clan.joinedAt || null,
            rankKey: clan.rankKey || 'member',
            rank: clan.rank || resolveBaseClanRankLabel(clan.rankKey || 'member'),
        });
    });

    const clans = Array.from(clanMap.values()).sort((left, right) => {
        const leftClanLadder = deriveLadderStateFromExperience(left.experiencePoints || 0);
        const rightClanLadder = deriveLadderStateFromExperience(right.experiencePoints || 0);
        if (rightClanLadder.level !== leftClanLadder.level) {
            return rightClanLadder.level - leftClanLadder.level;
        }
        if ((right.experiencePoints || 0) !== (left.experiencePoints || 0)) {
            return (right.experiencePoints || 0) - (left.experiencePoints || 0);
        }
        return String(left.name || '').localeCompare(String(right.name || ''));
    });

    const targetClan = clans.find((entry) => entry.key === normalizedRequestedName);
    if (!targetClan) {
        return null;
    }

    const ladderRank = clans.findIndex((entry) => entry.key === targetClan.key) + 1;
    const totalGames = targetClan.totalWins + targetClan.totalLosses;
    const winPercentage = totalGames > 0 ? Number(((targetClan.totalWins / totalGames) * 100).toFixed(2)) : 0;
    const rankOrder = {
        clanLeader: 0,
        leader: 1,
        captain: 2,
        lieutenant: 3,
        member: 4,
        trial: 5,
    };

    targetClan.members.sort((left, right) => {
        const leftRankOrder =
            Object.prototype.hasOwnProperty.call(rankOrder, left.rankKey) ? rankOrder[left.rankKey] : rankOrder.member;
        const rightRankOrder =
            Object.prototype.hasOwnProperty.call(rankOrder, right.rankKey)
                ? rankOrder[right.rankKey]
                : rankOrder.member;
        if (leftRankOrder !== rightRankOrder) {
            return leftRankOrder - rightRankOrder;
        }
        return String(left.username || '').localeCompare(String(right.username || ''));
    });

    const clanLadderState = deriveLadderStateFromExperience(targetClan.experiencePoints || 0);

    return {
        name: targetClan.name,
        abbreviation: targetClan.abbreviation,
        avatarUrl: targetClan.avatarUrl,
        bio: targetClan.bio,
        createdBy: targetClan.createdBy,
        createdAt: targetClan.createdAt,
        ladder: {
            level: clanLadderState.level,
            experiencePoints: Math.max(0, targetClan.totalExperiencePoints || 0),
            clanExperiencePoints: Math.max(0, targetClan.experiencePoints || 0),
            experienceIntoLevel: clanLadderState.experienceIntoLevel,
            experienceForNextLevel: clanLadderState.experienceForNextLevel,
            experienceToNextLevel: clanLadderState.experienceToNextLevel,
            ladderRank: ladderRank > 0 ? ladderRank : null,
            wins: Math.max(0, targetClan.totalWins || 0),
            losses: Math.max(0, targetClan.totalLosses || 0),
            winPercentage,
        },
        members: targetClan.members,
    };
};

const buildSidebarLeaderboards = async () => {
    const users = await usersCollection
        .find(
            {},
            {
                projection: {
                    username: 1,
                    profile: 1,
                },
            }
        )
        .toArray();

    const normalizedUsers = users.map((user) => ({
        username: user.username,
        profile: normalizeUserProfile(user),
    }));

    const byNumberDescThenName = (getValue) => (left, right) => {
        const leftValue = Number(getValue(left)) || 0;
        const rightValue = Number(getValue(right)) || 0;
        if (rightValue !== leftValue) {
            return rightValue - leftValue;
        }
        return String(left.username || '').localeCompare(String(right.username || ''));
    };

    const topPlayerLevels = normalizedUsers
        .slice()
        .sort(byNumberDescThenName((entry) => entry.profile.ladder.level))
        .slice(0, 10)
        .map((entry) => ({
            username: entry.username,
            value: entry.profile.ladder.level,
            progressPercent: getLevelProgressPercent(
                entry.profile.ladder.experienceIntoLevel,
                entry.profile.ladder.experienceForNextLevel,
                entry.profile.ladder.level
            ),
        }));

    const topCurrentStreaks = normalizedUsers
        .slice()
        .sort(byNumberDescThenName((entry) => entry.profile.ladder.streak))
        .slice(0, 10)
        .map((entry) => ({
            username: entry.username,
            value: entry.profile.ladder.streak,
        }));

    const topWins = normalizedUsers
        .slice()
        .sort(byNumberDescThenName((entry) => entry.profile.ladder.wins))
        .slice(0, 10)
        .map((entry) => ({
            username: entry.username,
            value: entry.profile.ladder.wins,
        }));

    const topHighestStreaks = normalizedUsers
        .slice()
        .sort(byNumberDescThenName((entry) => entry.profile.ladder.highestStreak))
        .slice(0, 20)
        .map((entry) => ({
            username: entry.username,
            value: entry.profile.ladder.highestStreak,
        }));

    const clansByName = new Map();
    normalizedUsers.forEach((entry) => {
        const clan = entry.profile.clan;
        const clanName = typeof clan?.name === 'string' ? clan.name.trim() : '';
        if (!clanName) {
            return;
        }
        const existing = clansByName.get(clanName) || {
            clanName,
            abbreviation: typeof clan?.abbreviation === 'string' ? clan.abbreviation.trim() : '',
            value: 0,
            members: 0,
            clanExperiencePoints: 0,
        };
        existing.clanExperiencePoints = Math.max(
            Number(existing.clanExperiencePoints) || 0,
            Number(clan?.experiencePoints) || 0
        );
        const clanLadderState = deriveLadderStateFromExperience(existing.clanExperiencePoints);
        existing.value = clanLadderState.level;
        existing.progressPercent = getLevelProgressPercent(
            clanLadderState.experienceIntoLevel,
            clanLadderState.experienceForNextLevel,
            clanLadderState.level
        );
        existing.members += 1;
        if (!existing.abbreviation && typeof clan?.abbreviation === 'string') {
            existing.abbreviation = clan.abbreviation.trim();
        }
        clansByName.set(clanName, existing);
    });

    const topClanLevels = Array.from(clansByName.values())
        .sort((left, right) => {
            if (right.value !== left.value) {
                return right.value - left.value;
            }
            if ((right.clanExperiencePoints || 0) !== (left.clanExperiencePoints || 0)) {
                return (right.clanExperiencePoints || 0) - (left.clanExperiencePoints || 0);
            }
            return left.clanName.localeCompare(right.clanName);
        })
        .slice(0, 10);

    return {
        topPlayerLevels,
        topClanLevels,
        topCurrentStreaks,
        topWins,
        topHighestStreaks,
    };
};

const backfillUserProfiles = async () => {
    const cursor = usersCollection.find(
        {},
        {
            projection: {
                _id: 1,
                username: 1,
                usernameLower: 1,
                createdAt: 1,
                profile: 1,
                savedTeamIndices: 1,
            },
        }
    );

    while (await cursor.hasNext()) {
        const user = await cursor.next();
        if (!user) {
            continue;
        }
        const normalizedProfile = normalizeUserProfile(user);
        const nextSavedTeamIndices = Array.isArray(user.savedTeamIndices) ? user.savedTeamIndices : [];
        const nextUsernameLower =
            typeof user.username === 'string' ? user.username.trim().toLowerCase() : '';
        const needsProfile =
            JSON.stringify(user.profile || null) !== JSON.stringify(normalizedProfile);
        const needsSavedTeams = !Array.isArray(user.savedTeamIndices);
        const needsUsernameLower = user.usernameLower !== nextUsernameLower;
        if (!needsProfile && !needsSavedTeams && !needsUsernameLower) {
            continue;
        }
        await usersCollection.updateOne(
            { _id: user._id },
            {
                $set: {
                    usernameLower: nextUsernameLower,
                    profile: normalizedProfile,
                    savedTeamIndices: nextSavedTeamIndices,
                },
            }
        );
    }

    await recalculatePlayerLadderStandings();
};

const buildCharacterFaceMap = () =>
    new Map(
        (Array.isArray(charactersData) ? charactersData : [])
            .filter((character) => character && typeof character === 'object')
            .map((character) => {
                const key = character.characterId || character.id || character.name;
                if (!key) return null;
                return [key, character.facePicture || ''];
            })
            .filter(Boolean)
    );

const buildCharacterSummaryMap = () =>
    new Map(
        (Array.isArray(charactersData) ? charactersData : [])
            .filter((character) => character && typeof character === 'object')
            .map((character) => {
                const key = character.characterId || character.id || character.name;
                if (!key) return null;
                return [
                    key,
                    {
                        characterId: key,
                        label: character.name || key,
                        facePicture: character.facePicture || '',
                    },
                ];
            })
            .filter(Boolean)
    );

const normalizeLatestCharacterReleases = (entries = []) => {
    const characterMap = buildCharacterSummaryMap();
    const defaults = Array.isArray(LATEST_CHARACTER_RELEASES) ? LATEST_CHARACTER_RELEASES : [];
    return [0, 1, 2].map((index) => {
        const entry = Array.isArray(entries) ? entries[index] || {} : {};
        const fallback = defaults[index] || { label: `Latest Character ${index + 1}`, characterId: '' };
        const requestedCharacterId =
            typeof entry?.characterId === 'string' ? entry.characterId.trim() : '';
        const character = requestedCharacterId ? characterMap.get(requestedCharacterId) : null;
        if (character) {
            return {
                label: character.label,
                characterId: character.characterId,
                facePicture: character.facePicture,
            };
        }
        return {
            label: fallback.label || `Latest Character ${index + 1}`,
            characterId: '',
            facePicture: '',
        };
    });
};

const getLatestCharacterReleases = async () => {
    if (!appStateCollection) {
        return normalizeLatestCharacterReleases(LATEST_CHARACTER_RELEASES);
    }
    const state = await appStateCollection.findOne({ key: LATEST_CHARACTER_RELEASES_STATE_KEY });
    const entries =
        state && Array.isArray(state.releases)
            ? state.releases
            : state?.value && Array.isArray(state.value.releases)
            ? state.value.releases
            : LATEST_CHARACTER_RELEASES;
    return normalizeLatestCharacterReleases(entries);
};

const getMaintenanceModeState = async () => {
    if (!appStateCollection) {
        return false;
    }
    const state = await appStateCollection.findOne({ key: MAINTENANCE_MODE_STATE_KEY });
    return Boolean(state?.enabled);
};

const parseSessionTokenFromRequest = (req = {}) => {
    const cookies = String(req.headers?.cookie || '')
        .split(';')
        .reduce((acc, part) => {
            const [rawKey, ...rawValueParts] = String(part).split('=');
            const key = rawKey ? rawKey.trim() : '';
            if (!key) {
                return acc;
            }
            acc[key] = decodeURIComponent(rawValueParts.join('=').trim() || '');
            return acc;
        }, {});
    return cookies[SESSION_COOKIE_NAME] || '';
};

const getSessionUserFromRequest = async (req = {}) => {
    const token = parseSessionTokenFromRequest(req);
    if (!token) {
        return null;
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await usersCollection.findOne({ username: decoded.username });
        return user || null;
    } catch (error) {
        return null;
    }
};

const renderMaintenancePage = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Naruto-Arena Maintenance</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: linear-gradient(180deg, #fff4cd 0%, #f5dd9e 34%, #f7b44a 100%);
      color: #15110b;
      font-family: Arial, sans-serif;
    }
    .panel {
      width: min(90vw, 560px);
      padding: 32px 28px;
      border: 4px solid #16120d;
      background: #fff7de;
      box-shadow: 10px 10px 0 rgba(0, 0, 0, 0.95);
      text-align: center;
    }
    h1 {
      margin: 0 0 12px;
      font-size: 32px;
    }
    p {
      margin: 0;
      font-size: 20px;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="panel">
    <h1>Maintenance Mode</h1>
    <p>This game is under maintenance.</p>
  </div>
</body>
</html>`;

const allowedOrigins = (
    process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:4000,https://localhost:4001'
)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);
app.use(async (req, res, next) => {
    const protectedAdminPages = new Set([
        '/admin',
        '/admin.html',
        '/charactereditor',
        '/charactereditor.html',
        '/editmission',
        '/editmission.html',
        '/newspost',
        '/newspost.html',
        '/playeraccounts',
        '/playeraccounts.html',
        '/winrates',
        '/winrates.html',
    ]);
    if (!protectedAdminPages.has(req.path)) {
        return next();
    }

    try {
        const cookies = String(req.headers?.cookie || '')
            .split(';')
            .reduce((acc, part) => {
                const [rawKey, ...rawValueParts] = String(part).split('=');
                const key = rawKey ? rawKey.trim() : '';
                if (!key) {
                    return acc;
                }
                acc[key] = decodeURIComponent(rawValueParts.join('=').trim() || '');
                return acc;
            }, {});
        const token = cookies[SESSION_COOKIE_NAME];
        if (!token) {
            return res.redirect('/');
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await usersCollection.findOne({ username: decoded.username });
        if (!user || String(user.role || '').trim().toLowerCase() !== 'admin') {
            return res.redirect('/');
        }

        return next();
    } catch (error) {
        return res.redirect('/');
    }
});
app.use(async (req, res, next) => {
    try {
        const maintenanceEnabled = await getMaintenanceModeState();
        if (!maintenanceEnabled) {
            return next();
        }

        const requestPath = String(req.path || '');
        const adminBypassPaths = new Set(['/newspost', '/newspost.html', '/api/login', '/health']);
        if (adminBypassPaths.has(requestPath)) {
            return next();
        }

        const sessionUser = await getSessionUserFromRequest(req);
        if (sessionUser && String(sessionUser.role || '').trim().toLowerCase() === 'admin') {
            return next();
        }

        if (requestPath.startsWith('/api/')) {
            return res.status(503).json({
                error: 'This game is under maintenance.',
                maintenance: true,
            });
        }

        if (req.method === 'GET' || req.method === 'HEAD') {
            return res.status(503).type('html').send(renderMaintenancePage());
        }

        return res.status(503).json({
            error: 'This game is under maintenance.',
            maintenance: true,
        });
    } catch (error) {
        return next();
    }
});

app.get('/characters.js', (req, res) => {
    res.type('application/javascript');
    res.send(charactersBrowserScript);
});

app.use(express.static(path.join(__dirname), {
    setHeaders(res, filePath) {
        if (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        }
    },
}));
app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: false,
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
                fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
                imgSrc: ["'self'", 'data:', '*'],
                connectSrc: ["'self'", ...allowedOrigins],
                objectSrc: ["'none'"],
                frameAncestors: ["'self'"],
                baseUri: ["'self'"],
                formAction: ["'self'"],
            },
        },
    })
);
app.use(express.json());
app.use(cookieParser());
app.use(
    morgan('combined', {
        skip: () => process.env.NODE_ENV === 'test',
    })
);

const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts. Please wait a moment and try again.' },
});

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many registration attempts. Please wait a moment and try again.' },
});


const signSession = (user) =>
    jwt.sign(
        {
            sub: user._id?.toString?.() || user.username,
            username: user.username,
            role: user.role || 'player',
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
    );

const setSessionCookie = (res, token) => {
    res.cookie(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: !ALLOW_INSECURE_HTTP,
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE_MS,
    });
};

const clearSessionCookie = (res) => {
    res.clearCookie(SESSION_COOKIE_NAME, {
        httpOnly: true,
        secure: !ALLOW_INSECURE_HTTP,
        sameSite: 'lax',
    });
};

const getRemoteImageBuffer = async (url, redirectCount = 0) => {
    if (redirectCount > 3) {
        throw new Error('Too many redirects.');
    }
    const response = await fetch(url, {
        redirect: 'manual',
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (!location) {
            throw new Error('Invalid image response.');
        }
        const nextUrl = new URL(location, url).toString();
        return getRemoteImageBuffer(nextUrl, redirectCount + 1);
    }
    if (!response.ok) {
        throw new Error('Image URL could not be reached.');
    }
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().startsWith('image/')) {
        throw new Error('URL must point directly to an image.');
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
};

const readPngDimensions = (buffer) => {
    if (buffer.length < 24) return null;
    if (
        buffer[0] !== 0x89 ||
        buffer[1] !== 0x50 ||
        buffer[2] !== 0x4e ||
        buffer[3] !== 0x47
    ) {
        return null;
    }
    return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20),
    };
};

const readGifDimensions = (buffer) => {
    if (buffer.length < 10) return null;
    const header = buffer.subarray(0, 6).toString('ascii');
    if (header !== 'GIF87a' && header !== 'GIF89a') {
        return null;
    }
    return {
        width: buffer.readUInt16LE(6),
        height: buffer.readUInt16LE(8),
    };
};

const readJpegDimensions = (buffer) => {
    if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
        return null;
    }
    let offset = 2;
    while (offset + 8 < buffer.length) {
        if (buffer[offset] !== 0xff) {
            offset += 1;
            continue;
        }
        const marker = buffer[offset + 1];
        const length = buffer.readUInt16BE(offset + 2);
        if (length < 2) return null;
        const isStartOfFrame =
            (marker >= 0xc0 && marker <= 0xc3) ||
            (marker >= 0xc5 && marker <= 0xc7) ||
            (marker >= 0xc9 && marker <= 0xcb) ||
            (marker >= 0xcd && marker <= 0xcf);
        if (isStartOfFrame) {
            return {
                height: buffer.readUInt16BE(offset + 5),
                width: buffer.readUInt16BE(offset + 7),
            };
        }
        offset += 2 + length;
    }
    return null;
};

const readWebpDimensions = (buffer) => {
    if (buffer.length < 30) return null;
    if (
        buffer.subarray(0, 4).toString('ascii') !== 'RIFF' ||
        buffer.subarray(8, 12).toString('ascii') !== 'WEBP'
    ) {
        return null;
    }
    const chunkType = buffer.subarray(12, 16).toString('ascii');
    if (chunkType === 'VP8X' && buffer.length >= 30) {
        return {
            width: 1 + buffer.readUIntLE(24, 3),
            height: 1 + buffer.readUIntLE(27, 3),
        };
    }
    if (chunkType === 'VP8 ' && buffer.length >= 30) {
        return {
            width: buffer.readUInt16LE(26) & 0x3fff,
            height: buffer.readUInt16LE(28) & 0x3fff,
        };
    }
    if (chunkType === 'VP8L' && buffer.length >= 25) {
        const bits = buffer.readUInt32LE(21);
        return {
            width: (bits & 0x3fff) + 1,
            height: ((bits >> 14) & 0x3fff) + 1,
        };
    }
    return null;
};

const getImageDimensionsFromBuffer = (buffer) =>
    readPngDimensions(buffer) ||
    readGifDimensions(buffer) ||
    readJpegDimensions(buffer) ||
    readWebpDimensions(buffer);

const validateAvatarUrl = async (url) => {
    const buffer = await getRemoteImageBuffer(url);
    const dimensions = getImageDimensionsFromBuffer(buffer);
    if (!dimensions) {
        throw new Error('Unsupported image format.');
    }
    if (dimensions.width !== 100 || dimensions.height !== 100) {
        throw new Error('Avatars must be exactly 100x100.');
    }
    return true;
};

const validateBackgroundUrl = async (url) => {
    if (!url) {
        return true;
    }
    const buffer = await getRemoteImageBuffer(url);
    const dimensions = getImageDimensionsFromBuffer(buffer);
    if (!dimensions) {
        throw new Error('Unsupported image format.');
    }
    if (dimensions.width !== 770 || dimensions.height !== 560) {
        throw new Error('Backgrounds must be exactly 770x560.');
    }
    return true;
};

// Every authenticated request (including the 2-3s client polling loops used
// by matchmaking and in-match state) previously did a MongoDB round-trip
// just to re-fetch the user doc for the session. That round-trip dominates
// perceived lag on a hosted free-tier DB. Cache the resolved user briefly per
// token so bursts of polling requests reuse one lookup instead of one each.
const SESSION_CACHE_TTL_MS = 3000;
const sessionUserCache = new Map();

const getSessionUserCached = async (token) => {
    const cached = sessionUserCache.get(token);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.user;
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    const rawUsername = String(decoded.username || '').trim();
    const user = await usersCollection.findOne({
        $or: [
            { username: rawUsername },
            { usernameLower: rawUsername.toLowerCase() },
            { username: new RegExp(`^${rawUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
        ]
    });
    const resolved = user ? { ...serializeUserForClient(user) } : null;
    sessionUserCache.set(token, { user: resolved, expiresAt: Date.now() + SESSION_CACHE_TTL_MS });
    return resolved;
};

const requireSession = async (req, res, next) => {
    try {
        const token = req.cookies?.[SESSION_COOKIE_NAME];
        if (!token) {
            return res.status(401).json({ error: 'Unauthorized.' });
        }

        const authUser = await getSessionUserCached(token);
        if (!authUser) {
            return res.status(401).json({ error: 'Unauthorized.' });
        }

        req.authUser = authUser;
        next();
    } catch (error) {
        console.error('Session verification failed:', error);
        return res.status(401).json({ error: 'Unauthorized.' });
    }
};

const parseCookieHeader = (cookieHeader = '') => {
    if (typeof cookieHeader !== 'string' || !cookieHeader.trim()) return {};
    return cookieHeader.split(';').reduce((acc, part) => {
        const [rawKey, ...rawValueParts] = String(part).split('=');
        const key = rawKey ? rawKey.trim() : '';
        if (!key) return acc;
        const value = rawValueParts.join('=').trim();
        acc[key] = decodeURIComponent(value || '');
        return acc;
    }, {});
};

const getSessionUserFromToken = async (token) => {
    if (!token) return null;
    return getSessionUserCached(token);
};

const getMatchRoom = (matchId) => {
    const key = typeof matchId === 'string' ? matchId.trim() : '';
    if (!key) return null;
    if (!matchSocketRooms.has(key)) {
        matchSocketRooms.set(key, new Set());
    }
    return matchSocketRooms.get(key);
};

const removeSocketFromRoom = (ws) => {
    if (!ws || !ws.matchId) return;
    const room = matchSocketRooms.get(ws.matchId);
    if (!room) return;
    room.delete(ws);
    if (room.size === 0) {
        matchSocketRooms.delete(ws.matchId);
    }
};

const sendJsonToSocket = (ws, payload) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
        ws.send(JSON.stringify(payload));
        return true;
    } catch (error) {
        return false;
    }
};

const cloneSerializable = (value) => {
    if (value === null || value === undefined) return value;
    if (typeof structuredClone === 'function') {
        return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
};

const CLIENT_SAFE_STATUS_METADATA_KEYS = new Set([
    '_destructibleDefenseRestoreTurnsLeft',
    'banished',
    'bloodlineCostIncrease',
    'bloodlineCostReduction',
    'bonusDamageFromSourceNonAfflictionFlat',
    'bonusDamageFromSourceSkillsFlat',
    'cannotUseHarmfulSkills',
    'cannotUseNonMentalSkills',
    'cannotUseSkillClasses',
    'cannotUseSkillIndices',
    'cannotUseSkills',
    'DamageDebuff',
    'damageBonusBySkillClass',
    'damageBonusFlat',
    'damageDebuffBySkillClass',
    'damageDebuffFlat',
    'damageReductionFlat',
    'damageTakenBonusBySkillClass',
    'damageTakenBonusFlat',
    'destructibleDefensePoints',
    'destructibleDefenseRestore',
    'facePictureOverride',
    'genjutsuCostIncrease',
    'genjutsuCostReduction',
    'harmful',
    'helpful',
    'NonAfflictionDamageDebuff',
    'ninjutsuCostIncrease',
    'ninjutsuCostReduction',
    'nonAfflictionDamageTakenBonusFlat',
    'nonMentalRandomCostIncrease',
    'overrideAllSkillsToAllRandom',
    'overrideAllSkillsToAllRandomSkillIdsAny',
    'permanent',
    'randomCostIncrease',
    'randomCostReduction',
    'skillCostOverridesByRemainingTurns',
    'skillCostOverridesBySkillId',
    'skillDamageBonuses',
    'skillReplacements',
    'skillReplacementsByRemainingTurns',
    'sourceSkillName',
    'stackDelta',
    'stackMax',
    'stackMetadataKey',
    'taijutsuCostIncrease',
    'taijutsuCostReduction',
    'tooltipText',
    'tooltipTextTemplate',
    'turnEndDamage',
]);

const extractTooltipPlaceholderKeys = (template) => {
    if (typeof template !== 'string' || !template) return [];
    const matches = template.matchAll(/\{([a-zA-Z0-9_]+)\}/g);
    return Array.from(new Set(Array.from(matches, (match) => match[1]).filter(Boolean)));
};

const sanitizeStatusMetadataForClient = (metadata = {}) => {
    if (!metadata || typeof metadata !== 'object') return {};
    const sanitized = {};
    const safeKeys = new Set(CLIENT_SAFE_STATUS_METADATA_KEYS);
    extractTooltipPlaceholderKeys(metadata.tooltipTextTemplate).forEach((key) => safeKeys.add(key));
    extractTooltipPlaceholderKeys(
        metadata?.destructibleDefenseRestore?.pendingTooltipTextTemplate
    ).forEach((key) => safeKeys.add(key));
    safeKeys.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(metadata, key)) {
            sanitized[key] = cloneSerializable(metadata[key]);
        }
    });
    return sanitized;
};

const shouldHideStatusFromViewer = ({ status, unitUsername, viewerUsername }) => {
    const metadata = status?.metadata || {};
    if (Boolean(metadata.hideTooltip)) {
        return true;
    }
    if (viewerUsername !== unitUsername && Boolean(metadata.hideTooltipFromEnemy)) {
        return true;
    }
    if (
        viewerUsername === unitUsername &&
        (Boolean(metadata.hideTooltipFromOwner) || Boolean(metadata.hideTooltipFromUnitOwner))
    ) {
        return true;
    }
    return false;
};

const sanitizeStatusForViewer = ({ status, unitUsername, viewerUsername }) => {
    if (!status || typeof status !== 'object') return null;
    if (shouldHideStatusFromViewer({ status, unitUsername, viewerUsername })) {
        return null;
    }
    return {
        id: typeof status.id === 'string' ? status.id : '',
        remainingTurns: Math.max(0, Number(status.remainingTurns) || 0),
        sourceSkillId: typeof status.sourceSkillId === 'string' ? status.sourceSkillId : null,
        metadata: sanitizeStatusMetadataForClient(status.metadata),
    };
};

const sanitizeUnitStateForViewer = ({ unit, unitUsername, viewerUsername }) => {
    const statuses = Array.isArray(unit?.state?.statuses)
        ? unit.state.statuses
              .map((status) => sanitizeStatusForViewer({ status, unitUsername, viewerUsername }))
              .filter(Boolean)
        : [];
    const state = { statuses };
    if (unitUsername === viewerUsername) {
        state.cooldowns =
            unit?.state?.cooldowns && typeof unit.state.cooldowns === 'object'
                ? cloneSerializable(unit.state.cooldowns)
                : {};
        state.skillUses =
            unit?.state?.skillUses && typeof unit.state.skillUses === 'object'
                ? cloneSerializable(unit.state.skillUses)
                : {};
    }
    return state;
};

const sanitizeBoardForViewer = (board, viewerUsername) => {
    if (!board || typeof board !== 'object' || !viewerUsername) return null;
    return Object.fromEntries(
        Object.entries(board).map(([unitUsername, units]) => [
            unitUsername,
            Array.isArray(units)
                ? units.map((unit) => ({
                      slot: Number.isInteger(unit?.slot) ? unit.slot : null,
                      rosterIndex: Number.isInteger(unit?.rosterIndex) ? unit.rosterIndex : null,
                      alive: unit?.alive !== false,
                      hp: Number.isFinite(Number(unit?.hp)) ? Number(unit.hp) : 0,
                      state: sanitizeUnitStateForViewer({ unit, unitUsername, viewerUsername }),
                  }))
                : [],
        ])
    );
};

const sanitizeChakraPoolsForViewer = (chakraPools, viewerUsername) => {
    if (!chakraPools || typeof chakraPools !== 'object' || !viewerUsername) return null;
    const ownPool =
        chakraPools?.[viewerUsername] && typeof chakraPools[viewerUsername] === 'object'
            ? cloneSerializable(chakraPools[viewerUsername])
            : null;
    return ownPool ? { [viewerUsername]: ownPool } : null;
};

const sanitizeLastChakraGainForViewer = (lastChakraGain, viewerUsername) => {
    if (!lastChakraGain || typeof lastChakraGain !== 'object' || !viewerUsername) return null;
    const ownGain =
        lastChakraGain?.[viewerUsername] && typeof lastChakraGain[viewerUsername] === 'object'
            ? cloneSerializable(lastChakraGain[viewerUsername])
            : null;
    return ownGain ? { [viewerUsername]: ownGain } : null;
};

const buildMatchPayloadForUser = (match, username) => {
    if (!match || !username) return null;
    const playerEntry = Array.isArray(match.players)
        ? match.players.find((player) => player?.username === username) || null
        : null;
    if (!playerEntry) return null;
    const opponentEntry = Array.isArray(match.players)
        ? match.players.find((player) => player?.username !== username) || null
        : null;
    return {
        ok: true,
        matchId: match.matchId || null,
        mode: match.mode || 'quick',
        status: match.status || 'active',
        winner: match.winner || null,
        surrenderedBy: match.surrenderedBy || null,
        endReason: match.endReason || null,
        endedAt: match.endedAt || null,
        player: playerEntry,
        opponent: opponentEntry,
        currentTurn: match.currentTurn || null,
        turnOrder: match.turnOrder || null,
        turnStartedAt: match.turnStartedAt || null,
        turnExpiresAt: match.turnExpiresAt || null,
        turnDurationMs: getTurnDurationMsForUser(match, match?.currentTurn),
        board: sanitizeBoardForViewer(match.board, username),
        chakraPools: sanitizeChakraPoolsForViewer(match.chakraPools, username),
        lastChakraGain: sanitizeLastChakraGainForViewer(match.economy?.lastChakraGain, username),
        combatEvents: Array.isArray(match.combatEvents) ? match.combatEvents.slice(-15) : [],
        pendingTurn: getPendingTurn(match, username),
        ladderResult: match.ladderResults?.[username] || null,
        missionResult: match.missionResults?.[username] || null,
        storyResult: match.storyResults?.[username] || null,
        gauntletResult: match.gauntletResults?.[username] || null,
        gauntletMatch: match.gauntletMatch
            ? {
                  runSeed: match.gauntletMatch.runSeed || null,
                  nodeId: match.gauntletMatch.nodeId || null,
                  nodeType: match.gauntletMatch.nodeType || null,
                  enemyTeamId: match.gauntletMatch.enemyTeamId || null,
                  enemyDisplayName: match.gauntletMatch.enemyDisplayName || null,
                  aggressionTier: Math.max(1, Math.min(3, Number(match.gauntletMatch.aggressionTier) || 1)),
                  resources:
                      match.gauntletMatch.resources && typeof match.gauntletMatch.resources === 'object'
                          ? {
                                heavenScrolls: Math.max(0, Number(match.gauntletMatch.resources.heavenScrolls) || 0),
                                earthScrolls: Math.max(0, Number(match.gauntletMatch.resources.earthScrolls) || 0),
                                scrollFragments: Math.max(0, Number(match.gauntletMatch.resources.scrollFragments) || 0),
                                ryo: Math.max(0, Number(match.gauntletMatch.resources.ryo) || 0),
                            }
                          : null,
                  modifiers: Array.isArray(match.gauntletMatch.modifiers)
                      ? match.gauntletMatch.modifiers
                            .map((modifier) => ({
                                id: typeof modifier?.id === 'string' ? modifier.id : '',
                                name: typeof modifier?.name === 'string' ? modifier.name : '',
                                description: typeof modifier?.description === 'string' ? modifier.description : '',
                                isCurse: Boolean(modifier?.isCurse),
                            }))
                            .filter((modifier) => modifier.id && modifier.name)
                      : [],
              }
            : null,
        storyMatch: match.storyMatch
            ? {
                  chapterId: match.storyMatch.chapterId || null,
                  nodeId: match.storyMatch.nodeId || null,
                  difficulty: match.storyMatch.difficulty || 'normal',
                  hardModeRyoReward: Math.max(0, Number(match.storyMatch.hardModeRyoReward) || 0),
                  enemyDisplayName: match.storyMatch.enemyDisplayName || null,
                  introDialogue: Array.isArray(match.storyMatch.introDialogue) ? match.storyMatch.introDialogue : [],
                  outroDialogueWin: Array.isArray(match.storyMatch.outroDialogueWin)
                      ? match.storyMatch.outroDialogueWin
                      : [],
                  outroDialogueLoss: Array.isArray(match.storyMatch.outroDialogueLoss)
                      ? match.storyMatch.outroDialogueLoss
                      : [],
              }
            : null,
    };
};

const hydrateMatchForBroadcast = async (matchOrMatchId) => {
    const match =
        typeof matchOrMatchId === 'string'
            ? await getMatchActive(matchOrMatchId)
            : matchOrMatchId;
    if (!match) return null;
    const hydratedTurn = await ensureMatchTurnData(match);
    const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
    const hydratedPending = await ensurePendingTurnState(hydratedEcon);
    const hydratedBoard = await ensureBoardState(hydratedPending);
    return autoAdvanceTurnIfExpired(hydratedBoard);
};

const broadcastMatchState = async (matchOrMatchId) => {
    const hydrated = await hydrateMatchForBroadcast(matchOrMatchId);
    if (!hydrated || !Array.isArray(hydrated.players) || hydrated.players.length === 0) {
        return null;
    }
    scheduleBattleBotTurn(hydrated);
    const room = getMatchRoom(hydrated.matchId);
    if (!room || room.size === 0) {
        return hydrated;
    }
    room.forEach((ws) => {
        if (!ws || ws.readyState !== WebSocket.OPEN) {
            removeSocketFromRoom(ws);
            return;
        }
        const payload = buildMatchPayloadForUser(hydrated, ws.username);
        if (payload) {
            sendJsonToSocket(ws, { type: 'match_state', payload });
        }
    });
    return hydrated;
};

const sweepExpiredMatches = async () => {
    if (!matchesCollection) return;
    const now = new Date();
    const expiredMatches = await matchesCollection
        .find(
            {
                status: { $ne: 'ended' },
                turnExpiresAt: { $lte: now },
            },
            { projection: { matchId: 1 } }
        )
        .toArray();
    for (const entry of expiredMatches) {
        const matchId = typeof entry?.matchId === 'string' ? entry.matchId : '';
        if (!matchId) continue;
        await broadcastMatchState(matchId);
    }
};

const { attachWebSocketSupport } = require('./sockets/battleSocket.js')({
    wsServer,
    parseCookieHeader,
    SESSION_COOKIE_NAME,
    getSessionUserFromToken,
    matchesCollection,
    getMatchRoom,
    wsConnections,
    removeSocketFromRoom,
    hydrateMatchForBroadcast,
    buildMatchPayloadForUser,
    sendJsonToSocket,
    battleLogic,
    getCharactersData: () => charactersData
});

// In-memory matchmaking queues (demo)
let quickQueue = [];
let ladderQueue = [];
let privateQueue = [];
const quickMatches = new Map(); // matchId -> { players, createdAt }
const userToMatch = new Map(); // username -> { matchId, opponent }
const battleBotQueueTimers = new Map();

const chakraTypes = ['taijutsu', 'ninjutsu', 'bloodline', 'genjutsu'];

const createEmptyChakraPool = () => ({
    taijutsu: 0,
    ninjutsu: 0,
    bloodline: 0,
    genjutsu: 0,
});

const createEmptyChakraCost = () => ({
    taijutsu: 0,
    ninjutsu: 0,
    bloodline: 0,
    genjutsu: 0,
});

const getTotalChakra = (pool = {}) =>
    chakraTypes.reduce((sum, type) => sum + (Number(pool[type]) || 0), 0);

const normalizeEnergyCost = (energy = []) => {
    const reservedSpecific = createEmptyChakraCost();
    let requiredRandom = 0;
    (Array.isArray(energy) ? energy : []).forEach((entry) => {
        const normalized = typeof entry === 'string' ? entry.trim().toLowerCase() : '';
        if (normalized === 'random') {
            requiredRandom += 1;
            return;
        }
        if (Object.prototype.hasOwnProperty.call(reservedSpecific, normalized)) {
            reservedSpecific[normalized] += 1;
        }
    });
    return { reservedSpecific, requiredRandom };
};

const createGameBotUsername = (seed = '') =>
    `${GAME_BOT_USERNAME_PREFIX}${String(seed || Date.now()).replace(/[^a-z0-9_-]+/gi, '').toLowerCase()}`;

const getQueueForMode = (mode = 'quick') => {
    if (mode === 'ladder') return ladderQueue;
    if (mode === 'private') return privateQueue;
    return quickQueue;
};

const setQueueForMode = (mode = 'quick', nextQueue = []) => {
    if (mode === 'ladder') {
        ladderQueue = nextQueue;
        return;
    }
    if (mode === 'private') {
        privateQueue = nextQueue;
        return;
    }
    quickQueue = nextQueue;
};

const findQueuedEntry = (username, mode = null) => {
    const normalizedUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';
    const queues = mode ? [mode] : ['quick', 'ladder', 'private'];
    for (const queueMode of queues) {
        const queue = getQueueForMode(queueMode);
        const entry = queue.find(
            (item) =>
                typeof item?.username === 'string' &&
                item.username.trim().toLowerCase() === normalizedUsername
        );
        if (entry) {
            return { mode: queueMode, entry };
        }
    }
    return null;
};

const removeQueuedEntry = (username, mode = null) => {
    const normalizedUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';
    const queues = mode ? [mode] : ['quick', 'ladder', 'private'];
    queues.forEach((queueMode) => {
        setQueueForMode(
            queueMode,
            getQueueForMode(queueMode).filter(
                (entry) =>
                    typeof entry?.username !== 'string' ||
                    entry.username.trim().toLowerCase() !== normalizedUsername
            )
        );
    });
    clearScheduledBattleBotQueueCheck(username);
};

const getCharacterSpecificChakraProfile = (character = {}) => {
    const specificCounts = createEmptyChakraCost();
    let randomCount = 0;
    const skills = Array.isArray(character?.skills) ? character.skills : [];
    skills.forEach((skill) => {
        const costs = Array.isArray(skill?.energy) ? skill.energy : [];
        costs.forEach((entry) => {
            const normalized = typeof entry === 'string' ? entry.trim().toLowerCase() : '';
            if (normalized === 'random') {
                randomCount += 1;
                return;
            }
            if (Object.prototype.hasOwnProperty.call(specificCounts, normalized)) {
                specificCounts[normalized] += 1;
            }
        });
    });
    const dominantType = chakraTypes.reduce((best, type) => {
        if ((specificCounts[type] || 0) > (specificCounts[best] || 0)) {
            return type;
        }
        return best;
    }, chakraTypes[0]);
    const specificTotal = chakraTypes.reduce((sum, type) => sum + (specificCounts[type] || 0), 0);
    const diversity = chakraTypes.filter((type) => (specificCounts[type] || 0) > 0).length;
    return {
        specificCounts,
        dominantType: specificTotal > 0 ? dominantType : '',
        specificTotal,
        diversity,
        randomCount,
    };
};

const shuffleList = (items = []) => {
    const next = Array.isArray(items) ? items.slice() : [];
    for (let index = next.length - 1; index > 0; index -= 1) {
        const swapIndex = Math.floor(Math.random() * (index + 1));
        const temp = next[index];
        next[index] = next[swapIndex];
        next[swapIndex] = temp;
    }
    return next;
};

const buildBattleBotTeam = () => {
    const candidates = shuffleList(
        (Array.isArray(charactersData) ? charactersData : [])
            .map((character, rosterIndex) => ({
                rosterIndex,
                character,
                profile: getCharacterSpecificChakraProfile(character),
            }))
            .filter(
                (entry) =>
                    entry.character &&
                    typeof entry.character.characterId === 'string' &&
                    Array.isArray(entry.character.skills) &&
                    entry.character.skills.length > 0
            )
    );
    const selected = [];
    const usedDominantTypes = new Set();

    candidates.forEach((entry) => {
        if (selected.length >= 3) return;
        const dominantType = entry.profile.dominantType;
        if (!dominantType || usedDominantTypes.has(dominantType)) {
            return;
        }
        selected.push(entry);
        usedDominantTypes.add(dominantType);
    });

    const fallbackPool = candidates
        .filter((entry) => !selected.some((picked) => picked.rosterIndex === entry.rosterIndex))
        .sort((left, right) => {
            const leftScore = left.profile.diversity * 10 + left.profile.randomCount + left.profile.specificTotal;
            const rightScore =
                right.profile.diversity * 10 + right.profile.randomCount + right.profile.specificTotal;
            return rightScore - leftScore;
        });
    while (selected.length < 3 && fallbackPool.length > 0) {
        selected.push(fallbackPool.shift());
    }

    return selected.slice(0, 3).map((entry) => entry.rosterIndex);
};

const makeEmptyPendingTurn = () => ({
    queuedByActorSlot: {},
    queueOrder: [],
    unresolvedRandom: 0,
    randomAssignments: createEmptyChakraCost(),
    chakraExchanges: [],
    turnStartChoice: null,
});

const clonePendingTurn = (pending = {}) => ({
    queuedByActorSlot:
        pending && typeof pending.queuedByActorSlot === 'object' ? { ...pending.queuedByActorSlot } : {},
    queueOrder: Array.isArray(pending?.queueOrder)
        ? pending.queueOrder
              .map((slot) => Number.parseInt(slot, 10))
              .filter((slot) => Number.isInteger(slot) && slot >= 0)
        : [],
    unresolvedRandom: Number.isInteger(pending?.unresolvedRandom) ? pending.unresolvedRandom : 0,
    randomAssignments: {
        ...createEmptyChakraCost(),
        ...(pending && typeof pending.randomAssignments === 'object' ? pending.randomAssignments : {}),
    },
    chakraExchanges: Array.isArray(pending?.chakraExchanges)
        ? pending.chakraExchanges
              .map((exchange) => ({
                  gainType:
                      typeof exchange?.gainType === 'string'
                          ? exchange.gainType.trim().toLowerCase()
                          : '',
                  spendAssignments: {
                      ...createEmptyChakraCost(),
                      ...(exchange?.spendAssignments && typeof exchange.spendAssignments === 'object'
                          ? exchange.spendAssignments
                          : {}),
                  },
              }))
              .filter((exchange) => chakraTypes.includes(exchange.gainType))
        : [],
    turnStartChoice:
        pending?.turnStartChoice && typeof pending.turnStartChoice === 'object'
            ? {
                  actorSlot: Number.isInteger(pending.turnStartChoice.actorSlot)
                      ? pending.turnStartChoice.actorSlot
                      : null,
                  sourceSkillId:
                      typeof pending.turnStartChoice.sourceSkillId === 'string'
                          ? pending.turnStartChoice.sourceSkillId
                          : null,
                  sourceUsername:
                      typeof pending.turnStartChoice.sourceUsername === 'string'
                          ? pending.turnStartChoice.sourceUsername
                          : null,
                  sourceSlot: Number.isInteger(pending.turnStartChoice.sourceSlot)
                      ? pending.turnStartChoice.sourceSlot
                      : null,
                  sourceStatusId:
                      typeof pending.turnStartChoice.sourceStatusId === 'string'
                          ? pending.turnStartChoice.sourceStatusId
                          : null,
                  promptText:
                      typeof pending.turnStartChoice.promptText === 'string'
                          ? pending.turnStartChoice.promptText
                          : '',
                  options: Array.isArray(pending.turnStartChoice.options)
                      ? pending.turnStartChoice.options
                            .map((option) => {
                                if (!option || typeof option !== 'object') return null;
                                const key =
                                    typeof option.key === 'string' ? option.key.trim().toLowerCase() : '';
                                const label =
                                    typeof option.label === 'string' ? option.label.trim() : '';
                                if (!key || !label) return null;
                                return {
                                    key,
                                    label,
                                    targetStrategy:
                                        typeof option.targetStrategy === 'string'
                                            ? option.targetStrategy.trim().toLowerCase()
                                            : '',
                                    effect:
                                        option.effect && typeof option.effect === 'object'
                                            ? { ...option.effect }
                                            : null,
                                };
                            })
                            .filter(Boolean)
                      : [],
                  maxUses: Number.isInteger(pending.turnStartChoice.maxUses)
                      ? pending.turnStartChoice.maxUses
                      : 0,
                  usesUsed: Number.isInteger(pending.turnStartChoice.usesUsed)
                      ? pending.turnStartChoice.usesUsed
                      : 0,
              }
            : null,
});

const clampPendingTurnRandom = (pendingTurn, pool) => {
    const next = clonePendingTurn(pendingTurn);
    const queuedKeys = new Set(Object.keys(next.queuedByActorSlot || {}));
    const normalizedOrder = [];
    next.queueOrder.forEach((slot) => {
        const key = String(slot);
        if (!queuedKeys.has(key)) return;
        if (normalizedOrder.includes(slot)) return;
        normalizedOrder.push(slot);
    });
    Object.keys(next.queuedByActorSlot || {}).forEach((slotKey) => {
        const slot = Number.parseInt(slotKey, 10);
        if (!Number.isInteger(slot)) return;
        if (!normalizedOrder.includes(slot)) {
            normalizedOrder.push(slot);
        }
    });
    next.queueOrder = normalizedOrder;
    chakraTypes.forEach((type) => {
        next.randomAssignments[type] = Math.max(0, Number(next.randomAssignments[type]) || 0);
    });
    const queued = next.queuedByActorSlot && typeof next.queuedByActorSlot === 'object'
        ? Object.values(next.queuedByActorSlot)
        : [];
    const requiredFromQueue = queued.reduce((sum, item) => sum + (Number(item?.requiredRandom) || 0), 0);
    let assigned = getTotalChakra(next.randomAssignments);
    let overAssigned = Math.max(0, assigned - requiredFromQueue);
    if (overAssigned > 0) {
        chakraTypes.forEach((type) => {
            if (overAssigned <= 0) return;
            const used = Math.min(next.randomAssignments[type], overAssigned);
            if (used <= 0) return;
            next.randomAssignments[type] -= used;
            if (pool && Object.prototype.hasOwnProperty.call(pool, type)) {
                pool[type] = (Number(pool[type]) || 0) + used;
            }
            overAssigned -= used;
        });
        assigned = getTotalChakra(next.randomAssignments);
    }
    next.unresolvedRandom = Math.max(0, requiredFromQueue - assigned);
    return next;
};

const pickInitialTurn = (players = []) => {
    const uniquePlayers = Array.from(new Set(players.filter(Boolean)));
    for (let i = uniquePlayers.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [uniquePlayers[i], uniquePlayers[j]] = [uniquePlayers[j], uniquePlayers[i]];
    }
    const turnOrder = uniquePlayers.slice(0, 2);
    return { turnOrder, currentTurn: turnOrder[0] || null };
};

const generateRandomChakra = (count = 0, currentPool = null) => {
    const gains = [];
    const workingPool = {
        ...createEmptyChakraPool(),
        ...(currentPool && typeof currentPool === 'object' ? currentPool : {}),
    };
    for (let i = 0; i < count; i += 1) {
        const lowestCount = Math.min(...chakraTypes.map((type) => Math.max(0, Number(workingPool[type]) || 0)));
        const candidates = chakraTypes.filter((type) => Math.max(0, Number(workingPool[type]) || 0) === lowestCount);
        const pick = candidates[Math.floor(Math.random() * candidates.length)] || chakraTypes[0];
        workingPool[pick] = (Number(workingPool[pick]) || 0) + 1;
        gains.push(pick);
    }
    return gains;
};

const applyChakraGain = (pool, gains = []) => {
    const updated = { ...pool };
    gains.forEach((type) => {
        if (updated[type] !== undefined) {
            updated[type] += 1;
        }
    });
    return updated;
};

const getTurnDurationMsForUser = (match, username) => {
    if (!match || !username) return TURN_DURATION_MS;
    const collectTeamMetadataSum = (targetUsername, metadataKey) => {
        if (!targetUsername || !metadataKey) return 0;
        const units = Array.isArray(match.board?.[targetUsername]) ? match.board[targetUsername] : [];
        return units.reduce((teamTotal, unit, slot) => {
            if (!unit || unit.alive === false) return teamTotal;
            const state = battleLogic.getUnitState(match, targetUsername, slot);
            const statuses = Array.isArray(state?.statuses) ? state.statuses : [];
            const unitTotal = statuses.reduce((statusTotal, status) => {
                const remaining = Number(status?.remainingTurns) || 0;
                if (remaining <= 0) return statusTotal;
                return statusTotal + (Number(status?.metadata?.[metadataKey]) || 0);
            }, 0);
            return teamTotal + unitTotal;
        }, 0);
    };

    const opponentUsername =
        (Array.isArray(match.players) ? match.players : []).find((player) => player?.username && player.username !== username)
            ?.username || null;
    const bonusMs = collectTeamMetadataSum(username, 'ownTurnDurationBonusMs');
    const penaltyMs = opponentUsername ? collectTeamMetadataSum(opponentUsername, 'enemyTurnDurationPenaltyMs') : 0;
    return Math.max(10000, TURN_DURATION_MS + bonusMs - penaltyMs);
};

const initializeEconomyState = (players, currentTurn, aliveLookup = {}) => {
    const chakraPools = {};
    const economy = {
        turnCounts: {},
        startGranted: {},
        lastChakraGain: {},
    };

    players.forEach((username) => {
        chakraPools[username] = createEmptyChakraPool();
        economy.turnCounts[username] = 0;
        economy.startGranted[username] = false;
        economy.lastChakraGain[username] = [];
    });

    if (currentTurn && chakraPools[currentTurn]) {
        const openingGainCount = Math.max(1, Number(aliveLookup?.[currentTurn]) || 1);
        const gains = generateRandomChakra(openingGainCount, chakraPools[currentTurn]);
        chakraPools[currentTurn] = applyChakraGain(chakraPools[currentTurn], gains);
        economy.startGranted[currentTurn] = true;
        economy.lastChakraGain[currentTurn] = gains;
    }

    return {
        chakraPools,
        economy,
        turnExpiresAt: new Date(Date.now() + getTurnDurationMsForUser({ players, board: {} }, currentTurn)),
    };
};

const buildMatch = (players, aliveLookup = {}, options = {}) => {
    const { turnOrder, currentTurn } = pickInitialTurn(players);
    const matchId = options.matchId || `match-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const matchStartsAt = new Date(Date.now() + MATCH_FOUND_HOLD_MS);
    const { chakraPools, economy, turnExpiresAt } = initializeEconomyState(
        players,
        currentTurn,
        aliveLookup
    );
    const delayedTurnExpiry = turnExpiresAt
        ? new Date(new Date(turnExpiresAt).getTime() + MATCH_FOUND_HOLD_MS)
        : matchStartsAt;
    const turnStartedAt = matchStartsAt;
    quickMatches.set(matchId, {
        players,
        createdAt: new Date(),
        matchStartsAt,
        turnOrder,
        currentTurn,
        turnStartedAt,
        chakraPools,
        economy,
        pendingTurns: Object.fromEntries(players.map((username) => [username, makeEmptyPendingTurn()])),
        turnExpiresAt: delayedTurnExpiry,
    });
    players.forEach((p) => {
        const opponent = players.find((x) => x !== p) || null;
        if (!isGameBotUsername(p)) {
            userToMatch.set(p, {
                matchId,
                opponent: isGameBotUsername(opponent) ? GAME_BOT_DISPLAY_NAME : opponent,
            });
        }
    });
    return {
        matchId,
        matchStartsAt,
        turnOrder,
        currentTurn,
        turnStartedAt,
        chakraPools,
        economy,
        pendingTurns: Object.fromEntries(players.map((username) => [username, makeEmptyPendingTurn()])),
        turnExpiresAt: delayedTurnExpiry,
    };
};

const enqueuePlayer = (entry) => {
    clearScheduledBattleBotQueueCheck(entry.username);
    quickQueue = quickQueue.filter((u) => u.username !== entry.username);
    ladderQueue = ladderQueue.filter((u) => u.username !== entry.username);
    privateQueue = privateQueue.filter((u) => u.username !== entry.username);
    if (entry.mode === 'private') {
        privateQueue.push(entry);
        return;
    }
    if (entry.mode === 'ladder') {
        ladderQueue.push(entry);
        return;
    }
    quickQueue.push(entry);
};

const dequeueOpponent = (username, mode = 'quick') => {
    const queue = mode === 'ladder' ? ladderQueue : quickQueue;
    const opponent = queue.find((u) => u.username !== username);
    if (!opponent) return null;
    if (mode === 'ladder') {
        ladderQueue = ladderQueue.filter((u) => u.username !== opponent.username);
    } else {
        quickQueue = quickQueue.filter((u) => u.username !== opponent.username);
    }
    clearScheduledBattleBotQueueCheck(opponent.username);
    return opponent;
};

const getRandomBattleBotLevel = () => Math.max(1, Math.min(LADDER_MAX_LEVEL, 1 + Math.floor(Math.random() * LADDER_MAX_LEVEL)));

const buildBattleBotLadderPresentation = (level = 1) => {
    const normalizedLevel = Math.max(1, Math.min(LADDER_MAX_LEVEL, Number(level) || 1));
    const rankInfo = getRankInfoForLevel(normalizedLevel);
    return {
        level: normalizedLevel,
        rank: rankInfo.rank,
        rankHatUrl: rankInfo.hatUrl,
        experiencePoints: getCumulativeExperienceForLevel(normalizedLevel),
        experienceIntoLevel: 0,
        experienceForNextLevel: getExperienceRequiredForNextLevel(normalizedLevel),
        experienceToNextLevel: getExperienceRequiredForNextLevel(normalizedLevel),
        ladderRank: null,
        wins: 0,
        losses: 0,
        streak: 0,
        highestStreak: 0,
        highestLevel: normalizedLevel,
        famePoints: 0,
        isHokage: false,
    };
};

const createBattleBotPlayer = ({ matchId, team, ladderLevel = 1, displayName = GAME_BOT_DISPLAY_NAME }) => ({
    username: createGameBotUsername(matchId),
    displayName: displayName || GAME_BOT_DISPLAY_NAME,
    isBot: true,
    team,
    aliveCount: Array.isArray(team) ? team.length : 3,
    ladderLevel: Math.max(1, Number(ladderLevel) || 1),
    profile: {
        ladder: buildBattleBotLadderPresentation(ladderLevel),
    },
});

const resolveRosterIndicesForCharacterIds = (characterIds = []) =>
    (Array.isArray(characterIds) ? characterIds : [])
        .map((characterId) => {
            const normalizedId = normalizeCharacterId(characterId);
            return (Array.isArray(charactersData) ? charactersData : []).findIndex(
                (character) => normalizeCharacterId(character?.characterId) === normalizedId
            );
        })
        .filter((rosterIndex) => rosterIndex >= 0);

const buildBattleBotMatch = async ({ username, team, mode, playerProfile }) => {
    const matchId = `match-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const botPlayer = createBattleBotPlayer({
        matchId,
        team: buildBattleBotTeam(),
        ladderLevel: getRandomBattleBotLevel(),
    });
    const aliveLookup = {
        [username]: Array.isArray(team) ? team.length : 3,
        [botPlayer.username]: Array.isArray(botPlayer.team) ? botPlayer.team.length : 3,
    };
    const built = buildMatch([username, botPlayer.username], aliveLookup, { matchId });
    const playerDocs = [
        {
            username,
            team,
            aliveCount: aliveLookup[username],
        },
        botPlayer,
    ];
    const board = battleLogic.buildInitialBoard(playerDocs);
    const matchDocument = {
        matchId: built.matchId,
        mode,
        status: 'active',
        createdAt: new Date(),
        matchStartsAt: built.matchStartsAt,
        chakraPools: built.chakraPools,
        economy: built.economy,
        pendingTurns: built.pendingTurns,
        currentTurn: built.currentTurn,
        turnStartedAt: built.turnStartedAt,
        turnOrder: built.turnOrder,
        turnExpiresAt: built.turnExpiresAt,
        board,
        players: playerDocs,
        botMatch: {
            enabled: true,
            displayName: GAME_BOT_DISPLAY_NAME,
        },
    };
    await insertMatchActive(matchDocument);
    return matchDocument;
};

const buildTrainingDummyMatch = async ({ username, team }) => {
    const matchId = `match-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const botPlayer = createBattleBotPlayer({
        matchId,
        team: buildBattleBotTeam(),
        ladderLevel: 1,
        displayName: TRAINING_DUMMY_DISPLAY_NAME,
    });
    const aliveLookup = {
        [username]: Array.isArray(team) ? team.length : 3,
        [botPlayer.username]: Array.isArray(botPlayer.team) ? botPlayer.team.length : 3,
    };
    const built = buildMatch([username, botPlayer.username], aliveLookup, { matchId });
    const playerDocs = [
        {
            username,
            team,
            aliveCount: aliveLookup[username],
        },
        botPlayer,
    ];
    const board = battleLogic.buildInitialBoard(playerDocs);

    if (built.currentTurn !== username) {
        built.turnOrder = [username, botPlayer.username];
        built.currentTurn = username;
        const initialized = initializeEconomyState(built.turnOrder, username, aliveLookup);
        built.chakraPools = initialized.chakraPools;
        built.economy = initialized.economy;
        built.turnExpiresAt = initialized.turnExpiresAt
            ? new Date(new Date(initialized.turnExpiresAt).getTime() + MATCH_FOUND_HOLD_MS)
            : built.matchStartsAt;
    }

    const matchDocument = {
        matchId: built.matchId,
        mode: 'training',
        status: 'active',
        createdAt: new Date(),
        matchStartsAt: built.matchStartsAt,
        chakraPools: built.chakraPools,
        economy: built.economy,
        pendingTurns: built.pendingTurns,
        currentTurn: built.currentTurn,
        turnStartedAt: built.turnStartedAt,
        turnOrder: built.turnOrder,
        turnExpiresAt: built.turnExpiresAt,
        board,
        players: playerDocs,
        botMatch: {
            enabled: true,
            passive: true,
            displayName: TRAINING_DUMMY_DISPLAY_NAME,
        },
        trainingMatch: {
            adminOnly: true,
            passiveDummy: true,
        },
    };
    quickMatches.set(matchDocument.matchId, {
        players: built.turnOrder,
        createdAt: matchDocument.createdAt,
        matchStartsAt: matchDocument.matchStartsAt,
        turnOrder: matchDocument.turnOrder,
        currentTurn: matchDocument.currentTurn,
        turnStartedAt: matchDocument.turnStartedAt,
        chakraPools: matchDocument.chakraPools,
        economy: matchDocument.economy,
        pendingTurns: matchDocument.pendingTurns,
        turnExpiresAt: matchDocument.turnExpiresAt,
    });
    await insertMatchActive(matchDocument);
    userToMatch.set(username, { matchId: matchDocument.matchId, opponent: TRAINING_DUMMY_DISPLAY_NAME });
    return matchDocument;
};

const applyHardStoryModifiersToBoard = (board, botUsername) => {
    const botUnits = Array.isArray(board?.[botUsername]) ? board[botUsername] : [];
    const aliveEnemyCount = Math.max(1, botUnits.filter((unit) => unit && unit.alive !== false).length || 1);
    const pressureScale = aliveEnemyCount === 1 ? 3 : aliveEnemyCount === 2 ? 2 : 1;
    botUnits.forEach((unit) => {
        if (!unit || unit.alive === false) return;
        unit.state = unit.state && typeof unit.state === 'object' ? unit.state : {};
        unit.state.statuses = Array.isArray(unit.state.statuses) ? unit.state.statuses : [];
        unit.state.statuses.push({
            id: 'story_hard_mode_enemy_pressure',
            remainingTurns: 99,
            sourceUsername: botUsername,
            metadata: {
                helpful: true,
                destructibleDefensePoints: 15 + pressureScale * 15,
                damageReductionFlat: pressureScale * 5,
                damageBonusFlat: pressureScale * 5,
                turnEndGainChakra: {
                    chakraType: 'random',
                    amount: pressureScale,
                },
                tooltipText:
                    'Hard Mode: This character has destructible defense, damage reduction, bonus damage, and gains 1 random chakra each turn.',
            },
        });
    });
};

const buildStoryBattleBotMatch = async ({ username, team, chapter, node, difficulty = 'normal' }) => {
    const isHardMode = difficulty === 'hard';
    const matchId = `match-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const enemyRosterIndices = resolveRosterIndicesForCharacterIds(node.enemyTeam);
    const botPlayer = createBattleBotPlayer({
        matchId,
        team: enemyRosterIndices.length ? enemyRosterIndices : buildBattleBotTeam(),
        ladderLevel: isHardMode ? 30 : 1,
        displayName: isHardMode ? `${node.enemyDisplayName} (Hard)` : node.enemyDisplayName,
    });
    const aliveLookup = {
        [username]: Array.isArray(team) ? team.length : 3,
        [botPlayer.username]: Array.isArray(botPlayer.team) ? botPlayer.team.length : 3,
    };
    const built = buildMatch([username, botPlayer.username], aliveLookup, { matchId });
    const playerDocs = [
        {
            username,
            team,
            aliveCount: aliveLookup[username],
        },
        botPlayer,
    ];
    const board = battleLogic.buildInitialBoard(playerDocs);
    if (isHardMode) {
        applyHardStoryModifiersToBoard(board, botPlayer.username);
    }
    const matchDocument = {
        matchId: built.matchId,
        mode: 'story',
        status: 'active',
        createdAt: new Date(),
        matchStartsAt: built.matchStartsAt,
        chakraPools: built.chakraPools,
        economy: built.economy,
        pendingTurns: built.pendingTurns,
        currentTurn: built.currentTurn,
        turnStartedAt: built.turnStartedAt,
        turnOrder: built.turnOrder,
        turnExpiresAt: built.turnExpiresAt,
        board,
        players: playerDocs,
        botMatch: {
            enabled: true,
            displayName: botPlayer.displayName || node.enemyDisplayName,
        },
        storyMatch: {
            chapterId: chapter.chapterId,
            nodeId: node.nodeId,
            difficulty: isHardMode ? 'hard' : 'normal',
            hardModeRyoReward: isHardMode ? STORY_HARD_MODE_RYO_REWARD : 0,
            bossScript: node.bossScript || null,
            enemyDisplayName: isHardMode ? `${node.enemyDisplayName} (Hard)` : node.enemyDisplayName,
            introDialogue: node.introDialogue || [],
            outroDialogueWin: node.outroDialogueWin || [],
            outroDialogueLoss: node.outroDialogueLoss || [],
        },
    };
    await insertMatchActive(matchDocument);
    return matchDocument;
};

const buildGauntletBattleBotMatch = async ({ username, runState, node }) => {
    const matchId = `match-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const enemyTeam = gauntlet.getEnemyTeamById(node?.content?.enemyTeamId) || gauntlet.ENEMY_TEAMS[0];
    const enemyRosterIndices = resolveRosterIndicesForCharacterIds(enemyTeam?.characterIds || []);
    const botPlayer = createBattleBotPlayer({
        matchId,
        team: enemyRosterIndices.length ? enemyRosterIndices : buildBattleBotTeam(),
        ladderLevel: Math.max(1, Number(node?.content?.aggressionTier) || 1),
        displayName: enemyTeam?.name || 'Forest Rival Team',
    });
    const team = Array.isArray(runState?.team) ? runState.team.slice(0, 3) : [];
    const aliveLookup = {
        [username]: team.length || 3,
        [botPlayer.username]: Array.isArray(botPlayer.team) ? botPlayer.team.length : 3,
    };
    const built = buildMatch([username, botPlayer.username], aliveLookup, { matchId });
    const playerDocs = [
        {
            username,
            team,
            aliveCount: aliveLookup[username],
        },
        botPlayer,
    ];
    const board = battleLogic.buildInitialBoard(playerDocs);
    const playerUnits = Array.isArray(board?.[username]) ? board[username] : [];
    playerUnits.forEach((unit, index) => {
        if (!unit) return;
        const hp = Number(Array.isArray(runState?.teamHp) ? runState.teamHp[index] : battleLogic.DEFAULT_HP);
        unit.hp = Math.max(1, Math.min(battleLogic.DEFAULT_HP, Number.isFinite(hp) ? Math.round(hp) : battleLogic.DEFAULT_HP));
        unit.alive = unit.hp > 0;
    });
    const matchDocument = {
        matchId: built.matchId,
        mode: 'gauntlet',
        status: 'active',
        createdAt: new Date(),
        matchStartsAt: built.matchStartsAt,
        chakraPools: built.chakraPools,
        economy: built.economy,
        pendingTurns: built.pendingTurns,
        currentTurn: built.currentTurn,
        turnStartedAt: built.turnStartedAt,
        turnOrder: built.turnOrder,
        turnExpiresAt: built.turnExpiresAt,
        board,
        players: playerDocs,
        botMatch: {
            enabled: true,
            displayName: botPlayer.displayName || enemyTeam?.name || 'Forest Rival Team',
        },
        gauntletMatch: {
            runSeed: runState?.seed || null,
            nodeId: node?.id || null,
            nodeType: node?.type || null,
            enemyTeamId: enemyTeam?.id || null,
            enemyDisplayName: enemyTeam?.name || 'Forest Rival Team',
            aggressionTier: Math.max(1, Math.min(3, Number(node?.content?.aggressionTier) || 1)),
            resources: {
                heavenScrolls: Math.max(0, Number(runState?.heavenScrolls) || 0),
                earthScrolls: Math.max(0, Number(runState?.earthScrolls) || 0),
                scrollFragments: Math.max(0, Number(runState?.scrollFragments) || 0),
                ryo: Math.max(0, Number(runState?.ryo) || 0),
            },
            modifiers: buildGauntletModifierSummary(runState),
        },
    };
    await insertMatchActive(matchDocument);
    return matchDocument;
};

const clearScheduledBattleBotQueueCheck = (username) => {
    const normalizedUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';
    if (!normalizedUsername) return;
    const timer = battleBotQueueTimers.get(normalizedUsername);
    if (timer) {
        clearTimeout(timer);
        battleBotQueueTimers.delete(normalizedUsername);
    }
};

const scheduleBattleBotQueueCheck = ({ username, mode = 'quick', userProfile = null }) => {
    if (!BATTLE_BOTS_ENABLED || (mode !== 'quick' && mode !== 'ladder')) {
        return;
    }
    const normalizedUsername = typeof username === 'string' ? username.trim().toLowerCase() : '';
    if (!normalizedUsername) return;
    clearScheduledBattleBotQueueCheck(username);
    const queued = findQueuedEntry(username, mode);
    if (!queued?.entry || queued.entry.allowBattleBot === false) {
        return;
    }
    const queuedAtMs = new Date(queued.entry.queuedAt || Date.now()).getTime();
    const elapsedMs = Number.isNaN(queuedAtMs) ? 0 : Date.now() - queuedAtMs;
    const delayMs = Math.max(0, BATTLE_BOT_QUEUE_TIMEOUT_MS - elapsedMs);
    const timer = setTimeout(async () => {
        battleBotQueueTimers.delete(normalizedUsername);
        try {
            const latestQueued = findQueuedEntry(username, mode);
            if (!latestQueued?.entry || latestQueued.entry.allowBattleBot === false) {
                return;
            }
            if (userToMatch.has(username)) {
                return;
            }
            const existingMatch = await matchesCollection.findOne({
                'players.username': username,
                status: { $ne: 'ended' },
            });
            if (existingMatch) {
                const opponentEntry = (existingMatch.players || []).find((player) => player?.username !== username);
                userToMatch.set(username, {
                    matchId: existingMatch.matchId,
                    opponent: opponentEntry ? getPlayerDisplayName(opponentEntry) : GAME_BOT_DISPLAY_NAME,
                });
                scheduleBattleBotTurn(existingMatch);
                return;
            }
            let normalizedProfile = userProfile && typeof userProfile === 'object' ? userProfile : null;
            if (!normalizedProfile) {
                const user = await usersCollection.findOne(
                    { username },
                    { projection: { _id: 1, username: 1, createdAt: 1, profile: 1 } }
                );
                normalizedProfile = normalizeUserProfile(user || {});
            }
            const botMatch = await maybeCreateBattleBotMatch({
                username,
                mode,
                userProfile: normalizedProfile,
            });
            if (botMatch) {
                scheduleBattleBotTurn(botMatch);
            }
        } catch (error) {
            console.error('Battle bot queue check failed:', error);
        }
    }, delayMs);
    battleBotQueueTimers.set(normalizedUsername, timer);
};

const maybeCreateBattleBotMatch = async ({ username, mode, userProfile = null }) => {
    if (!BATTLE_BOTS_ENABLED || (mode !== 'quick' && mode !== 'ladder')) {
        return null;
    }
    const queued = findQueuedEntry(username, mode);
    if (!queued?.entry) {
        return null;
    }
    const queuedAtMs = new Date(queued.entry.queuedAt || Date.now()).getTime();
    if (Number.isNaN(queuedAtMs) || Date.now() - queuedAtMs < BATTLE_BOT_QUEUE_TIMEOUT_MS) {
        return null;
    }
    if (queued.entry.allowBattleBot === false) {
        return null;
    }
    removeQueuedEntry(username, mode);
    const matchDocument = await buildBattleBotMatch({
        username,
        team: queued.entry.team,
        mode,
        playerProfile: userProfile,
    });
    return matchDocument;
};

const dequeuePrivateOpponent = (username, targetUsername) => {
    const normalizedTarget = typeof targetUsername === 'string' ? targetUsername.trim().toLowerCase() : '';
    if (!normalizedTarget) return null;
    const opponent = privateQueue.find((entry) => {
        const entryTarget = typeof entry?.targetUsername === 'string'
            ? entry.targetUsername.trim().toLowerCase()
            : '';
        return (
            entry.username !== username &&
            entry.username.toLowerCase() === normalizedTarget &&
            entryTarget === username.toLowerCase()
        );
    });
    if (!opponent) return null;
    privateQueue = privateQueue.filter((entry) => entry.username !== opponent.username);
    clearScheduledBattleBotQueueCheck(opponent.username);
    return opponent;
};

const getAliveCountForUser = (match, username) => {
    const playerEntry = (match.players || []).find((p) => p.username === username);
    if (playerEntry && Number.isInteger(playerEntry.aliveCount)) {
        return playerEntry.aliveCount;
    }
    if (Array.isArray(playerEntry?.team)) {
        return playerEntry.team.length;
    }
    return 0;
};

const getTeamStatusFlagCount = (match, username, flagName) => {
    if (!match || !username || !flagName) return 0;
    const units = Array.isArray(match.board?.[username]) ? match.board[username] : [];
    let count = 0;
    units.forEach((unit, slot) => {
        if (!unit || unit.alive === false) return;
        const state = battleLogic.getUnitState(match, username, slot);
        const statuses = Array.isArray(state?.statuses) ? state.statuses : [];
        statuses.forEach((status) => {
            const remaining = Number(status?.remainingTurns) || 0;
            if (remaining > 0 && Boolean(status?.metadata?.[flagName])) {
                count += 1;
            }
        });
    });
    return count;
};

const getTeamStatusMetadataSum = (match, username, metadataKey) => {
    if (!match || !username || !metadataKey) return 0;
    const units = Array.isArray(match.board?.[username]) ? match.board[username] : [];
    let total = 0;
    units.forEach((unit, slot) => {
        if (!unit || unit.alive === false) return;
        const state = battleLogic.getUnitState(match, username, slot);
        const statuses = Array.isArray(state?.statuses) ? state.statuses : [];
        statuses.forEach((status) => {
            const remaining = Number(status?.remainingTurns) || 0;
            if (remaining <= 0) return;
            total += Number(status?.metadata?.[metadataKey]) || 0;
        });
    });
    return Math.max(0, total);
};

const ensureMatchTurnData = async (match) => {
    if (!match || match.currentTurn) {
        return match;
    }
    const usernames = (match.players || []).map((p) => p.username).filter(Boolean);
    const { turnOrder, currentTurn } = pickInitialTurn(usernames);
    const turnStartedAt = new Date();
    const turnExpiresAt = new Date(Date.now() + getTurnDurationMsForUser(match, currentTurn));
    await updateMatchActive(match.matchId,
        { $set: { currentTurn, turnOrder, turnStartedAt, turnExpiresAt } }
    );
    return { ...match, currentTurn, turnOrder, turnStartedAt, turnExpiresAt };
};

const ensureMatchEconomy = async (match) => {
    if (!match) return match;
    let changed = false;
    const usernames = (match.players || []).map((p) => p.username).filter(Boolean);

    if (!match.chakraPools || !match.economy) {
        const { chakraPools, economy, turnExpiresAt } = initializeEconomyState(
            usernames,
            match.currentTurn
        );
        match.chakraPools = chakraPools;
        match.economy = economy;
        match.turnStartedAt = match.turnStartedAt || new Date();
        match.turnExpiresAt = match.turnExpiresAt || turnExpiresAt;
        changed = true;
    } else {
        // Backfill missing users or keys
        match.chakraPools = match.chakraPools || {};
        match.economy.turnCounts = match.economy.turnCounts || {};
        match.economy.startGranted = match.economy.startGranted || {};
        match.economy.lastChakraGain = match.economy.lastChakraGain || {};
        usernames.forEach((u) => {
            if (!match.chakraPools[u]) {
                match.chakraPools[u] = createEmptyChakraPool();
                changed = true;
            }
            if (!Number.isInteger(match.economy.turnCounts[u])) {
                match.economy.turnCounts[u] = 0;
                changed = true;
            }
            if (typeof match.economy.startGranted[u] !== 'boolean') {
                match.economy.startGranted[u] = false;
                changed = true;
            }
            if (!Array.isArray(match.economy.lastChakraGain[u])) {
                match.economy.lastChakraGain[u] = [];
                changed = true;
            }
        });
        if (!match.turnStartedAt) {
            match.turnStartedAt = new Date();
            changed = true;
        }
        if (!match.turnExpiresAt) {
            match.turnExpiresAt = new Date(Date.now() + getTurnDurationMsForUser(match, match.currentTurn));
            changed = true;
        }
    }

    // Ensure first-turn start gain happens once per player
    const current = match.currentTurn;
    if (
        current &&
        !match.economy.startGranted[current] &&
        match.economy.turnCounts[current] === 0
    ) {
        const openingGainCount = Math.max(1, getAliveCountForUser(match, current));
        const gains = generateRandomChakra(openingGainCount, match.chakraPools[current]);
        match.chakraPools[current] = applyChakraGain(match.chakraPools[current], gains);
        match.economy.startGranted[current] = true;
        match.economy.lastChakraGain[current] = gains;
        changed = true;
    }

    if (changed) {
        await updateMatchActive(match.matchId,
            {
                $set: {
                    chakraPools: match.chakraPools,
                    economy: match.economy,
                    turnStartedAt: match.turnStartedAt,
                    turnExpiresAt: match.turnExpiresAt,
                },
            }
        );
    }
    return match;
};

const ensurePendingTurnState = async (match) => {
    if (!match) return match;
    let changed = false;
    const usernames = (match.players || []).map((p) => p.username).filter(Boolean);
    if (!match.pendingTurns || typeof match.pendingTurns !== 'object') {
        match.pendingTurns = {};
        changed = true;
    }
    usernames.forEach((username) => {
        const pending = match.pendingTurns[username];
        if (!pending || typeof pending !== 'object') {
            match.pendingTurns[username] = makeEmptyPendingTurn();
            changed = true;
            return;
        }
        const normalized = clampPendingTurnRandom(pending, match.chakraPools?.[username] || {});
        if (JSON.stringify(normalized) !== JSON.stringify(pending)) {
            match.pendingTurns[username] = normalized;
            changed = true;
        }
    });
    if (changed) {
        await updateMatchActive(match.matchId,
            {
                $set: {
                    pendingTurns: match.pendingTurns,
                },
            }
        );
    }
    return match;
};

const getPendingTurn = (match, username) => {
    if (!match || !username) return makeEmptyPendingTurn();
    const pending = match.pendingTurns?.[username];
    return clonePendingTurn(pending || makeEmptyPendingTurn());
};

const hasPendingTurnStartChoice = (pendingTurn) =>
    Boolean(
        pendingTurn?.turnStartChoice &&
            Array.isArray(pendingTurn.turnStartChoice.options) &&
            pendingTurn.turnStartChoice.options.length > 0
    );

const persistMatchState = async (match, fields = {}) => {
    await updateMatchActive(match.matchId, { $set: fields });
    if (quickMatches.has(match.matchId)) {
        quickMatches.set(match.matchId, {
            ...(quickMatches.get(match.matchId) || {}),
            ...fields,
        });
    }
};

const getBattleBotPlayer = (match) =>
    Array.isArray(match?.players) ? match.players.find((player) => player?.isBot) || null : null;

const getBattleBotUsername = (match) => getBattleBotPlayer(match)?.username || null;

const isBattleBotTurn = (match) => isGameBotUsername(match?.currentTurn || '');

const isPassiveBattleBotMatch = (match) => Boolean(match?.botMatch?.passive);

const botCanAffordSkill = ({ match, username, skill, actorState }) => {
    const pool = match?.chakraPools?.[username];
    if (!pool || !skill) {
        return false;
    }
    const pending = getPendingTurn(match, username);
    const { reservedSpecific, requiredRandom } = battleLogic.computeEffectiveEnergyCost({
        skill,
        actorState,
    });
    for (const type of chakraTypes) {
        if ((Number(pool[type]) || 0) < (Number(reservedSpecific[type]) || 0)) {
            return false;
        }
    }
    const remainingPool = chakraTypes.reduce((sum, type) => {
        const remaining = (Number(pool[type]) || 0) - (Number(reservedSpecific[type]) || 0);
        return sum + Math.max(0, remaining);
    }, 0);
    return remainingPool >= Math.max(0, Number(pending.unresolvedRandom) || 0) + requiredRandom;
};

const getBattleBotTurnActionLimit = ({ match, username }) => {
    if (match?.mode !== 'gauntlet') {
        return Number.POSITIVE_INFINITY;
    }
    const tier = Math.max(1, Math.min(3, Number(match?.gauntletMatch?.aggressionTier) || 1));
    const botTurnCount = Math.max(0, Number(match?.economy?.turnCounts?.[username]) || 0);
    if (tier <= 1) {
        return 1;
    }
    if (tier === 2) {
        return botTurnCount === 0 ? 1 : 2;
    }
    return 2;
};

const chooseBattleBotTargetSelection = (options = {}) => {
    const targets = Array.isArray(options.targets) ? options.targets : [];
    if (!targets.length) {
        return null;
    }
    if (options.mode === 'single' || options.mode === 'self') {
        return [targets[Math.floor(Math.random() * targets.length)]];
    }
    return targets;
};

const assignBattleBotRandomChakra = ({ match, username }) => {
    const pending = getPendingTurn(match, username);
    while ((pending.unresolvedRandom || 0) > 0) {
        const pool = match?.chakraPools?.[username] || createEmptyChakraPool();
        const availableTypes = chakraTypes.filter((type) => (Number(pool[type]) || 0) > 0);
        if (!availableTypes.length) {
            break;
        }
        const chakraType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        adjustRandomAssignment({ match, username, chakraType, delta: 1 });
        const nextPending = getPendingTurn(match, username);
        pending.unresolvedRandom = nextPending.unresolvedRandom;
    }
};

const classifySkillEffects = (skill) => {
    const effects = Array.isArray(skill?.effects) ? skill.effects : [];
    const hasType = (type) => effects.some((effect) => effect && effect.type === type);
    return {
        isDamage: hasType('damage') || hasType('health_steal_damage') || hasType('execute_below_hp'),
        isHeal: hasType('heal'),
        isCleanse: hasType('cleanse_statuses'),
    };
};

const isTargetAlly = (target, actingUsername) => Boolean(target) && target.username === actingUsername;

const pickLowestHpFractionTarget = (hydrated, targets = []) => {
    let best = null;
    let bestFraction = Infinity;
    (Array.isArray(targets) ? targets : []).forEach((target) => {
        const unit = hydrated?.board?.[target?.username]?.[target?.slot];
        if (!unit || unit.alive === false) {
            return;
        }
        const fraction = (Number(unit.hp) || 0) / (Number(battleLogic.DEFAULT_HP) || 100);
        if (fraction < bestFraction) {
            bestFraction = fraction;
            best = target;
        }
    });
    return best || targets[0] || null;
};

// Picks a smarter target than random: damage/harmful skills go to the lowest-HP enemy,
// heals go to the lowest-HP ally. Falls back to null so callers can use the random default.
const pickBestTargetSelection = ({ hydrated, actingUsername, skill, options }) => {
    const targets = Array.isArray(options?.targets) ? options.targets : [];
    if (!targets.length) {
        return null;
    }
    if (options.mode === 'all') {
        return targets;
    }
    if (options.mode !== 'single') {
        return null;
    }
    const classification = classifySkillEffects(skill);
    let pool = targets;
    if (options.targetType === 'single-character') {
        const filtered = targets.filter((target) =>
            classification.isHeal ? isTargetAlly(target, actingUsername) : !isTargetAlly(target, actingUsername)
        );
        if (filtered.length) {
            pool = filtered;
        }
    }
    const picked = pickLowestHpFractionTarget(hydrated, pool);
    return picked ? [picked] : null;
};

// Heuristic priority score for a skill: favors damage, favors healing only when an ally is
// actually hurt (so the bot doesn't waste heals at full HP), mildly favors cleansing.
const scoreSkillChoice = ({ hydrated, actingUsername, skill }) => {
    const classification = classifySkillEffects(skill);
    let score = 1;
    if (classification.isDamage) {
        score += 5;
    }
    if (classification.isHeal) {
        const team = Array.isArray(hydrated?.board?.[actingUsername]) ? hydrated.board[actingUsername] : [];
        const hurtAlly = team.some(
            (unit) =>
                unit &&
                unit.alive !== false &&
                (Number(unit.hp) || 0) < (Number(battleLogic.DEFAULT_HP) || 100) * 0.4
        );
        score += hurtAlly ? 8 : -3;
    }
    if (classification.isCleanse) {
        score += 2;
    }
    return score;
};

const bossScriptRuleMatches = ({ rule, turnNumber, actorHpFraction }) => {
    const when = rule?.when || {};
    if (Number.isFinite(Number(when.turnGte)) && turnNumber < Number(when.turnGte)) {
        return false;
    }
    if (Number.isFinite(Number(when.selfHpBelowFraction)) && actorHpFraction >= Number(when.selfHpBelowFraction)) {
        return false;
    }
    return true;
};

// Orders a boss's skill indices for a turn: scripted rules (matched against turn/HP
// conditions) come first in priority order, remaining skills are ranked by heuristic score.
// Legality/affordability is still validated by the caller for each candidate in turn.
const orderStoryBotSkillIndices = ({ hydrated, username, actorUnit, character, candidateIndices, bossScript }) => {
    const turnNumber = Number(hydrated?.economy?.turnCounts?.[username]) || 0;
    const actorHpFraction = (Number(actorUnit?.hp) || 0) / (Number(battleLogic.DEFAULT_HP) || 100);
    const skills = Array.isArray(character?.skills) ? character.skills : [];
    const priorityIndices = [];
    (Array.isArray(bossScript) ? bossScript : []).forEach((rule) => {
        if (!bossScriptRuleMatches({ rule, turnNumber, actorHpFraction })) {
            return;
        }
        const skillIndex = skills.findIndex((skill) => skill?.id === rule.skillId);
        if (skillIndex >= 0 && candidateIndices.includes(skillIndex) && !priorityIndices.includes(skillIndex)) {
            priorityIndices.push(skillIndex);
        }
    });
    const remaining = candidateIndices
        .filter((index) => !priorityIndices.includes(index))
        .map((index) => ({
            index,
            score: scoreSkillChoice({ hydrated, actingUsername: username, skill: skills[index] }),
        }))
        .sort((a, b) => b.score - a.score)
        .map((entry) => entry.index);
    return [...priorityIndices, ...remaining];
};

const resolveTurnStartChoiceForUser = ({ match, username, choiceKey }) => {
    const pendingTurn = getPendingTurn(match, username);
    const prompt = pendingTurn.turnStartChoice;
    if (!hasPendingTurnStartChoice(pendingTurn) || !prompt) {
        throw new Error('No turn-start choice is pending.');
    }
    const option = Array.isArray(prompt.options)
        ? prompt.options.find((entry) => entry?.key === choiceKey)
        : null;
    if (!option) {
        throw new Error('Invalid turn-start choice.');
    }
    const sourceUnit = Array.isArray(match.board?.[username]) ? match.board[username][prompt.actorSlot] : null;
    const targetPick = battleLogic.selectTurnStartChoiceTarget({
        match,
        actingUsername: username,
        choice: option,
    });
    if (!targetPick?.unit) {
        throw new Error('No valid target available.');
    }
    const targetUnit = targetPick.unit;
    const targetState = battleLogic.getUnitState(match, targetPick.username, targetPick.slot);
    const effect = option.effect || {};
    const effectType = typeof effect.type === 'string' ? effect.type.trim().toLowerCase() : '';
    if ((effectType === 'heal' || effectType === 'cleanse_harmful') && targetUnit.alive === false) {
        throw new Error('No valid living ally is available.');
    }
    if (effectType === 'revive' && targetUnit.alive !== false) {
        throw new Error('No dead ally is available.');
    }
    if (effectType === 'heal') {
        battleLogic.applyHealToUnit(targetUnit, Math.max(0, Number(effect.amount) || 0));
    } else if (effectType === 'cleanse_harmful') {
        battleLogic.cleanseHarmfulStatuses(targetUnit, effect.count);
    } else if (effectType === 'revive') {
        battleLogic.reviveUnitToHp(targetUnit, Math.max(1, Number(effect.amount) || 30));
        targetState.statuses = Array.isArray(targetState.statuses) ? targetState.statuses : [];
    } else {
        throw new Error('Unsupported choice effect.');
    }

    match.players.forEach((player) => {
        if (!player?.username) return;
        player.aliveCount = getAliveCountForUser(match, player.username);
    });

    const sourceState = sourceUnit ? battleLogic.getUnitState(match, username, prompt.actorSlot) : null;
    if (sourceState && prompt.sourceStatusId) {
        const status = Array.isArray(sourceState.statuses)
            ? sourceState.statuses.find((entry) => entry?.id === prompt.sourceStatusId)
            : null;
        if (status) {
            const metadata = status?.metadata && typeof status.metadata === 'object' ? { ...status.metadata } : {};
            metadata.turnStartChoiceQueued = false;
            metadata.turnStartChoiceUsesUsed = Math.max(0, Number(metadata.turnStartChoiceUsesUsed) || 0) + 1;
            status.metadata = metadata;
            const maxUses = Math.max(0, Number(metadata.turnStartChoiceMaxUses) || 0);
            if (maxUses > 0 && metadata.turnStartChoiceUsesUsed >= maxUses) {
                status.metadata = {
                    ...metadata,
                    tooltipText: "Doctor's Bag has been used.",
                    turnStartChoiceQueued: false,
                };
            }
        }
    }
    pendingTurn.turnStartChoice = null;
    match.pendingTurns[username] = pendingTurn;
};

const runBattleBotTurn = async (matchId) => {
    if (!matchId || activeBattleBotTurns.has(matchId)) {
        return;
    }
    activeBattleBotTurns.add(matchId);
    try {
        const match = await getMatchActive(matchId);
        if (!match) {
            return;
        }
        const hydratedTurn = await ensureMatchTurnData(match);
        const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
        const hydratedPending = await ensurePendingTurnState(hydratedEcon);
        const hydratedBoard = await ensureBoardState(hydratedPending);
        const hydrated = await autoAdvanceTurnIfExpired(hydratedBoard);
        if (!hydrated || hydrated.status === 'ended' || !isBattleBotTurn(hydrated)) {
            return;
        }
        const username = hydrated.currentTurn;
        const pendingTurn = getPendingTurn(hydrated, username);
        const passiveBot = isPassiveBattleBotMatch(hydrated);
        if (!passiveBot && hasPendingTurnStartChoice(pendingTurn)) {
            const choice = Array.isArray(pendingTurn.turnStartChoice?.options)
                ? pendingTurn.turnStartChoice.options[0]
                : null;
            if (choice?.key) {
                resolveTurnStartChoiceForUser({
                    match: hydrated,
                    username,
                    choiceKey: choice.key,
                });
            }
        }

        const team = Array.isArray(hydrated.board?.[username]) ? hydrated.board[username] : [];
        const actionLimit = getBattleBotTurnActionLimit({ match: hydrated, username });
        let queuedActionCount = Object.keys(pendingTurn.queuedByActorSlot || {}).length;
        const actorSlots = shuffleList(
            team
                .map((unit, slot) => (unit && unit.alive !== false ? slot : null))
                .filter((slot) => Number.isInteger(slot))
        );
        if (!passiveBot) actorSlots.forEach((actorSlot) => {
            if (queuedActionCount >= actionLimit) {
                return;
            }
            const actorUnit = hydrated.board?.[username]?.[actorSlot];
            if (!actorUnit || actorUnit.alive === false) {
                return;
            }
            const actorState = battleLogic.getUnitState(hydrated, username, actorSlot);
            if (battleLogic.isActorUnableToUseSkills(actorState)) {
                return;
            }
            const character = charactersData?.[actorUnit.rosterIndex];
            const isStoryBot = hydrated.mode === 'story' || hydrated.mode === 'gauntlet';
            // Hidden alt-skill entries (e.g. Dosu's "-improved" variants, Jiraiya's
            // locked follow-ups) only exist to be swapped in at their base skill's
            // slot via skillReplacements once unlocked -- they are not independent
            // action slots. Iterating the raw array let bots queue them directly,
            // bypassing whatever unlock condition normally gates them.
            const baseSkillIndices = (Array.isArray(character?.skills) ? character.skills : [])
                .map((skill, index) =>
                    skill && !skill.hiddenFromSelectionViewer && !skill.omitFromSelectionViewer ? index : null
                )
                .filter((index) => index !== null);
            const skillIndices = isStoryBot
                ? orderStoryBotSkillIndices({
                      hydrated,
                      username,
                      actorUnit,
                      character,
                      candidateIndices: baseSkillIndices,
                      bossScript: hydrated.storyMatch?.bossScript,
                  })
                : shuffleList(baseSkillIndices);
            for (const skillIndex of skillIndices) {
                const options = battleLogic.computeTargetOptions({
                    match: hydrated,
                    actingUsername: username,
                    actorSlot,
                    skillIndex,
                    characters: charactersData,
                });
                if (!options?.targetType || options.mode === 'unknown' || !Array.isArray(options.targets) || !options.targets.length) {
                    continue;
                }
                const skill = battleLogic.resolveEffectiveSkill({
                    characters: charactersData,
                    rosterIndex: actorUnit.rosterIndex,
                    skillIndex,
                    actorState,
                });
                if (!botCanAffordSkill({ match: hydrated, username, skill, actorState })) {
                    continue;
                }
                const classChoiceOptions = Array.isArray(skill?.classChoiceOptions)
                    ? skill.classChoiceOptions.map((entry) => normalizeClassChoice(entry)).filter(Boolean)
                    : [];
                const targetSelection = isStoryBot
                    ? pickBestTargetSelection({ hydrated, actingUsername: username, skill, options }) ||
                      chooseBattleBotTargetSelection(options)
                    : chooseBattleBotTargetSelection(options);
                if (!targetSelection) {
                    continue;
                }
                try {
                    queueSkillForActorSlot({
                        match: hydrated,
                        username,
                        actorSlot,
                        skillIndex,
                        targetSelection,
                        classChoice: classChoiceOptions[0] || null,
                    });
                    queuedActionCount += 1;
                    break;
                } catch (error) {
                    continue;
                }
            }
        });

        assignBattleBotRandomChakra({ match: hydrated, username });
        const updated = await finalizeTurn(hydrated, username);
        await broadcastMatchState(updated || hydrated);
        if (updated && isBattleBotTurn(updated)) {
            scheduleBattleBotTurn(updated);
        }
    } finally {
        activeBattleBotTurns.delete(matchId);
    }
};

function scheduleBattleBotTurn(match) {
    if (!match || match.status === 'ended' || !isBattleBotTurn(match)) {
        return;
    }
    const matchId = match.matchId;
    if (!matchId || activeBattleBotTurns.has(matchId) || scheduledBattleBotTurns.has(matchId)) {
        return;
    }
    const matchStartsAtMs = match.matchStartsAt ? new Date(match.matchStartsAt).getTime() : Date.now();
    const turnStartedAtMs = match.turnStartedAt ? new Date(match.turnStartedAt).getTime() : matchStartsAtMs;
    const earliestActionAtMs = Math.max(
        matchStartsAtMs,
        Number.isNaN(turnStartedAtMs) ? matchStartsAtMs : turnStartedAtMs + getBattleBotActionDelayMs()
    );
    const delayMs = Math.max(0, earliestActionAtMs - Date.now());
    scheduledBattleBotTurns.add(matchId);
    setTimeout(() => {
        scheduledBattleBotTurns.delete(matchId);
        runBattleBotTurn(matchId).catch((error) => {
            console.error('Battle bot turn failed:', error);
        });
    }, delayMs);
}

const normalizeClassChoice = (value) =>
    typeof value === 'string' ? value.trim().toLowerCase() : '';

const queueSkillForActorSlot = ({ match, username, actorSlot, skillIndex, targetSelection, classChoice }) => {
    const pool = match.chakraPools?.[username];
    if (!pool) {
        throw new Error('Chakra pool unavailable.');
    }
    const pending = getPendingTurn(match, username);
    const actorKey = String(actorSlot);
    const existing = pending.queuedByActorSlot[actorKey];
    if (existing) {
        chakraTypes.forEach((type) => {
            pool[type] = (pool[type] || 0) + (existing.reservedSpecific?.[type] || 0);
        });
        pending.unresolvedRandom = Math.max(0, pending.unresolvedRandom - (existing.requiredRandom || 0));
        delete pending.queuedByActorSlot[actorKey];
        pending.queueOrder = pending.queueOrder.filter((slot) => slot !== actorSlot);
        const clamped = clampPendingTurnRandom(pending, pool);
        pending.unresolvedRandom = clamped.unresolvedRandom;
        pending.randomAssignments = clamped.randomAssignments;
        pending.queueOrder = clamped.queueOrder;
    }
    const actorBoard = match.board?.[username] || [];
    const actorUnit = actorBoard[actorSlot];
    if (!actorUnit || actorUnit.alive === false) {
        throw new Error('Actor is unavailable.');
    }
    const actorState = battleLogic.getUnitState(match, username, actorSlot);
    if (battleLogic.isActorUnableToUseSkills(actorState)) {
        throw new Error('Actor is stunned and cannot use skills.');
    }
    const rosterIndex = actorUnit?.rosterIndex;
    const skill = battleLogic.resolveEffectiveSkill({
        characters: charactersData,
        rosterIndex,
        skillIndex,
        actorState,
    });
    if (!skill) {
        throw new Error('Skill not found.');
    }
    const classChoiceOptions = Array.isArray(skill?.classChoiceOptions)
        ? skill.classChoiceOptions.map((entry) => normalizeClassChoice(entry)).filter(Boolean)
        : [];
    const normalizedClassChoice = normalizeClassChoice(classChoice);
    if (normalizedClassChoice && classChoiceOptions.length > 0 && !classChoiceOptions.includes(normalizedClassChoice)) {
        throw new Error('Invalid class choice.');
    }
    if (battleLogic.isSkillIndexBlockedForActor(actorState, skillIndex)) {
        throw new Error('This skill is unusable this turn.');
    }
    const baseSkill = Array.isArray(charactersData?.[rosterIndex]?.skills)
        ? charactersData[rosterIndex].skills[skillIndex]
        : null;
    const cooldownSkillId =
        skill?.useBaseSkillCooldown && baseSkill?.id ? baseSkill.id : skill?.id || baseSkill?.id || null;
    if (cooldownSkillId && battleLogic.getSkillCooldownRemaining(actorState, cooldownSkillId) > 0) {
        throw new Error('Skill is on cooldown.');
    }
    const { reservedSpecific, requiredRandom } = battleLogic.computeEffectiveEnergyCost({
        skill,
        actorState,
    });
    chakraTypes.forEach((type) => {
        if ((pool[type] || 0) < reservedSpecific[type]) {
            throw new Error('Not enough chakra.');
        }
    });
    chakraTypes.forEach((type) => {
        pool[type] = (pool[type] || 0) - reservedSpecific[type];
    });
    if (getTotalChakra(pool) < pending.unresolvedRandom + requiredRandom) {
        chakraTypes.forEach((type) => {
            pool[type] = (pool[type] || 0) + reservedSpecific[type];
        });
        throw new Error('Not enough chakra for random cost.');
    }
    pending.queuedByActorSlot[actorKey] = {
        actorSlot,
        skillIndex,
        targetSelection,
        ...(normalizedClassChoice ? { classChoice: normalizedClassChoice } : {}),
        reservedSpecific,
        requiredRandom,
    };
    if (!pending.queueOrder.includes(actorSlot)) {
        pending.queueOrder.push(actorSlot);
    }
    pending.unresolvedRandom += requiredRandom;
    const clamped = clampPendingTurnRandom(pending, pool);
    pending.unresolvedRandom = clamped.unresolvedRandom;
    pending.randomAssignments = clamped.randomAssignments;
    pending.queueOrder = clamped.queueOrder;
    match.chakraPools[username] = pool;
    match.pendingTurns[username] = pending;
};

const cancelQueuedSkillForActorSlot = ({ match, username, actorSlot }) => {
    const pool = match.chakraPools?.[username];
    const pending = getPendingTurn(match, username);
    const actorKey = String(actorSlot);
    const existing = pending.queuedByActorSlot[actorKey];
    if (!pool || !existing) {
        return false;
    }
    chakraTypes.forEach((type) => {
        pool[type] = (pool[type] || 0) + (existing.reservedSpecific?.[type] || 0);
    });
    pending.unresolvedRandom = Math.max(0, pending.unresolvedRandom - (existing.requiredRandom || 0));
    delete pending.queuedByActorSlot[actorKey];
    pending.queueOrder = pending.queueOrder.filter((slot) => slot !== actorSlot);
    const clamped = clampPendingTurnRandom(pending, pool);
    pending.unresolvedRandom = clamped.unresolvedRandom;
    pending.randomAssignments = clamped.randomAssignments;
    pending.queueOrder = clamped.queueOrder;
    match.chakraPools[username] = pool;
    match.pendingTurns[username] = pending;
    return true;
};

const reorderQueuedSkills = ({ match, username, actorSlots }) => {
    const pending = getPendingTurn(match, username);
    const queuedKeys = new Set(Object.keys(pending.queuedByActorSlot || {}));
    const normalized = Array.isArray(actorSlots)
        ? actorSlots
              .map((slot) => Number.parseInt(slot, 10))
              .filter((slot) => Number.isInteger(slot) && slot >= 0)
        : [];
    const unique = [];
    normalized.forEach((slot) => {
        const key = String(slot);
        if (!queuedKeys.has(key)) return;
        if (unique.includes(slot)) return;
        unique.push(slot);
    });
    Object.keys(pending.queuedByActorSlot || {}).forEach((slotKey) => {
        const slot = Number.parseInt(slotKey, 10);
        if (!Number.isInteger(slot)) return;
        if (!unique.includes(slot)) {
            unique.push(slot);
        }
    });
    pending.queueOrder = unique;
    match.pendingTurns[username] = pending;
};

const adjustRandomAssignment = ({ match, username, chakraType, delta }) => {
    if (!chakraTypes.includes(chakraType)) {
        throw new Error('Invalid chakra type.');
    }
    if (delta !== 1 && delta !== -1) {
        throw new Error('Invalid delta.');
    }
    const pool = match.chakraPools?.[username];
    const pending = getPendingTurn(match, username);
    if (!pool) {
        throw new Error('Chakra pool unavailable.');
    }
    if (delta === 1) {
        if (pending.unresolvedRandom <= 0) {
            throw new Error('No unresolved random chakra.');
        }
        if ((pool[chakraType] || 0) <= 0) {
            throw new Error('Not enough chakra.');
        }
        pool[chakraType] -= 1;
        pending.randomAssignments[chakraType] = (pending.randomAssignments[chakraType] || 0) + 1;
        pending.unresolvedRandom -= 1;
    } else {
        if ((pending.randomAssignments[chakraType] || 0) <= 0) {
            throw new Error('No assigned chakra to remove.');
        }
        pending.randomAssignments[chakraType] -= 1;
        pool[chakraType] = (pool[chakraType] || 0) + 1;
        pending.unresolvedRandom += 1;
    }
    match.chakraPools[username] = pool;
    match.pendingTurns[username] = pending;
};

const hasQueuedSkills = (pending = {}) =>
    Boolean(pending?.queuedByActorSlot && Object.keys(pending.queuedByActorSlot).length > 0);

const exchangeChakra = ({ match, username, chakraType, cost = 4, spendAssignments = null }) => {
    if (!chakraTypes.includes(chakraType)) {
        throw new Error('Invalid chakra type.');
    }
    const pool = match.chakraPools?.[username];
    if (!pool) {
        throw new Error('Chakra pool unavailable.');
    }
    const exchangeCost = Math.max(1, Number(cost) || 4);
    if (getTotalChakra(pool) < exchangeCost) {
        throw new Error(`Need at least ${exchangeCost} chakra to exchange.`);
    }

    let normalizedAssignments = null;
    if (spendAssignments && typeof spendAssignments === 'object') {
        normalizedAssignments = createEmptyChakraPool();
        chakraTypes.forEach((type) => {
            const value = Number.parseInt(spendAssignments[type], 10);
            normalizedAssignments[type] = Math.max(0, Number.isFinite(value) ? value : 0);
        });
        const assignedTotal = chakraTypes.reduce(
            (sum, type) => sum + (normalizedAssignments[type] || 0),
            0
        );
        if (assignedTotal !== exchangeCost) {
            throw new Error(`Assign exactly ${exchangeCost} chakra.`);
        }
        const exceeds = chakraTypes.some(
            (type) => (normalizedAssignments[type] || 0) > (Number(pool[type]) || 0)
        );
        if (exceeds) {
            throw new Error('Assigned chakra exceeds available pool.');
        }
    }

    const actualSpendAssignments = createEmptyChakraPool();
    if (normalizedAssignments) {
        chakraTypes.forEach((type) => {
            actualSpendAssignments[type] = normalizedAssignments[type] || 0;
            pool[type] = Math.max(0, (Number(pool[type]) || 0) - (normalizedAssignments[type] || 0));
        });
    } else {
        let remaining = exchangeCost;
        chakraTypes.forEach((type) => {
            if (remaining <= 0) return;
            const available = Math.max(0, Number(pool[type]) || 0);
            const toSpend = Math.min(available, remaining);
            pool[type] = available - toSpend;
            actualSpendAssignments[type] = toSpend;
            remaining -= toSpend;
        });
        if (remaining > 0) {
            throw new Error('Unable to exchange chakra.');
        }
    }
    pool[chakraType] = (Number(pool[chakraType]) || 0) + 1;
    match.chakraPools[username] = pool;
    const pending = getPendingTurn(match, username);
    pending.chakraExchanges = Array.isArray(pending.chakraExchanges) ? pending.chakraExchanges : [];
    pending.chakraExchanges.push({
        gainType: chakraType,
        spendAssignments: actualSpendAssignments,
    });
    match.pendingTurns[username] = pending;
};

const resetPendingChakraExchanges = ({ match, username }) => {
    const pool = match?.chakraPools?.[username];
    const pending = getPendingTurn(match, username);
    const exchanges = Array.isArray(pending.chakraExchanges) ? pending.chakraExchanges : [];
    if (!pool || !exchanges.length || hasQueuedSkills(pending)) {
        return false;
    }
    exchanges.slice().reverse().forEach((exchange) => {
        const gainType = typeof exchange?.gainType === 'string' ? exchange.gainType.trim().toLowerCase() : '';
        if (chakraTypes.includes(gainType)) {
            pool[gainType] = Math.max(0, (Number(pool[gainType]) || 0) - 1);
        }
        const spendAssignments =
            exchange?.spendAssignments && typeof exchange.spendAssignments === 'object'
                ? exchange.spendAssignments
                : {};
        chakraTypes.forEach((type) => {
            pool[type] = (Number(pool[type]) || 0) + (Number(spendAssignments[type]) || 0);
        });
    });
    pending.chakraExchanges = [];
    match.chakraPools[username] = pool;
    match.pendingTurns[username] = pending;
    return true;
};

const ensureBoardState = async (match) => {
    if (!match) return match;
    let changed = false;
    const players = Array.isArray(match.players) ? match.players : [];
    if (!match.board) {
        match.board = battleLogic.buildInitialBoard(players);
        changed = true;
    }
    // Backfill aliveCount and board entries
    players.forEach((player) => {
        if (!Number.isInteger(player.aliveCount)) {
            player.aliveCount = Array.isArray(player.team) ? player.team.length : 0;
            changed = true;
        }
        if (!match.board[player.username]) {
            match.board[player.username] = battleLogic.buildInitialBoard([player])[player.username];
            changed = true;
        }
        const units = Array.isArray(match.board[player.username]) ? match.board[player.username] : [];
        let aliveCount = 0;
        units.forEach((unit, slot) => {
            if (!unit || typeof unit !== 'object') return;
            if (!Number.isInteger(unit.slot)) {
                unit.slot = slot;
                changed = true;
            }
            const numericHp = Number(unit.hp);
            if (!Number.isFinite(numericHp)) {
                unit.hp = battleLogic.DEFAULT_HP;
                changed = true;
            } else if (unit.hp !== numericHp) {
                unit.hp = numericHp;
                changed = true;
            }
            if (unit.hp <= 0) {
                if (unit.alive !== false) {
                    unit.alive = false;
                    changed = true;
                }
            } else if (unit.alive === false) {
                // Preserve explicit dead state only when hp is zero.
                unit.alive = true;
                changed = true;
            }
            const state = battleLogic.getUnitState(match, player.username, slot);
            if (!state || !Array.isArray(state.statuses) || typeof state.cooldowns !== 'object') {
                changed = true;
            }
            if (unit.alive !== false) {
                aliveCount += 1;
            }
        });
        if (player.aliveCount !== aliveCount) {
            player.aliveCount = aliveCount;
            changed = true;
        }
    });
    if (changed) {
        await updateMatchActive(match.matchId,
            { $set: { board: match.board, players } }
        );
    }
    return match;
};

const finalizeTurn = async (match, username) => {
    if (!match || match.currentTurn !== username) return match;
    if (match.status === 'ended') return match;
    if (!match.board) {
        match.board = battleLogic.buildInitialBoard(match.players || []);
    }
    const econ = match.economy;
    const pools = match.chakraPools;
    match.pendingTurns = match.pendingTurns || {};
    const blockedActorGainCount = getTeamStatusFlagCount(match, username, 'preventNextTurnChakraGain');
    battleLogic.resolvePendingTurnSkills({
        match,
        actingUsername: username,
        characters: charactersData,
    });
    battleLogic.tickStatusesForTurnEnd({
        match,
        endingUsername: username,
    });
    battleLogic.tickCooldownsForTurnEnd({
        match,
        endingUsername: username,
    });
    (match.players || []).forEach((player) => {
        const units = Array.isArray(match.board?.[player.username]) ? match.board[player.username] : [];
        player.aliveCount = units.reduce((sum, unit) => {
            if (!unit || typeof unit !== 'object') return sum;
            if ((Number(unit.hp) || 0) <= 0) {
                unit.alive = false;
            }
            return sum + (unit.alive === false ? 0 : 1);
        }, 0);
    });

    const alivePlayers = (match.players || []).filter(
        (player) => (Number(player?.aliveCount) || 0) > 0
    );
    if (alivePlayers.length <= 1) {
        const winner = alivePlayers.length === 1 ? alivePlayers[0].username : null;
        match.status = 'ended';
        match.winner = winner;
        match.surrenderedBy = null;
        match.endReason = 'elimination';
        match.endedAt = new Date();
        match.currentTurn = null;
        match.turnStartedAt = null;
        match.turnExpiresAt = null;
        match.ladderResults = await applyMatchCompletionRewards(
            match,
            match.winner,
            match.endedAt
        );
        await updateMatchActive(match.matchId,
            {
                $set: {
                    mode: match.mode || 'quick',
                    status: match.status,
                    winner: match.winner,
                    surrenderedBy: match.surrenderedBy,
                    endReason: match.endReason,
                    endedAt: match.endedAt,
                    currentTurn: match.currentTurn,
                    turnStartedAt: match.turnStartedAt,
                    turnExpiresAt: match.turnExpiresAt,
                    board: match.board,
                    players: match.players,
                    chakraPools: match.chakraPools,
                    economy: match.economy,
                    pendingTurns: match.pendingTurns,
                    ladderResults: match.ladderResults || null,
                    missionResults: match.missionResults || null,
                    storyResults: match.storyResults || null,
                    gauntletResults: match.gauntletResults || null,
                },
            }
        );
        quickMatches.delete(match.matchId);
        (match.players || []).forEach((player) => userToMatch.delete(player.username));
        return match;
    }

    econ.turnCounts[username] = econ.turnCounts[username] || 0;
    const aliveCount = Math.max(1, getAliveCountForUser(match, username));
    const additionalTurnGains = getTeamStatusMetadataSum(
        match,
        username,
        'additionalRandomChakraPerTurn'
    );
    const effectiveGainCount = Math.max(0, aliveCount - blockedActorGainCount);
    const turnGains = generateRandomChakra(effectiveGainCount + additionalTurnGains, pools[username]);
    pools[username] = applyChakraGain(pools[username], turnGains);
    econ.lastChakraGain[username] = turnGains;

    econ.turnCounts[username] += 1;

    const opponentEntry = match.players.find((p) => p.username !== username);
    const opponent = opponentEntry ? opponentEntry.username : username;
    const nextTurn = opponent;
    match.currentTurn = nextTurn;

    econ.turnCounts[nextTurn] = econ.turnCounts[nextTurn] || 0;
    if (!econ.startGranted[nextTurn] && econ.turnCounts[nextTurn] === 0) {
        const aliveCount = Math.max(1, getAliveCountForUser(match, nextTurn));
        const additionalStartGains = getTeamStatusMetadataSum(
            match,
            nextTurn,
            'additionalRandomChakraPerTurn'
        );
        const blockedNextStartCount = getTeamStatusFlagCount(
            match,
            nextTurn,
            'preventNextTurnChakraGain'
        );
        const effectiveStartGainCount = Math.max(0, aliveCount - blockedNextStartCount);
        const startGains = generateRandomChakra(effectiveStartGainCount + additionalStartGains, pools[nextTurn]);
        pools[nextTurn] = applyChakraGain(pools[nextTurn], startGains);
        econ.startGranted[nextTurn] = true;
        econ.lastChakraGain[nextTurn] = startGains;
    }

    battleLogic.queueTurnStartChoicePrompts({
        match,
        startingUsername: nextTurn,
    });

    match.turnStartedAt = new Date();
    match.turnExpiresAt = new Date(Date.now() + getTurnDurationMsForUser(match, nextTurn));
    match.pendingTurns[username] = makeEmptyPendingTurn();

    await updateMatchActive(match.matchId,
        {
            $set: {
                currentTurn: match.currentTurn,
                board: match.board,
                players: match.players,
                chakraPools: pools,
                economy: econ,
                pendingTurns: match.pendingTurns,
                turnStartedAt: match.turnStartedAt,
                turnExpiresAt: match.turnExpiresAt,
            },
        }
    );

    if (quickMatches.has(match.matchId)) {
        quickMatches.set(match.matchId, {
            ...(quickMatches.get(match.matchId) || {}),
            currentTurn: match.currentTurn,
            board: match.board,
            players: match.players,
            chakraPools: pools,
            economy: econ,
            pendingTurns: match.pendingTurns,
            turnStartedAt: match.turnStartedAt,
            turnExpiresAt: match.turnExpiresAt,
        });
    }

    return match;
};

const autoAdvanceTurnIfExpired = async (match) => {
    if (!match || !match.turnExpiresAt) return match;
    const pendingTurnChoice = getPendingTurn(match, match?.currentTurn || '');
    if (hasPendingTurnStartChoice(pendingTurnChoice)) {
        return match;
    }
    await ensureBoardState(match);
    const expiry =
        match.turnExpiresAt instanceof Date
            ? match.turnExpiresAt.getTime()
            : new Date(match.turnExpiresAt).getTime();
    if (Number.isNaN(expiry)) return match;
    if (Date.now() <= expiry) return match;
    return finalizeTurn(match, match.currentTurn);
};

async function ensureEarlyAccessNewsPost() {
    try {
        if (!newsPostsCollection) return;
        const count = await newsPostsCollection.countDocuments();
        if (count === 0) {
            await newsPostsCollection.insertOne({
                title: 'Welcome to Naruto-Arena Early Access Weekend!',
                content: `Welcome Shinobi! Early Access Weekend is officially live.\n\n` +
                    `### What's New & Ready to Play:\n` +
                    `- **Quick & Ladder Battles**: Queue against active players or automated battle bots.\n` +
                    `- **Chunin Exams (PvE Gauntlet)**: Draft relics, manage chakra scrolls, and battle through exam stages.\n` +
                    `- **Story Missions**: Complete classic saga encounters and unlock mission-exclusive characters.\n` +
                    `- **Mobile Optimization**: Complete viewport fit, pinch-zoom support, and touch UI polish.\n` +
                    `- **In-Game Surrender & Active Match Resume**: Never get stranded; resume your active match if disconnected.\n\n` +
                    `Found a bug or issue? Click **🐛 Report Bug** on any screen!`,
                author: 'Naruto-Arena Team',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log('Seeded Early Access Welcome news announcement.');
        }
    } catch (err) {
        console.warn('Failed to seed Early Access news post:', err.message);
    }
}

async function initDb() {
    if (!DEFAULT_URI) {
        throw new Error('MONGODB_URI is required. Set it in your environment before starting the server.');
    }
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is required. Set it in your environment before starting the server.');
    }
    mongoClient = new MongoClient(DEFAULT_URI);
    await mongoClient.connect();
    const db = mongoClient.db(DATABASE_NAME);
    usersCollection = db.collection(USERS_COLLECTION);
    matchesCollection = db.collection(MATCHES_COLLECTION);
    appStateCollection = db.collection(APP_STATE_COLLECTION);
    newsPostsCollection = db.collection(NEWS_POSTS_COLLECTION);
    bugsCollection = db.collection(BUGS_COLLECTION);
    await usersCollection.createIndex({ username: 1 }, { unique: true });
    await usersCollection.createIndex({ usernameLower: 1 });
    await usersCollection.createIndex(
        { email: 1 },
        { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
    );
    await usersCollection.createIndex({ 'profile.ladder.ladderRank': 1 });
    await usersCollection.createIndex({ 'profile.ladder.wins': -1, 'profile.ladder.losses': 1 });
    await usersCollection.createIndex({ createdAt: -1 });
    await matchesCollection.createIndex({ matchId: 1 }, { unique: true });
    await matchesCollection.createIndex({ status: 1, createdAt: -1 });
    await matchesCollection.createIndex({ mode: 1, status: 1, createdAt: -1 });
    await matchesCollection.createIndex({ 'players.username': 1, status: 1 });
    await matchesCollection.createIndex({ mode: 1, createdAt: -1 });
    await appStateCollection.createIndex({ key: 1 }, { unique: true });
    await newsPostsCollection.createIndex({ createdAt: -1 });
    await bugsCollection.createIndex({ createdAt: -1 });
    await bugsCollection.createIndex({ status: 1 });
    charactersData = await getStoredCharacters();
    characterCatalog = buildCharacterCatalog();
    await getStoredLadderRankTiers();
    await backfillUserProfiles();
    await ensureEarlyAccessNewsPost();
    console.log('Connected to MongoDB.');

    // Initialize routers after DB is ready
    const authRouter = require('./routes/auth.js')({
        loginLimiter,
        registerLimiter,
        loginSchema,
        registerSchema,
        usersCollection,
        normalizeUserProfile,
        buildDefaultUserProfile,
        signSession,
        setSessionCookie,
        clearSessionCookie,
        serializeUserForClient,
        sessionUserCache,
        SESSION_COOKIE_NAME
    });
    app.use('/api', authRouter);

    const bugsRouter = require('./routes/bugs.js')({
        bugsCollection,
        optionalSession: typeof optionalSession === 'function' ? optionalSession : (req, res, next) => next(),
    });
    app.use('/api/bugs', bugsRouter);

    const adminRouter = require('./routes/admin.js')({
        requireSession,
        appStateCollection,
        usersCollection,
        bugsCollection,
        charactersData,
        latestReleasesUpdateSchema,
        maintenanceModeUpdateSchema,
        matchesCollection,
        teamSchema,
        userToMatch,
        insertMatchActive: typeof insertMatchActive !== 'undefined' ? insertMatchActive : undefined,
        serializeNewsPost,
        newsPostsCollection,
        normalizeUserProfile,
        assertTeamCanBeUsed,
        removeQueuedEntry,
        buildTrainingDummyMatch,
        buildMatchPayloadForUser,
        getTurnDurationMsForUser,
        makeEmptyPendingTurn,
        TRAINING_DUMMY_DISPLAY_NAME
    });
    app.use('/api/admin', adminRouter);
}

app.get(['/health', '/api/health'], (req, res) => {
    const isDbConnected = Boolean(mongoClient && mongoClient.topology && mongoClient.topology.isConnected());
    const activeMatchesCount = typeof activeMatches !== 'undefined' && activeMatches instanceof Map ? activeMatches.size : 0;
    const isHealthy = isDbConnected || process.env.NODE_ENV === 'test';
    return res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'ok' : 'degraded',
        uptime: Math.floor(process.uptime()),
        dbConnected: isDbConnected,
        activeMatches: activeMatchesCount,
        timestamp: new Date().toISOString(),
    });
});

app.get('/api/latest-releases', async (req, res) => {
    const releases = await getLatestCharacterReleases();
    return res.json({
        ok: true,
        releases,
    });
});





app.post('/api/characters/faces', requireSession, async (req, res) => {
    const lookupSchema = Joi.object({
        characterIds: Joi.array().items(Joi.string().trim().min(1).max(128)).max(3).required(),
    });
    const { error: validationError, value } = lookupSchema.validate(req.body || {});
    if (validationError) {
        return res.status(400).json({ error: 'characterIds are required.' });
    }

    const faceMap = buildCharacterFaceMap();

    return res.json({
        ok: true,
        faces: value.characterIds.map((characterId) => ({
            characterId,
            facePicture: faceMap.get(characterId) || '',
        })),
    });
});

const loginSchema = Joi.object({
    username: Joi.string().min(3).max(64).required(),
    password: Joi.string().min(8).max(128).required(),
});

const registerSchema = Joi.object({
    username: Joi.string().trim().min(3).max(64).required(),
    password: Joi.string().min(8).max(128).required(),
    confirmPassword: Joi.string().required(),
    email: Joi.string().trim().lowercase().email().max(254).required(),
});

const teamSchema = Joi.array()
    .items(Joi.number().integer().min(0))
    .length(3)
    .custom((team, helpers) =>
        teamHasDuplicateCharacters(team) ? helpers.error('array.unique') : team
    )
    .messages({
        'array.unique': 'Team characters must be unique.',
    });

const matchJoinSchema = Joi.object({
    team: teamSchema.required(),
    mode: Joi.string().valid('quick', 'ladder', 'private').default('quick'),
    targetUsername: Joi.string().trim().min(1).max(64).allow('').optional(),
});

const storyStartSchema = Joi.object({
    nodeId: Joi.string().trim().min(1).max(128).required(),
    difficulty: Joi.string().valid('normal', 'hard').default('normal'),
    team: teamSchema.optional(),
});

const gauntletRunStartSchema = Joi.object({
    team: teamSchema.optional(),
    seed: Joi.string().trim().min(1).max(128).optional(),
    startingScrollType: Joi.string().valid('heaven', 'earth').default('heaven'),
});

const gauntletNodeEnterSchema = Joi.object({
    nodeId: Joi.string().trim().min(1).max(32).required(),
    choiceIndex: Joi.number().integer().min(0).max(8).optional(),
});

const gauntletActOneChoiceSchema = Joi.object({
    choiceIndex: Joi.number().integer().min(0).max(8).required(),
});

const gauntletMerchantBuySchema = Joi.object({
    itemType: Joi.string().valid('heaven_scroll', 'earth_scroll', 'heal', 'random_relic').required(),
});

const gauntletForgeScrollSchema = Joi.object({
    scrollType: Joi.string().valid('heaven', 'earth').required(),
});

const gauntletOfferAcceptSchema = Joi.object({
    offerType: Joi.string().valid('curse').required(),
    offerId: Joi.string().trim().min(1).max(128).required(),
});

const publicProfileLookupSchema = Joi.object({
    username: Joi.string().trim().min(1).max(64).required(),
});

const activityUpdateSchema = Joi.object({
    currentPage: Joi.string().trim().max(120).allow('').required(),
});

const latestReleasesUpdateSchema = Joi.object({
    releases: Joi.array()
        .length(3)
        .items(
            Joi.object({
                characterId: Joi.string().trim().max(128).allow('').required(),
            }).required()
        )
        .required(),
});

const maintenanceModeUpdateSchema = Joi.object({
    enabled: Joi.boolean().required(),
});

const avatarUpdateSchema = Joi.object({
    avatarUrl: Joi.string().trim().uri({ scheme: ['http', 'https'] }).max(2048).required(),
});

const backgroundUpdateSchema = Joi.object({
    selectionUrl: Joi.string().trim().allow('').uri({ scheme: ['http', 'https'] }).max(2048).required(),
    ingameUrl: Joi.string().trim().allow('').uri({ scheme: ['http', 'https'] }).max(2048).required(),
});

const matchmakingSettingsSchema = Joi.object({
    battleBotEnabled: Joi.boolean().required(),
});

const clanCreateSchema = Joi.object({
    name: Joi.string().trim().min(3).max(35).required(),
    abbreviation: Joi.string().trim().min(2).max(4).required(),
    bio: Joi.string().allow('').max(1000).required(),
});

const clanUpdateSchema = Joi.object({
    name: Joi.string().trim().min(3).max(35).required(),
    abbreviation: Joi.string().trim().min(2).max(4).required(),
    bio: Joi.string().allow('').max(1000).required(),
});

const clanInviteSchema = Joi.object({
    username: Joi.string().trim().min(3).max(64).required(),
});

const clanRankNamesSchema = Joi.object({
    rankKey: Joi.string()
        .valid('clanLeader', 'leader', 'captain', 'lieutenant', 'member', 'trial')
        .required(),
    name: Joi.string().trim().min(1).max(40).required(),
    previousName: Joi.string().trim().allow('').max(40).required(),
});

const clanRankDeleteSchema = Joi.object({
    rankKey: Joi.string()
        .valid('clanLeader', 'leader', 'captain', 'lieutenant', 'member', 'trial')
        .required(),
    name: Joi.string().trim().min(1).max(40).required(),
});

const clanMemberRankSchema = Joi.object({
    username: Joi.string().trim().min(1).max(64).required(),
    rankKey: Joi.string()
        .valid('clanLeader', 'leader', 'captain', 'lieutenant', 'member', 'trial')
        .required(),
    customRankName: Joi.string().allow('').max(40).required(),
});




// Save preferred team
app.post('/api/team/save', requireSession, async (req, res) => {
    const { error: validationError, value } = teamSchema.validate(req.body?.team);
    if (validationError) {
        return res.status(400).json({ error: 'Invalid team selection.' });
    }
    const user = await usersCollection.findOne({ username: req.authUser.username });
    if (!user) {
        return res.status(404).json({ error: 'User not found.' });
    }
    const profile = normalizeUserProfile(user);
    try {
        await assertTeamCanBeUsed(profile, value, user.role);
    } catch (error) {
        return res.status(403).json({ error: error.message || 'Character is locked.' });
    }
    await usersCollection.updateOne(
        { _id: user._id },
        {
            $set: {
                savedTeamIndices: value,
                profile,
            },
        }
    );
    return res.json({ ok: true });
});

// Quick matchmaking endpoints (demo/in-memory)
    app.post('/api/match/join', requireSession, async (req, res) => {
    try {
        const username = req.authUser.username;
        const { error: validationError, value } = matchJoinSchema.validate(req.body || {});
        if (validationError) {
            return res.status(400).json({ error: 'Team selection required to join match.' });
        }
        const team = value.team;
        const mode = value.mode;
        const targetUsername = typeof value.targetUsername === 'string' ? value.targetUsername.trim() : '';
        if (mode === 'private') {
            if (!targetUsername) {
                return res.status(400).json({ error: 'Opponent username is required for a private game.' });
            }
            if (targetUsername.toLowerCase() === username.toLowerCase()) {
                return res.status(400).json({ error: 'You cannot start a private game with yourself.' });
            }
        }

        // Already matched
        if (userToMatch.has(username)) {
            const { matchId, opponent } = userToMatch.get(username);
            const existing = await getMatchActive(matchId);
            if (!existing || existing.status === 'ended') {
                userToMatch.delete(username);
            } else {
            const hydratedTurn = await ensureMatchTurnData(existing);
            const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
            const hydratedPending = await ensurePendingTurnState(hydratedEcon);
            const hydrated = await autoAdvanceTurnIfExpired(hydratedPending);
            if (!hydrated || hydrated.status === 'ended') {
                userToMatch.delete(username);
            } else {
            scheduleBattleBotTurn(hydrated);
            const safePayload = buildMatchPayloadForUser(hydrated, username);
            return res.json({
                ok: true,
                matchFound: true,
                matchId,
                mode: existing.mode || 'quick',
                opponent,
                matchStartsAt: existing.matchStartsAt || existing.createdAt || null,
                matchReady:
                    !existing.matchStartsAt ||
                    new Date(existing.matchStartsAt).getTime() <= Date.now(),
                currentTurn: hydrated?.currentTurn || null,
                turnOrder: hydrated?.turnOrder || null,
                turnExpiresAt: hydrated?.turnExpiresAt || null,
                turnDurationMs: getTurnDurationMsForUser(hydrated, hydrated?.currentTurn),
                chakraPools: safePayload?.chakraPools || null,
                lastChakraGain: safePayload?.lastChakraGain || null,
                pendingTurn: safePayload?.pendingTurn || makeEmptyPendingTurn(),
            });
            }
            }
        }

        // If already stored in DB from earlier pairing, surface it
        const existingMatch = await matchesCollection.findOne({
            'players.username': username,
            status: { $ne: 'ended' },
        });
        if (existingMatch) {
            const hydratedTurn = await ensureMatchTurnData(existingMatch);
            const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
            const hydratedPending = await ensurePendingTurnState(hydratedEcon);
            const hydrated = await autoAdvanceTurnIfExpired(hydratedPending);
            if (!hydrated || hydrated.status === 'ended') {
                return res.json({ ok: true, matchFound: false });
            }
            const opponentEntry = hydrated.players.find((p) => p.username !== username);
            const opponent = opponentEntry ? getPlayerDisplayName(opponentEntry) : null;
            userToMatch.set(username, { matchId: hydrated.matchId, opponent });
            scheduleBattleBotTurn(hydrated);
            const safePayload = buildMatchPayloadForUser(hydrated, username);
            return res.json({
                ok: true,
                matchFound: true,
                matchId: hydrated.matchId,
                mode: hydrated.mode || 'quick',
                opponent,
                matchStartsAt: hydrated.matchStartsAt || hydrated.createdAt || null,
                matchReady:
                    !hydrated.matchStartsAt ||
                    new Date(hydrated.matchStartsAt).getTime() <= Date.now(),
                currentTurn: hydrated.currentTurn || null,
                turnOrder: hydrated.turnOrder || null,
                turnExpiresAt: hydrated.turnExpiresAt || null,
                turnDurationMs: getTurnDurationMsForUser(hydrated, hydrated?.currentTurn),
                chakraPools: safePayload?.chakraPools || null,
                lastChakraGain: safePayload?.lastChakraGain || null,
                pendingTurn: safePayload?.pendingTurn || makeEmptyPendingTurn(),
            });
        }

        const user = await usersCollection.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const profile = normalizeUserProfile(user);
        try {
            await assertTeamCanBeUsed(profile, team, user.role);
        } catch (error) {
            return res.status(403).json({ error: error.message || 'Character is locked.' });
        }

        // Try to pair with waiting opponent
        const opponent = mode === 'private'
            ? dequeuePrivateOpponent(username, targetUsername)
            : dequeueOpponent(username, mode);
        if (opponent) {
            const aliveLookup = {
                [username]: Array.isArray(team) ? team.length : 3,
                [opponent.username]: Array.isArray(opponent.team) ? opponent.team.length : 3,
            };
            const {
                matchId,
                matchStartsAt,
                turnOrder,
                currentTurn,
                chakraPools,
                economy,
                pendingTurns,
                turnExpiresAt,
            } =
                buildMatch([username, opponent.username], aliveLookup);
            const playerDocs = [
                { username, team, aliveCount: aliveLookup[username] },
                { username: opponent.username, team: opponent.team, aliveCount: aliveLookup[opponent.username] },
            ];
            const board = battleLogic.buildInitialBoard(playerDocs);
            await insertMatchActive({
                matchId,
                mode,
                status: 'active',
                createdAt: new Date(),
                matchStartsAt,
                chakraPools,
                economy,
                pendingTurns,
                currentTurn,
                turnOrder,
                turnExpiresAt,
                board,
                players: playerDocs,
            });
            const createdMatch = {
                matchId,
                mode,
                status: 'active',
                createdAt: new Date(),
                matchStartsAt,
                chakraPools,
                economy,
                pendingTurns,
                currentTurn,
                turnOrder,
                turnExpiresAt,
                board,
                players: playerDocs,
            };
            scheduleBattleBotTurn(createdMatch);
            const opponentName = opponent.username;
            return res.json({
                ok: true,
                matchFound: true,
                matchId,
                mode,
                opponent: opponentName,
                matchStartsAt,
                matchReady: new Date(matchStartsAt).getTime() <= Date.now(),
                currentTurn,
                turnOrder,
                turnExpiresAt,
                turnDurationMs: getTurnDurationMsForUser({ players: playerDocs, board }, currentTurn),
                pendingTurn: makeEmptyPendingTurn(),
            });
        }

        const queuedBotMatch = await maybeCreateBattleBotMatch({
            username,
            mode,
            userProfile: profile,
        });
        if (queuedBotMatch) {
            scheduleBattleBotTurn(queuedBotMatch);
            const safePayload = buildMatchPayloadForUser(queuedBotMatch, username);
            return res.json({
                ok: true,
                matchFound: true,
                matchId: queuedBotMatch.matchId,
                mode: queuedBotMatch.mode || mode,
                opponent: GAME_BOT_DISPLAY_NAME,
                matchStartsAt: queuedBotMatch.matchStartsAt || queuedBotMatch.createdAt || null,
                matchReady:
                    !queuedBotMatch.matchStartsAt ||
                    new Date(queuedBotMatch.matchStartsAt).getTime() <= Date.now(),
                currentTurn: queuedBotMatch.currentTurn || null,
                turnOrder: queuedBotMatch.turnOrder || null,
                turnExpiresAt: queuedBotMatch.turnExpiresAt || null,
                turnDurationMs: getTurnDurationMsForUser(queuedBotMatch, queuedBotMatch?.currentTurn),
                chakraPools: safePayload?.chakraPools || null,
                lastChakraGain: safePayload?.lastChakraGain || null,
                pendingTurn: safePayload?.pendingTurn || makeEmptyPendingTurn(),
            });
        }

        // Otherwise enqueue
        enqueuePlayer({
            username,
            team,
            mode,
            targetUsername,
            queuedAt: new Date(),
            allowBattleBot: Boolean(profile.matchmaking?.battleBotEnabled),
            ladderLevel: Number(profile.ladder?.level) || 1,
        });
        scheduleBattleBotQueueCheck({
            username,
            mode,
            userProfile: profile,
        });
        return res.json({ ok: true, queued: true, mode });
    } catch (error) {
        console.error('Matchmaking error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});


app.post('/api/story/start', requireSession, async (req, res) => {
    try {
        const username = req.authUser.username;
        const { error: validationError, value } = storyStartSchema.validate(req.body || {});
        if (validationError) {
            return res.status(400).json({ error: 'A story battle is required.' });
        }
        const { nodeId, difficulty } = value;
        const isHardMode = difficulty === 'hard';

        if (userToMatch.has(username)) {
            return res.status(409).json({ error: 'You are already in a match.' });
        }
        const existingMatch = await matchesCollection.findOne({
            'players.username': username,
            status: { $ne: 'ended' },
        });
        if (existingMatch) {
            return res.status(409).json({ error: 'You are already in a match.' });
        }

        const user = await usersCollection.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const profile = normalizeUserProfile(user);

        const storyCatalog = await getStoredStoryCatalog();
        const found = findStoryNode(storyCatalog, nodeId);
        if (!found) {
            return res.status(404).json({ error: 'Story battle not found.' });
        }
        const userLevel = Number(profile?.ladder?.level) || 1;
        if (found.node.level_requirement > 0 && userLevel < found.node.level_requirement) {
            return res.status(403).json({ error: 'You are not a high enough level for this battle yet.' });
        }
        if (found.node.requiresPreviousNode !== false) {
            const previous = getPreviousStoryNode(storyCatalog, found.node.nodeId);
            if (previous?.node?.nodeId) {
                const storyState = normalizeStoryState(profile.story);
                const previousProgress = storyState.progressByNodeId[previous.node.nodeId];
                if (!previousProgress?.completedAt) {
                    return res.status(403).json({
                        error: `Clear "${previous.node.title}" before starting this battle.`,
                    });
                }
            }
        }
        const storyState = normalizeStoryState(profile.story);
        if (isHardMode && !storyState.progressByNodeId[found.node.nodeId]?.completedAt) {
            return res.status(403).json({ error: 'Clear this story battle before starting Hard Mode.' });
        }

        const normalTeam = resolveRosterIndicesForCharacterIds(found.node.playerTeam);
        if (normalTeam.length !== found.node.playerTeam.length) {
            console.error(`Story node ${nodeId} has an invalid playerTeam entry.`);
            return res.status(500).json({ error: 'This story battle is misconfigured.' });
        }
        const hardTeam = Array.isArray(value.team) ? value.team : Array.isArray(user.savedTeamIndices) ? user.savedTeamIndices : [];
        const team = isHardMode ? hardTeam : normalTeam;
        if (isHardMode) {
            const { error: hardTeamError } = teamSchema.validate(team);
            if (hardTeamError) {
                return res.status(400).json({ error: 'Save a full selected team before starting Hard Mode.' });
            }
            try {
                await assertTeamCanBeUsed(profile, team, user.role);
            } catch (error) {
                return res.status(403).json({ error: error.message || 'Your saved team contains a locked character.' });
            }
        }

        const matchDocument = await buildStoryBattleBotMatch({
            username,
            team,
            chapter: found.chapter,
            node: found.node,
            difficulty,
        });
        const opponentDisplayName = isHardMode ? `${found.node.enemyDisplayName} (Hard)` : found.node.enemyDisplayName;
        userToMatch.set(username, { matchId: matchDocument.matchId, opponent: opponentDisplayName });
        scheduleBattleBotTurn(matchDocument);
        const safePayload = buildMatchPayloadForUser(matchDocument, username);
        return res.json({
            ok: true,
            matchFound: true,
            matchId: matchDocument.matchId,
            mode: 'story',
            opponent: opponentDisplayName,
            matchStartsAt: matchDocument.matchStartsAt,
            matchReady: new Date(matchDocument.matchStartsAt).getTime() <= Date.now(),
            currentTurn: matchDocument.currentTurn || null,
            turnOrder: matchDocument.turnOrder || null,
            turnExpiresAt: matchDocument.turnExpiresAt || null,
            turnDurationMs: getTurnDurationMsForUser(matchDocument, matchDocument?.currentTurn),
            chakraPools: safePayload?.chakraPools || null,
            lastChakraGain: safePayload?.lastChakraGain || null,
            pendingTurn: safePayload?.pendingTurn || makeEmptyPendingTurn(),
        });
    } catch (error) {
        console.error('Story match start error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

app.get('/api/match/status', requireSession, async (req, res) => {
    try {
        const username = req.authUser.username;
        const user = await usersCollection.findOne(
            { username },
            { projection: { _id: 1, username: 1, createdAt: 1, profile: 1 } }
        );
        const normalizedProfile = user ? normalizeUserProfile(user) : null;
        const mapping = userToMatch.get(username);
        if (mapping) {
            const match = await getMatchActive(mapping.matchId);
            if (!match || match.status === 'ended') {
                userToMatch.delete(username);
                return res.json({ ok: true, matchFound: false });
            }
            const hydratedTurn = await ensureMatchTurnData(match);
            const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
            const hydratedPending = await ensurePendingTurnState(hydratedEcon);
            const hydratedBoard = await ensureBoardState(hydratedPending);
            const hydrated = await autoAdvanceTurnIfExpired(hydratedBoard);
            if (!hydrated || hydrated.status === 'ended') {
                userToMatch.delete(username);
                return res.json({ ok: true, matchFound: false });
            }
            scheduleBattleBotTurn(hydrated);
            const safePayload = buildMatchPayloadForUser(hydrated, username);
            return res.json({
                ok: true,
                matchFound: true,
                matchId: mapping.matchId,
                mode: hydrated.mode || 'quick',
                opponent: mapping.opponent,
                matchStartsAt: hydrated.matchStartsAt || hydrated.createdAt || null,
                matchReady:
                    !hydrated.matchStartsAt ||
                    new Date(hydrated.matchStartsAt).getTime() <= Date.now(),
                currentTurn: hydrated?.currentTurn || null,
                turnOrder: hydrated?.turnOrder || null,
                turnExpiresAt: hydrated?.turnExpiresAt || null,
                turnDurationMs: getTurnDurationMsForUser(hydrated, hydrated?.currentTurn),
                board: safePayload?.board || null,
                chakraPools: safePayload?.chakraPools || null,
                lastChakraGain: safePayload?.lastChakraGain || null,
                pendingTurn: safePayload?.pendingTurn || makeEmptyPendingTurn(),
            });
        }

        const queuedEntry = findQueuedEntry(username);
        const botMatch = await maybeCreateBattleBotMatch({
            username,
            mode: queuedEntry?.mode || 'quick',
            userProfile: normalizedProfile,
        });
        if (botMatch) {
            scheduleBattleBotTurn(botMatch);
            const safePayload = buildMatchPayloadForUser(botMatch, username);
            return res.json({
                ok: true,
                matchFound: true,
                matchId: botMatch.matchId,
                mode: botMatch.mode || 'quick',
                opponent: GAME_BOT_DISPLAY_NAME,
                matchStartsAt: botMatch.matchStartsAt || botMatch.createdAt || null,
                matchReady:
                    !botMatch.matchStartsAt ||
                    new Date(botMatch.matchStartsAt).getTime() <= Date.now(),
                currentTurn: botMatch.currentTurn || null,
                turnOrder: botMatch.turnOrder || null,
                turnExpiresAt: botMatch.turnExpiresAt || null,
                turnDurationMs: getTurnDurationMsForUser(botMatch, botMatch?.currentTurn),
                chakraPools: safePayload?.chakraPools || null,
                lastChakraGain: safePayload?.lastChakraGain || null,
                pendingTurn: safePayload?.pendingTurn || makeEmptyPendingTurn(),
            });
        }
        if (queuedEntry?.entry) {
            scheduleBattleBotQueueCheck({
                username,
                mode: queuedEntry.mode || 'quick',
                userProfile: normalizedProfile,
            });
        }

        // Fallback: lookup persisted match
        const match = await matchesCollection.findOne({
            'players.username': username,
            status: { $ne: 'ended' },
        });
        if (!match) {
            return res.json({ ok: true, matchFound: false });
        }
        const hydratedTurn = await ensureMatchTurnData(match);
        const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
        const hydratedPending = await ensurePendingTurnState(hydratedEcon);
        const hydratedBoard = await ensureBoardState(hydratedPending);
        const hydrated = await autoAdvanceTurnIfExpired(hydratedBoard);
        if (!hydrated || hydrated.status === 'ended') {
            return res.json({ ok: true, matchFound: false });
        }
        const opponentEntry = hydrated.players.find((p) => p.username !== username);
        const opponent = opponentEntry ? getPlayerDisplayName(opponentEntry) : null;
        userToMatch.set(username, { matchId: hydrated.matchId, opponent });
        scheduleBattleBotTurn(hydrated);
        const safePayload = buildMatchPayloadForUser(hydrated, username);
        return res.json({
            ok: true,
            matchFound: true,
            matchId: hydrated.matchId,
            mode: hydrated.mode || 'quick',
            opponent,
            matchStartsAt: hydrated.matchStartsAt || hydrated.createdAt || null,
            matchReady:
                !hydrated.matchStartsAt ||
                new Date(hydrated.matchStartsAt).getTime() <= Date.now(),
            currentTurn: hydrated.currentTurn || null,
            turnOrder: hydrated.turnOrder || null,
            turnExpiresAt: hydrated.turnExpiresAt || null,
            turnDurationMs: getTurnDurationMsForUser(hydrated, hydrated?.currentTurn),
            board: safePayload?.board || null,
            chakraPools: safePayload?.chakraPools || null,
            lastChakraGain: safePayload?.lastChakraGain || null,
            pendingTurn: safePayload?.pendingTurn || makeEmptyPendingTurn(),
        });
    } catch (error) {
        console.error('Match status error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

app.post('/api/match/cancel', requireSession, (req, res) => {
    const username = req.authUser.username;
    // If already matched, do not allow cancelling
    if (userToMatch.has(username)) {
        return res.json({ ok: false, message: 'Match already found.' });
    }
    removeQueuedEntry(username);
    // Do not remove from existing matches here; only queue
    return res.json({ ok: true, cancelled: true });
});

app.get('/api/match/:matchId', requireSession, async (req, res) => {
    const { matchId } = req.params;
    const match = await getMatchActive(matchId);
    const hydratedTurn = await ensureMatchTurnData(match);
    const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
    const hydratedPending = await ensurePendingTurnState(hydratedEcon);
    const hydratedBoard = await ensureBoardState(hydratedPending);
    const hydrated = await autoAdvanceTurnIfExpired(hydratedBoard);
    if (!hydrated) {
        return res.status(404).json({ error: 'Match not found.' });
    }
    const playerEntry = hydrated.players.find((p) => p.username === req.authUser.username);
    if (!playerEntry) {
        return res.status(403).json({ error: 'Not part of this match.' });
    }
    if (String(req.query?.resetPendingExchange || '') === '1') {
        const reset = resetPendingChakraExchanges({
            match: hydrated,
            username: req.authUser.username,
        });
        if (reset) {
            await persistMatchState(hydrated, {
                chakraPools: hydrated.chakraPools,
                pendingTurns: hydrated.pendingTurns,
            });
            await broadcastMatchState(hydrated);
        }
    }
    scheduleBattleBotTurn(hydrated);
    return res.json(buildMatchPayloadForUser(hydrated, req.authUser.username));
});

app.post('/api/match/:matchId/surrender', requireSession, async (req, res) => {
    const { matchId } = req.params;
    const match = await getMatchActive(matchId);
    if (!match) {
        return res.status(404).json({ error: 'Match not found.' });
    }
    const username = req.authUser.username;
    const playerEntry = match.players.find((p) => p.username === username);
    if (!playerEntry) {
        return res.status(403).json({ error: 'Not part of this match.' });
    }
    if (match.status === 'ended') {
        return res.json({
            ok: true,
            mode: match.mode || 'quick',
            status: 'ended',
            winner: match.winner || null,
            surrenderedBy: match.surrenderedBy || null,
            endReason: match.endReason || null,
            endedAt: match.endedAt || null,
            ladderResult: match.ladderResults?.[username] || null,
            missionResult: match.missionResults?.[username] || null,
            storyResult: match.storyResults?.[username] || null,
            gauntletResult: match.gauntletResults?.[username] || null,
        });
    }
    const opponentEntry = match.players.find((p) => p.username !== username);
    const endedAt = new Date();
    const ladderResults = await applyMatchCompletionRewards(
        match,
        opponentEntry ? opponentEntry.username : null,
        endedAt
    );
    await updateMatchActive(matchId,
        {
            $set: {
                mode: match.mode || 'quick',
                status: 'ended',
                winner: opponentEntry ? opponentEntry.username : null,
                surrenderedBy: username,
                endReason: 'surrender',
                endedAt,
                currentTurn: null,
                turnExpiresAt: null,
                ladderResults: ladderResults || null,
                missionResults: match.missionResults || null,
                storyResults: match.storyResults || null,
                gauntletResults: match.gauntletResults || null,
            },
        }
    );
    quickMatches.delete(matchId);
    (match.players || []).forEach((player) => userToMatch.delete(player.username));
    await broadcastMatchState(matchId);
    return res.json({
        ok: true,
        mode: match.mode || 'quick',
        status: 'ended',
        surrenderedBy: username,
        winner: opponentEntry ? opponentEntry.username : null,
        endReason: 'surrender',
        endedAt,
        ladderResult: ladderResults?.[username] || null,
        missionResult: match.missionResults?.[username] || null,
        storyResult: match.storyResults?.[username] || null,
        gauntletResult: match.gauntletResults?.[username] || null,
    });
});

app.post('/api/match/:matchId/turn/end', requireSession, async (req, res) => {
    try {
        const { matchId } = req.params;
        const match = await getMatchActive(matchId);
        if (!match) {
            return res.status(404).json({ error: 'Match not found.' });
        }
        const hydratedTurn = await ensureMatchTurnData(match);
        const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
        const hydratedPending = await ensurePendingTurnState(hydratedEcon);
        const hydratedBoard = await ensureBoardState(hydratedPending);
        const hydrated = await autoAdvanceTurnIfExpired(hydratedBoard);
        if (!hydrated) {
            return res.status(404).json({ error: 'Match not found.' });
        }
        if (hydrated.status === 'ended') {
            await broadcastMatchState(hydrated);
            return res.status(409).json({ error: 'Match already ended.' });
        }

        const username = req.authUser.username;
        if (hydrated.currentTurn !== username) {
            await broadcastMatchState(hydrated);
            return res.status(403).json({ error: 'Not your turn.' });
        }
        const pendingTurn = getPendingTurn(hydrated, username);
        if (hasPendingTurnStartChoice(pendingTurn)) {
            return res.status(400).json({ error: 'Resolve the Doctor\'s Bag choice first.' });
        }
        if ((pendingTurn.unresolvedRandom || 0) > 0) {
            return res.status(400).json({ error: 'Resolve random chakra before ending turn.' });
        }

        const updated = await finalizeTurn(hydrated, username);
        await broadcastMatchState(updated || hydrated);
        scheduleBattleBotTurn(updated || hydrated);

        return res.json(buildMatchPayloadForUser(updated, username));
    } catch (error) {
        console.error('Failed to end turn:', error);
        return res.status(500).json({
            error: 'Failed to end turn.',
            details: String(error?.stack || error?.message || error),
        });
    }
});

app.post('/api/match/:matchId/skill/queue', requireSession, async (req, res) => {
    const { matchId } = req.params;
    const actorSlot = Number.parseInt(req.body?.actorSlot, 10);
    const skillIndex = Number.parseInt(req.body?.skillIndex, 10);
    const targetSelection = req.body?.targetSelection;
    const classChoice = req.body?.classChoice;
    if (!Number.isInteger(actorSlot) || actorSlot < 0 || !Number.isInteger(skillIndex) || skillIndex < 0) {
        return res.status(400).json({ error: 'actorSlot and skillIndex are required.' });
    }
    const match = await getMatchActive(matchId);
    if (!match) {
        return res.status(404).json({ error: 'Match not found.' });
    }
    const hydratedTurn = await ensureMatchTurnData(match);
    const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
    const hydratedPending = await ensurePendingTurnState(hydratedEcon);
    const hydratedBoard = await ensureBoardState(hydratedPending);
    const hydrated = await autoAdvanceTurnIfExpired(hydratedBoard);
    if (!hydrated) {
        return res.status(404).json({ error: 'Match not found.' });
    }
    if (hydrated.status === 'ended') {
        return res.status(409).json({ error: 'Match already ended.' });
    }
    const username = req.authUser.username;
    const playerEntry = hydrated.players.find((p) => p.username === username);
    if (!playerEntry) {
        return res.status(403).json({ error: 'Not part of this match.' });
    }
    if (hydrated.currentTurn !== username) {
        return res.status(403).json({ error: 'Not your turn.' });
    }
    if (hasPendingTurnStartChoice(getPendingTurn(hydrated, username))) {
        return res.status(400).json({ error: 'Resolve the Doctor\'s Bag choice first.' });
    }
    const options = battleLogic.computeTargetOptions({
        match: hydrated,
        actingUsername: username,
        actorSlot,
        skillIndex,
        characters: charactersData,
    });
    if (!options.targetType || options.mode === 'unknown') {
        return res.status(400).json({ error: 'Skill target could not be resolved.' });
    }
    if (!battleLogic.validateTargetSelection(options, targetSelection)) {
        return res.status(400).json({ error: 'Invalid target selection.' });
    }
    try {
        queueSkillForActorSlot({
            match: hydrated,
            username,
            actorSlot,
            skillIndex,
            targetSelection,
            classChoice,
        });
        await persistMatchState(hydrated, {
            chakraPools: hydrated.chakraPools,
            pendingTurns: hydrated.pendingTurns,
        });
        await broadcastMatchState(hydrated);
        const safePayload = buildMatchPayloadForUser(hydrated, username);
        return res.json({
            ok: true,
            chakraPools: safePayload?.chakraPools || null,
            pendingTurn: safePayload?.pendingTurn || makeEmptyPendingTurn(),
            currentTurn: hydrated.currentTurn,
            turnExpiresAt: hydrated.turnExpiresAt,
            turnDurationMs: getTurnDurationMsForUser(hydrated, hydrated?.currentTurn),
        });
    } catch (error) {
        return res.status(400).json({ error: error.message || 'Failed to queue skill.' });
    }
});

app.post('/api/match/:matchId/turn/start-choice', requireSession, async (req, res) => {
    try {
        const { matchId } = req.params;
        const choiceKey =
            typeof req.body?.choiceKey === 'string' ? req.body.choiceKey.trim().toLowerCase() : '';
        if (!choiceKey) {
            return res.status(400).json({ error: 'choiceKey is required.' });
        }
        const match = await getMatchActive(matchId);
        if (!match) {
            return res.status(404).json({ error: 'Match not found.' });
        }
        const hydratedTurn = await ensureMatchTurnData(match);
        const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
        const hydratedPending = await ensurePendingTurnState(hydratedEcon);
        const hydratedBoard = await ensureBoardState(hydratedPending);
        const hydrated = await autoAdvanceTurnIfExpired(hydratedBoard);
        if (!hydrated) {
            return res.status(404).json({ error: 'Match not found.' });
        }
        if (hydrated.status === 'ended') {
            return res.status(409).json({ error: 'Match already ended.' });
        }
        const username = req.authUser.username;
        if (hydrated.currentTurn !== username) {
            return res.status(403).json({ error: 'Not your turn.' });
        }
        const pendingTurn = getPendingTurn(hydrated, username);
        const prompt = pendingTurn.turnStartChoice;
        if (!hasPendingTurnStartChoice(pendingTurn) || !prompt) {
            return res.status(400).json({ error: 'No Doctor\'s Bag choice is pending.' });
        }
        const option = Array.isArray(prompt.options)
            ? prompt.options.find((entry) => entry?.key === choiceKey)
            : null;
        if (!option) {
            return res.status(400).json({ error: 'Invalid choice.' });
        }
        resolveTurnStartChoiceForUser({ match: hydrated, username, choiceKey });
        await persistMatchState(hydrated, {
            board: hydrated.board,
            players: hydrated.players,
            pendingTurns: hydrated.pendingTurns,
        });
        await broadcastMatchState(hydrated);
        scheduleBattleBotTurn(hydrated);
        return res.json(buildMatchPayloadForUser(hydrated, username));
    } catch (error) {
        console.error('Failed to resolve turn start choice:', error);
        return res.status(500).json({
            error: 'Failed to resolve turn start choice.',
        });
    }
});

app.post('/api/match/:matchId/skill/cancel', requireSession, async (req, res) => {
    const { matchId } = req.params;
    const actorSlot = Number.parseInt(req.body?.actorSlot, 10);
    if (!Number.isInteger(actorSlot) || actorSlot < 0) {
        return res.status(400).json({ error: 'actorSlot is required.' });
    }
    const match = await getMatchActive(matchId);
    if (!match) {
        return res.status(404).json({ error: 'Match not found.' });
    }
    const hydratedTurn = await ensureMatchTurnData(match);
    const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
    const hydratedPending = await ensurePendingTurnState(hydratedEcon);
    const hydrated = await autoAdvanceTurnIfExpired(hydratedPending);
    if (!hydrated) {
        return res.status(404).json({ error: 'Match not found.' });
    }
    if (hydrated.status === 'ended') {
        return res.status(409).json({ error: 'Match already ended.' });
    }
    const username = req.authUser.username;
    const playerEntry = hydrated.players.find((p) => p.username === username);
    if (!playerEntry) {
        return res.status(403).json({ error: 'Not part of this match.' });
    }
    if (hydrated.currentTurn !== username) {
        return res.status(403).json({ error: 'Not your turn.' });
    }
    if (hasPendingTurnStartChoice(getPendingTurn(hydrated, username))) {
        return res.status(400).json({ error: 'Resolve the Doctor\'s Bag choice first.' });
    }
    const changed = cancelQueuedSkillForActorSlot({ match: hydrated, username, actorSlot });
    if (changed) {
        await persistMatchState(hydrated, {
            chakraPools: hydrated.chakraPools,
            pendingTurns: hydrated.pendingTurns,
        });
        await broadcastMatchState(hydrated);
    }
    const safePayload = buildMatchPayloadForUser(hydrated, username);
    return res.json({
        ok: true,
        chakraPools: safePayload?.chakraPools || null,
        pendingTurn: safePayload?.pendingTurn || makeEmptyPendingTurn(),
        currentTurn: hydrated.currentTurn,
        turnExpiresAt: hydrated.turnExpiresAt,
        turnDurationMs: getTurnDurationMsForUser(hydrated, hydrated?.currentTurn),
    });
});

app.post('/api/match/:matchId/skill/reorder', requireSession, async (req, res) => {
    const { matchId } = req.params;
    const actorSlots = Array.isArray(req.body?.actorSlots) ? req.body.actorSlots : [];
    const match = await getMatchActive(matchId);
    if (!match) {
        return res.status(404).json({ error: 'Match not found.' });
    }
    const hydratedTurn = await ensureMatchTurnData(match);
    const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
    const hydratedPending = await ensurePendingTurnState(hydratedEcon);
    const hydrated = await autoAdvanceTurnIfExpired(hydratedPending);
    if (!hydrated) {
        return res.status(404).json({ error: 'Match not found.' });
    }
    if (hydrated.status === 'ended') {
        return res.status(409).json({ error: 'Match already ended.' });
    }
    const username = req.authUser.username;
    const playerEntry = hydrated.players.find((p) => p.username === username);
    if (!playerEntry) {
        return res.status(403).json({ error: 'Not part of this match.' });
    }
    if (hydrated.currentTurn !== username) {
        return res.status(403).json({ error: 'Not your turn.' });
    }
    if (hasPendingTurnStartChoice(getPendingTurn(hydrated, username))) {
        return res.status(400).json({ error: 'Resolve the Doctor\'s Bag choice first.' });
    }
    reorderQueuedSkills({ match: hydrated, username, actorSlots });
    await persistMatchState(hydrated, {
        pendingTurns: hydrated.pendingTurns,
    });
    await broadcastMatchState(hydrated);
    return res.json({
        ok: true,
        pendingTurn: getPendingTurn(hydrated, username),
        currentTurn: hydrated.currentTurn,
        turnExpiresAt: hydrated.turnExpiresAt,
        turnDurationMs: getTurnDurationMsForUser(hydrated, hydrated?.currentTurn),
    });
});

app.post('/api/match/:matchId/turn/random/adjust', requireSession, async (req, res) => {
    const { matchId } = req.params;
    const chakraType = typeof req.body?.chakraType === 'string' ? req.body.chakraType.trim().toLowerCase() : '';
    const deltaRaw = Number.parseInt(req.body?.delta, 10);
    const delta = deltaRaw > 0 ? 1 : deltaRaw < 0 ? -1 : 0;
    if (!chakraTypes.includes(chakraType) || !delta) {
        return res.status(400).json({ error: 'chakraType and delta are required.' });
    }
    const match = await getMatchActive(matchId);
    if (!match) {
        return res.status(404).json({ error: 'Match not found.' });
    }
    const hydratedTurn = await ensureMatchTurnData(match);
    const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
    const hydratedPending = await ensurePendingTurnState(hydratedEcon);
    const hydrated = await autoAdvanceTurnIfExpired(hydratedPending);
    if (!hydrated) {
        return res.status(404).json({ error: 'Match not found.' });
    }
    if (hydrated.status === 'ended') {
        return res.status(409).json({ error: 'Match already ended.' });
    }
    const username = req.authUser.username;
    const playerEntry = hydrated.players.find((p) => p.username === username);
    if (!playerEntry) {
        return res.status(403).json({ error: 'Not part of this match.' });
    }
    if (hydrated.currentTurn !== username) {
        return res.status(403).json({ error: 'Not your turn.' });
    }
    if (hasPendingTurnStartChoice(getPendingTurn(hydrated, username))) {
        return res.status(400).json({ error: 'Resolve the Doctor\'s Bag choice first.' });
    }
    try {
        adjustRandomAssignment({ match: hydrated, username, chakraType, delta });
        await persistMatchState(hydrated, {
            chakraPools: hydrated.chakraPools,
            pendingTurns: hydrated.pendingTurns,
        });
        await broadcastMatchState(hydrated);
        const safePayload = buildMatchPayloadForUser(hydrated, username);
        return res.json({
            ok: true,
            chakraPools: safePayload?.chakraPools || null,
            pendingTurn: safePayload?.pendingTurn || makeEmptyPendingTurn(),
            currentTurn: hydrated.currentTurn,
            turnExpiresAt: hydrated.turnExpiresAt,
            turnDurationMs: getTurnDurationMsForUser(hydrated, hydrated?.currentTurn),
        });
    } catch (error) {
        return res.status(400).json({ error: error.message || 'Unable to adjust random chakra.' });
    }
});

app.post('/api/match/:matchId/chakra/exchange', requireSession, async (req, res) => {
    const { matchId } = req.params;
    const chakraType = typeof req.body?.chakraType === 'string' ? req.body.chakraType.trim().toLowerCase() : '';
    const spendAssignments =
        req.body?.spendAssignments && typeof req.body.spendAssignments === 'object'
            ? req.body.spendAssignments
            : null;
    if (!chakraTypes.includes(chakraType)) {
        return res.status(400).json({ error: 'chakraType is required.' });
    }
    const match = await getMatchActive(matchId);
    if (!match) {
        return res.status(404).json({ error: 'Match not found.' });
    }
    const hydratedTurn = await ensureMatchTurnData(match);
    const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
    const hydratedPending = await ensurePendingTurnState(hydratedEcon);
    const hydrated = await autoAdvanceTurnIfExpired(hydratedPending);
    if (!hydrated) {
        return res.status(404).json({ error: 'Match not found.' });
    }
    if (hydrated.status === 'ended') {
        return res.status(409).json({ error: 'Match already ended.' });
    }
    const username = req.authUser.username;
    const playerEntry = hydrated.players.find((p) => p.username === username);
    if (!playerEntry) {
        return res.status(403).json({ error: 'Not part of this match.' });
    }
    if (hydrated.currentTurn !== username) {
        return res.status(403).json({ error: 'Not your turn.' });
    }
    if (hasPendingTurnStartChoice(getPendingTurn(hydrated, username))) {
        return res.status(400).json({ error: 'Resolve the Doctor\'s Bag choice first.' });
    }
    try {
        exchangeChakra({
            match: hydrated,
            username,
            chakraType,
            cost: 5,
            spendAssignments,
        });
        await persistMatchState(hydrated, {
            chakraPools: hydrated.chakraPools,
            pendingTurns: hydrated.pendingTurns,
        });
        await broadcastMatchState(hydrated);
        const safePayload = buildMatchPayloadForUser(hydrated, username);
        return res.json({
            ok: true,
            chakraPools: safePayload?.chakraPools || null,
            pendingTurn: safePayload?.pendingTurn || makeEmptyPendingTurn(),
            currentTurn: hydrated.currentTurn,
            turnExpiresAt: hydrated.turnExpiresAt,
            turnDurationMs: getTurnDurationMsForUser(hydrated, hydrated?.currentTurn),
        });
    } catch (error) {
        return res.status(400).json({ error: error.message || 'Unable to exchange chakra.' });
    }
});

app.post('/api/match/:matchId/skill/targets', requireSession, async (req, res) => {
    const { matchId } = req.params;
    const actorSlot = Number.parseInt(req.body?.actorSlot, 10);
    const skillIndex = Number.parseInt(req.body?.skillIndex, 10);
    if (!Number.isInteger(actorSlot) || actorSlot < 0 || !Number.isInteger(skillIndex) || skillIndex < 0) {
        return res.status(400).json({ error: 'actorSlot and skillIndex are required.' });
    }
    const match = await getMatchActive(matchId);
    if (!match) {
        return res.status(404).json({ error: 'Match not found.' });
    }
    const hydratedTurn = await ensureMatchTurnData(match);
    const hydratedEcon = await ensureMatchEconomy(hydratedTurn);
    const hydratedPending = await ensurePendingTurnState(hydratedEcon);
    const hydratedBoard = await ensureBoardState(hydratedPending);
    const hydrated = await autoAdvanceTurnIfExpired(hydratedBoard);
    if (!hydrated) {
        return res.status(404).json({ error: 'Match not found.' });
    }
    if (hydrated.status === 'ended') {
        return res.status(409).json({ error: 'Match already ended.' });
    }

    const username = req.authUser.username;
    const playerEntry = hydrated.players.find((p) => p.username === username);
    if (!playerEntry) {
        return res.status(403).json({ error: 'Not part of this match.' });
    }
    if (hydrated.currentTurn !== username) {
        return res.status(403).json({ error: 'Not your turn.' });
    }

    const options = battleLogic.computeTargetOptions({
        match: hydrated,
        actingUsername: username,
        actorSlot,
        skillIndex,
        characters: charactersData,
    });

    if (!options.targetType || options.mode === 'unknown') {
        return res.status(400).json({ error: 'Skill target could not be resolved.' });
    }

    return res.json({
        ok: true,
        targetType: options.targetType,
        mode: options.mode,
        targets: options.targets,
        currentTurn: hydrated.currentTurn,
        turnExpiresAt: hydrated.turnExpiresAt,
        pendingTurn: getPendingTurn(hydrated, username),
    });
});

app.post('/api/refresh', requireSession, async (req, res) => {
    try {
        const token = signSession(req.authUser);
        setSessionCookie(res, token);
        return res.json({ ok: true, user: req.authUser });
    } catch (error) {
        console.error('Refresh error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

app.get('/api/me', requireSession, async (req, res) => {
    const user = await usersCollection.findOne({ username: req.authUser.username });
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized.' });
    }
    const normalizedProfile = normalizeUserProfile(user);
    normalizedProfile.activity.lastOnlineAt = new Date();
    await usersCollection.updateOne(
        { _id: user._id },
        {
            $set: {
                profile: normalizedProfile,
                savedTeamIndices: Array.isArray(user.savedTeamIndices) ? user.savedTeamIndices : [],
            },
        }
    );
    const hydratedUser = {
        ...user,
        profile: normalizedProfile,
        savedTeamIndices: Array.isArray(user.savedTeamIndices) ? user.savedTeamIndices : [],
    };
    res.json({ ok: true, user: serializeUserForClient(hydratedUser) });
});

app.post('/api/activity', requireSession, async (req, res) => {
    const { error: validationError, value } = activityUpdateSchema.validate(req.body || {});
    if (validationError) {
        return res.status(400).json({ error: 'Invalid activity payload.' });
    }
    const user = await usersCollection.findOne({ username: req.authUser.username });
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized.' });
    }
    const normalizedProfile = normalizeUserProfile(user);
    normalizedProfile.activity.lastOnlineAt = new Date();
    normalizedProfile.activity.currentPage = value.currentPage || '';
    await usersCollection.updateOne(
        { _id: user._id },
        {
            $set: {
                profile: normalizedProfile,
            },
        }
    );
    return res.json({
        ok: true,
        activity: normalizedProfile.activity,
    });
});



app.get('/api/news', async (req, res) => {
    try {
        const posts = await newsPostsCollection
            .find({}, { sort: { createdAt: -1 } })
            .toArray();
        return res.json({
            ok: true,
            posts: posts.map(serializeNewsPost),
        });
    } catch (error) {
        console.error('News load error:', error);
        return res.status(500).json({ error: 'Unable to load news posts.' });
    }
});

app.get('/api/missions', async (req, res) => {
    try {
        const missions = await getStoredMissionCatalog();
        let missionState = createDefaultMissionState();
        try {
            const token = req.cookies?.[SESSION_COOKIE_NAME];
            const authUser = token ? await getSessionUserFromToken(token) : null;
            if (authUser) {
                const normalizedProfile = normalizeUserProfile(authUser);
                missionState = normalizeMissionState(normalizedProfile.missions);
            }
        } catch (sessionError) {
            console.warn('Mission session lookup failed:', sessionError);
        }
        return res.json({
            ok: true,
            missions,
            missionProgressByMissionId: missionState.progressByMissionId,
            unlockedCharacterIds: missionState.unlockedCharacterIds,
        });
    } catch (error) {
        console.error('Mission catalog load error:', error);
        return res.status(500).json({ error: 'Unable to load missions.' });
    }
});

app.get('/api/story', async (req, res) => {
    try {
        const chapters = await getStoredStoryCatalog();
        let storyState = { progressByNodeId: {} };
        let unlockedCharacterIds = [];
        try {
            const token = req.cookies?.[SESSION_COOKIE_NAME];
            const authUser = token ? await getSessionUserFromToken(token) : null;
            if (authUser) {
                const normalizedProfile = normalizeUserProfile(authUser);
                storyState = normalizeStoryState(normalizedProfile.story);
                unlockedCharacterIds = normalizedProfile.missions.unlockedCharacterIds || [];
            }
        } catch (sessionError) {
            console.warn('Story session lookup failed:', sessionError);
        }
        return res.json({
            ok: true,
            chapters,
            storyProgressByNodeId: storyState.progressByNodeId,
            unlockedCharacterIds,
        });
    } catch (error) {
        console.error('Story catalog load error:', error);
        return res.status(500).json({ error: 'Unable to load story mode.' });
    }
});

app.get('/api/shop', requireSession, async (req, res) => {
    try {
        const user = await usersCollection.findOne({ username: req.authUser.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const profile = normalizeUserProfile(user);
        const lockedCharacterIds = await getMissionLockedCharacterIds();
        const missionCatalog = await getStoredMissionCatalog();
        const characters = buildCharacterCatalog().filter((character) => {
            if (!character.requiredMissionId) {
                return false;
            }
            return !profileHasUnlockedCharacter(profile, character.characterId, lockedCharacterIds);
        }).map((character) => {
            const shopPrice = getShopPriceForMissionId(character.requiredMissionId, missionCatalog);
            return {
                ...character,
                shopPrice,
            };
        });
        return res.json({
            ok: true,
            ryo: profile.ryo,
            characters,
        });
    } catch (error) {
        console.error('Shop catalog load error:', error);
        return res.status(500).json({ error: 'Unable to load shop.' });
    }
});

app.post('/api/shop/purchase', requireSession, async (req, res) => {
    try {
        const characterId = normalizeCharacterId(req.body?.characterId);
        if (!characterId) {
            return res.status(400).json({ error: 'Character is required.' });
        }
        const user = await usersCollection.findOne({ username: req.authUser.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const characterEntry = (Array.isArray(charactersData) ? charactersData : []).find(
            (entry) => normalizeCharacterId(entry && entry.characterId) === characterId
        );
        const requiredMissionId =
            characterEntry && typeof characterEntry.requiredMissionId === 'string'
                ? characterEntry.requiredMissionId.trim()
                : '';
        if (!characterEntry || !requiredMissionId) {
            return res.status(400).json({ error: 'This character is not available in the shop.' });
        }
        const missionCatalog = await getStoredMissionCatalog();
        const shopPrice = getShopPriceForMissionId(requiredMissionId, missionCatalog);

        const profile = normalizeUserProfile(user);
        const lockedCharacterIds = await getMissionLockedCharacterIds();
        if (profileHasUnlockedCharacter(profile, characterId, lockedCharacterIds)) {
            return res.status(400).json({ error: 'Character already unlocked.' });
        }
        if ((Number(profile.ryo) || 0) < shopPrice) {
            return res.status(400).json({ error: 'Not enough Ryo.' });
        }

        const missionState = normalizeMissionState(profile.missions);
        const unlockedIds = new Set(missionState.unlockedCharacterIds || []);
        unlockedIds.add(characterId);
        const progressByMissionId = { ...(missionState.progressByMissionId || {}) };
        const existingProgress = normalizeMissionProgressEntry(
            progressByMissionId[requiredMissionId] || {}
        );
        progressByMissionId[requiredMissionId] = normalizeMissionProgressEntry({
            ...existingProgress,
            completedAt: existingProgress.completedAt || new Date(),
        });

        profile.ryo = Math.max(0, (Number(profile.ryo) || 0) - shopPrice);
        profile.missions = {
            ...profile.missions,
            progressByMissionId,
            progress: progressByMissionId,
            unlockedCharacterIds: Array.from(unlockedIds),
        };

        const normalizedProfile = normalizeUserProfile({ ...user, profile });
        await usersCollection.updateOne(
            { _id: user._id },
            { $set: { profile: normalizedProfile } }
        );

        return res.json({
            ok: true,
            ryo: normalizedProfile.ryo,
            unlockedCharacterIds: normalizedProfile.missions.unlockedCharacterIds,
            missionProgressByMissionId: normalizedProfile.missions.progressByMissionId,
        });
    } catch (error) {
        console.error('Shop purchase error:', error);
        return res.status(500).json({ error: 'Unable to complete purchase.' });
    }
});









app.get('/api/characters/catalog', (req, res) => {
    return res.json({
        ok: true,
        characters: characterCatalog,
    });
});

app.get('/api/characters', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    try {
        const token = req.cookies?.[SESSION_COOKIE_NAME];
        const authUser = token ? await getSessionUserFromToken(token) : null;
        const normalizedRole = String(authUser?.role || '').trim().toLowerCase();
        const bypassLocks = normalizedRole === 'admin' || normalizedRole === 'moderator';
        const lockedCharacterIds = authUser && !bypassLocks ? await getMissionLockedCharacterIds() : new Set();
        const profile = authUser ? normalizeUserProfile(authUser) : null;
        const characterList = Array.isArray(charactersData) ? charactersData : [];
        return res.json({
            ok: true,
            characters: characterList.map((character) => {
                const characterId = normalizeCharacterId(character?.characterId);
                const unlocked =
                    !authUser ||
                    bypassLocks ||
                    profileHasUnlockedCharacter(profile, characterId, lockedCharacterIds);
                return {
                    ...character,
                    unlocked,
                };
            }),
        });
    } catch (error) {
        console.error('Character roster load error:', error);
        return res.status(500).json({ error: 'Unable to load character data.' });
    }
});














app.get('/api/users/:username/profile', async (req, res) => {
    res.set('Cache-Control', 'no-store');
    const { error: validationError, value } = publicProfileLookupSchema.validate({
        username: req.params.username,
    });
    if (validationError) {
        return res.status(400).json({ error: 'Invalid username.' });
    }
    const requestedUsername = value.username.trim();
    const normalizedRequestedUsername = requestedUsername.toLowerCase();
    let user = await usersCollection.findOne({ usernameLower: normalizedRequestedUsername });
    if (!user) {
        user = await usersCollection.findOne({ username: requestedUsername });
    }
    if (!user) {
        const users = await usersCollection
            .find(
                {},
                {
                    projection: {
                        _id: 1,
                        username: 1,
                    },
                }
            )
            .toArray();
        const matchedUser = users.find((candidate) => {
            const candidateUsername =
                typeof candidate?.username === 'string' ? candidate.username.trim().toLowerCase() : '';
            return candidateUsername === normalizedRequestedUsername;
        });
        if (matchedUser?._id) {
            user = await usersCollection.findOne({ _id: matchedUser._id });
            if (user) {
                await usersCollection.updateOne(
                    { _id: matchedUser._id },
                    {
                        $set: {
                            usernameLower: normalizedRequestedUsername,
                        },
                    }
                );
            }
        }
    }
    if (!user) {
        return res.status(404).json({ error: 'Player not found.' });
    }

    return res.json({
        ok: true,
        user: serializePublicUserProfile(user),
    });
});

app.get('/api/clans/:clanName/profile', async (req, res) => {
    res.set('Cache-Control', 'no-store');
    const requestedClanName = typeof req.params?.clanName === 'string' ? req.params.clanName.trim() : '';
    if (!requestedClanName || requestedClanName.length > 35) {
        return res.status(400).json({ error: 'Invalid clan name.' });
    }

    try {
        const clan = await buildPublicClanProfile(requestedClanName);
        if (!clan) {
            return res.status(404).json({ error: 'Clan not found.' });
        }
        return res.json({
            ok: true,
            clan,
        });
    } catch (error) {
        console.error('Public clan profile error:', error);
        return res.status(500).json({ error: 'Unable to load clan.' });
    }
});

app.get('/api/leaderboards/sidebar', async (req, res) => {
    try {
        const leaderboards = await buildSidebarLeaderboards();
        return res.json({
            ok: true,
            leaderboards,
        });
    } catch (error) {
        console.error('Sidebar leaderboard error:', error);
        return res.status(500).json({ error: 'Unable to load leaderboards.' });
    }
});

app.post('/api/profile/avatar', requireSession, async (req, res) => {
    try {
        const { error: validationError, value } = avatarUpdateSchema.validate(req.body || {});
        if (validationError) {
            return res.status(400).json({ error: 'A valid direct image URL is required.' });
        }

        await validateAvatarUrl(value.avatarUrl);
        const user = await usersCollection.findOne({ username: req.authUser.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const profile = normalizeUserProfile(user);
        profile.avatarUrl = value.avatarUrl;
        await usersCollection.updateOne(
            { _id: user._id },
            {
                $set: {
                    profile,
                },
            }
        );
        const updatedUser = {
            ...user,
            profile,
        };
        return res.json({
            ok: true,
            user: serializeUserForClient(updatedUser),
        });
    } catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Unable to update avatar.' });
    }
});

app.post('/api/profile/matchmaking', requireSession, async (req, res) => {
    try {
        const { error: validationError, value } = matchmakingSettingsSchema.validate(req.body || {});
        if (validationError) {
            return res.status(400).json({ error: 'A valid matchmaking preference is required.' });
        }
        const user = await usersCollection.findOne({ username: req.authUser.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const profile = normalizeUserProfile(user);
        profile.matchmaking = {
            ...profile.matchmaking,
            battleBotEnabled: Boolean(value.battleBotEnabled),
        };
        await usersCollection.updateOne(
            { _id: user._id },
            {
                $set: {
                    profile,
                },
            }
        );
        return res.json({
            ok: true,
            user: serializeUserForClient({
                ...user,
                profile,
            }),
        });
    } catch (error) {
        return res.status(500).json({ error: 'Unable to update matchmaking settings.' });
    }
});

app.post('/api/clan/avatar', requireSession, async (req, res) => {
    try {
        const { error: validationError, value } = avatarUpdateSchema.validate(req.body || {});
        if (validationError) {
            return res.status(400).json({ error: 'A valid direct image URL is required.' });
        }

        await validateAvatarUrl(value.avatarUrl);
        const user = await usersCollection.findOne({ username: req.authUser.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const profile = normalizeUserProfile(user);
        const clan = profile.clan;
        if (!clan || !clan.name) {
            return res.status(400).json({ error: 'You are not in a clan.' });
        }
        if (!clanRankHasPermission(clan.rankKey, 'manageAvatar')) {
            return res.status(403).json({ error: 'Your clan rank cannot manage the clan avatar.' });
        }

        const currentClanName = String(clan.name || '').trim().toLowerCase();
        const currentClanAbbreviation = String(clan.abbreviation || '').trim().toLowerCase();
        const allUsers = await usersCollection
            .find(
                {},
                {
                    projection: {
                        _id: 1,
                        profile: 1,
                    },
                }
            )
            .toArray();

        const clanMembers = allUsers.filter((entry = {}) => {
            const entryClan = normalizeUserProfile(entry).clan;
            if (!entryClan || !entryClan.name) {
                return false;
            }
            const entryClanName = String(entryClan.name || '').trim().toLowerCase();
            const entryClanAbbreviation = String(entryClan.abbreviation || '').trim().toLowerCase();
            return currentClanAbbreviation && entryClanAbbreviation
                ? entryClanName === currentClanName && entryClanAbbreviation === currentClanAbbreviation
                : entryClanName === currentClanName;
        });

        await Promise.all(
            clanMembers.map(async (entry = {}) => {
                const entryProfile = normalizeUserProfile(entry);
                if (!entryProfile.clan) {
                    return;
                }
                entryProfile.clan = {
                    ...entryProfile.clan,
                    avatarUrl: value.avatarUrl,
                };
                await usersCollection.updateOne(
                    { _id: entry._id },
                    {
                        $set: {
                            profile: entryProfile,
                        },
                    }
                );
            })
        );

        const updatedUser = await usersCollection.findOne({ _id: user._id });
        return res.json({
            ok: true,
            user: serializeUserForClient(updatedUser),
        });
    } catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Unable to update clan avatar.' });
    }
});

app.post('/api/profile/reset-account', requireSession, async (req, res) => {
    try {
        const user = await usersCollection.findOne({ username: req.authUser.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const profile = normalizeUserProfile(user);
        profile.recentQuickGames = [];
        profile.recentPrivateGames = [];
        profile.recentLadderGames = [];
        profile.ladder.level = 1;
        profile.ladder.rank = 'Academy Student';
        profile.ladder.rankHatUrl = 'hats/academy.png';
        profile.ladder.experiencePoints = 0;
        profile.ladder.experienceIntoLevel = 0;
        profile.ladder.experienceForNextLevel = getExperienceRequiredForNextLevel(1);
        profile.ladder.experienceToNextLevel = getExperienceRequiredForNextLevel(1);
        profile.ladder.ladderRank = null;
        profile.ladder.wins = 0;
        profile.ladder.losses = 0;
        profile.ladder.streak = 0;
        profile.ladder.highestStreak = 0;
        profile.ladder.highestLevel = 1;
        profile.ladder.famePoints = 0;
        profile.ladder.isHokage = false;

        await usersCollection.updateOne(
            { _id: user._id },
            {
                $set: {
                    profile,
                },
            }
        );
        await recalculatePlayerLadderStandings();
        const updatedUser = await usersCollection.findOne({ _id: user._id });

        return res.json({
            ok: true,
            user: serializeUserForClient(updatedUser || { ...user, profile }),
        });
    } catch (error) {
        console.error('Reset account error:', error);
        return res.status(500).json({ error: 'Unable to reset account.' });
    }
});

app.post('/api/profile/backgrounds', requireSession, async (req, res) => {
    try {
        const { error: validationError, value } = backgroundUpdateSchema.validate(req.body || {});
        if (validationError) {
            return res.status(400).json({ error: 'Direct background URLs are required.' });
        }

        await validateBackgroundUrl(value.selectionUrl);
        await validateBackgroundUrl(value.ingameUrl);

        const user = await usersCollection.findOne({ username: req.authUser.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const profile = normalizeUserProfile(user);
        profile.backgrounds = {
            selectionUrl: value.selectionUrl,
            ingameUrl: value.ingameUrl,
        };

        await usersCollection.updateOne(
            { _id: user._id },
            {
                $set: {
                    profile,
                },
            }
        );

        return res.json({
            ok: true,
            user: serializeUserForClient({
                ...user,
                profile,
            }),
        });
    } catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Unable to update backgrounds.' });
    }
});

app.post('/api/clan/create', requireSession, async (req, res) => {
    try {
        const { error: validationError, value } = clanCreateSchema.validate(req.body || {});
        if (validationError) {
            return res.status(400).json({ error: 'Valid clan details are required.' });
        }

        const user = await usersCollection.findOne({ username: req.authUser.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const profile = normalizeUserProfile(user);
        if (profile.clan && profile.clan.name) {
            return res.status(409).json({ error: 'You are already in a clan.' });
        }

        const requestedName = value.name.trim();
        const requestedAbbreviation = value.abbreviation.trim();
        const requestedNameLower = requestedName.toLowerCase();
        const requestedAbbreviationLower = requestedAbbreviation.toLowerCase();

        const existingClanHolder = await usersCollection.findOne(
            {},
            {
                projection: {
                    _id: 1,
                    profile: 1,
                },
            }
        );

        if (existingClanHolder) {
            const users = await usersCollection
                .find(
                    {},
                    {
                        projection: {
                            _id: 1,
                            profile: 1,
                        },
                    }
                )
                .toArray();
            const duplicateClan = users.some((entry) => {
                const clan = normalizeUserProfile(entry).clan;
                if (!clan || !clan.name) {
                    return false;
                }
                const clanName = String(clan.name || '').trim().toLowerCase();
                const clanAbbreviation = String(clan.abbreviation || '').trim().toLowerCase();
                return clanName === requestedNameLower || clanAbbreviation === requestedAbbreviationLower;
            });
            if (duplicateClan) {
                return res.status(409).json({ error: 'Clan name or abbreviation is already in use.' });
            }
        }

        const now = new Date();
        profile.clan = {
            name: requestedName,
            abbreviation: requestedAbbreviation,
            rankKey: 'clanLeader',
            customRankName: '',
            rank: DEFAULT_CLAN_RANK_NAMES.clanLeader,
            avatarUrl: '',
            joinedAt: now,
            bio: value.bio || '',
            createdBy: user.username,
            createdAt: now,
            customRankNames: normalizeClanRankNames(),
        };

        await usersCollection.updateOne(
            { _id: user._id },
            {
                $set: {
                    profile,
                },
            }
        );

        return res.status(201).json({
            ok: true,
            user: serializeUserForClient({
                ...user,
                profile,
            }),
        });
    } catch (error) {
        console.error('Clan creation error:', error);
        return res.status(500).json({ error: 'Unable to create clan.' });
    }
});

app.post('/api/clan/leave', requireSession, async (req, res) => {
    try {
        const user = await usersCollection.findOne({ username: req.authUser.username });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const profile = normalizeUserProfile(user);
        const clan = profile.clan;

        if (!clan || !clan.name) {
            return res.status(400).json({ error: 'You are not in a clan.' });
        }

        const clanName = String(clan.name || '').trim().toLowerCase();
        const clanAbbreviation = String(clan.abbreviation || '').trim().toLowerCase();
        const isClanLeader = String(clan.rankKey || '').trim() === 'clanLeader';
        const allUsers = await usersCollection.find({}).toArray();
        const clanMembers = allUsers.filter((entry = {}) => {
            const entryClan = normalizeUserProfile(entry).clan;
            if (!entryClan || !entryClan.name) {
                return false;
            }

            const entryClanName = String(entryClan.name || '').trim().toLowerCase();
            const entryClanAbbreviation = String(entryClan.abbreviation || '').trim().toLowerCase();
            if (!entryClanName) {
                return false;
            }

            if (clanAbbreviation && entryClanAbbreviation) {
                return entryClanName === clanName && entryClanAbbreviation === clanAbbreviation;
            }

            return entryClanName === clanName;
        });

        const otherClanLeaders = clanMembers.filter((entry = {}) => {
            if (String(entry.username || '') === String(user.username || '')) {
                return false;
            }
            const entryClan = normalizeUserProfile(entry).clan;
            return String(entryClan && entryClan.rankKey ? entryClan.rankKey : '').trim() === 'clanLeader';
        });

        const shouldDisbandClan = isClanLeader && otherClanLeaders.length === 0;

        if (shouldDisbandClan) {
            await Promise.all(clanMembers.map(async (entry = {}) => {
                const entryProfile = normalizeUserProfile(entry);
                entryProfile.clan = null;
                await usersCollection.updateOne(
                    { _id: entry._id },
                    {
                        $set: {
                            profile: entryProfile
                        }
                    }
                );
            }));
        } else {
            profile.clan = null;
            await usersCollection.updateOne(
                { _id: user._id },
                {
                    $set: {
                        profile
                    }
                }
            );
        }

        const updatedUser = await usersCollection.findOne({ _id: user._id });
        return res.json({
            ok: true,
            disbanded: shouldDisbandClan,
            user: serializeUserForClient(updatedUser)
        });
    } catch (error) {
        console.error('Failed to leave clan', error);
        return res.status(500).json({ error: 'Unable to leave clan right now.' });
    }
});

app.post('/api/clan/update', requireSession, async (req, res) => {
    try {
        const { error: validationError, value } = clanUpdateSchema.validate(req.body || {});
        if (validationError) {
            return res.status(400).json({ error: 'Valid clan details are required.' });
        }

        const user = await usersCollection.findOne({ username: req.authUser.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const profile = normalizeUserProfile(user);
        const clan = profile.clan;
        if (!clan || !clan.name) {
            return res.status(400).json({ error: 'You are not in a clan.' });
        }
        if (!clanRankHasPermission(clan.rankKey, 'manageInfo')) {
            return res.status(403).json({ error: 'Your clan rank cannot manage clan info.' });
        }

        const currentClanName = String(clan.name || '').trim().toLowerCase();
        const currentClanAbbreviation = String(clan.abbreviation || '').trim().toLowerCase();
        const requestedName = value.name.trim();
        const requestedAbbreviation = value.abbreviation.trim();
        const requestedNameLower = requestedName.toLowerCase();
        const requestedAbbreviationLower = requestedAbbreviation.toLowerCase();

        const allUsers = await usersCollection
            .find(
                {},
                {
                    projection: {
                        _id: 1,
                        username: 1,
                        profile: 1,
                    },
                }
            )
            .toArray();

        const clanMembers = allUsers.filter((entry = {}) => {
            const entryClan = normalizeUserProfile(entry).clan;
            if (!entryClan || !entryClan.name) {
                return false;
            }
            const entryClanName = String(entryClan.name || '').trim().toLowerCase();
            const entryClanAbbreviation = String(entryClan.abbreviation || '').trim().toLowerCase();
            return currentClanAbbreviation && entryClanAbbreviation
                ? entryClanName === currentClanName && entryClanAbbreviation === currentClanAbbreviation
                : entryClanName === currentClanName;
        });

        const duplicateClan = allUsers.some((entry = {}) => {
            const entryClan = normalizeUserProfile(entry).clan;
            if (!entryClan || !entryClan.name) {
                return false;
            }
            const entryClanName = String(entryClan.name || '').trim().toLowerCase();
            const entryClanAbbreviation = String(entryClan.abbreviation || '').trim().toLowerCase();
            const sameCurrentClan = currentClanAbbreviation && entryClanAbbreviation
                ? entryClanName === currentClanName && entryClanAbbreviation === currentClanAbbreviation
                : entryClanName === currentClanName;
            if (sameCurrentClan) {
                return false;
            }
            return entryClanName === requestedNameLower || entryClanAbbreviation === requestedAbbreviationLower;
        });

        if (duplicateClan) {
            return res.status(409).json({ error: 'Clan name or abbreviation is already in use.' });
        }

        await Promise.all(
            clanMembers.map(async (entry = {}) => {
                const entryProfile = normalizeUserProfile(entry);
                if (!entryProfile.clan) {
                    return;
                }
                entryProfile.clan = {
                    ...entryProfile.clan,
                    name: requestedName,
                    abbreviation: requestedAbbreviation,
                    bio: value.bio || '',
                };
                await usersCollection.updateOne(
                    { _id: entry._id },
                    {
                        $set: {
                            profile: entryProfile,
                        },
                    }
                );
            })
        );

        const updatedUser = await usersCollection.findOne({ _id: user._id });
        return res.json({
            ok: true,
            user: serializeUserForClient(updatedUser),
        });
    } catch (error) {
        console.error('Clan update error:', error);
        return res.status(500).json({ error: 'Unable to update clan.' });
    }
});

app.post('/api/clan/ranks', requireSession, async (req, res) => {
    try {
        const { error: validationError, value } = clanRankNamesSchema.validate(req.body || {});
        if (validationError) {
            return res.status(400).json({ error: 'Valid custom rank details are required.' });
        }

        const user = await usersCollection.findOne({ username: req.authUser.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const profile = normalizeUserProfile(user);
        const clan = profile.clan;
        if (!clan || !clan.name) {
            return res.status(400).json({ error: 'You are not in a clan.' });
        }
        if (!clanRankHasPermission(clan.rankKey, 'assignRanks')) {
            return res.status(403).json({ error: 'Your clan rank cannot assign ranks.' });
        }

        const currentClanName = String(clan.name || '').trim().toLowerCase();
        const currentClanAbbreviation = String(clan.abbreviation || '').trim().toLowerCase();
        const allUsers = await usersCollection
            .find(
                {},
                {
                    projection: {
                        _id: 1,
                        profile: 1,
                    },
                }
            )
            .toArray();

        const clanMembers = allUsers.filter((entry = {}) => {
            const entryClan = normalizeUserProfile(entry).clan;
            if (!entryClan || !entryClan.name) {
                return false;
            }
            const entryClanName = String(entryClan.name || '').trim().toLowerCase();
            const entryClanAbbreviation = String(entryClan.abbreviation || '').trim().toLowerCase();
            return currentClanAbbreviation && entryClanAbbreviation
                ? entryClanName === currentClanName && entryClanAbbreviation === currentClanAbbreviation
                : entryClanName === currentClanName;
        });

        const normalizedName = value.name.trim();
        const previousName = value.previousName.trim();
        const rankKey = value.rankKey;
        const existingRankNames = normalizeClanRankNames(clan.customRankNames);
        const updatedRankNames = {
            ...existingRankNames,
            [rankKey]: [...existingRankNames[rankKey]],
        };

        if (previousName) {
            const targetIndex = updatedRankNames[rankKey].findIndex((entry) => entry === previousName);
            if (targetIndex === -1) {
                return res.status(404).json({ error: 'Custom rank not found.' });
            }
            const duplicateElsewhere = updatedRankNames[rankKey].some(
                (entry, index) => index !== targetIndex && entry.toLowerCase() === normalizedName.toLowerCase()
            );
            if (duplicateElsewhere) {
                return res.status(409).json({ error: 'That custom rank already exists for this tier.' });
            }
            updatedRankNames[rankKey][targetIndex] = normalizedName;
        } else {
            const duplicateRank = updatedRankNames[rankKey].some(
                (entry) => entry.toLowerCase() === normalizedName.toLowerCase()
            );
            if (duplicateRank) {
                return res.status(409).json({ error: 'That custom rank already exists for this tier.' });
            }
            updatedRankNames[rankKey].push(normalizedName);
        }

        await Promise.all(
            clanMembers.map(async (entry = {}) => {
                const entryProfile = normalizeUserProfile(entry);
                if (!entryProfile.clan) {
                    return;
                }
                const entryRankKey = normalizeClanRankKey(entryProfile.clan.rankKey, entry, entryProfile.clan);
                const nextCustomRankName =
                    entryProfile.clan.customRankName === previousName ? normalizedName : entryProfile.clan.customRankName;
                entryProfile.clan = {
                    ...entryProfile.clan,
                    customRankNames: updatedRankNames,
                    rankKey: entryRankKey,
                    rank:
                        nextCustomRankName && updatedRankNames[entryRankKey].includes(nextCustomRankName)
                            ? resolveClanRankLabel(entryRankKey, nextCustomRankName)
                        : resolveBaseClanRankLabel(entryRankKey),
                    customRankName:
                        nextCustomRankName && updatedRankNames[entryRankKey].includes(nextCustomRankName)
                            ? nextCustomRankName
                            : '',
                };
                await usersCollection.updateOne(
                    { _id: entry._id },
                    {
                        $set: {
                            profile: entryProfile,
                        },
                    }
                );
            })
        );

        const updatedUser = await usersCollection.findOne({ _id: user._id });
        return res.json({
            ok: true,
            user: serializeUserForClient(updatedUser),
        });
    } catch (error) {
        console.error('Clan rank update error:', error);
        return res.status(500).json({ error: 'Unable to update clan ranks.' });
    }
});

app.post('/api/clan/ranks/delete', requireSession, async (req, res) => {
    try {
        const { error: validationError, value } = clanRankDeleteSchema.validate(req.body || {});
        if (validationError) {
            return res.status(400).json({ error: 'Valid custom rank details are required.' });
        }

        const user = await usersCollection.findOne({ username: req.authUser.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const profile = normalizeUserProfile(user);
        const clan = profile.clan;
        if (!clan || !clan.name) {
            return res.status(400).json({ error: 'You are not in a clan.' });
        }

        const currentClanName = String(clan.name || '').trim().toLowerCase();
        const currentClanAbbreviation = String(clan.abbreviation || '').trim().toLowerCase();
        const allUsers = await usersCollection
            .find(
                {},
                {
                    projection: {
                        _id: 1,
                        profile: 1,
                    },
                }
            )
            .toArray();

        const clanMembers = allUsers.filter((entry = {}) => {
            const entryClan = normalizeUserProfile(entry).clan;
            if (!entryClan || !entryClan.name) {
                return false;
            }
            const entryClanName = String(entryClan.name || '').trim().toLowerCase();
            const entryClanAbbreviation = String(entryClan.abbreviation || '').trim().toLowerCase();
            return currentClanAbbreviation && entryClanAbbreviation
                ? entryClanName === currentClanName && entryClanAbbreviation === currentClanAbbreviation
                : entryClanName === currentClanName;
        });

        const rankKey = value.rankKey;
        const targetName = value.name.trim();
        const existingRankNames = normalizeClanRankNames(clan.customRankNames);
        const targetIndex = existingRankNames[rankKey].findIndex((entry) => entry === targetName);
        if (targetIndex === -1) {
            return res.status(404).json({ error: 'Custom rank not found.' });
        }

        const updatedRankNames = {
            ...existingRankNames,
            [rankKey]: existingRankNames[rankKey].filter((entry) => entry !== targetName),
        };

        await Promise.all(
            clanMembers.map(async (entry = {}) => {
                const entryProfile = normalizeUserProfile(entry);
                if (!entryProfile.clan) {
                    return;
                }
                const entryRankKey = normalizeClanRankKey(entryProfile.clan.rankKey, entry, entryProfile.clan);
                const nextCustomRankName =
                    entryProfile.clan.customRankName === targetName ? '' : entryProfile.clan.customRankName;
                entryProfile.clan = {
                    ...entryProfile.clan,
                    customRankNames: updatedRankNames,
                    rankKey: entryRankKey,
                    rank:
                        nextCustomRankName && updatedRankNames[entryRankKey].includes(nextCustomRankName)
                            ? resolveClanRankLabel(entryRankKey, nextCustomRankName)
                            : resolveBaseClanRankLabel(entryRankKey),
                    customRankName:
                        nextCustomRankName && updatedRankNames[entryRankKey].includes(nextCustomRankName)
                            ? nextCustomRankName
                            : '',
                };
                await usersCollection.updateOne(
                    { _id: entry._id },
                    {
                        $set: {
                            profile: entryProfile,
                        },
                    }
                );
            })
        );

        const updatedUser = await usersCollection.findOne({ _id: user._id });
        return res.json({
            ok: true,
            user: serializeUserForClient(updatedUser),
        });
    } catch (error) {
        console.error('Clan rank delete error:', error);
        return res.status(500).json({ error: 'Unable to delete custom rank.' });
    }
});

app.get('/api/clan/members', requireSession, async (req, res) => {
    try {
        const user = await usersCollection.findOne({ username: req.authUser.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const profile = normalizeUserProfile(user);
        const clan = profile.clan;
        if (!clan || !clan.name) {
            return res.status(400).json({ error: 'You are not in a clan.' });
        }

        const clanName = String(clan.name || '').trim().toLowerCase();
        const clanAbbreviation = String(clan.abbreviation || '').trim().toLowerCase();
        const allUsers = await usersCollection
            .find(
                {},
                {
                    projection: {
                        username: 1,
                        profile: 1,
                    },
                }
            )
            .toArray();

        const members = allUsers
            .map((entry = {}) => ({
                username: entry.username,
                profile: normalizeUserProfile(entry),
            }))
            .filter((entry) => {
                const entryClan = entry.profile.clan;
                if (!entryClan || !entryClan.name) {
                    return false;
                }
                const entryClanName = String(entryClan.name || '').trim().toLowerCase();
                const entryClanAbbreviation = String(entryClan.abbreviation || '').trim().toLowerCase();
                return clanAbbreviation && entryClanAbbreviation
                    ? entryClanName === clanName && entryClanAbbreviation === clanAbbreviation
                    : entryClanName === clanName;
            })
            .map((entry) => ({
                username: entry.username,
                rankKey: entry.profile.clan.rankKey || 'member',
                customRankName: entry.profile.clan.customRankName || '',
                rank: entry.profile.clan.rank || DEFAULT_CLAN_RANK_NAMES.member,
            }))
            .sort((left, right) => left.username.localeCompare(right.username));

        return res.json({ ok: true, members });
    } catch (error) {
        console.error('Clan member list error:', error);
        return res.status(500).json({ error: 'Unable to load clan members.' });
    }
});

app.post('/api/clan/member-rank', requireSession, async (req, res) => {
    try {
        const { error: validationError, value } = clanMemberRankSchema.validate(req.body || {});
        if (validationError) {
            return res.status(400).json({ error: 'A valid member and rank are required.' });
        }

        const actingUser = await usersCollection.findOne({ username: req.authUser.username });
        if (!actingUser) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const actingProfile = normalizeUserProfile(actingUser);
        const clan = actingProfile.clan;
        if (!clan || !clan.name) {
            return res.status(400).json({ error: 'You are not in a clan.' });
        }
        if (!clanRankHasPermission(clan.rankKey, 'assignRanks')) {
            return res.status(403).json({ error: 'Your clan rank cannot assign ranks.' });
        }

        const clanName = String(clan.name || '').trim().toLowerCase();
        const clanAbbreviation = String(clan.abbreviation || '').trim().toLowerCase();
        const targetUser = await usersCollection.findOne({ usernameLower: value.username.trim().toLowerCase() });
        if (!targetUser) {
            return res.status(404).json({ error: 'Player not found.' });
        }

        const targetProfile = normalizeUserProfile(targetUser);
        const targetClan = targetProfile.clan;
        if (!targetClan || !targetClan.name) {
            return res.status(400).json({ error: 'That player is not in a clan.' });
        }

        const targetClanName = String(targetClan.name || '').trim().toLowerCase();
        const targetClanAbbreviation = String(targetClan.abbreviation || '').trim().toLowerCase();
        const sameClan = clanAbbreviation && targetClanAbbreviation
            ? targetClanName === clanName && targetClanAbbreviation === clanAbbreviation
            : targetClanName === clanName;
        if (!sameClan) {
            return res.status(400).json({ error: 'That player is not in your clan.' });
        }

        const requestedCustomRankName = value.customRankName.trim();
        const allowedCustomRanks = normalizeClanRankNames(clan.customRankNames)[value.rankKey];
        if (requestedCustomRankName && !allowedCustomRanks.includes(requestedCustomRankName)) {
            return res.status(400).json({ error: 'That custom rank does not exist for the selected tier.' });
        }

        if (value.rankKey === 'clanLeader') {
            const allUsers = await usersCollection
                .find(
                    {},
                    {
                        projection: {
                            _id: 1,
                            username: 1,
                            profile: 1,
                        },
                    }
                )
                .toArray();

            const clanMembers = allUsers.filter((entry = {}) => {
                const entryClan = normalizeUserProfile(entry).clan;
                if (!entryClan || !entryClan.name) {
                    return false;
                }
                const entryClanName = String(entryClan.name || '').trim().toLowerCase();
                const entryClanAbbreviation = String(entryClan.abbreviation || '').trim().toLowerCase();
                return clanAbbreviation && entryClanAbbreviation
                    ? entryClanName === clanName && entryClanAbbreviation === clanAbbreviation
                    : entryClanName === clanName;
            });

            await Promise.all(
                clanMembers.map(async (entry = {}) => {
                    const entryProfile = normalizeUserProfile(entry);
                    if (!entryProfile.clan) {
                        return;
                    }
                    const isTarget =
                        String(entry.username || '').trim().toLowerCase() === targetUser.username.trim().toLowerCase();
                    const nextRankKey = isTarget
                        ? 'clanLeader'
                        : normalizeClanRankKey(entryProfile.clan.rankKey, entry, entryProfile.clan) === 'clanLeader'
                            ? 'leader'
                            : normalizeClanRankKey(entryProfile.clan.rankKey, entry, entryProfile.clan);
                    const nextCustomRankName = isTarget ? requestedCustomRankName : '';
                    entryProfile.clan = {
                        ...entryProfile.clan,
                        rankKey: nextRankKey,
                        customRankName: nextCustomRankName,
                        rank: nextCustomRankName
                            ? resolveClanRankLabel(nextRankKey, nextCustomRankName)
                            : resolveBaseClanRankLabel(nextRankKey),
                    };
                    await usersCollection.updateOne(
                        { _id: entry._id },
                        {
                            $set: {
                                profile: entryProfile,
                            },
                        }
                    );
                })
            );
        } else {
            targetProfile.clan = {
                ...targetProfile.clan,
                rankKey: value.rankKey,
                customRankName: requestedCustomRankName,
                rank:
                    requestedCustomRankName
                        ? resolveClanRankLabel(value.rankKey, requestedCustomRankName)
                        : resolveBaseClanRankLabel(value.rankKey),
            };
            await usersCollection.updateOne(
                { _id: targetUser._id },
                {
                    $set: {
                        profile: targetProfile,
                    },
                }
            );
        }

        const updatedUser = await usersCollection.findOne({ username: req.authUser.username });
        return res.json({
            ok: true,
            user: serializeUserForClient(updatedUser),
        });
    } catch (error) {
        console.error('Clan member rank update error:', error);
        return res.status(500).json({ error: 'Unable to update member rank.' });
    }
});

app.get('/api/clan/recruitment', requireSession, async (req, res) => {
    try {
        const user = await usersCollection.findOne({ username: req.authUser.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const profile = normalizeUserProfile(user);
        const clan = profile.clan;
        if (!clan || !clan.name) {
            return res.status(400).json({ error: 'You are not in a clan.' });
        }

        const clanName = String(clan.name || '').trim().toLowerCase();
        const clanAbbreviation = String(clan.abbreviation || '').trim().toLowerCase();
        const users = await usersCollection
            .find(
                {},
                {
                    projection: {
                        username: 1,
                        profile: 1,
                    },
                }
            )
            .toArray();

        const outgoingInvitations = [];
        users.forEach((entry = {}) => {
            const entryProfile = normalizeUserProfile(entry);
            entryProfile.clanInvitations.forEach((invite) => {
                const inviteClanName = String(invite.clanName || '').trim().toLowerCase();
                const inviteClanAbbreviation = String(invite.clanAbbreviation || '').trim().toLowerCase();
                const sameClan = clanAbbreviation && inviteClanAbbreviation
                    ? inviteClanName === clanName && inviteClanAbbreviation === clanAbbreviation
                    : inviteClanName === clanName;
                if (!sameClan) {
                    return;
                }
                outgoingInvitations.push({
                    username: entry.username,
                    invitedAt: invite.invitedAt || null,
                });
            });
        });

        return res.json({
            ok: true,
            invitations: outgoingInvitations.sort((left, right) => {
                const leftTime = new Date(left.invitedAt || 0).getTime() || 0;
                const rightTime = new Date(right.invitedAt || 0).getTime() || 0;
                return rightTime - leftTime;
            }),
        });
    } catch (error) {
        console.error('Clan recruitment lookup error:', error);
        return res.status(500).json({ error: 'Unable to load clan invitations.' });
    }
});

app.post('/api/clan/invite', requireSession, async (req, res) => {
    try {
        const { error: validationError, value } = clanInviteSchema.validate(req.body || {});
        if (validationError) {
            return res.status(400).json({ error: 'A valid username is required.' });
        }

        const inviter = await usersCollection.findOne({ username: req.authUser.username });
        if (!inviter) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const inviterProfile = normalizeUserProfile(inviter);
        const clan = inviterProfile.clan;
        if (!clan || !clan.name) {
            return res.status(400).json({ error: 'You must be in a clan to invite players.' });
        }
        if (!clanRankHasPermission(clan.rankKey, 'invite')) {
            return res.status(403).json({ error: 'Your clan rank cannot invite players.' });
        }

        const requestedUsername = value.username.trim();
        if (requestedUsername.toLowerCase() === inviter.username.toLowerCase()) {
            return res.status(400).json({ error: 'You cannot invite yourself.' });
        }

        const targetUser = await usersCollection.findOne({ usernameLower: requestedUsername.toLowerCase() });
        if (!targetUser) {
            return res.status(404).json({ error: 'Player not found.' });
        }

        const targetProfile = normalizeUserProfile(targetUser);
        if (targetProfile.clan && targetProfile.clan.name) {
            return res.status(409).json({ error: 'That player is already in a clan.' });
        }

        const clanName = String(clan.name || '').trim().toLowerCase();
        const clanAbbreviation = String(clan.abbreviation || '').trim().toLowerCase();
        const alreadyInvited = targetProfile.clanInvitations.some((invite) => {
            const inviteClanName = String(invite.clanName || '').trim().toLowerCase();
            const inviteClanAbbreviation = String(invite.clanAbbreviation || '').trim().toLowerCase();
            return clanAbbreviation && inviteClanAbbreviation
                ? inviteClanName === clanName && inviteClanAbbreviation === clanAbbreviation
                : inviteClanName === clanName;
        });

        if (alreadyInvited) {
            return res.status(409).json({ error: 'That player already has an invitation from your clan.' });
        }

        targetProfile.clanInvitations = [
            {
                clanName: clan.name,
                clanAbbreviation: clan.abbreviation || '',
                invitedBy: inviter.username,
                invitedUsername: targetUser.username,
                invitedAt: new Date(),
            },
            ...targetProfile.clanInvitations,
        ].slice(0, 50);

        await usersCollection.updateOne(
            { _id: targetUser._id },
            {
                $set: {
                    profile: targetProfile,
                },
            }
        );

        return res.status(201).json({ ok: true });
    } catch (error) {
        console.error('Clan invite error:', error);
        return res.status(500).json({ error: 'Unable to send clan invitation.' });
    }
});

app.post('/api/clan/invite/retract', requireSession, async (req, res) => {
    try {
        const { error: validationError, value } = clanInviteSchema.validate(req.body || {});
        if (validationError) {
            return res.status(400).json({ error: 'A valid username is required.' });
        }

        const inviter = await usersCollection.findOne({ username: req.authUser.username });
        if (!inviter) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const inviterProfile = normalizeUserProfile(inviter);
        const clan = inviterProfile.clan;
        if (!clan || !clan.name) {
            return res.status(400).json({ error: 'You must be in a clan to retract invitations.' });
        }
        if (!clanRankHasPermission(clan.rankKey, 'invite')) {
            return res.status(403).json({ error: 'Your clan rank cannot retract invitations.' });
        }

        const targetUser = await usersCollection.findOne({ usernameLower: value.username.trim().toLowerCase() });
        if (!targetUser) {
            return res.status(404).json({ error: 'Player not found.' });
        }

        const targetProfile = normalizeUserProfile(targetUser);
        const clanName = String(clan.name || '').trim().toLowerCase();
        const clanAbbreviation = String(clan.abbreviation || '').trim().toLowerCase();
        const startingCount = targetProfile.clanInvitations.length;

        targetProfile.clanInvitations = targetProfile.clanInvitations.filter((invite) => {
            const inviteClanName = String(invite.clanName || '').trim().toLowerCase();
            const inviteClanAbbreviation = String(invite.clanAbbreviation || '').trim().toLowerCase();
            const sameClan = clanAbbreviation && inviteClanAbbreviation
                ? inviteClanName === clanName && inviteClanAbbreviation === clanAbbreviation
                : inviteClanName === clanName;
            return !sameClan;
        });

        if (targetProfile.clanInvitations.length === startingCount) {
            return res.status(404).json({ error: 'No active invitation found for that player.' });
        }

        await usersCollection.updateOne(
            { _id: targetUser._id },
            {
                $set: {
                    profile: targetProfile,
                },
            }
        );

        return res.json({ ok: true });
    } catch (error) {
        console.error('Clan invite retract error:', error);
        return res.status(500).json({ error: 'Unable to retract clan invitation.' });
    }
});

app.get('/api/clan/invitations', requireSession, async (req, res) => {
    try {
        const user = await usersCollection.findOne({ username: req.authUser.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const profile = normalizeUserProfile(user);
        const invitations = Array.isArray(profile.clanInvitations) ? profile.clanInvitations : [];
        if (!invitations.length) {
            return res.json({
                ok: true,
                invitations: [],
            });
        }

        const inviters = await usersCollection
            .find(
                { username: { $in: invitations.map((entry) => entry.invitedBy).filter(Boolean) } },
                {
                    projection: {
                        username: 1,
                        profile: 1,
                    },
                }
            )
            .toArray();
        const inviterMap = new Map(
            inviters.map((entry) => [String(entry.username || '').trim().toLowerCase(), normalizeUserProfile(entry)])
        );
        const validInvitations = invitations.filter((entry) => {
            const inviterProfile = inviterMap.get(String(entry.invitedBy || '').trim().toLowerCase());
            const inviterClan = inviterProfile && inviterProfile.clan ? inviterProfile.clan : null;
            if (!inviterClan || !inviterClan.name) {
                return false;
            }
            const sameClanName =
                String(inviterClan.name || '').trim().toLowerCase() === String(entry.clanName || '').trim().toLowerCase();
            if (!sameClanName) {
                return false;
            }
            if (entry.clanAbbreviation) {
                return (
                    String(inviterClan.abbreviation || '').trim().toLowerCase() ===
                    String(entry.clanAbbreviation || '').trim().toLowerCase()
                );
            }
            return true;
        });

        if (validInvitations.length !== invitations.length) {
            profile.clanInvitations = validInvitations;
            await usersCollection.updateOne(
                { _id: user._id },
                {
                    $set: {
                        profile,
                    },
                }
            );
        }

        return res.json({
            ok: true,
            invitations: validInvitations,
        });
    } catch (error) {
        console.error('Clan invitations lookup error:', error);
        return res.status(500).json({ error: 'Unable to load clan invitations.' });
    }
});

app.post('/api/clan/invitations/accept', requireSession, async (req, res) => {
    try {
        const { error: validationError, value } = clanInviteSchema.validate(req.body || {});
        if (validationError) {
            return res.status(400).json({ error: 'A valid clan name is required.' });
        }

        const user = await usersCollection.findOne({ username: req.authUser.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const profile = normalizeUserProfile(user);
        if (profile.clan && profile.clan.name) {
            return res.status(409).json({ error: 'You are already in a clan.' });
        }

        const requestedClanName = value.username.trim().toLowerCase();
        const invitation = (Array.isArray(profile.clanInvitations) ? profile.clanInvitations : []).find(
            (entry) => String(entry.clanName || '').trim().toLowerCase() === requestedClanName
        );
        if (!invitation) {
            return res.status(404).json({ error: 'Clan invitation not found.' });
        }

        const inviter = await usersCollection.findOne({ username: invitation.invitedBy });
        if (!inviter) {
            return res.status(404).json({ error: 'Inviting clan could not be found.' });
        }

        const inviterProfile = normalizeUserProfile(inviter);
        const inviterClan = inviterProfile.clan;
        if (!inviterClan || !inviterClan.name) {
            return res.status(404).json({ error: 'Inviting clan could not be found.' });
        }

        const sameClanName =
            String(inviterClan.name || '').trim().toLowerCase() === String(invitation.clanName || '').trim().toLowerCase();
        if (!sameClanName) {
            return res.status(409).json({ error: 'That invitation is no longer valid.' });
        }

        profile.clan = {
            name: inviterClan.name,
            abbreviation: inviterClan.abbreviation || '',
            rankKey: 'member',
            customRankName: '',
            rank: resolveBaseClanRankLabel('member'),
            avatarUrl: inviterClan.avatarUrl || '',
            joinedAt: new Date(),
            bio: inviterClan.bio || '',
            experiencePoints: Math.max(0, Number(inviterClan.experiencePoints) || 0),
            createdBy: inviterClan.createdBy || inviter.username,
            createdAt: inviterClan.createdAt || new Date(),
            customRankNames: normalizeClanRankNames(inviterClan.customRankNames),
        };
        profile.clanInvitations = (Array.isArray(profile.clanInvitations) ? profile.clanInvitations : []).filter(
            (entry) => String(entry.clanName || '').trim().toLowerCase() !== requestedClanName
        );

        await usersCollection.updateOne(
            { _id: user._id },
            {
                $set: {
                    profile,
                },
            }
        );

        const updatedUser = await usersCollection.findOne({ _id: user._id });
        return res.json({
            ok: true,
            user: serializeUserForClient(updatedUser),
        });
    } catch (error) {
        console.error('Clan invitation accept error:', error);
        return res.status(500).json({ error: 'Unable to accept clan invitation.' });
    }
});

app.get('/api/gauntlet/catalog', (req, res) => {
    return res.json({
        ok: true,
        relicScrolls: gauntlet.RELIC_SCROLLS,
        curses: gauntlet.CURSES,
        actOneEvents: gauntlet.ACT_ONE_EVENTS,
        actTwoEvents: gauntlet.ACT_TWO_EVENTS,
        enemyTeams: gauntlet.ENEMY_TEAMS,
    });
});

app.get('/api/gauntlet/map-preview', (req, res) => {
    const rawSeed = typeof req.query?.seed === 'string' ? req.query.seed.trim() : '';
    const rawStartingScroll =
        typeof req.query?.startingScrollType === 'string' ? req.query.startingScrollType.trim().toLowerCase() : '';
    const startingScrollType =
        rawStartingScroll === gauntlet.EXAM_SCROLL_TYPES.EARTH
            ? gauntlet.EXAM_SCROLL_TYPES.EARTH
            : gauntlet.EXAM_SCROLL_TYPES.HEAVEN;
    const seed = rawSeed || `preview-${Date.now()}`;
    const map = gauntlet.generateAct2Map({ seed, startingScrollType });

    return res.json({
        ok: true,
        map,
        invariants: {
            everyPathHasRestAndScrollSources: gauntlet
                .findAllPaths(map)
                .every((pathEntries) => gauntlet.pathHasRestAndScrollSource(pathEntries)),
        },
    });
});

app.post('/api/gauntlet/run/start', requireSession, async (req, res) => {
    try {
        const username = req.authUser.username;
        const { error: validationError, value } = gauntletRunStartSchema.validate(req.body || {});
        if (validationError) {
            return res.status(400).json({ error: 'A valid Gauntlet team is required.' });
        }
        if (userToMatch.has(username)) {
            return res.status(409).json({ error: 'Finish your current match before starting a Gauntlet run.' });
        }
        const existingMatch = await matchesCollection.findOne({
            'players.username': username,
            status: { $ne: 'ended' },
        });
        if (existingMatch) {
            return res.status(409).json({ error: 'Finish your current match before starting a Gauntlet run.' });
        }

        const user = await usersCollection.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const profile = normalizeUserProfile(user);
        const gauntletState = normalizeGauntletState(profile.gauntlet);
        if (gauntletState.activeRun?.status === 'active') {
            return res.status(409).json({ error: 'A Gauntlet run is already active.' });
        }

        const team = Array.isArray(value.team) ? value.team : Array.isArray(user.savedTeamIndices) ? user.savedTeamIndices : [];
        const { error: teamError } = teamSchema.validate(team);
        if (teamError) {
            return res.status(400).json({ error: 'Save or provide a full selected team before starting Gauntlet.' });
        }
        try {
            await assertTeamCanBeUsed(profile, team, user.role);
        } catch (error) {
            return res.status(403).json({ error: error.message || 'Your Gauntlet team contains a locked character.' });
        }

        const seed = value.seed || `gauntlet-${Date.now()}`;
        const map = gauntlet.generateAct2Map({ seed, startingScrollType: value.startingScrollType });
        const activeRun = {
            ...gauntlet.createInitialRunState({
                seed,
                team,
                startingScrollType: value.startingScrollType,
                map,
            }),
        };
        profile.gauntlet = normalizeGauntletState({
            ...gauntletState,
            activeRun,
        });
        const normalizedProfile = normalizeUserProfile({ ...user, profile });
        await usersCollection.updateOne(
            { _id: user._id },
            {
                $set: {
                    profile: normalizedProfile,
                },
            }
        );

        return res.status(201).json({
            ok: true,
            run: normalizedProfile.gauntlet.activeRun,
            actOneEvent: getGauntletActOneEventForRun(normalizedProfile.gauntlet.activeRun),
            reachableNodeIds: gauntlet.getReachableNodeIds(normalizedProfile.gauntlet.activeRun),
        });
    } catch (error) {
        console.error('Gauntlet run start error:', error);
        return res.status(500).json({ error: 'Unable to start Gauntlet run.' });
    }
});

app.get('/api/gauntlet/run', requireSession, async (req, res) => {
    try {
        const user = await usersCollection.findOne(
            { username: req.authUser.username },
            { projection: { _id: 1, username: 1, createdAt: 1, profile: 1 } }
        );
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const profile = normalizeUserProfile(user);
        const activeRun = normalizeGauntletState(profile.gauntlet).activeRun;
        return res.json({
            ok: true,
            run: activeRun,
            actOneEvent: activeRun ? getGauntletActOneEventForRun(activeRun) : null,
            reachableNodeIds: activeRun ? gauntlet.getReachableNodeIds(activeRun) : [],
        });
    } catch (error) {
        console.error('Gauntlet run load error:', error);
        return res.status(500).json({ error: 'Unable to load Gauntlet run.' });
    }
});

app.post('/api/gauntlet/run/abandon', requireSession, async (req, res) => {
    try {
        const user = await usersCollection.findOne({ username: req.authUser.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const profile = normalizeUserProfile(user);
        const gauntletState = normalizeGauntletState(profile.gauntlet);
        const activeRun = gauntletState.activeRun;
        if (!activeRun) {
            return res.json({ ok: true, run: null });
        }
        if (activeRun.pendingBattle?.matchId) {
            const match = await getMatchActive(activeRun.pendingBattle.matchId);
            if (match && match.status !== 'ended') {
                return res.status(409).json({ error: 'Surrender the active Gauntlet battle before abandoning the run.' });
            }
        }
        profile.gauntlet = normalizeGauntletState({
            ...gauntletState,
            activeRun: null,
            abandonedRuns: gauntletState.abandonedRuns + 1,
        });
        const normalizedProfile = normalizeUserProfile({ ...user, profile });
        await usersCollection.updateOne(
            { _id: user._id },
            {
                $set: {
                    profile: normalizedProfile,
                },
            }
        );
        return res.json({ ok: true, run: null });
    } catch (error) {
        console.error('Gauntlet run abandon error:', error);
        return res.status(500).json({ error: 'Unable to abandon Gauntlet run.' });
    }
});

app.post('/api/gauntlet/run/act1/choose', requireSession, async (req, res) => {
    try {
        const { error: validationError, value } = gauntletActOneChoiceSchema.validate(req.body || {});
        if (validationError) {
            return res.status(400).json({ error: 'A valid Written Test choice is required.' });
        }
        const user = await usersCollection.findOne({ username: req.authUser.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const profile = normalizeUserProfile(user);
        const gauntletState = normalizeGauntletState(profile.gauntlet);
        const activeRun = normalizeGauntletRunState(gauntletState.activeRun);
        if (!activeRun || activeRun.status !== 'active') {
            return res.status(400).json({ error: 'Start a Gauntlet run first.' });
        }
        if (activeRun.currentAct !== 1) {
            return res.status(409).json({ error: 'The Written Test is already complete.' });
        }
        let nextRun;
        try {
            nextRun = resolveGauntletActOneChoice(activeRun, value.choiceIndex);
        } catch (error) {
            return res.status(400).json({ error: error.message || 'A valid Written Test choice is required.' });
        }
        profile.gauntlet = normalizeGauntletState({
            ...gauntletState,
            activeRun: nextRun,
        });
        const normalizedProfile = normalizeUserProfile({ ...user, profile });
        await usersCollection.updateOne(
            { _id: user._id },
            {
                $set: {
                    profile: normalizedProfile,
                },
            }
        );
        const run = normalizedProfile.gauntlet.activeRun;
        return res.json({
            ok: true,
            run,
            actOneEvent: getGauntletActOneEventForRun(run),
            nodeResult: nextRun.lastNodeResult,
            reachableNodeIds: gauntlet.getReachableNodeIds(run),
        });
    } catch (error) {
        console.error('Gauntlet Act 1 choice error:', error);
        return res.status(500).json({ error: 'Unable to resolve Written Test choice.' });
    }
});

app.post('/api/gauntlet/run/offer/accept', requireSession, async (req, res) => {
    try {
        const { error: validationError, value } = gauntletOfferAcceptSchema.validate(req.body || {});
        if (validationError) {
            return res.status(400).json({ error: 'A valid Gauntlet offer is required.' });
        }
        const user = await usersCollection.findOne({ username: req.authUser.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const profile = normalizeUserProfile(user);
        const gauntletState = normalizeGauntletState(profile.gauntlet);
        const activeRun = normalizeGauntletRunState(gauntletState.activeRun);
        if (!activeRun || activeRun.status !== 'active') {
            return res.status(400).json({ error: 'Start a Gauntlet run first.' });
        }
        const offerIndex = (activeRun.pendingOffers || []).findIndex(
            (offer) => offer.type === value.offerType && offer.id === value.offerId
        );
        if (offerIndex < 0 || value.offerType !== 'curse' || !gauntlet.getCurseById(value.offerId)) {
            return res.status(404).json({ error: 'Gauntlet offer not found.' });
        }
        activeRun.pendingOffers.splice(offerIndex, 1);
        activeRun.relics = Array.from(new Set([...(activeRun.relics || []), value.offerId]));
        activeRun.lastNodeResult = {
            nodeId: activeRun.currentNodeId || null,
            nodeType: 'offer_accept',
            clearedAt: new Date(),
            reward: { relics: [value.offerId] },
        };
        profile.gauntlet = normalizeGauntletState({
            ...gauntletState,
            activeRun,
        });
        const normalizedProfile = normalizeUserProfile({ ...user, profile });
        await usersCollection.updateOne(
            { _id: user._id },
            {
                $set: {
                    profile: normalizedProfile,
                },
            }
        );
        return res.json({
            ok: true,
            run: normalizedProfile.gauntlet.activeRun,
            acceptedOffer: { type: value.offerType, id: value.offerId },
        });
    } catch (error) {
        console.error('Gauntlet offer accept error:', error);
        return res.status(500).json({ error: 'Unable to accept Gauntlet offer.' });
    }
});

app.post('/api/gauntlet/run/merchant/buy', requireSession, async (req, res) => {
    try {
        const { error: validationError, value } = gauntletMerchantBuySchema.validate(req.body || {});
        if (validationError) {
            return res.status(400).json({ error: 'A valid merchant item is required.' });
        }
        const user = await usersCollection.findOne({ username: req.authUser.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const profile = normalizeUserProfile(user);
        const gauntletState = normalizeGauntletState(profile.gauntlet);
        const activeRun = normalizeGauntletRunState(gauntletState.activeRun);
        if (!activeRun || activeRun.status !== 'active') {
            return res.status(400).json({ error: 'Start a Gauntlet run first.' });
        }
        const currentNode = gauntlet.getNodeById(activeRun.map, activeRun.currentNodeId);
        if (!currentNode || currentNode.type !== gauntlet.NODE_TYPES.MERCHANT) {
            return res.status(403).json({ error: 'You are not at a Merchant node.' });
        }
        const prices = {
            heaven_scroll: activeRun.relics.includes('scroll-hoarder') ? 70 : 100,
            earth_scroll: activeRun.relics.includes('scroll-hoarder') ? 70 : 100,
            heal: 55,
            random_relic: 120,
        };
        const price = prices[value.itemType];
        if ((Number(activeRun.ryo) || 0) < price) {
            return res.status(400).json({ error: 'Not enough Ryo.' });
        }
        activeRun.ryo -= price;
        const reward = {
            ryo: 0,
            scrollFragments: 0,
            heavenScrolls: value.itemType === 'heaven_scroll' ? 1 : 0,
            earthScrolls: value.itemType === 'earth_scroll' ? 1 : 0,
            relics: [],
        };
        if (value.itemType === 'heal') {
            activeRun.teamHp = activeRun.teamHp.map((hp) => Math.min(100, Math.max(1, Number(hp) || 1) + 30));
        }
        if (value.itemType === 'random_relic') {
            const rng = gauntlet.createSeededRng(`${activeRun.seed}:${activeRun.currentNodeId}:merchant:${activeRun.relics.length}`);
            const relic = pickGauntletRandomEntry(rng, gauntlet.RELIC_SCROLLS);
            if (relic?.id) reward.relics.push(relic.id);
        }
        addGauntletRewardToRun(activeRun, reward);
        activeRun.lastNodeResult = {
            nodeId: activeRun.currentNodeId,
            nodeType: 'merchant_purchase',
            clearedAt: new Date(),
            reward: { ...reward, ryo: -price, itemType: value.itemType },
        };
        profile.gauntlet = normalizeGauntletState({
            ...gauntletState,
            activeRun,
        });
        const normalizedProfile = normalizeUserProfile({ ...user, profile });
        await usersCollection.updateOne(
            { _id: user._id },
            {
                $set: {
                    profile: normalizedProfile,
                },
            }
        );
        return res.json({
            ok: true,
            run: normalizedProfile.gauntlet.activeRun,
            purchase: activeRun.lastNodeResult.reward,
        });
    } catch (error) {
        console.error('Gauntlet merchant purchase error:', error);
        return res.status(500).json({ error: 'Unable to complete merchant purchase.' });
    }
});

app.post('/api/gauntlet/run/fragments/forge', requireSession, async (req, res) => {
    try {
        const { error: validationError, value } = gauntletForgeScrollSchema.validate(req.body || {});
        if (validationError) {
            return res.status(400).json({ error: 'Choose a Heaven or Earth Scroll to forge.' });
        }
        const user = await usersCollection.findOne({ username: req.authUser.username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const profile = normalizeUserProfile(user);
        const gauntletState = normalizeGauntletState(profile.gauntlet);
        const activeRun = normalizeGauntletRunState(gauntletState.activeRun);
        if (!activeRun || activeRun.status !== 'active') {
            return res.status(400).json({ error: 'Start a Gauntlet run first.' });
        }
        const fragmentCount = Math.max(0, Math.round(Number(activeRun.scrollFragments) || 0));
        if (fragmentCount < 3) {
            return res.status(400).json({ error: 'You need 3 Scroll Fragments to forge an exam scroll.' });
        }
        activeRun.scrollFragments = fragmentCount - 3;
        if (value.scrollType === gauntlet.EXAM_SCROLL_TYPES.EARTH) {
            activeRun.earthScrolls = Math.max(0, Number(activeRun.earthScrolls) || 0) + 1;
        } else {
            activeRun.heavenScrolls = Math.max(0, Number(activeRun.heavenScrolls) || 0) + 1;
        }
        activeRun.lastNodeResult = {
            nodeId: activeRun.currentNodeId || null,
            nodeType: 'fragment_forge',
            clearedAt: new Date(),
            reward: {
                scrollFragments: -3,
                heavenScrolls: value.scrollType === gauntlet.EXAM_SCROLL_TYPES.HEAVEN ? 1 : 0,
                earthScrolls: value.scrollType === gauntlet.EXAM_SCROLL_TYPES.EARTH ? 1 : 0,
            },
        };
        profile.gauntlet = normalizeGauntletState({
            ...gauntletState,
            activeRun,
        });
        const normalizedProfile = normalizeUserProfile({ ...user, profile });
        await usersCollection.updateOne(
            { _id: user._id },
            {
                $set: {
                    profile: normalizedProfile,
                },
            }
        );
        const run = normalizedProfile.gauntlet.activeRun;
        return res.json({
            ok: true,
            run,
            nodeResult: activeRun.lastNodeResult,
            reachableNodeIds: gauntlet.getReachableNodeIds(run),
        });
    } catch (error) {
        console.error('Gauntlet fragment forge error:', error);
        return res.status(500).json({ error: 'Unable to forge an exam scroll.' });
    }
});

app.post('/api/gauntlet/run/node/enter', requireSession, async (req, res) => {
    try {
        const username = req.authUser.username;
        const { error: validationError, value } = gauntletNodeEnterSchema.validate(req.body || {});
        if (validationError) {
            return res.status(400).json({ error: 'A Gauntlet node is required.' });
        }
        const user = await usersCollection.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const profile = normalizeUserProfile(user);
        const gauntletState = normalizeGauntletState(profile.gauntlet);
        const activeRun = normalizeGauntletRunState(gauntletState.activeRun);
        if (!activeRun || activeRun.status !== 'active') {
            return res.status(400).json({ error: 'Start a Gauntlet run first.' });
        }
        if (activeRun.pendingBattle?.matchId) {
            return res.status(409).json({ error: 'Finish the current Gauntlet battle before entering another node.' });
        }
        const node = gauntlet.getNodeById(activeRun.map, value.nodeId);
        if (!node) {
            return res.status(404).json({ error: 'Gauntlet node not found.' });
        }
        const reachableNodeIds = gauntlet.getReachableNodeIds(activeRun);
        if (!reachableNodeIds.includes(node.id)) {
            return res.status(403).json({ error: 'That Gauntlet node is not reachable.' });
        }
        if (!gauntlet.canEnterNode(activeRun, node)) {
            return res.status(403).json({ error: 'You need both Heaven and Earth Scrolls to enter an exit node.' });
        }
        if (node.type === gauntlet.NODE_TYPES.EVENT) {
            const event = gauntlet.getEventById(node.content?.eventId);
            const choiceIndex = Number.isInteger(value.choiceIndex) ? value.choiceIndex : 0;
            if (!event || !Array.isArray(event.choices) || !event.choices[choiceIndex]) {
                return res.status(400).json({ error: 'A valid event choice is required.' });
            }
        }

        if (node.type === gauntlet.NODE_TYPES.BATTLE || node.type === gauntlet.NODE_TYPES.ELITE_BATTLE) {
            if (userToMatch.has(username)) {
                return res.status(409).json({ error: 'Finish your current match before entering a Gauntlet battle.' });
            }
            const existingMatch = await matchesCollection.findOne({
                'players.username': username,
                status: { $ne: 'ended' },
            });
            if (existingMatch) {
                return res.status(409).json({ error: 'Finish your current match before entering a Gauntlet battle.' });
            }
            const matchDocument = await buildGauntletBattleBotMatch({ username, runState: activeRun, node });
            activeRun.pendingBattle = { nodeId: node.id, matchId: matchDocument.matchId };
            activeRun.currentNodeId = node.id;
            profile.gauntlet = normalizeGauntletState({
                ...gauntletState,
                activeRun,
            });
            const normalizedProfile = normalizeUserProfile({ ...user, profile });
            await usersCollection.updateOne(
                { _id: user._id },
                {
                    $set: {
                        profile: normalizedProfile,
                    },
                }
            );
            userToMatch.set(username, {
                matchId: matchDocument.matchId,
                opponent: matchDocument.gauntletMatch?.enemyDisplayName || 'Forest Rival Team',
            });
            scheduleBattleBotTurn(matchDocument);
            return res.json({
                ok: true,
                battleStarted: true,
                run: normalizedProfile.gauntlet.activeRun,
                match: buildMatchPayloadForUser(matchDocument, username),
            });
        }

        const nextRun = applyGauntletNodeClearToRun(activeRun, node, {
            choiceIndex: Number.isInteger(value.choiceIndex) ? value.choiceIndex : 0,
        });
        profile.gauntlet = normalizeGauntletState({
            ...gauntletState,
            activeRun: nextRun.status === 'active' ? nextRun : null,
            completedRuns: gauntletState.completedRuns + (nextRun.status === 'won' ? 1 : 0),
            wins: gauntletState.wins + (nextRun.status === 'won' ? 1 : 0),
        });
        const normalizedProfile = normalizeUserProfile({ ...user, profile });
        await usersCollection.updateOne(
            { _id: user._id },
            {
                $set: {
                    profile: normalizedProfile,
                },
            }
        );
        const run = normalizedProfile.gauntlet.activeRun;
        return res.json({
            ok: true,
            battleStarted: false,
            run,
            nodeResult: nextRun.lastNodeResult,
            reachableNodeIds: run ? gauntlet.getReachableNodeIds(run) : [],
        });
    } catch (error) {
        console.error('Gauntlet node enter error:', error);
        return res.status(500).json({ error: 'Unable to enter Gauntlet node.' });
    }
});

// Basic static routes for the frontend
app.get(['/', '/selection-login', '/selection-login.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'selection-login.html'));
});

app.get(['/selection', '/selection.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'selection.html'));
});

app.get(['/ingame', '/ingame.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'ingame.html'));
});

app.get(['/admin', '/admin.html'], requireSession, async (req, res) => {
    if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
        return res.redirect('/');
    }
    return res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get(['/profile', '/profile.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'profile.html'));
});

app.get(['/changeavatar', '/changeavatar.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'changeavatar.html'));
});

app.get(['/resetaccount', '/resetaccount.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'resetaccount.html'));
});

app.get(['/changebackgrounds', '/changebackgrounds.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'changebackgrounds.html'));
});

app.get(['/clan-panel', '/clan panel.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'clan panel.html'));
});

app.get(['/editmission', '/editmission.html'], requireSession, async (req, res) => {
    if (String(req.authUser?.role || '').trim().toLowerCase() !== 'admin') {
        return res.redirect('/');
    }
    return res.sendFile(path.join(__dirname, 'editmission.html'));
});

const startServer = async () => {
    await initDb();

    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`Naruto-Arena API listening on http://localhost:${PORT}`);
    });
    attachWebSocketSupport(server);

    let httpsServer = null;
    if (HTTPS_KEY_PATH && HTTPS_CERT_PATH) {
        try {
            const key = fs.readFileSync(HTTPS_KEY_PATH);
            const cert = fs.readFileSync(HTTPS_CERT_PATH);
            httpsServer = https.createServer({ key, cert }, app);
            httpsServer.listen(PORT + 1, () =>
                console.log(`Naruto-Arena API (HTTPS) listening on https://localhost:${PORT + 1}`)
            );
            attachWebSocketSupport(httpsServer);
        } catch (error) {
            console.error('Failed to start HTTPS server:', error);
        }
    }

    if (!turnSweepTimer) {
        turnSweepTimer = setInterval(() => {
            sweepExpiredMatches().catch((error) => {
                console.error('Failed to sweep expired matches:', error);
            });
        }, 2000);
    }

    if (!sessionCacheSweepTimer) {
        sessionCacheSweepTimer = setInterval(() => {
            const now = Date.now();
            for (const [token, entry] of sessionUserCache) {
                if (entry.expiresAt <= now) {
                    sessionUserCache.delete(token);
                }
            }
        }, 60000);
    }

    process.on('SIGINT', async () => {
        if (turnSweepTimer) {
            clearInterval(turnSweepTimer);
            turnSweepTimer = null;
        }
        wsConnections.forEach((ws) => {
            try {
                ws.close();
            } catch (error) {
                // Ignore socket close failures.
            }
        });
        wsConnections.clear();
        if (mongoClient) {
            await mongoClient.close();
        }
        server.close(() => process.exit(0));
        if (httpsServer) {
            httpsServer.close(() => {});
        }
        try {
            wsServer.close();
        } catch (error) {
            // Ignore websocket server shutdown failures.
        }
    });
};

startServer().catch((error) => {
    console.error('Failed to initialize the server:', error);
    process.exit(1);
});
