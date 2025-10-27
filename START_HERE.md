# 🎮 START HERE - Get Your Game Running in 5 Minutes

## ⚡ Super Quick Setup

### Step 1: Create Backend .env File (1 minute)

**IMPORTANT**: You need to manually create this file because of security restrictions.

1. Navigate to: `backend/` folder
2. Create a new file named: `.env`
3. Copy and paste this content:

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

✅ **Save the file!**

### Step 2: Install Dependencies (2 minutes)

Open Terminal/PowerShell and run:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 3: Set Up Database (1 minute)

```bash
cd backend
npm run db:setup
```

You should see: ✅ "Database schema created successfully!"

### Step 4: Start the Game! (1 minute)

**Open TWO terminals:**

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
✅ You should see: "🚀 Server running on port 3001"

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ You should see: "Local: http://localhost:3000"

### Step 5: Play! 🎮

Open your browser and go to: **http://localhost:3000**

---

## 🎯 What to Do Next

1. Enter your CEO name
2. Enter your company name
3. Click "Start Game"
4. Buy tiles and build your empire!

---

## 🆘 Having Issues?

### "Cannot find module" error?
→ Run `npm install` in both backend and frontend folders

### "Database connection error"?
→ Make sure the .env file exists in backend/ folder with correct DATABASE_URL

### "Port 3001 already in use"?
→ Change PORT=3002 in backend/.env file

### "OpenAI API error"?
→ Check your API key is valid in the .env file

---

## 🎉 That's It!

Your game is now running and ready to play. Enjoy building your empire!

**Next Steps:**
- Read `GAME_DESIGN.md` for the full game concept
- Read `PROJECT_COMPLETE.md` for all features
- Read `SETUP.md` for detailed setup info
- Read `AI_SAFETY_AND_INTELLIGENCE.md` for AI safety details
- Read `AI_SYSTEM.md` for technical AI info

**Important**: Want to know about AI safety and intelligence? See `AI_SAFETY_AND_INTELLIGENCE.md`!

---

**Happy Gaming! 💼**

