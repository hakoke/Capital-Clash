import { useState, useEffect, useRef } from 'react'
import { Send, MessageCircle } from 'lucide-react'
import axios from 'axios'

function ChatPanel({ gameId, playerId, onNotification }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load chat history on mount
  useEffect(() => {
    if (gameId) {
      loadChatHistory()
    }
  }, [gameId])

  const loadChatHistory = async () => {
    try {
      const res = await axios.get(`/api/chat/${gameId}/history`)
      setMessages(res.data.messages || [])
    } catch (error) {
      console.error('Error loading chat:', error)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    try {
      await axios.post('/api/chat/message', {
        gameId,
        playerId,
        message: inputMessage,
        messageType: 'chat'
      })
      
      // Add message to local state immediately
      const playerName = localStorage.getItem(`playerName_${gameId}`) || 'You'
      const newMessage = {
        playerName,
        message: inputMessage,
        messageType: 'chat',
        timestamp: new Date().toISOString()
      }
      setMessages([...messages, newMessage])
      
      setInputMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      if (onNotification) {
        onNotification('Failed to send message', 'error')
      }
    }
  }

  return (
    <div className="glass rounded-xl p-3 card-glow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-neon-blue" />
          <h3 className="text-lg font-bold">Chat</h3>
        </div>
      </div>

      <div className="space-y-1.5 max-h-48 overflow-y-auto mb-2 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-6">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No messages yet. Start chatting!</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className="rounded-lg p-2 bg-card-bg border border-gray-700"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <p className="text-xs text-gray-400">
                    <strong className="text-neon-blue">{msg.playerName}</strong>
                  </p>
                  <p className="text-xs mt-1">{msg.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 rounded-lg text-sm bg-background border border-gray-600"
        />
        <button
          type="submit"
          className="btn-primary px-3 py-2 rounded-lg"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}

export default ChatPanel
