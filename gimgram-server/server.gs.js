const WebSocket = require('ws');
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('GimGram Server is Online! 🐢');
});
const wss = new WebSocket.Server({ server });
const clients = new Map();
wss.on('connection', (ws) => {
    let userNick = null;
    ws.on('message', (data) => {
        try {
            const payload = JSON.parse(data);
            if (payload.type === 'REGISTER') {
                userNick = payload.nick;
                clients.set(userNick, ws);
            }
            if (payload.type === 'MESSAGE') {
                const targetWs = clients.get(payload.to);
                if (targetWs && targetWs.readyState === WebSocket.OPEN) {
                    targetWs.send(JSON.stringify({
                        type: 'INCOMING_MESSAGE',
                        from: payload.from,
                        message: payload.message
                    }));
                }
            }
        } catch (e) {}
    });
    ws.on('close', () => { if (userNick) clients.delete(userNick); });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT);