import { useEffect, useState } from 'react'
import axios from 'axios'

function PlayerInfoPanel({ gameId, currentPlayer, allPlayers, properties }) {
  const [myProperties, setMyProperties] = useState([])

  useEffect(() => {
    if (currentPlayer && properties) {
      const owned = properties.filter(p => p.owner_id === currentPlayer.id)
      setMyProperties(owned)
    }
  }, [currentPlayer, properties])

  if (!currentPlayer) return null

  // Calculate total property value
  const totalPropertyValue = myProperties.reduce((sum, prop) => sum + (parseFloat(prop.price) || 0), 0)
  const totalWorth = parseFloat(currentPlayer.money || 0) + totalPropertyValue

  return (
    <div className="bg-white rounded-lg shadow-lg p-3 md:p-4 h-full overflow-y-auto">
      <h3 className="text-base md:text-xl font-bold mb-3 md:mb-4 flex items-center gap-2">
        <span 
          className="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white font-bold text-sm md:text-base"
          style={{ backgroundColor: currentPlayer.color }}
        >
          {currentPlayer.name.charAt(0).toUpperCase()}
        </span>
        <span className="truncate">{currentPlayer.name}</span>
      </h3>

      {/* Money */}
      <div className="mb-3 md:mb-4 p-2 md:p-3 bg-green-50 rounded-lg border border-green-200">
        <div className="text-xs md:text-sm text-gray-600 mb-1">Cash 💰</div>
        <div className="text-xl md:text-2xl font-bold text-green-600">${parseInt(currentPlayer.money || 0).toLocaleString()}</div>
      </div>

      {/* Total Worth */}
      <div className="mb-3 md:mb-4 p-2 md:p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-xs md:text-sm text-gray-600 mb-1">Total Worth 📊</div>
        <div className="text-lg md:text-xl font-bold text-blue-600">${totalWorth.toLocaleString()}</div>
        <div className="text-[10px] md:text-xs text-gray-500 mt-1">
          ${parseInt(currentPlayer.money || 0).toLocaleString()} cash + ${totalPropertyValue.toLocaleString()} props
        </div>
      </div>

      {/* Properties Owned */}
      <div className="mb-3 md:mb-4">
        <h4 className="font-semibold mb-2 text-gray-700 text-sm md:text-base">🏠 Properties ({myProperties.length})</h4>
        <div className="space-y-2 max-h-48 md:max-h-60 overflow-y-auto">
          {myProperties.length > 0 ? (
            myProperties.map(prop => (
                  <div key={prop.id} className="p-2 bg-gray-50 rounded border border-gray-200">
                <div className="font-semibold text-xs md:text-sm truncate">{prop.name}</div>
                <div className="text-[10px] md:text-xs text-gray-600">
                  ${prop.price} • Rent: ${prop.rent}
                  {prop.houses > 0 && ` • ${prop.houses}🏠`}
                  {prop.hotels > 0 && ` • ${prop.hotels}🏨`}
                </div>
                {prop.color_group && (
                  <div className="mt-1 flex items-center gap-1">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: prop.color_group === 'brown' ? '#8B4513' : 
                                          prop.color_group === 'light_blue' ? '#87CEEB' :
                                          prop.color_group === 'pink' ? '#FF69B4' :
                                          prop.color_group === 'orange' ? '#FFA500' :
                                          prop.color_group === 'red' ? '#DC143C' :
                                          prop.color_group === 'yellow' ? '#FFD700' :
                                          prop.color_group === 'green' ? '#228B22' :
                                          prop.color_group === 'blue' ? '#191970' : '#E5E7EB' }}
                    />
                    <span className="text-[10px] text-gray-500 capitalize">{prop.color_group.replace('_', ' ')}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No properties owned yet</p>
          )}
        </div>
      </div>

      {/* All Players */}
      <div>
        <h4 className="font-semibold mb-2 text-gray-700 text-sm md:text-base">👥 All Players</h4>
        <div className="space-y-2">
          {allPlayers.map(player => (
            <div 
              key={player.id} 
              className={`p-2 rounded border ${
                player.id === currentPlayer.id ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: player.color }}
                >
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{player.name}</div>
                  <div className="text-xs text-gray-600">${parseInt(player.money || 0).toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PlayerInfoPanel

