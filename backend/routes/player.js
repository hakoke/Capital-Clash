import express from 'express';
import pool from '../database/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Join a game as a player
router.post('/join', async (req, res) => {
  try {
    const { gameId, playerName, color } = req.body;
    
    const playerId = uuidv4();

    // Get current player count
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM players WHERE game_id = $1',
      [gameId]
    );
    const order = parseInt(countResult.rows[0].count) + 1;

    // Check max players
    const maxPlayers = 6;
    if (order > maxPlayers) {
      return res.status(400).json({
        success: false,
        error: `Maximum ${maxPlayers} players allowed`
      });
    }

    // Check if color is already taken
    const colorCheck = await pool.query(
      'SELECT COUNT(*) as count FROM players WHERE game_id = $1 AND color = $2',
      [gameId, color]
    );
    
    if (parseInt(colorCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: 'Color already taken'
      });
    }

    // Create player with Monopoly starting money
    const result = await pool.query(
      `INSERT INTO players (id, game_id, name, color, money, order_in_game, position, can_roll)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [playerId, gameId, playerName || 'Player ' + order, color, 1500.00, order, 0, false]
    );

    res.json({ success: true, player: result.rows[0] });
  } catch (error) {
    console.error('Error joining game:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get player details
router.get('/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;

    const result = await pool.query(
      'SELECT * FROM players WHERE id = $1',
      [playerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Player not found' });
    }

    res.json({ success: true, player: result.rows[0] });
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get player's properties
router.get('/:playerId/properties', async (req, res) => {
  try {
    const { playerId } = req.params;

    // Get properties
    const propertiesResult = await pool.query(
      'SELECT * FROM properties WHERE owner_id = $1 ORDER BY position',
      [playerId]
    );

    res.json({
      success: true,
      properties: propertiesResult.rows
    });
  } catch (error) {
    console.error('Error fetching player properties:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Buy a property
router.post('/:playerId/buy-property', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { propertyId } = req.body;

    // Get player info
    const playerResult = await pool.query(
      'SELECT * FROM players WHERE id = $1',
      [playerId]
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Player not found' });
    }

    const player = playerResult.rows[0];

    // Get property info
    const propertyResult = await pool.query(
      'SELECT * FROM properties WHERE id = $1',
      [propertyId]
    );

    if (propertyResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    const property = propertyResult.rows[0];

    // Check if already owned
    if (property.owner_id) {
      return res.status(400).json({ success: false, error: 'Property already owned' });
    }

    // Check if property is purchasable
    if (property.property_type === 'special' || property.property_type === 'chance' || 
        property.property_type === 'community_chest' || property.property_type === 'tax' ||
        property.property_type === 'jail' || property.property_type === 'free_parking' ||
        property.property_type === 'go_to_jail') {
      return res.status(400).json({ success: false, error: 'Cannot buy this property' });
    }

    // Check if player has enough money
    if (parseFloat(player.money) < parseFloat(property.price)) {
      return res.status(400).json({ success: false, error: 'Insufficient funds' });
    }

    // Update property ownership
    await pool.query(
      'UPDATE properties SET owner_id = $1 WHERE id = $2',
      [playerId, propertyId]
    );

    // Deduct money
    await pool.query(
      'UPDATE players SET money = money - $1 WHERE id = $2',
      [property.price, playerId]
    );

    // Record action
    await pool.query(
      `INSERT INTO player_actions (id, game_id, player_id, action_type, details)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4)`,
      [property.game_id, playerId, 'buy_property', JSON.stringify({ propertyId, price: property.price })]
    );

    res.json({ success: true, message: 'Property purchased' });
  } catch (error) {
    console.error('Error buying property:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

