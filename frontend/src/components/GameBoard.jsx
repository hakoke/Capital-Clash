import { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'

function GameBoard({ tiles, districts, players, currentPlayer, currentTurnPlayer, onBuyTile }) {
  const [confirmState, setConfirmState] = useState(null)

  const getDistrictColor = (districtType) => {
    const colors = {
      tech_park: 'bg-blue-600',
      downtown: 'bg-yellow-500',
      industrial: 'bg-gray-600',
      green_valley: 'bg-green-600',
      luxury_mile: 'bg-pink-500',
      harborfront: 'bg-teal-600'
    }
    return colors[districtType] || 'bg-purple-600'
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

  // Group tiles by district and organize for display
  const organizedDistricts = districts.map(district => ({
    ...district,
    tiles: tiles.filter(t => t.district_id === district.id).sort((a, b) => a.order_in_district - b.order_in_district)
  })).sort((a, b) => a.order_on_board - b.order_on_board)

  // Total tiles across all districts (12 districts * 3 tiles = 36)
  // Arrange in a perimeter similar to Monopoly
  // Top row, right column, bottom row (reversed), left column (reversed)
  
  // Simplify: Show all districts in a grid with their tiles grouped together
  const getDisplayName = (tile, district) => {
    // Remove "Plot X" from the name
    return district ? district.name.replace(' - Plot 1', '').replace(' - Plot 2', '').replace(' - Plot 3', '') : tile.name.split(' - ')[0]
  }

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
      
      <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 rounded-2xl p-6 border-4 border-amber-800 shadow-2xl relative">
        {/* Center Area - Logo and Game Info */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center z-0">
            <h1 className="text-6xl font-bold text-amber-800 mb-2">CAPITAL CLASH</h1>
            <p className="text-xl text-amber-700 font-semibold">Rise of the CEOs</p>
            {currentTurnPlayer && (
              <div className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg text-lg font-bold">
                {currentTurnPlayer.id === currentPlayer.id ? 'Your Turn' : `${currentTurnPlayer.name}'s Turn`}
              </div>
            )}
          </div>
        </div>

        {/* Board Perimeter - Properties arranged in Monopoly style */}
        <div className="grid grid-cols-6 gap-3 relative z-10">
          {organizedDistricts.slice(0, 12).map((district, idx) => 
            district.tiles.map((tile, tileIdx) => (
              <PropertyTile
                key={`${district.id}-${tile.id}`}
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
                displayName={getDisplayName(tile, district)}
              />
            ))
          )}
        </div>
      </div>
    </>
  )
}

// Property Tile Component - Enhanced for Monopoly Style
function PropertyTile({ tile, district, isOwned, ownerColor, ownerName, ownerInitial, ownerAvatarColor, isAffordable, onBuyTile, currentPlayer, onConfirm, displayName }) {
  const getColor = (districtType) => {
    const colors = {
      tech_park: 'bg-blue-600',
      downtown: 'bg-yellow-500',
      industrial: 'bg-gray-600',
      green_valley: 'bg-green-600',
      luxury_mile: 'bg-pink-500',
      harborfront: 'bg-teal-600'
    }
    return colors[districtType] || 'bg-purple-600'
  }
  
  const tileColor = district ? getColor(district.type) : 'bg-gray-600'
  const isMyTurn = currentPlayer && tile.owner_id !== currentPlayer.id
  const isCurrentPlayerTile = currentPlayer && tile.owner_id === currentPlayer.id
  
  return (
    <div
      onClick={() => {
        if (!isOwned && isAffordable && currentPlayer) {
          onConfirm(tile.id, `Buy ${displayName} for $${parseInt(tile.purchase_price).toLocaleString()}?`)
        }
      }}
      className={`relative h-20 rounded-lg border-3 flex flex-col justify-between p-2 ${
        isOwned 
          ? `border-4 ${ownerColor} opacity-95 cursor-pointer hover:shadow-xl` 
          : isAffordable && currentPlayer
            ? 'border-gray-700 hover:border-green-500 hover:shadow-xl cursor-pointer transform hover:scale-105 transition-all'
            : 'border-gray-800 opacity-50 cursor-not-allowed'
      } ${tileColor} text-white`}
      title={isOwned ? `Owned by ${ownerName}` : `${displayName} - $${parseInt(tile.purchase_price).toLocaleString()}`}
    >
      {/* District Color Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${tileColor}`}></div>
      
      {/* Property Name */}
      <div className="text-white text-[10px] font-bold text-center leading-tight mt-1">
        {displayName}
      </div>
      
      {/* Price or Owner Info */}
      {isOwned ? (
        <div className="flex items-center justify-center gap-1 mt-1">
          <div className={`${ownerAvatarColor} text-white w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold`}>
            {ownerInitial}
          </div>
          {isCurrentPlayerTile && (
            <span className="text-[8px] text-yellow-300">MINE</span>
          )}
        </div>
      ) : (
        <div className="text-white text-[9px] font-bold text-center">
          ${parseInt(tile.purchase_price).toLocaleString().slice(0, -3)}k
        </div>
      )}
    </div>
  )
}

export default GameBoard
