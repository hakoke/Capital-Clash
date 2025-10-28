import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pool from './database/index.js';
import gameRoutes from './routes/game.js';
import playerRoutes from './routes/player.js';
import aiRoutes from './routes/ai.js';
import playerActionsRoutes from './routes/player-actions.js';
import chatRoutes from './routes/chat.js';
import tradingRoutes from './routes/trading.js';
import auctionRoutes from './routes/auction.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Run database migrations on startup
async function runMigrations() {
  try {
    const migrationPath = path.join(__dirname, 'database', 'migrations.sql');
    if (fs.existsSync(migrationPath)) {
      const migration = fs.readFileSync(migrationPath, 'utf8');
      await pool.query(migration);
      console.log('✅ Database migrations completed');
    }
  } catch (error) {
    console.error('⚠️ Migration error (non-critical):', error.message);
  }
}

runMigrations();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/game', gameRoutes);
app.use('/api/player', playerRoutes);
app.use('/api/player-actions', playerActionsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auction', auctionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Serve static files from frontend/dist (for Railway deployment)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// All other routes go to React app (must be last)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Handle game room joining
  socket.on('join_game', (gameId) => {
    socket.join(`game_${gameId}`);
    console.log(`Socket ${socket.id} joined game ${gameId}`);
    
    // Notify others in the room
    socket.to(`game_${gameId}`).emit('player_joined', {
      playerId: socket.id,
      timestamp: new Date().toISOString()
    });
  });

  // Handle game room leaving
  socket.on('leave_game', (gameId) => {
    socket.leave(`game_${gameId}`);
    console.log(`Socket ${socket.id} left game ${gameId}`);
  });

  // Handle player actions
  socket.on('player_action', (data) => {
    const { gameId, action, details } = data;
    // Broadcast to other players in the same game
    socket.to(`game_${gameId}`).emit('player_action_received', {
      playerId: socket.id,
      action,
      details,
      timestamp: new Date().toISOString()
    });
  });

  // Handle chat messages
  socket.on('chat_message', (data) => {
    const { gameId, message } = data;
    // Broadcast to all players in the same game
    socket.to(`game_${gameId}`).emit('chat_message_received', {
      playerId: socket.id,
      message,
      timestamp: new Date().toISOString()
    });
  });

  // Handle trade offers
  socket.on('trade_offer', (data) => {
    const { gameId, offer } = data;
    // Broadcast trade offer to target player
    socket.to(`game_${gameId}`).emit('trade_offer_received', {
      playerId: socket.id,
      offer,
      timestamp: new Date().toISOString()
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Make io accessible to routes
app.set('io', io);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io enabled`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

export default httpServer;
