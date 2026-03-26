# Authentication Implementation Plan

## Overview
Add user authentication so each person gets their own disc collection. Use Supabase Auth with Google OAuth.

## Decisions
- **Open for all** — anyone can sign up
- **Google login only** (initially)
- **Existing discs can be wiped** — no migration of current data needed

## Steps

### 1. Google Cloud Console Setup
- Create a project at console.cloud.google.com
- Configure OAuth consent screen (External, app name, etc.)
- Create OAuth 2.0 credentials (Web application)
- Add authorized redirect URI: `https://<supabase-project-ref>.supabase.co/auth/v1/callback`
- Copy Client ID and Client Secret

### 2. Supabase Dashboard
- Go to Authentication > Providers > Google
- Enable Google provider, paste Client ID and Client Secret
- Enable RLS on the `discs` table (and `courses` if used)

### 3. Database Migration
```sql
-- Add user_id to discs
ALTER TABLE discs ADD COLUMN user_id UUID REFERENCES auth.users(id);

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

-- Wipe existing data (approved by user)
DELETE FROM discs;
```

### 4. Storage Policies
Update `disc-photos` bucket to restrict access per user:
- Upload policy: user can only upload to their own folder (`{user_id}/filename`)
- Read policy: public read is fine (photos aren't sensitive), or restrict to owner
- Update `uploadDiscPhoto` in `services/discs.ts` to use `{user_id}/{discId}-{timestamp}.{ext}` path

### 5. Frontend: Auth Context
Create `src/contexts/AuthContext.tsx`:
- Wrap app in `<AuthProvider>`
- Use `supabase.auth.onAuthStateChange()` to track session
- Expose `user`, `signIn`, `signOut` via context
- `signIn` calls `supabase.auth.signInWithOAuth({ provider: 'google' })`

### 6. Frontend: Login Page
Create `src/components/LoginPage.tsx`:
- Simple page with app title and "Sign in with Google" button
- Shown when user is not authenticated

### 7. Frontend: Route Protection
In `App.tsx`:
- If no user session, render `<LoginPage />`
- If authenticated, render normal routes
- Add sign-out button to `Navbar.tsx`

### 8. Frontend: Pass user_id on Disc Creation
In `services/discs.ts`:
- `createDisc` should include `user_id` from the current session
- Supabase client automatically includes the auth token, so RLS handles the rest
- No need to filter by user_id in queries — RLS does it

### 9. Supabase Client Update
In `src/lib/supabase.ts`:
- The existing `createClient` call should already handle auth tokens automatically
- Verify `persistSession: true` is set (default) so sessions survive page refresh

## Notes
- `@supabase/auth-ui-react` is optional — a single button calling `signInWithOAuth` is simpler
- Free tier supports 50k monthly active users
- Google OAuth consent screen starts in "Testing" mode (100 user limit) — submit for verification when ready for production
