// Keep unfinished systems available for future work while blocking public access.
module.exports = function retiredFeatures(req, res, next) {
    if (/^\/(?:story|gacha)(?:\/|$)/.test(req.path)) {
        return res.status(404).json({ error: 'This feature is unavailable.' });
    }
    return next();
};
