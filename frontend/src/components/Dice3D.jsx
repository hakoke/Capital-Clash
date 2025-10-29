const PIP_LAYOUT = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8]
}

const SIZE_MAP = {
  sm: 56,
  md: 80,
  lg: 96,
  xl: 120
}

// All 6 faces of a die (opposite faces add up to 7)
const DICE_FACES = {
  front: 1,
  back: 6,
  right: 3,
  left: 4,
  top: 5,
  bottom: 2
}

function DiceFace({ value, faceClass }) {
  const pipIndices = PIP_LAYOUT[value] || []
  
  return (
    <div className={`dice-3d__face ${faceClass}`}>
      {Array.from({ length: 9 }).map((_, idx) => (
        <div key={idx} className="dice-3d__pip-cell">
          {pipIndices.includes(idx) && (
            <span className="dice-3d__pip active"></span>
          )}
        </div>
      ))}
    </div>
  )
}

function Dice3D({ value = null, size = 'md', animate = false }) {
  const dimension = SIZE_MAP[size] || SIZE_MAP.md

  return (
    <div
      className={`dice-3d ${value ? '' : 'dice-3d--idle'} ${animate ? 'dice-3d--animate' : ''}`.trim()}
      style={{ '--dice-size': `${dimension}px` }}
    >
      <div className="dice-3d__cube">
        <DiceFace value={DICE_FACES.front} faceClass="dice-3d__face--front" />
        <DiceFace value={DICE_FACES.back} faceClass="dice-3d__face--back" />
        <DiceFace value={DICE_FACES.right} faceClass="dice-3d__face--right" />
        <DiceFace value={DICE_FACES.left} faceClass="dice-3d__face--left" />
        <DiceFace value={DICE_FACES.top} faceClass="dice-3d__face--top" />
        <DiceFace value={DICE_FACES.bottom} faceClass="dice-3d__face--bottom" />
      </div>
      <span className="dice-3d__shadow" aria-hidden="true"></span>
    </div>
  )
}

export default Dice3D

