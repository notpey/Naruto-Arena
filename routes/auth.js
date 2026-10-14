const express = require('express');
const bcrypt = require('bcryptjs');

module.exports = function(context) {
    const router = express.Router();
    
    const {
        loginLimiter,
        registerLimiter,
        loginSchema,
        registerSchema,
        usersCollection,
        normalizeUserProfile,
        buildDefaultUserProfile,
        recalculatePlayerLadderStandings,
        signSession,
        setSessionCookie,
        clearSessionCookie,
        serializeUserForClient,
        sessionUserCache,
        SESSION_COOKIE_NAME
    } = context;

    router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

    router.post('/login', loginLimiter, async (req, res) => {
        try {
            const { error: validationError, value } = loginSchema.validate(req.body || {});
            if (validationError) {
                return res.status(401).json({ error: 'Wrong username or password.' });
            }
            const { username, password } = value;
    
            const user = await usersCollection.findOne({ usernameLower: username.toLowerCase() });
            if (!user) {
                return res.status(401).json({ error: 'Wrong username or password.' });
            }
    
            const isMatch = await bcrypt.compare(password, user.passwordHash || '');
            if (!isMatch) {
                return res.status(401).json({ error: 'Wrong username or password.' });
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
    
            const token = signSession(hydratedUser);
            setSessionCookie(res, token);
    
            return res.json({
                ok: true,
                user: serializeUserForClient(hydratedUser),
            });
        } catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({ error: 'Internal server error.' });
        }
    });
    
    router.post('/logout', (req, res) => {
        const token = req.cookies?.[SESSION_COOKIE_NAME];
        if (token) {
            sessionUserCache.delete(token);
        }
        clearSessionCookie(res);
        res.json({ ok: true });
    });
    
    router.post('/register', registerLimiter, async (req, res) => {
        try {
            const { error: validationError, value } = registerSchema.validate(req.body || {});
            if (validationError) {
                return res.status(400).json({ error: 'Invalid registration details.' });
            }
    
            const { username, password, confirmPassword, email } = value;
            if (password !== confirmPassword) {
                return res.status(400).json({ error: 'Passwords do not match.' });
            }
    
            const [existingUsername, existingEmail] = await Promise.all([
                usersCollection.findOne({ usernameLower: username.toLowerCase() }),
                usersCollection.findOne({ email }),
            ]);
    
            if (existingUsername) {
                return res.status(409).json({ error: 'Username is already taken.' });
            }
    
            if (existingEmail) {
                return res.status(409).json({ error: 'Email is already in use.' });
            }
    
            const passwordHash = await bcrypt.hash(password, 10);
            const createdAt = new Date();
            const profile = buildDefaultUserProfile({ createdAt });
            const newUser = {
                username,
                usernameLower: username.toLowerCase(),
                email,
                passwordHash,
                role: 'player',
                createdAt,
                savedTeamIndices: [],
                profile,
            };
    
            const result = await usersCollection.insertOne(newUser);
            const token = signSession({ ...newUser, _id: result.insertedId });
            setSessionCookie(res, token);
            // Account creation has succeeded; a standings refresh must not report it as a failed registration.
            await recalculatePlayerLadderStandings().catch(error => console.error('Registration standings refresh failed:', error.name));
            const createdUser = await usersCollection.findOne({ _id: result.insertedId });
    
            return res.status(201).json({
                ok: true,
                user: serializeUserForClient(createdUser || newUser),
            });
        } catch (error) {
            if (error?.code === 11000) {
                const field = error?.keyPattern?.email ? 'Email' : 'Username';
                return res.status(409).json({ error: `${field} is already in use.` });
            }
            console.error('Registration error:', error);
            return res.status(500).json({ error: 'Internal server error.' });
        }
    });

    return router;
};
