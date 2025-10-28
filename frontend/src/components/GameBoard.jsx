import { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'
import { Building2, Factory, ShoppingBag, Leaf, Sparkles, Anchor } from 'lucide-react'

function GameBoard({ tiles, districts, players, currentPlayer, currentTurnPlayer, onBuyTile, onEndTurn }) {
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

  const getDistrictIcon = (districtType) => {
    const icons = {
      tech_park: <Sparkles className="w-4 h-4" />,
      downtown: <Building2 className="w-4 h-4" />,
      industrial: <Factory className="w-4 h-4" />,
      green_valley: <Leaf className="w-4 h-4" />,
      luxury_mile: <ShoppingBag className="w-4 h-4" />,
      harborfront: <Anchor className="w-4 h-4" />
    }
    return icons[districtType] || <Building2 className="w-4 h-4" />
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

  // Organize tiles by district
  const organizedDistricts = districts.map(district => ({
    ...district,
    tiles: tiles.filter(t => t.district_id === district.id).sort((a, b) => a.order_in_district - b.order_in_district)
  })).sort((a, b) => a.order_on_board - b.order_on_board)

  // Create perimeter tiles: flatten all tiles
  let perimeterTiles = []
  organizedDistricts.forEach((district) => {
    district.tiles.forEach((tile) => {
      perimeterTiles.push({ tile, district })
    })
  })

  // We have 36 tiles total (12 districts * 3 tiles)
  // Arrange: 10 top, 9 right, 10 bottom, 9 left
  const topTiles = perimeterTiles.slice(0, 10)
  const rightTiles = perimeterTiles.slice(10, 19)
  const bottomTiles = perimeterTiles.slice(19, 29)
  const leftTiles = perimeterTiles.slice(29, 36).reverse()

  const getDisplayName = (tile, district) => {
    return district ? district.name : tile.name.split(' - ')[0]
  }

  const isMyTurn = currentTurnPlayer && currentPlayer && currentTurnPlayer.id === currentPlayer.id

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
      
      <div className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 rounded-xl border-4 border-amber-800 shadow-2xl p-4">
        
        {/* BOARD LAYOUT */}
        <div className="relative">
          
          {/* TOP ROW */}
          <div className="flex justify-center gap-1 mb-1">
            {topTiles.map(({ tile, district }) => (
              <PropertyTile
                key={`top-${tile.id}`}
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
                tileColor={getDistrictColor(district.type)}
                icon={getDistrictIcon(district.type)}
                orientation="horizontal"
              />
            ))}
          </div>

          {/* MIDDLE SECTION */}
          <div className="flex justify-between gap-1">
            
            {/* LEFT SIDE */}
            <div className="flex flex-col gap-1">
              {leftTiles.map(({ tile, district }) => (
                <PropertyTile
                  key={`left-${tile.id}`}
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
                  tileColor={getDistrictColor(district.type)}
                  icon={getDistrictIcon(district.type)}
                  orientation="vertical"
                />
              ))}
            </div>

            {/* CENTER AREA */}
            <div className="flex-1 mx-2 flex items-center justify-center bg-gradient-to-br from-yellow-100 to-amber-50 rounded-xl border-2 border-amber-700 shadow-inner">
              <div className="text-center p-3">
                <h1 className="text-3xl font-bold text-amber-800 mb-1">CAPITAL CLASH</h1>
                <p className="text-base text-amber-700 font-semibold mb-3">Rise of the CEOs</p>
                {isMyTurn && (
                  <button
                    onClick={onEndTurn}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg font-bold text-base hover:bg-green-600 transition-all hover:scale-105 shadow-lg animate-pulse"
                  >
                    ⏭️ End Turn
                  </button>
                )}
                {!isMyTurn && currentTurnPlayer && (
                  <div className="px-6 py-3 bg-gray-500 text-white rounded-lg font-bold text-base">
                    {currentTurnPlayer.name}'s Turn
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex flex-col gap-1">
              {rightTiles.map(({ tile, district }) => (
                <PropertyTile
                  key={`right-${tile.id}`}
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
                  tileColor={getDistrictColor(district.type)}
                  icon={getDistrictIcon(district.type)}
                  orientation="vertical"
                />
              ))}
            </div>
          </div>

          {/* BOTTOM ROW */}
          <div className="flex justify-center gap-1 mt-1">
            {bottomTiles.reverse().map(({ tile, district }) => (
              <PropertyTile
                key={`bottom-${tile.id}`}
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
                tileColor={getDistrictColor(district.type)}
                icon={getDistrictIcon(district.type)}
                orientation="horizontal"
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

// Property Tile Component
function PropertyTile({ 
  tile, district, isOwned, ownerColor, ownerName, ownerInitial, ownerAvatarColor, 
  isAffordable, onBuyTile, currentPlayer, onConfirm, displayName, tileColor, icon, orientation 
}) {
  const isCurrentPlayerTile = currentPlayer && tile.owner_id === currentPlayer.id
  
  return (
    <div
      onClick={() => {
        if (!isOwned && isAffordable && currentPlayer) {
          onConfirm(tile.id, `Buy ${displayName} for $${parseInt(tile.purchase_price).toLocaleString()}?`)
        }
      }}
      className={`relative ${
        orientation === 'vertical' ? 'w-14 h-16' : 'h-14 w-16'
      } rounded border-3 flex flex-col items-center justify-between p-1 ${
        isOwned 
          ? `border-4 ${ownerColor} opacity-95 cursor-pointer hover:shadow-xl` 
          : isAffordable && currentPlayer
            ? 'border-gray-700 hover:border-green-500 hover:shadow-xl cursor-pointer transform hover:scale-105 transition-all'
            : 'border-gray-800 opacity-50 cursor-not-allowed'
      } ${tileColor} text-white`}
      title={isOwned ? `Owned by ${ownerName}` : `${displayName} - $${parseInt(tile.purchase_price).toLocaleString()}`}
    >
      {/* District Icon */}
      <div className="absolute top-0.5 left-0.5 opacity-75">
        {icon}
      </div>
      
      {/* Property Name */}
      <div className={`text-white font-bold text-center leading-tight mt-2 px-0.5 ${
        orientation === 'vertical' ? 'text-[7px]' : 'text-[7px]'
      }`}>
        {displayName}
      </div>
      
      {/* Price or Owner Info */}
      {isOwned ? (
        <div className="flex flex-col items-center gap-0.5 mt-auto mb-1">
          <div className={`${ownerAvatarColor} text-white w-3.5 h-3.5 rounded-full flex items-center justify-center text-[6px] font-bold`}>
            {ownerInitial}
          </div>
          {isCurrentPlayerTile && (
            <span className="text-[6px] text-yellow-300 font-bold">MINE</span>
          )}
        </div>
      ) : (
        <div className="text-white text-[7px] font-bold text-center mt-auto mb-0.5">
          ${parseInt(tile.purchase_price).toLocaleString().slice(0, -3)}k
        </div>
      )}
    </div>
  )
}

export default GameBoard
