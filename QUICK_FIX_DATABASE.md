# Quick Fix for Database Error

## The Problem
The database tables don't exist yet, causing "relation 'properties' does not exist" errors.

## The Solution

I've added **automatic database initialization** that will run when you create your first game. 

### Option 1: Just Create a Game (Recommended)
The server will now automatically create the database tables when you create your first game. No manual setup needed!

1. Restart your backend server (if running, stop and start again)
2. Go to the homepage
3. Click "Create Game"
4. The database will auto-initialize

### Option 2: Manual Setup (If Needed)

If the automatic initialization doesn't work, run these commands:

```bash
cd backend
node database/setup.js
```

Then restart your server.

### What Was Fixed

- ✅ Auto-initializes database when creating games
- ✅ Checks if tables exist before using them
- ✅ Creates schema automatically
- ✅ No manual setup required

The game will now work immediately after you restart the server!

