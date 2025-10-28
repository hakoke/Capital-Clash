import { useState } from 'react'
import { Rocket, Sparkles, Send } from 'lucide-react'
import axios from 'axios'

function AIExecutionPanel({ playerId, onNotification }) {
  const [command, setCommand] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [lastResult, setLastResult] = useState(null)

  const handleExecute = async (e) => {
    e.preventDefault()
    if (!command.trim() || isExecuting) return

    setIsExecuting(true)
    setLastResult(null)

    try {
      // Send as custom action to backend
      const res = await axios.post(`/api/player-actions/${playerId}/custom-action`, {
        actionType: 'player_action',
        actionDescription: command,
        details: {}
      })

      if (res.data.success) {
        setLastResult({ type: 'success', message: '✓ Command executed successfully!' })
        setCommand('')
        if (onNotification) {
          onNotification('✓ AI executed your command!', 'success')
        }
      }
    } catch (error) {
      console.error('Error executing AI command:', error)
      setLastResult({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to execute command' 
      })
      if (onNotification) {
        onNotification('✗ Command failed: ' + (error.response?.data?.error || error.message), 'error')
      }
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="glass rounded-xl p-3 card-glow">
      <div className="flex items-center gap-2 mb-2">
        <Rocket className="w-5 h-5 text-neon-purple" />
        <h3 className="text-lg font-bold">AI Execution</h3>
      </div>

      <div className="bg-neon-purple bg-opacity-10 border border-neon-purple rounded-lg p-1.5 mb-2 text-xs">
        <p className="text-xs text-gray-300 mb-2">
          🤖 <strong>AI Mode:</strong> Execute commands to affect the game!
        </p>
        <div className="text-xs space-y-1 text-gray-400">
          <strong>Examples:</strong>
          <br />• "Invest $200k in solar tech"
          <br />• "Launch a new startup"
          <br />• "Run a PR campaign"
        </div>
      </div>

      <form onSubmit={handleExecute} className="space-y-2">
        <textarea
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Describe your action..."
          disabled={isExecuting}
          className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-gray-600 h-20 resize-none"
          rows="3"
        />

        <button
          type="submit"
          disabled={isExecuting || !command.trim()}
          className="btn-primary w-full py-2 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExecuting ? (
            <span className="animate-spin">⚙️</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Execute Command
            </>
          )}
        </button>
      </form>

      {lastResult && (
        <div className={`mt-3 p-2 rounded-lg text-xs ${
          lastResult.type === 'success' 
            ? 'bg-green-500 bg-opacity-20 text-green-400' 
            : 'bg-red-500 bg-opacity-20 text-red-400'
        }`}>
          {lastResult.message}
        </div>
      )}
    </div>
  )
}

export default AIExecutionPanel

