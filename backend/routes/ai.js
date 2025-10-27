import express from 'express';
import pool from '../database/index.js';
import aiService from '../services/aiService.js';

const router = express.Router();

// Generate and apply AI market events for a round
router.post('/simulate-round/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;

    // Get current game state
    const gameResult = await pool.query('SELECT * FROM games WHERE id = $1', [gameId]);
    if (gameResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }

    const game = gameResult.rows[0];

    // Get all players
    const playersResult = await pool.query(
      'SELECT * FROM players WHERE game_id = $1 ORDER BY order_in_game',
      [gameId]
    );

    // Get all districts
    const districtsResult = await pool.query(
      'SELECT * FROM districts WHERE game_id = $1 ORDER BY order_on_board',
      [gameId]
    );

    // Get all tiles
    const tilesResult = await pool.query(
      'SELECT * FROM tiles WHERE game_id = $1',
      [gameId]
    );

    // Build game state
    const gameState = {
      currentRound: game.current_round,
      totalRounds: game.max_rounds,
      players: playersResult.rows,
      districts: districtsResult.rows,
      availableTiles: tilesResult.rows.filter(t => !t.owner_id),
      ownedTiles: tilesResult.rows.filter(t => t.owner_id)
    };

    // Generate market events using AI
    const marketEvent = await aiService.generateMarketEvents(gameState);

    // Apply market changes to districts
    if (marketEvent.marketChanges) {
      for (const [districtName, change] of Object.entries(marketEvent.marketChanges)) {
        await pool.query(
          'UPDATE districts SET market_value = market_value + $1 WHERE name = $2 AND game_id = $3',
          [change, districtName, gameId]
        );
      }
    }

    // Apply player impacts
    if (marketEvent.playerImpacts) {
      for (const [playerName, impact] of Object.entries(marketEvent.playerImpacts)) {
        await pool.query(
          'UPDATE players SET capital = capital + $1, reputation = reputation + $2 WHERE name = $3 AND game_id = $4',
          [impact.capitalChange || 0, impact.reputationChange || 0, playerName, gameId]
        );
      }
    }

    // Save AI event to database
    const affectedDistrictIds = [];
    if (marketEvent.affectedDistricts) {
      for (const districtName of marketEvent.affectedDistricts) {
        const districtResult = await pool.query(
          'SELECT id FROM districts WHERE name = $1 AND game_id = $2',
          [districtName, gameId]
        );
        if (districtResult.rows.length > 0) {
          affectedDistrictIds.push(districtResult.rows[0].id);
        }
      }
    }

    await pool.query(
      `INSERT INTO ai_events (id, game_id, round_number, event_type, title, description, affected_district_id, impact_data)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7)`,
      [
        gameId,
        game.current_round,
        marketEvent.eventType,
        marketEvent.title,
        marketEvent.description,
        affectedDistrictIds[0] || null,
        JSON.stringify(marketEvent.playerImpacts || {})
      ]
    );

    // Generate news report
    const newsReport = await aiService.generateNewsReport(gameState, [marketEvent]);

    // Save news report
    await pool.query(
      `INSERT INTO news_reports (id, game_id, round_number, headline, story, player_impacts)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5)`,
      [
        gameId,
        game.current_round,
        newsReport.headline,
        newsReport.story,
        JSON.stringify(marketEvent.playerImpacts || {})
      ]
    );

    // Update game round
    const newRound = game.current_round + 1;
    await pool.query(
      'UPDATE games SET current_round = $1 WHERE id = $2',
      [newRound, gameId]
    );

    res.json({
      success: true,
      event: marketEvent,
      newsReport,
      newRound
    });
  } catch (error) {
    console.error('Error simulating round:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get AI-generated news for a game
router.get('/news/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;

    const result = await pool.query(
      'SELECT * FROM news_reports WHERE game_id = $1 ORDER BY round_number DESC, generated_at DESC',
      [gameId]
    );

    res.json({ success: true, news: result.rows });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get AI-generated events for a game
router.get('/events/:gameId', async (req, res) => {
  try {
    const { gameId } = req.params;

    const result = await pool.query(
      'SELECT * FROM ai_events WHERE game_id = $1 ORDER BY round_number DESC, created_at DESC',
      [gameId]
    );

    res.json({ success: true, events: result.rows });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

