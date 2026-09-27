# CiviCalc Production Starter

A production-oriented Vite + Supabase foundation for CiviCalc.

## Run locally
1. Install Node.js 20+.
2. `npm install`
3. Copy `.env.example` to `.env` and add Supabase values.
4. `npm run dev`

## Database
Create a Supabase project and run `supabase/schema.sql` in the SQL editor.

## Deploy
Deploy the repository to Vercel, Netlify, Cloudflare Pages, or another static hosting service. Set the two VITE_SUPABASE environment variables.

## Next engineering modules
Add RCC, excavation, plaster, flooring, painting, drainage, pavers, culverts, retaining walls and drawing quantity extraction. Keep all arithmetic in versioned calculation functions and expose assumptions/rate sources to users.
