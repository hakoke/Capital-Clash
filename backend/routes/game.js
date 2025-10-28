import express from 'express';
import pool from '../database/index.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MONOPOLY_PROPERTIES } from './monopoly-properties.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Create a new game
router.post('/create', async (req, res) => {
  try {
    const { name } = req.body;
    const gameId = uuidv4();

    const result = await pool.query(
      `INSERT INTO games (id, name, status)
       VALUES ($1, $2, 'waiting')
       RETURNING *`,
      [gameId, name]
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

    // Get properties
    const propertiesResult = await pool.query(
      'SELECT * FROM properties WHERE game_id = $1 ORDER BY position',
      [gameId]
    );

    res.json({
      success: true,
      game: gameResult.rows[0],
      players: playersResult.rows,
      properties: propertiesResult.rows
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize board (create Monopoly properties)
router.post('/:gameId/initialize-board', async (req, res) => {
  try {
    const { gameId } = req.params;

    // Check if properties table exists, if not create it
    try {
      await pool.query('SELECT 1 FROM properties LIMIT 1');
    } catch (err) {
      // Table doesn't exist, initialize it
      console.log('Initializing Monopoly schema...');
      const schemaPath = path.join(__dirname, '../database/schema_monopoly.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      const statements = schema.split(';').filter(s => s.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          await pool.query(statement);
        }
      }
      console.log('✅ Schema initialized successfully');
    }

    // Create all Monopoly properties
    for (const prop of MONOPOLY_PROPERTIES) {
      await pool.query(
        `INSERT INTO properties (id, game_id, name, color_group, price, rent, rent_with_set, 
         house_rent_1, house_rent_2, house_rent_3, house_rent_4, hotel_rent, house_cost, hotel_cost, 
         position, property_type, houses, hotels)
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [
          gameId,
          prop.name,
          prop.color_group || null,
          prop.price || 0,
          prop.rent || 0,
          prop.rent_with_set || 0,
          prop.house_rent_1 || 0,
          prop.house_rent_2 || 0,
          prop.house_rent_3 || 0,
          prop.house_rent_4 || 0,
          prop.hotel_rent || 0,
          prop.house_cost || 0,
          prop.house_cost ? prop.house_cost * 5 : 0,
          prop.position,
          prop.property_type || 'property',
          prop.houses || 0,
          prop.hotels || 0
        ]
      );
    }

    res.json({ success: true, message: 'Board initialized with Monopoly properties' });
  } catch (error) {
    console.error('Error initializing board:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start game - Initialize Monopoly board
router.post('/:gameId/start', async (req, res) => {
  try {
    const { gameId } = req.params;

    // Check if game has enough players
    const playersResult = await pool.query(
      'SELECT COUNT(*) as count FROM players WHERE game_id = $1 AND status = $2',
      [gameId, 'active']
    );

    const playerCount = parseInt(playersResult.rows[0].count);

    if (playerCount < 2) {
      return res.status(400).json({
        success: false,
        error: 'Need at least 2 players to start'
      });
    }

    // Check if properties table exists, if not create it
    try {
      await pool.query('SELECT 1 FROM properties LIMIT 1');
    } catch (err) {
      // Table doesn't exist, initialize it
      console.log('Initializing Monopoly schema...');
      const schemaPath = path.join(__dirname, '../database/schema_monopoly.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      const statements = schema.split(';').filter(s => s.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          await pool.query(statement);
        }
      }
      console.log('Schema initialized');
    }

    // Initialize board if not already done
    const propertiesResult = await pool.query(
      'SELECT COUNT(*) as count FROM properties WHERE game_id = $1',
      [gameId]
    );
    
    if (parseInt(propertiesResult.rows[0].count) === 0) {
      // Create all Monopoly properties
      for (const prop of MONOPOLY_PROPERTIES) {
        await pool.query(
          `INSERT INTO properties (id, game_id, name, color_group, price, rent, rent_with_set, 
           house_rent_1, house_rent_2, house_rent_3, house_rent_4, hotel_rent, house_cost, hotel_cost, 
           position, property_type, houses, hotels)
           VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
          [
            gameId,
            prop.name,
            prop.color_group || null,
            prop.price || 0,
            prop.rent || 0,
            prop.rent_with_set || 0,
            prop.house_rent_1 || 0,
            prop.house_rent_2 || 0,
            prop.house_rent_3 || 0,
            prop.house_rent_4 || 0,
            prop.hotel_rent || 0,
            prop.house_cost || 0,
            prop.house_cost ? prop.house_cost * 5 : 0,
            prop.position,
            prop.property_type || 'property',
            prop.houses || 0,
            prop.hotels || 0
          ]
        );
      }
    }

    // Update game status to active, start with player 1's turn
    await pool.query(
      'UPDATE games SET status = $1, current_player_turn = 1 WHERE id = $2',
      ['active', gameId]
    );

    res.json({ success: true, message: 'Monopoly game started!' });
  } catch (error) {
    console.error('Error starting game:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Roll dice and move player
router.post('/:gameId/roll', async (req, res) => {
  try {
    const { gameId } = req.params;
    const { playerId } = req.body;

    // Get game and player info
    const gameResult = await pool.query('SELECT * FROM games WHERE id = $1', [gameId]);
    if (gameResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }
    const game = gameResult.rows[0];

    const playerResult = await pool.query('SELECT * FROM players WHERE id = $1', [playerId]);
    if (playerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Player not found' });
    }
    const player = playerResult.rows[0];

    // Check if it's this player's turn
    if (game.current_player_turn !== player.order_in_game) {
      return res.status(400).json({ success: false, error: 'Not your turn!' });
    }

    // Check if player can roll
    if (!player.can_roll) {
      return res.status(400).json({ success: false, error: 'Cannot roll yet' });
    }

    // Roll dice (1-6 for each die)
    const die1 = Math.floor(Math.random() * 6) + 1;
    const die2 = Math.floor(Math.random() * 6) + 1;
    const total = die1 + die2;
    const isDoubles = die1 === die2;

    // Move player
    const currentPosition = player.position;
    let newPosition = (currentPosition + total) % 40;

    // Check for passing or landing on GO
    if (currentPosition + total >= 40) {
      // Player passed GO, collect $200
      await pool.query(
        'UPDATE players SET money = money + 200 WHERE id = $1',
        [playerId]
      );
    }

    await pool.query(
      'UPDATE players SET position = $1, can_roll = false WHERE id = $2',
      [newPosition, playerId]
    );

    // Log the roll
    await pool.query(
      `INSERT INTO player_actions (id, game_id, player_id, action_type, details)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4)`,
      [gameId, playerId, 'roll_dice', JSON.stringify({ die1, die2, total, newPosition, isDoubles })]
    );

    // Get property at new position
    const propertyResult = await pool.query(
      'SELECT * FROM properties WHERE game_id = $1 AND position = $2',
      [gameId, newPosition]
    );

    const property = propertyResult.rows[0];

    // Check if property is owned by another player and rent needs to be paid
    let rentDue = null;
    let ownerInfo = null;
    
    if (property && property.owner_id && property.owner_id !== playerId) {
      // Get the owner
      const ownerResult = await pool.query('SELECT * FROM players WHERE id = $1', [property.owner_id]);
      ownerInfo = ownerResult.rows[0];
      
      // Calculate rent (for now just basic rent, can add house logic later)
      if (property.hotels > 0) {
        rentDue = property.hotel_rent;
      } else if (property.houses > 0) {
        // Rent based on number of houses
        rentDue = property.houses === 4 ? property.house_rent_4 : 
                  property.houses === 3 ? property.house_rent_3 :
                  property.houses === 2 ? property.house_rent_2 : property.house_rent_1;
      } else if (property.color_group && property.color_group !== 'railroad' && property.color_group !== 'utility') {
        // Check if owner has the whole color group
        const sameColorProperties = await pool.query(
          'SELECT * FROM properties WHERE game_id = $1 AND color_group = $2',
          [gameId, property.color_group]
        );
        const ownedInGroup = sameColorProperties.rows.filter(p => p.owner_id === property.owner_id).length;
        const totalInGroup = sameColorProperties.rows.length;
        
        if (ownedInGroup === totalInGroup) {
          rentDue = property.rent_with_set;
        } else {
          rentDue = property.rent;
        }
      } else if (property.property_type === 'railroad') {
        // Count owned railroads
        const ownedRailroads = await pool.query(
          'SELECT COUNT(*) as count FROM properties WHERE owner_id = $1 AND property_type = $2',
          [property.owner_id, 'railroad']
        );
        const count = parseInt(ownedRailroads.rows[0].count);
        rentDue = 25 * count; // $25 per railroad, doubles for each owned
      } else if (property.property_type === 'utility') {
        // Base utility rent (would multiply by dice total if both owned)
        rentDue = 4 * total; // 4x dice roll if one owned, 10x if both
      } else {
        rentDue = property.rent || 0;
      }
      
      // Auto-pay rent if player has enough money
      if (rentDue > 0 && parseFloat(player.money) >= rentDue) {
        await pool.query(
          'UPDATE players SET money = money - $1 WHERE id = $2',
          [rentDue, playerId]
        );
        await pool.query(
          'UPDATE players SET money = money + $1 WHERE id = $2',
          [rentDue, property.owner_id]
        );
        
        // Log the rent payment
        await pool.query(
          `INSERT INTO player_actions (id, game_id, player_id, action_type, details)
           VALUES (uuid_generate_v4(), $1, $2, $3, $4)`,
          [gameId, playerId, 'pay_rent', JSON.stringify({ amount: rentDue, propertyId: property.id, ownerId: property.owner_id })]
        );
      } else if (rentDue > 0) {
        // Player doesn't have enough money - they're bankrupt!
        await pool.query(
          'UPDATE players SET status = $1 WHERE id = $2',
          ['bankrupt', playerId]
        );
      }
      
      rentDue = null; // Reset so we don't send it in response
    }

    res.json({
      success: true,
      dice: { die1, die2, total, isDoubles },
      newPosition,
      property: property || null,
      rentPaid: rentDue !== null ? rentDue : undefined
    });
  } catch (error) {
    console.error('Error rolling dice:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Advance to next turn
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
    
    // Move to next player
    const currentTurn = game.current_player_turn || 1;
    const nextTurn = currentTurn % activePlayers.length + 1;
    
    // Update current player to allow rolling again
    await pool.query(
      `UPDATE players SET can_roll = true WHERE game_id = $1 AND order_in_game = $2`,
      [gameId, nextTurn]
    );
    
    // Update game to next player's turn
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
  } catch (error) {
    console.error('Error advancing turn:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
