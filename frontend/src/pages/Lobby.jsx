import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Users, Zap, Play } from 'lucide-react'

function Lobby() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchGameData()
    const interval = setInterval(fetchGameData, 2000)
    return () => clearInterval(interval)
  }, [])

  const fetchGameData = async () => {
    try {
      const res = await axios.get(`/api/game/${gameId}`)
      setGame(res.data.game)
      setPlayers(res.data.players)
    } catch (error) {
      console.error('Error fetching game:', error)
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

  if (!game) return <div className="min-h-screen flex items-center justify-center"><div className="text-xl">Loading...</div></div>

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-display font-bold mb-4">Game Lobby</h1>
          <p className="text-2xl text-gray-300">{game.name}</p>
        </div>

        {/* Game Info */}
        <div className="glass rounded-xl p-6 space-y-4 card-glow">
          <div className="flex items-center gap-2 text-neon-blue">
            <Users className="w-6 h-6" />
            <span className="text-lg font-semibold">Players: {players.length}/6</span>
          </div>
          <div className="text-gray-400">
            <p>Status: <span className="text-neon-blue">{game.status}</span></p>
            <p>Max Rounds: {game.max_rounds}</p>
            <p>Current Round: {game.current_round}</p>
          </div>
        </div>

        {/* Players List */}
        <div className="glass rounded-xl p-6 card-glow">
          <h2 className="text-2xl font-bold mb-4">Players</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {players.map((player, index) => (
              <div key={player.id} className="bg-card-bg rounded-lg p-4 border border-neon-blue border-opacity-30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">{player.name}</p>
                    <p className="text-gray-400">{player.company_name}</p>
                    <p className="text-neon-blue mt-2">${parseInt(player.capital).toLocaleString()}</p>
                  </div>
                  <div className="text-4xl">👔</div>
                </div>
              </div>
            ))}
          </div>
          {players.length < 2 && (
            <p className="text-gray-500 text-center mt-4">Waiting for more players... (Need at least 2)</p>
          )}
        </div>

        {/* Start Button */}
        {players.length >= 2 && game.status === 'waiting' && (
          <div className="flex justify-center">
            <button
              onClick={startGame}
              disabled={loading}
              className="btn-primary px-12 py-4 rounded-lg font-semibold text-xl flex items-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                'Starting...'
              ) : (
                <>
                  <Play className="w-6 h-6" />
                  Start Game
                </>
              )}
            </button>
          </div>
        )}

        {/* Share Link */}
        <div className="glass rounded-xl p-6 text-center card-glow">
          <p className="text-gray-400 mb-2">Share this link to invite players:</p>
          <code className="bg-dark-bg px-4 py-2 rounded block">{window.location.origin}/lobby/{gameId}</code>
        </div>
      </div>
    </div>
  )
}

export default Lobby

