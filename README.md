# Disclosure

A professional, data-driven UFO sighting explorer PWA. Visualises 65,000+ reported UFO/UAP sightings from the NUFORC database on an interactive map with advanced filtering, analytics, and discovery features.

## Tech Stack

- **Framework:** Next.js 15 (App Router, TypeScript)
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **Map:** Leaflet + React-Leaflet + OpenStreetMap (CartoDB dark tiles)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Font:** Space Grotesk (Google Fonts)
- **Hosting:** Vercel

## Features

- Interactive map with clustered markers (Supercluster)
- Slide-up sighting detail panel
- Filter by shape, state, and date range
- Full-text search with pagination
- "On This Day" daily digest
- Dashboard with 5 analytics charts
- Random sighting discovery
- Near Me geolocation
- Heatmap toggle
- Light/dark theme
- PWA (installable)

## Getting Started

```bash
npm install
npm run dev
```

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Data Import

Place the NUFORC CSV in `data/nuforc_sightings.csv` and run:

```bash
npx tsx scripts/import-data.ts
```
