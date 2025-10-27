# 🚀 Capital Clash Setup Guide

## Quick Start

### Step 1: Database Setup

1. **Connect to Railway PostgreSQL**
   Your database is already set up at: `postgresql://postgres:AYhhQrfUuwqFrfIFBMPuiEjniySfuYIr@shortline.proxy.rlwy.net:40619/railway`

2. **Run the Schema**
   ```bash
   # Option 1: Using psql
   psql postgresql://postgres:AYhhQrfUuwqFrfIFBMPuiEjniySfuYIr@shortline.proxy.rlwy.net:40619/railway -f backend/database/schema.sql

   # Option 2: Using the backend directly
   cd backend
   npm run db:setup
   ```

### Step 2: Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend will run on **http://localhost:3001**

### Step 3: Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on **http://localhost:3000**

### Step 4: Play!

Open your browser and go to **http://localhost:3000**

## Environment Variables

### Backend (.env)

The backend `.env` file is already configured with your credentials:

```env
DATABASE_URL=postgresql://postgres:AYhhQrfUuwqFrfIFBMPuiEjniySfuYIr@shortline.proxy.rlwy.net:40619/railway
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
NODE_ENV=development
JWT_SECRET=capital_clash_secret_key_2024_super_secure_random_string
CORS_ORIGIN=http://localhost:3000
SOCKET_IO_PING_TIMEOUT=60000
SOCKET_IO_PING_INTERVAL=25000
MAX_PLAYERS_PER_GAME=6
MIN_PLAYERS_PER_GAME=2
TOTAL_ROUNDS=8
STARTING_CAPITAL=1000000
```

## What's Built

### ✅ Completed Features

1. **Full Backend API**
   - Game creation and management
   - Player management
   - Tile/Property system
   - Company launching
   - OpenAI integration for AI events

2. **Database Schema**
   - Games, Players, Districts, Tiles
   - Companies, Actions, Events
   - News Reports, Market Conditions

3. **Beautiful Frontend**
   - Modern dark UI with neon accents
   - Responsive game board
   - Real-time player panels
   - AI-generated news feed
   - Interactive action panel

4. **AI Features**
   - Dynamic market events
   - AI-generated news stories
   - Economic simulation
   - Player impact calculations

5. **WebSocket Support**
   - Real-time multiplayer
   - Live game updates
   - Player actions

### 🔧 How It Works

1. **Create Game**: Set up a new game lobby
2. **Join Players**: Up to 6 players can join
3. **Start Game**: Board initializes with 12 districts
4. **Take Actions**: Buy tiles, launch companies
5. **AI Simulates**: Generate events and news
6. **Win**: Most valuable empire wins!

### 🎮 Game Flow

```
Home → Create Game → Join Lobby → Start Game
                                          ↓
                                   Game Board
                                          ↓
                    Player Actions → AI Simulation → Round End
                                          ↓
                                   Next Round / Winner
```

## Troubleshooting

### Database Connection Error
Make sure your Railway database is running and accessible.

### OpenAI API Error
Check your API key is valid and has credits.

### Port Already in Use
Change PORT in backend/.env if 3001 is taken.

## Next Steps

1. **Add Audio**: Background music and sound effects
2. **Animations**: Tile acquisitions, company launches
3. **More Actions**: Build upgrades, trade with players
4. **AI NPCs**: Computer-controlled opponents
5. **Mobile Support**: Responsive design improvements

## Deployment

### Railway Deployment

1. Push to GitHub
2. Connect Railway to your repo
3. Set environment variables
4. Deploy!

### Vercel/Netlify (Frontend)

1. Build frontend: `npm run build`
2. Deploy dist folder
3. Update API URL

## Support

If you encounter issues, check:
- Node.js version (18+)
- PostgreSQL connection
- OpenAI API status
- Port availability

Happy gaming! 🎮

