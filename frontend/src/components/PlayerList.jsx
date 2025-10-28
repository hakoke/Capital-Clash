import { Crown, User } from 'lucide-react'

function PlayerList({ players, currentPlayer, currentTurnPlayer, game }) {
  const sortedPlayers = [...players].sort((a, b) => parseFloat(b.capital) - parseFloat(a.capital))
  
  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?'
  }

  const getAvatarColor = (playerOrder) => {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-pink-500', 'bg-cyan-500', 'bg-purple-500']
    return colors[playerOrder % colors.length] || 'bg-gray-600'
  }

  const isPartyLeader = (player, game) => {
    return player.order_in_game === 1
  }

  return (
    <div className="glass rounded-xl p-4 card-glow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <User className="w-5 h-5 text-neon-blue" />
          Players
        </h3>
        {game && (
          <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
            Round {game.current_round}/{game.max_rounds}
          </span>
        )}
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
        {sortedPlayers.map((player) => {
          const isMyPlayer = player.id === currentPlayer.id
          const isTheirTurn = currentTurnPlayer && player.id === currentTurnPlayer.id
          
          return (
            <div
              key={player.id}
              className={`rounded-lg p-3 transition-all ${
                isMyPlayer
                  ? 'bg-neon-blue bg-opacity-20 border-2 border-neon-blue'
                  : isTheirTurn
                  ? 'bg-green-500 bg-opacity-10 border-2 border-green-500'
                  : 'bg-card-bg border border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                {/* Avatar and Name */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`${getAvatarColor(player.order_in_game)} w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 relative`}>
                    {getInitial(player.name)}
                    {isPartyLeader(player, game) && (
                      <Crown className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-semibold text-sm truncate">{player.name}</p>
                      {isTheirTurn && (
                        <span className="text-green-400 text-xs font-bold">• TURN</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{player.company_name}</p>
                  </div>
                </div>

                {/* Capital */}
                <div className="text-right flex-shrink-0">
                  <p className="text-neon-blue font-bold text-sm">
                    ${parseInt(player.capital).toLocaleString().slice(0, -3)}k
                  </p>
                  {isMyPlayer && (
                    <p className="text-[10px] text-neon-blue opacity-80">YOU</p>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PlayerList

