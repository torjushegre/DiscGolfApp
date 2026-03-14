# Disc Golf Collection App

A serverless disc golf collection manager built with React, Supabase, and deployed on Vercel.

## Project Structure

```
DiscGolfPrototype/
├── backend/              # Supabase config
│   └── supabase/
│       └── migrations/
│           └── 001_initial_schema.sql
├── frontend/             # Vite React app
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...config files
├── .env.example          # Root env template
├── .gitignore
└── README.md
```

## Quick Start

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor
3. Run the migration in `backend/supabase/migrations/001_initial_schema.sql`
4. Go to Storage → Create bucket named `disc-photos`
5. Set bucket to public and allow uploads

### 2. Local Development

```bash
# Install dependencies
cd frontend && npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run dev server from root
npm run dev
```

App runs on `http://localhost:5173`.

### 3. Deploy to Vercel

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set root directory to `frontend` in Vercel settings
4. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## Features

- Add discs with photos (stored in Supabase Storage)
- Move discs between Bag, Shelf, and Wall of Fame
- Record aces (hole-in-ones) on courses
- View disc collection by status
- Ace celebration with confetti

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS (in `frontend/`)
- **Backend**: Supabase (PostgreSQL + Storage) (config in `backend/`)
- **Hosting**: Vercel

## Notes

- No authentication - database is publicly writable (acceptable for demo)
- Photos stored in Supabase Storage (not base64)
- Single click deployment from Git to Vercel
- Set Vercel root directory to `frontend/` when deploying
