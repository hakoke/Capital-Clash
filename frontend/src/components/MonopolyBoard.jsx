import { useState } from 'react'
import { COLOR_GROUPS } from '../utils/monopolyConstants.js'

function MonopolyBoard({ properties, players, currentPlayer, currentTurnPlayer, onBuyProperty, onRollDice, onEndTurn, purchaseProperty, isPreview = false }) {
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [diceRoll, setDiceRoll] = useState(null)
  const [showDiceAnimation, setShowDiceAnimation] = useState(false)
  const isMyTurn = currentTurnPlayer && currentPlayer && currentTurnPlayer.id === currentPlayer.id

  // Organize properties by position (0-39)
  const boardProperties = properties.sort((a, b) => a.position - b.position)

  // Get player info by ID
  const getPlayer = (playerId) => {
    return players.find(p => p.id === playerId)
  }

  // Get property color
  const getPropertyColor = (property) => {
    if (!property.color_group) return '#E5E7EB'
    return COLOR_GROUPS[property.color_group] || '#E5E7EB'
  }

  // Render a property space
  const renderProperty = (property, index) => {
    const isOwned = !!property.owner_id
    const owner = isOwned ? getPlayer(property.owner_id) : null
    const isMyProperty = owner && currentPlayer && owner.id === currentPlayer.id
    
    // Check if current player is at this position
    const playersHere = players.filter(p => p.position === property.position)
    
    const isCorner = property.position === 0 || property.position === 10 || 
                     property.position === 20 || property.position === 30
    
    // Get property color bar
    const propertyColor = property.color_group ? getPropertyColor(property) : '#E5E7EB'
    
    // Shorten property name for display
    const getDisplayName = (name) => {
      if (name.length > 12) {
        return name.substring(0, 10) + '...'
      }
      return name
    }
    
    return (
      <div
        key={property.id || index}
        onClick={() => {
          setSelectedProperty(property)
        }}
        className={`
          ${isCorner ? 'w-14 h-14 md:w-16 md:h-16' : 'w-8 h-10 md:w-10 md:h-12'}
          relative border-2
          cursor-pointer
          transition-all duration-300
          bg-white
          ${isOwned ? 'shadow-lg' : 'shadow'}
          hover:shadow-xl
          hover:scale-105
          rounded
        `}
        style={{
          backgroundColor: isOwned ? (isMyProperty ? '#2a0f3f' : '#1a0033') : '#3a1552',
          borderColor: isOwned && owner ? owner.color : property.property_type === 'property' ? propertyColor : '#374151',
          borderWidth: isOwned ? '3px' : '2px'
        }}
        title={property.name + (property.price > 0 ? ` - $${property.price}` : '')}
      >
        {/* Property Color Bar */}
        {property.color_group && property.property_type === 'property' && (
          <div 
            className="h-2 w-full absolute top-0 left-0"
            style={{ backgroundColor: propertyColor }}
          />
        )}

        {/* Property Name */}
        <div className="px-0.5 pt-2 md:pt-3 text-center leading-tight">
          <div className={`font-bold text-white ${property.name.length > 12 ? 'text-[6px] md:text-[7px]' : 'text-[7px] md:text-[8px]'}`}>
            {getDisplayName(property.name)}
          </div>
          
          {/* Price */}
          {property.price > 0 && (
            <div className="text-[6px] md:text-[7px] font-semibold mt-0.5 text-purple-300">
              ${property.price}
            </div>
          )}

          {/* Special Space Labels */}
          {!property.price && (
            <div className="text-[6px] md:text-[7px] font-bold mt-0.5 text-purple-300">
              {property.property_type?.replace('_', ' ').substring(0, 8).toUpperCase()}
            </div>
          )}
        </div>

        {/* Owner Badge */}
        {isOwned && owner && (
          <div className="absolute bottom-0.5 md:bottom-1 left-1/2 transform -translate-x-1/2">
            <div 
              className="w-3 h-3 md:w-4 md:h-4 rounded-full flex items-center justify-center text-white text-[6px] md:text-[8px] font-bold shadow-md border border-white"
              style={{ backgroundColor: owner.color }}
              title={`Owned by ${owner.name}`}
            >
              {owner.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        {/* Houses/Hotels Indicator */}
        {isOwned && property.houses > 0 && (
          <div className="absolute top-0.5 md:top-1 right-0.5 md:right-1 flex gap-0.5">
            {Array.from({ length: Math.min(property.houses, 4) }).map((_, i) => (
              <div key={i} className="w-1 h-1 bg-green-600 rounded-full" />
            ))}
            {property.hotels > 0 && (
              <div className="w-1 h-1 bg-red-600 rounded-full" />
            )}
          </div>
        )}

        {/* Player Pieces */}
        {playersHere.length > 0 && (
          <div className="absolute -bottom-1.5 md:-bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-0.5">
            {playersHere.slice(0, 2).map((p) => (
              <div
                key={p.id}
                className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: p.color }}
                title={p.name}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  // Arrange properties for display  
  // Standard Monopoly board: position 0 = GO (bottom right corner)
  // Start walking clockwise: 1-9 are bottom row, 10 is bottom right corner, 11-19 are right side, etc.
  
  // Get properties by position to ensure correct order
  const getPropertyAtPosition = (pos) => boardProperties.find(p => p.position === pos)
  
  // Bottom row left to right: positions 1-9 (skip 0 for now)
  const bottomRow = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(p => getPropertyAtPosition(p)).filter(Boolean)
  
  // Right side bottom to top: positions 11-19
  const rightColumn = [11, 12, 13, 14, 15, 16, 17, 18, 19].map(p => getPropertyAtPosition(p)).filter(Boolean)
  
  // Top row right to left: positions 31-39  
  const topRow = [31, 32, 33, 34, 35, 36, 37, 38, 39].map(p => getPropertyAtPosition(p)).filter(Boolean).reverse()
  
  // Left side top to bottom: positions 21-29
  const leftColumn = [21, 22, 23, 24, 25, 26, 27, 28, 29].map(p => getPropertyAtPosition(p)).filter(Boolean).reverse()
  
  // Corners
  const goCorner = getPropertyAtPosition(0)
  const jailCorner = getPropertyAtPosition(10)
  const parkingCorner = getPropertyAtPosition(20)
  const goToJailCorner = getPropertyAtPosition(30)

  return (
    <>
      {selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl transform transition-all">
            <div className="flex items-start gap-4 mb-4">
              {selectedProperty.color_group && (
                <div 
                  className="w-16 h-20 rounded-t-lg flex-shrink-0"
                  style={{ 
                    background: selectedProperty.color_group === 'brown' ? '#8B4513' :
                               selectedProperty.color_group === 'light_blue' ? 'linear-gradient(to bottom, #87CEEB, #E0F7FF)' :
                               selectedProperty.color_group === 'pink' ? '#FF69B4' :
                               selectedProperty.color_group === 'orange' ? '#FFA500' :
                               selectedProperty.color_group === 'red' ? '#DC143C' :
                               selectedProperty.color_group === 'yellow' ? '#FFD700' :
                               selectedProperty.color_group === 'green' ? '#228B22' :
                               selectedProperty.color_group === 'blue' ? '#191970' :
                               '#E5E7EB'
                  }}
                />
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2 text-gray-800">{selectedProperty.name}</h3>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  selectedProperty.owner_id ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {selectedProperty.owner_id ? 'Owned' : 'Available'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Purchase Price</div>
                <div className="text-2xl font-bold text-green-600">${selectedProperty.price}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Base Rent</div>
                <div className="text-2xl font-bold text-red-600">${selectedProperty.rent || 0}</div>
              </div>
            </div>

            {selectedProperty.rent_with_set > selectedProperty.rent && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs font-semibold text-blue-800 mb-1">With Full Color Set</div>
                <div className="text-lg font-bold text-blue-600">${selectedProperty.rent_with_set}</div>
              </div>
            )}

            <div className="flex gap-3">
              {!selectedProperty.owner_id && selectedProperty.price > 0 && (
                <button
                  onClick={() => {
                    onBuyProperty(selectedProperty.id)
                    setSelectedProperty(null)
                  }}
                  className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-bold text-lg hover:bg-green-600 transition-all hover:scale-105 shadow-lg"
                >
                  💰 Buy for ${selectedProperty.price}
                </button>
              )}
              <button
                onClick={() => setSelectedProperty(null)}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative bg-[#1a0033] rounded-lg border-2 border-purple-700 shadow-xl p-1 md:p-2 h-full overflow-hidden">
        
        {/* Top Row: Position 31-39 (right to left) - Park Place thru Chance */}
        <div className="flex mb-0.5 md:mb-1 justify-center flex-wrap">
          {topRow.map((prop, idx) => prop && renderProperty(prop, idx))}
        </div>

        {/* Middle Section - Responsive height */}
        <div className="flex gap-1 md:gap-2 flex-1 min-h-0">
          
          {/* Left Column: Position 21-29 (bottom to top) */}
          <div className="flex flex-col-reverse">
            {leftColumn.map((prop, idx) => prop && renderProperty(prop, idx))}
          </div>

          {/* Center Board - Dark purple theme like richup.io */}
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 rounded-lg border-2 border-purple-600 shadow-inner min-w-0 p-2 md:p-4 relative">
            <div className="text-center w-full">
              {/* Dice Display */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-3xl font-bold shadow-lg border-2 border-gray-300">
                  3
                </div>
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-3xl font-bold shadow-lg border-2 border-gray-300">
                  3
                </div>
              </div>
              
              {/* Roll Button */}
              <button
                onClick={onRollDice}
                disabled={!isMyTurn || !currentPlayer?.can_roll}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-colors shadow-lg mb-3"
              >
                Roll the dice
              </button>
              
              {/* End Turn Button */}
              {!currentPlayer?.can_roll && isMyTurn && (
                <button
                  onClick={onEndTurn}
                  className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-lg transition-colors mb-3"
                >
                  End turn
                </button>
              )}
              
              {/* Property Preview */}
              {purchaseProperty && (
                <div className="mt-4">
                  <button
                    onClick={() => onBuyProperty(purchaseProperty.id)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg flex items-center gap-2 mx-auto"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Buy for ${purchaseProperty.price}
                  </button>
                </div>
              )}
              
              {/* Player Turn Indicator */}
              {currentTurnPlayer && (
                <div className="mt-4 flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <span 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: currentTurnPlayer.color }}
                  >
                    {currentTurnPlayer.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="font-bold text-white">{currentTurnPlayer.name}'s Turn</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Position 11-19 (bottom to top) */}
          <div className="flex flex-col">
            {rightColumn.map((prop, idx) => prop && renderProperty(prop, idx))}
          </div>
        </div>

        {/* Bottom Row: Position 1-9 (left to right) - Mediterranean thru Connecticut */}
        <div className="flex mt-0.5 md:mt-1 justify-center flex-wrap">
          {bottomRow.map((prop, idx) => prop && renderProperty(prop, idx))}
        </div>
      </div>
    </>
  )
}

export default MonopolyBoard

