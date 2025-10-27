import { useState } from 'react'
import { MapPin, Building } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'

function GameBoard({ tiles, districts, players, currentPlayer, onBuyTile }) {
  const [confirmState, setConfirmState] = useState(null)

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
    const colors = ['border-blue-400', 'border-green-400', 'border-yellow-400', 'border-pink-400', 'border-cyan-400', 'border-purple-400']
    return colors[player.order_in_game % colors.length] || 'border-gray-600'
  }

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?'
  }

  const getAvatarColor = (ownerId) => {
    const player = players.find(p => p.id === ownerId)
    if (!player) return 'bg-gray-600'
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-pink-500', 'bg-cyan-500', 'bg-purple-500']
    return colors[player.order_in_game % colors.length] || 'bg-gray-600'
  }

  // Arrange districts with tiles
  const arrangedDistricts = districts.map((district) => ({
    ...district,
    tiles: tiles.filter(t => t.district_id === district.id).sort((a, b) => a.order_in_district - b.order_in_district)
  }))

  return (
    <>
      {confirmState && (
        <ConfirmDialog
          message={confirmState.message}
          onConfirm={() => {
            onBuyTile(confirmState.tileId)
            setConfirmState(null)
          }}
          onCancel={() => setConfirmState(null)}
        />
      )}
      
      <div className="glass rounded-xl p-6 card-glow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-display font-bold">🏙️ Capital Clash Board</h2>
          <div className="flex items-center gap-2 text-neon-blue">
            <MapPin className="w-4 h-4" />
            <span className="text-xs">Click properties to buy</span>
          </div>
        </div>

      {/* MONOPOLY-STYLE BOARD - Perimeter Layout */}
      <div className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 rounded-xl p-4 border-4 border-amber-800 shadow-2xl">
        
        {/* Board Perimeter - All Properties Visible */}
        <div className="grid grid-cols-6 gap-3">
          {arrangedDistricts.slice(0, 6).map((district, districtIdx) =>
            district.tiles.slice(0, 4).map((tile, tileIdx) => (
              <PropertyTile
                key={tile.id}
                tile={tile}
                district={district}
                isOwned={!!tile.owner_id}
                ownerColor={getOwnerColor(tile.owner_id)}
                ownerName={getPlayerName(tile.owner_id)}
                ownerInitial={getInitial(getPlayerName(tile.owner_id))}
                ownerAvatarColor={getAvatarColor(tile.owner_id)}
                isAffordable={parseFloat(currentPlayer?.capital || 0) >= parseFloat(tile.purchase_price)}
                onBuyTile={onBuyTile}
                currentPlayer={currentPlayer}
                onConfirm={(tileId, message) => setConfirmState({ tileId, message })}
              />
            ))
          )}
        </div>

      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold p-3 bg-card-bg rounded-lg border border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-6 h-8 border-2 border-gray-500 rounded bg-card-bg"></div>
          <span className="text-gray-300">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-8 border-4 border-purple-400 rounded bg-gray-900"></div>
          <span className="text-gray-300">Owned</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span className="text-gray-300">Owner Avatar</span>
        </div>
      </div>
    </div>
    </>
  )
}

// Property Tile Component
function PropertyTile({ tile, district, isOwned, ownerColor, ownerName, ownerInitial, ownerAvatarColor, isAffordable, onBuyTile, currentPlayer, onConfirm }) {
  const getColor = (districtType) => {
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
  
  const tileColor = district ? getColor(district.type) : 'bg-gray-600'
  
  // Remove "Plot X" from the name
  const displayName = district ? district.name : tile.name.split(' - ')[0]
  
  return (
    <div
      onClick={() => {
        if (!isOwned && isAffordable) {
          onConfirm(tile.id, `Buy ${displayName} for $${parseInt(tile.purchase_price).toLocaleString()}?`)
        }
      }}
      className={`relative ${tileColor} rounded border-2 h-20 flex flex-col justify-between p-2 ${
        isOwned 
          ? `border-4 ${ownerColor} opacity-90` 
          : isAffordable 
            ? 'border-gray-700 hover:border-neon-blue hover:shadow-xl cursor-pointer hover:scale-105 transition-all'
            : 'border-gray-800 opacity-50 cursor-not-allowed'
      }`}
      title={isOwned ? `Owned by ${ownerName}` : `${displayName} - $${parseInt(tile.purchase_price).toLocaleString()}`}
    >
      <div className="text-white text-[10px] font-bold text-center px-1 leading-tight">
        {displayName}
      </div>
      <div className="text-white text-[8px] font-bold text-center mt-0.5">
        ${parseInt(tile.purchase_price).toLocaleString().slice(0, -3)}k
      </div>
      {isOwned && (
        <div className="absolute bottom-0.5 right-0.5 flex items-center gap-1">
          <div className={`${ownerAvatarColor} text-white w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold`}>
            {ownerInitial}
          </div>
          <Building className="w-3 h-3 text-purple-300" />
        </div>
      )}
    </div>
  )
}

// Corner Tile Component (not used anymore)
function CornerTile({ text }) {
  return null
}

export default GameBoard
