import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Users, Copy, Check, Crown, Settings, MessageCircle, Volume2, Search, HelpCircle, X, ChevronRight, Info, Bot } from 'lucide-react'
import { PLAYER_COLORS } from '../utils/monopolyConstants.js'
import GameSettingToggle from '../components/GameSettingToggle.jsx'
import { motion, AnimatePresence } from 'framer-motion'

const layoutVariants = {
  enter: { opacity: 0, y: 80 },
  center: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -80, transition: { duration: 0.35, ease: 'easeIn' } },
}

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
  const [showNameInput, setShowNameInput] = useState(false)
  const [showAdBlocker, setShowAdBlocker] = useState(true)
  const [maxPlayers, setMaxPlayers] = useState(4)

  useEffect(() => {
    fetchGameData()
    const interval = setInterval(fetchGameData, 2000)
    return () => clearInterval(interval)
  }, [])

  // Load player name from localStorage and show color selection if not joined
  useEffect(() => {
    if (game && !isPlayerInGame) {
      const tempName = localStorage.getItem(`tempPlayerName_${gameId}`)
      if (tempName && !playerName) {
        setPlayerName(tempName)
        setShowColorSelection(true)
      }
    }
  }, [game])

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

  const handleNameSubmit = () => {
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

  const isHost = isPlayerInGame && players.length > 0 && players.find(p => p.order_in_game === 1)?.id === currentPlayerId
  const maxPlayersValue = maxPlayers

  const emptySlots = useMemo(() => {
    if (!maxPlayersValue) return []
    const remaining = Math.max(maxPlayersValue - players.length, 0)
    return Array.from({ length: remaining })
  }, [maxPlayersValue, players.length])

  const playerByColor = useMemo(() => {
    const map = new Map()
    players.forEach(player => {
      if (player?.color) {
        map.set(player.color, player)
      }
    })
    return map
  }, [players])

  if (!game) return <div className="min-h-screen flex items-center justify-center bg-purple-950"><div className="text-xl text-white">Loading...</div></div>

    return (
    <div className="min-h-screen bg-[#280040] relative">
      {/* Blurred game board background */}
      <div className="absolute inset-0 bg-[#280040] backdrop-blur-3xl">
        <div className="w-full h-full opacity-30" style={{
          backgroundImage: `url('data:image/svg+xml,${encodeURIComponent('<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="50" height="50" fill="%23FFD700"/><rect x="50" y="0" width="50" height="50" fill="%23DC143C"/><rect x="100" y="0" width="50" height="50" fill="%234169E1"/><rect x="150" y="0" width="50" height="50" fill="%23228B22"/><rect x="200" y="0" width="50" height="50" fill="%23FF8C00"/><rect x="250" y="0" width="50" height="50" fill="%23DC143C"/><rect x="300" y="0" width="50" height="50" fill="%23FFD700"/><rect x="350" y="0" width="50" height="50" fill="%23FF69B4"/></svg>')}')`,
          backgroundSize: 'contain',
          backgroundRepeat: 'repeat'
        }} />
        </div>

      {/* Header */}
      <div className="relative z-20 px-6 py-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">poordown.io</h1>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
              </div>
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-white" />
              </div>
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-white" />
            </div>
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
            <Search className="w-5 h-5 text-white" />
            </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex h-[calc(100vh-80px)]">
        {/* Left Panel - Share and Chat */}
        <div className="w-1/3 bg-[#3a1552] backdrop-blur-lg p-6 border-r border-purple-800">
          {/* Share this game */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-white font-semibold">Share this game</h2>
              <Info className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex gap-2 bg-gray-800 rounded-lg p-2">
              <input 
                type="text" 
                readOnly
                value={`https://poordown.io/room/${gameId}`}
                className="flex-1 bg-transparent text-gray-300 text-sm px-2"
              />
              <button
                onClick={copyGameLink}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-white text-sm flex items-center gap-2"
              >
                {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {linkCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
            </div>

          {/* Ad blocker placeholder */}
          <div className="mb-6 border-2 border-dashed border-purple-600 rounded-lg p-4 text-center">
            <p className="text-purple-300 text-sm">Disable your ad blocker to support poordown.io</p>
              </div>

          {/* Chat */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Volume2 className="w-4 h-4 text-purple-400" />
              <h2 className="text-white font-semibold">Chat</h2>
              <ChevronRight className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex flex-col items-center justify-center p-8 border border-purple-700 rounded-lg bg-purple-950/50">
              <MessageCircle className="w-8 h-8 text-gray-500 mb-2" />
              <p className="text-gray-500 text-sm">No messages yet</p>
              </div>
            </div>

          {/* Ad blocker notice */}
          {showAdBlocker && (
            <div className="fixed bottom-6 left-6 bg-purple-700 border-2 border-purple-500 rounded-lg p-3 max-w-xs shadow-lg">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="text-white text-xs leading-tight">
                    Please disable your Adblocker poordown is free and wants to stay free. We use ad revenue to keep maintaining the game. Thanks! ❤️❤️
                  </p>
                </div>
                <button onClick={() => setShowAdBlocker(false)} className="text-white hover:text-gray-300">
                  <X className="w-4 h-4" />
                </button>
                </div>
              </div>
            )}
        </div>

        {/* Center - Blurred background */}
        <div className="w-1/3 relative"></div>

        {/* Right Panel - Settings */}
        <div className="w-1/3 bg-[#3a1552] backdrop-blur-lg p-6 border-l border-purple-800 overflow-y-auto">
          {/* Waiting for players or Players list */}
          <div className="mb-6">
            {players.length > 0 ? (
              <div className="bg-purple-950/50 rounded-lg p-4 border border-purple-700 mb-4">
                <h3 className="text-white font-semibold mb-3">Players ({players.length}/{maxPlayersValue})</h3>
                <div className="space-y-2">
                  {players.map(player => (
                    <div key={player.id} className="flex items-center gap-2 bg-purple-950/50 rounded p-2">
                      <div 
                        className="w-8 h-8 rounded-full"
                        style={{ backgroundColor: player.color || '#999' }}
                      />
                      <span className="text-white text-sm">{player.name}</span>
                      {player.order_in_game === 1 && <Crown className="w-4 h-4 text-yellow-300" />}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <h2 className="text-white font-semibold mb-6">Waiting for players...</h2>
            )}
          </div>

          {/* Game settings */}
          <div className="mb-6">
            <h3 className="text-purple-300 text-sm font-semibold mb-4">Game settings</h3>
            <div className="space-y-4">
              {/* Maximum players */}
              <div className="bg-purple-950/50 rounded-lg p-4 border border-purple-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Users className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">Maximum players</p>
                      <p className="text-gray-400 text-xs">How many players can join the game</p>
              </div>
                  </div>
                  <select 
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                    className="bg-gray-800 text-white text-sm px-3 py-1 rounded border border-gray-700"
                  >
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                  </select>
            </div>
              </div>

              {/* Private room */}
              <div className="bg-purple-950/50 rounded-lg p-4 border border-purple-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-5 h-5 text-purple-400 mt-0.5">🔑</div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">Private room</p>
                      <p className="text-gray-400 text-xs">Private rooms can be accessed using the room URL only</p>
              </div>
            </div>
                  <div className="w-14 h-7 bg-purple-600 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full"></div>
                </div>
                </div>
              </div>

              {/* Allow bots */}
              <div className="bg-purple-950/50 rounded-lg p-4 border border-purple-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <Bot className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">Allow bots to join <span className="text-purple-400 text-xs">Beta</span></p>
                      <p className="text-gray-400 text-xs">Bots will join the game based on availability</p>
                    </div>
                  </div>
                  <div className="w-14 h-7 bg-gray-600 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Board map */}
              <div className="bg-purple-950/50 rounded-lg p-4 border border-purple-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-5 h-5 text-purple-400 mt-0.5">📍</div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">Board map</p>
                      <p className="text-gray-400 text-xs">Change map tiles, properties and stacks</p>
                    </div>
                  </div>
                  <div className="text-white text-sm">Classic</div>
                </div>
                <button className="mt-2 text-purple-400 text-xs hover:text-purple-300">Browse maps &gt;</button>
              </div>
                </div>
              </div>

          {/* Gameplay rules */}
          <div>
            <h3 className="text-purple-300 text-sm font-semibold mb-4">Gameplay rules</h3>
            <div className="space-y-4">
              {isHost && game.status === 'waiting' && (
                <>
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
                </>
              )}
            </div>
          </div>

          {/* Start game button */}
          {isHost && (
            <div className="mt-6">
              <button
                onClick={startGame}
                disabled={loading || players.length < 2}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {loading ? 'Starting...' : 'Start Game'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Color selection overlay modal */}
      <AnimatePresence>
        {showColorSelection && !isPlayerInGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#3a1552] rounded-2xl p-8 max-w-lg w-full mx-4 border border-purple-700"
            >
              <h2 className="text-white text-xl font-semibold mb-6">Select your player appearance:</h2>
              
              {/* Color grid - large circles matching screenshot */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                {PLAYER_COLORS.map((colorObj, idx) => {
                  const takenPlayer = playerByColor.get(colorObj.name)
                  const isSelected = selectedColor === colorObj.name
                  const isTaken = Boolean(takenPlayer)
                  
                  return (
                    <button
                      key={colorObj.name}
                      onClick={() => !isTaken && setSelectedColor(colorObj.name)}
                      disabled={isTaken}
                      className={`
                        w-20 h-20 rounded-full relative mx-auto
                        ${isSelected ? 'ring-4 ring-purple-400 shadow-2xl scale-110' : ''}
                        ${isTaken ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'}
                        transition-all duration-200 border-4
                        ${isSelected ? 'border-purple-400' : 'border-transparent'}
                      `}
                      style={{ backgroundColor: colorObj.hex }}
                    >
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs shadow-lg"
                        >
                          ✓
                        </motion.div>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Join game button */}
              <button
                onClick={joinGame}
                disabled={loading || !selectedColor}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors shadow-lg"
              >
                {loading ? 'Joining...' : 'Join game'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default Lobby
