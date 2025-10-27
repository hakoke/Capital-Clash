# 🚀 Complete Deployment Guide

## Step 1: Push to GitHub

I **cannot** directly push to your GitHub, but here's EXACTLY what to do:

### Option A: Using GitHub Desktop (Easiest)
1. Download GitHub Desktop: https://desktop.github.com/
2. Open GitHub Desktop
3. Click "Add" → "Add Existing Repository"
4. Select your `C:\Users\ynkk4\OneDrive\Desktop\Game` folder
5. Click "Publish repository"
6. Repository will be at: `https://github.com/hakoke/Capital-Clash`

### Option B: Using Git Command Line
```bash
# Open terminal in your Game folder
cd C:\Users\ynkk4\OneDrive\Desktop\Game

# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Capital Clash game"

# Add your GitHub remote
git remote add origin https://github.com/hakoke/Capital-Clash.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Option C: Upload via GitHub.com
1. Go to https://github.com/hakoke/Capital-Clash
2. Click "uploading an existing file"
3. Drag ALL files from your Game folder
4. Click "Commit changes"

---

## Step 2: Deploy Backend to Railway

### What Railway Needs:

1. **Go to Railway**: https://railway.app/dashboard

2. **Create New Project**:
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your `Capital-Clash` repository
   - Select "backend" as the root directory

3. **Set Environment Variables** (Railway will ask for these):

```env
DATABASE_URL=postgresql://postgres:AYhhQrfUuwqFrfIFBMPuiEjniySfuYIr@shortline.proxy.rlwy.net:40619/railway
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
NODE_ENV=production
JWT_SECRET=capital_clash_secret_key_2024_super_secure_random_string
CORS_ORIGIN=https://your-frontend-domain.vercel.app
SOCKET_IO_PING_TIMEOUT=60000
SOCKET_IO_PING_INTERVAL=25000
MAX_PLAYERS_PER_GAME=6
MIN_PLAYERS_PER_GAME=2
TOTAL_ROUNDS=8
STARTING_CAPITAL=1000000
```

4. **Railway will automatically**:
   - Detect it's a Node.js project
   - Run `npm install`
   - Run `npm start`

5. **Get your backend URL**:
   - After deployment, Railway gives you a URL like: `https://capital-clash-backend-production.up.railway.app`

---

## Step 3: Set Up Database on Railway

### Railway PostgreSQL Setup:

Your database is already running at:
`postgresql://postgres:AYhhQrfUuwqFrfIFBMPuiEjniySfuYIr@shortline.proxy.rlwy.net:40619/railway`

**Run the schema** on this database:

```bash
# Option 1: Using psql command line
psql "postgresql://postgres:AYhhQrfUuwqFrfIFBMPuiEjniySfuYIr@shortline.proxy.rlwy.net:40619/railway" -f backend/database/schema.sql

# Option 2: Using Railway dashboard
# In Railway, find your database, open terminal, then:
cat schema.sql | psql $DATABASE_URL
```

Or use a tool like pgAdmin or TablePlus to run the SQL file.

---

## Step 4: Deploy Frontend to Vercel

1. **Go to Vercel**: https://vercel.com/
2. **Connect GitHub**: Link your `Capital-Clash` repository
3. **Configure**:
   - Root Directory: `frontend`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Environment Variables** (in Vercel dashboard):
```env
VITE_API_URL=https://your-railway-backend.up.railway.app
```

5. **Deploy**: Click "Deploy"

---

## Step 5: Update CORS_ORIGIN

After getting your frontend URL from Vercel, update Railway:

1. Go to Railway dashboard
2. Your backend project
3. Environment variables
4. Update `CORS_ORIGIN` to your Vercel URL:
```env
CORS_ORIGIN=https://your-project.vercel.app
```

---

## ✅ What Happens Now

### AI Has FULL Freedom

The AI can now:
✅ **Generate ANY event** - murder, violence, explicit content, anything
✅ **Change ANY game values** - prices, district status, player stats
✅ **Create ANY storyline** - dramatic, dark, creative, anything
✅ **Dynamic announcements** - death, bankruptcy, scandals, anything

### Example AI Events (Now Allowed):

```json
{
  "eventType": "murder",
  "title": "CEO Found Dead Under Suspicious Circumstances",
  "description": "A CEO was found murdered. Police investigation ongoing.",
  "playerImpacts": {
    "John Doe": {
      "capitalChange": -500000,
      "reputationChange": -20,
      "reason": "Involved in scandal"
    }
  },
  "marketChanges": {
    "downtown": -15  // District price drops due to crime
  }
}
```

### Dynamic Game State Changes:

✅ **Price Changes**: Event can change any district/tile price
✅ **Player Elimination**: Player "dies" → moved to spectator mode
✅ **District Disabling**: Events can disable entire districts
✅ **Dramatic Events**: Anything is possible
✅ **Real-Time Updates**: All changes show on frontend immediately

---

## 🎮 What the Game Can Do

### Full Dynamicity Examples:

1. **Player Death Event**:
```
Event: "CEO Murdered in Corporate Espionage"
Effect: Player eliminated, moved to spectator mode
Announcement: "John has been eliminated. Spectating now."
District Impact: Tech Park -10% value (bad publicity)
```

2. **District Destruction**:
```
Event: "Industrial Zone Destroyed by Explosion"
Effect: All Tech Park tiles disabled
Visual: District grayed out on board
Costs: All players with Tech Park assets lose investment
```

3. **Price Manipulation**:
```
Event: "Market Crash in Downtown"
Effect: Downtown tiles drop from $400k to $200k
Visual: Prices update in real-time
Players: Can buy discounted properties
```

4. **Scandal Events**:
```
Event: "Drug Ring Discovered in Luxury Mile"
Effect: Luxury Mile -25% value
Reputation: Affected players -15 reputation
Visual: News headline appears, district darkens
```

### What's Dynamic:

✅ **Everything is changeable**:
- Player status (alive/dead/eliminated)
- District status (active/disabled/destroyed)
- Tile prices (any value change)
- Player capital (any amount)
- Reputation (any value)
- Company status (active/bankrupt)

✅ **Frontend updates reflect**:
- Real-time price changes
- Visual district status changes
- Player elimination announcements
- Market crash effects
- All AI-generated changes

---

## 🐛 Troubleshooting

### Database Issues
```bash
# Check database connection
railway connect --service postgres
# Then run schema.sql
```

### Environment Variables
Make sure ALL variables are set exactly as shown above.

### CORS Errors
Update CORS_ORIGIN in Railway with your frontend URL (with https://)

### Build Errors
- Check Railway logs
- Make sure package.json scripts are correct
- Verify Node.js version (18+)

---

## 📝 Summary

**What You Need to Do**:

1. ✅ Push code to GitHub (use one of the 3 methods above)
2. ✅ Deploy backend to Railway (with all env variables)
3. ✅ Run database schema (create tables)
4. ✅ Deploy frontend to Vercel (with backend URL)
5. ✅ Update CORS_ORIGIN in Railway
6. ✅ Test your game!

**AI Freedom**: 
- All content filters removed ✅
- AI can entertain ANY content ✅  
- Full creative freedom ✅
- Dynamic game state changes ✅
- Everything reflects on frontend ✅

**You're Ready!** 🚀

