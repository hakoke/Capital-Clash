import { PLAYER_COLORS } from '../utils/monopolyConstants.js'

const SIZE_MAP = {
  xs: { size: '1.4rem', eye: '0.32rem', pupil: '0.18rem' },
  sm: { size: '1.75rem', eye: '0.42rem', pupil: '0.22rem' },
  md: { size: '2.25rem', eye: '0.52rem', pupil: '0.28rem' },
  lg: { size: '3rem', eye: '0.68rem', pupil: '0.36rem' },
  xl: { size: '4rem', eye: '0.88rem', pupil: '0.46rem' }
}

function PlayerAvatar({ color, size = 'md', showCrown = false }) {
  const colorData = PLAYER_COLORS.find(c => c.name === color) || PLAYER_COLORS[0]
  const colorHex = colorData?.hex || '#999'
  const sizing = SIZE_MAP[size] || SIZE_MAP.md

  return (
    <div
      className={`poordown-avatar poordown-avatar--${size}`}
      style={{
        '--avatar-color': colorHex,
        '--avatar-size': sizing.size,
        '--avatar-eye-size': sizing.eye,
        '--avatar-pupil-size': sizing.pupil
      }}
    >
      <span className="poordown-avatar-backglow" aria-hidden="true"></span>
      <span className="poordown-avatar-sheen" aria-hidden="true"></span>
      <span className="poordown-avatar-eyes" aria-hidden="true">
        <span className="poordown-avatar-eye">
          <span className="poordown-avatar-pupil"></span>
          <span className="poordown-avatar-glint"></span>
        </span>
        <span className="poordown-avatar-eye">
          <span className="poordown-avatar-pupil"></span>
          <span className="poordown-avatar-glint"></span>
        </span>
      </span>
      {showCrown && (
        <span className="poordown-avatar-crown" aria-hidden="true">👑</span>
      )}
    </div>
  )
}

export default PlayerAvatar

