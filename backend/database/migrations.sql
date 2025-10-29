-- Comprehensive migration to add all missing columns to players table
-- This ensures compatibility with Monopoly game schema

DO $$
BEGIN
    -- Add money column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'players' AND column_name = 'money'
    ) THEN
        ALTER TABLE players ADD COLUMN money DECIMAL(15, 2) DEFAULT 1500.00;
        RAISE NOTICE 'Added money column';
    END IF;

    -- Add color column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'players' AND column_name = 'color'
    ) THEN
        ALTER TABLE players ADD COLUMN color VARCHAR(50);
        RAISE NOTICE 'Added color column';
    END IF;

    -- Add position column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'players' AND column_name = 'position'
    ) THEN
        ALTER TABLE players ADD COLUMN position INTEGER DEFAULT 0;
        RAISE NOTICE 'Added position column';
    END IF;

    -- Add is_in_jail column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'players' AND column_name = 'is_in_jail'
    ) THEN
        ALTER TABLE players ADD COLUMN is_in_jail BOOLEAN DEFAULT false;
        RAISE NOTICE 'Added is_in_jail column';
    END IF;

    -- Add jail_turns column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'players' AND column_name = 'jail_turns'
    ) THEN
        ALTER TABLE players ADD COLUMN jail_turns INTEGER DEFAULT 0;
        RAISE NOTICE 'Added jail_turns column';
    END IF;

    -- Add can_roll column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'players' AND column_name = 'can_roll'
    ) THEN
        ALTER TABLE players ADD COLUMN can_roll BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added can_roll column';
    END IF;

    -- Add status column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'players' AND column_name = 'status'
    ) THEN
        ALTER TABLE players ADD COLUMN status VARCHAR(50) DEFAULT 'active';
        RAISE NOTICE 'Added status column';
    END IF;

    -- Add created_at column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'players' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE players ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added created_at column';
    END IF;

    -- Add updated_at column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'players' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE players ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added updated_at column';
    END IF;

    -- Add capital column (for Capital Clash compatibility)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'players' AND column_name = 'capital'
    ) THEN
        ALTER TABLE players ADD COLUMN capital DECIMAL(15, 2) DEFAULT 1000000.00;
        RAISE NOTICE 'Added capital column';
    END IF;

    -- Add company_name column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'players' AND column_name = 'company_name'
    ) THEN
        ALTER TABLE players ADD COLUMN company_name VARCHAR(255);
        RAISE NOTICE 'Added company_name column';
    END IF;

    -- Add reputation column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'players' AND column_name = 'reputation'
    ) THEN
        ALTER TABLE players ADD COLUMN reputation INTEGER DEFAULT 50;
        RAISE NOTICE 'Added reputation column';
    END IF;

    -- Add is_human column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'players' AND column_name = 'is_human'
    ) THEN
        ALTER TABLE players ADD COLUMN is_human BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added is_human column';
    END IF;

    -- Add ai_personality column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'players' AND column_name = 'ai_personality'
    ) THEN
        ALTER TABLE players ADD COLUMN ai_personality VARCHAR(50);
        RAISE NOTICE 'Added ai_personality column';
    END IF;

END $$;

-- Migrate games table
DO $$
BEGIN
    -- Add current_player_turn column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'games' AND column_name = 'current_player_turn'
    ) THEN
        ALTER TABLE games ADD COLUMN current_player_turn INTEGER DEFAULT 1;
        RAISE NOTICE 'Added current_player_turn to games';
    END IF;

    -- Add game settings columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'games' AND column_name = 'double_rent_on_full_set'
    ) THEN
        ALTER TABLE games ADD COLUMN double_rent_on_full_set BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added double_rent_on_full_set to games';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'games' AND column_name = 'vacation_cash'
    ) THEN
        ALTER TABLE games ADD COLUMN vacation_cash BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added vacation_cash to games';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'games' AND column_name = 'auction_enabled'
    ) THEN
        ALTER TABLE games ADD COLUMN auction_enabled BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added auction_enabled to games';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'games' AND column_name = 'no_rent_in_prison'
    ) THEN
        ALTER TABLE games ADD COLUMN no_rent_in_prison BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added no_rent_in_prison to games';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'games' AND column_name = 'mortgage_enabled'
    ) THEN
        ALTER TABLE games ADD COLUMN mortgage_enabled BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added mortgage_enabled to games';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'games' AND column_name = 'even_build'
    ) THEN
        ALTER TABLE games ADD COLUMN even_build BOOLEAN DEFAULT true;
        RAISE NOTICE 'Added even_build to games';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'games' AND column_name = 'starting_cash'
    ) THEN
        ALTER TABLE games ADD COLUMN starting_cash DECIMAL(15, 2) DEFAULT 1500.00;
        RAISE NOTICE 'Added starting_cash to games';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'games' AND column_name = 'bank_pool'
    ) THEN
        ALTER TABLE games ADD COLUMN bank_pool DECIMAL(15, 2) DEFAULT 0;
        RAISE NOTICE 'Added bank_pool to games';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'games' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE games ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added created_at to games';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'games' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE games ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        RAISE NOTICE 'Added updated_at to games';
    END IF;

    -- Add max_players column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'games' AND column_name = 'max_players'
    ) THEN
        ALTER TABLE games ADD COLUMN max_players INTEGER DEFAULT 6;
        RAISE NOTICE 'Added max_players to games';
    END IF;

END $$;

-- Create property_auctions table
CREATE TABLE IF NOT EXISTS property_auctions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    current_bid DECIMAL(15, 2) NOT NULL DEFAULT 0,
    highest_bidder_id UUID REFERENCES players(id) ON DELETE SET NULL,
    time_remaining INTEGER NOT NULL DEFAULT 30,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_auctions_game_id ON property_auctions(game_id);
CREATE INDEX IF NOT EXISTS idx_auctions_property_id ON property_auctions(property_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON property_auctions(status);

