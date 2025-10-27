import express from 'express';
import pool from '../database/index.js';
import { v4 as uuidv4 } from 'uuid';
import aiService from '../services/aiService.js';

const router = express.Router();

// Join a game as a player
router.post('/join', async (req, res) => {
  try {
    const { gameId, playerName, companyName } = req.body;
    
    // Sanitize inputs to filter inappropriate content
    const sanitizedPlayerName = aiService.sanitizeInput(playerName);
    const sanitizedCompanyName = aiService.sanitizeInput(companyName);
    
    const playerId = uuidv4();

    // Get current player count
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM players WHERE game_id = $1',
      [gameId]
    );
    const order = parseInt(countResult.rows[0].count) + 1;

    // Check max players
    const maxPlayers = parseInt(process.env.MAX_PLAYERS_PER_GAME || 6);
    if (order > maxPlayers) {
      return res.status(400).json({
        success: false,
        error: `Maximum ${maxPlayers} players allowed`
      });
    }

    // Create player
    const result = await pool.query(
      `INSERT INTO players (id, game_id, name, company_name, capital, order_in_game)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [playerId, gameId, sanitizedPlayerName, sanitizedCompanyName, process.env.STARTING_CAPITAL || 1000000, order]
    );

    // Notify other players via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`game_${gameId}`).emit('new_player_joined', {
        player: result.rows[0],
        timestamp: new Date().toISOString()
      });
    }

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

// Get player's tiles and companies
router.get('/:playerId/assets', async (req, res) => {
  try {
    const { playerId } = req.params;

    // Get tiles
    const tilesResult = await pool.query(
      'SELECT * FROM tiles WHERE owner_id = $1',
      [playerId]
    );

    // Get companies
    const companiesResult = await pool.query(
      'SELECT * FROM companies WHERE player_id = $1',
      [playerId]
    );

    res.json({
      success: true,
      tiles: tilesResult.rows,
      companies: companiesResult.rows
    });
  } catch (error) {
    console.error('Error fetching player assets:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Buy a tile
router.post('/:playerId/buy-tile', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { tileId } = req.body;

    // Get player info
    const playerResult = await pool.query(
      'SELECT * FROM players WHERE id = $1',
      [playerId]
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Player not found' });
    }

    const player = playerResult.rows[0];

    // Get tile info
    const tileResult = await pool.query(
      'SELECT * FROM tiles WHERE id = $1',
      [tileId]
    );

    if (tileResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Tile not found' });
    }

    const tile = tileResult.rows[0];

    // Check if already owned
    if (tile.owner_id) {
      return res.status(400).json({ success: false, error: 'Tile already owned' });
    }

    // Check if player has enough capital
    if (parseFloat(player.capital) < parseFloat(tile.purchase_price)) {
      return res.status(400).json({ success: false, error: 'Insufficient capital' });
    }

    // Update tile ownership
    await pool.query(
      'UPDATE tiles SET owner_id = $1 WHERE id = $2',
      [playerId, tileId]
    );

    // Deduct capital
    await pool.query(
      'UPDATE players SET capital = capital - $1 WHERE id = $2',
      [tile.purchase_price, playerId]
    );

    // Record action
    await pool.query(
      `INSERT INTO player_actions (id, game_id, player_id, round_number, action_type, details)
       VALUES (uuid_generate_v4(), $1, $2, (SELECT current_round FROM games WHERE id = $1), $3, $4)`,
      [tile.game_id, playerId, 'buy_tile', JSON.stringify({ tileId, price: tile.purchase_price })]
    );

    res.json({ success: true, message: 'Tile purchased' });
  } catch (error) {
    console.error('Error buying tile:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Launch a company
router.post('/:playerId/launch-company', async (req, res) => {
  try {
    const { playerId } = req.params;
    const { name, industry, initialInvestment } = req.body;

    // Sanitize company name and industry
    const sanitizedName = aiService.sanitizeInput(name);
    const sanitizedIndustry = aiService.sanitizeInput(industry);

    // Get player info
    const playerResult = await pool.query(
      'SELECT game_id, capital FROM players WHERE id = $1',
      [playerId]
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Player not found' });
    }

    const player = playerResult.rows[0];

    if (parseFloat(player.capital) < parseFloat(initialInvestment)) {
      return res.status(400).json({ success: false, error: 'Insufficient capital' });
    }

    const companyId = uuidv4();

    // Create company
    await pool.query(
      `INSERT INTO companies (id, game_id, player_id, name, industry, valuation, revenue_per_round)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [companyId, player.game_id, playerId, sanitizedName, sanitizedIndustry, initialInvestment, initialInvestment * 0.1]
    );

    // Deduct capital
    await pool.query(
      'UPDATE players SET capital = capital - $1 WHERE id = $2',
      [initialInvestment, playerId]
    );

    // Record action
    await pool.query(
      `INSERT INTO player_actions (id, game_id, player_id, round_number, action_type, details)
       VALUES (uuid_generate_v4(), $1, $2, (SELECT current_round FROM games WHERE id = $1), $3, $4)`,
      [player.game_id, playerId, 'launch_company', JSON.stringify({ companyId, name, industry, investment: initialInvestment })]
    );

    res.json({ success: true, message: 'Company launched', companyId });
  } catch (error) {
    console.error('Error launching company:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

