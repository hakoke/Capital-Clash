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

    // Get all companies
    const companiesResult = await pool.query(
      'SELECT * FROM companies WHERE game_id = $1',
      [gameId]
    );

    // Build game state
    const gameState = {
      currentRound: game.current_round,
      totalRounds: game.max_rounds,
      players: playersResult.rows,
      districts: districtsResult.rows,
      availableTiles: tilesResult.rows.filter(t => !t.owner_id),
      ownedTiles: tilesResult.rows.filter(t => t.owner_id),
      companies: companiesResult.rows
    };

    // Generate market events using AI
    const marketEvent = await aiService.generateMarketEvents(gameState);
    
    // Get market analysis for company bankruptcy logic
    const marketAnalysis = aiService.analyzeMarketHealth(gameState);

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

    // Apply company impacts from AI events
    if (marketEvent.companyImpacts) {
      for (const [companyName, impact] of Object.entries(marketEvent.companyImpacts)) {
        if (impact.status === 'bankrupt') {
          // Mark company as bankrupt
          await pool.query(
            'UPDATE companies SET status = $1, valuation = 0 WHERE name = $2 AND game_id = $3',
            ['bankrupt', companyName, gameId]
          );
        } else if (impact.valuationChange) {
          // Update company valuation
          await pool.query(
            'UPDATE companies SET valuation = valuation + $1 WHERE name = $2 AND game_id = $3 AND status = $4',
            [impact.valuationChange, companyName, gameId, 'active']
          );
        }
      }
    }

    // Generate property income for all owned tiles (based on district, market conditions)
    for (const player of playersResult.rows) {
      const ownedTiles = tilesResult.rows.filter(t => t.owner_id === player.id);
      
      for (const tile of ownedTiles) {
        // Calculate income based on district type, development level, and market
        const baseValue = parseFloat(tile.purchase_price);
        const district = gameState.districts.find(d => d.id === tile.district_id);
        const districtCondition = district?.economic_condition || 'stable';
        const developmentLevel = tile.development_level || 0;
        
        // Base income calculation
        let incomeMultiplier = 0.02; // 2% base income
        
        // Market conditions affect income
        if (districtCondition === 'booming') {
          incomeMultiplier = 0.05; // 5% in booming districts
        } else if (districtCondition === 'recession') {
          incomeMultiplier = 0.01; // 1% in recession
        } else if (districtCondition === 'crisis') {
          incomeMultiplier = -0.01; // LOSE money in crisis!
        }
        
        // Development increases income
        if (developmentLevel > 0) {
          incomeMultiplier += developmentLevel * 0.02;
        }
        
        const income = baseValue * incomeMultiplier;
        
        if (income > 0) {
          // Add income to player
          await pool.query(
            'UPDATE players SET capital = capital + $1 WHERE id = $2',
            [income, player.id]
          );
        } else if (income < 0) {
          // LOSE money during crisis
          await pool.query(
            'UPDATE players SET capital = capital + $1 WHERE id = $2',
            [income, player.id]
          );
        }
      }
    }

    // Generate revenue and handle bankruptcy for all active companies
    const activeCompanies = companiesResult.rows.filter(c => c.status === 'active');
    for (const company of activeCompanies) {
      const baseRevenue = parseFloat(company.revenue_per_round || 0);
      
      // Market conditions affect company revenue
      let revenueMultiplier = 1.0;
      if (marketAnalysis.marketHealth === 'booming') {
        revenueMultiplier = 1.5;
      } else if (marketAnalysis.marketHealth === 'recession') {
        revenueMultiplier = 0.5;
      } else if (marketAnalysis.marketHealth === 'crisis') {
        revenueMultiplier = 0.2;
      }
      
      const revenue = baseRevenue * revenueMultiplier;
      const operatingCosts = revenue * 0.3; // 30% operating costs
      const netProfit = revenue - operatingCosts;

      // Random bankruptcy risk (10% chance per round, higher if struggling)
      const bankruptcyRisk = marketAnalysis.marketHealth === 'recession' ? 0.15 : 0.10;
      const isBankrupt = Math.random() < bankruptcyRisk;

      if (isBankrupt) {
        // Random business failure
        await pool.query(
          'UPDATE companies SET status = $1, valuation = 0 WHERE id = $2',
          ['bankrupt', company.id]
        );
        
        // Refund small amount to player
        await pool.query(
          'UPDATE players SET capital = capital + $1 WHERE id = $2',
          [company.valuation * 0.1, company.player_id]
        );
      } else {
        // Give revenue to player (market affected)
        await pool.query(
          'UPDATE players SET capital = capital + $1 WHERE id = $2',
          [netProfit, company.player_id]
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

    // Check for random events (30% chance after main event)
    if (Math.random() < 0.3) {
      const randomEvent = await aiService.generateRandomEvent(gameState);
      
      // Apply random event impacts
      if (randomEvent.playerImpacts) {
        for (const [playerName, impact] of Object.entries(randomEvent.playerImpacts)) {
          await pool.query(
            'UPDATE players SET capital = capital + $1, reputation = reputation + $2 WHERE name = $3 AND game_id = $4',
            [impact.capitalChange || 0, impact.reputationChange || 0, playerName, gameId]
          );
        }
      }
      
      // Save random event
      await pool.query(
        `INSERT INTO ai_events (id, game_id, round_number, event_type, title, description, impact_data)
         VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6)`,
        [gameId, game.current_round, randomEvent.eventType || 'random_event', randomEvent.title, randomEvent.description, JSON.stringify(randomEvent.playerImpacts || {})]
      );
    }

    // Update game round
    const newRound = game.current_round + 1;
    await pool.query(
      'UPDATE games SET current_round = $1, phase = $2 WHERE id = $3',
      [newRound, 'player_phase', gameId]
    );

    res.json({
      success: true,
      event: marketEvent,
      newsReport,
      newRound,
      hadRandomEvent: Math.random() < 0.3
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

