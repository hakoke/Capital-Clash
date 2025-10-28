-- Migration to add money column to players table
-- This ensures compatibility with Monopoly game schema

-- Check if money column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'players' 
        AND column_name = 'money'
    ) THEN
        ALTER TABLE players ADD COLUMN money DECIMAL(15, 2) DEFAULT 1500.00;
        RAISE NOTICE 'Added money column to players table';
    ELSE
        RAISE NOTICE 'money column already exists in players table';
    END IF;
END $$;

