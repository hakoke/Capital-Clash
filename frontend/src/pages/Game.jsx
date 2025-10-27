import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import GameBoard from '../components/GameBoard'
import PlayerPanel from '../components/PlayerPanel'
import NewsPanel from '../components/NewsPanel'
import ActionPanel from '../components/ActionPanel'
import ChatPanel from '../components/ChatPanel'
import Notification from '../components/Notification'

function Game() {
  const { gameId } = useParams()
  const [game, setGame] = useState(null)
  const [players, setPlayers] = useState([])
  const [tiles, setTiles] = useState([])
  const [districts, setDistricts] = useState([])
  const [currentPlayer, setCurrentPlayer] = useState(null)
  const [news, setNews] = useState([])
  const [currentTurnPlayer, setCurrentTurnPlayer] = useState(null)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    fetchGameData()
    const interval = setInterval(fetchGameData, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchGameData = async () => {
    try {
      const res = await axios.get(`/api/game/${gameId}`)
      setGame(res.data.game)
      setPlayers(res.data.players)
      setTiles(res.data.tiles)
      setDistricts(res.data.districts)
      
      // Get current player from localStorage
      const playerId = localStorage.getItem(`player_${gameId}`)
      if (playerId) {
        const player = res.data.players.find(p => p.id === playerId)
        if (player) {
          setCurrentPlayer(player)
        }
      } else if (res.data.players.length > 0) {
        // Fallback to first player if no localStorage
        setCurrentPlayer(res.data.players[0])
      }

      // Determine current turn
      if (res.data.game.current_player_turn) {
        const turnPlayer = res.data.players.find(p => p.order_in_game === res.data.game.current_player_turn)
        setCurrentTurnPlayer(turnPlayer)
      }

      // Fetch news
      const newsRes = await axios.get(`/api/ai/news/${gameId}`)
      setNews(newsRes.data.news.slice(0, 5))
    } catch (error) {
      console.error('Error fetching game data:', error)
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
  }

  const handleAction = async (actionType, data) => {
    try {
      switch (actionType) {
        case 'buy_tile':
          const buyRes = await axios.post(`/api/player/${currentPlayer.id}/buy-tile`, { tileId: data.tileId })
          if (buyRes.data.success) {
            showNotification('✓ Property purchased successfully!', 'success')
            fetchGameData()
          }
          break
        case 'launch_company':
          const launchRes = await axios.post(`/api/player/${currentPlayer.id}/launch-company`, data)
          if (launchRes.data.success) {
            showNotification(`✓ ${data.name} launched successfully!`, 'success')
            fetchGameData()
          }
          break
        default:
          console.log('Action not implemented:', actionType)
      }
    } catch (error) {
      console.error('Error performing action:', error)
      showNotification('✗ Action failed: ' + (error.response?.data?.error || error.message), 'error')
    }
  }

  const handleAISimulation = async () => {
    try {
      showNotification('🤖 Starting AI simulation...', 'info')
      const res = await axios.post(`/api/ai/simulate-round/${gameId}`)
      console.log('AI Simulation result:', res.data)
      showNotification('✓ AI simulation complete!', 'success')
      fetchGameData()
    } catch (error) {
      console.error('Error simulating round:', error)
      showNotification('✗ Simulation failed: ' + (error.response?.data?.error || error.message), 'error')
    }
  }

  const handleEndRound = async () => {
    try {
      showNotification('⏭️ Ending turn...', 'info')
      
      // Advance to next player's turn instead of ending the round
      const res = await axios.post(`/api/game/${gameId}/advance-turn`)
      
      if (res.data.success) {
        showNotification('✓ Turn advanced to ' + res.data.currentPlayer, 'success')
      }
      
      fetchGameData()
    } catch (error) {
      console.error('Error ending turn:', error)
      showNotification('Failed to end turn: ' + (error.response?.data?.error || error.message), 'error')
    }
  }

  if (!game || !currentPlayer) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-xl">Loading game...</div></div>
  }

  return (
    <div className="min-h-screen p-4">
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column - Game Board */}
        <div className="lg:col-span-2 space-y-4">
          <GameBoard 
            tiles={tiles} 
            districts={districts}
            players={players}
            currentPlayer={currentPlayer}
            onBuyTile={(tileId) => handleAction('buy_tile', { tileId })}
          />
          
          {/* Action Panel */}
          <ActionPanel 
            player={currentPlayer}
            availableTiles={tiles.filter(t => !t.owner_id)}
            onAction={handleAction}
            onAISimulation={handleAISimulation}
            game={game}
            onEndRound={handleEndRound}
            onNotification={showNotification}
          />
        </div>

        {/* Right Column - Player Info, Chat, News */}
        <div className="space-y-4">
          <PlayerPanel 
            player={currentPlayer}
            players={players}
            game={game}
            currentTurnPlayer={currentTurnPlayer}
          />

          <ChatPanel gameId={gameId} playerId={currentPlayer?.id} onNotification={showNotification} />

          <NewsPanel news={news} />
        </div>
      </div>
    </div>
  )
}

export default Game

