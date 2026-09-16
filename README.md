# WEN — Farm to Market

Connects farmers directly to buyers — fresh produce, fair pricing, faster delivery.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Supabase (Postgres + Auth)

## Setup

1. Copy `.env.example` to `.env.local` and fill in your Supabase project credentials.
2. Run the migrations in `supabase/migrations/` against your Supabase project, in order (via the SQL editor or `supabase db push`).
3. Create an admin user in Supabase Auth (Authentication → Users → Add user) — this is who can log into `/admin`.
4. Set the Monnify env vars below so checkout works.
5. `npm install`
6. `npm run dev`

### Payments (Monnify)

Set these in `.env.local` for dev and in your hosting provider's env vars for
deploys:

- `MONNIFY_API_KEY` / `MONNIFY_SECRET_KEY` — from the Monnify dashboard (Developers → API Keys & Contracts).
- `MONNIFY_CONTRACT_CODE` — same page; required on every transaction call.
- `MONNIFY_BASE_URL` — `https://sandbox.monnify.com` for testing, `https://api.monnify.com` in production.
- `NEXT_PUBLIC_SITE_URL` — used to build the redirect URL Monnify sends buyers back to.

In the Monnify dashboard, point the webhook URL at
`{site}/api/payment/monnify-webhook`. Recurring subscription charges use
Monnify's card tokenization, which Monnify support has to enable per
contract code before it will return a real, reusable card token — ask them
to turn it on if `/api/cron/subscriptions` keeps landing on
`missing_card_token`.

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
