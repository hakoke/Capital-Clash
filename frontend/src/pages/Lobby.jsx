import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { io } from 'socket.io-client'
import { Users, Copy, Check, Crown, Settings, MessageCircle, Volume2, Search, HelpCircle, X, ChevronRight, Info, Bot, Send } from 'lucide-react'
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
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [startingCash, setStartingCash] = useState(1500)
  const [customStartingCash, setCustomStartingCash] = useState('')

  const socketRef = useRef(null)

  useEffect(() => {
    fetchGameData()
    const interval = setInterval(fetchGameData, 2000)

    // Setup socket connection for chat
    socketRef.current = io()
    
    if (gameId) {
      socketRef.current.emit('join_game', gameId)
    }

    // Listen for incoming chat messages
    socketRef.current.on('chat_message', (messageRecord) => {
      setChatMessages(prev => {
        // Check if message already exists to avoid duplicates
        const exists = prev.some(msg => msg.timestamp === messageRecord.timestamp && msg.playerName === messageRecord.playerName)
        if (exists) return prev
        
        return [...prev, {
          playerName: messageRecord.playerName,
          message: messageRecord.message,
          timestamp: messageRecord.timestamp
        }]
      })
    })

    return () => {
      clearInterval(interval)
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [gameId])

  // Load chat history
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const res = await axios.get(`/api/chat/${gameId}/history`)
        setChatMessages(res.data.messages || [])
      } catch (error) {
        console.error('Error loading chat history:', error)
      }
    }

    if (gameId) {
      loadChatHistory()
    }
  }, [gameId])

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

  const sendChatMessage = async (e) => {
    e.preventDefault()
    if (!chatInput.trim() || !currentPlayerId) return

    try {
      // Send via API - backend will broadcast via socket
      await axios.post('/api/chat/message', {
        gameId,
        playerId: currentPlayerId,
        message: chatInput,
        messageType: 'chat'
      })

      setChatInput('')
    } catch (error) {
      console.error('Error sending message:', error)
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
    <div className="min-h-screen bg-[#1a0033] relative">

      {/* Header */}
      <div className="relative z-20 px-6 py-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white tracking-tight">lazydown.oi</h1>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
            <HelpCircle className="w-5 h-5 text-white" />
          </div>
          <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
            <Volume2 className="w-5 h-5 text-white" />
          </div>
          <div className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer">
            <Search className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex h-[calc(100vh-80px)]">
        {/* Left Panel - Share and Chat */}
        <div className="w-1/3 bg-[#3a1552] p-6 border-r border-purple-800">
          {/* Share this game */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-white font-semibold">Share this game</h2>
              <Info className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex gap-2 bg-[#2a0f3f] rounded-lg p-2">
              <input 
                type="text" 
                readOnly
                value={`https://lazydown.oi/room/${gameId}`}
                className="flex-1 bg-transparent text-white text-sm px-2"
              />
              <button
                onClick={copyGameLink}
                className="px-3 py-1.5 bg-[#2a0f3f] hover:bg-[#3a1552] rounded text-white text-sm flex items-center gap-2"
              >
                {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {linkCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
            </div>

          {/* Ad blocker placeholder */}
          <div className="mb-6 bg-[#3a1552] rounded-lg p-4 text-center border border-purple-700">
            <p className="text-white text-sm">Disable your ad blocker to support lazydown.oi</p>
          </div>

          {/* Chat */}
          <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Volume2 className="w-4 h-4 text-gray-400" />
              <h2 className="text-white font-semibold">Chat</h2>
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <div className="rounded-lg bg-[#2a0f3f] max-h-60 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageCircle className="w-8 h-8 text-gray-500 mb-2" />
                    <p className="text-gray-500 text-sm">No messages yet</p>
                  </div>
                ) : (
                  chatMessages.map((msg, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="text-purple-400 font-semibold">{msg.playerName}:</span>{' '}
                      <span className="text-gray-300">{msg.message}</span>
                    </div>
                  ))
                )}
              </div>
              {/* Chat input */}
              {isPlayerInGame && (
                <form onSubmit={sendChatMessage} className="border-t border-purple-700 p-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-[#1a0033] text-white text-sm px-3 py-2 rounded-lg border border-purple-700 focus:border-purple-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Ad blocker notice */}
          {showAdBlocker && (
            <div className="fixed bottom-6 left-6 bg-[#3a1552] border border-purple-700 rounded-lg p-3 max-w-xs shadow-lg">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="text-white text-xs leading-tight font-semibold mb-1">
                    Please disable your Adblocker
                  </p>
                  <p className="text-white text-xs leading-tight">
                    lazydown.oi is free and wants to stay free. We use ad revenue to keep maintaining the game. Thanks! ❤️
                  </p>
                </div>
                <button onClick={() => setShowAdBlocker(false)} className="text-red-500 hover:text-red-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Center - Blurred background */}
        <div className="w-1/3 relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-20 blur-2xl"
            style={{
              backgroundImage: `url('data:image/svg+xml,${encodeURIComponent('<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="100" height="100" fill="%23228B22" opacity="0.5"/><rect x="100" y="0" width="100" height="100" fill="%23228B22" opacity="0.5"/><rect x="200" y="0" width="100" height="100" fill="%23228B22" opacity="0.5"/><rect x="300" y="0" width="100" height="100" fill="%234169E1" opacity="0.5"/><rect x="400" y="0" width="100" height="100" fill="%23DC143C" opacity="0.5"/><rect x="500" y="0" width="100" height="100" fill="%23FFD700" opacity="0.5"/><rect x="600" y="0" width="100" height="100" fill="%23FF8C00" opacity="0.5"/><rect x="700" y="0" width="100" height="100" fill="%23DC143C" opacity="0.5"/></svg>')}')`,
              backgroundSize: 'contain',
              backgroundRepeat: 'repeat',
              filter: 'blur(20px)',
            }}
          />
        </div>

        {/* Right Panel - Settings */}
        <div className="w-1/3 bg-[#3a1552] p-6 border-l border-purple-800 overflow-y-auto">
          {/* Waiting for players or Players list */}
          <div className="mb-6">
            {players.length > 0 ? (
              <div className="bg-[#2a0f3f] rounded-lg p-4 mb-4">
                <h3 className="text-white font-semibold mb-3">Players ({players.length}/{maxPlayersValue})</h3>
                <div className="space-y-2">
                  {players.map(player => {
                    const colorData = PLAYER_COLORS.find(c => c.name === player.color)
                    const colorHex = colorData?.hex || '#999'
                    
                    return (
                      <div key={player.id} className="flex items-center gap-2 bg-[#1a0033] rounded p-2">
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-purple-600"
                          style={{ backgroundColor: colorHex }}
                        />
                        <span className="text-white text-sm">{player.name}</span>
                        {player.order_in_game === 1 && <Crown className="w-4 h-4 text-yellow-300" />}
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <h2 className="text-white font-semibold mb-6">Waiting for players...</h2>
            )}
          </div>

          {/* ALL settings are host-only */}
          {isHost && (
            <>
            <div className="mb-6">
              <h3 className="text-white text-sm font-semibold mb-4">Game settings</h3>
              <div className="space-y-4">
                {/* Maximum players */}
                <div className="bg-[#2a0f3f] rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-0.5 flex items-center gap-1">
                        <Users className="w-5 h-5 text-gray-300" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">Maximum players</p>
                        <p className="text-gray-400 text-xs mt-0.5">How many players can join the game</p>
                      </div>
                    </div>
                    <select 
                      value={maxPlayers}
                      onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                      className="bg-[#2a0f3f] text-white text-sm px-3 py-1.5 rounded-lg border border-purple-700"
                    >
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                    </select>
                  </div>
                </div>

                {/* Starting cash */}
                <div className="bg-[#2a0f3f] rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-5 h-5 text-gray-300 mt-0.5">💰</div>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">Starting cash</p>
                        <p className="text-gray-400 text-xs mt-0.5">Amount of cash each player starts with</p>
                      </div>
                    </div>
                    <select 
                      value={startingCash === 'custom' ? 'custom' : startingCash}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val === 'custom') {
                          setStartingCash('custom')
                        } else {
                          setStartingCash(parseInt(val))
                        }
                      }}
                      className="bg-[#2a0f3f] text-white text-sm px-3 py-1.5 rounded-lg border border-purple-700"
                    >
                      <option value="1000">$1,000</option>
                      <option value="1500">$1,500</option>
                      <option value="2000">$2,000</option>
                      <option value="2500">$2,500</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  {startingCash === 'custom' && (
                    <div className="ml-8 mt-2">
                      <input
                        type="number"
                        value={customStartingCash}
                        onChange={(e) => setCustomStartingCash(e.target.value)}
                        placeholder="Enter custom amount"
                        className="w-full bg-[#1a0033] text-white text-sm px-3 py-2 rounded-lg border border-purple-700 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Gameplay rules */}
            <div>
              <h3 className="text-white text-sm font-semibold mb-4">Gameplay rules</h3>
              <div className="space-y-4">
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
                  icon="🏘️"
                    title="Even build"
                    description="Houses and hotels must be built up and sold off evenly within a property set"
                  setting="even_build"
                  gameId={gameId}
                  game={game}
                />
              </div>
            </div>
            </>
          )}

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
              className="bg-[#3a1552] rounded-2xl p-8 max-w-lg w-full mx-4"
            >
              <h2 className="text-white text-xl font-semibold mb-6">Select your player appearance:</h2>
              
              {/* Color grid - matching richup.io 3x3 layout */}
              <div className="grid grid-cols-3 gap-4 mb-6">
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
                        w-16 h-16 rounded-full relative mx-auto
                        ${isSelected ? 'ring-4 ring-purple-400 shadow-2xl scale-110' : ''}
                        ${isTaken ? 'opacity-30 cursor-not-allowed' : 'hover:ring-2 hover:ring-purple-500 cursor-pointer'}
                        transition-all duration-200 border-4
                        ${isSelected ? 'border-purple-400' : 'border-transparent'}
                      `}
                      style={{ backgroundColor: colorObj.hex }}
                    >
                    </button>
                  )
                })}
              </div>

              {/* Join game button */}
              <button
                onClick={joinGame}
                disabled={loading || !selectedColor}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
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
