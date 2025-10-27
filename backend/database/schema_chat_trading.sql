-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'chat', -- chat, trade_request, action_announcement
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trade Offers Table
CREATE TABLE IF NOT EXISTS trade_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    from_player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    to_player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    offer_type VARCHAR(50) NOT NULL, -- tile_trade, capital_trade, company_trade, action_trade
    offer_details JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected, cancelled
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_game_id ON chat_messages(game_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_player_id ON chat_messages(player_id);
CREATE INDEX IF NOT EXISTS idx_trade_offers_game_id ON trade_offers(game_id);
CREATE INDEX IF NOT EXISTS idx_trade_offers_from_player ON trade_offers(from_player_id);
CREATE INDEX IF NOT EXISTS idx_trade_offers_to_player ON trade_offers(to_player_id);

