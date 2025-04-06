const { Server } = require("socket.io");
const http = require("http");

const PORT = process.env.PORT || 4000;
const HOST = "0.0.0.0"; // For Render and external access

// Render health check response
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("✅ Socket.IO server is running\n");
});

// Attach Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Track connected clients
const clients = new Map();

// WebSocket Event Handling
io.on("connection", (socket) => {
  console.log(`🤖 New client connected. Socket ID: ${socket.id}`);

  // Prevent multiple connections per client (FIX: Use socket.id instead of IP)
  if (clients.has(socket.id)) {
    console.log(`⚠️ Duplicate connection detected. Disconnecting old client.`);
    clients.get(socket.id).disconnect(); // Disconnect old instance
  }
  clients.set(socket.id, socket);

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected. Socket ID: ${socket.id}`);
    clients.delete(socket.id);
  });

  // Captioning event
  socket.on("caption", (data) => {
    console.log("📝 Caption:", data);
    socket.broadcast.emit("caption", data); // Emit only to others
  });

  // Website control actions
  socket.on("control", (data) => {
    console.log("🎮 Control:", data);
    socket.broadcast.emit("control", data);
  });

  // Assistant reply
  socket.on("assistant_reply", (data) => {
    console.log("🤖 Assistant Reply:", data);
    socket.broadcast.emit("assistant_reply", data);
  });

  // Robot wakeup trigger
  socket.on("robot_wakeup", (data) => {
    console.log("🤖 Robot wakeup received:", data);
    io.emit("robot_wakeup", data); // ✅ Sends to ALL connected clients
  });

  // Special command routing
  socket.on("special_command", (data) => {
    console.log("🧭 Special Command:", data);
    socket.broadcast.emit("special_command", data);
  });
});

// Start server
server.listen(PORT, HOST, () => {
  console.log(`✅ Socket.IO server running on http://${HOST}:${PORT}`);
});
