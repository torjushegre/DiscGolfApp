-- Add sort_order for drag & drop reordering
ALTER TABLE discs ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Initialize sort_order from id so existing discs have a stable order
UPDATE discs SET sort_order = id WHERE sort_order = 0;
