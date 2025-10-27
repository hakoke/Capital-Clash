# 🔐 Environment Variables Reference

## Complete List of Required Variables

### Backend Environment Variables (.env)

All variables needed for the backend to function properly.

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
DATABASE_URL=postgresql://postgres:AYhhQrfUuwqFrfIFBMPuiEjniySfuYIr@shortline.proxy.rlwy.net:40619/railway
# Your Railway PostgreSQL connection string

# ============================================
# OPENAI CONFIGURATION
# ============================================
OPENAI_API_KEY=your_openai_api_key_here
# Your OpenAI API key for AI-generated events and news

# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=3001
# Port for the backend server
# Default: 3001

NODE_ENV=development
# Environment mode (development, production)
# Default: development

# ============================================
# JWT AUTHENTICATION (If you enable auth later)
# ============================================
JWT_SECRET=capital_clash_secret_key_2024_super_secure_random_string
# Secret key for JWT token signing
# ⚠️ CHANGE THIS IN PRODUCTION!

# ============================================
# CORS CONFIGURATION
# ============================================
CORS_ORIGIN=http://localhost:3000
# Allowed origin for frontend requests
# Default: http://localhost:3000
# Change to your deployed frontend URL in production

# ============================================
# WEBSOCKET CONFIGURATION
# ============================================
SOCKET_IO_PING_TIMEOUT=60000
# Socket.io ping timeout in milliseconds
# Default: 60000 (60 seconds)

SOCKET_IO_PING_INTERVAL=25000
# Socket.io ping interval in milliseconds
# Default: 25000 (25 seconds)

# ============================================
# GAME CONFIGURATION
# ============================================
MAX_PLAYERS_PER_GAME=6
# Maximum players allowed in a single game
# Default: 6

MIN_PLAYERS_PER_GAME=2
# Minimum players required to start a game
# Default: 2

TOTAL_ROUNDS=8
# Total rounds per game
# Default: 8

STARTING_CAPITAL=1000000
# Starting capital for each player
# Default: 1000000 ($1M)
```

## How to Use These Variables

### 1. Backend Setup

Create `backend/.env` file with the above variables.

**Already configured** - Your `.env` file has been created with your credentials.

### 2. Frontend Setup

The frontend uses environment variables for API endpoints:

Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

### 3. Production Deployment

When deploying to production, update:

```env
# For Railway (Backend)
DATABASE_URL=<your-production-database-url>
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com

# For Frontend (Vercel/Netlify)
VITE_API_URL=https://your-backend-api.com
VITE_WS_URL=wss://your-backend-api.com
```

## Security Notes

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Rotate secrets** - Change JWT_SECRET and other secrets regularly
3. **Use environment-specific values** - Different values for dev/staging/prod
4. **Protect OpenAI key** - Don't expose in frontend code

## API Keys & Services You Need

1. ✅ **PostgreSQL Database** - Provided (Railway)
2. ✅ **OpenAI API Key** - Provided
3. ⚠️ **Optional: Sentry** (for error tracking)
4. ⚠️ **Optional: AWS S3** (for asset storage)
5. ⚠️ **Optional: Redis** (for caching)

## Testing Your Setup

```bash
# Test database connection
cd backend
npm run db:setup

# Test OpenAI connection
node -e "import('openai').then(m => console.log('OpenAI SDK loaded'))"

# Start backend
npm run dev

# In another terminal, start frontend
cd ../frontend
npm run dev
```

## Troubleshooting

### "Database connection error"
- Check DATABASE_URL is correct
- Ensure Railway database is running
- Test connection: `psql $DATABASE_URL`

### "OpenAI API error"
- Check OPENAI_API_KEY is valid
- Verify API credits/balance
- Check rate limits

### "Port already in use"
- Change PORT in .env
- Kill process using that port: `kill $(lsof -ti:3001)`

## All Variables Summary

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | ✅ Yes | - | PostgreSQL connection string |
| OPENAI_API_KEY | ✅ Yes | - | OpenAI API key |
| PORT | ❌ No | 3001 | Backend server port |
| NODE_ENV | ❌ No | development | Environment mode |
| JWT_SECRET | ❌ No | - | JWT signing secret |
| CORS_ORIGIN | ❌ No | http://localhost:3000 | Allowed frontend origin |
| SOCKET_IO_PING_TIMEOUT | ❌ No | 60000 | Socket ping timeout |
| SOCKET_IO_PING_INTERVAL | ❌ No | 25000 | Socket ping interval |
| MAX_PLAYERS_PER_GAME | ❌ No | 6 | Max players per game |
| MIN_PLAYERS_PER_GAME | ❌ No | 2 | Min players to start |
| TOTAL_ROUNDS | ❌ No | 8 | Total rounds per game |
| STARTING_CAPITAL | ❌ No | 1000000 | Starting player capital |

---

**You're all set!** 🚀 Your environment is configured and ready to go.

