import express from 'express';
import pool from '../database/index.js';
import aiService from '../services/aiService.js';
import { v4 as uuidv4 } from 'uuid';

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

    // Get FULL game state for AI
    const [districtsResult, tilesResult, companiesResult, allPlayersResult] = await Promise.all([
      pool.query('SELECT * FROM districts WHERE game_id = $1', [player.game_id]),
      pool.query('SELECT * FROM tiles WHERE game_id = $1', [player.game_id]),
      pool.query('SELECT * FROM companies WHERE game_id = $1', [player.game_id]),
      pool.query('SELECT * FROM players WHERE game_id = $1', [player.game_id])
    ]);
    
    const gameState = {
      districts: districtsResult.rows,
      tiles: tilesResult.rows,
      companies: companiesResult.rows,
      players: allPlayersResult.rows,
      currentPlayer: player
    };

    // Generate AI response with FULL context
    const aiResponse = await aiService.generateCustomEventResponse(actionRecord, player, targetPlayer, gameState);

    // EXECUTE the commands AI returned
    if (aiResponse.executeCommands) {
      for (const cmd of aiResponse.executeCommands) {
        try {
          switch (cmd.type) {
            case 'playerCapital':
              await pool.query(
                'UPDATE players SET capital = capital + $1 WHERE name = $2 AND game_id = $3',
                [cmd.change, cmd.playerName, player.game_id]
              );
              break;
            
            case 'playerReputation':
              await pool.query(
                'UPDATE players SET reputation = reputation + $1 WHERE name = $2 AND game_id = $3',
                [cmd.change, cmd.playerName, player.game_id]
              );
              break;
            
            case 'companyAction':
              if (cmd.action === 'remove') {
                // Remove company
                await pool.query(
                  'UPDATE companies SET status = $1 WHERE name = $2 AND game_id = $3 AND player_id = $4',
                  ['bankrupt', cmd.targetCompany, player.game_id, playerId]
                );
                // Refund to player
                const companyResult = await pool.query(
                  'SELECT valuation FROM companies WHERE name = $1 AND game_id = $2',
                  [cmd.targetCompany, player.game_id]
                );
                if (companyResult.rows.length > 0) {
                  await pool.query(
                    'UPDATE players SET capital = capital + $1 WHERE id = $2',
                    [companyResult.rows[0].valuation * 0.5, playerId]
                  );
                }
              } else if (cmd.action === 'invest' && cmd.amount) {
                // Invest in company
                await pool.query(
                  'UPDATE companies SET valuation = valuation + $1, revenue_per_round = revenue_per_round + $2 WHERE name = $3 AND game_id = $4',
                  [cmd.amount, cmd.amount * 0.1, cmd.targetCompany, player.game_id]
                );
                await pool.query(
                  'UPDATE players SET capital = capital - $1 WHERE id = $2',
                  [cmd.amount, playerId]
                );
              } else if (cmd.action === 'launch') {
                // Launch new company
                const newCompanyId = uuidv4();
                await pool.query(
                  `INSERT INTO companies (id, game_id, player_id, name, industry, valuation, revenue_per_round)
                   VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                  [newCompanyId, player.game_id, playerId, cmd.targetCompany || 'New Company', cmd.industry || 'general', cmd.amount || 100000, (cmd.amount || 100000) * 0.1]
                );
                await pool.query(
                  'UPDATE players SET capital = capital - $1 WHERE id = $2',
                  [cmd.amount || 100000, playerId]
                );
              }
              break;
            
            case 'propertyAction':
              if (cmd.action === 'create' && cmd.propertyType && cmd.district) {
                // Create a property that generates revenue
                // Find a tile in that district that belongs to the player
                const districtResult = await pool.query(
                  'SELECT id FROM districts WHERE name = $1 AND game_id = $2',
                  [cmd.district, player.game_id]
                );
                
                if (districtResult.rows.length > 0) {
                  const districtId = districtResult.rows[0].id;
                  
                  // Create or update a tile for this property
                  await pool.query(
                    `INSERT INTO tiles (id, game_id, district_id, name, purchase_price, current_value, owner_id, property_type, development_level, income_per_round)
                     VALUES (uuid_generate_v4(), $1, $2, $3, $4, $4, $5, $6, 1, $7)
                     ON CONFLICT DO NOTHING`,
                    [player.game_id, districtId, `${cmd.propertyType} - ${cmd.district}`, cmd.amount || 100000, playerId, cmd.propertyType, (cmd.amount || 100000) * 0.03]
                  );
                }
              } else if (cmd.action === 'invest' && cmd.amount && cmd.propertyName) {
                // Invest in a property (increase development level = more income)
                await pool.query(
                  'UPDATE tiles SET development_level = development_level + 1, income_per_round = income_per_round + $1 WHERE name = $2 AND game_id = $3',
                  [cmd.amount * 0.02, cmd.propertyName, player.game_id]
                );
                await pool.query(
                  'UPDATE players SET capital = capital - $1 WHERE id = $2',
                  [cmd.amount, playerId]
                );
              }
              break;
          }
        } catch (error) {
          console.error(`Error executing command ${cmd.type}:`, error);
        }
      }
    }

    // Broadcast to all players
    const io = req.app.get('io');
    if (io) {
      io.to(`game_${player.game_id}`).emit('player_custom_action', {
        action: actionRecord,
        aiResponse,
        timestamp: new Date().toISOString()
      });
    }

    // Check if action needs confirmation
    if (aiResponse.needsConfirmation && !actionRecord.details?.confirmed) {
      return res.json({
        success: true,
        needsConfirmation: true,
        estimatedCost: aiResponse.estimatedCost,
        playerMessage: aiResponse.playerMessage,
        eventTitle: aiResponse.eventTitle,
        action: actionRecord
      });
    }

    res.json({ 
      success: true, 
      action: actionRecord,
      aiResponse,
      needsConfirmation: false
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

// Generate random AI events (called periodically)
router.post('/random-event/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;
    
    // Get full game state
    const [districtsResult, tilesResult, companiesResult, playersResult] = await Promise.all([
      pool.query('SELECT * FROM districts WHERE game_id = $1', [gameId]),
      pool.query('SELECT * FROM tiles WHERE game_id = $1', [gameId]),
      pool.query('SELECT * FROM companies WHERE game_id = $1', [gameId]),
      pool.query('SELECT * FROM players WHERE game_id = $1 ORDER BY order_in_game', [gameId])
    ]);
    
    const gameResult = await pool.query('SELECT current_round, max_rounds FROM games WHERE id = $1', [gameId]);
    const game = gameResult.rows[0];
    
    // Random chance for AI events (30% chance)
    if (Math.random() < 0.3) {
      const gameState = {
        currentRound: game.current_round,
        totalRounds: game.max_rounds,
        players: playersResult.rows,
        districts: districtsResult.rows,
        tiles: tilesResult.rows,
        companies: companiesResult.rows
      };
      
      // Let AI generate a random event
      const randomEvent = await aiService.generateRandomEvent(gameState);
      
      // Apply random event consequences
      if (randomEvent.playerImpacts) {
        for (const [playerName, impact] of Object.entries(randomEvent.playerImpacts)) {
          await pool.query(
            'UPDATE players SET capital = capital + $1, reputation = reputation + $2 WHERE name = $3 AND game_id = $4',
            [impact.capitalChange || 0, impact.reputationChange || 0, playerName, gameId]
          );
        }
      }
      
      // Broadcast to all players
      const io = req.app.get('io');
      if (io) {
        io.to(`game_${gameId}`).emit('random_ai_event', randomEvent);
      }
      
      return res.json({ success: true, event: randomEvent });
    }
    
    res.json({ success: false, message: 'No random event this time' });
  } catch (error) {
    console.error('Error generating random event:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

