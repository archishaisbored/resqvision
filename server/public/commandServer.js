const WebSocket = require('ws');
const PORT = 9000;

const wss = new WebSocket.Server({ port: PORT }, () => {
  console.log(`🛰️ WebSocket Server running at ws://localhost:${PORT}`);
});

const clients = new Set();

wss.on('connection', (ws) => {
  console.log('🤖 New robot or UI connected');
  clients.add(ws);

  ws.on('message', (message) => {
    console.log('📥 From robot:', message.toString());

    // Broadcast to all UIs
    for (const client of clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('❌ Connection closed');
  });

  ws.on('error', (err) => {
    console.error('🚨 WebSocket error:', err);
    clients.delete(ws);
  });
});
