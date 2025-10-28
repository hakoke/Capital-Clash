import { useState } from 'react'
import { Rocket, Sparkles } from 'lucide-react'
import axios from 'axios'
import ConfirmDialog from './ConfirmDialog'

function AIExecutionPanel({ playerId, onNotification }) {
  const [command, setCommand] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [lastResult, setLastResult] = useState(null)
  const [confirmation, setConfirmation] = useState(null)

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
        // Check if AI needs confirmation
        if (res.data.needsConfirmation && res.data.estimatedCost) {
          setConfirmation({
            message: res.data.playerMessage || `This action will cost $${res.data.estimatedCost.toLocaleString()}. Proceed?`,
            cost: res.data.estimatedCost,
            actionTitle: res.data.eventTitle,
            eventDescription: res.data.eventDescription,
            actionData: res.data.action,
            executeCommands: res.data.executeCommands, // Store commands for when user confirms
            aiResponse: res.data // Store full AI response
          })
          setLastResult(null)
        } else {
          setLastResult({ type: 'success', message: '✓ Action executed successfully!' })
          setCommand('')
          if (onNotification) {
            onNotification('✓ AI executed your command!', 'success')
          }
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

  const handleConfirm = async () => {
    if (!confirmation || !confirmation.executeCommands) return

    try {
      // Execute the stored commands directly using the full AI response
      const res = await axios.post(`/api/player-actions/${playerId}/custom-action`, {
        actionType: 'player_action',
        actionDescription: confirmation.actionData?.actionDescription || command,
        details: { 
          confirmed: true, 
          cost: confirmation.cost, 
          executeCommands: confirmation.executeCommands,
          eventTitle: confirmation.actionTitle,
          eventDescription: confirmation.eventDescription,
          playerMessage: confirmation.message
        }
      })

      if (res.data.success) {
        setLastResult({ type: 'success', message: '✓ Action confirmed and executed!' })
        setCommand('')
        setConfirmation(null)
        if (onNotification) {
          onNotification('✓ Action completed!', 'success')
        }
      }
    } catch (error) {
      console.error('Error confirming action:', error)
      if (onNotification) {
        onNotification('✗ Action failed: ' + (error.response?.data?.error || error.message), 'error')
      }
    }
  }

  const handleCancel = () => {
    setConfirmation(null)
    if (onNotification) {
      onNotification('Action cancelled', 'info')
    }
  }

  return (
    <>
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
            <br />• "Open a brothel in Luxury Mile"
            <br />• "Build a casino downtown"
            <br />• "Launch a solar tech startup"
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

      {/* Confirmation Dialog */}
      {confirmation && (
        <ConfirmDialog
          message={
            <div className="text-center">
              <h3 className="text-lg font-bold mb-2">{confirmation.actionTitle}</h3>
              {confirmation.eventDescription && (
                <p className="text-xs text-gray-400 mb-3">{confirmation.eventDescription}</p>
              )}
              <p className="text-sm mb-4">{confirmation.message}</p>
              <div className="text-xl font-bold text-neon-purple mb-4">
                ${confirmation.cost.toLocaleString()}
              </div>
              <p className="text-xs text-gray-400">Review the details above before confirming</p>
            </div>
          }
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </>
  )
}

export default AIExecutionPanel

