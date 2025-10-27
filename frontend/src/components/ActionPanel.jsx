import { useState } from 'react'
import { ShoppingCart, Building2, Rocket } from 'lucide-react'

function ActionPanel({ player, availableTiles, onAction, onAISimulation, game, onEndRound, onNotification }) {
  const [showLaunchCompany, setShowLaunchCompany] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('ai')
  const [investment, setInvestment] = useState(200000)

  const handleLaunchCompany = () => {
    onAction('launch_company', {
      name: companyName || 'My Company',
      industry,
      initialInvestment: investment
    })
    setShowLaunchCompany(false)
    setCompanyName('')
  }

  const industries = [
    { value: 'ai', label: 'AI & Tech' },
    { value: 'retail', label: 'Retail & Commerce' },
    { value: 'energy', label: 'Energy & Power' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'entertainment', label: 'Entertainment' }
  ]

  return (
    <div className="glass rounded-xl p-6 card-glow space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">Actions</h3>
        <span className="text-sm text-gray-400">Turn: {player.name}</span>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setShowLaunchCompany(true)}
          className="flex-1 bg-card-bg p-4 rounded-lg border border-gray-600 hover:border-neon-purple transition-all"
        >
          <Rocket className="w-6 h-6 text-neon-purple mx-auto mb-2" />
          <p className="font-semibold">Launch Company</p>
          <p className="text-xs text-gray-400">Start new business</p>
        </button>
      </div>

      {/* Round Phase Info */}
      {game?.phase === 'player_phase' && (
        <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-3 mb-4">
          <p className="text-sm text-green-400 font-semibold">
            ✓ Players can take actions now
          </p>
        </div>
      )}
      
      {game?.phase === 'ai_phase' && (
        <div className="bg-neon-purple bg-opacity-10 border border-neon-purple rounded-lg p-3 mb-4">
          <p className="text-sm text-neon-purple font-semibold">
            🤖 AI is simulating the round...
          </p>
        </div>
      )}

      {/* End Round Button - Fixed at bottom of viewport */}
      {game?.phase === 'player_phase' && player.order_in_game === game.current_player_turn && (
        <div className="fixed bottom-8 right-8 z-50 animate-fade-in">
          <button
            onClick={onEndRound}
            className="btn-primary py-4 px-8 rounded-lg font-bold text-lg transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-2xl"
          >
            <span>⏭️</span>
            End My Turn
          </button>
        </div>
      )}

      {/* Available Properties - Compact Card Grid */}
      {availableTiles.length > 0 && (
        <div className="border-t border-gray-700 pt-4">
          <h4 className="font-semibold mb-3 text-sm flex items-center gap-2 text-gray-300">
            <ShoppingCart className="w-4 h-4 text-neon-blue" />
            Available ({availableTiles.length})
          </h4>
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {availableTiles.slice(0, 8).map((tile) => (
              <div
                key={tile.id}
                className="bg-card-bg p-2 rounded-lg border border-gray-700 hover:border-neon-blue transition-all"
              >
                <p className="font-semibold text-xs mb-1 truncate">{tile.name}</p>
                <p className="text-neon-blue font-bold text-sm">
                  ${parseInt(tile.purchase_price).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          {availableTiles.length > 8 && (
            <p className="text-xs text-gray-500 text-center mt-2">
              +{availableTiles.length - 8} more (click tiles on board)
            </p>
          )}
        </div>
      )}

      {/* Launch Company Modal */}
      {showLaunchCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-xl p-6 max-w-md w-full border-2 border-neon-purple">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">Launch New Company</h3>
              <button
                onClick={() => setShowLaunchCompany(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="NovaTech Corp"
                  className="w-full px-4 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg"
                >
                  {industries.map((ind) => (
                    <option key={ind.value} value={ind.value}>
                      {ind.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Initial Investment: ${investment.toLocaleString()}
                </label>
                <input
                  type="range"
                  min="100000"
                  max="500000"
                  step="50000"
                  value={investment}
                  onChange={(e) => setInvestment(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>$100k</span>
                  <span>$500k</span>
                </div>
              </div>

              <button
                onClick={handleLaunchCompany}
                className="btn-primary w-full py-3 rounded-lg font-semibold"
              >
                <Rocket className="w-5 h-5 inline mr-2" />
                Launch Company
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActionPanel

