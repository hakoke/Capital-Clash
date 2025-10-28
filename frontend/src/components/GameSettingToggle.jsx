import { useState, useEffect } from 'react'
import axios from 'axios'

function GameSettingToggle({ icon, title, description, setting, gameId, game, disabled = false }) {
  const [value, setValue] = useState(game[setting] !== undefined ? game[setting] : false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (game[setting] !== undefined) {
      setValue(game[setting])
    }
  }, [game, setting])

  const toggleSetting = async () => {
    if (disabled || updating) return
    const newValue = !value
    setUpdating(true)
    
    try {
      await axios.post(`/api/game/${gameId}/settings`, {
        setting,
        value: newValue
      })
      setValue(newValue)
    } catch (error) {
      console.error('Error updating setting:', error)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="bg-[#2a0f3f] rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-xl mt-0.5" style={{ filter: 'drop-shadow(0 0 6px rgba(0,255,255,0.4))' }}>{icon}</span>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm" style={{ fontSize: '13px', fontWeight: 500 }}>{title}</p>
            <p className="text-gray-400 text-xs mt-0.5" style={{ fontSize: '11px' }}>{description}</p>
          </div>
        </div>
        
        {/* Toggle Switch - RichUp style with cyan glow */}
        <button
          onClick={toggleSetting}
          disabled={disabled || updating}
          className={`relative w-14 h-7 rounded-full transition-all duration-200 flex-shrink-0 top-1 ${(disabled || updating) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          style={{ 
            background: value ? '#4B2BB2' : '#2F2F2F',
            boxShadow: value ? '0 0 15px rgba(0, 228, 255, 0.5), inset 0 0 10px rgba(0, 228, 255, 0.2)' : 'none',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div className={`absolute w-5 h-5 bg-white rounded-full transition-all duration-200 top-1 ${value ? 'translate-x-7' : 'translate-x-1'}`}
            style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
          ></div>
        </button>
      </div>
    </div>
  )
}

export default GameSettingToggle

