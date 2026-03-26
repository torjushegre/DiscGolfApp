-- Add zone (sub-location within bag/shelf) and ace_rank (podium placement)
ALTER TABLE discs ADD COLUMN IF NOT EXISTS zone INTEGER DEFAULT 0;
ALTER TABLE discs ADD COLUMN IF NOT EXISTS ace_rank INTEGER;
