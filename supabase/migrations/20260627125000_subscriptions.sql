-- The `subscriptions` table (and orders.subscription_id) were created
-- directly against the live database and never captured in a migration —
-- confirmed missing by grepping every src/ call against these tables.
-- Columns below are the exact set the app code actually uses:
--   src/app/api/subscriptions/route.ts (insert)
--   src/app/api/payment/monnify-initialize/route.ts (select/update)
--   src/app/api/payment/monnify-webhook/route.ts (select/update)
--   src/app/api/cron/subscriptions/route.ts (select/update)
--
-- Dated to run right after initial_schema (which creates buyers/products/
-- orders, all referenced here) and before 20260916000000_monnify_payment_
-- columns.sql, which renames paystack_email -> monnify_email etc. on this
-- table and must find it already present.

create table if not exists public.subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  buyer_id                 uuid not null references public.buyers(id) on delete cascade,
  product_id               uuid not null references public.products(id) on delete restrict,
  quantity                 integer not null check (quantity > 0),
  frequency_days           integer not null check (frequency_days > 0),
  status                   text not null default 'pending_first_payment'
                             check (status in (
                               'pending_first_payment', 'active', 'payment_issue', 'cancelled'
                             )),
  monnify_email            text not null,
  monnify_card_token       text,
  setup_payment_reference  text,
  next_delivery_date       date,
  last_order_id            uuid references public.orders(id) on delete set null,
  created_at               timestamptz not null default now()
);

create index if not exists subscriptions_buyer_id_idx on public.subscriptions (buyer_id);
create index if not exists subscriptions_status_idx on public.subscriptions (status);
create index if not exists subscriptions_next_delivery_idx on public.subscriptions (next_delivery_date)
  where status = 'active';

alter table public.subscriptions enable row level security;

-- Same MVP posture as the rest of the app (see initial_schema.sql): the
-- browser never talks to this table directly, only the service-role admin
-- client does, so there's no anonymous policy — just an authenticated-admin
-- read for the dashboard.
create policy "Admins can manage subscriptions" on public.subscriptions
  for all using (public.is_admin());

-- orders.subscription_id links a cron-generated recurring charge back to
-- the subscription it belongs to (src/app/api/cron/subscriptions/route.ts).
alter table public.orders
  add column if not exists subscription_id uuid references public.subscriptions(id) on delete set null;

create index if not exists orders_subscription_id_idx on public.orders (subscription_id);
