import { useState } from 'react'
import { MapPin, Building, X } from 'lucide-react'

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

      {/* Tile Purchase Modal */}
      {selectedTile && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTile(null)}>
          <div className="glass rounded-xl p-8 max-w-lg w-full border-2 border-neon-blue shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-3xl font-bold">Purchase Property</h3>
              <button
                onClick={() => setSelectedTile(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Property Details */}
            <div className="space-y-4 mb-6">
              <div className="bg-card-bg rounded-lg p-4 border border-neon-blue">
                <h4 className="text-xl font-bold text-neon-blue mb-2">{selectedTile.name}</h4>
                <p className="text-gray-400 text-sm mb-3">{selectedTile.district_name || 'District Property'}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Purchase Price:</span>
                    <span className="text-2xl font-bold text-neon-blue">
                      ${parseInt(selectedTile.purchase_price).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Your Capital:</span>
                    <span className={`text-lg font-semibold ${
                      parseFloat(currentPlayer?.capital || 0) >= parseFloat(selectedTile.purchase_price)
                        ? 'text-green-400'
                        : 'text-red-400'
                    }`}>
                      ${parseInt(currentPlayer?.capital || 0).toLocaleString()}
                    </span>
                  </div>

                  {parseFloat(currentPlayer?.capital || 0) >= parseFloat(selectedTile.purchase_price) && (
                    <div className="mt-4 p-3 bg-green-500 bg-opacity-10 border border-green-500 rounded-lg">
                      <p className="text-green-400 text-sm">✓ You can afford this property</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  if (parseFloat(currentPlayer?.capital || 0) >= parseFloat(selectedTile.purchase_price)) {
                    onBuyTile(selectedTile.id)
                    setSelectedTile(null)
                  }
                }}
                disabled={parseFloat(currentPlayer?.capital || 0) < parseFloat(selectedTile.purchase_price)}
                className="btn-primary flex-1 py-3 rounded-lg font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Purchase
              </button>
              <button
                onClick={() => setSelectedTile(null)}
                className="px-6 py-3 rounded-lg border border-gray-600 hover:border-gray-500 font-semibold"
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

