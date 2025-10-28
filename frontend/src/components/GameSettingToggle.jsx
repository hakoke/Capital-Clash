import { useState, useEffect } from 'react'
import axios from 'axios'

function GameSettingToggle({ icon, title, description, setting, gameId, game }) {
  const [value, setValue] = useState(game[setting] !== undefined ? game[setting] : false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (game[setting] !== undefined) {
      setValue(game[setting])
    }
  }, [game, setting])

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
    <div className="bg-purple-950/50 rounded-lg p-4 border border-purple-700">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-xl">{icon}</span>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">{title}</p>
            <p className="text-gray-400 text-xs">{description}</p>
          </div>
        </div>
        
        {/* Toggle Switch */}
        <button
          onClick={toggleSetting}
          disabled={updating}
          className={`
            relative w-14 h-7 rounded-full transition-all duration-200 flex-shrink-0
            ${value ? 'bg-purple-600' : 'bg-gray-600'}
            ${updating ? 'opacity-50' : 'cursor-pointer'}
          `}
        >
          <div className={`
            absolute w-5 h-5 bg-white rounded-full shadow-lg transition-transform duration-200
            ${value ? 'translate-x-7' : 'translate-x-1'}
          `}></div>
        </button>
      </div>
    </div>
  )
}

export default GameSettingToggle

