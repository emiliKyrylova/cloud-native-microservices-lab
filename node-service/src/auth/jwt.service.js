const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'default_access_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret';

function generateTokens(user) {
    const payload = {
        sub: user.id || user._id,
        role: user.role || 'user',
        iss: 'cloud-native-service'
    };

    // Access token — 15 хвилин
    const accessToken = jwt.sign(payload, JWT_SECRET, {
        expiresIn: '15m',
        algorithms: ['HS256'] // Захист від alg=none атак
    });

    // Refresh token — 7 днів
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: '7d',
        algorithms: ['HS256']
    });

    return { accessToken, refreshToken };
}

function verifyAccessToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    } catch (err) {
        return null;
    }
}

function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, JWT_REFRESH_SECRET, { algorithms: ['HS256'] });
    } catch (err) {
        return null;
    }
}

module.exports = { generateTokens, verifyAccessToken, verifyRefreshToken };