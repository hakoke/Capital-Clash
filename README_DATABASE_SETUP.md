# Database Setup Instructions

## Quick Setup

Run these commands to set up the Monopoly game:

```bash
# 1. Go to backend directory
cd backend

# 2. Install dependencies (if not already installed)
npm install

# 3. Initialize the database schema
node database/setup.js

# 4. Start the backend server
npm start
```

## What Happens

1. The setup script creates all required tables:
   - `games` - Game sessions
   - `players` - Player data with colors and money
   - `properties` - All 40 Monopoly properties
   - `player_actions` - Action history
   - `chat_messages` - Game chat
   - `trade_offers` - Trading system

2. The backend server will now work properly

## If Tables Already Exist

If you see "relation already exists" errors, that's fine - the tables are already set up. You can skip the setup step.

## Troubleshooting

**"Cannot find package 'pg'"**
- Run: `npm install` in the backend directory

**"relation 'properties' does not exist"**
- Run: `node database/setup.js` to initialize the schema

**Connection refused**
- Make sure PostgreSQL is running
- Check your `DATABASE_URL` in `.env` file

## Automatic Initialization

The game now automatically initializes the database schema on first run if tables don't exist. But running `node database/setup.js` manually is recommended for a clean setup.

