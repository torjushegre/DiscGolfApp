-- Drop the old "Allow all" policy that bypasses all user-specific RLS
DROP POLICY IF EXISTS "Allow all" ON discs;

-- Fix UPDATE policy: add WITH CHECK to prevent user_id tampering
DROP POLICY IF EXISTS "Users can update own discs" ON discs;
CREATE POLICY "Users can update own discs" ON discs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
