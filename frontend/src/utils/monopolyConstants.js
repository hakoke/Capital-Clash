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
  0: { name: 'Take Off', subtitle: 'Collect $400', type: 'start', icon: '✈️' },
  1: { name: 'Gaza City', type: 'property', colorGroup: 'brown', price: 60, icon: '🇵🇸', flag: '🇵🇸' },
  2: { name: 'Community Aid', type: 'community', icon: '🎁' },
  3: { name: 'Bethlehem', type: 'property', colorGroup: 'brown', price: 60, icon: '🇵🇸', flag: '🇵🇸' },
  4: { name: 'Border Fees', type: 'tax', icon: '💰' },
  5: { name: 'Levant Rail', type: 'railroad', icon: '🚆' },
  6: { name: 'Muscat', type: 'property', colorGroup: 'light_blue', price: 100, icon: '🇴🇲', flag: '🇴🇲' },
  7: { name: 'Opportunity', type: 'chance', icon: '❓' },
  8: { name: 'Doha', type: 'property', colorGroup: 'light_blue', price: 100, icon: '🇶🇦', flag: '🇶🇦' },
  9: { name: 'Amman', type: 'property', colorGroup: 'light_blue', price: 120, icon: '🇯🇴', flag: '🇯🇴' },
  10: { name: 'Customs Check', subtitle: 'Just Visiting', type: 'jail', icon: '🚧' },
  11: { name: 'Kuwait City', type: 'property', colorGroup: 'pink', price: 140, icon: '🇰🇼', flag: '🇰🇼' },
  12: { name: 'Desert Solar Grid', type: 'utility', icon: '☀️' },
  13: { name: 'Riyadh', type: 'property', colorGroup: 'pink', price: 140, icon: '🇸🇦', flag: '🇸🇦' },
  14: { name: 'Jeddah', type: 'property', colorGroup: 'pink', price: 160, icon: '🇸🇦', flag: '🇸🇦' },
  15: { name: 'Gulf Air Link', type: 'railroad', icon: '🛩️' },
  16: { name: 'Abu Dhabi', type: 'property', colorGroup: 'orange', price: 180, icon: '🇦🇪', flag: '🇦🇪' },
  17: { name: 'Humanitarian Fund', type: 'community', icon: '🤝' },
  18: { name: 'Dubai', type: 'property', colorGroup: 'orange', price: 180, icon: '🇦🇪', flag: '🇦🇪' },
  19: { name: 'Sharjah', type: 'property', colorGroup: 'orange', price: 200, icon: '🇦🇪', flag: '🇦🇪' },
  20: { name: 'Oasis Retreat', subtitle: 'Free Rest', type: 'parking', icon: '🏝️' },
  21: { name: 'Cairo', type: 'property', colorGroup: 'red', price: 220, icon: '🇪🇬', flag: '🇪🇬' },
  22: { name: 'Opportunity', type: 'chance', icon: '❓' },
  23: { name: 'Alexandria', type: 'property', colorGroup: 'red', price: 220, icon: '🇪🇬', flag: '🇪🇬' },
  24: { name: 'Luxor', type: 'property', colorGroup: 'red', price: 240, icon: '🇪🇬', flag: '🇪🇬' },
  25: { name: 'Nile River Ferry', type: 'railroad', icon: '⛴️' },
  26: { name: 'Jerusalem', type: 'property', colorGroup: 'yellow', price: 260, icon: '🇮🇱', flag: '🇮🇱' },
  27: { name: 'Haifa', type: 'property', colorGroup: 'yellow', price: 260, icon: '🇮🇱', flag: '🇮🇱' },
  28: { name: 'Suez Canal Authority', type: 'utility', icon: '🚢' },
  29: { name: 'Ramallah', type: 'property', colorGroup: 'yellow', price: 280, icon: '🇵🇸', flag: '🇵🇸' },
  30: { name: 'Detained', subtitle: 'Go to Customs', type: 'go_to_jail', icon: '⛔' },
  31: { name: 'Istanbul', type: 'property', colorGroup: 'green', price: 300, icon: '🇹🇷', flag: '🇹🇷' },
  32: { name: 'Ankara', type: 'property', colorGroup: 'green', price: 300, icon: '🇹🇷', flag: '🇹🇷' },
  33: { name: 'Relief Mission', type: 'community', icon: '💝' },
  34: { name: 'Izmir', type: 'property', colorGroup: 'green', price: 320, icon: '🇹🇷', flag: '🇹🇷' },
  35: { name: 'Atlantic Air Hub', type: 'railroad', icon: '🛫' },
  36: { name: 'Opportunity', type: 'chance', icon: '❓' },
  37: { name: 'New York', type: 'property', colorGroup: 'blue', price: 350, icon: '🇺🇸', flag: '🇺🇸' },
  38: { name: 'Global Solidarity Tax', type: 'tax', icon: '💵' },
  39: { name: 'Washington D.C.', type: 'property', colorGroup: 'blue', price: 400, icon: '🇺🇸', flag: '🇺🇸' }
};

