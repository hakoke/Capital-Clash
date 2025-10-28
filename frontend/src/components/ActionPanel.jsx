import { useState } from 'react'
import { Rocket, Zap } from 'lucide-react'

function ActionPanel({ player, onAction, onAISimulation, game, onEndRound, onNotification, isMyTurn }) {
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
    <>
      <div className="glass rounded-xl p-4 card-glow space-y-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold">Quick Actions</h3>
          {game?.phase === 'player_phase' && (
            <span className="text-xs bg-green-500 px-2 py-1 rounded">Phase: Active</span>
          )}
          {game?.phase === 'ai_phase' && (
            <span className="text-xs bg-purple-500 px-2 py-1 rounded">AI Phase</span>
          )}
        </div>

        {/* Launch Company Button */}
        {isMyTurn && (
          <button
            onClick={() => setShowLaunchCompany(true)}
            className="w-full bg-card-bg p-3 rounded-lg border-2 border-gray-600 hover:border-neon-purple transition-all flex items-center justify-center gap-2"
          >
            <Rocket className="w-5 h-5 text-neon-purple" />
            <p className="font-semibold">Launch New Company</p>
          </button>
        )}

        {/* AI Simulation - Only visible to party leader or when in AI phase */}
        {game?.phase === 'ai_phase' && player.order_in_game === 1 && (
          <button
            onClick={onAISimulation}
            className="w-full bg-neon-purple bg-opacity-20 border-2 border-neon-purple p-3 rounded-lg hover:bg-opacity-30 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5 text-neon-purple" />
            <p className="font-semibold text-neon-purple">Run AI Simulation</p>
          </button>
        )}

        {/* Game Phase Info */}
        {game?.phase === 'ai_phase' && (
          <div className="bg-purple-500 bg-opacity-10 border border-purple-500 rounded-lg p-2">
            <p className="text-xs text-purple-400 font-semibold text-center">
              🤖 AI is processing this round...
            </p>
          </div>
        )}
      </div>

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
                  className="w-full px-4 py-2 rounded-lg bg-background border border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-gray-600"
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
    </>
  )
}

export default ActionPanel
