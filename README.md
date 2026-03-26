# DiscVault

**Your disc golf collection, organized.**

A visual disc golf collection manager where you organize your discs in a virtual room — drag them between your bag, shelf, and Wall of Fame. Built with React, Supabase, and deployed on Vercel.

**[Live Demo](https://disc-golf-app-psi.vercel.app/)**

<!-- Add a screenshot: ![DiscVault Screenshot](docs/screenshot.png) -->

---

## Features

- **The Room** — A visual space with a realistic disc golf bag, shelf, and Wall of Fame
- **Drag & Drop** — Reorder discs, move them between bag zones (lid/main), shelf sections, and the Wall of Fame podium
- **Bag with Zones** — Two compartments (lid pocket and main), modeled after a real disc golf bag
- **Dynamic Shelf** — Auto-expanding shelf sections with visual shelf boards and brackets
- **Wall of Fame** — Podium with gold/silver/bronze slots for your top 3 aces, plus a general area for the rest
- **Disc Photos** — Upload photos or use color-coded SVG disc graphics
- **5 Disc Types** — Distance Driver, Fairway Driver, Midrange, Approach, Putter with flight numbers
- **Ace Tracking** — Mark any disc as an ace with course and hole info — it stays in your bag AND appears on the Wall of Fame
- **All Discs View** — Browse your full collection grouped by type, with filters
- **Confetti** — Because aces deserve celebration
- **Garage Vibes** — Immersive dark theme with a garage-style background

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite |
| **Styling** | Tailwind CSS 4 |
| **Drag & Drop** | @dnd-kit (core + sortable) |
| **Animations** | Framer Motion |
| **Backend** | Supabase (PostgreSQL + Storage) |
| **Hosting** | Vercel |

## Architecture

```
┌─────────────┐     ┌──────────────────────┐
│   Vercel     │     │      Supabase        │
│   (CDN)      │     │                      │
│              │     │  ┌────────────────┐  │
│  React SPA ──┼────▶│  │  PostgreSQL    │  │
│              │     │  │  (discs table) │  │
│              │     │  └────────────────┘  │
│              │     │  ┌────────────────┐  │
│              │────▶│  │  Storage       │  │
│              │     │  │  (disc photos) │  │
│              │     │  └────────────────┘  │
└─────────────┘     └──────────────────────┘
```

Fully serverless — no backend server to manage. The frontend talks directly to Supabase via its client SDK. Deployments are automatic on push to `main`.

## Getting Started

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run all migrations in `backend/supabase/migrations/` (in order) via the SQL Editor
3. Create a Storage bucket named `disc-photos` (set to public)

### 2. Local Development

```bash
cd frontend && npm install

# Configure environment
cp ../.env.example .env.local
# Edit .env.local with your Supabase URL and anon key

npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 3. Deploy

Push to `main` — Vercel deploys automatically. Set these environment variables in the Vercel dashboard:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

## Project Structure

```
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # Room, BagZone, ShelfZone, WallOfFameZone, etc.
│   │   ├── services/        # Supabase API layer (discs.ts)
│   │   └── lib/             # Supabase client setup
│   └── public/              # Static assets
├── backend/
│   └── supabase/migrations/ # SQL schema migrations (001–004)
├── docs/                    # Design references and assets
└── AUTH_PLAN.md             # Authentication implementation plan
```

## Roadmap

- [ ] **User Authentication** — Google OAuth via Supabase Auth (see [AUTH_PLAN.md](AUTH_PLAN.md))
- [ ] **Disc Info API** — Auto-fill disc specs from an external database
- [ ] **Mobile Optimization** — Touch-friendly drag & drop for phones
- [ ] **Social Features** — Share your collection, compare bags with friends
- [ ] **Statistics Dashboard** — Disc usage tracking, favorite brands/types

## License

[MIT](LICENSE)
