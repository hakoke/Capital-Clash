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
  HelpCircle,
  Volume2,
  Search
} from 'lucide-react'

import MonopolyBoard from '../components/MonopolyBoard'
import Notification from '../components/Notification'
import PlayerAvatar from '../components/PlayerAvatar'
import GameSettingToggle from '../components/GameSettingToggle'
import AuctionPanel from '../components/AuctionPanel'
import Dice3D from '../components/Dice3D'

const STARTING_CASH_PRESETS = [1000, 1500, 2000, 2500, 3000]
const formatCurrency = (value) => `$${Number(value || 0).toLocaleString()}`

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
  const [startingCashOption, setStartingCashOption] = useState('1500')
  const [customStartingCash, setCustomStartingCash] = useState('1500')

  const socketRef = useRef(null)
  const isHost = currentPlayer?.order_in_game === 1
  const disableSettings = !isHost

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
    if (!game || game.starting_cash == null) return
    const normalized = Math.round(Number(game.starting_cash)) || 1500

    if (STARTING_CASH_PRESETS.includes(normalized)) {
      setStartingCashOption(String(normalized))
      setCustomStartingCash(String(normalized))
    } else {
      setStartingCashOption('custom')
      setCustomStartingCash(String(normalized))
    }
  }, [game?.starting_cash])

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
          message += ` Paid ${formatCurrency(rentPaid)} rent`
        }
        if (res.data.taxPaid) {
          message += ` Paid ${formatCurrency(res.data.taxPaid)} tax`
        }
        if (res.data.bonusCollected) {
          message += ` Collected ${formatCurrency(res.data.bonusCollected)} vacation cash`
        }
        if (res.data.forcedAction === 'go_to_jail') {
          message += ' Sent to customs check!'
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

  const handleManageStructure = async (propertyId, action) => {
    if (!currentPlayer) return

    const property = properties.find((p) => p.id === propertyId)
    const propertyName = property?.name || 'property'

    const actionMessages = {
      build_house: `Built a house on ${propertyName}`,
      sell_house: `Sold a house from ${propertyName}`,
      build_hotel: `Constructed a hotel on ${propertyName}`,
      sell_hotel: `Sold the hotel on ${propertyName}`
    }

    try {
      await axios.post(`/api/player/${currentPlayer.id}/properties/${propertyId}/structures`, { action })
      showNotification(actionMessages[action] || 'Property updated', 'success')
      fetchGameData()
    } catch (error) {
      console.error('Error managing structure:', error)
      showNotification('Unable to update property: ' + (error.response?.data?.error || error.message), 'error')
    }
  }

  const handleToggleMortgage = async (propertyId, mode) => {
    if (!currentPlayer) return

    const property = properties.find((p) => p.id === propertyId)
    const propertyName = property?.name || 'property'

    const endpoint = mode === 'mortgage' ? 'mortgage' : 'unmortgage'
    const successMessage = mode === 'mortgage'
      ? `Mortgaged ${propertyName}`
      : `Lifted mortgage on ${propertyName}`

    try {
      await axios.post(`/api/player/${currentPlayer.id}/properties/${propertyId}/${endpoint}`)
      showNotification(successMessage, 'info')
      fetchGameData()
    } catch (error) {
      console.error('Error toggling mortgage:', error)
      showNotification('Mortgage update failed: ' + (error.response?.data?.error || error.message), 'error')
    }
  }

  const updateStartingCashSetting = async (amount) => {
    try {
      await axios.post(`/api/game/${gameId}/settings`, {
        setting: 'starting_cash',
        value: amount
      })
      showNotification(`Starting money set to ${formatCurrency(amount)}`, 'info')
      fetchGameData()
    } catch (error) {
      console.error('Error updating starting money:', error)
      showNotification('Unable to update starting money: ' + (error.response?.data?.error || error.message), 'error')
    }
  }

  const handleStartingCashPreset = (amount) => {
    if (!game || disableSettings) return
    setStartingCashOption(String(amount))
    setCustomStartingCash(String(amount))
    updateStartingCashSetting(amount)
  }

  const handleCustomStartingCashApply = () => {
    if (!game || disableSettings) return
    const parsed = Math.round(Number(customStartingCash) || 0)
    const amount = Math.max(500, parsed)
    setCustomStartingCash(String(amount))
    updateStartingCashSetting(amount)
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
    <Dice3D key={key} value={value || null} size="lg" />
  )

  if (!game || !currentPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0616] text-white">
        <div className="text-lg tracking-wide uppercase">Loading game...</div>
      </div>
    )
  }

  const isMyTurn = currentTurnPlayer && currentPlayer && currentTurnPlayer.id === currentPlayer.id
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
                  <Dice3D value={diceResult.die1} size="xl" animate />
                  <div className="text-3xl font-semibold">+</div>
                  <Dice3D value={diceResult.die2} size="xl" animate />
                </>
              ) : (
                <Dice3D value={null} size="xl" animate />
              )}
            </div>
            {!diceResult && (
              <div className="text-sm tracking-[0.3em] uppercase text-purple-200">Rolling…</div>
            )}
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
                  onManageStructure={handleManageStructure}
                  onToggleMortgage={handleToggleMortgage}
                  settings={game}
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
                <div
                  className="poordown-setting-card"
                  onMouseEnter={() => disableSettings && handleGuardHover('startingCash')}
                  onMouseLeave={() => disableSettings && handleGuardLeave()}
                >
                  <div className="poordown-setting-card__body poordown-setting-card__body--column">
                    <div className="poordown-setting-card__label">
                      <svg className="poordown-setting-card__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 .895-4 2s1.79 2 4 2 4 .895 4 2-1.79 2-4 2m0-8c2.21 0 4 .895 4 2m-4-4v1m0 10v1m-6-3.5c0 1.657 2.686 3 6 3s6-1.343 6-3V8.5" />
                      </svg>
                      <div>
                        <p>Starting money</p>
                        <span>Recommended {formatCurrency(1500)}</span>
                      </div>
                    </div>
                    <div className="poordown-setting-money">
                      {STARTING_CASH_PRESETS.map((amount) => (
                        <button
                          key={amount}
                          type="button"
                          className={`poordown-money-chip ${startingCashOption === String(amount) ? 'active' : ''}`}
                          onClick={() => handleStartingCashPreset(amount)}
                          disabled={disableSettings}
                        >
                          {formatCurrency(amount)}
                        </button>
                      ))}
                      <button
                        type="button"
                        className={`poordown-money-chip ${startingCashOption === 'custom' ? 'active' : ''}`}
                        onClick={() => {
                          if (disableSettings) return
                          setStartingCashOption('custom')
                        }}
                        disabled={disableSettings}
                      >
                        Custom
                      </button>
                    </div>
                    {startingCashOption === 'custom' && (
                      <div className="poordown-money-custom">
                        <input
                          type="number"
                          min={500}
                          step={50}
                          value={customStartingCash}
                          onChange={(e) => setCustomStartingCash(e.target.value)}
                          disabled={disableSettings}
                          className="poordown-money-input"
                        />
                        <button
                          type="button"
                          className="poordown-money-apply"
                          onClick={handleCustomStartingCashApply}
                          disabled={disableSettings}
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>
                  {disableSettings && renderGuardTooltip('startingCash')}
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
                }, {
                  icon: '🏦',
                  title: 'Mortgage',
                  description: 'Mortgage properties to receive half their cost; mortgaged titles stop paying rent',
                  setting: 'mortgage_enabled'
                }, {
                  icon: '🏗️',
                  title: 'Even build',
                  description: 'Houses and hotels must be added or removed evenly across properties in a set',
                  setting: 'even_build'
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

