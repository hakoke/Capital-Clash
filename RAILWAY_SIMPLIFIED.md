# 🚂 Deploy Everything on Railway - SIMPLIFIED

## ✅ YES - One Railway Service Does Everything!

Railway can host backend + frontend on one service!

---

## 🚀 3 Simple Steps

### Step 1: Push to GitHub

1. Go to: https://github.com/hakoke/Capital-Clash
2. Drag ALL files from your Game folder
3. Commit

**Done!**

---

### Step 2: Deploy to Railway

1. **Go to**: https://railway.app/dashboard
2. **New Project** → "Deploy from GitHub repo"
3. **Select**: `Capital-Clash`
4. **Root Directory**: `backend`
5. **Add Environment Variables**:

```
DATABASE_URL=postgresql://postgres:AYhhQrfUuwqFrfIFBMPuiEjniySfuYIr@shortline.proxy.rlwy.net:40619/railway

OPENAI_API_KEY=your_openai_api_key_here

PORT=3001

NODE_ENV=production

JWT_SECRET=capital_clash_secret_key_2024

CORS_ORIGIN=https://your-app-name.up.railway.app

SOCKET_IO_PING_TIMEOUT=60000

SOCKET_IO_PING_INTERVAL=25000

MAX_PLAYERS_PER_GAME=6

MIN_PLAYERS_PER_GAME=2

TOTAL_ROUNDS=8

STARTING_CAPITAL=1000000
```

6. **Set Build Command** (in Settings → Build):
```bash
cd frontend && npm install && npm run build && cd ../backend && npm install && npm start
```

7. **Deploy!**

Railway will:
- Build your frontend
- Start your backend
- Serve everything from one URL!

---

### Step 3: Setup Database

In Railway terminal or any PostgreSQL tool:

Run: `backend/database/schema.sql`

**Done!**

---

### Step 4: Play! 🎮

Your game is at: `https://your-app-name.up.railway.app`

**One URL. Everything works!**

---

## ✅ What You Get

- ✅ Backend API on `/api/*`
- ✅ Frontend React app on all other routes
- ✅ WebSocket for real-time
- ✅ Database on Railway
- ✅ HTTPS automatically
- ✅ One URL for everything

**NO Vercel needed! All on Railway!** 🚀

