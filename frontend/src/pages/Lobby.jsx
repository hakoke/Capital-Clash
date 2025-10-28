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
  const [playerName, setPlayerName] = useState('')
  const [selectedColor, setSelectedColor] = useState(null)
  const [isPlayerInGame, setIsPlayerInGame] = useState(false)
  const [currentPlayerId, setCurrentPlayerId] = useState(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const [showColorSelection, setShowColorSelection] = useState(false)
  const [showNameInput, setShowNameInput] = useState(true)

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

  const handleEnterGame = () => {
    if (!playerName.trim()) {
      alert('Please enter your name')
      return
    }
    setShowNameInput(false)
    setShowColorSelection(true)
  }

  const joinGame = async () => {
    if (!selectedColor) {
      alert('Please select a color')
      return
    }
    setLoading(true)
    try {
      const res = await axios.post('/api/player/join', {
        gameId,
        playerName: playerName || 'Player',
        color: selectedColor
      })
      localStorage.setItem(`player_${gameId}`, res.data.player.id)
      setIsPlayerInGame(true)
      setCurrentPlayerId(res.data.player.id)
      setShowColorSelection(false)
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

  // Show name input first, then color selection
  if (showNameInput && !isPlayerInGame) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🎲</div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              RICH<span className="text-purple-300">UP.IO</span>
            </h1>
            <p className="text-purple-200">Rule the economy</p>
          </div>
          
          <div className="bg-purple-900 rounded-2xl p-8 border-2 border-purple-700 shadow-2xl">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleEnterGame()}
              placeholder="n"
              className="w-full bg-purple-800 border-2 border-purple-600 rounded-xl px-6 py-4 text-white text-lg placeholder-purple-400 focus:border-purple-400 focus:outline-none mb-4"
            />
            <button
              onClick={handleEnterGame}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              Enter Game
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-blue-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
            🎲 MONOPOLY GAME
          </h1>
          <p className="text-purple-200">{game.name}</p>
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
                  : 'bg-purple-500 hover:bg-purple-600 text-white'
              }`}
            >
              {linkCopied ? '✓ Copied!' : 'Copy'}
            </button>
            </div>
          </div>
        </div>
        
        {/* Game Settings */}
        {players.length > 0 && (
          <div className="bg-purple-900 rounded-2xl shadow-xl p-6 mb-6 border-2 border-purple-700">
            <h3 className="text-xl font-bold text-white mb-4">Gameplay rules</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-purple-800 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💰</span>
                  <div>
                    <div className="text-sm font-semibold text-white">x2 rent on full-set properties</div>
                    <div className="text-xs text-purple-300">If a player owns a full property set, the base rent payment will be doubled</div>
                  </div>
                </div>
                <div className="bg-purple-600 rounded-full w-12 h-6 flex items-center justify-end px-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-purple-800 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏖️</span>
                  <div>
                    <div className="text-sm font-semibold text-white">Vacation cash</div>
                    <div className="text-xs text-purple-300">If a player lands on Vacation, all collected money from taxes and bank payments will be earned</div>
                  </div>
                </div>
                <div className="bg-purple-600 rounded-full w-12 h-6 flex items-center justify-end px-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-purple-800 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔨</span>
                  <div>
                    <div className="text-sm font-semibold text-white">Auction</div>
                    <div className="text-xs text-purple-300">If someone skips purchasing the property landed on, it will be sold to the highest bidder</div>
                  </div>
                </div>
                <div className="bg-purple-600 rounded-full w-12 h-6 flex items-center justify-end px-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-purple-800 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚖️</span>
                  <div>
                    <div className="text-sm font-semibold text-white">Don't collect rent while in prison</div>
                    <div className="text-xs text-purple-300">Rent will not be collected when landing on properties whose owners are in prison</div>
                  </div>
                </div>
                <div className="bg-purple-600 rounded-full w-12 h-6 flex items-center justify-end px-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-purple-800 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏠</span>
                  <div>
                    <div className="text-sm font-semibold text-white">Mortgage</div>
                    <div className="text-xs text-purple-300">Mortgage properties to earn 50% of their cost, but you won't get paid rent when players land on them</div>
                  </div>
                </div>
                <div className="bg-purple-600 rounded-full w-12 h-6 flex items-center justify-end px-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-purple-800 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚖️</span>
                  <div>
                    <div className="text-sm font-semibold text-white">Even build</div>
                    <div className="text-xs text-purple-300">Houses and hotels must be built up and sold off evenly within a property set</div>
                  </div>
                </div>
                <div className="bg-purple-600 rounded-full w-12 h-6 flex items-center justify-end px-1 cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-purple-800 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">💰</span>
                  <div>
                    <div className="text-sm font-semibold text-white">Starting cash</div>
                    <div className="text-xs text-purple-300">Adjust how much money players start the game with</div>
                  </div>
                </div>
                <div className="text-green-400 font-bold">$1,500</div>
              </div>
            </div>
          </div>
        )}

        {/* Players List - Only show when in game */}
        {isPlayerInGame && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Players ({players.length}/6)</h2>
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
                        <p className="text-green-600 font-semibold">${parseInt(player.money || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Start Button - Only for host */}
        {players.length >= 2 && game.status === 'waiting' && isPlayerInGame && players.find(p => p.order_in_game === 1)?.id === currentPlayerId && (
          <div className="flex justify-center mb-6">
            <button
              onClick={startGame}
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white px-12 py-4 rounded-xl font-bold text-xl shadow-2xl transition-all hover:scale-105 disabled:opacity-50"
            >
              {loading ? (
                'Starting...'
              ) : (
                'Start Game'
              )}
            </button>
          </div>
        )}
        
        {/* Game Board Preview as Background */}
        {isPlayerInGame && (
          <div className="relative bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl p-6 mb-6 opacity-20 blur-sm pointer-events-none">
            <div className="grid grid-cols-4 gap-2">
              {Array.from({length: 16}).map((_, i) => (
                <div key={i} className="bg-white bg-opacity-10 rounded p-4 text-center text-xs">
                  Property {i+1}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Color Selection Screen - Similar to screenshot */}
        {!isPlayerInGame && showColorSelection && (
          <div className="bg-purple-900 rounded-2xl shadow-2xl p-8 border-2 border-purple-700">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Select your player appearance:</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              {PLAYER_COLORS.map((colorObj) => {
                const isTaken = players.some(p => p.color === colorObj.name)
                const isSelected = selectedColor === colorObj.name
                
                if (isTaken) {
                  return (
                    <button
                      key={colorObj.name}
                      disabled
                      className="w-full h-24 rounded-full bg-gray-600 opacity-30 cursor-not-allowed flex items-center justify-center border-4 border-gray-500"
                    >
                      <span className="text-2xl">✕</span>
                    </button>
                  )
                }
                
                return (
                  <button
                    key={colorObj.name}
                    type="button"
                    onClick={() => setSelectedColor(colorObj.name)}
                    className={`
                      w-full h-24 rounded-full font-bold text-white
                      transition-all duration-200 flex items-center justify-center
                      cursor-pointer hover:scale-105 hover:shadow-2xl border-4
                      ${isSelected ? 'ring-4 ring-yellow-400 shadow-2xl scale-110 border-yellow-400' : 'border-transparent'}
                    `}
                    style={{ backgroundColor: colorObj.hex }}
                  >
                    {isSelected && <div className="text-3xl">✓</div>}
                  </button>
                )
              })}
            </div>

            <button
              onClick={joinGame}
              disabled={loading || !selectedColor}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-400 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Joining...' : 'Join Game'}
            </button>
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

