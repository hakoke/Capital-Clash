import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { PLAYER_COLORS } from '../utils/monopolyConstants.js'

function Home() {
  const [playerName, setPlayerName] = useState('')
  const [selectedColor, setSelectedColor] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const createGame = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!selectedColor) {
        alert('Please select a color')
        return
      }

      // Create game
      const gameRes = await axios.post('/api/game/create', {
        name: 'Monopoly Game'
      })

      const gameId = gameRes.data.game.id

      // Initialize board
      await axios.post(`/api/game/${gameId}/initialize-board`)

      // Join as player with color
      const playerRes = await axios.post('/api/player/join', {
        gameId,
        playerName: playerName || 'Player',
        color: selectedColor
      })

      localStorage.setItem(`player_${gameId}`, playerRes.data.player.id)

      navigate(`/game/${gameId}`)
    } catch (error) {
      console.error('Error creating game:', error)
      alert('Failed to create game: ' + (error.response?.data?.error || error.message))
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
              <label className="block text-sm font-semibold mb-3 text-gray-300">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-lg bg-white text-gray-900 border-2 border-transparent focus:border-green-500 focus:ring-2 focus:ring-green-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-3 text-gray-300">Choose Your Color</label>
              <div className="grid grid-cols-3 gap-3">
                {PLAYER_COLORS.map((colorObj) => {
                  const isSelected = selectedColor === colorObj.name
                  return (
                    <button
                      key={colorObj.name}
                      type="button"
                      onClick={() => setSelectedColor(colorObj.name)}
                      className={`
                        w-full h-20 rounded-xl font-bold text-white
                        transition-all duration-200 flex flex-col items-center justify-center
                        cursor-pointer hover:scale-105 hover:shadow-lg
                        ${isSelected ? 'ring-4 ring-yellow-400 shadow-2xl scale-105' : ''}
                      `}
                      style={{ backgroundColor: colorObj.hex }}
                    >
                      {isSelected ? (
                        <>✓ <span className="text-xs mt-1">Selected</span></>
                      ) : (
                        <span className="text-xs capitalize">{colorObj.name}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedColor}
              className="w-full py-4 px-6 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-lg shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Creating...' : '🚀 Start Game'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Home

