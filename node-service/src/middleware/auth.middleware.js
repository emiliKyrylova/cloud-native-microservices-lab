const { verifyAccessToken } = require('../auth/jwt.service');

// Middleware 1: Перевірка валідності Access Token
function requireAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "unauthorized", message: "Missing or invalid token format" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
        return res.status(401).json({ error: "token_rejected", message: "Token is invalid or expired" });
    }

    req.user = decoded; // прокидаємо ідентичність у запит
    next();
}

// Middleware 2: Перевірка ролі (RBAC)
function requireRole(role) {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ error: "forbidden", message: "Insufficient permissions for this action" });
        }
        next();
    };
}

module.exports = { requireAuth, requireRole };