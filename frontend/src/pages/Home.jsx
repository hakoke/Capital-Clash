import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Building2, Users, TrendingUp } from 'lucide-react'

function Home() {
  const [gameName, setGameName] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const createGame = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create game
      const gameRes = await axios.post('/api/game/create', {
        name: gameName || 'Monopoly Game'
      })

      const gameId = gameRes.data.game.id

      // Initialize board
      await axios.post(`/api/game/${gameId}/initialize-board`)

      navigate(`/lobby/${gameId}`)
    } catch (error) {
      console.error('Error creating game:', error)
      alert('Failed to create game. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Hero Section */}
      <div className="text-center mb-12 space-y-6 animate-slide-up">
        <h1 className="text-7xl font-display font-bold mb-4">
          🎲 MONOPOLY
        </h1>
        <p className="text-2xl text-gray-300 font-light">
          The Classic Real Estate Trading Game
        </p>
        <p className="text-lg text-gray-400 max-w-2xl">
          Buy, sell, and trade properties to become the wealthiest player!
          Roll dice, move around the board, and build your empire!
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-4xl">
        <div className="glass rounded-lg p-6 card-glow">
          <Building2 className="w-10 h-10 text-yellow-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Buy Properties</h3>
          <p className="text-gray-400">Purchase properties and collect rent from your opponents</p>
        </div>
        
        <div className="glass rounded-lg p-6 card-glow">
          <Users className="w-10 h-10 text-green-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Multiplayer Fun</h3>
          <p className="text-gray-400">Play with up to 6 friends in real-time</p>
        </div>

        <div className="glass rounded-lg p-6 card-glow">
          <TrendingUp className="w-10 h-10 text-blue-400 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Classic Gameplay</h3>
          <p className="text-gray-400">Experience the timeless rules of Monopoly</p>
        </div>
      </div>

      {/* Create Game Form */}
      <div className="glass rounded-xl p-8 w-full max-w-2xl card-glow">
        <h2 className="text-3xl font-bold mb-6 text-center">Create New Monopoly Game</h2>
        <form onSubmit={createGame} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Game Name (Optional)</label>
            <input
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Monopoly Fun"
              className="w-full px-4 py-3 rounded-lg bg-white text-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 rounded-lg font-semibold text-lg mt-6 disabled:opacity-50 bg-green-500 hover:bg-green-600"
          >
            {loading ? 'Creating Game...' : '🎮 Create Game'}
          </button>
        </form>
        
        <p className="text-center text-gray-400 text-sm mt-4">
          You'll choose your name and color when joining the lobby
        </p>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>Classic Monopoly Game • Built with React & Node.js</p>
      </div>
    </div>
  )
}

export default Home

