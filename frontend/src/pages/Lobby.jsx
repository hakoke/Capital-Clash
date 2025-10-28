import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Users, Play, Copy, Check, Crown, Settings, Share2 } from 'lucide-react'
import { PLAYER_COLORS } from '../utils/monopolyConstants.js'
import GameSettingToggle from '../components/GameSettingToggle.jsx'

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
  const [customStartingCash, setCustomStartingCash] = useState('1500')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)

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
    setAnimationKey(prev => prev + 1)
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

  const updateStartingCash = async (amount) => {
    try {
      await axios.post(`/api/game/${gameId}/settings`, {
        setting: 'starting_cash',
        value: amount
      })
      fetchGameData()
    } catch (error) {
      console.error('Error updating starting cash:', error)
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

  const isHost = isPlayerInGame && players.length > 0 && players.find(p => p.order_in_game === 1)?.id === currentPlayerId

  // Show name input first, then color selection
  if (showNameInput && !isPlayerInGame) {
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
            <div className="mb-6">
              <label className="block text-white text-sm font-semibold mb-3 uppercase tracking-wide">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleEnterGame()}
                placeholder="Enter your name"
                className="w-full bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl px-6 py-4 text-white text-lg placeholder-white/40 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                autoFocus
              />
            </div>

            <button
              onClick={handleEnterGame}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-2xl transition-all hover:scale-105 flex items-center justify-center gap-2 hover:shadow-purple-500/50"
            >
              <span>→</span>
              Enter Game
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Color selection screen
  if (showColorSelection && !isPlayerInGame) {
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
          <div className="glass rounded-3xl p-8 border border-white/10 shadow-2xl animate-scale-in">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Select your player appearance</h2>
              <p className="text-white/60">Choose your color to join the game</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              {PLAYER_COLORS.map((colorObj) => {
                const isTaken = players.some(p => p.color === colorObj.name)
                const isSelected = selectedColor === colorObj.name
                
                return (
                  <button
                    key={colorObj.name}
                    disabled={isTaken}
                    onClick={() => !isTaken && setSelectedColor(colorObj.name)}
                    className={`
                      relative group h-28 rounded-2xl font-bold text-white
                      transition-all duration-300 flex flex-col items-center justify-center
                      ${isTaken 
                        ? 'opacity-30 cursor-not-allowed bg-gray-800 border-4 border-gray-700' 
                        : 'cursor-pointer hover:scale-110 hover:shadow-2xl border-4'
                      }
                      ${isSelected 
                        ? 'ring-4 ring-yellow-400 shadow-2xl scale-110 border-yellow-400 shadow-yellow-400/50' 
                        : isTaken ? '' : 'border-transparent hover:border-white/30'
                      }
                    `}
                    style={{ backgroundColor: isTaken ? undefined : colorObj.hex }}
                  >
                    {isSelected && !isTaken && (
                      <div className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 rounded-full w-8 h-8 flex items-center justify-center font-bold shadow-lg animate-bounce">
                        ✓
                      </div>
                    )}
                    {isTaken && (
                      <span className="text-3xl opacity-50">✕</span>
                    )}
                  </button>
                )
              })}
            </div>

            <button
              onClick={joinGame}
              disabled={loading || !selectedColor}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-xl text-lg shadow-2xl transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-purple-500/50"
            >
              {loading ? '⏳ Joining...' : 'Join Game'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 animated-bg">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-20 left-20 text-6xl animate-pulse">💰</div>
        <div className="absolute top-40 right-32 text-5xl animate-pulse delay-300">🏠</div>
        <div className="absolute bottom-32 left-40 text-7xl animate-pulse delay-700">🎲</div>
        <div className="absolute bottom-40 right-20 text-6xl animate-pulse delay-1000">💸</div>
      </div>

      <div className="max-w-7xl mx-auto p-4 relative z-10 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 animate-slide-up">
            🎲 RICH<span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">UP</span>.IO
          </h1>
          <p className="text-white/60 text-lg">{game.status === 'waiting' ? '⏳ Waiting for players...' : '🎮 Game in progress'}</p>
        </div>

        {/* Main Layout: 3-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Share & Chat */}
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {/* Share Game Card */}
            <div className="glass rounded-2xl p-5 border border-white/10 shadow-xl transition-all-smooth hover:scale-[1.02]">
              <div className="flex items-center gap-2 mb-3">
                <Share2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-white font-semibold text-sm uppercase tracking-wide">Share this game</h3>
              </div>
              <div className="flex gap-2 mb-2">
                <div className="flex-1 bg-white/10 rounded-lg px-4 py-2 text-sm font-mono text-white/80 truncate">
                  {window.location.origin}/lobby/{gameId}
                </div>
                <button
                  onClick={copyGameLink}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    linkCopied 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                  }`}
                >
                  {linkCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Players List */}
            {isPlayerInGame && (
              <div className="glass rounded-2xl p-5 border border-white/10 shadow-xl transition-all-smooth hover:scale-[1.02]">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-semibold text-sm uppercase tracking-wide">Players ({players.length}/6)</h3>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                  {players.map((player) => {
                    const isHost = player.order_in_game === 1
                    return (
                      <div 
                        key={player.id} 
                        className="bg-white/10 rounded-xl p-3 border border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all"
                        style={{ borderLeftColor: player.color, borderLeftWidth: '4px' }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0"
                            style={{ backgroundColor: player.color }}
                          >
                            {player.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white flex items-center gap-2 truncate">
                              {player.name}
                              {isHost && <Crown className="w-4 h-4 text-yellow-400" />}
                            </p>
                            <p className="text-green-400 font-semibold text-sm">${parseInt(player.money || 0).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Center Column: Game Info and Start Button */}
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {/* Game Info */}
            <div className="glass rounded-2xl p-6 border border-white/10 shadow-xl text-center transition-all-smooth hover:scale-[1.02]">
              <div className="text-6xl mb-4">🎲</div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-3xl font-black text-white">{players.length}</div>
                  <div className="text-sm text-white/60">Players</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-purple-400">${parseInt(game.starting_cash || 1500).toLocaleString()}</div>
                  <div className="text-sm text-white/60">Starting Cash</div>
                </div>
              </div>
              
              {isHost && (
                <>
                  <button
                    onClick={startGame}
                    disabled={loading || players.length < 2}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-2xl transition-all flex items-center justify-center gap-2 ${
                      players.length >= 2
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white hover:scale-105 hover:shadow-green-500/50'
                        : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {loading ? '⏳ Starting...' : '🚀 Start Game'}
                  </button>
                  <p className="text-xs text-white/40 mt-2">
                    {players.length < 2 ? `Need ${2 - players.length} more player${2 - players.length > 1 ? 's' : ''} to start` : 'Ready to start!'}
                  </p>
                </>
              )}

              {!isPlayerInGame && players.length >= 2 && game.status === 'waiting' && (
                <div className="text-yellow-400 flex items-center justify-center gap-2 mt-4">
                  <span className="animate-pulse">⏳</span>
                  <span className="text-sm">Waiting for host to start the game...</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Game Settings (Host Only) */}
          {isHost && game.status === 'waiting' && (
            <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="glass rounded-2xl p-6 border border-white/10 shadow-xl transition-all-smooth hover:scale-[1.02]">
                <div className="flex items-center gap-2 mb-5">
                  <Settings className="w-5 h-5 text-purple-400" />
                  <h3 className="text-white font-semibold text-sm uppercase tracking-wide">Gameplay rules</h3>
                </div>
                
                <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                  <GameSettingToggle
                    icon="💰"
                    title="x2 rent on full-set properties"
                    description="If a player owns a full property set, the base rent payment will be doubled"
                    setting="double_rent_on_full_set"
                    gameId={gameId}
                    game={game}
                  />
                  
                  <GameSettingToggle
                    icon="🏖️"
                    title="Vacation cash"
                    description="If a player lands on Vacation, all collected money from taxes and bank payments will be earned"
                    setting="vacation_cash"
                    gameId={gameId}
                    game={game}
                  />
                  
                  <GameSettingToggle
                    icon="🔨"
                    title="Auction"
                    description="If someone skips purchasing the property landed on, it will be sold to the highest bidder"
                    setting="auction_enabled"
                    gameId={gameId}
                    game={game}
                  />
                  
                  <GameSettingToggle
                    icon="⚖️"
                    title="Don't collect rent while in prison"
                    description="Rent will not be collected when landing on properties whose owners are in prison"
                    setting="no_rent_in_prison"
                    gameId={gameId}
                    game={game}
                  />
                  
                  <GameSettingToggle
                    icon="🏠"
                    title="Mortgage"
                    description="Mortgage properties to earn 50% of their cost, but you won't get paid rent when players land on them"
                    setting="mortgage_enabled"
                    gameId={gameId}
                    game={game}
                  />
                  
                  <GameSettingToggle
                    icon="⚖️"
                    title="Even build"
                    description="Houses and hotels must be built up and sold off evenly within a property set"
                    setting="even_build"
                    gameId={gameId}
                    game={game}
                  />
                  
                  {/* Starting Cash Selection */}
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">💰</span>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-white">Starting cash</div>
                        <div className="text-xs text-white/60">Adjust how much money players start the game with</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <select
                        value={parseInt(game.starting_cash || 1500)}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val === 'custom') {
                            setShowCustomInput(true)
                          } else {
                            setShowCustomInput(false)
                            updateStartingCash(parseInt(val))
                          }
                        }}
                        className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="500" className="bg-purple-900">$500</option>
                        <option value="1000" className="bg-purple-900">$1,000</option>
                        <option value="1500" className="bg-purple-900">$1,500 (Classic)</option>
                        <option value="2000" className="bg-purple-900">$2,000</option>
                        <option value="2500" className="bg-purple-900">$2,500</option>
                        <option value="3000" className="bg-purple-900">$3,000</option>
                        <option value="custom" className="bg-purple-900">Custom...</option>
                      </select>
                      
                      {showCustomInput && (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={customStartingCash}
                            onChange={(e) => setCustomStartingCash(e.target.value)}
                            placeholder="Enter amount"
                            min="100"
                            step="100"
                            className="bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 text-sm flex-1 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <button
                            onClick={() => {
                              const amount = parseInt(customStartingCash)
                              if (amount >= 100) {
                                updateStartingCash(amount)
                                setShowCustomInput(false)
                              }
                            }}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                          >
                            Set
                          </button>
                          <button
                            onClick={() => setShowCustomInput(false)}
                            className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Lobby

