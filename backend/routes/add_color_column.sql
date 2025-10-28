-- Add color column to players table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='players' AND column_name='color'
    ) THEN
        ALTER TABLE players ADD COLUMN color VARCHAR(50);
    END IF;
END $$;

