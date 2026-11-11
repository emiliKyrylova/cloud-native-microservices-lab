const express = require('express');
const http = require('http');
const path = require('path');
const helmet = require('helmet');

const gadgetRoutes = require('./routes/gadget.routes');
const userRoutes = require('./routes/user.routes');
const accountRoutes = require('./routes/account.routes');
const eventRoutes = require('./routes/event.routes');
const authRoutes = require('./routes/auth.routes');

const requestLogger = require('./middleware/logger.middleware');
const errorHandler = require('./middleware/error.middleware');
const { requireAuth, requireRole } = require('./middleware/auth.middleware');

const wsManager = require('./websocket/ws.server');
const streamService = require('./services/stream.service');
const { register } = require('./metrics');

const app = express();
const server = http.createServer(app);

// Ініціалізація WebSocket на базі HTTP сервера
wsManager.init(server);

// Безпека Helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            frameAncestors: ["'none'"],
        },
    },
    frameguard: { action: 'deny' },
    hsts: { maxAge: 31536000, includeSubDomains: true },
    referrerPolicy: { policy: 'no-referrer' },
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(requestLogger);

// Броньоване підключення роутів (гарантовано не впаде з TypeError)
const safeUse = (path, route) => {
    if (route && (typeof route === 'function' || (route.stack && Array.isArray(route.stack)))) {
        app.use(path, route);
    } else {
        console.warn(`⚠️ Попередження: роут для ${path} не є валідним мідлваром`);
    }
};

console.log("Loading userRoutes:", typeof userRoutes);
app.use('/', userRoutes);

console.log("Loading accountRoutes:", typeof accountRoutes);
app.use('/', accountRoutes);

console.log("Loading eventRoutes:", typeof eventRoutes);
app.use('/', eventRoutes);

console.log("Loading authRoutes:", typeof authRoutes);
app.use('/', authRoutes);

console.log("Loading gadgetRoutes:", typeof gadgetRoutes);
app.use('/', gadgetRoutes);

// Ендпойнт для потокової обробки файлу та стрімінгу прогресу через WebSocket
app.post('/api/stream/process', async (req, res, next) => {
    try {
        const inputFilePath = path.join(__dirname, '../test-input.txt');
        const outputFilePath = path.join(__dirname, '../test-output.txt');

        streamService.generateTestFile(inputFilePath, 15);
        res.status(200).json({ message: "Stream processing started", status: "processing" });

        streamService.processFileStream(inputFilePath, outputFilePath, false, (progressData) => {
            wsManager.broadcast(progressData);
        }).then(() => {
            console.log("✨ Потокова обробка файлу успішно завершена!");
        }).catch((err) => {
            console.error("⚠️ Помилка під час стрімінгу:", err);
        });
    } catch (err) {
        if (!res.headersSent) {
            next(err);
        }
    }
});

// Захищені роути
app.get('/api/secure-data', requireAuth, (req, res) => {
    res.json({ message: "This is secret data", user: req.user });
});

app.delete('/api/admin/system', requireAuth, requireRole('admin'), (req, res) => {
    res.json({ message: "System wiped by admin" });
});

// Метрики Prometheus
app.get('/metrics', async (req, res) => {
    res.setHeader('Content-Type', register.contentType);
    res.send(await register.metrics());
});

// Централізована обробка помилок
app.use(errorHandler);

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Server with Streams & WebSockets is running on http://localhost:${PORT}`);
});

module.exports = app;