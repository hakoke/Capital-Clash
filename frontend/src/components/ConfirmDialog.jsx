import { useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

function ConfirmDialog({ message, onConfirm, onCancel, type = 'info' }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onCancel])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass rounded-xl p-6 max-w-md w-full border-2 border-neon-blue animate-fade-in shadow-2xl">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-neon-blue bg-opacity-20 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-neon-blue" />
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-center mb-4">{message}</h3>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-lg font-semibold bg-card-bg border-2 border-gray-600 hover:border-gray-400 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-lg font-semibold bg-gradient-to-r from-neon-blue to-neon-purple hover:shadow-lg transition-all"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog

