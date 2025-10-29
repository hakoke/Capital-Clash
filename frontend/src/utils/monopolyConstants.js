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

// Available player colors - RichUp.io uses 9 colors for 3x3 grid
export const PLAYER_COLORS = [
  { name: 'bright_green', hex: '#4ade80' },      // Lime green
  { name: 'bright_yellow', hex: '#fbbf24' },    // Yellow
  { name: 'bright_orange', hex: '#fb923c' },    // Orange
  { name: 'cyan', hex: '#22d3ee' },              // Light blue/cyan
  { name: 'light_blue', hex: '#38bdf8' },       // Blue
  { name: 'teal', hex: '#2dd4bf' },              // Teal
  { name: 'brown', hex: '#92400e' },             // Brown
  { name: 'magenta', hex: '#ec4899' },           // Magenta
  { name: 'bright_pink', hex: '#f472b6' }       // Pink (only 9 for 3x3)
];

export const MIDDLE_EAST_BOARD = {
  0: { name: 'Take Off', subtitle: 'Collect $400', type: 'start' },
  1: { name: 'Gaza City', type: 'property', colorGroup: 'brown', price: 60 },
  2: { name: 'Community Aid', type: 'community' },
  3: { name: 'Bethlehem', type: 'property', colorGroup: 'brown', price: 60 },
  4: { name: 'Border Fees', type: 'tax' },
  5: { name: 'Levant Rail', type: 'railroad', icon: '🚆' },
  6: { name: 'Muscat', type: 'property', colorGroup: 'light_blue', price: 100 },
  7: { name: 'Opportunity', type: 'chance' },
  8: { name: 'Doha', type: 'property', colorGroup: 'light_blue', price: 100 },
  9: { name: 'Amman', type: 'property', colorGroup: 'light_blue', price: 120 },
  10: { name: 'Customs Check', subtitle: 'Just Visiting', type: 'jail' },
  11: { name: 'Kuwait City', type: 'property', colorGroup: 'pink', price: 140 },
  12: { name: 'Desert Solar Grid', type: 'utility', icon: '⚡' },
  13: { name: 'Riyadh', type: 'property', colorGroup: 'pink', price: 140 },
  14: { name: 'Jeddah', type: 'property', colorGroup: 'pink', price: 160 },
  15: { name: 'Gulf Air Link', type: 'railroad', icon: '✈️' },
  16: { name: 'Abu Dhabi', type: 'property', colorGroup: 'orange', price: 180 },
  17: { name: 'Humanitarian Fund', type: 'community' },
  18: { name: 'Dubai', type: 'property', colorGroup: 'orange', price: 180 },
  19: { name: 'Sharjah', type: 'property', colorGroup: 'orange', price: 200 },
  20: { name: 'Oasis Retreat', subtitle: 'Free Rest', type: 'parking' },
  21: { name: 'Cairo', type: 'property', colorGroup: 'red', price: 220 },
  22: { name: 'Opportunity', type: 'chance' },
  23: { name: 'Alexandria', type: 'property', colorGroup: 'red', price: 220 },
  24: { name: 'Luxor', type: 'property', colorGroup: 'red', price: 240 },
  25: { name: 'Nile River Ferry', type: 'railroad', icon: '⛴️' },
  26: { name: 'Jerusalem', type: 'property', colorGroup: 'yellow', price: 260 },
  27: { name: 'Haifa', type: 'property', colorGroup: 'yellow', price: 260 },
  28: { name: 'Suez Canal Authority', type: 'utility', icon: '⚙️' },
  29: { name: 'Ramallah', type: 'property', colorGroup: 'yellow', price: 280 },
  30: { name: 'Detained', subtitle: 'Go to Customs', type: 'go_to_jail' },
  31: { name: 'Istanbul', type: 'property', colorGroup: 'green', price: 300 },
  32: { name: 'Ankara', type: 'property', colorGroup: 'green', price: 300 },
  33: { name: 'Relief Mission', type: 'community' },
  34: { name: 'Izmir', type: 'property', colorGroup: 'green', price: 320 },
  35: { name: 'Atlantic Air Hub', type: 'railroad', icon: '🛫' },
  36: { name: 'Opportunity', type: 'chance' },
  37: { name: 'New York', type: 'property', colorGroup: 'blue', price: 350 },
  38: { name: 'Global Solidarity Tax', type: 'tax' },
  39: { name: 'Washington D.C.', type: 'property', colorGroup: 'blue', price: 400 }
};

