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

END $$;

