export const PLAYER_COLORS = [
  { name: 'red', hex: '#ef4444' },
  { name: 'blue', hex: '#3b82f6' },
  { name: 'green', hex: '#10b981' },
  { name: 'yellow', hex: '#eab308' },
  { name: 'purple', hex: '#a855f7' },
  { name: 'pink', hex: '#ec4899' },
  { name: 'orange', hex: '#f97316' },
  { name: 'cyan', hex: '#06b6d4' }
]

export const COLOR_GROUPS = {
  brown: '#8b4513',
  light_blue: '#87ceeb',
  pink: '#ff69b4',
  orange: '#ffa500',
  red: '#ff0000',
  yellow: '#ffff00',
  green: '#00ff00',
  blue: '#0000ff',
  navy: '#000080',
  gray: '#808080',
  teal: '#008080',
  maroon: '#800000',
  olive: '#808000',
  lime: '#00ff00',
  aqua: '#00ffff',
  silver: '#c0c0c0',
  fuchsia: '#ff00ff',
  white: '#ffffff',
  black: '#000000',
  indigo: '#4b0082',
  violet: '#ee82ee',
  gold: '#ffd700',
  salmon: '#fa8072',
  tan: '#d2b48c',
  turquoise: '#40e0d0',
  beige: '#f5f5dc',
  lavender: '#e6e6fa',
  coral: '#ff7f50',
  hot_pink: '#ec4899',
  light_pink: '#f472b6',
  purple: '#a855f7'
}

export const MIDDLE_EAST_BOARD = {
  // Corner 0: Vacation (BOTTOM RIGHT) - matches screenshot
  0: { name: 'Vacation', subtitle: 'Free Rest', type: 'parking', icon: '🏖️' },
  
  // Bottom row (right to left, after Vacation): 9 tiles
  // Screenshot: China(3) → Surprise → China(2) → Treasure → China(1) → Airport → France(2) → Water Company → Japan(2)
  // Our: Saudi(3) → Surprise → Saudi(1) → Treasure → Qatar(1) → Airport → Egypt(2) → Water Company → Jordan(1)
  1: { name: 'Riyadh', type: 'property', colorGroup: 'red', price: 220, icon: '🇸🇦', flag: '🇸🇦' },
  2: { name: 'Surprise', type: 'chance', icon: '❓' },
  3: { name: 'Jeddah', type: 'property', colorGroup: 'red', price: 220, icon: '🇸🇦', flag: '🇸🇦' },
  4: { name: 'Mecca', type: 'property', colorGroup: 'red', price: 220, icon: '🇸🇦', flag: '🇸🇦' },
  5: { name: 'Treasure', type: 'community', icon: '💰' },
  6: { name: 'Doha', type: 'property', colorGroup: 'red', price: 240, icon: '🇶🇦', flag: '🇶🇦' },
  7: { name: 'DXB Airport', type: 'railroad', price: 200, icon: '✈️' },
  8: { name: 'Cairo', type: 'property', colorGroup: 'yellow', price: 260, icon: '🇪🇬', flag: '🇪🇬' },
  9: { name: 'Water Company', type: 'utility', price: 150, icon: '💧' },
  
  // Corner 10: Go to Prison (BOTTOM LEFT) - matches screenshot
  10: { name: 'Go to Prison', subtitle: 'Direct to Jail', type: 'go_to_jail', icon: '⛓️' },
  
  // Left column (bottom to top, after Go to Prison): 9 tiles
  // Screenshot: UK(2) → Treasure → UK(2) → Airport → US(1) → Surprise → US(1) → Luxury Tax → US(1)
  // Our: US(2) → Treasure → US(2) → Airport → Lebanon(1) → Surprise → Lebanon(1) → Luxury Tax → Lebanon(1)
  11: { name: 'New York', type: 'property', colorGroup: 'green', price: 300, icon: '🇺🇸', flag: '🇺🇸' },
  12: { name: 'Los Angeles', type: 'property', colorGroup: 'green', price: 300, icon: '🇺🇸', flag: '🇺🇸' },
  13: { name: 'Treasure', type: 'community', icon: '💰' },
  14: { name: 'Chicago', type: 'property', colorGroup: 'green', price: 320, icon: '🇺🇸', flag: '🇺🇸' },
  15: { name: 'Washington D.C.', type: 'property', colorGroup: 'green', price: 320, icon: '🇺🇸', flag: '🇺🇸' },
  16: { name: 'JFK Airport', type: 'railroad', price: 200, icon: '✈️' },
  17: { name: 'Beirut', type: 'property', colorGroup: 'blue', price: 350, icon: '🇱🇧', flag: '🇱🇧' },
  18: { name: 'Surprise', type: 'chance', icon: '❓' },
  19: { name: 'Luxury Tax', type: 'tax', price: 75, icon: '💎' },
  
  // Corner 20: START (TOP LEFT) - matches screenshot
  20: { name: 'START', subtitle: 'Collect $400', type: 'start', icon: '▶️' },
  
  // Top row (left to right, after START): 9 tiles
  // Screenshot: Brazil(2) → Treasure → Brazil(1) → Income Tax → Israel(3) → Airport → (empty) → Surprise → India(2)
  // Our: Palestine(2) → Treasure → Palestine(1) → Income Tax → Israel(3) → Airport → (empty) → Surprise → UAE(2)
  21: { name: 'Gaza', type: 'property', colorGroup: 'brown', price: 60, icon: '🇵🇸', flag: '🇵🇸' },
  22: { name: 'Treasure', type: 'community', icon: '💰' },
  23: { name: 'Ramallah', type: 'property', colorGroup: 'brown', price: 60, icon: '🇵🇸', flag: '🇵🇸' },
  24: { name: 'Income Tax', type: 'tax', price: 200, icon: '💵' },
  25: { name: 'Tel Aviv', type: 'property', colorGroup: 'brown', price: 100, icon: '🇮🇱', flag: '🇮🇱' },
  26: { name: 'TLV Airport', type: 'railroad', price: 200, icon: '✈️' },
  27: { name: 'Haifa', type: 'property', colorGroup: 'brown', price: 100, icon: '🇮🇱', flag: '🇮🇱' },
  28: { name: 'Jerusalem', type: 'property', colorGroup: 'brown', price: 110, icon: '🇮🇱', flag: '🇮🇱' },
  29: { name: 'Surprise', type: 'chance', icon: '❓' },
  
  // Corner 30: In Prison (TOP RIGHT) - matches screenshot
  30: { name: 'In Prison', subtitle: 'Just Visiting', type: 'jail', icon: '🚧' },
  
  // Right column (top to bottom, after In Prison): 9 tiles
  // Screenshot: Italy(2) → Electric → Italy(2) → Airport → Germany(1) → Treasure → Germany(1) → Gas → Germany(1)
  // Our: Lebanon(2) → Electric → Lebanon(2) → Airport → UAE(1) → Treasure → UAE(1) → Gas → UAE(1)
  // Note: Standard board has 9 tiles (positions 31-39), matching pattern as closely as possible
  31: { name: 'Beirut', type: 'property', colorGroup: 'light_blue', price: 140, icon: '🇱🇧', flag: '🇱🇧' },
  32: { name: 'Tripoli', type: 'property', colorGroup: 'light_blue', price: 140, icon: '🇱🇧', flag: '🇱🇧' },
  33: { name: 'Electric Company', type: 'utility', price: 150, icon: '⚡' },
  34: { name: 'Sidon', type: 'property', colorGroup: 'light_blue', price: 160, icon: '🇱🇧', flag: '🇱🇧' },
  35: { name: 'Byblos', type: 'property', colorGroup: 'light_blue', price: 160, icon: '🇱🇧', flag: '🇱🇧' },
  36: { name: 'BEY Airport', type: 'railroad', price: 200, icon: '✈️' },
  37: { name: 'Dubai', type: 'property', colorGroup: 'pink', price: 180, icon: '🇦🇪', flag: '🇦🇪' },
  38: { name: 'Treasure', type: 'community', icon: '💰' },
  39: { name: 'Abu Dhabi', type: 'property', colorGroup: 'pink', price: 180, icon: '🇦🇪', flag: '🇦🇪' }
}
