import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import GameBoard from '../components/GameBoard'
import PlayerList from '../components/PlayerList'
import NewsPanel from '../components/NewsPanel'
import ActionPanel from '../components/ActionPanel'
import ChatPanel from '../components/ChatPanel'
import AIExecutionPanel from '../components/AIExecutionPanel'
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
      const previousPhase = game?.phase
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

      // Auto-trigger AI simulation when phase changes to ai_phase
      if (previousPhase !== 'ai_phase' && res.data.game.phase === 'ai_phase') {
        console.log('Auto-triggering AI simulation...')
        setTimeout(() => {
          handleAISimulation()
        }, 1000)
      }

      // Fetch news
      const newsRes = await axios.get(`/api/ai/news/${gameId}`)
      setNews(newsRes.data.news.slice(0, 5)) // Show more news items
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
      // Advance to next player's turn instead of ending the round
      const res = await axios.post(`/api/game/${gameId}/advance-turn`)
      
      fetchGameData()
    } catch (error) {
      console.error('Error ending turn:', error)
      showNotification('Failed to end turn: ' + (error.response?.data?.error || error.message), 'error')
    }
  }

  if (!game || !currentPlayer) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-xl">Loading game...</div></div>
  }

  const isMyTurn = currentTurnPlayer && currentPlayer && currentTurnPlayer.id === currentPlayer.id

  return (
    <div className="min-h-screen p-4 overflow-hidden">
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      {/* Main Game Layout - Monopoly Style */}
      <div className="max-w-[1800px] mx-auto" style={{ height: 'calc(100vh - 2rem)' }}>
        
        {/* Top Bar - Quick Info */}
        <div className="flex items-center justify-between mb-2 glass rounded-lg px-4 py-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">💼 Capital Clash</h1>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neon-blue font-bold">${parseInt(currentPlayer.capital).toLocaleString()}</span>
              <span className="text-gray-500">•</span>
              <span className="text-neon-purple font-bold">{currentPlayer.company_name}</span>
            </div>
          </div>
        </div>

        {/* Main Game Area - Grid Layout */}
        <div className="grid grid-cols-12 gap-2" style={{ height: 'calc(100vh - 7rem)' }}>
          
          {/* Left Column - Player List & AI Execution */}
          <div className="col-span-2 space-y-4 overflow-y-auto custom-scrollbar">
            <PlayerList 
              players={players}
              currentPlayer={currentPlayer}
              currentTurnPlayer={currentTurnPlayer}
              game={game}
            />
            
            <AIExecutionPanel 
              playerId={currentPlayer?.id} 
              onNotification={showNotification}
            />
          </div>

          {/* Center - Game Board */}
          <div className="col-span-6">
            <GameBoard 
              tiles={tiles} 
              districts={districts}
              players={players}
              currentPlayer={currentPlayer}
              currentTurnPlayer={currentTurnPlayer}
              onBuyTile={(tileId) => handleAction('buy_tile', { tileId })}
              onEndTurn={handleEndRound}
            />
          </div>

          {/* Right Column - Actions, Chat, News */}
          <div className="col-span-4 space-y-4 overflow-y-auto custom-scrollbar">
            <ActionPanel 
              player={currentPlayer}
              onAction={handleAction}
              onAISimulation={handleAISimulation}
              game={game}
              onEndRound={handleEndRound}
              onNotification={showNotification}
              isMyTurn={isMyTurn}
            />

            <ChatPanel gameId={gameId} playerId={currentPlayer?.id} onNotification={showNotification} />

            <NewsPanel news={news} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Game
