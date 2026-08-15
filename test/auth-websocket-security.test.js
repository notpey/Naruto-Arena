const { test } = require('node:test');
const assert = require('node:assert/strict');
const createBattleSocket = require('../sockets/battleSocket');

test('WebSocket authentication rejects unauthenticated connections without falling back to firstPlayer', async () => {
    let upgradeHandler = null;
    const fakeHttpServer = {
        on: (event, handler) => {
            if (event === 'upgrade') {
                upgradeHandler = handler;
            }
        }
    };

    const mockMatches = new Map();
    mockMatches.set('match-123', {
        matchId: 'match-123',
        status: 'active',
        players: [{ username: 'naruto' }, { username: 'sasuke' }]
    });

    const mockUserCache = new Map();
    mockUserCache.set('valid-token-naruto', { username: 'naruto' });
    mockUserCache.set('valid-token-intruder', { username: 'orochimaru' });

    const battleSocket = createBattleSocket({
        wsServer: { handleUpgrade: () => {}, on: () => {} },
        parseCookieHeader: (cookieStr) => {
            const match = /naruto_session=([^;]+)/.exec(cookieStr || '');
            return match ? { naruto_session: match[1] } : {};
        },
        SESSION_COOKIE_NAME: 'naruto_session',
        getSessionUserFromToken: async (token) => mockUserCache.get(token) || null,
        getMatchRoom: () => new Set(),
        wsConnections: new Map(),
        removeSocketFromRoom: () => {},
        hydrateMatchForBroadcast: async (m) => m,
        buildMatchPayloadForUser: () => ({}),
        sendJsonToSocket: () => {},
        battleLogic: {},
        getCharactersData: () => [],
        matchesCollection: {
            findOne: async (query) => mockMatches.get(query?.matchId) || null
        }
    });

    battleSocket.attachWebSocketSupport(fakeHttpServer);

    assert.equal(typeof upgradeHandler, 'function', 'Upgrade handler must be registered');

    // Test 1: Missing authentication token
    let socketDestroyed1 = false;
    let writeStatus1 = '';
    const fakeSocket1 = {
        write: (msg) => { writeStatus1 = msg; },
        destroy: () => { socketDestroyed1 = true; }
    };
    const reqWithoutAuth = {
        url: '/ws?matchId=match-123',
        headers: { host: 'localhost', cookie: '' }
    };

    await upgradeHandler(reqWithoutAuth, fakeSocket1, Buffer.alloc(0));
    assert.ok(socketDestroyed1, 'Socket 1 must be destroyed on missing auth');
    assert.ok(writeStatus1.includes('401'), 'Must return 401 Unauthorized');

    // Test 2: Token for a user who is NOT a player in this match
    let socketDestroyed2 = false;
    let writeStatus2 = '';
    const fakeSocket2 = {
        write: (msg) => { writeStatus2 = msg; },
        destroy: () => { socketDestroyed2 = true; }
    };
    const reqIntruder = {
        url: '/ws?matchId=match-123',
        headers: { host: 'localhost', cookie: 'naruto_session=valid-token-intruder' }
    };

    await upgradeHandler(reqIntruder, fakeSocket2, Buffer.alloc(0));
    assert.ok(socketDestroyed2, 'Socket 2 must be destroyed for intruder');
    assert.ok(writeStatus2.includes('403'), 'Must return 403 Forbidden for non-participant');

    // Test 3: Non-existent match
    let socketDestroyed3 = false;
    let writeStatus3 = '';
    const fakeSocket3 = {
        write: (msg) => { writeStatus3 = msg; },
        destroy: () => { socketDestroyed3 = true; }
    };
    const reqInvalidMatch = {
        url: '/ws?matchId=match-999',
        headers: { host: 'localhost', cookie: 'naruto_session=valid-token-naruto' }
    };

    await upgradeHandler(reqInvalidMatch, fakeSocket3, Buffer.alloc(0));
    assert.ok(socketDestroyed3, 'Socket 3 must be destroyed for invalid match');
});
