# 🎲 Quick Start Guide - Monopoly Game

## What's New

I've completely transformed your game into a **classic Monopoly game** with:
- Full 40-space Monopoly board
- Dice rolling mechanics
- Property buying
- Player pieces that move around the board
- Color selection in lobby
- Turn-based gameplay
- Beautiful, modern UI

## Setup (5 Minutes)

### 1. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend  
cd ../frontend
npm install
```

### 2. Configure Database

Edit `backend/database/index.js` and update your PostgreSQL connection:

```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Add your PostgreSQL credentials here
});
```

Or set the `DATABASE_URL` environment variable.

### 3. Initialize Database

```bash
cd backend
node database/setup.js
```

This will create all the Monopoly tables.

### 4. Run the Game

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Visit: http://localhost:5173

## How to Play

1. **Create a Game**: Click "Create Game" on homepage
2. **Join Lobby**: Choose your name and color
3. **Invite Players**: Share the lobby URL (need 2-6 players)
4. **Start Game**: Host clicks "Start Game"
5. **Roll Dice**: Click "Roll Dice" button
6. **Buy Properties**: Land on properties to buy them
7. **End Turn**: Click "End Turn" when done

## API Routes

```
POST /api/game/create
POST /api/game/:gameId/initialize-board
POST /api/game/:gameId/start
POST /api/game/:gameId/roll
POST /api/game/:gameId/advance-turn
POST /api/player/join
POST /api/player/:playerId/buy-property
```

## Features

✅ 40 Monopoly properties with colors
✅ Dice rolling (1-6 each)
✅ Player movement
✅ Property buying
✅ GO money ($200)
✅ Color selection
✅ Turn management
✅ Beautiful UI

## Files Changed

### Backend
- `backend/database/schema_monopoly.sql` - New Monopoly schema
- `backend/routes/game.js` - Monopoly game logic
- `backend/routes/player.js` - Player with color support
- `backend/routes/monopoly-properties.js` - Property data

### Frontend
- `frontend/src/pages/Home.jsx` - Monopoly homepage
- `frontend/src/pages/Lobby.jsx` - Color selection
- `frontend/src/pages/MonopolyGame.jsx` - Main game
- `frontend/src/components/MonopolyBoard.jsx` - Game board
- `frontend/src/utils/monopolyConstants.js` - Colors

### Removed
- All AI features
- Old Capital Clash game logic
- AI route imports

## Next Steps

The game is ready to test! Try creating a game and playing with friends.

Future enhancements to consider:
- Rent collection
- Houses and hotels
- Trading between players
- Jail mechanics
- Chance/Community Chest cards
- Bankruptcy

## Troubleshooting

**Database connection errors?**
- Make sure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify credentials in database/index.js

**"Cannot find package 'pg'" error?**
- Run `npm install` in backend folder

**Board not showing?**
- Make sure you ran `node database/setup.js`
- Check that properties table has 40 rows

**Player colors not working?**
- Clear browser localStorage
- Rejoin the game with a different color

## Support

Check the main README.md for more details!

