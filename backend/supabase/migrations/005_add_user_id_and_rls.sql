-- Add user_id column
ALTER TABLE discs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Wipe existing data (approved by user)
DELETE FROM discs;

-- Enable RLS
ALTER TABLE discs ENABLE ROW LEVEL SECURITY;

-- Policies: users can only access their own discs
CREATE POLICY "Users can view own discs" ON discs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own discs" ON discs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own discs" ON discs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own discs" ON discs
  FOR DELETE USING (auth.uid() = user_id);
