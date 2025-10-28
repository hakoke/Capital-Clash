import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Users, Copy, Check, Crown, Settings, Share2, Rocket, Sparkles, Timer } from 'lucide-react'
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
  const [showNameInput, setShowNameInput] = useState(true)
  const [customStartingCash, setCustomStartingCash] = useState('1500')
  const [showCustomInput, setShowCustomInput] = useState(false)

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
  const maxPlayers = game?.max_players || 6
  const playerByColor = useMemo(() => {
    const map = new Map()
    players.forEach(player => {
      if (player?.color) {
        map.set(player.color, player)
      }
    })
    return map
  }, [players])

  const emptySlots = useMemo(() => {
    if (!maxPlayers) return []
    const remaining = Math.max(maxPlayers - players.length, 0)
    return Array.from({ length: remaining })
  }, [maxPlayers, players.length])

  // Show name input first, then color selection
  if (showNameInput && !isPlayerInGame) {
    return (
      <motion.div
        className="min-h-screen overflow-hidden bg-radial-surface flex items-center justify-center"
        variants={layoutVariants}
        initial="enter"
        animate="center"
        exit="exit"
      >
        <div className="absolute inset-0">
          <div className="aurora aurora-1" />
          <div className="aurora aurora-2" />
          <div className="aurora aurora-3" />
          <div className="grid-overlay" />
        </div>

        <motion.div
          className="max-w-lg w-full px-6 relative z-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="flex flex-col items-center text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
          >
            <motion.div
              className="relative"
              animate={{ rotate: [0, -6, 6, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
            >
              <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-neon text-4xl">
                🎲
              </span>
              <motion.span
                className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-fuchsia-500/90 text-white text-xl flex items-center justify-center shadow-glow"
                animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut', delay: 0.8 }}
              >
                💥
              </motion.span>
            </motion.div>
            <h1 className="mt-8 text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-lg">
              poordown
              <span className="text-gradient">.oi</span>
            </h1>
            <p className="mt-3 text-base md:text-lg text-white/70 font-medium">
              Wealth. Strategy. Neon nights.
            </p>
          </motion.div>

          <motion.div
            className="panel panel-glow"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="icon-chip">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-white/40 font-semibold">Pilot Registration</p>
                <h2 className="text-white text-xl font-semibold">Create your legend</h2>
              </div>
            </div>

            <label className="label" htmlFor="player-name">Your callsign</label>
            <div className="relative group">
              <input
                id="player-name"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEnterGame()}
                placeholder="e.g. Neon Tycoon"
                className="input"
                autoFocus
              />
              <motion.div
                className="input-glow"
                initial={{ opacity: 0 }}
                animate={{ opacity: playerName ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleEnterGame}
              className="primary-action"
            >
              <span className="inline-flex items-center gap-2 font-semibold tracking-wide">
                Enter lobby
                <Rocket className="w-5 h-5" />
              </span>
            </motion.button>

            <div className="mt-6 flex items-center justify-between text-xs text-white/40 uppercase tracking-[0.3em]">
              <span>Social trading</span>
              <span>Up to {maxPlayers} players</span>
              <span>Live events</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    )
  }

  // Color selection screen
  if (showColorSelection && !isPlayerInGame) {
    return (
      <motion.div
        className="min-h-screen overflow-hidden bg-radial-surface relative"
        variants={layoutVariants}
        initial="enter"
        animate="center"
        exit="exit"
      >
        <div className="absolute inset-0">
          <div className="aurora aurora-1" />
          <div className="aurora aurora-2" />
          <div className="aurora aurora-3" />
          <div className="grid-overlay" />
          <div className="starfield" />
        </div>

        <div className="relative z-10 flex flex-col items-center min-h-screen py-12 px-6">
          <motion.div
            className="w-full max-w-6xl grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              className="panel subtle-panel"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="icon-chip icon-chip-sm">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="label-xs">Lobby link</p>
                  <p className="text-white text-sm font-semibold">Invite friends</p>
                </div>
              </div>
              <div className="share-field">
                <span className="truncate text-white/70 text-sm">{window.location.origin}/lobby/{gameId}</span>
                <button
                  onClick={copyGameLink}
                  className={`share-button ${linkCopied ? 'copied' : ''}`}
                >
                  {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{linkCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="mt-6 text-xs text-white/40 uppercase tracking-[0.35em] flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-white/60">
                  <Timer className="w-3.5 h-3.5" />
                  Live lobby
                </span>
                <span className="text-white/30">•</span>
                <span>Slots {players.length}/{maxPlayers}</span>
              </div>
            </motion.div>

            <div className="grid gap-6">
              <motion.div
                className="panel panel-glow"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
                  <div>
                    <p className="label-xs">Player appearance</p>
                    <h2 className="heading">Claim your neon avatar</h2>
                    <p className="helper">Colors illuminate the board with dynamic trails once the match starts.</p>
                  </div>
                  <motion.div
                    className="lobby-badge"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                  >
                    <span className="text-3xl">✨</span>
                    <div>
                      <p className="text-xs text-white/60 uppercase tracking-[0.35em]">Session</p>
                      <p className="text-white font-semibold">#{gameId.slice(0, 6)}</p>
                    </div>
                  </motion.div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                  {PLAYER_COLORS.map((colorObj, idx) => {
                    const takenPlayer = playerByColor.get(colorObj.name)
                    const isSelected = selectedColor === colorObj.name
                    const isTaken = Boolean(takenPlayer)
                    const delay = 0.05 * idx

                    return (
                      <motion.button
                        key={colorObj.name}
                        type="button"
                        disabled={isTaken}
                        onClick={() => !isTaken && setSelectedColor(colorObj.name)}
                        className={`color-chip ${isSelected ? 'selected' : ''} ${isTaken ? 'taken' : ''}`}
                        whileHover={!isTaken ? { scale: 1.05 } : undefined}
                        whileTap={!isTaken ? { scale: 0.97 } : undefined}
                        initial={{ opacity: 0, scale: 0.85, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay, duration: 0.4, ease: 'easeOut' }}
                      >
                        <span className="color-swatch" style={{ background: colorObj.hex }} />
                        <span className="color-label">{colorObj.name}</span>
                        <AnimatePresence>
                          {isSelected && !isTaken && (
                            <motion.span
                              className="chip-indicator"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                            >
                              ✓
                            </motion.span>
                          )}
                        </AnimatePresence>
                        {takenPlayer && (
                          <span className="taken-label">{takenPlayer.name}</span>
                        )}
                      </motion.button>
                    )
                  })}
                </div>

                <motion.button
                  onClick={joinGame}
                  disabled={loading || !selectedColor}
                  className="primary-action"
                  whileHover={{ scale: selectedColor ? 1.02 : 1 }}
                  whileTap={{ scale: selectedColor ? 0.98 : 1 }}
                >
                  <span className="inline-flex items-center gap-2">
                    {loading ? 'Syncing…' : 'Join lobby'}
                    <Rocket className="w-5 h-5" />
                  </span>
                </motion.button>

                <p className="mt-4 text-xs text-white/40 uppercase tracking-[0.35em] text-center">
                  Pick a color to light up the board trail
                </p>
              </motion.div>

              <motion.div
                className="panel subtle-panel"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6, ease: 'easeOut' }}
              >
                <p className="label-xs">Lobby status</p>
                <div className="lobby-timeline">
                  <div className="timeline-track">
                    <motion.div
                      className="timeline-progress"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((players.length / maxPlayers) * 100, 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                    />
                  </div>
                  <div className="timeline-labels">
                    <span>Waiting room</span>
                    <span className="text-white/70">{players.length} joined</span>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {players.map(player => (
                    <div key={player.id} className="player-slot">
                      <span className="slot-indicator" style={{ background: player.color }} />
                      <div>
                        <p className="player-name">{player.name}</p>
                        <p className="player-meta">${parseInt(player.money || 0).toLocaleString()}</p>
                      </div>
                      {player.order_in_game === 1 && <Crown className="w-4 h-4 text-yellow-300" />}
                    </div>
                  ))}
                  {emptySlots.map((_, idx) => (
                    <div key={`slot-${idx}`} className="player-slot empty">
                      <span className="slot-indicator" />
                      <div>
                        <p className="player-name">Awaiting</p>
                        <p className="player-meta">Seat open</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="min-h-screen overflow-hidden bg-radial-surface relative"
      variants={layoutVariants}
      initial="enter"
      animate="center"
      exit="exit"
    >
      <div className="absolute inset-0">
        <div className="aurora aurora-1" />
        <div className="aurora aurora-2" />
        <div className="aurora aurora-3" />
        <div className="grid-overlay" />
        <div className="starfield" />
      </div>

      <div className="relative z-10 px-6 py-12 max-w-7xl mx-auto flex flex-col gap-8">
        <motion.header
          className="flex flex-col gap-4 text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="flex flex-col items-center gap-3">
            <motion.div
              className="badge-xl"
              animate={{ rotate: [0, -2, 2, 0], scale: [1, 1.04, 1] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
            >
              🎲
            </motion.div>
            <h1 className="heading text-4xl md:text-5xl">
              poordown<span className="text-gradient">.oi</span>
            </h1>
            <p className="helper text-sm md:text-base">
              {game.status === 'waiting' ? 'Lobby open · Waiting for contenders' : 'Game in progress · Spectate incoming moves'}
            </p>
          </div>
        </motion.header>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)_320px]">
          <motion.aside
            className="panel subtle-panel"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="icon-chip">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <p className="label-xs">Link your crew</p>
                <h2 className="text-white font-semibold">Invite to this lobby</h2>
              </div>
            </div>
            <div className="share-field">
              <span className="truncate text-white/70">{window.location.origin}/lobby/{gameId}</span>
              <button
                onClick={copyGameLink}
                className={`share-button ${linkCopied ? 'copied' : ''}`}
              >
                {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{linkCopied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="status-pill">
                <Timer className="w-4 h-4" />
                <span>{game.status === 'waiting' ? 'Lobby in standby' : 'Match active'}</span>
              </div>
              <div className="status-pill">
                <Users className="w-4 h-4" />
                <span>{players.length}/{maxPlayers} players joined</span>
              </div>
            </div>

            {isPlayerInGame && (
              <div className="mt-10">
                <p className="label-xs mb-3">Roster</p>
                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                  {players.map(player => (
                    <motion.div
                      key={player.id}
                      className="player-card"
                      layout
                    >
                      <span className="player-chip" style={{ background: player.color }}>
                        {player.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="player-name">{player.name}</p>
                        <p className="player-meta">${parseInt(player.money || 0).toLocaleString()}</p>
                      </div>
                      {player.order_in_game === 1 && <Crown className="w-4 h-4 text-yellow-300" />}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.aside>

          <motion.main
            className="panel panel-glow"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
              <div>
                <p className="label-xs">Board status</p>
                <h2 className="heading">Prepare for financial dominance</h2>
                <p className="helper">Configure rules, review the roster, and launch when your rivals arrive.</p>
              </div>
              {isHost && (
                <motion.div
                  className={`launch-pad ${players.length >= 2 ? 'ready' : ''}`}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
                >
                  <span className="launch-icon">🚀</span>
                  <div>
                    <p className="label-xs">Launch status</p>
                    <p className="text-white font-semibold">{players.length >= 2 ? 'Ready for lift-off' : 'Need more players'}</p>
                  </div>
                  <button
                    onClick={startGame}
                    disabled={loading || players.length < 2}
                    className="launch-button"
                  >
                    {loading ? 'Starting…' : 'Start Game'}
                  </button>
                </motion.div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="stat-tile">
                <span className="stat-label">Players</span>
                <span className="stat-value">{players.length}</span>
              </div>
              <div className="stat-tile">
                <span className="stat-label">Starting cash</span>
                <span className="stat-value">${parseInt(game.starting_cash || 1500).toLocaleString()}</span>
              </div>
              <div className="stat-tile">
                <span className="stat-label">Room code</span>
                <span className="stat-value">{gameId.slice(0, 6)}</span>
              </div>
            </div>

            {!isHost && game.status === 'waiting' && (
              <div className="alert-banner">
                <span className="alert-dot" />
                Waiting for host to launch the match…
              </div>
            )}

            <div className="mt-10">
              <p className="label-xs mb-4">Lobby timeline</p>
              <div className="lobby-timeline">
                <div className="timeline-track">
                  <motion.div
                    className="timeline-progress"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((players.length / maxPlayers) * 100, 100)}%` }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                  />
                </div>
                <div className="timeline-labels">
                  <span>Staging room</span>
                  <span>{players.length} / {maxPlayers} players locked in</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {players.map(player => (
                  <div key={player.id} className="player-slot">
                    <span className="slot-indicator" style={{ background: player.color }} />
                    <div className="min-w-0">
                      <p className="player-name">{player.name}</p>
                      <p className="player-meta">${parseInt(player.money || 0).toLocaleString()}</p>
                    </div>
                    {player.order_in_game === 1 && <Crown className="w-4 h-4 text-yellow-300" />}
                  </div>
                ))}
                {emptySlots.map((_, idx) => (
                  <div key={`slot-${idx}`} className="player-slot empty">
                    <span className="slot-indicator" />
                    <div>
                      <p className="player-name">Awaiting player</p>
                      <p className="player-meta">Seat open</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.main>

          {isHost && game.status === 'waiting' && (
            <motion.aside
              className="panel subtle-panel"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="icon-chip">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <p className="label-xs">Gameplay modifiers</p>
                  <h2 className="text-white font-semibold">Tune your ruleset</h2>
                </div>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                <GameSettingToggle
                  icon="💰"
                  title="Double rent on full sets"
                  description="Owning an entire property set doubles the rent received."
                  setting="double_rent_on_full_set"
                  gameId={gameId}
                  game={game}
                />

                <GameSettingToggle
                  icon="🏖️"
                  title="Vacation cashout"
                  description="Landing on vacation scoops all banked taxes."
                  setting="vacation_cash"
                  gameId={gameId}
                  game={game}
                />

                <GameSettingToggle
                  icon="🔨"
                  title="Auction houses"
                  description="Skipped properties go to auction for the highest bidder."
                  setting="auction_enabled"
                  gameId={gameId}
                  game={game}
                />

                <GameSettingToggle
                  icon="⚖️"
                  title="No rent in prison"
                  description="Owners in jail pause rent collection."
                  setting="no_rent_in_prison"
                  gameId={gameId}
                  game={game}
                />

                <GameSettingToggle
                  icon="🏠"
                  title="Mortgage assets"
                  description="Mortgage properties for 50% value, halting rent income."
                  setting="mortgage_enabled"
                  gameId={gameId}
                  game={game}
                />

                <GameSettingToggle
                  icon="🏗️"
                  title="Even build rule"
                  description="Houses and hotels must be built evenly across sets."
                  setting="even_build"
                  gameId={gameId}
                  game={game}
                />

                <div className="panel inner-panel">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">💵</span>
                    <div>
                      <p className="text-white font-semibold">Starting cash</p>
                      <p className="helper">Set the capital each mogul begins with.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
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
                      className="select"
                    >
                      <option value="500">$500</option>
                      <option value="1000">$1,000</option>
                      <option value="1500">$1,500 (Classic)</option>
                      <option value="2000">$2,000</option>
                      <option value="2500">$2,500</option>
                      <option value="3000">$3,000</option>
                      <option value="custom">Custom…</option>
                    </select>

                    {showCustomInput && (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={customStartingCash}
                          onChange={(e) => setCustomStartingCash(e.target.value)}
                          placeholder="Amount"
                          min="100"
                          step="100"
                          className="input"
                        />
                        <button
                          onClick={() => {
                            const amount = parseInt(customStartingCash)
                            if (amount >= 100) {
                              updateStartingCash(amount)
                              setShowCustomInput(false)
                            }
                          }}
                          className="mini-action"
                        >
                          Set
                        </button>
                        <button
                          onClick={() => setShowCustomInput(false)}
                          className="mini-action ghost"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default Lobby

