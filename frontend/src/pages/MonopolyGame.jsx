import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import MonopolyBoard from '../components/MonopolyBoard'
import Notification from '../components/Notification'
import PlayerInfoPanel from '../components/PlayerInfoPanel'

function MonopolyGame() {
  const { gameId } = useParams()
  const [game, setGame] = useState(null)
  const [players, setPlayers] = useState([])
  const [properties, setProperties] = useState([])
  const [currentPlayer, setCurrentPlayer] = useState(null)
  const [currentTurnPlayer, setCurrentTurnPlayer] = useState(null)
  const [notification, setNotification] = useState(null)
  const [diceResult, setDiceResult] = useState(null)
  const [showDiceAnimation, setShowDiceAnimation] = useState(false)

  useEffect(() => {
    fetchGameData()
    const interval = setInterval(fetchGameData, 2000)
    return () => clearInterval(interval)
  }, [])

  const fetchGameData = async () => {
    try {
      const res = await axios.get(`/api/game/${gameId}`)
      setGame(res.data.game)
      setPlayers(res.data.players)
      setProperties(res.data.properties)
      
      // Get current player from localStorage
      const playerId = localStorage.getItem(`player_${gameId}`)
      if (playerId) {
        const player = res.data.players.find(p => p.id === playerId)
        if (player) {
          setCurrentPlayer(player)
        }
      } else if (res.data.players.length > 0) {
        setCurrentPlayer(res.data.players[0])
      }

      // Determine current turn
      if (res.data.game.current_player_turn) {
        const turnPlayer = res.data.players.find(p => p.order_in_game === res.data.game.current_player_turn)
        setCurrentTurnPlayer(turnPlayer)
      }
    } catch (error) {
      console.error('Error fetching game data:', error)
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleRollDice = async () => {
    try {
      // Show dice animation
      setShowDiceAnimation(true)
      setDiceResult({ die1: '?', die2: '?' })
      
      const res = await axios.post(`/api/game/${gameId}/roll`, {
        playerId: currentPlayer.id
      })
      
      if (res.data.success) {
        const { dice, newPosition, property, rentPaid } = res.data
        
        // Show actual dice results
        setDiceResult({ die1: dice.die1, die2: dice.die2 })
        
        // Display results
        let message = `🎲 Rolled ${dice.die1} + ${dice.die2} = ${dice.total}!`
        if (rentPaid) {
          message += ` Paid $${rentPaid} rent`
        }
        showNotification(message, 'success')
        
        setTimeout(() => {
          setShowDiceAnimation(false)
          setDiceResult(null)
          
          if (property && property.price > 0 && !property.owner_id && property.property_type === 'property') {
            // Offer to buy property
            setTimeout(() => {
              if (confirm(`You landed on ${property.name}!\n\nBuy for $${property.price}?`)) {
                handleBuyProperty(property.id)
              }
            }, 500)
          }
        }, 2000)
        
        fetchGameData()
      }
    } catch (error) {
      console.error('Error rolling dice:', error)
      setShowDiceAnimation(false)
      showNotification('Error rolling dice: ' + (error.response?.data?.error || error.message), 'error')
    }
  }

  const handleBuyProperty = async (propertyId) => {
    try {
      const res = await axios.post(`/api/player/${currentPlayer.id}/buy-property`, {
        propertyId
      })
      
      if (res.data.success) {
        showNotification('✓ Property purchased!', 'success')
        fetchGameData()
      }
    } catch (error) {
      console.error('Error buying property:', error)
      showNotification('Error: ' + (error.response?.data?.error || error.message), 'error')
    }
  }

  const handleEndTurn = async () => {
    try {
      const res = await axios.post(`/api/game/${gameId}/advance-turn`)
      showNotification('Turn ended', 'info')
      fetchGameData()
    } catch (error) {
      console.error('Error ending turn:', error)
      showNotification('Error ending turn', 'error')
    }
  }

  if (!game || !currentPlayer) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-xl">Loading game...</div></div>
  }

  const isMyTurn = currentTurnPlayer && currentPlayer && currentTurnPlayer.id === currentPlayer.id

  return (
    <div className="h-screen overflow-hidden bg-gray-100">
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Dice Animation Overlay */}
      {showDiceAnimation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 md:p-8 text-center max-w-md w-full">
            <div className="text-4xl md:text-6xl mb-4">🎲</div>
            <div className="flex items-center justify-center gap-3 md:gap-4 mb-4">
              {diceResult ? (
                <>
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-red-500 rounded-xl flex items-center justify-center text-2xl md:text-3xl font-bold text-white shadow-lg">
                    {diceResult.die1}
                  </div>
                  <div className="text-2xl md:text-3xl">+</div>
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-500 rounded-xl flex items-center justify-center text-2xl md:text-3xl font-bold text-white shadow-lg">
                    {diceResult.die2}
                  </div>
                  <div className="text-xl md:text-2xl">= {diceResult.die1 + diceResult.die2}</div>
                </>
              ) : (
                <div className="text-xl md:text-2xl">Rolling...</div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Main Game Layout - No padding to maximize space */}
      <div className="h-full">
        
        {/* Top Bar - Player Info */}
        <div className="flex items-center justify-between px-3 md:px-4 py-2 bg-white border-b shadow-sm">
          <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
            <h1 className="text-base md:text-xl font-bold">🎲</h1>
            <div className="hidden md:flex items-center gap-2 text-sm min-w-0">
              <span 
                className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                style={{ backgroundColor: currentPlayer.color }}
              >
                {currentPlayer.name.charAt(0).toUpperCase()}
              </span>
              <span className="font-semibold truncate">{currentPlayer.name}</span>
              <span className="text-gray-400">•</span>
              <span className="text-green-600 font-bold">${parseInt(currentPlayer.money || 0).toLocaleString()}</span>
            </div>
            <div className="md:hidden flex items-center gap-2">
              <span className="text-green-600 font-bold text-sm">${parseInt(currentPlayer.money || 0).toLocaleString()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm flex-shrink-0">
            <div className="hidden sm:inline">
              <span className="text-gray-500">Props: </span>
              <span className="font-bold text-blue-600">{properties.filter(p => p.owner_id === currentPlayer.id).length}</span>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div>
              <span className="text-gray-500">Pos: </span>
              <span className="font-bold">{currentPlayer.position}/39</span>
            </div>
          </div>
        </div>

        {/* Main Content - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 h-full overflow-hidden">
          
          {/* Left Sidebar - Player Info */}
          <div className="hidden md:block md:col-span-3 h-full overflow-y-auto">
            <div className="h-full p-2">
              <PlayerInfoPanel 
                gameId={gameId}
                currentPlayer={currentPlayer}
                allPlayers={players}
                properties={properties}
              />
            </div>
          </div>

          {/* Center - Game Board */}
          <div className="col-span-12 md:col-span-6 h-full overflow-hidden p-1 md:p-2">
            <div className="h-full">
              <MonopolyBoard
                properties={properties}
                players={players}
                currentPlayer={currentPlayer}
                currentTurnPlayer={currentTurnPlayer}
                onBuyProperty={handleBuyProperty}
                onRollDice={handleRollDice}
                onEndTurn={handleEndTurn}
              />
            </div>
          </div>

          {/* Right Sidebar - Game Actions */}
          <div className="hidden md:block md:col-span-3 h-full overflow-y-auto">
            <div className="h-full p-2">
              <div className="bg-white rounded-lg shadow-lg p-4 min-h-full">
                <h3 className="text-lg font-bold mb-4">🎮 Actions</h3>
                
                {isMyTurn && currentPlayer.can_roll && (
                  <button
                    onClick={handleRollDice}
                    className="w-full py-4 bg-green-500 text-white rounded-lg font-bold text-lg hover:bg-green-600 transition-all hover:scale-105 shadow-lg"
                  >
                    🎲 Roll Dice
                  </button>
                )}
                
                {isMyTurn && !currentPlayer.can_roll && (
                  <div className="space-y-3">
                    <button
                      onClick={handleEndTurn}
                      className="w-full py-4 bg-blue-500 text-white rounded-lg font-bold text-lg hover:bg-blue-600 transition-all"
                    >
                      ✅ End Turn
                    </button>
                  </div>
                )}

                {!isMyTurn && currentTurnPlayer && (
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-600 mb-2">Current Turn</div>
                    <div className="flex items-center justify-center gap-2">
                      <span 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: currentTurnPlayer.color }}
                      >
                        {currentTurnPlayer.name.charAt(0).toUpperCase()}
                      </span>
                      <span className="text-lg font-bold">{currentTurnPlayer.name}</span>
                    </div>
                  </div>
                )}

                <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="text-xs font-semibold text-yellow-800 mb-2">💡 How to Play</div>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>🎲 <b>Roll Dice</b> to move</li>
                    <li>💰 <b>Buy</b> unowned properties</li>
                    <li>🏠 <b>Pay rent</b> on owned spaces</li>
                    <li>🏁 <b>Collect $200</b> passing GO</li>
                    <li>🏘️ <b>Monopolies</b> earn double rent</li>
                  </ul>
                </div>

                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-xs font-semibold text-blue-800 mb-2">📊 Quick Stats</div>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div className="flex justify-between">
                      <span>Net Worth:</span>
                      <b>${(parseInt(currentPlayer.money || 0) + 
                        properties.filter(p => p.owner_id === currentPlayer.id)
                        .reduce((sum, p) => sum + (parseFloat(p.price) || 0), 0)).toLocaleString()}</b>
                    </div>
                    <div className="flex justify-between">
                      <span>Properties:</span>
                      <b>{properties.filter(p => p.owner_id === currentPlayer.id).length}</b>
                    </div>
                    <div className="flex justify-between">
                      <span>Position:</span>
                      <b>{currentPlayer.position}/39</b>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Action Bar */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4">
            {isMyTurn && currentPlayer.can_roll && (
              <button
                onClick={handleRollDice}
                className="w-full py-4 bg-green-500 text-white rounded-lg font-bold text-lg shadow-lg"
              >
                🎲 Roll Dice
              </button>
            )}
            {isMyTurn && !currentPlayer.can_roll && (
              <button
                onClick={handleEndTurn}
                className="w-full py-4 bg-blue-500 text-white rounded-lg font-bold text-lg"
              >
                ✅ End Turn
              </button>
            )}
            {!isMyTurn && (
              <div className="text-center py-2 text-gray-600">
                {currentTurnPlayer?.name}'s turn
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MonopolyGame

