# 🚂 Deploy Everything on Railway - Complete Guide

## ✅ YES - Railway Can Host EVERYTHING!

Railway can deploy:
- ✅ Your backend (Node.js/Express)
- ✅ Your frontend (React/Vite)
- ✅ Your database (PostgreSQL)

**NO Vercel needed!** Everything on Railway!

---

## 🚀 Railway-Only Deployment Steps

### Step 1: Push to GitHub

Easiest way:
1. Go to: https://github.com/hakoke/Capital-Clash
2. Click: "uploading an existing file"
3. Drag: ALL files from `C:\Users\ynkk4\OneDrive\Desktop\Game`
4. Click: "Commit changes"

Done! Your code is on GitHub.

---

### Step 2: Deploy Backend to Railway

1. **Go to Railway**: https://railway.app/dashboard
2. **New Project** → "Deploy from GitHub repo"
3. **Select**: `Capital-Clash` repository
4. **Root Directory**: Set to `backend`
5. **Add Variables** (Environment → Variables):

```env
DATABASE_URL=postgresql://postgres:AYhhQrfUuwqFrfIFBMPuiEjniySfuYIr@shortline.proxy.rlwy.net:40619/railway

OPENAI_API_KEY=your_openai_api_key_here

PORT=3001

NODE_ENV=production

JWT_SECRET=capital_clash_secret_key_2024_super_secure_random_string

CORS_ORIGIN=https://your-frontend-domain.railway.app

SOCKET_IO_PING_TIMEOUT=60000

SOCKET_IO_PING_INTERVAL=25000

MAX_PLAYERS_PER_GAME=6

MIN_PLAYERS_PER_GAME=2

TOTAL_ROUNDS=8

STARTING_CAPITAL=1000000
```

6. **Deploy** - Railway will automatically:
   - Install dependencies
   - Build your backend
   - Start the server

7. **Copy your backend URL**: 
   - Railway gives you: `https://your-backend-production.up.railway.app`
   - **Save this URL!**

---

### Step 3: Setup Database

Your database is already running at:
```
postgresql://postgres:AYhhQrfUuwqFrfIFBMPuiEjniySfuYIr@shortline.proxy.rlwy.net:40619/railway
```

**Run the schema:**

Option A - Using Railway terminal:
1. In Railway → Your Backend Service
2. Click "Connect" → "Open Terminal"
3. Run:
```bash
psql $DATABASE_URL -f backend/database/schema.sql
```

Option B - Using any PostgreSQL tool:
1. Download pgAdmin or TablePlus
2. Connect to your Railway database
3. Run `backend/database/schema.sql`

---

### Step 4: Deploy Frontend to Railway

**IMPORTANT**: Railway needs the frontend built first!

1. **Create new service in Railway**:
   - In your project, click "New Service"
   - Select "Deploy from GitHub repo"
   - Select same `Capital-Clash` repository
   - Root Directory: `frontend`

2. **Build settings**:
   - Railway auto-detects it's a React app
   - Use these build settings:
     - **Build Command**: `npm run build`
     - **Start Command**: `npm run preview` (or create a server)
   
3. **Add environment variable**:
   - Variable: `VITE_API_URL`
   - Value: `https://your-backend-production.up.railway.app`
   - (Use the URL from Step 2)

4. **Alternative - Serve built files**:
   - Railway will build your React app
   - But to serve it properly, create `backend/static-server.js`:

```javascript
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files from frontend/dist
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// All routes go to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Frontend served on port ${PORT}`);
});
```

**Better approach - Add frontend to backend**:

Update `backend/server.js` to serve frontend:

```javascript
// Add this to backend/server.js BEFORE routes

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from frontend/dist
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// All API routes (keep existing)
app.use('/api/game', gameRoutes);
// ... etc

// All other routes go to React app (ADD THIS AT THE END)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});
```

Then Railway will serve both backend API and frontend from one service!

---

### Step 5: Configure Production Build

Add to `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
```

---

### Step 6: Build and Deploy

**Option A - Separate Services** (Easier):
1. Backend service on Railway (port 3001)
2. Frontend service on Railway (separate)
3. Update frontend `VITE_API_URL` to backend URL

**Option B - Combined Service** (Recommended):
1. Update `backend/server.js` to serve frontend (as shown above)
2. Add build step to Railway:
   - Build Command: `cd frontend && npm install && npm run build`
   - Then: `node backend/server.js`
3. One URL for everything!

---

### Step 7: Update CORS

After deployment, update:
- Variable: `CORS_ORIGIN`
- Value: Your Railway URL (e.g., `https://capital-clash-production.up.railway.app`)

---

### Step 8: Access Your Game!

Your game will be at:
- `https://your-backend-production.up.railway.app`

Everything runs on Railway - frontend, backend, database!

---

## 📁 Railway Project Structure

```
railway-project/
├── backend/           # Deployed as main service
│   ├── server.js      # Serves API + Frontend
│   ├── routes/        # All API routes
│   ├── services/      # AI service
│   └── database/      # Schema
├── frontend/          # Built and served
│   ├── src/          # React app
│   └── dist/         # Production build
└── postgres/          # Railway PostgreSQL
```

**One URL**, **One Service**, **Everything works!**

---

## ✅ Quick Summary

**Deploy to Railway:**
1. ✅ Push to GitHub
2. ✅ Railway → New Project → GitHub repo
3. ✅ Root: `backend`
4. ✅ Add all variables from `RAILWAY_VARIABLES.txt`
5. ✅ Update `backend/server.js` to serve frontend
6. ✅ Run database schema
7. ✅ Deploy!
8. ✅ Play!

**Railway provides:**
- ✅ HTTPS automatically
- ✅ Custom domain option
- ✅ Database included
- ✅ Auto-scaling
- ✅ Logs dashboard

**NO Vercel needed!** Everything on Railway! 🚀

---

## 🎯 Recommended: Combined Deployment

Best approach - serve everything from one Railway service:

1. **Update backend/server.js** to serve frontend
2. **Set build command** in Railway:
   ```bash
   cd frontend && npm install && npm run build && cd .. && node backend/server.js
   ```
3. **One service** serves both API and frontend
4. **One URL** for everything!

**This is the simplest!** ✅

