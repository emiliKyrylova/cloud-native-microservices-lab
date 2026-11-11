const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 хвилина
    max: 5, // Не більше 5 спроб за хвилину з однієї IP
    message: { error: "too_many_requests", message: "Too many login attempts, please try again after a minute" },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { loginLimiter };