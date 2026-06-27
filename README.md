# WEN — Farm to Market

Connects farmers directly to buyers — fresh produce, fair pricing, faster delivery.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Supabase (Postgres + Auth)

## Setup

1. Copy `.env.example` to `.env.local` and fill in your Supabase project credentials.
2. Run the migration in `supabase/migrations/20260627_initial_schema.sql` against your Supabase project (via the SQL editor or `supabase db push`).
3. Create an admin user in Supabase Auth (Authentication → Users → Add user) — this is who can log into `/admin`.
4. `npm install`
5. `npm run dev`

## Structure

- `/` — Home, About, Products, Farmers, Buyers, Contact — all public
- `/admin/*` — gated behind Supabase Auth (middleware redirects to `/admin/login` if not signed in)
  - `/admin/farmers` — view + verify/reject farmer applications
  - `/admin/buyers` — view + verify/reject buyer applications
  - `/admin/orders` — view all orders, update status, see buyer↔farmer match
  - `/admin/reports` — totals, verification counts, top requested produce

## Notes

- Public forms (farmer/buyer registration, contact, orders) write through `/api/*` routes using the Supabase **service role** key server-side — the browser never talks to these tables directly, so no anonymous RLS policies are needed for inserts.
- Admin pages read/write directly via the browser Supabase client, gated by Supabase Auth + RLS policies that require `auth.role() = 'authenticated'`.
