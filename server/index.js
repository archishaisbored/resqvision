const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3002;

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// WebSocket + ffmpeg
wss.on('connection', (ws) => {
  console.log('Client connected via WebSocket');

const ffmpeg = spawn('ffmpeg', [
  '-f', 'avfoundation',      // macOS-specific
  '-framerate', '30',
  '-i', '0',                 // first available camera input
  '-f', 'mjpeg',
  '-s', '640x480',
  '-q:v', '5',
  '-an',
  '-f', 'mjpeg',
  'pipe:1'
]);


  ffmpeg.stdout.on('data', (data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  });

  ffmpeg.stderr.on('data', (data) => {
    console.error('ffmpeg error:', data.toString());
  });

  ws.on('close', () => {
    console.log('WebSocket closed');
    ffmpeg.kill();
  });

  ws.on('error', (err) => console.error('WebSocket error:', err));
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
