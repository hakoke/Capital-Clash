// Monopoly Board Layout - Middle Eastern Edition
export const MONOPOLY_PROPERTIES = [
  // Position 0: Go
  { position: 0, name: 'GO', property_type: 'special', color_group: 'special' },
  
  // Brown Properties (Egypt)
  { position: 1, name: 'Cairo', color_group: 'brown', price: 60, rent: 2, rent_with_set: 4, house_rent_1: 10, house_rent_2: 30, house_rent_3: 90, house_rent_4: 160, hotel_rent: 250, house_cost: 50 },
  { position: 3, name: 'Alexandria', color_group: 'brown', price: 60, rent: 4, rent_with_set: 8, house_rent_1: 20, house_rent_2: 60, house_rent_3: 180, house_rent_4: 320, hotel_rent: 450, house_cost: 50 },
  
  // Light Blue Properties (Israel)
  { position: 6, name: 'Tel Aviv', color_group: 'light_blue', price: 100, rent: 6, rent_with_set: 12, house_rent_1: 30, house_rent_2: 90, house_rent_3: 270, house_rent_4: 400, hotel_rent: 550, house_cost: 50 },
  { position: 8, name: 'Haifa', color_group: 'light_blue', price: 100, rent: 6, rent_with_set: 12, house_rent_1: 30, house_rent_2: 90, house_rent_3: 270, house_rent_4: 400, hotel_rent: 550, house_cost: 50 },
  { position: 9, name: 'Jerusalem', color_group: 'light_blue', price: 120, rent: 8, rent_with_set: 16, house_rent_1: 40, house_rent_2: 100, house_rent_3: 300, house_rent_4: 450, hotel_rent: 600, house_cost: 50 },
  
  // Pink Properties (Palestine)
  { position: 11, name: 'Gaza', color_group: 'pink', price: 140, rent: 10, rent_with_set: 20, house_rent_1: 50, house_rent_2: 150, house_rent_3: 450, house_rent_4: 625, hotel_rent: 750, house_cost: 100 },
  { position: 13, name: 'Nablus', color_group: 'pink', price: 140, rent: 10, rent_with_set: 20, house_rent_1: 50, house_rent_2: 150, house_rent_3: 450, house_rent_4: 625, hotel_rent: 750, house_cost: 100 },
  { position: 14, name: 'Ramallah', color_group: 'pink', price: 160, rent: 12, rent_with_set: 24, house_rent_1: 60, house_rent_2: 180, house_rent_3: 500, house_rent_4: 700, hotel_rent: 900, house_cost: 100 },
  
  // Orange Properties (Jordan)
  { position: 16, name: 'Amman', color_group: 'orange', price: 180, rent: 14, rent_with_set: 28, house_rent_1: 70, house_rent_2: 200, house_rent_3: 550, house_rent_4: 750, hotel_rent: 950, house_cost: 100 },
  { position: 18, name: 'Petra', color_group: 'orange', price: 180, rent: 14, rent_with_set: 28, house_rent_1: 70, house_rent_2: 200, house_rent_3: 550, house_rent_4: 750, hotel_rent: 950, house_cost: 100 },
  { position: 19, name: 'Aqaba', color_group: 'orange', price: 200, rent: 16, rent_with_set: 32, house_rent_1: 80, house_rent_2: 220, house_rent_3: 600, house_rent_4: 800, hotel_rent: 1000, house_cost: 100 },
  
  // Red Properties (Saudi Arabia)
  { position: 21, name: 'Riyadh', color_group: 'red', price: 220, rent: 18, rent_with_set: 36, house_rent_1: 90, house_rent_2: 250, house_rent_3: 700, house_rent_4: 875, hotel_rent: 1050, house_cost: 150 },
  { position: 23, name: 'Jeddah', color_group: 'red', price: 220, rent: 18, rent_with_set: 36, house_rent_1: 90, house_rent_2: 250, house_rent_3: 700, house_rent_4: 875, hotel_rent: 1050, house_cost: 150 },
  { position: 24, name: 'Mecca', color_group: 'red', price: 240, rent: 20, rent_with_set: 40, house_rent_1: 100, house_rent_2: 300, house_rent_3: 750, house_rent_4: 925, hotel_rent: 1100, house_cost: 150 },
  
  // Yellow Properties (UAE)
  { position: 26, name: 'Dubai', color_group: 'yellow', price: 260, rent: 22, rent_with_set: 44, house_rent_1: 110, house_rent_2: 330, house_rent_3: 800, house_rent_4: 975, hotel_rent: 1150, house_cost: 150 },
  { position: 27, name: 'Abu Dhabi', color_group: 'yellow', price: 260, rent: 22, rent_with_set: 44, house_rent_1: 110, house_rent_2: 330, house_rent_3: 800, house_rent_4: 975, hotel_rent: 1150, house_cost: 150 },
  { position: 29, name: 'Sharjah', color_group: 'yellow', price: 280, rent: 24, rent_with_set: 48, house_rent_1: 120, house_rent_2: 360, house_rent_3: 850, house_rent_4: 1025, hotel_rent: 1200, house_cost: 150 },
  
  // Green Properties (US - Some American cities mixed in)
  { position: 31, name: 'New York', color_group: 'green', price: 300, rent: 26, rent_with_set: 52, house_rent_1: 130, house_rent_2: 390, house_rent_3: 900, house_rent_4: 1100, hotel_rent: 1275, house_cost: 200 },
  { position: 32, name: 'Los Angeles', color_group: 'green', price: 300, rent: 26, rent_with_set: 52, house_rent_1: 130, house_rent_2: 390, house_rent_3: 900, house_rent_4: 1100, hotel_rent: 1275, house_cost: 200 },
  { position: 34, name: 'San Francisco', color_group: 'green', price: 320, rent: 28, rent_with_set: 56, house_rent_1: 150, house_rent_2: 450, house_rent_3: 1000, house_rent_4: 1200, hotel_rent: 1400, house_cost: 200 },
  
  // Dark Blue Properties (Qatar & Kuwait)
  { position: 37, name: 'Doha', color_group: 'blue', price: 350, rent: 35, rent_with_set: 70, house_rent_1: 175, house_rent_2: 500, house_rent_3: 1100, house_rent_4: 1300, hotel_rent: 1500, house_cost: 200 },
  { position: 39, name: 'Kuwait City', color_group: 'blue', price: 400, rent: 50, rent_with_set: 100, house_rent_1: 200, house_rent_2: 600, house_rent_3: 1400, house_rent_4: 1700, hotel_rent: 2000, house_cost: 200 },
  
  // Airports (replacing railroads)
  { position: 5, name: 'DXB Airport', color_group: 'railroad', price: 200, rent: 25, property_type: 'railroad' },
  { position: 15, name: 'CAI Airport', color_group: 'railroad', price: 200, rent: 25, property_type: 'railroad' },
  { position: 25, name: 'TLV Airport', color_group: 'railroad', price: 200, rent: 25, property_type: 'railroad' },
  { position: 35, name: 'JFK Airport', color_group: 'railroad', price: 200, rent: 25, property_type: 'railroad' },
  
  // Utilities
  { position: 12, name: 'Electric Company', color_group: 'utility', price: 150, rent: 0, property_type: 'utility' },
  { position: 28, name: 'Gas Company', color_group: 'utility', price: 150, rent: 0, property_type: 'utility' },
  
  // Special spaces
  { position: 2, name: 'Treasure', property_type: 'community_chest' },
  { position: 4, name: 'Income Tax', property_type: 'tax' },
  { position: 7, name: 'Surprise', property_type: 'chance' },
  { position: 10, name: 'In Prison', property_type: 'jail' },
  { position: 17, name: 'Treasure', property_type: 'community_chest' },
  { position: 20, name: 'Vacation', property_type: 'free_parking' },
  { position: 22, name: 'Surprise', property_type: 'chance' },
  { position: 30, name: 'Go to prison', property_type: 'go_to_jail' },
  { position: 33, name: 'Treasure', property_type: 'community_chest' },
  { position: 36, name: 'Surprise', property_type: 'chance' },
  { position: 38, name: 'Luxury Tax', property_type: 'tax' },
];

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

// Available player colors
export const PLAYER_COLORS = [
  { name: 'red', hex: '#DC143C' },
  { name: 'blue', hex: '#4169E1' },
  { name: 'green', hex: '#228B22' },
  { name: 'yellow', hex: '#FFD700' },
  { name: 'purple', hex: '#9B30FF' },
  { name: 'orange', hex: '#FF8C00' }
];

