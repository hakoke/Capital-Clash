import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Users, Play } from 'lucide-react'
import { PLAYER_COLORS } from '../utils/monopolyConstants.js'

function Lobby() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [selectedColor, setSelectedColor] = useState(null)
  const [isPlayerInGame, setIsPlayerInGame] = useState(false)
  const [currentPlayerId, setCurrentPlayerId] = useState(null)
  const [linkCopied, setLinkCopied] = useState(false)

  useEffect(() => {
    fetchGameData()
    const interval = setInterval(fetchGameData, 2000)
    return () => clearInterval(interval)
  }, [])

  // Redirect to game when game status changes to 'active'
  useEffect(() => {
    if (game && game.status === 'active' && isPlayerInGame) {
      navigate(`/game/${gameId}`)
    }
  }, [game?.status, isPlayerInGame, gameId])

  const fetchGameData = async () => {
    try {
      const res = await axios.get(`/api/game/${gameId}`)
      setGame(res.data.game)
      setPlayers(res.data.players)
      
      // Check if localStorage has a player ID for this game
      const savedPlayerId = localStorage.getItem(`player_${gameId}`)
      if (savedPlayerId && res.data.players.some(p => p.id === savedPlayerId)) {
        setIsPlayerInGame(true)
        setCurrentPlayerId(savedPlayerId)
      } else {
        setIsPlayerInGame(false)
      }
    } catch (error) {
      console.error('Error fetching game:', error)
    }
  }

  const joinGame = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post('/api/player/join', {
        gameId,
        playerName: playerName || 'Player',
        color: selectedColor || PLAYER_COLORS[players.length % PLAYER_COLORS.length].name
      })
      localStorage.setItem(`player_${gameId}`, res.data.player.id)
      setIsPlayerInGame(true)
      setCurrentPlayerId(res.data.player.id)
      setShowJoinForm(false)
      fetchGameData()
    } catch (error) {
      console.error('Error joining game:', error)
      alert('Failed to join game: ' + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  const startGame = async () => {
    setLoading(true)
    try {
      await axios.post(`/api/game/${gameId}/start`)
      navigate(`/game/${gameId}`)
    } catch (error) {
      console.error('Error starting game:', error)
      alert('Failed to start game. Need at least 2 players.')
    } finally {
      setLoading(false)
    }
  }

  const copyGameLink = async () => {
    const link = `${window.location.origin}/lobby/${gameId}`
    try {
      await navigator.clipboard.writeText(link)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = link
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    }
  }

  if (!game) return <div className="min-h-screen flex items-center justify-center"><div className="text-xl">Loading...</div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-500 to-emerald-600 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            🎲 Monopoly Game
          </h1>
          <p className="text-xl text-green-100">{game.name}</p>
        </div>

        {/* Game Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-600 uppercase">Players</div>
                <div className="text-2xl font-bold text-gray-800">{players.length}/6</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎮</span>
              </div>
              <div>
                <div className="text-xs text-gray-600 uppercase">Status</div>
                <div className="text-lg font-bold text-green-600 capitalize">{game.status}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <div>
                <div className="text-xs text-gray-600 uppercase">Starting Money</div>
                <div className="text-lg font-bold text-purple-600">$1,500</div>
              </div>
            </div>
          </div>

          {/* Copy Link Button */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-100 rounded-lg px-4 py-2 text-sm font-mono text-gray-700">
                {window.location.origin}/lobby/{gameId}
              </div>
              <button
                onClick={copyGameLink}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  linkCopied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {linkCopied ? '✓ Copied!' : '📋 Copy Link'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Share this link with your friends</p>
          </div>
        </div>

        {/* Players List */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">👥 Players ({players.length}/6)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {players.map((player, index) => {
              const isHost = player.order_in_game === 1
              return (
                <div 
                  key={player.id} 
                  className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border-2 transition-all hover:shadow-lg"
                  style={{ borderColor: player.color }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0"
                      style={{ backgroundColor: player.color }}
                    >
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lg flex items-center gap-2 truncate">
                        {player.name}
                        {isHost && <span className="text-xl" title="Host">👑</span>}
                      </p>
                      <p className="text-green-600 font-semibold">💰 ${parseInt(player.money || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {/* Empty player slots */}
            {Array.from({ length: 6 - players.length }).map((_, idx) => (
              <div key={`empty-${idx}`} className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center min-h-[80px]">
                <span className="text-gray-400 text-sm">Waiting for player...</span>
              </div>
            ))}
          </div>
          {players.length < 2 && (
            <p className="text-orange-600 font-semibold text-center mt-4 bg-orange-50 py-2 rounded-lg">
              ⚠️ Need at least 2 players to start
            </p>
          )}
        </div>

        {/* Start Button - Only for host */}
        {players.length >= 2 && game.status === 'waiting' && isPlayerInGame && players.find(p => p.order_in_game === 1)?.id === currentPlayerId && (
          <div className="flex justify-center mb-6">
            <button
              onClick={startGame}
              disabled={loading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-12 py-4 rounded-xl font-bold text-xl shadow-2xl transition-all hover:scale-105 flex items-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <><span className="animate-spin">⚙️</span> Starting...</>
              ) : (
                <>
                  <Play className="w-6 h-6" />
                  🚀 Start Monopoly Game
                </>
              )}
            </button>
          </div>
        )}

        {/* Join Game Form */}
        {!isPlayerInGame && !showJoinForm && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setShowJoinForm(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-12 py-4 rounded-xl font-bold text-xl shadow-lg transition-all hover:scale-105"
            >
              🎮 Join This Game
            </button>
          </div>
        )}
        {!isPlayerInGame && showJoinForm && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Join Game</h2>
            <form onSubmit={joinGame} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">👤 Your Name</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-700">🎨 Choose Your Color</label>
                <div className="grid grid-cols-3 gap-3">
                  {PLAYER_COLORS.map((colorObj) => {
                    const isTaken = players.some(p => p.color === colorObj.name)
                    const isSelected = selectedColor === colorObj.name
                    return (
                      <button
                        key={colorObj.name}
                        type="button"
                        onClick={() => !isTaken && setSelectedColor(colorObj.name)}
                        disabled={isTaken}
                        className={`
                          w-full h-20 rounded-xl font-bold text-white
                          transition-all duration-200 flex flex-col items-center justify-center
                          ${isTaken ? 'opacity-30 cursor-not-allowed bg-gray-500' : 'cursor-pointer hover:scale-105 hover:shadow-lg'}
                          ${isSelected ? 'ring-4 ring-yellow-400 shadow-2xl scale-105' : ''}
                        `}
                        style={{ backgroundColor: isTaken ? '#gray' : colorObj.hex }}
                        title={isTaken ? 'Taken by another player' : 'Click to select ' + colorObj.name.charAt(0).toUpperCase() + colorObj.name.slice(1)}
                      >
                        {isTaken ? (
                          <>✕ <span className="text-xs mt-1">Taken</span></>
                        ) : isSelected ? (
                          <>✓ <span className="text-xs mt-1">Selected</span></>
                        ) : (
                          <span className="text-xs capitalize">{colorObj.name}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || !selectedColor}
                  className="flex-1 px-6 py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 shadow-lg"
                >
                  {loading ? '⏳ Joining...' : '✅ Join Game'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowJoinForm(false)}
                  className="px-6 py-4 bg-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-400 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* If already in game but can't start */}
        {isPlayerInGame && players.length >= 2 && game.status === 'waiting' && players.find(p => p.order_in_game === 1)?.id !== currentPlayerId && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 text-center shadow-xl">
            <div className="text-4xl mb-2">⏳</div>
            <p className="text-gray-700 font-semibold">Waiting for host to start the game...</p>
            <p className="text-sm text-gray-600 mt-2">The host will begin the game shortly!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Lobby

