-- Migration: Add is_ace, color, split driver types, remove wall_of_fame status

-- 1. Add new columns
ALTER TABLE discs ADD COLUMN IF NOT EXISTS is_ace BOOLEAN DEFAULT false;
ALTER TABLE discs ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#e74c3c';

-- 2. Drop old constraints FIRST so data updates don't fail
ALTER TABLE discs DROP CONSTRAINT IF EXISTS discs_disc_type_check;
ALTER TABLE discs DROP CONSTRAINT IF EXISTS discs_status_check;

-- 3. Migrate wall_of_fame discs: mark as ace, move to shelf
UPDATE discs SET is_ace = true WHERE status = 'wall_of_fame';
UPDATE discs SET status = 'shelf' WHERE status = 'wall_of_fame';

-- 4. Migrate driver types based on speed
UPDATE discs SET disc_type = 'fairway_driver' WHERE disc_type = 'driver' AND speed <= 8;
UPDATE discs SET disc_type = 'distance_driver' WHERE disc_type = 'driver' AND speed > 8;
-- Catch any remaining drivers (e.g. speed is null)
UPDATE discs SET disc_type = 'distance_driver' WHERE disc_type = 'driver';

-- 5. Add new constraints
ALTER TABLE discs ADD CONSTRAINT discs_disc_type_check
  CHECK (disc_type IN ('distance_driver', 'fairway_driver', 'midrange', 'approach', 'putter'));

ALTER TABLE discs ADD CONSTRAINT discs_status_check
  CHECK (status IN ('bag', 'shelf'));
