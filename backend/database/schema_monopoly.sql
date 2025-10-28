-- Monopoly Game Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Games Table
CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'waiting', -- waiting, active, finished
    current_player_turn INTEGER DEFAULT 1,
    -- Game settings
    double_rent_on_full_set BOOLEAN DEFAULT true,
    vacation_cash BOOLEAN DEFAULT true,
    auction_enabled BOOLEAN DEFAULT true,
    no_rent_in_prison BOOLEAN DEFAULT true,
    mortgage_enabled BOOLEAN DEFAULT true,
    even_build BOOLEAN DEFAULT true,
    starting_cash DECIMAL(15, 2) DEFAULT 1500.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Players Table
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(50), -- red, blue, green, yellow, etc.
    money DECIMAL(15, 2) DEFAULT 1500.00,
    position INTEGER DEFAULT 0, -- Position on the board (0-39 for 40 spaces)
    order_in_game INTEGER,
    status VARCHAR(50) DEFAULT 'active', -- active, bankrupt, eliminated
    is_in_jail BOOLEAN DEFAULT false,
    jail_turns INTEGER DEFAULT 0,
    can_roll BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_id, order_in_game)
);

-- Properties Table (Monopoly properties)
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color_group VARCHAR(50), -- brown, light_blue, pink, orange, red, yellow, green, blue, railroad, utility
    price DECIMAL(15, 2) NOT NULL,
    rent DECIMAL(15, 2) NOT NULL,
    rent_with_set DECIMAL(15, 2) NOT NULL, -- Rent when player owns the whole color group
    house_rent_1 DECIMAL(15, 2) DEFAULT 0, -- Rent with 1 house
    house_rent_2 DECIMAL(15, 2) DEFAULT 0, -- Rent with 2 houses
    house_rent_3 DECIMAL(15, 2) DEFAULT 0, -- Rent with 3 houses
    house_rent_4 DECIMAL(15, 2) DEFAULT 0, -- Rent with 4 houses
    hotel_rent DECIMAL(15, 2) DEFAULT 0, -- Rent with hotel
    house_cost DECIMAL(15, 2) DEFAULT 0,
    hotel_cost DECIMAL(15, 2) DEFAULT 0,
    position INTEGER NOT NULL, -- Position on board (0-39)
    owner_id UUID REFERENCES players(id) ON DELETE SET NULL,
    houses INTEGER DEFAULT 0,
    hotels INTEGER DEFAULT 0,
    is_mortgaged BOOLEAN DEFAULT false,
    property_type VARCHAR(50) DEFAULT 'property', -- property, railroad, utility, special
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Player Actions Table
CREATE TABLE IF NOT EXISTS player_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- roll_dice, buy_property, rent_paid, etc.
    details JSONB,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trade Offers Table
CREATE TABLE IF NOT EXISTS trade_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    from_player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    to_player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    properties_offered UUID[], -- Array of property IDs being offered
    properties_requested UUID[], -- Array of property IDs being requested
    money_offered DECIMAL(15, 2) DEFAULT 0,
    money_requested DECIMAL(15, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected, cancelled
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_players_game_id ON players(game_id);
CREATE INDEX IF NOT EXISTS idx_properties_game_id ON properties(game_id);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_player_actions_game_id ON player_actions(game_id);
CREATE INDEX IF NOT EXISTS idx_player_actions_player_id ON player_actions(player_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_game_id ON chat_messages(game_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_player_id ON chat_messages(player_id);
CREATE INDEX IF NOT EXISTS idx_trade_offers_game_id ON trade_offers(game_id);
CREATE INDEX IF NOT EXISTS idx_trade_offers_from_player ON trade_offers(from_player_id);
CREATE INDEX IF NOT EXISTS idx_trade_offers_to_player ON trade_offers(to_player_id);

