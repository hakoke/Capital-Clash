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

  const [showColorSelection, setShowColorSelection] = useState(false)

  const handleEnterGame = () => {
    if (!playerName.trim()) {
      alert('Please enter your name')
      return
    }
    setShowColorSelection(true)
  }

  if (showColorSelection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 animated-bg">
        {/* Animated background icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 text-6xl opacity-10 animate-pulse">💰</div>
          <div className="absolute top-40 right-32 text-5xl opacity-10 animate-pulse delay-300">🏠</div>
          <div className="absolute bottom-32 left-40 text-7xl opacity-10 animate-pulse delay-700">🎲</div>
          <div className="absolute bottom-40 right-20 text-6xl opacity-10 animate-pulse delay-1000">💸</div>
        </div>

        <div className="max-w-2xl w-full mx-auto p-6 relative z-10">
          <div className="glass rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Select your player appearance</h2>
              <p className="text-white/60">Choose your color to create the game</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              {PLAYER_COLORS.map((colorObj) => {
                const isSelected = selectedColor === colorObj.name
                
                return (
                  <button
                    key={colorObj.name}
                    type="button"
                    onClick={() => setSelectedColor(colorObj.name)}
                    className={`
                      relative group h-28 rounded-2xl font-bold text-white
                      transition-all duration-300 flex flex-col items-center justify-center
                      cursor-pointer hover:scale-110 hover:shadow-2xl border-4
                      ${isSelected 
                        ? 'ring-4 ring-yellow-400 shadow-2xl scale-110 border-yellow-400 shadow-yellow-400/50' 
                        : 'border-transparent hover:border-white/30'
                      }
                    `}
                    style={{ backgroundColor: colorObj.hex }}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg animate-bounce">
                        ✓
                      </div>
                    )}
                    <span className="text-xs capitalize opacity-80">{colorObj.name}</span>
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => {
                if (!selectedColor) {
                  alert('Please select a color')
                  return
                }
                createGame({ preventDefault: () => {} })
              }}
              disabled={loading || !selectedColor}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-2xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-purple-500/50"
            >
              {loading ? '⏳ Creating...' : '🚀 Start Game'}
            </button>
          </div>
        </div>
      </div>
    )
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
            RICH<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">UP</span>.IO
          </h1>
          <p className="text-purple-200 text-lg font-medium">Rule the economy</p>
        </div>
        
        <div className="glass rounded-3xl p-8 border border-white/10 shadow-2xl animate-fade-in">
          <form onSubmit={(e) => { e.preventDefault(); handleEnterGame(); }} className="space-y-6">
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
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-2xl transition-all hover:scale-105 flex items-center justify-center gap-2 hover:shadow-purple-500/50"
            >
              <span>→</span>
              Create Game
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Home

