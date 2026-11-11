const pino = require('pino');
const crypto = require('crypto');

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    redact: ['req.headers.authorization', '*.password', 'password_hash'],
});

const requestLogger = (req, res, next) => {
    req.id = crypto.randomUUID();
    req.log = logger.child({ reqId: req.id, service: 'node-api' });

    const start = Date.now();
    req.log.info({ method: req.method, url: req.originalUrl }, 'request in');

    res.on('finish', () => {
        const duration = Date.now() - start;
        req.log.info({ status: res.statusCode, durationMs: duration }, 'request completed');
    });

    next();
};

module.exports = requestLogger;