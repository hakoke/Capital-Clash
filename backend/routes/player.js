import express from 'express';
import pool from '../database/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Join a game as a player
router.post('/join', async (req, res) => {
  try {
    const { gameId, playerName, color } = req.body;
    
    const playerId = uuidv4();

    // Get game settings
    const gameResult = await pool.query(
      'SELECT max_players, starting_cash FROM games WHERE id = $1',
      [gameId]
    );
    const maxPlayers = gameResult.rows[0]?.max_players || 6;
    const startingCash = gameResult.rows[0]?.starting_cash || 1500;
    
    if (gameResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }

    // Get current player count
    const countResult = await pool.query(
      'SELECT COUNT(*) as count FROM players WHERE game_id = $1',
      [gameId]
    );
    const currentCount = parseInt(countResult.rows[0].count);
    const order = currentCount + 1;

    // Check max players
    if (currentCount >= maxPlayers) {
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
      [playerId, gameId, playerName || 'Player ' + order, color, startingCash, order, 0, false]
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

// Mortgage a property for 50% of its cost
router.post('/:playerId/properties/:propertyId/mortgage', async (req, res) => {
  try {
    const { playerId, propertyId } = req.params;

    const playerResult = await pool.query('SELECT * FROM players WHERE id = $1', [playerId]);
    if (playerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Player not found' });
    }
    const player = playerResult.rows[0];

    const propertyResult = await pool.query('SELECT * FROM properties WHERE id = $1', [propertyId]);
    if (propertyResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    const property = propertyResult.rows[0];

    if (property.owner_id !== playerId) {
      return res.status(403).json({ success: false, error: 'You do not own this property' });
    }

    if (property.is_mortgaged) {
      return res.status(400).json({ success: false, error: 'Property is already mortgaged' });
    }

    if (property.houses > 0 || property.hotels > 0) {
      return res.status(400).json({ success: false, error: 'Sell houses and hotels before mortgaging' });
    }

    const gameResult = await pool.query('SELECT mortgage_enabled FROM games WHERE id = $1', [player.game_id]);
    const game = gameResult.rows[0];

    if (!game?.mortgage_enabled) {
      return res.status(400).json({ success: false, error: 'Mortgages are disabled for this game' });
    }

    const mortgageValue = parseFloat(property.price) * 0.5;

    await pool.query('UPDATE properties SET is_mortgaged = true WHERE id = $1', [propertyId]);
    await pool.query('UPDATE players SET money = money + $1 WHERE id = $2', [mortgageValue, playerId]);

    await pool.query(
      `INSERT INTO player_actions (id, game_id, player_id, action_type, details)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4)`,
      [player.game_id, playerId, 'mortgage_property', JSON.stringify({ propertyId, value: mortgageValue })]
    );

    const updatedProperty = await pool.query('SELECT * FROM properties WHERE id = $1', [propertyId]);
    res.json({ success: true, property: updatedProperty.rows[0], cashChange: mortgageValue });
  } catch (error) {
    console.error('Error mortgaging property:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Lift a mortgage by paying back principal + 10%
router.post('/:playerId/properties/:propertyId/unmortgage', async (req, res) => {
  try {
    const { playerId, propertyId } = req.params;

    const playerResult = await pool.query('SELECT * FROM players WHERE id = $1', [playerId]);
    if (playerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Player not found' });
    }
    const player = playerResult.rows[0];

    const propertyResult = await pool.query('SELECT * FROM properties WHERE id = $1', [propertyId]);
    if (propertyResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    const property = propertyResult.rows[0];

    if (property.owner_id !== playerId) {
      return res.status(403).json({ success: false, error: 'You do not own this property' });
    }

    if (!property.is_mortgaged) {
      return res.status(400).json({ success: false, error: 'Property is not mortgaged' });
    }

    const payoff = parseFloat(property.price) * 0.55;
    const playerMoney = parseFloat(player.money || 0);

    if (playerMoney < payoff) {
      return res.status(400).json({ success: false, error: 'Insufficient funds to lift mortgage' });
    }

    await pool.query('UPDATE properties SET is_mortgaged = false WHERE id = $1', [propertyId]);
    await pool.query('UPDATE players SET money = money - $1 WHERE id = $2', [payoff, playerId]);

    await pool.query(
      `INSERT INTO player_actions (id, game_id, player_id, action_type, details)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4)`,
      [player.game_id, playerId, 'lift_mortgage', JSON.stringify({ propertyId, cost: payoff })]
    );

    const updatedProperty = await pool.query('SELECT * FROM properties WHERE id = $1', [propertyId]);
    res.json({ success: true, property: updatedProperty.rows[0], cashChange: -payoff });
  } catch (error) {
    console.error('Error lifting mortgage:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Manage structures (houses & hotels) on a property
router.post('/:playerId/properties/:propertyId/structures', async (req, res) => {
  try {
    const { playerId, propertyId } = req.params;
    const { action } = req.body;

    if (!['build_house', 'sell_house', 'build_hotel', 'sell_hotel'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    const playerResult = await pool.query('SELECT * FROM players WHERE id = $1', [playerId]);
    if (playerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Player not found' });
    }
    const player = playerResult.rows[0];

    const propertyResult = await pool.query('SELECT * FROM properties WHERE id = $1', [propertyId]);
    if (propertyResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    const property = propertyResult.rows[0];

    if (property.owner_id !== playerId) {
      return res.status(403).json({ success: false, error: 'You do not own this property' });
    }

    if (property.property_type && property.property_type !== 'property') {
      return res.status(400).json({ success: false, error: 'Structures can only be managed on standard properties' });
    }

    if (property.is_mortgaged) {
      return res.status(400).json({ success: false, error: 'Unmortgage before modifying structures' });
    }

    const gameResult = await pool.query('SELECT even_build FROM games WHERE id = $1', [player.game_id]);
    const game = gameResult.rows[0];

    if (!property.color_group) {
      return res.status(400).json({ success: false, error: 'This property cannot be developed' });
    }

    const totalGroupResult = await pool.query(
      'SELECT COUNT(*)::INTEGER AS count FROM properties WHERE game_id = $1 AND color_group = $2',
      [player.game_id, property.color_group]
    );
    const ownedGroupResult = await pool.query(
      'SELECT id, houses, hotels FROM properties WHERE game_id = $1 AND color_group = $2 AND owner_id = $3',
      [player.game_id, property.color_group, playerId]
    );
    const groupProperties = ownedGroupResult.rows;

    const totalInGroup = totalGroupResult.rows[0]?.count || 0;
    if (groupProperties.length !== totalInGroup || totalInGroup === 0) {
      return res.status(400).json({ success: false, error: 'Complete the color set before developing' });
    }

    const structureCount = (prop) => (prop.hotels > 0 ? 5 : prop.houses || 0);
    const counts = groupProperties.map(structureCount);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);

    let cashChange = 0;
    let newHouses = property.houses;
    let newHotels = property.hotels;

    const enforceEvenBuild = !!game?.even_build;

    switch (action) {
      case 'build_house': {
        if (property.hotels > 0) {
          return res.status(400).json({ success: false, error: 'Cannot add houses while a hotel is present' });
        }
        if (property.houses >= 4) {
          return res.status(400).json({ success: false, error: 'Maximum houses reached' });
        }
        if (enforceEvenBuild) {
          const currentCount = structureCount(property);
          if (currentCount > minCount) {
            return res.status(400).json({ success: false, error: 'Build evenly across the set' });
          }
        }

        const cost = parseFloat(property.house_cost || 0);
        const playerMoney = parseFloat(player.money || 0);
        if (playerMoney < cost) {
          return res.status(400).json({ success: false, error: 'Insufficient funds' });
        }

        cashChange = -cost;
        newHouses = property.houses + 1;
        break;
      }

      case 'sell_house': {
        if (property.houses <= 0) {
          return res.status(400).json({ success: false, error: 'No houses to sell' });
        }
        if (enforceEvenBuild) {
          const currentCount = structureCount(property);
          if (currentCount < maxCount) {
            return res.status(400).json({ success: false, error: 'Sell evenly across the set' });
          }
        }

        cashChange = parseFloat(property.house_cost || 0) * 0.5;
        newHouses = property.houses - 1;
        break;
      }

      case 'build_hotel': {
        if (property.hotels > 0) {
          return res.status(400).json({ success: false, error: 'Hotel already present' });
        }
        if (property.houses < 4) {
          return res.status(400).json({ success: false, error: 'Requires four houses before building a hotel' });
        }
        if (enforceEvenBuild) {
          const hasUneven = groupProperties.some((prop) => prop.houses < 4 && prop.id !== property.id);
          if (hasUneven) {
            return res.status(400).json({ success: false, error: 'All properties in the set need four houses first' });
          }
        }

        const cost = parseFloat(property.hotel_cost || property.house_cost * 5 || 0);
        const playerMoney = parseFloat(player.money || 0);
        if (playerMoney < cost) {
          return res.status(400).json({ success: false, error: 'Insufficient funds' });
        }

        cashChange = -cost;
        newHouses = 0;
        newHotels = 1;
        break;
      }

      case 'sell_hotel': {
        if (property.hotels <= 0) {
          return res.status(400).json({ success: false, error: 'No hotel to sell' });
        }
        cashChange = parseFloat(property.hotel_cost || property.house_cost * 5 || 0) * 0.5;
        newHotels = 0;
        newHouses = 4;
        break;
      }
      default:
        break;
    }

    if (cashChange !== 0) {
      await pool.query('UPDATE players SET money = money + $1 WHERE id = $2', [cashChange, playerId]);
    }

    await pool.query(
      'UPDATE properties SET houses = $1, hotels = $2 WHERE id = $3',
      [newHouses, newHotels, propertyId]
    );

    await pool.query(
      `INSERT INTO player_actions (id, game_id, player_id, action_type, details)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4)`,
      [player.game_id, playerId, action, JSON.stringify({ propertyId, cashChange })]
    );

    const updatedProperty = await pool.query('SELECT * FROM properties WHERE id = $1', [propertyId]);
    res.json({ success: true, property: updatedProperty.rows[0], cashChange });
  } catch (error) {
    console.error('Error updating property structures:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

