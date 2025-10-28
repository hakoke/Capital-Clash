import express from 'express';
import pool from '../database/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Send chat message
router.post('/message', async (req, res) => {
  try {
    const { gameId, playerId, message, messageType = 'chat' } = req.body;

    // Get player info
    const playerResult = await pool.query(
      'SELECT name, company_name FROM players WHERE id = $1',
      [playerId]
    );

    const playerName = playerResult.rows[0]?.name || 'Unknown';
    const companyName = playerResult.rows[0]?.company_name || '';

    // Save message to database
    const messageId = uuidv4();
    await pool.query(
      'INSERT INTO chat_messages (id, game_id, player_id, message, message_type, created_at) VALUES ($1, $2, $3, $4, $5, $6)',
      [messageId, gameId, playerId, message, messageType, new Date()]
    );

    const messageRecord = {
      id: messageId,
      gameId,
      playerId,
      playerName,
      companyName,
      message,
      messageType, // 'chat', 'trade_request', 'action', etc.
      timestamp: new Date().toISOString()
    };

    // Broadcast to all players in game via WebSocket
    const io = req.app.get('io');
    if (io) {
      io.to(`game_${gameId}`).emit('chat_message', messageRecord);
    }

    res.json({ success: true, message: messageRecord });
  } catch (error) {
    console.error('Error sending chat:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get chat history
router.get('/:gameId/history', async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const result = await pool.query(
      `SELECT c.id, c.message, c.message_type, c.created_at, p.name as player_name, p.company_name
       FROM chat_messages c
       JOIN players p ON c.player_id = p.id
       WHERE c.game_id = $1
       ORDER BY c.created_at ASC
       LIMIT 100`,
      [gameId]
    );

    const messages = result.rows.map(row => ({
      playerName: row.player_name || 'Unknown',
      message: row.message,
      timestamp: row.created_at
    }));

    res.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

