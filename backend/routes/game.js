import express from 'express';
import pool from '../database/index.js';
import { v4 as uuidv4 } from 'uuid';
import aiService from '../services/aiService.js';

const router = express.Router();

// Create a new game
router.post('/create', async (req, res) => {
  try {
    const { name, maxRounds = 8 } = req.body;
    const gameId = uuidv4();

    const result = await pool.query(
      `INSERT INTO games (id, name, max_rounds, status, current_round)
       VALUES ($1, $2, $3, 'waiting', 1)
       RETURNING *`,
      [gameId, name, maxRounds]
    );

    res.json({ success: true, game: result.rows[0] });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get game details
router.get('/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const gameResult = await pool.query(
      'SELECT * FROM games WHERE id = $1',
      [gameId]
    );

    if (gameResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }

    // Get players
    const playersResult = await pool.query(
      'SELECT * FROM players WHERE game_id = $1 ORDER BY order_in_game',
      [gameId]
    );

    // Get districts
    const districtsResult = await pool.query(
      'SELECT * FROM districts WHERE game_id = $1 ORDER BY order_on_board',
      [gameId]
    );

    // Get tiles
    const tilesResult = await pool.query(
      `SELECT t.*, d.name as district_name, d.type as district_type
       FROM tiles t
       LEFT JOIN districts d ON t.district_id = d.id
       WHERE t.game_id = $1
       ORDER BY d.order_on_board, t.order_in_district`,
      [gameId]
    );

    // Get companies
    const companiesResult = await pool.query(
      'SELECT * FROM companies WHERE game_id = $1',
      [gameId]
    );

    res.json({
      success: true,
      game: gameResult.rows[0],
      players: playersResult.rows,
      districts: districtsResult.rows,
      tiles: tilesResult.rows,
      companies: companiesResult.rows
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize board (create districts and tiles)
router.post('/:gameId/initialize-board', async (req, res) => {
  try {
    const { gameId } = req.params;

    const districts = [
      { name: 'AI Data Core', type: 'tech_park', order: 1, description: 'Advanced AI startups and data centers' },
      { name: 'Quantum Plaza', type: 'tech_park', order: 2, description: 'Quantum computing and robotics firms' },
      { name: 'Neo Financial Tower', type: 'downtown', order: 3, description: 'Corporate headquarters and banks' },
      { name: 'Market Square', type: 'downtown', order: 4, description: 'Shopping centers and entertainment' },
      { name: 'Steel Works', type: 'industrial', order: 5, description: 'Heavy manufacturing and production' },
      { name: 'Energy Grid', type: 'industrial', order: 6, description: 'Power plants and infrastructure' },
      { name: 'Eco Gardens', type: 'green_valley', order: 7, description: 'Renewable energy and sustainable tech' },
      { name: 'Bio Farms', type: 'green_valley', order: 8, description: 'Organic agriculture and biotech' },
      { name: 'Fashion District', type: 'luxury_mile', order: 9, description: 'Luxury brands and fashion houses' },
      { name: 'Entertainment Hub', type: 'luxury_mile', order: 10, description: 'Media studios and entertainment' },
      { name: 'Deep Port', type: 'harborfront', order: 11, description: 'Shipping and logistics center' },
      { name: 'Tourist Bay', type: 'harborfront', order: 12, description: 'Resorts and tourism facilities' }
    ];

    const districtIds = [];

    // Create districts
    for (const district of districts) {
      const districtId = uuidv4();
      districtIds.push(districtId);

      await pool.query(
        `INSERT INTO districts (id, game_id, name, type, description, order_on_board)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [districtId, gameId, district.name, district.type, district.description, district.order]
      );

      // Create 3 tiles per district
      for (let i = 1; i <= 3; i++) {
        const basePrice = [200000, 300000, 400000][i - 1];
        const tileName = `${district.name} - Plot ${i}`;

        await pool.query(
          `INSERT INTO tiles (id, game_id, district_id, name, purchase_price, current_value, order_in_district)
           VALUES (uuid_generate_v4(), $1, $2, $3, $4, $4, $5)`,
          [gameId, districtId, tileName, basePrice, i]
        );
      }
    }

    res.json({ success: true, message: 'Board initialized', districts: districtIds });
  } catch (error) {
    console.error('Error initializing board:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start game - With automatic turn system
router.post('/:gameId/start', async (req, res) => {
  try {
    const { gameId } = req.params;

    // Check if game has enough players
    const playersResult = await pool.query(
      'SELECT COUNT(*) as count FROM players WHERE game_id = $1 AND status = $2',
      [gameId, 'active']
    );

    const playerCount = parseInt(playersResult.rows[0].count);

    if (playerCount < parseInt(process.env.MIN_PLAYERS_PER_GAME || 2)) {
      return res.status(400).json({
        success: false,
        error: `Need at least ${process.env.MIN_PLAYERS_PER_GAME || 2} players to start`
      });
    }

    // Initialize board if not already done
    const boardsResult = await pool.query(
      'SELECT COUNT(*) as count FROM districts WHERE game_id = $1',
      [gameId]
    );
    
    if (parseInt(boardsResult.rows[0].count) === 0) {
      // Board not initialized, do it now
      const districts = [
        { name: 'AI Data Core', type: 'tech_park', order: 1, description: 'Advanced AI startups and data centers' },
        { name: 'Quantum Plaza', type: 'tech_park', order: 2, description: 'Quantum computing and robotics firms' },
        { name: 'Neo Financial Tower', type: 'downtown', order: 3, description: 'Corporate headquarters and banks' },
        { name: 'Market Square', type: 'downtown', order: 4, description: 'Shopping centers and entertainment' },
        { name: 'Steel Works', type: 'industrial', order: 5, description: 'Heavy manufacturing and production' },
        { name: 'Energy Grid', type: 'industrial', order: 6, description: 'Power plants and infrastructure' },
        { name: 'Eco Gardens', type: 'green_valley', order: 7, description: 'Renewable energy and sustainable tech' },
        { name: 'Bio Farms', type: 'green_valley', order: 8, description: 'Organic agriculture and biotech' },
        { name: 'Fashion District', type: 'luxury_mile', order: 9, description: 'Luxury brands and fashion houses' },
        { name: 'Entertainment Hub', type: 'luxury_mile', order: 10, description: 'Media studios and entertainment' },
        { name: 'Deep Port', type: 'harborfront', order: 11, description: 'Shipping and logistics center' },
        { name: 'Tourist Bay', type: 'harborfront', order: 12, description: 'Resorts and tourism facilities' }
      ];

      for (const district of districts) {
        const districtId = uuidv4();
        await pool.query(
          `INSERT INTO districts (id, game_id, name, type, description, order_on_board)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [districtId, gameId, district.name, district.type, district.description, district.order]
        );

        for (let i = 1; i <= 3; i++) {
          const basePrice = [200000, 300000, 400000][i - 1];
          const tileName = `${district.name} - Plot ${i}`;
          await pool.query(
            `INSERT INTO tiles (id, game_id, district_id, name, purchase_price, current_value, order_in_district)
             VALUES (uuid_generate_v4(), $1, $2, $3, $4, $4, $5)`,
            [gameId, districtId, tileName, basePrice, i]
          );
        }
      }
    }

    // Update game status to active, start with player 1's turn
    await pool.query(
      'UPDATE games SET status = $1, phase = $2, current_player_turn = 1 WHERE id = $3',
      ['active', 'player_phase', gameId]
    );

    res.json({ success: true, message: 'Game started' });
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Advance to next turn/round automatically
router.post('/:gameId/advance-turn', async (req, res) => {
  try {
    const { gameId } = req.params;
    
    const gameResult = await pool.query('SELECT * FROM games WHERE id = $1', [gameId]);
    if (gameResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }
    
    const game = gameResult.rows[0];
    const playersResult = await pool.query(
      'SELECT * FROM players WHERE game_id = $1 ORDER BY order_in_game',
      [gameId]
    );
    const activePlayers = playersResult.rows.filter(p => p.status === 'active');
    
    // Check if all players have taken their turn this round
    const currentTurn = game.current_player_turn || 1;
    const nextTurn = currentTurn % activePlayers.length + 1;
    
    if (nextTurn === 1) {
      // Last player finished, advance round
      await pool.query(
        'UPDATE games SET current_round = current_round + 1, current_player_turn = 1, phase = $1 WHERE id = $2',
        ['ai_phase', gameId]
      );
      
      // Trigger auto AI simulation for this round
      const simulateRes = await req.app.get('simulateRound');
      if (simulateRes) {
        // AI simulation will handle phase change back to player_phase
      }
      
      res.json({ 
        success: true, 
        message: 'Round advanced',
        newRound: game.current_round + 1,
        phase: 'ai_phase'
      });
    } else {
      // Just advance to next player's turn
      await pool.query(
        'UPDATE games SET current_player_turn = $1 WHERE id = $2',
        [nextTurn, gameId]
      );
      
      res.json({ 
        success: true, 
        message: 'Turn advanced',
        currentTurn: nextTurn,
        currentPlayer: activePlayers.find(p => p.order_in_game === nextTurn)?.name
      });
    }
  } catch (error) {
    console.error('Error advancing turn:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// End current round and trigger AI simulation
router.post('/:gameId/end-round', async (req, res) => {
  try {
    const { gameId } = req.params;
    const io = req.app.get('io');
    
    // Set phase to AI simulation
    await pool.query(
      'UPDATE games SET phase = $1 WHERE id = $2',
      ['ai_phase', gameId]
    );
    
    // Broadcast to all players
    if (io) {
      io.to(`game_${gameId}`).emit('round_ending', {
        message: 'Round ending... AI simulation beginning',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({ success: true, message: 'Round ended, AI simulation will begin' });
  } catch (error) {
    console.error('Error ending round:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
