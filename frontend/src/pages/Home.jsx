import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <div className="max-w-md w-full">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-6xl md:text-7xl font-bold mb-4">
            🎲
          </h1>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-2">
            MONOPOLY
          </h2>
          <p className="text-gray-400">
            The Classic Game
          </p>
        </div>

        {/* Create Game Form */}
        <div className="glass rounded-2xl p-6 md:p-8 shadow-2xl">
          <form onSubmit={createGame} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-300">Game Name</label>
              <input
                type="text"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="My Monopoly Game"
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border-2 border-transparent focus:border-green-500 focus:ring-2 focus:ring-green-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-lg shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Creating...' : '🎮 Create Game'}
            </button>
          </form>
          
          <p className="text-center text-gray-400 text-sm mt-4">
            You'll choose your name and color in the lobby
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home

