// Retired player features stay unavailable even through old links or API calls.
module.exports = function retiredFeatures(req, res, next) {
    if (/^\/(?:story|gacha|gauntlet)(?:\/|$)/.test(req.path)) {
        return res.status(404).json({ error: 'This feature is unavailable.' });
    }
    return next();
};
