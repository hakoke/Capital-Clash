import { useState } from 'react'
import { ShoppingCart, Building2, Zap, Rocket } from 'lucide-react'

function ActionPanel({ player, availableTiles, onAction, onAISimulation }) {
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold">Your Actions</h3>
        <span className="text-sm text-gray-400">Turn of {player.name}</span>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setShowLaunchCompany(true)}
          className="bg-card-bg p-4 rounded-lg border border-gray-600 hover:border-neon-purple transition-all text-left"
        >
          <Rocket className="w-6 h-6 text-neon-purple mb-2" />
          <p className="font-semibold">Launch Company</p>
          <p className="text-xs text-gray-400">Start new business</p>
        </button>

        <button
          onClick={onAISimulation}
          className="bg-card-bg p-4 rounded-lg border border-gray-600 hover:border-neon-blue transition-all text-left"
        >
          <Zap className="w-6 h-6 text-neon-blue mb-2" />
          <p className="font-semibold">AI Simulate</p>
          <p className="text-xs text-gray-400">Generate events</p>
        </button>
      </div>

      {/* Available Properties */}
      {availableTiles.length > 0 && (
        <div className="border-t border-gray-700 pt-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-neon-blue" />
            Available Properties
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availableTiles.slice(0, 5).map((tile) => (
              <div
                key={tile.id}
                className="bg-card-bg p-3 rounded-lg text-sm flex justify-between items-center hover:border hover:border-neon-blue transition-all"
              >
                <div>
                  <p className="font-semibold">{tile.name}</p>
                  <p className="text-xs text-gray-400">Plot</p>
                </div>
                <p className="text-neon-blue font-bold">
                  ${parseInt(tile.purchase_price).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
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

