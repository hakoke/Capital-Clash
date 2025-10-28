import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

function Notification({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 6000)

    return () => clearTimeout(timer)
  }, [onClose])

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  }

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }

  const Icon = icons[type] || CheckCircle

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`${colors[type]} text-white rounded-lg shadow-2xl p-4 min-w-[300px] max-w-md flex items-center gap-3 border-2 border-white border-opacity-20`}>
        <Icon className="w-6 h-6 flex-shrink-0" />
        <p className="flex-1 font-semibold">{message}</p>
        <button onClick={onClose} className="hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-all">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Notification

