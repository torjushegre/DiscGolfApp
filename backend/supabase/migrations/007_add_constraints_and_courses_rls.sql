-- Add length constraints to prevent DoS via huge text fields
ALTER TABLE discs ADD CONSTRAINT discs_brand_length CHECK (length(brand) <= 200);
ALTER TABLE discs ADD CONSTRAINT discs_model_length CHECK (length(model) <= 200);
ALTER TABLE discs ADD CONSTRAINT discs_comment_length CHECK (length(comment) <= 500);
ALTER TABLE discs ADD CONSTRAINT discs_ace_course_length CHECK (length(ace_course) <= 200);
ALTER TABLE discs ADD CONSTRAINT discs_color_length CHECK (length(color) <= 20);

-- Add range constraints on numeric fields
ALTER TABLE discs ADD CONSTRAINT discs_speed_range CHECK (speed >= 0 AND speed <= 15);
ALTER TABLE discs ADD CONSTRAINT discs_glide_range CHECK (glide >= 0 AND glide <= 7);
ALTER TABLE discs ADD CONSTRAINT discs_turn_range CHECK (turn >= -5 AND turn <= 5);
ALTER TABLE discs ADD CONSTRAINT discs_fade_range CHECK (fade >= 0 AND fade <= 5);
ALTER TABLE discs ADD CONSTRAINT discs_ace_rank_range CHECK (ace_rank IS NULL OR (ace_rank >= 1 AND ace_rank <= 3));
ALTER TABLE discs ADD CONSTRAINT discs_zone_range CHECK (zone >= 0 AND zone <= 20);

-- Prevent user_id from being set to NULL on existing rows
ALTER TABLE discs ALTER COLUMN user_id SET NOT NULL;

-- Enable RLS on courses table (read-only for authenticated users)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read courses" ON courses
  FOR SELECT USING (auth.uid() IS NOT NULL);
