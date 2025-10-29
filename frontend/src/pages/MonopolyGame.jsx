import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { io } from 'socket.io-client'
import {
  Copy,
  Check,
  MessageCircle,
  Send,
  Users,
  Info,
  ChevronRight,
  HelpCircle,
  Volume2,
  Search
} from 'lucide-react'

import MonopolyBoard from '../components/MonopolyBoard'
import Notification from '../components/Notification'
import PlayerAvatar from '../components/PlayerAvatar'
import GameSettingToggle from '../components/GameSettingToggle'
import AuctionPanel from '../components/AuctionPanel'

const DICE_PIPS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8]
}

function MonopolyGame() {
  const { gameId } = useParams()

  const [game, setGame] = useState(null)
  const [players, setPlayers] = useState([])
  const [properties, setProperties] = useState([])
  const [currentPlayer, setCurrentPlayer] = useState(null)
  const [currentTurnPlayer, setCurrentTurnPlayer] = useState(null)
  const [notification, setNotification] = useState(null)
  const [showDiceAnimation, setShowDiceAnimation] = useState(false)
  const [diceResult, setDiceResult] = useState(null)
  const [lastDiceResult, setLastDiceResult] = useState(null)
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false)
  const [purchaseProperty, setPurchaseProperty] = useState(null)
  const [showAuction, setShowAuction] = useState(false)

  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [hoveredSetting, setHoveredSetting] = useState(null)

  const socketRef = useRef(null)

  const fetchGameData = async () => {
    try {
      const res = await axios.get(`/api/game/${gameId}`)
      setGame(res.data.game)
      setPlayers(res.data.players)
      setProperties(res.data.properties || [])

      const playerId = localStorage.getItem(`player_${gameId}`)
      if (playerId) {
        const player = res.data.players.find(p => p.id === playerId)
        if (player) {
          setCurrentPlayer(player)
        }
      } else if (res.data.players.length > 0) {
        setCurrentPlayer(res.data.players[0])
      }

      if (res.data.game.current_player_turn) {
        const turnPlayer = res.data.players.find(p => p.order_in_game === res.data.game.current_player_turn)
        setCurrentTurnPlayer(turnPlayer || null)
      } else {
        setCurrentTurnPlayer(null)
      }

      if (res.data.game.max_players) {
        setMaxPlayers(res.data.game.max_players)
      }
    } catch (error) {
      console.error('Error fetching game data:', error)
    }
  }

  useEffect(() => {
    fetchGameData()
    const interval = setInterval(fetchGameData, 2000)
    return () => clearInterval(interval)
  }, [gameId])

  useEffect(() => {
    socketRef.current = io()

    if (gameId) {
      socketRef.current.emit('join_game', gameId)
    }

    socketRef.current.on('chat_message', (messageRecord) => {
      setChatMessages(prev => {
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
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [gameId])

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

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleRollDice = async () => {
    if (!currentPlayer) return

    try {
      setShowDiceAnimation(true)
      setDiceResult({ die1: '?', die2: '?' })

      const res = await axios.post(`/api/game/${gameId}/roll`, {
        playerId: currentPlayer.id
      })

      if (res.data.success) {
        const { dice, property, rentPaid } = res.data

        setDiceResult({ die1: dice.die1, die2: dice.die2 })
        setLastDiceResult({ die1: dice.die1, die2: dice.die2 })

        let message = `🎲 Rolled ${dice.die1} + ${dice.die2} = ${dice.total}!`
        if (rentPaid) {
          message += ` Paid $${rentPaid} rent`
        }
        showNotification(message, 'success')

        setTimeout(() => {
          setShowDiceAnimation(false)
          setDiceResult(null)

          if (property && property.price > 0 && !property.owner_id && property.property_type === 'property') {
            setPurchaseProperty(property)
            setShowPurchaseDialog(true)
          }
        }, 1800)

        fetchGameData()
      }
    } catch (error) {
      console.error('Error rolling dice:', error)
      setShowDiceAnimation(false)
      showNotification('Error rolling dice: ' + (error.response?.data?.error || error.message), 'error')
    }
  }

  const handleEndTurn = async () => {
    try {
      await axios.post(`/api/game/${gameId}/advance-turn`)
      showNotification('Turn ended', 'info')
      fetchGameData()
    } catch (error) {
      console.error('Error ending turn:', error)
      showNotification('Error ending turn: ' + (error.response?.data?.error || error.message), 'error')
    }
  }

  const handleStartGame = async () => {
    try {
      await axios.post(`/api/game/${gameId}/start`)
      fetchGameData()
    } catch (error) {
      console.error('Error starting game:', error)
      showNotification('Failed to start game: ' + (error.response?.data?.error || error.message), 'error')
    }
  }

  const handleBuyProperty = async (propertyId) => {
    if (!currentPlayer) return

    try {
      const res = await axios.post(`/api/player/${currentPlayer.id}/buy-property`, {
        propertyId
      })

      if (res.data.success) {
        showNotification('✓ Property purchased!', 'success')
        setShowPurchaseDialog(false)
        setPurchaseProperty(null)
        fetchGameData()
      }
    } catch (error) {
      console.error('Error buying property:', error)
      showNotification('Error: ' + (error.response?.data?.error || error.message), 'error')
    }
  }

  const handleStartAuction = async () => {
    if (!purchaseProperty || !game?.auction_enabled) {
      setShowPurchaseDialog(false)
      setPurchaseProperty(null)
      return
    }

    try {
      const res = await axios.post('/api/auction/create', {
        gameId,
        propertyId: purchaseProperty.id,
        startingBid: Math.floor(purchaseProperty.price * 0.5)
      })

      purchaseProperty.auctionId = res.data.auction.id
      setShowPurchaseDialog(false)
      setShowAuction(true)
    } catch (error) {
      console.error('Error starting auction:', error)
      showNotification('Error starting auction: ' + (error.response?.data?.error || error.message), 'error')
    }
  }

  const handleSkipProperty = () => {
    setShowPurchaseDialog(false)
    setPurchaseProperty(null)
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
    if (!chatInput.trim() || !currentPlayer) return

    try {
      await axios.post('/api/chat/message', {
        gameId,
        playerId: currentPlayer.id,
        message: chatInput,
        messageType: 'chat'
      })
      setChatInput('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleGuardHover = (id) => {
    setHoveredSetting(id)
  }

  const handleGuardLeave = () => {
    setHoveredSetting(null)
  }

  const renderGuardTooltip = (id) => (
    hoveredSetting === id ? (
      <div className="settings-guard-tooltip">
        Host only
      </div>
    ) : null
  )

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

  if (!game || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0616] text-white">
        <div className="text-lg tracking-wide uppercase">Loading game...</div>
      </div>
    )
  }

  const isMyTurn = currentTurnPlayer && currentPlayer && currentTurnPlayer.id === currentPlayer.id
  const isHost = currentPlayer?.order_in_game === 1
  const disableSettings = !isHost
  const canStartGame = players.length >= 2
  const orderedPlayers = useMemo(
    () => [...players].sort((a, b) => a.order_in_game - b.order_in_game),
    [players]
  )

  const waitingCenterContent = (
    <div className="poordown-board-hub">
      <span className="poordown-board-hub__subtitle">Host controls</span>
      <h3 className="poordown-board-hub__title">Launch the trip</h3>

      <div className="poordown-board-hub__dice">
        {renderHubDie(3, 'wait-1')}
        {renderHubDie(4, 'wait-2')}
      </div>

      <div className="poordown-board-hub__meta">{players.length} / {maxPlayers} players</div>

      {isHost ? (
        <button
          onClick={handleStartGame}
          disabled={!canStartGame}
          className="poordown-start-button poordown-start-button--board"
        >
          <span>▶</span>
          <span>{canStartGame ? 'Start game' : 'Need 2 players'}</span>
        </button>
      ) : (
        <div className="poordown-board-hub__chip">Waiting for host</div>
      )}

      <p className="poordown-board-hub__hint">Need at least two players to begin.</p>
    </div>
  )

  const activeCenterContent = (
    <div className="poordown-board-hub poordown-board-hub--active">
      <span className="poordown-board-hub__subtitle">Current turn</span>
      {currentTurnPlayer ? (
        <div className="poordown-board-hub__player">
          <PlayerAvatar color={currentTurnPlayer.color} size="md" showCrown={currentTurnPlayer.order_in_game === 1} />
          <div className="poordown-board-hub__player-meta">
            <span className="poordown-board-hub__player-name">{currentTurnPlayer.name}</span>
            <span className="poordown-board-hub__player-seat">Seat #{currentTurnPlayer.order_in_game}</span>
          </div>
        </div>
      ) : (
        <div className="poordown-board-hub__waiting">Waiting for turn...</div>
      )}

      <div className="poordown-board-hub__dice">
        {renderHubDie(lastDiceResult?.die1 || 0, 'play-1')}
        {renderHubDie(lastDiceResult?.die2 || 0, 'play-2')}
      </div>

      {isMyTurn ? (
        <div className="poordown-board-hub__actions">
          {currentPlayer.can_roll ? (
            <button onClick={handleRollDice} className="poordown-game-overlay-action-primary">
              Roll dice
            </button>
          ) : (
            <button onClick={handleEndTurn} className="poordown-game-overlay-action-secondary">
              End turn
            </button>
          )}
        </div>
      ) : (
        <div className="poordown-board-hub__chip">
          {currentTurnPlayer ? `Waiting for ${currentTurnPlayer.name}` : 'Waiting for players'}
        </div>
      )}
    </div>
  )

  const boardCenterContent = game.status === 'waiting' ? waitingCenterContent : activeCenterContent

  return (
    <div className="poordown-game-scene">
      <div className="poordown-game-scene__aura" aria-hidden="true"></div>
      <div className="poordown-game-scene__aura poordown-game-scene__aura--secondary" aria-hidden="true"></div>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {showDiceAnimation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] text-white rounded-3xl p-8 max-w-md w-full text-center border border-white/10 shadow-2xl">
            <div className="text-5xl mb-4">🎲</div>
            <div className="flex items-center justify-center gap-4 mb-4">
              {diceResult ? (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-3xl font-bold shadow-lg">
                    {diceResult.die1}
                  </div>
                  <div className="text-3xl font-semibold">+</div>
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center text-3xl font-bold shadow-lg">
                    {diceResult.die2}
                  </div>
                </>
              ) : (
                <div className="text-lg tracking-[0.3em] uppercase text-purple-200">Rolling...</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="poordown-game-shell">
        <header className="poordown-game-header">
          <div className="poordown-game-header__brand">
            <h1 className="poordown-game-header__title">
              poordown<span>.oi</span>
            </h1>
            <div className="poordown-game-header__actions">
              <HelpCircle className="poordown-game-header__icon" />
              <Volume2 className="poordown-game-header__icon" />
              <Search className="poordown-game-header__icon" />
            </div>
          </div>

          <div className="poordown-game-header__player">
            <PlayerAvatar color={currentPlayer.color} size="sm" showCrown={currentPlayer.order_in_game === 1} />
            <div className="poordown-game-header__player-meta">
              <span className="poordown-game-header__player-name">{currentPlayer.name}</span>
              <span className="poordown-game-header__player-money">${(parseInt(currentPlayer.money || 0)).toLocaleString()}</span>
            </div>
          </div>
        </header>

        <div className="poordown-game-body">
          <aside className="poordown-game-sidebar">
            <div className="poordown-game-card">
              <div className="poordown-game-card__heading">
                <span className="poordown-game-card__title">Share this game</span>
                <Info className="poordown-game-card__icon" />
              </div>
              <div className="poordown-game-share">
                <input
                  type="text"
                  readOnly
                  value={`https://poordown.oi/room/${gameId}`}
                  className="poordown-game-share__field"
                />
                <button
                  onClick={copyGameLink}
                  className={`poordown-game-share__button ${linkCopied ? 'copied' : ''}`}
                >
                  {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {linkCopied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="poordown-game-card poordown-game-card--chat">
              <div className="poordown-game-card__heading">
                <MessageCircle className="poordown-game-card__icon" />
                <span className="poordown-game-card__title">Chat</span>
                <ChevronRight className="poordown-game-card__icon" />
              </div>
              <div className="poordown-chat-window">
                {chatMessages.length === 0 ? (
                  <div className="poordown-chat-empty">
                    <MessageCircle className="w-6 h-6 text-purple-400/50" />
                    <p>No messages yet</p>
                  </div>
                ) : (
                  <div className="poordown-chat-feed">
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className="poordown-chat-line">
                        <span className="poordown-chat-name">{msg.playerName}:</span>
                        <span className="poordown-chat-text">{msg.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <form onSubmit={sendChatMessage} className="poordown-chat-form">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Say something..."
                  className="poordown-chat-input"
                />
                <button type="submit" className="poordown-chat-send">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </aside>

          <main className="poordown-game-center">
            <div className="poordown-game-stage">
              <div className="poordown-game-stage__board">
                <MonopolyBoard
                  properties={properties}
                  players={players}
                  currentPlayer={currentPlayer}
                  onBuyProperty={handleBuyProperty}
                  centerContent={boardCenterContent}
                />
              </div>
            </div>
          </main>

          <aside className="poordown-game-sidebar poordown-game-sidebar--right">
            <div className="poordown-game-card">
              <div className="poordown-game-card__heading">
                <Users className="poordown-game-card__icon" />
                <span className="poordown-game-card__title">Players</span>
              </div>
              <div className="poordown-player-list">
                {orderedPlayers.map((player) => {
                  const isYou = currentPlayer.id === player.id
                  const isTurn = currentTurnPlayer && currentTurnPlayer.id === player.id

                  return (
                    <div
                      key={player.id}
                      className={`poordown-player-row ${isYou ? 'you' : ''} ${isTurn ? 'turn' : ''}`.trim()}
                    >
                      <PlayerAvatar color={player.color} size="sm" showCrown={player.order_in_game === 1} />
                      <div className="poordown-player-row__meta">
                        <span className="poordown-player-row__name">{player.name}</span>
                        <span className="poordown-player-row__seat">Seat #{player.order_in_game}</span>
                      </div>
                      <div className="poordown-player-money">${(parseInt(player.money || 0)).toLocaleString()}</div>
                    </div>
                  )
                })}

                {orderedPlayers.length === 0 && (
                  <div className="poordown-player-empty">Waiting for friends to join…</div>
                )}
              </div>
            </div>

            <div className="poordown-game-card">
              <h3 className="poordown-game-card__title">Game settings</h3>
              <div className="poordown-game-settings">
                <div
                  className="poordown-setting-card"
                  onMouseEnter={() => disableSettings && handleGuardHover('maxPlayers')}
                  onMouseLeave={() => disableSettings && handleGuardLeave()}
                >
                  <div className="poordown-setting-card__body">
                    <div className="poordown-setting-card__label">
                      <Users className="poordown-setting-card__icon" />
                      <div>
                        <p>Maximum players</p>
                        <span>How many players can join the game</span>
                      </div>
                    </div>
                    <select
                      value={maxPlayers}
                      onChange={(e) => {
                        if (disableSettings) return
                        const value = parseInt(e.target.value)
                        setMaxPlayers(value)
                        axios.post(`/api/game/${gameId}/settings`, {
                          setting: 'max_players',
                          value
                        }).catch(err => console.error('Error saving max players:', err))
                      }}
                      disabled={disableSettings}
                      className="poordown-setting-select"
                    >
                      {[2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                  {disableSettings && renderGuardTooltip('maxPlayers')}
                </div>

                <div className="poordown-setting-card">
                  <div className="poordown-setting-card__body">
                    <div className="poordown-setting-card__label">
                      <svg className="poordown-setting-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                      <div>
                        <p>Private room</p>
                        <span>Private rooms can be accessed using the room URL only</span>
                      </div>
                    </div>
                    <label className="poordown-toggle">
                      <input type="checkbox" className="sr-only" defaultChecked readOnly />
                      <span className="poordown-toggle__track"></span>
                    </label>
                  </div>
                </div>

                <div className="poordown-setting-card">
                  <div className="poordown-setting-card__body">
                    <div className="poordown-setting-card__label">
                      <svg className="poordown-setting-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p>Allow bots to join <span className="poordown-setting-card__badge">Beta</span></p>
                        <span>Bots will join the game based on availability</span>
                      </div>
                    </div>
                    <label className="poordown-toggle">
                      <input type="checkbox" className="sr-only" disabled />
                      <span className="poordown-toggle__track"></span>
                    </label>
                  </div>
                </div>

                <div className="poordown-setting-card">
                  <div className="poordown-setting-card__body">
                    <div className="poordown-setting-card__label">
                      <svg className="poordown-setting-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <div>
                        <p>Board map</p>
                        <span>Change map tiles, properties and stacks</span>
                      </div>
                    </div>
                    <div className="poordown-setting-action">
                      <span>Classic</span>
                      <button className="poordown-setting-action__link" disabled>
                        Browse maps <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="poordown-game-card">
              <h3 className="poordown-game-card__title">Gameplay rules</h3>
              <div className="poordown-game-settings">
                {[{
                  icon: '💰',
                  title: 'x2 rent on full-set properties',
                  description: 'If a player owns a full property set, the base rent payment will be doubled',
                  setting: 'double_rent_on_full_set'
                }, {
                  icon: '🏖️',
                  title: 'Vacation cash',
                  description: 'If a player lands on Vacation, all collected money from taxes and bank payments will be earned',
                  setting: 'vacation_cash'
                }, {
                  icon: '🔨',
                  title: 'Auction',
                  description: 'If someone skips purchasing the property landed on, it will be sold to the highest bidder',
                  setting: 'auction_enabled'
                }, {
                  icon: '⚖️',
                  title: "Don’t collect rent while in prison",
                  description: 'Rent will not be collected when landing on properties whose owners are in prison',
                  setting: 'no_rent_in_prison'
                }].map(config => (
                  <GameSettingToggle
                    key={config.setting}
                    icon={config.icon}
                    title={config.title}
                    description={config.description}
                    setting={config.setting}
                    gameId={gameId}
                    game={game}
                    disabled={disableSettings}
                  />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {showPurchaseDialog && purchaseProperty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1c1430] border border-purple-700 rounded-3xl p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Purchase property</h2>
            <div className="bg-[#2a1f47] border border-purple-600 rounded-2xl p-5 mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">{purchaseProperty.name}</h3>
              <p className="text-purple-300 text-lg font-bold">${purchaseProperty.price}</p>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <button
                onClick={() => handleBuyProperty(purchaseProperty.id)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-all"
              >
                💰 Buy for ${purchaseProperty.price}
              </button>
              {game?.auction_enabled && (
                <button
                  onClick={handleStartAuction}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-all"
                >
                  🔨 Start auction
                </button>
              )}
              <button
                onClick={handleSkipProperty}
                className="px-6 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-xl transition-all"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuction && purchaseProperty && (
        <AuctionPanel
          gameId={gameId}
          property={purchaseProperty}
          players={players}
          currentPlayerId={currentPlayer.id}
          onClose={() => {
            setShowAuction(false)
            setPurchaseProperty(null)
            fetchGameData()
          }}
          onComplete={() => {
            setShowAuction(false)
            setPurchaseProperty(null)
            fetchGameData()
          }}
        />
      )}
    </div>
  )
}

export default MonopolyGame

