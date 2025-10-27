import express from 'express';
import pool from '../database/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Send trade offer
router.post('/offer', async (req, res) => {
  try {
    const { gameId, fromPlayerId, toPlayerId, offerType, offerDetails, message } = req.body;

    const fromPlayer = await pool.query('SELECT * FROM players WHERE id = $1', [fromPlayerId]);
    if (fromPlayer.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'From player not found' });
    }

    const toPlayer = await pool.query('SELECT * FROM players WHERE id = $1', [toPlayerId]);
    if (toPlayer.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'To player not found' });
    }

    const tradeOffer = {
      id: uuidv4(),
      gameId,
      fromPlayerId,
      toPlayerId,
      fromPlayerName: fromPlayer.rows[0].name,
      toPlayerName: toPlayer.rows[0].name,
      offerType, // 'tile_trade', 'capital_trade', 'company_trade', 'action_trade'
      offerDetails,
      message,
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    // Save to database
    await pool.query(
      `INSERT INTO trade_offers (id, game_id, from_player_id, to_player_id, offer_type, offer_details, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [tradeOffer.id, gameId, fromPlayerId, toPlayerId, offerType, JSON.stringify(offerDetails), 'pending']
    );

    // Broadcast to target player
    const io = req.app.get('io');
    if (io) {
      io.to(`game_${gameId}`).emit('trade_offer', tradeOffer);
      io.to(`game_${gameId}`).emit('chat_message', {
        message: `${fromPlayer.rows[0].name} sent a trade offer to ${toPlayer.rows[0].name}`,
        messageType: 'trade_notification',
        timestamp: new Date().toISOString()
      });
    }

    res.json({ success: true, tradeOffer });
  } catch (error) {
    console.error('Error creating trade offer:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Accept/reject trade
router.post('/:tradeId/respond', async (req, res) => {
  try {
    const { tradeId } = req.params;
    const { accepted } = req.body;

    const tradeResult = await pool.query(
      'SELECT * FROM trade_offers WHERE id = $1',
      [tradeId]
    );

    if (tradeResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Trade not found' });
    }

    const trade = tradeResult.rows[0];

    if (accepted) {
      // Execute the trade
      const details = JSON.parse(trade.offer_details);

      // Example: Trade tiles
      if (details.wantTileId && details.giveTileId) {
        await pool.query(
          'UPDATE tiles SET owner_id = $1 WHERE id = $2',
          [trade.from_player_id, details.wantTileId]
        );
        await pool.query(
          'UPDATE tiles SET owner_id = $1 WHERE id = $2',
          [trade.to_player_id, details.giveTileId]
        );
      }

      // Example: Trade capital
      if (details.capitalAmount) {
        await pool.query(
          'UPDATE players SET capital = capital + $1 WHERE id = $2',
          [details.capitalAmount, trade.to_player_id]
        );
        await pool.query(
          'UPDATE players SET capital = capital - $1 WHERE id = $2',
          [details.capitalAmount, trade.from_player_id]
        );
      }

      await pool.query(
        'UPDATE trade_offers SET status = $1 WHERE id = $2',
        ['accepted', tradeId]
      );

      // Broadcast trade completion
      const io = req.app.get('io');
      if (io) {
        io.to(`game_${trade.game_id}`).emit('trade_completed', {
          tradeId,
          accepted: true,
          trade
        });
      }
    } else {
      await pool.query(
        'UPDATE trade_offers SET status = $1 WHERE id = $2',
        ['rejected', tradeId]
      );
    }

    res.json({ success: true, accepted });
  } catch (error) {
    console.error('Error responding to trade:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

