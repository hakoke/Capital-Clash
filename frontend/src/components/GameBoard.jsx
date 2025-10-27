import { useState } from 'react'
import { MapPin, Building } from 'lucide-react'

function GameBoard({ tiles, districts, players, currentPlayer, onBuyTile }) {
  const [selectedTile, setSelectedTile] = useState(null)

  const getDistrictColor = (districtType) => {
    const colors = {
      tech_park: 'from-blue-500 to-cyan-500',
      downtown: 'from-yellow-500 to-orange-500',
      industrial: 'from-gray-500 to-slate-500',
      green_valley: 'from-green-500 to-emerald-500',
      luxury_mile: 'from-pink-500 to-rose-500',
      harborfront: 'from-blue-400 to-teal-500'
    }
    return colors[districtType] || 'from-purple-500 to-indigo-500'
  }

  const getPlayerName = (ownerId) => {
    return players.find(p => p.id === ownerId)?.name || ''
  }

  return (
    <div className="glass rounded-xl p-6 card-glow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-display font-bold">Neo-Arcadia</h2>
        <div className="flex items-center gap-2 text-neon-blue">
          <MapPin className="w-5 h-5" />
          <span>Game Board</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {districts.map((district) => {
          const districtTiles = tiles.filter(t => t.district_id === district.id)
          
          return (
            <div key={district.id} className="space-y-2">
              {/* District Header */}
              <div className={`bg-gradient-to-r ${getDistrictColor(district.type)} rounded-lg p-4 text-center`}>
                <h3 className="font-bold text-white">{district.name}</h3>
                <p className="text-xs text-white opacity-80">{district.type.replace('_', ' ')}</p>
              </div>

              {/* Tiles in District */}
              <div className="space-y-2">
                {districtTiles.map((tile) => {
                  const isOwned = !!tile.owner_id
                  const isSelected = selectedTile?.id === tile.id
                  const isAffordable = parseFloat(currentPlayer?.capital || 0) >= parseFloat(tile.purchase_price)
                  
                  return (
                    <div
                      key={tile.id}
                      onClick={() => {
                        if (!isOwned && isAffordable) {
                          setSelectedTile(tile)
                        }
                      }}
                      className={`rounded-lg p-3 tile ${
                        isOwned 
                          ? 'bg-card-bg border-2 border-neon-purple' 
                          : isAffordable 
                            ? isSelected
                              ? 'bg-neon-blue bg-opacity-20 border-2 border-neon-blue cursor-pointer'
                              : 'bg-card-bg border border-gray-600 hover:border-neon-blue cursor-pointer'
                            : 'bg-card-bg border border-gray-700 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold">{tile.name}</span>
                        {isOwned && <Building className="w-4 h-4 text-neon-purple" />}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Value:</span>
                          <span className="text-neon-blue">${parseInt(tile.purchase_price).toLocaleString()}</span>
                        </div>
                        
                        {isOwned ? (
                          <div className="text-xs text-neon-purple mt-1">
                            Owned by {getPlayerName(tile.owner_id)}
                          </div>
                        ) : (
                          <div className="text-xs text-green-400 mt-1">
                            Available to buy
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Action Confirmation */}
      {selectedTile && (
        <div className="mt-6 glass rounded-lg p-4 border border-neon-blue">
          <p className="text-gray-300 mb-4">
            Buy <span className="font-bold text-neon-blue">{selectedTile.name}</span> for ${parseInt(selectedTile.purchase_price).toLocaleString()}?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                onBuyTile(selectedTile.id)
                setSelectedTile(null)
              }}
              className="btn-primary px-6 py-2 rounded-lg font-semibold"
            >
              Confirm Purchase
            </button>
            <button
              onClick={() => setSelectedTile(null)}
              className="px-6 py-2 rounded-lg border border-gray-600 hover:border-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameBoard

