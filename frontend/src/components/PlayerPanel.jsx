import { TrendingUp, Building2, Users, Target } from 'lucide-react'

function PlayerPanel({ player, players, game, currentTurnPlayer }) {
  const sortedPlayers = [...players].sort((a, b) => parseFloat(b.capital) - parseFloat(a.capital))
  const rank = sortedPlayers.findIndex(p => p.id === player.id) + 1
  const isMyTurn = currentTurnPlayer && player.id === currentTurnPlayer.id

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?'
  }

  const getAvatarColor = (playerOrder) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-pink-500', 'bg-cyan-500', 'bg-purple-500']
    return colors[playerOrder % colors.length] || 'bg-gray-600'
  }

  return (
    <div className="space-y-4">
      {/* Current Player Card */}
      <div className="glass rounded-xl p-6 card-glow">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`${getAvatarColor(player.order_in_game)} w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white`}>
              {getInitial(player.name)}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{player.name}</h2>
              <p className="text-gray-400">{player.company_name}</p>
            </div>
          </div>
          <div className="text-4xl">👑</div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-neon-blue" />
              <span className="text-gray-400">Capital</span>
            </div>
            <span className="text-2xl font-bold text-neon-blue">
              ${parseInt(player.capital).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-neon-purple" />
              <span className="text-gray-400">Reputation</span>
            </div>
            <span className="text-xl font-bold text-neon-purple">
              {player.reputation}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-neon-pink" />
              <span className="text-gray-400">Rank</span>
            </div>
            <span className="text-2xl font-bold text-neon-pink">
              #{rank}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700 space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Round {game.current_round} / {game.max_rounds}</span>
            <span className="capitalize">{game.phase}</span>
          </div>
          
          {currentTurnPlayer && (
            <div className={`rounded-lg p-2 text-center font-semibold ${
              isMyTurn 
                ? 'bg-green-500 bg-opacity-20 border-2 border-green-500 text-green-400' 
                : 'bg-gray-800 border border-gray-700 text-gray-400'
            }`}>
              {isMyTurn ? '✓ Your Turn' : `${currentTurnPlayer.name}'s Turn`}
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="glass rounded-xl p-6 card-glow">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-neon-blue" />
          Leaderboard
        </h3>
        <div className="space-y-2">
          {sortedPlayers.map((p, index) => (
            <div
              key={p.id}
              className={`rounded-lg p-3 ${
                p.id === player.id 
                  ? 'bg-neon-blue bg-opacity-20 border border-neon-blue' 
                  : 'bg-card-bg'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">#{index + 1}</span>
                  <div className={`${getAvatarColor(p.order_in_game)} w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0`}>
                    {getInitial(p.name)}
                  </div>
                  <div>
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.company_name}</p>
                  </div>
                </div>
                <span className="text-neon-blue font-bold">
                  ${parseInt(p.capital).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PlayerPanel

