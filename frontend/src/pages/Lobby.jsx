import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { io } from 'socket.io-client'
import { Users, Copy, Check, MessageCircle, Volume2, Search, HelpCircle, ChevronRight, Info, Send } from 'lucide-react'
import { PLAYER_COLORS } from '../utils/monopolyConstants.js'
import GameSettingToggle from '../components/GameSettingToggle.jsx'
import PlayerAvatar from '../components/PlayerAvatar.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import MonopolyBoard from '../components/MonopolyBoard.jsx'

const STARTING_CASH_PRESETS = [1000, 1500, 2000, 2500, 3000]
const formatCurrency = (value) => `$${Number(value || 0).toLocaleString()}`

const layoutVariants = {
  enter: { opacity: 0, y: 80 },
  center: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -80, transition: { duration: 0.35, ease: 'easeIn' } },
}

const DICE_PIPS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8]
}

function Lobby() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [players, setPlayers] = useState([])
  const [properties, setProperties] = useState([])
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
  const [startingCashOption, setStartingCashOption] = useState('1500')
  const [maxPlayersDb, setMaxPlayersDb] = useState(4)
  const [isGameCreator, setIsGameCreator] = useState(false)
  const [hoveredSetting, setHoveredSetting] = useState(null)

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

  // Load player name from localStorage if available (for game creator)
  useEffect(() => {
    if (game && !isPlayerInGame) {
      const tempName = localStorage.getItem(`tempPlayerName_${gameId}`)
      if (tempName && !playerName) {
        setPlayerName(tempName)
        setIsGameCreator(true)
        // Go directly to color selection for game creator
        setShowColorSelection(true)
      } else {
        setIsGameCreator(false)
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
      setProperties(res.data.properties || [])
      
      // Update settings from database
      if (res.data.game.max_players) {
        setMaxPlayers(res.data.game.max_players)
        setMaxPlayersDb(res.data.game.max_players)
      }
      if (res.data.game.starting_cash) {
        setStartingCash(res.data.game.starting_cash)
      }
      
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
  const disableSettings = showColorSelection && !isPlayerInGame

  useEffect(() => {
    if (!disableSettings && hoveredSetting) {
      setHoveredSetting(null)
    }
  }, [disableSettings, hoveredSetting])

  const handleGuardHover = (id) => {
    if (!disableSettings) return
    setHoveredSetting(id)
  }

  const handleGuardLeave = () => {
    if (!disableSettings) return
    setHoveredSetting(null)
  }

  const renderGuardTooltip = (id) => (
    disableSettings && hoveredSetting === id ? (
      <div className="settings-guard-tooltip">
        Join the game to change settings
      </div>
    ) : null
  )

  const handleStartingCashChange = async (amount) => {
    if (!isGameCreator) return
    setStartingCash(amount)
    setStartingCashOption(String(amount))
    setCustomStartingCash(String(amount))
    
    try {
      await axios.post(`/api/game/${gameId}/settings`, {
        setting: 'starting_cash',
        value: amount
      })
    } catch (error) {
      console.error('Error updating starting money:', error)
    }
  }

  const handleCustomStartingCashApply = async () => {
    if (!isGameCreator) return
    const amount = Math.max(500, Math.round(Number(customStartingCash) || 0))
    setStartingCash(amount)
    setCustomStartingCash(String(amount))
    
    try {
      await axios.post(`/api/game/${gameId}/settings`, {
        setting: 'starting_cash',
        value: amount
      })
    } catch (error) {
      console.error('Error updating starting money:', error)
    }
  }

  const renderHubDie = (value, key) => (
    <div className={`poordown-center-die ${value ? '' : 'poordown-center-die--idle'}`} key={key}>
      <div className="poordown-center-die__face">
        {Array.from({ length: 9 }).map((_, idx) => (
          <div key={`${key}-${idx}`} className="poordown-center-die__cell">
            <span
              className="poordown-center-die__pip"
              style={{ opacity: value && DICE_PIPS[value]?.includes(idx) ? 1 : 0 }}
            ></span>
          </div>
        ))}
      </div>
      <div className="poordown-center-die__shadow" aria-hidden="true"></div>
    </div>
  )

  const renderLobbyStage = (variant) => {
    const isHostView = variant === 'host'
    const minimumPlayers = 2
    const canStart = players.length >= minimumPlayers

    const centerContent = (
      <div className={`poordown-board-hub ${isHostView ? '' : 'poordown-board-hub--guest'}`}>
        <span className="poordown-board-hub__subtitle">Host controls</span>
        <h3 className="poordown-board-hub__title">Launch the trip</h3>

        <div className="poordown-board-hub__dice">
          {renderHubDie(3, `lobby-${variant}-die-1`)}
          {renderHubDie(4, `lobby-${variant}-die-2`)}
        </div>

        <div className="poordown-board-hub__meta">{players.length} / {maxPlayers} players</div>

        {isHostView ? (
          <button
            onClick={startGame}
            disabled={loading || !canStart}
            className="poordown-start-button poordown-start-button--board"
          >
            <span>▶</span>
            <span>{loading ? 'Starting…' : canStart ? 'Start game' : 'Need 2 players'}</span>
          </button>
        ) : (
          <div className="poordown-board-hub__chip">Waiting for host</div>
        )}

        <p className="poordown-board-hub__hint">
          Need at least two players to begin.
        </p>
      </div>
    )

    return (
      <div className="poordown-board-stage poordown-board-stage--solo">
        <div className="poordown-board-stage__board">
          <MonopolyBoard
            properties={properties}
            players={[]}
            currentPlayer={null}
            isPreview={true}
            centerContent={centerContent}
          />
        </div>
      </div>
    )
  }

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

  const currentPlayer = isPlayerInGame ? players.find(p => p.id === currentPlayerId) : null
  const propertiesOwned = currentPlayer ? properties.filter(p => p.owner_id === currentPlayer.id) : []

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ 
      background: 'linear-gradient(180deg, #0E0B1A 0%, #1C183A 100%)'
    }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at 50% -20%, rgba(78, 227, 255, 0.18) 0%, transparent 55%), radial-gradient(circle at 20% 80%, rgba(168, 85, 247, 0.14) 0%, transparent 60%), radial-gradient(circle at 80% 85%, rgba(16, 185, 129, 0.14) 0%, transparent 62%)'
      }}></div>
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle, transparent 68%, rgba(3, 7, 18, 0.85) 100%)'
      }}></div>

      {/* Header - Top Bar */}
      <div className="relative z-20 px-6 py-3 bg-[#1a0a2e] border-b border-purple-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white">poordown.oi</h1>
          <div className="flex items-center gap-2 ml-4">
            <a href="https://discord.gg" className="text-white hover:opacity-80 transition-opacity">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13.545 2.907a13.227 13.227 0 0 0-3.257 1.053A11.89 11.89 0 0 0 5.647 2.216 14.031 14.031 0 0 0 2.9 9.084c.88-.53 1.87-.915 2.93-1.153a9.908 9.908 0 0 1-2.93-1.85A8.84 8.84 0 0 0 1.77 9.073a12.105 12.105 0 0 0 3.592 5.503 10.614 10.614 0 0 1-2.94 1.18 12.343 12.343 0 0 0 7.272 2.631 12.024 12.024 0 0 0 8.718-3.897 13.213 13.213 0 0 1-2.93 1.85 10.073 10.073 0 0 0 5.3-7.514 8.84 8.84 0 0 0 .849-7.588 9.908 9.908 0 0 1-2.93 1.85 10.853 10.853 0 0 0 .877-3.01c.157-1.459-.909-2.602-2.758-3.636z"/></svg>
            </a>
            <HelpCircle className="w-5 h-5 text-white cursor-pointer hover:opacity-80 transition-opacity" />
            <Volume2 className="w-5 h-5 text-white cursor-pointer hover:opacity-80 transition-opacity" />
            <Search className="w-5 h-5 text-white cursor-pointer hover:opacity-80 transition-opacity" />
          </div>
        </div>
      </div>

      {/* Main content - 3 column layout like RICHUP.IO */}
      <div className="relative z-10 flex h-[calc(100vh-60px)]">
        {/* Left Panel - Share and Chat */}
        <div className="w-80 p-6 border-r overflow-y-auto" style={{
          background: '#1A102B',
          borderColor: 'rgba(100, 200, 255, 0.1)',
          boxShadow: 'inset -1px 0 10px rgba(0, 0, 0, 0.3)',
          boxShadowInner: '0 0 8px rgba(255,255,255,0.03)'
        }}>
          {/* Share this game */}
          <div className="mb-4">
            <div className="bg-[#2d1b4e] rounded-lg p-4 border border-purple-800">
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-white font-semibold text-sm">Share this game</h2>
                <Info className="w-4 h-4 text-purple-400" />
              </div>
              <div className="space-y-2">
                <input 
                  type="text" 
                  readOnly
                  value={`https://poordown.oi/room/${gameId}`}
                  className="w-full bg-[#1a0a2e] text-white text-xs px-3 py-2 rounded border border-purple-700"
                />
                <button
                  onClick={copyGameLink}
                  className="w-full bg-[#9d4edd] hover:bg-[#7b2cbf] px-3 py-2 rounded-lg text-white text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {linkCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>


          {/* Chat */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Volume2 className="w-4 h-4 text-white" style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.3))' }} />
              <h2 className="text-white font-semibold text-sm">Chat</h2>
              <div className="flex-1"></div>
              <ChevronRight className="w-4 h-4 text-white" style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,255,0.3))' }} />
            </div>
            <div className="rounded-lg flex flex-col min-h-[200px]" style={{ 
              background: '#1A102B',
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: 'inset 0 1px 8px rgba(0,0,0,0.5)'
            }}>
              <div className="flex-1 overflow-y-auto p-3">
                {chatMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <MessageCircle className="w-6 h-6 text-gray-600 mb-2" />
                    <p className="text-gray-600 text-xs">No messages yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className="text-xs">
                        <span className="text-purple-400 font-semibold">{msg.playerName}:</span>{' '}
                        <span className="text-gray-300">{msg.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {!isPlayerInGame && (
                <div className="border-t border-purple-800 p-2">
                  <p className="text-gray-600 text-xs text-center">Only game players can send chat messages</p>
                </div>
              )}
              {isPlayerInGame && (
                <form onSubmit={sendChatMessage} className="border-t border-purple-800 p-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Say something..."
                      className="flex-1 bg-[#1a0033] text-white text-xs px-3 py-2 rounded border border-purple-700 focus:border-purple-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Center - Conditional Display */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center poordown-main-stage">
          {/* Blurred board background with depth fade like RichUp */}
          <div className="poordown-main-stage__backdrop" aria-hidden="true">
            <div className="poordown-main-stage__board">
              <MonopolyBoard
                properties={properties}
                players={players}
                currentPlayer={null}
                currentTurnPlayer={null}
                isPreview={true}
              />
            </div>
          </div>

          {/* Show color selection in center if not joined yet */}
          {showColorSelection && !isPlayerInGame && (
            <div className="relative z-20 flex items-center justify-center">
              <div className="poordown-selection-wrapper">
                <div className="poordown-selection-ambient" aria-hidden="true"></div>
                <div className="poordown-selection-card">
                  <div className="poordown-selection-header">
                    <h2 className="poordown-selection-title-main">Select your player appearance:</h2>
                  </div>
                  <div className="poordown-avatar-grid">
                    {PLAYER_COLORS.map((colorObj) => {
                      const takenPlayer = playerByColor.get(colorObj.name)
                      const isSelected = selectedColor === colorObj.name
                      const isTaken = Boolean(takenPlayer)

                      return (
                        <button
                          key={colorObj.name}
                          type="button"
                          onClick={() => !isTaken && setSelectedColor(colorObj.name)}
                          disabled={isTaken}
                          className={`poordown-avatar-circle ${isTaken ? 'poordown-avatar-circle--taken' : 'poordown-avatar-circle--interactive'} ${isSelected ? 'poordown-avatar-circle--selected' : ''}`}
                          style={{ '--avatar-color': colorObj.hex }}
                        >
                          <span className="poordown-avatar-halo" aria-hidden="true"></span>
                          <span className="poordown-avatar-gloss" aria-hidden="true"></span>
                          {isSelected && (
                            <div className="poordown-avatar-eyes poordown-avatar-eyes--floating" aria-hidden="true">
                              <div className="poordown-eye">
                                <span className="poordown-pupil"></span>
                                <span className="poordown-eye-glint"></span>
                              </div>
                              <div className="poordown-eye">
                                <span className="poordown-pupil"></span>
                                <span className="poordown-eye-glint"></span>
                              </div>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={joinGame}
                    disabled={loading || !selectedColor}
                    className="poordown-join-button"
                  >
                    {loading ? 'joining...' : 'Join game'}
                  </button>
                  <button
                    type="button"
                    className="poordown-get-more-button"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Get more appearances
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Waiting stages */}
          {isPlayerInGame && !isHost && game && game.status === 'waiting' && (
            <div className="relative z-10 w-full h-full flex items-center justify-center px-4">
              {renderLobbyStage('guest')}
            </div>
          )}

          {isHost && game && game.status === 'waiting' && (
            <div className="relative z-10 w-full h-full flex items-center justify-center px-4">
              {renderLobbyStage('host')}
            </div>
          )}
        </div>

        {/* Right Panel - Game Settings */}
        <div className="w-80 p-6 border-l overflow-y-auto relative" style={{
          background: 'rgba(34, 23, 53, 0.95)',
          borderColor: 'rgba(100, 200, 255, 0.1)',
          boxShadow: 'inset 1px 0 10px rgba(0, 0, 0, 0.3)'
        }}>
          {/* Fade mask at top and bottom for smooth scroll */}
          <div className="absolute top-0 left-0 right-0 h-8 pointer-events-none" style={{
            background: 'linear-gradient(to bottom, rgba(28, 22, 50, 0.95), transparent)'
          }}></div>
          <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none" style={{
            background: 'linear-gradient(to top, rgba(28, 22, 50, 0.95), transparent)'
          }}></div>
          {/* Status Box */}
          {game && game.status === 'waiting' && (
            <div className="mb-6 bg-[#2d1b4e] rounded-lg p-3 text-center border border-purple-700">
              <p className="text-white text-sm">Waiting for players...</p>
            </div>
          )}

          {/* Players List - Show during color selection */}
          {!isPlayerInGame && players.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white text-sm font-semibold mb-3">Players</h3>
              <div className="space-y-2">
                {players.map((player) => {
                  const isCrown = player.order_in_game === 1
                  return (
                    <div key={player.id} className="poordown-player-row">
                      <PlayerAvatar color={player.color} size="sm" showCrown={isCrown} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-white truncate">{player.name}</div>
                        <div className="poordown-player-meta">Slot #{player.order_in_game}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Players List - Show when joined */}
          {isPlayerInGame && players.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white text-sm font-semibold mb-3">Players</h3>
              <div className="space-y-2">
                {players.map((player) => {
                  const isCrown = player.order_in_game === 1
                  const isYou = currentPlayerId && player.id === currentPlayerId
                  const isTurn = game?.status === 'active' && currentTurnPlayer?.id === player.id

                  return (
                    <div
                      key={player.id}
                      className={`poordown-player-row ${isYou ? 'you' : ''} ${isTurn ? 'turn' : ''}`.trim()}
                    >
                      <PlayerAvatar color={player.color} size="sm" showCrown={isCrown} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-white truncate">{player.name}</div>
                        <div className="poordown-player-meta">
                          {isTurn ? 'Rolling now' : `Seat #${player.order_in_game}`}
                        </div>
                      </div>
                      <div className="poordown-player-money">${player.money || 1500}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isPlayerInGame && game?.status === 'active' && (
            <div className="mb-4 space-y-2">
              <button className="w-full bg-[#5a2d8c] hover:bg-[#6a3d9c] text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors">
                Votekick
              </button>
              <button className="w-full bg-[#d9534f] hover:bg-[#e9615d] text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors">
                Bankrupt
              </button>
            </div>
          )}

          {/* Trades */}
          {isPlayerInGame && game?.status === 'active' && (
            <div className="mb-4 bg-[#1a0a2e] rounded-lg p-3 border border-purple-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-semibold text-sm">Trades</h3>
              </div>
              <button className="w-full bg-[#5a2d8c] hover:bg-[#6a3d9c] text-white py-2 px-4 rounded-lg text-sm font-semibold transition-colors">
                Create
              </button>
            </div>
          )}

          {/* My Properties */}
          {isPlayerInGame && currentPlayer && game?.status === 'active' && (
            <div className="bg-[#1a0a2e] rounded-lg p-3 border border-purple-800">
              <h3 className="text-white font-semibold text-sm mb-2">My properties ({propertiesOwned.length})</h3>
              {propertiesOwned.length === 0 ? (
                <p className="text-gray-500 text-xs">No properties owned yet</p>
              ) : (
                <div className="space-y-1">
                  {propertiesOwned.slice(0, 3).map(prop => (
                    <div key={prop.id} className="text-xs text-gray-300">
                      {prop.name}
                    </div>
                  ))}
                </div>
            )}
          </div>
          )}

          {/* ALL settings are visible to all users for now */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-4 text-sm">Game settings</h3>
              <div className="space-y-4">
                {/* Maximum players */}
                <div
                  className="relative"
                  onMouseEnter={() => handleGuardHover('maxPlayers')}
                  onMouseLeave={handleGuardLeave}
                >
                  <div className={`bg-[#2a0f3f] rounded-lg p-4 transition-opacity ${disableSettings ? 'settings-card-disabled' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-0.5 flex items-center gap-1">
                        <Users className="w-5 h-5 text-white" style={{ filter: 'drop-shadow(0 0 6px rgba(0,255,255,0.4))' }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm" style={{ fontSize: '13px', fontWeight: 500 }}>Maximum players</p>
                        <p className="text-gray-400 text-xs mt-0.5" style={{ fontSize: '11px' }}>How many players can join the game</p>
                      </div>
                    </div>
                    <select 
                      value={maxPlayers}
                      onChange={(e) => {
                        if (disableSettings) return
                        const val = parseInt(e.target.value)
                        setMaxPlayers(val)
                        // Save to database immediately
                        axios.post(`/api/game/${gameId}/settings`, {
                          setting: 'max_players',
                          value: val
                        }).catch(err => console.error('Error saving max players:', err))
                      }}
                      disabled={disableSettings}
                      className="bg-[#2a0f3f] text-white text-sm px-3 py-1.5 rounded-lg border border-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                    </select>
                  </div>
                  </div>
                  {renderGuardTooltip('maxPlayers')}
                </div>

                {/* Starting money */}
                <div
                  className="relative"
                  onMouseEnter={() => handleGuardHover('startingCash')}
                  onMouseLeave={handleGuardLeave}
                >
                  <div className={`bg-[#2a0f3f] rounded-lg p-4 transition-opacity ${disableSettings ? 'settings-card-disabled' : ''}`}>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <svg className="w-5 h-5 text-white" style={{ filter: 'drop-shadow(0 0 6px rgba(0,255,255,0.4))' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 .895-4 2s1.79 2 4 2 4 .895 4 2-1.79 2-4 2m0-8c2.21 0 4 .895 4 2m-4-4v1m0 10v1m-6-3.5c0 1.657 2.686 3 6 3s6-1.343 6-3V8.5" />
                        </svg>
                        <div className="flex-1">
                          <p className="text-white font-semibold text-sm" style={{ fontSize: '13px', fontWeight: 500 }}>Starting money</p>
                          <p className="text-gray-400 text-xs mt-0.5" style={{ fontSize: '11px' }}>Recommended {formatCurrency(1500)}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {STARTING_CASH_PRESETS.map((amount) => (
                          <button
                            key={amount}
                            type="button"
                            onClick={() => handleStartingCashChange(amount)}
                            disabled={disableSettings}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              startingCash === amount
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {formatCurrency(amount)}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setStartingCashOption('custom')}
                          disabled={disableSettings}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            startingCashOption === 'custom'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          Custom
                        </button>
                      </div>
                      {startingCashOption === 'custom' && (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min={500}
                            step={50}
                            value={customStartingCash}
                            onChange={(e) => setCustomStartingCash(e.target.value)}
                            disabled={disableSettings}
                            className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm"
                          />
                          <button
                            type="button"
                            onClick={handleCustomStartingCashApply}
                            disabled={disableSettings}
                            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                          >
                            Apply
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {renderGuardTooltip('startingCash')}
                </div>
              </div>
            </div>

            {/* Gameplay rules */}
            <div>
              <h3 className="text-white font-semibold mb-4 text-sm">Gameplay rules</h3>
              <div className="space-y-4">
                {[
                  {
                    icon: '💰',
                    title: 'x2 rent on full-set properties',
                    description: 'If a player owns a full property set, the base rent payment will be doubled',
                    setting: 'double_rent_on_full_set'
                  },
                  {
                    icon: '🏖️',
                    title: 'Vacation cash',
                    description: 'If a player lands on Vacation, all collected money from taxes and bank payments will be earned',
                    setting: 'vacation_cash'
                  },
                  {
                    icon: '🔨',
                    title: 'Auction',
                    description: 'If someone skips purchasing the property landed on, it will be sold to the highest bidder',
                    setting: 'auction_enabled'
                  },
                  {
                    icon: '⚖️',
                    title: "Don't collect rent while in prison",
                    description: 'Rent will not be collected when landing on properties whose owners are in prison',
                    setting: 'no_rent_in_prison'
                  },
                  {
                    icon: '🏦',
                    title: 'Mortgage',
                    description: 'Mortgage properties to receive half their cost; mortgaged titles stop paying rent',
                    setting: 'mortgage_enabled'
                  },
                  {
                    icon: '🏗️',
                    title: 'Even build',
                    description: 'Houses and hotels must be added or removed evenly across properties in a set',
                    setting: 'even_build'
                  }
                ].map((config) => (
                  <div
                    key={config.setting}
                    className="relative"
                    onMouseEnter={() => handleGuardHover(config.setting)}
                    onMouseLeave={handleGuardLeave}
                  >
                    <div className={disableSettings ? 'settings-card-disabled transition-opacity' : ''}>
                      <GameSettingToggle
                        icon={config.icon}
                        title={config.title}
                        description={config.description}
                        setting={config.setting}
                        gameId={gameId}
                        game={game}
                        disabled={disableSettings}
                      />
                    </div>
                    {renderGuardTooltip(config.setting)}
                  </div>
                ))}
              </div>
            </div>

        </div>
      </div>

      {/* Name input overlay modal - shown when player visits lobby URL but hasn't joined */}
      <AnimatePresence>
        {!isPlayerInGame && !showColorSelection && !isGameCreator && game && game.status === 'waiting' && (
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
              className="bg-[#3a1552] rounded-2xl p-8 max-w-md w-full mx-4 border border-purple-700"
            >
              <h2 className="text-white text-xl font-semibold mb-6 text-center">Join Game</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-semibold mb-2">Your Name</label>
                  <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-[#2a0f3f] text-white px-4 py-3 rounded-lg border border-purple-700 focus:border-purple-500 focus:outline-none"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && playerName.trim()) {
                        handleNameSubmit()
                      }
                    }}
                    autoFocus
                  />
                </div>
                
                <button
                  onClick={handleNameSubmit}
                  disabled={!playerName.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <span>&gt;&gt;</span> Join Game
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default Lobby
