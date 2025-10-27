import { useState } from 'react'
import { MapPin, Building, X } from 'lucide-react'

function GameBoard({ tiles, districts, players, currentPlayer, onBuyTile }) {
  const [selectedTile, setSelectedTile] = useState(null)

  const getDistrictColor = (districtType) => {
    const colors = {
      tech_park: 'bg-blue-500',
      downtown: 'bg-yellow-500',
      industrial: 'bg-gray-500',
      green_valley: 'bg-green-500',
      luxury_mile: 'bg-pink-500',
      harborfront: 'bg-teal-500'
    }
    return colors[districtType] || 'bg-purple-500'
  }

  const getPlayerName = (ownerId) => {
    return players.find(p => p.id === ownerId)?.name || ''
  }

  const getOwnerColor = (ownerId) => {
    const player = players.find(p => p.id === ownerId)
    if (!player) return 'border-gray-600'
    const colors = ['border-blue-500', 'border-green-500', 'border-yellow-500', 'border-pink-500', 'border-cyan-500', 'border-purple-500']
    return colors[player.order_in_game % colors.length] || 'border-gray-600'
  }

  // Arrange districts
  const arrangedDistricts = districts.map((district) => ({
    ...district,
    tiles: tiles.filter(t => t.district_id === district.id).sort((a, b) => a.order_in_district - b.order_in_district)
  }))

  return (
    <div className="glass rounded-xl p-6 card-glow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-display font-bold">🏙️ Neo-Arcadia Board</h2>
        <div className="flex items-center gap-2 text-neon-blue">
          <MapPin className="w-5 h-5" />
          <span className="text-sm">Click properties to purchase</span>
        </div>
      </div>

      {/* Simplified Scrollable Board - NO CROWDING */}
      <div className="max-h-[600px] overflow-y-auto bg-gradient-to-br from-gray-900 to-black rounded-xl p-4 border-2 border-gray-700 custom-scrollbar">
        <div className="space-y-4">
          {arrangedDistricts.map((district) => (
            <div key={district.id} className="space-y-2">
              {/* District Header - LARGE and CLEAR */}
              <div className={`${getDistrictColor(district.type)} rounded-lg p-3 text-center shadow-lg`}>
                <h3 className="text-lg font-bold text-white">{district.name}</h3>
                <p className="text-xs text-white opacity-90">{district.type.replace('_', ' ').toUpperCase()}</p>
              </div>

              {/* Properties - LARGE CARDS, EASY TO CLICK */}
              <div className="grid grid-cols-3 gap-3">
                {district.tiles.map((tile) => {
                  const isOwned = !!tile.owner_id
                  const isAffordable = parseFloat(currentPlayer?.capital || 0) >= parseFloat(tile.purchase_price)
                  
                  return (
                    <div
                      key={tile.id}
                      onClick={() => {
                        if (!isOwned && isAffordable) {
                          setSelectedTile({ ...tile, district_name: district.name })
                        }
                      }}
                      className={`relative rounded-lg border-2 transition-all min-h-[120px] p-4 ${
                        isOwned 
                          ? `${getOwnerColor(tile.owner_id)} border-4 bg-gray-900 opacity-95` 
                          : isAffordable 
                            ? 'border-gray-600 hover:border-neon-blue hover:shadow-2xl cursor-pointer bg-card-bg hover:bg-opacity-90'
                            : 'border-gray-700 opacity-50 cursor-not-allowed bg-gray-800'
                      } ${!isOwned && isAffordable ? 'hover:scale-105' : ''} group`}
                      title={isOwned ? `Owned by ${getPlayerName(tile.owner_id)}` : `${tile.name} - Click to buy`}
                    >
                      <div className="space-y-2">
                        <p className="font-bold text-white text-base leading-tight">
                          {tile.name.split(' - ')[1] || tile.name}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xl font-bold text-neon-blue">
                            ${parseInt(tile.purchase_price).toLocaleString()}
                          </p>
                          {isOwned && (
                            <div className="bg-purple-500 rounded-full p-2">
                              <Building className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                        {isOwned && (
                          <p className="text-xs text-gray-400 mt-1">
                            Owned by {getPlayerName(tile.owner_id)}
                          </p>
                        )}
                        {!isOwned && isAffordable && (
                          <p className="text-xs text-green-400 font-semibold">
                            ✓ Available
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend - CLEAR and OBVIOUS */}
      <div className="mt-4 p-4 bg-card-bg rounded-lg border-2 border-gray-700">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold">
          <div className="flex items-center gap-3">
            <div className="w-8 h-16 border-2 border-gray-500 rounded-lg bg-card-bg hover:shadow-lg"></div>
            <span className="text-gray-300">Click to buy</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-16 border-4 border-purple-500 rounded-lg bg-gray-900"></div>
            <span className="text-gray-300">Owned (colored border)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-16 border-2 border-gray-700 rounded-lg opacity-50 bg-gray-800"></div>
            <span className="text-gray-400">Too expensive</span>
          </div>
        </div>
      </div>

      {/* Purchase Modal - CENTERED and PERFECT */}
      {selectedTile && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTile(null)}>
          <div className="glass rounded-xl p-8 max-w-lg w-full border-2 border-neon-blue shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl font-bold">Purchase Property</h3>
              <button onClick={() => setSelectedTile(null)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-card-bg rounded-lg p-6 border-2 border-neon-blue">
                <h4 className="text-2xl font-bold text-neon-blue mb-2">{selectedTile.name}</h4>
                <p className="text-gray-400 text-sm mb-4">{selectedTile.district_name || 'District Property'}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-300 font-semibold">Purchase Price:</span>
                    <span className="text-3xl font-bold text-neon-blue">
                      ${parseInt(selectedTile.purchase_price).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                    <span className="text-gray-300 font-semibold">Your Capital:</span>
                    <span className={`text-2xl font-bold ${
                      parseFloat(currentPlayer?.capital || 0) >= parseFloat(selectedTile.purchase_price)
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}>
                      ${parseInt(currentPlayer?.capital || 0).toLocaleString()}
                    </span>
                  </div>

                  {parseFloat(currentPlayer?.capital || 0) >= parseFloat(selectedTile.purchase_price) && (
                    <div className="mt-4 p-4 bg-green-500 bg-opacity-10 border-2 border-green-500 rounded-lg">
                      <p className="text-green-400 font-semibold text-center">✓ You can afford this property!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (parseFloat(currentPlayer?.capital || 0) >= parseFloat(selectedTile.purchase_price)) {
                    onBuyTile(selectedTile.id)
                    setSelectedTile(null)
                  }
                }}
                disabled={parseFloat(currentPlayer?.capital || 0) < parseFloat(selectedTile.purchase_price)}
                className="btn-primary flex-1 py-4 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
              >
                💰 Confirm Purchase
              </button>
              <button
                onClick={() => setSelectedTile(null)}
                className="px-8 py-4 rounded-lg border-2 border-gray-600 hover:border-gray-500 font-bold transition-all hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GameBoard
