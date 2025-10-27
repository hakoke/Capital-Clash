import { useState, useEffect, useRef } from 'react'
import { Send, MessageCircle, Bot } from 'lucide-react'
import axios from 'axios'

function ChatPanel({ gameId, playerId, onNotification }) {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [chatMode, setChatMode] = useState('chat') // 'chat' or 'ai_action'
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
    if (chatMode === 'ai_action') return // Don't send regular chat in AI mode

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
      if (onNotification) {
        onNotification('✓ Message sent!', 'success')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      if (onNotification) {
        onNotification('Failed to send message', 'error')
      }
    }
  }

  const sendAIAction = async () => {
    if (!inputMessage.trim()) return
    
    try {
      // Add to messages first for instant feedback
      const playerName = localStorage.getItem(`playerName_${gameId}`) || 'You'
      const newMessage = {
        playerName,
        message: inputMessage,
        messageType: 'action',
        timestamp: new Date().toISOString()
      }
      setMessages([...messages, newMessage])
      
      setInputMessage('')
      
      // Send as custom action to backend
      const res = await axios.post(`/api/player-actions/${playerId}/custom-action`, {
        actionType: 'player_action',
        actionDescription: inputMessage,
        details: {}
      })
      
      if (res.data.success) {
        if (onNotification) {
          onNotification('✓ Action processed!', 'success')
        }
      }
    } catch (error) {
      console.error('Error sending AI action:', error)
      if (onNotification) {
        onNotification('Action failed: ' + (error.response?.data?.error || error.message), 'error')
      }
    }
  }

  return (
    <div className="glass rounded-xl p-6 card-glow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-neon-blue" />
          <h3 className="text-xl font-bold">Chat & Actions</h3>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setChatMode('chat')}
            className={`px-3 py-1 rounded-lg text-sm font-semibold ${
              chatMode === 'chat' ? 'bg-neon-blue text-white' : 'bg-card-bg text-gray-400'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setChatMode('ai_action')}
            className={`px-3 py-1 rounded-lg text-sm font-semibold ${
              chatMode === 'ai_action' ? 'bg-neon-purple text-white' : 'bg-card-bg text-gray-400'
            }`}
          >
            <Bot className="w-4 h-4 inline mr-1" />
            AI Action
          </button>
        </div>
      </div>

      {chatMode === 'ai_action' && (
        <div className="bg-neon-purple bg-opacity-10 border-2 border-neon-purple rounded-lg p-3 mb-3">
          <p className="text-sm text-gray-300 mb-2">
            🤖 <strong>AI Mode:</strong> The AI will execute your commands and affect the game!
          </p>
          <div className="text-xs space-y-1">
            <strong>Example Actions:</strong>
            <br />• "Invest $200k in my company" → Increases company value
            <br />• "Launch a new tech startup" → Creates new company
            <br />• "Run a PR campaign" → Boosts reputation
            <br />• Any creative action you can imagine!
          </div>
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto mb-3 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No messages yet. Start chatting or interact with AI!</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`rounded-lg p-2 ${
                msg.messageType === 'action'
                  ? 'bg-neon-purple bg-opacity-10 border border-neon-purple'
                  : 'bg-card-bg border border-gray-700'
              }`}
            >
              <div className="flex items-start gap-2">
                {msg.messageType === 'action' && <Bot className="w-4 h-4 text-neon-purple mt-1" />}
                <div className="flex-1">
                  <p className="text-xs text-gray-400">
                    <strong className="text-neon-blue">{msg.playerName}</strong>
                    {msg.companyName && <span className="text-gray-500"> • {msg.companyName}</span>}
                  </p>
                  <p className="text-sm mt-1">{msg.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={(e) => {
        e.preventDefault()
        if (chatMode === 'ai_action') {
          sendAIAction()
        } else {
          sendMessage(e)
        }
      }} className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={chatMode === 'ai_action' ? 'Describe your action...' : 'Type a message...'}
          className="flex-1 px-4 py-2 rounded-lg"
        />
        <button
          type="submit"
          className="btn-primary px-4 py-2 rounded-lg"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  )
}

export default ChatPanel

