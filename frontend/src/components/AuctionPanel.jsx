import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'

function AuctionPanel({ gameId, property, players, currentPlayerId, onClose, onComplete }) {
  const [currentBid, setCurrentBid] = useState(0)
  const [bidAmount, setBidAmount] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(30)
  const [highestBidder, setHighestBidder] = useState(null)
  const [bidHistory, setBidHistory] = useState([])
  const socketRef = useRef(null)

  useEffect(() => {
    // Connect to socket for real-time updates
    const socket = io()
    socketRef.current = socket
    
    socket.emit('join_game', gameId)
    
    socket.on('auction_update', (data) => {
      setCurrentBid(data.currentBid)
      setHighestBidder(data.highestBidder)
      setTimeRemaining(data.timeRemaining)
      setBidHistory(data.bidHistory || [])
    })

    // Start timer countdown
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleEndAuction()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Fetch initial auction state
    const fetchAuction = async () => {
      try {
        const res = await axios.get(`/api/auction/${gameId}/${property.id}`)
        const auction = res.data.auction
        setCurrentBid(auction.current_bid)
        setTimeRemaining(auction.time_remaining)
        setHighestBidder(auction.highest_bidder_id)
      } catch (error) {
        console.error('Error fetching auction:', error)
      }
    }
    
    fetchAuction()

    return () => {
      clearInterval(interval)
      if (socket) socket.disconnect()
    }
  }, [gameId, property])

  const handleBid = async () => {
    if (!bidAmount || parseFloat(bidAmount) <= currentBid) {
      alert('Bid must be higher than current bid')
      return
    }

    try {
      await axios.post('/api/auction/bid', {
        auctionId: property.auctionId,
        playerId: currentPlayerId,
        bidAmount: parseFloat(bidAmount)
      })
      
      setBidAmount('')
    } catch (error) {
      alert('Error placing bid: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleEndAuction = async () => {
    try {
      await axios.post('/api/auction/end', {
        auctionId: property.auctionId
      })
      
      if (onComplete) onComplete()
      if (onClose) onClose()
    } catch (error) {
      console.error('Error ending auction:', error)
    }
  }

  const getHighestBidderName = () => {
    if (!highestBidder) return 'No bids yet'
    const player = players.find(p => p.id === highestBidder)
    return player ? player.name : 'Unknown'
  }

  const getPlayerInfo = (playerId) => {
    return players.find(p => p.id === playerId)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-[#3a1552] rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-purple-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">🔨 Auction</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Property Info */}
        <div className="bg-[#2a0f3f] rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-white mb-2">{property.name}</h3>
          <p className="text-gray-400 text-sm">Starting bid: ${property.price}</p>
        </div>

        {/* Current Bid */}
        <div className="bg-[#2a0f3f] rounded-lg p-4 mb-4 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">${currentBid}</div>
          <div className="text-sm text-gray-400">
            Highest bidder: <span className="text-white font-semibold">{getHighestBidderName()}</span>
          </div>
        </div>

        {/* Timer */}
        <div className="bg-[#2a0f3f] rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Time remaining:</span>
            <div className="text-2xl font-bold" style={{ color: timeRemaining <= 10 ? '#ff0000' : '#00ff00' }}>
              {timeRemaining}s
            </div>
          </div>
          <div className="mt-2 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(timeRemaining / 30) * 100}%`,
                backgroundColor: timeRemaining <= 10 ? '#ff0000' : '#00ff00'
              }}
            />
          </div>
        </div>

        {/* Bid History */}
        {bidHistory.length > 0 && (
          <div className="bg-[#2a0f3f] rounded-lg p-3 mb-4 max-h-32 overflow-y-auto">
            <div className="text-xs font-semibold text-gray-400 mb-2">Recent Bids</div>
            <div className="space-y-1">
              {bidHistory.slice(-5).map((bid, idx) => {
                const player = getPlayerInfo(bid.playerId)
                return (
                  <div key={idx} className="text-xs text-gray-300">
                    <span className="text-purple-400">{player?.name || 'Player'}</span> bid ${bid.amount}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Bid Input */}
        <div className="space-y-3">
          <div>
            <label className="text-white text-sm mb-2 block">Your Bid</label>
            <input
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`Minimum: $${currentBid + 1}`}
              className="w-full bg-[#1a0033] text-white px-4 py-2 rounded-lg border border-purple-700 focus:border-purple-500 focus:outline-none"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleBid}
              disabled={!bidAmount || parseFloat(bidAmount) <= currentBid}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Place Bid
            </button>
            <button
              onClick={onClose}
              className="px-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuctionPanel
