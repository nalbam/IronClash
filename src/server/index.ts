import 'dotenv/config';
import { Server, matchMaker } from 'colyseus';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { readFileSync } from 'fs';
import { join } from 'path';
import { GameRoom } from './rooms/GameRoom';

// Read version from package.json
let SERVER_VERSION = '0.0.0';
try {
  const packageJson = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf-8'));
  SERVER_VERSION = packageJson.version || '0.0.0';
} catch {
  console.warn('Could not read package.json for version');
}

const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security: Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for game assets
  crossOriginEmbedderPolicy: false,
}));

// Security: CORS - restrict to allowed origins
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [
  'http://localhost:8080',
  'http://localhost:2567'
];
console.log('ALLOWED_ORIGINS:', ALLOWED_ORIGINS);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.) in development
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS rejected origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Security: Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 300, // Dev: 300, Prod: 100
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const roomCreateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 room creates per minute
  message: { error: 'Too many room creation requests' },
});

app.use('/api', apiLimiter);
app.use(express.json({ limit: '10kb' })); // Limit payload size
app.use(express.static('public'));

const server = createServer(app);

const gameServer = new Server({
  server: server,
});

// Register room handlers
gameServer.define('game_room', GameRoom);

// REST API: Get list of available rooms
app.get('/api/rooms', async (req, res) => {
  try {
    const rooms = await matchMaker.query({ name: 'game_room' });
    const roomList = rooms.map(room => ({
      roomId: room.roomId,
      playerCount: room.clients,
      maxPlayers: 6,
      phase: room.metadata?.phase || 'waiting'
    }));
    res.json(roomList);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// REST API: Create a new room (with stricter rate limit)
app.post('/api/rooms', roomCreateLimiter, async (req, res) => {
  try {
    const room = await matchMaker.createRoom('game_room', {});
    res.json({
      roomId: room.roomId,
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// REST API: Get server version
app.get('/api/version', (req, res) => {
  res.json({ version: SERVER_VERSION });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

const port = Number(process.env.PORT || 2567);
gameServer.listen(port);

console.log(`⚔️  IronClash Server v${SERVER_VERSION} listening on http://localhost:${port}`);
