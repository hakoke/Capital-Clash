import { MapPin, Building } from 'lucide-react'

function GameBoard({ tiles, districts, players, currentPlayer, onBuyTile }) {

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

  // Arrange districts with tiles
  const arrangedDistricts = districts.map((district) => ({
    ...district,
    tiles: tiles.filter(t => t.district_id === district.id).sort((a, b) => a.order_in_district - b.order_in_district)
  }))

  return (
    <div className="glass rounded-xl p-6 card-glow">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-display font-bold">🎲 Neo-Arcadia Board</h2>
        <div className="flex items-center gap-2 text-neon-blue">
          <MapPin className="w-5 h-5" />
          <span className="text-sm">Click properties to purchase</span>
        </div>
      </div>

      {/* TRUE MONOPOLY BOARD - Properties around perimeter */}
      <div className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 rounded-2xl p-3 border-4 border-amber-800 shadow-2xl">
        
        {/* Properties arranged in a ring - Top Row */}
        <div className="grid grid-cols-11 gap-0.5 mb-0.5">
          {arrangedDistricts.slice(0, 3).flatMap((district, distIdx) => 
            district.tiles.map((tile, tileIdx) => (
              <PropertyTile 
                key={tile.id}
                tile={tile}
                district={district}
                isOwned={!!tile.owner_id}
                ownerColor={getOwnerColor(tile.owner_id)}
                ownerName={getPlayerName(tile.owner_id)}
                isAffordable={parseFloat(currentPlayer?.capital || 0) >= parseFloat(tile.purchase_price)}
                onBuyTile={onBuyTile}
                currentPlayer={currentPlayer}
              />
            ))
          )}
          <CornerTile text="START" />
        </div>

        {/* Properties arranged in a ring - Middle rows with center */}
        <div className="grid grid-cols-11 gap-0.5 mb-0.5">
          {/* Left side properties */}
          <div className="flex flex-col gap-0.5 col-span-2">
            {arrangedDistricts[3]?.tiles.slice().reverse().map((tile) => (
              <PropertyTile 
                key={tile.id}
                tile={tile}
                district={arrangedDistricts[3]}
                isOwned={!!tile.owner_id}
                ownerColor={getOwnerColor(tile.owner_id)}
                ownerName={getPlayerName(tile.owner_id)}
                isAffordable={parseFloat(currentPlayer?.capital || 0) >= parseFloat(tile.purchase_price)}
                onBuyTile={onBuyTile}
                currentPlayer={currentPlayer}
              />
            ))}
          </div>

          {/* Center area */}
          <div className="col-span-7 bg-gradient-to-br from-amber-200 to-amber-300 border-4 border-amber-600 rounded-lg flex flex-col items-center justify-center p-4 shadow-xl">
            <div className="text-center">
              <div className="text-4xl mb-2">🏙️</div>
              <h3 className="text-2xl font-bold text-amber-900">Neo-Arcadia</h3>
              <p className="text-amber-800 text-sm mt-1">Property Market</p>
              <div className="mt-3 text-xs text-amber-700 space-y-1">
                <div>{tiles.filter(t => t.owner_id).length} / {tiles.length} Owned</div>
                <div>{arrangedDistricts.length} Districts</div>
              </div>
            </div>
          </div>

          {/* Right side properties */}
          <div className="flex flex-col gap-0.5 col-span-2">
            {arrangedDistricts[4]?.tiles.map((tile) => (
              <PropertyTile 
                key={tile.id}
                tile={tile}
                district={arrangedDistricts[4]}
                isOwned={!!tile.owner_id}
                ownerColor={getOwnerColor(tile.owner_id)}
                ownerName={getPlayerName(tile.owner_id)}
                isAffordable={parseFloat(currentPlayer?.capital || 0) >= parseFloat(tile.purchase_price)}
                onBuyTile={onBuyTile}
                currentPlayer={currentPlayer}
              />
            ))}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-11 gap-0.5">
          <CornerTile text="GO" />
          {arrangedDistricts.slice(5).flatMap((district) => 
            district.tiles.map((tile) => (
              <PropertyTile 
                key={tile.id}
                tile={tile}
                district={district}
                isOwned={!!tile.owner_id}
                ownerColor={getOwnerColor(tile.owner_id)}
                ownerName={getPlayerName(tile.owner_id)}
                isAffordable={parseFloat(currentPlayer?.capital || 0) >= parseFloat(tile.purchase_price)}
                onBuyTile={onBuyTile}
                currentPlayer={currentPlayer}
              />
            ))
          )}
        </div>

      </div>

      {/* Legend */}
      <div className="mt-4 p-4 bg-card-bg rounded-lg border-2 border-gray-700">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-semibold">
          <div className="flex items-center gap-3">
            <div className="w-12 h-16 border-2 border-gray-500 rounded bg-card-bg"></div>
            <span className="text-gray-300">Click to buy</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-16 border-4 border-purple-400 rounded bg-gray-900"></div>
            <span className="text-gray-300">Owned</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-16 border-2 border-gray-700 rounded opacity-50"></div>
            <span className="text-gray-400">Too expensive</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Property Tile Component
function PropertyTile({ tile, district, isOwned, ownerColor, ownerName, isAffordable, onBuyTile, currentPlayer }) {
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
  
  return (
    <div
      onClick={() => {
        if (!isOwned && isAffordable) {
          if (window.confirm(`Buy ${tile.name} for $${parseInt(tile.purchase_price).toLocaleString()}?`)) {
            onBuyTile(tile.id)
          }
        }
      }}
      className={`relative ${tileColor} rounded border-2 min-h-[60px] p-1.5 ${
        isOwned 
          ? `border-4 ${ownerColor} opacity-90` 
          : isAffordable 
            ? 'border-gray-700 hover:border-neon-blue hover:shadow-xl cursor-pointer hover:scale-105 transition-all'
            : 'border-gray-800 opacity-50 cursor-not-allowed'
      }`}
      title={isOwned ? `Owned by ${ownerName}` : `${tile.name} - $${parseInt(tile.purchase_price).toLocaleString()}`}
    >
      <div className="text-white text-[10px] font-bold truncate">
        {tile.name.split(' - ')[1] || tile.name}
      </div>
      <div className="text-white text-[9px] font-bold">
        ${parseInt(tile.purchase_price).toLocaleString().slice(0, -3)}k
      </div>
      {isOwned && (
        <div className="absolute bottom-0.5 right-0.5">
          <Building className="w-3 h-3 text-purple-300" />
        </div>
      )}
    </div>
  )
}

// Corner Tile Component
function CornerTile({ text }) {
  return (
    <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded border-2 border-amber-900 min-h-[60px] flex items-center justify-center">
      <span className="text-xs font-bold text-white">{text}</span>
    </div>
  )
}

export default GameBoard
