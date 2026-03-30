import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { getDb } from './db.js';
import routes from './routes.js';
import { handleVoiceWebSocket } from './geminiLive.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

// Initialise database (creates tables + seed data on first run)
getDb();
console.log('Database initialised.');

// Create HTTP server (needed for WebSocket upgrade)
const server = createServer(app);

// ─── WebSocket server for voice simulation ───
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url || '', `http://${request.headers.host}`);

  // Only handle /ws/voice path
  if (url.pathname !== '/ws/voice') {
    socket.destroy();
    return;
  }

  const sessionId = url.searchParams.get('session_id');
  if (!sessionId) {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(request, socket, head, (ws) => {
    console.log(`[WS] Voice WebSocket connected for session ${sessionId}`);
    handleVoiceWebSocket(ws, sessionId);
  });
});

server.listen(PORT, () => {
  console.log(`Voice simulation server running on http://localhost:${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws/voice`);
});
