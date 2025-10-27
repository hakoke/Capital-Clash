# 💼 Capital Clash: Rise of the CEOs

An AI-powered business strategy board game where players compete to build the most valuable company empire in a living, dynamic economy.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (Railway)
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/hakoke/Capital-Clash.git
cd Capital-Clash
```

2. **Install dependencies**
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Set up environment variables**
```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your credentials
```

4. **Start the application**
```bash
# Terminal 1 - Start backend
cd backend
npm run dev

# Terminal 2 - Start frontend
cd frontend
npm run dev
```

## 🎮 How to Play

1. **Create or Join a Game**: Set up a lobby with 2-6 players
2. **Choose Your Company**: Pick a name and starting district
3. **Take Actions**: Buy tiles, build companies, invest in districts
4. **Watch the AI**: Each round, AI generates news and market events
5. **Compete**: Build the most valuable empire and win!

## 🏗️ Architecture

```
capital-clash/
├── backend/           # Node.js/Express API
│   ├── controllers/   # Game logic controllers
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── services/      # OpenAI integration
│   └── utils/         # Helpers
├── frontend/          # React frontend
│   ├── components/    # UI components
│   ├── pages/         # Game screens
│   ├── hooks/         # Custom React hooks
│   └── utils/         # Frontend helpers
└── database/          # SQL schemas
```

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, PostgreSQL, Socket.io
- **Frontend**: React, TypeScript, Tailwind CSS, Three.js
- **AI**: OpenAI GPT-4 for dynamic events and storytelling
- **Database**: PostgreSQL (Railway)
- **Real-time**: WebSocket for multiplayer

## 📝 Environment Variables

See `.env.example` for the full list of required variables.

## 🤝 Contributing

This is a private project. Contact the owner for contribution guidelines.

## 📄 License

Private - All Rights Reserved

