import { useMemo, useState } from 'react'
import { COLOR_GROUPS, MIDDLE_EAST_BOARD, PLAYER_COLORS } from '../utils/monopolyConstants.js'

const PLAYER_COLOR_MAP = new Map(PLAYER_COLORS.map(entry => [entry.name, entry.hex]))
const BOARD_SIZE = 11
const TILE_META_CACHE = new Map()
const MONEY_FORMATTER = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

const resolvePlayerColor = (color) => {
  if (!color) return '#60a5fa'
  if (PLAYER_COLOR_MAP.has(color)) {
    return PLAYER_COLOR_MAP.get(color)
  }
  return color
}

const getPropertyColor = (property) => {
  if (!property?.color_group) return '#d1d5db'
  return COLOR_GROUPS[property.color_group] || '#d1d5db'
}

const formatMoney = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) {
    return '—'
  }
  return `$${MONEY_FORMATTER.format(Math.round(amount))}`
}

const computeTileMeta = (rawPosition) => {
  const position = Number(rawPosition)
  if (TILE_META_CACHE.has(position)) {
    return TILE_META_CACHE.get(position)
  }

  let meta = {
    row: BOARD_SIZE,
    col: BOARD_SIZE,
    orientation: 'corner',
    region: 'go'
  }

  if (position === 0) {
    meta = { row: BOARD_SIZE, col: BOARD_SIZE, orientation: 'corner', region: 'go' }
  } else if (position > 0 && position < 10) {
    meta = { row: BOARD_SIZE, col: BOARD_SIZE - position, orientation: 'horizontal', region: 'bottom' }
  } else if (position === 10) {
    meta = { row: BOARD_SIZE, col: 1, orientation: 'corner', region: 'jail' }
  } else if (position > 10 && position < 20) {
    meta = { row: BOARD_SIZE - (position - 10), col: 1, orientation: 'vertical', region: 'left' }
  } else if (position === 20) {
    meta = { row: 1, col: 1, orientation: 'corner', region: 'free-parking' }
  } else if (position > 20 && position < 30) {
    meta = { row: 1, col: 1 + (position - 20), orientation: 'horizontal', region: 'top' }
  } else if (position === 30) {
    meta = { row: 1, col: BOARD_SIZE, orientation: 'corner', region: 'go-to-jail' }
  } else if (position > 30 && position < 40) {
    meta = { row: 1 + (position - 30), col: BOARD_SIZE, orientation: 'vertical', region: 'right' }
  }

  TILE_META_CACHE.set(position, meta)
  return meta
}

const getDisplayName = (name = '') => {
  if (name.length <= 16) return name
  const trimmed = name.slice(0, 14).trim()
  const lastSpace = trimmed.lastIndexOf(' ')
  if (lastSpace > 8) return trimmed.slice(0, lastSpace) + '…'
  return trimmed + '…'
}

const getFallbackProperties = () => {
  return Object.entries(MIDDLE_EAST_BOARD).map(([position, meta]) => ({
    id: `theme-${position}`,
    position: Number(position),
    name: meta.name,
    price: meta.price || 0,
    rent: meta.rent || 0,
    rent_with_set: meta.rentWithSet || meta.rent || 0,
    color_group: meta.colorGroup || null,
    property_type: meta.type || 'special'
  }))
}

function PropertyModal({
  property,
  players,
  onClose,
  isOwner,
  onBuyProperty,
  onStructureAction,
  onMortgageAction,
  isActionLoading,
  settings
}) {
    if (!property) return null

  const owner = property.owner_id ? players.find((p) => p.id === property.owner_id) : null
  const ownerBadgeColor = owner ? resolvePlayerColor(owner.color) : '#1f2937'
  const mortgageValue = Number(property.price || 0) * 0.5
  const mortgagePayoff = Number(property.price || 0) * 0.55
  const mortgageEnabled = settings?.mortgage_enabled !== false

  const managementDisabled = !isOwner || isActionLoading
  const isDevelopable = property.property_type === 'property' && !!property.color_group

  const structureSummary = [
    { label: 'Houses', value: property.houses || 0 },
    { label: 'Hotels', value: property.hotels || 0 }
  ]

    return (
    <div className="modern-board__backdrop">
      <div className="modern-board__modal">
        <header className="modern-board__modal-header">
          {property.color_group && (
            <span
              className="modern-board__modal-accent"
              style={{ backgroundColor: getPropertyColor(property) }}
            />
          )}
          <div className="modern-board__modal-title">
            <h3>{property.name}</h3>
            <div className="modern-board__modal-meta">
              <span>{property.property_type === 'property' ? 'Title deed' : property.property_type.replace('_', ' ')}</span>
              {property.is_mortgaged && <span className="modern-board__pill modern-board__pill--warning">Mortgaged</span>}
              {owner && (
                <span className="modern-board__pill modern-board__pill--owner">
                  <span className="modern-board__pill-dot" style={{ backgroundColor: ownerBadgeColor }}></span>
                  {owner.name}
                </span>
              )}
            </div>
          </div>
          <button className="modern-board__modal-close" onClick={onClose} aria-label="Close property details">
            ×
          </button>
        </header>

        <section className="modern-board__modal-body">
          <div className="modern-board__stat-grid">
            <div className="modern-board__stat">
              <span>Price</span>
              <strong>{formatMoney(property.price)}</strong>
            </div>
            <div className="modern-board__stat">
              <span>Base rent</span>
              <strong>{formatMoney(property.rent)}</strong>
            </div>
            <div className="modern-board__stat">
              <span>Set rent</span>
              <strong>{formatMoney(property.rent_with_set)}</strong>
            </div>
            <div className="modern-board__stat">
              <span>House cost</span>
              <strong>{formatMoney(property.house_cost)}</strong>
            </div>
            <div className="modern-board__stat">
              <span>Hotel cost</span>
              <strong>{formatMoney(property.hotel_cost)}</strong>
        </div>
            <div className="modern-board__stat">
              <span>Mortgage value</span>
              <strong>{formatMoney(mortgageValue)}</strong>
            </div>
          </div>

          <div className="modern-board__structure-row">
            {structureSummary.map((item) => (
              <div key={item.label} className="modern-board__structure-card">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </section>

        {isOwner ? (
          <section className="modern-board__modal-section">
            <h4>Manage property</h4>
            <div className="modern-board__action-grid">
              <button
                type="button"
                className="modern-board__action-button"
                onClick={() => onStructureAction?.('build_house')}
                disabled={!isDevelopable || managementDisabled || property.hotels > 0 || property.houses >= 4}
              >
                Build house
              </button>
              <button
                type="button"
                className="modern-board__action-button"
                onClick={() => onStructureAction?.('sell_house')}
                disabled={!isDevelopable || managementDisabled || property.houses <= 0}
              >
                Sell house
              </button>
              <button
                type="button"
                className="modern-board__action-button"
                onClick={() => onStructureAction?.('build_hotel')}
                disabled={!isDevelopable || managementDisabled || property.hotels > 0 || property.houses < 4}
              >
                Build hotel
              </button>
              <button
                type="button"
                className="modern-board__action-button"
                onClick={() => onStructureAction?.('sell_hotel')}
                disabled={!isDevelopable || managementDisabled || property.hotels === 0}
              >
                Sell hotel
              </button>
            </div>
            <div className="modern-board__modal-hint">
              {settings?.even_build !== false ? 'Even-build enforcement is enabled for this game.' : 'Even-build rule is disabled.'}
            </div>

            <div className="modern-board__mortgage-row">
              <button
                type="button"
                className="modern-board__action-button modern-board__action-button--wide"
                onClick={onMortgageAction}
                disabled={isActionLoading || !mortgageEnabled || (property.is_mortgaged ? false : property.houses > 0 || property.hotels > 0)}
              >
                {property.is_mortgaged ? `Lift mortgage for ${formatMoney(mortgagePayoff)}` : `Mortgage for ${formatMoney(mortgageValue)}`}
              </button>
              {!mortgageEnabled && <span className="modern-board__modal-hint">Mortgages disabled by host</span>}
            </div>
          </section>
        ) : (
          <section className="modern-board__modal-section">
            {property.owner_id ? (
              <div className="modern-board__modal-hint">Owned by {owner?.name || 'another traveler'}.</div>
            ) : (
              <div className="modern-board__modal-cta">
                <span>Unclaimed stop. Purchase to start collecting rent.</span>
                {property.price > 0 && (
                  <button
                    type="button"
                    className="modern-board__action-button modern-board__action-button--primary"
                    onClick={() => onBuyProperty?.(property.id)}
                    disabled={isActionLoading || !onBuyProperty}
                  >
                    Buy for {formatMoney(property.price)}
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        <footer className="modern-board__modal-footer">
          <button type="button" className="modern-board__action-button" onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
      </div>
    )
  }

function MonopolyBoard({
  properties,
  players,
  currentPlayer,
  onBuyProperty,
  onManageStructure,
  onToggleMortgage,
  settings = {},
  isPreview = false,
  centerContent = null
}) {
  const [selectedPropertyId, setSelectedPropertyId] = useState(null)
  const [isActionLoading, setIsActionLoading] = useState(false)

  const boardProperties = useMemo(() => {
    const sourceProperties = (properties && properties.length > 0) ? [...properties] : getFallbackProperties()

    return sourceProperties
      .map((prop) => {
        const theme = MIDDLE_EAST_BOARD[prop.position] || {}
        return {
          ...prop,
          position: Number(prop.position),
          name: theme.name || prop.name,
          displaySubtitle: theme.subtitle,
          displayIcon: theme.icon,
          color_group: theme.colorGroup || prop.color_group,
          property_type: theme.type || prop.property_type,
          price: prop.price ?? theme.price ?? 0
        }
      })
      .sort((a, b) => a.position - b.position)
  }, [properties])

  const selectedProperty = useMemo(
    () => boardProperties.find((prop) => prop.id === selectedPropertyId) || null,
    [boardProperties, selectedPropertyId]
  )

  const handleTileClick = (property) => {
    if (isPreview) return
    setSelectedPropertyId(property.id)
  }

  const handleCloseModal = () => {
    setSelectedPropertyId(null)
    setIsActionLoading(false)
  }

  const handleStructureAction = async (property, action) => {
    if (!onManageStructure) return
    setIsActionLoading(true)
    try {
      await onManageStructure(property.id, action)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleMortgageAction = async (property) => {
    if (!onToggleMortgage) return
    setIsActionLoading(true)
    try {
      const mode = property.is_mortgaged ? 'lift' : 'mortgage'
      await onToggleMortgage(property.id, mode)
    } finally {
      setIsActionLoading(false)
    }
  }

  return (
    <>
      {!isPreview && selectedProperty && (
        <PropertyModal
          property={selectedProperty}
          players={players}
          onClose={handleCloseModal}
          isOwner={currentPlayer?.id === selectedProperty.owner_id}
          onBuyProperty={(propertyId) => onBuyProperty?.(propertyId)}
          onStructureAction={(action) => selectedProperty && handleStructureAction(selectedProperty, action)}
          onMortgageAction={() => selectedProperty && handleMortgageAction(selectedProperty)}
          isActionLoading={isActionLoading}
          settings={settings}
        />
      )}

      <div className={`modern-board ${isPreview ? 'modern-board--preview' : ''}`}>
        <div className="modern-board__grid">
          {boardProperties.map((property) => {
            const meta = computeTileMeta(property.position)
            const isOwned = !!property.owner_id
            const owner = isOwned ? players.find((p) => p.id === property.owner_id) : null
            const ownerColor = owner ? resolvePlayerColor(owner.color) : null
            const playersHere = players.filter((p) => Number(p.position) === Number(property.position))
            const propertyColor = getPropertyColor(property)

            const tileClassNames = [
              'modern-board__tile',
              `modern-board__tile--${meta.orientation}`,
              `modern-board__tile--${meta.region}`,
              isOwned ? 'modern-board__tile--owned' : '',
              property.is_mortgaged ? 'modern-board__tile--mortgaged' : ''
            ].filter(Boolean).join(' ')

            return (
              <button
                type="button"
                key={property.id}
                className={tileClassNames}
                style={{ 
                  gridRow: meta.row, 
                  gridColumn: meta.col,
                  minHeight: 0,
                  minWidth: 0
                }}
                onClick={() => handleTileClick(property)}
                disabled={isPreview}
              >
                {property.color_group && property.property_type === 'property' && (
                  <span
                    className="modern-board__color-band"
                    style={{ backgroundColor: propertyColor }}
                  ></span>
                )}

                <div className="modern-board__tile-inner">
                  <div className="modern-board__tile-content">
                    {property.displayIcon && (
                      <span className="modern-board__tile-icon">{property.displayIcon}</span>
                    )}
                    <span className="modern-board__tile-name">{getDisplayName(property.name)}</span>
                    {Number(property.price) > 0 && (
                      <span className="modern-board__tile-price">{formatMoney(property.price)}</span>
                    )}
            </div>

                  {property.houses > 0 && (
                    <div className="modern-board__structures">
                      {Array.from({ length: Math.min(property.houses, 4) }).map((_, idx) => (
                        <span key={idx} className="modern-board__structure modern-board__structure--house"></span>
                      ))}
          </div>
                  )}
                  {property.hotels > 0 && (
                    <div className="modern-board__structures">
                      <span className="modern-board__structure modern-board__structure--hotel"></span>
        </div>
      )}

                  {isOwned && owner && (
                    <span
                      className="modern-board__owner-chip"
                      style={{ backgroundColor: ownerColor }}
                      title={`Owned by ${owner.name}`}
                    >
                      {owner.name.charAt(0).toUpperCase()}
                    </span>
                  )}

                  {property.is_mortgaged && (
                    <span className="modern-board__mortgage-tag">M</span>
                  )}

                  {playersHere.length > 0 && (
                    <div className="modern-board__player-stack">
                      {playersHere.slice(0, 3).map((p) => (
                        <span
                          key={p.id}
                          className="modern-board__player-token"
                          style={{ backgroundColor: resolvePlayerColor(p.color) }}
                          title={p.name}
                        ></span>
                      ))}
                      {playersHere.length > 3 && (
                        <span className="modern-board__player-overflow">+{playersHere.length - 3}</span>
                      )}
                    </div>
                  )}
          </div>
              </button>
            )
          })}

          <div className="modern-board__center" style={{ gridRow: '2 / span 9', gridColumn: '2 / span 9' }}>
            {centerContent ? (
              <div className="modern-board__center-content">{centerContent}</div>
            ) : isPreview ? (
              <div className="modern-board__preview">
                <div className="modern-board__preview-icon">🌍</div>
                <h4 className="modern-board__preview-title">Middle East Route</h4>
                <div className="modern-board__preview-flags">
                  <span className="modern-board__preview-flag">🇵🇸</span>
                  <span className="modern-board__preview-flag">🇮🇱</span>
                  <span className="modern-board__preview-flag">🇦🇪</span>
                  <span className="modern-board__preview-flag">🇸🇦</span>
                  <span className="modern-board__preview-flag">🇪🇬</span>
                  <span className="modern-board__preview-flag">🇹🇷</span>
                  <span className="modern-board__preview-flag">🇺🇸</span>
                </div>
                <p className="modern-board__preview-meta">From Gaza to Washington</p>
                <div className="modern-board__preview-stats">
                  <div className="modern-board__preview-stat">
                    <div className="modern-board__preview-stat-value">40</div>
                    <div className="modern-board__preview-stat-label">Spaces</div>
                  </div>
                  <div className="modern-board__preview-stat">
                    <div className="modern-board__preview-stat-value">8</div>
                    <div className="modern-board__preview-stat-label">Regions</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="modern-board__preview">
                <div className="modern-board__preview-icon">🌍</div>
                <h4 className="modern-board__preview-title">Middle East Route</h4>
                <div className="modern-board__preview-flags">
                  <span className="modern-board__preview-flag">🇵🇸</span>
                  <span className="modern-board__preview-flag">🇮🇱</span>
                  <span className="modern-board__preview-flag">🇦🇪</span>
                  <span className="modern-board__preview-flag">🇸🇦</span>
                  <span className="modern-board__preview-flag">🇪🇬</span>
                  <span className="modern-board__preview-flag">🇹🇷</span>
                  <span className="modern-board__preview-flag">🇺🇸</span>
                </div>
                <p className="modern-board__preview-meta">From Gaza to Washington</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default MonopolyBoard
