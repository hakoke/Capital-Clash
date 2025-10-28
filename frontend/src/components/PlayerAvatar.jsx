import { PLAYER_COLORS } from '../utils/monopolyConstants.js'

function PlayerAvatar({ color, size = 'md', showCrown = false }) {
  const colorData = PLAYER_COLORS.find(c => c.name === color) || PLAYER_COLORS[0]
  const colorHex = colorData?.hex || '#999'
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }
  
  const eyeSize = size === 'xl' ? 'w-2 h-2' : 'w-1.5 h-1.5'
  const pupilSize = size === 'xl' ? 'w-1 h-1' : 'w-0.5 h-0.5'
  
  return (
    <div className={`${sizeClasses[size]} relative rounded-full flex items-center justify-center overflow-hidden`} style={{ backgroundColor: colorHex }}>
      {/* Avatar with eyes - two eyes */}
      <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 flex gap-1">
        <div className={`${eyeSize} bg-white rounded-full opacity-90 relative`}>
          <div className={`${pupilSize} bg-black rounded-full absolute ml-0.5 mt-0.5 opacity-60`}></div>
        </div>
        <div className={`${eyeSize} bg-white rounded-full opacity-90 relative`}>
          <div className={`${pupilSize} bg-black rounded-full absolute ml-0.5 mt-0.5 opacity-60`}></div>
        </div>
      </div>
      {/* Two-tone gradient */}
      <div className="absolute inset-0 rounded-full opacity-30" style={{
        background: `linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%)`
      }}></div>
    </div>
  )
}

export default PlayerAvatar

