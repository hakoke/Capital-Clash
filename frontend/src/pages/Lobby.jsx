import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { io } from 'socket.io-client'
import { Users, Copy, Check, Crown, Settings, MessageCircle, Volume2, Search, HelpCircle, X, ChevronRight, Info, Bot, Send } from 'lucide-react'
import { PLAYER_COLORS } from '../utils/monopolyConstants.js'
import GameSettingToggle from '../components/GameSettingToggle.jsx'
import PlayerAvatar from '../components/PlayerAvatar.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import MonopolyBoard from '../components/MonopolyBoard.jsx'

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
  const [maxPlayersDb, setMaxPlayersDb] = useState(4)
  const [isGameCreator, setIsGameCreator] = useState(false)

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
    <div className="min-h-screen relative" style={{ 
      background: 'linear-gradient(to bottom, #141126, #1E193D)'
    }}>

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
        <div className="flex-1 relative overflow-auto flex items-center justify-center" style={{ 
          background: 'linear-gradient(rgba(0,0,0,0.3), transparent)',
          backgroundSize: '100% 100%'
        }}>
          {/* Blurred board background with depth fade like RichUp */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0" style={{ 
              filter: 'blur(12px)',
              opacity: 0.6
            }}>
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
            <div className="relative z-10" style={{ 
              maxWidth: '380px',
              backdropFilter: 'blur(12px)',
              background: 'rgba(15, 12, 30, 0.75)',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 0 60px rgba(0, 255, 255, 0.08), inset 0 0 60px rgba(255,255,255,0.05)',
              border: 'none'
            }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '12px',
                  background: 'radial-gradient(circle, rgba(30,25,55,0.9) 0%, rgba(10,8,25,0.75) 80%)',
                  pointerEvents: 'none',
                  opacity: 0.9
                }}></div>
                
                {/* Light spill effect from avatars */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '12px',
                  background: 'radial-gradient(circle, rgba(0,255,255,0.1) 0%, transparent 70%)',
                  pointerEvents: 'none',
                  opacity: 0.6
                }}></div>
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h2 className="text-white text-xs font-medium mb-6 text-center" style={{ letterSpacing: '-0.2px' }}>Select your player appearance</h2>
                  
                  {/* Color grid - 3x3 like RichUp.io */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
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
                            relative rounded-full transition-all duration-200 flex items-center justify-center overflow-hidden
                            ${isTaken ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                          `}
                          style={{ 
                            width: '72px', 
                            height: '72px',
                            background: isTaken 
                              ? 'transparent' 
                              : `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.15) 2%, ${colorObj.hex} 90%)`,
                            boxShadow: isSelected 
                              ? '0 0 25px rgba(0, 230, 255, 0.6)' 
                              : 'none',
                            transition: 'all 0.2s ease',
                            border: isSelected ? 'none' : 'none'
                          }}
                          onMouseEnter={(e) => !isTaken && !isSelected && Object.assign(e.currentTarget.style, {
                            transform: 'scale(1.08)',
                            filter: 'brightness(1.15)',
                            transition: 'all 0.2s ease'
                          })}
                          onMouseLeave={(e) => Object.assign(e.currentTarget.style, {
                            transform: 'scale(1)',
                            filter: 'brightness(1)',
                            transition: 'all 0.2s ease'
                          })}
                        >
                          {/* Eyes - ONLY show on selected avatar, positioned higher (like RichUp) */}
                          {isSelected && (
                            <div className="absolute" style={{ top: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
                              <div className="w-5 h-5 bg-white rounded-full" style={{ opacity: 1 }}>
                                <div className="w-3 h-3 bg-black rounded-full" style={{ margin: '4px', position: 'relative' }}>
                                  <div className="w-1.5 h-1.5 bg-white rounded-full" style={{ position: 'absolute', top: '2px', right: '2px' }}></div>
                                </div>
                              </div>
                              <div className="w-5 h-5 bg-white rounded-full" style={{ opacity: 1 }}>
                                <div className="w-3 h-3 bg-black rounded-full" style={{ margin: '4px', position: 'relative' }}>
                                  <div className="w-1.5 h-1.5 bg-white rounded-full" style={{ position: 'absolute', top: '2px', right: '2px' }}></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Join game button - RichUp exact style */}
                  <button
                    onClick={joinGame}
                    disabled={loading || !selectedColor}
                    className="disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all"
                    style={{ 
                      fontSize: '13px',
                      fontWeight: 500,
                      textTransform: 'lowercase',
                      letterSpacing: '0px',
                      padding: '10px 24px',
                      borderRadius: '8px',
                      background: '#6F3CF5',
                      boxShadow: '0 0 40px rgba(0,0,0,0.5)',
                      width: '100%',
                      marginBottom: '12px',
                      marginTop: '0px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(0,255,255,0.5), 0 0 40px rgba(0,0,0,0.5)';
                      e.currentTarget.style.filter = 'brightness(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 0 40px rgba(0,0,0,0.5)';
                      e.currentTarget.style.filter = 'none';
                    }}
                  >
                    {loading ? 'Joining...' : 'join game'}
                  </button>
                  
                  {/* Get more appearances button */}
                  <button className="w-full text-gray-400 text-xs py-2 hover:text-gray-300 transition-colors text-center">
                    Get more appearances
                  </button>
                </div>
            </div>
          )}

          {/* Show Start Game button when joined and waiting for host */}
          {isPlayerInGame && !isHost && game && game.status === 'waiting' && (
            <div className="relative z-10 max-w-md w-full px-8">
              <div className="text-center">
                <div className="mb-6 flex items-center justify-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center">
                    <span className="text-4xl font-bold">⚀</span>
                  </div>
                  <div className="w-16 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center">
                    <span className="text-4xl font-bold">⚁</span>
                  </div>
                </div>
                <p className="text-gray-400 mb-2">Waiting for host to start the game...</p>
                <p className="text-sm text-purple-400">Joined room {gameId.slice(0, 8)}</p>
              </div>
            </div>
          )}

          {/* Show Start Game option for host */}
          {isHost && game && game.status === 'waiting' && (
            <div className="relative z-10 max-w-md w-full px-8">
              <div className="text-center">
                <div className="mb-6 flex items-center justify-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center">
                    <span className="text-4xl font-bold">⚀</span>
                  </div>
                  <div className="w-16 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center">
                    <span className="text-4xl font-bold">⚁</span>
                  </div>
                </div>
                <button
                  onClick={startGame}
                  disabled={loading || players.length < 2}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2 mb-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  {loading ? 'Starting...' : 'Start Game'}
                </button>
                <p className="text-gray-400 text-sm">{players.length} / {maxPlayers} players joined</p>
              </div>
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
                {players.map((player, idx) => {
                  const colorData = PLAYER_COLORS.find(c => c.name === player.color)
                  const colorHex = colorData?.hex || '#999'
                  const isCrown = player.order_in_game === 1
                  
                  return (
                    <div key={player.id} className="flex items-center gap-2 text-white text-sm">
                      <div className="relative">
                        <PlayerAvatar color={player.color} size="md" />
                        {isCrown && (
                          <div className="absolute -top-1 -right-1">
                            <Crown className="w-3 h-3 text-yellow-300" />
                          </div>
                        )}
                      </div>
                      <span className="flex-1">{player.name}</span>
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
                {players.map((player, idx) => {
                  const colorData = PLAYER_COLORS.find(c => c.name === player.color)
                  const colorHex = colorData?.hex || '#999'
                  const isCrown = player.order_in_game === 1
                  
                  return (
                    <div key={player.id} className="flex items-center gap-2 text-white text-sm">
                      <div className="relative">
                        <PlayerAvatar color={player.color} size="md" />
                        {isCrown && (
                          <div className="absolute -top-1 -right-1">
                            <Crown className="w-3 h-3 text-yellow-300" />
                          </div>
                        )}
                      </div>
                      <span className="flex-1">{player.name}</span>
                      <span className="text-green-400 font-bold text-sm">${player.money || 1500}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isPlayerInGame && (
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
          {isPlayerInGame && (
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
          {isPlayerInGame && currentPlayer && (
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
                <div className="bg-[#2a0f3f] rounded-lg p-4">
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
                        const val = parseInt(e.target.value)
                        setMaxPlayers(val)
                        // Save to database immediately
                        axios.post(`/api/game/${gameId}/settings`, {
                          setting: 'max_players',
                          value: val
                        }).catch(err => console.error('Error saving max players:', err))
                      }}
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
                      <div className="w-5 h-5 text-white mt-0.5" style={{ filter: 'drop-shadow(0 0 6px rgba(0,255,255,0.4))' }}>💰</div>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm" style={{ fontSize: '13px', fontWeight: 500 }}>Starting cash</p>
                        <p className="text-gray-400 text-xs mt-0.5" style={{ fontSize: '11px' }}>Amount of cash each player starts with</p>
                      </div>
                    </div>
                    <select 
                      value={startingCash === 'custom' ? 'custom' : startingCash}
                      onChange={async (e) => {
                        const val = e.target.value
                        if (val === 'custom') {
                          setStartingCash('custom')
                        } else {
                          const numVal = parseInt(val)
                          setStartingCash(numVal)
                          // Save to database immediately
                          await axios.post(`/api/game/${gameId}/settings`, {
                            setting: 'starting_cash',
                            value: numVal
                          }).catch(err => console.error('Error saving starting cash:', err))
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
                        onBlur={async () => {
                          if (customStartingCash) {
                            const val = parseInt(customStartingCash)
                            await axios.post(`/api/game/${gameId}/settings`, {
                              setting: 'starting_cash',
                              value: val
                            }).catch(err => console.error('Error saving starting cash:', err))
                          }
                        }}
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
              <h3 className="text-white font-semibold mb-4 text-sm">Gameplay rules</h3>
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
