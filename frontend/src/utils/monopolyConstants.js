// Color mappings for UI
export const COLOR_GROUPS = {
  'brown': '#8B4513',
  'light_blue': '#87CEEB',
  'pink': '#FF69B4',
  'orange': '#FFA500',
  'red': '#DC143C',
  'yellow': '#FFD700',
  'green': '#228B22',
  'blue': '#191970',
  'railroad': '#2F2F2F',
  'utility': '#F0F0F0',
  'special': '#FFFFFF'
};

// Available player colors - RichUp.io uses 12 colors for 4x3 grid
export const PLAYER_COLORS = [
  { name: 'lime_green', hex: '#bef264' },       // Row 1: Lime/Yellow-green
  { name: 'golden_yellow', hex: '#fbbf24' },    // Yellow
  { name: 'bright_orange', hex: '#fb923c' },    // Orange
  { name: 'coral_red', hex: '#f87171' },        // Coral/Red
  
  { name: 'sky_blue', hex: '#60a5fa' },         // Row 2: Blue
  { name: 'cyan', hex: '#22d3ee' },              // Cyan
  { name: 'teal', hex: '#14b8a6' },              // Teal
  { name: 'mint_green', hex: '#4ade80' },        // Mint/Green
  
  { name: 'tan_brown', hex: '#a0826d' },         // Row 3: Brown/Tan
  { name: 'hot_pink', hex: '#ec4899' },          // Hot pink
  { name: 'light_pink', hex: '#f472b6' },        // Light pink
  { name: 'purple', hex: '#a855f7' }             // Purple
];

export const MIDDLE_EAST_BOARD = {
  // Corner 0: START
  0: { name: 'START', subtitle: 'Collect $400', type: 'start', icon: '▶️' },
  
  // Bottom row (left to right) - Palestine & Israel properties
  1: { name: 'Gaza', type: 'property', colorGroup: 'brown', price: 60, icon: '🇵🇸', flag: '🇵🇸' },
  2: { name: 'Treasure', type: 'community', icon: '💰' },
  3: { name: 'Ramallah', type: 'property', colorGroup: 'brown', price: 60, icon: '🇵🇸', flag: '🇵🇸' },
  4: { name: 'Income Tax', type: 'tax', price: 200, icon: '💵' },
  5: { name: 'Tel Aviv', type: 'property', colorGroup: 'brown', price: 100, icon: '🇮🇱', flag: '🇮🇱' },
  6: { name: 'TLV Airport', type: 'railroad', price: 200, icon: '✈️' },
  7: { name: 'Haifa', type: 'property', colorGroup: 'brown', price: 100, icon: '🇮🇱', flag: '🇮🇱' },
  8: { name: 'Jerusalem', type: 'property', colorGroup: 'brown', price: 110, icon: '🇮🇱', flag: '🇮🇱' },
  9: { name: 'Surprise', type: 'chance', icon: '❓' },
  
  // Corner 10: In Prison
  10: { name: 'In Prison', subtitle: 'Just Visiting', type: 'jail', icon: '🚧' },
  
  // Right column (top to bottom) - Lebanon & UAE
  11: { name: 'Beirut', type: 'property', colorGroup: 'light_blue', price: 140, icon: '🇱🇧', flag: '🇱🇧' },
  12: { name: 'Electric Company', type: 'utility', price: 150, icon: '⚡' },
  13: { name: 'Tripoli', type: 'property', colorGroup: 'light_blue', price: 140, icon: '🇱🇧', flag: '🇱🇧' },
  14: { name: 'Sidon', type: 'property', colorGroup: 'light_blue', price: 160, icon: '🇱🇧', flag: '🇱🇧' },
  15: { name: 'DXB Airport', type: 'railroad', price: 200, icon: '✈️' },
  16: { name: 'Dubai', type: 'property', colorGroup: 'pink', price: 180, icon: '🇦🇪', flag: '🇦🇪' },
  17: { name: 'Treasure', type: 'community', icon: '💰' },
  18: { name: 'Abu Dhabi', type: 'property', colorGroup: 'pink', price: 180, icon: '🇦🇪', flag: '🇦🇪' },
  19: { name: 'Sharjah', type: 'property', colorGroup: 'pink', price: 200, icon: '🇦🇪', flag: '🇦🇪' },
  
  // Corner 20: Vacation
  20: { name: 'Vacation', subtitle: 'Free Rest', type: 'parking', icon: '🏖️' },
  
  // Top row (right to left) - Egypt & Turkey
  21: { name: 'Cairo', type: 'property', colorGroup: 'red', price: 220, icon: '🇪🇬', flag: '🇪🇬' },
  22: { name: 'Surprise', type: 'chance', icon: '❓' },
  23: { name: 'Alexandria', type: 'property', colorGroup: 'red', price: 220, icon: '🇪🇬', flag: '🇪🇬' },
  24: { name: 'Luxor', type: 'property', colorGroup: 'red', price: 240, icon: '🇪🇬', flag: '🇪🇬' },
  25: { name: 'CAI Airport', type: 'railroad', price: 200, icon: '✈️' },
  26: { name: 'Istanbul', type: 'property', colorGroup: 'yellow', price: 260, icon: '🇹🇷', flag: '🇹🇷' },
  27: { name: 'Ankara', type: 'property', colorGroup: 'yellow', price: 260, icon: '🇹🇷', flag: '🇹🇷' },
  28: { name: 'Water Company', type: 'utility', price: 150, icon: '💧' },
  29: { name: 'Izmir', type: 'property', colorGroup: 'yellow', price: 280, icon: '🇹🇷', flag: '🇹🇷' },
  
  // Corner 30: Go to Prison
  30: { name: 'Go to Prison', subtitle: 'Direct to Jail', type: 'go_to_jail', icon: '⛓️' },
  
  // Left column (bottom to top) - US properties
  31: { name: 'New York', type: 'property', colorGroup: 'green', price: 300, icon: '🇺🇸', flag: '🇺🇸' },
  32: { name: 'Los Angeles', type: 'property', colorGroup: 'green', price: 300, icon: '🇺🇸', flag: '🇺🇸' },
  33: { name: 'Treasure', type: 'community', icon: '💰' },
  34: { name: 'Chicago', type: 'property', colorGroup: 'green', price: 320, icon: '🇺🇸', flag: '🇺🇸' },
  35: { name: 'Washington D.C.', type: 'property', colorGroup: 'green', price: 320, icon: '🇺🇸', flag: '🇺🇸' },
  36: { name: 'JFK Airport', type: 'railroad', price: 200, icon: '✈️' },
  37: { name: 'Surprise', type: 'chance', icon: '❓' },
  38: { name: 'San Francisco', type: 'property', colorGroup: 'blue', price: 350, icon: '🇺🇸', flag: '🇺🇸' },
  39: { name: 'Luxury Tax', type: 'tax', price: 75, icon: '💎' }
};

