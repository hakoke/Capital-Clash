const PIP_LAYOUT = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8]
}

const SIZE_MAP = {
  sm: 44,
  md: 56,
  lg: 72,
  xl: 88
}

function Dice3D({ value = null, size = 'md', animate = false }) {
  const dimension = SIZE_MAP[size] || SIZE_MAP.md
  const pipIndices = value ? PIP_LAYOUT[value] || [] : []

  return (
    <div
      className={`dice-3d dice-3d--${size} ${value ? '' : 'dice-3d--idle'} ${animate ? 'dice-3d--animate' : ''}`.trim()}
      style={{ '--dice-size': `${dimension}px` }}
    >
      <div className="dice-3d__cube">
        <div className="dice-3d__face">
          {Array.from({ length: 9 }).map((_, idx) => (
            <span
              key={idx}
              className={`dice-3d__pip ${pipIndices.includes(idx) ? 'active' : ''}`.trim()}
            ></span>
          ))}
        </div>
        <span className="dice-3d__shadow" aria-hidden="true"></span>
      </div>
    </div>
  )
}

export default Dice3D

