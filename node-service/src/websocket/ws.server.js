const WebSocket = require('ws');
const { verifyAccessToken } = require('../auth/jwt.service');

class WebSocketServerManager {
    constructor() {
        this.wss = null;
        this.clients = new Map();
    }

    init(server) {
        this.wss = new WebSocket.Server({ server });

        this.wss.on('connection', (ws, req) => {
            // Витягуємо токен з URL: ws://localhost:3000/ws?token=JWT_TOKEN
            const urlParams = new URLSearchParams(req.url.replace('/?', ''));
            const token = urlParams.get('token');

            // Верифікація токена до реєстрації в Hub
            const decoded = verifyAccessToken(token);
            if (!decoded) {
                console.warn("⚠️ WebSocket connection rejected: Invalid or missing token");
                ws.close(1008, "Unauthorized"); // 1008 Policy Violation
                return;
            }

            const clientId = decoded.sub;
            const clientInfo = {
                clientId,
                role: decoded.role,
                connectedAt: new Date(),
                state: 'AUTHENTICATED'
            };

            this.clients.set(ws, clientInfo);
            console.log(`🔌 Захищений WS клієнт підключився [ID: ${clientId}, Role: ${decoded.role}]`);

            ws.send(JSON.stringify({ type: 'system', message: `Authenticated successfully as ${decoded.role}` }));

            ws.on('message', (message) => {
                try {
                    const data = JSON.parse(message);
                    this.handleMessage(ws, data);
                } catch (e) {
                    ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON format' }));
                }
            });

            ws.on('close', () => {
                console.log(`❌ Клієнт відключився [ID: ${clientId}]`);
                this.clients.delete(ws);
            });
        });
    }

    handleMessage(senderWs, data) {
        const clientInfo = this.clients.get(senderWs);
        if (!clientInfo) return;

        if (data.type === 'message') {
            this.broadcast({
                type: 'broadcast',
                from: clientInfo.clientId,
                text: data.text
            });
        }
    }

    broadcast(data) {
        const payload = JSON.stringify(data);
        this.clients.forEach((info, ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(payload);
            }
        });
    }
}

module.exports = new WebSocketServerManager();