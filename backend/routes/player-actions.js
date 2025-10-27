import express from 'express';
import pool from '../database/index.js';
import aiService from '../services/aiService.js';

const router = express.Router();

// Player creates a custom action (like visiting a place, creating scandal, etc.)
router.post('/:playerId/custom-action', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { actionType, actionDescription, targetPlayerId, details } = req.body;

    // Get player info
    const playerResult = await pool.query(
      'SELECT game_id, name, company_name FROM players WHERE id = $1',
      [playerId]
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Player not found' });
    }

    const player = playerResult.rows[0];

    // Get target player if specified
    let targetPlayer = null;
    if (targetPlayerId) {
      const targetResult = await pool.query(
        'SELECT * FROM players WHERE id = $1 AND game_id = $2',
        [targetPlayerId, player.game_id]
      );
      if (targetResult.rows.length > 0) {
        targetPlayer = targetResult.rows[0];
      }
    }

    // Create custom action record
    const actionRecord = {
      playerId,
      playerName: player.name,
      actionType,
      actionDescription,
      targetPlayerId,
      targetPlayerName: targetPlayer?.name,
      details,
      timestamp: new Date().toISOString()
    };

    // Save to database
    await pool.query(
      `INSERT INTO player_actions (id, game_id, player_id, round_number, action_type, details)
       VALUES (uuid_generate_v4(), $1, $2, (SELECT current_round FROM games WHERE id = $1), $3, $4)`,
      [player.game_id, playerId, actionType, JSON.stringify(actionRecord)]
    );

    // Generate AI response to this action
    const aiResponse = await aiService.generateCustomEventResponse(actionRecord, player, targetPlayer);

    // Broadcast to all players
    const io = req.app.get('io');
    if (io) {
      io.to(`game_${player.game_id}`).emit('player_custom_action', {
        action: actionRecord,
        aiResponse,
        timestamp: new Date().toISOString()
      });
    }

    res.json({ 
      success: true, 
      action: actionRecord,
      aiResponse 
    });
  } catch (error) {
    console.error('Error creating custom action:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Player visits/interacts with another player's establishment
router.post('/:playerId/visit', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { targetPlayerId, placeType, visitDescription } = req.body;

    // Create visit action
    return router.post(`/${playerId}/custom-action`)(req, res, () => {});
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Player creates a scandal/targets another player
router.post('/:playerId/create-scandal', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { targetPlayerId, scandalType, scandalDetails } = req.body;

    // Create scandal action
    const actionDescription = `Creating ${scandalType} scandal involving another player`;
    
    req.body.actionType = 'create_scandal';
    req.body.actionDescription = actionDescription;
    
    return router.post(`/${playerId}/custom-action`)(req, res, () => {});
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

