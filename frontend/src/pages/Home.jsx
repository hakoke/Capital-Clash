import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function Home() {
  const [playerName, setPlayerName] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const createGame = async (e) => {
    e.preventDefault()
    
    if (!playerName.trim()) {
      alert('Please enter your name')
      return
    }

    setLoading(true)

    try {
      // Just create the game, don't join yet
      // The lobby will handle name/color selection
      const gameRes = await axios.post('/api/game/create', {
        name: 'Monopoly Game'
      })

      const gameId = gameRes.data.game.id

      // Initialize board
      await axios.post(`/api/game/${gameId}/initialize-board`)

      // Store name for lobby
      localStorage.setItem(`tempPlayerName_${gameId}`, playerName)

      // Navigate to lobby where user will select name and color
      navigate(`/lobby/${gameId}`)
    } catch (error) {
      console.error('Error creating game:', error)
      alert('Failed to create game: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 animated-bg">
      {/* Animated background icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 text-6xl opacity-10 animate-pulse">💰</div>
        <div className="absolute top-40 right-32 text-5xl opacity-10 animate-pulse delay-300">🏠</div>
        <div className="absolute bottom-32 left-40 text-7xl opacity-10 animate-pulse delay-700">🎲</div>
        <div className="absolute bottom-40 right-20 text-6xl opacity-10 animate-pulse delay-1000">💸</div>
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <div className="text-7xl mb-6 animate-bounce">🎲</div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-3 tracking-tight">
            lazydown<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">.oi</span>
          </h1>
          <p className="text-purple-200 text-lg font-medium">Rule the economy</p>
        </div>
      
        <div className="glass rounded-3xl p-8 border border-white/10 shadow-2xl animate-fade-in">
          <form onSubmit={createGame} className="space-y-6">
            <div>
              <label className="block text-white text-sm font-semibold mb-3 uppercase tracking-wide">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl px-6 py-4 text-white text-lg placeholder-white/40 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || !playerName.trim()}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-2xl transition-all hover:scale-105 flex items-center justify-center gap-2 hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Creating...' : '→ Create Game'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Home

