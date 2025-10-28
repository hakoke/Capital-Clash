import { useState } from 'react'
import axios from 'axios'

function GameSettingToggle({ icon, title, description, setting, gameId, game }) {
  const [value, setValue] = useState(game[setting] !== undefined ? game[setting] : true)
  const [updating, setUpdating] = useState(false)

  const toggleSetting = async () => {
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
    <div className="flex items-center justify-between bg-purple-800 rounded-lg p-3">
      <div className="flex items-center gap-3 flex-1">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="text-xs text-purple-300">{description}</div>
        </div>
      </div>
      
      {/* Toggle Switch */}
      <button
        onClick={toggleSetting}
        disabled={updating}
        className={`
          relative w-14 h-7 rounded-full transition-colors duration-200 flex-shrink-0
          ${value ? 'bg-purple-500' : 'bg-purple-600'}
          ${updating ? 'opacity-50' : ''}
        `}
      >
        <div className={`
          absolute w-5 h-5 bg-white rounded-full transition-transform duration-200
          ${value ? 'translate-x-7' : 'translate-x-1'}
        `}></div>
      </button>
    </div>
  )
}

export default GameSettingToggle

