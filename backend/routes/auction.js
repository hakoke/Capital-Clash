import express from 'express';
import pool from '../database/index.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Create an auction for a property
router.post('/create', async (req, res) => {
  try {
    const { gameId, propertyId, startingBid } = req.body;
    
    // Check if property already has an auction
    const existingAuction = await pool.query(
      'SELECT * FROM property_auctions WHERE game_id = $1 AND property_id = $2 AND status = $3',
      [gameId, propertyId, 'active']
    );
    
    if (existingAuction.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Auction already exists' });
    }

    const auctionId = uuidv4();
    
    // Create auction
    const result = await pool.query(
      `INSERT INTO property_auctions (id, game_id, property_id, current_bid, highest_bidder_id, time_remaining, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [auctionId, gameId, propertyId, startingBid, null, 30, 'active']
    );

    res.json({ success: true, auction: result.rows[0] });
  } catch (error) {
    console.error('Error creating auction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get active auction for a property
router.get('/:gameId/:propertyId', async (req, res) => {
  try {
    const { gameId, propertyId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM property_auctions WHERE game_id = $1 AND property_id = $2 AND status = $3',
      [gameId, propertyId, 'active']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No active auction' });
    }

    res.json({ success: true, auction: result.rows[0] });
  } catch (error) {
    console.error('Error fetching auction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Place a bid
router.post('/bid', async (req, res) => {
  try {
    const { auctionId, playerId, bidAmount } = req.body;
    
    // Get auction
    const auctionResult = await pool.query(
      'SELECT * FROM property_auctions WHERE id = $1',
      [auctionId]
    );
    
    if (auctionResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Auction not found' });
    }
    
    const auction = auctionResult.rows[0];
    
    if (auction.status !== 'active') {
      return res.status(400).json({ success: false, error: 'Auction is not active' });
    }
    
    if (bidAmount <= auction.current_bid) {
      return res.status(400).json({ success: false, error: 'Bid must be higher than current bid' });
    }
    
    // Get player to check if they have enough money
    const playerResult = await pool.query('SELECT money FROM players WHERE id = $1', [playerId]);
    if (playerResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Player not found' });
    }
    
    const player = playerResult.rows[0];
    if (parseFloat(player.money) < bidAmount) {
      return res.status(400).json({ success: false, error: 'Insufficient funds' });
    }
    
    // Update auction
    await pool.query(
      'UPDATE property_auctions SET current_bid = $1, highest_bidder_id = $2, time_remaining = $3 WHERE id = $4',
      [bidAmount, playerId, 30, auctionId]
    );

    res.json({ success: true, message: 'Bid placed' });
  } catch (error) {
    console.error('Error placing bid:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// End auction and transfer property
router.post('/end', async (req, res) => {
  try {
    const { auctionId } = req.body;
    
    const auctionResult = await pool.query(
      'SELECT * FROM property_auctions WHERE id = $1',
      [auctionId]
    );
    
    if (auctionResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Auction not found' });
    }
    
    const auction = auctionResult.rows[0];
    
    if (auction.highest_bidder_id) {
      // Transfer property and deduct money
      await pool.query(
        'UPDATE properties SET owner_id = $1 WHERE id = $2',
        [auction.highest_bidder_id, auction.property_id]
      );
      
      await pool.query(
        'UPDATE players SET money = money - $1 WHERE id = $2',
        [auction.current_bid, auction.highest_bidder_id]
      );
      
      // Mark auction as completed
      await pool.query(
        'UPDATE property_auctions SET status = $1, ended_at = NOW() WHERE id = $2',
        ['completed', auctionId]
      );
    } else {
      // No bidder, just close auction
      await pool.query(
        'UPDATE property_auctions SET status = $1, ended_at = NOW() WHERE id = $2',
        ['cancelled', auctionId]
      );
    }

    res.json({ success: true, message: 'Auction ended' });
  } catch (error) {
    console.error('Error ending auction:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
