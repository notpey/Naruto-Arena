module.exports = function(context) {
    const {
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
        getCharactersData
    } = context;

    const attachWebSocketSupport = (server) => {
        if (!server || typeof server.on !== 'function') return;
        server.on('upgrade', async (req, socket, head) => {
            try {
                const requestUrl = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
                if (requestUrl.pathname !== '/ws') {
                    socket.destroy();
                    return;
                }
                const matchId = String(requestUrl.searchParams.get('matchId') || '').trim();
                if (!matchId) {
                    socket.destroy();
                    return;
                }
                const cookies = parseCookieHeader(req.headers.cookie || '');
                const authHeader = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '').trim();
                const queryToken = (requestUrl.searchParams.get('token') || '').trim();
                const token = cookies[SESSION_COOKIE_NAME] || authHeader || queryToken;
                const authUser = await getSessionUserFromToken(token);
                if (!authUser?.username) {
                    socket.destroy();
                    return;
                }
                const match = await matchesCollection.findOne({ matchId });
                if (!match || !Array.isArray(match.players)) {
                    socket.destroy();
                    return;
                }
                const playerEntry = match.players.find((player) => player?.username === authUser.username);
                if (!playerEntry) {
                    socket.destroy();
                    return;
                }
                wsServer.handleUpgrade(req, socket, head, (ws) => {
                    ws.matchId = matchId;
                    ws.username = authUser.username;
                    ws.authUser = authUser;
                    const room = getMatchRoom(matchId);
                    room.add(ws);
                    wsConnections.add(ws);
                    ws.on('close', () => {
                        wsConnections.delete(ws);
                        removeSocketFromRoom(ws);
                    });
                    ws.on('error', () => {
                        wsConnections.delete(ws);
                        removeSocketFromRoom(ws);
                    });
                    wsServer.emit('connection', ws, req);
                });
            } catch (error) {
                socket.destroy();
            }
        });
    };

    const heartbeatInterval = setInterval(() => {
        wsServer.clients.forEach((ws) => {
            if (ws.isAlive === false) return ws.terminate();
            ws.isAlive = false;
            ws.ping();
        });
    }, 30000);

    wsServer.on('close', () => {
        clearInterval(heartbeatInterval);
    });

    wsServer.on('connection', async (ws) => {
        ws.isAlive = true;
        ws.on('pong', () => { ws.isAlive = true; });
        if (!ws?.matchId || !ws?.username) {
            try {
                ws.close();
            } catch (error) {
                // Ignore close failures.
            }
            return;
        }
        try {
            const hydrated = await hydrateMatchForBroadcast(ws.matchId);
            if (!hydrated) {
                ws.close();
                return;
            }
            const payload = buildMatchPayloadForUser(hydrated, ws.username);
            if (payload) {
                sendJsonToSocket(ws, { type: 'match_state', payload });
            }
            
            ws.on('message', async (message) => {
                try {
                    const data = JSON.parse(message);
                    if (data.type === 'skill_targets') {
                        // Look up match in active DB or cache
                        const match = await matchesCollection.findOne({ matchId: data.matchId });
                        if (!match || match.status === 'ended') return;
                        
                        const options = battleLogic.computeTargetOptions({
                            match,
                            actingUsername: data.actingUsername,
                            actorSlot: data.actorSlot,
                            skillIndex: data.skillIndex,
                            characters: getCharactersData()
                        });
                        
                        sendJsonToSocket(ws, {
                            type: 'skill_targets_response',
                            reqId: data.reqId,
                            payload: options
                        });
                    }
                } catch(e) {
                    // ignore bad messages
                }
            });
            
        } catch (error) {
            try {
                ws.close();
            } catch (closeError) {
                // Ignore close failures.
            }
        }
    });

    return { attachWebSocketSupport };
};
